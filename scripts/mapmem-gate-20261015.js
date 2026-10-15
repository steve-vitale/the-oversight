#!/usr/bin/env node
// scripts/mapmem-gate-20261015.js — the MAPMEM gate for the sim-carcasshaul
// pilot (loop B, 2026-10-15).
//
// MAPMEM=1 (default): untouched tip, the landed V1 mechanism runs.
// MAPMEM=0: deletes every mapmem* method at harness load — the landed proof
// test's PRISTINE pattern. Every consumer is feature-checked
// (game.js:6651, villager-agency.js:392, villager-objectives.js:171/245/656,
// mapmemHaulAt arrival try/catch), so the game degrades exactly to
// pre-1723aae1 behavior on the same tip. Tooling-only: no game-code change.
//
// SMOKE=1: fails loudly if the gate didn't take (wrong side's methods
// present/absent), or if the policy under test has no daily.
'use strict';

const MAPMEM_METHODS = [
  'mapmemOf', 'mapmemRemember', 'mapmemPurge', 'mapmemNoticeNode',
  'mapmemNoteKill', 'mapmemTell', 'mapmemBestHaul', 'mapmemHaulAt',
  'mapmemFoodKnown', 'mapmemMeatItem', 'mapmemSiteLabel',
];

function applyMapmemGate(Game) {
  const armed = process.env.MAPMEM !== '0';
  if (!armed) {
    for (const k of MAPMEM_METHODS) { try { delete Game[k]; } catch (e) {} }
  }
  return armed;
}

function smokeMapmem(Game, policy, label, armedOpt) {
  // armedOpt: the side this Game was actually loaded on (callers must pass
  // it — the env may have been restored after load).
  const armed = armedOpt !== undefined ? armedOpt : process.env.MAPMEM !== '0';
  const bad = [];
  if (typeof policy.daily !== 'function') bad.push(label + ': policy.daily is not a function (SMOKE: suite would run policy-less)');
  if (armed && typeof Game.mapmemBestHaul !== 'function') bad.push(label + ': MAPMEM=1 but mapmemBestHaul missing');
  if (!armed && typeof Game.mapmemBestHaul === 'function') bad.push(label + ': MAPMEM=0 but mapmemBestHaul present (gate failed)');
  if (!armed) {
    for (const k of MAPMEM_METHODS) {
      if (typeof Game[k] === 'function') { bad.push(label + ': MAPMEM=0 but ' + k + ' present'); break; }
    }
  }
  return bad;
}

module.exports = { applyMapmemGate, smokeMapmem, MAPMEM_METHODS };
