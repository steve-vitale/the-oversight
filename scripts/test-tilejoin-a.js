#!/usr/bin/env node
// scripts/test-tilejoin-a.js — sim-tilejoin-a analyzer + judge.
// Reads OFF and ON corpora (evidence/2026-10-29/perseed-tilejoin-a/
// off|on, overridable via OFFDIR/ONDIR env), joins each row's
// fieldparty meetings (universe) with its tilejoin meetings (fed/join
// data) by call index, and judges the prereg legs. Exits 0 only when
// every judged leg passes; prints MACHINE-LEGS-PASS/FAIL.
//
// Universe U (breakline-a verbatim): fieldparty channel == 'field',
// caller in {resolve, patrol, aid}, wave 1..4, leader NOT the scholar.
// Fought = rounds >= 1. Tile-present uses the tilejoin record's
// tileAll (breakline def: nodePos == monster tile, deadKnown !== true).
// Joined = tilejoin joinedAllyVid non-null. Solo = fought U with
// tileAll empty.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const OFFDIR = process.env.OFFDIR || path.join(REPO, 'evidence', '2026-10-29', 'perseed-tilejoin-a', 'off');
const ONDIR = process.env.ONDIR || path.join(REPO, 'evidence', '2026-10-29', 'perseed-tilejoin-a', 'on');

function loadLeg(dir) {
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(dir, `s${seed}-fresh.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}

function census(rows, legName) {
  const out = { leg: legName, rows: rows.length, rowsValid: 0, corpusOk: true,
    joinErrors: 0, uMeetings: 0, uFought: 0, tilePresent: 0, tileFed: 0,
    fedCalls: 0, fedMates: 0, fedBelow15: 0, fedStamp: 0,
    shouts: 0, joins: 0, joinedFights: [], addressable: 0, addressableJoined: 0,
    kills: 0, soloFights: 0, soloKills: 0, tileUnjoinedFights: 0, tileUnjoinedKills: 0,
    joinedKills: 0, branch: {}, skipReasons: {}, wall: null };
  let won = 0, wonFull = 0, natEver = 0, natFinal = 0, table = 0, entered = 0,
    wave4 = 0, wave5 = 0, starv = 0, deaths = 0;
  const days = [];
  const deathsByCause = {};
  for (const r of rows) {
    if (r.days > 0) out.rowsValid++;
    const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 &&
      Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
    if (!storeOk(r.fieldparty) || !storeOk(r.w4dpr) || !storeOk(r.breakline) ||
        (r.tilejoin !== null && !storeOk(r.tilejoin))) out.corpusOk = false;
    won += r.won; natEver += r.nationalEver; natFinal += r.nationalFinal;
    table += r.table; entered += r.entered; starv += r.starvationDeaths; deaths += r.deathTotal;
    days.push(r.days);
    if (r.won && r.tableState && r.tableState.seat === 'full') wonFull++;
    if ((r.waveReach || 1) >= 4) wave4++;
    if ((r.waveReach || 1) >= 5) wave5++;
    for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
    const fp = r.fieldparty.meetings || [];
    const tj = (r.tilejoin || {}).meetings || [];
    const bl = (r.breakline || {}).meetings || [];
    if (fp.length !== tj.length) { out.joinErrors += Math.abs(fp.length - tj.length); }
    for (let i = 0; i < fp.length; i++) {
      const f = fp[i], t = tj[i], b = bl[i];
      if (!t) { out.joinErrors++; continue; }
      // Index-alignment audit: same call must agree on day/vid/mid.
      if (f.day !== t.day || String(f.vid) !== String(t.vid) || String(f.mid) !== String(t.mid)) out.joinErrors++;
      const leader = f.leader || {};
      const isU = f.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(f.caller) >= 0 &&
        f.wave >= 1 && f.wave <= 4 && leader.isScholar !== true;
      if (!isU) continue;
      out.uMeetings++;
      if (!((f.rounds | 0) >= 1)) continue;
      out.uFought++;
      const tileN = (t.tileAll || []).length;
      const fedN = (t.tileFed || []).length;
      const joined = !!t.joinedAllyVid;
      if (tileN > 0) out.tilePresent++;
      if (fedN > 0) out.tileFed++;
      if (t.fed) { out.fedCalls++; out.fedMates += (t.fedVids || []).length;
        for (const fm of (t.tileFed || [])) {
          if ((t.fedVids || []).indexOf(fm.vid) >= 0) {
            if ((fm.trust | 0) < 15) out.fedBelow15++;
            if (fm.stampPartner) out.fedStamp++;
          }
        }
      }
      if (!t.fed && t.skip) out.skipReasons[t.skip] = (out.skipReasons[t.skip] || 0) + 1;
      if (t.calledHelp) out.shouts++;
      if (joined) {
        out.joins++;
        out.joinedFights.push({ seed: r.seed, day: t.day, vid: t.vid, mid: t.mid, wave: t.wave,
          caller: t.caller, rounds: t.rounds, outcome: t.outcome, joinedAllyVid: t.joinedAllyVid,
          fedVids: t.fedVids, mDealt: t.mDealt, vTaken: t.vTaken, allyDealt: t.allyDealt, allyTaken: t.allyTaken });
      }
      if (t.outcome === 'vKill') {
        out.kills++;
        if (joined) out.joinedKills++;
        else if (tileN === 0) out.soloKills++;
        else out.tileUnjoinedKills++;
      }
      if (!joined && tileN === 0) out.soloFights++;
      if (!joined && tileN > 0) out.tileUnjoinedFights++;
      // Addressable pool (OFF definition, computed on both legs for
      // comparability): tile-fed mate present, hopeless trajectory,
      // intent not learn, outcome vFlee.
      if (fedN > 0 && t.everHopeless && t.intent !== 'learn' && t.outcome === 'vFlee') {
        out.addressable++;
        if (joined) out.addressableJoined++;
      }
      if (b && b.branch) out.branch[b.branch] = (out.branch[b.branch] || 0) + 1;
    }
  }
  const sortedDays = days.slice().sort((a, b) => a - b);
  out.wall = { won, wonFull, natEver, natFinal, table, entered, wave4, wave5,
    medianDays: sortedDays[Math.floor(sortedDays.length / 2)] || 0,
    meanDays: days.length ? (days.reduce((a, b) => a + b, 0) / days.length) : 0,
    starv, deaths, deathsByCause, days: days };
  out.joinedKillRate = out.joins ? out.joinedKills / out.joins : null;
  out.soloKillRate = out.soloFights ? out.soloKills / out.soloFights : null;
  out.tileUnjoinedKillRate = out.tileUnjoinedFights ? out.tileUnjoinedKills / out.tileUnjoinedFights : null;
  out.killRate = out.uFought ? out.kills / out.uFought : null;
  return out;
}

function fmtRate(x) { return (x === null || x === undefined) ? 'n/a' : (x * 100).toFixed(1) + '%'; }

function main() {
  const off = census(loadLeg(OFFDIR), 'off');
  const on = census(loadLeg(ONDIR), 'on');
  console.log('=== sim-tilejoin-a OFF vs ON (universe U, fought) ===');
  for (const c of [off, on]) {
    console.log(`--- ${c.leg}: rows=${c.rowsValid}/${c.rows} corpusOk=${c.corpusOk} joinErrors=${c.joinErrors}`);
    console.log(`  U meetings=${c.uMeetings} fought=${c.uFought} tilePresent=${c.tilePresent} tileFed>0=${c.tileFed} fedCalls=${c.fedCalls} fedMates=${c.fedMates} fedBelow15=${c.fedBelow15} fedStampPartner=${c.fedStamp}`);
    console.log(`  shouts=${c.shouts} joins=${c.joins} joinedKills=${c.joinedKills} soloFights=${c.soloFights} soloKills=${c.soloKills} tileUnjoinedFights=${c.tileUnjoinedFights} tileUnjoinedKills=${c.tileUnjoinedKills}`);
    console.log(`  kill rates: joined=${fmtRate(c.joinedKillRate)} solo=${fmtRate(c.soloKillRate)} tileUnjoined=${fmtRate(c.tileUnjoinedKillRate)} overall=${fmtRate(c.killRate)}`);
    console.log(`  addressable pool=${c.addressable} addressableJoined=${c.addressableJoined}`);
    console.log(`  break lines (fought U): ${JSON.stringify(c.branch)}`);
    console.log(`  skip reasons (fought U, unfed): ${JSON.stringify(c.skipReasons)}`);
    const w = c.wall;
    console.log(`  WALL: won=${w.won} (full=${w.wonFull}) natEver=${w.natEver} natFinal=${w.natFinal} table=${w.table} entered=${w.entered} wave4=${w.wave4} wave5=${w.wave5} median=${w.medianDays} starv=${w.starv} deaths=${w.deaths}`);
  }
  console.log('--- joined fights (ON) ---');
  for (const j of on.joinedFights) console.log(`  s${j.seed} d${j.day} ${j.vid} vs ${j.mid} w${j.wave} ${j.caller} r${j.rounds} ${j.outcome} ally=${j.joinedAllyVid} dealt=${j.mDealt} taken=${j.vTaken} allyDealt=${j.allyDealt} allyTaken=${j.allyTaken}`);
  // Judged legs (prereg thresholds; see evidence/2026-10-29/sim-tilejoin-a-prereg.md).
  const legs = [];
  const cov = (c) => c.rowsValid === 8 && c.corpusOk && c.joinErrors === 0 && c.uFought >= 50;
  legs.push(['COVERAGE-OFF', cov(off)]);
  legs.push(['COVERAGE-ON', cov(on)]);
  legs.push(['PRIMARY-JOINS>=3', on.joins >= 3]);
  legs.push(['PRIMARY-JOINED-KILL>Solo', on.joinedKillRate !== null && on.soloKillRate !== null && on.joinedKillRate > on.soloKillRate]);
  legs.push(['GUARD-STARV<=OFF+2', on.wall.starv <= off.wall.starv + 2]);
  legs.push(['GUARD-DEATHS<=OFF+25%', on.wall.deaths <= Math.ceil(off.wall.deaths * 1.25)]);
  legs.push(['GUARD-MEDIAN>=0.8xOFF', on.wall.medianDays >= 0.8 * off.wall.medianDays]);
  legs.push(['OFF-ZERO-BASELINE', off.joins === 0 && off.shouts === 0]);
  for (const [name, ok] of legs) console.log(`LEG ${name}: ${ok ? 'PASS' : 'FAIL'}`);
  const allPass = legs.every(l => l[1]);
  console.log(allPass ? 'MACHINE-LEGS-PASS' : 'MACHINE-LEGS-FAIL');
  if (!allPass) process.exit(1);
}
main();
