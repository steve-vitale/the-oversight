'use strict';
const path=require('path'),i=process.argv.indexOf('--root'),K=i<0?require('./lib'):require(path.resolve(process.argv[i+1],'scripts/godpath/lib'));
const T=K.reporter('market delivery');
(async()=>{
 const saves=new Map();globalThis.localStorage={getItem:k=>saves.get(k)??null,setItem:(k,v)=>saves.set(k,String(v)),removeItem:k=>saves.delete(k),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:Number(process.env.SEED||7)});let s;
 function fresh(){G.over=false;G.won=false;G.tbfight=null;K.newRun(G);s=G.state.scholar;s.day=400;s.health=100;s.kcal=2000;s.inventory=[];s.equipped={};s.abilities=[];s.backgroundAbilities=[];s.godhood={active:['market_god'],recognized:{market_god:400},marketDebt:0};}
 for(const def of G.data.items.filter(d=>d.class==='food')){
  fresh();const ok=G.useAbility('god','name_price',def.id),it=s.inventory.find(x=>x.itemId===def.id),paid=s.kcal;
  T.ok(def.id+': actual paid wish is one edible unspoiled unit',ok&&it?.units===1&&it.kcalEach===def.kcalEach&&G.edibleCount()===1&&!G.isSpoiled(it));
  G.eatOne(s.inventory.indexOf(it));
  T.ok(def.id+': actual pack bite consumes delivery and restores its authored food',!s.inventory.some(x=>x.itemId===def.id)&&s.kcal>paid&&s.kcal<=paid+def.kcalEach);
 }
 fresh();G.useAbility('god','name_price','peanut_butter');const expiry=s.inventory[0].spoilDay,remaining=s.kcal;G.save();const key=G.state.runKey;
 T.ok('Continue retains actual edible metadata and paid food together',G.load(key)&&G.state.scholar.inventory[0].kcalEach===800&&G.state.scholar.inventory[0].spoilDay===expiry&&G.state.scholar.kcal===remaining);s=G.state.scholar;
 s.day=expiry+Math.max(0,Math.round(G.modTarget('food.spoilage_days',0)));const before=s.kcal;G.eatOne(0);T.ok('real expiry refuses the delivered food without consuming it',s.kcal===before&&s.inventory[0]?.units===1);
 for(const id of ['wood','branch','fiber','stone']){fresh();const ok=G.useAbility('god','name_price',id);T.ok(id+': actual paid delivery enters the real material count',ok&&G.materialCount(id)===1&&s.inventory[0].kg===G.data.items.find(d=>d.id===id).kg);}
 fresh();G.useAbility('god','name_price','stone');s.inventory.push({material:'vine',units:1,name:'Prepared vine',kg:0.1});G.learnRecipe('stone_knife',3);const result=G.craft('stone_knife');
 T.ok('real crafting consumes the purchased stone rather than rejecting missing material',G.materialCount('stone')===0&&G.materialCount('vine')===0);
 T.ok('craft success makes real usable gear; honest craft failure never keeps ingredients',result===true?s.inventory.some(x=>x.itemId==='stone_knife'):result===null&&G.materialCount('stone')===0);
 fresh();const ok=G.useAbility('god','name_price','tin_cup');T.ok('ordinary personal object delivers one unit without fabricating bond or owner history',ok&&s.inventory[0]?.itemId==='tin_cup'&&s.inventory[0].units===1&&!s.inventory[0].owner&&!s.inventory[0].bonded);
 fresh();G.useAbility('god','name_price','bolt');T.ok('purchased bolt enters actual ammo and can be spent',G.ammoCount('bolt')===1&&G.spendAmmo('bolt',1)&&G.ammoCount('bolt')===0);
 fresh();G.useAbility('god','name_price','phase_blade');const alien=s.inventory[0];T.ok('alien delivery conceals its effect until actual reveal',alien.alienLoot===true&&alien.alienEffectHidden===true);G.alienLootReveal(alien);T.ok('normal alien reveal consumes the hidden-effect flag',alien.alienEffectHidden===false);
 fresh();G.useAbility('god','name_price','peanut_butter');const recipient=G.state.village.roster.find(id=>id!==G.villagerId&&G.npcAge(id)>=18);if(!recipient)throw Error('Missing actual resident');G.npcNeeds(recipient).hunger=70;G.giveFood(recipient);
 T.ok('real food gift consumes purchased food and relieves an actual resident',!s.inventory.some(x=>x.itemId==='peanut_butter')&&G.npcNeeds(recipient).hunger<70);
 fresh();s.kcal=50;T.ok('food wish still respects the public hunger gate',G.useAbility('god','name_price','peanut_butter')===false&&s.kcal===50&&s.inventory.length===0&&s.godhood.marketDebt===0);
 fresh();s.kcal=600;G.useAbility('god','name_price','peanut_butter');T.ok('unaffordable food keeps the authored marker and one real delivery',s.godhood.marketDebt===1&&s.inventory[0]?.kcalEach===800&&s.inventory[0].units===1&&s.kcal===560);
 const count=s.inventory.length,food=s.kcal,debt=s.godhood.marketDebt;T.ok('repeat refusal cannot mint food or change its debt/payment',!G.useAbility('god','name_price','peanut_butter')&&s.inventory.length===count&&s.kcal===food&&s.godhood.marketDebt===debt);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
