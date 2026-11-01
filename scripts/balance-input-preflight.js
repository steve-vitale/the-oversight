#!/usr/bin/env node
'use strict';
// Read-only preparation for a comparison run by THIS checkout's balance-panel
// driver against both roots. Reject every policy/harness difference, including
// unused registry entries, just as the final scorecard does. Never copy inputs.
const fs=require('fs'),path=require('path'),B=require('./balance-panel');
function compareSources(before,after){
 const names=[...new Set([...Object.keys(before),...Object.keys(after)])].sort();
 const changed=names.filter(file=>before[file]!==after[file]);
 return{ok:!changed.some(file=>file.startsWith('scripts/')),harnessChanges:changed.filter(file=>file.startsWith('scripts/')).map(file=>({file,before:before[file]??null,after:after[file]??null})),gameChanges:changed.filter(file=>!file.startsWith('scripts/'))};
}
function inspect(before,after){
 const result=compareSources(B.manifest(before),B.manifest(after));
 return{...result,before:path.resolve(before),after:path.resolve(after),observer:B.observerIdentity(path.join(__dirname,'..')),scope:'Use this checkout\'s unchanged balance-panel driver for BOTH roots with matched options. This checks all recorded policy/harness inputs before running; it does not replace final panel validation, neutral maintenance, source stability or metric review.'};
}
if(require.main===module){
 try{const args=process.argv.slice(2),value=name=>{const i=args.indexOf('--'+name);return i<0?null:args[i+1];},before=value('before'),after=value('after');if(!before||!after)throw Error('Usage: node scripts/balance-input-preflight.js --before <root> --after <root> [--out <fresh.json>]');const result=inspect(before,after),text=JSON.stringify(result,null,2)+'\n',out=value('out');if(out)fs.writeFileSync(out,text,{flag:'wx'});process.stdout.write(text);if(!result.ok)process.exitCode=1;}catch(error){console.error(error.stack);process.exitCode=1;}
}
module.exports={compareSources,inspect};
