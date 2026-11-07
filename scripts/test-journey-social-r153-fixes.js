// test-journey-social-r153-fixes.js — proof test for the two r153 defects.
//
// DEFECT 1 (link/bond opener spoken twice): a staged link raise or bond
// proposal was spoken verbatim by the talk-request opener AND re-spoken as
// its beat, so the same sentence opened the transcript twice (9 wild
// occurrences for link raises). Fix: startConvo skips the re-speaking when
// the opener already carried the staged line, recording the beat so the
// exclusive bond:/link: menu still owns the reply.
//
// DEFECT 2 (dlg:more continuer collapse): the "Tell me more." / "Go on." /
// "I'm listening." continuer pool collapsed to pool[0] ("Tell me more.")
// across sittings — 9 in a row in one wild conversation — because
// convoPick dedupes by TEXT across ALL keys while convoPickCycle's reset
// trimmed only the current key. Fix: the reset frees the pool's variants
// from every key, keeping the last `keep` DISTINCT variants served under
// ANY key (saidKeyOrder, most-recent first) so the cycle never opens with
// an immediate repeat, even when the thread — and the key — changed.
//
// Run: node scripts/test-journey-social-r153-fixes.js  (exit 0 = PASS)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function normLine(t) {
  let s = String(t == null ? '' : t).trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  return s.trim();
}

(async () => {
  const { Game } = await loadGame({ seed: 42301, mode: 'test-r153-fixes', fullTelemetry: false, narration: false });
  await setupGame(Game);
  const village = Game.state.village || {};
  const roster = (village.roster || []).filter(v => v !== Game.villagerId);
  const trustOf = (vid) => ((village.trust || {})[vid]);
  const setTrust = (vid, v) => { try { ((Game.state.village || {}).trust || {})[vid] = v; } catch (e) {} };
  const treqs = () => ((Game.state.village || {}).talkRequests || {});

  // ---------- DEFECT 1: link raise ----------
  // Seed the stageLinkRaise guards: trust >= 20, build_standing weight >= 1,
  // villager personally knows the village via lore. A villager whose goal is
  // lead/prove/understand/belong carries build_standing >= 1.
  let linkVid = null;
  for (const v of roster) {
    let goal = null;
    try { goal = Game.npcGoal ? Game.npcGoal(v) : null; } catch (e) {}
    if (!goal) { try { goal = (((Game.state.village || {}).npcs || {})[v] || {}).goal || null; } catch (e) {} }
    if (goal && ['lead', 'prove', 'understand', 'belong'].indexOf(goal) !== -1) { linkVid = v; break; }
  }
  check('defect1: lead-goal villager found to stage a link raise', !!linkVid);
  if (linkVid) {
    setTrust(linkVid, 30);
    try { Game.recordVillageLore(linkVid, 'village_0', { how: 'rumor' }); } catch (e) {}
    const staged = Game.stageLinkRaise(linkVid, 'village_0');
    check('defect1: link raise stages', !!(staged && staged.line), 'stageLinkRaise returned ' + JSON.stringify(staged && staged.kind));
    if (staged && staged.line) {
      const core = normLine(staged.line).slice(0, 40);
      Game.startConvo(linkVid);
      const cc = Game.convoGet(linkVid);
      const themLines = (cc.transcript || []).filter(e => e.who === 'them').map(e => String(e.text || ''));
      const occ = themLines.filter(t => t.indexOf(core) !== -1).length;
      check('defect1: staged link line spoken exactly once at the opening', occ === 1, 'occurrences=' + occ + ' lines=' + JSON.stringify(themLines.slice(0, 3)));
      const menu = (Game.convoChoices(linkVid) || []).map(x => x.id);
      check('defect1: menu still owns link:accept', menu.indexOf('link:accept') !== -1, 'menu=' + JSON.stringify(menu));
      try { Game.endConvo(linkVid, 'left'); } catch (e) {}
    }
  }

  // ---------- DEFECT 1 (bond branch): period-only proposal line ----------
  // The authored bond pool's three lines ALL carry a "?" (mid-line or
  // trailing), and classifyQuestion matches a mid-line question — so every
  // staged bond opener sets a genericQ, the opener owns the reply, and the
  // beat is held instead of re-spoken. That is why the wild panel found 0
  // bond duplicates (structural, not luck). The bondBeat re-speaking path
  // only fires for a line with no "?" at all, so the proof injects one:
  // the same pending-request + talk-request records stageBondProposal
  // writes, with a period-only line. On unfixed code the opener carries it
  // and the beat re-speaks it (2 occurrences); on fixed code, 1.
  let bondVid = null;
  for (const v of roster) {
    if (v === linkVid) continue;
    if (treqs()[v] && !treqs()[v].delivered) continue;
    bondVid = v; break;
  }
  check('defect1-bond: a clean villager for the injected bond pending', !!bondVid);
  if (bondVid) {
    const customLine = '"I want us to stick together. Properly. Watch each other\'s backs."';
    const vv = Game.state.village;
    vv.bondRequests = vv.bondRequests || {};
    vv.bondRequests[bondVid] = { vid: bondVid, day: 1, kind: 'bond', line: customLine };
    vv.talkRequests = vv.talkRequests || {};
    vv.talkRequests[bondVid] = { line: '__NAME__: ' + customLine, day: 1, bondProposal: true };
    const coreB = normLine(customLine).slice(0, 40);
    Game.startConvo(bondVid);
    const ccB = Game.convoGet(bondVid);
    const themB = (ccB.transcript || []).filter(e => e.who === 'them').map(e => String(e.text || ''));
    const occB = themB.filter(t => t.indexOf(coreB) !== -1).length;
    check('defect1-bond: staged bond line spoken exactly once at the opening', occB === 1, 'occurrences=' + occB + ' lines=' + JSON.stringify(themB.slice(0, 3)));
    const menuB = (Game.convoChoices(bondVid) || []).map(x => x.id);
    check('defect1-bond: menu still owns bond:accept', menuB.indexOf('bond:accept') !== -1, 'menu=' + JSON.stringify(menuB));
    try { Game.endConvo(bondVid, 'left'); } catch (e) {}
  }
  // Guard: a normally staged bond proposal (its line carries "?") still
  // opens once with the bond menu owned — the path the wild panel exercised.
  let bondGuardVid = null;
  for (const v of roster) {
    if (v === linkVid || v === bondVid) continue;
    if (treqs()[v] && !treqs()[v].delivered) continue;
    setTrust(v, 30);
    try { if (Game.bondAdd) Game.bondAdd(v, Game.villagerId, 20, 'r153-test-seed'); } catch (e) {}
    try { const b = Game.bondGet && Game.bondGet(v, Game.villagerId); if (b) b.v = 20; } catch (e) {}
    let stagedB = null;
    try { stagedB = Game.stageBondProposal(v); } catch (e) {}
    if (stagedB && stagedB.line) { bondGuardVid = v; break; }
  }
  if (bondGuardVid) {
    Game.startConvo(bondGuardVid);
    const menuG = (Game.convoChoices(bondGuardVid) || []).map(x => x.id);
    check('defect1-bond-guard: staged bond proposal opens with bond menu owned', menuG.indexOf('bond:accept') !== -1, 'menu=' + JSON.stringify(menuG));
    try { Game.endConvo(bondGuardVid, 'left'); } catch (e) {}
  } else {
    console.log('NOTE defect1-bond-guard: no staged bond proposal available on this seed (guard skipped)');
  }

  // ---------- DEFECT 2: dlg:more cycle across sittings ----------
  // High trust opens goal threads; the subject menu routes to the goal topic.
  try { for (const v of roster) ((Game.state.village || {}).trust || {})[v] = 60; } catch (e) {}
  const vid2 = roster[1];
  const driveToGoalMore = () => {
    Game.startConvo(vid2);
    const presses = []; // { offered, transcript }
    for (let t = 0; t < 14 && presses.length < 4; t++) {
      const cc = Game.convoGet(vid2);
      if (!cc || !cc.active) break;
      const ch = Game.convoChoices(vid2) || [];
      const more = ch.find(x => x && x.id === 'dlg:more');
      const subj = ch.find(x => x && x.id === 'dlg:subject');
      const topicGoal = ch.find(x => x && /goal/i.test(String(x.id || '')));
      if (more) {
        const offered = more.label;
        Game.convoTurn(vid2, 'dlg:more');
        const youLines = (Game.convoGet(vid2).transcript || []).filter(e => e.who === 'you');
        const lastYou = youLines.length ? String(youLines[youLines.length - 1].text || '') : null;
        presses.push({ offered: offered, transcript: lastYou });
        continue;
      }
      if (topicGoal) { Game.convoTurn(vid2, topicGoal.id); continue; }
      if (subj) { Game.convoTurn(vid2, 'dlg:subject'); continue; }
      const pick = ch.find(x => x && /^gq:/.test(String(x.id || '')))
        || ch.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')))
        || ch.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) break;
      Game.convoTurn(vid2, pick.id);
    }
    try { Game.endConvo(vid2, 'left'); } catch (e) {}
    return presses;
  };
  const sittings = [];
  for (let s = 0; s < 4; s++) sittings.push(driveToGoalMore());
  const flat = sittings.flat();
  console.log('defect2: offered labels per sitting: ' + JSON.stringify(sittings.map(ss => ss.map(p => p.offered))));
  check('defect2: enough dlg:more presses to exercise the cycle', flat.length >= 6, 'presses=' + flat.length);
  const fidelityBad = flat.filter(p => p.offered !== p.transcript).length;
  check('defect2: every transcript YOU line equals the offered label', fidelityBad === 0, 'mismatches=' + fidelityBad + '/' + flat.length);
  let adjacentSame = 0;
  for (const ss of sittings) for (let i = 1; i < ss.length; i++) if (ss[i].offered === ss[i - 1].offered) adjacentSame++;
  check('defect2: no two consecutive identical offered labels within a sitting', adjacentSame === 0, 'adjacent repeats=' + adjacentSame);
  let runs3 = 0;
  for (let i = 0; i + 2 < flat.length; i++) if (flat[i].offered === flat[i + 1].offered && flat[i].offered === flat[i + 2].offered) runs3++;
  check('defect2: no 3-in-a-row identical offered labels (the collapse signature)', runs3 === 0, 'runs of 3=' + runs3);
  const distinct = new Set(flat.map(p => p.offered)).size;
  check('defect2: at least 2 distinct labels served (non-vacuous variety)', distinct >= 2, 'distinct=' + distinct);

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('test crashed: ' + (e && e.stack || e)); process.exit(2); });
