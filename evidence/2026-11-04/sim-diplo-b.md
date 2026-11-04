# Diplomacy-pipeline pilot diag — Loop B, run fleshout-loop-b-20261104T0730Z, arm sim-diplo-b

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: scripts +
instruments + evidence, ZERO src/js changes. This arm is the
named next blank from the standacc pilot (branch sim-standacc-b,
evidence/2026-11-04/sim-standacc-b.md, read via git show — that
branch is NOT checked out here and is NOT landed by this worker):
competent villages formed ZERO inter-village links in 140 days.
Gates and win prices stay UNTOUCHED: this arm measures, it does
not retune any door. One named lever candidate for the NEXT run
is proposed at the end, never implemented here.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-diplo-b-prereg.md` (commit
40f063fa4). In short:

- Question: why do competent villages form ZERO inter-village
  links in 140 days? Decompose the pipeline S0–S8: villages
  exist / known / opinion >= 10 / village-tile travel or codex
  study / proposal attempted / proposal judged / link formed /
  seasoned / regional+.
- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
  default env. Seeds 99301–99308 (fresh: no evidence filename
  and no dated evidence .md uses any 99301–99308 seed; the
  standacc band 99101–99108 is NOT reused).
- Horizon 140 days, death-aware (dead villages stop; +10d tail
  max as implemented by runDays). WHY 140: the standacc class
  (its median survival 107d) plus the proposal window (day
  25+) plus a full 30-day seasoning window for any link
  formed before day 110.
- Instrument: daily snapshots of otherVillages (known, opinion,
  coords), scholar tile vs village tiles, travelTo calls and
  landings, propose*/study/tend/answer calls with returns,
  pendingCounter/Accord/National state, hierarchy links via
  the game's own reads, standing breakdown + capped, scale
  rank, peak, death events, diplomacy say-line sample. The
  snapshot NEVER calls villageStandingTotal() or unlockedWave();
  ONE end-of-run unlockedWave() call is reported separately
  and never counted as a natural door-open.
- PRIMARY METRIC + GO BAR: per-seed pipeline attribution
  (furthest stage S0–S8 with stall counts). DIAG-GO iff ONE
  named stall stage accounts for the zero-link outcome on at
  least 6 of 8 judged seeds (same furthest stage). Otherwise
  DIAG-NO-CANDIDATE. INSUFFICIENT-DATA only if > 2 seeds
  carry instrument errors or zero otherVillages at day 1.
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic, no
  before/after change; no comparison is fabricated and none
  is attached. Stated explicitly, not omitted silently.
- CONTEXT LEGS (diagnostic only, NOT judged, NOT pooled):
  (c1) leadcourt on fresh seeds 99401–99404, 140d — does the
  pipeline move when a policy actually proposes? (c2)
  competent on fresh seeds 99405–99408, 180d cap — does a
  longer horizon alone move it? Freshness: no evidence
  filename and no dated evidence .md uses any 99401–99408
  seed (the single 9940 substring hit in the tree is commit
  hash 48994088e, not a seed).
- HARD LIMITS (binding, honored): no gate/price/deed change;
  no wild-router, field-fight, national-standing, or
  veteran-counting code; no food-economy code; no propose
  verb added to competent (that would be a lever, not a
  diag). DIAG ONLY.

## Pipeline rule, as found in code (current anchor)

From `src/js/hierarchy.js` and `src/js/membership.js` (read,
not assumed; NO canon doc covers standing/deeds/scale
directly — stated in the prereg instead of inventing canon):

- A link is formed ONLY by a played proposal verb:
  proposeLink (primary/subordinate), proposeCovenant /
  proposeTrade (peer links), while proposeAlliance is an
  understanding sealed with a feast — NOT a link. In game
  code the ONLY callers of the propose verbs are app.js UI
  buttons (DOM, excluded from the node harness); no engine
  path auto-forms a link and no villager-agency path
  proposes. A sim policy proposes only if the policy file
  itself calls the verb (leadcourt, fourthlink, belongseek,
  killroad do; competent does NOT — a grep of competent.js
  finds zero propose / knowsVillage / otherVillages
  references). The leadcourt header states this as design:
  plain competent "contains zero scale code by design (it
  stays pinned as the scale-free baseline)".
- proposeLink / peer proposals are knowledge-gated
  (knowsVillage: a lore entry, a generated village, or a
  delivered village rumor). Peer proposals additionally
  require opinion 10+ before the binding is even proposed.
- judgeLink: base 38 + representative standing/2 (cap 20) +
  opinion/2 + ally 15 + stronger/subordinate terms +
  tribute generosity + R()*20-10. Score >= 55 accepts;
  35-54 counters (played: accept / sweeten / walk away);
  < 35 declines (cold re-ask -5; decline banks
  courtshipDeclined, climb verbs land +1 harder 28d).
- Courtship verbs that move opinion: studying a village's
  codex (+3, once), deeds the region hears (+2 per contest
  win), time (+1/week toward 0 for unlinked villages).
  Joining a village is LEAVING Haven, not a climb verb.
- A formed link counts toward standing ONLY when seasoned
  (30+ days AND trust 40+; conquered links need the season,
  not the trust) AND regional+ (LEAD / BELONG / LEAGUE
  polity participation). Standing diplomacy = 34 x seasoned
  REGIONAL+ links. Travel to a village tile is NOT a
  proposal prerequisite in code (knowledge can come from a
  rumor or generation) — travel is instrumented as its own
  stage because the climb's named verb ("walk to their fire
  and sit with their book") requires being there.

## Anchor

Anchor: c400ae3e0cc1 (instruments commit; the anchorCommit
field on all 16 per-seed JSONs). Standacc's numbers are a
PREVIOUS anchor and are NOT pooled with this arm's numbers
and NOT cited as this arm's baseline. Any comparison to
standacc below is descriptive, anchor-move-aware, never a
before/after claim.

## Judged leg — per-seed table

Proof `scripts/test-diplo-20261104.js` 23/23 before the leg
(17 fixture tests + live harness smoke; see metric review
for the one instrument correction made during proof —
none: the proof passed first run, no in-proof fix was
needed). Instruments commit c400ae3e0. 0 instrument errors
on all 8 judged seeds. Columns: days, end, scale, maxWave,
ovMax (most villages ever listed), knownEver, bestOpinion,
op10 (villages ever at opinion >= 10), tileDays (days the
scholar's day-end tile was a village tile), codex studies,
travelTo calls, proposals, links formed, furthest stage,
final capped standing, ready days, wave-4 faced.

| seed | days | end | scale | maxW | ovMax | known | bestOp | op10 | tileD | codex | travel | props | links | furthest | cappedEnd | ready | w4 |
|------|------|-----|-------|------|-------|-------|--------|------|-------|-------|--------|-------|-------|----------|-----------|-------|----|
| 99301 | 60 | lost | village | 4 | 6 | 5 | 16 | 2 | 0 | 0 | 206 | 0 | 0 | S2 | 150 | 0 | yes |
| 99302 | 93 | lost | village | 4 | 6 | 5 | 10 | 1 | 0 | 0 | 341 | 0 | 0 | S2 | 150 | 0 | yes |
| 99303 | 58 | lost | village | 3 | 5 | 5 | 8 | 0 | 0 | 0 | 198 | 0 | 0 | S1 | 75 | 0 | no |
| 99304 | 111 | lost | village | 4 | 8 | 8 | 28 | 8 | 0 | 0 | 251 | 0 | 0 | S2 | 210 | 0 | yes |
| 99305 | 22 | lost | village | 2 | 3 | 3 | 4 | 0 | 0 | 0 | 57 | 0 | 0 | S1 | 0 | 0 | no |
| 99306 | 31 | lost | village | 3 | 5 | 3 | 6 | 0 | 0 | 0 | 148 | 0 | 0 | S1 | 0 | 0 | no |
| 99307 | 48 | lost | village | 3 | 5 | 3 | 4 | 0 | 0 | 0 | 170 | 0 | 0 | S1 | 25 | 0 | no |
| 99308 | 123 | lost | village | 4 | 5 | 5 | 40 | 4 | 0 | 0 | 433 | 0 | 0 | S2 | 125 | 0 | yes |

Pooled judged leg: proposals 0/8 seeds, 0 calls total.
Links formed 0. Village-tile days 0/8. Codex studies 0/8.
Alliance proposals 0/8. Known villages 3–8 per seed;
opinion >= 10 reached on 4/8 seeds; opinion moved (nonzero)
on 8/8 seeds. Furthest stage: S2 on 4 seeds, S1 on 4 seeds.
Judge: majority 4/8 < 6/8, so the verdict is
DIAG-NO-CANDIDATE by the letter of the prereg (see metric
review for why the furthest-stage split understates the
finding, and what the corrected bar would say).

## Finding 1 — the pipeline never reaches a proposal verb (8/8)

The zero is at S4, and it is a policy-design zero, not a
game-engine stall. Competent contains no propose call, no
knowsVillage read, and no otherVillages reference anywhere
in its 3,727 lines — so under competent the proposal verbs
are never invoked by anyone: not the player policy, not the
engine, not villager agency. The upstream stages all move:
villages exist (3–4 at day 1, up to 8 with splinters),
villages become known (first-known days 4–45, via rumor /
lore — day-1 villages are NOT known yet; the known flag
and opinion both start null/unknown and switch on over
the first weeks, first opinion readings days 16–36),
opinion climbs from its starting 2 (generated
villages) via broadcast deeds — the captured "Word will
travel: Haven is clean hands (Opinion +2 with every village
that knows you)" lines are instances of the mechanism, and
opinion reaches 10+ on 4 seeds (best 40, seed 99308) and
moves on all 8. Nothing downstream of S4 is ever tested by
competent play, because S4 never fires. The trust
threshold, the seasoning window, and the polity filter are
all unreached, not failed — there is no link for them to
pass or fail.

## Finding 2 — travel is neither the blocker nor the path (8/8 judged, confirmed by context)

Competent travels constantly (57–433 travelTo calls per
seed) but never to a village tile: destinations are the
haven cross and nearby forage tiles (e.g. 99304: only
(4,3)/(3,4)/(4,4)/(5,4) plus two (4,2)/(4,5) calls; village
tiles sit at (2,6)/(7,5)/(0,6)/(0,3) and are never
destinations). Village tiles are simply not in competent's
travel-target set, and no competent day ends on one.
Crucially, travel is NOT on the critical path for LEAD
proposals: the leadcourt context leg proposes and forms
links with 0 village-tile days and 0 codex studies on all
4 seeds (knowledge comes from rumor/lore, which the
propose gate accepts). And travel presence alone does not
trigger anything: the long-horizon context seed 99405
stands on village tiles on days 50–52 (8 travel landings
on village_2's (7,4) tile, village_0's (6,0), and a
splinter's (6,8) — a forage route passing through) and
still proposes nothing and studies no codex. So "villages
never travel to other villages" is true but not the
binding cause: even with travel, competent would propose
nothing, and even without travel, a proposing policy
forms links. The binding zero is the missing verb call
at S4, full stop.

## Finding 3 — context: when a policy DOES propose, the pipeline works end to end (c1, not judged)

Leadcourt (competent + LEAD courtship: propose as primary
from day 25 when pantry > 12,000 kcal, tend weekly, answer
counters) on 99401–99404, 140d:

| seed | days | end | scale | maxW | props | outcomes | links | seasoned max | regional+ days | maxDiplo | cappedEnd | peak |
|------|------|-----|-------|------|-------|----------|-------|--------------|----------------|-----------|-----------|------|
| 99401 | 98 | lost | regional | 4 | 3 | 2 accept, 1 counter→link | 3 | 3 (d57) | 0 | 0 | 135 | 4 |
| 99402 | 140 | survived | regional | 5 | 3 | 3 accept | 3 | 3 | 29 (d60–88) | 102 | 200 | 5 |
| 99403 | 118 | lost | regional | 4 | 3 | 3 accept | 3 | 3 | 60 (d57–116) | 102 | 190 | 4 |
| 99404 | 76 | lost | regional | 4 | 3 | 3 accept | 3 | 2 | 0 | 0 | 125 | 4 |

- 12 proposals, 12 links: 11 direct accepts plus 1
  counter-accept. The counter case (99401, village_1) is
  the played negotiation working as designed — leadcourt
  answers the counter, and the resulting link FLIPS Haven
  into subordinate (primary village_1, subordinate haven):
  a BELONG link, not the LEAD link proposed. One of twelve
  proposals ends in the other road's shape; the counter
  path is real, not decorative.
- Links form at trust 30 on days 25–47 and season on
  schedule: first seasoned readings at days 55–57 for
  day-25–27 links (the 30-day season, once tending lifts
  trust 30 → 40+). Seasoning is not the stall.
- Regional+ is ALL-OR-NOTHING at three seasoned
  subordinates at once: it appears only while all three
  links are seasoned simultaneously (99402 d60–88, 99403
  d57–116, paying the full 102 = 3 x 34 diplomacy), and
  vanishes the day the seasoned count drops below 3
  (99402 d89: 3→2 seasoned, regional+ 3→0; 99403 d117:
  3→1, regional+ 3→0). Diplomacy standing is therefore
  transient: 99402 ends with diplomacy 0 (its polity
  dissolved on d89) and still peaks wave 5 on war alone
  (end standing: war 200, diplomacy 0, plenty 0).
- Scale rank moves with links even before regional+:
  all 4 leadcourt seeds read `regional` (vs `village` on
  all 8 judged seeds), while national stays 0/4. Regional
  rank is not the polity filter and not national.
- The one wave-5 unlock in all 16 diplo seeds is 99402
  (leadcourt, peak 5, capped 200, maxWave 5, survived to
  140). It is a context-leg observation, not a judged
  claim, and it arrived via war standing, not via
  diplomacy standing at end-state.

## Finding 4 — context: a longer horizon alone changes nothing (c2, not judged)

Competent on 99405–99408, 180d cap, death-aware: all 4
villages lost before the cap (37, 67, 78, 84 days),
proposals 0/4, links 0/4, furthest S3/S2/S2/S1. The 99405
village-tile days (Finding 2) are the only S3 in any
competent seed, and they change nothing. Time does not
supply the missing verb. (Note: no competent village in
either leg survived to 180; the horizon question is
answered by death, not by the cap.)

## Wall numbers (judged leg, not wall movement)

Wins 0/8. Villages lost 8/8, survived to horizon 0/8.
National / table: 0/8 (scaleRank village throughout).
Readiness-5-ready days 0. Wave-5 unlocks 0/8, wave-5 faced
0/8, wave-4 faced 4/8, wave-4 unlocks (peak 4) 4/8. Wave
reach (by maxWave): wave 4 on 4 seeds, wave 3 on 3 seeds,
wave 2 on 1 seed (99305). Arc reach: not instrumented by this arm
(stated, not faked). Median survival 59 days (sorted 22,
31, 48, 58, 60, 93, 111, 123), max 123. Death causes over
343 villager deaths: villager combat 167, combat 44,
expedition 44, the wild 37, monster 21, a wound that
wouldn't close 8, sickness 7, starvation 5, the arena 3,
ambush 2, Sweeps Week 1, Hushpuppy 1, lockjaw 1, Rut King 1,
Bulldozer 1. Combat accounts for 211/343 deaths (62%) —
villages die fighting, not starving, on this band.
All-leg death total (16 seeds) is 889, same shape.

NOTE on the judged band's survival: median 59d here vs
standacc's 107d on the 9910x band. Different seed band AND
different anchor (c400ae3e0cc1 vs standacc's b4abf8bab) —
this is a descriptive band difference, not a before/after
claim and not a regression claim. No competent village on
this band lived long enough for a second seasoning window
to matter, which only sharpens Finding 1: the missing
verb, not time, is the gap.

NOTE on peak readings: 99303/99305/99306/99307 end with
peak 0 in the final snapshot because _standingPeakWave reads
the ratchet at day-end after village loss; their maxWave
(unlockedWave via the harness) reads 3/2/3/3. Peak and
maxWave are different reads and are reported as such, not
reconciled by hand.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

The silence is the sense finding. Under competent, the
diplomacy transcript is EMPTY of diplomacy: a strict
recount of the say-line sample (patterns: "Word will
travel", "don't know them well enough", propose, covenant,
trade league, decline, "They're watching") finds ZERO
proposal, decline, covenant, or counter lines on all 8
judged seeds — only 0–3 "Word will travel" opinion lines
per seed and internal-village "proposed relief" journal
lines (a villager proposing relief inside Haven, not
diplomacy at all). Villagers talk about the audience
watching, learn counters, and narrate keepsake bonds; no
one ever talks about another village as a partner, a
rival, or a courtship target, because no one ever acts
toward one. The world outside the fences exists in the
ledger (opinions move, rumors arrive) but never in the
village's voice — the diplomacy story is untold because
it is unplayed, not because it is mis-narrated.

On the leadcourt context leg the transcript comes alive
in the expected register (proposals, the d26 counter on
99401, tending) — the narration machinery is fine; it
simply has nothing to narrate under competent. No
robotic, static, or repeated diplomacy dialogue was found
because no diplomacy dialogue occurs under competent at
all; that absence is the finding, not a narration bug.

CAPTURE NOISE (instrument note, not a game finding): the
instrument's SAY_RE over-catches "counter" (COUNTER
LEARNED lines) and "bond" (keepsake bond lines) — the
same class as standacc's keepsake flood. The sense
numbers above use the STRICT recount (proposal/covenant/
decline/counter-negotiation patterns + "Word will travel"),
not the raw sample; a future instrument should match on
the FIRST words of a line, not any word, and should
exclude COUNTER LEARNED / keepsake-bond lines by shape.

## Village assessment (plain words)

Picture eight villages playing competently for three
weeks to four months each. All eight die; none survives
to the horizon, none reaches regional rank, none ever
stands ready for wave 5. They know their neighbors —
rumors arrive, names become known in the first weeks,
and the region's opinion of Haven climbs as deeds are
heard about, into the teens and once to 40 — but nobody
ever does anything about it. Nobody walks to another
village's fire with a purpose, nobody studies another
village's book, nobody ever asks another village for
anything. The diplomacy half of the standing ledger is
blank in every village for the simplest possible reason:
the competent way of playing contains no move that asks.
It is not that the villages try and fail, or that trust
is too hard, or that alliances take too long to ripen —
nothing is ever attempted, so nothing can stall. Give the
same villages a policy that actually asks (leadcourt),
and the whole road works the same month: three proposals,
three bonds, bonds ripening in thirty days, a regional
rank, and on one seed the fifth wave itself unlocked.
The villages don't lack friends. They lack the act of
asking — and the asking, when it happens, is immediately
answered.

## Metric review (§14 — no in-run re-scoring)

- The prereg's DIAG-GO legs were judged exactly as
  written; no metric moved. The verdict is
  DIAG-NO-CANDIDATE because the furthest-stage majority
  is 4/8 (S2) + 4/8 (S1), below the 6/8 bar. BUT the bar
  as written splits on opinion noise while the binding
  fact is uniform: S3 (travel/codex) is reached on 0/8
  judged seeds and S4 (proposal) on 0/8 — the FIRST
  all-zero stage is S3/S4 on 8/8, and the two furthest
  labels (S1 vs S2) differ only in whether broadcast
  opinion happened to cross 10 before death. Judging by
  furthest stage penalizes the pilot for opinion variation
  that has nothing to do with the stall.
- Proposed revision for the NEXT run (not applied here):
  judge the pipeline by its FIRST ALL-ZERO stage (the
  earliest stage no seed reaches), not by the furthest
  stage each seed reaches. Under that revision this pilot
  reads DIAG-GO with stall = S4 (no proposal verb ever
  fires; S3 travel is shown by the context legs to be
  off the critical path for LEAD proposals). The two
  questions — "how far does each village get" and "where
  does the pipeline first go uniformly to zero" — must
  not share one denominator again.
- Instrument corrections: none needed in-run. The proof
  (23/23) passed on its first run, including the live
  harness smoke (snapshot shape, refused proposeLink
  recorded without throwing, zero instrument errors over
  a 2-day run). Two instrument limitations are recorded
  for the next run, not fixed here: (1) the opinion
  ledger is not per-event instrumented — the instrument
  proves opinion moves and crosses 10, but the exact
  per-event sources (which broadcast deeds, how much
  each) are not itemized; (2) the say-line sample
  over-catches COUNTER LEARNED / keepsake-bond lines
  (see capture noise above).
- The "S3 travel" stage as defined (day-end tile OR codex
  study) undercounts mid-day travel: the judged leg's
  tileDays are day-end snapshots, while the travel-call
  log (which caught 99405's mid-day village-tile
  crossings) is the complete measure. The evidence above
  reports BOTH; the travel-call log is the authority for
  the S3 claim, and it confirms S3 = 0 on 8/8 judged
  seeds (99405's crossings are a context leg, not the
  judged leg).

## Verdict — DIAG-NO-CANDIDATE (per the prereg bar, with the named cause stated)

Furthest-stage majority 4/8 (< 6/8 required); proposals
0 on 8/8 judged seeds and 0 on 4/4 long-horizon context
seeds; links 0 on 12/12 competent seeds; links 12/12 on
the 4 proposing-policy context seeds. The named cause is
S4: the proposal verb never fires under competent play
(by policy design — competent contains zero scale code),
and no engine or villager path proposes in its place.
Travel (S3) is exonerated as the binding cause: it is
also 0/8, but the context legs prove links form without
it and presence on a village tile without a proposal
changes nothing. Seasoning, trust, and the polity filter
are unreached, not failed — except in the context legs,
where seasoning works on schedule and the polity filter
is shown to be all-or-nothing at three seasoned links
at once (diplomacy 102 while all three hold, 0 the day
one drops).

## Next blank, precisely (no fix in this run)

The next arm is a COMPETENT-PLUS-ASK arm, not a
standing-price arm: give the competent baseline a
proposing move (or measure the existing proposing
policies at panel scale) and judge whether diplomacy
standing then flows and holds — because this pilot
proves the road works when asked, and proves the
baseline never asks. Two sub-questions ride with it,
both named here, neither answered here: (a) polity
fragility — diplomacy standing falls from 102 to 0 the
day one of three seasoned links drops below seasoned, so
a holding arm must measure whether tending keeps three
links seasoned simultaneously over a full season, or
whether the all-or-nothing threshold itself is the next
stall; (b) the BELONG flip — 1 of 12 context proposals
ended as a subordinate link via counter-accept, so a
panel-scale proposing arm must report LEAD vs BELONG
shape, not just link counts. NO gate/price/deed arm
follows from this evidence: standing clears 200 on
standacc's seeds and on leadcourt's 99402 via war, and
the missing income is a missing verb, not a missing
price. The veteran-kill narration divergence (wave-3
kills celebrated as "veteran kills") stays in the
findings backlog from standacc; it is not re-litigated
here.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — competent policy never
  proposes, travels to, or studies another village, so
  diplomacy income is structurally zero under the
  baseline policy (this run's evidence).
- [open] 2026-11-04 — diplomacy — LEAD polity regional+
  standing is all-or-nothing at three seasoned links at
  once: 102 diplomacy while all three hold, 0 the day
  one drops below seasoned (99402 d89, 99403 d117)
  (this run's context leg).
- [open] 2026-11-04 — diplomacy — a counter-accepted
  LEAD proposal can flip Haven into subordinate (BELONG
  link, 99401 village_1); panel-scale proposing arms
  must report LEAD vs BELONG shape, not just counts
  (this run's context leg).
- [open] 2026-11-04 — instruments — diplo say-line
  sample over-catches COUNTER LEARNED and keepsake-bond
  lines; future instruments should match on first words
  and exclude those shapes (this run's capture note).

## Proof and landing

- Proof: `scripts/test-diplo-20261104.js` — 23/23 PASS
  (stage attribution S0-none/S0–S8, proposal-outcome
  classifier incl. accepted/countered/refused/late-link
  cases, judgeGo majority/scattered/insufficient
  semantics, live harness smoke: snapshot shape, ovs
  non-empty, refused proposeLink recorded without
  throwing, 0 instrument errors).
- Arm commits on branch sim-diplo-b (coordinator merges
  via --ff-only; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by this
  worker):
  - 40f063fa4 sim-diplo-b prereg (before any judged sim)
  - c400ae3e0 sim-diplo-b instruments + proof 23/23
    (zero src/js)
  - (this landing) sim-diplo-b pilot + context legs +
    evidence (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-diplo-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-diplo-b/` (16 files:
  8 judged diplo + 4 leadcourt context + 4 long-horizon
  context); scripts `diplo-instrument-20261104.js`,
  `diplo-driver-20261104.js`, `diplo-analyze-20261104.js`,
  `test-diplo-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after both commits
  (prereg + instruments); repaired each time via
  HEAD-blob `update-index --cacheinfo` and verified
  `git status` empty + `git diff HEAD` empty. The commits
  themselves were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence).
- Heartbeats: worktree heartbeated per the coordinator's
  addition (registry `sim-diplo-b` alive through the run).
