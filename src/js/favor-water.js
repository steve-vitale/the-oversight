// @ontology
// system: favor-water
// description: Joint dawn creek favors: temporary companion, real bottled cargo and home cistern settlement.
// provides:
//   - waterFavorCompanions() -> living temporary creek companions for this bearer
//   - waterFavorWaiting(vid) -> requester waiting at home for the agreed dawn
//   - waterFavorOpening(vid) -> structural, current-phase joint-work opening
//   - waterFavorAction(vid, favor) -> pure readiness and progress
//   - performWaterFavor(vid, favor) -> checked departure, canonical fills or physical handoff
//   - migrateWaterFavors() -> give previously unplayable saved promises a fair window once
// consumes:
//   - state.village
//   - state.scholar
//   - fillWater()
//   - checkPromises(kind, vid, opts)
//   - travelingWith()
//   - placePartyAtPlayer()
// rules:
//   - actual_joint_deed: only collected cargo delivered at home keeps the favor (code: performWaterFavor, game.js checkPromises)
//   - physical_water: filling pays its costs; cargo keeps quality, mass and save identity (code: performWaterFavor, game.js fillWater)
//   - temporary_companion: no permanent party membership or successor escort (code: waterFavorCompanions, travelingWith wrapper)
(function(){
 'use strict';
 const G=(globalThis.Scattering||{}).Game;if(!G)return;
 const liveRun=f=>f?.kind==='water_haul'&&f.waterRun&&!f.waterRun.returned;
 const liters=xs=>(xs||[]).reduce((n,b)=>n+(Number.isFinite(b.liters)&&b.liters>0?b.liters:0),0);
 const cargo=(g,f)=>(g.state.scholar.water||[]).filter(b=>b.favorId===f.id);
 function homePoint(g){
  const v=g.state.village;
  if(Number.isFinite(v.px)&&Number.isFinite(v.py))return{x:v.px,y:v.py};
  // Historical seven-square saves predate explicit village coordinates.
  for(let y=0;y<g.map.tiles.length;y++)for(let x=0;x<g.map.tiles[y].length;x++)if(g.map.tiles[y][x].type==='haven')return{x,y};
  return{x:4,y:4};
 }
 function knownCreek(g){
  const candidates=[];
  for(let y=0;y<g.map.tiles.length;y++)for(let x=0;x<g.map.tiles[y].length;x++){
   if(g.map.tiles[y][x].type==='creek'&&g.mapSeen(x,y))candidates.push({x,y});
  }
  return candidates.sort((a,b)=>(Math.abs(a.x-g.map.px)+Math.abs(a.y-g.map.py))-(Math.abs(b.x-g.map.px)+Math.abs(b.y-g.map.py))||a.y-b.y||a.x-b.x)[0]||null;
 }
 function direction(g,target){
  const home=homePoint(g),dx=target.x-home.x,dy=target.y-home.y;
  return (dy<0?'north':dy>0?'south':'')+(dx!==0&&dy!==0?'-':'')+(dx<0?'west':dx>0?'east':'');
 }
 Object.assign(G,{
  waterFavorCompanions(){
   const v=this.state.village;
   return Object.values(v.favorLedger||{}).filter(f=>liveRun(f)&&f.waterRun.bearer===this.villagerId&&f.vid!==this.villagerId&&
    (v.roster||[]).includes(f.vid)&&this.getPerson(f.vid)&&!this.getPerson(f.vid).dead&&!v.away?.[f.vid]).map(f=>f.vid);
  },
  waterFavorWaiting(vid){
   const v=this.state.village,f=v.favorLedger?.[vid],p=v.promises?.[vid],s=this.state.scholar;
   if(f?.kind!=='water_haul'||f.waterRun||p?.favorId!==f.id||p.kept||p.maker!==this.villagerId||this.dayPart!==0)return false;
   const home=homePoint(this),node=v.nodePos?.[vid]||{nx:home.x,ny:home.y};
   return !!(s.day>=(f.meetDay??((f.promisedDay??f.askedDay)+1))&&s.day<=this.promiseDueDay(p)&&
    node.nx===home.x&&node.ny===home.y&&!v.away?.[vid]);
  },
  waterFavorOpening(vid){
   if(!this.waterFavorCompanions().includes(vid)||this.state.activeContest||this.tableActive?.())return null;
   const f=this.convoGetFavor(vid),r=f.waterRun,at=homePoint(this),home=this.map.px===at.x&&this.map.py===at.y;
   const full=liters(cargo(this,f))>=2&&liters(r.partnerWater)>=2,creek=this.map.px===r.target.x&&this.map.py===r.target.y;
   const line=f.state==='broken'?'"We missed the promise. We still need to get home and unload what we have."':
    home&&full?'"We’re home. Let’s get this water into the cistern."':
    full?'"The buckets are full. Let’s get back to Haven."':
    creek?'"Here’s the creek. Let’s fill the buckets."':
    home?'"Ready for the creek? We still need to bring the water home."':'"Keep together. We still have the creek trip to finish."';
   return{line,thread:'want',wantId:'repay',structural:true};
  },
  migrateWaterFavors(){
   const v=this.state.village,day=this.state.scholar.day||0;
   for(const [vid,p]of Object.entries(v.promises||{})){
    const f=v.favorLedger?.[vid];
    if(p.kept||p.waterHaulVersion||!f||f.kind!=='water_haul'||p.favorId!==f.id)continue;
    // Those promises previously had no executable action and no deadline
    // penalty. Enabling the job must not retroactively break an old word.
    p.waterHaulVersion=1;p.favorDeadline=Math.max(this.promiseDueDay(p)||0,day+2);
    f.deadline=p.favorDeadline;f.meetDay=day+1;this.journalFavorPromise?.(vid,p);
   }
  },
  waterFavorAction(vid,f,ending){
   const block=reason=>({ready:false,reason}),v=this.state.village,s=this.state.scholar,r=f?.waterRun;
   if(!f||f.kind!=='water_haul'||f.vid!==vid)return block('There is no creek request to act on.');
   if(r?.returned||(!liveRun(f)&&!['asked','promised'].includes(f.state)))return block('This creek request is closed.');
   if(this.over||s.dead)return block('This life has ended.');
   if(this.inCombat())return block('Finish the fight before hauling water.');
   if(this.state.activeContest||this.tableActive?.())return block('Finish the current event before hauling water.');
   if(!(v.roster||[]).includes(vid)||vid===this.villagerId||!this.getPerson(vid)||this.getPerson(vid).dead)return block('Your partner is no longer available for this trip.');
   if(r&&r.bearer!==this.villagerId)return block('That creek trip belonged to the previous bearer. It is not your promise.');
   const origin=homePoint(this),node=v.nodePos?.[vid]||{nx:origin.x,ny:origin.y},pos=v.positions?.[vid];
   const home=this.map.px===origin.x&&this.map.py===origin.y;
   if(home&&node.nx===origin.x&&node.ny===origin.y&&(v.npcInside?.[vid]!==false)!==(s.insideHaven!==false))return block(v.npcInside?.[vid]!==false?'Your partner is inside the Haven hall. Go through the door to meet them.':'Your partner is on the Haven grounds. Step outside to meet them.');
   if(v.away?.[vid]||node.nx!==this.map.px||node.ny!==this.map.py||!pos||
    (home&&(v.npcInside?.[vid]!==false)!==(s.insideHaven!==false))||
    ![pos.mx,pos.my,s.mx,s.my].every(Number.isFinite)||Math.max(Math.abs(pos.mx-s.mx),Math.abs(pos.my-s.my))>1)return block('Move next to your partner, on the same side of the Haven door.');
   if(!r){
    const p=v.promises?.[vid];
    if(!p||p.favorId!==f.id||p.kept)return block('Accept the creek request first. Meet at Haven at dawn on the following day.');
    if(p.maker&&p.maker!==this.villagerId)return block('That creek promise belonged to the previous bearer. It is not your promise.');
    const due=this.promiseDueDay(p);
    if(due!=null&&(s.day||0)>due)return block('The deadline has passed. This trip can no longer keep the promise.');
    const meet=f.meetDay??((f.promisedDay??f.askedDay)+1);
    if(s.day<meet)return block('Meet at Haven at dawn on day '+meet+'. Each of you will carry two liters back.');
    if(!home)return block('Return to Haven with your partner to set out together.');
    if(this.dayPart!==0)return block('Set out at dawn. Return at the next dawn before the deadline.');
    const other=this.waterFavorCompanions();if(other.some(id=>id!==vid))return block('Finish your current creek trip before starting another.');
    const target=knownCreek(this);if(!target)return block('Find a creek on your map first. No known creek can be named for this trip yet.');
    if(!this.canCarry(2))return block('Make room for two liters: 2kg of water, in addition to your current pack.');
    return{ready:true,action:'water_start',target,label:'Set out together for the creek',reason:'Walk to the known creek '+direction(this,target)+' of Haven. Collect two liters each (40 kcal and four filling actions), then carry it home. Creek water still needs boiling.'};
   }
   const yours=liters(cargo(this,f)),theirs=liters(r.partnerWater),progress='You carry '+yours+'/2L; your partner carries '+theirs+'/2L. ';
   if(ending)return home?{ready:true,action:'water_end',reason:progress+'Unload what you have and end this outing. An unfinished promise will be broken.'}:block('Return to Haven together to unload and end this outing.');
   if(yours>=2&&theirs>=2){
    if(!home)return block(progress+'Walk back to Haven together and speak to your partner to unload.');
    return{ready:true,action:'water_deliver',label:'Unload both pairs of buckets (4L)',reason:progress+'Transfer the actual water to the village cistern, keeping its current quality. Risky water needs wood and boiling.'};
   }
   if(this.map.px!==r.target.x||this.map.py!==r.target.y)return block(progress+'Walk together to the known creek '+direction(this,r.target)+' of Haven, then speak to your partner.');
   if(this.playerTile()?.type!=='creek')return block(progress+'This source is no longer a creek. No water can be collected here.');
   if(yours<2&&!this.canCarry(2-yours))return block(progress+'Your pack needs room for the remaining water (1kg per liter).');
   return{ready:true,action:'water_collect',label:'Fill the creek buckets (up to 4L)',reason:progress+'Each new liter costs the existing 10 kcal and one filling action. Your partner carries two liters; you carry two. This is risky creek water.'};
  },
  performWaterFavor(vid,f,ending){
   const status=this.waterFavorAction(vid,f,ending);if(!status.ready)return{ok:false,line:status.reason};
   const v=this.state.village,s=this.state.scholar;
   if(status.action==='water_start'){
    f.waterRun={bearer:this.villagerId,startedDay:s.day,target:status.target,partnerWater:[],returned:false};
    this.setEngaged(vid,3);this.tele('favor_water_depart',{favorId:f.id,partner:vid,bearer:this.villagerId,target:status.target});this.save();
    return{ok:true,incomplete:true,line:'You set out together. '+status.reason};
   }
   const r=f.waterRun;
   if(status.action==='water_collect'){
    let filled=0;
    for(let n=0;n<4;n++){
     const next=this.waterFavorAction(vid,f);
     if(!next.ready||next.action!=='water_collect'||!this.waterFavorCompanions().includes(vid))break;
     const yours=liters(cargo(this,f)),theirs=liters(r.partnerWater);if(yours>=2&&theirs>=2)break;
     const before=new Set(s.water||[]);this.fillWater();
     if(this.over||this.villagerId!==r.bearer)break;
     const bottle=(s.water||[]).find(b=>!before.has(b));if(!bottle)break;
     bottle.favorId=f.id;
     if(theirs<2){r.partnerWater.push(bottle);s.water.splice(s.water.indexOf(bottle),1);}
     filled++;
    }
    if(this.over||this.villagerId!==r.bearer){this.save();return{ok:false,incomplete:true,line:'This life has ended. The creek water was not delivered.'};}
    if(filled>0)this.tele('favor_water_collect',{favorId:f.id,partner:vid,liters:filled,playerLiters:liters(cargo(this,f)),partnerLiters:liters(r.partnerWater)});
    this.save();
    return{ok:filled>0,incomplete:true,line:filled+'L collected from the creek. You carry '+liters(cargo(this,f))+'/2L; your partner carries '+liters(r.partnerWater)+'/2L. Carry the water back to Haven. It is still risky until boiled.'};
   }
   const bottles=[...cargo(this,f),...r.partnerWater],vw=v.water||(v.water={clean:0,dirty:0});
   const clean=liters(bottles.filter(b=>b.quality==='clean')),dirty=liters(bottles.filter(b=>b.quality!=='clean'));
   s.water=(s.water||[]).filter(b=>b.favorId!==f.id);r.partnerWater=[];r.returned=true;r.returnedDay=s.day;r.deliveredLiters=clean+dirty;
   vw.clean=(vw.clean||0)+clean;vw.dirty=(vw.dirty||0)+dirty;
   // The exact run and completed cargo, not an arbitrary 'task', are the
   // receipt. Expiry is checked before credit and still allows real unloading.
   if(status.action==='water_end'){
    if(v.promises?.[vid]&&!v.promises[vid].kept)this.convoFavorRenounce(vid);
   }else this.checkPromises('task',vid,{waterFavorId:f.id});
   const missed=v.promises?.[vid]?.kept!==true;
   f.state=missed?'broken':'fulfilled';if(!missed)f.fulfilledDay=s.day;
   this.tele('favor_water_return',{favorId:f.id,partner:vid,cleanLiters:clean,riskyLiters:dirty,kept:!missed,endedEarly:status.action==='water_end'});
   this.journalFavorPromise?.(vid,v.promises?.[vid]);this.save();
   return{ok:true,close:true,promiseMissed:missed,line:'You unload '+(clean+dirty)+'L into the cistern ('+clean+'L clean, '+dirty+'L risky).'+(dirty?' The risky water still needs boiling.':'')+(missed?' The promise was missed; unloading does not earn kept-promise credit.':' You both made the trip and brought the water home.')};
  },
 });
 const traveling=G.travelingWith;
 G.travelingWith=function(){return[...new Set([...traveling.apply(this,arguments),...this.waterFavorCompanions()])];};
 const engaged=G.isEngaged;
 G.isEngaged=function(vid){return this.waterFavorCompanions().includes(vid)||this.waterFavorWaiting(vid)||engaged.apply(this,arguments);};
 const place=G.placePartyAtPlayer;
 G.placePartyAtPlayer=function(){
  for(const vid of this.waterFavorCompanions())this.npcSetNode(vid,this.map.px,this.map.py);
  return place.apply(this,arguments);
 };
 const load=G.load;
 G.load=function(){const ok=load.apply(this,arguments);if(ok)this.migrateWaterFavors();return ok;};
})();
