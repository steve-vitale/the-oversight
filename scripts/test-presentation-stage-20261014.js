#!/usr/bin/env node
// test-presentation-stage-20261014.js — presentation pass B (visual identity
// + accessibility). Proves:
//   1. Game.presentationStage(): the ladder is earned on Codex depth AND days
//      survived (presentation.json), never on days alone, and never taken back.
//   2. The map palette follows the ladder (tile-scenes.js palette): earthy at
//      stage 0, the rich 2026-10-06 palette at stage 4, and the stage is in the
//      scene cache key.
//   3. The alien-script glitch: generated glyphs (zero assets), rate-limited.
//   4. Static: design tokens exist (grounded + System), no text under 12px in
//      main.css, --dim passes 4.5:1, the viewport allows pinch zoom, focus is
//      visible, titan sprites exist for every titan, and the level-up / Table
//      sheets build the new card / place-setting structure.
// Writes nothing into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./godpath/lib');
const T = K.reporter('presentation-stage');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function contrast(a, b) {
  const L = (h) => {
    const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
      .map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const la = L(a), lb = L(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const s = Game.state.scholar;
  const P = Game.data.presentation;

  // ---- 1. the ladder ----
  T.ok('presentation.json loads with 5 stages', P && Array.isArray(P.stages) && P.stages.length === 5);
  T.ok('presentationStage is a game function', typeof Game.presentationStage === 'function');
  Game.state.codex.plants = {}; Game.state.codex.monsters = {}; Game.state.codex.trees = {};
  Game.state.codex.skills = {}; Game.state.codex.abilities = {}; Game.state.codex.recipes = {}; Game.state.codex.terrain = {};
  Game.state.codex.animals = {};
  Game.state.presentation = { maxStage: 0 };
  s.day = 1;
  T.ok('a fresh run is stage 0', Game.presentationStage() === 0, Game.presentationStage());
  s.day = 200;
  T.ok('days alone never advance the ladder (not a timer)', Game.presentationStage() === 0, Game.presentationStage());
  const plantIds = Game.data.plants.map(p => p.id);
  const setDepth = (n) => {
    // n plant entries at level 1 = depth n
    Game.state.codex.plants = {};
    for (let i = 0; i < n; i++) Game.state.codex.plants[plantIds[i]] = { level: 1 };
  };
  for (const row of P.stages) {
    if (row.stage === 0) continue;
    Game.state.presentation = { maxStage: 0 };
    setDepth(row.codexDepth); s.day = row.days;
    T.ok(`stage ${row.stage} reached at depth ${row.codexDepth} + day ${row.days}`, Game.presentationStage() === row.stage, Game.presentationInfo());
    Game.state.presentation = { maxStage: 0 };
    setDepth(row.codexDepth); s.day = Math.max(0, row.days - 1);
    T.ok(`stage ${row.stage} NOT reached a day short`, Game.presentationStage() === row.stage - 1, Game.presentationInfo());
    Game.state.presentation = { maxStage: 0 };
    setDepth(Math.max(0, row.codexDepth - 1)); s.day = row.days;
    T.ok(`stage ${row.stage} NOT reached one codex step short`, Game.presentationStage() < row.stage, Game.presentationInfo());
  }
  Game.state.presentation = { maxStage: 0 };
  setDepth(P.stages[3].codexDepth); s.day = P.stages[3].days;
  T.ok('stage 3 earned', Game.presentationStage() === 3);
  Game.state.codex.plants = {}; // knowledge lost (a reset codex) — the interface stays
  T.ok('a reached stage is never taken back in the run', Game.presentationStage() === 3, Game.presentationInfo());
  T.ok('codexDepth counts plant levels (capped at 4 each)', (() => { Game.state.codex.plants = { [plantIds[0]]: { level: 9 }, [plantIds[1]]: { level: 0 } }; return Game.codexDepth() === 4; })(), Game.codexDepth());
  T.ok('a level-0 (tasted, unknown) plant is not depth', (() => { Game.state.codex.plants = { [plantIds[1]]: { level: 0 } }; return Game.codexDepth() === 0; })());

  // ---- 3. alien script ----
  const g1 = Game.alienScript(40, 7), g2 = Game.alienScript(40, 7);
  T.ok('alien script is generated and deterministic per seed', g1 === g2 && Array.from(g1).length === 40, g1);
  T.ok('alien script contains no ASCII letters (untranslated)', !/[A-Za-z0-9]/.test(g1), g1);
  const realRandom = Math.random;
  Math.random = () => 0; // the chance roll always passes
  Game._lastGlitchAt = null;
  const first = Game.glitchDue(100000);
  const second = Game.glitchDue(100000 + 1000);
  const later = Game.glitchDue(100000 + (P.glitch.minGapMs || 40000) + 1);
  Math.random = () => 0.99; // the roll fails
  const unlucky = Game.glitchDue(100000 + 3 * (P.glitch.minGapMs || 40000));
  Math.random = realRandom;
  T.ok('glitch is rate-limited: one, then none inside minGapMs, then one again', first && !second && later, { first, second, later });
  T.ok('glitch is occasional: a failed roll plays nothing', !unlucky);

  // ---- 2. map palette ladder (DOM-free modules, loaded in this process) ----
  globalThis.Scattering = globalThis.Scattering || {};
  require(path.join(ROOT, 'src/js/tile-scenes.js'));
  require(path.join(ROOT, 'src/js/sprites.js'));
  const TS = globalThis.Scattering.TileScenes;
  T.ok('TileScenes.palette exists', TS && typeof TS.palette === 'function');
  const p0 = TS.palette('meadow', 0), p4 = TS.palette('meadow', 4), p2 = TS.palette('meadow', 2);
  T.ok('stage 4 meadow is the rich 2026-10-06 palette', p4.base === '#7cbd6b', p4);
  T.ok('stage 0 meadow is earthy (darker, less saturated)', p0.base !== p4.base && parseInt(p0.base.slice(1, 3), 16) < parseInt(p4.base.slice(1, 3), 16), p0);
  T.ok('stage 2 sits between', p2.base !== p0.base && p2.base !== p4.base, p2);
  const tsSrc = read('src/js/tile-scenes.js');
  T.ok('the presentation stage is part of the scene cache key', /'s' \+ stageOf\(g\)/.test(tsSrc));

  // ---- 4. static checks ----
  const css = read('src/css/main.css');
  const root = (css.match(/:root \{[\s\S]*?\n\}/) || [''])[0];
  for (const tok of ['--bg', '--ink', '--dim', '--acc', '--amber', '--ok', '--danger', '--panel', '--cell-grass', '--font-hand',
    '--sys', '--sys-cyan', '--sys-ink', '--sys-edge', '--sys-glow-rgb', '--sys-glass', '--sys-radius', '--focus']) {
    T.ok('token ' + tok + ' is defined on :root', new RegExp('\\s' + tok + ':').test(root));
  }
  const tiny = css.match(/font-size:\s*(?:[0-9]|1[01])(?:\.\d+)?px/g) || [];
  T.ok('main.css has no text under 12px', tiny.length === 0, tiny);
  const dim = (root.match(/--dim:\s*(#[0-9a-fA-F]{6})/) || [])[1];
  const bg = (root.match(/--bg:\s*(#[0-9a-fA-F]{6})/) || [])[1];
  const bg2 = (root.match(/--bg2:\s*(#[0-9a-fA-F]{6})/) || [])[1];
  T.ok('--dim passes 4.5:1 on --bg and --bg2', dim && contrast(dim, bg) >= 4.5 && contrast(dim, bg2) >= 4.5, dim && [contrast(dim, bg), contrast(dim, bg2)]);
  T.ok('focus is visible for keyboard users', /:focus-visible\s*\{[^}]*outline/.test(css));
  T.ok('System overlay uses the too-perfect radius', /body\.system-live \.sheet \{[^}]*border-radius: var\(--sys-radius\)/.test(css));
  T.ok('marginalia use the handwriting stack', /\.hand[^{]*\{[^}]*font-family: var\(--font-hand\)/.test(css) && /--font-hand:[^;]*cursive/.test(root));
  T.ok('the alien glitch honours reduced motion', /prefers-reduced-motion: reduce\) \{ \.alien-glitch \{ display: none/.test(css));
  T.ok('titan CSS no longer claims "never bigger"', !/never bigger/.test(css));
  T.ok('body stage-0..4 classes have rules', [0, 1, 2, 3, 4].every(i => css.indexOf('body.stage-' + i) >= 0));

  const html = read('index.html');
  const vp = (html.match(/<meta name="viewport" content="([^"]+)"/) || [])[1] || '';
  T.ok('viewport allows pinch zoom', vp && !/user-scalable=no/.test(vp) && !/maximum-scale=1(\.0)?\b/.test(vp), vp);
  T.ok('presentation.js is loaded', /src\/js\/presentation\.js/.test(html));

  const Spr = globalThis.Scattering.Sprites;
  const titans = Object.keys(Game.data.titans).filter(k => k.charAt(0) !== '_');
  for (const id of titans) {
    const svg = Spr.titanSprite(id);
    T.ok('titan sprite exists: ' + id, !!svg && /viewBox="0 0 32 32"/.test(svg) && /class="sprite titan-sprite"/.test(svg));
    const mid = Game.data.titans[id].monster;
    if (mid) T.ok('titan sprite resolves from its monster id: ' + mid, Spr.titanSprite(mid) === svg);
  }

  const app = read('src/js/app.js');
  const lu = app.slice(app.indexOf('function levelUpSheet('), app.indexOf('function replaceSheet('));
  T.ok('level-up builds three cards (lu-card via levelUpCardHTML)', /levelUpCardHTML\(c, i, icon, full\)/.test(lu) && /class="lu-card" data-sheetpick=/.test(lu));
  T.ok('level-up card shows icon, role, kcal cost and the swap target', /lu-icon/.test(lu) && /slotRole/.test(lu) && /kcal\/day/.test(lu) && /lu-tag swap/.test(lu));
  T.ok('level-up path tag only once the class is recognised', /godpathClass\('player'\)/.test(lu));
  const tb = app.slice(app.indexOf('function tableSheet('), app.indexOf('function abilitySheet('));
  T.ok('the Table is laid as a table with place settings', /tbl-board/.test(tb) && /tbl-setting" data-sheetpick=/.test(tb) && /tbl-ring/.test(tb));
  T.ok('sheet picks reuse the sheet button handlers', /\[data-sheetbtn\], \[data-sheetpick\]/.test(app));
  T.ok('the titan arena no longer indexes past the 9x9 node', /cells\[cy\] && cells\[cy\]\[cx\] !== undefined/.test(app));
  T.ok('fog is a textured tile, not a blank square', /class="fogtile/.test(app));
  T.ok('body gets the stage class', /classList\.toggle\('stage-' \+ i, i === stage\)/.test(app));

  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
