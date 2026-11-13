// journey-social-r189-helpers.js -- pure helpers shared by the r189 social
// driver and analyzer (Lane B, 2026-11-12). r189 = r181 helpers verbatim
// EXCEPT: tallyRecapEmpty is new (M11, recap-empty tally — how many M4
// near-dup flags carry the empty-thread recap core "We were just talking.
// Nothing important.", a ONE-line pool on r181: 19 of 126 flags).
// EXCEPT: tallyConfessions is new (B1, double-confession tally —
// sittings with >=2 'confessed' confrontation outcomes). tallyReoffers
// carries the furniture filter (C2) and tallyNarrDup the NARR near-dup
// scan (C3) from r167. No src/js changes, no Game calls.
//   aggregateNightlyNews(dayLines): per-day haven-news census from
//     emit-time classified lines. Each line: { kind, atHaven, atHavenGate }.
//     atHaven = scholarAtHaven() (on-tile, strict); atHavenGate =
//     playerAtHaven() (radius-1, the sim-awaynaming gate's definition).
//     Plain counts = delivered at Haven; *Away = strict-away (defect
//     under the old M6); *AwayGate = gate-away (defect under the re-aligned
//     M6 — a line emitted while the scholar is beyond radius-1 of Haven).
//   summarizeBondProposed(records): panel/seed rollup of bond_proposed
//     live-capture records { initiatorKind: 'scholar'|'villager', kind:
//     'person'|'link', outcome, initiator }. Reports counts by
//     initiatorKind, kind, outcome, per-initiator totals (amendment-5
//     cap: per-initiator <=8/90d), and link raises separately.
//   tallyOffered(transcripts): offered choice-id tally across transcripts
//     (goal-thread react surfacing: 'more' vs agree/joke/silence vs
//     follow:goal:0) + longest run of consecutive 'more' offers.
//   summarizeCounters(proposeCalls, counterSettles, counterAnswers,
//     pendingCounterEnd): r154 job B rollup — fresh vs blocked proposeLink
//     calls (pendingBefore), settles and links formed, answers by how.
//   tallyRecap(transcripts): r154 job C rollup — recap presses per
//     conversation, cap failures (6+ presses in one conversation) and
//     'recap' offered after the 5th press (spend-out not firing).
// Proof: scripts/test-journey-social-r154.js (fixture-driven, RED->GREEN).
'use strict';

function aggregateNightlyNews(dayLines) {
  const out = {
    burst: 0, settle: 0, witness: 0, tale: 0,
    burstAway: 0, settleAway: 0, witnessAway: 0, taleAway: 0,
    burstAwayGate: 0, settleAwayGate: 0, witnessAwayGate: 0, taleAwayGate: 0,
  };
  for (const l of dayLines || []) {
    if (!l || !l.kind) continue;
    const k = l.kind;
    if (k !== 'burst' && k !== 'settle' && k !== 'witness' && k !== 'tale') continue;
    out[k]++;
    // Strict (on-tile) classification: missing flag reads as at-Haven
    // (r141/r145 JSONs predate the gate flag — they must not inflate Away).
    if (l.atHaven === false) out[k + 'Away']++;
    // Gate (radius-1) classification: missing flag ALSO reads as at-Haven,
    // so old rows contribute 0 gate-away by construction.
    if (l.atHavenGate === false) out[k + 'AwayGate']++;
  }
  return out;
}

function summarizeBondProposed(records) {
  const recs = (records || []).filter(r => r && typeof r === 'object');
  const by = (key) => {
    const o = {};
    for (const r of recs) { const k = key(r); o[k] = (o[k] || 0) + 1; }
    return o;
  };
  const perInitiator = {};
  for (const r of recs) {
    const k = (r.initiatorKind || '?') + ':' + (r.initiator || '?');
    perInitiator[k] = (perInitiator[k] || 0) + 1;
  }
  const person = recs.filter(r => r.kind === 'person');
  const link = recs.filter(r => r.kind === 'link');
  // r154 (D): person-kind per-initiator counts, separate from the mixed
  // max — the amendment-5 cap (≤8/90d) covers PERSON bonds only; link
  // raises run under their own 14-day per-pair cooldown.
  const personPerInitiator = {};
  for (const r of person) {
    const k = (r.initiatorKind || '?') + ':' + (r.initiator || '?');
    personPerInitiator[k] = (personPerInitiator[k] || 0) + 1;
  }
  return {
    total: recs.length,
    byInitiatorKind: by(r => r.initiatorKind || '?'),
    byKind: by(r => r.kind || '?'),
    byOutcome: by(r => r.outcome || '?'),
    byKindOutcome: by(r => (r.kind || '?') + ':' + (r.outcome || '?')),
    villagerPerson: person.filter(r => r.initiatorKind === 'villager').length,
    villagerPersonAccepted: person.filter(r => r.initiatorKind === 'villager' && r.outcome === 'accepted').length,
    scholarPerson: person.filter(r => r.initiatorKind === 'scholar').length,
    linkRaises: link.length,
    linkAccepted: link.filter(r => r.outcome === 'accepted').length,
    perInitiator,
    maxPerInitiator: Math.max(0, ...Object.values(perInitiator)),
    personPerInitiator,
    maxPerInitiatorPerson: Math.max(0, ...Object.values(personPerInitiator)),
  };
}

function tallyOffered(transcripts) {
  const counts = {};
  let moreOffers = 0, reactOffers = 0, goalFollowOffers = 0;
  for (const t of transcripts || []) {
    const offered = (t && t.offered) || [];
    for (const turn of offered) {
      for (const id of (Array.isArray(turn) ? turn : [])) {
        counts[id] = (counts[id] || 0) + 1;
        if (id === 'more') moreOffers++;
        if (id === 'agree' || id === 'joke' || id === 'silence') reactOffers++;
        if (id === 'follow:goal:0') goalFollowOffers++;
      }
    }
  }
  // Longest run of consecutive player continuer presses ('more' picks) in
  // any transcript: the YOU lines that are continuer labels (convoMoreLabel
  // pools + dlg:more variants). The follow-up label ('Tell me more about
  // what you want to do.') is NOT a continuer — it ends the run.
  const CONTINUER = /tell me more\.?["”]?$|^["“]go on|take your time|and then\?|what happened next|then what|i'?m listening|don'?t stop there|what were you going to say/i;
  let longestMoreRun = 0;
  for (const t of transcripts || []) {
    let run = 0;
    for (const e of (t.transcript || [])) {
      if (e.who !== 'YOU') continue;
      if (CONTINUER.test(String(e.text || ''))) { run++; if (run > longestMoreRun) longestMoreRun = run; }
      else run = 0;
    }
  }
  return { counts, moreOffers, reactOffers, goalFollowOffers, longestMoreRun };
}


// r159 (B) NARR-LINE MAPPING: the engine's transcript entries carry
// who:'you' | <villager id> | 'narr' (truth.js codex-gated coaching beats,
// { who: 'narr', text: '*...*' }). The r154 driver flattened every
// non-'you' entry to 'NPC', so coaching printed as NPC speech. This mapper
// preserves the narrator voice distinctly; anything else stays 'NPC'.
// It maps ONLY what the driver records, never convo logic.
function mapTranscriptEntry(e) {
  const who = (e && e.who) || '';
  return { who: who === 'you' ? 'YOU' : (who === 'narr' ? 'NARR' : 'NPC'), text: String((e && e.text) || '').slice(0, 400) };
}

// r159 (C1) RE-OFFER TALLY: per conversation, any choice id offered on 2+
// turns (from t.offered). The r154 wart was the doubt probe re-offering
// after a deflection; this tally shows whether that shape persists and
// which ids re-offer. Returns per-transcript rows + panel max.
// r181 (C2) FURNITURE FILTER: `leave`/`bye`/`goodbye`/`silence` are
// structural — offered on (nearly) every turn — so the raw panelMax is
// dominated by menu furniture (r159: 238/246 conversations with a
// re-offer, panelMax 12). panelMaxFurnitureFree excludes them; the raw
// perId is kept for audit.
const FURNITURE_IDS = new Set(['leave', 'bye', 'goodbye', 'silence']);
function tallyReoffers(transcripts) {
  const rows = [];
  let panelMax = 0, panelMaxFurnitureFree = 0;
  const idTotals = {};
  for (const t of transcripts || []) {
    const offered = (t && t.offered) || [];
    const perId = {};
    for (const turn of offered) {
      const seen = new Set();
      for (const id of (Array.isArray(turn) ? turn : [])) {
        const k = String(id || '');
        if (!k || seen.has(k)) continue;
        seen.add(k);
        perId[k] = (perId[k] || 0) + 1;
      }
    }
    let max = 0, maxId = null, maxFF = 0, maxFFId = null;
    for (const [k, n] of Object.entries(perId)) {
      idTotals[k] = (idTotals[k] || 0) + n;
      if (n > max) { max = n; maxId = k; }
      if (!FURNITURE_IDS.has(k) && n > maxFF) { maxFF = n; maxFFId = k; }
    }
    if (max >= 2) rows.push({ tag: (t && t.tag) || '?', vid: (t && t.vid) || '?', maxReoffer: max, id: maxId, maxReofferFurnitureFree: maxFF, idFurnitureFree: maxFFId, perId });
    if (max > panelMax) panelMax = max;
    if (maxFF > panelMaxFurnitureFree) panelMaxFurnitureFree = maxFF;
  }
  return { rows, panelMax, panelMaxFurnitureFree, nConversations: (transcripts || []).length, idTotals };
}

// r159 (C2) DROPPED-THREAD TALLY: transcripts containing a
// "lost my train of thought" line — the r154 watch item (Theo's photo
// secret offered then dropped with no resume in the sitting). For each
// drop, the NEXT sitting with the same vid in the same seed (array order
// = play order) is listed with its opening lines, so a human read can
// judge whether the thread/secret resurfaced or stayed dropped. A drop
// after a SECRET OFFER is the shape to watch; a drop replacing a promise
// would be a canon violation (docs/CONVERSATIONS.md).
function tallyDroppedThreads(transcripts) {
  const DROP = /lost my train of thought/i;
  const rows = [];
  const list = transcripts || [];
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    const lines = (t && t.transcript) || [];
    const dropIdx = lines.findIndex(e => DROP.test(String((e && e.text) || '')));
    if (dropIdx === -1) continue;
    let next = null;
    for (let j = i + 1; j < list.length; j++) {
      if (String((list[j] && list[j].vid) || '') === String((t && t.vid) || '')) { next = list[j]; break; }
    }
    rows.push({
      tag: (t && t.tag) || '?', vid: (t && t.vid) || '?',
      dropLine: String((lines[dropIdx] && lines[dropIdx].text) || '').slice(0, 200),
      context: lines.slice(Math.max(0, dropIdx - 2), dropIdx + 1).map(e => ((e && e.who) || '?') + ': ' + String((e && e.text) || '').slice(0, 160)),
      nextSitting: next ? { tag: next.tag || '?', turns: next.turns || 0, opening: (next.transcript || []).slice(0, 3).map(e => ((e && e.who) || '?') + ': ' + String((e && e.text) || '').slice(0, 160)) } : null,
    });
  }
  return { rows, nDrops: rows.length, nConversations: list.length };
}

// r181 (C3) NARR NEAR-DUP SCAN: the r159 metric review asked whether
// the M7 near-dup scan should include NARR lines — the coach line
// repeated verbatim 7× panel-wide (3× in one sitting) and M7 as
// instrumented (NPC lines only) could not see it. This scan runs the
// SAME rules as the analyzer's NPC pass (strip repeat prefixes, skip
// identical cores, flag same-opening or Jaccard >= 0.5) over NARR lines
// only, PLUS a verbatim check: the same NARR text 2+ times in ONE
// transcript is the M10 instrument (the job-B pool fix failing in the
// wild). Reported separately from M7's NPC verdict.
// r181 (M10 split): the r179 metric review — tallyNarrDup counted ALL
// NARR verbatim repeats as one number, so M10 (coach variation) failed
// on face-beat repeats that are not coach lines. Split by emission
// shape: the engine wraps coach lines in asterisks (`*${coach}*`) and
// emits face lines bare (src/js/truth.js confrontWindup). Verified on
// the r179 4-seed corpus: 15/15 asterisk-wrapped NARR lines are
// coach-pool members, 52/52 bare NARR lines are accuseFace-pool
// members, 0 unclassified. M10 judges coach only; the face count is
// the r179 face-guard re-confirmation, reported separately.
function tallyNarrDup(transcripts) {
  const STRIP = /^(as i said|like i said|still the same thing|i'?ve told you three times now|we'?re going in circles a bit|short version|quick version|the way i read it)\s*[—\-–]\s*/i;
  const stripRepeatPrefix = (t) => {
    let s = String(t || '').replace(/^["“]/, '').replace(/["”]$/, '');
    let prev = '';
    while (prev !== s) { prev = s; s = s.replace(STRIP, ''); }
    return s;
  };
  const normWords = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); let inter = 0; for (const w of A) if (B.has(w)) inter++; return inter / (A.size + B.size - inter || 1); };
  const rows = [];
  let panelMaxSameNarr = 0, nVerbatimRepeats = 0, nVerbatimRepeatsCoach = 0, nVerbatimRepeatsFace = 0;
  // Coach lines are asterisk-wrapped by the engine; face lines are bare.
  const isCoachLine = (line) => /^\*.*\*$/.test(String(line || '').trim());
  for (const t of transcripts || []) {
    const narr = ((t && t.transcript) || []).filter(e => e.who === 'NARR').map(e => String((e && e.text) || ''));
    // verbatim check on the RAW text (the coach line repeats byte-identical).
    const counts = {};
    for (const line of narr) counts[line] = (counts[line] || 0) + 1;
    for (const [line, n] of Object.entries(counts)) {
      if (n > panelMaxSameNarr) panelMaxSameNarr = n;
      if (n >= 2) {
        nVerbatimRepeats++;
        const cls = isCoachLine(line) ? 'coach' : 'face';
        if (cls === 'coach') nVerbatimRepeatsCoach++; else nVerbatimRepeatsFace++;
        rows.push({ tag: (t && t.tag) || '?', vid: (t && t.vid) || '?', kind: 'verbatim-repeat', cls, count: n, text: line.slice(0, 200) });
      }
    }
    // near-dup check on distinct stripped cores.
    const cores = [...new Set(narr.map(stripRepeatPrefix))];
    for (let i = 0; i < cores.length; i++) for (let j = i + 1; j < cores.length; j++) {
      const wa = normWords(cores[i]), wb = normWords(cores[j]);
      if (wa.length <= 3 || wb.length <= 3) continue;
      if (wa.slice(0, 3).join(' ') === wb.slice(0, 3).join(' ')) rows.push({ tag: (t && t.tag) || '?', vid: (t && t.vid) || '?', kind: 'same-opening', a: cores[i], b: cores[j] });
      else if (jaccard(wa, wb) >= 0.5) rows.push({ tag: (t && t.tag) || '?', vid: (t && t.vid) || '?', kind: 'jaccard>=0.5', a: cores[i], b: cores[j] });
    }
  }
  return { rows, panelMaxSameNarr, nVerbatimRepeats, nVerbatimRepeatsCoach, nVerbatimRepeatsFace, nNearDupFlags: rows.filter(r => r.kind !== 'verbatim-repeat').length, nConversations: (transcripts || []).length };
}

// r181 (M1-VENDETTA) VENDETTA-CADENCE TALLY: group armPlot events by
// ordered pair (leader -> target) and by unordered pair (both directions).
// The r180 panel showed Hayden<->Emma arming 6 plots in 16 days (d7-d22),
// each spring re-arming the next within 2-5 days — the grievance loop has
// no dampener. The r180 metric review made this a watch item: if a future
// panel shows the same pair re-arming past 8-10 plots, the loop's
// cooling-off deserves a design look, not a knob. This tally is the
// instrument for that watch: maxUnordered is the judged number (both
// directions count — a feud is two-sided), maxDirected the one-sided
// shape. pairsGte4 lists every unordered pair at >=4 arms with its day
// span, so a future reader can see the cadence, not just the count.
function tallyVendetta(armEvents) {
  const evs = (armEvents || []).filter(e => e && typeof e === 'object');
  const directed = {}, unordered = {};
  for (const e of evs) {
    const l = String(e.leader || '?'), t = String(e.target || '?');
    const dk = l + '->' + t;
    directed[dk] = (directed[dk] || 0) + 1;
    const uk = [l, t].sort().join('<->');
    unordered[uk] = (unordered[uk] || 0) + 1;
  }
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pair, n]) => ({ pair, n }));
  const pairsGte4 = [];
  for (const [pair, n] of Object.entries(unordered)) {
    if (n < 4) continue;
    const [a, b] = pair.split('<->');
    const days = evs.filter(e => (String(e.leader) === a && String(e.target) === b) || (String(e.leader) === b && String(e.target) === a)).map(e => e.day).filter(d => d != null).sort((x, y) => x - y);
    pairsGte4.push({ pair, n, firstDay: days[0] == null ? null : days[0], lastDay: days.length ? days[days.length - 1] : null, spanDays: days.length > 1 ? days[days.length - 1] - days[0] : 0 });
  }
  pairsGte4.sort((a, b) => b.n - a.n);
  const maxDirected = Math.max(0, ...Object.values(directed));
  const maxUnordered = Math.max(0, ...Object.values(unordered));
  return { total: evs.length, directed, unordered, maxDirected, maxUnordered, topDirected: top(directed), topUnordered: top(unordered), pairsGte4 };
}

module.exports = { aggregateNightlyNews, summarizeBondProposed, tallyOffered, summarizeCounters, tallyRecap, mapTranscriptEntry, tallyReoffers, tallyDroppedThreads, tallyNarrDup, tallyConfessions, tallyVendetta, tallyRecapEmpty };

// r189 (M11) RECAP-EMPTY TALLY: count M4 near-dup flags carrying the
// empty-thread recap core "We were just talking. Nothing important."
// (convoRecapLine, empty thread log). The r181 panel showed 19 of 126
// flags carry this ONE line: pressing recap twice in one sitting re-serves
// the same core with a reframe prefix ("As I said — ..."), and the M4 scan
// flags the pair. Either side matching counts the flag once (a flag is one
// printed line). Cores arrive prefix-stripped by the analyzer; normalize
// (lowercase, punctuation-insensitive) and match the core's start, so the
// clearer-exit suffix ("... Ask me something else if you want.") still
// counts. A near-miss ("We were just talking about the harvest.") does not.
function tallyRecapEmpty(flags) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const isRecapEmpty = (core) => norm(core).indexOf('we were just talking nothing important') === 0;
  let count = 0;
  for (const f of (flags || [])) {
    if (f && (isRecapEmpty(f.a) || isRecapEmpty(f.b))) count++;
  }
  return count;
}

// r181 (B1) DOUBLE-CONFESSION TALLY: group 'confessed' confrontation
// outcomes by sitting (the driver's sitting stamp; null = fired outside
// a driven conversation). A sitting with >=2 confessed outcomes is a
// double confession — the pattern the one-secret-per-sitting guard
// would change. Counts are by outcome, never by text: two confessions
// of the SAME lie in one sitting cannot happen (the stale-doubt guard
// returns 'already-confessed'), so >=2 confessed in one sitting means
// two DIFFERENT secrets were confessed in that sitting.
function tallyConfessions(events) {
  const evs = (events || []).filter(e => e && typeof e === 'object');
  const byOutcome = {};
  for (const e of evs) { const k = String(e.outcome || '?'); byOutcome[k] = (byOutcome[k] || 0) + 1; }
  const confessed = evs.filter(e => e.outcome === 'confessed');
  const bySitting = {};
  for (const e of confessed) {
    const k = (e.sitting == null ? 'outside' : 's' + e.sitting);
    (bySitting[k] = bySitting[k] || []).push(e);
  }
  const doubles = Object.entries(bySitting)
    .filter(([k, v]) => k !== 'outside' && v.length >= 2)
    .map(([k, v]) => ({ sitting: k, count: v.length, day: v[0].day, vid: v[0].vid, tag: v[0].tag || null, methods: v.map(x => x.method) }));
  const singleSittings = Object.keys(bySitting).filter(k => k !== 'outside' && bySitting[k].length === 1).length;
  return {
    total: evs.length,
    confessed: confessed.length,
    byOutcome,
    sittingsWithConfession: Object.keys(bySitting).length,
    singleSittings,
    doubleSittings: doubles.length,
    doubles,
    outsideSittingConfessed: (bySitting.outside || []).length,
  };
}

function summarizeCounters(proposeCalls, counterSettles, counterAnswers, pendingCounterEnd) {
  const calls = (proposeCalls || []).filter(c => c && typeof c === 'object');
  const links = calls.filter(c => (c.method || 'proposeLink') === 'proposeLink');
  const isCounter = (c) => String(c.result || '') === '"counter"';
  const fresh = links.filter(c => c.pendingBefore === false);
  const blocked = links.filter(c => c.pendingBefore === true);
  const unknown = links.filter(c => c.pendingBefore !== false && c.pendingBefore !== true);
  const settles = (counterSettles || []).filter(s => s && typeof s === 'object');
  const answers = (counterAnswers || []).filter(a => a && typeof a === 'object');
  const byHow = {};
  for (const a of answers) { const k = a.how || '?'; byHow[k] = (byHow[k] || 0) + 1; }
  return {
    proposeLinkCalls: links.length,
    proposeLinkCounter: links.filter(isCounter).length,
    freshCalls: fresh.length,
    freshCounter: fresh.filter(isCounter).length,
    blockedCalls: blocked.length,
    blockedCounter: blocked.filter(isCounter).length,
    unknownPendingCalls: unknown.length,
    settles: settles.length,
    settlesLinkFormed: settles.filter(s => s.linkFormed === true).length,
    settlesLinkFailed: settles.filter(s => s.linkFormed === false).length,
    settlesUnknown: settles.filter(s => s.linkFormed !== true && s.linkFormed !== false).length,
    answers: answers.length,
    answersByHow: byHow,
    answersLinkFormed: answers.filter(a => a.linkFormed === true).length,
    minPantryAtSettle: (() => { const ps = settles.map(s => s.pantryKcalAtSettle).filter(v => v != null); return ps.length ? Math.min(...ps) : null; })(),
    tributes: settles.map(s => s.tribute).filter(t => t != null),
    pendingCounterEnd: pendingCounterEnd || null,
  };
}

function tallyRecap(transcripts) {
  let maxRecapPresses = 0, totalPresses = 0, offeredAfterCap = 0;
  const capFailures = [];
  for (const t of transcripts || []) {
    if (!t || typeof t !== 'object') continue;
    let presses = (typeof t.recapPresses === 'number') ? t.recapPresses : null;
    if (presses == null) {
      // Fallback for transcripts without the driver field: count YOU lines
      // carrying the recap label.
      presses = ((t.transcript || []).filter(e => e.who === 'YOU' && /what were we talking about/i.test(String(e.text || '')))).length;
    }
    totalPresses += presses;
    if (presses > maxRecapPresses) maxRecapPresses = presses;
    if (t.recapOfferedAfterCap) offeredAfterCap++;
    if (presses >= 6) capFailures.push({ tag: t.tag || '?', vid: t.vid || '?', day: t.day == null ? null : t.day, presses, offeredAfterCap: !!t.recapOfferedAfterCap });
  }
  return { maxRecapPresses, totalPresses, offeredAfterCap, capFailures };
}
