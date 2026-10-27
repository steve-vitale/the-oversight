// test-journey-deepening-r55-invitebeat2-20261027.js -- SECOND MINI-PROBE for the
// r55 betrayal-menu wart. The first probe landed on the openerOwnsReply=true
// branch (want thread, stage 1): the lure was HELD in c.invitePending, never
// spoken, and no betrayal menu appeared. The wart branch needs
// openerOwnsReply=false at open (goal/request thread, stage 0) — the BG stage-0
// construction — where the lure IS sayLine'd as a transcript beat. This probe
// repeats the BG construction with a pending invite planted before every
// attempt, then compares at the achieved stage-0 sitting: r0.line vs every
// THEM entry in the full transcript vs the offered set.
// Exit 0 when the comparison is printed (diagnostic, not a gate).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r55-invitebeat2-probe', fullTelemetry: true });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const id of roster) {
    try { const n = Game.npcNeeds(id); if (n) n.hunger = 85; } catch (e) {}
  }
  let vid = null;
  for (const id of roster) {
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
      const r = Game.startConvo(id);
      if (!r || !r.line) { try { Game.endConvo(id, 'done'); } catch (e) {} continue; }
      const c = Game.convoGet(id);
      if (c && c.want && c.want.id === 'ask_favor') { vid = id; break; }
      try { Game.endConvo(id, 'done'); } catch (e) {}
    } catch (e) {}
  }
  if (!vid) { console.log('PROBE-INCONCLUSIVE: no ask_favor villager'); process.exit(1); }
  try { delete (Game.state.village.convoSeeds || {})[vid]; } catch (e) {}
  try {
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 100;
  } catch (e) {}
  const runLedger = () => { try { return Game.convoRunLedger ? Game.convoRunLedger() : []; } catch (e) { return []; } };
  const plantInvite = () => {
    try {
      const bs = Game.betrayalState();
      bs.invites = bs.invites || {};
      bs.invites[vid] = { pending: { defId: 'air', day: Game.state.scholar.day || 0 } };
    } catch (e) {}
  };
  let achieved = null;
  for (let attempt = 1; attempt <= 14; attempt++) {
    plantInvite();
    let r = null;
    try { r = Game.startConvo(vid); } catch (e) { try { Game.endConvo(vid, 'done'); } catch (e2) {} continue; }
    if (!r || !r.line) { try { Game.endConvo(vid, 'done'); } catch (e) {} continue; }
    const c = Game.convoGet(vid);
    const w = (c && c.want) || {};
    console.log(`attempt ${attempt}: want=${w.id || 'none'} stage=${w.stage || 0} thread=${c.thread || '?'} opener=${JSON.stringify(r.line)}`);
    if (w.id === 'ask_favor' && (w.stage || 0) === 0) { achieved = { r, c }; break; }
    try { runLedger().push(r.line); } catch (e) {}
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }
  if (!achieved) { console.log('PROBE-INCONCLUSIVE: no stage-0 sitting within 14 attempts'); process.exit(1); }
  const c = Game.convoGet(vid);
  const them = (c.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
  let choices = [];
  try { choices = Game.convoChoices(vid) || []; } catch (e) {}
  console.log(`villager=${Game.displayName(vid)} thread=${c.thread || '?'} want=${(c.want && c.want.id) || 'none'} stage=${(c.want && c.want.stage) || 0}`);
  console.log(`returned line (r0.line): ${JSON.stringify(achieved.r.line)}`);
  console.log(`full-transcript THEM entries at open (${them.length}):`);
  them.forEach((t, i) => console.log(`  [${i}] ${t}`));
  console.log(`offered=[${choices.map(x => x && x.id).filter(Boolean).join(',')}]`);
  console.log(`spokenBeat=${JSON.stringify(c.spokenBeat || null)} invitePending=${JSON.stringify(c.invitePending || null)}`);
  const lureInTranscript = them.some(t => /Come get air with me/.test(t));
  console.log(`DRIVER-GAP-VERDICT: lure spoken in transcript=${lureInTranscript} but absent from r0.line=${!String(achieved.r.line).includes('Come get air')} => ${lureInTranscript && !String(achieved.r.line).includes('Come get air') ? 'YES — driver transcript hides the invitation beat' : 'NO'}`);
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  console.log('PROBE-COMPLETE');
})().catch(e => { console.log('PROBE-ERROR: ' + (e && e.stack || e)); process.exit(1); });
