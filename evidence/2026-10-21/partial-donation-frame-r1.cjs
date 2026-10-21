'use strict';
const fs=require('fs'),{chromium}=require('playwright'),F=require('../../scripts/phone-frame-proof-update');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const source=fs.readFileSync('evidence/2026-10-19/release-contact2-frame-replay-r3.js','utf8').replaceAll('.playwright-mcp/phone-frame-','evidence/2026-10-21/partial-donation-frame-');
 const journey=eval('('+source+')');
 for(const height of [736,844]){const context=await browser.newContext({viewport:{width:390,height},isMobile:true,hasTouch:true,deviceScaleFactor:1}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8931');const receipt=await journey(page);receipt.pageErrors=errors;if(errors.length)throw Error(errors.join('\n'));
  F.validateReceipt(process.cwd(),receipt);fs.writeFileSync('evidence/2026-10-21/partial-donation-frame-'+height+'-r1.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({height,stages:receipt.trace.length,errors:errors.length}));await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
