import {renderText,renderMarkdown} from './renderers.js';
import {selectRounds} from './core.js';
import {safeStem,saveExclusive,existingDirectory} from './files.js';
/** One normalized transcript shared by all renderers. PDF loaded only on demand. */
export async function exportTranscript(transcript,options) {
  if(!options.outputDir)throw Error('必须明确指定保存文件夹');
  const root=await existingDirectory(options.outputDir);
  const formats=[...new Set(options.formats??['txt','md','pdf'])];
  if(!formats.length||formats.some(f=>!['txt','md','pdf'].includes(f)))throw Error('不支持的导出格式');
  if(!transcript.complete&&!options.allowPartial)throw Error('存在未支持的内容或未结束回复；请查看诊断，明确允许部分导出后重试');
  const selected=selectRounds(transcript,options.range), at=options.exportedAt??Date.now(),cleanupWarnings=[],o={...options,outputDir:root,exportedAt:at,onCleanupWarning:warning=>{cleanupWarnings.push(warning);options.onCleanupWarning?.(warning);}};
  const stem=options.fileStem??safeStem(selected.title,at,o.timeZone),files=[];
  if(options.fileStem&&formats.length!==1)throw Error('自定义文件名只适用于单格式');
  try {
    for(const f of formats){o.signal?.throwIfAborted();o.onProgress?.(`正在生成 ${f.toUpperCase()}`);
      const data=f==='txt'?renderText(selected,o):f==='md'?renderMarkdown(selected,o):await (await import('./pdf-isolated.js')).renderPdfIsolated(selected,o);
      files.push(await saveExclusive(root,stem,f,data,o.signal));
    }
    const report={schemaVersion:1,exportedAt:new Date(at).toISOString(),sessionId:transcript.id,capturedThroughSeq:transcript.capturedThroughSeq,messages:selected.messages.length,sourceStats:transcript.stats,complete:transcript.complete,diagnostics:transcript.diagnostics,files,cleanupWarnings};
    const reportFile=await saveExclusive(root,stem+'.report','json',JSON.stringify(report,null,2),o.signal);
    return {...report,reportFile};
  }catch(error){error.completedFiles=files;error.cleanupWarnings=[...cleanupWarnings,...(error.cleanupWarnings??[])];throw error;}
}
