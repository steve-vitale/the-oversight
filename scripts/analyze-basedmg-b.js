// analyze-basedmg-b.js — analyzer + judge, arm sim-basedmg-b.
// DIAG (no lever): decompose launched-party damage/round into its
// components and name which component binds (finding #2544;
// ragecarry NO-GO powered — the carrier family is exhausted, so this
// arm measures instead of building). Reuses legStats from
// analyze-fightcap-a.js (same populations, same join/presence/engaged
// filters); the STRIKE-LINE PARSER + decomposition + counterfactuals
// + judge are new here.
//
// The parser reads the FULL encounter log (the basedmg driver
// captures rec.log uncapped) plus the per-fighter gear snapshot
// (row.fighters) and turns each meeting into per-strike records:
// round, fighter, kind (strike/echo/extra/volley/ambush/finish/
// harry/birds/collision), damage, and the modifier flags named on
// the line. The base roll is reconstructed by reversing the
// modifiers in reverse application order (fieldFights.js strike
// block) and validated by re-applying forward within rounding ±2.
//
// Usage:
//   node scripts/analyze-basedmg-b.js --dir DIR [--out FILE]
//   node scripts/analyze-basedmg-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const { legStats } = require('./analyze-fightcap-a.js');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }

// ---------- strike-line parsing ----------
// Line shapes (src/js/fieldFights.js, verbatim formats):
//   lead/ally strike:  "R3: Elif strikes for 30 (x2.0) (961 left)"
//   ally echo:         "R3: Marta strikes again, louder — 12 (961 left). (Live Broadcast)"
//   extra ally:        "R3: Marta strikes again for 5 (961 left)"
//   volley:            "  loosed — the bolt takes X for 24 (961 left)."
//                      "  the bow fires — it takes X for 24 (961 left)."
//   ambush:            "Elif was already waiting — ambush! Opening strike for 19."
//   contact finish:    "Elif closes in and strikes with the spear for 22 (961 left) — ..."
//   harry/birds:       "  the pack harries it for 3." / "  the birds tear at it for 9."
//   shoulder check:    "It slams into its packmate — collision, 4 and 5."
//   Rage window open:  "Elif's eyes go red. Next 3 strikes hit twice as hard. (Rage)"
//   blooded (w5):      "Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; ...)"
//   reunion novelty:   "Elif does something they have never done — stands on one foot and recites a poem mid-fight. ..."
// Modifier notes on a strike line (fieldFights.js strike block):
//   (aimed 2.5x) (HAYMAKER x2) (stalker's opening +4) (dead aim x2)
//   (blood trail +2) (debt settled 1.5x) (xN.N) [fieldStrike: Rage
//   x2 via nextMult, strikeMult/power/misdirection] (pinned quad x2)
//   (mirrored — worn thin) (audited — half strength)
//   (under review — un-taught) (bright frame — mirage miss)
function parseNoteFlags(note) {
  const f = { aim: false, haymaker: false, stalk: false, deadAim: false,
    bloodTrail: false, trade: false, xFactor: null, pinned: false,
    mirrored: false, audit: false, cancel: false, mirage: false, editorCut: false };
  if (!note) return f;
  if (/\(aimed 2\.5x\)/.test(note)) f.aim = true;
  if (/\(HAYMAKER x2\)/.test(note)) f.haymaker = true;
  if (/\(stalker's opening \+4\)/.test(note)) f.stalk = true;
  if (/\(dead aim x2\)/.test(note)) f.deadAim = true;
  if (/\(blood trail \+2\)/.test(note)) f.bloodTrail = true;
  if (/\(debt settled 1\.5x\)/.test(note)) f.trade = true;
  const xm = /\(x([\d.]+)\)/.exec(note);
  if (xm) f.xFactor = parseFloat(xm[1]);
  if (/\(pinned quad x2\)/.test(note)) f.pinned = true;
  if (/\(mirrored — worn thin\)/.test(note)) f.mirrored = true;
  if (/\(audited — half strength\)/.test(note)) f.audit = true;
  if (/\(under review — un-taught\)/.test(note)) f.cancel = true;
  if (/\(bright frame — mirage miss\)/.test(note)) f.mirage = true;
  if (/CUT — .* swing hits the cutting-room floor/.test(note)) f.editorCut = true;
  return f;
}

// Reconstruct the rolled base for one strike by reversing the
// modifiers in reverse application order (engine order: base roll
// -> mirage 0 -> aim 2.5 -> haymaker 2 -> stalk +4 -> dead_aim 2 /
// blood_trail +2 -> trade 1.5 -> editor cut 0 -> cancel 0.7 ->
// audit 0.5 -> reunion 0.85^(k-2) -> fieldStrike x -> blooded 1.5
// (w5) -> dmgPin 2). Returns { base, ok, fwd } — ok means the
// forward re-application lands within ±2 of the logged damage
// (rounding drift). vd === 0 is a miss/cut: base unrecoverable.
function reconstructBase(dmg, flags, opts) {
  opts = opts || {};
  if (dmg === 0) return { base: null, miss: true, ok: true, fwd: 0 };
  let v = dmg;
  if (flags.pinned) v = v / 2;
  if (opts.bloodedMult) v = v / opts.bloodedMult;
  if (flags.xFactor) v = v / flags.xFactor;
  if (flags.mirrored) v = v / Math.pow(0.85, Math.max(0, (opts.reunionK || 1) - 2));
  if (flags.audit) v = v / 0.5;
  if (flags.cancel) v = v / 0.7;
  if (flags.trade) v = v / 1.5;
  if (flags.deadAim) v = v / 2;
  if (flags.bloodTrail) v = v - 2;
  if (flags.stalk) v = v - 4;
  if (flags.haymaker) v = v / 2;
  if (flags.aim) v = v / 2.5;
  const base = Math.round(v);
  // Forward re-application, engine order, engine rounding.
  let fwd = base;
  if (flags.aim) fwd = Math.round(fwd * 2.5);
  if (flags.haymaker) fwd = fwd * 2;
  if (flags.stalk) fwd += 4;
  if (flags.deadAim) fwd = fwd * 2;
  else if (flags.bloodTrail) fwd += 2;
  if (flags.trade) fwd = Math.round(fwd * 1.5);
  if (flags.cancel) fwd = Math.round(fwd * 0.7);
  if (flags.audit) fwd = Math.round(fwd / 2);
  if (flags.mirrored) fwd = Math.round(fwd * Math.pow(0.85, Math.max(0, (opts.reunionK || 1) - 2)));
  if (flags.xFactor) fwd = Math.round(fwd * flags.xFactor);
  if (opts.bloodedMult) fwd = Math.round(fwd * opts.bloodedMult);
  if (flags.pinned) fwd = Math.round(fwd * 2);
  return { base: base, miss: false, ok: Math.abs(fwd - dmg) <= 2, fwd: fwd };
}

// Parse one meeting's log into strike records.
// row: raw v4encounters row (log, fighters, wave, outcome, rounds,
// mDealt, rageFired). fighters: [{vid, name, ...}] lead first.
// Returns { strikes, volleyTotal, parsedTotal, residual, residualShare,
// rageWindowsOpened, rageStrikes, bloodedMult, baseChecked, baseOk,
// unparsedLines }.
// Strike record: { round, vid, name, role, kind, dmg, note, flags,
// base, baseOk, rage: bool, reunionK }.
function parseMeetingStrikes(row) {
  const fighters = row.fighters || [];
  const byName = {};
  const byFirst = {};
  fighters.forEach(function (f, i) {
    if (!f) return;
    const role = i === 0 ? 'lead' : ('ally' + i);
    // The engine's log name (firstRef / descriptor) is the primary
    // key — person.name is the fallback. First-token maps cover the
    // first-name-only references.
    const keys = [];
    if (f.logName) keys.push(f.logName);
    if (f.name) keys.push(f.name);
    for (const k of keys) {
      if (!byName[k]) byName[k] = { vid: f.vid, role: role };
      // First-token fallback is for real first names only — a
      // descriptor's first token ("the"/"a") must never claim a
      // fighter, or two strangers would collide on "the".
      const first = String(k).split(' ')[0];
      if (first && !/^the$/i.test(first) && !/^a$/i.test(first) && !byFirst[first]) byFirst[first] = { vid: f.vid, role: role };
    }
  });
  function who(name) {
    const n = String(name || '').trim();
    if (byName[n]) return byName[n];
    const first = n.split(' ')[0];
    if (byFirst[first]) return byFirst[first];
    return { vid: null, role: 'unknown' };
  }
  const leadVid = fighters.length ? fighters[0].vid : (row.vid || null);
  const strikes = [];
  let volleyTotal = 0;
  let rageRemaining = 0;
  let rageWindowsOpened = 0;
  let bloodedMult = null;
  let leadStrikeCount = 0; // reunion worn-thin index (reset by novelty)
  const unparsedLines = [];
  const log = row.log || [];
  for (const raw of log) {
    const ln = String(raw || '');
    let m;
    // Rage window opens (fieldAct Rage verb; the next 3 LEAD strikes
    // carry the x2 — the same-round strike follows this line in the log).
    if (/eyes go red\. Next 3 strikes hit twice as hard\. \(Rage\)/.test(ln)) {
      rageWindowsOpened++;
      rageRemaining = 3;
      continue;
    }
    // Blooded (wave-5 only): every strike in the fight carries it.
    const bm = /Blooded — the village knows where the Producers bleed\. \(Strikes hit ([\d.]+)× as hard/.exec(ln);
    if (bm) { bloodedMult = parseFloat(bm[1]); continue; }
    // Reunion novelty resets the worn-thin strike count.
    if (/does something they have never done — stands on one foot and recites a poem mid-fight/.test(ln)) {
      leadStrikeCount = 0;
      continue;
    }
    // Lead / ally strike (with optional modifier notes).
    m = /^R(\d+): (.+?) strikes for (\d+)((?: \([^)]*\))*) \((\d+) left\)/.exec(ln);
    if (m) {
      const w = who(m[2]);
      const isLead = w.vid === leadVid;
      if (isLead) leadStrikeCount++;
      const flags = parseNoteFlags(m[4] || '');
      const inRage = isLead && rageRemaining > 0;
      if (inRage) rageRemaining--;
      const base = reconstructBase(parseInt(m[3], 10), flags, {
        bloodedMult: bloodedMult,
        reunionK: isLead ? leadStrikeCount : 1 });
      strikes.push({ round: parseInt(m[1], 10), vid: w.vid, name: m[2].trim(),
        role: w.role, kind: 'strike', dmg: parseInt(m[3], 10), note: m[4] || '',
        flags: flags, base: base.base, baseOk: base.ok, miss: !!base.miss,
        rage: inRage, reunionK: isLead ? leadStrikeCount : null });
      continue;
    }
    // Ally echo (Live Broadcast extra strike).
    m = /^R(\d+): (.+?) strikes again, louder — (\d+)((?: \([^)]*\))*) \((\d+) left\)/.exec(ln);
    if (m) {
      const w = who(m[2]);
      const flags = parseNoteFlags(m[4] || '');
      const base = reconstructBase(parseInt(m[3], 10), flags, { bloodedMult: bloodedMult });
      strikes.push({ round: parseInt(m[1], 10), vid: w.vid, name: m[2].trim(),
        role: w.role, kind: 'echo', dmg: parseInt(m[3], 10), note: m[4] || '',
        flags: flags, base: base.base, baseOk: base.ok, miss: !!base.miss,
        rage: false, reunionK: null });
      continue;
    }
    // Extra ally strike (fieldAct extraAlly).
    m = /^R(\d+): (.+?) strikes again for (\d+)((?: \([^)]*\))*) \((\d+) left\)/.exec(ln);
    if (m) {
      const w = who(m[2]);
      const flags = parseNoteFlags(m[4] || '');
      const base = reconstructBase(parseInt(m[3], 10), flags, { bloodedMult: bloodedMult });
      strikes.push({ round: parseInt(m[1], 10), vid: w.vid, name: m[2].trim(),
        role: w.role, kind: 'extra', dmg: parseInt(m[3], 10), note: m[4] || '',
        flags: flags, base: base.base, baseOk: base.ok, miss: !!base.miss,
        rage: false, reunionK: null });
      continue;
    }
    // Volley (ranged opening): "  loosed — ... for N (H left)." /
    // "  the bow fires — it takes X for N (H left)."
    m = /^  .*?(?:loosed|fires) — .*? for (\d+) \((\d+) left\)/.exec(ln);
    if (m) {
      const d = parseInt(m[1], 10);
      volleyTotal += d;
      strikes.push({ round: null, vid: leadVid, name: null, role: 'lead',
        kind: 'volley', dmg: d, note: '', flags: parseNoteFlags(''),
        base: null, baseOk: true, miss: false, rage: false, reunionK: null });
      continue;
    }
    // Ambush opening strike.
    m = /ambush! Opening strike for (\d+)\./.exec(ln);
    if (m) {
      const d = parseInt(m[1], 10);
      strikes.push({ round: null, vid: leadVid, name: null, role: 'lead',
        kind: 'ambush', dmg: d, note: '', flags: parseNoteFlags(''),
        base: null, baseOk: true, miss: false, rage: false, reunionK: null });
      continue;
    }
    // Contact finish.
    m = /closes in and strikes with the .+? for (\d+) \((\d+) left\)/.exec(ln);
    if (m) {
      const d = parseInt(m[1], 10);
      strikes.push({ round: null, vid: leadVid, name: null, role: 'lead',
        kind: 'finish', dmg: d, note: '', flags: parseNoteFlags(''),
        base: null, baseOk: true, miss: false, rage: false, reunionK: null });
      continue;
    }
    // Pack harry / birds (ability-touch damage, lead-attributed).
    m = /the pack harries it for (\d+)\./.exec(ln);
    if (m) {
      strikes.push({ round: null, vid: leadVid, name: null, role: 'lead',
        kind: 'harry', dmg: parseInt(m[1], 10), note: '', flags: parseNoteFlags(''),
        base: null, baseOk: true, miss: false, rage: false, reunionK: null });
      continue;
    }
    m = /the birds tear at it for (\d+)\./.exec(ln);
    if (m) {
      strikes.push({ round: null, vid: leadVid, name: null, role: 'lead',
        kind: 'birds', dmg: parseInt(m[1], 10), note: '', flags: parseNoteFlags(''),
        base: null, baseOk: true, miss: false, rage: false, reunionK: null });
      continue;
    }
    // Shoulder-check collision (both pack members).
    m = /collision, (\d+) and (\d+)\./.exec(ln);
    if (m) {
      strikes.push({ round: null, vid: leadVid, name: null, role: 'lead',
        kind: 'collision', dmg: parseInt(m[1], 10) + parseInt(m[2], 10), note: '',
        flags: parseNoteFlags(''), base: null, baseOk: true, miss: false,
        rage: false, reunionK: null });
      continue;
    }
    // Damage lines the parser does not cover land in the residual —
    // counted, never silently dropped. (Non-damage lines are ignored
    // only when they carry no damage number for the monster.)
    if (/for (\d+) \(/.test(ln) && /left\)/.test(ln)) unparsedLines.push(ln.slice(0, 200));
  }
  let parsedTotal = 0;
  let baseChecked = 0, baseOk = 0;
  let rageStrikes = 0;
  for (const s of strikes) {
    parsedTotal += s.dmg;
    if (s.base != null) { baseChecked++; if (s.baseOk) baseOk++; }
    if (s.rage) rageStrikes++;
  }
  const mDealt = (row.mDealt != null ? row.mDealt : 0);
  const residual = mDealt - parsedTotal;
  return { strikes: strikes, volleyTotal: volleyTotal,
    parsedTotal: parsedTotal, mDealt: mDealt,
    residual: residual, residualShare: mDealt > 0 ? residual / mDealt : null,
    rageWindowsOpened: rageWindowsOpened, rageStrikes: rageStrikes,
    bloodedMult: bloodedMult,
    baseChecked: baseChecked, baseOk: baseOk,
    baseValidationRate: baseChecked ? baseOk / baseChecked : null,
    unparsedLines: unparsedLines };
}

module.exports = { parseMeetingStrikes: parseMeetingStrikes, reconstructBase: reconstructBase, parseNoteFlags: parseNoteFlags };

// ---------- decomposition ----------
// Raw-row lookup: legStats meetingsDetail carries log but not
// fighters/allyDealt/ffFired, so re-read the corpus and join raw
// rows by seed|day|vid|mid (rounds+mDealt disambiguate repeats).
function rawRowsByKey(dir) {
  const map = {};
  let files = [];
  try { files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : []; } catch (e) { files = []; }
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    for (const r of (d.v4encounters || [])) {
      const k = d.seed + '|' + r.day + '|' + r.vid + '|' + r.mid;
      (map[k] || (map[k] = [])).push(r);
    }
  }
  return map;
}

function decomposeMeeting(m, raw) {
  const parsed = parseMeetingStrikes(raw || m);
  const fighters = (raw && raw.fighters) || [];
  const fByVid = {};
  fighters.forEach(function (f) { if (f && f.vid) fByVid[f.vid] = f; });
  // Per-fighter rollup.
  const perFighter = {};
  for (const s of parsed.strikes) {
    if (s.kind === 'volley' || s.kind === 'ambush' || s.kind === 'finish' ||
        s.kind === 'harry' || s.kind === 'birds' || s.kind === 'collision') {
      // Lead-attributed opening/ability damage (not a strike round).
      const k = s.vid || 'lead';
      const pf = perFighter[k] || (perFighter[k] = { vid: k, role: 'lead', strikes: 0, strikeDmg: 0, dmg: 0, baseSum: 0, baseN: 0, openingDmg: 0, rageStrikes: 0, aimStrikes: 0, haymakerStrikes: 0, multSum: 0, multN: 0 });
      pf.openingDmg += s.dmg;
      pf.dmg += s.dmg;
      continue;
    }
    const k = s.vid || 'unknown';
    const pf = perFighter[k] || (perFighter[k] = { vid: k, role: s.role, strikes: 0, strikeDmg: 0, dmg: 0, baseSum: 0, baseN: 0, openingDmg: 0, rageStrikes: 0, aimStrikes: 0, haymakerStrikes: 0, multSum: 0, multN: 0 });
    pf.strikes++;
    pf.strikeDmg += s.dmg;
    pf.dmg += s.dmg;
    if (s.base != null) { pf.baseSum += s.base; pf.baseN++; }
    if (s.rage) pf.rageStrikes++;
    if (s.flags.aim) pf.aimStrikes++;
    if (s.flags.haymaker) pf.haymakerStrikes++;
    if (s.base != null && s.base > 0) {
      // Total multiplier on this strike (dmg/base), for the median.
      pf.multSum += s.dmg / s.base;
      pf.multN++;
    }
  }
  const fighterRows = Object.keys(perFighter).map(function (k) {
    const pf = perFighter[k];
    const f = fByVid[k] || null;
    return { vid: pf.vid, role: pf.role,
      weapon: f ? (f.meleeName || f.rangedName || null) : null,
      melee: f ? f.melee : null, ranged: f ? f.ranged : null,
      wb: f ? f.wb : null, armorP: f ? f.armorP : null,
      abilities: f ? f.abilities : null,
      strikes: pf.strikes, strikeDmg: pf.strikeDmg, totalDmg: pf.dmg, openingDmg: pf.openingDmg,
      meanStrikeDmg: pf.strikes ? pf.strikeDmg / pf.strikes : null,
      meanBase: pf.baseN ? pf.baseSum / pf.baseN : null,
      meanMult: pf.multN ? pf.multSum / pf.multN : null,
      rageStrikes: pf.rageStrikes, aimStrikes: pf.aimStrikes,
      haymakerStrikes: pf.haymakerStrikes,
      strikesPerRound: m.rounds ? pf.strikes / m.rounds : null };
  });
  const strikers = fighterRows.filter(function (fr) { return fr.strikes > 0; }).length;
  const strikeCount = parsed.strikes.filter(function (s) { return s.kind === 'strike' || s.kind === 'echo' || s.kind === 'extra'; }).length;
  const dpr = m.rounds > 0 && m.mDealt != null ? m.mDealt / m.rounds : null;
  return { seed: m.seed, day: m.day, vid: m.vid, mid: m.mid,
    wave: (raw && raw.wave) || null, outcome: m.outcome, win: m.win,
    rounds: m.rounds, mHpStart: m.mHpStart, mDealt: m.mDealt, dmgShare: m.dmgShare,
    dpr: dpr, vTaken: m.vTaken,
    strikers: strikers, strikeCount: strikeCount,
    strikesPerRound: m.rounds ? strikeCount / m.rounds : null,
    parsedTotal: parsed.parsedTotal, residual: parsed.residual,
    residualShare: parsed.residualShare,
    volleyTotal: parsed.volleyTotal,
    rageWindowsOpened: parsed.rageWindowsOpened, rageStrikes: parsed.rageStrikes,
    bloodedMult: parsed.bloodedMult,
    baseValidationRate: parsed.baseValidationRate,
    allyDealt: raw ? (raw.allyDealt | 0) : null,
    ally2Dealt: raw ? (raw.ally2Dealt | 0) : null,
    ally3Dealt: raw ? (raw.ally3Dealt | 0) : null,
    ffFired: raw ? (raw.ffFired || []) : [],
    fighters: fighterRows };
}

function decompose(dir) {
  const st = legStats(dir, { minPlanParty: 1 });
  const rawMap = rawRowsByKey(dir);
  const used = {};
  const meetings = st.meetingsDetail.map(function (m) {
    const k = m.seed + '|' + m.day + '|' + m.vid + '|' + m.mid;
    const cands = rawMap[k] || [];
    // Prefer an unused candidate matching rounds+mDealt.
    let raw = null;
    for (let i = 0; i < cands.length; i++) {
      if (used[k + '#' + i]) continue;
      if (cands[i].rounds === m.rounds && cands[i].mDealt === m.mDealt) { raw = cands[i]; used[k + '#' + i] = true; break; }
    }
    if (!raw) {
      for (let i = 0; i < cands.length; i++) {
        if (!used[k + '#' + i]) { raw = cands[i]; used[k + '#' + i] = true; break; }
      }
    }
    return decomposeMeeting(m, raw);
  });
  return { stats: st, meetings: meetings };
}

// Counterfactuals from the observed MEDIAN meeting (prereg-frozen):
// scale ONE component to its Cooper level, hold the rest at the
// observed medians. Cooper levels: Rage x2 on all strikes; 3
// strikers striking every round; base at the best wb observed in
// this corpus; volley 55 in round 1.
function counterfactuals(meetings) {
  if (!meetings.length) return null;
  const dprs = meetings.map(function (m) { return m.dpr; }).filter(function (x) { return x != null; });
  const sprs = meetings.map(function (m) { return m.strikesPerRound; }).filter(function (x) { return x != null; });
  const rounds = meetings.map(function (m) { return m.rounds; }).filter(function (x) { return x != null; });
  const hps = meetings.map(function (m) { return m.mHpStart; }).filter(function (x) { return x != null; });
  const volleys = meetings.map(function (m) { return m.volleyTotal; });
  // Per-strike medians: use the fighter meanBase/meanMult rollups
  // (per-fighter medians across fighters).
  const meanBases = [], meanMults = [], wbs = [];
  let bestWb = null;
  for (const m of meetings) {
    for (const f of (m.fighters || [])) {
      if (f.wb != null) wbs.push(f.wb);
      if (f.strikes > 0 && f.meanBase != null) meanBases.push(f.meanBase);
      if (f.strikes > 0 && f.meanMult != null) meanMults.push(f.meanMult);
    }
  }
  const medDpr = median(dprs);
  const medSpr = median(sprs);
  const medRounds = median(rounds);
  const medHp = median(hps);
  const medVolley = median(volleys);
  const medBase = median(meanBases);
  const medMult = median(meanMults);
  if (wbs.length) bestWb = Math.max.apply(null, wbs);
  const medWb = median(wbs);
  const volleyRate = (medVolley != null && medRounds) ? medVolley / medRounds : 0;
  const strikeRate = (medDpr != null) ? medDpr - volleyRate : null;
  // Rage-free multiplier: strikes that carried Rage have their mult
  // halved back out. Approximate from the fighter rollups: the median
  // mult already mixes Rage and non-Rage strikes; the rage share of
  // strikes is small on this substrate, so use medMult directly for
  // the non-Rage baseline and note the approximation. (The per-strike
  // split is reported in the strike table, not hidden here.)
  const rageStrikeShare = (function () {
    let rs = 0, tot = 0;
    for (const m of meetings) { rs += (m.rageStrikes || 0); tot += (m.strikeCount || 0); }
    return tot ? rs / tot : 0;
  })();
  const medMultNonRage = (medMult != null && rageStrikeShare > 0)
    ? medMult / (1 + rageStrikeShare) : medMult;
  const cf = {};
  function dprFrom(spr, base, mult, volley) {
    if (spr == null || base == null || mult == null) return null;
    return spr * base * mult + (volley != null && medRounds ? volley / medRounds : 0);
  }
  cf.observed = { dpr: medDpr, spr: medSpr, base: medBase, mult: medMult, volley: medVolley, rounds: medRounds, hp: medHp, wb: medWb, bestWb: bestWb, rageStrikeShare: rageStrikeShare };
  cf.multiplierRage2x = dprFrom(medSpr, medBase, (medMultNonRage != null ? medMultNonRage * 2 : null), medVolley);
  cf.strikes3EveryRound = dprFrom(3, medBase, medMult, medVolley);
  cf.baseBestWb = (bestWb != null) ? dprFrom(medSpr, 6 + bestWb, medMult, medVolley) : null;
  cf.volley55 = (medDpr != null && medRounds) ? medDpr - volleyRate + 55 / medRounds : null;
  cf.cooperAll = dprFrom(3, (bestWb != null ? 6 + bestWb : null), (medMultNonRage != null ? medMultNonRage * 2 : null), 55);
  // wb needed (holding spr + mult at observed medians) to reach 111.
  cf.wbNeededFor111 = (medSpr != null && medMult != null && medSpr * medMult > 0 && medRounds)
    ? ((111 - volleyRate) / (medSpr * medMult) - 6) : null;
  cf.roundsToKillObserved = (medHp != null && medDpr) ? medHp / medDpr : null;
  cf.roundsToKillCooperAll = (medHp != null && cf.cooperAll) ? medHp / cf.cooperAll : null;
  // Binding: the single component whose Cooper-level value reaches
  // >= 111 (or comes closest, with the shortfall stated).
  const singles = [
    { id: 'multiplier', label: 'multiplier (Rage x2 on all strikes)', dpr: cf.multiplierRage2x },
    { id: 'strikes', label: 'strikes (3 strikers every round)', dpr: cf.strikes3EveryRound },
    { id: 'base', label: 'base (best observed wb)', dpr: cf.baseBestWb },
    { id: 'volley', label: 'volley (55 opening)', dpr: cf.volley55 },
  ].filter(function (s) { return s.dpr != null; });
  let binding = null, best = null;
  for (const s of singles) { if (best == null || s.dpr > best.dpr) { best = s; } }
  if (best && best.dpr >= 111) binding = { component: best.id, label: best.label, dpr: best.dpr, closesGap: true };
  else if (best) binding = { component: best.id, label: best.label, dpr: best.dpr, closesGap: false, shortfall: 111 - best.dpr };
  else binding = { component: null, label: 'no counterfactual computable', dpr: null, closesGap: false };
  cf.binding = binding;
  cf.singles = singles;
  cf.noSingleComponent = !(binding && binding.closesGap);
  return cf;
}

function judge(dec) {
  const st = dec.stats;
  const meetings = dec.meetings;
  const bars = [];
  const poolOk = meetings.length >= 10;
  bars.push({ id: 'pool-floor-pair', pass: poolOk,
    detail: 'engaged launched-party meetings (pair-inclusive, present): ' + meetings.length + ' (floor 10)' });
  const pooledDealt = meetings.reduce(function (a, m) { return a + (m.mDealt || 0); }, 0);
  const pooledParsed = meetings.reduce(function (a, m) { return a + (m.parsedTotal || 0); }, 0);
  const pooledResidualShare = pooledDealt > 0 ? Math.abs(pooledDealt - pooledParsed) / pooledDealt : null;
  const decompOk = meetings.length > 0 && pooledResidualShare != null && pooledResidualShare <= 0.10;
  bars.push({ id: 'decomposition-complete', pass: decompOk,
    detail: 'pooled parsed-vs-mDealt residual share ' + (pooledResidualShare == null ? 'n/a' : pooledResidualShare.toFixed(3)) + ' (bar <=0.10); pooled dealt ' + pooledDealt + ', parsed ' + pooledParsed });
  const cf = counterfactuals(meetings);
  const cfOk = !!cf && !!cf.binding && cf.singles.length >= 3;
  bars.push({ id: 'binding-named', pass: cfOk,
    detail: cf ? ('binding component: ' + (cf.binding.label || 'none') + ' -> ' + (cf.binding.dpr == null ? 'n/a' : cf.binding.dpr.toFixed(1)) + '/round' + (cf.binding.closesGap ? ' (closes the 111 gap)' : ' (shortfall ' + (cf.binding.shortfall != null ? cf.binding.shortfall.toFixed(1) : 'n/a') + ')') + '; no-single-component: ' + cf.noSingleComponent) : 'counterfactuals null' });
  const errOk = st.errors === 0;
  bars.push({ id: 'instrument-errors', pass: errOk,
    detail: 'instrument errors ' + st.errors + ' (bar 0)' });
  let verdict = 'DIAG-GO', kind = '';
  if (!poolOk) { verdict = 'DIAG-NO-GO'; kind = 'THIN-POOL'; }
  else if (!decompOk) { verdict = 'DIAG-NO-GO'; kind = 'INSTRUMENT'; }
  else if (!bars.every(function (b) { return b.pass; })) { verdict = 'DIAG-NO-GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars,
    pooledDealt: pooledDealt, pooledParsed: pooledParsed, pooledResidualShare: pooledResidualShare,
    counterfactuals: cf };
}

module.exports = { parseMeetingStrikes: parseMeetingStrikes, reconstructBase: reconstructBase, parseNoteFlags: parseNoteFlags, decompose: decompose, decomposeMeeting: decomposeMeeting, counterfactuals: counterfactuals, judge: judge, median: median, mean: mean };

// ---------- selftest ----------
function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  // --- parser: a synthetic Cooper-shaped meeting log ---
  const coopLog = [
    "Elif Demir sees The Eater coming and nocks an arrow — the fight opens at range (2 shots).",
    "  loosed — it takes The Eater for 30 (970 left).",
    "  loosed — it takes The Eater for 25 (945 left).",
    "R1: Elif Demir's eyes go red. Next 3 strikes hit twice as hard. (Rage)",
    "R1: Elif Demir strikes for 36 (x2.0) (909 left)",
    "R1: Marta strikes for 14 (895 left)",
    "R1: Taha strikes for 11 (884 left)",
    "R2: Elif Demir strikes for 40 (x2.0) (844 left)",
    "R2: Marta strikes for 12 (832 left)",
    "R2: Taha strikes for 15 (817 left)",
    "R3: Elif Demir strikes for 38 (x2.0) (779 left)",
    "R3: Elif Demir goes still. Breath slows. The world narrows to the target. (Take Aim — next shot 2.5x)",
    "R4: Elif Demir strikes for 45 (aimed 2.5x) (734 left)",
    "R4: Marta strikes for 13 (721 left)",
    "R5: Elif Demir strikes for 16 (stalker's opening +4) (705 left)",
  ];
  const coopRow = { vid: 'elif', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 5,
    mDealt: 295, mHpStart: 1000,
    fighters: [
      { vid: 'elif', name: 'Elif Demir', melee: 'spear', meleeName: 'Fire-hardened spear', meleeB: 12, ranged: 'bow', rangedName: 'Bow', rangedB: 8, wb: 10, armorP: 20, abilities: ['rage', 'patient_aim', 'stalk'] },
      { vid: 'marta', name: 'Marta', melee: 'machete', meleeName: 'Machete', meleeB: 6, ranged: null, rangedName: null, rangedB: 0, wb: 3, armorP: 15, abilities: [] },
      { vid: 'taha', name: 'Taha', melee: 'club', meleeName: 'Club', meleeB: 4, ranged: null, rangedName: null, rangedB: 0, wb: 2, armorP: 10, abilities: [] },
    ],
    log: coopLog };
  const p = parseMeetingStrikes(coopRow);
  // Strikes: 3 lead Rage strikes (36,40,38) + aimed 45 + stalk 16 = 5 lead;
  // Marta 3 (14,12,13); Taha 2 (11,15); volley 30+25=55.
  check('parser counts 10 strikes + volley', p.strikes.filter(function (s) { return s.kind === 'strike'; }).length === 10 && p.volleyTotal === 55, JSON.stringify({ n: p.strikes.length, v: p.volleyTotal }));
  check('parser total reconciles with mDealt', p.parsedTotal === 295 && p.residual === 0, JSON.stringify({ parsed: p.parsedTotal, residual: p.residual }));
  check('Rage window opens once, 3 Rage strikes', p.rageWindowsOpened === 1 && p.rageStrikes === 3, JSON.stringify({ w: p.rageWindowsOpened, s: p.rageStrikes }));
  const leadStrikes = p.strikes.filter(function (s) { return s.vid === 'elif' && s.kind === 'strike'; });
  check('lead base reconstructs (Rage 36 -> base 18)', leadStrikes[0].base === 18 && leadStrikes[0].baseOk, JSON.stringify(leadStrikes[0]));
  check('aimed strike reconstructs (45 -> base 18)', leadStrikes[3].base === 18 && leadStrikes[3].baseOk, JSON.stringify(leadStrikes[3]));
  check('stalk strike reconstructs (16 -> base 12)', leadStrikes[4].base === 12 && leadStrikes[4].baseOk, JSON.stringify(leadStrikes[4]));
  check('ally base reconstructs (Marta 14 -> base 14)', p.strikes.filter(function (s) { return s.vid === 'marta'; })[0].base === 14, JSON.stringify(p.strikes.filter(function (s) { return s.vid === 'marta'; })[0]));
  check('base validation rate 1.0 on the synthetic log', p.baseValidationRate === 1, JSON.stringify(p.baseValidationRate));
  // Mirage miss + editor cut: base unrecoverable, counted as miss.
  const missRow = { vid: 'a', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 2, mDealt: 10, mHpStart: 1000,
    fighters: [{ vid: 'a', name: 'Ana', wb: 5, armorP: 10, abilities: [] }],
    log: ["R1: Ana strikes for 0 (bright frame — mirage miss) (1000 left)", "R2: Ana strikes for 10 (990 left)"] };
  const pm = parseMeetingStrikes(missRow);
  check('mirage miss parses as a 0-damage strike with null base', pm.strikes.length === 2 && pm.strikes[0].dmg === 0 && pm.strikes[0].base === null && pm.strikes[0].miss === true, JSON.stringify(pm.strikes[0]));
  check('miss meeting reconciles', pm.parsedTotal === 10 && pm.residual === 0, JSON.stringify(pm));
  // Reunion worn-thin: 3rd+ lead strikes carry 0.85^(k-2).
  const reuRow = { vid: 'a', mid: 'reunion', wave: 4, outcome: 'vFlee', rounds: 4, mDealt: 56, mHpStart: 1000,
    fighters: [{ vid: 'a', name: 'Ana', wb: 5, armorP: 10, abilities: [] }],
    log: ["R1: Ana strikes for 14 (986 left)", "R2: Ana strikes for 14 (972 left)",
      "R3: Ana strikes for 12 (mirrored — worn thin) (960 left)",
      "R4: Ana strikes for 16 (mirrored — worn thin) (944 left)"] };
  const pr = parseMeetingStrikes(reuRow);
  // R3: base 14 x 0.85 = 11.9 -> 12. R4: base 16? 16/0.85^2 = 22.1 -> forward 22*0.7225=15.9->16. Both validate.
  check('reunion worn-thin reconstructs (R3 base 14, R4 base 22)', pr.strikes[2].base === 14 && pr.strikes[3].base === 22 && pr.baseValidationRate === 1, JSON.stringify(pr.strikes.map(function (s) { return s.base; })));
  // Blooded (wave 5): strikes carry 1.5x, detected from the line.
  const blRow = { vid: 'a', mid: 'cancellation', wave: 5, outcome: 'vFlee', rounds: 1, mDealt: 21, mHpStart: 1000,
    fighters: [{ vid: 'a', name: 'Ana', wb: 5, armorP: 10, abilities: [] }],
    log: ["R1: Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.)",
      "R1: Ana strikes for 21 (979 left)"] };
  const pb = parseMeetingStrikes(blRow);
  check('blooded detected and base reconstructs (21 -> 14)', pb.bloodedMult === 1.5 && pb.strikes[0].base === 14 && pb.strikes[0].baseOk, JSON.stringify(pb.strikes[0]));
  // Ally echo + extra strike shapes.
  const echoRow = { vid: 'a', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 1, mDealt: 41, mHpStart: 1000,
    fighters: [{ vid: 'a', name: 'Ana', wb: 5, armorP: 10, abilities: [] }, { vid: 'b', name: 'Bo', wb: 3, armorP: 10, abilities: ['live_broadcast'] }],
    log: ["R1: Ana strikes for 14 (986 left)", "R1: Bo strikes for 12 (974 left)",
      "R1: Bo strikes again, louder — 9 (965 left). (Live Broadcast)",
      "R1: Bo strikes again for 6 (959 left)"] };
  const pe = parseMeetingStrikes(echoRow);
  check('echo + extra parse as ally strikes', pe.strikes.filter(function (s) { return s.kind === 'echo'; }).length === 1 && pe.strikes.filter(function (s) { return s.kind === 'extra'; }).length === 1 && pe.parsedTotal === 41 && pe.residual === 0, JSON.stringify(pe.strikes.map(function (s) { return s.kind; })));
  // Pre-arrival descriptors: the log names fighters by firstRef
  // descriptor, not by roster name — the snapshot's logName is the
  // key, and two strangers must NOT collide on "the".
  const descRow = { vid: 'a', mid: 'eater', wave: 4, outcome: 'vFlee', rounds: 2, mDealt: 26, mHpStart: 1000,
    fighters: [{ vid: 'a', name: 'Ana Ray', logName: 'the man in his 40s, with a long braid', wb: 5, armorP: 10, abilities: [] },
      { vid: 'b', name: 'Bo Kee', logName: 'the person in their 40s, with sun-creased eyes', wb: 3, armorP: 10, abilities: [] }],
    log: ["R1: the man in his 40s, with a long braid strikes for 7 (993 left)",
      "R1: the person in their 40s, with sun-creased eyes strikes for 5 (988 left)",
      "R2: the man in his 40s, with a long braid strikes for 9 (979 left)",
      "R2: the person in their 40s, with sun-creased eyes strikes for 5 (974 left)"] };
  const pd = parseMeetingStrikes(descRow);
  check('descriptor logNames map to the right vids (no "the" collision)',
    pd.strikes.filter(function (s) { return s.vid === 'a'; }).length === 2 &&
    pd.strikes.filter(function (s) { return s.vid === 'b'; }).length === 2 &&
    pd.strikes.every(function (s) { return s.vid !== null; }) && pd.parsedTotal === 26 && pd.residual === 0,
    JSON.stringify(pd.strikes.map(function (s) { return s.vid + ':' + s.dmg; })));
  // --- judge shapes on synthetic corpora ---
  const os = require('os');
  // Write-flap hardening (local_write_flap_response): fresh-file
  // writes in /tmp are intermittently refused with EPERM — retry
  // the seed-file write up to 10s before failing loudly.
  function sleepMs(ms) {
    try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
    catch (e) {
      const t0 = process.hrtime.bigint();
      while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
    }
  }
  function writeFileRetry(file, data) {
    let last = null;
    for (let i = 0; i < 40; i++) {
      try { fs.writeFileSync(file, data); return; }
      catch (e) { last = e; sleepMs(250); }
    }
    throw last;
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'basedmg-analyze-'));
  function mkLeg(dir, meetings) {
    fs.mkdirSync(dir, { recursive: true });
    const seed = { seed: 109501, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], launchpartyOn: true, fightally2On: true,
      fieldcapdmgOn: false, deaths: [],
      daily: [{ day: 1, roster: [{ vid: 'h1', name: 'Holly One' }, { vid: 'c1', name: 'Cora A' }, { vid: 'c2', name: 'Cid B' }] }],
      samples: { villagers: [[1, [{ vid: 'h1', abilities: [] }, { vid: 'c1', abilities: [] }, { vid: 'c2', abilities: [] }]]] },
      v4departs: [], v4gates: [], v4encounters: [] };
    meetings.forEach(function (mt, i) {
      const day = 20 + i;
      seed.v4gates.push({ day: day, vid: 'h1', mid: mt.mid, planParty: ['c1'], sensed: ['h1', 'c1'],
        result: 'null', reason: null, allArmed: true, allArmored: true,
        gear: { h1: { armed: true, armored: true, armorP: 30 }, c1: { armed: true, armored: true, armorP: 20 } } });
      seed.v4encounters.push({ day: day, vid: 'h1', mid: mt.mid, wave: 4, origin: 'expedition',
        allyVids: ['c1'], allyVid: 'c1', ally2Vid: null, outcome: mt.outcome, rounds: mt.rounds,
        mDealt: mt.mDealt, mHpStart: 1000, vTaken: 100, log: mt.log || [],
        fighters: mt.fighters || [{ vid: 'h1', name: 'Holly One', wb: 5, armorP: 30, abilities: [] },
          { vid: 'c1', name: 'Cora A', wb: 3, armorP: 20, abilities: [] }] });
    });
    writeFileRetry(path.join(dir, 's109501.json'), JSON.stringify(seed));
  }
  function simpleMeeting(mid, outcome, rounds, mDealt) {
    // 2 strikers, 1 strike each per round, 12 damage per strike, no
    // modifiers: base 12, mult 1. Parsed total = rounds * 24.
    const log = [];
    for (let r = 1; r <= rounds; r++) {
      log.push('R' + r + ': Holly One strikes for 12 (' + (1000 - (r - 1) * 24 - 12) + ' left)');
      log.push('R' + r + ': Cora A strikes for 12 (' + (1000 - r * 24) + ' left)');
    }
    return { mid: mid, outcome: outcome, rounds: rounds, mDealt: mDealt, log: log };
  }
  // GO shape: 10 meetings, 5 rounds each, 120 dealt = 24/round,
  // residual 0, counterfactuals computable.
  const goDir = path.join(tmp, 'go');
  const goMeetings = [];
  for (let i = 0; i < 10; i++) goMeetings.push(simpleMeeting('audit', 'vFlee', 5, 120));
  mkLeg(goDir, goMeetings);
  const decGo = decompose(goDir);
  check('GO-shape pool is 10', decGo.meetings.length === 10, JSON.stringify(decGo.meetings.length));
  check('GO-shape residual is 0', decGo.meetings.every(function (m) { return m.residual === 0; }), JSON.stringify(decGo.meetings.map(function (m) { return m.residual; })));
  check('GO-shape dpr 24 mean and median', Math.abs(median(decGo.meetings.map(function (m) { return m.dpr; })) - 24) < 1e-9, JSON.stringify(decGo.meetings.map(function (m) { return m.dpr; })));
  const jGo = judge(decGo);
  check('judge DIAG-GO on the clean shape', jGo.verdict === 'DIAG-GO' && jGo.bars.every(function (b) { return b.pass; }), JSON.stringify(jGo));
  check('counterfactuals name the binding component (no single closes)', jGo.counterfactuals.binding && jGo.counterfactuals.noSingleComponent === true, JSON.stringify(jGo.counterfactuals.binding));
  // THIN-POOL: 9 meetings.
  const thinDir = path.join(tmp, 'thin');
  mkLeg(thinDir, goMeetings.slice(0, 9));
  const jThin = judge(decompose(thinDir));
  check('judge DIAG-NO-GO THIN-POOL at n=9', jThin.verdict === 'DIAG-NO-GO' && jThin.kind === 'THIN-POOL' && !jThin.bars[0].pass, JSON.stringify(jThin));
  // INSTRUMENT: parsed total does not reconcile (mDealt 500, log 120).
  const instDir = path.join(tmp, 'inst');
  const instMeetings = [];
  for (let i = 0; i < 10; i++) { const mt = simpleMeeting('audit', 'vFlee', 5, 120); mt.mDealt = 500; instMeetings.push(mt); }
  mkLeg(instDir, instMeetings);
  const jInst = judge(decompose(instDir));
  check('judge DIAG-NO-GO INSTRUMENT on residual 0.76', jInst.verdict === 'DIAG-NO-GO' && jInst.kind === 'INSTRUMENT' && !jInst.bars[1].pass, JSON.stringify(jInst.bars));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-basedmg-b --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-basedmg-b.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const dec = decompose(dir);
  const j = judge(dec);
  const st = dec.stats;
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars,
    pooledDealt: j.pooledDealt, pooledParsed: j.pooledParsed, pooledResidualShare: j.pooledResidualShare,
    counterfactuals: j.counterfactuals,
    wall: { national: st.national, seedWins: st.seedWins, wave4: st.wave4, wave5: st.wave5,
      medianDays: st.medianDays, communityLost: st.communityLost, n: st.n, scaleRanks: st.scaleRanks },
    funnel: st.funnel, byOutcome: st.byOutcome,
    killShare: st.killShare, winShare: st.winShare,
    meetings: dec.meetings };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars,
    pooledDealt: result.pooledDealt, pooledParsed: result.pooledParsed,
    pooledResidualShare: result.pooledResidualShare,
    counterfactuals: result.counterfactuals, wall: result.wall,
    killShare: result.killShare, winShare: result.winShare,
    meetings: result.meetings.length }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
