// @ontology
// system: favor-outing
// description: Dawn attempts for promised joint outings. A forage_help or
// water_haul favor promised for a dawn does not wait for the player to
// stumble into the right dialogue at the right day-part: at dawn the game
// attempts the trip itself — the waiting partner sets out with the player
// when both are at Haven — or leaves a legible in-world reason it cannot
// (partner away, partner not at Haven, player not at Haven, no known
// creek, pack full, the day's event came first). A favor never rots
// without a dawn note naming why the trip never happened.
// provides:
//   - attemptWaitingOutings() -> per-favor dawn outcomes for this dawn
//   - attemptWaitingOuting(vid, favor) -> one favor's dawn outcome
// consumes:
//   - state.village
//   - state.scholar
//   - forageFavorAction / performForageFavor
//   - waterFavorAction / performWaterFavor
//   - promiseDueDay(p)
//   - ensureVillagerPositions()
//   - npcInside(vid)
// rules:
//   - dawn_attempt: at dawn (dayPart 0), every promised, unstarted
//     forage_help / water_haul favor inside its meet..due window gets
//     exactly one outcome: departed, or a noted blocker (code:
//     attemptWaitingOutings, game.js endDay dawn hook).
//   - actual_joint_deed: a departure only STARTS the outing through the
//     existing checked perform path (code: performForageFavor,
//     performWaterFavor). The forage presses, the creek fills, and the
//     delivery still happen through real play; nothing is conjured.
//   - no_window_change: this module never moves meetDay, dueDay, or any
//     deadline. The window stays meetDay..meetDay+1; a started-but-
//     unfinished outing still breaks at its due day like any other.
//   - appointment_meet: when both are on the Haven node at dawn, the
//     waiting partner comes to stand beside the player (same node, same
//     side of the Haven door, one adjacent micro-cell). That is the
//     appointment being kept — the partner asked for this dawn — not a
//     roster fed into a decision. Nobody is moved across nodes, and
//     nobody crosses the Haven door for it.
//   - legible_blocker: every non-departure outcome is spoken at dawn
//     (say), remembered on the villager, and stamped on the favor
//     (favor.outingAttempts), so the later rot line is never the first
//     word about it (code: attemptWaitingOuting).
//   - no_gate_change: this module sets no deed, scale, stage, readiness,
//     or table price.
(function(){
 'use strict';
 const G=(globalThis.Scattering||{}).Game;if(!G)return;
 function homePoint(g){
  const v=g.state.village;
  if(Number.isFinite(v.px)&&Number.isFinite(v.py))return{x:v.px,y:v.py};
  try{for(let y=0;y<g.map.tiles.length;y++)for(let x=0;x<g.map.tiles[y].length;x++)if(g.map.tiles[y][x].type==='haven')return{x,y};}catch(e){}
  return{x:4,y:4};
 }
 function firstName(g,vid){
  try{return g.displayName(vid).split(' ')[0]||'They';}catch(e){return 'They';}
 }
 function stamp(f,day,outcome,reason){
  try{
   f.outingAttempts=f.outingAttempts||[];
   f.outingAttempts.push({day,outcome,reason:reason||null});
   if(f.outingAttempts.length>8)f.outingAttempts.splice(0,f.outingAttempts.length-8);
  }catch(e){}
 }
 function note(g,vid,f,day,reason,line){
  stamp(f,day,'noted',reason);
  try{g.remember(vid,'outing_dawn','dawn outing blocked: '+reason);}catch(e){}
  try{g.say(line);}catch(e){}
 }
 Object.assign(G,{
  attemptWaitingOutings(){
   if(this._outingDawnRunning)return[];
   if(this.dayPart!==0)return[];
   if(this.over||(this.state.scholar||{}).dead)return[];
   const v=this.state.village||{};
   const favors=Object.values(v.favorLedger||{});
   const out=[];
   this._outingDawnRunning=true;
   try{
    for(const f of favors){
     try{const r=this.attemptWaitingOuting(f.vid,f);if(r)out.push(r);}catch(e){}
    }
   }finally{this._outingDawnRunning=false;}
   return out;
  },
  attemptWaitingOuting(vid,f){
   const v=this.state.village||{},s=this.state.scholar||{};
   if(!f||(f.kind!=='forage_help'&&f.kind!=='water_haul'))return null;
   if(f.state!=='promised')return null;
   if(f.forageRun||f.waterRun)return null;
   const p=(v.promises||{})[vid];
   if(!p||p.favorId!==f.id||p.kept)return null;
   // A previous bearer's promise is not this bearer's to set out on;
   // the dialogue action already blocks it with its own reason.
   if(p.maker&&p.maker!==this.villagerId)return null;
   const day=s.day||0;
   const meet=f.meetDay??((f.promisedDay??f.askedDay)+1);
   let due=null;try{due=this.promiseDueDay(p);}catch(e){}
   if(day<meet)return null;
   if(due!=null&&day>due)return null;
   const first=firstName(this,vid),short=f.short||f.task||'the outing';
   const home=homePoint(this);
   // The day's event came first: no departure, but a named wait, not silence.
   if(this.state.activeContest||(this.tableActive&&this.tableActive())){
    const reason='the day\'s event came first';
    note(this,vid,f,day,reason,`${first} and the ${short} wait: ${reason}.`);
    return{vid,favorId:f.id,outcome:'noted',reason};
   }
   const person=(()=>{try{return this.getPerson(vid);}catch(e){return null;}})();
   const onRoster=(v.roster||[]).includes(vid);
   if(!onRoster||!person||person.dead){
    const reason=person&&person.dead?'they have died':'they are no longer with the village';
    note(this,vid,f,day,reason,
     person&&person.dead?`${first} has died. The promised ${short} will never happen.`:
     `${first} is no longer with the village. The promised ${short} has no partner.`);
    return{vid,favorId:f.id,outcome:'noted',reason};
   }
   if(v.away&&v.away[vid]){
    const reason='out on the road, miles from Haven';
    note(this,vid,f,day,reason,`${first} is ${reason}. This dawn's ${short} can't set out without them.`);
    return{vid,favorId:f.id,outcome:'noted',reason};
   }
   const node=(v.nodePos||{})[vid]||{nx:home.x,ny:home.y};
   if(node.nx!==home.x||node.ny!==home.y){
    const reason='not at Haven this dawn';
    note(this,vid,f,day,reason,`${first} isn't at Haven this dawn. This dawn's ${short} can't set out without them.`);
    return{vid,favorId:f.id,outcome:'noted',reason};
   }
   if(this.map.px!==home.x||this.map.py!==home.y){
    const reason='you were not at Haven this dawn';
    note(this,vid,f,day,reason,`${first} waited at Haven this dawn for ${short}, but you weren't there.`);
    return{vid,favorId:f.id,outcome:'noted',reason};
   }
   // Both on the Haven node: the appointment is kept by meeting. Place
   // the partner beside the player when positions are missing or far —
   // same node, same side of the Haven door, one adjacent micro-cell.
   // Never across nodes, never through the door: a door-side mismatch
   // falls through to the perform path, whose reason names the door.
   try{this.ensureVillagerPositions&&this.ensureVillagerPositions();}catch(e){}
   try{
    const pos=(v.positions||{})[vid];
    const playerInside=s.insideHaven!==false;
    let partnerInside=playerInside;
    try{partnerInside=this.npcInside?this.npcInside(vid):playerInside;}catch(e){}
    const pmx=s.mx??4,pmy=s.my??4;
    const far=!pos||Math.max(Math.abs((pos.mx??4)-pmx),Math.abs((pos.my??4)-pmy))>1;
    if(far&&partnerInside===playerInside){
     let detail=null;
     try{detail=this.genDetail(this.map.px,this.map.py);}catch(e){}
     const cands=[[pmx+1,pmy],[pmx-1,pmy],[pmx,pmy+1],[pmx,pmy-1]];
     for(const [cx,cy] of cands){
      if(cx<0||cx>8||cy<0||cy>8)continue;
      let blocked=false;
      try{if(detail&&this.cellProps(detail[cy][cx]).blocks)blocked=true;}catch(e){}
      if(blocked)continue;
      v.positions=v.positions||{};
      v.positions[vid]={mx:cx,my:cy};
      break;
     }
    }
   }catch(e){}
   let res=null;
   try{
    res=f.kind==='forage_help'?(this.performForageFavor&&this.performForageFavor(vid,f))
     :(this.performWaterFavor&&this.performWaterFavor(vid,f));
   }catch(e){res={ok:false,line:'The outing could not set out.'};}
   if(res&&res.ok&&(f.forageRun||f.waterRun)){
    stamp(f,day,'departed',null);
    try{this.remember(vid,'outing_dawn','set out at dawn for '+short);}catch(e){}
    try{this.say(res.line);}catch(e){}
    return{vid,favorId:f.id,outcome:'departed',reason:null};
   }
   const reason=(res&&res.line)||'The outing could not set out.';
   note(this,vid,f,day,reason,`${first} waited at Haven this dawn for ${short}. ${reason}`);
   return{vid,favorId:f.id,outcome:'noted',reason};
  },
 });
})();
