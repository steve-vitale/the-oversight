'use strict';
// Shared production harness. Prepare actors/terrain; never replace Game methods,
// attack definitions, legal move selection, damage, RNG or knowledge helpers.
const K=require('../godpath/lib');
const CASES=[['dustboar','Tusk Rake','melee'],['sunback','Tail Sweep','melee'],
 ['cliffhanger','Death Roll','direct'],['sanjun','Raking Claws','direct'],
 ['drumbelly_tanuki','Belly-Drum Thunderclap','burst'],
 ['drumbelly_tanuki',"Trickster's Feint",'direct']];
const covered=CASES.map(([id,name])=>id+'|'+name).concat('sweeps_week|Sweeps Pounce');
async function prove(ok){
 const G=await K.load({seed:Number(process.env.SEED||20261017),narration:true});
 const app=K.readSrc('src/js/app.js'),start=app.indexOf('  function tbAllTelegraphCells()'),end=app.indexOf('  // PLAYER-COINCIDENT TELEGRAPH ALERTS',start);
 if(start<0||end<start)throw Error('Missing actual UI telegraph collector');
 const collect=new Function('Game',app.slice(start,end)+'\nreturn tbAllTelegraphCells;')(G);
 function prepare(id){
  K.newRun(G);const s=G.state.scholar;s.integration=0;
  const m=K.fight(G,id,{px:4,py:4,mx:5,my:4,hp:500}),p=G.tbFighter('p');
  const d=G.genDetail(G.map.px,G.map.py);for(const row of d)row.fill('hall');
  // Isolated selected-turn probe, after actual entry. Reset only pending state
  // and first-turn fixture counter so the actual selector can choose the move.
  m.telegraph=null;m.moveTurnsUsed=0;G.log=[];
  return {m,p};
 }
 function select(id,name){
  // Seeded bounded selection, not a retry-until-hit damage test. A missing move
  // or broken legal selector fails; every selected move must pass all checks.
  for(let n=0;n<48;n++){const c=prepare(id);G.tbMonsterTurn(c.m);if(c.m.moveAtk?.name===name)return c;}
  throw Error('Actual selector never chose '+id+'|'+name);
 }
 for(const [id,name,type]of CASES)for(const moving of [false,true]){
  const {m,p}=select(id,name),label=id+' '+name+(moving?' moving':' standing'),tg=m.telegraph;
  ok(label+' declares the actual authored move',tg?.attackName===name&&tg.pattern.type===type);
  ok(label+' has a live one-turn warning despite absent/zero data windup',tg?.turnsLeft===1&&p.hp===500);
  ok(label+' stays unlearned before resolving',!G.tbPatternKnown(id,name));
  if(moving)ok(label+' accepts an actual player step out of adjacency',G.tbPlayerMove(3,4)&&p.mx===3&&p.my===4);
  G.tbMonsterTurn(m);
  ok(label+(moving&&type!=='direct'?' escapes the local area':' takes real damage'+(moving?' despite moving: direct tracks':'')),moving&&type!=='direct'?p.hp===500:p.hp<500);
  ok(label+' learns the actually resolved pattern',G.tbPatternKnown(id,name));
 }
 // Ambush is intentional, not an added silent exception to a metadata count.
 const {m,p}=select('sweeps_week','Sweeps Pounce');
 ok('actual tiger first-turn rush hits immediately without a pending warning',p.hp<500&&!m.telegraph);
 ok('instant rush is unavailable after the first selected turn',!G.tbMoveLegal(m,m.moveAtk,1,1));
 const hp=p.hp;G.tbMonsterTurn(m);
 ok('tiger followup is the authored warned Rerun',m.telegraph?.attackName==='Rerun'&&m.telegraph.turnsLeft===1&&p.hp===hp);
 // A learned local-area marker must follow the real app collector. The first
 // encounter is deliberately gated; posture/audio remain separate surfaces.
 const c=select('sunback','Tail Sweep');
 ok('actual UI hides the unlearned melee cell',collect().single.size===0);
 G.tbMonsterTurn(c.m);c.m.telegraph=null;c.m.mx=5;c.m.my=4;c.p.mx=4;c.p.my=4;G.tbMonsterTurn(c.m);
 ok('actual UI shows the learned adjacent melee cell',collect().single.has('4,4'));
 return covered;
}
module.exports={prove,covered};
