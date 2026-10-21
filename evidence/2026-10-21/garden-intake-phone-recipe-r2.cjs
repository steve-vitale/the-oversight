'use strict';
const fs=require('fs');
let s=fs.readFileSync('evidence/2026-10-21/garden-intake-phone-r1.cjs','utf8');
s=s.replaceAll('garden-intake-phone-fixture-r1','garden-intake-phone-fixture-r2').replaceAll('.playwright-mcp/garden-intake-r1-','.playwright-mcp/garden-intake-r2-').replaceAll('failure-r1.json','failure-r2.json').replaceAll("+'-r1.json'","+'-r2.json'");
fs.writeFileSync('evidence/2026-10-21/garden-intake-phone-r2.cjs',s,{flag:'wx'});
