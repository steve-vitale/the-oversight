#!/usr/bin/env node
'use strict';
// Shared bark pools: exercise real uprising AI and real case investigation.
// One shared Game per child. Capture actual selected templates/verbs through
// pass-through wrappers so empty logs or missed regex variants cannot pass.
const assert=require('assert/strict'),path=require('path'),{execFileSync}=require('child_process'),K=require('./godpath/lib');
const seed=Number(process.env.SEED||20261006);let checks=0;
function check(name,condition){assert(condition,name);checks++;console.log('PASS '+name);}
async function child(kind){
 const G=await K.load({seed,narration:true});const selections=[],turns=[],sayings=[];
 const say=G.say;G.say=function(...args){sayings.push(String(args[0]));return say.apply(this,args)};
 if(kind==='uprising'){
  // WRAPPERS BEFORE THE SCENARIO (r37): since the r36 uprising/betrayal
  // opening-turn softlock fix, the fight's opening AI turns run INSIDE
  // startUprising (before the first player turn). Installing the pickFresh /
  // tbHostileTurn wrappers after debugScenario misses those opening
  // selections while they still consume the fight-scoped 'humanRetaliate'
  // cycle — so the recorded 16-window starts mid-cycle and the no-repeat
  // assertion fails on a cycle-boundary artifact, not a real repeat.
  // Wrapping first keeps the observation window aligned with the cycle.
  let current=null;
  const pick=G.pickFresh;G.pickFresh=function(pool,key){const value=pick.call(this,pool,key);if(key==='humanRetaliate')selections.push({vid:current?.villagerId,key:current?.key,name:current?.name,template:value,poolSize:pool.length,at:sayings.length});return value;};
  const hostileTurn0=G.tbHostileTurn;G.tbHostileTurn=function(h){const at=selections.length;const p0=G.tbFighter('p');const hp=p0?p0.hp:0;current=h;try{return hostileTurn0.call(this,h)}finally{const p1=G.tbFighter('p');turns.push({vid:h.villagerId,barks:selections.length-at,damage:hp-(p1?p1.hp:0)});current=null;}};
  G.debugScenario('uprising');const f=G.tbfight;
  check('real debug uprising starts live combat',!!f&&!f.over);
  check('full runtime loads status movement dependency',typeof G.seMoveMod==='function');
  const hostiles=f.fighters.filter(x=>x.kind==='hostile'),p=G.tbFighter('p');
  check('real uprising has multiple actual attackers',hostiles.length>=2&&hostiles.every(x=>x.villagerId));
  // Prepared durability only: hold the same original bearer through one full
  //16-template cycle and its boundary. AI, positioning, damage and RNG stay real.
  p.hp=p.maxHp=1000;G.state.scholar.health=1000;const originalVid=G.villagerId;


  let calls=0;
  while(selections.length<17&&G.inCombat()&&calls++<40){
   if(!G.tbIsPlayerTurn()){G.tbAdvance();check('uprising AI advances to a live player turn',!G.inCombat()||G.tbIsPlayerTurn());}
   if(G.inCombat())G.tbPlayerEndTurn();
  }
  check('uprising actually reaches full attack-template cycle',selections.length>=17&&calls<40);
  const cycle=selections.slice(0,16);
  check('uprising current authored pool has16 substantive templates',cycle.every(x=>x.poolSize===16&&typeof x.template==='string'&&x.template.length>40));
  check('uprising templates are name-free before selection',cycle.every(x=>x.template.includes('{n}')));
  check('uprising several speakers actually strike',new Set(cycle.map(x=>x.vid)).size>=2&&cycle.every(x=>x.vid&&x.name));
  check('uprising attack selections pay real HP damage',turns.filter(t=>t.barks>0).every(t=>t.damage>0)&&p.hp<1000);
  check('uprising first cycle has no cross-speaker template repeat',new Set(cycle.map(x=>x.template)).size===16);
  check('uprising new cycle does not repeat its closing line',selections[16].template!==selections[15].template);
  check('uprising selected templates reach actual narration',cycle.every(x=>sayings.slice(x.at).some(line=>line==='🔪 '+x.template.replace('{n}',()=>x.name).replace('{t}',()=> 'you'))));
  check('uprising cycle preserves original living bearer',G.villagerId===originalVid&&p.alive&&p.hp>0&&!G.over);
  console.log('BARK_FIXTURE_RESULT '+JSON.stringify({kind,seed,checks,calls,playerHp:p.hp,selections,turns}));
 }else{
  G.debugScenario('mootAccused');const c=G.betrayalState().cases.find(x=>x.playerRole==='accused');
  check('real accused scenario opens an actual case',!!c&&!!G.getCase(c.id));
  // Prepare a case with no available evidence: every speaker must enter the
  // actual nothingPool path. No case reader or investigation verb is replaced.
  c.knownAccusers=c.accuser?[c.accuser]:[];c.bribes=[];c.inconsistencies=[];c.witnesses=[];c.playerKnownWitnesses=G.caseWitnesses(c).slice();c.askedHeard={};delete c.nothingOrder;delete c.nothingIdx;
  const ids=G.npcIds().slice(0,8);check('eight real NPC question subjects exist',ids.length===8);
  const lines=[];
  for(const vid of ids){const at=sayings.length,r=G.askAboutCase(c.id,vid);check('question returns actual fallback for '+vid,!!r&&r.reveal===null&&typeof r.line==='string');check('fallback is narrated and marked asked for '+vid,sayings.slice(at).includes(r.line)&&c.askedHeard[vid]===true);lines.push({vid,name:G.whoTag(vid),line:r.line});}
  check('case rotates every authored fallback once',c.nothingIdx===8&&c.nothingOrder.length===8&&new Set(c.nothingOrder).size===8);
  const normalized=lines.map(r=>r.line.split(r.name).join('{speaker}'));
  check('all eight actual fallback bodies differ across speakers',new Set(normalized).size===8);
  const at=sayings.length,idx=c.nothingIdx,repeated=G.askAboutCase(c.id,ids[0]);
  check('repeat question is refused without narration or consuming pool',repeated===null&&sayings.length===at&&c.nothingIdx===idx);
  console.log('BARK_FIXTURE_RESULT '+JSON.stringify({kind,seed,checks,lines,normalized,order:c.nothingOrder,index:c.nothingIdx}));
 }
 console.log(`shared-barks ${kind}: ${checks} pass, 0 fail`);
}
(async()=>{
 if(process.argv[2]==='--child')return child(process.argv[3]);
 for(const kind of ['uprising','case']){const output=execFileSync(process.execPath,[__filename,'--child',kind],{cwd:path.join(__dirname,'..'),env:process.env,encoding:'utf8',maxBuffer:2e6});process.stdout.write(output);const rows=output.split('\n').filter(x=>x.startsWith('BARK_FIXTURE_RESULT ')).map(x=>JSON.parse(x.slice(20)));assert(rows.length===1&&rows[0].kind===kind&&rows[0].checks>0);}
 console.log('ALL PASS: two fresh shared Games');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
