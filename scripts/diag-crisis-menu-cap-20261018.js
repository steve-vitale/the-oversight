// diag-crisis-menu-cap-20261018.js — CRISIS LEG r22: THE MENU THAT WOULDN'T END.
//
// Sense-read pilot (MEASUREMENT.md M3): real playthrough — oracleV2
// establishes 15d, a wave-4 threat is staged adjacent to Haven, the
// game-side muster fires, then 3 sheltered villagers are talked to while
// the muster is ACTIVE and a lately event is live. Verdicts:
//   (a) do beat-path menus stay within the MAXC budget in real play
//       (menu lengths recorded per turn)?
//   (b) kill-rule check: do earned/structural verbs (teach, offer_help,
//       want options, subject-change) still appear across the convos —
//       the cap must not starve them in practice?
//   (c) do the transcripts read as people — the NPC wants something,
//       options engage/deflect, endings resolve/plant/owe?
//
// Output: full transcripts + per-turn menu sizes + carry flags to stderr;
// JSON summary to stdout.
// Run: SEED=3201 node scripts/diag-crisis-menu-cap-20261018.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '3201', 10);
const EST = 15;

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
const E = (s) => console.error(s);

function driveConvo(Game, vid, tag, menuStats, verbSeen) {
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw)', flags: {} }; }
  const picked = [];
  let maxMenu = 0;
  for (let t = 0; t < 12; t++) {
    const choices = Game.convoChoices(vid) || [];
    maxMenu = Math.max(maxMenu, choices.length);
    menuStats.push(choices.length);
    try {
      const bm = Game.beatMenuResponses ? Game.beatMenuResponses(vid) : 'n/a';
      E(`[MENU t${t}] n=${choices.length} beatPath=${bm === 'n/a' ? 'n/a' : (bm ? 'yes(' + bm.length + ')' : 'no-fallback')} ids=[${choices.map(c => c.id).join(',')}]`);
    } catch (e) { E(`[MENU t${t}] n=${choices.length} beatPath=threw`); }
    for (const c of choices) if (c && c.id) verbSeen.add(c.id.split(':')[0] === 'alive' ? c.id : c.id);
    if (!choices.length) { out.push('(no choices offered)'); break; }
    if (t === 0) out.push(`T1 (${choices.length}): ${choices.map(c => c.id).join(', ')}`);
    const lastPick = picked[picked.length - 1];
    const pool = choices.filter(c => c.id !== lastPick);
    const use = pool.length ? pool : choices;
    // Event choice FIRST (crisis leg), then a human mix.
    let pick = use.find(c => /^alive:event:/.test(c.id));
    if (!pick) pick = use.find(c => /^gq:/.test(c.id));
    if (!pick) pick = use.find(c => /^(ask:past|ask:goal|ask:village|ask:plans)$/.test(c.id));
    if (!pick) pick = use.find(c => !/^(leave|bye|goodbye|more|silence)$/.test(c.id));
    if (!pick || /^(leave|bye|goodbye)$/.test(pick.id)) break;
    picked.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] (${use.length} offered)`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 350)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push('### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || []))
    out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 500)}`);
  const txt = ((c && c.transcript) || []).map(e => String(e.text)).join('\n');
  const flags = {
    eventLed: picked.some(p => /^alive:event:/.test(p)),
    eventFirst: picked.length > 0 && /^alive:event:/.test(picked[0]),
    maxMenu,
    musterCarry: /(muster|barred|everyone inside|treeline|outlast)/i.test(txt),
    want: (c && c.want && (c.want.resolution || c.want.id || c.want.stage)) || 'none',
    turns: picked.length,
  };
  out.push(`\nFLAGS: ${JSON.stringify(flags)}`);
  return { text: out.join('\n'), flags };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'diag-crisis-menu-cap' });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;

  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${EST}d...`);
  await runDays(Game, oracleV2, { days: EST });
  const w4def = (Game.data.monsters || []).find(m => (m.wave || 1) === 4);
  E(`[SIEGE] staging ${w4def.id} adjacent to Haven`);
  Game.spawnWorldMonster(w4def, hx + 1, hy, {});
  const siegeStart = dayOf(Game);
  let mustered = false;
  for (let i = 0; i < 7 && !Game.over; i++) {
    await runDays(Game, competent, { days: 1 });
    if ((Game.state.village || {}).shelterMustered) { mustered = true; break; }
    if (!mustered && dayOf(Game) >= siegeStart + 3) {
      for (const m of (Game.worldMonsters() || [])) {
        if (m && m.id === w4def.id && !m.lingering) { m.tx = hx + 1; m.ty = hy; }
      }
    }
  }
  E(`[SIEGE] mustered=${mustered} d${dayOf(Game)}`);

  const out = [`# r22 sense-read (seed ${SEED}, day ${dayOf(Game)})`, `muster fired: ${mustered}`];
  const rec = { seed: SEED, mustered, convos: [], menuStats: [], verbsSeen: [] };
  const menuStats = [];
  const verbSeen = new Set();
  if (mustered) {
    const sh = Game.shelteredVillagers ? Game.shelteredVillagers() : [];
    const partners = sh.slice(0, 3);
    E(`[CONVOS] ${partners.length} sheltered partners, crowding each with 2 threads + 2 memories`);
    for (const vid of partners) {
      try {
        Game.convoThreadOpen(vid, 'goal', 'About what they want', 'unfinished',
          '"I have been thinking about what I want from all this."');
        Game.convoThreadOpen(vid, 'past', 'About their old life', 'unfinished',
          '"Back home I used to keep bees, can you believe it."');
      } catch (e) {}
      v.memory[vid] = v.memory[vid] || [];
      const d = dayOf(Game);
      v.memory[vid].push({ t: 'gift', day: d });
      v.memory[vid].push({ t: 'feast', day: d });
      const evk = (() => { try { return Game.t2LatelyEvent(vid).kind; } catch (e) { return 'threw'; } })();
      const r = driveConvo(Game, vid, `MID-SIEGE d${dayOf(Game)} (lately=${evk})`, menuStats, verbSeen);
      E(r.text);
      rec.convos.push({ vid: firstName(rawName(Game, vid)), lately: evk, flags: r.flags });
    }
  }
  rec.menuStats = menuStats;
  rec.verbsSeen = [...verbSeen].sort();
  rec.maxMenu = Math.max(0, ...menuStats);
  E(`\n[MENUS] ${menuStats.length} menus observed, max=${rec.maxMenu}, sizes=[${menuStats.join(',')}]`);
  E(`[VERBS] seen across convos: ${rec.verbsSeen.join(', ')}`);
  E('\n#CENSUS');
  const roster = (v.roster || []);
  const dead = [];
  for (const vid of roster) {
    const rc = (v.rosterChars || {})[vid] || {};
    E(`  ${firstName(rc.name || vid)} [${rc.occupationId || rc.formerOccupation || '?'}]`);
  }
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
