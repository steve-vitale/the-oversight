'use strict';
const K=require('./lib'),T=K.reporter('community food contribution chain');
const community=require('../policies/community-road'),C=require('../policies/competent');
const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict');
const dispatch=process.argv.includes('--dispatch'),removed=process.argv.includes('--removed-dispatch');
if(removed){const read=fs.readFileSync;fs.readFileSync=function(file,...args){let text=read.call(this,file,...args);
 if(String(file).replace(/\\/g,'/').endsWith('/policies/capable.js')){const before=String(text),after=before.replace('community.contributeForFeast(Game, ctx);','/* actual food-plan dispatch removed */');assert.notEqual(before,after);text=typeof text==='string'?after:Buffer.from(after);}return text;};}
(async()=>{
 const G=await K.load({seed:42});let s,v,ctx;
 const food=(name,units,extra={})=>({name,units,kcalEach:500,foodState:'cooked',edible:true,safe:true,spoilDay:200,kg:.1,...extra});
 function fresh(){G.over=false;G.tbfight=null;K.newRun(G);s=G.state.scholar;v=G.state.village;
  s.day=85;s.dayTicks=128;s.kcal=2400;s.hydration=100;s.health=100;G.dayPart=1;
  v.roster=v.roster.slice(0,5);v.health||={};v.trust||={};for(const id of v.roster){v.health[id]=100;v.trust[id]=70;}
  G.enterBuilding();s.inventory=[food('Actual private food',10,{harvestShares:G.harvestOrigin(G.villagerId)})];v.pantry=[food('Prepared communal reserve',14)];v.gives={[G.villagerId]:0};
  Object.assign(G.progState(),{sentimentTaught:true,feastSurge:1.5,feastSurgeUsed:false});
  ctx={communityProfile:'merchant',communityRoad:'trade'};
 }
 if(dispatch){
  fresh();const before=(v.gives||{})[G.villagerId]||0;
  process.env.COMPETENT_TRADE_RESERVE='1';
  require('../policies/capable').capable.daily(G,ctx);
  T.ok('actual primary daily contributes from protected working capital',(v.gives[G.villagerId]||0)>before);
  T.done();return;
 }
 fresh();const beforePack=s.inventory[0].units,beforeTicks=s.dayTicks,beforePantry=G.pantryKcal();
 community.contributeForFeast(G,ctx);
 T.ok('named unmet feast goal produces a real own-food gift',v.gives[G.villagerId]>=1500&&s.inventory[0].units<beforePack);
 T.ok('the specific goal spends only the needed whole food units',v.gives[G.villagerId]===1500&&s.inventory[0].units===7);
 T.ok('a full day of safe personal dinner remains',s.inventory.reduce((n,i)=>n+i.units*i.kcalEach,0)>=G.kcalCap());
 T.ok('actual donated calories leave the pack, enter the pantry and match the receipt',
  (beforePack-s.inventory[0].units)*500===v.gives[G.villagerId]&&G.pantryKcal()-beforePantry===v.gives[G.villagerId]&&ctx.communityDecisions?.[0]?.kcal===v.gives[G.villagerId]);
 T.ok('donation retains the authored zero-time transfer rather than inventing a toll',s.dayTicks===beforeTicks);
 T.ok('existing recent-contribution gate recognizes the paid gift',C.recentGives(G,ctx,7)>=1500);
 const paid=v.gives[G.villagerId];community.contributeForFeast(G,ctx);
 T.ok('repeated same-day planning cannot donate twice',v.gives[G.villagerId]===paid);
 const pantryBefore=G.pantryKcal(),report=G.hostFeast();
 T.ok('the real feast pays communal food and grants the actual armed window',report?.ok&&G.pantryKcal()<pantryBefore&&G.feastedActive());
 // Explicit prepared encounter; canonical world instance and public action.
 G.exitBuilding();G.map.px=1;G.map.py=1;s.insideHaven=false;s.mx=3;s.my=4;
 const detail=G.genDetail(1,1);for(const row of detail)row.fill('dirt');
 const spawned=G.spawnWorldMonster('hushwolf',1,1,{mx:4,my:4});
 G.startCombat('hushwolf');const target=G.tbfight?.fighters.find(f=>f.kind==='monster');
 T.ok('prepared real adjacent encounter opens without fighter rewrites',!!spawned&&!!target&&G.tbIsPlayerTurn());
 const hit=target&&G.tbPlayerStrike(target.key);
 T.ok('real feasted Strike completes the food deed rather than granting it directly',hit===true&&s.prog.feastSurgeUsed===true);
 fresh();s.inventory=[food('Only dinner',4)];const units=s.inventory[0].units;community.contributeForFeast(G,ctx);
 T.ok('insufficient personal surplus is an honest prerequisite blocker',s.inventory[0].units===units&&!v.gives[G.villagerId]&&ctx.communityFoodBlocked==='produce-safe-shareable-food');
 fresh();s.inventory=[food('Unsafe',100,{poisonRisk:{p:.2,dmg:2}}),food('Only safe dinner',4)];community.contributeForFeast(G,ctx);
 T.ok('unsafe stock cannot pad the protected dinner or become a gift',!v.gives[G.villagerId]&&s.inventory[0].units===100);
 fresh();s.inventory=[food('Unattributed stock',100)];community.contributeForFeast(G,ctx);
 T.ok('unattributed starting stock does not masquerade as own production',!v.gives[G.villagerId]&&s.inventory[0].units===100);
 fresh();const other=v.roster.find(id=>id!==G.villagerId);s.inventory=[food('Another harvest',100,{harvestShares:G.harvestOrigin(other)})];community.contributeForFeast(G,ctx);
 T.ok('another resident’s harvest cannot fund the new personal contribution goal',!v.gives[G.villagerId]&&s.inventory[0].units===100);
 fresh();s.inventory=[];G.takeFromPantryBulk({0:10});community.contributeForFeast(G,ctx);
 T.ok('real bulk withdrawal of unattributed pantry stock does not become own production',!v.gives[G.villagerId]);
 fresh();v.pantry=[food('Little communal food',1)];community.contributeForFeast(G,ctx);
 T.ok('unaffordable feast does not spend personal capital for an unusable plan',!v.gives[G.villagerId]&&ctx.communityFoodBlocked==='feast-not-affordable');
 fresh();s.prog.feastSurgeUsed=true;community.contributeForFeast(G,ctx);
 T.ok('completed conversion does not become a repeating donation chore',!v.gives[G.villagerId]&&!ctx.communityFoodPlanDay);
 fresh();s.kcal=900;community.contributeForFeast(G,ctx);
 T.ok('hungry bearer keeps resources for survival',!v.gives[G.villagerId]&&!ctx.communityFoodPlanDay);
 fresh();const prev=process.env.COMMUNITY_PLANNER;process.env.COMMUNITY_PLANNER='legacy';
 try{community.contributeForFeast(G,ctx);}finally{if(prev===undefined)delete process.env.COMMUNITY_PLANNER;else process.env.COMMUNITY_PLANNER=prev;}
 T.ok('explicit legacy controller retains its original working-capital behavior',!v.gives[G.villagerId]&&!ctx.communityFoodPlanDay);
 fresh();C.recentGives(G,ctx,7);G.donateToPantry(0,3);
 T.ok('prepared first bearer has an actual credited contribution',C.recentGives(G,ctx,7)===1500);
 s.day=86;C.recentGives(G,ctx,7);s.day=93;
 T.ok('prepared first bearer’s old contribution ages out of the weekly window',C.recentGives(G,ctx,7)===0);
 const successor=v.roster.find(id=>id!==G.villagerId);
 G.villagerId=successor;s.villagerId=successor;v.gives[successor]=0;
 T.ok('canonical bearer contrast starts without borrowing a prior gift or negative debt',C.recentGives(G,ctx,7)===0);
 s.inventory=[food('Prepared successor harvest',5,{harvestShares:G.harvestOrigin(successor)})];G.donateToPantry(0,3);
 T.ok('new bearer’s real gift is measured against that bearer’s own baseline',C.recentGives(G,ctx,7)===1500);
 const child=flag=>cp.spawnSync(process.execPath,[__filename,'--dispatch',...flag],{encoding:'utf8',timeout:30000,windowsHide:true});
 const wired=child([]),unwired=child(['--removed-dispatch']);
 T.ok('full primary daily reaches the real food contribution',wired.status===0,wired.stdout+wired.stderr);
 T.ok('removing actual primary dispatch rejects the expected paid result',unwired.status!==0&&unwired.stdout.includes('FAIL actual primary daily contributes'));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
