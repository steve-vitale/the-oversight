#!/usr/bin/env node
// PROBE (journey landing r8 2026-10-12): reproduce the silent-lure case.
// Fresh game, force a pending invite on a verbal villager, startConvo,
// check: (a) is the invite beat spoken as a second THEM beat?
//          (b) does the menu offer betrayal:accept/decline?
// Prints the mechanism when (a) is no and (b) is yes.
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

async function main() {
  const seed = parseInt(process.env.SEED || '222', 10);
  const rng = mulberry32(seed);
  Math.random = rng;
  const { loadFails, Game } = await loadGame({ seed });
  if (loadFails && loadFails.length) console.log('LOAD FAILS:', JSON.stringify(loadFails));
  Game.genDetail = function () { return {}; };
  await setupGame(Game);

  // find a verbal villager (comm level full)
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  let vid = null;
  for (const id of roster) {
    try {
      const lvl = (Game.commLevel(id) || {}).level;
      if (lvl === 'full') { vid = id; break; }
    } catch (e) {}
  }
  if (!vid) { console.log('NO VERBAL VILLAGER'); process.exit(2); }
  console.log('villager:', Game.displayName(vid), vid);

  // force a pending invite (same shape as npcInviteTick) — AGED 2 days, as in
  // the real run where npcInviteTick creates it days before the sitting
  const hist = Game.inviteHistory(vid);
  const defs = Game.INVITE_DEFS();
  hist.pending = { defId: defs[4].id, day: Game.state.scholar.day }; // 'traps'
  console.log('pending invite set:', JSON.stringify(hist.pending));
  // simulate days passing with the daily invite tick (expiry + re-issue)
  for (let d = 0; d < 2; d++) {
    Game.state.scholar.day++;
    try { Game.npcInviteTick(); } catch (e) { console.log('tick err', e.message); }
    console.log(`day ${Game.state.scholar.day}: pending=`, JSON.stringify(Game.pendingInvite(vid)));
  }

  // capture sayLine traffic
  const said = [];
  const _sayLine = Game.sayLine.bind(Game);
  Game.sayLine = function (v, line, opts) {
    said.push({ line: String(line).slice(0, 100), opts: opts ? Object.keys(opts) : [] });
    return _sayLine(v, line, opts);
  };

  const r0 = Game.startConvo(vid);
  console.log('\n--- sayLine calls during startConvo ---');
  for (const s of said) console.log(`  [${s.opts.join(',')}] ${s.line}`);
  console.log('\n--- opening menu betrayal choices ---');
  for (const ch of (r0.choices || [])) {
    if (/betrayal/.test(ch.id)) console.log(`  [${ch.id}] ${ch.label}`);
  }
  const invAfter = Game.pendingInvite(vid);
  console.log('\npending after startConvo:', JSON.stringify(invAfter));
  const beatSpoken = said.some(s => /Walk my trap line/.test(s.line));
  const menuOffers = (r0.choices || []).some(c => c.id === 'betrayal:accept');
  console.log(`\nRESULT: beatSpoken=${beatSpoken} menuOffers=${menuOffers}`);
  // ground truth: what the harness sees — transcript after endConvo
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  const c2 = Game.convoGet(vid);
  const themT = (c2.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
  console.log('\n--- transcript them-lines after endConvo ---');
  for (const t of themT) console.log('  THEM: ' + t.slice(0, 120));
  const inTranscript = themT.some(t => /Walk my trap line/.test(t));
  console.log(`\ninviteBeat in transcript: ${inTranscript}`);
  if (!beatSpoken && menuOffers) {
    console.log('REPRODUCED: silent lure — menu offers what the NPC never said');
    console.log('inv.spoken at check time was:', invAfter && invAfter.spoken);
  } else if (beatSpoken && menuOffers) {
    console.log('HEALTHY: beat spoken and menu offers');
  }
  process.exit(0);
}
main().catch(e => { console.error('PROBE ERROR:', e); process.exit(2); });
