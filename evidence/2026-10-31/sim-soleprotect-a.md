# sim-soleprotect-a — SOLE-SPECIALIST MORTALITY/CAPACITY DIAG — VERDICT: DIAG-NO-GO (bar 8 only; bars 1–7 pass)

Run: Loop A worker, arm sim-soleprotect-a, axis scale-onramp
(converging, NOT converged), run fleshout-20261031T1850Z.
DIAG-ONLY arm: no game-code default flips, no lever build, no
lever efficacy judged. The dangerfit routing was re-applied
ONLY as a measurement instrument inside this worktree and
REVERTED before landing — twice (once per round), each
revert verified byte-identical to base (delegate.js blob
1e68718d8, git diff empty). What lands is evidence +
analyzer + proof test only: zero src/js change, and even
the policy script returns to base state.
Worktree branch: sim-soleprotect-a. Base anchor (all four
legs): 00e1bd4db (master tip at spawn).
Pre-registration: evidence/2026-10-31/sim-soleprotect-a-
prereg.md (committed BEFORE any judged sims, commit
91be8a4f8; the commit itself was delayed by the EPERM
flap — see §Infrastructure — but the prereg FILE was
written before any judged sim ran, and no leg ran
before the prereg commit landed).
Instrument: scripts/patrolsilent-diag-20261031.js (v2) +
scripts/dangerfit-runner-20261031.js +
scripts/dangerfit-split-20261031.js, all reused verbatim
(ARM labels soleprotect-base / soleprotect-instrument).
Analyzer: scripts/soleprotect-analyze-20261031.js (new).
Proof: scripts/test-soleprotect-20261031.js — 6/6
synthetic GREEN before legs, 10/10 with corpus
reconciliation after legs (6 synthetic + pilot base +
pilot instrument + confirm base + confirm instrument).
No [needs-eyes] landing (nothing player-facing changes).

## Verdict: DIAG-NO-GO, on one clause only

Judged exactly against the prereg (8 DIAG bars):

1. Pilot (8 seeds) completes on BOTH legs, instrument
   errors 0 on every seed — PASS. Confirm (8 fresh
   seeds) also completes on BOTH legs, errors 0.
2. Every sole-specialist patrol death classified — PASS:
   1/1 on the instrument leg (mechanic, below), 0 on
   the baseline leg (vacuous: no sole-specialist holder
   ever patrols there). Cause verbatim, HP at death,
   days out — all present.
3. Truncation quantified on BOTH legs — PASS: every sole-
   specialist holder row carries skill totals AND
   empty-days (mechanic instrument: mend 85 total,
   51/51 post-death empty days; mechanic baseline:
   271 total, holder alive).
4. Sole-coverage census complete — PASS: all 16 seeds ×
   2 legs × 2 skills (64 cells) filled, no blanks.
5. RETREAT-80 counted from the logs on both legs — PASS:
   0/1 sole-specialist patrol deaths saved (mechanic
   fatal patrol HP 94 ≥ 80), with the kept-home-that-
   day limit stated wherever the count appears.
6. Proof test GREEN — PASS: 10/10 (6 synthetic + 4
   corpus reconciliations, one per leg-band).
7. Instrument revert verified byte-identical — PASS,
   twice (pilot round and confirm round), blob
   1e68718d8 both times.
8. Sense read: transcripts of at least 2 sole-specialist
   patrol deaths AND one surviving holder's patrol —
   FAIL, on count, not on reading quality: the full
   16-seed band contains exactly ONE sole-specialist
   patrol death (85111 mechanic). A second transcript
   does not exist to read. The one death IS read below
   in full, the surviving farmer's patrol IS read below,
   and a supplementary non-sole holder patrol death IS
   read below (labeled supplementary, never counted
   toward this bar) — but the bar as written requires
   two sole-specialist death transcripts, and re-
   labeling the supplementary read as one would be a
   mid-run re-score (§14). So the verdict is DIAG-NO-GO.

A miss on any clause is DIAG-NO-GO, never re-scored.
The NO-GO is narrow and, in a sense, good news for the
next arm: the census is complete, the classification is
complete, and the reason bar 8 fails is a measured
rarity (sole-specialist patrol deaths: 1 per 16
instrument seeds), not missing data. The next BUILD arm
inherits this census whole; it does not need to re-
measure mortality to design a guard. The DIAG-NO-GO
must not be quoted as "the census failed" — bars 1–7
passed, and the split-guardrail proposal (§Proposal)
is delivered.

## Basecheck: NO drift on the pilot band

The baseline leg on this base (00e1bd4db) reproduces
dangerfit's pilot headlines exactly: 85111 mechanic mend
271 / patrol 0 / 201d survived; 85114 farmer cook 257 /
patrol 0 / 107d won; 85101/85103/85104/85107/85108/85110
days, end reasons, national/table/won flags, wave reach,
and delegate-assign counts all identical (3016, 1758,
2155, 1626 on the no-killer seeds). Judged numbers below
come ONLY from this run's four legs on this base;
dangerfit's numbers are prior-base context, labeled as
such, and agree with the basecheck where they overlap.
The instrument leg likewise reproduces dangerfit's lever
headlines exactly (85111: 191d, patrol 10, assigns 4663;
85114: patrol 28), confirming the instrument is the same
routing, not a near-miss of it.

## The answer, in plain words

What protects a sole specialist sent to danger? On this
evidence: nothing about their health does. The village's
only mender went to danger at full and rising strength
— his patrol-beat HP climbed 73 → 94 across his eight
patrol days, because patrolling barely scratched him —
and then one patrol at HP 94 killed him. A rule that
keeps wounded specialists home would never have fired
for him: he was never wounded. He mended in the morning,
patrolled at midday, and was simply absent from the
evening beat onward; the workbench then sat empty for
51 days, and the village still won — the win column
does not see the workbench. The farmer is the control
case that keeps the verdict honest rather than fatalist:
she patrolled 28 times at HP up to 100, cooked 166
times, and lived — but she was never the village's only
cook (two providers on the instrument leg), so her
survival was never load-bearing. Protection, if it is
to mean anything for the sole case, has to be structural
— a second pair of hands on the skill BEFORE the holder
is sent, or a rule that never sends a sole provider at
all — because no health threshold that lets a healthy
specialist patrol can save a healthy specialist's fatal
patrol. The numbers for that sentence are all below.

## Census (a) — sole-coverage rates per fit skill

Provider = a villager with >= 1 delegateBeat pick of
that task on at-Haven beats over the run (the all-beats
frame that reproduces "271x/257x"). Sole = exactly 1
provider. Sole-specialist holder = a kills-holder who
is the sole provider of mend or of cook. Channel limit,
stated plainly: this is the DELEGATE-assigned channel
only; villagers' self-directed work (competent-policy
objectives) is not in this instrument, so "village mends
nothing" below means "no delegate-assigned mending,"
not "no mending by any means anywhere."

Full band, 16 seeds per leg:

| leg | mend sole-provider seeds | mend sole-HOLDER seeds | cook sole-provider seeds | cook sole-HOLDER seeds |
|-----|--------------------------|------------------------|--------------------------|------------------------|
| baseline | 6/16 (85101, 85107, 85108, 85111, 85114, 85116) | 1/16 (85111 mechanic) | 4/16 (85104, 85111, 85105, 85106) | 0/16 |
| instrument | 5/16 (85101, 85107, 85110, 85111, 85105) | 1/16 (85111 mechanic) | 4/16 (85104, 85111, 85106, 85109) | 0/16 |

Read it twice: sole PROVIDERS are common (mend sole on
5–6 of 16 seeds, cook sole on 4 of 16), but a sole
provider who is ALSO a kills-holder — the only
combination the danger branch can newly endanger — is
rare: exactly 1 seed in 16 on each leg, the same seed
and the same villager (85111 mechanic, mend). No
sole-cook kills-holder exists on either leg. The
dangerfit flagship was not a typical case; it was the
rare intersection, and it is the whole sole-specialist
census. Any guard built for this shape protects ~1 in
16 villages on this band — worth building (the failure
is total when it hits), but it must not be sold as a
band-wide fix.

Sole providers who are NOT holders (the fragility
around the finding): baseline 85104 cook sole benoit
(196 picks), 85116 mend sole (8 picks), 85105/85106
cook sole (37/124 picks) — all survive-or-die on
their own terms, untouched by the danger branch. The
instrument does not endanger them; it only endangers
holders. The census keeps both groups separate so the
next arm does not over-claim.

## Census (b) — every sole-specialist patrol death, classified

Baseline leg (16 seeds): ZERO sole-specialist patrol
deaths. The only sole-specialist holder (85111
mechanic) never patrols (patrol 0) and lives.

Instrument leg (16 seeds): exactly ONE.

| seed | holder | skill | death day | cause (verbatim) | HP at death | days firstKill→death | patrol days / picks before death | RETREAT-80 saved? |
|------|--------|-------|-----------|------------------|-------------|----------------------|----------------------------------|-------------------|
| 85111 | mechanic (app_mgpspicb724) | mend (sole) | 140 | monster (combat) | 94 | 8 | 8 days / 10 picks | NO (94 ≥ 80) |

Classification notes: the death row is kind=villager,
cause 'monster'; the holder's last delegate pick before
disappearance was 'patrol' on the death day (part 1),
and the roster has no row for him from part 2 on. HP
94 is the pre-beat snapshot HP on that patrol beat.
Days out, all three prereg senses: 8 days since his
first kill (day 132), 8 distinct patrol days, 10 patrol
picks (two days he patrolled twice). No sole-specialist
holder died of any other cause on either leg, and no
sole-specialist holder died on a non-patrol day: the
denominator for the retreat count is 1, and the count
is 0.

## Census (c) — truncation when the holder dies vs survives

85111 mechanic, mend (delegate channel):

| leg | holder fate | village mend total | before death | death day | after death | post-death empty days / days |
|-----|-------------|--------------------|--------------|-----------|-------------|------------------------------|
| baseline | alive at run end | 271 | — (no death) | — | — | survival row: mends on 91 of 201 days |
| instrument | died day 140 (monster) | 85 (all his) | 84 | 1 | 0 | 51 / 51 (100%) |

The instrument total (85) is the dangerfit NO-GO number,
re-derived on this base: 84 pre-death picks + the
death-day morning mend + zero after. Nobody else ever
picks up mending on either leg (provider count stays 1).
For contrast, the surviving sole-specialist-adjacent
case: 85114 farmer (instrument) is NOT sole (cook
providers 2: farmer 166 + catalina 20), survives, and
her village's cook channel continues — no truncation
to measure, because survival plus backup is exactly
the shape that does not truncate. The truncation
finding is therefore specific: death of a SOLE
provider ends the channel; death of a backed provider
does not (see the supplementary fisherman read below,
where a two-provider channel still ends by attrition
— a different shape, labeled as such).

## Census (d) — RETREAT-80 counterfactual, counted from the logs

Rule (prereg, stated before any judged sim): a sole
specialist does not take a patrol pick when pre-beat HP
< 80 (patrol only at HP ≥ 80). A sole-specialist patrol
death counts as RETREAT-80-SAVED iff its death-day
patrol beat's pre-beat HP was < 80 — i.e. the rule
would have kept the holder home ON THE FATAL DAY.
Limit, stated wherever the count appears: this is a
kept-home-that-day count, NOT a claim the holder would
have lived to run end (a holder kept home one day can
still die on a later patrol; a live rule would also
diverge the whole trajectory).

- Judged count: 0 / 1 sole-specialist patrol deaths
  saved (fatal HP 94).
- HP distribution of fatal patrols (so a reader can
  see whether ANY threshold would have mattered): the
  sole-specialist distribution is a single point at 94.
  Any HP threshold ≤ 94 saves 0/1; a threshold of 95+
  would have kept him home that day — but at HP 94
  he was, by the game's own numbers, a healthy
  specialist, and a "patrol only above 94" rule is a
  no-patrol rule wearing a health costume. The honest
  reading is that HP gating does not protect this
  case, not that the threshold was set 1 point too low.
- Supplementary (NOT the judged count): on the
  instrument leg, 5 further holder patrol-day deaths
  (same-day patrol pick before vanishing, non-sole
  holders) have fatal HPs 99, 88, 74, 66, 73. Of those
  5, RETREAT-80 would have kept 3 home that day (74,
  66, 73). So HP gating DOES bite for ordinary holders
  — they patrol at varied, often low HP — while
  missing the sole case entirely. That split is the
  sharpest design signal in this census: a health gate
  protects the common case and misses the catastrophic
  one. The next arm must not cite "RETREAT-80 saves 3
  of 6 patrol deaths" without the sole/non-sole split;
  on the sole case it saves 0 of 1.

Supplementary full-band holder patrol-day deaths
(instrument leg; baseline leg: 0 patrol-day deaths —
baseline holder deaths fall on rest/no-pick days, with
causes ranging over sickness, 'the wild', 'The
Redactor', and 'hunting'):

| seed | holder | death day / cause | fatal patrol HP |
|------|--------|-------------------|-----------------|
| 85106 | firefighter | 64 / monster | 99 |
| 85108 | paramedic | 36 / monster | 88 |
| 85108 | fisherman | 45 / monster | 74 |
| 85110 | fishing guide | 42 / monster | 66 |
| 85110 | street artist | 52 / monster | 73 |
| 85111 | mechanic (SOLE) | 140 / monster | 94 |

## Diversion is healthy (context for the split proposal)

Post-first-kill delegate shares on the instrument leg,
counted from this run's corpora (not transferred):
mechanic mend 13 / patrol 10 / hunt 3 → fit share
13/26 = 50%; farmer cook 41 / patrol 28 / hunt 26 →
fit share 41/95 = 43%. Both clear a 40% diversion
floor with room. The dangerfit failure was never that
the holder stopped doing fit work — half his post-kill
beats still mended. It was that the other half sent
him into danger, and danger took the whole future of
the skill with him. Any next prereg that judges only a
fit-share floor will pass this lever while the village
still loses its mender; the floor must be split (see
§Proposal).

## Sense test (SENSE-TESTING LAW)

1. Sole-specialist patrol death — 85111 mechanic, day
   140, instrument leg (this run's corpus, not
   borrowed): morning, he mends (HP 94). Midday, he
   patrols — the village's only patrol pick that day,
   HP 94, while everyone else does wood, forage,
   water, teaching. Evening, he is simply absent: no
   pick, no mend, no patrol. The deaths list says day
   140, cause 'monster'. His patrol-beat HP across
   his eight patrol days reads 73, 73, 76, 82, 85, 88,
   88, 91, 94, 94 — a villager getting STRONGER between
   patrols, not wearing down. Nothing in the transcript
   warns of this death: no wound, no low-HP patrol, no
   retreat signal. A reader judging only the win column
   (this seed wins on the instrument leg) would call
   the leg a success; a reader who saw the workbench
   would not. That gap is the finding, and it survives
   re-derivation on this base byte for byte.
2. Surviving holder's patrol — 85114 farmer, day 59,
   instrument leg: morning, she patrols at HP 100
   (kills 1); midday and evening, she cooks. She ends
   the run alive with cook 166, patrol 28, hunt 26.
   The transcript reads as a competent adult doing
   dangerous work and coming home to cook — the
   danger branch working as designed, on a holder the
   village can afford to risk because she is not its
   only cook. The contrast with read 1 is the whole
   argument: same branch, same courage, different
   coverage — one village loses a channel, the other
   loses nothing.
3. Supplementary (NOT counted toward prereg bar 8) —
   85108 fisherman, day 45, instrument leg: day 44 he
   hunts, cooks, and patrols at HP 71; day 45 he
   patrols at HP 74 and dies (cause 'monster'). He was
   a cook provider (73 picks) but not sole — the other
   provider, catalina, died day 8 (cause 'monster').
   After day 45 the delegate-cook channel on this seed
   records zero picks: a two-provider channel can
   still truncate by attrition, one death at a time.
   This read is included because a next arm that
   guards only "sole at send time" would still watch
   this seed's cooking end — the guard needs a
   coverage-over-time sense, not a snapshot — but it
   is NOT a sole-specialist patrol death and is never
   counted as one.

## Proposal for the next BUILD arm: split guardrails, with numbers

From this census, not invented thresholds:

- DIVERSION bar (rate, not fate): post-first-kill fit
  share ≥ 40% per holder. Measured: mechanic 50%,
  farmer 43% — both pass; the bar binds against a
  lever that starves the fit duty, and it would NOT
  have caught dangerfit's failure.
- DEATH-TRUNCATION bar (fate, not rate), either clause
  suffices: (i) the holder is alive at run end, OR
  (ii) within 14 days after the holder's death, the
  village records delegate picks of the skill on at
  least half the days (backup coverage exists in fact,
  not in roster). Measured on the failure: 0/51 days
  after death — fails by the widest possible margin;
  measured on the farmer: alive — passes.
- SEND-TIME bar (the structural guard this census
  points to): a sole-provider holder (provider count
  == 1 for their fit skill at send time) is NEVER
  sent on a danger-first branch. Measured exposure:
  1/16 instrument seeds would have been gated by this
  bar (85111); no other seed in the band has a
  sole-provider holder to gate (other holders' skills
  are backed, or they hold no fit skill, or the seed
  has no holders). Cost of the bar is therefore small
  and precisely bounded, and its benefit is exactly
  the avoided 51-day truncation.
- What NOT to build on this evidence: an HP-gated
  retreat for sole specialists. RETREAT-80 saves 0/1
  sole deaths; the sole fatal HP (94) sits above every
  defensible "wounded" threshold, and the mechanic's
  HP trajectory rises into the fatal patrol. If a
  future arm still wants a health gate, it must be
  justified on the NON-sole deaths (3/5 saved at
  HP < 80), labeled as such, and never presented as
  sole-specialist protection.

## Wall numbers (full band, 16 seeds per leg, labeled)

Baseline leg: national 10/16, table 11/16, wins 11/16,
wave 4 reached 14/16, wave 5 0/16, median survival
94d, max 201d.
Instrument leg: national 12/16, table 12/16, wins
12/16, wave 4 reached 15/16, wave 5 0/16, median
survival 90.5d, max 191d.
Pilot-only (8 seeds) for comparability with dangerfit:
baseline national 5/8, table 6/8, wins 6/8, wave 4
7/8, wave 5 0/8, median 97d; instrument national 7/8,
table 7/8, wins 7/8, wave 4 8/8, wave 5 0/8, median
90d. The instrument's national/win upticks ride on
trajectory divergence (as dangerfit already declared
for the pilot) and are NOT judged as lever efficacy —
there is no lever in this arm. Arc II/III/IV reach,
four-realm formation, trap acquisition by source,
counter discovery/counter-kill rates, and young-link
succession survival are NOT instrumented in this
substrate and are NOT reported.

## Convergence state

converging — the scale-onramp axis measurement: the
sole-specialist mortality question is now CENSUSED
(16 seeds × 2 legs, 64 coverage cells, every
sole-specialist patrol death classified, truncation
quantified, RETREAT-80 counted at 0/1). The census
locates the protection gap exactly: HP gating misses
the sole case; only structural coverage (a second
provider, or never sending a sole provider) addresses
it. The DIAG-NO-GO is on the sense-read quota (bar 8),
not on the census — the next BUILD arm has everything
it needs, including numeric bars, and does not need
to re-measure mortality first.

## Infrastructure notes (loud, not hidden)

- EPERM flap (active at spawn, worsened mid-run):
  safe-commit.sh failed ~9 times on /tmp index-lock
  writes, then succeeded; the worktree-index probe
  also EPERM'd, so the flap was not /tmp-specific.
  Small writes (5 bytes) succeeded 5/5 while large
  writes (1.2–3.2 MB per-seed JSONs) failed 12/12
  through the node splitter — consistent with a
  per-write-call failure rate that large writes
  almost always trip. Workaround that worked: a
  chunked python writer (4 KB chunks, per-chunk retry
  up to 2000 tries, fsync) split all four legs' corpora
  completely; the first leg's split took several
  minutes of retries, later legs seconds once the
  flap eased.
  The chunked splitter was a one-off transport fix
  run from stdin, NOT a committed file — future arms
  that hit the same wall should reuse the pattern
  rather than re-running the node splitter blind.
  One casualty: a 0-byte s85111.json left by a failed
  node write was deleted and re-split cleanly; no
  judged corpus was ever read from a truncated file
  (all 32 per-seed JSONs JSON-parse clean, verified
  before analysis).
- safe-commit.sh index clobber (known class,
  AGENTS.md): after BOTH the prereg commit and the
  tooling commit, the worktree index showed the
  just-committed files as staged deletions (commits
  themselves correct, HEAD blobs == worktree hashes).
  Repaired both times with git update-index --add
  --cacheinfo to the HEAD blob, verified with git
  status empty + git diff HEAD empty. Final state
  verified the same way (see §Files).
- Instrument revert discipline: the dangerfit block
  was applied, diff-verified (14 insertions, nothing
  else), run, and reverted with git checkout HEAD --
  delegate.js, then hash-verified (1e68718d8) — twice,
  once per round. At no point did a commit include
  delegate.js in instrumented state.
- Runner timing: baseline legs ~2.5 min (pilot) /
  ~8.7 min (confirm); instrument legs ~8 min (pilot)
  / ~11.3 min (confirm). Total judged compute ~30 min
  across four legs; the rest of the run is flap
  retries, analysis, and evidence.

## Metric review (for the NEXT run, never a re-score of this one)

1. Bar 8's "at least 2 sole-specialist patrol deaths"
   presupposed a death count the band does not
   contain (1 in 16 instrument seeds). A future DIAG
   prereg on a rare event should set the sense-read
   bar as "every sole-specialist patrol death in the
   band, plus one surviving holder's patrol" (a
   completeness bar over what exists), not a fixed
   count — or run a band large enough to expect ≥2
   (at 1/16, that means ~32+ instrument seeds).
   This run's verdict stands as written; the review
   item is for the next prereg's wording only.
2. The sole-provider definition (run-wide delegate
   picks) conflates two shapes the next arm should
   separate: sole-from-the-start (mechanic: only
   provider all run) vs sole-by-attrition (85108
   cook: two providers, both gone by day 45). Both
   truncate; only the first is visible at send time.
   A send-time guard needs the first; a coverage
   monitor needs the second.
3. The delegate-channel limit matters more than this
   run's tables show: "zero delegate picks" is not
   "zero cooking/mending." A future census that wants
   to claim real economic truncation (not channel
   truncation) needs a self-directed-work instrument
   alongside the delegate recorder, or it must keep
   the channel qualifier this evidence carries.
4. RETREAT-80's kept-home-that-day counting is the
   honest log-based proxy, but it understates a live
   rule's effect (a live rule diverges the trajectory
   and might save the holder by a different path) and
   overstates it in the other direction (a holder kept
   home one day can die the next patrol). Both limits
   are stated in the prereg and above; a BUILD arm
   must measure a live rule on its own legs, never
   quote 0/1 or 3/5 as live-rule efficacy.

## Files

- Pre-registration: evidence/2026-10-31/sim-soleprotect-a-prereg.md
- Evidence: evidence/2026-10-31/sim-soleprotect-a.md (this file)
- Analyzer: scripts/soleprotect-analyze-20261031.js
- Proof: scripts/test-soleprotect-20261031.js
- Baseline pilot corpus: evidence/2026-10-31/perseed-soleprotect-a-base-pilot/ (8 seeds)
- Instrument pilot corpus: evidence/2026-10-31/perseed-soleprotect-a-instrument-pilot/ (8 seeds)
- Baseline confirm corpus: evidence/2026-10-31/perseed-soleprotect-a-base-confirm/ (8 seeds)
- Instrument confirm corpus: evidence/2026-10-31/perseed-soleprotect-a-instrument-confirm/ (8 seeds)
- Pilot tables: evidence/2026-10-31/sim-soleprotect-a-base-pilot-table.json, sim-soleprotect-a-instrument-pilot-table.json
- Confirm tables: evidence/2026-10-31/sim-soleprotect-a-base-confirm-table.json, sim-soleprotect-a-instrument-confirm-table.json
- Sweep logs: evidence/2026-10-31/sim-soleprotect-a-{base,instrument}-{pilot,confirm}.{stdout,stderr}.log
- Reverted (no trace): scripts/policies/delegate.js instrument block (applied twice, reverted twice, hash-verified)
- Reused, unmodified: scripts/patrolsilent-diag-20261031.js (v2), scripts/dangerfit-runner-20261031.js, scripts/dangerfit-split-20261031.js, and the full S-PATROL policy stack
