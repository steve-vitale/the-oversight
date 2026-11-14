// analyze-holdrealm-b.js — classify the 5 confirm-band realm dissolutions
// (sim-holdrealm-b, prereg evidence/2026-11-14/sim-holdrealm-b-prereg.md).
// Reads the existing answercourt confirm corpus; no sims, no game changes.
// Usage: node scripts/analyze-holdrealm-b.js [--corpus <dir>] [--out <path>]
// Emits a JSON report + a human-readable per-dissolution dump to stdout.
'use strict';
const fs = require('fs');
const path = require('path');

const CONFIRM_DIR = 'evidence/2026-11-14/perseed-answercourt-confirm-b';
const PILOT_DIR = 'evidence/2026-11-14/perseed-answercourt-b';
const ARMED = 'competent-answercourt-b';
const DISSOLVE_RE = /realm came apart|world feed goes quiet/i;
const DRIFT_RE = /fire is drifting|bond with .* is cooling/i;

function loadSeed(dir, seed, policy) {
  const f = path.join(dir, `answercourt-b-s${seed}-${policy}-answercourt-${dir.includes('confirm') ? 'confirm-b' : 'b'}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function dissolutionDay(d) {
  for (let i = 1; i < d.series.length; i++) {
    if (d.series[i - 1].scale === 'national' && d.series[i].scale === 'regional') return d.series[i].d;
  }
  return null;
}

function nationalDay(d) {
  for (const r of d.series) if (r.scale === 'national') return r.d;
  return null;
}

// Trust trajectory per link id over a day window, from series linksRoll.
function linkTrustSeries(d, d0, d1) {
  const out = {}; // linkId -> {other, kind, rows: [{d, t, st, age, se}]}
  for (const r of d.series) {
    if (r.d < d0 || r.d > d1) continue;
    for (const l of (r.linksRoll || [])) {
      if (!out[l.id]) out[l.id] = { other: l.o, kind: l.k, rows: [] };
      out[l.id].rows.push({ d: r.d, t: l.t, st: l.st, age: l.age, se: l.se, pd: l.pd });
    }
  }
  return out;
}

function linesInWindow(d, d0, d1, re) {
  return (d.linkLines || []).filter(l => l.day >= d0 && l.day <= d1 && (!re || re.test(l.line)));
}

function deathsInWindow(d, d0, d1) {
  return (d.deaths || []).filter(x => x.day >= d0 && x.day <= d1);
}

function verbsInWindow(d, d0, d1) {
  return (d.verbEvents || []).filter(v => v.day >= d0 && v.day <= d1);
}

function classifyOne(seed, d) {
  const nat = nationalDay(d);
  const dis = dissolutionDay(d);
  if (dis == null) return { seed, dissolved: false, nationalDay: nat };
  const W = 14; // lookback window
  const d0 = dis - W, d1 = dis + 2;
  const lt = linkTrustSeries(d, d0, d1);
  const disLines = linesInWindow(d, dis - 1, dis + 1, DISSOLVE_RE);
  const driftLines = linesInWindow(d, d0, dis, DRIFT_RE);
  const deaths = deathsInWindow(d, d0, dis);
  const verbs = verbsInWindow(d, d0, dis);
  const winLines = linesInWindow(d, d0, dis);

  // Per-link: trust at dissolution-1, at dissolution day, min in window, crossings below 40.
  const links = [];
  for (const [id, info] of Object.entries(lt)) {
    const rows = info.rows;
    const atDis = rows.filter(r => r.d <= dis).pop();
    const atDisMinus1 = rows.filter(r => r.d <= dis - 1).pop();
    const before = rows.filter(r => r.d <= dis - 7);
    const minT = Math.min(...rows.map(r => r.t));
    const crossedBelow = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i - 1].t >= 40 && rows[i].t < 40) crossedBelow.push({ day: rows[i].d, from: rows[i - 1].t, to: rows[i].t });
    }
    links.push({
      id, other: info.other, kind: info.kind,
      trustAtDisMinus1: atDisMinus1 ? atDisMinus1.t : null,
      trustAtDis: atDis ? atDis.t : null,
      trust7dBefore: before.length ? before[before.length - 1].t : null,
      minInWindow: minT, crossedBelow40: crossedBelow,
      statusAtDis: atDis ? atDis.st : null,
      seasonedAtDis: atDis ? atDis.se : null,
    });
  }

  // Series rows around the dissolution: polity size, nSeasoned, pending beats.
  const seriesWin = d.series.filter(r => r.d >= d0 && r.d <= d1).map(r => ({
    d: r.d, scale: r.scale, nSeasoned: r.nSeasoned, nActive: r.nActive,
    polity: r.polity, pendingNational: r.pendingNational, pendingCounter: r.pendingCounter,
    pendingAccord: r.pendingAccord, pendingGlobal: r.pendingGlobal ? { day: r.pendingGlobal.day } : null,
    nationalLive: r.nationalLive, pop: r.pop, pantry: r.pantry, feasts: r.feasts,
  }));

  // Mechanism evidence, in the prereg vocabulary.
  const evidence = { speakerDeath: [], trustSlide: [], linkBreak: [], feastMourning: [], pendingStall: [] };
  // Speaker/leader death: a death line "the dead hold no treaties" or mantle transfer in the window.
  for (const l of winLines) {
    if (/dead hold no treaties|mantle just\.\.\. transfers|is dead — and the dead/i.test(l.line)) {
      evidence.speakerDeath.push({ day: l.day, line: l.line.slice(0, 220) });
    }
    if (/struck .* in the night|fed in the night|Raid —/i.test(l.line)) {
      evidence.trustSlide.push({ day: l.day, kind: 'hostile-event', line: l.line.slice(0, 200) });
    }
    if (/presses the tribute down|test the link/i.test(l.line)) {
      evidence.feastMourning.push({ day: l.day, kind: 'succession-tribute-press', line: l.line.slice(0, 200) });
    }
  }
  for (const l of links) {
    for (const c of l.crossedBelow40) evidence.trustSlide.push({ day: c.day, kind: 'crossed-below-40', other: l.other, from: c.from, to: c.to });
    if (l.statusAtDis && l.statusAtDis !== 'active') evidence.linkBreak.push({ other: l.other, status: l.statusAtDis });
  }
  for (const v of verbs) {
    if (/break|sever|refus/i.test(v.verb)) evidence.linkBreak.push({ day: v.day, verb: v.verb, other: v.other });
  }
  // Pending-beat stall: a national beat pending for a long stretch before dissolution.
  const pendDays = d.series.filter(r => r.d < dis && r.pendingNational).length;
  if (pendDays > 0) evidence.pendingStall.push({ pendingNationalDaysBeforeDissolution: pendDays });

  // Classification: primary mechanism = the proximate trigger visible in the window.
  let mechanism = 'UNCLASSIFIED';
  let mechanismDetail = '';
  const speakerDeathDay = evidence.speakerDeath.length ? evidence.speakerDeath[0].day : null;
  const crossed = evidence.trustSlide.filter(e => e.kind === 'crossed-below-40');
  if (speakerDeathDay != null && crossed.some(c => c.day === speakerDeathDay || c.day === speakerDeathDay + 1)) {
    mechanism = 'speaker-death';
    mechanismDetail = `Leader/speaker died day ${speakerDeathDay}; the succession haircut pushed a link below the seasoned trust-40 bar the same day.`;
  } else if (crossed.length) {
    mechanism = 'trust-slide';
    mechanismDetail = `Link(s) crossed below trust 40 in the window: ${crossed.map(c => `${c.other} d${c.day} ${c.from}->${c.to}`).join('; ')}.`;
  } else if (evidence.linkBreak.length) {
    mechanism = 'link-break';
    mechanismDetail = JSON.stringify(evidence.linkBreak);
  } else if (evidence.pendingStall.length && evidence.pendingStall[0].pendingNationalDaysBeforeDissolution >= 14) {
    mechanism = 'pending-beat-stall';
    mechanismDetail = `National beat pending ${evidence.pendingStall[0].pendingNationalDaysBeforeDissolution}d before dissolution.`;
  }

  return {
    seed, dissolved: true, nationalDay: nat, dissolutionDay: dis, heldDays: dis - nat,
    endReason: d.endReason, endDay: d.days, maxWave: d.maxWave, standing: d.standing,
    mechanism, mechanismDetail, evidence, links, seriesWin,
    dissolutionLines: disLines.map(l => ({ day: l.day, line: l.line.slice(0, 300) })),
    driftLines: driftLines.map(l => ({ day: l.day, line: l.line.slice(0, 200) })),
    deathsInWindow: deaths, verbsInWindow: verbs.map(v => ({ day: v.day, verb: v.verb, other: v.other })),
    linkLinesCapHit: (d.linkLines || []).length >= 600,
    linkLinesLastDay: (d.linkLines || []).length ? Math.max(...d.linkLines.map(l => l.day)) : null,
  };
}

// Re-climb analysis for a seed that dissolved while the village lived on:
// trust trajectory per link from dissolution to end, links still active,
// any tend/propose/answer beats after dissolution, pendingNational re-staged?
function reclimb(seed, d) {
  const dis = dissolutionDay(d);
  if (dis == null) return null;
  const lt = linkTrustSeries(d, dis, d.days);
  const links = Object.entries(lt).map(([id, info]) => {
    const rows = info.rows;
    const end = rows[rows.length - 1];
    const maxAfter = Math.max(...rows.map(r => r.t));
    const everBack40 = rows.some(r => r.t >= 40);
    const lastAbove40 = rows.filter(r => r.t >= 40).pop();
    return {
      id, other: info.other, kind: info.kind,
      trustAtDissolution: rows[0] ? rows[0].t : null,
      trustAtEnd: end ? end.t : null, maxAfterDissolution: maxAfter,
      everBackAbove40: everBack40, lastDayAbove40: lastAbove40 ? lastAbove40.d : null,
      statusAtEnd: end ? end.st : null, seasonedAtEnd: end ? end.se : null,
    };
  });
  const afterVerbs = (d.verbEvents || []).filter(v => v.day > dis).map(v => ({ day: v.day, verb: v.verb, other: v.other }));
  const pendingAfter = d.series.filter(r => r.d > dis && r.pendingNational).map(r => r.d);
  const nationalAfter = d.series.some(r => r.d > dis && r.scale === 'national');
  const tendAfter = afterVerbs.filter(v => /tendLink|proposeLink|answerNational|answerAccord/.test(v.verb));
  const allAbove40AtEnd = links.length > 0 && links.every(l => (l.trustAtEnd || 0) >= 40 && l.statusAtEnd === 'active');
  let blocker = 'UNNAMED';
  let blockerDetail = '';
  if (nationalAfter) { blocker = 'none-reclimbed'; blockerDetail = 'Scale returned to national after dissolution.'; }
  else if (!links.length || links.every(l => l.statusAtEnd !== 'active')) {
    blocker = 'links-gone'; blockerDetail = 'No active links left to re-climb with.';
  } else if (!allAbove40AtEnd) {
    const low = links.filter(l => (l.trustAtEnd || 0) < 40 || l.statusAtEnd !== 'active');
    blocker = 'trust-below-bar';
    blockerDetail = `At day ${d.days} these links sit below the seasoned trust-40 bar or inactive: ${low.map(l => `${l.other} t=${l.trustAtEnd} st=${l.statusAtEnd}`).join('; ')}. Re-climb needs every polity link back at 40+ (30d seasoned). Only ${d.days - dis} days of horizon remained after the dissolution.`;
  } else if (!tendAfter.length) {
    blocker = 'no-tending';
    blockerDetail = 'All links are back above 40 but no tend/propose/answer beat was played after dissolution — the re-climb was never attempted.';
  } else if (!pendingAfter.length) {
    blocker = 'beat-never-restaged';
    blockerDetail = 'Tending happened but the national beat never re-staged (pendingNational never re-appears after dissolution).';
  } else {
    blocker = 'beat-pending-unanswered';
    blockerDetail = `National beat re-staged on days ${pendingAfter.slice(0, 8).join(',')} but never answered.`;
  }
  return { seed, dissolutionDay: dis, endDay: d.days, links, tendOrAnswerAfter: tendAfter, pendingNationalDaysAfter: pendingAfter, nationalAfter, blocker, blockerDetail };
}

// ---- DEEP DIVE (added after the first classification pass) ----
// Per-link daily trust deltas in the dissolution window, aligned with deaths.
// A -8 on 2+ links the same day is the succession-haircut signature
// (hierarchy.js: onLeaderDeath costs every link -8 + a 7-day mourning gag);
// a -5 is a herald strike or renegotiation push; -6/week is tribute arrears.
function trustDeltas(d, d0, d1) {
  const perLink = {};
  let prev = null;
  for (const r of d.series) {
    if (r.d < d0 - 1 || r.d > d1) continue;
    const cur = {};
    for (const l of (r.linksRoll || [])) cur[l.id] = { t: l.t, ar: l.ar, tw: l.tw, st: l.st, se: l.se, other: l.o };
    if (prev) {
      for (const [id, c] of Object.entries(cur)) {
        const p = prev[id];
        if (!p || c.t === p.t) continue;
        if (Math.abs(c.t - p.t) >= 4) {
          (perLink[id] = perLink[id] || { other: c.other, deltas: [] }).deltas.push({
            day: r.d, from: p.t, to: c.t, delta: c.t - p.t, arrears: c.ar, tendedWeek: c.tw,
          });
        }
      }
    }
    prev = cur;
  }
  return perLink;
}

// First day after national day on which the polity stopped qualifying
// (polity null, or size < 4, or nSeasoned < 3) vs the dissolution day.
// The gap is the life support the pending beat (usually pendingGlobal) bought.
function polityLossDay(d, nat) {
  for (const r of d.series) {
    if (r.d <= nat) continue;
    if (!r.polity || r.polity.size < 4 || r.nSeasoned < 3) return r.d;
  }
  return null;
}

function deepDive(seed, d, c) {
  const dis = c.dissolutionDay;
  const d0 = dis - 14, d1 = dis + 2;
  const deltas = trustDeltas(d, d0, d1);
  const ploss = polityLossDay(d, c.nationalDay);
  // Simultaneous -8 drops: same day, 2+ links, delta exactly -8.
  const dayDrops = {};
  for (const info of Object.values(deltas)) {
    for (const x of info.deltas) {
      if (x.delta === -8) (dayDrops[x.day] = dayDrops[x.day] || []).push(info.other);
    }
  }
  const simHaircuts = Object.entries(dayDrops).filter(([, v]) => v.length >= 2).map(([day, others]) => ({
    day: +day, links: others,
    deathsThatDay: (d.deaths || []).filter(x => x.day === +day || x.day === +day - 1).map(x => ({ day: x.day, who: x.who, cause: x.cause })),
  }));
  // Trigger: verified speaker-death line > probable succession (simultaneous
  // -8-style drops on 2+ links the same day, aligned with a villager death
  // that day, funeral lines uncaptured) > succession-wounded-then-erosion
  // (a death earlier in the window left the polity wounded; a later small
  // push finished it) > slow erosion.
  let trigger = 'slow-erosion';
  let triggerDetail = 'No single-day -8 signature and no speaker-death line; trust bled down over weeks (tribute arrears / herald / raid decrements against too-rare tends).';
  const deathLineDays = c.evidence.speakerDeath.map(e => e.day);
  const proximateDeath = deathLineDays.some(dd => dd >= dis - 1 && dd <= dis);
  // Simultaneous haircut-sized drops on 2+ links on one day in [dis-1, dis],
  // with a villager death that day or the day before: the succession-haircut
  // signature. A drop normalizes to the -8 haircut when it is -8/-7 (haircut,
  // or haircut + a same-day +1 tribute tick) or -13/-12 (haircut + a -5
  // herald strike the same day, with or without the +1).
  const dayDrops2 = {};
  const normHaircut = (dl) => (dl === -8 || dl === -7) ? -8 : (dl === -13 || dl === -12) ? -8 : null;
  for (const info of Object.values(deltas)) {
    for (const x of info.deltas) {
      if (x.day >= dis - 1 && x.day <= dis && normHaircut(x.delta) != null) {
        (dayDrops2[x.day] = dayDrops2[x.day] || []).push({ other: info.other, delta: x.delta });
      }
    }
  }
  let proxHaircut = null;
  for (const [day, drops] of Object.entries(dayDrops2)) {
    if (drops.length >= 2) {
      // Deaths on those days, unfiltered: the simultaneous drop is the
      // signature; the deaths are supporting context (a villager death
      // among them is the succession trigger — monster vs villager names
      // are not reliably separable in this corpus, so they are listed).
      const deaths = (d.deaths || []).filter(x => x.day === +day || x.day === +day - 1);
      if (deaths.length) proxHaircut = { day: +day, drops, deaths: deaths.map(x => ({ day: x.day, who: x.who, cause: x.cause })) };
    }
  }
  if (proximateDeath) {
    trigger = 'speaker-death-verified';
    triggerDetail = `Funeral lines captured on the dissolution day: "${c.evidence.speakerDeath[0].line.slice(0, 120)}"`;
  } else if (proxHaircut) {
    trigger = 'probable-succession';
    triggerDetail = `Simultaneous ${proxHaircut.drops.map(x => x.delta).join('/')} drops on ${proxHaircut.drops.map(x => x.other).join(', ')} d${proxHaircut.day} with villager death(s) ${proxHaircut.deaths.map(x => `d${x.day} ${x.who}`).join(', ')} — the succession-haircut signature (each drop is the -8 haircut, netted with a same-day +1 tribute tick and/or a -5 herald strike), but the funeral lines are NOT captured (linkLines cap already hit), so this is inference from the series, not a voiced line.`;
  } else if (deathLineDays.length) {
    trigger = 'succession-wounded-then-erosion';
    triggerDetail = `A speaker died d${deathLineDays[0]} (funeral lines captured) — the -8 haircut left the polity wounded (a link below the bar, another at the bar) — but the realm limped on ${dis - deathLineDays[0]} more days before a small push finished it. The death set it up; erosion finished it.`;
  }
  // Re-climb path (for seeds that returned to national): what the policy did.
  let reclimbPath = null;
  if (c.dissolved) {
    const back = d.series.find(r => r.d > dis && r.scale === 'national');
    if (back) {
      reclimbPath = {
        backDay: back.d, daysDown: back.d - dis,
        verbs: (d.verbEvents || []).filter(v => v.day > dis && v.day <= back.d).map(v => ({ day: v.day, verb: v.verb, other: v.other })),
      };
    }
  }
  // Post-dissolution tending: did tendedWeek advance on any link after the fall?
  const postTw = [];
  if (c.endReason === 'survived') {
    for (const r of d.series) {
      if (r.d <= dis) continue;
      for (const l of (r.linksRoll || [])) {
        const key = l.id + ':' + l.tw;
        if (!postTw.includes(key) && l.tw != null && l.tw > 0) postTw.push(key);
      }
    }
  }
  return { seed, trigger, triggerDetail, polityLossDay: ploss, graceDays: ploss != null ? dis - ploss : null, trustDeltas: deltas, simHaircuts, reclimbPath, postDissolutionTendedWeeks: postTw };
}

function wallNumbers(dir, seeds, policy) {  let national = 0, table = 0, wins = 0, w4 = 0, w5 = 0, surv = [];
  for (const s of seeds) {
    const d = loadSeed(dir, s, policy);
    if (!d) continue;
    if (d.series.some(r => r.scale === 'national')) national++;
    if (d.won) wins++;
    if ((d.tableState && d.tableState.seat) || (d.seatTakes || []).length) table++;
    if (d.maxWave >= 4) w4++;
    if (d.maxWave >= 5) w5++;
    surv.push(d.days);
  }
  surv.sort((a, b) => a - b);
  const med = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  return { n: seeds.length, national, table, wins, wave4: w4, wave5: w5, medianSurvival: med, maxSurvival: surv.length ? surv[surv.length - 1] : null };
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
  const confirmSeeds = [];
  for (let s = 100201; s <= 100216; s++) confirmSeeds.push(String(s));
  const report = { arm: 'sim-holdrealm-b', corpus: 'answercourt-confirm-b', policy: ARMED, dissolutions: [], reclimbs: [], pilotDissolutions: [], wall: {} };

  for (const s of confirmSeeds) {
    const d = loadSeed(CONFIRM_DIR, s, ARMED);
    if (!d) { console.log(`seed ${s}: MISSING`); continue; }
    const c = classifyOne(s, d);
    report.dissolutions.push(c);
    if (c.dissolved && c.endReason === 'survived') report.reclimbs.push(reclimb(s, d));
  }
  // Pilot band as a secondary check (does not enter the GO bar).
  for (let s = 100101; s <= 100108; s++) {
    const d = loadSeed(PILOT_DIR, String(s), ARMED);
    if (!d) continue;
    const c = classifyOne(String(s), d);
    if (c.dissolved) report.pilotDissolutions.push(c);
  }
  report.wall = { armed: wallNumbers(CONFIRM_DIR, confirmSeeds, ARMED), baseline: wallNumbers(CONFIRM_DIR, confirmSeeds, 'competent-scaleclimb-b') };
  report.deepDive = [];
  for (const c of report.dissolutions) {
    if (!c.dissolved) continue;
    const d = loadSeed(CONFIRM_DIR, c.seed, ARMED);
    report.deepDive.push(deepDive(c.seed, d, c));
  }
  for (const c of report.pilotDissolutions) {
    const d = loadSeed(PILOT_DIR, c.seed, ARMED);
    if (d) {
      report.deepDive.push(deepDive(c.seed, d, c));
      if (c.endReason === 'survived') report.reclimbs.push(reclimb(c.seed, d));
    }
  }
  report.unclassified = report.dissolutions.filter(x => x.dissolved && x.mechanism === 'UNCLASSIFIED').map(x => x.seed);
  report.go = report.unclassified.length === 0 && report.reclimbs.every(r => r.blocker !== 'UNNAMED');

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const tmp = outPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(report, null, 2));
    const back = fs.readFileSync(tmp, 'utf8');
    if (back.length < 100) throw new Error('analyzer output suspiciously short');
    fs.renameSync(tmp, outPath);
  }

  for (const c of report.dissolutions) {
    if (!c.dissolved) { console.log(`\n== seed ${c.seed}: never dissolved (reached national day ${c.nationalDay})`); continue; }
    console.log(`\n== seed ${c.seed}: national d${c.nationalDay} -> dissolved d${c.dissolutionDay} (held ${c.heldDays}d), village ${c.endReason} d${c.endDay}`);
    console.log(`   MECHANISM: ${c.mechanism} — ${c.mechanismDetail}`);
    console.log(`   links at dissolution: ${c.links.map(l => `${l.other} t=${l.trustAtDis} (7d before ${l.trust7dBefore}, min ${l.minInWindow}, crossed<40: ${l.crossedBelow40.map(x => 'd' + x.day).join(',') || 'never'}) st=${l.statusAtDis} se=${l.seasonedAtDis}`).join(' | ')}`);
    console.log(`   polity/nSeasoned d-1,d,d+1: ${c.seriesWin.filter(r => r.d >= c.dissolutionDay - 1 && r.d <= c.dissolutionDay + 1).map(r => `d${r.d}: size=${r.polity ? r.polity.size : '?'} nSeas=${r.nSeasoned} pendNat=${r.pendingNational ? 'Y' : 'n'} pendGlob=${r.pendingGlobal ? 'Y' : 'n'} natLive=${r.nationalLive}`).join(' | ')}`);
    console.log(`   deaths in window: ${c.deathsInWindow.map(x => `d${x.day} ${x.who || x.kind} (${x.cause || ''})`).join('; ') || 'none'}`);
    console.log(`   verbs in window: ${c.verbsInWindow.map(v => `d${v.day} ${v.verb}${v.other ? ' ' + v.other : ''}`).join('; ') || 'none'}`);
    console.log(`   dissolution lines captured: ${c.dissolutionLines.length}; drift warnings: ${c.driftLines.length}; linkLines cap hit: ${c.linkLinesCapHit} (last captured day ${c.linkLinesLastDay})`);
    for (const l of c.dissolutionLines) console.log(`     d${l.day}: ${l.line}`);
  }
  for (const r of report.reclimbs) {
    console.log(`\n== RE-CLIMB seed ${r.seed}: dissolved d${r.dissolutionDay}, lived to d${r.endDay}`);
    console.log(`   BLOCKER: ${r.blocker} — ${r.blockerDetail}`);
    console.log(`   links after: ${r.links.map(l => `${l.other} t@${r.dissolutionDay}=${l.trustAtDissolution} -> t@end=${l.trustAtEnd} (max ${l.maxAfterDissolution}, last>=40 d${l.lastDayAbove40}) st=${l.statusAtEnd}`).join(' | ')}`);
    console.log(`   tend/answer beats after dissolution: ${r.tendOrAnswerAfter.map(v => `d${v.day} ${v.verb}`).join('; ') || 'NONE'}`);
    console.log(`   pendingNational days after dissolution: ${r.pendingNationalDaysAfter.length ? r.pendingNationalDaysAfter.join(',') : 'NONE'}`);
  }
  for (const dd of report.deepDive) {
    console.log(`\n== DEEP seed ${dd.seed}: TRIGGER ${dd.trigger} — ${dd.triggerDetail}`);
    console.log(`   polity first failed d${dd.polityLossDay} (dissolution d${report.dissolutions.concat(report.pilotDissolutions).find(c => c.seed === dd.seed)?.dissolutionDay}); grace bought by pending beat: ${dd.graceDays}d`);
    for (const [id, info] of Object.entries(dd.trustDeltas)) {
      console.log(`   ${info.other}: ${info.deltas.map(x => `d${x.day} ${x.from}->${x.to} (${x.delta >= 0 ? '+' : ''}${x.delta}, arrears ${x.arrears})`).join('; ')}`);
    }
    if (dd.reclimbPath) console.log(`   RE-CLIMBED d${dd.reclimbPath.backDay} after ${dd.reclimbPath.daysDown}d down; verbs while down: ${dd.reclimbPath.verbs.map(v => `d${v.day} ${v.verb}${v.other ? ' ' + v.other : ''}`).join('; ') || 'NONE'}`);
    if (dd.postDissolutionTendedWeeks.length) console.log(`   tendedWeeks seen after dissolution: ${dd.postDissolutionTendedWeeks.join(', ')}`);
  }
  console.log(`\n== PILOT dissolutions: ${report.pilotDissolutions.map(c => `${c.seed} d${c.dissolutionDay} ${c.mechanism}`).join('; ') || 'none'}`);
  console.log(`== WALL armed: ${JSON.stringify(report.wall.armed)}`);
  console.log(`== WALL baseline: ${JSON.stringify(report.wall.baseline)}`);
  console.log(`== UNCLASSIFIED: ${report.unclassified.join(',') || 'none'} — GO=${report.go}`);
}

if (require.main === module) main();
module.exports = { classifyOne, deepDive, reclimb, dissolutionDay, nationalDay, loadSeed };
