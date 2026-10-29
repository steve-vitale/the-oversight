#!/usr/bin/env node
// test-raidname-b.js — proof for the sim-raidname-b wording change
// (raid-naming at fight start, src/js/havenGrowth.js raidBorn flag +
// src/js/game.js startCombat raid line + raid-aftermath line).
//   T1 (unit): a fight against a raidBorn tile monster says the raid
//       line; the same fight without the flag does not.
//   T2 (unit): a raid fight seating an already-dead villager says the
//       raid-aftermath line naming them (best-effort: if the engine
//       seats no dead villager in the unit setup, T2 reports SKIP and
//       the corpus leg T3 remains the judge for the aftermath line).
//   T3 (corpus, --corpus DIR --base-corpus DIR): G1 every dawn-raid
//       creation tail on the band contains the raid line; G2 no
//       non-dawn-raid creation tail contains it; G4 neutrality —
//       non-say fields deep-equal base vs on, and the say diff is
//       exactly the added raid / aftermath lines.
// Run (unit only): node scripts/test-raidname-b.js
// Run (full): node scripts/test-raidname-b.js --corpus
//   evidence/2026-10-29/sim-raidname-b-corpus-on --base-corpus
//   evidence/2026-10-29/sim-raidname-b-corpus
// Exit 0 = all green (T2 SKIP does not fail).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0, fail = 0, skip = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}
const args = process.argv.slice(2);
let corpus = null, baseCorpus = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--corpus') corpus = args[++i];
  else if (args[i] === '--base-corpus') baseCorpus = args[++i];
}
const RAID_LINE = 'This one came with the raid on Haven';
const AFTERMATH_RE = /already fell to the raid before this fight/;

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'raidname-proof', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 10 });
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  try { Game.map.px = hx; Game.map.py = hy; } catch (e) {}
  try { if (!Game.playerAtHaven()) Game.travelTo(hx, hy); } catch (e) {}
  return { Game, v, hx, hy };
}
function startCombatCapture(Game, monsterId) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (...a) { try { lines.push(String(a[0] || '')); } catch (e) {} return orig.apply(this, a); };
  let err = null;
  try { Game.startCombat(monsterId); } catch (e) { err = String(e && e.message); }
  Game.say = orig;
  return { lines, err };
}

async function main() {
  console.log('T1: raidBorn tile monster says the raid line; control does not');
  {
    const { Game, hx, hy } = await freshGame(515001);
    const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
    m.raidBorn = true;
    try { Game.syncMonsterAlias(); } catch (e) {}
    const r = startCombatCapture(Game, 'bulldozer');
    ok(!r.err, 'raidBorn startCombat runs (err=' + r.err + ')');
    ok(r.lines.some((l) => l.includes(RAID_LINE)), 'raid line present for raidBorn fight');
    const tail = r.lines.slice(-12);
    ok(tail.some((l) => l.includes(RAID_LINE)), 'raid line inside last-12 window');
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
  }
  {
    const { Game, hx, hy } = await freshGame(515002);
    Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
    try { Game.syncMonsterAlias(); } catch (e) {}
    const r = startCombatCapture(Game, 'bulldozer');
    ok(!r.err, 'control startCombat runs (err=' + r.err + ')');
    ok(!r.lines.some((l) => l.includes(RAID_LINE)), 'no raid line without raidBorn flag');
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
  }
  console.log('T1b: pending-shadow path (harness-style: pending cleared, shadow kept)');
  {
    const { Game } = await freshGame(515004);
    Game.pendingEncounter = false; Game.pendingMonsterId = null;
    Game.raidPendingMonsterId = 'bulldozer';
    const r = startCombatCapture(Game, 'bulldozer');
    ok(!r.err, 'shadow-path startCombat runs (err=' + r.err + ')');
    ok(r.lines.some((l) => l.includes(RAID_LINE)), 'raid line present via pending shadow');
    ok(!Game.raidPendingMonsterId, 'shadow consumed on match');
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
  }
  {
    const { Game } = await freshGame(515005);
    Game.pendingEncounter = false; Game.pendingMonsterId = null;
    Game.raidPendingMonsterId = 'murkcap';
    const r = startCombatCapture(Game, 'bulldozer');
    ok(!r.err, 'shadow-mismatch startCombat runs (err=' + r.err + ')');
    ok(!r.lines.some((l) => l.includes(RAID_LINE)), 'no raid line when shadow id differs');
    ok(Game.raidPendingMonsterId === 'murkcap', 'shadow NOT consumed on mismatch');
    try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
  }
  console.log('T2: raid fight seating an already-dead villager says the aftermath line');
  {
    const { Game, v, hx, hy } = await freshGame(515003);
    const roster = (v.roster || []).filter((id) => id !== Game.villagerId);
    let seatedDead = false, named = null;
    if (roster.length) {
      v.health = v.health || {};
      v.health[roster[0]] = 0;
      const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
      m.raidBorn = true;
      try { Game.syncMonsterAlias(); } catch (e) {}
      const r = startCombatCapture(Game, 'bulldozer');
      const fighters = (Game.tbfight && Game.tbfight.fighters) || [];
      const dead = fighters.filter((f) => f.kind === 'villager' && (f.alive === false || (typeof f.hp === 'number' && f.hp <= 0)));
      seatedDead = dead.length > 0;
      if (seatedDead) {
        named = dead.map((f) => f.name);
        ok(r.lines.some((l) => AFTERMATH_RE.test(l)), 'aftermath line present when dead villager seated');
        ok(named.some((n) => r.lines.some((l) => AFTERMATH_RE.test(l) && l.includes(n))), 'aftermath line names the fallen (' + named.join(',') + ')');
      } else {
        skip++; console.log('  SKIP dead villager not seated in unit setup (corpus leg judges aftermath)');
      }
      try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
    } else { skip++; console.log('  SKIP no roster villager for T2'); }
    void seatedDead;
  }

  if (corpus && baseCorpus) {
    console.log('T3: corpus legs G1/G2/G4');
    // stackLines carry source line numbers, which shift with ANY
    // code edit (the raid lines added ~15 lines to game.js) —
    // an edit artifact, not trajectory movement. Same class as
    // fightorigin's timestamp-id exclusion; named in metric
    // review, never silently dropped (the strip list is explicit).
    const stripSay = (o) => {
      if (Array.isArray(o)) return o.map(stripSay);
      if (o && typeof o === 'object') {
        const out = {};
        for (const [k, val] of Object.entries(o)) {
          if (k === 'sayTail' || k === 'sayWindow' || k === 'eveningSayTail' || k === 'stackLines') continue;
          out[k] = stripSay(val);
        }
        return out;
      }
      return o;
    };
    // Per-record say check with window semantics: capped tails
    // (sayTail last-12, eveningSayTail last-30) lose their
    // earliest lines when a line is inserted, so on-tail minus
    // inserted lines must be a SUFFIX of base-tail; uncapped
    // tap windows must match exactly after removing inserted
    // lines. A dropped line is therefore proven truncation,
    // never a removed narration.
    const tailOk = (baseTail, onTail, capped) => {
      const stripped = onTail.filter((l) => !(l.includes(RAID_LINE) || AFTERMATH_RE.test(l)));
      if (!capped) return JSON.stringify(stripped) === JSON.stringify(baseTail);
      if (stripped.length > baseTail.length) return false;
      const suffix = baseTail.slice(baseTail.length - stripped.length);
      return JSON.stringify(stripped) === JSON.stringify(suffix);
    };
    const dawnRaid = (d) => {
      // Same classifier as scripts/analyze-raidname-b.js (morning
      // interval + havenRaidTick setter + hall fight).
      const out = [];
      const evCp = new Map(), moCp = new Map();
      for (const cp of (d.checkpoints || [])) {
        if (cp.checkpoint === 'evening') evCp.set(cp.loopDay, cp);
        if (cp.checkpoint === 'morning') moCp.set(cp.loopDay, cp);
      }
      const evRow = new Map((d.evenings || []).map((e) => [e.loopDay, e]));
      for (const m of (d.mornings || [])) {
        const ev = evRow.get(m.loopDay - 1);
        if (!ev || ev.inside !== true) continue;
        const ecp = evCp.get(m.loopDay - 1), mcp = moCp.get(m.loopDay);
        if (!ecp || !mcp) continue;
        for (const c of (d.fightCreations || []).filter((x) => x.seq >= ecp.seq && x.seq < mcp.seq)) {
          const mons = (c.fighters || []).filter((x) => x.monsterId).map((x) => x.monsterId);
          const prevFo = Math.max(0, ...((d.fightCreations || []).filter((x) => x.foSeq < c.foSeq).map((x) => x.foSeq)));
          const raidSet = (d.pendingLog || []).filter((p) => p.foSeq < c.foSeq && p.foSeq > prevFo &&
            (p.stackFrames || []).some((s) => /havenRaidTick/.test(s)) && mons.includes(p.pendingMonsterId));
          if (raidSet.length && c.pos && c.pos.inside) out.push(c.ordinal);
        }
      }
      return new Set(out);
    };
    const files = fs.readdirSync(corpus).filter((f) => f.endsWith('.json')).sort();
    let g1 = 0, g1tot = 0, g2bad = 0, g2follow = 0, g2outside = 0, neutBad = 0, sayBad = 0, inserted = 0;
    for (const f of files) {
      const on = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
      const base = JSON.parse(fs.readFileSync(path.join(baseCorpus, f), 'utf8'));
      const dr = dawnRaid(on);
      for (const c of (on.fightCreations || [])) {
        const has = (c.sayTail || []).some((l) => l.includes(RAID_LINE));
        if (!has) continue;
        if (c.sayTail) inserted += c.sayTail.filter((l) => l.includes(RAID_LINE) || AFTERMATH_RE.test(l)).length;
        if (dr.has(c.ordinal)) { g1tot++; g1++; continue; }
        // G2, haven scope only (prereg): a non-dawn haven
        // line-gainer is legitimate iff it is a tile-monster
        // fight (stack monsterTurn: the acting tile monster IS
        // the fought monster, so path (b) can only fire on a
        // raidBorn actor) or a pending-resolution fight whose
        // species was raid-set before it (shadow path (a)).
        // Entity-level proof for this band's 8 haven
        // follow-ups is the DBG run in the evidence file;
        // outside-haven line-gainers are counted, not judged.
        if (!(c.pos && c.pos.inside)) { g2outside++; continue; }
        const stack = c.stackFrames || [];
        const mons = (c.fighters || []).filter((x) => x.monsterId).map((x) => x.monsterId);
        const prevFo = Math.max(0, ...((on.fightCreations || []).filter((x) => x.foSeq < c.foSeq).map((x) => x.foSeq)));
        const raidSet = (on.pendingLog || []).filter((p) => p.foSeq < c.foSeq && p.foSeq > prevFo &&
          (p.stackFrames || []).some((s) => /havenRaidTick/.test(s)) && mons.includes(p.pendingMonsterId));
        if (stack.some((s) => /monsterTurn/.test(s)) || (stack.some((s) => /driveContestsImpl/.test(s)) && raidSet.length)) g2follow++;
        else g2bad++;
      }
      // G1 denominator: dawn-raid fights WITHOUT the line.
      for (const c of (on.fightCreations || [])) {
        if (dr.has(c.ordinal) && !(c.sayTail || []).some((l) => l.includes(RAID_LINE))) g1tot++;
      }
      if (JSON.stringify(stripSay(base)) !== JSON.stringify(stripSay(on))) neutBad++;
      const pairs = [
        ['checkpoints', 'sayTail', true], ['moves', 'sayTail', true],
        ['fightCreations', 'sayTail', true], ['evenings', 'eveningSayTail', true],
        ['taps', 'sayWindow', false],
      ];
      for (const [arr, key, capped] of pairs) {
        const bArr = base[arr] || [], oArr = on[arr] || [];
        if (bArr.length !== oArr.length) { sayBad++; continue; }
        for (let i = 0; i < bArr.length; i++) {
          if (!tailOk(bArr[i][key] || [], oArr[i][key] || [], capped)) { sayBad++; break; }
        }
      }
    }
    ok(g1tot > 0 && g1 === g1tot, `G1 raid line in all dawn-raid tails (${g1}/${g1tot})`);
    ok(g2bad === 0, `G2 no non-raid haven creation gains the line (bad=${g2bad}, legit follow-ups=${g2follow}, outside-haven=${g2outside})`);
    ok(neutBad === 0, `G4 non-say fields deep-equal base vs on (${files.length - neutBad}/${files.length} files)`);
    ok(sayBad === 0, `G4 say diff is exactly added raid/aftermath lines modulo tail truncation (badRecords=${sayBad}, insertedInCreationTails=${inserted})`);
  } else {
    console.log('T3 skipped (no --corpus/--base-corpus given)');
  }
  console.log(`RESULT pass=${pass} fail=${fail} skip=${skip}`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('FATAL', e && e.stack || e); process.exit(2); });
