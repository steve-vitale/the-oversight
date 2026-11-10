# Trust-growth + polity probe — Loop B verdict (run fleshout-loop-b-20261110T0122Z, arm sim-trustgrowth-b)

Axis: winnability chain (the diplomacy half of the standaccum-b
split, sim-findings #2032). DIAG ONLY, zero src/js. Gates, prices,
deeds, and readyDemand untouched. If the implied lever is a build
(trust growth, polity formation, second-link road), it is NAMED
here, not built here.

## Pre-registration (committed before any judged computation)

Full text: `evidence/2026-11-09/sim-trustgrowth-b-prereg.md`
(commit 401bb7b05) + amendment 1
(`evidence/2026-11-09/sim-trustgrowth-b-prereg-amendment.md`,
commit e8adc55fe). In short: competent policy verbatim, default
env, seeds 99101–99108 (the gearbar/vetbar/standaccum band re-run
on current master — re-use recorded, NOT claimed as freshness),
150d death-aware horizon, daily link-trust recorder with EVERY
trust-change event attributed by cause. DIAG-GO iff: (1) all 8
seeds' links classified by trajectory class; (2) every trust-up
event attributed (gains reconcile with deltas, every gain event
carrying a cause label or `unattributed`, with counts); (3) the
polity question answered with counts; (4) instrument errors 0.

The v1 pilot (RUN `trustgrowth-pilot`, anchor d41ec0256) is a
SHAKEDOWN, not the judged run: it exposed that the hierarchy.js
header claim "every trust gain routes through _trustGain" is false
on current master (comms.js / safetynets.js / titans.js write
`link.trust` directly), so v1 reconciled only 11 link-days with
unattributed-up 241 / unattributed-down 141. Amendment 1 rebuilt
the instrument (v2: property-setter event log + sequence
intervals + extended cause map); the judged run is
`trustgrowth-pilot-v2` (anchor e8adc55fe). No v1 number is cited
as a finding below.

## Grounding verified in code before the judged pilot (not assumed)

- Seasoned (`hierarchy.js` `_linkSeasoned`): active, 30+ days
  old, trust 40+ (conquered: season only). `polityOf('haven')`
  needs >= 3 seasoned subordinates. Regional+
  (`standing.js` `_linkRegionalPlus`): LEAD via the polity,
  BELONG via `polityOf(primary)`, seasoned covenant/trade league.
  A lone seasoned bond scores 0.
- Trust movers, inventoried in code (hierarchy.js _trustGain
  sites + every direct `link.trust` writer found by grep):
  GAINS — `tendLink` +8/week; weekly tribute full pay +1,
  deposit-gate waiver +1; arrears settlement +3; accord first
  gesture gift +10 / visit +8 / word +4; demand honored; prove-
  worth; oath; iron-court; renegotiation answers; BELONG
  `payTribute` +3; aid (comms/safetynets, direct writes):
  `aidAskVillage` +3, `aidHelpArrived` +2, `repayAidDebt` +3,
  `answerAidOffer` accept +4, `answerAidBeg` give +4,
  `resolveAidOut` accept +3. LOSSES (direct writes):
  tribute partial −1 / nothing −2 / BELONG short −6; sabotage
  −4; succession haircut −8 (`successionCrisis`,
  `theirLeaderDied`); demand refused −15; renegotiation silence
  −6 (`_resolveRenegotiation`); iron-court refusal −12; pool
  −4; titan events −2/−5/−8/−10/→0 (`titans.js`); aid refusals
  −2/−3/−5/−10.
- Policy facts (verified by grep): plain `competent` contains
  ZERO scale code by design — no `tendLink`, no `proposeLink`,
  no `pendingCounter`/`pendingAccord` handling, no
  `answerRenegotiation`, no aid-beg/offer answering verbs of its
  own. `leadcourt.js` (the LEAD-road policy) tends weekly when
  pantry > 20,000 kcal and answers pending offers — competent
  does NOT. Link raises reach the player as conversation choices
  (`bond-initiation.js` `bondTurn`: `link:accept` →
  `acceptLinkRaise`); competent's conversation picker is what
  accepts them — that is how the first link forms.

## Verdict — DIAG-GO (judged strictly against the prereg)

1. All 8 seeds' links classified, none forced: decays 6
   (99101/99103/99105/99106/99107/99108), rises 1 (99102),
   seasoned 1 (99104).
2. Every trust-up event attributed: 138 reconciled link-days,
   unattributed-up 0, unattributed-down 0, across 162 unified
   trust events. Every event carries a named cause — zero
   `unattributed`, zero `other-named`. (Two formation-day +4 aid
   gives sit inside born trust on 99101/99105 — see below —
   disclosed, not hidden, and not counted as events.)
3. Polity question answered with counts: 1 link formed per
   village on all 8 seeds, 1 seasoned link band-wide (99104),
   0 polities on any road on any day, blocking reasons 7×
   never-seasoned + 1× seasoned-but-no-polity.
4. Instrument errors 0 on all 8 seeds (~860 daily snapshots).
Proof: `scripts/test-trustgrowth-b.js` — 10/10 PASS (cause map
incl. the direct writers, seq-interval reconciliation,
wrap/setter dedupe, live setter-capture leg, determinism leg).
Non-perturbation proof (stated in advance in the amendment):
the v2 trajectories reproduce standaccum-b EXACTLY — days
132/58/132/150/109/87/150/62 and standings
270/199/199/199/150/199/199/25 on all 8 seeds — so the setter
did not move the game. Balanced panel (§15): no before/after
LEVER comparison exists for a diag, so none is fabricated and
none is attached; `balance-panel.js` runs sweep comparisons,
not recorder corpora (bandfreeze-b §15).

## THE TRUST ANSWER (plain words)

Nothing the village does on purpose moves link trust up under
competent play — because competent play never does any of it.
The only trust growers that fire are the two automatic ones:
the weekly tribute (+1, and only +1), and the neighbor's own
generosity — the subordinate village walks in unannounced with
grain for Haven's empty bins, and Haven saying yes is worth +4.
Everything the design built for growing trust — tending the
bond (+8 a week), answering the first-gesture accord (+4 to
+10), answering a renegotiation instead of letting silence
answer (−6) — goes unanswered on every seed, because competent
never calls those verbs. And while trust creeps up by ones and
fours, it falls by eights and fives: every time the far village
buries a speaker, the bond takes −8, and every time a titan
strikes their fire in the night, −5. A link is born at trust 30,
climbs to the high thirties on aid and tribute, and then the
funerals and the night-strikes take it back down. One village in
eight — 99104 — held trust above 40 long enough to season, for
28 days, and it still scored nothing, because a polity needs
three seasoned bonds and the band never forms a second link.
The diplomacy road isn't broken. It's unanswered mail.

## Per-seed table

| seed | days | end | formed | born→peak→end | class | seasoned window | broke | gains (by cause) | downs (by cause) |
|------|------|-----|--------|---------------|-------|-----------------|-------|------------------|------------------|
| 99101 | 132 | lost | d37 Stonebridge | 34→37→8 | decays | — | d126 succession | trib +7, aid-offer +20 (5) | succession −28, titan −25 |
| 99102 | 58 | lost | d17 Emberhold | 30→40→23 | rises | — (peak d29, age 12) | — | trib +4, aid-offer +12 (3), aid-beg +4 (1) | succession −16, reneg-sil −6, titan −5 |
| 99103 | 132 | lost | d27 Stonebridge | 30→30→4 | decays | — | — | trib +11, aid-offer +12 (3) | succession −25, reneg-sil −12, titan −12 |
| 99104 | 150 | survived | d43 Emberhold | 30→45→26 | seasoned | d73–d100 (28d, 42–45) | — | trib +13, aid-offer +24 (6) | titan −25, succession −16 |
| 99105 | 109 | lost | d32 Emberhold | 34→37→11 | decays | — | — | trib +7, aid-offer +12 (3) | succession −32, titan −10 |
| 99106 | 87 | lost | d27 Emberhold | 30→31→0 | decays | — | — | trib +8, aid-offer +20 (5) | succession −30, reneg-sil −12, titan −16 |
| 99107 | 150 | survived | d47 Emberhold | 30→38→0 | decays | — | — | trib +12, aid-offer +24 (6) | succession −32, titan −34 |
| 99108 | 62 | lost | d41 Emberhold | 30→30→17 | decays | — | — | trib +3, aid-offer +12 (3) | succession −16, reneg-sil −12 |

Band totals, all attributed: gains +205 (aid-offer-accept +136
over 34 accepts, tribute-weekly +65 over 65 weeks, aid-beg-give
+4 over 1 give); downs −364 (succession-haircut −195 over 27
haircuts, titan-event −127 over 28 strikes, renegotiation-
silence −42 over 7 silences). Net −159 across 8 links.
Zero on the whole band: tend calls, accord answers, demand
answers, prove-worth, oaths, national-choice, payTribute,
arrears, tribute-thin/nothing, sabotage, aid refusals of any
kind, covenant/trade activity.

## The growers, in order

- **Aid offers (+136, two-thirds of all trust gained).** The
  subordinate offers food when Haven's bins are echoing —
  "Heard your bins are echoing. Emberhold has grain to spare —
  2,693 kcal, no tribute, no ceremony. Say the word." — and
  Haven accepting is +4. 34 accepts on 8 seeds (3–6 per link),
  0 refusals. The neighbor's generosity, not Haven's, is the
  biggest trust engine under competent play.
- **Weekly tribute (+65, one-third).** Full payment or waiver,
  +1 a week, every week: 86 tribute weeks band-wide, 62 waived
  (72% — Haven's pantry is full, so the wagons are waved home
  and the week counts paid) and 24 paid in full. ZERO thin weeks,
  ZERO empty weeks, arrears 0 at end on all 8 seeds. The
  subordinate's fields always cover 4,000 kcal/week. Tribute
  reliability is 100% on this band — the decay is NOT a tribute
  problem.
- **Aid begs (+4, once).** 99102 d20: Haven gives Emberhold
  1,500 kcal ("Kira/Omar weeps, openly. 'The fire network.
  That's what it's FOR.'"). Plus two formation-day gives inside
  born trust (below).
- **Born trust 34 (99101, 99105).** Both links are born at 34,
  not 30: on formation day Haven gives the new subordinate
  1,500–2,000 kcal of aid ("Credit stands"), +4, before the
  instrument's first snapshot. The setter cannot log a write
  that predates its installation (stated gap, amendment 1); the
  +4 is inside born trust, so reconciliation still starts from
  the right number — disclosed here, not hidden.

## The cutters, in order

- **Succession haircuts (−195, 27 haircuts).** Every speaker
  death on the far side costs the link −8 (theirLeaderDied /
  successionCrisis). 2–5 per link. This is the single biggest
  trust destroyer, and it is also what breaks links: 99101's
  link broke d126 in a succession crisis ("Link broken
  (succession)") at trust 8 — the neglect snap (trust < 20, no
  upkeep 14+ days) firing on a funeral, not a trust-0 collapse.
- **Titan strikes (−127, 28 strikes).** "THE HERALD struck
  Emberhold in the night — trust −5; they notice who wasn't
  there." 0–7 per link. A night-strike is a −5 with no answer
  available.
- **Renegotiation silence (−42, 7 silences).** When a young or
  sub-bar link's speaker dies, a 7-day renegotiation beat is
  staged (gift / visit / wait); nobody answers it, silence
  answers for Haven, −6 each. 99103, 99106, 99108 took two
  each; 99102 one.
- **The mourning choke (21 blocked +1s).** After a speaker
  death the village grieves for 7 days and no trust gain lands:
  21 weekly tribute +1s were requested and returned 0
  (5/2/4/2/4/1/3/0 per seed). Grief is not bought off — but it
  is also 21 trust the link never gets back.

## The seasoning math (why only 99104)

Seasoning needs trust ≥ 40 AND age ≥ 30 on the same day.
99104: formed d43, aid accepts d50/d59 (+8) + weekly +1s lift
it to 42 by d73 (age 30) and 45 by d92; it holds 42–45 for 28
days (d73–d100). The window ends in a cluster: titan −5 d96,
titan −5 d101, succession −8 d102 — −18 in a week, trust 45 →
32. 99102 shows the near-miss the other way: it peaks at 40 on
d29–30, but the link is only 12–13 days old — too young to
season — and the d33 succession haircut (−8) takes it to 32
before age 30 arrives. Every other seed never reaches 40 at
all (peaks 30–38): the growers (+1/week, +4 per aid offer)
cannot outrun the cutters (−8 per funeral, −5 per night-
strike) over a 30-day season.

## The polity answer (counts)

- Links formed: exactly 1 per village, all 8 seeds, all
  Haven-primary (LEAD) over Emberhold (6) or Stonebridge (2),
  formed d17–d47 via a villager carrying a link raise into
  conversation ("Nathan brings it home: Emberhold bows to
  Haven").
- Seasoned links: 1 (99104, 28 days). Seasoned-polity
  (forPolity) readings agree with the plain readings on every
  snapshot.
- Polities: 0 on every road on every day — no LEAD polity
  (needs ≥ 3 seasoned subordinates; the band has 1), no BELONG
  (no BELONG link ever forms), no covenant, no trade.
  `polityOf('haven')` is null on all ~860 snapshots.
- Blocking reasons by rule: 7× never-seasoned, 1×
  seasoned-but-no-polity.
- Second links: 0 formed after the first on any seed, and no
  second link raise is visible in this corpus — the instrument
  records formations, not link-raise stagings, so WHETHER a
  second raise was ever staged (and declined/expired) vs never
  staged at all is UNMEASURED. That is the next arm's instrument
  gap, not a finding.
- The accord left unread: `pendingAccord` first appears on
  formation day on all 8 seeds and stays pending until village
  death or the horizon — the first-gesture accord (gift +10 /
  visit +8 / word +4) NEVER fires under competent play. It is
  the single largest unused trust-up on the board (+4..10 at
  formation would lift every trajectory's whole season).

## Wall numbers (this pilot)

Wins 0/8. National 0/8, table 0/8 (scaleRank "regional" on all
8; no seed leaves regional scale). Wave-4 unlocks 7/8, wave-5
unlocks 1/8 (99101, released d106 per standaccum-b). Readiness-5
not re-instrumented here — see standaccum-b. Median run-days
132 (2 seeds censored at the 150d horizon: 99104, 99107
survived). Death causes not instrumented by this arm — not
reported, not guessed. The wall did not move on this run: the
band's numbers reproduce standaccum-b exactly, which is the
non-perturbation proof, not a new wall reading.

## Village assessment (plain words)

Picture eight villages, each holding exactly one friendship —
one other fire that bowed to them, early, and then mostly waited.
The bond is real: the other village sends tribute every single
week without fail, and when Haven's bins run low they walk in
with grain and no ceremony, and Haven says yes, and trust
climbs a little. But nobody in Haven ever tends the bond, nobody
answers the first gesture the System staged on the day the bond
was born, and nobody answers when a dead speaker's successor
asks, in so many words, whether Haven still holds. So the bond
cools the way a fire cools when nobody feeds it — not from
betrayal, not from hunger, but from funerals. Every time the
far village buries someone, the trust drops by eight; every
time something strikes them in the night, five more. One
village, 99104, kept its bond warm long enough for it to count
as seasoned, for four weeks, and it still counted for nothing,
because a realm needs three warm bonds and there was only ever
one. The villages aren't hostile to diplomacy. They just never
answer the mail.

## Sense-test

- Formation lines read like people, not numbers: "⛓️ Nathan
  brings it home: Emberhold bows to Haven — one organization,
  us primary. Tribute: 4,000 kcal/week. The relationship starts
  at trust 30. Everything from here is earned." + Codex: "First
  link formed with Emberhold. The gesture goes out now; the Dawn
  waits for seasons." A named villager carries the proposal; the
  System narrates the season it will take.
- Aid lines read like people: "🏃 Omar of Emberhold walks into
  Haven unannounced, pack-mules behind. 'Heard your bins are
  echoing. Emberhold has grain to spare — 2,693 kcal, no
  tribute, no ceremony. Say the word.'" / "You accept
  Emberhold's food — 2,693 kcal on the road, 2 day-parts out.
  Omar clasps your runner's shoulder. 'That's what the fire
  network is FOR.' (Trust +4.)" The +4 is earned in the fiction,
  not just the ledger.
- Tribute-waiver lines are honest about the mechanism: "🌾
  Tribute wagons from Emberhold turn at the gate — our shelves
  are full past tomorrow. 'Eat well,' we send back. 'That IS
  your tribute this week.' (Trust +1.)"
- One sense-test tension, named not fixed: the say lines use
  the word "trust" for TWO different numbers — link trust
  ("(Trust +4.)") and village opinion ("A runner from
  Stonebridge: 'Your foragers are stripping our side… (Trust
  −3. The commons cuts both ways.)" / raid lines "(Trust −10.)").
  A reader can mistake a pre-link opinion hit for a bond hit.
  The numbers are coherent in code (ov.trust vs link.trust);
  the shared word is the confusion.
- The say filter's noise (meal lines "they don't trust you
  yet", garden sow lines) is the same known instrument noise
  as standaccum-b's; the sense-test here reads the link's own
  history notes + the named-village lines, not the raw sample.
- No robotic villager behavior was flagged by this arm's
  corpus; the sense-test gap is the unanswered mail above, not
  behavior. 99103's trust-0 link recovering to 4 on an aid
  accept reads correctly as a bond that went cold and was fed
  again — not as a zombie (it never broke; it just sat at 0
  for ~12 days).

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The DIAG-GO bars held up: trajectory classes separated the
  band cleanly (6/1/1), the seq-interval reconciliation went
  138/138 with zero residue, and the polity-blocking rule
  produced a clean 7/1 split. No bar needs lowering or raising.
- Instrument v2 is the story of this run: the v1 premise
  ("every gain routes through _trustGain") was false, and the
  pilot caught it before any verdict was drawn. The setter +
  seq design should be the default for any future trust
  instrument — day-matched reconciliation is wrong whenever
  settlement-phase moves exist.
- Two instrument gaps remain for the next arm: (1) link-raise
  stagings are not logged, so the no-second-link question
  cannot distinguish "never staged" from "staged and declined/
  expired" — the next polity arm needs a `tele('bond_proposed')`
  or pendingLinkRaise recorder; (2) the formation-day write
  gap (writes before the first snapshot land inside born trust)
  is disclosed but unlogged — a formation-day event (aid give)
  is visible only in the history note, not the event log.
- The `tribute-weekly` cause lumps full-pay and deposit-gate
  waiver (+1 both ways); the split (62 waived / 24 paid) came
  from history-note text, not the event log. A future
  instrument that needs the split should tag it at the event.
- Class note: 99102's `rises` (peak 40 at age 12) vs 99104's
  `seasoned` (40+ at age 30+) shows the class boundary doing
  real work — the same peak trust seasons or not depending on
  WHEN it arrives.

## Next blanks, in order

1. **Answer the mail (the trust-growth lever, NAMED not built).**
   Under competent play the trust growers that exist go
   unused: tendLink (+8/week, never called), the first-gesture
   accord (+4..10, pending from formation day to death on all
   8 seeds), renegotiation answers (7 silences × −6). A build
   arm that answers pending beats and tends weekly — leadcourt
   already does both, under its own pantry gates — should be
   measured on this band for (a) seasoning rate, (b) polity
   formation, (c) survival cost. Do NOT move readyDemand
   numbers or any win price/deed gate on this evidence.
2. **Second-link road (the polity half).** A polity needs ≥ 3
   seasoned subordinates and the band forms at most 1 link.
   Next arm: a link-raise staging recorder (tele events /
   pendingLinkRaise snapshots) to learn whether second raises
   are never staged or staged and lost — before any second-link
   build is proposed.
3. **Succession + titan as the decay drivers.** −195 and −127
   of the −364 band total. Whether the −8 funeral haircut and
   the −5 night-strike are tuned right is a STEVE-CALL (they
   are the price of a bond in a world where speakers die and
   titans strike), not a lever to quietly soften. Any build
   that touches them needs his word first.

## Findings for the coordinator

- **TRUST GROWS ONLY ON AID + TRIBUTE UNDER COMPETENT PLAY
  (DIAG-GO).** +205 total: aid-offer-accept +136 (34 accepts),
  tribute-weekly +65 (65 weeks), aid-beg-give +4 (1 give).
  Tend 0, accord 0, renegotiation answers 0. Every trust-up
  event attributed, 138/138 link-days reconciled, 0 residue.
  (This arm.)
- **THE DECAY IS FUNERALS + NIGHT-STRIKES (DIAG-GO).** −364
  total: succession haircuts −195 (27 × −8), titan strikes −127
  (28 strikes), renegotiation silence −42 (7 × −6). Tribute is
  100% reliable (86 weeks: 62 waived, 24 paid, 0 thin, 0
  nothing) — the decay is not a tribute problem. (This arm.)
- **THE ACCORD IS LEFT UNREAD ON ALL 8 SEEDS.** pendingAccord
  appears on formation day and never clears; the first-gesture
  gain (+4..10) never fires under competent play. (This arm.)
- **THE CHOKE COSTS 21 TRUST.** 21 weekly +1s mourning-blocked
  band-wide (grief is not bought off — but the trust is never
  recovered either). (This arm.)
- **ONLY 99104 EVER SEASONS; NO POLITY FORMS.** 28 seasoned
  days (d73–d100, trust 42–45), ended by a titan/succession
  cluster (−18 in a week). Polity 0/8 on every road; blocking
  7× never-seasoned + 1× seasoned-but-no-polity. (This arm.)
- **V1 INSTRUMENT PREMISE REFUTED (method finding).** Not all
  trust gains route through _trustGain — comms.js, safetynets.js
  and titans.js write link.trust directly. Any future trust
  instrument must intercept the property, not the choke. (This
  arm; prereg amendment 1.)
- **SAY-LINE "TRUST" IS TWO NUMBERS.** Link trust and village
  opinion share the word in say lines (opinion hits "Trust −3/−10"
  pre-link read like bond hits). (This arm.)

## Proof and landing

- Proof: `scripts/test-trustgrowth-b.js` — 10/10 PASS (v2:
  cause map incl. direct writers, seq-interval
  reconciliation, wrap/setter dedupe, live setter-capture leg,
  determinism leg). Re-run post-commit below.
- Commits (this worktree branch sim-trustgrowth-b; coordinator
  merges via --ff-only; merged locally, pending ship — no push,
  no bump, no live verification by this worker):
  - 401bb7b05 sim-trustgrowth-b prereg (before any judged sim)
  - d41ec0256 sim-trustgrowth-b instruments + proof 9/9 (v1,
    zero src/js)
  - e8adc55fe sim-trustgrowth-b prereg amendment 1 + instrument
    v2 (setter event log, seq intervals) + proof 10/10
  - (pilot v2 + evidence commit below)
- Files: prereg + amendment + evidence in
  `evidence/2026-11-09/sim-trustgrowth-b*.md`; per-seed JSON in
  `evidence/2026-11-09/perseed-trustgrowth-b/` (8 v1 shakedown
  files + 8 v2 judged files + 2 summary JSONs); scripts
  `trustgrowth-instrument-20261109.js`,
  `trustgrowth-driver-20261109.js`,
  `trustgrowth-analyze-20261109.js`,
  `test-trustgrowth-b.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after all three commits;
  repaired each time via HEAD-blob `update-index --cacheinfo`
  after hash-object verification, and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves were
  always correct.
- Worktree state at handoff: only committed work; no uncommitted
  leftovers beyond the pilot + evidence commit below (verified
  before reporting).
