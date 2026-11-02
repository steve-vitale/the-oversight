// probe-recap-favor-vs-need.js — r108 Q2 (Tom-recap probe, prereg). v2:
// v1 failed with NO-DATA: a fresh day-2 village has no favor needs, so no
// villager asked any favor in 12 conversations. v2 creates the need first
// (probe state writes, all reported): hurt V (health 50) so a heal_help
// favor ask fires in a real conversation, left unfulfilled; then hunger 90
// so the live scan moves to food_share while the heal favor stays live
// (convoFavorNeedLive: health < 80). A NEW conversation's opener is then
// either the follow-up naming the OLD favor (mismatch case, Tom's shape)
// or a fresh food_share ask (no mismatch — recap naming food is correct).
// Verdict BUG requires: follow-up opener (want.fromSeed + seedFavorId
// matching the ledger favor) AND recap naming food share while the heal
// favor is still live. Anything else is CLOSED / NO-DATA / UNDECIDED with
// the exact reason. Throwaway seed only. Writes
// evidence/2026-11-02/journey-succession-r108-recap-probe.json.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.PROBE_SEED || '39998', 10);
const EVID = path.join(ROOT, 'evidence', '2026-11-02');

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  try { return (Game.state.village.roster || []).filter(id => ((Game.state.village.health || {})[id] ?? 100) > 0); } catch (e) { return []; }
}
function transcript(Game, vid) {
  try { return ((Game.convoGet(vid) || {}).transcript || []).map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 300)}`); } catch (e) { return ['(transcript read failed: ' + e.message + ')']; }
}
function favorOf(Game, vid) {
  try { return (((Game.state.village || {}).favorLedger || {})[vid]) || null; } catch (e) { return null; }
}
function wantOf(Game, vid) {
  try { const c = Game.convoGet(vid) || {}; return c.want || null; } catch (e) { return null; }
}
// Drive a convo until stopFn is true (checked before each pick) or turns out.
// Returns transcript lines + whether stopFn fired.
function driveUntil(Game, vid, stopFn, maxTurns, preferRecap) {
  const r = Game.startConvo(vid);
  if (r && (r.refused || r.ended)) return { refused: true, transcript: [], stopped: false };
  const c0 = Game.convoGet(vid);
  if (!c0 || !c0.active) return { refused: true, transcript: [], stopped: false };
  let stopped = false;
  for (let t = 0; t < (maxTurns || 10); t++) {
    if (stopFn(Game, vid)) { stopped = true; break; }
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) break;
    let pick = null;
    if (preferRecap) pick = choices.find(x => x.id === 'recap');
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:details|dlg:subject)$/.test(x.id));
    if (!pick) pick = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id));
    if (!pick) break;
    try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) break;
  }
  if (!stopped && stopFn(Game, vid)) stopped = true;
  const tx = transcript(Game, vid);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { refused: false, transcript: tx, stopped };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'recap-probe-r108', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, competent, { days: 2 });
  const out = { seed: SEED, phase1: [], phase2: null, phase3: [], verdict: 'NO-DATA', reason: '' };
  const v = Game.state.village;
  v.health = v.health || {};

  // PHASE 1: hurt villagers one at a time until a heal_help favor is asked
  // (and persists after the conversation ends unfulfilled).
  let V = null;
  const roster = livingRoster(Game);
  for (const vid of roster.slice(0, 6)) {
    v.health[vid] = 50; // probe state write: hurt, so the scan says heal_help
    const d = driveUntil(Game, vid, (G, x) => {
      const f = favorOf(G, x);
      return !!(f && (f.state === 'asked' || f.state === 'promised'));
    }, 10, false);
    const after = favorOf(Game, vid);
    out.phase1.push({ villager: firstName(rawName(Game, vid)), askedInConvo: d.stopped, afterEnd: after ? { kind: after.kind, state: after.state } : null, opener: (d.transcript[0] || '').slice(0, 200) });
    if (after && after.kind === 'heal_help' && (after.state === 'asked' || after.state === 'promised')) { V = vid; break; }
    // Not the ask we need: restore health so this villager's needs are clean.
    v.health[vid] = 100;
  }
  if (!V) {
    out.verdict = 'NO-DATA';
    out.reason = 'no villager asked a heal_help favor while hurt (phase-1 attempts: ' + out.phase1.length + ')';
    finish(out);
    return;
  }
  const favor = favorOf(Game, V);
  const favorId = favor && favor.id;

  // PHASE 2: hunger 90 moves the live scan to food_share; heal favor stays
  // live (health 50 < 80). Re-assert health (a day may have passed in phase 1
  // retries — none did, but be explicit).
  v.health[V] = 50;
  let scan = null, needLive = null;
  try { scan = Game.convoFindFavorNeed(V); } catch (e) { scan = { error: e.message }; }
  try { Game.npcNeeds(V).hunger = 90; } catch (e) {}
  try { scan = Game.convoFindFavorNeed(V); } catch (e) { scan = { error: e.message }; }
  try { needLive = Game.convoFavorNeedLive(favorOf(Game, V)); } catch (e) { needLive = 'error:' + e.message; }
  out.phase2 = { villager: firstName(rawName(Game, V)), health: 50, hunger: 90, favorKind: favor ? favor.kind : null, favorState: favor ? favor.state : null, favorId: favorId || null, liveScan: scan ? scan.kind : null, favorNeedLive: needLive };

  // PHASE 3: new convo(s) with V. Record opener want (follow-up vs fresh),
  // then take recap.
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = Game.startConvo(V);
    if (r && (r.refused || r.ended)) { out.phase3.push({ attempt, refused: true }); continue; }
    const c0 = Game.convoGet(V);
    if (!c0 || !c0.active) { out.phase3.push({ attempt, refused: true }); continue; }
    const w = wantOf(Game, V);
    const opener = transcript(Game, V).slice(0, 4);
    const wantInfo = w ? { id: w.id || null, fromSeed: !!w.fromSeed, seedFavorId: w.seedFavorId || null, favorIdMatches: !!(w.seedFavorId && favorId && w.seedFavorId === favorId) } : null;
    let recapLine = null;
    for (let t = 0; t < 12 && !recapLine; t++) {
      const choices = Game.convoChoices(V) || [];
      const recap = choices.find(x => x.id === 'recap');
      let pick = recap;
      if (!pick) pick = choices.find(x => /^want:/.test(x.id)) || choices.find(x => /^(dlg:details|dlg:subject)$/.test(x.id)) || choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id));
      if (!pick) break;
      const beforeN = transcript(Game, V).length;
      try { Game.convoTurn(V, pick.id); } catch (e) { break; }
      if (pick.id === 'recap') {
        const tx = transcript(Game, V);
        recapLine = tx.slice(beforeN).join(' | ').slice(0, 400);
      }
      const cc = Game.convoGet(V);
      if (!cc || !cc.active) break;
    }
    const favNow = favorOf(Game, V);
    out.phase3.push({ attempt, opener, wantInfo, recapLine, favorNow: favNow ? { kind: favNow.kind, state: favNow.state } : null });
    try { Game.endConvo(V, 'left'); } catch (e) {}
    if (recapLine) break;
  }

  const withRecap = out.phase3.find(a => a.recapLine);
  if (!withRecap) {
    out.verdict = 'NO-DATA';
    out.reason = 'no recap line obtained in phase-3 conversations';
  } else if (withRecap.wantInfo && withRecap.wantInfo.favorIdMatches && /food share/i.test(withRecap.recapLine) && out.phase2.favorNeedLive === true) {
    out.verdict = 'BUG';
    out.reason = 'follow-up opener names the old heal_help favor, but recap names food share (live scan) while the heal favor is still live';
  } else if (withRecap.wantInfo && withRecap.wantInfo.favorIdMatches && /wound care/i.test(withRecap.recapLine)) {
    out.verdict = 'CLOSED';
    out.reason = 'follow-up opener + recap both name the asked favor (wound care)';
  } else if (withRecap.wantInfo && !withRecap.wantInfo.favorIdMatches) {
    out.verdict = 'NO-DATA';
    out.reason = 'phase-3 opener was a fresh ask, not the follow-up (want.fromSeed mismatch) — the mismatch shape did not occur; recap=' + withRecap.recapLine;
  } else {
    out.verdict = 'UNDECIDED';
    out.reason = 'recap line: ' + withRecap.recapLine + '; wantInfo=' + JSON.stringify(withRecap.wantInfo);
  }
  finish(out);
}

function finish(out) {
  if (!fs.existsSync(EVID)) fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, 'journey-succession-r108-recap-probe.json'), JSON.stringify(out, null, 1));
  console.log('RECAP-PROBE verdict: ' + out.verdict + (out.reason ? ' — ' + out.reason : ''));
  console.log('phase1: ' + JSON.stringify(out.phase1));
  console.log('phase2: ' + JSON.stringify(out.phase2));
  for (const a of out.phase3) console.log('phase3 attempt ' + a.attempt + ': want=' + JSON.stringify(a.wantInfo) + ' recap=' + JSON.stringify(a.recapLine) + ' opener0=' + JSON.stringify((a.opener || [])[0] || null));
}

main().catch(e => { console.error('RECAP-PROBE FAILED: ' + (e && e.stack || e)); process.exit(1); });
