'use strict';
// exphurt-a-lib.js — pure EXPHURT disconnect + return-line logic for
// sim-exphurt-a (oversight-flesh-out-loop, run fleshout-20261104T1445Z,
// axis food-economy). Shared by scripts/sweep-exphurt-a.js (live sims),
// scripts/analyze-exphurt-a.js, and scripts/test-exphurt-a.js (proof),
// so the proof exercises the same classification code the verdict
// judges by. No RNG reads, no game-value writes: inputs are only read,
// never mutated.
//
// DISCONNECT (backlog #1699): an expedition writes one duration into
// two places — st.exped[vid].duration and v.away[vid].duration.
// expedHurt caps only the exped copy. The disconnect is the gap
// between the two copies at case open (the hurthome-a definition).
// RETURN LINES: a hurt expedition return fires up to two lines in
// one travel tick — the landed hurthome line in npcNodeTravel, then
// expeditionReturn's homecoming line in agencyTick. Only the second
// line is the "official" homecoming; the blank is that it never
// mentions hurt.
const DISCONNECT_MIN_GAP = 2;

function disconnectOf(expedDuration, awayDuration) {
  const bothPresent = typeof expedDuration === 'number' && typeof awayDuration === 'number';
  if (!bothPresent) return { bothPresent: false, gap: null, absGap: null, disconnected: false, expedShorter: false };
  const gap = awayDuration - expedDuration;
  return { bothPresent: true, gap, absGap: Math.abs(gap), disconnected: Math.abs(gap) >= DISCONNECT_MIN_GAP, expedShorter: gap > 0 };
}

function isReturnLine(line) {
  return /returns from|is back from|came back/i.test(String(line || ''));
}
function isExpeditionReturnLine(line) {
  return /is back from (far )?past the/i.test(String(line || ''));
}
function isHurthomeLine(line) {
  return /returns from the wilds hurt/i.test(String(line || ''));
}
function mentionsHurt(line) {
  return /hurt/i.test(String(line || ''));
}
function classifyReturnLine(line) {
  return {
    line: String(line || ''),
    isReturn: isReturnLine(line),
    isExpeditionReturn: isExpeditionReturnLine(line),
    isHurthome: isHurthomeLine(line),
    mentionsHurt: mentionsHurt(line),
  };
}

// Closing-part return lines naming one villager. `transcript` entries
// are {day, part, line} as captured by the sweep's say wrapper.
// firstName 'Someone' (unattributable) matches nothing, by design —
// an unattributed line must never be counted for a villager.
function closingReturnLines(transcript, day, part, firstName) {
  if (!firstName || firstName === 'Someone') return [];
  const out = [];
  for (const t of (transcript || [])) {
    if (t.day !== day || t.part !== part) continue;
    if (typeof t.line !== 'string' || t.line.indexOf(firstName) === -1) continue;
    if (!isReturnLine(t.line)) continue;
    out.push(classifyReturnLine(t.line));
  }
  return out;
}

// Pooled summary over cases (each case carries: purpose,
// expedDurationAtOpen, awayDuration, outcome, closingLines).
// Disconnect denominator: expedition-purpose cases with BOTH
// durations present at open. M1 denominator: returned-hurt
// expedition cases WITH an expeditionReturn line in the closing
// part. M2/M3 denominators: ALL returned-hurt expedition cases.
function summarize(cases) {
  const xs = (cases || []).filter((c) => c && c.purpose === 'expedition');
  const denom = xs.filter((c) => disconnectOf(c.expedDurationAtOpen, c.awayDuration).bothPresent);
  const disc = denom.filter((c) => disconnectOf(c.expedDurationAtOpen, c.awayDuration).disconnected);
  const shorter = denom.filter((c) => disconnectOf(c.expedDurationAtOpen, c.awayDuration).expedShorter);
  const gaps = denom.map((c) => disconnectOf(c.expedDurationAtOpen, c.awayDuration).gap).sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
  const rh = xs.filter((c) => c.outcome === 'returned-hurt');
  const rhWithExpLine = rh.filter((c) => (c.closingLines || []).some((l) => l.isExpeditionReturn));
  const rhExpLineHurt = rhWithExpLine.filter((c) => (c.closingLines || []).some((l) => l.isExpeditionReturn && l.mentionsHurt));
  const rhAnyHurt = rh.filter((c) => (c.closingLines || []).some((l) => l.mentionsHurt));
  const rhAnnounced = rh.filter((c) => (c.closingLines || []).length > 0);
  const share = (n, d) => (d ? n / d : null);
  return {
    expeditionCases: xs.length,
    disconnectDenom: denom.length,
    disconnected: disc.length,
    D: share(disc.length, denom.length),
    expedShorter: shorter.length,
    expedShorterShare: share(shorter.length, denom.length),
    medianGap,
    returnedHurtExpedition: rh.length,
    rhWithExpeditionLine: rhWithExpLine.length,
    rhExpeditionLineMentionsHurt: rhExpLineHurt.length,
    M1: share(rhExpLineHurt.length, rhWithExpLine.length),
    rhAnyLineMentionsHurt: rhAnyHurt.length,
    M2: share(rhAnyHurt.length, rh.length),
    rhAnnounced: rhAnnounced.length,
    M3: share(rhAnnounced.length, rh.length),
  };
}

module.exports = { DISCONNECT_MIN_GAP, disconnectOf, isReturnLine,
  isExpeditionReturnLine, isHurthomeLine, mentionsHurt,
  classifyReturnLine, closingReturnLines, summarize };
