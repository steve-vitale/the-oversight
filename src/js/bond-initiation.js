// @ontology
// system: bond-initiation
// description: Villagers initiate bonds on their own — proposing a bond to a person they perceived, and raising a village link to the bearer. Steve 2026-11-04: villagers initiate bonds, because the player may inherit that villager.
// provides:
//   - bondProposalPerceived(initiatorVid, targetVid)
//   - bondDriveLive(vid, targetVid)
//   - bondRoll(...parts) (deterministic hash roll, for tests)
//   - proposeBond(initiatorVid, targetVid, opts)
//   - bondProposalMaybe(initiatorVid, targetVid)
//   - bondProposeCand(initiatorVid, targetVid, opts)
//   - bondLinkRaiseCand(vid, villageId)
//   - bondFeedCands(vid)
//   - bondScoreCands(initiatorVid, cands, opts)
//   - stageBondProposal(vid)
//   - pendingBondProposal(vid)
//   - acceptBondProposal(vid)
//   - declineBondProposal(vid)
//   - npcBondTick()
//   - npcPairBondTick()
//   - maybeTellVillageLore(vid)
//   - stageLinkRaise(vid, villageId)
//   - pendingLinkRaise(vid)
//   - acceptLinkRaise(vid)
//   - declineLinkRaise(vid)
//   - npcLinkRaiseTick()
//   - bondProposalLine(vid)
//   - linkRaiseLine(vid)
// rules:
//   - bondinit_perception_only: a proposal fires only for a person the initiator personally perceived — same fire-group, an existing bond record (real interaction), gossip heard naming the target, or a sensed ally. Never a roster scan, never a list feed. (code: bondProposalPerceived)
//   - bondinit_character_decision: the target decides through npcInviteDecision kind 'bond' — temperament, goal, mood, fear, pair relationship, social need; chance clamped 5-95, never always/never. (code: proposeBond)
//   - bondinit_player_chooses_path: hierarchy propose verbs stay player-only (Steve 2026-10-26). An NPC raises a link idea; the player proposes. acceptLinkRaise first tells the bearer the lore (tellVillageLore), then calls proposeLink. (code: acceptLinkRaise)
//   - bondinit_scholar_decides: a proposal TO the scholar is never auto-decided — it stages as a pending conversation beat the player answers. (code: stageBondProposal)
//   - bondinit_drive_first: wild proposals fire only from VISIT arrivals or the daily pair tick, only while the pair's bond is warming but not yet close (bondDriveLive: 15 <= warmth < 50, depth < 1), only to someone they do not dislike (pairAffinity >= 0). Scholar proposals stage only while the villager's bond with the scholar is warming the same way. (code: bondProposalMaybe, npcPairBondTick, bondDriveLive)
//   - bondinit_candidates_scored: entry points raise PROPOSE_BOND / RAISE_LINK candidates the initiator's own scorer weighs (bondScoreCands / dawn vbrainFeedExtras); warmth stays the gate; the target still decides via npcInviteDecision — no cross-write bypass (code: bondProposeCand, bondFeedCands, bondScoreCands, bondProposalMaybe, npcPairBondTick, npcBondTick, npcLinkRaiseTick, VILLAGER-BRAIN Phase 4)
//   - bondinit_no_spam: a refused pair cools down 14 days; an accepted bond is never re-proposed; at most one bond staging, one pair proposal, and one link-raise staging per day; a link raise decided or expired within 14 days is not re-raised. (code: proposeBond, npcBondTick, npcPairBondTick, npcLinkRaiseTick)
//   - bondinit_lore_spread: a villager learns a village only by being told it by someone who knows it (tellVillageLore, secondhand, traced by name) — the scholar tells villagers about villages they know when a conversation ends. No bare-flag lore, ever. (code: maybeTellVillageLore)
//   - bondinit_no_stream_drift: this module's lotteries use hash rolls (bondRoll), never Math.random — the shared seeded stream feeds the whole sim, and consuming it swings identical-seed panels with no game effect behind the swing. (code: bondRoll, bondPick, bondScoreCands)
//   - bondinit_telemetry: every proposal, staging, acceptance and refusal emits tele('bond_proposed', {initiator, target, kind, outcome, chance}). (code: proposeBond, stageBondProposal, acceptBondProposal, declineBondProposal, stageLinkRaise, acceptLinkRaise, declineLinkRaise)
//   - bondinit_no_gate_changes: this module never writes a win price, deed gate, readiness bar, or table rule. It changes who asks, not what winning costs. (code: bond-initiation.js — only state writes are bondAdd, bumpTrust, and the bond/link request stores)
//   - bondinit_narration: proposals speak only when the player is at Haven (say), or inside a live conversation (sayLine). No sim spam, no silent acts. (code: proposeBond, bondTurn)
/* BOND INITIATION — src/js/bond-initiation.js
 *
 * Steve (2026-11-04 22:32): "Yes obviously villagers should initiate
 * bonds. ... they need to act like the player because eventually the
 * player may inherit that villager they encounter."
 *
 * Before this module, bonds formed only by accumulation (betrayal.js
 * bondAdd: meals/visits/feasts/talk) and village links only from the
 * player's propose verbs — no villager ever asked for either (linkseek-b
 * DIAG-GO 2026-11-04: 0 propose verbs on 8/8 seeds). This module adds
 * the asking, in three shapes:
 *   1. NPC -> NPC bond proposals, fired from VISIT arrivals when the
 *      villager's bonds drive is live. The target decides by character.
 *   2. NPC -> scholar bond proposals, staged daily as pending
 *      conversation beats the PLAYER answers (bond:accept/decline).
 *   3. NPC -> bearer link raises: a villager who personally knows
 *      another village raises the idea in conversation; accepting
 *      calls the existing proposeLink as the player.
 *
 * Self-attaching module. Load after betrayal.js (bondAdd,
 * npcInviteDecision, declineLine), villager-goals.js (vgoalWeights),
 * villager-objectives.js (VISIT hook), hierarchy.js (villageLoreOf,
 * tellVillageLore, proposeLink) and conversation.js (convoChoices /
 * convoTurn wraps). All cross-module calls are defensive: a missing
 * helper fails the proposal, never the game.
 */
(function () {
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;

  var REFUSE_COOLDOWN_DAYS = 14;
  // VISIT/pair entry no longer uses a flat BOND_PROPOSE_P lottery —
  // Phase 4 raises PROPOSE_BOND candidates the initiator's scorer weighs.
  var BOND_TICK_P = 0.18;   // npcBondTick: scholar-proposal staging lottery (tuning 3, 2026-11-05: 0.25 staged ~10/90d on long-lived villages; full panel hit 13/seed vs the prereg 12 cap — trim for margin)
  var PAIR_TICK_P = 0.08;   // npcPairBondTick: NPC->NPC proposal lottery
  var LINK_TICK_P = 0.5;    // npcLinkRaiseTick: link-raise staging lottery
  var TELL_P = 0.3;         // endConvo: scholar tells a villager a village
  var LINK_RAISE_COOLDOWN_DAYS = 14;
  // WARMTH WINDOW (tuned 2026-11-05 after the armed pilot showed 0
  // proposals in 90 days): the bonds drive is live for a pair whose
  // bond warmth is warming but not yet close, 15 <= v < 50. The first
  // drive read vgoalWeights.bonds >= 1, but that gate is trustedAnyone
  // (own trust map >= 40). Through 2026-11-05 that map was never
  // written in wild play (census: maxTrust 0 across 90 days on seed
  // 84101, while warming bond pairs grew 0 -> 26); person-trust.js now
  // writes it from lived events, and villager-goals can open bonds on
  // it. Proposals still read warmth here — not the goals gate — so a
  // relationship can be asked about while it is real but unformalized.
  // depth >= 1 is already close whatever v says.
  var BOND_WARM_MIN = 15;
  var BOND_WARM_MAX = 50;

  function dayOf() {
    try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }
  }
  function scholarId() {
    try { return G.villagerId || null; } catch (e) { return null; }
  }
  function personOf(vid) {
    try { if (G.getPerson) return G.getPerson(vid); } catch (e) {}
    try { if (G.vpOf) return G.vpOf(vid); } catch (e) {}
    return null;
  }
  function aliveOnRoster(vid) {
    if (!vid) return false;
    try {
      var roster = ((G.state || {}).village || {}).roster || [];
      if (roster.indexOf(vid) === -1) return false;
      var vp = personOf(vid);
      if (vp && vp.dead) return false;
      if (typeof G.deadMarked === 'function' && G.deadMarked(vid)) return false;
    } catch (e) { return false; }
    return true;
  }
  function nameOf(vid) {
    try { if (G.displayName) return G.displayName(vid); } catch (e) {}
    return 'someone';
  }
  function playerAtHaven() {
    try { if (G.playerAtHaven) return !!G.playerAtHaven(); } catch (e) {}
    return false;
  }
  function trustOf(vid) {
    try { return (((G.state || {}).village || {}).trust || {})[vid]; } catch (e) {}
    return undefined;
  }
  function bondState() {
    try {
      var v = G.state.village || (G.state.village = {});
      v.bondProposals = v.bondProposals || {};
      return v.bondProposals;
    } catch (e) { return {}; }
  }
  function bondRequests() {
    try {
      var v = G.state.village || (G.state.village = {});
      v.bondRequests = v.bondRequests || {};
      return v.bondRequests;
    } catch (e) { return {}; }
  }
  function linkRaises() {
    try {
      var v = G.state.village || (G.state.village = {});
      v.linkRaises = v.linkRaises || {};
      return v.linkRaises;
    } catch (e) { return {}; }
  }
  // Decided/expired link raises, keyed vid|villageId — the re-raise
  // cooldown's record (mirrors bondState for person bonds).
  function linkRaiseState() {
    try {
      var v = G.state.village || (G.state.village = {});
      v.linkRaiseState = v.linkRaiseState || {};
      return v.linkRaiseState;
    } catch (e) { return {}; }
  }
  function pairKey(a, b) {
    try { if (G.bondKey) return G.bondKey(a, b); } catch (e) {}
    return a < b ? a + '|' + b : b + '|' + a;
  }
  // Deterministic rolls (tuning 2, completed tuning 3, 2026-11-05): this
  // module's lotteries must NOT consume Math.random. The shared seeded
  // stream feeds the whole sim, and drift swung identical-seed panels
  // with zero game effect behind it — the paired panel then measures
  // noise, not the build. A hash of (what, who, day) is deterministic
  // per seed, stable across runs, and leaves the shared stream alone.
  // Tuning 2 pinned the module's own lotteries; tuning 3 pinned the
  // character decision too (proposeBond passes a bondRoll decision
  // roll, so npcInviteDecision never draws on the bond path).
  function bondHash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    // fmix32 finalizer (MurmurHash3): raw FNV-1a clusters on short
    // inputs that differ only in the last byte ('pairtick|1..90' all
    // landed 0.25-0.43, so the 0.08 gate never passed). The finalizer
    // avalanches the bits; verified uniform (pairtick 3/90 at 0.08,
    // bondtick 20/90 at 0.25, linktick 42/90 at 0.5).
    h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function bondRoll() {
    var s = '';
    for (var i = 0; i < arguments.length; i++) s += (i ? '|' : '') + String(arguments[i]);
    return bondHash(s);
  }
  function bondPick(arr, salt) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(bondRoll('pick', salt, dayOf()) * arr.length)];
  }
  function tele(data) {
    try { if (G.tele) G.tele('bond_proposed', data); } catch (e) {}
  }
  // AGENTS.md: no empty catch in new code — errors surface so sims can
  // count them. One-line accessor probes (method-absent checks) stay
  // silent: failure there is the expected "no" answer, not an error.
  function bondWarn(where, e) {
    try { if (typeof console !== 'undefined' && console.warn) console.warn('[bond-initiation] ' + where, e); } catch (_) {}
  }

  // ---------- PERCEPTION GATE ----------
  // Channels, all from the INITIATOR's own records:
  //   firegroup — same fire-group (they started life together);
  //   bond — a bond record exists (bondAdd fires only on real interaction);
  //   gossip — the initiator heard gossip naming the target;
  //   ally — the target is a sensed ally (co-tasked / co-located).
  // The scholar is perceived by co-residence + the live conversation
  // itself, so scholar targets are gated on the pending path (trust
  // >= 12 + bonds drive), not on this function — proposeBond refuses
  // scholar targets outright (see below).
  function bondProposalPerceived(initiator, target) {
    var channels = [];
    try {
      var v = G.state.village || {};
      var groups = v.groups || [];
      for (var gi = 0; gi < groups.length; gi++) {
        var mem = groups[gi].members || [];
        if (mem.indexOf(initiator) !== -1 && mem.indexOf(target) !== -1) { channels.push('firegroup'); break; }
      }
    } catch (e) { bondWarn('perceived:firegroup', e); }
    try {
      var bnd = (G.bondGet && G.bondGet(initiator, target)) || null;
      if (bnd) channels.push('bond');
    } catch (e) {}
    try {
      var gossip = ((G.state || {}).village || {}).gossip || [];
      for (var i = 0; i < gossip.length; i++) {
        var g = gossip[i] || {};
        if (g.who === target && (g.heard || []).indexOf(initiator) !== -1) { channels.push('gossip'); break; }
      }
    } catch (e) { bondWarn('perceived:gossip', e); }
    try {
      if (G.villagerFightAllies) {
        var allies = G.villagerFightAllies(initiator) || [];
        if (allies.indexOf(target) !== -1) channels.push('ally');
      }
    } catch (e) {}
    return { perceived: channels.length > 0, channels: channels };
  }

  // ---------- DRIVE (warmth window) ----------
  // bondDriveLive(vid, targetVid) -> {live, warmth, depth}. Live when
  // the pair's bond is warming but not yet close (15 <= v < 50,
  // depth < 1). No bond record yet means strangers: not live. This is
  // the ONE definition of the drive — bondProposalMaybe, the scholar
  // staging, and the daily tick all read it, so a tuning lands once.
  function bondDriveLive(vid, targetVid) {
    var bnd = null;
    try { bnd = (G.bondGet && G.bondGet(vid, targetVid)) || null; } catch (e) { bnd = null; }
    if (!bnd) return { live: false, warmth: 0, depth: 0 };
    var v = bnd.v || 0, d = bnd.depth || 0;
    var live = (v >= BOND_WARM_MIN && v < BOND_WARM_MAX && d < 1);
    return { live: live, warmth: v, depth: d };
  }

  // ---------- CANDIDATES (VILLAGER-BRAIN Phase 4) ----------
  // Entry points raise PROPOSE_BOND / RAISE_LINK candidates; the
  // initiator's scorer weighs them; warmth stays the gate; the target
  // still decides through npcInviteDecision. Nobody cross-writes the
  // target's bond state without that invite.
  function bondPairBlocked(initiator, target) {
    var day = dayOf();
    var key = pairKey(initiator, target);
    var rec = bondState()[key] || null;
    if (rec && rec.outcome === 'accepted') return 'already-bonded';
    if (rec && rec.outcome === 'refused' && day - (rec.day || 0) < REFUSE_COOLDOWN_DAYS) return 'cooldown';
    try {
      var existing = (G.bondGet && G.bondGet(initiator, target)) || null;
      if (existing && ((existing.depth || 0) >= 1 || (existing.v || 0) >= 50)) return 'already-bonded';
    } catch (e) {}
    return null;
  }
  function bondProposeWeight(initiator, drive) {
    var w = 1.4;
    try {
      var weights = (G.vgoalWeights && G.vgoalWeights(initiator)) || null;
      if (weights && (weights.bonds || 0) > 0) w += Math.min(2.0, weights.bonds);
    } catch (e) {}
    var warmth = (drive && drive.warmth) || 0;
    // Mid-window warmth scores a touch higher (warming, not barely open).
    w += Math.max(0, Math.min(1, (warmth - BOND_WARM_MIN) / (BOND_WARM_MAX - BOND_WARM_MIN)));
    try {
      var temper = G.npcTemper ? G.npcTemper(initiator) : null;
      if (temper === 'warm' || temper === 'gentle') w *= 1.15;
      if (temper === 'withdrawn' || temper === 'prickly') w *= 0.75;
    } catch (e) {}
    return Math.round(w * 1000) / 1000;
  }
  // bondProposeCand(initiator, target, opts) -> candidate | null.
  // opts.scholar: stage path (NPC -> scholar). Warmth gate is mandatory.
  function bondProposeCand(initiator, target, opts) {
    opts = opts || {};
    if (!initiator || !target || initiator === target) return null;
    if (!aliveOnRoster(initiator)) return null;
    var scholar = !!opts.scholar || target === scholarId();
    if (!scholar && !aliveOnRoster(target)) return null;
    if (!scholar && target === scholarId()) return null; // auto-path never targets scholar
    var drive = bondDriveLive(initiator, target);
    if (!drive.live) return null;
    if (!scholar) {
      try {
        var aff = (G.pairAffinity ? G.pairAffinity(initiator, target) : 0) || 0;
        if (aff < 0) return null;
      } catch (e) { bondWarn('cand:affinity', e); }
      var gate = bondProposalPerceived(initiator, target);
      if (!gate.perceived) return null;
    } else {
      try { if ((G.state.village.sick || {})[initiator]) return null; } catch (e) {}
      var t = trustOf(initiator);
      if (t == null || t < 12) return null;
      if (bondRequests()[initiator]) return null;
    }
    var blocked = bondPairBlocked(initiator, target);
    if (blocked) return null;
    var w = bondProposeWeight(initiator, drive);
    var considerations = [
      { id: 'bond_drive_live', raw: 1, note: 'warmth window' },
      { id: 'bond_warmth', raw: Math.round((drive.warmth || 0) * 1000) / 1000, note: 'pair warmth' },
    ];
    if (!scholar) {
      try {
        var g2 = bondProposalPerceived(initiator, target);
        considerations.push({ id: 'perceived', raw: 1, note: (g2.channels || []).join(',') || 'yes' });
      } catch (e) {}
    } else {
      considerations.push({ id: 'scholar_stage', raw: 1, note: 'player decides' });
    }
    return {
      kind: 'PROPOSE_BOND',
      w: w,
      targetVid: target,
      vbrainSrc: 'bond_init',
      bondAct: scholar ? 'stage' : 'propose',
      considerations: considerations,
    };
  }
  function bondLinkRaiseCand(vid, villageId) {
    if (!aliveOnRoster(vid) || vid === scholarId() || !villageId) return null;
    var t = trustOf(vid);
    if (t == null || t < 20) return null;
    var weights = null;
    try { weights = (G.vgoalWeights ? G.vgoalWeights(vid) : null) || null; } catch (e) { weights = null; }
    if (!weights || (weights.build_standing || 0) < 1) return null;
    var lore = null;
    try { lore = (G.villageLoreOf ? G.villageLoreOf(vid) : {}) || {}; } catch (e) { lore = {}; }
    if (!lore[villageId]) return null;
    if (linkRaises()[vid]) return null;
    var day = dayOf();
    var lk = pairKey(vid, villageId);
    var lrec = linkRaiseState()[lk] || null;
    if (lrec && day - (lrec.day || 0) < LINK_RAISE_COOLDOWN_DAYS) return null;
    try { if (G.linkWith && G.linkWith(villageId)) return null; } catch (e) {}
    var found = false;
    try {
      var ovs = ((G.state || {}).otherVillages || []);
      for (var i = 0; i < ovs.length; i++) if (ovs[i] && ovs[i].id === villageId) { found = true; break; }
    } catch (e) {}
    if (!found) return null;
    var w = 1.2 + Math.min(1.5, weights.build_standing || 0);
    try {
      var temper = G.npcTemper ? G.npcTemper(vid) : null;
      if (temper === 'restless') w *= 1.1;
    } catch (e) {}
    w = Math.round(w * 1000) / 1000;
    return {
      kind: 'RAISE_LINK',
      w: w,
      villageId: villageId,
      targetVid: null,
      vbrainSrc: 'bond_init',
      bondAct: 'link',
      considerations: [
        { id: 'build_standing', raw: Math.round((weights.build_standing || 0) * 1000) / 1000, note: 'drive' },
        { id: 'village_lore', raw: 1, note: String(villageId) },
      ],
    };
  }
  // Dawn / scorer feed: every warmth-live person target + scholar stage +
  // known-village link raise this initiator could ask about today.
  function bondFeedCands(vid) {
    var out = [];
    if (!vid || vid === scholarId() || !aliveOnRoster(vid)) return out;
    try {
      var roster = [];
      try { roster = (G.npcIds ? G.npcIds() : (((G.state || {}).village || {}).roster || [])); } catch (e) {}
      for (var i = 0; i < roster.length; i++) {
        var other = roster[i];
        if (!other || other === vid) continue;
        var c = null;
        if (other === scholarId()) c = bondProposeCand(vid, other, { scholar: true });
        else c = bondProposeCand(vid, other, null);
        if (c) out.push(c);
      }
      var lore = null;
      try { lore = (G.villageLoreOf ? G.villageLoreOf(vid) : {}) || {}; } catch (e) { lore = {}; }
      var known = Object.keys(lore || {});
      for (var li = 0; li < known.length; li++) {
        var lc = bondLinkRaiseCand(vid, known[li]);
        if (lc) out.push(lc);
      }
    } catch (e) { bondWarn('bondFeedCands', e); }
    return out;
  }
  // Initiator's own scorer: weighted pick among social candidates vs a
  // HOLD rival. Hash rng — never Math.random. Does NOT write vbrain
  // commitment (dawn owns that); stashes _lastBondCandScore for probes.
  function bondScoreCands(initiator, cands, opts) {
    opts = opts || {};
    var list = (cands || []).filter(function (c) { return c && c.w > 0; });
    var holdW = 1.0;
    try {
      var weights = (G.vgoalWeights && G.vgoalWeights(initiator)) || null;
      if (weights && (weights.bonds || 0) >= 1) holdW = 0.55;
      if (weights && (weights.bonds || 0) >= 2) holdW = 0.3;
      if (weights && (weights.build_standing || 0) >= 1.5) {
        // Link raises share standing; slightly less hold when standing is live.
        for (var hi = 0; hi < list.length; hi++) {
          if (list[hi].kind === 'RAISE_LINK') { holdW = Math.min(holdW, 0.7); break; }
        }
      }
    } catch (e) {}
    if (typeof opts.holdW === 'number') holdW = opts.holdW;
    var hold = {
      kind: 'HOLD',
      w: holdW,
      considerations: [{ id: 'hold_social', raw: 1, note: 'not yet' }],
    };
    var scored = [hold].concat(list);
    var tot = 0;
    for (var i = 0; i < scored.length; i++) tot += (scored[i].w || 0);
    var salt = opts.salt || 'bondscore';
    var key = '';
    for (var k = 0; k < list.length; k++) {
      key += '|' + (list[k].kind || '') + ':' + (list[k].targetVid || list[k].villageId || '');
    }
    var roll = (typeof opts.roll === 'number') ? opts.roll : bondRoll(salt, initiator, dayOf(), key);
    var r = roll * (tot || 1);
    var pick = hold;
    for (var j = 0; j < scored.length; j++) {
      r -= (scored[j].w || 0);
      if (r <= 0) { pick = scored[j]; break; }
    }
    var annotated = scored.map(function (c) {
      return {
        kind: c.kind,
        score: Math.round((c.w || 0) * 1000) / 1000,
        targetVid: c.targetVid || null,
        villageId: c.villageId || null,
        bondAct: c.bondAct || null,
        considerations: (c.considerations || []).slice(),
      };
    });
    var result = {
      pick: pick.kind,
      accept: pick.kind === 'PROPOSE_BOND' || pick.kind === 'RAISE_LINK',
      chosen: pick.kind === 'HOLD' ? null : pick,
      candidates: annotated,
      total: Math.round((tot || 0) * 1000) / 1000,
      roll: roll,
      holdW: holdW,
    };
    try { G._lastBondCandScore = Object.assign({ initiator: initiator }, result); } catch (e) {}
    return result;
  }
  function bondScoreLogPush(entry) {
    try {
      var v = G.state.village || (G.state.village = {});
      v.bondScoreLog = v.bondScoreLog || [];
      v.bondScoreLog.push(entry);
      if (v.bondScoreLog.length > 200) v.bondScoreLog.splice(0, v.bondScoreLog.length - 200);
    } catch (e) {}
  }

  // ---------- THE VERB ----------
  // proposeBond(initiator, target, opts) -> {ok, accepted, outcome,
  // chance, gate, perceived, channels, reasons}. opts.roll pins the
  // decision roll (tests). The scholar is never auto-decided:
  // propose to the scholar only via stageBondProposal.
  function proposeBond(initiator, target, opts) {
    opts = opts || {};
    var day = dayOf();
    if (!initiator || !target || initiator === target) {
      return { ok: false, accepted: false, outcome: 'invalid', gate: null, perceived: false, channels: [] };
    }
    if (!aliveOnRoster(initiator) || !aliveOnRoster(target)) {
      return { ok: false, accepted: false, outcome: 'invalid', gate: null, perceived: false, channels: [] };
    }
    if (target === scholarId()) {
      return { ok: false, accepted: false, outcome: 'scholar-decides', gate: null, perceived: false, channels: [] };
    }
    var key = pairKey(initiator, target);
    var rec = bondState()[key] || null;
    if (rec && rec.outcome === 'accepted') {
      return { ok: false, accepted: false, outcome: 'already-bonded', gate: true, perceived: true, channels: ['bond'] };
    }
    if (rec && rec.outcome === 'refused' && day - (rec.day || 0) < REFUSE_COOLDOWN_DAYS) {
      return { ok: false, accepted: false, outcome: 'cooldown', gate: true, perceived: true, channels: ['bond'] };
    }
    // Already close: no need to propose what already is.
    try {
      var existing = (G.bondGet && G.bondGet(initiator, target)) || null;
      if (existing && ((existing.depth || 0) >= 1 || (existing.v || 0) >= 50)) {
        return { ok: false, accepted: false, outcome: 'already-bonded', gate: true, perceived: true, channels: ['bond'] };
      }
    } catch (e) {}
    var gate = bondProposalPerceived(initiator, target);
    if (!gate.perceived) {
      return { ok: false, accepted: false, outcome: 'not-perceived', gate: false, perceived: false, channels: [] };
    }
    var decision = null;
    // Tuning 3 (2026-11-05): the decision roll is hash-pinned too. The
    // shared character decision draws Math.random when no roll is given,
    // and 1-4 draws/run swung identical-seed panels (84102 bonds -29%,
    // 84103 days -18% on the full panel) with no game effect behind the
    // swing — the paired panel then measures noise, not the build.
    // Tests still pin the roll through opts.roll.
    var decideRoll = (typeof opts.roll === 'number') ? opts.roll : bondRoll('bonddecide', day, initiator, target);
    try {
      decision = G.npcInviteDecision(target, initiator, { kind: 'bond', roll: decideRoll });
    } catch (e) {
      bondWarn('proposeBond:decision', e);
      return { ok: false, accepted: false, outcome: 'no-decision', gate: true, perceived: true, channels: gate.channels };
    }
    var accepted = !!(decision && decision.accept);
    var outcome = accepted ? 'accepted' : 'refused';
    // A sick target vetoes the promise, not the friendship: no cooldown.
    if (decision && decision.veto === 'sick') {
      tele({ initiator: initiator, target: target, kind: 'person', outcome: outcome, chance: 0, reason: 'sick' });
      return { ok: true, accepted: false, outcome: outcome, chance: 0, gate: true, perceived: true, channels: gate.channels, reasons: decision.reasons, veto: 'sick' };
    }
    bondState()[key] = { day: day, outcome: outcome, initiator: initiator, target: target };
    if (accepted) {
      try {
        if (G.bondAdd) G.bondAdd(initiator, target, 10, 'bond proposed');
        var bnd = (G.bondGet && G.bondGet(initiator, target)) || null;
        if (bnd) { bnd.proposed = true; bnd.proposedDay = day; bnd.proposer = initiator; }
      } catch (e) { bondWarn('proposeBond:bondAdd', e); }
    }
    tele({ initiator: initiator, target: target, kind: 'person', outcome: outcome,
      chance: (decision && decision.chance) != null ? decision.chance : null,
      reason: (decision && decision.reasons) ? decision.reasons.join('; ') : null });
    if (playerAtHaven()) {
      try {
        var an = nameOf(initiator), bn = nameOf(target);
        if (accepted) {
          G.say(bondPick([
            an + ' takes ' + bn + '\'s hand. "Stick together, then — watch each other\'s backs."',
            an + ' nods at ' + bn + '. "You and me. We look out for each other now."',
            an + ' and ' + bn + ' shake on it. "Bonded. Whatever comes, we face it together."',
          ], 'say-accept:' + initiator + ':' + target));
        } else {
          G.say(bondPick([
            bn + ' shakes their head at ' + an + '. "Not yet. Ask me again when we\'ve been through more together."',
            bn + ' to ' + an + ': "Thanks — but I\'m not ready to promise that."',
            an + ' asks, and ' + bn + ' looks away. "Not like that. Not yet."',
          ], 'say-refuse:' + initiator + ':' + target));
        }
      } catch (e) { bondWarn('proposeBond:say', e); }
    }
    return { ok: true, accepted: accepted, outcome: outcome,
      chance: (decision && decision.chance) != null ? decision.chance : null,
      gate: true, perceived: true, channels: gate.channels, reasons: decision ? decision.reasons : null };
  }

  // ---------- DRIVE HOOK (VISIT arrivals) ----------
  // bondProposalMaybe(initiator, target): called when a VISIT lands.
  // Phase 4: raise a PROPOSE_BOND candidate (warmth/perception/affinity
  // gates inside bondProposeCand), let the initiator's scorer weigh it
  // against HOLD, and only then call proposeBond — which still routes
  // the target through npcInviteDecision. No cross-write bypass.
  function bondProposalMaybe(initiator, target) {
    if (!initiator || !target || initiator === target) return { ok: false, reason: 'invalid' };
    if (!aliveOnRoster(initiator) || !aliveOnRoster(target)) return { ok: false, reason: 'invalid' };
    if (target === scholarId()) return { ok: false, reason: 'scholar-decides' };
    var cand = bondProposeCand(initiator, target, null);
    if (!cand) {
      var drive = bondDriveLive(initiator, target);
      if (!drive.live) return { ok: false, reason: 'no-drive' };
      return { ok: false, reason: 'gated' };
    }
    var scored = bondScoreCands(initiator, [cand], { salt: 'maybe|' + initiator + '|' + target });
    bondScoreLogPush({
      day: dayOf(), source: 'visit', initiator: initiator,
      pick: scored.pick, candidates: scored.candidates,
    });
    if (!scored.accept || !scored.chosen || scored.chosen.kind !== 'PROPOSE_BOND') {
      return { ok: false, reason: 'scored-out', score: scored };
    }
    return (G.proposeBond || proposeBond)(initiator, target);
  }

  // ---------- NPC -> SCHOLAR PROPOSALS (pending beats) ----------
  function bondProposalLine(vid) {
    var n = nameOf(vid);
    return bondPick([
      '"Can I ask you something? ... I want us to stick together. Properly. Watch each other\'s backs."',
      '"I\'ve been thinking. You and me — we should be bonded. Not just neighbors. Will you stick with me?"',
      '"Hey. I want to ask it plain: will you be my bonded friend? I\'ll watch your back if you watch mine."',
    ], 'bondline:' + vid);
  }
  function stageBondProposal(vid) {
    var day = dayOf();
    if (!aliveOnRoster(vid) || vid === scholarId()) return null;
    try { if ((G.state.village.sick || {})[vid]) return null; } catch (e) {}
    var t = trustOf(vid);
    if (t == null || t < 12) return null;
    // Drive: the villager's bond with the scholar must be warming
    // (bondDriveLive). No perception check here — the scholar is a
    // co-resident they live beside daily, not a stranger.
    if (!bondDriveLive(vid, scholarId()).live) return null;
    if (bondRequests()[vid]) return null;
    var key = pairKey(vid, scholarId());
    var rec = bondState()[key] || null;
    if (rec && rec.outcome === 'accepted') return null;
    if (rec && rec.outcome === 'refused' && day - (rec.day || 0) < REFUSE_COOLDOWN_DAYS) return null;
    try {
      var existing = (G.bondGet && G.bondGet(vid, scholarId())) || null;
      if (existing && ((existing.depth || 0) >= 1 || (existing.v || 0) >= 50)) return null;
    } catch (e) {}
    // Do not clobber another undelivered talk request.
    try {
      var treq = ((G.state.village || {}).talkRequests || {})[vid];
      if (treq && !treq.delivered) return null;
    } catch (e) {}
    var pending = { vid: vid, day: day, kind: 'bond' };
    bondRequests()[vid] = pending;
    // JOIN-REQUEST HONESTY (journey-social r34): store the spoken ask
    // verbatim — the talk-request opener then carries the real question,
    // and the re-spoken beat in convoOpening uses the same line.
    var line = bondProposalLine(vid);
    pending.line = line;
    try {
      var v = G.state.village || (G.state.village = {});
      v.talkRequests = v.talkRequests || {};
      v.talkRequests[vid] = { line: '__NAME__: ' + line, day: day, bondProposal: true };
    } catch (e) { bondWarn('stage:talkRequest', e); }
    tele({ initiator: vid, target: scholarId(), kind: 'person', outcome: 'staged', chance: null });
    return pending;
  }
  function pendingBondProposal(vid) {
    try { return (bondRequests()[vid] || null); } catch (e) { return null; }
  }
  function consumeBondRequest(vid) {
    try { delete bondRequests()[vid]; } catch (e) {}
    try {
      var treq = ((G.state.village || {}).talkRequests || {})[vid];
      if (treq && treq.bondProposal) delete ((G.state.village || {}).talkRequests)[vid];
    } catch (e) {}
  }
  function acceptBondProposal(vid) {
    if (!pendingBondProposal(vid)) return { ok: false, reason: 'no-pending' };
    var day = dayOf();
    consumeBondRequest(vid);
    var key = pairKey(vid, scholarId());
    bondState()[key] = { day: day, outcome: 'accepted', initiator: vid, target: scholarId() };
    try {
      if (G.bondAdd) G.bondAdd(vid, scholarId(), 10, 'bond proposed');
      var bnd = (G.bondGet && G.bondGet(vid, scholarId())) || null;
      if (bnd) { bnd.proposed = true; bnd.proposedDay = day; bnd.proposer = vid; }
    } catch (e) { bondWarn('accept:bondAdd', e); }
    tele({ initiator: vid, target: scholarId(), kind: 'person', outcome: 'accepted', chance: null });
    return { ok: true, line: '"Stick together, then." They look steadier already.' };
  }
  function declineBondProposal(vid) {
    if (!pendingBondProposal(vid)) return { ok: false, reason: 'no-pending' };
    consumeBondRequest(vid);
    var key = pairKey(vid, scholarId());
    bondState()[key] = { day: dayOf(), outcome: 'refused', initiator: vid, target: scholarId() };
    try { if (G.bumpTrust) G.bumpTrust(vid, -1, 'declined their bond proposal'); } catch (e) {}
    tele({ initiator: vid, target: scholarId(), kind: 'person', outcome: 'refused', chance: null });
    var line = '"Another time, then." A small thing, pocketed.';
    try { if (G.declineLine) line = G.declineLine(vid); } catch (e) {}
    return { ok: true, line: line };
  }
  // Daily tick beside npcInviteTick (betrayalDaily): at most one
  // staging a day, and stale pendings (> 2 days) expire like invites.
  function npcBondTick() {
    try {
      var day = dayOf();
      var reqs = bondRequests();
      for (var vid in reqs) {
        if (reqs[vid] && day - (reqs[vid].day || 0) > 2) {
          consumeBondRequest(vid);
          tele({ initiator: vid, target: scholarId(), kind: 'person', outcome: 'expired', chance: null });
        }
      }
      if (bondRoll('bondtick', day) >= BOND_TICK_P) return;
      var roster = [];
      try { roster = (G.npcIds ? G.npcIds() : (((G.state || {}).village || {}).roster || [])); } catch (e) {}
      // Raise PROPOSE_BOND (scholar-stage) candidates; each initiator's
      // scorer weighs vs HOLD. At most one staging wins today.
      var scoredWins = [];
      for (var i = 0; i < roster.length; i++) {
        var id = roster[i];
        if (id === scholarId()) continue;
        var cand = bondProposeCand(id, scholarId(), { scholar: true });
        if (!cand) continue;
        var scored = bondScoreCands(id, [cand], { salt: 'bondtick|' + id });
        bondScoreLogPush({
          day: day, source: 'bondtick', initiator: id,
          pick: scored.pick, candidates: scored.candidates,
        });
        if (scored.accept && scored.chosen && scored.chosen.kind === 'PROPOSE_BOND') {
          scoredWins.push(id);
        }
      }
      if (!scoredWins.length) return;
      stageBondProposal(bondPick(scoredWins, 'bondtick'));
    } catch (e) { bondWarn('npcBondTick', e); }
  }

  // Daily NPC -> NPC pair proposals (tuning 2): villagers ask EACH
  // OTHER, not only the scholar — decided at once by character, no
  // conversation needed, so this is the path that produces wild
  // acceptances (the scholar path stages for the player to answer).
  // At most one pair a day. The warmth window, the perception gate,
  // and the dislike veto all apply, plus the refused-pair cooldown
  // the verb shares. The VISIT-arrival path alone never fires: 19
  // arrivals in 90 days all missed the drive for their specific pair.
  function npcPairBondTick() {
    try {
      var day = dayOf();
      if (bondRoll('pairtick', day) >= PAIR_TICK_P) return;
      var roster = [];
      try { roster = (G.npcIds ? G.npcIds() : (((G.state || {}).village || {}).roster || [])); } catch (e) {}
      // Raise PROPOSE_BOND candidates per eligible pair; initiator scorer
      // weighs. At most one proposeBond fires (target still invites).
      var wins = [];
      for (var i = 0; i < roster.length; i++) {
        var a = roster[i];
        if (a === scholarId()) continue;
        if (!aliveOnRoster(a)) continue;
        for (var j = 0; j < roster.length; j++) {
          var b = roster[j];
          if (b === a || b === scholarId()) continue;
          if (!aliveOnRoster(b)) continue;
          var cand = bondProposeCand(a, b, null);
          if (!cand) continue;
          var scored = bondScoreCands(a, [cand], { salt: 'pairtick|' + a + '|' + b });
          bondScoreLogPush({
            day: day, source: 'pairtick', initiator: a, target: b,
            pick: scored.pick, candidates: scored.candidates,
          });
          if (scored.accept && scored.chosen && scored.chosen.kind === 'PROPOSE_BOND') {
            wins.push([a, b]);
          }
        }
      }
      if (!wins.length) return;
      var chosen = bondPick(wins, 'pairtick');
      (G.proposeBond || proposeBond)(chosen[0], chosen[1]);
    } catch (e) { bondWarn('npcPairBondTick', e); }
  }

  // ---------- LINK RAISES (NPC -> bearer) ----------
  function linkRaiseLine(vid) {
    var pending = pendingLinkRaise(vid);
    var vname = 'them';
    var how = null;
    try {
      if (pending && pending.villageId) {
        var ovs = ((G.state || {}).otherVillages || []);
        for (var i = 0; i < ovs.length; i++) if (ovs[i] && ovs[i].id === pending.villageId) { vname = ovs[i].name || ovs[i].id; break; }
        var lore = (G.villageLoreOf ? G.villageLoreOf(vid) : {}) || {};
        how = ((lore[pending.villageId] || {}).how) || null;
      }
    } catch (e) {}
    if (how === 'visit') return '"I\'ve been to ' + vname + '. I know their fires. We should link with them — we\'d be stronger together."';
    if (how === 'seen-nearby') return '"I\'ve seen ' + vname + '\'s fires from the road. We should link with them — we\'d be stronger together."';
    if (how === 'rumor' || how === 'told') return '"I\'ve heard good things about ' + vname + '. We should link with them — we\'d be stronger together."';
    return '"We should link with ' + vname + '. I know them. We\'d be stronger together."';
  }
  function stageLinkRaise(vid, villageId) {
    var day = dayOf();
    if (!aliveOnRoster(vid) || vid === scholarId() || !villageId) return null;
    var t = trustOf(vid);
    if (t == null || t < 20) return null;
    var weights = null;
    try { weights = (G.vgoalWeights ? G.vgoalWeights(vid) : null) || null; } catch (e) { weights = null; }
    if (!weights || (weights.build_standing || 0) < 1) return null;
    // Perception: the raiser must personally know the village.
    var lore = null;
    try { lore = (G.villageLoreOf ? G.villageLoreOf(vid) : {}) || {}; } catch (e) { lore = {}; }
    if (!lore[villageId]) return null;
    if (linkRaises()[vid]) return null;
    // No re-raise spam: the same villager raising the same village
    // again within 14 days of a decision or expiry waits.
    var lk = pairKey(vid, villageId);
    var lrec = linkRaiseState()[lk] || null;
    if (lrec && day - (lrec.day || 0) < LINK_RAISE_COOLDOWN_DAYS) return null;
    try {
      if (G.linkWith && G.linkWith(villageId)) return null; // already linked
    } catch (e) {}
    var found = false;
    try {
      var ovs = ((G.state || {}).otherVillages || []);
      for (var i = 0; i < ovs.length; i++) if (ovs[i] && ovs[i].id === villageId) { found = true; break; }
    } catch (e) {}
    if (!found) return null;
    try {
      var treq = ((G.state.village || {}).talkRequests || {})[vid];
      if (treq && !treq.delivered) return null;
    } catch (e) {}
    var pending = { vid: vid, villageId: villageId, day: day, kind: 'link' };
    linkRaises()[vid] = pending;
    // Same verbatim-ask rule as bond proposals (see stageBondProposal).
    var line = linkRaiseLine(vid);
    pending.line = line;
    try {
      var v = G.state.village || (G.state.village = {});
      v.talkRequests = v.talkRequests || {};
      v.talkRequests[vid] = { line: '__NAME__: ' + line, day: day, linkRaise: true };
    } catch (e) {}
    tele({ initiator: vid, target: villageId, kind: 'link', outcome: 'staged', chance: null });
    return pending;
  }
  function pendingLinkRaise(vid) {
    try { return (linkRaises()[vid] || null); } catch (e) { return null; }
  }
  function consumeLinkRaise(vid) {
    try { delete linkRaises()[vid]; } catch (e) {}
    try {
      var treq = ((G.state.village || {}).talkRequests || {})[vid];
      if (treq && treq.linkRaise) delete ((G.state.village || {}).talkRequests)[vid];
    } catch (e) {}
  }
  function acceptLinkRaise(vid) {
    var pending = pendingLinkRaise(vid);
    if (!pending) return { ok: false, reason: 'no-pending' };
    consumeLinkRaise(vid);
    linkRaiseState()[pairKey(vid, pending.villageId)] = { day: dayOf(), outcome: 'accepted' };
    // The raiser tells the bearer what they know — the player cannot
    // propose to a village they never heard of, but their villager
    // just told them about it. Then the PLAYER proposes (existing
    // courtship, player's act, player's decision).
    try {
      if (G.tellVillageLore) G.tellVillageLore(vid, scholarId(), pending.villageId);
    } catch (e) { bondWarn('acceptLink:tellLore', e); }
    var res = null;
    try { res = G.proposeLink ? G.proposeLink(pending.villageId) : null; } catch (e) { bondWarn('acceptLink:proposeLink', e); res = null; }
    tele({ initiator: vid, target: pending.villageId, kind: 'link', outcome: 'accepted', chance: null });
    return { ok: true, proposed: true, villageId: pending.villageId, link: res };
  }
  function declineLinkRaise(vid) {
    var pending = pendingLinkRaise(vid);
    if (!pending) return { ok: false, reason: 'no-pending' };
    consumeLinkRaise(vid);
    linkRaiseState()[pairKey(vid, pending.villageId)] = { day: dayOf(), outcome: 'refused' };
    tele({ initiator: vid, target: pending.villageId, kind: 'link', outcome: 'refused', chance: null });
    return { ok: true, line: '"Not them. Not now." The idea is set aside, not forgotten.' };
  }
  // Daily tick beside npcBondTick: at most one staging a day; stale
  // pendings (> 2 days) expire.
  function npcLinkRaiseTick() {
    try {
      var day = dayOf();
      var raises = linkRaises();
      for (var vid in raises) {
        if (raises[vid] && day - (raises[vid].day || 0) > 2) {
          var vId = raises[vid].villageId;
          consumeLinkRaise(vid);
          linkRaiseState()[pairKey(vid, vId)] = { day: day, outcome: 'expired' };
          tele({ initiator: vid, target: vId, kind: 'link', outcome: 'expired', chance: null });
        }
      }
      if (bondRoll('linktick', day) >= LINK_TICK_P) return;
      var roster = [];
      try { roster = (G.npcIds ? G.npcIds() : (((G.state || {}).village || {}).roster || [])); } catch (e) {}
      // Raise RAISE_LINK candidates; initiator scorer weighs vs HOLD.
      var wins = [];
      for (var i = 0; i < roster.length; i++) {
        var id = roster[i];
        if (id === scholarId()) continue;
        if (!aliveOnRoster(id)) continue;
        var lore = null;
        try { lore = (G.villageLoreOf ? G.villageLoreOf(id) : {}) || {}; } catch (e) { lore = {}; }
        var known = Object.keys(lore || {});
        var linkCands = [];
        for (var ki = 0; ki < known.length; ki++) {
          var lc = bondLinkRaiseCand(id, known[ki]);
          if (lc) linkCands.push(lc);
        }
        if (!linkCands.length) continue;
        var scored = bondScoreCands(id, linkCands, { salt: 'linktick|' + id });
        bondScoreLogPush({
          day: day, source: 'linktick', initiator: id,
          pick: scored.pick, candidates: scored.candidates,
        });
        if (scored.accept && scored.chosen && scored.chosen.kind === 'RAISE_LINK') {
          wins.push({ vid: id, villageId: scored.chosen.villageId });
        }
      }
      if (!wins.length) return;
      var chosen = bondPick(wins, 'linktick');
      stageLinkRaise(chosen.vid, chosen.villageId);
    } catch (e) { bondWarn('npcLinkRaiseTick', e); }
  }

  // Scholar -> villager lore spread (tuning 2): the scholar comes
  // home knowing villages (rumors, approaches, links) and tells
  // villagers about them over talk — the tellVillageLore primitive,
  // used as its comment intends ("gossip spread ... for
  // conversation-gossip wiring"). Told, secondhand, traced to the
  // scholar by name; never from a bare flag. Without this, no villager
  // ever knows a village (census: loreAny 0 across 90 days) and link
  // raises can never fire. Silent bookkeeping — the link raise is the
  // visible moment. Called from the endConvo wrap below.
  function maybeTellVillageLore(vid) {
    if (!vid || vid === scholarId()) return null;
    if (!aliveOnRoster(vid)) return null;
    var known = null;
    try { known = (G.villageLoreOf ? G.villageLoreOf(scholarId()) : {}) || {}; } catch (e) { known = {}; }
    var mine = null;
    try { mine = (G.villageLoreOf ? G.villageLoreOf(vid) : {}) || {}; } catch (e) { mine = {}; }
    var open = [];
    for (var id in known) if (!mine[id]) open.push(id);
    if (!open.length) return null;
    if (bondRoll('tell', scholarId(), vid, dayOf()) >= TELL_P) return null;
    var villageId = bondPick(open, 'tell:' + vid);
    try {
      if (G.tellVillageLore) return G.tellVillageLore(scholarId(), vid, villageId);
    } catch (e) { bondWarn('tell:lore', e); }
    return null;
  }

  // ---------- CONVERSATION TURN (bond:/link: choices) ----------
  // Mirrors betrayalTurn's finish: sayLine is the one transcript
  // writer (diegeticAct), the wind-down budget binds the verb.
  function bondTurn(vid, choiceId) {
    var c = null;
    try { c = G.convoGet(vid); } catch (e) {}
    var parts = (choiceId || '').split(':');
    var kind = parts[0], act = parts[1];
    var line = null, youSaid = null;
    function finish(l, you) {
      line = l; youSaid = you || null;
      try {
        if (you && c) c.transcript.push({ who: 'you', text: you });
        line = G.sayLine(vid, line, { diegeticAct: true }) || line;
        if (c) c.exchanges = (c.exchanges || 0) + 1;
      } catch (e) { bondWarn('bondTurn:finish', e); }
      try {
        if (typeof G.convoMaybeWinddown === 'function') {
          var wd = G.convoMaybeWinddown(vid);
          if (wd) return wd;
        }
      } catch (e) { bondWarn('bondTurn:winddown', e); }
      return { line: line, choices: G.convoChoices(vid), ended: false, transcript: (c && c.transcript) ? c.transcript.slice() : [] };
    }
    // LANGUAGE GATE (journey-deepening r114, defense in depth): a bond:/
    // link: choice that reaches here without shared words (any path that
    // bypassed the menu gate above) is refused with an honest line and NO
    // state change — the proposal stays pending. Fail-open if commLevel
    // is missing.
    if (kind === 'bond' || kind === 'link') {
      var commB = null;
      try { commB = (G.commLevel && G.commLevel(vid)) || null; } catch (e) { commB = null; }
      if (commB && commB.level === 'none') {
        return finish('"..." No shared words yet — you cannot agree to that in a language neither of you speaks.', '"..."');
      }
    }
    if (kind === 'bond' && act === 'accept') {
      var r = (G.acceptBondProposal || acceptBondProposal)(vid);
      return finish((r && r.line) || 'You go.', '"Yes. Stick together."');
    }
    if (kind === 'bond' && act === 'decline') {
      var d = (G.declineBondProposal || declineBondProposal)(vid);
      return finish((d && d.line) || '"Not this time."', '"Not this time."');
    }
    if (kind === 'link' && act === 'accept') {
      var a = (G.acceptLinkRaise || acceptLinkRaise)(vid);
      if (!a.ok) return finish('"Not them. Not now."', '"Not now."');
      return finish('"All right — let\'s ask them." You carry the proposal to ' + (function () { try { var ovs = ((G.state || {}).otherVillages || []); for (var i = 0; i < ovs.length; i++) if (ovs[i] && ovs[i].id === a.villageId) return ovs[i].name || ovs[i].id; } catch (e) {} return 'them'; })() + '.', '"All right. Let\'s ask them."');
    }
    if (kind === 'link' && act === 'decline') {
      var dl = (G.declineLinkRaise || declineLinkRaise)(vid);
      return finish((dl && dl.line) || '"Not them. Not now."', '"Not them. Not now."');
    }
    return finish('"..."', '"..."');
  }
  function bondChoices(vid) {
    var out = [];
    try {
      // LANGUAGE GATE (journey-deepening r114): a bond/link commitment is
      // made in words — with no shared language there is nothing to agree
      // in. Canon (docs/CONVERSATIONS.md): no shared language -> the
      // conversation is nonverbal (gesture choices only). 'partial' still
      // offers: partial IS shared language. Fail-open if commLevel is
      // missing (offer, preserving old behavior for unknown callers).
      // The staged proposal stays staged until expiry (3 days); the
      // villager may re-stage after the scholar learns the language.
      var comm = null;
      try { comm = (G.commLevel && G.commLevel(vid)) || null; } catch (e) { comm = null; }
      if (comm && comm.level === 'none') return out;
      // SPOKEN-ASK GATE (journey-scale r132, 2026-11-11): a bond/link
      // answer is offered only once the ask has been HEARD in this
      // sitting (c.linkRaiseSpoken / c.bondProposalSpoken, set in
      // convoRecordSpokenBeat, reset per sitting in startConvo). Before
      // this, bondChoices prepended the answers whenever the ask was
      // pending — so a villager asking to forage could be answered with
      // "All right. Let's ask them." and a link proposal carried to a
      // village never mentioned (r131 Claudete, seed 131102 d120).
      // Canon (docs/CONVERSATIONS.md): "Replies belong to the spoken
      // exchange." The pending survives unanswered (3-day expiry,
      // re-spoken next sitting); nothing here consumes it. Fail-open
      // when there is no convo record at all (unknown caller, old
      // behaviour); fail-closed when a record exists and the ask was
      // not spoken this sitting.
      var c = null;
      try { c = (G.convoGet && G.convoGet(vid)) || null; } catch (e) { c = null; }
      var linkSpoken = !c || !!c.linkRaiseSpoken;
      var bondSpoken = !c || !!c.bondProposalSpoken;
      if (pendingBondProposal(vid) && bondSpoken) {
        out.push({ id: 'bond:accept', label: '"Yes. Stick together."' });
        out.push({ id: 'bond:decline', label: '"Not like that. Not yet."' });
      }
      if (pendingLinkRaise(vid) && linkSpoken) {
        out.push({ id: 'link:accept', label: '"All right. Let\'s ask them."' });
        out.push({ id: 'link:decline', label: '"Not them. Not now."' });
      }
    } catch (e) { bondWarn('bondChoices', e); }
    return out;
  }

  var methods = {
    bondProposalPerceived: function (a, b) { return bondProposalPerceived(a, b); },
    bondDriveLive: function (a, b) { return bondDriveLive(a, b); },
    bondRoll: function () { return bondRoll.apply(null, arguments); },
    proposeBond: function (a, b, opts) { return proposeBond(a, b, opts); },
    bondProposalMaybe: function (a, b) { return bondProposalMaybe(a, b); },
    bondProposeCand: function (a, b, opts) { return bondProposeCand(a, b, opts); },
    bondLinkRaiseCand: function (vid, villageId) { return bondLinkRaiseCand(vid, villageId); },
    bondFeedCands: function (vid) { return bondFeedCands(vid); },
    bondScoreCands: function (vid, cands, opts) { return bondScoreCands(vid, cands, opts); },
    stageBondProposal: function (vid) { return stageBondProposal(vid); },
    pendingBondProposal: function (vid) { return pendingBondProposal(vid); },
    acceptBondProposal: function (vid) { return acceptBondProposal(vid); },
    declineBondProposal: function (vid) { return declineBondProposal(vid); },
    npcBondTick: function () { return npcBondTick(); },
    npcPairBondTick: function () { return npcPairBondTick(); },
    maybeTellVillageLore: function (vid) { return maybeTellVillageLore(vid); },
    stageLinkRaise: function (vid, villageId) { return stageLinkRaise(vid, villageId); },
    pendingLinkRaise: function (vid) { return pendingLinkRaise(vid); },
    acceptLinkRaise: function (vid) { return acceptLinkRaise(vid); },
    declineLinkRaise: function (vid) { return declineLinkRaise(vid); },
    npcLinkRaiseTick: function () { return npcLinkRaiseTick(); },
    bondProposalLine: function (vid) { return bondProposalLine(vid); },
    linkRaiseLine: function (vid) { return linkRaiseLine(vid); },
    bondChoices: function (vid) { return bondChoices(vid); },
    bondTurn: function (vid, choiceId) { return bondTurn(vid, choiceId); },
  };
  Object.assign(G, methods);

  // ============ WRAPS (chain-safe: capture the current fn) ============
  (function attach() {
    var _convoChoices = G.convoChoices;
    G.convoChoices = function (vid) {
      var base = _convoChoices ? _convoChoices.call(this, vid) : [];
      try {
        var extra = this.bondChoices(vid);
        if (extra && extra.length) return extra.concat(base);
      } catch (e) { console.warn('[bond-initiation] convoChoices extra', e); }
      return base;
    };
    // Lore spread: when a conversation with the scholar ends, the
    // scholar may have told the villager about a village they know.
    var _endConvo = G.endConvo;
    if (typeof _endConvo === 'function') {
      G.endConvo = function (vid) {
        var r = _endConvo.apply(this, arguments);
        try { G.maybeTellVillageLore(vid); } catch (e) { bondWarn('endConvo:tell', e); }
        return r;
      };
    }
    var _convoTurn = G.convoTurn;
    G.convoTurn = function (vid, choiceId) {
      try {
        if (typeof choiceId === 'string' && (choiceId.indexOf('bond:') === 0 || choiceId.indexOf('link:') === 0)) {
          try { this.convoMarkSubstantive(vid, choiceId); } catch (e) {}
          try { if (typeof this.convoDropUnspoken === 'function') this.convoDropUnspoken(vid, choiceId); } catch (e) {}
          var bres = this.bondTurn(vid, choiceId);
          // DECIDED-ASK CLEAR (journey-deepening r114): the ask is
          // answered — its queued re-speak must not come back through the
          // continuer. convoDropUnspoken above re-staged the queued beat
          // into bondPending/linkPending BEFORE the decision; the decision
          // consumed the request but not the re-staged beat, so a later
          // goon ("And?") re-spoke it verbatim (Grace day 27, seed 95601,
          // r113). Same shape as the r40 invite double-serve (fixed at
          // conversation.js:5183); the bond path never got the matching
          // clear. Clear ONLY the decided kind: an undecided ask still
          // comes back when dodged (r8 design). Only the two kinds'
          // pending slots and held beats are touched.
          try {
            var cc = (typeof this.convoGet === 'function') ? this.convoGet(vid) : null;
            if (cc) {
              if (choiceId.indexOf('bond:') === 0) {
                cc.bondPending = null;
                if (cc.heldBeats) cc.heldBeats = cc.heldBeats.filter(function (h) { return !(h && h.bondproposal); });
              } else {
                cc.linkPending = null;
                if (cc.heldBeats) cc.heldBeats = cc.heldBeats.filter(function (h) { return !(h && h.linkraise); });
              }
            }
          } catch (e) { bondWarn('convoTurn:clearDecided', e); }
          return bres;
        }
      } catch (e) { bondWarn('convoTurn:bond', e); }
      return _convoTurn.call(this, vid, choiceId);
    };
  })();
})();
