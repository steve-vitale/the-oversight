async(page)=>{
 const base=new URL(page.url()).origin;
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base))throw Error('Disposable loopback fixture only');
 await page.waitForLoadState('networkidle');
 const c=await page.context().newCDPSession(page),height=page.viewportSize().height,trace=[];
 const responses=new Map(),pending=new Map(),bodyJobs=[],networkFailures=[];
 await c.send('Network.enable');
 c.on('Network.responseReceived',e=>{
  const u=new URL(e.response.url);
  if(u.origin===base&&e.response.status===200&&!u.pathname.startsWith('/evidence/')&&
   (u.pathname==='/'||/\.(js|json|css|html)$/.test(u.pathname)))pending.set(e.requestId,u.pathname+u.search);
 });
 c.on('Network.loadingFinished',e=>{
  const url=pending.get(e.requestId);if(!url)return;
  bodyJobs.push(c.send('Network.getResponseBody',{requestId:e.requestId}).then(body=>responses.set(url,body)).catch(error=>networkFailures.push({url,error:error.message})));
 });
 await page.addInitScript(()=>{
  if(window.fieldTouchHook)return;window.fieldTouchHook=true;window.fieldTouches=[];
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')window.fieldTouches.push({trusted:e.isTrusted,x:e.clientX,y:e.clientY,id:e.target.closest('button')?.id});},true);
 });
 await c.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 async function tap(selector){
  const el=page.locator(selector).first(),r=await el.boundingBox();
  if(!r||r.y<0||r.y+r.height>height||r.x<0||r.x+r.width>390)throw Error('Offscreen core control '+selector);
  const hit=await el.evaluate(e=>{const r=e.getBoundingClientRect(),at=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return at===e||e.contains(at)});
  if(!hit)throw Error('Covered control '+selector);
  await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
  await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(320);
 }
 async function frame(label){
  const r=await page.evaluate(label=>{
   const G=Scattering.Game,p=G.tbfight?.fighters.find(f=>f.key==='p');
   const rects=Object.fromEntries(['.detail','.ord-narration','.ord-controls','.ord-lowermenu'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}]}));
   return{label,viewport:[innerWidth,innerHeight],scroll:[scrollX,scrollY,document.documentElement.scrollHeight],rects,
    bearer:G.villagerId,hp:G.state.scholar.health,kcal:G.state.scholar.kcal,ticks:G.state.scholar.dayTicks,
    pos:[G.state.scholar.mx,G.state.scholar.my],fight:!!G.tbfight,player:p&&{x:p.mx,y:p.my,moves:p.moveLeft,acted:p.acted},
    message:document.querySelector('.ord-narration').innerText,controls:[...document.querySelectorAll('.phone-primary-actions button')].map(b=>({id:b.id,cid:b.dataset.cid,text:b.textContent,disabled:b.disabled})),
    floating:[document.querySelectorAll('.toast-layer .toast').length,document.querySelectorAll('.speech-bubble').length,!document.querySelector('#toast').classList.contains('hidden')],
    phone:{touch:navigator.maxTouchPoints,coarse:matchMedia('(pointer: coarse)').matches,hover:matchMedia('(hover: hover)').matches,dpr:devicePixelRatio},
    touches:(window.fieldTouches||[]).slice()};
  },label);
  if(r.scroll[0]||r.scroll[1]||r.scroll[2]>height+1)throw Error('Page scrolling at '+label);
  if(Object.values(r.rects).some(b=>b.y<0||b.bottom>height+1||b.width<=0||b.height<=0))throw Error('Frame out of viewport at '+label);
  trace.push(r);return r;
 }
 async function load(file){
  await page.goto(base+'/');await page.waitForLoadState('networkidle');
  const key=await page.evaluate(async file=>{const d=await(await fetch('/evidence/2026-10-18/'+file,{cache:'no-store'})).json();for(const[k,v]of Object.entries(d.storage))localStorage.setItem(k,v);return Object.keys(d.storage).find(k=>k.startsWith('scattering-save-v1-'));},file);
  await page.goto(base+'/');await page.waitForLoadState('networkidle');await tap('button[data-load="'+key+'"]');await page.waitForTimeout(600);
 }
 await load('installed-update-old-save-r1.json');
 await frame('ordinary');await tap('[data-lm="pack"]');await frame('Pack open');
 const beforeDrink=await page.evaluate(()=>JSON.stringify(Scattering.Game.state.scholar.water));
 await tap('#inlineslot [data-drinkwater]');await frame('refused drink');
 const afterDrink=await page.evaluate(()=>JSON.stringify(Scattering.Game.state.scholar.water));
 if(beforeDrink!==afterDrink)throw Error('Full-hydration drink consumed water');
 await tap('[data-field-panel="menu"]');await frame('Menu');
 await tap('[data-field-close]');await tap('[data-field-panel="place"]');await frame('Place');
 await tap('button[aria-label="step west"]');await frame('movement closes tools');
 await tap('button[aria-label="step east"]');await frame('replacement controls');
 await tap('.phone-primary-actions button:has-text("Talk")');
 if(await page.locator('.phone-primary-actions [data-tidx="0"]').count())await tap('.phone-primary-actions [data-tidx="0"]');
 await frame('person card');await tap('.phone-primary-actions [data-act="talk"]');await page.waitForTimeout(800);
 for(let n=0;n<8&&await page.locator('.phone-primary-actions #dlg-next').count();n++)await tap('.phone-primary-actions #dlg-next');
 const conversation=await frame('conversation choices'),choices=[];
 const pager=page.locator('[data-reply-page]'),label=await pager.count()?await pager.textContent():'';
 const pages=Number(label.match(/\/(\d+)/)?.[1]||1);
 for(let n=0;n<pages;n++){choices.push(await page.locator('.phone-primary-actions').innerText());if(await pager.count())await tap('[data-reply-page]');}
 const paged=await frame('paged choices');
 if(paged.kcal!==conversation.kcal||paged.ticks!==conversation.ticks||paged.message!==conversation.message||JSON.stringify(paged.controls)!==JSON.stringify(conversation.controls))throw Error('Browsing replies changed the conversation');
 if(!await page.locator('.phone-primary-actions [data-cid]').count())throw Error('No actual conversation choice reached');
 await tap('.phone-primary-actions [data-cid]');await page.waitForTimeout(700);await frame('real reply');
 await page.screenshot({path:'.playwright-mcp/phone-frame-chat-final-'+height+'.png'});
 await load('mobile-combat-pagehide-r2.json');await page.waitForTimeout(900);await frame('resumed Deer');
 await tap('[data-field-panel="actions"]');await frame('combat actions open');await tap('[data-field-close]');
 for(const direction of ['east','east','west'])await tap('button[aria-label="step '+direction+'"]');
 const exhausted=await frame('zero moves one action');
 if(exhausted.player?.moves!==0||exhausted.player.acted)throw Error('Did not reach real zero-move/action case');
 await tap('#c-wait');await page.waitForTimeout(900);const waited=await frame('Wait resolved');
 if(!waited.fight||waited.player?.moves!==3||waited.player?.acted)throw Error('Wait did not return a usable real turn');
 await page.screenshot({path:'.playwright-mcp/phone-frame-deer-final-'+height+'.png'});
 await tap('button[aria-label="step east"]');await tap('button[aria-label="step east"]');await page.waitForTimeout(700);
 const escaped=await frame('actual edge escape');
 if(escaped.fight)throw Error('Did not leave combat normally');
 await page.screenshot({path:'.playwright-mcp/phone-frame-exit-final-'+height+'.png'});
 const networkInputs={};
 await Promise.all(bodyJobs);
 for(const[url,response]of responses){
  networkInputs[url]={normalizedSha256:await page.evaluate(async({body,base64Encoded})=>{
   const text=(base64Encoded?new TextDecoder().decode(Uint8Array.from(atob(body),c=>c.charCodeAt(0))):body).replace(/\r\n/g,'\n');
   return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
  },response)};
 }
 return{fixture:'Unedited recorded old-build expedition and actual interrupted Deer save; trusted touch only, no core-control swipes, no gameplay helper calls or grants',height,choices,trace,networkInputs,networkFailures};
}
