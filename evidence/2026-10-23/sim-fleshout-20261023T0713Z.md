# Run fleshout-20261023T0713Z — scale-onramp ADOPTION RUN (flesh-out loop)

Axis: scale-onramp (the blocking axis per STANDING DIRECTIVE + convergence tracker; directive lift remains a Steve call).
Claim: hidden_files/lever-claims/fleshout-20261023T0713Z.json (written before any of this run's sims).
Loop B live on food-economy throughout (claim fleshout-loop-b-20261023T0658Z.json; arms sim-scholardistsafe-b + sim-storageshed-b5, both live) — zero file overlap by design (my arms: scale-onramp, namespaces armorvillage/w5door-b/havendraw; B: policy/instrument-side storageshed-b5/scholardistsafe).

## STALE-LOCK RECOVERY (run start)

- Lock fleshout-20261023T0515Z (created 2026-10-23T05:08:01Z) found at run start, ~125min old → deleted per the >90min fallback. Its claim was already marked .DEAD.
- The dead run's coordinator was dead (heartbeats 06:01Z, 68min stale, no coordinator ps), but all three arm workers were LIVE (file writes 07:00–07:06Z in all three trees). Per the ORPHANED-WORKERS lesson: adopted all three trees (registry run_ids rewritten to this run, heartbeats refreshed), hands off until quiet.
- By ~07:21Z all three trees were quiet >15min with no live processes — the orphan workers were gone (their results orphaned with the dead parent). Verdicts recovered independently from committed/in-progress evidence.

## ARMS (all adopted from the dead 0515Z run)

### 1. sim-havendraw-b — DIAG-GO (landed b9ae32922, merged to master)
Haven-assault exposure DIAG (#831), instrument-side, zero src/js. The worker died with 1/16 census JSONs on a stale anchor; this run rebased the tree to master f5f19667c and re-ran all 16 configs cleanly (seeds 65801–65808 × {leadfeast, belongfeast}, mantlechain DIAG substrate, 180d death-aware). Proof 29/29 GREEN post-rebase (re-verified twice more across master moves). Evidence: evidence/2026-10-23/sim-havendraw-b.md.

Findings: wave-4+ player fights 105 (5.13/100vd), 98/105 at haven — but the channel is AMBIENT: origins {field:93, feastdraw:12} (field = checkEncounter contact at the haven tile; zero raidreach/tent/trap/reengage). Villager wave-4+ {havengrounds:15, raiddefense:7, lingerer:15}. The haven isn't besieged — it's stood in the path of. Muster (0.88/100vd) doesn't prevent ambient contact. 10/10 scholar wave-4 deaths as mantle-holder. Design-call inputs delivered (assault rate 9.14 raids/100vd; draw/defense levers existing vs missing). #831 updated in sim-findings.md with the refined measurement; proposed `havencontact` as a named player origin class. Sense PASS (d86 Influencer fight: death has weight, village reacts, mantle passes mid-fight; notes: strike spam, doubled lines, no warning beat for ambient contact).

### 2. sim-w5door-b — DIAG insufficient-data (landed bd4841a5f, merged to master)
Wave-5 door-openers census on current master (fixes #793 stale-base), instrument-side, zero src/js. The worker died with 13/16 pilot configs on a stale anchor; this run re-ran the full pilot on master f5f19667c (16 configs: 0/16 doors, 1/16 windows) → pre-registered confirm triggered → confirm (seeds 65519–65522, 8 configs). Total 24 configs, all anchorCommit f5f19667ce19. Proof 16/17 post-rebase (E5 seed-freshness miss is a re-verification artifact — freshness verified pre-sweep per the brief; E5 can only pass pre-sweep). Evidence: evidence/2026-10-23/sim-w5door-b.md.

Findings: **0/24 doors opened** on the richest measured door substrate. Binding gates named via w5gates-lib, 0 unexplained: {defer5:16, w3rung:2, plenty-cap:2, stand-raw:3, defer4:1}. The defer5 gate is the binding constraint. The one window (s65517 armorydrive, r5.veterans=2 on d114–123) stayed shut on `short:["armor"]` — the armor leg never filled. This composes with sim-armorvillage-b: the census proves the armor leg binds the door on the window; the build arm is the live answer. Sense: no unlock beats exist; the near-miss has no fiction (flagged blank).

### 3. sim-armorvillage-b — BUILD arm (in progress at write time)
The #646 'armor the village' economy drive, game-side. The worker died mid-build (uncommitted src/js changes, no proof, no pilot). This run completed the build: wrote scripts/policies/armorvillage.js (ARMORVILLAGE=1 policy: gift best spare to worst-armored armed fighter, deposit strictly-worse spares, ≥2-spares guards, 1+1/day cadence), scripts/test-armorvillage-b.js (proof), scripts/sweep-armorvillage-b.js + scripts/analyze-armorvillage-b.js (32-config pilot). Proof **24/24 GREEN** post-rebase (E0 shape, E1 verbs incl. #806 displaced-piece conservation, pile deposit/take, gift +2 trust, NPC craft beats; E2 determinism; E3 det-gate byte-identical; E4 mechanism-fire). Committed 0f2ae0c3, cherry-picked cleanly onto master as 1015519a5 (the one `git rebase` attempt duplicated its pick and stalled — aborted safely, cherry-pick used instead; new AGENTS.md lesson candidate).

Pilot: 32 configs (seeds 67601–67608 × {leadfeast, belongfeast} × {control, armed}, ARMORYDRIVE=1 pinned both arms, 180d death-aware) on master f5f19667c. (Results below.)

## Pilot results (sim-armorvillage-b)

32/32 configs (seeds 67601–67608 × {leadfeast, belongfeast} × {control, armed}, ARMORYDRIVE=1 pinned both arms, 180d death-aware, anchor f5f19667ce19). Proof 24/24 GREEN (re-verified post-rebase).

**PRIMARY: NO-GO** (binding — the craft leg missed):
- (1) pile deposits ≥2/seed: **8/8 PASS**
- (2) villagers equipped from pile/hand-off ≥2/seed: **8/8 PASS**
- (3) NPC craft beats produce ≥1/seed: **0/8 FAIL** — zero crafts on all 32 configs
- armored15 median-of-medians: control 3 → armed 5, **PASS** (bar +0.5)

Guardrails: median survival 158d→140d (median *paired* diff 0 — symmetric chaos tails); starvation 12→11; no new death kinds; death-cause shares sane.

**Mechanism autopsy** (kill discipline): the craft beat is substrate-starved, not broken. Proof E1d shows it fires when materials exist; a 3-seed diagnostic found villagers wearing bark/hide armor (knowledge gate fires) but communal bark/vine/hide at **zero on all 360 village-days** — nobody brings recipe materials home communally. The blank is the materials inflow channel (filed to sim-findings.md). The beat is documented as precondition-starved, not killed. The -18d survival dip is chaos (paired median 0), not lever harm.

**Sense**: PASS — gift/deposit beats read as people ("You hand Luz the Bark armor. Luz pulls it on over their clothes, checking the straps — it fits."); the pile feeds partly through corpse loot with trauma honesty.

**Verdict**: NO-GO on the binding primary, landed as a measured NO-GO layer (env-gated default-off; the #806 fix always-on as a bugfix). The pile/gift/draw structure fires at scale and moves armored15 3→5 — the armor leg the w5door census proved binding. Named nexts: materials-inflow design; armored15 confirm on fresh seeds.

## Metric review

- havendraw-b: pre-registered DIAG-GO bars all delivered; no metric revision. Proposed `havencontact` origin class for the next run.
- w5door-b: the pre-reg's insufficient-data clause applied as written (0/24 unlocks); no re-score. Named nexts: armorvillage BUILD (landed this run), defer5-gate DIAG, census re-run post-armorvillage.
- armorvillage-b: judged as written — NO-GO (craft bar 0/8). Metric note: the craft bar conflated beat-works × materials-exist; a future craft arm should pre-register the materials precondition separately.

## Village assessment

The three corpora tell one story: villages reach national (havendraw 8/16, w5door 12/24), sit the table (1/16, 15/24), unlock wave 4 (14/16, 20/24) — but the wave-5 door doesn't open (w5door 0/24, defer5 binding; the one window shut on the armor leg). The armorvillage structure moves the armored count 3→5 on median, i.e., to the demand line. The haven is where wave-4 is faced (havendraw: 98/105 player wave-4+ fights at haven, ambient contact the channel). Scholars keep dying as mantle-holders (10/10). The wall didn't move this run, but the armor leg now has structure where there was luck-only, and the exposure channel is named.

## Wall numbers (this run's corpora)

- havendraw (n=16): national 8/16, table 1/16, wins 0/16, wave4 14/16, wave5 1/16, median 137d
- w5door (n=24): national 12/24, table 15/24, wins 0/24, wave4 20/24, wave5 0/24, median 155d
- armorvillage pilot (n=32): armored15 median 3→5 (control→armed); median survival 158d→140d (paired median diff 0)

## Convergence note

Axis scale-onramp stays converging (NOT converged): no lever landed that moves the wall, but two fronts moved — the haven-exposure DIAG is now measured on current master (ambient contact is the channel, #831 refined), and the wave-5 door's binding constraint is named (defer5; armor leg on the window). The armorvillage BUILD arm is the live lever against the armor leg. Directive lift remains a Steve call.

## Infra notes

- safe-commit.sh's private-index clobber struck on all three arm commits this run (3rd–5th sightings overall) — repaired via the --add --cacheinfo recipe after blob verification; commits verified correct via git show --stat.
- `git rebase <newbase>` on a single-commit branch duplicated the pick and stalled mid-rebase ("It has been rescheduled"); recovered via `git rebase --abort` + cherry-pick. Cherry-pick is the safer single-commit rebase.
- Master moved 5× during this run (rogue-p1, journey loops); all arm branches rebased clean (instrument-only) with proofs re-verified post-rebase; ff-only merges.
- Registry clean; main tree clean at closeout (pending final verification).
