'use strict';
const fs=require('fs');
let s=fs.readFileSync('evidence/2026-10-20/caregiver-terminal-table-probe-r1.cjs','utf8');
s=s.replaceAll('caregiver-terminal-table-probe-r1-','caregiver-terminal-table-probe-r2-').replace('persist-r1-on-table.json','persist-r2-on-table.json').replace('natural day266 Table Continue','natural day267 Table Continue').replace('caregiver-terminal-table-probe-r1.json','caregiver-terminal-table-probe-r2.json');
s=s.replace(' return{trace,errors,visible:',` await tap('[data-field-panel="place"]');await snap('Place shows the Table entry');console.log(await page.locator('[data-table-seat]').evaluate(e=>{const parents=[];for(let p=e;p;p=p.parentElement){const r=p.getBoundingClientRect();parents.push({tag:p.tagName,cls:p.className,rect:r.toJSON(),scroll:p.scrollTop,client:p.clientHeight,total:p.scrollHeight,overflow:getComputedStyle(p).overflowY});if(parents.length>9)break;}return{disabled:e.disabled,parents};}));
 return{trace,errors,visible:`);
fs.writeFileSync('evidence/2026-10-20/caregiver-terminal-table-probe-r2.cjs',s,{flag:'wx'});
