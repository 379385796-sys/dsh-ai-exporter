/** Only the two installed 0.2.1-rc.2 schemas, not an unknown-event allowlist. */
export function eventNote(event) {
  const d=event.data,keys=Object.keys(d);
  if(!Number.isSafeInteger(d.turn)||d.turn<1)throw Error('缺少有效 turn');
  const base={turn:d.turn,source:{seq:event.seq,type:event.type},time:event.time};
  if(event.type==='workspace/changes'){
    if(keys.some(k=>k!=='turn'))throw Error('workspace/changes 含未知字段');
    return {...base,kind:'workspace-changes',text:'工作区变更记录：日志仅保存轮次引用；文件清单和差异快照未嵌入，未尝试重建。'};
  }
  if(event.type!=='deliverables/presented'||typeof d.callId!=='string'||!d.callId||!Array.isArray(d.files)||!d.files.length||d.files.length>1000||keys.some(k=>!['turn','callId','files'].includes(k)))throw Error('无法识别交付物事件');
  const files=d.files.map(f=>{
    if(!f||typeof f.path!=='string'||!f.path.trim()||f.path.length>8192||f.description!==undefined&&typeof f.description!=='string'||Object.keys(f).some(k=>!['path','description'].includes(k)))throw Error('无法识别交付物文件引用');
    return {path:f.path,...f.description===undefined?{}:{description:f.description}};
  });
  return {...base,kind:'deliverables',callId:d.callId,files};
}
export function finalizeNotes(notes,messages,hidden) {
  const latestChanges=new Map(),filesByTurn=new Map();
  for(const note of notes){if(hidden(note.source.seq))continue;
    if(note.kind==='workspace-changes')latestChanges.set(note.turn,note);
    else {let files=filesByTurn.get(note.turn);if(!files)filesByTurn.set(note.turn,files=new Map());for(const file of note.files)files.set(file.path,{...note,files:[file]});}
  }
  const result=[...latestChanges.values(),...[...filesByTurn.values()].flatMap(m=>[...m.values()])].sort((a,b)=>a.source.seq-b.source.seq);
  return result.map(n=>{const message=messages.findLast(m=>m.turn===n.turn);return {...n,...message?{afterMessageId:message.id,round:message.round}:{}};});
}
export function noteText(note) {
  const clean=s=>s.replace(/[\r\n\u0000-\u001f]/g,' ');
  return note.kind==='workspace-changes'?note.text:'交付物引用（未嵌入文件）：\n'+note.files.map(f=>`• ${clean(f.path)}${f.description?' — '+clean(f.description):''}`).join('\n');
}
