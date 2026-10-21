'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),B=require('../../scripts/build-offline-assets'),assert=require('assert/strict');
const revision='e4336473a',common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),root=path.join(common,'partial-donation-installed-old-r1'),archive=root+'.tar';
if(fs.existsSync(root)||fs.existsSync(archive))throw Error('Installed root exists');
const tracked=new Set(cp.execFileSync('git',['ls-tree','-r','--name-only',revision],{encoding:'utf8',maxBuffer:10e6}).split('\n'));
const files=[...new Set([...B.collect(process.cwd()).assets.map(f=>f.split('?')[0].replace(/^\.\//,'')||'index.html'),'index.html','sw.js','version.json','manifest.json'])];assert.deepEqual(files.filter(f=>!tracked.has(f)),[]);
fs.mkdirSync(root);cp.execFileSync('git',['archive','--format=tar','-o',archive,revision,'--',...files]);cp.execFileSync(path.join(process.env.SystemRoot,'System32','tar.exe'),['-xf',archive,'-C',root]);
fs.writeFileSync('evidence/2026-10-21/partial-donation-installed-baseline-r1.json',JSON.stringify({root,revision,files,version:JSON.parse(fs.readFileSync(path.join(root,'version.json'))).version},null,2)+'\n',{flag:'wx'});console.log(root);
