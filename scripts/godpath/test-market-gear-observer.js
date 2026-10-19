'use strict';
const path=require('path'),cp=require('child_process'),i=process.argv.indexOf('--root');
const root=i<0?path.resolve(__dirname,'../..'):path.resolve(process.argv[i+1]),K=require(path.join(root,'scripts/godpath/lib'));
const A=require('../gear-usage-audit'),B=require('../balance-panel'),T=K.reporter('market gear observer');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||7)});let s;
 function fresh(){G.over=false;G.won=false;G.tbfight=null;K.newRun(G);s=G.state.scholar;s.day=85;s.kcal=9000;s.health=100;s.inventory=[];s.equipped={};s.abilities=[];s.backgroundAbilities=[];s.godhood={active:['market_god'],recognized:{market_god:85},marketDebt:0};}
 fresh();
 if(process.argv.includes('--neutral-child')){
  s.inventory=[{itemId:'searcaster',units:1}];const on=process.argv.includes('--observe'),o=on?A.install(G):null;
  if(o)o.sample();const result=G.activateAbility('god.name_price','phase_blade');const repeat=G.activateAbility('god.name_price','phase_blade');if(o)o.sample();
  console.log('@@MARKET_NEUTRAL@@'+JSON.stringify({state:A.gameplayHash(G.state),nextRandom:Math.random(),result,repeat,errors:o?.errors||[]}));return;
 }
 s.inventory=[{itemId:'searcaster',units:1}];const o=A.install(G);o.sample();
 T.ok('actual Market grant boundary is registered under its own source',A.METHODS.marketNamePrice==='market');
 T.ok('observed starting high-tier gear is never an earned acquisition',o.maxTier>=4&&o.grants.length===0);
 let state=JSON.stringify(G.state);o.sample();o.sample();T.ok('passive sampling changes no Game state and mints no Market grants',JSON.stringify(G.state)===state&&o.grants.length===0);
 let start=o.grants.length,food=s.kcal,r=G.marketNamePrice('phase_blade'),gs=o.grants.slice(start);
 T.ok('direct actual paid delivery returns its normal receipt and spends its real barter',r?.ok&&r.paidKcal===5000&&s.kcal===food-5000&&s.inventory.some(x=>x.itemId==='phase_blade'));
 T.ok('one direct physical unit has one Market source and the real player/quality',gs.length===1&&gs[0].source==='market'&&gs[0].who==='player'&&gs[0].id==='phase_blade'&&gs[0].n===1&&gs[0].gear&&gs[0].tier===3);
 T.ok('paid acquisition records actual barter and debt rather than inventing activation cost',gs[0]?.marketPayment?.barterKcal===5000&&gs[0].marketPayment.onCredit===false&&gs[0].marketPayment.borrowed===false&&gs[0].marketPayment.debtAfter===0&&gs[0].marketPayment.activationKcal===null);
 state=JSON.stringify(G.state);start=o.grants.length;r=G.marketNamePrice('phase_blade');T.ok('same-day refusal returns null without new acquisition or payment',r===null&&o.grants.length===start&&JSON.stringify(G.state)===state);
 fresh();start=o.grants.length;state=JSON.stringify(G.state);r=G.marketNamePrice('prepared_unknown_market_item');T.ok('truthy unknown-item refusal is not an acquisition',r?.ok===false&&o.grants.length===start&&JSON.stringify(G.state)===state);
 fresh();start=o.grants.length;food=s.kcal;r=G.activateAbility('god.name_price','alien_carapace');gs=o.grants.slice(start);
 T.ok('nested normal public dispatch records exactly one actual borrowed relic',r===true&&gs.length===1&&gs[0].source==='market'&&gs[0].id==='alien_carapace'&&gs[0].n===1&&gs[0].tier===4&&gs[0].gear&&gs[0].who==='player');
 T.ok('borrowed receipt distinguishes actual debt from a paid cash acquisition',s.kcal===food-40&&gs[0]?.marketPayment?.borrowed===true&&gs[0].marketPayment.onCredit===true&&gs[0].marketPayment.barterKcal===0&&gs[0].marketPayment.debtAfter===2);
 fresh();s.kcal=600;start=o.grants.length;G.activateAbility('god.name_price','peanut_butter');gs=o.grants.slice(start);
 T.ok('actual marker-funded food is observed as food rather than quality gear',gs.length===1&&gs[0].source==='market'&&!gs[0].gear&&gs[0].id==='peanut_butter'&&gs[0].marketPayment?.onCredit===true&&gs[0].marketPayment.borrowed===false);
 fresh();s.inventory=[{itemId:'phase_blade',units:2}];start=o.grants.length;G.marketNamePrice('phase_blade');gs=o.grants.slice(start);
 T.ok('buying another copy counts the new physical unit rather than the existing stack',gs.length===1&&gs[0].n===1);
 fresh();start=o.grants.length;state=JSON.stringify(G.state);G.marketWishQuote('phase_blade');G.marketWishSuggestions();o.sample();T.ok('quote and suggestion access cannot become earned gear',o.grants.length===start&&JSON.stringify(G.state)===state);
 fresh();s.godhood.active=[];start=o.grants.length;state=JSON.stringify(G.state);G.marketNamePrice('phase_blade');T.ok('non-holder refusal cannot manufacture a grant or food charge',o.grants.length===start&&JSON.stringify(G.state)===state);
 T.ok('observer captures actual calls without acquisition errors',o.calls.marketNamePrice>=7&&!o.errors.length);
 const row={deaths:{},gameDays:85,endReason:'ongoing',won:0,entered:0,table:0,national:0};
 fresh();s.inventory=[{itemId:'searcaster',units:1}];const initial=B.install(G).finish(row);T.ok('balanced goodGear excludes high starting inventory',initial.metrics.goodGear===0);
 const panelObserver=B.install(G);G.activateAbility('god.name_price','phase_blade');const panel=panelObserver.finish(row);
 T.ok('actual Market delivery reaches balanced earned-good-gear access',panel.metrics.goodGear===1&&panel.gear.grants.some(g=>g.source==='market'&&g.id==='phase_blade'));
 T.ok('Market is not relabeled as contest/show, ordinary craft/trade or corpse gear',panel.metrics.contestShowGear===0&&panel.metrics.craftTradeGear===0&&panel.metrics.corpseGear===0);
 const arms=[false,true].map(on=>{const r=cp.spawnSync(process.execPath,[__filename,'--root',root,'--neutral-child',...(on?['--observe']:[])],{cwd:root,env:process.env,encoding:'utf8',timeout:60000,maxBuffer:8e6});if(r.status!==0)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout.split('@@MARKET_NEUTRAL@@').pop());});
 T.ok('real paid-action observer on/off preserves full Game hash, public returns and next RNG draw',JSON.stringify(arms[0])===JSON.stringify(arms[1])&&arms[0].result===true&&arms[0].repeat===false&&!arms[1].errors.length);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
