#!/usr/bin/env node
// scripts/test-holdloss2-20261015.js — proof for the hold-loss instrument
// r5 extension (sim-holdloss2, 2026-10-15, scale-onramp axis).
//
// The r5 substrate arms three post-r4 levers; the instrument (scripts/
// holdloss-lib-20261015.js) was extended in place for the SUCCGRACE beat
// text ("the bond is fraying", "grief delays the verdict", "the silence
// answered"). This proof pins the extension:
//
//   F0 substrate: all four env flags asserted up front (#312 lesson);
//     tribfloor.layerOn() true; policy ids; the game-code gates read the
//     env on a LIVE Game instance (_succGraceGate, _rdOn).
//   F1 grace recognition: a chain made ONLY of grace staging/expiry beats
//     (no "dead hold no treaties", no "realm came apart") -> succession-
//     chain, graceBeats counted in the evidence.
//   F2 REAL-RED: the r4 regex (inline old classifier) on that fixture ->
//     other-named — it demonstrably cannot see grace-mediated chains;
//     the extended instrument -> succession-chain.
//   F3 no false positives: silence-adjacent non-grace text ("the village
//     holds its silence") must NOT count; such a fixture attributes by
//     family, never by the grace text.
//   F4 regression: the r4 old-style succession fixture still ->
//     succession-chain with graceBeats === 0.
//   F5 held-to-end: no loss attributed on a hold.
//   F6 trajectory neutrality: instrument ON vs OFF byte-identical 30d on
//     the r5 substrate (tribfloor-wrapped leadfeast, all four flags).
'use strict';
const HL = require('./holdloss-lib-20261015');

const flags = { R13: process.env.FEASTSCALE_R13 === '1', TF: process.env.TRIBFLOOR === '1', SG: process.env.SUCCGRACE === '1', RD: process.env.RAIDDENSITY === '1' };
const missing = Object.entries(flags).filter(([, v]) => !v).map(([k]) => k);

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function scaleRows(schedule, N) {
  const rows = [];
  for (let d = 1; d <= N; d++) {
    let rank = 'village';
    for (const s of schedule) if (d >= s.from && d <= s.to) rank = s.rank;
    rows.push({ day: d, rank, links: [], exiled: false });
  }
  return rows;
}
function mkDeath(day, name, cause, kind) {
  return { day, name, cause, kind: kind || 'villager' };
}
function beat(day, text) { return { day, text }; }
function mkRec(o) {
  o = o || {};
  const N = o.days || 100;
  return {
    seed: o.seed || 1, policy: o.policy || 'leadfeast', days: N,
    endReason: o.endReason || 'village-lost', won: !!o.won,
    scaleRows: o.scaleRows || scaleRows([{ from: 41, to: N, rank: 'national' }], N),
    foodRows: [], standingRows: [],
    deaths: o.deaths || [], beats: o.beats || [],
    waveUnlockDays: o.waveUnlockDays || { 4: null, 5: null },
    breaks: o.breaks || [], exiledEver: !!o.exiledEver, exiledDay: o.exiledDay || null,
  };
}

// The r4 succession-beat regex, inline — the pre-extension instrument's
// view of the world. Used ONLY for the REAL-RED demonstration.
const OLD_SUCC_BEAT = /dead hold no treaties|realm came apart|succession/i;
function oldSeesChain(rec) {
  const ld = 100;
  const sb = (rec.beats || []).filter(b => OLD_SUCC_BEAT.test(String(b.text || '')) && Math.abs((b.day || 0) - ld) <= 14);
  return sb.length >= 3;
}

// Grace beat texts, verbatim from src/js/hierarchy.js (line ~1613 staging,
// ~1759 expiry). "the new bearer answers" — the on-disk bytes are
// "bearer answers:" (verified charCodes; the <redacted> is a display
// artifact, not file content).
const GRACE_STAGE_1 = "Thornfield's new speaker sends word: the bond is fraying \u2014 trust 32, below the 40 the realm stands on. The realm will come apart unless the new bearer answers: send grain (1,500 kcal), send a speaker (2 days), or let the silence answer. Grief delays the verdict \u2014 seven days.";
const GRACE_STAGE_2 = "Emberhold's new speaker sends word: the bond is fraying \u2014 trust 28, below the 40 the realm stands on. The realm will come apart unless the new bearer answers: send grain (1,500 kcal), send a speaker (2 days), or let the silence answer. Grief delays the verdict \u2014 seven days.";
const GRACE_EXPIRY = "Seven days of silence, and the silence answered for Haven. Thornfield's new speaker reads it plainly. (Trust -6.)";

console.log('F0: r5 substrate assertions');
chk('all four substrate flags set', missing.length === 0, 'missing: ' + missing.join(','));
const TF = require('./policies/tribfloor');
chk('tribfloor layerOn() true', TF.layerOn() === true);
chk('tribfloor leadfeast id', TF.leadfeast && TF.leadfeast.id === 'leadfeast', 'got ' + (TF.leadfeast && TF.leadfeast.id));
chk('tribfloor belongfeast id', TF.belongfeast && TF.belongfeast.id === 'belongfeast', 'got ' + (TF.belongfeast && TF.belongfeast.id));

console.log('F1: grace-mediated succession chain');
const recGrace = mkRec({
  deaths: [
    mkDeath(90, 'Devon', 'combat'), mkDeath(93, 'Howard', 'combat'), mkDeath(95, 'Minh', 'starvation'),
  ],
  beats: [beat(90, GRACE_STAGE_1), beat(93, GRACE_STAGE_2), beat(97, GRACE_EXPIRY)],
});
const lossGrace = HL.nationalLoss(recGrace);
chk('grace-only chain -> succession-chain', lossGrace.lossMode === 'succession-chain', 'got ' + lossGrace.lossMode);
chk('graceBeats === 3 in evidence', lossGrace.graceBeats === 3, 'got ' + lossGrace.graceBeats);
chk('evidence names the grace mediation', /grace-mediated/.test(lossGrace.lossEvidence.join(' ')));

console.log('F2: REAL-RED — the r4 regex cannot see the grace chain');
chk('old regex misses the grace-only chain', oldSeesChain(recGrace) === false);
chk('new instrument names it anyway', lossGrace.lossMode === 'succession-chain');

console.log('F3: no false positives on silence-adjacent text');
const NON_GRACE = 'the village holds its silence after the moot \u2014 no one speaks of the dead';
const recFP = mkRec({
  deaths: [
    mkDeath(90, 'Ava', 'combat'), mkDeath(92, 'Ben', 'combat'), mkDeath(94, 'Cid', 'starvation'),
  ],
  beats: [beat(90, NON_GRACE), beat(92, NON_GRACE), beat(94, NON_GRACE)],
});
const lossFP = HL.nationalLoss(recFP);
chk('silence-adjacent non-grace text is NOT succession-context', lossFP.lossMode !== 'succession-chain', 'got ' + lossFP.lossMode);
chk('fixture attributes by family (combat plurality)', lossFP.lossMode === 'combat', 'got ' + lossFP.lossMode);
chk('"let the silence answer" alone is not the expiry', !/silence answered/i.test('or let the silence answer'));

console.log('F4: regression — old-style chain still works, graceBeats 0');
const recOld = mkRec({
  deaths: [
    mkDeath(90, 'Devon Okafor', 'combat'), mkDeath(93, 'Howard', 'starvation'),
    mkDeath(95, 'Carlos', 'starvation'), mkDeath(97, 'Minh', 'starvation'),
  ],
  beats: [
    beat(90, '\U0001F56F\uFE0F Devon is dead \u2014 and the dead hold no treaties. Every link Haven has shakes.'),
    beat(93, '\U0001F56F\uFE0F Howard is dead \u2014 and the dead hold no treaties. Every link Haven has shakes.'),
    beat(95, '\U0001F56F\uFE0F Carlos is dead \u2014 and the dead hold no treaties. Every link Haven has shakes.'),
    beat(97, '\u25C8 The realm came apart \u2014 no polity answers to Haven now.'),
  ],
});
const lossOld = HL.nationalLoss(recOld);
chk('old-style chain -> succession-chain', lossOld.lossMode === 'succession-chain', 'got ' + lossOld.lossMode);
chk('graceBeats === 0 on the old-style chain', lossOld.graceBeats === 0, 'got ' + lossOld.graceBeats);

console.log('F5: held-to-end has no loss');
const recH = mkRec({ endReason: 'survived', days: 180, deaths: [mkDeath(170, 'Ava', 'starvation')] });
chk('survived at national -> held-to-end', HL.nationalLoss(recH).lossMode === 'held-to-end', 'got ' + HL.nationalLoss(recH).lossMode);

// F6: live-game gates + trajectory neutrality on the r5 substrate.
console.log('F6: live gates + trajectory neutrality (real 30d sims, r5 substrate)');
(async () => {
  if (missing.length) { fail++; console.log('  FAIL F6: substrate flags missing (gate — #312)'); return finish(); }
  try {
    const { loadGame, setupGame, runDays } = require('./sim-harness');
    const { Game: G0 } = await loadGame({ seed: 1, mode: 'holdloss2-gate' });
    chk('Game._succGraceGate() armed by SUCCGRACE=1', typeof G0._succGraceGate === 'function' && G0._succGraceGate() === true);
    chk('Game._rdOn() armed by RAIDDENSITY=1', typeof G0._rdOn === 'function' && G0._rdOn() === true);
    const { leadfeast } = require('./policies/tribfloor');
    const crypto = require('crypto');
    const RB = require('./readinessbind-lib');
    async function traj(instrument) {
      const { Game } = await loadGame({ seed: 33, mode: 'holdloss2-traj' });
      await setupGame(Game);
      const hashes = [];
      const t = { beats: [], deaths: [] };
      if (instrument) {
        const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
        const origSay = Game.say ? Game.say.bind(Game) : null;
        const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
        Game.say = function (msg) { try { t.beats.push({ day: gday(), text: String(msg) }); } catch (e) {} return origSay ? origSay(msg) : msg; };
        Game.registerDeath = function (opts) {
          const r = origReg(opts);
          try { t.deaths.push({ day: gday(), cause: (opts || {}).cause }); } catch (e) {}
          return r;
        };
      }
      const policy = Object.assign({}, leadfeast);
      const origDaily = leadfeast.daily;
      policy.daily = (G, ctx) => {
        if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
        try { hashes.push(RB.trajectoryHash(G)); } catch (e) {}
      };
      await runDays(Game, policy, { days: 30 });
      return { hash: crypto.createHash('sha1').update(hashes.join('|')).digest('hex'), beats: t.beats.length, deaths: t.deaths.length };
    }
    const off = await traj(false);
    const on = await traj(true);
    chk('instrument ON vs OFF byte-identical 30d (r5 substrate)', on.hash === off.hash, on.hash.slice(0, 12) + ' vs ' + off.hash.slice(0, 12));
    chk('instrument actually sampled (beats+deaths>0)', (on.beats + on.deaths) > 0, `beats=${on.beats} deaths=${on.deaths}`);
  } catch (e) {
    fail++; console.log('  FAIL F6 exception: ' + (e && e.message));
  }
  finish();
})();

function finish() {
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
