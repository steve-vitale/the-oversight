'use strict';
// Observe evaluations the game already makes. Never ask the brain to score
// another option: NPC scoring can plan a target and consume world randomness.
function install(g, {limit=5000}={}) {
  const decisions=[], latest=new Map(), frames=[], originals={};let dropped=0;
  const signature=()=>JSON.stringify([g.villagerId,g.state.scholar.day,g.state.scholar.abilityChoices||[]]);
  const actor=who=>who==='player'||who===g.villagerId?g.villagerId:who;
  const role=who=>actor(who)===g.villagerId?'player':'npc';
  const held=who=>{
    const ids=role(who)==='player'?g.state.scholar.abilities:(g.state.village.npcAbilities||{})[actor(who)];
    return (ids||[]).map(a=>typeof a==='string'?a:a.evolvedFrom||a.id);
  };
  const record=e=>{if(decisions.length<limit)decisions.push(e);else dropped++;};
  const stamp=(who,offers)=>({day:g.state.scholar.day,person:actor(who),role:role(who),offers:offers.slice(),held:held(who)});
  function wrap(name,fn){if(typeof g[name]!=='function')throw Error('Missing choice caller '+name);originals[name]=g[name];g[name]=fn(originals[name]);}
  wrap('buildScore',original=>function(who,id,opts){
    const value=original.apply(this,arguments),entry={id,onSheet:!!(opts&&opts.onSheet),without:opts&&opts.without||null,score:value};
    if(frames.length)frames[frames.length-1].scores.push(entry);
    if(entry.onSheet&&role(who)==='player'){const key=actor(who),sig=signature();if(latest.get(key)?.signature!==sig)latest.set(key,{signature:sig,scores:new Map()});latest.get(key).scores.set(id,entry);}
    return value;
  });
  wrap('buildDecide',original=>function(who,ids){
    const e={source:'buildDecide',...stamp(who,ids),scores:[]};frames.push(e);
    let result;try{result=original.apply(this,arguments);}finally{frames.pop();}
    e.result={...result};record(e);return result;
  });
  for(const name of ['chooseAbility','keepAbilities'])wrap(name,original=>function(id){
    const choices=this.state.scholar.abilityChoices||[];
    const cached=latest.get(actor('player')),scores=cached?.signature===signature()?cached.scores:new Map();
    const e=choices.length&&String(choices[0].src||'').startsWith('level_up:')?{source:name,...stamp('player',choices.map(c=>c.id)),scores:choices.map(c=>scores.get(c.id)).filter(Boolean),result:{pick:name==='chooseAbility'?id:null,keep:name==='keepAbilities',replace:arguments[1]||null}}:null;
    const result=original.apply(this,arguments);
    if(e){e.returned=result===undefined?'undefined':result===null?'null':typeof result==='boolean'?result:typeof result;record(e);}
    return result;
  });
  return {decisions,get dropped(){return dropped;},restore(){for(const[name,fn]of Object.entries(originals))g[name]=fn;}};
}
module.exports={install};
