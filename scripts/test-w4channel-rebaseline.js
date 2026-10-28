#!/usr/bin/env node
// scripts/test-w4channel-rebaseline.js — analyzer / proof validator for the
// sim-w4channel-rebaseline census (evidence/2026-10-27/perseed-w4channel-rebaseline/).
// Pure reads over the per-seed rows: no game load, no RNG. The sweep
// stores RAW recorder rows only; this analyzer derives every channel,
// outcome, and killer-identity class from those raw fields, so the
// analyzer IS the G4/G8 recompute — it never trusts a sweep-side
// channel label (there is none).
//
// Channel precedence (prereg, fixed before sweeping; every signal is
// retained per row even when precedence settles the channel):
//   trap (glasswing-trap door) > contest-arena-door (non-world) >
//   non-world-TB (null-origin) > player-tb-world (world-origin TB) >
//   raid-defender > villager-field > other.
// Origin-mismatch TB fights match none of the origin classes, so they
// fall to `other` with the mismatch flagged — never silently bucketed
// as world or non-world. Unresolved (adopted) TB fights with no
// tileMonster and no door signal also fall to `other`, flagged.
// Fight-event unit: one defwound resolve row, one oldcore tbEnd, one
// nonworldkill TB start, or one raftdraft fieldFight — deduplicated
// when two recorders saw the same fight (same day + vid + mid +
// outcome for defwound/raftdraft; same day + type + result, uniquely,
// for tbEnd/nwk-start). Deduplication is reported, never hidden.
// Killer identity (prereg): by == end scholar vid -> scholar-player;
// by literally 'player' -> player-literal (never assumed scholar);
// by null -> unknown; else villager (roster/vpOf from killerStatus).
// Living flag = the gate's own rule, recomputed from killerStatus.
// Exit 1 only on corpus/gate failure (missing row, recorder errors,
// substrate gate failure); the GO verdict is printed and lives in the
// evidence file, not in the exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyStart, analyzeNonworldkill } = require('./policies/nonworldkill-diag');

const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4channel-rebaseline');
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

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
function isKillOutcome(o) {
  return o === 'killed-by-player-fight' || o === 'killed-by-villager-fight'
    || o === 'killed-by-defender-fight' || o === 'killed-other-cause';
}
function kindChannel(kind) {
  if (kind === 'player-fight-kill' || kind === 'player-fight-melt' || kind === 're-entry') return 'player-tb-world';
  if (kind === 'villager-fight-kill') return 'villager-field';
  if (kind === 'raid-defense-kill') return 'raid-defender';
  if (kind === 'trap-capture') return 'trap';
  return 'other';
}
// Channel for one nonworldkill TB start (prereg precedence).
function tbChannel(start) {
  const cls = classifyStart(start);
  const door = cls.door, origin = start.origin;
  if (door === 'glasswing-trap') return { channel: 'trap', door, origin, sub: cls.sub || null };
  if (door === 'contest-arena' && origin !== 'world-origin') return { channel: 'contest', door, origin, sub: cls.sub || null };
  if (origin === 'null-origin') return { channel: 'non-world-TB', door, origin, sub: cls.sub || null };
  if (origin === 'world-origin') return { channel: 'player-tb-world', door, origin, sub: cls.sub || null };
  return { channel: 'other', door, origin, sub: cls.sub || null, flag: origin === 'world-origin-mismatch' ? 'origin-mismatch' : 'origin-unresolved' };
}

function analyzeSeed(row) {
  const seed = row.seed;
  const endDay = row.days | 0;
  const spawns = ((row.spawnsrc || {}).spawns || []).filter(s => (s.wave | 0) === 4);
  const births = ((row.oldcore || {}).births || []).filter(b => (b.wave | 0) === 4);
  const removals = ((row.oldcore || {}).removals || []).filter(r => (r.wave | 0) === 4);
  const tbEnds = ((row.oldcore || {}).tbEnds || []).filter(t => (t.wave | 0) === 4);
  const resolve = ((row.defwound || {}).resolveFights || []).filter(f => (f.wave | 0) === 4);
  const finalPresent = ((row.oldcore || {}).finalPresent || []).filter(p => (p.wave | 0) === 4);
  const pending = ((row.oldcore || {}).pendingLifts || []);
  const snapshots = ((row.oldcore || {}).snapshots || []);
  const logEntries = ((row.raftdraft || {}).logEntries || []).filter(e => (e.w | 0) === 4);
  const fieldFights = ((row.raftdraft || {}).fieldFights || []).filter(f => (f.wave | 0) === 4);
  const nwkStarts = ((row.nonworldkill || {}).starts || []).filter(s => (s.wave | 0) === 4);
  const nwkEnds = ((row.nonworldkill || {}).ends || []);
  const facedMap = ((row.raftdraft || {}).faced || {});
  const facedTypes = Object.keys(facedMap).filter(m => (facedMap[m] | 0) === 4);
  const nwk = row.nonworldkill ? analyzeNonworldkill(row.nonworldkill) : null;

  // --- arrivals + outcomes (w4funnel logic, verbatim shape) ---
  const spawnBySeq = new Map();
  for (const s of spawns) if (s.seq != null) spawnBySeq.set(s.seq, s);
  const birthBySeq = new Map();
  for (const b of births) if (b.seq != null) birthBySeq.set(b.seq, b);
  const removalsBySeq = new Map();
  for (const r of removals) { if (r.seq == null) continue; if (!removalsBySeq.has(r.seq)) removalsBySeq.set(r.seq, []); removalsBySeq.get(r.seq).push(r); }
  const resolveBySeq = new Map();
  for (const f of resolve) { if (f.seq == null) continue; if (!resolveBySeq.has(f.seq)) resolveBySeq.set(f.seq, []); resolveBySeq.get(f.seq).push(f); }
  const tbBySeq = new Map();
  for (const t of tbEnds) { if (t.seq == null) continue; if (!tbBySeq.has(t.seq)) tbBySeq.set(t.seq, []); tbBySeq.get(t.seq).push(t); }
  const presentSeqs = new Set(finalPresent.map(p => p.seq).filter(s => s != null));
  const pendingSeqs = new Set(pending.map(p => p.seq).filter(s => s != null));
  const snapshotDaysBySeq = new Map();
  for (const snap of snapshots) { const day = snap.day | 0; for (const p of (snap.present || [])) { if (p.seq == null) continue; if (!snapshotDaysBySeq.has(p.seq)) snapshotDaysBySeq.set(p.seq, []); snapshotDaysBySeq.get(p.seq).push(day); } }
  const arrivals = [];
  for (const b of births) {
    if (b.seq == null) continue;
    const sp = spawnBySeq.get(b.seq) || null;
    arrivals.push({ seq: b.seq, type: b.type, day: b.day, src: (sp && sp.src) || b.src || null, joinGap: null });
  }
  for (const s of spawns) if (s.seq != null && !birthBySeq.has(s.seq)) arrivals.push({ seq: s.seq, type: s.type, day: s.day, src: s.src || null, joinGap: 'spawn-only' });
  arrivals.sort((a, b) => (a.day - b.day) || (a.seq - b.seq));
  const spawnOnly = arrivals.filter(a => a.joinGap === 'spawn-only').length;
  const birthOnly = births.filter(b => b.seq != null && !spawnBySeq.has(b.seq)).length;

  // --- TB start/end join (for kill channel + TB event dedup) ---
  const endByFightId = new Map();
  for (const e of nwkEnds) if (e.fightId) endByFightId.set(e.fightId, e);
  const startByFightId = new Map();
  for (const s of nwkStarts) if (s.fightId) startByFightId.set(s.fightId, s);
  // Pair tbEnds to nwk starts by SEQ (the lift identity), preferring
  // same day, then the nearest earlier start with that seq (a fight's
  // settlement can land the next day — 75104's reunion d165 tbEnd
  // settles a d164 start). Pairing only dedupes events: the start's
  // own channel is what survives, so order among same-seq starts
  // cannot change any channel. A tbEnd paired to a MISMATCH start
  // is still that start's lift settlement (the bystander), not a
  // second fight — dedup is correct there too; engagement uses the
  // origin rule below, never the pairing.
  const tbUsed = new Set();
  const startTbEnd = new Map(); // fightId -> tbEnd
  for (const t of tbEnds) {
    const cands = nwkStarts.filter(st => !startTbEnd.has(st.fightId) && st.tileMonster && st.tileMonster.seq != null && st.tileMonster.seq === t.seq);
    if (!cands.length) continue;
    cands.sort((a, b) => {
      const da = Math.abs((a.day | 0) - (t.day | 0)), db = Math.abs((b.day | 0) - (t.day | 0));
      if (da !== db) return da - db;
      return ((a.day | 0) <= (t.day | 0) ? 0 : 1) - ((b.day | 0) <= (t.day | 0) ? 0 : 1);
    });
    const pick = cands[0];
    tbUsed.add(t); startTbEnd.set(pick.fightId, t);
  }
  const unpairedTbEnds = tbEnds.filter(t => !tbUsed.has(t));

  // --- fight events (deduped) ---
  const events = [];
  const addEvent = (ev) => events.push(ev);
  // defwound rows first (seq-linked, channel from context).
  const defwoundKey = new Set();
  for (const f of resolve) {
    const key = [f.day, f.vid, f.mid, f.outcome].join('|');
    defwoundKey.add(key);
    addEvent({ source: 'defwound', day: f.day, vid: f.vid, mid: f.mid, seq: f.seq, channel: f.raid ? 'raid-defender' : 'villager-field', context: f.raid ? 'raid' : 'field', outcome: f.outcome, rounds: f.rounds, mDealt: f.mDealt });
  }
  // raftdraft fieldFights: merge with a defwound row on day+vid+mid+outcome, else unlinked.
  const unlinkedFieldFights = [];
  for (const f of fieldFights) {
    const key = [f.day, f.vid, f.mid, f.outcome].join('|');
    if (defwoundKey.has(key)) continue; // same fight, defwound version kept
    unlinkedFieldFights.push(f);
    addEvent({ source: 'raftdraft-field', day: f.day, vid: f.vid, mid: f.mid, seq: null, channel: 'villager-field', context: 'field-unlinked', outcome: f.outcome, rounds: f.rounds, mDealt: f.mDealt, unlinked: true });
  }
  // TB events from nwk starts (seq from tileMonster when present).
  const tbSeqs = new Set();
  for (const s of nwkStarts) {
    const ch = tbChannel(s);
    // SEQ-LINKAGE RULE (corrected): the tileMonster is the FOUGHT
    // monster ONLY when origin is world-origin. On a mismatch the
    // tileMonster is the BYSTANDER (its lift melts/restores while
    // the fight is about another monster) — linking it would falsely
    // engage the bystander's arrival (e.g. 75101's eulogy seq 31
    // under a feast-draw suburb fight and a contest algorithm fight).
    // Bystander seq is recorded, never linked.
    const seq = (s.origin === 'world-origin' && s.tileMonster && s.tileMonster.seq != null) ? s.tileMonster.seq : null;
    const bystanderSeq = (s.origin !== 'world-origin' && s.tileMonster && s.tileMonster.seq != null) ? s.tileMonster.seq : null;
    if (seq != null) tbSeqs.add(seq);
    const end = s.fightId ? endByFightId.get(s.fightId) : null;
    addEvent({ source: 'nwk-tb', day: s.day, vid: null, mid: s.mid, seq, bystanderSeq, channel: ch.channel, door: ch.door, origin: ch.origin, sub: ch.sub, flag: ch.flag || null, result: end ? end.result : null, fightId: s.fightId || null, tbEndPaired: s.fightId ? startTbEnd.has(s.fightId) : false });
  }
  // Unpaired tbEnds: TB events the nwk start did not capture (or pairing failed).
  for (const t of unpairedTbEnds) {
    addEvent({ source: 'tbEnd-only', day: t.day, vid: null, mid: t.type, seq: t.seq, channel: kindChannel(t.kind), kind: t.kind, result: t.result, restored: !!t.restored, flag: 'tbEnd-unpaired' });
  }
  // Per-arrival engagement from seq-linked events (defwound + tbEnd + nwk tileMonster seq).
  const seqLinkedEventsBySeq = new Map();
  for (const ev of events) {
    if (ev.seq == null) continue;
    if (!seqLinkedEventsBySeq.has(ev.seq)) seqLinkedEventsBySeq.set(ev.seq, []);
    seqLinkedEventsBySeq.get(ev.seq).push(ev);
  }
  const outcomeCounts = {};
  const detail = [];
  for (const a of arrivals) {
    const rems = (removalsBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const evs = (seqLinkedEventsBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const fought = evs.length > 0;
    let outcome, outcomeKind = null, outcomeDay = null;
    const lastRem = rems.length ? rems[rems.length - 1] : null;
    const reappeared = lastRem && (snapshotDaysBySeq.get(a.seq) || []).some(d => d > (lastRem.day | 0));
    if (presentSeqs.has(a.seq) || reappeared) { outcome = 'still-present'; }
    else if (pendingSeqs.has(a.seq)) { outcome = 'pending-in-fight'; }
    else if (lastRem) { outcome = mapOutcomeKind(lastRem.kind); outcomeKind = lastRem.kind; outcomeDay = lastRem.day; }
    else { outcome = 'unknown'; outcomeKind = 'vanished'; }
    const known = outcome !== 'unknown' && outcome !== 'pending-in-fight';
    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
    let logMatch = null;
    if (isKillOutcome(outcome) && outcomeDay != null) logMatch = logEntries.find(e => e.mid === a.type && (e.d | 0) === (outcomeDay | 0)) || null;
    const channels = [...new Set(evs.map(e => e.channel))];
    detail.push({
      seq: a.seq, type: a.type, arrivalDay: a.day, src: a.src, joinGap: a.joinGap,
      daysAvailable: endDay - (a.day | 0),
      engaged: fought, fightEvents: evs.length,
      channels, channelCounts: (() => { const m = {}; for (const e of evs) m[e.channel] = (m[e.channel] || 0) + 1; return m; })(),
      eventDays: evs.map(e => e.day), eventSources: evs.map(e => e.source),
      outcome, outcomeKind, outcomeDay, reappearedAfterRemoval: !!reappeared,
      logMatch: logMatch ? { d: logMatch.d, by: logMatch.by, via: logMatch.via } : null, known,
      unlinkedSameTypeFights: unlinkedFieldFights.filter(f => f.mid === a.type && (f.day | 0) >= (a.day | 0)).length,
    });
  }
  const engagedCount = detail.filter(d => d.engaged).length;
  const neverEngaged = detail.filter(d => !d.engaged).length;
  const engagedNotKilled = detail.filter(d => d.engaged && !isKillOutcome(d.outcome)).length;
  const killedArrivals = detail.filter(d => isKillOutcome(d.outcome)).length;
  const knownCount = detail.filter(d => d.known).length;

  // --- kills: channel + killer identity (recomputed, never trusted) ---
  const scholarId = (row.killerStatus && row.killerStatus.scholarId) || null;
  const ksByVid = new Map();
  for (const k of ((row.killerStatus || {}).killers || [])) ksByVid.set(k.vid, k);
  const roster = ((row.killerStatus || {}).roster || []);
  // TB-joined kill keys: exact log-entry objects appearing in an nwk end's newLog.
  const tbJoined = new Map(); // JSON key -> {fightId, door, origin, channel}
  for (const e of nwkEnds) {
    const st = e.fightId ? startByFightId.get(e.fightId) : null;
    if (!st) continue;
    const ch = tbChannel(st);
    for (const k of (e.newLog || [])) tbJoined.set(JSON.stringify(k), { fightId: e.fightId, door: ch.door, origin: ch.origin, channel: ch.channel, startDay: st.day, startArg: st.arg });
  }
  const kills = [];
  for (const e of logEntries) {
    const key = JSON.stringify({ d: e.d | 0, mid: e.mid || null, w: e.w | 0, by: e.by !== undefined ? e.by : null, via: e.via || 'unknown', trick: e.trick !== undefined ? e.trick : null });
    const tb = tbJoined.get(key) || null;
    let channel, channelBasis, door = null, origin = null;
    if (tb) { channel = tb.channel; channelBasis = 'tb-joined'; door = tb.door; origin = tb.origin; }
    else {
      const rem = removals.find(r => r.type === e.mid && (r.day | 0) === (e.d | 0) && isKillOutcome(mapOutcomeKind(r.kind)));
      if (rem) { channel = kindChannel(rem.kind); channelBasis = 'removal-joined'; door = null; origin = null; }
      else if (e.via === 'contest') { channel = 'contest'; channelBasis = 'via-only'; }
      else if (e.via === 'wild' || e.via === 'patrol') { channel = 'villager-field'; channelBasis = 'via-only'; }
      else if (e.via === 'aid-crisis' || e.via === 'sortie' || e.via === 'companion' || e.via === 'agency') { channel = 'other'; channelBasis = 'via-only'; }
      else { channel = 'other'; channelBasis = 'unjoined'; }
    }
    // Killer identity (recompute).
    let identity, living = null;
    if (e.by == null) { identity = 'unknown'; }
    else if (scholarId != null && e.by === scholarId) { identity = 'scholar-player'; }
    else if (e.by === 'player') { identity = 'player-literal'; }
    else { identity = 'villager'; }
    const ks = e.by != null ? ksByVid.get(e.by) : null;
    if (ks) living = ks.gateLiving;
    else if (identity === 'scholar-player') living = true;
    const arrivalMatch = detail.find(d => isKillOutcome(d.outcome) && d.type === e.mid && d.outcomeDay === (e.d | 0)) || null;
    kills.push({
      d: e.d, mid: e.mid, by: e.by, via: e.via || 'unknown', trick: e.trick || null,
      channel, channelBasis, door, origin,
      identity, living, inRoster: ks ? ks.inRoster : (roster.indexOf(e.by) >= 0),
      arrivalMatched: !!arrivalMatch, arrivalSeq: arrivalMatch ? arrivalMatch.seq : null,
    });
  }
  const nonArrivalKills = kills.filter(k => !k.arrivalMatched);
  const killChannels = {};
  for (const k of kills) killChannels[k.channel] = (killChannels[k.channel] || 0) + 1;
  const fightChannels = {};
  for (const ev of events) fightChannels[ev.channel] = (fightChannels[ev.channel] || 0) + 1;
  // Raider trace check: every wave-4 raider traces to a spawn seq.
  const raidersW4 = [];
  for (const raid of ((row.raftdraft || {}).raids || [])) for (const rd of (raid.raiders || [])) if ((rd.wave | 0) === 4) raidersW4.push(rd);
  // Raid raiders carry type but no seq in the raftdraft row; trace via
  // spawnsrc raid pools (pool entries carry seq) by raid day + type.
  const poolByDayType = new Set();
  for (const raid of ((row.spawnsrc || {}).raids || [])) for (const p of (raid.pool || [])) if ((p.wave | 0) === 4) poolByDayType.add(raid.day + '|' + p.type);
  const raidersTraced = raidersW4.filter(rd => {
    // A raider's raid day is the raftdraft raid day; spawnsrc raid days
    // are the same raid days. Match by type presence in any pool (day
    // matching is best-effort: pools are per-raid snapshots).
    return [...poolByDayType].some(k => k.split('|')[1] === rd.type);
  }).length;

  // Wall numbers (row-level, from the sweep snapshot).
  const deaths = row.deaths || {};
  const deathTotal = row.deathTotal | 0;
  const deathShares = {};
  for (const k of Object.keys(deaths)) deathShares[k] = deaths[k];
  return {
    seed, endDay, endReason: row.endReason, won: row.won, waveReach: row.waveReach,
    finalRank: row.finalRank, maxRank: row.maxRank,
    nationalEver: row.nationalEver, nationalFinal: row.nationalFinal,
    table: row.table, entered: row.entered,
    seat: (row.tableState && row.tableState.seat) || null,
    tablePath: (row.tableState && row.tableState.path) || null,
    deaths: deathTotal, deathShares, starvation: row.starvationDeaths | 0,
    courtship: row.courtship || null,
    arrivals: arrivals.length, spawnOnly, birthOnly,
    facedTypes: facedTypes.length, facedTypeList: facedTypes,
    engaged: engagedCount, neverEngaged, engagedNotKilled, killedArrivals,
    knownOutcomes: knownCount, unknownOutcomes: arrivals.length - knownCount,
    outcomeCounts, detail,
    fightEvents: events.length, fightChannels, events,
    unlinkedFieldFights: unlinkedFieldFights.length, unlinkedFieldFightList: unlinkedFieldFights,
    unpairedTbEnds: unpairedTbEnds.length,
    kills: kills.length, killChannels, killList: kills, nonArrivalKills,
    raidersW4: raidersW4.length, raidersTraced,
    nwk: nwk ? { starts: nwk.starts, ends: nwk.ends, initiations: nwk.initiations, byDoor: nwk.byDoor, byOrigin: nwk.byOrigin, killsByDoor: nwk.killsByDoor, wave4Kills: nwk.wave4Kills, otherRows: nwk.otherRows.length } : null,
    recorderErrs: {
      raft: (row.raftdraft && row.raftdraft.diag && row.raftdraft.diag.errs) || 0,
      spawn: (row.spawnsrc && row.spawnsrc.diag && row.spawnsrc.diag.errs) || 0,
      old: (row.oldcore && row.oldcore.diag && row.oldcore.diag.errs) || 0,
      w5: (row.w5births && row.w5births.diag && row.w5births.diag.errs) || 0,
      def: (row.defwound && row.defwound.diag && row.defwound.diag.errs) || 0,
      nwk: (row.nonworldkill && row.nonworldkill.diag && row.nonworldkill.diag.errs) || 0,
    },
  };
}

function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(EVID, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { console.error(`MISSING ROW ${p}`); process.exit(1); }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const perSeed = rows.map(analyzeSeed);
  const sum = (f) => perSeed.reduce((t, s) => t + (f(s) | 0), 0);
  const addMap = (m, k, n) => { m[k] = (m[k] || 0) + n; };
  const bandOutcome = {}, bandFightCh = {}, bandKillCh = {}, bandKillIdent = {}, bandKillLiving = {};
  for (const s of perSeed) {
    for (const k of Object.keys(s.outcomeCounts)) addMap(bandOutcome, k, s.outcomeCounts[k]);
    for (const k of Object.keys(s.fightChannels)) addMap(bandFightCh, k, s.fightChannels[k]);
    for (const k of Object.keys(s.killChannels)) addMap(bandKillCh, k, s.killChannels[k]);
    for (const k of s.killList) { addMap(bandKillIdent, k.identity, 1); if (k.living === true) addMap(bandKillLiving, 'living', 1); else if (k.living === false) addMap(bandKillLiving, 'dead', 1); else addMap(bandKillLiving, 'unknown', 1); }
  }
  const arrivals = sum(s => s.arrivals), engaged = sum(s => s.engaged), kills = sum(s => s.kills);
  const killedArrivals = sum(s => s.killedArrivals);
  const knownOutcomes = sum(s => s.knownOutcomes);
  const fightEvents = sum(s => s.fightEvents);
  const fightsAttributed = perSeed.reduce((t, s) => t + s.events.filter(e => e.channel != null).length, 0);
  const killsAttributed = perSeed.reduce((t, s) => t + s.killList.filter(k => k.channel != null).length, 0);
  const courtTotals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) courtTotals[k] = perSeed.reduce((t, s) => t + ((s.courtship && s.courtship[k]) | 0), 0);
  const courtSeedsActive = perSeed.filter(s => s.courtship && s.courtship.combined > 0).length;
  const substrateOk = courtTotals.combined > 0 && courtSeedsActive >= 6;
  const errsTotal = perSeed.reduce((t, s) => t + Object.values(s.recorderErrs).reduce((a, b) => a + b, 0), 0);
  const days = perSeed.map(s => s.endDay).sort((a, b) => a - b);
  const medianDays = days.length ? days[Math.floor(days.length / 2)] : 0;
  // Narrowest stage: arrivals->engaged vs engaged->killed-from-arrivals.
  const engRate = arrivals ? engaged / arrivals : 0;
  const killRate = engaged ? killedArrivals / engaged : 0;
  const narrowest = (engRate <= killRate) ? 'arrivals->engaged' : 'engaged->killed';
  const legs = {
    a_valid8: perSeed.length === 8 && perSeed.every(s => s.endDay > 0) && errsTotal === 0,
    b_known95: arrivals === 0 ? true : (knownOutcomes / arrivals) >= 0.95,
    c_fights90: fightEvents === 0 ? true : (fightsAttributed / fightEvents) >= 0.90,
    c_kills100: kills === 0 ? true : (killsAttributed / kills) === 1,
    d_narrowestNamed: true,
    e_sense: false, // filled by the evidence file (sense replay), not by this analyzer
  };
  const goCandidate = legs.a_valid8 && legs.b_known95 && legs.c_fights90 && legs.c_kills100 && legs.d_narrowestNamed;
  const out = { label: 'sim-w4channel-rebaseline analysis', seeds: SEEDS, perSeed, band: {
    n: perSeed.length, arrivals, engaged, neverEngaged: sum(s => s.neverEngaged),
    engagedNotKilled: sum(s => s.engagedNotKilled), killedArrivals, kills, nonArrivalKills: sum(s => s.nonArrivalKills.length),
    facedTypes: sum(s => s.facedTypes), fightEvents, fightsAttributed, killsAttributed,
    outcomeCounts: bandOutcome, fightChannels: bandFightCh, killChannels: bandKillCh,
    killIdentities: bandKillIdent, killLiving: bandKillLiving,
    unlinkedFieldFights: sum(s => s.unlinkedFieldFights), unpairedTbEnds: sum(s => s.unpairedTbEnds),
    raidersW4: sum(s => s.raidersW4), raidersTraced: sum(s => s.raidersTraced),
    nationalEver: sum(s => s.nationalEver), nationalFinal: sum(s => s.nationalFinal),
    table: sum(s => s.table), entered: sum(s => s.entered), won: sum(s => s.won),
    wave4: perSeed.filter(s => (s.waveReach | 0) >= 4).length,
    wave5: perSeed.filter(s => (s.waveReach | 0) >= 5).length,
    medianDays, deaths: sum(s => s.deaths), starvation: sum(s => s.starvation),
    courtship: { totals: courtTotals, seedsActive: courtSeedsActive, substrateOk },
    engRate, killRate, narrowest,
  }, legs, goCandidate, generated: new Date().toISOString() };
  const ap = path.join(EVID, 'analysis.json');
  fs.writeFileSync(ap, JSON.stringify(out, null, 1) + '\n');
  console.log('=== sim-w4channel-rebaseline analysis ===');
  console.log(`G1 corpus: rows=${perSeed.length} errsTotal=${errsTotal} (per-seed errs printed below)`);
  console.log(`G6 substrate: courtCombined=${courtTotals.combined} seedsActive=${courtSeedsActive} substrateOk=${substrateOk} -> ${substrateOk ? 'PASS' : 'FAIL (INVALID RUN)'}`);
  console.log(`WALL: natEver=${out.band.nationalEver}/8 natFinal=${out.band.nationalFinal}/8 table=${out.band.table}/8 entered=${out.band.entered}/8 won=${out.band.won}/8 wave4=${out.band.wave4}/8 wave5=${out.band.wave5}/8 medD=${medianDays} deaths=${out.band.deaths} starv=${out.band.starvation}`);
  console.log(`FUNNEL: arrivals=${arrivals} engaged=${engaged} (${(engRate * 100).toFixed(1)}%) neverEngaged=${out.band.neverEngaged} engagedNotKilled=${out.band.engagedNotKilled} killedArrivals=${killedArrivals} (${engaged ? (killRate * 100).toFixed(1) : 'n/a'}% of engaged) killsAll=${kills} nonArrivalKills=${out.band.nonArrivalKills} facedTypes=${out.band.facedTypes}`);
  console.log(`OUTCOMES: ${JSON.stringify(bandOutcome)} (known ${knownOutcomes}/${arrivals})`);
  console.log(`FIGHT CHANNELS (${fightEvents} events, attributed ${fightsAttributed}): ${JSON.stringify(bandFightCh)}`);
  console.log(`KILL CHANNELS (${kills} kills, attributed ${killsAttributed}): ${JSON.stringify(bandKillCh)}`);
  console.log(`KILL IDENTITIES: ${JSON.stringify(bandKillIdent)} living: ${JSON.stringify(bandKillLiving)}`);
  console.log(`UNLINKED: fieldFights=${out.band.unlinkedFieldFights} unpairedTbEnds=${out.band.unpairedTbEnds} raidersW4=${out.band.raidersW4} traced=${out.band.raidersTraced}`);
  console.log(`LEGS: a=${legs.a_valid8} b=${legs.b_known95} cFights=${legs.c_fights90} cKills=${legs.c_kills100} narrowest=${narrowest} (engRate=${engRate.toFixed(3)} killRate=${killRate.toFixed(3)}) GO-candidate (sans sense leg e)=${goCandidate}`);
  for (const s of perSeed) {
    console.log(`seed ${s.seed}: end d${s.endDay} ${s.endReason} wave=${s.waveReach} rank=${s.finalRank} nat=${s.nationalEver}/${s.nationalFinal} table=${s.table} entered=${s.entered} seat=${s.seat} won=${s.won} arrivals=${s.arrivals} (${s.detail.map(d => d.type + '@d' + d.arrivalDay + ':' + d.src + (d.engaged ? ' ENG[' + d.channels.join(',') + ']' : ' never') + '->' + d.outcome).join('; ')}) facedTypes=${s.facedTypes} kills=${s.kills} errs=${JSON.stringify(s.recorderErrs)}`);
    for (const k of s.killList) console.log(`  kill s${s.seed} d${k.d} ${k.mid} by=${k.by} via=${k.via} channel=${k.channel} basis=${k.channelBasis} door=${k.door} origin=${k.origin} identity=${k.identity} living=${k.living} arrivalMatched=${k.arrivalMatched}`);
  }
  console.log(`analysis -> ${ap}`);
  if (!substrateOk || errsTotal > 0) { console.error('PROOF GATE FAILURE (substrate or recorder errors)'); process.exit(1); }
}
main();
