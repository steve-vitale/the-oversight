'use strict';
// Real field-engine attacks carry their selected light component into god hooks.
const K=require('./lib'),T=K.reporter('god-field-light');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||7)}),GP=globalThis.Scattering.Godpath;let s,v,id;
 function fresh(god){G.tbfight=null;G.over=false;G.won=false;K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;G.state.systemArrived=true;id=v.roster.find(x=>x!==G.villagerId&&G.npcAge(x)>=18);v.npcAbilities={[id]:[]};v.npcSkills={[id]:[]};v.npcSynergies={[id]:[]};v.npcGodhood={[id]:{active:[god],recognized:{[god]:85}}};v.health={[id]:100};v.pantry=[];G.stockPantry(G.villageDailyNeed()*5,'Prepared stores');G.npcNeeds(id).hunger=0;const p=G.getPerson(id);p.items=[];p.equipped={};p.backgroundAbilities=[];}
 function fight(god,kind){fresh(god);const seen=[],incoming=[],fa=GP.fieldAct,fi=GP.fieldIncoming;
  GP.fieldAct=function(a,c){seen.push({taken:c.taken,beam:c.beamTaken,hp:c.vHp,power:a.power||1});return fa.apply(this,arguments);};
  GP.fieldIncoming=function(a,n,c){const out=fi.apply(this,arguments);incoming.push({input:n,beam:c.beamDamage,output:out,attack:c.attack?.name});return out;};
  const attack={name:kind==='physical'?'Prepared claw':'Prepared beam',damage:kind==='mixed'?[1,1]:[20,20],accuracy:1,pattern:{type:kind==='physical'?'melee':'beam'}};
  // The default is physical but the selected kit attack is light: the engine
  // must identify the actual attack, not classify the whole species.
  const def={id:kind==='mixed'?'gallowdeer':'prepared_light_probe',wave:1,hp:kind==='mixed'?[40,40]:[10000,10000],pack:1,speed:99,attack:{name:'Claw default',damage:[20,20],pattern:{type:'melee'}},attacks:[attack,{...attack,name:attack.name+' second'}],behavior:'territorial'};
  let rec;try{rec=G.fieldFight(id,def,null,{intent:'fight',rng:()=>0.5});}finally{GP.fieldAct=fa;GP.fieldIncoming=fi;}
  return {rec,seen,incoming,events:K.teleEvents(G,'god_verb').map(x=>x.data||x)};
 }
 let r=fight('one_person_army','beam');
 T.ok('actual selected beam reaches fieldIncoming as light',r.incoming.length>0&&r.incoming.every(x=>x.beam===20&&/beam/.test(x.attack)));
 T.ok('pure beam wounds are wholly excluded from the landed Army pool',r.seen.some(x=>x.taken>0)&&r.seen.every(x=>x.taken===x.beam)&&!r.events.some(x=>x.verb==='turn_the_pain'));
 r=fight('one_person_army','physical');
 T.ok('physical wounds still power an actual paid field Army strike',r.seen.some(x=>x.taken>0&&x.beam===0)&&r.events.some(x=>x.verb==='turn_the_pain'&&x.dealt>0)&&G.npcNeeds(id).hunger>0);
 r=fight('one_person_army','mixed');
 const pain=r.events.find(x=>x.verb==='turn_the_pain'),context=r.seen.find(x=>x.taken-x.beam>=35);
 T.ok('deer beam and antlers remain distinct landed wounds',r.seen.some(x=>x.taken>x.beam&&x.beam>0));
 T.ok('mixed deer pain returns only its physical wounds',!!pain&&!!context&&pain.dealt===Math.round((context.taken-context.beam)*context.power)&&pain.dealt<Math.round(context.taken*context.power),JSON.stringify({pain,context,seen:r.seen,log:r.rec.log}));
 r=fight('market_god','beam');
 T.ok('pure beams pass through the actual field Gilded Guard',r.incoming.length>0&&r.incoming.every(x=>x.output===x.input)&&r.rec.log.some(x=>/Wealth does not stop a beam/.test(x)));
 r=fight('market_god','physical');
 T.ok('actual physical field blows can still shatter coins',r.incoming.some(x=>x.output<x.input&&x.beam===0));
 r=fight('market_god','mixed');
 T.ok('mixed antlers can shatter coins while their light passes through',r.incoming.some(x=>x.output<x.input&&x.beam>0)&&r.incoming.every(x=>x.output>=x.beam));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

