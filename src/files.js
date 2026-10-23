import {open,mkdir,realpath,unlink,stat,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {dateText} from './renderers.js';
import {sanitizeFilename} from './vendor/filename.js';
export function safeStem(title,at=Date.now(),zone='Australia/Sydney') {
  let name=sanitizeFilename(title).replace(/\u007f/g,'_').replace(/[. ]+$/,'').trim();
  if(!name)name='会话';if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))name='_'+name;
  name=Array.from(name).slice(0,65).join('');return name+'_'+dateText(at,zone).replace(/[-:]/g,'').replace(' ','-');
}
export async function existingDirectory(directory){
  if(typeof directory!=='string'||!directory.trim()||/[\u0000-\u001f]/.test(directory))throw Error('保存目录无效或末尾含误输入标点，请重新选择');
  try{const root=await realpath(directory);if(!(await stat(root)).isDirectory())throw Error('不是文件夹');await access(root,2);return root;}catch(e){throw Error('保存目录不存在、不可写或不是文件夹，请重新选择（'+(e.code??e.message)+'）');}
}
/** Atomic exclusive creation prevents overwrites, races and symlink substitution. */
export async function saveExclusive(directory,stem,ext,data,signal) {
  if(!/^[a-z]+$/.test(ext)||/[\\/]/.test(stem)||stem==='..')throw Error('无效文件名');
  const root=await existingDirectory(directory);
  for(let n=0;n<10000;n++) {
    signal?.throwIfAborted();const file=join(root,stem+(n?` (${n})`:'')+'.'+ext);
    if(file.length>240)throw Error('保存路径过长，请选择较短的文件夹');
    let handle;try{handle=await open(file,'wx');}catch(e){if(e.code==='EEXIST')continue;throw e;}
    try{await handle.writeFile(data);signal?.throwIfAborted();await handle.close();return resolve(file);}catch(e){await handle.close().catch(()=>{});await unlink(file).catch(cleanup=>{if(cleanup.code!=='ENOENT')e.cleanupWarnings=[...(e.cleanupWarnings??[]),`未完成文件清理失败：${file} (${cleanup.code??cleanup.message})`];});throw e;}
  }
  throw Error('同名文件过多');
}
