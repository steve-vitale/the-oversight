'use strict';
// Keep each fixture's captured RNG/module state in its own Node process.
module.exports=function isolatedProofCases(cases){
 const i=process.argv.indexOf('--proof-case');
 if(i>=0){const selected=process.argv[i+1];if(!cases.includes(selected))throw Error('Unknown proof case: '+selected);return selected;}
 const cp=require('child_process');let failed=false;
 for(const selected of cases){console.log('Isolated proof case: '+selected);const r=cp.spawnSync(process.execPath,[...process.execArgv,process.argv[1],...process.argv.slice(2),'--proof-case',selected],{stdio:'inherit',env:process.env});if(r.error)console.error(r.error.message);if(r.status!==0)failed=true;}
 process.exit(failed?1:0);
};
