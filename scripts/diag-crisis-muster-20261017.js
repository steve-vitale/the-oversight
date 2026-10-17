// diag-crisis-muster-20261017.js — CRISIS LEG r20: THE MUSTER THAT NEVER FIRES.
//
// Journey playthrough: does the village muster like people when the horde
// is at the door? Stage a wave-4 threat near Haven (d15–d21), watch the
// game-side muster episode (beat + verb + memories + all-clear), then play
// to d60. Census in plain words, full convo transcripts, SENSE-read.
// Usage: SEED=2100 node scripts/diag-crisis-muster-20261017.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '2100', 10);
const SIEGE_START = 15, SIEGE_END = 21, HORIZON = 60;

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function census(Game, label) {
  const v = Game.state.village || {};
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  const sh = Game.shelteredVillagers ? Game.shelteredVillagers() : [];
  for (const vid of (v.roster || [])) {
    const rc = (v.rosterChars || {})[vid] || {};
    const sick = (v.sick || {})[vid];
    const hp = (v.health || {})[vid];
    lines.push(`  ${firstName(rc.name || vid)} [${rc.occupationId || rc.formerOccupation || '?'}]${hp !== undefined && hp < 100 ? ' HP' + Math.round(hp) : ''}${sick ? ' SICK(' + (sick.name || '?') + ')' : ''}${sh.includes(vid) ? ' SHELTERED' : ''}`);
  }
  const fallen = (v.fallen || []).slice(-10).map(f => {
    let nm = f.name || '?';
    try { if (nm === '?' && f.villagerId) nm = rawName(Game, f.villagerId); } catch (e) {}
    return `${firstName(nm)} d${f.day} (${f.cause})`;
  });
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  pantry: ${pantryKcal(Game).toLocaleString()} kcal | mustered: ${!!v.shelterMustered} | world monsters: ${(Game.worldMonsters ? Game.worldMonsters().length : 0)}`);
  return lines.join('\n');
}

// Natural-path conversation driver (r5/r18/r19 lineage).
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw)', flags: {} }; }
  try {
    const open = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${(x.text || x.label || '').slice(0, 90)}`);
    out.push(`OPEN CHOICES (${open.length}): ${open.join(' | ')}`);
  } catch (e) {}
  const pickedIds = [];
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    if (t < 3) out.push(`TURN-CHOICES: ${choices.map(c => c.id).join(', ')}`);
    // comfort-loop guard: don't pick the same choice id twice in a row
    const lastPick = pickedIds[pickedIds.length - 1];
    const pool = choices.filter(c => c.id !== lastPick);
    const useChoices = pool.length ? pool : choices;
    let pick = useChoices.find(c => c.id === 'alive:event:muster');
    if (!pick) pick = useChoices.find(c => c.id === 'alive:event:threat');
    if (!pick) pick = useChoices.find(c => c.id === 'alive:event:care');
    if (!pick) pick = useChoices.find(c => c.id === 't2:lately');
    if (!pick) pick = useChoices.find(c => c.id === 'ask:lately');
    if (!pick) pick = useChoices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = useChoices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = useChoices.find(c => /muster|shelter|bar the hall|siege|monster|treeline|scared|afraid|night|attack|inside/i.test(c.text || ''));
    if (!pick) pick = useChoices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    pickedIds.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push(`FINAL: want=${(c && c.want && c.want.id) || 'none'} resolution=${(c && c.want && c.want.resolution) || 'n/a'}`);
  out.push('\n### FULL TRANSCRIPT');
  const full = [];
  for (const e of ((c && c.transcript) || [])) full.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  out.push(full.join('\n'));
  const txt = full.join('\n');
  const musterCarry = /(muster|bar the hall|barred|everyone inside|shelter)/i.test(txt);
  const siegeCarry = /(treeline|siege|hunt(s|ing)? near|outlast)/i.test(txt);
  const mournCarry = /(died|dead|gone|buried|funeral|mourn|since .* died)/i.test(txt);
  out.push(`\nCARRY-FLAGS: muster=${musterCarry} siege=${siegeCarry} mourn=${mournCarry}`);
  return { text: out.join('\n'), flags: { musterCarry, siegeCarry, mournCarry } };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-muster', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  const rec = {
    seed: SEED, musters: [], allClears: [], jumps: [], fallen: [],
    shelteredByDawn: [], memories: [], convos: [], notes: [], anomalies: [],
  };

  // ---- instrumentation ----
  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    try {
      if (/MUSTER/.test(s)) { rec.musters.push({ day: dayOf(Game), text: s.slice(0, 220) }); E(`[MUSTER] d${dayOf(Game)}: ${s.slice(0, 140)}`); }
      if (/ALL CLEAR/.test(s)) { rec.allClears.push({ day: dayOf(Game), text: s.slice(0, 220) }); E(`[ALLCLEAR] d${dayOf(Game)}`); }
    } catch (e) {}
    return _say.call(this, t);
  };
  const _rwme = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    try {
      if (!(opts && opts.raid)) rec.jumps.push({ day: dayOf(Game), who: firstName(rawName(Game, vid)), mon: m && m.id, sheltered: Game.isSheltered ? Game.isSheltered(vid) : '?' });
    } catch (e) {}
    return _rwme.call(this, vid, m, opts);
  };
  const _rem = Game.remember;
  if (_rem) Game.remember = function (vid, kind, text, opts) {
    try { if (kind === 'mustered') rec.memories.push({ day: dayOf(Game), who: firstName(rawName(Game, vid)), kind }); } catch (e) {}
    return _rem.call(this, vid, kind, text, opts);
  };
  const _die = Game.registerDeath;
  if (_die) Game.registerDeath = function () {
    try { rec.fallen.push({ day: dayOf(Game), n: ((Game.state.village || {}).fallen || []).length }); } catch (e) {}
    return _die.apply(this, arguments);
  };

  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  const w4def = (Game.data.monsters || []).find(m => (m.wave || 1) === 4);
  if (!w4def) { E('FATAL: no wave-4 def'); process.exit(2); }
  let threatNoun = 'something';
  try { threatNoun = Game.monsterNoun(w4def.id) || threatNoun; } catch (e) {}
  rec.threat = { id: w4def.id, noun: threatNoun };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${SIEGE_START}d...`);
  await runDays(Game, oracleV2, { days: SIEGE_START });
  E(census(Game, 'established'));

  // ---- phase 2: the siege ----
  // NATURALISTIC CONTACT (r20): the threat is pinned ONCE adjacent to Haven
  // and then wanders on its own — monsters steer clear of villages
  // (wanderWorldMonsters skips safe tiles), so real muster episodes are
  // transient passes, not sieges. Re-pin ONLY if no muster has fired 3 days
  // in (guarantees one episode per seed for the assessment; the response is
  // what's measured, contact is staged).
  E(`[SIEGE] staging ${w4def.id} (${threatNoun}) near Haven`);
  Game.spawnWorldMonster(w4def, hx + 1, hy, {});
  const siegeStartDay = dayOf(Game);
  let siegeDays = 0, midConvosDone = false;
  for (let i = 0; i < 7 && !Game.over; i++) {
    if (rec.musters.length === 0 && dayOf(Game) >= siegeStartDay + 3) {
      try {
        for (const m of (Game.worldMonsters() || [])) {
          if (m && m.id === w4def.id && !m.lingering) { m.tx = hx + 1; m.ty = hy; }
        }
        rec.notes.push(`re-pinned threat d${dayOf(Game)} (no muster yet)`);
      } catch (e) {}
    }
    await runDays(Game, competent, { days: 1 });
    siegeDays++;
    try { rec.shelteredByDawn.push({ day: dayOf(Game), n: (Game.shelteredVillagers ? Game.shelteredVillagers().length : 0), mustered: !!((Game.state.village || {}).shelterMustered) }); } catch (e) {}
    // mid-siege convos: sample WHILE mustered, not after the episode ends
    if (!midConvosDone && ((Game.state.village || {}).shelterMustered)) {
      midConvosDone = true;
      try {
        const sh = Game.shelteredVillagers ? Game.shelteredVillagers() : [];
        for (const vid of sh.slice(0, 2)) {
          const r = driveConvo(Game, vid, `MID-SIEGE d${dayOf(Game)}`);
          E(r.text); rec.convos.push({ phase: 'mid', vid: firstName(rawName(Game, vid)), flags: r.flags });
        }
      } catch (e) { rec.anomalies.push('mid convos threw: ' + e.message); }
    }
    const pop = ((Game.state.village || {}).roster || []).length;
    if (pop <= 2) { rec.notes.push(`death-aware stop at d${dayOf(Game)} (pop ${pop})`); break; }
  }
  if (!midConvosDone) rec.notes.push('no mid-siege convos: village never mustered during the window');
  E(census(Game, 'mid-siege'));

  // ---- phase 3: threat leaves, play to horizon ----
  E(`[SIEGE] threat removed d${dayOf(Game)} — watching the all-clear`);
  Game.state.worldMonsters = [];
  let d = dayOf(Game);
  while (d < HORIZON && !Game.over) {
    await runDays(Game, competent, { days: 2 });
    d = dayOf(Game);
    try { rec.shelteredByDawn.push({ day: d, n: (Game.shelteredVillagers ? Game.shelteredVillagers().length : 0), mustered: !!((Game.state.village || {}).shelterMustered) }); } catch (e) {}
    const pop = ((Game.state.village || {}).roster || []).length;
    if (pop <= 2) {
      rec.notes.push(`death-aware stop at d${d} (pop ${pop})`);
      for (let t = 0; t < 5 && !Game.over; t++) await runDays(Game, competent, { days: 2 });
      break;
    }
  }
  E(census(Game, 'end'));

  // end convos (4): 2 who were sheltered + 2 others
  try {
    const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
    const hadMustered = roster.filter(id => ((Game.state.village.memory || {})[id] || []).some(m => m.t === 'mustered'));
    const picks = [...hadMustered.slice(0, 2), ...roster.filter(id => !hadMustered.includes(id)).slice(0, 2)].slice(0, 4);
    for (const vid of picks) {
      const r = driveConvo(Game, vid, `END d${dayOf(Game)}`);
      E(r.text); rec.convos.push({ phase: 'end', vid: firstName(rawName(Game, vid)), flags: r.flags });
    }
  } catch (e) { rec.anomalies.push('end convos threw: ' + e.message); }

  Game.say = _say; Game.resolveWildMonsterEncounter = _rwme;
  if (_rem) Game.remember = _rem; if (_die) Game.registerDeath = _die;
  rec.endDay = dayOf(Game); rec.over = !!Game.over;
  // fallen causes, read honestly from state (the death wrapper can't see causes)
  try {
    rec.fallenCauses = ((Game.state.village || {}).fallen || []).map(f => {
      let nm = f.name || '?';
      try { if ((nm === '?' || /^A /.test(nm)) && f.villagerId) nm = rawName(Game, f.villagerId); } catch (e) {}
      return { day: f.day, who: firstName(nm), cause: f.cause || '?' };
    });
  } catch (e) { rec.fallenCauses = []; }
  process.stdout.write(JSON.stringify(rec, null, 1) + '\n');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
