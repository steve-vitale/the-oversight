# sim-arrearsscreen-a — SCREENED ARREARS BAND (Loop A 20261102T0725Z, axis scale-onramp)

Run: fleshout-loop-a-20261102T0725Z, arm sim-arrearsscreen-a, axis scale-onramp.
Worktree branch: sim-arrearsscreen-a. POLICY/INSTRUMENT-SIDE ONLY — zero
`src/js` changes. Prereg committed BEFORE any judged sim (79b78820);
instrument committed before the sweep (14038b1c). Sibling Loop B
trees/branches NOT touched. No titan canon doc exists in docs/ —
stated, none invented (same finding as the 0445Z and 0605Z rounds;
in-code source is `src/js/titans.js` + `src/js/hierarchy.js`).

## Verdict: UNDER-POWERED for waiting (screen yield 0/24) — NOT a kill of the arrears finding

Validator `scripts/test-arrearsscreen-a.js`: rows 24/24, blocked 0,
exit 2 (UNDER-POWERED by design — see below). Unit proof
`scripts/test-arrearsscreen-classify.js`: 16/16. Bars (a) and (b)
pass; bar (c) is VACUOUS (fewer than 3 blocked seeds, so no
waiting leg runs and none is claimed); bars (d)–(f) pass. The
screening yield itself is the verdict: on this fresh band, the
block the waiting pilot needs does not occur — not because
arrears are absent (11/24 seeds carry arrears somewhere on the
census), but because herald contact is the rare event (1/24
seeds attempt at all). The sim-arrears-a diagnosis stands on its
own band: Haven-primary old debt never clears, with no
back-payment verb. What this screen kills is the "just run more
fresh bands" route to a waiting pilot, not the arrears finding.

## The answer in one paragraph (plain words)

A village that owes tribute usually never gets asked to join a
muster at all. On 24 fresh villages, 23 never even attempted the
herald call — no attempt, no refusal, no block to wait out. The
one village that did attempt was already ready (11 fighters
against a need of 10), even though one of its fires owed 2,250
and refused: the other fires covered it. So there is nothing
here for a waiting pilot to wait on. Arrears are not rare in the
world — 11 of the 24 villages owed something at some point, one
as much as 111,250 — but the call that would expose the debt as
a block almost never happens on an unselected band. The waiting
question needs villages chosen because they actually attempt the
call and actually owe — or an answer to why the call so rarely
happens — not another fresh band.

## Method (what was actually run)

Frozen route stack (tribfloor leadfeast + windefer + seatdrive +
fullseat-diag, herald-v1 + muster-diag recorders;
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1; DAYS=180 death-aware cap). At every
refused herald attempt (instrument cls REFUSED + same-day
muster-diag snapshot, route strictness), the interceptor computed
the DEPLOYED `Game.titanCallReadiness('herald')` and recorded one
check row (per-link village/direction/trust/opinion/arrears/
quota/contribution/wouldRefuse, alliesProj, havenProj, total,
ready). NO call was ever sounded, committed, or stood down — the
screen is observation only, so no −8 refusal penalty perturbs
any timeline. A daily census (read-only link fields,
arrears-trace pattern) backs the waiting leg and the census-arrears
context. The screen timeline includes readiness calls at refused
attempts, exactly as the route pilot's did; the census never
calls readiness mid-run.

Corpus: evidence/2026-11-02/perseed-arrearsscreen-a/
(screen-s<seed>.json × 24, sweep.stdout, sweep.stderr).
Instrument: scripts/arrearsscreen-replay-20261102.js,
scripts/arrearsscreen-split-20261102.js,
scripts/arrearsscreen-classify-20261102.js. Validators:
scripts/test-arrearsscreen-classify.js (16/16),
scripts/test-arrearsscreen-a.js (exit 2 = under-powered, by
design — see Verdict).

## Screening yield (primary metric: blocked / 24)

Blocked seeds: 0/24. Blocked at first check: 0/24.
Seed classes: ready-at-first-check 1, no-herald-attempt 23,
arrears-blocked 0, blocked-other 0, no-check 0.

### Per-seed table

"ArrEver" = census ever showed arrears > 0 on any link row that
day (see caveat below). "ArrDays" = days with any arrears > 0.
"MaxArr" = largest arrears value seen on any census day.

| Seed | Class | Att | Chk | First check | ArrEver | MaxArr | ArrDays | Nat | Table | Won | W4 | W5 | Days | End |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 97301 | ready-at-first-check | 4 | 4 | day 78, ready | yes | 2,250 | 14 | 1 | 1 | 1 | 1 | 0 | 91 | over-other |
| 97302 | no-herald-attempt | 0 | 0 | — | yes | 8,000 | 41 | 0 | 1 | 1 | 1 | 0 | 90 | over-other |
| 97303 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 84 | village-lost |
| 97304 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 89 | village-lost |
| 97305 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 0 | 1 | 1 | 1 | 0 | 92 | over-other |
| 97306 | no-herald-attempt | 0 | 0 | — | yes | 8,000 | 40 | 0 | 1 | 1 | 0 | 0 | 90 | over-other |
| 97307 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 1 | 1 | 1 | 0 | 152 | over-other |
| 97308 | no-herald-attempt | 0 | 0 | — | yes | 111,250 | 74 | 1 | 1 | 1 | 0 | 0 | 109 | over-other |
| 97309 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 77 | village-lost |
| 97310 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 1 | 1 | 1 | 0 | 90 | over-other |
| 97311 | no-herald-attempt | 0 | 0 | — | yes | 4,000 | 6 | 0 | 1 | 1 | 0 | 0 | 90 | over-other |
| 97312 | no-herald-attempt | 0 | 0 | — | yes | 4,416 | 10 | 1 | 1 | 1 | 1 | 0 | 108 | over-other |
| 97313 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 128 | over-other |
| 97314 | no-herald-attempt | 0 | 0 | — | yes | 2,250 | 13 | 1 | 1 | 1 | 1 | 0 | 90 | over-other |
| 97315 | no-herald-attempt | 0 | 0 | — | yes | 30,479 | 73 | 0 | 1 | 1 | 0 | 0 | 108 | over-other |
| 97316 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 90 | over-other |
| 97317 | no-herald-attempt | 0 | 0 | — | yes | 97,500 | 73 | 0 | 1 | 1 | 1 | 0 | 108 | over-other |
| 97318 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 1 | 1 | 1 | 0 | 90 | over-other |
| 97319 | no-herald-attempt | 0 | 0 | — | yes | 13,929 | 48 | 0 | 1 | 1 | 0 | 0 | 90 | over-other |
| 97320 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 150 | over-other |
| 97321 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 152 | over-other |
| 97322 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 82 | village-lost |
| 97323 | no-herald-attempt | 0 | 0 | — | no | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 30 | village-lost |
| 97324 | no-herald-attempt | 0 | 0 | — | yes | 11,000 | 29 | 0 | 0 | 0 | 0 | 0 | 141 | village-lost |

CAVEAT on the census-arrears columns (stated, not buried): the
corpus retains the census summary (arrearsEver / maxArrearsSeen /
arrearsDays) but NOT per-day link rows for unblocked seeds — the
instrument emitted full daily census rows only into the
blocked-link waiting series, and there are no blocked links. So
"arrears existed somewhere" is corpus-proven, but which link
(direction, village) carried it on a no-attempt seed is NOT in
the corpus and is not claimed here. The 97308 reading below is a
reading of a transcript line, labeled as such. A future screen
should retain arrears-day link rows for every seed (see Metric
review). This caveat does not touch the verdict: the verdict
rests on check rows, which are complete.

### The one contacted seed (97301) in full — a near-miss, correctly excluded

Attempts (all reason MUSTER-GATE, caller wild-contact, matching
the route finding): days 78 × 3, 89 × 1. Check rows:

| Day | Total | Allies | Haven | Ready | Links (direction / trust / opinion / arrears / quota / contrib / refuse) |
|---|---|---|---|---|---|
| 78 | 11 | 8 | 3 | true | Thornfield Haven-primary 88/15/0/6/6/no; Ashford Haven-primary 56/11/2250/2/0/YES; Emberhold Haven-primary 41/7/0/2/2/no |
| 78 | 11 | 8 | 3 | true | (identical to above — three same-day attempts, same row) |
| 78 | 11 | 8 | 3 | true | (identical to above) |
| 89 | 11 | 8 | 3 | true | Thornfield 88/17/0/6/6/no; Ashford 61/9/2250/2/0/YES; Emberhold 42/9/0/2/2/no |

Ashford IS a solely-arrears refuser (trust 56 ≥ 25, opinion 11 ≥
−10, arrears 2,250 > 0) — but the row is READY (11 ≥ need 10),
so by the frozen definition it is NOT a block: the muster could
sound and succeed without Ashford. The deferral machine (route
arm) starts only on a block, so 97301 is NOT usable for a
waiting pilot either. Counting honestly: contacted seeds 1/24;
solely-arrears refusers at contact 1/1; arrears-only BLOCKS at
contact 0/1. Across all unselected bands so far (route 4/16
contacted, this screen 1/24): contact 5/40, blocks among
contacted 0/5. No block rate can be estimated from 0/5 — that
is why the verdict is under-powered, not a rate claim.

## Waiting leg: VACUOUS (not run, not passed, not failed)

Fewer than 3 blocked seeds were found (0), so per the prereg
the waiting leg does not run and no waiting trajectory is
claimed. There are no waitingSeries in the corpus because there
are no blocked links to follow — the validator confirms this
shape rather than failing on it. Nothing in this run says
waiting fails or succeeds: no village ever waited, because no
village was ever blocked. The sim-arrears-a waiting observation
(never clears on its own band) is untouched by this screen.

## Sense-test: VACUOUS for blocked links (stated, not faked)

There is no blocked link, so there is no transcript line
bearing on a blocked link to quote, and quoting a routine line
would be fabrication (the route arm's `/waits/` capture flaw,
avoided here by anchoring capture to arrears/tribute/debt
vocabulary). Two context lines, explicitly NOT a sense pass,
are recorded because they bear on the screen's real story —
arrears existing without herald contact:

- 97308 (no herald attempt; census max arrears 111,250 over 74
  days): "⚠️ Emberhold notices the missing tribute. Arrears:
  10,000 kcal. The air changes." (day 42; the same line recurs
  at 21,250 on day 49, 43,750 on day 63, 77,500 on day 84 —
  arrears compounding while no call ever comes). Reading, not
  corpus verdict: the "notices the missing tribute" line is the
  hierarchy.js Haven-subordinate branch (Haven owes Emberhold),
  which suggests this seed's big arrears are the payable kind
  (payTribute zeroes) — but the corpus does not retain the
  link direction, so this is a line reading, not a measured
  direction classification.
- 97301 Ashford (the near-miss refuser): waiver lines on days
  35/42/49 — "Tribute wagons from Ashford turn at the gate —
  our shelves are full past tomorrow. 'Eat well,' we send back.
  'That IS your tribute this week.' (Trust +1.)" — while
  Ashford still owes 2,250 at both check days. Same honesty gap
  as sim-arrears-a: waivers read as forgiveness while the debt
  stands and still refuses the call (here without blocking,
  because the total clears need anyway).

## Wall metrics (this band only, never pooled)

National(end) 13/24, table 20/24, won 18/24, wave-4 12/24,
wave-5 1/24 (97309 — the band's one wave-5 reach, on a
village-lost run), median survival 90d, max 152d, ends
over-other 18 / village-lost 6. Deaths 696 total: combat 289,
villager combat 206, the wild 74, expedition 28, a wound that
wouldn't close 18, ambush 15, sickness 14, starvation 13, the
arena 6, the phoenix link 9, monster 7, lockjaw 3, the night 2,
a stranger 2, alien 2, contest 2, singletons (Anaconda Empress,
Glasswing Darter, heron, Heckler, Hushpuppy, the expedition) 6.
No new death shape is claimed — the screen sounds nothing, so
no survival comparison is attributable to anything here.
Observation (not a mechanism claim): 8 seeds end at exactly
90d over-other — the same 90d end seen in the route pilots and
the arrears-a band, consistent with a game end condition, not
with this replay (same DAYS=180, same stack as those runs).

## GO bars — judged as written

(a) SWEEP COMPLETE: PASS — recorder rows or a named class on
    24/24 seeds (need ≥ 22).
(b) CLASSIFICATION COMPLETE: PASS — 0 blocked seeds to classify
    by direction (vacuous for the blocked set, and the validator
    confirms the shape); the 1 contacted seed is fully
    classified with numbers; all 23 no-attempt seeds carry the
    named class, not a null.
(c) WAITING LEG: VACUOUS — 0 blocked < 3. Reported as vacuous,
    never cited as a pass.
(d) PROOF GREEN: PASS — classifier unit 16/16, syntax checks on
    all 5 new scripts, corpus validator runs (exit 2 is its
    designed under-powered signal, not a test failure).
(e) ZERO src/js CHANGES: PASS — branch commits touch only
    evidence/ + scripts/ (verified by commit file lists at
    evidence time; no src/ path in either new commit).
(f) WALL NUMBERS: PASS — reported above, this band only.

## Findings for the coordinator (not chased mid-run)

1. FRESH-BAND SCREENING IS THE WRONG SPEND for the waiting
   pilot. Three unselected bands now (route 971xx, 972xx, this
   973xx) give 0 blocked in 40 seeds, with contact itself at
   5/40. A fourth fresh band is not the next move.
2. THE NEXT MOVE IS SELECTION OR CONTACT, NOT MORE FRESH SEEDS:
   either (i) screen a SELECTED band — seeds pre-qualified for
   herald contact (e.g. re-derive the 0445Z screen's selection:
   long survivors chosen for herald reachability) AND for
   census arrears, then run the waiting pilot there; or
   (ii) investigate why herald contact is so rare (only
   wild-contact MUSTER-GATE attempts appear; 23/24 seeds never
   attempt, including 150–152d survivors and winners) — the
   binding constraint on unselected bands is contact, not debt.
3. INSTRUMENT FIX FOR THE NEXT SCREEN: retain per-day link
   rows (direction/village/status) on every census day where
   any link carries arrears > 0, not just the summary — the
   current corpus cannot attribute census arrears to a link on
   no-attempt seeds (see caveat above).
4. 97301 IS NOT A WAITING-PILOT SEED (ready despite its
   arrears refuser) — do not let the near-miss be misread as a
   block. Its value is as the existence proof that
   solely-arrears refusers do appear at contact; they just
   need a total below need to become a block.

## Infrastructure notes (loud, per run discipline)

- Index clobber (known class) struck BOTH new commits (prereg
  79b78820, instrument 14038b1c): after each correct commit
  the main index showed the committed files as deleted +
  untracked. Repaired both times via HEAD-blob
  `git update-index --add --cacheinfo`; `git status --short`
  empty + `git diff HEAD` empty verified before any sim ran
  (prereg) and before the sweep (instrument).
- No EPERM flap on this run: the evidence/ redirect for the
  full 24-seed sweep succeeded first try (410,761 bytes stdout).
- check.js NOT run: zero `src/js` changes, new files are not on
  the green list, and concurrent jest is forbidden while
  sibling loops run. Proof rests on: syntax checks (5/5),
  classifier unit 16/16, corpus validator on the full band,
  and the 97301 pipe proof (4 check rows from a live run).

## Metric review (for the NEXT run, never this verdict)

- The validator's exit-2 UNDER-POWERED signal worked as
  designed (bars (a)(b) pass + blocked < 3 → exit 2, not a
  failure). Keep it.
- The prereg's bar (b) wording ("every blocked seed
  classified") is vacuous at 0 blocked; the evidence applies
  it as "every seed classified, blocked set empty" — a future
  prereg should write the vacuous case into the bar itself.
- Census-arrears summary without link attribution (see caveat)
  should not have been the emitted shape: the next screen's
  prereg should require arrears-day link rows in the corpus,
  so "arrears exist but no contact" can be attributed by
  direction.
- No metric was re-scored mid-run. The 0/24 yield is reported
  as under-powered for waiting, exactly as the prereg's
  under-powered rule prescribes — not as NO-GO-by-effect and
  not as a kill of the arrears diagnosis.

## Convergence state

scale-onramp stays converging (NOT converged): the waiting
question is still unanswered in sim (untested, not refuted),
and the arrears-route question now carries a second, sharper
caveat — on unselected bands the binding constraint is herald
contact (5/40), not arrears scarcity (11/24 carry arrears).
The next move on this axis is a selected band or a contact
investigation, not another fresh band and not a confirm on
this rule.

## Commits (this worktree branch sim-arrearsscreen-a; coordinator merges)

- Prereg: 79b7882006ee95cc7da4ca749b80601cdcb5fc13
- Instrument: 14038b1ca8b137dc7efae862ff91c65d58927d23
- Evidence + corpus: this commit (hash recorded in the worker's
  final report to the coordinator)
- No src/js touched. No push, no bump, no live verification.
  Report: ready for coordinator merge, pending ship.
