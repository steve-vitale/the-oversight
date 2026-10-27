// removalsite-diag — removal-site recorder for journey-scale r42 (lane A).
//
// QUESTION (from journey-scale r41's open items): WHERE does a vanished
// wave-4 spawn go? The spawnfate census proves a spawn was seen and then
// was gone, but records no removal. This recorder wraps
// Game.removeWorldMonster AFTER setupGame and logs EVERY call with:
//   day, monster id, spawn seq (when spawnsrc-diag tagged it), wave,
//   tile, hp, lingering/titan flags, player distance, whether a tb
//   fight is active, and whether the removed monster is one of the
//   fight's monsters (fight-lift vs bystander-lift), plus the first
//   game.js stack frame so an ambient removal names its call site.
//
// MECHANISM, READ FROM CODE (never invented):
//   - Game.removeWorldMonster(m) splices m out of Game.worldMonsters()
//     (src/js/game.js removeWorldMonster, ~19477). Every engine removal
//     path in game.js calls it (fight lift at startCombat ~33081,
//     ambient removals, lingerer sorties, campaign clears), so wrapping
//     this one method sees every removal — except a splice that bypasses
//     the method, which the analyzer reports as an unclassified removal
//     rather than silently absorbing.
//   - startCombat lifts this.playerMonster() on EVERY tb fight
//     (startCombat ~33081) and records it as tbfight.worldOrigin ONLY
//     when titan/lingering (~33091). tbEnd restores worldOrigin ONLY
//     when result !== 'won' (~43563). So a bystander standing on the
//     player tile during a contest fight is lifted at start and never
//     restored on 'won' — r41's gauntlet-day mechanism, which this
//     recorder is built to confirm or refute with rows, not code-reads.
//   - A wild (non-titan, non-lingering) monster lifted for a fight it
//     IS the monster of melts away by design ("they melt back into the
//     wilds", tbEndCheck) — fight-lift + id-in-fight is NOT a bug.
//     fight-lift + id-NOT-in-fight IS the bystander class.
//
// OBSERVATIONAL ONLY. The wrapper calls the original with the original
// this/args and returns its value untouched; recording errors are
// counted in errs/errors and never thrown into the engine. No RNG is
// drawn, no game state is written (the row store lives outside Game).
// Unset REMOVALSITE delegates to a no-op install (store.installed false,
// zero rows) so the driver can install unconditionally.
//
// KNOWN LIMITS (stated, not hidden):
//   - Monsters removed during setupGame (before install) have no rows;
//     the band's spawns of interest are born during runDays, after install.
//   - A monster removed and re-added as the SAME object (tb restore)
//     produces one removal row and no birth row; the analyzer treats a
//     removal followed by a later census sighting as a lift, not a death.
//   - Stack frames give file:line only; the analyzer maps a game.js line
//     to its enclosing function by source grep at analysis time, never
//     by guessing at record time.
'use strict';

const MAX_ROWS = 20000;

function layerOn() { try { return process.env.REMOVALSITE === '1'; } catch (e) { return false; } }

function newStore() {
  return { rows: [], errs: 0, errors: [], overflow: 0, installed: false };
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, m) {
  try { if (m && m.wave) return m.wave; } catch (e) {}
  try { if (Game.crisisWaveOf) return Game.crisisWaveOf(m) || 1; } catch (e) {}
  return 1;
}
function stackHint() {
  try {
    const st = new Error('removalsite').stack || '';
    const frames = st.split('\n').slice(2, 6).map(s => s.trim().slice(0, 160));
    const gameFrame = frames.find(f => f.indexOf('game.js') >= 0) || null;
    return { gameFrame, frames };
  } catch (e) { return { gameFrame: null, frames: [] }; }
}

function installRemovalsiteDiag(Game, store) {
  if (!Game || typeof Game.removeWorldMonster !== 'function') {
    store.errs++; store.errors.push('removeWorldMonster not a function');
    return;
  }
  if (Game._removalsiteWrapped) { store.installed = true; return; }
  const orig = Game.removeWorldMonster;
  Game._removalsiteWrapped = true;
  Game.removeWorldMonster = function (m) {
    try {
      if (layerOn() && m && store.rows.length < MAX_ROWS) {
        let tb = null, fightIds = [];
        try { tb = Game.tbfight || null; } catch (e) {}
        try {
          const fighters = (tb && tb.fighters) || [];
          fightIds = fighters.filter(x => x && x.kind === 'monster')
            .map(x => ((x.mdef || {}).id || x.monsterId || x.id || null))
            .filter(Boolean);
        } catch (e) {}
        let px = null, py = null;
        try { px = Game.map.px; py = Game.map.py; } catch (e) {}
        const mid = (m && (m.id || m.monsterId)) || null;
        const row = {
          day: dayOf(Game),
          id: mid,
          seq: (m && m._spawnSeq != null) ? m._spawnSeq : null,
          wave: waveOf(Game, m),
          tx: (m && m.tx != null) ? m.tx : null,
          ty: (m && m.ty != null) ? m.ty : null,
          hp: (m && m.hp != null) ? m.hp : null,
          maxHp: (m && m.maxHp != null) ? m.maxHp : null,
          lingering: !!(m && m.lingering),
          titan: !!(m && m.titan),
          playerDist: (px != null && m && m.tx != null) ? (Math.abs(m.tx - px) + Math.abs(m.ty - py)) : null,
          tbActive: !!(tb && !tb.over),
          fightMonster: fightIds.indexOf(mid) >= 0,
          fightIds: fightIds.slice(0, 12),
          stack: stackHint(),
        };
        row.site = row.tbActive
          ? (row.fightMonster ? 'tb-fight-lift' : 'tb-bystander-lift')
          : 'ambient-or-other';
        store.rows.push(row);
      } else if (layerOn() && m) {
        store.overflow++;
      }
    } catch (e) {
      store.errs++;
      if (store.errors.length < 20) store.errors.push(String((e && e.message) || e).slice(0, 160));
    }
    return orig.call(this, m);
  };
  store.installed = true;
}

module.exports = { layerOn, newStore, installRemovalsiteDiag, MAX_ROWS };
