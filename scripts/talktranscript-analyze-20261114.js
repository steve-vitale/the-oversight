// talktranscript-analyze-20261114.js — analyzer for the OVE-48
// spoken-drive judged transcript run (arm sim-talktranscript-a, Loop A
// fleshout-20261115T0427Z). A copy of the ove48-mech analyzer with TWO
// changes: (1) the corpus/step names are the talktranscript ones
// (t-talktranscript-base / -subj, perseed-talktranscript-<step>/,
// talktranscript-s<seed>-talktranscript-pilot-fix.json); (2) a
// secondary ex-"promise" drive-naming share is reported alongside the
// primary verbatim-lexicon share (the mech metric review asked for
// the tighter lexicon; the PRIMARY verdict still uses the verbatim
// lexicon — only the capture channel changes, so a GO/NO-GO flip
// here is attributable to the channel, not to a lexicon change).
// The drive lexicon itself is VERBATIM from the mech analyzer
// (asserted by the proof test via deep-equal against
// scripts/ove48-mech-analyze-20261114.js).
//
// LEG KINDS:
//   t-talktranscript-base / -subj — far end / subject,
//     COMPETENT_TALK=1 (held conversations). Validity: V1, V2,
//     V3 dawn reads > 0 subject / = 0 base, V4, V6 >= 20 held
//     sittings (exchanges >= 1) per leg. V5 replication does NOT
//     apply (COMPETENT_TALK changes the policy).
// (b) is judged by compareTalk() over the two talk summaries:
//   GO = >= 25% of held conversations (pooled) contain a
//   drive/commitment-naming NON-OPENER transcript beat for the
//   opener's dawn drive AND mean exchanges higher on dawn-aligned
//   than misaligned opens (pooled). NO-GO if either half misses
//   (incl. 0 naming beats on either leg). INSUFFICIENT if the
//   aligned/misaligned split has < 10 held sittings on a side pooled.
// Usage: STEP=t-talktranscript-base node scripts/talktranscript-analyze-20261114.js
//        STEP=compare-talk node scripts/talktranscript-analyze-20261114.js
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const STEP = process.env.STEP || '';
const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];
const RUN = 'talktranscript-pilot';
const SC = require('./masterregress-analyze-20261113');

// DAWN TABLES — copied VERBATIM from the subject source
// (transplant-15a-narrowed-subject:src/js/convo-wants.js, the OVE-48
// pick's DAWN_KIND_WANTS / DAWN_DRIVE_WANTS). The proof test diffs
// these against `git show transplant-15a-narrowed-subject:...` so a
// drift fails loudly instead of silently redefining alignment.
const DAWN_KIND_WANTS = {
  FORAGE: ['ask_favor', 'share_news'],
  WATER: ['ask_favor', 'share_news'],
  HAUL: ['ask_favor', 'share_news'],
  VISIT: ['just_company', 'seek_comfort', 'curious'],
  HAVEN_CHORE: ['warn_you', 'just_company'],
  TRAPS: ['warn_you', 'share_news'],
  HUNT: ['warn_you', 'share_news'],
  SEEK: ['curious', 'share_news'],
  EXPLORE: ['share_news', 'curious'],
  EXPEDITION: ['share_news', 'warn_you'],
  REST: ['seek_comfort', 'just_company'],
  EAT: ['just_company', 'ask_favor'],
  LEAVE: ['warn_you', 'share_news'],
};
const DAWN_DRIVE_WANTS = {
  food_security: ['ask_favor', 'share_news'],
  bonds: ['seek_comfort', 'just_company'],
  safety: ['warn_you', 'just_company'],
  knowledge: ['curious', 'share_news'],
  party_up: ['curious', 'just_company'],
  build_standing: ['curious', 'share_news'],
  gear_up: ['ask_favor', 'share_news'],
  bank_veterans: ['warn_you', 'share_news'],
};

function preferredWants(kind, drive) {
  const out = {};
  const add = function (list) { if (list) for (const id of list) out[id] = true; };
  if (kind) add(DAWN_KIND_WANTS[kind]);
  if (drive) add(DAWN_DRIVE_WANTS[drive]);
  return out;
}
function isAligned(open) {
  if (!open || !open.want) return null;
  if (!open.dawnKind && !open.dawnDrive) return null;
  const pref = preferredWants(open.dawnKind, open.dawnDrive);
  return !!pref[open.want];
}

// DRIVE LEXICON — pre-registered in sim-ove48-mech-prereg.md.
// Plain-word lists per dawn drive + generic dawn/commitment words.
// A turn line "names the drive" when it matches the opener's drive
// lexicon or the generic list.
const DRIVE_LEXICON = {
  food_security: ['pantry', 'forage', 'hungry', 'hunger', 'food', 'eat', 'starv', 'meal', 'pack', 'thin', 'cook', 'harvest', 'ration'],
  party_up: ['party', 'together', 'join', 'companion', 'beside', 'team', 'find people', 'people', 'hunt together', 'fight beside'],
  safety: ['safe', 'danger', 'warn', 'monster', 'beast', 'alive', 'surviv', 'watch out', 'careful', 'guard', 'protect', 'scar', 'wound'],
  gear_up: ['gear', 'armor', 'weapon', 'tool', 'craft', 'blade', 'bow', 'spear', 'shield', 'leather', 'bark'],
  build_standing: ['standing', 'table', 'village', 'reputation', 'deed', 'tribute', 'seat', 'region', 'link', 'moot'],
  knowledge: ['know', 'learn', 'curious', 'wonder', 'trick', 'secret', 'story', 'beast', 'plant', 'herb', 'lesson', 'teach'],
  bonds: ['friend', 'bond', 'close', 'trust', 'miss', 'grief', 'comfort', 'kin', 'family', 'together', 'love'],
  bank_veterans: ['veteran', 'blooded', 'kill', 'wave', 'fighter', 'scarred', 'elder', 'pack-leader', 'slain'],
};
const GENERIC_LEXICON = ['dawn', 'commit', "what i'm doing", 'what i am doing', 'today i', 'plan', 'plans', 'my job', 'drive', 'promise', 'duty', 'set out'];

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function lexiconRes(words) {
  return words.map(function (w) {
    if (w.indexOf(' ') !== -1) return new RegExp(escapeRe(w), 'i');
    return new RegExp('\\b' + escapeRe(w), 'i');
  });
}
const DRIVE_RES = {};
for (const d of Object.keys(DRIVE_LEXICON)) DRIVE_RES[d] = lexiconRes(DRIVE_LEXICON[d]);
const GENERIC_RES = lexiconRes(GENERIC_LEXICON);
// Secondary only: the mech metric review's tighter lexicon — the
// generic word "promise" matches favor-talk, not drive-talk, and
// endConvo's want-closing beat can speak a promise at the goodbye.
// The PRIMARY verdict uses GENERIC_RES (verbatim); this is reported
// alongside so the coordinator can see both.
const GENERIC_LEXICON_NO_PROMISE = GENERIC_LEXICON.filter(function (w) { return w !== 'promise'; });
const GENERIC_RES_NO_PROMISE = lexiconRes(GENERIC_LEXICON_NO_PROMISE);

function lineNamesDrive(line, drive) {
  const text = (line || '');
  if (!text) return false;
  for (const re of GENERIC_RES) if (re.test(text)) return true;
  const res = drive ? DRIVE_RES[drive] : null;
  if (res) for (const re of res) if (re.test(text)) return true;
  return false;
}
function lineNamesDriveNoPromise(line, drive) {
  const text = (line || '');
  if (!text) return false;
  for (const re of GENERIC_RES_NO_PROMISE) if (re.test(text)) return true;
  const res = drive ? DRIVE_RES[drive] : null;
  if (res) for (const re of res) if (re.test(text)) return true;
  return false;
}
function isOpenerEcho(line, openerLine) {
  if (!line || !openerLine) return false;
  const a = String(line).trim(), b = String(openerLine).trim();
  if (b.length < 20 || a.length < 10) return false;
  const bs = b.slice(0, 60), as = a.slice(0, 60);
  return a.indexOf(bs) !== -1 || b.indexOf(as) !== -1;
}

const DAWN_LINE_RE = /\bdawn\b/i;
const COMMIT_LINE_RE = /\bcommit(ment|ted|ting)?\b/i;

function dirFor(step) { return path.join(REPO, 'evidence', '2026-11-14', 'perseed-talktranscript-' + step); }
function perSeedFile(seed, step) {
  return path.join(dirFor(step), 'talktranscript-s' + seed + '-' + RUN + '-fix.json');
}

function loadCorpus(seeds, step) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, step);
    if (!fs.existsSync(f)) { missing.push(seed); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows.push(d);
  }
  return { rows: rows, missing: missing, complete: missing.length === 0 && rows.length === seeds.length };
}

function aggregateConvo(rows) {
  const agg = {
    opens: 0, classified: 0, selectWantCalls: 0, dawnPriorityReads: 0,
    talkToCalls: 0, endConvoCalls: 0,
    byWant: {}, bySource: {}, byThread: {}, byStageClose: {}, byCloseHow: {},
    byKind: {}, byPickKind: {}, byDrive: {},
    weightedPick: 0, weightedAligned: 0, weightedWithDawn: 0,
    pickDawnPresent: 0, pickDawnKindNonNull: 0, pickDawnAgree: 0, pickDawnDisagree: 0,
    dawnKindNonNull: 0, kindReadAttempted: 0,
    preemptor: { seed: 0, 'repay-preemptor': 0, 'pocketed-preemptor': 0 },
    dawnPresent: 0, openerProduced: 0, openerTotal: 0,
    lines: 0, linesJoined: 0, linesUnjoined: 0, dawnLines: 0, commitLines: 0,
    held: 0, heldExchangesSum: 0, heldExchanges: [],
    heldDriveNaming: 0, heldDriveNamingOpenerIncl: 0,
    heldDriveNamingExPromise: 0, heldDriveNamingQuoted: 0,
    heldAligned: 0, heldAlignedExchSum: 0, heldMisaligned: 0, heldMisalignedExchSum: 0,
    perSeed: [],
  };
  for (const r of rows) {
    const c = r.convo || null;
    const seedAgg = { seed: r.seed, opens: 0, weightedPick: 0, weightedAligned: 0, dawnReads: 0, held: 0, heldNaming: 0 };
    if (!c) { agg.perSeed.push(seedAgg); continue; }
    agg.selectWantCalls += (c.totals && c.totals.selectWantCalls) || 0;
    agg.dawnPriorityReads += (c.totals && c.totals.dawnPriorityReads) || 0;
    agg.talkToCalls += (c.totals && c.totals.talkToCalls) || 0;
    agg.endConvoCalls += (c.totals && c.totals.endConvoCalls) || 0;
    seedAgg.dawnReads = (c.totals && c.totals.dawnPriorityReads) || 0;
    const opens = Array.isArray(c.opens) ? c.opens : [];
    const lines = Array.isArray(c.lines) ? c.lines : [];
    agg.lines += lines.length;
    // Join lines to opens by openIdx; classify drive-naming on turn lines.
    const linesByOpen = {};
    for (const l of lines) {
      const text = (l && l.line) || '';
      if (DAWN_LINE_RE.test(text)) agg.dawnLines++;
      if (COMMIT_LINE_RE.test(text)) agg.commitLines++;
      if (l && typeof l.openIdx === 'number' && l.openIdx >= 0) {
        agg.linesJoined++;
        (linesByOpen[l.openIdx] = linesByOpen[l.openIdx] || []).push(l);
      } else { agg.linesUnjoined++; }
    }
    for (let oi = 0; oi < opens.length; oi++) {
      const o = opens[oi];
      agg.opens++;
      seedAgg.opens++;
      const classified = !!(o.want && o.source && o.dawnSource && o.dawnSource !== 'error');
      if (classified) agg.classified++;
      if (o.want) agg.byWant[o.want] = (agg.byWant[o.want] || 0) + 1;
      if (o.source) agg.bySource[o.source] = (agg.bySource[o.source] || 0) + 1;
      if (o.dawnKind) { agg.dawnKindNonNull++; agg.byKind[o.dawnKind] = (agg.byKind[o.dawnKind] || 0) + 1; }
      if (o.dawnDrive) agg.byDrive[o.dawnDrive] = (agg.byDrive[o.dawnDrive] || 0) + 1;
      if (o.dawnSource && o.dawnSource !== 'error') agg.kindReadAttempted++;
      if (o.source === 'weighted-pick') {
        agg.weightedPick++;
        seedAgg.weightedPick++;
        const al = isAligned(o);
        if (al !== null) {
          agg.weightedWithDawn++;
          if (al) { agg.weightedAligned++; seedAgg.weightedAligned++; }
        }
        if (o.pickDawn) {
          agg.pickDawnPresent++;
          if (o.pickDawn.kind) { agg.pickDawnKindNonNull++; agg.byPickKind[o.pickDawn.kind] = (agg.byPickKind[o.pickDawn.kind] || 0) + 1; }
          const mine = isAligned(o);
          if (mine !== null && mine === !!o.pickDawn.aligned) agg.pickDawnAgree++;
          else if (mine !== null) agg.pickDawnDisagree++;
        }
      } else if (o.source && agg.preemptor[o.source] != null) {
        agg.preemptor[o.source]++;
      }
      if (o.dawnKind || o.dawnDrive) agg.dawnPresent++;
      if (o.openerProduced != null) {
        agg.openerTotal++;
        if (o.openerProduced) agg.openerProduced++;
      }
      if (o.openerThread) agg.byThread[o.openerThread] = (agg.byThread[o.openerThread] || 0) + 1;
      const st = (o.stageAtClose == null) ? 'null' : String(o.stageAtClose);
      agg.byStageClose[st] = (agg.byStageClose[st] || 0) + 1;
      const how = o.closeHow || 'null';
      agg.byCloseHow[how] = (agg.byCloseHow[how] || 0) + 1;
      // Held sittings: exchanges >= 1 at close.
      const exch = (typeof o.exchangesAtClose === 'number') ? o.exchangesAtClose : null;
      if (o.held || (exch != null && exch >= 1)) {
        agg.held++;
        seedAgg.held++;
        const e = exch == null ? 0 : exch;
        agg.heldExchangesSum += e;
        agg.heldExchanges.push(e);
        const olines = linesByOpen[oi] || [];
        let namingTurn = false, namingAny = false, namingTurnExPromise = false, namingTurnQuoted = false;
        for (const l of olines) {
          const text = (l && l.line) || '';
          const echo = isOpenerEcho(text, o.openerLine);
          if (lineNamesDrive(text, o.dawnDrive)) {
            namingAny = true;
            if ((l.seq || 0) >= 1 && !echo) {
              namingTurn = true;
              if (text.indexOf('"') !== -1) namingTurnQuoted = true;
            }
          }
          if (lineNamesDriveNoPromise(text, o.dawnDrive)) {
            if ((l.seq || 0) >= 1 && !echo) namingTurnExPromise = true;
          }
        }
        // Opener line itself naming the drive (secondary, opener-inclusive).
        if (o.openerLine && lineNamesDrive(o.openerLine, o.dawnDrive)) namingAny = true;
        if (namingTurn) { agg.heldDriveNaming++; seedAgg.heldNaming++; }
        if (namingTurnExPromise) agg.heldDriveNamingExPromise++;
        if (namingTurnQuoted) agg.heldDriveNamingQuoted++;
        if (namingAny) agg.heldDriveNamingOpenerIncl++;
        const al = isAligned(o);
        if (al === true) { agg.heldAligned++; agg.heldAlignedExchSum += e; }
        else if (al === false) { agg.heldMisaligned++; agg.heldMisalignedExchSum += e; }
      }
    }
    agg.perSeed.push(seedAgg);
  }
  agg.classifiedShare = agg.opens ? agg.classified / agg.opens : null;
  agg.alignedShare = agg.weightedWithDawn ? agg.weightedAligned / agg.weightedWithDawn : null;
  agg.dawnPresentShare = agg.opens ? agg.dawnPresent / agg.opens : null;
  agg.openerProducedShare = agg.openerTotal ? agg.openerProduced / agg.openerTotal : null;
  agg.pickDawnAgreeRate = agg.pickDawnPresent ? agg.pickDawnAgree / agg.pickDawnPresent : null;
  agg.pickKindShare = agg.pickDawnPresent ? agg.pickDawnKindNonNull / agg.pickDawnPresent : null;
  agg.dawnKindShare = agg.opens ? agg.dawnKindNonNull / agg.opens : null;
  agg.kindReadShare = agg.opens ? agg.kindReadAttempted / agg.opens : null;
  agg.heldNamingShare = agg.held ? agg.heldDriveNaming / agg.held : null;
  agg.heldNamingExPromiseShare = agg.held ? agg.heldDriveNamingExPromise / agg.held : null;
  agg.heldNamingQuotedShare = agg.held ? agg.heldDriveNamingQuoted / agg.held : null;
  agg.heldNamingOpenerInclShare = agg.held ? agg.heldDriveNamingOpenerIncl / agg.held : null;
  agg.meanExchanges = agg.held ? agg.heldExchangesSum / agg.held : null;
  agg.meanExchAligned = agg.heldAligned ? agg.heldAlignedExchSum / agg.heldAligned : null;
  agg.meanExchMisaligned = agg.heldMisaligned ? agg.heldMisalignedExchSum / agg.heldMisaligned : null;
  return agg;
}

function tvd(a, b) {
  const keys = {};
  for (const k of Object.keys(a)) keys[k] = true;
  for (const k of Object.keys(b)) keys[k] = true;
  const ta = Object.values(a).reduce(function (s, v) { return s + v; }, 0) || 1;
  const tb = Object.values(b).reduce(function (s, v) { return s + v; }, 0) || 1;
  let d = 0;
  for (const k of Object.keys(keys)) d += Math.abs((a[k] || 0) / ta - (b[k] || 0) / tb);
  return d / 2;
}

function analyzeStep(step) {
  const corpus = loadCorpus(SEEDS, step);
  if (!corpus.complete) {
    console.error('talktranscript ' + step + ': INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    return { step: step, complete: false, missing: corpus.missing };
  }
  const analysis = SC.analyzeRows(corpus.rows);
  const convo = aggregateConvo(corpus.rows);
  const isTalkBase = step === 't-talktranscript-base';
  const isTalkSubj = step === 't-talktranscript-subj';

  let v = null, verdict = 'DIAG', verdictWhy = '';
  if (isTalkBase || isTalkSubj) {
    v = {
      v1Opens: convo.opens >= 200,
      v2Classified: convo.classifiedShare != null && convo.classifiedShare >= 0.95,
      v3DawnReads: isTalkSubj ? (convo.dawnPriorityReads > 0) : (convo.dawnPriorityReads === 0),
      v4Errors: analysis.instrumentErrors === 0,
      v6Held: convo.held >= 20,
    };
    const validityPass = v.v1Opens && v.v2Classified && v.v3DawnReads && v.v4Errors && v.v6Held;
    if (!validityPass) {
      verdict = 'DIAG';
      verdictWhy = 'validity failed: ' + Object.keys(v).filter(function (k) { return v[k] !== true; }).join(', ');
    } else {
      verdict = 'VALID-INSTRUMENT';
      verdictWhy = 'validity V1–V4+V6 pass on this leg; held ' + convo.held + ', drive-naming (non-opener transcript beats) ' + (convo.heldNamingShare == null ? 'null' : (convo.heldNamingShare * 100).toFixed(1) + '%') + ' (ex-promise ' + (convo.heldNamingExPromiseShare == null ? 'null' : (convo.heldNamingExPromiseShare * 100).toFixed(1) + '%') + ', quoted-only ' + (convo.heldNamingQuotedShare == null ? 'null' : (convo.heldNamingQuotedShare * 100).toFixed(1) + '%') + '), mean exchanges aligned ' + (convo.meanExchAligned == null ? 'null' : convo.meanExchAligned.toFixed(2)) + ' vs misaligned ' + (convo.meanExchMisaligned == null ? 'null' : convo.meanExchMisaligned.toFixed(2));
    }
  } else {
    console.error('talktranscript: unknown STEP ' + step);
    return { step: step, complete: false, missing: [] };
  }
  const validityPass = (v.v1Opens && v.v2Classified && v.v4Errors && v.v3DawnReads && v.v6Held);
  const summary = {
    step: step, seeds: SEEDS, run: RUN,
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    rankVerdict: SC.classifyRegional ? SC.classifyRegional(analysis.wall.regional) : null,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
    validity: v,
    validityPass: validityPass,
    verdict: verdict,
    verdictWhy: verdictWhy,
    convo: convo,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-' + step + '-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('talktranscript ' + step + ': ' + verdict + ' (survived ' + analysis.survived + '/8)');
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  console.log('  convo: opens ' + convo.opens + ', classified ' + (convo.classifiedShare == null ? 'null' : (convo.classifiedShare * 100).toFixed(1) + '%') + ', dawnReads ' + convo.dawnPriorityReads + ', weighted-pick ' + convo.weightedPick + ', aligned ' + (convo.alignedShare == null ? 'null' : (convo.alignedShare * 100).toFixed(1) + '%') + ' (n=' + convo.weightedWithDawn + ')');
  console.log('  convo: wantDist ' + JSON.stringify(convo.byWant) + ' sourceDist ' + JSON.stringify(convo.bySource));
  console.log('  convo: dawnPresent ' + (convo.dawnPresentShare == null ? 'null' : (convo.dawnPresentShare * 100).toFixed(1) + '%') + ', openerProduced ' + (convo.openerProducedShare == null ? 'null' : (convo.openerProducedShare * 100).toFixed(1) + '%') + ', stageClose ' + JSON.stringify(convo.byStageClose));
  console.log('  convo: lines ' + convo.lines + ' joined ' + convo.linesJoined + ' unjoined ' + convo.linesUnjoined + ' (dawn ' + convo.dawnLines + ', commitment ' + convo.commitLines + '), pickDawn agree ' + (convo.pickDawnAgreeRate == null ? 'null' : (convo.pickDawnAgreeRate * 100).toFixed(1) + '%') + ' (n=' + convo.pickDawnPresent + ')');
  console.log('  kind: pickDawn.kind non-null ' + (convo.pickKindShare == null ? 'null' : (convo.pickKindShare * 100).toFixed(1) + '%') + ' (n=' + convo.pickDawnPresent + '), dawnKind non-null ' + (convo.dawnKindShare == null ? 'null' : (convo.dawnKindShare * 100).toFixed(1) + '%') + ', byPickKind ' + JSON.stringify(convo.byPickKind));
  console.log('  held: ' + convo.held + ' sittings, mean exchanges ' + (convo.meanExchanges == null ? 'null' : convo.meanExchanges.toFixed(2)) + ', drive-naming non-opener transcript beats ' + (convo.heldNamingShare == null ? 'null' : (convo.heldNamingShare * 100).toFixed(1) + '%') + ' (ex-promise ' + (convo.heldNamingExPromiseShare == null ? 'null' : (convo.heldNamingExPromiseShare * 100).toFixed(1) + '%') + ', quoted-only ' + (convo.heldNamingQuotedShare == null ? 'null' : (convo.heldNamingQuotedShare * 100).toFixed(1) + '%') + '), opener-incl ' + (convo.heldNamingOpenerInclShare == null ? 'null' : (convo.heldNamingOpenerInclShare * 100).toFixed(1) + '%') + ', aligned ' + convo.heldAligned + ' @' + (convo.meanExchAligned == null ? 'null' : convo.meanExchAligned.toFixed(2)) + ' vs misaligned ' + convo.heldMisaligned + ' @' + (convo.meanExchMisaligned == null ? 'null' : convo.meanExchMisaligned.toFixed(2)));
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' deaths ' + r.deaths + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  return { step: step, complete: true, survived: analysis.survived, validityPass: validityPass, verdict: verdict, instrumentErrors: analysis.instrumentErrors, summary: summary };
}

// compareTalk(baseSummary, subjSummary): the (b) cross-leg deciding
// comparison over the two COMPETENT_TALK=1 legs, pooled.
function compareTalk(baseSummaryPath, subjSummaryPath) {
  const base = JSON.parse(fs.readFileSync(baseSummaryPath, 'utf8'));
  const subj = JSON.parse(fs.readFileSync(subjSummaryPath, 'utf8'));
  const b = base.convo, s = subj.convo;
  const validityBoth = !!(base.validityPass && subj.validityPass);
  const heldPooled = b.held + s.held;
  const namingPooled = b.heldDriveNaming + s.heldDriveNaming;
  const namingShare = heldPooled ? namingPooled / heldPooled : null;
  const namingExPromisePooled = b.heldDriveNamingExPromise + s.heldDriveNamingExPromise;
  const namingExPromiseShare = heldPooled ? namingExPromisePooled / heldPooled : null;
  const namingQuotedPooled = b.heldDriveNamingQuoted + s.heldDriveNamingQuoted;
  const namingQuotedShare = heldPooled ? namingQuotedPooled / heldPooled : null;
  const namingAny = b.heldDriveNamingOpenerIncl + s.heldDriveNamingOpenerIncl;
  const alN = b.heldAligned + s.heldAligned;
  const misN = b.heldMisaligned + s.heldMisaligned;
  const alSum = b.heldAlignedExchSum + s.heldAlignedExchSum;
  const misSum = b.heldMisalignedExchSum + s.heldMisalignedExchSum;
  const meanAl = alN ? alSum / alN : null;
  const meanMis = misN ? misSum / misN : null;
  let verdict = 'DIAG', why = '';
  if (!validityBoth) {
    verdict = 'DIAG';
    why = 'validity failed on a leg (base ' + base.verdict + ', subj ' + subj.verdict + ')';
  } else if (namingShare == null) {
    verdict = 'DIAG';
    why = 'no held sittings pooled';
  } else if (alN < 10 || misN < 10) {
    verdict = 'INSUFFICIENT';
    why = 'aligned/misaligned split too thin to judge the length half (aligned ' + alN + ', misaligned ' + misN + ' held sittings pooled; need >= 10/side). Naming share ' + (namingShare * 100).toFixed(1) + '% (n=' + heldPooled + ').';
  } else if (namingShare >= 0.25 && meanAl != null && meanMis != null && meanAl > meanMis) {
    verdict = 'GO';
    why = '(b) held conversations name the drive on the spoken transcript: ' + (namingShare * 100).toFixed(1) + '% of ' + heldPooled + ' held sittings (bar 25%; ex-promise ' + (namingExPromiseShare * 100).toFixed(1) + '%); mean exchanges aligned ' + meanAl.toFixed(2) + ' (n=' + alN + ') > misaligned ' + meanMis.toFixed(2) + ' (n=' + misN + ')';
  } else {
    verdict = 'NO-GO';
    why = '(b) naming share ' + (namingShare * 100).toFixed(1) + '% (bar 25%, n=' + heldPooled + '; ex-promise ' + (namingExPromiseShare == null ? 'null' : (namingExPromiseShare * 100).toFixed(1) + '%') + '); mean exchanges aligned ' + (meanAl == null ? 'null' : meanAl.toFixed(2)) + ' (n=' + alN + ') vs misaligned ' + (meanMis == null ? 'null' : meanMis.toFixed(2)) + ' (n=' + misN + ')';
    if (namingPooled === 0) why += ' — ZERO lines name the drive on either leg.';
  }
  const out = {
    baseStep: base.step, subjStep: subj.step,
    validityBoth: validityBoth,
    heldPooled: heldPooled, namingPooled: namingPooled, namingShare: namingShare,
    namingExPromisePooled: namingExPromisePooled, namingExPromiseShare: namingExPromiseShare,
    namingQuotedPooled: namingQuotedPooled, namingQuotedShare: namingQuotedShare,
    namingOpenerInclPooled: namingAny,
    base: { held: b.held, naming: b.heldDriveNaming, namingShare: b.heldNamingShare, namingExPromise: b.heldDriveNamingExPromise, namingExPromiseShare: b.heldNamingExPromiseShare, namingQuoted: b.heldDriveNamingQuoted, namingQuotedShare: b.heldNamingQuotedShare, namingOpenerInclShare: b.heldNamingOpenerInclShare, aligned: b.heldAligned, meanExchAligned: b.meanExchAligned, misaligned: b.heldMisaligned, meanExchMisaligned: b.meanExchMisaligned },
    subj: { held: s.held, naming: s.heldDriveNaming, namingShare: s.heldNamingShare, namingExPromise: s.heldDriveNamingExPromise, namingExPromiseShare: s.heldNamingExPromiseShare, namingQuoted: s.heldDriveNamingQuoted, namingQuotedShare: s.heldNamingQuotedShare, namingOpenerInclShare: s.heldNamingOpenerInclShare, aligned: s.heldAligned, meanExchAligned: s.meanExchAligned, misaligned: s.heldMisaligned, meanExchMisaligned: s.meanExchMisaligned },
    pooled: { alignedN: alN, meanExchAligned: meanAl, misalignedN: misN, meanExchMisaligned: meanMis },
    wantTvd: tvd(b.byWant, s.byWant),
    verdict: verdict, verdictWhy: why,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-talk-comparison.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('talktranscript TALK COMPARISON: ' + verdict + ' — ' + why);
  console.log('  want TVD: ' + out.wantTvd.toFixed(3));
  console.log('  comparison: ' + path.relative(REPO, outFile));
  return out;
}

function main() {
  if (!STEP) { console.error('talktranscript: STEP required.'); process.exit(2); }
  if (STEP === 'compare-talk') {
    const baseP = path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-t-talktranscript-base-summary.json');
    const subjP = path.join(REPO, 'evidence', '2026-11-14', 'talktranscript-t-talktranscript-subj-summary.json');
    if (!fs.existsSync(baseP) || !fs.existsSync(subjP)) { console.error('talktranscript compare-talk: both talk leg summaries required.'); process.exit(2); }
    const res = compareTalk(baseP, subjP);
    process.exit(res.verdict === 'DIAG' || res.verdict === 'INSUFFICIENT' ? 1 : 0);
  }
  const res = analyzeStep(STEP);
  if (!res.complete) process.exit(1);
  if (!res.validityPass || res.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN,
  DAWN_KIND_WANTS: DAWN_KIND_WANTS, DAWN_DRIVE_WANTS: DAWN_DRIVE_WANTS,
  DRIVE_LEXICON: DRIVE_LEXICON, GENERIC_LEXICON: GENERIC_LEXICON,
  GENERIC_LEXICON_NO_PROMISE: GENERIC_LEXICON_NO_PROMISE,
  lineNamesDriveNoPromise: lineNamesDriveNoPromise,
  preferredWants: preferredWants, isAligned: isAligned,
  lineNamesDrive: lineNamesDrive, isOpenerEcho: isOpenerEcho,
  dirFor: dirFor, perSeedFile: perSeedFile, loadCorpus: loadCorpus,
  aggregateConvo: aggregateConvo, analyzeStep: analyzeStep,
  compareTalk: compareTalk, tvd: tvd,
};
