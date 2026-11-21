# sim-evadebow-a — DIAG-GO: the served bow-holder still walks away (finding #2590)

**Arm:** sim-evadebow-a · **Loop A run:** fleshout-20261121T0437Z, closed out by adoption run fleshout-20261121T0615Z · **Axis:** scale-onramp
**Finding:** #2590 (serve half) — evade-on-a-quivered-bow · **Type:** DIAG (Step 1 of the brief; no lever built here)
**Base:** master `b5514461c` · **Branch:** sim-evadebow-a · **Prereg:** `evidence/2026-11-21/sim-evadebow-a-prereg.md`
**Verdict: DIAG-GO** — bars (a) completeness, (b) pool floor, (c) dominant reason all pass.
**Mechanism named: M2** — the hopeless-trajectory math prices the volley only as a diluted lump in `mDealt`.
**Next arm (NOT built here):** a lever on M2 — price the volley honestly in the hopeless math, and/or give the
awareness check a ranged term — under its own fresh prereg. The diag named a mechanism, so the lever is the
next arm per the brief's Step 2; this arm stops at the naming.

## Verdict in plain words

A villager who has been handed a bow and a quiver of arrows still walks away from every wave-4+ monster
they lead. Three served quivered-bow holders met wave-4/5 monsters across 8 villages, and all three
walked away — none of them ever finished a fight. Two of them did fight first: they loosed their arrows,
called friends to help, and then the fight-brain did its hopeless math and told them to run. The math
barely counts the arrows at all — a 13-damage volley against a 900-health monster moves the "can we win
this" read by about a round and a half, and a 26-damage volley against a 1050-health monster by about
half a round. The third never even got to shoot: the slip-away check that runs before any fighting
starts never looks at the bow at all, so a holder with 7 arrows slips away at exactly the same rate as
someone with empty hands. The villagers wanted to fight — every one of the three went in intending to
engage, two with a party behind them — and the brain overruled them. That is the wall this diag found.

## Frozen bars (prereg §2) — all pass

| # | Bar | Result |
|---|-----|--------|
| (a) | Completeness — every served quivered-bow lead wave-4+ meeting on the diag leg classified, 0 UNCLASSIFIED, 0 instrument errors on all 16 per-seed files | **PASS** — 3/3 classified, 0 unclassified, 0 instrument errors, 0 evadeP replication mismatches |
| (b) | Pool floor — served quivered-bow leads on the diag leg ≥ 3 | **PASS** — pool exactly 3 |
| (c) | Dominant reason named, with counts, evadeP + components on every evade, bow/ammo-in-assessment answered | **PASS** — dominant `hopeless-after-help` 2/3 (66.7%); see census below |
| (d) | Panel — §15 balanced-panel compare attached | **ATTACHED** — `evidence/2026-11-21/evadebow-a-panel.md`, decision `review_required` (the standard screen-only outcome for an 8-seed panel, not a verdict input) |

## The 3-meeting census (the whole judged population)

Pool: 3 served quivered-bow leads on the diag leg (band 107151–107158, 8 seeds × 2 legs, 150d horizon,
competent policy). Evades 3, engaged 0. Classes: `awareness-evade` 1, `hopeless-after-help` 2, everything
else 0. The ctl leg, by construction, carried 0 served leads (the substrate is what serves) — pool 0,
reported as a sanity check, not a bar.

### 1. Seed 107152, day 59 — theo_lindqvist, reunion, wave 4, world-tick — hopeless-after-help

Served day 26, crude bow, 1 arrow at entry, evadeP 0.56 (rep 0.56, godpath detection term held).
Volley: 1 shot / 1 hit / 13 dmg, 0 arrows left. Then 4 rounds, 187 damage dealt against 900 HP,
63 taken, help called (allies gen_dczr62w + gen_453kb72 arrived), fled hopeless at 37% HP.
Intent: engage, because of the party.

> "hopeless after help arrived (ally gen_dczr62w + gen_453kb72), R4, everHopeless true, fleeHpFrac 0.37"

### 2. Seed 107155, day 60 — gen_34oi09c, influencer, wave 4, expedition — hopeless-after-help

Served day 24, crude bow, 6 arrows at entry, evadeP 0.61 (rep 0.61, no godpath term).
Volley: 2 shots / 2 hits / 26 dmg, 4 arrows left. Then 6 rounds, 522 damage dealt against 1050 HP,
68 taken, help called (allies gen_1xqf0z9 + ruby_callaghan arrived), fled hopeless at 31% HP.
Intent: engage, because of the party.

> "hopeless after help arrived (ally gen_1xqf0z9 + ruby_callaghan), R6, everHopeless true, fleeHpFrac 0.31"

### 3. Seed 107155, day 65 — gen_34oi09c, spoiler, wave 5, expedition — awareness-evade

Same holder, five days later, now with 7 arrows. evadeP 0.67 (rep 0.67). Volley: never fired —
the awareness check slipped them away before contact (0 rounds, 0 damage). Intent: engage,
because of the party. The holder walked away from a wave-5 monster carrying a bow and 7 arrows
without ever nocking one.

> "evadeP 0.67 (rep 0.67) tracking 352 behavior passive speed 1 notice 7 size 2 potential true abs game_sense/tracker/echo false/false/true | ranged crude_bow ammo 7 — the awareness formula takes no ranged input"

## Mechanism M2, priced (adoption arithmetic on the raw per-meeting records)

The analyzer's own volley-hopeless formula, applied to the two fought meetings (the analyzer's
aggregate read covers engaged-outcome meetings only, so it reports n=0 — see Metric review):

- 107152 (13 dmg of 187 dealt, 7.0%): the volley moves the rounds-to-kill read from 16.7 rounds
  (without it) to 15.3 (with it) — a shift of **+1.4 rounds**, against a monster that still had
  713 HP left when the holder fled.
- 107155 d60 (26 dmg of 522 dealt, 5.0%): rounds-to-kill 6.7 → 6.1 — a shift of **+0.6 rounds**,
  against a monster that still had 528 HP left when the holder fled.
- Mean shift across the two fought meetings: **+1.0 rounds**. The volley is real damage, but the
  hopeless math reads it as a one-time lump spread across the whole fight, so it never moves the
  "can we win" verdict — both holders fled with the monster at 50–79% health and help beside them.

M1 is present too, in miniature: the single awareness-evade (evadeP 0.67, 7 arrows, never fired)
is the awareness formula's blindness made concrete — and the proof test's static code read
confirms the formula takes no bow/ammo/arrow/quiver/ranged input and runs before the volley
code. M1 is not dominant (1/3), so the named mechanism is M2; the next arm should price the
volley honestly in the hopeless math, and may also give the awareness check a ranged term —
both are M1/M2-adjacent, and the fresh prereg will pick the shape.

The bow itself adds nothing to the assessment, proven two ways: the evadeP-independence case
(a synthetic pair differing ONLY in ammo replicates to identical evadeP), and the served
holders' mean evadeP 0.613 against an all-leads mean of 0.364 — the served holders slip away
MORE often than the average lead, because their evadeP is driven by tracking/behavior/abilities,
never by the kit. The awareness check across all diag leads: 15 aware-gated leads, 12 evades
(80% rate, mean evadeP 0.577). Ctl beside it: 16 aware leads, 13 evades (81%, mean 0.606) —
the same blindness on the live game.

## Wall numbers (every run)

| | diag leg | ctl leg |
|---|---|---|
| National reached | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 3/8 (107151, 107155, 107157) | 3/8 (107151, 107153, 107157) |
| Median survival | 146d | 150d |
| Village lost | 5/8 | 4/8 |
| Total deaths | 665 (83.1/run) | 699 (87.4/run) |
| Starvation deaths | 1 | 1 |
| Best standing | 745 (107155, regional) | 405 (107157, regional) |

The scale wall stands: every village reached regional, none reached national, none sat at the
table, none won. Wave 5 opens in 3 of 8 villages on both legs; the substrate (which serves the
bows) changed nothing at the wall — it bought volleys, and the volleys bought nothing, because
the flee brain discounts them.

Per-seed diag: 107151 survived 150d w5 standing 560, 91 deaths; 107152 lost 122d w4, 199, 84;
107153 lost 146d w4, 195, 67; 107154 lost 94d w4, 199, 65; 107155 survived 150d w5, 745, 132;
107156 lost 119d w4, 199, 86; 107157 survived 150d w5, 405, 70; 107158 lost 132d w4, 199, 70.
Per-seed ctl: 107151 survived 150d w5, 395, 99; 107152 survived 150d w4, 199, 111; 107153
survived 150d w5, 350, 78; 107154 lost 94d w4, 199, 65; 107155 lost 121d w4, 199, 130;
107156 lost 119d w4, 199, 86; 107157 survived 150d w5, 405, 70; 107158 lost 116d w4, 195, 60.
(Median is the analyzer's upper median: sorted[4] of 8.)

## Balanced panel (§15) — `evidence/2026-11-21/evadebow-a-panel.md`

Built by `scripts/build-evadebow-panels-a.js` (clone of the fiberfetch panels): before = ctl leg
(substrate OFF), after = diag leg (DEPMAT=1, ROLL35=1, AMMO=1), 8 paired seeds.
Decision: **review_required** (screen only). National scale access 0 → 0, table win rate 0 → 0
(no material signal). Village deaths per run 87.375 → 83.125 (paired delta −4.25, 95%
exploratory interval −12.6 to +2.8, no material signal). Community loss 0.50 → 0.625
(regression_watch; interval −0.25 to +0.5, includes zero — not a verdict input, and the frozen
bars judge, not the panel). Player deaths, table entry/sitting, and the food/hydration/HP
sampled metrics are `not_observed` — this driver does not instrument them, and the panel
never fakes them. Panel files: `evadebow-a-panel-before.json.gz`, `evadebow-a-panel-after.json.gz`,
`evadebow-a-panel.json`, `evadebow-a-panel.md`.

## Reachability verdict

- Waves 1–4: reachable (8/8 reach wave 4). Wave 5: reachable but rare (3/8). Regional: 8/8.
  National: 0/8 — still decoration in sims. The table and the win flag: 0/8 — unreachable
  on this band, as in every recent loop run.
- Arc II/III/IV, vests, young-link succession, trap acquisition, counter discovery: NOT
  instrumented by this driver — no verdict claimed, no number faked. The diag instrument
  watches served-bow meetings and the scale wall, nothing else.

## Village assessment (plain words)

Eight villages, eight versions of the same story. The ones that lived to day 150 (107151,
107155, 107157) did it by reaching wave 5 and holding regional standing — 107155 climbed
highest, to 745 standing, and still lost 132 people doing it. The ones that died did it
between days 94 and 146, at wave 4, with standing stuck at 199 — the same 199 wall that
has haunted this loop for weeks: villages climb to regional and then cannot climb further,
and the wave-4 monsters grind them down. Nobody starved to death in any numbers (1 starvation
death per leg) — this is not a food story on this band; it is a fighting story. The villages
that survived did not survive because their bow-holders fought: the only three served
bow-holders in the whole band all walked away from their monsters, two of them after firing
and calling for help. The gear arrived. The will arrived. The brain that decides whether
fighting is worth it never got the memo.

Sense check: nothing in these three meetings reads robotic. The holders intended to engage,
fought with a party, called for help when it arrived, and left when the math said hopeless —
that is a person making a bad call on bad information, not a puppet. The defect is in the
information the brain is given (it cannot see the bow), not in the villagers' intentions.

## Metric review (§14)

- **Volley rollup undercounts.** The analyzer counts volleys only over engaged-outcome
  meetings, so its aggregate reads "fired 0/0" even though both fought meetings fired
  (3 shots, 39 damage total), and its volley-hopeless read reports n=0. The per-meeting
  detail lines are the honest numbers, and the M2 pricing above is computed from them with
  the analyzer's own formula. Proposal for the next run: count volleys over every fought
  meeting (rounds ≥ 1). A fix for exactly this was drafted in the timed-out run's uncommitted
  analyzer edit — see Infrastructure — but its fixture checks were red, so it was set aside
  rather than landed.
- **Served-quivered aware-gated rate reads null (n=0).** The analyzer's aware-gated rollup
  reads `m.evade.awareness` off the classified meeting, which the classifier never passes
  through — so the served subset's aware rate is always null even though the all-leads
  aware rate (read from raw rows) works fine (80%). The served mean evadeP 0.613 is still
  valid, and the awareness-evade meeting's own evadeP 0.67 is in its detail line. Same
  uncommitted fix, same disposition.
- **Median is the upper median** (sorted[4] of 8), per the analyzer — 146d diag, 150d ctl.
  Noted so nobody re-derives a different number from the per-seed days.
- No metric was re-scored mid-run. The bars judged are the frozen ones.

## Proofs

- `scripts/test-evadebow-a.js` **pre-revert: 33/33 green** (substrate present in game.js;
  includes static formula legs — awareness takes no ranged input, fighterShouldFlee takes
  no ranged input, volley lands in rec.mDealt — classifier fixtures, evadeP independence,
  analyzer `--selftest` green).
- `scripts/test-evadebow-a.js` **post-revert: 30/33** — exactly the 3 static substrate legs
  fail BY DESIGN (`substrate DEPMAT present`, `substrate ROLL35 present`, `substrate AMMO
  present`); the static-formula legs, classifier fixtures, and analyzer selftest still pass.
  The proof test was NOT edited to hide the by-design failures.
- Analyzer re-run over the on-disk corpora reproduces `evadebow-a-analysis.json`
  **byte-identical** (run to /tmp during adoption, diff empty) — the judged analysis is
  exactly what the committed green instrument produces.
- Substrate proofs from the timed-out run (re-run green on the re-landed base before any
  judged sim, per the prereg): DEPMAT 43/43, ROLL35 41/41, AMMO 52/52.
- Smoke: 1-seed smoke (107151) both legs exit 0 — ctl 150d w5, diag 150d w5, pool 0 on the
  smoke seed (2 served, both 0-ammo).
- Determinism per the prereg: one diag-leg seed re-run into a `-rep` corpus after the pilot;
  stageRows, ammoRows, v4encounters, deaths byte-identical (rollwall precedent). No re-run
  of the judged sweeps was performed in this adoption.

## Infrastructure (adoption closeout)

- **Timed-out run adoption.** The 0437Z run timed out with the judged corpus complete on
  disk but no evidence `.md`, no panel compare, and an index clobber (below). This adoption
  verified the corpus, wrote this file, built the panel, reverted the substrate, and rebased
  — no judged sweep was re-run.
- **Index clobber repair.** The worktree index held staged `D` entries for the prereg +
  all four scripts while the worktree files were byte-identical to HEAD, plus `MM` on
  `src/js/game.js` where the index copy was the BASE game.js (blob 97956402…, lacking the
  substrate's ~7-line spear-holder comment block) while HEAD and the worktree both held the
  substrate version. Repaired with the documented pipe
  (`git ls-tree -r HEAD -- <6 paths> | git update-index --add --index-info`); afterwards
  every path verified worktree == HEAD == index by hash-object, `git status` showed only
  the untracked judged corpus, and `git diff HEAD` was empty. Never `read-tree`.
- **Uncommitted analyzer/test edits set aside.** The timed-out run left uncommitted edits
  to `scripts/analyze-evadebow-a.js` and `scripts/test-evadebow-a.js` (volley-hopeless read
  over fought meetings, awareness pass-through) that were NOT in the coordinator's verified
  state — the brief's "byte-identical to HEAD" did not hold for those two files. The edited
  proof ran **31/34 with 3 failures**: the new checks expect a volley on the hopeless
  fixture meeting that the fixture never carries (volley null → rtk shift 0, share 0), and
  the expected values (rtk shift 0.9, share 0.225) are not derivable from the fixture's
  numbers (mDealt 120, rounds 5, mHpStart 1000) — the fix was half-finished. Rather than
  invent fixture numbers to force green, the edits were restored to the committed green
  instrument (`git checkout HEAD --` both files), which re-ran **33/33 pre-revert** and
  reproduces the analysis byte-identical. The drafted fix's ideas are recorded in Metric
  review for the next arm; the red edit itself left no trace.
- **Substrate revert (hash-verified).** `src/js/game.js` restored from base `b5514461c`
  (`git show b5514461c:src/js/game.js`), hash 97956402… == base blob; `git diff
  b5514461c -- src/` empty at the final tip. The revert is its own commit, separate from
  the evidence/instrument commit. Per the rollwall/holdersupply precedent, DIAG arms land
  instrument + evidence only — 0 src/js delta vs base.
- **Telemetry check.** `node scripts/telemetry-check.js --baseline
  telemetry-baselines/scale-wall.json --current 'evidence/2026-11-21/perseed-evadebow-a-diag/*.json'
  --metrics national,table,wins,exiled` **refused the input**: "recorder-corpus input: all 8
  --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs."
  Recorded as the prereg anticipated (rollwall precedent); NOT worked around with
  `--allow-recorder-corpus` or `--update-baseline` — no baseline was rolled forward.
- **Write flap:** none struck. Every write, commit, and ref update in this adoption went
  through on the first try; no EPERM, no `.lock` failure, no retry needed.
- **Rebase:** rebased cleanly onto master `9622f8089` (post-leadside-merge master, 8/8 picks, no conflicts); new tip `766179faf`;
  `git diff 9622f8089 -- src/` empty; post-rebase proof 30/33 (3 by-design substrate legs), analyzer
  selftest 34/34; analyzer re-run over the corpora byte-identical to the committed analysis. Evidence commit hashes updated after the rebase (`b8aae9af9` / `620a2fc56`).

## Commits

- `7cfa92185` prereg — evade-on-a-quivered-bow diag, fresh band 107151–107158, frozen before any judged sim
- `85e68ebad` instrument + DEPMAT/ROLL35/AMMO substrate re-land (FIBERFETCH excluded, concept-dead)
- `7c239e3d2` instrument + proof (33/33); substrate proofs DEPMAT 43/43, ROLL35 41/41, AMMO 52/52
- `0e6413ebc` analyzer awareness-gating fix; selftest 34/34, proof 33/33
- `7c9d60c11` panel builder + smoke (107151 both legs exit 0)
- `b8aae9af9` (adoption) evidence + instrument + corpus + panel commit
- `620a2fc56` (adoption) substrate revert commit — 0 src/js delta vs master `9622f8089`
- (hash-update commit — this file's Rebase/Commits sections, after the rebase onto `9622f8089`)

## Files

- Prereg: `evidence/2026-11-21/sim-evadebow-a-prereg.md`
- This evidence: `evidence/2026-11-21/sim-evadebow-a.md`
- Analysis: `evidence/2026-11-21/evadebow-a-analysis.json` (byte-identical re-run verified)
- Per-seed corpora: `evidence/2026-11-21/perseed-evadebow-a-ctl/` (8 seeds),
  `evidence/2026-11-21/perseed-evadebow-a-diag/` (8 seeds)
- Sweep/smoke logs: `evidence/2026-11-21/evadebow-a-{ctl,diag,smoke-ctl,smoke-diag}.{log,err}`
- Panel: `evidence/2026-11-21/evadebow-a-panel-{before,after}.json.gz`,
  `evadebow-a-panel.json`, `evadebow-a-panel.md`
- Instrument: `scripts/evadebow-driver-a.js`, `scripts/analyze-evadebow-a.js`,
  `scripts/build-evadebow-panels-a.js`, `scripts/test-evadebow-a.js`
