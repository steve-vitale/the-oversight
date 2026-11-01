'use strict';
const assert=require('assert/strict'),cp=require('child_process'),crypto=require('crypto'),K=require('./lib'),L=require('../policies/local-search');
const phoneFixture=require('../../evidence/2026-10-21/local-search-fixture-approach-r1.json');
const fixture=process.argv.at(-1)==='phone-reference'?phoneFixture:require('../../evidence/2026-10-21/search-fixture-approach-r2.json');
async function child(kind){
  const blobs=new Map(Object.entries(fixture.storage));global.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,setItem:(k,v)=>blobs.set(k,String(v)),removeItem:k=>blobs.delete(k)};
  const G=await K.load({seed:812});assert(G.load(fixture.key));const s=G.state.scholar,c=G.state.corpses.find(c=>c.id===fixture.corpseId),ctx={};
  if(s.knackChoices?.length)G.chooseKnack(s.knackChoices[0].id);
  G.state.corpses=[c];
  const before={kcal:s.kcal,tick:s.dayTicks,inventory:JSON.stringify(s.inventory),items:JSON.stringify(c.items)};
  if(kind==='reference'){
    for(const step of G.beginPathWalk(1,0))assert(G.pathStep(...step));
    for(let i=0;i<3;i++)G.corpseTakeItem(c.id,i);
  }else{
    if(kind==='underfoot'){c.mx=0;c.my=0;}
    if(kind==='remote')c.node={x:0,y:0};
    if(kind==='room')c.scene='hall';
    if(kind==='frame')c.battleGrid=12;
    if(kind==='buried')c.buried=true;
    if(kind==='covered'){const id=G.data.villagers.find(v=>v.id!==G.villagerId).id;G.state.village.positions[id]={mx:c.mx,my:c.my};}
    if(kind==='poor')s.kcal=0;
    if(kind==='busy')G.pendingEncounter={declared:true};
    if(kind==='unread'){
      const original=G.corpseAt,cache=new WeakMap();G.corpseAt=function(...args){return original.apply(this,args).map(body=>{
        if(!cache.has(body))cache.set(body,new Proxy(body,{get(target,key){if(key==='items')assert(G._corpseCheckRange(target,true),'Cargo inspected before actual approach');return target[key];}}));
        return cache.get(body);
      });};
    }
    if(['death','scene','pending','day','displaced'].includes(kind)){
      c.mx=4;G.playerTile().detail[0][2]='grass';G.playerTile().detail[0][3]='grass';
      const original=G.monsterTurn;let fired=false;G.monsterTurn=function(...args){const r=original.apply(this,args);if(!fired){fired=true;
        if(kind==='death')G.playerDeath('declared local-search walking fault');
        if(kind==='scene')G.map.px=3;
        if(kind==='pending')G.pendingEncounter={declared:true};
        if(kind==='day')s.day++;
        if(kind==='displaced')s.my=1;
      }return r;};
      const p=L.withLocalSearch({id:'declared',upkeep(G,ctx){ctx.baseCalls=(ctx.baseCalls||0)+1;}});p.upkeep(G,ctx);
      assert(fired);assert.equal(ctx.baseCalls||0,0,'Interrupted actor must not run base upkeep');
      assert.equal(ctx.localSearchReceipts[0].steps,1);assert.equal(ctx.localSearchReceipts[0].takes.length,0);
    }else{
      const r=L.searchLocal(G,ctx);
      if(['remote','room','frame','buried','busy','covered'].includes(kind)){
        assert.equal(ctx.localSearchCounters?.landedSteps||0,0);assert.equal(JSON.stringify(c.items),before.items);assert.equal(s.kcal,before.kcal);assert.equal(s.dayTicks,before.tick);
      }else if(kind==='poor'){assert.equal(r.reason,'walk-refused');assert.equal(s.kcal,0);assert.equal(s.dayTicks,before.tick);}
      else{
        assert.equal(ctx.localSearchReceipts[0].steps,kind==='underfoot'?0:kind==='phone-reference'?3:1);assert.equal(ctx.localSearchReceipts[0].takes.length,3);
        assert.equal(ctx.localSearchReceipts[0].takes[1].returnedTruthy,false,'Heavy cargo uses native refusal');
        assert.equal(c.items[0].units,0);assert.equal(c.items[1].units,1);
        const n=ctx.localSearchReceipts.length;L.searchLocal(G,ctx);assert.equal(ctx.localSearchReceipts.length,n,'Same body is not repeatedly searched by this bearer/day');
      }
    }
  }
  return{stateHash:crypto.createHash('sha256').update(JSON.stringify(G.state)).digest('hex'),position:[s.mx,s.my],world:[G.map.px,G.map.py],bearer:G.villagerId,
    kcal:s.kcal,tick:s.dayTicks,day:s.day,inventory:s.inventory,corpses:G.state.corpses,counters:ctx.localSearchCounters,receipts:ctx.localSearchReceipts};
}
if(process.argv.includes('--child'))child(process.argv.at(-1)).then(r=>console.log('@@LOCAL@@'+JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
  const T=K.reporter('local-search'),results={};
  for(const kind of ['reference','native','underfoot','poor','remote','room','frame','buried','busy','covered','unread','death','scene','pending','day','displaced','phone-reference']){
    const r=cp.spawnSync(process.execPath,[__filename,'--child',kind],{encoding:'utf8',maxBuffer:16*1024*1024});
    T.ok(kind+' uses native actions/guards',r.status===0,r.status!==0?r.stderr||r.stdout:null);
    if(r.status===0)results[kind]=JSON.parse(r.stdout.split('@@LOCAL@@').pop());
  }
  T.ok('controller and direct native approach/three-tap reference have exact full saved state',results.native?.stateHash===results.reference?.stateHash);
  T.ok('current controller reproduces the actual phone fixture reference',!!results['phone-reference']&&['position','world','bearer','kcal','tick','day','inventory','corpses'].every(k=>JSON.stringify(results['phone-reference'][k])===JSON.stringify(phoneFixture.controllerAfter[k])));
  T.done();
}
