#!/usr/bin/env node
// Proof test: field-wound carryover (tackle-wound2, 2026-10-27).
// Pre-registered bars live in evidence/2026-10-27/tackle-wound-carryover-prereg.md.
// One seed per process (never two harnesses in one process). Usage:
//   node scripts/test-wound-carryover-20261027.js --seed 101 [--baseline baseline.json]
// Prints exactly one JSON line on stdout. Exit 0 iff all within-run bars pass
// (B1 ally carryover, B2 tb entry, B3 lead regression); B4/B5 cross-run bounds
// are judged against --baseline when supplied, else reported as n/a.
'use strict';
const K = require('./godpath/lib');

function arg(name, dflt) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}

async function main() {
  const seed = Number(arg('seed', '101'));
  const baselinePath = arg('baseline', null);
  let baseline = null;
  if (baselinePath) {
    try { baseline = JSON.parse(require('fs').readFileSync(baselinePath, 'utf8')); } catch (e) { baseline = null; }
  }
  const Game = await K.load({ seed });
  K.newRun(Game);
  const S = globalThis.Scattering;
  const village = Game.state.village;
  const roster = (village.roster || []).filter(id => id !== Game.villagerId);
  const lead = roster[0], ally = roster[1];
  const out = {
    seed, lead, ally, field: [], tbEntry: [], tbWins: [],
    fieldCounts: { fights: 0, allyDamagedSurvived: 0, allyDown: 0, allyUndamaged: 0, leadSettled: 0, leadSkipped: 0, errors: 0 },
    errors: [],
  };
  if (!lead || !ally) { out.errors.push('roster too small'); console.log(JSON.stringify(out)); process.exit(1); }
  const mdef = (Game.data.monsters || []).find(m => m.id === 'bulldozer');
  if (!mdef) { out.errors.push('no bulldozer mdef'); console.log(JSON.stringify(out)); process.exit(1); }
  const leadName = (() => { try { return Game.firstRef(lead); } catch (e) { return null; } })();

  // ---- field fights: ally already at the door, lead settled patrol-style ----
  for (let i = 0; i < 30; i++) {
    village.health = village.health || {};
    village.health[lead] = 100;
    village.health[ally] = 100;
    let rec = null;
    try {
      rec = Game.fieldFight(lead, mdef, null, { allies: 1, allyVids: [ally], allyFromStart: true });
    } catch (e) { out.fieldCounts.errors++; out.errors.push('fieldFight: ' + e.message); continue; }
    if (!rec || !rec.outcome) { out.fieldCounts.errors++; continue; }
    out.fieldCounts.fights++;
    // Ally damage parsed from the fight's own log lines (independent of any
    // rec field the fix may add): "hits <name> for <n> (<left> left)".
    let allyDmg = 0;
    for (const line of (rec.log || [])) {
      const m = / hits (.+?) for (\d+) \(\d+ left\)/.exec(line);
      if (m && m[1] !== leadName) allyDmg += Number(m[2]);
    }
    const allyDown = (rec.log || []).some(l => /goes down!/.test(l));
    const entry = { outcome: rec.outcome, vTaken: rec.vTaken || 0, vHpLeft: rec.vHpLeft,
      allyDmg, allyDown, allyTakenField: rec.allyTaken != null ? rec.allyTaken : null,
      allyHpLeftField: rec.allyHpLeft != null ? rec.allyHpLeft : null,
      healthAllyAfter: village.health[ally], healthLeadAfterRaw: village.health[lead] };
    if (allyDown) {
      out.fieldCounts.allyDown++;
    } else if (allyDmg > 0) {
      out.fieldCounts.allyDamagedSurvived++;
      entry.carryoverOk = village.health[ally] === 100 - allyDmg;
      entry.carryoverFieldOk = rec.allyTaken == null ? null : (rec.allyTaken === allyDmg && village.health[ally] === rec.allyHpLeft);
    } else {
      out.fieldCounts.allyUndamaged++;
      entry.carryoverOk = village.health[ally] === 100;
    }
    // Lead settlement, patrol pattern: caller settles the sealed record.
    if ((rec.outcome === 'vKill' || rec.outcome === 'mFlee' || rec.outcome === 'vFlee') && (rec.vHpLeft || 0) > 0) {
      try {
        Game.hurtVillager(lead, rec.vTaken, 'monster', rec, { monsterId: mdef.id, monsterName: mdef.name });
        entry.leadOk = village.health[lead] === rec.vHpLeft;
        entry.healthLeadAfter = village.health[lead];
        if (entry.leadOk) out.fieldCounts.leadSettled++; else out.fieldCounts.leadSkipped++;
      } catch (e) { entry.leadOk = false; entry.leadError = e.message; out.fieldCounts.leadSkipped++; }
    } else {
      out.fieldCounts.leadSkipped++;
      entry.leadOk = null;
    }
    out.field.push(entry);
  }

  // ---- turn-based entry checks: wounded villager joins at exactly H ----
  const s = Game.state.scholar;
  for (const H of [30, 45, 60, 80]) {
    try {
      s.health = 100;
      village.health[ally] = H;
      s.mx = 4; s.my = 4;
      village.positions[ally] = { mx: 4, my: 5 };
      s.monster = null;
      Game.startCombat('bulldozer');
      const tf = Game.tbfight;
      const f = tf && tf.fighters.find(x => x.villagerId === ally && x.kind === 'villager');
      out.tbEntry.push({ H, joined: !!f, fighterHp: f ? f.hp : null, ok: !!f && f.hp === H });
      if (tf && !tf.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } }
    } catch (e) { out.tbEntry.push({ H, joined: false, fighterHp: null, ok: false, error: e.message }); }
  }

  // ---- turn-based win band: player + ally at 50 vs bulldozer, bot played ----
  function botTurn() {
    const tf = Game.tbfight;
    if (!tf || !Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    const foe = S.combat.nearestEnemy(tf.fighters, p);
    if (!foe) { Game.tbPlayerEndTurn(); return true; }
    const cheb = () => Math.max(Math.abs(foe.f.mx - p.mx), Math.abs(foe.f.my - p.my));
    const wrange = (Game.equippedWeapon && Game.equippedWeapon().range) || 1;
    if (!p.acted && cheb() <= wrange) Game.tbPlayerStrike(foe.f.key);
    let guard = 0;
    while (Game.tbfight && Game.tbIsPlayerTurn() && p.moveLeft > 0 && guard++ < 8) {
      const path = Game.findPath(p.mx, p.my, foe.f.mx, foe.f.my);
      if (!path || !path.length) break;
      const steps = Math.min(path.length - 1, p.moveLeft, 2);
      if (steps <= 0) break;
      const [tx, ty] = path[steps - 1];
      if (!Game.tbPlayerMove(tx, ty)) break;
      if (!p.acted && cheb() <= wrange) Game.tbPlayerStrike(foe.f.key);
    }
    if (Game.tbfight && Game.tbIsPlayerTurn()) {
      if (!p.acted) Game.tbPlayerStudy(); else Game.tbPlayerEndTurn();
    }
    return true;
  }
  for (let i = 0; i < 12; i++) {
    try {
      s.health = 100;
      s.equipped = { weapon: { itemId: 'fire_hardened_spear', name: 'Fire-hardened spear', range: 2 } };
      village.health[ally] = 50;
      s.mx = 4; s.my = 4;
      village.positions[ally] = { mx: 4, my: 5 };
      s.monster = null;
      Game.startCombat('bulldozer');
      const tf = Game.tbfight;
      let guard = 0;
      while (Game.tbfight && guard++ < 300) {
        const cur = Game.tbCurrent();
        if (!cur) break;
        if (cur.kind === 'player') { if (!botTurn()) break; }
        else Game.tbAdvance();
        if (!Game.tbfight) break;
      }
      const monstersAlive = tf ? tf.fighters.filter(f => f.kind === 'monster' && f.alive && !f.fled).length : -1;
      const playerAlive = Game.tbFighter ? !!(Game.state.scholar.health > 0) : null;
      let win = null;
      if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } win = false; }
      else win = (monstersAlive === 0 && playerAlive);
      out.tbWins.push({ win, result: tf ? tf.result : null, rounds: tf ? tf.round : null, monstersAlive, playerAlive });
    } catch (e) { out.tbWins.push({ win: false, error: e.message }); }
  }

  // ---- chain band (B4b): field fight wounds the ally, then a turn-based
  // fight starts that same ally at whatever health the field fight left. ----
  out.chain = [];
  for (let i = 0; i < 40; i++) {
    try {
      village.health[lead] = 100;
      village.health[ally] = 100;
      const rec = Game.fieldFight(lead, mdef, null, { allies: 1, allyVids: [ally], allyFromStart: true });
      if (!rec || !rec.outcome) { out.chain.push({ skipped: 'no-rec' }); continue; }
      let allyDmg = 0;
      for (const line of (rec.log || [])) {
        const m = / hits (.+?) for (\d+) \(\d+ left\)/.exec(line);
        if (m && m[1] !== leadName) allyDmg += Number(m[2]);
      }
      const allyDown = (rec.log || []).some(l => /goes down!/.test(l));
      if (allyDown || allyDmg <= 0) { out.chain.push({ skipped: allyDown ? 'ally-down' : 'ally-undamaged', fieldOutcome: rec.outcome, allyDmg }); continue; }
      // Lead settlement (patrol pattern) so the chain state is honest, then
      // the turn-based fight with the ally at post-field health.
      if ((rec.outcome === 'vKill' || rec.outcome === 'mFlee' || rec.outcome === 'vFlee') && (rec.vHpLeft || 0) > 0) {
        try { Game.hurtVillager(lead, rec.vTaken, 'monster', rec, { monsterId: mdef.id, monsterName: mdef.name }); } catch (e) {}
      }
      const allyHpAtTb = village.health[ally];
      s.health = 100;
      s.equipped = { weapon: { itemId: 'fire_hardened_spear', name: 'Fire-hardened spear', range: 2 } };
      s.mx = 4; s.my = 4;
      village.positions[ally] = { mx: 4, my: 5 };
      s.monster = null;
      Game.startCombat('bulldozer');
      const tf = Game.tbfight;
      let guard = 0;
      while (Game.tbfight && guard++ < 300) {
        const cur = Game.tbCurrent();
        if (!cur) break;
        if (cur.kind === 'player') { if (!botTurn()) break; }
        else Game.tbAdvance();
        if (!Game.tbfight) break;
      }
      const monstersAlive = tf ? tf.fighters.filter(f => f.kind === 'monster' && f.alive && !f.fled).length : -1;
      const playerAlive = Game.state.scholar.health > 0;
      let win = null;
      if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; } win = false; }
      else win = (monstersAlive === 0 && playerAlive);
      out.chain.push({ win, allyHpAtTb, allyDmg, fieldOutcome: rec.outcome, tbResult: tf ? tf.result : null });
    } catch (e) { out.chain.push({ skipped: 'error', error: e.message }); }
  }

  // ---- summary + within-run verdicts ----
  const dmgCases = out.field.filter(f => !f.allyDown && f.allyDmg > 0);
  const allyCarryRate = dmgCases.length ? dmgCases.filter(f => f.carryoverOk).length / dmgCases.length : null;
  const tbEntryRate = out.tbEntry.length ? out.tbEntry.filter(f => f.ok).length / out.tbEntry.length : null;
  const leadCases = out.field.filter(f => f.leadOk !== null && f.leadOk !== undefined);
  const leadRate = leadCases.length ? leadCases.filter(f => f.leadOk).length / leadCases.length : null;
  const tbWinRate = out.tbWins.length ? out.tbWins.filter(f => f.win).length / out.tbWins.length : null;
  const allyDeathRate = out.fieldCounts.fights ? out.fieldCounts.allyDown / out.fieldCounts.fights : null;
  const chainPlayed = (out.chain || []).filter(c => c.win === true || c.win === false);
  const chainWinRate = chainPlayed.length ? chainPlayed.filter(c => c.win).length / chainPlayed.length : null;
  out.summary = { allyCarryRate, allyCarryN: dmgCases.length, tbEntryRate, leadRate, leadN: leadCases.length, tbWinRate, tbWinN: out.tbWins.length, allyDeathRate, chainWinRate, chainN: chainPlayed.length };
  out.verdict = {
    B1: allyCarryRate === 1,
    B2: tbEntryRate === 1,
    B3: leadRate === 1,
    B4: baseline ? (baseline.summary.tbWinRate != null && tbWinRate != null ? (tbWinRate >= baseline.summary.tbWinRate - 0.10) : null) : null,
    B4b: baseline ? (baseline.summary.chainWinRate != null && chainWinRate != null ? (chainWinRate >= baseline.summary.chainWinRate - 0.10) : null) : null,
    B5: baseline ? (baseline.summary.allyDeathRate != null && allyDeathRate != null ? (allyDeathRate <= baseline.summary.allyDeathRate + 0.10) : null) : null,
    baselineTbWinRate: baseline ? baseline.summary.tbWinRate : null,
    baselineAllyDeathRate: baseline ? baseline.summary.allyDeathRate : null,
    baselineChainWinRate: baseline ? baseline.summary.chainWinRate : null,
  };
  console.log(JSON.stringify(out));
  const withinOk = out.verdict.B1 && out.verdict.B2 && out.verdict.B3;
  const crossOk = baseline ? (out.verdict.B4 && out.verdict.B4b && out.verdict.B5) : true;
  process.exit(withinOk && crossOk ? 0 : 1);
}

main().catch(e => { console.log(JSON.stringify({ fatal: e && e.stack || String(e) })); process.exit(2); });
