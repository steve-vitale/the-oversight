// Sprite validity net (2026-10-14 sprite audit, evidence/2026-10-14/sprite-audit.md).
//
//   1. Every sprite string in sprites.js (and godhood MYTHIC_SPRITES, and a
//      spread of generated villagers) is well-formed SVG: one <svg> root with
//      viewBox "0 0 32 32", balanced tags, quoted attributes, and no
//      NaN / undefined / null leaking out of template maths.
//   2. Everything the game draws resolves:
//      - every plants.json species -> its OWN specific sprite through its taxon
//        chain (no plant falls back to generic_plant any more), and its
//        category node (taxon[1], shown by Examine) has a sprite;
//      - every monsters.json id -> distinct calm + aggro sprites;
//      - every items.json id -> its own sprite, or the documented UNKNOWN_ITEM
//        parcel (itemSprite fallback); the parcel count is reported.
//
// sprites.js / godhood.js are DOM-free IIFEs on globalThis, but sim-harness
// deliberately excludes sprites.js, so they are run in a fresh vm context.
// Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { ROOT } = require('./sim-harness');

function loadInto(ctx, rel) { vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel }); }
const ctx = { console };
ctx.globalThis = ctx;
vm.createContext(ctx);
loadInto(ctx, 'src/js/sprites.js');
loadInto(ctx, 'src/js/godhood.js');
const Sp = ctx.Scattering.Sprites;
const MYTH = ctx.Scattering.Godhood.MYTHIC_SPRITES;
const data = n => { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', n + '.json'), 'utf8')); return Array.isArray(j) ? j : (j[n] || Object.values(j)); };

let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) pass++; else { fail++; console.log('FAIL:', name, detail || ''); } };

// --- 1. well-formed SVG -----------------------------------------------------
function svgProblem(s) {
  if (typeof s !== 'string' || !s) return 'empty';
  if (/NaN|undefined|null|\[object/.test(s)) return 'NaN/undefined/null in markup';
  const t = s.trim();
  const root = t.match(/^<svg\b([^>]*)>/);
  if (!root) return 'does not start with <svg>';
  if (!/\bviewBox="0 0 32 32"/.test(root[1])) return 'root viewBox is not "0 0 32 32"';
  if (!t.endsWith('</svg>')) return 'does not end with </svg>';
  const body = t.replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  let m, last = 0, roots = 0;
  while ((m = tagRe.exec(body))) {
    const between = body.slice(last, m.index);
    if (/[<>]/.test(between)) return 'malformed tag near: ' + between.slice(0, 40);
    last = tagRe.lastIndex;
    const [, close, name, , selfClose] = m;
    if (close) { if (stack.pop() !== name) return 'unbalanced </' + name + '>'; }
    else if (!selfClose) { if (!stack.length && ++roots > 1) return 'more than one root'; stack.push(name); }
  }
  if (/[<>]/.test(body.slice(last))) return 'trailing malformed markup';
  if (stack.length) return 'unclosed <' + stack.join('><') + '>';
  // numeric attributes must be numbers
  const numAttr = /\s(cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|stroke-width|opacity|fill-opacity)="([^"]*)"/g;
  while ((m = numAttr.exec(body))) if (!/^-?\d*\.?\d+(e-?\d+)?%?$/.test(m[2])) return `${m[1]}="${m[2]}" is not a number`;
  const dAttr = /\sd="([^"]*)"/g;
  while ((m = dAttr.exec(body))) if (/[^MmLlHhVvCcSsQqTtAaZz0-9eE.,\s-]/.test(m[1])) return 'bad path data: ' + m[1].slice(0, 40);
  return null;
}

const src = fs.readFileSync(path.join(ROOT, 'src/js/sprites.js'), 'utf8');
const reg = src.slice(src.indexOf('const SPRITES = {'), src.indexOf('const CHAINS'));
const ids = [...reg.matchAll(/^\s+([a-z0-9_]+):\s*`/gm)].map(x => x[1]);
check('sprite registry is non-trivial', ids.length > 250, ids.length);
check('sprite ids are unique', new Set(ids).size === ids.length);
for (const id of ids) { const p = svgProblem(Sp.get(id)); check('sprite ' + id, !p, p); }
for (const [id, s] of Object.entries(MYTH)) { const p = svgProblem(s); check('mythic ' + id, !p, p); }
const unknown = Sp.itemSprite('__no_such_item__', false);
check('UNKNOWN_ITEM parcel', !svgProblem(unknown), svgProblem(unknown));

// villagers: every tone x gender x age band x echo, plus equipment layers
const tones = ['fair', 'light', 'tan', 'brown', 'dark', 'deep', undefined];
const echoes = [null, 'landlord', 'heckler', 'paparazzo', 'union_rep', 'moderator', 'warranty_caller', 'understudy'];
const eqs = [{}, { weapon: { wkind: 'spear' } }, { weapon: { wkind: 'blade' }, torso: { armorTier: 'medium' } }, { weapon: { wkind: 'bow' }, head: { headKind: 'pot' } },
  { weapon: { wkind: 'axe' }, torso: { armorTier: 'heavy' }, hands: {} }, { torso: { fullSet: true } }, { weapon: { wkind: 'blunt' }, feet: {}, head: { headKind: 'cap' } }, { weapon: { wkind: 'other' }, torso: { armorTier: 'light' }, head: {} }];
let vn = 0, vbad = 0;
for (const skinTone of tones) for (const gender of ['m', 'f', 'x']) for (const age of [17, 35, 72]) for (const echo of echoes) {
  const equipped = eqs[vn % eqs.length];
  const v = { id: 'v' + vn, skinTone, gender, age, clothing: ['outdoor', 'casual', 'bright', 'workwear'][vn % 4], equipped };
  if (echo) v.echo = echo;
  vn++;
  const p = svgProblem(Sp.villagerSprite(v));
  if (p) { vbad++; if (vbad < 5) check('villager ' + JSON.stringify(v), false, p); }
}
check(`villagers valid (${vn} generated)`, vbad === 0, vbad + ' bad');
check('villager with no input still draws', !svgProblem(Sp.villagerSprite()));

// --- 2. everything the game draws resolves ------------------------------------
const plants = data('plants');
// in game, chainFor reads plants.json `taxon` through Game.data
ctx.Scattering.Game = { data: { plants } };
for (const p of plants) {
  const chain = Sp.chainFor(p.id);
  check(p.id + ' has a taxon chain', Array.isArray(chain) && chain.length === 3, JSON.stringify(chain));
  if (!chain) continue;
  const own = Sp.get(chain[2]);
  check(p.id + ' has its own sprite (' + chain[2] + ')', !!own);
  check(p.id + ' resolves to its own sprite at codex depth', Sp.plantSprite(p.id, 2, 'plant') === own);
  check(p.id + ' category sprite (' + chain[1] + ')', !!Sp.get(chain[1]));
  check(p.id + ' unknown depth still draws', !!Sp.plantSprite(p.id, 0, 'plant'));
}
const mons = data('monsters');
for (const m of mons) {
  const c = Sp.monsterSprite(m.id, false), a = Sp.monsterSprite(m.id, true);
  check(m.id + ' calm sprite', !!c);
  check(m.id + ' aggro sprite', !!a);
  check(m.id + ' calm != aggro', c !== a);
}
const items = data('items');
let own = 0; const parcels = [];
for (const it of items) {
  const s = Sp.itemSprite(it.id, true);
  check(it.id + ' item draws', !!s);
  if (s === unknown) parcels.push(it.id); else own++;
}
check('items never drawn as unknown when lumped', Sp.itemSprite('lighter', false) === unknown);
// the 2026-10-14 audit redrew these; they must keep their own art
for (const id of ['crossbow', 'crowbar', 'dried_apples', 'duffel_bag', 'field_dressing_kit', 'field_sutures', 'fishing_line', 'hand_drill', 'hatchet', 'knife_roll', 'machete', 'rain_shell', 'tinder_bundle', 'trail_mix', 'whetstone']) {
  check(id + ' keeps its own art', Sp.itemSprite(id, true) !== unknown);
}
// lookalike pair: elderberry (flat umbel) and pokeweed (hanging magenta raceme) must not share art
check('elderberry and pokeweed are distinct sprites', Sp.get('elderberry') !== Sp.get('pokeweed') && /#a8306a|#c0307a/.test(Sp.get('pokeweed')));

console.log(`items: ${own} own sprites, ${parcels.length} use the documented UNKNOWN_ITEM parcel`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
