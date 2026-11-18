# sim-triodrought-b — BUILD evidence (finding #2518: the trio launch drought)

**Arm:** sim-triodrought-b · **Loop B run:** fleshout-loop-b-20261118T0130Z
**Type:** BUILD — restore the dawn-commit carry of the second companion.
**Prereg:** `evidence/2026-11-18/sim-triodrought-b-prereg.md`
(frozen 2026-11-18 ~09:35 UTC, BEFORE the pilot sweep; one pre-pilot
correction ~09:45 UTC refined the diagnosis counts from a part-0-only
join to the analyzer's commit-part join — same conclusion, full coverage).
**Branch tip:** `sim-triodrought-b` (this arm's work below that tip).
**Builds on:** `evidence/2026-11-18/sim-launchparty-b.md` (finding #2518)
and its frozen corpora, plus the frozen allycap corpora (band 103601–103608).

## Verdict: GO — the drought is fixed at its root, the bar is met with room

| Check | Result |
| --- | --- |
| Primary: trio-launch rate (arm ≥ 50% AND arm−ctl ≥ +30pp) | **PASS** — arm 22/25 = 0.88, ctl 0/18 = 0.00 (+88pp) |
| Pool floor (≥6 wave-4+ launches per leg) | **MET** — ctl 18, arm 25 |
| Secondary: carry rate (candidate c2 → depart c2) | arm 22/22 = 1.00, ctl 0/17 = 0.00 |
| Secondary: companion-slot fill at launch | ctl 17 companions / 18 launches; arm 45 / 25 |
| Cost bar: starvation (arm ≤ ctl+2) | **PASS** — totals arm 0 vs ctl 1; villager arm 0 vs ctl 0 |
| Cost bar: median survival (arm ≥ 0.8× ctl) | **PASS** — arm 150d vs ctl 150d |
| Proof green | **PASS** — `scripts/test-triodrought-b.js` 12/12 |
| Analyzer selftest green | **PASS** — `scripts/analyze-triodrought-b.js --selftest` 13/13 |
| Instrument | **CLEAN** — 0 instrument errors on all 16 per-seed files |
| Leg integrity | ctl `brainSha bff4cb2fff2c` ×8, `carryPresent: false` ×8; arm `brainSha 242942a034cc` ×8, `carryPresent: true` ×8 |

## The fix (2 lines, decided from the code)

`writeCommit` (`src/js/villager-brain.js`) now carries the second and
third companion into the stored dawn commit, next to `companion:`:

```js
companion2: chosen.companion2 || null,
companion3: chosen.companion3 || null,
```

Exactly the lines the producergate revert (`72a6efc99`, 2026-11-15, 41
seconds after the build commit `656f4fc3b`) removed. NOT restored:
producergate's `needsFull` / `party_wait` gate (a pair still launches
when no second companion exists, per the vetreengage design), the old
second-ranger pick (vetreengage's wider `winPlanSecondCompanion`
stands), or any env flag. The carry is inert unless a candidate sets
the field: `companion2` is set only by the VETREENGAGE-gated win-plan
candidate, and `companion3` is set by no candidate in `src/js` on this
tip. No default changes; no behavior change for any other candidate
kind. The proof test now runs the full chain the vetreengage test never
did — scoring → `writeCommit` → stored commit → execute — and fails 5
checks on pre-fix code (candidate carries c2, commit drops it, pair
launch), passing 12/12 with the fix.

## Pilot numbers (8 seeds/leg, band 104011–104018, 150d, competent verbatim)

Substrate both legs: `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`,
`FIGHTALLY2` unset. Legs differ ONLY by code: ctl ran with the carry
reverted in the worktree file, arm with it present (the driver refuses
to run if MODE and the code on disk disagree). `anchorCommit` reads
`f962d1dd3` on BOTH legs because HEAD contains the fix commit — the
honest leg discriminator is `brainSha` / `carryPresent` on each corpus
file (table above).

| | ctl | arm |
| --- | --- | --- |
| Wave-4+ launches | 18 | 25 |
| Trio launches (partySize ≥ 3) | 0 | 22 |
| Trio rate | 0.00 | 0.88 |
| Launch sizes | 1×1, 2×17 | 1×2, 2×1, 3×22 |
| Candidate carried c2 | 17 | 22 |
| Depart carried c2 (carry rate) | 0 (0.00) | 22 (1.00) |
| Genuine pick misses (candidate c2 null) | 1 | 3 |
| Starvation deaths (total / villager) | 1 / 0 | 0 / 0 |
| Median survival | 150d | 150d |
| Villages survived | 7/8 | 6/8 |
| Max wave reached | 5 (2 seeds) | 5 (3 seeds) |
| Wins | 0 | 0 |

Per-seed launches (size:count) — ctl: 104011 2:2, 104013 2:3, 104014
2:6, 104016 2:3, 104017 1:1 + 2:3; arm: 104011 3:3, 104013 1:2 + 3:1,
104014 3:6, 104016 3:5, 104017 2:1 + 3:7. Seeds 104012, 104015,
104018 launched no wave-4 plan on either leg (they reached wave 5 /
standing 405–545 by other paths, or never launched one).

## Autopsy, launch by launch (why the numbers are what they are)

**The mechanism check is exact.** Every launch where the authorizing
candidate carried a second companion departed as a trio on the arm
(22/22) and as a pair on the ctl (0/17). Every launch where the
candidate carried none departed short on both legs (ctl 1 solo, arm
2 solo + 1 pair). There are no unexplained launches and no unjoined
launches (0 on both legs) — the join covers all 43.

**The 3 arm non-trios are genuine pick misses, not carry failures.**
104013 d99 + d102 (sofia_chen, mid-day re-scores) and 104017 d139
(app_mgpsphje328): the candidate itself had `companion2: null` — the
pool was empty at scoring (sick/range unrecorded, as in the frozen
data). The fix cannot conjure a companion who is not there; it only
stops dropping the one who was picked. The residual pick-miss rate is
3/25 on this band.

**The ctl solo launch shows the drop cascading.** 104017 d93
(tom_baker): the candidate carried `gen_3tw7t6k` as c2, the commit
dropped it, AND the first companion was blocked at execute
(COMPANIONGUARD) — so the holder walked out alone. On the arm the same
shape cannot happen through the commit: a picked second companion is
in the commit and launches unless blocked at the expedition itself.

**The arm launched more wave-4 plans (25 vs 18).** Downstream of the
trios, not a separate effect: villages that launch trios keep their
holders alive to re-launch (104014 arm: standing 500, wave 5, vs ctl
standing 199, wave 4). Reported, not judged — the primary is the trio
rate, and the pool floor is met on both legs without it.

**The fix is inert where no trio is picked.** On the three seeds with
no wave-4 launch on either leg (104012, 104015, 104018), every game
field in the corpora is identical across legs except the recorder's
monotonic `seq` counter (arm runs +2 — a recorder numbering offset,
not a game difference). The carry adds no RNG and touches no other
candidate kind; the proof test's off-mode leg (VETREENGAGE unset →
pair launch) says the same thing in miniature.

## What this does NOT settle

- **The launchparty confirm still needs the sense fix.** This pilot
  judges the trio LAUNCH, not the launched-meeting arrival the LP
  prereg judged. A confirm of the LP sense fix needs this fix + the
  sense fix together (coordinator call); the LP subset metric is not
  re-judged here.
- **`partyTrios` is still a broken counter.** It reads 0 on BOTH legs
  despite 22 arm trios, because only the win-plan depart path bumps
  it and that path fired 0 times on this band (all 43 launches came
  via the brain path). Trio counts must come from `v4departs`
  partySize / companion2, never from `partyTrios`, until the counter
  is fixed or retired — named here for the next arm, not fixed here.
- **The win-plan depart path fired 0 times again** (all launches via
  the brain path, as on the LP band). Its launch-time re-pick of the
  second companion is live code with no measured exercise on either
  band — recorded, not judged.
- **Wins are still 0/16.** Trios launch; the win chain beyond the
  launch (wave-4 kills → veterans → wave 5 → seat) is untouched by
  this arm.
- **The d135-class genuine pick miss** (candidate c2 null with pool
  upper bound 1) recurs as 3/25 here. Sick/range at scoring is the
  unmeasured remainder; a recorder that captures sick + range at the
  pick would settle it.

## Village assessment (plain words)

Eight villages, eight fates, paired. On the control leg the
second companion was picked 17 times and arrived 0 times — every
wave-4 plan walked out short, one holder walked out alone. With the
carry restored, the same villages picked a second companion 22 times
and all 22 walked out as trios. Two villages (104011, 104014) climbed
higher with trios behind them; the rest lived or died on the same days
as their twins. Nobody starved extra for it, nobody died sooner for
it, and no village won either way — the launch is fixed, the road
after it is still the same road.
