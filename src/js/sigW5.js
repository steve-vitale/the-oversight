// @ontology
// system: sig-w5
// description: Wave-5 signature combat mechanics (Steve 2026-10-11): The Producers — the show fights back. Cancellation (the stamp descends; un-teaches System abilities, deletes buffs, silences favor — go off-script or spend favor), Editor (cuts your last turn / position / ally to the cutting-room floor — retrieve them, or contradict yourself to jam the blades), Rerun (the fight resets every 5 rounds — leave mechanical messages in the margins, or win fast), Spoiler (truthful prophecies that gain weight — binding questions, cheap fulfillment, or make it a lie), Timeslot (reschedules the venue — own it or get bumped), Nielsen (ratings 0-100 — fight boring), Finale (once per fight, a 3-round countdown to an unavoidable [150,200] title card — sacrifice or end it first; doom deaths flow through maybeCheatDeath), Network Note (announce-then-apply notes — kill it first, or feed it bad notes). Hooks interleave with the generic encounter interpreter — each hook returns false unless its telegraph promises the turn.
// provides:
//   - cxStamp(game, m)
//   - edCut(game, m)
//   - rrTake(game, m)
//   - spAnnounce(game, m)
//   - tsReschedule(game, m)
//   - niWatch(game, m)
//   - fiFinale(game, m)
//   - nnNote(game, m)
//   - tbCxOffScript()
//   - tbCxSpendFavor()
//   - tbEdRetrieve()
//   - tbEdContradict()
//   - tbRrLeaveMessage(kind)
//   - tbRrReadMessages()
//   - tbSpAsk()
//   - tbSpCheapFulfill()
//   - tbTsOwnVenue()
//   - tbNiPlayToCamera()
//   - tbFiSacrifice(kind)
//   - tbNnBadNote(kind)
//   - tbNnReadMemo()
//   - sigW5CombatButtons()
//   - sigW5WireCombat(on, rerender)
//   - sigW5FieldMonster(mdef, rec, ctx)
// rules:
//   - telegraph_honesty: every cue describes what the mechanic actually does — the stamp's descend count, the film strips' shown target, the clapperboard's take number, the trailer-voice announcement, the TV guide highlight, the viewer counter, the growth + countdown, the visible memo text ARE the mechanics (code: cxStamp)
//   - interleave: hooks add the signature layer around the generic interpreter — only the fall, the cut, the clap, the title card, the reschedule, the sign-off and the memo-meeting own their turns outright, and each telegraph promises exactly that (code: edCut)
//   - no_silent: every signature event narrates via say() — nothing happens quietly (code: nnNote)
//   - counterplay_real: off-script improv, favor spends, floor retrieval, contradiction jams, margin messages, cheap fulfillments, binding questions, venue ownership, boring fights, sacrifices and bad notes all resolve through real fight state, never flags that lie (code: tbFiSacrifice)
//   - doom_choke: finale title-card deaths flow through tbDamage + tbEndCheck into maybeCheatDeath — the single death choke point, never bypassed (Steve 2026-10-10) (code: fiFinale)
// consumes:
//   - say, tbDamage, addHealth, audioEvent, tbRefreshTelegraphUI
//   - tbFighter, tbIsPlayerTurn, tbAfterPlayerAction, tbEndCheck, tbPlayerStrike
//   - hasItem, consumeItem, seList, seDef
//   - apTopLane, apFanLane, apAdjustFavor, apClubName
//   - feastedActive, clearFeastBuff
/* SIGNATURE MECHANICS, WAVE 5 — src/js/sigW5.js
 *
 * Steve (2026-10-10): identity is "The Producers". You are strong enough to
 * threaten the narrative. The narrative sends its immune system: censors,
 * editors, cancellers. The horror: the show is fighting back.
 *
 * ARCHITECTURE: hooks register into the global MonsterBehaviorHooks dict
 * (see src/js/monsterBehaviors.js); monsterBehaviors.json declares the
 * ordered preTurnHooks per monster id. A hook returning true consumed the
 * monster's turn; returning false lets the generic attack run. Player
 * choices surface as Game.tb* methods + combat-panel buttons rendered by
 * sigW5CombatButtons() (one insertion point in app.js). Villager
 * field-fights get the core loop through sigW5FieldMonster(), called once
 * per round from fieldFights.js — the same hook path, simplified.
 *
 * All signature damage modifiers flow through ONE tbDamage interception
 * (venue mults, note buffs/nerfs, finale growth, rerun adapt/exposed,
 * spoiler weight) — guarded by fight-state flags, exact numbers preserved
 * where telegraphed (the title card passes sigW5NoMult).
 *
 * DESIGN CALLS (Steve delegated — documented for overrule):
 * - CANCELLATION: the stamp descends 3 monster turns (telegraphed; the
 *   generic Under Review attack still fires — the review hurts) then the
 *   FALL consumes a turn. Un-teaches up to 2 System abilities by level,
 *   highest first — never background/human skills (not in the script; the
 *   HUMAN SKILLS != ALIEN ABILITIES law is the mechanic's boundary).
 *   Cancelled abilities restore at fight end via the tbEndCheck wrap.
 *   "Buffs" = the feast-surge window (the game's real combat buff) —
 *   cleared if active, honestly reported if absent. Favor silence (2
 *   rounds) blocks the spend-favor counter — you must go off-script.
 * - EDITOR: cut every 3rd monster turn; the strips show the target a full
 *   round ahead. Cut rotation: last turn -> position -> ally. The undo
 *   covers the whole intervening segment (your HP/pos + monsters' HPs —
 *   "the cut takes the whole take"). The floor is ONE marked tile; the
 *   ally auto-walks-back after 3 rounds if you don't retrieve them.
 *   Contradicting yourself jams exactly one cut.
 * - RERUN: the clap lands every 5th monster turn and consumes it. The
 *   monster remembers (+10% damage per take, forever); you don't — unless
 *   you wrote in the margins. Messages are mechanical (rigging/left/big),
 *   one per kind per fight. Post-reset exposure x1.5 (x2 with rigging).
 * - SPOILER: announce, then a 3-round window. Weight = +12% damage each.
 *   Cheap fulfillment still feeds it (weight+1) but sates it (5-turn
 *   cooldown vs 3). Fizzled prophecies backlash 40. The binding question
 *   forces the blink prophecy — too trivial to feed on, no weight.
 * - TIMESLOT: 3-turn venues; highlight a round ahead; the reschedule
 *   consumes the turn. Two consecutive boring waits = BUMPED to daytime.
 *   Own-venue claims expire at the next reschedule (you own the venue,
 *   not the schedule).
 * - NIELSEN: ratings from 40; gaze = [50,80] x (0.5 + r/100). At 0 the
 *   eye signs off for 2 rounds, reopens at 20. Play-to-camera spikes +15
 *   but sates the next gaze — watched on your terms.
 * - FINALE: +5% damage per growth, declared at 50% HP or round 4
 *   (whichever first), 3-round countdown with real previously-on recaps.
 *   The title card is exactly [150,200], undodgeable, no growth mult —
 *   the telegraph promises the number. Sacrifice: an item, or a food
 *   memory (-250 kcal — it tastes like birthdays). Doom deaths flow
 *   through maybeCheatDeath via tbEndCheck.
 * - NETWORK NOTE: every note is announced a full round before it lands
 *   (the pen underlines). Bad notes apply, then get REVERTED next turn —
 *   the memo catches on. Kill-it-first is the intended counter (lowest
 *   wave-5 HP); the memo is support, and support dies first.
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
  function clampN(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function liveMonsters(game, id) {
    var f = game.tbfight;
    if (!f) return [];
    return f.fighters.filter(function (x) {
      return x.kind === 'monster' && x.alive && !x.fled && x.mdef && x.mdef.id === id;
    });
  }
  function w5monster(game, id) {
    var ms = liveMonsters(game, id);
    return ms.length ? ms[0] : null;
  }
  // finale-campaign (2026-10-12): the sacrifice / countdown buttons work in
  // THE OPENING CREDITS too — same hunger, smaller card.
  function fiMonster(game) {
    // THE NETWORK (2026-10-14): its heart hungers the same way — the
    // sacrifice counter must find it too.
    return w5monster(game, 'finale') || w5monster(game, 'finale_opening') || w5monster(game, 'network_heart');
  }
  function fullMove(game, p) {
    try {
      var sp = p.speed || 3;
      var mod = (typeof game.seMoveMod === 'function') ? game.seMoveMod(p) : 1;
      return Math.max(0, Math.floor(sp * mod));
    } catch (e) { return p.speed || 3; }
  }
  function abName(e) {
    if (!e) return 'something';
    if (typeof e === 'string') return e;
    return e.name || e.id || 'something';
  }
  function abId(e) { return (e && e.id) || e; }
  function abLevel(e) { return (e && e.level) || 1; }

  var sigHooks = {
    // CANCELLATION (Steve 2026-10-10): it doesn't fight you — it fights
    // your EXISTENCE in the show. The stamp descends for 3 turns (the
    // longest telegraph in the game — you have time, use it), then FALLS:
    // up to 2 System abilities un-taught ("under review" until fight end),
    // buffs deleted, System favor silenced. Go off-script or spend favor.
    cxStamp: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!m.cxInit) { m.cxInit = true; m.cxDescend = 0; m.cxCool = 0; }
      if ((f.cxSilence || 0) > 0) f.cxSilence--;
      if ((m.cxCool || 0) > 0) {
        m.cxCool--;
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return false; // cooling off — the review continues normally
      }
      if ((m.cxDescend || 0) < 3) {
        m.cxDescend = (m.cxDescend || 0) + 1;
        var n = m.cxDescend;
        try { game.audioEvent('cxDescend', { n: n }); } catch (err) {}
        if (n < 3) {
          game.say('❌ The STAMP descends — ' + n + '/3. Slowly. Redly. It is coming for your abilities, your buffs, your standing. (Go OFF-SCRIPT — or SPEND FAVOR. You have time. Use it.)');
        } else {
          game.say('❌ The STAMP hangs at 3/3 — one breath from falling. The ink is wet. (Off-script or favor — NOW.)');
        }
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return false; // the review still hurts while it descends
      }
      // ---- THE FALL: the stamp lands ----
      m.cxDescend = 0; m.cxCool = 2;
      var s = game.state.scholar;
      var cancelled = [];
      // FUSION SINGULARITY (Steve 2026-10-12): the reactor is inside you. The
      // STAMP un-teaches System abilities — it cannot un-install surgery.
      var reactorHeld = false;
      try {
        var abs = (s.abilities || []).slice();
        reactorHeld = abs.some(function (e) { return abId(e) === 'fusion_reactor'; });
        abs = abs.filter(function (e) { return abId(e) !== 'fusion_reactor'; });
        abs.sort(function (a, b) { return abLevel(b) - abLevel(a); });
        var take = Math.min(2, abs.length);
        for (var i = 0; i < take; i++) {
          var e = abs[i];
          var id = abId(e);
          for (var j = (s.abilities || []).length - 1; j >= 0; j--) {
            if (abId(s.abilities[j]) === id) { cancelled.push(s.abilities.splice(j, 1)[0]); break; }
          }
        }
      } catch (err) {}
      f.cxCancelled = (f.cxCancelled || []).concat(cancelled);
      var cNames = cancelled.map(abName).join(', ') || (reactorHeld ? 'nothing it could take' : 'nothing — the slots were already empty');
      var buffLine = 'It looks for buffs to delete. You are running clean — it finds nothing. (Small mercies.)';
      try {
        if (typeof game.feastedActive === 'function' && game.feastedActive()) {
          try { game.clearFeastBuff(false); } catch (err) {}
          buffLine = 'Your feast-surge window: CANCELLED. The warmth goes out of it like a blown lamp.';
        }
      } catch (err2) {}
      f.cxSilence = 2;
      try { game.audioEvent('cxFall', {}); } catch (err) {}
      game.say('❌ THE STAMP FALLS. UNDER REVIEW — ' + cNames + ' ' + (cancelled.length === 1 ? 'is' : 'are') + ' un-taught, filed away until the fight ends. (Your human skills were never in the script — it cannot touch those.)');
      if (reactorHeld) game.say('The reactor hums on, unbothered. It is inside you. It does not come out.');
      game.say(buffLine);
      game.say('System favor goes silent — the audience cannot hear you through the ringing. (Favor spends blocked, 2 rounds. Improvise.)');
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      return true; // the fall IS the turn
    },

    // EDITOR (Steve 2026-10-10): tower-sized scissors, live post-production.
    // Every 3rd turn it CUTS — your last turn (undone, redo it), your
    // position (suddenly elsewhere), or your ally (cutting-room floor).
    // The strips show the target a full round ahead. Nothing cut is gone —
    // it's on the floor. Go back for it. Or contradict yourself: the
    // blades jam on a contradiction.
    edCut: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!m.edInit) { m.edInit = true; m.edCycle = 0; m.edCutIdx = 0; m.edPrevSnap = null; }
      // cut allies walk back in on their own after 3 rounds
      var i, x;
      for (i = 0; i < f.fighters.length; i++) {
        x = f.fighters[i];
        if (x && x.edCut && x.kind === 'villager') {
          x.edCutRounds = (x.edCutRounds == null ? 3 : x.edCutRounds) - 1;
          if (x.edCutRounds <= 0) {
            x.edCut = false; x.fled = false;
            var fl = f.edFloor;
            if (fl) { x.mx = fl.x; x.my = fl.y; }
            game.say('🎬 The scene ends — ' + (x.name || 'your ally') + ' walks back in from the cutting-room floor, unharmed and furious.');
          }
        }
      }
      m.edCycle++;
      function snap() {
        var sn = { php: p.hp, pmaxhp: p.maxHp, px: p.mx, py: p.my, mhp: {} };
        for (var k = 0; k < f.fighters.length; k++) {
          var q = f.fighters[k];
          if (q.kind === 'monster' && q.mdef) sn.mhp[q.key] = q.hp;
        }
        return sn;
      }
      function ensureFloor() {
        if (f.edFloor) return f.edFloor;
        var fx = clampN(p.mx + 2, 1, 7), fy = clampN(p.my, 1, 7);
        var occupied = f.fighters.some(function (o) {
          return o.alive && !o.fled && o.mx === fx && o.my === fy;
        });
        if (occupied) { fx = clampN(p.mx - 2, 1, 7); }
        f.edFloor = { x: fx, y: fy };
        f.edFloorItems = f.edFloorItems || [];
        game.say('🎬 A tile at [' + fx + ',' + fy + '] is marked with film strips — THE CUTTING-ROOM FLOOR. What gets cut lands there. (Stand by it and RETRIEVE.)');
        return f.edFloor;
      }
      // the strips show the next cut a full round ahead — readable telegraph
      if (m.edCycle % 3 === 2) {
        var kinds = ['YOUR LAST TURN', 'YOUR POSITION', 'YOUR ALLY'];
        var allies = f.fighters.filter(function (o) {
          return o.kind === 'villager' && o.alive && !o.fled && !o.edCut;
        });
        var nx = kinds[(m.edCutIdx || 0) % 3];
        if (nx === 'YOUR ALLY' && !allies.length) nx = 'YOUR POSITION';
        game.say('✂️ The scissors open — slowly. The film strips show what is about to be cut: ' + nx + '. (One round. Do something about it.)');
        try { game.audioEvent('edStrip', { target: nx }); } catch (err) {}
        m.edPrevSnap = snap();
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return false;
      }
      if (m.edCycle % 3 !== 0) {
        m.edPrevSnap = snap();
        if (game.tbEndCheck()) return true;
        return false;
      }
      // ---- CUT ----
      if (m.edJammed) {
        m.edJammed = false;
        m.edPrevSnap = snap();
        game.say('✂️ The blades come down on a CONTRADICTION — and jam. The Editor spends the turn working it out of its teeth. (No cut. The jam held.)');
        try { game.audioEvent('edJam', {}); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return true;
      }
      var order = ['turn', 'position', 'ally'];
      var cutKind = order[(m.edCutIdx || 0) % 3];
      m.edCutIdx = (m.edCutIdx || 0) + 1;
      var liveAllies = f.fighters.filter(function (o) {
        return o.kind === 'villager' && o.alive && !o.fled && !o.edCut;
      });
      if (cutKind === 'ally' && !liveAllies.length) cutKind = 'position';
      ensureFloor();
      try { game.audioEvent('edCut', { kind: cutKind }); } catch (err) {}
      if (cutKind === 'turn') {
        var prev = m.edPrevSnap;
        var undoneDealt = 0, undoneTaken = 0, hitKey = null, hitMost = 0;
        if (prev) {
          undoneTaken = Math.max(0, prev.php - p.hp);
          p.hp = Math.min(p.maxHp || prev.pmaxhp || p.hp, prev.php);
          p.mx = prev.px; p.my = prev.py;
          try { game.state.scholar.mx = prev.px; game.state.scholar.my = prev.py; } catch (err) {}
          for (var k2 = 0; k2 < f.fighters.length; k2++) {
            var q2 = f.fighters[k2];
            if (q2.kind === 'monster' && q2.mdef && prev.mhp[q2.key] != null) {
              var back = Math.max(0, q2.hp - prev.mhp[q2.key]);
              if (back > 0) { undoneDealt += back; if (back >= hitMost) { hitMost = back; hitKey = q2.key; } }
              q2.hp = prev.mhp[q2.key];
            }
          }
        }
        p.acted = false;
        p.moveLeft = fullMove(game, p);
        if (undoneDealt > 0) {
          (f.edFloorItems = f.edFloorItems || []).push({ kind: 'scene', dmg: undoneDealt, targetKey: hitKey });
        }
        game.say('✂️ CUT — your last turn hits the floor. (' + undoneDealt + ' damage un-dealt; ' + undoneTaken + ' of your wounds close. The cut took the whole take.) Redo it — your turn is yours again.');
        m.edPrevSnap = snap();
      } else if (cutKind === 'position') {
        var _held = false;
        // HOLD (keepsake L2, Steve 2026-10-14): the cut can't move you.
        try { _held = !!(game.keepsakeHoldsGround && game.keepsakeHoldsGround(p)); } catch (err) { _held = false; }
        if (!_held) {
        var ox = p.mx, oy = p.my, placed = false, tries = 0;
        while (!placed && tries++ < 40) {
          var nx2 = 1 + Math.floor(Math.random() * 7), ny2 = 1 + Math.floor(Math.random() * 7);
          var d = Math.max(Math.abs(nx2 - ox), Math.abs(ny2 - oy));
          var occ = f.fighters.some(function (o) {
            return o !== p && o.alive && !o.fled && o.mx === nx2 && o.my === ny2;
          });
          if (d >= 2 && !occ) { p.mx = nx2; p.my = ny2; placed = true; }
        }
        try { game.state.scholar.mx = p.mx; game.state.scholar.my = p.my; } catch (err) {}
        (f.edFloorItems = f.edFloorItems || []).push({ kind: 'position', x: ox, y: oy });
        game.say('✂️ CUT — you are suddenly elsewhere. (Your old position is on the cutting-room floor — retrieve it to step back.)');
        }
        m.edPrevSnap = snap();
      } else {
        var ally = liveAllies[Math.floor(Math.random() * liveAllies.length)];
        ally.fled = true; ally.edCut = true; ally.edCutRounds = 3;
        (f.edFloorItems = f.edFloorItems || []).push({ kind: 'ally', key: ally.key });
        game.say('✂️ CUT — ' + (ally.name || 'your ally') + ' is left on the cutting-room floor. (Retrieve them — or they walk back in 3 rounds, furious.)');
        m.edPrevSnap = snap();
      }
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      return true; // the cut IS the turn
    },

    // RERUN (Steve 2026-10-10): the network ordered more episodes. Every
    // 5th turn the clapperboard CLAPS and the fight RESTARTS — HP and
    // positions rewind for both sides. IT remembers (+10% damage per
    // take); you don't — unless you wrote in the margins. Between takes
    // the set is visible: brief vulnerability. Or win in 5 rounds — the
    // one honest DPS check.
    rrTake: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!f.rrBase) return false;
      m.rrN = (m.rrN || 0) + 1;
      if ((f.rrExposed || 0) > 0 && m.rrN % 5 !== 0) {
        // the exposure window closes after one full round past the reset
        f.rrExposed = 0;
      }
      if (m.rrN % 5 !== 0) {
        if (game.tbEndCheck()) return true;
        return false;
      }
      // ---- THE CLAP ----
      var base = f.rrBase;
      p.hp = Math.min(p.maxHp, base.php);
      p.maxHp = base.pmaxhp;
      p.mx = base.px; p.my = base.py;
      try { game.state.scholar.mx = base.px; game.state.scholar.my = base.py; } catch (err) {}
      for (var i = 0; i < f.fighters.length; i++) {
        var x = f.fighters[i];
        if (x.kind === 'monster' && base.mons[x.key]) {
          var b = base.mons[x.key];
          x.hp = Math.min(x.maxHp, b.hp); x.maxHp = b.maxHp;
          x.mx = b.mx; x.my = b.my;
        }
      }
      f.rrTakes = (f.rrTakes || 0) + 1;
      m.rrAdapt = (m.rrAdapt || 0) + 1;
      f.rrExposed = 1;
      f.rrBigArmed = !!(f.rrMsgBig); // "save the big hit" re-arms every take
      var takeNo = 12 + f.rrTakes;
      try { game.audioEvent('rrClap', { take: takeNo }); } catch (err) {}
      game.say('🎬 CLAP — "TAKE ' + takeNo + '." The world rewinds. HP, positions — everything back to the top of the scene. (IT remembers. Its hits +' + (m.rrAdapt * 10) + '%. You don\'t.)');
      game.say('Between takes the set is visible — exposed rigging. (' + (f.rrRigging ? 'x2' : 'x1.5') + ' damage to it until its next turn.)');
      var msgs = f.rrMessages || [];
      if (msgs.length) {
        game.say('The clapperboard cannot see the margins. Your handwriting survives: ' + msgs.map(function (g) { return '"' + g.text + '"'; }).join(' '));
      } else {
        game.say('(No messages in the margins. Write between resets — tbRrLeaveMessage. Or win fast.)');
      }
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      return true; // the clap IS the turn
    },

    // SPOILER (Steve 2026-10-10): marketing leaked the finale, and the
    // leak was true. It ANNOUNCES true future events; fulfilled prophecies
    // gain weight (+12% damage each). Ask binding questions, fulfill
    // cheaply on your terms — or make the announcement a lie and watch it
    // choke.
    // SPOILER (Steve 2026-10-10): it tells you how the fight ends —
    // truthfully. Announced outcomes gain weight (announced things happen).
    // The spoiler is a passive narrator; it does not strike. Its attack IS
    // the announcement coming true: if a prophecy is unfulfilled when the
    // countdown hits zero, the Leaked Ending MANIFESTS through this hook.
    // Fulfill it CHEAPLY on your terms (tbSpFulfill), ask a BINDING QUESTION
    // (tbSpBind — forces a harmless announcement), or make it a liar
    // (avoid the announced outcome — it chokes, 40 backlash, no weight).
    spAnnounce: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!m.spInit) { m.spInit = true; if (m.spCool == null) m.spCool = 1; if (m.spWeight == null) m.spWeight = 0; if (m.spKindIdx == null) m.spKindIdx = 0; }
      // read the player's last turn (then clear for the next reader)
      var struck = !!f.sigW5Struck;
      f.sigW5Struck = false; f.sigW5PDmg = 0;
      if (m.spProp) {
        var pr = m.spProp;
        if (pr.kind === 'run') {
          pr.moved = (pr.moved || 0) + Math.abs(p.mx - pr.px) + Math.abs(p.my - pr.py);
          pr.px = p.mx; pr.py = p.my;
        }
        if (pr.kind === 'hesitate' && struck) pr.struck = true;
        pr.n--;
        var fulfilled = !!pr.fulfilled;
        if (!fulfilled) {
          if (pr.kind === 'bleed') fulfilled = (p.hp <= pr.hpMark - 12);
          else if (pr.kind === 'run') fulfilled = ((pr.moved || 0) >= 3);
          else if (pr.kind === 'hesitate') fulfilled = !pr.struck;
          else if (pr.kind === 'blink') fulfilled = (pr.n <= 0); // blinking always happens
        }
        if (fulfilled && pr.kind !== 'blink') {
          m.spWeight++;
          m.spProp = null; m.spCool = 3;
          try { game.audioEvent('spFulfilled', { weight: m.spWeight }); } catch (err) {}
          game.say('📢 "AND THEN—" The announced thing HAPPENED. The voiceover grows LOUDER. (Weight ' + m.spWeight + ' — its words hit +' + (m.spWeight * 12) + '% harder.)');
          try { game.tbRefreshTelegraphUI(); } catch (err) {}
          if (game.tbEndCheck()) return true;
          return false;
        } else if (fulfilled) {
          m.spProp = null; m.spCool = 3;
          game.say('📢 "...AND THEN THEY BLINKED." The voiceover tries to sound ominous about blinking. It cannot. (Too trivial to feed on — no weight.)');
          try { game.tbRefreshTelegraphUI(); } catch (err) {}
          if (game.tbEndCheck()) return true;
          return false;
        } else if (pr.n <= 0) {
          // UNFULFILLED at zero: the Leaked Ending MANIFESTS. The announced
          // thing happens because it was announced — this is the attack.
          m.spWeight++;
          m.spProp = null; m.spCool = 3;
          var mult = 1 + 0.12 * m.spWeight;
          var dmg = Math.round(roll([75, 105]) * mult);
          try { game.audioEvent('spManifest', { weight: m.spWeight }); } catch (err) {}
          game.say('📢 "AND THEN— ' + pr.line.replace(/[".]/g, '') + '." The Leaked Ending plays. The announcement makes it TRUE.');
          var landed = game.tbDamage('p', dmg, 'the Leaked Ending (' + pr.kind + ', manifested)', m.key, { undodgeable: true });
          game.say('📢 (' + landed + ' — weight ' + m.spWeight + ', +' + (m.spWeight * 12) + '%. Fulfill it CHEAPLY next time, or ask a BINDING QUESTION.)');
          try { game.tbRefreshTelegraphUI(); } catch (err) {}
          if (game.tbEndCheck()) return true;
          return true; // the manifestation consumed the turn
        } else {
          game.say('📢 ' + pr.line + ' (' + pr.n + ' round' + (pr.n === 1 ? '' : 's') + '.)');
        }
      } else {
        if ((m.spCool || 0) > 0) m.spCool--;
        if ((m.spCool || 0) <= 0 && !m.spProp) {
          var kinds = ['bleed', 'run', 'hesitate'];
          var kind = kinds[(m.spKindIdx || 0) % kinds.length];
          m.spKindIdx = (m.spKindIdx || 0) + 1;
          var line = kind === 'bleed' ? '"IN THREE ROUNDS, YOU WILL BLEED."'
            : kind === 'run' ? '"IN THREE ROUNDS, YOU WILL RUN."'
            : '"IN THREE ROUNDS, YOU WILL HESITATE."';
          m.spProp = { kind: kind, n: 3, line: line, hpMark: p.hp, px: p.mx, py: p.my, moved: 0, struck: false, fulfilled: false };
          try { game.audioEvent('spAnnounce', { kind: kind }); } catch (err) {}
          game.say('📢 ' + line + ' The poster changes — it is showing the ending. (Fulfill it CHEAPLY on your terms, or ask a BINDING QUESTION. Announced things happen.)');
        }
      }
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      // SPOILER CONSUMES (multi-move integration): the announcement IS the attack —
      // the spoiler does not strike. Return true so the legacy attack fallback
      // doesn't fire alongside the prophecy.
      return true;
    },

    // TIMESLOT (Steve 2026-10-10): programming reschedules you to worse
    // and worse venues. The TV guide highlights the next slot a full round
    // ahead — always readable, always in advance. Own the venue (its
    // hazards skip you while your claim holds), or be so boring the show
    // bumps you to daytime.
    tsReschedule: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!m.tsInit) { m.tsInit = true; m.tsIdx = 0; m.tsN = 0; m.tsHi = null; m.tsBump = false; m.tsBoring = 0; }
      var V = TS_VENUES[m.tsIdx];
      f.tsVenue = V.id;
      f.tsDmgMult = V.dmgMult || 1;
      m.tsN++;
      // venue hazards at the top of the turn
      var i, x, native = (p.tsNative === V.id);
      if (V.fire) {
        var parts = [];
        for (i = 0; i < f.fighters.length; i++) {
          x = f.fighters[i];
          if (!x.alive || x.fled) continue;
          if (x.key === 'p' && native) { parts.push('you own this venue — the fire skips you'); continue; }
          game.tbDamage(x.key, V.fire, 'the burning set', m.key, { quiet: true });
          parts.push((x.key === 'p' ? 'you' : (x.name || 'it')) + ' -' + V.fire);
        }
        game.say('🔥 ' + V.name + ' — the set is on fire and nobody called cut. (' + parts.join('; ') + ')');
      }
      if (V.fall) {
        for (i = 0; i < f.fighters.length; i++) {
          x = f.fighters[i];
          if (!x.alive || x.fled) continue;
          if (x.key === 'p' && native) continue;
          game.tbDamage(x.key, V.fall, 'the long way down', m.key, { quiet: true });
        }
        game.say('🕳️ ' + V.name + ' — no footing. The floor is a rumor. (' + V.fall + ' to everyone' + (native ? '; you own this venue — you found the one solid tile' : '') + ')');
      }
      if (V.comfort) {
        m.hp = Math.min(m.maxHp, m.hp + V.comfort);
        game.say('🛋️ ' + V.name + ' — comfort as a trap. It settles deeper into the cushions (+' + V.comfort + ' HP); your healing is halved here.');
      }
      if (!p.alive || f.over) { game.tbEndCheck(); return true; }
      // boring check: a wait with no strike, no damage, no movement.
      // (Consumes the shared strike flags — in a single-monster fight the
      // timeslot is the only reader; stale flags would make the player
      // "never boring" after one strike.)
      var snap = f.tsSnap;
      var moved = snap ? (p.mx !== snap.px || p.my !== snap.py) : false;
      var struck = !!f.sigW5Struck;
      var pdmg = f.sigW5PDmg || 0;
      f.sigW5Struck = false; f.sigW5PDmg = 0;
      var boringTurn = p.acted && (p.moveLeft || 0) <= 0 && !struck && pdmg === 0 && !moved;
      if (boringTurn) { m.tsBoring = (m.tsBoring || 0) + 1; }
      else { m.tsBoring = 0; }
      if ((m.tsBoring || 0) >= 2 && !m.tsBump) {
        m.tsBump = true; m.tsBoring = 0;
        game.say('📅 The guide flips back — quickly. You are too boring for this slot. (BUMPED — next venue: DAYTIME SLOT.)');
      }
      f.tsSnap = { px: p.mx, py: p.my };
      // the reschedule
      if (m.tsHi != null) {
        var nv = m.tsBump ? TS_VENUES[5] : TS_VENUES[m.tsHi];
        m.tsIdx = m.tsBump ? 5 : m.tsHi;
        m.tsHi = null; m.tsBump = false; m.tsN = 1;
        p.tsNative = null; // you owned the venue, not the schedule
        f.tsVenue = nv.id; f.tsDmgMult = nv.dmgMult || 1;
        try { game.audioEvent('tsReschedule', { venue: nv.id }); } catch (err) {}
        game.say('📅 RESCHEDULED — welcome to ' + nv.name + '. ' + nv.desc + '. (Hold onto something. The guide already eyes the next slot.)');
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return true; // the reschedule IS the turn
      }
      if (m.tsN % 3 === 0) {
        var nextIdx = (m.tsIdx + 1) % 5;
        m.tsHi = nextIdx;
        var nn2 = TS_VENUES[nextIdx];
        game.say('📅 The TV guide flips. HIGHLIGHTED: ' + nn2.name + ' — ' + nn2.desc + '. One round. (Own this venue, or get bumped.)');
        try { game.audioEvent('tsHighlight', { venue: nn2.id }); } catch (err) {}
      }
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      return false;
    },

    // NIELSEN (Steve 2026-10-10): ratings, embodied. It doesn't attack — it
    // WATCHES, and what it watches becomes real. The viewer counter is
    // always visible and always honest. Flashy feeds it; boring starves
    // it. FIGHT BORING — the epic win is refusing to be epic.
    niWatch: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!m.niInit) { m.niInit = true; m.niRatings = 40; }
      // sign-off: the eye is closed, the audience changed the channel
      if ((m.niSignoff || 0) > 0) {
        m.niSignoff--;
        f.sigW5Struck = false; f.sigW5PDmg = 0;
        if (f.niSnap) { f.niSnap = { mhp: {}, php: p.hp, px: p.mx, py: p.my }; }
        if (m.niSignoff <= 0) {
          m.niRatings = 20;
          game.say('👁️ The eye opens — cautiously. A few viewers drift back. (RATINGS 20)');
        } else {
          game.say('📺 SIGN-OFF — the eye stays closed. The audience changed the channel. (No gaze. ' + m.niSignoff + ' round(s) of dead air.)');
        }
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return true;
      }
      // the watch: rate the player's last turn
      var snap = f.niSnap || {};
      var mhpBefore = (snap.mhp && snap.mhp[m.key] != null) ? snap.mhp[m.key] : m.hp;
      var dmg = Math.max(0, mhpBefore - m.hp);
      var struck = !!f.sigW5Struck;
      var healed = Math.max(0, p.hp - (snap.php != null ? snap.php : p.hp));
      var moved = (snap.px != null) && (p.mx !== snap.px || p.my !== snap.py);
      var waited = p.acted && (p.moveLeft || 0) <= 0 && !struck && !moved && healed <= 0 && dmg <= 0;
      var dR = 0, why = '';
      if (waited) { dR = -8; why = 'waiting — somewhere, a viewer changes the channel'; }
      else if (struck && dmg >= 40) { dR = 8; why = 'a big number — the counter leaps'; }
      else if (struck) { dR = -4; why = 'a workmanlike swing — the audience checks their phones'; }
      else if (healed >= 25) { dR = 4; why = 'spectacle healing — the crowd leans in'; }
      else if (moved) { dR = -4; why = 'repositioning — dead air'; }
      else { dR = -2; why = 'nothing worth watching'; }
      m.niRatings = clampN((m.niRatings || 40) + dR, 0, 100);
      f.sigW5Struck = false; f.sigW5PDmg = 0;
      f.niSnap = { mhp: {}, php: p.hp, px: p.mx, py: p.my };
      for (var i = 0; i < f.fighters.length; i++) {
        var q = f.fighters[i];
        if (q.kind === 'monster') f.niSnap.mhp[q.key] = q.hp;
      }
      var r = m.niRatings;
      try { game.audioEvent('niWatch', { ratings: r }); } catch (err) {}
      if (r <= 0) {
        m.niSignoff = 2;
        game.say('👁️ RATINGS 0 — ' + why + '. The pupil shrinks to a pinprick... and the eye CLOSES. (SIGN-OFF — 2 rounds of dead air. Stay boring.)');
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return true;
      }
      game.say('👁️ VIEWERS: ' + r + ' — ' + why + '. (' + (dR >= 0 ? '+' : '') + dR + ')' + (r >= 70 ? ' The pupil DILATES — sweeps week is coming.' : ''));
      // the gaze: what it watches becomes real
      if (m.niSated) {
        m.niSated = false;
        game.say('The Nielsen got the shot — it just watches, sated. (No gaze this round. You performed on your terms.)');
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return true;
      }
      var gaze = Math.round(roll([50, 80]) * (0.5 + r / 100));
      var landed = game.tbDamage('p', gaze, "the Nielsen's gaze", m.key);
      game.say('👁️ The gaze lands — what it watches becomes real. (' + landed + ')');
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      return true; // the watch-and-gaze IS the turn
    },

    // FINALE (Steve 2026-10-10): every season needs its climax, and this
    // one is yours. It GROWS every round — visible escalation. Once per
    // fight it declares: 3 rounds to an UNAVOIDABLE [150,200] title card.
    // Feed it something real, or end it first. Doom deaths flow through
    // maybeCheatDeath — unkillable means unkillable.
    fiFinale: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!m.fiInit) { m.fiInit = true; m.fiGrowth = 0; m.fiDealt = 0; }
      m.fiGrowth++;
      m.fiDealt = (m.fiDealt || 0) + (f.sigW5PDmg || 0);
      // the declaration: once per fight
      // (finale-campaign 2026-10-12: the opening credits declare with a
      // longer fuse and a smaller card — overrides live on the fighter or
      // its mdef as fiCountdownRounds / fiCardRange.)
      if (!m.fiDeclared && (m.hp <= (m.maxHp || m.hp) * 0.5 || (f.round || 1) >= 4)) {
        m.fiDeclared = true;
        var cdRounds = (m.fiCountdownRounds != null ? m.fiCountdownRounds : ((m.mdef && m.mdef.fiCountdownRounds) || 3));
        m.fiCountdown = cdRounds;
        var cardRange0 = m.fiCardRange || (m.mdef && m.mdef.fiCardRange) || [150, 200];
        var cdWords = cdRounds === 3 ? 'THREE ROUNDS' : cdRounds + ' ROUNDS';
        try { game.audioEvent('fiDeclare', {}); } catch (err) {}
        game.say('🌌 "PREVIOUSLY ON..." The sky replays your life. It has been watching. "THE FINALE. ' + cdWords + '." The title card rises, enormous. (Unavoidable [' + cardRange0[0] + ',' + cardRange0[1] + '] at zero. FEED IT something real — or FINISH IT.)');
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return false; // still fighting while it declares
      }
      if ((m.fiCountdown || 0) > 0) {
        m.fiCountdown--;
        var n = m.fiCountdown;
        if (n <= 0) {
          // ---- THE TITLE CARD FALLS ----
          m.fiCountdown = null;
          var cardRange = m.fiCardRange || (m.mdef && m.mdef.fiCardRange) || [150, 200];
          var dmg = roll(cardRange);
          try { game.audioEvent('fiTitleCard', {}); } catch (err) {}
          game.say('🎬 THE TITLE CARD FALLS. There is nowhere to be that it is not falling. (Unavoidable.)');
          var landed = game.tbDamage('p', dmg, 'the falling title card', m.key, { undodgeable: true, sigW5NoMult: true });
          game.say('It lands for ' + landed + '.');
          // doom deaths flow through the single choke point — maybeCheatDeath
          // (phoenix_clause / second_wind) triggers normally. Never bypassed.
          if (game.tbEndCheck()) return true;
          return true;
        }
        game.say('📼 "PREVIOUSLY ON: you struck for ' + (f.sigW5PDmg || 0) + ' (' + (m.fiDealt || 0) + ' total). It bled." (' + n + ' round' + (n === 1 ? '' : 's') + ' to the title card.)');
      } else if ((m.fiGrowth || 0) % 2 === 0) {
        game.say('🌌 It GROWS — visibly. (x' + m.fiGrowth + ' — its hits land +' + (m.fiGrowth * 5) + '% harder. You can SEE the finale coming.)');
      }
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      return false;
    },

    // NETWORK NOTE (Steve 2026-10-10): the executives are watching, and
    // they have notes. Every note is announced a full round before it
    // lands — the pen underlines, then it applies. Kill it first (lowest
    // wave-5 HP — support dies first), or feed it terrible ideas and watch
    // it "fix" the wrong thing. It catches on: bad notes get REVERTED.
    nnNote: function (game, m) {
      var f = game.tbfight;
      if (!f || f.over) return false;
      var p = game.tbFighter('p');
      if (!p || !p.alive) return false;
      if (!m.nnInit) { m.nnInit = true; m.nnAlt = 0; }
      // tick durations on monsters
      var i, x;
      for (i = 0; i < f.fighters.length; i++) {
        x = f.fighters[i];
        if (x.kind !== 'monster' || !x.alive || x.fled) continue;
        if ((x.nnBuffed || 0) > 0) x.nnBuffed--;
        if ((x.nnShrunk || 0) > 0) x.nnShrunk--;
      }
      if ((p.nnVuln || 0) > 0) p.nnVuln--;
      if ((p.nnTired || 0) > 0) p.nnTired--;
      if ((p.nnDrama || 0) > 0) p.nnDrama--;
      // stuck in a meeting (fed bad note: more ad breaks)
      if ((m.nnPaused || 0) > 0) {
        m.nnPaused--;
        game.say('📝 The memo is stuck in a meeting it scheduled for itself. (No note this round. The pen taps, impatiently.)');
        try { game.tbRefreshTelegraphUI(); } catch (err) {}
        if (game.tbEndCheck()) return true;
        return true;
      }
      // the memo catches on: a fed bad note gets REVERTED the turn after it
      // applied (not the same turn — the trick needs a window to work).
      if (m.nnRevertDue) {
        var rvid = m.nnRevertDue; m.nnRevertDue = null;
        nnRevertBad(game, m, p, f, rvid);
      }
      // apply the pending note (announced last round — the pen underlined)
      var pend = m.nnPending;
      m.nnPending = null;
      if (pend && pend.kind === 'bad') {
        nnApplyBad(game, m, p, f, pend);
      } else if (pend) {
        nnApplyNote(game, m, p, f, pend);
      }
      if (!p.alive || f.over) { game.tbEndCheck(); return true; }
      // a fed bad note REPLACES the memo's own note this turn (announced now,
      // applied next turn — the revert comes the turn after that, via nnRevertDue).
      if (m.nnBadFed) {
        var bad = m.nnBadFed; m.nnBadFed = null;
        m.nnPending = { kind: 'bad', id: bad };
        game.say('📝 The memo writes down YOUR note — "' + NN_BAD[bad].memo + '" The pen underlines. It lands next round. (It takes suggestions. This is a mistake.)');
        try { game.audioEvent('nnBadFed', { id: bad }); } catch (err) {}
      } else {
        m.nnPending = nnNextNote(m);
        game.say('📝 The memo\'s text is VISIBLE: "' + m.nnPending.memo + '" The pen underlines — it lands next round. (Read the memo for exact terms.)');
        try { game.audioEvent('nnNote', { id: m.nnPending.id }); } catch (err) {}
      }
      try { game.tbRefreshTelegraphUI(); } catch (err) {}
      if (game.tbEndCheck()) return true;
      return false; // the note-writing interleaves with Just Fix It
    },
  };
  Object.assign(HB, sigHooks);

  // ---------------- Timeslot: venue table ----------------
  var TS_VENUES = [
    { id: 'green', name: 'THE GREEN ROOM', desc: 'everything is muted here, even the violence', dmgMult: 0.75 },
    { id: 'studio', name: 'LIVE STUDIO', desc: 'the audience leans in — everything lands harder', dmgMult: 1.25 },
    { id: 'burning', name: 'BURNING BUILDING', desc: 'the set is on fire and nobody called cut', fire: 8 },
    { id: 'suburb', name: 'THE SUBURB (a wave-4 rerun)', desc: 'comfort as a trap — your healing is halved, it is comfy', healMult: 0.5, comfort: 6 },
    { id: 'midair', name: 'MID-AIR', desc: 'no footing — the floor is a rumor', fall: 12 },
    { id: 'daytime', name: 'DAYTIME SLOT', desc: 'nothing happens here. Glorious, boring nothing', benign: true },
  ];

  // ---------------- Network Note: note tables ----------------
  var NN_NOTES = [
    { id: 'vuln', kind: 'nerf', memo: 'THE HERO SHOULD BE MORE VULNERABLE',
      read: '"More vulnerable" means you take +25% damage, 2 rounds.' },
    { id: 'lasers', kind: 'buff', memo: 'THE WOLF SHOULD HAVE LASERS NOW',
      read: '"Lasers" means every monster hits +25%, 2 rounds. Yes, including the memo.' },
    { id: 'tired', kind: 'nerf', memo: 'THE HERO IS TIRED',
      read: '"Tired" means your strikes land -25%, 2 rounds.' },
  ];
  var NN_BAD = {
    smaller: { memo: 'THE MONSTERS SHOULD BE SMALLER',
      apply: 'The memo underlines it before thinking — every monster shrinks. (-25% monster damage, 2 rounds.)',
      revert: '"...REVERT THAT," says the memo, quickly. The pen shakes. (The monsters un-shrink.)' },
    drama: { memo: "THE HERO'S ENTRANCE NEEDS MORE DRAMA",
      apply: 'The memo gives YOU a dramatic entrance — spotlight, wind machine. (Your strikes +25%, 2 rounds.)',
      revert: '"...REVERT THAT," says the memo. The spotlight dies. (Your drama ends.)' },
    adbreak: { memo: 'THE FIGHT NEEDS MORE AD BREAKS',
      apply: 'The memo schedules an ad break. For itself. It is stuck in a meeting for 1 round.',
      revert: '"...REVERT THAT," says the memo, emerging from the meeting, hollow-eyed.' },
  };
  function nnNextNote(m) {
    var n = NN_NOTES[(m.nnAlt || 0) % NN_NOTES.length];
    m.nnAlt = (m.nnAlt || 0) + 1;
    return n;
  }
  function nnApplyNote(game, m, p, f, note) {
    if (!note) return;
    if (note.id === 'vuln') {
      p.nnVuln = 2;
      game.say('✒️ NOTE APPLIED: "THE HERO SHOULD BE MORE VULNERABLE" — underlined, twice. You take +25% damage, 2 rounds.');
    } else if (note.id === 'lasers') {
      for (var i = 0; i < f.fighters.length; i++) {
        var x = f.fighters[i];
        if (x.kind === 'monster' && x.alive && !x.fled) x.nnBuffed = 2;
      }
      game.say('✒️ NOTE APPLIED: "THE WOLF SHOULD HAVE LASERS NOW" — and then it does. Every monster +25% damage, 2 rounds.');
    } else if (note.id === 'tired') {
      p.nnTired = 2;
      game.say('✒️ NOTE APPLIED: "THE HERO IS TIRED" — your arms agree with the memo. Your strikes -25%, 2 rounds.');
    }
    try { game.audioEvent('nnApply', { id: note.id }); } catch (err) {}
  }
  function nnApplyBad(game, m, p, f, pend) {
    var id = pend.id, i, x;
    if (id === 'smaller') {
      for (i = 0; i < f.fighters.length; i++) {
        x = f.fighters[i];
        if (x.kind === 'monster' && x.alive && !x.fled) x.nnShrunk = 2;
      }
    } else if (id === 'drama') {
      p.nnDrama = 2;
    } else if (id === 'adbreak') {
      m.nnPaused = 1;
    }
    game.say('✒️ YOUR NOTE APPLIED: ' + NN_BAD[id].apply);
    m.nnRevertDue = id; // the memo catches on NEXT turn — the trick gets a window
    try { game.audioEvent('nnBadApply', { id: id }); } catch (err) {}
  }
  function nnRevertBad(game, m, p, f, id) {
    var i, x;
    if (id === 'smaller') {
      for (i = 0; i < f.fighters.length; i++) {
        x = f.fighters[i];
        if (x.kind === 'monster') x.nnShrunk = 0;
      }
    } else if (id === 'drama') { p.nnDrama = 0; }
    game.say('↩️ ' + NN_BAD[id].revert);
  }

  // ---------------- shared damage interception ----------------
  // ONE choke point for every signature damage modifier: venue mults,
  // note buffs/nerfs, finale growth, rerun adapt/exposed, spoiler weight,
  // bad-note effects. Guarded by fight-state flags; exact telegraphed
  // numbers (the title card) pass sigW5NoMult.
  var _sigW5tbDamage = G.tbDamage;
  G.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
    try {
      var f = this.tbfight;
      if (f && !f.over && typeof dmg === 'number' && dmg > 0 && !(opts && opts.sigW5NoMult)) {
        var atk = null, def = null;
        try { atk = sourceKey ? this.tbFighter(sourceKey) : null; } catch (e) {}
        try { def = targetKey ? this.tbFighter(targetKey) : null; } catch (e) {}
        var mult = 1;
        if (f.tsDmgMult && f.tsDmgMult !== 1) {
          var p0 = null;
          try { p0 = this.tbFighter('p'); } catch (e2) {}
          var native = !!(p0 && f.tsVenue && p0.tsNative === f.tsVenue);
          var involvesP = (atk && atk.key === 'p') || (def && def.key === 'p');
          if (!involvesP || !native) mult *= f.tsDmgMult;
        }
        if (atk && atk.kind === 'monster') {
          if ((atk.nnBuffed || 0) > 0) mult *= 1.25;
          if ((atk.nnShrunk || 0) > 0) mult *= 0.75;
          if (atk.fiGrowth) mult *= (1 + 0.05 * atk.fiGrowth);
          // finale-campaign (2026-10-12): the Bad Note — its strikes land softer
          if ((atk.fiNoteVuln || 0) > 0) mult *= 0.7;
          if (atk.rrAdapt) mult *= (1 + 0.10 * atk.rrAdapt);
          // (spoiler weight is applied by the hook at manifestation time,
          // not here — the hook owns the Leaked Ending damage directly)
        }
        if (atk && atk.key === 'p') {
          if ((atk.nnDrama || 0) > 0) mult *= 1.25;
          if ((atk.nnTired || 0) > 0) mult *= 0.75;
          if (def && def.mdef && def.mdef.id === 'rerun') {
            if (f.rrLeft) mult *= 1.15;
            if (f.rrBigArmed) { mult *= 2; f.rrBigArmed = false; }
          }
        }
        if (def && def.mdef && def.mdef.id === 'rerun' && (f.rrExposed || 0) > 0) {
          mult *= (f.rrRigging ? 2 : 1.5);
        }
        if (def && def.key === 'p' && (def.nnVuln || 0) > 0) mult *= 1.25;
        if (mult !== 1) dmg = Math.max(1, Math.round(dmg * mult));
      }
    } catch (e) {}
    return _sigW5tbDamage.call(this, targetKey, dmg, sourceLabel, sourceKey, opts);
  };

  // Suburb venue: healing halved unless you own the venue.
  var _sigW5addHealth = G.addHealth;
  G.addHealth = function (n) {
    try {
      var f = this.tbfight;
      if (f && !f.over && f.tsVenue === 'suburb' && typeof n === 'number' && n > 0) {
        var p = null;
        try { p = this.tbFighter('p'); } catch (e) {}
        if (!(p && p.tsNative === 'suburb')) n = Math.ceil(n / 2);
      }
    } catch (e) {}
    return _sigW5addHealth.call(this, n);
  };

  // Strike observation for the spoiler (hesitate) and the nielsen (flashy).
  // Chains over any earlier wrap (sigW3a) — defensive try/catch throughout.
  var _sigW5tbPlayerStrike = G.tbPlayerStrike;
  G.tbPlayerStrike = function (targetKey) {
    var f = this.tbfight, t = null, hpBefore = -1;
    try {
      if (f && !f.over) { t = this.tbFighter(targetKey); if (t) hpBefore = t.hp; }
    } catch (e) {}
    var out = _sigW5tbPlayerStrike.apply(this, arguments);
    try {
      if (f && !f.over && t && hpBefore >= 0 && out !== false) {
        f.sigW5Struck = true;
        f.sigW5PDmg = (f.sigW5PDmg || 0) + Math.max(0, hpBefore - t.hp);
      }
    } catch (e) {}
    return out;
  };

  // ---------------- player actions ----------------
  Object.assign(G, {
    // CANCELLATION: go off-script. Do something the script never called
    // for — the stamp can't cancel what's not in the script. Resets the
    // descend. Costs the act; the review keeps coming, so it's tempo.
    tbCxOffScript() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'cancellation');
      if (!m) { this.say('Nothing here is reading from a script.'); return false; }
      if ((m.cxDescend || 0) <= 0) { this.say('The stamp is not descending — nothing to interrupt. (Wait for the throat-clear.)'); return false; }
      p.acted = true;
      m.cxDescend = 0;
      const improvs = [
        'You compliment the stamp\'s penmanship. At length.',
        'You sit down mid-fight and have a small snack. The script did not call for a snack.',
        'You sing the System\'s hold music. You do not know the words. There are no words.',
        'You wave at the skybox. "Hi, moms."',
        'You narrate your own stage directions, badly, out loud.',
      ];
      const pick = improvs[Math.floor(Math.random() * improvs.length)];
      this.say('🎭 OFF-SCRIPT — ' + pick + ' That was not in the script. The stamp hesitates mid-air — it cannot file this. (Descend reset.)');
      try { this.audioEvent('cxOffScript', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // CANCELLATION: spend favor — the audience overrules the cancellation.
    // Renewal campaign as combat. Blocked while favor is silenced.
    tbCxSpendFavor() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'cancellation');
      if (!m) { this.say('Nothing here to overrule.'); return false; }
      if ((m.cxDescend || 0) <= 0) { this.say('The stamp is not descending — save your favor.'); return false; }
      if ((f.cxSilence || 0) > 0) { this.say('Your voice does not carry — the stamp\'s ringing drowns the crowd. (Favor silenced, ' + f.cxSilence + ' round(s). Improvise instead.)'); return false; }
      let lane = 'showbiz', fav = 0, club = 'your fans';
      try {
        lane = this.apTopLane();
        fav = this.apFanLane(lane);
        club = this.apClubName(lane);
      } catch (e) {}
      if (fav < 10) { this.say('No club loves you enough to overrule this. (Need 10 favor — ' + club + ' sit at ' + fav + '.)'); return false; }
      p.acted = true;
      try { this.apAdjustFavor(-15, 'the audience overrules your cancellation — RENEWED', lane); } catch (e) {}
      m.cxDescend = 0; m.cxCool = 3;
      this.say('📢 The crowd ROARS — RENEWED! The stamp withdraws to a respectful altitude. (The audience overruled it. −15 ' + club + ' favor.)');
      try { this.audioEvent('cxRenewed', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // EDITOR: retrieve from the cutting-room floor. Stand by the marked
    // tile; take back everything cut: allies walk back in, positions step
    // back, deleted scenes air after all.
    tbEdRetrieve() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'editor');
      if (!m) { this.say('No cutting-room floor here.'); return false; }
      const fl = f.edFloor, items = f.edFloorItems || [];
      if (!fl || !items.length) { this.say('The floor is empty — nothing has been cut yet.'); return false; }
      if (Math.max(Math.abs(p.mx - fl.x), Math.abs(p.my - fl.y)) > 1) {
        this.say('Too far — stand by the marked tile [' + fl.x + ',' + fl.y + '] to retrieve. (Adjacent counts.)');
        return false;
      }
      p.acted = true;
      const got = [];
      for (const it of items.splice(0, items.length)) {
        if (it.kind === 'ally') {
          const a = this.tbFighter(it.key);
          if (a && a.edCut) {
            a.edCut = false; a.fled = false; a.edCutRounds = 0;
            a.mx = fl.x; a.my = fl.y;
            got.push((a.name || 'your ally') + ' walks back in');
          }
        } else if (it.kind === 'position') {
          p.mx = it.x; p.my = it.y;
          try { this.state.scholar.mx = it.x; this.state.scholar.my = it.y; } catch (e) {}
          got.push('you step back into your cut position');
        } else if (it.kind === 'scene') {
          const t = it.targetKey ? this.tbFighter(it.targetKey) : null;
          if (t && t.alive && !t.fled) {
            const landed = this.tbDamage(it.targetKey, it.dmg, 'the deleted scene', 'p');
            got.push('the deleted scene airs after all (' + landed + ' to ' + (t.name || 'it') + ')');
          } else {
            got.push('the deleted scene airs — to an empty room');
          }
        }
      }
      this.say('🎬 RETRIEVED from the cutting-room floor: ' + got.join('; ') + '. (What is cut is not gone — it is somewhere.)');
      try { this.audioEvent('edRetrieve', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // EDITOR: contradict yourself — two contradictory things at once. The
    // blades jam on a contradiction; the next cut is spent unjamming.
    tbEdContradict() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'editor');
      if (!m) { this.say('Nothing here to contradict.'); return false; }
      if (m.edJammed) { this.say('It is already jammed on your last contradiction.'); return false; }
      p.acted = true;
      m.edJammed = true;
      this.say('🌀 CONTRADICTION — you advance and retreat in the same breath. You agree, loudly, while shaking your head no. The scissors shudder — the blades JAM on it. (The next cut is spent unjamming.)');
      try { this.audioEvent('edContradict', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // RERUN: leave a message in the margins of the script. Writing
    // persists across resets — the knowledge system as weapon. One per
    // kind per fight; each is mechanical, not flavor.
    tbRrLeaveMessage(kind) {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'rerun');
      if (!m) { this.say('No script here to write in.'); return false; }
      const K = { rigging: 'rigging', left: 'left', big: 'big' }[kind];
      if (!K) { this.say('What message? (rigging, left, big)'); return false; }
      f.rrMessages = f.rrMessages || [];
      if (f.rrMessages.some(g => g.kind === K)) { this.say('That message is already in the margins.'); return false; }
      p.acted = true;
      const text = K === 'rigging' ? 'HIT THE RIGGING WHEN THE SET SHOWS'
        : K === 'left' ? 'IT LEADS WITH ITS LEFT'
        : 'SAVE THE BIG HIT FOR AFTER THE CLAP';
      f.rrMessages.push({ kind: K, text: text });
      if (K === 'rigging') f.rrRigging = true;
      if (K === 'left') f.rrLeft = true;
      if (K === 'big') { f.rrMsgBig = true; f.rrBigArmed = true; }
      this.say('✉️ You write in the margins: "' + text + '." ' +
        (K === 'rigging' ? '(Post-reset exposure: x2 damage instead of x1.5.)'
          : K === 'left' ? '(Your strikes vs the Rerun: +15%, every take.)'
          : '(Your first strike after every clap: x2.)') +
        ' The clapperboard cannot see the margins. Your handwriting will survive the rewind.');
      try { this.audioEvent('rrMessage', { kind: K }); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // RERUN: read your margin messages. Free — reading is the defense.
    tbRrReadMessages() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const m = w5monster(this, 'rerun');
      if (!m) { this.say('No script here.'); return false; }
      const msgs = f.rrMessages || [];
      if (!msgs.length) { this.say('The margins are blank. (Write between resets.)'); return true; }
      this.say('📖 The margins, in your handwriting: ' + msgs.map(g => '"' + g.text + '"').join(' '));
      return true;
    },

    // SPOILER: ask the binding question. It must tell the truth — and the
    // answer binds IT too: it must announce something harmless, wasting
    // its cycle on "IN TWO ROUNDS, YOU WILL BLINK."
    tbSpAsk() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'spoiler');
      if (!m) { this.say('Nothing here knows the future.'); return false; }
      p.acted = true;
      m.spProp = { kind: 'blink', n: 2, line: '"IN TWO ROUNDS, YOU WILL BLINK."', fulfilled: false };
      m.spCool = 0;
      this.say('❓ "WHAT HAPPENS IF I ASK NOTHING?" The voiceover falters. "...UNLESS—" It must answer true, and the answer binds it: ' + m.spProp.line + ' (It must announce it. A wasted cycle — blinking feeds nothing.)');
      this.say('(Its current weight: ' + (m.spWeight || 0) + ' — +' + ((m.spWeight || 0) * 12) + '% damage. It told you because you asked right.)');
      try { this.audioEvent('spAsk', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // SPOILER: fulfill the prophecy cheaply, on your terms. It still feeds
    // (weight+1) — but a sated voiceover announces less often.
    tbSpCheapFulfill() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'spoiler');
      if (!m || !m.spProp || m.spProp.fulfilled) { this.say('No live prophecy to fulfill cheaply.'); return false; }
      const pr = m.spProp;
      if (pr.kind === 'blink') { this.say('Blinking fulfills itself. Save your cleverness.'); return false; }
      p.acted = true;
      if (pr.kind === 'bleed') {
        this.tbDamage('p', 5, 'your own deliberate thumb-prick', 'p', { undodgeable: true, quiet: true });
        this.say('🤏 You prick your thumb — five drops, deliberate. "...AND THEN THEY BLED," says the voiceover, quietly thrilled. Fulfilled — on your terms. (−5, not −75. Sated: it will not announce for a while.)');
      } else if (pr.kind === 'run') {
        p.moveLeft = 0;
        this.say('🤏 You pace — three deliberate steps to nowhere, burning the whole move. "...AND THEN THEY RAN," says the voiceover. Fulfilled — on your terms. (Sated: it will not announce for a while.)');
      } else if (pr.kind === 'hesitate') {
        this.say('🤏 You hesitate — deliberately, theatrically, a full beat of nothing. "...AND THEN THEY HESITATED." Fulfilled — on your terms. (Sated: it will not announce for a while.)');
      }
      pr.fulfilled = true;
      m.spWeight = (m.spWeight || 0) + 1;
      m.spProp = null; m.spCool = 5;
      try { this.audioEvent('spCheap', { kind: pr.kind }); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // TIMESLOT: own the venue. Plant your feet and declare it yours — its
    // hazards skip you while the claim holds (until the next reschedule).
    tbTsOwnVenue() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'timeslot');
      if (!m) { this.say('No venue here to own.'); return false; }
      const V = TS_VENUES[m.tsIdx || 0];
      if (p.tsNative === V.id) { this.say('You already own ' + V.name + '.'); return false; }
      p.acted = true;
      p.tsNative = V.id;
      this.say('🏟️ You plant your feet and declare ' + V.name + ' YOURS. Every venue has a native — for the rest of this slot, that is you. (Its hazards skip you. The claim ends at the next reschedule.)');
      try { this.audioEvent('tsOwn', { venue: V.id }); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // NIELSEN: perform deliberately — mug for the camera. The ratings
    // spike (+15), but the Nielsen GOT THE SHOT: the next gaze is just
    // watching. Watched on your terms.
    tbNiPlayToCamera() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'nielsen');
      if (!m) { this.say('No camera here.'); return false; }
      p.acted = true;
      m.niRatings = clampN((m.niRatings || 40) + 15, 0, 100);
      m.niSated = true;
      this.say('📸 You mug for the camera — the Nielsen GOT THE SHOT. (+15 viewers — dangerous.) It is sated: the next gaze is just watching. (Watched on your terms.)');
      try { this.audioEvent('niCamera', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // FINALE: the sacrifice. Feed it something real — an item from your
    // pack, or a food memory (−250 kcal; it tastes like birthdays) — and
    // the countdown passes. WHAT you feed it is the choice.
    tbFiSacrifice(kind) {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = fiMonster(this);
      if (!m) { this.say('Nothing here to feed.'); return false; }
      if ((m.fiCountdown || 0) <= 0) { this.say('No countdown running — nothing to feed. (It declares once per fight.)'); return false; }
      const s = this.state.scholar;
      if (kind === 'item') {
        const inv = (s.inventory || []).filter(it => (it.units || 1) > 0);
        if (!inv.length) { this.say('Your pack is empty — nothing to feed it. (Try a memory.)'); return false; }
        const it = inv[0], iid = it.itemId || it.id, nm = it.name || iid;
        p.acted = true;
        try { this.consumeItem(iid, 1); } catch (e) {}
        m.fiCountdown = null;
        this.say('🎁 You feed it ' + nm + '. The title card pauses — chews — swallows. "...SATISFIED." The finale passes. (Once per fight — it will not declare again.)');
      } else if (kind === 'memory') {
        if ((s.kcal || 0) < 250) { this.say('You reach for a food memory and find the cupboard bare. (Need 250 kcal of carried food.)'); return false; }
        p.acted = true;
        s.kcal = Math.max(0, (s.kcal || 0) - 250);
        m.fiCountdown = null;
        this.say('🎁 You feed it a memory — birthdays, probably. It tastes like cake. (−250 kcal of carried food. "...SATISFIED." The finale passes.)');
      } else {
        this.say('Feed it what? (item, memory)');
        return false;
      }
      try { this.audioEvent('fiSacrifice', { kind: kind }); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // NETWORK NOTE: feed it a bad note. It takes suggestions — plant a
    // terrible idea and it "fixes" the wrong thing. It catches on: the
    // memo REVERTS your note next turn. Social engineering as combat.
    tbNnBadNote(kind) {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'network_note');
      if (!m) { this.say('No memo here to poison.'); return false; }
      if (!NN_BAD[kind]) { this.say('What terrible idea? (smaller, drama, adbreak)'); return false; }
      if (m.nnBadFed || m.nnRevertDue) { this.say('It is still chewing on your last note. (One terrible idea at a time.)'); return false; }
      p.acted = true;
      m.nnBadFed = kind;
      this.say('💡 You lean in, helpful as anything: "Have you considered— ' + NN_BAD[kind].memo + '?" The memo WRITES IT DOWN. (It takes suggestions. This is a mistake. It lands next round — then it catches on.)');
      try { this.audioEvent('nnBadNote', { id: kind }); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // NETWORK NOTE: read the memo. The text is visible, but knowledge
    // gates apply — you have to actually read it for the exact terms.
    tbNnReadMemo() {
      const f = this.tbfight;
      if (!f || !this.tbIsPlayerTurn()) return false;
      const p = this.tbFighter('p');
      if (!p || p.acted) { this.say('Already acted this turn.'); return false; }
      const m = w5monster(this, 'network_note');
      if (!m || !m.nnPending) { this.say('No memo text to read.'); return false; }
      p.acted = true;
      const pend = m.nnPending;
      const exact = pend.kind === 'bad' ? NN_BAD[pend.id].apply
        : (NN_NOTES.find(n => n.id === pend.id) || {}).read || pend.memo;
      this.say('📝 You read the memo properly: "' + pend.memo + '" — ' + exact);
      try { this.audioEvent('nnRead', {}); } catch (err) {}
      this.tbAfterPlayerAction();
      return true;
    },

    // Combat-panel buttons for the eight mechanics. Called from app.js's
    // combat strip (one insertion point); wired by data-sigw5 in
    // wireCombatPanel. Returns '' when nothing applies.
    sigW5CombatButtons() {
      const f = this.tbfight;
      if (!f || f.over) return '';
      let p = null;
      try { p = this.tbFighter('p'); } catch (e) {}
      const dis = (p && p.acted) ? 'disabled' : '';
      const out = [];
      const btn = (fn, label, title, arg) =>
        '<button class="self-btn" data-sigw5="' + fn + '"' + (arg ? ' data-arg="' + arg + '"' : '') + ' ' + dis + ' title="' + title + '">' + label + '</button>';
      if (w5monster(this, 'cancellation') && ((w5monster(this, 'cancellation').cxDescend || 0) > 0)) {
        out.push(btn('tbCxOffScript', '🎭 Off-script', 'Do something unscripted — the stamp can\'t cancel what\'s not in the script'));
        out.push(btn('tbCxSpendFavor', '📢 Spend favor', 'The audience overrules the cancellation (−15 favor, needs 10)'));
      }
      const ed = w5monster(this, 'editor');
      if (ed) {
        if ((f.edFloorItems || []).length) out.push(btn('tbEdRetrieve', '🎬 Retrieve', 'Take back everything on the cutting-room floor (stand by the marked tile)'));
        out.push(btn('tbEdContradict', '🌀 Contradict', 'Do two contradictory things at once — jam the next cut'));
      }
      const rr = w5monster(this, 'rerun');
      if (rr) {
        const has = k => (f.rrMessages || []).some(g => g.kind === k);
        if (!has('rigging')) out.push(btn('tbRrLeaveMessage', '📝 Rigging', 'Write in the margins: HIT THE RIGGING WHEN THE SET SHOWS (post-reset x2)', 'rigging'));
        if (!has('left')) out.push(btn('tbRrLeaveMessage', '⬅️ Left', 'Write in the margins: IT LEADS WITH ITS LEFT (your strikes +15%)', 'left'));
        if (!has('big')) out.push(btn('tbRrLeaveMessage', '💥 Big hit', 'Write in the margins: SAVE THE BIG HIT FOR AFTER THE CLAP (first strike x2)', 'big'));
        if ((f.rrMessages || []).length) out.push(btn('tbRrReadMessages', '📖 Notes', 'Read your margin messages (free)'));
      }
      const sp = w5monster(this, 'spoiler');
      if (sp) {
        out.push(btn('tbSpAsk', '❓ Binding Q', 'Ask the question it must answer true — it binds IT too'));
        if (sp.spProp && !sp.spProp.fulfilled && sp.spProp.kind !== 'blink') {
          out.push(btn('tbSpCheapFulfill', '🤏 Fulfill cheap', 'Fulfill the prophecy on your terms — a sated voiceover announces less'));
        }
      }
      if (w5monster(this, 'timeslot')) out.push(btn('tbTsOwnVenue', '🏟️ Own venue', 'Declare this venue yours — its hazards skip you until reschedule'));
      if (w5monster(this, 'nielsen')) out.push(btn('tbNiPlayToCamera', '📸 Camera', 'Mug for the camera — +15 viewers, but the next gaze is just watching'));
      const fi = fiMonster(this);
      if (fi && (fi.fiCountdown || 0) > 0) {
        out.push(btn('tbFiSacrifice', '🎁 Feed: item', 'Feed the finale an item from your pack (real cost)', 'item'));
        out.push(btn('tbFiSacrifice', '🧠 Feed: memory', 'Feed the finale a food memory (−250 kcal)', 'memory'));
      }
      const nn = w5monster(this, 'network_note');
      if (nn) {
        if (!nn.nnBadFed && !nn.nnRevertDue) {
          out.push(btn('tbNnBadNote', '💡 Smaller!', 'Suggest: THE MONSTERS SHOULD BE SMALLER', 'smaller'));
          out.push(btn('tbNnBadNote', '💡 Drama!', 'Suggest: THE HERO\'S ENTRANCE NEEDS MORE DRAMA', 'drama'));
          out.push(btn('tbNnBadNote', '💡 Ad break!', 'Suggest: THE FIGHT NEEDS MORE AD BREAKS', 'adbreak'));
        }
        if (nn.nnPending) out.push(btn('tbNnReadMemo', '📝 Read memo', 'Read the memo for its exact terms'));
      }
      return out.join('');
    },

    // Wire data-sigw5 buttons (one insertion point in app.js).
    sigW5WireCombat(on, rerender) {
      document.querySelectorAll('[data-sigw5]').forEach(function (b) {
        b.onclick = function () {
          try {
            var fn = b.dataset.sigw5, arg = b.dataset.arg;
            if (arg) G[fn](arg); else G[fn]();
          } catch (e) {}
          rerender();
        };
      });
    },

    // Field-fight core loop (villager vs monster): the same hook path as
    // the tactical engine, simplified for the off-screen sim. Called once
    // per round from fieldFights.js's monster phase. Returns the adjusted
    // damage total for this member's hit. State lives on rec.sigW5.
    sigW5FieldMonster(mdef, rec, ctx) {
      ctx = ctx || {};
      const id = mdef && mdef.id;
      if (id !== 'cancellation' && id !== 'editor' && id !== 'rerun' && id !== 'spoiler' &&
          id !== 'timeslot' && id !== 'nielsen' && id !== 'finale' && id !== 'network_note') return ctx.total;
      const st = rec.sigW5 || (rec.sigW5 = {});
      const round = ctx.round || 1;
      if (st.roundSeen === round && st.roundSeenId === id) return ctx.total;
      st.roundSeen = round; st.roundSeenId = id;
      const rr = ctx.rr || Math.random;
      const lroll = ctx.lroll || ((r) => r[0] + Math.floor(rr() * (r[1] - r[0] + 1)));
      let total = (typeof ctx.total === 'number') ? ctx.total : 0;
      const vName = ctx.vName || 'Someone';
      if (id === 'cancellation') {
        // the stamp descends 3 rounds, then falls: the villager's tricks
        // get un-taught — their damage drops 30% for the rest of the fight.
        st.cxN = (st.cxN || 0) + 1;
        if (st.cxStrip) total = Math.round(total * 0.7);
        if (st.cxN % 4 === 0 && !st.cxStrip) {
          st.cxStrip = true;
          rec.log.push('R' + round + ': THE STAMP FALLS on ' + vName + ' — their best tricks: UNDER REVIEW. (Their hits -30% from here.)');
        } else if (!st.cxStrip) {
          rec.log.push('R' + round + ': the stamp descends over ' + vName + ' (' + (st.cxN % 4) + '/3). Red ink.');
        }
        return total;
      }
      if (id === 'editor') {
        // every 3rd round the scissors cut the villager's swing — it never
        // happened. Allies cut from the floor walk back in on their own.
        st.edN = (st.edN || 0) + 1;
        if (st.edN % 3 === 0) {
          rec.log.push('R' + round + ': CUT — ' + vName + '\'s swing hits the cutting-room floor. It never happened.');
          return 0;
        }
        if (st.edN % 3 === 2) rec.log.push('R' + round + ': the film strips show ' + vName + '\'s swing, next. (A round to do something about it.)');
        else rec.log.push('R' + round + ': the editor\'s scissors snip — measuring ' + vName + '.');
        return total;
      }
      if (id === 'rerun') {
        // every 5th round the take resets: the monster comes back fresh
        // (+10% per take — it remembers) with a brief exposed window.
        st.rrN = (st.rrN || 0) + 1;
        st.rrAdapt = st.rrAdapt || 0;
        if (st.rrN % 5 === 0) {
          st.rrAdapt++;
          st.rrExposed = true;
          rec.log.push('R' + round + ': CLAP — "TAKE ' + (12 + st.rrN / 5) + '." The fight rewinds; the Rerun comes back fresh (+' + (st.rrAdapt * 10) + '% — it remembers).');
          return total;
        }
        if (st.rrExposed) { st.rrExposed = false; rec.log.push('R' + round + ': between takes the set is visible — ' + vName + ' hits the rigging (x1.5).'); return Math.round(total * 1.5); }
        if (st.rrAdapt) total = Math.round(total * (1 + 0.1 * st.rrAdapt));
        if (st.rrN % 5 !== 4) rec.log.push('R' + round + ': the clapperboard holds — take ' + (12 + Math.floor(st.rrN / 5)) + ', ' + (5 - (st.rrN % 5)) + ' rounds to the rewind.');
        return total;
      }
      if (id === 'spoiler') {
        // announces every 4 rounds; fulfilled prophecies gain weight.
        // villagers can't ask binding questions — they bleed or they lie.
        st.spN = (st.spN || 0) + 1;
        st.spWeight = st.spWeight || 0;
        st.spDealt = (st.spDealt || 0) + Math.max(0, (rec.mDealt || 0) - (st.spDealtSeen || 0));
        st.spDealtSeen = rec.mDealt || 0;
        if (st.spN % 4 === 1) {
          st.spMark = st.spDealt;
          rec.log.push('R' + round + ': "IN THREE ROUNDS, ' + vName.toUpperCase() + ' WILL BLEED." The poster changes.');
          return total;
        }
        if (st.spN % 4 === 0) {
          // COUNTERWIRE (2026-10-16): fulfill the spoiler on YOUR terms — a
          // villager who fell prone deliberately (rec.trickProne, set the
          // round before) satisfies the prophecy cheaply. The voiceover
          // gains no weight. Costs the action; the flag is consumed here.
          if (rec.trickProne) {
            rec.trickProne = 0;
            rec.log.push('R' + round + ': the announced thing happened — cheaply, on ' + vName + '\u2019s terms. Prone, deliberate. The voiceover finds nothing to fatten on.');
          } else if ((st.spDealt || 0) - (st.spMark || 0) >= 0) {
            // the villager bled (any damage window counts off-screen) —
            // the announcement gains weight either way out here; the
            // villager's only answer is to end it fast.
            st.spWeight++;
            rec.log.push('R' + round + ': the announced thing happened — the voiceover grows LOUDER (weight ' + st.spWeight + ').');
          } else {
            rec.log.push('R' + round + ': the announced thing never happened — the voiceover chokes. (-15 to the Spoiler\'s nerve.)');
            total = Math.max(0, total - 15);
          }
        }
        if (st.spWeight) total = Math.round(total * (1 + 0.12 * st.spWeight));
        return total;
      }
      if (id === 'timeslot') {
        // venues rotate every 3 rounds off-screen too — the guide is honest.
        const mults = [0.75, 1.25, 1, 0.75, 1.25, 1];
        const names = ['THE GREEN ROOM', 'LIVE STUDIO', 'DAYTIME SLOT', 'BURNING BUILDING', 'MID-AIR', 'THE SUBURB'];
        st.tsN = (st.tsN || 0);
        const vi = Math.floor(st.tsN / 3) % mults.length;
        if (st.tsN % 3 === 0) {
          rec.log.push('R' + round + ': RESCHEDULED — ' + names[vi] + '. (The guide showed it coming.)');
        }
        st.tsN++;
        if (mults[vi] !== 1) total = Math.round(total * mults[vi]);
        return total;
      }
      if (id === 'nielsen') {
        // ratings drift with the villager's flashiness; the gaze scales.
        st.niR = (st.niR == null ? 40 : st.niR);
        const dealt = Math.max(0, (rec.mDealt || 0) - (st.niDealtSeen || 0));
        st.niDealtSeen = rec.mDealt || 0;
        st.niR = clampN(st.niR + (dealt >= 40 ? 8 : dealt > 0 ? -4 : -6), 0, 100);
        if (st.niR <= 0) {
          rec.log.push('R' + round + ': RATINGS 0 — the eye closes. SIGN-OFF. (No gaze while ' + vName + ' stays boring.)');
          st.niR = 20;
          return 0;
        }
        rec.log.push('R' + round + ': VIEWERS ' + st.niR + ' — the gaze scales with the crowd.');
        return Math.round(total * (0.5 + st.niR / 100));
      }
      if (id === 'finale') {
        // it grows every round; once past half HP (or round 4) the 3-round
        // countdown runs, then the title card falls. Villagers can't feed
        // it — they can only end it first.
        st.fiN = (st.fiN || 0) + 1;
        st.fiGrowth = (st.fiGrowth || 0) + 1;
        total = Math.round(total * (1 + 0.05 * st.fiGrowth));
        if (!st.fiDeclared && (st.fiN >= 4)) {
          st.fiDeclared = true; st.fiCount = 3;
          rec.log.push('R' + round + ': "THE FINALE. THREE ROUNDS." The title card rises. (No sacrifice out here — end it first.)');
          return total;
        }
        if (st.fiDeclared && st.fiCount > 0) {
          st.fiCount--;
          if (st.fiCount <= 0) {
            const card = lroll([150, 200]);
            rec.log.push('R' + round + ': THE TITLE CARD FALLS on ' + vName + ' (' + card + ', unavoidable).');
            return total + card;
          }
          rec.log.push('R' + round + ': "PREVIOUSLY ON..." (' + st.fiCount + ' rounds to the title card.)');
        } else {
          rec.log.push('R' + round + ': the finale grows — visibly. (Its hits land harder.)');
        }
        return total;
      }
      // network_note: the memo alternates nerfs and buffs, announced as it
      // writes — villagers can't read, so the notes land.
      st.nnN = (st.nnN || 0) + 1;
      if (st.nnN % 2 === 0) {
        // COUNTERWIRE (2026-10-16): give it BAD notes — a villager who
        // planted ‘the wolf should be SMALLER’ (rec.trickBadNote) makes
        // the memo 'fix' the enemy into uselessness. The buff never lands;
        // the flag is consumed here.
        if (rec.trickBadNote) {
          rec.trickBadNote = 0;
          rec.log.push('R' + round + ': NOTE: ‘THE WOLF SHOULD BE SMALLER’ — the memo ‘fixes’ it into uselessness. The lasers never arrive.');
          return total;
        }
        rec.log.push('R' + round + ': NOTE: "THE WOLF SHOULD HAVE LASERS NOW" — and then it does. (+25%.)');
        return Math.round(total * 1.25);
      }
      rec.log.push('R' + round + ': the memo underlines something about ' + vName + '. (It lands next round.)');
      return total;
    },
  });

  // ---------------- fight-start baselines ----------------
  // Chains over sigW3b's wrap (and any earlier wrap) — same pattern.
  var _sigW5startCombat = G.startCombat;
  if (typeof _sigW5startCombat === 'function') {
    G.startCombat = function () {
      var out = _sigW5startCombat.apply(this, arguments);
      try {
        var f = this.tbfight;
        if (f && !f.over) {
          var p = this.tbFighter('p');
          f.cxCancelled = [];
          f.cxSilence = 0;
          f.rrMessages = []; f.rrTakes = 0;
          f.rrRigging = false; f.rrLeft = false; f.rrMsgBig = false; f.rrBigArmed = false; f.rrExposed = 0;
          f.sigW5Struck = false; f.sigW5PDmg = 0;
          f.edFloor = null; f.edFloorItems = [];
          if (p) {
            f.rrBase = { php: p.hp, pmaxhp: p.maxHp, px: p.mx, py: p.my, mons: {} };
            f.niSnap = { mhp: {}, php: p.hp, px: p.mx, py: p.my };
            for (var i = 0; i < f.fighters.length; i++) {
              var x = f.fighters[i];
              if (x.kind === 'monster') {
                f.rrBase.mons[x.key] = { hp: x.hp, maxHp: x.maxHp, mx: x.mx, my: x.my };
                f.niSnap.mhp[x.key] = x.hp;
              }
            }
            f.tsSnap = { px: p.mx, py: p.my };
          }
        }
      } catch (e) {}
      return out;
    };
  }

  // ---------------- fight-end restoration ----------------
  // Cancelled abilities come back when the review ends; cut allies walk
  // back in if the fight ended while they were on the floor.
  var _sigW5tbEndCheck = G.tbEndCheck;
  if (typeof _sigW5tbEndCheck === 'function') {
    G.tbEndCheck = function () {
      var f = this.tbfight;
      var out = _sigW5tbEndCheck.apply(this, arguments);
      try {
        if (out === true && f) {
          var s = this.state.scholar;
          if (f.cxCancelled && f.cxCancelled.length && s) {
            var names = [];
            for (var i = 0; i < f.cxCancelled.length; i++) {
              var e = f.cxCancelled[i], id = abId(e);
              names.push(abName(e));
              var has = (s.abilities || []).some(function (a) { return abId(a) === id; });
              if (!has) (s.abilities = s.abilities || []).push(e);
            }
            f.cxCancelled = [];
            try { this.say('📋 The review ends — cancelled abilities restored: ' + names.join(', ') + '. (Under review no longer.)'); } catch (e2) {}
          }
          var p = null;
          try { p = this.tbFighter('p'); } catch (e3) {}
          for (var j = 0; j < (f.fighters || []).length; j++) {
            var x = f.fighters[j];
            if (x && x.edCut) {
              x.edCut = false; x.fled = false; x.edCutRounds = 0;
              if (p) { x.mx = clampN(p.mx + 1, 1, 7); x.my = clampN(p.my, 1, 7); }
              try { this.say('🎬 ' + (x.name || 'Your ally') + ' walks back in from the cutting-room floor as the lights come up.'); } catch (e4) {}
            }
            if (x) { x.tsNative = null; x.nnVuln = 0; x.nnTired = 0; x.nnDrama = 0; x.nnBuffed = 0; x.nnShrunk = 0; }
          }
          f.tsVenue = null; f.tsDmgMult = 1;
        }
      } catch (e) {}
      return out;
    };
  }
})(typeof window !== 'undefined' ? window : global);
