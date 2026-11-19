# sim-sensecotravel-b — corrected join + sense co-location decomposition (Loop B 0130Z run, DIAG)

## Verdict: DIAG-GO — the corrected join reproduces the pilot's sensitivity exactly (4/6 = 0.67), and every sense miss is classified: expeditions genuinely split, the guard never bit

**Frozen prereg:** `evidence/2026-11-18/sim-sensecotravel-b-prereg.md` (this run).
**Base master:** `48c81dac6` (Loop B 2330Z adoption closeout). Branch
`sim-sensecotravel-b`.
**Corpora (re-judged, no new sims):** the 2330Z pilot corpora
`evidence/2026-11-18/perseed-allyslot3-rerun-b-ctl/` +
`perseed-allyslot3-rerun-b-arm/` (band 104720–104727, 8 seeds/leg, 150d,
0 instrument errors).
**Analysis:** `evidence/2026-11-18/allyslot3-sensecotravel-b-analysis.json`.
**Proofs:** `scripts/analyze-allyslot3-b.js --selftest` 24/24 (was 11/11 —
12 new checks: d117 regression, trio-exclusion, best-match-beats-recency,
7 classification classes + cap-2 relabel); `scripts/test-sensecotravel-b.js`
24/24 on the real corpora.
**Pilot verdict UNCHANGED:** the 2330Z pilot stays NO-GO under its frozen
prereg (field-4 3/7 = 0.43 < 0.80). This arm re-judges under the corrected
instrument and diagnoses the sense; it does not re-score the pilot.

## The work, in plain words

Two things were wrong with how the last pilot counted its fights. First,
its scorekeeper matched each fight to the first hunting party that fit,
so a fight could be credited to the wrong party — including one fight
where the fourth hunter actually joined and fought, which was counted
as a failure. Second, the "sense" — the game's way of noticing who is
standing beside you when a fight starts — found the full four-person
party only half the time, and nobody had measured why. This run fixes
the scorekeeper (match a fight to the party its fighter actually belongs
to, best match wins, most recent on ties) and measures every miss:
for each hunter the sense failed to find, was he on the same trip on a
different patch of ground, out with a different party, or simply not
there at all?

## (a) Corrected join — finding #2570 (filed number; brief called it #2577)

The analyzer's join is now fighter-anchored best-match: candidates are
quad launches in the 21-day window; the fighter must belong to the
launch; score is the number of sensed allies in the party; most recent
launch day wins ties. The same corrected join now drives both the
field-4 table and the (reported) size-4 damage share, so the instrument
is one join.

**Test case (frozen):** seed 104722 day 117, the editor — fighter
miguel_santos, ally3 nikos_papadopoulos joined and dealt 17. Under the
corrected join it counts as fielded (joined to the day-115 launch,
party petra + hannah + miguel + nikos — the sensed trio exactly).
Verified in the analyzer selftest (synthetic) and in
`test-sensecotravel-b.js` against the real corpus row.

### Re-judgment table (old join → corrected join)

| | Old join (pilot) | Corrected join |
| --- | --- | --- |
| Arm meetings | 10 | 9 (d61 trio fight excluded) |
| Arm field-4 denominator | 7 | 6 |
| Arm field-4 numerator | 3 | 4 (d117 flips to fielded) |
| **Arm field-4 rate** | **3/7 = 0.43** | **4/6 = 0.67** |
| Arm sense rate | 5/10 = 0.50 | 6/9 = 0.67 (d117 flips to full) |
| Arm raw rate (all meetings) | 3/10 = 0.30 | 4/9 = 0.44 |
| Ctl meetings / denom / numer | 6 / 3 / 0 | 5 / 2 / 0 (d61 excluded) |
| Ctl sense rate | 0/6 | 0/5 (cap-2 by construction) |
| Size-4 damage share (arm) | 0.151 (n=10) | 0.161 (n=9) |
| Size-4 damage share (ctl) | 0.094 (n=6) | 0.100 (n=5) |

The corrected rate **4/6 = 0.67 reproduces the pilot evidence's own
sensitivity note exactly** — the instrument is confirmed, not adjusted
to fit. It is still below the pilot's 0.80 bar, so the re-judgment is
still NO-GO on the pilot's bar, as pre-registered. The pilot's NO-GO
stands; nothing is overturned.

Per-seed arm field-4 (corrected): 104721 2/3 (ally3Dealt 81), 104722
2/3 (ally3Dealt 17), 104726 0/0; all other seeds 0 meetings. The two
denominator misses are d69 (104721) and d112 (104722) — both genuine
sense misses, classified below.

## (b) Co-location decomposition — finding #2571 (filed number; brief called it #2578)

**Every arm-leg sense miss classified (3 meetings, 7 missing companions,
0 unclassified):**

| Meeting | Missing companion | Cause | Evidence |
| --- | --- | --- | --- |
| 104721 d69, audit (fighter gen_5b212hy, joined d65 quad) | nikolai_volkov | **expedition-ended** — expedition split | Gate planParty = [gen_3ghdbz4] only; census: full party + all onExped d67, party shrunk + companions off-expedition d68; dawn d69: nikolai away, not onExped, at (3,4) |
| 104721 d69 | gen_dnv7tkn | **expedition-ended** — expedition split | Same as above; dawn d69: back at Haven (4,4), not onExped |
| 104722 d112, eater (fighter nino_kapanadze, joined d106 quad) | petra_novak | **different-expedition** — live d111 quad | Gate planParty = [hannah_kim] (fighter re-launched as a pair d111, overwriting the quad party); petra is holder of the live d111 quad [hannah, miguel, nikos] |
| 104722 d112 | miguel_santos | **different-expedition** — live d111 quad | Same as above; miguel is on petra's d111 quad, not nino's d111 pair |
| 104722 d112 | visjoin_100 | **expedition-ended** — expedition split | Petra's d106 expedition ended d110 (census holderExped false); visjoin home by d112 |
| 104726 d82, reunion (fighter gen_befdi99, joined d81 quad) | victor_lopez | **dead** — holder died d81 | Death "a wound that wouldn't close" d81; death cleanup purged him from the fighter's plan party (gate planParty = [katarina_novak]) |
| 104726 d82 | ingrid_vik | **dead** — died d82 | Death "The Ugly Beast" d82 (wound from the d81 reunion fight); purged the same way. The same party sensed the full trio one day earlier (ingrid's d81 fight) |

Totals, arm leg: **expedition-ended 3, different-expedition 2, dead 2.**
Control leg (cap-control): the same 2 dead + 2 expedition-ended on the
deterministic twin meetings, plus 3 **cap-2-cut** — the third launch
companion present in the plan party but cut by the control sense's
2-ally cap (d91 app_mgpspkqo111, d94 petra_novak, d138
app_mgpsplkf603). Those three are cap artifacts, not guard failures.

### The answer, measured not assumed

**Expeditions genuinely split — and the guard never bit.** Two
corrections to the question as posed:

1. **There is no tile-equality guard.** The sense
   (`party-wiring.js`, LAUNCHPARTY substrate) guards on expedition
   TARGET `(tx, ty)` — same destination — with an explicit "no node
   check: they travel together even a leg apart at the meeting
   instant" comment. The pilot evidence's "same-expedition tile
   guard" wording is imprecise; the code never compares tiles.
2. **The guard was never reached for any missing companion.** In all
   three misses, the missing hunters were already absent from the
   fighter's current plan party at the meeting instant (gate
   `planParty` truncated to 1 of 3 in every case), so the sense's
   launch branch never considered them. The class
   `in-plan-party-but-unsensed` — the only class that could implicate
   the guard — is **empty (0 of 7)** on the arm leg. The tile question
   is moot: nothing in this corpus tests the guard, because nothing
   reaches it.

When the plan party is intact, the sense works: **6/6 on the arm leg**
(d80, d98, d91, d117 editor, d117 rerun, d138 — every meeting with a
full plan party returned the full trio). The binding constraint is
**plan-party integrity over the expedition's life**, not the guard:
- A fighter who re-launches (nino's d111 pair) overwrites the quad
  party in his own plan, so the sense reads the pair, not the quad
  (d112).
- Companions' expeditions end on their own clock while the holder
  stays out (d69: the d65 party was whole at (1,4) on d67; by d68
  both companions were off-expedition and the holder's plan listed
  only gen_3ghdbz4). The holder himself re-departed d68
  (`dawnbidStarts` logs a directed startExpedition that day), but the
  exact call path that rewrote his plan party to one companion is
  **not identified in the corpus** — no v4departs/dawnbidScores row
  records it, and no death/leave cleanup fired for either companion
  (both alive; `removalCleanups: 0`). Recorded as unproven, not
  guessed. The classification (expedition-ended) stands on the
  census + dawn data regardless.
- Deaths purge correctly and fast (d82: the holder died d81 at 2 HP
  and the second companion died d82; both were already gone from the
  plan by the meeting — the cleanup is working as designed, not a
  sense failure).

### Named next lever

The sense should read the **expedition's membership, not the mutable
plan party**: at the meeting instant, the launch branch should take
the fighter's current expedition companions (same expedition record —
the `agencyState().exped` entries that share the fighter's target)
instead of `winPlan[vid].party`, which a re-launch, a companion's
early return, or a death can rewrite under the fighter mid-hunt.
Alternatively (or additionally): hold a launched quad's expeditions
together — companions on a launched hunt share the holder's return,
no independent early return while the hunt is live. Which of the two
is the smaller change is the next arm's design call; the DIAG does
not pick it. The tile/target guard needs no loosening — it is not the
constraint, and loosening it would change nothing on this corpus
(0 of 7 misses reach it).

## Wall numbers (unchanged corpora — the pilot's numbers, restated)

| | Control | Arm |
| --- | --- | --- |
| Wins (full seat) | 0 | 0 |
| National scale | 0 | 0 |
| Wave 5 reached | 5 | 5 |
| Wave 4 reached | 7 | 7 |
| Standing ≥200 | 5 | 5 |
| Median survival | 136d | 137d |
| Survived 150d | 4 | 4 |

No village took the full seat on either leg; no village reached
national. No new wall measurement — the corpora are unchanged.

## Sense-test (villagers acting like people)

Read from the fight rows and the census trails. The d82 story reads
as a real hunt falling apart, not a staged demo: a holder launches a
quad at 2 HP, dies of his wounds the same day, his companion dies
the next day in the same monster's shadow, and the survivor meets the
Reunion with a bystander instead of his party. The d112 story is the
same kind of real mess: a hunter re-launches as a pair mid-hunt and
his old party walks past him with a different hunter. Nothing in this
arm's corpora reads robotic in a way the arm caused. The one
sense oddity worth naming is the mechanism itself: a villager's sense
of "my party" is whatever his plan most recently said, not who
actually set out with him — a player watching the d112 fight would
see Nino's old companions standing nearby, unsensed, while two
strangers-to-his-party answer his shout. That is the finding, not a
narration bug.

## What this means for finding #2515

The 2-ally cap question is now answered in the negative for the
mechanism AND the sense: the slot fires when staged (4/6 under the
corrected join), the sense returns the trio whenever the plan party
is intact (6/6), and the misses are upstream — the plan party decays
as expeditions split, re-launch, or lose members to death. The
bottleneck moved from the sense to **plan-party integrity over the
expedition's life**. The fightcap arm still owns whether the fourth
member's damage matters; this arm owns the join (fixed here) and the
next lever (sense reads expedition membership, not the mutable plan).

## Metric review

- **No metric was re-scored.** The pilot keeps its NO-GO under its
  frozen prereg and first-match join. The corrected 4/6 = 0.67 is a
  re-judgment under a between-run instrument revision, frozen in the
  prereg before the analyzer change, and it matches the pilot
  evidence's own sensitivity note exactly — the expectation was not
  adjusted to fit the output.
- **DIAG-GO criteria (prereg) all met:** (a) the analyzer
  reproduces the d117 test case as fielded (synthetic selftest +
  real-corpus proof test); (b) selftest 24/24 green; (c) every
  arm-leg sense miss classified by cause, 0 unclassified;
  (d) the next lever is named (sense reads expedition membership).
- **Prereg class change, disclosed:** the frozen classes did not
  include a cap label for the control leg. The classifier gained a
  `cap-2-cut` sub-label (ctl only: the sensed list already holds 2
  launch companions, so the missing third is the cap cut). It changes
  no arm classification and no DIAG-GO criterion; it keeps the
  durable JSON from misreading a cap artifact as a guard failure.
- **Different-expedition rule, disclosed:** the classifier counts
  only a LATER in-window launch as a different expedition. An older
  launch is superseded — the companion departed on the joined launch
  (or was skipped there and kept their own trip, which this corpus
  cannot show per-companion; none of the judged misses turns on it).
  The first implementation counted any in-window launch and
  misattributed d69 gen_dnv7tkn (stale d48 launch) and d112
  visjoin_100 (same-party d102 re-launch); both were corrected to
  expedition-ended before freezing the numbers, and the selftest
  pins the rule.
- **Dawn-row artifact, handled:** a bidder's own `companionPool`
  entry reads `node: null` / `firstFail: selfOrScholar`; the
  classifier prefers non-bidder rows. Meeting days d82 and d112
  have 0 dawn rows — those classifications rest on census +
  departs + deaths, as the prereg allowed.
- **Trim mechanism unproven (d69):** the holder's plan party
  shrank 3→1 between d67 and d68 with no recorded launch, death, or
  leave to explain the trim. The companions' expedition-ended
  classification does not depend on it.
- **No fresh band was run.** The corpora answered #2571 (gate
  planParty + census + departs + deaths + dawn rows classify all 7
  missing companions), so per the prereg no fresh 8-seed pilot was
  needed and no seed-band freshness search was run.

## Proofs

- `node scripts/analyze-allyslot3-b.js --selftest`: 24 passed,
  0 failed (11 pre-existing + 13 new: d117 regression, d61
  trio-exclusion, best-match-beats-recency, 7 classification
  classes + cap-2 relabel).
- `node scripts/test-sensecotravel-b.js`: 24 passed, 0 failed —
  d117 fielded on the real corpus row, d61 excluded, re-judgment
  4/6 + sense 6/9, classification counts
  (expedition-ended 3 / different-expedition 2 / dead 2), 0
  unclassified, 0 in-plan-party-but-unsensed.
- `node --check` clean on both touched scripts. No game code
  changed; no `check.js` run (analyzer + proof-test only, no
  gameplay surface; the analyzer selftest + proof test are the
  instrument's own suite).

## Landing

Evidence + analyzer + proof test only. No game-code change, no lever
to hold or land. Findings #2570/#2571 (filed numbers; brief #2577/
#2578): #2570 fixed in the analyzer (corrected join, this arm);
#2571 answered (expeditions genuinely split; the guard never bit),
with the next lever named above. The `sim-findings.md` entries are
updated accordingly. Ready for coordinator merge; no push, no bump,
no live verification (ship loop owns those).
