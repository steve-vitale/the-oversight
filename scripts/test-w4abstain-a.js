#!/usr/bin/env node
// scripts/test-w4abstain-a.js — proof validator + analyzer for
// sim-w4abstain-a (scale-onramp axis, 2026-10-27, DIAG ONLY).
//
// Reads one corpus dir of test-w4abstain-a-sweep.js rows
// (perseed-w4abstain-a/s<seed>.json + summary.json + detgate.json)
// and checks the pre-registered gates, then prints the census
// tables. Pure analysis: no harness, no RNG, no game state —
// re-runnable over the same corpus with identical output.
//
// HARD GATES (exit 1 on failure): G1 corpus integrity, G2
// veterans recompute, G3 fate recompute, G4 peak/end recompute,
// G5 demand vs live code, G6 substrate-activation gate, G7
// activation gate (player w4 strikes 0 AND player w4 kills 0),
// G9 daily series, G10 det-gate agreement.
// VERDICT LEGS (printed, judged in evidence): (a) 8/8 configs
// valid, (b) activation gate passes, (c) >= 95% of wave-4
// arrivals classified, (d) villager kill/fight counts with killer
// identities + sense read (sense runs separately via
// test-w4abstain-a-sense.js; the validator checks the counts).
//
// ARRIVAL / OUTCOME definitions (from the prereg, same vocabulary
// as sim-w4funnel-a): ARRIVAL = one wave-4 world-monster birth
// (oldcore birth joined to its spawnsrc spawn on seq). OUTCOME
// classes, in precedence order: still-present (seq in final
// present list, or in any daily snapshot dated after its last
// removal) > pending-in-fight (seq in pendingLifts at run end) >
// last removal kind mapped (below) > unknown (no removal + not
// present + not pending = vanished). KNOWN = outcome not unknown
// and not pending-in-fight. FOUGHT (arrival) = at least one
// defwound resolve row or oldcore tbEnd for the seq.
// KILL CHANNELS for waveKillLog w == 4 entries: by == scholar
// -> player-TB (must join a nonworldkill TB end row's newLog,
// which names the door); by == villager vid -> villager:via;
// by == null -> not-counted (never attributed).
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyStart } = require('./policies/nonworldkill-diag');

const KILL_KINDS = {
  'player-fight-kill': 'killed-by-player-fight',
  'villager-fight-kill': 'killed-by-villager-fight',
  'raid-defense-kill': 'killed-by-defender-fight',
  'aid-crisis-kill': 'killed-other-cause',
  'trap-capture': 'killed-other-cause',
  'scripted-clear': 'killed-other-cause',
  'raid-lingerer-sortie-kill': 'killed-other-cause',
  'departure-lost-trail': 'departed',
  'departure-watched-away': 'departed',
  'monsterTurn-departure': 'departed',
  'fled-record': 'fled-record',
  'player-fight-melt': 'melted',
};
function mapOutcomeKind(kind) {
  if (!kind) return 'unknown';
  if (KILL_KINDS[kind]) return KILL_KINDS[kind];
  return 'unknown';
}
function isKillOutcome(outcome) {
  return outcome === 'killed-by-player-fight' || outcome === 'killed-by-villager-fight'
    || outcome === 'killed-by-defender-fight' || outcome === 'killed-other-cause';
}
function overflowBad(ov) {
  if (!ov || typeof ov !== 'object') return false;
  return Object.values(ov).some(v => (typeof v === 'number') && v > 0);
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function analyzeArrivals(row) {
  const rec = row.recorders || {};
  const spawns = ((rec.spawnsrc || {}).spawns || []).filter(s => (s.wave | 0) === 4);
  const births = ((rec.oldcore || {}).births || []).filter(b => (b.wave | 0) === 4);
  const removals = ((rec.oldcore || {}).removals || []).filter(r => (r.wave | 0) === 4);
  const tbEnds = ((rec.oldcore || {}).tbEnds || []).filter(t => (t.wave | 0) === 4);
  const resolve = ((rec.defwound || {}).resolveFights || []).filter(f => (f.wave | 0) === 4);
  const finalPresent = ((rec.oldcore || {}).finalPresent || []).filter(p => (p.wave | 0) === 4);
  const pending = ((rec.oldcore || {}).pendingLifts || []);
  const snapshots = ((rec.oldcore || {}).snapshots || []);
  const endDay = row.days | 0;

  const spawnBySeq = new Map();
  for (const s of spawns) if (s.seq != null) spawnBySeq.set(s.seq, s);
  const birthBySeq = new Map();
  for (const b of births) if (b.seq != null) birthBySeq.set(b.seq, b);
  const removalsBySeq = new Map();
  for (const r of removals) {
    if (r.seq == null) continue;
    if (!removalsBySeq.has(r.seq)) removalsBySeq.set(r.seq, []);
    removalsBySeq.get(r.seq).push(r);
  }
  const resolveBySeq = new Map();
  for (const f of resolve) {
    if (f.seq == null) continue;
    if (!resolveBySeq.has(f.seq)) resolveBySeq.set(f.seq, []);
    resolveBySeq.get(f.seq).push(f);
  }
  const tbBySeq = new Map();
  for (const t of tbEnds) {
    if (t.seq == null) continue;
    if (!tbBySeq.has(t.seq)) tbBySeq.set(t.seq, []);
    tbBySeq.get(t.seq).push(t);
  }
  const presentSeqs = new Set(finalPresent.map(p => p.seq).filter(s => s != null));
  const pendingSeqs = new Set(pending.map(p => p.seq).filter(s => s != null));
  const snapshotDaysBySeq = new Map();
  for (const snap of snapshots) {
    const day = snap.day | 0;
    for (const p of (snap.present || [])) {
      if (p.seq == null) continue;
      if (!snapshotDaysBySeq.has(p.seq)) snapshotDaysBySeq.set(p.seq, []);
      snapshotDaysBySeq.get(p.seq).push(day);
    }
  }

  const arrivals = [];
  const untaggedArrivals = [];
  for (const b of births) {
    if (b.seq == null) { untaggedArrivals.push({ type: b.type, day: b.day, src: b.src || null }); continue; }
    const sp = spawnBySeq.get(b.seq) || null;
    arrivals.push({ seq: b.seq, type: b.type, day: b.day, src: (sp && sp.src) || b.src || null, srcAgree: !sp || (sp.src === b.src), spawnDay: sp ? sp.day : null });
  }
  for (const s of spawns) {
    if (s.seq != null && !birthBySeq.has(s.seq)) {
      arrivals.push({ seq: s.seq, type: s.type, day: s.day, src: s.src || null, srcAgree: null, spawnDay: s.day, joinGap: 'spawn-only' });
    }
  }
  arrivals.sort((a, b) => (a.day - b.day) || (a.seq - b.seq));

  const outcomeCounts = {};
  const detail = [];
  for (const a of arrivals) {
    const rems = (removalsBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const res = (resolveBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const tbs = (tbBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const fought = (res.length + tbs.length) > 0;
    let outcome, outcomeKind = null, outcomeDay = null;
    const lastRem = rems.length ? rems[rems.length - 1] : null;
    const reappeared = lastRem && (snapshotDaysBySeq.get(a.seq) || []).some(d => d > (lastRem.day | 0));
    if (presentSeqs.has(a.seq) || reappeared) {
      outcome = 'still-present'; outcomeDay = null;
    } else if (pendingSeqs.has(a.seq)) {
      outcome = 'pending-in-fight'; outcomeDay = null;
    } else if (lastRem) {
      outcome = mapOutcomeKind(lastRem.kind); outcomeKind = lastRem.kind; outcomeDay = lastRem.day;
    } else {
      outcome = 'unknown'; outcomeKind = 'vanished';
    }
    const known = outcome !== 'unknown' && outcome !== 'pending-in-fight';
    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
    detail.push({
      seq: a.seq, type: a.type, arrivalDay: a.day, src: a.src, srcAgree: a.srcAgree,
      daysAvailable: endDay - (a.day | 0),
      fought, fights: res.length + tbs.length,
      resolveFights: res.length, tbFights: tbs.length,
      resolveOutcomes: res.map(f => f.outcome), tbResults: tbs.map(t => t.result),
      firstFightDay: (res.concat(tbs).length ? Math.min(...res.concat(tbs).map(f => f.day | 0)) : null),
      outcome, outcomeKind, outcomeDay, reappearedAfterRemoval: !!reappeared,
      multiRemoval: rems.length > 1, removals: rems.length,
      known,
    });
  }
  const knownCount = detail.filter(d => d.known).length;
  return { arrivals: detail, untaggedArrivals, outcomeCounts, knownCount,
    unknownCount: detail.length - knownCount,
    foughtCount: detail.filter(d => d.fought).length,
    neverFought: detail.filter(d => !d.fought).length,
    killed: detail.filter(d => isKillOutcome(d.outcome)).length };
}

function analyzeTB(row) {
  const rec = row.recorders || {};
  const starts = ((rec.nonworldkill || {}).starts || []);
  const ends = ((rec.nonworldkill || {}).ends || []);
  const strikes = ((rec.strikeCounter || {}).strikes || []);
  const endsByFight = new Map();
  for (const e of ends) {
    if (e.fightId == null) continue;
    if (!endsByFight.has(e.fightId)) endsByFight.set(e.fightId, []);
    endsByFight.get(e.fightId).push(e);
  }
  const strikesByFight = new Map();
  for (const s of strikes) {
    if (s.fightId == null) continue;
    if (!strikesByFight.has(s.fightId)) strikesByFight.set(s.fightId, []);
    strikesByFight.get(s.fightId).push(s);
  }
  const w4starts = [];
  const doorCounts = {};
  for (const st of starts) {
    if ((st.wave | 0) !== 4) continue;
    const cls = classifyStart(st);
    if (cls.excluded) continue; // table-trial / refused / thrown: not initiations
    const es = (st.fightId != null ? (endsByFight.get(st.fightId) || []) : []);
    const ss = (st.fightId != null ? (strikesByFight.get(st.fightId) || []) : []);
    const landed = ss.filter(x => x.returned).length;
    const door = cls.door;
    doorCounts[door] = (doorCounts[door] || 0) + 1;
    w4starts.push({ day: st.day, arg: st.arg, mid: st.mid, wave: st.wave, origin: st.origin,
      door, sub: cls.sub || null, fightId: st.fightId || null,
      fightIdSource: st.fightIdSource || null, endResults: es.map(e => e.result),
      endCount: es.length, strikes: ss.length, strikesLanded: landed,
      newLogW4: es.flatMap(e => (e.newLog || []).filter(x => (x.w | 0) === 4)) });
  }
  return { w4starts, doorCounts, startsTotal: starts.length, endsTotal: ends.length };
}

function analyzeKills(row, tb) {
  const log = ((row.gate || {}).waveKillLog || []).filter(e => (e.w | 0) === 4);
  const sid = (row.gate || {}).scholarId;
  const endsByFight = new Map();
  const rec = row.recorders || {};
  for (const e of ((rec.nonworldkill || {}).ends || [])) {
    if (e.fightId == null) continue;
    if (!endsByFight.has(e.fightId)) endsByFight.set(e.fightId, []);
    endsByFight.get(e.fightId).push(e);
  }
  const out = [];
  for (const e of log) {
    if (e.by == null) { out.push({ d: e.d, mid: e.mid, by: null, via: e.via || null, channel: 'not-counted' }); continue; }
    if (e.by === sid) {
      // Player kill: join a TB end row whose newLog holds this entry.
      let door = null;
      for (const st of tb.w4starts) {
        if (st.newLogW4.some(x => x.mid === e.mid && (x.d | 0) === (e.d | 0))) { door = st.door; break; }
      }
      // Also search ALL ends (a player kill could come from a fight whose
      // start row carried a different wave, e.g. adopted-id fights).
      if (!door) {
        for (const ends of endsByFight.values()) for (const en of ends) {
          if ((en.newLog || []).some(x => (x.w | 0) === 4 && x.mid === e.mid && (x.d | 0) === (e.d | 0) && x.by === e.by)) {
            // Find the start row for that fight to name its door.
            const st = ((rec.nonworldkill || {}).starts || []).find(s => s.fightId === en.fightId);
            door = st ? classifyStart(st).door : 'tb-end-only';
          }
        }
      }
      out.push({ d: e.d, mid: e.mid, by: e.by, via: e.via || null,
        channel: door ? ('player-TB:' + door) : 'player-UNJOINED' });
    } else {
      out.push({ d: e.d, mid: e.mid, by: e.by, via: e.via || null, channel: 'villager:' + (e.via || 'unknown') });
    }
  }
  return out;
}

function analyzeVillagerFights(row) {
  const rec = row.recorders || {};
  const resolve = ((rec.defwound || {}).resolveFights || []).filter(f => (f.wave | 0) === 4);
  const outcomes = {};
  for (const f of resolve) outcomes[f.outcome || 'null'] = (outcomes[f.outcome || 'null'] || 0) + 1;
  const contexts = {};
  for (const f of resolve) contexts[f.context || 'null'] = (contexts[f.context || 'null'] || 0) + 1;
  const unlinked = resolve.filter(f => f.seq == null).length;
  const mDealt = resolve.reduce((t, f) => t + (f.mDealt | 0), 0);
  const vTaken = resolve.reduce((t, f) => t + (f.vTaken | 0), 0);
  // Raftdraft field fights (villager field fights, second instrument):
  const ff = ((rec.raftdraft || {}).fieldFights || []);
  const ffW4 = ff.filter(f => {
    if ((f.wave | 0) === 4) return true;
    if (f.mid) {
      // No roster here; wave comes from the field only when recorded.
      return false;
    }
    return false;
  });
  return { resolveCount: resolve.length, outcomes, contexts, unlinked,
    mDealt, vTaken, raftFieldW4: ffW4.length,
    raftFieldShape: ff.length ? Object.keys(ff[0]).sort() : [] };
}

function main() {
  const evidDir = process.env.EVID || path.join(__dirname, '..', 'evidence', '2026-10-27', 'perseed-w4abstain-a');
  const files = fs.readdirSync(evidDir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(evidDir, f), 'utf8')));
  const failures = [];
  const fail = (g, msg) => { failures.push(g + ': ' + msg); console.log('  FAIL ' + g + ': ' + msg); };
  const ok = (g, msg) => { console.log('  PASS ' + g + (msg ? ': ' + msg : '')); };

  console.log('=== sim-w4abstain-a validator over ' + evidDir + ' (' + rows.length + ' rows) ===');

  // ---- G1 corpus integrity ----
  let g1 = true;
  if (rows.length !== 8) { g1 = false; fail('G1', 'expected 8 rows, got ' + rows.length); }
  for (const r of rows) {
    if (!(r.days > 0)) { g1 = false; fail('G1', 'seed ' + r.seed + ' days <= 0'); }
    const g = r.gate || {};
    for (const k of ['standing', 'capped', 'gatedComputed', 'gatedEngine', 'rd5', 'rd4', 'w4faced', 'deedEnd', 'kills', 'waveKillLog', 'rosterLiving', 'scholarId']) {
      if (g[k] === undefined || g[k] === null) { g1 = false; fail('G1', 'seed ' + r.seed + ' gate.' + k + ' missing'); }
    }
    if (!Array.isArray(r.daily) || !r.daily.length) { g1 = false; fail('G1', 'seed ' + r.seed + ' daily empty'); }
    const rec = r.recorders || {};
    for (const k of ['raftdraft', 'spawnsrc', 'oldcore', 'defwound', 'w5births', 'nonworldkill']) {
      const d = (rec[k] || {}).diag || {};
      if (d.errs) { g1 = false; fail('G1', 'seed ' + r.seed + ' ' + k + ' errs=' + d.errs + ' ' + JSON.stringify(d.errors || [])); }
      if (overflowBad(d.overflow)) { g1 = false; fail('G1', 'seed ' + r.seed + ' ' + k + ' overflow ' + JSON.stringify(d.overflow)); }
    }
    const sc = rec.strikeCounter || {};
    if (sc.errs) { g1 = false; fail('G1', 'seed ' + r.seed + ' strikeCounter errs=' + sc.errs); }
    if (!sc.installed) { g1 = false; fail('G1', 'seed ' + r.seed + ' strikeCounter not installed'); }
  }
  if (g1) ok('G1', '8/8 rows, days > 0, gate+deed fields present, recorder errs 0, no overflow, strike counter installed');

  // ---- G2 veterans recompute ----
  let g2 = true;
  for (const r of rows) {
    const g = r.gate;
    const log4 = (g.waveKillLog || []).filter(e => (e.w | 0) === 4);
    const bys = [...new Set(log4.map(e => e.by).filter(Boolean))];
    const livingSet = new Set((g.rosterLiving || []).filter(x => x.living).map(x => x.vid));
    const living = bys.filter(v => v === g.scholarId || livingSet.has(v)).length;
    if (living !== (g.kills.livingW4killers | 0)) { g2 = false; fail('G2', 'seed ' + r.seed + ' living recompute ' + living + ' != row ' + g.kills.livingW4killers); }
    if (log4.length !== (g.kills.w4kills | 0)) { g2 = false; fail('G2', 'seed ' + r.seed + ' w4kills recompute ' + log4.length + ' != row ' + g.kills.w4kills); }
    if (bys.length !== (g.kills.w4killers | 0)) { g2 = false; fail('G2', 'seed ' + r.seed + ' w4killers recompute ' + bys.length + ' != row ' + g.kills.w4killers); }
  }
  if (g2) ok('G2', 'living w4 killers + counts recompute from log + rosterLiving');

  // ---- G3 fate recompute ----
  let g3 = true;
  for (const r of rows) {
    const g = r.gate;
    const log4 = (g.waveKillLog || []).filter(e => (e.w | 0) === 4);
    const fateByVid = {};
    for (const k of ((r.killerFate || {}).killers || [])) fateByVid[k.vid] = k;
    const livingSet = new Set((g.rosterLiving || []).filter(x => x.living).map(x => x.vid));
    for (const vid of [...new Set(log4.map(e => e.by).filter(Boolean))]) {
      const fk = fateByVid[vid];
      if (!fk) { g3 = false; fail('G3', 'seed ' + r.seed + ' no fate record for killer ' + vid); continue; }
      const entries = log4.filter(e => e.by === vid);
      const minD = Math.min(...entries.map(e => e.d | 0));
      if (fk.firstKillDay !== minD) { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' firstKillDay ' + fk.firstKillDay + ' != log min ' + minD); }
      if (fk.killCount !== entries.length) { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' killCount ' + fk.killCount + ' != log ' + entries.length); }
      const aliveRe = (vid === g.scholarId || livingSet.has(vid)) ? 1 : 0;
      if ((fk.aliveAtEnd | 0) !== aliveRe) { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' aliveAtEnd ' + fk.aliveAtEnd + ' != recompute ' + aliveRe); }
      const endDay = r.days;
      if (fk.aliveAtEnd) {
        if (fk.postKillSurvival !== (endDay - fk.firstKillDay)) { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' censored survival arithmetic'); }
      } else {
        if (fk.deathDay == null) { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' dead but no deathDay'); }
        else if ((fk.deathDay | 0) < fk.firstKillDay) { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' deathDay before killDay'); }
        else if (fk.postKillSurvival !== ((fk.deathDay | 0) - fk.firstKillDay)) { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' postKillSurvival arithmetic'); }
        if (fk.deathCause === 'unmatched') { g3 = false; fail('G3', 'seed ' + r.seed + ' killer ' + vid + ' death unmatched (no live-death entry)'); }
      }
    }
    if (Object.keys(fateByVid).length !== [...new Set(log4.map(e => e.by).filter(Boolean))].length) { g3 = false; fail('G3', 'seed ' + r.seed + ' fate killer set != log killer set'); }
  }
  if (g3) ok('G3', 'every w4 kill has a complete fate record (identity, day, alive/dead, death day + matched cause or censored survival)');

  // ---- G4 peak/end recompute ----
  let g4 = true;
  for (const r of rows) {
    const d = r.daily || [];
    const rd4peak = d.length ? Math.max(...d.map(x => (x.rd4 ? x.rd4[3] | 0 : 0))) : 0;
    const rd5peak = d.length ? Math.max(...d.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0;
    if (rd4peak !== (r.rdPeaks.rd4peak | 0)) { g4 = false; fail('G4', 'seed ' + r.seed + ' rd4peak ' + rd4peak + ' != ' + r.rdPeaks.rd4peak); }
    if (rd5peak !== (r.rdPeaks.rd5peak | 0)) { g4 = false; fail('G4', 'seed ' + r.seed + ' rd5peak ' + rd5peak + ' != ' + r.rdPeaks.rd5peak); }
    if (((r.gate.rd4 && r.gate.rd4.veterans) | 0) !== (r.rdPeaks.rd4end | 0)) { g4 = false; fail('G4', 'seed ' + r.seed + ' rd4end mismatch'); }
    if (((r.gate.rd5 && r.gate.rd5.veterans) | 0) !== (r.rdPeaks.rd5end | 0)) { g4 = false; fail('G4', 'seed ' + r.seed + ' rd5end mismatch'); }
  }
  if (g4) ok('G4', 'rd4/rd5 peak + end recompute from the daily series');

  // ---- G5 demand vs live code ----
  let g5 = true;
  const exp5 = { armored: 4, armed: 6, tricks: 3, veterans: 2 };
  const exp4 = { armored: 3, armed: 5, tricks: 3, veterans: 1 };
  for (const r of rows) {
    for (const [key, exp] of [['rd5', exp5], ['rd4', exp4]]) {
      const dem = (r.gate[key] || {}).demand || {};
      for (const k of Object.keys(exp)) {
        if (dem[k] !== undefined && (dem[k] | 0) !== exp[k]) { g5 = false; fail('G5', 'seed ' + r.seed + ' ' + key + ' demand.' + k + '=' + dem[k] + ' != ' + exp[k]); }
      }
    }
    const d5 = (r.gate.rd5 || {}).demand || {};
    const d4 = (r.gate.rd4 || {}).demand || {};
    if (Object.keys(d5).length) console.log('    demand seed ' + r.seed + ' rd5=' + JSON.stringify(d5) + ' rd4=' + JSON.stringify(d4));
  }
  if (g5) ok('G5', 'demand values match live code where recorded (rd5 4/6/3/2, rd4 3/5/3/1 on the veteran/armed/trick bars)');

  // ---- G6 substrate-activation gate ----
  const courtTotals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) courtTotals[k] = rows.reduce((t, r) => t + ((r.courtship && r.courtship[k]) | 0), 0);
  const courtSeedsActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const g6 = courtTotals.combined > 0 && courtSeedsActive >= 6;
  if (g6) ok('G6', 'substrate gate: combined=' + courtTotals.combined + ', seeds active ' + courtSeedsActive + '/8');
  else fail('G6', 'substrate gate FAILED: combined=' + courtTotals.combined + ', seeds active ' + courtSeedsActive + '/8');

  // ---- G7 activation gate (binding) ----
  let playerW4Strikes = 0, playerW4StrikeCalls = 0, playerW4Kills = 0;
  const tbBySeed = {};
  for (const r of rows) {
    const tb = analyzeTB(r);
    tbBySeed[r.seed] = tb;
    const sc = (r.recorders || {}).strikeCounter || {};
    for (const s of (sc.strikes || [])) {
      if ((s.waves || []).indexOf(4) >= 0) {
        playerW4StrikeCalls++;
        if (s.returned) playerW4Strikes++;
      }
    }
    const sid = (r.gate || {}).scholarId;
    for (const e of ((r.gate || {}).waveKillLog || [])) if ((e.w | 0) === 4 && e.by === sid) playerW4Kills++;
  }
  const g7 = playerW4Strikes === 0 && playerW4Kills === 0;
  if (g7) ok('G7', 'activation gate: player w4 strikes (landed) = 0, player w4 kills = 0 (strike calls in w4 fights: ' + playerW4StrikeCalls + ')');
  else fail('G7', 'ACTIVATION FAILURE: player w4 strikes=' + playerW4Strikes + ' (calls ' + playerW4StrikeCalls + '), player w4 kills=' + playerW4Kills);

  // ---- G8 arrival classification + kill channels ----
  let bandArrivals = 0, bandKnown = 0, bandUntagged = 0;
  const outcomeBand = {};
  const killsBySeed = {};
  let unchanneledPlayerKills = 0;
  for (const r of rows) {
    const ar = analyzeArrivals(r);
    bandArrivals += ar.arrivals.length; bandKnown += ar.knownCount; bandUntagged += ar.untaggedArrivals.length;
    for (const k of Object.keys(ar.outcomeCounts)) outcomeBand[k] = (outcomeBand[k] || 0) + ar.outcomeCounts[k];
    const tb = tbBySeed[r.seed];
    const kc = analyzeKills(r, tb);
    killsBySeed[r.seed] = kc;
    for (const k of kc) if (k.channel === 'player-UNJOINED') unchanneledPlayerKills++;
    r._arrivals = ar; r._kills = kc; r._tb = tb; r._vf = analyzeVillagerFights(r);
  }
  const classifiedShare = bandArrivals ? bandKnown / bandArrivals : 1;
  const g8 = bandArrivals === 0 || classifiedShare >= 0.95;
  console.log('  INFO G8: arrivals=' + bandArrivals + ' known=' + bandKnown + ' share=' + (classifiedShare * 100).toFixed(1) + '% untagged=' + bandUntagged + ' outcomes=' + JSON.stringify(outcomeBand) + ' unjoined player kills=' + unchanneledPlayerKills);
  if (!g8) console.log('  VERDICT-LEG (c) FAILED: classified share below 95%');
  if (unchanneledPlayerKills) console.log('  WARN G8: ' + unchanneledPlayerKills + ' player w4 kill(s) with no TB door join');

  // ---- G9 daily series ----
  let g9 = true;
  for (const r of rows) {
    const d = r.daily || [];
    let prev = null, stalled = 0;
    for (const x of d) {
      if (prev !== null && (x.d | 0) < prev) { g9 = false; fail('G9', 'seed ' + r.seed + ' daily days decrease at ' + x.d); }
      if (prev !== null && (x.d | 0) === prev) stalled++;
      prev = x.d | 0;
    }
    if (stalled) console.log('    note seed ' + r.seed + ': ' + stalled + ' stalled daily day(s) (loop-day != game-day, reported not failed)');
    const killDays = ((r.gate || {}).waveKillLog || []).filter(e => (e.w | 0) === 4).map(e => e.d | 0);
    const firstD = d.length ? (d[0].d | 0) : 0, lastD = d.length ? (d[d.length - 1].d | 0) : 0;
    for (const kd of killDays) {
      if (kd < firstD || kd > lastD) console.log('    note seed ' + r.seed + ': kill day ' + kd + ' outside daily range [' + firstD + ',' + lastD + '] (end log still counts it)');
    }
  }
  if (g9) ok('G9', 'daily series non-decreasing, kill days covered or noted');

  // ---- G10 det-gate ----
  let g10 = true, det = null;
  try { det = JSON.parse(fs.readFileSync(path.join(evidDir, 'detgate.json'), 'utf8')); } catch (e) { g10 = false; fail('G10', 'detgate.json missing/unreadable'); }
  if (det && !det.pass) { g10 = false; fail('G10', 'detgate pass=false, diffs=' + JSON.stringify(det.diffs)); }
  if (g10) ok('G10', 'detgate PASS (seed ' + (det && det.seed) + ', headlines identical ON vs OFF)');

  // ---- Wall numbers + verdict legs ----
  const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n || (r.engineUwEnd || 1) >= n).length;
  const deathTotals = {};
  for (const r of rows) for (const k of Object.keys(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + r.deaths[k];
  const villagerKills = rows.flatMap(r => (r._kills || []).filter(k => k.channel.indexOf('villager:') === 0).map(k => Object.assign({ seed: r.seed }, k)));
  const playerKills = rows.flatMap(r => (r._kills || []).filter(k => k.channel.indexOf('player-') === 0).map(k => Object.assign({ seed: r.seed }, k)));
  const notCounted = rows.flatMap(r => (r._kills || []).filter(k => k.channel === 'not-counted').map(k => Object.assign({ seed: r.seed }, k)));
  const villagerFights = rows.reduce((t, r) => t + (r._vf.resolveCount | 0), 0);
  const villagerFightsBySeed = rows.map(r => ({ seed: r.seed, fights: r._vf.resolveCount, outcomes: r._vf.outcomes, contexts: r._vf.contexts, unlinked: r._vf.unlinked }));
  const w4facedBand = rows.reduce((t, r) => t + ((r.gate.wavesFaced && r.gate.wavesFaced[4]) | 0), 0);
  const w4engagedBand = rows.filter(r => r._tb.w4starts.length > 0 || r._vf.resolveCount > 0).length; // seeds with any w4 TB start or villager resolve fight
  const tbDoorBand = {};
  for (const r of rows) for (const k of Object.keys(r._tb.doorCounts)) tbDoorBand[k] = (tbDoorBand[k] || 0) + r._tb.doorCounts[k];
  const tbStartsBand = rows.reduce((t, r) => t + r._tb.w4starts.length, 0);
  const ab = {};
  for (const r of rows) {
    for (const k of Object.keys(r.abstain || {})) {
      if (Array.isArray(r.abstain[k])) ab[k] = (ab[k] || 0) + r.abstain[k].length;
      else if (typeof r.abstain[k] === 'number') ab[k] = (ab[k] || 0) + r.abstain[k];
    }
  }
  const wall = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    medianGameDays: medianOf(rows.map(r => r.gameDays)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    fullSeat: rows.filter(r => r.tableState && r.tableState.seat === 'full').length,
    lesserSeat: rows.filter(r => r.tableState && r.tableState.seat === 'lesser').length,
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max(...rows.map(r => r.maxArc).concat([1])),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotals,
    w4killsTotal: rows.reduce((t, r) => t + (r.gate.kills.w4kills | 0), 0),
    w4facedTypes: w4facedBand,
    w4facedSeeds: rows.filter(r => (r.gate.w4faced | 0) > 0).length,
    w4engagedSeeds: w4engagedBand,
    villagerKills: villagerKills.length,
    playerKills: playerKills.length,
    notCountedKills: notCounted.length,
    villagerFights,
    tbStartsW4: tbStartsBand,
    tbDoorsW4: tbDoorBand,
    abstainCounters: ab,
  };
  const legA = rows.length === 8 && g1;
  const legB = g7;
  const legC = g8;
  const legD = true; // counts + identities are computed above; the sense read is judged in evidence
  const verdict = (legA && legB && legC && legD) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const verdictWording = villagerKills.length === 0
    ? 'villager conversion zero on this band under abstention'
    : 'villager-capable (' + villagerKills.length + ' villager wave-4 kill(s) on ' + villagerFights + ' villager wave-4 fights)';

  console.log('\n--- per-seed table ---');
  for (const r of rows) {
    const g = r.gate;
    console.log(`  seed ${r.seed}: days=${r.days} end=${r.endReason} wave=${r.waveReach} engUw=${r.engineUwEnd} rank=${r.finalRank}/${r.maxRank} nat=${r.nationalEver}/${r.nationalFinal} table=${r.table} entered=${r.entered} seat=${(r.tableState && r.tableState.seat) || '-'} won=${r.won} | raw=${g.standing.raw} capped=${g.capped} gated=${g.gatedComputed}/${g.gatedEngine} rd5=${g.rd5.armored}/${g.rd5.armed}/${g.rd5.tricks}/${g.rd5.veterans} rd4=${g.rd4.armored}/${g.rd4.armed}/${g.rd4.tricks}/${g.rd4.veterans} w4faced=${g.w4faced} facedTypes=${JSON.stringify(g.wavesFaced)} w4kills=${g.kills.w4kills} livingW4=${g.kills.livingW4killers} starv=${r.starvationDeaths} court=${r.courtship.combined} abstainTurns=${(r.abstain && r.abstain.w4abstainTurns) || 0} abstainFights=${(r.abstain && r.abstain.w4abstainFights) || 0}`);
  }
  console.log('\n--- wall numbers ---');
  console.log('  ' + JSON.stringify(wall, null, 1).replace(/\n/g, '\n  '));
  console.log('\n--- wave-4 kills by channel ---');
  console.log('  villager kills: ' + JSON.stringify(villagerKills));
  console.log('  player kills: ' + JSON.stringify(playerKills));
  console.log('  not-counted kills: ' + JSON.stringify(notCounted));
  console.log('\n--- villager wave-4 fights by seed (defwound resolve rows) ---');
  for (const v of villagerFightsBySeed) console.log('  seed ' + v.seed + ': fights=' + v.fights + ' outcomes=' + JSON.stringify(v.outcomes) + ' contexts=' + JSON.stringify(v.contexts) + ' unlinked=' + v.unlinked);
  console.log('\n--- wave-4 TB fights by door (nonworldkill) ---');
  for (const r of rows) {
    for (const s of r._tb.w4starts) {
      console.log(`  seed ${r.seed}: d${s.day} ${s.mid} door=${s.door}${s.sub ? '/' + s.sub : ''} origin=${s.origin} ends=${s.endCount} [${s.endResults.join(',')}] strikes=${s.strikes} landed=${s.strikesLanded}`);
    }
  }
  console.log('\n--- wave-4 arrivals by seed (funnel classes) ---');
  for (const r of rows) {
    for (const a of r._arrivals.arrivals) {
      console.log(`  seed ${r.seed}: ${a.type}@d${a.arrivalDay} src=${a.src} avail=${a.daysAvailable}d fought=${a.fought} fights=${a.fights} -> ${a.outcome}${a.outcomeKind ? ' (' + a.outcomeKind + ')' : ''}`);
    }
    if (r._arrivals.untaggedArrivals.length) console.log('  seed ' + r.seed + ': untagged arrivals=' + JSON.stringify(r._arrivals.untaggedArrivals));
  }
  console.log('\n--- verdict legs ---');
  console.log('  (a) 8/8 configs valid: ' + legA);
  console.log('  (b) activation gate passes: ' + legB + ' (player w4 strikes=' + playerW4Strikes + ', player w4 kills=' + playerW4Kills + ')');
  console.log('  (c) >=95% arrivals classified: ' + legC + ' (' + bandKnown + '/' + bandArrivals + ' = ' + (classifiedShare * 100).toFixed(1) + '%)');
  console.log('  (d) villager counts + identities reported: ' + legD + ' (sense read judged in evidence, not here)');
  console.log('VERDICT: ' + verdict + ' — ' + verdictWording);
  const hardOk = failures.length === 0;
  console.log('HARD GATES: ' + (hardOk ? 'PASS' : 'FAIL (' + failures.length + ' failure(s))'));

  const analysis = { evidDir, rows: rows.length, failures, gates: { g1, g2, g3, g4, g5, g6, g7, g8, g9, g10 },
    wall, verdict, verdictWording, legs: { a: legA, b: legB, c: legC, d: legD },
    classifiedShare, bandArrivals, bandKnown, bandUntagged,
    villagerKills, playerKills, notCounted, villagerFightsBySeed,
    perSeed: rows.map(r => ({ seed: r.seed, days: r.days, endReason: r.endReason, waveReach: r.waveReach,
      engineUwEnd: r.engineUwEnd, finalRank: r.finalRank, maxRank: r.maxRank,
      nationalEver: r.nationalEver, nationalFinal: r.nationalFinal, table: r.table, entered: r.entered,
      seat: (r.tableState && r.tableState.seat) || null, won: r.won,
      gatedComputed: r.gate.gatedComputed, gatedEngine: r.gate.gatedEngine, capped: r.gate.capped,
      rd5: r.gate.rd5, rd4: r.gate.rd4, rdPeaks: r.rdPeaks, w4faced: r.gate.w4faced,
      wavesFaced: r.gate.wavesFaced, deedEnd: r.gate.deedEnd, kills: r.gate.kills,
      killerFate: r.killerFate, courtship: r.courtship, abstain: r.abstain,
      arrivals: r._arrivals, tb: r._tb, vf: r._vf, kills: r._kills })),
    generated: new Date().toISOString() };
  try { fs.writeFileSync(path.join(evidDir, 'analysis.json'), JSON.stringify(analysis, null, 1) + '\n'); console.log('  -> ' + path.join(evidDir, 'analysis.json')); } catch (e) { console.log('  WARN: could not write analysis.json: ' + e.message); }
  if (!hardOk) process.exit(1);
}

main();
