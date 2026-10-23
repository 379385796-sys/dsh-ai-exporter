import {writeFile} from 'node:fs/promises';
import {renderPdf} from './pdf.js';
const abort=new AbortController();let running=false;
process.on('message',async message=>{if(message.cancel){abort.abort();return;}if(running)return;running=true;
  try{const bytes=await renderPdf(message.transcript,{...message.options,signal:abort.signal});await writeFile(message.result,bytes,{flag:'wx'});process.send({ok:true});}
  catch(e){process.send({error:e.message});}finally{process.disconnect();}
});
