// test-journey-deepening-r55-invitebeat-20261027.js -- MINI-PROBE for the r55
// people-check wart: two panel transcripts (42001-d60 Ingrid, 42003-d45 Nathan)
// open with a non-invitation line yet offer ONLY betrayal:accept/decline.
// Hypothesis: the invitation IS spoken (the SPOKEN LURE second beat) into the
// full transcript, but the panel driver prints only startConvo's returned line
// at open — a driver gap, not a game gap. This probe plants a pending invite
// (betrayalState invites fixture, a real INVITE_DEFS id) and compares, at open:
// the returned line, every THEM entry in the full transcript, and the offered set.
// Exit 0 when the comparison is complete and printed (diagnostic, not a gate).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r55-invitebeat-probe', fullTelemetry: true });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  let vid = null, r0 = null;
  for (const id of roster) {
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
      // Plant the pending invite BEFORE opening, so the lure path runs.
      const bs = Game.betrayalState();
      bs.invites = bs.invites || {};
      bs.invites[id] = { pending: { defId: 'air', day: Game.state.scholar.day || 0 } };
      const r = Game.startConvo(id);
      if (!r || !r.line) { try { Game.endConvo(id, 'done'); } catch (e) {} continue; }
      vid = id; r0 = r; break;
    } catch (e) { try { Game.endConvo(id, 'done'); } catch (e2) {} }
  }
  if (!vid) { console.log('PROBE-INCONCLUSIVE: no talkable villager'); process.exit(1); }
  const c = Game.convoGet(vid);
  const them = (c.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
  let choices = [];
  try { choices = Game.convoChoices(vid) || []; } catch (e) {}
  console.log(`villager=${Game.displayName(vid)} thread=${c.thread || '?'} want=${(c.want && c.want.id) || 'none'} stage=${(c.want && c.want.stage) || 0}`);
  console.log(`returned line (r0.line): ${JSON.stringify(r0.line)}`);
  console.log(`full-transcript THEM entries at open (${them.length}):`);
  them.forEach((t, i) => console.log(`  [${i}] ${t}`));
  console.log(`offered=[${choices.map(x => x && x.id).filter(Boolean).join(',')}]`);
  console.log(`spokenBeat=${JSON.stringify(c.spokenBeat || null)} invitePending=${JSON.stringify(c.invitePending || null)}`);
  console.log(`DRIVER-GAP-VERDICT: ${them.length > 1 ? 'YES — transcript holds more THEM beats than r0.line; the driver transcript hides the lure beat' : 'NO — r0.line is the whole opening'}`);
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  console.log('PROBE-COMPLETE');
})().catch(e => { console.log('PROBE-ERROR: ' + (e && e.stack || e)); process.exit(1); });
