// analyze-partysurvive-b.js — analyzer + judge, arm sim-partysurvive-b.
// The launch-party survival-to-the-fight diagnostic (tracker blank 1,
// fightcap follow-up). INSTRUMENT ONLY — no game code changes.
// Reads ONE per-seed corpus dir (the fightcap driver recorder shape)
// and decomposes WHY launched quad-party members die before the
// fight: every launched member tracked day-by-day from launch to
// meeting-or-death, each pre-fight death classified by cause.
// Reuses analyze-fightcap-b.js quadLaunches + correctedJoin
// (finding #2570) verbatim, so the launch/meeting population is the
// same one fightcap-b judged. Death days come from the `deaths` rows
// and are cross-checked against the `daily[].roster` dead flags.
// Usage:
//   node scripts/analyze-partysurvive-b.js --dir evidence/2026-11-19/perseed-partysurvive-b [--out evidence/2026-11-19/partysurvive-b-analysis.json]
//   node scripts/analyze-partysurvive-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const FCB = require(path.join(__dirname, 'analyze-fightcap-b.js'));
const PQ = require(path.join(__dirname, 'analyze-partyquads-b.js'));
const quadLaunches = FCB.quadLaunches;
const correctedJoin = FCB.correctedJoin;
const summarizeLeg = PQ.summarizeLeg;

// FROZEN BARS (prereg evidence/2026-11-19/sim-partysurvive-b-prereg.md).
const BARS = {
  poolLaunches: 6,        // quad launches on the leg (fightcap arm measured 24)
  poolPreFightDeaths: 3,  // died-before-meeting deaths (CORRECTED
  // 2026-11-19: the reference band yields 3 under THIS arm's
  // first-meeting definition, not fightcap's 10 dead-at-any-meeting;
  // floor set from the reference-band measurement, not the 10)
  classifiedShare: 0.90,  // classified pre-fight deaths / all pre-fight deaths
};

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function quartile(xs, q) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const i = (s.length - 1) * q;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (i - lo);
}

// Monster roster (src/data/monsters.json): id and display name -> wave.
// Death causes name monsters by display name ('Gavel', 'The Spoiler');
// the generic 'monster' cause names none. Nicknames the village
// invents ('The Loud Bastard', 'Loud-Eyes') match nothing here and
// fall to `other` with the raw cause recorded — see classifyCause.
function loadMonsterMap() {
  const byName = {}, byId = {};
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    for (const m of list) {
      if (!m || !m.id) continue;
      byId[m.id] = { id: m.id, name: m.name || m.id, wave: (m.wave | 0) || null };
      if (m.name) byName[String(m.name).toLowerCase()] = byId[m.id];
      byName[m.id.toLowerCase()] = byId[m.id];
      // 'The Spoiler' vs name 'The Spoiler' is covered; also allow
      // the name with the leading 'The ' stripped.
      if (m.name && /^the /i.test(m.name)) byName[m.name.replace(/^the /i, '').toLowerCase()] = byId[m.id];
    }
  } catch (e) { /* empty map: every named cause falls to `other` */ }
  return { byName: byName, byId: byId };
}
const MONSTERS = loadMonsterMap();

// Same-day recorded fight link: a v4encounters row on the death day
// where the member fought (fighter or ally). Any origin counts —
// the question is whether the member was in a recorded fight that
// day, not which router called it. `mid` restricts to one monster
// when the cause names one.
function linkedFight(d, vid, day, mid) {
  for (const e of (d.v4encounters || [])) {
    if (e.day !== day) continue;
    if (mid && e.mid !== mid) continue;
    if (e.vid !== vid && (e.allyVids || []).indexOf(vid) === -1) continue;
    if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue; // no-contact evade
    return e;
  }
  return null;
}

// Fought anywhere between launch (exclusive) and death (inclusive):
// any fought v4encounters row with the member as fighter or ally.
// Wave 1-3 fights are NOT in v4encounters by design, so a `false`
// here means "no RECORDED wave-4+ fight", never "never fought".
function foughtEnRoute(d, vid, launchDay, deathDay) {
  const rows = [];
  for (const e of (d.v4encounters || [])) {
    if (e.day <= launchDay || e.day > deathDay) continue;
    if (e.vid !== vid && (e.allyVids || []).indexOf(vid) === -1) continue;
    if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue;
    rows.push(e);
  }
  return rows;
}

// Last-known position vs Haven from the LAUNCHSURVIVE tracker rows
// (holder rows only; partyNodes covers companions). Returns
// 'on-road' | 'at-haven' | 'unknown' (+ the raw node for the record).
function roadPosition(d, launch, member, uptoDay) {
  const track = (d.v4launchTrack || []).filter(function (r) {
    return r.vid === launch.vid && r.day <= uptoDay;
  });
  if (!track.length) return { pos: 'unknown', node: null, haven: null };
  const last = track[track.length - 1];
  const haven = last.haven || null;
  let node = null;
  if (member === launch.vid) node = last.holderNode || null;
  else if (last.partyNodes) node = last.partyNodes[member] || null;
  if (!node || !haven) return { pos: 'unknown', node: node, haven: haven };
  const atHaven = node.nx === haven.nx && node.ny === haven.ny;
  return { pos: atHaven ? 'at-haven' : 'on-road', node: node, haven: haven };
}

// CORRECTION (2026-11-19, before any judged sim — see prereg
// correction note): the `daily[].roster` is the LIVING roster. The
// dead do not flip a flag — they VANISH (present with dead:false on
// the death day, absent from the next day on; `dead` never reads
// true in the fightcap corpora). So the cross-check is presence-
// based: last-seen day vs death day, ±1 day snapshot tolerance on
// the early side (a member may die after the day's snapshot), strict
// on the late side (seen after the death day is impossible).
// Early vanish (last seen more than a day before the death day) is
// recorded separately as a warning, not a failure: the living can
// leave the roster for other reasons (exile, departure).
function rosterLastSeen(d, vid) {
  const days = (d.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
  let lastSeen = null, seen = false;
  for (const row of days) {
    for (const r of (row.roster || [])) {
      if (r.vid !== vid) continue;
      seen = true;
      if (lastSeen == null || row.day > lastSeen) lastSeen = row.day;
    }
  }
  return { lastSeen: lastSeen, seen: seen };
}

// Cause classification (FROZEN precedence — prereg §"Pre-fight death
// cause classes"). Exactly one class per death; classes 1-9 count as
// classified, class 10 (`unclassified`) counts against the bar.
function classifyCause(d, member, deathDay, causeRaw) {
  const cause = (causeRaw == null ? '' : String(causeRaw));
  const low = cause.toLowerCase();
  function fieldFight(sub, monster) {
    return { causeClass: 'field-fight', sub: sub, monster: monster ? monster.name : null,
      monsterId: monster ? monster.id : null, wave: monster ? monster.wave : null, causeRaw: cause };
  }
  if (cause === 'the arena' || cause === 'contest') {
    return { causeClass: 'contest-arena', sub: cause === 'contest' ? 'contest' : 'arena', monster: null, monsterId: null, wave: null, causeRaw: cause };
  }
  if (low === 'starvation') return { causeClass: 'starvation', sub: 'starvation', monster: null, monsterId: null, wave: null, causeRaw: cause };
  if (low === 'thirst' || low === 'dehydration') return { causeClass: 'thirst', sub: low, monster: null, monsterId: null, wave: null, causeRaw: cause };
  if (low === "a wound that wouldn't close") return { causeClass: 'wounds', sub: 'wound-fever', monster: null, monsterId: null, wave: null, causeRaw: cause };
  if (low === 'a stranger') return { causeClass: 'stranger', sub: 'stranger', monster: null, monsterId: null, wave: null, causeRaw: cause };
  if (low === 'the night') return { causeClass: 'the-night', sub: 'the-night', monster: null, monsterId: null, wave: null, causeRaw: cause };
  // Named monster (roster match by id or display name).
  const monster = MONSTERS.byName[low] || null;
  if (monster) {
    const link = linkedFight(d, member, deathDay, monster.id);
    if (link) return fieldFight('linked-v4', monster);
    if (monster.wave != null && monster.wave < 4) return fieldFight('wave1-3-unrecorded', monster);
    return fieldFight('named-unlinked-v4+', monster);
  }
  if (low === 'monster') {
    const link = linkedFight(d, member, deathDay, null);
    if (link) {
      const m = MONSTERS.byId[link.mid] || null;
      return fieldFight('linked-v4', m);
    }
    return { causeClass: 'field-fight', sub: 'unnamed', monster: null, monsterId: null, wave: null, causeRaw: cause };
  }
  if (low === 'the wild') {
    const link = linkedFight(d, member, deathDay, null);
    if (link) {
      const m = MONSTERS.byId[link.mid] || null;
      return fieldFight('linked-v4', m);
    }
    return { causeClass: 'the-wild', sub: 'the-wild', monster: null, monsterId: null, wave: null, causeRaw: cause };
  }
  if (!cause) return { causeClass: 'unclassified', sub: 'no-cause-value', monster: null, monsterId: null, wave: null, causeRaw: cause };
  return { causeClass: 'other', sub: 'other', monster: null, monsterId: null, wave: null, causeRaw: cause };
}

// First joined meeting (day + row) of a quad launch: fought
// expedition encounters joined by the CORRECTED join; earliest day
// wins (file order on a same-day tie).
function firstMeeting(d, quads, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.origin !== 'expedition') continue;
    if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue;
    const joined = correctedJoin(quads, e);
    if (!joined || joined.launch !== launch) continue;
    if (!best || e.day < best.day) best = e;
  }
  return best;
}

// One per-seed file: track every member of every quad launch.
function analyzeFile(d) {
  const quads = quadLaunches(d);
  const deathsByVid = {};
  for (const dd of (d.deaths || [])) {
    if (dd.kind !== 'villager' || !dd.who) continue;
    if (deathsByVid[dd.who] == null) deathsByVid[dd.who] = dd; // first death row wins
  }
  const members = [];
  const crossCheck = { checked: 0, agree: 0, disagree: [], unchecked: 0, earlyVanish: [] };
  for (const launch of quads) {
    const meeting = firstMeeting(d, quads, launch);
    for (const member of launch.party) {
      const isHolder = member === launch.vid;
      const dd = deathsByVid[member] || null;
      const deathDay = dd ? (dd.day | 0) : null;
      // Death-day cross-check against the daily roster (presence-
      // based — see rosterLastSeen): last seen must be the death day
      // or the day before; seen after the death day is impossible.
      const rl = rosterLastSeen(d, member);
      if (deathDay != null && rl.seen) {
        crossCheck.checked++;
        if (rl.lastSeen === deathDay || rl.lastSeen === deathDay - 1) crossCheck.agree++;
        else if (rl.lastSeen > deathDay) crossCheck.disagree.push({ seed: d.seed, member: member, deathsDay: deathDay, rosterLastSeen: rl.lastSeen });
        else crossCheck.earlyVanish.push({ seed: d.seed, member: member, deathsDay: deathDay, rosterLastSeen: rl.lastSeen });
      } else if (deathDay != null && !rl.seen) {
        crossCheck.unchecked++;
      }
      const rec = { seed: d.seed, launchDay: launch.day, launchHolder: launch.vid,
        target: launch.target || null, targetWave: launch.targetWave != null ? launch.targetWave : null,
        member: member, isHolder: isHolder, meetingDay: meeting ? meeting.day : null,
        meetingMid: meeting ? meeting.mid : null, meetingWave: meeting ? meeting.wave : null,
        deathDay: deathDay, daysToDeath: deathDay != null ? deathDay - launch.day : null,
        outcome: null, causeClass: null, sub: null, monster: null, monsterId: null, wave: null,
        causeRaw: dd ? dd.cause : null, sameDayFlag: false, foughtEnRoute: [], roadPos: 'unknown',
        roadNode: null, rosterLastSeen: rl.lastSeen, rosterSeen: rl.seen };
      if (meeting) {
        const inMeeting = meeting.vid === member || (meeting.allyVids || []).indexOf(member) !== -1;
        if (deathDay != null && deathDay <= meeting.day && !(deathDay === meeting.day && inMeeting)) {
          rec.outcome = 'died-before-meeting';
          if (deathDay === meeting.day) rec.sameDayFlag = true;
        } else if (deathDay != null && deathDay === meeting.day && inMeeting) {
          rec.outcome = 'died-in-meeting';
        } else {
          rec.outcome = 'alive-at-meeting';
        }
      } else {
        if (deathDay != null && deathDay <= launch.day + 21) rec.outcome = 'died-in-window-no-meeting';
        else rec.outcome = 'survived-window-no-meeting';
      }
      if (rec.outcome === 'died-before-meeting' || rec.outcome === 'died-in-window-no-meeting') {
        const c = dd ? classifyCause(d, member, deathDay, dd.cause) : { causeClass: 'unclassified', sub: 'no-deaths-row', monster: null, monsterId: null, wave: null, causeRaw: null };
        rec.causeClass = c.causeClass; rec.sub = c.sub; rec.monster = c.monster;
        rec.monsterId = c.monsterId; rec.wave = c.wave; rec.causeRaw = c.causeRaw;
        const fought = foughtEnRoute(d, member, launch.day, deathDay);
        rec.foughtEnRoute = fought.map(function (e) { return { day: e.day, mid: e.mid, wave: e.wave, origin: e.origin || null, outcome: e.outcome || null, rounds: e.rounds || 0 }; });
        const rp = roadPosition(d, launch, member, deathDay);
        rec.roadPos = rp.pos; rec.roadNode = rp.node;
      } else if (rec.outcome === 'died-in-meeting') {
        rec.causeClass = 'died-in-meeting'; rec.sub = 'meeting-fight';
        rec.monster = meeting.mid; rec.monsterId = meeting.mid; rec.wave = meeting.wave;
      }
      members.push(rec);
    }
  }
  return { seed: d.seed, quads: quads.length, members: members, crossCheck: crossCheck,
    launchTrackOn: !!d.launchTrackOn, launchTrackRows: (d.v4launchTrack || []).length };
}

// Aggregate one corpus dir.
function analyzeDir(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let members = [];
  let crossChecked = 0, crossAgree = 0, crossDisagree = [], crossUnchecked = 0, crossEarlyVanish = [];
  let launches = 0, errors = 0, filesRead = 0;
  const seeds = [];
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    filesRead++;
    seeds.push(d.seed);
    errors += ((d.instrumentErrors || []).length);
    const a = analyzeFile(d);
    launches += a.quads;
    members = members.concat(a.members);
    crossChecked += a.crossCheck.checked; crossAgree += a.crossCheck.agree;
    crossDisagree = crossDisagree.concat(a.crossCheck.disagree);
    crossUnchecked += a.crossCheck.unchecked;
    crossEarlyVanish = crossEarlyVanish.concat(a.crossCheck.earlyVanish);
    perSeed.push({ seed: d.seed, quads: a.quads, members: a.members.length,
      meetings: a.members.filter(function (m) { return m.meetingDay != null; }).length,
      aliveAtMeeting: a.members.filter(function (m) { return m.outcome === 'alive-at-meeting'; }).length,
      preFightDeaths: a.members.filter(function (m) { return m.outcome === 'died-before-meeting'; }).length,
      diedInMeeting: a.members.filter(function (m) { return m.outcome === 'died-in-meeting'; }).length,
      diedNoMeeting: a.members.filter(function (m) { return m.outcome === 'died-in-window-no-meeting'; }).length,
      survivedNoMeeting: a.members.filter(function (m) { return m.outcome === 'survived-window-no-meeting'; }).length,
      launchTrackOn: a.launchTrackOn, launchTrackRows: a.launchTrackRows });
  }
  const preFight = members.filter(function (m) { return m.outcome === 'died-before-meeting'; });
  const byCause = {};
  const bySub = {};
  const byMonster = {};
  for (const m of preFight) {
    byCause[m.causeClass] = (byCause[m.causeClass] || 0) + 1;
    bySub[m.causeClass + '/' + m.sub] = (bySub[m.causeClass + '/' + m.sub] || 0) + 1;
    const mk = (m.monster || m.causeRaw || 'unknown') + (m.wave != null ? ' (w' + m.wave + ')' : '');
    byMonster[mk] = (byMonster[mk] || 0) + 1;
  }
  const classified = preFight.filter(function (m) { return m.causeClass !== 'unclassified'; }).length;
  const topCause = Object.keys(byCause).sort(function (a, b) { return byCause[b] - byCause[a]; })[0] || null;
  // Survival curve (frozen): alive at meeting time over launches WITH
  // a meeting; alive at +7/+21 over ALL launched members.
  const met = members.filter(function (m) { return m.meetingDay != null; });
  const aliveMet = met.filter(function (m) { return m.outcome === 'alive-at-meeting'; }).length;
  const deadMet = met.filter(function (m) { return m.outcome === 'died-before-meeting'; }).length;
  const alive7 = members.filter(function (m) { return m.deathDay == null || m.deathDay > m.launchDay + 7; }).length;
  const alive21 = members.filter(function (m) { return m.deathDay == null || m.deathDay > m.launchDay + 21; }).length;
  const daysToDeath = preFight.map(function (m) { return m.daysToDeath; }).filter(function (x) { return x != null; });
  const noMeetingDeaths = members.filter(function (m) { return m.outcome === 'died-in-window-no-meeting'; });
  const noMeetingByCause = {};
  for (const m of noMeetingDeaths) noMeetingByCause[m.causeClass] = (noMeetingByCause[m.causeClass] || 0) + 1;
  const holderPre = preFight.filter(function (m) { return m.isHolder; }).length;
  const compPre = preFight.filter(function (m) { return !m.isHolder; }).length;
  const sameDay = preFight.filter(function (m) { return m.sameDayFlag; }).length;
  return { dir: dir, files: filesRead, seeds: seeds, errors: errors, launches: launches,
    membersTracked: members.length, perSeed: perSeed, members: members,
    preFightDeaths: preFight.length, classified: classified,
    classifiedShare: preFight.length ? classified / preFight.length : null,
    byCause: byCause, bySub: bySub, byMonster: byMonster, topCause: topCause,
    survival: { metMembers: met.length, aliveAtMeeting: aliveMet, diedBeforeMeeting: deadMet,
      shareAliveAtMeeting: met.length ? aliveMet / met.length : null,
      shareAlivePlus7: members.length ? alive7 / members.length : null,
      shareAlivePlus21: members.length ? alive21 / members.length : null,
      daysToDeathMedian: median(daysToDeath), daysToDeathQ1: quartile(daysToDeath, 0.25),
      daysToDeathQ3: quartile(daysToDeath, 0.75), daysToDeath: daysToDeath.slice().sort(function (a, b) { return a - b; }) },
    holderPreFight: holderPre, companionPreFight: compPre, sameDayFlagged: sameDay,
    diedInMeeting: members.filter(function (m) { return m.outcome === 'died-in-meeting'; }).length,
    noMeetingDeaths: noMeetingDeaths.length, noMeetingByCause: noMeetingByCause,
    crossCheck: { checked: crossChecked, agree: crossAgree, disagree: crossDisagree, unchecked: crossUnchecked, earlyVanish: crossEarlyVanish } };
}

function judge(a, leg) {
  const bars = [];
  const poolOk = a.launches >= BARS.poolLaunches && a.preFightDeaths >= BARS.poolPreFightDeaths;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'quad launches ' + a.launches + ' (floor ' + BARS.poolLaunches + '); pre-fight deaths ' + a.preFightDeaths + ' (floor ' + BARS.poolPreFightDeaths + '); members tracked ' + a.membersTracked });
  const classPass = poolOk && a.classifiedShare != null && a.classifiedShare >= BARS.classifiedShare;
  bars.push({ id: 'primary-classified-share', pass: classPass,
    detail: 'classified pre-fight deaths ' + a.classified + '/' + a.preFightDeaths + ' = ' + (a.classifiedShare == null ? 'n/a' : a.classifiedShare.toFixed(3)) + ' (bar >= ' + BARS.classifiedShare.toFixed(2) + '); top cause ' + (a.topCause || 'none') + ' (' + (a.topCause ? a.byCause[a.topCause] : 0) + ')' });
  const curvePass = poolOk && a.survival.shareAliveAtMeeting != null && a.survival.daysToDeathMedian != null;
  bars.push({ id: 'primary-survival-curve', pass: curvePass,
    detail: 'share alive at meeting ' + (a.survival.shareAliveAtMeeting == null ? 'n/a' : a.survival.shareAliveAtMeeting.toFixed(3)) + ' (' + a.survival.aliveAtMeeting + '/' + a.survival.metMembers + '); median days launch→death ' + a.survival.daysToDeathMedian + ' (Q1 ' + a.survival.daysToDeathQ1 + ', Q3 ' + a.survival.daysToDeathQ3 + '); alive +7d ' + (a.survival.shareAlivePlus7 == null ? 'n/a' : a.survival.shareAlivePlus7.toFixed(3)) + ', +21d ' + (a.survival.shareAlivePlus21 == null ? 'n/a' : a.survival.shareAlivePlus21.toFixed(3)) });
  const instrPass = a.errors === 0 && a.files === 8 && a.crossCheck.disagree.length === 0;
  bars.push({ id: 'instrument', pass: instrPass,
    detail: 'instrument errors ' + a.errors + ' (bar 0); files ' + a.files + '/8; death-day cross-check ' + a.crossCheck.agree + '/' + a.crossCheck.checked + ' agree, ' + a.crossCheck.disagree.length + ' disagree, ' + a.crossCheck.unchecked + ' unchecked (no roster row), ' + (a.crossCheck.earlyVanish || []).length + ' early-vanish warnings' });
  let verdict = 'NO-GO', kind = '';
  if (a.launches < BARS.poolLaunches || a.preFightDeaths < BARS.poolPreFightDeaths) { verdict = 'NO-GO'; kind = a.preFightDeaths === 0 ? 'NO-PRE-FIGHT-DEATHS' : 'METRIC-BROKEN'; }
  else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

// Reproduce the fightcap-b arm reference: the sense-miss by-cause
// table must read Dead 10 / Expedition ended 5 / different-tile 3 /
// same-tile 1 / Different expedition 1 / trim-unproven 1.
function reproduceFightcap(dir) {
  const misses = FCB.senseMisses(dir, false);
  const expected = { 'dead': 10, 'expedition-ended': 5,
    'in-plan-party-but-unsensed/different-tile': 3,
    'in-plan-party-but-unsensed/same-tile': 1,
    'different-expedition': 1, 'trim-unproven': 1 };
  const ok = Object.keys(expected).every(function (k) { return (misses.byCause[k] || 0) === expected[k]; }) &&
    Object.keys(misses.byCause).every(function (k) { return expected[k] != null; });
  return { ok: ok, byCause: misses.byCause, meetings: misses.meetings, senseFull: misses.senseFull, expected: expected };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  function mkDaily(entries) {
    // entries: {vid, lastSeen|null} — the LIVING roster: a vid is
    // present while day <= lastSeen, then vanishes (null = alive
    // the whole run). Mirrors the recorder: the dead vanish, no
    // dead flag ever flips.
    const daily = [];
    for (let day = 1; day <= 70; day++) {
      const roster = entries.filter(function (e) { return e.lastSeen == null || day <= e.lastSeen; })
        .map(function (e) { return { vid: e.vid, name: e.vid, dead: false }; });
      daily.push({ day: day, roster: roster });
    }
    return daily;
  }
  function mkSeed() {
    return {
      seed: 999001,
      instrumentErrors: [],
      v4departs: [
        { day: 10, vid: 'h1', result: 'launch', target: 'eater', targetWave: 4,
          party: ['c1', 'c2', 'c3'], partySize: 4 },
        { day: 30, vid: 'h2', result: 'launch', target: 'audit', targetWave: 4,
          party: ['d1', 'd2', 'd3'], partySize: 4 },
      ],
      v4encounters: [
        { day: 15, vid: 'h1', mid: 'eater', wave: 4, origin: 'expedition',
          rounds: 5, mDealt: 100, allyVids: ['c1'], outcome: 'vFlee' },
      ],
      deaths: [
        { day: 12, kind: 'villager', who: 'c3', cause: 'The Spoiler', player: false },
        { day: 15, kind: 'villager', who: 'c2', cause: 'starvation', player: false },
        { day: 20, kind: 'villager', who: 'h1', cause: 'the wild', player: false },
        { day: 35, kind: 'villager', who: 'd1', cause: 'the arena', player: false },
        { day: 60, kind: 'villager', who: 'd2', cause: 'starvation', player: false },
      ],
      daily: mkDaily([
        { vid: 'h1', lastSeen: 20 }, { vid: 'c1', lastSeen: null },
        { vid: 'c2', lastSeen: 15 }, { vid: 'c3', lastSeen: 11 },
        { vid: 'h2', lastSeen: null }, { vid: 'd1', lastSeen: 35 },
        { vid: 'd2', lastSeen: 60 }, { vid: 'd3', lastSeen: null },
      ]),
      v4launchTrack: [],
    };
  }
  const d = mkSeed();
  const a = analyzeFile(d);
  check('two quad launches counted', a.quads === 2, 'got ' + a.quads);
  check('eight members tracked', a.members.length === 8, 'got ' + a.members.length);
  const byVid = {};
  for (const m of a.members) byVid[m.member] = m;
  check('c3 died-before-meeting to The Spoiler (wave 5)', byVid.c3.outcome === 'died-before-meeting' &&
    byVid.c3.causeClass === 'field-fight' && byVid.c3.wave === 5 && byVid.c3.monster === 'The Spoiler',
    JSON.stringify(byVid.c3));
  check('c3 days-to-death is 2', byVid.c3.daysToDeath === 2, 'got ' + byVid.c3.daysToDeath);
  check('c2 died-before-meeting same-day (starvation, not in meeting)', byVid.c2.outcome === 'died-before-meeting' &&
    byVid.c2.sameDayFlag === true && byVid.c2.causeClass === 'starvation', JSON.stringify(byVid.c2));
  check('c1 alive-at-meeting', byVid.c1.outcome === 'alive-at-meeting', JSON.stringify(byVid.c1));
  check('h1 alive-at-meeting (died day 20, after the d15 meeting)', byVid.h1.outcome === 'alive-at-meeting', JSON.stringify(byVid.h1));
  check('d1 died-in-window-no-meeting (arena)', byVid.d1.outcome === 'died-in-window-no-meeting' &&
    byVid.d1.causeClass === 'contest-arena', JSON.stringify(byVid.d1));
  check('d2 survived-window-no-meeting (died day 60, outside the 21d window)', byVid.d2.outcome === 'survived-window-no-meeting', JSON.stringify(byVid.d2));
  check('d3 survived-window-no-meeting', byVid.d3.outcome === 'survived-window-no-meeting', JSON.stringify(byVid.d3));
  check('death-day cross-check agrees on all 5 checked deaths', a.crossCheck.checked === 5 && a.crossCheck.agree === 5 && a.crossCheck.disagree.length === 0,
    JSON.stringify(a.crossCheck));
  // Died-in-meeting split: a member who IS in the meeting fight and
  // dies that day is not a pre-fight death.
  const d2 = mkSeed();
  d2.v4encounters[0].allyVids = ['c1', 'c2'];
  const a2 = analyzeFile(d2);
  const c2b = a2.members.filter(function (m) { return m.member === 'c2'; })[0];
  check('c2 in the meeting fight, dying that day, is died-in-meeting (not pre-fight)', c2b.outcome === 'died-in-meeting', JSON.stringify(c2b));
  // Roster disagreement is an instrument error, not silently resolved:
  // c3's deaths row says d12 but the roster still shows them d13.
  const d3 = mkSeed();
  d3.daily = mkDaily([
    { vid: 'h1', lastSeen: 20 }, { vid: 'c1', lastSeen: null },
    { vid: 'c2', lastSeen: 15 }, { vid: 'c3', lastSeen: 13 },
    { vid: 'h2', lastSeen: null }, { vid: 'd1', lastSeen: 35 },
    { vid: 'd2', lastSeen: 60 }, { vid: 'd3', lastSeen: null },
  ]);
  const a3 = analyzeFile(d3);
  check('roster disagreement (c3 deaths-row d12 vs last seen d13) is recorded', a3.crossCheck.disagree.length === 1 &&
    a3.crossCheck.disagree[0].member === 'c3', JSON.stringify(a3.crossCheck.disagree));
  // Early vanish is a warning, not a failure: c3 vanishes d9, dies d12.
  const d4 = mkSeed();
  d4.daily = mkDaily([
    { vid: 'h1', lastSeen: 20 }, { vid: 'c1', lastSeen: null },
    { vid: 'c2', lastSeen: 15 }, { vid: 'c3', lastSeen: 9 },
    { vid: 'h2', lastSeen: null }, { vid: 'd1', lastSeen: 35 },
    { vid: 'd2', lastSeen: 60 }, { vid: 'd3', lastSeen: null },
  ]);
  const a4 = analyzeFile(d4);
  check('early vanish (c3 last seen d9, dies d12) is a warning, not a disagreement', a4.crossCheck.disagree.length === 0 &&
    a4.crossCheck.earlyVanish.length === 1 && a4.crossCheck.earlyVanish[0].member === 'c3',
    JSON.stringify(a4.crossCheck));
  // classifyCause: every frozen class.
  const dc = { v4encounters: [
    { day: 12, vid: 'c3', mid: 'spoiler', wave: 5, origin: 'expedition', rounds: 4, mDealt: 50, allyVids: [] },
    { day: 12, vid: 'x1', mid: 'gavel', wave: 3, origin: 'world-tick', rounds: 3, mDealt: 20, allyVids: [] },
  ] };
  let c = classifyCause(dc, 'c3', 12, 'The Spoiler');
  check('named wave-5 monster with a same-day fight row links (linked-v4)', c.causeClass === 'field-fight' && c.sub === 'linked-v4' && c.wave === 5, JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'Gavel');
  check('named wave-3 monster with a same-day fight row links (linked-v4, wave 3)', c.causeClass === 'field-fight' && c.sub === 'linked-v4' && c.wave === 3, JSON.stringify(c));
  c = classifyCause({ v4encounters: [] }, 'x1', 12, 'Gavel');
  check('named wave-3 monster with no fight row is wave1-3-unrecorded', c.causeClass === 'field-fight' && c.sub === 'wave1-3-unrecorded' && c.wave === 3, JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'monster');
  check("generic 'monster' with a same-day fight row links (linked-v4)", c.causeClass === 'field-fight' && c.sub === 'linked-v4', JSON.stringify(c));
  c = classifyCause({ v4encounters: [] }, 'x1', 12, 'monster');
  check("generic 'monster' with no fight row is field-fight/unnamed", c.causeClass === 'field-fight' && c.sub === 'unnamed', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'the wild');
  check("'the wild' with a same-day fight row links (linked-v4 wins)", c.causeClass === 'field-fight' && c.sub === 'linked-v4', JSON.stringify(c));
  c = classifyCause({ v4encounters: [] }, 'x1', 12, 'the wild');
  check("'the wild' with no fight row stays the-wild", c.causeClass === 'the-wild', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'contest');
  check("'contest' is contest-arena", c.causeClass === 'contest-arena', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'thirst');
  check("'thirst' is thirst", c.causeClass === 'thirst', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, "a wound that wouldn't close");
  check('wound-fever is wounds', c.causeClass === 'wounds', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'a stranger');
  check("'a stranger' is stranger", c.causeClass === 'stranger', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'the night');
  check("'the night' is the-night", c.causeClass === 'the-night', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, 'The Loud Bastard');
  check('village nickname with no roster match is other (verbatim kept)', c.causeClass === 'other' && c.causeRaw === 'The Loud Bastard', JSON.stringify(c));
  c = classifyCause(dc, 'x1', 12, '');
  check('empty cause is unclassified', c.causeClass === 'unclassified', JSON.stringify(c));
  // Judge fixtures.
  function mkAgg(o) {
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, launches: 8,
      membersTracked: 32, perSeed: [], members: [], preFightDeaths: 10, classified: 10,
      classifiedShare: 1.0, byCause: { 'field-fight': 7, 'starvation': 3 }, bySub: {}, byMonster: {},
      topCause: 'field-fight',
      survival: { metMembers: 20, aliveAtMeeting: 12, diedBeforeMeeting: 8, shareAliveAtMeeting: 0.6,
        shareAlivePlus7: 0.7, shareAlivePlus21: 0.5, daysToDeathMedian: 4, daysToDeathQ1: 2, daysToDeathQ3: 9, daysToDeath: [2, 4, 9] },
      holderPreFight: 2, companionPreFight: 8, sameDayFlagged: 0, diedInMeeting: 1,
      noMeetingDeaths: 2, noMeetingByCause: {}, crossCheck: { checked: 10, agree: 10, disagree: [], unchecked: 0 } }, o);
  }
  let j = judge(mkAgg({}), null);
  check('judge GO shape passes', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkAgg({ classified: 8, classifiedShare: 0.8 }), null);
  check('judge NO-GO when classified share is 0.80 (< 0.90)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mkAgg({ preFightDeaths: 2, classified: 2, classifiedShare: 1.0 }), null);
  check('judge METRIC-BROKEN below the pre-fight-death floor', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkAgg({ preFightDeaths: 0, classified: 0, classifiedShare: null,
    survival: { metMembers: 20, aliveAtMeeting: 20, diedBeforeMeeting: 0, shareAliveAtMeeting: 1.0,
      shareAlivePlus7: 1.0, shareAlivePlus21: 1.0, daysToDeathMedian: null, daysToDeathQ1: null, daysToDeathQ3: null, daysToDeath: [] } }), null);
  check('judge NO-PRE-FIGHT-DEATHS when nobody dies before a meeting', j.verdict === 'NO-GO' && j.kind === 'NO-PRE-FIGHT-DEATHS', JSON.stringify(j));
  j = judge(mkAgg({ launches: 4 }), null);
  check('judge METRIC-BROKEN below the launch floor', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkAgg({ errors: 1 }), null);
  check('judge NO-GO on instrument errors', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  console.log('selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-partysurvive-b.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const a = analyzeDir(dir);
  const leg = summarizeLeg(dir);
  const j = judge(a, leg);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, analysis: a, wall: leg.wall,
    medianDays: leg.medianDays, launches: leg.launches, errors: leg.errors };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    launches: a.launches, membersTracked: a.membersTracked,
    preFightDeaths: a.preFightDeaths, classified: a.classified,
    classifiedShare: a.classifiedShare, byCause: a.byCause, bySub: a.bySub, byMonster: a.byMonster,
    topCause: a.topCause, survival: a.survival,
    holderPreFight: a.holderPreFight, companionPreFight: a.companionPreFight,
    sameDayFlagged: a.sameDayFlagged, diedInMeeting: a.diedInMeeting,
    noMeetingDeaths: a.noMeetingDeaths, noMeetingByCause: a.noMeetingByCause,
    crossCheck: a.crossCheck, wall: leg.wall, medianDays: leg.medianDays }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

module.exports = { analyzeDir: analyzeDir, analyzeFile: analyzeFile, judge: judge,
  classifyCause: classifyCause, linkedFight: linkedFight, rosterLastSeen: rosterLastSeen,
  firstMeeting: firstMeeting, reproduceFightcap: reproduceFightcap, BARS: BARS, selftest: selftest };


