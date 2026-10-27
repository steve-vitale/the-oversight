# sim-ammostorage-a — storage-level ammo census (axis scale-onramp)

Run: flesh-out loop, run fleshout-20261026T2317Z, arm sim-ammostorage-a.
DIAG / MEASUREMENT ONLY — zero src/js changes, no default flips, no
combat/volley/party code changes, no lever proposal. A measurement
that answers the question is a complete result.
No [needs-eyes]: measurement only (re-checked at close).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft). No design is invented here.

Question (blank from sim-volley-a, run fleshout-20261026T2141Z):
no fighter in 1179 field fights carries a single ammo unit at fight
time — but the volley-a recorder saw only the fighter. Does ammo sit
in village storage and never reach a fighter's pack? Do NOT claim a
supply failure until storage is measured — measuring storage IS this
arm. Pre-registration (binding, written BEFORE sweeping):
evidence/2026-10-26/sim-ammostorage-a-prereg.md.

## PRE-REGISTRATION SUMMARY (judged exactly as written)

- Substrate: tableseat-nowait, seeds 73671–73678, 180d death-aware
  horizon. Re-baseline FIRST against the 1920Z band table. Armed:
  tableseat-nowait + ONE new observational recorder
  (scripts/policies/ammostorage-diag.js, AMMOSTORAGE=1).
- Code-grounded storage landscape (read from src/js before sweeping):
  the volley counts ammo ONLY from the fighter's own items; the
  pantry is food-only by construction; the stash has NO ammo section
  (isStashableWeapon requires class 'weapon'); the one communal
  reservoir that doubles as ammo is materials.stone (sling ammo);
  individual ownership (Steve 2026-10-09) means personal stashes are
  never communal; gear-up fetches weapons/armor from stashes but no
  code path moves AMMO from any reservoir into a pack; crafting
  recipes exist (arrow: 2 stick + stone + fiber, makes 5; bolt:
  2 stick + stone, makes 5); starting pools carry zero ammo.
- DIAG-GO iff fight-time census rows for >= 95% of field fights AND
  100% of wave-4 fights, with the storage / carried / equipped split
  quantified per ammo type, AND a verdict naming (a) sits in storage
  never reaches packs, (b) never acquired, (c) carried but not
  equipped, or (d) no storage concept exists — per ammo type.

## RESULTS (appended after the run)
### Verdict: DIAG-GO (1179/1179 fights censused, 12/12 wave-4 fights, gates exact vs volley-a on all 8 seeds)

- G1 det-gate: PASS. Seed 73671, recorders unset == unwrapped:
  days 180, gameDays 181, ts {tsNationalDay: 107} on both sides,
  no recorder surface, no installed wraps.
- G2 recorder neutrality: PASS, 8/8 seeds identical on
  days/gameDays/ts/starvation; faced-map agreement 8/8, kill-log
  agreement 8/8 (exact entry tuples d/mid/w/by/via).
- G3 corpus integrity: PASS. 16/16 rows in
  evidence/2026-10-26/perseed-ammostorage-a/ + summary.json; every
  armed row carries field rows + 1206 daily snapshots total,
  recorder errors zero, overflow zero, noRecord zero.
- Cost bar: PASS. Armed starvation 1 <= baseline 1 + 2; armed median
  152 >= 0.8 x baseline median 152 (identical — via G2 identity).
- Detail: --detail 73672 censusMatch=true (fieldAll 162, field4 5,
  identical wave-4 gate sets on re-run).
- Proof: scripts/test-ammostorage-a.js — 161 PASS, 0 FAIL (every
  summary number re-derived from the rows, including the volley-a
  cross-check recomputed from both corpora).

### RE-BASELINE (current HEAD) — EXACT vs the 1920Z table

Band aggregates vs the 1920Z table: wins 2/8, national-ever 6/8,
national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
median 152d, deaths 307, starvation 1 — every field identical, per
seed as well as in aggregate (73671 180d/48 deaths, 73672 180d/51,
73673 124d/32, 73674 142d/won/28, 73675 180d/26, 73676 144d/won/43,
73677 152d/41, 73678 104d/38/starved 1). No base delta to carry, and
no silent absorption anywhere.

### CROSS-CHECK vs volley-a (the gate agreement the prereg demands)

Per seed, this arm's field counts, wave-4 counts, and full gate
tables (all fights AND wave-4 subset) match volley-a's published
corpus exactly — 8/8 seeds, gatesMatch=true on every seed.
Band: 1179 fights, 12 wave-4 fights, G7-fires 0, volley damage 0 —
volley-a's numbers reproduced to the fight. Gates band-wide:
G2-no-ranged-equipped 518, G6-bow-no-ammo 389, G5-ammo-field-missing
226, G0-preempt-evade 46. Wave-4 gates: G2 9, G6 2, G5 1.

### THE CENSUS — where ammo is, and where it is not

READING NOTE (stated so the numbers cannot be misread): fight-row
sums count a unit once per fight it was present at — they are
PRESENCE counts, not holdings. Holdings are the daily-snapshot
maxima (one value per day, village-wide). The evidence cites
holdings as holdings and presence as presence, never mixed.
summary.json's summed by-type fields are presence sums; its
bandStashStoneMedian (244) is the median of per-seed medians, while
the fight-row median stone pile is 189 — the evidence cites the
fight-row median (189) as the typical fight's pile.

Fighter carried ammo, all types, all fights: 0 units on 0/1179
fights. Fighter carried-but-unequipped AMMO: 0. Other persons'
carried ammo: 0 on all 1179 fights. Stash sections (tools/weapons/
medicine/armor) ammo: 0 on all 1179 fights. Pantry ammo: 0 on all
1179 fights. Scholar (player) fights: 0/1179 — the player never
field-fights on this band, so the scholar inventory is a clean
separate bucket, never overlapping a fighter's pack here.

| ammo | where it sits at fight time | where it never sits | verdict |
|---|---|---|---|
| stone | Communal pile: >0 at 1172/1179 fight moments; fight-row median 189, max 724 (per-seed maxima 101–724). Personal stashes: max 1 unit. Scholar pack: max 1 unit. | No fighter's pack, ever (0/1179). | (a) sits in storage, never reaches packs |
| arrow | Exactly 1 unit in one person's personal stash, on 2/8 seeds only (73672 from day 40, 73676 from day 1, held to the run's end). | Never carried (0/1179), never communal, never sections/pantry, never on the other 6 seeds at all. | (a)-personal on 2 seeds; (b) on 6 seeds |
| bolt | Nowhere. 0 in every bucket, every fight, every one of 1206 daily snapshots. | Everywhere — including the 122 crossbow fights that need bolts. | (b) never acquired at all |
| heartseeker_arrows, fusion_cell | Nowhere. 0 in every bucket, every fight, every snapshot. | Everywhere. | (b) never acquired at all |
| (c) carried-but-not-equipped | Rejected: 0 fighters carry ammo unequipped. The only carried-but-unequipped ranged items are 8 G6 fights (one villager, seed 73672, carrying a spare ranged weapon — crossbow + sling/phase_sling) — still zero ammo for either weapon. | — | (c) rejected |
| (d) no storage concept | Rejected as a blanket verdict: storage concepts DO exist (communal pile, sections, personal stashes, pantry) — but no section accepts ammo, and no code path moves ammo from any reservoir into a pack. | — | (d) rejected |

The G6 decomposition (389 bow-no-ammo fights, by needed ammo):
arrow 167, bolt 122, stone 100. At those very fight moments, the
fighter's OWN stash held the needed ammo on 0/389 fights. Other
persons' stashes held the needed type on 5 arrow fights and 24 stone
fights (on the arrow seeds, that is the same single stashed arrow
counted repeatedly — presence, not holdings). The communal stone
pile held stone on 100/100 stone fights. The scholar's pack held
the needed type on 3 stone fights. In plain words: the bow-no-ammo
fighter never owns the arrow their bow needs — not in their pack,
not in their own stash — while the sling fighter's stones sit by
the hundred in a pile nobody's pack ever draws from.

Fighters WITH ammo in their personal stash: 62 fight moments — and
they are exactly the fights where the fighter has NO ammo-weapon
equipped (G2 40, G5-spear 22, G6 0). The ammo in a personal stash
never matches an equipped weapon at fight time, because the only
fighters who hold stashed ammo are the ones wielding no bow at all.

Wave-4 rows, one by one (the sharpest three):
- 73673 d105, sling vs algorithm, G6: fighter carries 0 stones while
  the communal pile holds 346 stones. The volley that never fires
  for want of a stone, with 346 stones in the village.
- 73671 d176, crossbow vs suburb, G6: bolts needed, bolts zero
  everywhere on the band — not in any stash, pack, section, or
  pantry, on any day of any seed.
- 73672 d137–144, five G2 fights (herald/influencer): no ranged
  weapon at all, pile at 308 stones, and one arrow + one stone in
  another villager's stash — the village's whole arrow economy, all
  of it, sitting in someone else's space while five Mirror Draft
  fights go in unarmed-at-range.

The single-arrow villages (73672, 73676): the village holds exactly
one arrow for the entire run (daily-maximum 1, never carried, never
spent, never joined by a second). How that one arrow arrives —
starting stash vs an early craft — is NOT resolved by this arm's
rows (73676 shows it from day 1, 73672 from day 40) and is recorded
as an open micro-blank, not claimed either way.

### SENSE-TEST (NON-MEASURED replay, seed 73672 — census shape reproduced)

Replay (narration on): days 180, survived, maxWave 4, field4 = 5,
byGate G2 x5, volleyDmg 0 — the census shape, not a fresh run. The
ring holds only the last 240 lines (d178-180, endgame), so it cannot
show the d137-144 wave-4 fights directly (same ring-window limit as
volley-a). What it does show: no line in 240 lines nocks an arrow,
draws a bow, looses a volley, mentions a quiver, a sling, or a
stone as a weapon; the one monster line is the Herald as weather —
"THE HERALD fed in the night — 0 kcal gone from your stores. It is
eating the realm while you deliberate." The engine's own G6 line
(from code, the narration a G6 fight produces) is: "<name> has
<bow> but no arrows — the string stays drawn, useless."
Plain-words judgment: the narration never promises a volley it then
fails to deliver; it simply never imagines ranged combat at all —
which matches the rows exactly (a bow with no arrows is a drawn
string, not a shot). The "wave-4 defeats mourned, never taught"
blank: NOT touched by these transcripts — no mourning or teaching
lines appear in the sample — noted only, not chased.

### VILLAGERS ACTING LIKE PEOPLE (sampled from the same corpus)

- The intent to fight at range is there, twice over, with nothing
  to loose: one villager on seed 73672 carries TWO ranged weapons
  into 8 fights (crossbow + sling, or phase_sling + crossbow) and
  zero ammo for either. That reads as a person who prepared for a
  ranged fight and was failed by supply, not by courage.
- The single-arrow villages read as personal property under the
  individual-ownership canon, not a shared armoury: one person keeps
  one arrow in their own stash for the whole run while neighbours
  fight bow-less. Nobody takes it, nobody is handed it — the canon
  bans automatic redistribution, and the rows obey the canon.
  What the canon does NOT explain is why no path exists for that
  person to hand it over, or for a sling fighter to pocket stones
  from a pile of hundreds.
- The stone pile itself is the least people-like number in the
  corpus: a village that gathers stones by the hundred (pile maxima
  101–724 per seed) and sends sling fighters out with empty hands
  is not forgetful — it has no routine that connects the pile to
  the pouch. That missing routine is the blank, stated precisely.

### WALL NUMBERS (this run's judged corpora — baseline = armed, G2 identical)

Wins 2/8, national-ever 6/8, national-final 5/8, table waiting 4/8,
entered 2/8, wave-1 8/8, wave-2 8/8, wave-3 8/8, wave-4 6/8, wave-5
0/8, median 152d, max 180d, deaths 307, starvation 1, max Arc 4.
Wave-4 kills 0/8 seeds (kill log: zero wave-4+ entries). Death-cause
shares (307): villager combat 126, villager-vs-villager combat 85,
player arena 43, villager expedition 13, villager monster 8,
player dehydration 7, villager sickness 6, villager wound-that-
wouldn't-close 6, villager ambush 3, player contest 2, villager
thirst 2, player starvation 1, player lockjaw 1, villager The
Moderator 1, villager The Redactor 1, villager alien 1, villager
The Loud Beast 1. The wall did not move; this arm measured the
supply line behind one of its layers: the volley never fires not
only because fighters carry no ammo, but because the village's
whole ammo economy is one stashed arrow (two villages), a pile of
stones nobody pockets, and bolts that are never made at all.

### METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The DIAG-GO bar is judged exactly as pre-registered: coverage
  1179/1179 = 100% (>= 95% required) and wave-4 12/12 = 100%
  (required), with the storage / carried / equipped split quantified
  per ammo type (table above) and a verdict per type ((a) stone,
  (a)-personal/(b) arrow, (b) bolt, (b) heartseeker/fusion_cell,
  (c) rejected, (d) rejected). No metric was re-scored.
- Two reading notes for the NEXT run (clarifications, not
  re-scores): (1) summary.json's by-type sums are presence sums
  over fight rows (the same unit counted once per fight it was
  present at) — holdings are the daily-snapshot maxima cited here.
  (2) summary.json's bandStashStoneMedian (244) is the median of
  per-seed medians; the fight-row median cited here is 189. Both
  are correct under their definitions; the evidence uses the
  fight-row median as the typical fight's pile.
- One classifier note for the NEXT run: a future recorder should
  capture the engine's own ammo count directly rather than infer
  it from pre/post state (same note as volley-a) — here the gate
  agreement with volley-a on all 8 seeds already bounds that risk
  to zero on this band.
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms (balance-panel.js has
  no corpus-ingest mode). For this no-lever DIAG arm, leg-exact
  determinism is the comparison: baseline vs armed G2 identity on
  identical seeds, plus the volley-a cross-check (gates exact per
  seed). No panel file is produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts are
  wrong on recorder rows — standing instruction from the 0158Z
  evidence).
- check.js NOT run: zero src/js diff in this tree (DIAG arm, one
  new recorder policy + three new scripts + proof only) and sibling
  loops are live; the arm's own proof is the det-gate + G2
  identity + the 161-check proof + the detail census-match.
  node --check clean on all four new scripts.

### PROOF SCRIPTS (all in this tree, all run)

- scripts/policies/ammostorage-diag.js — NEW in this arm.
  Per-field-fight storage / carried / equipped ammo census
  (AMMOSTORAGE=1): volley gate in engine order, fighter carried +
  stashed by type, carried-but-unequipped ranged items, equipped
  ranged weapon, communal materials + stash sections + pantry +
  other-persons carried/stashed + scholar inventory, all as
  separate buckets; light daily storage snapshots (before the day's
  actions). Pure reads only — never calls stashState() (which would
  initialize defaults, a write); reads raw state.village.stash.
- scripts/test-ammostorage-diag-sweep.js — NEW in this arm. Sweep
  (--one per seed via child processes, --summary rebuild,
  --detgate, --detail, --sense). Det-gate PASS, detail census-match
  PASS (73672), sense replay done (NON-MEASURED, see above; sense
  text captured via stdout pipe — see infrastructure note).
- scripts/test-ammostorage-a.js — NEW in this arm. Proof:
  re-derives every summary number from the rows; 161 PASS, 0 FAIL.
- scripts/ammostorage-deepdive.js — NEW in this arm. Second-level
  analysis (read-only): G6 by needed ammo, own-stash-has-it split,
  bolt/heartseeker/fusion_cell absence across all 1206 daily
  snapshots, carried-ranged and scholar-fight checks, wave-4 rows,
  stone-pile distributions.

### INFRASTRUCTURE (loud, as required)

- TEE/SWEEP.LOG MISS (cosmetic): the sweep was piped through `tee
  evidence/.../perseed-ammostorage-a/sweep.log` before that
  directory existed, so tee reported "No such file or directory"
  and no sweep.log file was written. The sweep itself was
  unaffected (per-seed JSONs + summary.json written by the sweep's
  own retrying writer, 16/16 + summary present, proof 161/161);
  sweep output survives in the run's session log. Not a data loss.
- /tmp WRITE QUIRK (respected, not re-probed): per volley-a's note,
  node harness stdout is piped, never redirected to /tmp files.
  The one /tmp file in this run is a scratch python analysis script
  (ammostorage-maxcheck.py) — not a sweep output; all sweep outputs
  live in the worktree evidence dir.
- REDUNDANT SENSE REPLAY (harmless): the sense command ran the
  replay twice in one shell (grep pass + tail pass), sequentially,
  same result both times (field4 5, G2 x5, volleyDmg 0). No corpus
  impact (sense writes nothing to the corpus).
- No safe-commit refusal yet (commit step follows this file);
  the coordinator owns the --ff-only merge. No [needs-eyes]:
  this DIAG arm changes no feel, combat, or UI — that assessment
  did not change during the run.

### BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the storage-level ammo census — 1179
  fights, every bucket, per ammo type. Stone sits in the communal
  pile (median 189, max 724) and never reaches a pack; arrows exist
  only as one stashed unit on two seeds; bolts, heartseekers, and
  fusion cells are never acquired anywhere on the band.
- FILLED (measurement): the carried-but-not-equipped question —
  (c) rejected (0 fighters carry ammo unequipped; 8 fights carry a
  spare ranged weapon, still zero ammo).
- FILLED (measurement): the no-storage-concept question — (d)
  rejected as a blanket verdict (storage exists; ammo has no
  section in it and no pack-feeding path).
- CORRECTED (reading discipline, for the next arm): fight-row sums
  are presence counts, not holdings — holdings are daily maxima.
  Any future arm quoting "202 stashed arrows" from a fight-row sum
  is misreading this corpus; the village holds at most one arrow.
- DOCUMENTED, NOT FIXED (open micro-blank): how the single arrow on
  seeds 73672/73676 arrives (starting stash vs early craft) — day-1
  presence on 73676, day-40 on 73672, never spent, never joined.
- DOCUMENTED, NOT FIXED (the mechanism gap, for a future arm's
  design call, NOT this arm's proposal): no code path moves ammo
  from any reservoir — communal pile, personal stash, or scholar
  pack — into a fighter's pack. Gear-up fetches weapons and armor,
  never ammo. Whether that path should exist is a design call for
  Steve/a future arm, not a finding of this measurement.
- NOT A FINDING: no game bug was found in the volley, storage, or
  gear-up paths — the volley branch runs, the pile accumulates,
  personal stashes persist, and individual ownership is obeyed
  exactly. The fights work as designed; the village fights them
  with bows and no arrows, slings and no stones, crossbows and no
  bolts — because nothing in the village's routines ever puts
  ammunition in a fighter's hands.

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, and now the
reason has a third decomposition layer — beneath the damage desert
(w4dmg) and the equipment-and-escort desert (volley-a) sits a
supply desert with exact shelves: stones piled and never pocketed,
arrows down to a single stashed unit, bolts never made. The wall
did not move; this arm closed the blank volley-a left open, with
the split measured rather than claimed.
