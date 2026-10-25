#!/usr/bin/env node
// test-social-others-reoffer.js -- PROOF for journey-social r51 (lane B).
//
// The bug (r50): the 'others' subject is ONE-SHOT per villager. The subject
// menu offers only fresh topics, and 'others' counts as discussed forever
// after its first telling — even though the read itself is dynamic (deepest
// bond, newest grievance), so later servings would say something NEW.
// The fix (convoTopics.js t2otherServed + t2othersChanged + t2topicFresh;
// conversation.js t2fresh/t2discussed split): a spent 'others' counts fresh
// again when its pick CHANGES (new person or new why, never 'neutral').
//
// Before/after in one file: cases B and D fail on the old code (the menu
// never re-offers), cases A/C/D-pass on the fixed code. Run:
//   node scripts/test-social-others-reoffer.js   (exit 1 = bug present)
// Also pins r50's matcher root cause: the real grievance serve line is
// "I still haven't forgiven ..." — r50's matcher knew only "hasn't
// forgiven", so it matched nothing. The new matcher must hit it and the
// old one must miss it, on the REAL served line (case C).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const OLD_MATCHER = /hasn't forgiven|won't forgive|still hasn't|not.*forgiven/i;
const NEW_MATCHER = /haven'?t forgiven|hasn'?t forgiven|still hasn'?t forgiven|won'?t forgive|not.*forgiven/i;

let fail = 0;
function check(name, cond, extra) {
  if (cond) console.log(`  PASS ${name}`);
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  const { Game } = await loadGame({ seed: 4701, mode: 'journey-social-r51-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const me = Game.villagerId;
  const living = (v.roster || []).filter(id => {
    if (id === me) return false;
    try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
    return true;
  });
  if (living.length < 4) { console.log('FAIL setup: fewer than 4 living villagers'); process.exit(2); }
  // Trust 24, deliberately: 'others' needs 20 (passes, with margin for
  // small convo turn costs), while 'you' (30) and 'fears' (25) stay gated
  // OUT. That makes 'others' the FIRST fresh topic in defs order — so the
  // subject menu's freshCap (1-2 slots) must include it on the first
  // sitting, without queue-working. (With trust 30+, 'you' + 'fears' fill
  // both fresh slots and 'others' only surfaces after they are discussed —
  // the queue-order artifact behind r50's 2.7% offer rate, not this fix's
  // target. This fix is about SPENT 'others', not fresh ordering.)
  v.trust = v.trust || {};
  for (const id of (v.roster || [])) v.trust[id] = 24;

  // Record every t2pickOther SERVING (menu-check calls, marked by the
  // r51 fix, are not servings and must not be recorded — the marker
  // contract the fix introduces for all t2pickOther instrumentation).
  const picks = [];
  const origPick = Game.t2pickOther;
  if (typeof origPick !== 'function') { console.log('FAIL setup: Game.t2pickOther missing'); process.exit(2); }
  Game.t2pickOther = function (vid, opts) {
    const r = origPick.apply(this, arguments);
    if (opts && opts.menuCheck) return r;
    if (r && r.id) picks.push({ vid: String(vid), id: String(r.id), why: r.why || '?' });
    return r;
  };
  const lastPickFor = (vid) => { for (let i = picks.length - 1; i >= 0; i--) if (picks[i].vid === String(vid)) return picks[i]; return null; };

  const endConvo = (vid) => { try { if (typeof Game.endConvo === 'function') Game.endConvo(vid, 'left'); } catch (e) {} };
  const isLeave = (id) => /^(leave|bye|goodbye)/.test(String(id || ''));

  // Trust pin: convo turns drift trust, and trust drift changes which
  // topics are gated — at trust >= 25, 'fears' gates in and, for deflector
  // speakers (freshCap 1), takes the single fresh slot ahead of 'others'
  // in defs order. Pinning trust to 22 for the whole walk holds the gates
  // this proof controls: 'others' (20) in, 'fears' (25) and 'you' (30) out.
  // (Test control only — the game never pins trust.)
  const pinTrust = (vid) => { try { ((Game.state.village || {}).trust || {})[vid] = 22; } catch (e) {} };

  // Subject-menu navigation: drive to choosingSubject WITHOUT consuming
  // any t2 topic (a main-menu ask:others would mark it said before the
  // subject menu is ever reached), then page through every subject page
  // (menu:more cycles, so visit each page at most once). Returns true iff
  // ask:others is offered on any subject page, false iff the full menu was
  // walked and it never appeared, null iff the menu was never reached.
  function subjectOffersOthers(vid) {
    for (let sitting = 0; sitting < 3; sitting++) {
      endConvo(vid);
      pinTrust(vid);
      try { Game.startConvo(vid); } catch (e) { return null; }
      let pagesSeen = 0;
      for (let t = 0; t < 14; t++) {
        let c = null; try { c = Game.convoGet(vid); } catch (e) {}
        if (!c || !c.active) break;
        let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
        if (!choices.length) break;
        if (c.choosingSubject) {
          if (choices.some(x => String(x.id || '') === 'ask:others')) { endConvo(vid); return true; }
          const pages = (c.menuPages || 1);
          const more = choices.find(x => String(x.id || '') === 'menu:more' || String(x.id || '') === 'more');
          if (more && pagesSeen + 1 < pages) { pagesSeen++; pinTrust(vid); try { Game.convoTurn(vid, more.id); } catch (e) { break; } continue; }
          endConvo(vid);
          return false;
        }
        const subj = choices.find(x => /^(dlg:)?subject$/.test(String(x.id || '')));
        if (subj) { pinTrust(vid); try { Game.convoTurn(vid, subj.id); } catch (e) { break; } continue; }
        // Never consume a t2 ask on the way in — only thread asks / reacts.
        const next = choices.find(x => !isLeave(x.id) && !/^ask:(lately|you|fears|others|neighbors|advice|oldworld|skills|systemtake|loved)$/.test(String(x.id || ''))) || choices[0];
        pinTrust(vid); try { Game.convoTurn(vid, next.id); } catch (e) { break; }
      }
      endConvo(vid);
    }
    return null;
  }

  // Serve 'others' once from the subject menu; return the served pick + lines.
  function serveOthers(vid) {
    endConvo(vid);
    pinTrust(vid);
    try { Game.startConvo(vid); } catch (e) { return null; }
    let pagesSeen = 0;
    for (let t = 0; t < 14; t++) {
      let c = null; try { c = Game.convoGet(vid); } catch (e) {}
      if (!c || !c.active) return null;
      let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
      if (!choices.length) return null;
      if (c.choosingSubject) {
        const o = choices.find(x => String(x.id || '') === 'ask:others');
        if (o) {
          const before = ((Game.convoGet(vid) || {}).transcript || []).length;
          pinTrust(vid); try { Game.convoTurn(vid, o.id); } catch (e) { return null; }
          const tr = ((Game.convoGet(vid) || {}).transcript || []).slice(before);
          endConvo(vid);
          return { pick: lastPickFor(vid), lines: tr.map(e => String((e && (e.text || e.line)) || '')) };
        }
        const pages = (c.menuPages || 1);
        const more = choices.find(x => String(x.id || '') === 'menu:more' || String(x.id || '') === 'more');
        if (more && pagesSeen + 1 < pages) { pagesSeen++; pinTrust(vid); try { Game.convoTurn(vid, more.id); } catch (e) { return null; } continue; }
        endConvo(vid);
        return null;
      }
      const subj = choices.find(x => /^(dlg:)?subject$/.test(String(x.id || '')));
      if (subj) { pinTrust(vid); try { Game.convoTurn(vid, subj.id); } catch (e) { return null; } continue; }
      const next = choices.find(x => !isLeave(x.id) && !/^ask:(lately|you|fears|others|neighbors|advice|oldworld|skills|systemtake|loved)$/.test(String(x.id || ''))) || choices[0];
      pinTrust(vid); try { Game.convoTurn(vid, next.id); } catch (e) { return null; }
    }
    endConvo(vid);
    return null;
  }

  // Speaker: any living villager. Temperament is irrelevant here: at
  // trust 24, 'others' is the first fresh topic, so every freshCap (1 or 2)
  // includes it — no queue-working, no temperament dependence.
  const temperOf = (id) => { try { return typeof Game.npcTemper === 'function' ? Game.npcTemper(id) : '?'; } catch (e) { return '?'; } };
  const speaker = living[0];
  const rest = living.filter(id => id !== speaker);
  const targetA = rest[0];
  const targetB = rest[1];
  console.log(`speaker temper=${temperOf(speaker)}`);
  console.log(`speaker=${speaker} targetA=${targetA} targetB=${targetB}`);

  // A: fresh 'others' is offered.
  const freshOffer = subjectOffersOthers(speaker);
  check('A fresh others offered', freshOffer === true, 'menu=' + freshOffer);
  // Serve it once (records t2otherServed).
  const first = serveOthers(speaker);
  check('A serve succeeds', !!first && !!first.pick, JSON.stringify(first && first.pick));
  console.log(`  first served pick: ${first ? first.pick.id + '/' + first.pick.why : 'none'}`);

  // B: unchanged pick is NOT re-offered (the old one-shot behavior, kept).
  const unchangedOffer = subjectOffersOthers(speaker);
  check('B unchanged pick not re-offered', unchangedOffer === false, 'menu=' + unchangedOffer);

  // C: changed pick (grievance recorded) IS re-offered, and serves the
  // grievance read — the exact r50 failure mode (spent 'others' + fresh
  // grievance = no serve) now fixed.
  try { Game.recordGrievance(speaker, targetA, 'ambushed', 60); } catch (e) { console.log('  recordGrievance threw: ' + e.message); }
  // Marker contract: menu builds (which call t2pickOther with menuCheck)
  // must not record servings — picks[] grows only on real servings.
  const picksBeforeMenu = picks.length;
  const changedOffer = subjectOffersOthers(speaker);
  check('C menu checks are not recorded as servings', picks.length === picksBeforeMenu,
    `picks ${picksBeforeMenu} -> ${picks.length}`);
  check('C changed pick re-offered', changedOffer === true, 'menu=' + changedOffer);
  const served = serveOthers(speaker);
  check('C serve succeeds after change', !!served && !!served.pick, 'no serve');
  if (served && served.pick) {
    check('C served pick is the grievance', served.pick.why === 'vgrievance' && served.pick.id === String(targetA),
      'pick=' + served.pick.id + '/' + served.pick.why);
    const line = served.lines.join(' ');
    console.log(`  grievance serve line: ${line.slice(0, 200)}`);
    check('C new matcher hits real serve line', NEW_MATCHER.test(line), 'line=' + line.slice(0, 120));
    check('C old matcher misses real serve line (r50 root cause)', !OLD_MATCHER.test(line), 'old matcher unexpectedly hit');
  }

  // D: re-offer is repeatable — a second change re-offers again. The
  // change here is an unresolved CONFLICT (which outranks vgrievance in
  // t2pickOther), not a second same-day grievance: the vgrievance branch
  // sorts by day, so two grievances recorded on the same test day do NOT
  // reorder the pick (day-granular sort — game behavior, not a bug, and
  // not this fix's target; noted in the r51 run note).
  try {
    const vv = Game.state.village || {};
    vv.conflicts = vv.conflicts || [];
    vv.conflicts.push({ a: speaker, b: targetB, resolved: false, history: ['old history'] });
  } catch (e) {}
  const secondOffer = subjectOffersOthers(speaker);
  check('D second change re-offered again', secondOffer === true, 'menu=' + secondOffer);
  const served2 = serveOthers(speaker);
  check('D second serve is the new conflict grievance', !!served2 && served2.pick && served2.pick.why === 'grievance' && served2.pick.id === String(targetB),
    'pick=' + JSON.stringify(served2 && served2.pick));

  console.log(fail ? `\n${fail} check(s) FAILED — re-offer bug present` : '\nALL PASS: others re-offer works (fresh / unchanged-hidden / changed-shown / repeatable)');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS CRASH:', e && e.stack || e); process.exit(2); });
