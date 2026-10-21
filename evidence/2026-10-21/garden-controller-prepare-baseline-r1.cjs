'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),B=require('../../scripts/balance-panel');
const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),root=path.join(common,'garden-controller-baseline-r1');
if(fs.existsSync(root))throw Error('Probe root already exists');
const sources=B.manifest(process.cwd()),files=new Set(Object.keys(sources));
function scripts(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())scripts(f);else if(/\.(js|json)$/.test(f))files.add(f.replace(/\\/g,'/'));}}scripts('scripts');
for(const rel of files){const file=path.resolve(root,rel);assert.ok(file.startsWith(root+path.sep));fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(rel,file);}
assert.deepEqual(B.manifest(root),sources);
fs.writeFileSync('evidence/2026-10-21/garden-controller-baseline-root-r1.json',JSON.stringify({root,sources,scope:'Released bbece2e39 canonical crop safety Game and old controller frozen before the garden controller revision.'},null,2)+'\n',{flag:'wx'});console.log(root);
