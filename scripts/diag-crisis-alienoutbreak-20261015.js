#!/usr/bin/env node
// diag-crisis-alienoutbreak-20261015.js — CRISIS LEG r16: the alien outbreak.
// Controlled REAL alien-pool outbreak: establish 20d (oracleV2), then the
// village "tested" hushwolf/bulldozer/belltoad meat last week
// (markMonsterFoodSafe via the REAL function — the cautious-test outcome)
// and cleaned meat goes into the REAL pantry via pantryAdd in the exact
// schema the clean-carcass path produces. Everything downstream —
// villageEats draws, trackMealExposure, villagerMonsterWeirdness (the real
// 20% village-cooked roll), status dayPart ticks, tending, conversations —
// is fully real code. Run 8 more days, then drive full transcripts with 2
// quirked + 2 healthy villagers asking 'lately' first.
// Question: when villagers contract alien transformations through the real
// eat pathway, does the village's conversation carry it, or does the
// transformation horror pass in silence?
// Usage: SEED=6101 node scripts/diag-crisis-alienoutbreak-20261015.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '6101', 10);
const ESTABLISH = 20, OUTBREAK_DAYS = 10;
const QUIRKS = ['howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind', 'eurika', 'east_nile', 'lemons'];
const QUIRK_DESC = {
  howlbelly: 'howling at night', gristlefit: 'rage fits / knotted shoulders',
  croakbelly: 'gut ribbiting', shellgut: 'digestion clanking / chitin',
  witness_maw: 'black tears / people edging away', flockmind: 'quacking when startled',
  eurika: 'mosquito virus: sensory static', east_nile: 'mosquito virus: fever dreams / crows',
  lemons: 'alien tick: ringed rashes at joints'
};

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  // Exclude the Bearer: the diag drives NPC conversations; the player's own
  // vid would otherwise be a valid (and confusingly-named) target.
  return (v.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function quirksOf(Game, vid) {
  const out = [];
  let person = null;
  try { person = Game.getPerson(vid); } catch (e) { return out; }
  if (!person) return out;
  for (const q of QUIRKS) {
    try { if (Game.hasStatus(person, q)) out.push(q); } catch (e) {}
  }
  return out;
}
function trustOf(Game, vid) { try { return ((Game.state.village || {}).trust || {})[vid]; } catch (e) { return null; } }

const rec = { seed: SEED, staged: null, sayLines: [], quirked: [], convos: [], notes: [], census: {} };
const E = (s) => console.error(s);

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const q = quirksOf(Game, vid);
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} (quirks: ${q.length ? q.join(',') : 'none'})`];
  let latelyKind = 'unknown';
  try { const ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; latelyKind = ev ? ev.kind : 'none'; } catch (e) {}
  out.push(`[latelyKind=${latelyKind}]`);
  try { Game.startConvo(vid); } catch (e) { return { vid, tag, latelyKind, quirks: q, lines: out, err: 'startConvo threw: ' + e.message }; }
  for (let t = 0; t < maxTurns; t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { out.push('(convoChoices threw)'); break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /howl|howling|tears|black|quack|ribbit|rage|clank|chitin|feather|rash|wolv|bulldozer|toad|strange|wrong|changed|night/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    out.push(`> [${pick.id}] ${pick.text}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push('(convoTurn threw: ' + e.message + ')'); break; }
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 450)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { vid, name: firstName(rawName(Game, vid)), latelyKind, quirks: q, lines: out };
}

function census(Game, label) {
  const roster = livingRoster(Game);
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, pop ${roster.length} ---`];
  for (const vid of roster) {
    const q = quirksOf(Game, vid);
    lines.push(`  ${firstName(rawName(Game, vid))}${q.length ? ' QUIRKED(' + q.join(',') + ')' : ''} trust=${trustOf(Game, vid)}`);
  }
  try {
    const fallen = ((Game.state.village || {}).fallen || []).slice(-6)
      .map(f => `${firstName(f.name || '?')} d${f.day} (${f.cause || '?'})`);
    lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  } catch (e) {}
  try {
    const pq = QUIRKS.filter(q => Game.hasStatus('scholar', q));
    lines.push(`  PLAYER(Bearer) quirks: ${pq.length ? pq.join(',') : 'none'}`);
  } catch (e) {}
  return lines.join('\n');
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-alien-outbreak', fullTelemetry: true });
  await setupGame(Game);
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(census(Game, 'pre-staging'));

  // Capture infection say-lines (harness stubs say to no-op; wrap it).
  const sayBuf = [];
  const _say = Game.say;
  Game.say = function (txt) { try { sayBuf.push(String(txt)); } catch (e) {} return _say.apply(this, arguments); };

  // CONTROLLED REAL staging — FAMINE-EDGE (the honest real-game condition
  // under which villagers eat monster meat): the village's stores ran out;
  // the hunters dragged in hushwolves, bulldozers and belltoads; tonight
  // the village eats strange meat. The existing pantry is recorded and
  // drained (famine-edge fiction, controlled); the haul goes in via the REAL
  // pantryAdd in the exact clean-carcass schema. The village "tested" the
  // meats (markMonsterFoodSafe, the real cautious-test outcome). Everything
  // downstream — villageEats draws, trackMealExposure, villagerMonsterWeirdness
  // (the real 20% village-cooked roll), status dayPart ticks, tending,
  // conversations — is fully real code.
  const v0 = Game.state.village;
  const drainedKcal = (v0.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const drainedStacks = (v0.pantry || []).length;
  v0.pantry = [];
  const meats = [
    { mid: 'hushwolf', name: 'hushwolf meat' },
    { mid: 'bulldozer', name: 'bulldozer meat' },
    { mid: 'belltoad', name: 'belltoad meat' },
  ];
  const stagedItems = [];
  let weirdCalls = 0, weirdHits = 0;
  const _wmw = Game.villagerMonsterWeirdness;
  Game.villagerMonsterWeirdness = function (vid, item, co) {
    weirdCalls++;
    const r = _wmw.apply(this, arguments);
    if (r) {
      weirdHits++;
      try {
        const mid = String((item && item.plantId) || '').replace(/^meat_/, '');
        const dz = ((this.data.cooking || {}).monsterDiseases || []).find(x => (x.monsters || []).includes(mid));
        infectEvents.push({ day: dayOf(Game), vid: firstName(rawName(Game, vid)), meat: mid, quirk: dz ? dz.id : '?' });
      } catch (e) {}
    }
    return r;
  };
  for (const m of meats) {
    try { Game.markMonsterFoodSafe(m.mid, 'tested'); } catch (e) { rec.notes.push('markMonsterFoodSafe threw for ' + m.mid + ': ' + e.message); }
    const item = {
      name: m.name, plantId: 'meat_' + m.mid, foodKind: 'meat',
      foodState: 'cleaned', edible: true, units: 6, kcalEach: 400,
      hiddenKcal: 2400, spoilDay: dayOf(Game) + 3, safe: true, kg: 0.5,
      prep: 'Cleaned ' + m.name + '. The village tested it — it eats fine.',
      diseaseRisk: { p: 0.35, dmg: 12, note: 'raw meat' },
    };
    let ok = false;
    try { ok = Game.pantryAdd(item); } catch (e) { rec.notes.push('pantryAdd threw for ' + m.mid + ': ' + e.message); }
    stagedItems.push({ mid: m.mid, pantryAddOk: !!ok });
  }
  rec.staged = { day: dayOf(Game), items: stagedItems, drainedKcal: Math.round(drainedKcal), drainedStacks };
  E(`[STAGED] d${dayOf(Game)}: drained ${Math.round(drainedKcal)} kcal (${drainedStacks} stacks); haul ${stagedItems.map(s => s.mid + '=' + (s.pantryAddOk ? 'in' : 'REJECTED')).join(', ')}`);

  // Quirk durations are short (2-3 days): run the outbreak window in 2-day
  // chunks and take the mid-outbreak conversation checkpoint as soon as >=2
  // villagers are actively quirked — while the transformations are fresh.
  const infectEvents = [];
  let midDone = false;
  async function convoCheckpoint(tag) {
    const roster = livingRoster(Game);
    const qvids = roster.filter(vid => quirksOf(Game, vid).length);
    const healthy = roster.filter(vid => qvids.indexOf(vid) < 0);
    const targets = [
      ...qvids.slice(0, 2).map(v => [v, 'quirked']),
      ...healthy.slice(0, 2).map(v => [v, 'healthy']),
    ];
    E(`[CONVO] ${tag} checkpoint d${dayOf(Game)}: ${qvids.length} actively quirked, talking to ${targets.length}`);
    for (const [vid, vtag] of targets) {
      const c = driveConvo(Game, vid, vtag + '-' + tag + '-d' + dayOf(Game));
      rec.convos.push({ checkpoint: tag, tag: vtag, name: c.name, latelyKind: c.latelyKind, quirks: c.quirks });
      E(c.lines.join('\n'));
      E('');
    }
  }
  for (let d = 0; d < OUTBREAK_DAYS && !Game.over; d += 1) {
    await runDays(Game, oracleV2, { days: 1 });
    // Trigger on the FIRST infection — quirk durations (2-3d) are short and
    // staggered, so waiting for two misses the fresh moment.
    if (!midDone && infectEvents.length >= 1) { midDone = true; await convoCheckpoint('mid'); }
  }
  if (Game.over) E('[OUTBREAK] game over during outbreak window — death-aware stop');
  Game.say = _say;
  Game.villagerMonsterWeirdness = _wmw;
  rec.weirdnessRolls = { calls: weirdCalls, hits: weirdHits };
  rec.infectEvents = infectEvents;

  const roster = livingRoster(Game);
  const quirked = roster.map(vid => ({ vid, q: quirksOf(Game, vid) })).filter(x => x.q.length);
  rec.quirked = quirked.map(x => ({ name: firstName(rawName(Game, x.vid)), quirks: x.q, trust: trustOf(Game, x.vid) }));
  E(`[OUTBREAK] d${dayOf(Game)}: ${quirked.length}/${roster.length} villagers hold alien quirks`);
  E(census(Game, 'post-outbreak'));
  const infectLines = sayBuf.filter(s => /ate .*(meat|hushwolf|bulldozer|toad)|howls at night|tears run black|quacks|ribbit|CLANK|shoulders/i.test(s));
  rec.sayLines = infectLines.slice(0, 30);
  E(`[SAY] captured ${infectLines.length} infection/warning say-lines`);
  for (const s of infectLines.slice(0, 12)) E('  SAY: ' + s.slice(0, 160));

  // People check: mid checkpoint happened fresh; end-state checkpoint now.
  await convoCheckpoint('end');
  rec.census.post = census(Game, 'post-outbreak');
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
