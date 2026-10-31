'use strict';
const K=require('./lib'),T=K.reporter('party-opening-turn');
(async()=>{
 // Seed refreshed 7 -> 64 on 2026-10-31 (lootabilities build): items.json
 // gained two tier-1 loot pieces, which re-rolled seeded generation; at
 // seed 7 the new village fields extra fight joiners, breaking this
 // fixture's exact-3-humans shape. Seed 64 verified to the same shape:
 // exactly the player + two companions in the opening fight, distinct
 // squares, each companion added exactly once. No assertion changed.
 const G=await K.load({seed:64});K.newRun(G);
 const ids=G.state.village.roster.filter(id=>id!==G.villagerId).slice(0,2);
 if(ids.length!==2)throw Error('Need two actual companions');
 G.state.village.party=ids.slice();
 G.state.scholar.mx=8;G.state.scholar.my=8;
 for(const id of ids)G.state.village.positions[id]={mx:0,my:0};
 T.ok('fixture uses two real distant party members',G.partyMembers().length===2&&ids.every(id=>G.state.village.positions[id].mx===0));
 G.startCombat('bulldozer');
 const f=G.tbfight;
 T.ok('real entry added each companion exactly once',!!f&&!f.over&&ids.every(id=>f.fighters.filter(x=>x.villagerId===id).length===1));
 T.ok('opening initiative still selects the player after allies join',G.tbCurrent()?.key==='p'&&G.tbIsPlayerTurn());
 T.ok('initiative contains every real fighter exactly once',new Set(f.order).size===f.fighters.length&&f.order.length===f.fighters.length);
 T.ok('joined humans occupy distinct squares',new Set(f.fighters.filter(x=>['player','villager','ally'].includes(x.kind)).map(x=>x.mx+','+x.my)).size===3);
 const saves=new Map();globalThis.localStorage={getItem:k=>saves.get(k)??null,setItem:(k,v)=>saves.set(k,String(v)),removeItem:k=>saves.delete(k),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const snapshot=()=>({order:G.tbfight.order.slice(),actor:G.tbCurrent()?.key,round:G.tbfight.round,fighters:G.tbfight.fighters.map(x=>({key:x.key,hp:x.hp,mx:x.mx,my:x.my,acted:x.acted,moveLeft:x.moveLeft}))});
 const before=snapshot();G.save();const key=G.state.runKey;
 T.ok('native save and Continue keep the real opening actor and fighters',G.load(key)&&JSON.stringify(snapshot())===JSON.stringify(before));
 T.ok('Continue exposes a usable player turn',G.tbIsPlayerTurn());
 const round=G.tbfight.round;G.tbPlayerWait();
 T.ok('actual Wait advances the round and returns to a usable turn',G.tbfight&&G.tbfight.round>round&&G.tbIsPlayerTurn());
 const ally=G.tbfight.fighters.find(x=>ids.includes(x.villagerId)),person=G.vpOf(ally.villagerId);
 T.ok('companion state still comes from a real person',!!person&&Number.isFinite(ally.hp)&&ally.hp<=ally.maxHp);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
