# Journey succession r258 — run note (2026-11-20)

- Run: r258, Lane B leg 7 SUCCESSION (EARLY_KILL_DAY=40, POST_DAYS=70)
- Run id: playtest-loop-2-20261120T1900Z-leg7 (scheduled Fri 2026-11-20 13:00 CST)
- Base: local master `d352834ef` at run start (sim-lend-a coordinator addendum)
- Branch: `journey2-succession`, worktree `~/workspace/worktrees/journey2-succession`
- Rotation read `7` (succession); write `7→4` at closeout with read-back
- Policy: competent + succession driver (r254 fork + PREFIX env + freshPersonN instrument)
- Seeds: screen band 34401–34408 (fresh, 0 hits) + smoke 33998 (standing control)
- Prereg: `evidence/2026-11-20/journey-succession-r258-prereg.md` (this note adjudicates against it; metric binding applies — a miss is NO-GO, never re-scored mid-run)
- Adoption: the run timed out at 3600s before closeout; this note is written by the adoption, which verified every claim below against the files on disk (proof tests re-run, pair byte-compared, telemetry recomputed). No claim is taken on the timed-out worker's word alone.

## Pre-registration (from the prereg)

This run IS the supply-first panel r254's metric review filed: screen a fresh band for witnessed combat deaths, then run the matched control/arm pair on the seeds that carry supply. Supply rule (fixed in advance): a seed carries supply iff its WITNESS-CENSUS shows >=1 person corpse with witnessN>0. The control leg reverts only the r254 multi-name witness variant (`src/js/convoTopics.js`); everything else identical.

- **Q1 REL-WIT (binding, carried):** PASS = >=1 judged witness-variant serving with rel.witnessed true AND 0 servings where not witnessed, on the ARM leg over the supply seeds. 0 servings with supply present = INSUFFICIENT-DATA (not a fail); 0 supply seeds = INSUFFICIENT-DATA (supply-zero).
- **Q2 REL-BOND (binding, carried):** PASS = >=1 bond-variant serving where close AND 0 where not close (both legs).
- **Q3 REL-VET (binding, 10-draw floor):** PASS = >=1 veteran-variant serving on >=10 opener draws in both-veteran convos, AND 0 where either is not a veteran.
- **Q4 MOURN-TEMPLATE (binding):** 0 same-speaker same-shape firings for different dead AND 0 different-speaker same-shape same-dead firings within 5 days.
- **Q5 MOURN-EXHAUST (binding):** 0 servings of the exhausted line in a mourning sitting.
- **Q6 MANTLE-FINE (binding):** 0 flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips.
- **Q7 DRY CENSUS (binding):** 0 dry hits of any class.
- **Q8 WILD CHECK (binding):** 0 regressions on F4a/F4b/F4c/F5/F6/C3c/F2/C3d and the carried landed-fix surfaces.
- **Q9 C3d WILD HOLD (binding):** 0 C3d-class erasures.
- **Q10 F5 WILD EXERCISE (DESCRIPTIVE):** settled-favor firings per leg + rolling 5-panel window; binding proof is the r225 harness (22/22), re-run on this base.
- **Q11 CONTROLS (binding, smoke bar S_fixed from r230, re-baselined r233):** smoke 33998 at-death snapshot matches r233 exactly — handoff d6 Heinrich → Grace, relPost bonds 33, relD14 50, selfId grace_obi + machinery (pick rank 1, funeral INCALL true, selfReq 0).
- **Q12 Descriptive:** CAP-NC, HABIT-COLLISION, per-kind variant counts, witness-populated corpse count, WIT-SIT staging counts, MULTI-NAME SITTING count (new instrument: driven mourning sittings with freshPersonN>=2).
- **Q13 WITNESS-CENSUS (diagnostic):** per-seed corpse census; the screen's per-seed census IS the supply finding.

## The defect found in the wild — SELFWIT (fix landed this run)

The screen's only witnessed person corpse is **Karimi, seed 34403, killed in an NPC-NPC ambush**. Her corpse, as the pre-fix screen recorded it, carries witnesses `["Karimi","Giulia","Grace"]` — **the dead woman listed as a witness of her own death**. Root cause: `simNpcAmbush` in `src/js/betrayal.js` registers the death with `witnesses: this.witnesses(6)`, and `witnesses()` excludes only the bearer (the player) — it never excludes the victim. The combat path does it right (`fightWitnesses(excludeVid)` drops the victim); the ambush path is the only person-death registration that passes a raw proximity list.

The self-entry is harmless for mourning (the dead cannot speak, so `t2MournRel.witnessed` never fires on it) but it corrupts the witness record the mourning system, gossip seeding, and the WITNESS-CENSUS read: a corpse's witness list must name only the living who saw the death.

**Fix** (`src/js/betrayal.js`, +6/−1): filter the victim out at the `simNpcAmbush` registerDeath call — `.filter(id => id !== plot.target)` — the same exclusion the combat path applies. No other call site changed; the fix is the narrowest possible form of the combat path's exclusion.

**Proof** (`scripts/test-journey-succession-r258-selfwit-20261120.js`, 2 cases, ALL GREEN on the fixed code):
- `selfwit-excluded`: target + bystander both near the scholar; the killed target's corpse excludes the target and still includes the bystander.
- `selfwit-far`: target far from the scholar, bystander near; the corpse excludes the target and still includes the bystander (the filter drops no real witness and invents none).
- RED verified by the adoption: with the fix stashed, the test reports **1 FAILURE** (the excluded case fails on unfixed code; the far case passes either way, as designed — the far target is outside `witnesses(6)` already). Fix restored after the check; `git diff` re-verified.

**Wild confirmation:** the pre-fix screen files are preserved in `evidence/2026-11-20/r258-prefixed-screen/` (Karimi witnessN=3, self included). The post-fix re-run on the supply seeds records Karimi witnessN=2, `["Giulia","Grace"]`. The fix changes exactly that one entry: the matched pair is byte-identical (see below).

## Results — screen (9 seeds, arm = base)

| Question | Verdict | Numbers |
|---|---|---|
| Supply | **SUPPLY-PRESENT, 1/9 seeds** | 1 witnessed person corpse in 9 runs: Karimi (34403, ambush). Person corpses total 3 (Karimi; Emilio + Ashanti on 34405, both alien-caused, witnessN=0). Monster corpses 53, all witnessed. |
| REL-WIT | **INSUFFICIENT-DATA** | 0 servings; 0 single-fresh witness draws (below the 3-draw floor). 0 witConvos panel-wide. |
| REL-BOND | **PASS** | 6 servings, all held, 0 unheld (16 bond-close qualifying convos). |
| REL-VET | **PASS** | 5 servings, all held, 0 unheld; 22 opener draws in both-veteran convos. |
| MOURN-TEMPLATE | **PASS** | 57 servings, 0 same-speaker repeats, 0 village-window repeats. |
| MOURN-EXHAUST | **PASS** | 0 exhausted-line servings. |
| MANTLE-FINE | **PASS** | (screen: deaths observed across 9 seeds, 0 flippedImmediate=false, 0 fineLatency>=2, 0 day-skips — see analyzer verdict lines) |
| DRY CENSUS | **PASS** | 0 dry hits panel-wide. |
| MULTI-NAME SITTING | **3 sittings, 0 witness servings** | 34405 Adaeze on Marcus (freshPersonN=2); 34408 Arlo + Hudson on Courtney (2). All three mourn hits carry witnessed=false — multi-name windows occur, but none of them is a witnessed window. |
| WIT-SIT | **NO-STAGING** | 0 sittings fired — witnessed deaths detected but no living non-bearer witness was available to sit. |
| HABIT-COLLISION | **PASS** | 0 collisions. |
| CAP-NC | **descriptive** | 34401 bonded-by-deadline; 34405 + 34407 village-ended-before-deadline (bondedEver=true); 34408 second-handoff-before-deadline (bondedEver=true). Denominator <3 on the pair — INSUFFICIENT-DATA there. |
| CONTROLS | **PASS** | Smoke 33998 matches r233 exactly: handoff d6 Heinrich → Grace, relPost bonds 33, relD14 50, selfId grace_obi, pick rank 1, funeral INCALL true. |

## Results — matched pair (supply seeds 34403 + 33998, arm re-run with the fix)

Per the prereg, the fix landed before the pair ran, so the arm leg for the supply seeds was re-run with the fix; the pre-fix screen runs on those seeds are superseded (preserved in `r258-prefixed-screen/`). The control leg reverts only the r254 convoTopics multi-name lines; the selfwit fix is present on both legs.

| Question | Verdict | Numbers |
|---|---|---|
| Pair identity | **BYTE-IDENTICAL** | stdout.json identical on both seeds (34403, 33998); all 24 transcripts identical; analyzer verdict sections identical. The two analyzer files differ only in the recorded transcript-path prefix (`r258scr-` vs `r258ctl-`). The multi-name variant is proven inert on this pair, exactly as on r254. |
| REL-WIT | **INSUFFICIENT-DATA** | 0 servings; 0 single-fresh witness sittings (below the 3-draw floor). Supply present, serving unmeasured — the question narrows to sitting/window rareness, per the prereg. |
| REL-BOND | **INSUFFICIENT-DATA** | 0 bond convos on the pair; positive arm unmeasurable. |
| REL-VET | **INSUFFICIENT-DATA** | 0 opener draws in both-veteran convos, below the 10-draw floor. |
| MOURN-TEMPLATE | **PASS** | 10 servings, 0 repeats. |
| MOURN-EXHAUST | **PASS** | 0. |
| MANTLE-FINE | **PASS** | 2 deaths observed, 0 flippedImmediate=false, 0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips. |
| DRY CENSUS | **PASS** | 0 dry hits. |
| MULTI-NAME SITTING | **0 sittings, 0 servings** | No driven mourning sitting landed in a multi-name window on the pair seeds. |
| WITNESS-CENSUS | **SUPPLY-PRESENT** | Corpses 57 (person 4, monster 53); person corpses with witnesses 1 — Karimi, ambush, witnesses Giulia, Grace (the fixed record). |
| WIT-SIT | **NO-STAGING** | 0 sittings fired. |
| HABIT-COLLISION | **PASS** | 0. |
| CONTROLS | **PASS** | Smoke snapshot matches r233 exactly (see screen table). |

## Census (plain words)

Nine villages played 70 days past a forced early death. One village in nine produced a witnessed person death — Karimi, killed in an ambush while Giulia and Grace stood nearby. The other villages' dead died unwatched: two to alien causes, the rest to contests, expeditions, and the wild. The mantle passed cleanly everywhere it was watched: every handoff landed the same day, nobody's day skipped, and the new bearer picked up the story where the old one left it. Mourning worked as designed — 57 servings on the screen, every one naming the right dead, none repeated for the wrong person — but the witness variant itself never got a chance to speak, because no sitting ever gathered around a witnessed death. The villages are not broken; the moment the variant needs is rarer than the screen is wide.

## People check (Q4) — PASS

Two full transcripts read (control leg):

- **Cesar (34403, day 32, mourning Duc):** dreams Duc is still here and wakes angry at the dream; names the party "The Company" with Giulia mid-sitting; takes the scout role — "Roles. Not ranks — promises." The grief, the naming, and the role all land in one conversation without fighting each other. Sensical.
- **Ruby (33998, day 13, mourning Heinrich):** "Heinrich is gone and the world just... continues. That's the part I can't stand." Turns over his last words, takes the scout role from Ashanti ("Scout is yours now"), is shown elderberry and laughs at having walked past it for weeks. Sensical, characterful.

One live observation, transcript-observed (the analyzer carries no counter for it): the **live-want recap opener** — "We never finished talking about what they confided — we wandered off it, 4 days back" — fires on Ruby d+7 (both legs) and on Hudson d+7 (34408, screen). The C3d recap path did not engage on r230–r254 (seven straight panels); it engages here. Descriptive, not a bar — the analyzer does not count it, so the count is by transcript grep (3 firings: 2 distinct sittings).

## Metric review

- **REL-WIT stays INSUFFICIENT-DATA in the wild.** The supply-first design worked as filed — supply was found (1/9 seeds) — but the serving needs three rare things to coincide (witnessed death + multi-name fresh window + driven sitting in that window) and the pair produced zero sittings around the one witnessed death. The next step is not a wider screen: the binding constraint is now the sitting, not the supply. A next run should stage the sitting (drive a mourning sitting on a witnessed-death seed) rather than screen more seeds for supply. WIT-SIT NO-STAGING is the finding to carry.
- **The selfwit fix is proven in the wild, not just the harness:** pre-fix Karimi witnessN=3 with herself listed; post-fix witnessN=2, herself excluded; pair byte-identical otherwise. The witness census now reads clean on every panel that re-runs these seeds.
- **Multi-name windows exist (3 on the screen) but none is witnessed.** The r254 variant's serving condition (witnessed + multi-name + sitting) has still never been observed in the wild. The variant remains proven-only-by-harness.
- **F5/C3d:** the analyzer carries no F5 firing counter and no C3d counter (grep: 1 incidental match). F5 stays DESCRIPTIVE; binding proof is the r225 harness, re-run GREEN 22/22 on this base. C3d's recap opener fired in transcripts (see People check) — first engagement after seven silent panels; a counter for it belongs in the next analyzer fork.
- **CAP-NC:** denominator starved by design on the pair; 4/9 screen seeds bonded-by-deadline or equivalent. No revision.
- **Day-skip watch:** twenty-third straight panel watch, 0 day-skips.
- **Proof refresh rounds 11 + 12 remain owed** (measurement-proof track, carried since r192/r194/r195).
- **BOWCRAFT bisect for the 34362 drift stays open** (not this run's; 34362 not re-run, per prereg).
- **m3v2b:** not instrumented in the r258 analyzer (no matches); tele echo counts recorded (34403: echoOld 6, echoV2 8, echoV2b 7). Carried as before.
- **Scout-role ping-pong / driver re-ask pestering:** carried, unchanged (checkpoint loop untouched to protect the smoke control).

## Proof tests (re-run by the adoption on the worktree tip)

- `test-journey-succession-r258-selfwit-20261120.js` — **ALL GREEN** (2 cases); RED verified with the fix stashed (1 FAILURE), fix restored.
- `test-journey-succession-r254-multiwit-20261120.js` — **ALL GREEN** (4 cases: multiwit-fires, multiwit-silent, multiwit-wrongdead, multiwit-names-latest; 23 PASS lines).
- `test-journey-succession-r232-relationship-mourning-*.js` — **ALL GREEN** (41 PASS lines).
- `test-journey-endgame-r225-f5-settled-favor-20261116.js` — **22 passed, 0 failed** (binding proof for the reclassified F5 arm).

## Telemetry

`node scripts/telemetry-check.js` on the screen corpora: **2 LOUD lines** — `deaths.bearer` +203% (baseline 7.6 → current 23, n=9) and `census.fallen` +215% (baseline 14.3 → current 45, n=9). On the control corpora the same two lines fire negative (−74% / −72%, n=2). **Adjudication (per-file means, the prereg-mandated comparison — the tool sums the current files against a baseline of means, a mismatch unresolved since r229):**

| Metric | Screen mean (n=9) | Control mean (n=2) | Baseline | Reading |
|---|---|---|---|---|
| deaths.bearer | 2.56 (−66%) | 1.00 (−87%) | 7.6 | below baseline both legs |
| census.alive | 8.56 (+125%) | 10.00 (+163%) | 3.8 | above baseline both legs (tool never flags it: baseline <5, below its swing-rule floor) |
| census.fallen | 5.00 (−65%) | 2.00 (−86%) | 14.3 | below baseline both legs |
| census.integrationStage | 3.00 (0%) | 3.00 (0%) | 3.0 | exact |
| week2.deadBearerMentions | 4.22 (+1%) | 3.50 (−17%) | 4.2 | on baseline |

All five per-file means are explained by the forced-chain regime (EARLY_KILL_DAY=40, POST_DAYS=70, scripted kill): a short window with one forced death produces fewer bearer deaths and fewer fallen, and more villagers alive at census time, than the unforced baseline's long runs. The control leg — which differs from the arm only by the reverted convoTopics lines — shows the same direction and larger magnitude, and the pair is byte-identical, so no game-code effect can explain any deviation. **No real bug; baseline NOT rolled** (prereg rule: a forced-chain panel must not roll the unforced baseline forward).

## Infrastructure

- **Write flap:** none seen this run or during the adoption (home + git write probes OK at adoption start).
- **Adoption note:** the run timed out at 3600s before closeout; the adoption verified the coordinator dead (no WT_RUN_ID processes), re-ran all four proof tests, byte-compared the pair, recomputed telemetry per-file means, and started its own heartbeat loop (`journey2-succession-adopt-hbloop.sh`, setsid-detached). A VM restart occurred ~19:21 UTC during the run; the run's own hbloop did not survive it (no r258 hbloop process found at adoption), but the worktree heartbeat was fresh (19:48Z) and the adoption re-heartbeated on arrival.
- **Gate (`node scripts/check.js --quick` on the worktree tip, detached, `--cacheDirectory=/tmp/jest-cache-playtest2`): 334 passed, 10 failed in 1442s.** The 10 failures are all the known standing set, 0 attributable to this run's change (which touches only `src/js/betrayal.js`'s ambush witness list plus test/evidence files): 6× 120s TIMEOUT — `test-living-garden-deed-attainment.js`, `test-occupation-panels.js`, `test-one-person-army-deed-attainment.js`, `test-trust-observer-neutrality.js`, `test-capable-bot-20261014.js`, `test-table-endings-20261014.js` (deed-attainment / long-harness scripts exceeding the 120s cap under load); measurement-proof staleness pair — `test-measurement-proof-update.js`, `test-measurement-workflow.js` (proof re-sign round 22 still owed); phone-frame stale receipt — `test-phone-frame-proof.js`; `test-measurement-cache-flags.js` (passes solo — load flake, same as r257). Load note: the sibling Loop B sim-reseed-b run started its own `check.js --quick` at 20:04 UTC while this gate was mid-run, doubling CPU load; that is a plausible contributor to the six timeouts. No failure names betrayal, ambush, witnesses, mourning, or succession.
- **Safe-commit index clobber:** watch for it after every safe-commit (known class; repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`).

## Verdicts

| Leg question | Verdict |
|---|---|
| REL-WIT (binding) | **INSUFFICIENT-DATA** — supply present (1 witnessed corpse), 0 servings; the sitting is now the binding constraint |
| REL-BOND (binding) | **PASS on screen** (6/6 held); INSUFFICIENT-DATA on the pair (0 bond convos) |
| REL-VET (binding) | **PASS on screen** (5/5 held, 22 draws); INSUFFICIENT-DATA on the pair (0 draws) |
| MOURN-TEMPLATE | **PASS** (57 screen / 10 pair, 0 repeats) |
| MOURN-EXHAUST | **PASS** (0) |
| MANTLE-FINE | **PASS** (0 issues, 0 day-skips) |
| DRY CENSUS | **PASS** (0 dry) |
| WILD CHECK | **PASS** (no regressions observed; F5/C3d descriptive — see metric review) |
| C3d WILD HOLD | **PASS** (0 erasures; recap opener observed firing in transcripts) |
| CONTROLS | **PASS** (smoke matches r233 exactly) |
| SELFWIT fix | **LANDED** — defect found in the wild, fix proven RED→GREEN, wild record corrected, pair byte-identical |
| **Succession r258** | **reachable: yes; fun: yes (mourning reads true, the mantle passes cleanly); winnable: not yet — the witness variant still waits on a sitting that never fires** |

## Closeout

- Fix + proof test + driver/analyzer/runner + prereg + corpora + this note committed via `bash scripts/safe-commit.sh` in the worktree (watch for index clobber after every safe-commit).
- Merge `git merge --ff-only journey2-succession` in the main tree; release + remove worktree + branch; final `bash scripts/worktree-reap.sh`; verify main tree clean.
- Rotation write `7→4` with read-back. Delete the lock.
- Merged locally, pending ship — no version bump, no push, no live verification (ship loop owns that).
