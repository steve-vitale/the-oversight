// @ontology
// system: temperature
// description: Regional temperature model + heat/cold stress + expanded weather (docs/WORLD-REGIONS.md §4 #6, #18). Derives a daily °C from the region's climate calendar (season temp label, seasonal curve, day-part swing, weather modifier), names the sky (heatwave/frost/snow/storm), and applies real consequences: hydration burn, forage/travel modifiers through the modifier pipeline, mosquito pressure, and exposure stress for the player and the village. Knowledge-gated: precise readings and forecasts only after observation or a sky-reader.
// provides:
//   - Game.temperature (tempC, band, bandName, skyKind, canReadSky, forecast, observeDay, statusLine, install)
//   - tempC()
//   - skyKind()
//   - canReadSky()
//   - forecast()
//   - stressTick()
//   - villagerStress()
//   - narrateSky()
// rules:
//   - temp_from_calendar: base °C from the season's temp label (frozen -12 / cold 2 / cool 10 / mild 17 / warm 24 / hot 31), seasonal sine ±5 peaking mid-season, day-part swing (dawn -4, afternoon +4), weather modifier (heat +6, cold -6, storm -3, rain -2); clamped -40..48 (code: tempC)
//   - sky_derived: heatwave when the roll is heat or tempC ≥ 35; snow when the roll is cold and tempC < 0; frost when the roll is cold and tempC ≥ 0; storm stays storm (code: skyKind)
//   - no_new_currency: every cost is calories, hydration, energy, or time — never a separate meter (code: stressTick, hydrationBurn wrap)
//   - knowledge_gate: numbers and forecasts show only after 7 observed days in the region, a living villager with the forecast lifeseed skill, or the forecast ability; before that, felt lines only (code: canReadSky)
//   - pools_stay_separate: heat raises only the mild generic Fever via ambient mosquitoes; frostbite/heatstroke are mundane CONDITIONS (statusEffects.json), never diseases, never alien (code: diseaseVectorTick wrap)
//   - wrap_once: every hook is guarded so double-loading never double-applies (code: install)
// consumes:
//   - Game.season, Game.rollWeather, Game.advancePart, Game.diseaseVectorTick, Game.endDay, Game.mods via S.modifiers.collectModifiers, Game.applyStatus, Game.say (game.js)
//   - Scattering.calories.hydrationBurn (src/js/engine/calories.js)
//   - Game.shelteredFromSky, Game.nearFire, Game.hasAbility, Game.playerTile (game.js)
(function () {
  'use strict';
  const G = (globalThis.Scattering || {});
  const Game = G.Game;
  if (!Game) return;

  // Daily-mean °C per season temp label (docs: climates.json "temp").
  // No altitude data in regions.json (verified 2026-10-15) — no altitude term.
  const TEMP_MEAN = { frozen: -12, cold: 2, cool: 10, mild: 17, warm: 24, hot: 31 };
  const PART_SWING = [-4, 1, 4, -1]; // dawn, morning, afternoon, evening
  const WX_MOD = { heat: 6, cold: -6, storm: -3, rain: -2, clear: 0 };

  function curDay() {
    try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; }
  }
  function curPart() {
    try { return Game.dayPart || 0; } catch (e) { return 0; }
  }

  function tempC(day, part) {
    try {
      const s = Game.season(typeof day === 'number' ? day : curDay()) || {};
      const mean = TEMP_MEAN[s.temp] !== undefined ? TEMP_MEAN[s.temp] : 17;
      const seasonDays = s.seasonDays || 90;
      const dayOfSeason = s.dayOfSeason || 0;
      // Seasonal curve: the season's extreme lands mid-season.
      const phase = seasonDays > 0 ? (dayOfSeason / seasonDays) * Math.PI : 0;
      const dir = mean >= 17 ? 1 : -1;
      const seasonal = Math.sin(phase) * 5 * dir;
      const swing = PART_SWING[part !== undefined ? part : curPart()] || 0;
      const wx = (Game.state && Game.state.weather) || 'clear';
      const wxm = WX_MOD[wx] !== undefined ? WX_MOD[wx] : 0;
      return Math.max(-40, Math.min(48, Math.round(mean + seasonal + swing + wxm)));
    } catch (e) { return 17; }
  }

  function band(t) {
    if (t < -10) return 'deep-freeze';
    if (t < 0) return 'freezing';
    if (t < 8) return 'cold';
    if (t < 16) return 'cool';
    if (t < 24) return 'mild';
    if (t < 30) return 'warm';
    if (t < 36) return 'hot';
    return 'scorching';
  }
  const BAND_NAME = {
    'deep-freeze': 'Deep freeze', freezing: 'Freezing', cold: 'Cold', cool: 'Cool',
    mild: 'Mild', warm: 'Warm', hot: 'Hot', scorching: 'Scorching'
  };

  // skyKind(): the named sky. New weather with teeth, derived from the rolled
  // kind + the temperature — no region-table changes needed.
  function skyKind() {
    try {
      const w = (Game.state && Game.state.weather) || 'clear';
      const t = tempC();
      if (w === 'heat' || t >= 35) return 'heatwave';
      if (w === 'storm') return 'storm';
      if (w === 'cold') return t < 0 ? 'snow' : 'frost';
      return w;
    } catch (e) { return 'clear'; }
  }

  function activeRegionId() {
    try { const r = Game.activeRegion && Game.activeRegion(); return (r && r.id) || null; } catch (e) { return null; }
  }

  function skyReader() {
    // A living villager whose lifeseed says they read the sky.
    try {
      const v = Game.state && Game.state.village;
      if (!v || !v.roster) return null;
      for (const id of v.roster) {
        if (id === Game.villagerId) continue;
        const p = Game.getPerson && Game.getPerson(id);
        if (!p || p.dead) continue;
        const so = (p.lifeseed && p.lifeseed.skillOrigins) || (p.dna && p.dna.skillOrigins) || {};
        if (so.forecast) return p.name || 'Someone';
      }
    } catch (e) {}
    return null;
  }

  // canReadSky(): knowledge gate. Numbers and forecasts are earned.
  function canReadSky() {
    try {
      const lore = (Game.state && Game.state.skyLore) || {};
      const rid = activeRegionId();
      if (rid && (lore[rid] || 0) >= 7) return true;
      if (skyReader()) return true;
      if (Game.hasAbility && Game.hasAbility('forecast')) return true;
    } catch (e) {}
    return false;
  }

  function observeDay() {
    try {
      const rid = activeRegionId();
      if (!rid) return;
      Game.state.skyLore = Game.state.skyLore || {};
      Game.state.skyLore[rid] = (Game.state.skyLore[rid] || 0) + 1;
    } catch (e) {}
  }

  let _inForecast = false;
  // forecast(): tomorrow's sky, knowledge-gated. A forecast, not a promise.
  function forecast() {
    if (!canReadSky()) return null;
    try {
      const day = curDay() + 1;
      const s = Game.season(day) || {};
      const tbl = s.weather || {};
      const keys = Object.keys(tbl);
      let w = 'clear';
      if (keys.length) {
        const r = Math.random();
        let acc = 0;
        for (const k of keys) { acc += tbl[k] || 0; if (r < acc) { w = k; break; } }
      }
      const t = tempC(day, 1);
      let kind = w;
      if (w === 'heat' || t >= 35) kind = 'heatwave';
      else if (w === 'storm') kind = 'storm';
      else if (w === 'cold') kind = t < 0 ? 'snow' : 'frost';
      return { weather: w, kind: kind, tempC: t, band: BAND_NAME[band(t)] || 'Mild' };
    } catch (e) { return null; }
  }

  function say(msg) {
    try { if (typeof Game.say === 'function') Game.say(msg); } catch (e) {}
  }
  function atHaven() {
    try {
      if (Game.location === 'haven') return true;
      const t = Game.playerTile && Game.playerTile();
      return !!(t && t.type === 'haven');
    } catch (e) { return false; }
  }
  function playerExposedForCold() {
    // Mirrors the existing cold-bite guards: haven, shelter, or fire exempts.
    try {
      if (atHaven()) return false;
      if (Game.shelteredFromSky && Game.shelteredFromSky()) return false;
      if (Game.nearFire && Game.nearFire()) return false;
      if (Game.hasAbility && Game.hasAbility('cold_blooded')) return false;
      return true;
    } catch (e) { return false; }
  }
  function playerExposedForHeat() {
    // Shade exempts. A fire does NOT — it makes heat worse.
    try {
      if (atHaven()) return false;
      if (Game.shelteredFromSky && Game.shelteredFromSky()) return false;
      return true;
    } catch (e) { return false; }
  }

  function sayOnceToday(key, msg) {
    try {
      const d = curDay();
      Game.state._tempSaid = Game.state._tempSaid || {};
      if (Game.state._tempSaid[key] === d) return;
      Game.state._tempSaid[key] = d;
      say(msg);
    } catch (e) {}
  }

  // Felt lines for the knowledge-gated: villagers describe what they feel.
  const FELT = {
    heatwave: ['The air sits on your chest like a hand.', 'Even the shade feels used up.'],
    storm: ['The wind has opinions today.', 'The sky is coming apart at the seams.'],
    snow: ['The air bites on the way in.', 'Your breath comes out in ghosts.'],
    frost: ['The ground rings hard underfoot.', 'Everything crackles this morning.']
  };
  function feltLine(sky) {
    const lines = FELT[sky];
    if (!lines) return null;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  // stressTick(): per day-part exposure stress for the player. Costs are
  // calories, hydration, energy — never a new currency.
  function stressTick() {
    if (Game.over) return;
    try {
      const s = Game.state && Game.state.scholar;
      if (!s) return;
      const t = tempC();
      const sky = skyKind();
      if (t >= 35 && playerExposedForHeat()) {
        s.hydration = Math.max(0, (s.hydration || 0) - 5);
        s.energy = Math.max(0, (s.energy || 0) - 4);
        const line = canReadSky()
          ? `Scorching out here — ${t}°C and the air drinks you. (${BAND_NAME[band(t)]}. -5 hydration, -4 energy. Shade, water, rest.)`
          : `${feltLine('heatwave')} (The heat is drinking you. Shade, water, rest.)`;
        sayOnceToday('heat', line);
        if (t >= 40 && Math.random() < 0.02 && Game.applyStatus) {
          Game.applyStatus('scholar', 'heatstroke', { source: 'the scorching air' });
        }
      } else if (t < 0 && playerExposedForCold()) {
        // Freezing air on a day the weather roll didn't name 'cold': charge
        // the shiver the label would have charged. (Named cold days already
        // bite via the existing cold-snap code — no double tax.)
        if ((Game.state.weather || 'clear') !== 'cold') {
          s.kcal = Math.max(0, (s.kcal || 0) - 12);
          const line = canReadSky()
            ? `Freezing — ${t}°C, and the roll didn't even call it cold. (-12 kcal shivering. Fire, the hall, or your tent.)`
            : `${feltLine('snow')} (Shivering burns fuel. Fire, the hall, or your tent.)`;
          sayOnceToday('frostbite-kcal', line);
        }
        if (t < -10 && Math.random() < 0.02 && Game.applyStatus) {
          Game.applyStatus('scholar', 'frostbite', { source: 'the deep cold' });
        }
      } else if (sky === 'storm' && !atHaven()) {
        try {
          if (!(Game.shelteredFromSky && Game.shelteredFromSky())) {
            s.energy = Math.max(0, (s.energy || 0) - 3);
            sayOnceToday('storm', `${feltLine('storm')} (Fighting the wind wears you out. -3 energy out here.)`);
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  // villagerStress(): the village feels it too. Extremes work on everyone;
  // the hall is shelter, not immunity.
  function villagerStress() {
    try {
      const v = Game.state && Game.state.village;
      if (!v || !v.roster) return;
      const t = tempC(curDay(), 1);
      if (t > -5 && t < 35) return;
      v.health = v.health || {};
      const why = t <= -5 ? 'the deep cold' : 'the scorching heat';
      for (const id of v.roster) {
        if (id === Game.villagerId) continue;
        const p = Game.getPerson && Game.getPerson(id);
        if (!p || p.dead) continue;
        v.health[id] = v.health[id] !== undefined ? v.health[id] : 100;
        v.health[id] = Math.max(1, v.health[id] - 3);
      }
      say(`The ${t <= -5 ? 'cold' : 'heat'} works on everyone — the village wakes aching from ${why}.`);
    } catch (e) {}
  }

  // narrateSky(): end-of-day sky beat. Derived kinds get their line; the
  // reading is knowledge-gated.
  function narrateSky() {
    if (Game.over) return;
    try {
      const sky = skyKind();
      const t = tempC(curDay(), 1);
      const known = canReadSky();
      const reading = known ? ` (${t}°C — ${BAND_NAME[band(t)]})` : '';
      const felt = feltLine(sky);
      if (sky === 'heatwave') {
        say(known
          ? `Heatwave settles in.${reading} Tomorrow will ask for water and shade.`
          : `Heatwave settles in. ${felt}`);
      } else if (sky === 'storm') {
        say(known
          ? `A storm builds.${reading} Travel will be ugly; keep the fire fed.`
          : `A storm builds. ${felt}`);
      } else if (sky === 'snow') {
        say(known
          ? `Snow by morning.${reading} The ground goes iron — forage thin, walking dear.`
          : `Snow by morning. ${felt}`);
      } else if (sky === 'frost') {
        say(known
          ? `A hard frost tonight.${reading} Everything crackles by dawn.`
          : `A hard frost tonight. ${felt}`);
      }
      // The sky-reader earns their keep: a named forecast, once a day.
      const reader = skyReader();
      if (reader) {
        const fc = forecast();
        if (fc) say(`${reader} reads the sky: ${fc.kind} tomorrow, ${fc.band.toLowerCase()}.`);
      }
    } catch (e) {}
  }

  function statusLine() {
    // For app.js: knowledge-gated one-liner. Before knowledge: the felt sky.
    try {
      const sky = skyKind();
      if (!canReadSky()) {
        const felt = feltLine(sky);
        return felt ? `Sky: ${felt}` : `Sky: ${(Game.state && Game.state.weather) || 'clear'}`;
      }
      return `Sky: ${sky}, ${tempC()}°C (${BAND_NAME[band(tempC())]})`;
    } catch (e) { return ''; }
  }

  // ---- guarded wraps ----
  let _installed = false;
  function wrapOnce(obj, name, fn) {
    try {
      if (!obj || typeof obj[name] !== 'function' || obj[name]._tempWrapped) return;
      const orig = obj[name];
      const w = function () { return fn.call(this, orig, arguments); };
      w._tempWrapped = true;
      obj[name] = w;
    } catch (e) {}
  }

  function install() {
    if (_installed) return;
    _installed = true;
    // rollWeather: stash the day's temperature + observe the sky. The return
    // value is untouched — the roll stays the roll.
    wrapOnce(Game, 'rollWeather', function (orig, args) {
      const out = orig.apply(this, args);
      if (!_inForecast) {
        try {
          Game.state.tempC = tempC(curDay(), 1);
          Game.state.tempBand = band(Game.state.tempC);
          observeDay();
        } catch (e) {}
      }
      return out;
    });
    // advancePart: exposure stress rides the day-part tick.
    wrapOnce(Game, 'advancePart', function (orig, args) {
      const out = orig.apply(this, args);
      stressTick();
      return out;
    });
    // diseaseVectorTick: heat wakes the mosquitoes; hard freeze shelves them.
    // Pools stay separate: ambient bites carry only the mild generic Fever.
    wrapOnce(Game, 'diseaseVectorTick', function (orig, args) {
      const t = tempC();
      if (t < 4) {
        sayOnceToday('vector-freeze', 'Iron cold. Even the ticks are shelved.');
        return;
      }
      const out = orig.apply(this, args);
      const sky = skyKind();
      if (sky === 'heatwave' && !Game.over) {
        try {
          const dp = curPart();
          let wet = false;
          try {
            const pt = Game.playerTile && Game.playerTile();
            wet = !!(pt && (pt.type === 'wetland' || pt.type === 'swamp'));
          } catch (e) {}
          if (dp >= 1 && (wet || Math.random() < 0.5)) {
            const mr = Math.random();
            const biteP = wet ? 0.05 : 0.015;
            if (mr < biteP) {
              say('The heat has woken every mosquito for a mile — one finds you, and by nightfall you\u2019re feverish.');
              if (Game.contractDisease) Game.contractDisease('disease', { source: 'a heatwave mosquito bite' });
            } else if (mr < biteP + 0.15) {
              say('Mosquitoes in clouds. Just mosquitoes \u2014 itchy, whining, nothing more.');
            }
          }
        } catch (e) {}
      }
      return out;
    });
    // endDay: the sky beat + the village feels it. Runs after the original.
    wrapOnce(Game, 'endDay', function (orig, args) {
      const out = orig.apply(this, args);
      narrateSky();
      villagerStress();
      return out;
    });
    // collectModifiers: the single funnel — weather rides the modifier
    // pipeline, so engine forage, walkStepKcal, travel encounters and
    // makeFire all feel it through their existing targets.
    try {
      const M = G.modifiers;
      if (M && typeof M.collectModifiers === 'function' && !M.collectModifiers._tempWrapped) {
        const orig = M.collectModifiers;
        const w = function () {
          const mods = orig.apply(this, arguments);
          try {
            const sky = skyKind();
            if (sky === 'snow') {
              mods.push({ target: 'forage.yield', op: 'multiply', value: 0.5, source: 'snow' });
              mods.push({ target: 'travel.cost_mult', op: 'multiply', value: 1.5, source: 'snow' });
            } else if (sky === 'frost') {
              mods.push({ target: 'forage.yield', op: 'multiply', value: 0.8, source: 'frost' });
            } else if (sky === 'heatwave') {
              mods.push({ target: 'forage.yield', op: 'multiply', value: 0.7, source: 'heatwave' });
              mods.push({ target: 'fire.ticks_add', op: 'add', value: -8, source: 'heatwave (tinder-dry fuel)' });
            } else if (sky === 'storm') {
              mods.push({ target: 'forage.yield', op: 'multiply', value: 0.85, source: 'storm' });
              mods.push({ target: 'travel.encounter', op: 'multiply', value: 1.5, source: 'storm' });
              mods.push({ target: 'fire.ticks_add', op: 'add', value: 16, source: 'storm (wet wind)' });
            }
          } catch (e) {}
          return mods;
        };
        w._tempWrapped = true;
        M.collectModifiers = w;
      }
    } catch (e) {}
    // S.calories.hydrationBurn: heatwave drinks you faster. Real number.
    try {
      const C = G.calories;
      if (C && typeof C.hydrationBurn === 'function' && !C.hydrationBurn._tempWrapped) {
        const orig = C.hydrationBurn;
        const w = function () {
          const out = orig.apply(this, arguments);
          try { if (skyKind() === 'heatwave') return Math.ceil(out * 1.75); } catch (e) {}
          return out;
        };
        w._tempWrapped = true;
        C.hydrationBurn = w;
      }
    } catch (e) {}
  }

  Game.temperature = {
    tempC: tempC, band: band, bandName: function (t) { return BAND_NAME[band(t)] || 'Mild'; },
    skyKind: skyKind, canReadSky: canReadSky, forecast: forecast,
    observeDay: observeDay, statusLine: statusLine, install: install,
    _TEMP_MEAN: TEMP_MEAN
  };

  install();
})();
