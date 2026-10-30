#!/usr/bin/env node
// scripts/drive-contestdeath-b.js — contest-enriched band driver for
// sim-contestdeath-b. One process per (seed, path); one fresh game per
// process via scripts/sim-harness.js loadGame + setupGame.
// Paths: W = real watch path _contestDie; M = real multi-take path
// _contestResolveOthers with ONLY the fate roll stubbed to a played
// loss; U = choke-point unit _cxKillContestant with _cxGossip('died')
// pre-seeded exactly as both call sites do.
// Wrappers are record-only: every wrapped call falls through to the
// original. No RNG rolls, no healing, no state edits inside wrappers.
// Usage: node scripts/drive-contestdeath-b.js <seed> <W|M|U> <out.json>
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

function wrap(obj, name, fn) {
  const orig = obj[name];
  if (typeof orig !== 'function') return null;
  obj[name] = function (...args) { try { fn(args); } catch (e) {} return orig.apply(this, args); };
  return orig;
}

async function main() {
  const seed = parseInt(process.argv[2], 10);
  const p = process.argv[3];
  const out = process.argv[4];
  if (!Number.isFinite(seed) || !['W', 'M', 'U'].includes(p) || !out) {
    console.error('usage: drive-contestdeath-b.js <seed> <W|M|U> <out.json>');
    process.exit(2);
  }
  const { Game } = await loadGame({ seed, mode: 'contestdeath-b' });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).slice();
  const pid = roster.find(id => id !== Game.villagerId);
  if (!pid) { console.error('no non-player roster villager'); process.exit(3); }
  const pname = (() => { try { return Game.displayName(pid); } catch (e) { return pid; } })();
  const pool = (() => { try { return Game.contestPool() || []; } catch (e) { return []; } })();
  const contest = pool[0] || { id: 'pit', name: 'pit' };
  const cid = contest.id;

  const rec = { deathTeles: 0, registers: [], villageDeathEvents: 0,
    deathSeeds: 0, crises: [], sayLines: [] };
  wrap(Game, 'tele', (args) => {
    const e = args[0];
    if (e && (e.type === 'death' || args[1] === 'death')) {
      const who = (e && e.who) || (args[1] && args[1].who);
      if (String(who) === String(pid)) rec.deathTeles++;
    }
    // tele signature variants: tele(type, data) vs tele(record). Count
    // defensively below via state scan too; wrapper counts type-first form.
    if (e && e === 'death' && args[1] && String(args[1].who) === String(pid)) rec.deathTeles++;
  });
  // tele in this codebase: tele(type, data) — the above double-counts
  // only if both shapes matched, which they cannot (e is a string in one
  // shape, an object in the other). Keep both arms; each fires at most once.
  wrap(Game, 'registerDeath', (args) => {
    const o = args[0] || {};
    if (String(o.villagerId) === String(pid)) rec.registers.push({ cause: o.cause || null, kind: o.kind || null });
  });
  wrap(Game, 'villageEvent', (args) => { if (args[0] === 'death') rec.villageDeathEvents++; });
  wrap(Game, 'seedGossip', (args) => {
    const k = args[0];
    if (typeof k === 'string' && k.indexOf('death:') === 0) rec.deathSeeds++;
  });
  wrap(Game, 'fireCrisis', (args) => { if (args[0]) rec.crises.push(args[0]); });
  wrap(Game, 'say', (args) => { if (args[0]) rec.sayLines.push(String(args[0])); });
  wrap(Game, 'sysSay', (args) => { if (args[0]) rec.sayLines.push('[sys] ' + String(args[0])); });

  const gossipDied = () => ((Game.state.village || {}).gossip || [])
    .filter(g => g && g.action === 'contest_died' && g.dims && String(g.dims.who) === String(pid)).length;
  const fallenCount = () => ((Game.state.village || {}).fallen || [])
    .filter(f => f && String(f.villagerId) === String(pid)).length;
  const corpseCount = () => ((Game.state || {}).corpses || [])
    .filter(c => c && String(c.villagerId) === String(pid)).length;
  const teleScan = () => ((Game.state || {}).telemetry || [])
    .filter(e => e && e.type === 'death' && String(e.who) === String(pid)).length;
  const onRoster = () => ((Game.state.village || {}).roster || []).includes(pid);

  const before = { onRoster: onRoster(), fallen: fallenCount(), corpses: corpseCount(),
    gossipDied: gossipDied(), teles: teleScan() };
  const ledgerBefore = ((Game.state || {}).contestDeathsById || {})[cid] || 0;

  let error = null;
  try {
    if (p === 'W') {
      Game._contestDie({ participant: pid, contestId: cid }, 'pit');
    } else if (p === 'M') {
      Game.contestResolveVillager = function () { return { outcome: 'died', detail: '', log: [] }; };
      Game._contestResolveOthers({ others: [pid], contestId: cid });
    } else {
      Game._cxGossip('died', pid, contest.name);
      Game._cxKillContestant(pid, cid);
    }
  } catch (e) { error = String((e && e.stack) || e); }

  const after = { onRoster: onRoster(), fallen: fallenCount(), corpses: corpseCount(),
    gossipDied: gossipDied(), teles: teleScan() };
  const ledgerAfter = ((Game.state || {}).contestDeathsById || {})[cid] || 0;
  const deathSeen = !!(((Game.state || {}).village || {}).deathSeen || {})[pid];
  const covered = after.teles >= 1 && after.fallen >= 1;
  // Operational duplicate-grief (prereg): exactly one grief event, exactly
  // one contest_died gossip (the pre-existing one), zero death: seeds,
  // exactly one death tele, exactly one fallen entry.
  const dupGrief = !(rec.villageDeathEvents === 1 && after.gossipDied === 1 &&
    rec.deathSeeds === 0 && after.teles === 1 && after.fallen === 1);
  const result = { seed, path: p, pid, pname, contestId: cid, contestName: contest.name || null,
    before, after, ledgerBefore, ledgerAfter, deathSeen,
    wrapper: { deathTeles: rec.deathTeles, registers: rec.registers,
      villageDeathEvents: rec.villageDeathEvents, deathSeeds: rec.deathSeeds,
      crises: rec.crises },
    covered, dupGrief, error,
    sayLines: rec.sayLines };
  // FLAP-RESISTANT WRITE (container write-denial flap leaves 0-byte files):
  // write, read back, and retry until the file parses or attempts run out.
  const _text = JSON.stringify(result, null, 2) + '\n';
  let _written = false;
  for (let _a = 0; _a < 1 && !_written; _a++) {
    try { fs.writeFileSync(out, _text); } catch (e) { /* flap: retry below */ }
    try { const _back = JSON.parse(fs.readFileSync(out, 'utf8')); if (_back.seed === seed && _back.path === p) _written = true; } catch (e) { /* not yet valid */ }
    // NOTE: the harness freezes Date.now, so a Date-based wait exits
    // instantly — use the monotonic clock instead.
    if (!_written && _a < 0) { const _end = process.hrtime.bigint() + 3000000000n; while (process.hrtime.bigint() < _end) {} }
  }
  if (!_written) {
    // Persistence failed but the measurement is computed: emit the full
    // record on stdout (the tool channel is flap-free) so the caller can
    // persist it when writes work again. Values are deterministic per
    // (seed, path, code version), so a later file write of this exact
    // record is faithful, not reconstructed.
    console.log('FULLJSON ' + JSON.stringify(result));
    console.error('WRITE FAILED after retries: ' + out);
    process.exit(4);
  }
  console.log(JSON.stringify({ seed, path: p, pid, covered, dupGrief,
    teles: after.teles, fallen: after.fallen, corpses: after.corpses,
    grief: rec.villageDeathEvents, gossipDied: after.gossipDied, error: !!error }));
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
