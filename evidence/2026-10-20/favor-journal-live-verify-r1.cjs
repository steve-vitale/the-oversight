'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const {expectedInputs}=require('../../scripts/phone-frame-proof-update');
(async()=>{
 const base='https://the-oversight.vercel.app',version=JSON.parse(fs.readFileSync('version.json')).version,sha=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
 const live=await(await fetch(base+'/version.json?t='+Date.now(),{cache:'no-store'})).json();assert.equal(live.version,version,'Production must advertise the candidate');
 const jobs=Object.entries(expectedInputs(process.cwd())),results=[];let next=0;
 await Promise.all(Array.from({length:8},async()=>{while(next<jobs.length){const[file,expected]=jobs[next++],r=await fetch(base+'/'+file+'?v='+version,{cache:'no-store'});assert.equal(r.status,200,file);const hash=sha(await r.text());assert.equal(hash,expected,file);results.push({file,status:r.status,sha256:hash});}}));
 const browser=await chromium.launch({channel:'msedge',headless:true});let boot;
 try{const context=await browser.newContext({viewport:{width:390,height:736},hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForLoadState('networkidle');boot=await page.evaluate(()=>({build:BUILD_VERSION,gameLoaded:!!window.Scattering?.Game,title:document.title,viewport:[innerWidth,innerHeight],bodyText:document.body.innerText}));assert.equal(boot.build,version);assert(boot.gameLoaded);assert.deepEqual(errors,[]);boot.pageErrors=errors;await page.screenshot({path:'evidence/2026-10-20/favor-journal-live-mobile-r1.png'});await context.close();}finally{await browser.close();}
 const receipt={verifiedAt:new Date().toISOString(),url:base,commit:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),version,inputsVerified:results.length,results:results.sort((a,b)=>a.file.localeCompare(b.file)),boot,scope:'All deployed boot input hashes and fresh isolated touch browser boot. Gameplay/Continue evidence is separately source-bound; this is not physical-device release clearance.'};
 fs.writeFileSync('evidence/2026-10-20/favor-journal-publication-r1.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({version,inputs:results.length,pageErrors:boot.pageErrors.length}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
