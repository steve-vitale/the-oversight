# Competent-plus-ask pilot — run fleshout-20261104T0820Z, arm sim-askplus-a

Axis: scale-onramp / winnability chain. Tracker's named next blank #1
after Loop B 0730Z arm sim-diplo-b
(`evidence/2026-11-04/sim-diplo-b.md`): competent never proposes, so
diplomacy income is structurally zero under the baseline. This arm
adds the asking move to competent and judges whether diplomacy
standing then flows and holds. POLICY-SIDE ONLY: zero src/js
changes. No gate, price, deed, or win-price change. Judging rules
untouched.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-askplus-a-prereg.md` (commit
aff1a2202). In short:

- Policy: NEW `scripts/policies/competent-askplus.js`
  `{competentAskplus}` = competent.daily verbatim + askCourtship
  borrowed from leadcourt.js with ONE documented adaptation: it
  does NOT answer pendingNational / pendingGlobal (endgame choices,
  not the ask; competent does not answer them either, so baseline
  parity holds). Verbs, leadcourt values unchanged: answerCounter
  (pantry > 25,000 ? 'sweeten' : 'accept'), answerAccord ('gift'),
  defense answers (send if roster >= 5 else refuse), tendLink
  (Haven-primary links, weekly, pantry > 20,000), proposeLink from
  day 25 (no pendingCounter/pendingAccord/pendingNational,
  pantry > 12,000, < 3 Haven-primary subordinates, known +
  unlinked candidates, 1/day, 7-day cooldown,
  { asSubordinate: false, tributeKcalPerWeek: 4000 }).
- Seeds (BOTH legs, identical): 99501–99508, fresh (no evidence
  filename and no dated evidence .md uses them; diplo-b's 9930x
  band and 9940x context band not reused).
- Horizon 140 days, death-aware (+10d tail max).
- Instruments: `scripts/diplo-instrument-20261104.js` VERBATIM
  (diplo-b's file, not edited); new driver
  `scripts/diplo-driver-askplus-20261104.js` (POLICY
  competent|competent-askplus; out dir
  evidence/2026-11-04/perseed-askplus-a/); new analyzer extension
  `scripts/diplo-analyze-askplus-20261104.js` (adds maxDiplomacy,
  endDiplomacy, diploPositiveDays, regionalPlusDays, link shapes
  LEAD/BELONG/LEAGUE, tend/counter counts, strict say recount).
- PRIMARY METRIC + GO BAR (coordinator-set, judged strictly):
  pilot GO iff proposals attempted on >=6/8 seeds AND >=3/8 seeds
  form >=1 link AND diplomacy standing >0 on >=3/8 seeds at end
  of run (endDiplomacy = final snapshot's standing.diplomacy).
  Confirm (12–16 fresh seeds, bar scaled) only on GO. On failure:
  KILL cleanly — policy file deleted, registry entry reverted,
  no game-code trace, evidence records the kill.
- BALANCED PANEL (§15): pseudo-panels from the per-seed JSONs
  (diphold-arm pattern, `scripts/build-askplus-panels-20261104.js`,
  pseudo-policy 'askplus', paired seeds, before=competent,
  after=competent-askplus); compare .md attached below. The panel
  is the instrument; the prereg bar is the judge.

## Canon read (verified by this worker)

- docs/CANON.md read first. The manifest lists NO doc covering
  standing scoring — but docs/SCALE.md EXISTS in the tree
  (unlisted in the manifest) and covers the ladder, the polity
  definition (>=3 seasoned subordinates = a realm), and seasoning
  (30+ days AND trust 40+; links form at trust 30 — tending
  required). SCALE.md was read for ladder/polity rules. The
  standing formula (diplomacy = 34 x seasoned REGIONAL+ links) is
  in no canon doc found; it is code-read from src/js/standing.js
  and stated as code-read, not invented canon. This refines
  diplo-b's "no canon doc covers standing/deeds/scale" line: the
  ladder IS documented (SCALE.md), the scoring formula is not.

## Pilot results — per-seed tables

Proof `scripts/test-askplus-20261104.js` 41/41 BEFORE the legs
(39/39, then 41/41 after the counter-accepted classifier correction
below; the correction changed no judged sim, only summaries).
Instruments commit adca13f1. 0 instrument errors on all 16 seeds.

Columns: days, end, scale, maxW (runDays unlock, natural),
w5faced, ready5 days, proposals (outcomes), links (shapes), tend,
maxDiplo, endDiplo, diploDays, regional+ days.

### Baseline leg — competent, 99501–99508 (replicates diplo-b on a fresh band)

| seed | days | end | scale | maxW | w5 | props | links | maxDiplo | endDiplo |
|------|------|-----|-------|------|----|-------|-------|----------|----------|
| 99501 | 117 | lost | village | 4 | no | 0 | 0 | 0 | 0 |
| 99502 | 112 | lost | village | 4 | no | 0 | 0 | 0 | 0 |
| 99503 | 140 | survived | village | 4 | no | 0 | 0 | 0 | 0 |
| 99504 | 61 | lost | village | 4 | no | 0 | 0 | 0 | 0 |
| 99505 | 112 | lost | village | 4 | no | 0 | 0 | 0 | 0 |
| 99506 | 140 | survived | village | 4 | no | 0 | 0 | 0 | 0 |
| 99507 | 87 | lost | village | 4 | no | 0 | 0 | 0 | 0 |
| 99508 | 126 | lost | village | 4 | no | 0 | 0 | 0 | 0 |

Baseline pooled: proposals 0/8 seeds, links 0, diplomacy 0/8,
scaleRank village 8/8, wins 0/8, national 0/8, wave-4 unlock 8/8,
wave-5 unlock 0/8, survived 2/8, median survival 114.5 days
(sorted 61, 87, 112, 112, 117, 126, 140, 140).

### Arm leg — competent-askplus, 99501–99508 (judged)

| seed | days | end | scale | maxW | w5faced | ready5 | props | links | tend | maxDiplo | endDiplo | diploDays | reg+Days |
|------|------|-----|-------|------|---------|--------|-------|-------|------|----------|----------|-----------|----------|
| 99501 | 122 | lost | regional | 4 | no | 0 | 3 acc | 3 LEAD | 31 | 102 | 0 | 28 | 28 |
| 99502 | 43 | lost | village | 3 | no | 0 | 2 ctr-acc, 1 acc | 2 BELONG, 1 LEAD | 0 | 0 | 0 | 0 | 0 |
| 99503 | 95 | lost | regional | 3 | no | 0 | 3 acc | 3 LEAD | 32 | 102 | 0 | 5 | 5 |
| 99504 | 118 | lost | regional | 5 | yes | 39 | 3 acc | 3 LEAD | 11 | 102 | 0 | 19 | 19 |
| 99505 | 68 | lost | regional | 3 | no | 0 | 2 acc | 2 LEAD | 2 | 0 | 0 | 0 | 0 |
| 99506 | 140 | survived | regional | 4 | no | 0 | 3 acc | 3 LEAD | 51 | 102 | 102 | 56 | 56 |
| 99507 | 74 | lost | regional | 4 | no | 0 | 3 acc | 3 LEAD | 43 | 102 | 102 | 15 | 15 |
| 99508 | 53 | lost | regional | 3 | no | 0 | 3 acc | 3 LEAD | 10 | 0 | 0 | 0 | 0 |

Arm pooled: proposals 8/8 seeds (23 calls: 21 accepted, 2
counter-accepted, 0 declined, 0 refused, 0 countered-without-link);
links 8/8 seeds (23 links: 21 LEAD, 2 BELONG, 0 LEAGUE); seeds
reaching seasoned 5/8; seeds ever regional+ (diplomacy > 0) 5/8;
seeds with endDiplomacy > 0: 2/8 (99506, 99507); scaleRank
regional 6/8 (99502 stays village: links aged 15–17 days at death,
under the 21-day regional bar in SCALE.md); wins 0/8; national
0/8; wave-5 unlock 1/8 (99504); wave-5 faced 1/8 (99504);
survived 1/8; median survival 84.5 days (sorted 43, 53, 68, 74,
95, 118, 122, 140).

### Verdict against the bar — NO-GO (judged strictly, no re-scoring)

- Proposals >=6/8: 8/8 PASS.
- Links >=3/8 seeds: 8/8 PASS.
- End diplomacy >0 >=3/8: 2/8 FAIL.
- Verdict: NO-GO. The pilot is killed per the prereg (see "Kill"
  below). The miss is narrow and specific: asking works, linking
  works, diplomacy FLOWS (102 on 5/8 seeds) — it does not HOLD
  to end of run on enough seeds. The next question is holding
  (seasoning window + polity fragility), not asking.

## Finding 1 — asking works completely; the judge is not the constraint

23/23 proposals end in a link on this band, with zero declines
and zero knowledge/opinion refusals. First proposals land days
25–50 (99501 d50–52, 99502 d25–28, 99503 d28–38, 99504 d25–35,
99505 d38 + d55, 99506 d30–45, 99507 d25–30, 99508 d25–30).
Knowledge is NOT the delay: 99501 knows all three villages from
day 25, but its pantry sits at 1k–5.6k kcal until day 49 (11,840,
still under the 12,000 gate) and day 50 (14,720) — the pantry
gate, not knowledge, delays the first proposal by 25 days.
Same shape on 99505: the third proposal never comes because the
pantry falls to 6,923 by day 63 (under 12,000) and the village
dies day 68 with 2 links. Courtship is a food commitment, and
these villages run lean: proposal gate 12,000, tend gate
20,000, tribute 4,000/week/link. The pantry economics, not the
proposal verb, is now the visible throttle on the front end.

## Finding 2 — diplomacy flows, then falls: three distinct holding failures

- (a) Died before seasoning (99502, 99505, 99508): links aged
  15–17 days (99502), 30/13 days with trust stuck at 30
  (99505: only 2 tend calls — pantry almost never clears 20,000,
  so trust never lifts 30 → 40+), 28/27/23 days (99508: died 2
  days before the first link's 30-day season). No seasoned link
  can exist without surviving 30 days past formation with
  trust 40+.
- (b) Seasoned, then one link's trust crosses 40 downward and
  ALL diplomacy collapses in one day (99501): seasoned day 80,
  regional+ days 82–109 (28 days at 102), then day 110:
  village_0 trust 43 → 33 (below 40, unseasoned) AND the other
  two still-seasoned links simultaneously lose regionalPlus
  (True → False). Diplomacy 102 → 0 in a single day, and it
  never recovers (village_0 trust keeps sliding 33 → 16 by day
  122). This is the all-or-nothing polity filter at link level:
  _linkRegionalPlus requires the polity to hold 3 seasoned
  subordinates, so one link's trust dip zeroes the whole
  diplomacy income. Which event drained village_0's trust
  (steps of ~8–10: 53 → 51 → 43 → 33 → 23 → 16) is an open
  question for the polity-fragility arm — speaker-death (-8) is
  one candidate shape in code, but this arm does not attribute
  it.
- (c) Boundary flicker (99504, 99506): 99504's diplomacy
  toggles 102 ↔ 0 seven times (102 on days 65, 74–75, 82–95,
  99–100; seasoned count flickers 3 ↔ 2 ↔ 1) — a link hovering
  at the trust-40 boundary. 99506 holds 102 for 53 daily
  snapshots (days 75–127), drops days 128–138, recovers for
  the final snapshots to end at 102. Even the holding seeds flicker; the end-state bar
  is therefore partly a lottery over which day the village
  dies or the run ends. 99503 is the narrow-window variant:
  seasoned day 60, but regional+ only days 91–95 (5 days)
  before death day 95 — staggered formation (days 28/30/38)
  plus tend timing means all three links are seasoned
  simultaneously only at the very end.

## Finding 3 — the BELONG flip is real at panel scale (99502)

99502's first two proposals are counter-accepted: proposal day
25, counter answered, link day 26 as BELONG (primary village_0,
subordinate haven, trust 40 at formation — not the usual 30),
same for village_1 (day 26 → 27). The third proposal (day 28)
is a direct LEAD accept. So 1 of 8 seeds flips to BELONG shape
before death, and the flip carries a different starting trust
(40 vs 30). The diplo-b classifier hid this (it checked link
before counter, so counter-accepted read as plain accepted);
the askplus analyzer corrects it (counter-accepted outcome,
fixture-tested). Panel-scale arms MUST report LEAD vs BELONG
shape, not just link counts — diplo-b's warning, confirmed.
Sense note: 99502's transcript carries the BELONG consequence
in-world — "With Haven grieving, Emberhold installs their own
speaker at the table — but the bond is young, and they're
still deciding what Haven is. The new speaker wants to talk
before the tribute changes. Grief delays the verdict." The
subordinate position is narrated as lived politics, not a
label swap.

## Finding 4 — the band's only wave-5 unlock rides diplomacy (99504)

Baseline 99504: died day 61, wave 4, standing 160 at death.
Askplus 99504: lived to day 118, wave 5 unlocked, wave 5 faced,
39 readiness-5 days, final standing 265 (war 225, diplomacy 0,
plenty 40) — the diplomacy window (102 on days 65–100,
intermittent) plus war standing carried it over the wave-5 bar,
and the peak ratchet held the unlock after diplomacy fell to 0.
This is one seed, not a rate claim — but it is the first
wave-5 unlock on this band, and it arrived through the
diplomacy road the baseline never plays. Counterweight: the
panel (below) and paired survival both lean the other way on
average, so the wave-5 seed must not be cherry-picked into a
"asking helps" headline.

## Finding 5 — paired survival leans against asking (secondary, descriptive)

Paired survival deltas (askplus − baseline, days): 99501 +5,
99502 −69, 99503 −45, 99504 +57, 99505 −44, 99506 0, 99507 −13,
99508 −73. Median 114.5 → 84.5; survived 2/8 → 1/8. Death-cause
shape is unchanged (combat ~63% of deaths in both legs:
baseline 314/496, askplus 294/469; villages die fighting, not
starving, in both legs), but askplus villages die sooner on
5/8 seeds. The honest reading is variance + a plausible food
mechanism (tribute 4,000/week/link + tend grain out of a lean
pantry), NOT a proven causal claim: trajectories diverge
chaotically once policy changes, and n=8 cannot separate the
two. This is the investigation note the panel's
regression_watch flags point at, and a holding/fragility arm
should measure pantry trajectories alongside trust — if
courtship food cost is what kills the villages that would
otherwise season, the fix is economic, not diplomatic.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

Two transcript sources were read: (1) the per-seed say samples
from all 16 corpus files, (2) an unfiltered say-stream probe
(seed 99506, 50 days, every say/sysSay call recorded, no regex
filter — /tmp script, results quoted here).

- The proposal narration reads like people talking and is
  specific, not boilerplate: "⛓️ Diana brings it home: The
  Hungry Road bows to Haven — one organization, us primary.
  Tribute: 4,000 kcal/week. The relationship starts at trust
  30. Everything from here is earned." (x3, one per link,
  named representative, named village, exact tribute.) The
  third-link line is good design writing: "Three fires bow to
  Haven. But a realm isn't leverage — it's seasons. These
  bonds are young; tend them, keep the trust, and the court
  will come." The polity arrival line is the System voice at
  its best: "Four fires. One head. GOVERNANCE LAYER: online —
  polity tribute routing, the court calendar, famine
  reserves. You built a realm. Try not to lose it the way you
  found it." (99501 d101, 99503 d91, 99504 d82, 99506 d81 —
  each on the first regional+ day or just after.)
- INSTRUMENT FINDING (this arm's sense-test catch): the diplo
  SAY_RE regex does NOT match the core link-formation lines —
  "bows", "brings it home", and "Tribute:" are all absent from
  its pattern — so the corpus say samples contain ZERO ⛓️
  lines even though the lines fire on every link (probe:
  4/4 expected lines on 99506's first 50 days). The strict
  recount in the askplus analyzer inherits that blind spot
  (it can only recount the already-filtered sample); its
  numbers (2–5 strict lines per seed, mostly "Word will
  travel" opinion lines and internal "proposed relief" journal
  lines) must NOT be read as "no diplomacy dialogue." The
  dialogue exists and is good; the capture regex is what is
  blind. Future diplo instruments must add bows|brings it
  home|tribute to the say pattern. (Diplo-b's leadcourt
  "transcript comes alive" claim presumably came from the
  same filtered sample plus the polity lines; the ⛓️ lines
  were never in its sample either.)
- No robotic, static, or repeated diplomacy dialogue was found
  in what IS captured: opinion lines vary by deed ("clean
  hands" +2 vs "turned away the hungry" −4), grief-speaker
  lines track the BELONG position, and the polity line fires
  once per realm, not daily. The diplomacy story under
  askplus is told; under competent it is untold because it
  is unplayed (diplo-b's finding, replicated here on a fresh
  band: baseline say samples contain no proposal, bond, or
  polity lines at all).

## Wall numbers (judged leg + paired baseline)

Wins 0/8 both legs. National / table: 0/8 both legs (scaleRank
never passes regional). Wave-5 unlocks: baseline 0/8, askplus
1/8 (99504). Wave-5 faced: askplus 1/8. Wave-4 faced (final
snapshot): baseline 7/8 (unlock 8/8), askplus 4/8. Readiness-5-ready
days: 39 (99504 askplus only), 0 elsewhere. Median survival:
baseline 114.5d, askplus 84.5d. Max survival 140d both legs.
Death totals: baseline 496, askplus 469 over fewer days
(895 vs 713 game-days). Arc reach: not instrumented by this
arm (stated, not faked). Vest/national reach: national 0/8.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-04/askplus-panel.md` (+ .json, .json.gz pair):
decision review_required (8 paired cases). National 0 → 0
(no_material_signal); wins 0 → 0 (descriptive); survival60
1.0 → 0.75 (regression_watch, delta −0.25, CI [−0.625, 0]);
villageDeaths/100d 58.1 → 69.5 (regression_watch, +11.4, CI
[−6.2, 24.7]); communityLost 0.75 → 0.875 (regression_watch,
+0.125, CI [0, 0.375]); villageDeaths/run 62 → 58.6
(no_material_signal). Per §15 this does NOT override the
prereg verdict (already NO-GO on the primary bar); the
regression_watch flags are investigation notes consistent
with Finding 5 (paired survival leans against asking) and
are reported as such, not as a second verdict. Panel
limitation (stated in the prereg): the pseudo-panel covers
only contract metrics mappable from diplo JSONs (won,
national, survival30/60, communityLost, villageDeaths);
playerDeaths, gear, luck, and NPC metrics are null, never
faked.

## Metric review (§14 — no in-run re-scoring)

- The bar was judged exactly as written: NO-GO on
  endDiplomacy 2/8 < 3/8. No metric moved. Two doubts are
  recorded for the NEXT run, not applied here:
  (1) End-state diplomacy is a lottery over the death/ending
  day when polity standing flickers (99504 toggles 7 times;
  99506 drops days 128–138 then recovers): a holding metric
  (e.g. "diplomacy > 0 on >= X days" or "held >= 14
  consecutive days") would measure holding more stably than
  a single end snapshot. Under "ever held 102" the pilot
  reads 5/8 — but that revision is NOT applied retroactively.
  (2) The proposal/link legs of the bar are now saturated
  (8/8, 8/8) and no longer discriminate; a confirm bar
  should judge holding and survival cost, not asking.
- Instrument corrections made in-run (before evidence, after
  proof v1): the counter-accepted classifier fix (Finding 3)
  — BASE classifyProposal hid counter-accepted links as
  plain accepts; the askplus analyzer now recomputes outcomes
  from event rows (answerCounter within 2 days + link in
  window → counter-accepted). Proof re-run 41/41. No judged
  sim was re-run; summaries were recomputed from the same
  committed per-seed JSONs.
- Instrument limitations carried forward: (1) SAY_RE misses
  the ⛓️ link lines (see Sense-testing) — future instruments
  must widen the pattern; (2) the opinion ledger is not
  per-event instrumented (diplo-b's limitation, unchanged);
  (3) the driver cannot re-run the arm leg after the kill
  (policy file deleted; restore from git history, see Kill).

## Kill (prereg rule, executed)

Pilot NO-GO → KILL cleanly, in a separate commit after the
evidence commit: `scripts/policies/competent-askplus.js`
DELETED, `scripts/test-askplus-20261104.js` DELETED (it
requires the policy), and the POLICY_REGISTRY['competent-askplus']
entry in `scripts/sweep-compare.js` REVERTED. Zero src/js
changes were ever made, so there is no game-code trace to
revert. The measurement record survives: prereg, this
evidence, the 16 per-seed JSONs, the panel files, the driver,
and the analyzer extension all remain committed. Restore
pointer for any follow-up arm that wants the policy back:
commit adca13f1 (instruments + proof 39/39) holds the policy
file verbatim; the kill commit deletes it from the tip only.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — competent-plus-ask pilot
  NO-GO on holding: proposals 8/8 seeds, links 8/8 seeds,
  diplomacy flows to 102 on 5/8 seeds, but end-diplomacy >0
  on only 2/8 (this run's evidence). Next arm is a HOLDING
  arm, not another asking arm.
- [open] 2026-11-04 — diplomacy — polity standing is
  all-or-nothing at the link level: one link's trust
  crossing 40 downward zeroes all diplomacy in a day
  (99501 d110: 102 → 0, never recovers) and boundary
  flicker toggles diplomacy repeatedly (99504: 7 toggles)
  (this run's evidence; sibling polity-fragility arm owns
  the deep dive).
- [open] 2026-11-04 — diplomacy — courtship is pantry-gated
  at every step: proposal gate 12,000 kcal delays asking
  (99501: known day 25, first proposal day 50), tend gate
  20,000 kcal blocks seasoning (99505: 2 tends, trust stuck
  at 30), tribute 4,000/week/link drains lean villages
  (paired survival 114.5d → 84.5d, mechanism unproven)
  (this run's evidence).
- [open] 2026-11-04 — diplomacy — counter-accepted LEAD
  proposals flip to BELONG shape with starting trust 40
  (99502: 2 of 3 links); arms must report LEAD vs BELONG
  shape (this run's evidence).
- [open] 2026-11-04 — instruments — diplo SAY_RE misses the
  core link-formation narration ("bows", "brings it home",
  "Tribute:"); corpus say samples contain zero ⛓️ lines
  though the lines fire on every link (probe-verified)
  (this run's evidence).

## Proof and landing

- Proof: `scripts/test-askplus-20261104.js` — 41/41 PASS
  (policy gating incl. day/pantry/cooldown/subs-cap,
  national/global non-answers, tend/counter behavior, shape
  classifier, counter-accepted correction, diplomacy series,
  GO-bar judge semantics, strict recount, live harness smoke
  seed 12345: 2 days, snapshot shape, 0 instrument errors).
  Proof file deleted in the kill commit (it requires the
  killed policy); the 41/41 result stands in this evidence.
- Arm commits on branch sim-askplus-a (coordinator merges
  via --ff-only; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by this
  worker):
  - aff1a2202 sim-askplus-a prereg (before any judged sim)
  - adca13f1 sim-askplus-a instruments + proof 39/39
    (zero src/js)
  - (this landing) sim-askplus-a pilot + evidence + panel
    (zero src/js)
  - (kill) sim-askplus-a KILL per prereg (policy + proof
    deleted, registry reverted; evidence + per-seed JSONs kept)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-askplus-a*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-askplus-a/` (16 files: 8
  baseline + 8 arm); panel files
  `evidence/2026-11-04/askplus-panel{-before,-after}.json.gz`,
  `askplus-panel.{json,md}`; scripts
  `diplo-driver-askplus-20261104.js`,
  `diplo-analyze-askplus-20261104.js`,
  `build-askplus-panels-20261104.js` (kept);
  `policies/competent-askplus.js` + `test-askplus-20261104.js`
  (deleted in kill commit; recoverable from adca13f1).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after both commits
  (prereg + instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status` empty
  + `git diff HEAD` empty. The commits themselves were
  always correct.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence).
- Heartbeats: registry `sim-askplus-a` heartbeated through
  the run (last verified 2026-11-04T08:39:25Z; later
  heartbeat calls queued behind sibling registry-lock
  contention — see report).
