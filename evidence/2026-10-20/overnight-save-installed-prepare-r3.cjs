'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),B=require('../../scripts/build-offline-assets'),assert=require('assert/strict');
const revision='d09f47ea2',common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),root=path.join(common,'overnight-save-installed-base-r3'),archive=root+'.tar';
if(fs.existsSync(root)||fs.existsSync(archive))throw Error('Installed baseline already exists');
const tracked=new Set(cp.execFileSync('git',['ls-tree','-r','--name-only',revision],{encoding:'utf8',maxBuffer:10e6}).split('\n'));
const requested=[...new Set([...B.collect(process.cwd()).assets.map(f=>f.split('?')[0].replace(/^\.\//,'')||'index.html'),'index.html','sw.js','version.json','manifest.json'])];
const omitted=requested.filter(f=>!tracked.has(f));assert.deepEqual(omitted,['src/js/timeSettlement.js']);
const files=requested.filter(f=>tracked.has(f));fs.mkdirSync(root);cp.execFileSync('git',['archive','--format=tar','-o',archive,revision,'--',...files]);cp.execFileSync(process.platform==='win32'?path.join(process.env.SystemRoot,'System32','tar.exe'):'tar',['-xf',archive,'-C',root]);
fs.writeFileSync('evidence/2026-10-20/overnight-save-installed-baseline-r3.json',JSON.stringify({revision,root,files,omitted,scope:'Exact tracked old production offline assets reconstructed by Git archive; new candidate module intentionally absent.'},null,2)+'\n',{flag:'wx'});console.log(root);
