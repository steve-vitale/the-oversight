# sim-heraldarr2-a — Herald arrival path, RAID-PIN RIVAL: draft-selection wrap + longevity screen (DIAG ONLY, zero src/js)

- Run: fleshout-loop-a-20261101T1742Z (Loop A, axis scale-onramp).
- Arm: DIAG ONLY. Zero `src/js` changes, no gate threshold moved,
  no policy-default flip, no routing built (#1538 still pending —
  this arm attributes an arrival, it does not build a route).
  No `[needs-eyes]` (DIAG instrumentation only; nothing
  player-facing changes).
- Verdict: **DIAG-GO — raid pinning PROVEN as the Herald's
  Haven-tile arrival path.** Five haven-tile arrival windows
  (4 pilot + 1 confirm), every one landing via `raidPin`
  with a continuous chain and no unattributed gap in its
  window, plus 7 Herald raid drafts in total and 18 linger
  re-pins on the pilot. The heraldplace (4,4) arrival now
  has a proven landing-step class: heraldarr-a ruled out
  follow-enter (safe-tile hold), this arm proves raid-pin
  landing + lingering re-pin.
- Stack (named exactly; numbers NEVER compared across
  stacks/bases): substrate `scripts/policies/tableseat-nowait.js`
  (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
  UNMODIFIED: `fullseat-diag`, `wavegate-diag`. Same stack
  family as heraldarr-a.
- Band: LONGEVITY-SCREENED (fixes the heraldarr-a censor:
  5/8 seeds won days 90–100 before the titan window).
  Screen (substrate-only, capture off) scanned seeds from
  95401 upward, cap 48: **34 scanned, 16 qualifiers**
  (`gameDays > 120 AND won == 0`, survival/won fields only —
  never any Herald field). Pilot = qualifiers 1–8:
  95401, 95404, 95405, 95408, 95409, 95413, 95415, 95417.
  Confirm = qualifiers 9–16:
  95419, 95421, 95423, 95425, 95428, 95429, 95431, 95434.
  Screen audit trail: `evidence/2026-11-01/sim-heraldarr2-a-screen/`
  (34 per-seed JSONs + `qualifiers.txt`).
- Horizon: `DAYS=180`, death-aware.
- Corpus (capture ON): pilot `evidence/2026-11-01/sim-heraldarr2-a/`
  (8 JSONs), confirm `evidence/2026-11-01/sim-heraldarr2-a-confirm/`
  (8 JSONs). Analyses: `sim-heraldarr2-a-analysis.json`,
  `sim-heraldarr2-a-confirm-analysis.json`.
- Preregistration: `evidence/2026-11-01/sim-heraldarr2-a-prereg.md`
  (commit `d8efee008`, before any judged sim; instrument +
  screen driver commit `a8fff494a`). Judged exactly against
  that header; no bar moved after seeing results.
- Instrument files (this arm only): `scripts/sim-heraldarr2-a-sweep.js`,
  `scripts/sim-heraldarr2-a-lib.js`,
  `scripts/sim-heraldarr2-a-analyze.js`,
  `scripts/sim-heraldarr2-a-screen.sh`,
  `scripts/test-sim-heraldarr2-a.js` (derived from the
  heraldarr-a v2 instrument; the only behavior changes are
  the prereg's (a)–(d): draft-selection wrap, every-linger
  re-pin record, two new say-needles, longevity screen).

## Adoption note (read before reusing this arm's history)

This arm was adopted mid-run: the predecessor was killed by
a runtime transport error (sqlx pool timeout), NOT by its
work. Verified on adoption (not taken on faith): commits
`d8efee008` (prereg + instrument) and `a8fff494a` (screen
driver) were on the branch, and the screen output was
PARTIAL — `qualifiers.txt`, `s95401.err`, `s95401.json`
all 0 bytes, 0 qualifiers. The screen is selection-only
and re-runnable, so it was re-run from scratch (95401, cap
48) rather than committing partial output as judged data.
No orphaned node processes from the predecessor were found
(`ps` empty at adoption). No design was restarted: the
committed prereg's bars were judged as written.

## The answer in one paragraph

On a band where runs live past day 120 un-won, the Herald
reaches the Haven tile by RAID, not by following anyone
home. Five times across 16 seeds, a raid drafts the Herald
— it is the nearest living monster to Haven, inside the
raidN cut — and the draft puts it straight on the Haven
tile (4,4), where the follow branch could never put it
because that tile reads safe. Four of those landings open
a haven-tile arrival window the next dawn (the fifth,
95404 day 121, is drafted and then fought off the tile
inside the same raid call — see the draft-moved-off case).
Once drafted and unmet, the Herald LINGERS: every following
dawn re-pins it to the Haven tile (17 moved re-pins + 1
held re-pin on the pilot), and the village hears it gorge
nightly by name with the exact kcal price. The arrival is
loud, named, and priced — the opposite of the silent
heraldplace mystery. What the pilot does NOT show is a
Herald ever arriving by follow-enter, wander, or spawn:
0 such haven landings on either band.

## The five proven arrival windows (all raidPin, all chain-continuous)

| Seed | Window (dawn→dawn) | From → Haven | Draft (day, rank, raidN) |
|---|---|---|---|
| 95404 | 109 → 110 | (4,7) → (4,4) via wander (4,6)→(4,7) + raidPin | d109, rank 1, raidN 4 |
| 95404 | 113 → 114 | (6,4) → (4,4) via wander (5,4)→(6,4) + raidPin | d113, rank 1, raidN 4 |
| 95404 | 134 → 135 | (3,3) → (4,4) via 3 wanders + raidPin | d134, rank 2, raidN 3 |
| 95408 | 172 → 173 | (6,4) → (4,4) via wander (7,4)→(6,4) + raidPin | d172, rank 3, raidN 4 |
| 95429 (confirm) | 136 → 137 | (4,5) → (4,4) via raidPin alone | d136, rank 0, raidN 4 |

Each window's chain is continuous (first move starts on
the previous dawn's tile, each step hands to the next,
last step lands on Haven) with no unattributed gap. The
landing step in every case is the raid draft itself, not
a follow leg, not a wander, not a spawn.

## Draft census (the non-draft, distinguished from the draft-that-missed)

Pilot: 1,400 `havenRaidTick` calls, 1,400 draft records,
0 `unknown`. By class: blocked-cooldown 784,
roll-miss 449, draft 129, blocked-pantry 38,
blocked-over 0, blocked-table 0, blocked-few 0.
Herald draft status on those calls: absent 1,214
(Herald not a living world monster at entry — recorded
separately, NOT a miss), gate-or-roll 169, rank-missed 11
(drafted raid fired, Herald sorted nearest but beyond
the raidN cut — the draft-that-missed case, now
distinguishable), drafted 6.
Confirm: 1,346 calls, 1,346 records, 0 `unknown`. By
class: blocked-cooldown 688, roll-miss 513, draft 107,
blocked-pantry 38. Herald status: absent 1,085,
gate-or-roll 245, rank-missed 15, drafted 1.
Total: 7 Herald drafts, 26 rank-misses, 414 gate-or-roll
non-drafts with the blocking gate or the roll named.
Cooldown is read live from the overtime knobs, not
assumed 7: on 95404's late drafts it reads 3 (overtime
tier), on 95429's draft it reads 7 — the classifier
stays correct either way because it never assumes.

Two draft cases deserve names, because the prereg designed
flags for exactly them:
- DRAFT-MOVED-OFF (95404, day 121): Herald drafted rank 0
  (raidN 4, pantry 15,138) from (4,3), then a defender
  fight inside the same raid call flees it at 1 HP to
  (3,5) (`mFleeMove`, villager `app_mgpspiwk456`,
  outcome `mFlee`). The wrapper's net raidPin event
  (4,3)→(3,5) collapses draft + flee into one record —
  see metric review (f). The draft is real; the dawn
  after it the Herald is NOT on Haven, so no haven
  window opens from this draft.
- DRAFT-IN-PLACE (95404, day 118): Herald already on Haven
  (4,4) and lingering since day 113 is drafted AGAIN
  (rank 0, tie, raidN 3) — re-pinned in place, no new
  window, lingering unbroken. A draft is not only an
  arrival; it is also a re-confirmation of a siege.

## Linger census (every re-pin, not only tile-changing pins)

Pilot: 18 linger re-pin records, 0 missing days:
repin-moved 17, repin-held 1, repin-drift-cleared 0,
skipped-over 0. The held case (95408) is the class the
v1 wrapper missed: a lingering Herald already on Haven
re-pinned in place. 95404's 12 moved re-pins are the
siege rhythm in miniature: drafted day 113, unmet
("Nobody met The Herald"), re-pinned back to Haven
every dawn it wanders or follows off (days 114–119
gorge nights, then re-drafted day 118 in place, then
fought off day 121); drafted day 134, unmet again,
re-pinned days 135–140 until the village is lost.
No drift-clear fired on the pilot: no Herald lingered
a full 7 nights unmet-and-unfought before something
else ended the siege (fight, re-draft, or village loss).
Confirm: 0 linger records, 0 missing days — no Herald
was lingering at any daily-call entry. The confirm's
one drafted Herald (95429) was MET promptly (villager
contacts days 136–137, all `vFlee`), so it never
entered the lingering state at all. Bar 3 holds
vacuously on confirm and substantively on pilot.

## Per-seed end fields (this band, this stack — not wall numbers)

Pilot:

| seed | class | days | end | rank | wave | table | won | drafts | haven windows |
|---|---|---|---|---|---|---|---|---|---|
| 95401 | LOCATED-UNFACED | 181 | survived | global | 4 | 0 | 0 | 0 | 0 |
| 95404 | CONTACTED | 140 | village-lost | regional | 5 | 1 | 0 | 5 | 3 |
| 95405 | LOCATED-UNFACED | 181 | survived | national | 4 | 0 | 0 | 0 | 0 |
| 95408 | CONTACTED | 180 | survived | national | 4 | 0 | 0 | 1 | 1 |
| 95409 | LOCATED-UNFACED | 181 | survived | regional | 4 | 0 | 0 | 0 | 0 |
| 95413 | LOCATED-UNFACED | 180 | survived | national | 4 | 0 | 0 | 0 | 0 |
| 95415 | NEVER-LOCATED | 181 | survived | global | 3 | 0 | 0 | 0 | 0 |
| 95417 | NEVER-LOCATED | 181 | survived | national | 2 | 0 | 0 | 0 | 0 |

Confirm:

| seed | class | days | end | rank | wave | table | won | drafts | haven windows |
|---|---|---|---|---|---|---|---|---|---|
| 95419 | LOCATED-UNFACED | 147 | village-lost | regional | 4 | 1 | 0 | 0 | 0 |
| 95421 | NEVER-LOCATED | 181 | survived | global | 3 | 0 | 0 | 0 | 0 |
| 95423 | CONTACTED | 181 | survived | global | 4 | 0 | 0 | 0 | 0 |
| 95425 | LOCATED-UNFACED | 180 | survived | regional | 4 | 0 | 0 | 0 | 0 |
| 95428 | LOCATED-UNFACED | 122 | village-lost | regional | 4 | 0 | 0 | 0 | 0 |
| 95429 | CONTACTED | 181 | survived | regional | 4 | 0 | 0 | 1 | 1 |
| 95431 | LOCATED-UNFACED | 181 | survived | regional | 4 | 0 | 0 | 0 | 0 |
| 95434 | LOCATED-UNFACED | 181 | survived | global | 4 | 0 | 0 | 0 | 0 |

Screen counts (both bands): pool 16, contacted 4,
located-unfaced 9, never-located 3, contacts 89
(78 scholar + 3 villager on pilot; 8 villager, 0
scholar on confirm — channel split differs because
95404's scholar meets the haven-sitting Herald
repeatedly while the confirm's meetings are all
villagers meeting it first).

## Pre-registered DIAG-GO bars (judged exactly as written)

1. 8 pilot seeds, each complete — PASS. 8/8 JSONs
   present, capture errors 0 on all 8, end fields present.
   (Confirm likewise 8/8, errors 0.)
2. 100% of pilot raid calls classified, zero `unknown`;
   every Herald-living call carries a draft status —
   PASS. 1,400/1,400 records; re-derived independently
   in the proof corpus legs (1,538 pilot checks green);
   a separate audit verified `absent` ⟺ Herald not in
   the pre-call sorted list on all 1,400 records, 0 bad.
   (Confirm: 1,346/1,346, 0 unknown.)
3. 100% of pilot daily calls with the Herald lingering
   at entry carry a linger re-pin record — PASS.
   Linger-missing days 0 (pilot 18 records; confirm 0
   lingering entries, 0 missing).
4. Every herald tile change recorded as a move event, OR
   the uncovered windows listed as UNATTRIBUTED — PASS
   as written (windows listed, see below). The 4 pilot
   + 3 confirm unattributed windows are ALL non-haven
   windows; none touches a haven arrival, so none blocks
   a PROVEN verdict for any arrival under the verdict
   mapping.
5. Every pilot haven-tile arrival window listed with
   chain + landing class — PASS. 4 pilot windows, all
   raidPin, all chain-continuous (confirm adds a 5th).
6. Recorder-neutrality leg — PASS. First Herald-drafted
   pilot seed 95404: ON vs fresh OFF vs screen OFF end
   fields IDENTICAL on all 8 fields (days 140, gameDays
   140, won 0, national 0, table 1, maxWave 5,
   endScaleRank regional, endReason village-lost).
   The instrument does not move the run.
7. Determinism leg — PASS. 95404 ON re-run reproduces
   the judged per-seed JSON except `anchorCommit` (in
   fact byte-identically including the anchor — no
   commit landed between the judged sweep and the
   re-run).
8. Proof test green — PASS. Synthetic 22/22 before the
   pilot; synthetic + corpus legs 1,538/1,538 (pilot)
   and 1,466/1,466 (confirm) after, 0 failed.
9. Sense-test — PASS (read below). Raid-draft, linger
   re-pin, and haven-arrival beats are readable to a
   player, named and priced, not silent machinery.

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base
DIAG census, no before/after comparison exists in this
arm; none fabricated.

## The unattributed windows and the mismatches (reported, not smoothed)

Change-window coverage: pilot 75/79 attributed,
confirm 116/119. The 7 unattributed windows, by cause:
- Spawn-day-boundary artifact (5: pilot 95408 d138,
  95413 d170; confirm 95419 d136, 95425 d127, 95429
  d101): the lair spawn fires inside `titanDawnTick`
  BEFORE the dawn snapshot, so its day stamp equals the
  dawn day it appears in — but the analyzer's day-range
  rule then files it into the NEXT window, where its
  from-null breaks the chain. The lair itself is
  recorded; only the window filing is wrong. A future
  analyzer should file dawn-day spawns to the window
  they open, not the one they land in.
- Raid-net collapse (1: pilot 95404 d121→122): the
  draft (→Haven) + defender-fight flee (→(3,5)) inside
  one raid call collapse into one net raidPin event
  (4,3)→(3,5) plus a separate mFleeMove (4,4)→(3,5)
  describing the same flee — all steps present, but
  the chain test cannot order two descriptions of one
  step. Instrument note, not missing game data.
- One genuinely unrecorded step (1: pilot 95404
  d120→121): dawn tile (4,4) → travel from-tile (4,3)
  has no recorded mover (the follow leg (4,3)→(3,4)
  and nested wander (3,4)→(3,3) ARE recorded, and the
  follow+nested collapse is the same class as above).
  One step on one day travels through a path this
  instrument does not wrap (candidate: a combat/fight
  displacement outside `resolveWildMonsterEncounter`).
  Filed for a future instrument pass; it ends at
  (3,3), not Haven, and changes nothing about the
  arrival verdict.
Travel mismatches (12: 11 pilot + 1 confirm) are the
same collapse class in the other direction: in every
case the branch's expected line WAS spoken
("It followed you" / boundary line) and the Herald then
took one more nested step inside the same travelTo call
(wander during the call's worldTick) before the
wrapper's after-state. The branch prediction was right;
the after-tile reflects a second, nested move. The
mismatch counter counts tracked-herald follow+nested
cases as contradictions; a future taxonomy should
classify "branch line spoken + nested post-leg move"
separately, as the v2 taxonomy already does for
untracked cases. None of the 12 touches a haven window.

## SENSE-TESTING: what the transcripts actually say

The raid draft is the loudest arrival beat in the game:
"🐗 RAID — 4 raiders (Loud-Eyes, The Herald, The
Congregation, The Anaconda Empress) hit Haven in the
night, drawn by the smell of the pantry! The palisade's
stakes take their toll as they come over the wall."
The Herald is named, in the list, on all 6 pilot draft
days and on 95429's draft day — no knowledge-gate hides
it, because the raid names what it drafts. The siege
that follows is priced nightly: "🌙 Night. The
lingering The Herald gorges at the treeline — 2,800 kcal
gone from the stores. Endure it (they drift off within
~6 nights — the gorge is the price), or send a sortie:
fighters, rations, real risk." A player living through
95404 days 113–119 hears that line six nights running
with real numbers attached, and watches the stores fall
accordingly. Two wrinkles, both honest readings:
(a) 95404 days 138–140, as the village empties toward
its day-140 loss, the gorge line reports "0 kcal gone
from the stores" — true (nothing left to take) but
tonally flat at the moment of starvation; the price
line keeps promising a cost the village can no longer
pay. (b) The scholar's walk-up contacts with the
haven-sitting Herald (55 on 95404, 23 on 95408) all
read `refused` — the titan is not fought by bumping
into it; it is faced through the call. The arrival is
therefore loud and the facing is gated elsewhere, by
design, not by this arm's question. The heraldplace
mystery ("a promised arrival with no arrival mechanism")
is closed at the mechanism level: the mechanism is the
raid draft, and it announces itself by name.

## Secondary observation (not chased): field deaths

No silent Herald field deaths were observed. Every
Herald contact on both bands ends `refused` (scholar),
`vFlee` (villager flees), or `mFlee` (Herald flees at
1 HP, 95404 day 121) — zero villager deaths in Herald
contacts, zero un-narrated kills. The backlog
field-death narration blank is untouched by this arm
beyond that negative observation; nothing here was
chased mid-run.

## Wall numbers (orientation only — screened band, never pooled)

Pilot: won 0/8, national 6/8, table 1/8, wave-4 reach 6/8,
wave-5 reach 1/8 (95404), median survival 181d.
Confirm: won 0/8, national 3/8, table 1/8, wave-4 reach
7/8, wave-5 reach 0/8, median survival 181d.
Combined screened band: won 0/16, wave-5 reach 1/16.
These numbers describe a band SELECTED to survive past
day 120 un-won — by construction every seed here lived
past 120 — so they must never be trended as if
representative, and the 0 wins here say nothing about
the win rate (the screen excludes wins by design).
What they do show, for the scale wall: even on
long-lived runs, wave 5 is reached once in 16 and the
full seat never (the two table flags accompany
regional-rank, village-lost ends — 95404, 95419 —
tables that did not become full-seat wins). The arrival mechanism is no
longer the blocker in this story — the Herald DOES
arrive, by raid, on 5 of 16 long runs — but the climb
past wave 4 to a full seat still does not complete.

## Metric review (mandatory)

- **Pre-registration bound the run.** Judged exactly
  against the committed header: 8 pilot seeds, draft
  census complete, linger census complete, haven windows
  listed, neutrality on the first drafted seed,
  determinism on the same seed, proof green, sense beats
  read. No re-scoring, no bar moved after seeing
  results. The confirm ran because pre-stated live
  signal (a) held (≥1 Herald drafted on the pilot) —
  it replicated the finding (1 more draft, 1 more
  raidPin haven window) rather than rescuing a miss.
- **Doubts filed, not resolved by re-scoring.**
  (a) Dawn snapshots miss intra-day position changes —
  the move-event log is the guard, as on heraldarr-a;
  one genuinely unrecorded step (95404 day 120) is
  reported above, not hidden. (b) The roll-miss
  inference reads lastRaidDay + drafted set + RAID line,
  not the RNG draw itself — a gate-passing call with no
  raid is a roll miss by elimination (all other gates
  are read live). (c) The drafted set is recomputed
  from the pre-call sorted list when the raid fires,
  because the code mutates tx/ty in place and defender
  fights inside the same call can move a drafted monster
  off Haven before the after-state; `draft-moved-off`
  flags exactly that case (fired once, 95404 d121).
  (d) The screen selects on survival/won only, never on
  any Herald field — but it still selects: screened
  bands must never be pooled with unscreened bands or
  trended as if representative. (e) This worktree's
  base differs from heraldarr-a's anchor (rebased to
  the Loop B 1830Z head before this evidence commit —
  zero `src/js` changes in the rebase range, game
  behavior identical, proofs re-run green on the
  rebased tip), so counts are judged on their own base,
  never pooled with heraldarr-a. (f) NEW: the raidPin
  move event records net before/after tiles across a
  raid call, collapsing draft + same-call fight-flee
  into one event; chains through such days need a
  stepwise (draft-landing, then flee) record, not a net
  record. (g) NEW: `draftedPost` looks drafted monsters
  up by id after the call, so with duplicate world
  monster ids (95429's two `eulogy` entities) it can
  describe the wrong twin (raidBorn false, off-Haven
  tile for an entity that was in the draft slice). The
  Herald id is unique, so no Herald record is affected,
  and classification (pre-call sorted list +
  lastRaidDay) never touches post tiles — but a future
  arm should snapshot drafted entities, not re-find
  them by id. (h) NEW: the linger wrapper's
  `skipped-over` class (daily returns early when over)
  is not in bar 3's moved/held/drift-cleared list; no
  over-day with a lingering Herald occurred on either
  band, so that branch is untested, not validated —
  the analyzer counts a skipped-over record as a record
  for the day, which matches the bar's intent (no
  missing record) but not its letter. (i) NEW:
  mismatch taxonomy over-counts tracked follow+nested
  cases (see above); the branch lines all fired. (j)
  NEW: analyzer spawn filing (dawn-day spawns land in
  the following window by the day-range rule) breaks
  5 chains cosmetically; file dawn-day spawns to the
  window they open.
- **Revisions for the NEXT run, not this one.** (1) A
  stepwise raid-call record (draft landing, then each
  defender-fight move) would close the collapse class.
  (2) The 95404 day-120 unrecorded step wants one more
  wrapper (fight-displacement paths outside resolve)
  before anyone claims 100% move coverage. (3) The
  heraldplace episode itself (old base, old corpus)
  is NOT re-attributed by this arm: this arm proves
  the mechanism class on fresh windows, it does not
  replay that episode's own seed. Any claim that the
  old episode WAS a raid pin needs that episode's
  corpus re-read through this instrument, not this
  arm's windows cited as its proof.

## Blanks filled or documented

- Filled (measured): the Herald's Haven-tile arrival
  step — raid-pin landing, proven on 5 fresh windows
  with continuous chains; the full draft census
  (non-draft distinguished from draft-that-missed:
  26 rank-misses vs 414 gate-or-roll non-drafts);
  the lingering re-pin census (moved + held classes,
  nightly gorge pricing); the draft-moved-off and
  draft-in-place edge cases, each flagged by design.
- Documented, not filled (for later arms, NOT this
  one): (a) #1538 (refused-face routing) still pending
  and untouched; (b) the 95404 day-120 unrecorded step
  (one mover outside the wraps); (c) the old
  heraldplace episode's own attribution (mechanism
  proven, episode not replayed); (d) whether the
  full seat is reachable at all on long-lived bands
  (0/16 here, but this band excludes wins by
  construction — a different question from this arm's).

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis loses one blocker — the Herald arrival path is now
a proven mechanism, not a suspect — while the climb
past wave 4 to a full seat still does not complete on
long-lived bands. No game change landed (DIAG only).

## Readiness

Ready for coordinator merge ('merged locally, pending
ship' is the coordinator's call) — NOT pushed, NOT
version-bumped, NOT live-verified. No `[needs-eyes]`
(DIAG instrumentation only; nothing player-facing
changed). Worktree clean after commit (see commit
message for the file list); scratch leg dir removed,
not committed.
