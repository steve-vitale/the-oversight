'use strict';
// Repeat the reviewed touch journey against production; only fixture requests
// are supplied locally because evidence is intentionally excluded from deploy.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
(async()=>{
 const root=process.cwd(),base='https://the-oversight.vercel.app',height=Number(process.argv[2]),out=process.argv[3],scratch=path.resolve(process.argv[4]);
 if(![736,844].includes(height)||!out||!scratch.startsWith('C:\\Users\\Steve\\oversight\\.git\\release-main67-hosted-'))throw Error('Pass target height, fresh receipt and task scratch');
 const recipe=fs.readFileSync('evidence/2026-10-19/release-contact2-frame-replay-r3.js','utf8').replace("if(!/^http:\\/\\/(127\\.0\\.0\\.1|localhost):/.test(base))throw Error('Disposable loopback fixture only');","if(base!=='https://the-oversight.vercel.app')throw Error('Expected exact production origin');");
 if(recipe.includes('Disposable loopback fixture only'))throw Error('Hosted guard adaptation failed');
 fs.mkdirSync(path.join(scratch,'.playwright-mcp'),{recursive:true});const run=Function('return ('+recipe+')')(),browser=await chromium.launch({channel:'msedge',headless:true});
 try{const context=await browser.newContext({viewport:{width:390,height},hasTouch:true,isMobile:true,serviceWorkers:'block'});await context.route(base+'/evidence/2026-10-18/*',async route=>{const name=path.basename(new URL(route.request().url()).pathname);if(!['installed-update-old-save-r1.json','mobile-combat-pagehide-r2.json'].includes(name))throw Error('Unknown fixture');await route.fulfill({status:200,contentType:'application/json',body:fs.readFileSync(path.join(root,'evidence/2026-10-18',name))})});
 const page=await context.newPage();process.chdir(scratch);await page.goto(base);const result=await run(page);result.scope='Actual production application responses and trusted touch emulation; two local recorded save fixtures only; no runtime responses intercepted. Not physical-device or installed-app clearance.';fs.writeFileSync(path.resolve(root,out),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log({height,trace:result.trace.length,networkFailures:result.networkFailures});await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
