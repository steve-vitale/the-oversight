# sim-m2step2-a — M2 Step 2 lever: price the volley honestly in the hopeless math

**Verdict: NO-GO on participation (pool floor).** The arm is not re-scored and
there is no confirm run. The lever is reverted in its own commit; instrument +
evidence land only, 0 src/js delta vs base `9070aaf70` at the final tip.

**Prereg:** `evidence/2026-11-21/sim-m2step2-a-prereg.md` (frozen `5dfeb76bc`,
arithmetic correction `dc614732a` — honest rtk movement ~+0.7 rounds mean,
not ~+0.3; bars untouched, before any judged sim).
**Base:** master `9070aaf70`. **Legs:** ctl = DEPMAT+ROLL35+AMMO substrate only;
arm = substrate + `M2STEP2=1`. Both legs
`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1
SPEARGATE=1`, `BOWKNOW`/`DEPARTSEE`/`EVADEOBS`/`FIBERFETCH` unset. Legs differ
only by the one env flag (driver-verified: same `gameSha ea30c4074c1e`,
`ffSha 8cd785dacad6`, `policySha 1884c8852d38` on both legs; `m2step2On`
false on ctl, true on arm).
**Band:** pilot 107171–107178 (8 seeds), 150d death-aware, competent policy.
Band freshness recorded in the prereg (both bands fresh, ripgrep over all
of `evidence/`).
**Analysis:** `evidence/2026-11-21/m2step2-a-analysis.json`
(corpora `perseed-m2step2-a-ctl/` and `perseed-m2step2-a-arm/`, 8 files each).
**Panel:** `m2step2-a-panel.md` (§15 compare, `review_required`).

## The lever, in plain words

When a bow-holder meets a monster, they may loose a volley of arrows before
the fight starts. The engine used to count that volley damage as if the party
kept dealing it every round — it over-credited the volley about three times
over. The lever (M2STEP2) counts the volley once: it still lowers the
monster's health, but it no longer inflates the party's per-round damage
when the engine asks "can we win this fight?" The prereg's honest prior said
this makes the hopeless read slightly *stricter* (the rounds-to-kill number
rises by the inflation removed, ~0.7 rounds on the diag's two fought
meetings), and cannot by itself flip a hopeless meeting — the diag meetings
were hopeless by 4–5×. A NO-GO here is a real result: it would establish the
volley accounting is not the wall; the wall is the damage race itself.

## Pilot result (8 seeds × 2 legs)

| Bar (frozen prereg §2) | Result |
|---|---|
| (a) Completeness — every served quivered-bow lead wave-4+ meeting on BOTH legs classified, 0 UNCLASSIFIED, 0 instrument errors on all 16 per-seed files | **PASS** — 0 unclassified, 0 instrument errors, 0 evadeP-representation mismatches |
| (b) Pool floor — served quivered-bow leads on the arm leg ≥ 3 | **FAIL — pool 2** (ctl also 2). NO-GO on participation, not re-scored |
| (c) GO rule — engaged-finishes_arm ≥ 1 AND > engaged-finishes_ctl AND hopeless-flee_arm < hopeless-flee_ctl | **FAIL** — 0 vs 0, hopeless-flee 0 vs 0 |
| (d) Guardrails — starvation_arm ≤ starvation_ctl + 2 AND median-survival_arm ≥ 0.8 × median-survival_ctl | **PASS** — starvation 1 vs 1; median survival 150d vs 150d |

**Judge: NO-GO.** Bars a=true, b=false, c=false, d=true.

### What actually happened

- **Pool 2 on both legs, identical meetings.** Both served quivered-bow leads
  met a wave-4 monster and walked away before a shot (awareness-evade, 2/2):
  - Seed 107174, day 36 — hannah_kim vs Eulogy (wave 4), crude bow, 1 arrow,
    evadeP 0.55, aware, expedition origin, served day 17.
  - Seed 107178, day 104 — quinn_murphy vs Suburb (wave 4), bow, 5 arrows,
    evadeP 0.57, aware, expedition origin, served day 90.
  The two meetings are byte-identical between legs (same seed/day/villager/
  monster/bow/ammo/evadeP). The lever cannot touch them: they never reach
  round 2 of a fight.
- **Volley: 0 fired / 0 fought served meetings, 0 shots / 0 hits / 0 damage,
  both legs.** No served lead ever fought, so no volley was ever priced.
- **Mechanism check: null (n=0).** Mean (rtkHonest − rtkAll) is unmeasurable —
  there were zero fought served meetings to read it on. The mechanism is
  **unmeasured, not falsified**: the lever never got a volley to price, so
  this pilot says nothing about whether honest pricing moves the read by
  ~+0.7 rounds. That question stays open for a band where holders actually
  fight.
- **The dominant mechanism is M1 again, not M2.** Both pool meetings evaded
  through the pre-contact awareness check, which takes no bow/ammo input —
  the same mechanism the diag named, and the one this prereg declined to
  build (M1-adjacent awareness term rejected for attribution purity). Quinn
  had 5 arrows and a party and still walked away without a shot. The
  evadebow diag's pool was 3 on 8 seeds; this band's is 2. The served-holder
  population is thin and the awareness gate eats it before the volley math
  ever runs.
- **Engaged-finishes 0 / 0, hopeless-flee 0 / 0, engaged-vDie 0 / 0.**
  Served-holder evadeP mean 0.56, aware-gated rate 1.0 (n=2).

### Wall numbers (both legs identical)

| | Arm | Ctl |
|---|---|---|
| National | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Wave 5 reached | 4/8 | 4/8 |
| Median survival | 150d | 150d |
| Starvation (total) | 1 | 1 |
| Deaths (total) | 688 | 735 |
| Village-lost | 3 (107171 137d, 107172 107d, 107178 141d) | 1 (107178 141d) |

Per-seed arm: 107171 137d lost/std199/d83 · 107172 107d lost/std175/d95 ·
107173 150d survived/w5/std665/d122 · 107174 150d survived/w5/std300/d68 ·
107175 150d survived/w4/std199/d58 · 107176 150d survived/w4/std199/d84 ·
107177 150d survived/w5/std270/d71 · 107178 141d lost/w5/std365/d107/stv1.
Per-seed ctl: 107171 150d survived/w4/std190/d82 · 107172 150d survived/w4/
std199/d114 · 107173 150d survived/w5/std665/d122 · 107174 150d survived/w5/
std715/d97 · 107175 150d survived/w4/std199/d58 · 107176 150d survived/w4/
std199/d84 · 107177 150d survived/w5/std270/d71 · 107178 141d lost/w5/std365/
d107/stv1.

**Downstream divergence, noted honestly.** The legs are identical on every
prereg metric, but the villages diverge: on seeds 107171 and 107172 the ctl
village survived 150d while the arm village was lost (137d, 107d), and on
107174 standing reads 300 (arm) vs 715 (ctl). The lever touches *every*
fought meeting with a volley, not just served-holder meetings — a holder
with a bow from elsewhere (e.g. an apex bow) still fires, and the honest
rate changes that fight's timing, which changes who lives, which changes
the next expedition. So the arm's meeting population differs from ctl's
(all-leads 150 vs 133; all-leads aware-gated evade rate 0.638 vs 0.353).
The served pool — the prereg's metric — is identical, so this divergence
does not touch the verdict. It does mean the lever is live in the engine
(the fights it touches change outcomes); it just never touches a served
holder's fight on this band, because none happens.

### §15 balanced panel

`node scripts/balance-panel.js compare` on the paired 8-seed panel:
**`review_required`** — the standard screen-only outcome, not a verdict
input. Table win rate 0 → 0; national 0 → 0; village deaths per run
91.875 → 86 (no material signal). One flag: **community loss 0.125 → 0.375
(`regression_watch`)** — the arm lost 3 villages vs ctl's 1 on identical
seeds (the downstream divergence above). Guardrails (starvation, median
survival) both pass; community loss is not a prereg bar. Recorded here,
not re-scored.

### Determinism check

Arm seed 107172 re-run into `perseed-m2step2-a-arm-rep/`: headline numbers
identical (107d, village-lost, std 175, d95, 18 meetings, depmatRows 43,
ammoRows 43). Field-level: `ammoRows`, `depmatRows`, `v4encounters`,
`deaths` byte-identical; `stageRows` absent in both. The whole file differs
in exactly one key, `anchorCommit` (the analyzer print-fix commit landed
between the two runs) — every sim field identical.

### Transcripts (SENSE-TESTING LAW)

Both served holders *intended* to engage with a party, and the awareness
check overruled them before contact:

- hannah_kim, seed 107174: intent engage/party — "Hannah saw The Eulogy
  in time and gave it room."
- quinn_murphy, seed 107178: intent engage/party — "Quinn saw The Suburb
  in time and gave it room."

The narration is coherent and people-like — spotting a monster early and
giving it room is sensible. The decision itself is the M1 gap: it weighs
neither the bow, nor the arrows, nor the party standing beside them. That
gap is out of scope for this arm (declined in the prereg) and is the open
question the next arm inherits.

## Instrument

- `scripts/m2step2-driver-a.js` — cloned from evadebow-driver-a.js; MODE
  ctl|arm, M2STEP2 env detection, corpus fields `m2step2Present`/
  `m2step2On`/`ffSha`. Smoke: seed 107171 both legs, exit 0.
- `scripts/analyze-m2step2-a.js` — cloned from analyze-evadebow-a.js;
  metric-review fixes: (1) volley rollup + volley-hopeless read cover
  EVERY fought meeting (rounds ≥ 1), not engaged-outcome only;
  (2) awareness passed through the classifier (served aware-gated rate now
  reads a real 1.0, n=2, mean evadeP 0.56, instead of null); `rtkHonest`
  added to the volley-hopeless read. Selftest 57/57.
- `scripts/build-m2step2-panels-a.js` — cloned from build-evadebow-panels-a.js.
  **Bug caught by this run:** the default seed list was still the evadebow
  band 107151–107158 (the builder failed on the missing 107151 file);
  fixed to 107171–107178 before the panel was built. The fix is in the
  instrument commit.
- `scripts/test-m2step2-a.js` — 41/41 green pre-revert (analyzer selftest
  57/57 inside it). Post-revert, the lever-specific legs fail by design
  (see below); the rest stays green.
- Substrate proofs re-run green on the re-landed base before the pilot:
  DEPMAT 43/43, ROLL35 41/41, AMMO 52/52.

## Telemetry check

**Not run — baseline absent.** `telemetry-baselines/scale-wall.json` does
not exist in base `9070aaf70`, in the evadebow base `b5514461c`, in the main
tree, or anywhere in the workspace (full `find` for `scale-wall.json` and
for a `telemetry-baselines/` directory returned nothing; no git history for
the path). The evadebow arm ran its check against a baseline file that no
longer exists anywhere reachable. Recorded as absent; NOT worked around —
no baseline was fabricated and none was rolled forward. The wall numbers
above (national/table/wins, wave 4–5 unlocks, median survival) are recorded
directly in this file instead.

## Metric review

- **Pool floor was the right bar, and it bit.** The evadebow pool was
  exactly 3 on 8 seeds; this band's is 2. The prereg sized the pilot at 8
  seeds with the floor at 3 and the NO-GO-on-participation rule written
  before the sim — the rule worked as designed: the arm closes without
  re-scoring or a confirm spend on a thinner band.
- **The mechanism check needs a fight to read.** The prereg's mechanism
  check (mean rtkHonest shift ≈ +0.7) is unmeasurable when zero served
  meetings fight. A future arm that wants to test honest pricing needs a
  band where holders fight — or it needs the M1 awareness term first, so
  holders reach the fight at all. Honest pricing of a volley that never
  fires cannot be measured.
- **The all-leads aware-gated rate is a composition read, not a lever
  read.** Arm 0.638 (n=69) vs ctl 0.353 looks like a lever effect on
  evades, but M2STEP2 cannot affect a pre-contact evade — it only runs in
  the round ≥ 2 morale block. The difference is downstream composition:
  the lever changes fought volley meetings (including non-served holders),
  trajectories diverge, and the meeting population differs. The served
  pool (the prereg metric) is identical on both legs. Do not cite the
  all-leads rate as a lever effect.
- **Panel `regression_watch` on community loss is real but out of bar.**
  The arm lost 2 extra villages on identical seeds. It is downstream of
  the lever (fought volley meetings change outcomes), it is not a prereg
  guardrail (starvation + median survival pass), and it does not change the
  NO-GO verdict. A future arm landing honest pricing should watch
  community loss as a guardrail candidate.
- **Instrument bug found and fixed in-run:** the panel builder's default
  seed band was stale (evadebow 107151–107158). Fixed before the panel was
  built; the panel compares the correct band. The analyzer's CLI print
  referenced a stale bar name and a hardcoded /8 — fixed in commit
  `d34e19b9` before the pilot was analyzed; JSON output unchanged.

## What the chain learns

1. **M2 (volley pricing) is untestable on this band, not wrong.** Zero
   served fights means zero volleys priced. The prereg's honest prior —
   the lever makes the read slightly stricter and cannot flip a meeting —
   stands unchallenged and unconfirmed.
2. **M1 (awareness takes no bow/ammo input) is the wall for served
   holders.** 2/2 pool meetings evaded before contact, both with arrows
   and a party. Any arm that wants holders to fight must address the
   awareness gate first — that was the declined M1 term, and this pilot
   is fresh evidence for it.
3. **The lever is live where it touches.** Non-served fought volley
   meetings diverge trajectories enough to lose 2 extra villages. Honest
   pricing is not a no-op in the engine; it is a no-op *for served holders
   on this band*.

## Closeout

- **Substrate revert (hash-verified).** `src/js/game.js` restored from base
  `9070aaf70`; `git diff 9070aaf70 -- src/js/game.js` empty. Own commit:
  `b94b28e58`.
- **Lever revert (hash-verified).** M2STEP2 lines removed from
  `src/js/fieldFights.js`; `git diff 9070aaf70 -- src/` empty at the final
  tip. Own commit: `da26f7cfc`.
- **Post-revert proof.** `node scripts/test-m2step2-a.js` after the reverts:
  33 passed, 8 failed — the 8 failures are exactly the reverted-code legs
  (substrate DEPMAT/ROLL35/AMMO present ×3; M2 comment header, volley read,
  env-gate, vDpr exclusion, morale-block placement ×5); analyzer selftest
  57/57 green; all judge legs green. The lever-specific legs fail by design
  (the lever is gone); the rest stays green. Substrate proofs post-revert:
  DEPMAT 22 passed / 21 failed, ROLL35 14 passed / 27 failed, AMMO 24 passed
  / 28 failed — every failure is a substrate-presence leg (env gate / marker
  block); all non-substrate legs pass. Expected: the substrate is reverted.
- **Land:** instrument (driver/analyzer/panel builder/proof test, incl. the
  panel-builder seed fix) + evidence (this file, analysis JSON, panel
  files, per-seed corpora incl. the `-rep` determinism corpus). 0 src/js
  delta vs base. Commit: [COMMIT-EVIDENCE].
- **Write flap:** the safe-commit index clobber struck on every commit of
  this arm (prereg, correction, substrate, lever, analyzer print fix) —
  staged `D` + untracked `??` for the same paths, and `MM` on single files.
  Each time the commit itself was correct (worktree hash == HEAD blob);
  repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` and verified status empty + diff HEAD empty. No work lost.
- **Heartbeat:** last successful heartbeat 08:51 UTC 2026-11-21; a 09:04
  UTC attempt was skipped by the script ("registry lock held > 120s —
  heartbeat skipped, retry later") — registry contention under load, not
  forced; retried after the pilot legs finished: last worker heartbeat
  08:51 UTC 2026-11-21; adoption heartbeated both arm trees 09:36 UTC and
  runs a 5-min hbloop until session end.

## Commits

- `5dfeb76bc` — frozen prereg
- `dc614732a` — prereg arithmetic correction (~+0.7, not ~+0.3)
- `d6508a67e` — substrate re-land (DEPMAT/ROLL35/AMMO)
- `17aa0a1fa` — M2 lever + instrument + proof test (41/41, selftest 57/57)
- `d34e19b9e` — analyzer CLI print fix (bars/wall lines; JSON unchanged)
- [COMMIT-SUBSTRATE-REVERT] — substrate revert
- [COMMIT-LEVER-REVERT] — lever revert
- `83a01d139` — instrument + evidence (panel-builder seed fix, corpora, analysis, panel)
