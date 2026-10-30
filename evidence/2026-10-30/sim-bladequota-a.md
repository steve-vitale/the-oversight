# sim-bladequota-a — muster blade-quota reachability in the wild

Run fleshout-20261030T1924Z, Loop A, axis scale-onramp. MEASUREMENT ONLY —
no game-code change; the gating freeze (Steve 2026-10-27/28) stands.
Base: branch sim-bladequota-a, HEAD c1b310c96, identical in every corpus
file's manifest. Fresh seed band 76101–76116, registered on this base.

Pre-registration: evidence/2026-10-30/sim-bladequota-a-prereg.md (frozen
before any judged sim). Post-pilot addendum (leadcourt leg + rationale
correction): evidence/2026-10-30/sim-bladequota-a-addendum.md (written
after the pilot, before confirm spend — the prereg itself was not edited).

## Verdict: DIAG-NO-GO (per the frozen header) — with a fully identified decomposition

The prereg's DIAG-GO rule required >= 12/16 classifiable seeds AND one
binding constraint holding a strict majority of shortfall seeds. The
competent headline scores 0/16 classifiable, so the header's verdict is
DIAG-NO-GO. That NO-GO is about the header's certification rule, not
about whether the question got answered: every shortfall seed in both
legs has an identified binding mechanism (below), and the
offerable-and-reached rate is 0/24 across both legs. Do not cite this
arm as "quota proven reachable" or "quota proven broken" — cite the
decomposition.

## Formula verified against code on this base (titans.js + titans.json)

- Herald gate: 10 blades (minAllies 10).
- Per-link quota: 6 if trust >= 70 AND opinion >= 10, else 2.
- Refusal: trust < 25 OR opinion < -10 OR arrears > 0 → 0 blades, trust −8.
- Free faces: living adults on the allied roster, excluding people already
  committed to a live muster. Yield per link = min(quota, free faces).
- Haven's own (separate button, never auto-committed): up to 3 villagers,
  counted toward the gate.
- Buttons offered ONLY when the Herald omen is stage >= 2 (located).
  soundTitanCall itself does not check omen stage, so hypothetical yields
  are computable on any state — reported separately from offerability.
- In the wild no policy or game system ever presses either button, so
  every wild run has zero real musters. All yields below are hypothetical
  sounded-call yields from a pure-read replica of the formula.

## Instrument proof (scripts/test-bladequota-formula.js — PASS)

- Phase A (fixture, deterministic): four fabricated links covering every
  branch — trusted 6, base 2, refused 0, free-face-capped 1 — analytic
  snapshot vs the REAL Game.soundTitanCall on the same state: exact match
  per link (6+2+0+1 = 9), snapshot idempotent, link trusts unchanged by
  reading. PASS.
- Phase B (live state, seed 76101): INCONCLUSIVE — no linked state exists
  in 200 days on that seed, so no live comparison was possible. Phase A
  proves fidelity on the real functions; Phase B's inconclusiveness is
  itself the competent-leg finding (see below).
- The faces=0 mechanism was verified on an identical trajectory
  (scripts/bladequota-verify-generated.js, leadcourt seed 76102): re-run
  reproduces peak allied 6 @ day 55 and final allied 6 exactly, and on
  that trajectory Emberhold and Thornfield show generated=false and
  rosterSize 0 on EVERY linked day, while Stonebridge shows generated=true,
  roster 9, 7 alive adults, 7 faces every day. PASS.

## Headline: competent leg (scale-free baseline), 16 seeds 76101–76116

Sounded-call yield >= 10 rate: allied-only 0/16, allied+Haven 0/16.
Median peak allied 0, median peak total 3 (Haven-only, capped at 3),
median peak links 0. Classifiable 0/16. Counterfactuals reach 10 on 0/16
(allTrusted 0, noRefusals 0, noCap 0, allFixed 0 — with zero links, no
single-factor fix helps).

Per-seed shape (all 16 identical in structure): 0 active links on every
simulated day, 0 Herald omens, rank village throughout. Peak "day 2" on
these runs is NOT meaningful — it is the first day attaining the flat max
of 0 (see Metric review).

Wall numbers (competent 16): won 0/16, national-ever 0/16,
national-final 0/16, table-waiting 0/16, table-entered 0/16, wave 4
unlocked 10/16, wave 5 unlocked 1/16 (seed 76111 — still rank village, so
still no omen: the omen needs wave 4 AND regional+). Ends: survived to
the 200d cap 10, village-lost 6. Median survival 200 actual days
(cap-affected: 10/16 hit the cap). Deaths 728; largest causes: combat 303,
villager combat 180, the wild 78, expedition 43, monster 34.

Correction (from the addendum, stated plainly): competent is NOT an
upper bound on link formation. It contains zero scale code by design
(leadcourt.js documents this) and never calls proposeLink. This leg
measures the no-courtship baseline: a village that never courts links
has no coalition to call, on any seed.

## Extension leg: leadcourt (competent + LEAD-road courtship), 8 seeds 76101–76108

Peak sounded-call yield >= 10 rate: allied-only 2/8, allied+Haven 2/8.
Median peak allied 6, median peak total 8, median peak links 3.
Classifiable 7/8. Shortfall seeds 6, with NO strict-majority constraint
(LINK-COUNT 3/6 = 50%) — the shortfall is a stack of different bindings,
not one lever.

Per-seed decomposition (peak day; offerable window = days with omen
stage >= 2, the only days the call could actually be pressed):

| seed | peak allied/total | peak class | omen stage 2 | offerable-window max allied/total | end |
|------|-------------------|------------|--------------|------------------------------------|-----|
| 76101 | 6/8 @112 | REFUSALS | day 135 | 6/9 (47 days) | lost 181, global |
| 76102 | 6/8 @55 | FREE-FACES | day 102 | 6/9 (44 days) | lost 146, national |
| 76103 | 6/9 @50 | FREE-FACES | day 85 | 6/9 (30 days) | lost 115, global |
| 76104 | 18/21 @77 | REACHED | never (0@193, 1@200) | none (0 days) | survived 201, global |
| 76105 | 12/14 @56 | REACHED | never (0@97) | none (0 days) | lost 102, global |
| 76106 | 4/5 @74 | LINK-COUNT (2 links) | day 120 | 4/7 (35 days) | lost 155, global |
| 76107 | 0/3 @2 | LINK-COUNT (0 links) | never | none | lost 44, village |
| 76108 | 0/3 (flat) | LINK-COUNT at peak day* | never (0@135, 1@139) | none | lost 145, national |

\* 76108's peak-day class is a flat-0 artifact: by final day it held 3
trusted links (trust 81–82, opinion 46–50, quota 6 each) with 0 faces on
all three → 0 allied on every day. Its end-state mechanism is FREE-FACES,
not link count.

Offerable-and-reached: 0/8. The two quota-reached seeds (76104, 76105)
were NEVER offerable — their omens arrived too late (stage 1 at day 200;
stage 0 at day 97 with the village dead at day 102). The four offerable
seeds max out at 6 allied / 9 total in the window — never 10.

The three mechanisms, with receipts:

1. ARREARS REFUSALS (76101 peak): all three links at trusted level
   (trust 70–99, opinion 34–56, quota 6 each), but Emberhold (arrears
   4,000) and Thornfield (arrears 10,771) refuse; only Stonebridge
   answers with 6. No-refusals counterfactual = 12 ≥ 10. A trust-99
   village still sends nobody while its tribute is behind. The
   transcript narrates the arrears ("Hunger isn't defiance, but the
   ledger doesn't know the difference") but never connects them to a
   muster refusal — because the call is never sounded.
2. FREE FACES = UNVISITED VILLAGES (76102, 76103, 76108): links with
   quota 2 or 6 but 0 free faces. Verified mechanism: a village's roster
   is generated ONLY when the player approaches (catchUpSim →
   genVillageRoster; genVillages creates stubs with population but no
   roster, generated=false). A linked-but-never-visited village has no
   roster, so titanAlliedFaces returns 0 faces whatever its trust.
   76102's no-cap counterfactual = 10 exactly — faces are the margin.
   76103 has two links at trust exactly 70 with opinion 9 and 8 (< 10),
   so they sit at quota 2 on the opinion gate as well — but with 0 faces
   the opinion point is moot on those links.
3. OMEN GATING / TIMING (76104, 76105, 76108): quota-ready coalitions
   (18 and 12 allied) that never get the button. The omen lottery needs
   wave 4 + regional+ first (10%/day to start, then day-gated 35%/40%
   advances) — on 76104 it started on day 193 of a 201-day run. A village
   can also die before the omen matures (76105: omen stage 0 day 97,
   village lost day 102).

Wall numbers (leadcourt 8): won 0/8, national-ever 7/8, national-final
7/8, table-waiting 2/8 (seeds 76103, 76106), table-entered 0/8, wave 4
7/8, wave 5 0/8. Ends: village-lost 7, survived 1. Median survival 145.5
actual days. Deaths 307.

## What it would take (for a typical national-reaching village)

Arithmetic from the formula, confirmed by the leadcourt leg:
- At base quota 2: 5 links allied-only; 4 links + a full 3-blade Haven
  commit. Leadcourt caps at 3 links, so base-quota play can never reach
  10 with Haven (3×2+3 = 9) — 76102/76103's 6–9 band is the ceiling there.
- At trusted quota 6: 2 trusted links suffice allied-only (12); 1
  trusted + 1 base + Haven 3 = 11 also works. 1 trusted + Haven 3 = 9,
  still short.
- Trust magnitude is NOT the wall: median sub-70 trust gap on leadcourt
  peaks is 11, median opinion gap 6 — small. The binding requirements,
  in order, are: (1) have links at all; (2) VISIT them (rostered faces);
  (3) keep tribute current (arrears veto trusted links); (4) be alive
  AND omen-located at the same time. Trust growth alone fixes none of
  the four observed failures except through the trusted-quota step, and
  even that needs (2) and (3) first.

## What the village looked like (plain words)

On the no-courtship baseline, villages live and die as single fires:
they reach wave 4 monsters, they never join anything, and the Herald —
if it ever came — would find no coalition behind them. Nothing in their
days mentions other villages as allies, because there are none.

On the courting road, villages become small realms: three fires bow to
Haven ("one organization, us primary... Everything from here is
earned"), tribute flows, trust climbs into the 80s and 90s, and the
realm reaches national and even global standing. But the coalition is
thinner than its trust numbers suggest. Two of the three allied villages
are names on a ledger, not places anyone has walked to — their people
don't exist yet in the game's eyes, so they can send no one. The third
village, the one actually visited, carries the whole muster on its own
(6 blades, every time). And when tribute falls behind — because a
village's fields came up empty, not because it defied anyone — even a
trusted ally's door stays shut. Twice the realm was fully ready on paper
(18 and 12 blades) and still couldn't march, because the sky's warning
came months too late: one village outlived its omen, the other died
waiting for it.

## Sense-testing (transcript, leadcourt seed 76101, on-trajectory)

Re-run with say/sysSay captured: peak 6 @ day 112 and final 2 match the
silent sweep exactly (onTrajectory=true, 15,456 captured lines), so the
transcript is the same run, not a lookalike.
- The omen arc IS narrated and reads well: "Scouts come back pale. The
  sky looks wrong...", "Then: the Herald...", "Scouts found its lair —
  tile 7,4. THE HERALD... It is WAITING. You cannot face it alone. Sound
  the call."
- Then the fiction goes silent on the muster: zero "THE CALL GOES OUT",
  zero answers, zero refusals, zero war councils — because no policy
  presses the buttons. Instead the unanswered titan escalates: "THE
  HERALD struck Thornfield in the night. They bled while the coalition
  talked. (trust −5 — they notice who wasn't there.)" and "THE HERALD
  fed in the night — 1,635 kcal gone... It is eating the realm while you
  deliberate."
- Judgment: the dread fiction is coherent, but the 10-blade arithmetic
  never appears in it. No line says "we need 10 blades", "Emberhold
  can't spare anyone", or "arrears keep them home". A village with few
  links being asked for 10 blades does not read as sensible or
  nonsensical in fiction — it reads as ABSENT. The player is told to
  sound a call whose cost and count are visible only in the camp-bar
  button hint, never in anything any villager says. That absence is the
  sense finding: the muster is a UI gate before it is a story beat.
  (Note: one "MUSTER" line in the transcript is a defensive shelter
  alert, not the titan call — do not confuse them.)

## Metric review (applies to the NEXT run, never re-scores this one)

1. Peak-day classification is degenerate for flat-0 runs: peak day is
   the earliest day attaining the max, so a 0-allied run's "peak day 2"
   class (LINK-COUNT) mislabels seeds like 76108, whose end state is a
   free-faces failure. Next run: classify at peak day AND final day AND
   first-stage-2 day; make offerable-window max a headline metric
   alongside peak.
2. The prereg's "competent is an upper-ish bound" rationale was wrong
   (see addendum). Next run: leadcourt or equivalent scale-playing
   policy is the primary policy for muster questions; competent is the
   no-courtship control, not the ceiling.
3. The snapshot did not record generated/rosterSize per link, so the
   faces=0 mechanism needed a separate re-run to verify. Next run:
   record generated + rosterSize in the snapshot (cheap pure reads).
4. Haven pool at a single day understates Haven availability (away /
   engaged timing swings it 0–8). Next run: report haven pool as
   max-over-window as well as at peak day.
5. Single-policy-leg DIAG thresholds don't fit a two-leg design: the
   competent leg's 0/16 classifiable correctly NO-GOs its own headline,
   but the extension leg's content is decisive without meeting the same
   clause. Next run: pre-register per-leg verdict rules when a leg is
   added, rather than stretching one rule across legs.

## Limitations (stated, not hidden)

- Single base (c1b310c96); no game-code lever, so per §15 there is NO
  balanced-panel comparison file — the competent-vs-leadcourt contrast
  is a POLICY contrast on identical seeds, not a panel result.
- Policies are bots: no human player pressed the buttons either, so
  "offerable" means the button would be shown, not that a player would
  press it. A human who visits allies, pays arrears, and waits for the
  omen could beat these numbers; the sims show what the game's own
  competent/courting play produces, not the human ceiling.
- Haven pool replication was not separately proven against the real
  titanCommitOwn (only the allied yield was); total-yield numbers
  (allied+Haven) carry that caveat. Allied numbers are proven exactly.
- The task's grounded context (a 75123 day-84 refused state yielding 2
  blades vs need 10) was used as background only and is NOT quoted as
  this run's data; every number above is from seeds 76101–76116 on this
  base. Sibling Loop B worktrees/branches were not read, rebased, or
  merged; any convergence with other measurements is corroboration,
  not shared corpus.

## Files (all in this worktree; ready for coordinator merge, pending ship)

- evidence/2026-10-30/sim-bladequota-a-prereg.md — frozen pre-registration
- evidence/2026-10-30/sim-bladequota-a-addendum.md — post-pilot extension record
- evidence/2026-10-30/sim-bladequota-a.md — this file
- evidence/2026-10-30/sim-bladequota-a-analysis.json — competent 16 analysis
- evidence/2026-10-30/sim-bladequota-a-leadcourt-analysis.json — leadcourt 8 analysis
- evidence/2026-10-30/sim-bladequota-a-transcript-leadcourt-76101.json — sense transcript (on-trajectory)
- evidence/2026-10-30/perseed-bladequota-a/ — competent per-seed JSONs (16)
- evidence/2026-10-30/perseed-bladequota-a-leadcourt/ — leadcourt per-seed JSONs (8)
- scripts/bladequota-snapshot.js — pure-read yield replica + classifier
- scripts/bladequota-sweep.js — seed sweep (competent/leadcourt, death-aware)
- scripts/test-bladequota-formula.js — replica proof (Phase A PASS)
- scripts/analyze-bladequota-a.js — band aggregator
- scripts/bladequota-window.js — offerable-window analysis
- scripts/bladequota-transcript.js — sense transcript runner
- scripts/bladequota-verify-generated.js — generated/roster verification

Measurement only, nothing game-changing to merge — the coordinator
should land evidence + instrument scripts only. No [needs-eyes]: no
game feel/combat/UI changed. Do NOT push, bump, or verify live.
