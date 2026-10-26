// test-journey-deepening-r49-20261025.js -- proof for the R49 HOLDER-TRACE run.
// This run changes ZERO src/js: the proof is (1) a game-level regression
// guard that r44 fix 2 still holds on this base (tree deadfall yields bark,
// brush deadfall does not), (2) unit proof that the armorWantsVine
// policy gate (scripts/policies/competent.js) fires exactly on the armor
// need and is OFF by default, (3) unit proof that the new holder map
// (armorLocationMap / holderMapDiff in the r49 driver) lands counts in
// the right locations and diffs cleanly, and (4) harness proof that the
// seek engages in a smoke run (seek counter > 0), the craft diag cap is
// gone (diag entries > 40 on a 45-day smoke), bark still banks, and the
// holder trace records makes/deltas deterministically — plus a determinism
// re-run and an OFF control (seek disabled => counter 0).
// The smoke runs here ARE the prereg pilot (seed 99, DAYCAP=45): if the
// pilot gates fail, the pilot gate has fired and the main run must NOT
// start. Carried gates: zero 'forage'-tagged attempts, zero 'no-tree'
// preforage attempts (wood-positive gate took). FAIL, do not run the panel.
// Usage: node scripts/test-journey-deepening-r49-20261025.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-25');
const SEED = 99;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const matCount = (Game, arr, mat) => (arr || []).filter(i => i.material === mat).reduce((t, i) => t + (i.units || 0), 0);
const packMats = (Game) => ({ bark: matCount(Game, Game.state.scholar.inventory, 'bark'), branch: matCount(Game, Game.state.scholar.inventory, 'branch') });

(async () => {
  // ============ P1: r44 fix 2 still holds on this base ============
  {
    const { Game } = await loadGame({ seed: 54321, mode: 'r49-p1' });
    await setupGame(Game);
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    const mx = Game.state.scholar.mx ?? 4, my = Game.state.scholar.my ?? 4;
    const findCell = (wanted) => {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const cx = mx + dx, cy = my + dy;
        if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
        if (detail[cy] && wanted.includes(detail[cy][cx])) return [cx, cy];
      }
      return null;
    };
    let tc = findCell(['tree', 'bigtree']);
    if (!tc) {
      const cx = Math.min(8, mx + 1), cy = my;
      detail[cy][cx] = 'tree';
      const again = Game.genDetail(Game.map.px, Game.map.py);
      if (again[cy] && again[cy][cx] === 'tree') tc = [cx, cy];
    }
    ok('P1 adjacent tree cell available', !!tc, `mx=${mx} my=${my}`);
    if (tc) {
      const before = packMats(Game);
      Game.gatherFallen(tc[0], tc[1]);
      const after = packMats(Game);
      ok('P1 tree deadfall yields branches', after.branch > before.branch, `branch ${before.branch}->${after.branch}`);
      ok('P1 tree deadfall yields bark strips', after.bark > before.bark, `bark ${before.bark}->${after.bark}`);
      ok('P1 bark gained equals branches gained', (after.bark - before.bark) === (after.branch - before.branch), `dBark=${after.bark - before.bark} dBranch=${after.branch - before.branch}`);
    }
    const detail2 = Game.genDetail(Game.map.px, Game.map.py);
    let bc = null;
    for (let dy = -1; dy <= 1 && !bc; dy++) for (let dx = -1; dx <= 1 && !bc; dx++) {
      if (!dx && !dy) continue;
      const cx = mx + dx, cy = my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      if (detail2[cy] && (detail2[cy][cx] === 'bush' || detail2[cy][cx] === 'thicket')) bc = [cx, cy];
    }
    if (!bc) {
      const cx = Math.min(8, mx + 1), cy = Math.min(8, my + 1);
      detail2[cy][cx] = 'bush';
      const again = Game.genDetail(Game.map.px, Game.map.py);
      if (again[cy] && (again[cy][cx] === 'bush' || again[cy][cx] === 'thicket')) bc = [cx, cy];
    }
    ok('P1 adjacent brush cell available', !!bc);
    if (bc) {
      const before = packMats(Game);
      Game.gatherFallen(bc[0], bc[1]);
      const after = packMats(Game);
      ok('P1 brush deadfall yields NO bark', after.bark === before.bark, `bark ${before.bark}->${after.bark}`);
    }
  }

  // ============ P1b: armorWantsVine unit cases (stub Game, no game load) ============
  {
    const { armorWantsVine } = require('./policies/competent');
    const stub = (mats, barkLvl, hideLvl) => ({
      state: {
        scholar: { inventory: Object.entries(mats).map(([material, units]) => ({ material, units })) },
        codex: { recipes: { bark_armor: { level: barkLvl }, hide_armor: { level: hideLvl } } },
      },
    });
    const saved = process.env.COMPETENT_ARMOR_VINE_SEEK;
    process.env.COMPETENT_ARMOR_VINE_SEEK = '1';
    ok('P1b bark path fires (bark 3, vine 0, lvl 1)', armorWantsVine(stub({ bark: 3 }, 1, 0), {}) === true);
    ok('P1b bark path fires (bark 3, vine 1, lvl 1)', armorWantsVine(stub({ bark: 3, vine: 1 }, 1, 0), {}) === true);
    ok('P1b bark path stops at vine 2', armorWantsVine(stub({ bark: 3, vine: 2 }, 1, 0), {}) === false);
    ok('P1b bark path needs bark 3', armorWantsVine(stub({ bark: 2, vine: 0 }, 1, 0), {}) === false);
    ok('P1b bark path needs level >= 1', armorWantsVine(stub({ bark: 3, vine: 0 }, 0, 0), {}) === false);
    ok('P1b hide path fires (hide 2, vine 0, lvl 1)', armorWantsVine(stub({ hide: 2 }, 0, 1), {}) === true);
    ok('P1b hide path stops at vine 1', armorWantsVine(stub({ hide: 2, vine: 1 }, 0, 1), {}) === false);
    ok('P1b hide path needs hide 2', armorWantsVine(stub({ hide: 1 }, 0, 1), {}) === false);
    process.env.COMPETENT_ARMOR_VINE_SEEK = '';
    ok('P1b env OFF disables the seek', armorWantsVine(stub({ bark: 3 }, 1, 0), {}) === false);
    delete process.env.COMPETENT_ARMOR_VINE_SEEK;
    ok('P1b env unset disables the seek', armorWantsVine(stub({ bark: 3 }, 1, 0), {}) === false);
    if (saved === undefined) delete process.env.COMPETENT_ARMOR_VINE_SEEK;
    else process.env.COMPETENT_ARMOR_VINE_SEEK = saved;
  }

  // ============ P1c: holder-map unit cases (stub game, no game load) ============
  {
    const { armorLocationMap, holderMapDiff } = require('./journey-deepening-r49-20261025');
    const stub = (over) => Object.assign({
      villagerId: 'v_scholar',
      displayName: (vid) => ({ v_scholar: 'Scholar', v_elena: 'Elena' }[vid] || vid),
      getPerson: (vid) => ({ v_elena: { dead: false, items: [{ itemId: 'bark_armor', units: 1 }], equipped: { torso: { itemId: 'bark_armor' } } } }[vid] || {}),
      state: {
        scholar: { inventory: [{ itemId: 'bark_armor', units: 1 }], equipped: { torso: { itemId: 'flannel_shirt' } } },
        village: { pantry: [{ itemId: 'hide_armor', units: 1 }], stash: { items: [] }, roster: ['v_scholar', 'v_elena'] },
      },
    }, over || {});
    const m0 = armorLocationMap(stub());
    ok('P1c scholar pack bark lands in scholarPack', m0.scholarPack.bark === 1 && m0.scholarPack.hide === 0, JSON.stringify(m0.scholarPack));
    ok('P1c scholar torso reads flannel_shirt', m0.scholarTorso === 'flannel_shirt', String(m0.scholarTorso));
    ok('P1c pantry hide lands in pantry', m0.pantry.hide === 1 && m0.pantry.bark === 0, JSON.stringify(m0.pantry));
    ok('P1c villager pack + torso land on Elena', (() => { const el = m0.villagers.find(v => v.vid === 'v_elena'); return !!el && el.name === 'Elena' && el.pack.bark === 1 && el.torso === 'bark_armor'; })(), JSON.stringify(m0.villagers));
    ok('P1c empty world maps all-zero', (() => { const z = armorLocationMap(stub({ state: { scholar: {}, village: {} } })); return z.scholarPack.bark === 0 && z.pantry.hide === 0 && z.villagers.length === 0; })(), '');
    ok('P1c unloaded game maps all-zero without throwing', (() => { try { const z = armorLocationMap(null); return z.scholarPack.bark === 0 && z.villagers.length === 0; } catch (e) { return false; } })(), '');
    const m1 = armorLocationMap(stub());
    ok('P1c map JSON stable across two reads', JSON.stringify(m0) === JSON.stringify(m1), '');
    const moved = armorLocationMap(stub({ state: { scholar: { inventory: [], equipped: { torso: { itemId: 'flannel_shirt' } } }, village: { pantry: [{ itemId: 'hide_armor', units: 1 }], stash: { items: [] }, roster: ['v_scholar', 'v_elena'] } } }));
    const diff = holderMapDiff(m0, moved);
    ok('P1c diff names scholarPack on a pack move', diff.includes('scholarPack') && !diff.includes('pantry'), JSON.stringify(diff));
    ok('P1c diff identical maps is empty', holderMapDiff(m0, m1).length === 0, JSON.stringify(holderMapDiff(m0, m1)));
    ok('P1c diff ignores name reveals (knowledge-gating, not armor)', (() => { const renamed = armorLocationMap(stub()); renamed.villagers.find(v => v.vid === 'v_elena').name = 'Elena Revealed'; return holderMapDiff(m0, renamed).length === 0; })(), '');
    ok('P1c diff ignores non-armor clothing swaps (camo_jacket)', (() => { const dressed = armorLocationMap(stub()); dressed.villagers.push({ vid: 'v_riley', name: 'Riley', pack: { bark: 0, hide: 0 }, torso: 'camo_jacket' }); const undressed = armorLocationMap(stub()); undressed.villagers.push({ vid: 'v_riley', name: 'Riley', pack: { bark: 0, hide: 0 }, torso: null }); return holderMapDiff(undressed, dressed).length === 0; })(), '');
    ok('P1c diff fires when a torso gains bark_armor', (() => { const bare = armorLocationMap(stub()); bare.villagers.push({ vid: 'v_riley', name: 'Riley', pack: { bark: 0, hide: 0 }, torso: null }); const armored = armorLocationMap(stub()); armored.villagers.push({ vid: 'v_riley', name: 'Riley', pack: { bark: 0, hide: 0 }, torso: 'bark_armor' }); return holderMapDiff(bare, armored).includes('villager:v_riley'); })(), '');
    ok('P1c diff fires when a bark-wearer vanishes (death with armor)', (() => { const alive = armorLocationMap(stub()); alive.villagers.push({ vid: 'v_riley', name: 'Riley', pack: { bark: 0, hide: 0 }, torso: 'bark_armor' }); const gone = armorLocationMap(stub()); return holderMapDiff(alive, gone).includes('villager:v_riley'); })(), '');
    ok('P1c diff ignores a plain death (no armor carried)', (() => { const alive = armorLocationMap(stub()); alive.villagers.push({ vid: 'v_riley', name: 'Riley', pack: { bark: 0, hide: 0 }, torso: null }); const gone = armorLocationMap(stub()); return holderMapDiff(alive, gone).length === 0; })(), '');
  }

  // ============ P2/P3: smoke runs (pilot + control + determinism) ============
  const jsonFp = path.join(EVIDIR, `journey-deepening-r49-seed${SEED}.json`);
  const txRe = new RegExp(`^journey-deepening-r49-transcript-${SEED}-day\\d+\\.txt$`);
  function cleanup() {
    try { fs.unlinkSync(jsonFp); } catch (e) {}
    try { for (const f of fs.readdirSync(EVIDIR)) if (txRe.test(f)) { try { fs.unlinkSync(path.join(EVIDIR, f)); } catch (e) {} } } catch (e) {}
  }
  function runOnce(extraEnv) {
    cleanup();
    execFileSync('node', [path.join(ROOT, 'scripts', 'journey-deepening-r49-20261025.js')], {
      cwd: ROOT,
      env: Object.assign({}, process.env, { POLICY: 'competent', CRAFT_ARMOR: '1', PREP_PULL: '1', SEEDS: String(SEED), DAYCAP: '45' }, extraEnv),
      stdio: 'pipe', timeout: 600000,
    });
    return JSON.parse(fs.readFileSync(jsonFp, 'utf8'));
  }
  console.log('run 1 (seed 99, DAYCAP=45, GATHER_DEADFALL=1, SEEK=1) — PILOT...');
  const a = runOnce({ GATHER_DEADFALL: '1', COMPETENT_ARMOR_VINE_SEEK: '1' });
  const ga = a.armor && a.armor.gatherAttempts;
  const mf = a.armor && a.armor.matflow && a.armor.matflow.intraday;
  ok('P2 gatherOn flag true', a.armor && a.armor.gatherOn === true, JSON.stringify(a.armor && a.armor.gatherOn));
  ok('P2 gather attempts recorded', Array.isArray(ga) && ga.length > 0, `attempts=${ga && ga.length}`);
  ok('P2 preforage-tagged attempts exist', Array.isArray(ga) && ga.some(g => g.tag === 'preforage'), JSON.stringify(ga && ga.slice(0, 3)));
  ok('P2 preforage attempt actually gathered (not vacuous tags)', Array.isArray(ga) && ga.some(g => g.tag === 'preforage' && g.result === 'ok'), JSON.stringify(ga && ga.filter(g => g.tag === 'preforage').slice(0, 5)));
  ok('P2 NO forage-tagged attempts (move took)', Array.isArray(ga) && !ga.some(g => g.tag === 'forage'), JSON.stringify(ga && ga.filter(g => g.tag === 'forage').slice(0, 3)));
  ok('P2 NO no-tree preforage attempts (wood-positive gate took)', Array.isArray(ga) && !ga.some(g => g.tag === 'preforage' && g.result === 'no-tree'), JSON.stringify(ga && ga.filter(g => g.tag === 'preforage' && g.result === 'no-tree').slice(0, 3)));
  ok('P2 at least one ok gather call', Array.isArray(ga) && ga.some(g => g.result === 'ok'), JSON.stringify(ga && ga.filter(g => g.result === 'ok').slice(0, 3)));
  ok('P2 gather wrapper counted calls', mf && mf.gatherCalls > 0, `gatherCalls=${mf && mf.gatherCalls}`);
  ok('P2 gather bark actually banked (PILOT GATE)', mf && mf.gatherBarkTotal > 0, `gatherBarkTotal=${mf && mf.gatherBarkTotal}`);
  ok('P2 bark arrived somewhere in snapshots', mf && (mf.dawn.everBarkAnywhere || mf.mid.everBarkAnywhere || mf.dusk.everBarkAnywhere), JSON.stringify(mf && { dawn: mf.dawn.everBarkAnywhere, mid: mf.mid.everBarkAnywhere, dusk: mf.dusk.everBarkAnywhere }));
  ok('P2 transcripts written', Array.isArray(a.convoFiles) && a.convoFiles.length >= 1, JSON.stringify(a.convoFiles));
  const seekA = a.ctxSummary && a.ctxSummary.armorVineSeekTrips;
  const diagA = a.armor && a.armor.craftArmor && a.armor.craftArmor.diag;
  ok('P2 armor-vine seek engaged on smoke run (PILOT GATE)', typeof seekA === 'number' && seekA > 0, `armorVineSeekTrips=${seekA}`);
  ok('P2 craft diag cap gone (diag > 40 on 45-day smoke)', Array.isArray(diagA) && diagA.length > 40, `diag=${diagA && diagA.length}`);
  ok('P2 vine-gain fields present', mf && typeof mf.forageVineGainCalls === 'number' && typeof mf.thicketCalls === 'number', `vineGainCalls=${mf && mf.forageVineGainCalls} thicketCalls=${mf && mf.thicketCalls}`);
  const hd = a.armor && a.armor.holder;
  ok('P2 holder baseline present with all locations', hd && hd.baseline && hd.baseline.scholarPack && hd.baseline.pantry && hd.baseline.stash && Array.isArray(hd.baseline.villagers), JSON.stringify(hd && hd.baseline && Object.keys(hd.baseline)));
  ok('P2 holder deltas array present', hd && Array.isArray(hd.deltas), `deltas=${hd && hd.deltas && hd.deltas.length}`);
  ok('P2 holder makes array present', hd && Array.isArray(hd.makes), `makes=${hd && hd.makes && hd.makes.length}`);
  ok('P2 every smoke make lands in scholar pack (after = before + 1)', hd && hd.makes.every(mk => (mk.after.scholarPack.bark + mk.after.scholarPack.hide) === (mk.before.scholarPack.bark + mk.before.scholarPack.hide) + 1), JSON.stringify(hd && hd.makes.map(mk => ({ day: mk.day, rid: mk.rid, before: mk.before.scholarPack, after: mk.after.scholarPack }))));
  ok('P2 holder deltas carry day + changed + map', hd && hd.deltas.every(dl => typeof dl.day === 'number' && Array.isArray(dl.changed) && dl.map), JSON.stringify(hd && hd.deltas.slice(0, 2)));
  console.log('run 2 (determinism, GATHER_DEADFALL=1, SEEK=1)...');
  const b = runOnce({ GATHER_DEADFALL: '1', COMPETENT_ARMOR_VINE_SEEK: '1' });
  const mfb = b.armor && b.armor.matflow && b.armor.matflow.intraday;
  const aggOf = (m, g, s) => JSON.stringify({ fc: m && m.forageCalls, gc: m && m.gatherCalls, gb: m && m.gatherBarkTotal, ga: g, seek: s, vg: m && m.forageVineGainCalls, th: m && m.thicketCalls });
  ok('P2 gather aggregates identical across runs', aggOf(mf, ga, seekA) === aggOf(mfb, b.armor && b.armor.gatherAttempts, b.ctxSummary && b.ctxSummary.armorVineSeekTrips), `\n  run1=${aggOf(mf, ga, seekA)}\n  run2=${aggOf(mfb, b.armor && b.armor.gatherAttempts, b.ctxSummary && b.ctxSummary.armorVineSeekTrips)}`);
  ok('P2 holder trace identical across runs (read-only instrument)', JSON.stringify(a.armor && a.armor.holder) === JSON.stringify(b.armor && b.armor.holder), `run1deltas=${a.armor && a.armor.holder && a.armor.holder.deltas.length} run2deltas=${b.armor && b.armor.holder && b.armor.holder.deltas.length}`);
  console.log('run 3 (OFF control, GATHER_DEADFALL unset, SEEK unset)...');
  const c = runOnce({ GATHER_DEADFALL: '', COMPETENT_ARMOR_VINE_SEEK: '' });
  const mfc = c.armor && c.armor.matflow && c.armor.matflow.intraday;
  ok('P3 OFF control: gatherOn false', !c.armor.gatherOn, JSON.stringify(c.armor.gatherOn));
  ok('P3 OFF control: no gather attempts', c.armor.gatherAttempts === null, JSON.stringify(c.armor.gatherAttempts));
  ok('P3 OFF control: zero gather calls', mfc && mfc.gatherCalls === 0, `gatherCalls=${mfc && mfc.gatherCalls}`);
  ok('P3 OFF control: seek counter 0', (c.ctxSummary && c.ctxSummary.armorVineSeekTrips) === 0, `armorVineSeekTrips=${c.ctxSummary && c.ctxSummary.armorVineSeekTrips}`);
  cleanup();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR:', e && e.stack || e); process.exit(2); });
