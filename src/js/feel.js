// @ontology
// system: feel
// description: Presentation pass A (2026-10-14, Steve: "Address all graphic and sound survey gaps."): one data-driven place that turns game moments into a visual (Game.drama), a sound (Game.audioEvent) and a haptic. Covers the payoff moments that were log-only (ascension, class recognition, keepsake flashback and level-up, feast, the 27 god-path abilities, titans, the Table, the level-up sheet, flee), the grounded pre-System combat feedback (days 1-6: earthy and human, no System chrome) and the haptics/reduced-motion settings. Hooks from OUTSIDE the systems it dresses (wraps and tele events), so godpath.js, godhood.js, titans.js and table.js stay untouched. Headless-safe: in node every effect is a call into Game.drama/Game.audioEvent, which tests stub.
// provides:
//   - feel(name, data) -> true when the moment fired (drama 'moment' + audioEvent + haptic)
//   - feelVerb(abilityId, data) -> true when a god-path ability's grid effect + cue fired
//   - groundedKind(kind) -> the pre-System grounded drama variant for a drama kind, or null (stays still)
//   - groundedAudio(kind, arg) -> the pre-System grounded sound for a drama kind, or null
//   - hapticFor(kind) -> haptic pattern name for a drama kind, or null
//   - haptic(kind) -> true when navigator.vibrate was called (feature-detected, setting-gated, throttled)
//   - hapticsSupported() / hapticsEnabled() / setHaptics(on)
//   - reducedMotion() / setReducedMotion(on) -> OS prefers-reduced-motion OR the in-game toggle
//   - arrivalVoiceIds(beat) -> the recorded System line ids for one day-7 cinematic beat (text match, then ARRIVAL_VOICE)
//   - FEEL_MOMENTS: moment name -> {drama, audio, haptic, system?, grounded?}
//   - FEEL_VERBS: the 27 god-path abilities -> {fx, color, glyph, cue, tag?}
// rules:
//   - system_styled_waits: a moment flagged system:true never fires before the System arrives (code: feel)
//   - grounded_is_human: pre-System variants are earthy (bark, ochre, blood, ash) — no cyan, no System voice, no System text (code: GROUNDED_KINDS, drama.js grounded)
//   - observe_only: every wrap calls the original first and returns its result unchanged (code: wrap)
//   - no_rng: no Math.random, no game-state writes except per-fight _feel bookkeeping on tbfight (code: feel.js)
//   - never_silent_errors: failures warn once per site, never throw into game code (code: warn)
// consumes:
//   - Game.data.monsters, AudioRegistry.monsterSig
//   - drama(), audioEvent(), tele(), playFlashback(), keepsakeLevelBeat(), hostFeast(), startCombat(), tbDamage(), tbEnd(), tableScene(), tableStartPath(), tableRunBeat(), tableFail(), tableResolveFinal(), pumpLevelUps(), say(), isTitan(), recognitionCeremony(), mythicSprite(), classLine(), tbFighter(), tableState(), progState(), systemVoiceIdFor()
//   - localStorage.oversight_haptics, localStorage.oversight_reduce_motion
(function () {
  'use strict';
  const S = globalThis.Scattering = globalThis.Scattering || {};
  const G = S.Game;
  if (!G) return;

  const _warned = {};
  function warn(site, e) {
    if (_warned[site]) return;
    _warned[site] = true;
    try { console.warn('[feel] ' + site + (e ? ': ' + ((e && e.message) || e) : '')); } catch (e2) { /* console gone: nothing left to report to */ }
  }
  function ls(key) {
    try { return (typeof localStorage !== 'undefined' && localStorage) ? localStorage.getItem(key) : null; }
    catch (e) { warn('localStorage read', e); return null; }
  }
  function lsSet(key, v) {
    try { if (typeof localStorage !== 'undefined' && localStorage) localStorage.setItem(key, v); }
    catch (e) { warn('localStorage write', e); }
  }

  // ===================== DATA =====================
  // Moments: what each payoff plays. `system: true` = System-styled, gated
  // until arrival. `grounded: true` = always human-styled (warm, earthy),
  // allowed before the System.
  const FEEL_MOMENTS = {
    ascension:       { drama: 'ascension',       audio: 'ascensionRise',   haptic: 'ascension', system: true },
    classRecognized: { drama: 'classRecognized', audio: 'classChime',      haptic: 'levelUp',   system: true },
    levelUpOpen:     { drama: 'levelUpOpen',     audio: 'levelUpFlourish', haptic: 'levelUp',   system: true },
    flashback:       { drama: 'flashback',       audio: 'flashbackWarm',   haptic: 'soft',      grounded: true },
    keepsakeLevel:   { drama: 'keepsakeLevel',   audio: 'keepsakeGlow',    haptic: 'soft',      grounded: true },
    feast:           { drama: 'feast',           audio: 'feastFire',       haptic: 'soft',      grounded: true },
    flee:            { drama: 'flee',            audio: 'groundedFlee',    haptic: null,        grounded: true },
    titanEntry:      { drama: 'titanEntry',      audio: 'titanEntrySting', haptic: 'titan',     system: true },
    titanPhase:      { drama: 'titanPhase',      audio: 'titanPhaseSting', haptic: 'hit',       system: true },
    titanFall:       { drama: 'titanFall',       audio: 'titanFallSting',  haptic: 'kill',      system: true },
    tableEnter:      { drama: 'tableEnter',      audio: 'tableEnterSting', haptic: 'ascension', system: true },
    tableLock:       { drama: 'tableLock',       audio: 'tableLockIn',     haptic: 'soft',      system: true },
    tableBeat:       { drama: 'tableBeat',       audio: 'tableBeatPulse',  haptic: null,        system: true },
    tableWin:        { drama: 'tableWin',        audio: 'tableWinSting',   haptic: 'ascension', system: true },
    tableLose:       { drama: 'tableLose',       audio: 'tableLoseSting',  haptic: 'death',     system: true },
    // Day 7: app.js systemArrivalAnimation plays the beats; this is its
    // opening sting (the per-beat bed + voice live there, synced to taps).
    systemArrival:   { drama: null,              audio: 'arrivalSting',    haptic: 'arrival' },
  };

  // The 27 god-path abilities (src/data/abilities.json, `path` + `subclass`
  // on the 10-path roster). fx = the grid effect drama.js draws, cue = the
  // verbCue voice (feel-audio.js). Actives fire on tele 'godpath_verb';
  // passives fire on their own tele (lifeline, ember) or on the narration tag
  // godpath.js ends every passive line with — "(Last Rites)".
  const FEEL_VERBS = {
    aegis_link:          { fx: 'thread',   color: '#ffe08a', glyph: '🛡', cue: 'thread' },
    raise_earth:         { fx: 'wall',     color: '#a07a4a', glyph: '⛰', cue: 'wall' },
    gravity_well:        { fx: 'pull',     color: '#8a7ad8', glyph: '◎', cue: 'pull' },
    landslide:           { fx: 'push',     color: '#b08a5a', glyph: '≋', cue: 'push' },
    pack_hunt:           { fx: 'pack',     color: '#c9a36a', glyph: '🐾', cue: 'pack' },
    mending_hands:       { fx: 'heal',     color: '#8fe08a', glyph: '✚', cue: 'heal' },
    lifeline:            { fx: 'thread',   color: '#8fe08a', glyph: '♥', cue: 'thread', tag: 'Lifeline' },
    keepers_oath:        { fx: 'keepsake', color: '#f2c46b', glyph: '◈', cue: 'keepsake', tag: "Keeper's Oath" },
    mourners_bond:       { fx: 'keepsake', color: '#d9b38c', glyph: '◈', cue: 'keepsake', tag: "Mourner's Bond" },
    last_rites:          { fx: 'echo',     color: '#cfd8ff', glyph: '✧', cue: 'echo', tag: 'Last Rites' },
    blink:               { fx: 'blink',    color: '#b9a4ff', glyph: '✦', cue: 'blink' },
    switcheroo:          { fx: 'swap',     color: '#e0a4ff', glyph: '⇄', cue: 'swap' },
    misdirection:        { fx: 'ghost',    color: '#c8c8e8', glyph: '?', cue: 'blink', tag: 'Misdirection' },
    foresight:           { fx: 'foresee',  color: '#b8e0ff', glyph: '👁', cue: 'foresee' },
    prophecy:            { fx: 'foresee',  color: '#d8c8ff', glyph: '👁', cue: 'foresee', tag: 'Prophecy' },
    live_broadcast:      { fx: 'broadcast', color: '#ff4d4d', glyph: '● LIVE', cue: 'broadcast' },
    rally_aura:          { fx: 'aura',     color: '#ffd27a', glyph: '✺', cue: 'aura', tag: 'Rally Aura' },
    the_crowd_moves:     { fx: 'command',  color: '#ffb25a', glyph: '»', cue: 'command' },
    stoke:               { fx: 'stoke',    color: '#ff8a3a', glyph: '🔥', cue: 'stoke' },
    ember_heart:         { fx: 'stoke',    color: '#ff5a2a', glyph: '❤‍🔥', cue: 'stoke', tag: 'Ember Heart' },
    back_from_the_brink: { fx: 'burst',    color: '#ff6a4a', glyph: '↺', cue: 'aura', tag: 'Back from the Brink' },
    coin_guard:          { fx: 'coins',    color: '#f5c518', glyph: '¤', cue: 'coins' },
    haggle:              { fx: 'coins',    color: '#e8c060', glyph: '¤', cue: 'coins', tag: 'Haggle' },
    bribe:               { fx: 'bribe',    color: '#f5c518', glyph: '¤', cue: 'coins' },
    sweetener:           { fx: 'bribe',    color: '#ffd84a', glyph: '¤', cue: 'coins', tag: 'Sweetener' },
    harvest_table:       { fx: 'feed',     color: '#e0b060', glyph: '🍲', cue: 'feed', tag: 'Harvest Table' },
    long_table:          { fx: 'feed',     color: '#e0b060', glyph: '🍲', cue: 'feed' },
  };

  // Pre-System: drama kind -> grounded variant (drama.js Drama.grounded).
  // null/absent = stays still before day 7 (System-flavoured kinds:
  // broadcast, contest, commentary, integration, social, signature ...).
  const GROUNDED_KINDS = {
    hit: 'hit', critHit: 'crit', dodgeMiss: 'miss', playerHurt: 'hurt',
    wisp: 'kill', alienHeavyHit: 'heavy', weather: 'weather', shake: 'shake',
    playerDeath: 'death', text: 'text',
  };
  // Pre-System sounds for kinds whose call sites fire no audio of their own
  // (hit/crit/kill already sound via monsterHurt/weaponHit/monsterDown).
  const GROUNDED_AUDIO = { playerHurt: 'groundedHurt', dodgeMiss: 'groundedMiss', alienHeavyHit: 'groundedHurt' };
  const WEATHER_AUDIO = { rain: 'weatherRain', cold: 'weatherCold' };

  const HAPTIC_FOR_DRAMA = { playerHurt: 'hurt', alienHeavyHit: 'hurt', critHit: 'crit', playerDeath: 'death', levelUp: 'levelUp' };
  const HAPTIC_PATTERNS = {
    soft: [12], hit: [18], hurt: [35], crit: [20, 30, 45], kill: [25, 40, 25],
    death: [140, 90, 220, 90, 420], levelUp: [20, 40, 20, 40, 70],
    ascension: [40, 60, 40, 60, 90, 60, 240], arrival: [300, 140, 60, 60, 60, 60, 120],
    titan: [90, 60, 180],
  };

  // DAY 7 VOICE (the existing ElevenLabs System lines, src/audio/system):
  // beat id -> manifest ids in line order. The live text match
  // (systemVoiceIdFor) wins when the manifest is loaded; this table is the
  // fallback for lines whose game text drifted from the recording (e.g.
  // "So why the... [chewing noises]?"). Beats with no recording stay silent
  // under the bed (pods, the knack beat).
  const ARRIVAL_VOICE = {
    contact: ['sys-day7-01', 'sys-day7-02', 'sys-day7-03'],
    watched: ['sys-day7-04', 'sys-day7-05', 'sys-day7-06'],
    food: ['sys-day7-07', 'sys-day7-08', 'sys-day7-09', 'sys-day7-10'],
    gifts: ['sys-day7-11', 'sys-day7-12', 'sys-day7-13', 'sys-day7-17'],
    button: ['sys-day7-14', 'sys-day7-15', 'sys-day7-16'],
  };
  // arrivalVoiceIds(beat): the System's recorded lines for one cinematic beat.
  function arrivalVoiceIds(beat) {
    if (!beat || !Array.isArray(beat.lines)) return [];
    const sys = beat.lines.filter(l => l && l.who === 'sys');
    const table = ARRIVAL_VOICE[beat.id] || [];
    const out = [];
    sys.forEach((l, i) => {
      let id = null;
      try { id = (typeof G.systemVoiceIdFor === 'function') ? G.systemVoiceIdFor(l.text) : null; } catch (e) { warn('systemVoiceIdFor', e); }
      if (!id) id = table[i] || null;
      if (id && out.indexOf(id) < 0) out.push(id);
    });
    return out;
  }

  function groundedKind(kind) { return GROUNDED_KINDS[kind] || null; }
  function groundedAudio(kind, arg) {
    if (kind === 'weather') return WEATHER_AUDIO[arg] || null;
    return GROUNDED_AUDIO[kind] || null;
  }
  function hapticFor(kind) { return HAPTIC_FOR_DRAMA[kind] || null; }

  // ===================== SETTINGS =====================
  function hapticsSupported() {
    try { return typeof navigator !== 'undefined' && !!navigator && typeof navigator.vibrate === 'function'; }
    catch (e) { warn('haptics detect', e); return false; }
  }
  // Default ON where supported; the Settings toggle writes '0' to turn it off.
  function hapticsEnabled() { return hapticsSupported() && ls('oversight_haptics') !== '0'; }
  function setHaptics(on) { lsSet('oversight_haptics', on ? '1' : '0'); return hapticsEnabled(); }
  // Reduced motion: the OS setting OR the in-game toggle ('1').
  function reducedMotion() {
    if (ls('oversight_reduce_motion') === '1') return true;
    try {
      return typeof matchMedia === 'function' && !!matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { warn('matchMedia', e); return false; }
  }
  function setReducedMotion(on) { lsSet('oversight_reduce_motion', on ? '1' : '0'); return reducedMotion(); }

  // Haptics are not motion: reduced-motion users keep them unless they turn
  // them off (separate toggle). Throttled so a flurry never buzzes nonstop.
  let _lastBuzz = 0;
  function haptic(kind) {
    const pat = HAPTIC_PATTERNS[kind];
    if (!pat || !hapticsEnabled()) return false;
    // performance.now, never Date.now: the sim clock is a call counter.
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    if (kind !== 'death' && kind !== 'ascension' && kind !== 'arrival' && _lastBuzz && now - _lastBuzz < 90) return false;
    _lastBuzz = now;
    try { navigator.vibrate(pat); return true; } catch (e) { warn('vibrate', e); return false; }
  }

  // ===================== MOMENTS =====================
  function arrived(g) { return !!(g.state && g.state.systemArrived); }
  function feel(name, data) {
    const spec = FEEL_MOMENTS[name];
    if (!spec) { warn('unknown moment ' + name); return false; }
    const g = this && this.state ? this : G;
    const up = arrived(g);
    if (spec.system && !up) return false;
    const d = Object.assign({}, data || {}, { moment: name, grounded: !up || !!spec.grounded, calm: reducedMotion() });
    try { if (spec.drama) g.drama('moment', name, d); } catch (e) { warn('drama ' + name, e); }
    try { if (spec.audio) g.audioEvent(spec.audio, d); } catch (e) { warn('audio ' + name, e); }
    if (spec.haptic) haptic(spec.haptic);
    return true;
  }

  // feelVerb: a god-path ability's grid effect + cue. Positions come from the
  // live fight: the player, plus the nearest monster/ally as the target.
  function fightPos(g) {
    const f = g.tbfight;
    if (!f || !f.fighters) return null;
    const p = (f.fighters || []).find(x => x.key === 'p');
    const mons = f.fighters.filter(x => (x.kind === 'monster' || x.kind === 'hostile') && x.alive && !x.fled);
    const allies = f.fighters.filter(x => (x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled);
    const d = (a, b) => Math.max(Math.abs((a.mx || 0) - (b.mx || 0)), Math.abs((a.my || 0) - (b.my || 0)));
    const near = (list) => (p && list.length) ? list.slice().sort((a, b) => d(a, p) - d(b, p))[0] : (list[0] || null);
    const m = near(mons), a = near(allies);
    return {
      px: p ? p.mx : 4, py: p ? p.my : 4,
      tx: m ? m.mx : (p ? p.mx : 4), ty: m ? m.my : (p ? p.my : 4),
      ax: a ? a.mx : null, ay: a ? a.my : null,
    };
  }
  function feelVerb(abilityId, data) {
    const v = FEEL_VERBS[abilityId];
    if (!v) return false;
    const g = this && this.state ? this : G;
    const pos = fightPos(g) || { px: 4, py: 4, tx: 4, ty: 4, ax: null, ay: null };
    const d = Object.assign({ ability: abilityId, fx: v.fx, color: v.color, glyph: v.glyph }, pos, data || {}, { calm: reducedMotion(), grounded: !arrived(g) });
    try { g.drama('verb', d); } catch (e) { warn('verb drama ' + abilityId, e); }
    try { g.audioEvent('verbCue', { cue: v.cue, ability: abilityId }); } catch (e) { warn('verb audio ' + abilityId, e); }
    haptic('soft');
    return true;
  }

  // ===================== WIRING (wraps; observe only) =====================
  function wrap(obj, name, after, before) {
    const orig = obj && obj[name];
    if (typeof orig !== 'function') { warn('missing ' + name); return; }
    obj[name] = function () {
      let pre;
      if (before) { try { pre = before(this, arguments); } catch (e) { warn('pre ' + name, e); } }
      const r = orig.apply(this, arguments);
      try { after(this, arguments, r, pre); } catch (e) { warn('post ' + name, e); }
      return r;
    };
  }

  // tele events: class recognition, god-path verbs, passives, flee.
  const PASSIVE_TELE = { godpath_lifeline: 'lifeline', godpath_ember: 'ember_heart' };
  wrap(G, 'tele', (g, a) => {
    const type = a[0], d = a[1] || {};
    if (type === 'class_recognized' && d.who === 'player') {
      let line = null;
      try { line = g.classLine ? g.classLine('player') : null; } catch (e) { warn('classLine', e); }
      g.feel('classRecognized', { path: d.path, subclass: d.subclass, line });
    } else if (type === 'godpath_verb' && d.ability) {
      g.feelVerb(d.ability, { verb: d.verb });
    } else if (PASSIVE_TELE[type]) {
      g.feelVerb(PASSIVE_TELE[type]);
    } else if (type === 'combat_end' && d.result === 'fled' && (d.php == null || d.php > 0)) {
      g.feel('flee', fightPos(g) || {});
    }
  });

  // Passive tags: godpath.js ends every passive's narration with "(Name)".
  // Only inside a fight, once per ability per round.
  const TAGGED = Object.keys(FEEL_VERBS).filter(id => FEEL_VERBS[id].tag && !Object.values(PASSIVE_TELE).includes(id))
    .map(id => ({ id, needle: '(' + FEEL_VERBS[id].tag + ')' }));
  wrap(G, 'say', (g, a) => {
    const f = g.tbfight;
    if (!f || f.over) return;
    const txt = String(a[0] || '');
    if (txt.indexOf('(') < 0) return;
    for (const t of TAGGED) {
      if (txt.indexOf(t.needle) < 0) continue;
      f._feel = f._feel || {};
      const k = t.id + '@' + (f.round || 1);
      if (f._feel[k]) continue;
      f._feel[k] = 1;
      g.feelVerb(t.id);
    }
  });

  // Ascension (godhood.js — wrapped on its namespace, like pantheon.js).
  try {
    const Gh = S.Godhood;
    if (Gh && typeof Gh.recognitionCeremony === 'function') {
      wrap(Gh, 'recognitionCeremony', (self, a, r) => {
        if (!r) return;
        const game = a[0] || G, ghId = a[1];
        const gh = (Gh.byId && Gh.byId(ghId)) || {};
        game.feel('ascension', {
          godhood: ghId, name: gh.name || ghId, title: (gh.mythic && gh.mythic.title) || '',
          sprite: Gh.mythicSprite ? Gh.mythicSprite(ghId) : null, beats: r.map(b => b.beat),
        });
      });
    } else warn('Godhood.recognitionCeremony missing');
  } catch (e) { warn('godhood wrap', e); }

  // Keepsakes: the flashback (warm, human) and each level-up beat.
  // _seq, not Date.now(): the sim clock is a call counter and must not drift.
  let _seq = 0;
  wrap(G, 'playFlashback', (g, a) => {
    const item = a[0] || {}, def = a[1] || {};
    g._feelFlashbackAt = ++_seq;
    g.feel('flashback', { name: item.name || def.name || 'it' });
  });
  wrap(G, 'keepsakeLevelBeat', (g, a, r, pre) => {
    // L1 plays the flashback inside the beat — that is the moment; no second card.
    if (pre && g._feelFlashbackAt && g._feelFlashbackAt >= pre) return;
    const it = a[0] || {};
    g.feel('keepsakeLevel', { name: it.name || 'keepsake', level: a[2] });
  }, () => _seq + 1);

  // Feast: warmth and fire when the feast is actually held.
  wrap(G, 'hostFeast', (g, a, r) => {
    if (!r || !r.ok) return;
    g.feel('feast', { quality: r.quality, qualityName: r.qualityName, showed: (r.showed || []).length });
  });

  // Level-up sheet: fires when the sheet becomes pending (tracks.js).
  wrap(G, 'pumpLevelUps', (g, a, r) => {
    if (r !== true) return;
    const ch = ((g.state.scholar || {}).abilityChoices) || [];
    const c = ch[0] || {};
    g.feel('levelUpOpen', { track: String(c.src || '').replace('level_up:', ''), level: c.level || null });
  });

  // ---- TITANS: entry sting + the titan's own voice, phase thirds, the fall.
  function monsterIdOf(m) { return (m && ((m.mdef && m.mdef.id) || m.monsterId || m.id)) || null; }
  function titanFighter(g) {
    const f = g.tbfight;
    if (!f || !f.fighters || typeof g.isTitan !== 'function') return null;
    return f.fighters.find(m => (m.kind === 'monster' || m.kind === 'hostile') && g.isTitan(monsterIdOf(m))) || null;
  }
  wrap(G, 'startCombat', (g) => {
    const t = titanFighter(g);
    if (!t || !g.tbfight || g.tbfight._feelTitan) return;
    const mid = monsterIdOf(t);
    g.tbfight._feelTitan = { key: t.key, phase: 0, id: mid };
    g.feel('titanEntry', { id: mid, name: t.name || mid });
    // the titan's own voice: its registry signature (real recording or
    // synth), else the monster's own encounter aggroAudio (monsters.json).
    try {
      const AR = globalThis.AudioRegistry;
      const md = ((g.data && g.data.monsters) || []).find(m => m.id === mid) || {};
      const sig = (AR && AR.monsterSig && AR.monsterSig[mid]) || md.aggroAudio || (md.encounter || {}).aggroAudio || null;
      if (sig && arrived(g)) g.audioEvent(sig, { titan: mid });
    } catch (e) { warn('titan voice', e); }
  });
  wrap(G, 'tbDamage', (g, a) => {
    const f = g.tbfight, ft = f && f._feelTitan;
    if (!ft || a[0] !== ft.key) return;
    const t = g.tbFighter ? g.tbFighter(ft.key) : null;
    if (!t || !t.alive || !(t.maxHp > 0)) return;
    const frac = t.hp / t.maxHp;
    const phase = frac <= 1 / 3 ? 2 : frac <= 2 / 3 ? 1 : 0;
    if (phase > ft.phase) {
      ft.phase = phase;
      g.feel('titanPhase', { id: ft.id, phase, x: t.mx, y: t.my });
    }
  });
  wrap(G, 'tbEnd', (g, a, r, pre) => {
    if (!pre) return;
    if ((a[0] === 'won' || a[0] === 'routed') && pre.dead) g.feel('titanFall', { id: pre.id });
  }, (g) => {
    const f = g.tbfight, ft = f && f._feelTitan;
    if (!ft || f.over) return null;
    const t = (f.fighters || []).find(x => x.key === ft.key);
    return { id: ft.id, dead: !!(t && !t.alive) };
  });

  // ---- THE TABLE: entry, lock-in, each beat, win/lose.
  wrap(G, 'tableScene', (g, a, r, pre) => {
    const pg = g.progState ? g.progState() : {};
    if (!pre && pg.tableDone) g.feel('tableEnter', {});
  }, (g) => !!(g.progState && g.progState().tableDone));
  wrap(G, 'tableStartPath', (g, a) => {
    const T = g.tableState ? g.tableState() : {};
    if (T.path === a[0]) g.feel('tableLock', { path: a[0], branch: T.branch });
  });
  wrap(G, 'tableRunBeat', (g) => {
    const T = g.tableState ? g.tableState() : {};
    g.feel('tableBeat', { path: T.path, beat: T.beat });
  });
  wrap(G, 'tableFail', (g) => g.feel('tableLose', {}));
  wrap(G, 'tableResolveFinal', (g, a, r, pre) => {
    if (!pre && g.won) g.feel('tableWin', {});
  }, (g) => !!g.won);

  Object.assign(G, {
    feel, feelVerb, haptic, hapticsSupported, hapticsEnabled, setHaptics, reducedMotion, setReducedMotion, arrivalVoiceIds,
  });
  S.Feel = {
    FEEL_MOMENTS, FEEL_VERBS, GROUNDED_KINDS, HAPTIC_PATTERNS, ARRIVAL_VOICE, arrivalVoiceIds,
    groundedKind, groundedAudio, hapticFor, haptic, hapticsSupported, hapticsEnabled, setHaptics,
    reducedMotion, setReducedMotion,
  };
})();
