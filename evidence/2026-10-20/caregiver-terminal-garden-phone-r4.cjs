'use strict';
const fs=require('fs');
let source=fs.readFileSync('evidence/2026-10-20/caregiver-terminal-garden-phone-r3.cjs','utf8');
const old=" if(!await page.locator('[data-garden=\"cultivate\"]').isDisabled())throw Error('Garden permits a second same-day cast');";
if(!source.includes(old))throw Error('Expected original native-disabled assumption');
source=source.replace(old,String.raw`
 await tap('[data-garden="cultivate"]');await snap('same-day repeat explains why it cannot act');const refused=await gardenState();
 if(refused.kcal!==gardenPaid.kcal||refused.ticks!==gardenPaid.ticks||JSON.stringify(refused.plots)!==JSON.stringify(gardenPaid.plots))throw Error('Refused repeat spent resources or recultivated');
 if(!/No growing bed can take more magic today/i.test(await page.locator('.garden-card').innerText()))throw Error('Missing refusal explanation');
`).replaceAll('garden-r3','garden-r4');
const Module=require('module'),m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(source,__filename);
