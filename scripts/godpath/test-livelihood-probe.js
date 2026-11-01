'use strict';
const K=require('./lib'),P=require('../lib/livelihood-probe'),E=require('../lib/campaign-prefix'),gear=require('../gear-usage-audit'),L=require('../policies/livelihood'),T=K.reporter('Passive livelihood probe');
(async()=>{
 const G=await K.load({seed:7003});K.newRun(G);
 G.state.village.visitors=[{id:'prepared-probe-cart',name:'Prepared trader',entrepreneurial:true,wares:[{kind:'alien',itemId:'harvest_scythe',name:'Harvest Scythe',price:200000,sold:false}]}];
 G.state.scholar.kcal=1000;G.state.scholar.inventory=[{plantId:'blackberry',name:'Prepared finished berries',units:1,kcalEach:100,edible:true,safe:true}];
 G.state.scholar.equipped={...G.state.scholar.equipped,torso:{itemId:'hide_armor',name:'Prepared canonical armor',units:1}};
 // Conflicting obsolete data must never substitute for canonical worn gear.
 G.state.scholar.equipment={torso:{itemId:'harvest_scythe'}};
 T.ok('the prepared food exercises the actual finished-food budget',G.isFinishedFood(G.state.scholar.inventory[0]));
 const before=gear.gameplayHash(G.state),originals=Object.fromEntries(P.METHODS.map(k=>[k,G[k]])),entropy=E.entropyObserver(),probe=P.install(G);
 try{
  const first=entropy.snapshot();probe.hook('upkeep','before',{});probe.hook('upkeep','after',{});
  T.ok('corrected observations declare schema2',probe.schemaVersion===2&&P.SCHEMA_VERSION===2);
  T.ok('canonical worn slots and item identities survive a conflicting legacy field',probe.rows[0].state.equipped.torso.itemId==='hide_armor'&&!Object.hasOwn(probe.rows[0].state,'equipment'));
  T.ok('attaching and reading snapshots call no helper and draw no RNG/clock',probe.rows.every(r=>r.kind==='hook')&&before===gear.gameplayHash(G.state)&&JSON.stringify(first)===JSON.stringify(entropy.snapshot()));
  L.trade(G,{});
  T.ok('actual livelihood guard and cached public wares are recorded',probe.rows.some(r=>r.method==='playerAtHaven'&&r.result===true)&&probe.rows.some(r=>r.method==='visitorWares'&&r.result[0]?.price===200000));
  T.ok('actual nested food-budget queries retain their policy caller context',probe.rows.some(r=>r.method==='isFinishedFood'&&r.policyStack.some(s=>/\bfoodBudget\b/.test(s))&&r.policyStack.some(s=>/\btrade\b/.test(s))));
  T.ok('unaffordable work probe creates no purchase, time or state change',!probe.rows.some(r=>r.method==='visitorBuyWare')&&before===gear.gameplayHash(G.state)&&JSON.stringify(first)===JSON.stringify(entropy.snapshot()));
  G.map.px=0;G.map.py=0;const away=gear.gameplayHash(G.state);L.trade(G,{});
  T.ok('real absence guard is distinct from an empty or unaffordable cart',probe.rows.at(-1).method==='playerAtHaven'&&probe.rows.at(-1).result===false&&away===gear.gameplayHash(G.state));
  T.ok('valid native reads report no probe errors',probe.errors.length===0);
  Object.freeze(probe.rows);L.trade(G,{});
  T.ok('observer write failures are explicit and preserve native behavior',probe.errors.length>0&&away===gear.gameplayHash(G.state));
 }finally{probe.restore();entropy.restore();}
 T.ok('all original method identities are restored',P.METHODS.every(k=>G[k]===originals[k]));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
