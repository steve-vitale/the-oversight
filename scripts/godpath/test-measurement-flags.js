'use strict';
const fs=require('fs'),os=require('os'),path=require('path'),K=require('./lib'),T=K.reporter('measurement source flags'),F=require('../lib/simulation-flags');
const root=path.resolve(__dirname,'../..'),sources=require('../balance-panel').manifest(root),names=F.discover(root,sources);
T.ok('actual harness SIMOPT changes cannot escape cache identity',names.includes('SIMOPT'));
const first=F.snapshot(root,sources,['CAPABLE_HUNT'],{SIMOPT:'0'}),second=F.snapshot(root,sources,['CAPABLE_HUNT'],{SIMOPT:'1'});
T.ok('same source with different SIMOPT has different recorded inputs',JSON.stringify(first)!==JSON.stringify(second));
T.ok('unset source-declared flags remain explicit unknown/default inputs',Object.hasOwn(first,'CAPABLE_HUNT')&&first.CAPABLE_HUNT===null);
const p=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-flags-'));
try{fs.writeFileSync(path.join(p,'sample.js'),"const ENV={NEW_POLICY_FLAG:'1'}; process.env.FUTURE_FLAG; process.env['QUOTED_FLAG']; process.env[k]=ENV[k];");const found=F.discover(p,{'sample.js':'fixture'},['LEGACY_FLAG']);T.ok('future direct, quoted, wrapper and declared legacy knobs are retained', ['NEW_POLICY_FLAG','FUTURE_FLAG','QUOTED_FLAG','LEGACY_FLAG'].every(k=>found.includes(k)));T.ok('unrelated host environment is not copied into evidence',!Object.hasOwn(F.snapshot(p,{'sample.js':'fixture'},[],{UNRELATED_PRIVATE_VALUE:'do not capture'}),'UNRELATED_PRIVATE_VALUE'));}finally{if(path.dirname(path.resolve(p))!==path.resolve(os.tmpdir())||!path.basename(p).startsWith('oversight-flags-'))throw Error('Refuse cleanup outside the owned temporary directory');fs.rmSync(p,{recursive:true});}
T.done();
