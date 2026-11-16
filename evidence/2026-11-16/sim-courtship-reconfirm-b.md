# sim-courtship-reconfirm-b — re-confirm of the courtship-rework2 PILOT GO (Loop B, 0430Z run)

**Verdict: CONFIRM GO.** G1 GO, G2 GO, G3 GO, cost bar PASS — all four
bars met on the frozen prereg, no bar re-scored. The pilot holds on 16
fresh seeds: covenant staged **14/16** on the armed leg, every staged
beat answered 'pact' and sat; zero-movement continuation pilgrim-days
**0 band-wide**; stale drops **0**; every pilgrimage (54/54) ends in a
study. The confirm band 100621–100636 is now SPENT. The findings-backlog
item ("THE PILGRIMAGE STALLS ON FAR VILLAGES") is [fixed] if the
coordinator marks it so — this arm does not edit sim-findings.md.

## What this run was

The 2330Z confirm (sim-courtship-confirm-b) went CONFIRM NO-GO on G3
alone: test-covenant-b 32/33 on tip cb00f9818 — the smoke's
opinion-timing assumption (~day 150) falsified by journey r137
(opinion-10 by day 59). No judged sim ran; the band stayed unspent.
The smoke revision (sim-covenantsmoke-b, landed 6ca37144b) revised the
assertion to the new timing and re-checked the substrate
(test-covenant-b 40/40, test-onlylead2-b 26/26). This re-confirm re-runs
the confirm on the same frozen shape, same reserved band, with the
REVISED recorded baselines (see prereg
sim-courtship-reconfirm-b-prereg.md). Base tip 655949b97 (includes
6ca37144b). SWEEP ONLY — zero src/js, zero policy edits; both policies
already on master.

Run notes: a runtime restart interrupted the sweep at 20/32 configs
(seeds 100621–100630 × 2 policies). Resume followed the prereg: the 20
completed files were validated as complete JSON with 0 instrument
errors, the remaining 12 configs (seeds 100631–100636 × 2) ran fresh,
no config was re-run, no file overwritten. The first sweep log lived
in /tmp and was lost in the restart; the resume log is outside the
repo. Separately, the safe-commit index clobber struck after the
instrument commit (committed files showed as staged-deleted in the
main index; the commit itself was correct — worktree hashes == HEAD
blobs); repaired with `git ls-tree -r HEAD | git update-index --add
--index-info` and verified with empty `git diff HEAD` + empty
`git diff --cached`.

## Prereg gates

| Gate | Bar | Result | Verdict |
|---|---|---|---|
| G1 instrument validity | full series + shape roll + daily opinion + daily pos + pilgrim state on all 32; 0 errors; every staged beat classified; UNCLASSIFIED ≤2 band-wide; pilgrim rollup present | 32/32 complete, 0 errors, UNCLASSIFIED 0, pilgrim rollup on every armed record | **GO** |
| G2 the lever | covenant staged ≥6/16; every staged beat answered 'pact' and sat (death-day beats excluded); zero-move pilgrim-days band-wide ≤16 AND per-seed ≤8 on every seed; stale drops band-wide ≤8 | staged **14/16**; 16/16 beats answered 'pact' and sat (no beat staged on a death day — the exclusion is moot); zero-move **0** band-wide, **0 on every seed**; stale drops **0** | **GO** |
| G3 lever-only | zero `src/js`; proof tests green at recorded baselines (REVISED: covenant 40/40, onlylead2 26/26) | 0 `src/js` files in the branch diff; test-courtship-rework2-b **59/59**; test-courtship-rework-b **58/58**; test-courtship-b **57/57**; test-covenant-b **40/40**; test-onlylead-b **29/29**; test-onlylead2-b **26/26** | **GO** |
| Cost bar (veto) | starvation ≤ baseline+2 AND median survival ≥0.8× baseline | starvation **5 vs 8**; median survival **187.5d vs 179.5d (1.04×)** | **PASS** |

## Per-seed per-shape table (armed leg, competent-courtship-b)

| seed | days | end | scale | covenant | national answer | first op-10 | max op | w4 kills | w5 kills |
|---|---|---|---|---|---|---|---|---|---|
| 100621 | 200 | survived | regional | STAGED sat 2/2 | d71, d106 sat | d17 | 79 | — | — |
| 100622 | 178 | village-lost | regional | STAGED sat 2/2 | d93, d148 sat | d28 | 33 | — | — |
| 100623 | 188 | village-lost | national | STAGED sat 1/1 | d65 sat | d4 | 47 | — | — |
| 100624 | 200 | survived | national | STAGED sat 1/1 | d88 sat | d12 | 59 | — | — |
| 100625 | 144 | village-lost | national | STAGED sat 1/1 | d68 sat | d16 | 25 | — | — |
| 100626 | 187 | village-lost | national | STAGED sat 1/1 | d67 sat | d4 | 60 | — | — |
| 100627 | 200 | survived | regional | STAGED sat 1/1 | d134 sat | d12 | 65 | — | — |
| 100628 | 111 | village-lost | national | STAGED sat 1/1 | d84 sat | d4 | 31 | — | — |
| 100629 | 106 | village-lost | national | STAGED sat 1/1 | d63 sat | d4 | 31 | — | — |
| 100630 | 200 | survived | regional | BLOCKED seasoned-short 2-of-3 | — | d13 | 49 | — | — |
| 100631 | 136 | village-lost | national | STAGED sat 1/1 | d93 sat | d4 | 36 | — | — |
| 100632 | 200 | survived | regional | STAGED sat 1/1 | d86 sat | d5 | 50 | — | — |
| 100633 | 200 | survived | regional | STAGED sat 1/1 | d85 sat | d4 | 51 | — | — |
| 100634 | 162 | village-lost | national | STAGED sat 1/1 | d64 sat | d4 | 39 | — | — |
| 100635 | 156 | village-lost | national | STAGED sat 1/1 | d68 sat | d16 | 37 | — | — |
| 100636 | 200 | survived | regional | BLOCKED seasoned-short 2-of-3 | — | d16 | 48 | — | — |

(Wave-kill columns are band totals, not per-seed: armed w4 kills 71,
w5 kills 14; control w4 73, w5 23 — see Wall numbers. Per-seed
waveKills live in the per-seed JSONs.)

Control leg (competent-covenant-b): covenant staged **6/16**
(100625 sat 1/1 d162; 100626 sat 1/1 d101; 100627 sat 1/1 d82;
100631 sat 1/1 d87; 100632 sat 2/2 d92, d188; 100636 sat 1/1 d120).
The other 10 blocked: seasoned-short (2-of-3, 1-of-3, 2-of-2,
0-of-1, 0-of-2) on 8 seeds, no-peer-links on 2 (100628, 100629).
Armed leg: lead 0/16, conquest 0/16, belong 0/16, trade 0/16,
UNCLASSIFIED 0 — the isolation held (no lead staging on the
courtship leg). National held days, armed: 75, 55, 124, 114, 77,
121, 52, 28, 44, 0, 44, 48, 98, 99, 89, 0 (median 65 days);
control: 0, 0, 0, 0, 14, 74, 120, 0, 0, 0, 91, 106, 0, 0, 0, 5
(median 0 days).

The two armed non-stages (100630, 100636) are seasoning-bound, not
walk-bound: both hold 2-of-3 seasoned peer links at run end, the
third link formed but never seasoned (30+ days AND trust 40+). On
100630 the scholar ran 6 pilgrimages and 6 studies and the village
still survived 200 days at regional with 0 national days — the
seasoning gate, not the road, is now the binding constraint on the
armed leg. That is the next arm's question, not this confirm's.

## Opinion trajectories

First day max-known-opinion reached 10, per seed:

| seed | armed | control |
|---|---|---|
| 100621 | d17 | d31 |
| 100622 | d28 | d76 |
| 100623 | d4 | d48 |
| 100624 | d12 | d37 |
| 100625 | d16 | d88 |
| 100626 | d4 | d47 |
| 100627 | d12 | d45 |
| 100628 | d4 | d46 |
| 100629 | d4 | d152 |
| 100630 | d13 | d73 |
| 100631 | d4 | d31 |
| 100632 | d5 | d59 |
| 100633 | d4 | d56 |
| 100634 | d4 | d73 |
| 100635 | d16 | d60 |
| 100636 | d16 | d38 |
| **median** | **d8.5** | **d52** |

The lever opens opinion ~6× earlier than baseline (d8.5 vs d52) and
faster than the pilot's armed leg (median d4.5 on 8 seeds — the
confirm band is slower, d8.5, but the control is far slower still).
Max opinion armed 25–79 (median ~48) vs control 10–66 (median ~33).

## Deeds table (armed leg)

| seed | aids (kcal) | studies | pilgrimages | pilgrim-days | stale drops | walk refusals |
|---|---|---|---|---|---|---|
| 100621 | 3 (6,000) | 3 | 3 | 6 | 0 | 0 |
| 100622 | 3 (6,000) | 5 | 5 | 11 | 0 | 1 |
| 100623 | 3 (6,000) | 2 | 2 | 4 | 0 | 0 |
| 100624 | 3 (6,000) | 6 | 6 | 12 | 0 | 0 |
| 100625 | 3 (6,000) | 3 | 3 | 6 | 0 | 0 |
| 100626 | 3 (6,000) | 2 | 2 | 4 | 0 | 0 |
| 100627 | 3 (6,000) | 3 | 3 | 6 | 0 | 0 |
| 100628 | 4 (8,000) | 5 | 5 | 11 | 0 | 0 |
| 100629 | 3 (6,000) | 2 | 2 | 4 | 0 | 6 |
| 100630 | 2 (4,000) | 6 | 6 | 12 | 0 | 1 |
| 100631 | 3 (6,000) | 2 | 2 | 5 | 0 | 0 |
| 100632 | 3 (6,000) | 3 | 3 | 4 | 0 | 0 |
| 100633 | 3 (6,000) | 3 | 3 | 6 | 0 | 0 |
| 100634 | 3 (6,000) | 3 | 3 | 6 | 0 | 0 |
| 100635 | 3 (6,000) | 3 | 3 | 6 | 0 | 8 |
| 100636 | 3 (6,000) | 3 | 3 | 4 | 0 | 0 |
| **total** | **48 (96,000)** | **54** | **54** | **107** | **0** | **16** |

Every pilgrimage (54/54) ends in a study. Verb counts band-wide:
`studyVillageCodex:policy` 54, `aidVillage:policy` 48,
`proposeCovenant:policy` 1107, `_formPeerLink:policy` 84.

**walkRefusals split (BFS-step refusals vs greedy-fallback vetoes):
NOT measurable from this corpus.** The landed policy carries a
single `walkRefusals` counter — all five increment sites (greedy
pathBlocked veto, greedy travelTo throw, greedy no-move, BFS
travelTo throw, BFS no-move) feed the same number, and no per-site
log exists. The pilot's metric-review #3 proposal (split the
counter) was never implemented: it needs a policy-side change,
out of scope for this sweep-only arm. What the corpus does prove:
the 16 refusals sit on seeds with 0 zero-move days (100622: 1,
100629: 6, 100630: 1, 100635: 8), so no refusal produced a stall —
the stall read rests on zero-move days (0), not on refusals, exactly
as the pilot concluded. The split stays an open instrument item for
the next run (see metric review #4).

## Wall numbers

| | control | armed |
|---|---|---|
| Won (table) | 0/16 | 0/16 |
| National ever | 3/16 | **9/16** |
| National final | 3/16 | **9/16** |
| Table / seat takes | 0 / 0 | 0 / 0 |
| Wave 4 ever | 16/16 | 16/16 |
| Wave 5 ever | 11/16 | **12/16** |
| Wave-4 kills (total) | 73 | 71 |
| Wave-5 kills (total) | 23 | 14 |
| Survived 200d | 7/16 | 7/16 |
| Median survival | 179.5d | **187.5d** |
| Starvation deaths | 8 | **5** |
| Total deaths | 1560 | 1412 |
| Deaths per 100 days (panel) | 57.3 | 51.7 |

National access triples on the armed leg (9/16 vs 3/16) with
survival moving the same way (median 187.5d vs 179.5d, deaths/100d
down). Wins are still 0 everywhere and wave-5 kills fell (14 vs 23)
while wave-5 facing rose (12/16 vs 11/16) — the same downstream
pattern as the pilot: more villages reach the wave-5 door, but they
kill fewer wave-5 monsters once there. The winnability gap is still
downstream — national without wins — but it is no longer national
without survival.

## Starvation split (preregged: per seed vs aid kcal paid before death day AND vs pilgrim-days before death day)

Armed leg: **five starvation deaths**, one per seed:

| seed | death day | aid kcal paid before | last pilgrim day before | gap |
|---|---|---|---|---|
| 100623 | d149 | 6,000 (full spend) | d9 | 140d |
| 100628 | d74 | 8,000 (full spend) | d40 | 34d |
| 100629 | d76 | 6,000 (full spend) | d21 | 55d |
| 100630 | d180 | 4,000 (full spend) | d134 | 46d |
| 100635 | d138 | 6,000 (full spend) | d12 | 126d |

In every case the full lever spend was paid long before the death,
and the last pilgrimage ended 34–140 days before it. Neither the
aid spend nor the scholar's absence explains any of the five — the
same trajectory reading as the pilot: the village that starves is
the one whose pantry collapses in the endgame trough. Control leg
starved 8 (100625 d178; 100628 d95; 100630 d174, d184; 100631
d178, d190; 100633 d165; 100636 d122) — with no lever spend and no
pilgrimage at all, so the lever cannot be charged with them either.

§14c guardrail (villager combat deaths >50% over the before leg,
named per seed): **100633 (68 vs 39, +74%)** — and it is a real
rate increase, not pure exposure (33.8 vs 23.4 deaths/100d), on a
long national-held run (98 held days). **100628 sits exactly at
the line (72 vs 48, +50%)** — not over the bar, but also a real
rate increase (64.9 vs 50.5 per 100d); named here so the next run
watches it. All other seeds are within the guardrail (100621 65
vs 76; 100622 89 vs 111; 100623 137 vs 126; 100624 95 vs 89;
100625 69 vs 115; 100626 87 vs 130; 100627 59 vs 125; 100629 41
vs 55; 100630 82 vs 66; 100631 47 vs 54; 100632 72 vs 87; 100634
98 vs 79; 100635 83 vs 122; 100636 62 vs 57). The guardrail is a
co-primary read, not a veto; the cost bar (starvation + median
survival) passes.

## Sense-testing

The Founding Council reads like a played ceremony, on the seeds
whose lines survived the 900-line cap (see the cap note below).
Quoted verbatim:

- Council (s100621 d70): *"🤝 The founding council: speakers from
  Stonebridge, Thornfield, Ashford sit in a circle — no throne, no
  kneeling. This league needs its first act. Swear the war-PACT
  (mutual defense — any member's call is answered, or refused
  aloud), found the shared POOL (2,000 kcal a week from every fire
  into one granary, drawn in famine), or WALK from this table for
  now. Or REFUSE the scale itself — stay a fr…"*
- Answer (s100621 d71): *"🤝 The war-pact is sworn — no throne, no
  kneeling, just hands on the table. When any member's treeline
  burns, the league answers: Haven sends hands (two villagers,
  three days) or refuses aloud and the whole league hears it.
  Stonebridge, Thornfield, Ashford — equals, now, in war as in
  council. The shared granary opens beside it: 2,000 kcal a week
  from every fire. (Trust +8 each.)"*
- Start (s100624 d3): *"You set out on the pilgrimage road to
  Thornfield's fire — their codex waits, and the covenant road is
  walked, not wished."*
- Return, studied (s100624 d6): *"You walk back into Haven,
  Thornfield's codex now read — the road was worth walking."*
- Covenant formed (s100621): *"🤝 Peyton brings it home: a
  COVENANT with Stonebridge — no primary, no kneeling. Mutual
  defense and a shared pool, decided by council vote. Equals. The
  relationship starts at trust 30."* — the deed arrives as a played
  line with a NAMED bearer (Peyton) and a NAMED village, not a
  ledger entry. Every covenant formation in the corpus carries its
  bearer's name.

Judgment: the ceremony holds. The pact answer names the price (two
villagers, three days) and the refusal rule aloud, and names the
three member villages. The pilgrimage lines name the village and
the road, and the return line distinguishes a completed study
("codex now read") from a turn-home — no stale turn-home was
needed this run (0 stale drops; the word "stale" appears 0 times
in the linkLines), so the stale line's voice is untested here,
exactly as in the pilot. Two blemishes, both engine text, not
policy text:

1. **The 900-line cap eats council lines.** LINK_LINES_CAP keeps
   the FIRST 900 lines; on 15/16 armed records the cap binds and
   the last captured line falls on day 74–120 while the run goes
   to 106–200 days. Council lines survive for 10 of the 14 staged
   seeds; the lines for 100622 (answers d93, d148), 100624 (d88),
   100627 (d134), 100631 (d93) and 100621's second beat (d106)
   are cut. The BEATS are still fully classified (verbEvents are
   uncapped — every answer is 'sat'), so G1 stands; but the
   sense-testing quotes cover 10/14 beats, not 14/14. Next run:
   raise the cap or capture council lines outside it.
2. **The engine homecoming line still repeats daily.** *"You walk
   back into Haven. N Codex entries. The village is glad to see
   you."* fires on adjacent days with only the count changing —
   most-repeated 25× on 100623, 26× on 100627. Same blemish the
   pilot named; untouched, as before — it is not this arm's text
   to rewrite.

No pilgrimage line repeats daily (starts are one-shot per trip;
the studied-return line fires once per completed study). No stall
went stale silently — there was no stall at all.

## §15 balanced panel (instrument, not judge)

`scripts/build-courtship-reconfirm-panels-20261116.js` from the two
per-seed dirs; the compare itself ran through
`scripts/balance-panel.js compare` (per the prereg); output
`evidence/2026-11-16/courtship-reconfirm-b-panel.{json,md}`.
Decision: **review_required** (16 paired cases). National scale
access 0.1875 → 0.5625 (+0.375, no material signal, CI 0 to 0.75).
Village deaths per run 97.5 → 88.25 (−9.25, no material signal).
Village deaths per 100 days 57.3 → 51.7 (−5.6, no material signal).
Community loss 0.5625 → 0.5625. Table win rate 0 → 0. The panel
agrees with the preregged bars: national access up, survival up in
rate terms, wins still 0. The panel does not overturn the GO; it
sharpens the same downstream question the pilot left (why national
access without wins), now with survival moving the right way on 16
fresh seeds.

## Metric review

1. **The confirm band is spent, and the pilot GO holds.** 14/16
   staged (bar 6/16) with a 0-stall, 0-stale read and a passing
   cost bar — the BFS rework is not a pilot-band artifact. The
   findings item ("THE PILGRIMAGE STALLS ON FAR VILLAGES") is
   [fixed] on this verdict (coordinator marks it).
2. **The control leg now stages on its own (6/16, was 1/8 in the
   pilot) — confirm metric review #5, confirmed.** Opinion-10 is
   met by median day 52 on the control leg at the new r137
   timing, and the road opens without any courtship deed. The
   "lever opens the gate" story needs the re-read the 2330Z run
   ordered: the lever no longer opens a closed gate — it
   ACCELERATES an already-opening road (~6× faster opinion,
   staging 6 → 14) and carries survival with it (median national
   held days 65 vs 0). The G2 bar judged the armed leg and passes
   with margin; the framing, not the verdict, is what changed.
3. **The seasoning gate is the next binding constraint.** The two
   armed non-stages are both 2-of-3 seasoned: the walk works, the
   deeds work, the links form — the third link does not season
   before the run ends. A future arm should ask whether seasoning
   (30+ days AND trust 40+) is the right throttle for a league
   whose members are already covenanted, or whether the road
   should stage on formed links and season after. Design
   question, not a measurement fix.
4. **The walkRefusals split is still unmeasured** (see §Deeds).
   The pilot's metric-review #3 proposal needs a policy-side
   counter split — two counters (BFS-step refusals, greedy-fallback
   vetoes) in competent-courtship-b.js, plus a proof check. It was
   out of scope for this sweep-only arm; the next run that touches
   the policy should land it. The total (16, all on 0-zero-move
   seeds) bounds the risk: no refusal stalled anything.
5. **The 900-line cap now costs sense-testing evidence** (see
   §Sense-testing). Onlylead2 raised the cap 600 → 900 for the
   200d horizon; at 200d the cap still binds before the council
   beats on 4/14 staged seeds. Next run: raise the cap again or
   capture the staged-beat lines outside the capped stream.
6. **The §14c guardrail trips on one seed (100633) and sits at
   the line on another (100628), both real rate increases on
   long national holds.** Same split as the pilot (two real rate
   increases, rest exposure or within bar). The confirm should
   watch whether national-held villages keep dying faster per
   day at wave 4/5 — if it persists, the next arm is downstream
   (what happens AFTER national), not the road.
7. **Wave-5 kills fell while facing rose (14 vs 23, facing 12/16
   vs 11/16).** Same pattern as the pilot (7 vs 11). The road
   delivers villages to the wave-5 door; the door itself is still
   the wall. Winnability work stays downstream.

## What stays open

- The findings-backlog item ("THE PILGRIMAGE STALLS ON FAR
  VILLAGES") is [fixed] on this CONFIRM GO (coordinator marks it
  in sim-findings.md; this arm does not edit the backlog).
- The covenant road is proven open at confirm scale (14/16
  staged, 16/16 beats 'pact' + sat, opinion-10 by median day
  8.5). The winnability gap is now downstream: national access
  without wins (0/16 both legs), wave-5 kills flat while facing
  rises.
- The seasoning gate (2-of-3 blocks on 100630, 100636) and the
  control leg's own staging (6/16) are the next questions — see
  metric review #2 and #3.
- Instrument items for the next run: walkRefusals BFS/greedy
  split (policy-side counters) and the 900-line cap (council
  lines cut on 4/14 staged seeds).

## Files changed (this arm)

- `scripts/onlylead-driver-20261115.js` — dirFor for
  RUN=courtship-reconfirm-b (evidence/2026-11-16 dirs). The 2330Z
  RUN=courtship-confirm-b mapping is untouched.
- `scripts/build-courtship-reconfirm-panels-20261116.js` — new
  panel builder, same construction as the confirm builder.
- `evidence/2026-11-16/sim-courtship-reconfirm-b-prereg.md` — frozen
  prereg (inherits the frozen gates verbatim + G3 baseline revision
  documented explicitly).
- `evidence/2026-11-16/perseed-courtship-reconfirm-b-control/` —
  16 per-seed JSONs (band 100621–100636, covenant leg).
- `evidence/2026-11-16/perseed-courtship-reconfirm-b-on/` — 16
  per-seed JSONs (band 100621–100636, courtship leg).
- `evidence/2026-11-16/courtship-reconfirm-b-analysis.json` —
  analyzer output.
- `evidence/2026-11-16/courtship-reconfirm-b-panel.*` — §15 panel
  + compare.
- `evidence/2026-11-16/sim-courtship-reconfirm-b.md` — this file.
- Zero `src/js`. Zero policy edits.

## Commit

Instrument + prereg committed as 04b45a930 (before any judged sim).
Corpora + analysis + panel + this evidence to be committed next, via
scripts/safe-commit.sh. No push, no version bump. Report: "committed,
ready for coordinator merge".
