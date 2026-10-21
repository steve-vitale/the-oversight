'use strict';
const fs=require('fs'),prefix='evidence/2026-10-21/partial-donation-';
let source=fs.readFileSync(prefix+'phone-r6.cjs','utf8').replaceAll('-r6','-r7');
const marker='const given=await read();';if(!source.includes(marker))throw Error('Journey marker changed');
source=source.replace(marker,marker+String.raw`fs.writeFileSync(prefix+'phone-'+height+'-committed-storage-r7.json',JSON.stringify({scope:'Actual localStorage immediately after the native partial gift, before unload.',storage:await page.evaluate(()=>({...localStorage}))},null,2)+'\n',{flag:'wx'});`);
fs.writeFileSync(prefix+'phone-r7.cjs',source,{flag:'wx'});
fs.copyFileSync(prefix+'phone-fixture-r6.json',prefix+'phone-fixture-r7.json',fs.constants.COPYFILE_EXCL);
