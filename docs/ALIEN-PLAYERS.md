# ALIEN PLAYERS — the strangers who play (Steve 2026-10-07)

Late-game sentient aliens who impersonate humans and come to play — as
contestants, not as monsters. They are the people behind "a stranger" in
the death records. Written 2026-11-07 (Loop B arm sim-alienplayer-canon-b)
to close the canon gap named in evidence/2026-11-07/sim-arena-b.md: the
system was implemented and coherent but described nowhere except
docs/ONTOLOGY.md. Every claim here traces to code or that evidence —
see the trace table in evidence/2026-11-07/sim-alienplayer-canon-b.md.

## Steve's design, in his words

Recorded in the module header (src/js/alienPlayers.js, 2026-10-07) —
**not** in docs/godpath/STEVE-ANSWERS.md, which says nothing about alien
players:

> "They should be impersonating humans but with full ability sets and
> alien technology they shouldn't have. There should be an exclusive
> pool for this set."

The standing rule, from the same header and docs/ONTOLOGY.md: **they
impersonate HUMANS, not monsters.** Exclusive pool, separate spawn logic,
separate from the monster table. Monsters stay monsters.

## What they are

Eight alien players (see roster below) who have come to Earth to play the
game the System is running — as players, with full ability kits, alien
tech, memories of past encounters, and their own reasons for being here.
They look human, fight like players, and carry technology that breaks
the rules humans live by. They are PEOPLE: they remember you, escalate
or soften, speak in their own voice, and stay dead when killed.

**Count correction.** Earlier evidence (sim-arena-b and its prereg, and
the 2026-11-07 round note) said "twelve alien players." No code, data,
or canon source supports twelve: the only persona source,
src/data/alienPlayers.json, holds **eight** entries, and `apPersonas()`
returns exactly that file. Eight is the roster unless Steve says
otherwise (see Open questions, Q1).

## The roster — eight players, three dispositions

Source: src/data/alienPlayers.json (the only persona source; loaded as
`this.data.alienPlayers`, game.js). `combat` is the flag that decides
who can fight you.

| Player | Title | Disposition | Species | Wealth | Fights? |
|---|---|---|---|---|---|
| Vex Marlowe | Trophy Hunter, Third Dynasty | sadistic | Vexari | rich | yes |
| Countess Sable | Collector of Despair, Meridian Court | sadistic | Meridian | rich | yes |
| Rax "The Dentist" | Pain Enthusiast, Unlicensed | sadistic | K'thari | rich | yes |
| Pip Quindle | Extreme Tourist | neutral | Burlap | broke | yes |
| Sarge | Veteran, K'thari Expeditionary (Ret.) | neutral | K'thari | comfortable | yes |
| Dr. Fenwick | Xenobiologist, Meridian Institute | neutral | Meridian | comfortable | yes |
| Wren | Student, Vexari Exchange Program | benevolent | Vexari | broke | **no** |
| Old Tam | Retired Hunter, K'thari | benevolent | K'thari | broke | yes |

The three dispositions are the design's three attitudes to the game
(module header; motivations in alienPlayers.json):

- **Sadistic — pay-to-play trophy hunters.** Theatrical, cruel,
  escalating. Vex wants the perfect kill, prolonged and memorable;
  Sable collects moments of despair; Rax studies pain, not death.
- **Neutral — here for the experience.** Unpredictable, not cruel. Pip
  is the extreme tourist who wants all of it; Sarge wants an honest
  fight, skill against skill; Fenwick wants to understand how humans
  fight and think.
- **Benevolent — think the games are wrong.** Help secretly, deniably.
  Wren never fights — her avatar is non-combat; she acts only through
  dead drops and warnings. Old Tam is the atoner: he throws fights,
  quietly, because the System is watching.

**Wealth is character, not decoration.** Broke personas retreat when
losing (they cannot afford another body); rich personas never retreat
and enrage when hurt (death is an inconvenience — they buy a new body).
That is why the same fight feels different against Pip and against Vex.

## Where they appear — only the verified places

**In the wild (the main way you meet them).** After the System arrives
and wave 2 is unlocked, the encounter phase takes a SEPARATE roll for
the alien pool after the monster phase (`checkEncounter` wrap,
encounters.js) — it never competes with monsters for the same tile, and
it never fires on a safe tile or while a fight is already running. The
roll is 8% per eligible crossing (15% when a sadistic rival is due);
a due rival is picked 60% of the time, otherwise the pick is weighted
sadistic 4 / neutral 4.5 / benevolent 1.5, doubled for a persona you
have already met, tripled if they have you tracked. Sporting rules:
at least 2 days between hunts by the same persona, and the dead never
hunt. Nothing spawns them until a readiness score passes 100 — party
(25 per ally), threat rating, day 30+, System integration, and
beam-resistant gear you already own all count. The gate's own comment
says the point plainly: "don't spawn alien players until the player has
at least a slight chance with a party."

**In groups (late game).** Day 40+, once you have met at least 2
personas twice each, a 3% roll can bring 2–3 of your established rivals
at once, at most once per 14 days. They arrive one at a time — the
first fights you, the rest join in turn through the fight-end chain —
and they talk to each other, not just to you (group banter, gated on
the reveal like everything else).

**In the playground (off-screen, between fights).** Active aliens
persist for days: at most 3 active at once, at most 1 new one per 4
days. While active they live in the world without you watching — they
kill villagers, monsters, and animals, burn map (Sable and Vex),
raid pantry, fire, and trust (the veterans), and fight each other.
Factions coordinate loosely (sadistic 70%, benevolent 90%, neutral
opportunistic); sadistic and benevolent never align. You hear about an
activation only through the System feed, and pre-reveal it says "a
stranger has entered the game," never a name.

**In contests — meddling only, never as opponents.** No contest code
builds an alien-player fighter, so they never fight in a contest.
Their contest role is interference through `apContestInterference`:
they rig (a favor-weighted lean on the outcome) and, for the player
only, they can save a life — the benevolent lifeline fires at the
player's own killing blow in a contest, and at an arena loss, turning
death into a loss with the player barely alive (7-day cooldown). A
villager's played death is never converted by a hidden roll. Fan favor
(-100..100, four per-lane clubs — fight, survival, social, showbiz)
shapes care packages and the contest lean; a loud club (25+) may vote
a small favor, at most once per 5 days. See docs/CONTESTS.md for the
fan-club side; docs/FANS.md for the audience faces, who are not
players and never fight.

**Around the edges.** Dead drops (at most 1 per 3 days, Wren's channel),
the System feed (at most 1 per day, and it can slip and name a persona
— one of the reveal paths), care packages, village gossip, NPC contacts
(a contacted villager can be warned), and the Codex (below). Benevolent
help is always deniable and subtle.

## How a fight works

`apStartEncounter` places the fighter 3–4 tiles away — they approach,
they do not ambush from adjacent — and says the treeline lines out
loud: "A figure steps out of the treeline. Human-shaped. But
something's wrong." / "They move like someone who's done this before.
Many times. On many worlds." Then `startAlienCombat` (encounters.js)
builds the turn-based fight directly — **it never calls
`Game.startCombat`**. That is a mechanism with a real consequence:
fight instruments that wrap `startCombat` see the fight end (the
fight-end hook is shared) but never see it start, so alien-player
fights carry no fight row — no rounds, no HP fractions — while being
fully real in the engine (evidence sim-arena-b; sim-findings fix
2026-10-24). Party villagers within 4 squares join, nearest 4 at most,
the same shape as a monster fight.

The fighter `apBuildFighter` builds (alienPlayers.js):

- `kind: 'hostile'` — "NOT a monster — this is a person" — with
  `alienPid`, a human emoji, and `ai: 'adaptive'`.
- HP 80 + 10 per past encounter with that persona; sadistic +20, Pip
  −20, Old Tam capped at 70 (he holds back deliberately).
- A 6-ability kit that fits their style (data-driven from
  alienPlayers.json), grown progressively from 3 toward 6 as they
  keep meeting you; rich personas progress faster (they buy upgrades),
  broke ones slower (they earn them).
- Alien tech, 1–2 pieces each (Vex: phase-net, trophy scope; Sable:
  dread projector, crystal lattice; Rax: nerve mapper, stasis field;
  Pip: tourist cam; Sarge: veteran plate; Fenwick: specimen scanner;
  Old Tam: deliberately none — he fights fair). Tech is what makes
  them scary: the stasis field prevents fleeing, the dread projector
  makes fear hit harder, and the beam is the signature — see below.
- Their own turn logic (`tbAlienTurn`): windup, heavy burst, recovery,
  with telegraphed grid highlights — not the monster turn, not the
  villager-betrayal turn.

**Beams.** Alien beam damage bypasses normal armor entirely — only
beam-resistant gear helps. With no resistant pieces a beam is nearly
instantly lethal (90–110% of max HP); each piece multiplies the damage
by 0.7, so a full five-piece set takes it to ~17%: hard but fair.
This is the loop the armor-salvage rule below exists to close: kill
one, take their armor, survive the next one's beam.

## The name is the knowledge gate

Pre-reveal the fighter is named **`Stranger`** — in the fight, in the
feed, and in the Codex (entry title `stranger`, name `someone`,
species and disposition `unknown`). The word "alien" never appears in
player-facing copy pre-reveal, and neither do persona names — there
are no cover names in the data, so names ARE the alien truth and every
naming site gates on `apKnowsAlien`. That is "if you don't know, it
doesn't show" working as designed: the village buries a scholar killed
"by a stranger" because the village does not know who did it, and the
game refuses to name them to the player either, because the player has
not earned the reveal.

**The four reveal paths** — the complete set; these are the only
`apRevealAlien` call sites in the code:

1. **Third encounter with the same persona** — "you recognized the
   fighting style." Pattern recognition, earned by surviving them
   twice.
2. **The System feed slips** — "the System feed named them."
3. **Stripping alien armor off a body** — "you stripped their armor."
   The item is literally named "Alien \<piece\>", so the reveal is
   the loot.
4. **Spotting Wren at a dead drop** — "you spotted her leaving a
   cache." Only for Wren, who never fights and so had no reveal path
   until this one was added: after 3+ of her dead drops, 25% per drop.

On reveal the game says so out loud ("You understand now: that wasn't
human. That was \<name\> — \<title\> — wearing a person like a suit.")
and the Codex entry catches up: `identified` once known, `understood`
once known with 5+ encounters, with the persona's backstory and
motivation written in. Before that, the Codex entry's note is suspicion,
never conclusion: "A stranger crossed you out in the wild. Moved wrong
— too smooth, too practiced. You can't place why."

## After the fight

- **They remember.** Every fight writes the met record: encounters,
  last outcome, last day, bond. They escalate or soften on the
  strength of it, and the next fight's HP already counts the last one.
- **Death is permanent.** A persona killed in combat stays dead:
  `rec.dead` plus the day, released from the playground, named honestly
  once (knowledge-gated — "The stranger goes still" pre-reveal, the
  name post-reveal), then excluded from EVERY pool — encounters,
  activation, groups, packages, dead drops, feed, rigging, lifelines,
  gossip, duels. Duel losers who cannot afford another body die too
  (the rich "come back"). The Codex keeps the entry and records the
  fate ("dead — killed on day N"). People stay dead, like villagers.
- **Armor salvage is kill-only.** Defeating one lets you strip their
  armor (alien helm, carapace, greaves, gauntlets, boots) — the only
  source of beam-resistant gear. A broke persona who retreats ends the
  fight as your win — you drove them off — but leaves no body to
  strip: no meat, no trophy, same honesty as a routed monster.
- **The death record says "a stranger", never "an alien."**
  `tbFightDeathCause` (game.js) reads a hostile fighter with
  `alienPid` as `'a stranger'` — the branch comment is explicit that
  the cause must not leak a truth the player has not learned. A
  scholar who loses to one is buried as killed by a stranger; the
  fallback for an unclassifiable loss is `'the arena'`, never
  `'a stranger'`, so the cause is a real person-kill, not a default.
- **They speak after.** A persona who loses speaks their defeat lines;
  one who wins speaks their victory lines; a killed persona speaks
  nothing — the death beat replaces it. (The mapping was inverted
  until break-it 2026-10-10 r12; the code now matches the doc.)

## What they are not

- **Not monsters.** Separate pool, separate spawn logic, separate
  fight path, human fighters. Never conflated in code, comments, or
  rules — the same class of law as monster tiers ≠ loot tiers.
- **Not fans.** docs/FANS.md covers the audience: named alien fan
  personas with arcs who watch, cheer, and send care packages. Fans
  never enter combat; players never sit in the crowd. The four fan
  clubs are audience segments, not the player roster.
- **Not the road stranger.** A different "stranger" system teaches
  skills on the road ("A stranger by the road knows things…"). The
  word is overloaded in the game; the death cause `a stranger` is
  specifically the alien-player branch (evidence sim-arena-b). See
  Open questions, Q2.
- **Not contest opponents** (above) and **not the galactic cast.**
  A separate registry tracks five of them as recurring cast across
  layers (galactic-cast.js); it is a different layer from the
  encounter pool, not another way to meet them.

## Open questions (for Steve)

Mirrored in docs/OPEN-QUESTIONS.md. Defaults in place are the code as
it stands today.

**Q1 — Is eight the intended roster, or should the pool grow?**
Default: eight personas in src/data/alienPlayers.json. Earlier
evidence said twelve, but no code, data, or canon source supports
twelve. If twelve was the design, four personas were never built (or
were cut); if eight is the design, the evidence needs the correction
and nothing else changes. Lever: src/data/alienPlayers.json (data
first, per repo rule).

**Q2 — The word "stranger" is overloaded: road teacher vs alien
killer. Intended?** Default: both systems keep the word — the road
stranger teaches, the alien player kills, and only the death cause
`a stranger` names the killer. If the overload is a problem, the road
encounter is the one to rename (the alien branch is load-bearing:
death records, Codex, and knowledge-gating all key off it). Lever:
the road-stranger encounter copy (encounters.js road text) — a prose
change, not a system change.

**Q3 — Should alien players ever fight IN a contest, or is
meddling-only the design?** Default: meddling only — they rig
outcomes and can lifeline the player, but no contest code builds an
alien-player fighter, so they never appear as contest opponents.
Blood contests stay monster-vs-human and human-vs-human. If Steve
wants them in the arena as opponents, that is a new wiring task
(contest arena specs + `apBuildFighter` as an opponent source), not a
tuning change. Lever: docs/CONTESTS.md arena specs + contests.js
`_contestArena`.
