'use strict';
// Declared player strategies, not runtime balance or an NPC score bonus.
// Only current shown offers and held magic are eligible for preference.
const {merchant}=require('./livelihood');
function decide(G, offers, fallback, subclass) {
  const raw=G.state.scholar.abilities||[];
  const held=raw.map(a=>({id:typeof a==='string'?a:a.id,base:typeof a==='string'?a:a.evolvedFrom||a.id}));
  const def=id=>G.abilityDef(id)||{};
  const priority=id=>{const a=def(id);return a.lane==='magic'&&a.path==='miser'?100+(a.subclass===subclass?20:0)+(a.role==='payoff'?4:a.role==='enabler'?2:0):0;};
  const shown=offers.filter(o=>!held.some(h=>h.id===o.id)&&priority(o.id)>0);
  shown.sort((a,b)=>priority(b.id)-priority(a.id)); // stable sheet order breaks ties
  const full=raw.length>=G.abilitySlots();
  if(shown.length){
    const pick=shown[0].id;
    if(!full)return {pick};
    if(String(shown[0].src||'').startsWith('level_up:')){
      const replaceable=held.filter(h=>h.id!=='fusion_reactor');
      // First give up an off-path slot, choosing its weakest known incumbent.
      const other=replaceable.filter(h=>!priority(h.base)).map(h=>({...h,score:G.buildScore('player',h.id,{without:h.id})})).sort((a,b)=>a.score-b.score);
      if(other.length)return {pick,replace:other[0].id};
      const lowest=replaceable.slice().sort((a,b)=>priority(a.base)-priority(b.base))[0];
      if(lowest&&priority(pick)>priority(lowest.base))return {pick,replace:lowest.id};
      return {keep:true};
    }
  }
  // A committed strategy can decline a stronger generic pick rather than
  // dismantle its earned core. That opportunity cost is part of the test.
  const removing=held.find(h=>h.id===fallback.replace);
  if(full&&removing&&priority(removing.base)&&(!fallback.pick||!priority(fallback.pick)))return {keep:true};
  return fallback;
}
function policy(id,subclass){return Object.assign({},merchant,{
  id,desc:'merchant survival and public trade; committed on-sheet Miser/'+subclass+' preference',
  setup(G,ctx){ctx.offerIntent=(g,offers,fallback)=>decide(g,offers,fallback,subclass);return merchant.setup(G,ctx);},
});}
module.exports={decide,'merchant-hoarder':policy('merchant-hoarder','hoarder'),'merchant-dealer':policy('merchant-dealer','dealer')};
