import {createRequire} from 'node:module';import {readFile,readdir,mkdir,cp,writeFile} from 'node:fs/promises';import {dirname,join,resolve} from 'node:path';
const seen=new Set(),inventory=[];
async function visit(name,from) {
  const req=createRequire(join(from,'package.json'));let folder=dirname(req.resolve(name));
  for(;;){try{const p=JSON.parse(await readFile(join(folder,'package.json'),'utf8'));if(p.name===name)break;}catch{}const parent=dirname(folder);if(parent===folder)throw Error('Cannot locate package root: '+name);folder=parent;}
  const p=JSON.parse(await readFile(join(folder,'package.json'),'utf8')),key=p.name+'@'+p.version;if(seen.has(key))return;seen.add(key);
  const files=(await readdir(folder)).filter(x=>/^(license|copying|notice|thirdpartynotices)(?:[.\-].*)?$/i.test(x));if(!p.license||!files.length)throw Error('Missing license metadata/text: '+key);
  const out=join('lib/licenses/dependencies',p.name.replace('/','__'));await mkdir(out,{recursive:true});for(const file of files)await cp(join(folder,file),join(out,file));inventory.push({name:p.name,version:p.version,license:p.license,notices:files});
  for(const dep of Object.keys(p.dependencies??{}))await visit(dep,folder);
}
const root=resolve('.'),manifest=JSON.parse(await readFile('package.json','utf8'));for(const name of Object.keys(manifest.dependencies??{}))await visit(name,root);
await writeFile('lib/licenses/DEPENDENCIES.json',JSON.stringify(inventory,null,2));console.log(`Retained license texts and notices for ${inventory.length} production packages`);
