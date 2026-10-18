#!/usr/bin/env node
// probe-witnesource-substrate-20261017.js — substrate facts for the exposure
// source build (arm sim-witnesource, 2026-10-17). READ-ONLY instrument: what
// justice/exposure events fire on the modal road (FEASTSCALE_R13=1,
// SEATDRIVE=0 explicit, TAKESEAT=1, MODALPLAY=1) before the win truncates?
// Reports: betrayal cases opened/resolved + paths, ledger.exposed timeline,
// thefts/confessions, bribery, gossip-with-names. Zero behavior change.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.TAKESEAT = '1';
process.env.MODALPLAY = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadmodalplay, belongmodalplay } = require('./policies/modalplay');

const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9101, 9102];
const DAYS = parseInt(process.env.DAYS || '120', 10);

function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function nameOf(Game, id) { try { return Game.displayName ? Game.displayName(id) : id; } catch (e) { return id; } }

async function probe(seed, road) {
  const policy = road === 'leadfeast' ? leadmodalplay : belongmodalplay;
  const { Game } = await loadGame({ seed, mode: `witnesource-probe-${road}` });
  await setupGame(Game);
  const events = [];
  // wrap ledgerAdd to catch exposed writes with a stack hint
  const _ledgerAdd = Game.ledgerAdd;
  Game.ledgerAdd = function (dim, n) {
    const r = _ledgerAdd.apply(this, arguments);
    if (dim === 'exposed') {
      events.push({ day: dayOf(Game), type: 'exposed+', n, via: 'ledgerAdd' });
    }
    return r;
  };
  // wrap resolveCase
  const _resolveCase = Game.resolveCase;
  if (_resolveCase) Game.resolveCase = function (caseId, path) {
    const c = this.getCase ? this.getCase(caseId) : null;
    const r = _resolveCase.apply(this, arguments);
    events.push({
      day: dayOf(Game), type: 'case-resolved', path,
      accused: c ? (c.accused || []).map(a => nameOf(Game, a)) : [],
      accuser: c ? nameOf(Game, c.accuser) : '?',
      charge: c ? (c.charge || c.kind || '?') : '?',
    });
    return r;
  };
  // wrap say to catch moot/accusation/fire beats (bounded)
  const sayLines = [];
  const _say = Game.say;
  Game.say = function (msg) {
    const r = _say.apply(this, arguments);
    try {
      const s = String(msg || '');
      if (/moot|accus|expos|confess|bribe|theft|stole|fire goes|the list/i.test(s) && sayLines.length < 60) {
        sayLines.push({ day: dayOf(Game), line: s.slice(0, 220) });
      }
    } catch (e) {}
    return r;
  };
  await quietLog(() => runDays(Game, policy, { days: DAYS }));
  let cases = [];
  try { cases = (Game.betrayalState().cases || []).map(c => ({ id: c.id, status: c.status, resolution: c.resolution, accused: (c.accused || []).map(a => nameOf(Game, a)), accuser: nameOf(Game, c.accuser), charge: c.charge || c.kind })); } catch (e) {}
  let ledger = {};
  try { ledger = Game.ledger() || {}; } catch (e) {}
  let crimes = [];
  try { crimes = (Game.justiceState().crimes || []).map(c => ({ type: c.type, day: c.day, by: nameOf(Game, c.by) })); } catch (e) {}
  return {
    seed, road, days: dayOf(Game), won: !!Game.won,
    ledgerExposed: ledger.exposed | 0,
    cases, crimes: crimes.slice(0, 12), crimeCount: crimes.length,
    events: events.slice(0, 40),
    saySample: sayLines.slice(0, 25),
  };
}

(async () => {
  const out = [];
  for (const seed of SEEDS) {
    for (const road of ['leadfeast', 'belongfeast']) {
      const r = await probe(seed, road);
      out.push(r);
      console.log(`seed ${seed} ${road}: days=${r.days} won=${r.won} exposed=${r.ledgerExposed} cases=${r.cases.length} crimes=${r.crimeCount}`);
      for (const c of r.cases) console.log(`   case ${c.id}: ${c.status}/${c.resolution || '-'} accuser=${c.accuser} accused=[${c.accused.join(',')}] charge=${c.charge}`);
      for (const e of r.events.slice(0, 10)) console.log(`   ev d${e.day}: ${e.type} ${e.path || ''} n=${e.n || ''}`);
    }
  }
  require('fs').writeFileSync('/tmp/witnesource-probe.json', JSON.stringify(out, null, 1));
  console.log('wrote /tmp/witnesource-probe.json');
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
