import {win32,basename,dirname,extname} from 'node:path';import {existingDirectory,safeStem} from './files.js';
import {homedir} from 'node:os';
import {pickNativeDestination} from './native-dialog.js';
export function validateFormats(formats){if(!Array.isArray(formats)||!formats.length||formats.length>3||new Set(formats).size!==formats.length||formats.some(f=>!['txt','md','pdf'].includes(f)))throw Error('请选择有效导出格式');return [...formats].sort();}
export function assertLocalPath(path){if(typeof path!=='string'||!win32.isAbsolute(path)||!/^([A-Za-z]:[\\/])/.test(path)||/[\u0000-\u001f]/.test(path))throw Error('请选择有效的本地 Windows 路径，检查末尾标点');}
/** Only a real local chooser may mint a one-use server-held write destination. */
export class DestinationGrants {
  constructor({picker=pickNativeDestination,now=Date.now,validateDirectory=existingDirectory}={}){this.picker=picker;this.now=now;this.validateDirectory=validateDirectory;this.grants=new Map();this.picking=false;}
  async choose({sessionId,formats,title,initialDirectory},signal){
    const checked=validateFormats(formats);if(this.picking)throw Error('已有原生选择窗口，请先完成或取消');this.picking=true;
    try{
      let initial=homedir(),initialDirectoryUnavailable=false;
      if(initialDirectory){try{assertLocalPath(initialDirectory);initial=await this.validateDirectory(initialDirectory);}catch{initialDirectoryUnavailable=true;}}
      const single=checked.length===1,extension=checked[0];
      const path=await this.picker({mode:single?'file':'folder',title:single?'DSH AI Exporter - 另存为（同名自动编号，不覆盖）':'DSH AI Exporter - 选择导出文件夹',initialDirectory:initial,fileName:single?safeStem(title,this.now())+'.'+extension:'',extension,filter:`${extension.toUpperCase()} (*.${extension})|*.${extension}`},signal);
      signal?.throwIfAborted();if(path===null)return {cancelled:true,...(initialDirectoryUnavailable?{initialDirectoryUnavailable:true}:{})};assertLocalPath(path);
      if(single&&win32.extname(path).toLowerCase()!=='.'+extension)throw Error('文件扩展名与所选格式不符，请重新另存为');
      const directory=await this.validateDirectory(single?win32.dirname(path):path),fileStem=single?win32.basename(path,win32.extname(path)):undefined;
      if(fileStem&&(/[<>:"/\\|?*\u0000-\u001f]/.test(fileStem)||/[. ]$/.test(fileStem)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(fileStem)))throw Error('Windows 文件名无效，请重新选择');
      for(const [id,g] of this.grants)if(g.expires<this.now())this.grants.delete(id);
      if(this.grants.size>32)throw Error('待确认的保存位置过多，请稍后重试');
      const grant=globalThis.crypto.randomUUID();this.grants.set(grant,{sessionId,formats:checked,outputDir:directory,fileStem,expires:this.now()+300000});
      return {grant,directory,fileName:single?win32.basename(path):null,mode:single?'file':'folder',initialDirectoryUnavailable};
    }finally{this.picking=false;}
  }
  consume(id,sessionId,formats){const g=this.grants.get(id);if(!g||g.expires<this.now())throw Error('保存位置授权已失效，请重新选择');if(g.sessionId!==sessionId||JSON.stringify(g.formats)!==JSON.stringify(validateFormats(formats)))throw Error('会话或格式已变化，请重新选择保存位置');this.grants.delete(id);return g;}
}
