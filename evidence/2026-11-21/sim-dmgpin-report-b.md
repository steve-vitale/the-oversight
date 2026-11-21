# sim-dmgpin-report-b — Re-judge of #2619 / #2636: the damage lever carried with the pin — GO

- Arm: `sim-dmgpin-report-b`, Loop B round `fleshout-loop-b-20261121T1630Z`
- Verdict: **GO** — every frozen bar passes (M1–M3c proofs green, P1 3 fresh door kills, P2 170.88/round ≥ 111, B1 1.000 vs 1.000, B2 2,162 total / max 404, B3a +0.5pp, B4 0 bad files, M5 `review_required` with no `regression_signal`, M6 this file)
- Frozen prereg: `evidence/2026-11-21/sim-dmgpin-report-b-prereg.md` (frozen 18:15Z, base `cb20cd650`, policy `1884c8852d38`)
- Port: hand-merged from held branch `sim-pinquaddoor-b` tip `94e0b5b85` (diff sha256 `3107d05f…e5ad5`); the #2634 downedtwice fix kept verbatim at `fieldFights.js:1756` (pick line) and `:1885` (fall block, `_hWasLive` guard)
- Base master: `cb20cd650afd4a6cae610ad06c942300faf4b9b9` (the prereg's "full" hash carries one extra trailing `f` — 41 hex chars; the instrument's regex takes the first 40, so the judged anchor is the true hash; see Metric review §9)
- What ships: instrument + prereg + evidence + analysis/panel (merged to master). What does NOT ship: the src/ port stays on branch `sim-dmgpin-report-b` (held, like `sim-pinquaddoor-b`) — the lever stays env-gated OFF; turning DMGPIN on by default is a design call, not this arm's. The verdict answers the question the lever was built to test (see §8).

## 1. Scout — control-only pre-screen, 24 seeds 106809–106832

Control-only (`DMGPIN` unset, `PINQUAD=1`, `ALLYSLOT3=1`, all other flags per prereg §3), 6 chunks of 4 seeds, all exits 0. Scout ran during the write flap (EPERM on new-file writes from ~18:41Z): the driver's `writeRobust` retried 480×250ms per seed, then printed each corpus to stdout as an `@@FALLBACK` block. 23 corpora were recovered byte-identical from the fallback blocks (recovery script `/tmp/recover-fallback.py`, sha-verified per file); seed 106832's file write succeeded during a clear moment, so it has no fallback block and its file is the original. All 24 corpora parse, all anchor to the frozen base, all `policySha` `1884c8852d38`.

Designation (door = wave ≥ 4, `origin === 'expedition'`, `allyFromStart`, `pinned`, rounds ≥ 1):

| seed | v4 rows | pinFights | pin wave-4+ | fought doors | designates |
| --- | ---: | ---: | ---: | ---: | --- |
| 106809 | 21 | 17 | 9 | 2 | YES |
| 106810 | 14 | 4 | 3 | 0 | no |
| 106811 | 50 | 0 | 0 | 0 | no |
| 106812 | 13 | 7 | 2 | 1 | YES |
| 106813 | 23 | 0 | 0 | 0 | no |
| 106814 | 8 | 0 | 0 | 0 | no |
| 106815 | 12 | 0 | 0 | 0 | no |
| 106816 | 9 | 8 | 4 | 1 | YES |
| 106817 | 9 | 15 | 4 | 1 | YES |
| 106818 | 17 | 0 | 0 | 0 | no |
| 106819 | 17 | 0 | 0 | 0 | no |
| 106820 | 35 | 13 | 5 | 1 | YES |
| 106821 | 0 | 0 | 0 | 0 | no |
| 106822 | 3 | 0 | 0 | 0 | no |
| 106823 | 15 | 0 | 0 | 0 | no |
| 106824 | 30 | 23 | 4 | 1 | YES |
| 106825 | 13 | 0 | 0 | 0 | no |
| 106826 | 1 | 0 | 0 | 0 | no |
| 106827 | 8 | 0 | 0 | 0 | no |
| 106828 | 6 | 9 | 0 | 0 | no |
| 106829 | 6 | 14 | 3 | 2 | YES |
| 106830 | 56 | 44 | 12 | 4 | YES |
| 106831 | 0 | 0 | 0 | 0 | no |
| 106832 | 19 | 4 | 0 | 0 | no |

**SCOUT-GO: 8 of 24 seeds designate** (106809, 106812, 106816, 106817, 106820, 106824, 106829, 106830 — exactly 8, so the re-judge band is all 8, cap not binding), **13 fought doors total**. The band is pin-forming in a way the reprereg band was not: pins formed on 9 seeds, and 8 of them carried a live pin into a wave-4+ expedition fight. Note the spread: 106811 ran 50 wave-4+ encounters with zero pins, and 106830 alone supplied 4 of the 13 doors — the pin is still concentrated, not uniform.

Scout census (24 seeds, `dmgpin-report-b-analysis.json`): wins 0, national 0, table 0, wave-5 7/24, wave-4 24/24, survived 9, village-lost 15, median survival 141d, deaths 1,986, kills 22, pinFights 158 (96 fought, 57 kills), kill conversion 5.7%, pinned kill conversion 4.3%.

## 2. The paired legs — designated band, 8 seeds

Control corpora copied byte-identical from the scout dir (`perseed-dmgpin-report-b-control/`, sha-verified per file). Armed leg (`DMGPIN=1`, same flags otherwise) re-ran the 8 designated seeds in 2 chunks of 4, exits 0, all 8 files written cleanly once the flap cleared (~20:04–20:06Z). The armed leg re-runs the same seeds with the lever on, so trajectories diverge after the lever acts — door counts differ per leg (13 control, 11 armed); that divergence is the measurement, not a defect.

| leg | files | anchor | pinquadFlag | dmgpinFlag | policySha | fought doors |
| --- | ---: | --- | --- | --- | --- | ---: |
| control | 8 | `cb20cd650afd` | `1` | null | `1884c8852d38` | 13 |
| armed | 8 | `cb20cd650afd` | `1` | `1` | `1884c8852d38` | 11 |

Proofs (all green before legs, per the legs log): M1 `test-allyslot3-b.js` 18/18, M2 `test-pinquaddoor-b.js` 35/35, M2w `test-pinquaddoor-wide-b.js` 16/16, M3 `test-dmgpin-b.js` 29/29, M3b `test-dmgpin-reprereg-b.js` 30/30, M3c `test-dmgpin-scout-b.js` 16/16. Full gate on the ported tree (pre-legs): `node scripts/check.js --quick` — **336 passed, 8 failed**, all pre-existing/flake, none attributable to the port (see §7).

## 3. Frozen-bar table

| Bar | Frozen requirement | Measured | Result |
| --- | --- | --- | --- |
| M1 port gate | `test-allyslot3-b` 18/18 | 18/18 | PASS |
| M2 staged pin proof | `test-pinquaddoor-b` 35/35 | 35/35 | PASS |
| M2w wide-instrument proof | `test-pinquaddoor-wide-b` 16/16 | 16/16 | PASS |
| M3 damage proof | `test-dmgpin-b` 29/29 | 29/29 | PASS |
| M3b re-registration proof | `test-dmgpin-reprereg-b` 30/30 | 30/30 | PASS |
| M3c scout proof | `test-dmgpin-scout-b` 16/16 | 16/16 | PASS |
| P1 door kill | ≥ 1 armed FRESH door kill (roundsDetail-derived entry HP ≥ 500; NEVER mHpStart) | **3 fresh door kills** — 106816 d146 audit (entry 1,166), 106829 d115 algorithm (entry 1,100), 106830 d97 influencer (entry 858); all roundsDetail-derived, dealt bound ≤ entry, mHpStartRec agrees exactly | PASS |
| P2 D-shape | mean damage/round across FOUGHT armed door fights ≥ 111/round | **170.88/round pooled** (1,880 dealt / 11 rounds), 168.17 mean-of-rates; control 85.85 pooled / 79.71 mean-of-rates | PASS |
| B1 pin delivery | armed fought-subset ally3Vid rate ≥ control rate − 10pp AND ≥ 3 armed ally3Vid rows | armed 11/11 = 1.000, control 13/13 = 1.000, floor 0.900, 11 armed rows | PASS |
| B2 ally3Dealt | armed total ally3Dealt > 0 AND ≥ 1 armed fight with ally3Dealt ≥ 10 (pinned wave-4+ subset) | armed total **2,162**, max **404** (31 pinned wave-4+ fights); control total 1,593, max 450 | PASS |
| B3a kill conversion | armed corpus-wide vKill rate on wave-4+ ≥ control − 2pp | armed 14/195 = 7.2%, control 12/179 = 6.7%, Δ +0.5pp | PASS |
| B4 substrate sanity | flags + anchor + policySha on every corpus file (scout + control + armed) | 0 bad files across 40 files | PASS |
| M5 guardrail | balanced-panel compare `review_required` with NO `regression_signal` on village deaths / deaths-per-100d | `review_required`, 8 paired cases; deaths/run 87 → 85.125 (Δ −1.875, no_material_signal); deaths/100d 65.21 → 64.59 (Δ −0.62, no_material_signal); 0 `regression_signal` anywhere in the panel | PASS |
| M6 deliverable | this evidence file + panel compare attached + sense-test transcript read | this file; `dmgpin-report-b-panel.md` attached; transcript read below (§6) | PASS |

**How P1/P2/B1 were computed:** the analyzer's re-registered computation (`deriveDoorEntryHp` / `dealtBound` / `freshDoorKill` / `b1NonInferiority`) over both corpora, cross-checked by an independent node one-liner over the raw `v4encounters` rows (door = `origin === 'expedition'` AND `allyFromStart` AND `pinned`, wave ≥ 4; fought = rounds ≥ 1). Both agree exactly: 13 control fought doors, 11 armed fought doors, 3 armed fresh door kills. No derivation was run on any non-kill row; nothing was guessed from `mHpStart` (null on every vKill row, as the prereg established) or from `mHpStartRec` (a diagnostic cross-check, never a judge — it agrees exactly on all 3 fresh kills).

## 4. Door-fight tables (S5 — every fought door, both legs)

Armed (11 fought doors; D/round = mDealt / rounds):

| seed | day | monster | wave | rounds | outcome | dealt | D/round | entry HP | dealt bound | mHpStartRec |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 106809 | 93 | cancellation | 5 | 3 | vFlee | 816 | 272.0 | — | — | 1,936 |
| 106809 | 93 | reunion | 4 | 2 | vFlee | 284 | 142.0 | — | — | 1,365 |
| 106812 | 100 | influencer | 4 | 2 | vFlee | 272 | 136.0 | — | — | 968 |
| 106816 | 146 | audit | 4 | 5 | **vKill** | 1,182 | 236.4 | **1,166** | 1,144 | 1,166 |
| 106817 | 59 | reunion | 4 | 3 | vFlee | 428 | 142.7 | — | — | 1,356 |
| 106820 | 45 | eater | 4 | 4 | vFlee | 613 | 153.3 | — | — | 1,083 |
| 106824 | 82 | algorithm | 4 | 3 | vFlee | 302 | 100.7 | — | — | 1,032 |
| 106829 | 115 | algorithm | 4 | 6 | **vKill** | 1,130 | 188.3 | **1,100** | 1,070 | 1,100 |
| 106829 | 115 | strike | 4 | 2 | vFlee | 330 | 165.0 | — | — | 1,110 |
| 106830 | 97 | influencer | 4 | 7 | **vKill** | 883 | 126.1 | **858** | 827 | 858 |
| 106830 | 98 | algorithm | 4 | 5 | vFlee | 937 | 187.4 | — | — | 1,130 |

Control (13 fought doors):

| seed | day | monster | wave | rounds | outcome | dealt | D/round | entry HP | dealt bound | mHpStartRec |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 106809 | 93 | cancellation | 5 | 3 | vFlee | 408 | 136.0 | — | — | 1,936 |
| 106809 | 93 | reunion | 4 | 2 | vFlee | 142 | 71.0 | — | — | 1,365 |
| 106812 | 100 | influencer | 4 | 2 | vFlee | 152 | 76.0 | — | — | 968 |
| 106816 | 146 | audit | 4 | 10 | **vKill** | 1,180 | 118.0 | **1,166** | 1,154 | 1,166 |
| 106817 | 59 | reunion | 4 | 3 | vFlee | 223 | 74.3 | — | — | 1,356 |
| 106820 | 45 | eater | 4 | 4 | vFlee | 315 | 78.8 | — | — | 1,083 |
| 106824 | 82 | algorithm | 4 | 3 | vFlee | 151 | 50.3 | — | — | 1,032 |
| 106829 | 115 | algorithm | 4 | 9 | vFlee | 852 | 94.7 | — | — | 1,100 |
| 106829 | 115 | eulogy | 4 | 2 | vFlee | 164 | 82.0 | — | — | 1,071 |
| 106830 | 97 | influencer | 4 | 12 | **vKill** | 882 | 73.5 | **858** | 851 | 858 |
| 106830 | 105 | algorithm | 4 | 6 | vFlee | 349 | 58.2 | — | — | 1,014 |
| 106830 | 107 | audit | 4 | 1 | mFlee | 0 | 0.0 | — | — | 1,289 |
| 106830 | 111 | spoiler | 5 | 2 | vFlee | 247 | 123.5 | — | — | 1,595 |

Matched pairs (same seed/day/monster on both legs) show the lever's mechanism exactly: 106809 cancellation 408 → 816 dealt in the same 3 rounds (2.0×); 106809 reunion 142 → 284 (2.0×); 106812 influencer 152 → 272; 106817 reunion 223 → 428; 106820 eater 315 → 613; 106824 algorithm 151 → 302 (2.0×). The x2.0 multiplier is legible pair by pair, not just in the aggregate. The kill rows match too: the same audit on 106816 d146 enters at 1,166 HP on both legs and dies on both (10 rounds control, 5 armed); the same influencer on 106830 d97 enters at 858 HP and dies on both (12 rounds control, 7 armed). The lever shortens fights; it does not create them.

## 5. Secondaries (S1–S7)

- **S1 — pin-subset B1 rate** (fought pinned fights, any wave): control ally3Vid rate 74.7% (fought 83), armed 75.4% (fought 57) — flat; the pin's delivery is unchanged by the damage lever, as expected.
- **S2 — drive-offs**: pinned drive-offs 12 control → 5 armed. Fewer drive-offs armed, but the denominator also shrank (141 → 106 pinFights); the drive-off share of pinFights is 8.5% control vs 4.7% armed.
- **S3 — SEEK**: pinned SEEK counts control {seek 1, avoid 3, other 29} of 33 → armed {seek 1, avoid 2, other 22} of 25. Pinned fighters still almost never seek (1/25 armed) — the SEEK side effect from the reprereg persists unchanged; the damage lever does not touch it.
- **S4 — pinFights census**: control 141 pinFights (83 fought, 47 kills), armed 106 (57 fought, 32 kills). Fewer pinFights armed because trajectories diverge after the lever acts (fights end sooner, fewer repeat pin engagements); pinned kill conversion rose 4.7% → 9.7%.
- **S5 — door-fight tables**: §4 above.
- **S6 — wall numbers** (control → armed, 8 designated seeds): wins 0 → 0, national 0 → 0, table 0 → 0, wave-5 3 → 3, wave-4 8 → 8, survived 3 → 2, village-lost 5 → 6, median survival 144d → 139d, deaths 696 → 681, kills 12 → 14. No win movement (0 on both legs); the panel's community-loss `regression_watch` (0.625 → 0.75) is the one extra village lost — seed 106830, which survived 150d control and 140d armed.
- **S7 — scout census**: §1 (24 seeds, 1,986 deaths, 22 kills, 5.7% kill conversion).

## 6. Sense test — a door fight, blow by blow (M6)

Seed 106816, day 146, The Audit, wave 4, armed leg. Entry HP 1,166 (roundsDetail-derived; dealt bound 1,144; mHpStartRec 1,166 — all three agree). The pinned quad — Jorge (lead), Ricardo, Petra, Yara — fights as one; every strike lands with "(pinned x2)". Verbatim from the row's log:

> Jorge walks straight into The Audit. No avoiding it.
> Jorge sees The Audit coming and nocks an arrow — the fight opens at range (3 shots).
> loosed — it takes The Audit for 23 (1143 left).
> loosed — it takes The Audit for 23 (1120 left).
> loosed — it takes The Audit for 24 (1096 left).
> Jorge lowers the bow — The Audit is on them now. (3/3 hit)
> Petra is already at the door too — charges in with Jorge!
> Yara is already at the door too — charges in with Jorge!
> Ricardo is already at the door — charges in with Jorge!
> R1: Jorge goes still. Breath slows. The world narrows to the target. (Take Aim — next shot 2.5x)
> The pinned quad fights as one — every strike lands with the unit's weight behind it. (Coordinated strikes x2)
> R1: Ricardo strikes for 52 (pinned x2) (1044 left)
> R1: Petra strikes for 42 (pinned x2) (1002 left)
> R1: Yara strikes for 102 (pinned x2) (900 left)
> Jorge's gear absorbs 44.
> R1: Assessment hits Jorge for 14 (86 left)
> R2: Jorge strikes for 150 (aimed 2.5x) (x1.3) (pinned quad x2) (750 left)
> R2: Ricardo strikes for 50 (pinned x2) (700 left)
> R2: Petra strikes for 36 (pinned x2) (664 left)
> R2: Yara strikes for 100 (pinned x2) (564 left)
> Yara's gear absorbs 36.
> R2: Field Audit hits Yara for 8 (91 left)
> R3: Jorge strikes for 68 (blood trail +2) (x1.3) (pinned quad x2) (496 left)
> R3: Ricardo strikes for 52 (pinned x2) (444 left)
> R3: Petra strikes for 44 (pinned x2) (400 left)
> R3: Yara strikes for 104 (pinned x2) (296 left)
> Jorge's gear absorbs 56.
> R3: Assessment hits Jorge for 17 (69 left)
> R4: Jorge strikes for 38 (blood trail +2) (audited — half strength) (x1.3) (pinned quad x2) (258 left)
> R4: Ricardo strikes for 44 (pinned x2) (214 left)
> R4: Petra strikes for 44 (pinned x2) (170 left)
> R4: Yara strikes for 98 (pinned x2) (72 left)
> Jorge's gear absorbs 55.
> R4: Assessment hits Jorge for 17 (52 left)
> The Audit is wounded past its line — and holds its ground. It is not leaving. (Committed)
> R5: Jorge stops mid-fight and binds the wound — field medicine, +20 HP.
> R5: Ricardo strikes for 50 (pinned x2) (22 left)
> R5: Petra strikes for 38 (pinned x2) (0 left)
> The lead falls — the pack's coordination shatters. The rest scatter or die.

The mechanism is legible in the log: the pin holds all four at the door, every strike doubles, and Yara alone deals 100+ per round. The same fight on the control leg took 10 rounds to kill the same 1,166-HP audit; armed, 5 rounds. This is the first door kill in the #2619 line where the lever's mechanism is visible in the transcript rather than inferred from aggregates.

## 7. Gate — check.js --quick on the ported tree (pre-legs)

`node scripts/check.js --quick`: **336 passed, 8 failed in 823s** (log: `dmgpin-report-b-check-quick.log`). All 8 failures classified by reading the log, none attributable to the port:

| failing test | cause |
| --- | --- |
| `godpath/test-measurement-proof-update.js` | standing measurement-proof staleness — any src/js change invalidates the retained neutrality proof by design |
| `godpath/test-measurement-workflow.js` | same standing pair (retained neutrality proof) |
| `godpath/test-living-garden-deed-attainment.js` | 120s timeout (known deed-attainment timeout under load) |
| `godpath/test-phone-frame-proof.js` | stale phone receipt (standing failure) |
| `godpath/test-one-person-army-deed-attainment.js` | 120s timeout (known) |
| `test-foodpower-20261014.js` (ontology sub-check only) | flap-caused — the validator's write to `docs/ONTOLOGY.md` EPERM'd during the gate; `node scripts/validate-ontology.js` run after the flap passes on the identical ported tree (138/138 systems, exit 0, `ONTOLOGY.md` byte-identical to HEAD) |
| `test-sw-audio-cache-20261012.js` | flap-caused — EPERM on `copyFileSync` to `/tmp` |
| `test-deathcleanup-instrument-20261117.js` | flap-caused — EPERM on `writeFileSync` |

## 8. Metric review — what the GO does and does not mean

The lever does exactly what it says on the tin: pinned-quad damage doubles (85.85 → 170.88 dealt/round pooled; 79.71 → 168.17 mean-of-rates), the pin still delivers the third ally to every fought door (11/11 armed, 13/13 control), and three armed door fights end in a fresh kill with entry HPs of 858–1,166. That is a real, mechanism-legible GO on the frozen bars.

What it does **not** do is move kills. The control leg — pin only, no damage lever — already killed 2 fresh doors (106816 d146 audit, 106830 d97 influencer, same fights, same entry HPs, 10 and 12 rounds instead of 5 and 7). Armed kills 3. Kill conversion moves 6.7% → 7.2% (+0.5pp). Eight of the 11 armed fought doors end in `vFlee` — the villagers deal double damage and the fight still ends in flight, not a kill. The wall numbers do not move (wins 0 → 0, national 0 → 0, table 0 → 0; survived 3 → 2, median survival 144d → 139d, deaths 696 → 681). The panel's one `regression_watch` is community loss 0.625 → 0.75 — one extra village lost (106830, 150d control → 140d armed); deaths themselves fall on both panel terms, so M5 passes as frozen, but the watch is recorded, not waved away.

Plain words: **damage was never the binding constraint on this band, and doubling it proves it.** The pin was the constraint through the reprereg (0 fought doors); on a pin-forming band the pin delivers, the damage doubles, and the kill still mostly doesn't happen because the fight ends in flight first. The next question is not more damage — it is why a pinned quad that is winning the damage race still flees, and whether the flee/engagement side (or the door's own exit) is the wall. That question belongs to the #2619 line, not to another damage lever.

## 9. Errata and infrastructure notes

- **Prereg anchor typo.** The prereg's "full" frozen-base hash reads `cb20cd650afd4a6cae610ad06c942300faf4b9b9f` (41 hex chars — one extra trailing `f`). The true base is `cb20cd650afd4a6cae610ad06c942300faf4b9b9` (40 chars, confirmed by `git rev-parse HEAD` in the worktree and on master). No leg is voided: the driver stamps the true hash, every corpus carries it, and the M3c proof's regex takes the first 40 hex chars from the prereg, so the judged anchor is the true hash. The prereg text should be corrected in a future re-registration; the instrument already self-corrects.
- **Seed 106832's corpus is the original file, not a fallback.** Its write landed during a clear moment (2,085,256 bytes, 19:53Z); the other 23 corpora were recovered byte-identical from the `@@FALLBACK` blocks (sha-verified per file, 0-byte `.tmp` files removed). The 24-file scout dir is complete either way.
- **Flap.** The scout ran through the ~18:41–20:00Z write flap (EPERM on new-file writes; appends OK; `ONTOLOGY.md` truncated to 0 bytes in the worktree at 18:53Z — restored byte-identical from HEAD, sha `81f98311…`, never committed). The flap cleared ~19:58–20:00Z (git writes OK ×3, flap-watch strace rc 0); the armed leg then wrote cleanly. A machine restart hit ~20:22Z (uptime 1 min at 20:23:49Z) — all worktree artifacts survived (they live under `~/workspace`); only `/tmp` scratch was lost.
- **Instrument note.** `pinFights` / `v4encounters` in corpus JSON are arrays of rows, not counts — never interpolate them into a print; scalar counts only. (Learned on this arm's scout extraction; the designation script was rewritten scalar-only and validated on all 24 corpora.)

## 10. Findings — #2619 and #2636

- **#2619 (line 2623, "THE THIRD ALLY NEVER REACHES A LIVE WAVE-4+ FIGHT") — re-judged GO on a pin-forming band, stays OPEN as a lever question.** The pin now delivers: 13 fought doors on the control leg, third ally present on all 13 (ally3Vid 13/13), and the damage lever carried with the pin doubles damage and produces 3 fresh door kills. The finding's premise — the pin as the binding constraint — is answered on this band: when pins form, the third ally reaches and fights. What remains open is the kill: 8 of 11 armed fought doors still end in flight, kill conversion moves only +0.5pp, and no win moves. Next move: the flee/engagement side, not another damage lever and not another re-registration of the pin.
- **#2636 (line 2652, "P1'S FRESHNESS FLOOR IS UNMEASURABLE ON KILL ROWS") — ANSWERED / FIXED.** The re-registered P1 instrument is now kill-judged, not just proof-proven: 3 armed fresh door kills, each with the roundsDetail-derived entry HP, the dealt bound below it, and `mHpStartRec` agreeing exactly (1,166 / 1,100 / 858). The prescription from the original finding (price freshness on the dealt bound or the roundsDetail-derived entry HP) works end to end on live kills. No further work owed on this finding.

## 11. What ships and what does not

- **Merges to master:** instrument + prereg + evidence + analyses + panel + legs log (commit 1 on this branch). No src/js change reaches master from this arm.
- **Held on branch `sim-dmgpin-report-b`:** the src/ port (6 files) — the pin + damage lever code, env-gated OFF. Same precedent as `sim-pinquaddoor-b` (evidence cherry-picked, lever held, never merged). The DMGPIN default flip is a design call: the lever is proven to double damage, but the evidence says damage is not the binding constraint, so flipping it on would be a buff, not a fix.
- **Next blank, in order:** the flee/engagement question on fought doors — why a winning pinned quad still flees. No new sims prescribed by this arm; the next prereg writes its own bars.
- Evidence files: `evidence/2026-11-21/sim-dmgpin-report-b.md` (this file), `sim-dmgpin-report-b-prereg.md`, `dmgpin-report-b-legs.log`, `dmgpin-report-b-analysis.json` (scout, 24 files), `dmgpin-report-b-analysis-control.json` (8), `dmgpin-report-b-analysis-armed.json` (8), `dmgpin-report-b-panel.md` + `dmgpin-report-b-panel-before.json.gz` + `dmgpin-report-b-panel-after.json.gz`, `dmgpin-report-b-check-quick.log`, corpora under `perseed-dmgpin-report-b/` (24), `perseed-dmgpin-report-b-control/` (8), `perseed-dmgpin-report-b-armed/` (8).
