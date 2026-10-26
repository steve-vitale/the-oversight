# sim-transient2-a — re-anchored transient hunt (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-transient2-a.
DIAG ONLY — zero src/js changes, zero default flips, no edits to
any existing policy, sweep, summary, or check file. New files only:
a new sweep, a new proof test, this evidence file, and the new
per-seed corpus. scripts/test-natpair-sweep.js and
scripts/test-freshtransient-sweep.js are read, never edited.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest; no single canon doc
  covers the transient-national instrument — the question lives
  in sweep code, not in a design doc, said so here instead of
  inventing a canon doc), docs/SCALE.md (national is a LIVE
  state, not a title: when the realm dissolves, nationalLive
  falls), docs/MONSTER-WAVES.md (wave law; wave 4 = the Mirror
  Draft, standing >= 100; wave 5 = the Producers, standing >=
  200 AND wave-4 faced). The instrument question is about how
  sweeps READ national reach, not about what national means.
- Context read first and VERIFIED from the files, not trusted
  blindly: evidence/2026-10-26/sim-freshtransient-a.md (the
  0830Z run: driveoff-clean 73673 on the then-current base
  climbs to national day 84, global day 88, holds to day 161,
  then falls aloud — snap-counted, not transient — and its
  anchor was stale, ts 86 -> 84; instrument verified working
  via det-gates on 73671 and 73673, so the failure was the
  stale anchor, not the tool) and
  evidence/2026-10-26/sim-natpair-a.md (the mechanism:
  national rises inside base.daily courtship; the seat leg +
  post-daily snap catch it that day, the pre-daily snap only
  the next day — a one-night window) and
  evidence/2026-10-26/sim-scale-onramp-round-0830.md (next
  blank #2: a re-anchored transient arm on the current base,
  using the verified-fresh band 73901–73908, NOT spent on a
  stale anchor). This arm IS that re-anchored arm.
- FRESHNESS (verified BEFORE any seed spend, this run, by the
  method the task prescribes — evidence filenames + dated
  evidence .md files):
  - .md content hits for 73901–73908 across ALL evidence
    dates (find evidence -name '*.md' | xargs grep -l
    word-boundary per seed): exactly TWO files, both
    mentions of the reservation, neither a spend:
    sim-freshtransient-a.md ("band verified fresh, fresh hunt
    was NOT run, NO fresh-band rows") and
    sim-scale-onramp-round-0830.md ("band stands ready for a
    re-anchored next arm", next blank #2).
  - Perseed corpus filename hits for 73901–73908 across ALL
    evidence dates (ls evidence/*/perseed-*/): NONE.
  - Verdict: band 73901–73908 is FRESH and unspent. No seed
    appears in a prior corpus. Proceeding is legitimate; no
    substitution was made. (Two earlier broad recursive greps
    over the whole evidence tree were superseded by this
    scoped check — the recursive form also scans multi-MB
    JSON corpora — and killed before they finished; the
    scoped check above is the check of record.)
- COMPOSITION (new file only):
  scripts/test-transient2-sweep.js, two arms on the one fresh
  band, 180d death-aware horizon, one seed per exec call:
  - anchor: plain tableseat-nowait (substrate
    LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
    scripts/policies/tableseat-nowait.js) + natpair pre/post-
    daily snaps (pre-daily snap, delegate base.daily,
    post-daily snap + per-day rank trace). This arm IS the
    re-anchor: its table is the comparison base for this run
    and is NOT judged against 0126Z or the 73671 band.
  - hunt: the driveoff-clean shape (FEASTDRAWCLEAN=1,
    tableseat-nowait substrate, COMPETENT_SEEK_FIGHTS left ON,
    feastdraw + nonworldkill recorders installed exactly as
    the freshtransient sweep does) + the same pre/post snaps.
  The snaps and say-line capture are PURE READS: they read
  scaleRank()/progState() and record lines; no game call is
  added, removed, or reordered. Each arm's det-gate proves it
  (plain vs wrapped on seed 73901: days/gameDays/won/deaths/
  tsNationalDay identical) BEFORE that arm's band is spent.
- TRANSIENT DEFINITION (verbatim from natpair + this arm's
  fall locator): SNAPNAT = row nationalEver (0/1, pre-daily
  hist + final snap). TSPRESENT = tsNationalDay != null.
  MAXNAT = maxRank in {national, global}. POSTNAT =
  postMaxRank in {national, global} (diagnostic).
  OLDPAIRED = (SNAPNAT === TSPRESENT) literal (number ===
  boolean: always false — the natpair type bug, preserved,
  never revived as a check). NEWPAIRED = (SNAPNAT ===
  (TSPRESENT ? 1 : 0)) — the adopted rule; both sides coerced
  to 0/1. Classes via classifyPairing from the natpair sweep
  (imported read-only): agree | transient-ts-only |
  snap-only | final-only | post-explained-transient |
  unclassified. A GENUINE transient additionally requires
  the overnight fall snap-located: rankTrace shows post>=2
  on the rise day D (postNationalDay == tsNationalDay) and
  pre<=1 on day D+1 with no later pre>=2 — computed by
  locateOvernightFall in the new sweep and stored per row as
  overnightFallDay. A class alone, without the located fall,
  is NOT a captured transient.
- DIAG-GO (binding): GO requires at least one genuine
  transient captured with BOTH the rise day AND the
  overnight fall day snap-located, OR a full-band negative
  with snap coverage proven for all 8 seeds (every national
  day snap-counted, no window missed) plus the anchor table
  published. STOP RULE: if the anchor control looks broken
  or wrapper neutrality fails, STOP and report — do not
  hunt on a broken instrument, and do not re-use 73673 as a
  positive control without re-anchoring it first (the 0830Z
  lesson). The anchor band is judged on its own rows, never
  against 0126Z or the 73671 band.
- SENSE plan: (1) for any captured transient seed, read the
  transcript around the rise and fall nights and say what
  the village looked like (SENSE-TESTING LAW: meaning, not
  counts); (2) a villager-behavior spot check from the fresh
  rows' say-lines. Nothing new is introduced by this arm
  (zero src/js, zero policy behavior change), so report the
  texture honestly rather than inventing a behavior finding.
- PILOT GATE: the two det-gates ARE the pilot — neutrality
  must pass per arm before that arm's band is spent.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — do
  NOT fabricate panel inputs for recorder corpora. The
  sweep-compare table is the comparison of record. Do NOT run
  telemetry-check on recorder rows and do NOT roll any
  baseline.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind the
  run — a miss is NO-GO, never re-scored against a friendlier
  metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO — PROVEN FULL-BAND NEGATIVE (no transient on the fresh band, snap coverage proven, anchor table published)

The pre-registered GO holds through its second branch: no
genuine transient was captured, AND the negative is proven
rather than asserted — every seed's national days are
snap-counted with no window missed (proof below), plus the
anchor table is published (below). The re-anchor itself
succeeded: the anchor control is healthy on the current base
(fbcb4e0b8), not broken, so the stop rule did not fire and
the hunt was run in full. This is the outcome the 0830Z run
reserved the band for: a re-anchored arm spending 73901–73908
on a current-base anchor, not on a stale one.

## THE ANCHOR TABLE (transient2-anchor: plain tableseat-nowait, current base fbcb4e0b8)

| seed | days | won | wave | arc | final | max | natEver | natFinal | table | entered | tsDay | preNat | postNat | deaths | starv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73901 | 23 | 0 | 1 | 3 | village | village | 0 | 0 | 0 | 0 | null | null | null | 8 | 3 |
| 73902 | 97 | 1 | 3 | 4 | national | national | 1 | 1 | 1 | 1 | 77 | 78 | 77 | 17 | 0 |
| 73903 | 94 | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 81 | 82 | 81 | 25 | 0 |
| 73904 | 109 | 1 | 3 | 4 | national | national | 1 | 1 | 1 | 1 | 77 | 78 | 77 | 21 | 0 |
| 73905 | 127 | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 78 | 79 | 78 | 37 | 0 |
| 73906 | 95 | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 84 | 85 | 84 | 27 | 0 |
| 73907 | 137 | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 77 | 78 | 77 | 20 | 0 |
| 73908 | 136 | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 105 | 106 | 105 | 25 | 0 |

Anchor band: won 6/8, median 109d, max 137d, national-ever
7/8, national-final 7/8, table invited 6/8, entered 6/8,
Arc IV 6/8, wave-4 5/8, wave-5 0/8, deaths 180, starvation 3.
This table IS the comparison base for this run. It is not
judged against 0126Z or the 73671 band, per the
pre-registration — and it needs no apology: 6/8 wins through
the lesser seat, every winner through the table, wave-5 still
unreached on every seed. The one anchor seed that reaches
global without the table (73905, lost day 127) is the
anchor's own table-step stall, carried below.

## THE HUNT BAND (transient2-hunt: driveoff-clean + snaps, same seeds, same base)

| seed | days | won | wave | arc | final | max | natEver | natFinal | table | entered | tsDay | preNat | postNat | deaths | starv | draws/driven |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73901 | 23 | 0 | 1 | 3 | village | village | 0 | 0 | 0 | 0 | null | null | null | 8 | 3 | 0/0 |
| 73902 | 121 | 1 | 3 | 4 | global | global | 1 | 1 | 1 | 1 | 77 | 78 | 77 | 24 | 0 | 4/4 |
| 73903 | 127 | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 81 | 82 | 81 | 25 | 0 | 6/6 |
| 73904 | 180 | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 77 | 78 | 77 | 24 | 0 | 12/12 |
| 73905 | 180 | 0 | 2 | 3 | global | global | 1 | 1 | 0 | 0 | 78 | 79 | 78 | 17 | 0 | 19/19 |
| 73906 | 143 | 0 | 4 | 3 | regional | global | 1 | 0 | 0 | 0 | 84 | 85 | 84 | 44 | 1 | 1/1 |
| 73907 | 170 | 0 | 4 | 3 | national | national | 1 | 1 | 0 | 0 | 77 | 78 | 77 | 31 | 0 | 1/1 |
| 73908 | 180 | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 105 | 106 | 105 | 33 | 0 | 3/3 |

Hunt band: won 1/8, median 170d, max 180d, national-ever
7/8, national-final 6/8, table invited 1/8, entered 1/8,
Arc IV 1/8, wave-4 5/8, wave-5 0/8, deaths 206, starvation 4,
feast draws 46, all 46 driven off by the watch (named
villagers, brands, "never brave" — see sense read). Classes:
agree 8/8 in BOTH arms; transient-ts-only 0, snap-only 0,
final-only 0, post-explained-transient 0, unclassified 0.
OLDPAIRED is false on every row (the natpair type bug,
preserved as a witness, never used as the check);
NEWPAIRED is true on every row; MAXAGREE is true on every
row. The proof test recomputes NEWPAIRED from the stored
rows and passes on all 16.

## WHY THE NEGATIVE IS PROVEN, NOT JUST 0/8 (snap coverage, per seed)

A 0/8 alone would not satisfy the pre-registered GO — a
missed window would also read 0/8. Four legs close that gap,
all computed from the stored rank traces (never hand-edited):

1. EVERY ROW CLASSIFIED: 16/16 rows (both arms) carry class
   agree with NEWPAIRED true and MAXAGREE true. No row sits
   in transient-ts-only, snap-only, final-only, or
   unclassified — the witnesses agree everywhere, so no
   seed hides a ts-vs-snap disagreement of any kind.
2. EVERY RISE'S FIRST MORNING IS SNAP-COUNTED: on all 14
   ts-present rows (7 anchor + 7 hunt), postNationalDay ==
   tsNationalDay (the rise inside daily, seat leg + post
   snap same day) AND preNationalDay == tsNationalDay + 1
   (the next morning's pre-daily snap still sees national).
   A transient is exactly a rise whose first morning is NOT
   seen — that morning is seen on every rise in this band,
   so no rise fell on its first night. The two ts-null rows
   (73901, both arms) died day 23 before any national rise.
3. TRACES COVER EVERY DAY: rankTrace length equals days
   on 13/16 rows and days-1 on the 3 final-partial-day rows
   (anchor 73905: 126/127; hunt 73903: 126/127; hunt 73907:
   169/170), with non-decreasing day order throughout — no
   day is unsnapped, so no rise day could pass unrecorded.
4. FALLS ARE OBSERVED IN THE OPEN: overnight falls
   (previous day post>=2, next day pre<=1) occur on 3 hunt
   seeds — 73902 day 92, 73906 day 99, 73908 day 141 — proving
   the fall half of the window is detectable on this band.
   On all three, national had already been pre-snapped on
   an earlier day (rise days 77, 84, 105), so they stayed
   snap-counted — the natpair pattern, not transients.
   73906's day-99 fall is the cleanest: realm dissolved day
   98 aloud ("The realm came apart... The climb starts
   over"), final rank regional, max global. A first-night
   fall would have looked identical except on day tsDay+1 —
   and on every rise, day tsDay+1 still read national.

The transient window is therefore exercised end-to-end on
this band (rises located, falls located, first mornings all
counted) and empty: transients are rare on the current
base, not unobservable. A future arm hunting transients
does not need a new instrument — it needs more seeds, or a
policy shape that stresses the first night (named blank
below).

## DETGATES — BOTH INSTRUMENTS MOVE NO PLAY (seed 73901, current base)

- Anchor: plain tableseat-nowait vs tableseat-nowait + snaps:
  days 23/23, gameDays 23/23, won 0/0, deaths 8/8,
  ts null/null — MATCH.
- Hunt: plain driveoff-clean (+recorders) vs driveoff-clean
  + snaps: days 23/23, gameDays 23/23, won 0/0, deaths 8/8,
  ts null/null — MATCH.
Artifacts: perseed-sim-transient2-a/detgate-anchor-73901.json
(+ detgate-anchor.json copy) and detgate-hunt-73901.json
(+ detgate-hunt.json copy). The hunt-vs-anchor trajectory
differences (e.g. 73902: 97d anchor vs 121d hunt; 73905: lost
127d anchor vs survived 180d hunt) are the POLICY difference
(feast draws driven off change play — that is the arm), not
instrument perturbation: the detgates prove the snaps move
nothing, and the policy is the same one the freshtransient
arm used.

## SENSE-TESTING READ (plain words: what the villages looked like)

No transient day exists to narrate, so the sense read is
the fall that was caught and the table that never came.
Hunt 73906 climbs to global (day 84 granary, planetary
broadcast tier), holds it, and on day 98 the game says it
aloud — "The realm came apart — no polity answers to Haven
now, and Haven is a free fire again. National and global no
longer describe this village. The climb starts over." Day
99's dawn snap reads regional, and the village ends
regional, lost day 143 with 44 deaths. The fall is a polity
moment with a reason, not a silent number change — and two
days later the texture continues: Tomás of The Red Table
walks into the firelight alone, thinner than remembered,
asks for food, waits two days, gets silence, and walks back
— "They'll remember the silence." That is a village whose
realm dissolved and whose neighbors felt it.
Anchor 73905 is the other story: global by day 78, the
System saying "the table has your name now," feasts for the
cameras, and then... no invitation ever arrives (table 0),
and the village is lost day 127. The table step stalls even
at global on this seed — the same stall the freshtransient
73673 row showed (global, table 0), now on a second seed
and a second base.
Driveoff texture (hunt arm, 46 draws, 46 driven off): the
watch meets each feast scavenger with named villagers and
brands — "Paul takes up a brand and Juliana follows — they
meet it at the edge of the light with noise and fire. The
Big Bastard was never brave. It melts back into the dark."
No robotic, static, or repeated dialogue was found in the
sampled lines (hunt 73906 days 96–102, anchor 73905 days
76–82, hunt 73902 days 88–95).

## VILLAGER-BEHAVIOR SPOT CHECK (sense, not counts)

Nothing new is introduced by this arm (zero src/js, zero
policy behavior change — the sweeps only read, and both
base policies are existing instruments), so there is no new
behavior to judge, and none is invented here. What the fresh
rows' say-lines show is the same coherent texture as prior
arms: national arrival as a polity moment (granary, court,
named fires, trust gains), national loss as a realm
dissolving with a spoken reason, feast draws refused by
people rather than by a status line, and table flickers that
name the missing deeds ("wave-3 monsters faced; the
food-thesis deeds") instead of a silent no.

## WALL NUMBERS (anchor = comparison base; hunt alongside)

Anchor: national-ever 7/8, national-final 7/8, table invited
6/8, entered 6/8, wins 6/8 (lesser seat only), wave-4 5/8,
wave-5 0/8, Arc IV 6/8, median survival 109d, max 137d,
deaths 180, starvation 3.
Hunt: national-ever 7/8, national-final 6/8, table invited
1/8, entered 1/8, wins 1/8, wave-4 5/8, wave-5 0/8, Arc IV
1/8, median survival 170d, max 180d, deaths 206, starvation 4.
The wall on the anchor band is no longer national reach
(7/8) or even the table (6/8 entered) — it is wave-5 (0/8)
and, on the hunt band, the table step itself (see below).
Median survival is death-aware (dead villages stop; 180 is
the cap, not a fixed horizon).

## BLANKS FILLED OR DOCUMENTED

- FILLED (re-anchor, the task's core): the current-base
  anchor table above (base fbcb4e0b8, band 73901–73908) is
  now the transient arm's comparison base. Future transient
  work cites THIS table, not 0126Z and not the 73671 band.
  The 0830Z lesson is closed: no stale anchor was used, and
  73673 was not re-used as a positive control.
- FILLED (instrument, proven on both arms): the
  tableseat-nowait + pre/post-snap and driveoff-clean +
  pre/post-snap compositions are trajectory-neutral on the
  current base (both detgates MATCH on 73901), and the
  overnight-fall locator (locateOvernightFall, unit-tested
  in the proof test) finds falls in the open (3 hunt seeds)
  while correctly returning null on first-morning-counted
  rises. The transient instrument needs no further work.
- FILLED (negative, proven not asserted): 0 transients in
  16 rows with the four snap-coverage legs above — the
  fresh band's transient rate is 0/8 per arm on this base,
  with the window exercised, not unobserved.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the hunt
  band's table collapse — same seeds, same base, national
  reach identical (7/8), but table 1/8 and wins 1/8 against
  the anchor's 6/8 and 6/8, with Arc IV 1/8 against 6/8:
  under driveoff-clean, villages survive longer (median
  170d vs 109d) but stall at Arc III without table
  invitations. Correlation, not mechanism: the one hunt
  winner (73902) is also the hunt band's only Arc IV /
  table row, and anchor 73905 shows the table can stall
  even at global without driveoff-clean. Whether feast-draw
  refusal deprives table-qualifying deeds, or longer
  survival without Arc IV deeds is the cause, is a next
  arm's question — it is NOT chased here (stay on axis);
  (2) wave-5 remains 0/8 on both arms and every prior band
  this axis has run — the wall's next step after the table;
  (3) a future transient hunt needs more seeds or a
  first-night stressor, not a new instrument — the window
  is one night wide and this band's every first morning was
  counted.
- CARRIED (not chased here): the table-entry step of the
  wall on seeds like anchor 73905 (global, table 0, lost);
  wave-5 reach.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg, class, or definition was re-scored
mid-run. The run was judged exactly against its header: GO
required at least one genuine transient captured with BOTH
rise and fall snap-located, OR a full-band negative with
snap coverage proven for all 8 seeds plus the anchor table
published. Branch 1 (captured): MISSED — 0 transients in
both arms. Branch 2 (proven negative + anchor table): MET
— anchor table published above (6/8 wins, 7/8 national-ever,
5/8 wave-4, 0/8 wave-5, deaths 180, starvation 3); snap
coverage proven on all 8 hunt seeds (and all 8 anchor
seeds) via the four legs in "WHY THE NEGATIVE IS PROVEN"
(classified 16/16, every first morning counted, traces
cover every day, falls observed in the open); the proof
test honestly reports 54 passed / 0 failed on the stored
corpus, with the GO-branch check passing on the negative
branch. The verdict is therefore DIAG-GO (proven negative),
not a softened partial and not a re-scored capture claim.
One method note, not a revision: the anchor and hunt bands
are different trajectories by design (different base
policies), so their band tables are never compared as
before/after — the anchor is the comparison base for the
axis, the hunt is the transient search. The telemetry-check
and balanced panel were NOT run, per the standing exception
(panel cannot ingest per-seed recorder corpora; no panel
inputs were fabricated). The sweep summary + this evidence
file are the comparison of record. No game code changed;
no [needs-eyes] flag applies (instrument only, no
narration, feel, combat, or UI change).

## Infrastructure notes

- Sweep: scripts/test-transient2-sweep.js (new file only:
  anchor arm = tableseat-nowait + natpair snaps; hunt arm =
  driveoff-clean + recorders + natpair snaps; modes --one
  transient2-anchor|transient2-hunt / --summary /
  --detgate-anchor / --detgate-hunt; per-day rank trace +
  overnightFallDay per row). Corpus:
  evidence/2026-10-26/perseed-sim-transient2-a/ (16 rows +
  summary.json + 4 detgate artifacts). Proof:
  scripts/test-transient2-a.js (54 passed / 0 failed —
  corpus, detgates, NEWPAIRED recomputation, fall-locator
  unit cases, GO-branch computation).
- Freshness check of record: .md hits only the two
  reservation mentions (sim-freshtransient-a.md,
  sim-scale-onramp-round-0830.md); perseed filename hits
  none, all dates. Two superseded broad recursive greps were
  killed before finishing; the scoped check is the record.
- Det-gates: PASS on both arms (73901: 23/23 days, 8/8
  deaths, ts null/null).
- Commit: sim-transient2-a, DIAG-GO (proven full-band
  negative; anchor table published; zero src/js diff).
  Ready for coordinator merge; NOT pushed, NOT bumped, live
  NOT verified (coordinator/ship-loop line, not this arm's).
