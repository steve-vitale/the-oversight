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
//   - classLine(who) -> "Berserker of the One-Person Army" or null (only once recognised)
//   - pathLean(who, abilityId, opts) -> lean score (opts.knows(id) gates unknown abilities to 0; never reveals them)
//   - shapeOffers(choices, pool, who) -> offers with >=1 on the recognised path and distinct roles where possible
//   - registerVerbs() -> registers a generic impl + precheck for every data action with `do` (verbs: aegis, wall, pull, push, pack, heal, blink, swap, foresee, broadcast, command, empower, guard, bribe, feed_camp)
//   - allyWouldFall(game, t) / onAllyFell(game, t) -> Lifeline / Last Rites hooks (tbDamage)
//   - absorbPlayerHit(game, dmg) / aegisRedirect(game, t, dmg, src) -> Coin Guard / Last Rites absorbs, Aegis Link redirect (tbDamage)
//   - damageMult(game, target) / dodgeBonus(game) -> Misdirection / Prophecy (buildarounds damageMult / dodgeBonus)
// consumes:
//   - Game.data.godpaths, Game.data.abilities, state.scholar.abilities, state.village.npcAbilities
//   - useAbility, tbFighter, tbCanOccupy, tbBlocked, tbDamage, tbVillagerTurn, addHealth, npcNeeds, keepsakeGrow, wornKeepsakes
// rules:
//   - one_source: an ability's path is `def.path` (+ `def.alsoPath`); nothing reads the retired `paths` array (code: abilityPaths)
//   - same_function: recognition runs the same classify() for the player and every villager (code: recognizeClass)
//   - if_you_dont_know_it_doesnt_show: classLine is null until the class is recognised (code: classLine)
//   - knowledge_gated_lean: pathLean scores only abilities the caller says the holder knows; an unknown ability scores 0 (code: pathLean)
//   - control_changes_the_board: warden/trickster/dealer verbs move fighters or raise terrain on the real grid (code: VERBS.wall, push, pull, swap, bribe)
//   - food_powered: every verb's cost is in the action's data (kcal), paid by useAbility before dispatch (code: registerVerbs)
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

  // shapeOffers(choices, pool, who): choices are ability defs (or {id}) in
  // the offer's own order; pool is the remaining candidates (defs), in
  // preference order. Guarantees >=1 offer on the recognised path when the
  // pool has one, then swaps duplicate roles for distinct ones where it can.
  function shapeOffers(choices, pool, who) {
    try {
      const out = choices.slice();
      const rest = (pool || []).filter(p => !out.some(o => o.id === p.id));
      // The lean follows the recognised class; before recognition it
      // follows an EMERGING lean (2+ magic abilities of one path, strictly
      // leading) so a class can actually form.
      let rec = godpathClass(who || 'player');
      if (!rec || rec.lapsed) rec = emergingPath(holderMagicIds(who || 'player'));
      const pathOf = (o) => (defOf(o.id) || {}).path;
      const roleOf = (o) => (defOf(o.id) || {}).role;
      if (rec && !rec.lapsed && out.length && !out.some(o => pathOf(o) === rec.path)) {
        const i = rest.findIndex(p => pathOf(p) === rec.path);
        if (i >= 0) { out[out.length - 1] = rest.splice(i, 1)[0]; out._leaned = true; }
      }
      // distinct roles: replace a duplicate (never the on-path pick) with the
      // first candidate whose role is new to the sheet.
      for (let k = out.length - 1; k >= 0; k--) {
        const r = roleOf(out[k]);
        const dup = out.some((o, j) => j !== k && roleOf(o) === r);
        if (!dup) continue;
        if (rec && pathOf(out[k]) === rec.path && out.filter(o => pathOf(o) === rec.path).length === 1) continue;
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

  const VERBS = {
    aegis(a, ab, target) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      let t = target ? Game.tbFighter(target) : null;
      const allies = liveAllies(f);
      if (!t || allies.indexOf(t) < 0) t = allies.slice().sort((x, y) => (x.hp / (x.maxHp || 1)) - (y.hp / (y.maxHp || 1)))[0];
      if (!t) { Game.say('No ally to link to. (Aegis Link needs someone beside you in the fight.)'); return false; }
      const rounds = (a.rounds || 3) + (lvl(ab.id) >= 2 ? 1 : 0);
      p._aegis = { key: t.key, until: (f.round || 1) + rounds };
      Game.say(`A thread of light runs from your chest to ${t.name}'s. For ${rounds} rounds, what is meant for them comes to you. (Aegis Link)`);
      return true;
    },
    wall(a, ab) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const m = nearest(f, p);
      if (!m) { Game.say('Nothing to wall off.'); return false; }
      let dx = Math.sign(m.mx - p.mx), dy = Math.sign(m.my - p.my);
      if (!dx && !dy) dx = 1;
      const px = -dy, py = dx; // perpendicular
      const len = lvl(ab.id) >= 2 ? 5 : (a.len || 3);
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
      if (!cells.length) { Game.say('There\'s no open ground to raise. (Raise Earth: every tile that way is taken.)'); return false; }
      if (f._wardenWall) clearWardenWall(f);
      f._wardenWall = { cells, expires: (f.round || 1) + (a.rounds || 3) };
      Game.say(`You slam your palm down and the earth STANDS UP: a wall of ${cells.length} tile${cells.length > 1 ? 's' : ''} between you and ${nm(m)}. Nothing walks through it for ${a.rounds || 3} rounds. (Raise Earth)`);
      refresh();
      return true;
    },
    pull(a, ab) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const radius = (a.radius || 4) + (lvl(ab.id) >= 2 ? 1 : 0);
      const mons = liveMons(f).filter(m => cheb(m, p) <= radius && cheb(m, p) > 1).sort((x, y) => cheb(x, p) - cheb(y, p));
      if (!mons.length) { Game.say('Nothing in reach to pull. (Gravity Well: radius ' + radius + '.)'); return false; }
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
        if (cheb(m, p) <= 1) { m.hesitate = Math.max(m.hesitate || 0, 1); if (lvl(ab.id) >= 3) m._frozen = Math.max(m._frozen || 0, 1); arrived++; }
      }
      Game.say(`You become the low point of the world. ${moved} monster${moved === 1 ? '' : 's'} slide toward you${arrived ? `; ${arrived} land${arrived === 1 ? 's' : ''} at your feet, staggered` : ''}. (Gravity Well)`);
      refresh();
      return moved > 0 || arrived > 0;
    },
    push(a, ab) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const radius = (a.radius || 2) + (lvl(ab.id) >= 2 ? 1 : 0);
      const mons = liveMons(f).filter(m => cheb(m, p) <= radius).sort((x, y) => cheb(x, p) - cheb(y, p));
      if (!mons.length) { Game.say('Nothing close enough to throw. (Landslide: radius ' + radius + '.)'); return false; }
      const slam = lvl(ab.id) >= 3 ? [22, 30] : (a.slam || [14, 22]);
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
          Game.tbDamage(m.key, dmg, 'landslide', 'p', { quiet: true });
          m.stunned = Math.max(m.stunned || 0, 1);
          slams++;
          if (Game.tbEndCheck && Game.tbEndCheck()) return true;
        }
      }
      Game.say(`The ground heaves outward from you. ${mons.length} thrown${slams ? `, ${slams} slammed` : ''}. (Landslide)`);
      refresh();
      return true;
    },
    pack(a, ab, target) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const m = pickMonster(f, p, target);
      if (!m) { Game.say('No prey for the pack.'); return false; }
      const pin = (a.pin || 2) + (lvl(ab.id) >= 2 ? 1 : 0);
      const birds = (m._birdStrike || 0) > 0;
      const rounds = birds ? (a.rounds || 3) * 2 : (a.rounds || 3);
      m._frozen = Math.max(m._frozen || 0, pin);
      m._birdStrike = (m._birdStrike || 0) + rounds;
      Game.say(`You whistle once. They were listening: wings, teeth, claws, all on ${nm(m)}. It's pinned for ${pin} rounds and harried for ${rounds}${birds ? ' (the birds were already on it: twice as long)' : ''}. (Pack Hunt)`);
      return true;
    },
    heal(a, ab, target) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const reach = lvl(ab.id) >= 3 ? 2 : 1;
      const amt = lvl(ab.id) >= 2 ? [16, 24] : (a.amount || [12, 18]);
      let base = rint(amt[0], amt[1]);
      try { base = Math.round(Game.modTarget('healing.amount', base, {})); } catch (e) { warn('heal mod', e); }
      let t = target ? Game.tbFighter(target) : null;
      const allies = liveAllies(f).filter(x => cheb(x, p) <= reach && x.hp < x.maxHp);
      if (!t || (t !== p && allies.indexOf(t) < 0)) {
        const pFrac = p.hp / (p.maxHp || 100);
        const worst = allies.slice().sort((x, y) => (x.hp / x.maxHp) - (y.hp / y.maxHp))[0];
        t = (worst && worst.hp / worst.maxHp < pFrac) ? worst : p;
      }
      if (t === p) {
        if (p.hp >= p.maxHp) { Game.say('Nothing to mend. (Mending Hands)'); return false; }
        Game.addHealth(base); // counts as a heal (build-around hooks)
        Game.say(`You press your own wound and the System knits it: +${base} HP. (Mending Hands)`);
        return true;
      }
      const before = t.hp;
      t.hp = Math.min(t.maxHp, t.hp + base);
      const healed = t.hp - before;
      try { const BA = S.buildarounds; if (BA && BA.onHeal) BA.onHeal(Game, t.key, healed, Math.max(0, base - healed)); } catch (e) { warn('onHeal', e); }
      Game.say(`Your hands find ${t.name}'s wound and it closes under them: +${healed} HP. (Mending Hands)`);
      return true;
    },
    blink(a, ab, target) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const range = (a.range || 3) + (lvl(ab.id) >= 2 ? 1 : 0);
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
      if (!dest) { Game.say('Nowhere to go. (Blink: no open tile in range.)'); return false; }
      const dist = cheb(p, { mx: dest.x, my: dest.y });
      p.mx = dest.x; p.my = dest.y;
      try { Game.state.scholar.mx = dest.x; Game.state.scholar.my = dest.y; } catch (e) { warn('blink sync', e); }
      try { const BA = S.buildarounds; if (BA && BA.onMove) BA.onMove(Game, dist); } catch (e) { warn('onMove', e); }
      Game.say(`You are somewhere else: ${dist} tile${dist === 1 ? '' : 's'} away, between one heartbeat and the next. (Blink)`);
      refresh();
      return true;
    },
    swap(a, ab, target) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const range = (a.range || 3) + (lvl(ab.id) >= 2 ? 1 : 0);
      const m = pickMonster(f, p, target, range);
      if (!m) { Game.say('Nothing in reach to trade places with. (Switcheroo: ' + range + ' tiles.)'); return false; }
      if ((Game.fighterSize ? Game.fighterSize(m) : 1) > 1) { Game.say(`${nm(m)} is too big to swap with. (Switcheroo: size-1 only.)`); return false; }
      const px = p.mx, py = p.my;
      p.mx = m.mx; p.my = m.my; m.mx = px; m.my = py;
      try { Game.state.scholar.mx = p.mx; Game.state.scholar.my = p.my; } catch (e) { warn('swap sync', e); }
      const fizzled = !!m.telegraph;
      m.telegraph = null;
      m.hesitate = Math.max(m.hesitate || 0, 1);
      Game.say(`Snap: you're where ${nm(m)} was, and it's where you were.${fizzled ? ' Its wind-up was aimed at you. It just hit empty air.' : ''} It hesitates. (Switcheroo)`);
      refresh();
      return true;
    },
    foresee(a, ab) {
      const f = Game.tbfight;
      const rounds = (a.rounds || 3) + (lvl(ab.id) >= 2 ? 1 : 0);
      f._foresightUntil = (f.round || 1) + rounds - 1;
      Game.say(`The fight goes thin, like a rerun. For ${rounds} rounds you see a breath ahead. (Foresight)`);
      readIntents(f);
      return true;
    },
    broadcast(a, ab) {
      const f = Game.tbfight, s = Game.state.scholar;
      const BA = S.buildarounds;
      let mult = 1;
      try { if (BA && BA.socialMult) mult = BA.socialMult(Game) || 1; } catch (e) { warn('socialMult', e); }
      const fans = (a.fans || 2) + (lvl(ab.id) >= 2 ? 1 : 0);
      s.fans = Math.min(50, (s.fans || 0) + fans);
      const rounds = Math.min(5, Math.round(((a.rally || 2) + (lvl(ab.id) >= 2 ? 1 : 0)) * mult));
      const allies = liveAllies(f);
      for (const v of allies) v.rallyBuff = Math.max(v.rallyBuff || 0, rounds);
      if (lvl(ab.id) >= 3) for (const m of liveMons(f)) m.hesitate = Math.max(m.hesitate || 0, 1);
      Game.sysSay && Game.sysSay(`📺 "WE'RE LIVE!" +${fans} fans (${s.fans} watching).${allies.length ? ` ${allies.length} all${allies.length === 1 ? 'y hears' : 'ies hear'} your voice: emboldened for ${rounds} rounds.` : ''}${mult > 1 ? ` (Crowd Favorite: x${mult.toFixed(1)})` : ''} (Live Broadcast)`);
      return true;
    },
    command(a, ab) {
      const f = Game.tbfight;
      const allies = liveAllies(f);
      if (!allies.length) { Game.say('No one to command. (The Crowd Moves needs allies in the fight.)'); return false; }
      Game.say(`You say one word. Everyone hears "NOW." (The Crowd Moves: ${allies.length} extra turn${allies.length === 1 ? '' : 's'}.)`);
      for (const v of allies) {
        if (!v.alive || v.fled) continue;
        try { Game.tbVillagerTurn(v); } catch (e) { warn('command turn', e); }
        if (lvl(ab.id) >= 2 && v.alive) v.hp = Math.min(v.maxHp, v.hp + 5);
        if (Game.tbEndCheck && Game.tbEndCheck()) return true;
      }
      return true;
    },
    empower(a, ab) {
      const s = Game.state.scholar;
      const mult = lvl(ab.id) >= 2 ? 1.8 : (a.mult || 1.6);
      const n = lvl(ab.id) >= 3 ? 3 : (a.strikes || 2);
      s._nextStrikes = { mult, n, label: (ab.name || 'Stoke').toUpperCase() };
      Game.say(`You throw calories on the fire. The next ${n} strikes hit ${Math.round((mult - 1) * 100)}% harder. (${ab.name})`);
      return true;
    },
    guard(a, ab) {
      const s = Game.state.scholar;
      const hits = (a.hits || 3) + (lvl(ab.id) >= 2 ? 1 : 0);
      const cap = lvl(ab.id) >= 3 ? 25 : (a.cap || 15);
      s._absorb = { hits, cap, label: ab.name || 'Coin Guard' };
      Game.say(`${hits} coins of hard light lift from your pack and orbit you. Each one will stop a blow (up to ${cap}). (${ab.name})`);
      return true;
    },
    bribe(a, ab, target) {
      const f = Game.tbfight, p = Game.tbFighter('p');
      const m = pickMonster(f, p, target);
      if (!m) { Game.say('No one to pay off.'); return false; }
      if (isTitanish(m)) { Game.say(`${nm(m)} looks at the food and then at you. The big ones don't haggle. (Bribe: not titans.)`); return false; }
      const hes = (a.hesitate || 2) + (lvl(ab.id) >= 3 ? 1 : 0);
      m.hesitate = Math.max(m.hesitate || 0, hes);
      let dx = Math.sign(m.mx - p.mx), dy = Math.sign(m.my - p.my);
      if (!dx && !dy) dx = 1;
      let back = 0;
      for (let i = 0; i < (a.back || 2); i++) {
        if (!Game.tbCanOccupy(m, m.mx + dx, m.my + dy)) break;
        m.mx += dx; m.my += dy; back++;
      }
      let turned = '';
      if (Game.hasAbility('sweetener')) {
        const other = liveMons(f).filter(o => o !== m).sort((x, y) => cheb(x, m) - cheb(y, m))[0];
        if (other) {
          const r = lvl('sweetener') >= 2 ? 3 : 2;
          m._turncoatTarget = other.key; m._turncoatRounds = r;
          turned = ` And it's on your side now: for ${r} rounds it goes for ${nm(other)}. (Sweetener)`;
        }
      }
      Game.say(`You hold out the food. ${nm(m)} takes it, backs off ${back} tile${back === 1 ? '' : 's'}, and reconsiders its life for ${hes} rounds.${turned} (Bribe)`);
      try { Game.tele && Game.tele('godpath_bribe', { monster: (m.mdef || {}).id || m.monsterId, turned: !!turned }); } catch (e) { warn('tele bribe', e); }
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

  // ===================== COMBAT HOOKS (called from game.js / buildarounds) =====================
  function allyWouldFall(game, t) {
    try {
      if (!game.hasAbility || !game.hasAbility('lifeline')) return false;
      const f = game.tbfight; if (!f) return false;
      const max = game.abilityLevel('lifeline') >= 3 ? 2 : 1;
      if ((f._lifelineUsed || 0) >= max) return false;
      f._lifelineUsed = (f._lifelineUsed || 0) + 1;
      t.hp = game.abilityLevel('lifeline') >= 2 ? Math.min(10, t.maxHp || 10) : 1;
      game.say(`${t.name} should be down. The thread between you pulls taut, and holds: ${t.name} stays standing at ${t.hp} HP. (Lifeline)`);
      try { game.tele && game.tele('godpath_lifeline', { who: t.villagerId || t.key }); } catch (e) { warn('tele lifeline', e); }
      return true;
    } catch (e) { warn('allyWouldFall', e); return false; }
  }
  function onAllyFell(game, t) {
    try {
      if (!game.hasAbility || !game.hasAbility('last_rites')) return;
      const s = game.state.scholar;
      const hits = game.abilityLevel('last_rites') >= 2 ? 3 : 2;
      s._absorb = { hits: ((s._absorb && s._absorb.hits) || 0) + hits, cap: 999, label: 'Last Rites' };
      let grown = 0;
      try { for (const it of (game.wornKeepsakes ? game.wornKeepsakes() : [])) { if (game.keepsakeGrow(it, 2, 'last rites')) grown++; } } catch (e) { warn('last rites grow', e); }
      if (game.abilityLevel('last_rites') >= 3 && t._lastHitBy) { const k = game.tbFighter(t._lastHitBy); if (k) k.hesitate = Math.max(k.hesitate || 0, 1); }
      game.say(`${t.name} falls, but doesn't leave all at once. Their echo stands between you and the next ${hits} blows.${grown ? ` (${grown} keepsake${grown === 1 ? '' : 's'} +2 bond.)` : ''} (Last Rites)`);
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
  // aegisRedirect(game, t, final): a linked ally's hit lands on the player.
  // Returns the damage the ally still takes.
  function aegisRedirect(game, t, final, sourceKey) {
    try {
      const f = game.tbfight, p = game.tbFighter && game.tbFighter('p');
      if (!f || !p || !p.alive || !p._aegis || !(final > 0) || sourceKey === 'p') return final;
      if (p._aegis.until < (f.round || 1)) { p._aegis = null; return final; }
      if (p._aegis.key !== t.key) return final;
      game.say(`The light-thread snaps tight: the blow meant for ${t.name} lands on you. (Aegis Link)`);
      game.tbDamage('p', final, 'aegis link', sourceKey || null, { quiet: true, undodgeable: true });
      game.state.scholar.fightDamageTaken = (game.state.scholar.fightDamageTaken || 0);
      return 0;
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
    classLine(who) { return classLine(who); },
    pathLean(who, abilityId, opts) { return pathLean(who, abilityId, opts); },
    shapeOffers(choices, pool, who) { return shapeOffers(choices, pool, who); },
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
        if (!this.over && this.state && this.state.systemArrived) {
          this.checkPlayerGodhoodAscension();
          const v = this.state.village || {};
          for (const vid of (v.roster || [])) {
            if (vid === this.villagerId) continue;
            if ((((v.npcAbilities || {})[vid]) || []).length < 3) continue;
            this.checkVillagerGodhoodAscension(vid);
          }
        }
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
        if (f && this.hasAbility('rally_aura')) {
          const p = this.tbFighter('p');
          const rad = this.abilityLevel('rally_aura') >= 3 ? 5 : 3;
          const rounds = this.abilityLevel('rally_aura') >= 2 ? 3 : 2;
          const near = liveAllies(f).filter(v => p && cheb(v, p) <= rad);
          for (const v of near) { v.rallyBuff = Math.max(v.rallyBuff || 0, rounds); v.rallied = Math.max(v.rallied || 0, rounds); }
          if (near.length) this.say(`People stand straighter near you: ${near.length} all${near.length === 1 ? 'y starts' : 'ies start'} this fight emboldened. (Rally Aura)`);
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
      let cheated = false;
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
            cheated = true;
          }
        }
      } catch (e) { warn('ember heart', e); }
      if (!cheated) cheated = _md.apply(this, arguments);
      if (cheated && s.health > 0) {
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

  S.Godpath = {
    data, abilityPaths, classify, holderMagicIds, recognizeClass, godpathClass, classLine,
    pathLean, shapeOffers, VERBS, registerVerbs, wardenWallAt,
    allyWouldFall, onAllyFell, absorbPlayerHit, aegisRedirect, damageMult, dodgeBonus,
  };
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
