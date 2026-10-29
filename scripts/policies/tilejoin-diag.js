// tilejoin-diag — tile-mate join recorder + prototype (sim-tilejoin-a,
// 2026-10-29, flesh-out loop, axis scale-onramp, backlog #1439).
//
// THE BLANK (breakline-a, evidence/2026-10-29/sim-breakline-a.md): in
// 280 fought wild fights, tile mates stood on the fight tile in 92, yet
// shouts were 0 and joins were 0. Decomposition of that corpus (this
// arm, before any judged run): the engine's crew input was EMPTY in
// all 280 fought fights (crewAlive 0, engineAllies 0, allyVids empty),
// because the patrol/resolve callers feed _outdoorCrew and that
// snapshot is empty by fight time. 11 fought fights were the
// addressable pool: tile mate present, trajectory hopeless, intent
// not learn, outcome vFlee — a shout there would have replaced the
// flee. 15 more tile-present hopeless flees were learn-intent and are
// NOT addressable (the learn branch withdraws regardless; the shout
// branch excludes learn intent).
//
// PERCEPTION LAW (Steve 2026-10-28, binding): a join may ONLY be
// answered by allies actually standing on the same tile at fight
// start. NO global roster, NO crew-list feed, NO snapshot feed into
// a decision. This prototype feeds ONLY the fieldparty tile list
// (pure nodePos read: roster members whose nodePos equals the monster
// tile at fight start), trust-ordered like the existing callers, cap
// 2 like the engine. It never reads _outdoorCrew, never reads a
// roster list as candidates, never feeds a villager who is not on
// the tile. Trust-ordering only RANKS tile mates; it never admits a
// non-tile villager.
//
// MODES (env):
//   TILEJOIN unset/absent  -> record-only OFF: never modifies opts.
//   TILEJOIN=1             -> prototype ON: feeds tile mates (gated).
//   TILEJOIN_SKIP=1        -> do not install at all (neutrality scratch:
//                              proves the recorder itself changes nothing).
// The prototype is a MEASUREMENT, not a landed fix: policy files are
// sim drivers, not shipped game code. A GO here means "the tile-only
// shout shape works and helps"; the src/js arm that wires it for real
// is the follow-up. Zero src/js is touched by this arm.
//
// FEED GATES (shouldFeed, all must hold; anything else records a
// skip reason and delegates the original opts untouched):
//   - caller in {resolve, patrol, aid} (stack classifier, same as
//     fieldparty-form-diag), channel field (not raid, not expedition)
//   - wave 1..4, monster tile known (live tx/ty present)
//   - fighter is NOT the scholar (vid !== villagerId, vid !== 'player')
//   - NOT cornered, NOT allyFromStart (muster/aid paths keep their own
//     ally logic; the prototype never overrides a working ally feed)
//   - original allyVids EMPTY (never clobbers crew-fed allies)
//   - at least one fed-eligible tile mate (deadKnown !== true: the
//     dead-status lookup resolves to false for only 11/149 tile
//     entries on the OFF band, while 57/57 distinct null-deadKnown
//     tile mates fight elsewhere in their seed — null is the normal
//     living case (vp objects carry no `dead` property while living),
//     not a corpse signal. Known-dead entries (deadKnown === true)
//     are recorded but never fed. This matches breakline-a's
//     tile-present definition and the engine callers' own liveness
//     test, roster membership.)
// NO trust floor in the prototype, deliberately: the measured question
// is "does feeding tile mates produce joins/kills". Each fed mate's
// trust is recorded, so the next arm can price a floor (party-wiring
// answer_floor is 15) from the fed set. NO allyFromStart: the
// legitimate shape is the round>=2 hopeless shout, not a round-1
// muster join. Side effect disclosed: opts.allies also feeds the
// engine's holdBonus (+0.04 per ally, cap 0.12 on vBreak) — ON both
// enables shouts AND steadies the flee floor slightly. The analyzer
// reports joins as the primary effect; holdBonus is a confound of
// at most 0.12, never hidden.
//
// OBSERVATIONAL GUARANTEES (record-only mode and the pre/post reads
// in ON mode): pre-reads are pure state reads, no RNG draws, no game
// writes, never throw into the engine (a pre-read throw counts an
// error and delegates the ORIGINAL opts). The opts object passed to
// the engine in ON mode is a CLONE; the caller's opts is never
// mutated. Sense logs are stored only for the FIRST joined fight,
// FIRST shouted fight, and FIRST tile-present hopeless flee per seed.
'use strict';

const MAX_EVENTS = 60000;
const MAX_LOG_LINES = 500;

function layerOn() { try { return process.env.TILEJOIN === '1'; } catch (e) { return false; } }
function skipInstall() { try { return process.env.TILEJOIN_SKIP === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { meetings: [], partCounter: 0, errs: 0, errors: [], overflow: {}, installed: false,
    sense: { joined: null, shouted: null, tileHopelessFlee: null } };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function seqOf(m) {
  try { return (m && m._spawnSeq != null) ? m._spawnSeq : null; } catch (e) { return null; }
}
function waveOf(Game, m) {
  try {
    if (m && m.id && typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m) | 0;
      if (w) return w;
    }
  } catch (e) { /* fall through */ }
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}

// Caller classification from the Error stack at wrap entry.
// Same classifier as fieldparty-form-diag (order matters: aid before
// resolve; sortie/patrol call fieldFight directly).
function classifyCaller() {
  let stack = '';
  try { stack = (new Error()).stack || ''; } catch (e) { stack = ''; }
  const names = [];
  try {
    for (const line of stack.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m && names.indexOf(m[1]) < 0) names.push(m[1]);
    }
  } catch (e) { /* names best-effort */ }
  let cls = 'other';
  if (names.indexOf('lingererSortie') >= 0) cls = 'sortie';
  else if (names.indexOf('resolvePatrol') >= 0) cls = 'patrol';
  else if (names.indexOf('aidFight') >= 0) cls = 'aid';
  else if (names.indexOf('resolveWildMonsterEncounter') >= 0) cls = 'resolve';
  return { cls: cls, stack: names.slice(0, 20).join(','), expedition: /expedition/i.test(stack) };
}

// Known-dead test, pure reads only. null = unknown (kept, flagged).
// Mirrors fieldparty-form-diag exactly.
function deadKnown(Game, vid) {
  try {
    if (vid === Game.villagerId) return false;
    if (typeof Game.getPerson === 'function') {
      const p = Game.getPerson(vid);
      if (p && typeof p.dead !== 'undefined') return !!p.dead;
    }
    if (typeof Game.vpOf === 'function') {
      const vp = Game.vpOf(vid);
      if (vp && typeof vp.dead !== 'undefined') return !!vp.dead;
    }
  } catch (e) { /* unknown */ }
  return null;
}

function trustOf(Game, vid) {
  try {
    const t = ((Game.state || {}).village || {}).trust || {};
    const v = t[vid];
    return (v === undefined || v === null) ? 10 : v;
  } catch (e) { return 10; }
}

// selectTileMates(Game, vid, mTile): PURE reads only. Returns the
// fieldparty tile list split into fed-eligible mates and audit
// counts. Fed-eligible = roster member, not the fighter, nodePos
// exactly equals the monster tile, NOT known dead (deadKnown !==
// true — see the gate comment above for why null counts as living).
// Ordered by village trust descending (callers' existing order), cap
// 2 (the engine slices allyVids to 2 anyway). Stamp-partner flags
// are audit only: co-departure partners who ALSO stand on the tile.
// Never reads _outdoorCrew, never reads npcNode (it creates defaults).
function selectTileMates(Game, vid, mTile) {
  const out = { fed: [], tileAll: [], tileDeadKnown: 0, tileUnknownDead: 0, stampErr: false };
  if (!mTile) return out;
  const village = (Game.state || {}).village || {};
  const roster = village.roster || [];
  const nodePos = village.nodePos || {};
  let stampPartners = [];
  try {
    const cd = Game._coDepart || {};
    const entry = cd[vid] || null;
    if (entry && Array.isArray(entry.partners)) stampPartners = entry.partners.map(String);
  } catch (e) { out.stampErr = true; stampPartners = []; }
  for (const v of roster) {
    if (v === vid) continue;
    const np = nodePos[v];
    if (!np) continue;
    if (np.nx !== mTile.tx || np.ny !== mTile.ty) continue;
    const dk = deadKnown(Game, v);
    const rec = { vid: String(v), trust: trustOf(Game, v), deadKnown: dk,
      stampPartner: stampPartners.indexOf(String(v)) >= 0 };
    if (dk !== true) out.tileAll.push(rec);
    if (dk === true) { out.tileDeadKnown++; continue; }
    if (dk === null) out.tileUnknownDead++;
    out.fed.push(rec);
  }
  out.fed.sort((a, b) => b.trust - a.trust);
  out.fed = out.fed.slice(0, 2);
  return out;
}

// shouldFeed(ctx): pure gate. ctx = {caller, inRaid, expedition,
// wave, mTile, isScholar, cornered, allyFromStart, origAllyVids,
// fedCount}. Returns {feed: bool, skip: reason|null}.
function shouldFeed(ctx) {
  if (!ctx) return { feed: false, skip: 'no-ctx' };
  if (['resolve', 'patrol', 'aid'].indexOf(ctx.caller) < 0) return { feed: false, skip: 'caller-' + ctx.caller };
  if (ctx.inRaid) return { feed: false, skip: 'raid' };
  if (ctx.expedition) return { feed: false, skip: 'expedition' };
  if (!ctx.mTile) return { feed: false, skip: 'no-tile' };
  if (!(ctx.wave >= 1 && ctx.wave <= 4)) return { feed: false, skip: 'wave-' + ctx.wave };
  if (ctx.isScholar) return { feed: false, skip: 'scholar' };
  if (ctx.cornered) return { feed: false, skip: 'cornered' };
  if (ctx.allyFromStart) return { feed: false, skip: 'ally-from-start' };
  if (ctx.origAllyVids && ctx.origAllyVids.length) return { feed: false, skip: 'nonempty-allies' };
  if (!ctx.fedCount) return { feed: false, skip: 'no-fed-mates' };
  return { feed: true, skip: null };
}

// buildFedOpts(opts, fedVids): CLONE, never mutate. Sets allies to
// the fed count and allyVids to the fed vids (engine slices to 2).
function buildFedOpts(opts, fedVids) {
  const base = (opts && typeof opts === 'object') ? opts : {};
  const next = Object.assign({}, base);
  next.allies = fedVids.length;
  next.allyVids = fedVids.slice();
  return next;
}

function installTilejoinDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (skipInstall()) return function () {};
  if (Game._tilejoinDiagStore === store && Game._tilejoinDiagInstalled) return Game._tilejoinDiagUninstall || function () {};
  const uninstalls = [];
  let raidDepth = 0;
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  wrap('advancePart', (orig) => function () {
    const r = orig.apply(this, arguments);
    try { store.partCounter++; } catch (e) { noteErr(store, 'advancePart.counter', e); }
    return r;
  });

  wrap('havenRaidTick', (orig) => function () {
    raidDepth++;
    try { return orig.apply(this, arguments); }
    finally { raidDepth--; }
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    const caller = classifyCaller();
    const inRaid = raidDepth > 0;
    let pre = null;
    let fedOpts = null;
    try {
      const live = m || null;
      const mTile = (live && typeof live.tx === 'number' && typeof live.ty === 'number')
        ? { tx: live.tx, ty: live.ty } : null;
      const wave = waveOf(Game, live || mdef);
      const sel = selectTileMates(Game, vid, mTile);
      const origAllyVids = (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.slice() : [];
      const isScholar = (vid === Game.villagerId || vid === 'player');
      const gate = shouldFeed({
        caller: caller.cls, inRaid: inRaid, expedition: caller.expedition,
        wave: wave, mTile: mTile, isScholar: isScholar,
        cornered: !!(opts && opts.cornered),
        allyFromStart: !!(opts && opts.allyFromStart),
        origAllyVids: origAllyVids, fedCount: sel.fed.length,
      });
      const wantFeed = layerOn() && gate.feed;
      if (wantFeed) fedOpts = buildFedOpts(opts, sel.fed.map(f => f.vid));
      pre = {
        day: dayOf(Game), part: store.partCounter,
        vid: vid != null ? String(vid) : null,
        seq: seqOf(live) != null ? seqOf(live) : seqOf(mdef),
        mid: (live && live.id) || (mdef && mdef.id) || null,
        wave: wave, caller: caller.cls,
        channel: (!m && caller.expedition) ? 'other' : (inRaid ? 'raid' : 'field'),
        mTile: mTile,
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : null,
        tileAll: sel.tileAll.map(t => t.vid),
        tileFed: sel.fed.map(t => ({ vid: t.vid, trust: t.trust, stampPartner: t.stampPartner })),
        tileDeadKnown: sel.tileDeadKnown, tileUnknownDead: sel.tileUnknownDead,
        stampErr: !!sel.stampErr,
        origAllies: (opts && opts.allies != null) ? (opts.allies | 0) : null,
        origAllyVids: origAllyVids.map(a => (a != null ? String(a) : null)),
        fed: wantFeed,
        fedVids: wantFeed ? sel.fed.map(t => t.vid) : [],
        skip: wantFeed ? null : gate.skip,
        on: layerOn(),
      };
    } catch (e) { noteErr(store, 'fieldFight.pre', e); fedOpts = null; }
    let rec = null;
    try { rec = fedOpts ? orig.apply(this, [vid, mdef, m, fedOpts]) : orig.apply(this, arguments); }
    catch (e) {
      try { if (pre) { pre.threw = true; pre.error = String((e && e.message) || e).slice(0, 120); pushCapped(store, 'meetings', pre); } } catch (e2) { noteErr(store, 'fieldFight.throwRec', e2); }
      throw e;
    }
    try {
      if (pre) {
        pre.outcome = rec ? (rec.outcome || null) : null;
        pre.rounds = rec ? (rec.rounds | 0) : null;
        pre.mDealt = rec ? (rec.mDealt | 0) : null;
        pre.vTaken = rec ? (rec.vTaken | 0) : null;
        pre.mHpLeft = rec ? roundHp(rec.mHpLeft) : null;
        pre.intent = rec ? (rec.intent || null) : null;
        pre.everHopeless = rec ? !!rec.everHopeless : null;
        pre.everWinning = rec ? !!rec.everWinning : null;
        pre.fleeLearn = rec ? !!rec.fleeLearn : null;
        pre.fleeHopeless = rec ? !!rec.fleeHopeless : null;
        pre.calledHelp = rec ? !!rec.calledHelp : null;
        pre.joinedAllyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pre.allyDealt = rec ? (rec.allyDealt | 0) : null;
        pre.allyTaken = rec ? (rec.allyTaken | 0) : null;
        pushCapped(store, 'meetings', pre);
        // Sense slots: first-only per seed.
        try {
          const log = (rec && Array.isArray(rec.log)) ? rec.log.slice(0, MAX_LOG_LINES).map(l => String(l)) : [];
          const head = { seed: null, day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave,
            caller: pre.caller, rounds: pre.rounds, outcome: pre.outcome,
            fedVids: pre.fedVids, joinedAllyVid: pre.joinedAllyVid,
            mDealt: pre.mDealt, vTaken: pre.vTaken, allyDealt: pre.allyDealt, allyTaken: pre.allyTaken, log: log };
          if (pre.calledHelp && pre.joinedAllyVid && !store.sense.joined) store.sense.joined = head;
          else if (pre.calledHelp && !store.sense.shouted) store.sense.shouted = head;
          else if (!pre.calledHelp && pre.outcome === 'vFlee' && pre.everHopeless &&
            pre.tileFed.length && !store.sense.tileHopelessFlee) store.sense.tileHopelessFlee = head;
        } catch (e) { noteErr(store, 'fieldFight.sense', e); }
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
  };
  Game._tilejoinDiagStore = store;
  Game._tilejoinDiagInstalled = true;
  Game._tilejoinDiagUninstall = uninstall;
  store.installed = true;
  return uninstall;
}

module.exports = {
  newStore: newStore, installTilejoinDiag: installTilejoinDiag,
  layerOn: layerOn, skipInstall: skipInstall,
  selectTileMates: selectTileMates, shouldFeed: shouldFeed, buildFedOpts: buildFedOpts,
};
