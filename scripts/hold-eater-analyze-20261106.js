// hold-eater-analyze-20261106.js — bleed-eater attribution analyzer
// (arm sim-hold-b). Reads per-seed JSONs written by
// hold-driver-20261106.js and attributes every per-link trust delta
// to its eater, from the engine's own records: link.history entries
// (day/kind/note) + field diffs between consecutive daily snapshots
// (tendedWeek, mourningUntil, arrears, tributePaidWeek,
// pendingRenegotiation). Tends are NOT in the court log — they are
// read from tendedWeek / 'tended' history entries (stated, not
// hidden). Anything a delta cannot be matched to is reported as
// UNEXPLAINED with its field diffs, never silently absorbed.
//
// Eater categories:
//   tend (+8 landed) / tend-missed (opportunity: a week with no tend
//     landed although Haven's pantry topped 20000 on a non-mourning
//     day) / tend-guard-blocked (no tend landed; pantry never topped
//     20000 that week) / tend-choked (no tend landed; mourning covered
//     the tendable days)
//   tribute-paid (+1) / tribute-waived (+1) / tribute-shortfall
//     (partial -1, nothing -2) / arrears-settlement (+3, call-in only)
//   speaker-death (-8 + mourning choke) / renegotiation-gift (+8) /
//     renegotiation-lapse (-6) / defense-refusal (-10, covenant only) /
//     demand-refusal (-15, Haven-subordinate only) / sabotage (-4,
//     conquered only) / accord-gift (+10, first gesture; the note
//     carries no number, so the gain is the step residual clamped to
//     the nominal 10/8/4/0 by gesture kind) / aid-offer-accepted (+4)
//     and aid-offer-refused (-3) — safetynets.js direct link.trust
//     writes with NO history note, detected from pendingAidOffer
//     transitions + the exact residual / aid-beg-gave (+4, noted) /
//     aid-beg-short (-2) and aid-beg-refused (-5/-10, unnoted except
//     the -10 ingratitude case) / aid-ask-refused (-2, noted; the
//     request path carries NO +4 — the +4 is the unsolicited offer
//     only) / aid-ask-accepted-bonus (+3 at trust>=60, say line only)
//     / unexplained (residual).
// Usage:
// Usage:
//   RUN=hold-stage0 SEEDS=58001,58002,58003 node scripts/hold-eater-analyze-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const RUN = process.env.RUN || 'hold-stage0';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-hold-b');

function load(seed, leg) {
  const f = path.join(dir, 'hold-s' + seed + '-' + leg + '-' + RUN + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function histKey(h) { return h.day + '|' + h.kind + '|' + h.note; }
function parseGain(note) { const m = /trust \+(\d+)/.exec(note || ''); return m ? parseInt(m[1], 10) : null; }

// Attribute one link's day step (prev -> cur). prevHold / curHold are
// the snapshot-level hold rolls (pending aid offer/beg, aidOut /
// aidInbound counts) for the two days; aidEvents are the instrument's
// spy records for this step (day === cur day, village === this link's
// other end). Returns attribution rows.
function attributeStep(prev, cur, prevHold, curHold, aidEvents) {
  const rows = [];
  const dTrust = (cur.trust || 0) - (prev.trust || 0);
  if (dTrust === 0 && !(cur.history || []).length) return { dTrust: 0, rows: rows, residual: 0 };
  const prevSet = {};
  // MULTISET difference, not set difference: two deaths on the same
  // day write byte-identical succession notes ("Young link: grief
  // delays the verdict"), and a set keyed on day|kind|note swallows
  // the second one — pilot residuals of -8 on answered-beat steps
  // (58001 d42, 58003 d67). Count occurrences; only the surplus in
  // the current snapshot is fresh.
  const prevCounts = {};
  (prev.history || []).forEach(function (h) { const k = histKey(h); prevCounts[k] = (prevCounts[k] || 0) + 1; });
  const fresh = (cur.history || []).filter(function (h) { const k = histKey(h); if ((prevCounts[k] || 0) > 0) { prevCounts[k]--; return false; } return true; });
  let attributed = 0;
  // SEQUENTIAL running trust (pilot fix): the engine's _trustGain
  // RETURNS the nominal gain even when the 100-cap (or mourning)
  // swallowed it — the tend/renegotiation notes print "+8" for a
  // +0 or +3 that actually landed. Every nominal must be clamped
  // against the trust as it stands AFTER the step's earlier events,
  // in history order, or the analyzer over-attributes at the cap
  // (pilot: coverage 1.38–1.51 on hold legs, tend +8s at trust 100).
  // `add` keeps the running trust in sync with the attributed sum.
  let runTrust = (prev.trust || 0);
  function add(eater, delta, why) { rows.push({ day: cur.day, eater: eater, delta: delta, why: why }); attributed += delta; runTrust += delta; }
  const prevTrust = (prev.trust || 0);
  function clampLoss(n) { return -Math.min(n, runTrust); }
  function clampGain(n) { return Math.min(n, 100 - runTrust); }
  // Mourning window for this step, judged by the ENTRY's day, not the
  // snapshot day: a _trustGain attempted while the link mourns is
  // choked to 0 — but the weekly tick's note is dated the day it ran,
  // and a death the NEXT day does not choke it (58005: tribute d49
  // +1 lands, death d50), while mourning already active on the
  // entry's day does choke it (58005: tribute d63 +1 choked,
  // mourningUntil 64). The window starts at the death's day (the
  // tick runs at endDay, after any death that day) and ends at
  // mourningUntil. Carried-over mourning counts from the previous
  // snapshot's day.
  let mournFrom = null, mournUntil = 0;
  if ((prev.mourningUntil || 0) > (prev.day || 0)) { mournFrom = (prev.day || 0); mournUntil = prev.mourningUntil; }
  // Deaths in THIS step extend the window: a non-priced-in succession
  // entry that leaves mourning set (cur.mourningUntil past its day)
  // starts the choke on its day — young-link beats never mark
  // mourning, so they never extend it. Earliest death day wins.
  for (const h of fresh) {
    if (h.kind === 'succession' && !/priced in/i.test(h.note || '') && (cur.mourningUntil || 0) > h.day) {
      if (mournFrom == null || h.day < mournFrom) { mournFrom = h.day; mournUntil = cur.mourningUntil; }
      else if ((cur.mourningUntil || 0) > mournUntil) { mournUntil = cur.mourningUntil; }
    }
  }
  function gainOrChoked(eater, n, note, entryDay) {
    if (mournFrom != null && entryDay >= mournFrom && entryDay < mournUntil) { add(eater + '-choked', 0, note.slice(0, 90) + ' (mourning choked the gain to 0)'); return; }
    add(eater, clampGain(n), note.slice(0, 90));
  }
  let accordNote = null;
  let renegVisitWord = false;
  let begGaveNoted = false, begRefusedDebtNoted = false;
  for (const h of fresh) {
    const note = h.note || '';
    if (h.kind === 'formed') { add('formation', 0, 'link formed at trust ' + cur.trust + ' (formation day excluded from bleed math)'); continue; }
    if (h.kind === 'tended') { const g = parseGain(note); const landed = clampGain(g == null ? 8 : g); add('tend', landed, note.slice(0, 90) + ' (note nominal ' + g + ', landed ' + landed + ' at the cap)'); continue; }
    if (h.kind === 'accord') { accordNote = note; continue; } // nominal quantified below, from the residual
    if (h.kind === 'aid') {
      if (/Gave .* kcal aid/.test(note)) { begGaveNoted = true; add('aid-beg-gave', clampGain(4), note.slice(0, 110)); continue; }
      if (/REFUSED .* Ingratitude/.test(note)) { begRefusedDebtNoted = true; add('aid-beg-refused-debt', clampLoss(10), note.slice(0, 110)); continue; }
      if (/Aid debt repaid in full/.test(note)) { add('aid-debt-repaid', clampGain(3), note.slice(0, 110)); continue; }
      if (/fell at Haven's door/.test(note)) { add('aid-ally-down', clampLoss(6), note.slice(0, 110)); continue; }
      if (/Sent .* to Haven's aid/.test(note)) { add('aid-sent-debt', 0, note.slice(0, 110)); continue; }
      if (/Refused Haven's call/.test(note)) { add('aid-call-refused', 0, note.slice(0, 110)); continue; }
      if (/Could not answer Haven's .* ask/.test(note)) { add('aid-ask-refused-crisis', 0, note.slice(0, 110)); continue; }
      if (/Refused Haven's .* ask: pantry bare/.test(note)) { add('aid-ask-refused-bare', clampLoss(2), note.slice(0, 110)); continue; }
      if (/Refused Haven's .* ask: the ask didn't carry/.test(note)) { add('aid-ask-refused-carry', clampLoss(2), note.slice(0, 110)); continue; }
      if (/Sent Haven .* kcal cost to them/.test(note)) { add('aid-ask-accepted', 0, note.slice(0, 110)); continue; }
      add('aid-other', 0, note.slice(0, 110)); continue;
    }
    if (h.kind === 'tribute') {
      if (/paid thin/.test(note)) { add('tribute-shortfall', clampLoss(1), note.slice(0, 110)); continue; }
      if (/paid nothing/.test(note)) { add('tribute-shortfall', clampLoss(2), note.slice(0, 110)); continue; }
      if (/Waiver/.test(note)) { gainOrChoked('tribute-waived', 1, note, h.day); continue; }
      if (/Back-paid|back-payment/.test(note)) { const g = parseGain(note); gainOrChoked('arrears-settlement', g == null ? 3 : g, note, h.day); continue; }
      if (/paid\./.test(note)) { gainOrChoked('tribute-paid', 1, note, h.day); continue; }
      add('tribute-other', 0, note.slice(0, 90)); continue;
    }
    if (h.kind === 'succession') {
      // GRIEF COALESCES (hierarchy.js): a death while the link already
      // grieves stages NO new haircut — the note says the grief is
      // priced in. Every OTHER succession note carries the -8: both
      // successionCrisis paths (young beat, older mourning) and both
      // theirLeaderDied paths apply -8 before writing the note. The
      // old mournSet/renegStaged heuristic LOST the -8 whenever the
      // hold policy answered the beat the same day (pending flag
      // already cleared by snapshot time) — pilot residuals of -8 on
      // nearly every answered-beat step. The note text is the
      // evidence; the flags are not.
      if (/priced in/i.test(note)) { add('succession-grief-priced-in', 0, note.slice(0, 110)); continue; }
      add('speaker-death', clampLoss(8), note.slice(0, 110)); continue;
    }
    if (h.kind === 'renegotiation') {
      if (/Met grief with grain/.test(note)) { const g = parseGain(note); add('renegotiation-gift', clampGain(g == null ? 8 : g), note.slice(0, 90)); continue; }
      if (/silence answer/.test(note)) { add('renegotiation-lapse', clampLoss(6), note.slice(0, 110)); continue; }
      if (/No speaker to send/.test(note)) { renegVisitWord = true; continue; } // +2, quantified below from the residual
      const g = parseGain(note); add('renegotiation-other', clampGain(g == null ? 0 : g), note.slice(0, 90)); continue;
    }
    if (h.kind === 'demand') {
      if (/REFUSED/.test(note)) { add('demand-refusal', clampLoss(15), note.slice(0, 90)); continue; }
      const g = parseGain(note); add('demand-honored', clampGain(g == null ? 0 : g), note.slice(0, 90)); continue;
    }
    if (h.kind === 'defense') {
      if (/REFUSED/.test(note)) { add('defense-refusal', clampLoss(10), note.slice(0, 90)); continue; }
      const g = parseGain(note); add('defense-sent', clampGain(g == null ? 0 : g), note.slice(0, 90)); continue;
    }
    if (h.kind === 'court') {
      // First court (hierarchy.js answerNationalChoice, lead shape):
      // feast +10 (proportional 2–10 on a thin pantry), host +6,
      // word +3 — all via _trustGain (choke + cap aware); cold -12
      // is a direct write. The note carries no gain number except
      // the feast's kcal, so the gain is computed from the note.
      // The linkseek policy answers 'feast', so feast is the live one.
      const feastM = /shared granary feast \(([\d,]+) kcal\)/.exec(note);
      if (feastM) { const paid = parseInt(feastM[1].replace(/,/g, ''), 10); const gain = paid >= 5000 ? 10 : Math.max(2, Math.round(10 * paid / 5000)); gainOrChoked('court-feast', gain, note, h.day); continue; }
      if (/hosted at Haven's fire/.test(note)) { gainOrChoked('court-host', 6, note, h.day); continue; }
      if (/word sent/.test(note)) { gainOrChoked('court-word', 3, note, h.day); continue; }
      if (/cold ink/.test(note)) { add('court-cold', clampLoss(12), note.slice(0, 110)); continue; }
      add('court-other', 0, note.slice(0, 90)); continue;
    }
    if (h.kind === 'arrears') { add('arrears-note', 0, note.slice(0, 110)); continue; }
    if (h.kind === 'titan') { const m = /trust [−\-](\d+)/.exec(note); add('titan-strike', m ? clampLoss(parseInt(m[1], 10)) : 0, note.slice(0, 110)); continue; }
    if (h.kind === 'sabotage') { add('sabotage', clampLoss(4), note.slice(0, 90)); continue; }
    if (h.kind === 'revolt') { add('revolt-break', 0, note.slice(0, 90)); continue; }
    if (h.kind === 'drift') { add('drift-voice', 0, note.slice(0, 90)); continue; }
    if (h.kind === 'dissolve') { add('dissolve-voice', 0, note.slice(0, 90)); continue; }
    add('history-other:' + h.kind, 0, note.slice(0, 90));
  }
  // Unnoted aid moves (safetynets.js writes link.trust directly):
  // an unsolicited offer answered (+4 accept / -3 refuse), a beg
  // answered short (-2) or refused (-5), a request accepted at
  // trust>=60 (+3 bonus, say line only). PRIMARY evidence is the
  // instrument's spy records (the pending beat is staged at endDay
  // and answered next morning, so snapshots can never see it);
  // pending-state transitions are the FALLBACK when no spy record
  // exists (old per-seed files, synthetic cases). A non-matching
  // residual stays unexplained, never forced into an aid label.
  let spyOfferMatched = false, spyBegMatched = false;
  for (const ev of (aidEvents || [])) {
    if (!ev || ev.villageId !== cur.other) continue;
    // DAY-BOUNDARY SKIP (confirm fix): the spy records the engine day
    // at answer time, but an answer that lands AFTER the day's snapshot
    // (pending beat staged at endDay, answered overnight) belongs to
    // the NEXT step — the snapshot at the spy's day still shows the
    // beat pending. Attributing it here invents a +4 the step never
    // saw (confirm residuals: 4 phantom +4s). If the beat is still
    // pending at this snapshot, skip the spy record here; the
    // transition fallback below attributes it in the step where the
    // beat disappears, keyed off the snapshot transition.
    if (ev.kind === 'offer' && curHold && curHold.pendingAidOffer && curHold.pendingAidOffer.villageId === cur.other) continue;
    if (ev.kind === 'beg' && curHold && curHold.pendingAidBeg && curHold.pendingAidBeg.villageId === cur.other) continue;
    if (ev.kind === 'offer') {
      spyOfferMatched = true;
      if (ev.result === 'accepted') add('aid-offer-accepted', clampGain(4), 'unsolicited aid offer accepted (+4, safetynets.js spy, no history note)');
      else if (ev.result === 'refused') add('aid-offer-refused', clampLoss(3), 'unsolicited aid offer refused (-3, safetynets.js spy, no history note)');
    } else if (ev.kind === 'beg') {
      spyBegMatched = true;
      if (ev.result === 'gave' && !begGaveNoted) add('aid-beg-gave', clampGain(4), 'beg answered with food (+4, safetynets.js spy, note missing)');
      else if (ev.result === 'short') add('aid-beg-short', clampLoss(2), 'beg answered short of the ask (-2, safetynets.js spy, no history note)');
      else if (ev.result === 'refused' && !begRefusedDebtNoted) add('aid-beg-refused', clampLoss(5), 'beg refused, no creditor debt (-5, safetynets.js spy, no history note)');
    }
  }
  if (prevHold && curHold) {
    const other = cur.other;
    const offerGone = !spyOfferMatched && prevHold.pendingAidOffer && prevHold.pendingAidOffer.villageId === other &&
      (!curHold.pendingAidOffer || curHold.pendingAidOffer.villageId !== other);
    if (offerGone) {
      const r = dTrust - attributed;
      if (r === 4) add('aid-offer-accepted', 4, 'unsolicited aid offer accepted (+4, safetynets.js, no history note)');
      else if (r === -3) add('aid-offer-refused', -3, 'unsolicited aid offer refused (-3, safetynets.js, no history note)');
      else if (r === 0) add('aid-offer-cleared', 0, 'aid offer cleared with no trust move (expired)');
    }
    const begGone = !spyBegMatched && prevHold.pendingAidBeg && prevHold.pendingAidBeg.villageId === other &&
      (!curHold.pendingAidBeg || curHold.pendingAidBeg.villageId !== other);
    if (begGone) {
      const r = dTrust - attributed;
      if (r === -2) add('aid-beg-short', -2, 'beg answered short of the ask (-2, safetynets.js, no history note)');
      else if (r === -5) add('aid-beg-refused', -5, 'beg refused, no creditor debt (-5, safetynets.js, no history note)');
      else if (r === 0) add('aid-beg-cleared', 0, 'aid beg cleared with no trust move');
    }
    const reqResolved = (prevHold.aidOutCount || 0) > (curHold.aidOutCount || 0);
    if (reqResolved) {
      const r = dTrust - attributed;
      if (r === 3) add('aid-ask-accepted-bonus', 3, 'requested aid accepted at trust>=60 (+3, say line only)');
    }
  }
  // Renegotiation visit with an empty bench: +2, note carries no number.
  if (renegVisitWord) {
    const r = dTrust - attributed;
    add('renegotiation-visit-word', (r > 0) ? Math.min(r, 2) : 0, 'No speaker to send — word and promises (nominal +2)');
  }
  // Accord (first gesture): the note carries no number. The gain is
  // the step's remaining residual clamped to the gesture's nominal
  // (gift 10, visit 8, word-sent 4, cold ink 0). A choked (mourning)
  // gain lands as 0, honestly; an excess stays unexplained.
  if (accordNote) {
    const nominal = /First gesture: gift/.test(accordNote) ? 10
      : /word sent/.test(accordNote) ? 4
      : /sits at their fire|player sits/.test(accordNote) ? 8 : 0;
    const r = dTrust - attributed;
    const g = (r > 0) ? Math.min(r, nominal) : 0;
    add(/First gesture: gift/.test(accordNote) ? 'accord-gift' : 'accord-visit', g,
      accordNote.slice(0, 90) + ' (nominal ' + nominal + ', landed ' + g + ')');
  }
  // Formation day: the trust jumps 0 -> 30 with no prior snapshot row
  // for this link; that +30 is not a bleed event. It is handled by
  // the caller (first-seen day), not here.
  const residual = dTrust - attributed;
  return { dTrust: dTrust, rows: rows, attributed: attributed, residual: residual };
}

function analyzeLeg(rec, leg) {
  const daily = rec.daily || [];
  const holdByDay = {};
  for (const s of daily) holdByDay[s.day] = s.hold || {};
  const links = {}; // key -> { firstDay, other, steps, weeks, seasonedDay, goneDay }
  const byDay = {};
  for (const s of daily) {
    byDay[s.day] = s;
    for (const l of ((s.hold || {}).links || [])) {
      if (!links[l.key]) links[l.key] = { key: l.key, other: l.other, firstDay: s.day, firstTrust: l.trust, lastSeen: s.day, status: l.status, steps: [], last: null };
      const L = links[l.key];
      L.lastSeen = s.day; L.status = l.status;
      if (L.last) {
        const cur = Object.assign({}, l, { day: s.day });
        const prev = Object.assign({}, L.last, { day: L.lastDay });
        const stepAid = ((rec.aidAnswers || []).filter(function (ev) {
          // Interval match, not same-day: snapshots are taken on day
          // change and a day can pass with no snapshot (a step can
          // span 2 days — 58005 d28→d30); an aid answer recorded on
          // the skipped day belongs to this step. Intervals partition
          // the days, so no event is ever attributed twice.
          return ev && ev.day > L.lastDay && ev.day <= s.day && ev.villageId === L.other;
        }));
        const att = attributeStep(prev, cur, holdByDay[L.lastDay], holdByDay[s.day], stepAid);
        // Formation-day jump: first time we see the link it may already
        // carry trust 30 with a 'formed' note; attributeStep sees the
        // jump only when the link appears between two snapshots. If the
        // link's first snapshot IS its formation day, dTrust is 0 here
        // (no prev row) — nothing to do. If it formed between snapshots
        // the +30 shows as dTrust with a 'formed' note and is excluded
        // from bleed totals by the caller via kind 'formation'.
        L.steps.push({ day: s.day, dTrust: att.dTrust, attributed: att.attributed, residual: att.residual, rows: att.rows });
      }
      L.last = l; L.lastDay = s.day;
    }
    // Seasoning: read the standaccum link roll on the same snapshot.
    for (const sl of (s.links || [])) {
      const L = links[sl.key];
      if (L && sl.seasoned && !L.seasonedDay) L.seasonedDay = s.day;
    }
    for (const k of Object.keys(links)) {
      const L = links[k];
      const present = ((s.hold || {}).links || []).some(function (l) { return l.key === k && l.status === 'active'; });
      if (!present && L.status === 'active' && !L.goneDay) { /* still active elsewhere? re-check below */ }
    }
  }
  // Dissolution: last snapshot where the link was active.
  for (const k of Object.keys(links)) {
    const L = links[k];
    let lastActive = null;
    for (const s of daily) {
      const row = ((s.hold || {}).links || []).find(function (l) { return l.key === k; });
      if (row && row.status === 'active') lastActive = s.day;
    }
    L.lastActiveDay = lastActive;
    L.finalStatus = L.status;
    L.finalTrust = L.last ? L.last.trust : null;
    L.finalArrears = L.last ? L.last.arrears : null;
  }
  // Weekly rollup per link.
  const weekRows = [];
  for (const k of Object.keys(links)) {
    const L = links[k];
    const weeks = {};
    for (const s of daily) {
      const row = ((s.hold || {}).links || []).find(function (l) { return l.key === k; });
      if (!row || row.status !== 'active') continue;
      const wk = Math.floor(s.day / 7);
      const w = weeks[wk] || (weeks[wk] = { key: k, other: L.other, week: wk, days: [], trustStart: null, trustEnd: null, tendLanded: false, oppDays: 0, guardDays: 0, chokeDays: 0, tendNote: 0, shortfall: 0, paid: 0, waived: 0, deaths: 0, renegGift: 0, renegLapse: 0, aidNet: 0, accordNet: 0 });
      if (w.trustStart == null) w.trustStart = row.trust;
      w.trustEnd = row.trust;
      w.days.push(s.day);
      if ((row.tendedWeek || -1) === wk) w.tendLanded = true;
      const mourning = (row.mourningUntil || 0) > s.day;
      const pantry = ((s.hold || {}).havenPantry || 0);
      if (mourning) w.chokeDays++;
      else if (pantry <= 20000) w.guardDays++;
      else if ((row.tendedWeek || -1) !== wk) w.oppDays++;
    }
    for (const wk of Object.keys(weeks)) {
      const w = weeks[wk];
      for (const st of L.steps) {
        if (Math.floor(st.day / 7) !== parseInt(wk, 10)) continue;
        for (const r of st.rows) {
          if (r.eater === 'tend') { w.tendNote++; }
          if (r.eater === 'tribute-shortfall') w.shortfall += r.delta;
          if (r.eater === 'tribute-paid') w.paid++;
          if (r.eater === 'tribute-waived') w.waived++;
          if (r.eater === 'speaker-death') w.deaths++;
          if (r.eater === 'renegotiation-gift') w.renegGift++;
          if (r.eater === 'renegotiation-lapse') w.renegLapse++;
          if (/^aid-/.test(r.eater) && r.eater !== 'aid-sent-debt' && r.eater !== 'aid-call-refused' && r.eater !== 'aid-ask-refused-crisis' && r.eater !== 'aid-offer-cleared' && r.eater !== 'aid-beg-cleared') w.aidNet += r.delta;
          if (/^accord-/.test(r.eater)) w.accordNet += r.delta;
        }
      }
      w.trustDelta = (w.trustEnd == null ? 0 : w.trustEnd) - (w.trustStart == null ? 0 : w.trustStart);
      weekRows.push(w);
    }
  }
  // Pooled eater totals (formation jumps excluded: rows with eater
  // 'formation' carry delta 0 by construction; the +30 formation
  // jump itself is a step with no rows — exclude steps whose rows
  // contain a 'formed' note).
  const totals = {};
  let absDelta = 0, absAttributed = 0, unexplainedAbs = 0, unexplainedSteps = 0;
  for (const k of Object.keys(links)) {
    const L = links[k];
    for (const st of L.steps) {
      const isFormation = st.rows.some(function (r) { return r.eater === 'formation'; });
      if (isFormation) continue;
      absDelta += Math.abs(st.dTrust);
      absAttributed += Math.abs(st.attributed);
      if (st.residual !== 0) { unexplainedAbs += Math.abs(st.residual); unexplainedSteps++; }
      for (const r of st.rows) {
        const t = totals[r.eater] || (totals[r.eater] = { sum: 0, n: 0 });
        t.sum += r.delta; t.n++;
      }
    }
  }
  const tendMissedWeeks = weekRows.filter(function (w) { return !w.tendLanded && w.oppDays > 0; }).length;
  const tendGuardWeeks = weekRows.filter(function (w) { return !w.tendLanded && w.oppDays === 0 && w.guardDays > 0; }).length;
  const tendChokedWeeks = weekRows.filter(function (w) { return !w.tendLanded && w.oppDays === 0 && w.guardDays === 0 && w.chokeDays > 0; }).length;
  const tendLandedWeeks = weekRows.filter(function (w) { return w.tendLanded; }).length;
  return {
    leg: leg, seed: rec.seed,
    links: Object.keys(links).map(function (k) {
      const L = links[k];
      return { key: L.key, other: L.other, firstDay: L.firstDay, seasonedDay: L.seasonedDay || null, lastActiveDay: L.lastActiveDay, finalStatus: L.finalStatus, finalTrust: L.finalTrust, finalArrears: L.finalArrears };
    }),
    weekRows: weekRows,
    totals: totals,
    coverage: { absDelta: absDelta, absAttributed: absAttributed, unexplainedAbs: unexplainedAbs, unexplainedSteps: unexplainedSteps, coverage: absDelta ? +(absAttributed / absDelta).toFixed(3) : null },
    tendWeeks: { landed: tendLandedWeeks, missedOpp: tendMissedWeeks, guardBlocked: tendGuardWeeks, choked: tendChokedWeeks, total: weekRows.length },
  };
}

function main() {
  if (!SEEDS.length) { console.error('HOLD-EATER STOP: SEEDS required.'); process.exit(2); }
  const pooled = {};
  const perSeed = [];
  for (const seed of SEEDS) {
    for (const leg of ['linkseek', 'hold']) {
      const f = path.join(dir, 'hold-s' + seed + '-' + leg + '-' + RUN + '.json');
      if (!fs.existsSync(f)) { console.log(JSON.stringify({ seed: seed, leg: leg, status: 'missing-file' })); continue; }
      const rec = load(seed, leg);
      const a = analyzeLeg(rec, leg);
      perSeed.push(a);
      for (const e of Object.keys(a.totals)) {
        const p = pooled[e] || (pooled[e] = { sum: 0, n: 0 });
        p.sum += a.totals[e].sum; p.n += a.totals[e].n;
      }
      console.log(JSON.stringify({
        seed: seed, leg: leg, links: a.links.length,
        seasoned: a.links.filter(function (l) { return l.seasonedDay; }).length,
        dissolved: a.links.filter(function (l) { return l.finalStatus !== 'active'; }).length,
        coverage: a.coverage, tendWeeks: a.tendWeeks,
        totals: a.totals,
      }));
    }
  }
  console.log('## pooled eater totals (linkseek leg only, stage 0)');
  console.log(JSON.stringify(pooled, null, 2));
  const sumFile = path.join(dir, 'hold-eater-analysis-' + RUN + '.json');
  fs.writeFileSync(sumFile, JSON.stringify({ run: RUN, seeds: SEEDS, pooled: pooled, perSeed: perSeed }, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, sumFile));
}

if (require.main === module) main();
module.exports = { analyzeLeg: analyzeLeg, attributeStep: attributeStep };
