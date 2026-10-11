#!/usr/bin/env node
// Journey leg: DEEPENING (days 40-80) — competent-player playthrough, 3 seeds.
// Full games day 1->80 (most honest); assessment focuses on days 40-80.
// Extends the competent policy (scripts/policies/competent.js) with leg
// behaviors: wave 2-3 encounters fought blow-by-blow (flee less readily),
// gear-up (craft/equip best-effort), regional courtship play (propose links,
// answer accord/counter/national/global beats, pay tribute, answer demands),
// knowledge-economy play (beasttricks askAbout when teachable).
//
// Text capture ON so transcripts, fight narration, and scale beats are
// readable. Evidence: /tmp/journey-deep-*.{json,txt}.
//
// Usage: node scripts/test-journey-deepening-r2-20261011.js   (seeds 31337, 90210, 161803)
//        FIGHTSEEK=1 for the fight-seeking variant (wave-3 gate probe)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [31337, 90210, 161803]);
const DAYCAP = parseInt(process.env.DAYCAP || '80', 10);
const FIGHTSEEK = process.env.FIGHTSEEK === '1';

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

const { competent } = require('./policies/competent.js');
const { driveFights, driveContests } = require('./sim-harness.js');

// ---- text-stream capture ----
let capture = [];
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}
(function wrapStream() {
  const _emit = Game.emit, _say = Game.say;
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  if (typeof _say === 'function') {
    Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  }
})();

// ---- contest spot-check capture (r2): wrap contestChoose to log every phase's
// available choices + the chosen one, and dump a full transcript per contest
// (capture window) so "played not RNG" is sense-testable. Also marks pilot.
let _currentSeed = null;
let _cxRec = null;
const CX_TRANSCRIPTS = [];
function cxWriteFile() {
  const n = CX_TRANSCRIPTS.length + 1;
  const fp = `/tmp/journey-deep-r2-contest-${_currentSeed}-${n}.txt`;
  const L = [];
  L.push(`=== CONTEST TRANSCRIPT seed=${_currentSeed} #${n} ===`);
  L.push(`contest: ${_cxRec.name} (id=${_cxRec.id})`);
  L.push(`choices taken: ${_cxRec.choices.length}`);
  L.push('');
  for (const ch of _cxRec.choices) {
    L.push(`--- phase ${ch.phaseIdx} ---`);
    L.push(`BEAT: ${ch.text}`);
    L.push('options: ' + ch.labels.map((l, i) => `[${i}] ${l}`).join(' | '));
    L.push(`YOU CHOSE: [${ch.chosen}] ${ch.labels[ch.chosen] || '(?)'}`);
    L.push('');
  }
  L.push('=== capture window (all lines while contest was active) ===');
  L.push(capture.slice(_cxRec.capStart, _cxRec.capEnd).join('\n'));
  fs.writeFileSync(fp, L.join('\n'));
  CX_TRANSCRIPTS.push({ seed: _currentSeed, n, fp, id: _cxRec.id, name: _cxRec.name, choices: _cxRec.choices.length });
  return fp;
}
const _contestChoose = Game.contestChoose;
if (typeof _contestChoose === 'function') {
  Game.contestChoose = function (idx) {
    try {
      const ac = Game.state && Game.state.activeContest;
      if (ac && ac.phase !== 'done' && !_cxRec) {
        _cxRec = {
          id: ac.contestId || ac.id || ac.showId || '?',
          name: ac.name || ac.showName || ac.kind || ac.showId || '?',
          capStart: capture.length, capEnd: null, choices: [],
        };
      }
      if (_cxRec && ac && ac.phase !== 'done' && !ac.arenaSuspended) {
        const phase = ((ac.phases || [])[ac.phaseIdx || 0]) || {};
        const labels = (phase.choices || []).map(c => String((c && (c.label || c.text || c.id)) || '').slice(0, 90));
        _cxRec.choices.push({
          phaseIdx: ac.phaseIdx || 0,
          text: String(phase.text || '').slice(0, 400),
          labels, chosen: idx,
        });
      }
      const ret = _contestChoose.call(this, idx);
      const ac2 = Game.state && Game.state.activeContest;
      if (_cxRec && (!ac2 || ac2.phase === 'done')) {
        _cxRec.capEnd = capture.length;
        const fp = cxWriteFile();
        console.log(`*** contest transcript -> ${fp} (${_cxRec.choices.length} choices, ${(_cxRec.capEnd - _cxRec.capStart)} lines)`);
        _cxRec = null;
      }
      return ret;
    } catch (e) { return _contestChoose.call(this, idx); }
  };
}

// ---- helpers ----
function vname(vid) { try { return Game.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }
function pantryKcal() {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function waveOf(mid) {
  try {
    const d = (Game.data.monsters || []).find(m => m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}
function monsterDisplay(mid) {
  try {
    const d = (Game.data.monsters || []).find(m => m.id === mid);
    return (d && (d.displayName || d.name)) || mid;
  } catch (e) { return mid; }
}

// wave-3 signature-mechanic markers to look for in fight narration
const SIG_MARKERS = {
  spool: ['reel', '🎞', 'RECORD', 'REPLAY'],
  terms_of_service: ['clause', '§', 'fine print'],
  redactor: ['REDACT', 'redact'],
  callback: ['funeral', 'NOT ', 'goodbye'],
  buffering: ['afterimage', 'past', 'will step'],
  ad_break: ['ad break', 'SKIP', 'sponsor'],
  chorus_line: ['downbeat', 'beat', '💃'],
  focus_group: ['LOVED', 'HATED', 'murmur'],
  gavel: ['trial', 'verdict', 'ACCUS', 'OBJECT'],
};

// GO INSIDE (deepening fix 2026-10-11): travelTo leaves the scholar OUTSIDE
// the hall (on the grounds); havenStoresAccess() is 'none' until the player
// taps the lodge (enterBuilding). The first deepening pass never went inside,
// so takeFromPantry/donateToPantry refused all run ("The pantry is in the
// hall. Your hands are not.") and the bearer starved next to a full pantry.
// A competent player goes inside. Idempotent: refuses honestly when inside.
function goInside(Game) {
  try {
    const t = Game.playerTile ? Game.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = Game.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && Game.enterBuilding) Game.enterBuilding();
    }
  } catch (e) {}
}

// ---- leg extensions to the competent policy ----
function gearUp(Game, ctx) {
  try {
    if ((ctx._gearDay || 0) === gday()) return;
    ctx._gearDay = gday();
    const inv = Game.state.scholar.inventory || [];
    const defs = Game.data.items || [];
    const defOf = (it) => defs.find(d => d.id === (it.itemId || it.id));
    let best = -1, bestBonus = -999, bestSlot = 'melee';
    inv.forEach((it, i) => {
      const d = defOf(it); if (!d || d.class !== 'weapon') return;
      const w = d.weapon || {};
      const b = w.bonus || 0;
      if (b > bestBonus) { bestBonus = b; best = i; bestSlot = (w.range > 1 || /bow|sling/i.test(w.type || '')) ? 'ranged' : 'melee'; }
    });
    if (best >= 0) {
      const eq = Game.state.scholar.equipped || {};
      const cur = eq[bestSlot];
      const curId = cur && (cur.itemId || cur.id);
      const it = inv[best];
      const bestId = it.itemId || it.id;
      if (curId !== bestId) {
        try { Game.equip(best, bestSlot); ctx.geared = (ctx.geared || 0) + 1; } catch (e) {}
      }
    }
    // best-effort: learn to make a spear (knowledge-gated; honest fail is fine)
    try { Game.craft('fire_hardened_spear'); } catch (e) {}
    // wear any un-worn armor piece
    try {
      const worn = new Set(Object.values(Game.state.scholar.equipped || {}).map(e => e && (e.itemId || e.id)));
      for (let i = 0; i < inv.length; i++) {
        const d = defOf(inv[i]); if (!d || !d.armor) continue;
        const id = inv[i].itemId || inv[i].id;
        if (worn.has(id)) continue;
        try { Game.equip(i, 'armor'); ctx.armored = (ctx.armored || 0) + 1; break; } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}
}

function regionalPlay(Game, ctx) {
  const day = gday();
  const reg = ctx.regionalLog;
  const note = (ev) => reg.push(Object.assign({ day }, ev));
  try {
    const st = Game.state;
    // answer pending offers/beats — a competent player answers, never leaves mail unread
    if (st.pendingCounter) {
      try { Game.answerCounter('accept'); note({ ev: 'counter', how: 'accept' }); } catch (e) { note({ ev: 'counter', how: 'accept', err: String(e && e.message) }); }
    }
    if (st.pendingAccord) {
      const cap0 = capture.length;
      try { Game.answerAccord('gift'); note({ ev: 'accord', how: 'gift', scale: Game.scaleRank() }); } catch (e) { note({ ev: 'accord', how: 'gift', err: String(e && e.message) }); }
      note({ ev: 'accord-text', lines: capture.slice(cap0, cap0 + 6) });
    }
    if (st.pendingNational) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { Game.answerNationalChoice(pick); note({ ev: 'national', shape, how: pick, scale: Game.scaleRank() }); } catch (e) { note({ ev: 'national', shape, how: pick, err: String(e && e.message) }); }
    }
    if (st.pendingGlobal) {
      try { Game.answerGlobalChoice('feast'); note({ ev: 'global', how: 'feast', scale: Game.scaleRank() }); } catch (e) { note({ ev: 'global', how: 'feast', err: String(e && e.message) }); }
    }
    if (st.pendingSwitchboard) {
      try {
        const cands = Game.switchboardCandidates ? Game.switchboardCandidates() : [];
        if (cands.length && Game.appointSwitchboard) { Game.appointSwitchboard(cands[0].id); note({ ev: 'switchboard', who: cands[0].id }); }
      } catch (e) { note({ ev: 'switchboard', err: String(e && e.message) }); }
    }
    // demands + tribute on active subordinate links
    let links = [];
    try { links = Game.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active' || link.subordinate !== 'haven') continue;
      if (link.pendingDemand) {
        const rich = pantryKcal() > 12000;
        try { Game.answerDemand(link.id, rich); note({ ev: 'demand', link: link.id, how: rich ? 'honor' : 'refuse' }); }
        catch (e) { note({ ev: 'demand', link: link.id, err: String(e && e.message) }); }
      }
      const week = (Game._week ? Game._week() : 0);
      if (link.tributePaidWeek !== week && pantryKcal() > 15000) {
        try { const paid = Game.payTribute(link.id); note({ ev: 'tribute', link: link.id, paid }); }
        catch (e) { note({ ev: 'tribute', link: link.id, err: String(e && e.message) }); }
      }
    }
    // propose a first link: day>=25, healthy pantry, no active link, no pending
    // business. COOLDOWN (deepening fix): a declined village isn't re-asked
    // for 7 days — the first pass asked daily for 34 days straight.
    if (day >= 25 && !st.pendingCounter && !st.pendingAccord && pantryKcal() > 12000) {
      const hasActive = links.some(l => l && l.status === 'active');
      if (!hasActive) {
        const ovs = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && Game.knowsVillage(v) && !Game.linkWith(v.id));
        if (ovs.length) {
          const t = ovs[0];
          ctx._propCool = ctx._propCool || {};
          if ((ctx._propCool[t.id] || 0) + 7 <= day) {
            ctx._propCool[t.id] = day;
            try {
              const r = Game.proposeLink(t.id);
              note({ ev: 'propose', target: t.id, name: t.name, result: r == null ? 'declined' : (r === 'counter' ? 'counter' : 'linked') });
            } catch (e) { note({ ev: 'propose', target: t.id, err: String(e && e.message) }); }
          }
        } else if ((ctx._noVillageDay || 0) + 10 <= day) {
          ctx._noVillageDay = day;
          note({ ev: 'propose', result: 'no-known-villages' });
        }
      }
    }
  } catch (e) {}
}

function knowledgePlay(Game, ctx) {
  const day = gday();
  if ((ctx._btDay || 0) === day) return;
  ctx._btDay = day;
  if (day % 5 !== 0) return;
  try {
    const slain = Game.state.villageSlain || {};
    const known = Game.state.monsterCounters || {};
    for (const type of Object.keys(slain)) {
      if ((slain[type] || 0) >= 2 && !known[type]) {
        const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
        const vid = roster.find(id => { try { return !Game.getPerson(id).dead; } catch (e) { return false; } });
        if (vid) {
          const r = Game.askAbout(vid, 'beasttricks');
          ctx.beasttricksTaught = (ctx.beasttricksTaught || 0) + ((r && r.taught) ? 1 : 0);
          ctx.beasttricksAsked = (ctx.beasttricksAsked || 0) + 1;
          break;
        }
      }
    }
  } catch (e) {}
}

function finalizeFight(ctx) {
  const rec = ctx._fr;
  ctx._fr = null;
  if (!rec) return;
  try {
    const f = rec.obj;
    rec.rounds = f.round;
    rec.result = f.result;
    rec.over = !!f.over;
    rec.endHp = (f.fighters || []).map(x => ({ key: x.key, kind: x.kind, mid: x.monsterId || null, hp: Math.round(x.hp || 0), fled: !!x.fled }));
    const slice = capture.slice(rec.capStart).join('\n');
    rec.dmgLines = (slice.match(/\(\d+ damage\)/g) || []).length;
    rec.lines = slice.split('\n').filter(l => /damage|STRIKE|strikes|hits|miss|dodge|flee/i.test(l)).slice(0, 60);
    // signature-mechanic markers for wave-3 monsters
    rec.sigHits = {};
    for (const m of rec.monsters) {
      const marks = SIG_MARKERS[m.mid] || [];
      const hits = marks.filter(mk => slice.toLowerCase().indexOf(mk.toLowerCase()) >= 0);
      if (hits.length) rec.sigHits[m.mid] = hits;
    }
    ctx.fightsLog.push(rec);
  } catch (e) {
    ctx.fightsLog.push({ id: rec.id, err: String(e && e.message), monsters: rec.monsters });
  }
}

const policy = Object.create(competent);
policy.setup = function (G, ctx) {
  competent.setup(G, ctx);
  ctx.fightsLog = [];
  ctx.regionalLog = [];
  ctx._fr = null;
};
policy.upkeep = function (G, ctx) {
  goInside(G);
  competent.upkeep(G, ctx);
};
policy.daily = function (G, ctx) {
  goInside(G);
  competent.daily(G, ctx);
  gearUp(G, ctx);
  regionalPlay(G, ctx);
  knowledgePlay(G, ctx);
};
// DEEPENING fight: a mid-game competent player takes wave 2-3 fights that are
// winnable (healthy, decent odds) — verifying they're fought blow-by-blow —
// and still walks away from bad ones. Flee logic is relaxed vs competent:
// flee only when truly outmatched or hurt.
policy.fight = function (G, ctx) {
  try {
    const f = G.tbfight;
    if (ctx._fr && (!f || f.id !== ctx._fr.id)) finalizeFight(ctx);
    if (!f || f.over || !G.tbIsPlayerTurn()) return false;
    if (!ctx._fr || ctx._fr.id !== f.id) {
      const mons = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      ctx._fr = {
        id: f.id, obj: f, day: gday(), capStart: capture.length,
        monsters: mons.map(m => ({ key: m.key, mid: m.monsterId, wave: waveOf(m.monsterId), name: monsterDisplay(m.monsterId), hp0: m.maxHp || m.hp })),
      };
      ctx.fightsStarted = (ctx.fightsStarted || 0) + 1;
    }
    const p = G.tbFighter('p');
    const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    const endTurn = () => {
      try { const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction(); } catch (e) {}
    };
    const flee = () => {
      try {
        const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
        const tx = px <= 4 ? 0 : 8;
        try { G.tbPlayerMove(tx, py); ctx.fled = (ctx.fled || 0) + 1; } catch (e) {}
      } catch (e) {}
      endTurn();
      return true;
    };
    // NEW-FIGHT ASSESSMENT (deepening): take wave 2-3 fights at decent health.
    if (ctx._fightObjD !== f) {
      ctx._fightObjD = f;
      try {
        const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let totalMhp = 0, maxWave = 1;
        for (const m of monsters) {
          totalMhp += m.maxHp || m.hp || 0;
          maxWave = Math.max(maxWave, waveOf(m.monsterId));
        }
        const pmax = p.maxHp || 100;
        // FIGHTSEEK (r2, wave-3 gate probe): wave-2s engaged aggressively —
        // flee only when genuinely outmatched. Wave-3 still health-gated.
        const outmatched = FIGHTSEEK
          ? (totalMhp > 8 * pmax || (maxWave >= 3 && hpPct < 0.4) || hpPct < 0.35)
          : (totalMhp > 4 * pmax ||
          (maxWave >= 3 && hpPct < 0.6) ||
          (maxWave >= 2 && hpPct < 0.5) ||
          hpPct < 0.5);
        if (outmatched && monsters.length) {
          ctx.fledDeepening = (ctx.fledDeepening || 0) + 1;
          return flee();
        }
      } catch (e) {}
    }
    if (hpPct < 0.35) return flee();
    const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
    if (!alive.length) return false;
    alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
    const tgt = alive[0];
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
    try {
      const w = (G.equippedWeapon && G.equippedWeapon()) || { range: 1 };
      const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
      if (d0 > (w.range || 1)) {
        const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
        let bx = null, by = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const cx = tmx + dx, cy = tmy + dy;
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (occupied.has(cx + ',' + cy)) continue;
          const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
          if (dd < bd) { bd = dd; bx = cx; by = cy; }
        }
        if (bx != null) { try { G.tbPlayerMove(bx, by); } catch (e) {} ctx.closed = (ctx.closed || 0) + 1; }
        endTurn();
        return true;
      }
    } catch (e) {}
    try { G.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
    endTurn();
    return true;
  } catch (e) { return false; }
};

// ---- conversation driver (same as establishment, engage-first) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
// DEEP (deepening leg): second-priority picks that keep a good conversation
// going instead of leaving after 2 exchanges — "tell me more", gossip,
// lately/personal, mourning check-ins.
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}

function runConversation(seed, day, vid) {
  const fp = `/tmp/journey-deep-r2-transcript-${seed}-day${day}.txt`;
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${seed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = Game.npcMood ? Game.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((Game.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log(`opening menu (${(r0.choices || []).length} choices):`);
    for (const ch of (r0.choices || [])) log(`  [${ch.id}] ${String(ch.label || '').slice(0, 120)}`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
      log('');
      log(`menu (${(choices || []).length}): ` + (choices || []).map(ch => `[${ch && ch.id}] ${String((ch && ch.label) || '').slice(0, 60)}`).join(' | '));
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = Game.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    log('');
    log('--- END ---');
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    log(`transcript entries: ${t.length}`);
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
    const allText = themLines.join('\n');
    if (/\(last time\)/i.test(allText)) log('!! leaked "(last time)" internal note');
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

// ---- telemetry helpers ----
function deathsSoFar() {
  try { return (Game.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function contestEvents() {
  try {
    return (Game.state.telemetry || []).filter(e => e && (e.type === 'contest_fired' || e.type === 'contest_end' || e.type === 'show_aired'));
  } catch (e) { return []; }
}
function popAlive() {
  try { return (Game.state.village.roster || []).filter(id => { const p = person(id); return !p.dead; }).length; } catch (e) { return null; }
}
function waveNow() { try { return Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { return null; } }
function scaleNow() { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } }
function knownCounts() {
  try {
    return {
      plants: Object.keys((Game.state.codex || {}).plants || {}).length,
      skills: Object.keys((Game.state.codex || {}).skills || {}).length,
      monsters: Object.keys((Game.state.codex || {}).monsters || {}).length,
      counters: Object.keys((Game.state.monsterCounters || {})).length,
    };
  } catch (e) { return null; }
}
function linksSummary() {
  try {
    const links = Game.hierarchyState() || [];
    return links.map(l => ({ id: l.id, other: l.primary === 'haven' ? l.subordinate : l.primary, status: l.status, trust: l.trust, kind: l.kind }));
  } catch (e) { return null; }
}
function scholarGear() {
  try {
    const w = Game.equippedWeapon ? Game.equippedWeapon() : {};
    const ab = Object.keys((Game.state.scholar || {}).abilities || {});
    const slots = Object.keys((Game.state.scholar || {}).abilitySlots || {});
    return { weapon: w.name || '?', unarmed: !!w.unarmed, abilities: ab, slots: slots.length };
  } catch (e) { return null; }
}

function buildCensus() {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const trust = (Game.state.village && Game.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (Game.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = Game.agencyOf ? Game.agencyOf(id) : null; } catch (e) {}
    let mood = null;
    try { mood = Game.npcMood ? Game.npcMood(id) : null; } catch (e) {}
    let skills = [];
    try { skills = (Game.state.codex && Game.state.codex.skills && Game.state.codex.skills[id]) || []; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}

const CONVO_DAYS = [45, 50, 55, 60, 65, 70, 75, 80];

async function runSeed(seed) {
  resetRng(seed);
  capture = [];
  _currentSeed = seed; _cxRec = null;
  const ctx = {};
  console.log(`\n########## SEED ${seed} ##########`);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  if (policy.setup) { try { policy.setup(Game, ctx); } catch (e) {} }

  const pid = Game.villagerId;
  const pp = person(pid);
  console.log('SPAWN: ' + JSON.stringify({
    seed, scholarName: vname(pid), occupation: pp.occupation || null,
    temperament: pp.temperament || null,
    rosterCount: (Game.state.village.roster || []).length,
  }));

  const series = [];
  const transcriptFiles = [];
  const contestLog = [];
  const waveLog = [];
  const fightSnapshots = [];
  let lastContestCount = 0;
  let lastWave = null;
  let overAt = null;
  let maxGameDay = 0;

  for (let day = 1; day <= DAYCAP; day++) {
    const gd = gday();
    maxGameDay = Math.max(maxGameDay, gd);

    const w = waveNow();
    if (w !== lastWave) {
      waveLog.push({ day: gd, wave: w, ledger: JSON.stringify(Game.state.waveLedger || {}), villageSlain: JSON.stringify(Game.state.villageSlain || {}) });
      console.log(`*** day ${gd}: WAVE -> ${w} (ledger: ${JSON.stringify(Game.state.waveLedger || {})})`);
      lastWave = w;
    }

    // conversation on scheduled leg days
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = Game.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) { console.log('villager-pick ERROR: ' + (e && e.message)); }
      if (vid) {
        try {
          const fp = runConversation(seed, gd, vid);
          transcriptFiles.push(fp);
          console.log(`day ${gd}: convo with ${vname(vid)} -> ${fp}`);
        } catch (e) { console.log('runConversation ERROR: ' + (e && e.message)); }
      }
    }

    // three day-parts
    for (let p = 0; p < 3; p++) {
      try { if (policy.upkeep) policy.upkeep(Game, ctx); } catch (e) {}
      const capBefore = capture.length;
      driveFights(Game, policy, ctx);
      driveContests(Game, policy, ctx);
      // snapshot any contest that was active this part
      if (Game.over) break;
      try { Game.tickAction(128); } catch (e) {}
      if (Game.over) break;
    }
    if (ctx._fr) finalizeFight(ctx);
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }

    try { if (policy.daily) policy.daily(Game, ctx); } catch (e) {}
    try { Game.sleep(); } catch (e) {}
    driveContests(Game, policy, ctx);

    const ce = contestEvents();
    if (ce.length > lastContestCount) {
      for (const ev of ce.slice(lastContestCount)) {
        contestLog.push({ day: gd, type: ev.type, id: ev.id, who: ev.who, outcome: ev.outcome, why: ev.why });
        console.log(`*** day ${gd}: ${ev.type} id=${ev.id || '?'} who=${ev.who || '?'} outcome=${ev.outcome || '?'}`);
      }
      lastContestCount = ce.length;
    }

    if (gd >= 40) {
      const ps = (function () {
        try {
          const p = (Game.state.village && Game.state.village.pantry) || [];
          let kcal = 0, preserved = 0;
          for (const i of p) {
            const k = (i.units || i.count || 0) * (i.kcalEach || i.kcal || 0);
            kcal += k;
            const fs = (i.foodState || '').toLowerCase();
            if (/smok|render|pemmican|dried|preserv/.test(fs)) preserved += k;
          }
          return { kcal: Math.round(kcal), preserved: Math.round(preserved), items: p.length };
        } catch (e) { return { kcal: null, preserved: null, items: null }; }
      })();
      series.push({
        day: gd, pantryKcal: ps.kcal, preservedKcal: ps.preserved, pantryItems: ps.items,
        pop: popAlive(), wave: waveNow(), scale: scaleNow(),
        links: linksSummary(),
        deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause })),
        scholarKcal: Math.round((Game.state.scholar && Game.state.scholar.kcal) || 0),
        scholarHp: Math.round((Game.state.scholar && Game.state.scholar.health) || 0),
        known: knownCounts(),
        gear: scholarGear(),
        scholarAlive: !!Game.state.scholar && !Game.over,
      });
    }
    if (Game.over) { overAt = gday(); console.log(`GAME OVER at day ${overAt}`); break; }
  }

  const capAll = capture.join('\n');
  const pilotAnnounced = /PILOT EPISODE/.test(capAll);
  const pilotLive = /pilot is LIVE/.test(capAll);
  const contestKinds = {};
  for (const ev of contestLog) { const k = (ev.type || '?') + ':' + (ev.id || '?'); contestKinds[k] = (contestKinds[k] || 0) + 1; }
  console.log(`SEED ${seed}: PILOT announced=${pilotAnnounced} live=${pilotLive} | contest kinds: ${JSON.stringify(contestKinds)} | cx transcripts=${CX_TRANSCRIPTS.filter(t => t.seed === seed).length}`);
  if (process.env.CXDUMP) {
    fs.writeFileSync(`/tmp/journey-deep-r2-capture-${seed}.txt`, capture.join('\n'));
    console.log(`capture dumped -> /tmp/journey-deep-r2-capture-${seed}.txt (${capture.length} lines)`);
  }
  if (process.env.INSPECT) {
    try {
      const eg = Game.contestEligible();
      console.log(`INSPECT day=${gday()}: eligible=[${(eg.eligible||[]).map(e=>e.id).join(',')}]`);
      console.log(`INSPECT ineligible=${JSON.stringify((eg.ineligible||[]).map(e=>({id:e.id,reason:e.reason})))}`);
      console.log(`INSPECT scholar exiled=${!!Game.state.scholar.exiled} over=${!!Game.over} roster=${(Game.state.village.roster||[]).length} positions=${Object.keys((Game.state.village.positions||{})).length}`);
    } catch(e) { console.log('INSPECT ERROR ' + (e && e.message)); }
  }
  const census = buildCensus();
  const censusPath = `/tmp/journey-deep-r2-census-${seed}.json`;
  fs.writeFileSync(censusPath, JSON.stringify({
    seed, maxGameDay, transcriptFiles, series, census, contestLog, waveLog, overAt,
    pilot: { announced: pilotAnnounced, live: pilotLive },
    contestKinds,
    cxTranscripts: CX_TRANSCRIPTS.filter(t => t.seed === seed),
    regionalLog: ctx.regionalLog || [],
    fights: (ctx.fightsLog || []).map(f => ({
      day: f.day, rounds: f.rounds, result: f.result, over: f.over,
      monsters: f.monsters, endHp: f.endHp, dmgLines: f.dmgLines, sigHits: f.sigHits,
      sample: (f.lines || []).slice(0, 24),
    })),
    known: knownCounts(),
    scale: scaleNow(),
    links: linksSummary(),
    foreignPolities: (function () { try { return Game.foreignPolities(); } catch (e) { return null; } })(),
    otherVillages: (function () { try { return (Game.state.otherVillages || []).map(v => ({ id: v.id, name: v.name, known: Game.knowsVillage(v), opinion: v.opinion, link: !!Game.linkWith(v.id) })); } catch (e) { return null; } })(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    waveKills: (function () { try { return Object.assign({}, Game.state.waveKills); } catch (e) { return null; } })(),
    waveLedger: (function () { try { return Object.assign({}, Game.state.waveLedger); } catch (e) { return null; } })(),
    villageSlain: (function () { try { return Object.assign({}, Game.state.villageSlain); } catch (e) { return null; } })(),
    monsterCounters: (function () { try { return Object.assign({}, Game.state.monsterCounters); } catch (e) { return null; } })(),
    gear: scholarGear(),
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledDeepening: ctx.fledDeepening || 0,
      fightsStarted: ctx.fightsStarted || 0, geared: ctx.geared || 0, armored: ctx.armored || 0,
      choseAbility: ctx.choseAbility || 0, looted: ctx.looted || 0, donated: ctx.donated || 0,
      beasttricksAsked: ctx.beasttricksAsked || 0, beasttricksTaught: ctx.beasttricksTaught || 0,
      talked: ctx.talked || 0, taught: ctx.taught || 0,
    },
  }, null, 1));
  console.log(`\nSEED ${seed} DONE: census -> ${censusPath} | maxDay=${maxGameDay} | over=${overAt || 'no'} | contests=${contestLog.length} | fights=${(ctx.fightsLog || []).length} | transcripts=${transcriptFiles.length} | scale=${scaleNow()} wave=${waveNow()}`);
  return { seed, censusPath, transcriptFiles, series, contestLog, overAt, maxGameDay };
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); results.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const r of results) {
    console.log(`seed ${r.seed}: maxDay=${r.maxGameDay} | over=${r.overAt || 'no'} | contests=${(r.contestLog || []).length} | census=${r.censusPath} ${r.fatal ? '| FATAL: ' + r.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
