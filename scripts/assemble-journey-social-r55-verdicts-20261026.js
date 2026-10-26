#!/usr/bin/env node
// assemble-journey-social-r55-verdicts-20261026.js -- RECOVERY TOOLING.
// The r55 driver run was killed by a service restart after seeds 5101-5103
// flushed; seed 5104 ran separately. The driver's r55-verdicts.json is
// only written at the end of a full run, so a split run leaves none.
// This script rebuilds it from the four per-seed JSONs in EXACTLY the
// driver's verdict-map shape (same fields, same derivations), so the
// r55 analyzer's menuSplit section and the run note read one file.
// It writes nothing else and touches no game code.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-26', 'r55');
const len = (x) => Array.isArray(x) ? x.length : (typeof x === 'number' ? x : 0);
function main() {
  const verd = [];
  for (const s of [5101, 5102, 5103, 5104]) {
    const r = JSON.parse(fs.readFileSync(path.join(EVIDIR, `journey-social-r55-s${s}.json`), 'utf8'));
    verd.push({
      seed: r.seed, steering: r.steering, alive: r.alive, deep2: len(r.deep2Pairs),
      cracks: len(r.cracks), vCracks: len(r.vCracks), friendGrievances: len(r.friendGrievances),
      stateGrievances: len(r.stateGrievances), stateFriend: len(r.stateFriendGrievances),
      stateVCracks: len(r.stateVCracks), t2picks: r.t2picksTotal,
      closeReads: len(r.closeReads), grievReads: len(r.grievReads), grievReadsByWhy: r.grievReadsByWhy,
      firstDeep2Day: r.firstDeep2DayAll, lateClose: r.lateClose, lateTP: r.lateTP, lateNull: r.lateNull,
      condRate: r.condRate, pooledTP: r.pooledTP, pooledRate: r.pooledRate,
      othersSteered: r.othersSteered, knack: r.knackGossipsTotal,
      funnel: r.funnel, funnelUnsteered: r.funnelUnsteered, windows: r.windows,
      naturalPicks: r.naturalPicks, seededPicks: r.seededPicks,
      knackSameSpeakerRepeats: r.knackSameSpeakerRepeats, knackCrossSpeakerRetells: r.knackCrossSpeakerRetells,
      t2picksTotal: r.t2picksTotal, gossipPicks: r.gossipPicks, seededEffect: r.seededEffect,
      reofferOffers: r.reofferOffers, reofferPicks: r.reofferPicks, reofferLatePicks: r.reofferLatePicks,
      reofferMissed: r.reofferMissed, wrapServes: r.wrapServes, wrapServeMatcherHits: r.wrapServeMatcherHits,
      grievanceServesTotal: r.grievanceServesTotal, wrapServeClasses: r.wrapServeClasses,
      wrapServeConvos: r.wrapServeConvos,
      funnelProbe: r.funnelProbe ? { turns: r.funnelProbe.turns, menuProblem: r.funnelProbe.menuProblem, pickProblem: r.funnelProbe.pickProblem } : null,
    });
  }
  const out = path.join(EVIDIR, 'r55-verdicts.json');
  fs.writeFileSync(out, JSON.stringify(verd, null, 1));
  console.log('WROTE ' + out + ' (' + verd.length + ' seeds)');
  for (const v of verd) {
    const fu = v.funnelUnsteered || {};
    console.log(`seed ${v.seed} alive=${v.alive} deep2=${v.deep2} unsteered=${fu.totalNaturalUnsteered} noOffer=${fu.subjectNoOffer} offered=${fu.offered} mainOff=${fu.mainOffered} subjOff=${fu.subjectOffered} picked=${fu.picked} latePicks=${fu.latePicks} lateMain=${fu.latePicksMain} lateSubj=${fu.latePicksSubject}`);
  }
}
main();
