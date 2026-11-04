// scripts/analyze-trustset-20261104.js — covenant trust decomposition.
// Parses the r39 trust-setter traces (journey-scale-r*-trustset-<seed>.txt):
// every nonzero trust assignment with its writer stack. Classifies each
// event by writer, sums deltas per link per class, pairs crisis-charge
// (-10) with the concede gain (+8) that follows it, and cross-checks the
// summed deltas against the daily trust series (trust-<seed>.txt).
// Also scans the capture for crisis announcements and reports whether
// the -10 charge is named aloud anywhere near them.
// Usage: node scripts/analyze-trustset-20261104.js <EVIDIR> <PREFIX> <seed...>
//   EVIDIR: evidence dir holding <PREFIX>-trustset-<seed>.txt etc.
//   PREFIX: e.g. journey-scale-r94
// Prints a human-readable report to stdout (caller redirects to evidence).
const fs = require('fs');
const path = require('path');

function classify(frames, delta) {
  // frames: [{fn, file, line}] after the setter frame, in call order.
  // The assignment's semantic writer is the first KNOWN writer in the
  // stack: _trustGain is transparent (its caller is the writer), and the
  // harness eval wrapper is transparent too. A crisis triggered from a
  // weekly tick still classifies as crisis-charge, because the assignment
  // happens inside covenantCrisis.
  const names = frames.map(f => f.fn);
  const hasGain = names.includes('_trustGain');
  const has = (fn) => names.includes(fn);
  if (has('covenantCrisis')) return 'crisis-charge';
  if (has('answerCovenantCrisis')) return hasGain ? 'concede-gain' : 'hold-or-release';
  if (has('titanEscalate')) return 'titan-strike';
  if (has('covenantTick')) return hasGain ? 'weekly-tick' : (delta === -4 ? 'pool-haven-short' : delta === -2 ? 'pool-member-short' : 'pool-other');
  if (has('successionCrisis')) return 'succession-crisis';
  if (has('answerAccord')) return 'accord-gain';
  if (has('tendLink')) return 'tend-gain';
  if (has('answerAidOffer') || has('answerAidBeg')) return delta >= 0 ? 'aid-gain' : 'aid-charge';
  if (has('_resolveRenegotiation')) return 'renegotiation';
  if (has('recordDeed')) return 'deed-gain';
  if (has('linkTick')) return delta < 0 ? 'tribute-shortfall' : 'linkTick-gain';
  const meaningful = frames.find(f => !['set', 'trust', 'eval'].includes(f.fn));
  return 'other:' + (meaningful ? meaningful.fn : '?');
}

function parseTrustset(text) {
  const events = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^d(\d+) (\S+) (\S+) (-?\d+)->(-?\d+) \(delta (-?\d+)\) :: (.*)$/);
    if (!m) continue;
    const frames = [];
    const rest = m[7];
    // Stack frames look like: at Object.covenantCrisis (src/js/hierarchy.js:3612:18)
    // or: at Object.set [as trust] (.../scripts/driver.js:179:25)
    // or: at G.<computed> [as answerCovenantCrisis] (src/js/hierarchy.js:3973:18)
    // The [as X] name is the real function name when present.
    const fre = /at\s+([^\s\[]+)(?:\s+\[as ([^\]]+)\])?\s+\(([^:()]+):(\d+):\d+\)/g;
    let fm;
    while ((fm = fre.exec(rest)) !== null) {
      const fn = (fm[2] || fm[1]).replace(/^Object\./, '').replace(/^G\./, '');
      frames.push({ fn, file: fm[3], line: parseInt(fm[4], 10) });
    }
    // Drop the setter frame itself (fn 'set', or 'trust' via [as trust]);
    // writer is the next frame.
    const writer = frames.filter(f => !(f.fn === 'set' || f.fn === 'trust'));
    events.push({
      day: parseInt(m[1], 10), kind: m[2], other: m[3],
      before: parseInt(m[4], 10), after: parseInt(m[5], 10), delta: parseInt(m[6], 10),
      frames: writer,
    });
  }
  return events;
}

function parseDailyTrust(text) {
  // d<day> <kind> <other> trust=<n> formed=d<n> ...
  const series = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^d(\d+) (\S+) (\S+) trust=(-?\d+) /);
    if (!m) continue;
    const key = m[2] + '|' + m[3];
    (series[key] = series[key] || []).push({ day: parseInt(m[1], 10), trust: parseInt(m[4], 10) });
  }
  return series;
}

function analyzeSeed(evidir, prefix, seed) {
  const tsPath = path.join(evidir, `${prefix}-trustset-${seed}.txt`);
  const trPath = path.join(evidir, `${prefix}-trust-${seed}.txt`);
  const capPath = path.join(evidir, `${prefix}-capture-${seed}.txt`);
  const events = fs.existsSync(tsPath) ? parseTrustset(fs.readFileSync(tsPath, 'utf8')) : [];
  const series = fs.existsSync(trPath) ? parseDailyTrust(fs.readFileSync(trPath, 'utf8')) : {};
  const byLink = {};
  for (const e of events) {
    const key = e.kind + '|' + e.other;
    const L = (byLink[key] = byLink[key] || { kind: e.kind, other: e.other, events: [], byClass: {}, total: 0 });
    const cls = classify(e.frames, e.delta);
    e.cls = cls;
    L.events.push(e);
    L.byClass[cls] = (L.byClass[cls] || { n: 0, sum: 0 });
    L.byClass[cls].n += 1;
    L.byClass[cls].sum += e.delta;
    L.total += e.delta;
  }
  // Crisis-cycle pairing: a crisis-charge followed by a concede-gain on
  // the same link within 3 days counts as one conceded cycle (net -2).
  const out = { seed, links: [] };
  for (const key of Object.keys(byLink).sort()) {
    const L = byLink[key];
    let cycles = 0, cycleNet = 0, unpairedCharges = 0;
    const ev = L.events;
    const used = new Set();
    for (let i = 0; i < ev.length; i++) {
      if (ev[i].cls !== 'crisis-charge') continue;
      let j = -1;
      for (let k = i + 1; k < ev.length && ev[k].day <= ev[i].day + 3; k++) {
        if (!used.has(k) && ev[k].cls === 'concede-gain') { j = k; break; }
      }
      if (j >= 0) { cycles += 1; cycleNet += ev[i].delta + ev[j].delta; used.add(j); }
      else unpairedCharges += 1;
    }
    const s = series[key];
    const first = s && s.length ? s[0].trust : null;
    const last = s && s.length ? s[s.length - 1].trust : null;
    const seriesDelta = (first !== null && last !== null) ? last - first : null;
    // Endpoint check: the trustset's first before-value should equal the
    // daily series' first snapshot, and its last after-value the last one.
    // A delta DIFF with matching endpoints means the series started after
    // the link's first assignment (formation-day timing), not a lost event.
    const tsFirstBefore = ev.length ? ev[0].before : null;
    const tsLastAfter = ev.length ? ev[ev.length - 1].after : null;
    const lastEventDay = ev.length ? ev[ev.length - 1].day : null;
    const lastSeriesDay = s && s.length ? s[s.length - 1].day : null;
    const endpoints = (tsFirstBefore === first && tsLastAfter === last) ? 'ENDPOINTS-MATCH'
      : `endpoints ts ${tsFirstBefore}->${tsLastAfter} vs series ${first}->${last}`;
    // A delta DIFF whose last trustset event lands on/after the last daily
    // snapshot day is snapshot ordering (snapshot taken before the day's
    // final assignment, or the link's last day unsnapshotted), not a lost
    // event: the setter logs every assignment by construction.
    const timingNote = (seriesDelta !== null && seriesDelta !== L.total && lastEventDay !== null && lastSeriesDay !== null && lastEventDay >= lastSeriesDay)
      ? `TIMING (last event d${lastEventDay}, last snapshot d${lastSeriesDay})` : '';
    out.links.push({
      kind: L.kind, other: L.other, nEvents: ev.length,
      byClass: L.byClass, trustsetTotal: L.total,
      seriesFirst: first, seriesLast: last, seriesDelta,
      crosscheck: seriesDelta === null ? 'no-series' : (seriesDelta === L.total ? 'MATCH' : (timingNote || ('DIFF ' + (seriesDelta - L.total) + ' (' + endpoints + ')'))),
      crisisCycles: cycles, crisisCycleNet: cycleNet, unpairedCharges,
    });
  }
  // Capture scan: crisis announcements and whether -10 is named near them.
  let crisisLines = 0, crisisNamed = 0;
  if (fs.existsSync(capPath)) {
    const cap = fs.readFileSync(capPath, 'utf8').split('\n');
    const rx = /challenges the (covenant|charter)|speaker is dead|tests the (covenant|charter) in the chaos/;
    for (const line of cap) {
      if (rx.test(line)) {
        crisisLines += 1;
        if (/Trust -10|trust −10|trust -10/i.test(line)) crisisNamed += 1;
      }
    }
  }
  out.capture = { crisisAnnouncements: crisisLines, crisisAnnouncementsNamingMinus10: crisisNamed };
  return out;
}

function main() {
  const evidir = process.argv[2];
  const prefix = process.argv[3];
  const seeds = process.argv.slice(4).map(s => parseInt(s, 10));
  if (!evidir || !prefix || !seeds.length) {
    console.error('usage: node scripts/analyze-trustset-20261104.js <EVIDIR> <PREFIX> <seed...>');
    process.exit(1);
  }
  for (const seed of seeds) {
    const r = analyzeSeed(evidir, prefix, seed);
    console.log(`\n=== seed ${seed} ===`);
    console.log(`capture: crisis announcements=${r.capture.crisisAnnouncements}, naming -10=${r.capture.crisisAnnouncementsNamingMinus10}`);
    for (const L of r.links) {
      const classes = Object.entries(L.byClass).map(([c, v]) => `${c} ${v.n}x/${v.sum >= 0 ? '+' : ''}${v.sum}`).join(', ');
      console.log(`link ${L.kind} ${L.other}: events=${L.nEvents} trustsetTotal=${L.trustsetTotal >= 0 ? '+' : ''}${L.trustsetTotal} series ${L.seriesFirst}->${L.seriesLast} (${L.seriesDelta >= 0 ? '+' : ''}${L.seriesDelta}) [${L.crosscheck}] crisisCycles=${L.crisisCycles} (net ${L.crisisCycleNet}) unpairedCharges=${L.unpairedCharges}`);
      console.log(`    ${classes}`);
    }
  }
}
if (require.main === module) main();
module.exports = { parseTrustset, classify, analyzeSeed };
