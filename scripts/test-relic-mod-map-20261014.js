#!/usr/bin/env node
// test-relic-mod-map-20261014.js — guard: every relic enhancement in
// src/data/relicEnhancements.json does something at runtime. Each id must
//   (a) produce modifiers through the REAL collectModifiers (RELIC_MOD_MAP), or
//   (b) be hand-coded in game.js (resolve, anchor), or
//   (c) be on the explicit KNOWN_UNWIRED allowlist below (open design
//       questions — the allowlist must stay honest: those ids produce nothing).
// And where an enhancement's declared effect.target has a live reader in
// src/js, the wired modifier must equal that declared effect 1:1.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./godpath/lib');
const T = K.reporter('relic-mod-map');

const HAND_CODED = ['resolve', 'anchor'];
const KNOWN_UNWIRED = {
  forest_scent: 'monster.detect_chance is the player spotting monsters; -0.08 would be a penalty',
  blood_bonded: 'abilityHook grant: no hook reads blood_bonded_trigger',
  path_attuned: 'ability.kcal_cost: no reader',
  veterans_edge: 'buildaround.charge_rate: no reader',
};

// Pre-existing aliases: wired to an equivalent live target on purpose.
const ALIASED = { ghost_weave: 'travel.encounter', trail_ghost: 'travel.encounter' };

function liveSrc() {
  const out = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.js') && !/engine[\\/](modifiers|forage)\.js$/.test(p)) out.push(fs.readFileSync(p, 'utf8'));
    }
  })(path.join(K.ROOT, 'src/js'));
  return out.join('\n');
}

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const S = globalThis.Scattering;
  const enh = K.readJSON('src/data/relicEnhancements.json');
  const game = K.readSrc('src/js/game.js');
  const src = liveSrc();
  const hasReader = (t) => new RegExp("(modTarget|resolve)\\([^)]*['\"]" + t.replace(/\./g, '\\.') + "['\"]").test(src);

  for (const sid of HAND_CODED) {
    T.ok(`${sid}: hand-coded hook in game.js`, game.includes(`includes('${sid}')`));
  }
  const relicMods = (eid) => {
    const sch = { abilities: [], backgroundAbilities: [], synergies: [], equipped: {},
      inventory: [{ name: 'probe', bonded: true, enhancements: [eid] }] };
    return S.modifiers.collectModifiers(sch, Game.data.abilities, Game.data.synergies)
      .filter(m => String(m.source || '').startsWith('relic:'));
  };
  for (const e of enh) {
    const mods = relicMods(e.id);
    if (KNOWN_UNWIRED[e.id]) {
      T.ok(`${e.id}: allowlisted unwired, and produces nothing`, mods.length === 0, mods.length + ' mods');
      continue;
    }
    if (HAND_CODED.includes(e.id)) continue;
    T.ok(`${e.id}: produces a runtime modifier`, mods.length > 0);
    const ef = e.effect || {};
    if (ALIASED[e.id]) {
      T.ok(`${e.id}: wired to its alias ${ALIASED[e.id]}`, mods.length > 0 && mods[0].target === ALIASED[e.id]);
    } else if (ef.target && hasReader(ef.target)) {
      const m = mods[0] || {};
      T.ok(`${e.id}: wired 1:1 with declared ${ef.target}`,
        mods.length === 1 && m.target === ef.target && m.op === ef.op && m.value === ef.value,
        JSON.stringify(mods.map(x => [x.target, x.op, x.value])));
    }
  }
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
