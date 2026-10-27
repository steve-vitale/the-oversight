// @ontology
// system: table-feared
// description: The Feared path — calibrate terror. Three beats: the footage, the calibration, the branch twist. Meters in tension: alien-terror vs villager-horror. Trial by combat (opt-in, real startCombat vs the Finale) is the single existential risk: win and terror maxes; lose and the mantle passes, the village continues weakened. Light = protective terror; dark = domination.
// provides:
//   - tableTrialByCombat()
//   - tableTrialResume(result)
//   - tableTrialFight(fight)
// consumes:
//   - tableState(), tableBranch(), tableRunBeat(), tableFinals(), tableFail(), tableLiveWrap(), say, sysSay
//   - ledger(), deedState(), startCombat(), tbEnd (wrapped to resume the table)
//   - villagerId (mantle-pass detection)
// Registers via tableRegisterPath. Load AFTER table.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function meterLine(T) {
    const m = T.meters || {};
    return `alien-terror ${m.terror | 0} · villager-horror ${m.horror | 0}`;
  }
  // The tightrope, made real (2026-10-11): horror is ABSOLUTE — your own
  // people have a finite tolerance. The old check (horror > terror+3 on one
  // choice) was mathematically unreachable: terror gains always outran
  // horror, so the curdle could never fire and the failure beat was dead
  // text. Now every fear-pushing move risks the curdle at horror 5: push
  // fear at your people beat after beat without ever spending it down and
  // they flinch where trillions watch — the table stops fearing and starts
  // pitying. The mercy/hold/spend/refuse valves reduce horror; oathbound
  // (light) halves horror gains, so the pledged shield genuinely protects.
  function curdleCheck(extra) {
    return function (T) {
      const m = T.meters || {};
      let gain = ((extra && extra.horror) | 0);
      const mult = (T.abilMods && T.abilMods.horrorMult) || 1;
      if (gain > 0) gain = Math.max(0, Math.floor(gain * mult));
      if (((m.horror | 0) + gain) >= 5) {
        return Object.assign({}, extra, { fail: 'the demonstration curdled — your own people flinched, visibly, where trillions watched' });
      }
      return extra;
    };
  }

  const FEARED_DEF = {
    id: 'feared',
    name: 'the Feared',
    minSeat: 'lesser',
    showGenre: 'the terror broadcast',
    showLive: 'the terror broadcast: WHAT EATING BUILT',
    openLine: '"Look what eating built." The footage plays unasked — the deer, the fire, the ones who came for you and didn\'t come back. Nobody at the table is comfortable. That is the point.',
    prereq(seat) {
      const L = (typeof this.ledger === 'function') ? this.ledger() : {};
      const deeds = ((typeof this.deedState === 'function') ? this.deedState().wavesFaced : null) || {};
      const distinct = Object.keys(deeds).length;
      if (!seat || seat.seat === 'none') return { earned: false, strength: 0, why: 'No seat at the table.' };
      const score = ((L.might | 0) + (L.killed | 0));
      if (score < 6) return { earned: false, strength: 0, why: `The table has seen fiercer ledgers (might+killed ${score} — the footage isn't there yet).` };
      const strength = Math.min(100, 25 + distinct * 3 + ((L.might | 0) * 2));
      return { earned: true, strength, why: `${distinct} distinct monsters faced blow-by-blow. The footage exists, and it plays unasked.` };
    },
    abilities: {
      shared: [
        { id: 'dreadfield', name: 'Dreadfield', desc: 'The room feels you before you speak. Alien-terror starts at 2.', grant: { terror: 2 } },
        { id: 'wartable', name: 'War-table', desc: 'You read the table\'s fear the way you read weather. The Nielsen flinches first — you saw it.' },
      ],
      light: [
        { id: 'oathbound', name: 'Oathbound', desc: 'Your terror is pledged as a shield: your own people\'s horror grows half as fast.', grant: { abilMods: { horrorMult: 0.5 } } },
        { id: 'shieldbearer', name: 'Shieldbearer', desc: 'Spend terror to calm horror — the shield, not the sword. (Offered in the final beat.)' },
      ],
      dark: [
        { id: 'redharvest', name: 'Red Harvest', desc: 'Your kills feed the broadcast. Every three kills this run is +1 terror, here and now.', grant: function () { const L = (this.ledger && this.ledger()) || {}; return { terror: Math.min(4, ((L.killed | 0) / 3) | 0) }; } },
        { id: 'exemplum', name: 'Exemplum', desc: 'Name another village as the example. Terror +3, horror +3. (Offered in the final beat.)' },
      ],
    },
    beats: [
      {
        say: ['BEAT ONE — THE FOOTAGE. The table doesn\'t ask what you did. It shows it: the deer, the fire, the feast-burned blade, the ones who came for you and didn\'t come back. A delegate with too many angles covers its face. "Choose," the System says, "what leads."'],
        meterLine,
        choices: [
          { id: 'kill', label: 'Lead with the kill.', effects: curdleCheck({ terror: 2, horror: 2 }), say: ['The deer. The cleanest kill. The table goes very still. Behind you, your own people go still too — a different stillness.'] },
          { id: 'mercy', label: 'Lead with the mercy you showed once.', effects: { terror: 1, horror: -2 }, say: ['The time you stayed your hand. The table doesn\'t know what to do with it — which is its own kind of fear. Your people breathe.'] },
          { id: 'fire', label: 'Lead with the feast-fire.', effects: curdleCheck({ terror: 1, horror: 1 }), say: ['The fire you ate from and fought from. "Look what eating built," you say, and the footage agrees with you.'] },
        ],
      },
      {
        say: ['BEAT TWO — CALIBRATION. A delegate leans too far over the light and flinches at its own reflection in your eyes. The System watches the flinch the way it watches ratings. "MORE?" it asks. "LESS?" Or — the oldest door — "PROVE IT?"'],
        meterLine,
        // A withdrawn trial stays withdrawn: after an honest refusal the
        // door is not offered again on this walk. (2026-10-12)
        choices: function (T) {
          const list = [
            { id: 'lean', label: 'Lean in.', effects: curdleCheck({ terror: 2, horror: 2 }), say: ['You let them see it. All of it. The table recalculates. The fire back home burns a little lower.'] },
            { id: 'hold', label: 'Hold back.', effects: { terror: 1, horror: -2 }, say: ['Restraint, from you, is the most frightening thing in the room. Your people notice the restraint too.'] },
          ];
          if (!(T && T.trialRefused)) list.push({ id: 'trial', label: 'Demand the champion. (TRIAL BY COMBAT — real fight, real death)', effects: { trial: true }, say: ['"Send your champion." The table goes quiet in eleven dimensions.'] });
          return list;
        },
      },
      {
        say: function (T) {
          if ((T.branch || 'light') === 'light') return ['BEAT THREE — SPEND IT. A small village\'s envoy — not yours, barely on any map — is being pressed by the table for tribute it cannot pay. The System watches you watch them. Terror is currency here. You could spend yours *for* them. Or keep it.'];
          return ['BEAT THREE — THE EXAMPLE. The table is hungry — not for food, for certainty. "NAME ONE," the System says, almost gently. "One village, as the example. The fear needs an address." Your own people have gone very quiet behind you.'];
        },
        meterLine,
        choices: function (T) {
          if ((T.branch || 'light') === 'light') return [
            { id: 'spend', label: 'Spend the terror shielding them.', effects: { terror: -1, horror: -3 }, say: ['You spend it — the shield, not the sword. The small envoy stares. Your people stand a little straighter. Protective terror: the table writes it down and doesn\'t understand it, which is the point.'] },
            { id: 'keep', label: 'Keep it. They\'re not yours.', effects: curdleCheck({ terror: 1, horror: 2 }), say: ['You keep it. The envoy\'s face does something you will remember. The table nods — it understands this, and that should worry you.'] },
          ];
          return [
            { id: 'name', label: 'Name the village. (Exemplum)', effects: curdleCheck({ terror: 3, horror: 3 }), say: ['You name it. The table feeds. Somewhere, people who never met you will fear your name forever. That was the price. You paid it gladly, and that\'s the worst part.'] },
            { id: 'refuse', label: 'Refuse the table\'s hunger.', effects: { terror: 1, horror: -2 }, say: ['"No." The table blinks — it has never been refused *this*. Your people exhale. Refusal, from the feared one, is its own terror.'] },
          ];
        },
      },
    ],
    failure: {
      beat: 'The ring dims. Fear, it turns out, is a wasting asset — spend it wrong and it spends you.',
      offerLine: 'The table does not punish failure with death. It punishes it with smaller doors.',
    },
    finals: {
      light: [
        { id: 'mercy', label: 'Show mercy.', outcome: ['The most frightening thing you ever did. The table doesn\'t know what to do with mercy from a predator. Neither do you, quite. But the audience weeps, and the galaxy learns that the feared one chose gentleness — and that choice echoes longer than any threat. The terror stays, pledged now: a shield over every village, forever.'] },
        { id: 'pledge', label: 'Pledge the terror.', outcome: ['You pledge it aloud, on the record: humanity\'s fear is a standing shield, never a sword. The table signs. Your people sleep. Somewhere the System files you under "deterrent, benevolent" and never quite understands the second word.'] },
      ],
      dark: [
        { id: 'example', label: 'Make an example.', outcome: ['Deterrence holds for a century. The footage never stops playing. Nobody bothers humanity again. You tell yourself the fear was the price of safety. Some nights you almost believe it. The village prospers, and flinches when you enter rooms.'] },
        { id: 'tribute', label: 'Demand tribute.', outcome: ['Fear pays, and you collect. The tribute ships come heavy and on time. Humanity is rich, safe, and alone in every room that matters. The table fears you. The village does too. That was always the price; you just stopped reading the invoice.'] },
      ],
    },
  };

  Game.tableRegisterPath(FEARED_DEF);

  // ============ TRIAL BY COMBAT ============
  // The single opt-in existential risk. Real fight (startCombat vs the
  // Finale, wave-5), on the grid, right now. tbEnd resumes the table.
  const methods = {
    tableTrialFight(fight) {
      const f = fight || this.tbfight;
      const scholar = (this.state || {}).scholar || {};
      const pending = ((scholar.prog || {}).table || {}).trialPending;
      return !!(f && (f.tableTrial || (pending && (f.fighters || []).some(m => m.kind === 'monster' && m.monsterId === 'finale'))));
    },
    tableTrialByCombat() {
      const T = this.tableState();
      // SEAT-TAKER GUARD (Steve 2026-10-26, item 495): the champion's
      // fight is staged for the player character. A villager sitter has
      // no champion's fight staged yet, and the bearer must never fight
      // in the sitter's name — so the trial door withdraws for that
      // walk, said aloud, and the calibration continues without it
      // (the same honest-withdrawal pattern as a champion who does not
      // come, below). A real sitter trial fight is remainder work.
      const _st = (T && T.seatTaker) || null;
      if (_st && _st.id && _st.id !== this.villagerId) {
        const _nm = (String(_st.name || 'the sitter')).split(' ')[0];
        T.trialRefused = true;
        this.say(`◈ TRIAL WITHHELD — the champion fights the sitter, and ${_nm} has no champion's fight staged here yet. The table withdraws the trial for this walk; the calibration continues without it.`);
        this.tableRunBeat();
        try { this.save(); } catch (e) {}
        return;
      }
      T.trialPending = true;
      const me = this.villagerId;
      T.trialBearer = me;
      this.say('◈ TRIAL BY COMBAT — the challenge pauses. This is not a metaphor. The Finale steps forward — the table\'s champion, the last thing the show ever made. Win, and terror is no longer a meter but a fact. Lose, and the mantle passes mid-table; the village continues weakened. This is the only door with death behind it, and you chose it.');
      try { this.tableLiveWrap('the terror broadcast: TRIAL BY COMBAT'); } catch (e) {}
      try { this.state.scholar.tableChoices = null; } catch (e) {}
      try {
        // The table summons the champion DIRECTLY: the finale campaign's
        // open-world gates (three-node march, muster of 20 allied blades)
        // do not apply at the table — the System brings the champion to the
        // ring, right now, for a single blow-by-blow fight. (2026-10-12)
        this._tableTrialDirect = true;
        this.startCombat('finale', { tableTrial: true });
      } catch (e) {
        T.trialPending = false;
        this._tableTrialDirect = false;
        this.say('The champion does not come. (The fight refused: ' + (e && e.message ? e.message : e) + '.) The table pretends it meant to do that.');
        this.tableRunBeat();
      } finally {
        this._tableTrialDirect = false;
      }
      // A gate refusal is SILENT (says its line, returns null — no throw).
      // Without this net, the challenge strands with no modal and no fight:
      // trialPending stays true forever and the player has no options.
      // If no fight began, say so honestly, withdraw the door, re-run the
      // beat — the challenge continues, minus the trial. (2026-10-12)
      try {
        if (T.trialPending && !this.tbfight) {
          T.trialPending = false;
          T.trialRefused = true;
          this.say('The champion does not come — the table withdraws the trial. It will not be offered again. The calibration continues without it.');
          this.tableRunBeat();
        }
      } catch (e) {}
      try { this.save(); } catch (e) {}
    },
    tableTrialResume(result) {
      const T = this.tableState();
      const beats = (FEARED_DEF.beats || []).length;
      if (result === 'won') {
        T.meters = T.meters || {}; T.meters.terror = 10;
        this.say('◈ TRIAL WON — the Finale is meat. The table does not applaud; the table recalculates. Nobody will ever again wonder what eating built.');
        try { this.recordMoment('Won trial by combat against the Finale at the table.'); } catch (e) {}
      } else {
        T.weakened = (T.weakened | 0) + 1;
        T.meters = T.meters || {}; T.meters.terror = Math.max(0, (T.meters.terror | 0) - 3);
        const died = this.villagerId !== T.trialBearer;
        this.say(died
          ? '◈ TRIAL LOST — the champion stands over the body. The mantle passes mid-table; a new face sits in the pale light, and the village negotiates weakened. The story does not end — it never does — but the terms just got worse.'
          : '◈ TRIAL LOST — you live, diminished (' + result + '). The table smells it. The village steadies you, and the negotiation continues at a worse price.');
      }
      T.beat = (T.beat | 0) + 1;
      if (T.beat >= beats) this.tableFinals(); else this.tableRunBeat();
      try { this.save(); } catch (e) {}
    },
  };
  Object.assign(Game, methods);

  // tbEnd wrap: resume the table after the trial fight. Exception-guarded;
  // a table failure can never break combat.
  if (!Game._tableTrialWrapped) {
    Game._tableTrialWrapped = true;
    const _tbEnd = Game.tbEnd;
    Game.tbEnd = function tableTrialWrapped(result) {
      const trial = this.tableTrialFight();
      const r = _tbEnd.call(this, result);
      try {
        // Old saved trials may already carry the leaked world-heart mark.
        // The outer campaign resolvers skip a trial; retire that stale mark
        // here without resolving a world titan or changing its muster.
        const titans = this.state.titans;
        if (trial && titans && titans._fight && titans._fight.campaign === 'finale_heart') titans._fight = null;
        const T = (typeof this.tableState === 'function') ? this.tableState() : {};
        if (T && T.trialPending && typeof this.tableTrialResume === 'function') {
          T.trialPending = false;
          this.tableTrialResume(result);
        }
      } catch (e) {}
      return r;
    };
  }
})();
