# sim-awayhaven-b — away-while-at-Haven DIAG (evidence)

Run: fleshout-loop-b-20261116T0915Z (Loop B), axis winnability chain, arm
sim-awayhaven-b. Branch `sim-awayhaven-b`, worktree
`~/workspace/worktrees/sim-awayhaven-b`. Base master `796fa96ca`.
Prereg: `evidence/2026-11-16/sim-awayhaven-b-prereg.md` (commit `74152e55`,
frozen before any judged sim). Policy competent verbatim, sha256
`74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
(short `74a890f0844e`). Band 102131–102138, 150d, death-aware.
Control anchor (instrument, seed call absent): `8acd9ac2f`. Instrument
anchor (seed call re-landed verbatim): `6cc45a0cb`. Seed-call blob
`a66d45a5e` — exactly the blob the poolmarginals prereg cites.

## Verdict: GO

All five frozen GO bars pass (analyzer exit 0, proof 62/62 on the
instrument tip). The classification table is trustworthy: **6 of 6
instrument-leg flagged members classified, 16 of 16 flag rows,
UNRESOLVED 0**.

| GO bar (frozen) | Result |
|---|---|
| 1. 100% of instrument-leg flagged members classified (a)–(d) | PASS — 6/6 members, 16/16 rows, share 1.0 |
| 2. UNRESOLVED = 0, or every unresolved names its hook | PASS — 0 unresolved |
| 3. Corpus 16/16 files parse (8 control + 8 instrument) | PASS — 8 + 8 |
| 4. Proof green on the instrument tip AND green again in the off shape after the revert | PASS on tip (62/62, this run); off-shape re-run below (§Revert) |
| 5. Wall numbers reported for both legs | PASS — see §Wall numbers |

## The answer, in plain words

Nobody is lying. The away flag and the node read are both true at the
moment the dawn scorer reads them — they just measure different things.
The flag means "out on a trip" (a clock that runs for a set number of
day-parts); the node is where the person's feet are. A trip can be live
while the feet are home, in three ways this band shows:

- **Three wanderers were "on expedition" to home itself (b).** Their
  expeditions' destination tile IS Haven (4,4). They stand at home,
  the expedition clock runs, legs and finds accrue — "away" is true
  because the expedition is live, not because they left.
- **Two foragers were caught mid-step on the morning they walked out
  as guards (d).** They left Haven at dawn as someone's guard, and in
  that same dawn the game stepped them once — onto the Haven tile —
  before the scorer read them. By the next part they were back at
  their guard post. One dawn, one flicker, gone.
- **One forager walked home in the morning and the flag outlived the
  walk by a few hours (d).** His visit ended, he stepped home at dawn,
  and the away clock still had one part left to run. The scorer read
  him at home with the flag still set; the flag cleared later that day.

No member lingered after return in the frozen sense — (a) is 0. No
recorder or node-read error fired — (c) is 0. The pool's `away`
condition needs **no game fix and no recorder fix**: it correctly
excludes people mid-trip, and both readings are honest. What it needs
is a reading note: `away` is a trip-state, not a location-state. Anyone
who reads the pool as "these people are not at home" will misread
these rows — if a future consumer needs "not at home", it should check
the node, not the flag.

## Classification table (instrument leg)

Counts: (a) 0, (b) 3, (c) 0, (d) 3, UNRESOLVED 0. Flag rows are dawn
pool rows; a member can flag twice on one dawn (two holders score
them), so rows outnumber days.

| Seed | Member | Flag days (rows) | Class | Mechanism, in one line |
|---|---|---|---|---|
| 102132 | elena_petrova (forager) | 102 (1) | (d) | Departure-part flicker: guard to (5,4) at dawn, meander stepped her onto Haven before scoring; back at the post by end of day |
| 102133 | emma_larsen (wanderer) | 119,119,120,120,123,124 (6) | (b) | Expedition to the Haven tile (4,4): trips since 117 and 121, node home throughout |
| 102133 | adaeze_nwosu (wanderer) | 119,119,120,120,123,124 (6) | (b) | Same: expeditions to (4,4) since 114, 117, 121, node home throughout |
| 102133 | somchai_prasert (wanderer) | 123 (1) | (b) | Expedition to (4,4) since 120, node home days 120–122; flag at dawn 123 is the trip's last dawn (clock 12 < 13) |
| 102134 | boris_kowalski (forager) | 68 (1) | (d) | Departure-part flicker: guard to (4,3) at dawn, meander stepped him onto Haven before scoring; back at the post by part 1 |
| 102137 | gen_51ydeej (forager) | 40 (1) | (d) | Return-day: visit ended, return walk put him on Haven at dawn 40; clock read 3 parts against a duration of 4, flag cleared part 1 |

Control leg: 1 member / 1 row — gen_51ydeej (102137, day 40) → (d),
identical to the instrument leg (same trajectories on 102137; see
§Seed-call dependence).

## Dated trace lines

Trace rows are end-of-day snapshots; pool rows are dawn reads
(part 0, after the base travel pass, before the dawn scoring). The
classifier reads each flag day against the TRIP live at that dawn
(trip = one away record: sinceDay/sincePart/purpose/target), not
against a merged run of away days — the old spell reading merged
back-to-back trips and compared dawn reads to end-of-day rows, which
misclassified 4 of 6. The fix is in `scripts/analyze-awayhaven-b.js`
(`classifyMember`, trip decomposition + per-flag-day evaluation);
the proof test pins it with a multi-trip fixture, a guard-flicker
fixture, and a return-walk clock fixture (62/62).

- **elena_petrova, 102132.** d101 end: away guard →(5,3) since
  101/0 dur 3, node (5,3). d102 end: away guard →(5,4) since 102/0
  dur 3, node (5,4), objective GUARD/out, companion miguel_santos.
  Pool row d102 (holder dale_hoffman): node (4,4), away true.
  Part-level probe (seed 102132, days 101–102): at part 0 of day 102
  she departs as miguel's guard (node →(5,4)), then the same travel
  pass reaches her own roster turn and runs `objAwayStep` — already
  at the post, the at-site meander steps her to (4,4); the dawn
  scoring then reads away=true + node Haven. Part 1 steps her back
  to (5,4). Code: `objDepart` (villager-objectives.js:1383),
  `objAwayStep` at-site meander (:1684), scoring order
  (`npcNodeTravel` then `objTick`, :2289 wrap).
- **emma_larsen, 102133.** d117–120: expedition →(4,4) since 117/2
  dur 13, node (4,4), legs 0→12, finds 0→3. d121–125: expedition
  →(4,4) since 121/1 dur 20, node (4,4), legs 1→17, finds 0→2.
  d126–129: expedition →(5,5) since 126/2 dur 13, node (5,5) — the
  third trip the old spell reading merged in and blamed for the
  flags. Pool rows d119/120/123/124: node (4,4), away true, onExped
  true.
- **adaeze_nwosu, 102133.** d115–116: expedition →(4,4) since 114/0
  dur 13, node (4,4). d117–120: since 117/2 dur 13, node (4,4).
  d121–125: since 121/1 dur 20, node (4,4). d126–129: →(5,5).
  Same shape as emma, same flag days.
- **somchai_prasert, 102133.** d117–119: expedition →(7,7) since
  117/2 dur 9, node (5,5)→(7,7). d120–122: expedition →(4,4) since
  120/0 dur 13, node (4,4), legs 2→8, finds 1. d123: away null,
  node (4,4) — the flag cleared during day 123 (at dawn 123 the
  clock read 12 parts against a duration of 13). The (7,7) trip
  ended and the (4,4) trip began the same dawn; the flag at dawn 123
  belongs to the (4,4) trip, not to a linger after the (7,7) return.
- **boris_kowalski, 102134.** d67 end: away water →(3,4) since 67/0
  dur 2, returned part 2 of day 67. d68 end: away guard →(4,3) since
  68/0 dur 4, node (4,3), companion miguel_santos. Pool row d68
  (holder gen_8lcnxu3): node (4,4), away true. Part-level probe
  (seed 102134, days 67–69): identical shape to elena — depart at
  part 0 of day 68 (node →(4,3)), `objAwayStep` meander to (4,4) in
  the same pass, scoring reads Haven; part 1 steps back to (4,3).
  Day 69 part 0 the clock expires (4 ≥ 4) and he re-departs as a
  guard the same part.
- **gen_51ydeej, 102137.** d39 end: away visit →(5,5) since 39/1
  dur 4, node (5,5), target gen_j4ldf1z. d40 end: away null, node
  (4,4). Pool row d40 (holder rafael_torres): node (4,4), away true.
  Part-level probe (seed 102137, days 39–40): the node is still
  (5,5) at end of day 39; at part 0 of day 40 the visit completes
  (objective →'returning') and the return walk steps him (5,5)→(4,4)
  in one diagonal step — before the dawn scoring, after the last
  trace snapshot. At that dawn the clock reads (40−39)×4+(0−1) = 3
  parts against a duration of 4, so the flag is still live; it
  clears at part 1 of day 40. The flag day IS the return day, so the
  frozen (a) bar (flag ≥1 day after the return) does not fire.

## Sense-testing: three members as stories

**Emma — the expedition that goes home.** Emma is a wanderer. On day
117 she sets out on an expedition, and the place she is sent to
explore is Haven itself — the tile she already stands on. She spends
days 117 to 120 "away on expedition" while never leaving home: the
expedition walks its legs, finds things, counts as a trip. On day 121
she sets out again, again to Haven, for five more days. The pool
flags her away-at-Haven six times, and every flag is true twice over:
she IS on an expedition, and she IS at home. The flag doesn't mean
"gone". It means "on a trip", and this trip's destination is home.
Adaeze walks the same road beside her — same party, same tile, same
six flags.

**Elena — the guard who blinks home.** Elena is a forager. On the
morning of day 102 she walks out as Miguel's guard, to a post one
step from home. The game moves her to the post — and then, in that
same morning's work, it lets her take one wandering step while she
waits at the post. That step lands her back on Haven's own tile.
The dawn scorer looks up at exactly that moment and writes her down:
away (true — she is on guard duty) and at Haven (true — that is
where her feet are). By the next part of the day she has stepped
back to her post, and the whole thing is over. If you only read the
pool row, she looks impossible. If you watch the morning, she just
took one step sideways.

**Gen — the visit that ends at dawn.** Gen walks out on day 39 to
visit someone one tile away. He gets there, the visit happens, and
in the morning he walks home — one diagonal step, (5,5) to (4,4).
He arrives home before the village wakes, but his away flag runs on
a clock, and the clock still has one part left. So at dawn he is
standing at home, flag still set, and the scorer flags him. A few
hours later the clock runs out and the flag clears. He was never
lingering. He came home on time; the flag just needed one more part
to catch up.

## Wall numbers

Per leg (analyzer `summarizeLeg`):

| Leg | National by standing | National by rank | Table | Wins | Wave 4 unlocked | Wave 5 unlocked | Median survival | Wave-4 kills | Deaths |
|---|---|---|---|---|---|---|---|---|---|
| Instrument | 3 | 0 | 0 | 0 | 8/8 | 3/8 | 150.5d | 4 / 132 fights | 579 |
| Control | 3 | 0 | 0 | 0 | 8/8 | 3/8 | 151d | 9 / 113 fights | 559 |

Per seed, instrument leg (standing / maxWave / pool rows / v4 seeds /
deaths / outcome):

| Seed | Standing | Max wave | Pool rows | v4 seeds | Deaths | Outcome |
|---|---|---|---|---|---|---|
| 102131 | 199 | 4 | 0 | 9 | 66 | survived 150d |
| 102132 | 450 | 5 | 11 | 21 | 81 | survived 150d |
| 102133 | 370 | 5 | 12 | 14 | 72 | survived 150d |
| 102134 | 199 | 4 | 22 | 6 | 78 | village lost 96d |
| 102135 | 410 | 5 | 12 | 28 | 71 | survived 150d |
| 102136 | 199 | 4 | 13 | 7 | 44 | survived 150d |
| 102137 | 199 | 4 | 18 | 22 | 89 | survived 150d |
| 102138 | 199 | 4 | 7 | 20 | 78 | village lost 92d |

Per seed, control leg (same columns): 102131: 485 / 5 / 0 / 0 / 51 /
survived; 102132: 199 / 4 / 0 / 2 / 65 / survived; 102133: 410 / 5 /
0 / 0 / 66 / survived; 102134: 199 / 4 / 0 / 0 / 88 / village lost;
102135: 365 / 5 / 0 / 17 / 67 / survived; 102136: 190 / 4 / 0 / 0 /
34 / survived; 102137: 199 / 4 / 18 / 22 / 89 / survived;
102138: 199 / 4 / 1 / 13 / 99 / survived. Control per-seed numbers
are bit-identical to poolmarginals' control leg.

## Neutrality evidence

- **D1** (proof test): instrument tip, seed 102131, 60d, recorder ON
  twice — identical full corpus.
- **D2** (proof test): same, recorder ON vs OFF — identical
  trajectories.
- **D3** (drift smoke, `scripts/vetparty-drift-check.js` over both
  corpora): NO PRE-LEVER DRIFT. First divergences 42/35/114/41/130/
  35/—(identical)/36 vs first lever days 32/31/112/39/29/34/34/34.
  Seed 102137 is IDENTICAL across legs on every reported field.
- **Agree check** (analyzer): the replica's ranked bid agrees with
  the bid companion on all scored dawns — instrument 95/95
  classified, 0 unknown; control 19/19, 0 unknown.
- **Proof:** 62/62 on the instrument tip (this run). The off-shape
  re-run after the revert is §Revert.
- **Telemetry check:** `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-16/perseed-awayhaven-b-on/*.json' --metrics
  national,table,wins,exiled` — **REFUSED**, as the recent DIAGs
  hit: "telemetry-check: refusing recorder-corpus input: all 8
  --current rows carry top-level anchorCommit, so they are sweep
  recorder rows, not runs. Recorder corpora are compared with
  sweep-compare tables, never against a run baseline here."
  Recorded, not worked around; the baseline was not rolled on it.

## Metric review

- **Did the 5-day window catch the departure and the return?**
  Yes, for every member — no window widened. Windows are the
  default ±5 around the flag days (elena 97–107, emma/adaeze
  114–129, somchai 118–128, boris 63–73, gen 35–45). The trips are
  short (1–9 trace days) and sit inside the window; the widening
  machinery exists and is proof-tested but never fired.
- **Did the control leg flag the same members (seed-call
  dependence)?** Partly. Only gen_51ydeej flags on the control leg
  (102137, day 40, → (d) — identical class, identical trajectories,
  so the flag does not depend on the seed call at all). Elena and
  boris flag only with the seed call on: their guard departures
  happen on the instrument leg's trajectories, which diverge from
  control after the first lever day (D3: divergences day 35/41 vs
  lever days 31/39). The three wanderers flag only on the instrument
  leg too — the seed call changes which expeditions get launched
  (their (4,4) trips exist only on the instrument trajectories).
  The mechanisms themselves are seed-call-independent (guard
  departures and Haven-tile expeditions happen on both legs' code);
  which members hit them on a given band is trajectory-dependent.
- **Did any member change class between legs?** No. The one member
  present on both legs (gen) classifies (d) on both, with the same
  trip, same clock arithmetic, same evidence.
- **Is (b) one mechanism or several hiding under one label?** One
  mechanism, three instances: an expedition whose destination tile
  is Haven (4,4). Emma's two trips (since 117, since 121), adaeze's
  three (since 114, 117, 121), somchai's one (since 120) all have
  the same shape — expedition record tx,ty = 4,4, node (4,4) on
  every trip day, legs and finds accruing. No second non-spatial
  state hides under (b) here (no companion-away, no indoor-chore
  case appeared). (d) is two mechanisms under one label by design —
  departure-part flicker (elena, boris) and return-day clock lag
  (gen) — split in the per-day `mechanism` field
  (`departure-flicker` vs `return-day`).

## Base drift note (read before comparing with poolmarginals)

The instrument leg's trajectories diverged from poolmarginals'
instrument leg, because the base moved between the two arms: the
only src diffs between the bases are `conversation.js` (+10,
transcript filter, no RNG) and `villager-agency.js` (+19/−1, Loop
A's PROFILEGATE bypass), which only bites when a `party_launch`
commit exists — i.e. only with the seed call on. Consequences:
95 scored dawns here vs 171 there; 95 pool rows vs 171; 6 flagged
members / 16 rows here vs 9 / 18 there. The GO bar is judged on
THIS leg's flagged set, per the prereg (the headline classification
is on the instrument leg). The subject shifted: 4 of poolmarginals'
9 did not re-flag here (amina_diallo 102131; app_mgpsphw9529,
tom_baker, aria_thompson 102133), and somchai_prasert (102133) is
new here. The three 102133 wanderers who didn't re-flag are on
off-Haven expeditions on this leg's trajectories (app/aria to
(5,4), tom to (3,5)) — in poolmarginals' corpus their flag days
fell on expedition-to-Haven trips, so the (b) mechanism plausibly
covers their old rows too, but they are NOT classified here: the
prereg's subject is this leg's flagged set, and no claim is made
about rows this leg never produced. Amina_diallo is not on seed
102131's roster at all on this leg (0 trace rows, no death) — the
base drift changed the roster itself.

## CANON GAP (restated)

No CANON-registered doc covers the away flag's semantics, departure
gates, or the pick lottery (checked 2026-11-16 against the
`docs/CANON.md` manifest). Nothing in this evidence invents canon:
every mechanism is grounded in code (`objDepart`,
`objAwayStep`, the base return clock in `npcNodeTravel`, the
`npcNodeTravel`→`objTick` ordering) plus trace rows plus three
part-level probes. What the code already implements, in one line:
`v.away` is a trip-state with a clock (set on departure, cleared
when the clock expires or the trip's objective completes and the
member walks home); it is not a location-state, and the pool's
`away` first-fail correctly treats it as one.

## Findings for the coordinator (append to hidden_files/sim-findings.md)

1. **Away is a trip-state, not a location-state.** The pool's `away`
   first-fail is correct as written, but any consumer that reads it
   as "not at home" will misread rows like these 16. If a future
   consumer needs "not at home", it should check the node, not the
   flag. (No code change proposed here — a reading note.)
2. **Expeditions can target the Haven tile.** The expedition system
   picks (4,4) as a destination and runs a full expedition (legs,
   finds, clock) while the party stands at home. Whether an
   expedition to home is intended is a question for whoever owns
   expeditions — the (b) flags are the symptom, not the defect.
3. **Same-part double processing in `npcNodeTravel`.** A villager
   who departs as someone's companion during the principal's roster
   turn is processed AGAIN on their own roster turn in the same pass
   (`objAwayStep` runs in the departure part). Combined with the
   at-site meander, a guard's node can flicker onto Haven for one
   part at dawn. Harmless here (one dawn, gone by part 1), but any
   dawn-time node read can catch a guard mid-flicker.
4. **The return clock outlives the return walk by design.** A
   member can be home with the flag set until the clock expires
   (gen: 3 parts against a duration of 4). The (a) rule's "≥1 day
   after the return" bar is the right bar — the return-day case is
   a different, narrower window and should stay (d).

## Revert

Seed call reverted on the branch after measurement (the 13-line
VETPARTY block removed from `resolveWildMonsterEncounter` in
`src/js/game.js`): `git diff 8acd9ac2f -- src/` = **0 lines** —
`src/` is byte-identical to the control anchor (`node --check`
clean). Proof re-run in the off shape
(`AWAYHAVEN_SEED_CALL=off node scripts/test-awayhaven-b.js`):
**61/62 before the revert commit** — the single failure is the
static check "game-code worktree diff is the seed call only", which
expects an empty `src/` status and sees the uncommitted revert
itself (`M src/js/game.js`); that check is designed to run after
the revert is committed. Post-commit re-run
(`AWAYHAVEN_SEED_CALL=off`, after commit `3baecd01b`): **62/62
green**.

## Files

- Prereg: `evidence/2026-11-16/sim-awayhaven-b-prereg.md`
  (`74152e55`)
- Evidence (this file): `evidence/2026-11-16/sim-awayhaven-b.md`
- Analysis: `evidence/2026-11-16/awayhaven-b-analysis.json`
  (regenerated after the classifier fix; supersedes the earlier
  run, which carried the spell-merged classifications)
- Instrument corpora: `evidence/2026-11-16/perseed-awayhaven-b-on/`
  (8 files), `evidence/2026-11-16/perseed-awayhaven-b-control/`
  (8 files)
- Driver: `scripts/awayhaven-driver-20261116.js`; analyzer:
  `scripts/analyze-awayhaven-b.js`; proof:
  `scripts/test-awayhaven-b.js` (62 checks)
- Part-level probes (elena / boris / gen) were run from `/tmp`
  (ephemeral, not committed): pure logging wraps over
  `npcNodeTravel` / `objTick` / `objDepart` / `npcSetNode` +
  `vbrainScorePick`, no RNG draws, no state writes. Their findings
  are in §Dated trace lines.
