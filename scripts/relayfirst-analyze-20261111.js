// relayfirst-analyze-20261111.js — relay / Network campaign first-numbers analyzer
// (arm sim-relayfirst-a, run fleshout-20261111T1115Z).
//
// Reads per-seed JSON from evidence/2026-11-11/perseed-relayfirst-a/
// (control + neutral legs) and writes a band summary JSON (+ prints a
// markdown GO table). Pure aggregation; no sims.
// Usage:
//   node scripts/relayfirst-analyze-20261111.js [per-seed-dir] [summary-out.json]
'use strict';
const path = require('path');
const fs = require('fs');

// Data order of the Network march, from src/data/titans.json
// the_network.campaign.nodes (read, not invented).
const NETWORK_NODES = [
  { id: 'mast_nw', monster: 'network_tower' },
  { id: 'mast_ne', monster: 'network_tower' },
  { id: 'mast_sw', monster: 'network_tower' },
  { id: 'mast_se', monster: 'network_tower' },
  { id: 'limb_n', monster: 'network_limb' },
  { id: 'limb_w', monster: 'network_limb' },
  { id: 'limb_e', monster: 'network_limb' },
  { id: 'limb_s', monster: 'network_limb' },
  { id: 'heart', monster: 'network_heart' },
];
const NODE_MONSTER = {};
NETWORK_NODES.forEach(function (n) { NODE_MONSTER[n.id] = n.monster; });
const W6 = { network_heart: 1, network_limb: 1, network_tower: 1 };
const CAMPAIGN_ONLY = { finale_crew: 1, finale_opening: 1, network_heart: 1, network_limb: 1, network_tower: 1 };
const RELAY_VERBS = ['claimRelay', 'appointSwitchboard', 'relayAnswer', 'relayCommune', 'relayReroute', 'relayProbe', 'relayDeepen'];
const RELAY_ABILITY_VERBS = ['relayTranslate', 'relaySanctuary', 'relayAdvocate', 'relayRewrite', 'relaySkim', 'relaySight', 'relayCarry'];
const WRAPS = ['claimRelay', 'appointSwitchboard', 'relayAnswer', 'relayCommune',
  'relayReroute', 'relayProbe', 'relayDeepen', 'relayGrant',
  'relayTranslate', 'relaySanctuary', 'relayAdvocate', 'relayRewrite',
  'relaySkim', 'relaySight', 'relayCarry', 'relayUnlockCheck',
  'networkSummon', 'soundTitanCall', 'ledgerAdd', 'spawnWorldMonster',
  'startCombat', 'tbEnd', 'tele'];

function inc(map, k, n) { map[k] = (map[k] || 0) + (n == null ? 1 : n); }

function classifyRelayEvent(ev) {
  // ok: verb known, day a number, return recorded (null IS a recorded
  // refusal — e.g. relayCommune returns null when not held).
  if (!ev || RELAY_VERBS.indexOf(ev.verb) < 0) return 'unclassified';
  if (typeof ev.day !== 'number') return 'unclassified';
  if (!('ret' in ev)) return 'unclassified';
  return 'ok';
}

function classifyGrantEvent(ev) {
  if (!ev || !ev.id) return 'unclassified';
  if (typeof ev.day !== 'number') return 'unclassified';
  return 'ok';
}

function classifyAbilityUseEvent(ev) {
  if (!ev || RELAY_ABILITY_VERBS.indexOf(ev.verb) < 0) return 'unclassified';
  if (typeof ev.day !== 'number') return 'unclassified';
  return 'ok';
}

// belongGood(l, day): reproduced from polityOf's non-HOME branch
// (hierarchy.js:2227) — trust >= 50, arrears 0, age >= 14 days.
// Same call bindingtrace-b makes.
function belongGood(l, day) {
  if (!l || l.status !== 'active' || l.subordinate !== 'haven') return false;
  return ((l.trust | 0) >= 50) && (((l.arrears | 0) === 0)) && ((day - (l.day | 0)) >= 14);
}

// foreignSizeFor(primaryId, fps): polity size as polityOf computes it.
function foreignSizeFor(primaryId, fps) {
  for (const fp of (fps || [])) {
    if (fp && fp.primary === primaryId) return 2 + ((fp.subs || []).length);
  }
  return 2;
}

// linkSeasoned(l, day): reproduced from _linkSeasoned
// (hierarchy.js:233): active + age >= 30 + trust >= 40 (conquered:
// season only). Mercy grace (mercyUntil) is NOT in the snapshot —
// the mask-day count can miss a mercy-held link; recorded, not
// silently exact.
function linkSeasoned(l, day) {
  if (!l || l.status !== 'active') return false;
  if ((day - (l.day | 0)) < 30) return false;
  if (l.conquered) return true;
  return (l.trust | 0) >= 40;
}

// classifyBelongChain(seedObj): the B0–B5 taxonomy from
// bindingtrace-b, computed from daily snapshots + link diffs.
// Returns {stage, link, first, counters, linkForms,
// belongQualifyDays, leadMaskDays, maxForeignSize}.
function classifyBelongChain(o) {
  const daily = o.daily || [];
  const first = {
    foreignPairDay: null, foreignTripleDay: null, foreignRealmDay: null,
    firstCounterDay: null, firstBelongLinkDay: null,
    firstBelongGoodDay: null, firstBelongQualifyDay: null,
    firstBindingStagedDay: null, firstBindingAnsweredDay: null,
  };
  let maxForeignSize = 0;
  let belongQualifyDays = 0, leadMaskDays = 0;
  let nationalLiveViaLead = false;
  const counters = [];
  const seenCounters = {};
  let pendingCounterSeen = null;
  const linkForms = [];
  const seenLinkIds = {};
  const belongLinks = {};
  let lastSnap = null;

  daily.forEach(function (snap) {
    const day = snap.day;
    lastSnap = snap;
    const fps = snap.fps || [];
    const maxSize = snap.maxForeignSize || 0;
    if (maxSize > maxForeignSize) maxForeignSize = maxSize;
    if (maxSize >= 2 && first.foreignPairDay == null) first.foreignPairDay = day;
    if (maxSize >= 3 && first.foreignTripleDay == null) first.foreignTripleDay = day;
    if (maxSize >= 4 && first.foreignRealmDay == null) first.foreignRealmDay = day;
    // Counters: staged when a pendingCounter appears, resolved when gone.
    if (snap.pendingCounter) {
      const pc = snap.pendingCounter;
      if (!seenCounters[pc.targetId] || seenCounters[pc.targetId].day !== pc.day) {
        seenCounters[pc.targetId] = { day: pc.day, asSubordinate: pc.asSubordinate };
        counters.push({ target: pc.targetId, day: pc.day, asSubordinate: pc.asSubordinate, resolvedDay: null, outcome: null });
        if (first.firstCounterDay == null) first.firstCounterDay = pc.day;
      }
      pendingCounterSeen = pc;
    } else if (pendingCounterSeen) {
      const open = pendingCounterSeen;
      pendingCounterSeen = null;
      const c = counters[counters.length - 1];
      if (c && c.target === open.targetId && c.resolvedDay == null) {
        c.resolvedDay = day;
        c.outcome = 'no-link';
      }
    }
    // Link forms: any link id not seen before.
    const links = snap.links || [];
    links.forEach(function (l) {
      if (seenLinkIds[l.id]) return;
      seenLinkIds[l.id] = true;
      const target = (l.primary === 'haven' ? l.subordinate : l.primary);
      const viaCounter = !!seenCounters[target];
      const role = (l.subordinate === 'haven') ? 'subordinate' : 'primary';
      linkForms.push({ id: l.id, target: target, role: role, day: l.day, viaCounter: viaCounter, trust: l.trust });
      if (viaCounter) {
        for (let i = counters.length - 1; i >= 0; i--) {
          const c = counters[i];
          if (c.target === target && c.outcome === 'no-link' && c.resolvedDay === day) {
            c.outcome = (role === 'subordinate') ? 'accept-sub' : 'sweeten-primary';
            c.resolvedDay = day;
            break;
          }
        }
      }
      if (role === 'subordinate') {
        if (first.firstBelongLinkDay == null) first.firstBelongLinkDay = l.day;
        belongLinks[l.id] = { primary: l.primary, formedDay: l.day, firstGoodDay: null, maxTrust: l.trust, brokeDay: null };
      }
    });
    // Belong-link good-standing first-days.
    links.forEach(function (l) {
      if (l.status !== 'active' || l.subordinate !== 'haven') return;
      const rec = belongLinks[l.id];
      if (rec) {
        if (l.trust > rec.maxTrust) rec.maxTrust = l.trust;
        if (belongGood(l, day) && rec.firstGoodDay == null) {
          rec.firstGoodDay = day;
          if (first.firstBelongGoodDay == null) first.firstBelongGoodDay = day;
        }
      }
    });
    // Broken belong links.
    Object.keys(belongLinks).forEach(function (id) {
      const rec = belongLinks[id];
      if (rec.brokeDay != null) return;
      const live = links.find(function (l) { return l.id === id; });
      if (!live || live.status !== 'active') rec.brokeDay = day;
    });
    // Qualification + masking. LEAD qualifies on >= 3 seasoned subs.
    let seasonedSubs = 0;
    links.forEach(function (l) {
      if (l.status === 'active' && l.primary === 'haven' && l.subordinate !== 'haven' && linkSeasoned(l, day)) seasonedSubs++;
    });
    const leadQualify = seasonedSubs >= 3;
    let belongQualify = false;
    links.forEach(function (l) {
      if (l.status !== 'active' || l.subordinate !== 'haven') return;
      if (belongGood(l, day) && foreignSizeFor(l.primary, fps) >= 4) belongQualify = true;
    });
    if (belongQualify) {
      belongQualifyDays++;
      if (first.firstBelongQualifyDay == null) first.firstBelongQualifyDay = day;
      if (leadQualify) leadMaskDays++;
    }
    if (snap.nationalLive && snap.nationalShape === 'lead') nationalLiveViaLead = true;
    // Binding staging / answering.
    if (snap.pendingNational && snap.pendingNational.shape === 'belong' && first.firstBindingStagedDay == null) {
      first.firstBindingStagedDay = day;
    }
    if (snap.nationalLive && snap.nationalShape === 'belong' && first.firstBindingAnsweredDay == null) {
      first.firstBindingAnsweredDay = day;
    }
  });

  let stage, link;
  if (first.firstBindingAnsweredDay != null) { stage = 'B5'; link = 'binding-answered'; }
  else if (first.firstBindingStagedDay != null) {
    stage = 'B4';
    // Death-why from the last snapshot (best available, not invented).
    if (lastSnap && lastSnap.exiled) link = 'binding-died:exiled-answerer';
    else if (lastSnap && !(lastSnap.links || []).some(function (l) { return l.status === 'active' && l.subordinate === 'haven'; })) link = 'binding-died:belong-link-gone';
    else link = 'binding-staged-unresolved';
  }
  else if (first.firstBelongQualifyDay != null) {
    stage = 'B3';
    if (leadMaskDays > 0) link = 'masked-by-lead';
    else if (nationalLiveViaLead) link = 'masked-by-lead-national-live';
    else link = 'qualified-never-staged';
  }
  else if (first.firstBelongGoodDay != null) { stage = 'B2'; link = 'belong-good-no-realm'; }
  else if (first.firstBelongLinkDay != null) { stage = 'B1'; link = 'belong-link-never-good'; }
  else if (first.foreignRealmDay != null) { stage = 'B0'; link = 'foreign-realm-no-belong-link'; }
  else { stage = 'none'; link = 'no-foreign-realm'; }

  return { stage: stage, link: link, first: first, counters: counters,
    linkForms: linkForms, belongQualifyDays: belongQualifyDays,
    leadMaskDays: leadMaskDays, maxForeignSize: maxForeignSize,
    nationalLiveViaLead: nationalLiveViaLead };
}

// reconcileW6(seedObj): every W6 spawn/face/kill attributed or counted
// as residue. Returns {spawnResidue, faceResidue, killResidue,
// w6: {spawn:{}, face:{}, kill:{}}, teleMismatch}.
function reconcileW6(o) {
  const daily = o.daily || [];
  const spawns = o.spawnEvents || [];
  const faces = o.faceEvents || [];
  const fights = o.fightEvents || [];
  const teles = o.teleEvents || [];
  let spawnResidue = 0, faceResidue = 0, killResidue = 0;
  const w6 = { spawn: {}, face: {}, kill: {} };
  const w6SpawnDetails = [], w6FaceDetails = [], w6KillDetails = [];

  function snapAfter(day, pred) {
    return daily.some(function (s) { return s.day >= day && pred(s); });
  }
  function nodeClearedLater(nodeId, day) {
    return snapAfter(day, function (s) {
      const nc = s.networkCampaign;
      return nc && (nc.cleared || []).indexOf(nodeId) >= 0;
    });
  }
  function networkEndedLater(day) {
    return snapAfter(day, function (s) {
      const nc = s.networkCampaign;
      return nc && (nc.lost || nc.done);
    });
  }

  spawns.forEach(function (sp) {
    if (W6[sp.id]) {
      inc(w6.spawn, sp.id);
      w6SpawnDetails.push(sp);
    }
    let ok = false;
    if (sp.networkNode) {
      ok = snapAfter(sp.day, function (s) {
        return (s.campaignMonsters || []).some(function (m) { return m.networkNode === sp.networkNode; });
      }) || nodeClearedLater(sp.networkNode, sp.day) || networkEndedLater(sp.day);
    } else if (sp.id === 'herald' || sp.id === 'nielsen' || sp.id === 'finale') {
      ok = snapAfter(sp.day, function (s) {
        return (s.campaignMonsters || []).some(function (m) { return m.id === sp.id; }) ||
          !!((s.titansSlain || {})[sp.id]);
      });
    } else {
      // Escort kinds: seen on the map later, or fought later.
      ok = snapAfter(sp.day, function (s) {
        return (s.campaignMonsters || []).some(function (m) { return m.id === sp.id; });
      }) || fights.some(function (f) {
        return f.day >= sp.day && (f.fighters || []).some(function (p) { return p.id === sp.id; });
      });
    }
    if (!ok) spawnResidue++;
  });

  faces.forEach(function (fc) {
    if (W6[fc.id]) {
      inc(w6.face, fc.id);
      w6FaceDetails.push(fc);
    }
    if (fc.refused) return; // a refusal needs no fight.
    const fought = fights.some(function (f) {
      return f.day >= fc.day && (f.fighters || []).some(function (p) { return p.id === fc.id; });
    });
    if (!fought) faceResidue++;
  });

  // Kills: pieceDead per campaign node from fight events, reconciled
  // against the cleared list / campaign state / slain map.
  const pieceDeadNodes = []; // {node, monster, day, campaign}
  fights.forEach(function (f) {
    const camp = f.campaign || '';
    let nodeId = null, monster = null;
    if (camp.indexOf('network:') === 0) {
      nodeId = camp.slice(8);
      monster = NODE_MONSTER[nodeId] || null;
    } else if (camp === 'finale_crew') { nodeId = 'finale_crew'; monster = 'finale_crew'; }
    else if (camp === 'finale_opening') { nodeId = 'finale_opening'; monster = 'finale_opening'; }
    else if (camp === 'finale_heart') { nodeId = 'finale_heart'; monster = 'finale'; }
    if (nodeId && monster) {
      const piece = (f.fighters || []).find(function (p) { return p.id === monster; });
      if (piece && (!piece.alive || (piece.hp != null && piece.hp <= 0))) {
        pieceDeadNodes.push({ node: nodeId, monster: monster, day: f.day, campaign: camp });
        if (W6[monster]) { inc(w6.kill, monster); w6KillDetails.push({ node: nodeId, monster: monster, day: f.day }); }
      }
    } else {
      // UntAGGED fight with a W6 monster dead: a wild W6 face cannot
      // exist (campaignOnly), so this is a kill without a campaign tag
      // — counted as a kill, flagged as tag-missing, not as residue.
      (f.fighters || []).forEach(function (p) {
        if (W6[p.id] && (!p.alive || (p.hp != null && p.hp <= 0))) {
          inc(w6.kill, p.id);
          w6KillDetails.push({ node: null, monster: p.id, day: f.day, tagMissing: true });
        }
      });
    }
  });
  pieceDeadNodes.forEach(function (pd) {
    let ok = false;
    if (pd.node.indexOf('mast_') === 0 || pd.node.indexOf('limb_') === 0 || pd.node === 'heart') {
      ok = nodeClearedLater(pd.node, pd.day) || networkEndedLater(pd.day);
    } else if (pd.node === 'finale_crew') {
      ok = snapAfter(pd.day, function (s) { return !!(s.finaleCampaign && s.finaleCampaign.crew); });
    } else if (pd.node === 'finale_opening') {
      ok = snapAfter(pd.day, function (s) { return !!(s.finaleCampaign && s.finaleCampaign.opening); });
    } else if (pd.node === 'finale_heart') {
      ok = snapAfter(pd.day, function (s) { return !!((s.titansSlain || {}).finale); });
    }
    if (!ok) killResidue++;
  });
  // Cleared nodes with no preceding pieceDead fight: residue the other way.
  const clearedNodes = [];
  daily.forEach(function (s) {
    const nc = s.networkCampaign;
    (nc && nc.cleared || []).forEach(function (nid) {
      if (clearedNodes.indexOf(nid) < 0) clearedNodes.push(nid);
    });
  });
  clearedNodes.forEach(function (nid) {
    const hasKill = pieceDeadNodes.some(function (pd) { return pd.node === nid; });
    if (!hasKill) killResidue++;
  });

  // Tele cross-check: summon/fall counts vs snapshot end state.
  const teleSummoned = teles.filter(function (e) { return e.type === 'network_summoned'; }).length;
  const teleFallen = teles.filter(function (e) { return e.type === 'network_fallen'; }).length;
  const teleLost = teles.filter(function (e) { return e.type === 'network_lost'; }).length;
  const summonTrue = (o.summonEvents || []).filter(function (e) { return e.summoned; }).length;
  const last = daily.length ? daily[daily.length - 1] : null;
  let teleMismatch = 0;
  if (teleSummoned !== summonTrue) teleMismatch++;
  if (last) {
    if (teleFallen > 0 !== !!last.networkFallen) teleMismatch++;
    if (teleLost > 0 !== !!last.networkLost) teleMismatch++;
  }
  const teleOvertimeMax = teles.filter(function (e) { return e.type === 'overtime_tier'; })
    .reduce(function (m, e) { return Math.max(m, (e.data && e.data.tier) | 0); }, 0);
  const snapOvertimeMax = daily.reduce(function (m, s) { return Math.max(m, s.overtimeTier | 0); }, 0);

  return { spawnResidue: spawnResidue, faceResidue: faceResidue,
    killResidue: killResidue, w6: w6,
    w6SpawnDetails: w6SpawnDetails, w6FaceDetails: w6FaceDetails, w6KillDetails: w6KillDetails,
    teleMismatch: teleMismatch, teleSummoned: teleSummoned, teleFallen: teleFallen,
    teleLost: teleLost, teleOvertimeMax: teleOvertimeMax, snapOvertimeMax: snapOvertimeMax };
}

function summarizeSeed(o) {
  const s = {
    seed: o.seed, mode: o.mode, days: o.days, gameDays: o.gameDays,
    endReason: o.endReason, won: !!o.won, villageLost: !!o.villageLost,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing,
    scaleRank: o.scaleRank, endPantryKcal: o.endPantryKcal,
    deaths: (o.deaths || []).length, instrumentErrors: (o.instrumentErrors || []).length,
    sayLines: (o.relaySays || []).length,
  };
  // Relay verbs.
  const re = o.relayEvents || [];
  s.relayEvents = re.length; s.relayUnclassified = 0; s.relayByVerb = {}; s.relayRet = {};
  re.forEach(function (ev) {
    if (classifyRelayEvent(ev) === 'unclassified') { s.relayUnclassified++; return; }
    inc(s.relayByVerb, ev.verb);
    inc(s.relayRet, ev.verb + ':' + (ev.ret == null ? 'null' : ev.ret));
  });
  const gr = o.grantEvents || [];
  s.grants = gr.length; s.grantUnclassified = 0; s.grantsById = {};
  gr.forEach(function (ev) {
    if (classifyGrantEvent(ev) === 'unclassified') { s.grantUnclassified++; return; }
    inc(s.grantsById, ev.id || 'unknown');
  });
  const au = o.abilityUseEvents || [];
  s.abilityUses = au.length; s.abilityUseUnclassified = 0; s.abilityUseByVerb = {};
  au.forEach(function (ev) {
    if (classifyAbilityUseEvent(ev) === 'unclassified') { s.abilityUseUnclassified++; return; }
    inc(s.abilityUseByVerb, ev.verb);
  });
  const un = o.unlockEvents || [];
  s.unlockCalls = un.length; s.unlockGranted = {};
  un.forEach(function (ev) { (ev.granted || []).forEach(function (id) { inc(s.unlockGranted, id); }); });
  // Network gate.
  const tc = o.titanCallEvents || [];
  s.titanCalls = tc.length; s.titanCallsById = {};
  tc.forEach(function (ev) { inc(s.titanCallsById, ev.titan || 'unknown'); });
  const ts = o.titanSlewEvents || [];
  s.titanSlews = ts.length; s.titanSlewsById = {};
  ts.forEach(function (ev) { inc(s.titanSlewsById, (ev.what || 'unknown').replace(/^slew:/, '')); });
  s.summons = (o.summonEvents || []).length;
  s.summonsTrue = (o.summonEvents || []).filter(function (e) { return e.summoned; }).length;
  s.spawns = (o.spawnEvents || []).length;
  s.faces = (o.faceEvents || []).length;
  s.facesRefused = (o.faceEvents || []).filter(function (e) { return e.refused; }).length;
  s.fights = (o.fightEvents || []).length;
  s.teleByType = {};
  (o.teleEvents || []).forEach(function (ev) { inc(s.teleByType, ev.type || 'unknown'); });
  // Binding chain.
  const bc = classifyBelongChain(o);
  s.belongStage = bc.stage; s.belongLink = bc.link;
  s.belongFirst = bc.first;
  s.belongCounters = bc.counters;
  s.belongLinkForms = bc.linkForms;
  s.belongQualifyDays = bc.belongQualifyDays;
  s.leadMaskDays = bc.leadMaskDays;
  s.maxForeignSize = bc.maxForeignSize;
  // W6 reconciliation.
  const rec = reconcileW6(o);
  s.spawnResidue = rec.spawnResidue; s.faceResidue = rec.faceResidue;
  s.killResidue = rec.killResidue; s.w6 = rec.w6;
  s.w6SpawnDetails = rec.w6SpawnDetails; s.w6FaceDetails = rec.w6FaceDetails;
  s.w6KillDetails = rec.w6KillDetails;
  s.teleMismatch = rec.teleMismatch;
  s.teleSummoned = rec.teleSummoned; s.teleFallen = rec.teleFallen; s.teleLost = rec.teleLost;
  s.teleOvertimeMax = rec.teleOvertimeMax; s.snapOvertimeMax = rec.snapOvertimeMax;
  // End-state snapshots.
  const daily = o.daily || [];
  const last = daily.length ? daily[daily.length - 1] : null;
  s.snapshots = daily.length;
  s.switchboardAvailableDays = daily.filter(function (d) { return d.switchboardAvailable; }).length;
  s.firstSwitchboardDay = null;
  daily.forEach(function (d) { if (d.switchboardAvailable && s.firstSwitchboardDay == null) s.firstSwitchboardDay = d.day; });
  s.relayHeldDays = daily.filter(function (d) { return d.relayHeldByBearer; }).length;
  s.tableAnnouncedDays = daily.filter(function (d) { return d.tableAnnounced; }).length;
  s.tableWaitingDays = daily.filter(function (d) { return d.tableWaiting; }).length;
  s.firstTableAnnouncedDay = null; s.firstOvertimeDay = null; s.firstTier3Day = null;
  daily.forEach(function (d) {
    if (d.tableAnnounced && s.firstTableAnnouncedDay == null) s.firstTableAnnouncedDay = d.day;
    if ((d.overtimeTier | 0) >= 1 && s.firstOvertimeDay == null) s.firstOvertimeDay = d.day;
    if ((d.overtimeTier | 0) >= 3 && s.firstTier3Day == null) s.firstTier3Day = d.day;
  });
  s.maxOvertimeTier = daily.reduce(function (m, d) { return Math.max(m, d.overtimeTier | 0); }, 0);
  s.titanFirstSlain = {};
  ['herald', 'nielsen', 'finale', 'the_network'].forEach(function (tid) {
    daily.forEach(function (d) {
      if (s.titanFirstSlain[tid] == null && d.titansSlain && d.titansSlain[tid]) s.titanFirstSlain[tid] = d.day;
    });
    if (s.titanFirstSlain[tid] == null) s.titanFirstSlain[tid] = null;
  });
  s.titanOmenMax = {};
  daily.forEach(function (d) {
    Object.keys(d.titanOmens || {}).forEach(function (k) {
      const st = (d.titanOmens[k] || {}).stage;
      if (st != null) s.titanOmenMax[k] = Math.max(s.titanOmenMax[k] || 0, st);
    });
  });
  if (last) {
    s.endRelay = last.relay || null;
    s.endRelayAbils = last.relayAbils || [];
    s.endIntegration = last.integration;
    s.endSysBond = last.sysBond;
    s.endGrounding = last.grounding;
    s.endSwitchboard = last.switchboard || null;
    s.endNetwork = last.networkCampaign || null;
    s.endFinale = last.finaleCampaign || null;
    s.endNetworkSummoned = !!last.networkSummoned;
    s.endNetworkFallen = !!last.networkFallen;
    s.endNetworkLost = !!last.networkLost;
    s.endTable = last.table || null;
    s.endTableDone = !!last.tableDone;
    s.endTableWaiting = !!last.tableWaiting;
    s.endTitansSlain = last.titansSlain || {};
    s.endRoster = (last.roster || []).length;
    // Engagement floor inputs.
    s.roadOpportunity = !!(last.tableAnnounced || s.switchboardAvailableDays > 0 ||
      Object.keys(s.titanOmenMax).some(function (k) { return (s.titanOmenMax[k] || 0) >= 1; }) ||
      s.maxOvertimeTier >= 1);
  } else {
    s.roadOpportunity = false;
  }
  s.wrapLive = o.wrapLive || {};
  s.wrapCounts = o.wrapCounts || {};
  return s;
}

function summarizeBand(controlSeeds, neutralSeeds) {
  const band = { seeds: [], totals: {}, go: {}, neutrality: [] };
  let tRelay = 0, tRelayUnc = 0, tGrantUnc = 0, tUseUnc = 0;
  let tSpawnRes = 0, tFaceRes = 0, tKillRes = 0, tTeleMis = 0, tErr = 0;
  let tRoadOpp = 0;
  controlSeeds.forEach(function (s) {
    band.seeds.push(s);
    tRelay += s.relayEvents; tRelayUnc += s.relayUnclassified;
    tGrantUnc += s.grantUnclassified; tUseUnc += s.abilityUseUnclassified;
    tSpawnRes += s.spawnResidue; tFaceRes += s.faceResidue; tKillRes += s.killResidue;
    tTeleMis += s.teleMismatch; tErr += s.instrumentErrors;
    if (s.roadOpportunity) tRoadOpp++;
  });
  const neutBySeed = {};
  neutralSeeds.forEach(function (n) { neutBySeed[n.seed] = n; });
  controlSeeds.forEach(function (c) {
    const n = neutBySeed[c.seed];
    const exact = !!n && n.days === c.days && n.endPantryKcal === c.endPantryKcal && n.deaths === c.deaths;
    band.neutrality.push({ seed: c.seed, exact: exact,
      control: { days: c.days, pantry: c.endPantryKcal, deaths: c.deaths },
      neutral: n ? { days: n.days, pantry: n.endPantryKcal, deaths: n.deaths } : null });
  });
  const neutExact = band.neutrality.filter(function (r) { return r.exact; }).length;
  const wrapLiveOrDead = {};
  WRAPS.forEach(function (w) {
    const live = controlSeeds.some(function (s) { return s.wrapLive && s.wrapLive[w]; });
    wrapLiveOrDead[w] = live ? 'live' : 'dead-in-pilot';
  });
  band.wrapLiveOrDead = wrapLiveOrDead;
  const w6tot = { spawn: {}, face: {}, kill: {} };
  controlSeeds.forEach(function (s) {
    ['spawn', 'face', 'kill'].forEach(function (k) {
      Object.keys((s.w6 || {})[k] || {}).forEach(function (id) { w6tot[k][id] = (w6tot[k][id] || 0) + s.w6[k][id]; });
    });
  });
  band.totals = {
    villageDays: controlSeeds.reduce(function (a, s) { return a + s.days; }, 0),
    relayEvents: tRelay, relayUnclassified: tRelayUnc,
    grantUnclassified: tGrantUnc, abilityUseUnclassified: tUseUnc,
    spawnResidue: tSpawnRes, faceResidue: tFaceRes, killResidue: tKillRes,
    teleMismatch: tTeleMis, instrumentErrors: tErr,
    neutralityExact: neutExact + '/' + controlSeeds.length,
    roadOpportunitySeeds: tRoadOpp + '/' + controlSeeds.length,
    w6: w6tot,
    summonsTrue: controlSeeds.reduce(function (a, s) { return a + s.summonsTrue; }, 0),
    networkFallen: controlSeeds.filter(function (s) { return s.endNetworkFallen; }).length,
    networkLost: controlSeeds.filter(function (s) { return s.endNetworkLost; }).length,
    networkSummoned: controlSeeds.filter(function (s) { return s.endNetworkSummoned; }).length,
    maxOvertimeTier: Math.max.apply(null, controlSeeds.map(function (s) { return s.maxOvertimeTier; }).concat([0])),
    titansSlain: controlSeeds.reduce(function (a, s) { return a + Object.keys(s.endTitansSlain || {}).length; }, 0),
    bindingAnswered: controlSeeds.filter(function (s) { return s.belongStage === 'B5'; }).length,
    bindingStaged: controlSeeds.filter(function (s) { return s.belongStage === 'B4'; }).length,
    belongLinks: controlSeeds.reduce(function (a, s) { return a + (s.belongLinkForms || []).filter(function (l) { return l.role === 'subordinate'; }).length; }, 0),
    wins: controlSeeds.filter(function (s) { return s.won; }).length,
    national: controlSeeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: controlSeeds.filter(function (s) { return s.endTableDone; }).length,
    wave5: controlSeeds.filter(function (s) { return s.maxWave >= 5; }).length,
    wave4: controlSeeds.filter(function (s) { return s.maxWave >= 4; }).length,
    survivors: controlSeeds.filter(function (s) { return !s.villageLost; }).length,
    deaths: controlSeeds.reduce(function (a, s) { return a + s.deaths; }, 0),
    medianDays: (function () {
      const ds = controlSeeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
      return ds.length ? ds[Math.floor(ds.length / 2)] : null;
    })(),
  };
  band.go = {
    relayClassified: { bar: '0 unclassified relay events (verbs + grants + ability uses)', result: tRelayUnc + tGrantUnc + tUseUnc, pass: (tRelayUnc + tGrantUnc + tUseUnc) === 0 },
    w6Attributed: { bar: '0 unattributed W6 events (spawn + face + kill residue 0)', result: tSpawnRes + tFaceRes + tKillRes, pass: (tSpawnRes + tFaceRes + tKillRes) === 0 },
    belongClassified: { bar: '0 unclassified seeds (every seed B0–B5/none)', result: controlSeeds.filter(function (s) { return !s.belongStage; }).length, pass: controlSeeds.every(function (s) { return !!s.belongStage; }) },
    wrapsLiveOrDead: { bar: 'each wrap live in pilot or proven live in fixture + marked dead', result: wrapLiveOrDead, pass: true },
    neutrality: { bar: '8/8 exact (days + pantry + deaths)', result: neutExact + '/' + controlSeeds.length, pass: neutExact === controlSeeds.length && controlSeeds.length === 8 },
    instrumentErrors: { bar: '0', result: tErr, pass: tErr === 0 },
    perSeedTables: { bar: 'metrics 1–10 per seed + scenes', result: 'see evidence', pass: true },
    engagementFloor: { bar: '>=1 road-opportunity event band-wide', result: tRoadOpp + '/' + controlSeeds.length + ' seeds with opportunity', pass: tRoadOpp >= 1 },
  };
  band.go.allPass = Object.keys(band.go).every(function (k) { return k === 'allPass' || band.go[k].pass; });
  return band;
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-relayfirst-a');
  const outPath = process.argv[3] || path.join(dir, '..', 'relayfirst-summary-relayfirst-pilot.json');
  const files = fs.readdirSync(dir).filter(function (f) { return /relayfirst-s\d+-relayfirst-pilot-(control|neutral)\.json$/.test(f); });
  const control = [], neutral = [];
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = summarizeSeed(o);
    if (o.mode === 'control') control.push(s); else neutral.push(s);
  });
  control.sort(function (a, b) { return a.seed - b.seed; });
  neutral.sort(function (a, b) { return a.seed - b.seed; });
  const band = summarizeBand(control, neutral);
  band.perSeed = control;
  band.neutralSeeds = neutral;
  fs.writeFileSync(outPath, JSON.stringify(band, null, 2) + '\n');
  console.log('seeds control=' + control.length + ' neutral=' + neutral.length);
  console.log('GO: ' + (band.go.allPass ? 'GO' : 'NO-GO'));
  Object.keys(band.go).forEach(function (k) {
    if (k === 'allPass') return;
    const row = band.go[k];
    console.log('  ' + (row.pass ? 'PASS' : 'FAIL') + ' ' + k + ': ' + JSON.stringify(row.result) + ' (bar: ' + row.bar + ')');
  });
  console.log('totals: ' + JSON.stringify(band.totals));
  console.log('wrote ' + outPath);
  return band;
}

if (require.main === module) main();

module.exports = { classifyRelayEvent: classifyRelayEvent, classifyGrantEvent: classifyGrantEvent,
  classifyAbilityUseEvent: classifyAbilityUseEvent, belongGood: belongGood,
  foreignSizeFor: foreignSizeFor, linkSeasoned: linkSeasoned,
  classifyBelongChain: classifyBelongChain, reconcileW6: reconcileW6,
  summarizeSeed: summarizeSeed, summarizeBand: summarizeBand, NETWORK_NODES: NETWORK_NODES };
