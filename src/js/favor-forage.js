// @ontology
// system: favor-forage
// description: Joint foraging outings for a promised pantry run: travel together, forage the same patch, split the haul, talk, bring both shares home.
// provides:
//   - forageFavorCompanions() -> living temporary outing companions for this bearer
//   - forageFavorWaiting(vid) -> requester waiting at home for the agreed dawn
//   - forageFavorOpening(vid) -> structural, current-phase joint-work opening
//   - forageFavorAction(vid, favor, ending) -> pure readiness and progress
//   - performForageFavor(vid, favor, ending) -> checked departure, joint forage, or shared delivery
//   - forageFavorTalkReady(vid, favor) -> whether trail talk is available
//   - performForageTalk(vid, favor) -> a spoken trail exchange during the outing
//   - migrateForageFavors() -> give previously unplayable saved promises a fair window once
// consumes:
//   - state.village
//   - state.scholar
//   - doAction('forage')
//   - depositPantryPieces(v, item, pieceKcal)
//   - checkPromises(kind, vid, opts)
//   - travelingWith()
//   - placePartyAtPlayer()
// rules:
//   - actual_joint_deed: only food actually gathered together and delivered at home keeps the favor (code: performForageFavor, game.js checkPromises)
//   - shared_not_solo: one solo-rule forage press is split about half and half; the player's pack never keeps the whole sweep (code: performForageFavor)
//   - known_food_only_split: plants nobody knows stay lumped in the player's bag and are never split as food; wood and crafting bits stay with the player (code: performForageFavor)
//   - temporary_companion: no permanent party membership or successor escort (code: forageFavorCompanions, travelingWith wrapper)
//   - no_gate_change: this module sets no deed, scale, stage, readiness, or table price (code: this file, convo-wants.js dispatch only)
(function(){
 'use strict';
 const G=(globalThis.Scattering||{}).Game;if(!G)return;
 const liveRun=f=>f?.kind==='forage_help'&&f.forageRun&&!f.forageRun.returned;
 const haulKcal=xs=>(xs||[]).reduce((n,i)=>n+(Number(i.kcalEach)||0)*(Number(i.units)||0),0);
 const haulBits=xs=>(xs||[]).filter(i=>(i.units||0)>0).map(i=>(i.units||0)+'× '+(i.name||'foraged food')).join(', ');
 function homePoint(g){
  const v=g.state.village;
  if(Number.isFinite(v.px)&&Number.isFinite(v.py))return{x:v.px,y:v.py};
  for(let y=0;y<g.map.tiles.length;y++)for(let x=0;x<g.map.tiles[y].length;x++)if(g.map.tiles[y][x].type==='haven')return{x,y};
  return{x:4,y:4};
 }
 function sameFields(a,b){
  return a&&b&&a.name===b.name&&(a.kcalEach||0)===(b.kcalEach||0)&&
   (a.plantId||null)===(b.plantId||null)&&(a.spoilDay||null)===(b.spoilDay||null)&&
   (a.edible!==false)===(b.edible!==false);
 }
 function adjacent(g,vid){
  const v=g.state.village,s=g.state.scholar,origin=homePoint(g);
  const node=v.nodePos?.[vid]||{nx:origin.x,ny:origin.y},pos=v.positions?.[vid];
  const home=g.map.px===origin.x&&g.map.py===origin.y;
  if(home&&node.nx===origin.x&&node.ny===origin.y&&(v.npcInside?.[vid]!==false)!==(s.insideHaven!==false))return{ok:false,reason:v.npcInside?.[vid]!==false?'Your partner is inside the Haven hall. Go through the door to meet them.':'Your partner is on the Haven grounds. Step outside to meet them.'};
  if(v.away?.[vid]||node.nx!==g.map.px||node.ny!==g.map.py||!pos||
     (home&&(v.npcInside?.[vid]!==false)!==(s.insideHaven!==false))||
     ![pos.mx,pos.my,s.mx,s.my].every(Number.isFinite)||Math.max(Math.abs(pos.mx-s.mx),Math.abs(pos.my-s.my))>1)
   return{ok:false,reason:'Move next to your partner, on the same side of the Haven door.'};
  return{ok:true};
 }
 function talkLine(g,vid,r){
  const first=(()=>{try{return g.displayName(vid).split(' ')[0];}catch(e){return 'They';}})();
  const temp=(()=>{try{return g.npcTemper?g.npcTemper(vid):'steady';}catch(e){return 'steady';}})();
  const pk=haulKcal(r.partnerHaul),total=haulKcal(r.playerHaul)+pk;
  const n=(r.talkCount||0);
  const pools={
   bold:[`"${first} grins. Good ground — keep your eyes up, the good stuff hides."`,
     `"${total>0?('We are carrying '+total+' kcal between us already. ') : ''}Not bad for two pairs of hands."`],
   warm:[`"This is the part I like. Just us and the green."`,
     `"${pk>0?('I have got '+pk+' kcal in my pack so far. ') : ''}Tell me what you see that I missed."`],
   cautious:[`"Slow. The patch gives more when you do not rush it."`,
     `"Keep together out here. The green is generous; the rest of the wild is not."`],
  };
  const pool=pools[temp]||[`"Two pairs of eyes, twice the ground. That was the deal, and it is working."`,
    `"${total>0?('Between us we are carrying '+total+' kcal. ') : ''}Onward — there is more green ahead."`];
  return pool[n%pool.length];
 }
 Object.assign(G,{
  forageFavorCompanions(){
   const v=this.state.village;
   return Object.values(v.favorLedger||{}).filter(f=>liveRun(f)&&f.forageRun.bearer===this.villagerId&&f.vid!==this.villagerId&&
    (v.roster||[]).includes(f.vid)&&this.getPerson(f.vid)&&!this.getPerson(f.vid).dead&&!v.away?.[f.vid]).map(f=>f.vid);
  },
  forageFavorWaiting(vid){
   const v=this.state.village,f=v.favorLedger?.[vid],p=v.promises?.[vid],s=this.state.scholar;
   if(f?.kind!=='forage_help'||f.forageRun||p?.favorId!==f.id||p.kept||p.maker!==this.villagerId||this.dayPart!==0)return false;
   const home=homePoint(this),node=v.nodePos?.[vid]||{nx:home.x,ny:home.y};
   return !!(s.day>=(f.meetDay??((f.promisedDay??f.askedDay)+1))&&s.day<=this.promiseDueDay(p)&&
    node.nx===home.x&&node.ny===home.y&&!v.away?.[vid]);
  },
  forageFavorOpening(vid){
   if(!this.forageFavorCompanions().includes(vid)||this.state.activeContest||this.tableActive?.())return null;
   const f=this.convoGetFavor(vid),r=f.forageRun,at=homePoint(this),home=this.map.px===at.x&&this.map.py===at.y;
   const total=haulKcal(r.playerHaul)+haulKcal(r.partnerHaul);
   const line=f.state==='broken'?'\"We missed the promise. We still need to get home and unload what we have.\"':
    home&&total>0?'\"We are home, both packs full. Let us get this into the pantry.\"':
    total>0?'\"Packs filling. Let us keep working, then carry it home together.\"':
    home?'\"Ready to forage? The pantry is counting on us.\"':'\"Keep together. We still have the outing to finish.\"';
   return{line,thread:'want',wantId:'repay',structural:true};
  },
  migrateForageFavors(){
   const v=this.state.village,day=this.state.scholar.day||0;
   for(const [vid,p]of Object.entries(v.promises||{})){
    const f=v.favorLedger?.[vid];
    if(p.kept||p.forageVersion||!f||f.kind!=='forage_help'||p.favorId!==f.id)continue;
    // Those promises previously had no executable action and no deadline
    // penalty. Enabling the job must not retroactively break an old word.
    p.forageVersion=1;p.favorDeadline=Math.max(this.promiseDueDay(p)||0,day+2);
    f.deadline=p.favorDeadline;f.meetDay=day+1;this.journalFavorPromise?.(vid,p);
   }
  },
  forageFavorAction(vid,f,ending){
   const block=reason=>({ready:false,reason}),v=this.state.village,s=this.state.scholar,r=f?.forageRun;
   if(!f||f.kind!=='forage_help'||f.vid!==vid)return block('There is no forage request to act on.');
   if(r?.returned||(!liveRun(f)&&!['asked','promised'].includes(f.state)))return block('This forage request is closed.');
   if(this.over||s.dead)return block('This life has ended.');
   if(this.inCombat&&this.inCombat())return block('Finish the fight before foraging together.');
   if(this.state.activeContest||this.tableActive?.())return block('Finish the current event before foraging together.');
   if(!(v.roster||[]).includes(vid)||vid===this.villagerId||!this.getPerson(vid)||this.getPerson(vid).dead)return block('Your partner is no longer available for this outing.');
   if(r&&r.bearer!==this.villagerId)return block('That outing belonged to the previous bearer. It is not your promise.');
   const adj=adjacent(this,vid);if(!adj.ok)return block(adj.reason);
   if(!r){
    const p=v.promises?.[vid];
    if(!p||p.favorId!==f.id||p.kept)return block('Accept the forage request first. Meet at Haven at dawn on the following day.');
    if(p.maker&&p.maker!==this.villagerId)return block('That forage promise belonged to the previous bearer. It is not your promise.');
    const due=this.promiseDueDay(p);
    if(due!=null&&(s.day||0)>due)return block('The deadline has passed. This outing can no longer keep the promise.');
    const meet=f.meetDay??((f.promisedDay??f.askedDay)+1);
    if(s.day<meet)return block('Meet at Haven at dawn on day '+meet+'. Two pairs of eyes, twice the ground.');
    const home=homePoint(this);
    if(!(this.map.px===home.x&&this.map.py===home.y))return block('Return to Haven with your partner to set out together.');
    if(this.dayPart!==0)return block('Set out at dawn. Return before the deadline.');
    const other=this.forageFavorCompanions();if(other.some(id=>id!==vid))return block('Finish your current outing before starting another.');
    return{ready:true,action:'forage_start',label:'Set out together to forage',reason:'Walk out together and work the green ground. One real forage press, split about half and half, both shares carried home to the pantry.'};
   }
   const playerKcal=haulKcal(r.playerHaul),partnerKcal=haulKcal(r.partnerHaul),total=playerKcal+partnerKcal;
   const progress='You carry '+playerKcal+' kcal; your partner carries '+partnerKcal+' kcal. ';
   if(ending)return (this.map.px===homePoint(this).x&&this.map.py===homePoint(this).y)
    ?{ready:true,action:'forage_end',reason:progress+'Unload what you have and end this outing. An unfinished promise will be broken.'}
    :block('Return to Haven together to unload and end this outing.');
   const home=homePoint(this),atHome=this.map.px===home.x&&this.map.py===home.y;
   if(atHome&&total>0)return{ready:true,action:'forage_deliver',label:'Unload both shares into the pantry ('+total+' kcal)',reason:progress+'Transfer both shares to the pantry as real items. Only then does the promise count as kept.'};
   if(atHome)return block(progress+'You have nothing from this outing to bring home yet. Forage together on green ground first.');
   const t=this.playerTile(),can=(()=>{try{const F=(globalThis.Scattering||{}).forage;return !F||!F.canForage||F.canForage(t);}catch(e){return true;}})();
   if(!can)return block(progress+'Nothing left to take here today — walk to another green patch.');
   return{ready:true,action:'forage_together',label:'Forage this patch together',reason:progress+'One real forage press on this patch, split about half and half. The patch is picked clean when you are done; the walk home is still ahead.'};
  },
  forageFavorTalkReady(vid,f){
   f=f||this.convoGetFavor(vid);
   if(!f||f.kind!=='forage_help'||!liveRun(f))return false;
   const r=f.forageRun;
   if(this.over||this.state.scholar.dead||(this.inCombat&&this.inCombat()))return false;
   if(r.bearer!==this.villagerId)return false;
   if(!(this.state.village.roster||[]).includes(vid)||!this.getPerson(vid)||this.getPerson(vid).dead)return false;
   return adjacent(this,vid).ok;
  },
  performForageTalk(vid,f){
   f=f||this.convoGetFavor(vid);
   if(!this.forageFavorTalkReady(vid,f))return{ok:false,line:'You are not out together right now, so there is no trail to talk on.'};
   const r=f.forageRun,line=talkLine(this,vid,r);
   r.talked=true;r.talkCount=(r.talkCount||0)+1;
   try{this.tele('favor_forage_talk',{favorId:f.id,partner:vid,talkCount:r.talkCount});}catch(e){}
   this.save();
   return{ok:true,line};
  },
  performForageFavor(vid,f,ending){
   const status=this.forageFavorAction(vid,f,ending);if(!status.ready)return{ok:false,line:status.reason};
   const v=this.state.village,s=this.state.scholar;
   const first=(()=>{try{return this.displayName(vid).split(' ')[0];}catch(e){return 'Your partner';}})();
   if(status.action==='forage_start'){
    f.forageRun={bearer:this.villagerId,startedDay:s.day,playerHaul:[],partnerHaul:[],forageCount:0,talked:false,talkCount:0,returned:false,deliveredKcal:0};
    this.setEngaged(vid,3);
    try{this.tele('favor_forage_depart',{favorId:f.id,partner:vid,bearer:this.villagerId});}catch(e){}
    this.save();
    return{ok:true,incomplete:true,line:first+' falls in beside you. "Two pairs of eyes, twice the ground. Let us go find the green."'};
   }
   const r=f.forageRun;
   if(status.action==='forage_together'){
    const before=new Set(s.inventory||[]);
    const beforeKcal=s.kcal||0,beforeTicks=s.dayTicks||0;
    const res=this.doAction('forage');
    if(this.over||this.villagerId!==r.bearer){this.save();return{ok:false,incomplete:true,line:'This life has ended. The outing did not finish.'};}
    if(!res){
     // The solo press itself said why (pack full, nothing here). Nothing
     // was gathered, so nothing is recorded — no free haul, no free talk.
     this.save();
     return{ok:false,incomplete:true,line:'Nothing came of that press. The patch, or your pack, said no.'};
    }
    const fresh=(s.inventory||[]).filter(it=>!before.has(it));
    const edible=fresh.filter(it=>(it.kcalEach||0)>0&&it.edible!==false);
    const total=haulKcal(edible);
    let partnerKcal=0;const partnerHaul=[];
    if(total>0){
     const target=Math.floor(total/2);
     for(const it of edible){
      let moved=0;
      while((it.units||0)>0&&(partnerKcal<target||partnerKcal===0)){
       moved++;it.units--;partnerKcal+=it.kcalEach||0;
       if(partnerKcal>=target)break;
      }
      if(moved>0)partnerHaul.push(Object.assign({},it,{units:moved}));
     }
     s.inventory=(s.inventory||[]).filter(it=>(it.units||0)>0);
    }
    const playerHaul=edible.filter(it=>(it.units||0)>0).map(it=>Object.assign({},it));
    const playerKcal=haulKcal(playerHaul);
    // An outing can work several patches: shares accumulate across presses,
    // they never overwrite an earlier patch's haul.
    r.playerHaul=[...(r.playerHaul||[]),...playerHaul];r.partnerHaul=[...(r.partnerHaul||[]),...partnerHaul];
    r.forageCount=(r.forageCount||0)+1;r.talked=true;
    try{const nn=this.npcNeeds(vid);nn.hunger=Math.min(100,(nn.hunger||0)+3);nn.energy=Math.max(0,(nn.energy||70)-4);}catch(e){}
    const kcalSpent=Math.max(0,Math.round(beforeKcal-(s.kcal||0)));
    const tickSpent=Math.max(0,(s.dayTicks||0)-beforeTicks);
    try{this.tele('favor_forage_together',{favorId:f.id,partner:vid,forageCount:r.forageCount,playerKcal,partnerKcal,total,tickSpent,kcalSpent});}catch(e){}
    this.save();
    if(total<=0)return{ok:true,incomplete:true,line:first+' shrugs, hands empty of anything edible. "Nothing we can eat here — wood and green we cannot name yet. We keep walking."'};
    const pBits=haulBits(partnerHaul),yBits=haulBits(playerHaul);
    return{ok:true,incomplete:true,line:first+' holds up their share. "Look at that — '+pBits+' for me, '+yBits+' for you. Same patch, both packs. ('+partnerKcal+' kcal theirs, '+playerKcal+' kcal yours.)"'};
   }
   // Delivery and early ending share one unload: both shares become pantry
   // items. The player's share is matched back out of the pack by its
   // fields, so eating or dropping part of it before home honestly
   // shrinks what arrives — the pantry never receives food nobody carries.
   const playerItems=[...(r.playerHaul||[])];
   let deliveredPlayer=0,deliveredPartner=0;
   for(const snap of playerItems){
    let need=snap.units||0;
    for(const it of [...(s.inventory||[])]){
     if(need<=0)break;
     if(!sameFields(it,snap))continue;
     const take=Math.min(need,it.units||0);
     try{deliveredPlayer+=this.depositPantryPieces(v,Object.assign({},snap,{units:take}),500)||0;}catch(e){}
     it.units-=take;need-=take;
    }
   }
   s.inventory=(s.inventory||[]).filter(it=>(it.units||0)>0);
   for(const item of (r.partnerHaul||[])){
    try{deliveredPartner+=this.depositPantryPieces(v,Object.assign({},item),500)||0;}catch(e){}
   }
   const delivered=deliveredPlayer+deliveredPartner;
   r.returned=true;r.returnedDay=s.day;r.deliveredKcal=delivered;r.deliveredPlayerKcal=deliveredPlayer;r.deliveredPartnerKcal=deliveredPartner;
   if(status.action==='forage_end'){
    if(v.promises?.[vid]&&!v.promises[vid].kept)this.convoFavorRenounce(vid);
   }else this.checkPromises('food',vid,{forageFavorId:f.id});
   const missed=v.promises?.[vid]?.kept!==true;
   f.state=missed?'broken':'fulfilled';if(!missed)f.fulfilledDay=s.day;
   try{this.tele('favor_forage_return',{favorId:f.id,partner:vid,playerKcal:deliveredPlayer,partnerKcal:deliveredPartner,deliveredKcal:delivered,kept:!missed,endedEarly:status.action==='forage_end'});}catch(e){}
   this.journalFavorPromise?.(vid,v.promises?.[vid]);this.save();
   return{ok:true,close:true,promiseMissed:missed,line:'You unload both shares: '+deliveredPlayer+' kcal from you, '+deliveredPartner+' kcal from '+first+' — '+delivered+' kcal into the pantry.'+(missed?' The promise was missed; unloading does not earn kept-promise credit.':' You both made the trip and brought the food home.')};
  },
 });
 const traveling=G.travelingWith;
 G.travelingWith=function(){return[...new Set([...traveling.apply(this,arguments),...this.forageFavorCompanions()])];};
 const engaged=G.isEngaged;
 G.isEngaged=function(vid){return this.forageFavorCompanions().includes(vid)||this.forageFavorWaiting(vid)||engaged.apply(this,arguments);};
 const place=G.placePartyAtPlayer;
 G.placePartyAtPlayer=function(){
  for(const vid of this.forageFavorCompanions())this.npcSetNode(vid,this.map.px,this.map.py);
  return place.apply(this,arguments);
 };
 const load=G.load;
 G.load=function(){const ok=load.apply(this,arguments);if(ok)this.migrateForageFavors();return ok;};
})();
