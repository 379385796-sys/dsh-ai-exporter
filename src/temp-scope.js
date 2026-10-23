import {mkdir,mkdtemp,rm,rmdir} from 'node:fs/promises';import {join,resolve,dirname} from 'node:path';
const roots=new Map();
/** Per-process reference counting; never remove a pre-existing root, only our leaf. */
export async function acquireTemp(base,onWarning=()=>{}) {
  base=resolve(base);let state=roots.get(base);
  if(!state){state={refs:0,ready:(async()=>{await mkdir(dirname(base),{recursive:true});try{await mkdir(base);return true;}catch(error){if(error.code==='EEXIST')return false;throw error;}})()};roots.set(base,state);}
  state.refs++;
  let leaf;try{await state.ready;leaf=await mkdtemp(join(base,'export-job-'));}catch(error){if(!--state.refs)roots.delete(base);throw error;}
  let released=false;
  return {path:leaf,async release(){if(released)return;released=true;
    try{await rm(leaf,{recursive:true,force:true,maxRetries:5,retryDelay:100});}catch(error){onWarning(`临时文件清理失败：${leaf} (${error.code??error.message})`);}
    if(!--state.refs){roots.delete(base);if(await state.ready){try{await rmdir(base);}catch(error){if(error.code!=='ENOENT')onWarning(`临时根目录保留：${base} (${error.code??error.message})`);}}}
  }};
}
