// godpathfirst-analyze-20261111.js — godpath / godhood first-numbers analyzer
// (arm sim-godpathfirst-a, run fleshout-20261111T1115Z). Pure: reads
// per-seed JSON only, never loads the game.
//
// PERSON-KEYING (Amendment 1, pre-evidence): the scholar is an OFFICE —
// snap.bearer is the living villager holding it and changes on every
// mantle. All reconcilers key appearances by PERSON (an event's
// 'player' maps to the bearer on that day), so a mantle copy of the
// same person's class/godhood/gift is one appearance, not two. Without
// this the pilot's first pass showed 14 recognition residue and 4
// ascension residue that were all mantle double-counts (same person,
// same class/god, counted once as a villager and once as the scholar).
// The correction changes attribution, not the metric: every recognition
// / ascension must still be attributed exactly once.
//
// Classifiers (each returns 'ok' or 'unclassified'):
//   classifySheetEvent / classifyRecognitionEvent / classifyDeedEvent /
//   classifyAscensionEvent / classifyVerbUseEvent / classifyPickEvent
// Reconcilers (residue 0 = complete capture):
//   reconcileRecognitions(o): tele class_recognized vs snapshot
//     godpath-class appearances (holder + path + subclass, day ±1).
//   reconcileAscensions(o): checkGodhood/checkVillagerGodhood fresh ids
//     vs ceremony events vs snapshot godhood active appearances.
//   reconcileGifts(o): maybeGrantCapstoneItem newlyGifted vs snapshot
//     capstoneGifted appearances (gift precedes ceremony in code).
//   reconcileVerbs(o): tele godpath_verb vs useAbility verbUseEvents
//     (player) — villager casts carry `who` in tele and have no
//     useAbility row; a tele verb use with no `who` and no matching
//     useAbility event is unclassified; a useAbility row is residue
//     only when the ability carries a `do` verb (hasVerb) — passive
//     magic abilities never tele.
//   reconcileDeeds(o): tele godpath_deed vs snapshot godpathDeeds book
//     entries (who + event, day ±1). relay_office is holder-based, not
//     book-backed — reconciled separately against snapshot switchboard.
//   reconcilePicks(o): chooseAbility / buildDecide picks vs snapshot
//     ability diffs (pick must appear in the holder's abilities within
//     1 day; the reverse is NOT required — gifts and arrival choices
//     grant abilities without a pick).
// analyzeSeed(o): per-seed summary (metrics 1–10 + wall numbers).
// analyzeBand(list): band totals + wall numbers + median survival
//   (upper median, same convention as the sibling analyzers).
'use strict';

const GODS = [
  { id: 'one_person_army', path: 'brawler', name: 'The One-Person Army', deed: null },
  { id: 'shepherd_of_the_dead', path: 'caregiver', name: 'The Shepherd of the Dead', deed: 'care_survived' },
  { id: 'the_between', path: 'drifter', name: 'The Between', deed: 'outmatched_escape' },
  { id: 'all_seeing', path: 'explorer', name: 'The All-Seeing', deed: 'field_truth_shared' },
  { id: 'living_garden', path: 'forager', name: 'The Living Garden', deed: null },
  { id: 'apex_predator', path: 'hunter', name: 'The Apex Predator', deed: 'apex_hunt' },
  { id: 'market_god', path: 'miser', name: 'The Market God', deed: 'market_exchange' },
  { id: 'undying_ward', path: 'shieldbearer', name: 'The Undying Ward', deed: 'ward_rescue' },
  { id: 'voice_of_the_relay', path: 'socialite', name: 'The Voice of the Relay', deed: 'relay_office' },
  { id: 'unkillable', path: 'survivalist', name: 'The Unkillable', deed: 'death_refused' },
];
const GOD_BY_ID = {};
GODS.forEach(function (g) { GOD_BY_ID[g.id] = g; });
const DEED_EVENTS = {
  care_survived: 1, outmatched_escape: 1, field_truth_shared: 1,
  apex_hunt: 1, market_exchange: 1, ward_rescue: 1, relay_office: 1, death_refused: 1,
};
const BOOK_DEED_EVENTS = {
  care_survived: 1, outmatched_escape: 1, field_truth_shared: 1,
  apex_hunt: 1, market_exchange: 1, ward_rescue: 1, death_refused: 1,
};

function inc(map, k, n) { map[k] = (map[k] || 0) + (n == null ? 1 : n); }

// Ability ids arrive as strings (npcAbilities) or full ability objects
// (scholar.abilities) — normalize everywhere a holder's abilities are read.
function idOf(x) {
  if (typeof x === 'string') return x;
  if (x && typeof x === 'object' && typeof x.id === 'string') return x.id;
  return null;
}

// The scholar is an OFFICE, not a person: snap.bearer is the living
// villager holding it, and it changes whenever the bearer dies (mantle).
// A class / godhood / gift that appears for the 'player' IS the current
// bearer's — keying appearances by 'player' double-counts the same
// person (once as a villager, once as the scholar). personOf maps an
// event's 'player' to the bearer on that day (nearest snapshot at or
// before the day); snapshot rows use their own snap.bearer.
function bearerByDay(o) {
  const map = {};
  (o.daily || []).forEach(function (snap) {
    if (snap && snap.bearer) map[snap.day] = snap.bearer;
  });
  return map;
}
function personOf(o, who, day) {
  if (who !== 'player') return String(who);
  const map = bearerByDay(o);
  if (map[day]) return map[day];
  let best = null, bestDay = -1;
  Object.keys(map).forEach(function (d) {
    const dd = +d;
    if (dd <= day && dd > bestDay) { bestDay = dd; best = map[d]; }
  });
  return best || 'player';
}
function classOfSnap(cl) {
  return (cl && cl.path) ? cl : null;
}

function classifySheetEvent(ev) {
  if (!ev || ev.who == null || !ev.track || ev.level == null) return 'unclassified';
  if (!Array.isArray(ev.offers)) return 'unclassified';
  if (ev.day == null) return 'unclassified';
  for (let i = 0; i < ev.offers.length; i++) {
    if (!ev.offers[i] || !ev.offers[i].id) return 'unclassified';
  }
  return 'ok';
}

function classifyRecognitionEvent(ev) {
  // tele class_recognized data OR a recognitionEvents row.
  const d = ev && ev.data ? ev.data : ev;
  if (!d || d.who == null || !d.path || !d.subclass || d.day == null) return 'unclassified';
  return 'ok';
}

function classifyDeedEvent(ev) {
  const d = ev && ev.data ? ev.data : ev;
  if (!d || !d.event || !DEED_EVENTS[d.event]) return 'unclassified';
  if (d.who == null || d.day == null) return 'unclassified';
  return 'ok';
}

function classifyAscensionEvent(ev) {
  if (!ev) return 'unclassified';
  if (ev.kind === 'checkGodhood' || ev.kind === 'checkVillagerGodhood') {
    if (!Array.isArray(ev.fresh) || ev.day == null || ev.who == null) return 'unclassified';
    return 'ok';
  }
  if (ev.kind === 'checkPlayerGodhoodAscension' || ev.kind === 'checkVillagerGodhoodAscension') {
    if (ev.day == null || ev.who == null) return 'unclassified';
    return 'ok';
  }
  return 'unclassified';
}

function classifyCeremonyEvent(ev) {
  if (!ev || !ev.god || ev.who == null || ev.day == null) return 'unclassified';
  return 'ok';
}

function classifyVerbUseEvent(ev) {
  // tele godpath_verb data OR a verbUseEvents row.
  const d = ev && ev.data ? ev.data : ev;
  if (!d || !d.ability || !d.verb || d.day == null) return 'unclassified';
  return 'ok';
}

function classifyPickEvent(ev) {
  if (!ev || !ev.id || ev.day == null) return 'unclassified';
  return 'ok';
}

// ---- snapshot trajectory helpers ----

function holderKey(who) { return who === 'player' ? 'player' : String(who); }
// Class appearances: [{person, path, subclass, day}] — first day the
// snapshot shows a class for a PERSON (bearer-keyed: a mantle copy of
// the same person's class is not a new appearance), plus re-appearances
// after a lapse/change. Records without a path (the engine stores {}
// for a bearer with no class) are not classes.
function classAppearances(o) {
  const out = [];
  const seen = {}; // person -> last class key
  (o.daily || []).forEach(function (snap) {
    if (!snap) return;
    const holders = [];
    if (snap.player) holders.push([snap.bearer || 'player', classOfSnap(snap.player.class)]);
    Object.keys(snap.villagers || {}).forEach(function (vid) {
      holders.push([vid, classOfSnap(snap.villagers[vid].class)]);
    });
    holders.forEach(function (pair) {
      const who = pair[0], cl = pair[1];
      const key = cl && !cl.lapsed && cl.path ? (cl.path + '/' + cl.subclass) : null;
      const prev = seen[who];
      if (key && key !== prev) {
        out.push({ who: who, path: cl.path, subclass: cl.subclass, god: cl.god || null, day: snap.day });
      }
      seen[who] = key;
    });
  });
  return out;
}

// Godhood active appearances: [{person, god, day}] — first day a god
// appears in the PERSON's godhood.active list (or recognized map).
function activeAppearances(o) {
  const out = [];
  const seen = {}; // person -> set of gods already active
  function activeSet(store) {
    const s = {};
    (store && store.active || []).forEach(function (g) { s[g] = 1; });
    Object.keys((store && store.recognized) || {}).forEach(function (g) { if ((store.recognized || {})[g]) s[g] = 1; });
    return s;
  }
  (o.daily || []).forEach(function (snap) {
    if (!snap) return;
    const holders = [];
    if (snap.player) holders.push([snap.bearer || 'player', snap.player.godhood]);
    Object.keys(snap.villagers || {}).forEach(function (vid) {
      holders.push([vid, snap.villagers[vid].godhood]);
    });
    holders.forEach(function (pair) {
      const who = pair[0];
      const set = activeSet(pair[1]);
      const prev = seen[who] || {};
      Object.keys(set).forEach(function (g) {
        if (!prev[g]) out.push({ who: who, god: g, day: snap.day });
      });
      seen[who] = set;
    });
  });
  return out;
}

// Capstone-gift appearances from the capstoneGifted store (person-keyed).
function giftAppearances(o) {
  const out = [];
  const seen = {};
  (o.daily || []).forEach(function (snap) {
    if (!snap) return;
    const holders = [];
    if (snap.player) holders.push([snap.bearer || 'player', snap.player.godhood]);
    Object.keys(snap.villagers || {}).forEach(function (vid) {
      holders.push([vid, snap.villagers[vid].godhood]);
    });
    holders.forEach(function (pair) {
      const who = pair[0];
      const gifted = (pair[1] && pair[1].capstoneGifted) || {};
      const prev = seen[who] || {};
      Object.keys(gifted).forEach(function (g) {
        if (gifted[g] && !prev[g]) out.push({ who: who, god: g, day: snap.day });
      });
      seen[who] = gifted;
    });
  });
  return out;
}

// Deed-book entries: [{who, event, day}] from the raw godpathDeeds book.
function deedBookEntries(o) {
  const out = [];
  const seen = {}; // who/event -> day
  (o.daily || []).forEach(function (snap) {
    if (!snap) return;
    const book = snap.godpathDeeds || {};
    Object.keys(book).forEach(function (vid) {
      Object.keys(book[vid] || {}).forEach(function (event) {
        const k = vid + '|' + event;
        if (!seen[k]) {
          const rec = book[vid][event] || {};
          out.push({ who: vid, event: event, day: (rec.day == null ? snap.day : rec.day) });
          seen[k] = true;
        }
      });
    });
  });
  return out;
}

function matchWithin(a, b, dayTol, keyFn) {
  // Count a-items with no b-item matching keyFn within dayTol, and vice versa.
  const usedB = {};
  let aResidue = 0;
  a.forEach(function (x) {
    let found = -1;
    for (let i = 0; i < b.length; i++) {
      if (usedB[i]) continue;
      if (keyFn(x, b[i]) && Math.abs((x.day || 0) - (b[i].day || 0)) <= dayTol) { found = i; break; }
    }
    if (found >= 0) usedB[found] = true; else aResidue++;
  });
  let bResidue = 0;
  Object.keys(usedB).forEach(function () {});
  b.forEach(function (y, i) { if (!usedB[i]) bResidue++; });
  return { aResidue: aResidue, bResidue: bResidue };
}

function reconcileRecognitions(o) {
  const teleRecs = (o.teleEvents || []).filter(function (e) { return e.type === 'class_recognized'; })
    .map(function (e) { return { who: personOf(o, (e.data || {}).who, e.day), path: (e.data || {}).path, subclass: (e.data || {}).subclass, day: e.day }; });
  const snaps = classAppearances(o);
  const keyFn = function (a, b) {
    return a.who === b.who && a.path === b.path && a.subclass === b.subclass;
  };
  const m = matchWithin(teleRecs, snaps, 1, keyFn);
  return { teleCount: teleRecs.length, snapCount: snaps.length,
    teleResidue: m.aResidue, snapResidue: m.bResidue,
    residue: m.aResidue + m.bResidue };
}

function reconcileAscensions(o) {
  const fresh = [];
  (o.ascensionEvents || []).forEach(function (ev) {
    if ((ev.kind === 'checkGodhood' || ev.kind === 'checkVillagerGodhood') && Array.isArray(ev.fresh)) {
      ev.fresh.forEach(function (g) { fresh.push({ who: personOf(o, ev.who, ev.day), god: g, day: ev.day }); });
    }
  });
  const ceremonies = (o.ceremonyEvents || []).map(function (e) { return { who: personOf(o, e.who, e.day), god: e.god, day: e.day }; });
  const actives = activeAppearances(o);
  const keyFn = function (a, b) { return a.who === b.who && a.god === b.god; };
  const m1 = matchWithin(fresh, ceremonies, 1, keyFn);
  const m2 = matchWithin(fresh, actives, 1, keyFn);
  return { freshCount: fresh.length, ceremonyCount: ceremonies.length, activeCount: actives.length,
    freshNoCeremony: m1.aResidue, ceremonyNoFresh: m1.bResidue,
    freshNoActive: m2.aResidue, activeNoFresh: m2.bResidue,
    residue: m1.aResidue + m1.bResidue + m2.aResidue + m2.bResidue };
}

function reconcileGifts(o) {
  const gifted = [];
  (o.capstoneGiftEvents || []).forEach(function (ev) {
    (ev.newlyGifted || []).forEach(function (g) { gifted.push({ who: personOf(o, ev.who, ev.day), god: g, day: ev.day }); });
  });
  const snaps = giftAppearances(o);
  const keyFn = function (a, b) { return a.who === b.who && a.god === b.god; };
  // Gift precedes the ceremony/check in code and the snapshot is daily:
  // allow the snapshot appearance up to 1 day AFTER the gift event.
  const usedB = {};
  let aResidue = 0;
  gifted.forEach(function (x) {
    let found = -1;
    for (let i = 0; i < snaps.length; i++) {
      if (usedB[i]) continue;
      if (keyFn(x, snaps[i]) && snaps[i].day - x.day >= 0 && snaps[i].day - x.day <= 1) { found = i; break; }
    }
    if (found >= 0) usedB[found] = true; else aResidue++;
  });
  let bResidue = 0;
  snaps.forEach(function (y, i) { if (!usedB[i]) bResidue++; });
  return { giftCount: gifted.length, snapCount: snaps.length,
    giftResidue: aResidue, snapResidue: bResidue, residue: aResidue + bResidue };
}

function reconcileVerbs(o) {
  const teleVerbs = (o.teleEvents || []).filter(function (e) { return e.type === 'godpath_verb'; })
    .map(function (e) { return { ability: (e.data || {}).ability, verb: (e.data || {}).verb, who: (e.data || {}).who || null, field: !!(e.data || {}).field, day: e.day }; });
  const uses = (o.verbUseEvents || []).map(function (e) { return { ability: e.ability, verb: e.verb, hasVerb: !!e.hasVerb, day: e.day }; });
  let unclassified = 0, playerMatched = 0, villager = 0;
  const usedU = {};
  teleVerbs.forEach(function (tv) {
    if (tv.who) { villager++; return; }
    let found = -1;
    for (let i = 0; i < uses.length; i++) {
      if (usedU[i]) continue;
      if (uses[i].ability === tv.ability && Math.abs((uses[i].day || 0) - (tv.day || 0)) <= 1) { found = i; break; }
    }
    if (found >= 0) { usedU[found] = true; playerMatched++; }
    else unclassified++;
  });
  // Only `do`-verb uses are expected to tele: 79 of the 94 path-tagged
  // magic abilities are passives with no `do` action (godpath.js
  // registerVerbs only wires `do` actions), so a passive use with no
  // tele is classified by its useAbility event alone, not residue.
  let useResidue = 0;
  uses.forEach(function (u, i) { if (!usedU[i] && u.hasVerb) useResidue++; });
  return { teleCount: teleVerbs.length, useCount: uses.length,
    playerMatched: playerMatched, villagerTele: villager,
    teleUnclassified: unclassified, useResidue: useResidue,
    residue: unclassified + useResidue };
}

function reconcileDeeds(o) {
  const teleDeeds = (o.teleEvents || []).filter(function (e) { return e.type === 'godpath_deed'; })
    .map(function (e) { return { who: personOf(o, (e.data || {}).who, e.day), event: (e.data || {}).event, day: e.day }; });
  const book = deedBookEntries(o);
  const bookOnly = book.filter(function (b) { return BOOK_DEED_EVENTS[b.event]; });
  const teleBook = teleDeeds.filter(function (d) { return BOOK_DEED_EVENTS[d.event]; });
  const keyFn = function (a, b) { return a.who === b.who && a.event === b.event; };
  const m = matchWithin(teleBook, bookOnly, 1, keyFn);
  // relay_office: holder-based — reconcile tele relay_office events
  // against snapshot switchboard holder days (holderId == who, day >= appointedDay).
  const relayTele = teleDeeds.filter(function (d) { return d.event === 'relay_office'; });
  let relayMatched = 0, relayUnmatched = 0;
  relayTele.forEach(function (rt) {
    const ok = (o.daily || []).some(function (snap) {
      return snap.switchboard && String(snap.switchboard.holderId) === String(rt.who) && snap.day >= (rt.day - 1);
    });
    if (ok) relayMatched++; else relayUnmatched++;
  });
  return { teleCount: teleDeeds.length, bookCount: book.length,
    teleBookResidue: m.aResidue, bookResidue: m.bResidue,
    relayTele: relayTele.length, relayMatched: relayMatched, relayUnmatched: relayUnmatched,
    residue: m.aResidue + m.bResidue + relayUnmatched };
}

// Ability diffs per PERSON: [{person, id, day}] — first day an ability
// appears in the person's snapshot abilities (scholar abilities arrive
// as full objects; npcAbilities as id strings — both normalized).
function abilityAppearances(o) {
  const out = [];
  const seen = {};
  function scan(who, ids, day) {
    const prev = seen[who] || {};
    (ids || []).forEach(function (x) {
      const id = idOf(x);
      if (id && !prev[id]) out.push({ who: who, id: id, day: day });
    });
    const next = {};
    (ids || []).forEach(function (x) { const id = idOf(x); if (id) next[id] = 1; });
    seen[who] = next;
  }
  (o.daily || []).forEach(function (snap) {
    if (!snap) return;
    if (snap.player) scan(snap.bearer || 'player', snap.player.abilities, snap.day);
    Object.keys(snap.villagers || {}).forEach(function (vid) {
      scan(vid, snap.villagers[vid].abilities, snap.day);
    });
  });
  return out;
}

function reconcilePicks(o) {
  const apps = abilityAppearances(o);
  function findApp(who, id, day) {
    return apps.some(function (a) {
      return a.who === who && a.id === id &&
        a.day - day >= 0 && a.day - day <= 1;
    });
  }
  let playerPicks = 0, playerResidue = 0;
  (o.pickEvents || []).forEach(function (p) {
    playerPicks++;
    if (!findApp(personOf(o, 'player', p.day), p.id, p.day)) playerResidue++;
  });
  let villagerPicks = 0, villagerResidue = 0, villagerKeeps = 0;
  (o.villagerPickEvents || []).forEach(function (p) {
    const d = p.decision || {};
    if (d.keep) { villagerKeeps++; return; }
    const id = d.pick || d.id || d.ability || null;
    if (!id) { villagerPicks++; villagerResidue++; return; }
    villagerPicks++;
    if (!findApp(p.vid, id, p.day)) villagerResidue++;
  });
  return { playerPicks: playerPicks, playerResidue: playerResidue,
    villagerPicks: villagerPicks, villagerKeeps: villagerKeeps,
    villagerResidue: villagerResidue,
    residue: playerResidue + villagerResidue };
}

// ---- per-seed summary ----

function analyzeSeed(o) {
  const s = {
    seed: o.seed, mode: o.mode, days: o.days, gameDays: o.gameDays,
    endReason: o.endReason, won: !!o.won, villageLost: !!o.villageLost,
    scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing,
    endPantryKcal: o.endPantryKcal, deaths: (o.deaths || []).length,
    errors: (o.instrumentErrors || []).length,
    snapshots: (o.daily || []).length, says: (o.godpathSays || []).length,
  };
  // Sheets.
  const sheets = o.sheetEvents || [];
  s.sheets = sheets.length;
  s.sheetsUnclassified = sheets.filter(function (e) { return classifySheetEvent(e) !== 'ok'; }).length;
  s.sheetsPlayer = sheets.filter(function (e) { return e.who === 'player'; }).length;
  s.sheetsVillager = sheets.length - s.sheetsPlayer;
  s.sheetsLeaned = sheets.filter(function (e) { return e.leaned; }).length;
  s.sheetsJobLeaned = sheets.filter(function (e) { return e.jobLeaned; }).length;
  s.sheetsByTrack = {};
  sheets.forEach(function (e) { inc(s.sheetsByTrack, e.track || '?'); });
  s.offersTotal = sheets.reduce(function (a, e) { return a + (e.offers || []).length; }, 0);
  s.offersNoPath = sheets.reduce(function (a, e) {
    return a + (e.offers || []).filter(function (of) { return !of.path; }).length;
  }, 0);
  s.offersOnRecognisedPath = 0; // computed below from snapshot classes at sheet day
  // Picks.
  s.picks = (o.pickEvents || []).length;
  s.picksUnclassified = (o.pickEvents || []).filter(function (e) { return classifyPickEvent(e) !== 'ok'; }).length;
  s.picksByPath = {};
  (o.pickEvents || []).forEach(function (e) { inc(s.picksByPath, e.path || '?'); });
  s.villagerPicks = (o.villagerPickEvents || []).length;
  s.villagerKeeps = (o.villagerPickEvents || []).filter(function (e) { return (e.decision || {}).keep; }).length;
  s.villagerPicksByPath = {};
  (o.villagerPickEvents || []).forEach(function (e) {
    const d = e.decision || {};
    if (d.keep) return;
    const picked = d.pick || d.id || d.ability;
    const off = (e.offers || []).find(function (of) { return of.id === picked; });
    inc(s.villagerPicksByPath, (off && off.path) || '?');
  });
  s.learns = (o.learnEvents || []).length;
  s.learnsByPath = {};
  (o.learnEvents || []).forEach(function (e) { inc(s.learnsByPath, e.path || '?'); });
  // Recognitions.
  s.recognitions = reconcileRecognitions(o);
  const recs = classAppearances(o);
  s.recognitionList = recs;
  s.recognitionsByPath = {};
  recs.forEach(function (r) { inc(s.recognitionsByPath, r.path || '?'); });
  s.recognitionsByGod = {};
  recs.forEach(function (r) { inc(s.recognitionsByGod, r.god || '?'); });
  s.firstRecognitionDay = recs.length ? Math.min.apply(null, recs.map(function (r) { return r.day; })) : null;
  // Deeds.
  s.deeds = reconcileDeeds(o);
  s.deedTeleByEvent = {};
  (o.teleEvents || []).filter(function (e) { return e.type === 'godpath_deed'; })
    .forEach(function (e) { inc(s.deedTeleByEvent, (e.data || {}).event || '?'); });
  s.deedBookByEvent = {};
  deedBookEntries(o).forEach(function (b) { inc(s.deedBookByEvent, b.event || '?'); });
  // Ascensions + gifts + ceremonies.
  s.ascensions = reconcileAscensions(o);
  s.gifts = reconcileGifts(o);
  s.ceremonies = (o.ceremonyEvents || []).length;
  s.ceremoniesUnclassified = (o.ceremonyEvents || []).filter(function (e) { return classifyCeremonyEvent(e) !== 'ok'; }).length;
  s.ceremonyByGod = {};
  (o.ceremonyEvents || []).forEach(function (e) { inc(s.ceremonyByGod, e.god || '?'); });
  s.ascensionAttempts = (o.ascensionEvents || []).filter(function (e) {
    return e.kind === 'checkPlayerGodhoodAscension' || e.kind === 'checkVillagerGodhoodAscension';
  }).length;
  s.ascensionChecks = (o.ascensionEvents || []).filter(function (e) {
    return e.kind === 'checkGodhood' || e.kind === 'checkVillagerGodhood';
  }).length;
  s.ascensionFreshByGod = {};
  (o.ascensionEvents || []).forEach(function (e) {
    (e.fresh || []).forEach(function (g) { inc(s.ascensionFreshByGod, g); });
  });
  // Verbs.
  s.verbs = reconcileVerbs(o);
  s.verbUsesByAbility = {};
  (o.verbUseEvents || []).forEach(function (e) { inc(s.verbUsesByAbility, e.ability || '?'); });
  s.verbUsesByPath = {};
  (o.verbUseEvents || []).forEach(function (e) { inc(s.verbUsesByPath, e.path || '?'); });
  s.villagerCasts = (o.villagerCastEvents || []).length;
  s.capstoneVerbs = (o.capstoneVerbEvents || []).length;
  s.capstoneVerbsByVerb = {};
  (o.capstoneVerbEvents || []).forEach(function (e) { inc(s.capstoneVerbsByVerb, e.verb || '?'); });
  // Tele counts.
  s.teleByType = {};
  (o.teleEvents || []).forEach(function (e) { inc(s.teleByType, e.type || '?'); });
  // Wraps.
  s.wrapLive = o.wrapLive || {};
  s.wrapCounts = o.wrapCounts || {};
  // Ladder: max kit / close / complete per god across all snapshots.
  s.ladder = {};
  GODS.forEach(function (g) {
    s.ladder[g.id] = { maxKit: 0, holdersClose: 0, holdersComplete: 0, holdersReady: 0, maxDay: null };
  });
  const holdersClose = {}, holdersComplete = {}, holdersReady = {};
  (o.daily || []).forEach(function (snap) {
    if (!snap) return;
    const holders = [];
    if (snap.player) holders.push([snap.bearer || 'player', snap.player.closeness]);
    Object.keys(snap.villagers || {}).forEach(function (vid) {
      const v = snap.villagers[vid];
      if (v.closeness && Object.keys(v.closeness).length) holders.push([vid, v.closeness]);
    });
    holders.forEach(function (pair) {
      const who = pair[0], cl = pair[1] || {};
      GODS.forEach(function (g) {
        const c = cl[g.id];
        if (!c) return;
        const L = s.ladder[g.id];
        if (c.kit > L.maxKit) { L.maxKit = c.kit; L.maxDay = snap.day; }
        if (c.close) holdersClose[g.id + '|' + who] = 1;
        if (c.complete) holdersComplete[g.id + '|' + who] = 1;
        if (c.readyForCapstone) holdersReady[g.id + '|' + who] = 1;
      });
    });
  });
  GODS.forEach(function (g) {
    s.ladder[g.id].holdersClose = Object.keys(holdersClose).filter(function (k) { return k.indexOf(g.id + '|') === 0; }).length;
    s.ladder[g.id].holdersComplete = Object.keys(holdersComplete).filter(function (k) { return k.indexOf(g.id + '|') === 0; }).length;
    s.ladder[g.id].holdersReady = Object.keys(holdersReady).filter(function (k) { return k.indexOf(g.id + '|') === 0; }).length;
  });
  // End-of-run state: player + best villager per god.
  const last = (o.daily || [])[(o.daily || []).length - 1] || null;
  s.endPlayer = last && last.player ? {
    abilities: (last.player.abilities || []).length,
    class: (last.player.class && last.player.class.path) ? (last.player.class.path + '/' + last.player.class.subclass) : null,
    godhood: last.player.godhood || {},
    tracks: last.player.tracks || {},
    trackStats: last.player.trackStats || {},
  } : null;
  s.endVillagerBest = {};
  if (last) {
    Object.keys(last.villagers || {}).forEach(function (vid) {
      const v = last.villagers[vid];
      const n = (v.abilities || []).length;
      if (!s.endVillagerBest.maxAbilities || n > s.endVillagerBest.maxAbilities) {
        s.endVillagerBest = { vid: vid, maxAbilities: n,
          class: (v.class && v.class.path) ? (v.class.path + '/' + v.class.subclass) : null,
          godhood: v.godhood || {} };
      }
    });
  }
  // Picks reconciliation.
  s.picksReconciled = reconcilePicks(o);
  // Unclassified counts for GO rows.
  s.unclassifiedSheets = s.sheetsUnclassified;
  s.unclassifiedRecognitions = s.recognitions.residue;
  s.unclassifiedAscensions = s.ascensions.residue + s.gifts.residue;
  s.unclassifiedVerbs = s.verbs.residue;
  s.opportunityEvents = s.sheets + s.recognitionList.length +
    Object.keys(s.deedTeleByEvent).reduce(function (a, k) { return a + s.deedTeleByEvent[k]; }, 0) +
    s.verbs.teleCount + s.ascensionAttempts;
  return s;
}

function medianUpper(sorted) {
  if (!sorted.length) return null;
  return sorted[Math.floor(sorted.length / 2)];
}

function analyzeBand(summaries) {
  const days = summaries.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const b = {
    seeds: summaries.length,
    totalDays: days.reduce(function (a, x) { return a + x; }, 0),
    medianSurvival: medianUpper(days),
    sortedDays: days,
    survived: summaries.filter(function (s) { return !s.villageLost && s.days >= 150; }).length,
    national: summaries.filter(function (s) { return s.scaleRank === 'national'; }).length,
    table: summaries.filter(function (s) { return s.tableDone; }).length,
    wins: summaries.filter(function (s) { return s.won; }).length,
    wave4: summaries.filter(function (s) { return s.maxWave >= 4; }).length,
    wave5: summaries.filter(function (s) { return s.maxWave >= 5; }).length,
    deaths: summaries.reduce(function (a, s) { return a + s.deaths; }, 0),
    sheets: summaries.reduce(function (a, s) { return a + s.sheets; }, 0),
    picks: summaries.reduce(function (a, s) { return a + s.picks; }, 0),
    villagerPicks: summaries.reduce(function (a, s) { return a + s.villagerPicks; }, 0),
    recognitions: summaries.reduce(function (a, s) { return a + s.recognitionList.length; }, 0),
    ascensions: summaries.reduce(function (a, s) { return a + Object.keys(s.ascensionFreshByGod).reduce(function (x, k) { return x + s.ascensionFreshByGod[k]; }, 0); }, 0),
    ceremonies: summaries.reduce(function (a, s) { return a + s.ceremonies; }, 0),
    gifts: summaries.reduce(function (a, s) { return a + s.gifts.giftCount; }, 0),
    verbUses: summaries.reduce(function (a, s) { return a + s.verbs.useCount; }, 0),
    teleVerbs: summaries.reduce(function (a, s) { return a + s.verbs.teleCount; }, 0),
    capstoneVerbs: summaries.reduce(function (a, s) { return a + s.capstoneVerbs; }, 0),
    errors: summaries.reduce(function (a, s) { return a + s.errors; }, 0),
    unclassifiedSheets: summaries.reduce(function (a, s) { return a + s.unclassifiedSheets; }, 0),
    unclassifiedRecognitions: summaries.reduce(function (a, s) { return a + s.unclassifiedRecognitions; }, 0),
    unclassifiedAscensions: summaries.reduce(function (a, s) { return a + s.unclassifiedAscensions; }, 0),
    unclassifiedVerbs: summaries.reduce(function (a, s) { return a + s.unclassifiedVerbs; }, 0),
    opportunityEvents: summaries.reduce(function (a, s) { return a + s.opportunityEvents; }, 0),
  };
  return b;
}

module.exports = {
  GODS: GODS, GOD_BY_ID: GOD_BY_ID, DEED_EVENTS: DEED_EVENTS,
  classifySheetEvent: classifySheetEvent,
  classifyRecognitionEvent: classifyRecognitionEvent,
  classifyDeedEvent: classifyDeedEvent,
  classifyAscensionEvent: classifyAscensionEvent,
  classifyCeremonyEvent: classifyCeremonyEvent,
  classifyVerbUseEvent: classifyVerbUseEvent,
  classifyPickEvent: classifyPickEvent,
  classAppearances: classAppearances,
  activeAppearances: activeAppearances,
  giftAppearances: giftAppearances,
  deedBookEntries: deedBookEntries,
  abilityAppearances: abilityAppearances,
  personOf: personOf,
  idOf: idOf,
  reconcileRecognitions: reconcileRecognitions,
  reconcileAscensions: reconcileAscensions,
  reconcileGifts: reconcileGifts,
  reconcileVerbs: reconcileVerbs,
  reconcileDeeds: reconcileDeeds,
  reconcilePicks: reconcilePicks,
  analyzeSeed: analyzeSeed,
  analyzeBand: analyzeBand,
  medianUpper: medianUpper,
};
