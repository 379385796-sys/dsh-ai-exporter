import {useEffect,useRef,useState,useId} from 'react';
import {EXPORT_STYLES} from './export-styles.js';
import {zh,en,defaultText} from './copy.js';
export const inject=['slots','locale'];
const endpoint=name=>'api/ai-exporter.'+name,preferenceKey='dsh-ai-exporter.last-directory.v1';
const formatKey=values=>[...values].sort().join(',');
function lastDirectory(){try{const value=localStorage.getItem(preferenceKey);if(value&&value.length<8192&&/^[A-Za-z]:[\\/]/.test(value))return value;}catch{}return '';}
async function api(name,options){const response=await fetch(endpoint(name),options);const data=await response.json();if(!response.ok)throw Error(data.error??`HTTP ${response.status}`);return data;}
export function ExportPanel({sessionId,t:tr=defaultText}) {
  const [open,setOpen]=useState(false),[snapshot,setSnapshot]=useState(null),[error,setError]=useState(''),[status,setStatus]=useState('');
  const [formats,setFormats]=useState(['txt','md','pdf']),[range,setRange]=useState(''),[output,setOutput]=useState(lastDirectory);
  const [times,setTimes]=useState(true),[models,setModels]=useState(false),[partialKey,setPartialKey]=useState(null);
  const [busy,setBusy]=useState(false),[reading,setReading]=useState(false),[history,setHistory]=useState([]),[selected,setSelected]=useState(sessionId),[jobReady,setJobReady]=useState(false);
  const job=useRef(null),mounted=useRef(true),read=useRef({generation:0,abort:null}),operation=useRef(null),poll=useRef(null),historyRead=useRef(null),grant=useRef(null),trigger=useRef(null),panel=useRef(null),busyRef=useRef(false),scope=useRef({sessionId,selected,open}),titleId=useId(),pathId=useId(),rangeId=useId();
  scope.current={sessionId,selected,open};busyRef.current=busy;
  const current=snapshot?.id===selected&&snapshot.ownerSession===sessionId?snapshot:null;
  const partial=Boolean(current&&partialKey===current.snapshotKey);
  function invalidate(){read.current.abort?.abort();read.current={generation:read.current.generation+1,abort:null};}
  function clearPreview(){invalidate();setSnapshot(null);setPartialKey(null);setReading(false);grant.current=null;}
  function close(){if(busyRef.current)return;scope.current.open=false;clearPreview();historyRead.current?.abort();setOpen(false);}
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;invalidate();historyRead.current?.abort();operation.current?.abort();poll.current?.abort();};},[]);
  useEffect(()=>{clearPreview();setSelected(sessionId);setRange('');setError('');},[sessionId]);
  useEffect(()=>{if(!open||busy||!current?.diagnostics.some(d=>d.code==='open-turn'||d.code==='pending-user-input'))return;const timer=setTimeout(()=>void load(),1000);return()=>clearTimeout(timer);},[open,busy,current,selected]);
  useEffect(()=>{
    if(!open)return;panel.current?.focus();
    const keys=e=>{if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){
      const items=[...panel.current.querySelectorAll('button,input,select,summary,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length);
      const first=items[0],last=items.at(-1);if(!first)return;
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===panel.current)){e.preventDefault();first.focus();}
    }};
    const element=panel.current;element.addEventListener('keydown',keys);return()=>{element.removeEventListener('keydown',keys);trigger.current?.focus();};
  },[open]);
  function remember(directory){setOutput(directory);try{localStorage.setItem(preferenceKey,directory);}catch{}}
  function changeDirectory(value){setOutput(value);grant.current=null;setError('');}
  function changeFormats(value){setFormats(value);grant.current=null;}
  async function load(id=scope.current.selected){
    if(busyRef.current)return;
    invalidate();const a=new AbortController(),generation=read.current.generation,owner=scope.current.sessionId;read.current.abort=a;
    setSnapshot(null);setPartialKey(null);setReading(true);setError('');setStatus(tr('reading'));
    const valid=()=>mounted.current&&!a.signal.aborted&&generation===read.current.generation&&scope.current.sessionId===owner&&scope.current.selected===id&&scope.current.open;
    try{const value=await api('snapshot?'+new URLSearchParams({sessionId:id}),{signal:a.signal});if(valid()){if(value.id!==id||typeof value.snapshotKey!=='string')throw Error(tr('invalidSnapshot'));setSnapshot({...value,ownerSession:owner});setStatus(tr('read',{messages:value.messages.length,rounds:value.stats.rounds}));}}
    catch(e){if(valid())setError(e.message);}finally{if(valid())setReading(false);}
  }
  async function listHistory(){historyRead.current?.abort();const a=new AbortController();historyRead.current=a;try{const value=await api('sessions',{signal:a.signal});if(mounted.current&&!a.signal.aborted&&scope.current.open)setHistory(value);}catch(e){if(!a.signal.aborted&&mounted.current)setError(e.message);}}
  function select(id){scope.current.selected=id;clearPreview();setSelected(id);setRange('');void load(id);}
  function launch(){scope.current.open=true;setOpen(true);void load();}
  async function browse(){
    if(busyRef.current||!current||reading)return;busyRef.current=true;
    const a=new AbortController();operation.current=a;grant.current=null;setError('');setBusy(true);setStatus(tr('choose'));
    try{const d=await api('destination',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:selected,formats,initialDirectory:output,folderOnly:true}),signal:a.signal});
      if(!mounted.current)return;if(d.cancelled){setStatus(tr('chooseCancelled'));return;}
      remember(d.directory);grant.current={...d,sessionId:selected,formats:formatKey(formats),expires:Date.now()+240000};setStatus(tr(d.initialDirectoryUnavailable?'fallback':'chosen'));
    }catch(e){if(mounted.current&&!a.signal.aborted)setError(e.message);}finally{operation.current=null;busyRef.current=false;if(mounted.current)setBusy(false);}
  }
  async function start(saveAs=false){
    if(busyRef.current||reading||!current||!formats.length||(!current.complete&&!partial))return;
    const reviewed=current,owner=scope.current.sessionId,idSelected=selected;
    busyRef.current=true;setError('');setBusy(true);setJobReady(false);
    const a=new AbortController();operation.current=a;
    try{let destination=grant.current;
      if(saveAs||!destination||destination.sessionId!==selected||destination.formats!==formatKey(formats)||destination.directory!==output||destination.expires<Date.now()){
        grant.current=null;setStatus(tr(saveAs?'confirmAs':'confirm'));
        destination=await api('destination',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:selected,formats,initialDirectory:output,folderOnly:!saveAs,strictInitialDirectory:Boolean(output.trim())}),signal:a.signal});
      }
      a.signal.throwIfAborted();if(!mounted.current)return;
      if(destination.cancelled){setStatus(tr('chooseCancelled'));return;}
      if(scope.current.sessionId!==owner||scope.current.selected!==idSelected)throw Error(tr('snapshotChanged'));
      remember(destination.directory);grant.current=null;
      // Submission and the server task outlive the preview. Unmount only
      // stops polling; cancellation requires the explicit DELETE action.
      operation.current=null;
      const {id}=await api('start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:idSelected,reviewedSnapshot:reviewed.snapshotKey,grant:destination.grant,formats,range,timestamps:times,models,allowPartial:partial})});
      job.current=id;if(!mounted.current)return;setJobReady(true);
      const observer=new AbortController();poll.current=observer;
      while(mounted.current&&!observer.signal.aborted){const j=await api('job?id='+id,{signal:observer.signal});if(!mounted.current||observer.signal.aborted)break;
        setStatus(j.progress==='读取完整会话'?tr('stageRead'):String(j.progress??'').replace('正在生成',tr('stageGenerate')));
        if(j.status==='done'){setStatus(`${tr('saved',{count:j.result.files.length})}\n${j.result.files.join('\n')}\n${tr('report')}：${j.result.reportFile}`+(j.result.cleanupWarnings?.length?'\n'+tr('cleanup')+'：'+j.result.cleanupWarnings.join('\n'):''));break;}
        if(j.status==='error'||j.status==='cancelled')throw Error((j.status==='cancelled'?tr('cancelled'):j.error)+(j.completedFiles?.length?'\n'+tr('completed')+'：'+j.completedFiles.join('\n'):'')+(j.cleanupWarnings?.length?'\n'+tr('cleanup')+'：'+j.cleanupWarnings.join('\n'):''));
        await new Promise(resolve=>setTimeout(resolve,400));
      }
    }catch(e){if(mounted.current)setError(e.message);}finally{job.current=null;operation.current=null;poll.current=null;busyRef.current=false;if(mounted.current){setBusy(false);setJobReady(false);}}
  }
  async function cancel(){if(!job.current)return;setStatus(tr('cancelling'));try{await api('job?id='+job.current,{method:'DELETE'});}catch(e){if(mounted.current)setError(e.message);}}
  const disabled=busy||reading||!current||!formats.length||(!current.complete&&!partial);
  return <><style>{EXPORT_STYLES}</style><button ref={trigger} type="button" className="dse-trigger" disabled={!sessionId||busy} onClick={launch}><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5"/></svg><span>{tr('title')}</span></button>
    {open&&<div className="dse-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
      <section ref={panel} className="dse-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="dse-header"><div><h2 id={titleId}>{tr('title')} <span>AI Exporter</span></h2><p>{tr('scope')}</p></div><button type="button" className="dse-icon" aria-label={tr('closeLabel')} disabled={busy} onClick={close}>×</button></header>
        <div className="dse-body">
          <section className="dse-group" aria-labelledby={titleId+'-scope'}><h3 id={titleId+'-scope'}>{tr('session')}</h3>
            <div className="dse-session"><select aria-label={tr('selectSession')} disabled={busy} value={selected} onChange={e=>select(e.target.value)}><option value={sessionId}>{tr('current')}</option>{history.filter(h=>h.id!==sessionId).map(h=><option key={h.id} value={h.id}>{new Date(h.createdAt).toLocaleString()} · {h.id.slice(-12)}</option>)}</select><button type="button" disabled={busy} onClick={()=>void listHistory()}>{tr('history')}</button><button type="button" disabled={busy} onClick={()=>void load()}>{tr('reload')}</button></div>
            <label className="dse-field" htmlFor={rangeId}><span>{tr('range')} <small>{tr('all')}</small></span><input id={rangeId} disabled={busy} placeholder={tr('rangeExample')} value={range} onChange={e=>setRange(e.target.value)}/></label>
          </section>
          <section className="dse-group" aria-labelledby={titleId+'-options'}><h3 id={titleId+'-options'}>{tr('options')}</h3>
            <div className="dse-formats">{['txt','md','pdf'].map(f=><label key={f} className={'dse-format '+(formats.includes(f)?'is-selected':'')}><input type="checkbox" disabled={busy} checked={formats.includes(f)} onChange={e=>changeFormats(e.target.checked?[...formats,f]:formats.filter(v=>v!==f))}/><span>{f.toUpperCase()}</span><small>{tr(f)}</small></label>)}</div>
            <div className="dse-checks"><label><input type="checkbox" disabled={busy} checked={times} onChange={e=>setTimes(e.target.checked)}/>{tr('times')}</label><label><input type="checkbox" disabled={busy} checked={models} onChange={e=>setModels(e.target.checked)}/>{tr('models')}</label></div><p className="dse-note">{tr('coverage')}</p>
          </section>
          <section className="dse-group" aria-labelledby={titleId+'-destination'}><h3 id={titleId+'-destination'}>{tr('destination')}</h3>
            <label className="dse-sr" htmlFor={pathId}>{tr('path')}</label><div className="dse-location"><input id={pathId} aria-label={tr('path')} disabled={busy} value={output} title={output} placeholder={tr('pathHint')} spellCheck={false} autoComplete="off" onChange={e=>changeDirectory(e.target.value)}/><button type="button" disabled={busy||reading||!current} onClick={()=>void browse()}>{tr('browse')}</button></div>
            {output&&<details className="dse-path"><summary>{tr('localPath')}</summary><span>{output}</span></details>}<p className="dse-note">{tr('pathNote')}</p>
          </section>
          {current&&!current.complete&&<div className="dse-alert" role="alert"><strong>{tr('partialTitle')}</strong><p>{tr('partialHint')}</p><label><input type="checkbox" disabled={busy} checked={partial} onChange={e=>setPartialKey(e.target.checked?current.snapshotKey:null)}/>{tr('partial')}</label></div>}
          {current&&current.diagnostics.length>0&&<details className="dse-details"><summary>{tr('diagnostics')} <span>{current.diagnostics.length}</span></summary><pre>{current.diagnostics.map(d=>`@${d.seq} ${d.code}: ${d.detail}`).join('\n')}</pre></details>}
          {error&&<div className="dse-alert" role="alert"><strong>{error.split('\n')[0]}</strong>{error.includes('\n')&&<details><summary>{tr('errorDetails')}</summary><pre>{error}</pre></details>}</div>}
          <div className={'dse-status'+(error?' is-error':'')} role="status" aria-live="polite" aria-busy={reading||busy}>{status?.split('\n')[0]}</div>
          {status?.includes('\n')&&<details className="dse-details"><summary>{tr('files')}</summary><pre>{status}</pre></details>}
        </div>
        <footer className="dse-footer"><p>{tr('local')}</p><div className="dse-actions">{formats.length===1&&!busy&&<button type="button" disabled={disabled} onClick={()=>void start(true)}>{tr('saveAs')}</button>}{busy?<button type="button" disabled={!jobReady} onClick={()=>void cancel()}>{tr('cancel')}</button>:<button type="button" onClick={close}>{tr('close')}</button>}<button type="button" className="dse-primary" disabled={disabled} onClick={()=>void start()}>{tr(busy?'working':'export')}</button></div></footer>
      </section>
    </div>}
  </>;
}
export function apply(ctx){ctx.effect(()=>ctx.locale.register('ai-exporter',{zh,en}),'ai-exporter: locale');ctx.slots.inject('conversation.session.header.utilities',()=>ctx.slots.register({name:'conversation.session.header.utilities',id:'dsh-ai-exporter',locale:'ai-exporter',order:900},ExportPanel));}
