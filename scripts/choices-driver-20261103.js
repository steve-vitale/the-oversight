// choices-driver-20261103.js — ability-use game-code arm, CHOICES.
// Same band as the twins legs (seeds 99101-99108, 140d, stock competent
// policy, twins live): arm A (as-is) IS the twins-after leg; this driver
// runs arms B and C only.
//   ARM=strip : scholar combat abilities stripped after setupGame
//     (slots + background + codex skills for skill-lane combat actions,
//     so skillLaneEntries cannot re-supply them). Exact strip list in
//     the output header. Dilution audit: the instrument records
//     scholarHeld per fight, so re-acquisition mid-run is visible.
//   ARM=gear  : scholar's equipped weapon swapped to the next-lower
//     bonus weapon (same type preferred: melee stays melee, ranged
//     stays ranged; a type change, if forced, is flagged). Ladder
//     rungs per prereg: 120->80->60->45->30->25->15->8->5->unarmed.
//     Dilution audit: equipped weapon snapshotted at every TB fight
//     start + at run end, so mid-run loot upgrades are visible.
// Usage:
//   DAYS=140 SEEDS=99101,99102 ARM=strip RUN=choices-B OUTDIR=perseed-abilityuse-gc-choices node scripts/choices-driver-20261103.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'abilityuse-instrument-20261103'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'choices-X';
const OUTDIR = process.env.OUTDIR || 'perseed-abilityuse-gc-choices';
const ARM = process.env.ARM || '';
if (!SEEDS.length) { console.error('CHOICES STOP: SEEDS required.'); process.exit(2); }
if (ARM !== 'strip' && ARM !== 'gear' && ARM !== 'stripfight' && ARM !== 'gearfight') { console.error('CHOICES STOP: ARM=strip|gear|stripfight|gearfight required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-03', OUTDIR);
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'abuse-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('CHOICES STOP: refusing to overwrite ' + file); process.exit(3); }
}

function combatActionIds(Game) {
  const ids = [];
  for (const a of (Game.data.abilities || [])) {
    if (!a || !a.actions) continue;
    for (const act of a.actions) {
      if ((act.context || 'explore') === 'combat') { ids.push(a.id); break; }
    }
  }
  return ids;
}

function stripOnce(Game) {
  const combatIds = new Set(combatActionIds(Game));
  const sch = Game.state.scholar;
  const idOf = function (e) { return (e && (e.evolvedFrom || e.id)) || e; };
  const strippedSlots = [];
  for (const key of ['abilities', 'backgroundAbilities']) {
    const arr = sch[key] || [];
    const kept = [];
    for (const e of arr) {
      if (combatIds.has(idOf(e))) strippedSlots.push(idOf(e));
      else kept.push(e);
    }
    sch[key] = kept;
  }
  // Codex skills for skill-lane combat actions (else skillLaneEntries
  // re-supplies them on first read).
  const strippedSkills = [];
  const skills = (Game.state.codex && Game.state.codex.skills) || {};
  for (const id of combatIds) {
    try {
      if (Game.isSkillLane && Game.isSkillLane(id) && Game.abilitySkillId) {
        const sid = Game.abilitySkillId(id);
        if (sid && skills[sid]) { delete skills[sid]; strippedSkills.push(id + '->' + sid); }
      }
    } catch (e) {}
  }
  try { if (typeof Game.recomputeActiveSynergies === 'function') Game.recomputeActiveSynergies(); } catch (e) {}
  return { combatIds: combatIds, strippedSlots: strippedSlots, strippedSkills: strippedSkills };
}

function stripArm(Game) {
  const header = { arm: 'strip' };
  const r = stripOnce(Game);
  header.combatActionAbilityCount = r.combatIds.size;
  header.strippedSlots = r.strippedSlots;
  header.strippedSkills = r.strippedSkills;
  // Verify: nothing combat-actioned remains held.
  let leak = [];
  try {
    const owned = (typeof Game.ownedAbilityIds === 'function') ? Game.ownedAbilityIds() : [];
    leak = owned.filter(function (id) { return r.combatIds.has(id); });
  } catch (e) { leak = ['OWNED-READ-ERROR:' + String(e.message).slice(0, 60)]; }
  header.remainingCombatHeld = leak;
  header.stripList = Array.from(r.combatIds);
  return header;
}

function nextLowerWeapon(Game, cur) {
  const items = Game.data.items || [];
  const cands = [];
  for (const it of items) {
    const w = it && it.weapon;
    if (!w || typeof w.bonus !== 'number') continue;
    if (w.bonus < cur.bonus) cands.push({ id: it.id, name: it.name, bonus: w.bonus, type: w.type || 'melee' });
  }
  cands.sort(function (a, b) { return b.bonus - a.bonus; });
  const sameType = cands.filter(function (c) { return c.type === cur.type; });
  return (sameType[0] || cands[0] || null);
}

function gearArm(Game) {
  const header = { arm: 'gear' };
  const sch = Game.state.scholar;
  const eq = sch.equipped || {};
  const slot = eq.melee ? 'melee' : (eq.ranged ? 'ranged' : (eq.weapon ? 'weapon' : null));
  let cur = null;
  try { cur = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null; } catch (e) {}
  header.startWeapon = cur ? { itemId: cur.itemId, name: cur.name, bonus: cur.bonus, type: cur.type, slot: slot } : null;
  if (!cur || cur.unarmed || !slot) {
    header.swap = 'already-unarmed-or-none';
    return header;
  }
  const pick = nextLowerWeapon(Game, cur);
  if (!pick) {
    header.swap = 'no-lower-weapon-exists';
    return header;
  }
  const next = { itemId: pick.id, name: pick.name };
  if (eq[slot] && eq[slot].ammo != null) next.ammo = eq[slot].ammo;
  eq[slot] = next;
  header.swap = { from: { itemId: cur.itemId, bonus: cur.bonus, type: cur.type },
    to: pick, typeChanged: pick.type !== cur.type, slot: slot };
  return header;
}

// gearfight: AMENDED MECHANISM (see evidence: the setup swap proved
// vacuous — scholars start unarmed on all 8 seeds, so C-as-written is
// identical to A). At every fight start, the carried weapon is swapped
// to the next-lower-bonus weapon (same type preferred; ammo preserved
// on ranged swaps; an unarmed scholar stays unarmed). Between fights
// the scholar may loot better — and is downgraded again at the next
// fight — so the arm is "exactly one tier below whatever you would
// carry," the faithful gear-tier comparison. Returns the swap record
// (null when unarmed / no lower weapon exists).
function gearSwapOnce(Game) {
  const sch = Game.state.scholar;
  const eq = sch.equipped || {};
  const slot = eq.melee ? 'melee' : (eq.ranged ? 'ranged' : (eq.weapon ? 'weapon' : null));
  let cur = null;
  try { cur = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null; } catch (e) {}
  if (!cur || cur.unarmed || !slot) return null;
  const pick = nextLowerWeapon(Game, cur);
  if (!pick) return null;
  const next = { itemId: pick.id, name: pick.name };
  if (eq[slot] && eq[slot].ammo != null) next.ammo = eq[slot].ammo;
  eq[slot] = next;
  return { from: { itemId: cur.itemId, bonus: cur.bonus, type: cur.type },
    to: pick, typeChanged: pick.type !== cur.type, slot: slot };
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-choices', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const header = (ARM === 'strip') ? stripArm(Game) : (ARM === 'stripfight' ? stripArm(Game) : (ARM === 'gearfight' ? gearArm(Game) : gearArm(Game)));
  if (ARM === 'gearfight') {
    header.arm = 'gearfight';
    const fightGearLog = [];
    const origSCg = Game.startCombat;
    if (typeof origSCg === 'function') {
      Game.startCombat = function () {
        let r = null;
        try { r = gearSwapOnce(Game); } catch (e) {}
        fightGearLog.push({ day: ((Game.state.scholar || {}).day || 0), swap: r });
        return origSCg.apply(this, arguments);
      };
    }
    header.fightGearLog = fightGearLog;
  }
  if (ARM === 'stripfight') {
    // AMENDED MECHANISM (see evidence: setup strip proved vacuous —
    // setupGame grants no combat abilities, so B-as-written differs
    // from A by nothing). stripfight re-strips at every fight start,
    // so the scholar ENTERS every fight without combat abilities while
    // the rest of the run stays intact. The per-fight strip log proves
    // the arm actually bit; the instrument's per-fight scholarHeld
    // independently verifies it.
    header.arm = 'stripfight';
    const fightStripLog = [];
    const origSC0 = Game.startCombat;
    if (typeof origSC0 === 'function') {
      Game.startCombat = function () {
        let r = null;
        try { r = stripOnce(Game); } catch (e) {}
        fightStripLog.push({ day: ((Game.state.scholar || {}).day || 0),
          strippedSlots: r ? r.strippedSlots : null, strippedSkills: r ? r.strippedSkills : null });
        return origSC0.apply(this, arguments);
      };
    }
    header.fightStripLog = fightStripLog;
  }
  // Per-fight weapon snapshot (dilution audit for the gear arm; harmless
  // for strip — it also shows whether strip changed anything equipped).
  const weaponSnaps = [];
  const origSC = Game.startCombat;
  if (typeof origSC === 'function') {
    Game.startCombat = function () {
      try {
        const w = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null;
        weaponSnaps.push({ day: ((Game.state.scholar || {}).day || 0),
          itemId: w ? w.itemId : null, bonus: w ? w.bonus : null, type: w ? w.type : null });
      } catch (e) {}
      return origSC.apply(this, arguments);
    };
  }
  const inst = INST.install(Game);
  const t = inst.t;
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  try { Game.startCombat = origSC; } catch (e) {}
  let endWeapon = null;
  try { const w = Game.equippedWeapon(); endWeapon = { itemId: w.itemId, bonus: w.bonus, type: w.type }; } catch (e) {}
  const st = Game.state || {};
  return {
    seed: seed, run: RUN, anchorCommit: ANCHOR, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    spawnsW4: t.spawns.length, tbCalls: t.tbCalls, fieldCallsW4: t.fieldCallsW4,
    exposures: t.exposures, killsW4: t.killRows.length,
    killRows: t.killRows, unlinkedKills: t.unlinkedKills,
    spawns: t.spawns, orphanTbEnds: t.orphanTbEnds, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors), notes: t.notes,
    choicesHeader: header, weaponSnaps: weaponSnaps, endWeapon: endWeapon,
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'abuse-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, end: out.endReason,
      spawnsW4: out.spawnsW4, tbCalls: out.tbCalls, fieldCallsW4: out.fieldCallsW4, killsW4: out.killsW4,
      errors: out.instrumentErrors.length, header: out.choicesHeader, endWeapon: out.endWeapon,
      weaponSnaps: out.weaponSnaps.length,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
