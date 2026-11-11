// titanfirst-analyze-20261111.js — titans + heralds first-numbers
// analyzer (arm sim-titanfirst-a, run fleshout-loop-20261111T1115Z).
//
// Pure functions over per-seed JSONs (evidence/2026-11-11/
// perseed-titanfirst-a/titanfirst-s<seed>-titanfirst-pilot-control.json):
//   classifySayLine(line) -> class | 'unclassified'
//   classifyStartCombat(ev, seed) -> 'refused' | 'fought' | 'dissolved' | 'unclassified'
//   classifyTbEnd(ev) -> 'ok' | 'unclassified'
//   classifyFieldFight(ev) -> 'ok' | 'unclassified'
//   classifyDawn(ev, seed) -> { cls: 'ok' | 'unclassified', kinds: [...], reasons: [...] }
//   classifyOutcome(rec) -> 'ok' | 'unclassified'
//   instanceKey(ev) / resolveInstance(seed, ev) — distinct-instance accounting
//   analyzeSeed(seedObj) -> per-seed tables + GO row counts
//   analyzeBand(seedObjs) -> band rollup + GO table + wall numbers
//   checkNeutrality(controlObjs, neutralObjs) -> 8/8 exact-match verdict
//
// Say-line classes (source for each — the line's home file):
//   omen0 'Scouts come back pale' (titans.js titanMaybeOmen)
//   omen1 '📻 ' + data omen1 (titans.json herald/nielsen/finale
//     omen1; the code fallback 'They name it: <title>' fires only
//     when the data text is absent) — matched on the 📻 prefix plus
//     a titan title, never on the fallback wording alone.
//   scout-map '🔭 <name> scouts the land: mapped N new areas'
//     (game.js:7593 — scouting, not a titan; caught by the 🔭
//     prefix, Amendment 1)
//   pellet-radio '📻 "Why do the small humans keep putting organic
//     matter in their FACE-HOLES? ... fusion pellet! ..."' (game.js
//     :25117 — alien pellet line; caught by the 📻 prefix, Am. 1)
//   herald-stirs 'You turn to leave — behind you, The Herald stirs.'
//     (game.js:12818 — the placed titan follows the scholar)
//   herald-here 'It followed you. The Herald is here.'
//     (game.js:12975 — the placed titan follows the scholar)
//   herald-treeline 'The Herald stops at the treeline/boundary —
//     pacing, unwilling.' (game.js:12939-12954 — the placed titan
//     pacing at Haven's edge; the vague form names the Herald at
//     the end of the line)
//   herald-pack 'One of them is bigger than the usual teeth at the
//     door — The Herald came with this raid' (havenGrowth.js:610 —
//     the placed titan joins a pantry raid)
//   raid-herald '🐗 RAID — N raiders (..., The Herald, ...) hit
//     Haven in the night' (raid roster line naming the titan)
//   raid-herald-unmet "Nobody met The Herald — it's still out there
//     at the treeline." (raid aftermath: the titan went unmet)
//   muster-scout '📯 MUSTER — scouts report <monster> hunting near
//     Haven, and it is beyond us.' (shelter.js:159 — the SHELTER
//     muster, a different muster from the titan coalition)
//   located 'Scouts found its lair' (titans.js titanPlace)
//   repair 'Scouts correct their map' (titans.js titanRepairPlacements)
//   strike-pantry 'fed in the night' (titans.js titanEscalate)
//   strike-trust 'struck ... in the night' (titans.js titanEscalate)
//   muster-hunger 'The muster is hungry' (titans.js titanMusterUpkeep)
//   refusal-gate 'does not notice you the way prey' (titans.js titanWrapCombat)
//   refusal-campaign 'THE HEART is not here yet' / 'THE HEART demands' (finale-campaign.js titanEntryGate)
//   council 'WAR COUNCIL' / 'The call, sounded now' / 'cannot answer while' /
//     'No one sits with you' / '(trust N, ...). Scouts:' / 'Scouts report:' (titans.js titanWarCouncil)
//   call-out 'THE CALL GOES OUT' (titans.js soundTitanCall)
//   call-refusal 'REFUSES. ... (trust -8' (titans.js soundTitanCall)
//   call-answer 'answers! ... will march' (titans.js soundTitanCall)
//   call-already 'volunteers already march' (titans.js soundTitanCall)
//   call-thin 'has no free fighters to send' (titans.js soundTitanCall)
//   call-quota 'Closer bonds with ... could bring more volunteers' (titans.js soundTitanCall)
//   no-target 'There is nothing located to march against' (titans.js soundTitanCall / titanCommitOwn)
//   commit-slain 'It is already dead' (titans.js titanCommitOwn)
//   commit-network-closed 'No new blades join the Network march' (titans.js titanCommitOwn)
//   commit-full "Haven's blades already march" (titans.js titanCommitOwn)
//   commit-none-free 'No one is free to march' (titans.js titanCommitOwn)
//   commit-confirm 'steps forward. ... march with the muster' (titans.js titanCommitOwn, two-tap first)
//   commit-done 'Haven commits its own:' (titans.js titanCommitOwn)
//   standdown 'THE MUSTER BREAKS' (titans.js titanStandDown)
//   standdown-none 'No muster stands against' (titans.js titanStandDown)
//   turn 'THE TURN' (titans.js titanTurn)
//   victory 'FALLS. The realm exhales' (titans.js titanVictory)
//   victory-aftermath 'The coalition walks home' (titans.js titanVictory)
//   relic 'RELIC —' (titans.js titanGrantRelic)
//   victory-no-relic 'leaves nothing but quiet' (titans.js titanVictory)
//   defeat 'remains. The coalition breaks and runs' (titans.js titanResolveFight)
//   fight-death 'did not get up' / 'their speaker — fell' / 'The fire is quieter tonight' (titans.js titanResolveFight)
//   inject-allies 'allies join you on the field' (titans.js titanInjectAllies)
//   campaign-muster 'The node holds. The coalition falls back' (finale-campaign.js:405)
//   other-system "The big ones don't haggle. ... (Buy Passage: not titans)" (godverbs.js:309)
// sysSay lines (ODDS, UNBELIEVABLE) are NOT in the corpus by design:
// the instrument wraps Game.say only, never sysSay.
//
// Usage:
//   node scripts/titanfirst-analyze-20261111.js <per-seed-dir> [neutral-dir]
//   (writes titanfirst-summary-titanfirst-pilot.json next to the dir's
//   evidence parent; also require()able for the proof test.)
'use strict';
const fs = require('fs');
const path = require('path');

function classifySayLine(line) {
  if (typeof line !== 'string') return 'unclassified';
  if (/Scouts come back pale/.test(line)) return 'omen0';
  // omen1: 📻 prefix + a titan title (the data texts; the code
  // fallback 'They name it: <title>' also carries the title).
  if (/📻/.test(line) && /(Herald|Nielsen|Finale|Network)/.test(line)) return 'omen1';
  if (/They name it: THE (HERALD|NIELSEN|FINALE)/.test(line)) return 'omen1';
  if (/Scouts found its lair/.test(line)) return 'located';
  if (/Scouts correct their map/.test(line)) return 'repair';
  if (/🔭 .* scouts the land: mapped/.test(line)) return 'scout-map';
  if (/putting organic matter in their FACE-HOLES/.test(line)) return 'pellet-radio';
  if (/You turn to leave — behind you, The Herald stirs/.test(line)) return 'herald-stirs';
  if (/It followed you\. The Herald is here/.test(line)) return 'herald-here';
  if (/The Herald stops at the (treeline|boundary) — pacing, unwilling/.test(line)) return 'herald-treeline';
  if (/stops at the (treeline|boundary) — pacing, unwilling.*The Herald is still out there/.test(line)) return 'herald-treeline';
  if (/One of them is bigger than the usual teeth at the door — The Herald came with this raid/.test(line)) return 'herald-pack';
  if (/RAID — .*The Herald/.test(line)) return 'raid-herald';
  if (/Nobody met The Herald/.test(line)) return 'raid-herald-unmet';
  if (/📯 MUSTER — scouts report .* hunting near Haven/.test(line)) return 'muster-scout';
  if (/fed in the night/.test(line)) return 'strike-pantry';
  if (/struck .* in the night/.test(line)) return 'strike-trust';
  if (/muster is hungry/.test(line)) return 'muster-hunger';
  if (/does not notice you the way prey/.test(line)) return 'refusal-gate';
  if (/THE HEART is not here yet|THE HEART demands/.test(line)) return 'refusal-campaign';
  if (/WAR COUNCIL/.test(line)) return 'council';
  if (/The call, sounded now, would bring/.test(line)) return 'council-readiness';
  if (/cannot answer while/.test(line)) return 'council-refusal';
  if (/No one sits with you/.test(line)) return 'council-empty';
  if (/\(trust \d+, (steadfast|watchful|hungry)\)\. Scouts:/.test(line)) return 'council-face';
  if (/Scouts report:/.test(line)) return 'council-report';
  if (/THE CALL GOES OUT/.test(line)) return 'call-out';
  if (/REFUSES\. .*\(trust −8/.test(line)) return 'call-refusal';
  if (/answers! .* will march/.test(line)) return 'call-answer';
  if (/volunteers already march/.test(line)) return 'call-already';
  if (/has no free fighters to send/.test(line)) return 'call-thin';
  if (/Closer bonds with .* could bring more volunteers/.test(line)) return 'call-quota';
  if (/There is nothing located to march against/.test(line)) return 'no-target';
  if (/It is already dead/.test(line)) return 'commit-slain';
  if (/No new blades join the Network march/.test(line)) return 'commit-network-closed';
  if (/Haven\u2019s blades already march|Haven's blades already march/.test(line)) return 'commit-full';
  if (/No one is free to march/.test(line)) return 'commit-none-free';
  if (/steps? forward\. .* march with the muster/.test(line)) return 'commit-confirm';
  if (/Haven commits its own:/.test(line)) return 'commit-done';
  if (/THE MUSTER BREAKS/.test(line)) return 'standdown';
  if (/No muster stands against/.test(line)) return 'standdown-none';
  if (/THE TURN/.test(line)) return 'turn';
  if (/FALLS\. The realm exhales/.test(line)) return 'victory';
  if (/The coalition walks home/.test(line)) return 'victory-aftermath';
  if (/RELIC —/.test(line)) return 'relic';
  if (/leaves nothing but quiet/.test(line)) return 'victory-no-relic';
  if (/remains\. The coalition breaks and runs/.test(line)) return 'defeat';
  if (/did not get up/.test(line)) return 'fight-death';
  if (/their speaker — fell/.test(line)) return 'fight-death-speaker';
  if (/The fire is quieter tonight/.test(line)) return 'fight-death-haven';
  if (/allies join you on the field/.test(line)) return 'inject-allies';
  if (/The node holds\. The coalition falls back/.test(line)) return 'campaign-muster';
  if (/The big ones don.t haggle.*not titans/.test(line)) return 'other-system';
  return 'unclassified';
}

function sayLinesInRange(seed, seqBefore, seqAfter) {
  const out = [];
  for (const s of (seed.titanSaysFull || [])) {
    if (s.seq > seqBefore && s.seq <= seqAfter) out.push(s);
  }
  return out;
}
function sayClassesInRange(seed, seqBefore, seqAfter) {
  return sayLinesInRange(seed, seqBefore, seqAfter).map(function (s) { return classifySayLine(s.line); });
}

// Distinct instances: one spawn per titan id per run in practice (a
// titan places once; slain blocks re-omen; a field kill leaves the
// omen at stage 2 with no re-place). Key = id + '|' + spawn day.
// A startCombat event joins to the latest spawn of that mid with
// spawnDay <= event day; no such spawn -> 'unmatched'.
function instanceKey(spawnEv) { return (spawnEv.id || '?') + '|' + spawnEv.day; }
function resolveInstance(seed, ev) {
  const cands = (seed.spawnEvents || []).filter(function (s) { return s.id === ev.mid && s.day <= ev.day; });
  if (!cands.length) return null;
  cands.sort(function (a, b) { return b.day - a.day; });
  return instanceKey(cands[0]);
}

function classifyStartCombat(ev, seed) {
  if (!ev || !ev.mid) return 'unclassified';
  const added = ev.outcomeAdded || [];
  if (added.some(function (r) { return r && r.outcome === 'refused'; })) return 'refused';
  if (added.some(function (r) { return r && r.outcome === 'fought'; })) return 'fought';
  if (!ev.returnedNull) return 'fought';
  // Returned null: refused (gate) or dissolved (a fight began and
  // dissolved the same day — titangate-a Amendment 1). A titan tbEnd
  // on the same day with the same titan id is the dissolve signal.
  const dissolved = (seed.tbEndEvents || []).some(function (t) { return t.titan === ev.mid && t.day === ev.day; });
  if (dissolved) return 'dissolved';
  const classes = sayClassesInRange(seed, ev.saySeqBefore, ev.saySeqAfter);
  if (classes.indexOf('refusal-gate') >= 0 || classes.indexOf('refusal-campaign') >= 0) return 'refused';
  return 'unclassified';
}

function classifyTbEnd(ev) {
  if (!ev || !ev.titan || ev.result == null) return 'unclassified';
  if (ev.round == null) return 'unclassified';
  return 'ok';
}

function classifyFieldFight(ev) {
  if (!ev || !ev.mid) return 'unclassified';
  const ok = ['evade', 'vKill', 'mFlee', 'vFlee', 'vDie'];
  if (ok.indexOf(ev.outcome) < 0) return 'unclassified';
  if (ev.rounds == null) return 'unclassified';
  return 'ok';
}

function classifyOutcome(rec) {
  if (!rec || !rec.titan || !rec.outcome) return 'unclassified';
  const ok = ['refused', 'fought', 'slain', 'fled', 'stood-down'];
  if (ok.indexOf(rec.outcome) < 0) return 'unclassified';
  return 'ok';
}

// Dawn-diff classification. Every diff component must be explained
// by a titan say line in the dawn's seq range, a titan link-history
// entry added that dawn, or an explicit other-cause rule:
//   - omen stage change -> matching omen say line in range
//     (creation -> omen0, 0->1 -> omen1, 1->2 -> located)
//   - slain change -> victory line in range
//   - muster change -> turn line in range (titanTurnTick is the only
//     dawn path that reshapes a muster)
//   - trust delta with a titan-history entry added -> by kind
//     ('titan' -> strike-trust, 'muster-hunger' -> muster-hunger,
//     'betrayal' -> turn); trust delta with no titan entry ->
//     'other-cause' (other systems move trust at dawn too)
//   - pantry drop with a strike-pantry line in range ->
//     strike-pantry; any other pantry move -> 'other-cause'
//     (NOTE: titan raids spend the SCHOLAR'S PACK, not the village
//     pantry — see the pack branch below. A village-pantry move is
//     never titan-caused.)
//   - pack drop with a strike-pantry line in range -> strike-pantry
//     (the raid: 2000–4000 kcal from the scholar's stores);
//     pack drop with a muster-hunger line -> pantry-muster-upkeep
//     (the muster eats 1000 kcal/blade/day from the same pack);
//     any other pack move -> 'pack-other-cause' (other systems spend
//     the pack too)
//   - outcome records added -> each classified by classifyOutcome
// Returns { cls, kinds, reasons }.
function classifyDawn(ev, seed) {
  const reasons = [];
  const kinds = [];
  const d = ev.diffs || {};
  const classes = sayClassesInRange(seed, ev.saySeqBefore, ev.saySeqAfter);
  const has = function (c) { return classes.indexOf(c) >= 0; };
  (d.omen || []).forEach(function (o) {
    const b = o.before, a = o.after;
    if (!b && a && a.stage === 0) {
      if (has('omen0')) kinds.push('omen-created'); else reasons.push('omen-created:' + o.titan + ':no-omen0-line');
    } else if (b && a && b.stage === 0 && a.stage === 1) {
      if (has('omen1')) kinds.push('omen-named'); else reasons.push('omen-named:' + o.titan + ':no-omen1-line');
    } else if (b && a && b.stage === 1 && a.stage === 2) {
      if (has('located')) kinds.push('omen-located'); else reasons.push('omen-located:' + o.titan + ':no-located-line');
    } else {
      reasons.push('omen-unexpected:' + o.titan + ':' + JSON.stringify({ b: b, a: a }));
    }
  });
  (d.slain || []).forEach(function (s) {
    if (has('victory')) kinds.push('slain:' + s.titan); else reasons.push('slain:' + s.titan + ':no-victory-line');
  });
  (d.muster || []).forEach(function (m) {
    if (has('turn')) kinds.push('muster-turn:' + m.titan);
    else reasons.push('muster-change:' + m.titan + ':no-turn-line');
  });
  if (d.cast) {
    // titanCast() sets the cast silently inside titanDawnTick — no
    // say line exists for it. A cast diff needs no line.
    kinds.push('cast-set');
  }
  (d.trust || []).forEach(function (tr) {
    const added = tr.titanHistAdded || [];
    if (added.length) {
      added.forEach(function (h) {
        if (h.kind === 'titan') {
          // Strike is -5, clamped at trust 0: a link at trust 3
          // loses 3 (Amendment 1: the smoke showed -3 on a
          // trust-3 link with a titan history entry).
          if (tr.delta < 0 && tr.delta >= -5) kinds.push('strike-trust:' + tr.village);
          else reasons.push('strike-trust:' + tr.village + ':delta-' + tr.delta + '-not-in-[-5,-1]');
        } else if (h.kind === 'muster-hunger') {
          // Hunger is -2, likewise clamped at 0.
          if (tr.delta < 0 && tr.delta >= -2) kinds.push('muster-hunger:' + tr.village);
          else reasons.push('muster-hunger:' + tr.village + ':delta-' + tr.delta + '-not-in-[-2,-1]');
        } else if (h.kind === 'betrayal') {
          kinds.push('turn:' + tr.village);
        } else {
          reasons.push('trust-hist-unknown-kind:' + tr.village + ':' + h.kind);
        }
      });
    } else if (tr.delta !== 0 && tr.delta != null) {
      kinds.push('trust-other-cause:' + tr.village + ':' + tr.delta);
    }
  });
  if (d.pantry) {
    kinds.push('pantry-other-cause:' + d.pantry.delta);
  }
  if (d.pack) {
    if (d.pack.delta < 0 && has('strike-pantry')) kinds.push('strike-pantry:' + (-d.pack.delta) + 'kcal');
    else if (d.pack.delta < 0 && has('muster-hunger')) kinds.push('pantry-muster-upkeep');
    else kinds.push('pack-other-cause:' + d.pack.delta);
  }
  (d.outcomesAdded || []).forEach(function (r) {
    if (classifyOutcome(r) === 'ok') kinds.push('outcome:' + r.outcome + ':' + r.titan);
    else reasons.push('outcome-unclassified:' + JSON.stringify(r));
  });
  return { cls: reasons.length ? 'unclassified' : 'ok', kinds: kinds, reasons: reasons };
}

function analyzeSeed(o) {
  const says = (o.titanSaysFull || []).map(function (s) {
    return { seq: s.seq, day: s.day, cls: classifySayLine(s.line), line: s.line };
  });
  const sayByClass = {};
  says.forEach(function (s) { sayByClass[s.cls] = (sayByClass[s.cls] || 0) + 1; });
  const sayUnclassified = says.filter(function (s) { return s.cls === 'unclassified'; });

  const sc = (o.startCombatEvents || []).map(function (ev) {
    return { ev: ev, cls: classifyStartCombat(ev, o), instance: resolveInstance(o, ev) };
  });
  const scUnclassified = sc.filter(function (r) { return r.cls === 'unclassified'; });
  const scUnmatched = sc.filter(function (r) { return r.instance == null; });
  const scByClass = {};
  sc.forEach(function (r) { scByClass[r.cls] = (scByClass[r.cls] || 0) + 1; });

  const tb = (o.tbEndEvents || []).map(function (ev) { return { ev: ev, cls: classifyTbEnd(ev) }; });
  const tbUnclassified = tb.filter(function (r) { return r.cls === 'unclassified'; });

  const ff = (o.fieldFightEvents || []).map(function (ev) { return { ev: ev, cls: classifyFieldFight(ev) }; });
  const ffUnclassified = ff.filter(function (r) { return r.cls === 'unclassified'; });
  const ffByOutcome = {};
  ff.forEach(function (r) { ffByOutcome[r.ev.outcome] = (ffByOutcome[r.ev.outcome] || 0) + 1; });

  const dawn = (o.dawnEvents || []).map(function (ev) {
    const c = classifyDawn(ev, o);
    return { ev: ev, cls: c.cls, kinds: c.kinds, reasons: c.reasons };
  });
  const dawnUnclassified = dawn.filter(function (r) { return r.cls === 'unclassified'; });
  const dawnKinds = {};
  dawn.forEach(function (r) { r.kinds.forEach(function (k) { const base = k.split(':')[0]; dawnKinds[base] = (dawnKinds[base] || 0) + 1; }); });

  // Outcome log: final snapshot's log (the authoritative record).
  const finalSnap = (o.daily || [])[(o.daily || []).length - 1] || {};
  const outcomes = finalSnap.outcomes || [];
  const outcomeUnclassified = outcomes.filter(function (r) { return classifyOutcome(r) === 'unclassified'; });
  const outcomeByClass = {};
  outcomes.forEach(function (r) { outcomeByClass[r.outcome] = (outcomeByClass[r.outcome] || 0) + 1; });

  // Omens / placement / reach from daily snapshots.
  let maxWave = 1, maxRank = 'village', everRegional = false, everWave4 = false;
  let cast = null;
  const omenFirst = {};
  (o.daily || []).forEach(function (s) {
    if (s.wave && s.wave > maxWave) maxWave = s.wave;
    if (s.scaleRank === 'regional' || s.scaleRank === 'national' || s.scaleRank === 'global') everRegional = true;
    if (s.wave >= 4) everWave4 = true;
    if (!cast && s.cast) cast = s.cast;
    Object.keys(s.omens || {}).forEach(function (tid) {
      if (!omenFirst[tid]) omenFirst[tid] = { stage: s.omens[tid].stage, day: s.day };
      else if (s.omens[tid].stage > omenFirst[tid].stage) omenFirst[tid] = { stage: s.omens[tid].stage, day: s.day };
    });
    if (s.scaleRank) maxRank = s.scaleRank;
  });

  // Refusal-line repeats per day (the binddiag-b backlog item).
  const refusalPerDay = {};
  says.filter(function (s) { return s.cls === 'refusal-gate' || s.cls === 'refusal-campaign'; })
    .forEach(function (s) { refusalPerDay[s.day] = (refusalPerDay[s.day] || 0) + 1; });
  let maxRefusalDay = 0, maxRefusalDayN = 0;
  Object.keys(refusalPerDay).forEach(function (d) {
    if (refusalPerDay[d] > maxRefusalDayN) { maxRefusalDayN = refusalPerDay[d]; maxRefusalDay = parseInt(d, 10); }
  });

  // Strikes from the say corpus (authoritative for OCCURRENCE: a
  // 0-kcal raid takes nothing, so it leaves no dawn-diff at all —
  // the smoke showed 9 of 10 pantry lines reading '0 kcal gone').
  // Dawn kinds are authoritative for EFFECT (kcal taken, trust
  // moved). The two counts cross-check each other.
  const sayStrikes = { pantry: 0, trust: 0 };
  says.forEach(function (s) {
    if (s.cls === 'strike-pantry') sayStrikes.pantry++;
    if (s.cls === 'strike-trust') sayStrikes.trust++;
  });
  const dawnStrikePantry = dawn.reduce(function (n, r) {
    return n + r.kinds.filter(function (k) { return k.indexOf('strike-pantry') === 0; }).length;
  }, 0);
  const dawnStrikeTrust = dawn.reduce(function (n, r) {
    return n + r.kinds.filter(function (k) { return k.indexOf('strike-trust') === 0; }).length;
  }, 0);
  const raidHerald = says.filter(function (s) { return s.cls === 'raid-herald' || s.cls === 'herald-pack' || s.cls === 'raid-herald-unmet'; }).length;

  // Trust ledger: titan-attributed deltas from dawn kinds.
  let trustTax = 0;
  const trustByKind = {};
  dawn.forEach(function (r) {
    r.kinds.forEach(function (k) {
      const m = /^strike-trust:/.test(k) ? -5 : /^muster-hunger:/.test(k) ? -2 : null;
      if (m != null) { trustTax += m; const base = k.split(':')[0]; trustByKind[base] = (trustByKind[base] || 0) + m; }
    });
    // standdown trust is charged in titanStandDown (an action, not a
    // dawn): counted from action events below.
  });
  (o.actionEvents || []).forEach(function (a) {
    if (a.action === 'titanStandDown' && a.ret) {
      const m = /(\d+) allied fire/.exec(String(a.ret));
      if (m) { const n = parseInt(m[1], 10); trustTax += -5 * n; trustByKind.standdown = (trustByKind.standdown || 0) - 5 * n; }
    }
  });

  // Streaks per distinct instance (titangate-a shape).
  const streaks = {};
  sc.forEach(function (r) {
    const key = r.instance || 'unmatched:' + r.ev.mid;
    streaks[key] = streaks[key] || { instance: key, mid: r.ev.mid, refusals: 0, fought: 0, dissolved: 0, days: {}, firstDay: null, lastDay: null };
    const st = streaks[key];
    if (r.cls === 'refused') st.refusals++;
    if (r.cls === 'fought') st.fought++;
    if (r.cls === 'dissolved') st.dissolved++;
    st.days[r.ev.day] = (st.days[r.ev.day] || 0) + 1;
    if (st.firstDay == null || r.ev.day < st.firstDay) st.firstDay = r.ev.day;
    if (st.lastDay == null || r.ev.day > st.lastDay) st.lastDay = r.ev.day;
  });

  return {
    seed: o.seed, mode: o.mode, days: o.days, gameDays: o.gameDays,
    endReason: o.endReason, won: o.won, villageLost: o.villageLost,
    scaleRank: o.scaleRank, maxWave: o.maxWave, unlockedWave: o.unlockedWave,
    standing: o.standing, endPantryKcal: o.endPantryKcal, deaths: (o.deaths || []).length,
    instrumentErrors: (o.instrumentErrors || []).length,
    cast: cast, omenFirst: omenFirst, everWave4: everWave4, everRegional: everRegional,
    spawns: (o.spawnEvents || []).length, removals: (o.removeEvents || []).length,
    spawnList: (o.spawnEvents || []).map(function (s) { return { id: s.id, day: s.day, tx: s.tx, ty: s.ty, hp: s.hp }; }),
    startCombat: { total: sc.length, byClass: scByClass, unclassified: scUnclassified.length, unmatchedInstance: scUnmatched.length },
    tbEnd: { total: tb.length, unclassified: tbUnclassified.length,
      rounds: tb.map(function (r) { return { titan: r.ev.titan, day: r.ev.day, round: r.ev.round, result: r.ev.result }; }) },
    fieldFight: { total: ff.length, byOutcome: ffByOutcome, unclassified: ffUnclassified.length },
    dawn: { total: dawn.length, unclassified: dawnUnclassified.length, kinds: dawnKinds,
      unclassifiedReasons: dawnUnclassified.map(function (r) { return { day: r.ev.day, reasons: r.reasons }; }) },
    say: { total: says.length, byClass: sayByClass, unclassified: sayUnclassified.length,
      unclassifiedLines: sayUnclassified.slice(0, 10).map(function (s) { return { day: s.day, line: s.line }; }) },
    outcomes: { total: outcomes.length, byClass: outcomeByClass, unclassified: outcomeUnclassified.length },
    actions: { total: (o.actionEvents || []).length,
      byAction: (function () { const m = {}; (o.actionEvents || []).forEach(function (a) { m[a.action] = (m[a.action] || 0) + 1; }); return m; })() },
    refusalPerDay: refusalPerDay, maxRefusalDay: maxRefusalDay, maxRefusalDayN: maxRefusalDayN,
    sayStrikes: sayStrikes, dawnStrikePantry: dawnStrikePantry, dawnStrikeTrust: dawnStrikeTrust,
    raidHerald: raidHerald,
    trustTax: trustTax, trustByKind: trustByKind,
    streaks: Object.keys(streaks).map(function (k) { return streaks[k]; }),
    wrapLive: o.wrapLive || {}, wrapCounts: o.wrapCounts || {},
  };
}

function checkNeutrality(controls, neutrals) {
  const rows = [];
  let pass = 0;
  controls.forEach(function (c) {
    const n = neutrals.find(function (x) { return x.seed === c.seed; });
    if (!n) { rows.push({ seed: c.seed, match: false, why: 'no-neutral' }); return; }
    const match = (c.days === n.days) && (c.endPantryKcal === n.endPantryKcal) &&
      ((c.deaths || []).length === (n.deaths || []).length);
    if (match) pass++;
    rows.push({ seed: c.seed, match: match,
      control: { days: c.days, kcal: c.endPantryKcal, deaths: (c.deaths || []).length },
      neutral: { days: n.days, kcal: n.endPantryKcal, deaths: (n.deaths || []).length } });
  });
  return { pass: pass, total: controls.length, rows: rows };
}

function analyzeBand(seedObjs) {
  const perSeed = seedObjs.map(analyzeSeed);
  const sum = function (f) { return perSeed.reduce(function (a, s) { return a + f(s); }, 0); };
  const median = function (arr) {
    const s = arr.slice().sort(function (a, b) { return a - b; });
    if (!s.length) return null;
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  };
  const go = {
    unclassifiedStartCombat: sum(function (s) { return s.startCombat.unclassified; }),
    unclassifiedTbEnd: sum(function (s) { return s.tbEnd.unclassified; }),
    unclassifiedFieldFight: sum(function (s) { return s.fieldFight.unclassified; }),
    unclassifiedDawn: sum(function (s) { return s.dawn.unclassified; }),
    unclassifiedSay: sum(function (s) { return s.say.unclassified; }),
    unclassifiedOutcome: sum(function (s) { return s.outcomes.unclassified; }),
    instrumentErrors: sum(function (s) { return s.instrumentErrors; }),
    engagementSeeds: perSeed.filter(function (s) { return s.everWave4 && s.everRegional; }).length,
  };
  const band = {
    seeds: perSeed.length,
    perSeed: perSeed,
    totals: {
      spawns: sum(function (s) { return s.spawns; }),
      startCombat: sum(function (s) { return s.startCombat.total; }),
      startCombatRefused: sum(function (s) { return s.startCombat.byClass.refused || 0; }),
      startCombatFought: sum(function (s) { return s.startCombat.byClass.fought || 0; }),
      startCombatDissolved: sum(function (s) { return s.startCombat.byClass.dissolved || 0; }),
      tbEnds: sum(function (s) { return s.tbEnd.total; }),
      fieldFights: sum(function (s) { return s.fieldFight.total; }),
      dawnEvents: sum(function (s) { return s.dawn.total; }),
      titanSays: sum(function (s) { return s.say.total; }),
      actions: sum(function (s) { return s.actions.total; }),
      trustTax: sum(function (s) { return s.trustTax; }),
    },
    wall: {
      national: perSeed.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      table: 0, // the table offer/sitting is not in the per-seed record; read from evidence narrative if observed
      wins: perSeed.filter(function (s) { return s.won; }).length,
      wave4: perSeed.filter(function (s) { return (s.unlockedWave || 1) >= 4; }).length,
      wave5: perSeed.filter(function (s) { return (s.unlockedWave || 1) >= 5; }).length,
      medianSurvival: median(perSeed.map(function (s) { return s.gameDays || s.days; })),
      deaths: sum(function (s) { return s.deaths; }),
      survived: perSeed.filter(function (s) { return !s.villageLost && !s.won; }).length,
    },
    go: go,
  };
  band.go.pass = (go.unclassifiedStartCombat === 0 && go.unclassifiedTbEnd === 0 &&
    go.unclassifiedFieldFight === 0 && go.unclassifiedDawn === 0 &&
    go.unclassifiedSay === 0 && go.unclassifiedOutcome === 0 &&
    go.instrumentErrors === 0 && go.engagementSeeds >= 1);
  return band;
}

function readSeedDir(dir) {
  const out = [];
  fs.readdirSync(dir).forEach(function (f) {
    if (/\.json$/.test(f) && !/summary/.test(f)) {
      try { out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) {}
    }
  });
  out.sort(function (a, b) { return a.seed - b.seed; });
  return out;
}

if (require.main === module) {
  const dir = process.argv[2];
  const neutralDir = process.argv[3] || null;
  if (!dir) { console.error('Usage: node titanfirst-analyze-20261111.js <per-seed-dir> [neutral-dir]'); process.exit(2); }
  const controls = readSeedDir(dir).filter(function (o) { return o.mode === 'control'; });
  const band = analyzeBand(controls);
  let neutrality = null;
  if (neutralDir) {
    const neutrals = readSeedDir(neutralDir).filter(function (o) { return o.mode === 'neutral'; });
    neutrality = checkNeutrality(controls, neutrals);
    band.neutrality = neutrality;
    band.go.neutralityPass = (neutrality.pass === neutrality.total && neutrality.total > 0);
    band.go.pass = band.go.pass && band.go.neutralityPass;
  }
  const outFile = path.join(path.dirname(dir), 'titanfirst-summary-titanfirst-pilot.json');
  fs.writeFileSync(outFile, JSON.stringify(band, null, 2) + '\n');
  console.log(JSON.stringify({ seeds: band.seeds, go: band.go, totals: band.totals, wall: band.wall, outFile: outFile }, null, 2));
}

module.exports = {
  classifySayLine: classifySayLine, classifyStartCombat: classifyStartCombat,
  classifyTbEnd: classifyTbEnd, classifyFieldFight: classifyFieldFight,
  classifyDawn: classifyDawn, classifyOutcome: classifyOutcome,
  instanceKey: instanceKey, resolveInstance: resolveInstance,
  analyzeSeed: analyzeSeed, analyzeBand: analyzeBand,
  checkNeutrality: checkNeutrality, readSeedDir: readSeedDir,
};
