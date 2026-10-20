'use strict';
// Actual old/main -> candidate SW update and cold offline boot, disposable origin.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const root=process.cwd(),old=path.resolve(process.argv[2]),out=process.argv[3];let mode='old';const trace=[],errors=[];
 const version=r=>JSON.parse(fs.readFileSync(path.join(r,'version.json'))).version;
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),base=mode==='old'?old:root;let file=path.resolve(base,'.'+(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end()}
  if(!fs.existsSync(file)&&u.pathname.startsWith('/assets/'))file=path.join(root,u.pathname);
  fs.readFile(file,(e,b)=>{if(e){console.error('404',mode,u.pathname);res.writeHead(404);return res.end()}res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(b)})});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8922,'127.0.0.1',resolve)});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const context=await browser.newContext({viewport:{width:390,height:736},hasTouch:true,isMobile:true}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:8922';
  await page.goto(base);await page.waitForLoadState('networkidle');
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
  const oldWorker=await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL);
  assert.equal(new URL(oldWorker).searchParams.get('v'),version(old),'Old build must actually control the page before update');
  trace.push({stage:'old installed worker',controller:oldWorker,caches:await page.evaluate(()=>caches.keys())});
  assert.equal(await page.evaluate(()=>BUILD_VERSION),version(old));
  const storage=JSON.parse(fs.readFileSync(path.join(root,'evidence/2026-10-18/installed-update-old-save-r1.json'))).storage;
  await page.evaluate(s=>{localStorage.clear();for(const[k,v]of Object.entries(s))localStorage.setItem(k,v)},storage);
  const before=await page.evaluate(()=>({...localStorage}));trace.push({stage:'old installed source',version:version(old),keys:Object.keys(before)});
  mode='candidate';await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.locator('#update-banner:not(.hidden)').waitFor({timeout:75000});await page.locator('#update-banner').tap();
  await page.waitForFunction(v=>window.BUILD_VERSION===v,version(root),{timeout:45000});await page.waitForLoadState('networkidle');await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForTimeout(1500);
  assert.deepEqual(await page.evaluate(()=>({...localStorage})),before);trace.push({stage:'native update',version:await page.evaluate(()=>BUILD_VERSION),saveUnchanged:true});
  await context.setOffline(true);await page.goto('about:blank');await page.goto(base);await page.waitForFunction(()=>window.Scattering?.Game);assert.equal(await page.evaluate(()=>BUILD_VERSION),version(root));assert.deepEqual(await page.evaluate(()=>({...localStorage})),before);
  const key=Object.keys(storage).find(k=>k.startsWith('scattering-save-v1-'));await page.locator('button[data-load="'+key+'"]').tap();await page.waitForTimeout(500);
  const state=await page.evaluate(()=>({build:BUILD_VERSION,day:Scattering.Game.state.scholar.day,kcal:Scattering.Game.state.scholar.kcal,scroll:document.documentElement.scrollHeight,controller:navigator.serviceWorker.controller?.scriptURL}));assert.ok(state.controller);assert.ok(state.scroll<=737);trace.push({stage:'cold offline Continue',...state});
  await page.screenshot({path:out.replace(/\.json$/,'.png')});fs.writeFileSync(out,JSON.stringify({scope:'Disposable Chromium touch emulation; real service worker, actual old/main source and candidate; offline networking; not physical device',oldVersion:version(old),candidateVersion:version(root),trace,errors},null,2)+'\n',{flag:'wx'});console.log({trace,errors});await context.close();
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
