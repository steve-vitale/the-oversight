// @ontology
// system: scaleDiscovery
// description: In-world discovery of the scale ladder — traveler word, villager mentions, System producer nudges, audience whispers, and the first-step moment. Discovery opens the door; walking through stays earned.
// provides:
//   - scaleDiscovery()
//   - scaleDiscoveryDaily()
// rules:
//   - discovery_is_reactive: every pointer fires on earned state (thriving fire, wave-ledger bars, known villages, viewership) — never a timer, never a checklist. (code: scaleDiscovery.js)
//   - discovery_is_once_only: each beat fires once per run, then lives in villager mouths and the journal. Pointers never nag. (code: scaleDiscovery.js)
//   - discovery_is_knowledge_gated: concepts ladder regional-before-national-before-table; day floors 10/15/20/30/35/40/55; thriving gate for travelers; System gate is integration stage 1+. (code: scaleDiscovery.js)
//   - the_system_never_talks_mechanics: System lines are producer-brain ("the show needs", "the cameras") — never "the wave-4 gate requires scaleRank >= regional"; never names unearned waves. (code: scaleDiscovery.js)
//   - the_world_does_not_care_about_refusal: traveler word keeps coming after REFUSE — the region climbs without Haven. Only the System's pitches stop. (code: scaleDiscovery.js)
//   - the_moment_survives_accord: the first-accord moment restages with the next link if the first gesture dies unmade (mirrors hierarchy.js the_moment_survives). (code: scaleDiscovery.js)
// consumes:
//   - state.otherVillages
//   - state.scholar.day
/* SCALE DISCOVERY — src/js/scaleDiscovery.js
 *
 * Steve's gap (2026-10-13): "nothing in-world points at national/regional —
 * 128 days of competent play produced zero mentions of national or the
 * galactic table. Villages die never knowing the wider world exists."
 *
 * The ladder's mechanics are built (hierarchy.js: accords, the Regional Dawn,
 * six national roads, the Watchers). This module builds the MOMENTS around
 * them:
 *
 * THE POINTERS (village learns the ladder exists):
 *   - traveler word: a trader lingers at a thriving fire and says other
 *     fires walk as one (regional), then that four fires under one head are
 *     called a realm (national). The world is bigger than the known region;
 *     travelers are the vector (canon: "Haven hears through traders —
 *     delayed, possibly wrong, never omniscience").
 *   - villager mention: fire-side talk plants the concept before the trader
 *     does, or after — whichever the run earns first.
 *   - System nudges (producer-brain): at the wave-3 bar with no network —
 *     "the next act needs a bigger stage"; at the wave-4 bar, regional but
 *     no nation — "finales need a nation". Deed-gated, never timers.
 *   - audience whisper: the chat ranking fires (viewership-gated).
 *   - table discovery: at national, the System says the table aloud.
 *
 * THE MOMENT (first real step toward regional): the first link's staging
 * grows a beat — the System announces FIRST CONTACT as a show pilot, two
 * villagers react in their own voices, the overlay is said to warm up.
 * The Regional Dawn (21 days later) keeps its thunder; this is the spark.
 *
 * GATING (earned, not granted): day floors (10/15/20/30/35/40/55), the
 * thriving gate (starving fires get no travelers), the System gate
 * (integration stage 1+), deed gates (wave ledger bars), the concept ladder
 * (regional before national before table), and REFUSE silences the pitches.
 *
 * Self-attaching module. Load after hierarchy.js. Chain-safe wraps.
 */
(function () {
  'use strict';
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  var R = Math.random;
  var pick = function (a) { return a[Math.floor(R() * a.length)]; };
  var HOME = 'haven';

  var methods = {

    // ---------- STATE ----------

    // scaleDiscovery: what the village has HEARD about the ladder — the
    // knowledge surface. UI and other systems gate hints on this, never on
    // the raw flags. Each fired beat: {day, via}.
    scaleDiscovery() {
      var d = null;
      try { d = this.state.scaleDiscover || null; } catch (e) { return {}; }
      if (!d) return {};
      var out = {};
      for (var k in d) if (d[k] && typeof d[k] === 'object') out[k] = { day: d[k].day, via: d[k].via };
      return out;
    },

    _sd() {
      this.state.scaleDiscover = this.state.scaleDiscover || {};
      return this.state.scaleDiscover;
    },

    _sdDay() {
      try { return (this.state.scholar || {}).day || 0; } catch (e) { return 0; }
    },

    // _sdFire: mark a beat fired, once-only. Returns true when newly fired.
    _sdFire(key, via) {
      var d = this._sd();
      if (d[key]) return false;
      d[key] = { day: this._sdDay(), via: via || 'world' };
      return true;
    },

    _sdSystemUp() {
      try { return (typeof this.integrationStage === 'function' ? this.integrationStage() : 0) >= 1; }
      catch (e) { return false; }
    },

    _sdLiving() {
      try {
        var ids = (typeof this.npcIds === 'function') ? this.npcIds() : [];
        return Math.max(1, ids.length);
      } catch (e) { return 12; }
    },

    _sdPantryKcal() {
      try { return (typeof this.pantryKcal === 'function') ? (this.pantryKcal() | 0) : 0; }
      catch (e) { return 0; }
    },

    // _sdThriving: travelers linger where there's food, and fire-side talk
    // needs full bellies. 2+ days of food at 2000 kcal/day/villager.
    _sdThriving() {
      return this._sdPantryKcal() >= this._sdLiving() * 2000 * 2;
    },

    // _sdStraining: the pantry can't cover tomorrow. The hunger nudge's gate.
    _sdStraining() {
      return this._sdPantryKcal() < this._sdLiving() * 2000 * 1;
    },

    _sdName(vid) {
      try {
        var n = this.displayName(vid);
        if (n && n !== 'undefined') {
          n = String(n);
          // stranger descriptor ("A person, maybe 30s, with a limp"): use it
          // whole — its first word ("A") is not a name (hierarchy._repName
          // precedent, travel lever r3 2026-10-11).
          if (/^a /i.test(n) || n.indexOf(',') >= 0) return n;
          return n.split(' ')[0];
        }
      } catch (e) {}
      return 'Someone';
    },

    _sdVillager(skipId) {
      try {
        var ids = (typeof this.npcIds === 'function') ? this.npcIds() : [];
        ids = ids.filter(function (id) { return id !== skipId; });
        if (!ids.length) return null;
        return pick(ids);
      } catch (e) { return null; }
    },

    _sdKnownVillages() {
      try {
        var oV = this.state.otherVillages || [];
        var self = this;
        // KNOWER LEDGER (2026-10-29): scale pointers are the PLAYER's
        // view, so the knower is explicitly the player.
        return oV.filter(function (v) {
          return v && v.id !== HOME && self.knowsVillage(v,
            (typeof self.playerKnowerId === 'function') ? self.playerKnowerId() : undefined);
        });
      } catch (e) { return []; }
    },

    _sdLinks() {
      try { return (typeof this.hierarchyState === 'function') ? (this.hierarchyState() || []) : []; }
      catch (e) { return []; }
    },

    _sdRank() {
      try { return (typeof this.scaleRank === 'function') ? this.scaleRank() : 'village'; }
      catch (e) { return 'village'; }
    },

    _sdWave() {
      try { return (typeof this.unlockedWave === 'function') ? (this.unlockedWave() | 0) : 1; }
      catch (e) { return 1; }
    },

    _sdViewership() {
      try {
        if (typeof this.havenViewership === 'function') return this.havenViewership() | 0;
        var v = (this.state.village || {}).viewership || 0;
        return v | 0;
      } catch (e) { return 0; }
    },

    _sdNote(tag, text) {
      try { if (this.journalNote) this.journalNote('village', tag, text); } catch (e) {}
    },

    // ---------- THE POINTERS ----------

    // Traveler word, regional: other fires walk as one. The vector is a
    // trader lingering at a thriving fire — the world beyond the known
    // region is organizing, and word travels with full bellies.
    _sdTravelerRegion() {
      var d = this._sd();
      if (d.region || this._sdDay() < 20 || !this._sdThriving()) return;
      if (R() > 0.15) return;
      if (!this._sdFire('region', 'traveler')) return;
      this.say(`🧳 A trader lingers after the meal — your fire eats well, and word travels with full bellies. "East, past the river — three fires walk as ONE now. They've got a speaker for SPEAKERS. Thought you should know there's bigger games than yours."`);
      this._sdNote('scale', 'Trader word: fires east walk as one, with a speaker for speakers. There are bigger games than Haven.');
    },

    // Villager mention, regional: fire-side talk plants the concept. Races
    // the traveler — whichever the run earns first.
    _sdVillagerMention() {
      var d = this._sd();
      if (d.region || this._sdDay() < 15 || !this._sdThriving()) return;
      if (R() > 0.10) return;
      var vid = this._sdVillager();
      if (!vid) return;
      if (!this._sdFire('region', 'villager')) return;
      var nm = this._sdName(vid);
      this.say(`${nm}, mending a net by the fire: "Passed a fire three days east, once. Bigger than us. They had a speaker for speakers — a whole hierarchy of talking." Nobody asked. Everybody heard.`);
      this._sdNote('scale', nm + ' spoke of a bigger fire east, with a speaker for speakers.');
    },

    // Traveler word, national: four fires under one head, called a realm.
    // Needs the regional concept first — the ladder is climbed in order.
    _sdTravelerRealm() {
      var d = this._sd();
      if (d.realm || !d.region || this._sdDay() < 35 || !this._sdThriving()) return;
      if (R() > 0.12) return;
      if (!this._sdFire('realm', 'traveler')) return;
      this.say(`🧳 The trader lowers their voice. "And further still — FOUR fires under one head. They call it a REALM. Tribute flows uphill like a river; I saw the grain carts with my own eyes." They won't say more. Or can't.`);
      this._sdNote('scale', 'Trader word: four fires under one head, called a realm. Tribute flows uphill.');
    },

    // System nudge, regional pointer: the wave-3 bar is cleared but there is
    // no network. Producer-brain — the show needs a bigger stage. Never
    // names the coming wave ("the next act", never "the Mirror Draft").
    _sdNextAct() {
      var d = this._sd();
      if (d.nextAct || this._sdDay() < 30) return;
      if (!this._sdSystemUp()) return;
      if (this.state.scaleRefused) return;
      if (this._sdWave() < 3) return;
      // DEDUP (journey-deepening r39 2026-10-23): game.js scalePointerW4 (Beat 4,
      // SCALE-DISCOVERY.md 2026-10-12) owns the wave-3-landed-one-fire moment —
      // the kill that unlocks wave 3 synchronously runs checkWaveUnlockBeat, so
      // Beat 4 always lands before the next daily tick. Without this gate the
      // player hears "the next act needs a BIGGER STAGE" twice within a day:
      // the producers' pitch (standing ask) and this one (network ask). Beat 4's
      // text already names the current lever (standing, 2026-10-13); this beat
      // keeps the cases Beat 4 never covers (e.g. wave 3 landed while the daily
      // tick runs before any unlock check).
      if (this.state && this.state._scalePtrW4) return;
      try {
        if (typeof this.scaleAtLeast === 'function' && this.scaleAtLeast(this._sdRank(), 'regional')) return;
      } catch (e) {}
      if (!this._sdFire('nextAct', 'system')) return;
      if (!d.region) d.region = { day: this._sdDay(), via: 'system' };
      this.say(`◈ SYSTEM: "Okay. WOW. You've cleared the board — the cameras are FED. But the next act? ...The next act needs a BIGGER STAGE. I can't stage what's coming with ONE fire — there's not enough of you to REFLECT. Get me a network. More fires. Bigger story. GO."`);
      this._sdNote('scale', 'The System wants a bigger stage: one fire is not enough for the next act.');
    },

    // System nudge, national pointer: the wave-4 bar is cleared, regional
    // but no nation. "Finales need a nation." Villager echo the next day.
    _sdNation() {
      var d = this._sd();
      if (d.nation || this._sdDay() < 55) return;
      if (!this._sdSystemUp()) return;
      if (this.state.scaleRefused) return;
      if (this._sdWave() < 4) return;
      try {
        if (typeof this.scaleAtLeast === 'function') {
          if (!this.scaleAtLeast(this._sdRank(), 'regional')) return;
          if (this.scaleAtLeast(this._sdRank(), 'national')) return;
        }
      } catch (e) {}
      if (!this._sdFire('nation', 'system')) return;
      if (!d.realm) d.realm = { day: this._sdDay(), via: 'system' };
      this.say(`◈ SYSTEM: "Four waves. FOUR. The producers are — okay, I'm saying it: FINALES need a NATION. You've got a region; now make it a REALM. Bind fires under one head, or bend the knee to someone who has. The higher-ups are watching. ...Did I say higher-ups? I said NOTHING. Forget the higher-ups."`);
      this._sdNote('scale', 'The System: finales need a nation. Bind fires under one head, or bend the knee.');
      d.nationEchoDay = this._sdDay() + 1;
    },

    // The villager echo of the national pointer — gossip, not broadcast.
    _sdNationEcho() {
      var d = this._sd();
      if (!d.nation || d.nationEchoSaid) return;
      if (this._sdDay() < (d.nationEchoDay || 0)) return;
      var vid = this._sdVillager();
      if (!vid) return;
      d.nationEchoSaid = true;
      this.say(`${this._sdName(vid)}, at the fire, quiet: "Whatever's coming... I don't think one fire faces it. Not alone." Nobody argues.`);
    },

    // The villager echo of the NATIONAL BEAT ITSELF (journey-scale-r2
    // 2026-10-14): the court sat or the oath was sworn, and the village
    // knows. The beat is the biggest political event in the village's life —
    // speakers riding in, a feast, an oath — and no villager ever mentioned
    // it. Fires once, a few days after nationalLive goes live (the System
    // and the table-discovery speak first), shape-aware, once per run.
    // Gossip, not broadcast — a villager at the fire, in their own voice.
    _sdNationalBeatEcho() {
      var d = this._sd();
      if (d.natBeatEcho || this.state.scaleRefused) return;
      if (!this.state.nationalLive) return;
      var natDay = this.state.nationalDay || 0;
      if (this._sdDay() < natDay + 2) return;
      var shape = this.state.nationalShape || 'lead';
      var vid = this._sdVillager();
      if (!vid) return;
      // GATE-AFTER-SAY (journey scale r1 2026-10-15): the once-only gate used
      // to be consumed BEFORE the say() — a throw in _sdName/pick/say (all
      // swallowed by scaleDiscoveryDaily's try/catch) permanently silenced
      // the echo with the gate marked fired. Now the line goes out first;
      // the gate marks only on success, so a failed attempt retries tomorrow.
      var nm = this._sdName(vid);
      var primaryNm = 'them';
      try {
        if (this.state.nationalPrimary) primaryNm = this._ovName(this.state.nationalPrimary);
      } catch (e) {}
      var lines = {
        lead: [
          `"Four fires. One head. And the head is US. ...Did that just happen? I was pouring cups."`,
          `"Speakers rode in, ate our grain, and called us a realm. A REALM. I keep saying it to hear how it sounds."`,
        ],
        belong: [
          `"We swore to ${primaryNm}. We're somebody's now. I keep waiting to feel different."`,
          `"The oath's sworn. ${primaryNm} holds the high seat and we hold our fire. That's the deal. That's the whole deal."`,
        ],
        covenant: [
          `"No thrones. A circle of speakers and a shared granary. The audience has never seen one survive — well. We'll show them."`,
          `"Four fires, no head. The pool's open and the pact's sworn. Ask me in a season if leagues work."`,
        ],
        trade: [
          `"Signed the charter. Tariffs, ledgers, routes. No swords — written plainly, so nobody can pretend otherwise."`,
          `"We're a ledger now. Four fires on the same books. The traders are already acting like they own the road."`,
        ],
        conquest: [
          `"They knelt because they lost. I watched it happen. I don't know what I'm supposed to feel."`,
          `"The realm's ours and it cost blood. Don't let anyone tell you the quiet part out loud — we all heard the price."`,
        ],
      };
      var pool = lines[shape] || lines.lead;
      this.say(`${nm}, at the fire, not quite believing it: ${pick(pool)}`);
      this._sdFire('natBeatEcho', 'villager');
      this._sdNote('scale', `The village is talking about the court — the ${shape} road. The realm is real to them now.`);
    },

    // Table discovery: national is live. The System says the table aloud.
    _sdTable() {
      var d = this._sd();
      if (d.table) return;
      if (!this.state.nationalLive) return;
      if (!this._sdFire('table', 'system')) return;
      this.say(`◈ SYSTEM: "Oh. OH. Do you feel that? That's the whole PLANET leaning in. ...There's a table, little fires. A big one. Far away. And it is LOOKING at you. Give it a season worth judging."`);
      this._sdNote('scale', 'The System spoke of a table — a big one, far away, looking at Haven.');
    },

    // First-knock nudge: the first known village. The System, producer-brain,
    // motivates the propose press — before any link exists.
    _sdKnockNudge() {
      var d = this._sd();
      if (d.knock || this._sdDay() < 10) return;
      if (!this._sdSystemUp()) return;
      if (this.state.scaleRefused) return;
      if (this._sdLinks().length) return;
      if (!this._sdKnownVillages().length) return;
      if (!this._sdFire('knock', 'system')) return;
      this.say(`◈ SYSTEM: "Ooh. NEIGHBORS. You know what neighbors are for? STORYLINES. Go knock — worst case, it's CONTENT. Best case? The show gets BIGGER."`);
      this._sdNote('scale', 'The System noticed the neighbors, and wants storylines.');
    },

    // Hunger nudge: the pantry strains and a known fire has grain. The
    // motive is the village's own hunger — not a tutorial.
    _sdHungerNudge() {
      var d = this._sd();
      if (d.hunger || this._sdDay() < 12) return;
      if (!this._sdStraining()) return;
      var known = this._sdKnownVillages();
      if (!known.length) return;
      if (this._sdLinks().some(function (l) { return l.status === 'active'; })) return;
      var vid = this._sdVillager();
      if (!vid) return;
      if (!this._sdFire('hunger', 'villager')) return;
      var onm = 'The east fire';
      try { onm = this._ovName(known[0].id); } catch (e) {}
      this.say(`${this._sdName(vid)} doesn't say it twice: "${onm} has grain. We have hands. Someone should walk over."`);
      this._sdNote('scale', this._sdName(vid) + ' suggested walking to ' + onm + ' — they have grain, Haven has hands.');
    },

    // Audience whisper: the chat is ranking fires. Viewership-gated, softer
    // and earlier than the deed-gated national pitch.
    _sdWhisper() {
      var d = this._sd();
      if (d.whisper || this._sdDay() < 40) return;
      if (!this._sdSystemUp()) return;
      if (this.state.scaleRefused) return;
      if (!this.state.networkLive || this.state.nationalLive) return;
      if (this._sdViewership() < 15) return;
      if (!this._sdFire('whisper', 'audience')) return;
      this.say(`◈ SYSTEM: "Oh! The chat is doing the thing again — they're RANKING fires. Yours is... climbing. They keep asking which fire climbs FIRST. No pressure. (SO much pressure.)"`);
      this._sdNote('scale', 'The audience is ranking fires, and Haven is climbing.');
    },

    // Felt time: the bond ages in villager mouths, so the Regional Dawn
    // lands as payoff, not surprise. Gated on the first active link.
    _sdFeltTime() {
      var d = this._sd();
      if (this.state.networkLive) return;
      var links = this._sdLinks().filter(function (l) { return l.status === 'active'; });
      if (!links.length) return;
      var first = links[0];
      for (var i = 1; i < links.length; i++) {
        if ((links[i].day || 0) < (first.day || 0)) first = links[i];
      }
      var age = this._sdDay() - (first.day || 0);
      var vid = this._sdVillager();
      if (!vid) return;
      var nm = this._sdName(vid);
      if (!d.felt10 && age >= 10) {
        d.felt10 = { day: this._sdDay(), via: 'villager' };
        this.say(`${nm}, counting on their fingers: "They sent extra this week. I think we're... friends? Is that the word?"`);
      }
      if (!d.felt18 && age >= 18) {
        d.felt18 = { day: this._sdDay(), via: 'villager' };
        this.say(`${nm} again, quieter: "Three weeks we've known them. Feels longer."`);
      }
    },

    // ---------- THE MOMENT ----------

    // _sdFirstAccordMoment: the first real step toward regional gets a beat.
    // The System announces FIRST CONTACT as a show pilot, two villagers
    // react in their own voices, and the overlay's growth is said aloud
    // (canon: the System overlay grows with cooperation scale). Called after
    // stageFirstAccord stages; the Regional Dawn keeps its thunder.
    _sdFirstAccordMoment(link) {
      var d = this._sd();
      if (d.firstAccord) return false;
      d.firstAccord = { day: this._sdDay(), via: 'moment' };
      var v1 = this._sdVillager();
      var v2 = this._sdVillager(v1);
      if (this._sdSystemUp()) {
        this.say(`◈ SYSTEM: "FIRST CONTACT, people! Do you KNOW what this is? This is the PILOT for a whole new SHOW. Two fires! One story! The cameras are already fighting over angles — smile, little fires, you're SOMEBODY now."`);
      }
      if (v1) this.say(`${this._sdName(v1)}: "We're not alone anymore. They know our NAMES."`);
      if (v2) this.say(`${this._sdName(v2)}: "They're watching what we do FIRST. So let's do it right."`);
      this.say(`The System's overlay stretches — new edges, new names. Coordination layer: warming up. It'll be ready when the bond is.`);
      try {
        var ids = (typeof this.npcIds === 'function') ? this.npcIds().slice(0, 4) : [];
        if (ids.length && typeof this.seedGossip === 'function') this.seedGossip('firstaccord', { brave: 4 }, ids);
      } catch (e) {}
      var onm = 'another fire';
      try { onm = this._ovName(link ? this._linkOther(link, HOME) : HOME); } catch (e) {}
      this._sdNote('scale', 'The first accord: Haven bound to ' + onm + '. The village felt it.');
      return true;
    },

    // ---------- DAILY ----------

    // scaleDiscoveryDaily: every pointer is checked daily; each fires on its
    // earned state, once. Wired into hierarchyDaily via chain-safe wrap below.
    scaleDiscoveryDaily() {
      try { this._sdKnockNudge(); } catch (e) {}
      try { this._sdHungerNudge(); } catch (e) {}
      try { this._sdVillagerMention(); } catch (e) {}
      try { this._sdTravelerRegion(); } catch (e) {}
      try { this._sdTravelerRealm(); } catch (e) {}
      try { this._sdWhisper(); } catch (e) {}
      try { this._sdNextAct(); } catch (e) {}
      try { this._sdNation(); } catch (e) {}
      try { this._sdNationEcho(); } catch (e) {}
      try { this._sdNationalBeatEcho(); } catch (e) {}
      try { this._sdTable(); } catch (e) {}
      try { this._sdFeltTime(); } catch (e) {}
      // THE MOMENT SURVIVES (accord): if the first gesture died unmade with
      // its link, the moment flag clears so the next link restages it —
      // mirrors hierarchy.js's the_moment_survives.
      try {
        var d = this._sd();
        if (d.firstAccord && this.state.accordUnanswered && !this.state.pendingAccord) {
          delete d.firstAccord;
        }
      } catch (e) {}
    },
  };

  for (var k in methods) G[k] = methods[k];

  // ---------- WRAPS ----------

  // hierarchyDaily: the discovery beats ride the existing daily tick.
  // Chain-safe: the original runs first, discovery after, failures contained.
  var _hierarchyDaily = G.hierarchyDaily;
  if (typeof _hierarchyDaily === 'function') {
    G.hierarchyDaily = function () {
      var r = _hierarchyDaily.apply(this, arguments);
      try { this.scaleDiscoveryDaily(); } catch (e) {}
      return r;
    };
  }

  // stageFirstAccord: the first real step toward regional gets its moment.
  // The original stages the gesture; the moment layer fires after, once.
  var _stageFirstAccord = G.stageFirstAccord;
  if (typeof _stageFirstAccord === 'function') {
    G.stageFirstAccord = function (link) {
      var r = _stageFirstAccord.apply(this, arguments);
      try { if (r && typeof this._sdFirstAccordMoment === 'function') this._sdFirstAccordMoment(link); }
      catch (e) {}
      return r;
    };
  }
})();
