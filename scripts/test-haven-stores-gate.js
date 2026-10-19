#!/usr/bin/env node
'use strict';
// Physical hall/System access through the complete seeded production runtime.
// A successful withdrawal requires both access and actual carrying capacity.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const arg=(n,f)=>{const i=process.argv.indexOf('--'+n);return i<0?f:process.argv[i+1]};
const root=path.resolve(arg('root',path.join(__dirname,'..'))),H=require(path.join(root,'scripts/sim-harness')),seed=Number(process.env.SEED||20261017);
let checks=0;const receipt={seed,episodes:[]},ok=(n,c)=>{assert(c,n);checks++;console.log('PASS '+n)};
(async()=>{
 const {Game:G,loadFails}=await H.loadGame({seed,narration:true});ok('complete production modules loaded',loadFails.length===0);await H.quietLog(()=>H.setupGame(G));
 const s=G.state.scholar,v=G.state.village;let haven,wild;
 for(let y=0;y<G.map.tiles.length;y++)for(let x=0;x<G.map.tiles[y].length;x++){const t=G.map.tiles[y][x];if(t.type==='haven'&&!haven)haven={x,y};if(t.type!=='haven'&&t.type!=='ruin'&&!wild)wild={x,y};}
 ok('real hall and wild tiles exist',haven&&wild);const home=()=>{G.map.px=haven.x;G.map.py=haven.y},away=()=>{G.map.px=wild.x;G.map.py=wild.y};
 s.exiled=false;G.state.systemArrived=false;s.integration=5;home();s.insideHaven=true;
 ok('physical hall grants access before the System',G.havenStoresAccess()==='inside');s.insideHaven=false;ok('grounds outside the hall grant no access',G.havenStoresAccess()==='none');away();ok('wild tile grants no pre-System access',G.havenStoresAccess()==='none');
 s.insideHaven=true;ok('stale inside flag on a wild tile does not grant physical access',G.havenStoresAccess()==='none');s.insideHaven=false;
 G.state.systemArrived=true;s.integration=85;ok('actual full integration stage is three',G.integrationStage()===3);ok('full integration manifests remote stores in the wild',G.havenStoresAccess()==='remote');home();ok('full integration manifests stores on hall grounds',G.havenStoresAccess()==='remote');s.insideHaven=true;ok('physical hall takes precedence over remote access',G.havenStoresAccess()==='inside');
 s.integration=50;s.insideHaven=false;ok('partial integration outside the hall grants no access',G.havenStoresAccess()==='none');s.integration=5;s.insideHaven=true;ok('low integration inside the hall retains access',G.havenStoresAccess()==='inside');
 s.inventory=[];s.kcal=2400;s.health=G.maxHealth();
 const carry=()=>s.inventory.reduce((n,i)=>n+(i.kg||0)*(i.units||1),0)+G.waterWeight();
 const stock=()=>{v.pantry=[{name:'Prepared pantry proof food',kcalEach:100,units:5,spoilDay:99,safe:true,kg:0.2}];v.stash=v.stash||{};const stash=G.stashState();stash.materials.wood=10;return stash;};
 const invUnits=()=>s.inventory.filter(i=>i.name==='Prepared pantry proof food').reduce((n,i)=>n+(i.units||0),0);
 const pantryUnits=()=>v.pantry.reduce((n,i)=>n+(i.units||0),0);
 const said=()=>G.log.map(l=>String(l.text??l)).join('\n');
 function blocked(label){
  const stash=stock(),before={food:pantryUnits(),wood:stash.materials.wood,inventory:JSON.stringify(s.inventory)};G.log.length=0;
  ok(label+' access is denied',G.havenStoresAccess()==='none');G.takeFromPantry(0);ok(label+' single take refuses without moving food',pantryUnits()===before.food&&JSON.stringify(s.inventory)===before.inventory);G.takeFromPantryBulk({0:2});ok(label+' bulk take refuses without moving food',pantryUnits()===before.food&&JSON.stringify(s.inventory)===before.inventory);G.takeMaterial('wood',1);ok(label+' material take refuses without moving stock',stash.materials.wood===before.wood&&JSON.stringify(s.inventory)===before.inventory);ok(label+' refusal explains the boundary: '+said(),/pantry is in the hall|exil|cast out|no longer|not yours|closed to you/i.test(said()));
 }
 G.state.systemArrived=false;s.integration=5;s.insideHaven=false;away();blocked('wild pre-System');
 home();s.insideHaven=true;s.exiled=true;blocked('exile in hall');G.state.systemArrived=true;s.integration=85;s.insideHaven=false;away();blocked('exile with full integration');s.exiled=false;
 for(const remote of [false,true]){
  s.inventory=[];stock();G.state.systemArrived=remote;s.integration=remote?85:5;s.insideHaven=!remote;remote?away():home();const mode=remote?'remote':'inside';
  ok(mode+' eligible access is actual',G.havenStoresAccess()===mode);ok(mode+' prepared food fits actual pack',carry()+0.6<=G.carryCapacity());const before={pantry:pantryUnits(),held:invUnits(),kcal:s.kcal};G.takeFromPantry(0);ok(mode+' single withdrawal moves exactly one unit',pantryUnits()===before.pantry-1&&invUnits()===before.held+1);G.takeFromPantryBulk({0:2});ok(mode+' bulk withdrawal moves exactly two more units',pantryUnits()===before.pantry-3&&invUnits()===before.held+3);ok(mode+' taking packs food rather than consuming it',s.kcal===before.kcal);
  receipt.episodes.push({kind:mode,before,after:{pantry:pantryUnits(),held:invUnits(),kcal:s.kcal},carry:carry(),capacity:G.carryCapacity()});
 }
 // Access is necessary, not sufficient: a real overweight pack still refuses.
 s.inventory=[];stock();G.addMaterial('wood',1000);ok('actual wood fixture exceeds capacity',carry()>G.carryCapacity());const before={pantry:pantryUnits(),held:JSON.stringify(s.inventory)};G.log.length=0;G.takeFromPantry(0);ok('overweight single take leaves all stock untouched',pantryUnits()===before.pantry&&JSON.stringify(s.inventory)===before.held);ok('overweight single take explains capacity',/Too heavy/.test(said()));
 receipt.checks=checks;const output=arg('out',null);if(output)fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');console.log(checks+' passed, 0 failed');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
