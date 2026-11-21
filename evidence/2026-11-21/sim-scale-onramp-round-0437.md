# Loop A lever round fleshout-20261121T0437Z — round record

**Run:** fleshout-20261121T0437Z (Loop A, axis scale-onramp). Base master `b5514461c`
(0315Z round); closeout master `61844c98d`. Both arms adjudicated, both
merged to master, lock + claim retired. No push, no version bump — merged
locally, pending ship.

**Claim:** `hidden_files/lever-claims/fleshout-20261121T0437Z.json` (retired to
`.DEAD` at closeout). Axis scale-onramp, from the tracker latest review
(0315Z round, commit `b5514461c`): next blanks (1) #2628/#2599 — LEAD-SIDE
(lead-weighted redirect first, then draft-armed-holder-as-lead); (2) #2590 —
evade-on-a-quivered-bow. Sibling Loop B live all run on winnability chain
(claim `fleshout-loop-b-20261121T0430Z`, poolfirstfail-b + downedtwice-b) —
NOT touched; #2626/#2632/#2633 owned by B (FIXED by the 0330Z landing).
#2605 launch engine BLOCKED — held branches `sim-pinquaddoor-b` +
`sim-reseedexpiry-b` hold `src/js/villager-brain.js` + `win-plan.js`; not started.

**Adoption, recorded:** the 0437Z run timed out with both arms' judged sweeps
complete on disk but no evidence files, no merges, and no handoff from
sim-leadside-a. The adoption (subagent `b95c6c02`) first verified both arm
workers dead from stale heartbeats (leadside 06:19:40Z, evadebow 05:48:20Z)
and no live processes — and was WRONG: both workers were alive, their
heartbeats stale only from the overnight registry-lock starvation (see
Infrastructure). Both resumed ~07:00Z under an adoption label
(`fleshout-20261121T0615Z`) and completed their own closeouts: evidence
written, substrate/lever reverted, safe-committed, rebased. The adoption
coordinator verified every claim against git/files (never taking a worker
report at face value), adjudicated the evadebow RED tests, merged both arms,
ran the final evadebow rebase onto the post-leadside master, and closed the
round. No judged sweep was re-run by anyone in this closeout.

## Arm 1 — sim-leadside-a: NO-GO PARTICIPATION (merged `9622f8089`)

**Commits:** prereg `5bf069833`, lever+instrument `a53ad393a`, revert
`d0619c33e`, evidence `92844e1c5`, hash-update `9622f8089` (rebased onto
`b20328ad9` by the worker; proofs re-run on the rebased tip:
test-leadside-a 30/40 — the 10 failures are the LEADSIDE-specific legs,
failing by design on the reverted tree — analyzer selftest 94/94).
Instrument + evidence only, 0 src/js delta vs master; LEADSIDE reverted,
`src/js/game.js` + `contests.js` hash-identical to master.

**Question (#2628/#2599):** the 0315Z named next lever — LEAD-SIDE shape 1:
put the contest-prize gun in the hands of villagers who already lead
wave-4+ fights. Two env-gated pieces (`LEADSIDE=1`): a recorder (wave-4+
fight led by a roster villager other than the scholar increments
`state.wave4Leads[vid]`, zero draws) and a term in `_gunRateFighter`
(`+4` per wave-4+ launch led, capped `+12`). Fresh band 107141–107148
(verified fresh), 150d, competent, 16/16 seeds, substrate
VETREENGAGE+PARTYSIZE4+FLEEREPAIR2+FIGHTALLY2+SENSEEXPED+BOWOPEN+SPEARGATE+
GUNRATE+CELLGATE, LEND off; legs differ ONLY by the redirect rule.

**Verdict (frozen bars, `analyze-leadside-a.js`):** holder-days 102 (bar ≥ 40
PASS); armed leads **0** (bar ≥ 2 FAIL — the discriminating bar);
armed volleys **0** (bar ≥ 1 FAIL); armed-holder entries 21 (bar ≥ 3 PASS);
guardrail PASS (deaths/engaged 5.97 vs 5.97, medians 150d/150d, starvation
0 vs 0). The two legs are **identical on every participation number** —
meetings 183 = 183, engaged 142, flees 97, deaths 848 = 848, armed entries
21, armed flees 11, lead attribution (expedition-holder 58, aid 65,
world-tick 60), flee causes (hopeless-after-help 76, floor-hp 15,
learn-withdrawal 1, wise-leave 5). The redirect changed literally nothing
observable in 8 paired villages. Near-miss breakdown: 111 wave-4+
launches; armed earshot 14; eligible earshot **0** — no launch ever had an
armed holder who could be drafted as lead; no living holder on 95/111
(85.6%). Pool presence: 9,944 ticks, holder present 442 (4.4%), holder led
0, draft misses 14, pool fights 233. Lends 0 both legs (LEND off, as
designed). Panel compare `review_required`, no material signal, all deltas
0. The prereg's falsifier fired exactly as written: the binding constraint
is that holders never REACH a fight as leads at all — the next lever is
shape 2 (draft-armed-holder-as-lead), NOT a stronger redirect weight.
Proof at the lever anchor: test-leadside-a 40/40 pre-revert. A reading
recorded in the prereg: the `_gunRateFighter` wave-3-kill term (+4) is dead
in live play — `wave3Kill` is never SET by game code anywhere in `src/`
(only read at contests.js:193) — so the `wave4Lead` term was the first
lead/kill term with a live recorder.

**Finding #2628 stays OPEN** (redirect measured NO-GO; next lever shape 2).
**Finding #2599:** the redirect never fired — the gun still never reaches a
fight as the lead's weapon; the supply line is complete and the leadership
question is now measured, not assumed. Evidence:
`evidence/2026-11-21/sim-leadside-a.md` (+ panel compare
`leadside-a-panel.md`).

**Gun-vanish sink census (#2635, STAYS OPEN):** the driver instruments every
searcaster holder change with attribution. Census, identical on both legs
(7 events each): new-holder:unexplained 3, vanish:unexplained 2,
holder-died:holder-died 1, new-holder:grant-contest-prize 1 — **5/7
unexplained (71.4%)** per leg; transfers 0, dropEvents 0. The drop recorder
caught 0 drops and the holder-died attribution caught only the death it
could see. Next work on #2635 needs a cause for the unexplained vanishes,
not another census.

## Arm 2 — sim-evadebow-a: DIAG-GO (merged `61844c98d`)

**Commits:** prereg `7cfa92185`, instrument+substrate `85e68ebad`,
instrument+proof `7c239e3d2`, analyzer fix `0e6413ebc`, panel builder
`7c9d60c11`, evidence `b8aae9af9`, substrate revert `620a2fc56`,
hash-updates `766179faf` + `61844c98d` (rebased onto `b20328ad9` by the
worker, then onto `9622f8089` by the coordinator after the leadside merge;
proofs re-run on the rebased tip: test-evadebow-a 30/33 — the 3 failures
are the static substrate legs, failing by design on the reverted tree —
analyzer selftest 34/34; analyzer re-run over the corpora byte-identical
to the committed analysis). Instrument + evidence only, 0 src/js delta vs
master; DEPMAT/ROLL35/AMMO substrate reverted, `src/js/game.js`
hash-identical to master (`97956402…`).

**Question (#2590, serve half):** evade-on-a-quivered-bow — the Step 1 diag
after the rollwall: a served quivered-bow holder still walks away from
every wave-4+ monster they lead. Fresh band 107151–107158 (verified
fresh), 150d, competent, 16/16 seeds, substrate DEPMAT+ROLL35+AMMO
re-landed on both legs (FIBERFETCH excluded, concept-dead); legs differ
ONLY by the substrate (ctl: off, diag: on).

**Verdict (frozen bars, `analyze-evadebow-a.js`):** (a) completeness PASS —
3/3 served quivered-bow lead wave-4+ meetings classified, 0 unclassified,
0 instrument errors on all 16 per-seed files, 0 evadeP replication
mismatches; (b) pool floor PASS — pool exactly 3 (≥ 3); (c) dominant reason
PASS — hopeless-after-help 2/3 (66.7%), awareness-evade 1/3, engaged 0;
(d) panel attached (`evadebow-a-panel.md`, `review_required`). **Mechanism
named: M2** — the hopeless-trajectory math prices the volley only as a
diluted lump in `mDealt`: the two fought meetings fired volleys (Theo
107152: 1 shot / 13 dmg, fled R4; gen_34oi09c 107155 d60: 2 shots / 26
dmg, fled R6) and still fled hopeless; priced with the analyzer's own
formula, the volley moves the rounds-to-kill read by +1.4 rounds (13 dmg
of 187, 7.0%) and +0.6 rounds (26 of 522, 5.0%) — mean +1.0 rounds,
against monsters left at 50–79% health with help beside them. M1 is
present in miniature: the third meeting (107155 d65, wave 5) was an
awareness-evade at evadeP 0.67 with 7 arrows — "the awareness formula
takes no ranged input" — and served holders' mean evadeP 0.613 sits above
the all-leads mean 0.364 (they slip away MORE often than the average
lead). Proof: test-evadebow-a 33/33 pre-revert (substrate present);
substrate proofs DEPMAT 43/43, ROLL35 41/41, AMMO 52/52; smoke seed
107151 both legs exit 0. Sense-test: the holders intended to engage,
fought with a party, called for help, and left when the math said
hopeless — a person making a bad call on bad information, not a puppet.

**RED-test adjudication (coordinator, verified):** the timed-out run left
uncommitted edits to `scripts/analyze-evadebow-a.js` and
`scripts/test-evadebow-a.js` (volley-hopeless read over fought meetings,
awareness pass-through) that ran 31/34 with 3 failures. The adoption
worker set them aside and restored both files to HEAD — and the
coordinator verified that call: the two expected values (rtk shift 0.9,
share 0.225) are jointly underivable from the fixture's numbers (mDealt
120, rounds 5, mHpStart 1000) — no single volley damage gives both
(27 dmg gives share 0.225 but shift 12.1; ~2.5 dmg gives shift 0.9 but
share 0.021) — so the draft was half-finished, not a fixture bug in the
committed instrument. The committed instrument is green (33/33
pre-revert) and reproduces the judged analysis byte-identical. The
drafted fix's ideas (count volleys over every fought meeting; pass
awareness through the classifier) are recorded in the arm evidence's
Metric review for the next arm; the red edit left no trace. **No lever
built here** — the diag names M2; the Step 2 lever (price the volley
honestly in the hopeless math, and/or give the awareness check a ranged
term) runs under its own fresh prereg.

**Finding #2590:** serve half now MEASURED (DIAG-GO, M2 named). Next lever:
Step 2 on M2 under a fresh prereg. Evidence:
`evidence/2026-11-21/sim-evadebow-a.md` (+ panel compare
`evadebow-a-panel.md`).

## Wall numbers (this round's judged corpora, 32 configs)

Wins 0/32, national 0/32, table 0/32. Wave 4 reached 32/32. Wave 5:
leadside 4/8, evadebow 3/8 both legs — 7/32 pooled. Median survival 150d
(leadside both legs), 146d diag / 150d ctl (evadebow). Villages sit pinned
at standing 199 — the wave-4 floor — for the whole back half on the
evadebow band (five of eight seeds lost at 199); the leadside band's
survivors climb to 125–535 standing but still no national, no seat, no
win. Nobody starves on either arm (leadside 0 starvation deaths both legs;
evadebow 1 per leg).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
…/hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-21/perseed-<arm>-<leg>/*.json' --metrics
national,table,wins,exiled` on both arms' corpora: designed
recorder-corpus refusal on all of them ("all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs").
No LOUD lines; baseline NOT rolled. (The evadebow refusal was run by its
worker; the leadside refusal was re-run by the coordinator with the
absolute baseline path — the repo-relative path does not resolve, there
is no `telemetry-baselines/` dir in the repo; baselines live under the
goal `hidden_files/`.)

## Infrastructure

- Write flap window 04:46–04:58Z Nov 21 (onset reported ~22:49 CST Nov
  20; end per the r151 run note). No EPERM struck this adoption's writes,
  commits, or ref updates; O_EXCL probes passed before committing.
- Registry-lock starvation all night: the reaper skipped 8 consecutive
  runs behind live registrations; the adoption's own heartbeat calls
  timed out (exit 124); both arm workers' heartbeats went stale while
  the workers were alive — stale heartbeat alone is NOT death, and this
  round is the proof (both workers resumed ~07:00Z and finished their
  closeouts). Check `ps` / live processes before any stale-lock recovery.
- The coordinator caught the evadebow worker's rebase mid-flight
  (detached HEAD at the panel-builder pick, evidence files temporarily
  absent from disk, analyzer run crashing on missing inputs) — a rebase
  in progress, not data loss; the worker finished it cleanly (8/8 picks
  on the second rebase). Do not mistake mid-rebase states for corruption.
- Safe-commit index clobber struck the evadebow index repair and the
  coordinator's hash-update commit (`MM` after a correct commit);
  repaired via the `ls-tree -r` + `update-index --add --index-info`
  pipe, hashes verified, status clean. The leadside worker's staged
  revert was verified exact-inverse before committing (contests.js −9,
  game.js −18; both files hash-identical to master after).
- Master moved three times under the round (Loop B 0330Z landing +
  ship bump `b20328ad9`, leadside merge `9622f8089`, evadebow merge
  `61844c98d`); both branches rebased clean (leadside once by its
  worker, evadebow twice — worker, then coordinator after the leadside
  merge), proofs re-run green on the rebased tips. Loop B live
  throughout (0430Z claim), untouched.
- `check.js --quick` NOT re-run by the coordinator: the r151 adoption's
  gate was running concurrently (PID 32284/32290, started 06:52Z), and
  the merged tip is evidence+instrument only with 0 src/js delta — arm
  proofs green on each rebased tip is the bar met (per the 1830Z/2015Z
  precedent). Caveat recorded here, not hidden.
- Both arm worktrees left registered and clean at closeout (branches
  fully merged); the reaper owns their removal. Claim retired to .DEAD,
  lock deleted — both after same-call run_id verification.

## Next blanks, in order

1. **#2628/#2599 — shape 2: draft-armed-holder-as-lead** (leadside's named
   next lever; a launch rule, bigger design call). Do NOT re-try a
   stronger redirect weight first — the falsifier rules it out.
2. **#2590 — Step 2 lever on M2** (evadebow's named next lever; price the
   volley honestly in the hopeless math, and/or give the awareness check
   a ranged term) under its own fresh prereg. The drafted analyzer
   improvements (volley rollup over fought meetings; awareness
   pass-through) ride with it.
3. **#2635 — gun-vanish sink**: next work needs a cause for the
   unexplained vanishes (5/7 per leg on this round), not another census.
   Grants-by-lead-count (prereg §8a gap) rides with the shape-2 arm.
4. **#2605 — launch engine** still BLOCKED while the held branches hold
   `villager-brain.js` + `win-plan.js`; do not start it. **#2626/#2632/
   #2633** owned by Loop B (FIXED by the 0330Z expirycount landing) —
   not touched.

scale-onramp stays converging (NOT converged): the redirect is proven to
change nothing (no armed holder ever leads), the bow-serve diag names its
mechanism (the hopeless math discounts the volley to ~1 round), but no
village reaches national, no seat is taken, and no armed volley has ever
decided a wave-4+ fight. The directive stands until the tracker records
this axis converged on measured evidence.
