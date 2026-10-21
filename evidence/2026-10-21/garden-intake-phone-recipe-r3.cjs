'use strict';
const fs=require('fs');
let s=fs.readFileSync('evidence/2026-10-21/garden-intake-phone-r2.cjs','utf8');
s=s.replace('[data-field-panel="pack"]','[data-lm="pack"]').replaceAll('.playwright-mcp/garden-intake-r2-','.playwright-mcp/garden-intake-r3-').replaceAll('failure-r2.json','failure-r3.json').replaceAll("+'-r2.json'","+'-r3.json'");
fs.writeFileSync('evidence/2026-10-21/garden-intake-phone-r3.cjs',s,{flag:'wx'});
