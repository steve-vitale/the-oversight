// @ontology
// system: lifeseed
// description: Procedural foundation. Procedural depth before more systems.
// provides:
//   - genCharacter(opts)
//   - genLifeseed()
//   - genPersonalPool(vid)
//   - lifeseedKin(vid)
//   - lifeseedText(vid)
//   - resolveKeepsakeText(item)
//   - recordLifeseedEvent(vid, kind)
// rules:
//   - (none documented)
//   - lived_events_written: true (code: lifeseed.js — recordLifeseedEvent writes vp.lifeseed.lived; convoDrift reads it)
// consumes:
//   - state.seed
// ============ LIFESEEDS: the procedural foundation ============
// Steve's rule (2026-10-04): procedural depth BEFORE more systems. Every
// character gets a lifeseed — a region anchor, named people, named places,
// events, skill origins, a wound, a want. Backstories, keepsakes, flashbacks
// and motives all read from the SAME seed. That's the coherence guarantee:
// if she's from coastal Maine, her keepsake isn't a desert rock and her
// flashback isn't set in Arizona.
//
// Sections:
//  1. region anchor (from origin tags — the origin is authoritative)
//  2. people (culture-fitting names, never the character's own first name)
//  3. places, events, skill origins, wound, want
//  4. texture paragraph woven into the backstory
//  5. keepsake resolution ({kin}/{place}/{first} filled from the seed)
//  6. NPC keepsake observation line
//
// Self-attaching module: Object.assign(Game, methods) + wraps genCharacter.
// Load after game.js. Data: src/data/lifeseeds.json (added to the fetch list).

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];

  const methods = {

    // ---------- 1. REGION ANCHOR ----------
    // The origin is authoritative: match its tags to a region. No tag match
    // (foreign origins, free text) -> "far from here", still coherent.
    lifeseedRegion(char) {
      const LS = this.data.lifeseeds || {};
      const regions = LS.regions || [];
      const tags = (char.originTags || []).map(t => String(t).toLowerCase());
      const tagWords = tags.map(t => new Set(t.split(/[^a-z]+/).filter(Boolean)));
      for (const r of regions) {
        if (r.id === 'far_away') continue;
        const mts = (r.matchTags || []).map(m => String(m).toLowerCase());
        // word-set match: every word of the matchTag must appear in some tag's
        // words. ("coast" must NOT match "west coast" — that was a real bug.)
        const hit = mts.some(mt => {
          const mw = mt.split(/[^a-z]+/).filter(Boolean);
          return tagWords.some(tw => mw.every(w => tw.has(w)));
        });
        if (hit) return r;
      }
      return regions.find(r => r.id === 'far_away') || {
        id: 'far_away', label: 'far from here', land: 'streets you still dream about',
        towns: ['the old city'], workplaces: ['the workshop'],
      };
    },

    // ---------- 2. PEOPLE ----------
    // Culture-fitting names via the same generator as the character — a
    // brother from the same origin sounds like he's from the same place.
    // Never the character's own first name.
    lifeseedKinName(char, usedFirsts, rel) {
      const ownFirst = char.name.split(' ')[0];
      // relations carry gender: a grandfather isn't named Hana.
      // (background audit 2026-10-11, sense-read: "Larry — Joshua's niece"
      // — niece/nephew/older/younger siblings weren't gender-filtered.)
      const fem = ['mother', 'sister', 'daughter', 'grandmother', 'aunt', 'grandchildren', 'niece', 'older sister', 'younger sister'];
      const masc = ['father', 'brother', 'son', 'grandfather', 'uncle', 'nephew', 'older brother', 'younger brother'];
      const want = fem.includes(rel) ? 'f' : masc.includes(rel) ? 'm' : null;
      for (let g = 0; g < 40; g++) {
        try {
          const nr = this.genNameForOrigin(char.homeRegion, false);
          const nm = nr && nr.name ? nr.name : null;
          if (!nm) continue;
          const f = nm.split(' ')[0];
          if (f === ownFirst || (usedFirsts || []).includes(f)) continue;
          if (want && this.guessNameGender) {
            const gg = this.guessNameGender(f, nr.cultureId);
            if (gg !== want && gg !== 'u') continue;
          }
          return nm;
        } catch (e) { /* fall through */ }
      }
      return want === 'f' ? 'Mary Ellis' : 'James Carter';
    },

    // ---------- 3. THE SEED ----------
    genLifeseed(char) {
      const LS = this.data.lifeseeds || {};
      const region = this.lifeseedRegion(char);
      const first = char.name.split(' ')[0];
      const town = pick(region.towns || ['the old town']);
      const workplace = pick(region.workplaces || ['the shop']);
      const usedFirsts = [];
      // STREETS (background audit 2026-10-11): {street} was hardcoded to
      // '5th' — every villager's childhood street was 5th street. Vary it.
      const street = pick(['5th', 'Main', 'Oak', 'Elm', 'Maple', 'Cedar', 'Park', 'Hill', 'Mill', 'Church', 'Bridge', 'Depot']);
      // places first: kin fates can reference them ({place}).
      // KIND VARIETY (background audit 2026-10-11): the old code took the
      // first 2 kinds (home, cache) for EVERY villager — 12 names shared
      // across the whole cast, so "the hunting cabin" recurred verbatim.
      // Draw 2 random kinds from the full pool (14 kinds); kind-specific
      // lookups (grave, woods, ...) resolve for real now.
      const places = [];
      const kindPool = [...(LS.places || [])];
      for (let i = kindPool.length - 1; i > 0; i--) {
        const j = Math.floor(R() * (i + 1));
        [kindPool[i], kindPool[j]] = [kindPool[j], kindPool[i]];
      }
      // PLACE-NAME UNIQUENESS (background audit 2026-10-11): prefer place
      // names unused this expedition, so two villagers never share "the
      // lockbox under the porch" verbatim. (Raw templates dedup — names
      // with {first} are already unique after fill.)
      const _up = this._usedPlaces || (this._usedPlaces = new Set());
      for (const pk of kindPool) {
        if (places.length >= 2) break;
        const namePool = pk.names || ['somewhere'];
        const freshNames = namePool.filter(n => !_up.has(n));
        const rawName = pick(freshNames.length ? freshNames : namePool);
        _up.add(rawName);
        places.push({
          kind: pk.kind,
          name: String(rawName)
            .replaceAll('{first}', first).replaceAll('{town}', town)
            .replaceAll('{workplace}', workplace).replaceAll('{street}', street),
        });
      }
      const placeName = (kind) => {
        const p = places.find(x => x.kind === kind) || places[0];
        return p ? p.name : 'somewhere';
      };
      // ARTICLE COLLAPSE (background audit 2026-10-11): every workplace name
      // carries its own 'the' ("the grain elevator"), so templates saying
      // "the {workplace}" produced "the the grain elevator". Collapse the
      // doubled article at fill time — robust to future article-less names.
      // Same for "the {place}" (nearly all place names start with 'the').
      const noThe = (s) => String(s || '').replace(/^the\s+/i, '');
      // kinName is defined before takeKin (it reads `people` lazily) so
      // fillBasic can resolve {kin} everywhere — wounds, events, and place
      // names leaked raw "{kin}" before (background audit 2026-10-11).
      const kinName = (rel) => {
        const p = people.find(x => x.relation === rel) || people[0];
        return p ? p.name.split(' ')[0] : 'someone';
      };
      const fillBasic = (t) => String(t)
        .replaceAll('{first}', first)
        .replaceAll('{town}', town)
        .replaceAll('the {workplace}', 'the ' + noThe(workplace))
        .replaceAll('{workplace}', workplace)
        .replaceAll('the {place}', 'the ' + noThe(placeName()))
        .replaceAll('{place}', placeName())
        .replaceAll('{street}', street)
        .replaceAll('{kin}', kinName());

      // people: cover the keepsake kin first (so flashbacks never name a
      // stranger), then fill out to 3 with distinct relations.
      const kinPool = [...(LS.kin || [])];
      const usedRel = new Set();
      const people = [];
      const needRels = [];
      for (const id of (char.items || [])) {
        const def = (this.data.items || []).find(i => i.id === id);
        const rel = def && def.kin;
        if (def && def.class === 'sentimental' && rel && rel !== 'none' && !needRels.includes(rel)) needRels.push(rel);
      }
      const takeKin = (rel) => {
        if (usedRel.has(rel)) return;
        usedRel.add(rel);
        const tmpl = kinPool.find(k => k.relation === rel) || pick(kinPool);
        const nm = this.lifeseedKinName(char, usedFirsts, tmpl.relation);
        usedFirsts.push(nm.split(' ')[0]);
        people.push({ name: nm, relation: tmpl.relation, fate: fillBasic(pick(tmpl.fates || ['is somewhere out there'])) });
      };
      for (const rel of needRels) takeKin(rel);
      let guard = 0;
      while (people.length < 3 && guard++ < 40) {
        const cands = kinPool.filter(k => !usedRel.has(k.relation));
        if (!cands.length) break;
        takeKin(pick(cands).relation);
      }

      // places: chosen above (kin fates reference them).
      // Place names can carry {kin} ("{kin}'s garage") — the people now
      // exist, so resolve them (background audit 2026-10-11).
      for (const pl of places) pl.name = String(pl.name).replaceAll('{kin}', kinName());

      // skill origins: 2, grounded in people and places.
      const soKeys = Object.keys(LS.skillOrigins || {});
      const skillOrigins = {};
      for (let i = 0; i < 2 && soKeys.length; i++) {
        const k = soKeys.splice(Math.floor(R() * soKeys.length), 1)[0];
        skillOrigins[k] = fillBasic(pick(LS.skillOrigins[k]));
      }

      // PRONOUN TRUTH (background audit 2026-10-11): two templates speak
      // about the villager in plain English — "themself" in a wound and
      // "than they do" in a want — which contradicts he/she villagers.
      // Resolve to their actual pronoun here; the plural-they templates
      // (arguing, tools, boats) are genuinely plural and stay as-is.
      const pro = char.pro || 'they';
      const refl = pro === 'she' ? 'herself' : pro === 'he' ? 'himself' : 'themself';
      const wound = fillBasic(pick(LS.wounds || ['a quiet grief'])).replaceAll('themself', refl);
      const want = fillBasic(pick(LS.wants || ['keep going']))
        .replace('longer than they do', 'longer than ' + (pro === 'they' ? 'they do' : pro + ' does'));

      return {
        regionId: region.id,
        regionLabel: region.label,
        regionLand: region.land,
        hometown: town,
        workplace,
        people,
        places,
        event: fillBasic(pick(LS.events || ['a hard year'])),
        wound,
        want,
        skillOrigins,
      };
    },

    lifeseedKin(char, rel) {
      const ls = char.lifeseed;
      if (!ls) return 'someone';
      const p = (ls.people || []).find(x => x.relation === rel) || ls.people[0];
      return p ? p.name.split(' ')[0] : 'someone';
    },

    // ---------- 4. TEXTURE PARAGRAPH ----------
    // 3-4 sentences woven from the seed, appended to the backstory. Specific
    // people, specific places, a skill with an origin, a wound, a want.
    lifeseedText(char) {
      const ls = char.lifeseed;
      if (!ls) return '';
      const first = char.name.split(' ')[0];
      const p0 = ls.people[0];
      const p1 = ls.people[1];
      const soEntries = Object.entries(ls.skillOrigins || {});
      const bits = [];
      // Steve 2026-10-06: backgrounds were "messed up, repetitive, and weird" —
      // em-dash fragments, colon splices, and "What X wants now is simple" on
      // every character. Natural sentences, varied structures, name-anchored
      // (no pronouns to get wrong).
      bits.push(`${first} grew up in ${ls.hometown}, ${ls.regionLand}.`);
      if (p0) {
        const pn = p0.name.split(' ')[0];
        const kinLine = [
          `${first}'s ${p0.relation} ${pn} ${p0.fate}.`,
          `${pn}, ${first}'s ${p0.relation}, ${p0.fate}.`,
        ][Math.floor(R() * 2)];
        bits.push(kinLine.charAt(0).toUpperCase() + kinLine.slice(1));
      }
      if (p1 && R() < 0.7) {
        const pn = p1.name.split(' ')[0];
        const kin2 = [
          `${first}'s ${p1.relation} ${pn} ${p1.fate}.`,
          `${pn} — ${first}'s ${p1.relation} — ${p1.fate}.`,
        ][Math.floor(R() * 2)];
        bits.push(kin2.charAt(0).toUpperCase() + kin2.slice(1));
      }
      if (soEntries.length) {
        const [sk, how] = soEntries[0];
        const skName = { food: 'finding food', medicinal: 'patching people up', mending: 'fixing things', navigation: 'never getting lost', tracking: 'reading ground', trapping: 'traps', forecast: 'reading the sky' }[sk] || sk;
        // NAME-SAFE LOWERCASE (background audit 2026-10-11): templates like
        // "{kin}'s level, square, ..." start with a proper name after fill —
        // lowercasing produced "ashley's level". Only lowercase a genuinely
        // lowercase-able start; a leading capital is a name, keep it.
        const howLower = /^[A-Z]/.test(how) ? how : how.charAt(0).toLowerCase() + how.slice(1);
        // SKILL-HOW FRAMING (background audit 2026-10-11, sense-read):
        // "learned {sk} {how}" needs the how to connect. Bare noun phrases
        // ("Seamus's rule:", "the constellations Joseph taught") read as
        // missing a preposition — give them "from". A "learning X" how
        // echoes the frame's "learned" ("learned canning learning the pop")
        // — recast as "the hard way: X". Prepositional/gerund hows pass
        // through untouched.
        let howFrag = howLower;
        if (/^learning\s/.test(howFrag)) howFrag = 'the hard way: ' + howFrag.replace(/^learning\s/, '');
        else if (/^(the|a|an)\s|^[A-Z]/.test(howFrag) && !/^(in|from|at|on|during|with|by|through|under|after|before)\s/.test(howFrag))
          howFrag = 'from ' + howFrag;
        bits.push(`${first} learned ${skName} ${howFrag}.`);
      }
      const eventCap = ls.event.charAt(0).toUpperCase() + ls.event.slice(1);
      const eventLow = eventCap.charAt(0).toLowerCase() + eventCap.slice(1);
      const eventFrames = [
        `${eventCap} — that's the year everything changed, before the sky did.`,
        `${eventCap}, and everything changed that year, before the sky did.`,
        `Then ${eventLow}, and nothing was the same after.`,
        `${eventCap}. ${first} still measures years against that one.`,
        `Ask ${first} about ${eventLow} and watch the face change.`,
        `${eventCap} — before the sky, before all of this. ${first} was there.`,
      ];
      // EVENT-FRAME UNIQUENESS (background audit 2026-10-11): two villagers
      // from one town can share the regional event (shared history is good),
      // but never the verbatim sentence. Prefer an unused event+frame combo
      // this expedition; fall back to the full pool when exhausted.
      const _uef = this._usedEventFrames || (this._usedEventFrames = new Set());
      const freshF = eventFrames.map((_, i) => i).filter(i => !_uef.has(ls.event + '::' + i));
      const fi = (freshF.length ? freshF : eventFrames.map((_, i) => i))[Math.floor(R() * (freshF.length ? freshF.length : eventFrames.length))];
      _uef.add(ls.event + '::' + fi);
      bits.push(eventFrames[fi]);
      // (background audit 2026-10-11): the "What X wants now is simple:" frame
      // was Steve-flagged as repetitive boilerplate — replaced with a
      // natural third variant.
      const wantLine = [
        `${ls.wound} ${first} keeps circling back to the same thought: ${ls.want}.`,
        `${ls.wound} These days ${first} wants to ${ls.want}.`,
        `${ls.wound} ${first} keeps coming back to one thing: ${ls.want}.`,
      ][Math.floor(R() * 3)];
      bits.push(wantLine);
      return bits.join(' ');
    },

    // ---------- 5. KEEPSAKE RESOLUTION ----------
    // Fill {kin}/{first}/{place} in item memories and reveal notes from the
    // character's seed. No unreplaced placeholders ever reach the player.
    resolveKeepsakeText(char, def, text) {
      const ls = char.lifeseed;
      const first = char.name.split(' ')[0];
      const kin = (def && def.kin && def.kin !== 'none' && ls) ? this.lifeseedKin(char, def.kin) : 'someone';
      const place = ls && ls.places[0] ? ls.places[0].name : 'somewhere';
      return String(text || '')
        .replaceAll('{kin}', kin)
        .replaceAll('{first}', first)
        .replaceAll('{place}', place);
    },

    // ---------- 6. NPC KEEPSAKE OBSERVATION ----------
    // Their keepsakes are visible to the observant — and lootable from corpses.
    npcKeepsakeLine(vid) {
      try {
        const vp = (this.data.villagers || []).find(v => v.id === vid);
        if (!vp) return '';
        const keeps = (vp.items || [])
          .map(id => (this.data.items || []).find(i => i.id === id))
          .filter(d => d && d.class === 'sentimental');
        if (!keeps.length) return '';
        const names = keeps.slice(0, 2).map(d => d.name).join(' and ');
        return `💛 They carry ${names} — the kind of thing nobody carries by accident.`;
      } catch (e) { return ''; }
    },

    // ---------- 7. PERSONAL POOL ----------
    // ONE pool per character (Steve 2026-10-05): majority semantic (5, drawn
    // from the actual lifeseed — kin, occupation, wound, want, skill),
    // minority utility (3, occupation-biased). Semantic items are among the
    // best in the game via the bond -> enhancement -> secret evolution rails.
    // The player still picks 5 from the 8 — a real choice, not an assignment.
    // No random loot: every semantic item has a plausible connection to its
    // owner's backstory, enforced by the tag fields (occCategories, woundKeys,
    // wantKeys, skillKeys, kin).
    occCategory(occName) {
      const n = String(occName || '').toLowerCase();
      const cats = {
        medical: ['er nurse', 'paramedic', 'midwife', 'dentist', 'pharmacist', 'veterinarian', 'physical therapy aide', 'army medic'],
        food: ['line cook', 'butcher', 'baker', 'chef', 'farmer', 'community gardener', 'mushroom grower', 'rancher', 'fisherman', 'fishing guide', 'wild food forager', 'vintner', 'bartender'],
        craft: ['carpenter', 'mechanic', 'electrician', 'plumber', 'locksmith', 'welder', 'roofer', 'mason', 'hvac tech', 'appliance repair tech', 'blacksmith', 'glazier', 'tailor'],
        outdoors: ['hunting guide', 'trail crew lead', 'sailor', 'bush pilot', 'truck driver', 'beekeeper', 'exterminator'],
        service: ['esl teacher', 'interpreter', 'librarian', 'social worker', 'mortician', 'firefighter', 'police officer', 'emergency dispatcher'],
        creative: ['street artist', 'musician', 'journalist', 'lawyer', 'programmer'],
      };
      for (const [cat, names] of Object.entries(cats)) {
        if (names.some(x => n.includes(x))) return cat;
      }
      return 'service'; // unknown trade -> service (people-facing)
    },

    genPersonalPool(char) {
      const items = this.data.items || [];
      const byId = {};
      items.forEach(i => { byId[i.id] = i; });
      const ls = char.lifeseed || {};
      const pool = [];
      const semCount = { n: 0 };
      const push = (id, isSem) => {
        if (!id || !byId[id] || pool.includes(id)) return false;
        pool.push(id);
        if (isSem) semCount.n++;
        return true;
      };
      const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

      // 1-2. KIN KEEPSAKES: sentimental items whose kin EXACTLY matches a lifeseed
      // person (the lifeseed audit enforces exact kin coverage — no near-misses).
      const relations = (ls.people || []).map(p => String(p.relation || '').toLowerCase());
      const kinKeeps = shuffle(items.filter(i => i.class === 'sentimental' && i.kin && i.kin !== 'none' &&
        relations.includes(String(i.kin).toLowerCase())));
      for (const k of kinKeeps.slice(0, 2)) push(k.id, true);

      // 3. OCCUPATION piece: the trade they carried with them.
      const occCat = this.occCategory(char.formerOccupation);
      const occPieces = shuffle(items.filter(i => (i.occCategories || []).includes(occCat)));
      if (occPieces.length) push(occPieces[0].id, true);

      // 4. WOUND / WANT piece: what haunts them, what drives them.
      const woundT = String(ls.wound || '').toLowerCase();
      const wantT = String(ls.want || '').toLowerCase();
      const wwPieces = shuffle(items.filter(i =>
        (i.woundKeys || []).some(k => woundT.includes(String(k).toLowerCase())) ||
        (i.wantKeys || []).some(k => wantT.includes(String(k).toLowerCase()))));
      for (const w of wwPieces) { if (push(w.id, true)) break; }

      // 5. SKILL piece: what their hands learned, and where.
      const skKeys = Object.keys(ls.skillOrigins || {});
      const skPieces = shuffle(items.filter(i => (i.skillKeys || []).some(k => skKeys.includes(k))));
      for (const s of skPieces) { if (push(s.id, true)) break; }

      // Top up semantic to 5 from the keepsake pool — always a keepsake with
      // a memory, never filler. Kin-exact or kinless only (audit enforces it).
      // (A thin seed still gets a personal pool.)
      if (semCount.n < 5) {
        const fill = shuffle(items.filter(i => i.class === 'sentimental' && !pool.includes(i.id) &&
          (!i.kin || i.kin === 'none' || relations.includes(String(i.kin).toLowerCase()))));
        for (const f of fill) { if (semCount.n >= 5) break; push(f.id, true); }
      }

      // 6-8. UTILITY (the minority): occupation-biased tools of survival.
      const occ = ((this.data.characterGen || {}).occupations || [])
        .find(o => String(o.name || '').toLowerCase() === String(char.formerOccupation || '').toLowerCase()) || {};
      const bias = occ.itemBias || {};
      const take = (cls, n) => {
        const poolIds = items.filter(i => i.class === cls && !pool.includes(i.id)).map(i => i.id);
        const favored = (bias[cls] || []).filter(id => byId[id] && byId[id].class === cls && !pool.includes(id));
        const rest = shuffle(poolIds.filter(id => !favored.includes(id)));
        const ordered = [...favored, ...rest];
        for (let k = 0; k < n && ordered.length; k++) push(ordered.shift(), false);
      };
      // STARTER WEAPONS (Steve 2026-10-06): no high-tier loot at spawn — the
      // same gate genItemCandidates applies. A godslayer_spear in a day-1
      // personal pool breaks the whole gear curve before it starts.
      take('tool', 1);
      { const wpool = items.filter(i => i.class === 'weapon' && !pool.includes(i.id) && (i.lootTier || 1) <= 2 && i.origin !== 'alien').map(i => i.id);
        const wshuf = shuffle(wpool.slice());
        if (wshuf.length) push(wshuf[0], false); }
      take('clothing', 1);

      return { pool, semantic: semCount.n };
    },

    // ---------- AUDIT ----------
    // The foundation guard: generate N characters, assert depth + coherence.
    // Called by scripts/test-lifeseed.js.
    auditLifeseeds(n) {
      const errors = [];
      const seen = new Set();
      const LS = this.data.lifeseeds || {};
      const allTowns = [];
      for (const r of (LS.regions || [])) for (const t of (r.towns || [])) allTowns.push({ town: t.toLowerCase(), region: r.id });
      // shared registries, like genRoster: no repeats within one cast
      const usedNames = new Set(), usedOccs = new Set();
      for (let i = 0; i < (n || 50); i++) {
        let ch;
        try {
          ch = this.genCharacter({ origin: 'Columbus, Ohio', forceCultureMatch: false, candidate: true, usedNames, usedOccs });
        } catch (e) { errors.push(`gen ${i}: threw ${e.message}`); continue; }
        if (!ch) { errors.push(`gen ${i}: null char`); continue; }
        // names unique
        if (seen.has(ch.name)) errors.push(`duplicate name: ${ch.name}`);
        seen.add(ch.name);
        const firsts = [...seen].map(x => x.split(' ')[0]);
        if (firsts.filter(f => f === ch.name.split(' ')[0]).length > 1) errors.push(`duplicate first name: ${ch.name}`);
        const ls = ch.lifeseed;
        if (!ls) { errors.push(`${ch.name}: no lifeseed`); continue; }
        // seed completeness
        for (const k of ['regionLabel', 'hometown', 'event', 'wound', 'want']) {
          if (!ls[k]) errors.push(`${ch.name}: lifeseed missing ${k}`);
        }
        if ((ls.people || []).length < 2) errors.push(`${ch.name}: fewer than 2 lifeseed people`);
        if ((ls.places || []).length < 1) errors.push(`${ch.name}: no lifeseed places`);
        // kin names are real and not the character
        for (const p of (ls.people || [])) {
          if (!p.name || p.name.split(' ').length < 1) errors.push(`${ch.name}: kin with no name`);
          if (p.name.split(' ')[0] === ch.name.split(' ')[0]) errors.push(`${ch.name}: kin shares own first name`);
        }
        // keepsake kin coverage: every sentimental candidate's kin relation exists in the seed
        for (const id of (ch.items || [])) {
          const def = (this.data.items || []).find(x => x.id === id);
          if (def && def.class === 'sentimental' && def.kin && def.kin !== 'none') {
            const has = (ls.people || []).some(p => p.relation === def.kin);
            if (!has) errors.push(`${ch.name}: keepsake ${id} needs kin '${def.kin}', seed lacks it`);
          }
        }
        // region coherence: no other region's towns named in the texture
        const text = ((ch.backstory || '') + ' ' + (ls.event || '')).toLowerCase();
        for (const t of allTowns) {
          if (t.region !== ls.regionId && t.town.length > 3 && text.includes(t.town)) {
            errors.push(`${ch.name}: region contradiction — '${t.town}' (${t.region}) in a ${ls.regionId} story`);
          }
        }
        // no unreplaced placeholders in backstory
        if (/\{[a-z]+\}/.test(ch.backstory || '')) errors.push(`${ch.name}: unreplaced placeholder in backstory`);
      }
      return { errors: errors.slice(0, 40), total: errors.length, checked: n || 50 };
    },
    // takenKinOf(vid): lifeseed kin whose fate mentions the Taking — the
    // mourning hook for the stasis-kids content (2026-10-11, KIN canon:
    // the Taking took half the adults at the Scattering, day zero, plus
    // their children into stasis). Returns [{name, relation, fate}].
    takenKinOf(vid) {
      try {
        const vp = this.vpOf ? this.vpOf(vid) : null;
        const people = (vp && vp.lifeseed && vp.lifeseed.people) || [];
        return people.filter(p => /tak(en|ing)|pod/i.test(p.fate || ''));
      } catch (e) { return []; }
    },
    // villagersMourningTaken(): living roster villagers with taken kin.
    // Used by the seek_taken want and the table reunion casting.
    villagersMourningTaken() {
      try {
        const v = this.state.village || {};
        return (v.roster || []).filter(id => {
          if (!id || id === this.villagerId) return false;
          const p = (typeof this.getPerson === 'function') ? this.getPerson(id) : null;
          if (!p || p.dead) return false;
          return this.takenKinOf(id).length > 0;
        });
      } catch (e) { return []; }
    },
    // recordLifeseedEvent(vid, kind): the LIVED-EVENT writer. convoDrift reads
    // vp.lifeseed.lived to bend temperaments by what happened TO a villager —
    // but nothing ever wrote it (pacing audit 2026-10-09: the writer was dead,
    // so drift could never see feast_shared, kindness, etc.). Now it can.
    // Capped at 40 events; kinds are the drift vocabulary.
    recordLifeseedEvent(vid, kind) {
      if (!vid || !kind) return false;
      try {
        const vp = this.vpOf ? this.vpOf(vid) : null;
        if (!vp) return false;
        vp.lifeseed = vp.lifeseed || {};
        vp.lifeseed.lived = vp.lifeseed.lived || [];
        vp.lifeseed.lived.push({ kind, day: (this.state.scholar || {}).day || 1 });
        if (vp.lifeseed.lived.length > 40) vp.lifeseed.lived.splice(0, vp.lifeseed.lived.length - 40);
        return true;
      } catch (e) { return false; }
    },
  };

  Object.assign(Game, methods);

  // ============ WRAPS ============
  (function attach() {
    const _genCharacter = Game.genCharacter;
    Game.genCharacter = function (opts) {
      const ch = _genCharacter ? _genCharacter.call(this, opts) : null;
      if (!ch) return ch;
      try {
        ch.lifeseed = this.genLifeseed(ch);
        const texture = this.lifeseedText(ch);
        if (texture) ch.backstory = (ch.backstory || '') + ' ' + texture;
        // PERSONAL POOL (Steve 2026-10-05): one pool per character, majority
        // semantic, drawn from the lifeseed. Replaces the generic class-based
        // candidates — the player still picks 5 from 8.
        // CHOOSE 5 (Steve 2026-10-09): villagers choose their own 5 too.
        // Personality-driven: equip utility (weapons/tools score by bonus) +
        // sentimental keep-bias (keepsakes are theirs — nobody leaves their
        // keepsakes behind). The unchosen go to ch.villageShare, deposited
        // into the village armory at founding — communal gear, usable by
        // anyone. Normal items are communal; sentimental items are not.
        try {
          const pp = this.genPersonalPool(ch);
          if (pp && pp.pool && pp.pool.length >= 5) {
            if (this.choosePersonalFive) this.choosePersonalFive(ch, pp.pool);
            else { ch.items = pp.pool; }
            ch.personalPoolSemantic = pp.semantic;
            // RE-EQUIP (2026-10-09): items just changed — equipped still
            // references the pre-pool set. Without this, villagers wear gear
            // they don't carry and armorOf lies until the first fight.
            try {
              const SC2 = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
              if (SC2.equipment) SC2.equipment.autoEquip(ch, this.data.items);
            } catch (e2) {}
          }
        } catch (e) { /* generic pool stands if the seed is thin */ }
      } catch (e) { /* a thin seed is better than a crashed roster */ }
      return ch;
    };
  })();
})();
