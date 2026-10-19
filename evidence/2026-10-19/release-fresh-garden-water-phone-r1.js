async page=>{
 const fs=process.getBuiltinModule('fs'),height=page.viewportSize().height,trace=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{let s=190019;Math.random=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296}});
 await page.reload();await page.waitForLoadState('networkidle');
 async function snap(label){const r=await page.evaluate(label=>({label,text:document.body.innerText,scroll:[scrollX,scrollY,document.documentElement.scrollHeight],state:Scattering.Game.state}),label);trace.push(r);fs.writeFileSync('.playwright-mcp/opening-partial.json',JSON.stringify({height,trace,errors}));await page.screenshot({path:'.playwright-mcp/opening-'+trace.length+'-'+height+'.png'});if(trace.length>=6&&(r.scroll[0]||r.scroll[1]||r.scroll[2]>height+1))throw Error('Field requires outer scrolling: '+label);return r}
 async function tap(sel){await page.locator(sel).first().tap();await page.waitForTimeout(350)}
 if(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('scattering-save-v1-'))))throw Error('Not a fresh save');
 await tap('#b-new');for(let i=0;i<3;i++)await tap('#b-c1');
 await page.locator('#ob-origin-search').fill('Chicago');await snap('actual origin choices');await tap('[data-origin]');
 await snap('actual generated character choices');await tap('[data-v]');
 const items=await page.locator('.itempick').evaluateAll(es=>es.map(e=>({id:e.dataset.i,text:e.innerText})));
 const ordered=[...items].sort((a,b)=>Number(/knife|lighter|bottle|pot|coat|jacket/i.test(b.text))-Number(/knife|lighter|bottle|pot|coat|jacket/i.test(a.text)));
 for(const item of ordered.slice(0,5))await tap('.itempick[data-i="'+item.id+'"]');
 await snap('five actual starting belongings');await tap('#b-go');await page.locator('#ob-runname').fill('Release fresh opening 190019');await tap('#b-name-go');await snap('natural wake location');
 await page.evaluate(async()=>{const G=Scattering.Game;window.openingVoice=[];G._voiceTts={stored:async()=>Object.values(G.VOICE_PACKS).map(v=>v.voiceId),predict:async req=>{window.openingVoice.push(req.text);return null}};await G.refreshVoiceCache();G.setVoiceEnabled(true)});
 await tap('#b-wake');await snap('waker first spoken line');
 for(let i=0;i<12&&await page.locator('#b-qnext').count();i++)await tap('#b-qnext');
 await snap('fresh expedition initial ability choice');
 await tap('button:has-text("Night Eyes")');
 await snap('fresh expedition ordinary phone field');
 for(let i=0;i<2;i++)await tap('button[aria-label="step south"]');
 await snap('walking to actual Haven exit');
 if(await page.locator('.phone-primary-actions button:has-text("Step outside")').count())await tap('.phone-primary-actions button:has-text("Step outside")');
 await snap('actual outside field opportunities');
 await tap('[data-lm="pack"]');await snap('natural starting food and clean water choices');await tap('#inlineslot [data-x]');
 for(let i=0;i<7;i++)await tap('button[aria-label="step south"]');
 await snap('ordinary walk from Haven toward forest');
 await tap('.phone-primary-actions button:has-text("Examine")');await snap('actual nearby plant examination');
 await tap('.phone-primary-actions button:has-text("Forage")');await snap('actual nearby plant gathering');
 await tap('[data-lm="pack"]');await snap('gathered plant food knowledge choices');
 if(await page.locator('[data-test]').count()){await tap('[data-test]');await snap('actual cautious plant test');}
 await tap('[data-eatone="1"]');await snap('actual starting food eaten');
 await tap('[data-drinkwater]');const refused=await snap('full-hydration water refusal preserves both clean bottles');if(!refused.text.includes('not thirsty')||refused.state.scholar.water.length!==2)throw Error('Full-hydration bottle refusal failed');
 await tap('#inlineslot [data-x]');
 for(let i=0;i<7;i++)await tap('button[aria-label="step north"]');
 await snap('return toward Haven with the actual gathered food');
 for(const dir of ['west','north','north','north','east'])await tap('button[aria-label="step '+dir+'"]');
 await snap('natural route around Haven obstacles to garden');
 await tap('.phone-primary-actions button:has-text("Garden")');await snap('natural garden location and plot offer');
 await tap('[data-garden="make"]');await snap('actual empty garden plot created');
 await tap('[data-garden="sow"]');const seedStock=await snap('actual available identified seeds');
 await tap('[data-garden-seed="sunchoke"]');const planted=await snap('actual gathered tubers planted on the grid');
 const tubers=s=>s.inventory.filter(i=>i.plantId==='sunchoke').reduce((n,i)=>n+i.units,0);
 if(tubers(seedStock.state.scholar)-tubers(planted.state.scholar)!==2||!planted.text.includes('ripe in 14d')||!await page.locator('.cell').filter({hasText:'1🌱'}).count())throw Error('Sowing did not spend two real tubers or change the map');
 await tap('#inlineslot [data-x]');
 for(let i=0;i<8&&await page.evaluate(()=>Scattering.Game.state.scholar.hydration>=95);i++){await tap('[data-field-panel="menu"]');await tap('[data-lm="wait"]');}
 await tap('[data-lm="pack"]');const thirsty=await snap('naturally thirsty clean water choice');await tap('[data-drinkwater]');const drunk=await snap('actual thirsty bottle consumed');await tap('#inlineslot [data-x]');
 const liters=s=>s.water.reduce((n,b)=>n+b.liters,0);
 if(thirsty.state.scholar.hydration>=95||drunk.state.scholar.hydration!==Math.min(100,thirsty.state.scholar.hydration+50)||liters(thirsty.state.scholar)-liters(drunk.state.scholar)!==1)throw Error('Thirsty drinking did not restore hydration for exactly one litre');
 const final=trace.at(-1).state.scholar;
 if(tubers(final)!==tubers(planted.state.scholar)||final.inventory.find(i=>i.name==='Trail mix')?.units!==1)throw Error('Natural food/knowledge/return flow incomplete');
 const property=s=>JSON.stringify({id:s.villagerId,inventory:s.inventory,water:s.water,hydration:s.hydration,hp:s.health,kcal:s.kcal,day:s.day,position:[s.mx,s.my]});
 await page.reload();await page.waitForLoadState('networkidle');const keys=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('scattering-save-v1-')));if(keys.length!==1)throw Error('Expected one natural campaign');
 await tap('[data-load="'+keys[0]+'"]');const resumed=await snap('actual reload and Continue retain the fresh campaign');if(property(resumed.state.scholar)!==property(final)||!await page.locator('.cell').filter({hasText:'1🌱'}).count())throw Error('Continue changed campaign property or planted plot');
 if(errors.length)throw Error(JSON.stringify(errors));
 return{height,trace,items,voice:await page.evaluate(()=>window.openingVoice),errors,networkFailures:[],scope:'Fresh empty-save New Expedition; seed190019 configured before game load; actual native setup choices; no prepared state or gameplay grants; Piper predict stub only'};
}
