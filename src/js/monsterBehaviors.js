// @ontology
// system: monsterBehaviors
// description: Data-driven monster behavior dispatch. Replaces per-species if/else branches in tbMonsterTurn with a behavior table (monsterBehaviors.json) + registered hook functions. Migrated species run verbatim-extracted logic from the registry; unmigrated species keep inline branches until proven.
// provides:
//   - monsterBehavior(id)
//   - mbRunPreTurn(m)
// rules:
//   - identical: migrated hooks are VERBATIM extractions from tbMonsterTurn — relocation, not redesign. Behavior must be bit-identical. (code: mbRunPreTurn)
//   - dispatch: monsterBehaviors.json declares preTurnHooks per monster id; the interpreter runs them in order. A hook returning true consumes the turn. (code: mbRunPreTurn)
//   - dead: hornIs/swarmIs referenced deleted monster ids (hype_horn/camera_swarm) — those branches were dead code. Removed 2026-10-08 by the break-it monsters run (with smIs/cgIs + the service_mimic/contract_golem/camera_swarm/hype_horn bespoke AI blocks). (code: mbRunPreTurn)
//   - incremental: migrate species one at a time with differential tests. Do not bulk-migrate. (code: monsterBehavior)
// consumes:
//   - tbAntlerThrash, tbHumSwarmCheck, tbEndCheck, tbRefreshTelegraphUI, encUsesFifo, encScanThreats, encSetPhase, encPhaseFor, encConfig, encThreatQueue, tbFighter, say, saySituationOnce, audioEvent
/* MONSTER BEHAVIORS — src/js/monsterBehaviors.js
 *
 * Steve (2026-10-07, scaffold audit): tbMonsterTurn was 2,228 lines of
 * per-species if/else. This module + monsterBehaviors.json replaces the
 * dispatch with data. Each monster's behavior table declares ordered
 * preTurnHooks; the interpreter runs them. Hooks are verbatim extractions —
 * the same code, relocated. Behavior is IDENTICAL by construction.
 *
 * Migration pattern (for future workers):
 * 1. Add the species' hook names to its monsterBehaviors.json entry
 * 2. Extract the branch VERBATIM into a registered hook below
 * 3. Remove the inline branch from tbMonsterTurn
 * 4. Add differential test scenarios to test-monster-behaviors-20261007.js
 */
(function (_g) {
  'use strict';
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;

  // Named pre-turn hooks. Each takes (game, monster) and returns true if
  // the hook consumed the monster's turn (tbMonsterTurn should return).
  var hooks = {
    // HIGHBEAM (Steve 2026-10-05): closing in is risky EVERY turn, not just
    // while the beam fires. The antlers thrash anyone adjacent IN ADDITION
    // to whatever the deer is doing — you take damage standing next to it
    // AND the beam keeps coming. You get in, you hit, you get OUT.
    // Verbatim from tbMonsterTurn (gallowdeer branch).
    antlerThrash: function (game, m) {
      if (m.beamPhase !== 'firing') {
        game.tbAntlerThrash(m);
        if (game.tbEndCheck()) return true;
      }
      return false;
    },

    // BUNKER (speedbump): sealed in its shell. It doesn't act — it waits
    // you out. Nearly invulnerable; the answer is patience, not force.
    // Verbatim from tbMonsterTurn (speedbump_turtle branch).
    turtleBunker: function (game, m) {
      if ((m.turtleBunker || 0) > 0) {
        var useFifo = game.encUsesFifo(m);
        m.turtleBunker -= 1;
        if (m.turtleBunker <= 0) {
          m.bunkerNoted = false;
          if (useFifo) game.encSetPhase(m, game.encPhaseFor(m, 'idle'));
          game.say('The shell unseals with a soft pop. The bad attitude is back.');
        } else {
          game.say('The boulder sits. Sealed. Waiting you out.');
        }
        game.tbRefreshTelegraphUI();
        if (game.tbEndCheck()) return true;
        return true;
      }
      return false;
    },

    // BEAM-FATIGUE HUNT (longsim r18 arm B, 2026-10-13): 3 consecutive
    // STERILE Ocular Discharges (judged per completed beam in game.js
    // tbBeamEndFiring: no blood drawn, target never closed, target never
    // changed — m.beamHuntArmed) and the deer stops burning light and
    // HUNTS. The hunt is a MODE, not a turn: every deer turn advances
    // at full speed toward the FIFO target and declares nothing, until it
    // reaches antler range (d<=1 at turn start — the mode ends, normal AI
    // resumes, Antler Sweep is the only legal move there) or the trail
    // goes cold (10 hunt turns with no contact — walls, weird geometry —
    // then the beam resumes and the streak restarts from zero). A single
    // advancing turn can't force anything: the deer ends at d1 and the
    // dodger restores distance on the next turn. The mode is the forcing
    // function — the deer is faster (speed 4 vs the scholar's 3), so a
    // hunted dodger runs out of grid: the edge means flee (the fight ends)
    // or a corner (the antlers end it). Either way the calendar-eating
    // loop is impossible. Steve's standing rule: monsters were sent to
    // fight — varied tactics OK, purposeless disengagement is not. The
    // deer closes; it never leaves, never disengages. Hook order: antlerThrash
    // runs first in the JSON hook list, so a hunt turn that starts adjacent
    // still thrashes — closing in stays risky, exactly as designed
    // ("You get in, you hit, you get OUT"). Follows the antlerThrash
    // precedent (this file).
    beamFatigueHunt: function (game, m) {
      try {
        if (!game.beamFatigueOn || !game.beamFatigueOn()) return false;
        if (!game.deerIs || !game.deerIs(m)) return false;
        if (m.telegraph) return false;
        if ((m.beamCooldown || 0) > 0) return false;
        if ((m.gravityHeld || 0) > 0) return false;
        if (!m.beamHunting && !m.beamHuntArmed) return false;
        var tgt = null;
        try { tgt = (game.encUsesFifo(m) && game.encCurrentTarget(m)) || null; } catch (e) { tgt = null; }
        if (!tgt || !tgt.alive || tgt.fled) {
          try { tgt = game.tbFighter('p'); } catch (e) { tgt = null; }
        }
        if (!tgt || !tgt.alive || tgt.fled) { m.beamHunting = false; return false; }
        var dd0 = Math.max(Math.abs(tgt.mx - m.mx), Math.abs(tgt.my - m.my));
        if (!m.beamHunting) {
          // TRIGGER: 3 consecutive sterile beams (judged in tbBeamEndFiring)
          // earn a hunt. Disarm now — the hunt itself is the answer.
          m.beamHuntArmed = false;
          m.beamHunting = true;
          m.beamHuntTurns = 0;
          m.beamStreak = 0;
          m.beamHunts = (m.beamHunts || 0) + 1;
          try { game._beamFatigueHunts = (game._beamFatigueHunts || 0) + 1; } catch (e) {}
          try { if (game.encUsesFifo(m)) game.encSetPhase(m, game.encPhaseFor(m, 'stalk')); } catch (e) {}
          var who0 = tgt.kind === 'player' ? 'you' : (tgt.name || 'its mark');
          game.say(game.pickFresh([
            'The light dies in its eyes — embers, then nothing. It stops waiting for ' + who0 + ' to stand still. It lowers its head, antlers first, and COMES.',
            'It shakes its head hard, scattering the gathered light like sparks. Enough aiming. It comes at ' + who0 + ' on hoof and antler.',
          ], 'deerHunt'));
          try { game.audioEvent('deerSnort'); } catch (e) {}
        } else if (dd0 <= 1) {
          // CONTACT: antler range. The hunt is over; the melee begins.
          // Normal AI resumes next turn (Antler Sweep is the only legal
          // move at d<=1). This turn is consumed by the arrival.
          m.beamHunting = false;
          var who1 = tgt.kind === 'player' ? 'you' : (tgt.name || 'its mark');
          game.say('It is ON ' + who1 + ' — antlers first. No more aiming. No more waiting.');
          try { game.audioEvent('deerSnort'); } catch (e) {}
          game.tbRefreshTelegraphUI();
          if (game.tbEndCheck()) return true;
          return true;
        } else {
          m.beamHuntTurns = (m.beamHuntTurns || 0) + 1;
          if ((m.beamHuntTurns || 0) > 10) {
            // TRAIL GONE COLD: ten turns and no contact — walls, water,
            // something the hooves can't solve. The light gathers again;
            // the streak restarts from zero.
            m.beamHunting = false;
            game.say('It loses the trail — paws once, twice — and the light gathers behind its eyes again.');
            game.tbRefreshTelegraphUI();
            if (game.tbEndCheck()) return true;
            return true;
          }
        }
        // THE HUNT STEP: full speed at the target, no declare this turn.
        // The grid shows it; the trigger narration above named it.
        var blocked = function (x, y) { return !game.tbCanOccupy(m, x, y); };
        var danger = null;
        try { danger = game.tbDangerCells(m.key); } catch (e) { danger = null; }
        var steps = m.speed || 3;
        for (var i = 0; i < steps; i++) {
          var dd = Math.max(Math.abs(tgt.mx - m.mx), Math.abs(tgt.my - m.my));
          if (dd <= 1) break;
          var s = game.tbStepToward(m, tgt.mx, tgt.my, blocked, danger);
          if (!s) break;
          m.mx = s.x; m.my = s.y;
        }
        game.tbRefreshTelegraphUI();
        if (game.tbEndCheck()) return true;
        return true;
      } catch (e) { return false; }
    },

    // HUMMICE: the swarm checks itself every turn — deaths drop voices,
    // distance thins the hum.
    // Verbatim from tbMonsterTurn (hummice branch).
    humSwarmCheck: function (game, m) {
      game.tbHumSwarmCheck(m);
      return false;
    },

    // CROWD OVERLOAD (drone): it can't grade a crowd. More live targets
    // than crowdLimit on the queue and the evaluation stalls out.
    // Bring friends. (The deer is unaffected.)
    // Verbatim from tbMonsterTurn (review_drone branch).
    droneCrowdOverload: function (game, m) {
      if (!game.encUsesFifo(m)) return false;
      var limit = ((game.encConfig(m) || {}).crowdLimit) || 2;
      var live = game.encThreatQueue(m).filter(function (k) {
        var t = game.tbFighter(k); return t && t.alive && !t.fled;
      });
      // ADAPTATION: after 1 recalc the drone narrows scope and grades
      // anyway (see the drone's bespoke block). Crowds buy time, not immunity.
      if (live.length > limit && (m.drRecalcs || 0) < 1) {
        m.drRecalcs = (m.drRecalcs || 0) + 1;
        m.telegraph = null;
        game.encSetPhase(m, 'recalc');
        game.say('📊 "TOO MANY SUBJECTS. EVALUATION PAUSED. RECALIBRATING." The drone backs off, overwhelmed by the crowd.');
        game.audioEvent('droneRecalc');
        game.tbRefreshTelegraphUI();
        if (game.tbEndCheck()) return true;
        return true;
      }
      return false;
    },
  };

  var methods = {
    // Look up a monster's behavior table entry.
    monsterBehavior: function (id) {
      return (((this.data || {}).monsterBehaviors || {}).behaviors || {})[id] || null;
    },

    // Run data-driven pre-turn hooks for a monster. Returns true if a hook
    // consumed the turn (caller should return from tbMonsterTurn).
    mbRunPreTurn: function (m) {
      var id = m && m.mdef && m.mdef.id;
      if (!id) return false;
      var beh = this.monsterBehavior(id);
      if (!beh || !beh.preTurnHooks || !beh.preTurnHooks.length) return false;
      for (var i = 0; i < beh.preTurnHooks.length; i++) {
        var fn = hooks[beh.preTurnHooks[i]];
        if (typeof fn !== 'function') continue;
        if (fn(this, m)) return true;
      }
      return false;
    },
  };
  Object.assign(G, methods);

  // Exposed for tests and future migrations.
  _g.MonsterBehaviorHooks = hooks;
})(typeof window !== 'undefined' ? window : global);
