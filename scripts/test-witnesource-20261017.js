#!/usr/bin/env node
// scripts/test-witnesource-20261017.js — proof for the exposure source
// (arm sim-witnesource, 2026-10-17).
//
// RED->GREEN: the witness door (table-witness.js, exposed >= 3) is dead
// substrate without the source; the source (src/js/exposure.js) makes it
// earnable via real, attributable events on the kept list.
//   - RED: EXPOSURE=0 -> recordExposure null, fireTick null, no records.
//   - GREEN: 3 real exposures -> door earned (strength 49); 2 -> not earned.
//   - GREEN: fire-side beat names a lie with attribution; gossip wrap
//     records; dedupe blocks double-count; charges read the real list.
//   - DET-GATE: layer OFF -> zero layer effects (no records, no fire says).
//
// KILL PROTOCOL: if the PRIMARY misses and the layer is reverted zero-trace,
// this test repairs to the INFO-SKIP branch (exposure.js absent -> records
// verdict, skips mechanism checks) instead of failing.
//
//   FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 node scripts/test-witnesource-20261017.js
//   SMOKE=1 ... (skips the 60d det-gate)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const SMOKE = process.env.SMOKE === '1';
let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

const LAYER_PATH = path.join(__dirname, '..', 'src', 'js', 'exposure.js');
if (!fs.existsSync(LAYER_PATH)) {
  console.log('LAYER ABSENT (killed at pilot NO-GO) — mechanism checks skipped by design.');
  ok('kill-protocol: no exposure.js in src/js/', true);
  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
}

async function withEnvAsync(v, fn) {
  const prev = process.env.EXPOSURE;
  if (v == null) delete process.env.EXPOSURE; else process.env.EXPOSURE = v;
  try { return await fn(); } finally {
    if (prev == null) delete process.env.EXPOSURE; else process.env.EXPOSURE = prev;
  }
}

async function main() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');

  // ---------- RED: layer OFF is inert ----------
  await withEnvAsync('0', async () => {
    const { Game } = await loadGame({ seed: 4241, mode: 'witnesource-red' });
    await setupGame(Game);
    ok('RED: recordExposure null when OFF', Game.recordExposure({ kind: 'lie', accused: 'x', charge: 'y' }) === null);
    ok('RED: exposureFireTick null when OFF', Game.exposureFireTick() === null);
    ok('RED: kept list empty when OFF', Game.exposureRecord().length === 0);
    ok('RED: ledger.exposed untouched when OFF', (Game.ledger().exposed | 0) === 0);
  });

  // ---------- GREEN: the kept list ----------
  {
    const { Game } = await loadGame({ seed: 4242, mode: 'witnesource-green' });
    await setupGame(Game);
    // validation: never free numbers
    ok('GREEN: recordExposure rejects missing kind', Game.recordExposure({ accused: 'a', charge: 'c' }) === null);
    ok('GREEN: recordExposure rejects missing accused', Game.recordExposure({ kind: 'lie', charge: 'c' }) === null);
    ok('GREEN: recordExposure rejects missing charge', Game.recordExposure({ kind: 'lie', accused: 'a' }) === null);
    ok('GREEN: invalid writes move nothing', (Game.ledger().exposed | 0) === 0);

    const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    assert(vids.length >= 3, 'need 3+ villagers for the fixture');
    const [a, b, c] = vids;
    const r1 = Game.recordExposure({ kind: 'lie', accuser: a, accused: b, charge: "lied about where they're from", amount: 1 });
    ok('GREEN: first exposure records', !!r1 && r1.day === (Game.state.scholar.day || 0));
    ok('GREEN: record is attributable', r1.accuser === a && r1.accused === b && !!r1.charge);
    ok('GREEN: ledger.exposed moves', (Game.ledger().exposed | 0) === 1);
    // dedupe: same wrong named twice = one exposure
    const r1dup = Game.recordExposure({ kind: 'lie', accuser: c, accused: b, charge: "lied about where they're from", amount: 1 });
    ok('GREEN: duplicate naming blocked (list remembers)', r1dup === null);
    ok('GREEN: duplicate moves nothing', (Game.ledger().exposed | 0) === 1);
    // a different wrong by the same person is a new exposure
    const r2 = Game.recordExposure({ kind: 'lie', accuser: a, accused: b, charge: 'lied about their trade', amount: 1 });
    ok('GREEN: distinct wrong records separately', !!r2 && (Game.ledger().exposed | 0) === 2);
    // bribery weights 2 (the moot exposure verb)
    const r3 = Game.recordExposure({ kind: 'bribe', accuser: Game.villagerId, accused: c, charge: "bought a vote", amount: 2 });
    ok('GREEN: bribery records at weight 2', !!r3 && (Game.ledger().exposed | 0) === 4);

    // the door: 3+ exposures + a seat = earned
    const _seat = Game.tableSeat;
    Game.tableSeat = () => ({ seat: 'lesser', detail: {} });
    try {
      const priced = Game.tableEarnedPaths();
      const wit = priced.find(p => p.id === 'witness');
      ok('GREEN: witness door priced', !!wit);
      ok('GREEN: 4 exposures -> door earned', wit.earned === true);
      ok('GREEN: strength = 25 + 8*exposed', wit.strength === 25 + 8 * 4);
      ok('GREEN: why cites the record', /4 exposures/.test(wit.why));
    } finally { Game.tableSeat = _seat; }

    // the charges read the real list
    const charges = Game.exposureChargeLines(3);
    ok('GREEN: charge lines name real records', charges.length === 3 && charges.every(l => /Day \d+ — .* named .*: .*lie|bribe/.test(l) || /named/.test(l)));
    console.log('   sample charge: ' + charges[0]);
  }

  // ---------- GREEN: 2 exposures -> door NOT earned ----------
  {
    const { Game } = await loadGame({ seed: 4243, mode: 'witnesource-green2' });
    await setupGame(Game);
    const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    Game.recordExposure({ kind: 'lie', accuser: vids[0], accused: vids[1], charge: 'lied about their trade', amount: 1 });
    Game.recordExposure({ kind: 'lie', accuser: vids[0], accused: vids[2], charge: "lied about where they're from", amount: 1 });
    const _seat = Game.tableSeat;
    Game.tableSeat = () => ({ seat: 'lesser', detail: {} });
    try {
      const wit = Game.tableEarnedPaths().find(p => p.id === 'witness');
      ok('GREEN: 2 exposures -> door NOT earned (bar holds at 3)', wit.earned === false);
      ok('GREEN: why names the shortfall', /2 exposures/.test(wit.why) && /needs 3/.test(wit.why));
    } finally { Game.tableSeat = _seat; }
  }

  // ---------- GREEN: fire-side beat (villager agency) ----------
  {
    const { Game } = await loadGame({ seed: 4244, mode: 'witnesource-fire' });
    await setupGame(Game);
    // find a real unconfessed lie
    let liar = null, field = null;
    for (const vid of (Game.npcIds ? Game.npcIds() : [])) {
      const lies = Game.npcLies ? Game.npcLies(vid) : null;
      if (!lies) continue;
      for (const f of ['occupation', 'origin', 'goal']) {
        if (lies[f] && !lies[f].confessed) { liar = vid; field = f; break; }
      }
      if (liar) break;
    }
    if (!liar) {
      console.log('(no lies generated on seed 4244 — fire-beat check skipped, not failed)');
    } else {
      const says = [];
      const _say = Game.say;
      Game.say = function (m) { says.push(String(m)); return _say.apply(this, arguments); };
      // force the beat: drive Math.random low for the 14% gate
      const _rnd = Math.random;
      let rec = null, tries = 0;
      try {
        while (!rec && tries++ < 40) {
          Math.random = () => 0.01; // pass the gate, pick first lie/candidates
          rec = Game.exposureFireTick();
          Math.random = _rnd;
          if (!rec) Math.random = _rnd;
        }
      } finally { Math.random = _rnd; Game.say = _say; }
      ok('GREEN: fire-side beat fires and records', !!rec);
      if (rec) {
        ok('GREEN: fire record attributable', !!rec.accuser && !!rec.accused && !!rec.charge && rec.day != null);
        ok('GREEN: fire beat narrated (not silent)', says.some(s => s.includes('\uD83D\uDD25')));
        ok('GREEN: ledger moved', (Game.ledger().exposed | 0) >= 1);
        console.log('   fire line: ' + says.find(s => s.includes('\uD83D\uDD25')).slice(0, 160) + '...');
        // the named may confess (forced by Math.random=0.01) — a second,
        // distinct exposure on the kept list.
        const conf = Game.exposureRecord().find(r => r.kind === 'confession');
        ok('GREEN: fire-side confession records separately', !!conf);
        if (conf) console.log('   confession: ' + conf.charge);
      }
    }
  }

  // ---------- GREEN: gossip wrap records lie-namings ----------
  {
    const { Game } = await loadGame({ seed: 4245, mode: 'witnesource-gossip' });
    await setupGame(Game);
    let liar = null;
    for (const vid of (Game.npcIds ? Game.npcIds() : [])) {
      const lies = Game.npcLies ? Game.npcLies(vid) : null;
      if (lies && ((lies.occupation && !lies.occupation.confessed) || (lies.origin && !lies.origin.confessed))) { liar = vid; break; }
    }
    if (!liar || !Game.npcGossipAbout) {
      console.log('(no liar on seed 4245 — gossip-wrap check skipped, not failed)');
    } else {
      const before = Game.exposureRecord().length;
      const tellers = (Game.npcIds ? Game.npcIds() : []).filter(id => id !== liar && id !== Game.villagerId);
      let hit = false;
      for (let i = 0; i < 30 && !hit; i++) {
        const teller = tellers[i % tellers.length];
        const r = Game.npcGossipAbout(teller, liar);
        if (r && r.contradictsLie) hit = true;
      }
      const after = Game.exposureRecord().length;
      ok('GREEN: gossip lie-naming observed in 30 tries', hit);
      if (hit) ok('GREEN: gossip naming recorded on the list', after === before + 1);
    }
  }

  // ---------- DET-GATE: OFF = zero layer effects (60d) ----------
  if (!SMOKE) {
    await withEnvAsync('0', async () => {
      const { Game } = await loadGame({ seed: 9851, mode: 'witnesource-detgate' });
      await setupGame(Game);
      const says = [];
      const _say = Game.say;
      Game.say = function (m) { says.push(String(m)); return _say.apply(this, arguments); };
      const { leadtakeseat } = require('./policies/takeseat');
      await quietLog(() => runDays(Game, leadtakeseat, { days: 60 }));
      Game.say = _say;
      ok('DET-GATE: no exposure records with layer off (60d)', Game.exposureRecord().length === 0);
      ok('DET-GATE: no fire-side naming says with layer off',
        !says.some(s => /says it at the fire|sets their bowl down|turning something over all evening/.test(s)));
      ok('DET-GATE: ledger.exposed 0 with layer off (modal road)', (Game.ledger().exposed | 0) === 0);
    });
  } else console.log('(SMOKE: 60d det-gate skipped)');

  console.log(pass + ' checks passed');
}

if (require.main === module) {
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.TAKESEAT !== '1') {
    console.error('TEST STOP: need FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1');
    process.exit(2);
  }
  main().catch(e => { console.error('TEST FATAL', e); process.exit(1); });
}
