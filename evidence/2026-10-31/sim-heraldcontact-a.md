# sim-heraldcontact-a — second-cluster Herald-contact hunt, longevity-screened (MEASUREMENT ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T0915Z.
Worktree branch: sim-heraldcontact-a.
Base anchor: per-seed JSONs (`anchorCommit` field; worktree HEAD at
sweep time 7c3295767, the prereg + instrument commit, which includes
Loop A arm sim-titanexcl-a 72512906f, backlog #1550).
Pre-registration: evidence/2026-10-31/sim-heraldcontact-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/herald-instrument-20261030.js (HERALD=1,
verbatim reuse) + scripts/policies/muster-diag.js (MUSTER=1,
verbatim reuse) + NEW scripts/heraldcontact-sweep-20261031.js +
scripts/heraldcontact-analyze-20261031.js (mustercall2 sweep /
analyzer with only the output dir and seed default changed; diff
verified as exactly those changes) + NEW
scripts/heraldcontact-screen-20261031.js (longevity screen, no
recorders — see below).
Proof: scripts/test-heraldcontact-20261031.js — 28/28 green
(synthetic fixtures only; no band seeds), plus a corpus
determinism leg: seed 87127 re-run to a scratch dir is
byte-identical to the judged JSON.
Corpus: evidence/2026-10-31/perseed-heraldcontact/leadfeast/
s87104, s87115, s87119, s87127, s87137, s87140, s87109, s87120
(pilot only — the confirm was never run, see verdict) +
heraldcontact-analysis.json + screen-87101-87140.json (screening
corpus, NOT judged sims).
No game code changed. No policy file edited. No [needs-eyes]
(measurement only, nothing player-facing). Panel (§15): NOT
APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same declaration
as mustercall-b/2 and herald-b). No post-block replay was run:
the prereg allows one only if the judged census finds >= 1
refused state, and it found none.

## Verdict: INSUFFICIENT-DATA (pilot contact gate failed — no confirm spend)

Judged exactly against the prereg's contact-gated pilot rule:

- Pilot: 8/8 seeds ran, instrument fired on all 8, instrumentErrors
  0 on all 8 (herald + muster-diag), per-seed JSONs valid.
- Herald CONTACT on pilot seeds: 0/8. Not one scholar-channel
  attempt, not one villager field fight, not one muster snapshot,
  not one muster verb, on any pilot seed. Omen stage alone does
  NOT pass this gate (prereg, task-directed tightening) — and it
  matters here: 3/8 pilot seeds ended at omen stage 2, which
  under mustercall2-a's omen-accepting gate would have passed
  the pilot and spent a confirm on a contactless band. The
  tightening saved that spend.
- The run therefore STOPS at pilot, exactly as the prereg orders:
  no confirm seeds were run, no band-shopping to chase a contact.
  The 11 selected confirm seeds (87121, 87124, 87126, 87134,
  87107, 87135, 87132, 87123, 87103, 87138, 87128) were never
  censused and are named here only as the un-run selection, not
  as data.
- Completeness is 0/0 — undefined, not 100%: there is nothing to
  join, so no completeness claim is made. Cross-checks are
  vacuous at 0/0 (no refused attempts, no snapshots, no
  game-side refused records). They are reported as vacuous, not
  as passed.
- Distinct refused state clusters: 0. Distinct refusal seeds: 0.
  The generalization bars therefore resolve as NEITHER: not
  G-GENERALIZES, not G-BOUNDED, not G-CONTRADICTS. The
  mustercall-b headline ("offered and reachable", single seed
  85106) is neither confirmed nor overturned by this arm — it
  remains a single-seed census, and this arm says so plainly
  instead of borrowing mustercall-b's numbers.
- Prereg deviation, recorded not hidden: the prereg fixed confirm
  at 12 (16 if tier A alone supplied >= 24). The 40-seed pool
  yielded only 19 selectable seeds (6 tier A + 6 tier B + 7
  tier C), so a confirm would have been 11, not 12. The
  deviation is moot for this verdict (the pilot gate stopped
  the run before any confirm), but a future arm reusing this
  selection rule must either screen a larger pool or pre-register
  "confirm = all remaining selected seeds" instead of a fixed 12.
- Verdict sections (a)–(d) are all present below, with (a) and
  (c) explicitly marked as far as measurable on an empty set.
  The arm is not a failure to run: the instrument fired, the
  band is fresh, the screen worked, and the emptiness is itself
  a measured fact — now a stronger one than mustercall2-a's,
  because the longevity screen removed the day-90-win excuse
  and contact still never happened.

## Answer in one paragraph

Forcing the Herald window open does not produce a Herald meeting.
On a fresh, verified-unused pool (87101–87140) screened for
longevity, the 8 pilot villages all reached national, 4 survived
to the 200-day cap un-won, 2 won late (days 121 and 146), and the
median pilot survival was 184 days — yet the Herald was never met
on any of them: 0 scholar attempts, 0 field fights, 0 muster
snapshots, 0 muster verbs. Three pilot seeds ended with the
Herald located (omen stage 2) and still zero contacts, two of
them with 30- and 36-day windows between location and run end
during which wave-4 monsters met villagers repeatedly (5 field
fights and a fought scholar battle on 87127 alone) while the
Herald never walked onto anyone's tile. The censoring mechanism
on this band is therefore NOT the day-90 win that censored
mustercall2-a — the screen selected past it — but two things
upstream of the muster gate: (1) wave 4 never unlocks on 3/8
pilot seeds, so the Herald omen never starts (villages can reach
national and survive to the cap at wave 2–3); and (2) a located
Herald does not come to the village — placement is not contact,
and a lair somewhere on the map is not a meeting. The muster
gate is never even tested here, because contact never happens.
The scarce thing on the scale road is still, first, a meeting.

## Step 1 — the longevity screen (what it did and did not buy)

Screen policy = census policy stack exactly
(`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap), NO recorders, longevity fields
only. 40 seeds, all usable. Screen corpus:
evidence/2026-10-31/perseed-heraldcontact/screen-87101-87140.json.

Screen-pool numbers (NOT judged — the pool the selection drew from):

| Measure | Screen pool (40 seeds) |
|---|---|
| Won | 27/40 (13 of them on exactly day 90) |
| National reached | 30/40 |
| Table reached | 28/40 |
| Median survival | 97 days; max 201 |
| Max wave reached | wave 4: 20, wave 3: 16, wave 2: 3, wave 1: 1 |
| End omen stage 2 (located) | 14/40 |
| Un-won and past day 120 (tier A) | 6 |
| Won after day 120 (tier B) | 6 |
| Un-won under day 120 (tier C) | 7 |
| Excluded (won on/before day 120) | 21 |

Selection (mechanical, prereg order: tier A seed-asc, then tier B
seed-asc, then tier C survival-desc): pilot = 87104, 87115, 87119,
87127, 87137, 87140 (tier A) + 87109, 87120 (tier B); confirm =
87121, 87124, 87126, 87134 (tier B) + 87107, 87135, 87132, 87123,
87103, 87138, 87128 (tier C). The day-90-win cluster persists on
this stack: 13/40 screen seeds won on exactly day 90, and 21/40
were excluded for winning on or before day 120 — the screen had
to discard more than half the pool to buy long windows, and the
buy still did not buy contact.

Screen-vs-sweep agreement (the prereg's check): 8/8 pilot seeds
agree EXACTLY on gameDays, won, national, table, and maxWave
between the recorder-free screen and the recorder-carrying sweep.
The recorders do not move trajectories on this band; the screen
is a valid longevity predictor, and its failure to predict
contact is a finding about contact, not about the screen.

## Q1 — the census: no refused scholar-channel Herald state exists on the pilot

Policy stack on every pilot seed (identical to mustercall-b/2).
Per-seed pilot table (days = gameDays at run end):

| Seed | Tier | Days | Won | Nat | Table | Max wave | W4 day | End omen | Herald TB | Herald FF | Snaps | Verbs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 87104 | A | 201 | 0 | 1 | 0 | 3 | — | null | 0 | 0 | 0 | 0 |
| 87115 | A | 201 | 0 | 1 | 0 | 4 | 148 | 2 (day 193) | 0 | 0 | 0 | 0 |
| 87119 | A | 167 | 0 | 1 | 0 | 2 | — | null | 0 | 0 | 0 | 0 |
| 87127 | A | 201 | 0 | 1 | 0 | 4 | 152 | 2 (day 165) | 0 | 0 | 0 | 0 |
| 87137 | A | 136 | 0 | 1 | 0 | 4 | 82 | 2 (day 106) | 0 | 0 | 0 | 0 |
| 87140 | A | 201 | 0 | 1 | 0 | 2 | — | null | 0 | 0 | 0 | 0 |
| 87109 | B | 121 | 1 | 1 | 1 | 3 | — | null | 0 | 0 | 0 | 0 |
| 87120 | B | 146 | 1 | 1 | 1 | 4 | 144 | null | 0 | 0 | 0 | 0 |

Per-cluster table: EMPTY. No cluster rows, no call yields, no
commit blocks, no re-face counts — there is no state to tabulate,
and inventing one from mustercall-b's table would be fabrication.
What the census does establish, seed by seed:

- Herald TB attempts: 0 (all callers, all classes). Herald field
  fights: 0. Muster snapshots: 0. Muster verbs
  (soundTitanCall / titanCommitOwn / titanSelfDo /
  titanWarCouncil): 0 on every seed. The muster object never
  exists on any seed (endMusterExists false everywhere).
- Wave-4 contact in general is NOT absent: 5 wave-4 TB attempts
  (all FOUGHT, none refused for any reason) and 12 wave-4 field
  fights happened on the pilot, with 1 wave-4 TB kill. The
  emptiness is Herald-specific, not a wave-4-content drought:
  villagers fight wave-4 monsters (eulogy, influencer,
  congregation, reunion, suburb, eater) and never once meet the
  Herald.
- Located-but-unfaced: 3/8 (87115, 87127, 87137) — windows
  between location and run end of 8, 36, and 30 days
  respectively. The 8-day window (87115) could still be
  censoring-adjacent; the 36- and 30-day windows are not. On
  87127 the village fought wave-4 monsters on days 180, 186,
  188, 191, 196, and 197 — inside the located window — while the
  Herald, located since day 165, never appeared. On 87137 the
  village fought wave-4 monsters on days 115–117 and 125–128
  inside its located window (located day 106, died day 136; its
  day-87 influencer kill predates location).
  Contact scarcity here is genuine, not a window artifact, and
  it is now measured on longevity-selected seeds, not just on a
  fresh band.
- No wave-4 unlock, no omen: 3/8 pilot seeds (87104 wave 3,
  87119 wave 2, 87140 wave 2) never unlocked wave 4 at all, so
  the Herald omen (wave 4 unlocked + regional+, titans.js)
  never started — despite all three reaching national and two
  surviving to the 200-day cap. Scale and wave progression are
  decoupled on this stack: a village can be national, enduring,
  and entirely pre-Herald.
- Late wave-4 + fast win: 87120 unlocked wave 4 on day 144 and
  won on day 146. Omen staging needs >= 4 days to stage 1 and
  >= 9 more to stage 2, so even the first omen whisper cannot
  complete inside a 2-day window. The lesser win closes the
  titan road before it opens — a third, distinct censoring
  flavor, separate from the day-90 cluster and from genuine
  no-meeting scarcity.
- Is mustercall-b's "5 then 9, ceilings >= 10 on five days" the
  rule or one state? UNANSWERED by this arm, as by mustercall2-a.
  The only honest update to the mustercall-b headline is a scope
  note that now carries more weight: the pattern is measured on
  one seed of one band, and a second hunt — this time with the
  window forced open by longevity selection — produced no
  second cluster to test it against. Any future citation of the
  muster ceiling must carry "single-seed (85106)" until a band
  with refusals on >= 2 seeds exists.

## Q2 — channel asymmetry on the pilot

| Channel (Herald only) | Attempts / fights | Outcomes |
|---|---|---|
| Scholar TB (startCombat) | 0 attempts | — |
| Villager field (fieldFight) | 0 fights | — |
| TB kills of Herald | 0 | — |
| Field kills of Herald | 0 | — |

Does the asymmetry change any kill outcome? The question is
vacuous here: excluding refused TB attempts changes nothing
(there are none), and gating field fights the way TB is gated
changes nothing (there are no Herald field fights to gate). The
asymmetry mustercall-b judged (field fights bypass the gate,
scholar TB refuses) cannot be re-judged on a band with no Herald
fights on either channel. What CAN be said: the field channel is
alive for other wave-4 monsters on this pilot (12 fights, 4
vDie, 6 vFlee, 2 evade across 87115/87127/87137), so a Herald
field fight would have been capturable had one happened — the
instrument was not deaf, the beast was absent.

FEAST-DRAW REGRESSION CHECK: 0 feast-draw Herald attempts, 0
cast-sourced Herald faces. #1550 holds on this pilot (not a
re-claim — a measured check, as in mustercall-b/2).

## Q3 — decision brief, as far as measurable on an empty set

No new routing is proposed — #1538 still pending, and this arm
adds no refused face to route from. The mustercall-b brief's
ranked channels are UNTESTED on a second cluster, and this arm
sharpens what the next test must clear before any of them can
even arise:

1. DIRECT REFUSED FACE (scholar's own eyes) — cannot arise
   without contact. The pilot shows the precondition itself is
   the scarce thing: no scholar stood on the Herald's tile on
   any pilot seed.
2. Any gossip/scout-mediated channel — likewise untestable here:
   the omen line is spoken (stage 2 on 3 seeds) but no villager
   ever meets the beast to gossip about, and no muster verb is
   ever pressed.
3. The brief's open design question therefore moves one step
   upstream: before "which perceivable channel sounds the call",
   the question is "by what path does a located Herald ever get
   met" — placement vs wandering vs lair reachability. That
   question is handed to the coordinator as a backlog item
   (below), NOT answered here, and NOT a routing build: this
   arm sizes contact, it does not build the route.

## Wall numbers (pilot, 8 seeds)

| Measure | Pilot |
|---|---|
| National reached | 8/8 |
| Table reached | 2/8 |
| Won | 2/8 (days 121, 146 — both table-flagged) |
| Wave 4 reached | 4/8 |
| Wave 5 reached | 0/8 |
| Median survival | 184 days; max 201 |
| Herald contacts | 0/8 seeds; 0 attempts; 0 field fights |
| Located-but-unfaced | 3/8 |

Plain-words read: these are strong villages — every one of them
national, half of them alive at the cap — and none of them ever
meets the wave-4 titan, none reaches wave 5, and only the two
that win do so through the table without the titan road. The
scale wall on this stack does not look like starvation here
(contrast the 2026-10-12 starve-mid-ambition picture): it looks
like a road whose first titan never shows up — villages climb
to national, win lesser or endure, and the Herald chapter stays
unopened.

## Village assessment — what the villages looked like

- 87104 (201d, survived, national, wave 3): the quiet
  endurer. 17 deaths, no wave-4 content at all, no omen. A
  national village that never even unlocked the wave that
  contains the Herald.
- 87115 (201d, survived, national, wave 4 day 148): located the
  Herald on day 193 and lived 8 more days without meeting it.
  40 deaths, combat-dominated (21 villager-combat, 12 combat).
  A villager died to a wave-4 reunion on day 193 — the same day
  the Herald was located — fighting something else.
- 87119 (167d, died, national, wave 2): the other quiet one.
  46 deaths, national rank, wave 2. Scale without wave
  progression, ending in death rather than a win.
- 87127 (201d, survived, national, wave 4 day 152): the
  sharpest located-but-unfaced case. Herald located day 165;
  the village then fought wave-4 monsters six times in the
  window (days 180–197) and never met the Herald. 41 deaths,
  28 of them combat-related. Endurance with a full war going
  on around an absent titan.
- 87137 (136d, died, national, wave 4 day 82): the fighting
  village. The pilot's only wave-4 TB kill (scholar's party
  killed an influencer, day 87); Aria Thompson fled a
  wave-4 influencer at 12 HP on day 115 and died to an eater
  the next day — a named villager's two-day arc, fought hurt,
  came back, died. Herald located day 106; 30 days of window;
  zero Herald meetings while the village bled against other
  wave-4 monsters.
- 87140 (201d, survived, national, wave 2): 11 deaths, the
  pilot's quietest village — national, cap-surviving, wave 2,
  no omen, no wave-4 content. Longevity and scale, no titan.
- 87109 (121d, won, national, table, wave 3): won without
  wave 4 and without any omen. The win road does not need the
  Herald on this stack.
- 87120 (146d, won, national, table, wave 4 day 144): won two
  days after unlocking wave 4 — the win closed the titan road
  before the omen could stage.

Who thrived and who died and why, in one line: the strong
villages won lesser or endured at national without the titan;
the fighting village (87137) died against other wave-4 monsters
while the Herald stayed unmet; nobody's story touches the
Herald at all. Knowledge/capabilities missing: not blades, not
trust, not buttons — a meeting. The blank this arm fills is the
measurement that longevity selection does not fix contact:
window length was the suspected censor, and removing it changed
nothing.

## Sense-testing read (SENSE-TESTING LAW)

- There are NO refusal transcripts to read: zero attempts means
  zero say-ring slices (the instrument captures say lines only
  on refused/thrown attempts, and the pilot JSONs' transcript
  arrays are empty throughout). That absence is the finding, not
  a gap in the read — there is no refusal line to judge for
  honesty-after-repetition on this band, because the line is
  never spoken.
- What CAN be read — the wave-4 field fights — reads like
  people, not counters. Adaeze Nwosu flees a congregation at 34
  HP after dealing 44 damage (87127, day 188); Hannah Kim flees
  a eulogy at 50 HP, then again at 24 HP two days later (87127,
  days 196–197); Aria Thompson's flee-at-12-HP then death the
  next day (87137) is a coherent, sad little story, not a
  repeated line. Villagers in the wild act sensibly: they fight
  briefly, take heavy damage, and run while they still can.
  The sense failure on this band is elsewhere: the stage-2 omen
  line tells the village "scouts found its lair... You cannot
  face it alone. Sound the call" — and then, on 87127 and 87137,
  nothing arrives for 36 and 30 days while the village fights a
  full wave-4 war against other monsters. A promised arrival
  that never arrives is a narration the village cannot act on:
  the call button (for anyone opening the camp bar) points at a
  beast nobody has seen, and no villager ever goes to look for
  it. That is the sense note for the coordinator: the omen
  speaks as if a meeting were imminent, and the meeting is not.
- Death causes reinforce the picture: combat dominates the
  late game on every pilot seed with deaths (87127: 28/41
  combat-related; 87137: 26/39; 87115: 33/40). The villages'
  stories are violent and legible; the Herald contributes
  nothing to any of them on this band.

## Metric review (for the NEXT run)

1. The contact-gated pilot gate BEHAVED — and proved its worth:
   under mustercall2-a's omen-accepting gate, 3 omen-stage-2
   pilot seeds would have passed and a confirm would have been
   spent on a contactless band. The tightening (omen alone is
   not contact) is validated by this run and should be kept for
   any future contact hunt.
2. The longevity screen predicted windows but NOT contact.
   Longevity is necessary for a Herald meeting (a day-90 win
   closes the window) but not sufficient: wave unlock and
   Herald wandering are the actual gates, and the screen does
   not measure either. A future hunt that wants contact, not
   just window, needs a screen on wave-4 unlock PLUS a
   Herald-position instrument (where the placed lair sits
   relative to where villagers walk) — or it will keep buying
   long windows and finding empty ones.
3. Classification rules are UNTESTED on positive cases in this
   arm: with zero refusals, the join/taxonomy/ceiling logic ran
   only on synthetic fixtures (28/28 green) and on prior bands.
   No rule misfired, but no rule was exercised by real census
   data either. The analyzer's 0/0 outputs are reported as
   n/a and vacuous, never as 100% — a future arm must keep that
   discipline (0/0 is not a pass).
4. Confirm-size deviation (see verdict): a fixed "confirm = 12"
   does not survive a pool that yields 19 selectable seeds.
   Pre-register "confirm = all remaining selected seeds" or
   screen a larger pool; do not quietly add unselected seeds to
   reach 12.
5. The screen's own selection frame deserves a note: 21/40
   screen seeds were excluded for winning on/before day 120,
   13 of them on exactly day 90. The win-pursuit stack's day-90
   win cluster is itself a censoring mechanism for ANY
   long-window question, and any future longevity-selected arm
   should budget for discarding roughly half its pool.

## Backlog items (for the coordinator — NOT appended to sim-findings.md by this arm)

1. Herald placement vs wandering: a located Herald (omen stage
   2, lair placed) never contacts anyone in 30- and 36-day
   windows while wild wave-4 monsters contact repeatedly on the
   same seeds. Measurement question: where does titanPlace put
   the lair relative to villager paths, and does the placed
   Herald move under monster-turn rules toward inhabited tiles
   or sit on its lair? Needs a position instrument, not a
   routing build.
2. Wave unlock decoupled from scale: 3/8 pilot villages reached
   national at wave 2–3 and never unlocked wave 4, so the Herald
   omen never started. Measurement question: what gates wave
   unlock on this stack, and is national-without-wave-4 the
   normal road or a stall?
3. Late wave-4 + fast lesser win (87120: wave 4 day 144, won day
   146): the omen staging clock (13+ days) cannot fit inside a
   2-day window. Measurement/design question: is the lesser win
   supposed to be reachable before the titan road even opens,
   or should the titan road open earlier relative to the win?
4. Day-90 win cluster persists (13/40 screen seeds won exactly
   day 90): the win-pursuit stack funnels wins to day 90 on most
   seeds, censoring every long-window question. Already known
   from mustercall2-a; confirmed here on a fresh pool with the
   screen counting it.
