#!/usr/bin/env node
// test-journey-social-r132-escaped-expired.js — FIXTURE for journey-social
// r132 (Lane B), measuring the two dark-channel kinds r125 could not:
//   (A) ESCAPED SPRING surfacing (M2c): simNpcAmbush rolls escaped 55%,
//       but r125's wild panel produced 0 escaped springs, so the
//       case-channel surfacing of an escaped spring was never measured.
//       Here: hunt an escaped outcome, then run caseDiscoveryTick on
//       the case's playerHeardDay and assert the player learns of it.
//   (B) EXPIRED PLOT trace (M2x): npcPlotTick expires plots older than
//       4 days with no line, gossip, grievance, journal, or case (code
//       reading, r120/r125). Here: force an expiry and count every
//       trace, so r132's judgment rule (prereg) can rule on silence
//       with a measurement instead of a code reading.
// Usage: node scripts/test-journey-social-r132-escaped-expired.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

(async () => {
  const { Game } = await loadGame({ seed: 132001, mode: 'test-social-r132' });
  await setupGame(Game);
  const sayLines = [];
  Game.say = (t) => { sayLines.push(String(t || '')); };
  Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [leader, target] = vids;
  let lname = Game.displayName(leader), tname = Game.displayName(target);

  // ---- (A) escaped spring ----
  // Hunt: 55% escaped per roll, but a killed roll removes that target,
  // so re-pick a living pair after a kill instead of stopping (r132
  // first attempt stopped at tries=0 on exactly that roll).
  let escPlot = null, escRes = null, tries = 0;
  let curLeader = leader, curTarget = target;
  for (; tries < 40; tries++) {
    const aliveNow = Game.state.village.roster.filter(id => id !== Game.villagerId);
    if (aliveNow.length < 2) break;
    if (!aliveNow.includes(curTarget) || !aliveNow.includes(curLeader)) {
      curLeader = aliveNow[0]; curTarget = aliveNow[1];
    }
    const plot = Game.armPlot(curLeader, [], curTarget, { reasons: ['grievance'], score: 60 });
    const r = Game.simNpcAmbush(plot);
    if (r && r.outcome === 'escaped') { escPlot = plot; escRes = r; break; }
    // hurt: same pair re-arms; killed: next iteration re-picks a living pair.
  }
  ok(!!escPlot, 'an escaped ambush outcome occurred within 40 tries', 'tries=' + tries);
  if (escPlot) {
    // The hunt may have re-picked the pair after a kill; name the actual pair.
    lname = Game.displayName(escPlot.leader); tname = Game.displayName(escPlot.target);
    const bs = Game.betrayalState();
    const cs = (bs.cases || []).find(c => c.plotId === escPlot.id);
    ok(!!cs, 'escaped spring opens a case', 'caseId=' + (escRes && escRes.caseId));
    ok(!!cs && cs.charge === 'ambush', 'escaped-spring case charge is ambush, not murder', cs ? cs.charge : 'no case');
    ok(!!cs && cs.playerHeardDay != null, 'case carries a playerHeardDay', cs ? String(cs.playerHeardDay) : 'no case');
    ok(!!cs && !cs.knownToPlayer, 'case NOT known to player at spring time', cs ? String(cs.knownToPlayer) : 'no case');
    ok(Game.state.village.roster.includes(escPlot.target), 'escaped target stays on the roster', '');
    if (cs && cs.playerHeardDay != null) {
      const before = sayLines.length;
      Game.state.scholar.day = cs.playerHeardDay;
      Game.caseDiscoveryTick();
      const fresh = sayLines.slice(before);
      ok(cs.knownToPlayer === true, 'caseDiscoveryTick marks escaped case knownToPlayer', String(cs.knownToPlayer));
      ok(cs.playerRole === 'juror', 'escaped case playerRole becomes juror', String(cs.playerRole));
      // The line names the accused through whoTag (knowledge-gated:
      // an unmet villager reads as "the person in their 40s", not by
      // displayName), so assert the surfacing content, not the name
      // form; the journal assertion below proves the accused identity.
      ok(fresh.some(l => /stands accused/.test(l) && /moot/.test(l)), 'discovery line surfaces the case (stands accused + moot)', JSON.stringify(fresh.slice(-2)));
      const notes = ((Game.state.codex || {}).notes || []);
      ok(notes.some(n => n.cat === 'village' && n.key === 'trial' && String(n.text || '').includes(lname)),
        'journal note records the escaped-spring case', JSON.stringify(notes.slice(-2)));
    }
  }

  // ---- (B) expired plot ----
  // Fresh pair if the escaped target died meanwhile (it cannot — escaped
  // leaves the target alive — but guard anyway).
  const alive = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [l2, t2] = alive.length >= 2 ? [alive[0], alive[1]] : [leader, target];
  const l2name = Game.displayName(l2), t2name = Game.displayName(t2);
  const plot2 = Game.armPlot(l2, [], t2, { reasons: ['grievance'], score: 60 });
  const inviter2 = plot2.inviter;
  const grievBefore = (() => { try { return Game.grievanceBetween(l2, t2); } catch (e) { return null; } })();
  const casesBefore = (Game.betrayalState().cases || []).length;
  // Force age past the 4-day expiry (plot.day backdated; no RNG involved).
  plot2.day = (Game.state.scholar.day || 0) - 6;
  const linesBefore = sayLines.length;
  Game.npcPlotTick();
  const freshLines = sayLines.slice(linesBefore);
  ok(plot2.expired === true && plot2.active === false && plot2.resolved === true,
    'backdated plot expires via npcPlotTick', JSON.stringify({ expired: plot2.expired, active: plot2.active, resolved: plot2.resolved }));
  let pending = null;
  try { const h = Game.inviteHistory(inviter2); pending = h ? h.pending : null; } catch (e) {}
  ok(!pending || pending.plotId !== plot2.id, 'expired plot clears the pending lure', JSON.stringify(pending));
  const casesAfter = (Game.betrayalState().cases || []).filter(c => c.plotId === plot2.id);
  ok(casesAfter.length === 0, 'expired plot opens no case', 'found=' + casesAfter.length);
  const grievAfter = (() => { try { return Game.grievanceBetween(l2, t2); } catch (e) { return null; } })();
  ok(grievAfter === grievBefore, 'expiry creates no grievance between the pair', grievBefore + '->' + grievAfter);
  ok((Game.betrayalState().cases || []).length === casesBefore, 'expiry adds no cases at all', casesBefore + '->' + (Game.betrayalState().cases || []).length);
  const naming = freshLines.filter(l => l.includes(l2name) || l.includes(t2name));
  console.log('  INFO expired-plot say lines naming the pair after expiry: ' + naming.length);
  const activeLeft = (Game.betrayalState().plots || []).filter(p => p.active).length;
  ok(activeLeft === 0, 'expiry frees the single-plot slot (no active plots left)', 'active=' + activeLeft);
  ok(Game.state.village.roster.includes(t2) && Game.state.village.roster.includes(l2),
    'expiry harms nobody: leader and target both still on the roster', '');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR', e); process.exit(1); });
