#!/usr/bin/env node
// diag-crisis-succession-20261012.js — CRISIS LEG r4: succession DURING a crisis.
// Establishes a village (~day 14, oracleV2 competent play), then injects a
// SIEGE (wave-1 world monsters on the haven tile + famine-edge pantry), plays
// 4 crisis days as the Bearer, kills the Bearer through the REAL
// Game.playerDeath handler ('defending the haven'), then plays 10 days as the
// successor with the competent policy. Captures:
//   - the full death-beat transcript (does the mantle pass sensibly mid-crisis?)
//   - siege pressure on the successor (fights, defenses, deaths)
//   - relief/mourning beats, news sensibility
//   - mourner conversations (SENSE-TESTING LAW read)
// Usage: SEED=424242 node scripts/diag-crisis-succession-20261012.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '424242', 10);
const DAYS_PRE = parseInt(process.env.DAYS_PRE || '14', 10);
const DAYS_CRISIS = parseInt(process.env.DAYS_CRISIS || '4', 10);
const DAYS_POST = parseInt(process.env.DAYS_POST || '10', 10);

function rawName(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) return rc.name;
  } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
}
function census(Game, label) {
  const v = Game.state.village || {}, s = Game.state.scholar || {};
  const lines = [`--- CENSUS (${label}), day ${s.day || 0}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  for (const vid of (v.roster || [])) {
    const rc = (v.rosterChars || {})[vid] || {};
    const sick = (v.sick || {})[vid];
    lines.push(`  ${firstName(rc.name || vid)} [${rc.occupationId || rc.formerOccupation || '?'}] trust=${(v.trust || {})[vid] == null ? '?' : v.trust[vid]}${sick ? ' SICK(' + (sick.name || '?') + ')' : ''}`);
  }
  const fallen = (v.fallen || []).slice(-6).map(f => `${firstName(f.name || rawName(Game, f.villagerId) || '?')} d${f.day} (${f.cause})`);
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  pantry: ${pantryKcal(Game)} kcal | siege monsters on map: ${(Game.worldMonsters ? Game.worldMonsters().length : (Game.state.worldMonsters || []).length)}`);
  return lines.join('\n');
}

// Natural-path conversation driver (same as journey-succession): answer their
// question, engage the want, ask about the situation, then leave.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [];
  out.push(`## ${tag} — talking to ${firstName(rawName(Game, vid))}`);
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  // SENSE-TESTING: dump the FULL opening choice list so the read can judge
  // what the engine offered, not just what the driver picked.
  try {
    const open = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${(x.text || x.label || '').slice(0, 90)}`);
    out.push(`OPEN CHOICES (${open.length}): ${open.join(' | ')}`);
  } catch (e) {}
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /how|feeling|holding|news|day|worried|afraid|hungry|miss|died|gone|grief|sad|angry|siege|monster|defend|dead|funeral|buri/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); }
    catch (e) { out.push(`(turn threw: ${e.message})`); break; }
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
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  return out.join('\n');
}

async function main() {
  const { Game, manifest } = await loadGame({ seed: SEED, mode: 'crisis-succession', fullTelemetry: true });
  await setupGame(Game);
  const day = () => { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } };

  // ---- narrative capture ----
  const lines = [];
  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/🕯️|💀|dead|died|kill|monster|beast|hush|bulldozer|deer|toad|siege|defend|patrol|tended|sick|fever|relief|ration|pantry|hunger|starv|grief|mourn|funeral|buri|scream|digging|mantle|codex|successor|steps up|picks up/i.test(s))
      lines.push({ day: day(), text: s.slice(0, 300) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- siege + defense tracking ----
  const fights = [], vdeaths = [];
  const scanRoster = (label) => {
    const v = Game.state.village || {};
    const now = new Set((v.roster || []).map(String));
    for (const vid of [...(scanRoster.seen || [])]) {
      if (!now.has(String(vid))) {
        const f = (v.fallen || []).slice(-1)[0] || {};
        vdeaths.push({ day: day(), label, name: firstName(f.name || rawName(Game, vid) || '?'), cause: f.cause || '?' });
      }
    }
    scanRoster.seen = now;
  };
  scanRoster('init');

  const o2 = {
    id: 'crisis-succession',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try { scanRoster('run'); } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };

  // ---- phase 1: establish ----
  const r1 = await runDays(Game, o2, { days: DAYS_PRE, manifest });
  console.error(`pre-phase: ${r1.gameDays}d, end=${r1.endReason}`);
  console.error(census(Game, 'BEFORE SIEGE'));

  // ---- inject the siege ----
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const pack = [];
  try {
    pack.push(Game.spawnWorldMonster('hushwolf', hx, hy, { mx: 2, my: 3 }));
    pack.push(Game.spawnWorldMonster('hushwolf', hx, hy, { mx: 6, my: 5 }));
    pack.push(Game.spawnWorldMonster('bulldozer', hx, hy, { mx: 4, my: 6 }));
    pack.push(Game.spawnWorldMonster('gallowdeer', hx + 1 <= 8 ? hx + 1 : hx - 1, hy, { mx: 3, my: 2 }));
    console.error(`SIEGE injected day ${day()}: Hushpuppy x2 + Bulldozer on the haven tile, Highbeam Deer adjacent`);
  } catch (e) { console.error('siege inject threw: ' + e.message); }
  // famine edge: drain the pantry to ~700 kcal (the village was eating well; now it isn't)
  // (r4 fix: the old `pan.length > 2` guard no-op'd on 2-stack pantries — drain proportionally instead)
  try {
    const target = 700;
    let kcal = pantryKcal(Game);
    const pan = v.pantry || [];
    if (kcal > target && pan.length) {
      const f = target / kcal;
      for (const it of pan) it.units = Math.max(1, Math.floor((it.units || 1) * f));
      kcal = pantryKcal(Game);
      const sorted = pan.slice().sort((a, b) => (b.kcalEach || 0) * (b.units || 1) - (a.kcalEach || 0) * (a.units || 1));
      for (const it of sorted) {
        if (kcal <= target + 300) break;
        const cut = Math.min((it.units || 1) - 1, Math.ceil((kcal - target) / (it.kcalEach || 1)));
        if (cut > 0) { it.units -= cut; kcal -= cut * (it.kcalEach || 0); }
      }
    }
    console.error(`pantry drained to ${pantryKcal(Game)} kcal (famine edge)`);
  } catch (e) { console.error('pantry drain threw: ' + e.message); }

  // ---- phase 2: the siege, Bearer alive ----
  const r2 = await runDays(Game, o2, { days: DAYS_CRISIS, manifest });
  console.error(`siege phase: ${r2.gameDays}d, end=${r2.endReason}`);
  console.error(census(Game, 'SIEGE, BEARER ALIVE'));

  // ---- the death: the real handler ----
  const oldId = Game.villagerId;
  const oldName = rawName(Game, oldId);
  const sayMark = lines.length;
  Game.playerDeath('defending the haven');
  const deathBeat = lines.slice(sayMark).map(l => l.text);
  const newId = Game.villagerId;
  const newName = rawName(Game, newId);
  console.error(`\n===== DEATH BEAT (day ${day()}) =====`);
  console.error(`  ${firstName(oldName)} -> ${firstName(newName)} | over=${Game.over} villageLost=${Game.villageLost}`);
  for (const t of deathBeat) console.error('  ' + t.replace(/\n/g, '\n  '));

  // ---- phase 3: the successor's crisis ----
  const r3 = await runDays(Game, competent, { days: DAYS_POST, manifest });
  console.error(`\npost-phase: ${r3.gameDays}d, end=${r3.endReason}`);
  console.error(census(Game, 'SUCCESSOR +10 DAYS'));

  // ---- people check: mourner conversations ----
  const convos = [];
  try {
    const roster = (Game.state.village.roster || []).filter(id => id !== newId);
    const trust = Game.state.village.trust || {};
    const byTrust = roster.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
    if (byTrust[0]) convos.push(driveConvo(Game, byTrust[0], 'CRISIS-SUCCESSION — successor talks to highest-trust villager'));
    if (byTrust[1]) convos.push(driveConvo(Game, byTrust[1], 'CRISIS-SUCCESSION — successor talks to a second villager'));
  } catch (e) { convos.push('(convo drive threw: ' + e.message + ')'); }
  for (const c of convos) console.error('\n' + c);

  // ---- report ----
  const rec = {
    seed: SEED, preDays: r1.gameDays, siegeDays: r2.gameDays, postDays: r3.gameDays,
    endReason: r3.endReason,
    oldBearer: firstName(oldName), newBearer: firstName(newName),
    over: !!Game.over, villageLost: !!Game.villageLost,
    deaths: vdeaths, lines: lines.length,
  };
  console.log(JSON.stringify(rec));
  console.error(`\n=== VILLAGER DEATHS (${vdeaths.length}) ===`);
  for (const d of vdeaths) console.error(`  d${d.day} [${d.label}]: ${d.name} — ${d.cause}`);
  console.error(`\n=== NARRATIVE (${lines.length} captured) ===`);
  const seenL = new Set();
  for (const l of lines) {
    const k = l.text.slice(0, 70);
    if (seenL.has(k)) continue;
    seenL.add(k);
    console.error(`  d${l.day}: ${l.text.slice(0, 220)}`);
    if (seenL.size > 2000) { console.error('  ... (truncated)'); break; }
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
