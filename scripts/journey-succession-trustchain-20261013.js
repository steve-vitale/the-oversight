#!/usr/bin/env node
// journey-succession-trustchain-20261013.js — LEG 7 SUCCESSION (playtest loop, 3rd run today).
// Fresh question: SUCCESSOR SELECTION + TRUST CHAIN DYNAMICS over long chains.
//   1. Who gets chosen as successor (candidate list, trust order) — sensible?
//   2. Does the three-channel trust formula (office 40% + own 40% + vouching, floor 10)
//      hold over long chains, or collapse mid-chain (the Dieter 71->9 case from r2)?
//   3. People check: conversations as the new bearer - leader or stranger?
// PILOT: 4 seeds x 140d competent, plus 3 people-check seeds stopped 8d after first death.
// Death-aware: village-lost stops the run (+0 tail).
// Usage: SEEDS=1101,1102,1103,1104 node scripts/journey-succession-trustchain-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '1101,1102,1103,1104').split(',').map(s => parseInt(s, 10));
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const STOP_AFTER_DEATH_DAYS = parseInt(process.env.STOP_AFTER_DEATH_DAYS || '0', 10);
const OUT = path.join(ROOT, 'evidence', '2026-10-13', `journey-succession-trustchain-seedSUMMARY.json`);

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function firstOf(n) { return String(n || 'someone').split(' ')[0]; }

async function runSeed(seed) {
  const { Game, loadFails } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  const ev = { seed, deaths: [], dailyTrust: [], peopleCheck: [] };
  // per-day trust sampling of the current bearer + roster size
  const pol = Object.assign({}, competent, {
    id: 'succession-trustchain',
    daily(G2, ctx2) {
      if (competent.daily) competent.daily(G2, ctx2);
      try {
        const v = G2.state.village || {};
        ev.dailyTrust.push({ day: (G2.state.scholar || {}).day || 0, bearer: vname(G2, G2.villagerId), trust: ((v.trust || {})[G2.villagerId]) });
      } catch (e) {}
      if (STOP_AFTER_DEATH_DAYS > 0 && ev.deaths.length > 0 && !ev.stoppedEarly) {
        const day = ((G2.state || {}).scholar || {}).day || 0;
        if (day >= ev.deaths[0].day + STOP_AFTER_DEATH_DAYS) { ev.stoppedEarly = true; G2.over = true; }
      }
    },
  });

  // wrap playerDeath: capture the selection inputs BEFORE the transfer
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const v = this.state.village || {};
    const trust = v.trust || {};
    const trustSnap = Object.assign({}, trust); // snapshot: playerDeath mutates v.trust in place
    let candidates = [];
    try { candidates = (this.npcIds() || []).map(id => ({ id, name: vname(this, id), trust: (trust[id] == null ? 'missing' : trust[id]) })); } catch (e) {}
    const sorted = candidates.slice().sort((a, b) => ((typeof b.trust === 'number' ? b.trust : -1) - (typeof a.trust === 'number' ? a.trust : -1)));
    const oldId = this.villagerId;
    const rec = {
      day: (this.state.scholar || {}).day || 0,
      oldName: vname(this, oldId), oldId, oldTrust: trust[oldId],
      cause: cause || '?', rosterSize: (v.roster || []).length,
      candidateTop: sorted.slice(0, 6).map(c => `${firstOf(c.name)}(${c.trust})`),
      candidateCount: sorted.length,
    };
    const r = origPD.call(this, cause);
    try {
      const trust2 = (this.state.village || {}).trust || {};
      rec.newId = this.villagerId; rec.newName = vname(this, this.villagerId);
      rec.actualNewTrust = trust2[rec.newId];
      // recompute the formula's expected value independently
      const live = new Set((this.state.village || {}).roster || []);
      const office = (trustSnap[oldId] == null ? 20 : trustSnap[oldId]);
      const own = (trustSnap[rec.newId] == null ? 0 : trustSnap[rec.newId]);
      const vouchers = ((this.state.village || {}).roster || []).filter(id => id !== rec.newId && live.has(id) && (trustSnap[id] || 0) >= 60);
      const expect = Math.max(10, Math.min(100, Math.round(office * 0.4 + own * 0.4 + Math.min(16, vouchers.length * 4))));
      rec.formula = { office, own, voucherCount: vouchers.length, expect, match: expect === trust2[rec.newId] };
    } catch (e) { rec.postError = e.message; }
    ev.deaths.push(rec);
    try { console.error(`[seed ${seed}] D${rec.day}: ${firstOf(rec.oldName)}(trust ${rec.oldTrust}, ${rec.cause}) -> ${firstOf(rec.newName)} trust=${rec.actualNewTrust} formula=${rec.formula.expect} match=${rec.formula.match} | cands: ${rec.candidateTop.join(', ')}`); } catch (e) {}
    return r;
  };

  await setupGame(Game);
  ev.startBearer = vname(Game, Game.villagerId);
  const res = await runDays(Game, pol, { days: DAYCAP, manifest: null });
  if (ev.stoppedEarly) Game.over = false;
  ev.endReason = ev.stoppedEarly ? 'stopped-after-death' : res.endReason;
  ev.villageLost = !!Game.villageLost;
  ev.finalBearer = ev.villageLost ? null : vname(Game, Game.villagerId);

  // collapse daily trust into change-points per bearer life
  const legs = [];
  let cur = null;
  for (const d of ev.dailyTrust) {
    if (!cur || cur.bearer !== d.bearer) { if (cur) legs.push(cur); cur = { bearer: d.bearer, startDay: d.day, endDay: d.day, startTrust: d.trust, endTrust: d.trust, minTrust: d.trust, maxTrust: d.trust, changes: [] }; }
    else {
      cur.endDay = d.day; cur.endTrust = d.trust;
      if (d.trust != null) { cur.minTrust = Math.min(cur.minTrust == null ? d.trust : cur.minTrust, d.trust); cur.maxTrust = Math.max(cur.maxTrust == null ? d.trust : cur.maxTrust, d.trust); }
      const prev = ev.dailyTrust[ev.dailyTrust.indexOf(d) - 1];
      if (prev && prev.bearer === d.bearer && prev.trust != null && d.trust != null && prev.trust !== d.trust) {
        if (cur.changes.length < 12) cur.changes.push({ day: d.day, from: prev.trust, to: d.trust });
        cur.changeCount = (cur.changeCount || 0) + 1;
      }
    }
  }
  if (cur) legs.push(cur);
  ev.trustLegs = legs.map(l => ({ bearer: l.bearer, days: `${l.startDay}-${l.endDay}`, trust: `${l.startTrust}->${l.endTrust}`, min: l.minTrust, max: l.maxTrust, nChanges: l.changeCount || 0, sampleChanges: l.changes }));
  delete ev.dailyTrust;

  // people check: conversations as the new bearer (only in stop-after-death mode)
  if (STOP_AFTER_DEATH_DAYS > 0 && !ev.villageLost) {
    try {
      const roster = (Game.state.village || {}).roster || [];
      const oldName = firstOf(ev.deaths[0].oldName);
      for (const vid of roster.slice(0, 3)) {
        if (vid === Game.villagerId) continue;
        const t = { with: vname(Game, vid), turns: 0, texts: [] };
        try { Game.startConvo(vid); } catch (e) { t.error = e.message; ev.peopleCheck.push(t); continue; }
        for (let i = 0; i < 8; i++) {
          let c = null; try { c = Game.convoGet(vid); } catch (e) {}
          if (!c || !c.active) break;
          const choices = (Game.convoChoices && Game.convoChoices(vid)) || [];
          if (!choices.length) break;
          t.offered = choices.map(x => String((x && x.id) || ''));
          let pick = choices.find(x => /^(dlg:help|dlg:details|want:|gq:)/.test(String(x.id || '')));
          if (!pick) pick = choices.find(x => /^(leave|bye|goodbye)/.test(String(x.id || '')));
          if (!pick) pick = choices[0];
          try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
          t.turns++;
          if (/^(leave|bye|goodbye)/.test(String(pick.id || ''))) break;
        }
        try {
          const c = Game.convoGet(vid);
          t.texts = ((c && c.transcript) || []).map(e => `${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text || '').slice(0, 400)}`);
          t.mentionsDead = t.texts.some(x => x.includes(oldName));
          t.leaderLanguage = t.texts.some(x => /leader|bearer|scholar|mantle/i.test(x));
          try { const ch = (Game.convoChoices && Game.convoChoices(vid)) || []; const bye = ch.find(x => /^(leave|bye|goodbye)/.test(String(x.id || ''))); if (bye) Game.convoTurn(vid, bye.id); else Game.endConvo(vid, 'left'); } catch (e) {}
        } catch (e) { t.endError = e.message; }
        ev.peopleCheck.push(t);
      }
    } catch (e) { ev.peopleCheckError = e.message; }
  }
  return ev;
}

(async () => {
  const all = [];
  for (const s of SEEDS) { all.push(await runSeed(s)); }
  const summary = all.map(a => ({ seed: a.seed, startBearer: a.startBearer, finalBearer: a.finalBearer, villageLost: a.villageLost, endReason: a.endReason, deaths: a.deaths, trustLegs: a.trustLegs, peopleCheck: (a.peopleCheck || []).map(p => ({ with: p.with, turns: p.turns, mentionsDead: p.mentionsDead, leaderLanguage: p.leaderLanguage, texts: p.texts })) }));
  const out = OUT.replace('SUMMARY', `stop${STOP_AFTER_DEATH_DAYS}`);
  fs.writeFileSync(out, JSON.stringify(summary, null, 1));
  console.log('wrote', out);
})();