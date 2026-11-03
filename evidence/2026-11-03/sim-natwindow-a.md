# sim-natwindow-a — ARM 4: protecting the national window (JUDGED)

## Plain-words finding
A village builds its three subordinate bonds in about a month, those
bonds need a month to count as seasoned, and the realm then has to
wait until it has been regional for a full season before the court
can even be offered. That wait is roughly two to three weeks after
the bonds first count. During that wait the bonds are fragile —
exactly three are needed, with no spare — and they bleed trust
faster than anything rebuilds it. The measured bot made it worse
two ways: it stopped tending bonds whenever the pantry fell below
20,000 kcal (which is most of the lean middle game), and it never
stood down a hungry titan muster, so a sounded muster bled −2
trust per linked fire per day for weeks. The fix is a policy leg
that plays the window the way a competent human can with verbs
that already exist: tend every bond weekly while the pantry can
spare three days of food, and stand down a hungry muster before
it drags a bond under the bar. No game rules changed — no prices,
no gates, no thresholds.

## Judged batch (prereg: evidence/2026-11-03/natwindow-prereg-20261103.md)
- Anchor: worktree branch win-national at 6fb93c5c4 (master at
  judged time; game code identical to the 81cb0cc4a pilot anchor
  — the two commits between them touch only evidence and a new
  sortieretry policy file, no src/ and no stack policy).
- Seeds: the 12 npcdeadfilter-clean seeds
  97330, 97331, 97332, 97333, 97334, 97335, 97336, 97338, 97339,
  97340, 97341, 97342. Horizon 180 days, death-aware.
- Arms, identical seeds, same probe harness, same 7 env gates
  (FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT, WINDEFER, SEATDRIVE,
  FULLSEAT, HERALD): baseline = closecommit stack
  (leadfeast + windefer + seatdrive + fullseat-diag + titanroute
  + musterclose + mustergap); variant = closecommit + natwindow.
- Instrument: scripts/natprobe-driver-20261103.js (daily
  link/polity/scale snapshots, reads only; never
  villageStandingTotal, _otherVillage, titanCallReadiness, or
  any roster generator). Corpus:
  evidence/2026-11-03/perseed-natwindow-a/ (24 JSONs).
- Analyzer: scripts/natwindow-analyze-20261103.js (reproduces
  the verdict from the corpus alone). Proof test:
  scripts/test-natwindow-a.js (decision-rule constants +
  perception-law source audit, ALL PASS).

## Results (before → after, identical seeds)

| Seed | Baseline national | Variant national | Baseline won | Variant won |
|---|---|---|---|---|
| 97330 | never | day 78 | yes | yes |
| 97331 | day 77 | day 77 | no | no |
| 97332 | never | never | no | no |
| 97333 | never | never | no | no |
| 97334 | never | never | no | no |
| 97335 | day 81 | day 81 | yes | yes |
| 97336 | never | never | no | no |
| 97338 | day 79 | day 79 | yes | yes |
| 97339 | never | day 77 | no | no |
| 97340 | never | never | no | no |
| 97341 | never | never | no | no |
| 97342 | never | day 77 | yes | yes |

- National-ever: baseline 3/12 → variant 6/12 (delta +3).
- Won: baseline 4/12 → variant 4/12 (no regression; every
  baseline win still wins, every baseline national still
  reaches national).
- Median survival: baseline 90 days → variant 87 days
  (guardrail: ≥ 0.8 × 90 = 72, PASS).
- Mechanism: baseline polity died before the regional-season
  gate on 2 seeds (97339, 97342); variant held a polity to the
  gate on 2 of 2.
- ALL SIX PREREG BARS PASS. Analyzer verdict: GO.

## What the leg does (scripts/policies/natwindow.js, policy only)
- TEND: while national is not live and Haven holds ≥ 2 primary
  links, tend every primary link with trust < 50 once a week
  when pantry-days ≥ 3. 50 = seasoned bar 40 + 10 margin. Real
  1,500 kcal/link/week, credited to the subordinate's pantry
  too, so they pay tribute more reliably.
- STAND DOWN (v2): while a herald muster stands hungry (own
  pack < blades × 1,000 kcal), national is not live, no beat is
  pending, the regional-season gate has not passed, ≥ 2 subs
  are seasoned or the polity qualifies, the muster is ≥ 3 days
  old, and the weakest primary link is below 55, stand the
  muster down (one −5/link, upkeep stops). The 55 bar matters:
  the −5 must leave the weakest link ≥ 40; v1 waited until
  < 45 on seasoned links only and stood down AFTER the polity
  had died on 97342. titanroute sounds once per run, so this
  abandons the titan road for the run — taken only when the
  pre-national window is at stake. After national is live the
  leg is idle.
- PERCEPTION LAW: reads only own links, own pantry/pack, own
  muster, own scale flags. No roster, world-monster, or
  titan-call-readiness reads. No RNG consumed. Zero src/js
  changes, so the gating freeze is untouched.

## What did NOT flip, and why it is not the leg failing
- 97333: variant seasons all three links (polity day 58;
  baseline never seasoned even one) but the village dies day
  73, three days before gate day 76. Tending fixed the trust
  problem; survival is the next wall on this seed.
- 97341: third subordinate arrives day 80 (baseline day 73),
  max seasoned 2 (baseline 1); no polity before death day
  115. Late link formation, not trust decay.
- 97332, 97334, 97336, 97340: village dies (days 34–66)
  before any link forms. Censored, not a national mechanism.
- 97338 variant ends at regional, not global (baseline
  global): tending shifts pantry/RNG downstream, so the
  post-national trajectory diverges; national day 79 and the
  win are preserved in both arms.

## Infrastructure notes (for the next arm)
- The container EPERM write flap hit this batch twice: once
  writing a per-seed JSON to evidence/ (left a 0-byte file),
  once writing to /tmp. Recovery that worked: re-run the
  missing seeds, delete the 0-byte file first (a file created
  during a flap keeps refusing writes — fresh creation
  succeeds), copy into the corpus with a retry loop.
- Registry heartbeats did not land for over an hour
  (REGISTRY.lock held by sibling activity); the tree stayed
  alive via its running batch process and fresh corpus files.
  Heartbeat_at stuck at 2026-11-03T14:14:33Z during the batch.

## What this landing is, and what it is not
- It IS a landed policy-stack fix: the measured bot now plays
  the national window competently, doubling national-ever on
  identical seeds with no win regression and no rule changes.
- It is NOT a game-code change and NOT player-facing guidance:
  a human player still has to discover tending and standing
  down on their own. Surfacing that lesson in play (and, per
  the 2026-11-03 intelligence direction, giving villagers
  themselves these drives through perception) is follow-up
  work for the intelligence track, not this arm.
- If the gate-sequencing question ever reopens (a polity must
  survive a 16–21 day wait; staging remembers nothing), that
  is a Steve decision — this arm changed no gate to get here.

## Rebase check (post-landing, NOT part of the prereg verdict)
Master moved twice during this arm (ARM 1 ally-join 3688fa9bf,
ARM 2 field-fight damage d8f334da8 — both touch src/js), so the
leg was re-verified on the rebased anchor d8f334da8 with a
targeted 5-seed subset (flip seeds 97330/97339/97342, control
97338, partial 97333), baseline vs variant, same harness/gates.
Corpus: evidence/2026-11-03/perseed-natwindow-rebase-a/.

| Seed | Base national | Variant national | Base won | Variant won |
|---|---|---|---|---|
| 97330 | never (died day 57, no links) | never (same) | no | no |
| 97333 | never | never | yes | yes |
| 97338 | never (died day 132) | never (won day 93; max seasoned 1→2) | no | yes |
| 97339 | never (max seasoned 2, died day 83) | day 77 | no | yes |
| 97342 | never (polity died pre-gate) | day 77 (global at death day 80) | yes | no |

- New-base subset: baseline national 0/5 → variant 2/5.
  Both mechanism seeds (97339, 97342) flip again on the new
  base; the leg's mechanism survives the sibling src landings.
- Seed trajectories do NOT transfer across src landings
  (97330/97338 baselines changed completely), so the judged
  12-seed numbers above belong to anchor 6fb93c5c4 and must
  not be quoted as current-master rates. The claim that
  transfers is the mechanism: tending + standing down holds
  polities to the gate on the seeds where the polity forms.
- 97342 variant trades a lesser win for national-then-global
  before dying day 80: national gained, win lost on this seed.
  Net wins on the subset still rise (2/5 → 3/5).
