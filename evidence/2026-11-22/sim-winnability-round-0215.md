# Loop A round 0215Z — round record (ADOPTION)

- Run: Loop A fleshout-20261122T0215Z, axis scale-onramp.
- This is an ADOPTION record. The run timed out at ~04:20Z with all three
  arms complete; the adoption rebased + merged the unmerged arm, re-ran
  proofs, ran telemetry + the round gate, and closed out.
- Master tip at adoption start: `00d6195aa` (killloot16 merged,
  searvoice landed). Round-record merge tip: (see Closeout state).

## Arms

### Arm 1 — sim-tier4gate-a: NO-GO (pilot, 8 seeds — no confirm spend)

Earlier apex moves nothing. On the frozen 8-seed pilot band
(107297–107304, 150d death-aware, competent verbatim, substrate
GUNRATE=1 + CELLGATE=1 + standard levers), tier-4 rolls went 30/167
(18.0%) ctl to 34/186 (18.3%) arm — ratio 1.02×, against the frozen
bar (arm ≥ 25% AND arm ≥ 1.5× ctl). Pay rate held (23.5% vs 23.3%);
guardrails clean. Per the prereg's run plan, a pilot NO-GO ends the
run with no confirm spend (tier4access precedent). The lever is
REVERTED at the tip; game code byte-identical to `4266e6cce`.

The diag is the durable result: the gate's binding half is the 25%
apex lottery on a 62–74% eligible base, not eligibility — earlier apex
opened exactly 2 prize rolls on the whole pilot, one of which paid a
fusion_cell. Wider eligibility cannot reach 25% because there is
almost no eligibility left to widen. Counting high-risk as extreme
opens zero (high-risk contests fire only at waves 2–3). The wins/favor
apex paths are dead in live play (favor max 71–79 vs the 100 bar).

- Evidence: `evidence/2026-11-22/sim-tier4gate-a.md` (+ prereg,
  corpora, panel). Proofs on the rebased tip: analyzer selftest 30/30,
  diag selftest 19/19, judge re-run NO-GO. The lever-coupled proof
  test (18/18 against the lever commit) lives in history under
  `f46b00284`/`a1a894ca7`; the file is deleted from the tip with the
  lever, by design.
- Merged: `b5e332ef8` (rebased from `ba031124f` onto `00d6195aa`;
  37 files, +323,642, evidence + scripts only, 0 src/js delta).
- Finding #2648 UPDATED by the arm.

### Arm 2 — sim-killloot16-a: INCONCLUSIVE (16-seed band re-judge)

0 kill-loot searcaster arrivals on either leg of the full 16-seed band
(107281–107296, 105 kill-loot events per leg, 36 distinct items,
searcaster not among them), so the frozen zero-arrival rule fires: bar
3 is INCONCLUSIVE, not GO, not NO-GO. The legs are
trajectory-identical on every seed (KILLBUNDLE adds zero RNG draws and,
with no arrival ever occurring, nothing could diverge). Guardrails pass
trivially (starvation 7 = 7, median survival 150 = 150). The fixture
(re-verified GO on base `4266e6cce` and again on `9882eeccd` after the
searvoice landing) still shows a bundled kill-loot gun fires 2 shots
in a forced wave-4 fight.

What the band establishes: the per-event rate is far lower than the
"1 arrival per 8 seeds" the fixture prereg's 88% estimate assumed. A
kill-loot searcaster needs a tier-4 roll (taper-up 5–20% by wave) AND
a 1-in-15 draw from the tier-4 kill pool, and GUNRATE ×4 weighting is
contest-only. Tally now 0 arrivals in 24 independent seeds (pilot 8 +
band 16). Next step is a code-level read of the tier-4 kill-roll rate,
not a wider blind band.

- Evidence: `evidence/2026-11-22/sim-killloot16-a.md` (+ prereg,
  analysis, panel; corpus under `evidence/2026-11-21/`).
  Proofs: 12/12 + selftest 17/17, re-run on the rebased tip.
- Merged: `00d6195aa` (by the run, before timeout). KILLBUNDLE stays
  env-gated, default OFF.
- Finding #2649 UPDATED by the arm. NEW finding filed by the arm:
  CONTEST GUNS NEVER FIRE EITHER — 15 contest searcaster grants per
  leg arrived and 0 searcaster volleys fired from any source; next
  step is tracing one granted gun's life before proposing a lever.

### Arm 3 — sim-searvoice-a: GO (narration fix, [needs-eyes])

The searcaster volley now reads as a gun. The fieldFight volley block
branches on `_rwId === 'searcaster'` (the block's own CELLGATE
convention): opening "raises the Searcaster", shots "fires wide — the
discharge scorches the dirt beside the sky. (cell spent)", closing
"lowers the Searcaster", dry gun "the trigger clicks on nothing".
Zero bow language in either transcript. All six frozen bars pass. The
fixture that proved the bundle fires still passes (`--compare` GO),
and the mechanics are byte-identical to the pre-fix run — arm 2 shots
/ 0 hits / 0 dmg, ctl 0 shots, both legs vKill in 11 rounds. Default
ON, no env gate (a gate would ship the gun still "nocking arrows" by
default). Bow lines survive byte-identical for bows.

- Evidence: `evidence/2026-11-22/sim-searvoice-a.md` (+ prereg).
  Proofs: test-searvoice-a GO (S1–S6), proof 12/12, selftest 17/17.
- Fix commit `b5fb12e10`, merged `9882eeccd` (by the run, after two
  landing rebases, proofs re-run green on each).
- Findings: narration item [fixed]; closes #2623 (same defect, filed
  first). #2635 (gun-vanish / holder supply) is NOT covered by this
  fix. Leftover, same class: crossbow/sling volleys still use bow
  lines — a later narration arm should revise the S4 source bar.

## Wall numbers

| Metric | tier4gate ctl | tier4gate arm | killloot16 (both legs) |
| --- | --- | --- | --- |
| Wins | 0/8 | 0/8 | 0/16 |
| National | 0/8 | 0/8 | 0/16 |
| Table | not instrumented | not instrumented | not instrumented |
| Wave 5 reached | 3/8 | 4/8 | 10/16 |
| Wave 4 reached | 8/8 | 8/8 | 16/16 |
| Median survival | 151d | 151d | 150d |
| Villages lost | 2/8 | 2/8 | 7/16 |

No material change landed for scale-onramp: wins 0, national 0
everywhere. The tier-4 gate (~15–18% tier-4 rolls) is still the wall
for gun supply, and the 25% apex lottery — not eligibility — is now
named as its binding half. The gun-supply chain's next question is
downstream (granted guns never fire), not the gate.

## Telemetry deviation check

`telemetry-check.js` (scale-wall baseline, `--allow-recorder-corpus`)
on all four corpora dirs (tier4gate ctl/arm, killloot16 ctl/arm):
exactly the same 3 LOUD regime lines on each — national 12→0, table
16→0, wins 16→0 — the known pre-seat regime artifact (baseline sums
across WINSEAT rows vs competent pre-seat substrate). EXPLAINED, same
as 1530Z/1630Z/2215Z/2030Z/2315Z. Baseline NOT rolled. No other LOUD
lines.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-0215-gate`
on tip `87c8a133a` (log
`hidden_files/round-0215-gate.log`): **331 passed, 13 failed in 1004s**,
GATE_EXIT:1. **0 attributable.** The 13:

- 5 standing families, signatures matching the standing set exactly:
  measurement-proof-update ("Proof source inputs are not current");
  measurement-workflow (retained neutrality proof coverage — the same
  stale proof); phone-frame-proof (stale receipt on index.html, 3/3
  failing lines the retained-input staleness set); living-garden +
  one-person-army deed-attainment, both 120.1s timeouts (no failed
  assertion, partial "ok" lines).
- 5 flap EPERM artifacts — each shows an EPERM write refusal in the
  gate log, each passes solo on clear writes: human-combat-parity
  (writeFileSync in the stack; solo 69/69), measurement-flags
  (EPERM write; solo 5/5), measurement-source-text (EPERM write;
  solo 4/4), prepared-runner-custody (EPERM writeFileSync; solo
  4/4), proof-text-identity (EPERM write; solo 9/9). The gate ran
  while a flap window recurred on the new boot (~05:58Z; flap-watch
  cycles 05:58:02Z + 05:59:08Z FLAP, ALL-OK again by 06:12:44Z).
- 3 load flakes, all pass solo: measurement-cache-flags (solo 4/4),
  occupation-panels (solo 25/25), capable-bot (120.1s timeout under
  contention with the register checkout + ship bump; solo 40/40).
  No failure was waived — every one was re-run solo except the 5
  standing families, whose signatures are the documented ones.

Coverage note: the gate tip `87c8a133a` contains the tier4gate merge
(`b5e332ef8` ancestor) and the record branch's base; this round's
merged content is evidence + scripts only, 0 src/js delta. Master
advanced after gate start — ship bump `503d048a8` (version files
only) and establishment r265 `68e0503c4` (src fixes, covered by that
adoption's own gates: 339/5, 332/12, 339/5, all 0 attributable).
The record merge adds only this evidence file on top of
`68e0503c4` (branch rebased before the ff-only merge), so no
un-gated game change rides in with this record.

## Adoption notes (infrastructure)

- The run timed out at ~04:20Z (2h budget) with all three arms
  complete; searvoice landed + released, killloot16 merged but its
  release stuck behind the registry-lock jam, tier4gate unmerged.
- Registry-lock jam: the Lane B succession registration
  (`worktree-register.sh journey2-succession`) held REGISTRY.lock
  across a slow `git worktree add` after the ~02:51Z machine restart;
  the crisis r263 release queued behind it. The adoption's own
  background release (pid 6537+) + register (pid 3879) were KILLED
  by the ~12-min background-exec SIGTERM while queued on the flock —
  the lock freed only ~04:40Z, when the succession registration
  landed — so they did NOT survive, and both had to be re-run. The
  re-runs first hit the flap (exit 120, empty logs) and then
  succeeded once writes cleared: tier4gate released 05:53Z as
  done-merged; worktree removed + branch deleted (ancestor-verified).
  The first register retry failed because the killed attempt had left
  an orphan branch `sim-winnability-round-0215` at `87c8a133a` (0
  commits ahead of HEAD, no worktree, no registry entry) — branch
  deleted, re-registered OK after a ~16-min checkout (worktree at
  `503d048a8`). Live work throughout — never a dead lock.
- VM replaced twice: ~04:23Z (boot `78c1790f`, uptime 3 min at
  04:26:30Z) and ~05:51Z (boot `0f6c1d52`, uptime 0 min at 05:52:26Z).
  The 04:23Z restart killed the in-flight establishment r265 gate
  (pid 45615) and crisis r263 gate (pid 47920) plus the succession
  register and crisis release; both adoptions restarted their gates
  after the restart. The 05:51Z restart killed the adoption's
  in-flight wait exec (no work lost — it was only a probe); writes
  cleared on the new machine; the flap watcher was restarted 05:52Z
  (pid 2022, alive).
- Lock anomaly: the 0415Z-scheduled Loop A occurrence started late at
  ~04:20:08Z, judged the 0215Z run dead (arm heartbeats 02:20–02:55Z,
  all stale), did stale-lock recovery, and wrote its own lock
  `fleshout-20261122T0420Z` at 04:21:28Z — then finished in 106s as
  a stand-down (no claim file, no worktree, no sims), leaving the
  0420Z lock orphaned. After the VM replacement the lock file read
  `fleshout-20261122T0215Z` again (home sync restored the pre-0420Z
  content). The 0420Z orphan no longer exists on disk and needs no
  separate handling.
- Write flap: window 04:09–04:11Z (~2 min, EPERM on probes A/B/E/G/H/I,
  strace itself blocked), cleared 04:12Z; a long window ~04:38Z–
  ~05:51Z (~73 min; the watcher calls it the same flap since
  04:38:05Z) that cleared only on the ~05:51Z machine replacement;
  and a new window opening ~05:58Z on the new boot during the gate
  (the gate's 5 EPERM failures are its artifacts). No flap losses on
  this round's writes (killlootfixture ctl json was 0 bytes at ~04:11Z
  while Loop A's writer was mid-write; verified 13,181 bytes after).
  `docs/ONTOLOGY.md` was truncated to 0 bytes at ~05:30Z (flap
  signature) and restored byte-identical from HEAD at 05:52Z (hash
  `6fdba43b83c19ac9ef51e7dc946999da4acf3fda`, 354,624 bytes); main tree
  clean after the restore apart from the ship loop's live bump files,
  which the ship committed as `503d048a8`.
- Reaper skip chains continued through the round (registry-lock jam);
  every investigated holder was live loop work.
- Ship bump `503d048a8` and establishment r265 (`68e0503c4`, gates
  339/5 + 332/12 + 339/5, all 0 attributable) landed before the
  record merge; the record branch was rebased onto `68e0503c4`
  before the ff-only merge.

## Closeout state

- tier4gate merged `b5e332ef8`; branch deleted, worktree removed,
  registry entry done-merged (all verified by this adoption).
- killloot16 merged `00d6195aa` (by the run); released done-merged
  by this adoption; worktree removed; branch deleted (was
  `00d6195aa`, ancestor-verified before removal).
- searvoice merged `9882eeccd` (by the run); worktree released by
  the run.
- Gate 331/13, 0 attributable (see Gate above; log
  `hidden_files/round-0215-gate.log`).
- Findings: no appends by this adoption — the arms already updated
  #2648, #2649, the searcaster-narration [fixed] item and #2623, and
  filed the contest-guns finding (sim-findings.md lines 2664–2669).
- Tracker + memory note + tracking entry: written by this adoption
  immediately after the merge (see convergence-tracker.md entry for
  fleshout-20261122T0215Z).
- Claim: file absent at record write — no
  `fleshout-20261122T0215Z.json` or `.DEAD` on disk (verified by
  `ls`); retired/removed before the adoption's closeout step, so
  there is nothing for this adoption to delete.
- Lock: deleted by this adoption LAST, immediately after the merge +
  tracker/memory/tracking steps, only if the run_id still reads
  `fleshout-20261122T0215Z` per-line at that moment (same-call read
  + delete).
- Adoption worktree `sim-winnability-round-0215`: released +
  removed + branch deleted after the merge.
