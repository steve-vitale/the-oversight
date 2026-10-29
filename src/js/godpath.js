// @ontology
// system: godpath
// description: The god-path runtime (2026-10-14 redesign, Steve: "Gods are rough representatives of what starts out as jobs and classes, or playstyles." / "Each god path can have some intended subclasses though that fit the build."). ONE source of truth: src/data/godpaths.json (10 paths x 2 subclasses, each path's god) + the `path`/`subclass` tag on every magic ability. This module (1) names a holder's CLASS when their magic leans clearly to one path ("<Subclass> of <God>", player and villager through the same function), (2) leans level-up and gift offers toward a recognised path with distinct roles, (3) scores how far an ability pulls a holder toward a god (pathLean, read by villager-build.js buildPathLean, the one hook in Game.buildScore), and (4) runs the small engine verbs the new subclass abilities declare in data (`do` on an action): walls, pulls, pushes, swaps, blinks, heals, pins, bribes, broadcasts, commands.
// provides:
//   - godpathData() -> godpaths.json record
//   - abilityPaths(idOrDef) -> [path, alsoPath?] (THE reader for an ability's path; replaces the old `paths` array)
//   - classify(ids) -> {path, subclass, count, counts} | null (pure)
//   - holderMagicIds(who) -> magic ability ids held by 'player' or a villager id
//   - recognizeClass(who) -> the holder's class record or null (narrates once per change)
//   - godpathClass(who) -> stored class record {path, subclass, since, god} or null
//   - beginApexHunt(game, fight), observeApexHunt(game, fight, damagedKey?) -> saved original encounter evidence
//   - finishTacticalEscape(game, fight, fighter?), finishFieldEscape(game, vid, opening, result, sealed) -> actual personal living flight
//   - noteCareRescue(actor, patient, before, after, maxHp, via, scene) -> actual other-person rescue pending a later dawn
//   - godpathDeedStatus(who, godId, day?) -> read-only person-owned deed qualification
//   - godpathDeedHint(who) -> earned-class objective, hidden after recognition
//   - classLine(who) -> "Berserker of the One-Person Army" or null (only once recognised)
//   - pathLean(who, abilityId, opts) -> lean score (opts.knows(id) gates unknown abilities to 0; never reveals them)
//   - shapeOffers(choices, pool, who, opts) -> offers with >=1 on the recognised path (else >=1 on the holder's job path within opts.jobWindow) and distinct roles where possible
//   - kitSheet(cands, who, track, level) -> THE level-up sheet for player and villagers: offerSize offers drawn from the next rules.offers.window unheld kit entries, weighted to earlier ones, deterministic per holder/track/level (private hash stream), then shapeOffers
//   - holderJobPaths(who) -> god paths the holder's occupation leans to (characterGen occupations[].pathLean)
//   - registerVerbs() -> registers a generic impl + precheck for every data action with `do` (verbs: aegis, wall, pull, push, pack, heal, blink, swap, foresee, broadcast, command, empower, guard, bribe, feed_camp)
//   - allyWouldFall(game, t) / onAllyFell(game, t) -> Lifeline / Last Rites hooks (tbDamage)
//   - npcDeathRefusal(game, personId, context) -> actual NPC survival outcome with canonical daily/weekly budgets and physical prices
//   - absorbPlayerHit(game, dmg) / aegisRedirect(game, t, dmg, src) -> Coin Guard / Last Rites absorbs, Aegis Link redirect (tbDamage)
//   - damageMult(game, target) / dodgeBonus(game) -> Misdirection / Prophecy (buildarounds damageMult / dodgeBonus)
//   - villagerCast(game, v) -> a villager fighter casts a held subclass verb through the SAME VERBS (actor = their fighter), paying the data kcal from their belly (hunger kcal/25); true / 'free' / false (wraps tbVillagerAbility)
//   - villagerStrikeMult(game, v, target) / absorbVillagerHit(game, t, final) -> Stoke, Back from the Brink, Misdirection / Coin Guard, Last Rites, Prophecy on villagers (game.js tbVillagerTurn, tbDamage)
//   - fieldBegin(game, vid, vAbs) -> per-fight state for the verbs and passives in off-screen field fights (fieldFights.js), with fieldAct, fieldStrike, fieldIncoming, fieldAllyShare, fieldCheatDeath, fieldAllyDown, fieldEvade
// consumes:
//   - Game.data.godpaths, Game.data.abilities, state.scholar.abilities, state.village.npcAbilities
//   - useAbility, tbFighter, tbCanOccupy, tbBlocked, tbDamage, tbVillagerTurn, addHealth, npcNeeds, keepsakeGrow, wornKeepsakes
// rules:
//   - one_source: an ability's path is `def.path` (+ `def.alsoPath`); nothing reads the retired `paths` array (code: abilityPaths)
//   - same_function: recognition runs the same classify() for the player and every villager (code: recognizeClass)
//   - if_you_dont_know_it_doesnt_show: classLine is null until the class is recognised (code: classLine)
//   - one_sheet: player and villager level-up sheets both come from kitSheet (code: kitSheet)
//   - sheet_rng_private: the sheet window draw never consumes Math.random (code: sheetRng)
//   - job_lean_before_class: before a class is named, a sheet carries >=1 offer on the holder's job path when the window has one; after, the class lean rules (code: shapeOffers)
//   - knowledge_gated_lean: pathLean scores only abilities the caller says the holder knows; an unknown ability scores 0 (code: pathLean)
//   - control_changes_the_board: warden/trickster/dealer verbs move fighters or raise terrain on the real grid (code: VERBS.wall, push, pull, swap, bribe)
//   - food_powered: every verb's cost is in the action's data (kcal), paid by useAbility before dispatch (code: registerVerbs)
//   - same_verbs_for_villagers: a villager casts the same VERBS with the same data kcal (their hunger pays; hunger >= 80 or a starving pantry refuses), and held passives apply to whoever holds them (code: villagerCast, sideHolders, fieldBegin)
//   - never_silent: every verb narrates, success or refusal; errors are reported via warn (code: warn)
(function () {
  'use strict';
  const S = globalThis.Scattering = globalThis.Scattering || {};
  const Game = S.Game;
  if (!Game) return;

  const _warned = {};
  function warn(msg, e) {
    const k = String(msg);
    if (_warned[k]) return;
    _warned[k] = true;
    console.warn('[godpath] ' + msg + (e ? ': ' + ((e && e.message) || e) : ''));
  }
  const cheb = (a, b) => Math.max(Math.abs((a.mx || 0) - (b.mx || 0)), Math.abs((a.my || 0) - (b.my || 0)));
  const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  function data() { return (Game.data && Game.data.godpaths) || S.GODPATHS || null; }
  function defOf(id) {
    if (id && typeof id === 'object') return id;
    try { return (Game.abilityDef ? Game.abilityDef(id) : ((Game.data.abilities || []).find(a => a.id === id))) || null; }
    catch (e) { warn('defOf', e); return null; }
  }
  function abilityPaths(idOrDef) {
    const d = defOf(idOrDef);
    if (!d || !d.path) return [];
    return d.alsoPath ? [d.path, d.alsoPath] : [d.path];
  }
  function godName(pid) {
    const p = ((data() || {}).paths || {})[pid];
    return (p && p.god && p.god.name) || pid;
  }

  // classify(ids): pure. Counts PRIMARY paths of magic abilities.
  function classify(ids) {
    const D = data();
    if (!D) return null;
    const min = ((D.rules || {}).recognize || {}).minAbilities || 3;
    const counts = {}, subs = {};
    for (const id of (ids || [])) {
      const d = defOf(id);
      if (!d || d.lane !== 'magic' || !d.path) continue;
      counts[d.path] = (counts[d.path] || 0) + 1;
      if (d.subclass) { subs[d.path] = subs[d.path] || {}; subs[d.path][d.subclass] = (subs[d.path][d.subclass] || 0) + 1; }
    }
    let best = null, second = 0;
    for (const p of Object.keys(counts)) {
      if (!best || counts[p] > counts[best]) { if (best) second = Math.max(second, counts[best]); best = p; }
      else second = Math.max(second, counts[p]);
    }
    if (!best || counts[best] < min || counts[best] <= second) return null;
    const pdef = (D.paths || {})[best] || {};
    const subIds = Object.keys(pdef.subclasses || {});
    const held = new Set(ids || []);
    let sub = null;
    for (const sid of subIds) {
      const n = (subs[best] || {})[sid] || 0;
      if (!sub) { sub = { id: sid, n }; continue; }
      if (n > sub.n) sub = { id: sid, n };
      else if (n === sub.n) {
        const payoffHere = held.has((pdef.subclasses[sid] || {}).payoff);
        const payoffThere = held.has((pdef.subclasses[sub.id] || {}).payoff);
        if (payoffHere && !payoffThere) sub = { id: sid, n };
      }
    }
    return { path: best, subclass: sub ? sub.id : null, count: counts[best], counts };
  }

  // emergingPath(ids): {path} when 2+ magic abilities share a primary path
  // and lead every other path; null otherwise. The pre-class lean.
  function emergingPath(ids) {
    const c = {};
    for (const id of (ids || [])) { const d = defOf(id); if (d && d.lane === 'magic' && d.path) c[d.path] = (c[d.path] || 0) + 1; }
    const ps = Object.keys(c).sort((a, b) => c[b] - c[a]);
    if (!ps.length || c[ps[0]] < 2 || (ps[1] && c[ps[1]] === c[ps[0]])) return null;
    return { path: ps[0], emerging: true };
  }
  function holderMagicIds(who) {
    try {
      if (who === 'player' || who == null || (Game.villagerId && who === Game.villagerId)) {
        const s = (Game.state && Game.state.scholar) || {};
        const out = [];
        for (const e of (s.abilities || [])) {
          const id = (e && (e.evolvedFrom || e.id)) || e;
          if (id) out.push(id);
        }
        return out;
      }
      return ((((Game.state || {}).village || {}).npcAbilities || {})[who] || []).slice();
    } catch (e) { warn('holderMagicIds', e); return []; }
  }
  function isPlayer(who) { return who === 'player' || who == null || (Game.villagerId && who === Game.villagerId); }
  function store(who) {
    if (isPlayer(who)) return Game.state.scholar;
    const v = Game.state.village; v.npcGodpath = v.npcGodpath || {};
    return { get godpath() { return v.npcGodpath[who] || null; }, set godpath(x) { if (x) v.npcGodpath[who] = x; else delete v.npcGodpath[who]; } };
  }
  function godpathClass(who) {
    try { const st = store(who); return (st && st.godpath && st.godpath.path) ? st.godpath : null; }
    catch (e) { warn('godpathClass', e); return null; }
  }
  // Fieldwork and a landed true lesson belong to people, not the office's
  // Codex. These private frames follow actual callers without making an
  // ordinary knowledge-store write into a discovery or a teaching event.
  let knowledgeFrame = null;
  function knowledgePerson(id) {
    const s = Game.state.scholar, v = Game.state.village, person = id && Game.vpOf(id);
    return !!(id && !Game.over && person && person.id === id && !person.dead &&
      (v.roster || []).includes(id) &&
      (id === Game.villagerId ? s.health > 0 : v.health?.[id] == null || v.health[id] > 0));
  }
  function noteFieldDiscovery(id, pid) {
    const v = Game.state.village;
    if (!knowledgePerson(id) || v.godpathDeeds?.[id]?.field_truth_shared) return;
    const people = v.godpathFieldDiscoveries || (v.godpathFieldDiscoveries = {});
    const own = people[id] || (people[id] = {});
    if (!own[pid]) own[pid] = { day: Game.state.scholar.day, source: 'fieldwork' };
  }
  function noteFieldSharing(actor, recipient, pid, via) {
    const v = Game.state.village, discovery = v.godpathFieldDiscoveries?.[actor]?.[pid];
    if (!discovery || actor === recipient || !knowledgePerson(actor) || !knowledgePerson(recipient) ||
        v.away?.[actor] || v.away?.[recipient] ||
        (actor !== Game.villagerId && recipient !== Game.villagerId && v.wrongAbout?.[actor]?.[pid]) ||
        (recipient !== Game.villagerId && v.wrongAbout?.[recipient]?.[pid]) ||
        v.godpathDeeds?.[actor]?.field_truth_shared) return;
    if (actor === Game.villagerId) {
      const e = Game.state.codex.plants?.[pid];
      if (!e || !(e.level >= 1) || e.wrongAs || e.wrongPid) return;
    }
    if (recipient === Game.villagerId) {
      const e = Game.state.codex.plants?.[pid];
      if (!e || !(e.level >= 1) || e.wrongAs || e.wrongPid) return;
    }
    const books = v.godpathDeeds || (v.godpathDeeds = {}), book = books[actor] || (books[actor] = {});
    book.field_truth_shared = { day: Game.state.scholar.day, plant: pid, recipient, discoveredDay: discovery.day, discoverySource: discovery.source, via };
    delete v.godpathFieldDiscoveries[actor];
    const last = (Game.state.telemetry || []).at(-1), t = Number.isFinite(last?.t) ? last.t : 0;
    try { Game.tele('godpath_deed', { t, who: actor, event: 'field_truth_shared', ...book.field_truth_shared }); }
    catch (e) { warn('field knowledge deed', e); }
  }
  for (const name of ['sortBag', 'testCautiously', 'villagerExperimentBeat', 'villagerCuriousExamine', 'resolveOneAssignment', 'firesideTeaching', 'teachPlant', 'convoTurn', 'spreadPlantKnowledge']) {
    const original = Game[name];
    if (typeof original !== 'function') continue;
    Game[name] = function (who, choice) {
      if (name === 'convoTurn' && choice !== 'teach') return original.apply(this, arguments);
      if (name === 'resolveOneAssignment' && choice?.task !== 'forage') return original.apply(this, arguments);
      const previous = knowledgeFrame;
      const kind = name === 'villagerExperimentBeat' ? 'experiment' : name === 'testCautiously' ? 'testing'
        : name === 'spreadPlantKnowledge' ? 'word' : name === 'firesideTeaching' ? 'fireside' : name === 'convoTurn' ? 'conversation'
        : name === 'villagerCuriousExamine' || name === 'resolveOneAssignment' || (name === 'sortBag' && who == null) ? 'fieldwork' : 'lesson';
      knowledgeFrame = { kind, actor: ['fireside', 'word', 'experiment'].includes(kind) ? null : kind === 'testing' || kind === 'conversation' || (name === 'sortBag' && who == null) ? Game.villagerId : who };
      if (name === 'resolveOneAssignment') {
        knowledgeFrame.beforeShared = new Set(Object.keys(Game.state.village.sharedKnowledge || {}));
        knowledgeFrame.beforeKnown = new Set(this.plantsKnownBy(who));
      }
      try { return original.apply(this, arguments); }
      finally { knowledgeFrame = previous; }
    };
  }
  // Assigned foragers publish their new field result before synchronising
  // personal knowledge. The System feed can teach that person in between,
  // making the later fieldwork write redundant. Attribute the actual new
  // result before that feed; never reconstruct one from an old shared map.
  const _fieldKnowledgeFlow = Game.flowVillageKnowledge;
  if (typeof _fieldKnowledgeFlow === 'function') Game.flowVillageKnowledge = function () {
    const frame = knowledgeFrame;
    try {
      if (frame?.beforeShared && frame.beforeKnown) {
        for (const [pid, entry] of Object.entries(Game.state.village.sharedKnowledge || {})) {
          if (!frame.beforeShared.has(pid) && !frame.beforeKnown.has(pid) && entry.discoveredBy === frame.actor)
            noteFieldDiscovery(frame.actor, pid);
        }
      }
    } catch (e) { warn('assigned field discovery', e); }
    return _fieldKnowledgeFlow.apply(this, arguments);
  };
  const _knowledgeCredit = Game.creditDeed;
  if (typeof _knowledgeCredit === 'function') Game.creditDeed = function (who, deed) {
    if (knowledgeFrame?.kind === 'fireside' && deed === 'teaching') knowledgeFrame.actor = who;
    if (knowledgeFrame?.kind === 'experiment' && deed === 'crafting') knowledgeFrame.actor = who;
    return _knowledgeCredit.apply(this, arguments);
  };
  // The public experiment selects and credits its actual tester before
  // naming the result for the watching player. Its later personal-store
  // sync may be redundant if that tester was also the immediate witness.
  const _experimentIdentify = Game.identifyPlant;
  if (typeof _experimentIdentify === 'function') Game.identifyPlant = function (pid, source) {
    const frame = knowledgeFrame, actor = frame?.kind === 'experiment' && frame.actor;
    const newToTester = actor && source === 'tested' && !this.plantKnownBy(actor, pid);
    const result = _experimentIdentify.apply(this, arguments);
    if (result === true && newToTester) {
      try { noteFieldDiscovery(actor, pid); noteFieldSharing(actor, Game.villagerId, pid, 'experiment'); }
      catch (e) { warn('public experimental discovery', e); }
    }
    return result;
  };
  const _knowledgeLearn = Game.villagerLearnsPlant;
  if (typeof _knowledgeLearn === 'function') Game.villagerLearnsPlant = function (who, pid, source, teacher) {
    const frame = knowledgeFrame;
    if (!frame) return _knowledgeLearn.apply(this, arguments);
    const known = this.plantKnownBy(who, pid), result = _knowledgeLearn.apply(this, arguments);
    if (result !== true || known || !knowledgePerson(who)) return result;
    try {
      if (frame.kind === 'fieldwork' && frame.actor === who && source === 'fieldwork') noteFieldDiscovery(who, pid);
      if (frame.kind === 'testing' && frame.actor === who && ['fieldwork', 'tested'].includes(source)) noteFieldDiscovery(who, pid);
      const channel = { fieldwork: 'observed', fireside: 'fireside', conversation: 'player-taught', lesson: 'taught', word: 'word of mouth' }[frame.kind];
      const actor = frame.kind === 'word' ? teacher : frame.actor;
      if (source === channel && actor && actor !== who) noteFieldSharing(actor, who, pid, source);
    } catch (e) { warn('field knowledge outcome', e); }
    return result;
  };

  function wardPerson(game, fighter) {
    if (!fighter || !['player', 'villager', 'ally'].includes(fighter.kind)) return null;
    const id = fighter.kind === 'player' ? game.villagerId : fighter.villagerId;
    const person = id && game.vpOf(id);
    return person && person.id === id && !person.dead ? id : null;
  }
  function recordApexHunt(vid, actorMaxHp, prey, scene, method) {
    const s = Game.state.scholar, v = Game.state.village, p = Game.vpOf(vid);
    if (Game.over || !vid || !p || p.id !== vid || p.dead ||
        (isPlayer(vid) && !(s.health > 0)) || !prey.full ||
        !Game.data.monsters.some(m => m.id === prey.monster) ||
        !(Number.isFinite(actorMaxHp) && actorMaxHp > 0 && Number.isFinite(prey.hp) && prey.hp > actorMaxHp)) return;
    const books = v.godpathDeeds || (v.godpathDeeds = {}), book = books[vid] || (books[vid] = {});
    if (book.apex_hunt) return;
    book.apex_hunt = { day: s.day || 0, monster: prey.monster, actorMaxHp, openingHp: prey.hp, scene, method };
    const last = (Game.state.telemetry || []).at(-1), t = Number.isFinite(last?.t) ? last.t : 0;
    try { Game.tele('godpath_deed', { t, who: vid, event: 'apex_hunt', day: s.day || 0, monster: prey.monster, scene, method }); }
    catch (e) { warn('solo hunt deed', e); }
  }
  const huntSide = x => x && ['player', 'villager', 'ally'].includes(x.kind);
  const huntPerson = (game, x) => x.kind === 'player' ? game.villagerId : x.villagerId;
  function beginApexHunt(game, f) {
    if (!f || f._gpApexHunt) return;
    const side = (f.fighters || []).filter(huntSide), prey = new Map();
    // Formal companions enter through party.js after the core constructor.
    // Read their existing ownership now, before any turn can teach a talent;
    // only an actual later fighter can use this saved opening evidence.
    const village = game.state.village, openingCompanions = {};
    for (const id of new Set(village.party || [])) {
      if (!id || id === game.villagerId || !(village.roster || []).includes(id)) continue;
      openingCompanions[id] = { pack: holderMagicIds(id).includes('pack_hunt'),
        maxHp: Math.max(100, village.health?.[id] || 0) };
    }
    for (const m of (f.fighters || [])) {
      if (m.kind !== 'monster' || !m.mdef || !m.alive || m.fled || !(m.hp > 0)) continue;
      const key = game.tbSnakeLineageKey(m), old = prey.get(key);
      if (old) { old.hp += m.hp; old.full = old.full && m.hp === m.maxHp; }
      else prey.set(key, { key, monster: m.mdef.id, hp: m.hp, full: m.hp === m.maxHp });
    }
    f._gpApexHunt = { version: 1, lost: false, openingCompanions, present: side.map(x => x.key), prey: [...prey.values()],
      actors: side.map(x => { const id = huntPerson(game, x); return { key: x.key, id,
        // A distant human companion's legacy30HP proxy is not their body's
        // full capacity. Field fights use the same100HP human floor.
        maxHp: x.kind === 'player' ? x.maxHp : Math.max(100, x.maxHp || 0, game.state.village.health?.[id] || 0),
        pack: !!(id && holderMagicIds(id).includes('pack_hunt')), usedPack: [] }; }) };
    observeApexHunt(game, f);
  }

  function observeApexHunt(game, f, damagedKey) {
    const h = f && f._gpApexHunt;
    if (!h || h.version !== 1) return;
    // Door re-entry restores wounds after startCombat returns. Check each
    // prey again before its first actual hit; an opening template must not
    // turn that already wounded animal into a fresh hunt. Later own damage
    // is expected and must not revoke an otherwise qualifying encounter.
    for (const p of h.prey) {
      const body = (f.fighters || []).filter(x => x.kind === 'monster' && game.tbSnakeLineageKey(x) === p.key);
      if (!p.hit && body.some(x => x.hp !== x.maxHp)) p.full = false;
      if (body.some(x => x.key === damagedKey)) p.hit = true;
    }
    const side = (f.fighters || []).filter(huntSide);
    for (const x of side) {
      if (!h.present.includes(x.key)) {
        h.present.push(x.key);
        const id = huntPerson(game, x), opening = h.openingCompanions?.[id];
        if (id && opening) h.actors.push({ key: x.key, id,
          maxHp: Math.max(opening.maxHp, x.maxHp || 0), pack: opening.pack, usedPack: [] });
      }
      if (!x.alive || x.fled || !(x.hp > 0) || x._echoed) h.lost = true;
    }
    for (const key of h.present) if (!side.some(x => x.key === key)) h.lost = true;
    for (const a of h.actors) {
      const x = side.find(x => x.key === a.key);
      if (!x || huntPerson(game, x) !== a.id) h.lost = true;
    }
  }

  function wardPerson(game, fighter) {
    if (!fighter || !['player', 'villager', 'ally'].includes(fighter.kind)) return null;
    const id = fighter.kind === 'player' ? game.villagerId : fighter.villagerId;
    const person = id && game.vpOf(id);
    return person && person.id === id && !person.dead ? id : null;
  }

  function markApexPack(f, actor, monster) {
    observeApexHunt(Game, f);
    const h = f?._gpApexHunt, a = h?.actors.find(x => x.key === actor?.key);
    if (a?.pack && monster) a.usedPack.push(Game.tbSnakeLineageKey(monster));
  }
  function finishApexHunt(game, f, result) {
    observeApexHunt(game, f);
    const h = f && f._gpApexHunt;
    if (!h || h.lost || !['won', 'routed'].includes(result)) return;
    for (const p of h.prey) {
      const body = (f.fighters || []).filter(x => x.kind === 'monster' && game.tbSnakeLineageKey(x) === p.key);
      if (body.length && body.every(x => !x.alive && !x.fled && x.hp <= 0)) {
        for (const a of h.actors) {
          const pack = a.pack && a.usedPack.includes(p.key);
          if (pack || h.present.length === 1) recordApexHunt(a.id, a.maxHp, p, 'tactical', pack ? 'pack' : 'solo');
        }
      }
    }
  }
  function finishFieldApexHunt(game, vid, opening, result, support) {
    if (!opening || result.outcome !== 'vKill' || !(result.vHpLeft > 0) || opening.lost || !support.intact) return;
    const pack = opening.pack && support.packUsed;
    const alone = !opening.allies && !result.calledHelp && !result.allyVid && !(result.allyDealt > 0);
    if (pack || alone) recordApexHunt(vid, opening.actorMaxHp, opening.prey, 'field', pack ? 'pack' : 'solo');
  }

  function recordWardRescue(actor, ally, via, scene, wound, day) {
    const s = Game.state.scholar, v = Game.state.village;
    const a = actor && Game.vpOf(actor), b = ally && Game.vpOf(ally);
    if (Game.over || !a || !b || a.dead || b.dead || a.id !== actor || b.id !== ally ||
        actor === ally || !(wound > 0)) return;
    const books = v.godpathDeeds || (v.godpathDeeds = {}), book = books[actor] || (books[actor] = {});
    if (book.ward_rescue) return;
    book.ward_rescue = { day, ally, ability: via, scene, wound };
    const last = (Game.state.telemetry || []).at(-1), t = Number.isFinite(last?.t) ? last.t : 0;
    try { Game.tele('godpath_deed', { t, who: actor, event: 'ward_rescue', day: s.day || 0, ally, scene, via }); }
    catch (e) { warn('ward deed', e); }
  }
  // Observe the real damage caller, then wait for both people to leave alive.
  // A link tap, an absorbed blow or an anonymous summon is not this outcome.
  function noteWardCarry(game, f, actor, ally, wound, sourceKey, via) {
    const source = f?.fighters?.find(x => x.key === sourceKey);
    const actorId = wardPerson(game, actor), allyId = wardPerson(game, ally);
    if (!f || !actorId || !allyId || actorId === allyId || !Number.isFinite(wound) || wound <= 0 ||
        !source || !['monster', 'hostile'].includes(source.kind)) return;
    const h = f._gpWardRescues || (f._gpWardRescues = { version: 1, entries: [] });
    if (h.version !== 1 || !Array.isArray(h.entries) || h.entries.some(x => x.actorId === actorId && x.allyId === allyId)) return;
    h.entries.push({ actorId, allyId, actorKey: actor.key, allyKey: ally.key, wound, via, day: game.state.scholar.day || 0 });
    // A retaliation may have ended the fight inside the redirected hit.
    if (f.over) finishWardRescues(game, f, f.result);
  }
  function finishWardRescues(game, f, result) {
    const h = f?._gpWardRescues;
    if (!h || h.version !== 1 || !Array.isArray(h.entries) || !['won', 'routed', 'fled', 'calmed'].includes(result) ||
        (result === 'fled' && f.noFlee)) return;
    for (const r of h.entries) {
      const a = f.fighters.find(x => x.key === r.actorKey), b = f.fighters.find(x => x.key === r.allyKey);
      if (a?.alive && a.hp > 0 && b?.alive && b.hp > 0 &&
          wardPerson(game, a) === r.actorId && wardPerson(game, b) === r.allyId)
        recordWardRescue(r.actorId, r.allyId, r.via, 'tactical', r.wound, r.day);
    }
  }
  function finishFieldWardRescue(game, actor, carries, result, ally) {
    if (!(result.vHpLeft > 0) || !['vKill', 'vFlee', 'mFlee'].includes(result.outcome) ||
        !ally.alive || !ally.id || ally.id === game.villagerId || actor === game.villagerId || actor === 'player') return;
    for (const r of carries || []) if (r.ally === ally.id)
      recordWardRescue(actor, r.ally, r.via, 'field', r.wound, r.day);
  }

  function recordOutmatchedEscape(game, actor, capacity, prey, via, scene) {
    const s = game.state.scholar, v = game.state.village, person = actor && game.vpOf(actor);
    if (game.over || !person || person.id !== actor || person.dead || !prey?.full ||
        !game.data.monsters.some(m => m.id === prey.monster) ||
        !Number.isFinite(capacity) || !(capacity > 0) || !Number.isFinite(prey.hp) || !(prey.hp > capacity)) return;
    const books = v.godpathDeeds || (v.godpathDeeds = {}), book = books[actor] || (books[actor] = {});
    if (book.outmatched_escape) return;
    book.outmatched_escape = { day: s.day, monster: prey.monster, actorMaxHp: capacity, openingHp: prey.hp, via, scene };
    const last = (game.state.telemetry || []).at(-1), t = Number.isFinite(last?.t) ? last.t : 0;
    try { game.tele('godpath_deed', { t, who: actor, event: 'outmatched_escape', day: s.day, monster: prey.monster, via, scene }); }
    catch (e) { warn('escape deed', e); }
  }

  function finishTacticalEscape(game, f, fighter) {
    if (!f || f.noFlee || game.state.arenaContest) return;
    const h = f._gpApexHunt;
    // An old save without opening evidence cannot invent this history.
    if (!h || h.version !== 1) return;
    observeApexHunt(game, f);
    for (const a of h.actors) {
      const body = f.fighters.find(x => x.key === a.key);
      if (!body || (fighter && body !== fighter) || !body.fled || !body.alive || !(body.hp > 0) ||
          body._echoed || wardPerson(game, body) !== a.id) continue;
      for (const prey of h.prey) {
        // A defeated enemy is not an escape; pursuers that broke off may live.
        if (!f.fighters.some(m => m.kind === 'monster' && game.tbSnakeLineageKey(m) === prey.key && m.alive && m.hp > 0)) continue;
        recordOutmatchedEscape(game, a.id, a.maxHp, prey, 'withdrawal', 'tactical');
      }
    }
  }

  function finishFieldEscape(game, vid, opening, result, sealed) {
    if (!opening || sealed || result.judges || !(result.vHpLeft > 0) || !(result.mHpLeft > 0) ||
        !['evade', 'vFlee'].includes(result.outcome)) return;
    recordOutmatchedEscape(game, vid, opening.actorMaxHp, opening.prey, result.outcome, 'field');
  }

  function careLiving(game, id) {
    const person = id && game.vpOf(id);
    if (!person || person.id !== id || person.dead) return false;
    const body = game.tbfight?.fighters?.find(f => wardPerson(game, f) === id);
    if (body && (!body.alive || body.fled || !(body.hp > 0))) return false;
    return id === game.villagerId ? game.state.scholar.health > 0
      : ((game.state.village.health || {})[id] ?? 100) > 0;
  }
  // Only successful real callers enqueue care. Status reads cannot settle it.
  function noteCareRescue(game, actor, patient, before, after, maxHp, via, scene) {
    const s = game.state.scholar, v = game.state.village;
    const fraction = data()?.paths?.caregiver?.god?.deed?.criticalFraction;
    if (game.over || actor === patient || !careLiving(game, actor) || !careLiving(game, patient) ||
        !Number.isFinite(after) || !(after > 0) || !Number.isFinite(maxHp) || !(maxHp > 0)) return;
    if (via !== 'lifeline' && !(Number.isFinite(before) && before > 0 && before <= maxHp * fraction && after > maxHp * fraction && after > before)) return;
    if (scene === 'camp' || scene === 'haven') {
      const present = game.campPeopleIds ? game.campPeopleIds(scene === 'haven' ? 'haven' : 'here') : [];
      if (!present.includes(actor) || !present.includes(patient)) return;
    }
    if (v.godpathDeeds?.[actor]?.care_survived) return;
    const watches = v.godpathCareWatch || (v.godpathCareWatch = {}), pending = watches[actor] || (watches[actor] = []);
    if (!pending.some(r => r.patient === patient && r.day === s.day))
      pending.push({ patient, day: s.day, before, after, maxHp, via, scene });
  }
  function finishCareWatch(game) {
    const s = game.state.scholar, v = game.state.village, watches = v.godpathCareWatch;
    if (!watches) return false;
    let changed = false;
    for (const [actor, pending] of Object.entries(watches)) {
      const future = [];
      for (const r of pending) {
        if (!(s.day > r.day)) { future.push(r); continue; }
        changed = true;
        if (!careLiving(game, actor) || !careLiving(game, r.patient) || v.godpathDeeds?.[actor]?.care_survived) continue;
        const books = v.godpathDeeds || (v.godpathDeeds = {}), book = books[actor] || (books[actor] = {});
        book.care_survived = { ...r, fulfilledDay: s.day };
        const last = (game.state.telemetry || []).at(-1), t = Number.isFinite(last?.t) ? last.t : 0;
        try { game.tele('godpath_deed', { t, who: actor, event: 'care_survived', day: s.day, patient: r.patient, via: r.via, scene: r.scene }); }
        catch (e) { warn('care deed', e); }
      }
      if (future.length && !v.godpathDeeds?.[actor]?.care_survived) watches[actor] = future;
      else delete watches[actor];
    }
    return changed;
  }
  // Private outcome writer: only actual personal refusal callers reach it.
  // Borrowed Phoenix/Lifeline rescues do not spend this person's magic.
  function recordDeathRefusal(who, ability, scene) {
    const s = Game.state.scholar, v = Game.state.village;
    const vid = isPlayer(who) ? Game.villagerId : who, person = vid && Game.vpOf(vid);
    if (!s || !v || Game.over || !person || person.id !== vid || person.dead ||
        (isPlayer(who) && !(s.health > 0))) return;
    const books = v.godpathDeeds || (v.godpathDeeds = {}), book = books[vid] || (books[vid] = {});
    if (book.death_refused) return;
    book.death_refused = { day: s.day || 0, ability, scene };
    const last = (Game.state.telemetry || []).at(-1), t = Number.isFinite(last?.t) ? last.t : 0;
    try { Game.tele('godpath_deed', { t, who: vid, event: 'death_refused', ability, scene, day: s.day || 0 }); }
    catch (e) { warn('survival deed', e); }
  }
  // A deed belongs to a person, not to the bearer office. Reading a missing
  // old-save ledger never creates one or invents accomplishments.
  function godpathDeedStatus(who, godId, day) {
    const D = data() || {}, s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    const path = Object.values(D.paths || {}).find(p => p.god && p.god.id === godId);
    const deed = path && path.god.deed;
    if (!deed) return null;
    const vid = isPlayer(who) ? Game.villagerId : who;
    // Office service is a current responsibility, not an invented history:
    // the same live holder record governs both player and NPC. Removing or
    // transferring it revokes the deed until this person holds it again.
    const office = deed.event === 'relay_office' && Game.state.switchboard;
    const rec = deed.event === 'relay_office'
      ? (office && office.holderId === vid ? { day: office.appointedDay ?? null } : null)
      : (((v.godpathDeeds || {})[vid] || {})[deed.event]) || null;
    const person = vid && Game.vpOf ? Game.vpOf(vid) : null;
    const living = !!(vid && person && person.id === vid && !person.dead &&
      (isPlayer(who) ? s.health > 0 : ((v.health || {})[vid] == null || v.health[vid] > 0)));
    const now = day == null ? s.day || 0 : day;
    return { complete: !!(rec && living && (!deed.afterDawn || now > rec.day)),
      observed: !!rec, pending: deed.event === 'care_survived' ? !!(v.godpathCareWatch || {})[vid]?.length
        : deed.event === 'field_truth_shared' && !!Object.keys(v.godpathFieldDiscoveries?.[vid] || {}).length,
      day: rec ? rec.day : null, hint: deed.hint };
  }
  function godpathDeedHint(who) {
    const cl = godpathClass(who);
    if (!cl || cl.lapsed) return null;
    const p = ((data() || {}).paths || {})[cl.path], god = p && p.god;
    if (!god || !god.deed) return null;
    const v = (Game.state || {}).village || {}, s = (Game.state || {}).scholar || {};
    const g = isPlayer(who) ? s.godhood : (v.npcGodhood || {})[who];
    if (g && ((g.active || []).includes(god.id) || (g.recognized || {})[god.id])) return null;
    const status = godpathDeedStatus(who, god.id);
    return status.complete ? 'Deed fulfilled. Your build and the day still matter.'
      : (status.observed || status.pending) ? (god.deed.pendingHint || god.deed.hint) : god.deed.hint;
  }
  function lineFor(rec) {
    const D = data() || {};
    const p = (D.paths || {})[rec.path] || {};
    const sub = ((p.subclasses || {})[rec.subclass] || {}).name || p.name || rec.path;
    const g = String(godName(rec.path)).replace(/^The /, 'the ');
    return `${sub} of ${g}`;
  }
  function classLine(who) {
    const rec = godpathClass(who);
    return (rec && !rec.lapsed) ? lineFor(rec) : null;
  }

  // recognizeClass(who): THE one function for player and villagers.
  function recognizeClass(who) {
    try {
      if (!Game.state || !Game.state.scholar || !data()) return null;
      const st = store(who);
      const cur = st.godpath && st.godpath.path ? st.godpath : null;
      const c = classify(holderMagicIds(who));
      if (!c) {
        if (cur && !cur.lapsed) { cur.lapsed = (Game.state.scholar.day || 0); st.godpath = cur; }
        return null;
      }
      if (cur && !cur.lapsed && cur.path === c.path && cur.subclass === c.subclass) return cur;
      const D = data();
      const rec = { path: c.path, subclass: c.subclass, since: Game.state.scholar.day || 0, god: (((D.paths || {})[c.path] || {}).god || {}).id || null };
      st.godpath = rec;
      const line = lineFor(rec);
      if (isPlayer(who)) {
        Game.sysSay && Game.sysSay(cur && !cur.lapsed
          ? `◈ THE SYSTEM revises its notes. "Your build moved. We have a new word for you: ${line.toUpperCase()}."`
          : `◈ THE SYSTEM has a word for what you are becoming. "${line.toUpperCase()}. Not a god. Not yet. But we can see which one you'd be."`);
      } else {
        let nm = 'Someone';
        try { nm = Game.displayName ? Game.displayName(who) : nm; } catch (e) { warn('displayName', e); }
        Game.say && Game.say(`◈ The System names ${nm}: ${line}. The village repeats it at the fire.`);
      }
      try { Game.tele && Game.tele('class_recognized', { who: isPlayer(who) ? 'player' : who, path: rec.path, subclass: rec.subclass, day: rec.since }); } catch (e) { warn('tele class', e); }
      return rec;
    } catch (e) { warn('recognizeClass', e); return null; }
  }

  // pathLean(who, abilityId, opts): how much this ability pulls the holder's
  // build toward a god. opts.knows(id) -> boolean: an ability the holder does
  // not know scores 0 and is never named (Steve 2026-10-14: villagers "seek
  // knowledge about the abilities"). opts.held overrides the held list.
  function pathLean(who, abilityId, opts) {
    opts = opts || {};
    try {
      if (typeof opts.knows === 'function' && !opts.knows(abilityId)) return 0;
      const d = defOf(abilityId);
      if (!d || d.lane !== 'magic' || !d.path) return 0;
      const held = opts.held || holderMagicIds(who);
      if (held.indexOf(abilityId) >= 0) return 0;
      const rec = godpathClass(who) || classify(held);
      let sc = 0;
      let same = 0, sameSub = 0;
      for (const h of held) {
        const hd = defOf(h);
        if (!hd || hd.lane !== 'magic') continue;
        if (hd.path === d.path) { same++; if (hd.subclass === d.subclass) sameSub++; }
        else if (d.alsoPath && hd.path === d.alsoPath) same += 0.5;
      }
      sc += Math.min(3, same) + Math.min(2, sameSub) * 0.5;
      if (rec && !rec.lapsed && rec.path === d.path) {
        sc += 3;
        if (rec.subclass === d.subclass) {
          sc += 1;
          const sub = (((data() || {}).paths || {})[d.path] || {}).subclasses || {};
          if ((sub[d.subclass] || {}).payoff === d.id) sc += 2; // the payoff completes the class
        }
      }
      return sc;
    } catch (e) { warn('pathLean', e); return 0; }
  }

  function offerRules() { return (((data() || {}).rules || {}).offers) || {}; }

  // holderJobPaths(who): the god paths the holder's old job plausibly grows
  // into (characterGen occupations[].pathLean). Steve 2026-10-14: "Gods are
  // rough representatives of what starts out as jobs and classes, or
  // playstyles." The player is the bearer's own person.
  function holderJobPaths(who) {
    try {
      const pid = isPlayer(who) ? Game.villagerId : who;
      const p = (pid && Game.getPerson) ? Game.getPerson(pid) : null;
      const occId = p && p.occupationId;
      if (!occId) return [];
      const occ = ((((Game.data || {}).characterGen || {}).occupations) || []).find(o => o.id === occId);
      const paths = (data() || {}).paths || {};
      return ((occ && occ.pathLean) || []).filter(x => paths[x]);
    } catch (e) { warn('holderJobPaths', e); return []; }
  }

  // sheetRng(who, track, level): a PRIVATE deterministic stream per holder,
  // track and level (FNV-1a hash -> mulberry32). Never touches Math.random:
  // modules and sims share that stream (the parity worker learned it).
  function sheetRng(who, track, level) {
    const holder = isPlayer(who) ? (Game.villagerId || 'player') : who;
    const key = String(holder) + '|' + String(track) + '|' + String(level == null ? 0 : level);
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    let a = h || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // kitSheet(cands, who, track, level): THE level-up sheet for the player and
  // every villager (tracks.js levelUpOffers, villager-build.js
  // villagerLevelUpOffers). cands = the track's unheld magic kit entries in
  // power order (defs). Draws offerSize offers from the next `window` entries
  // (rules.offers.window, 6), weighted toward earlier ones (windowDecay per
  // step), deterministic per holder/track/level, shown in kit order; then
  // shapeOffers leans it (recognised class, else job path, distinct roles).
  function kitSheet(cands, who, track, level) {
    try {
      cands = cands || [];
      const O = offerRules();
      const n = (((Game.trackData && Game.trackData()) || {}).offerSize) || 3;
      const W = Math.max(n, O.window || n);
      const decay = O.windowDecay != null ? O.windowDecay : 0.7;
      const win = cands.slice(0, W);
      let picked;
      if (win.length <= n) picked = win.slice();
      else {
        const rng = sheetRng(who, track, level);
        const idx = win.map((_, i) => i);
        const chosen = [];
        while (chosen.length < n) {
          let tot = 0;
          for (const i of idx) tot += Math.pow(decay, i);
          let r = rng() * tot, k = 0;
          for (; k < idx.length - 1; k++) { r -= Math.pow(decay, idx[k]); if (r < 0) break; }
          chosen.push(idx.splice(k, 1)[0]);
        }
        chosen.sort((a, b) => a - b);
        picked = chosen.map(i => win[i]);
      }
      const unpicked = win.filter(d => picked.indexOf(d) < 0);
      const rest = unpicked.concat(cands.slice(W));
      return shapeOffers(picked, rest, who, { jobWindow: unpicked.length });
    } catch (e) { warn('kitSheet', e); return (cands || []).slice(0, 3); }
  }

  // shapeOffers(choices, pool, who, opts): choices are ability defs (or {id}) in
  // the offer's own order; pool is the remaining candidates (defs), in
  // preference order. Guarantees >=1 offer on the recognised path when the
  // pool has one; before a class is recognised, >=1 offer on the holder's
  // JOB path when the first opts.jobWindow pool entries hold one (all of the
  // pool when unset); then swaps duplicate roles for distinct ones where it can.
  function shapeOffers(choices, pool, who, opts) {
    opts = opts || {};
    try {
      const out = choices.slice();
      const rest = (pool || []).filter(p => !out.some(o => o.id === p.id));
      const named = godpathClass(who || 'player');
      // The lean follows the recognised class; before recognition it
      // follows an EMERGING lean (2+ magic abilities of one path, strictly
      // leading) so a class can actually form.
      let rec = godpathClass(who || 'player');
      if (!rec || rec.lapsed) rec = emergingPath(holderMagicIds(who || 'player'));
      const pathOf = (o) => (defOf(o.id) || {}).path;
      const roleOf = (o) => (defOf(o.id) || {}).role;
      // A recognised subclass whose payoff is still missing: the payoff is
      // the on-path offer (it completes the class); otherwise the first
      // on-path entry in kit order.
      let payoff = null;
      try { if (rec && rec.subclass) payoff = ((((data() || {}).paths || {})[rec.path] || {}).subclasses || {})[rec.subclass].payoff; } catch (e) { payoff = null; }
      if (rec && !rec.lapsed && out.length && payoff && !out.some(o => o.id === payoff)) {
        const pi = rest.findIndex(p => p.id === payoff);
        if (pi >= 0) {
          const slot = out.findIndex(o => pathOf(o) !== rec.path);
          if (slot >= 0) { out[slot] = rest.splice(pi, 1)[0]; out._leaned = true; }
        } else if (rec.subclass && (((data() || {}).rules || {}).offers || {}).payoffAnyTrack && holderMagicIds(who || 'player').indexOf(payoff) < 0) {
          // THE PAYOFF FROM ANY TRACK (godpath-buff 2026-10-14): a named
          // class's payoff often sits in another track's kit (the Stalker's
          // Trophy Room is a combat ability; stalkers level field). Once the
          // System has named the class, any level-up sheet may carry it —
          // the class, not the track, is what the System is completing.
          // Data: godpaths.json rules.offers.payoffAnyTrack.
          const slot = out.findIndex(o => pathOf(o) !== rec.path);
          const pd = defOf(payoff);
          if (slot >= 0 && pd && pd.lane === 'magic') {
            out[slot] = pd; out._leaned = true;
          }
        }
      }
      if (rec && !rec.lapsed && out.length && !out.some(o => pathOf(o) === rec.path)) {
        const i = rest.findIndex(p => pathOf(p) === rec.path);
        if (i >= 0) { out[out.length - 1] = rest.splice(i, 1)[0]; out._leaned = true; }
      }
      // JOB -> PATH LEAN (class-diversity 2026-10-14): no class named yet, so
      // the holder's old job speaks. At least one offer on a job path when
      // the window has one; it replaces the deepest slot that isn't the
      // emerging-path pick. After recognition the class lean above rules.
      let jobPick = null;
      if ((!named || named.lapsed) && out.length && offerRules().jobLean !== false) {
        const jp = holderJobPaths(who || 'player');
        const have = out.find(o => jp.indexOf(pathOf(o)) >= 0);
        if (have) jobPick = have;
        else if (jp.length) {
          const lim = opts.jobWindow != null ? opts.jobWindow : rest.length;
          const near = rest.slice(0, lim);
          let i = -1;
          for (const p of jp) { i = near.findIndex(x => pathOf(x) === p); if (i >= 0) break; }
          if (i >= 0) {
            let slot = -1;
            for (let k = out.length - 1; k >= 0; k--) {
              if (rec && pathOf(out[k]) === rec.path && out.filter(o => pathOf(o) === rec.path).length === 1) continue;
              slot = k; break;
            }
            if (slot >= 0) { jobPick = out[slot] = rest.splice(i, 1)[0]; out._jobLeaned = true; }
          }
        }
      }
      // distinct roles: replace a duplicate (never the on-path pick) with the
      // first candidate whose role is new to the sheet.
      for (let k = out.length - 1; k >= 0; k--) {
        const r = roleOf(out[k]);
        const dup = out.some((o, j) => j !== k && roleOf(o) === r);
        if (!dup) continue;
        if (rec && pathOf(out[k]) === rec.path && out.filter(o => pathOf(o) === rec.path).length === 1) continue;
        if (jobPick && out[k] === jobPick) continue;
        const roles = new Set(out.map(roleOf));
        // only a near look-ahead (the next few in kit order): role variety
        // must not pull the kit's strongest entries forward
        const near = rest.slice(0, out.length);
        const j = near.findIndex(p => !roles.has(roleOf(p)) && (!rec || pathOf(p) === rec.path || pathOf(out[k]) !== rec.path));
        const i = j >= 0 ? rest.indexOf(near[j]) : -1;
        if (i >= 0) out[k] = rest.splice(i, 1)[0];
      }
      return out;
    } catch (e) { warn('shapeOffers', e); return choices; }
  }

  // ===================== ENGINE VERBS (data `do`) =====================
  function fightUses(f) { f._gpUses = f._gpUses || {}; return f._gpUses; }
  function liveMons(f) { return (f.fighters || []).filter(m => (m.kind === 'monster' || m.kind === 'hostile') && m.alive && !m.fled); }
  function liveAllies(f) { return (f.fighters || []).filter(x => (x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled); }
  function nm(m) { try { return Game.encSubject ? Game.encSubject(m) : (m.name || 'it'); } catch (e) { return m.name || 'it'; } }
  function lvl(id) { try { return Game.abilityLevel ? (Game.abilityLevel(id) || 1) : 1; } catch (e) { return 1; } }
  function nearest(f, p, pred) {
    let best = null, bd = 1e9;
    for (const m of liveMons(f)) { if (pred && !pred(m)) continue; const d = cheb(m, p); if (d < bd) { bd = d; best = m; } }
    return best;
  }
  function pickMonster(f, p, target, range) {
    let m = target ? Game.tbFighter(target) : null;
    if (m && (m.kind === 'monster' || m.kind === 'hostile') && m.alive && !m.fled && (!range || cheb(m, p) <= range)) return m;
    return nearest(f, p, range ? (x => cheb(x, p) <= range) : null);
  }
  function isTitanish(m) { const md = m.mdef || {}; return !!(md.titan || md.isTitan || m.titan || (Game.fighterSize && Game.fighterSize(m) >= 3)); }
  function refresh() { try { Game.tbRefreshTelegraphUI && Game.tbRefreshTelegraphUI(); } catch (e) { warn('refresh', e); } }

  function wardenWallAt(x, y) {
    const f = Game.tbfight;
    return !!(f && f.terraform && f.terraform[x + ',' + y] === 'warden_wall');
  }
  function clearWardenWall(f) {
    if (!f || !f._wardenWall) return;
    for (const k of f._wardenWall.cells) if (f.terraform && f.terraform[k] === 'warden_wall') delete f.terraform[k];
    f._wardenWall = null;
    Game.say('The raised earth slumps back into the ground. (Raise Earth: the wall is gone.)');
    refresh();
  }

  // ACTOR (parity 2026-10-14, Steve: "when in doubt we treat them the same
  // way"): every verb runs for whoever casts it — the player or a villager
  // fighter. C = actorCtx(actor): p (the caster's fighter), isP, vid, hold
  // (where per-fight buffs live: the scholar for the player, the fighter for
  // a villager), name. One engine path; only the narration differs.
  function actorCtx(actor) {
    const isP = !actor || actor.key === 'p' || actor.kind === 'player';
    const p = isP ? Game.tbFighter('p') : actor;
    return { p, isP, vid: isP ? null : (actor.villagerId || actor.key), hold: isP ? Game.state.scholar : actor, name: isP ? 'You' : (actor.name || 'Someone') };
  }
  function lvlC(C, id) { return C.isP ? lvl(id) : 1; }
  function hasC(C, id) {
    try { return C.isP ? !!(Game.hasAbility && Game.hasAbility(id)) : !!(Game.npcHasAbility && Game.npcHasAbility(C.vid, id)); }
    catch (e) { warn('hasC', e); return false; }
  }
  function alliesOf(f, C) { return Game.tbOtherAllies(C.p); }
  function say(C, pl, vl) { Game.say(C.isP ? pl : vl); }
  function syncPos(C) {
    try {
      if (C.isP) { Game.state.scholar.mx = C.p.mx; Game.state.scholar.my = C.p.my; }
      else if (C.p.kind === 'villager' && Game.tbVillagerSyncPos) Game.tbVillagerSyncPos(C.p);
    } catch (e) { warn('sync pos', e); }
  }

  const VERBS = {
    aegis(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      let t = target ? Game.tbFighter(target) : null;
      const allies = Game.tbOtherAllies(C.p);
      if (!t || allies.indexOf(t) < 0) t = allies.slice().sort((x, y) => (x.hp / (x.maxHp || 1)) - (y.hp / (y.maxHp || 1)))[0];
      if (!t) { if (C.isP) Game.say('No ally to link to. (Aegis Link needs someone beside you in the fight.)'); return false; }
      const rounds = (a.rounds || 3) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      p._aegis = { key: t.key, until: (f.round || 1) + rounds };
      say(C, `A thread of light runs from your chest to ${t.name}'s. For ${rounds} rounds, what is meant for them comes to you. (Aegis Link)`,
        `A thread of light runs from ${C.name} to ${t.name}. For ${rounds} rounds, what is meant for ${t.name} lands on ${C.name}. (Aegis Link)`);
      return true;
    },
    wall(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const m = nearest(f, p);
      if (!m) { if (C.isP) Game.say('Nothing to wall off.'); return false; }
      let dx = Math.sign(m.mx - p.mx), dy = Math.sign(m.my - p.my);
      if (!dx && !dy) dx = 1;
      const px = -dy, py = dx; // perpendicular
      const len = lvlC(C, ab.id) >= 2 ? 5 : (a.len || 3);
      const half = Math.floor(len / 2);
      const cx = p.mx + dx, cy = p.my + dy;
      const cells = [];
      const gmax = Game.tbGridMax ? Game.tbGridMax() : 8;
      for (let k = -half; k <= half; k++) {
        const x = cx + k * px, y = cy + k * py;
        if (x < 0 || y < 0 || x > gmax || y > gmax) continue;
        if (Game.tbBlocked(x, y)) continue; // never on a fighter or rock
        f.terraform = f.terraform || {};
        if (f.terraform[x + ',' + y]) continue;
        f.terraform[x + ',' + y] = 'warden_wall';
        cells.push(x + ',' + y);
      }
      if (!cells.length) { if (C.isP) Game.say('There\'s no open ground to raise. (Raise Earth: every tile that way is taken.)'); return false; }
      if (f._wardenWall) clearWardenWall(f);
      f._wardenWall = { cells, expires: (f.round || 1) + (a.rounds || 3) };
      say(C, `You slam your palm down and the earth STANDS UP: a wall of ${cells.length} tile${cells.length > 1 ? 's' : ''} between you and ${nm(m)}. Nothing walks through it for ${a.rounds || 3} rounds. (Raise Earth)`,
        `${C.name} slams a palm down and the earth STANDS UP: a wall of ${cells.length} tile${cells.length > 1 ? 's' : ''} between them and ${nm(m)}. (Raise Earth)`);
      refresh();
      return true;
    },
    pull(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const radius = (a.radius || 4) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      const mons = liveMons(f).filter(m => cheb(m, p) <= radius && cheb(m, p) > 1).sort((x, y) => cheb(x, p) - cheb(y, p));
      if (!mons.length) { if (C.isP) Game.say('Nothing in reach to pull. (Gravity Well: radius ' + radius + '.)'); return false; }
      let moved = 0, arrived = 0;
      for (const m of mons) {
        let steps = 0;
        for (let i = 0; i < (a.tiles || 2); i++) {
          if (cheb(m, p) <= 1) break;
          const nx = m.mx + Math.sign(p.mx - m.mx), ny = m.my + Math.sign(p.my - m.my);
          if (!Game.tbCanOccupy(m, nx, ny)) break;
          m.mx = nx; m.my = ny; steps++;
        }
        if (steps) moved++;
        if (cheb(m, p) <= 1) { m.hesitate = Math.max(m.hesitate || 0, 1); if (lvlC(C, ab.id) >= 3) m._frozen = Math.max(m._frozen || 0, 1); arrived++; }
      }
      say(C, `You become the low point of the world. ${moved} monster${moved === 1 ? '' : 's'} slide toward you${arrived ? `; ${arrived} land${arrived === 1 ? 's' : ''} at your feet, staggered` : ''}. (Gravity Well)`,
        `${C.name} becomes the low point of the world: ${moved} monster${moved === 1 ? '' : 's'} slide toward them${arrived ? `, ${arrived} staggered at their feet` : ''}. (Gravity Well)`);
      refresh();
      return moved > 0 || arrived > 0;
    },
    push(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const radius = (a.radius || 2) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      const mons = liveMons(f).filter(m => cheb(m, p) <= radius).sort((x, y) => cheb(x, p) - cheb(y, p));
      if (!mons.length) { if (C.isP) Game.say('Nothing close enough to throw. (Landslide: radius ' + radius + '.)'); return false; }
      const slam = lvlC(C, ab.id) >= 3 ? [22, 30] : (a.slam || [14, 22]);
      let slams = 0;
      for (const m of mons) {
        let dx = Math.sign(m.mx - p.mx), dy = Math.sign(m.my - p.my);
        if (!dx && !dy) dx = 1;
        let hit = false;
        for (let i = 0; i < (a.tiles || 2); i++) {
          const nx = m.mx + dx, ny = m.my + dy;
          if (!Game.tbCanOccupy(m, nx, ny)) { hit = true; break; }
          m.mx = nx; m.my = ny;
        }
        if (hit && m.alive) {
          const dmg = rint(slam[0], slam[1]);
          Game.say(`${nm(m)} SLAMS into something that doesn't move. (${dmg}, stunned.)`);
          Game.tbDamage(m.key, dmg, 'landslide', p.key, { quiet: true });
          m.stunned = Math.max(m.stunned || 0, 1);
          slams++;
          if (Game.tbEndCheck && Game.tbEndCheck()) return true;
        }
      }
      say(C, `The ground heaves outward from you. ${mons.length} thrown${slams ? `, ${slams} slammed` : ''}. (Landslide)`,
        `The ground heaves outward from ${C.name}. ${mons.length} thrown${slams ? `, ${slams} slammed` : ''}. (Landslide)`);
      refresh();
      return true;
    },
    pack(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const m = pickMonster(f, p, target);
      if (!m) { if (C.isP) Game.say('No prey for the pack.'); return false; }
      const pin = (a.pin || 2) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      const birds = (m._birdStrike || 0) > 0;
      const rounds = birds ? (a.rounds || 3) * 2 : (a.rounds || 3);
      m._frozen = Math.max(m._frozen || 0, pin);
      m._birdStrike = (m._birdStrike || 0) + rounds;
      if (ab.id === 'pack_hunt') markApexPack(f, p, m);
      say(C, `You whistle once. They were listening: wings, teeth, claws, all on ${nm(m)}. It's pinned for ${pin} rounds and harried for ${rounds}${birds ? ' (the birds were already on it: twice as long)' : ''}. (Pack Hunt)`,
        `${C.name} whistles once. Wings, teeth, claws, all on ${nm(m)}: pinned ${pin} rounds, harried ${rounds}. (Pack Hunt)`);
      return true;
    },
    heal(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const reach = lvlC(C, ab.id) >= 3 ? 2 : 1;
      const amt = lvlC(C, ab.id) >= 2 ? [16, 24] : (a.amount || [12, 18]);
      let base = rint(amt[0], amt[1]);
      try { if (C.isP) base = Math.round(Game.modTarget('healing.amount', base, {})); } catch (e) { warn('heal mod', e); }
      let t = target ? Game.tbFighter(target) : null;
      const cands = Game.tbOtherAllies(C.p).filter(x => cheb(x, p) <= reach && x.hp < x.maxHp);
      if (!t || (t !== p && cands.indexOf(t) < 0)) {
        const pFrac = p.hp / (p.maxHp || 100);
        const worst = cands.slice().sort((x, y) => (x.hp / x.maxHp) - (y.hp / y.maxHp))[0];
        t = (worst && worst.hp / worst.maxHp < pFrac) ? worst : p;
      }
      if (t === p && C.isP) {
        if (p.hp >= p.maxHp) { Game.say('Nothing to mend. (Mending Hands)'); return false; }
        Game.addHealth(base); // counts as a heal (build-around hooks)
        Game.say(`You press your own wound and the System knits it: +${base} HP. (Mending Hands)`);
        return true;
      }
      if (t.hp >= t.maxHp) return false;
      const before = t.hp;
      t.hp = Math.min(t.maxHp, t.hp + base);
      if (t.kind === 'player') { try { Game.state.scholar.health = Math.max(0, t.hp); } catch (e) { warn('heal sync', e); } }
      const healed = t.hp - before;
      noteCareRescue(Game, wardPerson(Game, p), wardPerson(Game, t), before, t.hp, t.maxHp, 'mending_hands', 'battle');
      if (C.isP) { try { const BA = S.buildarounds; if (BA && BA.onHeal) BA.onHeal(Game, t.key, healed, Math.max(0, base - healed)); } catch (e) { warn('onHeal', e); } }
      const tn = t.kind === 'player' ? 'your' : (t === p ? 'their own' : `${t.name}'s`);
      say(C, `Your hands find ${t.name}'s wound and it closes under them: +${healed} HP. (Mending Hands)`,
        `${C.name}'s hands find ${tn} wound and it closes under them: +${healed} HP. (Mending Hands)`);
      return true;
    },
    blink(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const range = (a.range || 3) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      const mons = liveMons(f);
      let dest = null;
      if (typeof target === 'string' && /^\d+,\d+$/.test(target)) {
        const [x, y] = target.split(',').map(Number);
        if (cheb({ mx: x, my: y }, p) <= range && Game.tbCanOccupy(p, x, y)) dest = { x, y };
      }
      if (!dest) {
        let best = -1;
        const gmax = Game.tbGridMax ? Game.tbGridMax() : 8;
        for (let x = Math.max(0, p.mx - range); x <= Math.min(gmax, p.mx + range); x++) {
          for (let y = Math.max(0, p.my - range); y <= Math.min(gmax, p.my + range); y++) {
            if (x === p.mx && y === p.my) continue;
            if (!Game.tbCanOccupy(p, x, y)) continue;
            const dmin = mons.length ? Math.min(...mons.map(m => cheb(m, { mx: x, my: y }))) : 9;
            if (dmin > best) { best = dmin; dest = { x, y }; }
          }
        }
      }
      if (!dest) { if (C.isP) Game.say('Nowhere to go. (Blink: no open tile in range.)'); return false; }
      const dist = cheb(p, { mx: dest.x, my: dest.y });
      p.mx = dest.x; p.my = dest.y;
      syncPos(C);
      if (C.isP) { try { const BA = S.buildarounds; if (BA && BA.onMove) BA.onMove(Game, dist); } catch (e) { warn('onMove', e); } }
      say(C, `You are somewhere else: ${dist} tile${dist === 1 ? '' : 's'} away, between one heartbeat and the next. (Blink)`,
        `${C.name} is somewhere else: ${dist} tile${dist === 1 ? '' : 's'} away, between one heartbeat and the next. (Blink)`);
      refresh();
      return true;
    },
    swap(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const range = (a.range || 3) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      const m = pickMonster(f, p, target, range);
      if (!m) { if (C.isP) Game.say('Nothing in reach to trade places with. (Switcheroo: ' + range + ' tiles.)'); return false; }
      if ((Game.fighterSize ? Game.fighterSize(m) : 1) > 1) { if (C.isP) Game.say(`${nm(m)} is too big to swap with. (Switcheroo: size-1 only.)`); return false; }
      const px = p.mx, py = p.my;
      p.mx = m.mx; p.my = m.my; m.mx = px; m.my = py;
      syncPos(C);
      const fizzled = !!m.telegraph;
      m.telegraph = null;
      m.hesitate = Math.max(m.hesitate || 0, 1);
      say(C, `Snap: you're where ${nm(m)} was, and it's where you were.${fizzled ? ' Its wind-up was aimed at you. It just hit empty air.' : ''} It hesitates. (Switcheroo)`,
        `Snap: ${C.name} is where ${nm(m)} was, and it's where they were.${fizzled ? ' Its wind-up hits empty air.' : ''} It hesitates. (Switcheroo)`);
      refresh();
      return true;
    },
    foresee(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight;
      const rounds = (a.rounds || 3) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      const until = (f.round || 1) + rounds - 1;
      f._foresightUntil = Math.max(f._foresightUntil || 0, until);
      if (!C.isP) C.p._foresightUntil = until;
      say(C, `The fight goes thin, like a rerun. For ${rounds} rounds you see a breath ahead. (Foresight)`,
        `${C.name}'s eyes go distant. "Left. Now it lunges." For ${rounds} rounds they call every move before it comes. (Foresight)`);
      readIntents(f);
      return true;
    },
    broadcast(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, s = Game.state.scholar;
      const BA = S.buildarounds;
      let mult = 1;
      try { if (C.isP && BA && BA.socialMult) mult = BA.socialMult(Game) || 1; } catch (e) { warn('socialMult', e); }
      const fans = (a.fans || 2) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      if (C.isP) s.fans = Math.min(50, (s.fans || 0) + fans);
      const rounds = Math.min(5, Math.round(((a.rally || 2) + (lvlC(C, ab.id) >= 2 ? 1 : 0)) * mult));
      const allies = alliesOf(f, C);
      for (const v of allies) v.rallyBuff = Math.max(v.rallyBuff || 0, rounds);
      if (lvlC(C, ab.id) >= 3) for (const m of liveMons(f)) m.hesitate = Math.max(m.hesitate || 0, 1);
      if (C.isP) Game.sysSay && Game.sysSay(`📺 "WE'RE LIVE!" +${fans} fans (${s.fans} watching).${allies.length ? ` ${allies.length} all${allies.length === 1 ? 'y hears' : 'ies hear'} your voice: emboldened for ${rounds} rounds.` : ''}${mult > 1 ? ` (Crowd Favorite: x${mult.toFixed(1)})` : ''} (Live Broadcast)`);
      else Game.say(`📺 ${C.name} goes LIVE. ${allies.length} all${allies.length === 1 ? 'y hears' : 'ies hear'} them: emboldened for ${rounds} rounds. (Live Broadcast)`);
      return true;
    },
    command(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight;
      const allies = alliesOf(f, C);
      if (!allies.length) { if (C.isP) Game.say('No one to command. (The Crowd Moves needs allies in the fight.)'); return false; }
      say(C, `You say one word. Everyone hears "NOW." (The Crowd Moves: ${allies.length} extra turn${allies.length === 1 ? '' : 's'}.)`,
        `${C.name} says one word. Everyone hears "NOW." (The Crowd Moves: ${allies.length} extra turn${allies.length === 1 ? '' : 's'}.)`);
      for (const v of allies) {
        if (!v.alive || v.fled) continue;
        if (v.kind === 'player') {
          Game.tbCommandPlayer(C.p, ab.name || 'The Crowd Moves');
          if (lvlC(C, ab.id) >= 2) Game.addHealth(5);
          continue;
        }
        try { v._gpCommanded = true; Game.tbVillagerTurn(v); } catch (e) { warn('command turn', e); } finally { delete v._gpCommanded; }
        if (lvlC(C, ab.id) >= 2 && v.alive) { v.hp = Math.min(v.maxHp, v.hp + 5); Game.tbSyncHumanHealth(v); }
        if (Game.tbEndCheck && Game.tbEndCheck()) return true;
      }
      return true;
    },
    empower(a, ab, target, actor) {
      const C = actorCtx(actor);
      const mult = lvlC(C, ab.id) >= 2 ? 1.8 : (a.mult || 1.6);
      const n = lvlC(C, ab.id) >= 3 ? 3 : (a.strikes || 2);
      C.hold._nextStrikes = { mult, n, label: (ab.name || 'Stoke').toUpperCase() };
      say(C, `You throw calories on the fire. The next ${n} strikes hit ${Math.round((mult - 1) * 100)}% harder. (${ab.name})`,
        `${C.name} throws calories on the fire. Their next ${n} strikes hit ${Math.round((mult - 1) * 100)}% harder. (${ab.name})`);
      return true;
    },
    guard(a, ab, target, actor) {
      const C = actorCtx(actor);
      const hits = (a.hits || 3) + (lvlC(C, ab.id) >= 2 ? 1 : 0);
      const cap = lvlC(C, ab.id) >= 3 ? 25 : (a.cap || 15);
      C.hold._absorb = { hits, cap, label: ab.name || 'Coin Guard' };
      say(C, `${hits} coins of hard light lift from your pack and orbit you. Each one will stop a blow (up to ${cap}). (${ab.name})`,
        `${hits} coins of hard light lift from ${C.name}'s pack and orbit them. Each will stop a blow (up to ${cap}). (${ab.name})`);
      return true;
    },
    bribe(a, ab, target, actor) {
      const C = actorCtx(actor), f = Game.tbfight, p = C.p;
      const m = pickMonster(f, p, target);
      if (!m) { if (C.isP) Game.say('No one to pay off.'); return false; }
      if (isTitanish(m)) { if (C.isP) Game.say(`${nm(m)} looks at the food and then at you. The big ones don't haggle. (Bribe: not titans.)`); return false; }
      const hes = (a.hesitate || 2) + (lvlC(C, ab.id) >= 3 ? 1 : 0);
      m.hesitate = Math.max(m.hesitate || 0, hes);
      let dx = Math.sign(m.mx - p.mx), dy = Math.sign(m.my - p.my);
      if (!dx && !dy) dx = 1;
      let back = 0;
      for (let i = 0; i < (a.back || 2); i++) {
        if (!Game.tbCanOccupy(m, m.mx + dx, m.my + dy)) break;
        m.mx += dx; m.my += dy; back++;
      }
      let turned = '';
      if (hasC(C, 'sweetener')) {
        const other = liveMons(f).filter(o => o !== m).sort((x, y) => cheb(x, m) - cheb(y, m))[0];
        if (other) {
          const r = lvlC(C, 'sweetener') >= 2 ? 3 : 2;
          m._turncoatTarget = other.key; m._turncoatRounds = r;
          turned = ` And it's on ${C.isP ? 'your' : 'their'} side now: for ${r} rounds it goes for ${nm(other)}. (Sweetener)`;
        }
      }
      say(C, `You hold out the food. ${nm(m)} takes it, backs off ${back} tile${back === 1 ? '' : 's'}, and reconsiders its life for ${hes} rounds.${turned} (Bribe)`,
        `${C.name} holds out the food. ${nm(m)} takes it, backs off ${back} tile${back === 1 ? '' : 's'}, and reconsiders for ${hes} rounds.${turned} (Bribe)`);
      try { Game.tele && Game.tele('godpath_bribe', { monster: (m.mdef || {}).id || m.monsterId, turned: !!turned, who: C.isP ? 'player' : C.vid }); } catch (e) { warn('tele bribe', e); }
      refresh();
      return true;
    },
    feed_camp(a, ab) {
      const v = Game.state.village || {};
      const ids = (v.roster || []).filter(id => id !== Game.villagerId && !((Game.vpOf && Game.vpOf(id)) || {}).dead);
      if (!ids.length) { Game.say('No one in camp to feed. (Long Table)'); return false; }
      const h = a.hunger || 40;
      let fed = 0;
      for (const id of ids) {
        try { const n = Game.npcNeeds(id); if (n) { n.hunger = Math.max(0, (n.hunger || 0) - h); fed++; } } catch (e) { warn('npcNeeds', e); }
        if (lvl(ab.id) >= 3) { try { Game.bumpTrust && Game.bumpTrust(id, 1, 'long table'); } catch (e) { warn('bumpTrust', e); } }
      }
      Game.say(`You set the pot in the middle and everyone eats from it. ${fed} bellies fuller tonight, and you a little emptier. (Long Table)`);
      try { Game.tele && Game.tele('godpath_feed_camp', { fed }); } catch (e) { warn('tele feed', e); }
      return fed > 0;
    },
  };

  function readIntents(f) {
    try {
      for (const m of liveMons(f)) {
        const hint = Game._stanceHint ? Game._stanceHint(m) : '';
        if (hint) Game.say(`👁 ${nm(m)}: ${hint}`);
      }
    } catch (e) { warn('readIntents', e); }
  }

  // Register a generic impl + precheck for every data action that declares
  // `do` and has no hand-written impl. Prechecks refuse BEFORE costs are
  // paid (abilityActions.js precheck_before_payment).
  function registerVerbs() {
    const IMPLS = globalThis.AbilityActionImpls;
    const PRE = globalThis.AbilityActionPrechecks;
    if (!IMPLS || !PRE) { warn('AbilityActionImpls missing: godpath verbs unwired (load godpath.js after abilityActions.js)'); return 0; }
    let n = 0;
    for (const ab of ((Game.data && Game.data.abilities) || [])) {
      for (const act of (ab.actions || [])) {
        if (!act.do) continue;
        const key = ab.id + '.' + act.id;
        if (IMPLS[key]) continue;
        const verb = VERBS[act.do];
        if (!verb) { warn('unknown verb "' + act.do + '" on ' + key); continue; }
        IMPLS[key] = function (game, target) {
          const f = game.tbfight;
          const r = verb(act, ab, target);
          if (r !== false) {
            if (f && act.perFight) { const u = fightUses(f); u[key] = (u[key] || 0) + 1; }
            if (act.perDay) { const s = game.state.scholar; s._gpDay = s._gpDay || {}; s._gpDay[key] = s.day || 0; }
            try { game.tele && game.tele('godpath_verb', { ability: ab.id, verb: act.do }); } catch (e) { warn('tele verb', e); }
          }
          return r;
        };
        PRE[key] = function (game) {
          const f = game.tbfight;
          if (act.context === 'combat' && !f) return { ok: false, why: 'Only in a fight.' };
          let per = act.perFight;
          if (per && game.abilityLevel && game.abilityLevel(ab.id) >= 3 && /^(wall|pack|command|blink)$/.test(act.do)) per += 1;
          if (f && per && (fightUses(f)[key] || 0) >= per) return { ok: false, why: `${act.name}: ${per === 1 ? 'once' : per + ' times'} per fight.` };
          if (act.perDay) { const s = game.state.scholar; if (((s._gpDay || {})[key]) === (s.day || 0)) return { ok: false, why: `${act.name}: once a day.` }; }
          if (f && /^(pull|push|pack|swap|bribe|wall)$/.test(act.do) && !liveMons(f).length) return { ok: false, why: 'No monster to use it on.' };
          if (f && /^(aegis|command)$/.test(act.do) && !liveAllies(f).length) return { ok: false, why: 'No ally in the fight.' };
          return { ok: true };
        };
        n++;
      }
    }
    return n;
  }

  // ===================== VILLAGERS CAST THE SAME VERBS =====================
  // Parity (2026-10-14, Steve: "when in doubt we treat them the same way"):
  // a villager holding a subclass active casts it through the SAME VERBS
  // implementation (actor = their fighter), pays the SAME data kcal (from
  // their own belly: kcal/25 hunger, the scale villager meals use), and is
  // refused the same way when the body has nothing to burn (hunger >= 80,
  // the player's eat-first gate in villager terms). The village pantry tier
  // gates casts like every other villager ability (foodPower.js rules:
  // starving = none, tight = only when outmatched).
  const V_HUNGER_GATE = 80;
  // THE ORIGINAL KIT, CAST BY VILLAGERS (godpath-buff 2026-10-14): the
  // older combat actions have player-only impls in abilityActions.js; for a
  // villager caster they run here with the card's numbers (Static Toss
  // 20-30 within 3, Cheese Wheel 25-35 homing, Bird Strike 3 rounds,
  // Turncoat 2 rounds, Freeze Tag root 2, Retribution = half the pain taken
  // this fight into everything adjacent), x their food power.
  const KIT_TB = {
    'static_toss.toss': { do: 'kit_static', plan: (I) => (I.n < 1 && I.near && I.d <= 3 ? 7 : null) },
    'cheese_wheel.hurl': { do: 'kit_cheese', plan: (I) => (I.n < 1 && I.strong && !I.cheeseToday ? 7.5 : null) },
    'bird_strike.call': { do: 'kit_birds', plan: (I) => (I.n < 1 && I.strong && !(I.strong._birdStrike > 0) ? 5 : null) },
    'turncoat.persuade': { do: 'kit_turncoat', plan: (I) => (I.n < 1 && I.mons.length >= 2 ? 7 : null) },
    'freeze_tag.tag': { do: 'kit_freeze', plan: (I) => (I.n < 1 && I.near && I.d <= 1 && I.hp < 0.6 ? 5.5 : null) },
    'retribution.unleash': { do: 'kit_retribution', plan: (I) => (I.n < 1 && (I.v._taken || 0) >= 20 && I.d <= 1 ? 8 : null) },
  };
  const KIT_IMPL = {
    kit_static(v, I) {
      const m = I.near; const d = Math.round(rint(20, 30) * villagerPowerMult(Game, v.villagerId));
      Game.say(`${v.name} balls up the static and THROWS it into ${nm(m)}! (Static Toss)`);
      Game.tbDamage(m.key, d, 'static toss', v.key); return true;
    },
    kit_cheese(v, I) {
      const m = I.mons.slice().sort((a, b) => (b.hp || 0) - (a.hp || 0))[0];
      const d = Math.round(rint(25, 35) * villagerPowerMult(Game, v.villagerId));
      const vd = (Game.state.village.npcCheeseDay = Game.state.village.npcCheeseDay || {});
      vd[v.villagerId] = (Game.state.scholar || {}).day || 0;
      Game.say(`${v.name} hurls a wheel of cheese that SCREAMS the whole way into ${nm(m)}. (Cheese Wheel)`);
      Game.tbDamage(m.key, d, 'cheese wheel', v.key); return true;
    },
    kit_birds(v, I) { I.strong._birdStrike = 3; Game.say(`${v.name} points at the sky. The birds dive on ${nm(I.strong)}. (Bird Strike: 3 rounds)`); return true; },
    kit_turncoat(v, I) {
      const [a, b] = I.mons;
      a._turncoatTarget = b.key; a._turncoatRounds = 2; b._turncoatTarget = a.key; b._turncoatRounds = 2;
      Game.say(`${v.name} explains, very reasonably, why the OTHER one is the problem. ${nm(a)} and ${nm(b)} turn on each other. (Turncoat)`); return true;
    },
    kit_freeze(v, I) { I.near._frozen = Math.max(I.near._frozen || 0, 2); Game.say(`${v.name} touches ${nm(I.near)}: "YOU'RE IT!" It's rooted. (Freeze Tag)`); return true; },
    kit_retribution(v, I) {
      const f = Game.tbfight; let hit = 0;
      const d = Math.round(Math.max(8, (v._taken || 0) * 0.5) * villagerPowerMult(Game, v.villagerId));
      for (const m of liveMons(f)) if (cheb(m, v) <= 1) { Game.tbDamage(m.key, d, 'retribution', v.key); hit++; if (Game.tbEndCheck && Game.tbEndCheck()) break; }
      Game.say(`The System returns ${v.name}'s pain as force: ${d} into ${hit} adjacent. (Retribution)`);
      return hit > 0;
    },
  };
  function combatVerbActs() {
    const out = [];
    for (const ab of ((Game.data && Game.data.abilities) || [])) {
      for (const act of (ab.actions || [])) {
        if (act.do && act.context === 'combat' && VERBS[act.do]) out.push({ ab, act });
        else if (KIT_TB[ab.id + '.' + act.id]) out.push({ ab, act, kit: KIT_TB[ab.id + '.' + act.id] });
      }
    }
    return out;
  }
  let _cva = null;
  function verbActs() { if (!_cva) _cva = combatVerbActs(); return _cva; }
  function vKcal(act, ab) {
    try { return (act.cost && act.cost.kcal) || (Game.abilityKcalCost ? Game.abilityKcalCost(ab.id, act.id) : 40); }
    catch (e) { warn('vKcal', e); return 40; }
  }
  function vCanPay(vid, kcal) {
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); return !n || ((n.hunger || 0) + kcal / 25) < V_HUNGER_GATE; }
    catch (e) { warn('vCanPay', e); return false; }
  }
  function vPay(vid, kcal) {
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); if (n) n.hunger = Math.min(100, (n.hunger || 0) + Math.round(kcal / 25)); }
    catch (e) { warn('vPay', e); }
  }
  function vUses(f, v) { f._gpVUses = f._gpVUses || {}; const k = v.key; f._gpVUses[k] = f._gpVUses[k] || {}; return f._gpVUses[k]; }
  // The villager's read of the turn: when is each verb the smart play?
  // Same spirit as the capable bot's ACTION_PLAN for the player.
  const V_PLAN = {
    wall: (I) => (I.n < 1 && I.near && I.d >= 2 && I.d <= 4 && (I.hp < 0.6 || I.mons.length >= 2) ? 6 : null),
    pull: (I) => (I.n < 1 && I.hp > 0.6 && I.mons.some(m => cheb(m, I.v) > 1 && cheb(m, I.v) <= 4) && (I.v._nextStrikes || I.mons.length >= 2) ? 5 : null),
    push: (I) => (I.mons.filter(m => cheb(m, I.v) <= 2).length >= 1 && (I.hp < 0.7 || I.mons.length >= 2) ? 7.5 : null),
    pack: (I) => (I.n < 1 && I.strong ? 6.5 : null),
    heal: (I) => (I.hp < 0.5 || Game.tbOtherAllies(I.v).some(a => cheb(a, I.v) <= 1 && a.hp / (a.maxHp || 1) < 0.4) ? 7 : null),
    blink: (I) => (I.hp < 0.35 && I.d <= 1 ? 8 : null),
    swap: (I) => (I.n < 1 && I.mons.some(m => m.telegraph && cheb(m, I.v) <= 3 && (Game.fighterSize ? Game.fighterSize(m) : 1) <= 1) ? 7 : null),
    foresee: (I) => (I.n < 1 && (I.hasProphecy || I.mons.some(m => m.telegraph)) ? 5.5 : null),
    broadcast: (I) => (I.n < 1 && I.allies.length >= 1 ? 5 : null),
    command: (I) => (I.n < 1 && I.allies.length >= 2 ? 7 : null),
    empower: (I) => (!I.v._nextStrikes && I.d <= 1 ? 6 : null),
    guard: (I) => (I.n < 1 && !I.v._absorb && I.d <= 2 && I.hp < 0.8 ? 6 : null),
    bribe: (I) => (I.n < 1 && I.near && I.d <= 2 && !isTitanish(I.near) && (I.hp < 0.6 || I.mons.length >= 2) ? 6.5 : null),
    aegis: (I) => (I.n < 1 && I.hp > 0.6 && Game.tbOtherAllies(I.v).some(a => a.hp / (a.maxHp || 1) < 0.5) ? 5.5 : null),
  };
  // villagerCast(game, v): one subclass verb for this villager's turn, or
  // false. "No turn" verbs (cost.turn absent) return 'free' so the villager
  // still acts this turn.
  function villagerCast(game, v) {
    try {
      const f = game.tbfight;
      if (!f || f.over || !v || !v.villagerId || v._gpCommanded || !game.npcHasAbility) return false;
      const vid = v.villagerId;
      const mons = liveMons(f);
      if (!mons.length) return false;
      let tier = 'secure';
      try { tier = game.villageFoodTier ? game.villageFoodTier() : 'secure'; } catch (e) { warn('tier', e); }
      if (tier === 'starving') return false;
      if (tier === 'tight' && mons.length < 2) return false;
      const near = nearest(f, v);
      const allies = game.tbOtherAllies(v);
      const I = {
        v, mons, allies, near, d: near ? cheb(near, v) : 99, hp: (v.hp || 0) / Math.max(1, v.maxHp || 1),
        strong: mons.slice().sort((a, b) => (b.maxHp || 0) - (a.maxHp || 0))[0], n: 0,
        hasProphecy: game.npcHasAbility(vid, 'prophecy'),
      };
      const uses = vUses(f, v);
      let best = null;
      I.cheeseToday = (((game.state.village || {}).npcCheeseDay || {})[vid]) === ((game.state.scholar || {}).day || 0);
      for (const { ab, act, kit } of verbActs()) {
        if (!game.npcHasAbility(vid, ab.id)) continue;
        const key = ab.id + '.' + act.id;
        const used = uses[key] || 0;
        if (act.perFight && used >= act.perFight) continue;
        const plan = kit ? kit.plan : V_PLAN[act.do];
        if (!plan) continue;
        I.n = used;
        const sc = plan(I);
        if (sc == null) continue;
        const kcal = vKcal(act, ab);
        if (!vCanPay(vid, kcal)) continue;
        if (!best || sc > best.sc) best = { sc, ab, act, key, kcal, kit };
      }
      if (!best) return false;
      const ok = best.kit ? KIT_IMPL[best.kit.do](v, I) : VERBS[best.act.do](best.act, best.ab, null, v);
      if (ok === false) { uses[best.key] = (uses[best.key] || 0) + 1; return false; } // tried and found no use: don't loop on it
      uses[best.key] = (uses[best.key] || 0) + 1;
      vPay(vid, best.kcal);
      try { game.tele && game.tele('godpath_verb', { ability: best.ab.id, verb: best.kit ? best.kit.do : best.act.do, who: vid }); } catch (e) { warn('tele vverb', e); }
      try { if (game.npcWitnessAbility) game.npcWitnessAbility(best.ab.id, allies.map(a => a.villagerId).filter(Boolean), vid); } catch (e) { warn('witness', e); }
      return (best.kit || (best.act.cost && best.act.cost.turn)) ? true : 'free';
    } catch (e) { warn('villagerCast', e); return false; }
  }
  // villagerStrikeMult(game, v, target): the villager's strike multipliers
  // from held subclass effects — Stoke / Back from the Brink (_nextStrikes on
  // the fighter) and Misdirection (confused targets), same numbers as the
  // player's.
  function villagerStrikeMult(game, v, target) {
    try {
      // FOOD IS FUEL (parity): a well-fed villager hits like a topped-up player.
      let m = v.villagerId ? villagerPowerMult(game, v.villagerId) : 1;
      if (v._nextStrikes && v._nextStrikes.n > 0) {
        m *= v._nextStrikes.mult;
        v._nextStrikes.n--;
        if (v._nextStrikes.n <= 0) delete v._nextStrikes;
      }
      // data modifiers held (adrenaline_control: combat.strike_damage x1.3)
      if (v.villagerId) { const sm = modSum((game.state.village.npcAbilities || {})[v.villagerId] || [], 'combat.strike_damage'); if (sm) m *= sm; }
      if (target && v.villagerId && game.npcHasAbility && game.npcHasAbility(v.villagerId, 'misdirection')) {
        const confused = (target.blind || 0) > 0 || (target._turncoatRounds || 0) > 0 || (target.hesitate || 0) > 0 || (target._frozen || 0) > 0 || (target._bound || 0) > 0 || (target.stunned || 0) > 0;
        if (confused) m *= 1.5;
      }
      return m;
    } catch (e) { warn('villagerStrikeMult', e); return 1; }
  }
  // absorbVillagerHit(game, t, final): Coin Guard / Last Rites absorbs on a
  // villager fighter, and Prophecy's dodge while their Foresight runs.
  function absorbVillagerHit(game, t, final) {
    try {
      if (!(final > 0) || !t) return final;
      const f = game.tbfight;
      if (f && t.villagerId && (t._foresightUntil || f._foresightUntil || 0) >= (f.round || 1) && game.npcHasAbility && game.npcHasAbility(t.villagerId, 'prophecy')) {
        if (Math.random() < 0.35) { game.say(`${t.name} saw it coming a breath ago and simply isn't there. (Prophecy)`); return 0; }
      }
      // combat.dodge_chance held (adrenaline_surge +15%)
      if (t.villagerId) {
        const dg = modSum((game.state.village.npcAbilities || {})[t.villagerId] || [], 'combat.dodge_chance');
        if (dg && Math.random() < Math.min(0.5, dg)) { game.say(`${t.name} is already moving: it misses. (Adrenaline Surge)`); return 0; }
      }
      const ab = t._absorb;
      if (!ab || !(ab.hits > 0)) return final;
      const took = Math.min(final, ab.cap || final);
      ab.hits -= 1;
      if (ab.hits <= 0) delete t._absorb;
      game.say(`${ab.label} turns the blow on ${t.name} aside (${took} absorbed${ab.hits > 0 ? `, ${ab.hits} left` : ''}).`);
      return final - took;
    } catch (e) { warn('absorbVillagerHit', e); return final; }
  }

  // ===================== OFF-SCREEN FIELD FIGHTS =====================
  // fieldFights.js runs villager-vs-monster meetings as abstract rounds (no
  // grid). The verbs translate into its terms, each once per fight, paid
  // from the villager's belly the same way: board control = the monster
  // loses rounds (abStun), Landslide = slam + stun, Pack Hunt = pin + harry,
  // Mending Hands = a heal, Foresight (+Prophecy) = blows that miss, Coin
  // Guard = absorbed hits, Stoke = harder strikes, Bribe (+Sweetener) = it
  // backs off (its packmate takes the bite). Passives held: Misdirection,
  // Ember Heart, Back from the Brink, Rally Aura, Lifeline, Last Rites.
  // FOOD IS FUEL, FOR EVERYONE (foodPower.js overcharge, parity): the
  // player hits x1.25 when topped up (kcal >= 75% of the bank); a villager
  // whose belly is as full (hunger <= 25) hits the same. A starving pantry
  // feeds no one's power.
  const V_FED_HUNGER = 25;
  function villagerPowerMult(game, vid) {
    try {
      const tier = game.villageFoodTier ? game.villageFoodTier() : 'secure';
      if (tier === 'starving') return 1;
      const n = game.npcNeeds && game.npcNeeds(vid);
      if (n && (n.hunger || 0) <= V_FED_HUNGER) return OVERCHARGE_PARITY();
      return 1;
    } catch (e) { warn('villagerPowerMult', e); return 1; }
  }
  function OVERCHARGE_PARITY() {
    try { return (Game.overchargeMult ? Game.overchargeMult() : 1.25); } catch (e) { warn('overchargeMult', e); return 1.25; }
  }
  const FIELD_IDS = ['raise_earth', 'gravity_well', 'landslide', 'pack_hunt', 'mending_hands', 'blink', 'switcheroo', 'foresight', 'live_broadcast', 'the_crowd_moves', 'stoke', 'coin_guard', 'bribe', 'aegis_link',
    'misdirection', 'prophecy', 'ember_heart', 'back_from_the_brink', 'rally_aura', 'lifeline', 'last_rites', 'sweetener'];
  // THE WHOLE KIT OFF-SCREEN (buff-everyone 2026-10-14): the original
  // combat abilities a villager holds also run here — the ones the field
  // engine never read (static toss, cheese wheel, bird strike, rage, sand,
  // dread, turncoat, retribution, second wind, and the data modifiers:
  // adrenaline_control strikes x1.3, adrenaline_surge +15% dodge,
  // chitin_skin +30 armor). Same numbers as the player's cards.
  const FIELD_KIT = ['rage', 'pocket_sand', 'fear_aura', 'static_toss', 'cheese_wheel', 'bird_strike', 'turncoat', 'retribution', 'second_wind', 'molt'];
  function modSum(ids, target) {
    try {
      const M = S.modifiers;
      const mods = [];
      for (const id of ids) { const d = defOf(id); if (d && d.lane === 'magic') for (const m of (d.modifiers || [])) if (m && m.target === target && !m.condition) mods.push(m); }
      if (!mods.length) return null;
      return M && M.resolve ? M.resolve(target === 'combat.strike_damage' ? 1 : 0, target, mods, {}) : null;
    } catch (e) { warn('modSum', e); return null; }
  }
  function fieldBegin(game, vid, vAbs) {
    try {
      const held = {};
      for (const id of FIELD_IDS.concat(FIELD_KIT)) if ((vAbs || []).indexOf(id) >= 0) held[id] = true;
      let tier = 'secure';
      try { tier = game.villageFoodTier ? game.villageFoodTier() : 'secure'; } catch (e) { warn('tier', e); }
      const strike = modSum(vAbs || [], 'combat.strike_damage');
      const dodge = modSum(vAbs || [], 'combat.dodge_chance');
      const armor = modSum(vAbs || [], 'armor.flat');
      const power = villagerPowerMult(game, vid);
      // monster.detect_chance: adds are the holder's own eyes (bird_whisperer
      // +0.2, third_eye +0.3); a multiply under 1 is the world not noticing
      // them (beast_calm x0.75).
      let detAdd = 0, detMul = 1;
      for (const id of (vAbs || [])) {
        const d = defOf(id);
        if (!d || d.lane !== 'magic') continue;
        for (const m of (d.modifiers || [])) {
          if (!m || m.target !== 'monster.detect_chance' || m.condition) continue;
          if (m.op === 'add') detAdd += m.value || 0;
          else if (m.op === 'multiply' && m.value < 1) detMul *= m.value;
        }
      }
      if (!Object.keys(held).length && !strike && !dodge && !armor && power <= 1 && !detAdd && detMul >= 1) return null;
      return { vid, held, used: {}, tier, nextMult: 0, nextN: 0, absorb: 0, absorbCap: 0, missUntil: 0, missP: 0, harry: 0, birds: 0, blindUntil: 0, cheated: false,
        holdBonus: held.rally_aura ? 0.06 : 0, strikeMult: strike || 1, dodge: Math.min(0.5, dodge || 0), armorAdd: armor || 0, power, detAdd, detMul };
    } catch (e) { warn('fieldBegin', e); return null; }
  }
  function fieldPay(G, id, actId) {
    const ab = defOf(id) || {};
    const act = (ab.actions || []).find(a => a.id === actId) || (ab.actions || [])[0] || {};
    const kcal = vKcal(act, ab);
    if (!vCanPay(G.vid, kcal)) return false;
    vPay(G.vid, kcal);
    G.used[id] = (G.used[id] || 0) + 1;
    try { Game.tele && Game.tele('godpath_verb', { ability: id, verb: act.do || id, who: G.vid, field: true }); } catch (e) { warn('tele field', e); }
    return true;
  }
  // fieldAct(G, c): the villager's action phase. c = {round, vHp, vHpMax,
  // lead, members, allyIn, allyHp, allyMax, mStunned, lroll, vName, mName,
  // log}. Returns {consumed, abStun, vHp, allyHp, extraAlly} (all optional).
  function fieldAct(G, c) {
    const out = { consumed: false, abStun: 0 };
    try {
      if (!G || !c.lead || c.lead.hp <= 0) return out;
      if (G.tier === 'starving') return out;
      const packN = (c.members || []).filter(m => m.hp > 0).length;
      if (G.tier === 'tight' && packN < 2 && c.vHp > c.vHpMax * 0.4) return out;
      const h = G.held, u = (id) => G.used[id] || 0;
      const hp = c.vHp / Math.max(1, c.vHpMax);
      const L = c.log;
      const strong = c.lead.maxHp >= c.vHpMax * 0.8 || packN >= 2;
      // free actions first (no turn): Foresight, Coin Guard, Stoke
      if (h.foresight && !u('foresight') && (strong || h.prophecy) && fieldPay(G, 'foresight', 'foresee')) {
        G.missUntil = c.round + 2; G.missP = h.prophecy ? 0.35 : 0.1;
        L.push('R' + c.round + ': ' + c.vName + '\'s eyes go distant — they call the ' + c.mName + '\'s moves a breath early. (Foresight' + (h.prophecy ? ' + Prophecy' : '') + ')');
      }
      if (h.coin_guard && !u('coin_guard') && hp < 0.8 && fieldPay(G, 'coin_guard', 'coins')) {
        G.absorb = 3; G.absorbCap = 15;
        L.push('R' + c.round + ': three coins of hard light orbit ' + c.vName + '. (Coin Guard)');
      }
      if (h.stoke && u('stoke') < 2 && !G.nextN && fieldPay(G, 'stoke', 'stoke')) {
        G.nextMult = 1.6; G.nextN = 2;
        L.push('R' + c.round + ': ' + c.vName + ' throws calories on the fire. (Stoke: next 2 strikes +60%)');
      }
      // turn actions: the best one, if any
      if (h.mending_hands && hp < 0.5 && u('mending_hands') < 2 && fieldPay(G, 'mending_hands', 'mend')) {
        const amt = c.lroll([12, 18]);
        out.vHp = Math.min(c.vHpMax, c.vHp + amt);
        // GEARTIER-A (abilities pass): the mend runs to the fighting
        // ally too, when the ally is wounded — two bodies kept up,
        // not one number. Same kcal, same turn, same uses cap.
        let allyBit = '';
        if (c.allyIn && c.allyHp > 0 && c.allyHp < (c.allyMax || 70)) {
          out.allyHp = Math.min(c.allyMax || 70, c.allyHp + amt);
          allyBit = ' The thread runs to their ally: +' + (out.allyHp - c.allyHp) + ' HP.';
        }
        L.push('R' + c.round + ': ' + c.vName + ' presses the wound and it knits: +' + (out.vHp - c.vHp) + ' HP. (Mending Hands)' + allyBit);
        out.consumed = true; return out;
      }
      const pw = G.power || 1;
      const dmgAct = (id, act, range, label, line) => {
        if (!h[id] || u(id) || c.lead.hp <= 0 || !fieldPay(G, id, act)) return false;
        const d = Math.round(c.lroll(range) * pw);
        c.lead.hp -= d; out.dealt = (out.dealt || 0) + d; if (c.lead.hp <= 0) c.lead.alive = false;
        L.push('R' + c.round + ': ' + c.vName + ' ' + line + ' — ' + d + ' (' + Math.max(0, c.lead.hp) + ' left). (' + label + ')');
        out.consumed = true; return true;
      };
      if (c.lead.hp > 12 && dmgAct('cheese_wheel', 'hurl', [25, 35], 'Cheese Wheel', 'hurls a homing wheel of cheese at the ' + c.mName)) return out;
      if (c.lead.hp > 12 && dmgAct('static_toss', 'toss', [20, 30], 'Static Toss', 'hurls a crackling ball of static at the ' + c.mName)) return out;
      if (h.retribution && !u('retribution') && (c.taken || 0) >= 20 && fieldPay(G, 'retribution', 'unleash')) {
        const d = Math.round(Math.max(8, (c.taken || 0) * 0.5) * pw);
        c.lead.hp -= d; out.dealt = (out.dealt || 0) + d; if (c.lead.hp <= 0) c.lead.alive = false;
        L.push('R' + c.round + ': the System returns ' + c.vName + '\'s pain as force — ' + d + ' into the ' + c.mName + '. (Retribution)');
        out.consumed = true; return out;
      }
      if (h.rage && !u('rage') && !G.nextN && c.lead.hp > c.lead.maxHp * 0.4 && fieldPay(G, 'rage', 'unleash_rage')) {
        G.nextMult = 2; G.nextN = 3;
        L.push('R' + c.round + ': ' + c.vName + '\'s eyes go red. Next 3 strikes hit twice as hard. (Rage)');
        out.consumed = true; return out;
      }
      if (h.bird_strike && !u('bird_strike') && fieldPay(G, 'bird_strike', 'call')) {
        G.birds = 3;
        // GEARTIER-A (abilities pass): the card promises a blind in
        // tactical; the field port had none. While the birds harry
        // (call round + 2), the beast's blows miss 25% (fieldIncoming
        // below). Damage stream unchanged (8-12/round x3).
        G.birdsUntil = c.round + 2;
        L.push('R' + c.round + ': ' + c.vName + ' whistles up the birds — they harry the ' + c.mName + '. (Bird Strike)');
        out.consumed = true; return out;
      }
      if (h.turncoat && !u('turncoat') && packN >= 2 && fieldPay(G, 'turncoat', 'persuade')) {
        out.abStun = 2;
        L.push('R' + c.round + ': ' + c.vName + ' whispers to the pack — two of them turn on each other. (Turncoat)');
        out.consumed = true; return out;
      }
      if (h.pocket_sand && !u('pocket_sand') && (strong || hp < 0.7) && fieldPay(G, 'pocket_sand', 'throw_sand')) {
        G.blindUntil = c.round + 2;
        L.push('R' + c.round + ': ' + c.vName + ' flings grit into the ' + c.mName + '\'s eyes. (Pocket Sand: half-blind 2 rounds)');
        out.consumed = true; return out;
      }
      if (h.fear_aura && !u('fear_aura') && strong && fieldPay(G, 'fear_aura', 'loom')) {
        out.abStun = 1;
        L.push('R' + c.round + ': ' + c.vName + ' goes very still and LOOMS. The ' + c.mName + ' hesitates. (Dread)');
        out.consumed = true; return out;
      }
      if (h.landslide && !u('landslide') && (strong || hp < 0.7) && fieldPay(G, 'landslide', 'quake')) {
        const d = Math.round(c.lroll([14, 22]) * pw);
        c.lead.hp -= d; out.dealt = d; if (c.lead.hp <= 0) c.lead.alive = false;
        out.abStun = 1;
        L.push('R' + c.round + ': the ground heaves outward from ' + c.vName + ' — the ' + c.mName + ' slams into a trunk for ' + d + ', stunned. (Landslide)');
        out.consumed = true; return out;
      }
      if (h.pack_hunt && !u('pack_hunt') && fieldPay(G, 'pack_hunt', 'sic')) {
        out.abStun = 2; G.harry = 3;
        L.push('R' + c.round + ': ' + c.vName + ' whistles once — wings, teeth, claws on the ' + c.mName + '. Pinned. (Pack Hunt)');
        out.consumed = true; return out;
      }
      if (h.bribe && !u('bribe') && (hp < 0.6 || packN >= 2) && fieldPay(G, 'bribe', 'pay_off')) {
        out.abStun = 2;
        let extra = '';
        if (h.sweetener && packN >= 2) { const d = c.lroll([6, 12]); c.lead.hp -= d; out.dealt = d; if (c.lead.hp <= 0) c.lead.alive = false; extra = ' Its packmate takes the bite instead: ' + d + '. (Sweetener)'; }
        L.push('R' + c.round + ': ' + c.vName + ' holds out the food. The ' + c.mName + ' takes it and backs off, reconsidering. (Bribe)' + extra);
        out.consumed = true; return out;
      }
      if (h.raise_earth && !u('raise_earth') && (hp < 0.6 || packN >= 2) && fieldPay(G, 'raise_earth', 'raise')) {
        out.abStun = 2;
        L.push('R' + c.round + ': ' + c.vName + ' slams a palm down and the earth STANDS UP between them. (Raise Earth)');
        out.consumed = true; return out;
      }
      if (h.switcheroo && !u('switcheroo') && strong && fieldPay(G, 'switcheroo', 'swap')) {
        out.abStun = 1;
        L.push('R' + c.round + ': snap — ' + c.vName + ' is where the ' + c.mName + ' was. Its wind-up hits empty air. (Switcheroo)');
        out.consumed = true; return out;
      }
      if (h.gravity_well && !u('gravity_well') && G.nextN && fieldPay(G, 'gravity_well', 'pull')) {
        out.abStun = 1;
        L.push('R' + c.round + ': the ' + c.mName + ' slides toward ' + c.vName + ' and lands staggered. (Gravity Well)');
        // a pull sets up the strike: not a whole turn off-screen
      }
      if (h.blink && u('blink') < 2 && hp < 0.3 && fieldPay(G, 'blink', 'blink')) {
        out.abStun = Math.max(out.abStun || 0, 1);
        L.push('R' + c.round + ': ' + c.vName + ' is somewhere else, between one heartbeat and the next. (Blink)');
      }
      if (c.allyIn && c.allyHp > 0) {
        if (h.the_crowd_moves && !u('the_crowd_moves') && fieldPay(G, 'the_crowd_moves', 'command')) {
          out.extraAlly = 2;
          L.push('R' + c.round + ': ' + c.vName + ' says one word. "NOW." (The Crowd Moves)');
        } else if (h.live_broadcast && !u('live_broadcast') && fieldPay(G, 'live_broadcast', 'go_live')) {
          // GEARTIER-A (abilities pass): the ally fights louder for
          // TWO rounds (one extra strike per round), not one extra
          // strike once. fieldFights' ally block consumes the
          // counter (broadcastN); the call round is round one of
          // the two. Same kcal, same turn, same once-per-fight gate.
          G.broadcastN = 2;
          L.push('R' + c.round + ': ' + c.vName + ' goes LIVE — the ally fights louder. (Live Broadcast)');
        } else if (h.aegis_link && !u('aegis_link') && c.allyHp < (c.allyMax || 70) * 0.5 && fieldPay(G, 'aegis_link', 'link')) {
          G.aegis = 3;
          L.push('R' + c.round + ': a thread of light runs from ' + c.vName + ' to their ally. (Aegis Link)');
        }
      }
      return out;
    } catch (e) { warn('fieldAct', e); return out; }
  }
  // fieldEvade(G, evade): the awareness roll (seen in time, gave it room)
  // after held detection modifiers.
  function fieldEvade(G, evade) {
    if (!G) return evade;
    let e = evade + (G.detAdd || 0);
    if ((G.detMul || 1) < 1) e = 1 - (1 - e) * G.detMul;
    return e;
  }
  // fieldStrike(G, vd, c): the villager's strike after held effects.
  function fieldStrike(G, vd, c) {
    try {
      if (!G) return vd;
      let m = (G.strikeMult || 1) * (G.power || 1);
      if (G.nextN > 0) { m *= G.nextMult; G.nextN--; }
      if (G.held.misdirection && c.mStunned) m *= 1.5;
      if (G.harry > 0 && c.lead && c.lead.hp > 0) { G.harry--; const hd = c.lroll([2, 4]); c.lead.hp -= hd; if (c.lead.hp <= 0) c.lead.alive = false; c.log.push('  the pack harries it for ' + hd + '.'); }
      if (G.birds > 0 && c.lead && c.lead.hp > 0) { G.birds--; const bd = c.lroll([8, 12]); c.lead.hp -= bd; if (c.lead.hp <= 0) c.lead.alive = false; c.log.push('  the birds tear at it for ' + bd + '.'); }
      return Math.round(vd * m);
    } catch (e) { warn('fieldStrike', e); return vd; }
  }
  // fieldIncoming(G, total, c): a blow on the villager after held effects.
  function fieldIncoming(G, total, c) {
    try {
      if (!G || !(total > 0)) return total;
      const rr = () => (c.RR ? c.RR() : Math.random());
      if (G.blindUntil >= c.round && rr() < 0.5) { c.log.push('  half-blind, it swings wide. (Pocket Sand)'); return 0; }
      // GEARTIER-A (abilities pass): birds in its eyes — while the
      // birds harry, the beast's blows miss 25%.
      if (G.birdsUntil >= c.round && rr() < 0.25) { c.log.push('  the birds are in its eyes — it swings wide. (Bird Strike)'); return 0; }
      if (G.dodge > 0 && rr() < G.dodge) { c.log.push('  ' + c.vName + ' is already moving — it misses. (Adrenaline Surge)'); return 0; }
      if (G.missUntil >= c.round && rr() < G.missP) { c.log.push('  ' + c.vName + ' saw it coming and isn\'t there. (' + (G.held.prophecy ? 'Prophecy' : 'Foresight') + ')'); return 0; }
      if (G.absorb > 0) { const took = Math.min(total, G.absorbCap); G.absorb--; c.log.push('  a coin turns the blow (' + took + ' absorbed).'); return total - took; }
      return total;
    } catch (e) { warn('fieldIncoming', e); return total; }
  }
  // fieldAllyShare(G, share): Aegis Link pulls the ally's hits onto the caster.
  function fieldAllyShare(G, share) {
    if (G && G.aegis > 0) { G.aegis--; return 0; }
    return share;
  }
  // Uses belong to the person across scenes and mantle changes. Read legacy
  // counters conservatively: a period stamp without a count means one spent.
  function survivalUses(who) {
    const v = Game.state.village, s = Game.state.scholar, vid = isPlayer(who) ? Game.villagerId : who;
    const out = { ...(v.godpathSurvival || {})[vid] };
    const legacy = isPlayer(who) ? s : { secondWindDay: v.npcSecondWind?.[vid], secondWindUses: 1 };
    for (const [period, uses] of [['secondWindDay', 'secondWindUses'], ['moltWeek', 'moltUses']]) {
      if (!Number.isFinite(legacy[period])) continue;
      if (!Number.isFinite(out[period]) || legacy[period] > out[period]) {
        out[period] = legacy[period]; out[uses] = legacy[uses] || 1;
      } else if (legacy[period] === out[period]) out[uses] = Math.max(out[uses] || 1, legacy[uses] || 1);
    }
    return out;
  }
  function saveSurvivalUses(who, rec) {
    const v = Game.state.village, vid = isPlayer(who) ? Game.villagerId : who;
    (v.godpathSurvival || (v.godpathSurvival = {}))[vid] = { ...rec };
    if (isPlayer(who)) Object.assign(Game.state.scholar, rec);
    else if (Number.isFinite(rec.secondWindDay)) (v.npcSecondWind || (v.npcSecondWind = {}))[vid] = rec.secondWindDay;
  }
  function syncPlayerSurvivalUses() {
    const rec = survivalUses('player');
    for (const key of ['secondWindDay', 'secondWindUses', 'moltWeek', 'moltUses'])
      if (rec[key] !== undefined) Game.state.scholar[key] = rec[key];
  }
  function shedNpcGear(person) {
    const lost = new Map();
    for (const item of Object.values(person.equipped || {})) {
      const id = typeof item === 'string' ? item : item?.itemId || item?.id;
      if (id) lost.set(id, (lost.get(id) || 0) + 1);
    }
    // NPC owned items include their worn equipment. Clear exactly the worn
    // units; unworn spares remain, but cannot restore the lost copies.
    person.items = (person.items || []).flatMap(item => {
      const id = typeof item === 'string' ? item : item?.itemId || item?.id, count = lost.get(id) || 0;
      if (!count) return [item];
      const units = typeof item === 'string' ? 1 : item.units ?? 1, take = Math.min(units, count);
      lost.set(id, count - take);
      return units > take ? [{ ...item, units: units - take }] : [];
    });
    person.equipped = {};
  }
  function npcDeathRefusal(game, vid, c) {
    const person = vid && game.vpOf(vid);
    if (!person || person.id !== vid || person.dead || isPlayer(vid) || !c || !(c.hp <= 0) ||
        !Number.isFinite(c.maxHp) || !(c.maxHp > 0) || game.over ||
        (c.body && (c.body._echoed || !c.body.alive || c.body.villagerId !== vid))) return null;
    const v = game.state.village, day = game.state.scholar.day || 0, week = Math.floor(day / 7);
    const link = game.state.phoenixLink;
    if (link?.bearerIsPlayer === false && link.bearer === vid) return { hp: 1, held: true };
    const has = id => game.npcHasAbility(vid, id), syn = id => (v.npcSynergies?.[vid] || []).includes(id);
    const uses = survivalUses(vid), max = syn('refuses_death') ? 2 : 1;
    let hp, ability, shedGear = false;
    if (c.emberAvailable && has('ember_heart') && vCanPay(vid, 360)) {
      vPay(vid, 600); hp = Math.max(1, Math.ceil(c.maxHp * 0.2)); ability = 'ember_heart';
    } else if (has('molt') && (uses.moltWeek === week ? uses.moltUses || 1 : 0) < max) {
      uses.moltUses = (uses.moltWeek === week ? uses.moltUses || 1 : 0) + 1; uses.moltWeek = week;
      shedNpcGear(person); hp = c.maxHp; ability = 'molt'; shedGear = true; saveSurvivalUses(vid, uses);
    } else if (has('second_wind') && (uses.secondWindDay === day ? uses.secondWindUses || 1 : 0) < max) {
      uses.secondWindUses = (uses.secondWindDay === day ? uses.secondWindUses || 1 : 0) + 1; uses.secondWindDay = day;
      hp = syn('undying_fury') && c.raging ? c.maxHp : 1; ability = 'second_wind';
      if (!c.nonviolent && !['starvation', 'hunger', 'disease', 'sickness'].includes(c.cause)) {
        const needs = game.npcNeeds(vid); needs.hunger = Math.min(needs.hunger || 0, 80);
      }
      saveSurvivalUses(vid, uses);
    } else return null;
    const name = game.displayName(vid), line = ability === 'molt'
      ? name + ' sheds their skin and stands whole, but loses all equipped gear. (Molt)'
      : ability === 'second_wind' ? name + ' should be down — and refuses. Second wind: ' + hp + ' HP. (Second Wind)'
        : name + ' should be down — the furnace burns 600 kcal and stands them up at ' + hp + ' HP. (Ember Heart)';
    if (c.log) c.log.push(line); else game.say(line);
    if (ability === 'ember_heart') game.tele('godpath_ember', { kcal: 600, who: vid });
    else game.tele('godpath_verb', { ability, verb: ability === 'molt' ? 'shed' : 'refuse_death', who: vid, field: c.scene === 'field' });
    recordDeathRefusal(vid, ability, c.scene);
    return { hp, ability, shedGear };
  }
  // fieldCheatDeath(G, c): Ember Heart — the furnace eats the killing blow
  // (600 kcal: +24 hunger), then Back from the Brink. Returns new vHp or null.
  function fieldCheatDeath(G, c) {
    try {
      if (!G || !(c.vHp <= 0)) return null;
      const r = npcDeathRefusal(Game, G.vid, { hp: c.vHp, maxHp: c.vHpMax, emberAvailable: !G.used.ember_death,
        raging: G.used.rage && G.nextMult === 2 && G.nextN > 0, scene: 'field', log: c.log });
      if (!r) return null;
      G.cheated = true;
      if (r.ability === 'ember_heart') G.used.ember_death = 1;
      if (r.shedGear) G.shedGear = true;
      if (!r.held && G.held.back_from_the_brink) { G.nextMult = Math.max(G.nextMult || 0, 1.5); G.nextN = Math.max(G.nextN || 0, 3); c.log.push(c.vName + ' comes back ANGRY. (Back from the Brink)'); }
      return r.hp;
    } catch (e) { warn('fieldCheatDeath', e); return null; }
  }
  // fieldAllyDown(G, c): Lifeline holds a falling ally at 1; Last Rites
  // turns a fallen ally into two absorbed blows. Returns new ally HP or null.
  function fieldAllyDown(G, c) {
    try {
      if (!G) return null;
      if (G.held.lifeline && !G.used.lifeline_hold) {
        G.used.lifeline_hold = 1;
        c.log.push('The thread between ' + c.vName + ' and their ally pulls taut, and holds. (Lifeline)');
        try { Game.tele && Game.tele('godpath_lifeline', { who: G.vid, field: true }); } catch (e) { warn('tele lifeline v', e); }
        return 1;
      }
      if (G.held.last_rites) { G.absorb += 2; G.absorbCap = Math.max(G.absorbCap || 0, 999); c.log.push('Their ally\'s echo stands between ' + c.vName + ' and the next two blows. (Last Rites)'); }
      return null;
    } catch (e) { warn('fieldAllyDown', e); return null; }
  }

  // ===================== COMBAT HOOKS (called from game.js / buildarounds) =====================
  // Holders of a passive among the fighters on our side: the player (when
  // they hold it) and every living villager fighter that holds it.
  function sideHolders(game, f, id, except) {
    const out = [];
    try {
      const seen = new Set();
      const add = (fighter, isP) => {
        if (!fighter || fighter === except || !fighter.alive || fighter.fled || !(fighter.hp > 0)) return;
        const vid = isP ? game.villagerId : fighter.villagerId;
        const person = vid && game.vpOf(vid);
        if (!person || person.id !== vid || person.dead || seen.has(vid) || (!isP && vid === game.villagerId)) return;
        seen.add(vid);
        if (isP ? game.hasAbility && game.hasAbility(id) : game.npcHasAbility && game.npcHasAbility(vid, id)) out.push({ f: fighter, isP });
      };
      const p = game.tbFighter && game.tbFighter('p');
      add(p, true);
      for (const x of liveAllies(f)) add(x, false);
    } catch (e) { warn('sideHolders', e); }
    return out;
  }
  function allyWouldFall(game, t) {
    try {
      const f = game.tbfight; if (!f || !(t.hp <= 0)) return false;
      const saved = f.fighters.includes(t) && npcDeathRefusal(game, t.villagerId, { hp: t.hp, maxHp: t.maxHp || 100,
        emberAvailable: !t._emberUsed, raging: t._vRageRounds > 0, scene: 'battle', body: t });
      if (saved) {
        t.hp = saved.hp;
        if (saved.ability === 'ember_heart') t._emberUsed = true;
        if (saved.shedGear) { t.wbonus = 0; t.varmor = 0; }
        if (!saved.held && game.npcHasAbility(t.villagerId, 'back_from_the_brink')) t._nextStrikes = { mult: 1.5, n: 3, label: 'BACK FROM THE BRINK' };
        return true;
      }
      const hs = sideHolders(game, f, 'lifeline', t);
      if (!hs.length) return false;
      f._lifelineUsedBy = f._lifelineUsedBy || {};
      for (const h of hs) {
        const L = h.isP ? game.abilityLevel('lifeline') : 1;
        const max = L >= 3 ? 2 : 1;
        // Charges belong to a person, including after a body is reconstructed.
        const k = h.isP ? game.villagerId : h.f.villagerId;
        if ((f._lifelineUsedBy[k] || 0) >= max) continue;
        f._lifelineUsedBy[k] = (f._lifelineUsedBy[k] || 0) + 1;
        f._lifelineUsed = (f._lifelineUsed || 0) + 1;
        t.hp = L >= 2 ? Math.min(10, t.maxHp || 10) : 1;
        if (t.kind === 'player') game.state.scholar.health = t.hp;
        t.alive = true;
        noteCareRescue(game, h.isP ? game.villagerId : h.f.villagerId, wardPerson(game, t), 0, t.hp, t.maxHp, 'lifeline', 'battle');
        game.say(`${t.name} should be down. The thread between ${h.isP ? 'you' : h.f.name} and ${t.name} pulls taut, and holds: ${t.name} stays standing at ${t.hp} HP. (Lifeline)`);
        try { game.tele && game.tele('godpath_lifeline', { who: h.isP ? 'player' : h.f.villagerId, saved: t.villagerId || t.key }); } catch (e) { warn('tele lifeline', e); }
        return true;
      }
      return false;
    } catch (e) { warn('allyWouldFall', e); return false; }
  }
  function onAllyFell(game, t) {
    try {
      const f = game.tbfight; if (!f) return;
      for (const h of sideHolders(game, f, 'last_rites', t)) {
        if (h.isP) {
          const s = game.state.scholar;
          const hits = game.abilityLevel('last_rites') >= 2 ? 3 : 2;
          s._absorb = { hits: ((s._absorb && s._absorb.hits) || 0) + hits, cap: 999, label: 'Last Rites' };
          let grown = 0;
          try { for (const it of (game.wornKeepsakes ? game.wornKeepsakes() : [])) { if (game.keepsakeGrow(it, 2, 'last rites')) grown++; } } catch (e) { warn('last rites grow', e); }
          if (game.abilityLevel('last_rites') >= 3 && t._lastHitBy) { const k = game.tbFighter(t._lastHitBy); if (k) k.hesitate = Math.max(k.hesitate || 0, 1); }
          game.say(`${t.name} falls, but doesn't leave all at once. Their echo stands between you and the next ${hits} blows.${grown ? ` (${grown} keepsake${grown === 1 ? '' : 's'} +2 bond.)` : ''} (Last Rites)`);
        } else {
          const v = h.f;
          v._absorb = { hits: ((v._absorb && v._absorb.hits) || 0) + 2, cap: 999, label: 'Last Rites' };
          game.say(`${t.name} falls, but doesn't leave all at once. Their echo stands between ${v.name} and the next 2 blows. (Last Rites)`);
        }
      }
    } catch (e) { warn('onAllyFell', e); }
  }
  // absorbPlayerHit(game, final): returns the damage that still lands.
  function absorbPlayerHit(game, final) {
    try {
      const s = game.state.scholar;
      const ab = s._absorb;
      if (!ab || !(ab.hits > 0) || !(final > 0)) return final;
      const took = Math.min(final, ab.cap || final);
      ab.hits -= 1;
      if (ab.hits <= 0) delete s._absorb;
      game.say(`${ab.label} turns the blow aside (${took} absorbed${ab.hits > 0 ? `, ${ab.hits} left` : ''}).`);
      return final - took;
    } catch (e) { warn('absorbPlayerHit', e); return final; }
  }
  // Route once through the living linker's damage pipeline, before the
  // protected body's avoidance, armor, history and other hit effects.
  function aegisRedirect(game, t, final, sourceKey, opts) {
    try {
      const f = game.tbfight;
      if (!f || !(final > 0) || sourceKey === 'p' || f._aegisBusy) return final;
      // the linker: the player, or any villager fighter (parity)
      const cands = [game.tbFighter && game.tbFighter('p')].concat(liveAllies(f));
      for (const p of cands) {
        if (!p || !p.alive || p.fled || p === t || !p._aegis) continue;
        if (p._aegis.until < (f.round || 1)) { p._aegis = null; continue; }
        if (p._aegis.key !== t.key) continue;
        if (p.key === sourceKey) continue;
        const isP = p.key === 'p';
        game.say(`The light-thread snaps tight: the blow meant for ${t.name} lands on ${isP ? 'you' : p.name}. (Aegis Link)`);
        f._aegisBusy = true; // one redirect per blow: links never ping-pong
        let carried = 0;
        try { carried = game.tbDamage(p.key, final, 'aegis link', sourceKey || null, { ...opts, quiet: true, undodgeable: true }); } finally { f._aegisBusy = false; }
        noteWardCarry(game, f, p, t, carried, sourceKey, 'aegis_link');
        return 0;
      }
      return final;
    } catch (e) { warn('aegisRedirect', e); return final; }
  }
  // damageMult(game, target): godpath strike multipliers (read by BA.damageMult).
  function damageMult(game, target) {
    try {
      let m = 1;
      if (target && game.hasAbility && game.hasAbility('misdirection')) {
        const confused = (target.blind || 0) > 0 || (target._turncoatRounds || 0) > 0 || (target.hesitate || 0) > 0 || (target._frozen || 0) > 0 || (target._bound || 0) > 0;
        if (confused) m *= game.abilityLevel('misdirection') >= 2 ? 1.75 : 1.5;
      }
      return m;
    } catch (e) { warn('damageMult', e); return 1; }
  }
  function dodgeBonus(game) {
    try {
      if (!game.hasAbility || !game.hasAbility('prophecy')) return 0;
      const f = game.tbfight;
      if (!f || !((f._foresightUntil || 0) >= (f.round || 1))) return 0;
      return game.abilityLevel('prophecy') >= 2 ? 0.45 : 0.35;
    } catch (e) { warn('dodgeBonus', e); return 0; }
  }

  // ===================== WIRING (wraps; no game.js rewrites) =====================
  const methods = {
    godpathData() { return data(); },
    abilityPaths(idOrDef) { return abilityPaths(idOrDef); },
    recognizeClass(who) { return recognizeClass(who); },
    godpathClass(who) { return godpathClass(who); },
    noteCareRescue(actor, patient, before, after, maxHp, via, scene) { return noteCareRescue(this, actor, patient, before, after, maxHp, via, scene); },
    godpathDeedStatus(who, godId, day) { return godpathDeedStatus(who, godId, day); },
    godpathDeedHint(who) { return godpathDeedHint(who); },
    classLine(who) { return classLine(who); },
    pathLean(who, abilityId, opts) { return pathLean(who, abilityId, opts); },
    shapeOffers(choices, pool, who, opts) { return shapeOffers(choices, pool, who, opts); },
    kitSheet(cands, who, track, level) { return kitSheet(cands, who, track, level); },
    holderJobPaths(who) { return holderJobPaths(who); },
  };
  Object.assign(Game, methods);
  // Recognition rides the existing acquisition wires: every grant, pick or
  // synergy already calls these two checks.
  const _cp = Game.checkPlayerGodhoodAscension;
  if (typeof _cp === 'function') {
    Game.checkPlayerGodhoodAscension = function () {
      recognizeClass('player');
      return _cp.apply(this, arguments);
    };
  }
  const _cv = Game.checkVillagerGodhoodAscension;
  if (typeof _cv === 'function') {
    Game.checkVillagerGodhoodAscension = function (vid) {
      recognizeClass(vid);
      return _cv.apply(this, arguments);
    };
  }
  // DAWN CHECK: the day-80 gate opens on a day, not on an acquisition. Without
  // this a finished build waited for the next pick to be recognised.
  const _ed = Game.endDay;
  if (typeof _ed === 'function') {
    Game.endDay = function () {
      const r = _ed.apply(this, arguments);
      try {
        const careChanged = !this.over && this.state && finishCareWatch(this);
        if (!this.over && this.state && this.state.systemArrived) {
          this.checkPlayerGodhoodAscension();
          const v = this.state.village || {};
          for (const vid of (v.roster || [])) {
            if (vid === this.villagerId) continue;
            if ((((v.npcAbilities || {})[vid]) || []).length < 3) continue;
            this.checkVillagerGodhoodAscension(vid);
          }
        }
        // Persist settlement/ceremony after the core day-end save.
        if (careChanged) this.save();
      } catch (e) { warn('dawn check', e); }
      return r;
    };
  }
  // Fight lifecycle: per-fight state cleared; Rally Aura at the start.
  const _sc = Game.startCombat;
  if (typeof _sc === 'function') {
    Game.startCombat = function () {
      const s = this.state && this.state.scholar;
      if (s) { delete s._absorb; delete s._nextStrikes; }
      const r = _sc.apply(this, arguments);
      try {
        const f = this.tbfight;
        // RALLY AURA: whoever holds it, player or villager (parity).
        for (const h of (f ? sideHolders(this, f, 'rally_aura', null) : [])) {
          const L = h.isP ? this.abilityLevel('rally_aura') : 1;
          const rad = L >= 3 ? 5 : 3;
          const rounds = L >= 2 ? 3 : 2;
          const near = this.tbOtherAllies(h.f).filter(v => cheb(v, h.f) <= rad);
          for (const v of near) { v.rallyBuff = Math.max(v.rallyBuff || 0, rounds); v.rallied = Math.max(v.rallied || 0, rounds); }
          if (near.length) this.say(`People stand straighter near ${h.isP ? 'you' : h.f.name}: ${near.length} all${near.length === 1 ? 'y starts' : 'ies start'} this fight emboldened. (Rally Aura)`);
        }
      } catch (e) { warn('rally aura', e); }
      return r;
    };
  }
  const _rw = Game.tbRoundWrap;
  if (typeof _rw === 'function') {
    Game.tbRoundWrap = function (f) {
      const r = _rw.apply(this, arguments);
      try {
        if (f && f._wardenWall && (f.round || 1) >= f._wardenWall.expires) clearWardenWall(f);
        if (f && (f._foresightUntil || 0) >= (f.round || 1)) readIntents(f);
      } catch (e) { warn('round wrap', e); }
      return r;
    };
  }
  // Warden walls block EVERYONE (unlike monster terrain, which they ignore).
  for (const name of ['tbBlocked', 'tbBlockedFor']) {
    const orig = Game[name];
    if (typeof orig !== 'function') continue;
    Game[name] = function () {
      const a = arguments;
      const x = name === 'tbBlocked' ? a[0] : a[1], y = name === 'tbBlocked' ? a[1] : a[2];
      if (wardenWallAt(x, y)) return true;
      return orig.apply(this, a);
    };
  }
  // Cheating death: Ember Heart (food pays), then Back from the Brink.
  const _md = Game.maybeCheatDeath;
  if (typeof _md === 'function') {
    Game.maybeCheatDeath = function (cause) {
      const s = this.state.scholar;
      if (s.health <= 0) syncPlayerSurvivalUses();
      let cheated = false, refusal = null;
      const fatal = s.health <= 0, windBefore = [s.secondWindDay, s.secondWindUses], moltBefore = [s.moltWeek, s.moltUses];
      try {
        const f = this.tbfight;
        if (f && !f.over && s.health <= 0 && this.hasAbility('ember_heart') && !f._emberUsed) {
          const cost = this.abilityLevel('ember_heart') >= 3 ? 450 : 600;
          if ((s.kcal || 0) >= cost) {
            f._emberUsed = true;
            s.kcal -= cost;
            s.health = Math.max(1, Math.ceil(this.maxHealth() * (this.abilityLevel('ember_heart') >= 2 ? 0.3 : 0.2)));
            this.say(`EMBER HEART: the blow lands, and the furnace eats it. ${cost} kcal burn in one breath and you stand back up at ${s.health} HP.`);
            try { this.tele && this.tele('godpath_ember', { kcal: cost }); } catch (e) { warn('tele ember', e); }
            cheated = true; refusal = 'ember_heart';
          }
        }
      } catch (e) { warn('ember heart', e); }
      if (!cheated) cheated = _md.apply(this, arguments);
      if (cheated && s.health > 0) {
        if (!refusal && (s.secondWindDay !== windBefore[0] || s.secondWindUses !== windBefore[1])) refusal = 'second_wind';
        if (!refusal && (s.moltWeek !== moltBefore[0] || s.moltUses !== moltBefore[1])) refusal = 'molt';
        if (fatal && refusal) {
          if (refusal !== 'ember_heart') saveSurvivalUses('player', survivalUses('player'));
          const v = this.state.village; (v.health || (v.health = {}))[this.villagerId] = s.health;
          recordDeathRefusal('player', refusal, this.tbfight && !this.tbfight.over ? 'battle' : 'world');
        }
        try {
          if (this.hasAbility('back_from_the_brink')) {
            const L = this.abilityLevel('back_from_the_brink');
            s._nextStrikes = { mult: L >= 2 ? 1.75 : 1.5, n: L >= 3 ? 5 : 3, label: 'BACK FROM THE BRINK' };
            this.say(`You come back ANGRY. The next ${s._nextStrikes.n} strikes hit ${Math.round((s._nextStrikes.mult - 1) * 100)}% harder. (Back from the Brink)`);
          }
        } catch (e) { warn('brink', e); }
      }
      return cheated;
    };
  }

  const _survivalUse = Game.useAbility;
  Game.useAbility = function (abilityId) {
    if (abilityId === 'molt') syncPlayerSurvivalUses();
    const result = _survivalUse.apply(this, arguments);
    if (result === true && abilityId === 'molt') saveSurvivalUses('player', survivalUses('player'));
    return result;
  };

  S.Godpath = {
    noteWardCarry, finishWardRescues, finishFieldWardRescue,
    beginApexHunt, observeApexHunt, finishApexHunt, finishFieldApexHunt, finishTacticalEscape, finishFieldEscape,
    data, abilityPaths, classify, holderMagicIds, recognizeClass, godpathClass, classLine,
    pathLean, shapeOffers, kitSheet, holderJobPaths, sheetRng, VERBS, registerVerbs, wardenWallAt,
    npcDeathRefusal, allyWouldFall, onAllyFell, absorbPlayerHit, aegisRedirect, damageMult, dodgeBonus,
    villagerCast, villagerStrikeMult, absorbVillagerHit,
    fieldBegin, fieldAct, fieldStrike, fieldIncoming, fieldAllyShare, fieldCheatDeath, fieldAllyDown, fieldEvade, villagerPowerMult,
  };
  // VILLAGERS CAST (parity 2026-10-14): after the hand-written villager
  // abilities (tbVillagerAbility, pantry-tier gated in foodPower.js) find
  // nothing to do, the subclass verbs get their turn. A free verb (no turn
  // cost) lets the villager still act.
  const _tva = Game.tbVillagerAbility;
  if (typeof _tva === 'function') {
    Game.tbVillagerAbility = function (v) {
      const r = _tva.apply(this, arguments);
      if (r) return r;
      const c = villagerCast(this, v);
      if (c === 'free') { const c2 = villagerCast(this, v); return c2 === true; }
      return c === true;
    };
  }
  // The data loads after the scripts (Game.init): register once it's there.
  const _init = Game.init;
  if (typeof _init === 'function') {
    Game.init = async function () {
      const r = await _init.apply(this, arguments);
      try { registerVerbs(); } catch (e) { warn('registerVerbs', e); }
      return r;
    };
  }
  if (Game.data && Game.data.abilities) { try { registerVerbs(); } catch (e) { warn('registerVerbs (eager)', e); } }
})();
