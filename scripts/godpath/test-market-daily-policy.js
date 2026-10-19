'use strict';
const K=require('./lib'),T=K.reporter('daily Market policy'),M=require('../policies/market-build');
(async()=>{
 const seed=Number(process.env.SEED||7),G=await K.load({seed});console.log('prepared-harness-seed='+seed);
 let s,ctx;
 function fresh(){G.over=false;G.won=false;G.tbfight=null;G.pendingEncounter=null;K.newRun(G);s=G.state.scholar;
   s.day=85;s.health=100;s.kcal=9000;s.abilities=[];s.backgroundAbilities=[];s.inventory=[];s.prepStash=[];s.equipped={};
   s.godhood={active:['market_god'],recognized:{market_god:85},marketDebt:0};G.state.codex.recipes={};ctx={};
   // Start from the displayed public menu. For some starting knacks its
   // readiness queries initialize an empty corpses collection; establish that
   // UI state before the exact-state refusal snapshot, not after it.
   G.activatableAbilities();}
 fresh();const food=s.kcal;M.dailyMarket(G,ctx);let r=ctx.marketDailyReceipts?.[0];
 T.ok('normal public default quote leads to a real paid physical delivery',r?.units===1&&r.returned&&s.inventory.some(it=>it.itemId===r.itemId)&&ctx.marketDailyDeliveries===1);
 T.ok('cash delivery spends its real activation plus barter and preserves dinner',food-s.kcal===r.quote.totalKcal&&r.kcalSpent===r.quote.totalKcal&&s.kcal>=1200&&r.debtAfter===0);
 const state=JSON.stringify(G.state);M.dailyMarket(G,ctx);T.ok('same bearer/day never purchases a second unit',ctx.marketDailyAttempts===1&&JSON.stringify(G.state)===state);
 fresh();s.kcal=2000;M.dailyMarket(G,ctx);r=ctx.marketDailyReceipts?.[0];
 T.ok('real short-payment marker is permitted within the explicit debt budget',r?.units===1&&r.quote.markers===1&&r.debtAfter===1&&r.kcalSpent===r.quote.totalKcal&&r.kcalSpent===40);
 fresh();s.kcal=2000;s.godhood.marketDebt=2;const before=JSON.stringify(G.state);M.dailyMarket(G,ctx);
 const delta=[];function diff(a,b,p=''){if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'/'+k);}else if(delta.length<12)delta.push({path:p,before:a,after:b});}diff(JSON.parse(before),G.state);
 T.ok('a quote that would trigger Audit is declined without food or debt changes',!ctx.marketDailyAttempts&&ctx.marketDailyBlocked?.['meal-or-audit-budget']===1&&JSON.stringify(G.state)===before,JSON.stringify({quote:G.marketWishQuote(null),ctx,delta}));
 fresh();s.kcal=1239;const low=JSON.stringify(G.state);M.dailyMarket(G,ctx);
 T.ok('the 1200-kcal meal buffer includes activation, including marker purchases',!ctx.marketDailyAttempts&&JSON.stringify(G.state)===low);
 fresh();s.equipped={ranged:{itemId:'searcaster'}};G.learnRecipe('bark_armor',1);M.dailyMarket(G,ctx);r=ctx.marketDailyReceipts?.[0];
 T.ok('a familiar armor recipe remains usable when automatic weapon upgrade is unavailable',r?.itemId==='bark_armor'&&r.units===1&&r.kcalSpent===840);
 fresh();s.equipped={ranged:{itemId:'searcaster'}};const hidden=JSON.stringify(G.state);M.dailyMarket(G,ctx);
 T.ok('unknown armor is not named from the global catalog',!ctx.marketDailyAttempts&&JSON.stringify(G.state)===hidden);
 fresh();const q=G.marketWishQuote(null);s.inventory=[{itemId:q.itemId,units:1}];M.dailyMarket(G,ctx);
 T.ok('an unequipped owned default weapon does not cause duplicate purchases',!ctx.marketDailyAttempts);
 fresh();s.godhood.active=[];const notGod=JSON.stringify(G.state),menu=G.activatableAbilities;let menuReads=0;
 G.activatableAbilities=function(){menuReads++;return menu.apply(this,arguments);};
 try{M.dailyMarket(G,ctx);}finally{G.activatableAbilities=menu;}
 T.ok('no Market ascension means no unrelated readiness queries, grants or payment',menuReads===0&&!ctx.marketDailyAttempts&&JSON.stringify(G.state)===notGod);
 fresh();s.godhood.active=['living_garden','market_god'];const secondary=JSON.stringify(G.state);M.dailyMarket(G,ctx);
 T.ok('a secondary Market ascension records holder exposure without forcing an unavailable verb',!ctx.marketDailyAttempts&&Object.keys(ctx.marketDailyExposure.holder).length===1&&Object.keys(ctx.marketDailyExposure.listed).length===0&&Object.values(ctx.marketDailyExposure.unlisted)[0].activeGods[0]==='living_garden'&&JSON.stringify(G.state)===secondary);
 fresh();G.tbfight={over:false};M.dailyMarket(G,ctx);T.ok('live combat blocks camp wishes',!ctx.marketDailyAttempts);G.tbfight=null;
 fresh();const activate=G.activateAbility;let calls=0;G.activateAbility=()=>{calls++;return true;};
 try{M.dailyMarket(G,ctx);M.dailyMarket(G,ctx);}finally{G.activateAbility=activate;}
 T.ok('truthy action return without an item is a refusal and is not retried',calls===1&&ctx.marketDailyRefused===1&&!ctx.marketDailyDeliveries&&ctx.marketDailyReceipts[0].units===0);
 fresh();s.godhood.active=[];M.dailyMarket(G,ctx);s.godhood.active=['market_god'];M.dailyMarket(G,ctx);
 T.ok('becoming a God later that day is not hidden by a prior no-action check',ctx.marketDailyDeliveries===1);
 fresh();const command=G.activateAbility;let wired=false;G.activateAbility=function(){const result=command.apply(this,arguments);wired=ctx.marketDailyDeliveries===undefined&&s.inventory.length>0;return result;};
 try{M.hoarder.upkeep(G,ctx);}finally{G.activateAbility=command;}
 T.ok('real profile upkeep calls the actual public daily action before merchant chores',wired&&ctx.marketDailyDeliveries===1);
 const diagnostic=M.hoarder.diagnostics(ctx);T.ok('receipt diagnostics retain actual costs/debt separately from attempts and unknowns',diagnostic.counters.marketDailyAttempts===1&&diagnostic.counters.marketDailyDeliveries===1&&diagnostic.marketDailyReceipts[0].quote.totalKcal===diagnostic.marketDailyReceipts[0].kcalSpent&&!diagnostic.errors.length);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
