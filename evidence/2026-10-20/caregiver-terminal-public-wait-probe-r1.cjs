'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),B=require('../../scripts/balance-panel');
const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),root=path.join(common,'caregiver-terminal-public-wait-r1');
if(fs.existsSync(root))throw Error('Probe root already exists');
const sources=B.manifest(process.cwd()),files=new Set(Object.keys(sources));
function scripts(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())scripts(f);else if(/\.(js|json)$/.test(f))files.add(f.replace(/\\/g,'/'));}}scripts('scripts');
for(const rel of files){const file=path.resolve(root,rel);assert.ok(file.startsWith(root+path.sep));fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(rel,file);}
const file=path.join(root,'scripts/sim-harness.js'),original=fs.readFileSync(file,'utf8');
const from="        const p = Game.tbFighter('p');\n        p.moveLeft = 0; p.acted = true;\n        Game.tbAfterPlayerAction();";
const normalized=original.replace(/\r\n/g,'\n');assert.equal(normalized.split(from).length,2,'Expected exactly one direct turn shortcut');
fs.writeFileSync(file,normalized.replace(from,"        Game.tbPlayerWait(); // same public end-turn action as the phone"));
const after=B.manifest(root);assert.deepEqual(Object.keys(sources).filter(f=>sources[f]!==after[f]),['scripts/sim-harness.js']);
fs.writeFileSync('evidence/2026-10-20/caregiver-terminal-public-wait-root-r1.json',JSON.stringify({root,before:sources,after,scope:'Methodology probe only: one harness shortcut replaced by public Wait. Game and policies unchanged.'},null,2)+'\n',{flag:'wx'});console.log(root);
