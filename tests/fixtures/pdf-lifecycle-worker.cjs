const fs=require('node:fs/promises');let timer;
process.on('message',message=>{if(message.cancel){clearTimeout(timer);process.send({error:'cancelled'});process.disconnect();return;}
 timer=setTimeout(async()=>{try{await fs.writeFile(message.result,'LIFECYCLE_TEST_ONLY');if(message.options.fixtureMode==='error')throw Error('simulated renderer failure');process.send({ok:true});}catch(e){process.send({error:e.message});}finally{process.disconnect();}},message.options.fixtureMode==='slow'?500:20);
});
