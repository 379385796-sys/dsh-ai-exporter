import {useEffect,useRef,useState,useId} from 'react';
import {EXPORT_STYLES} from './export-styles.js';
export const inject=['slots'];
const endpoint=name=>'api/ai-exporter.'+name, preferenceKey='dsh-ai-exporter.last-directory.v1';
const formatKey=values=>[...values].sort().join(',');
function lastDirectory(){try{const value=localStorage.getItem(preferenceKey);if(value&&value.length<8192&&/^[A-Za-z]:[\\/]/.test(value))return value;}catch{}return '';}
async function api(name,options){const response=await fetch(endpoint(name),options);const data=await response.json();if(!response.ok)throw Error(data.error??`HTTP ${response.status}`);return data;}
export function ExportPanel({sessionId}) {
  const [open,setOpen]=useState(false),[t,setT]=useState(null),[error,setError]=useState(''),[status,setStatus]=useState('');
  const [formats,setFormats]=useState(['txt','md','pdf']),[range,setRange]=useState(''),[output,setOutput]=useState(lastDirectory);
  const [times,setTimes]=useState(true),[models,setModels]=useState(false),[partial,setPartial]=useState(false);
  const [busy,setBusy]=useState(false),[reading,setReading]=useState(false),[history,setHistory]=useState([]),[selected,setSelected]=useState(sessionId),[jobReady,setJobReady]=useState(false);
  const job=useRef(null),mounted=useRef(true),abort=useRef(null),grant=useRef(null),trigger=useRef(null),panel=useRef(null),busyRef=useRef(false),titleId=useId(),pathId=useId(),rangeId=useId();
  busyRef.current=busy;
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;abort.current?.abort();if(job.current)void api('job?id='+job.current,{method:'DELETE'}).catch(()=>{});};},[]);
  useEffect(()=>{setSelected(sessionId);setT(null);setRange('');setError('');grant.current=null;},[sessionId]);
  useEffect(()=>{if(!open||busy||!t?.diagnostics.some(d=>d.code==='open-turn'||d.code==='pending-user-input'))return;const timer=setTimeout(()=>void load(),1000);return()=>clearTimeout(timer);},[open,busy,t,selected]);
  useEffect(()=>{
    if(!open)return;panel.current?.focus();
    const keys=e=>{if(e.key==='Escape'){e.preventDefault();if(!busyRef.current)setOpen(false);}else if(e.key==='Tab'){
      const items=[...panel.current.querySelectorAll('button,input,select,summary,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length);
      const first=items[0],last=items.at(-1);if(!first)return;
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }};
    const element=panel.current;element.addEventListener('keydown',keys);return()=>{element.removeEventListener('keydown',keys);trigger.current?.focus();};
  },[open]);
  function remember(directory){setOutput(directory);try{localStorage.setItem(preferenceKey,directory);}catch{}}
  function changeDirectory(value){setOutput(value);grant.current=null;setError('');}
  function changeFormats(value){setFormats(value);grant.current=null;}
  async function load(id=selected){
    abort.current?.abort();const a=new AbortController();abort.current=a;setReading(true);setError('');setStatus('正在读取会话…');
    try{const transcript=await api('snapshot?'+new URLSearchParams({sessionId:id}),{signal:a.signal});if(!a.signal.aborted){setT(transcript);setStatus(`已读取 ${transcript.messages.length} 条正文 · ${transcript.stats.rounds} 轮`);}}
    catch(e){if(!a.signal.aborted)setError(e.message);}finally{if(mounted.current&&!a.signal.aborted)setReading(false);}
  }
  async function browse(){
    const a=new AbortController();abort.current=a;grant.current=null;setError('');setBusy(true);setStatus('请在 Windows 窗口选择保存文件夹…');
    try{const d=await api('destination',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:selected,formats,initialDirectory:output,folderOnly:true}),signal:a.signal});
      if(d.cancelled){setStatus('已取消选择，保存位置未改变，未创建导出任务');return;}
      remember(d.directory);grant.current={...d,sessionId:selected,formats:formatKey(formats),expires:Date.now()+240000};
      setStatus(d.initialDirectoryUnavailable?'原输入目录不可用，已采用你在 Windows 中重新选择的文件夹。':'保存文件夹已通过 Windows 确认。');
    }catch(e){setError(e.message);}finally{if(mounted.current)setBusy(false);}
  }
  async function start(saveAs=false){
    setError('');setBusy(true);setJobReady(false);const a=new AbortController();abort.current=a;
    try{let destination=grant.current;
      if(saveAs||!destination||destination.sessionId!==selected||destination.formats!==formatKey(formats)||destination.directory!==output||destination.expires<Date.now()){
        grant.current=null;setStatus(saveAs?'请在 Windows 另存为窗口确认文件名与位置…':'请在 Windows 窗口确认此保存位置…');
        destination=await api('destination',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:selected,formats,initialDirectory:output,folderOnly:!saveAs,strictInitialDirectory:Boolean(output.trim())}),signal:a.signal});
      }
      if(destination.cancelled){setStatus('已取消确认，未创建导出任务');return;}
      remember(destination.directory);grant.current=null;
      const {id}=await api('start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:selected,grant:destination.grant,formats,range,timestamps:times,models,allowPartial:partial}),signal:a.signal});job.current=id;if(mounted.current)setJobReady(true);
      while(mounted.current&&!a.signal.aborted){const j=await api('job?id='+id,{signal:a.signal});setStatus(j.progress);
        if(j.status==='done'){setStatus(`已保存 ${j.result.files.length} 个文件\n${j.result.files.join('\n')}\n诊断：${j.result.reportFile}`+(j.result.cleanupWarnings?.length?'\n清理提示：'+j.result.cleanupWarnings.join('\n'):''));break;}
        if(j.status==='error'||j.status==='cancelled')throw Error((j.status==='cancelled'?'已取消':j.error)+(j.completedFiles?.length?'\n已完成：'+j.completedFiles.join('\n'):'')+(j.cleanupWarnings?.length?'\n清理提示：'+j.cleanupWarnings.join('\n'):''));
        await new Promise(resolve=>setTimeout(resolve,400));
      }
    }catch(e){if(mounted.current)setError(a.signal.aborted?'已取消':e.message);}finally{job.current=null;if(mounted.current){setBusy(false);setJobReady(false);}}
  }
  async function cancel(){if(!job.current)return;setStatus('正在等待安全取消…');try{await api('job?id='+job.current,{method:'DELETE'});}catch(e){setError(e.message);}}
  const disabled=busy||reading||!t||!formats.length||(!t.complete&&!partial);
  return <><style>{EXPORT_STYLES}</style><button ref={trigger} type="button" className="dse-trigger" disabled={!sessionId} onClick={()=>{setOpen(true);void load();}}><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5"/></svg><span>导出对话</span></button>
    {open&&<div className="dse-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setOpen(false);}}>
      <section ref={panel} className="dse-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-label="DSH AI Exporter" tabIndex={-1}>
        <header className="dse-header"><div><h2 id={titleId}>导出对话 <span>AI Exporter</span></h2><p>保留可恢复正文，排除隐藏推理与内部上下文。</p></div><button type="button" className="dse-icon" aria-label="关闭导出" disabled={busy} onClick={()=>setOpen(false)}>×</button></header>
        <div className="dse-body">
          <section className="dse-group" aria-labelledby={titleId+'-scope'}><h3 id={titleId+'-scope'}>会话范围</h3>
            <div className="dse-session"><select aria-label="导出会话" disabled={busy} value={selected} onChange={e=>{setSelected(e.target.value);setRange('');grant.current=null;setT(null);void load(e.target.value);}}><option value={sessionId}>当前打开的会话</option>{history.filter(h=>h.id!==sessionId).map(h=><option key={h.id} value={h.id}>{new Date(h.createdAt).toLocaleString()} · {h.id.slice(-12)}</option>)}</select><button type="button" disabled={busy} onClick={()=>void api('sessions').then(setHistory).catch(e=>setError(e.message))}>历史会话</button><button type="button" disabled={busy||reading} onClick={()=>void load()}>重新读取</button></div>
            <label className="dse-field" htmlFor={rangeId}><span>导出轮次 <small>留空导出全部</small></span><input id={rangeId} disabled={busy} aria-label="轮次" placeholder="例如 1-3,5" value={range} onChange={e=>setRange(e.target.value)}/></label>
          </section>
          <section className="dse-group" aria-labelledby={titleId+'-options'}><h3 id={titleId+'-options'}>导出选项</h3>
            <div className="dse-formats">{['txt','md','pdf'].map(f=><label key={f} className={'dse-format '+(formats.includes(f)?'is-selected':'')}><input type="checkbox" disabled={busy} checked={formats.includes(f)} onChange={e=>changeFormats(e.target.checked?[...formats,f]:formats.filter(v=>v!==f))}/><span>{f.toUpperCase()}</span><small>{f==='txt'?'纯文本':f==='md'?'Markdown':'可搜索文档'}</small></label>)}</div>
            <div className="dse-checks"><label><input type="checkbox" disabled={busy} checked={times} onChange={e=>setTimes(e.target.checked)}/>包含时间戳</label><label><input type="checkbox" disabled={busy} checked={models} onChange={e=>setModels(e.target.checked)}/>包含模型名称</label></div>
          </section>
          <section className="dse-group" aria-labelledby={titleId+'-destination'}><h3 id={titleId+'-destination'}>保存位置</h3>
            <label className="dse-sr" htmlFor={pathId}>Windows 本地保存目录</label><div className="dse-location"><input id={pathId} aria-label="保存目录" disabled={busy} value={output} placeholder="输入或粘贴 Windows 本地目录" spellCheck={false} autoComplete="off" onChange={e=>changeDirectory(e.target.value)}/><button type="button" disabled={busy||reading||!t} onClick={()=>void browse()}>浏览…</button></div>
            <p className="dse-note">手输位置需经 Windows 确认；浏览选定后可直接导出。同名自动编号，不覆盖已有文件。</p>
          </section>
          {t&&!t.complete&&<div className="dse-alert" role="alert"><strong>此会话包含未完整支持的内容</strong><p>请先查看诊断，再决定是否允许部分导出。</p><label><input type="checkbox" disabled={busy} checked={partial} onChange={e=>setPartial(e.target.checked)}/>我已了解，允许部分导出</label></div>}
          {t&&t.diagnostics.length>0&&<details className="dse-details"><summary>详细诊断 <span>{t.diagnostics.length}</span></summary><pre>{t.diagnostics.map(d=>`@${d.seq} ${d.code}: ${d.detail}`).join('\n')}</pre></details>}
          {error&&<div className="dse-alert" role="alert"><strong>{error.split('\n')[0]}</strong>{error.includes('\n')&&<details><summary>查看错误与已完成文件</summary><pre>{error}</pre></details>}</div>}
          <div className="dse-status" role="status" aria-live="polite">{status?.split('\n')[0]}</div>
          {status?.includes('\n')&&<details className="dse-details"><summary>保存结果与文件明细</summary><pre>{status}</pre></details>}
        </div>
        <footer className="dse-footer"><p>仅在本地保存 · 同目录保留诊断报告</p><div className="dse-actions">{formats.length===1&&!busy&&<button type="button" disabled={disabled} onClick={()=>void start(true)}>另存为文件…</button>}{busy?<button type="button" disabled={!jobReady} onClick={()=>void cancel()}>取消导出</button>:<button type="button" onClick={()=>setOpen(false)}>关闭</button>}<button type="button" className="dse-primary" disabled={disabled} onClick={()=>void start()}>{busy?'处理中…':'导出'}</button></div></footer>
      </section>
    </div>}
  </>;
}
export function apply(ctx){ctx.slots.inject('conversation.session.header.utilities',()=>ctx.slots.register({name:'conversation.session.header.utilities',id:'dsh-ai-exporter',order:900},ExportPanel));}
