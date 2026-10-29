// @ontology
// system: field-fights
// description: Off-screen blow-by-blow fights for villager-vs-monster meetings. Real rounds, real stats, the monster's real attack data — never an outcome table. (Steve 2026-10-08: "It should be a fight. A hard one.")
// provides:
//   - fieldFight(vid, mdef, m, opts)
// rules:
//   - rounds: initiative by speed each round; the monster acts with its real attack data (name, damage range, pattern, pack, thrash); the villager strikes with the tactical formula roll([4+wb, 8+wb]), wb = round(wbonus/2). Villager initiative uses villagerSpeed (age, wounds, temperament — 2..4), not a flat 3. (code: fieldFight, 2026-10-13)
//   - volley: a ranged weapon + real ammo opens the fight at range before round 1 — shots = min(ammo, clamp(1+floor(range/monster speed),1,4)), each shot costs 1 ammo, hit chance 0.85-0.06xrange (+tracking), damage lroll([4+wbR,8+wbR]) on the lead; the volley can drive the pack off (mBreak) or drop the lead (vKill). Supersedes the 2026-10-09 "range is meaningless" rule. (code: fieldFight, blitz-combatstats 2026-10-13)
//   - field wounds carry (code: fieldFight): a Haven ally enters at their real village.health and a surviving ally's wounds settle through the fight's sealed record, so wounds carry into the next fight, including turn-based fights (tackle-wound2 2026-10-27; Muse call under standing intent, NOT a Steve ruling).
//   - morale: flee is driven by wounds + bravery + temperament, never a flat roll. (code: fieldFight)
//   - arena: opts.noFlee seals a contest arena — no mid-fight flight; hopeless/low-HP no longer auto-flee, the fight runs to vKill/vDie/mFlee, and the round cap becomes a judges' call for the less-bloodied. Wild fights keep the believable flight. (code: fieldFight, Gap 4 2026-10-10)
//   - pack: the lead IS the world-monster entity (members[0]) — wound it and the pack breaks, kill it and the pack dies/scatters with it; members never promote. (code: fieldFight)
//   - hard: an average villager vs a real monster usually gets hurt, driven off, or killed. (code: fieldFight)
//   - record: every fight returns rounds, wounds both ways, and outcome — feeds deeds, gossip, scars. (code: fieldFight)
//   - cheap: round cap 15, no grid, no UI. (code: fieldFight)
//   - alreadyDead: a world-monster entity with hp<=0 is a corpse, not a fight — early exit, no rewards. (code: fieldFight)
//   - awareness: the pre-fight evade check ("saw it, gave it room") decides contact, not outcome. (code: fieldFight)
//   - determinism: opts.rng supplies every random draw (the contest engine's seeded resolution stream) — without it, Math.random/combat.roll exactly as before; the live path is untouched. (code: fieldFight, break-it 2026-10-08)
//   - gear: the villager re-equips at fight entry (villagerGearUp, acquire=false — deterministic, no mid-fight crafting) and strikes with the tactical formula; equipped armor absorbs via diminishing returns (r = P/(P+20); absorb = min(hit-1, round(hit*r)) — at least 1 always lands) — mirroring the tactical engine, never full immunity. (code: fieldFight, 2026-10-09)
//   - aid_allies_from_start: allied aid parties already at the door (opts.allyFromStart) join from round 1 as real combatants — they came to fight, not to watch; foreign allies carry their own names via opts.foreignAllies. (code: fieldFight, comms 2026-10-10)
//   - smoke_draws_company: the signal fire's attention arrives as real pack members (opts.packBonus) — blow by blow, never a modifier. (code: fieldFight, comms 2026-10-10)
//   - foreign_ally_fall: a fallen foreign ally lands on the inter-village link via aidAllyDown (trust, gossip, debt forgiven in blood) — not on a villager record. (code: fieldFight, comms 2026-10-10)
//   - field_medicine: once per fight, when hurt (<60% of max), the villager binds the wound instead of striking — +20 HP, the strike is spent, narrated. The player's "Heal 20 HP, once per day part", honestly translated off-screen (a field fight is the unit of a day's violence). (code: fieldFight, structural-combat 2026-10-10)
// consumes:
//   - Scattering.combat.roll
//   - village health, agency xp, equipment, monsters data
/* FIELD FIGHTS — src/js/fieldFights.js
 *
 * Steve (2026-10-08): "Why are you treating monster encounters like rng?
 * It should be a fight. A hard one." Villager-vs-monster meetings are not
 * outcome tables — not flat, not stat-weighted. They are blow-by-blow
 * fights with real stats and the monster's real behaviors, resolved
 * off-screen in ticks.
 *
 * What "real" means here:
 * - The monster acts with its REAL attack data from monsters.json: name,
 *   damage range, pattern, speed, pack, wave. The Highbeam Deer's antler
 *   thrash (roll([10,16]), every turn, in addition to the beam) is ported
 *   verbatim from tbAntlerThrash — closing in has a price here too.
 * - The villager strikes with the TACTICAL formula, verbatim:
 *   roll([4+wb, 8+wb]), wb = round(wbonus/2) ("helpers, not heroes").
 * - Initiative is speed vs speed every round (monster mdef.speed vs the
 *   villager's villagerSpeed — age, wounds, temperament — 2..4, not the old
 *   flat 3).
 * - Fleeing is morale, not dice: wounds taken vs bravery XP and
 *   temperament. Monsters break too — wound the lead and the pack's
 *   coordination breaks (their documented weakness).
 *
 * Deliberate scope boundaries (documented, not oversights):
 * - No grid/telegraphs: off-screen fights have no squares to dodge on.
 *   Pattern type flavors the record text, not the math.
 * (2026-10-09: the old "no armor modeling" boundary is gone — villagers
 * wear armor now, and the fight respects it with the tactical engine's
 * own flat reduction.)
 * - Pack members beyond the lead are ephemeral: the world-monster entity
 *   persists the lead's wounds; the pack scatters or dies with it.
 *
 * Every fight returns a record: rounds, wounds both ways, outcome, and a
 * short log. Callers feed it to deeds, gossip, scars, corpses. No silent
 * outcomes.
 *
 * Self-attaching module. Load after villager-agency.js (uses agency xp).
 * Chain-safe: all Game methods are called via this.* at fight time.
 */
(function (_g) {
  'use strict';
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  var R = Math.random;
  var roll = function (range) {
    try {
      if (_g.Scattering && _g.Scattering.combat && _g.Scattering.combat.roll)
        return _g.Scattering.combat.roll(range);
    } catch (e) {}
    return range[0] + Math.floor(R() * (range[1] - range[0] + 1));
  };
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };

  var MAX_ROUNDS = 15;

  var methods = {
    // trickSummary(rec): compact trick-execution summary for the kill log.
    // Prefers rec.trickLog (every executed trick, in order); falls back to
    // the legacy per-type flags. Used by recordWaveKill call sites that hold
    // the fight rec — links a kill to the counterplay that produced it
    // (KILL ATTRIBUTION 2026-10-13).
    trickSummary: function (rec) {
      try {
        if (!rec) return null;
        if (rec.trickLog && rec.trickLog.length) return rec.trickLog.join(',');
        var t = [];
        if (rec.trickShouts) t.push('shoutx' + rec.trickShouts);
        if (rec.trickStill) t.push('still');
        if (rec.trickDance) t.push('dance');
        return t.length ? t.join(',') : null;
      } catch (e) { return null; }
    },
    // trickSummaryFor(f, mid): COUNTERWIRE (2026-10-16) — the TB-path
    // per-monster trick summary. checkMonsterCounter logs performances
    // per species (f.trickLogByMid); a trick performed on one species in a
    // multi-species fight must not attribute to another's kill.
    trickSummaryFor: function (f, mid) {
      try {
        if (!f || !mid) return null;
        var per = (f.trickLogByMid || {})[mid];
        return (per && per.length) ? per.join(',') : null;
      } catch (e) { return null; }
    },
    // villagerTrickAction(vid, mdef, fctx) -> {type, why} or null
    // COUNTER EXECUTION (2026-10-13): the village knows this beast's trick —
    // perform it. Same beats the player gets, same costs, same caps (parity,
    // Steve 2026-10-13 — no NPC advantage). fctx: {round, vHp, vHpMax, lead,
    // rec, vp, members}. Returns null when the kind needs a grid/telegraph/
    // segments the abstract model lacks — those are documented as
    // un-actuatable, never faked.
    // ACTUABLE: shout (belltoad, hummice), offer_food (lockpick_raccoon),
    // spool feed-waits, chorus dance, buffering stand-still; COUNTERWIRE
    // (2026-10-16): redactor quiet-starve, gavel confess, focus_group bore-out,
    // terms_of_service examine/loophole, callback farewell, ad_break look-away,
    // strike meet-demand, suburb leave, eulogy contradict, algorithm tank,
    // congregation argue, nielsen fight-boring, spoiler prone, network_note
    // bad-note; APEXHOOK (2026-10-16): eater poison, influencer focus_followers,
    // audit inefficient, reunion improvise (wait:reunion-novel), editor
    // continuity, cancellation offscript.
    // UN-ACTUABLE: move_windup/move_x2/sidestep/keep_distance (need grid),
    // strike_windup/strike_recovery/strike_first (need telegraph state),
    // strike_nonhead (needs segments), fresh_weapon (needs mid-fight swap),
    // wait vs heckler/moderator (shame/mute not in field model),
    // blindside/face_it/eyes (no shadow-side/facing/called-shots off-screen),
    // rerun/timeslot/finale/finale_crew/finale_opening (need journal/venue/
    // sacrifice — documented in evidence/2026-10-16/sim-counterwire.md).
    villagerTrickAction: function (vid, mdef, fctx) {
      try {
        var mid = mdef.id;
        var known12 = this.monsterCounterKnown ? this.monsterCounterKnown(mid) : false;
        var knownSig = !!((this.state.villagerTricks || {})[mid]);
        if (!known12 && !knownSig) return null;
        var rec = fctx.rec || {};
        var members = fctx.members || [];
        var msig = (members[0] || {});
        // ---- FIGHT-OPENING EXECUTION (2026-10-16, FIGHTOPEN=1; default OFF)
        // The execensus census measured the execution funnel's sharpest
        // break: 65% of post-learning wave-4/5 field fights end with
        // CONDITIONS-NEVER-MET. The trick gates assume multi-round fights
        // (congregation/argue needs round%3===0; editor/continuity and
        // cancellation/offscript need 2 strikes; reunion/novelty needs 2
        // strikes; audit/jank needs round%3===0) but hyper-lethal wave-4/5
        // field fights are one-round massacres. The villagers KNOW the
        // tricks — so a fighter who knows the trick OPENS with its first
        // action on round 1 instead of a doomed strike. Same action the
        // later-round gate would have returned (same why), same costs:
        // the opening IS the fighter's round-1 action — the fight loop's
        // trickAct branch means no strike that round (parity, Steve
        // 2026-10-13 — no NPC advantage; the player spends round 1 on the
        // same trick if they choose it). Wave>=4 is the fight-shape proxy:
        // wave-3 fights run 4-6 rounds, long enough for the multi-round
        // gates to fire on their own — no opener needed there.
        // Openers actuate (each mechanically real in the abstract model):
        // - congregation/argue: rec.trickArgue persists until the next
        //   round%3===1 beam check (sigW4FieldMonster consumes it there) —
        //   the beam never falls on round 1 (villager wins initiative) or
        //   round 4. "Bound by liturgy, it MUST engage the argument."
        // - reunion/novelty: round-1 non-strike pushes the mirror's wear
        //   (0.85^(n-2) from the 3rd strike) from round 3 to round 4. "Do
        //   something you have never done" FIRST.
        // - editor/continuity: actionKinds opens non-strike, so any
        //   editorCuts check fails ("the scissors can't cut cleanly").
        // - cancellation/offscript: variety from round 1 — the stamp on
        //   round 4 finds no script to cancel.
        // - audit/inefficient: rec.trickInefficient banks until audit day
        //   (round 3) — the clipboard finds nothing to tax.
        // Dishonest as openers, documented never faked: influencer (on
        // round 1 fol=0 — no follower exists to hunt), eater/poison
        // (material gate, not multi-round), spoiler/prone (spN%4===3 timing
        // tied to the prophecy schedule), nielsen (already opens boring),
        // bad_note (already fires round 1), shout/meet_demand (reactive,
        // not openings — parity), gavel/confess (needs an active trial),
        // eulogy/contradict (already every round), suburb/leave (already
        // round 1), ad_break/look_away and chorus_line/dance (schedule-
        // timed), herald/finale/rerun/timeslot/finale_crew/finale_opening
        // (the engine's documented un-actuatable gap).
        try {
          if ((typeof process !== 'undefined' && process.env && process.env.FIGHTOPEN === '1') &&
              fctx.round === 1 && knownSig && ((mdef.wave || 1) >= 4)) {
            if (mid === 'congregation') return { type: 'argue', why: 'congregation-heresy' };
            if (mid === 'reunion') return { type: 'wait', why: 'reunion-novel' };
            if (mid === 'editor') return { type: 'continuity', why: 'editor-continuity' };
            if (mid === 'cancellation') return { type: 'offscript', why: 'cancellation-offscript' };
            if (mid === 'audit') return { type: 'inefficient', why: 'audit-jank' };
          }
        } catch (e) {}
        // ---- waves 1-2: the counter field ----
        if (known12 && mdef.counter) {
          var kind = mdef.counter.kind;
          if (kind === 'shout') {
            var used = rec.trickShouts || 0;
            // PARITY: 2/fight cap, costs the strike — exactly tbPlayerShout.
            // A fighter's judgment: bellow when the sonic attack is hurting
            // you and you need breathing room. Not an opening — a reaction.
            // (Shouting twice then fleeing without striking is worse than
            // just fighting; the strike is the default.)
            if (used < 2 && fctx.vHp < fctx.vHpMax * 0.75) {
              return { type: 'shout', why: mdef.counter.trick };
            }
          }
          if (kind === 'offer_food') {
            // PARITY: costs 1 real food unit + the action, monster bolts —
            // exactly tbPlayerOfferFood. No food, no bribe.
            if (this.villagerHasFood && this.villagerHasFood(vid)) {
              return { type: 'offer_food', why: mdef.counter.trick };
            }
          }
          // strike_lead: already the field-fight default (targets lead).
        }
        // ---- wave-3 signatures: village-learned counterplay ----
        if (knownSig) {
          if (mid === 'spool' && fctx.round <= 3) {
            // Feed it nothing while it records — the replay is silence.
            // (sigW3bFieldMonster records rec.mDealt delta; 0 dealt = 0 back.)
            return { type: 'wait', why: 'spool-record' };
          }
          if (mid === 'chorus_line' && (fctx.round % 4 === 0)) {
            // Dance on the downbeat — the kick catches air. (Beat tracks the
            // round in the common case; a stunned round desyncs it — honest
            // mistimed dance, documented.)
            return { type: 'dance', why: 'chorus-downbeat' };
          }
          if (mid === 'buffering' && fctx.vHp < fctx.vHpMax * 0.6) {
            // Stand still — it aims where you'll be. Whiff.
            return { type: 'wait', why: 'buffering-still' };
          }
          // ---- COUNTERWIRE (2026-10-16): the unwired six ----
          if (mid === 'redactor' && (rec.redactorQuiet | 0) < 3) {
            // Go quiet — starve the redaction. Two quiet turns thin its
            // attacks; a third starves it out. (Striking feeds it: every
            // wound gets un-written, so the quiet IS the fight.)
            return { type: 'wait', why: 'redactor-quiet' };
          }
          if (mid === 'gavel' && msig.sigG && msig.sigG.trial && !rec.trickConfess) {
            // Confess first — out loud, where everyone can hear. The verdict
            // falls lighter; the confession stays on the record.
            // ONCE PER TRIAL (sim-gavelconfess-a 2026-10-25): the fired flag
            // rec.trickConfess is set by the confess branch and cleared only
            // when the verdict consumes it, so a trial stretched by a
            // stunned/skipped verdict round no longer confesses twice.
            // A new trial after a consumed verdict may confess again.
            return { type: 'confess', why: 'gavel-confess' };
          }
          if (mid === 'focus_group') {
            // Be deliberately boring — three rounds and the murmur loses
            // interest and LEAVES. (Striking is entertainment.)
            return { type: 'bore', why: 'focus-boring' };
          }
          if (mid === 'terms_of_service') {
            // READ IT — spend turns examining; the loophole clause dismisses
            // it outright. (Striking the scroll just adds to the bill.)
            return { type: 'examine', why: 'tos-read' };
          }
          if (mid === 'callback' && !rec.trickMourned) {
            // The funeral: speak to it AS the person, say the goodbye
            // properly, and it loses coherence — the face can't borrow a
            // swing from someone who's been mourned.
            return { type: 'farewell', why: 'callback-funeral' };
          }
          if (mid === 'ad_break' && (fctx.round % 4 === 0) && !rec.trickUnwatched) {
            // Look away when the break runs — the ad's power is that you
            // WATCH. Unwatched, the healing never lands.
            return { type: 'look_away', why: 'adbreak-unwatched' };
          }
          // ---- COUNTERWIRE (2026-10-16): wave-4 counterplay ----
          if (mid === 'strike' && !rec.trickStoodDown && fctx.vHp < fctx.vHpMax * 0.6 &&
              this.villagerHasFood && this.villagerHasFood(vid)) {
            // Meet ONE demand — do the work yourself, manually, at real cost
            // (1 food + the action). The picket stands down a round.
            // Reactive (hurting), not an opening — parity with shout.
            return { type: 'meet_demand', why: 'strike-demand' };
          }
          if (mid === 'suburb' && fctx.round === 1) {
            // You can't kill a suburb — LEAVE. Navigation is victory; the
            // fight is a timer. The correct move, round one.
            return { type: 'leave', why: 'suburb-leave' };
          }
          if (mid === 'eulogy') {
            // Contradict the narration with your actions: it says you run,
            // you advance. Three true contradictions and the story dismisses
            // you kindly.
            return { type: 'contradict', why: 'eulogy-contradict' };
          }
          if (mid === 'algorithm' && !(rec.algorithmTank > 0)) {
            // Lose on purpose — tank the prediction. Two rounds of
            // deliberately soft predictions, then strike while the model is
            // mushy. (The hook halves its damage while the tank holds.)
            return { type: 'wait', why: 'algorithm-tank' };
          }
          if (mid === 'congregation' && (fctx.round % 3 === 0)) {
            // Argue theology — it MUST engage, bound by liturgy. Argued the
            // round before the beam, the beam never falls.
            return { type: 'argue', why: 'congregation-heresy' };
          }
          // ---- COUNTERWIRE (2026-10-16): wave-5 counterplay ----
          if (mid === 'nielsen') {
            var _niR = 40;
            try { _niR = (rec.sigW5 && rec.sigW5.niR != null) ? rec.sigW5.niR : 40; } catch (e) {}
            // FIGHT BORING — the smallest, dullest actions starve it of
            // viewers. Boring until the eye closes (ratings <= 10), then
            // strike while it's shut. (The hook already rewards dealing
            // nothing with -6 ratings/round; this gate just chooses it.)
            if (_niR > 10) return { type: 'wait', why: 'nielsen-boring' };
          }
          if (mid === 'spoiler' && !rec.trickProne) {
            var _spN = 0;
            try { _spN = (rec.sigW5 && rec.sigW5.spN) || 0; } catch (e) {}
            // Fulfill the spoiler on YOUR terms: fall PRONE, deliberately,
            // the round before the announcement comes due (spN%4===3 — the
            // flag must be set before the monster phase evaluates it).
            if (_spN % 4 === 3) return { type: 'prone', why: 'spoiler-prone' };
          }
          if (mid === 'network_note' && !rec.badNotePlanted) {
            // Give it BAD notes — plant ‘the wolf should be SMALLER’ and the
            // memo 'fixes' the enemy into uselessness on the next buff note.
            return { type: 'bad_note', why: 'networknote-badnote' };
          }
          // ---- APEXHOOK (2026-10-16): the apex-killer subset. The 0815Z
          // counterwire arm left these knowledge-only ("no abstract-model
          // hook"); the apexpredators diagnostic named them the teeth
          // killing villages. Each gate is canon-faithful from the
          // species' weaknesses + signature mechanics.
          if (mid === 'eater' && this.villagerHasSpoiledFood && this.villagerHasSpoiledFood(vid)) {
            // Poison the meal — it can't tell good food from bad. Feed it
            // the spoiled meal and it vomits out of the fight. Fresh food
            // would just feed it (the gate refuses: no spoiled, no trick).
            return { type: 'poison', why: 'eater-poison' };
          }
          if (mid === 'influencer') {
            // Kill the followers first — each focus takes one fan-creature
            // out, shrinking the Ratio buff (consumed in sigW4FieldMonster).
            var _inFol = 0;
            try {
              var _st4i = rec.sigW4 || {};
              _inFol = Math.max(0, Math.min(4, Math.floor(fctx.round / 2)) - (_st4i.inFolKilled | 0));
            } catch (e) {}
            if (_inFol > 0) return { type: 'focus_followers', why: 'influencer-followers' };
          }
          if (mid === 'audit' && (fctx.round % 3 === 0)) {
            // Be inefficient ON PURPOSE — audit day. Deliberate jank: the
            // clipboard finds nothing to tax (consumed in sigW4FieldMonster).
            return { type: 'inefficient', why: 'audit-jank' };
          }
          if (mid === 'reunion') {
            // Do something you have never done — novelty breaks the mirror.
            // When the strikes are about to wear thin (2 thrown, last was a
            // strike), improvise instead of throwing the weakened third.
            var _rStrikes = rec.strikesThrown | 0;
            var _rAk = rec.actionKinds || [];
            var _rLast = _rAk.length ? _rAk[_rAk.length - 1] : 'strike';
            if (_rStrikes >= 2 && _rLast === 'strike') return { type: 'wait', why: 'reunion-novel' };
          }
          if (mid === 'editor' || mid === 'cancellation') {
            // Contradict yourself / go off-script — break the pattern. When
            // the last two actions were both strikes (a script forming),
            // do something unexpected instead.
            var _pAk = rec.actionKinds || [];
            if (_pAk.length >= 2 && _pAk[_pAk.length - 1] === 'strike' && _pAk[_pAk.length - 2] === 'strike') {
              return mid === 'editor'
                ? { type: 'continuity', why: 'editor-continuity' }
                : { type: 'offscript', why: 'cancellation-offscript' };
            }
          }
        }
        return null;
      } catch (e) { return null; }
    },
    // villagerHasFood(vid): honest food check for the offer_food trick —
    // mirrors tbPlayerOfferFood's kcalEach>0 test against the villager's
    // own items.
    villagerHasFood: function (vid) {
      try {
        var S = _g.S || ((_g.Scattering || {}).S) || {};
        var vp = ((this.data.villagers || []).find(function (x) { return x.id === vid; }) ||
                  (this.data.background_survivors || []).find(function (x) { return x.id === vid; })) || {};
        var items = vp.items || [];
        for (var i = 0; i < items.length; i++) {
          var ent = items[i], eid = null, u = 1;
          if (typeof ent === 'string') { eid = ent; }
          else if (ent) { eid = ent.itemId || ent.id; u = ent.units || 1;
            if ((ent.kcalEach || 0) > 0 && u > 0) return true; }
          if (eid) {
            for (var d = 0; d < (this.data.items || []).length; d++) {
              if (this.data.items[d].id === eid && (this.data.items[d].kcalEach || 0) > 0 && u > 0) return true;
            }
          }
        }
        return false;
      } catch (e) { return false; }
    },
    // villagerHasSpoiledFood(vid): honest spoiled-food check for the eater's
    // 'poison the meal' trick — mirrors villagerHasFood's kcalEach>0 test,
    // but the meal must be SPOILED (isSpoiled). The eater can't tell good
    // food from bad, but the poison has to be IN the meal — fresh food just
    // feeds it.
    villagerHasSpoiledFood: function (vid) {
      try {
        var vp = ((this.data.villagers || []).find(function (x) { return x.id === vid; }) ||
                  (this.data.background_survivors || []).find(function (x) { return x.id === vid; })) || {};
        var items = vp.items || [];
        for (var i = 0; i < items.length; i++) {
          var ent = items[i];
          if (!ent || typeof ent === 'string') continue;
          if ((ent.kcalEach || 0) > 0 && this.isSpoiled && this.isSpoiled(ent)) return true;
        }
        return false;
      } catch (e) { return false; }
    },
    // villagerSpendSpoiledFood(vid): consume 1 unit of spoiled food.
    // Returns the food name or null.
    villagerSpendSpoiledFood: function (vid) {
      try {
        var vp = null;
        var vl = this.data.villagers || [];
        for (var vi = 0; vi < vl.length; vi++) if (vl[vi].id === vid) vp = vl[vi];
        if (!vp) { var bs = this.data.background_survivors || []; for (var bi = 0; bi < bs.length; bi++) if (bs[bi].id === vid) vp = bs[bi]; }
        if (!vp || !vp.items) return null;
        for (var i = 0; i < vp.items.length; i++) {
          var ent = vp.items[i];
          if (!ent || typeof ent === 'string') continue;
          if ((ent.kcalEach || 0) > 0 && this.isSpoiled && this.isSpoiled(ent)) {
            var nm = ent.name || 'spoiled food';
            ent.units = (ent.units || 1) - 1;
            if (ent.units <= 0) vp.items.splice(i, 1);
            return nm;
          }
        }
        return null;
      } catch (e) { return null; }
    },
    // villagerSpendFood(vid): consume 1 unit of the first food found.
    // Returns the food name or null.
    villagerSpendFood: function (vid) {
      try {
        var vp = null;
        var vl = this.data.villagers || [];
        for (var vi = 0; vi < vl.length; vi++) if (vl[vi].id === vid) vp = vl[vi];
        if (!vp) { var bs = this.data.background_survivors || []; for (var bi = 0; bi < bs.length; bi++) if (bs[bi].id === vid) vp = bs[bi]; }
        if (!vp || !vp.items) return null;
        for (var i = 0; i < vp.items.length; i++) {
          var ent = vp.items[i], eid = null, u = 1, nm = 'food';
          if (typeof ent === 'string') { eid = ent; }
          else if (ent) {
            eid = ent.itemId || ent.id; u = ent.units || 1; nm = ent.name || nm;
            if ((ent.kcalEach || 0) > 0 && u > 0) {
              ent.units = u - 1;
              if (ent.units <= 0) vp.items.splice(i, 1);
              return nm;
            }
            continue;
          }
          if (eid) {
            for (var d = 0; d < (this.data.items || []).length; d++) {
              var def = this.data.items[d];
              if (def.id === eid && (def.kcalEach || 0) > 0 && u > 0) {
                if (typeof ent === 'string') vp.items.splice(i, 1);
                return def.name || nm;
              }
            }
          }
        }
        return null;
      } catch (e) { return null; }
    },
    // fieldFight(vid, mdef, m, opts) -> record
    //   vid: villager id. mdef: monster definition (monsters.json).
    //   m: world-monster entity or null (ephemeral meeting). Wounds persist
    //      onto m.hp when the monster lives.
    //   opts.awareness: run the pre-fight evade check ("saw it, gave it
    //      room"). Decides CONTACT, not outcome.
    // Returns: { outcome, rounds, vTaken, mDealt, vHpLeft, mHpLeft,
    //   packCount, log[] }
    //   outcome: 'evade' | 'vKill' | 'mFlee' | 'vFlee' | 'vDie'
    fieldFight: function (vid, mdef, m, opts) {
      opts = opts || {};
      mdef = mdef || {};
      // DETERMINISM (contest engine, break-it 2026-10-08): off-screen
      // contest resolution must be deterministic (same state -> same fate,
      // no hidden rolls, no save-scum). opts.rng supplies EVERY random draw
      // in the fight; without it the live path is untouched (module R /
      // combat.roll, i.e. Math.random, exactly as before).
      var RR = opts.rng || R;
      var lroll = opts.rng ? function (range) { return range[0] + Math.floor(RR() * (range[1] - range[0] + 1)); } : roll;
      var rec = {
        outcome: null, rounds: 0, vTaken: 0, mDealt: 0,
        vHpLeft: 0, mHpLeft: 0, packCount: 1, log: [],
        allyDealt: 0, calledHelp: false, allyVid: null, fleeHopeless: null, fleeHpFrac: null,
        everWinning: false, everHopeless: false, minHpFrac: 1,
        // PARTY SIZE (sim-partyfinish-a, 2026-10-28): the mustered party
        // (leader + opts.allies) for honest kill narration — a party kill
        // must never read as a solo kill (fieldFightSummary used to say
        // "alone" for every vKill, including 3-fighter sortie kills).
        partySize: Math.max(1, (opts.allies || 0) + 1),
      };
      // LEARN-VS-FIGHT JUDGMENT (Steve 2026-10-13): default is learn-first.
      // It's much less risky to learn about a monster (observe, track,
      // survive) than to go straight for the kill. The villager OVERRIDES
      // the cautious default and engages when:
      // - the trick is known (they know how to fight it), OR
      // - they're in a party (opts.allies — combined strength they assess), OR
      // - the first damage exchange shows good odds (checked in morale).
      // Situational judgment, never automatic. The non-lethal observation
      // path is HOW they learn; this is WHEN they choose learning over killing.
      try {
        var _trickKnown = this.villageKnowsTrick ? this.villageKnowsTrick(mdef.id) : false;
        var _partySize = opts.allies || 0;
        rec.intent = (_trickKnown || _partySize > 0) ? 'engage' : 'learn';
        rec.intentWhy = _trickKnown ? 'trick-known' : (_partySize > 0 ? 'party' : 'learn-first');
      } catch (e) { rec.intent = 'engage'; rec.intentWhy = 'fallback'; }
      // GEAR-UP (Steve 2026-10-09): re-equip only, never acquisition — a
      // fighter doesn't whittle a spear mid-fight. Deterministic (autoEquip
      // has no RNG), so seeded contest fights stay deterministic.
      try { if (this.villagerGearUp) this.villagerGearUp(vid, false); } catch (e) {}
      var atk = mdef.attack || {};
      var dmgRange = (atk.damage && atk.damage.length === 2) ? atk.damage : [6, 10];
      var atkName = atk.name || 'attack';
      var roundAtkName = atkName; // this round's actual move (multi-move)
      var mSpeed = mdef.speed || 3;
      var wave = mdef.wave || 1;
      // AID (comms 2026-10-10): the signal fire's smoke draws company — the
      // pack is really bigger, blow by blow, not a modifier.
      var packN = Math.max(1, (mdef.pack || 1) + (opts.packBonus || 0));

      // ---- villager stats (real) ----
      var vv = this.state.village || {};
      var vHpMax = 100;
      var vHp = (vv.health && vv.health[vid] !== undefined) ? vv.health[vid] : 100;
      var vHpStart = vHp;
      var vBeamTaken = 0; // landed light, after all defenses; not raw attack damage
      if (vHp > vHpMax) vHpMax = vHp;
      // VILLAGER COMBAT SPEED (blitz-combatstats 2026-10-13): the flat 3 was
      // a lie — villagers move at different paces. villagerSpeed derives
      // initiative from age, wounds, and temperament (2..4), on the same
      // scale as the monster speeds.
      var vSpeed = 3;
      try { if (this.villagerSpeed) vSpeed = this.villagerSpeed(vid) || 3; } catch (e) {}
      var bravery = 0, temper = 'steady', potential = false, wb = 0, varmor = 0;
      try { bravery = (((this.agencyOf(vid) || {}).xp || {})[vid] || {}).bravery || 0; } catch (e) {}
      // CONTESTS (Steve 2026-10-08): the crowd's roar steadies the arm —
      // watcher's cheer arrives as real bravery, not win-odds.
      try { if (opts.braveryBonus) bravery += opts.braveryBonus; } catch (e) {}
      try { temper = this.npcTemper(vid) || 'steady'; } catch (e) {}
      try { potential = !!((this.agencyState() || {}).potential || {})[vid]; } catch (e) {}
      try {
        var S = _g.S || ((_g.Scattering || {}).S) || {};
        var vp = ((this.data.villagers || []).find(function (x) { return x.id === vid; }) ||
                  (this.data.background_survivors || []).find(function (x) { return x.id === vid; })) || {};
        // RANGED COUNTS (2026-10-09, SUPERSEDED for the opening by the
        // 2026-10-13 volley): off-screen fights have no grid, so mid-melee
        // range was meaningless — a spear is a spear. Melee + ranged both
        // contribute, halved like the tactical engine's "helpers, not heroes"
        // rule (wb = round((melee+ranged)/2)). threatLevel sums the two
        // WITHOUT halving — that's a threat rating, not a damage formula.
        // The volley above is the bow's distinct identity; this fold-in only
        // governs the close-in rounds.
        if (S.equipment && S.equipment.weaponBonusOf)
          wb = Math.round(((S.equipment.weaponBonusOf(vp, this.data.items, 'melee') || 0) +
                           (S.equipment.weaponBonusOf(vp, this.data.items, 'ranged') || 0)) / 2);
        // ARMOR (Steve 2026-10-09): equipped armor absorbs, mirroring the
        // tactical engine's diminishing-returns curve (r = P/(P+20)).
        // Villagers wear armor now — the fight must respect it.
        if (S.equipment && S.equipment.armorOf)
          varmor = S.equipment.armorOf(vp, this.data.items) || 0;
      } catch (e) {}

      // VILLAGER ABILITIES (parity 2026-10-10, Worker A): the System grants
      // villagers abilities for real deeds (villagerGainXP) — but nothing
      // ever READ them (npcHasAbility was only consulted for phoenix_clause
      // burn eligibility). A granted ability that never fires is a lie. Each
      // held ability below translates its player-facing effect into the
      // off-screen fight's own terms. All draws go through lroll/RR so the
      // contest engine's seeded resolution path stays deterministic.
      var vAbs = [];
      try {
        if (typeof this.npcHasAbility === 'function')
          vAbs = (typeof this.npcOwnedIds === 'function') ? this.npcOwnedIds(vid)
            : (((this.state.village || {}).npcAbilities || {})[vid] || []).slice(); // unified tracks: skills count
      } catch (e) {}
      var vHasAb = function (id) { return vAbs.indexOf(id) >= 0; };
      // GOD-PATH VERBS (parity 2026-10-14): the subclass actives and
      // passives a villager holds, in this engine's terms (godpath.js
      // fieldBegin/fieldAct/...). null when they hold none.
      var GPf = (_g.Scattering || {}).Godpath || null, gpF = null;
      try { if (GPf && GPf.fieldBegin) gpF = GPf.fieldBegin(this, vid, vAbs); } catch (e) { console.warn('[godpath] fieldBegin', e); }
      if (gpF && gpF.armorAdd) varmor += gpF.armorAdd; // chitin_skin's armor.flat, held
      var gpC = function (extra) {
        var c = { round: rec.rounds, vHp: vHp, vHpMax: vHpMax, allyIn: allyIn, allyHp: allyHp, allyMax: allyMax, RR: RR, lroll: lroll, vName: vName, mName: mName, log: rec.log, members: members };
        for (var k in (extra || {})) c[k] = extra[k];
        return c;
      };
      // one-shot ability state, reset per fight
      var abAim = false, abAimed = false, abWarCried = false, abScreamed = false,
          abBraced = false, abDebtSettled = false, abStun = 0, abRoundTaken = 0,
          abLastRoundTaken = 0, abHaymakerRound = false, abMedicated = false,
          abDrewFire = false, abBodyguarded = false, abRallied = false;
      var abNight = false;
      try { abNight = this.isNight ? this.isNight() : false; } catch (e) {}

      // ---- monster stats (real) ----
      var hpDef = mdef.hp || [20, 20];
      var members = [];
      for (var pi = 0; pi < packN; pi++) {
        var php = (m && pi === 0 && m.hp !== undefined && m.hp !== null) ? m.hp : lroll(hpDef);
        var pmax = (m && pi === 0 && m.maxHp) ? m.maxHp : Math.max(php, hpDef[1] || hpDef[0]);
        members.push({ hp: php, maxHp: pmax, alive: php > 0 });
      }
      // Original body draw, before ambush/volley/any damage. Unknown saved
      // maxima cannot invent an unwounded encounter.
      var huntOpening = { actorMaxHp: vHpMax, allies: Math.max(0, opts.allies || 0),
        pack: vAbs.indexOf('pack_hunt') >= 0, lost: false, prey: { monster: mdef.id, hp: members[0].hp,
        full: m && m.hp != null ? Number.isFinite(m.maxHp) && m.hp === m.maxHp : true } };
      rec.packCount = packN;
      var mBreak = wave >= 2 ? 0.15 : 0.25; // nastier things hold longer

      var vAlive = vHp > 0;
      var mName = 'something';
      try { mName = this.monsterNoun ? this.monsterNoun(mdef.id) : (mdef.id || 'something'); } catch (e) {}
      // GAP-W4-NARR #424: monsterNoun returns the proper name bare
      // ("The Redactor") once the System has arrived, so blindly
      // prefixing "the " prints "the The Redactor". articlePhrase
      // composes the article correctly for both cases.
      var mPhrase = 'something';
      try { mPhrase = this.articlePhrase ? this.articlePhrase(mName) : ('the ' + mName); } catch (e) { mPhrase = 'the ' + mName; }
      var mPhraseCap = 'Something';
      try { mPhraseCap = this.articlePhrase ? this.articlePhrase(mName, true) : ('The ' + mName); } catch (e) { mPhraseCap = 'The ' + mName; }
      var vName = 'Someone';
      // NAME-AWARE (villager-depth 2026-10-12): displayName().split(' ')[0]
      // collapses an unknown villager's "A woman, maybe 30s" to bare "A" in
      // fight logs. firstRef never does — prefer it for non-player villagers.
      var _G = this;
      var refName = function (id) {
        try {
          if (_G.firstRef && id !== _G.villagerId) return _G.firstRef(id);
          return _G.displayName ? _G.displayName(id).split(' ')[0] : 'Someone';
        } catch (e) { return 'Someone'; }
      };
      try { vName = refName(vid); } catch (e) {}

      // ALREADY DEAD (break-it combat 2026-10-09): a world-monster entity
      // with hp<=0 is a corpse, not a fight. Reachable: a vFlee round can
      // coincide with the lead falling, so the world keeps a 0-hp monster.
      // Without this, the next encounter "killed" it again — full cheer,
      // +trust, and a hero deed for beating a body. No rewards for a corpse.
      if (m && m.hp !== undefined && m.hp !== null && m.hp <= 0) {
        rec.outcome = 'alreadyDead';
        rec.rounds = 0; rec.vTaken = 0; rec.mDealt = 0;
        rec.vHpLeft = vHp; rec.mHpLeft = 0;
        rec.log.push(vName + ' finds ' + mPhrase + ' already dead — nothing to fight.');
        return rec;
      }

      // ---- awareness: contact check, not outcome ----
      // REAL inputs, not a flat roll: the villager's tracking XP (paying
      // attention) vs the monster's stealth profile (behavior, speed,
      // notice range, size). A hushwolf (pack, fast, long notice range)
      // is nearly impossible to spot first — the silence is the weapon.
      // A bulldozer (territorial, big, loud) is often heard coming.
      if (opts.awareness) {
        var tracking = 0;
        try { tracking = (((this.agencyOf(vid) || {}).xp || {})[vid] || {}).tracking || 0; } catch (e) {}
        var mBehavior = mdef.behavior || 'territorial';
        var behaviorMod = { ambush: -0.15, pack: -0.10, swarm: -0.05, snake: -0.05,
          territorial: 0.05, curious: 0.05, drifter: 0.10 }[mBehavior];
        if (behaviorMod === undefined) behaviorMod = 0;
        var mNotice = (mdef.encounter && mdef.encounter.noticeRange) || 5;
        var mSize = mdef.size || 1;
        var evade = 0.35 + Math.min(0.30, tracking * 0.01) + behaviorMod
          - 0.02 * mSpeed - 0.03 * mNotice + 0.05 * mSize
          + (potential ? 0.05 : 0);
        // ABILITIES: game_sense reads the sign; tracker knows the patterns;
        // echo_location hears in the dark. Real attention, not luck.
        if (vHasAb('game_sense')) evade += 0.10;
        if (vHasAb('tracker')) evade += 0.05;
        if (vHasAb('echo_location') && abNight) evade += 0.10;
        // DETECTION, HELD (godpath-buff 2026-10-14): the monster.detect_chance
        // modifiers a villager holds (bird_whisperer, third_eye, beast_calm)
        // read here the way they read for the player: seen first, given room.
        if (gpF) { try { evade = GPf.fieldEvade(gpF, evade); } catch (e) { console.warn('[godpath] fieldEvade', e); } }
        evade = clamp(evade, 0.05, 0.90);
        if (RR() < evade) {
          rec.outcome = 'evade';
          rec.vHpLeft = vHp; rec.mHpLeft = members[0].hp;
          try { GPf?.finishFieldEscape(this, vid, huntOpening, rec, !!opts.noFlee); } catch (e) { console.warn('[godpath] field evasion', e); }
          rec.log.push(vName + ' saw ' + mPhrase + ' in time and gave it room.');
          return rec;
        }
        rec.log.push(vName + ' walks straight into ' + mPhrase + '. No avoiding it.');
        // ABILITY — AMBUSH (lay_wait): they were waiting too. Contact was
        // made, but the monster didn't see THEM first: one free opening
        // strike before round 1, the tactical formula, verbatim.
        if (vHasAb('ambush')) {
          var _od = lroll([4 + wb, 8 + wb]);
          members[0].hp -= _od; rec.mDealt += _od;
          if (members[0].hp <= 0) members[0].alive = false;
          rec.log.push(vName + ' was already waiting — ambush! Opening strike for ' + _od + '.');
        }
      }

      // RANGED OPENING VOLLEY (blitz-combatstats 2026-10-13): supersedes the
      // 2026-10-09 "RANGED COUNTS" rule ("off-screen fights have no grid, so
      // range is meaningless — a spear is a spear"). That made a bow a bigger
      // club: its whole contribution folded into melee damage. A bow is not
      // a bigger club — it's distance. The fight now OPENS at range:
      //
      // - Before round 1, the archer looses while the monster closes. Shots =
      //   min(arrows on hand, clamp(1 + floor(range / monster speed), 1, 4)):
      //   a fast monster closes before the second arrow is nocked (hushwolf
      //   speed 5 vs a range-5 bow: 2 shots); a slow one lets you rain
      //   (bulldozer speed 2 vs a range-5 bow: 3 shots). The cap keeps the
      //   volley an opening, not the fight.
      // - Each shot costs 1 real ammo from the villager's own items — the
      //   quiver empties, honestly. No arrows, no volley (narrated, never
      //   silent).
      // - Hit chance: 0.85 − 0.06×range (longer = riskier; range-5 bow ~55%),
      //   +min(0.15, tracking XP ×0.005) — attention pays. A miss is narrated
      //   and the arrow is still spent: wasted shots are the archer's risk.
      // - A hit lands the tactical formula on the RANGED half only:
      //   lroll([4+wbR, 8+wbR]), wbR = round(rangedBonus/2).
      // - Volley damage hits the LEAD — so a good volley can drive the pack
      //   off before contact (mBreak) or drop it outright (vKill). Softening
      //   at range is the bow's identity. The melee fold-in stays (2026-10-09
      //   rule kept) — the bow still helps up close, just not as a club.
      // - Determinism: every draw goes through lroll/RR (contest engine's
      //   seeded stream), so seeded contest fights stay deterministic.
      rec.volley = null;
      try {
        var _rw = (S.equipment && S.equipment.rangedWeaponOf)
          ? S.equipment.rangedWeaponOf(vp, this.data.items) : null;
        var _rwId = _rw ? (_rw.itemId || _rw.id) : null;
        var _rdef = null;
        if (_rwId) {
          for (var _di = 0; _di < (this.data.items || []).length; _di++) {
            if (this.data.items[_di].id === _rwId) { _rdef = this.data.items[_di]; break; }
          }
        }
        var _w = (_rdef && _rdef.weapon) || null;
        var _ammoId = _w ? _w.ammo : null;
        if (_w && _ammoId) {
          var _range = _w.range || 3;
          var _rBonus = (_w.bonus || 0);
          var _wbR = Math.round(_rBonus / 2);
          // count the villager's own ammo (entries carry {itemId, units})
          var _ammoIdx = [];
          var _ammoN = 0;
          var _vitems = vp.items || [];
          for (var _ai = 0; _ai < _vitems.length; _ai++) {
            var _ent = _vitems[_ai], _eid = null, _mat = null, _u = 1;
            if (typeof _ent === 'string') { _eid = _ent; }
            else if (_ent) { _eid = _ent.itemId || _ent.id; _mat = _ent.material; _u = _ent.units || 1; }
            if (_eid === _ammoId || _mat === _ammoId) { _ammoIdx.push(_ai); _ammoN += _u; }
          }
          var _maxShots = clamp(1 + Math.floor(_range / Math.max(1, mSpeed)), 1, 4);
          var _shots = Math.min(_ammoN, _maxShots);
          if (_shots < 1) {
            rec.log.push(vName + ' has ' + (_rdef.name || 'a bow') + ' but no arrows — the string stays drawn, useless.');
            rec.volley = { shots: 0, hits: 0, dmg: 0, ammoLeft: _ammoN };
          } else {
            var _hitP = clamp(0.85 - 0.06 * _range, 0.35, 0.85);
            var _tracking = 0;
            try { _tracking = (((this.agencyOf(vid) || {}).xp || {})[vid] || {}).tracking || 0; } catch (e) {}
            _hitP += Math.min(0.15, _tracking * 0.005);
            var _vh = 0, _vdmg = 0;
            rec.log.push(vName + ' sees ' + mPhrase + ' coming and nocks an arrow — the fight opens at range (' + _shots + ' shot' + (_shots === 1 ? '' : 's') + ').');
            for (var _s = 0; _s < _shots; _s++) {
              // spend one ammo, honestly — the quiver empties
              var _spent = false;
              for (var _ki = _ammoIdx.length - 1; _ki >= 0 && !_spent; _ki--) {
                var _ee = _vitems[_ammoIdx[_ki]];
                if (typeof _ee === 'string') { _vitems.splice(_ammoIdx[_ki], 1); _spent = true; }
                else if (_ee) {
                  _ee.units = Math.max(0, (_ee.units || 1) - 1);
                  if (_ee.units <= 0) _vitems.splice(_ammoIdx[_ki], 1);
                  _spent = true;
                }
              }
              _ammoN--;
              if (RR() < _hitP) {
                var _vd = lroll([4 + _wbR, 8 + _wbR]);
                members[0].hp -= _vd; rec.mDealt += _vd; _vh++; _vdmg += _vd;
                if (members[0].hp <= 0) members[0].alive = false;
                rec.log.push('  loosed — it takes ' + mPhrase + ' for ' + _vd + ' (' + Math.max(0, members[0].hp) + ' left).');
              } else {
                rec.log.push('  loosed wide — the arrow buries itself in the dirt. (spent)');
              }
              if (members[0].hp <= 0) break;
            }
            rec.volley = { shots: _shots, hits: _vh, dmg: _vdmg, ammoLeft: Math.max(0, _ammoN) };
            rec.log.push(vName + ' lowers the bow — ' + mPhrase + ' is on them now. (' + _vh + '/' + _shots + ' hit)');
          }
        }
      } catch (e) { /* no ranged kit, no volley — the fight starts as before */ }

      // THE VOLLEY CAN END THE FIGHT (Steve 2026-10-13, drive-off at range):
      // the volley hits the lead — if it drops below the pack's break line
      // the pack scatters before contact; if the lead dies, the pack dies
      // with it. A bow should feel like range, not like a club you hold.
      if (members[0].hp <= 0) {
        rec.outcome = 'vKill';
        for (var _vj = 0; _vj < members.length; _vj++) { members[_vj].hp = 0; members[_vj].alive = false; }
        rec.log.push('The lead never reached ' + vName + ' — it fell to the volley, and the pack\'s coordination shatters with it.');
      } else if ((members[0].hp / members[0].maxHp) < mBreak) {
        // CORNERED PARTY HOLD (sim-partyfinish-a, 2026-10-28): a beast
        // already below the break line when a mustered, armed party
        // corners it at the treeline (opts.cornered, set ONLY by
        // lingererSortie) does not get the free zero-round flight —
        // provided nobody has dealt damage yet this fight (rec.mDealt
        // === 0, so a volley drive-off still flees: the bow itself
        // dropped it below the line). The hold lasts exactly one
        // round: the in-round break check after round 1, vFlee, vDie,
        // and every signature path are untouched, and arena (noFlee)
        // fights never reach this branch's hold. Risk-weighted
        // finish (Steve 2026-10-27), not unconditional: the party
        // still has to survive round 1, and a beast the party cannot
        // kill in that round flees after it, as before. Wild chance
        // meetings (cornered unset) keep the free flee exactly.
        var _corneredHold = !!opts.cornered && (opts.allies || 0) >= 1 && wb > 0
          && rec.mDealt === 0 && !opts.noFlee;
        if (_corneredHold) {
          rec.corneredHold = true;
          rec.log.push(vName + ' and their party have ' + mPhrase + ' cornered at the treeline — broken, but it cannot simply slip away before a blow.');
        } else {
          rec.outcome = 'mFlee';
          rec.log.push(vName + ' drove ' + mPhrase + ' off with the bow — it broke before it ever closed.');
        }
      }

      // ---- rounds ----
      // RISK TOLERANCE (Steve 2026-10-09): flee is a SITUATIONAL decision, not
      // a flat HP line. "Maybe die today or definitely die tomorrow" — after
      // day 7 the System taught them the waves only get harder, so they hold
      // longer. Armed villagers trust their gear; allies nearby steady them.
      // Nobody's damage or stats change — hand to hand is supposed to be hard.
      // Death packs are just where gear logically ends up, never a goal.
      var vBreak = clamp(0.5 - Math.min(0.3, bravery * 0.015) - (temper === 'bold' ? 0.1 : 0) + (temper === 'cautious' ? 0.1 : 0), 0.15, 0.6);
      var holdBonus = 0;
      if (wb > 0) holdBonus += 0.08;                        // armed: trust the gear
      var allies = Math.max(0, opts.allies || 0);
      var allyVids = (opts.allyVids || []).slice(0, 2);
      holdBonus += Math.min(0.12, allies * 0.04);            // allies nearby steady them
      // PARTY-BOND (2026-10-12): bond with the people beside you steadies
      // further — earned, not given. Capped; the ward's village pool stacks.
      try {
        if (typeof this.bondCombatBonus === 'function' && vid && vid !== 'player') {
          var _bb = this.bondCombatBonus(vid, allyVids);
          if (_bb > 0.02) {
            var _an = 'your people';
            try {
              var _fa0 = (opts.foreignAllies || {})[allyVids[0]];
              _an = (_fa0 && _fa0.name) || (this.displayName ? this.displayName(allyVids[0]).split(' ')[0] : 'your people');
            } catch (e2) {}
            rec.log.push(vName + ' and ' + _an + ' have bled together — it steadies them.');
          }
          holdBonus += _bb;
        }
        if (typeof this.villageBondBonus === 'function') holdBonus += this.villageBondBonus();
      } catch (e) {}
      var day = 0;
      try { day = (this.state.scholar || {}).day || 0; } catch (e) {}
      if (day >= 7) holdBonus += 0.08;                       // post-System desperation
      if (gpF && gpF.holdBonus) holdBonus += gpF.holdBonus;  // RALLY AURA held (godpath.js)
      vBreak = clamp(vBreak - holdBonus, 0.05, 0.6);
      // PARTY-UP (Steve 2026-10-09): when the trajectory turns hopeless and
      // help is near, they shout instead of scattering. One ally answers per
      // fight — a second pair of hands, off-balance, exposed (no armor).
      var helpCalled = false, allyIn = false, allyHp = 0;
      var wardCarries = [];
      var allyMax = 70, allyVid = null, allyName = 'Someone';
      // FIELD-WOUND CARRYOVER (tackle-wound2, 2026-10-27): a field-fight ally
      // is a real villager body, not a fixed 70-health extra. A Haven ally
      // enters at their real village.health (default 100, the game's usual
      // default for a villager with no health entry) so the wounds they take
      // are wounds to that body — and at the fight's end the surviving
      // ally's wounds settle through the same once-only sealed record the
      // lead uses, so they carry into whatever fight comes next, including
      // turn-based fights (whose entry already reads village.health).
      // Foreign allies keep the old 70 body: their health lives in another
      // village, not in village.health, so there is nothing honest to carry.
      // This is a Muse call under standing intent (villagers follow the
      // same rules as the player), NOT a Steve ruling — Steve can overrule it.
      var allyEntryHp = 0;
      var allyBody = function (id) {
        try {
          if ((opts.foreignAllies || {})[id]) return { entry: 70, max: 70 };
          var hv = ((_G.state.village || {}).health || {})[id];
          if (hv === undefined || hv === null) return { entry: 100, max: 100 };
          var e = Number(hv);
          if (!Number.isFinite(e) || e <= 0) return { entry: 100, max: 100 };
          return { entry: e, max: Math.max(100, e) };
        } catch (e) { return { entry: 70, max: 70 }; }
      };
      // AID (comms 2026-10-10): allied parties already at the door join from
      // round 1 — they came to fight, not to watch. A new combatant, same as
      // the hopeless-branch ally below.
      if (opts.allyFromStart && allies > 0 && allyVids.length) {
        helpCalled = true; allyIn = true;
        allyVid = allyVids.shift(); allies--;
        var _ab0 = allyBody(allyVid); allyHp = _ab0.entry; allyMax = _ab0.max; allyEntryHp = _ab0.entry;
        try {
          var _fa0 = (opts.foreignAllies || {})[allyVid];
          allyName = (_fa0 && _fa0.name) || opts.allyName || refName(allyVid);
        } catch (e) {}
        rec.calledHelp = true;
        rec.allyVid = allyVid;
        rec.log.push(allyName + ' is already at the door — charges in with ' + vName + '!');
        try { if (this.bumpTrust) this.bumpTrust(allyVid, 1); } catch (e) {}
      }
      for (var round = 1; round <= MAX_ROUNDS && !rec.outcome; round++) {
        rec.rounds = round;
        abRoundTaken = 0;
        // ABILITY — HAYMAKER (throw_haymaker): every 3rd round the villager
        // winds up — the strike below lands double, but the windup leaves
        // them open (the monster's hits land +2 this round). The telegraph
        // is the price.
        abHaymakerRound = (round % 3 === 0) && vHasAb('haymaker');
        // ABILITY stuns (war_cry / scream_cheese): the monster hesitates —
        // its whole attack phase is skipped this round.
        var mStunnedThisRound = false;
        if (abStun > 0) {
          abStun--; mStunnedThisRound = true;
          rec.log.push('R' + round + ': ' + mPhrase + ' hesitates — ' + vName + ' bought a breath.');
        }
        // SIGNATURE MECHANICS, WAVE 3 BATCH C (sigW3c 2026-10-10): the same
        // hook path as the tactical engine (MonsterBehaviorHooks), translated
        // to the abstract round model. sigFx carries per-round effects the
        // branches below apply at their marked points.
        var sigFx = { mSkip: false, vMiss: false, mDmgBonus: 0 };
        try { if (this.sigW3cFieldRound) this.sigW3cFieldRound(mdef, vid, round, rec, sigFx, { RR: RR, lroll: lroll, vName: vName, mName: mName, members: members }); } catch (e) {}
        if (sigFx.mSkip) mStunnedThisRound = true;
        var mInit = mSpeed + RR() * 2, vInit = vSpeed + RR() * 2;
        var mFirst = mInit >= vInit;
        var acted = [mFirst ? 'm' : 'v', mFirst ? 'v' : 'm'];
        for (var ai = 0; ai < 2; ai++) {
          if (acted[ai] === 'm' && !mStunnedThisRound) {
            // every live pack member acts — pack hunters hunt as a pack
            for (var mi = 0; mi < members.length; mi++) {
              // the lead fell earlier this round: the pack's coordination is
              // gone — the rest scatter, they don't keep swinging (2026-10-14)
              if (members[mi].hp <= 0 || !vAlive || vHp <= 0 || members[0].hp <= 0) continue;
              // SIGNATURE MECHANICS (sigW3a.js, wave 3 batch A 2026-10-10):
              // the monster's real signature runs off-screen too — villagers
              // face the same fight. Consumes the member's action when it
              // returns true (its narration lands in rec.log).
              var _sigCtx = { vHp: vHp, wb: wb };
              var _sigDone = false;
              try { if (this.sigFieldMonster) _sigDone = !!this.sigFieldMonster(mdef, members[mi], _sigCtx, { vid: vid, vName: vName, mName: mName, round: round, RR: RR, lroll: lroll }, rec); } catch (e) {}
              vHp = _sigCtx.vHp; wb = _sigCtx.wb;
              if (vHp <= 0) vAlive = false;
              if (_sigDone) continue;
              // MULTI-MOVE (2026-10-12): the monster's real kit, not just the
              // legacy slot — villagers face the same varied fight. Range
              // conditions are abstracted off-screen; hp-gates are honored.
              var rDmgRange = dmgRange, rAtkName = atkName, rAttack = mdef.attack || {};
              try {
                var _kit = (mdef.attacks && mdef.attacks.length ? mdef.attacks : []).filter(function(a){ return a && a.name && a.damage; });
                if (_kit.length > 1) {
                  var _mHpFrac = 1;
                  try { _mHpFrac = members[mi].hp / members[mi].maxHp; } catch (e0) {}
                  var _legal = _kit.filter(function(a){
                    var c = a.condition || {};
                    if (c.hpBelow != null && !(_mHpFrac < c.hpBelow)) return false;
                    if (c.hpAbove != null && !(_mHpFrac > c.hpAbove)) return false;
                    return true;
                  });
                  var _pool = _legal.length ? _legal : _kit.slice(0, 1), _tot = 0, _k;
                  for (_k = 0; _k < _pool.length; _k++) _tot += (_pool[_k].weight || 1);
                  var _r = RR() * _tot, _c = _pool[0];
                  for (_k = 0; _k < _pool.length; _k++) { _r -= (_pool[_k].weight || 1); if (_r <= 0) { _c = _pool[_k]; break; } }
                  rAtkName = _c.name; rAttack = _c;
                  rDmgRange = (_c.damage && _c.damage.length === 2) ? _c.damage : dmgRange;
                }
              } catch (e) {}
              roundAtkName = rAtkName;
              var d = lroll(rDmgRange);
              // HIGHBEAM (verbatim behavior): the antlers thrash anyone
              // adjacent IN ADDITION to the beam. Closing in has a price.
              var thrash = 0;
              if (mdef.id === 'gallowdeer') thrash = lroll([10, 16]);
              // Keep the selected attack's light separate from physical antlers.
              // Only landed bearer damage enters the Army pain pool.
              var beamShare = /beam|sweep/i.test(String((rAttack.pattern || {}).type || '')) || /beam|\bray\b|laser|glare|searchlight/i.test(rAtkName)
                ? (thrash > 0 ? d / Math.max(1, d + thrash) : 1) : 0;
              var total = d + thrash;
              // SIG W3C (2026-10-10): signature bonus damage (callback borrowed
              // swing, buffering predicted strike) — blow by blow, not a table.
              if (sigFx.mDmgBonus) total += sigFx.mDmgBonus;
              // ABILITY — HAYMAKER windup: the big swing leaves them open.
              if (abHaymakerRound) total += 2;
              // SIGNATURE MECHANICS (sigW3b, Steve 2026-10-10): wave-3 batch-B
              // signature layer (spool/chorus_line/terms_of_service) in
              // villager field fights — the same hook path as the tactical
              // engine. The module owns all state on rec.sigW3b.
              try {
                if (typeof this.sigW3bFieldMonster === 'function') {
                  var _sig = this.sigW3bFieldMonster(mdef, rec, {
                    total: total, round: round, rr: RR, lroll: lroll,
                    vName: vName, mName: mName
                  });
                  if (typeof _sig === 'number') total = _sig;
                }
              } catch (e) {}
              // SIGNATURE MECHANICS (sigW4, Steve 2026-10-11): wave-4
              // "The Mirror Draft" signature layer (congregation/strike/
              // influencer/audit/reunion/suburb/eulogy/algorithm/eater) in
              // villager field fights. The module owns all state on rec.sigW4.
              try {
                if (typeof this.sigW4FieldMonster === 'function') {
                  var _sig4 = this.sigW4FieldMonster(mdef, rec, {
                    total: total, round: round, rr: RR, lroll: lroll,
                    vName: vName, mName: mName
                  });
                  if (typeof _sig4 === 'number') total = _sig4;
                }
              } catch (e) {}
              // SIGNATURE MECHANICS (sigW5, Steve 2026-10-11): wave-5
              // "The Producers" signature layer (cancellation/editor/rerun/
              // spoiler/timeslot/nielsen/finale/network_note) in villager
              // field fights. The module owns all state on rec.sigW5.
              try {
                if (typeof this.sigW5FieldMonster === 'function') {
                  var _sig5 = this.sigW5FieldMonster(mdef, rec, {
                    total: total, round: round, rr: RR, lroll: lroll,
                    vName: vName, mName: mName
                  });
                  if (typeof _sig5 === 'number') total = _sig5;
                }
              } catch (e) {}
              // COUNTERWIRE (2026-10-16): the redactor starves. Two
              // consecutive quiet turns thin its attacks (halved) — the
              // third starves it out (handled in the wait resolution).
              // Defensive disruption, never a damage buff.
              try {
                if (mdef.id === 'redactor' && (rec.redactorQuiet | 0) >= 2 && total > 0) {
                  var _preR = total;
                  total = Math.floor(total / 2);
                  rec.log.push(vName + '\u2019s quiet starves the redaction — ' + mPhrase + '\u2019s attacks come thin. ' + _preR + ' \u2192 ' + total + '.');
                }
              } catch (e) {}
              // COUNTER EXECUTION (2026-10-13): the villager's trick disrupts.
              // PARITY — these are defensive disruptions, never damage buffs.
              // Shout: the bellow broke the sonic attack — halved.
              // Stand-still (buffering): it struck where they were going to
              // be — whiff, negated. Dance (chorus downbeat): the kick
              // catches air — negated (the port returns ONLY the kick on
              // downbeat rounds, so zeroing is exact, not approximate).
              try {
                if (rec.trickDisrupt && total > 0) {
                  var _preT = total;
                  total = Math.floor(total / 2);
                  rec.log.push(vName + "'s bellow broke the chorus — " + mPhrase + "'s note dies mid-croak. " + _preT + ' → ' + total + '.');
                }
                if (rec.trickStill && total > 0) {
                  var _preS = total;
                  total = 0;
                  rec.trickStill = 0;
                  rec.log.push(vName + ' stands perfectly still — ' + mPhrase + ' strikes where they were going to be. Whiff. (' + _preS + ' avoided)');
                }
                if (rec.trickDance && mdef.id === 'chorus_line' && total > 0) {
                  var _preD = total;
                  total = 0;
                  rec.log.push(vName + ' dances on the downbeat — the kick catches air. (' + _preD + ' avoided)');
                }
              } catch (e) {}
              // PARTY-UP: the pack splits its attention — the ally who rushed
              // in is exposed (no armor) and draws some of the hits.
              // TANK — DRAW FIRE (2026-10-12): the taunter makes themselves
              // the problem. The beast's eye stays on them: ally hit share
              // 40% -> 10%. Honest: it doesn't reduce damage, it moves it.
              var _allyShare = 0.4;
              var _wardAegis = !!(gpF && gpF.aegis > 0), _wardVia = null;
              if (gpF && allyIn && allyHp > 0) { try { _allyShare = GPf.fieldAllyShare(gpF, _allyShare); } catch (e) { console.warn('[godpath] ally share', e); } }
              if (vHasAb('draw_fire') && allyIn && allyHp > 0 && !abDrewFire) {
                abDrewFire = true;
                _allyShare = 0.1;
                rec.log.push(vName + ' draws its eye — "Me. I\'m the problem." The beast turns.');
              }
              var _allyRoll = allyIn && allyHp > 0 ? RR() : 1;
              var hittingAlly = allyIn && allyHp > 0 && _allyRoll < _allyShare;
              if (_wardAegis && _allyShare === 0 && _allyRoll < 0.4) _wardVia = 'aegis_link';
              // TANK — BODYGUARD (2026-10-12): once per fight, a blow falling
              // on the ally lands on the guard instead. "Not them."
              if (hittingAlly && vHasAb('bodyguard') && !abBodyguarded) {
                abBodyguarded = true;
                hittingAlly = false;
                _wardVia = 'bodyguard';
                rec.log.push(vName + ' steps into the blow meant for ' + allyName + '. Not them.');
              }
              if (!hittingAlly && gpF && total > 0) {
                var beamDamage = beamShare > 0 ? Math.min(d, total) : 0;
                try { total = GPf.fieldIncoming(gpF, total, gpC({ round: round, attack: rAttack, beamDamage: beamDamage })); } catch (e) { console.warn('[godpath] incoming', e); }
              }
              if (!hittingAlly && varmor > 0 && total > 0) {
                // ARMOR (Steve 2026-10-09): diminishing-returns curve,
                // mirroring the tactical engine — every point of protection
                // matters, full immunity unreachable, at least 1 lands.
                // Same pierce hook (mdef.pierce, 0 = none).
                var pierce = 0;
                try { pierce = (mdef && mdef.pierce) || 0; } catch (e) {}
                var effP = varmor * (1 - Math.min(0.9, Math.max(0, pierce)));
                var r = effP / (effP + 20);
                var absorbed = Math.min(total - 1, Math.round(total * r));
                total = total - absorbed;
                rec.log.push(vName + "'s gear absorbs " + absorbed + '.');
              }
              total = this.wornDamage(hittingAlly ? allyVid : vid, total, { rng: RR, log: rec.log, scene: 'field' });
              if (hittingAlly) {
                allyHp -= total;
                rec.log.push('R' + round + ': ' + rAtkName + ' hits ' + allyName + ' for ' + total + ' (' + Math.max(0, allyHp) + ' left)');
                if (allyHp <= 0 && gpF) {
                  try { var _gpHold = GPf.fieldAllyDown(gpF, gpC({ round: round })); if (_gpHold) allyHp = _gpHold; } catch (e) { console.warn('[godpath] ally down', e); }
                }
                if (allyHp <= 0) {
                  huntOpening.lost = true;
                  allyIn = false;
                  rec.log.push(allyName + ' goes down!');
                  // AID (comms 2026-10-10): a foreign ally's fall lands on the
                  // link — trust, gossip, debt forgiven in blood — not on a
                  // villager record.
                  try {
                    var _fad = (opts.foreignAllies || {})[allyVid];
                    if (_fad && this.aidAllyDown) this.aidAllyDown(_fad.villageId, _fad.face, allyName);
                    else if (allyVid && this.hurtVillager) this.hurtVillager(allyVid, 30, 'monster', this.sealDamageResult({}, [[allyVid, 30]]),
                      // HURTID (2026-10-22, #788): the 9th 'monster' site — thread the field-fight monster through damageContext like the game.js cluster.
                      { monsterId: (mdef && mdef.id) || null, monsterName: mName || null });
                  } catch (e) {}
                }
              } else {
                // ABILITY — UNBREAKABLE (brace): the player's brace is a 60%
                // reduction on the next hit, bought with a turn. Off-screen
                // there's no turn to spend — the villager braces once per
                // fight, reactively, the first hit after they've felt the
                // monster's strength (vHp < max): same 60% reduction, same
                // once-per-fight honesty.
                if (!abBraced && vHasAb('unbreakable') && total > 0 && vHp < vHpMax) {
                  abBraced = true;
                  var _pre = total;
                  total = Math.round(total * 0.4);
                  rec.log.push(vName + ' braces — takes it on the shoulder, rolling with it. ' + _pre + ' → ' + total + '. (Unbreakable)');
                }
                // TANK — SHIELD WALL (2026-10-12): shoulder to shoulder, the
                // line braces as one. While an ally stands with them, blows
                // land softer (-25%, min 1). The wall holds together or not
                // at all — no ally, no wall.
                if (vHasAb('shield_wall') && allyIn && allyHp > 0 && total > 0) {
                  var _pre2 = total;
                  total = Math.max(1, Math.round(total * 0.75));
                  if (total < _pre2) rec.log.push(vName + ' holds the line with ' + allyName + ' — ' + _pre2 + ' → ' + total + '. (Shield Wall)');
                }
                vHp -= total; rec.vTaken += total; abRoundTaken += total;
                vBeamTaken += Math.max(0, Math.min(total, Math.round(total * beamShare)));
                if (_wardVia && allyVid && total > 0 && mdef.id && !wardCarries.some(x => x.ally === allyVid))
                  wardCarries.push({ ally: allyVid, via: _wardVia, wound: total, day: day });
                rec.log.push('R' + round + ': ' + rAtkName + ' hits ' + vName + ' for ' + total + ' (' + Math.max(0, vHp) + ' left)');
              }
            }
            // PACK-WIDE CHORUS BREAK (2026-10-25, sim-belltoad-fix-a):
            // the shout disrupts the whole chorus — every pack member's
            // next attack is halved, matching the counter text ("the
            // note dies mid-croak", "scatter the choir"). Clear only
            // once the full monster phase has acted, not after the
            // first member's swing. A lone monster is unchanged: one
            // member, one halved attack, then clear.
            rec.trickDisrupt = 0;
          } else {
            // Ordinary damage can exhaust HP before the round-end flag
            // update. The dead cannot strike; existing death prevention
            // still resolves at the end of the round, as for signature hits.
            if (!vAlive || vHp <= 0) continue;
            var lead = null;
            for (var li = 0; li < members.length; li++) { if (members[li].hp > 0) { lead = members[li]; break; } }
            if (!lead) break;
            // COUNTER EXECUTION (2026-10-13): the village knows the trick —
            // perform it. Same costs as the player (the trick spends the
            // action: no strike that round), same caps. Parity, no advantage.
            var trickAct = null;
            try {
              trickAct = this.villagerTrickAction(vid, mdef, { round: round, vHp: vHp, vHpMax: vHpMax, lead: lead, rec: rec, vp: vp, members: members });
            } catch (e) { trickAct = null; }
            // GOD-PATH VERB (parity 2026-10-14): free verbs (Foresight, Coin
            // Guard, Stoke) ride along; a turn verb spends the action.
            var gpOut = null;
            if (!trickAct && gpF) {
              try {
                gpOut = GPf.fieldAct(gpF, gpC({ round: round, lead: lead, mStunned: mStunnedThisRound, taken: rec.vTaken, beamTaken: vBeamTaken }));
                if (gpOut.vHp != null) vHp = gpOut.vHp;
                if (gpOut.abStun) abStun += gpOut.abStun;
                if (gpOut.dealt) rec.mDealt += gpOut.dealt;
                if (gpOut.extraAlly && allyIn && allyHp > 0) {
                  for (var _xa = 0; _xa < gpOut.extraAlly && lead.hp > 0; _xa++) {
                    var _xad = lroll([3, 6]);
                    lead.hp -= _xad; rec.mDealt += _xad; rec.allyDealt += _xad;
                    if (lead.hp <= 0) lead.alive = false;
                    rec.log.push('R' + round + ': ' + allyName + ' strikes again for ' + _xad + ' (' + Math.max(0, lead.hp) + ' left)');
                  }
                }
              } catch (e) { console.warn('[godpath] fieldAct', e); gpOut = null; }
            }
            if (gpOut && gpOut.consumed) {
              // the verb was the action this round (narrated in fieldAct)
              // APEXHOOK (2026-10-16): track the verb for the editor/
              // cancellation pattern checks.
              try { (rec.actionKinds || (rec.actionKinds = [])).push('ability'); } catch (e) {}
            } else if (trickAct) {
              // APEXHOOK (2026-10-16): track the trick verb for the editor/
              // cancellation pattern checks (a trick is never 'strike').
              try { (rec.actionKinds || (rec.actionKinds = [])).push(trickAct.type); } catch (e) {}
              // KILL ATTRIBUTION (2026-10-13): per-run trick-execution tally.
              // Non-persisted (Game._trickTally), gated with _attrKills — never
              // touches RNG, logic, or save state.
              try {
                if (this._attrKills !== false) {
                  var _tt = this._trickTally || (this._trickTally = {});
                  var _tk = trickAct.type === 'wait' ? ('wait:' + (trickAct.why || 'x')) : trickAct.type;
                  _tt[_tk] = (_tt[_tk] || 0) + 1;
                }
              } catch (e) {}
              // Per-fight trick log on the rec (ungated, like the other rec
              // flags — it's the fight record, not telemetry). trickSummary
              // reads this to link kills to the counterplay involved.
              try { (rec.trickLog || (rec.trickLog = [])).push(trickAct.type === 'wait' ? ('wait:' + (trickAct.why || 'x')) : trickAct.type); } catch (e) {}
              if (trickAct.type === 'shout') {
                rec.trickShouts = (rec.trickShouts || 0) + 1;
                rec.trickDisrupt = 1; // the chorus's next attacks are halved — every pack member's note dies mid-croak, cleared after the full monster phase
                rec.log.push('R' + round + ': ' + vName + ' cups their hands and BELLOWS — raw noise, no words. (' + (trickAct.why || 'the trick') + ' — ' + rec.trickShouts + '/2)');
              } else if (trickAct.type === 'offer_food') {
                var _fname = (this.villagerSpendFood ? this.villagerSpendFood(vid) : null) || 'food';
                rec.log.push('R' + round + ': ' + vName + ' tosses ' + _fname + ' — it CANNOT resist. Drops everything mid-scamper, stuffs its cheeks, bolts.');
                rec.outcome = 'mFlee';
                break;
              } else if (trickAct.type === 'wait') {
                if (trickAct.why === 'spool-record') {
                  // The sigW3b port records rec.mDealt delta; 0 dealt = the
                  // replay is silence. Feeding it nothing IS the trick.
                  rec.log.push('R' + round + ': ' + vName + ' gives the spool nothing — waits, breathes, checks a strap. (Feeding it silence.)');
                } else if (trickAct.why === 'redactor-quiet') {
                  // REDACTOR: go quiet. Two quiet turns thin its attacks;
                  // a third starves it out (starve-out lands here, in the
                  // villager phase — the fight simply ends).
                  rec.redactorQuiet = (rec.redactorQuiet || 0) + 1;
                  rec.log.push('R' + round + ': ' + vName + ' goes quiet — no strikes, no shouts, nothing to redact. (' + rec.redactorQuiet + '/3)');
                  if (rec.redactorQuiet >= 3) {
                    rec.outcome = 'mFlee';
                    rec.log.push('R' + round + ': the Redactor starves — nothing left to redact. It folds out of the fight. (Starved out.)');
                  }
                } else if (trickAct.why === 'algorithm-tank') {
                  // ALGORITHM: lose on purpose. Two rounds of deliberately
                  // soft predictions (its damage halved in sigW4FieldMonster
                  // while the tank holds), then strike while the model is mushy.
                  rec.algorithmTank = 2;
                  rec.log.push('R' + round + ': ' + vName + ' stands there and takes it soft — deliberately. (Tanking the prediction.)');
                } else if (trickAct.why === 'nielsen-boring') {
                  // NIELSEN: FIGHT BORING. The smallest, dullest action —
                  // the hook already converts dealing nothing into -6
                  // ratings/round; the eye closes at 0.
                  rec.log.push('R' + round + ': ' + vName + ' does the smallest, dullest thing. Somewhere, a ratings graph sags. (Fighting boring.)');
                } else if (trickAct.why === 'reunion-novel') {
                  // REUNION (apexhook): do something you have never done.
                  // Novelty breaks the mirror — it has nothing to wear. The
                  // strike count resets; the worn-thin strikes are forgotten.
                  rec.strikesThrown = 0;
                  rec.log.push('R' + round + ': ' + vName + ' does something they have never done — stands on one foot and recites a poem mid-fight. The Reunion falters; it has nothing to wear. (Novelty.)');
                } else {
                  rec.trickStill = 1; // buffering: it aims where you'll be — whiff
                  rec.log.push('R' + round + ': ' + vName + ' stands perfectly still. Gives it nothing to predict.');
                }
              } else if (trickAct.type === 'dance') {
                rec.trickDance = 1; // the downbeat kick catches air
                rec.log.push('R' + round + ': ' + vName + ' dances on the downbeat.');
              } else if (trickAct.type === 'confess') {
                // GAVEL: confess first — out loud, where everyone can hear.
                // Costs the action; the verdict falls lighter (halved in
                // sigFieldGavel). Witnesses remember: the confession is on
                // the record (state counter, readable by sims/gossip).
                rec.trickConfess = 1;
                try { this.state.gavelConfessions = (this.state.gavelConfessions || 0) + 1; } catch (e) {}
                rec.log.push('R' + round + ': ' + vName + ' confesses first — out loud, where everyone can hear. The gavel pauses. (The confession is on the record.)');
              } else if (trickAct.type === 'bore') {
                // FOCUS GROUP: be deliberately boring. Three consecutive
                // boring rounds and the murmur loses interest and LEAVES.
                rec.focusBore = (rec.focusBore || 0) + 1;
                var _boreLines = ['recites bus schedules. The eye-heads droop.', 'counts ceiling tiles. A mouth-head yawns.', 'describes paint drying, in detail. The murmur thins.'];
                rec.log.push('R' + round + ': ' + vName + ' is deliberately boring — ' + _boreLines[Math.min(2, rec.focusBore - 1)] + ' (' + rec.focusBore + '/3)');
                if (rec.focusBore >= 3) {
                  rec.outcome = 'mFlee';
                  rec.log.push('R' + round + ': the murmur drifts off — nobody is watching. They LEAVE. (Bored out of the room.)');
                }
              } else if (trickAct.type === 'examine') {
                // TERMS OF SERVICE: READ IT. Two examining turns and the
                // loophole clause surfaces — the scroll dismisses itself.
                rec.tosRead = (rec.tosRead || 0) + 1;
                rec.log.push('R' + round + ': ' + vName + ' reads the fine print — squinting at the crawling clauses. (' + rec.tosRead + '/2)');
                if (rec.tosRead >= 2) {
                  rec.outcome = 'mFlee';
                  rec.log.push('R' + round + ': ' + vName + ' finds it — the loophole clause. \u2018...hereby DISMISSED.\u2019 The scroll folds itself away.');
                }
              } else if (trickAct.type === 'farewell') {
                // CALLBACK: the funeral. Speak to it AS the person, say the
                // goodbye properly — it loses coherence (face-shift bonus
                // disabled in sigW3cFieldRound for the rest of the fight).
                rec.trickMourned = 1;
                rec.log.push('R' + round + ': ' + vName + ' speaks to the face — as THEM, the way they laughed — and says the goodbye properly. The face loses coherence.');
              } else if (trickAct.type === 'look_away') {
                // AD BREAK: the ad's power is that you WATCH. Look away on
                // the break round — unwatched, the healing never lands
                // (consumed in sigW3cFieldRound).
                rec.trickUnwatched = 1;
                rec.log.push('R' + round + ': ' + vName + ' looks away. The break runs to dead air.');
              } else if (trickAct.type === 'meet_demand') {
                // STRIKE: meet ONE demand — do the grid's job yourself,
                // manually and costly. Costs 1 real food + the action; the
                // picket stands down a round (consumed in sigW4FieldMonster).
                var _mfood = (this.villagerSpendFood ? this.villagerSpendFood(vid) : null) || 'food';
                rec.trickStoodDown = 1;
                rec.log.push('R' + round + ': ' + vName + ' does the grid\u2019s job — manually, with ' + _mfood + '. The picket stands down a round. (Scabbing.)');
              } else if (trickAct.type === 'leave') {
                // SUBURB: you can't kill it — LEAVE. Navigation is victory;
                // the fight is a timer. vFlee = walked out alive (the
                // correct move, narrated).
                rec.outcome = 'vFlee';
                rec.fleeWise = true;
                rec.log.push('R' + round + ': ' + vName + ' reads the sterile streets — you can\u2019t kill a suburb. They walk out. (Navigation is victory.)');
              } else if (trickAct.type === 'contradict') {
                // EULOGY: contradict the narration with your actions — it
                // says you run, you advance. Each contradiction restores a
                // verse (consumed in sigW4FieldMonster); three true
                // contradictions and the story dismisses you kindly.
                rec.trickContradict = 1;
                var _conLines = ['it says ' + vName + ' runs — ' + vName + ' advances.', 'it says ' + vName + ' falters — ' + vName + ' stands straighter.', 'it says ' + vName + ' begs — ' + vName + ' laughs.'];
                var _conN = (rec.eulogyContradicts || 0);
                rec.log.push('R' + round + ': ' + vName + ' contradicts the narration — ' + _conLines[Math.min(2, _conN)]);
              } else if (trickAct.type === 'argue') {
                // CONGREGATION: heresy — argue theology; bound by liturgy,
                // it MUST engage the argument instead of the beam (consumed
                // in sigW4FieldMonster on the beam round).
                rec.trickArgue = 1;
                rec.log.push('R' + round + ': ' + vName + ' argues theology — transubstantiation, the liturgy of the lost. It MUST engage.');
              } else if (trickAct.type === 'prone') {
                // SPOILER: fulfill the prophecy on YOUR terms — fall prone,
                // deliberately. The announcement is satisfied cheaply; the
                // voiceover gains no weight (consumed in sigW5FieldMonster).
                rec.trickProne = 1;
                rec.log.push('R' + round + ': ' + vName + ' falls PRONE — deliberately, on their own terms. The prophecy is satisfied cheaply.');
              } else if (trickAct.type === 'bad_note') {
                // NETWORK NOTE: give it BAD notes — plant ‘the wolf should
                // be SMALLER’; the next buff note misfires into uselessness
                // (consumed in sigW5FieldMonster).
                rec.trickBadNote = 1; rec.badNotePlanted = 1;
                rec.log.push('R' + round + ': ' + vName + ' leans to the memo: \u2018the wolf should be SMALLER.\u2019 It writes it down.');
              } else if (trickAct.type === 'poison') {
                // EATER (apexhook): poison the meal. It can't tell good food
                // from bad — it gorges on the spoiled meal and VOMITS out of
                // the fight. Non-lethal by design (the trick is the meal,
                // not the kill).
                var _pfood = (this.villagerSpendSpoiledFood ? this.villagerSpendSpoiledFood(vid) : null) || 'spoiled meat';
                rec.outcome = 'mFlee';
                rec.log.push('R' + round + ': ' + vName + ' hurls ' + _pfood + ' — rancid, crawling. The Eater gorges, gags, and VOMITS out of the fight. (Poisoned meal.)');
                break;
              } else if (trickAct.type === 'focus_followers') {
                // INFLUENCER (apexhook): kill the followers first. The
                // villager spends the round hunting fan-creatures — each
                // focus takes one out, shrinking the Ratio buff (consumed
                // in sigW4FieldMonster via st.inFolKilled).
                var _st4f = rec.sigW4 || (rec.sigW4 = {});
                _st4f.inFolKilled = (_st4f.inFolKilled | 0) + 1;
                rec.log.push('R' + round + ': ' + vName + ' ignores the ring light and hunts the followers — a phone clatters, a fan-creature drops. (' + _st4f.inFolKilled + ' down.)');
              } else if (trickAct.type === 'inefficient') {
                // AUDIT (apexhook): be inefficient ON PURPOSE. Deliberate,
                // visible jank on audit day — the clipboard finds nothing to
                // tax. Clears any pending tax; the flag is consumed in
                // sigW4FieldMonster.
                rec.trickInefficient = 1;
                rec.auditTaxRounds = 0;
                rec.log.push('R' + round + ': ' + vName + ' is deliberately inefficient — fumbles the grip, dawdles, does everything the slow way. (Nothing to tax.)');
              } else if (trickAct.type === 'continuity') {
                // EDITOR (apexhook): contradict yourself — break the cut. Do
                // something utterly unexpected so the film doesn't match; the
                // scissors can't cut cleanly (consumed in the strike block
                // via rec.actionKinds).
                rec.log.push('R' + round + ': ' + vName + ' does something utterly unexpected — mid-fight, inexplicable. The film strips flutter, confused. (Continuity error.)');
              } else if (trickAct.type === 'offscript') {
                // CANCELLATION (apexhook): go off-script. Improvise — use the
                // round in a way never intended. There is no script to cancel
                // (consumed in sigW5FieldMonster via rec.actionKinds).
                rec.log.push('R' + round + ': ' + vName + ' goes off-script — improvises, wild and unplanned. There is nothing to cancel.');
              }
            } else if (!abMedicated && vHasAb('field_medicine') && vHp > 0 && vHp < vHpMax * 0.6) {
              abMedicated = true;
              var _mh = Math.min(20, vHpMax - vHp);
              vHp += _mh;
              rec.log.push('R' + round + ': ' + vName + ' stops mid-fight and binds the wound — field medicine, +' + _mh + ' HP.');
              try { (rec.actionKinds || (rec.actionKinds = [])).push('heal'); } catch (e) {}
            // ABILITY — PATIENT AIM (take_aim): the patient hunter's call.
            // Full health, fresh monster: spend this turn going still. The
            // next strike is 2.5x and cannot miss — the exposure is the
            // rounds already survived un-aimed.
            } else if (!abAimed && vHasAb('patient_aim') && !abAim && vHp >= vHpMax && lead.hp > lead.maxHp * 0.5) {
              abAimed = true; abAim = true;
              rec.log.push('R' + round + ': ' + vName + ' goes still. Breath slows. The world narrows to the target. (Take Aim — next shot 2.5x)');
              try { (rec.actionKinds || (rec.actionKinds = [])).push('aim'); } catch (e) {}
            } else {
              var vd = lroll([4 + wb, 8 + wb]); // tactical formula, verbatim
              var abNote = '';
              // SIG W3C (2026-10-10): buffering mirage — the strike lands on
              // the brightest frame (where it was), not the faintest (where it is).
              if (sigFx.vMiss && RR() < 0.5) { vd = 0; abNote += ' (bright frame — mirage miss)'; }
              if (abAim) { vd = Math.round(vd * 2.5); abAim = false; abNote += ' (aimed 2.5x)'; }
              // ABILITY — HAYMAKER: the windup is the telegraph; the landing
              // is the punctuation.
              if (abHaymakerRound) { vd = vd * 2; abNote += ' (HAYMAKER x2)'; }
              // ABILITY — STALK: the stalker's opening — first blood, +4.
              if (round === 1 && vHasAb('stalk')) { vd += 4; abNote += ' (stalker\'s opening +4)'; }
              // ABILITY — DEAD AIM: the executioner's shot — a wounded lead
              // gets the patient kill.
              if (lead.hp < lead.maxHp * 0.25 && vHasAb('dead_aim')) { vd = vd * 2; abNote += ' (dead aim x2)'; }
              // ABILITY — BLOOD TRAIL: the blood tells everything — follow
              // it in, +2 against a bleeding lead.
              else if (lead.hp < lead.maxHp * 0.5 && vHasAb('blood_trail')) { vd += 2; abNote += ' (blood trail +2)'; }
              // ABILITY — TRADE OF BLOWS (settle_debt): every hit taken is a
              // hit given back with interest. Once per fight.
              if (!abDebtSettled && vHasAb('trade_of_blows') && abLastRoundTaken > 20) {
                abDebtSettled = true; vd = Math.round(vd * 1.5); abNote += ' (debt settled 1.5x)';
              }
              // APEXHOOK (2026-10-16): the apex-trick villager-damage effects.
              // The sigW4/sigW5 ports arm flags on the rec; the effects land
              // HERE, on the villager's strike (their "best trick") — the
              // honest port of the TB mechanics. Defensive disruptions, never
              // damage buffs (parity).
              // EDITOR: the cut — the swing hits the cutting-room floor. But
              // a villager who did something contradictory (last action not a
              // strike) breaks continuity — the scissors can't cut cleanly.
              if (rec.editorCuts) {
                rec.editorCuts = 0;
                var _akE = rec.actionKinds || [];
                var _lastE = _akE.length ? _akE[_akE.length - 1] : 'strike';
                if (_lastE !== 'strike') {
                  rec.log.push('R' + round + ': CUT — but the film doesn\u2019t match. ' + vName + ' did something unexpected; the scissors can\u2019t cut cleanly. (Continuity error.)');
                } else {
                  vd = 0;
                  rec.log.push('R' + round + ': CUT — ' + vName + '\u2019s swing hits the cutting-room floor. It never happened.');
                }
              }
              // CANCELLATION: under review — the tricks are un-taught.
              if (rec.cancelStrip) { vd = Math.round(vd * 0.7); abNote += ' (under review — un-taught)'; }
              // AUDIT: the tax — best trick at half strength.
              if ((rec.auditTaxRounds | 0) > 0) { rec.auditTaxRounds--; vd = Math.round(vd / 2); abNote += ' (audited — half strength)'; }
              // REUNION: the mirror — repeated strikes wear thin (TB:
              // 0.85^(n-2) for the nth strike, n>=3). Novelty (the
              // wait:reunion-novel trick) resets the count.
              if (mdef.id === 'reunion' && (rec.strikesThrown | 0) >= 3) {
                vd = Math.max(1, Math.round(vd * Math.pow(0.85, (rec.strikesThrown | 0) - 2)));
                abNote += ' (mirrored — worn thin)';
              }
              // APEXHOOK: track the strike for the reunion mirror + the
              // editor/cancellation pattern checks.
              try { (rec.actionKinds || (rec.actionKinds = [])).push('strike'); } catch (e) {}
              rec.strikesThrown = (rec.strikesThrown | 0) + 1;
              if (gpF) { try { var _vd0 = vd; vd = GPf.fieldStrike(gpF, vd, gpC({ round: round, lead: lead, mStunned: mStunnedThisRound })); if (vd !== _vd0) abNote += ' (x' + (vd / Math.max(1, _vd0)).toFixed(1) + ')'; } catch (e) { console.warn('[godpath] fieldStrike', e); } }
              lead.hp -= vd; rec.mDealt += vd;
              if (lead.hp <= 0) lead.alive = false;
              rec.log.push('R' + round + ': ' + vName + ' strikes for ' + vd + abNote + ' (' + Math.max(0, lead.hp) + ' left)');
            }
            // the ally fights too — a second pair of hands, off-balance from
            // rushing in. A new combatant, not a buff to anyone's stats.
            if (allyIn && allyHp > 0 && lead.hp > 0) {
              var ad = lroll([3, 6]);
              lead.hp -= ad; rec.mDealt += ad; rec.allyDealt += ad;
              if (lead.hp <= 0) lead.alive = false;
              rec.log.push('R' + round + ': ' + allyName + ' strikes for ' + ad + ' (' + Math.max(0, lead.hp) + ' left)');
            }
          }
        }
        // ---- morale: situational, never a flat roll ----
        // KNOWLEDGE AGGREGATOR (2026-10-12): the village learns together — a
        // villager who lives through the round brings the monster's move home.
        if (vAlive && vHp > 0 && roundAtkName && roundAtkName !== 'attack') {
          try {
            var _vp = this.state.villagePatterns || (this.state.villagePatterns = {});
            var _ve = _vp[mdef.id] || (_vp[mdef.id] = {});
            _ve[roundAtkName] = true;
          } catch (e) {}
        }
        if (vHp <= 0 && gpF) {
          try {
            var _gpHp = GPf.fieldCheatDeath(gpF, gpC({ round: round }));
            if (_gpHp) {
              vHp = _gpHp; vAlive = true;
              if (gpF.shedGear) { wb = 0; varmor = gpF.armorAdd || 0; gpF.shedGear = false; }
            }
          } catch (e) { console.warn('[godpath] cheat death', e); }
        }
        if (vHp <= 0) { vAlive = false; rec.outcome = 'vDie'; break; }
        if (vHp / vHpMax < rec.minHpFrac) rec.minHpFrac = vHp / vHpMax;
        // COUNTER EXECUTION (2026-10-13): the dance is a per-round flag — a
        // mistimed dance (monster went first) must not leak into a later
        // downbeat. Clear after the round's phases all ran.
        rec.trickDance = 0;
        // THE LEAD FELL THIS ROUND (unified tracks 2026-10-14): decide it
        // before morale. Morale reads the first LIVE member, so a lead
        // dropped by the villager's blow (haymaker x2) could still read as
        // "hopeless" against the pack-mates and end in vFlee with the lead
        // at 0 HP (a zombie entity). Surfaced once villagers learned track
        // skills before the System's arrival.
        if (members[0].hp <= 0) {
          rec.outcome = 'vKill';
          for (var mz = 0; mz < members.length; mz++) { members[mz].hp = 0; members[mz].alive = false; }
          rec.log.push('The lead falls — the pack\'s coordination shatters. The rest scatter or die.');
          break;
        }
        // SITUATIONAL MORALE (Steve 2026-10-09): after a couple of rounds the
        // trajectory is legible. Winning -> commit (only the floor breaks
        // them). Hopeless and alone -> believable flight. Hopeless with help
        // near -> shout instead of scattering.
        var fleeAt = vBreak, hopeless = false, winning = false;
        if (round >= 2) {
          var mlead = null;
          for (var lj = 0; lj < members.length; lj++) { if (members[lj].hp > 0) { mlead = members[lj]; break; } }
          if (mlead) {
            var vDpr = rec.mDealt / round, mDpr = rec.vTaken / round;
            var rtk = mlead.hp / Math.max(1, vDpr);  // rounds to drop the lead
            var rtd = vHp / Math.max(1, mDpr);       // rounds until the villager drops
            hopeless = rtd < rtk * 0.85;              // losing before the lead falls — slow bleeds count (loosened 2026-10-13, was 0.6)
            // COUNTERWIRE (2026-10-16): trick-aware morale. A villager
            // performing a KNOWN trick (rec.trickLog non-empty) is not
            // losing the damage race — they are playing the trick's game
            // (redactor quiet, eulogy contradict...), which deliberately
            // skips strikes. Calling that hopeless fled them mid-trick.
            // They hold the line while they have the HP to see it through
            // (>25%); below that, normal morale applies. Death (vHp<=0) is
            // still honest and separate.
            if (hopeless && rec.trickLog && rec.trickLog.length && vHp > vHpMax * 0.25) {
              hopeless = false;
              rec.log.push(vName + ' holds the line — working the trick, not the damage race.');
            }
            winning = rtk <= rtd * 1.1;              // drops the lead first (or trades)
            if (winning) rec.everWinning = true;
            if (hopeless) rec.everHopeless = true;
          }
        }
        // LEARN-VS-FIGHT (Steve 2026-10-13): the situational override. A
        // learning villager reads the first exchange — good odds → commit
        // to the kill. Not winning after the opening → withdraw with the
        // observation (you're here to learn, not to die).
        if (rec.intent === 'learn' && round >= 2 && winning) {
          rec.intent = 'engage'; rec.intentWhy = 'good-exchange';
          rec.log.push(vName + ' reads the fight — the odds are good. Committing to the kill.');
        }
        // Learning permits wild withdrawal, never an exit from a sealed arena.
        if (!opts.noFlee && rec.intent === 'learn' && round >= 3 && !winning && !rec.outcome) {
          rec.outcome = 'vFlee'; rec.fleeLearn = true; rec.fleeHpFrac = vHp / vHpMax;
          rec.log.push(vName + ' has seen enough — withdraws to report back. (Learn-first: not winnable, not worth the blood.)');
          break;
        }
        if (winning) {
          fleeAt = 0.05;
        } else if (hopeless && !helpCalled && allies > 0 && allyVids.length && rec.intent !== 'learn') {
          helpCalled = true; allyIn = true;
          allyVid = allyVids.shift(); allies--;
          var _ab1 = allyBody(allyVid); allyHp = _ab1.entry; allyMax = _ab1.max; allyEntryHp = _ab1.entry;
          // AID (comms 2026-10-10): foreign allies carry their own names.
          try {
            var _fa2 = (opts.foreignAllies || {})[allyVid];
            allyName = (_fa2 && _fa2.name) || opts.allyName || refName(allyVid);
          } catch (e) {}
          rec.calledHelp = true;
          rec.allyVid = allyVid;
          rec.log.push(vName + ' is losing — shouts for help! ' + allyName + ' charges in!');
          // TRUST LEDGER (journey landing r12 2026-10-13): reason attributed.
          try { if (this.bumpTrust) this.bumpTrust(allyVid, 1, 'answered a call for help'); } catch (e) {}
        } else if (hopeless) {
          // HOPELESS AND ALONE (break-it contests r11 2026-10-10): the
          // trajectory is legible (drops long before the lead falls) and no
          // help is coming — alone, or help already went down. Holding to
          // the bravery floor here doesn't turn it around; it turns a
          // survivable flight into a death. Believable flight: they run
          // while running still works. (Rally fires first when an ally stands
          // with them — held for someone, not for pride; war_cry next —
          // a held line, not a held delusion.)
          // ABILITY — WAR CRY (bellow): once per fight, when the trajectory
          // turns hopeless, the cry steadies the arm and staggers the
          // monster — it hesitates (loses its next attack) and the flee
          // line drops: they hold longer. It's not the volume. It's the
          // promise. Fires instead of fleeing this round; the next round
          // decides again, honestly.
          // ABILITY — RALLY (shieldbearer): once per fight, when the trajectory
          // turns hopeless and an ally stands beside them, they do not run.
          // Not volume like war_cry, no stun — they hold because someone is
          // standing with them. Fires instead of fleeing this round; the
          // next round decides again, honestly. "For them."
          if (!abRallied && vHasAb('rally') && allyIn && allyHp > 0 && !opts.noFlee) {
            abRallied = true;
            rec.log.push(vName + ' looks at ' + allyName + ' standing with them — and does not run. For them. (Rally)');
          } else if (!abWarCried && vHasAb('war_cry') && !opts.noFlee) {
            abWarCried = true; abStun = 1;
            fleeAt = Math.max(0.05, fleeAt - 0.15);
            rec.log.push(vName + ' BELLOWS — not volume, a promise. ' + mPhraseCap + ' falters. They hold the line a little longer. (War Cry)');
          } else if (opts.noFlee) {
            if (!rec.gateShut) { rec.gateShut = true; rec.log.push(vName + ' sees how this ends — but the gate is shut. No running.'); }
          } else {
            rec.outcome = 'vFlee'; rec.fleeHopeless = true; rec.fleeHpFrac = vHp / vHpMax;
            if (rec.intent === 'learn') rec.fleeLearn = true;
            rec.log.push(vName + ' sees how this ends — and runs while running still works.');
            break;
          }
        }
        if ((vHp / vHpMax) < fleeAt) {
          // ABILITY — SCREAM CHEESE (scream): once per fight, hurting, the
          // scream comes out — "AAAAA! The milk is cheese now!" — and the
          // monster reels, dizzy. It loses its next attack. The throat
          // hurts. Worth it.
          if (!abScreamed && vHasAb('scream_cheese')) {
            abScreamed = true; abStun = 1;
            rec.log.push(vName + ' SCREAMS — the milk is cheese now! ' + mPhraseCap + ' reels, dizzy. (Scream Cheese)');
          }
          // ARENA PROTOCOL: sealed — past the sane line, still in. The
          // crowd leans in. (Logged once; the log feeds gossip.)
          if (opts.noFlee) {
            if (!rec.pastSense) { rec.pastSense = true; rec.log.push(vName + ' is past the point of sense and still standing.'); }
          } else {
            rec.outcome = 'vFlee'; rec.fleeHopeless = hopeless; rec.fleeHpFrac = vHp / vHpMax;
            if (rec.intent === 'learn') rec.fleeLearn = true;
            break;
          }
        }
        // THE LEAD FALLS: the pack coordinates through the lead animal —
        // the world-monster entity IS members[0]. Wound it below the break
        // line and the pack breaks (mFlee); kill it and the pack dies or
        // scatters with it — members never promote to a second lead.
        // (Tactical-engine parity: "without the lead, the pack melts away";
        // data: hushwolf weakness "broken coordination (wound the lead)".)
        if (members[0].hp <= 0) {
          rec.outcome = 'vKill';
          for (var mj = 0; mj < members.length; mj++) { members[mj].hp = 0; members[mj].alive = false; }
          rec.log.push('The lead falls — the pack\'s coordination shatters. The rest scatter or die.');
          break;
        }
        if ((members[0].hp / members[0].maxHp) < mBreak) { rec.outcome = 'mFlee'; break; }
        // ABILITY bookkeeping: the debt of this round settles the next.
        abLastRoundTaken = abRoundTaken;
      }
      if (!rec.outcome) {
        // round cap: the worse-off side disengages
        var vFrac = vHp / vHpMax, mFrac = members[0].hp / members[0].maxHp;
        // ARENA PROTOCOL (Gap 4, 2026-10-10): sealed — nobody disengages.
        // The judges call it for the less-bloodied (duelFight precedent).
        if (opts.noFlee) {
          rec.judges = true;
          rec.outcome = (vFrac <= mFrac) ? 'vFlee' : 'mFlee';
          rec.log.push('Fifteen rounds, no finish — the judges give it to the less-bloodied.');
        } else {
          rec.outcome = (vFrac <= mFrac) ? 'vFlee' : 'mFlee';
          rec.log.push('Neither gives after ' + MAX_ROUNDS + ' rounds — the worse-off side disengages.');
        }
      }

      rec.vHpLeft = Math.max(0, vHp);
      rec.mHpLeft = Math.max(0, members[0].hp);
      // wounds persist onto the world entity — part of the world, not RNG
      try { if (m && rec.outcome !== 'vKill') m.hp = rec.mHpLeft; } catch (e) {}
      // VILLAGER XP (Steve 2026-10-09): fighting teaches. Kills teach double.
      // (vDie earns nothing -- the dead are done learning.)
      try {
        // PARITY (2026-10-14): the player's deed table, same n and caps —
        // a kill is fight_won, a fight walked away from (fled, driven off,
        // evaded) is fight_survived.
        if (vid && vid !== 'player' && this.creditDeed) {
          if (rec.outcome === 'vKill') this.creditDeed(vid, 'fight_won');
          else if (rec.outcome === 'vFlee' || rec.outcome === 'mFlee' || rec.outcome === 'evade') this.creditDeed(vid, 'fight_survived');
        }
        // VILLAGER KNOWLEDGE (parity 2026-10-14): whoever fought beside them
        // watched their abilities work — what each does (L2).
        if (vid && vid !== 'player' && this.npcWitnessAbility && (opts.allyVids || []).length) {
          for (var _wi = 0; _wi < vAbs.length; _wi++) this.npcWitnessAbility(vAbs[_wi], opts.allyVids, vid);
        }
      } catch (e) { console.warn('[tracks] field fight deed', e); }
      // NON-LETHAL COUNTER LEARNING (Steve 2026-10-13): surviving teaches
      // the trick. A villager who lives through an encounter with a
      // trick-bearing beast brings home an observation — two observations
      // and the village pieces together the counter, no kill required. The
      // dead tell no tales (vDie excluded); kills teach via the slain path.
      try {
        if (vid && vid !== 'player' && this.noteVillagerTrickObservation &&
            (rec.outcome === 'vFlee' || rec.outcome === 'mFlee' || rec.outcome === 'evade')) {
          this.noteVillagerTrickObservation(vid, mdef.id);
        }
      } catch (e) {}
      // NODE-MATE/DEFENDER WITNESS CHANNEL (2026-10-16, sim-nodewitness,
      // NODEWITNESS=1): the dead tell no tales — but the living who stood
      // on the same node watched it happen. At kill time the field-fight
      // context knows who is there: roster node-mates on the monster's
      // tile (the wild path's npcIds, the raid path's defenders at Haven)
      // read live via npcsOnNode, plus the party-wired ally still
      // standing. One witnessed kill = one observation credit via
      // noteNodeWitnessKill (game.js) — non-lethal learning: nobody is
      // asked to flee, the witnesses were already there. The fight is
      // synchronous inside the encounter tick, so nobody has moved since
      // the encounter staged the scene. Zero trace when NODEWITNESS is
      // unset (the flag short-circuits before any state read).
      try {
        if (vid && vid !== 'player' && rec.outcome === 'vDie' && this.noteNodeWitnessKill &&
            typeof process !== 'undefined' && process.env && process.env.NODEWITNESS === '1') {
          var _nw = [];
          var _nwRoster = [];
          try { _nwRoster = ((this.state.village || {}).roster) || []; } catch (e) {}
          if (m && typeof m.tx === 'number' && typeof m.ty === 'number' && this.npcsOnNode) {
            var _nm = [];
            try { _nm = this.npcsOnNode(m.tx, m.ty) || []; } catch (e) {}
            for (var _ni = 0; _ni < _nm.length; _ni++) {
              var _w = _nm[_ni];
              if (_w && _w !== vid && _w !== 'player' && _nwRoster.indexOf(_w) >= 0 && _nw.indexOf(_w) < 0) _nw.push(_w);
            }
          }
          try {
            if (helpCalled && allyIn && allyHp > 0 && allyVid && allyVid !== vid && _nw.indexOf(allyVid) < 0) _nw.push(allyVid);
          } catch (e) {}
          if (_nw.length) this.noteNodeWitnessKill(vid, mdef.id, _nw);
        }
      } catch (e) {}
      // PARTY-BOND (2026-10-12): surviving together is the practice. The pair
      // bond grows; the village pool grows when a shieldbearer anchors it.
      // Death grieves proportionally — the pair is gone, the survivors' other
      // bonds scale by survivors/party. Grief, not amnesia.
      // SHIELDBEARER PATH (2026-10-12 rework): the System watches who bleeds
      // beside whom — bond thresholds earn the path's abilities.
      try {
        if (vid && vid !== 'player') {
          var _allyAlive = helpCalled && allyIn && allyHp > 0 && allyVid;
          var _allyDied = helpCalled && !allyIn && allyHp <= 0 && allyVid;
          if (rec.outcome === 'vKill' || rec.outcome === 'mFlee' || rec.outcome === 'vFlee') {
            if (_allyAlive && this.noteSharedFight) this.noteSharedFight([vid, allyVid]);
            if (this.noteShieldbearerOffer) this.noteShieldbearerOffer(vid);
            if (this.noteVillageBondFight) this.noteVillageBondFight();
          } else if (rec.outcome === 'vDie') {
            if (this.noteBondGrief) this.noteBondGrief(vid, _allyAlive ? [allyVid] : []);
          }
          if (_allyDied && this.noteBondGrief) this.noteBondGrief(allyVid, [vid]);
        }
      } catch (e) {}
      try { GPf?.finishFieldEscape(this, vid, huntOpening, rec, !!opts.noFlee); } catch (e) { console.warn('[godpath] field escape', e); }
      try { if (GPf && GPf.finishFieldWardRescue) GPf.finishFieldWardRescue(this, vid, wardCarries, rec,
        { id: allyVid, alive: helpCalled && allyIn && allyHp > 0 }); }
      catch (e) { console.warn('[godpath] field protection outcome', e); }
      try { if (GPf && GPf.finishFieldApexHunt) GPf.finishFieldApexHunt(this, vid, huntOpening, rec,
        { packUsed: !!(gpF && gpF.used.pack_hunt), intact: !helpCalled || (allyIn && allyHp > 0) }); }
      catch (e) { console.warn('[godpath] field hunt outcome', e); }
      // FIELD-WOUND CARRYOVER (tackle-wound2): the surviving Haven ally's
      // wounds settle here, through the same once-only sealed record as the
      // lead's — one entry per person, so a caller settling the lead can
      // never double-apply the ally, and a later caller settling the ally
      // finds the entry already used. A downed ally is excluded: their fall
      // already settled as the flat 30 during the fight. Foreign allies,
      // the player, and the lead themselves are excluded (the lead's entry
      // is the one above; the player's wounds travel through scholar.health).
      var allyTaken = 0, allySettles = false;
      try {
        var _roster = ((this.state.village || {}).roster || []);
        allyTaken = helpCalled ? Math.max(0, allyEntryHp - Math.max(0, allyHp)) : 0;
        allySettles = !!(helpCalled && allyIn && allyHp > 0 && allyVid && allyVid !== vid &&
          allyVid !== this.villagerId && !(opts.foreignAllies || {})[allyVid] &&
          _roster.indexOf(allyVid) >= 0 && allyTaken > 0);
      } catch (e) { allySettles = false; }
      rec.allyTaken = helpCalled ? Math.max(0, allyEntryHp - Math.max(0, allyHp)) : 0;
      rec.allyHpLeft = helpCalled ? Math.max(0, allyHp) : null;
      rec.allyEntryHp = helpCalled ? allyEntryHp : null;
      rec.allyWoundsSettled = allySettles;
      // REAR GUARD (sim-gaps-ghost, 2026-10-29): the mustered fighters
      // who never joined the blows are not ghosts — they marched, and
      // they stood the rear through the fight. allyVids here holds
      // exactly the leftovers: every join path shifts its fighter out
      // (allyFromStart, hopeless shout), so what remains never got a
      // "charges in!" line. Name them once, at the close, so a reader
      // of the fight log can account for every named marcher. Sortie
      // (cornered) fights only — no other caller sets cornered, and
      // no other fight's narration changes. Log + record field only:
      // no RNG, no stat, no outcome touched, and nothing in the engine
      // reads rec.log to decide anything, so this cannot move a number.
      try {
        if (opts.cornered && allyVids && allyVids.length) {
          var _rearVids = [], _rearNames = [];
          for (var _ri = 0; _ri < allyVids.length; _ri++) {
            var _rn = refName(allyVids[_ri]);
            if (_rn && _rn !== 'Someone') { _rearVids.push(allyVids[_ri]); _rearNames.push(_rn); }
          }
          if (_rearNames.length) {
            rec.rearGuard = _rearVids.slice();
            rec.log.push(_rearNames.join(' and ') + ' stood the rear through it, watching the treeline behind them.');
          }
        }
      } catch (e) {}
      var _sealEntries = [[vid, rec.vTaken,
        vid !== 'player' && vid !== this.villagerId ? { start: vHpStart, end: rec.vHpLeft } : null]];
      if (allySettles) _sealEntries.push([allyVid, allyTaken, { start: allyEntryHp, end: Math.max(0, allyHp) }]);
      var _sealed = this.sealDamageResult(rec, _sealEntries);
      if (allySettles) {
        try { this.hurtVillager(allyVid, allyTaken, 'monster', rec, { monsterId: (mdef && mdef.id) || null, monsterName: mName || null }); } catch (e) {}
      }
      return _sealed;
    },

    // fieldFightSummary(rec, vName, mName) -> one honest sentence for gossip/news
    fieldFightSummary: function (rec, vName, mName) {
      var r = rec.rounds;
      var rounds = r + ' round' + (r === 1 ? '' : 's');
      // mName may already carry its own article ("The Loud Beast" via
      // monsterNoun) — never double it. (longsim wave lever 2026-10-11:
      // awayNews read "the The Loud Beast".)
      var bare = String(mName || 'beast').replace(/^(the|a|an)\s+/i, '');
      var The = 'The ' + bare, the = 'the ' + bare;
      if (rec.outcome === 'alreadyDead')
        return The + ' was already dead when ' + vName + ' found it — old news, not a kill.';
      if (rec.outcome === 'vKill') {
        // PARTY HONESTY (sim-partyfinish-a, 2026-10-28): a kill by a
        // party reads as a party kill; recs without party info (old
        // callers, unit fixtures) keep the exact old "alone" line.
        var _party = (rec.partySize | 0) >= 2 ? ' with their party' : ' alone';
        var _corner = rec.corneredHold ? ' Cornered at the treeline, it could not slip away before a blow.' : '';
        return vName + ' killed ' + the + _party + ' — ' + rounds + ', ' + rec.vTaken + ' taken. Word travels fast.' + _corner;
      }
      if (rec.outcome === 'mFlee') {
        // HONEST (flesh-out r16 arm C 2026-10-13, SENSE-TESTING): an mFlee
        // with no damage taken is not a mauling — 237/8-run "bloodied but
        // breathing" beats fired on 0-round, 0-damage stand-downs. Same
        // class as the r4 vFlee fix above.
        if ((rec.vTaken | 0) <= 0)
          return vName + ' stared down ' + the + ' and it backed off — ' + rounds + ', not a scratch on them.';
        return vName + ' stood down ' + the + ' and kept walking — ' + rounds + ', bloodied but breathing.';
      }
      if (rec.outcome === 'vFlee') {
        // HONEST (longsim wave lever r4 2026-10-12): a vFlee with no damage
        // taken is not a mauling — "mauled (-0 health)" was a lie. The
        // villager got clear unharmed.
        if ((rec.vTaken | 0) <= 0)
          return The + ' came for ' + vName + ' and missed — they got clear over ' + rounds + ', unharmed. They\'re lucky to be breathing.';
        return The + ' mauled ' + vName + ' (-' + rec.vTaken + ' health) over ' + rounds + '. They\'re lucky to be breathing.';
      }
      if (rec.outcome === 'vDie')
        return The + ' killed ' + vName + ' in ' + rounds + '. The village mourns.';
      return vName + ' met ' + the + ' and walked away from it.';
    },
  };
  Object.assign(G, methods);
})(typeof window !== 'undefined' ? window : global);
