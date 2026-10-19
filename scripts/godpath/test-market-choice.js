'use strict';
const path=require('path'),i=process.argv.indexOf('--root'),K=i<0?require('./lib'):require(path.resolve(process.argv[i+1],'scripts/godpath/lib'));
const T=K.reporter('market choice');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||7)});let s;
 T.ok('normal Market choice has actual quote and familiar-suggestion helpers',typeof G.marketWishQuote==='function'&&typeof G.marketWishSuggestions==='function');
 if(!G.marketWishQuote){T.done();return;}
 function fresh(){G.over=false;G.won=false;G.tbfight=null;K.newRun(G);s=G.state.scholar;s.day=85;s.health=100;s.kcal=9000;s.inventory=[];s.prepStash=[];s.equipped={};s.abilities=[];s.backgroundAbilities=[];s.godhood={active:['market_god'],recognized:{market_god:85},marketDebt:0};G.state.codex.recipes={};}
 fresh();T.ok('every displayed catalog name quotes its own exact item rather than a same-name variant',G.data.items.every(d=>G.marketWishQuote(d.name).itemId===d.id));
 s.inventory=[{itemId:'tin_cup',units:1},{itemId:'peanut_butter',units:0}];G.learnRecipe('bark_armor',1);
 let before=JSON.stringify(G.state),known=G.marketWishSuggestions();
 T.ok('familiar suggestions include actual carried items and seen recipes',known.some(x=>x.id==='tin_cup')&&known.some(x=>x.id==='bark_armor'));
 T.ok('suggestions hide unobserved catalog names and empty stacks',!known.some(x=>x.id==='searcaster'||x.id==='peanut_butter')&&known.every(x=>Object.keys(x).sort().join(',')==='id,name'));
 let q=G.marketWishQuote('  Bark armor  ');
 T.ok('typed name resolves exact catalog item without requiring an owned spare',q.ok&&q.itemId==='bark_armor'&&q.totalKcal===840&&q.barterKcal===800&&q.activationKcal===40&&q.markers===0);
 T.ok('known suggestions and repeated quote calls do not mutate any Game state',JSON.stringify(G.state)===before&&JSON.stringify(G.marketWishQuote('Bark armor'))===JSON.stringify(q)&&JSON.stringify(G.state)===before);
 T.ok('invalid exact name is refused without exposing the catalog or spending anything',G.marketWishQuote('prepared unknown name').ok===false&&JSON.stringify(G.state)===before);
 const food=s.kcal;T.ok('confirmed composite public action settles the exact ordinary quote',G.activateAbility('god.name_price',q.itemId)===true&&food-s.kcal===q.totalKcal&&s.inventory.some(x=>x.itemId==='bark_armor'));
 T.ok('a spent daily wish makes both quoting and UI entry unavailable',!G.marketWishStatus().ok&&!G.marketWishQuote('tin_cup').ok&&G.godActivatables().find(a=>a.id==='god.name_price')?.choiceAvailable===false);
 fresh();s.kcal=800;q=G.marketWishQuote('peanut_butter');
 T.ok('quote accounts for activation before affordability instead of promising a false cash price',q.ok&&q.totalKcal===40&&q.markers===1&&q.debtAfter===1);
 before=s.kcal;G.activateAbility('god.name_price',q.itemId);T.ok('actual marker-funded delivery exactly matches the activation-aware quote',before-s.kcal===q.totalKcal&&s.godhood.marketDebt===q.debtAfter&&s.inventory[0].kcalEach===800);
 fresh();s.godhood.marketDebt=1;q=G.marketWishQuote('alien_carapace');
 T.ok('relic quote includes both markers and imminent Audit before payment',q.ok&&q.markers===2&&q.totalKcal===40&&q.debtAfter===3&&q.auditDue);
 before=s.kcal;G.activateAbility('god.name_price',q.itemId);T.ok('real borrowed relic uses exactly the quoted food and debt',before-s.kcal===q.totalKcal&&s.godhood.marketDebt===3&&s.inventory[0].itemId===q.itemId);
 fresh();s.equipped={ranged:{itemId:'searcaster'}};before=JSON.stringify(G.state);const a=G.godActivatables().find(a=>a.id==='god.name_price');
 T.ok('having the strongest weapon does not disable named choice or mislead default-action bots',a?.available===false&&a.choiceAvailable===true);
 T.ok('automatic weapon selection reports no upgrade while a named armor quote remains usable',!G.marketWishQuote(null).ok&&G.marketWishQuote('bark_armor').ok&&JSON.stringify(G.state)===before);
 fresh();s.kcal=499;before=JSON.stringify(G.state);T.ok('hungry quote and chooser refuse without activation or marker side effects',!G.marketWishStatus().ok&&!G.marketWishQuote('tin_cup').ok&&JSON.stringify(G.state)===before);
 fresh();s.godhood.active=[];T.ok('non-Market bearer cannot inspect quotes or familiar suggestions',!G.marketWishQuote('tin_cup').ok&&G.marketWishSuggestions().length===0);
 fresh();G.tbfight={over:false};T.ok('camp market choice refuses during a live fight',!G.marketWishStatus().ok&&!G.marketWishQuote('tin_cup').ok);G.tbfight=null;
 fresh();q=G.marketWishQuote(null);T.ok('existing automatic best-weapon choice remains quoteable and payable',q.ok&&G.activateAbility('god.name_price',q.itemId)===true&&s.inventory[0].itemId===q.itemId);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
