#!/usr/bin/env node
// scripts/godpath/validate.js — data contract for the god-path system
// (2026-10-14 redesign: one ladder, 10 gods, 20 subclasses).
// Pure JSON checks, no game load: runs in well under a second.
//
// The contract (docs/godpath/PLAN.md "Data contract"):
//   - src/data/godpaths.json is the ONE god layer: 10 paths, 2 subclasses
//     each, one god per path (one verb, its weakness, scale text).
//   - every magic ability carries exactly one `path` and one `subclass`
//     (optional `alsoPath`); nothing carries the retired `paths` array.
//   - each subclass: one payoff (role payoff), >=2 enablers, one god tie-in,
//     all tagged with that subclass.
//   - every magic ability sits in exactly one track kit (fusion_reactor
//     excepted); every data verb (`do`) is food-powered and known.
//   - warden/trickster control changes the board (grid verbs, no +X%).
//   - godhood.json is retired; the retired Farstrider is folded into a subclass.
'use strict';
const K = require('./lib');
const T = K.reporter('godpath-validate');
const fs = require('fs');
const path = require('path');

const abilities = K.readJSON('src/data/abilities.json');
const tracks = K.readJSON('src/data/tracks.json');
const GP = K.readJSON('src/data/godpaths.json');
const paths = GP.paths || {};
const byId = Object.fromEntries(abilities.map(a => [a.id, a]));
const PATH_IDS = ['brawler', 'shieldbearer', 'hunter', 'caregiver', 'drifter',
  'explorer', 'socialite', 'survivalist', 'miser', 'forager'];
const ROSTER = {
  brawler: ['berserker', 'juggernaut'], shieldbearer: ['bulwark', 'warden'], hunter: ['stalker', 'beastmaster'],
  caregiver: ['healer', 'keeper'], drifter: ['phantom', 'trickster'], explorer: ['seer', 'cartographer'],
  socialite: ['showrunner', 'demagogue'], survivalist: ['furnace', 'undying'], miser: ['hoarder', 'dealer'],
  forager: ['gardener', 'feaster'],
};
const ROLES = ['support', 'enabler', 'payoff', 'wildcard'];
const magic = abilities.filter(a => a.lane === 'magic');
const gpSrc = K.readSrc('src/js/godpath.js');
const VERBS = (() => {
  const m = gpSrc.match(/const VERBS = \{([\s\S]*?)\n  \};/);
  return new Set(m ? [...m[1].matchAll(/^    (\w+)\(/gm)].map(x => x[1]) : []);
})();
const BOARD_VERBS = new Set(['wall', 'push', 'pull', 'swap', 'pack', 'bribe', 'blink']);

T.section('the roster (Steve 2026-10-14: "Good calls! Continue all.")');
T.ok('godpaths.json has exactly the 10 paths', PATH_IDS.every(p => paths[p]) && Object.keys(paths).length === 10,
  'have: ' + Object.keys(paths).join(','));
for (const pid of PATH_IDS) {
  const subs = Object.keys((paths[pid] || {}).subclasses || {});
  T.ok(`${pid}: subclasses ${ROSTER[pid].join(' + ')}`, JSON.stringify(subs) === JSON.stringify(ROSTER[pid]), subs.join(','));
}
T.ok('godhood.json is retired (one source of truth)', !fs.existsSync(path.join(K.ROOT, 'src/data/godhood.json')));

T.section('every magic ability: one path, one subclass');
T.ok('every ability has a valid role', abilities.every(a => ROLES.includes(a.role)),
  abilities.filter(a => !ROLES.includes(a.role)).map(a => a.id).slice(0, 8).join(','));
T.ok('nothing carries the retired `paths` array', !abilities.some(a => 'paths' in a), abilities.filter(a => 'paths' in a).map(a => a.id).join(','));
const untagged = magic.filter(a => !paths[a.path] || !((paths[a.path] || {}).subclasses || {})[a.subclass]);
T.ok(`all ${magic.length} magic abilities carry a valid path + subclass`, untagged.length === 0, untagged.map(a => a.id).join(','));
const badAlso = abilities.filter(a => a.alsoPath && (!paths[a.alsoPath] || a.alsoPath === a.path));
T.ok('alsoPath (when present) is another real path', badAlso.length === 0, badAlso.map(a => a.id).join(','));
const fewAlso = magic.filter(a => a.alsoPath).length;
T.ok('alsoPath stays rare (<= 10 shared magic abilities)', fewAlso <= 10, `${fewAlso}`);
const skillSub = abilities.filter(a => a.lane === 'skill' && a.subclass);
T.ok('skills never carry a subclass (classes are magic)', skillSub.length === 0, skillSub.map(a => a.id).join(','));

T.section('subclasses: payoff + 2 enablers + god tie-in');
for (const pid of PATH_IDS) {
  for (const sid of ROSTER[pid]) {
    const sc = ((paths[pid] || {}).subclasses || {})[sid] || {};
    const ids = [sc.payoff, ...(sc.enablers || []), sc.tie].filter(Boolean);
    const tagged = ids.every(id => byId[id] && byId[id].lane === 'magic' && byId[id].path === pid && byId[id].subclass === sid);
    const distinct = new Set(ids).size === ids.length;
    T.ok(`${pid}/${sid}: payoff ${sc.payoff} (role payoff), ${(sc.enablers || []).length} enablers, tie ${sc.tie}; all tagged ${sid}`,
      !!(byId[sc.payoff] && byId[sc.payoff].role === 'payoff' && (sc.enablers || []).length >= 2 && sc.tie && sc.tieWhy && tagged && distinct),
      `payoffRole=${(byId[sc.payoff] || {}).role} tagged=${tagged} distinct=${distinct}`);
  }
}

T.section('gods: one verb each, the weakness kept');
const godIds = PATH_IDS.map(p => ((paths[p] || {}).god || {}).id);
T.ok('ten distinct gods', new Set(godIds).size === 10 && godIds.every(Boolean), godIds.join(','));
const BANNED = [
  [/never need (food|water)/i, 'removes the need to eat'], [/don'?t need food/i, 'removes the need to eat'],
  [/auto-?win/i, 'contest auto-win'], [/instant win/i, 'contest instant win'],
  [/win [\w\/]+( [\w\/]+)? automatically/i, 'contest auto-win'], [/buy (anything \()?(even )?victory/i, 'buys victory'],
  [/can solo titans/i, 'bypasses the titan coalition gate'],
];
for (const pid of PATH_IDS) {
  const g = (paths[pid] || {}).god || {};
  const sc = g.scale || {};
  T.ok(`${pid} -> ${g.id}: one verb ("${g.verb}"), desc, cost, weakness, why, party/titan/contest/army`,
    !!(typeof g.verb === 'string' && g.verb && !/[\/;]| or /.test(g.verb) && g.desc && g.cost && g.weakness && g.why && sc.party && sc.titan && sc.contest && sc.army && g.recognition && g.mythic));
  const text = [g.desc, sc.party, sc.titan, sc.contest, sc.army].filter(Boolean).join(' ');
  const hit = BANNED.find(([re]) => re.test(text));
  T.ok(`${pid}: god text respects the constraints`, !hit, hit && `"${hit[1]}"`);
}
const far = (GP.retired || {}).farstrider;
const outcomeDeeds = PATH_IDS.map(pid => paths[pid]?.god?.deed).filter(Boolean);
T.ok('authored outcome deeds declare a wired event, dawn rule and objective', outcomeDeeds.length > 0 && outcomeDeeds.every(d => ['death_refused'].includes(d.event) && typeof d.afterDawn === 'boolean' && typeof d.hint === 'string' && d.hint.trim()));
T.ok('the leftover capstone (farstrider) is retired and folded into a subclass, with a reason',
  !!(far && far.foldedInto && paths[far.foldedInto.path] && paths[far.foldedInto.path].subclasses[far.foldedInto.subclass] && far._retired));

T.section('tracks and verbs');
const kitIds = [].concat(...Object.values(tracks.kits || {}));
const misKit = magic.filter(a => a.id !== 'fusion_reactor' && kitIds.filter(k => k === a.id).length !== 1);
T.ok('every magic ability sits in exactly one track kit (fusion_reactor excepted)', misKit.length === 0, misKit.map(a => a.id).join(','));
const acts = [];
for (const a of abilities) for (const x of (a.actions || [])) if (x.do) acts.push({ a, x });
T.ok(`every data verb is known to godpath.js (${VERBS.size} verbs)`, acts.every(({ x }) => VERBS.has(x.do)),
  acts.filter(({ x }) => !VERBS.has(x.do)).map(({ a, x }) => a.id + ':' + x.do).join(','));
T.ok('every data verb is food-powered (kcal cost)', acts.every(({ x }) => x.cost && x.cost.kcal > 0),
  acts.filter(({ x }) => !(x.cost && x.cost.kcal > 0)).map(({ a }) => a.id).join(','));
const ctl = magic.filter(a => ['warden', 'trickster'].includes(a.subclass));
const ctlBad = ctl.filter(a => (a.actions || []).some(x => x.do && !BOARD_VERBS.has(x.do))
  || (a.modifiers || []).some(m => /^combat\./.test(m.target)));
T.ok('warden/trickster control changes the board: grid verbs only, no combat +X% modifiers', ctlBad.length === 0, ctlBad.map(a => a.id).join(','));
const wardenVerbs = new Set([].concat(...magic.filter(a => a.subclass === 'warden').map(a => (a.actions || []).map(x => x.do).filter(Boolean))));
T.ok('warden shapes the board three ways (walls, pulls, pushes)', ['wall', 'pull', 'push'].every(v => wardenVerbs.has(v)), [...wardenVerbs].join(','));
T.done();
