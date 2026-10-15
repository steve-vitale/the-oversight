#!/usr/bin/env node
// scripts/holdvillage-lib-20261015.js — VILLAGE-MORTALITY CENSUS
// (sim-holdvillage, 2026-10-15, scale-onramp axis).
//
// INSTRUMENT-ONLY: every function here READS persisted run records and
// returns plain data. Nothing writes game state, consumes RNG, or calls
// Date.now(). Pure-classifier design — the proof test
// (scripts/test-holdvillage-20261015.js) pins every bucket.
//
// THE QUESTION: the holdloss census (sim-holdloss) named national-hold
// LOSS MODES (succession-chain 2/3, other-named 1/3); the succhain
// instrument (sim-succhain) named bearer-death CHAINS (27/28 combat,
// polity holds 22/23). What neither names: the modal loss the tracker
// keeps recording — the VILLAGE DIES WITH THE RANK STILL ON (r4: 6/13
// nationals end by village-death; "the rank doesn't fail; the village
// does"). This instrument names WHAT KILLS a national-holding village:
// death-cause families in the terminal window, the 30d pantry trajectory
// before death, raid/succession/contest/arena co-occurrence ±4d, and the
// polity state at death.
//
// Death-window definition (pinned by proof): a national-hold village
// death = endReason in {village-dead, village-lost, pop-zero} AND the
// final scaleRow rank in {national, global}. deathDay = daysRan; the loss
// window = [deathDay-30, deathDay+1] (the +1 is the gday off-by-one
// repair — beats/deaths can be timestamped a day after runDays' returned
// day count, holdloss s77).
//
// Attribution (the binding 90% bar): a village death is ATTRIBUTED iff
// all four hold — (1) cause family named: ≥1 death in the window with a
// named family via holdloss-lib's classifyDeathFamily (unnameable causes
// named raw, trail kept; a zero-death window counts AGAINST — the family
// is then unnameable), (2) the 30d pantry trajectory readable, (3) the
// polity state at death readable, (4) the ±4d co-occurrence listed (empty
// is honest, not missing). Any unreadable part counts AGAINST the 90% —
// the succhain honest-remainder convention.
'use strict';

const HL = require('./holdloss-lib-20261015');

const NATL = { national: true, global: true };
const DEATH_END = /village-dead|village-lost|pop-zero/;
const PERSON_KIND = /player|scholar|villager|person/i;

// the night-raid template is specific ("🌙 Raid — X came in the night… They
// carried off ~N kcal"), but bare /treeline/ also matches monster-sighting
// and night-ambience beats ("The mosquito stops at the treeline", "Night.
// The treeline is just a sound now") — those are NOT village raids and must
// not inflate the bucket (2026-10-15 repair: s77 read 8 raids, 5 were
// sightings). Keep the specific raid phrases; capture stays broad.
const RAID_RE = /🌙 raid|raid —|carried off|raiders\b|shouts from the treeline|unanswered raid|held the treeline|outnumbered/i;
const SUCC_RE = /dead hold no treaties|succession|realm came apart/i;
const CONTEST_RE = /contest|arena/i;
const SNAP_RE = /the neglected link snaps|grief is leverage|tribute rises/i;
const WAVE_RE = /wave (4|5)|fourth draft|fifth draft|mirror draft/i;
const WIN_BEAT = /you won\. say it plainly: you won/i;

function num(x, d) { const n = Number(x); return Number.isFinite(n) ? n : (d == null ? 0 : d); }

// nearestRow(rows, day): the last row with row.day <= day (instrument reads
// what the village knew on that day — never forward-looking).
function nearestRow(rows, day) {
  let best = null;
  for (const r of (rows || [])) {
    if (num(r.day, 0) <= day && (!best || r.day > best.day)) best = r;
  }
  return best;
}

// villageDeathWindow(rec): null unless the village died WITH the rank still
// on. Returns {deathDay, lo, hi} or null.
function villageDeathWindow(rec) {
  rec = rec || {};
  const scaleRows = rec.scaleRows || [];
  const er = String(rec.endReason || '?');
  if (!DEATH_END.test(er)) return null;
  const lastRow = scaleRows[scaleRows.length - 1];
  if (!lastRow || !NATL[lastRow.rank]) return null;
  const deathDay = num(rec.days, 0);
  return { deathDay, lo: deathDay - 30, hi: deathDay + 1, endReason: er };
}

// deathShares(rec, win): every person death in the loss window, with family
// shares + exact causes + the bearer <redacted> sub-listed.
function deathShares(rec, win) {
  const wd = ((rec || {}).deaths || []).filter(d =>
    PERSON_KIND.test(String(d.kind || '')) && num(d.day, 0) >= win.lo && num(d.day, 0) <= win.hi);
  const deaths = wd.map(d => {
    const f = HL.classifyDeathFamily(d.cause);
    return {
      day: num(d.day, 0), name: String(d.name || '?'), cause: String(d.cause || '?'),
      family: f.family || 'other-named', rawCause: f.raw,
      bearer: d.player === true || /player|scholar/i.test(String(d.kind || '')),
    };
  }).sort((a, b) => a.day - b.day);
  const famCounts = {}, subCauses = {};
  for (const d of deaths) {
    famCounts[d.family] = (famCounts[d.family] || 0) + 1;
    subCauses[d.cause] = (subCauses[d.cause] || 0) + 1;
  }
  const total = deaths.length;
  const famShares = {};
  for (const f of Object.keys(famCounts)) famShares[f] = total ? +(famCounts[f] / total).toFixed(2) : 0;
  const ranked = Object.keys(famCounts).sort((a, b) => famCounts[b] - famCounts[a]);
  return {
    total, deaths, famCounts, subCauses, famShares,
    modalFamily: ranked.length ? ranked[0] : null,
    bearerDeaths: deaths.filter(d => d.bearer),
  };
}

// pantryTrajectory(rec, win): the 30d food story before death. Returns
// {readable, ...} — unreadable (no food rows in the window) fails the
// attribution honestly.
function pantryTrajectory(rec, win) {
  const rows = ((rec || {}).foodRows || []).filter(r => num(r.day, 0) >= win.lo && num(r.day, 0) <= win.hi);
  if (!rows.length) return { readable: false, evidence: ['no foodRows in the death window — pantry trajectory unreadable'] };
  const at = (d) => nearestRow(rows, d);
  const marks = [-30, -15, -7, -1].map(off => {
    const r = at(win.deathDay + off);
    return r ? { off, day: num(r.day, 0), pantryDays: num(r.pantryDays, 0), pantryKcal: Math.round(num(r.pantryKcal, 0)), pop: num(r.pop, 0), ateShare: r.ateShare == null ? null : num(r.ateShare, 0) } : { off, day: null, pantryDays: null };
  });
  let minPantry = null, minDay = null;
  for (const r of rows) {
    const pd = num(r.pantryDays, 0);
    if (minPantry == null || pd < minPantry) { minPantry = pd; minDay = num(r.day, 0); }
  }
  let starvedDays = 0;
  for (const r of rows) {
    const as = r.ateShare;
    if (r.starved === true || (as != null && num(as, 100) < 60)) starvedDays++;
  }
  let hitZeroDay = null;
  for (const r of rows) {
    if (num(r.pantryDays, 0) <= 0) { hitZeroDay = num(r.day, 0); break; }
  }
  const end = at(win.deathDay);
  return {
    readable: true, marks, minPantryDays: minPantry != null ? +minPantry.toFixed(1) : null, minDay,
    starvedDays, hitZeroDay,
    endPantryDays: end ? +num(end.pantryDays, 0).toFixed(1) : null,
    endPantryKcal: end ? Math.round(num(end.pantryKcal, 0)) : null,
    endPop: end ? num(end.pop, 0) : null,
    evidence: [
      `pantry ${marks.map(m => (m.day != null ? `${m.off}d:d${m.day}=${m.pantryDays != null ? m.pantryDays.toFixed(1) : '?'}d` : `${m.off}d:?`)).join(' ')}`,
      `window min ${minPantry != null ? minPantry.toFixed(1) + 'd' : '?'} (d${minDay}), starved-days ${starvedDays}/30, ` +
      (hitZeroDay != null ? `pantry hit 0 on d${hitZeroDay}` : 'pantry never hit 0 in the window') +
      `, at death: ${end ? `${num(end.pantryDays, 0).toFixed(1)}d, pop ${num(end.pop, 0)}` : '?'}`,
    ],
  };
}

// coOccur4(rec, deathDay): raid / succession / contest-arena / tribute-snap
// / wave-unlock beats ±4d of the death day. Named even when empty.
function coOccur4(rec, deathDay) {
  const out = { raids: [], successions: [], contests: [], snaps: [], waves: [] };
  for (const b of ((rec || {}).beats || [])) {
    const bd = num(b.day, 0);
    if (Math.abs(bd - deathDay) > 4) continue;
    const t = String(b.text || '');
    const line = { day: bd, text: t.slice(0, 160) };
    if (RAID_RE.test(t)) out.raids.push(line);
    if (SUCC_RE.test(t)) out.successions.push(line);
    if (CONTEST_RE.test(t)) out.contests.push(line);
    if (SNAP_RE.test(t)) out.snaps.push(line);
    if (WAVE_RE.test(t)) out.waves.push(line);
  }
  return out;
}

// polityAtDeath(rec, deathDay): nearest scaleRow <= deathDay. null when
// unreadable (attribution penalty).
function polityAtDeath(rec, deathDay) {
  const row = nearestRow((rec || {}).scaleRows, deathDay);
  if (!row) return null;
  const links = (row.links || []).map(l => ({
    vid: String(l.vid || '?'), kind: String(l.kind || '?'), trust: num(l.trust, 0),
    arrears: num(l.arrears, 0), perWeek: num(l.perWeek, 0), age: num(l.age, 0),
  }));
  return {
    day: num(row.day, 0), rank: String(row.rank || '?'), exiled: !!row.exiled,
    nLinks: links.length, links,
    totalArrears: links.reduce((t, l) => t + l.arrears, 0),
    minTrust: links.length ? Math.min.apply(null, links.map(l => l.trust)) : null,
  };
}

// wonByBeat(rec): the engine's win beat is the authority (endReason regexes
// lie about the table — sim-succhain's win-detection correction).
function wonByBeat(rec) {
  return ((rec || {}).beats || []).some(b => WIN_BEAT.test(String(b.text || '')));
}

// attributeVillageDeath(rec): the full attribution packet for one run.
function attributeVillageDeath(rec) {
  rec = rec || {};
  const win = villageDeathWindow(rec);
  if (!win) {
    // not a national-hold village death — outside the census denominator.
    return { diedHolding: false, attributed: null, deathDay: null };
  }
  const shares = deathShares(rec, win);
  const pantry = pantryTrajectory(rec, win);
  const co = coOccur4(rec, win.deathDay);
  const polity = polityAtDeath(rec, win.deathDay);
  const evidence = [];
  let attributed = true;
  if (!shares.total) {
    evidence.push('no person deaths in the 30d window — the cause family is unnameable from death records');
    attributed = false;
  } else {
    evidence.push(`death shares (30d): ${Object.keys(shares.famCounts).map(f => `${f} ${shares.famCounts[f]}/${shares.total}`).join(', ')}; modal ${shares.modalFamily}`);
  }
  if (!pantry.readable) { evidence.push(pantry.evidence[0]); attributed = false; }
  else evidence.push(pantry.evidence.join(' | '));
  if (!polity) { evidence.push('polity state unreadable at death (no scaleRow <= deathDay) — attribution FAILS honestly'); attributed = false; }
  else {
    const linkStr = polity.links.length
      ? polity.links.map(l => `${l.vid}(${l.kind},trust ${l.trust},arrears ${l.arrears})`).join(' | ')
      : 'no links';
    evidence.push(`polity at death (d${polity.day}): ${polity.rank}, ${polity.nLinks} link(s) — ${linkStr}; total arrears ${polity.totalArrears}kcal`);
  }
  const coN = co.raids.length + co.successions.length + co.contests.length + co.snaps.length + co.waves.length;
  // the wave/draft bucket matches mirror-draft MENTIONS, which include
  // status beats ("The Mirror Draft is still waiting"), not just unlocks —
  // label it wave/draft, not wave-unlock.
  evidence.push(`co-occurrence ±4d of d${win.deathDay}: ${co.raids.length} raids, ${co.successions.length} successions, ${co.contests.length} contest/arena, ${co.snaps.length} tribute-snaps, ${co.waves.length} wave/draft`);
  if (!coN) evidence.push('(no co-occurring beats in the ±4d window — the death reads as attritional, not event-driven)');
  return {
    diedHolding: true, deathDay: win.deathDay, endReason: win.endReason,
    attributed, evidence,
    deathShares: shares, pantry, cooccur: co, polity,
  };
}

// deathNarrative(rec, packet): the village's last 30 days in plain words —
// a first-class deliverable under the SENSE-TESTING LAW (read, not counted).
function deathNarrative(rec, packet) {
  rec = rec || {}; packet = packet || {};
  if (!packet.diedHolding) return 'not a national-hold village death (outside the census).';
  const lines = [];
  const natRows = ((rec || {}).scaleRows || []).filter(r => NATL[r.rank]);
  const firstNat = natRows.length ? Math.min.apply(null, natRows.map(r => num(r.day, 0))) : '?';
  lines.push(`national since d${firstNat}; the village dies ${packet.endReason} on d${packet.deathDay} with the rank still on.`);
  const p = packet.pantry;
  if (p && p.readable) {
    // all four marks, not just the endpoints — the mid-window shape (a
    // recovery, a second crash) is the story the sense-read needs.
    const marks = p.marks.map(m => m.day != null && m.pantryDays != null
      ? `${m.pantryDays.toFixed(1)}d on d${m.day}` : '?').join(' -> ');
    lines.push(`the pantry story: ${marks}; ` +
      `window min ${p.minPantryDays != null ? `${p.minPantryDays.toFixed(1)}d (d${p.minDay})` : 'unknown'}; ` +
      `${p.starvedDays} starved days in the window (ate-share <60% or the starved flag)${p.hitZeroDay != null ? `; the pantry hit 0 on d${p.hitZeroDay}` : ''}.`);
  } else {
    lines.push('the pantry story: UNREADABLE (no food rows in the death window).');
  }
  const s = packet.deathShares;
  if (s && s.total) {
    lines.push(`${s.total} person deaths in the last 30d:`);
    for (const d of s.deaths.slice(0, 24)) {
      lines.push(`  d${d.day} ${d.name}${d.bearer ? ' (the bearer)' : ''} — ${d.cause} [${d.family}]`);
    }
    const named = Object.keys(s.famCounts).map(f => `${s.famCounts[f]} ${f}`).join(', ');
    lines.push(`the family tally: ${named}.`);
  } else {
    lines.push('no person deaths recorded in the last 30d — the village ends without a visible death ledger.');
  }
  const c = packet.cooccur;
  if (c) {
    const parts = [];
    if (c.raids.length) parts.push(`${c.raids.length} raid(s): ${c.raids.slice(0, 3).map(b => `d${b.day} "${b.text.slice(0, 90)}"`).join('; ')}`);
    if (c.successions.length) parts.push(`${c.successions.length} succession beat(s): ${c.successions.slice(0, 3).map(b => `d${b.day} "${b.text.slice(0, 90)}"`).join('; ')}`);
    if (c.contests.length) parts.push(`${c.contests.length} contest/arena beat(s): ${c.contests.slice(0, 3).map(b => `d${b.day} "${b.text.slice(0, 90)}"`).join('; ')}`);
    if (c.snaps.length) parts.push(`${c.snaps.length} tribute-snap beat(s): ${c.snaps.slice(0, 3).map(b => `d${b.day} "${b.text.slice(0, 90)}"`).join('; ')}`);
    if (c.waves.length) parts.push(`${c.waves.length} wave/draft beat(s)`);
    lines.push(parts.length ? `in the ±4d co-occurrence window: ${parts.join(' | ')}.` : 'no raid, succession, contest, or tribute-snap beats in the ±4d co-occurrence window — the end reads as attritional.');
  }
  const po = packet.polity;
  if (po) {
    lines.push(`at death the polity holds: ${po.rank}, ${po.nLinks} link(s), total arrears ${po.totalArrears}kcal` +
      (po.minTrust != null ? `, weakest trust ${po.minTrust}` : '') + '.');
  } else {
    lines.push('the polity at death: UNREADABLE.');
  }
  lines.push(packet.attributed
    ? 'verdict: ATTRIBUTED — the packet above names the terminal cause families, the pantry crash, the polity, and the co-occurrence.'
    : 'verdict: UNATTRIBUTED — one of the four attribution parts is missing (see the packet evidence); the instrument refuses to name what it cannot read.');
  return lines.join('\n');
}

module.exports = {
  villageDeathWindow, deathShares, pantryTrajectory, coOccur4, polityAtDeath,
  wonByBeat, attributeVillageDeath, deathNarrative, nearestRow,
  DEATH_END, WIN_BEAT,
};
