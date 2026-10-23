import {useEffect,useRef,useState} from 'react';
export const inject=['slots'];
const endpoint=name=>'api/ai-exporter.'+name;
const preferenceKey='dsh-ai-exporter.last-directory.v1';
function lastDirectory(){try{const value=localStorage.getItem(preferenceKey);if(value&&value.length<8192&&/^[A-Za-z]:[\\/]/.test(value))return value;}catch{}return ''; }
async function api(name,options){const response=await fetch(endpoint(name),options);const data=await response.json();if(!response.ok)throw Error(data.error??`HTTP ${response.status}`);return data;}
export function ExportPanel({sessionId}) {
  const [open,setOpen]=useState(false),[t,setT]=useState(null),[error,setError]=useState(''),[status,setStatus]=useState(''),[formats,setFormats]=useState(['txt','md','pdf']),[range,setRange]=useState(''),[output,setOutput]=useState(lastDirectory),[times,setTimes]=useState(true),[models,setModels]=useState(false),[partial,setPartial]=useState(false),[busy,setBusy]=useState(false),[history,setHistory]=useState([]),[selected,setSelected]=useState(sessionId);
  const job=useRef(null),mounted=useRef(true),abort=useRef(null);
  const [jobReady,setJobReady]=useState(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;abort.current?.abort();if(job.current)void api('job?id='+job.current,{method:'DELETE'}).catch(()=>{});};},[]);
  useEffect(()=>{setSelected(sessionId);setT(null);setRange('');setError('');},[sessionId]);
  useEffect(()=>{if(!open||busy||!t?.diagnostics.some(d=>d.code==='open-turn'||d.code==='pending-user-input'))return;const timer=setTimeout(()=>void load(),1000);return()=>clearTimeout(timer);},[open,busy,t,selected]);
  async function load(id=selected){abort.current?.abort();const a=new AbortController();abort.current=a;setError('');setStatus('读取完整会话…');try{const transcript=await api('snapshot?'+new URLSearchParams({sessionId:id}),{signal:a.signal});if(!a.signal.aborted){setT(transcript);setStatus(`已读取 ${transcript.messages.length} 条正文，${transcript.stats.rounds} 轮；撤回 ${transcript.stats.rewoundMessages} 条`);}}catch(e){if(!a.signal.aborted)setError(e.message);}}
  async function start(){setError('');setBusy(true);setJobReady(false);const a=new AbortController();abort.current=a;
    try{setStatus(formats.length===1?'请在 Windows 另存为窗口确认文件名和位置…':'请在 Windows 文件夹窗口选择导出位置…');
      const destination=await api('destination',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:selected,formats,initialDirectory:output}),signal:a.signal});
      if(destination.cancelled){setStatus((destination.initialDirectoryUnavailable?'最近目录不可用，请重新选择。\n':'')+'已取消选择，未创建导出任务');return;}
      setOutput(destination.directory);try{localStorage.setItem(preferenceKey,destination.directory);}catch{}
      const {id}=await api('start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:selected,grant:destination.grant,formats,range,timestamps:times,models,allowPartial:partial}),signal:a.signal});job.current=id;if(mounted.current)setJobReady(true);
      while(mounted.current&&!a.signal.aborted){const j=await api('job?id='+id,{signal:a.signal});setStatus(j.progress);if(j.status==='done'){setStatus(`已保存 ${j.result.files.length} 个文件：\n${j.result.files.join('\n')}\n诊断：${j.result.reportFile}`+(j.result.cleanupWarnings?.length?'\n清理提示：'+j.result.cleanupWarnings.join('\n'):''));break;}if(j.status==='error'||j.status==='cancelled')throw Error((j.status==='cancelled'?'已取消':j.error)+(j.completedFiles?.length?'\n已完成：'+j.completedFiles.join('\n'):'')+(j.cleanupWarnings?.length?'\n清理提示：'+j.cleanupWarnings.join('\n'):''));await new Promise(resolve=>setTimeout(resolve,400));}
    }catch(e){if(mounted.current)setError(a.signal.aborted?'已取消':e.message);}finally{job.current=null;if(mounted.current){setBusy(false);setJobReady(false);}}
  }
  async function cancel(){if(!job.current)return;setStatus('正在取消…');try{await api('job?id='+job.current,{method:'DELETE'});}catch(e){setError(e.message);}}
  return <div style={{position:'relative'}}><button type="button" disabled={!sessionId} onClick={()=>{setOpen(!open);if(!open)void load();}}>导出对话</button>{open&&<section aria-label="DSH AI Exporter" style={{position:'fixed',right:24,top:70,zIndex:1000,width:'min(540px, calc(100vw - 48px))',maxHeight:'80vh',overflow:'auto',padding:22,border:'1px solid #718095',borderRadius:12,background:'var(--dsw-alias-bg-layer-1, white)',color:'var(--dsw-alias-label-primary, #1c283b)',boxShadow:'0 14px 48px #0004'}}>
    <h2>DSH AI Exporter</h2><p>导出可恢复的聊天正文；排除隐藏推理、工具记录与内部上下文。</p>
    <p><label>会话 <select aria-label="导出会话" disabled={busy} value={selected} onChange={e=>{setSelected(e.target.value);setRange('');void load(e.target.value);}}><option value={sessionId}>当前打开的会话</option>{history.filter(h=>h.id!==sessionId).map(h=><option key={h.id} value={h.id}>{new Date(h.createdAt).toLocaleString()} · {h.id.slice(-12)}</option>)}</select></label> <button disabled={busy} onClick={()=>void api('sessions').then(setHistory).catch(e=>setError(e.message))}>加载历史会话</button></p>
    <p><button disabled={busy} onClick={()=>void load()}>重新读取会话</button></p>
    <p><label>轮次（留空为全部） <input disabled={busy} aria-label="轮次" placeholder="例如 1-3,5" value={range} onChange={e=>setRange(e.target.value)}/></label></p>
    <p>{['txt','md','pdf'].map(f=><label key={f} style={{marginRight:16}}><input type="checkbox" disabled={busy} checked={formats.includes(f)} onChange={e=>setFormats(e.target.checked?[...formats,f]:formats.filter(v=>v!==f))}/>{f.toUpperCase()}</label>)}</p>
    <p><label><input type="checkbox" disabled={busy} checked={times} onChange={e=>setTimes(e.target.checked)}/>时间戳</label> <label><input type="checkbox" disabled={busy} checked={models} onChange={e=>setModels(e.target.checked)}/>模型名称</label></p>
    <p>最近保存目录：<output aria-label="最近保存目录" style={{display:'block',overflowWrap:'anywhere'}}>{output}</output>使用原生窗口修改位置；可选择工作区外的本地文件夹。同名自动编号，不覆盖；同目录另附诊断 JSON。</p>
    {t&&!t.complete&&<p role="alert">有 {t.stats.unsupported} 项未支持内容，请检查诊断。<label><input type="checkbox" checked={partial} onChange={e=>setPartial(e.target.checked)}/>我已了解，允许部分导出</label></p>}
    {t&&t.diagnostics.length>0&&<details><summary>诊断（{t.diagnostics.length}）</summary><pre style={{whiteSpace:'pre-wrap'}}>{t.diagnostics.map(d=>`@${d.seq} ${d.code}: ${d.detail}`).join('\n')}</pre></details>}
    <p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}} role="status">{status}</p>{error&&<p role="alert" style={{whiteSpace:'pre-wrap',color:'#c33'}}>{error}</p>}
    <p><button disabled={busy||!t||!formats.length||(!t.complete&&!partial)} onClick={()=>void start()}>{formats.length===1?'另存为并导出':'选择文件夹并导出'}</button> <button disabled={!busy||!jobReady} onClick={()=>void cancel()}>取消导出</button> <button disabled={busy} onClick={()=>setOpen(false)}>关闭</button></p>
  </section>}</div>;
}
export function apply(ctx) {ctx.slots.inject('conversation.session.header.utilities',()=>ctx.slots.register({name:'conversation.session.header.utilities',id:'dsh-ai-exporter',order:900},ExportPanel));}
