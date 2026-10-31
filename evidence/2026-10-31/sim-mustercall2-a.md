# sim-mustercall2-a — second-cluster mustercall census: the band where the Herald never arrives (MEASUREMENT ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T0726Z.
Worktree branch: sim-mustercall2-a.
Base anchor: per-seed JSONs (`anchorCommit` field; worktree HEAD
at sweep time 70407e9f4, which includes Loop A arm
sim-titanexcl-a 72512906f, backlog #1550).
Pre-registration: evidence/2026-10-31/sim-mustercall2-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/herald-instrument-20261030.js (HERALD=1,
verbatim reuse) + scripts/policies/muster-diag.js (MUSTER=1,
verbatim reuse) + NEW scripts/mustercall2-sweep-20261031.js +
scripts/mustercall2-analyze-20261031.js (mustercall-b's sweep /
analyzer with only the output dir and seed defaults changed;
diff verified as exactly those changes).
Proof: scripts/test-mustercall2-20261031.js — 22/22 green
(synthetic fixtures only; no band seeds), plus a corpus
determinism leg: seed 86102 re-run to a scratch dir is
byte-identical to the judged JSON.
Corpus: evidence/2026-10-31/perseed-mustercall2/leadfeast/
s86101–s86116.json + mustercall2-analysis.json.
No game code changed. No policy file edited. No [needs-eyes]
(measurement only, nothing player-facing). Panel (§15): NOT
APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same
declaration as mustercall-b). No post-block replay was run:
the prereg allows one only if the judged census finds >= 1
refused state, and it found none.

## Verdict: INSUFFICIENT-DATA (census question unanswerable on this band)

Judged exactly against the prereg's band rule:

- Refused Herald states: 0 on all 16 seeds. Completeness is
  0/0 — undefined, not 100%: there is nothing to join, so no
  completeness claim is made. This is the prereg's
  INSUFFICIENT-DATA branch, stated before sims: fewer than
  the census needs, and specifically ZERO refused states.
- instrumentErrors: 0 on all 16 seeds (herald + muster-diag).
  16 usable seeds (>= 8 required).
- Cross-checks: vacuous at 0/0 (no refused attempts, no
  snapshots, no game-side refused records). They are reported
  as vacuous, not as passed.
- Distinct refused state clusters: 0. Distinct refusal
  seeds: 0. The generalization bars therefore resolve as
  NEITHER: not G-GENERALIZES (no second cluster), not
  G-BOUNDED (no cluster to bound against), not G-CONTRADICTS
  (no contradictory cluster). The mustercall-b headline is
  neither confirmed nor overturned by this band — it remains
  a single-seed (85106) census, and this arm says so plainly
  instead of borrowing mustercall-b's numbers.
- Verdict sections (a)–(d) are all present below, with (a)
  and (c) explicitly marked as far as measurable on an empty
  set. The arm is not a failure to run: the instrument
  fired, the band is fresh, and the emptiness is itself a
  measured fact about Herald contact on this band.

## Answer in one paragraph

On a fresh, verified-unused band (86101–86116), the Herald is
never met at all: 0 scholar-channel attempts, 0 villager field
fights, 0 muster snapshots, 0 muster verbs on all 16 seeds —
while the same villages win 12 of 16 runs and reach national
on 9. The muster gate is never even tested here, because
contact never happens. Five seeds end with the Herald
located (omen stage 2) and still zero contacts, and eight
seeds end won on exactly day 90, which censors the contact
window outright: the village wins before the beast it was
supposed to muster against ever walks onto anyone's tile.
Mustercall-b's "offered and reachable" pattern therefore
stands un-generalized — not refuted, not confirmed — and the
bigger finding for the scale wall is upstream of the gate:
on most seeds the scarce thing is not blades, buttons, or
trust, but a meeting.

## Q1 — the census: no refused scholar-channel Herald state exists on this band

Policy stack on every seed (identical to mustercall-b):
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap.

Per-cluster table: EMPTY. No cluster rows, no call yields, no
commit blocks, no re-face counts — there is no state to tabulate,
and inventing one from mustercall-b's table would be fabrication.
What the census does establish, seed by seed:

- Herald TB attempts: 0 (all callers, all classes). Herald
  field fights: 0. Muster snapshots: 0. Muster verbs
  (soundTitanCall / titanCommitOwn / titanSelfDo /
  titanWarCouncil): 0 on every seed. The muster object never
  exists on any seed (endMusterExists false everywhere).
- Wave-4 contact in general is NOT absent: 21 wave-4 TB
  attempts (all FOUGHT, none refused for any reason) and 7
  wave-4 field fights happened on this band, with 5 wave-4
  kills by TB. The emptiness is Herald-specific, not a
  wave-4-content drought: villagers fight wave-4 monsters
  (strike, suburb, audit, algorithm, eulogy, eater,
  congregation, reunion) and never once meet the Herald.
- Omen states at run end: stage 2 (located) on 5 seeds —
  86104 (located day 84, run ends won day 90), 86105
  (located day 179, village lost day 192), 86106 (located
  day 158, survived to the 200d cap, day 201), 86108
  (located day 82, won day 90), 86116 (located day 92, won
  day 93); stage 1 on 86114 (day 83, won day 90); stage 0 on
  86101, 86110, 86115; no omen at all on 86102, 86103,
  86107, 86109, 86111, 86112, 86113.
- The located-but-unfaced set is 5/16 here, up from 3/16 on
  mustercall-b's band (85102, 85107, 85109) — but the two
  bands are different seeds on a moved base, so this is a
  band comparison, not a trend. Two of the five (86105,
  86106) had 13 and 43 days respectively between location
  and run end with still zero contact: for those villages
  contact scarcity is genuine, not a censoring artifact.
  The other three (86104, 86108, 86116) were located 6, 8,
  and 1 days before a day-90 win: the window existed but
  was days long, and the win closed it.
- Is mustercall-b's "5 then 9, ceilings >= 10 on five days"
  the rule or one state? UNANSWERED by this arm. The only
  honest update to the mustercall-b headline is a scope
  note: the pattern is measured on one seed of one band,
  and a second band produced no second cluster to test it
  against. Any future citation of the muster ceiling must
  carry "single-seed (85106)" until a band with refusals
  on >= 2 seeds exists.

## Q2 — channel asymmetry on the same band

| Channel (Herald only) | Attempts / fights | Outcomes |
|---|---|---|
| Scholar TB (startCombat) | 0 attempts | — |
| Villager field (fieldFight) | 0 fights | — |
| TB kills of Herald | 0 | — |
| Field kills of Herald | 0 | — |

Does the asymmetry change any kill outcome? The question is
vacuous here: excluding refused TB attempts changes nothing
(there are none), and gating field fights the way TB is
gated changes nothing (there are no Herald field fights to
gate). The asymmetry mustercall-b judged (field fights
happening while the scholar channel refuses) does not occur
on this band at all, because neither channel fires. The
field/scholar asymmetry is therefore also un-generalized:
it held on 85106 and is absent here, and absence on a band
with zero contact is not evidence the asymmetry is gone —
it is evidence contact is the prior condition for either
channel to say anything.

## Q3 — decision brief: only as far as the new census supports it

No new routing is proposed (per the arm brief: #1538 still
pending a ruling, and this is a census, not a build). What
this census supports, ranked:

1. CONTACT, NOT THE GATE, IS THE FIRST SCARCITY ON THIS
   BAND. Before any routing decision about refused faces
   can matter on a band like this one, the village must
   meet the beast. Five located-but-unfaced seeds, three of
   them closed by a day-90 win within days of location,
   say the meeting itself is the bottleneck — the same
   conclusion mustercall-b drew for its 3 located seeds,
   now on a second band with a larger located set.
2. THE OFFERED-BUTTON QUESTION STAYS OPEN. Mustercall-b's
   channel-1 brief (direct refused face, button offered)
   cannot be re-tested here: no refusal, no offered-button
   observation. Nothing in this census weakens it (the
   button logic is unchanged on this base) and nothing
   strengthens it. A future arm hunting a second cluster
   should prefer bands/seeds where the run does NOT end
   won at day 90 — the win censor is the enemy of this
   census, and a band chosen blind has now twice produced
   either one cluster or none.
3. FEAST-DRAW REGRESSION CHECK: 0 feast-draw Herald
   attempts, 0 cast-sourced Herald faces. #1550 holds on
   this band as well as on mustercall-b's (same declaration,
   second band, no re-claim).
4. CAMPAIGN AUTO-CALL: still not a Herald channel (as in
   mustercall-b); no finale/nielsen attempt occurs (wave 5
   never unlocked), so no other titan's gate is observable
   here either.

## #1550 status (checked, not duplicated)

LANDED in this base: commit 72512906f, exclusion code
present in src/js/game.js castMonster in this worktree
(verified by reading the function at prereg time). Measured
holding on this band: 0 feast-draw Herald attempts, 0
cast-sourced Herald faces. This arm does NOT re-build #1550
and does NOT claim it.

## Sense-testing: no refusal story exists to judge

The herald instrument records transcript slices only around
Herald refusals (first and late), so 0 transcripts on all 16
seeds is consistent with 0 refusals — it is not an
instrument failure (the instrument's other outputs —
attempts, field fights, census, verb counters — are all
populated on this band). The sense question mustercall-b
posed — does the refusal line read honestly the twentieth
time, while the village state moves — cannot be re-judged
here: there is no first telling, let alone a twentieth.
That non-judgment is itself the sense finding for this
band: the village's Herald story is not "a stuck record"
but "a beast that is located, named in gossip, given a
lair tile — and then never met." A player on these seeds
would not ask "why haven't I pressed the button"; she
would never know there was a button to press, because the
omen's stage-2 line ("You cannot face it alone. Sound the
call") arrives, if at all, days before the run ends won —
and on the two long located seeds (86105, 86106) it arrives
and then nothing follows. Whether the stage-2 line without
a meeting reads as a promise or as noise is a question for
a transcript arm on a located seed, not answerable from
this corpus (no say-ring slices are captured for omen
lines by this instrument).

## Wall numbers (fresh band, this base — no old bank quoted)

- Seeds: 16 (pilot 86101–86108 + confirm 86109–86116, single
  policy stack above, 200d death-aware cap; 1 seed hit the
  cap region: 86106 survived to day 201).
- National: 9/16. Table reached: 13/16. Wins: 12/16. Wave 4
  unlocked: 11/16. Wave 5 unlocked: 0/16.
- Median survival: 90 game days. Max: 201. End reasons:
  won/over-other 12, village-lost 3 (86105 day 192, 86111
  day 77, 86113 day 55), survived 1 (86106 day 201).
- Band comparison (NOT a before/after — different seeds,
  moved base): mustercall-b's band was national 8/16, table
  12/16, wins 11/16, wave 4 9/16, wave 5 0/16, median 106.5,
  max 139. This band is slightly higher on every reach
  number and much lower on median survival (90 vs 106.5)
  because eight seeds end won on exactly day 90. No
  improvement claim is made: the day-90 win cluster is a
  property of this band's seeds under this policy stack,
  and it is the same censoring mechanism that empties the
  census. Wave 5 remains 0/16 on both bands.
- Wave-4 TB attempts by outcome on this band: 21 attempts,
  21 FOUGHT (0 refused for any reason, 0 THROW). Wave-4
  field fights: 7 (outcomes: vDie 3, vFlee 1, evade 3).
  Wave-4 TB kills: 5. Herald share of all of it: 0.

## Village assessment (plain words)

These villages climb fast and win fast — 12 of 16 win, most
of them by day 90, before the late game has time to happen.
That speed is the story of this band: the villages are not
weak, they are finished. The Herald, the muster, the
coalition blades, the commit button — the whole late
apparatus mustercall-b measured — sits offstage while the
village takes a lesser seat and the run ends. On the two
seeds where the run does last (86105, lost day 192; 86106,
survived past day 200), the Herald is located and still
never met: the village fights other wave-4 monsters, loses
villagers to them, and never once walks onto the Herald's
tile or has a villager stumble on it in the wild. So the
scale wall, seen from this band, has two faces: for most
seeds the run ends before the wall is reached, and for the
long seeds the wall's first door — a meeting — never opens.
Fixing the muster gate would change nothing on this band,
because the gate is never reached. The next measurement
on this channel needs a band where villages survive long
enough, and stay un-won long enough, to meet what they
located.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The pilot gate's activity signal (a Herald TB attempt,
   a Herald field fight, OR omen stage >= 2) is too weak:
   the pilot passed on omen-2 alone (4 pilot seeds), and
   the confirm then found zero Herald contact of any kind.
   A future second-cluster arm should require a Herald
   CONTACT signal on >= 1 pilot seed (attempt or field
   fight), not omen stage, before confirm spend — omen
   stage predicts location, not meeting.
2. The day-90 win cluster (8/16 seeds ending won on exactly
   day 90) should be named in the next arm's prereg as a
   censoring mechanism to design around (e.g. prefer seeds
   whose pilot runs last past day 120 un-won), not
   discovered again mid-run. It is not analyzed here
   beyond its censoring effect; what the day-90 win IS
   (which seat, which path) is a question for a table-path
   arm, not this census.
3. Completeness on an empty set must stay undefined, never
   100%: the analyzer prints "n/a" and this evidence does
   the same. A future analyzer version should refuse to
   print a completeness percentage when the denominator is
   0, rather than relying on the evidence writer to catch
   it.
4. The located-but-unfaced count (5/16) is now measured on
   two bands (3/16 herald band, 5/16 here) with the same
   instrument. It is the most robust number this arm
   produces, and the next arm on this channel should
   pre-register it as a secondary metric rather than
   treating it as color.

## Convergence state

converging (measurement, not a lever): the scale-onramp axis
now has a second mustercall band, and its result bounds the
first: mustercall-b's offered-and-reachable census remains
single-seed, and Herald contact itself is now measured as
scarce (0/16 contacts, 5/16 located-but-unfaced) on a fresh
band. The next work on this channel is still the #1538
decision — but this arm adds a prior question for it: a
routing rule for refused faces matters only on bands where
faces happen, and the census hunt should now select for
contact, not just for freshness.

## Coordinator follow-ups (not done here — coordinator owns landing)

- Merge: evidence + prereg + instrument + sweep + analyzer +
  proof test + corpus (all to be committed on
  sim-mustercall2-a). No game-code change, so "measurement
  only" in substance — the corpus + instrument land as the
  second-cluster baseline for the next lever arm on this
  channel.
- Telemetry deviation check (loop step 10) against
  hidden_files/telemetry-baselines/scale-wall.json — left to
  the coordinator after landing, since the baseline
  roll-forward decision belongs to the run, not the arm.
- Findings-backlog: this arm reports (does NOT edit
  hidden_files/sim-findings.md itself): (a) second-cluster
  hunt returns INSUFFICIENT-DATA — Herald contact 0/16 on
  fresh band 86101–86116, mustercall-b stays single-seed;
  (b) day-90 win cluster (8/16) censors the Herald contact
  window; (c) located-but-unfaced now 5/16 on a second band;
  (d) pilot-gate activity signal should require Herald
  contact, not omen stage, next time. No new backlog number
  is claimed here — numbering belongs to the coordinator.
- Quotation corrections to carry forward: muster ceiling is
  still "call 5 (early) / 9 (late), ceilings 5–12 by day, gate
  met on five refusal days" — but ONLY for seed 85106; the
  band-wide muster ceiling is unmeasured. Herald refusals
  remain 35 total across both bands (35 on 85106, 0 here).
  Wave 5 remains 0/16 on both bands.
