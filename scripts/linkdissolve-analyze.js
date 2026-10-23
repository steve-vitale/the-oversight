// linkdissolve-analyze.js — dissolution attribution for the link-history census
// (flesh-out loop arm sim-linkdissolve, axis scale-onramp, backlog #853).
// Namespace linkdissolve-*. Reads scripts/diag-linkdissolve.js per-seed
// JSONs (corpus dir: evidence/2026-10-23/perseed-linkdissolve/{control,armed}/).
//
// DISSOLUTION DETECTION: day D where dip (diplomacy POINTS = links*34,
// the census-recorded villageStanding().diplomacy scalar) drops by >=34 vs
// D-1 — the dip is a polity step function, so -34/-68/-102 all mark the day
// the realm lost link(s) (a full -102 is the whole polity dissolving).
//
// ATTRIBUTION: for each Haven-party link, the census re-derives the link's
// OWN seasoned bar per day: active && (day - formedDay) >= 30 &&
// (conquered || trust >= 40) — the standing.js _linkSeasoned(l,
// !!l.conquered) callers' variant (plain bars; SUCCGRACE/SUCCPOLITY are
// unset in this substrate). The link(s) whose own bar flips true->false on
// day D are the dissolution's proximate cause; the link's own history
// (_linkNote kinds, read from the census's histTail union) names the
// channel:
//   trust-decay      trust below 40, link still active, no break/chaos
//   break/<how>      status 'broken' on D; the 'broken' history note names
//                    the how: succession | revolt | released | walked |
//                    seceded | gambit | severed
//   succession       still active, but 'succession' history notes within 14d
//                    of D with a funeral-hour trust haircut or tribute grab
//   tribute-arrears  'arrears' notes in the 21d before D with an arrears
//                    spike temporally coupled to the trust crossing
//   other-named      none of the above; the history kinds present are named
//
// Every event lands in exactly one named channel (never anonymous). The
// DIAG-GO bar (§14): >=90% of dissolution events attributed to a NAMED
// channel. A miss is insufficient-data, not a failure.
//
// Usage: node scripts/linkdissolve-analyze.js [--corpus <dir>] [--out <json>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const CORPUS = process.argv.includes('--corpus')
  ? process.argv[process.argv.indexOf('--corpus') + 1]
  : path.join(REPO, 'evidence', '2026-10-23', 'perseed-linkdissolve');

// ---- pure helpers (exported for scripts/test-linkdissolve.js) ----

// ownBar: the link's own seasoned bar on a given day (standing.js
// _linkSeasoned(l, !!l.conquered) variant — plain bars, no grace gates).
function ownBar(link, day) {
  if (!link || link.status !== 'active') return false;
  if (((day | 0) - (link.formedDay | 0)) < 30) return false;
  if (link.conquered) return true;
  return (link.trust | 0) >= 40;
}

// collectHist: union of a link's histTail entries across all days,
// deduped on (d,k,note-prefix), sorted by day. The census records tails
// only on growth days, so the union approximates the engine's own history.
function collectHist(days, other) {
  const seen = new Set(), out = [];
  const dkeys = Object.keys(days).map(Number).sort((a, b) => a - b);
  for (const d of dkeys) {
    for (const l of (days[d].links || [])) {
      if (String(l.other) !== String(other)) continue;
      for (const h of (l.histTail || [])) {
        const k = h.d + '|' + h.k + '|' + String(h.n).slice(0, 60);
        if (seen.has(k)) continue;
        seen.add(k); out.push(h);
      }
    }
  }
  out.sort((a, b) => a.d - b.d);
  return out;
}

function linkAt(days, other, day) {
  const s = days[day];
  if (!s) return null;
  for (const l of (s.links || [])) if (String(l.other) === String(other)) return l;
  return null;
}

function brokenHow(hist, D) {
  // The 'broken' history note names the how: "Link broken (succession)."
  for (let i = hist.length - 1; i >= 0; i--) {
    const h = hist[i];
    if (h.k === 'broken' && h.d <= D && h.d >= D - 3) {
      const m = String(h.n).match(/broken\s*\(([^)]+)\)/i);
      return m ? m[1].trim() : 'severed';
    }
  }
  return null;
}

// classifyDissolutionEvent(days, D): days = the census days object, D = the
// dissolution day (dipLinks dropped >=34 on D). Returns
// {channel, link, other, ovName, evidence[]} — channel always named.
function classifyDissolutionEvent(days, D) {
  const dkeys = Object.keys(days).map(Number).sort((a, b) => a - b);
  const D1 = dkeys.filter(d => d < D).pop();
  if (D1 == null) return { channel: 'other-named (no prior day)', link: null, other: null, ovName: null, evidence: ['no D-1 snapshot'] };
  // funeralNear: a speaker death shakes EVERY Haven-party link the same day
  // (successionCrisis notes each shaken link), but the note attaches per
  // link — the census's sparse tails may not carry the flipped link's own
  // copy. A funeral is village-wide: scan all links' histories for a
  // succession note stamped on D-2..D (the haircut lands the same day as
  // the note; snapshot timing can shift the observed drop by a day).
  // Notes AFTER D are exonerated — they cannot have caused the dissolution.
  const others = new Set();
  for (const dd of [D1, D]) for (const l of (((days[dd] || {}).links) || [])) others.add(String(l.other));
  let funeralNear = false;
  for (const o of others) {
    for (const h of collectHist(days, o)) {
      if (h.k === 'succession' && h.d >= D - 2 && h.d <= D) { funeralNear = true; break; }
    }
    if (funeralNear) break;
  }
  // All Haven-party links seen on D-1.
  const linksPrev = (days[D1].links || []);
  const flipped = [];
  for (const l of linksPrev) {
    if (ownBar(l, D1)) {
      const now = linkAt(days, l.other, D) || l;
      if (!ownBar(now, D)) flipped.push({ prev: l, now });
    }
  }
  if (!flipped.length) {
    return { channel: 'other-named (no own-bar flip)', link: null, other: null, ovName: null,
      evidence: ['dipLinks dropped but every link kept its own bar on D=' + D + ' (D-1=' + D1 + ') — polity flip with no link-level cause in the census'] };
  }
  // Attribute per flipped link; report the first as the proximate cause,
  // list the rest in evidence.
  const results = flipped.map(({ prev, now }) => {
    const hist = collectHist(days, prev.other);
    const ev = [];
    // 1. BREAK: the status itself says so, and the note names the how.
    const how = brokenHow(hist, D);
    if (now.status === 'broken' || how) {
      const h = (how || 'severed').toLowerCase();
      let chan;
      if (h === 'succession') chan = 'break (succession)';
      else if (h === 'revolt') chan = 'break (revolt)';
      else if (h === 'released' || h === 'walked' || h === 'seceded') chan = 'break (walk)';
      else if (h === 'gambit') chan = 'break (gambit)';
      else chan = 'break (' + h + ')';
      ev.push(`status on D=${D}: ${now.status}; history: ${JSON.stringify(hist.filter(x => x.d >= D - 14).map(x => x.d + ':' + x.k))}`);
      return { channel: chan, evidence: ev };
    }
    // 2. SUCCESSION chaos: funeral-hour notes near D with a haircut or
    // tribute grab. The funeral is village-wide (funeralNear covers the
    // flipped link whose own history copy the sparse tails missed); the
    // haircut is the engine's exactly-(-8), so a >=6 single-day drop near a
    // funeral is the chaos signature.
    const recent = hist.filter(x => x.d >= D - 14 && x.d <= D);
    const succNotes = recent.filter(x => x.k === 'succession');
    const haircut = ((prev.trust | 0) - (now.trust | 0)) >= 6;
    if ((succNotes.length && (haircut || ((now.arrears | 0) - (prev.arrears | 0)) > 0)) ||
        (funeralNear && haircut)) {
      if (succNotes.length) ev.push(`succession notes d${succNotes.map(x => x.d).join(',')}: ${succNotes[0].n.slice(0, 120)}`);
      else ev.push(`village-wide funeral d${D - 2}..d${D} (succession notes on sibling link(s); this link's own copy absent from the sparse tails)`);
      ev.push(`trust ${prev.trust}->${now.trust} (funeral-hour haircut), arrears ${prev.arrears}->${now.arrears}`);
      return { channel: 'succession', evidence: ev };
    }
    // 3. TRIBUTE-ARREARS: arrears notes in the 21d window with a spike
    // coupled to the trust crossing.
    const arrNotes = hist.filter(x => x.k === 'arrears' && x.d >= D - 21 && x.d <= D);
    const arrDelta = (now.arrears | 0) - ((linkAt(days, prev.other, D - 7) || prev).arrears | 0);
    if (arrNotes.length >= 2 && arrDelta > 3000) {
      ev.push(`arrears notes d${arrNotes.map(x => x.d).join(',')}; arrears +${arrDelta} in the week of the crossing`);
      ev.push(`trust ${prev.trust}->${now.trust}; last: ${arrNotes[arrNotes.length - 1].n.slice(0, 120)}`);
      return { channel: 'tribute-arrears', evidence: ev };
    }
    // 4. TRUST-DECAY: below the bar, still active, history shows drift or
    // just neglect.
    const driftNotes = hist.filter(x => x.k === 'drift' && x.d >= D - 30 && x.d <= D);
    ev.push(`trust ${prev.trust}->${now.trust} (bar 40), status ${now.status}, arrears ${now.arrears}`);
    ev.push(`history 30d (<=D): ${JSON.stringify(hist.filter(x => x.d >= D - 30 && x.d <= D).map(x => x.d + ':' + x.k))}${driftNotes.length ? '' : ' (no drift notes — neglect path)'}`);
    return { channel: 'trust-decay', evidence: ev };
  });
  const first = results[0];
  if (flipped.length > 1) first.evidence.push(`also flipped: ${flipped.slice(1).map(f => f.prev.other).join(', ')}`);
  return { channel: first.channel, link: flipped[0].prev.other, other: flipped[0].prev.other,
    ovName: flipped[0].prev.ovName, evidence: first.evidence };
}

function analyzeSeed(data) {
  const days = data.days || {};
  const dkeys = Object.keys(days).map(Number).sort((a, b) => a - b);
  const events = [];
  for (let i = 1; i < dkeys.length; i++) {
    const D = dkeys[i], P = dkeys[i - 1];
    const b = days[P].dip, a = days[D].dip;
    const bl = days[P].dipLinks, al = days[D].dipLinks;
    if (b == null || a == null) continue;
    if (b - a >= 34) {
      const c = classifyDissolutionEvent(days, D);
      events.push({ seed: data.seed, arm: data.arm, day: D, dipBefore: b, dipAfter: a, step: a - b,
        dipLinksBefore: bl, dipLinksAfter: al,
        channel: c.channel, link: c.link, ovName: c.ovName, evidence: c.evidence });
    }
  }
  return events;
}

function analyzeCorpus(corpusDir) {
  const events = [], files = [];
  for (const arm of ['control', 'armed']) {
    const dir = path.join(corpusDir, arm);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(x => /^s\d+\.json$/.test(x))) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (data.error) continue;
      files.push(f);
      for (const e of analyzeSeed(data)) events.push(e);
    }
  }
  events.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
  return { events, files };
}

module.exports = { ownBar, collectHist, classifyDissolutionEvent, analyzeSeed, analyzeCorpus };

if (require.main === module) {
  const corpusDir = CORPUS;
  const { events, files } = analyzeCorpus(corpusDir);
  const counts = {};
  for (const e of events) counts[e.channel] = (counts[e.channel] || 0) + 1;
  const named = events.filter(e => !/^other-named/.test(e.channel)).length;
  const verdict = events.length ? (named / events.length >= 0.9 ? 'DIAG-GO' : 'DIAG-NO-GO (insufficient-data)') : 'DIAG-NO-GO (no events)';
  console.log('=== linkdissolve attribution ===');
  console.log(`corpus: ${corpusDir}  files: ${files.length}  dissolution events: ${events.length}`);
  console.log('');
  for (const e of events) {
    console.log(`s${e.seed}/${e.arm} d${e.day}: dip ${e.dipBefore}->${e.dipAfter} (${e.step})  channel=${e.channel}  link=${e.ovName || e.link || 'n/a'}`);
    for (const ev of e.evidence) console.log(`    ${ev}`);
  }
  console.log('');
  console.log('channel counts:', JSON.stringify(counts, null, 1));
  console.log(`attributed-named: ${named}/${events.length} -> ${verdict}`);
  if (process.argv.includes('--out')) {
    const p = process.argv[process.argv.indexOf('--out') + 1];
    fs.writeFileSync(p, JSON.stringify({ corpus: corpusDir, verdict, events, counts }, null, 1) + '\n');
    console.log('wrote', p);
  }
}
