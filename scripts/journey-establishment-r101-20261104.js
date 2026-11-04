#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40 window, 42d horizon per r71/r84)
// R101 (2026-11-04). Clone of the r99 driver loop, NO favor wedge:
// competent policy, daily alive/pantry trace, end census, 2 held convos
// (goon-first). Instruments are read-only wraps + a per-dawn material
// trace: Game.craft (armor attempts), Game.villagerArmorCraftDay (NPC
// craft-beat calls), stash / player-pack / NPC-pack materials per dawn.
// Question (see prereg): does armor get made and worn in-window after
// the bark-flow + villager-hide + player-hide-craft fixes?
// Usage: SEEDS=1301 DAYS=42 node scripts/journey-establishment-r101-20261104.js
// Question (see prereg): when do waves 2/3 arrive in-window, is wave 3
// kill-earned and survivable, and does it land before the village gears up?
//   EVID defaults to evidence/2026-11-04 in this repo checkout.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-11-04');
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1301]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[r101:' + k + ']', (e && e.message) || e); } }
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
}
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }
function livingVids(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(id => !isDead(Game, id)); } catch (e) { return []; }
}

// --- R101 teaching intervention (one dawn convo/day, player-teaches only) ---
function teachLivingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  } catch (e) { return []; }
}
function teachTrust(Game, vid) {
  try { const t = ((Game.state.village || {}).trust || {})[vid]; return t === undefined ? 10 : t; } catch (e) { return null; }
}
function attemptTeach(Game, day, startIdx) {
  // Returns {record, lines, nextStartIdx}. Never throws: every failure is a record.
  const living = teachLivingVids(Game);
  if (!living.length) return { record: { day, kind: 'error', error: 'no living villagers' }, lines: [], nextStartIdx: 0 };
  const rotated = living.slice(startIdx % living.length).concat(living.slice(0, startIdx % living.length));
  let candidate = null;
  for (let i = 0; i < rotated.length; i++) {
    const vid = rotated[i];
    let gaps = [];
    try { gaps = (typeof Game.teachableSkills === 'function') ? (Game.teachableSkills('player', vid) || []) : []; } catch (e) { gaps = []; }
    let okSkills = [];
    try { okSkills = gaps.filter(sid => { try { return Game.canTeachSkill('player', vid, sid).ok; } catch (e) { return false; } }); } catch (e) { okSkills = []; }
    if (okSkills.length) { candidate = { vid, skill: okSkills[0], rotIdx: i }; break; }
  }
  if (!candidate) {
    const gateCounts = {};
    const details = [];
    for (const vid of living) {
      let gaps = [];
      try { gaps = (typeof Game.teachableSkills === 'function') ? (Game.teachableSkills('player', vid) || []) : []; } catch (e) { gaps = []; }
      let why = 'no-gap';
      if (gaps.length) {
        try { const chk = Game.canTeachSkill('player', vid, gaps[0]); why = chk.ok ? 'ok-but-unpicked?' : (chk.why || '?'); } catch (e) { why = 'error:' + e.message; }
      }
      gateCounts[why] = (gateCounts[why] || 0) + 1;
      details.push({ name: nameOf(Game, vid), why, trust: teachTrust(Game, vid), gaps: gaps.slice(0, 3) });
    }
    return { record: { day, kind: 'nocandidate', gateCounts, details }, lines: [], nextStartIdx: (startIdx + 1) % living.length };
  }
  const { vid, skill } = candidate;
  const nm = nameOf(Game, vid);
  let knewBefore = null;
  try { knewBefore = Game.npcKnowsSkill ? !!Game.npcKnowsSkill(vid, skill) : null; } catch (e) {}
  const lines = [];
  try {
    let r = Game.startConvo(vid);
    lines.push(`TEACH d${day} ${nm}: OPENING: ${r.line}`);
    const choices = (r.choices && r.choices.length) ? r.choices : [];
    const learnOffers = choices.filter(ch => String(ch.id || '').indexOf('skill_learn:') === 0).map(ch => ch.id);
    const teachChoice = choices.find(ch => ch.id === 'skill_teach:' + skill);
    if (!teachChoice) {
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) lines.push('TEACH closing: ' + end.line); } catch (e) { lines.push('TEACH endConvo: ' + e.message); }
      return { record: { day, kind: 'mismatch', vid: String(vid), name: nm, skill, choiceIds: choices.map(ch => ch.id), learnOffers }, lines, nextStartIdx: (startIdx + candidate.rotIdx + 1) % living.length };
    }
    lines.push(`TEACH YOU: [${teachChoice.id}] ${(teachChoice.label || '').slice(0, 80)}`);
    r = Game.convoTurn(vid, teachChoice.id);
    lines.push(`TEACH THEM: ${r.line == null ? '(null)' : r.line}`);
    let knowsAfter = null;
    try { knowsAfter = Game.npcKnowsSkill ? !!Game.npcKnowsSkill(vid, skill) : null; } catch (e) {}
    try { const end = Game.endConvo(vid, 'done'); if (end && end.line) lines.push('TEACH closing: ' + end.line); } catch (e) { lines.push('TEACH endConvo: ' + e.message); }
    return { record: { day, kind: 'lesson', vid: String(vid), name: nm, skill, knewBefore, knowsAfter, line: (r.line == null ? null : String(r.line).slice(0, 300)), learnOffers }, lines, nextStartIdx: (startIdx + candidate.rotIdx + 1) % living.length };
  } catch (e) {
    try { Game.endConvo(vid, 'done'); } catch (e2) {}
    lines.push('TEACH ERROR: ' + e.message);
    return { record: { day, kind: 'error', vid: String(vid), name: nm, skill, error: e.message }, lines, nextStartIdx: (startIdx + 1) % living.length };
  }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const dayLines = {};
  const waveSysLines = [];
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); const txt = String(a[0] == null ? '' : a[0]); (dayLines[d] = dayLines[d] || []).push('SYS: ' + txt); if (/wave|ledger/i.test(txt)) waveSysLines.push({ day: d, line: txt.slice(0, 300) }); } catch (e) { warnOnce('sysSay', e); }
    };
  }

  // --- Armor instruments (read-only wraps; originals called exactly once) ---
  const craftLog = [];
  let craftWrap = false;
  if (typeof Game.craft === 'function') {
    const _c = Game.craft.bind(Game);
    craftWrap = true;
    Game.craft = function (item) {
      const r = _c.apply(this, arguments);
      try {
        if (item === 'bark_armor' || item === 'hide_armor') {
          let ret = null;
          try { ret = JSON.stringify(r); } catch (e) { ret = String(r); }
          craftLog.push({ day: nowDay(Game), item: String(item), ret: (ret || '').slice(0, 300) });
        }
      } catch (e) {}
      return r;
    };
  }
  const npcCraftLog = [];
  let npcCraftWrap = false;
  if (typeof Game.villagerArmorCraftDay === 'function') {
    const _n = Game.villagerArmorCraftDay.bind(Game);
    npcCraftWrap = true;
    Game.villagerArmorCraftDay = function (...a) {
      let beforeStash = '', beforeCd = '';
      try { beforeStash = JSON.stringify(((Game.state.village || {}).stash || {}).materials || {}); } catch (e) {}
      try { beforeCd = JSON.stringify((Game.state.village || {}).avCraftCd || {}); } catch (e) {}
      const r = _n.apply(this, a);
      try {
        let ret = null;
        try { ret = JSON.stringify(r); } catch (e) { ret = String(r); }
        let afterStash = '', afterCd = '';
        try { afterStash = JSON.stringify(((Game.state.village || {}).stash || {}).materials || {}); } catch (e) {}
        try { afterCd = JSON.stringify((Game.state.village || {}).avCraftCd || {}); } catch (e) {}
        // Attempt = materials consumed or cooldown set, even when the roll fails (made=0).
        const attempted = (afterStash !== beforeStash) || (afterCd !== beforeCd);
        npcCraftLog.push({ day: nowDay(Game), ret: (ret || '').slice(0, 300), attempted });
      } catch (e) {}
      return r;
    };
  }
  function matSnap() {
    try {
      const v = Game.state.village || {};
      const stash = Object.assign({}, (v.stash && v.stash.materials) || {});
      const pack = {};
      for (const it of ((Game.state.scholar || {}).inventory || [])) {
        if (it && it.material) pack[it.material] = (pack[it.material] || 0) + (it.units || 0);
      }
      const npcTotal = {};
      const npcDetail = [];
      for (const id of livingVids(Game)) {
        let p = null;
        try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
        if (!p) continue;
        const mats = {};
        const armor = [];
        for (const it of (p.items || [])) {
          if (!it) continue;
          if (it.material) { mats[it.material] = (mats[it.material] || 0) + (it.units || 0); }
          if (it.itemId === 'bark_armor' || it.itemId === 'hide_armor') armor.push(it.itemId);
        }
        for (const eq of Object.values(p.equipped || {})) {
          if (eq && (eq.itemId === 'bark_armor' || eq.itemId === 'hide_armor') && !armor.includes(eq.itemId)) armor.push(eq.itemId);
        }
        for (const m of Object.keys(mats)) npcTotal[m] = (npcTotal[m] || 0) + mats[m];
        if (Object.keys(mats).length || armor.length) npcDetail.push({ vid: String(id), name: nameOf(Game, id), mats, armor });
      }
      return { day: nowDay(Game), stash, pack, npcTotal, npcDetail };
    } catch (e) { return { day: nowDay(Game), error: e.message }; }
  }

  const daily = [];
  const matTrace = [];
  let startCensus = null;
  try {
    const v0 = Game.state.village || {};
    startCensus = (v0.roster || []).map(id => ({ id: String(id), name: nameOf(Game, id) }));
  } catch (e) { startCensus = null; }
  let deadTail = 0;
  const teachDays = [];
  const teachLines = [];
  let teachStartIdx = 0;
  for (let d = 1; d <= DAYS; d++) {
    if (Game.over) break;
    try {
      const t = attemptTeach(Game, nowDay(Game) || d, teachStartIdx);
      teachDays.push(t.record);
      for (const ln of t.lines) teachLines.push(ln);
      teachStartIdx = t.nextStartIdx;
    } catch (e) { teachDays.push({ day: nowDay(Game) || d, kind: 'error', error: 'attemptTeach threw: ' + e.message }); }
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('wait', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    try { matTrace.push(matSnap()); } catch (e) { warnOnce('matSnap', e); }
    const roster = ((Game.state.village || {}).roster || []);
    const alive = roster.filter(id => !isDead(Game, id)).length;
    let wv = null, lp2 = null;
    try { wv = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
    try { lp2 = Game.waveLedgerPoints ? Game.waveLedgerPoints(2) : null; } catch (e) {}
    daily.push({ day: nowDay(Game), alive, roster: roster.length, pantryKcal: Math.round(pantryKcal(Game)), over: !!Game.over, wave: wv, ledger2: lp2 });
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  // r99: skill-economy rows (read-only slice of telemetry).
  const SKILL_TYPES = ['skill_lesson','skill_taught','villager_skill','villager_grant','villager_level_up','villager_seek_knowledge'];
  const skillRows = [];
  const resolveWho = (w) => {
    if (w == null) return null;
    if (w === 'player') return 'player';
    try { const n = nameOf(Game, w); return n || String(w); } catch (e) { return String(w); }
  };
  for (const t of tele) {
    if (!t || SKILL_TYPES.indexOf(t.type) < 0) continue;
    // Emission shapes (from src, not assumed): skill_lesson {teacher,learner,skill};
    // villager_skill {vid,skill}; skill_taught {ability} with NO actor;
    // villager_seek_knowledge {vid,teacher,ability}; villager_grant {vid,ability};
    // villager_level_up {vid,track}. tele() itself adds day/type only.
    let skill = null; try { skill = t.skill || t.ability || t.track || t.skillId || t.name || t.id || null; } catch (e) {}
    skillRows.push({ day: t.day, type: t.type,
      who: resolveWho(t.vid != null ? t.vid : (t.teacher != null ? t.teacher : null)),
      teacher: resolveWho(t.teacher), learner: resolveWho(t.learner),
      skill: skill == null ? null : String(skill).slice(0,80) });
  }
  const skillCounts = {}; for (const r of skillRows) skillCounts[r.type] = (skillCounts[r.type] || 0) + 1;
  const deaths = [];
  for (const t of tele) if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  let wave = 1; try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const v = Game.state.village || {};
  const census = [];
  for (const id of (v.roster || [])) {
    let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    let health = null; try { health = ((v.health || {})[id] !== undefined ? v.health[id] : null); } catch (e) {}
    let sick = false; try { sick = !!((v.sick || {})[id]); } catch (e) {}
    let equipped = []; try { equipped = Object.values((p && p.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
    let ownedArmor = []; try { ownedArmor = ((p && p.items) || []).filter(x => x && (x.itemId === 'bark_armor' || x.itemId === 'hide_armor')).map(x => x.itemId); } catch (e) {}
    let known = null;
    try {
      const k = p && (p.knownPlants || p.known || p.codex);
      known = k ? (Array.isArray(k) ? k.length : Object.keys(k).length) : null;
    } catch (e) {}
    let skills = null;
    try {
      const sk = p && (p.skills || p.learnedSkills || p.knownSkills);
      if (sk) skills = Array.isArray(sk) ? sk.map(String).slice(0, 20) : Object.keys(sk).slice(0, 20);
    } catch (e) {}
    census.push({ id: String(id), name: nameOf(Game, id), dead: isDead(Game, id),
      occ: (p && (p.occupation || p.formerOccupation)) || '?', health, sick, equipped, ownedArmor, knownCount: known, skills });
  }
  // Player armor + recipes.
  let playerPackArmor = [];
  try { playerPackArmor = ((Game.state.scholar || {}).inventory || []).filter(x => x && (x.itemId === 'bark_armor' || x.itemId === 'hide_armor')).map(x => x.itemId); } catch (e) {}
  let playerEquipped = [];
  try { const sp = Game.getPerson ? Game.getPerson(Game.villagerId) : null; playerEquipped = Object.values((sp && sp.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
  let playerRecipes = null;
  try { const rc = ((Game.state.codex || {}).recipes) || {}; playerRecipes = { bark_armor: (rc.bark_armor || {}).level || 0, hide_armor: (rc.hide_armor || {}).level || 0 }; } catch (e) {}
  const contestTele = tele.filter(t => t && typeof t.type === 'string' && /contest/i.test(t.type)).map(t => ({ day: t.day, type: t.type, id: t.id || null, result: t.outcome || t.result || null }));
  const contestCounts = {};
  for (const t of contestTele) contestCounts[t.type] = (contestCounts[t.type] || 0) + 1;

  // People check: 2 held convos at end of run (first two living
  // non-player villagers in roster order), goon-first, 8 turns.
  const convoLines = [];
  convoLines.push('=== R101 TEACHING CONVOS (one dawn attempt/day, player-teaches only) ===');
  for (const ln of teachLines) convoLines.push(ln);
  convoLines.push('=== END TEACHING CONVOS; end-of-run people check follows ===');
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  if (Game.over) convoLines.push('(people check skipped: game over — r81 driver flaw fixed, no post-collapse sample)');
  for (const vid of (Game.over ? [] : living.slice(0, 2))) {
    const nm = nameOf(Game, vid);
    const p = (() => { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } })();
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { convoLines.push('(choices empty)'); break; }
        let pick = null;
        if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else if (choices.find(ch => ch.id === 'ask:personal') && !seen['ask:personal']) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => ch.id !== 'leave' && ch.id !== 'bye' && !seen[ch.id])
          || null;
        if (!pick) { convoLines.push('(no pick)'); break; }
        if (pick.id !== 'goon') seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        convoLines.push(`THEM: ${r.line == null ? '(null)' : r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }

  const teleTypes = {};
  for (const t of tele) { const k = (t && t.type) || '?'; teleTypes[k] = (teleTypes[k] || 0) + 1; }
  const out = { seed, run: 'r101', days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, startCensus,
    aliveAt40: (daily.find(x => x.day === 40) || daily[daily.length - 1] || {}).alive ?? null,
    aliveEnd: daily.length ? daily[daily.length - 1].alive : null,
    waveReached: wave, pantryKcalEnd: Math.round(pantryKcal(Game)),
    deaths, census, daily, matTrace, craftLog, craftWrap, npcCraftLog, npcCraftWrap,
    playerPackArmor, playerEquipped, playerRecipes,
    contestTele: contestTele.slice(0, 100), contestCounts, waveSysLines: waveSysLines.slice(0, 60), teleTypes, skillRows: skillRows.slice(0, 500), skillCounts, teachDays };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `journey-establishment-r101-seed${seed}.json`), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(EVID, `journey-establishment-r101-convo-seed${seed}.txt`), convoLines.join('\n'));
  const teachSum = teachDays.reduce((a, r) => { a[r.kind] = (a[r.kind] || 0) + 1; return a; }, {});
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${out.aliveEnd} aliveAt40=${out.aliveAt40} wave=${wave} deaths=${deaths.length} pantryEnd=${out.pantryKcalEnd} craftLog=${craftLog.length} npcCraftCalls=${npcCraftLog.length} contests=${JSON.stringify(contestCounts)} skills=${skillRows.length} teach=${JSON.stringify(teachSum)}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
