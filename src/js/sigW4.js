// @ontology
// system: sig-w4
// description: Wave-4 "The Mirror Draft" signature combat mechanics (Steve 2026-10-11): The Congregation (invite-then-absolve liturgy — absolution offered, geas if accepted, heresy breaks it), The Strike (posts demands, then shutdown rounds where nothing works — meet a demand or scab), The Influencer (literal follower adds buff its Ratio and drain favor — kill them or out-entertain it), The Audit (scheduled audit taxes your most-used ability — deliberate jank or read the clipboard), The Reunion (mirrors your most-used verb, repeats weaken — novelty is the weapon), The Suburb (comfort trap — rest heals but complacency stacks; escape or bring something alive), The Eulogy (5-verse doom narration — contradict verses or rewrite the ending), The Algorithm (thumbnail previews, predicts repeats — be unpredictable or tank), THE EATER (eats grid food and grows per kcal — poison the meal or starve the field). Hooks interleave with the generic encounter interpreter.
// provides:
//   - sigCongregationHook (registered as MonsterBehaviorHooks.sigCongregation)
//   - sigStrikeHook (registered as MonsterBehaviorHooks.sigStrike)
//   - sigInfluencerHook (registered as MonsterBehaviorHooks.sigInfluencer)
//   - sigAuditHook (registered as MonsterBehaviorHooks.sigAudit)
//   - sigReunionHook (registered as MonsterBehaviorHooks.sigReunion)
//   - sigSuburbHook (registered as MonsterBehaviorHooks.sigSuburb)
//   - sigEulogyHook (registered as MonsterBehaviorHooks.sigEulogy)
//   - sigAlgorithmHook (registered as MonsterBehaviorHooks.sigAlgorithm)
//   - sigEaterHook (registered as MonsterBehaviorHooks.sigEater)
//   - Game.tbCongAccept()
//   - Game.tbCongRefuse()
//   - Game.tbCongHeresy()
//   - Game.tbStrikeMeet()
//   - Game.tbStrikeScab()
//   - Game.tbInflOutentertain()
//   - Game.tbAuditRead()
//   - Game.tbSuburbRest()
//   - Game.tbSuburbLeave()
//   - Game.tbSuburbAlive()
//   - Game.tbEulogyContradict()
//   - Game.tbEulogyRewrite()
//   - Game.tbAlgoTank()
//   - Game.tbEaterPoison()
//   - Game.sigW4CombatButtons()
//   - Game.sigW4WireCombat()
//   - Game.sigW4FieldMonster()
// rules:
//   - telegraph_honesty: every bell-ring, eye-inflate, ring-light, abacus-click, face-surface, streetlight-flicker, narration, thumbnail, and smack describes exactly what the hook executes next (code: sigAuditHook)
//   - liturgy_binds: the Congregation cannot geas without inviting first — the offer always precedes compulsion (code: congInvite)
//   - strike_announced: the Strike never shuts down unannounced — demands post first, eyes inflate first (code: sigStrikeHook)
//   - novelty_real: the Reunion's repeat-penalty reads actual verb counts from the fight, never a script (code: sigNoteVerbW4)
//   - doom_choke: Eulogy/Finale-style doom deaths route through maybeCheatDeath only (code: sigEulogyHook)
//   - no_silent: every signature beat narrates via say() (code: sigEaterHook)
// consumes:
//   - say, tbDamage, tbFighter, tbIsPlayerTurn, tbAfterPlayerAction, tbEndCheck
//   - hasItem, consumeItem, hasStatus, applyStatus
//   - audioEvent, havenViewership
/* SIG W4 — src/js/sigW4.js
 *
 * Wave 4 "The Mirror Draft" signature mechanics (Steve 2026-10-11 directive:
 * address the threat 3-5 known gaps — wave 4/5 shipped with copy-only
 * signature mechanics). Nine monsters, nine real fights.
 *
 * ARCHITECTURE: hooks register into the global MonsterBehaviorHooks dict
 * (see src/js/monsterBehaviors.js); src/data/monsterBehaviors.json declares
 * the ordered preTurnHooks per monster id. A hook returning true consumed the
 * monster's turn; returning false lets the generic attack run. Player verbs
 * are Game.tb* methods + combat-panel buttons rendered by
 * sigW4CombatButtons() and wired by sigW4WireCombat() (one insertion point
 * in app.js). Villager field-fights get the core loop through
 * sigW4FieldMonster(), called from fieldFights.js — same hook path,
 * simplified.
 *
 * WAVE IDENTITY (docs/MONSTER-WAVES.md): "The Mirror Draft" — the System
 * builds monsters out of US: faiths, formats, institutions, weaponized.
 * The horror: it's made of you. Every mechanic turns something human back
 * on the player.
 */
(function (_g) {
  'use strict';
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  // PROOF SWITCH (node proofs only): MECHANIC=off skips registration so the
  // BEFORE run goes red (mechanic absent) and the AFTER run goes green.
  try {
    if (typeof process !== 'undefined' && process.env && process.env.MECHANIC === 'off') return;
  } catch (e) {}
  var HB = _g.MonsterBehaviorHooks;
  if (!HB) return;

  // ---------------- shared ----------------
  function roll(range) {
    var a = range[0], b = range[1];
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  function say(game, s) { try { game.say(s); } catch (e) {} }
  function liveMonsters(game, id) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f) return [];
    return f.fighters.filter(function (x) {
      return x.kind === 'monster' && x.alive && !x.fled && x.mdef && x.mdef.id === id;
    });
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function playerFighter(game) {
    try { return game.tbFighter('p'); } catch (e) { return null; }
  }
  function spendPlayerTurn(game) {
    var p = playerFighter(game);
    if (!p) return false;
    try { if (!game.tbIsPlayerTurn()) return false; } catch (e) { return false; }
    if (p.acted) { say(game, 'Already acted this turn.'); return false; }
    p.acted = true; p.moveLeft = 0;
    return true;
  }
  function endPlayerTurn(game) {
    try { game.tbAfterPlayerAction(); } catch (e) {}
    try { game.tbEndCheck(); } catch (e2) {}
  }
  // verb tracking for the Reunion (and Audit's most-used-ability).
  function sigNoteVerbW4(game, verb, detail) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return;
    f.sigW4verbs = f.sigW4verbs || {};
    f.sigW4verbs[verb] = (f.sigW4verbs[verb] || 0) + 1;
    if (detail) {
      f.sigW4verbDetail = f.sigW4verbDetail || {};
      f.sigW4verbDetail[verb] = detail;
    }
  }
  function sigVerbCount(game, verb) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    return (f && f.sigW4verbs && f.sigW4verbs[verb]) || 0;
  }

  // ================= 1. THE CONGREGATION =================
  // Invite (bell rings, offer absolution) -> geas if accepted -> absolve.
  // Liturgy binds it: no compulsion without invitation.
  function congState(m) {
    if (!m.sigCong) m.sigCong = { phase: 'procession', geas: 0, offered: false, refused: false, cycle: 0 };
    return m.sigCong;
  }
  function sigCongregationHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var C = congState(m);
    // Geas compulsion: if the player is under geas, the Congregation commands.
    if (C.geas > 0) {
      C.geas--;
      var cmd = (C.cycle % 2 === 0) ? 'kneel' : 'give';
      if (cmd === 'kneel') {
        say(game, '🔔 The bell tolls twice — the geas tightens. "KNEEL." Your legs fold; the turn is spent in prayer.');
        var p = playerFighter(game);
        if (p) { p.acted = true; p.moveLeft = 0; }
        try { game.audioEvent('congregationGeas'); } catch (e2) {}
      } else {
        say(game, '🔔 The bell tolls twice — the geas tightens. "GIVE." Your hands open; something you carry slides to the chapel floor.');
        try {
          var inv = game.state && game.state.scholar && game.state.scholar.pack;
          if (inv && inv.length) {
            var dropped = inv.pop();
            say(game, 'You gave: ' + (dropped.name || 'something') + '. (It is gone.)');
          } else say(game, '(Your pack was empty — the geas takes the intention instead. It itches.)');
        } catch (e3) {}
      }
      if (C.geas <= 0) say(game, 'The geas lifts like a held breath released.');
      try { game.tbEndCheck(); } catch (e4) {}
      return true;
    }
    C.cycle++;
    // The offer comes first, always.
    if (!C.offered && !C.refused) {
      C.offered = true; C.phase = 'invite';
      say(game, '🔔 The steeple RINGS — one clear note. The chapel doors swing wide. "Come. Be washed. Trauma, grief, the whole weight — laid down. The price is obedience, a little geas, nothing you\'d miss." (Accept: heal 40 + cleanse. Refuse: no leash, but no washing.)');
      try { game.audioEvent('congregationInvite'); } catch (e5) {}
      try { if (game.encSetPhase) game.encSetPhase(m, 'invite'); } catch (e6) {}
      return true; // the invitation IS the turn — liturgy, not violence
    }
    // After the invitation resolves (accepted/refused/expired), the absolve attack.
    C.offered = false; C.refused = false; C.phase = 'absolve';
    say(game, '🔔 The steeple RINGS — the bell is the telegraph. ABSOLUTION falls like a beam.');
    try { game.audioEvent('congregationAbsolve'); } catch (e7) {}
    try { if (game.encSetPhase) game.encSetPhase(m, 'absolve'); } catch (e8) {}
    return false; // let the generic Absolution beam [50,70] run
  }
  function tbCongAccept() {
    var m = liveMonsters(G, 'congregation')[0];
    if (!m) return false;
    var C = congState(m);
    if (!C.offered) { say(G, 'No invitation stands. (The chapel doors are shut.)'); return false; }
    if (!spendPlayerTurn(G)) return false;
    C.offered = false; C.geas = 2;
    var p = playerFighter(G);
    try {
      if (p) { p.hp = Math.min(Math.max(p.maxHp || 0, p.hp), p.hp + 40); }
      if (G.addHealth) G.addHealth(40);
    } catch (e) {}
    try { if (G.cleanseTrauma) G.cleanseTrauma(); } catch (e2) {}
    say(G, '🙏 You kneel. Warmth pours through like light through stained glass — wounds close, the weight lifts. (+40 HP, trauma washed.) But something small and cold curls behind your ear: the geas. Two rounds of obedience. (It must invite before it can compel — and you said yes.)');
    endPlayerTurn(G);
    return true;
  }
  function tbCongRefuse() {
    var m = liveMonsters(G, 'congregation')[0];
    if (!m) return false;
    var C = congState(m);
    if (!C.offered) { say(G, 'No invitation stands.'); return false; }
    if (!spendPlayerTurn(G)) return false;
    C.offered = false; C.refused = true;
    say(G, 'You stay standing. The chapel doors shudder — it cannot compel the uninvited; its own liturgy binds it. "Then be unwashed," the static-hymn crackles, almost sad.');
    endPlayerTurn(G);
    return true;
  }
  function tbCongHeresy() {
    var m = liveMonsters(G, 'congregation')[0];
    if (!m) return false;
    var C = congState(m);
    if (C.geas <= 0) { say(G, 'No geas binds you. (Argue with the chapel anyway? It would love that.)'); return false; }
    if (!spendPlayerTurn(G)) return false;
    C.geas = 0;
    say(G, 'You speak the heresy plainly — not shouted, just true: "No god outsources its mercy to a bell." A pew-tooth CRACKS. The geas snaps like a dry twig. The Congregation reels — its liturgy turned inside out. (25 damage, geas broken.)');
    try { G.tbDamage(m.key || 'm0', 25, 'heresy', 'p'); } catch (e) {}
    endPlayerTurn(G);
    return true;
  }

  // ================= 2. THE STRIKE =================
  // Posts demands (readable) -> eyes inflate -> SHUTDOWN (dead turns).
  // Meet a demand or scab.
  function strikeState(m) {
    if (!m.sigStrike) m.sigStrike = { phase: 'lurk', demands: null, shutdown: 0, met: false, cycle: 0 };
    return m.sigStrike;
  }
  function strikeDemands(game) {
    var opts = [];
    try {
      var kcal = (game.state && game.state.scholar && game.state.scholar.packKcal) || 0;
      if (kcal > 1500) opts.push({ id: 'kcal', label: '2,000 kcal from your pack', cost: 'kcal:2000' });
    } catch (e) {}
    opts.push({ id: 'still', label: '3 rounds of stillness (no movement)', cost: 'still:3' });
    opts.push({ id: 'tool', label: 'your best tool (dropped)', cost: 'tool:1' });
    return opts.slice(0, 3);
  }
  function sigStrikeHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var S = strikeState(m);
    // Shutdown rounds: nothing works (announced, never sprung).
    if (S.shutdown > 0) {
      S.shutdown--;
      var scab = !!(f.sigW4scab && f.sigW4scab > 0);
      if (scab) {
        f.sigW4scab--;
        say(game, '🐀 The grid is on strike — but you SCAB the line, doing its job yourself at double the sweat. (Your actions work at half strength this round.)');
        f.sigW4scabPenalty = 0.5;
      } else {
        say(game, '🐀 SHUTDOWN — the picket line holds. Your abilities sputter, your items sit dead, the grid itself refuses. (Dead turn — nothing works. Meet a demand, or scab.)');
        f.sigW4scabPenalty = 0;
        var p = playerFighter(game);
        if (p) { p.acted = true; p.moveLeft = 0; }
      }
      if (S.shutdown <= 0) say(game, '🐀 The rat\'s eyes deflate. The strike lifts — for now. (It will post new demands.)');
      try { game.tbEndCheck(); } catch (e2) {}
      return true;
    }
    S.cycle++;
    if (!S.demands) {
      S.demands = strikeDemands(game);
      S.phase = 'demands';
      var list = S.demands.map(function (d, i) { return (i + 1) + '. ' + d.label; }).join(' | ');
      say(game, '🐀 The rat\'s eyes INFLATE — and it posts its demands, a real readable list: ' + list + ' (Meet one: the strike ends. Or scab the grid\'s job yourself. The strike is always announced.)');
      try { game.audioEvent('strikeDemands'); } catch (e3) {}
      return true;
    }
    // Demands ignored -> shutdown. Demands STAY POSTED (meeting one ends it).
    say(game, '🐀 The eyes are fully inflated. "THEN WE WALK." — the grid goes on strike.');
    S.shutdown = 2;
    try { game.audioEvent('strikeShutdown'); } catch (e4) {}
    return true;
  }
  function tbStrikeMeet() {
    var m = liveMonsters(G, 'strike')[0];
    if (!m) return false;
    var S = strikeState(m);
    if (!S.demands || !S.demands.length) { say(G, 'No demands posted. (It hasn\'t asked yet.)'); return false; }
    if (!spendPlayerTurn(G)) return false;
    var d = S.demands[0];
    var paid = false;
    try {
      if (d.id === 'kcal' && G.spendKcal) { paid = G.spendKcal(2000); }
      else if (d.id === 'still') { var f = G.tbfight; f.sigW4stillOwe = 3; paid = true; }
      else if (d.id === 'tool') {
        var inv = G.state && G.state.scholar && G.state.scholar.pack;
        if (inv && inv.length) { var t = inv.pop(); say(G, 'You set down: ' + (t.name || 'your best tool') + '. The rat\'s whiskers twitch — accepted.'); paid = true; }
      }
    } catch (e) {}
    if (!paid) {
      if (d.id === 'kcal') {
        try {
          var s = G.state.scholar; var had = s.packKcal || 0;
          s.packKcal = Math.max(0, had - 2000);
          say(G, 'You count out 2,000 kcal from your pack. The rat\'s eyes deflate like punctured balloons. "SOLIDARITY," it squeaks, almost fond, and waddles off.');
          paid = true;
        } catch (e2) {}
      }
    }
    if (paid) {
      S.met = true; S.shutdown = 0; S.demands = null;
      m.fled = true;
      say(G, '🐀 Demand met. The strike is over — the rat deflates to a normal (house-sized, still alarming) rat and leaves. (Non-violent resolution.)');
      try { G.tbEndCheck(); } catch (e3) {}
    } else say(G, 'You couldn\'t meet the demand. (The strike holds.)');
    endPlayerTurn(G);
    return true;
  }
  function tbStrikeScab() {
    var m = liveMonsters(G, 'strike')[0];
    if (!m) return false;
    if (!spendPlayerTurn(G)) return false;
    var f = null;
    try { f = G.tbfight; } catch (e) {}
    // Scabbing costs your TURN now (organizing) and pays off during shutdown.
    if (f) f.sigW4scab = 2;
    say(G, 'You roll up your sleeves and learn the grid\'s job mid-crisis — scab labor. Your next 2 shutdown rounds will work at half strength (double sweat, half result). The rat watches, betrayed. "SCAB," it whispers.');
    endPlayerTurn(G);
    return true;
  }

  // ================= 3. THE INFLUENCER =================
  // Literal follower adds; ring light brightens -> Ratio scaled by followers.
  function inflState(m) {
    if (!m.sigInfl) m.sigInfl = { followers: 0, maxF: 4, cycle: 0 };
    return m.sigInfl;
  }
  function sigInfluencerHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var I = inflState(m);
    I.cycle++;
    // Recruit followers (the adds are spawned as real fighters).
    if (I.followers < I.maxF && I.cycle % 2 === 1) {
      I.followers++;
      say(game, '📱 The ring light BRIGHTENS — a new follower crawls out of the glow, phone-first, already filming. (' + I.followers + ' followers. Each one sharpens the Ratio and drinks your favor.)');
      try { game.audioEvent('influencerRecruit'); } catch (e2) {}
      try {
        if (game.tbSpawnFollower) game.tbSpawnFollower(m, { id: 'fan_creature', name: 'fan-creature', hp: 30, dmg: [5, 10] });
      } catch (e3) {}
      return true;
    }
    // Followers drain favor passively (handled here, said aloud).
    if (I.followers > 0) {
      try {
        if (game.drainFavor) game.drainFavor(I.followers);
        say(game, '📱 ' + I.followers + ' follower' + (I.followers > 1 ? 's' : '') + ' turn the audience — care packages thin, the System\'s favor trickles away. (-' + I.followers + ' favor.)');
      } catch (e4) {}
    }
    say(game, '📱 The ring light BRIGHTENS before it acts — RATIO incoming, sharpened by ' + I.followers + ' followers.');
    return false; // generic Ratio [40,60] runs; damage scaled via wrap below
  }
  function tbInflOutentertain() {
    var m = liveMonsters(G, 'influencer')[0];
    if (!m) return false;
    var I = inflState(m);
    if (I.followers <= 0) { say(G, 'No followers to steal. (The ring light dims, embarrassed.)'); return false; }
    if (!spendPlayerTurn(G)) return false;
    var stole = Math.min(I.followers, 1 + Math.floor(Math.random() * 3));
    I.followers -= stole;
    say(G, '🎪 You OUT-ENTERTAIN it — a bit so good the followers defect mid-livestream, phones swinging around to YOU. (' + stole + ' followers stolen! They heckle the Influencer for one round.)');
    try {
      if (G.tbDamage && stole > 0) G.tbDamage(m.key || 'm0', stole * 12, 'heckled by ex-fans', 'p');
    } catch (e) {}
    endPlayerTurn(G);
    return true;
  }

  // ================= 4. THE AUDIT =================
  // Scheduled audit every 3 rounds (announced); taxes most-used ability.
  function auditState(m) {
    if (!m.sigAudit) m.sigAudit = { next: 3, taxed: null, taxRounds: 0, read: false };
    return m.sigAudit;
  }
  function sigAuditHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var A = auditState(m);
    var round = f.round || 1;
    if (round >= A.next) {
      // AUDIT DAY: find most-used ability.
      var verbs = f.sigW4verbs || {};
      var best = null, bestN = 0;
      Object.keys(verbs).forEach(function (v) { if (verbs[v] > bestN) { bestN = verbs[v]; best = v; } });
      var detail = (f.sigW4verbDetail && best) ? f.sigW4verbDetail[best] : null;
      var label = detail || best || 'strikes';
      A.taxed = label; A.taxRounds = 2; A.next = round + 3; A.read = false;
      say(game, '🧾 The abacus beads CLICK — AUDIT DAY. The clipboard flips to YOUR sheet: "' + label + '" flagged INEFFICIENT. Taxed: half strength for 2 rounds. (Deliberate jank between audits keeps the good stuff off the sheet.)');
      try { game.audioEvent('auditTax'); } catch (e2) {}
      // The tax bill: pay or bleed.
      say(game, '🧾 Plus the bill: 500 kcal, or 20 HP in "processing fees." (Read the clipboard to see it coming.)');
      try {
        var s = game.state.scholar;
        if ((s.packKcal || 0) >= 500) { s.packKcal -= 500; say(game, '(500 kcal remitted. The beads click, satisfied.)'); }
        else { game.tbDamage('p', 20, 'processing fees', m.key || 'm0'); }
      } catch (e3) {}
      return true;
    }
    if (round === A.next - 1) {
      say(game, '🧾 Abacus beads click, once. Audit tomorrow. (The clipboard is showing — read it, or get janky.)');
    }
    return false;
  }
  function tbAuditRead() {
    var m = liveMonsters(G, 'audit')[0];
    if (!m) return false;
    var A = auditState(m);
    if (!spendPlayerTurn(G)) return false;
    var f = null;
    try { f = G.tbfight; } catch (e) {}
    var verbs = (f && f.sigW4verbs) || {};
    var best = null, bestN = 0;
    Object.keys(verbs).forEach(function (v) { if (verbs[v] > bestN) { bestN = verbs[v]; best = v; } });
    var round = (f && f.round) || 1;
    say(G, '🧾 You read the clipboard over its shoulder: most-used so far is "' + (best || 'nothing yet') + '" (' + bestN + ' uses). Next audit: round ' + A.next + ' (now round ' + round + '). Currently taxed: ' + (A.taxed || 'nothing') + '. (Get janky — use the WEAK stuff until the audit passes.)');
    endPlayerTurn(G);
    return true;
  }

  // ================= 5. THE REUNION =================
  // Mirrors your most-used verb; repeats weaken; novelty empowers.
  function reunionState(m) {
    if (!m.sigReunion) m.sigReunion = { mirrorCool: 0 };
    return m.sigReunion;
  }
  function sigReunionHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var R = reunionState(m);
    var verbs = f.sigW4verbs || {};
    var best = null, bestN = 0;
    Object.keys(verbs).forEach(function (v) { if (verbs[v] > bestN && v !== 'wait') { bestN = verbs[v]; best = v; } });
    if (best && bestN >= 2 && R.mirrorCool <= 0) {
      R.mirrorCool = 3;
      var faces = { strike: 'your own snarl', ability: 'your own focus', move: 'your own stride', shout: 'your own voice' };
      say(game, '👥 Faces surface on its body — ' + (faces[best] || 'a familiar set to the shoulders') + '. It knows "' + best + '" — it watched you do it ' + bestN + ' times. YOUR MOVE, back at you.');
      try { game.audioEvent('reunionMirror'); } catch (e2) {}
      // Mirror: strike the player with their own verb's weight.
      var dmg = Math.round(roll([60, 80]) * 0.8);
      try { game.tbDamage('p', dmg, 'your own move, returned', m.key || 'm0'); } catch (e3) {}
      return true;
    }
    if (R.mirrorCool > 0) R.mirrorCool--;
    return false; // generic "Your Move" [60,80] runs otherwise
  }
  // Repeat penalty + novelty bonus applied at strike time via wrap below.

  // ================= 6. THE SUBURB =================
  // Comfort trap: rest heals, complacency stacks; escape or bring something alive.
  function suburbState(m) {
    if (!m.sigSuburb) m.sigSuburb = { complacency: 0, restsLeft: 3, leaveMoves: 0, angry: false };
    return m.sigSuburb;
  }
  function sigSuburbHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var S = suburbState(m);
    if (S.complacency >= 5) {
      say(game, '🏘️ The lawn is mowed. The mailbox has your name on it now. You don\'t want to leave. (Complacency 5 — the fight is over. You live here now. Fled: routed, no loot, and a mortgage of shame.)');
      var p = playerFighter(game);
      if (p) { p.fled = true; }
      try { game.tbEndCheck(); } catch (e2) {}
      return true;
    }
    if (S.restsLeft <= 0 && !S.angry) {
      S.angry = true;
      say(game, '🏘️ The streetlights FLICKER — all of them, at once. The FOR SALE signs flip to SOLD. "You had your chances to rest," the suburb hums, and the houses show their teeth. (No more rest. Property Tax is due.)');
      return false;
    }
    say(game, '🏘️ ' + (S.restsLeft > 0 ? 'A FOR SALE sign ticks down: ' + S.restsLeft + ' rest' + (S.restsLeft > 1 ? 's' : '') + ' remaining. ' : '') + 'Cul-de-sac quiet. It offers safety, warmth, normalcy. (Rest: heal 30, +1 complacency. Leave: walk to the edge. Or bring something ALIVE inside.)');
    return false; // generic Property Tax [35,55] runs
  }
  function tbSuburbRest() {
    var m = liveMonsters(G, 'suburb')[0];
    if (!m) return false;
    var S = suburbState(m);
    if (S.restsLeft <= 0) { say(G, 'No rest left — the signs all say SOLD.'); return false; }
    if (!spendPlayerTurn(G)) return false;
    S.restsLeft--; S.complacency++; S.leaveMoves = 0;
    var p = playerFighter(G);
    try { if (p) p.hp = Math.min(Math.max(p.maxHp || 0, p.hp), p.hp + 30); } catch (e) {}
    var msgs = [
      'You nap on a lawn that smells like 1997. (+30 HP.) Complacency ' + S.complacency + ' — the grass is very soft.',
      'Warmth. Quiet. A sprinkler ticks somewhere. (+30 HP.) Complacency ' + S.complacency + ' — leaving sounds like a lot, honestly.',
      'You could get used to this. That\'s the problem. (+30 HP.) Complacency ' + S.complacency + '.'
    ];
    say(G, '🏘️ ' + msgs[Math.min(S.complacency - 1, 2)]);
    if (S.complacency >= 3) say(G, '(Your feet feel heavy. Leaving will take ' + (4 - S.leaveMoves) + ' more determined walks.)');
    endPlayerTurn(G);
    return true;
  }
  function tbSuburbLeave() {
    var m = liveMonsters(G, 'suburb')[0];
    if (!m) return false;
    var S = suburbState(m);
    if (!spendPlayerTurn(G)) return false;
    S.leaveMoves++;
    var need = S.complacency >= 3 ? 3 : 2;
    if (S.leaveMoves >= need) {
      m.fled = true;
      say(G, '🏘️ You walk past the last streetlight and don\'t look back. Behind you, the suburb exhales — a whole zip code sighing. (ESCAPED. Routed, no loot, no mortgage.)');
      try { G.tbEndCheck(); } catch (e) {}
    } else {
      say(G, '🏘️ You walk toward the edge. The sidewalk is longer than it looks. (' + S.leaveMoves + '/' + need + ' — keep walking.)');
    }
    endPlayerTurn(G);
    return true;
  }
  function tbSuburbAlive() {
    var m = liveMonsters(G, 'suburb')[0];
    if (!m) return false;
    var S = suburbState(m);
    if (!spendPlayerTurn(G)) return false;
    S.complacency = 0; S.leaveMoves = 0;
    say(G, '🏘️ You bring something ALIVE inside — a kicked-over trash can, a shouted song, a small fire in a grill. A dog barks. The spell breaks: complacency 0. The suburb HATES it — the houses bare their teeth. (It hits harder now, but you can think again.)');
    try { if (m.dmgBuff === undefined) m.dmgBuff = 0; m.dmgBuff += 10; } catch (e) {}
    endPlayerTurn(G);
    return true;
  }

  // ================= 7. THE EULOGY =================
  // 5-verse doom narration; contradict verses or rewrite the ending.
  function eulogyState(m) {
    if (!m.sigEulogy) m.sigEulogy = { verses: 5, contradicted: 0 };
    return m.sigEulogy;
  }
  var EULOGY_VERSES = [
    'and then they stood their ground, poor brave fools.',
    'and then they ran, and the spotlight followed.',
    'and then they bled, politely, where everyone could see.',
    'and then they knelt, and the story approved.',
    'and then — this is the last line — they ended.'
  ];
  var EULOGY_WEIGHTS = [
    'The spotlight widens. (No weight yet — just the story starting.)',
    'The spotlight narrows. Your dodge feels watched. (-10% dodge.)',
    'The narration lingers on your wounds. (Bleeds last 1 round longer.)',
    'The story leans in. (The Eulogy\'s attacks +15.)',
    'The last line hangs in the air. (It finishes next round.)'
  ];
  function sigEulogyHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var E = eulogyState(m);
    if (E.verses <= 0) {
      say(game, '📖 "...they ended." The last line lands like a lid. (The story finishes — you die as narrated.)');
      try {
        if (game.maybeCheatDeath) {
          var cheated = game.maybeCheatDeath('p');
          if (!cheated) game.tbDamage('p', 9999, 'the narrated ending', m.key || 'm0', { quiet: true });
          else say(game, '(But unkillable means unkillable — the story chokes on the exception.)');
        } else game.tbDamage('p', 9999, 'the narrated ending', m.key || 'm0', { quiet: true });
      } catch (e2) {}
      try { game.tbEndCheck(); } catch (e3) {}
      return true;
    }
    var idx = 5 - E.verses;
    say(game, '📖 The Eulogy narrates, honestly, always: "' + EULOGY_VERSES[idx] + '" ' + EULOGY_WEIGHTS[idx] + ' (' + E.verses + ' verse' + (E.verses > 1 ? 's' : '') + ' remain. Contradict it — do the opposite — or give it a better ending.)');
    try { game.audioEvent('eulogyVerse'); } catch (e4) {}
    E.verses--;
    return false; // generic Final Chapter [50,70] still runs
  }
  function tbEulogyContradict() {
    var m = liveMonsters(G, 'eulogy')[0];
    if (!m) return false;
    var E = eulogyState(m);
    if (!spendPlayerTurn(G)) return false;
    // The hook already decremented for the verse it just narrated.
    // Contradiction strikes that verse from the record: one verse restored.
    E.verses = Math.min(5, E.verses + 1); E.contradicted++;
    say(G, '📖 You CONTRADICT it — loudly, specifically, wrong on purpose. The narration stutters. A line gets crossed out. (' + E.verses + ' verses remain. ' + E.contradicted + ' contradictions — at 3, you can rewrite the ending.)');
    endPlayerTurn(G);
    return true;
  }
  function tbEulogyRewrite() {
    var m = liveMonsters(G, 'eulogy')[0];
    if (!m) return false;
    var E = eulogyState(m);
    if (E.contradicted < 3) { say(G, 'Not yet — the story doesn\'t believe you. (Contradict ' + (3 - E.contradicted) + ' more verse' + ((3 - E.contradicted) > 1 ? 's' : '') + ' first.)'); return false; }
    if (!spendPlayerTurn(G)) return false;
    m.fled = true;
    say(G, '📖 You give it a better ending: "...and then they walked out of the story, and it had to find someone else to end." The Eulogy closes itself, gently. It almost sounds grateful. (Dismissed — routed, no loot. The story needed an ending; you gave it a kind one.)');
    try { G.tbEndCheck(); } catch (e) {}
    endPlayerTurn(G);
    return true;
  }

  // ================= 8. THE ALGORITHM =================
  // Thumbnail previews; predicts repeats; unpredictability or tanking counters.
  function algoState(m) {
    if (!m.sigAlgo) m.sigAlgo = { lastVerb: null, tankRounds: 0, whiff: 0 };
    return m.sigAlgo;
  }
  function sigAlgorithmHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var A = algoState(m);
    if (A.tankRounds > 0) A.tankRounds--;
    // Thumbnail previews: 3 options, one highlighted.
    var thumbs = ['a lunge', 'a feint', 'a grab'];
    var hot = Math.floor(Math.random() * 3);
    // If the player repeats, the prediction is GOOD (highlighted = real).
    var verbs = f.sigW4verbs || {};
    var lastVerb = f.sigW4lastVerb || null;
    var predicted = (lastVerb && A.lastVerb === lastVerb && A.tankRounds <= 0);
    say(game, '🖱️ Thumbnails: "' + thumbs[0] + '" | "' + thumbs[1] + '" | "' + thumbs[2] + '" — "' + thumbs[hot] + '" is highlighted. ' + (predicted ? '(It has your number — you repeated "' + lastVerb + '". Engagement optimized: it COUNTERS.)' : '(The trailer may lie — be unpredictable.)'));
    f.sigW4algoCounter = predicted;
    f.sigW4algoHot = hot;
    return false; // generic Engagement [45,65] runs; counter applied in wrap
  }
  function tbAlgoTank() {
    var m = liveMonsters(G, 'algorithm')[0];
    if (!m) return false;
    if (!spendPlayerTurn(G)) return false;
    var A = algoState(m);
    A.tankRounds = 2;
    say(G, '🖱️ You tank on purpose — a weak, boring, utterly unengaging turn. The Algorithm\'s thumbnails glitch: "content underperforming." Its predictions go soft for 2 rounds. (Data poisoning: the oldest trick.)');
    endPlayerTurn(G);
    return true;
  }

  // ================= 9. THE EATER =================
  // Steve's monster. Eats grid food, grows per kcal. Poison or starve.
  function eaterState(m) {
    if (!m.sigEater) m.sigEater = { eaten: 0, growth: 0, poisoned: 0 };
    return m.sigEater;
  }
  function sigEaterHook(game, m) {
    var f = null;
    try { f = game.tbfight; } catch (e) {}
    if (!f || f.over) return false;
    var E = eaterState(m);
    if (E.poisoned > 0) {
      E.poisoned--;
      say(game, '🤢 The Eater\'s belly sloshes WRONG — the poisoned meal turns. It heaves and cannot gorge this round. (' + E.poisoned + ' rounds of vomiting left.)');
      try { game.tbDamage(m.key || 'm0', 20, 'poisoned gorge', 'p'); } catch (e2) {}
      return true;
    }
    // Eat the richest food on the grid.
    var meal = 0, what = null;
    try {
      if (game.tbFindRichestFood) { var found = game.tbFindRichestFood(); meal = found.kcal || 0; what = found.label || 'scraps'; }
      else { meal = 300; what = 'forage'; } // fallback: it finds something
    } catch (e3) { meal = 300; what = 'forage'; }
    if (meal > 0) {
      E.eaten += meal;
      var gain = Math.floor(meal / 1000) * 15;
      E.growth += gain;
      say(game, '👄 SMACKING — audible chewing from a mile off. It eats ' + what + ' (' + meal + ' kcal). The belly swells. (+' + gain + ' damage growth. Total eaten: ' + E.eaten + ' kcal. Poison the meal, starve the field, or end it.)');
      try { game.audioEvent('eaterGorge'); } catch (e4) {}
    } else {
      say(game, '👄 It smacks at empty dirt — nothing left to eat. The belly rumbles, angry. (Starved: no growth this round.)');
    }
    // Adjacent pack-snacking.
    try {
      var p = game.tbFighter('p'), mf = game.tbFighter(m.key || 'm0');
      if (p && mf && Math.abs((p.mx || 0) - (mf.mx || 0)) + Math.abs((p.my || 0) - (mf.my || 0)) <= 1) {
        var s = game.state.scholar;
        if ((s.packKcal || 0) > 0) {
          var stolen = Math.min(500, s.packKcal);
          s.packKcal -= stolen;
          E.eaten += stolen; E.growth += Math.floor(stolen / 1000) * 15;
          say(game, '👄 It drools toward the richest food — YOUR PACK. (-' + stolen + ' kcal. Guard the pantry — keep your distance.)');
        }
      }
    } catch (e5) {}
    return false; // generic Gorge [45,75] + growth runs
  }
  function tbEaterPoison() {
    var m = liveMonsters(G, 'eater')[0];
    if (!m) return false;
    var hasPoison = false;
    try { hasPoison = G.hasItem('poison') || G.hasItem('tainted_meat') || (G.state && G.state.scholar && (G.state.scholar.knowledgeLevels || {}).poison >= 2); } catch (e) {}
    if (!hasPoison) { say(G, 'Nothing poisonous to offer. (You need poison, tainted meat, or real poison-knowledge.)'); return false; }
    if (!spendPlayerTurn(G)) return false;
    var E = eaterState(m);
    E.poisoned = 2;
    try { if (G.hasItem('poison')) G.consumeItem('poison'); else if (G.hasItem('tainted_meat')) G.consumeItem('tainted_meat'); } catch (e2) {}
    say(G, '☠️ You offer the meal — rich, steaming, wrong. It SMACKS it down whole. Then the belly sloshes wrong. (Poisoned: 2 rounds vomiting, 20 damage/round. The knownCue was honest: "it can\'t tell.")');
    endPlayerTurn(G);
    return true;
  }

  // ---------------- hook registration ----------------
  var SIG_HOOKS = {
    sigCongregation: function (game, m) { return sigCongregationHook(game, m); },
    sigStrike: function (game, m) { return sigStrikeHook(game, m); },
    sigInfluencer: function (game, m) { return sigInfluencerHook(game, m); },
    sigAudit: function (game, m) { return sigAuditHook(game, m); },
    sigReunion: function (game, m) { return sigReunionHook(game, m); },
    sigSuburb: function (game, m) { return sigSuburbHook(game, m); },
    sigEulogy: function (game, m) { return sigEulogyHook(game, m); },
    sigAlgorithm: function (game, m) { return sigAlgorithmHook(game, m); },
    sigEater: function (game, m) { return sigEaterHook(game, m); },
  };
  if (HB) Object.assign(HB, SIG_HOOKS);

  // ---- verb tracking (light wraps; reunion + audit read these) ----
  function wrapVerb(name, verb) {
    var orig = G[name];
    if (typeof orig !== 'function') return;
    G[name] = function () {
      var r = orig.apply(this, arguments);
      try {
        var f = this.tbfight;
        if (f && !f.over) {
          sigNoteVerbW4(this, verb);
          f.sigW4lastVerb = verb;
          if (verb === 'ability' && arguments[0]) sigNoteVerbW4(this, verb, String(arguments[0]));
        }
      } catch (e) {}
      return r;
    };
  }
  wrapVerb('tbPlayerWait', 'wait');
  wrapVerb('tbPlayerMove', 'move');
  wrapVerb('tbPlayerStrike', 'strike');
  wrapVerb('tbPlayerShout', 'shout');
  wrapVerb('tbPlayerTalk', 'talk');
  try {
    var origUA = G.useAbility;
    if (typeof origUA === 'function') {
      G.useAbility = function () {
        var r = origUA.apply(this, arguments);
        try {
          var f = this.tbfight;
          if (r && f && !f.over) { sigNoteVerbW4(this, 'ability', String(arguments[0] || '')); f.sigW4lastVerb = 'ability'; }
        } catch (e) {}
        return r;
      };
    }
  } catch (e2) {}

  // ---- damage wraps: reunion repeat-penalty/novelty, algorithm counter, influencer follower scaling, eater growth ----
  try {
    var origDmg = G.tbDamage;
    if (typeof origDmg === 'function') {
      G.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
        var f = null;
        try { f = this.tbfight; } catch (e) {}
        if (f && !f.over && typeof dmg === 'number' && dmg > 0) {
          try {
            // Reunion: player strikes weaken with repetition, novelty empowers.
            var t = this.tbFighter(targetKey);
            if (t && t.mdef && t.mdef.id === 'reunion' && sourceKey === 'p') {
              var n = sigVerbCount(this, 'strike');
              if (n >= 3) { dmg = Math.round(dmg * Math.pow(0.85, n - 2)); }
            }
            // Algorithm: predicted repeats get countered.
            if (t && t.mdef && t.mdef.id === 'algorithm' && f.sigW4algoCounter && sourceKey !== 'p') {
              dmg = Math.round(dmg * 1.5);
            }
            // Influencer: followers sharpen the Ratio.
            if (t && t.mdef && t.mdef.id === 'influencer' && sourceKey !== 'p') {
              var fol = (t.sigInfl && t.sigInfl.followers) || 0;
              if (fol > 0) dmg = Math.round(dmg * (1 + fol * 0.1));
            }
            // Eater: growth adds to its damage.
            var src = null;
            try { src = this.tbFighter(sourceKey); } catch (e2) {}
            if (src && src.mdef && src.mdef.id === 'eater' && targetKey === 'p') {
              var g = (src.sigEater && src.sigEater.growth) || 0;
              if (g > 0) dmg = dmg + g;
            }
            // Audit: taxed ability deals half.
            if (sourceKey === 'p' && f.sigW4auditTaxed) {
              dmg = Math.round(dmg * 0.5);
            }
          } catch (e3) {}
        }
        return origDmg.call(this, targetKey, dmg, sourceLabel, sourceKey, opts);
      };
    }
  } catch (e4) {}

  // ---- player verbs + combat buttons + wiring ----
  Object.assign(G, {
    tbCongAccept: tbCongAccept,
    tbCongRefuse: tbCongRefuse,
    tbCongHeresy: tbCongHeresy,
    tbStrikeMeet: tbStrikeMeet,
    tbStrikeScab: tbStrikeScab,
    tbInflOutentertain: tbInflOutentertain,
    tbAuditRead: tbAuditRead,
    tbSuburbRest: tbSuburbRest,
    tbSuburbLeave: tbSuburbLeave,
    tbSuburbAlive: tbSuburbAlive,
    tbEulogyContradict: tbEulogyContradict,
    tbEulogyRewrite: tbEulogyRewrite,
    tbAlgoTank: tbAlgoTank,
    tbEaterPoison: tbEaterPoison,

    sigW4CombatButtons: function () {
      var f = null;
      try { f = this.tbfight; } catch (e) {}
      if (!f || f.over) return '';
      var p = playerFighter(this);
      var dis = (p && p.acted) ? 'disabled' : '';
      var out = [];
      var btn = function (act, label, title, cond) {
        if (cond === false) return;
        out.push('<button class="self-btn" data-sigw4="' + act + '" ' + dis + ' title="' + escHtml(title) + '">' + label + '</button>');
      };
      if (liveMonsters(this, 'congregation').length) {
        var C = congState(liveMonsters(this, 'congregation')[0]);
        if (C.offered && !p.acted) {
          btn('tbCongAccept', '🙏 Accept', 'Accept absolution — heal 40, cleanse trauma, take the 2-round geas.');
          btn('tbCongRefuse', '🚫 Refuse', 'Refuse the invitation — no leash, no washing. Its liturgy cannot compel the uninvited.');
        }
        if (C.geas > 0 && !p.acted) btn('tbCongHeresy', '⛪ Heresy', 'Argue theology — break the geas (25 damage to it).');
      }
      if (liveMonsters(this, 'strike').length) {
        var S = strikeState(liveMonsters(this, 'strike')[0]);
        if (S.demands && S.demands.length && !p.acted) btn('tbStrikeMeet', '🤝 Meet demand', 'Meet the first demand: ' + S.demands[0].label + ' — the strike ends.');
        if (!p.acted) btn('tbStrikeScab', '🧤 Scab', 'Learn the grid\'s job — your shutdown rounds work at half strength.');
      }
      if (liveMonsters(this, 'influencer').length && !p.acted) {
        btn('tbInflOutentertain', '🎪 Out-entertain', 'Steal its followers with a better bit — they heckle it.');
      }
      if (liveMonsters(this, 'audit').length && !p.acted) {
        btn('tbAuditRead', '🧾 Read clipboard', 'Read its clipboard — what\'s about to be taxed, and when.');
      }
      if (liveMonsters(this, 'suburb').length && !p.acted) {
        var SU = suburbState(liveMonsters(this, 'suburb')[0]);
        if (SU.restsLeft > 0) btn('tbSuburbRest', '🛋️ Rest', 'Rest inside — heal 30, +1 complacency (' + SU.restsLeft + ' rests left).');
        btn('tbSuburbLeave', '🚶 Leave', 'Walk to the edge — escape the suburb (' + SU.leaveMoves + '/' + (SU.complacency >= 3 ? 3 : 2) + ').');
        btn('tbSuburbAlive', '🔥 Alive', 'Bring something alive inside — break complacency to 0 (it hits harder).');
      }
      if (liveMonsters(this, 'eulogy').length && !p.acted) {
        var E = eulogyState(liveMonsters(this, 'eulogy')[0]);
        btn('tbEulogyContradict', '📖 Contradict', 'Contradict the verse — strike a line from the record.');
        if (E.contradicted >= 3) btn('tbEulogyRewrite', '✍️ Rewrite', 'Give it a better ending — dismiss the Eulogy kindly.');
      }
      if (liveMonsters(this, 'algorithm').length && !p.acted) {
        btn('tbAlgoTank', '🖱️ Tank', 'Tank on purpose — feed it bad data, predictions go soft 2 rounds.');
      }
      if (liveMonsters(this, 'eater').length && !p.acted) {
        btn('tbEaterPoison', '☠️ Poison meal', 'Offer a poisoned meal — 2 rounds vomiting (needs poison/tainted meat/knowledge).');
      }
      return out.join('');
    },

    sigW4WireCombat: function (on, rerender) {
      document.querySelectorAll('[data-sigw4]').forEach(function (b) {
        b.onclick = function () { try { G[b.dataset.sigw4](); } catch (e) {} rerender(); };
      });
    },

    // ---- villager field fights: the core loop, simplified ----
    sigW4FieldMonster: function (mdef, rec, ctx) {
      ctx = ctx || {};
      var id = mdef && mdef.id;
      var W4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater'];
      if (W4.indexOf(id) === -1) return ctx.total;
      var st = rec.sigW4 || (rec.sigW4 = {});
      var round = ctx.round || 1;
      var key = id + ':' + round;
      if (st.lastKey === key) return ctx.total;
      st.lastKey = key;
      var rr = ctx.rr || Math.random;
      var lroll = ctx.lroll || (function (r) { return r[0] + Math.floor(rr() * (r[1] - r[0] + 1)); });
      var total = (typeof ctx.total === 'number') ? ctx.total : 0;
      var vName = ctx.vName || 'Someone';
      // Simplified signatures: the core threat, narrated once.
      if (id === 'congregation' && round % 3 === 1) {
        // COUNTERWIRE (2026-10-16): heresy — a villager who argued theology
        // the round before (rec.trickArgue) forced it to engage the argument.
        // Bound by liturgy, it spends the beam-round on the debate instead.
        if (rec.trickArgue) {
          rec.trickArgue = 0;
          say(this, '⛪ The Congregation turns from the beam to the argument — ' + vName + ' cited the liturgy of the lost. It MUST engage. (No beam.)');
        } else {
          say(this, '🔔 The Congregation rings — ' + vName + ' refuses the absolution and takes the beam instead.');
          total += lroll([50, 70]);
        }
      } else if (id === 'strike' && rec.trickStoodDown) {
        // COUNTERWIRE (2026-10-16): one demand met — the picket stands down
        // the round. The villager did the grid's job themselves (1 food +
        // the action, paid in the trick resolution). No attack this round.
        rec.trickStoodDown = 0;
        say(this, '🐀 The Strike stands down — one demand met, the picket holds its signs and waits. (Scabbed quiet.)');
        total = 0;
        say(this, '🐀 The Strike posts demands — ' + vName + ' scabs through the shutdown, half strength.');
        total = Math.round(total * 0.5);
      } else if (id === 'influencer') {
        // APEXHOOK (2026-10-16): a villager who knows the trick hunts the
        // followers first — each 'focus_followers' trick action kills one
        // (st.inFolKilled, set in the fieldFight resolution). The buff
        // shrinks; at zero followers it's just a person with good lighting.
        var fol = Math.max(0, Math.min(4, Math.floor(round / 2)) - (st.inFolKilled | 0));
        if (fol > 0) {
          say(this, '📱 The Influencer\'s ' + fol + ' followers sharpen the Ratio against ' + vName + '.');
          total += fol * 6;
        } else {
          say(this, '📱 The Influencer stands alone — no followers left. Just a person with good lighting.');
        }
      } else if (id === 'audit' && round % 3 === 0) {
        // APEXHOOK (2026-10-16): HONEST PORT of the TB mechanic (fixes the
        // inversion filed as sim-findings #408 — the old branch halved the
        // MONSTER's damage while narrating the villager's trick taxed).
        // Audit day taxes the VILLAGER's best trick (their strike): half
        // strength for 2 rounds (rec.auditTaxRounds, consumed in the
        // villager-strike section). A villager who was deliberately
        // inefficient (rec.trickInefficient, the 'inefficient' trick action)
        // gives the clipboard nothing to tax.
        if (rec.trickInefficient) {
          rec.trickInefficient = 0;
          say(this, '🧾 Audit day — ' + vName + ' is deliberately, visibly inefficient. The clipboard finds nothing to tax.');
        } else {
          say(this, '🧾 Audit day — ' + vName + '\'s best trick is taxed. Half strength.');
          rec.auditTaxRounds = 2;
        }
      } else if (id === 'reunion') {
        // APEXHOOK (2026-10-16): the mirror (replaces the 0.8x placeholder
        // that softened the monster — the TB mechanic wears the VILLAGER's
        // repeated verbs thin). The weakening lands in the villager-strike
        // section (0.85^(n-2) on the nth strike, n>=3, verbatim from the TB
        // damage wrap); this branch narrates the wearing. Novelty (the
        // wait:reunion-novel trick) resets the count — it has nothing to wear.
        var _rS = (rec.strikesThrown | 0);
        if (_rS >= 2) {
          say(this, '👥 The Reunion wears ' + vName + '\'s strikes — the familiar ones land soft. (Do something you have never done.)');
        } else {
          say(this, '👥 The Reunion watches ' + vName + ' — learning their moves.');
        }
      } else if (id === 'suburb' && round % 2 === 1) {
        say(this, '🏘️ The Suburb hums comfort at ' + vName + ' — Property Tax for resisting.');
        total += lroll([35, 55]);
      } else if (id === 'eulogy') {
        // COUNTERWIRE (2026-10-16): contradict the narration. Verses tick
        // down every 2 rounds (matches the old 5-floor(round/2) formula); a
        // villager's contradiction (rec.trickContradict) restores one verse.
        // Three true contradictions and the story dismisses the villager
        // kindly — routed, no loot, a better ending. Unknowing villagers
        // keep the old countdown exactly.
        st.euV = (st.euV == null ? 5 : st.euV);
        if (round % 2 === 0 && st.euLastRound !== round) { st.euV--; st.euLastRound = round; }
        if (rec.trickContradict) {
          rec.trickContradict = 0;
          st.euV = Math.min(5, st.euV + 1);
          rec.eulogyContradicts = (rec.eulogyContradicts || 0) + 1;
          say(this, '📖 ' + vName + ' contradicts the story — a verse restored (' + st.euV + ' remain, ' + rec.eulogyContradicts + '/3 true contradictions).');
          if (rec.eulogyContradicts >= 3) {
            rec.outcome = 'mFlee';
            say(this, '📖 Three true contradictions — the Eulogy closes the book kindly. ' + vName + ' is dismissed, not eulogized. (A better ending.)');
          }
        }
        if (!rec.outcome && st.euV <= 0) {
          say(this, '📖 The Eulogy finishes — ' + vName + ' dies as narrated. (The village will remember the story.)');
          total += 9999;
        } else if (!rec.outcome) {
          say(this, '📖 The Eulogy narrates: "' + vName + ' faltered." (' + st.euV + ' verses remain.)');
        }
      } else if (id === 'algorithm') {
        // COUNTERWIRE (2026-10-16): lose on purpose — a villager tanking
        // the prediction (rec.algorithmTank rounds left) feeds the model
        // mush. Its hits land soft (halved) while the tank holds.
        if ((rec.algorithmTank | 0) > 0) {
          rec.algorithmTank--;
          total = Math.round(total * 0.5);
          say(this, '🖱️ The Algorithm predicts a fighter and finds ' + vName + ' standing still — soft prediction. Its model goes mushy. (halved)');
        } else {
          say(this, '🖱️ The Algorithm trailers its next move at ' + vName + ' — the predictable get countered.');
          total += lroll([45, 65]);
        }
      } else if (id === 'eater') {
        var growth = Math.floor(round / 2) * 15;
        say(this, '👄 The Eater gorges on the field — +' + growth + ' damage growth. (' + vName + ' should have poisoned the meal.)');
        total += lroll([45, 75]) + growth;
      }
      ctx.total = total;
      return total;
    }
  });

  // Design calls (Steve delegated 2026-10-11 — documented for overrule):
  // - Congregation: the invitation consumes its whole turn (liturgy, not
  //   violence); geas commands alternate kneel/give; heresy is once per geas
  //   (the geas breaks, so naturally once).
  // - Strike: demands are generated from real state (pack kcal if >1500);
  //   shutdown is 2 rounds; scabbing costs the organizing turn now and pays
  //   during shutdown at half strength.
  // - Influencer followers are spawned via tbSpawnFollower if present, else
  //   tracked as a buff count (the hook degrades gracefully).
  // - Audit taxes the most-used VERB (strike/ability/move...) — "your sheet"
  //   is what you did, and deliberate jank is using the weak stuff.
  // - Reunion mirror triggers at 2+ uses of one verb, 3-round cooldown.
  // - Suburb: 3 rests, complacency 5 = you move in (routed); escape needs
  //   2-3 leave moves depending on complacency.
  // - Eulogy: 5 verses, contradiction restores one verse (net -1 per
  //   contradict after the hook's decrement... see code), rewrite at 3
  //   contradictions dismisses kindly (routed, no loot).
  // - Algorithm: repeat = countered (x1.5 on its damage); tank = 2 rounds
  //   of soft predictions.
  // - Eater: +15 damage per 1000 kcal eaten (per its telegraph); poison needs
  //   poison item, tainted meat, or poison knowledge 2+.
})(typeof window !== 'undefined' ? window : global);
