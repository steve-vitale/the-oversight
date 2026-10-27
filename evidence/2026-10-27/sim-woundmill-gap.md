# sim-woundmill-gap — Triage A1, wound-mill meet-finish (Steve's 2026-10-27 ruling)

Gap-closure worker: gap-woundmill. Branch: gap-woundmill. Base: worktree HEAD
at run start (see Results for the exact commit).

Plain-words summary (to be completed with results): Steve ruled that a
defender who MEETS a crippled beast should weigh the risk of the moment
and finish it only if the village can afford the fight. This is NOT the
killed Stage-2 defender-finish rule, and it does NOT bring it back. The
Stage-2 rule finished beasts the defender's own fight dropped below the
break line; it was proven to work and then killed because it cost lives
(deaths 234 to 316, wins 4 to 3 on its band, game code reverted). This
item is the narrower MEET rule only: a beast the defender meets already
crippled — wounded by someone else, still circling months later, met
over and over in fights that end before a single blow. The earlier
papers priced that leftover mill: on the woundprice base, 196 defender
fights started against an already-crippled beast, all ending in a
zero-round shrug, with 674 phantom re-meets and zero villager finishes.

## 1. STILL-OPEN VERIFICATION (before any new code)

- The Stage-2 game code stays reverted: `resolveWildMonsterEncounter`
  in `src/js/game.js` passes only `{ allies, allyVids }` to `fieldFight`
  — no raid flag is forwarded, so `fieldFights.js` has no meet/finish
  path at all. Checked by reading the call site, not by memory.
- No live meet-finish rule exists anywhere: a defender fight that
  starts below the break line ends rounds-0 `mFlee` today (the volley
  break check and the in-round break check in `fieldFights.js`).
  The decision-pack entry for this item was UNRULED until Steve's
  2026-10-27 ruling; the ruling is the only authority for this rule.
- Canon read first: `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave
  law; wave-3+ gating is kills-only and untouched here), `docs/DIRECTIVES.md`.
  No canon doc covers defender finishing — the wound line and risk
  weights below are this run's documented design call under Steve's
  ruling, not canon invented from scratch.

## 2. PRE-REGISTRATION (binding — judged only against this)

Written BEFORE any sim ran. A miss on any leg below is NO-GO: the
rule is reverted, record only lands, no bar is re-scored against a
friendlier metric mid-run. Metric doubts go in §7 (metric review)
for the NEXT run.

Substrate (both arms, identical): tableseat-nowait
(LEANLINKRESCUE=1 + TABLESEATNOWAIT=1) wrapped with the four
defwound recorders (raftdraft, spawnsrc, oldcore, defwound-diag),
reused VERBATIM. Seeds 73671–73678, 180-day death-aware horizon
(runDays stops on death/win; 180 is the cap, not a fixed horizon).
Control = a FRESH control sweep on current worktree code BEFORE the
rule lands — never the 1815 band (deaths 234), never the woundprice
band (deaths 336). Base drift since those bands is exactly why the
control is re-run. Armed = the same sweep AFTER the rule lands.
Recorder neutrality is proven by the sweep's --detgate mode on
seed 73671 (recorders OFF must match the plain run on
days/gameDays/ts, with no recorder surface).

Definitions (same as the defwound/woundprice papers): a defender
fight is a resolve row with `opts.raid`. The break line is 0.25 for
wave 1 and 0.15 for wave 2+. A MET fight starts below the break
line (start fraction < break line). A meet-finish is a MET defender
fight ending `vKill`. A phantom is a MET fight ending rounds-0
`mFlee`.

THE RULE (as pre-registered — the design, before measurement):
when a raid defender meets a beast already below the break line,
the defender finishes it ONLY if every leg of the risk weighing
holds. If any leg fails, the fight ends exactly as today
(rounds-0 `mFlee`, no change). If all legs hold, the defender
commits to a real blow-by-blow fight — the break-line flee is
suppressed for that fight only, and the fight is decided by real
rounds (it may end `vKill`, `vFlee`, `vDie`, or at the round cap).
Nothing is scripted: a committed fight is never a guaranteed kill.

- Wound line ("cripple line"): the beast starts at or below 10%
  of its max health (start fraction ≤ 0.10). This is stricter
  than the break line: a beast at 20% is wounded, not crippled,
  and is left alone.
- Defender health: the defender starts at or above 75% of max
  health. A hurt defender does not take on even a crippled beast.
- Defender armed: the defender's weapon bonus is above zero
  (melee + ranged folded, the fight's own measure). An unarmed
  defender does not finish.
- Numbers: the beast comes alone (pack size 1). A crippled lead
  with fresh pack mates behind it is not an affordable finish.
  Allies beside the defender are upside, not a requirement.
- Worst hit: the beast's hardest single hit (its damage range
  top) is at most half the defender's current health. The
  defender can survive at least two worst hits. This is the
  slope that keeps wave-4/5 teeth mostly unaffordable.
- Haven closeness: raid scope only. Raid defenders fight at the
  Haven door, where help is near. Field meetings (non-raid) are
  untouched — a field met-finish is a larger rule and out of
  scope here. The aid path (aidFight) is untouched, and beasts
  dropped below the line DURING a fight (Stage-2 scope) are
  untouched — the gate reads the PRE-fight fraction only.

LOOT / LEDGER SCALE (named, modest): a meet-finish that ends
`vKill` goes through the EXISTING villager-kill path and nothing
else — no bonus, no discount. One wave-ledger point (two if the
counter is already known, the existing convention), a corpse and
its carcass meat as normal, the standard villager kill loot roll,
+4 trust, a `fight_won` deed. A finished beast IS a kill with a
ledger entry; the modesty is that nothing extra is invented for it.

PRIMARY (mechanism — must pass):
- P1: meet-finishes (MET defender fights ending `vKill`) ≥ 5
  band-wide in the armed sweep, on ≥ 2 seeds.
- P2: MET defender fights ending `mFlee` DOWN vs the fresh
  control (fewer phantoms — the mill shrinks, not just relabels).

COST GUARDS (all required — the Stage-2 lesson is the point):
- G1: mixed death total (summed `deathTotal`) ≤ control + 10%.
- G2: wins ≥ control wins.
- G3: defender `vDie` ≤ control `vDie` + 3.

PROOF GATES (mechanism, unit level — must all pass):
- M1: a gate-passing met fight commits to real rounds (rounds
  > 0) instead of the rounds-0 shrug.
- M2: each gate leg, failed one at a time (beast above the
  cripple line; defender below 75% health; defender unarmed;
  pack larger than one; worst hit above half health), leaves the
  fight as rounds-0 `mFlee`.
- M3: a committed fight is decided by rounds, never scripted —
  the proof shows at least one committed fight ending in
  something other than `vKill` across its fixture set (a flee
  or a death on an unfavorable draw), or states plainly if the
  fixture set cannot produce one and why.
- M4: field (non-raid) met fights are unchanged (rounds-0
  `mFlee`), and fights that DROP a beast below the line during
  the fight are unchanged (Stage-2 scope stays dead).

DIAGNOSTICS (reported, never bars): national-ever, wave-4/5
reach, median survival, re-meet totals, final fates of wounded
entities, defender kills overall. The balanced panel (§15) is NOT
used as the comparator: it cannot ingest per-seed recorder
corpora (the known ingestion failure class, now in its tenth
sighting across runs). The sweep-compare tables on identical
seeds are the comparison of record.

## 3. DESIGN + IMPLEMENTATION

Files touched (no deviation from §2 — the gate as built is the
gate as pre-registered):
- `src/js/fieldFights.js` (+46/−3): the meet-finish gate, placed
  right after the break-line definition, reading the PRE-fight
  fraction only. When it holds, `rec.meetFinish` is set and one
  honest log line is written ("finds [the beast] crippled and
  close to home — hurt bad, alone, and they can take it. They
  move in to finish it."). The two break-line flee points are
  gated on it: the volley-end check logs a hold-the-line line
  instead of `mFlee`, and the in-round break check is skipped.
  Everything else — trick-dismissal flees, vFlee/vDie paths, the
  round cap, arena sealing — is untouched.
- `src/js/game.js` (1 line): `resolveWildMonsterEncounter` now
  forwards `raid: !!opts.raid` into `fieldFight`. This is the
  same one-line threading Stage-2 used, but the fieldFights
  logic it enables is different (meet-only, risk-gated) — the
  Stage-2 drop-finish logic itself stays reverted and absent.
  Only havenRaidTick calls resolve with `{raid: true}`; the
  field path (`villagerMonsterTick`, no opts) and the aid path
  (`aidFight`) get no gate. Loot/ledger scale is the existing
  villager-kill path exactly (see §2): one ledger point (two if
  the counter is known), corpse + carcass meat, the standard
  kill loot roll, +4 trust, a `fight_won` deed — nothing added,
  nothing withheld.
- `node --check` clean on both files.

## 4. PROOF RESULTS

- `scripts/test-woundmill-gap.js`: 11 passed, 0 failed.
  - M1: a gate-passing raid meeting commits to real rounds
    (bulldozer 4/90 HP, healthy armed defender → 1 round,
    vKill, 0 taken, `meetFinish=true`).
  - M2a–M2e: each single-leg failure declines to rounds-0
    `mFlee` (above the cripple line at 20%; hurt defender at
    50%; unarmed defender; pack-3 hushwolf; gavel worst hit 55
    vs 100 HP).
  - M4a: field (non-raid) meeting unchanged (rounds-0 `mFlee`).
  - M4b: a start-healthy raid beast does not meet-finish.
  - M3: committed gavel fights across 8 RNG seeds end 6 vKill
    / 2 vFlee over 3–5 rounds with damage taken 25–117 — the
    fight is decided by rounds, never scripted (one defender
    fled after taking 117; the risk is real).
- Existing fieldfight tests: `test-fieldfight-summary-20261013.js`
  4 passed, 0 failed; `test-break-monsters3-fieldfights-20261008.js`
  26 passed, 0 failed (run directly — see the metric-review
  note in §7 about the check.js 120-second cap).
- `scripts/test-woundmill-gap-analyze.js` (new): pure corpus
  comparator judging §2 legs P1/P2/G1/G2/G3 from the two sweep
  corpora; exit 1 on any leg failure.

## 5. SIM RESULTS (control vs armed, identical seeds)

CONTROL (fresh, pre-rule, this worktree — detgate PASS on seed 73671:
baseline days=180 gameDays=181 tsNationalDay=91, wrapped with
recorders OFF identical, no diag surface, no wraps installed):

| seed | days | end | won | deaths | defFights | met | metFlee | metFinish | metCripple (≤10%) |
| 73671 | 180 | survived | 0 | 45 | 40 | 22 | 22 | 0 | 19 |
| 73672 | 118 | won | 1 | 44 | 46 | 35 | 35 | 0 | 33 |
| 73673 | 32 | village-lost | 0 | 19 | 7 | 2 | 2 | 0 | 0 |
| 73674 | 118 | won | 1 | 15 | 52 | 36 | 36 | 0 | 32 |
| 73675 | 169 | village-lost | 0 | 34 | 40 | 33 | 33 | 0 | 33 |
| 73676 | 144 | won | 1 | 40 | 46 | 30 | 30 | 0 | 27 |
| 73677 | 130 | won | 1 | 37 | 34 | 20 | 20 | 0 | 19 |
| 73678 | 122 | village-lost | 0 | 50 | 34 | 16 | 16 | 0 | 9 |

Control totals: wins 4/8, mixed deaths 284, defender fights 299
(by outcome: mFlee + vFlee + vKill = 299, vDie 0), defender kills
32, met fights 194 — every one ending mFlee, zero finishes.
Pre-wounded re-meets band-wide: 756, all phantom. The gap is
confirmed open on current master: the mill is 194 met fights with
a 0.000 finish rate, and 172 of the 194 met beasts sit at or
below the 10% cripple line, so the gate's wound leg alone does
not make the rule rare — the defender legs (health, armed,
single, worst-hit) are what will narrow it. Base drift, stated
plainly: this control (284 deaths, 4 wins) sits between the 1815
band (234/4) and the woundprice band (336/1) — which is why the
armed arm is judged against THIS control and no other.

ARMED (same seeds, same recorder, rule on):

| seed | days | end | won | deaths | defFights | met | metFlee | metFinish |
| 73671 | 83 | village-lost | 0 | 29 | — | 9 | 4 | 5 |
| 73672 | 79 | village-lost | 0 | 34 | — | 12 | 8 | 4 |
| 73673 | 32 | village-lost | 0 | 19 | — | 2 | 2 | 0 |
| 73674 | 90 | won | 1 | 31 | — | 11 | 1 | 10 |
| 73675 | 164 | won | 1 | 51 | — | 23 | 8 | 15 |
| 73676 | 138 | village-lost | 0 | 59 | — | 17 | 9 | 8 |
| 73677 | 90 | won | 1 | 22 | — | 8 | 2 | 6 |
| 73678 | 95 | village-lost | 0 | 42 | — | 14 | 13 | 1 |

Armed totals: wins 3/8, mixed deaths 287, median survival 90 days
(control 130), national-ever 5/8 (control 7/8), wave-4 4/8
(control 5/8), wave-5 1/8 (control 0/8 — armed seed 73675 reached
wave 5 and won a seed control lost), defender fights 203
(control 299), defender kills 77 (control 32), defender vDie 0
(control 0). Meet-finishes: 49, all on the cripple line, all in
exactly 1 round, across 7 seeds (only seed 73673, which died on
day 32 exactly as control did, saw none). Meet-finish waves: 29
wave-1, 19 wave-2, 1 wave-3. Seed 73673's armed run is headline-
identical to its control run (32 days, 19 deaths, 2 raids) —
the village died before the rule could matter there.
Per-seed win flips: 73672 control-win → armed-loss; 73676
control-win → armed-loss; 73675 control-loss → armed-win.
Net wins 4 → 3.

## 6. VERDICT: NO-GO (one leg fails — the rule does not land)

Judged exactly against §2, by `scripts/test-woundmill-gap-analyze.js`
(exit 1):
- CORPUS PASS (8/8 control + 8/8 armed, zero recorder errors).
- P1 PASS: 49 meet-finishes (bar ≥ 5), on 7 seeds (bar ≥ 2).
- P2 PASS: met mFlee 194 → 47 in absolute terms; in rate terms
  100% of met fights ended phantom in control vs 49% armed
  (47/96) — the mill shrank by either reading, and 51% of armed
  met fights ended in a finish.
- G1 PASS (narrowly): mixed deaths 287 ≤ 313 (control 284 + 10%).
- G2 FAIL: wins 3 < 4. This alone is NO-GO.
- G3 PASS: defender vDie 0 → 0 — no defender died at the wall
  in either arm.
- Proof gates M1–M4: all pass (see §4).

What this means in plain words: the rule works exactly as
designed — defenders finish crippled beasts they can afford,
quickly (one round each), with no defender dying at the wall
for it — and the village still wins less. The cost is not
defender blood; it is the village's trajectory: median survival
fell from 130 days to 90, two control wins flipped to losses,
and the death rate rose from 0.28 deaths per day of play to
0.37 even though the raw death total barely moved (287 vs
284 — shorter runs hide deaths). The likely mechanism is the
one Stage-2 already named: a finished phantom stops soaking a
raid slot, and the next raid pulls a healthy beast instead —
finishing the crippled ones brings fresher teeth to the door
faster. One seed (73675) shows the other side honestly: it
flipped from a control loss to an armed win and reached wave 5.
So the idea is not dead — it is cost-guarded out on wins, the
same shape as Stage-2's kill, one bar instead of two.

Per the brief, the game code is REVERTED and record only lands:
the branch tip carries evidence + analyzer + corpora + sweep
logs, and no `src/` change. The full implementation is
preserved in the branch's first commit (see §8) so a future run
can pick it up exactly, and §3 specifies it completely.

## 7. METRIC REVIEW

- No metric was re-scored mid-run. The verdict is G2's alone;
  every other leg passed, and the analyzer's exit code (1)
  reproduces the NO-GO from the corpora.
- The raw death-total guard (G1) is weak when runs shorten:
  armed deaths 287 vs control 284 looks flat, but armed runs
  lasted 771 days vs control's 1013 — the death RATE rose
  about a third (0.28 → 0.37/day) and median survival fell
  130 → 90 days. A future run should pre-register a rate or
  median-survival guard alongside the total, not instead of
  it — the wins guard caught the cost this time, but a
  total-only guard would not have.
- The met-fight count itself diverged (194 → 96) because armed
  runs had fewer raids and defender fights (89 → 61 raids).
  P2 is therefore reported both ways (absolute 194 → 47 and
  rate 100% → 49% phantom) so a bar pass built on shorter
  runs is visible. Both readings pass here.
- The balanced panel (§15) was not used, for the known reason
  in §2 (it cannot ingest recorder corpora). Sweep-compare
  tables on identical seeds are the comparison of record.
- `check.js --only fieldfight` reported 1 passed / 1 "failed"
  during this run, but the failure was its 120-second cap, not
  a test failure: run directly, the timed-out test passes
  26/26 (see §4). Under sibling CPU contention the test needs
  more than 120 seconds. That cap, not the rule, is what
  failed there.
- For the NEXT run (not this one): the open questions are
  whether a companion covering the raid cascade (fresh teeth
  replacing finished phantoms) changes the win guard, whether
  a narrower gate (deeper cripple line, or wave-1/2 only)
  keeps the wins, or whether the wins guard should be judged
  over more seeds — 8 seeds flip on single trajectories, and
  two flips decided this verdict. Any of those is a new
  pre-registration, not a revision of this one.

## 8. FILES + COMMITS

- Evidence (this file): `evidence/2026-10-27/sim-woundmill-gap.md`
- Analyzer: `scripts/test-woundmill-gap-analyze.js`
- Proof test (results in §4; the file itself is NOT in the
  final tree, because it asserts rule behavior that is
  reverted — it lives in the branch's first commit, see below)
- Control corpus: `evidence/2026-10-27/perseed-woundmill-control/`
  (8 per-seed JSONs) + `evidence/2026-10-27/woundmill-control-sweep.log`
- Armed corpus: `evidence/2026-10-27/perseed-woundmill-armed/`
  (8 per-seed JSONs) + `evidence/2026-10-27/woundmill-armed-sweep.log`
- Branch: gap-woundmill. First commit 7e9a2bb871ab6b93907c029b46fb0a3e6fb09a7b
  (full work: game code + proof test + analyzer + this evidence).
  Tip commit (this commit): game code + proof test reverted,
  leaving record only — evidence + analyzer + corpora + sweep
  logs, zero `src/` change vs the pre-work base (verified:
  `git diff 60e260dc0 -- src/js/` empty).

## 6. VERDICT

(To be filled: GO or NO-GO per §2, and what lands or is reverted.)

## 7. METRIC REVIEW

(To be filled: doubts, deviations, and what the NEXT run should
revisit. No mid-run re-scores.)

## 8. FILES + COMMITS

(To be filled: worktree paths, commit hashes, branch name.)
