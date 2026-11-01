'use strict';
// Shared primary-policy prerequisite work, using the phone's offered village
// actions and committed cardinal grid crossings. Never grants knowledge or
// opinion, changes a location, or treats an attempted study as useful work.
const P=require('./public-travel');
const RULES=Object.freeze({version:1,maxDistance:3,minDay:25,minHealth:75,minKcal:1800,minHydration:50,latestStartTick:128,retryDays:7});
const distance=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
const here=G=>[G.map.px,G.map.py];
const busy=G=>G.over||G.inCombat()||G.pendingEncounter||!!G.state.activeContest;
const pending=G=>G.state.pendingCounter||G.state.pendingAccord||G.state.pendingNational||G.state.pendingGlobal;
function log(ctx,row){const rows=ctx.communityVisits||(ctx.communityVisits=[]);if(rows.length>=100)rows.shift();rows.push(row);}
function owner(G){return G.state.runKey+':'+G.villagerId;}
function blocked(ctx,reason){ctx.communityVisitBlocked=reason;}
function knowledge(G){return JSON.stringify(['plants','techniques','recipes','animals'].map(k=>G.state.codex[k]||{}));}
function walk(G,ctx,goal,near,actor){
  for(let n=0;n<RULES.maxDistance;n++){
    if(owner(G)!==actor||busy(G))return false;
    if(distance(here(G),goal)<=near)return true;
    // Move just one real cardinal node, then re-check the actual bearer,
    // engagements and remaining study budget. No revealed-node jump.
    const before=here(G),next=(G.travelTargets()||[])
      .filter(t=>distance(before,[t.x,t.y])===1&&distance([t.x,t.y],goal)<distance(before,goal))
      .sort((a,b)=>distance([a.x,a.y],goal)-distance([b.x,b.y],goal)||a.y-b.y||a.x-b.x)[0];
    if(!next){blocked(ctx,'no-next-node');return false;}
    P.within(G,ctx,()=>P.travel(G,next.x,next.y));
    if(distance(before,here(G))===0){blocked(ctx,ctx.publicTravelReceipts?.at(-1)?.reason||'crossing-refused');return false;}
    if(near&&((G.state.scholar.dayTicks||0)>256||G.state.scholar.health<RULES.minHealth||G.state.scholar.kcal<1200)){
      blocked(ctx,'outward-budget-exhausted');return false;
    }
  }
  return owner(G)===actor&&!busy(G)&&distance(here(G),goal)<=near;
}
function visitPrerequisite(G,ctx){
  if(process.env.COMMUNITY_PLANNER==='legacy'||process.env.COMMUNITY_VISITS==='off'||!ctx.communityProfile)return false;
  const s=G.state.scholar,day=s.day||0,actor=owner(G),home=[G.state.village.px??4,G.state.village.py??4];
  if(ctx.communityVisit?.owner!==actor)ctx.communityVisit=null;
  let plan=ctx.communityVisit;
  if(!plan&&!['trade','covenant'].includes(ctx.communityRoad))return false;
  if(busy(G))return !!plan;
  if(s.exiled||s.joinedVillage){ctx.communityVisit=null;blocked(ctx,'not-haven-member');return false;}
  if(pending(G)){blocked(ctx,'pending-choice');return false;}
  try{
    if(!plan){
      if(!['trade','covenant'].includes(ctx.communityRoad)||day<RULES.minDay||distance(here(G),home)!==0)return false;
      if(ctx.communityVisitDay===actor+':'+day)return false;
      if(s.health<RULES.minHealth||s.kcal<RULES.minKcal||s.hydration<RULES.minHydration||(s.dayTicks||0)>RULES.latestStartTick){blocked(ctx,'trip-body-or-time');return false;}
      // This is a modest same-day outing, not an assumption that every
      // resident can survive an arbitrary expedition. Upkeep supplies food
      // and water through the normal policy; this plan invents neither.
      if(!(s.water||[]).some(w=>w.quality==='clean'&&w.liters>0)){blocked(ctx,'trip-clean-water');return false;}
      const cooldown=ctx.communityVisitDays||(ctx.communityVisitDays={});
      const candidates=(G.state.otherVillages||[]).filter(v=>v&&G.knowsVillage(v)&&!G.linkWith(v.id)&&
        (v.opinion||0)<10&&!v._codexOpinionGiven&&Number.isInteger(v.x)&&Number.isInteger(v.y)&&
        distance(home,[v.x,v.y])<=RULES.maxDistance&&day-(cooldown[v.id]??-Infinity)>=RULES.retryDays)
        .sort((a,b)=>distance(home,[a.x,a.y])-distance(home,[b.x,b.y])||a.id.localeCompare(b.id));
      const target=candidates[0];
      if(!target){blocked(ctx,'no-unmet-nearby-codex-prerequisite');return false;}
      plan=ctx.communityVisit={owner:actor,id:target.id,home,day,phase:'outward'};
      ctx.communityVisitDay=actor+':'+day;
      ctx.communityVisitBlocked=null;
      cooldown[target.id]=day;
      log(ctx,{day,action:'visit-start',id:target.id,from:here(G)});
    }
    if(plan.phase==='outward'){
      const target=(G.state.otherVillages||[]).find(v=>v?.id===plan.id);
      const arrived=target&&walk(G,ctx,[target.x,target.y],1,actor);
      if(owner(G)!==actor){ctx.communityVisit=null;return true;}
      if(busy(G))return true;
      // A failed or interrupted approach returns instead of claiming study.
      // The next daily call resumes return if combat opened on this leg.
      plan.phase='return';
      if(arrived){
        let card=G.villageCard(plan.id);
        if(!card?.actions?.some(a=>a.id==='study')&&card?.actions?.some(a=>a.id==='talk')&&target.lastTalkDay!==s.day){
          const trust=target.trust||0,result=G.villageCardAction(plan.id,'talk');
          log(ctx,{day:s.day,action:'talk',id:plan.id,result,trustBefore:trust,trustAfter:target.trust||0});
          if(owner(G)!==actor||busy(G))return true;
          card=G.villageCard(plan.id);
        }
        if(card?.actions?.some(a=>a.id==='study')&&(s.dayTicks||0)<=256&&s.health>=50&&s.kcal>=1200){
          const before={knowledge:knowledge(G),linked:(s.linkedCodices||[]).includes(plan.id),opinion:target.opinion||0,tick:s.dayTicks,day:s.day};
          const result=G.villageCardAction(plan.id,'study');
          if(owner(G)!==actor){ctx.communityVisit=null;return true;}
          log(ctx,{day:s.day,action:'study',id:plan.id,result,knowledgeChanged:knowledge(G)!==before.knowledge,
            newlyLinked:!before.linked&&(s.linkedCodices||[]).includes(plan.id),opinionBefore:before.opinion,opinionAfter:target.opinion||0,
            tickBefore:before.tick,tickAfter:s.dayTicks,dayBefore:before.day});
        }else blocked(ctx,'study-not-offered-or-affordable');
      }
    }
    if(owner(G)!==actor||busy(G))return true;
    if(walk(G,ctx,plan.home,0,actor)){
      log(ctx,{day:s.day,action:'returned',id:plan.id,world:here(G)});
      ctx.communityVisit=null;
    }
    return true;
  }catch(e){
    if(plan)plan.phase='return';
    (ctx.capErrors||(ctx.capErrors=[])).push('community visit: '+e.message);
    console.warn('[community visit]',e.message);
    return !!plan;
  }
}
module.exports={visitPrerequisite,RULES};
