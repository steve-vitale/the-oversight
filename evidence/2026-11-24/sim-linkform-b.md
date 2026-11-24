# Second-link stage classification — Loop B, run fleshout-loop-b-20261124T1030Z, arm sim-linkform-b (DIAGNOSTIC)

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Anchor: HEAD `c4d4fd01ccc08319a0d53f9d60a6cfe970fdec05` at prereg
time; instruments commit `2e53c442a` (proof 17/17), analyzer fix
`fafc32179` (proof 18/18). Policy `scripts/policies/competent.js`
`{competent}` VERBATIM, default env. Seeds 109309–109324 (16 —
the replay band named in the brief). Horizon 150 days,
death-aware. Balanced panel (§15): INAPPLICABLE — a pure
diagnostic decomposition, no before/after change; the analysis
JSONs are attached instead.

Prereg: `evidence/2026-11-24/sim-linkform-b-prereg.md` (commit
`d85b504e7`, before any judged sim). Pilot: seeds 109309–109316
(8) passed the spend gate (instrument health 8/8, every pilot
seed classified) before the remaining 8 ran.

## Verdict — DIAG-PARTIAL (bars 1–3 and 5 pass; bar 4 FAILS)

| # | Frozen bar | Result |
|---|-----------|--------|
| 1 | All 16 seeds classified by second-link stage, 0 unclassified | **PASS — 16/16, 0 unclassified, 0 orphan link events, 0 irreconcilable bond events** |
| 2 | The blocker named with counts | **PASS — see "The blocker" below** |
| 3 | Contrasts: seasoned vs unseasoned; foreign-polity vs the one without | **PASS — both contrasts stated with counts** |
| 4 | Reproduction: 15 overlapping seeds match standingconfirm on all 8 frozen fields | **FAIL — 14/15; seed 109322 diverges (bestCapped 270 vs 240, daysAt199 37 vs 24)** |
| 5 | Instrument health: 0 errors, complete snapshots, 100% tele/snapshot reconciliation, proof green before the judged legs | **PASS — 0 errors on all 16 seeds, reconciliation 310/310, proof 18/18** |

The answer to the standingconfirm blank, in one sentence:
**the second link never forms because the only link-forming path
that ever fires is the ladder's one-shot stage-3 grant, and the
only other path — villagers raising a second link — stages 252
times across the band and every single ask expires unanswered
(241 expired, 11 still pending when the village dies), with zero
accepts, zero refusals, zero proposals, and zero counters ever
staged.** The asking works; the answering does not exist in
competent play.

## Per-seed stage table

Stage definitions (prereg-frozen, S0–S5): S0 no link ever forms;
S1 first link only, zero second-raise stagings; S2 second raises
staged, all lost; S3 a second link offered (raise accepted /
propose / counter); S4 two active links at once; S5 a polity
forms. A "second raise" is a raise staged for a village other
than the first-linked one, on a day when ≥1 link already exists.
FP = largest foreign polity seen (primary + max size + first day);
tgt-in-FP = Haven's link target is a subordinate of that polity;
tgt-is-primary = Haven's link target IS that polity's primary.

| seed | days | end | stage | first link (day, provenance) | 2nd stagings (fates) | elig days / lottery pass | max links | seasoned at end | foreign polity (size, first day) | tgt-in-FP / tgt-is-primary | join path |
|------|------|-----|-------|------------------------------|----------------------|--------------------------|-----------|-----------------|----------------------------------|----------------------------|-----------|
| 109309 | 140 | lost | S2 | Emberhold d24, ladder-reward | 7 (7 expired) | 45 / 15 | 1 | yes | Emberhold, 5, d92 | no / YES | no-join-path-offered |
| 109310 | 150 | survived | S2 | Stonebridge d27, ladder-reward | 4 (4 expired) | 14 / 10 | 1 | no | Stonebridge, 5, d78 | no / YES | no-join-path-offered |
| 109311 | 150 | survived | S2 | Stonebridge d30, ladder-reward | 10 (10 expired) | 44 / 10 | 1 | no | Thornfield, 4, d127 | YES / no | no-join-path-offered |
| 109312 | 150 | survived | S2 | Emberhold d25, ladder-reward | 16 (15 exp, 1 pend) | 62 / 22 | 1 | no | Thornfield, 5, d78 | YES / no | no-join-path-offered |
| 109313 | 97 | lost | S2 | Emberhold d34, ladder-reward | 3 (3 expired) | 13 / 6 | 1 | no | The Red Table, 4, d85 | YES / no | no-join-path-offered |
| 109314 | 150 | survived | S2 | Stonebridge d24, ladder-reward | 31 (30 exp, 1 pend) | 92 / 37 | 1 | yes | Thornfield, 5, d106 | YES / no | no-join-path-offered |
| 109315 | 96 | lost | S1 | Thornfield d44, ladder-reward | 0 | 3 / 2 | 1 | no | Emberhold, 4, d78 | YES / no | no-join-path-offered |
| 109316 | 49 | lost | S0 | none | 0 (7 first-raise stagings, all expired) | 18 / 11 | 0 | no | none ever | — | no-join-path-offered |
| 109317 | 150 | survived | S2 | Emberhold d19, ladder-reward | 37 (35 exp, 2 pend) | 122 / 48 | 1 | no | Emberhold, 5, d134 | no / YES | no-join-path-offered |
| 109318 | 150 | survived | S2 | Emberhold d42, ladder-reward | 21 (20 exp, 1 pend) | 95 / 40 | 1 | no | Stonebridge, 6, d113 | no / no | no-join-path-offered |
| 109319 | 150 | survived | S2 | Thornfield d33, ladder-reward | 21 (19 exp, 2 pend) | 68 / 25 | 1 | no | Stonebridge, 5, d92 | YES / no | no-join-path-offered |
| 109320 | 150 | survived | S2 | Emberhold d27, ladder-reward | 35 (34 exp, 1 pend) | 106 / 43 | 1 | yes | Ashford, 5, d134 | YES / no | no-join-path-offered |
| 109321 | 122 | lost | S2 | Emberhold d26, ladder-reward | 18 (18 expired) | 67 / 29 | 1 | no | Ashford, 5, d106 | YES / no | no-join-path-offered |
| 109322 | 150 | survived | S2 | Emberhold d34, ladder-reward | 14 (14 expired) | 72 / 23 | 1 | yes | Emberhold, 3, d71 | no / YES | no-join-path-offered |
| 109323 | 68 | lost | S2 | Thornfield d33, ladder-reward | 1 (1 pend) | 8 / 5 | 1 | no | Thornfield, 2, d56 | no / YES | no-join-path-offered |
| 109324 | 150 | survived | S2 | Thornfield d33, ladder-reward | 34 (32 exp, 2 pend) | 113 / 49 | 1 | no | Thornfield, 3, d85 | no / YES | no-join-path-offered |

Pooled: stages S2 ×14, S1 ×1, S0 ×1; S3/S4/S5 zero. First-link
provenance: ladder-reward 15/15 (none on 109316). Second raises:
252 staged, fates 241 expired + 11 pending-at-end, 0 accepted,
0 refused. All stagings (first + second): 310, fates 299 expired
+ 11 pending-at-end. acceptCalls 0, declineCalls 0, proposeCalls
0, counterEvents 0 (second-village), nationalEvents 0 — band-wide.
Max active links 1 on every linked seed. Seasoned at end 4/16.
Polity ever 0/16. Join path `no-join-path-offered` on all 16
seeds. Villages classified (secondlink shape): 59
staged-and-lost, 28 never-staged, 0 raised, 0 unknown.

## The blocker, named with counts

The second link dies at TWO different points, and the counts
separate them cleanly:

**Point 1 — the ladder grants one link and never another (15/15
first links).** The ladder has exactly three stages
(`ladder.js`: the stage loop runs `s = 1..3`, `ladderStage()`
never returns 4) and `ladderGrantStageReward` grants only s=1
(trader), s=2 (shelter), s=3 (link) — so the ladder can grant at
most ONE link ever, at stage 3. Every first link on this band is
that grant, pinned three ways: the `_formLink` caller marker
reads `metaProgression.js` on all three frames on all 15 links;
proposeLink was never called (0 calls band-wide) and no raise
was ever accepted (0 acceptCalls); and the ladder stage-3
crossing lands on the link day or the day before it on the 7
pilot seeds checked day-by-day (the beat grants the reward the
morning after the rung completes — e.g. 109309: stage 2→3 on
day 23, link day 24). First-link days 19–44, median 30. No seed
reaches a second ladder grant because none exists to reach.

**Point 2 — the raise path stages constantly and dies
unanswered (252 second stagings, 0 answers).** The staging
pipeline is NOT starved: 942 eligible-raiser-days band-wide,
lottery passing on 375 of them, 310 stagings fired (252 second
+ 58 first). The lottery is a hash roll (`bondRoll('linktick')`,
no RNG consumed), and the tick stages at most one raise a day.
Every staged ask then lives 3 days and dies: 241 expired, 11
still pending when their village died. Not one was accepted.
Not one was refused. Nobody said no — nobody was ever asked in
a way that could be answered. That is secondlink-a's mechanism
(zero conversation turns under competent: `talkRound` opens one
conversation a day and walks straight out), and this band
reproduces its signature exactly — 0 acceptCalls, 0
declineCalls, 0 proposeCalls — on twice the seeds. This arm did
not re-run the talk probe; the signature match is the evidence,
and the probe result is cited, not re-proven.

**Point 3 — the raiser pool is thin underneath (the staging
that never happens).** 28 villages never-staged; the gate census
over all raiser-days names the dominant gate: `no-build-standing`
11,958 raiser-days — most villagers never carry the standing
goal at weight ≥ 1. Next: `no-lore` 5,166 (villagers who know no
unlinked village), `talk-blocked` 1,736, `all-open-cooldown`
1,400, `all-known-linked` 1,175, `trust<20` 1,004,
`has-pending` 910. The thin pool is second order behind the
answering problem (secondlink-a's ordering, confirmed here):
310 stagings prove the pipeline fires; the 252 that die prove
the answering is what fails.

**The two non-S2 seeds sharpen the picture.** 109315 (S1):
three eligible-raiser-days in 96 days, zero second stagings —
the village barely had anyone who could ask, and died before
the ask could come around. 109316 (S0): seven FIRST-raise
stagings, all expired, and no link at all — it died day 49 with
best capped 75, never reaching the National rung, so the ladder
grant never fired either. S0 here means "both roads failed", not
"nobody tried".

## Contrasts (bar 3)

**Seasoned-link seeds (4: 109309, 109314, 109320, 109322) vs
unseasoned (12).** All four seasoned seeds are S2 — seasoning
changes nothing about the stage reached. What differs is
volume: seasoned seeds link earlier (first-link day median 25.5
vs 33) and stage more second raises (87 total, ~22/seed, vs 165
total, ~14/seed) — a longer-lived, earlier-linked village asks
more often, and every ask still expires (85 expired + 2
pending-at-end on the seasoned group; 156 + 9 on the
unseasoned). Foreign polity present on 4/4 seasoned vs 11/12
unseasoned. Seasoning is a clock that runs on the one link, not
a road to the second.

**Foreign-polity seeds (15) vs the one without (109316).** The
15 FP seeds are S2 ×14 + S1 ×1; the one without is S0 — but
109316 died day 49 before any polity could form, so the contrast
is really "died too young to see a realm" vs "lived to see one
and still never joined it". The foreign polity is present on
15/16 seeds, max size median 5 (range 2–6); twelve of the
fifteen reach BELONG size (≥4) — all but 109322 (size 3),
109323 (size 2), and 109324 (size 3). 109323's pair is the one
that never grows past a pair.

**The new shape on this band — the link target IS the foreign
primary (6/15).** Havenlink's band had 0/6; here six seeds
(109309, 109310, 109317, 109322, 109323, 109324) link to the
village that heads the region's largest foreign polity, and
eight more (109311, 109312, 109313, 109314, 109315, 109319,
109320, 109321) link to a village that sits inside it as a
subordinate. Only 109318's link target (Emberhold) stands
outside the largest foreign polity (Stonebridge, size 6). So on
14 of 15 FP seeds Haven is one handshake from the realm — its
own subordinate IS the foreign king, or kneels to him — and the
join path is still `no-join-path-offered` on every seed. The
BELONG road's precondition is met in the strongest possible
form, and the road is never walked from either end: no foreign
primary ever courts Haven, and competent never proposes as a
subordinate. Note the shape's sting: on the six target-is-primary
seeds, joining would mean Haven BOWING to its own subordinate —
reversing the existing link — and no mechanism offers that, or
even remarks on it.

## The 109322 reproduction divergence (bar 4 — FAILED as frozen)

One seed diverges from the standingconfirm corpus: bestCapped
270 vs 240 (+30), daysAt199 37 vs 24 (+13). Days (150),
endReason (survived), scaleRank (regional), maxWave (4),
endUnlockedWave (4) all match. The first standing divergence is
day 105: war 150→175 (+25, one war ledger point). The kill
streams show the split earlier: the day-91 aid-crisis killer's
generated ID differs by one character (`app_mgpspj6l378` vs
`app_mgpspj6k378`) — the RNG stream had already shifted before
day 91. The replay then kills a wave-4 eulogy on day 104 that
the confirm never kills, kills a second on day 114, and kills a
wave-4 strike on day 149; the confirm kills a wave-3 redactor
on day 127 that the replay never kills. Death events total 63
on both legs.

Attribution, in order:

1. **The instrument is exonerated.** A standing-only replay of
   109322 on THIS anchor (driver
   `standing-gearready-b-driver-20261124.js`, RUN
   `linkform-isolation`, file
   `standing-gearready-b-s109322-linkform-isolation.json`)
   returns bestCapped 270, daysAt199 37 — identical to my
   full-instrument replay. The secondlink snapshot's daily
   `villageStandingTotal()` call (which the standing instrument
   deliberately avoids as "side-effecting") moves nothing on
   this seed: the numbers are the same with and without it.
2. **The anchor moved it.** Between standingconfirm's anchor
   `60f6e7436` and this HEAD `c4d4fd01c`, three src/js commits
   landed: holdspeak-a (villager-brain.js), departteach-a
   (win-plan.js), landing r158 contest telemetry (contests.js).
3. **r158 and holdspeak-a are ruled out by code inspection.**
   r158 adds only `tele('contest_end', ...)` emissions — a
   telemetry-log write, no RNG, no game-state read that
   branches. Holdspeak-a adds pure reads (`holdBlockKind`),
   `say()` calls (no RNG), and a dedup map read by nothing but
   its own check ("Fiction only" in its own comment). Neither
   can shift an RNG stream or a combat outcome.
4. **Departteach-a is the remaining suspect, by elimination —
   mechanism unproven.** It calls `revealName(vid,
   'overheard')` for each departing companion, writing real
   knowledge state (`village.knownNames` + a journal entry) in
   the pre-System window. `knownNames` is read by conversation
   and display gating (`game.js` knowledge checks, `convoTopics.js`),
   so an earlier-known name can change a later conversation
   outcome, which can change who goes where, which can change a
   fight. That chain is plausible and UNPROVEN — no bisect was
   run (it would need a scratch tree reverting one commit; the
   prereg allows leaving the divergence unattributed, stated
   plainly). Both suspect arms claim zero sim-outcome movement
   on their own bands (departteach: deaths/launches identical on
   16 seeds; holdspeak: identical on 24 seeds) — neither band
   contained 109322's trajectory, so neither claim is
   contradicted, and neither proves the drift impossible.

The verdict follows the prereg: bar 4 FAILS as written, so the
arm verdict is DIAG-PARTIAL, not DIAG-GO. The divergence does
not touch the classification: 109322 is S2 on both anchors, its
first link is the ladder grant on both, and the stage
distribution is unchanged. What it DOES mean is that the
standingconfirm numbers on this seed are anchor-sensitive at
the ±30-point level — a one-seed, one-ledger-point drift, with
the mechanism narrowed to one suspect commit.

## Village assessment (plain words)

Sixteen villages playing competently for one to five months.
Fifteen of them earn exactly one bond with another village —
not by courting, not by conversation, but as a prize: the
moment their standing ladder reaches National, the System hands
them a village that bows. They tend that one bond — food goes
back and forth, trust climbs, and on four of them the bond
ripens into a seasoned link — and meanwhile their own people
keep bringing up the next friendship: two hundred and fifty-two
times, someone who knows another fire says "we should link with
them — we'd be stronger together." The ask is put on the table,
written down as a thing to talk about. And three days later it
is gone, unanswered, because the scholar never sits down long
enough to hear it. The villages are not shy. They are not
ignorant — on the richest seed they ask thirty-seven times.
They ask, and the asking itself works fine. What doesn't work
is the answering. And all the while the rest of the region is
doing the same thing without them: other fires bind to each
other, week by week, and the traders carry the news to Haven's
fire, and Haven listens and does nothing — even on the six
villages where their own subordinate IS the foreign king, the
head of a five-fire realm, kneeling to them while ruling a
realm they will never join. One village dies at forty-nine days
having asked seven times and received nothing, not even the
prize link, because it never climbed high enough to be handed
one. That is the wall now, stated plainly: not the size of the
realm, not the trust bar, not the asking — the second link
never forms because the game has exactly one way to make a
link in live play, it fires once, and the only other way in
needs a conversation that never happens.

## Wall numbers (this arm's corpus)

Wins 0/16. Villages lost 5/16, survived to horizon 11/16.
National (scaleRank) 0/16, table 0/16. Wave-5 unlocks 5/16
(4 on the 15 overlapping seeds + 109309, the new seed),
wave-5 faced 4/16 (109309, 109311, 109312, 109313), wave-5
kills 4 (109309: 1, 109312: 2, 109313: 1). Wave-4 faced 15/16
(all but 109316). Readiness-5 door opens 5/16 (109309 d89,
109311 d117, 109312 d89, 109313 d65, 109314 d138). Days at
gated 199: 637 on this band (604 on the 15 overlapping seeds vs
591 on standingconfirm's — the +13 is entirely the 109322
divergence; 109309 contributes 33 and 109325 is not in this
band). Median survival 150 days (CENSORED — 11/16
survived to horizon; max 150, censored). Deaths over 1341
person/villager deaths: "villager combat" 516, "expedition"
447, "combat" 199, "the wild" 79, "monster" 45, starvation 9,
"a wound that wouldn't close" 9, "the arena" 8, sickness 6,
"ambush" 5, "a stranger" 4, contest 6, thirst 2, plus 5
singletons ("Buffering", "Gavel", "experiment", "Ad Break",
"Highbeam Deer", "The Focus Group", "the expedition",
"lockjaw"). Combat-family ("villager combat" + "combat" +
"monster") is 760/1341 = 56.7%; expedition alone 447/1341 =
33.3% — the same shape as standingconfirm (56.6% / 32.8%).

## Sense-test

The raise lines read like people, in two honest templates: "I've
heard good things about Thornfield. We should link with them —
we'd be stronger together." (rumor) and "Word is Emberhold holds
together. We should link with them — we'd be stronger together."
(standing) — the same two sentences from many villagers, which
is the voice-pool repetition secondlink-a already filed, not a
new defect; the line is honest about secondhand lore. The
formation lines read like people, and the ladder's own line
sits beside them: "⛓️ Emma brings it home: Stonebridge bows to
Haven — one organization, us primary. Tribute: 4,000 kcal/week.
The relationship starts at trust 30. Everything from here is
earned." + "⛓️ Word of Haven's standing reaches Stonebridge
before any speaker does — they send word back: they will bow to
Haven." A named villager carries the news; the System narrates
the prize. The foreign-polity rumor lines carry the region's
growth aloud — "🧳 Word comes late, through traders: Thornfield
and Stonebridge have bound together — Thornfield primary. Other
fires are climbing, too." — and the garbled stir lead havenlink
already filed recurs verbatim on this band ("Word of Haven's the
televised games is doing work out there", 109314 d63, 109317
d41/d98/d105) — the kind-word landing inside a possessive that
doesn't parse. No new voice defect is filed here; the garbled
lead is already in sim-findings.md. One observation, not a
finding: on 109317 the realm grows to size 5 in front of Haven
across four announced bindings (d41, d98, d105, d133) while
Haven's own subordinate Emberhold heads it — and no line in the
game ever remarks that Haven's subordinate is a king. The
subordinate-chain blindness havenlink filed as blank #3 stands.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- BAR 4 AND ANCHOR DRIFT: the frozen reproduction bar has no
  tolerance for anchor drift, and it failed on 1/15 seeds by a
  one-ledger-point combat drift. The leg is judged as written
  (DIAG-PARTIAL). A future replayer should expect ±1 ledger
  point of drift on long bands when the anchor carries
  knowledge-state writes, and should record first-divergence
  day + the isolation replay as this arm did, rather than
  treating any single-seed divergence as instrument failure.
- PREREG-vs-OR SECOND-RAISE DEFINITION: the prereg's AND
  definition (different village AND link already exists) counts
  252 second stagings; the reused secondlink-a OR definition
  counts 285 (the 33 extra are pre-link raises for never-linked
  villages). Fates under OR: 274 expired + 11 pending-at-end —
  the same shape (0 accepted). The headline 252 is the
  conservative count; the conclusion does not depend on the
  definition. The per-seed `secondDefDiff` lists the 33.
- LOTTERY-PASS IS A CEILING, NOT A STAGING COUNT: 375 lottery
  passes on 942 eligible-raiser-days, but only 310 stagings
  fired. On 109316, eligible days with a passing roll (e.g. d5
  roll 0.41, d18 roll 0.001, d25 roll 0.009) produced no staging
  — the tick runs before the snapshot, so snapshot-time
  eligibility and tick-time eligibility can disagree. The
  staging count (310) is the ground truth; the lottery count is
  the opportunity ceiling. A future instrument that needs the
  tick-time gate should record inside the tick, not the snapshot.
- LADDER-CROSS TIMING: the analyzer first required the stage-3
  crossing ON the link day and labeled 5 pilot links
  "unconfirmed-cross"; the day-by-day check showed the crossing
  lands on the link day (2 seeds) or the day before (5 seeds)
  because the beat grants the reward the morning after the rung
  completes. The analyzer was fixed before the judged analysis
  (proof 18/18, new test for the day-before case) and all 15
  links now read `ladder-reward`. The fix changed labels, not
  corpus.
- SEASON-GATE / 109323: the foreign polity on 109323 is a pair
  (size 2, first seen d56) — the only FP that never grows past
  a pair, and the seed dies day 68. The "foreign polity exists"
  count (15/16) overstates the BELONG precondition: only 12/15
  reach size ≥4.
- MEDIAN: 150 is CENSORED (11/16 survived to the horizon).
  Report it as "150 (censored)", never as a survival claim.
- DEATH-CAUSE SHAPE: combat-family 56.7% (standingconfirm
  56.6%), expedition 33.3% (32.8%) — the same shape within
  noise. The pilot's open question (anchor move vs labeling
  shift) stands, unresolved by this corpus.
- SNAPSHOT CADENCE / DAY DRIFT: as in the pilot, snapshots are
  ~daily but not strictly calendar-daily; wall counts use the
  analyzer's `days` field, as frozen.

## Next blanks, in order

1. **Answer the mail, on the link road (the second-link build,
   NAMED not built — secondlink-a blank #1, now confirmed on a
   second band at 2× seeds).** The raise path stages fine and
   dies unanswered because competent never takes a conversation
   turn. A build arm should measure, on this band: does
   `COMPETENT_TALK=1` (held conversations) or the leadcourt
   policy answer raises — and if raises get answered, do second
   links form, and does the polity follow? The decision the
   build must make explicit: is the fix "the player must sit
   down" (policy/conversation behavior) or "the ask must survive
   longer / find the player another way" (a longer pending
   window, a re-raise that seeks the scholar out, an answer that
   doesn't need a held conversation)? Do NOT move readyDemand
   numbers or any win price/deed gate on this evidence.
2. **BELONG needs an inviter and an asker (havenlink blank #1,
   now stronger).** On 6/15 seeds Haven's link target IS the
   foreign primary; on 8 more it sits inside the realm. The
   build/design question is which side moves first — and on the
   six target-is-primary seeds, joining means bowing to one's
   own subordinate, which no road currently offers or even
   names. Either a foreign-realm invitation (staged Binding
   offer when the realm reaches 4 with Haven's subordinate
   inside it) or a player-side courtship of a known foreign
   primary. A Steve/design call before building.
3. **The thin raiser pool.** 28 never-staged villages, gated on
   `no-build-standing` (11,958 raiser-days band-wide); 109315
   had 3 eligible-raiser-days in 96 days. Whether more villagers
   should carry the standing goal, or the `build_standing` ≥ 1
   gate should admit a wider drive, is a design question for the
   build arm — second order behind the answering problem.
4. **The 109322 anchor drift (departteach-a suspect).** A
   single-seed bisect on a scratch tree (revert departteach-a
   only, replay 109322) would confirm or clear the suspect. If
   confirmed, the lesson is that knowledge-state writes are
   trajectory-visible and replays across such anchors need the
   drift note this arm writes. Coordinator call whether the
   bisect is worth a run.

## Proof and landing

- Proof: `scripts/test-linkform-b-20261124.js` — 18/18 PASS
  (15 fixture tests: S0–S5 stage classification, both
  provenance paths, prereg-vs-OR definition, orphan /
  irreconcilable detection, reproduction-mismatch detection,
  merge integrity, contrasts; plus the live harness smoke with
  both instruments installed and the 12-day ON-vs-ON-vs-OFF
  determinism/neutrality miniature on seed 109310). Re-run
  post-fix below.
- Commits (this worktree branch sim-linkform-b; coordinator
  merges via --ff-only; ready to merge, pending ship — no push,
  no bump, no live verification by this worker):
  - `d85b504e7` sim-linkform-b prereg (before any judged sim)
  - `2e53c442a` sim-linkform-b instruments: driver + analyzer +
    proof 17/17 (zero src/js)
  - `fafc32179` sim-linkform-b fix: ladder-cross confirms when
    stage completes the day before the link; proof 18/18
  - `562f3f8c5` sim-linkform-b corpus: 16 per-seed JSONs + analysis
    + 109322 isolation replay
  - (evidence commit follows)
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-linkform-b*.md`; per-seed JSON in
  `evidence/2026-11-24/perseed-linkform-b/` (16 files, anchor
  `c4d4fd01c`); analysis JSON
  `evidence/2026-11-24/linkform-b-analysis.json`; isolation
  replay
  `evidence/2026-11-24/perseed-standing-gearready-b/standing-gearready-b-s109322-linkform-isolation.json`.
- Telemetry deviation check (body step 10): NOT APPLICABLE —
  the per-seed JSONs are recorder rows (top-level
  `anchorCommit`), the same shape the standing arm established
  `telemetry-check.js` refuses; the scale-wall baseline carries
  a DO NOT compare note for pre-seat substrates. No LOUD line
  fired; no deviation is claimed. The wall numbers above are
  the report.
