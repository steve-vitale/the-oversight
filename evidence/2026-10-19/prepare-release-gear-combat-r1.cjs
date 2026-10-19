'use strict';
const fs=require('fs'),assert=require('assert/strict'),K=require('../../scripts/godpath/lib');
(async()=>{
 const[input,kind,out]=process.argv.slice(2);if(!['craft','trade'].includes(kind)||!out)throw Error('Pass earned-gear receipt, kind and fresh output');
 const carried=JSON.parse(fs.readFileSync(input)).carried[kind],memory=new Map(Object.entries(carried.storage));global.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size}};
 const G=await K.load({seed:42,narration:true});assert(G.load(carried.live.key));const s=G.state.scholar;for(const key of ['equipped','inventory','health','kcal'])assert.deepEqual(s[key],carried.live[key]);
 const earned=JSON.parse(JSON.stringify({equipped:s.equipped,inventory:s.inventory}));G.map.px=2;G.map.py=2;G.playerTile().type='forest_floor';s.insideHaven=false;G.genDetail(2,2);
 K.fight(G,'hushwolf',{px:4,py:4,mx:kind==='craft'?6:5,my:4});assert(G.tbfight&&G.tbIsPlayerTurn());assert.deepEqual(s.equipped,earned.equipped);assert.deepEqual(s.inventory,earned.inventory);
 G.save();fs.writeFileSync(out,JSON.stringify({fixture:'A declared outdoor encounter around gear actually earned/equipped/saved through the phone UI. Only environment and combat placement are arranged. No gear, ammo, health or victory grant; starting enemy actions may hurt the bearer. Other residents are excluded from this disposable encounter.',sourceReceipt:input,kind,expected:{earned,ammo:G.ammoCount('arrow'),weapon:G.equippedWeapon()},storage:Object.fromEntries(memory)},null,2)+'\n',{flag:'wx'});console.log({kind,health:s.health,ammo:G.ammoCount('arrow'),weapon:G.equippedWeapon()});
})().catch(e=>{console.error(e.stack);process.exitCode=1});
