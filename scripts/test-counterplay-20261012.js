#!/usr/bin/env node
// Prepared policy counter contracts: one shared runtime per child, ordinary
// bearer capacity, public actions and no private turn forcing. Most windup/
// target-priority cases explicitly prepare availability; mosquito recovery
// and active capable retreat follow actual engine events. Historical competent
// is deliberately a non-escaping default-OFF reference, not active capable.
'use strict';
const K=require('./godpath/lib'),a=require('assert/strict'),cp=require('child_process');
const checks=[];let scene;
for(const flag of ['COMPETENT_DPS_RACE','COMPETENT_DIRECTIONAL_FLEE','COMPETENT_EXIT_VERIFIED_FLEE','COMPETENT_FIGHT_ASSESS'])delete process.env[flag];
const { competent } = require('./policies/competent');

let passes = 0, fails = 0;
function check(name, cond, detail) {
  checks.push({name,condition:!!cond,detail});if(cond)passes++;else fails++;
}

function midOf(m) { return m.monsterId || (m.mdef || {}).id; }
function liveMonsters(Game) {
  const f = Game.tbfight;
  return f ? f.fighters.filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled) : [];
}

// Bounded public-action driver; never advances a private turn.
// opts.beforePlayerTurn(): hook to inject telegraphs etc. opts.stopWhen():
// early exit (e.g. discovered). Returns iterations run.
function drive(Game,ctx,maxIters,opts={}){
 const f=Game.tbfight,p=Game.tbFighter('p'),bearer=Game.villagerId,scholar=Game.state.scholar;let n=0;
 while(Game.tbfight===f&&!f.over&&!Game.over&&p.alive&&Game.villagerId===bearer&&n++<(maxIters||40)){
  if(opts.stopWhen&&opts.stopWhen())break;a(Game.tbIsPlayerTurn(),'Headless engine must return the real player turn');
  if(opts.beforePlayerTurn)opts.beforePlayerTurn();
  const handled=(opts.policy||competent).fight(Game,ctx);
  if(!handled&&Game.tbfight===f&&!f.over){const target=liveMonsters(Game)[0];if(target)Game.tbPlayerStrike(target.key);if(Game.tbfight===f&&!f.over&&Game.tbIsPlayerTurn())Game.tbPlayerWait();}
 }
 scene={position:[p.mx,p.my],map:[Game.map.px,Game.map.py],lines:Game.log.slice(-16).map(String),bearer,finalBearer:Game.villagerId,hp:p.hp,max:p.maxHp,health:Game.state.scholar.health,over:f.over,result:f.result,ctx:{beastTricks:ctx.beastTricks,fled:ctx.fled,fledBad:ctx.fledBad,fledHeld:ctx.fledHeld},monsters:f.fighters.filter(x=>x.kind==='monster').map(x=>({key:x.key,id:midOf(x),hp:x.hp,phase:x.mosqPhase,altitude:x.altitude,discharged:x._counterDischarged}))};check('same living bearer and synchronized real HP after policy play',Game.villagerId===bearer&&Game.state.scholar===scholar&&p.alive&&p.hp>0&&scholar.health===p.hp);return n;
}
async function freshGame(seed){const Game=await K.load({seed,narration:true});K.newRun(Game);Game.state.monsterCounters={};Game.state.codex.monsters=Game.state.codex.monsters||{};return Game;}
function fight(Game,id,opts={}){const grid=Game.genDetail(Game.map.px,Game.map.py);for(const row of grid)row.fill('dirt');return K.fight(Game,id,{px:3,py:4,mx:4,my:4,...opts});}
function hintKnown(Game, mid) {
  Game.state.codex.monsters[mid] = Object.assign(Game.state.codex.monsters[mid] || {}, { stage: 'slain' });
}
// Counter cases retain ordinary actual bearer capacity. Real escape and
// historical/held retreat semantics have separate fixtures below.
function verifyBody(Game){const p=Game.tbFighter('p');a(p&&p.hp>0&&p.maxHp===Game.maxHealth()&&p.hp===Game.state.scholar.health,'Prepared counter body remains real');}
function discovered(Game, mid) { return !!((Game.state.monsterCounters || {})[mid]); }

async function tShout() {
  const Game = await freshGame(1101);
  hintKnown(Game, 'hummice');
  fight(Game,'hummice');
  if (!Game.tbfight) { check('shout: fight starts', false); return; }
  verifyBody(Game);
  const f = Game.tbfight, ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'hummice') });
  check('shout: policy bellows (trick performed)', (f.shouts | 0) > 0 || (ctx.beastTricks | 0) > 0,
    'shouts=' + (f.shouts | 0) + ' beastTricks=' + (ctx.beastTricks | 0));
  check('shout: hummice counter discovered', discovered(Game, 'hummice'));
}

async function tOfferFood() {
  const Game = await freshGame(1102);
  hintKnown(Game, 'lockpick_raccoon');
  const def=K.readJSON('src/data/items.json').find(x=>x.id==='dried_apples');a(def);
  Game.state.scholar.inventory=[1,2].map(()=>({itemId:def.id,name:def.name,units:2,kcalEach:def.kcalEach,kg:def.kg}));
  fight(Game,'lockpick_raccoon');
  if (!Game.tbfight) { check('offer_food: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'lockpick_raccoon') });
  check('offer_food: policy bribes (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('offer_food: lockpick_raccoon counter discovered', discovered(Game, 'lockpick_raccoon'));
  check('offer_food pays exactly one real canonical unit including returned theft',Game.state.scholar.inventory.filter(x=>x.itemId==='dried_apples').reduce((n,x)=>n+x.units,0)===3&&Game.tbfight==null);
}

async function tWait() {
  const Game = await freshGame(1103);
  hintKnown(Game, 'heckler');
  fight(Game,'heckler');
  if (!Game.tbfight) { check('wait: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'heckler') });
  check('wait: policy waits (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('wait: heckler counter discovered', discovered(Game, 'heckler'));
}

async function tKeepDistance() {
  const Game = await freshGame(1104);
  hintKnown(Game, 'speedbump_turtle'); // keep_distance, tiles 2
  fight(Game,'speedbump_turtle');
  if (!Game.tbfight) { check('keep_distance: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'speedbump_turtle') });
  check('keep_distance: policy backs off (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('keep_distance: speedbump_turtle counter discovered', discovered(Game, 'speedbump_turtle'));
}

async function tMoveWindup() {
  const Game = await freshGame(1105);
  hintKnown(Game, 'gallowdeer'); // move_windup
  fight(Game,'gallowdeer');
  if (!Game.tbfight) { check('move_windup: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  const p0 = Game.tbFighter('p');
  const sx = p0.mx, sy = p0.my;
  let moved = false;
  drive(Game, ctx, 25, {
    stopWhen: () => discovered(Game, 'gallowdeer'),
    beforePlayerTurn: () => {
      const p = Game.tbFighter('p');
      if (p && (p.mx !== sx || p.my !== sy)) moved = true;
      const m = liveMonsters(Game).find(x => midOf(x) === 'gallowdeer');
      if (m && !discovered(Game, 'gallowdeer')) m.telegraph = { cells: [] };
    },
  });
  check('move_windup: policy moves during the windup', moved || (ctx.beastTricks | 0) > 0,
    'moved=' + moved + ' beastTricks=' + (ctx.beastTricks | 0));
  check('move_windup: gallowdeer counter discovered', discovered(Game, 'gallowdeer'));
}

async function tSidestep() {
  const Game = await freshGame(1106);
  hintKnown(Game, 'bulldozer'); // sidestep
  fight(Game,'bulldozer');
  if (!Game.tbfight) { check('sidestep: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  drive(Game, ctx, 30, {
    stopWhen: () => discovered(Game, 'bulldozer'),
    beforePlayerTurn: () => {
      const m = liveMonsters(Game).find(x => midOf(x) === 'bulldozer');
      const p = Game.tbFighter('p');
      if (m && p && !discovered(Game, 'bulldozer')) {
        // the lane runs through the player's tile — step OFF it
        m.telegraph = { cells: [{ cx: p.mx, cy: p.my }, { cx: Math.min(8, p.mx + 1), cy: p.my }] };
      }
    },
  });
  check('sidestep: policy steps off the lane (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('sidestep: bulldozer counter discovered', discovered(Game, 'bulldozer'));
}

async function tMoveX2() {
  const Game = await freshGame(1107);
  hintKnown(Game, 'nightcourt'); // move_x2, plain
  fight(Game,'nightcourt');
  if (!Game.tbfight) { check('move_x2: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  drive(Game, ctx, 30, { stopWhen: () => discovered(Game, 'nightcourt') });
  check('move_x2: policy dodges twice (trick performed)', (ctx.beastTricks | 0) >= 2,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('move_x2: nightcourt counter discovered', discovered(Game, 'nightcourt'));
}

async function tMoveX2Tiles() {
  const Game = await freshGame(1108);
  hintKnown(Game, 'warranty_caller'); // move_x2, tiles: 2
  fight(Game,'warranty_caller');
  if (!Game.tbfight) { check('move_x2/tiles: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  drive(Game, ctx, 30, { stopWhen: () => discovered(Game, 'warranty_caller') });
  check('move_x2/tiles: policy covers 2+ tiles twice', (ctx.beastTricks | 0) >= 2,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('move_x2/tiles: warranty_caller counter discovered', discovered(Game, 'warranty_caller'));
}

async function tStrikeLead() {
  const Game = await freshGame(1109);
  hintKnown(Game, 'hushwolf'); // strike_lead
  fight(Game,'hushwolf');
  const f = Game.tbfight;
  if (!f) { check('strike_lead: fight starts', false); return; }
  verifyBody(Game);
  // add a WEAKER non-lead packmate: the old policy strikes the weakest
  // (no discovery); the trick strikes the lead (first-spawned).
  const m0 = f.fighters.find(x => x.kind === 'monster');
  m0.hp = m0.maxHp = 200;
  const free = [[1, 1], [1, 7], [7, 1], [7, 7]].find(([tx, ty]) =>
    !f.fighters.some(x => x.mx === tx && x.my === ty));
  const m1 = Object.assign({}, m0, {
    key: 'm_test1', hp: 5, maxHp: 5, mx: free[0], my: free[1], telegraph: null,
  });
  f.fighters.push(m1);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'hushwolf') });
  check('strike_lead: policy wounds the lead (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_lead: hushwolf counter discovered', discovered(Game, 'hushwolf'));
}

async function tStrikeWindup() {
  const Game = await freshGame(1110);
  hintKnown(Game, 'mirrormoth'); // strike_windup
  fight(Game,'mirrormoth');
  if (!Game.tbfight) { check('strike_windup: fight starts', false); return; }
  verifyBody(Game);
  const ctx = {};
  drive(Game, ctx, 25, {
    stopWhen: () => discovered(Game, 'mirrormoth'),
    beforePlayerTurn: () => {
      const m = liveMonsters(Game).find(x => midOf(x) === 'mirrormoth');
      if (m && !discovered(Game, 'mirrormoth')) m.telegraph = { cells: [] };
    },
  });
  check('strike_windup: policy hits during the fold (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_windup: mirrormoth counter discovered', discovered(Game, 'mirrormoth'));
}

async function tStrikeRecovery(){
 const Game=await freshGame(1111);hintKnown(Game,'giant_mosquito');Game.state.scholar.equipped={};fight(Game,'giant_mosquito');
 const f=Game.tbfight,p=Game.tbFighter('p'),m=liveMonsters(Game).find(x=>midOf(x)==='giant_mosquito'),hp=p.hp;let waits=0;
 while(Game.tbfight===f&&!f.over&&p.alive&&m.mosqPhase!=='heavy'&&waits++<8)Game.tbPlayerWait();
 check('recovery setup opens from an actual landed drink',m.mosqPhase==='heavy'&&m.altitude==='low'&&m._counterDischarged&&!m.telegraph&&p.hp<hp&&p.hp>0);
 const before=m.hp,ctx={};drive(Game,ctx,4,{stopWhen:()=>discovered(Game,'giant_mosquito')});
 check('strike_recovery: policy hits after it drinks (trick performed)',ctx.beastTricks>0&&m.hp<before);
 check('strike_recovery: giant_mosquito counter discovered',discovered(Game,'giant_mosquito'));
}

async function tStrikeFirst() {
  const Game = await freshGame(1112);
  hintKnown(Game, 'union_rep'); // strike_first
  fight(Game,'union_rep');
  const f = Game.tbfight;
  if (!f) { check('strike_first: fight starts', false); return; }
  verifyBody(Game);
  // a weaker bystander: the old policy's first strike lands on it
  // (no discovery); the trick kills the rep first.
  const m0 = f.fighters.find(x => x.kind === 'monster');
  const free = [[1, 1], [1, 7], [7, 1], [7, 7]].find(([tx, ty]) =>
    !f.fighters.some(x => x.mx === tx && x.my === ty));
  const wdef = (Game.data.monsters || []).find(d => d.id === 'hushwolf');
  f.fighters.push({
    key: 'm_bystander', kind: 'monster', monsterId: 'hushwolf', mdef: wdef,
    name: 'bystander', emoji: '🐺', hp: 5, maxHp: 5, speed: 3,
    mx: free[0], my: free[1], alive: true, fled: false, telegraph: null,
  });
  void m0;
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'union_rep') });
  check('strike_first: policy hits the rep first (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_first: union_rep counter discovered', discovered(Game, 'union_rep'));
}

async function tStrikeNonhead() {
  const Game = await freshGame(1113);
  hintKnown(Game, 'ducks_in_a_row'); // strike_nonhead
  fight(Game,'ducks_in_a_row');
  const f = Game.tbfight;
  if (!f) { check('strike_nonhead: fight starts', false); return; }
  verifyBody(Game);
  const segs = f.fighters.filter(x => x.kind === 'monster');
  check('strike_nonhead: ducks spawn segments', segs.length > 1 && segs.some(x => (x.segmentIndex | 0) > 0),
    'segments=' + segs.length);
  const ctx = {};
  drive(Game, ctx, 30, { stopWhen: () => discovered(Game, 'ducks_in_a_row') });
  check('strike_nonhead: policy breaks the line (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_nonhead: ducks_in_a_row counter discovered', discovered(Game, 'ducks_in_a_row'));
}

async function tFreshWeapon() {
  const Game = await freshGame(1114);
  hintKnown(Game, 'understudy'); // fresh_weapon
  const inv = Game.state.scholar.inventory;
  inv.push({ itemId: 'stone_knife', name: 'Stone knife', units: 1 });
  inv.push({ itemId: 'hunting_spear', name: 'Hunting spear', units: 1 });
  fight(Game,'understudy');
  const f = Game.tbfight;
  if (!f) { check('fresh_weapon: fight starts', false); return; }
  verifyBody(Game);
  const m = f.fighters.find(x => x.kind === 'monster');
  // equip the knife by inventory index
  const ki = inv.findIndex(i => i && i.itemId === 'stone_knife');
  // NOTE: Game.equip returns null even on success — verify via equipped name
  try { Game.equip(ki, 'melee'); } catch (e) { throw e; }
  try { Game.equip(Game.state.scholar.inventory.findIndex(i => i && i.itemId === 'stone_knife'), 'ranged'); } catch (e) { throw e; }
  check('fresh_weapon: knife equips', /knife/i.test((Game.equippedWeapon() || {}).name || ''),
    'equipped=' + ((Game.equippedWeapon() || {}).name || '?'));
  // the understudy SEES the knife: one honest strike first
  a(Game.tbIsPlayerTurn(),'Real player owns the initial weapon demonstration');
  try { Game.tbPlayerStrike(m.key); } catch (e) { throw e; }
  const seen = Object.keys(m.usSeen || {});
  check('fresh_weapon: understudy has seen the knife', seen.length > 0, 'seen=' + JSON.stringify(seen));
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'understudy') });
  const nowW = (Game.equippedWeapon() || {}).name || '';
  check('fresh_weapon: policy switches weapon mid-fight', /spear/i.test(nowW), 'equipped=' + nowW);
  check('fresh_weapon: understudy counter discovered', discovered(Game, 'understudy'));
}

// KNOWLEDGE GATE: no hint, no trick. The policy must fight normally.
async function tGateNoHint() {
  const Game = await freshGame(1115);
  // NOTE: no hintKnown call — the village never slew a hummice
  fight(Game,'hummice');
  if (!Game.tbfight) { check('gate/no-hint: fight starts', false); return; }
  verifyBody(Game);
  const f = Game.tbfight, ctx = {};
  drive(Game, ctx, 12);
  check('gate/no-hint: policy does NOT bellow blind', (f.shouts | 0) === 0 && (ctx.beastTricks | 0) === 0,
    'shouts=' + (f.shouts | 0) + ' beastTricks=' + (ctx.beastTricks | 0));
  check('gate/no-hint: no accidental discovery claimed', !discovered(Game, 'hummice'));
}

// KNOWN COUNTER: the trick is used for its mechanical benefit — a competent
// player who KNOWS the trick plays it (the shout still scatters the choir).
// Once per monster per fight, then normal fighting.
async function tGateKnown() {
  const Game = await freshGame(1116);
  Game.state.monsterCounters['hummice'] = true; // already learned
  fight(Game,'hummice');
  if (!Game.tbfight) { check('gate/known: fight starts', false); return; }
  verifyBody(Game);
  const f = Game.tbfight, ctx = {};
  drive(Game, ctx, 12, { stopWhen: () => (f.shouts | 0) > 0 });
  check('gate/known: policy USES a known trick (shout still scatters)', (f.shouts | 0) > 0 && (ctx.beastTricks | 0) > 0,
    'shouts=' + (f.shouts | 0) + ' beastTricks=' + (ctx.beastTricks | 0));
  check('gate/known: known trick attempted once per fight, not looped', (f.shouts | 0) <= 1,
    'shouts=' + (f.shouts | 0));
}

// Real escape belongs to capable; competent is the documented historical
// default-OFF non-escaping baseline. Keep these contracts distinct.
async function tFleeStillWorks(){
 const Game=await freshGame(1117),s=Game.state.scholar,v=Game.state.village;hintKnown(Game,'hummice');
 Game.map.px=(v.px??4)+1;Game.map.py=v.py??4;s.insideHaven=false;s.health=20;
 fight(Game,'hummice',{px:0,py:4,mx:4,my:4});const f=Game.tbfight,p=Game.tbFighter('p'),before=[Game.map.px,Game.map.py],ctx={};
 const pushes=[],barrier=Game.tbBarrierExit;Game.tbBarrierExit=function(...args){const from=[this.map.px,this.map.py],movement=p.moveLeft,result=barrier.apply(this,args);pushes.push({from,to:[this.map.px,this.map.py],movement,remaining:p.moveLeft,result});return result;};
 const dpsBefore=process.env.COMPETENT_DPS_RACE;drive(Game,ctx,4,{stopWhen:()=>f.over,policy:require('./policies/capable').capable});
 check('active escape leaves optional DPS projection gate unchanged',process.env.COMPETENT_DPS_RACE===dpsBefore);
 check('active capable: hopeless fight actually escapes alive without a trick',f.over&&f.result==='fled'&&p.alive&&p.hp>0&&ctx.capFleeExits===1&&ctx.capFleeNodeExits===1&&(ctx.beastTricks||0)===0,JSON.stringify(scene));
 check('active capable pays one actual public barrier crossing',pushes.length===1&&pushes[0].movement>0&&pushes[0].remaining===0,JSON.stringify(pushes));
 check('active capable: actual barrier arrives at Haven',Game.map.px===(v.px??4)&&Game.map.py===(v.py??4)&&Game.map.px!==before[0],JSON.stringify({before,after:[Game.map.px,Game.map.py]}));
}
async function tFleeLegacy(){
 const Game=await freshGame(1117),s=Game.state.scholar,v=Game.state.village;hintKnown(Game,'hummice');
 Game.map.px=(v.px??4)+1;Game.map.py=v.py??4;s.insideHaven=false;s.health=20;
 fight(Game,'hummice',{px:0,py:4,mx:4,my:4});const f=Game.tbfight,ctx={},before=[Game.map.px,Game.map.py];drive(Game,ctx,1);
 check('historical default-OFF competent prioritizes a retreat attempt',ctx.fledBad===1&&ctx.fled===1&&!(ctx.beastTricks>0));
 check('historical attempt is honestly distinct from a real exit',!f.over&&Game.map.px===before[0]&&Game.map.py===before[1]);
}
async function tFleeHeld(){
 process.env.COMPETENT_DIRECTIONAL_FLEE='1';const Game=await freshGame(1118),s=Game.state.scholar;hintKnown(Game,'hummice');s.health=20;fight(Game,'hummice');
 const map=[Game.map.px,Game.map.py],ctx={};drive(Game,ctx,1);
 check('explicit directional Haven hold does not pretend to escape',ctx.fledHeld>0&&!(ctx.fled>0)&&Game.map.px===map[0]&&Game.map.py===map[1],JSON.stringify(scene));
 check('held retreat retains live counterplay',ctx.beastTricks===1&&discovered(Game,'hummice'));
}

const cases={tShout,tOfferFood,tWait,tKeepDistance,tMoveWindup,tSidestep,tMoveX2,tMoveX2Tiles,tStrikeLead,tStrikeWindup,tStrikeRecovery,tStrikeFirst,tStrikeNonhead,tFreshWeapon,tGateNoHint,tGateKnown,tFleeStillWorks,tFleeLegacy,tFleeHeld};
if(process.argv[2]==='--child')cases[process.argv[3]]().then(()=>console.log('COUNTER_RESULT '+JSON.stringify({name:process.argv[3],checks,scene}))).catch(e=>{console.error(e.stack);process.exitCode=2;});
else{const T=K.reporter('Policy counterplay');for(const name of Object.keys(cases)){const r=cp.spawnSync(process.execPath,[__filename,'--child',name],{cwd:K.ROOT,encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024});if(r.status!==0){T.ok(name+' child completes',false,r.stderr);continue;}const lines=r.stdout.split('\n').filter(x=>x.startsWith('COUNTER_RESULT '));a.equal(lines.length,1);const row=JSON.parse(lines[0].slice(15));console.log(JSON.stringify(row));for(const c of row.checks)T.ok(c.name,c.condition,c.detail);}T.done();}
