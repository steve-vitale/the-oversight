#!/usr/bin/env node
// Probe: does the "day's news re-asked across villagers" scenario actually
// produce all-blocked lately candidates? Loads a game, finds/creates a live
// mourning event, asks lately of 4 villagers in sequence, prints block state
// + what each NPC actually said. TOOLING ONLY.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

async function main() {
  const seed = parseInt(process.env.SEED || '1902', 10);
  const { Game } = await loadGame({ seed, mode: 'lately-probe', fullTelemetry: true });
  await setupGame(Game);
  // Kill two villagers to create a live mourning event.
  const roster = safe(() => Game.state.village.roster || [], []);
  const sid = safe(() => Game.villagerId, null);
  const victims = roster.filter(id => id !== sid).slice(0, 2);
  console.log('victims:', victims.map(id => { try { return Game.displayName(id); } catch (e) { return id; } }));
  for (const id of victims) {
    const nm = safe(() => Game.displayName(id), id);
    try { Game.registerDeath({ kind: 'villager', villagerId: id, name: nm, cause: 'probe injuries', killerId: null }); console.log('registered death for', nm); }
    catch (e) { console.log('registerDeath failed', e.message); }
  }
  console.log('grief now:', safe(() => (Game.state.village || {}).grief, 'n/a'));
  // Advance a day so the mourning event is live.
  try { Game.endDay ? await Game.endDay() : null; } catch (e) { console.log('endDay failed', e.message); }
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  console.log('day now:', day);
  const living = roster.filter(id => {
    if (id === sid || victims.includes(id)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  console.log('living candidates:', living.length);
  for (const vid of living.slice(0, 6)) {
    const name = safe(() => Game.displayName(vid), vid);
    const ev = safe(() => Game.t2LatelyEvent(vid), null);
    console.log(`\n=== ${name}: event kind = ${ev && ev.kind}`);
    // Block state BEFORE the ask.
    let cands = [];
    try { cands = Game.t2gen_lately(vid) || []; } catch (e) { console.log('gen failed', e.message); }
    const vp = safe(() => Game.vpOf(vid), {});
    const filled = cands.map(l => { try { return Game.t2fill(l, vp, vid); } catch (e) { return String(l); } });
    filled.forEach((f, i) => {
      const blocked = safe(() => Game.convoWouldBlock(vid, f), '?');
      console.log(`  cand[${i}] blocked=${blocked}: ${String(f).slice(0, 100)}`);
    });
    // Ask lately through the real menu.
    try { Game.startConvo(vid); } catch (e) { console.log('startConvo failed', e.message); continue; }
    // Get past the opener: opener turn -> dlg:subject -> topic menu.
    let choices = safe(() => Game.convoChoices(vid) || [], []);
    const opener = choices.find(x => x && /^(agree|silence|more)$/.test(String(x.id || ''))) || choices[0];
    if (opener) { try { Game.convoTurn(vid, opener.id); } catch (e) {} }
    choices = safe(() => Game.convoChoices(vid) || [], []);
    const subj = choices.find(x => x && String(x.id || '') === 'dlg:subject');
    if (subj) { try { Game.convoTurn(vid, subj.id); } catch (e) {} }
    choices = safe(() => Game.convoChoices(vid) || [], []);
    console.log('  menu ids:', choices.map(x => x && x.id).join(', '));
    const ask = choices.find(x => x && (String(x.id || '') === 'ask:lately' || String(x.id || '') === 'alive:event'));
    console.log('  menu has lately ask:', !!ask, ask ? `id=${ask.id}` : '');
    if (ask) {
      const before = safe(() => (Game.convoGet(vid).transcript || []).length, 0);
      try { Game.convoTurn(vid, ask.id); } catch (e) { console.log('convoTurn failed', e.message); }
      const tr = safe(() => Game.convoGet(vid).transcript || [], []);
      for (const e of tr.slice(before)) {
        if (e.who !== 'you') console.log(`  NPC: ${String(e.text || '').slice(0, 160)}`);
      }
    }
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  const rl = safe(() => Game.convoRunLedger() || [], []);
  console.log('\nrun ledger entries:', rl.length);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
