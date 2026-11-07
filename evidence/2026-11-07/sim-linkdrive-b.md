# sim-linkdrive-b — the link-forming drive: propose + answer raises, hold through seasoning to the Dawn — GO

**Arm:** sim-linkdrive-b (run fleshout-loop-b-20261107T1049Z, axis
scale-onramp / winnability chain) · **POLICY-SIDE ONLY:** one new policy
file (`scripts/policies/competent-linkdrive-b.js` — the drive composes
onto the FROZEN staged substrate `competent-stageally-a.js`, unmodified);
zero src/js changes, zero default flips, no changes to any existing
policy file. **Verdict: GO** — by the preregged bar: links on 8/8 seeds
(bar ≥3), regional on 8/8 (bar ≥2), starvation 6 ≤ baseline+2 = 8 with
1 arm-only (bar ≤2), median survival 128.5d ≥ 0.8 × 114.5d. **Band:**
53001–53008 DELIBERATELY REUSED (balanced panel: before/after on
identical seeds) · **Horizon:** 150d death-aware · **Legs:** staged
baseline (this run's own replay — reproduces regionalstep EXACTLY, see
guard) vs staged + linkdrive, 8 seeds × 2 = 16 runs · **Corpus:**
`evidence/2026-11-07/perseed-linkdrive-b/` (16 files, base recorded per
file) · **Prereg:**
`evidence/2026-11-07/sim-linkdrive-b-prereg.md` (committed ef5c9dfb2
before any judged sim) · **Proof:**
`scripts/test-linkdrive-20261107.js` 27/27 green before the judged run
(includes a live 53006 smoke leg: 60d, regional, 4 links) · **Analyzer:**
`scripts/linkdrive-analyze-20261107.js` · **Panel:**
`evidence/2026-11-07/linkdrive-panel.md` (+ .json, .json.gz pair).

**The one-line result, plainly:** the village asked — and the scale
moved on every seed. The drive proposes on courtship-ready villages
(as-subordinate first) and answers the link raises in real
conversations with the raiser, then holds the links with grain,
tribute, and honored demands. First links form days 7–14, the
Regional Dawn fires days 28–35 on all eight seeds, and four villages
go on to sit a lesser seat — the band's first seats ever. The two
gates regionalstep could not exercise are now exercised and clear:
the 21-day seasoning works, and `_checkRegional` fires the Dawn (one
day after the bond's 21st day, every seed).

## Before / after (paired seeds)

| Seed | Base (days, end, scale, maxW, stand, w4k, pair) | Armed (days, end, scale, maxW, stand, w4k, pair) | Links (LEAD/BELONG) | First link / Dawn |
|---|---|---|---|---|
| 53001 | 106, lost, village, 4, 199, 1, 0 | 150, survived, regional, 4, 175, 0, 0 | 8 (5/3) | d12 / d33 |
| 53002 | 150, survived, village, 4, 150, 1, 0 | 79, lost, regional, 4, 125, 0, 0 | 6 (2/4) | d7 / d28 |
| 53003 | 92, lost, village, 4, 199, 2, 0 | 150, survived, regional, 5, 380, 4, 15 | 4 (1/3) | d7 / d28 |
| 53004 | 88, lost, village, 4, 199, 1, 0 | 139, lost, regional, 5, 350, 4, 33 | 6 (3/3) | d9 / d30 |
| 53005 | 89, lost, village, 3, 70, 0, 0 | 118, lost, regional, 5, 485, 8, 53 | 5 (2/3) | d14 / d35 |
| 53006 | 150, survived, village, 5, 415, 8, 51 | 89, lost, regional, 4, 199, 2, 0 | 4 (3/1) | d8 / d29 |
| 53007 | 150, survived, village, 4, 199, 4, 11 | 86, lost, regional, 3, 99, 0, 0 | 4 (1/3) | d8 / d29 |
| 53008 | 123, lost, village, 4, 150, 0, 0 | 150, survived, regional, 5, 325, 5, 35 | 4 (1/3) | d9 / d30 |

Pooled: links 0 → 41 (LEAD 18, BELONG 23, of which 5 counter-flips);
regional 0/8 → 8/8; lesser seats 0 → 4/8 (53003 d108, 53004 d37,
53005 d83, 53006 d64); wave-5 unlocks 1/8 → 4/8, faced 1/8 → 4/8;
wave-4 unlocks 7/8 → 7/8; wave-4+ kills 17 → 23; pair days 62 → 136;
median survival 114.5d → 128.5d; survived 3/8 → 3/8; total deaths
597 → 539 (63.0 → 56.1 per 100 game-days); starvation deaths 6 → 6.

## The drive, as measured (armed leg)

- **Direct proposes:** 22 calls — 18 accepted outright, 4 countered,
  0 declined, 0 shut-door. Every counter was answered the next day
  (`answerCounter('accept')`, 5 counter-answers total including 1
  raise-counter) and became a BELONG link. The courtship-ready gate
  (deterministic as-subordinate judge ≥ 55) did what it promised:
  the score could never decline, so no cold-ask −5 opinion cost was
  ever paid. The throttle on direct proposing was the pantry, not
  courtship: the pantry sat under the 12,000 kcal propose gate on
  734 of 961 game-days (76%), blocking proposes on 365 days; the
  3-link cap blocked 114 more; a pending counter/accord/national
  beat blocked 362 (almost all of it the unanswered national beats —
  see below).
- **Raise answers:** 19 `link:accept` picks in real conversations
  with the raiser (all through `convoTurn`, never the bare
  `acceptLinkRaise` verb; 0 `link:decline` picks, 0 bare-verb calls),
  18 of them forming a link on the spot and 1 staging a counter
  (answered next day). All 19 were answered before expiry — 18 on
  the day the raise was first seen, 1 three days after first sighting
  (53006; staged the day before first sighting, inside the window).
  4 raises expired unanswered (all for not-yet-ready splinter
  villages the drive skipped — the honest "not yet", left to expire
  rather than declined); 0 raises were refused. Baseline for
  comparison: 82 raises staged, 80 expired, 0 accepted. The armed
  leg staged only 22–23 raises total — because the drive links the
  known villages within ~2 weeks, after which the raisable pool is
  exhausted and only late-appearing splinter villages can be raised.
  Raises did nearly half the linking (19 of 41 links) precisely
  because answering a raise has no pantry gate while proposing does.
- **First accords:** 24 answered with the gift (2,000 kcal → +10
  trust). Every link formed before regional restages the gesture;
  links formed after `networkLive` do not.
- **Holding — LEAD:** 11 tends (1,500 kcal → +8 trust, weekly,
  below the seasoned bar only). Tends were rare because the pantry
  almost never clears the 20,000 kcal tend gate (642 link-days
  tend-blocked) — but LEAD links seasoned anyway: the weekly settled
  tribute (+1) plus the accord gift (+10) carried trust to 40+
  without tending. Tending is not the holding engine on this band;
  the weekly tick is.
- **Holding — BELONG:** 216 tribute payments (1,444,250 kcal left
  the pantry — the paid figure runs above the 4,000–6,000 owed
  because the engine removes whole pantry units, so a 4,000 kcal
  tribute can take a 6,100 kcal unit), 68 demands honored (tribute
  37, aid 20, counsel 11). 1,159 link-days the pantry could not
  cover a BELONG week's tribute — those weeks went unsettled
  (−6 trust + arrears). The counter-accepted BELONG links carry
  6,000 kcal/week tribute, and on a lean pantry that week is
  regularly unaffordable: on 53001 the Stonebridge link's tribute
  was blocked 3 days running (pantry 800–5,000 vs 6,000 owed).
  BELONG holding is pantry-holding, and the pantry is usually thin.
- **Grief raises the price:** on 53006, Stonebridge's tribute rose
  4,000 → 6,000 → 9,000 kcal/week across two Haven speaker deaths
  ("With Haven grieving, Stonebridge installs their own speaker at
  the table. Tribute rises to 6,000 kcal/week. Grief is leverage,
  and they know it.") — the mirror-succession beat on BELONG links,
  narrated as lived politics.

## The two untested gates — now exercised, both clear

- **Seasoning (21 days):** the oldest bond reaches 21 days and the
  Dawn follows. Gate tally on armed no-regional days: `link-young`
  167 days (the bond aging, as designed), then exactly 1 day of
  `seasoned-no-dawn` per seed — the Dawn fires the day AFTER the
  bond's 21st day on all eight seeds, a consistent 1-day lag
  (snapshot/`_checkRegional` ordering at the day boundary, not a
  defect: the Dawn always lands). `courtship-no-attempt` falls from
  931 band-wide days (regionalstep) to 39 — the ask is no longer
  the blocker; the season is.
- **`_checkRegional` / the Dawn:** fires days 28–35 on all eight
  seeds with the canon line: "◈ SYSTEM: 'One fire was a village.
  Two fires is a NETWORK. Coordination layer: online — tribute,
  demands, the long climb, all tracked now. Try not to starve twice
  as fast.'" Regional days total 721 band-wide.

## What regional unlocked — and what it did not

- **The lesser seat, 4/8.** The lesser seat bars (read from
  `src/js/table.js`: waves 1–3 faced 4/4/3, ≥2 contests, ≥2 crises,
  regional+, stage ≥2, food deeds) were already banked by the
  staged substrate; regional was the missing piece. 53004 sat on
  day 37 — seven days after its Dawn — with w1 13, w2 7, w3 3,
  contests 2, crises 3, stage 3. The full seat stays 0/8, and the
  shortfall ledger names the next wall precisely: **national
  standing is the only missing item on 53004 and 53005**; on 53003
  it is national + 1 more wave-5 type faced; on 53008 national +
  the unspent feast surge; on 53001/53002/53006/53007 wave-4/5
  deeds + national + (on three) the feast surge. The feast drive
  (sitstep blank #2) is now the second half of the seat on 5/8
  seeds; national is the blocker on 8/8.
- **National staged — and waited.** A BELONG-shaped national beat
  (`pendingNational`, The Binding) staged on 6/8 seeds and sat
  unanswered for 23–90 days each (357 pending days total) — by
  design, the drive never answers endgame beats. The staging itself
  is the finding: a foreign polity reached 4+ villages (the BELONG
  precondition) on 6/8 seeds once Haven engaged — the region climbs
  when Haven plays. The beat is the next arm's to answer, not this
  one's to leave sitting: 357 days of a staged Binding is a
  measurement choice, and it should not become the default.
- **Diplomacy: flows at 34, never holds at 102.** Max diplomacy 34
  on 6/8 seeds (held 14–88 days), 0 on 53001/53007, end-diplomacy
  0 on all 8. The rule (read from `src/js/standing.js`,
  `_linkRegionalPlus`): a seasoned link counts (+34) only inside
  a regional-scale polity — LEAD needs `polityOf('haven')` (≥3
  seasoned subordinates), BELONG needs the primary's realm at ≥4.
  The LEAD realm never formed on any seed: at most 2 seasoned
  LEAD links on the same day (0 days with 3), because the drive's
  as-subordinate-first bias + the 3-link cap fill the cap with
  BELONG links (23 of 41) and leave LEAD links scarce (18, of
  which only 53001's 5 ever looked like a realm — and at most 2
  seasoned together). BELONG diplomacy is capped the same way from
  the other side: at most one of Haven's primaries holds a 4-realm
  at a time, so at most one BELONG link counts. 102 (three counting
  links) was never seen. The askplus holding problem survives in
  miniature: links season (3–5 per seed reach 30d + trust 40) but
  the polity bar, not the link bar, is now the binding constraint
  for diplomacy. A next arm that wants 102 must form the LEAD
  realm (3 seasoned LEAD subs at once) or hold two BELONG links
  inside live 4-realms — this drive's shape cannot do either.

## The cost, honestly: trajectories flip both ways

The armed leg's RNG draws (judgeLink, conversation turns) flip the
fragile staged trajectory (trajfrag-b), and the flips cut both ways:

| Seed | Survival delta | What flipped |
|---|---|---|
| 53001 | +44 (106 → 150) | died → survived; regional + lesser-seat road open, but 0 wave-4 kills (baseline 1) |
| 53002 | −71 (150 → 79) | survived → died day 79; regional, but 0 wave-4 kills |
| 53003 | +58 (92 → 150) | died → survived; wave 5, lesser seat, standing 380 |
| 53004 | +51 (88 → 139) | wave 5, lesser seat day 37, 33 pair days |
| 53005 | +29 (89 → 118) | wave 5, lesser seat, standing 485 (baseline 70), 53 pair days |
| 53006 | −61 (150 → 89) | the flagship collapses: baseline 150d / 51 pair days / 8 wave-4 kills / wave 5 → armed 89d / 0 pair days / 2 kills / wave 4 — yet still sat a lesser seat day 64 |
| 53007 | −64 (150 → 86) | survived → died day 86; maxWave 3 (baseline 4), 0 wave-4 kills (baseline 4) |
| 53008 | +27 (123 → 150) | died → survived; wave 5, 35 pair days |

Median survival rises (114.5 → 128.5) because 5/8 seeds improve,
but three seeds collapse by 61–71 days each, and the band's best
staged trajectory (53006) is the worst casualty. The pair guard
passes at band level (wave-4+ kills 23 vs 17, pair days 136 vs 62)
only because 53004/53005/53008 pair up where 53006/53007 stop —
the staged pair is reshuffled, not preserved. At n=8 this is
variance + a plausible food mechanism (tribute 4,000–6,000/week per
BELONG link + accord gifts out of a lean pantry), NOT a proven
causal claim — the same caveat askplus recorded. What IS proven:
the lever's benefit (regional, seats) does not ride on the pair
surviving; the pair production is trajectory-luck either way.

## Wall numbers (this run)

National / table / wins: **0 / 0 / 0** both legs · Wave 4 unlocks
7/8 → 7/8 · Wave 5 unlocks 1/8 → **4/8**, faced 1/8 → **4/8**,
kills on 4 seeds · Lesser seats 0 → **4/8** · Full seat 0/8 ·
Median survival **114.5d → 128.5d** · Max survival 150d both legs.
The scale wall moved one rung: regional is now reached on every
seed, and the wall is national — specifically the BELONG beat
waiting to be answered and the LEAD realm that never forms.

## Village assessment (plain words)

A village that spent a hundred and fifty days alone because nobody
ever asked now asks — and the neighbors answer. Rosa brings the idea
on day five and this time somebody walks over, sits down, and says
"All right — let's ask them." Within a fortnight Haven has three
fires under one roof, and three weeks later the System itself says
so: two fires is a network. The village that used to be raided by
its neighbors now pays them tribute instead — real food walking out
of the pantry every week, and sometimes the pantry can't cover it,
and the ledger remembers. The neighbors who would have said yes on
day nine say yes on day nine. Four villages go on to sit at the
lesser table — the first seats this band has ever seen — and the
other four still reach regional and die as a network instead of
alone. But the network is thin where it matters: the village joins
other people's realms more than it builds its own, its three fires
never season together under one head, and the court that would make
it national sits waiting for an answer nobody in this run was
allowed to give. And the price is written in the same ink: the
flagship village that fought its way to the fifth wave alone now
dies on day eighty-nine with friends — the friends didn't save it,
and the asking didn't kill it either; the dice just fell the other
way, and eight seeds can't tell you which it was.

## Sense-test read (53006, days 8–57)

**The ask reads like people talking.** Day 8: "⛓️ David brings it
home: Emberhold bows to Haven — one organization, us primary.
Tribute: 4,000 kcal/week. The relationship starts at trust 30.
Everything from here is earned." Day 9: "Haven bows to Stonebridge
— one organization, them primary." The same day, the first gesture:
"🎁 Haven's first gesture: 2,000 kcal walks to Emberhold's fire — a
gift, no strings. They count it, and they remember who sent it.
(Trust +10.)" The widened say-capture now catches these lines —
37 "brings it home / bows" lines band-wide, where regionalstep's
pattern caught zero (the askplus instrument finding, fixed in this
arm's driver). The Dawn line fires verbatim on all eight seeds.
Tribute is narrated as a relationship, not a tax: "Tribute paid:
4,000 kcal walks out of the pantry toward Stonebridge. The
relationship holds." And a demand honored reads like the price it
is: "You send 4,500 kcal. It hurts. That's rather the point of
tribute." (day 57).

**The grief beat is the best writing in the corpus.** When Haven's
speaker dies, the primary renegotiates: "With Haven grieving,
Stonebridge installs their own speaker at the table. Tribute rises
to 6,000 kcal/week. Grief is leverage, and they know it. The link
holds — it was never with one person." Then again, to 9,000. The
subordinate position is narrated as lived politics, not a label
swap — the same quality askplus caught on the BELONG flip.

**What the capture still misses.** The national beat's staging and
the lesser seat's offer have no matching narration in the captured
sample — the beat is verified from live state (`pendingNational`,
357 days) and the seat from live state (`snap.seat`), not from
dialogue. Either the staging lines exist outside the capture regex
or they stage silently; the next arm should check before claiming
the beats are narrated. The say-capture is a 300-line regex sample,
not a transcript — counts from it are illustrative, never the
verdict, which rests on live state.

## Metric review

Pre-registered metrics bind this run (prereg ef5c9dfb2). Primary
GO iff (a) links ≥3/8, (b) regional ≥2/8, (c) starvation armed ≤
baseline+2 AND arm-only ≤2, (d) median armed ≥ 0.8× baseline.
HELD on all four: links 8/8, regional 8/8, starvation 6 ≤ 8 with
arm-only 1 ≤ 2, median 128.5 ≥ 91.6. The pair guard (secondary:
armed wave-4+ kills ≥ baseline −2, pair days ≥ baseline −10%)
HELD at band level (23 vs 17, 136 vs 62) — but the per-seed pair
story (53006/53007 collapse, 53004/53005/53008 gain) is reported
above, not hidden behind the band total. No metric was swapped,
re-cut, or re-thresholded after the run. The proof live leg is not
evidence; only the judged 16-run corpus is.
- Baseline guard (exact regionalstep reproduction) HELD on all 8
  seeds — days, end reasons, standing, wave-4+ kills (1/1/2/1/0/8/4/0),
  0 links, 0 regional, 0 instrument errors. The driver change
  (POLICY switch + widened say regex + snapshot extensions) moved
  no game number.
- Instrument corrections made in-run (before evidence, after the
  judged legs — see below): (1) the policy `event()` helper let an
  `extra.kind` field overwrite the event's own `kind`, mislabeling
  demand-answer events with the demand kind ('tribute'/'aid'/
  'counsel'); fixed in commit b7c8db0d9. (2) The analyzer's shape
  classifier read direction from the daily link rows, which carry
  no primary/subordinate — every link read '?' (the first analyzer
  run printed `(?:N)`); shapes are now read from the formation
  events (same commit). Both fixes are instrument-only: the policy
  fix touches only the STATS event log (no game call, no RNG draw),
  and the analyzer fix reads stored JSONs. Verified: the proof's
  60d 53006 smoke re-run post-fix reproduces the pre-fix smoke
  EXACTLY (days, scale, standing, maxWave, wave-4 kills, all
  linkdrive counters identical) — only the demand-event kind label
  changed. No judged number depends on either fix: the analyzer
  never read events before the fix, and the shape counts now
  reconcile exactly (LEAD 18 + BELONG 23 = 41 ever-links, every
  seed matching).
- The `seasoned-no-dawn` 1-day lag (all 8 seeds) is a timing
  observation, not a metric miss: the Dawn always lands the next
  day. If a future arm needs the Dawn on the 21st day exactly, the
  lag is in `_checkRegional`/snapshot ordering, not in the drive.
- What the metric did not cover, honestly: (1) The GO bar judges
  links + regional + survival cost — it does not judge the LEAD
  realm or diplomacy holding, and both failed in miniature (102
  never seen, end-diplomacy 0/8). A confirm bar should judge the
  polity, not the link. (2) The median survival bar passed while
  3/8 seeds collapsed 61–71 days — the median hides paired
  divergence on a fragile substrate; a confirm should carry a
  per-seed regression guard (e.g. no seed worse than −30 days
  without an attributed cause) alongside the median. (3) The
  national beat staged but was never answered — the prereg forbade
  answering it, so national 0/8 is a design choice of this arm,
  not a finding about the road. The next arm answers the Binding.
  (4) End-diplomacy is a lottery over the death day when polity
  standing flickers (askplus metric review, confirmed here:
  diplomacy 34 appears and vanishes as single links season and
  unseason) — holding must be judged by held-days, not end state.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-07/linkdrive-panel.md` (+ .json, .json.gz pair):
decision review_required (8 paired cases). National 0 → 0
(no_material_signal); wins 0 → 0 (descriptive); survival60 1.0 →
1.0 (no_material_signal); villageDeaths/run 74.6 → 67.4
(no_material_signal, CI [−26, 11.6]); villageDeaths/100d 63.6 →
56.6 (no_material_signal, CI [−15.6, 2.2]); communityLost 0.625 →
0.625 (no_material_signal). Per §15 this does NOT override the
prereg verdict (already GO on the primary bar); the panel's null
contract-metric signals are consistent with the paired story —
the lever moves scale and seats, which the contract metrics do not
price. Panel limitation (stated in the prereg): the pseudo-panel
covers only contract metrics mappable from linkdrive JSONs (won,
national, survival30/60, communityLost, villageDeaths); playerDeaths,
gear, luck, and NPC metrics are null, never faked.

## Telemetry deviation check

This arm did not run `scripts/telemetry-check.js`: it compares a
Game-telemetry baseline against current runs, and this arm made no
Game-root change (frozen policy + one new policy file only, zero
src/js changes), so there is no Game-telemetry baseline to deviate
from. The wall numbers above are the instrument's own. (The
regionalstep arm reported the check refusing its recorder corpus;
this arm did not re-attempt that — a coordinator step if one is
wanted.)

## What this arm does NOT claim

- Not a "scale is fixed" finding: regional is reached, national is
  not — the Binding waits unanswered on 6/8 seeds and the LEAD
  realm never forms. The wall moved one rung, not off the board.
- Not a "diplomacy holds" finding: diplomacy peaks at 34 (one
  counting link) and ends at 0 on all 8 seeds. Links season;
  polities do not.
- Not a "survival improves" finding: the median rises while 3/8
  seeds collapse 61–71 days. The survival effect is unseparated
  variance at n=8, and the food mechanism (tribute out of a lean
  pantry) is plausible but unproven.
- Not a "pair production is safe" finding: the pair guard passes
  at band level only because gains on three seeds offset collapses
  on two. The staged pair is trajectory-luck under any lever that
  draws RNG.
- Not a win, not a full seat: 0/8 on both, same as every prior arm
  on this band. The lesser seat is not the win.
- Not a game-code change: the propose verbs stay player-only per
  Steve's 2026-10-26 ruling. This arm is a measurement instrument
  standing in for the player — the drive proves the ask works, it
  does not ship the asking. Whether the game itself should ask
  (villager-initiated bonds exist; player-initiated proposing does
  not) is a Steve-call, not a sim verdict.

## Next blanks (for the loop, not this arm)

1. **Answer the Binding** — the staged national beat is the next
   arm's to answer (BELONG: swear/serve/walk; the drive's shape
   already holds BELONG links with tribute + honored demands).
   National is the only missing full-seat item on 53004/53005.
2. **Form the LEAD realm** — 3 seasoned LEAD subordinates at once.
   This drive's as-subordinate-first bias + 3-link cap cannot do
   it: a variant must propose as-primary (or raise the cap) and
   tend LEAD links to 40+ together.
3. **The feast drive** — sitstep blank #2, unchanged: hold a feast
   and spend the surge in a real fight (the full-seat shortfall
   names it on 5/8 seeds).
4. **The paired-survival question** — the median hides per-seed
   collapse; a confirm on a fresh band with a per-seed regression
   guard, or a trajfrag-style replication, before anyone leans on
   the survival direction.
5. **Beat/seat narration check** — verify from a full transcript
   whether the national beat's staging and the lesser seat's offer
   are narrated at all (this arm's capture found neither).

## Proof and commits

- Proof `scripts/test-linkdrive-20261107.js`: 27/27 green on this
  worktree before the judged run (detJudge fixtures, isSeasoned,
  propose/counter/accord/raise/tend/tribute/demand gating incl.
  never-bare-`acceptLinkRaise`, never-`link:decline`, national/global
  non-answers, live 53006 smoke leg 60d: regional, 4 links, 0
  instrument errors). Re-run green after the event-kind fix
  (b7c8db0d9), with the post-fix smoke reproducing the pre-fix
  smoke exactly (see metric review).
- Prereg committed ef5c9dfb2 before any judged sim. Tooling
  committed f9743239b (policy + driver + analyzer + panel builder +
  proof 27/27, zero src/js). Fix committed b7c8db0d9 (event-kind
  label + analyzer shapes, instrument-only, verified no-op on the
  smoke). The safe-commit index clobber hit on all three commits
  (files shown staged-as-deleted / MM after correct commits);
  repaired with HEAD-blob cacheinfo, verified `git status` empty +
  `git diff HEAD` empty + hash-object matches, each time.
- Judged corpus: `evidence/2026-11-07/perseed-linkdrive-b/`
  (16 files, staged baseline + armed, 0 instrument errors).
  Analyzer output saved at `/tmp/linkdrive-analysis.txt` (working
  copy; the evidence file above is the record). Panel files
  `evidence/2026-11-07/linkdrive-panel{-before,-after}.json.gz`,
  `linkdrive-panel.{json,md}`.

## Convergence

**scale-onramp: converging, NOT converged.** The regional step is
now BUILT past, not just diagnosed: the village asks, links form
days 7–14, the Dawn fires days 28–35 on every seed, and four
villages sit a lesser seat. But the ladder's next rung is still
unclimbed — national waits on a Binding nobody answered and a
LEAD realm nobody formed, diplomacy peaks at one counting link,
and the full seat's shortfall names national on all eight seeds.
The drive proved the ask works. The next work is the answer.
