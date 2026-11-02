#!/usr/bin/env node
// trustbleed-analyze-20261101.js — DIAG ONLY. Recomputes the
// sim-trustbleed-a verdict from per-seed corpus files (the trustbleed
// objects printed by scripts/trustbleed-replay-20261101.js).
// Usage: node scripts/trustbleed-analyze-20261101.js <corpus-dir-or-glob...>
// Prints one JSON object: { seeds: [...], verdict: {...} }.
// Attribution rule (per link, per consecutive-day trust delta):
//  1. a same-day link.history note naming a signed trust amount equal
//     to the delta -> that history kind;
//  2. else any same-day history entry -> its kind;
//  3. else a same-day trust say-line naming a matching signed amount
//     -> its keyword class (hungry=muster-hunger, REFUSES=call-refusal,
//     struck=titan-strike, fell=ally-death, walk home=break-muster,
//     tribute=tribute, aid=aid, otherwise say-trust);
//  4. else unattributed (counted honestly; census completeness is the
//     instrument GO gate in the prereg).
'use strict';
const fs = require('fs');
const path = require('path');

function loadCorpus(paths) {
  const out = [];
  for (const p of paths) {
    let st;
    try { st = fs.statSync(p); } catch (e) { continue; }
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p).sort()) {
        if (!/\.json$/.test(f)) continue;
        try { out.push(JSON.parse(fs.readFileSync(path.join(p, f), 'utf8'))); } catch (e) {}
      }
    } else {
      const txt = fs.readFileSync(p, 'utf8').trim();
      for (const line of txt.split('\n')) {
        if (!line.trim()) continue;
        try { const o = JSON.parse(line); out.push(o.trustbleed || o); } catch (e) {}
      }
    }
  }
  return out;
}

function sayClass(line) {
  const l = (line || '').toLowerCase();
  if (/muster is hungry/.test(l)) return 'muster-hunger';
  if (/refuses/.test(l)) return 'call-refusal';
  if (/struck .* in the night/.test(l)) return 'titan-strike';
  if (/goes down|fell at/.test(l)) return 'ally-death';
  if (/walk.*home thinner/.test(l)) return 'break-muster';
  if (/tribute/.test(l)) return 'tribute';
  if (/\baid\b/.test(l)) return 'aid';
  if (/turn/.test(l) && /coalition/.test(l)) return 'turn';
  return 'say-trust';
}

function amountIn(text) {
  if (!text) return null;
  const m = String(text).match(/[Tt]rust\s*[−\-–]\s*(\d+)|[Tt]rust\s*\+\s*(\d+)|\(trust\s*[−\-–](\d+)/);
  if (!m) return null;
  if (m[1] != null) return -parseInt(m[1], 10);
  if (m[2] != null) return parseInt(m[2], 10);
  if (m[3] != null) return -parseInt(m[3], 10);
  return null;
}

function voiceOnly(h) {
  if (!h) return false;
  if (h.kind === 'drift') return true; // _trustDriftWatch only says + notes; it writes no trust.
  if (/priced in/i.test(h.note || '')) return true; // grief-priced-in note: no trust write.
  return false;
}

function analyzeSeed(tb) {
  const att = tb.heraldAttempts || [];
  const firstRef = att.find(a => a.cls === 'REFUSED');
  const firstRefDay = firstRef ? firstRef.day : null;
  const firstContactDay = att.length ? att[0].day : null;
  const linesByDay = {};
  for (const tl of (tb.trustLines || [])) (linesByDay[tl.day] = linesByDay[tl.day] || []).push(tl.line);
  const callLinesByDay = {};
  for (const cl of (tb.callLines || [])) (callLinesByDay[cl.day] = callLinesByDay[cl.day] || []).push(cl.line);

  // Group series rows by link id (fall back to villageId).
  const byLink = {};
  for (const row of (tb.series || [])) {
    for (const l of (row.links || [])) {
      const key = l.id || l.villageId || 'unknown';
      (byLink[key] = byLink[key] || []).push({ day: row.day, link: l });
    }
  }
  const links = [];
  let totalAbs = 0, unattAbs = 0, totalDeltas = 0, unattDeltas = 0;
  const causeMove = {};
  function addCause(c, d) {
    causeMove[c] = causeMove[c] || { up: 0, down: 0, n: 0 };
    if (d > 0) causeMove[c].up += d; else causeMove[c].down += d;
    causeMove[c].n++;
  }

  for (const key of Object.keys(byLink)) {
    const rows = byLink[key].sort((a, b) => a.day - b.day);
    const first = rows[0].link;
    const name = first.name, villageId = first.villageId;
    let pre = null;
    if (firstRefDay != null) {
      const before = rows.filter(r => r.day < firstRefDay);
      pre = before.length ? before[before.length - 1].link.trust : rows[0].link.trust;
    } else pre = rows[0].link.trust;
    const preTrusted = (pre != null && pre >= 70);
    const deltas = [];
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1], cur = rows[i];
      const pt = prev.link.trust, ct = cur.link.trust;
      if (pt == null || ct == null || ct === pt) continue;
      const d = ct - pt;
      totalAbs += Math.abs(d); totalDeltas++;
      const hist = cur.link.historyNew || [];
      const effHist = hist.filter(h => !voiceOnly(h));
      const dayLines = (linesByDay[cur.day] || []).concat(callLinesByDay[cur.day] || []);
      // Raid lines carry their own "(Trust -10.)" but name the RAIDER, and
      // on observe days a raider-link shows zero delta on raid days — raid
      // trust is not link trust. Never let a raid line claim a link delta.
      const claimLines = dayLines.filter(l => !/raid —/i.test(l));
      const hungerLine = dayLines.some(l => /muster is hungry/i.test(l));
      const foodLine = dayLines.some(l => /accept .* food/i.test(l) && /Trust \+4/.test(l));
      let cause = null, how = null;
      const amtHist = effHist.find(h => amountIn(h.note) === d);
      if (amtHist) { cause = amtHist.kind || 'history'; how = 'history-amount'; }
      else if (hungerLine && (cur.link.musterAllies || 0) > 0 && d === -2) { cause = 'muster-hunger'; how = 'hunger-metronome'; }
      else if (hungerLine && foodLine && d === 2) { cause = 'muster-hunger+food-accept'; how = 'composite-verified'; }
      else {
        const amtLine = claimLines.find(l => amountIn(l) === d);
        if (amtLine) { cause = sayClass(amtLine); how = 'say-amount'; }
        else if (effHist.length) { cause = effHist[0].kind || 'history'; how = 'history-kind'; }
      }
      if (!cause) { cause = 'unattributed'; how = 'none'; unattAbs += Math.abs(d); unattDeltas++; }
      addCause(cause, d);
      deltas.push({ fromDay: prev.day, toDay: cur.day, from: pt, to: ct, delta: d, cause, how,
        history: hist.map(h => h.kind + ':' + h.note), sayLines: dayLines.filter(l => /trust/i.test(l)).slice(0, 3) });
    }
    // Trusted-tier recovery: dip below tier after first refusal, then re-reach.
    let dipped = false, dippedDay = null, recoveryDay = null, recoveryTrust = null;
    let belowPre = false, preReReachDay = null;
    if (firstRefDay != null) {
      for (const r of rows) {
        if (r.day < firstRefDay) continue;
        const trusted = (r.link.trust >= 70 && (r.link.opinion || 0) >= 10);
        if (!dipped && !trusted) { dipped = true; dippedDay = r.day; }
        if (dipped && trusted && recoveryDay == null) { recoveryDay = r.day; recoveryTrust = r.link.trust; }
        if (r.link.trust != null && pre != null && r.link.trust < pre) belowPre = true;
        if (belowPre && r.link.trust != null && pre != null && r.link.trust >= pre && preReReachDay == null) preReReachDay = r.day;
      }
    }
    const last = rows[rows.length - 1].link;
    const row130 = rows.filter(r => r.day <= 130);
    const at130 = row130.length ? row130[row130.length - 1].link.trust : null;
    const lastSeenDay = rows[rows.length - 1].day;
    const dissolved = last.status !== 'active';
    links.push({ id: key, villageId, name, kind: first.kind, firstSeenDay: rows[0].day,
      lastSeenDay, status: last.status, dissolved, preRefusalTrust: pre, preTrusted,
      finalTrust: last.trust, trustAt130: at130,
      netTo130: (pre != null && at130 != null) ? at130 - pre : null,
      netToEnd: (pre != null && last.trust != null) ? last.trust - pre : null,
      dipped, dippedDay, recoveryDay, recoveryTrust, preReReachDay, deltas });
  }
  const recoveryLinks = links.filter(l => l.recoveryDay != null);
  return { seed: tb.seed, mode: tb.mode, firstContactDay, firstRefusalDay: firstRefDay,
    heraldAttempts: att.length, heraldRefused: att.filter(a => a.cls === 'REFUSED').length,
    heraldFought: att.filter(a => a.cls === 'FOUGHT').length,
    sounded: !!(tb.post && tb.post.sounded), soundDay: tb.post ? tb.post.day : null,
    soundedAllies: tb.post ? tb.post.actualAllies : null,
    links, causeMove, totalAbs, unattAbs, totalDeltas, unattDeltas,
    unattShare: totalAbs ? unattAbs / totalAbs : 0,
    recoveryLinks: recoveryLinks.length,
    maxWave: tb.maxWave, wave5: tb.wave5, national: tb.national, table: tb.table,
    won: tb.won, days: tb.gameDays, endReason: tb.endReason,
    instrumentErrors: tb.instrumentErrors || [], musterErrs: tb.musterErrs || 0 };
}

function main() {
  const paths = process.argv.slice(2);
  if (!paths.length) { console.error('usage: trustbleed-analyze-20261101.js <corpus...>'); process.exit(2); }
  const corpora = loadCorpus(paths);
  const seeds = corpora.map(analyzeSeed);
  const observe = seeds.filter(s => s.mode === 'observe');
  const recoverySeeds = observe.filter(s => s.recoveryLinks > 0);
  const totalAbs = seeds.reduce((s, x) => s + x.totalAbs, 0);
  const unattAbs = seeds.reduce((s, x) => s + x.unattAbs, 0);
  const verdict = {
    recoveryExists: recoverySeeds.length >= 2,
    recoverySeeds: recoverySeeds.map(s => s.seed),
    censusComplete: totalAbs ? (unattAbs / totalAbs) <= 0.10 : false,
    unattShare: totalAbs ? unattAbs / totalAbs : null,
    instrumentClean: seeds.every(s => s.instrumentErrors.length === 0 && s.musterErrs === 0),
  };
  verdict.instrumentGO = verdict.censusComplete && verdict.instrumentClean;
  console.log(JSON.stringify({ seeds, verdict }, null, 2));
}
if (require.main === module) main();
module.exports = { analyzeSeed, loadCorpus };
