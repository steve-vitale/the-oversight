// hook2: fusion, craft failures, cookables, skill-lesson menu presence, level-up offers to the player.
'use strict';
module.exports = function (G, T, inc) {
  T.fusion = []; T.craftFail = {}; T.cookable = { days: 0, daysWithRaw: 0, daysNearFire: 0, daysRawAndFire: 0 };
  T.skillMenu = { calls: 0, nonEmpty: 0, learnOpt: 0, teachOpt: 0, picked: 0, whyNot: {} };
  T.offers = []; T.newVerbOffered = 0; T.sheets = 0;
  const NEW = (process.env.NEWVERBS || '').split(',');
  const day = () => ((G.state.scholar || {}).day) || 0;
  // fusion
  const _alg = G.alienLootGrant;
  G.alienLootGrant = function (itemId, toCorpse) {
    if (itemId === 'fusion_pellet') T.fusion.push({ d: day(), ev: 'pellet', corpse: !!toCorpse, holder: JSON.stringify(G.state.fusionReactorHolder || null) });
    return _alg.apply(this, arguments);
  };
  const _mb = G.mantleBecome;
  G.mantleBecome = function (o, n) {
    const before = JSON.stringify(G.state.fusionReactorHolder || null);
    const r = _mb.apply(this, arguments);
    T.fusion.push({ d: day(), ev: 'mantle', before, after: JSON.stringify(G.state.fusionReactorHolder || null) });
    return r;
  };
  const _t = G.tele;
  G.tele = function (type, d) {
    if (type === 'ability_granted' && d && d.id === 'fusion_reactor') T.fusion.push({ d: day(), ev: 'granted', who: d.who });
    if (type === 'loot_dropped' && d && d.id === 'fusion_pellet') T.fusion.push({ d: day(), ev: 'drop', to: d.to });
    return _t.apply(this, arguments);
  };
  // craft failure reasons: capture say() lines during craft
  const _craft = G.craft;
  G.craft = function (rid) {
    const said = []; const _say = G.say;
    G.say = function (m) { said.push(String(m).slice(0, 70)); return _say.apply(this, arguments); };
    let r;
    try { r = _craft.apply(this, arguments); } finally { G.say = _say; }
    if (!r) inc(T.craftFail, rid + ' :: ' + (said[0] || '(silent)'));
    return r;
  };
  // cookables once a day
  const _ed = G.endDay;
  G.endDay = function () {
    try {
      const inv = (G.state.scholar || {}).inventory || [];
      const raw = inv.some(i => i && i.rawKcal && i.needsCooking);
      let fire = false; try { fire = G.nearFire(); } catch (e) { /* */ }
      T.cookable.days++; if (raw) T.cookable.daysWithRaw++;
      T.cookable.rawStates = T.cookable.rawStates || {};
      for (const i of inv) if (i && i.rawKcal) inc(T.cookable.rawStates, String(i.foodState) + '/kcalEach>0=' + ((i.kcalEach || 0) > 0));
    } catch (e) { console.warn('hook2 endDay', e.message); }
    return _ed.apply(this, arguments);
  };
  const _nf = G.nearFire;
  // skill menu
  const _csc = G.convoSkillChoices;
  G.convoSkillChoices = function (vid) {
    const out = _csc.apply(this, arguments);
    T.skillMenu.calls++;
    if (out.length) T.skillMenu.nonEmpty++;
    for (const o of out) { if (o.id.indexOf('skill_learn:') === 0) T.skillMenu.learnOpt++; else T.skillMenu.teachOpt++; }
    if (!out.length) {
      try {
        const learn = this.teachableSkills(vid, 'player');
        if (!learn.length) inc(T.skillMenu.whyNot, 'learn: teacher knows nothing new');
        else inc(T.skillMenu.whyNot, 'learn: ' + this.canTeachSkill(vid, 'player', learn[0]).why);
        const give = this.teachableSkills('player', vid);
        if (!give.length) inc(T.skillMenu.whyNot, 'give: player knows nothing new');
        else inc(T.skillMenu.whyNot, 'give: ' + this.canTeachSkill('player', vid, give[0]).why);
      } catch (e) { inc(T.skillMenu.whyNot, 'err ' + e.message); }
    }
    return out;
  };
  const _csl = G.convoSkillLesson;
  G.convoSkillLesson = function () { T.skillMenu.picked++; return _csl.apply(this, arguments); };
  T.picks = [];
  const _ca = G.chooseAbility;
  G.chooseAbility = function (id, rep) {
    const ch = ((G.state.scholar || {}).abilityChoices || []).map(c => c.id + (c.src ? '[' + c.src + ']' : ''));
    T.picks.push(day() + ' pick ' + id + (rep ? ' over ' + rep : '') + ' from ' + ch.join(','));
    return _ca.apply(this, arguments);
  };
  // player level-up offers
  const _lo = G.levelUpOffers;
  G.levelUpOffers = function (track, level) {
    const out = _lo.apply(this, arguments);
    T.sheets++;
    const ids = out.map(o => o.id);
    if (ids.some(i => NEW.indexOf(i) >= 0)) T.newVerbOffered++;
    T.offers.push(day() + ' ' + track + level + ': ' + ids.join(','));
    return out;
  };
};
