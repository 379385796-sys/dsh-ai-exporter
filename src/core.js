/** DSH 0.2.1-rc.2 / session V4 readable Chat projection, independent of DSH. */
import {eventNote,finalizeNotes} from './session-notes.js';
export const LIMITS = Object.freeze({bytes:64*1024*1024,line:8*1024*1024,events:250000});
const INTERNAL = new Set(['permission/preset','sandbox/mode','approval/policy','agent-preset/selected','agent/inbox/spliced','turn/start','turn/end','step/start','step/end','system/message','developer/message','request/header','request/context','session/title','session/title-llm-request','session-log-deepseek/delivery-accepted','tool/call','tool/result','command/run','command/done','session/end-seed','assistant/attempt','llm/retry','compaction/start','compaction/end','compaction/summary','tool/ptc-dispatch','session/metadata']);
// Non-body configuration/control records confirmed in the installed V4 catalog.
for(const type of ['model/selection','plan/mode','approval/asked','approval/decided','llm/retry-started','subagent/catalog','subagent/descriptor','subagent/model-selection-policy','hook/invoked','hook/result','goal/change','schedule/change','job/registered','job/settled'])INTERNAL.add(type);
export const lf = text => text.replace(/\r\n?/g,'\n');
export class TranscriptReplay {
  constructor(header, options={}) {
    if(!header || header.type!==undefined&&header.type!=='session') throw Error('缺少 session 文件头');
    if(header.version!==4 || typeof header.id!=='string'||!Number.isFinite(header.createdAt)) throw Error('仅支持完整的 DSH session V4；请保留原文件并更新适配器');
    this.header=header; this.options=options; this.messages=[];this.notes=[]; this.commands=new Map(); this.steps=new Map(); this.cuts=[]; this.turn=0; this.last=-1; this.title='未命名会话';
    this.stats={events:0,byType:{},filteredInternal:0,filteredBlocks:0,rewoundMessages:0,replayedMessages:0,unsupported:0}; this.diagnostics=[]; this.ids=new Map(); this.openTurn=false;this.inbox=new Map();this.rewindMarkers=new Set();
  }
  diagnostic(code,seq,detail,unsupported=false) {this.diagnostics.push({code,seq,detail});if(unsupported)this.stats.unsupported++;}
  content(blocks,seq) {
    if(!Array.isArray(blocks))throw Error(`事件 ${seq} 的正文不是内容块数组`);
    const parts=[];
    for(const b of blocks) {
      if(b?.type==='text' && typeof b.text==='string')parts.push(lf(b.text));
      else if(['reasoning','redacted-reasoning','tool-call','tool-result'].includes(b?.type))this.stats.filteredBlocks++;
      else if(['image','file','audio','video'].includes(b?.type)) {
        const a=b.attachment??{};
        parts.push(`\n[附件：${b.type}；${String(a.name??a.attachmentId??'未命名').replace(/[\r\n]/g,' ')}；未嵌入]\n`);
        this.diagnostic('attachment-reference',seq,'保留附件说明；不会读取附件路径或加载远程资源');
      } else {parts.push(`\n[不支持的内容块：${String(b?.type??'unknown').replace(/[\r\n<>]/g,'_')}]\n`);this.diagnostic('unsupported-block',seq,String(b?.type??'unknown'),true);}
    }
    return parts.join('');
  }
  add(event,role,body,source,id,key) {
    if(!body.trim()){if(role==='assistant' && key){const previous=this.steps.get(key);if(previous)previous.active=false;}return;}
    const identity=role+':'+id;
    if(id && this.ids.has(identity)) {
      const prior=this.ids.get(identity);
      if(prior.body!==body)throw Error(`事件 ${event.seq} 的消息 ID 冲突，拒绝静默覆盖`);
      this.stats.replayedMessages++; return;
    }
    const m={id:id??`event-${event.seq}`,role,body,time:event.time,turn:this.turn,model:role==='assistant'?source?.model:undefined,source:{seq:event.seq,type:event.type},active:true};
    if(role==='assistant' && key) {
      const previous=this.steps.get(key); if(previous)previous.active=false;
      this.steps.set(key,m);
    }
    this.messages.push(m);if(id)this.ids.set(identity,m);
  }
  push(e) {
    this.options.signal?.throwIfAborted();
    if(!e || !Number.isSafeInteger(e.seq)||e.seq!==this.last+1)throw Error(`事件序号不连续（期望 ${this.last+1}，收到 ${e?.seq}），不能保证历史完整`);
    if(typeof e.type!=='string'||!Number.isFinite(e.time)||!e.data||typeof e.data!=='object')throw Error(`事件 ${e.seq} 结构无效`);
    this.last=e.seq;if(++this.stats.events>LIMITS.events)throw Error('事件数量超过安全上限');
    this.stats.byType[e.type]=(this.stats.byType[e.type]??0)+1;
    const d=e.data;
    if(e.type==='turn/start') {this.turn=d.turn;this.openTurn=true;}
    if(e.type==='turn/end') this.openTurn=false;
    if(e.type==='agent/inbox/spliced'){
      const pending=this.inbox.get(d.target)??[];
      if(!Number.isSafeInteger(d.start)||d.start<0||d.start>pending.length||!Array.isArray(d.inserted))throw Error(`无效 Inbox 操作 @${e.seq}`);
      pending.splice(d.start,d.removedCount??0,...d.inserted);this.inbox.set(d.target,pending);
    }
    if(e.type==='llm/retry'){const previous=this.steps.get(`${d.turn??this.turn}:${d.step??0}`);if(previous)previous.active=false;}
    if(e.type==='session/title' && typeof d.title==='string')this.title=d.title;
    if(e.type==='command/run')this.commands.set(d.commandId,d);
    if(e.type==='command/done' && d.kind==='success') {
      const c=this.commands.get(d.commandId);
      // Matches dsh-rewind-plugin 0.17.0 hiddenSeqsOf(): successful real command,
      // inclusive @target -> sourceEventSeq; previews/candidates never cut history.
      if(c && ['rewind','rewind-plugin'].includes(c.name) && !/(preview|__candidates)/.test(c.args??'') && Number.isSafeInteger(d.sourceEventSeq)) {
        const target=(c.args??'').match(/@(\d+)/);
        if(target && +target[1]<=d.sourceEventSeq && d.sourceEventSeq<e.seq)this.cuts.push({start:+target[1],end:d.sourceEventSeq});
        else this.diagnostic('invalid-rewind',e.seq,'无法识别撤回目标',true);
      }
    }
    if(e.type==='user/message') {
      if(d.source?.kind==='user' && e.surfaceOp==='append')this.add(e,'user',this.content(d.content,e.seq),d.source,d.id);
      else {this.stats.filteredInternal++;if(d.source?.kind==='dsh-rewind'){this.rewindMarkers.add(e.seq);this.diagnostic('rewind-marker',e.seq,'内部撤回占位消息已排除');}}
    } else if(e.type==='assistant/message') {
      if(e.surfaceOp==='append')this.add(e,'assistant',this.content(d.message?.content,e.seq),d.message?.source,d.message?.id,`${d.turn??this.turn}:${d.step??0}`);
      else this.stats.filteredInternal++;
    } else if(['workspace/changes','deliverables/presented'].includes(e.type)) {
      try{this.notes.push(eventNote(e));this.diagnostic('visible-reference',e.seq,e.type==='workspace/changes'?'工作区变更仅保存引用，不包含文件差异快照':'保留交付物文件路径和说明，不读取文件内容');}
      catch(error){this.diagnostic('unsupported-event-data',e.seq,e.type+': '+error.message,true);}
    } else if(e.type==='assistant/live-chunk') {
      this.diagnostic('uncommitted-live-chunk',e.seq,'未提交的实时片段：请等待回复完成后导出',true);this.stats.filteredInternal++;
    } else {
      this.stats.filteredInternal++;
      if(!INTERNAL.has(e.type))this.diagnostic('unknown-event',e.seq,e.type,true);
    }
    if(e.surfaceOp && e.surfaceOp!=='append') {
      if(e.surfaceOp.op!=='replace'||!Number.isSafeInteger(e.surfaceOp.startSeq)||!Number.isSafeInteger(e.surfaceOp.endSeq))throw Error(`未知 surface 操作 @${e.seq}`);
      this.diagnostic('model-context-replacement',e.seq,'模型上下文替换不自动删除聊天历史；聊天撤回以命令结果为准');
      if(!['dsh-rewind','compact-checkpoint','runtime-context'].includes(d.source?.kind) && !['tool/result','system/message','developer/message'].includes(e.type))this.diagnostic('unknown-replacement',e.seq,'未知上下文替换来源，请核对界面',true);
    }
  }
  finish() {
    for(const seq of this.rewindMarkers)if(!this.cuts.some(c=>c.end===seq))this.diagnostic('unresolved-rewind',seq,'撤回标记没有匹配的成功命令，无法确认界面可见性',true);
    for(const pending of this.inbox.values())if(pending.some(m=>m.source?.kind==='user'))this.diagnostic('pending-user-input',this.last,'仍有排队的用户消息尚未提交正文，请等待后重新读取',true);
    const cuts=this.cuts.sort((a,b)=>a.start-b.start), merged=[];
    for(const c of cuts){const p=merged.at(-1);if(p&&c.start<=p.end)p.end=Math.max(p.end,c.end);else merged.push({...c});}
    let ci=0, round=0, prevTurn;
    const messages=[];
    for(const m of this.messages) {
      while(ci<merged.length&&merged[ci].end<m.source.seq)ci++;
      if(merged[ci]&&merged[ci].start<=m.source.seq){this.stats.rewoundMessages++;continue;}
      if(!m.active)continue;
      if(m.turn!==prevTurn || !round){round++;prevTurn=m.turn;}
      const {active,...clean}=m; messages.push({...clean,round,index:messages.length+1});
    }
    if(this.openTurn)this.diagnostic('open-turn',this.last,'最后一轮尚未结束；只含已提交正文',true);
    const annotations=finalizeNotes(this.notes,messages,seq=>merged.some(c=>c.start<=seq&&seq<=c.end));
    return {schemaVersion:1,id:this.header.id,title:this.title,createdAt:this.header.createdAt,capturedThroughSeq:this.last,messages,annotations,diagnostics:this.diagnostics,stats:{...this.stats,messages:messages.length,rounds:round},complete:this.stats.unsupported===0};
  }
}
export function replay(header,events,options={}) {const r=new TranscriptReplay(header,options);for(const e of events)r.push(e);return r.finish();}
export function selectRounds(transcript,range) {
  if(!range)return transcript;
  const wanted=new Set();
  for(const part of range.split(',')){const m=part.trim().match(/^(\d+)(?:-(\d+))?$/);if(!m)throw Error('轮次格式应为 1-3,5');const a=+m[1],b=+(m[2]??m[1]);if(a<1||b<a||b>transcript.stats.rounds)throw Error('选择的轮次超出会话范围');for(let i=a;i<=b;i++)wanted.add(i);}
  return {...transcript,messages:transcript.messages.filter(m=>wanted.has(m.round)),annotations:transcript.annotations?.filter(n=>wanted.has(n.round)),selection:range};
}
