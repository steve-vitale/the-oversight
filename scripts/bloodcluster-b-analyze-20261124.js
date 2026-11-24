// bloodcluster-b-analyze-20261124.js — bloodings-cluster decomposition
// analyzer (arm sim-bloodcluster-b). Pure functions over one per-seed
// run JSON (bloodcluster-b driver output: standing-gearready base +
// fieldFight / startCombat rows). Imports the vetpair analyzer for
// the killer census (bloodings, deaths, overlap, orphans) and adds:
//  - linkage: every deduped wave-4+ killEvent -> its fight (field
//    row same day+mid+leader, or TB start same day+mid with the
//    killer in the entry party) or contest/other/unlinked
//  - mechanism class per blooding (prereg taxonomy — exactly one)
//  - per-seed contrast stats for the four candidate families
//    (A spawn density / kill rate, B party formation, C field-fight
//    damage/staying, D wild ally-join + joiner origin)
//  - pooled door vs non-door contrast + dominant-mechanism call
//    (largest headline-ratio family >= 1.5x whose channel covers
//    >= 50% of door-seed bloodings; else NO-DOMINANT).
// Channel coverage for the dominant call: A = 100% (every kill
// flows through a contact); B = share of door bloodings with
// party >= 2 at the kill; C = share of door bloodings via the field
// channel (damage/staying is a field-fight property); D = share of
// door bloodings with an ally-join at the kill OR a joiner blooder.
// Usage: const AN = require('./bloodcluster-b-analyze-20261124');
//   const s = AN.summarizeSeed(perSeedJson);
//   const all = AN.summarizeAll([perSeedJson, ...]);
'use strict';

const VET = require('./vetpair-b-analyze-20261124');

const DOOR_SEEDS = [109311, 109312, 109313, 109314];
const FIELD_VIAS = ['wild', 'agency', 'patrol', 'sortie', 'aid-crisis'];

function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function share(num, den) { return den ? num / den : null; }
function ratio(a, b) { return (a == null || b == null || b === 0) ? null : a / b; }

function originOf(vid) {
  if (vid == null) return 'unknown';
  const s = String(vid);
  if (s.indexOf('visjoin_') === 0) return 'visjoin';
  if (s.indexOf('app_') === 0) return 'app';
  if (s.indexOf('gen_') === 0) return 'gen';
  return 'named';
}

function summarizeSeed(out) {
  const base = VET.summarizeSeed(out);
  const daily = out.daily || [];
  const field = (out.fieldFights || []).slice();
  const tb = (out.tbStarts || []).slice();
  const s = base;
  s.arm = 'bloodcluster-b';
  s.fieldFights = field.length;
  s.tbStarts = tb.length;
  s.fieldW4 = field.filter(function (f) { return f && (f.wave | 0) >= 4; });
  s.tbW4 = tb.filter(function (t) { return t && (t.wave | 0) >= 4; });
  s.fieldW3 = field.filter(function (f) { return f && (f.wave | 0) === 3; });
  s.fieldUnknownWave = field.filter(function (f) { return f && (f.wave == null); });
  s.tbUnknownWave = tb.filter(function (t) { return t && (t.wave == null); });

  // --- wave-4 unlock day: first daily snapshot with peak >= 4 ---
  s.unlockDay4 = null;
  for (const d of daily) {
    if (d && (d.peak | 0) >= 4) { s.unlockDay4 = d.day | 0; break; }
  }
  s.peak5 = daily.some(function (d) { return d && (d.peak | 0) >= 5; });
  s.doorGroup = DOOR_SEEDS.indexOf(out.seed) >= 0;
  s.doorVerified = (s.peak5 === s.doorGroup);
  s.endDay = base.endDay;
  s.aliveDaysFromUnlock = (s.unlockDay4 == null) ? null : Math.max(0, s.endDay - s.unlockDay4 + 1);

  // --- contacts: field (not alreadyDead) + TB ---
  const fieldContacts = s.fieldW4.filter(function (f) { return f.outcome !== 'alreadyDead'; });
  s.w4FieldContacts = fieldContacts.length;
  s.w4TbContacts = s.tbW4.length;
  s.w4Contacts = s.w4FieldContacts + s.w4TbContacts;
  s.w4Kills = base.w4Kills + base.w5Kills; // deduped, entryAdded, wave>=4
  s.contactsPerDay = (s.aliveDaysFromUnlock) ? s.w4Contacts / s.aliveDaysFromUnlock : null;
  s.killsPerContact = share(s.w4Kills, s.w4Contacts);
  s.killsPerDay = (s.aliveDaysFromUnlock) ? s.w4Kills / s.aliveDaysFromUnlock : null;
  // Wave-3 control: do door seeds just fight more overall?
  const w3Contacts = s.fieldW3.filter(function (f) { return f.outcome !== 'alreadyDead'; }).length;
  const w3Kills = (out.killEvents || []).filter(function (k) { return k && (k.wave | 0) === 3 && k.entryAdded; }).length;
  s.w3FieldContacts = w3Contacts;
  s.w3Kills = w3Kills;
  s.w3KillsPerContact = share(w3Kills, w3Contacts);

  // --- linkage: killEvents -> fights (FIFO, call order) ---
  const kills = (out.killEvents || []).filter(function (k) { return k && (k.wave | 0) >= 4 && k.by != null; });
  const fieldKills = s.fieldW4.filter(function (f) { return f.outcome === 'vKill'; });
  const fieldUsed = new Set();
  const tbUsed = new Set();
  s.linkedKills = [];
  s.unlinkedKills = [];
  s.linkedDuplicates = [];
  function fieldMatch(k) {
    for (let i = 0; i < fieldKills.length; i++) {
      if (fieldUsed.has(i)) continue;
      const f = fieldKills[i];
      if ((f.day | 0) === (k.day | 0) && f.mid === k.mid && String(f.vid) === String(k.by)) {
        fieldUsed.add(i);
        return { kind: 'field', row: f };
      }
    }
    return null;
  }
  function tbMatch(k) {
    for (let i = 0; i < s.tbW4.length; i++) {
      if (tbUsed.has(i)) continue;
      const t = s.tbW4[i];
      if ((t.day | 0) === (k.day | 0) && t.mid === k.mid) {
        const scholarId = (out.endState && out.endState.scholarId) || null;
        const isScholar = String(k.by) === String(scholarId);
        const isJoiner = (t.villagerJoiners || []).some(function (v) { return String(v) === String(k.by); });
        if ((k.via === 'player' && isScholar) || (k.via === 'companion' && isJoiner)) {
          tbUsed.add(i);
          return { kind: 'tb', row: t };
        }
      }
    }
    return null;
  }
  // Pass 1: entryAdded kills (the counted kills) link to fights.
  const matchedByKey = {};
  for (const k of kills) {
    if (!k.entryAdded) continue;
    const m = fieldMatch(k) || tbMatch(k);
    const rec = { day: k.day | 0, mid: k.mid, wave: k.wave | 0, by: String(k.by), via: k.via || 'unknown', fn: k.fn || null, match: m ? m.kind : null, row: m ? m.row : null };
    if (m) {
      matchedByKey[(k.day | 0) + '|' + k.mid + '|' + String(k.by)] = m;
      s.linkedKills.push(rec);
    } else if (k.via === 'contest') {
      rec.match = 'contest';
      s.linkedKills.push(rec);
    } else {
      s.unlinkedKills.push(rec);
    }
  }
  // Pass 2: duplicate (entryAdded=false) choke-point calls link to
  // the SAME fight their added twin matched; a duplicate with no
  // twin still tries a direct fight match (its kill is real — the
  // log row was not added only because the (d,mid,by,via) tuple was
  // already logged); only a duplicate with no fight at all is
  // unlinked.
  for (const k of kills) {
    if (k.entryAdded) continue;
    const key = (k.day | 0) + '|' + k.mid + '|' + String(k.by);
    if (matchedByKey[key]) {
      s.linkedDuplicates.push({ day: k.day | 0, mid: k.mid, by: String(k.by), via: k.via || 'unknown', match: matchedByKey[key].kind });
    } else {
      const m = fieldMatch(k) || tbMatch(k);
      if (m) {
        matchedByKey[key] = m;
        s.linkedDuplicates.push({ day: k.day | 0, mid: k.mid, by: String(k.by), via: k.via || 'unknown', match: m.kind });
      } else {
        s.unlinkedKills.push({ day: k.day | 0, mid: k.mid, wave: k.wave | 0, by: String(k.by), via: k.via || 'unknown', fn: k.fn || null, match: null, row: null, duplicateNoTwin: true });
      }
    }
  }
  // Field vKills with no killEvent at all (added or duplicate).
  s.unlinkedFieldKills = [];
  const killKeys = {};
  for (const k of kills) killKeys[(k.day | 0) + '|' + k.mid + '|' + String(k.by)] = true;
  fieldKills.forEach(function (f, i) {
    if (fieldUsed.has(i)) return;
    if (!killKeys[(f.day | 0) + '|' + f.mid + '|' + String(f.vid)]) {
      s.unlinkedFieldKills.push({ day: f.day | 0, mid: f.mid, vid: String(f.vid) });
    }
    // else: the vKill's killEvent exists but matched a different
    // fight first (same day+mid+vid twice) — FIFO consumed the twin;
    // that is a matching ambiguity, counted here as unlinked-field
    // only when no killEvent key exists (above), otherwise it is
    // the duplicate-call shape and is already explained.
  });
  // TB kills with no TB start at all (alien-duel direct builds carry
  // wave null and cannot produce wave kills, so any such kill is an
  // instrument error, not an explained path).
  s.unlinkedTbKills = s.linkedKills.filter(function (r) {
    return (r.via === 'player' || r.via === 'companion') && r.match !== 'tb' && r.match !== 'field';
  });

  // --- joiner origin: first roster appearance per vid ---
  const firstSeen = {};
  for (const d of daily) {
    const roster = d.roster || [];
    for (const vid of roster) {
      if (firstSeen[vid] == null) firstSeen[vid] = d.day | 0;
    }
  }
  s.firstSeen = firstSeen;

  // --- mechanism class per blooding ---
  s.bloodings = [];
  s.unclassifiedBloodings = [];
  const killByKey = {};
  for (const r of s.linkedKills) killByKey[(r.day | 0) + '|' + r.mid + '|' + r.by] = r;
  for (const r of s.unlinkedKills) killByKey[(r.day | 0) + '|' + r.mid + '|' + r.by] = r;
  for (const k of base.killers) {
    const fk = k.firstKill || null;
    let cls = 'UNCLASSIFIED', detail = null;
    if (fk) {
      const rec = killByKey[(fk.day | 0) + '|' + fk.mid + '|' + k.vid];
      if (rec && rec.match === 'field' && rec.row) {
        const f = rec.row;
        const party = 1 + (f.allyJoined || []).length;
        if (party <= 1) cls = 'field-solo';
        else if (f.allyFromStart) cls = 'field-party-start';
        else if (f.calledHelp) cls = 'field-party-shout';
        else cls = 'field-party-unexplained';
        detail = { party: party, rounds: f.rounds, mDealt: f.mDealt, allyDealt: f.allyDealt, vTaken: f.vTaken, outcome: f.outcome, intent: f.intent, intentWhy: f.intentWhy, allyFromStart: !!f.allyFromStart, calledHelp: !!f.calledHelp, allyJoined: (f.allyJoined || []).slice() };
      } else if (rec && rec.match === 'tb' && rec.row) {
        const t = rec.row;
        if (rec.via === 'companion') cls = 'tb-companion';
        else if ((t.partySize | 0) <= 1) cls = 'tb-scholar-solo';
        else cls = 'tb-scholar-party';
        detail = { party: t.partySize | 0, joiners: (t.villagerJoiners || []).slice() };
      } else if (rec && rec.match === 'contest') {
        cls = 'contest';
      } else if (rec && rec.match == null && FIELD_VIAS.indexOf(rec.via) < 0 && rec.via !== 'player' && rec.via !== 'companion' && rec.via !== 'contest') {
        // Exotic via outside the instrumented channels: the via itself
        // names the channel, so the blooding is classified by it.
        // A KNOWN-channel blooding with no fight record stays
        // UNCLASSIFIED (the channel demands a fight record that is
        // missing) — see the else branch below.
        cls = 'other-' + (rec.via || 'unknown');
      }
      // else: known-channel blooding with no matching fight record
      // (or no killEvent at all) stays UNCLASSIFIED.
    }
    const firstDay = firstSeen[k.vid];
    const b = {
      vid: k.vid, bloodDay: k.bloodDay, cls: cls, detail: detail,
      via: fk ? (fk.via || 'unknown') : 'unknown', mid: fk ? fk.mid : null,
      origin: originOf(k.vid), firstSeenDay: (firstDay == null ? null : firstDay),
      daysJoinToBlood: (firstDay == null ? null : k.bloodDay - firstDay),
      status: k.status, deathDay: k.deathDay, aliveAfter: k.aliveAfter,
    };
    s.bloodings.push(b);
    if (cls === 'UNCLASSIFIED') s.unclassifiedBloodings.push(b);
  }

  // --- family stats (field channel, wave 4+) ---
  const fc = fieldContacts;
  s.fieldVKill = fc.filter(function (f) { return f.outcome === 'vKill'; }).length;
  s.fieldVFlee = fc.filter(function (f) { return f.outcome === 'vFlee'; }).length;
  s.fieldVDie = fc.filter(function (f) { return f.outcome === 'vDie'; }).length;
  s.fieldMFlee = fc.filter(function (f) { return f.outcome === 'mFlee'; }).length;
  s.fieldEvade = fc.filter(function (f) { return f.outcome === 'evade'; }).length;
  s.fieldOutcomes = {};
  for (const f of fc) s.fieldOutcomes[f.outcome || 'null'] = (s.fieldOutcomes[f.outcome || 'null'] || 0) + 1;
  s.vFleeShare = share(s.fieldVFlee, fc.length);
  s.stayingShare = (fc.length) ? 1 - (s.vFleeShare || 0) : null;
  s.meanRoundsW4 = mean(fc.map(function (f) { return f.rounds | 0; }));
  s.meanMDealtPerKill = mean(s.fieldW4.filter(function (f) { return f.outcome === 'vKill'; }).map(function (f) { return f.mDealt | 0; }));
  s.meanAllyDealtPerKill = mean(s.fieldW4.filter(function (f) { return f.outcome === 'vKill'; }).map(function (f) { return f.allyDealt | 0; }));
  s.meanVTakenPerKill = mean(s.fieldW4.filter(function (f) { return f.outcome === 'vKill'; }).map(function (f) { return f.vTaken | 0; }));
  s.meanMDealtPerRound = (function () {
    const rounds = fc.reduce(function (a, f) { return a + (f.rounds | 0); }, 0);
    const dealt = fc.reduce(function (a, f) { return a + (f.mDealt | 0) + (f.allyDealt | 0); }, 0);
    return rounds ? dealt / rounds : null;
  })();
  // Party / ally-join shares at kills and at contacts.
  function partyAtKill(killRecs) {
    const ps = [];
    for (const r of killRecs) {
      if (r.match === 'field' && r.row) ps.push(1 + (r.row.allyJoined || []).length);
      else if (r.match === 'tb' && r.row) ps.push(r.row.partySize | 0);
    }
    return ps;
  }
  const killParties = partyAtKill(s.linkedKills);
  s.killsWithPartySize = killParties.length;
  s.killsParty2Plus = killParties.filter(function (p) { return p >= 2; }).length;
  s.party2PlusShareAtKills = share(s.killsParty2Plus, killParties.length);
  s.meanPartyAtKills = mean(killParties);
  const contactParties = fc.map(function (f) { return 1 + (f.allyJoined || []).length; });
  s.contactsParty2Plus = contactParties.filter(function (p) { return p >= 2; }).length;
  s.party2PlusShareAtContacts = share(s.contactsParty2Plus, contactParties.length);
  s.meanPartyAtContacts = mean(contactParties);
  const joinedContacts = fc.filter(function (f) { return (f.allyJoined || []).length > 0; });
  s.allyJoinShareAtContacts = share(joinedContacts.length, fc.length);
  s.shoutJoinShareAtContacts = share(fc.filter(function (f) { return !f.allyFromStart && f.calledHelp; }).length, fc.length);
  s.fromStartShareAtContacts = share(fc.filter(function (f) { return f.allyFromStart && (f.allyJoined || []).length > 0; }).length, fc.length);
  const killRows = s.linkedKills.filter(function (r) { return r.match === 'field'; });
  s.allyJoinShareAtKills = share(killRows.filter(function (r) { return (r.row.allyJoined || []).length > 0; }).length, killRows.length);
  s.shoutJoinShareAtKills = share(killRows.filter(function (r) { return !r.row.allyFromStart && r.row.calledHelp; }).length, killRows.length);
  s.joinerBlooders = s.bloodings.filter(function (b) { return b.origin === 'visjoin' || b.origin === 'app'; }).length;
  s.joinerShareOfBlooders = share(s.joinerBlooders, s.bloodings.length);
  s.recentJoinerBlooders = s.bloodings.filter(function (b) { return b.daysJoinToBlood != null && b.daysJoinToBlood <= 30; }).length;
  // Inter-blooding gaps (sorted blood days, per seed).
  const bloodDays = s.bloodings.map(function (b) { return b.bloodDay; }).sort(function (a, b) { return a - b; });
  s.bloodGaps = [];
  for (let i = 1; i < bloodDays.length; i++) s.bloodGaps.push(bloodDays[i] - bloodDays[i - 1]);
  s.meanBloodGap = mean(s.bloodGaps);
  // Wave-4 contacts by monster type.
  s.contactsByType = {};
  for (const f of fc) s.contactsByType[f.mid || 'null'] = (s.contactsByType[f.mid || 'null'] || 0) + 1;
  return s;
}

function summarizeAll(seeds) {
  const base = VET.summarizeAll(seeds);
  const per = seeds.map(function (o) { return summarizeSeed(o); });
  const door = per.filter(function (s) { return s.doorGroup; });
  const non = per.filter(function (s) { return !s.doorGroup; });
  function pool(list, fn) {
    let num = 0, den = 0;
    for (const s of list) { const v = fn(s); num += v.num; den += v.den; }
    return den ? num / den : null;
  }
  function poolMean(list, fn) {
    let xs = [];
    for (const s of list) xs = xs.concat(fn(s) || []);
    return mean(xs);
  }
  function contrast(name, doorVal, nonVal) {
    return { name: name, door: doorVal, nonDoor: nonVal, ratio: ratio(doorVal, nonVal) };
  }
  const doorDays = door.reduce(function (a, s) { return a + (s.aliveDaysFromUnlock || 0); }, 0);
  const nonDays = non.reduce(function (a, s) { return a + (s.aliveDaysFromUnlock || 0); }, 0);
  const doorContacts = door.reduce(function (a, s) { return a + s.w4Contacts; }, 0);
  const nonContacts = non.reduce(function (a, s) { return a + s.w4Contacts; }, 0);
  const doorKills = door.reduce(function (a, s) { return a + s.w4Kills; }, 0);
  const nonKills = non.reduce(function (a, s) { return a + s.w4Kills; }, 0);
  const doorBlood = door.reduce(function (a, s) { return a + s.bloodings.length; }, 0);
  const nonBlood = non.reduce(function (a, s) { return a + s.bloodings.length; }, 0);
  const c = {};
  // A — spawn density / kill rate.
  c.contactsPerDay = contrast('contacts/day (w4+, from unlock)', doorDays ? doorContacts / doorDays : null, nonDays ? nonContacts / nonDays : null);
  c.killsPerContact = contrast('kills/contact (w4+)', share(doorKills, doorContacts), share(nonKills, nonContacts));
  c.killsPerDay = contrast('kills/day (w4+, from unlock)', doorDays ? doorKills / doorDays : null, nonDays ? nonKills / nonDays : null);
  c.w3KillsPerContact = contrast('kills/contact (w3 control)', pool(door, function (s) { return { num: s.w3Kills, den: s.w3FieldContacts }; }), pool(non, function (s) { return { num: s.w3Kills, den: s.w3FieldContacts }; }));
  // B — party formation.
  c.party2PlusAtKills = contrast('party>=2 share at w4+ kills', pool(door, function (s) { return { num: s.killsParty2Plus, den: s.killsWithPartySize }; }), pool(non, function (s) { return { num: s.killsParty2Plus, den: s.killsWithPartySize }; }));
  c.party2PlusAtContacts = contrast('party>=2 share at w4+ contacts', pool(door, function (s) { return { num: s.contactsParty2Plus, den: s.w4FieldContacts }; }), pool(non, function (s) { return { num: s.contactsParty2Plus, den: s.w4FieldContacts }; }));
  c.meanPartyAtKills = contrast('mean party at w4+ kills', poolMean(door, function (s) { return s.linkedKills.filter(function (r) { return r.match === 'field' || r.match === 'tb'; }).map(function (r) { return r.match === 'field' ? 1 + (r.row.allyJoined || []).length : (r.row.partySize | 0); }); }), poolMean(non, function (s) { return s.linkedKills.filter(function (r) { return r.match === 'field' || r.match === 'tb'; }).map(function (r) { return r.match === 'field' ? 1 + (r.row.allyJoined || []).length : (r.row.partySize | 0); }); }));
  // C — field-fight damage/staying.
  c.vFleeShare = contrast('vFlee share (w4+ field contacts)', pool(door, function (s) { return { num: s.fieldVFlee, den: s.w4FieldContacts }; }), pool(non, function (s) { return { num: s.fieldVFlee, den: s.w4FieldContacts }; }));
  const doorStay = c.vFleeShare.door == null ? null : 1 - c.vFleeShare.door;
  const nonStay = c.vFleeShare.nonDoor == null ? null : 1 - c.vFleeShare.nonDoor;
  c.stayingShare = contrast('staying share (1 - vFlee)', doorStay, nonStay);
  c.mDealtPerKill = contrast('mean leader mDealt per w4 field kill', poolMean(door, function (s) { return s.fieldW4.filter(function (f) { return f.outcome === 'vKill'; }).map(function (f) { return f.mDealt | 0; }); }), poolMean(non, function (s) { return s.fieldW4.filter(function (f) { return f.outcome === 'vKill'; }).map(function (f) { return f.mDealt | 0; }); }));
  c.meanRounds = contrast('mean rounds (w4+ field contacts)', poolMean(door, function (s) { return s.fieldW4.filter(function (f) { return f.outcome !== 'alreadyDead'; }).map(function (f) { return f.rounds | 0; }); }), poolMean(non, function (s) { return s.fieldW4.filter(function (f) { return f.outcome !== 'alreadyDead'; }).map(function (f) { return f.rounds | 0; }); }));
  // D — wild ally-join.
  c.allyJoinAtKills = contrast('ally-join share at w4 field kills', pool(door, function (s) { const kr = s.linkedKills.filter(function (r) { return r.match === 'field'; }); return { num: kr.filter(function (r) { return (r.row.allyJoined || []).length > 0; }).length, den: kr.length }; }), pool(non, function (s) { const kr = s.linkedKills.filter(function (r) { return r.match === 'field'; }); return { num: kr.filter(function (r) { return (r.row.allyJoined || []).length > 0; }).length, den: kr.length }; }));
  c.shoutJoinAtKills = contrast('shout-join share at w4 field kills', pool(door, function (s) { const kr = s.linkedKills.filter(function (r) { return r.match === 'field'; }); return { num: kr.filter(function (r) { return !r.row.allyFromStart && r.row.calledHelp; }).length, den: kr.length }; }), pool(non, function (s) { const kr = s.linkedKills.filter(function (r) { return r.match === 'field'; }); return { num: kr.filter(function (r) { return !r.row.allyFromStart && r.row.calledHelp; }).length, den: kr.length }; }));
  c.joinerShareOfBlooders = contrast('joiner (visjoin/app) share of blooders', share(door.reduce(function (a, s) { return a + s.joinerBlooders; }, 0), doorBlood), share(non.reduce(function (a, s) { return a + s.joinerBlooders; }, 0), nonBlood));
  // Mechanism-class table, door vs non-door.
  const classes = {};
  for (const s of per) {
    for (const b of s.bloodings) {
      classes[b.cls] = classes[b.cls] || { door: 0, nonDoor: 0 };
      if (s.doorGroup) classes[b.cls].door++;
      else classes[b.cls].nonDoor++;
    }
  }
  // Dominant call: families ranked by headline ratio; first with
  // channel coverage >= 50% of door bloodings wins; else NO-DOMINANT.
  // Each family's headline is the stronger of its two prereg headline
  // rates (A: contacts/day or kills/contact; C: staying share or
  // mDealt/kill; D: ally-join share at kills or joiner share of
  // blooders; B: party>=2 share at kills).
  function stronger(a, b) { return ((a.ratio || 0) >= (b.ratio || 0)) ? a : b; }
  const fam = [
    { family: 'A spawn-density/kill-rate', headline: stronger(c.contactsPerDay, c.killsPerContact), coverage: 1 },
    { family: 'B party-formation', headline: c.party2PlusAtKills, coverage: doorBlood ? (Object.keys(classes).filter(function (k) { return k.indexOf('field-party') === 0 || k.indexOf('tb-') === 0; }).reduce(function (a, k) { return a + classes[k].door; }, 0) / doorBlood) : null },
    { family: 'C field-fight-damage/staying', headline: stronger(c.stayingShare, c.mDealtPerKill), coverage: doorBlood ? (Object.keys(classes).filter(function (k) { return k.indexOf('field-') === 0; }).reduce(function (a, k) { return a + classes[k].door; }, 0) / doorBlood) : null },
    { family: 'D wild-ally-join', headline: stronger(c.allyJoinAtKills, c.joinerShareOfBlooders), coverage: doorBlood ? (per.filter(function (s) { return s.doorGroup; }).reduce(function (a, s) { return a + s.bloodings.filter(function (b) { return (b.detail && b.detail.allyJoined && b.detail.allyJoined.length > 0) || b.origin === 'visjoin' || b.origin === 'app'; }).length; }, 0) / doorBlood) : null },
  ];
  fam.sort(function (a, b) { return (b.headline.ratio || 0) - (a.headline.ratio || 0); });
  let dominant = null;
  for (const f of fam) {
    if (f.headline.ratio != null && f.headline.ratio >= 1.5 && f.coverage != null && f.coverage >= 0.5) { dominant = f; break; }
  }
  const all = Object.assign(base, {
    doorSeeds: door.length, nonDoorSeeds: non.length,
    doorVerified: per.every(function (s) { return s.doorVerified; }),
    doorDays: doorDays, nonDoorDays: nonDays,
    doorContacts: doorContacts, nonDoorContacts: nonContacts,
    doorKills: doorKills, nonDoorKills: nonKills,
    doorBloodings: doorBlood, nonDoorBloodings: nonBlood,
    contrasts: c, classes: classes,
    families: fam,
    dominant: dominant ? { family: dominant.family, ratio: dominant.headline.ratio, headline: dominant.headline.name, coverage: dominant.coverage } : null,
    noDominant: dominant == null,
    unclassifiedBloodings: per.reduce(function (a, s) { return a + s.unclassifiedBloodings.length; }, 0),
    unlinkedKills: per.reduce(function (a, s) { return a + s.unlinkedKills.length; }, 0),
    unlinkedFieldKills: per.reduce(function (a, s) { return a + s.unlinkedFieldKills.length; }, 0),
    unlinkedTbKills: per.reduce(function (a, s) { return a + s.unlinkedTbKills.length; }, 0),
    meanBloodGapDoor: mean(door.reduce(function (a, s) { return a.concat(s.bloodGaps); }, [])),
    meanBloodGapNonDoor: mean(non.reduce(function (a, s) { return a.concat(s.bloodGaps); }, [])),
    perSeed: per,
  });
  return all;
}

module.exports = { summarizeSeed: summarizeSeed, summarizeAll: summarizeAll, originOf: originOf, DOOR_SEEDS: DOOR_SEEDS };
