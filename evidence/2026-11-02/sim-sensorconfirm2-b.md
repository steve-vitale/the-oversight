# sim-sensorconfirm2-b — INSUFFICIENT-DATA AGAIN: A 56-SEED FRESH BAND YIELDS ONLY 1 COLLAPSING SEED, SO THE RETRY CANNOT JUDGE EITHER — AND THE PRIOR BAND'S COST PARITY WAS A FLUKE, NOT A PROPERTY

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0330Z,
arm sim-sensorconfirm2-b, axis food-economy. Worktree
sim-sensorconfirm2-b, branch sim-sensorconfirm2-b. Base at spawn:
a63ffc8c9712079dc2bd4462c9ea65c1d57e86e1.
MEASUREMENT ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing script or policy file. New files only, all named
*-sensorconfirm2-b.*. The gatecover tracer, the gatediseng analyzer, and
the competent policy are REUSED VERBATIM, never edited. This worker
does NOT push, bump, verify live, merge, or rebase — the coordinator
lands the branch. This confirm does NOT deploy (e*).
Status to coordinator: PARTIALLY COMMITTED — prereg (5d9763884) and
tools (310efc3c6) are committed on branch sim-sensorconfirm2-b, but
the corpus + evidence commit is BLOCKED (see COMMIT BLOCKED note at
end of this file): all git writes on this container currently fail
with EPERM, including safe-commit.sh, loose-object writes, and ref
updates, in every repo tested. The five corpus/evidence files below
are written and intact in the worktree, uncommitted. DO NOT merge
expecting the corpus commit — re-run the recovery safe-commit command
in the COMMIT BLOCKED note once git writes recover, verify with
`git show --stat HEAD`, and only then merge.

## Verdict: INSUFFICIENT-DATA — judged exactly against the prereg bars

Prereg: evidence/2026-11-02/sim-sensorconfirm2-b-prereg.md, commit
5d9763884340bd336aec330c93d406fc5c8a89cd, written and committed BEFORE
any judged sim (proof test 15/15 ran after the prereg commit but before
any judged application; the proof test is pure, uses no judged seeds,
and changes no prereg word; the reused proof tests were also re-run
green on current base before the confirm: gatediseng 21/21,
gatediseng-confirm 11/11; tools commit 310efc3c67566509631825d8f646f79604e1aeee).

The count gate is the verdict, for the second run in a row. The fixed
fresh band 81001-81056 (56 seeds) produced only 1 collapsing seed
against a prereg bar of >= 4, while survivors cleared their bar
(54 >= 12). Per the prereg, that is INSUFFICIENT-DATA — bars are not
lowered and no extra seeds were screened to fill the count. The band
was screened in full (56/56 legs, first try, rows == daysAlive on
every seed) and judged on the full band; nothing was cherry-picked.

| leg | result | bar | outcome |
|---|---|---|---|
| Count gate: collapsing seeds | 1 | >= 4 | FAIL -> INSUFFICIENT-DATA |
| Count gate: survivors | 54 | >= 12 | PASS |
| Fire: (e*) fires on collapsing seeds | 1/1 | ALL | PASS (on n = 1, not a confirm) |
| Tie: lead_e >= lead_c | 1/1 | ALL | PASS (on n = 1) |
| Strict: lead_e > lead_c | 1/1 | >= 50% | PASS (on n = 1) |
| Lead-one: lead_e >= 1 | 1/1 | >= 75% | PASS (on n = 1) |
| Cost: (e*) fires on survivors | 6/54 = 11.1% | <= 25% | PASS |
| Cross-check: thin (c) vs reused (c), first firing | 0 mismatches on 56/56 | Any mismatch = INSUFFICIENT-DATA | PASS |
| Tracer verification | rows == daysAlive on 56/56, first try | Failure = INSUFFICIENT-DATA | PASS |
| Determinism spot-check | 3/3 byte-identical re-runs (81001, 81002, 81003) | Report match/mismatch | PASS |

INSUFFICIENT-DATA means, per the prereg: the shape neither advances nor
fails on this evidence. The single collapsing seed is consistent with
the pilot and the first confirm (fires, beats (c), lead 2, no
death-knell firing), but one seed cannot carry a confirm verdict, and
this file does not pretend otherwise. Two fresh confirms in a row have
now failed the count gate (2/24, then 1/56) — the lesson is no longer
"the band was too small" but "starvation collapse in 30d competent is
rare on fresh bands at this base" (see metric review). A third confirm
on the same recipe would be re-proving the same scarcity; what the
shape needs is a different collapsing supply (see metric review (1)).

## Q — THE CONFIRM, SEED BY SEED (56 seeds, 30d competent, fresh)

Reference day = first starvation death day. Lead = reference day -
firing day. No-fire counts as worse than any firing for lead-vs-(c).

Collapsing seed (1):

| seed | end | ref | (c) firing | lead_c | (e*) firing | clause | lead_e | beats (c)? |
|---|---|---|---|---|---|---|---|---|
| 81053 | lost day 30 | 26 | 26 | 0 | 24 | E1-envelope | 2 | YES (+2) |

How the shape earns the seed, in one line: stand-down day 21 at 7,300,
falls days 22 and 24 around a day-23 bounce to 7,050 (5,900 -> 7,050 ->
5,199) — E1 fires day 24 (2 cumulative falls, 5,199 <= 0.90 * 7,300 =
6,570), two evenings before the first starvation death, while (c)
waits for its third consecutive fall and fires day 26 itself — the
death-knell evening (lead_c 0). The day-23 bounce is exactly the
bounce immunity the pilot claimed, observed on a second fresh band.

BOUNDARY CASE, stated not hidden: 81053 is village-lost with
daysAlive 30 — it starved on days 26, 29, and 30 and was lost ON the
horizon day, not before it. The prereg's collapsing parenthetical says
daysAlive < 30, while the carried thin analyzer (same instrument as
the first confirm) counts any village-lost seed with a starvation
death as collapsing. This file reports the analyzer's count (1) as the
headline and the strict-reading count (0) alongside — the verdict is
INSUFFICIENT-DATA under either reading, so no re-scoring turns on the
boundary. The NEXT prereg must define lost-on-day-30 explicitly
(metric review (3)).

Other outcome (1): 81042, lost day 26 with NO starvation death
(combat losses throughout; pantry 521 on day 26, streak 1) — neither
collapsing nor survivor, counts toward neither denominator. Both rules
fire on it ((c) day 24, (e*) day 26 E2-cliff), but it is not a judged
seed for any collapsing leg.

Survivors with an (e*) firing (cost leg, 6/54 = 11.1%):

| seed | (e*) firing | clause | (c) firing |
|---|---|---|---|
| 81001 | 29 | E1-envelope (stand-down 27 at 5,260, pantry 4,239) | — |
| 81009 | 21 | E2-cliff (stand-down 18 at 12,294, pantry 7,820) | 21 |
| 81027 | 20 | E1-envelope (stand-down 13 at 19,125, peak 21,500, pantry 18,180) | — |
| 81030 | 30 | E2-cliff (stand-down 25 at 11,819, peak 12,334, pantry 5,600) | — |
| 81034 | 24 | E1-envelope (stand-down 20 at 24,457, pantry 17,650) | 24 |
| 81051 | 8 | E1-envelope (stand-down 6 at 20,500, pantry 16,385) | — |

Survivors with a (c)-only firing (secondary): 81005 (day 8), 81055
(day 8). (c) survivor rate: 4/54 = 7.4%.

SECONDARY, per the prior run's metric review — the survivor overlap:
(e*) fires on 6 survivors, (c) on 4, overlap only 2 (81009, 81034).
The prior band's identical firing sets were a FLUKE, not a property:
on this band (e*) speaks on 4 survivors (c) never speaks on, and (c)
speaks on 2 survivors (e*) never speaks on. Cost still passes
(11.1% vs 7.4%), but the sets are genuinely different — the looser
2-fall trigger and the stricter 3-consecutive rule diverge in both
directions on fresh villages, as their shapes predict. No parity claim
survives this band.

All other seeds (46 survivors): both rules silent. No other seed was
lost before 30d.

Secondary (reported, NOT judged): collapsing seeds with lead_e == 0:
0/1 (no death-knell firing for (e*) — though (c)'s own firing on 81053
IS a death-knell, lead_c 0). Mean lead_e on collapsing seeds: 2.0
(n = 1); mean lead_c: 0.0 (n = 1) — reported only for completeness;
with n = 1 the pairwise legs are the comparison, per the pilot's
metric review (2). Three survivors starved without collapsing (81009:
3 starvation deaths, 81011: 1, 81034: 1 — all survived 30d), unlike the
first confirm band where no survivor starved; starvation deaths alone
do not make a collapsing seed, village loss does.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this confirm carries no such fields. NO wall
movement is claimed. In-window, confirm band: 54/56 survived 30 days
(median daysAlive 30, max 30; 55/56 reached day 30 including the
day-30 loss); collapses 1/56 starvation-class plus 1/56 other loss (a
band property, not a rate claim — the band was fixed before screening,
not chosen for its collapse count); wave reach max 3 (40/56 reach wave
3, 56/56 reach wave 2); waves 4-5 not reached in 30 days (expected —
early window). Arc II/III/IV, regional -> national, table, win flag:
NOT REACHED IN WINDOW (0, as expected — not a rate claim). National /
table / wins: 0 in-window (stated, not a comparison).
Deaths across the band: 1,241 total — villager combat 865, combat 131,
expedition 99, the wild 42, monster 32, ambush 17, sickness 14, a wound
that wouldn't close 13, starvation 8, contest 4, thirst 3, and 11
singletons. The 8 starvation deaths split across 4 seeds (81053: days
26, 29, 30; 81009: 3; 81011: 1; 81034: 1) — only 81053's village was
lost, so only it counts as collapsing.

## Sense test (SENSE-TESTING LAW: (e*) firing evening, fresh lines)

81053, day 24 (E1 firing, pantry 5,199, peak 7,300, streak 5): the
evening's own words are hunger and strain, not a pantry ledger —
"Hunger gnaws. The pack is thin — work the green, haul it back, get it
named at camp. That's the whole game." beside "You wake with a start —
something is wrong." and the leadership challenge, "Why are YOU giving
orders?" Katarina doesn't raise their voice. That's worse. A warning
on day 24 would land two evenings before anyone starves, on an evening
whose own voice already says the pack is thin and something is wrong —
it reads as the village noticing in time, but thinner than the first
confirm's thin-pack lines: no line that evening names the store itself.
And the sense fit carries an honest cut against it: on days 24-26 the
player's own lines say "You are full enough." and "You eat Canned soup
(250 kcal)." while villagers starve — the warning must be framed as
the village store falling, never as the speaker's own hunger, or the
player's full belly will make it read false. (c)'s day-26 firing, by
contrast, lands the same evening as the first starvation death — a
death-knell, not a warning — which is the timeliness gap (e*) exists
to close, and on this seed it closes it by two evenings.
Villagers act like people in the surrounding transcript (sampled, not
just counted): the leadership challenge that mutates across the
evening, a story corrected mid-sentence ("back when I was a teacher...
then corrects to something else mid-sentence. The correction is worse
than the slip."), riders bringing word that Haven is called the Feared
elsewhere. The collapse evenings are not robotic — they are hungry and
fractious in ways that match the pantry slide, and the (e*) warning
would echo a voice already speaking, if framed as the store's fall.

## Balanced panel (section 15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the pilot and the first confirm): this
arm changes NO game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire overlays on
identical evening series), not panel metrics. The tables above are
reported directly in the evidence file instead, on identical seeds and
identical trajectories.

## Metric review

(1) THE COUNT GATE FAILED TWICE, AND THE DIAGNOSIS CHANGED. The first
    confirm's review said "the band was too small" and ordered 48-64
    seeds. This retry ran 56 — and got FEWER collapsing seeds (1 vs
    2). The 56-seed band's collapse rate is 1/56 = 1.8% (analyzer
    count; 0% on the strict <30d reading), against 2/24 = 8.3% on the
    first band and the pilot's constructed 4/8. Fresh-band starvation
    collapse in 30d competent is simply rare at this base — a bigger
    fixed band is not the fix; a third confirm on the same recipe
    would most likely fail the gate a third time. What the shape
    needs is a collapsing SUPPLY fixed in the next prereg before
    judging: e.g. a pre-screening rule (screen N fresh seeds, judge
    the first K collapsing + matched survivors, with the screen rate
    reported honestly), or a harder policy/window that actually
    starves villages (with the policy change declared as a scope
    change, not smuggled in). Screening-until-4 inside a run whose
    prereg forbids it remains barred — the supply rule must be fixed
    BEFORE judging, as this prereg fixed the band.
(2) THE LEGS THAT COULD BE CHECKED PASSED AGAIN, AND THAT IS STILL
    NOT A CONFIRM. Across two fresh confirms: fire 3/3, tie 3/3,
    strict 3/3, lead >= 1 3/3, cost 10/76 survivors = 13.2% pooled
    (never above bar on either band), cross-check 0/80 mismatches,
    tracer 80/80 first try, determinism 6/6 byte-identical. Every
    number points the pilot's way across 80 fresh seeds — and none of
    it is cited here as a confirm. The honest sentence remains
    "fresh evidence is consistent with the pilot and contains no
    contradiction," now over 3 collapsing seeds instead of 2. A
    reader who wants to claim more from n = 3 is over-reading by the
    same factor the first confirm warned about.
(3) LOST-ON-DAY-30 IS UNDEFINED IN THE PREREG AND MUST BE DEFINED
    NEXT. 81053 (village-lost, daysAlive 30, starvation days 26/29/30)
    is counted collapsing by the carried analyzer and excluded by a
    strict daysAlive < 30 reading. The verdict is identical either
    way here, which is why this file can report both counts without
    re-scoring — but a future band where a day-30 loss is the 4th
    collapsing seed would turn this boundary into the verdict. The
    next prereg must state it: the natural definition is
    village-lost + starvation death within the window, regardless of
    whether the loss lands on the horizon day.
(4) COST PARITY IS DEAD AS A CLAIM; COST ITSELF STILL PASSES. The
    prior band's identical (c)/(e*) survivor sets do not repeat
    (overlap 2/6 on this band; (e*) 11.1% vs (c) 7.4%). The next
    confirm should keep reporting the overlap, not the two rates
    alone — the sets, not just the rates, are where the rules
    differ.
(5) SENSE FIT IS THINNER HERE THAN ON THE FIRST BAND, AND THE
    FRAMING CONSTRAINT IS NEW. The first band's firing evenings
    carried the village's own thin-pack voice; 81053's carries a
    generic hunger line plus leadership strain, while the player eats
    canned soup and reports full. A future deploy must frame (e*) as
    the village store's fall, not personal hunger — that framing note
    travels with the shape, even though sense texture does not
    re-score any leg.
(6) No metric, threshold, seed, leg, collapse definition, or rule
    definition was changed mid-run. Prereg committed (5d9763884)
    before any judged sim; the proof test (15/15) ran after the
    prereg commit and before any judged application, uses no judged
    seeds, and changes no prereg word; the confirm verified rows ==
    daysAlive on all 56 seeds first try; the thin analyzer's (c)
    first firing matches the reused analyzer on all 56 seeds;
    determinism re-runs matched byte-identically on 3/3 legs. The
    verdict is judged only against the prereg header. The one
    mid-run deviation from the ideal pipeline was infrastructural,
    not methodological: an intermittent container EPERM flap blocked
    Node/Python file writes during judging, so the summary JSON was
    produced via pipe capture (analyzer rc 0, 24,374 bytes, cross-
    checked in memory) and written to its evidence path via the file
    tool, which bypasses the flap; the judged numbers come from the
    analyzer's own output, not from the write path, and the committed
    summary was re-validated as parseable JSON with matching legs.

## Village assessment (plain words)

Fifty-six villages, and fifty-four of them live the month — this band
is mostly a story of villages that hold on, not villages that fall.
Only one village starves to death, and it does so slowly and visibly:
its store slides from 7,300 to 5,199 across a bounce that used to
restart the old rule's count, then to 1,950, then to almost nothing,
while its people argue about who gives orders and feel, in their own
words, that the pack is thin and something is wrong. The new rule
speaks on the evening the store falls to 5,199 — two evenings before
anyone starves — while the old rule waits until the very evening of
the first starvation death, which is no warning at all. On the
villages that live, the new rule speaks on six and stays silent on
forty-eight; the old rule speaks on four, and they are not the same
villages — the two rules genuinely hear different things now, which
settles the question the last run left open. Nothing here reaches
national, the table, or a win — that wall was never this run's
question, and it did not move. The blank this run fills is a harder
one than the last run's: it is not that the band was too small, it is
that starving villages are rare on fresh ground at this base, so the
rule that earned a pilot on dying villages has now been checked
against eighty fresh villages and found consistent every time — and
still unconfirmed, because dying villages are the very thing a fresh
band rarely contains. What it owes is still a real confirm — but with
a collapsing supply designed into the prereg, not a bigger band
hoping for more deaths.

## Findings for the coordinator (to append to the backlog)

- (e*) FRESH-BAND CONFIRM RETRY INSUFFICIENT-DATA (fresh 81001-81056,
  30d competent, base a63ffc8c9): only 1 collapsing seed vs prereg
  bar >= 4 (survivors 54 >= 12), so NO confirm verdict either way —
  bars not lowered, no extra seeds screened. On the 1 collapsing seed
  all legs passed (fire 1/1, tie 1/1, strict 1/1, lead >= 1 1/1; lead
  2 vs (c) lead 0, clause E1-envelope, day-23 bounce immunity
  observed on a second fresh band); cost 6/54 = 11.1%; cross-check
  0/56 mismatches; tracer 56/56 first try; determinism 3/3
  byte-identical. Does NOT deploy (e*); does NOT overturn the pilot.
  Pooled across both fresh confirms: fire/tie/strict/lead>=1 3/3,
  cost 10/76 = 13.2%, cross-check 0/80, tracer 80/80.
- FRESH-BAND COLLAPSE SCARCITY, RE-DIAGNOSED: 1/56 starvation
  collapses (analyzer count; 0 strict <30d) vs 2/24 on the first
  fresh band — a bigger fixed band is NOT the fix. The next (e*)
  confirm prereg must fix a collapsing SUPPLY before judging
  (pre-screening rule with honest screen rate, or a declared harder
  policy/window), not the verdict bars and not another band-size bump.
- COST PARITY WAS A FLUKE: (e*) fires on 6 survivors, (c) on 4,
  overlap only 2 (81009, 81034) — vs identical sets on 80001-80024.
  The rules diverge in both directions on fresh villages; report
  overlap, not just rates, next time.
- LOST-ON-DAY-30 UNDEFINED: 81053 (village-lost, daysAlive 30,
  starvation days 26/29/30) counts collapsing under the carried
  analyzer but not under a strict daysAlive < 30 reading; verdict
  identical either way here, but the next prereg must define it
  (natural: village-lost + starvation death within the window).
- SENSE FRAMING CONSTRAINT (new): on 81053 the firing evening carries
  a generic hunger line plus leadership strain, not a pantry-specific
  voice, while the player eats canned soup and reports full on days
  24-26. Any future (e*) deploy must frame the warning as the
  village store's fall, not personal hunger.
- SURVIVORS CAN STARVE WITHOUT COLLAPSING: 81009 (3 starvation
  deaths), 81011 (1), 81034 (1) all survived 30d — starvation deaths
  alone do not make a collapsing seed; village loss does.
- DEPLOY WORDING NOTE (carried, not acted on): any future deploy
  wording must be peak-anchored ("fallen from its recent high"), never
  stand-down-anchored — this confirm does NOT deploy (e*).

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + TOOLS-COMMIT INDEX CLOBBER (same known class):
  after commits 5d9763884 and 310efc3c6 the main index showed the
  committed files as staged deletions alongside the worktree copies.
  Repaired both times via git update-index --add --cacheinfo from the
  HEAD blobs, then verified tracked status clean. The commits
  themselves were correct throughout.
- INTERMITTENT EPERM WRITE FLAP, NEW SURFACE (judging phase): Node
  stdout-to-file and Python/Node file writes failed with EPERM
  repeatedly (20 consecutive analyzer-redirect failures; chunked
  Python writes failed 30/30 retries on one chunk), while shell
  redirection writes and the file tool succeeded. Recovery that
  worked: analyzer run via pipe capture (rc 0, output captured in
  memory, legs cross-checked there), summary JSON written via the
  file tool and re-validated as parseable JSON with matching legs.
  The judged numbers come from analyzer output, not the write path.
  A transient index.lock also appeared and cleared on its own during
  the prereg-commit repair; no git state was forced.
- FULL `git status` (with untracked scan) STALLS on this worktree (as
  in prior gatediseng arms); the tracked-only `git status --porcelain
  --untracked-files=no` returns in ~1s and was used for all
  verification.
- CONFIRM CLEAN, FIRST TRY EVERY SEED: all 56 seeds verified on first
  try (rows == daysAlive each); no seed was re-run for judging.
  Per-seed tracer cost ran slow under sibling load early in the sweep
  (~24s/seed for the first 17, faster after) — the 56-seed sweep took
  ~13 min wall. Determinism re-runs (81001, 81002, 81003) matched
  byte-identically.
- check.js --quick NOT re-run: zero src/js, zero green-list files on
  this arm; nothing here touches the runtime.

## COMMIT BLOCKED — READ FIRST (container-wide git-write EPERM, loud failure)

At evidence-write time, every git write on this container fails:
safe-commit.sh dies creating its /tmp private-index lock ("sha1 file
'/tmp/idx-safecommit-<pid>.lock' write error: Operation not
permitted", 12+ retries plus later retries over ~45 min); `git
hash-object -w` dies writing loose objects (strace: write() to the
0444-mode tmp_obj file returns EPERM, while plain shell/Python writes
to the same .git/objects directories succeed); `git update-ref`
cannot write a ref lock; even `git init` template copy fails in /tmp.
Non-git writes work fine (shell redirection, Python writes, the file
tool) — this is a git-write-specific block, not a full disk or
permissions failure, and it is NOT scoped to this worktree (reproduced
in a fresh /tmp repo). No hand-rolled object surgery was attempted:
bypassing safe-commit.sh on the shared repo would violate the arm's
commit discipline, so the corpus commit is left for a clean retry.
RECOVERY (coordinator, once git writes recover — verify first with
`git hash-object -w <any small file>` succeeding):
bash scripts/safe-commit.sh "sim-sensorconfirm2-b evidence: INSUFFICIENT-DATA retry (1/56 collapsing), overlap fluke, sense framing note" -- evidence/2026-11-02/sim-sensorconfirm2-b.jsonl evidence/2026-11-02/sim-sensorconfirm2-b-summary.json evidence/2026-11-02/sim-sensorconfirm2-b-sweep.log evidence/2026-11-02/sim-sensorconfirm2-b-detcheck.log evidence/2026-11-02/sim-sensorconfirm2-b.md
then verify `git show --stat HEAD` lists all five files and the
tracked status is clean before merging. The judged numbers in this
file do not depend on the commit: they come from analyzer pipe output
cross-checked in memory (see metric review (6)).

## Files

- Prereg: evidence/2026-11-02/sim-sensorconfirm2-b-prereg.md
  (commit 5d9763884, before any judged sim)
- Proof test: scripts/test-sensorconfirm2-b.js (15 pure checks, no
  judged seeds; commit 310efc3c6)
- Thin analyzer: scripts/analyze-sensorconfirm2-b.js (imports the reused
  analyzer for (c); commit 310efc3c6)
- Evidence: evidence/2026-11-02/sim-sensorconfirm2-b.md (this file)
- Corpora: evidence/2026-11-02/sim-sensorconfirm2-b.jsonl (56 lines,
  seeds 81001-81056, fresh on current base),
  evidence/2026-11-02/sim-sensorconfirm2-b-summary.json (thin-analyzer
  confirm summary + verdict),
  evidence/2026-11-02/sim-sensorconfirm2-b-sweep.log (per-seed tracer
  stderr),
  evidence/2026-11-02/sim-sensorconfirm2-b-detcheck.log (3/3
  byte-identical determinism re-runs)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): seeds 81001-81056 (the fresh
  band screened here; a future confirm must use a different band or
  state its reuse).
