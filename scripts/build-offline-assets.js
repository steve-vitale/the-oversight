#!/usr/bin/env node
'use strict';
// Exact request URLs from the real entry page plus the live data inventory.
// Never bumps a release version; the release script calls this after stamping.
const fs=require('fs'),path=require('path');
const START='// BEGIN GENERATED OFFLINE ASSETS',END='// END GENERATED OFFLINE ASSETS';
function collect(root){
 const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
 if(typeof version!=='string'||!version)throw Error('Missing data build version');
 const assets=new Set(),scripts=[],data=[],base=new URL('https://offline.invalid/');
 function add(value){const u=new URL(value.replace(/&amp;/g,'&'),base);if(u.origin!==base.origin)throw Error('External boot dependency: '+value);u.hash='';const relative='.'+u.pathname+u.search,file=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!file.startsWith(path.resolve(root)+path.sep)&&file!==path.resolve(root))throw Error('Asset escapes root');const stat=fs.statSync(file,{throwIfNoEntry:false});if(!stat||!(stat.isFile()||u.pathname==='/'))throw Error('Missing offline asset: '+relative);assets.add(relative);return relative;}
 for(const f of ['./','./index.html','./manifest.json','./version.json'])add(f);
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const m of index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g))scripts.push(add(m[1]));
 for(const m of index.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/g))add(m[1]);
 if(!scripts.length)throw Error('No entry scripts found');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));for(const icon of manifest.icons||[])add(icon.src);if(manifest.start_url)add(manifest.start_url);
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))){if(e.name.startsWith('_')||e.name.startsWith('.'))continue;const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.isFile()&&e.name.endsWith('.json'))data.push(add('./'+path.relative(root,file).replace(/\\/g,'/')));}}
 walk(path.join(root,'src/data'));
 // Boot's data fetches use the same build stamp as the entry scripts. Keeping
 // unversioned keys here can silently install old HTTP-cached game definitions.
 for(let i=0;i<data.length;i++){const old=data[i],fresh=old+'?v='+encodeURIComponent(version);assets.delete(old);data[i]=add(fresh);}
 return {assets:[...assets],scripts,data};
}
function generated(root){return START+'\nconst ASSETS = '+JSON.stringify(collect(root).assets,null,2)+';\n'+END;}
function update(root,check=false){const file=path.join(root,'sw.js'),source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),block=generated(root),pattern=source.includes(START)?/\/\/ BEGIN GENERATED OFFLINE ASSETS[\s\S]*?\/\/ END GENERATED OFFLINE ASSETS/:/const ASSETS = \[[\s\S]*?\];/;if(!pattern.test(source))throw Error('SW asset block missing');const next=source.replace(pattern,block);if(check){if(source!==next)throw Error('Stale offline assets: node scripts/build-offline-assets.js');}else fs.writeFileSync(file,next);return collect(root);}
module.exports={collect,update,generated};
if(require.main===module){try{const root=path.resolve(__dirname,'..'),result=update(root,process.argv.includes('--check'));console.log(`${process.argv.includes('--check')?'checked':'generated'} offline assets: ${result.assets.length} URLs, ${result.scripts.length} scripts, ${result.data.length} live JSON files`);}catch(e){console.error(e.message);process.exitCode=1;}}
