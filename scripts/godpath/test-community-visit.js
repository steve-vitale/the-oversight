'use strict';
// Prepared actual-engine visits; each case uses a fresh seeded shared harness.
const assert=require('assert/strict'),cp=require('child_process'),fs=require('fs');
const removed=process.argv.includes('--removed-dispatch');
if(removed){
  const read=fs.readFileSync;
  fs.readFileSync=function(file,...args){let value=read.call(this,file,...args);
    if(String(file).replace(/\\/g,'/').endsWith('/policies/capable.js')){
      const text=String(value),next=text.replace('if (communityVisit.visitPrerequisite(Game, ctx)) return;','/* actual village prerequisite dispatch removed */');
      assert.notEqual(next,text);value=typeof value==='string'?next:Buffer.from(next);
    }return value;
  };
}
const K=require('./lib'),V=require('../policies/community-visit');
async function run(kind){
  // Loot/world generation changed the old seed7 camp placement. Seed2
  // retains the same real three-node north camp; no village is injected.
  const G=await K.load({seed:2});K.newRun(G);
  const s=G.state.scholar;s.day=35;s.dayTicks=0;s.health=100;s.kcal=2400;s.hydration=90;
  s.water=[{liters:1,quality:'clean'}];s.insideHaven=false;
  const target=G.state.otherVillages.find(v=>v.x===4&&v.y===1);
  assert(target,'canonical seeded nearby village required');
  target.rumored=true;target.opinion=0;target.trust=20;
  // Preparing a known camp is a real visit in Muse's knower ledger. The
  // fog contrast must not accidentally prepare that visit first.
  if(kind!=='unknown')G.catchUpSim(target);
  const ctx={communityProfile:'merchant',communityRoad:'trade'},crossings=[];
  const travel=G.travelTo;
  G.travelTo=function(x,y,...args){const edge=this.edgeExit(this.state.scholar.mx,this.state.scholar.my);
    assert(edge,'crossing must start from a real grid exit');
    assert.equal(x,this.map.px+edge.dx);assert.equal(y,this.map.py+edge.dy);
    assert(args.every(a=>!a),'no force or combat override');crossings.push([x,y]);
    return travel.call(this,x,y,...args);
  };
  if(kind==='low-health')s.health=30;
  if(kind==='hungry')s.kcal=500;
  if(kind==='thirsty')s.hydration=10;
  if(kind==='waterless')s.water=[];
  if(kind==='dirty-water')s.water[0].quality='dirty';
  if(kind==='late')s.dayTicks=300;
  if(kind==='unknown'){target.rumored=false;target.generated=false;assert(!G.knowsVillage(target));}
  if(kind==='studied')target._codexOpinionGiven=true;
  if(kind==='ready')target.opinion=10;
  if(kind==='exile')s.exiled=true;
  if(kind==='pending')G.state.pendingAccord={prepared:true};
  if(kind==='legacy')process.env.COMMUNITY_PLANNER='legacy';
  if(kind==='reference')process.env.COMMUNITY_VISITS='off';
  if(kind==='low-trust')target.trust=-100;
  // The side is where the walker comes FROM. Haven's immediate approach
  // is intentionally cleared by the engine, so block the following node.
  if(kind==='blocked')G.tileAt(4,2).blockFrom={dx:0,dy:1,type:'fallen_tree'};
  if(kind==='combat')K.fight(G,'hushwolf');
  let after;
  if(kind==='interruption'){
    const step=G.pathStep;G.pathStep=function(...args){const result=step.apply(this,args);this.pendingEncounter={prepared:true};after={tick:s.dayTicks,kcal:s.kcal,x:s.mx,y:s.my};return result;};
  }
  // runDays calls upkeep before spending each part, but daily only after
  // three waits. A dawn-only decision must be wired into actual upkeep.
  if(kind==='dispatch')require('../policies/capable').capable.upkeep(G,ctx);
  else V.visitPrerequisite(G,ctx);
  const studies=(ctx.communityVisits||[]).filter(r=>r.action==='study');
  if(['trip','dispatch'].includes(kind)){
    assert.equal(studies.length,1,'primary actor must complete real study');
    assert(studies[0].newlyLinked&&studies[0].knowledgeChanged);
    assert.equal(studies[0].tickAfter-studies[0].tickBefore,128);
    assert.equal(studies[0].opinionAfter-studies[0].opinionBefore,3);
    assert.deepEqual([G.map.px,G.map.py],[4,4],JSON.stringify({visit:ctx.communityVisit,events:ctx.communityVisits,blocked:ctx.communityVisitBlocked,day:s.day,tick:s.dayTicks,kcal:s.kcal,pending:G.pendingEncounter}));assert.equal(ctx.communityVisit,null);
    assert.equal(crossings.length,4);assert(ctx.publicTravelCounters.landedSteps>0);
    assert(s.kcal<2400&&s.dayTicks>128,'real walking costs accompany paid study');
    assert(s.linkedCodices.includes(target.id));
    const count=ctx.communityVisits.length;V.visitPrerequisite(G,ctx);
    assert.equal(ctx.communityVisits.length,count,'honored codex must not trigger empty repeat outings');
  }else if(kind==='low-trust'){
    assert.equal(studies.length,0,'no direct study through an unavailable phone action');
    assert(ctx.communityVisits.some(r=>r.action==='talk'&&r.trustAfter>r.trustBefore));
    if(G.inCombat()){
      // The current real seed opens combat on the return. Never fake a
      // completed trip or privately finish that fight to satisfy this test.
      const receipt=ctx.publicTravelReceipts.at(-1);
      assert.equal(receipt.reason,'interrupted');assert.equal(ctx.communityVisit.phase,'return');
      assert.equal(ctx.communityVisit.owner,G.state.runKey+':'+G.villagerId);
      assert.deepEqual([G.map.px,G.map.py],receipt.after.world);assert.equal(s.dayTicks,receipt.after.tick);
      assert(!s.linkedCodices?.includes(target.id));
    }else{assert.deepEqual([G.map.px,G.map.py],[4,4]);assert.equal(ctx.communityVisit,null);}
  }else if(kind==='blocked'){
    assert.equal(studies.length,0);assert.equal(crossings.length,2,'one real outward crossing and one real return');
    assert.equal(ctx.communityVisit,null);assert.equal(ctx.communityVisitBlocked,'blocked');
    assert(!s.linkedCodices?.includes(target.id));
  }else if(kind==='interruption'){
    assert(after);assert.equal(studies.length,0);assert.equal(crossings.length,0);
    assert.deepEqual({tick:s.dayTicks,kcal:s.kcal,x:s.mx,y:s.my},after);
    assert(ctx.communityVisit,'interrupted trip retains an actual unfinished plan');
  }else{
    assert.equal(studies.length,0);assert.equal(crossings.length,0);assert(!ctx.communityVisit);
  }
  assert.deepEqual(ctx.capErrors||[],[]);
  console.log('Visit case '+kind+' passed');
}
(async()=>{
  if(process.argv[2]&&!process.argv[2].startsWith('--'))return run(process.argv[2]);
  const T=K.reporter('shared community prerequisite visits');
  for(const kind of ['trip','dispatch','low-health','hungry','thirsty','waterless','dirty-water','late','unknown','studied','ready','exile','pending','legacy','reference','low-trust','blocked','combat','interruption']){
    const child=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',windowsHide:true,timeout:45000,maxBuffer:4e6});
    T.ok(kind+' actual-engine prerequisite contrast',child.status===0,(child.stdout+child.stderr).slice(-1800));
  }
  const control=cp.spawnSync(process.execPath,[__filename,'dispatch','--removed-dispatch'],{encoding:'utf8',windowsHide:true,timeout:45000,maxBuffer:4e6});
  T.ok('removing actual main-policy dispatch rejects real study',control.status!==0&&control.stderr.includes('primary actor must complete real study'));
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
