// @ontology
// system: shelter
// description: The shelter/evacuate verb — engine-honest villager protection during apex threats (sim-siegeroster 2026-10-15: the muster beat fired and read well but moved nothing because no verb existed to move villagers off a threatened tile). shelterVillagers() moves villagers to Haven, inside the hall, behind a barricaded door: the wild router cannot jump them, the raid draft cannot spend them, duties skip them (they are mustered, not working). The cost is legible — lost production while sheltered, and unmet raiders linger and gorge (the existing havenGrowth mechanic). Release returns them to agency; inside is home, their own duties move them back out.
// provides:
//   - shelterThreatNearHaven(radius)
//   - shelterVillagers(vids, opts)
//   - shelterEveryoneBut(exceptVids, opts)
//   - releaseShelter(vids)
//   - shelterAllClear()
//   - isSheltered(vid)
//   - shelteredVillagers()
//   - shelterMusterCheck()
//   - shelterMuster()
//   - shelterStandDown()
// rules:
//   - engine_honest_movement: sheltering moves real node state (npcSetNode) and the real door sub-state (npcSetInside) — never narration alone (code: shelter.js — shelterVillagers)
//   - protection_is_mechanical: the wild jump, raid draft, and duty loops each exclude sheltered villagers by flag read, not by beat text (code: shelter.js — isSheltered; game.js — villagerMonsterTick; havenGrowth.js — havenRaidTick; game.js — duty loops)
//   - shelter_has_cost: sheltered villagers perform no duties and still eat — over-sheltering starves the village through lost production, which is the policy's episode-length pressure, not a verb bug (code: shelter.js — duty skip)
//   - scholar_never_auto_sheltered: the verb skips the player's villager id — the scholar is the player's, never mustered by policy (code: shelter.js — shelterVillagers)

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // Threat gate: a wave-4+ world monster within `radius` tiles (Chebyshev)
  // of Haven. Reuses the siegeroster gate (evidence/2026-10-15/sim-siegeroster.md)
  // — the beat proved the gate reads true; the verb gives it teeth.
  // HYSTERESIS (2026-10-17, journey crisis r20): the muster fires at radius
  // 2 but only stands down past radius 3 — a monster pacing just outside
  // the gate reads as "gone" to a hair-trigger and the village unbars into
  // a raid the same dawn (seed 2100: all-clear at dist 3, Omolara drafted
  // and killed that night). We don't unbar while it's still pacing out there.
  function shelterThreatNearHaven(radius) {
    const v = this.state.village;
    if (!v) return null;
    const r = (radius === undefined || radius === null) ? 2 : radius;
    const hx = v.px ?? 4, hy = v.py ?? 4;
    let worst = null;
    let monsters = [];
    try { monsters = this.worldMonsters() || []; } catch (e) { return null; }
    for (const m of monsters) {
      let wave = 1, mName = m.id;
      try {
        const def = (this.data.monsters || []).find(d => d.id === m.id) || {};
        wave = def.wave || 1;
        mName = def.name || m.id;
      } catch (e) { /* data lookup failed — treat as wave 1, still check distance */ }
      if (wave < 4) continue;
      const dist = Math.max(Math.abs((m.tx ?? hx) - hx), Math.abs((m.ty ?? hy) - hy));
      if (dist > r) continue;
      if (!worst || wave > worst.wave) worst = { monster: m, wave, dist, name: mName };
    }
    return worst;
  }

  function isSheltered(vid) {
    const v = this.state.village;
    return !!(v && v.sheltered && v.sheltered[vid]);
  }

  function shelteredVillagers() {
    const v = this.state.village;
    if (!v || !v.sheltered) return [];
    return Object.keys(v.sheltered).filter(vid => (v.roster || []).includes(vid));
  }

  // THE VERB. Move villagers to safety: evacuate to the Haven node, inside
  // the hall, behind the barricaded door. Real movement (npcSetNode +
  // npcSetInside), plus the shelter flag the threat channels read.
  // Returns the number newly sheltered.
  function shelterVillagers(vids, opts) {
    opts = opts || {};
    const v = this.state.village;
    if (!v || !v.roster) return 0;
    const hx = v.px ?? 4, hy = v.py ?? 4;
    const day = (this.state.scholar || {}).day || 0;
    const reason = opts.reason || 'threat';
    v.sheltered = v.sheltered || {};
    const moved = [];
    for (const vid of (vids || [])) {
      if (!(v.roster || []).includes(vid)) continue;
      if (vid === this.villagerId) continue; // the scholar is the player's — never mustered
      if (v.sheltered[vid]) continue; // already inside
      this.npcSetNode(vid, hx, hy); // evacuate: off the threatened tile, to Haven
      this.npcSetInside(vid, true); // inside the hall
      v.sheltered[vid] = { since: day, reason };
      moved.push(vid);
    }
    if (moved.length && !opts.quiet) {
      const names = moved.map(vid => {
        try { return this.displayName(vid); } catch (e) { return 'someone'; }
      });
      const threat = opts.threatName ? ` — ${opts.threatName} hunts the treeline` : '';
      this.say(`🚪 ${names.join(', ')} ${moved.length === 1 ? 'hurries' : 'hurry'} inside and bar${moved.length === 1 ? 's' : ''} the hall door${threat}. No one walks the treeline tonight.`);
    }
    return moved.length;
  }

  // Everyone inside except the named holdouts (the watch, the tender, the
  // stubborn). The common muster shape: the village shelters, the fighters stay out.
  function shelterEveryoneBut(exceptVids, opts) {
    const v = this.state.village;
    if (!v || !v.roster) return 0;
    const except = {};
    for (const vid of (exceptVids || [])) except[vid] = true;
    const vids = (v.roster || []).filter(vid => vid !== this.villagerId && !except[vid]);
    return this.shelterVillagers(vids, opts);
  }

  // Release: the flag lifts, agency resumes. Inside stays true — inside is
  // home; their own duties and initiative move them back out when assigned.
  // Returns the number released.
  function releaseShelter(vids) {
    const v = this.state.village;
    if (!v || !v.sheltered) return 0;
    const list = vids || Object.keys(v.sheltered);
    let n = 0;
    for (const vid of list) {
      if (v.sheltered[vid]) { delete v.sheltered[vid]; n++; }
    }
    return n;
  }

  // All-clear: release everyone, narrate the stand-down once.
  function shelterAllClear(opts) {
    opts = opts || {};
    const n = this.releaseShelter();
    if (n > 0 && !opts.quiet) {
      this.say(`📯 ALL CLEAR — the treeline is quiet. The hall door unbars; the village breathes out and goes back to work.`);
    }
    return n;
  }

  // GAME-SIDE MUSTER (2026-10-17, journey crisis r20): the episode manager.
  // The village musters ITSELF — no bot policy needed. Called daily from
  // progDaily (wrapped below, ahead of the havenGrowth raid tick so the
  // muster precedes the draft). The muster beat is the scouts' report —
  // threat named via monsterNoun (knowledge-gated), never the true name.
  // Design calls (mine — Steve overrules):
  // - AUTO-muster, not a player button: wave-4+ vs villagers is a 1-2-round
  //   death (siegeroster diagnosis) — people don't wait for orders to get
  //   inside. The player's interesting calls remain: sortie vs endure
  //   (lingerer answers) and early stand-down (their risk).
  // - A threat the player stood down for is NOT re-mustered (stamped on the
  //   monster instance — a new threat re-musters). shelterMuster() clears
  //   the stamps: the player re-mustering on purpose.
  function shelterMusterCheck() {
    const v = this.state.village;
    if (!v || !v.roster) return { mustered: false };
    const mustered = !!v.shelterMustered;
    // HYSTERESIS: muster at radius 2, stand down only past radius 3.
    let threat = null;
    try { threat = this.shelterThreatNearHaven ? this.shelterThreatNearHaven(mustered ? 3 : 2) : null; } catch (e) { threat = null; }
    if (threat && threat.monster && threat.monster.shelterStoodDown) threat = null;
    const day = (this.state.scholar || {}).day || 0;
    if (threat && !mustered) {
      let noun = threat.name || 'something';
      try { noun = (typeof this.monsterNoun === 'function' ? this.monsterNoun(threat.monster.id) : noun) || noun; } catch (e) {}
      this.say(`📯 MUSTER — scouts report ${noun} hunting near Haven, and it is beyond us. Everyone inside. No one walks the treeline alone — the garden crews double up, the hunters stand down. We outlast it.`);
      let n = 0;
      try { n = this.shelterEveryoneBut([], { reason: 'muster', threatName: noun, quiet: true }); } catch (e) { n = 0; }
      v.shelterMustered = { since: day, threat: noun };
      // The village remembers the muster — the lately system carries it
      // (convoTopics.js 'muster' kind). Every sheltered villager lived it.
      try {
        for (const vid of this.shelteredVillagers()) {
          if (this.remember) this.remember(vid, 'mustered', 'mustered inside — ' + noun + ' hunts the treeline', { threat: noun });
        }
      } catch (e) {}
      return { mustered: true, n };
    } else if (!threat && mustered) {
      try { this.shelterAllClear(); } catch (e) {}
      delete v.shelterMustered;
      return { mustered: false };
    }
    return { mustered };
  }

  // Manual re-muster (Haven panel): clears stand-down stamps, then runs the
  // episode check. No threat, no muster — honest.
  function shelterMuster() {
    const v = this.state.village;
    if (!v) return 0;
    try {
      for (const m of (this.worldMonsters() || [])) {
        if (m && m.shelterStoodDown) delete m.shelterStoodDown;
      }
    } catch (e) {}
    const r = this.shelterMusterCheck ? this.shelterMusterCheck() : null;
    return (r && r.n) || 0;
  }

  // Manual stand-down (Haven panel): the player's call, their risk. Releases
  // everyone and stamps THIS threat stood-down so dawn doesn't re-muster
  // behind their back. A new threat still musters.
  function shelterStandDown() {
    const v = this.state.village;
    if (!v || !v.shelterMustered) return 0;
    let threat = null;
    try { threat = this.shelterThreatNearHaven ? this.shelterThreatNearHaven() : null; } catch (e) {}
    if (threat && threat.monster) threat.monster.shelterStoodDown = true;
    let n = 0;
    try { n = this.shelterAllClear({ quiet: true }); } catch (e) { n = 0; }
    delete v.shelterMustered;
    if (n > 0) {
      let noun = 'the threat';
      try {
        noun = threat ? ((typeof this.monsterNoun === 'function' ? this.monsterNoun(threat.monster.id) : null) || threat.name || noun) : noun;
      } catch (e) {}
      this.say(`You give the word — the hall door unbars and the village files back out, eyes on the treeline. ${noun} still hunts out there; the muster waits on your word now.`);
    }
    return n;
  }

  const methods = {
    shelterThreatNearHaven,
    shelterVillagers,
    shelterEveryoneBut,
    releaseShelter,
    shelterAllClear,
    isSheltered,
    shelteredVillagers,
    shelterMusterCheck,
    shelterMuster,
    shelterStandDown,
  };
  Object.assign(Game, methods);

  // DAILY MUSTER (2026-10-17): the village musters itself. This wrap chains
  // after havenGrowth's progDaily wrap (shelter.js loads later), so the
  // muster check runs BEFORE the raid tick — the muster precedes the draft.
  try {
    const _progDaily = Game.progDaily;
    Game.progDaily = function () {
      try { this.shelterMusterCheck(); } catch (e) {}
      const r = _progDaily ? _progDaily.apply(this, arguments) : undefined;
      return r;
    };
  } catch (e) {}
})();
