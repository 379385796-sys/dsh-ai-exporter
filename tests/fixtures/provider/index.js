// Local deterministic test model; excluded from release package.
import {dirname,join} from 'node:path';import {pathToFileURL} from 'node:url';
const {LlmAdapter}=await import(pathToFileURL(join(dirname(process.execPath),'resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-llm/lib/index.js')).href);
const model={provider:'exporter-lab',id:'exporter-fixture',name:'Exporter fixture (offline)',contextWindow:128000};
class Adapter extends LlmAdapter {
  async listModels(){return [model];} async resolveModel(){return model;}
  async *stream(){const hidden='EXPORTER_HIDDEN_REASONING_SECRET',text='# 本地导出验收\n\n你好，中文与 English 😀。\n\n```python\n  print("代码缩进保留")\n```\n\n| 名称 | 值 |\n|---|---|\n| 中文 | 完整 \\| 竖线 |\n\nEXPORTER_HOST_FIXTURE_COMPLETE';
    yield {type:'block-start',index:0,blockType:'reasoning'};yield {type:'reasoning-delta',index:0,text:hidden};yield {type:'block-end',index:0,block:{type:'reasoning',text:hidden}};
    yield {type:'block-start',index:1,blockType:'text'};yield {type:'text-delta',index:1,text};yield {type:'block-end',index:1,block:{type:'text',text}};yield {type:'usage',usage:{inputTokens:20,outputTokens:50}};yield {type:'finish',reason:{kind:'stop'}};
  }
}
export const inject=['llm'];export function apply(ctx){ctx.llm.registerAdapter(['exporter-lab'],new Adapter());
  // Isolated test plugin only: append actual V4 event schemas through Session,
  // with synthetic paths. Never copied into the exporter release package.
  ctx.on('session/event',(session,event)=>{if(event.type!=='turn/end')return;queueMicrotask(()=>{try{
    session.append('workspace/changes',{turn:event.data.turn});
    session.append('deliverables/presented',{turn:event.data.turn,callId:'rc3-fixture-'+event.data.turn,files:[{path:'D:/fixture-output/交付物.txt',description:'RC3_VISIBLE_DELIVERY_REFERENCE（仅引用，未嵌入）'}]});
  }catch(error){ctx.logger.error('Isolated fixture event append failed: '+error.message);}});});
}

