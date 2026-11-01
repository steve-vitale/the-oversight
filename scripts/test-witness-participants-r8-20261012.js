'use strict';
// Prepared pool isolation: distant living participant, no nearby bystanders.
// Assert speaker and delivery, independent of which authored line pickFresh uses.
const K=require('./godpath/lib'),T=K.reporter('Combat participant witnesses');
(async()=>{
 const G=await K.load({seed:41});K.newRun(G);G.startCombat('hummice');
 T.ok('actual combat starts',!!G.tbfight);if(!G.tbfight)return T.done();
 const f=G.tbfight,v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
 T.ok('participant is a living canonical resident',!!vid);if(!vid)return T.done();
 f.fighters=f.fighters.filter(o=>o.kind!=='villager');
 const ally={key:'vAlly',kind:'villager',villagerId:vid,name:G.displayName(vid),hp:100,maxHp:100,alive:true,mx:4,my:4};f.fighters.push(ally);
 v.positions=v.positions||{};for(const rid of v.roster)if(rid!==G.villagerId)v.positions[rid]={mx:s.mx+50,my:s.my+50};
 T.ok('all residents including the participant are outside bystander range',Array.isArray(G.witnesses(6))&&G.witnesses(6).length===0);
 const said=[],say=G.say;G.say=function(line){said.push(String(line));return say.apply(this,arguments);};
 try{
  for(const brave of[-10,0,10]){G.repOf(vid).brave=brave;for(const moment of['kill','hurt'])for(let sample=0;sample<6;sample++){
   said.length=0;G.combatWitnessReact(moment);
   T.ok(moment+' brave'+brave+' sample'+sample+' has one actual participant voice',said.length===1&&said[0].startsWith(G.displayName(vid)+' '),JSON.stringify(said));
  }}
  for(const moment of['start','flee']){said.length=0;G.combatWitnessReact(moment);T.ok(moment+' cannot treat a distant participant as a bystander',said.length===0);}
  ally.alive=false;for(const moment of['kill','hurt']){said.length=0;G.combatWitnessReact(moment);T.ok(moment+' cannot borrow a dead participant voice',said.length===0);}
 }finally{G.say=say;}
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
