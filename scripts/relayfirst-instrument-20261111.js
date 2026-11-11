// relayfirst-instrument-20261111.js — relay / Network campaign first-numbers
// recorder (arm sim-relayfirst-a, run fleshout-20261111T1115Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) RELAY VERBS (claimRelay / appointSwitchboard / relayAnswer /
//       relayCommune / relayReroute / relayProbe / relayDeepen): every
//       call — args, return, day.
//   (2) RELAY ABILITIES (relayGrant + the seven ability verbs
//       relayTranslate / relaySanctuary / relayAdvocate / relayRewrite /
//       relaySkim / relaySight / relayCarry): every call — args, return,
//       day; relayUnlockCheck calls with the relayAbils diff (grants).
//   (3) NETWORK GATE (networkSummon / soundTitanCall / ledgerAdd-titan):
//       every summon (return, overtime tier), every muster call
//       (titanId, return), every titan slew ledger entry.
//   (4) CAMPAIGN SPAWNS (spawnWorldMonster): every call for a campaign
//       kind (network_heart/limb/tower, finale, finale_crew,
//       finale_opening, herald, nielsen, spoiler, network_note,
//       timeslot, cancellation, editor, rerun) or with
//       opts.networkNode set — id, tile, node, day. The wild pool is
//       out of scope and is NOT recorded.
//   (5) FACES (startCombat): every call — monster id (arg or
//       pendingMonsterId), networkNode (playerMonster), wave
//       (monsters.json), campaignTagAtCall (advisory — _fight is set
//       after startCombat returns, so usually null; march identity
//       comes from networkNode + kind), return (null = refused
//       aloud), day.
//   (6) FIGHT OUTCOMES (tbEnd): every call — result, campaign tag,
//       fighters summary (monster ids + alive/hp at end), pieceDead
//       per network/finale node (the same rule the campaign code
//       uses: the node's piece dead). Read BEFORE the original runs
//       (it mutates).
//   (7) TELEMETRY CROSS-CHECK (tele, if present):
//       'network_summoned', 'network_fallen', 'network_lost',
//       'overtime_tier', 'killer_tale', 'vet_killer_tale',
//       'companion_kill_beat' events only.
//   (8) DAILY SNAPSHOT (RAW READS ONLY — the snapshot never calls a
//       method that writes: no tableState() (creates pg.table),
//       no sysBond() (normalizes pg.sysBond), no relayUnlockCheck()
//       (GRANTS abilities), no networkCampaign()/finaleCampaign()
//       (create the campaign record). Derived values — integration
//       stage, seat/path — are computed in the ANALYZER from the
//       raw fields): pantry kcal, roster, standing, scaleRank,
//       nationalLive, wave, bearer; relay — switchboardAvailable,
//       switchboard holder, relayHeldByBearer, scholar.relay
//       counters, relayAbils unlocked, relayLean / sysBond /
//       grounding / integration (raw); binding — foreignPolities,
//       pendingCounter, hierarchyState links, pendingNational,
//       nationalLive / nationalShape / scaleRefused, region stir;
//       network — overtime tier + active (pure reads),
//       progState networkSummoned/networkFallen/networkLost,
//       titans campaigns (network/finale, raw),
//       titans slain map, titan omens, W6 world monsters on the
//       map; table — progState tableAnnounced/tableWaiting/
//       tableDone + progState().table raw (seat/phase/path).
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-relayfirst-a.js) verifies EACH
// wrapped method's call path is live on a fixture or live
// miniature; a wrap with no live call observed is marked dead in
// the evidence and its zero is never treated as evidence.
//
// Usage: const RF = require('./relayfirst-instrument-20261111');
//   const rf = RF.install(Game); rf.snapshot(); ... rf.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}
function monsterWave(Game, mid) {
  try {
    const def = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    return def ? (def.wave == null ? null : def.wave) : null;
  } catch (e) { return null; }
}

// Campaign kinds whose spawns/faces this arm records. The wild pool is
// out of scope; the Network march's escorts ride along because a node
// fight's kill attribution needs them.
var CAMPAIGN_KINDS = {
  network_heart: 1, network_limb: 1, network_tower: 1,
  finale: 1, finale_crew: 1, finale_opening: 1,
  herald: 1, nielsen: 1, spoiler: 1, network_note: 1,
  timeslot: 1, cancellation: 1, editor: 1, rerun: 1,
};
var W6_KINDS = { network_heart: 1, network_limb: 1, network_tower: 1 };

function install(Game) {
  const t = {
    relayEvents: [], grantEvents: [], abilityUseEvents: [], unlockEvents: [],
    summonEvents: [], titanCallEvents: [], titanSlewEvents: [],
    spawnEvents: [], faceEvents: [], fightEvents: [], teleEvents: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
  };
  let seq = 0;
  const origs = {};

  function mark(name) {
    t.wrapLive[name] = true;
    t.wrapCounts[name] = (t.wrapCounts[name] || 0) + 1;
  }
  function err(where, msg) {
    try { t.instrumentErrors.push(where + ': ' + String(msg).slice(0, 100)); } catch (e) {}
  }
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { err(name + '-missing', 'Game.' + name + ' is not a function'); return; }
      origs[name] = Game[name];
      Game[name] = fn;
    } catch (e) { err(name + '-wrap', e.message); }
  }
  function retStr(ret) {
    if (ret == null) return null;
    try { return String(ret).slice(0, 60); } catch (e) { return '[unstringable]'; }
  }

  // ---- (1) relay verbs ----
  wrap('claimRelay', function () {
    mark('claimRelay');
    const stack = stackText(2);
    let heldBefore = null;
    try { heldBefore = (typeof Game.relayHeldByBearer === 'function') ? !!Game.relayHeldByBearer() : null; } catch (e) {}
    let ret = null;
    try { ret = origs.claimRelay.apply(Game, arguments); } catch (e) { err('claimRelay-call', e.message); }
    try {
      let heldAfter = null;
      try { heldAfter = (typeof Game.relayHeldByBearer === 'function') ? !!Game.relayHeldByBearer() : null; } catch (e) {}
      t.relayEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'claimRelay',
        ret: retStr(ret), heldBefore: heldBefore, heldAfter: heldAfter, stack: stack, via: 'claimRelay' });
    } catch (e) { err('claimRelay-log', e.message); }
    return ret;
  });

  wrap('appointSwitchboard', function (vid) {
    mark('appointSwitchboard');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.appointSwitchboard.call(Game, vid); } catch (e) { err('appointSwitchboard-call', e.message); }
    try {
      t.relayEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'appointSwitchboard',
        vid: vid || null, ret: retStr(ret), stack: stack, via: 'appointSwitchboard' });
    } catch (e) { err('appointSwitchboard-log', e.message); }
    return ret;
  });

  wrap('relayAnswer', function (choiceId) {
    mark('relayAnswer');
    const stack = stackText(2);
    let sceneBefore = null;
    try { sceneBefore = (typeof Game.pendingRelayScene === 'function') ? Game.pendingRelayScene() : null; } catch (e) {}
    let ret = null;
    try { ret = origs.relayAnswer.call(Game, choiceId); } catch (e) { err('relayAnswer-call', e.message); }
    try {
      t.relayEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'relayAnswer',
        choice: choiceId || null,
        scene: sceneBefore ? (sceneBefore.scene || null) : null,
        sceneDay: sceneBefore ? (sceneBefore.day == null ? null : sceneBefore.day) : null,
        ret: retStr(ret), stack: stack, via: 'relayAnswer' });
    } catch (e) { err('relayAnswer-log', e.message); }
    return ret;
  });

  wrap('relayCommune', function () {
    mark('relayCommune');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.relayCommune.apply(Game, arguments); } catch (e) { err('relayCommune-call', e.message); }
    try {
      t.relayEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'relayCommune',
        ret: retStr(ret), stack: stack, via: 'relayCommune' });
    } catch (e) { err('relayCommune-log', e.message); }
    return ret;
  });

  wrap('relayReroute', function (mode) {
    mark('relayReroute');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.relayReroute.call(Game, mode); } catch (e) { err('relayReroute-call', e.message); }
    try {
      t.relayEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'relayReroute',
        mode: mode || null, ret: retStr(ret), stack: stack, via: 'relayReroute' });
    } catch (e) { err('relayReroute-log', e.message); }
    return ret;
  });

  wrap('relayProbe', function () {
    mark('relayProbe');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.relayProbe.apply(Game, arguments); } catch (e) { err('relayProbe-call', e.message); }
    try {
      t.relayEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'relayProbe',
        ret: retStr(ret), stack: stack, via: 'relayProbe' });
    } catch (e) { err('relayProbe-log', e.message); }
    return ret;
  });

  wrap('relayDeepen', function () {
    mark('relayDeepen');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.relayDeepen.apply(Game, arguments); } catch (e) { err('relayDeepen-call', e.message); }
    try {
      t.relayEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'relayDeepen',
        ret: retStr(ret), stack: stack, via: 'relayDeepen' });
    } catch (e) { err('relayDeepen-log', e.message); }
    return ret;
  });

  // ---- (2) relay abilities ----
  function relayAbilsUnlocked() {
    try {
      const a = ((Game.state || {}).scholar || {}).relayAbils || {};
      return Object.keys(a).filter(function (k) { return a[k] && a[k].unlocked; });
    } catch (e) { return []; }
  }
  wrap('relayGrant', function (abilId, opts) {
    mark('relayGrant');
    const stack = stackText(2);
    let ret = false;
    try { ret = origs.relayGrant.call(Game, abilId, opts); } catch (e) { err('relayGrant-call', e.message); }
    try {
      t.grantEvents.push({ seq: ++seq, day: dayOf(Game), id: abilId || null,
        granted: !!ret, silent: !!(opts && opts.silent), stack: stack, via: 'relayGrant' });
    } catch (e) { err('relayGrant-log', e.message); }
    return ret;
  });

  ['relayTranslate', 'relaySanctuary', 'relayAdvocate', 'relayRewrite',
   'relaySkim', 'relaySight', 'relayCarry'].forEach(function (name) {
    wrap(name, function () {
      mark(name);
      const stack = stackText(2);
      const args = Array.prototype.slice.call(arguments).map(function (a) {
        return (a == null ? null : String(a).slice(0, 60));
      });
      let ret = null;
      try { ret = origs[name].apply(Game, arguments); } catch (e) { err(name + '-call', e.message); }
      try {
        t.abilityUseEvents.push({ seq: ++seq, day: dayOf(Game), verb: name,
          args: args, ret: retStr(ret), stack: stack, via: name });
      } catch (e) { err(name + '-log', e.message); }
      return ret;
    });
  });

  wrap('relayUnlockCheck', function () {
    mark('relayUnlockCheck');
    const stack = stackText(2);
    const before = relayAbilsUnlocked();
    let ret;
    try { ret = origs.relayUnlockCheck.apply(Game, arguments); } catch (e) { err('relayUnlockCheck-call', e.message); }
    try {
      const after = relayAbilsUnlocked();
      const granted = after.filter(function (id) { return before.indexOf(id) < 0; });
      t.unlockEvents.push({ seq: ++seq, day: dayOf(Game), granted: granted,
        before: before, after: after, stack: stack, via: 'relayUnlockCheck' });
    } catch (e) { err('relayUnlockCheck-log', e.message); }
    return ret;
  });

  // ---- (3) network gate ----
  wrap('networkSummon', function () {
    mark('networkSummon');
    const stack = stackText(2);
    let tier = null;
    try { tier = (typeof Game.overtimeTier === 'function') ? Game.overtimeTier() : null; } catch (e) {}
    let ret = false;
    try { ret = origs.networkSummon.apply(Game, arguments); } catch (e) { err('networkSummon-call', e.message); }
    try {
      t.summonEvents.push({ seq: ++seq, day: dayOf(Game), summoned: !!ret,
        overtimeTier: tier, stack: stack, via: 'networkSummon' });
    } catch (e) { err('networkSummon-log', e.message); }
    return ret;
  });

  wrap('soundTitanCall', function (titanId) {
    mark('soundTitanCall');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.soundTitanCall.call(Game, titanId); } catch (e) { err('soundTitanCall-call', e.message); }
    try {
      t.titanCallEvents.push({ seq: ++seq, day: dayOf(Game), titan: titanId || null,
        ret: retStr(ret), stack: stack, via: 'soundTitanCall' });
    } catch (e) { err('soundTitanCall-log', e.message); }
    return ret;
  });

  wrap('ledgerAdd', function (kind, what) {
    mark('ledgerAdd');
    let ret;
    try { ret = origs.ledgerAdd.call(Game, kind, what); } catch (e) { err('ledgerAdd-call', e.message); }
    try {
      if (kind === 'titan') {
        t.titanSlewEvents.push({ seq: ++seq, day: dayOf(Game), kind: kind,
          what: (what == null ? null : String(what)), stack: stackText(2), via: 'ledgerAdd' });
      }
    } catch (e) { err('ledgerAdd-log', e.message); }
    return ret;
  });

  // ---- (4) campaign spawns ----
  wrap('spawnWorldMonster', function (mdef, tx, ty, opts) {
    mark('spawnWorldMonster');
    const stack = stackText(2);
    const mid = (mdef && typeof mdef === 'object') ? (mdef.id || null) : (mdef || null);
    const node = (opts && opts.networkNode) || null;
    const inScope = !!node || !!CAMPAIGN_KINDS[mid];
    let ret = null;
    try { ret = origs.spawnWorldMonster.apply(Game, arguments); } catch (e) { err('spawnWorldMonster-call', e.message); }
    try {
      if (inScope) {
        t.spawnEvents.push({ seq: ++seq, day: dayOf(Game), id: mid,
          wave: monsterWave(Game, mid), w6: !!W6_KINDS[mid],
          tx: (tx == null ? null : tx), ty: (ty == null ? null : ty),
          networkNode: node, titan: !!(opts && opts.titan),
          stack: stack, via: 'spawnWorldMonster' });
      }
    } catch (e) { err('spawnWorldMonster-log', e.message); }
    return ret;
  });

  // ---- (5) faces ----
  wrap('startCombat', function (monsterId) {
    mark('startCombat');
    const stack = stackText(2);
    let mid = monsterId || null;
    try {
      if (!mid && this && this.pendingMonsterId) mid = this.pendingMonsterId;
    } catch (e) {}
    let node = null, campaignTagAtCall = null;
    try {
      const pm = (typeof Game.playerMonster === 'function') ? Game.playerMonster() : null;
      if (pm && pm.networkNode) node = pm.networkNode;
    } catch (e) {}
    try {
      // Advisory only: _fight is set by the campaign/titan wraps AFTER
      // startCombat returns, so at call time this is usually null (or a
      // stale tag if a previous fight never cleared it). March identity
      // comes from networkNode + kind (the 5 campaignOnly kinds never
      // spawn wild), never from this field.
      const tf = ((Game.state || {}).titans || {})._fight;
      campaignTagAtCall = (tf && tf.campaign) || null;
    } catch (e) {}
    const inScope = !!node || !!CAMPAIGN_KINDS[mid];
    let ret = null;
    try { ret = origs.startCombat.apply(Game, arguments); } catch (e) { err('startCombat-call', e.message); }
    try {
      if (inScope) {
        t.faceEvents.push({ seq: ++seq, day: dayOf(Game), id: mid,
          wave: monsterWave(Game, mid), w6: !!W6_KINDS[mid],
          networkNode: node, campaignTagAtCall: campaignTagAtCall,
          refused: (ret == null), stack: stack, via: 'startCombat' });
      }
    } catch (e) { err('startCombat-log', e.message); }
    return ret;
  });

  // ---- (6) fight outcomes (read BEFORE the original runs) ----
  wrap('tbEnd', function (result) {
    mark('tbEnd');
    const stack = stackText(2);
    let campaign = null, fighters = [];
    try {
      const tf = ((Game.state || {}).titans || {})._fight;
      campaign = (tf && tf.campaign) || null;
    } catch (e) {}
    try {
      const f = Game.tbfight;
      if (f && f.fighters) {
        fighters = f.fighters.filter(function (p) { return p && p.kind === 'monster'; })
          .map(function (p) {
            const mid = ((p.mdef || {}).id || p.monsterId || p.id) || null;
            return { id: mid, key: p.key || null, alive: !!p.alive, hp: (p.hp == null ? null : p.hp),
              wave: monsterWave(Game, mid), w6: !!W6_KINDS[mid] };
          });
      }
    } catch (e) {}
    const campaignFight = !!campaign || fighters.some(function (p) { return CAMPAIGN_KINDS[p.id]; });
    let ret;
    try { ret = origs.tbEnd.apply(Game, arguments); } catch (e) { err('tbEnd-call', e.message); }
    try {
      if (campaignFight) {
        t.fightEvents.push({ seq: ++seq, day: dayOf(Game), result: result || null,
          campaign: campaign, fighters: fighters, stack: stack, via: 'tbEnd' });
      }
    } catch (e) { err('tbEnd-log', e.message); }
    return ret;
  });

  // ---- (7) telemetry cross-check ----
  try {
    if (typeof Game.tele === 'function') {
      origs.tele = Game.tele;
      Game.tele = function (type, data) {
        let ret;
        try { ret = origs.tele.call(Game, type, data); } catch (e) { err('tele-call', e.message); }
        try {
          if (type === 'network_summoned' || type === 'network_fallen' || type === 'network_lost' ||
              type === 'overtime_tier' || type === 'killer_tale' || type === 'vet_killer_tale' ||
              type === 'companion_kill_beat') {
            t.teleEvents.push({ seq: ++seq, day: dayOf(Game), type: type, data: clone(data || {}) });
          }
          mark('tele');
        } catch (e) { err('tele-log', e.message); }
        return ret;
      };
    }
  } catch (e) { err('tele-wrap', e.message); }

  // ---- (8) daily snapshot (RAW READS ONLY — see header) ----
  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try { snap.standing = Game.villageStanding ? Game.villageStanding() : null; } catch (e) { snap.standing = null; }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.nationalLive = !!((Game.state || {}).nationalLive); } catch (e) { snap.nationalLive = null; }
    try { snap.wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.wave = null; }
    try { snap.bearer = Game.villagerId || null; } catch (e) { snap.bearer = null; }
    // Relay (raw state reads; switchboardAvailable/relayHeldByBearer are
    // pure reads — comms.js/relay-ext.js).
    try {
      snap.switchboardAvailable = (typeof Game.switchboardAvailable === 'function') ? !!Game.switchboardAvailable() : null;
    } catch (e) { snap.switchboardAvailable = null; }
    try {
      const sw = (typeof Game.switchboard === 'function') ? Game.switchboard() : null;
      snap.switchboard = sw ? { holderId: sw.holderId || null, stage: sw.stage || null,
        appointedDay: (sw.appointedDay == null ? null : sw.appointedDay),
        bearerHeld: !!sw.bearerHeld, routed: sw.routed | 0, delayed: sw.delayed | 0 } : null;
    } catch (e) { snap.switchboard = null; }
    try {
      snap.relayHeldByBearer = (typeof Game.relayHeldByBearer === 'function') ? !!Game.relayHeldByBearer() : null;
    } catch (e) { snap.relayHeldByBearer = null; }
    try {
      const s = Game.state.scholar || {};
      const rs = s.relay || {};
      snap.relay = {
        probes: rs.probes | 0, reroutes: rs.reroutes | 0, deepens: rs.deepens | 0,
        communes: rs.communes | 0, holderDays: rs.holderDays | 0, backfires: rs.backfires | 0,
        lean: (rs.lean == null ? 0 : rs.lean),
      };
      snap.relayAbils = relayAbilsUnlocked();
      snap.grounding = (s.grounding == null ? null : s.grounding);
      snap.integration = (s.integration == null ? null : s.integration);
      snap.sysBond = null;
      try { const pg = (typeof Game.progState === 'function') ? Game.progState() : null; snap.sysBond = pg ? (pg.sysBond | 0) : null; } catch (e) {}
    } catch (e) { err('snapshot-relay', e.message); }
    try {
      snap.systemArrived = !!((Game.state || {}).systemArrived);
    } catch (e) { snap.systemArrived = null; }
    // Binding chain (same pure reads as bindingtrace-b).
    try {
      const st = Game.state || {};
      snap.exiled = !!((st.scholar || {}).exiled);
      snap.nationalShape = st.nationalShape || null;
      snap.scaleRefused = !!st.scaleRefused;
      snap.stir = (st._regionStir | 0) || 0;
      snap.stirKinds = (st._regionStirKinds || []).slice();
      const pc = st.pendingCounter;
      snap.pendingCounter = pc ? { targetId: String(pc.targetId || ''), asSubordinate: !!pc.asSubordinate, day: pc.day | 0 } : null;
      const fps = st.foreignPolities || [];
      snap.fps = fps.map(function (fp) { return { primary: String((fp && fp.primary) || '?'), subs: ((fp && fp.subs) || []).slice(), day: (fp && fp.day) | 0 }; });
      snap.maxForeignSize = 0;
      snap.fps.forEach(function (fp) { snap.maxForeignSize = Math.max(snap.maxForeignSize, 2 + fp.subs.length); });
      const pn = st.pendingNational;
      snap.pendingNational = pn ? { shape: pn.shape || null, day: pn.day | 0, led: !!pn.led, primary: pn.primary || null } : null;
    } catch (e) { err('snapshot-binding-state', e.message); }
    try {
      let links = [];
      try { links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : []; } catch (e) { links = []; }
      snap.links = links.map(function (l) {
        if (!l) return null;
        return { id: String(l.id || '?'), status: String(l.status || '?'),
          primary: String(l.primary || '?'), subordinate: String(l.subordinate || '?'),
          trust: l.trust | 0, arrears: l.arrears | 0, day: l.day | 0,
          kind: String(l.kind || 'sub'), conquered: !!l.conquered };
      }).filter(Boolean);
    } catch (e) { err('snapshot-links', e.message); }
    // Network / finale / titans (raw state reads; overtimeTier /
    // overtimeActive are pure reads of progState().overtime).
    try {
      snap.overtimeTier = (typeof Game.overtimeTier === 'function') ? Game.overtimeTier() : null;
    } catch (e) { snap.overtimeTier = null; }
    try {
      snap.overtimeActive = (typeof Game.overtimeActive === 'function') ? !!Game.overtimeActive() : null;
    } catch (e) { snap.overtimeActive = null; }
    try {
      const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
      snap.networkSummoned = !!pg.networkSummoned;
      snap.networkFallen = !!pg.networkFallen;
      snap.networkLost = !!pg.networkLost;
      snap.tableAnnounced = !!pg.tableAnnounced;
      snap.tableWaiting = !!pg.tableWaiting;
      snap.tableDone = !!pg.tableDone;
      snap.table = pg.table ? clone(pg.table) : null;
    } catch (e) { err('snapshot-prog', e.message); }
    try {
      const tt = ((Game.state || {}).titans || {});
      snap.titansSlain = clone(tt.slain || {});
      snap.titanOmens = {};
      Object.keys(tt.omens || {}).forEach(function (k) {
        const o = tt.omens[k] || {};
        snap.titanOmens[k] = { stage: (o.stage == null ? null : o.stage), day: (o.day == null ? null : o.day) };
      });
      const camps = tt.campaigns || {};
      snap.networkCampaign = camps.network ? clone(camps.network) : null;
      snap.finaleCampaign = camps.finale ? clone(camps.finale) : null;
    } catch (e) { err('snapshot-titans', e.message); }
    try {
      const wms = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      snap.campaignMonsters = wms
        .filter(function (m) { return m && (m.networkNode || CAMPAIGN_KINDS[m.id]); })
        .map(function (m) { return { id: m.id || null, networkNode: m.networkNode || null, tx: m.tx, ty: m.ty }; });
    } catch (e) { snap.campaignMonsters = null; }
    try {
      const v = Game.state.village || {};
      snap.roster = (v.roster || []).slice();
    } catch (e) { snap.roster = null; }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try {
      Object.keys(origs).forEach(function (name) {
        try { Game[name] = origs[name]; } catch (e) { err('uninstall-' + name, e.message); }
      });
    } catch (e) { err('uninstall', e.message); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, CAMPAIGN_KINDS: CAMPAIGN_KINDS, W6_KINDS: W6_KINDS };
