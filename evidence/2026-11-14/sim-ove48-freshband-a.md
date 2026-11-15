# sim-ove48-freshband-a — OVE-48 FRESH-BAND SURVIVAL RE-TEST: GATE FAILED, UNMEASURED (Loop A, fleshout-20261115T0547Z)

Run: fleshout-20261115T0547Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-freshband-a, branch
`sim-ove48-freshband-a`, worktree
`~/workspace/worktrees/sim-ove48-freshband-a`.
Prereg: evidence/2026-11-14/sim-ove48-freshband-prereg.md
(committed 55c895dd8, BEFORE any judged sim ran). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ evidence/2026-11-14/sim-transplant15a-band3.md (band 3 — CARRIER
3/8 → 0/8) + evidence/2026-11-14/sim-ove48-conv.md (mechanism
PROVEN: subject dawn-aligned 74.9% vs baseline 28.7%) +
evidence/2026-11-14/sim-ove48-mech-a.md (causal path PROVEN
NEGATIVE; under held conversations the collapse does NOT reproduce:
subject 4/8 vs far end 3/8).

## Outcome

- OUTCOME: UNMEASURED. Verdict: UNMEASURED — the baseline gate
  failed, so no subject leg was cut and nothing about OVE-48 is
  judged on this band.
- Verdict: UNMEASURED. The baseline leg (far end 203a32775 on fresh
  band 190561–190568, STEP t-ove48-freshband-base) reads 1/8
  survived — below the pre-registered gate of >= 3/8. Per the
  binding decision table and the 8c precedent, the arm STOPPED:
  no subject leg was run, no CARRIER / NOT-CARRIER / AMBIGUOUS
  verdict is recorded, and no further band is proposed by this
  arm. The band-3 CARRIER verdict stands on its own band; this
  band neither confirms nor overturns it.
- Subject branch `transplant-15a-narrowed-subject`: verified at
  run start before any sim (tip 493d7a975, tree
  6d6216e3e414518d2c335829e130e65ec849941b — exactly the predicted
  pick-1-resolved tree; 3 files +320/-3; green-list.txt NOT in
  the commit, byte-identical to the far end, sha256 138a5e86…
  both sides) and left in place, untouched by this arm. No commit
  was made onto it.
- STEP t-ove48-freshband-base: 8/8 corpus, 0 instrument errors,
  validity V1–V5 pass (V5 recorded not-applicable: band3Step
  null, 0 mismatches — see §Infrastructure). STEP
  t-ove48-freshband-subj: NOT RUN (gate failed). Both legs were
  to be 150d death-aware, competent verbatim own-policy, standing
  fix f8fda4295a99 swapped in; the baseline leg ran exactly so
  (native standing.js 75762cb2…, fix sha verified by the step
  script, native restored byte-identical afterwards).

## Prereg (binding, committed before any judged sim)

See evidence/2026-11-14/sim-ove48-freshband-prereg.md. Base:
far end 203a32775 with the roster-check standing fix swapped in
for every step (fix f8fda4295a99; native restored byte-identical
afterwards, sha-verified). Fresh seeds 190561–190568 (verified
fresh: zero hits in any .md under evidence/ or hidden_files/,
re-verified by the stage-1 proof excluding this arm's own files).
150d death-aware, competent verbatim own-policy per step
(walk-out default, COMPETENT_TALK NOT set — exactly as band 3
ran it). Deciding bar (verbatim): CARRIER if subject <= 1/8 AND
baseline >= 3/8; NOT-CARRIER if subject >= baseline - 1;
AMBIGUOUS otherwise (inconclusive, no confirm licensed on this
band alone); GATE: baseline >= 3/8 or STOP — verdict
UNMEASURED, NO subject leg cut. The aligned-share mechanism read
is diagnostic only (already proven by sim-ove48-conv-a); the
survival bar is the judge.

## The steps — per-seed table

### Leg 1 — baseline, far end 203a32775, STEP t-ove48-freshband-base: 1/8 survived

| seed | days | end | maxWave | standing | deaths | vetSays | errors |
|------|------|-----|---------|----------|--------|---------|--------|
| 190561 | 95 | village-lost | 4 | 199 | 74 | 50 | 0 |
| 190562 | 150 | survived | 4 | 199 | 144 | 28 | 0 |
| 190563 | 99 | village-lost | 5 | 225 | 79 | 27 | 0 |
| 190564 | 82 | village-lost | 4 | 199 | 84 | 40 | 0 |
| 190565 | 81 | village-lost | 4 | 195 | 63 | 31 | 0 |
| 190566 | 103 | village-lost | 4 | 199 | 102 | 75 | 0 |
| 190567 | 132 | village-lost | 4 | 199 | 84 | 16 | 0 |
| 190568 | 110 | village-lost | 4 | 199 | 87 | 24 | 0 |

Survived 1/8 (190562 only). Median 103d (analyzer upper-median;
the middle two days are 99d and 103d). Wave-4 8/8, wave-5 1/8
(190563 only); national 0, table 0, wins 0; regional 8/8.
Tribute ready 1/8 (190562 only — the sole seed with 2 living
wave-4+ veterans, ladderVets4=2; every other seed 0). Blooded
end-state 3/8 (190562, 190566, 190568). Deaths 717 total.
Standing range 195–225 — strikingly flat: seven of eight seeds
end at exactly 199.

Death causes (717 total, combat-heavy, same profile as the
collapse band): villager combat 290, expedition 197, combat 99,
the wild 83, monster 21, the arena 3, contest 3, starvation 2,
sickness 2, a wound that wouldn't close 4, lockjaw 2, ambush 2,
a stranger 2, the night 1, The Congregation 1, Big-Eyes 1,
Big Big 1, The Callback 1, The Reunion 1, the expedition 1.

### Leg 2 — subject: NOT RUN

The gate failed (baseline 1/8 < 3/8), so per the prereg the
subject leg was not cut. No subject corpus, summary, or driver
log exists for STEP t-ove48-freshband-subj, by design — a
subject corpus on an undiscriminating band is not evidence.

## What this means (plain words)

On eight fresh, unseen starting dice, the far end itself
survives only once — so this band cannot tell us anything about
whether OVE-48 changes survival. The question the arm was asked
— does the 0/8 vs 3/8 gap reproduce? — has no answer from this
band, because the band never gave the far end a fair chance to
show 3/8 in the first place. The one village that did survive
(190562) is the only one that met the veteran bar for tribute
(two living wave-4 killers) — and it survived with 144 deaths,
the heaviest toll on the leg. Everywhere else the villages die
fighting, mostly on expeditions and at the door, between day 81
and day 132, with the pantry barely registering (2 starvation
deaths in 717). The scale wall stands untouched: regional
everywhere, national nowhere, no table, no win.

For the record, the far end now reads 4/8 (collapse band), 1/8
(fresh band 1), 3/8 (band 3), 1/8 (this band) across four bands.
The band itself moves survival by three seeds — the honest scale
of band-to-band noise, and the reason the gate exists. This arm
is the second time the gate has saved a subject leg (the 8c
precedent); the gate is doing its job.

## Sense-testing (SENSE-TESTING LAW — transcripts read, judged in plain words)

Read the vetSays transcripts from all 8 per-seed files (291
lines). The villages read like people:

- Veteran kills are announced on camera with names ("Ruby just
  put down The Callback... on CAMERA. That's a veteran kill,
  folks. REMEMBER the name." — seed 190562, d26; "Austin just
  put down The Terms of Service" — same seed, d29; "Henry just
  put down The Focus Group" — seed 190563, d31).
- The System's audience voice stays in character ("Oh, you
  survived the AUDIENCE NOTES? Cute. We've stopped pretending
  these are animals now. That was the FINAL DRAFT, folks — what
  comes out of the treeline next was never alive" — identical on
  seeds 190561, 190562, 190563, d25).
- Teaching and knowledge travel: "Desmond taught everyone about
  Ground Elder. The Codex grows without you lifting a finger."
  (190562, d51); a forager's uncertain identification ("European
  Elder, see the leaves?" — 190563, d6) that the village then
  learns over eight days of handling.
- The surviving village reaches ARC IV ("ROUNDING ERROR
  RECLASSIFIED: ANOMALY. Organic consumption yields impossible
  output." — 190562, d40) and is told to face the Mirror Draft —
  the endgame content is reachable on this band, just not
  survivable past it for seven of eight seeds.
- The low-trust refusal repeat appears once, mildly: the same
  "Ask someone who trusts you. (Trust too low.)" line twice on
  seed 190561, d2, in one day — two refusals in a day, not a
  stuck loop across days. No flag carried forward.

Mechanism diagnostic (not judged): 774 conversation opens,
100% classified, dawn-priority reads 0 (control, as expected —
the pick function is absent on the far end), weighted-pick
opens 443, dawn-aligned share 31.2% — within a few points of
band 3's baseline 28.7%, which is the expected no-pick level.
Want mix: curious 343, ask_favor 310, seek_comfort 63,
seek_taken 51, share_news 4, just_company 3. Zero of the 361
captured say-lines mention dawn, commitment, or what a
villager wants — the same as band 3, and the same known channel
limit (spoken dialogue does not go through Game.say; see
sim-ove48-mech-a).

One flag, recorded not fixed (measurement arm; already-open
finding, corroborated again): the BLOODED BEAT vs FLAG reverse
case — the exact beat "Blooded — the village knows where the
Producers bleed" fires 0 times on this leg, yet the blooded
flag ends TRUE on 3 seeds (190562, 190566, 190568). No new
backlog entry; the open one in hidden_files/sim-findings.md
stands. (The 190562 case is the same seed that meets the
tribute bar — flag and readiness agree there, the beat is the
silent one.)

No robotic, static, or repeated-beyond-mechanism dialogue was
found beyond the Blooded beat silence in flag 1 and the single
same-day refusal repeat. Nothing in the transcripts reads wrong
for a baseline leg with no pick in it.

## Fix policy

The bisect prereg's fix policy binds this arm: no game-code
change lands unless the change is a DEFECT, small, carries its
own proof, and restores ≥3/8 on the same band. No verdict was
reached, so no fix question arises. This arm lands NO
game-code change. The coordinator decides whether the OVE-48
survival question gets another band (this arm does not propose
one on its own, per its prereg) or rests on the band-3 CARRIER
read plus the PROVEN-NEGATIVE causal path and the held-
conversation non-reproduction.

## Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  All commits and file writes landed first try.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (55c895dd8) — `git status` showed all three committed files
  as staged-deleted although the commit was correct (worktree
  hashes matched the HEAD blobs exactly). Repaired with the
  documented pipe (`git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`); a mode-only residual
  on the step script (my own `chmod +x` before the commit)
  was resolved by matching the conv step script's 644 mode
  (`git update-index --chmod=-x` + `chmod 644`); verified
  `git status` empty + `git diff HEAD` empty afterwards. No
  work lost. (Fourth consecutive arm on this family to be struck
  on the prereg commit.)
- REGISTRY LOCK: the worktree heartbeat took ~8 minutes to land
  (registry lock held by the reaper's long scan — the known
  lock self-contention); it did land, first attempt, no retry.
- STEP-SCRIPT HAZARD (followed from the prereg): the script was
  run from the /tmp copy with REPO set to the worktree. The
  step's exit code was masked by the `| tail -25` pipe in my
  invocation (the chain printed STEP-RC=0 from tail, not the
  script) — the classification was verified directly from the
  summary JSON instead (survived 1/8, validity V1–V5 pass, seeds
  + RUN fields correct). Lesson recorded, not repeated: verify
  from the summary, never from a piped RC.
- ANALYZER PATCH (pre-registered): the scratch analyzer patch
  worked first try — the driver log carries the patched SEEDS
  line (190561…190568) and the "V5 does not apply" note; the
  summary records seeds 190561–190568, run
  ove48-freshband-pilot, validity V1–V5 pass, replication
  band3Step null with 0 mismatches. The repo analyzer is NOT
  modified (proof verifies it still hardcodes the band-3 band).
- No service restart struck this arm. No safe-commit refusal.
- Telemetry deviation check: REFUSED by the tool
  (recorder-corpus class, same as all prior bisect/transplant
  arms) — "refusing recorder-corpus input: all 8 --current rows
  carry top-level anchorCommit". Baseline NOT rolled. No LOUD
  lines to investigate.
- CORPUS PATHS: the driver wrote to evidence/2026-11-14/
  (perseed-ove48-conv-t-ove48-freshband-base/ plus the driver log
  and summary), exactly as the prereg recorded — NOT to
  evidence/2026-11-14/perseed-ove48-freshband/.

## Metric review

- The gate worked as designed and saved the subject leg: the
  baseline read 1/8, the band is harsher than the collapse band
  and cannot discriminate, and the arm stopped without cutting
  a subject corpus that would have been uninterpretable. The
  8c precedent is now a working gate, not just a note — this is
  the second band it has caught (fresh band 1's 1/8 was read
  without a gate and its subject leg ran anyway).
- The deciding bar was never reached (no subject count exists),
  so nothing was re-scored: UNMEASURED is the pre-registered
  outcome for exactly this read. No metric proved wrong.
- The analyzer patch (SEEDS + RUN + step ids + V5-not-applicable)
  is now a named, pre-registered adaptation that worked first
  try — the fresh arm's metric review asked for exactly that
  treatment, and the proof's scratch-patch simulation (exactly
  5 lines changed) predicted it.
- The standing-flat read (seven of eight seeds ending at exactly
  199) is a curiosity, not a verdict input: standing caps at 199
  for regional villages on this band, and only the wave-5 seed
  (190563) breaks past it to 225. Worth a glance if a future arm
  needs a standing diagnostic; not this arm's question.
- The median-days secondary (103d) moved with the verdict in the
  expected direction this time (harsher band, shorter lives) —
  unlike band 3, where the subject outlived the baseline while
  surviving less. No secondary is judged.

## Proof

- scripts/test-ove48-freshband.js — stage 1: 50 passed, 0
  failed (committed with the prereg, 55c895dd8); stage 2: 17
  passed, 0 failed (baseline corpus 8/8, gate outcome UNMEASURED,
  no subject corpus cut, standing restored, evidence records).
  (Stage 2 found one test bug first: it called the repo analyzer's
  loadCorpus, which hardcodes RUN ove48-conv-pilot and could not
  see this arm's ove48-freshband-pilot files — fixed to load the
  fresh-band corpus directly; the repo analyzer is untouched.)
- scripts/test-ove48-conv.js — not re-run (the conv tooling was
  untouched; this arm's proof covers the reused driver,
  analyzer tables, and instrument live check on this tree).

## Commits (this arm, branch sim-ove48-freshband-a)

- 55c895dd8 — prereg + freshband step script + proof test
  (stage-1 50/50)
- (this run) — baseline corpus + driver log + summary + this
  evidence file
