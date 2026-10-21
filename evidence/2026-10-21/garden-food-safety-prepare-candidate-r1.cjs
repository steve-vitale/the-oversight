'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),B=require('../../scripts/balance-panel');
const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),root=path.join(common,'garden-food-safety-candidate-r1');
const existed=fs.existsSync(root);
const sources=B.manifest(process.cwd()),files=new Set(Object.keys(sources));
function scripts(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())scripts(f);else if(/\.(js|json)$/.test(f))files.add(f.replace(/\\/g,'/'));}}scripts('scripts');
if(!existed)for(const rel of files){const file=path.resolve(root,rel);assert.ok(file.startsWith(root+path.sep));fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(rel,file);}
assert.deepEqual(B.manifest(root),sources);
fs.writeFileSync('evidence/2026-10-21/garden-food-safety-candidate-root-r1.json',JSON.stringify({root,sources,scope:'Corrected crop harvest and Pack cooking runtime frozen for matched all23 measurement.'},null,2)+'\n',{flag:'wx'});console.log(root);
