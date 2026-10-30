import {win32,basename,dirname,extname} from 'node:path';import {existingDirectory,safeStem} from './files.js';
import {homedir} from 'node:os';
import {pickNativeDestination} from './native-dialog.js';
export function validateFormats(formats){if(!Array.isArray(formats)||!formats.length||formats.length>3||new Set(formats).size!==formats.length||formats.some(f=>!['txt','md','pdf'].includes(f)))throw Error('请选择有效导出格式');return [...formats].sort();}
export function assertLocalPath(path){if(typeof path!=='string'||!win32.isAbsolute(path)||!/^([A-Za-z]:[\\/])/.test(path)||/[<>"|?*\u0000-\u001f]|:/.test(path.slice(2)))throw Error('请选择有效的本地 Windows 路径');}
export function normalizeDirectoryInput(input){
  if(typeof input!=='string')throw Error('请输入本地 Windows 文件夹路径');
  let value=input.trim();if(value.startsWith('"')&&value.endsWith('"'))value=value.slice(1,-1);
  assertLocalPath(value);value=win32.normalize(value);
  if(value.length>240)throw Error('保存目录过长，请选择较短的路径');
  if(value.slice(3).split(/[\\/]/).filter(Boolean).some(part=>/[. ]$/.test(part)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)))throw Error('文件夹名称包含 Windows 不支持的保留名称或末尾空格、点');
  return value;
}
/** Only a real local chooser may mint a one-use server-held write destination. */
export class DestinationGrants {
  constructor({picker=pickNativeDestination,now=Date.now,validateDirectory=existingDirectory}={}){this.picker=picker;this.now=now;this.validateDirectory=validateDirectory;this.grants=new Map();this.picking=false;}
  async choose({sessionId,formats,title,initialDirectory,folderOnly=false,strictInitialDirectory=false},signal){
    if(typeof folderOnly!=='boolean'||typeof strictInitialDirectory!=='boolean')throw Error('无效的保存位置请求');
    const checked=validateFormats(formats);if(this.picking)throw Error('已有原生选择窗口，请先完成或取消');this.picking=true;
    try{
      let initial=homedir(),initialDirectoryUnavailable=false;
      if(initialDirectory){try{initial=await this.validateDirectory(normalizeDirectoryInput(initialDirectory));}catch(error){if(strictInitialDirectory)throw error;initialDirectoryUnavailable=true;}}
      const single=checked.length===1&&!folderOnly,extension=checked[0];
      const path=await this.picker({mode:single?'file':'folder',title:single?'DSH AI Exporter - 另存为（同名自动编号，不覆盖）':'DSH AI Exporter - 选择导出文件夹',initialDirectory:initial,fileName:single?safeStem(title,this.now())+'.'+extension:'',extension,filter:`${extension.toUpperCase()} (*.${extension})|*.${extension}`},signal);
      signal?.throwIfAborted();if(path===null)return {cancelled:true,...(initialDirectoryUnavailable?{initialDirectoryUnavailable:true}:{})};assertLocalPath(path);
      if(single&&win32.extname(path).toLowerCase()!=='.'+extension)throw Error('文件扩展名与所选格式不符，请重新另存为');
      const directory=await this.validateDirectory(single?win32.dirname(path):path),fileStem=single?win32.basename(path,win32.extname(path)):undefined;
      normalizeDirectoryInput(directory);
      const longest=win32.join(directory,(fileStem??safeStem(title,this.now()))+'.report.json');
      if(longest.length>240)throw Error('保存路径加文件名后过长，请选择较短的文件夹或文件名');
      if(fileStem&&(/[<>:"/\\|?*\u0000-\u001f]/.test(fileStem)||/[. ]$/.test(fileStem)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(fileStem)))throw Error('Windows 文件名无效，请重新选择');
      for(const [id,g] of this.grants)if(g.expires<this.now())this.grants.delete(id);
      if(this.grants.size>32)throw Error('待确认的保存位置过多，请稍后重试');
      const grant=globalThis.crypto.randomUUID();this.grants.set(grant,{sessionId,formats:checked,outputDir:directory,fileStem,expires:this.now()+300000});
      return {grant,directory,fileName:single?win32.basename(path):null,mode:single?'file':'folder',initialDirectoryUnavailable};
    }finally{this.picking=false;}
  }
  consume(id,sessionId,formats){const g=this.grants.get(id);if(!g||g.expires<this.now())throw Error('保存位置授权已失效，请重新选择');if(g.sessionId!==sessionId||JSON.stringify(g.formats)!==JSON.stringify(validateFormats(formats)))throw Error('会话或格式已变化，请重新选择保存位置');this.grants.delete(id);return g;}
}
