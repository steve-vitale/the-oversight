// @ontology
// system: where-are-we
// description: Place knowledge. The Scattering dropped the player somewhere
//   unknown: a new run starts not knowing the landing region or its season.
//   You learn both by asking villagers (the 'where' conversation topic); what
//   they can tell you depends on THEIR familiarity with the landing region.
//   The day header shows a season line only once you know something.
// provides:
//   - placeKnown() -> {region, season, ...}: 0 unknown, 1 rough guess, 2 known (old saves: 2/2)
//   - placeTellTier(vid) -> 0|1|2: what this villager can tell (local 2, visitor 1, stranger 0)
//   - placeLearnFrom(vid) -> {tier, line}: their answer; raises placeKnown (never lowers)
//   - whereLine() -> string: the day-header season line ('' when nothing is known)
// rules:
//   - unknown_at_start: newGame sets state.scholar.placeKnown = {region:0, season:0} (code: whereAreWe.js newGame wrap)
//   - old_saves_known: a save without placeKnown reads as 2/2, nobody loses information mid-run (code: placeKnown)
//   - doesnt_show: nothing known -> whereLine is '' (Steve: "If you don't know, it doesn't show.")
//   - told_by_familiarity: local -> 2 (names region + season), visitor -> 1 (rough, may be one season off near a boundary), stranger -> no change (code: placeTellTier, placeLearnFrom)
//   - truth_at_2: a level-2 line always names the true region and Game.season() (code: placeLearnFrom)
//   - phrasing_is_data: every villager line lives in climates.json "talk" (code: wawTalk)
//   - reuses_topic_machinery: 'where' is a convoTopics.js generated topic (t2defs/t2gate/topic2Ask wraps), not a parallel menu
// consumes:
//   - Game.familiarityTier, Game.season, Game.activeRegion, Game.regionCalendar
//   - Game.t2defs/t2gate/topic2Ask/topic2HasMore/topic2Label/topic2MoreLabel (convoTopics.js)
//   - data.climates.talk, data.regions
// Steve 2026-10-14 (verbatim): "Okay add season line but that's a small
// knowledge unlock as you speak to people. Where we are in the world becomes
// part of conversation."
// Load order: index.html near the end (after build.js). Old scripts eval the
// first 80 index.html entries; inserting earlier shifted table-feared.js out.
// Known gaps (cheap later): villagers don't hold their own placeKnown (locals
// simply know); no non-conversation sources (e.g. a well-known plant hinting
// the season).

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  function warn(msg, e) { console.warn('[where] ' + msg + (e ? ': ' + (e && e.message || e) : '')); }

  const TOPIC = 'where';

  const methods = {
    wawTalk() { return ((this.data && this.data.climates) || {}).talk || {}; },

    // placeKnown: the player's place knowledge. Missing (old save, or a run
    // started by a path that never set it) = fully known.
    placeKnown() {
      const sc = (this.state && this.state.scholar) || null;
      const pk = sc && sc.placeKnown;
      if (!pk || typeof pk !== 'object') return { region: 2, season: 2, legacy: true };
      return pk;
    },

    // placeTellTier(vid): 2 = this villager knows the landing region (local),
    // 1 = rough guess (visitor / neighbour), 0 = stranger.
    placeTellTier(vid) {
      const rc = ((((this.state || {}).village) || {}).rosterChars || {})[vid];
      const vp = rc || (this.vpOf ? this.vpOf(vid) : {}) || {};
      let tags = vp.originTags;
      if (!tags || !tags.length) {
        const home = vp.homeRegion || vp.origin || '';
        tags = home && this.parseOrigin ? this.parseOrigin(home).tags : [];
      }
      let tier = 'stranger';
      try { tier = this.familiarityTier ? this.familiarityTier(tags || []) : 'stranger'; }
      catch (e) { warn('familiarityTier', e); }
      // Finer tiers from other workers map onto three levels of telling.
      if (tier === 'local' || tier === 'native') return 2;
      if (tier === 'visitor' || tier === 'neighbor' || tier === 'neighbour') return 1;
      return 0;
    },

    wawSeasonLabel(id) {
      const T = this.wawTalk();
      const cal = this.wawCalendarId();
      const ov = ((((T.calendars || {})[cal] || {}).labels) || {})[id];
      if (ov) return ov;
      const l = (T.seasonLabels || {})[id];
      if (l) return l;
      const s = String(id || '').replace(/_/g, ' ');
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    wawCalendarId() {
      try {
        const r = this.activeRegion ? this.activeRegion() : null;
        const c = r && this.regionCalendar ? this.regionCalendar(r) : null;
        return (c && c.id) || '';
      } catch (e) { warn('calendar', e); return ''; }
    },
    wawRegionName() {
      const r = (this.activeRegion && this.activeRegion()) || {};
      const T = this.wawTalk();
      const n = ((T.regions || {})[r.id] || {}).name;
      return n || String(r.name || 'here').replace(/^The\s+/, '');
    },
    wawRough() {
      const r = (this.activeRegion && this.activeRegion()) || {};
      const T = this.wawTalk();
      return ((T.families || {})[r.climateFamily] || {}).rough || (T.familyDefault || {}).rough || 'somewhere';
    },
    // Season the player believes it is: the truth at 2, truth shifted by the
    // stored guess offset at 1. null at 0.
    wawSeasonShown(pk) {
      pk = pk || this.placeKnown();
      if (!pk.season) return null;
      const se = this.season();
      if (!se || se.id === 'none') return null;
      if (pk.season >= 2 || !pk.seasonDelta) return se;
      const seasons = this.wawSeasons();
      const i = seasons.findIndex(s => s.id === se.id);
      if (i < 0) return se;
      const j = ((i + pk.seasonDelta) % seasons.length + seasons.length) % seasons.length;
      return Object.assign({}, se, { id: seasons[j].id, note: seasons[j].note });
    },
    wawSeasons() {
      const r = (this.activeRegion && this.activeRegion()) || {};
      return ((r.climate || {}).seasons) || (this.regionCalendar ? (this.regionCalendar(r).seasons || []) : []);
    },
    wawPick(vid, key, pool) {
      const p = (pool || []).filter(Boolean);
      if (!p.length) return '';
      let h = 0;
      try { h = this._hashStr(String(vid) + ':' + key + ':' + ((this.state.scholar || {}).day || 0)); }
      catch (e) { warn('hash', e); }
      return p[Math.abs(h) % p.length];
    },
    wawSeasonLines(id, kind) {
      const T = this.wawTalk();
      const cal = this.wawCalendarId();
      const ov = ((((T.calendars || {})[cal] || {}).seasons || {})[id] || {})[kind];
      if (ov && ov.length) return ov;
      return (((T.seasons || {})[id] || {})[kind]) || [];
    },
    wawFill(line) {
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
      const r = (this.activeRegion && this.activeRegion()) || {};
      const region = String(r.name || this.wawRegionName()).replace(/^The\s+/, 'the ');
      const rough = this.wawRough();
      return String(line).replaceAll('{region}', region).replaceAll('{Region}', cap(region))
        .replaceAll('{rough}', rough).replaceAll('{Rough}', cap(rough));
    },
    // Two quoted lines from one speaker read as one: "A." + "B." -> "A. B."
    wawJoin(a, b) {
      if (!a) return b || '';
      if (!b) return a;
      if (/"$/.test(a) && /^"/.test(b)) return a.slice(0, -1) + ' ' + b.slice(1);
      return a + ' ' + b;
    },

    // placeLearnFrom(vid): ask this villager where we are. Returns their line
    // and raises the player's placeKnown (never lowers it).
    placeLearnFrom(vid) {
      const T = this.wawTalk();
      const tier = this.placeTellTier(vid);
      const r = (this.activeRegion && this.activeRegion()) || {};
      const se = this.season();
      const sc = this.state.scholar;
      if (sc && !sc.placeKnown) sc.placeKnown = { region: 2, season: 2 }; // legacy: already known
      const pk = sc ? sc.placeKnown : { region: 2, season: 2 };
      pk.asked = pk.asked || {};
      pk.asked[vid] = tier;
      let line;
      const hasSeason = se && se.id && se.id !== 'none';
      if (tier >= 2) {
        const regLine = this.wawPick(vid, 'reg', ((T.regions || {})[r.id] || {}).local || T.regionLocal);
        const late = hasSeason && se.seasonDays && se.dayOfSeason > 0.8 * se.seasonDays;
        const sLines = hasSeason ? ((late && this.wawSeasonLines(se.id, 'late').length) ? this.wawSeasonLines(se.id, 'late') : this.wawSeasonLines(se.id, 'known')) : [];
        let sLine = this.wawPick(vid, 'sea', sLines);
        if (!sLine && hasSeason) sLine = '"It\'s ' + this.wawSeasonLabel(se.id).toLowerCase() + '."';
        line = this.wawJoin(this.wawFill(regLine), sLine);
        pk.region = 2;
        if (hasSeason) { pk.season = 2; delete pk.seasonDelta; }
      } else if (tier === 1) {
        const fam = (T.families || {})[r.climateFamily] || T.familyDefault || {};
        const regLine = this.wawPick(vid, 'vis', fam.visitor || (T.familyDefault || {}).visitor);
        let sLine = '';
        if (hasSeason && (pk.season || 0) < 2) {
          // Near a boundary a visitor's guess runs one season off — rough,
          // never a lie about the region family.
          const frac = se.seasonDays ? se.dayOfSeason / se.seasonDays : 0.5;
          const delta = frac <= 0.15 ? -1 : frac >= 0.85 ? 1 : 0;
          const guessed = this.wawSeasonShown({ season: 1, seasonDelta: delta });
          sLine = this.wawPick(vid, 'gss', this.wawSeasonLines(guessed.id, 'guess'))
            || '"' + this.wawSeasonLabel(guessed.id) + ', maybe?"';
          if ((pk.season || 0) < 1) { pk.season = 1; pk.seasonDelta = delta; }
        }
        line = this.wawJoin(this.wawFill(regLine), sLine);
        if ((pk.region || 0) < 1) pk.region = 1;
      } else {
        line = this.wawPick(vid, 'str', T.stranger) || '"I couldn\'t tell you."';
      }
      try { if (this.tele) this.tele('place_known', { vid, tier, region: pk.region, season: pk.season }); }
      catch (e) { warn('tele', e); }
      return { tier, line };
    },

    // whereLine: the one-line season line for the day header.
    // 0/0 -> '' (it doesn't show). 1 -> "Season: probably autumn?". 2 ->
    // "Autumn · Eastern Woodlands".
    whereLine() {
      if (!this.state || !this.state.scholar) return '';
      const pk = this.placeKnown();
      const parts = [];
      const shown = this.wawSeasonShown(pk);
      if (shown) {
        const lbl = this.wawSeasonLabel(shown.id);
        parts.push(pk.season >= 2 ? lbl : 'Season: probably ' + lbl.toLowerCase() + '?');
      }
      if (pk.region >= 2) parts.push(this.wawRegionName());
      else if (pk.region === 1) parts.push(this.wawRough() + '?');
      return parts.join(' · ');
    },

    // ---------- conversation topic (convoTopics.js generated topic) ----------
    t2fol_where(vid) {
      const tier = ((this.placeKnown().asked) || {})[vid];
      if (!tier) return [];
      const shown = tier >= 2 ? this.season() : this.wawSeasonShown();
      const note = shown && shown.note
        ? shown.note
        : ((this.wawSeasons().find(s => s.id === (shown || {}).id) || {}).note);
      if (!note) return [];
      const T = this.wawTalk();
      return [(T.notes || ['"{Note}"']).map(l => String(l).replaceAll('{Note}', note))];
    },
  };
  Object.assign(Game, methods);

  // newGame: a fresh run doesn't know where it landed.
  const _newGame = Game.newGame;
  if (typeof _newGame === 'function') {
    Game.newGame = function () {
      const r = _newGame.apply(this, arguments);
      try {
        if (this.state && this.state.scholar) this.state.scholar.placeKnown = { region: 0, season: 0 };
      } catch (e) { warn('newGame placeKnown', e); }
      return r;
    };
  }

  // The topic joins the generated-topic registry right behind 'lately':
  // where you are is the first thing anyone dropped somewhere new asks.
  const _defs = Game.t2defs;
  if (typeof _defs === 'function') {
    Game.t2defs = function () {
      const d = _defs.call(this).slice();
      const i = d.findIndex(x => x.id === 'lately');
      d.splice(i + 1, 0, { id: TOPIC, where: true });
      return d;
    };
  }
  const _gate = Game.t2gate;
  if (typeof _gate === 'function') {
    Game.t2gate = function (vid, def) {
      if (def && def.where) {
        const pk = this.placeKnown();
        if (pk.legacy || ((pk.region || 0) >= 2 && (pk.season || 0) >= 2)) return false;
        return !(pk.asked && pk.asked[vid] != null);
      }
      return _gate.call(this, vid, def);
    };
  }
  const _label = Game.topic2Label;
  Game.topic2Label = function (vid, topic) {
    if (topic === TOPIC) {
      const vs = this.wawTalk().askLabels || ['"Where do you think we are?"'];
      let h = 0;
      try { h = this._hashStr(vid + ':t2:' + topic); } catch (e) { warn('hash', e); }
      return vs[Math.abs(h) % vs.length];
    }
    return _label.call(this, vid, topic);
  };
  const _more = Game.topic2MoreLabel;
  Game.topic2MoreLabel = function (vid) {
    const c = this.convoGet(vid);
    if (c && c.thread === TOPIC) return this.wawPick(vid, 'more', this.wawTalk().moreLabels) || '"Tell me more."';
    return _more.call(this, vid);
  };
  const _ask = Game.topic2Ask;
  Game.topic2Ask = function (vid, topic) {
    if (topic !== TOPIC) return _ask.call(this, vid, topic);
    const c = this.convoGet(vid);
    const res = this.placeLearnFrom(vid);
    c.said = c.said || {};
    (c.said['t2:' + TOPIC] = c.said['t2:' + TOPIC] || []).push(res.line);
    c.thread = TOPIC; c.depth = 1;
    return res.line;
  };
  const _hasMore = Game.topic2HasMore;
  Game.topic2HasMore = function (vid) {
    const c = this.convoGet(vid);
    if (c && c.thread === TOPIC) {
      const said = (c.said || {})['t2:' + TOPIC] || [];
      return said.length < 1 + this.t2fol_where(vid).length;
    }
    return _hasMore.call(this, vid);
  };
})();
