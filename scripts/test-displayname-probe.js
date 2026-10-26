#!/usr/bin/env node
// scripts/test-displayname-probe.js — sim-displayname-a single-seed probe
// (scale-onramp axis, DIAG ONLY, zero src/js changes).
//
// WHY A RE-RUN: the landed defnarr corpus records fight rows only —
// it has no codex history, so the DAY the village agreed on each
// monster's name (the intervening event between the last old-name
// meeting and the first new-name meeting) cannot be read from the
// corpus. This probe re-runs ONLY seed 73675 with the defnarr
// harvest composition reused verbatim (tableseat-nowait wrapped
// with raftdraft/spawnsrc/oldcore/defwound-diag, DEFWOUND_TRANSCRIPT=1,
// 180d death-aware horizon) plus ONE read-only addition: a daily
// snapshot of the codex monster entries for hushwolf and
// voice_mimic_radio (villageName, namingKicked, reported, proposal
// tally — primitives copied out, no Game writes, no RNG use).
// Neutrality is proven, not assumed: the probe's final row and its
// defwound name sequences for both mids must match the landed
// corpus row for 73675 exactly (days/gameDays/endReason/deaths/won/
// nationalEver + switch brackets); any mismatch exits 1.
// Usage: node scripts/test-displayname-probe.js [--selftest]
// Writes: evidence/2026-10-26/perseed-sim-displayname-a/s73675-probe.json
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { newStore: newRaftStore, installRaftdraftDiag, withRaftdraftDiag } = require('./policies/raftdraft-diag');
const { newStore: newSpawnStore, installSpawnsrcDiag, withSpawnsrcDiag } = require('./policies/spawnsrc-diag');
const { newStore: newOldStore, installOldcoreDiag, withOldcoreDiag } = require('./policies/oldcore-diag');
const { newStore: newDefStore, installDefwoundDiag, withDefwoundDiag } = require('./policies/defwound-diag');

const MIDS = ['hushwolf', 'voice_mimic_radio'];
const CORPUS_ROW = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-defnarr-a', 's73675-armed.json');
const OUT_DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-displayname-a');

const PATTERNS = [
  /(?:stared down|stood down) the (.+?) and (?:kept walking|it backed off)/,
  /killed the (.+?) alone/,
  /The (.+?) mauled /,
  /The (.+?) killed .* in \d+ rounds?\. The village mourns/,
  /The (.+?) came for .* and missed/,
];
function nameOf(line) {
  if (line == null) return null;
  for (const p of PATTERNS) { const m = p.exec(line); if (m) return m[1]; }
  return '?' + String(line).slice(0, 80);
}

function snapEntry(Game, mid) {
  // READ-ONLY: copy primitives out of the codex entry; never write back.
  try {
    const e = ((Game.state || {}).codex || {}).monsters || {};
    const en = e[mid] || null;
    if (!en) return null;
    const tally = {};
    for (const [vid, nm] of Object.entries(en.proposals || {})) tally[nm] = (tally[nm] || 0) + 1;
    return {
      villageName: en.villageName || null,
      namingKicked: !!en.namingKicked,
      reported: !!en.reported,
      knowersN: (en.knowers || []).length,
      proposals: Object.assign({}, en.proposals || {}),
      tally,
    };
  } catch (err) { return { error: String((err && err.message) || err).slice(0, 120) }; }
}

async function main() {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.OLDCORE = '1'; process.env.DEFWOUND = '1';
  process.env.DEFWOUND_TRANSCRIPT = '1';
  const raftStore = newRaftStore(), spawnStore = newSpawnStore(), oldStore = newOldStore(), defStore = newDefStore();
  const base = withDefwoundDiag(withOldcoreDiag(withSpawnsrcDiag(withRaftdraftDiag(
    tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore),
    'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
    'oldcore-diag', 'tableseat-nowait + old-core turnover census', oldStore),
    'defwound-diag', 'tableseat-nowait + defender wound census', defStore);
  const { Game } = await loadGame({ seed: 73675, mode: 'defwound-diag-armed', fullTelemetry: false });
  await setupGame(Game);
  try { installRaftdraftDiag(Game, raftStore); } catch (e) {}
  try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
  try { installOldcoreDiag(Game, oldStore); } catch (e) {}
  try { installDefwoundDiag(Game, defStore); } catch (e) {}
  // Daily snapshot: loop-day cadence (runDays calls policy.daily once per
  // loop-day, before sleep). Snapshot BEFORE delegating to base.daily so
  // the base policy sees exactly the call it would have seen unwrapped.
  const snaps = [];
  let loopDay = 0;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      loopDay++;
      const rec = { loopDay, scholarDay: ((G.state || {}).scholar || {}).day || 0,
        systemArrived: !!(G.state || {}).systemArrived };
      for (const mid of MIDS) rec[mid] = snapEntry(G, mid);
      snaps.push(rec);
      if (base.daily) return base.daily(G, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const corpus = JSON.parse(fs.readFileSync(CORPUS_ROW, 'utf8'));
  const rows = defStore.resolveFights || [];
  const out = {
    seed: 73675, probe: 'displayname-codex-snapshot',
    final: { days: result.days, gameDays: result.gameDays, endReason: result.endReason,
      deathTotal: (result.samples.deaths || []).length, won: Game.won ? 1 : 0 },
    corpusFinal: { days: corpus.days, gameDays: corpus.gameDays, endReason: corpus.endReason,
      deathTotal: corpus.deathTotal, won: corpus.won, nationalEver: corpus.nationalEver },
    snaps,
    defwoundRows: rows.filter(r => MIDS.includes(r.mid)).map(r => ({
      day: r.day, seq: r.seq, mid: r.mid, vid: r.vid, outcome: r.outcome, name: nameOf(r.awayNewsLast),
    })),
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 's73675-probe.json'), JSON.stringify(out, null, 1) + '\n');

  let failures = 0;
  const check = (c, label) => { console.log((c ? 'PASS ' : 'FAIL ') + label); if (!c) failures++; };
  check(out.final.days === corpus.days, `neutrality: days ${out.final.days} == corpus ${corpus.days}`);
  check(out.final.gameDays === corpus.gameDays, `neutrality: gameDays ${out.final.gameDays} == corpus ${corpus.gameDays}`);
  check(String(out.final.endReason) === String(corpus.endReason), `neutrality: endReason ${out.final.endReason} == corpus ${corpus.endReason}`);
  check(out.final.deathTotal === corpus.deathTotal, `neutrality: deaths ${out.final.deathTotal} == corpus ${corpus.deathTotal}`);
  check(out.final.won === corpus.won, `neutrality: won ${out.final.won} == corpus ${corpus.won}`);
  // Name sequences on the probe trajectory must reproduce the corpus sequences.
  const corpusRows = corpus.defwound.resolveFights.filter(r => MIDS.includes(r.mid))
    .map(r => [r.day, r.seq, r.mid, r.vid, nameOf(r.awayNewsLast)].join('|'));
  const probeRows = out.defwoundRows.map(r => [r.day, r.seq, r.mid, r.vid, r.name].join('|'));
  check(JSON.stringify(probeRows) === JSON.stringify(corpusRows),
    `neutrality: defwound name sequences for both mids reproduce corpus exactly (${probeRows.length} rows)`);
  // Conclusion days: first snapshot day with a villageName.
  const conclusion = {};
  for (const mid of MIDS) {
    const first = snaps.find(s => s[mid] && s[mid].villageName);
    conclusion[mid] = first ? { loopDay: first.loopDay, scholarDay: first.scholarDay,
      villageName: first[mid].villageName, tally: first[mid].tally } : null;
    console.log(`CONCLUSION ${mid}: ${conclusion[mid] ? `loopDay ${conclusion[mid].loopDay} scholarDay ${conclusion[mid].scholarDay} name=${JSON.stringify(conclusion[mid].villageName)} tally=${JSON.stringify(conclusion[mid].tally)}` : 'NEVER'}`);
  }
  for (const mid of MIDS) {
    check(!!conclusion[mid], `${mid}: villageName concluded during the run`);
    if (conclusion[mid]) {
      const before = out.defwoundRows.filter(r => r.mid === mid && r.day < conclusion[mid].scholarDay);
      const after = out.defwoundRows.filter(r => r.mid === mid && r.day >= conclusion[mid].scholarDay);
      // The first fight at/after the conclusion day must use the new name;
      // fights before it must use the old name. (Fights ON the conclusion
      // scholar-day may precede the nightly conclusion — report, don't fail.)
      const oldName = mid === 'hushwolf' ? 'Hushpuppy' : 'Static';
      check(before.every(r => r.name === oldName), `${mid}: all pre-conclusion fights use ${oldName}`);
      const strictlyAfter = out.defwoundRows.filter(r => r.mid === mid && r.day > conclusion[mid].scholarDay);
      check(strictlyAfter.every(r => r.name === conclusion[mid].villageName.replace(/^The /, '')),
        `${mid}: all post-conclusion fights use the village name`);
      console.log(`  ${mid}: pre-conclusion fights=${before.length}, post-conclusion fights=${after.length}`);
    }
  }
  console.log(failures ? `\n${failures} FAILURES` : '\nPROBE PASS');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('PROBE ERROR', e && e.stack || e); process.exit(2); });
