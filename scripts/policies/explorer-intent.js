'use strict';
// Declared strategies, not Game/NPC bonuses. Frozen experiments change only
// this explicit strategy mode; default capable and every Game rule stay.
const {capable,chooseOffers}=require('./capable'),C=require('./competent');
const STRATEGY = 'both'; // control | build | both (sequential strategy contrasts)
function chooseOpening(G,ctx){
 const s=G.state.scholar;if(G.over||s.knackChosen)return;
 const choices=G.liveKnackChoices();if(!choices.length)return;
 const signature=G.villagerId+':'+s.day+':'+(s.abilities||[]).length+':'+G.abilitySlots();
 if(ctx.explorerOpeningAttempt===signature)return;
 ctx.explorerOpeningAttempt=signature;
 let best=choices[0],score=-Infinity;
 for(const c of choices){const n=G.buildScore('player',c.id,{onSheet:true});if(Number.isFinite(n)&&n>score){score=n;best=c;}}
 const fallback={pick:best.id},requested=typeof ctx.offerIntent==='function'?ctx.offerIntent(G,choices,fallback):fallback;
 const pick=choices.find(c=>c.id===requested?.pick)||best;
 if(requested?.pick&&requested.pick!==pick.id)console.warn('Explorer opening requested an unshown knack: '+requested.pick);
 G.chooseKnack(pick.id); // Actual first slot/refusal; never write chosen flags.
 ctx.explorerOpening={person:G.villagerId,day:s.day,offered:choices.map(c=>c.id),selected:pick.id,chosen:!!s.knackChosen};
}
function decide(G,offers,fallback,subclass){
 const held=(G.state.scholar.abilities||[]).map(a=>({id:typeof a==='string'?a:a.id,base:typeof a==='string'?a:a.evolvedFrom||a.id}));
 const priority=id=>{const a=G.abilityDef(id)||{};return a.lane==='magic'&&a.path==='explorer'?100+(a.subclass===subclass?20:0)+(a.role==='payoff'?4:a.role==='enabler'?2:0):0;};
 const shown=offers.filter(o=>!held.some(h=>h.id===o.id)&&priority(o.id)>0).sort((a,b)=>priority(b.id)-priority(a.id));
 const full=held.length>=G.abilitySlots();
 if(shown.length){const pick=shown[0].id;if(!full)return{pick};
  if(String(shown[0].src||'').startsWith('level_up:')){
   const replaceable=held.filter(h=>h.id!=='fusion_reactor');
   const other=replaceable.filter(h=>!priority(h.base)).map(h=>({...h,score:G.buildScore('player',h.id,{without:h.id})})).sort((a,b)=>a.score-b.score);
   if(other.length)return{pick,replace:other[0].id};
   const lowest=replaceable.slice().sort((a,b)=>priority(a.base)-priority(b.base))[0];
   return lowest&&priority(pick)>priority(lowest.base)?{pick,replace:lowest.id}:{keep:true};
  }
 }
 const removing=held.find(h=>h.id===fallback.replace);
 return full&&removing&&priority(removing.base)&&(!fallback.pick||!priority(fallback.pick))?{keep:true}:fallback;
}
function available(G){const s=G.state.scholar;return !G.over&&!G.tbfight&&!G.pendingEncounter&&!G.state.activeContest&&G.atCamp()&&s.health>=60&&s.kcal>=1200&&(s.dayTicks||0)<=320&&!s.abilityChoices&&!s.knackChoices&&!s.relicChoices;}
function fieldStudy(G,ctx){
 if(!available(G))return;
 const s=G.state.scholar,person=G.villagerId,day=s.day;
 let b=ctx.explorerStudy;if(!b||b.person!==person)b=ctx.explorerStudy={person,attempts:0,done:false};
 const prior=G.godpathDeedStatus('player','all_seeing');
 if(prior?.pending||prior?.observed)b.done=true; // Their own lived work already exists.
 if(b.done||b.attempts>=3||b.day===day)return;
 b.day=day;b.attempts++;
 const stillHere=()=>available(G)&&G.villagerId===person&&s.day===day;
 // Opaque bags are selected as bags, never by their hidden species or safety.
 const target=()=>{for(const container of [s.prepStash||[],s.inventory||[]]){const index=container.findIndex(it=>it?.lump&&!it.bonded&&(it.units||0)>0&&!G.isSpoiled(it));if(index>=0)return{container,index};}return null;};
 if(!target())C.forageTripSeedFirst(G,ctx);
 if(!stillHere())return;
 const bag=target();if(!bag)return;
 G.testCautiously(bag.index,{},bag.container); // Real native Pack/counter verb.
 ctx.explorerTests=(ctx.explorerTests||0)+1;
 if(G.villagerId!==person||G.over||s.day!==day)return;
 const own=G.godpathDeedStatus('player','all_seeing');
 const named=own?.pending||own?.observed;
 if(!named)return;
 b.done=true;ctx.explorerNamed=(ctx.explorerNamed||0)+1;
 // Use the same public conversation menu/answers as capable, with no peek
 // at anyone's private plant knowledge and no assumed teaching success.
 if(!stillHere()||!G.playerAtHaven())return; // Residents must actually share this camp.
 const v=G.state.village;
 for(const id of [...new Set(v.roster||[])].filter(id=>{const p=G.getPerson(id);return id!==person&&!v.away?.[id]&&p&&p.id===id&&!p.dead;}).slice(0,2)){
  if(!stillHere())break;C.holdConversation(G,ctx,id);ctx.explorerConversations=(ctx.explorerConversations||0)+1;
 }
}
function studySafely(G,ctx){try{fieldStudy(G,ctx);}catch(e){const errors=ctx.explorerErrors||(ctx.explorerErrors=[]);if(errors.length<30)errors.push(e.message);console.warn('Explorer fieldwork: '+e.message);}}
function makePolicy(id,subclass,mode=STRATEGY){return{...capable,id,desc:`capable with explicit live opening choice and declared Explorer/${subclass}; strategy=${mode}; real bounded empirical fieldwork`,setup(G,ctx){capable.setup?.(G,ctx);if(mode!=='control')ctx.offerIntent=(g,offers,fallback)=>decide(g,offers,fallback,subclass);chooseOpening(G,ctx);},daily(G,ctx){chooseOpening(G,ctx);if(mode==='both'){chooseOffers(G,ctx);studySafely(G,ctx);}return capable.daily(G,ctx);},upkeep(G,ctx){chooseOpening(G,ctx);if(mode==='both')studySafely(G,ctx);return capable.upkeep?.(G,ctx);}};}
module.exports={decide,fieldStudy,chooseOpening,makePolicy,'explorer-seer':makePolicy('explorer-seer','seer'),'explorer-cartographer':makePolicy('explorer-cartographer','cartographer')};
