# sim-supply-b — the wave-4 ammo-supply blank, measured (DIAG-GO)

Run: Loop B worker, arm sim-supply-b, axis scale-onramp. DIAG ONLY:
zero game-code change, zero policy-default flips, no edits to existing
policy files. The deliverable is a landed instrument + this evidence.
Worktree branch: sim-supply-b. Base anchor: 7a297468408c (worktree HEAD;
the sweep records its own anchorCommit per seed — all 16 seeds report
7a297468408c).
Pre-registration: evidence/2026-10-31/sim-supply-b-prereg.md (written
BEFORE any judged sims; judged against it below).
Instrument: scripts/ammo-diag-20261031.js (AMMODIAG=1, read-only,
det-gate proven by sim-ammo-a) PLUS scripts/supply-diag-20261031.js
(SUPPLYDIAG=1, read-only: pile + ammoCraft pre/post on every pocket
call, daily raw-pile snapshot from the sweep's daily hook).
Sweep: scripts/supply-sweep-20261031.js. Analyzer:
scripts/supply-analyze-20261031.js.
Proof: scripts/test-supply-20261031.js — 19/19 green (three-way
det-gate: 60d trajectories identical with no instrument, AMMODIAG-only,
and AMMODIAG+SUPPLYDIAG; static read-only scan; wrap fixtures;
real-sweep gate byte-identical re-run).
Corpora: evidence/2026-10-31/perseed-supply-b/baseline/s85101–s85116.json.
No [needs-eyes] (measurement only; nothing player-facing ships).
Panel (§15): NOT APPLICABLE, none fabricated — same rationale as
sim-ammo-a Stage 1 (policy-comparison driver; cannot express this
substrate; this arm has no before/after comparison at all). The judge
is the pre-registered census + band-verdict bar.

## Verdict: DIAG-GO (judged exactly against the prereg)

1. Census completeness 30/30 wave-4 fights (100%, bar >= 95%), zero
   pile-null days on any seed, zero instrument errors on both
   instruments (0/0 on all 16 seeds).
2. The band verdict names ONE binding supply block — STICKS — with the
   per-weapon split and supply-side class below, and states what
   would have to exist for arrows to exist at all (a source, a path,
   a call — named separately).
3. The sling-stone step is named: step (i) no pocket call (7/7 sling
   fights); steps (ii)-(iv) are refuted band-wide (below).
4. Sense test done, wall numbers stated honestly.
DIAG-GO. Re-baseline note (observed, not assumed): per-seed fight
identity — day, vid, monster, outcome — matches sim-ammo-a's baseline
corpus on all 16 seeds despite the anchor moving f52f08600 ->
7a2974684, so the numbers below reproduce ammo-a exactly (30 fights,
14 ranged, outcomes evade 3 / vDie 7 / vFlee 20, wall 8/12/11).
The prereg deliberately did NOT claim this reproduction; the evidence
reports it because the comparison was run and it held.

## The answer, in plain words

If the village were ordered to arm every ranged fighter tomorrow, the
supply step that blocks it first is STICKS. Not stones, not craft
knowledge, not the craft roll, not the pocketing code. There is no
stick in the village pile on any day of any seed in the band — ever.
An arrow needs 2 sticks + 1 stone + 1 fiber; a bolt needs 2 sticks +
1 stone. With zero sticks, neither recipe can even be attempted, so
no arrow or bolt is ever produced in the band: 0 craft attempts, 0
craft successes, 0 arrow/bolt units in any fighter's pack or own
stash at the end of any seed, 0 arrow/bolt units touched by any of
the 102 pocket calls. The class is "never produced" — not
"produced but never carried" and not "carried but spent". Nothing
was produced to carry, and nothing was carried to spend.

Fiber is the SECOND block, for arrows only: fiber is also zero on
every day of every seed, so arrows would still fail even if sticks
appeared. Bolts do not need fiber — bolts are blocked by sticks
alone. Stones are not a block at all: the pile holds 15–848 stones
per seed, and sling pocketing works when it is called (9 of 11 sling
pocket calls took stones; the 2 that did not are an early pile-empty
day and an already-at-cap fighter — both honest code behavior, no
contradiction).

Two independent blocks keep bows dry, and they must not be blurred.
Ammo-a proved the CARRY block: the fighters who meet wave-4 beasts
never depart, so departure-only pocketing never calls them (14/14
dry fights here also have 0 pocket calls and 0 departures; first
seen with their weapon 5–19 days before the fight, except one
founder sling from day 2). This arm proves the SUPPLY block: even if
a pocket call reached a bow fighter, the craft would fail on sticks
(36/36 bow pocket calls band-wide were material-blocked at the
recipe check — 15 on stick alone, 21 on stick+fiber — and never
reached the craft roll, so there are no blind-roll failures to
count either). A sling volley needs only the call fixed (stones are
already piled). A bow volley needs the source fixed AND the call
fixed. Fixing only one leaves bows dry.

What would have to exist for arrows to exist at all, in order:
(a) A SOURCE: a villager routine that brings sticks (and fiber, for
arrows) home into the communal pile. Today no villager task, inflow,
loot, or trade does this (source audit below). Branch is not a
stick and wood logs are not sticks in the recipe system — the pile
holds 37–85 branches per seed and still crafts nothing.
(b) A PATH: already exists. Pile -> villagerPocketAmmo craft attempt
is wired code; it simply never gets past its materials check.
(c) A CALL reaching home fighters: does not exist today for the
fighters who meet beasts (departure-only pocketing; ammo-a's
finding, confirmed here). A future fix must supply the source
through a real routine and the call through sensed contact — NOT
through a roster/list-fed shortcut (perception law, Steve
2026-10-28; see §Perception law).

## Pilot + confirm

Pilot (85101–85108): 6 wave-4 fights, 3 ranged, census 6/6, errors
0/0 — pilot pass under the prereg (completeness >= 95%, zero errors,
fights > 0), so the confirm ran. Confirm (85109–85116) adds 24
fights, 11 ranged. Band total 16 seeds, 30 fights. One clustering
caveat, stated plainly: 21 of the 30 fights (10 of the 14 ranged)
sit on a single seed, s85109. The fight-level verdict leans on that
village — but the supply verdict does not: pile stick = 0 and fiber
= 0 hold on all 16 seeds independently, on every daily snapshot, so
the "never produced" verdict survives any single seed.

## Band numbers

- Wave-4 field fights: 30 (evade 3, vFlee 20, vDie 7, vKill 0,
  drive-offs 0). Ranged: 14, volley shots 0, volley damage 0.
- Per weapon (all supply class never-called-never-produced):
  crossbow 3, sling 7, crude_bow 4. No plain 'bow' wave-4 fight.
- Callers: resolveWildMonsterEncounter 5, aidFight 9 (home/node
  meetings, as in ammo-a; 0 expeditionMonster ranged fights).
- Pile at fight time, all 14 ranged fights: stick 0, fiber 0,
  stone 168–465.
- Daily pile trajectory, per seed (16/16): stick ever>0 NEVER, max
  0, 0 days positive; fiber ever>0 NEVER, max 0, 0 days positive;
  stone max 15–848 (positive from day 2–5 onward); branch max 0–85.
  Pile-null days: 0 on every seed.
- Pocket calls band-wide: 102 total. Bow calls 36, all
  material-blocked (stick 36, fiber 21 — fiber counted only on the
  21 arrow calls; the 15 bolt calls are stick-only, as the recipe
  says). Craft attempts 0, craft successes 0. Sling calls 11, took
  stones 9. Bow calls with any carried gain: 0. Pocket calls
  touching any arrow unit: 0; any bolt unit: 0.
- Sling-step breakdown for sling FIGHTS (7): (i) no pocket call 7,
  (ii) call took stones 0, (iii) capped 0, (iv) zero-take with pile
  positive (contradiction) 0. Band-wide sling CALLS (11) confirm
  the mechanism is not the stone step: 9 took stones, 1 failed on
  an early empty pile (s85102 day 5, pile stone 0), 1 was already
  at the 6-stone cap (s85104 day 111, pile stone 738).
- Own stash at fight time, all 14 ranged fighters: 0 of the needed
  ammo. End-of-run census, summed over 16 seeds: packs carry arrow
  0, bolt 0, stone 10; own stashes hold arrow 0, bolt 0, stone 1;
  village ammoCraft entries 0 (no vid ever has an ammoCraft record).
- Dry fighters, first seen with weapon / departures: s85106
  oliver_moore crossbow day 88 / 0, visjoin_105 crossbow day 107 /
  0; s85109 app_mgpspisb887 sling day 69 / 0, xavier_dubois sling
  day 72 / 0, sanne_bakker crude_bow day 80 / 0; s85112
  vasyl_shevchenko sling day 2 / 0. (Days are first-scan days, so
  "day 2" is a founder; the rest picked their weapon up days
  before the fight and still never departed.)

## Stick/fiber source audit (static code read, measured against the band)

Pile writes in code, exhaustively (grep of materials writes):
- 'stone' villager duty (game.js): +1–2 stone per task into the
  pile. MEASURED: stone present from day 2–5, up to 848. This is
  why slings have a reservoir.
- Storage inflow wrap (storage.js npcBatchTurn wrapper, open
  village, 6% per batch): branch/wood/bark/vine/hide ONLY, 1–3
  units. MEASURED: branches 37–85 per seed; stick/fiber never
  appear — correctly, since the wrap's material roll never yields
  them. This is the closest thing to a "villagers bring stuff
  home" routine, and it structurally excludes both arrow materials.
- Scholar donateMaterial (storage.js): player-UI only. No policy
  calls it (grep of scripts/policies/ is empty). MEASURED: in this
  policy-driven band the scholar never donates sticks/fiber —
  stick/fiber stay 0 all band.
- Betrayal stockpile line (betrayal.js): +4 fiber on one narrative
  branch. MEASURED: never fires in this band (fiber stays 0 on all
  1,600+ village-days; nothing ever consumes pile fiber, since no
  craft ever runs, so a firing would have shown).
- Scholar-only gains that never reach the pile: clearBrush gives
  the SCHOLAR 1–2 fiber (addMaterial = scholar inventory, not
  pile); scholar forage deadfall gives the SCHOLAR sticks; the
  carexplore fiber +2 is scholar-side. Villagers have no equivalent
  deposit path — no villager routine calls donateMaterial, no
  villager craft for arrows exists anywhere (no villagerCraft /
  npcCraft path), and no loot/trade path produced an arrow or bolt
  unit in this band.
- No branch->stick or wood->stick conversion exists in code.
  (Whittle makes a sharpened_stick weapon from the village WOOD
  pile, a different item, not recipe sticks.)

## Sense test (SENSE-TESTING LAW)

Read three dry-fight transcripts. The game is HONEST about the
empty weapon — it never pretends a volley happened:

s85109 d91, xavier_dubois, sling vs eulogy, vDie, volley 0/0/0:
"Xavier has Sling but no arrows — the string stays drawn, useless."
Then the fight proceeds in melee/trick terms, and Xavier dies to
the Eulogy's strikes. No shot is narrated.

s85106 d93, oliver_moore, crossbow vs reunion, vDie, volley 0/0/0:
"Oliver has Crossbow but no arrows — the string stays drawn, useless."
Then: "R1: Oliver strikes for 19", gear absorbs, monster hits for
43 twice, Oliver dies. The crossbow is never fired in the text —
the "strike" is a melee strike, and the opening line already told
the reader the ranged weapon is useless.

s85109 d88, sanne_bakker, crude_bow vs eulogy, vFlee, volley 0/0/0:
"Sanne has Crude bow but no arrows — the string stays drawn,
useless." Then trick play ("contradicts the narration") and a
retreat ("they run while running still works"). Coherent: the bow
is dead weight, the fighter survives on the Eulogy's trick instead.

One narration nit, filed here for the coordinator's backlog (not
edited into the shared findings file from this worktree, to avoid
racing the sibling loop): the dry line says "no arrows" for EVERY
ranged weapon — including the sling, which shoots stones, not
arrows. The honesty is real, but the label is wrong for slings: a
sling fighter's missing ammo is stones, and the pile by the door
holds hundreds of them. "The string stays drawn" is likewise a bow
image pasted onto a sling. Small wording fix, same honesty
principle — name the actual missing ammo per weapon.

## Wall numbers (honest)

National 8/16, table reached 12/16, wins 11/16, wave 4 unlocked 9/16,
wave 5 unlocked 0/16, median survival 111 days, max 139 days.
Structural caveats: these are the SAME numbers as ammo-a because
the trajectories reproduce exactly (see verdict note); the
table/win flags are the policy stack's fullseat-diag substrate
flags, not a claim that the table is winnable in ordinary play;
wave 5 stays 0/16 either way. Arc II/III/IV reach, four-realm
formation, trap acquisition by source, counter discovery/counter-
kill rates, and young-link succession survival are NOT instrumented
in this substrate and are NOT reported — the per-seed JSONs carry
no Arc/four-realm flags, and inventing them would be fabrication.
Death-cause shares beyond fight outcomes (vDie 7/30 fights) are not
claimed: the deaths rows in the JSONs are a sampler, not a census
(same caveat as ammo-a).

## What the village looked like, in plain words

A village that owns crossbows, crude bows, and slings, sits next to
a stone pile hundreds high, and has a working rule for handing out
stones and a working recipe for arrows — and still cannot make a
single arrow, because nobody ever brings a stick home. The stone
duty brings stones. The open-village inflow brings branches, logs,
bark, vine, and hide. Nobody brings sticks; nobody brings fiber.
The scholar can pick up both in the wilds, but the scholar's pack
is not the village pile, and the policy scholar never donates them.
So the bow fighters who get jumped at home carry a beautiful,
useless weapon, the game says so out loud ("the string stays
drawn, useless"), and they fight with their hands or die. The
sling fighters are the crueler case: their ammo is RIGHT THERE,
hundreds of stones in the pile by the door, and they still walk
out empty — not because stones are missing, but because nobody
ever hands them one before the beast arrives.

## Perception law (Steve 2026-10-28)

No roster/list-fed fix is proposed. What must exist is named as
routines and sensed contact only: a villager routine that gathers
sticks/fiber and brings them home (the way the stone duty brings
stones, or the inflow wrap brings branches — a real outing with a
real return, not a query over who needs what), and a call that
reaches a fighter through a moment the fighter actually passes
through at home (ammo-a's dawn top-up was killed on trajectory
divergence, not on principle — any retry must survive that
measurement problem). A fix that scans a roster for "fighters
needing ammo" and teleports it to them would violate the law and
is not recommended here.

## Metric review (for the NEXT run, never a re-score of this one)

1. The prereg said trajectories were NOT claimed identical to
   ammo-a's corpus (base moved). They turned out identical on all
   16 seeds. Future runs on this substrate may verify
   re-baseline reproduction the same way (per-seed fight identity)
   before claiming it — the claim held here, but it is a check,
   not an assumption.
2. The sling-step metric was defined over FIGHTS, but steps
   (ii)-(iv) only became observable through band-wide CALLS (the
   7 sling fights were all step (i)). Future supply runs should
   pre-register the band-wide call breakdown alongside the fight
   steps, as was done ad hoc here.
3. Precision on "never": the daily pile snapshot is taken once per
   day (after the policy daily hook), so the strict measured claim
   is "never positive at any daily snapshot, on any of 16 seeds,
   plus stick 0 at all 36 bow pocket-call moments and all 14 fight
   moments". A transient intra-day positive (gained and spent the
   same day) cannot be fully excluded by snapshots alone — but no
   craft ever ran to spend it, and no pocket call ever saw it, so
   a hidden transient would have to appear and vanish without
   touching any recorded path. The "never produced" verdict does
   not rest on snapshot timing alone.
4. The sense-test nit (sling called "no arrows") is a wording
   observation from 3 transcripts, not a measured band rate. A
   future narration pass should count the dry line by weapon
   before changing it.
