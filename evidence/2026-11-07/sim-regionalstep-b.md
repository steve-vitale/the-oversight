# sim-regionalstep-b — why does scale never leave `village`? The door is never knocked on — DIAG-GO

**Arm:** sim-regionalstep-b (run fleshout-loop-b-20261107T0930Z, axis
scale-onramp / winnability chain) · **DIAG only, zero src/js, zero
policy edits:** replay the frozen staged policy
(`scripts/policies/competent-stageally-a.js`, unmodified) on band
53001–53008 with a regional-gate recorder reading the live gate chain
every day. **Verdict: DIAG-GO** — by the preregged bar: a single named
gate explains the no-regional state on 148/149 (99.3%) of 53006's
no-regional days (bar ≥ 80%), with per-day gate state shown in the
corpus; the same gate dominates all 8 seeds (931/940 no-regional
seed-days band-wide, 99.0%).
**Band:** 53001–53008 DELIBERATELY REUSED (a re-read of the
sitstep-b/confirm2 trajectories, not a fresh band) · **Horizon:** 150d
death-aware · **Legs:** staged replay only (DIAG — no baseline leg;
the comparison is replay vs sitstep-r2 staged headlines) · **Corpus:**
`evidence/2026-11-07/perseed-regionalstep-b/` (8 files, base
32d79b713) · **Prereg:**
`evidence/2026-11-07/sim-regionalstep-b-prereg.md` (committed
98605d40d before any judged sim) · **Proof:**
`scripts/test-regionalstep-20261107.js` 29/29 green before the judged
run (see the classifier-order fix below) · **Analyzer:**
`scripts/regionalstep-analyze-20261107.js` (analysis at
`/tmp/regionalstep-analysis.json` — working copy, the evidence file
is the record) · **Raise-window audit:**
`/tmp/regionalstep-raise-audit.js` (working copy).

**The one-line result, plainly:** scale never leaves `village`
because nobody ever asks. The villages are known by day 3–5,
courtship-ready the same day, and would accept a link outright from
about day 9 — and `proposeLink` is called zero times on all eight
seeds. No link ever forms, so no first accord ever stages, no bond
ever seasons, and the Regional Dawn never has anything to fire on.
Standing points cannot open this door (415 did not — and the
diplomacy half of standing is 0 on every seed, because diplomacy
counts only seasoned regional+ links). The gate chain works as
designed; the policy simply never walks up to it. The lever is a
link-forming drive — propose, and answer the link raises villagers
already bring.

## The gate, as measured (53006, 149 no-regional days)

Per-day classification by the first failing link in the regional
chain (know → courtship → attempt → counter → link → gesture →
seasoning → dawn), same rule in the recorder and the analyzer:

| Gate | No-regional days | Share |
|---|---|---|
| courtship-no-attempt | 148 | 99.3% |
| no-known-village | 1 | 0.7% |
| known-no-courtship / counter-unanswered / attempted-no-link / link-broken / link-young / seasoned-no-dawn / regional | 0 | 0% |

The chain, link by link, on 53006:

| Link | State on 53006 |
|---|---|
| KNOW | first known day 4 (Emberhold, Stonebridge, Thornfield — all three main villages by day 4); knownCount 3 at end |
| COURTSHIP | courtship-ready day 4 — the same day as known. Best deterministic judge 65.4 on day 9 (would accept outright: 65.4 − 10 RNG = 55.4 ≥ 55), rising to 96 by day 116 (village_2/Thornfield, opinion 46, as-subordinate offer) |
| ATTEMPT | **0 `proposeLink` calls, 0 accepted link raises, 0 counters staged, 0 covenant/trade proposals, 0 raids launched** — the whole diplomacy verb set is untouched for 150 days |
| LINK | 0 links ever formed (active 0, broken 0) |
| GESTURE | no first accord ever staged (`pendingAccord` null, `_regionalPending` null, `accordUnanswered` false, all 150 days) |
| SEASONING | nothing to season — no bond exists |
| DAWN | `networkLive` false on all 150 days; `networkLiveDay` null |

The as-subordinate offer scores higher than the as-primary offer on
every known village, every day (the +10 subordinate bonus plus the
+8 generosity term at 4,000 kcal tribute): joining as a subordinate
is the easier door, and it is never knocked on either.

## Band-wide: the same gate on every seed

| Seed | Days | End | Standing | Known day | Courtship-ready day | Best det (day) | Propose calls | Links ever | Raises (expired) |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 106 | village-lost | 199 | 5 | 5 | 92 (d68) | 0 | 0 | 6 (6) |
| 53002 | 150 | survived | 150 | 3 | 3 | 90 (d113) | 0 | 0 | 16 (16) |
| 53003 | 92 | village-lost | 199 | 4 | 4 | 82 (d86) | 0 | 0 | 9 (8) |
| 53004 | 88 | village-lost | 199 | 4 | 4 | 89 (d60) | 0 | 0 | 7 (7) |
| 53005 | 89 | village-lost | 70 | 4 | 4 | 80 (d59) | 0 | 0 | 5 (5) |
| 53006 | 150 | survived | 415 | 4 | 4 | 96 (d116) | 0 | 0 | 15 (14) |
| 53007 | 150 | survived | 199 | 4 | 4 | 93 (d133) | 0 | 0 | 13 (13) |
| 53008 | 123 | village-lost | 150 | 4 | 4 | 86 (d105) | 0 | 0 | 11 (11) |

Band totals: 940 no-regional seed-days, 931 (99.0%)
`courtship-no-attempt`, 9 (1.0%) `no-known-village` (the first 1–2
days of each run, before the early-contact curve delivers the first
village — SCALE.md's ~day 4–5 contact works as designed). The
`known-no-courtship` gate fires nowhere after day 1: the worst
known village on most seeds would still accept (final-day detSub
55+ even on splinter villages; main villages 62–88). Courtship is
not the blocker, knowledge is not the blocker, the seasoning clock
is not the blocker — the ask is the blocker, and the ask never
happens.

## The raise path is doubly closed (secondary)

Villagers DO bring the idea — 82 link raises staged band-wide
(5–16 per seed), and all 80 decided ones expired; 0 accepted, 0
refused, 2 still pending when their runs ended. The raise path is
closed twice over:

1. **The scholar usually doesn't reach the raiser in time.** A
   raise lives 2 days. On a first-raise basis (approximate — the
   history keeps only the latest outcome per villager|village pair,
   so re-raises merge), the scholar talked to the raiser inside the
   window on ~30/82 raises (37%). The scholar talks plenty
   (95–170 talk calls per seed) — but the talk target is picked
   without regard to who is holding a raise.
2. **Even when they do talk, the raise is never answered.** The
   policy's conversations cannot pick `link:accept`: `talkRound`
   opens a conversation and walks straight out (zero exchanges —
   `COMPETENT_TALK` is unset in the driver), and the staged
   invite-ask picker (`chooseConversationChoice`) only ever picks
   invite/answer/goon/subject. `acceptLinkRaise` calls: 0.
   `declineLinkRaise` calls: 0. The raise dies unanswered either
   way.

**The clean case — Rosa, days 5–9 (53006).** Rosa Mendez raises
the idea on day 5 ("We should link with Emberhold. I know them.
We'd be stronger together." — the `linkRaiseLine` wording for her
lore). The scholar talks to Rosa on day 6 — inside the window —
and the raise is still pending on days 7 and 8, then gone on day 9
(expired at the day-9 boundary). One chance, one conversation, zero
exchanges: the scholar said hello to the villager holding the link
idea and walked away from it. Rosa raised the same idea twice more
for other villages (days 10 and 40); both expired too. The
villagers keep asking. The policy keeps not hearing them — not
because the villagers are silent, but because the policy's
conversations have no door for the answer.

## Before / after (replay vs sitstep-r2 staged headlines)

The replay reproduces the sitstep-r2 staged leg EXACTLY on all 8
seeds (same band, same frozen policy; master moved dab55c69 →
32d79b713 via the journey-establishment r109 landings +
sim-capabledeed-a, and the fragile staged trajectory did NOT move):

| Seed | Sitstep-r2 (days, end, w4+k) | This replay (days, end, w4+k) | Pair days |
|---|---|---|---|
| 53001 | 106, lost, 1 | 106, lost, 1 | 0 |
| 53002 | 150, survived, 1 | 150, survived, 1 | 0 |
| 53003 | 92, lost, 2 | 92, lost, 2 | 0 |
| 53004 | 88, lost, 1 | 88, lost, 1 | 0 |
| 53005 | 89, lost, 0 | 89, lost, 0 | 0 |
| 53006 | 150, survived, 8 (2 w5) | 150, survived, 8 (2 w5) | 51 |
| 53007 | 150, survived, 4 | 150, survived, 4 | 11 |
| 53008 | 123, lost, 0 | 123, lost, 0 | 0 |

Guard holds: the replay is deterministic on this master (53006:
150d, standing 415, 8 wave-4+ kills, wave 5 unlocked, 51 pair
days — identical to sitstep-r2 and to the proof's live leg).
Instrument errors: 0 on all 8 seeds. Driver note: the first judged
invocation's session was lost after 5 seeds (53001–53005 written,
driver gone); seeds 53006–53008 were re-run in a second invocation
and the 5 completed files were untouched — the second run's 53006
reproduces the proof's live-leg numbers exactly, so the split run
changed nothing.

## Standing: war and bread, zero bonds

Final standing breakdown (`villageStanding()` — war / diplomacy /
plenty) makes the point in numbers:

| Seed | Total | War | Diplomacy | Plenty |
|---|---|---|---|---|
| 53001 | 250 | 250 | 0 | 0 |
| 53002 | 150 | 150 | 0 | 0 |
| 53003 | 225 | 225 | 0 | 0 |
| 53004 | 265 | 225 | 0 | 40 |
| 53005 | 70 | 50 | 0 | 20 |
| 53006 | 415 | 375 | 0 | 40 |
| 53007 | 375 | 375 | 0 | 0 |
| 53008 | 150 | 150 | 0 | 0 |

Diplomacy is 0 everywhere — not because the diplomacy source is
broken, but because it counts only seasoned regional+ links and
there are no links at all. The 415 on 53006 is war 375 + plenty 40:
the village fought its way to the highest standing on the band
without a single bond. `scaleRank()` reads flags, not points, so no
standing total — 415 or 4,150 — would have moved it.

## Wall numbers (this run)

National / table / wins: **0 / 0 / 0** · Wave 4 unlocks 7/8 ·
Wave 5 unlocks 1/8 (53006), faced 1/8, kills on 1 seed (2 kills,
53006) · Median survival **114.5d** (survivals 88, 89, 92, 106,
123, 150, 150, 150) · Max survival 150d (3 seeds). The scale wall
is the wall, and the wall is an unasked question: the chain runs
wild ally-join → wave-4 kills → veterans → readiness-5 release →
wave-5 facing, and stops at the seat on scale + the feast deed —
and scale stops at the ask.

## Village assessment (plain words)

A village that knows three neighboring fires by day four, is liked
by them (opinions in the twenties and forties by the end), and
could have joined hands with any of them from about day nine —
any of them would have said yes — spends a hundred and fifty days
alone instead. Not because the neighbors refused. Not because the
village didn't know them. Not because the price was too high. The
neighbors kept coming to Haven with the idea themselves — Rosa on
day five, then again and again, eighty-two times across the band —
and every time the idea died unanswered, usually because nobody
even walked over to hear it, and the one time someone did, they
said hello and left. Meanwhile the same neighbors came in the night
and carried off the pantry instead: Thornfield on day 14, again
day 17, Emberhold day 20 — the villages that would have accepted a
link on day nine raided the village that never asked. Haven fought
its way to the fifth wave and killed two of those monsters with no
friends at all, and ended with the highest standing on the band,
and it was still just a village — because standing is not scale,
and fighting is not asking. The blank is not a locked door. It is
an unasked question, asked for them eighty-two times by their own
people, and never answered.

## Sense-test read (53006, days 4–20)

**The neighbors are liked, and they raid.** By day 6 the three
known villages sit at deterministic judge 53 (as-subordinate) —
already counter-or-better — and by day 9 the best is 65.4, an
outright accept. The same villages raid: day 14, "🌙 Raid —
Thornfield came in the night from the northwest. They trampled 2
garden plots into mud. Nobody's dead, but the message is clear:
the ground is theirs too, and they're done asking. (Trust -10.)"
Day 17, Thornfield again. Day 20, Emberhold carries off ~963 kcal.
The fiction is coherent and consequential — these are the same
fires the courtship scores say would have said yes, and the raid
lines name the trust cost each time. The village's neighbors know
it only as a pantry to rob, not as a partner — because nobody ever
proposed otherwise. The raid is not a separate system misbehaving;
it is the scale wall in fiction terms, same as sitstep's days 95–96
raids.

**The teaching keeps working.** Days 30/96/136: "Ella has been
turning the Ginger over — asking after it at fires, handling it on
work days — and now knows it deep enough to teach. (Their trade
grows: ask them what they know.)" Villagers teaching villagers,
names attached, knowledge spreading — the social engine underneath
the link raises is alive; the raises themselves are its visible
tip.

**The say-capture is noisy; the verdict does not rest on it.**
The diploLines regex matches "according to" gossip lines as
"accord", a party note ("⚔ THE NETWORK NOTE! Leo, Brian join
you!") as "NETWORK", a codex entry ("Larry proposed relief
(raid)") as "propose", and the kitchen counter ("# unprocessed
haul onto the counter") as "counter" (209 hits on 53008, 60 of
them the haul line). No Dawn line, no accord line, no proposal
line exists anywhere in the corpus — which is consistent with the
live state (0 links, 0 accords), but the phrase counts are not
evidence and are not cited as such. The gate classification reads
live `hierarchyState()` / `scaleRank()` / wrapped-call counts, not
say lines.

## Metric review

Pre-registered metrics bind this run (prereg 98605d40d). Primary:
DIAG-GO iff a single named gate (or one named ordered pair of
adjacent chain links) explains the no-regional state on ≥ 80% of
measured no-regional seed-days, with per-day gate state shown.
HELD: `courtship-no-attempt` alone explains 148/149 (99.3%) of
53006's no-regional days and 931/940 (99.0%) band-wide, with the
full per-day classification in the corpus (`gate` field on every
daily row; the 53006 gate sequence is 1 day `no-known-village`
then 148 days `courtship-no-attempt`). The secondary (53007
contrast) agrees exactly: 148/149 `courtship-no-attempt`. The
guard (instrument errors 0; replay compared to sitstep-r2 staged
headlines) HELD exactly on all 8 seeds — the master move from
dab55c69 to 32d79b713 did not move the fragile staged trajectory.
No metric was swapped, re-cut, or re-thresholded after the run.
The proof live leg is not evidence; only the judged 8-seed replay
above is.
- Classifier-order fix (proof-found, BEFORE any judged sim): the
  first proof run failed 28/29 — a fixture link classified
  `courtship-no-attempt` instead of `link-young`, because attempt
  history was checked before link state. A live link entails the
  attempt happened, so link state now dominates attempt history in
  the classifier order. The fix touches the classifier only (the
  chain order in the prereg is the order things must happen; the
  classifier reads state, and link existence is the strongest
  evidence the earlier links passed). Re-run: 29/29 green, and the
  judged corpus contains no link-state days, so the fix changes no
  judged classification — it is recorded here for the next arm,
  whose corpus will have links.
- Instrument notes: the `diploLines` capture regex is noisy (see
  the sense-test read) — the gate classification does not depend
  on the say-capture. The raise-window "seen" share (~37%) is a
  first-raise approximation: `linkRaiseState` keeps only the latest
  outcome per villager|village pair, and daily pending snapshots
  merge re-raises after the 14-day cooldown, so per-raise windows
  after the first cannot be reconstructed exactly; the counts that
  bind the verdict (raises staged 82, expired 80, accepted 0,
  refused 0) are exact state reads, not approximations.
  `detJudge` recomputes only the deterministic `judgeLink`
  components and reports the ±10 RNG band; `judgeLink` itself is
  never called live (it draws RNG), so the recorder draws nothing.
- What the metric did not cover, honestly: the prereg's "name the
  lever that would open it" is answered (a link-forming drive —
  propose on courtship-ready villages, and answer raises), but no
  lever was tested here — this is a DIAG, and the lever is the next
  arm's work. The Dawn/seasoning links are unmeasured, not
  disproved: with zero links, the 21-day seasoning and
  `_checkRegional` have never been exercised on this band, so
  `link-young` and `seasoned-no-dawn` are untested gates, not
  cleared ones. A link-forming arm must watch them next.

## Balanced panel (§15) and telemetry

DIAG arms take no panel — the comparison here is per-day gate
state inside one replayed leg, not a before/after lever
comparison. No compare `.md` is fabricated, as the prereg
declared. `scripts/telemetry-check.js` was run and REFUSED, same
as every prior killer-chain arm: "refusing recorder-corpus input:
all 8 --current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs." No Game-root change exists in this
arm (frozen policy + pure-read recorder), so no telemetry deviation
check applies; the wall numbers above are the instrument's own.

## What this arm does NOT claim

- Not a "scale is broken" finding: the gate chain works as
  designed — the Dawn fires when a bond seasons, and no bond has
  ever existed to season. The untested links are untested, not
  broken.
- Not a "courtship is broken" finding: courtship is ready from day
  4 on every seed, and the best village would accept outright from
  about day 9. The climb is already climbed.
- Not a "villages don't know each other" finding: lore spreads,
  raises fire (82 band-wide), raise-eligible villagers exist
  (max 2–5 at a time per seed). The social engine underneath the
  raises is alive.
- Not a "policy can't talk" finding: 95–170 talk calls per seed.
  The policy talks; its conversations just have no door for the
  link answer.
- Not a "standing is broken" finding: standing works as designed
  (war + plenty); diplomacy is 0 because it counts only seasoned
  regional+ links, and there are none. `scaleRank()` reads flags,
  not points — by design, per SCALE.md.
- Not a win, not a table, not a seat: 0/8 on all three, same as
  every prior arm on this band.

## Next blanks (for the loop, not this arm)

1. **The link-forming drive, as a lever** — the binding blank:
   propose on courtship-ready villages (the as-subordinate offer
   scores higher everywhere — joining is the easier door) and
   answer link raises inside their 2-day window (hold a real
   conversation with the raiser — `COMPETENT_TALK` — and pick
   `link:accept` when the village is courtship-ready). Policy-side
   only, a measurement instrument like the staged party invites:
   the propose verbs stay player-only by Steve's 2026-10-26 ruling,
   and the arm should say so. The arm must then watch the two
   untested gates — the 21-day seasoning and `_checkRegional` —
   which this corpus could not exercise.
2. **The feast drive** — sitstep blank #2, unchanged: hold a feast
   and spend the surge in a real fight on a wave-4-reaching seed
   (leadfeast family). The deed is the second half of the seat.
3. **The sit action, once a seat exists** — sitstep blank #3,
   unchanged: a takeseat arm on a seed (or a lever) that actually
   earns a seat. Until a seat is earned, every sit count is 0 by
   construction.
4. **The veteran-kill announcement** — fifth sighting would be
   here, but this corpus did not re-check it; the backlog item
   stands as sitstep left it.

## Proof and commits

- Proof `scripts/test-regionalstep-20261107.js`: 29/29 green on
  this worktree before the judged run (15 classifyGate fixtures, 3
  detJudge fixtures, 6 fake-Game wrap/snapshot checks, 5 live-leg
  checks: 53006 staged 150d reproduces 51 pair days, standing 415,
  8 wave-4+ kills, wave 5, 0 instrument errors — the current-master
  numbers, which the judged corpus then reproduced exactly). The
  first proof run was 28/29 (classifier-order fix, above); the fix
  was made before any judged sim and the proof re-ran green.
- Prereg committed 98605d40d before any judged sim. The safe-commit
  index clobber hit on the prereg commit and on the tooling commit
  (files shown staged-as-deleted after correct commits); repaired
  with HEAD-blob cacheinfo, verified `git status` empty +
  `git diff HEAD` empty + hash-object matches, each time.
- Judged corpus: `evidence/2026-11-07/perseed-regionalstep-b/`
  (8 files, staged replay, base 32d79b713, 0 instrument errors).
  Analyzer output saved at `/tmp/regionalstep-analysis.json` and
  the raise-window audit at `/tmp/regionalstep-raise-audit.js`
  (working copies; the evidence file above is the record).

## Convergence

**scale-onramp: converging, NOT converged.** The regional step is
now DIAGNOSED, not just observed: the village never leaves
`village` because the ask never happens — known by day 4,
courtship-ready the same day, acceptable outright from day 9, and
zero proposals in 940 seed-days, while the villagers themselves
raise the idea 82 times and watch it expire. The chain runs end to
end through wave-5 kills and stops at the seat on scale + the feast
deed — and scale stops at the ask. The next work is building, not
measuring: a link-forming drive that proposes and answers raises,
then a watch on the seasoning and the Dawn it will finally
exercise. Until a village asks, the table will keep not coming —
and the neighbors will keep raiding the pantry instead of joining
the fire.
