#!/usr/bin/env node
// OVE-102 — Voice of the Relay Be Heard reaches linked/allied foreign villages.
//
// god.scale.army: "Every allied village hears your word the same day."
// Settlement: be_heard stamps ov.voiceDay, nudges opinion, and tends link
// trust for villages that are linked OR allied. Seeded proof + failing
// control that removes voiceDeliverAllied. Muse prices untouched.
'use strict';
const K = require('./lib');
const T = K.reporter('voice-be-heard-allied-villages');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 102) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const quiet = (fn) => { const l = K.captureSays(Game); try { return fn(); } finally { l.restore(); } };
  function clearGods() { s.godhood = { recognized: {}, active: [] }; v.npcGodhood = {}; }
  function ascendPlayer(id) {
    s.godhood = { recognized: {}, active: [] };
    quiet(() => GH.recognitionCeremony(Game, id));
    return Game.holderGod('player');
  }
  const use = (id, tgt) => quiet(() => Game.useAbility('god', id, tgt));

  const ovs = (Game.state.otherVillages || []).filter(ov => ov && ov.id && ov.id !== 'haven');
  T.ok('newRun supplies foreign villages', ovs.length >= 3, ovs.length);
  const linked = ovs[0];
  const alliedOnly = ovs[1];
  const stranger = ovs[2];
  T.ok('three distinct foreign villages for fixtures', !!(linked && alliedOnly && stranger) &&
    linked.id !== alliedOnly.id && alliedOnly.id !== stranger.id);

  function resetForeign() {
    for (const ov of ovs) {
      ov.opinion = 20;
      delete ov.voiceDay;
      ov.allies = (ov.allies || []).filter(a => a !== 'haven');
    }
    const links = Game.hierarchyState();
    links.length = 0;
    const m = Game.mshipState();
    m.allies = [];
  }

  function pinLink(ov, trust) {
    const links = Game.hierarchyState();
    links.push({
      id: 'link_' + ov.id,
      kind: 'covenant',
      a: 'haven',
      b: ov.id,
      status: 'active',
      trust: trust == null ? 40 : trust,
      day: s.day || 1,
      arrears: 0,
    });
    return Game.linkWith(ov.id);
  }

  T.section('data + wiring');
  {
    clearGods();
    resetForeign();
    T.ok('voiceReachVillageIds is exported', typeof Game.voiceReachVillageIds === 'function');
    T.ok('voiceDeliverAllied is exported', typeof Game.voiceDeliverAllied === 'function');
    T.ok('no reach without link or alliance', Game.voiceReachVillageIds().length === 0);
    pinLink(linked, 40);
    Game.formAlliance(alliedOnly.id);
    const reach = Game.voiceReachVillageIds().slice().sort();
    T.ok('reach lists linked and allied villages', reach.join(',') === [alliedOnly.id, linked.id].sort().join(','),
      JSON.stringify(reach));
    T.ok('stranger stays out of reach', !reach.includes(stranger.id));
  }

  T.section('CONTROL / TREATMENT / FAILING CONTROL: linked foreign settlement');
  {
    clearGods();
    resetForeign();
    const link = pinLink(linked, 40);
    stranger.opinion = 20;
    const op0 = linked.opinion;
    const tr0 = link.trust;
    const st0 = stranger.opinion;

    T.ok('CONTROL: without Voice, be_heard refuses and foreign opinion is still',
      use('be_heard') === false && linked.opinion === op0 && link.trust === tr0 && !linked.voiceDay);

    T.ok('player ascends Voice of the Relay', ascendPlayer('voice_of_the_relay') === 'voice_of_the_relay');
    s.kcal = 4000;
    const day = s.day || 1;
    const ok = use('be_heard');
    T.ok('TREATMENT: Be Heard fires', ok === true);
    T.ok('TREATMENT: linked village opinion rises by play.trust', linked.opinion === op0 + 2, linked.opinion);
    T.ok('TREATMENT: linked village link trust rises by play.trust', link.trust === tr0 + 2, link.trust);
    T.ok('TREATMENT: linked village voiceDay is today', linked.voiceDay === day, linked.voiceDay);
    T.ok('TREATMENT: stranger village is untouched', stranger.opinion === st0 && stranger.voiceDay == null,
      JSON.stringify({ opinion: stranger.opinion, voiceDay: stranger.voiceDay }));

    // Failing control: strip the army delivery hook; Haven still hears.
    clearGods();
    resetForeign();
    const link2 = pinLink(linked, 40);
    const opC = linked.opinion;
    const trC = link2.trust;
    ascendPlayer('voice_of_the_relay');
    s.kcal = 4000;
    // Clear prior day-use stamp so Be Heard can fire again after re-ascend.
    if (s.godhood) s.godhood._godDay = {};
    delete s._godDay;
    const hook = Game.voiceDeliverAllied;
    Game.voiceDeliverAllied = function () { return 0; };
    let stripped;
    try {
      stripped = use('be_heard');
    } finally {
      Game.voiceDeliverAllied = hook;
    }
    T.ok('FAILING CONTROL: Be Heard still fires for Haven', stripped === true);
    T.ok('FAILING CONTROL: Haven voiceDay still stamped', v.voiceDay === (s.day || 1), v.voiceDay);
    T.ok('FAILING CONTROL: stripping voiceDeliverAllied leaves foreign opinion/trust cold',
      linked.opinion === opC && link2.trust === trC && linked.voiceDay == null,
      JSON.stringify({ opinion: linked.opinion, trust: link2.trust, voiceDay: linked.voiceDay }));
  }

  T.section('alliance-only foreign village (no link)');
  {
    clearGods();
    resetForeign();
    Game.formAlliance(alliedOnly.id);
    const op0 = alliedOnly.opinion;
    ascendPlayer('voice_of_the_relay');
    s.kcal = 4000;
    if (s.godhood) s.godhood._godDay = {};
    delete s._godDay;
    T.ok('Be Heard reaches alliance-only village', use('be_heard') === true);
    T.ok('alliance-only opinion rises', alliedOnly.opinion === op0 + 2, alliedOnly.opinion);
    T.ok('alliance-only voiceDay stamped', alliedOnly.voiceDay === (s.day || 1), alliedOnly.voiceDay);
    T.ok('no link means no linkWith for alliance-only', !Game.linkWith(alliedOnly.id));
  }

  T.section('same-day fight-start rally for that village\'s people');
  {
    clearGods();
    resetForeign();
    // Prove the foreign voiceDay stamp alone rallies that village's blades
    // even when Haven's stamp is absent (army delivery, not Haven day-rally).
    linked.voiceDay = s.day || 1;
    delete v.voiceDay;
    Game.tbfight = null;
    const mf = quiet(() => K.fight(Game, 'hushwolf', { px: 2, py: 2, mx: 5, my: 5, hp: 100 }));
    const f = Game.tbfight;
    T.ok('fight fixture started', !!(f && mf));
    const ally = {
      key: 'a_foreign', kind: 'ally', villagerId: 'face_foreign', villageId: linked.id,
      name: 'Relay Face', emoji: '🛡️', hp: 40, maxHp: 40, speed: 3,
      mx: 3, my: 3, alive: true, fled: false, ai: 'brave',
    };
    f.fighters.push(ally); f.order.push(ally.key);
    quiet(() => Game.tbVillagerTurn(ally));
    T.ok('TREATMENT: foreign ally whose village heard today starts rallied',
      (ally.rallied || 0) >= 2 && ally._gvVoiced === true, ally.rallied);

    // Failing control: clear the foreign stamp; same fighter shape, no rally.
    delete linked.voiceDay;
    delete ally._gvVoiced;
    ally.rallied = 0;
    ally.rallyBuff = 0;
    const g = f._gv || (f._gv = {});
    g.saidVoice = false;
    quiet(() => Game.tbVillagerTurn(ally));
    T.ok('FAILING CONTROL: without that village voiceDay the foreign ally is not day-rallied',
      !ally._gvVoiced && (ally.rallied || 0) === 0, ally.rallied);
    Game.tbfight = null;
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
