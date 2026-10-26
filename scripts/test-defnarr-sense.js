#!/usr/bin/env node
// scripts/test-defnarr-sense.js — sim-defnarr-a (fleshout-20261026T1230Z,
// axis scale-onramp, SENSE arm, DIAG ONLY, zero src/js changes).
//
// QUESTIONS (carried blank from sim-defwound-a Sense, 2026-10-25):
// defender-fight awayNews lines look like two boilerplate sentences
// repeated dozens of times, and wait narration may be one line repeated
// hundreds of times. This arm COUNTS both, on the shared
// tableseat-nowait substrate (seeds 73671-73678, 180d death-aware),
// and judges them in plain words. It implements NO narration change.
//
// TWO HARVESTS, KEPT SEPARATE (never pooled into one number):
//  (1) DEFENDER census — measured stream. Reuses the defwound-diag
//      sweep composition VERBATIM (scripts/test-defwound-diag-sweep.js,
//      never edited) with DEFWOUND_TRANSCRIPT=1, so every resolve row
//      carries the engine's own awayNews line for that fight (tap reads
//      scholar.awayNews length before/after delegating; a full queue
//      drops the line and the row records null — counted, never
//      hidden). Corpus: evidence/2026-10-26/perseed-sim-defnarr-a/.
//      Neutrality proof for the tap: this corpus's fight keys and band
//      numbers must match the transcript-OFF defwound Stage 1 corpus
//      (evidence/2026-10-25/perseed-defwound-a/) exactly
//      (--compare-defwound), plus the defwound --detgate PASS.
//  (2) WAIT census — narration-live replay stream. Standard sweep runs
//      silence Game.say (sim-harness: say is a noop unless
//      narration:true), so wait lines CANNOT appear in the measured
//      stream by harness design. The wait harvest therefore runs a
//      separate replay per seed with narration:true and a minimal
//      emit tap (wraps Game.emit, records {day, surface, text},
//      delegates to the original, never throws into the engine, draws
//      no RNG). Trajectory-equivalence per seed (--waitreplay checks
//      days/gameDays/endReason/deathTotal/won/nationalEver against
//      the measured corpus): if it matches on all 8 seeds, the wait
//      census is trajectory-faithful; if any seed diverges, that
//      seed's wait counts are labeled REPLAY-ONLY and the divergence
//      is reported, never smoothed over.
//      The tap records every emit CALL; the engine's own log dedups
//      consecutive identical lines (game.js emit: "never say the
//      exact same thing twice in a row"), so the census reports BOTH
//      wait calls AND wait lines surviving dedup — the player-visible
//      count is the deduped one.
//
// TEMPLATE RULE (defender lines, documented so the census is
// reproducible): strip the leading emoji, replace the villager
// first name with {NAME}, the monster display name with {MONSTER},
// every number with {N}; keep the loot clause as [loot] and the
// post-flee-rest clause as [rest]. Round counts, damage numbers
// and monster names are slots, NOT separate templates — the
// boilerplate question is about sentence shapes, and a template
// split by "3 rounds" vs "0 rounds" would hide it. Exact-verbatim
// repetition (same name + monster + numbers) is counted separately
// as repeat lines and per-instance chains (same seed + spawn seq).
//
// WAIT TEXTS, READ FROM CODE (never invented):
//  - out-of-combat wait (game.js doAction 'wait'): "You wait. The
//    light changes. Nothing asks anything of you." — said ONLY when
//    no fight, no pending encounter, and the game is not over; the
//    day loop's driver calls doAction('wait') 3x per loop-day
//    (sim-harness), so this is the common wait line.
//  - in-combat wait (game.js tbPlayerWait): "You hold still,
//    watching." — or, when heckler-compelled, the answer-back line
//    with a (-{N} SHAME) number. tbPlayerWait is also the default
//    fight driver's end-turn action (sim-harness driveFights).
//
// MODES:
//   --census            defender template census from the corpus dir
//   --compare-defwound  fight keys + band vs defwound (legacy; the
//                       defwound band no longer reproduces on this tree)
//   --compare-tap <file> tap-neutrality: transcript-ON corpus row vs
//                       a transcript-OFF rerun (the proof used here)
//   --waitreplay <seed> one narration-live wait replay (REPLAY-ONLY:
//                       proven trajectory-divergent; writes JSON)
//   --waitreplay-all    all 8 seeds, narration-live
//   --waitreplay2 <seed> one recording-only-say wait replay
//                       (trajectory-faithful; writes wait2 JSON)
//   --waitreplay2-all   all 8 seeds, recording-only-say
//   --waitcensus        wait template census from the wait2 JSONs
//   --transcripts       write defender + wait transcript text files
//   --selftest          template-function unit checks (no sims)
// Exit 1 on any gate failure (unmatched defender template, missing
// corpus seed, wait-replay trajectory mismatch is REPORTED as a
// verdict downgrade, not an exit-1 — see waitcensus output; the
// mismatch itself exits 1 in --waitreplay so it is never silent).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-defnarr-a');
const DEFWOUND_DIR = path.join(REPO, 'evidence', '2026-10-25', 'perseed-defwound-a');
const WAIT_DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-defnarr-a-wait');

function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeRetry(p, body) {
  let last = null;
  for (let a = 1; a < 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) { last = e; console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`); if (a < 8) sleepMs(Math.min(10000, 1000 * a)); }
  }
  throw last;
}

// ---------- defender template abstraction ----------
function defenderTemplate(line) {
  if (line == null) return null;
  let t = String(line);
  // Strip leading emoji + space.
  t = t.replace(/^[^\p{L}\p{N}]+/u, '').trim();
  // Loot clause (vKill suffix): " Took <name> off the body." -> " [loot]".
  let loot = false;
  if (/ Took .+ off the body\./.test(t)) { t = t.replace(/ Took .+ off the body\./, ' [loot]'); loot = true; }
  // Post-flee-rest clause (vFlee suffix) -> " [rest]".
  let rest = false;
  if (/ — staying out of sight for the rest of the day/.test(t)) { t = t.replace(/ — staying out of sight for the rest of the day.*$/, ' [rest]'); rest = true; }
  // Sentence shapes (villager first name = single leading token for
  // mFlee/vKill; monster span anchored on the verb for vFlee/vDie/
  // alreadyDead). Numbers -> {N} afterwards.
  let m;
  if ((m = t.match(/^(\S+) (stared down|stood down) (the .+?) (and it backed off|and kept walking) — (.+)$/))) {
    t = `{NAME} ${m[2]} {MONSTER} ${m[4]} — ${m[5]}`;
  } else if ((m = t.match(/^(\S+) killed (the .+?) alone — (.+)$/))) {
    t = `{NAME} killed {MONSTER} alone — ${m[3]}`;
  } else if ((m = t.match(/^The (.+?) (mauled|came for) (\S+) (.*)$/))) {
    // vFlee: "The <monster> mauled <name> (-N health) over N rounds. ..."
    // or "The <monster> came for <name> and missed — ...".
    t = `The {MONSTER} ${m[2]} {NAME} ${m[4]}`;
  } else if ((m = t.match(/^The (.+?) killed (\S+) in (.+)$/))) {
    t = `The {MONSTER} killed {NAME} in ${m[3]}`;
  } else if ((m = t.match(/^The (.+?) was already dead when (\S+) found it — (.+)$/))) {
    t = `The {MONSTER} was already dead when {NAME} found it — ${m[3]}`;
  } else if ((m = t.match(/^(\S+) met (the .+?) and walked away from it\.$/))) {
    t = `{NAME} met {MONSTER} and walked away from it.`;
  } else {
    return { template: null, unmatched: t, loot, rest };
  }
  t = t.replace(/\d+/g, '{N}');
  return { template: t, unmatched: null, loot, rest };
}

function selftest() {
  const cases = [
    ['⚔️ Landon stared down the Anaconda Empress and it backed off — 0 rounds, not a scratch on them. It\'s still out there, somewhere.',
     '{NAME} stared down {MONSTER} and it backed off — {N} rounds, not a scratch on them. It\'s still out there, somewhere.'],
    ['⚔️ Brunhilde stood down the Drum-Belly and kept walking — 3 rounds, bloodied but breathing. It\'s still out there, somewhere.',
     '{NAME} stood down {MONSTER} and kept walking — {N} rounds, bloodied but breathing. It\'s still out there, somewhere.'],
    ['⚔️ Grace killed the Flashbulb Moth alone — 2 rounds, 10 taken. Word travels fast. The village cheers.',
     '{NAME} killed {MONSTER} alone — {N} rounds, {N} taken. Word travels fast. The village cheers.'],
    ['⚔️ Grace killed the Flashbulb Moth alone — 2 rounds, 10 taken. Word travels fast. Took Strange Loot off the body. The village cheers.',
     '{NAME} killed {MONSTER} alone — {N} rounds, {N} taken. Word travels fast. [loot] The village cheers.'],
    ['🩸 The Murkcap mauled Tesfaye (-33 health) over 2 rounds. They\'re lucky to be breathing.',
     'The {MONSTER} mauled {NAME} (-{N} health) over {N} rounds. They\'re lucky to be breathing.'],
    ['🩸 The Buffering mauled Daniela (-35 health) over 15 rounds. They\'re lucky to be breathing. — staying out of sight for the rest of the day — too hurt to meet it again',
     'The {MONSTER} mauled {NAME} (-{N} health) over {N} rounds. They\'re lucky to be breathing. [rest]'],
    ['🩸 The Murkcap came for Owen and missed — they got clear over 2 rounds, unharmed. They\'re lucky to be breathing.',
     'The {MONSTER} came for {NAME} and missed — they got clear over {N} rounds, unharmed. They\'re lucky to be breathing.'],
    ['💀 The Murkcap killed Tesfaye in 4 rounds. The village mourns.',
     'The {MONSTER} killed {NAME} in {N} rounds. The village mourns.'],
    ['⚔️ The Murkcap was already dead when Landon found it — old news, not a kill.',
     'The {MONSTER} was already dead when {NAME} found it — old news, not a kill.'],
  ];
  let fail = 0;
  for (const [line, want] of cases) {
    const got = defenderTemplate(line);
    if (!got || got.template !== want) { console.log(`SELFTEST FAIL\n  line: ${line}\n  want: ${want}\n  got:  ${got && got.template}`); fail++; }
  }
  // vFlee "came for" shape check: the verb phrase "and missed" is kept
  // inside the tail; assert it explicitly rather than hiding a mismatch.
  const cf = defenderTemplate('🩸 The Murkcap came for Owen and missed — they got clear over 2 rounds, unharmed. They\'re lucky to be breathing.');
  if (!cf.template.includes('and missed')) { console.log('SELFTEST NOTE: came-for template drops "and missed": ' + cf.template); }
  console.log(`SELFTEST ${fail ? 'FAIL ' + fail : 'PASS ' + cases.length + '/' + cases.length}`);
  if (fail) process.exit(1);
}

// ---------- defender census ----------
function censusMode() {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(EVID, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { console.error(`CENSUS FAIL: missing ${p}`); process.exit(1); }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const fightKey = (f) => [f.day, f.vid, f.seq, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  let defFights = 0, recorded = 0, dropped = 0, unmatched = [];
  const templates = {}, verbatim = {}, bySeed = {}, chains = {};
  const outcomeCount = {};
  for (const row of rows) {
    const def = (row.defwound.resolveFights || []).filter(f => f.raid);
    defFights += def.length;
    bySeed[row.seed] = { fights: def.length, recorded: 0, dropped: 0, byOutcome: {} };
    for (const f of def) {
      outcomeCount[f.outcome] = (outcomeCount[f.outcome] || 0) + 1;
      bySeed[row.seed].byOutcome[f.outcome] = (bySeed[row.seed].byOutcome[f.outcome] || 0) + 1;
      const line = f.awayNewsLast || null;
      if (!line) { dropped++; bySeed[row.seed].dropped++; continue; }
      recorded++; bySeed[row.seed].recorded++;
      const res = defenderTemplate(line);
      if (!res.template) { unmatched.push({ seed: row.seed, day: f.day, vid: f.vid, mid: f.mid, line }); continue; }
      templates[res.template] = (templates[res.template] || 0) + 1;
      verbatim[line] = (verbatim[line] || 0) + 1;
      const ck = `${row.seed}|${f.seq}|${line}`;
      chains[ck] = chains[ck] || { seed: row.seed, seq: f.seq, mid: f.mid, line, n: 0, days: [] };
      chains[ck].n++; chains[ck].days.push(f.day);
    }
  }
  const tmplSorted = Object.entries(templates).sort((a, b) => b[1] - a[1]);
  // Merged shapes: singular "round" vs plural "rounds" is grammar, not
  // a new sentence — merge them for the boilerplate verdict.
  const shapes = {};
  for (const [t, n] of tmplSorted) {
    const k = t.replace(/\{N\} rounds?/g, '{N} round(s)');
    shapes[k] = (shapes[k] || 0) + n;
  }
  const shapeSorted = Object.entries(shapes).sort((a, b) => b[1] - a[1]);
  const verbSorted = Object.entries(verbatim).sort((a, b) => b[1] - a[1]);
  const chainSorted = Object.values(chains).sort((a, b) => b.n - a.n);
  // Per-instance (seed+seq) totals: how many defender lines name the same instance.
  const perInstance = {};
  for (const row of rows) {
    for (const f of (row.defwound.resolveFights || []).filter(x => x.raid)) {
      if (f.seq == null) continue;
      const k = `${row.seed}|${f.seq}`;
      perInstance[k] = perInstance[k] || { seed: row.seed, seq: f.seq, mid: f.mid, n: 0, lines: {} };
      perInstance[k].n++;
      if (f.awayNewsLast) perInstance[k].lines[f.awayNewsLast] = (perInstance[k].lines[f.awayNewsLast] || 0) + 1;
    }
  }
  const instSorted = Object.values(perInstance).sort((a, b) => b.n - a.n);
  const out = { label: 'sim-defnarr-a defender census', seeds: SEEDS, defFights, recorded, dropped,
    droppedShare: defFights ? dropped / defFights : null, outcomeCount, bySeed,
    templates: tmplSorted.map(([t, n]) => ({ template: t, count: n, share: recorded ? n / recorded : null })),
    shapes: shapeSorted.map(([t, n]) => ({ shape: t, count: n, share: recorded ? n / recorded : null })),
    topTemplateShare: tmplSorted.length ? tmplSorted[0][1] / recorded : null,
    topTemplate: tmplSorted.length ? tmplSorted[0][0] : null,
    verbatimTop: verbSorted.slice(0, 20).map(([line, n]) => ({ line, count: n })),
    distinctVerbatim: verbSorted.length,
    identicalLineRepeats: verbSorted.filter(([, n]) => n > 1).reduce((t, [, n]) => t + n, 0),
    chainTop: chainSorted.slice(0, 20),
    instanceTop: instSorted.slice(0, 10).map(i => ({ seed: i.seed, seq: i.seq, mid: i.mid, defenderLines: i.n, distinctLines: Object.keys(i.lines).length, lines: i.lines })),
    instancesWithLines: instSorted.length,
    unmatched: unmatched, unmatchedCount: unmatched.length,
    generated: new Date().toISOString() };
  const outPath = path.join(EVID, 'defnarr-census.json');
  writeRetry(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log(`DEFENDER CENSUS fights=${defFights} recorded=${recorded} dropped(null)=${dropped} (${defFights ? (100 * dropped / defFights).toFixed(1) : 'n/a'}%) outcomes=${JSON.stringify(outcomeCount)}`);
  for (const [t, n] of tmplSorted) console.log(`  TEMPLATE ${n} (${recorded ? (100 * n / recorded).toFixed(1) : 'n/a'}%) :: ${t}`);
  console.log(`  TOP-TEMPLATE SHARE: ${out.topTemplateShare != null ? (100 * out.topTemplateShare).toFixed(1) + '%' : 'n/a'} :: ${out.topTemplate}`);
  console.log(`  DISTINCT VERBATIM LINES: ${verbSorted.length}; lines repeated >1x cover ${out.identicalLineRepeats} of ${recorded} recorded lines`);
  for (const v of verbSorted.slice(0, 10)) console.log(`  VERBATIM x${v[1]} :: ${v[0]}`);
  for (const c of chainSorted.slice(0, 10)) console.log(`  CHAIN seed=${c.seed} seq=${c.seq} mid=${c.mid} x${c.n} days=${c.days.join(',')} :: ${c.line}`);
  console.log(`  UNMATCHED: ${unmatched.length}`);
  for (const u of unmatched.slice(0, 10)) console.log(`  UNMATCHED seed=${u.seed} d${u.day} ${u.mid} :: ${u.line}`);
  console.log(`  -> ${outPath}`);
  if (unmatched.length) { console.error('CENSUS GATE FAILURE: unmatched templates'); process.exit(1); }
}

// ---------- tap-neutrality: transcript-ON corpus vs transcript-OFF rerun ----------
// The defwound Stage 1 corpus predates this tree's master (detgate on
// this tree already shows days/ts drift: 177/86 vs 180/77), so a
// literal fight-key match against it is NOT the tap proof here. The
// tap proof is: one seed (73671) re-run transcript-OFF on THIS tree
// into a scratch dir must match the transcript-ON corpus row on fight
// keys + days + gameDays + ts. Usage: --compare-tap <off-run-json>.
function compareTapMode(offPath) {
  const on = JSON.parse(fs.readFileSync(path.join(EVID, 's73671-armed.json'), 'utf8'));
  const off = JSON.parse(fs.readFileSync(offPath, 'utf8'));
  const fightKey = (f) => [f.day, f.vid, f.seq, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  const kon = JSON.stringify((on.defwound.resolveFights || []).map(fightKey));
  const koff = JSON.stringify((off.defwound.resolveFights || []).map(fightKey));
  const ok = kon === koff && on.days === off.days && on.gameDays === off.gameDays && JSON.stringify(on.ts) === JSON.stringify(off.ts);
  console.log(`TAP-NEUTRALITY seed=73671 fightKeysMatch=${kon === koff} days=${on.days}/${off.days} gameDays=${on.gameDays}/${off.gameDays} tsMatch=${JSON.stringify(on.ts) === JSON.stringify(off.ts)} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

// ---------- tap-neutrality vs defwound (legacy band comparison) ----------
function compareMode() {
  const band = { won: 0, deaths: 0, nationalEver: 0, medianDays: null, raids: null };
  const daysArr = [];
  let mismatch = 0;
  const fightKey = (f) => [f.day, f.vid, f.seq, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  for (const seed of SEEDS) {
    const a = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
    const b = JSON.parse(fs.readFileSync(path.join(DEFWOUND_DIR, `s${seed}-armed.json`), 'utf8'));
    const ka = JSON.stringify((a.defwound.resolveFights || []).map(fightKey));
    const kb = JSON.stringify((b.defwound.resolveFights || []).map(fightKey));
    const same = ka === kb && a.days === b.days && a.gameDays === b.gameDays && JSON.stringify(a.ts) === JSON.stringify(b.ts);
    console.log(`  COMPARE seed=${seed} fightKeysMatch=${ka === kb} days=${a.days}/${b.days} gameDays=${a.gameDays}/${b.gameDays} tsMatch=${JSON.stringify(a.ts) === JSON.stringify(b.ts)} -> ${same ? 'MATCH' : 'MISMATCH'}`);
    if (!same) mismatch++;
    band.won += a.won; band.deaths += a.deathTotal; band.nationalEver += a.nationalEver; daysArr.push(a.days);
  }
  daysArr.sort((x, y) => x - y);
  console.log(`  BAND won=${band.won}/8 deaths=${band.deaths} nationalEver=${band.nationalEver}/8 medianDays=${daysArr[Math.floor(daysArr.length / 2)]} (1815 control: won=4 deaths=234 nationalEver=7 medianDays=135)`);
  const exact = band.won === 4 && band.deaths === 234 && band.nationalEver === 7;
  console.log(`  TAP-NEUTRALITY: ${mismatch === 0 && exact ? 'PASS' : 'FAIL'} (mismatches=${mismatch}, bandExact=${exact})`);
  if (mismatch || !exact) process.exit(1);
}

// ---------- wait replay ----------
// TWO modes, never conflated:
//  --waitreplay (narration-live + emit tap): what the player-visible
//    stream looks like, but PROVEN trajectory-divergent on seed 73671
//    (157d vs measured 177d) — the prior arms' "narration shifts
//    trajectories" warning, confirmed, not assumed. Labeled REPLAY-ONLY.
//  --waitreplay2 (recording-only say, narration OFF): loadGame leaves
//    say/sysSay as noops (the measured condition); only say is
//    replaced by a recorder that writes NOTHING to game state (no
//    emit, no log push, no RNG). Game.log evolves exactly as in the
//    measured runs (feedback() calls still emit, as in measured
//    runs). Trajectory-equivalence vs the measured corpus is the
//    gate: if it matches, these wait-call counts ARE the measured
//    trajectories' wait lines; if it diverges, they are replay-only
//    too and the report says so.
async function waitReplayOne(seed, mode) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.OLDCORE; delete process.env.DEFWOUND;
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { tableseatNowait } = require('./policies/tableseat-nowait');
  const narrationLive = mode === 'live';
  const { Game } = await loadGame({ seed, mode: 'defnarr-waitreplay', fullTelemetry: false, narration: narrationLive });
  const lines = [];
  let emitErrs = 0;
  let origEmit = null;
  if (narrationLive) {
    origEmit = Game.emit.bind(Game);
    Game.emit = function (text, surface) {
      try {
        const day = (((Game.state || {}).scholar || {}).day) || 0;
        lines.push({ day, surface: surface != null ? String(surface) : null, text: String(text).slice(0, 400) });
      } catch (e) { emitErrs++; }
      return origEmit.apply(this, arguments);
    };
  } else {
    // Recording-only say: replaces the harness noop, records, and
    // returns without touching game state.
    Game.say = function (msg) {
      try {
        const day = (((Game.state || {}).scholar || {}).day) || 0;
        lines.push({ day, surface: 'say-call', text: String(msg).slice(0, 400) });
      } catch (e) { emitErrs++; }
    };
  }
  await setupGame(Game);
  const result = await runDays(Game, tableseatNowait, { days: 180, manifest: undefined, sampleEvery: 10 });
  if (narrationLive) Game.emit = origEmit;
  // Dedup simulation: the engine log drops a line identical to the
  // immediately previous LOG line. (The tap records calls; this pass
  // recovers what the player-visible log kept.)
  let lastKept = null, kept = 0, dedupDropped = 0;
  for (const l of lines) {
    if (lastKept !== null && lastKept === l.text) { dedupDropped++; continue; }
    kept++; lastKept = l.text;
  }
  const meas = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
  const equiv = result.days === meas.days && result.gameDays === meas.gameDays
    && result.endReason === meas.endReason && result.samples.deaths.length === meas.deathTotal
    && ((result.stop && result.stop.engineOver && meas.won) || (!meas.won && true));
  // Strict equivalence keys (won is derived: won seeds end via Game.won;
  // use endReason + days + deaths + ts-equivalent headline set instead).
  const wonReplay = !!Game.won;
  const equivStrict = result.days === meas.days && result.gameDays === meas.gameDays
    && result.samples.deaths.length === meas.deathTotal && wonReplay === !!meas.won;
  const row = { seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: wonReplay ? 1 : 0, deaths: result.samples.deaths.length,
    sayCalls: narrationLive ? null : lines.length,
    pacingDriverWait: (result.pacing && result.pacing.byCategoryDriver && result.pacing.byCategoryDriver.wait) || 0,
    pacingPolicyWait: (result.pacing && result.pacing.byCategory && result.pacing.byCategory.wait) || 0,
    tbPlayerWaitPolicy: null, emitLines: lines.length, emitKeptDedup: kept, emitDedupDropped: dedupDropped,
    emitErrs, sayLive: true,
    measured: { days: meas.days, gameDays: meas.gameDays, endReason: meas.endReason, won: meas.won, deaths: meas.deathTotal },
    equivStrict, emitLinesFull: lines };
  // tbPlayerWait counts from pacing: policy+driver tbPlayerWait verbs.
  try {
    const pd = result.pacing && result.pacing.perDay || [];
    let tbw = 0;
    for (const d of pd) for (const k of Object.keys(d.acts || {})) if (k.endsWith(':tbPlayerWait')) tbw += d.acts[k];
    row.tbPlayerWaitCalls = tbw;
  } catch (e) { row.tbPlayerWaitCalls = null; }
  const fn = path.join(WAIT_DIR, narrationLive ? `s${seed}-wait.json` : `s${seed}-wait2.json`);
  row.replayMode = narrationLive ? 'narration-live-emit-tap' : 'recording-only-say';
  writeRetry(fn, JSON.stringify(row, null, 1) + '\n');
  console.log(`  WAITREPLAY[${row.replayMode}] seed=${seed} days=${row.days} gameDays=${row.gameDays} end=${row.endReason} won=${row.won} deaths=${row.deaths} | measured days=${meas.days} gameDays=${meas.gameDays} end=${meas.endReason} won=${meas.won} deaths=${meas.deathTotal} | equivStrict=${equivStrict} emitLines=${lines.length} kept=${kept} dedupDropped=${dedupDropped} driverWaitActs=${row.pacingDriverWait} tbPlayerWaitCalls=${row.tbPlayerWaitCalls} -> ${fn}`);
  if (!equivStrict) { console.error(`WAITREPLAY TRAJECTORY MISMATCH seed=${seed} (replay != measured corpus)`); process.exit(1); }
  return row;
}

function waitCensusMode() {
  const OUT_WAIT = 'You wait. The light changes. Nothing asks anything of you.';
  const IN_WAIT = 'You hold still, watching.';
  const HECK_RE = /^"Oh, you want to TALK about it\?" You answer back — it costs the turn, but the words lose their weight\. \(-\d+ SHAME\)$/;
  let totalLines = 0, totalKept = 0, outCalls = 0, outKept = 0, inCalls = 0, inKept = 0, heckCalls = 0;
  const perSeed = [], outBySeed = {}, inBySeed = {};
  // Dedup must be computed over the full stream in order, per seed.
  for (const seed of SEEDS) {
    const p = path.join(WAIT_DIR, `s${seed}-wait2.json`);
    if (!fs.existsSync(p)) { console.error(`WAIT CENSUS FAIL: missing ${p} (run --waitreplay2-all first)`); process.exit(1); }
    const row = JSON.parse(fs.readFileSync(p, 'utf8'));
    let last = null, oc = 0, ok = 0, ic = 0, ik = 0, hc = 0;
    for (const l of row.emitLinesFull) {
      const isWait = l.text === OUT_WAIT || l.text === IN_WAIT || HECK_RE.test(l.text);
      const keptLine = !(last !== null && last === l.text);
      if (keptLine) last = l.text;
      if (l.text === OUT_WAIT) { oc++; if (keptLine) ok++; }
      if (l.text === IN_WAIT) { ic++; if (keptLine) ik++; }
      if (HECK_RE.test(l.text)) hc++;
    }
    totalLines += row.emitLinesFull.length; totalKept += row.emitKeptDedup;
    outCalls += oc; outKept += ok; inCalls += ic; inKept += ik; heckCalls += hc;
    outBySeed[seed] = oc; inBySeed[seed] = ic;
    perSeed.push({ seed, days: row.days, sayCalls: row.sayCalls != null ? row.sayCalls : row.emitLinesFull.length, emitKeptDedup: row.emitKeptDedup,
      outWaitCalls: oc, outWaitKept: ok, inWaitCalls: ic, inWaitKept: ik, hecklerWaitCalls: hc,
      driverWaitActs: row.pacingDriverWait, tbPlayerWaitCalls: row.tbPlayerWaitCalls, equivStrict: row.equivStrict });
  }
  const waitCalls = outCalls + inCalls + heckCalls;
  const waitKept = outKept + inKept; // heckler lines have varying numbers; dedup rarely applies — counted in calls, noted separately
  const out = { label: 'sim-defnarr-a wait census', seeds: SEEDS, perSeed,
    totalEmitLines: totalLines, totalSayCalls: totalLines, totalEmitKeptDedup: totalKept,
    outWait: { text: OUT_WAIT, calls: outCalls, keptDedup: outKept, shareOfEmitCalls: totalLines ? outCalls / totalLines : null, perSeed: outBySeed },
    inWait: { text: IN_WAIT, calls: inCalls, keptDedup: inKept, perSeed: inBySeed },
    hecklerWait: { calls: heckCalls },
    waitCallsTotal: waitCalls, waitKeptTotal: waitKept,
    waitShareOfEmit: totalLines ? waitCalls / totalLines : null,
    generated: new Date().toISOString() };
  // Labeled comparison: the narration-live replay (73671 only, divergent).
  const livePath = path.join(WAIT_DIR, 's73671-wait.json');
  if (fs.existsSync(livePath)) {
    const lr = JSON.parse(fs.readFileSync(livePath, 'utf8'));
    const lc = {};
    for (const l of lr.emitLinesFull) lc[l.text] = (lc[l.text] || 0) + 1;
    console.log(`  LIVE-REPLAY COMPARISON (REPLAY-ONLY, divergent trajectory): seed=73671 days=${lr.days} vs measured ${lr.measured.days}; emitLines=${lr.emitLinesFull.length}; outWaitCalls=${lc[OUT_WAIT] || 0}; inWaitCalls=${lc[IN_WAIT] || 0}`);
    out.liveReplay73671 = { days: lr.days, measuredDays: lr.measured.days, emitLines: lr.emitLinesFull.length, outWaitCalls: lc[OUT_WAIT] || 0, inWaitCalls: lc[IN_WAIT] || 0, equivStrict: lr.equivStrict };
  }
  const outPath = path.join(WAIT_DIR, 'wait-census.json');
  writeRetry(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log(`WAIT CENSUS sayCalls=${totalLines} keptDedup=${totalKept} (wait2 files: say-call totals, not emit totals)`);
  console.log(`  OUT-WAIT calls=${outCalls} kept=${outKept} shareOfEmit=${totalLines ? (100 * outCalls / totalLines).toFixed(1) + '%' : 'n/a'} perSeed=${JSON.stringify(outBySeed)}`);
  console.log(`  IN-WAIT calls=${inCalls} kept=${inKept} perSeed=${JSON.stringify(inBySeed)} hecklerWaitCalls=${heckCalls}`);
  console.log(`  WAIT TOTAL calls=${waitCalls} (${totalLines ? (100 * waitCalls / totalLines).toFixed(1) : 'n/a'}% of all emit lines) kept=${waitKept}`);
  for (const s of perSeed) console.log(`  SEED ${s.seed} days=${s.days} sayCalls=${s.sayCalls} outWait=${s.outWaitCalls} inWait=${s.inWaitCalls} driverWaitActs=${s.driverWaitActs} tbPlayerWaitCalls=${s.tbPlayerWaitCalls} equiv=${s.equivStrict}`);
  console.log(`  -> ${outPath}`);
}

// ---------- transcripts ----------
function transcriptsMode() {
  // Defender transcript per seed (all defender rows with awayNews).
  for (const seed of SEEDS) {
    const row = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
    const def = (row.defwound.resolveFights || []).filter(f => f.raid);
    const lines = [`SENSE TRANSCRIPT — DEFENDER FIGHTS, sim-defnarr-a (awayNews tap on the measured trajectory)`,
      `seed=${seed} policy=tableseat-nowait+defwound-diag days=${row.days} gameDays=${row.gameDays} endReason=${row.endReason} defenderFights=${def.length}`,
      ''];
    for (const f of def) {
      lines.push(`d${f.day} [raid] ${f.vid} vs ${f.mid} (wave ${f.wave}, seq ${f.seq}) rounds=${f.rounds} startFrac=${f.mHpStartFrac != null ? f.mHpStartFrac.toFixed(2) : 'null'} endFrac=${f.mHpEndFrac != null ? f.mHpEndFrac.toFixed(2) : 'null'} outcome=${f.outcome} manufactured=${!!f.manufactured} preWounded=${!!f.preWounded} rounds0=${!!f.rounds0}`);
      lines.push(`  awayNews: ${f.awayNewsLast || '(dropped — awayNews queue full at fight time)'}`);
    }
    writeRetry(path.join(EVID, `sim-defnarr-a-sense-s${seed}.txt`), lines.join('\n') + '\n');
  }
  // Wait transcript per seed (wait lines only, in order, with day).
  const OUT_WAIT = 'You wait. The light changes. Nothing asks anything of you.';
  const IN_WAIT = 'You hold still, watching.';
  const HECK_RE = /^"Oh, you want to TALK about it\?" You answer back/;
  for (const seed of SEEDS) {
    const row = JSON.parse(fs.readFileSync(path.join(WAIT_DIR, `s${seed}-wait2.json`), 'utf8'));
    const lines = [`SENSE TRANSCRIPT — WAIT LINES ONLY, sim-defnarr-a (recording-only say replay, trajectory-equivalent to the measured corpus: days/gameDays/deaths/won match)`,
      `seed=${seed} days=${row.days} gameDays=${row.gameDays} endReason=${row.endReason} sayCalls=${row.emitLinesFull.length}`,
      ''];
    // Dedup is over the FULL stream (the engine drops a line only when it
    // equals the immediately previous LOG line) — tracking last across
    // wait lines only would falsely mark every wait as deduped.
    let lastFull = null;
    for (const l of row.emitLinesFull) {
      const isWait = l.text === OUT_WAIT || l.text === IN_WAIT || HECK_RE.test(l.text);
      const deduped = isWait && lastFull !== null && lastFull === l.text;
      if (isWait) lines.push(`[d${l.day}] ${deduped ? '(deduped from log) ' : ''}${l.text}`);
      lastFull = l.text;
    }
    writeRetry(path.join(WAIT_DIR, `sim-defnarr-a-wait-s${seed}.txt`), lines.join('\n') + '\n');
  }
  console.log('TRANSCRIPTS written (defender per-seed in EVID, wait per-seed in WAIT_DIR)');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  if (args.includes('--census')) return censusMode();
  if (args.includes('--compare-defwound')) return compareMode();
  const cti = args.indexOf('--compare-tap');
  if (cti >= 0) return compareTapMode(args[cti + 1]);
  if (args.includes('--waitcensus')) return waitCensusMode();
  if (args.includes('--transcripts')) return transcriptsMode();
  if (args.includes('--waitreplay-all')) { for (const s of SEEDS) await waitReplayOne(s, 'live'); return; }
  const wi = args.indexOf('--waitreplay');
  if (wi >= 0) { await waitReplayOne(parseInt(args[wi + 1], 10), 'live'); return; }
  if (args.includes('--waitreplay2-all')) { for (const s of SEEDS) await waitReplayOne(s, 'record'); return; }
  const w2i = args.indexOf('--waitreplay2');
  if (w2i >= 0) { await waitReplayOne(parseInt(args[w2i + 1], 10), 'record'); return; }
  console.log('usage: --selftest|--census|--compare-defwound|--compare-tap <file>|--waitreplay <seed>|--waitreplay-all|--waitreplay2 <seed>|--waitreplay2-all|--waitcensus|--transcripts');
}
if (require.main === module) main().catch(e => { console.error('DEFNARR FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { defenderTemplate };
