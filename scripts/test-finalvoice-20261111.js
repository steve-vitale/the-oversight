#!/usr/bin/env node
// test-finalvoice-20261111.js — proof test for arm sim-finalvoice-b
// (sim-findings #2252 + #2253, r182 endgame voice).
//
// #2252: the held-item arming refrain printed byte-identical after EVERY
// held item, 3-4x per finale transcript. The closing clause now rotates
// through 4 deterministic variants (progression.js channelSentiment).
// #2253: the war-path "Even now the wave-5 bar reads: ..." line printed
// on full-seat audits too, where the seat is already priced. The audit's
// seat now rides into tableDeedLines; a full seat silences the bar-read.
//
// GATES (all must be GREEN):
//   V1 devotion lane: 4 keepsakes channeled -> each keeps the beat's core
//      ("Your gifts are not mastered — but they are lived-in") + FEASTED
//      terms, all 4 lines distinct, and the FULL old sentence prints
//      verbatim at most 1x across the 4.
//   V2 mastery lane: same shape — "The feast was the weapon" kept per
//      item, full old sentence at most 1x, all 4 distinct.
//   V3 war path: a full-seat audit voices kills/titans but NO "bar reads";
//      a lesser seat (and a bare call) still voices the unready bar.
//   V4 purity: tableDeedLines({seat:'full'}) makes zero state writes
//      (state JSON byte-identical before/after) — the records stay a pure
//      render; tableSeat() is never called inside it.
//
// Usage: node scripts/test-finalvoice-20261111.js
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let fails = 0;
function ok(cond, name, extra) {
  if (cond) { console.log(`  ok   ${name}`); }
  else { fails++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

const ITEMS = [
  ['tin_cup', "Grandma's Tin Cup"],
  ['contract_quill', 'Contract Quill'],
  ['mixtape', 'Mixtape'],
  ['hard_candy', 'Hard Candy'],
];

async function channelAs(Game, itemId, name, lane) {
  const s = Game.state.scholar;
  const pg = Game.progState();
  pg.sentimentTaught = true;
  s.trauma = 0;
  pg.surgeResonance = 35;
  if (lane === 'devotion') {
    s.abilities = [
      { id: 'a1', name: 'Gift One', level: 1, xp: 0 },
      { id: 'a2', name: 'Gift Two', level: 2, xp: 0 },
    ];
    s.backgroundAbilities = [];
  } else {
    s.abilities = [
      { id: 'a1', name: 'Gift One', level: 3, xp: 0 },
      { id: 'a2', name: 'Gift Two', level: 3, xp: 0 },
      { id: 'a3', name: 'Gift Three', level: 3, xp: 0 },
    ];
    s.backgroundAbilities = [];
  }
  s.inventory = [{ itemId, name, sentimental: true }];
  pg.chanDay = {};
  const said = [];
  const oSay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) { console.warn('[finalvoice proof]', e); } return oSay.apply(this, arguments); };
  let msg;
  try { msg = Game.channelSentiment(0); } finally { Game.say = oSay; }
  return { msg, said };
}

function countSub(hay, needle) {
  let n = 0, i = 0;
  for (;;) { const j = hay.indexOf(needle, i); if (j < 0) return n; n++; i = j + needle.length; }
}

// War-path fixture (mirrors test-tabledeed-20261021.js fixtureGame).
async function fixtureGame(opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed: 424242, mode: 'tabledeed-fixture', fullTelemetry: false });
  await setupGame(Game);
  Game.state.systemArrived = true;
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const vid = (roster.find(x => x && x !== Game.villagerId)) || 'v_1';
  Game.state.waveKillLog = (opts.kills || []).map(k => ({
    d: k.day, mid: k.mid, w: k.w || 4, by: k.by === 'AUTO' ? vid : (k.by || 'player'), via: k.via || 'companion', trick: null,
  }));
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = {};
  for (const m of (opts.slainMids || [])) Game.state.codex.monsters[m] = { stage: 'slain' };
  const sch = Game.state.scholar || {};
  sch.prog = sch.prog || {};
  sch.prog.deeds = { wavesFaced: opts.faced || {} };
  sch.prog.tableSittingId = 1;
  Game.state.titans = {
    omens: (opts.titans && opts.titans.omens) || {},
    musters: {},
    slain: (opts.titans && opts.titans.slain) || {},
    cast: (opts.titans && opts.titans.cast) || null,
  };
  return { Game, vid };
}

(async () => {
  const { Game } = await quietLog(async () => loadGame({ seed: 7, mode: 'finalvoice-fixture' }));
  await quietLog(async () => setupGame(Game));

  console.log('== V1 devotion lane (4 keepsakes, resonance lane) ==');
  const DEVOTION_FULL = 'Your gifts are not mastered — but they are lived-in, and they are with you. The feast was the weapon.';
  const devLines = [];
  for (const [id, name] of ITEMS) {
    const { msg } = await quietLog(async () => channelAs(Game, id, name, 'devotion'));
    devLines.push(msg);
    ok(typeof msg === 'string' && msg.includes(name), `V1: devotion line holds ${name}`);
    ok(/Your gifts are not mastered — but they are lived-in/.test(msg || ''),
      `V1: devotion line for ${name} keeps the beat's core`);
    ok(/FEASTED/.test(msg || ''), `V1: devotion line for ${name} keeps the honest buff terms`);
  }
  const devJoined = devLines.join('\n');
  ok(new Set(devLines).size === 4, 'V1: four items -> four DISTINCT devotion lines',
    `${new Set(devLines).size} distinct`);
  const devFullCount = countSub(devJoined, DEVOTION_FULL);
  ok(devFullCount <= 1, `V1: full devotion sentence prints verbatim at most 1x (got ${devFullCount})`);
  // V1b CAP: a 5th arming (same item, new day) never repeats the canonical
  // line — the cap holds past the first rotation, not just across 4 items.
  {
    Game.state.scholar.day = (Game.state.scholar.day || 0) + 1;
    const { msg: fifth } = await quietLog(async () => channelAs(Game, 'tin_cup', "Grandma's Tin Cup", 'devotion'));
    ok(!String(fifth).includes(DEVOTION_FULL), 'V1b: 5th devotion arming never repeats the canonical line');
    ok(/Your gifts are not mastered — but they are lived-in/.test(fifth || ''),
      'V1b: 5th devotion arming still keeps the beat\'s core');
    console.log('  V1b 5th line: ' + String(fifth).slice(0, 500));
  }
  console.log('  V1 lines:');
  for (const l of devLines) console.log('    ' + String(l).slice(0, 500));

  console.log('== V2 mastery lane (4 keepsakes, 3-mastered lane) ==');
  const MASTERY_FULL = 'The feast was the weapon — and they are with you.';
  const masLines = [];
  for (const [id, name] of ITEMS) {
    const { msg } = await quietLog(async () => channelAs(Game, id, name, 'mastery'));
    masLines.push(msg);
    ok(typeof msg === 'string' && msg.includes(name), `V2: mastery line holds ${name}`);
    ok(/The feast was the weapon/.test(msg || ''), `V2: mastery line for ${name} keeps the payoff`);
  }
  const masJoined = masLines.join('\n');
  ok(new Set(masLines).size === 4, 'V2: four items -> four DISTINCT mastery lines',
    `${new Set(masLines).size} distinct`);
  const masFullCount = countSub(masJoined, MASTERY_FULL);
  ok(masFullCount <= 1, `V2: full mastery sentence prints verbatim at most 1x (got ${masFullCount})`);
  // V2b CAP: same, mastery lane.
  {
    Game.state.scholar.day = (Game.state.scholar.day || 0) + 1;
    const { msg: fifth } = await quietLog(async () => channelAs(Game, 'tin_cup', "Grandma's Tin Cup", 'mastery'));
    ok(!String(fifth).includes(MASTERY_FULL), 'V2b: 5th mastery arming never repeats the canonical line');
    ok(/The feast was the weapon/.test(fifth || ''), 'V2b: 5th mastery arming keeps the payoff');
    console.log('  V2b 5th line: ' + String(fifth).slice(0, 500));
  }
  console.log('  V2 lines:');
  for (const l of masLines) console.log('    ' + String(l).slice(0, 500));

  console.log('== V3 war path: bar-read silenced on a priced full seat ==');
  {
    const { Game: G } = await fixtureGame({
      kills: [
        { mid: 'congregation', day: 140, by: 'player', via: 'player' },
        { mid: 'strike', day: 152, by: 'AUTO', via: 'companion' },
      ],
      faced: { congregation: 4, audit: 4 },
      titans: { omens: { herald: { stage: 2, day: 120, warned: {} } }, slain: {}, cast: { herald: 'herald', apocalypse: 'finale' } },
      slainMids: ['congregation', 'strike'],
    });
    // Baseline: the fixture's wave-5 bar stands unready (same as F4).
    const recBare = G.tableDeedRecords();
    ok(recBare.bars.length > 0, 'V3: fixture carries an unready bar (baseline)', JSON.stringify(recBare.bars));
    // Full seat: war record voices, bar-read silent.
    const fullLines = G.tableDeedLines({ seat: 'full' });
    const fullJoined = fullLines.join(' ');
    ok(!/bar reads/.test(fullJoined), 'V3: full-seat audit carries NO bar-read line');
    ok(G.tableDeedRecords({ seat: 'full' }).bars.length === 0, 'V3: full-seat records carry no bars');
    ok(/THE WAR PATH/.test(fullJoined), 'V3: full-seat audit still voices the war path');
    ok(fullJoined.includes(G.monsterNoun('congregation')), 'V3: full-seat audit still names the kills');
    // Lesser seat: the bar-read still speaks (the village still owes).
    const lesserJoined = G.tableDeedLines({ seat: 'lesser' }).join(' ');
    ok(/wave-5 bar reads/.test(lesserJoined), 'V3: lesser-seat audit still voices the wave-5 bar');
    ok(G.tableDeedRecords({ seat: 'lesser' }).bars.length > 0, 'V3: lesser-seat records keep the bars');
    // Bare call: legacy voicing preserved (no seat passed, no silence).
    const bareJoined = G.tableDeedLines().join(' ');
    ok(/bar reads/.test(bareJoined), 'V3: bare call keeps the legacy bar voicing');
    console.log('  V3 full-seat lines:');
    for (const l of fullLines) console.log('    ' + String(l).slice(0, 240));
    console.log('  V3 lesser-seat bar bit: ' + (lesserJoined.match(/Even now the wave-5 bar reads[^.]*\./) || ['(none)'])[0]);
  }

  console.log('== V4 purity: full-seat call writes nothing ==');
  {
    const { Game: G } = await fixtureGame({
      kills: [{ mid: 'congregation', day: 140, by: 'player', via: 'player' }],
      faced: { congregation: 4 },
      slainMids: ['congregation'],
    });
    const before = JSON.stringify(G.state);
    G.tableDeedLines({ seat: 'full' });
    const after = JSON.stringify(G.state);
    ok(before === after, 'V4: zero state writes on the full-seat call (state JSON byte-identical)');
    const before2 = JSON.stringify(G.state);
    G.tableDeedRecords({ seat: 'full' });
    ok(before2 === JSON.stringify(G.state), 'V4: zero state writes on the full-seat records call');
  }

  console.log(fails ? `\nRESULT: ${fails} FAILURE(S)` : '\nRESULT: ALL GATES GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
