#!/usr/bin/env node
// test-sametick-a.js — proof for the same-tick recorder fix (sim-sametick-a,
// 2026-11-09, oversight-flesh-out-loop run fleshout-20261109T1015Z, axis
// food-economy). The feveranat tick wrapper diffed v.sick before/after the
// whole villageSicknessTick call, so a record created by the infection loop
// and deleted by the nested care pass (duty cure) inside ONE tick was in
// neither map — 30 of 33 duty cures on the medicduty corpus were invisible.
// The fix is prospective: the villagerCareTick wrapper logs a 'dutyCure'
// treatEvent for every record present at care entry and gone at care exit,
// and the analyzer joins each event to its open episode (curedBy
// 'duty-cure-event') or synthesizes a 0-day cured episode when no onset
// exists (curedBy 'duty-same-tick'; sound only for the three names the
// infection loop creates).
//
// Legs:
//   L1 synthetic: a dutyCure event with NO onset synthesizes exactly one
//     0-day cured episode (duration 0, vector from the name, no orphans).
//   L2 synthetic: a dutyCure event WITH an open multi-day episode joins it
//     (curedBy 'duty-cure-event'), counted once, and the snapshot rule does
//     NOT overwrite the direct attribution.
//   L3 synthetic: a dutyCure event for a non-tick name ('radiation
//     sickness', created by the unwrapped feast-buff path) synthesizes NO
//     episode — it is counted as a captured cure with an unrecorded onset —
//     and its matching 'recovered' end is explained, not orphaned.
//   L4 live: oneRun on a seed/day count that produces dutyCure events under
//     the fixed recorder — every event is accounted for (joined, synthesized,
//     or unrecorded-onset), the run is deterministic, and the bare
//     fingerprint equals the recorded fingerprint (recorder neutrality).
//   L5 corpus: the analyzer on the fixed-recorder corpus
//     (evidence/2026-11-09/sametick-a-corpus/) captures >= totalDutyCures-1
//     duty cures, where totalDutyCures is the independent game counter read
//     by the medicduty recorder; on the PRE-FIX medicduty corpus it still
//     reports exactly the 3 snapshot-attributed cures and 0 dutyCure events
//     (the old corpus is structurally blind — no inflation).
//   L6 agreement: the medicduty analyzer and the feveranat analyzer agree on
//     curedEpisodes (and on sameTickCures vs unrecorded-onset cures) on the
//     fixed-recorder corpus.
// Uses seed 96301 at 150 days for the live leg (dutyCure events present on
// the current base — see the L4 comment); the judged 8-seed 150d corpus is
// produced by the sweeps, not by this test.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const ANALYZE = path.join(__dirname, 'analyze-feveranat-a.js');
const ANALYZE_MEDICDUTY = path.join(__dirname, 'analyze-medicduty-a.js');
const OLD_CORPUS = path.join(__dirname, '..', 'evidence', '2026-11-08', 'medicduty-a-corpus', 'after');
const NEW_CORPUS = path.join(__dirname, '..', 'evidence', '2026-11-09', 'sametick-a-corpus');

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}

(async () => {
  const { buildEpisodes } = require('./analyze-feveranat-a.js');

  leg('L1 synthetic: dutyCure with no onset synthesizes one 0-day cured episode', () => {
    const s = { seed: 96301, daysAlive: 150, deathRows: [], daySeries: [],
      mealRows: [], sickOnsets: [], sickEnds: [],
      treatEvents: [
        { day: 42, kind: 'dutyCure', who: 'v1', whoName: 'Ana', diseaseName: 'wound fever',
          diseaseId: 'wound_fever', daysLeftBefore: 5, holder: 'v9' },
      ],
      cureEvents: [] };
    const b = buildEpisodes(s);
    assert.strictEqual(b.eps.length, 1, 'one synthesized episode, got ' + b.eps.length);
    const ep = b.eps[0];
    assert.strictEqual(ep.onsetDay, 42, 'onset day is the cure day, got ' + ep.onsetDay);
    assert.strictEqual(ep.endDay, 42, 'end day is the cure day, got ' + ep.endDay);
    assert.strictEqual(ep.duration, 0, '0-day duration, got ' + ep.duration);
    assert.strictEqual(ep.outcome, 'cured', 'outcome cured, got ' + ep.outcome);
    assert.strictEqual(ep.cured, true, 'cured flag');
    assert.strictEqual(ep.curedBy, 'duty-same-tick', 'curedBy duty-same-tick, got ' + ep.curedBy);
    assert.strictEqual(ep.vector, 'wound', 'vector from the name, got ' + ep.vector);
    assert.strictEqual(ep.who, 'v1', 'patient carried over');
    assert.strictEqual(ep.name, 'wound fever', 'disease name carried over');
    assert.strictEqual(ep.treated, true, 'treated flag');
    assert.deepStrictEqual(ep.treatKinds, ['cure'], 'treatKinds [cure]');
    assert.strictEqual(ep.synthesized, 'duty-same-tick', 'synthesized marker');
    assert.strictEqual(b.orphanEnds.length, 0, 'no orphan ends');
    assert.strictEqual(b.dutyCureUnrecorded.length, 0, 'no unrecorded-onset cures');
  });

  leg('L2 synthetic: dutyCure joins an open episode; snapshot does not overwrite', () => {
    const s = { seed: 96301, daysAlive: 150, deathRows: [],
      daySeries: [{ day: 13, sickMap: { v1: { name: 'gut rot', daysLeft: 4, severity: 2, diagnosed: false } } }],
      mealRows: [],
      sickOnsets: [
        { day: 10, who: 'v1', whoName: 'Bo', kind: 'npc', name: 'gut rot', diseaseId: 'gutrot',
          vector: 'dirty water', vectorSource: 'villageSicknessTick', daysLeft0: 6, severity: 2 },
      ],
      sickEnds: [
        { day: 13, who: 'v1', whoName: 'Bo', kind: 'npc', name: 'gut rot', diseaseId: 'gutrot', outcome: 'recovered' },
      ],
      treatEvents: [
        { day: 13, kind: 'dutyCure', who: 'v1', whoName: 'Bo', diseaseName: 'gut rot',
          diseaseId: 'gutrot', daysLeftBefore: 3, holder: 'v9' },
      ],
      cureEvents: [] };
    const b = buildEpisodes(s);
    assert.strictEqual(b.eps.length, 1, 'one episode (no synthesis), got ' + b.eps.length);
    const ep = b.eps[0];
    assert.strictEqual(ep.duration, 3, 'duration 13-10=3, got ' + ep.duration);
    assert.strictEqual(ep.cured, true, 'cured flag');
    // Direct event evidence outranks the snapshot inference (the end-day
    // snapshot shows daysLeft 4, which would ALSO qualify as duty-snapshot).
    assert.strictEqual(ep.curedBy, 'duty-cure-event', 'curedBy duty-cure-event, got ' + ep.curedBy);
    assert.strictEqual(ep.treated, true, 'treated flag');
    assert.ok(ep.treatKinds.includes('cure'), 'treatKinds includes cure: ' + JSON.stringify(ep.treatKinds));
    assert.strictEqual(ep.synthesized, undefined, 'not synthesized');
    assert.strictEqual(b.dutyCureUnrecorded.length, 0, 'no unrecorded-onset cures');
    // Defensive: a dutyCure event for an episode already cured by another
    // channel (cureEvent here — impossible in live play, since only one
    // deleter can remove a record, but possible in a hand-built corpus)
    // must NOT synthesize a second episode for the one observed cure.
    const s2 = { seed: 96301, daysAlive: 150, deathRows: [], daySeries: [],
      mealRows: [],
      sickOnsets: [
        { day: 10, who: 'v1', whoName: 'Bo', kind: 'npc', name: 'gut rot', diseaseId: 'gutrot',
          vector: 'dirty water', vectorSource: 'villageSicknessTick', daysLeft0: 6, severity: 2 },
      ],
      sickEnds: [
        { day: 13, who: 'v1', whoName: 'Bo', kind: 'npc', name: 'gut rot', diseaseId: 'gutrot', outcome: 'cured', by: 'cureStatus' },
      ],
      treatEvents: [
        { day: 13, kind: 'dutyCure', who: 'v1', whoName: 'Bo', diseaseName: 'gut rot',
          diseaseId: 'gutrot', daysLeftBefore: 3, holder: 'v9' },
      ],
      cureEvents: [
        { day: 13, target: 'v1', diseaseId: 'gutrot', source: 'cureStatus' },
      ] };
    const b2 = buildEpisodes(s2);
    assert.strictEqual(b2.eps.length, 1, 'defensive: still one episode, got ' + b2.eps.length);
    assert.strictEqual(b2.eps[0].curedBy, 'cureEvent', 'defensive: cureEvent keeps precedence, got ' + b2.eps[0].curedBy);
    assert.strictEqual(b2.eps[0].synthesized, undefined, 'defensive: no synthesized duplicate');
  });

  leg('L3 synthetic: non-tick name synthesizes nothing; end explained, not orphaned', () => {
    const s = { seed: 96301, daysAlive: 150, deathRows: [], daySeries: [],
      mealRows: [], sickOnsets: [], sickEnds: [
        { day: 55, who: 'v2', whoName: 'Cy', kind: 'npc', name: 'radiation sickness',
          diseaseId: 'radiation_sickness', outcome: 'recovered' },
      ],
      treatEvents: [
        { day: 55, kind: 'dutyCure', who: 'v2', whoName: 'Cy', diseaseName: 'radiation sickness',
          diseaseId: 'radiation_sickness', daysLeftBefore: 2, holder: 'v9' },
      ],
      cureEvents: [] };
    const b = buildEpisodes(s);
    assert.strictEqual(b.eps.length, 0, 'no episode synthesized for an unwrapped creation site, got ' + b.eps.length);
    assert.strictEqual(b.dutyCureUnrecorded.length, 1, 'one unrecorded-onset cure counted');
    assert.strictEqual(b.dutyCureUnrecorded[0].diseaseName, 'radiation sickness', 'unrecorded cure named');
    assert.strictEqual(b.orphanEnds.length, 0, 'matching end explained, not orphaned');
    assert.strictEqual(b.dutyCureEnds.length, 1, 'one end explained by the dutyCure event');
  });

  // L4 live leg (seed 96301, 150d — the sweep's committed corpus file for
  // this seed carries 17 dutyCure events and dutyCuresTotal 17 on the
  // current base; the leg pins those numbers and re-proves them live).
  await aleg('L4 live: fixed recorder captures every duty cure on 96301/150d, deterministic, neutral', async () => {
    const { oneRun } = require('./sweep-feveranat-a.js');
    const first = await oneRun(96301, 150);
    const ps = first.perSeed;
    const events = (ps.treatEvents || []).filter(t => t.kind === 'dutyCure');
    assert.ok(events.length >= 1, 'at least one dutyCure event observed (else the leg is vacuous), got ' + events.length);
    // Cross-check against the committed sweep output for the same seed.
    assert.strictEqual(events.length, 17, 'dutyCure events == 17 (committed corpus), got ' + events.length);
    assert.strictEqual((ps.dutyCuresTotal || {}).total, 17, 'dutyCuresTotal == 17, got ' + JSON.stringify(ps.dutyCuresTotal));
    // ACCOUNTING: every observed event is a joined episode, a synthesized
    // same-tick episode, or an unrecorded-onset cure.
    const built = buildEpisodes(ps);
    const joined = built.eps.filter(e => e.curedBy === 'duty-cure-event').length;
    const synth = built.eps.filter(e => e.curedBy === 'duty-same-tick').length;
    assert.strictEqual(joined + synth + built.dutyCureUnrecorded.length, events.length,
      'joined+synthesized+unrecorded == events (' + joined + '+' + synth + '+' + built.dutyCureUnrecorded.length + ' vs ' + events.length + ')');
    assert.strictEqual(events.length, (ps.dutyCuresTotal || {}).total,
      'events == game-counter total (no miss on this seed)');
    // Determinism: the same seed twice => identical per-seed JSON.
    const second = await oneRun(96301, 150);
    assert.strictEqual(JSON.stringify(second.perSeed), JSON.stringify(ps), 'deterministic per-seed JSON');
    assert.strictEqual(JSON.stringify(second.fingerprint), JSON.stringify(first.fingerprint), 'deterministic fingerprint');
    // Neutrality: bare fingerprint == recorded fingerprint (the new
    // wrapper reads only — the medicDutyHolder() call and the record copies
    // consume no RNG and write no Game state).
    const bare = await oneRun(96301, 150, { bare: true });
    assert.strictEqual(JSON.stringify(bare.fingerprint), JSON.stringify(first.fingerprint),
      'bare vs recorded fingerprint: ' + JSON.stringify(bare.fingerprint) + ' vs ' + JSON.stringify(first.fingerprint));
    console.log('    96301/150d live: dutyCure events=' + events.length + ' total=' + ps.dutyCuresTotal.total +
      ' joined=' + joined + ' synthesized=' + synth + ' unrecorded=' + built.dutyCureUnrecorded.length +
      ' daysAlive=' + ps.daysAlive);
  });

  // L5/L6 use the committed corpora (no sim re-run inside the test).
  const runAnalyzer = (args) => {
    const r = cp.spawnSync(process.execPath, [ANALYZE, ...args], { encoding: 'utf8', timeout: 120000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 400));
    return r.stdout;
  };
  const parseCured = (out) => {
    const m = out.match(/cured-episodes=(\d+) \(cureEvent (\d+), cured-end (\d+), duty-snapshot (\d+), duty-cure-event (\d+), duty-same-tick (\d+)\)/);
    assert.ok(m, 'F4 cured-episodes line found');
    return { total: +m[1], cureEvent: +m[2], curedEnd: +m[3], snapshot: +m[4], dutyEvent: +m[5], dutySameTick: +m[6] };
  };
  const parseDuty = (out) => {
    const m = out.match(/dutyCure events observed by the care wrapper=(\d+) \(joined to episodes (\d+), synthesized same-tick episodes (\d+), unrecorded-onset cures (\d+), ends explained by a dutyCure event (\d+)\)/);
    assert.ok(m, 'F4 DUTY CURES line found');
    return { events: +m[1], joined: +m[2], synthesized: +m[3], unrecorded: +m[4], endsExplained: +m[5] };
  };
  let newCured = null, newDuty = null;
  leg('L5 corpus: fixed recorder captures >= totalDutyCures-1 on the new corpus; old corpus still 3', () => {
    assert.ok(fs.existsSync(NEW_CORPUS), 'fixed-recorder corpus exists: ' + NEW_CORPUS);
    const out = runAnalyzer([NEW_CORPUS]);
    newCured = parseCured(out);
    newDuty = parseDuty(out);
    // Ground truth: the game's own counter, read at run end by the fixed
    // recorder into each per-seed file (same field the medicduty recorder
    // reads). The old corpus's 33 came from that same counter.
    let total = 0;
    for (let s = 96301; s <= 96308; s++) {
      const f = JSON.parse(fs.readFileSync(path.join(NEW_CORPUS, `feveranat-a-competent-s${s}.json`), 'utf8'));
      assert.ok(f.dutyCuresTotal && typeof f.dutyCuresTotal.total === 'number',
        's' + s + ' carries dutyCuresTotal');
      total += f.dutyCuresTotal.total;
    }
    // PRIMARY (pre-registered): capture >= total-1, at most one miss.
    assert.ok(newDuty.events >= total - 1,
      'dutyCure events ' + newDuty.events + ' >= totalDutyCures-1 ' + (total - 1) + ' (total ' + total + ')');
    // ACCOUNTING: every observed event is a joined episode, a synthesized
    // same-tick episode, or an unrecorded-onset cure — nothing vanishes.
    assert.strictEqual(newDuty.joined + newDuty.synthesized + newDuty.unrecorded, newDuty.events,
      'joined+synthesized+unrecorded == events (' + newDuty.joined + '+' + newDuty.synthesized + '+' + newDuty.unrecorded + ' vs ' + newDuty.events + ')');
    assert.strictEqual(newCured.dutyEvent, newDuty.joined, 'F4 duty-cure-event count matches the DUTY CURES line');
    assert.strictEqual(newCured.dutySameTick, newDuty.synthesized, 'F4 duty-same-tick count matches the DUTY CURES line');
    console.log('    new corpus: totalDutyCures=' + total + ' events=' + newDuty.events +
      ' cured-episodes=' + newCured.total + ' (duty-cure-event ' + newCured.dutyEvent +
      ', duty-same-tick ' + newCured.dutySameTick + ', duty-snapshot ' + newCured.snapshot + ')');
    // STRUCTURAL BLINDNESS, preserved: the pre-fix corpus still reports
    // exactly the 3 snapshot-attributed cures and 0 dutyCure events — the
    // analyzer fix invents nothing where the recorder logged nothing.
    assert.ok(fs.existsSync(OLD_CORPUS), 'pre-fix corpus exists: ' + OLD_CORPUS);
    const oldOut = runAnalyzer([OLD_CORPUS]);
    const oldCured = parseCured(oldOut);
    const oldDuty = parseDuty(oldOut);
    assert.strictEqual(oldCured.total, 3, 'old corpus cured-episodes still 3, got ' + oldCured.total);
    assert.strictEqual(oldDuty.events, 0, 'old corpus dutyCure events still 0, got ' + oldDuty.events);
    assert.strictEqual(oldCured.dutyEvent, 0, 'old corpus duty-cure-event 0');
    assert.strictEqual(oldCured.dutySameTick, 0, 'old corpus duty-same-tick 0');
  });

  leg('L6 agreement: medicduty join agrees with feveranat join on the new corpus', () => {
    const { episodesOf } = require('./analyze-medicduty-a.js');
    let fevCured = 0, medCured = 0, fevUnrecorded = 0, medSameTick = 0, total = 0;
    for (let s = 96301; s <= 96308; s++) {
      const f = JSON.parse(fs.readFileSync(path.join(NEW_CORPUS, `feveranat-a-competent-s${s}.json`), 'utf8'));
      const b = buildEpisodes(f);
      const m = episodesOf(f);
      const fc = b.eps.filter(e => e.cured).length;
      const mc = m.filter(e => e.cured).length;
      assert.strictEqual(mc, fc, 's' + s + ' medicduty curedEpisodes == feveranat cured-episodes (' + mc + ' vs ' + fc + ')');
      fevCured += fc; medCured += mc;
      fevUnrecorded += b.dutyCureUnrecorded.length;
      total += (f.dutyCuresTotal || {}).total || 0;
    }
    medSameTick = total - medCured;
    assert.strictEqual(medSameTick, fevUnrecorded,
      'medicduty sameTickCures (' + medSameTick + ') == feveranat unrecorded-onset cures (' + fevUnrecorded + ')');
    console.log('    agreement: curedEpisodes=' + fevCured + ' both analyzers; sameTick/unrecorded=' + fevUnrecorded + '; totalDutyCures=' + total);
  });

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
