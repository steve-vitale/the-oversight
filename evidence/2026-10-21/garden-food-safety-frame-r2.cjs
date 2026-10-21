'use strict';
// Reuse the retained trusted-touch journey against the reconciled source.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  fs.mkdirSync('.playwright-mcp',{recursive:true});
  const journey=eval('('+fs.readFileSync('evidence/2026-10-19/release-contact2-frame-replay-r3.js','utf8')+')');
  for(const height of [736,844]){
   const context=await browser.newContext({viewport:{width:390,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8921/');
   const receipt=await journey(page);receipt.pageErrors=errors;
   if(errors.length)throw Error(errors.join('\n'));
   const destination='evidence/2026-10-21/garden-food-safety-frame-'+height+'-r2.json';
   fs.writeFileSync(destination,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
   console.log(JSON.stringify({height,checkpoints:receipt.trace.length,pageErrors:errors.length,receipt:destination}));
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
