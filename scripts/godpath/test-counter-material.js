'use strict';
const K=require('./lib'),T=K.reporter('counter material');
(async()=>{
  const G=await K.load({seed:20261017});
  const fresh=()=>{K.newRun(G);const s=G.state.scholar;s.abilities=[];s.backgroundAbilities=[];s.inventory=[];s.prepStash=[];s.water=[{liters:2,clean:true}];s.day=10;s.dayTicks=0;s.health=100;s.kcal=2400;G.dayPart=0;G.state.activeContest=null;G.pendingEncounter=false;G.pendingMonsterId=null;return s;};
  const hide=(n=3)=>({name:'Cured hide',plantId:'animal_hide',material:'hide',units:n,kg:0.8,kcalEach:0,spoilDay:9999,quality:'fine',owner:'proof-owner',ashOf:'proof-provenance',tags:['proof']});
  const take=(i,n)=>G.takePrepMaterial(i,n);
  const relevant=s=>JSON.stringify({inventory:s.inventory,counter:s.prepStash,ticks:s.dayTicks,kcal:s.kcal,recipes:G.state.codex.recipes});
  let s=fresh(),it=hide(),before={...it};s.prepStash=[it];
  let r=take(0,2);
  T.ok('partial pickup transfers only actual requested units',r.ok&&r.taken===2&&r.remaining===1&&s.inventory[0].units===2&&s.prepStash[0].units===1);
  T.ok('all material metadata and provenance survive without normalization',JSON.stringify(s.inventory[0])===JSON.stringify({...before,units:2})&&s.inventory[0]!==it);
  T.ok('successful handling costs exactly the existing stash-pickup clock',s.dayTicks===2);
  T.ok('hide handling teaches only seen knowledge',G.state.codex.recipes.hide_armor.level===1);
  r=take(0,100);
  T.ok('request above stock never manufactures units',r.taken===1&&s.prepStash.length===0&&G.materialCount('hide')===3&&s.dayTicks===4);
  const settled=relevant(s);r=take(0);
  T.ok('repeating an empty pickup duplicates nothing and costs nothing',!r.ok&&relevant(s)===settled);

  s=fresh();G.state.codex.recipes.hide_armor={level:3,via:'proof'};s.prepStash=[hide(2)];s.inventory=[{name:'Vine',material:'vine',units:1,kg:0.1}];
  r=take(0);const crafted=G.craft('hide_armor');
  T.ok('known recipe remains known without artificial level gain',G.state.codex.recipes.hide_armor.level===3);
  T.ok('actual counter pickup funds actual armor crafting',r.taken===2&&crafted===true&&s.inventory.some(i=>(i.itemId||i.id)==='hide_armor'));
  T.ok('craft consumes the retrieved materials rather than counter ghosts',G.materialCount('hide')===0&&G.materialCount('vine')===0&&s.prepStash.length===0);

  for(const special of [false,true]){
    s=fresh();if(special)K.giveAbility(G,'hollow_bones',{force:true});
    const mult=G.modTarget('carry.weight_mult',1),cap=G.carryCapacity();
    if(special)T.ok('weight control uses a real authored hollow-bones modifier',G.hasAbility('hollow_bones')&&mult>0&&mult<1);
    s.inventory=[{name:'Ballast',units:1,kg:cap/mult-2-1.5*0.8}];s.prepStash=[hide(3)];
    r=take(0);
    T.ok(`water and ${special?'actual hollow-bones modifier':'ordinary body'} limit pickup to what fits`,r.ok&&r.taken===1&&s.prepStash[0].units===2&&G.packWeight()<=cap+1e-9);
    const full=relevant(s);r=take(0);
    T.ok('insufficient remaining space leaves stock/time/knowledge unchanged',!r.ok&&relevant(s)===full);
  }

  const reject=(label,prepare,args=[0])=>{s=fresh();s.prepStash=[hide()];prepare(s);const before=relevant(s),r=take(...args);T.ok(label,!r.ok&&r.taken===0&&relevant(s)===before);};
  for(const index of [-1,0.5,NaN,Infinity,3,'0'])reject('invalid index refuses without loss: '+String(index),()=>{},[index]);
  for(const n of [0,-1,0.5,NaN,Infinity,null,'2'])reject('invalid quantity refuses without loss: '+String(n),()=>{},[0,n]);
  reject('zero-unit counter stack cannot resurrect',s=>s.prepStash[0].units=0);
  reject('invalid stack quantity cannot be synthesized',s=>s.prepStash[0].units=1.5);
  reject('negative weight cannot create capacity',s=>s.prepStash[0].kg=-1);
  reject('unknown weight is refused rather than treated as weightless',s=>delete s.prepStash[0].kg);
  reject('infinite weight is refused',s=>s.prepStash[0].kg=Infinity);
  reject('food cannot masquerade as crafting stock',s=>Object.assign(s.prepStash[0],{foodKind:'meat',foodState:'cleaned',kcalEach:500}));
  reject('unnamed raw food cannot use a material label to bypass preparation',s=>s.prepStash[0].rawKcal=500);
  reject('hidden calories stay hidden on the counter',s=>s.prepStash[0].hiddenKcal=500);
  reject('opaque lumps stay opaque and on the counter',s=>s.prepStash[0].lump={unknown:{units:3}});
  reject('bonded belongings cannot use the material path',s=>s.prepStash[0].bonded=true);
  reject('spoiled stock is not restored by moving it',s=>{s.prepStash[0].spoilDay=s.day-G.spoilBonusDays()-2;T.ok('stock is actually spoiled under this bearer\'s protection',G.isSpoiled(s.prepStash[0]));});
  reject('far-away full integration cannot teleport counter stock',s=>{s.integration=100;G.map.px=0;G.map.py=0;});
  reject('exile cannot reach the old Haven counter',s=>s.exiled=true);
  reject('game-over action is refused',()=>G.over=true);
  reject('fallen bearer cannot handle materials',s=>s.health=0);
  reject('pending encounter must be answered first',()=>{G.pendingEncounter=true;G.pendingMonsterId='hushwolf';});
  reject('active contest cannot bypass its action window',()=>G.state.activeContest={kind:'proof'});
  s=fresh();s.prepStash=[hide()];K.fight(G,'hushwolf',{px:4,py:4,mx:5,my:4});const fightBefore=relevant(s);r=take(0);
  T.ok('real live combat refuses counter handling without cost',!r.ok&&relevant(s)===fightBefore);

  s=fresh();s.prepStash=[{name:'Bone',material:'bone',kg:0.2}];r=take(0);
  T.ok('legacy omitted units mean the actual single item',r.ok&&r.taken===1&&s.inventory[0].units===1&&s.prepStash.length===0);
  T.ok('ordinary non-hide materials grant no hidden armor knowledge',!(G.state.codex.recipes.hide_armor||{}).level);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
