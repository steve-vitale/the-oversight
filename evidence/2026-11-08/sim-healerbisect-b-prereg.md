# sim-healerbisect-b — prereg

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0530Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-b, cut at master `8dc3d16d2` · **Base for sweeps:** candidate SHAs inside `cf22937b8..c9fea16ee`, checked out in the worktree (detached) for sweeps only; commits always made on the branch tip.

## The question

WHICH landing(s) between the collapsed tip `cf22937b8` and master `c9fea16ee` HEALED the frozen band 53001–53008? The collapsed shape (frozenband-bisect-b, C2/P2): median ~70–76d, sits 0–2/8. The healed shape (fightloop-fix-b baseline leg on current master): median 145d, sits 4/8. The fight-level mechanism (protection feeding the flee/hopeless decision) still reproduces exactly on current master, so the healing is downstream: the villages absorb the same early wounds and recover. This arm names the healer — or proves it is a combination, or narrows the range and says so.

## Candidate set — FULL enumeration (do not trust the fightloop list alone)

`git log cf22937b8..c9fea16ee` is linear (0 merges), 127 commits. Commits touching `src/js` or `src/data`: **17**. Chronological order (oldest → newest):

| # | SHA | Landing | Files moved (src/js / src/data) |
|---|-----|---------|----------------------------------|
| 1 | `37fc7489b` | finishing instrument: finishLog module + field per-round capture + TB wraps | `src/js/fieldFights.js`, `src/js/finishLog.js` |
| 2 | `c54de5a2b` | finishing instrument (Amendment 2): TB per-round dealt/taken, scholar kill match, scholar-first fighters | `src/js/finishLog.js` |
| 3 | `5b2dd06ed` | journey-landing r115 prereg: Miriam closing-line data fix | `src/data/characterGen.json` only |
| 4 | `4e4158b77` | Version bump eac2bfc4d-20261107-175416 (batch ship) | `src/js/build.js` only (stamp) |
| 5 | `19ee88466` | journey-establishment r111 Q2: convoNextMenu returns the current line | `src/js/conversation.js` |
| 6 | `471ced6d8` | sim-prodstore-a: PLENTY-WEEK lever (plenty threshold 4→7 fresh days, PRODSTORE_LEVER-gated) | `src/js/game.js` |
| 7 | `820b61496` | sim-prodstore-a: revert PLENTY-WEEK lever (pilot NO-GO, killed arm leaves no trace) | `src/js/game.js` |
| 8 | `007203566` | journey-social r153: fix conversation repeats (cross-key pool exhaustion + opener double-speaking) | `src/js/conversation.js` |
| 9 | `4e6fa44ab` | journey-establishment r112 Q1: specialist ladder fix — foodXp buys skill from 0, village work grants foodXp | `src/js/food.js`, `src/js/game.js` |
| 10 | `d6b3c6d0b` | journey-crisis r154: fix betrayal softlock (whiff guard + round wrap) | `src/js/game.js`, `src/js/party.js` |
| 11 | `9d92a9903` | journey-deepening r116: mantle keeps the language arc alive across succession | `src/js/villager-build.js` |
| 12 | `d333c899e` | journey-succession r155: opener-skip fix (convoWouldBlock guard) | `src/js/conversation.js` |
| 13 | `0ce76898f` | Version bump 09e57528e-20261107-233501 (batch ship) | `src/js/build.js` only (stamp) |
| 14 | `2bc17d793` | Alien expansion: roster 8 → 12 meddlers | `src/data/alienPlayers.json`, `src/js/alienPlayers.js` |
| 15 | `e6ddaf32a` | journey-establishment r113 Q1: specialist self-taught first rung 10 XP → 5 XP (pace fix) | `src/js/food.js` |
| 16 | `685dc9ec4` | pellet pass: the pellet moves to hungrier hands at dawn | `src/js/progression.js` |
| 17 | `b1dc80086` | journey-endgame r156: party-invite refusals vary by villager+day | `src/js/party.js` |

### Corrections to the fightloop candidate list (verified this run)

- `8a4ce0eab` (committed-finish, finishersize) is **NOT** in the range: `git merge-base --is-ancestor 8a4ce0eab cf22937b8` is true — it landed BEFORE the collapsed tip and was already live at the collapse. Not a healer candidate.
- `7943fd58a` (patrol deed) is likewise **NOT** in the range — it is C3 of the earlier bisect (`62ca38845..cf22937b8`), also already live at the collapse.
- `820b6146d` (fightloop's spelling) does not exist; the revert is **`820b61496`**.
- The prodstore pair (#6 + #7) nets to zero on game code: `git diff 471ced6d8^..820b61496 -- src/js` is empty (0 lines). The lever was also PRODSTORE_LEVER-gated, so inert under this instrument even while live. #6–#7 count as ONE no-op step in the bisect; a flip interval landing on #6..#7 cannot be credited to the lever.
- Version bumps (#4, #13) touch only `src/js/build.js` (version stamp). They cannot move trajectories; a flip interval landing on one is an instrument/base problem, not a healer — re-examine, do not credit.
- #3 touches only `src/data/characterGen.json` (one dialogue line). Near-zero plausibility; a flip landing there is flagged suspicious and re-verified by re-running before any credit.
- All other commits in the 127 are scripts / evidence / docs / version files only — they cannot move game trajectories. Instrument files in the range: only `f4d7fb495` (doorwalk tooling creation) and `1d1dbb467` (bisect evidence + analyzer) touch the instrument; `sim-harness.js`, `competent-stageally-a`, `competent-rally-bankkiller-b`, `sitstep-instrument-20261107` are byte-untouched across the range.

## Replay instrument (frozen)

- Driver: `scripts/doorwalk-b-driver-20261107.js`, BASELINE leg only (`POLICY=baseline`: `TAKESEAT_B=1`, `DOORWALK_B` off — sits happen, doors never walked). The same frozen instrument that produced both endpoints.
- The driver + `scripts/policies/competent-doorwalk-b.js` do NOT exist at `cf22937b8` (created by `f4d7fb495`, inside the range). Fixed copies from this branch tip are placed in the worktree UNTRACKED for sweeps (they survive `git checkout <sha>`); they are deleted before returning to the branch tip, so they are never committed. `sitstep-instrument-20261107.js`, `competent-stageally-a`, `competent-rally-bankkiller-b`, `sim-harness.js` exist at `cf22937b8` and are untouched in the range — the in-tree versions at each candidate SHA are used.
- Invocation per SHA: `DAYS=150 SEEDS=<seeds> RUN=doorwalk-baseline POLICY=baseline OUTDIR=/tmp/healerbisect/<sha>/ node scripts/doorwalk-b-driver-20261107.js` (OUTDIR in /tmp: corpora are bisect working data, not committed evidence; flip tables go in the evidence file).
- Analyzer: `scripts/analyze-frozenband-bisect-20261107.js` (reused, runs at branch tip) — per-seed flip table (days, end, seat/sat day, standing, maxWave, wave-4 kills, deaths) + median + sits + HEALTHY / COLLAPSED / AMBIGUOUS on the 8-seed bars.
- Flap protocol: probe O_EXCL file creation before every sweep and commit; if the probe fails, wait and retry — never force ref surgery during a flap.

## Seeds, horizon, policy

- **Seeds:** 53001–53008, FROZEN, deliberately reused — the frozen band is the instrument here, not a fresh band. NO new seeds.
- **Horizon:** 150d, death-aware (`runDays` stops on village death / win, +10d tail max). Matches both endpoints.
- **Policy:** doorwalk baseline leg. One leg per sweep; seeds sequential in one process per the driver.

## Controls (run FIRST, full 8 seeds each — reproduce before bisecting)

- **Collapsed control** `cf22937b8`: must reproduce median ≤90d AND sits ≤2/8 (bisect measured 70.5d, 0/8; P2 measured 76d, 2/8).
- **Healed control** `c9fea16ee`: must reproduce median ≥120d AND sits ≥4/8 (fightloop measured 145d, 4/8).
- If either control fails to reproduce, that is a **NO-GO with cause** (like fightloop) — stop and report, do not re-scope, do not bisect.

## Screening design (bisect points run on a 4-seed subset, flip point confirmed on all 8)

Sims run 2–4 min/seed under sibling contention and the run window ends ~07:30Z; a full 8-seed sweep per bisect point does not fit a binary search over 17 points. Screening subset, justified from the two per-seed tables:

| Seed | Collapsed days (C2) | Healed days (fightloop baseline) | Discriminates? |
|---|---|---|---|
| 53001 | 88 | 105 | Weak — dies both sides |
| 53002 | 84 | 140 | Dies both sides (later) — excluded |
| 53003 | 68 | 65 | No — dies both sides |
| **53004** | **73** | **150, sat d90** | **Yes — death → survival + sit** |
| **53005** | **54** | **150, sat d99** | **Yes** |
| **53006** | **66** | **150, sat d90** | **Yes** |
| 53007 | 63 | 50 | No — dies both sides |
| **53008** | **92** | **150, sat d97** | **Yes** |

- **Screen subset: {53004, 53005, 53006, 53008}.** Collapsed: all four die ≤92d, none sits. Healed: all four survive 150d, all four sit.
- **Screen rule:** HEALED if ≥3/4 reach 150d; COLLAPSED if ≥3/4 die before d100; anything else is AMBIGUOUS → run the full 8 seeds at that point and classify on the 8-seed bars.
- **Confirm:** the flip point is confirmed on all 8 seeds (both bracketing commits, full sweeps) before any verdict.

## Bisect order (binary search over the 17 game-code points, chronological)

1. **Stage 0 — smoke:** 1 seed (53004) at branch tip, instrument check only (driver runs, JSON written, 0 instrument errors). Not judged.
2. **Controls:** full 8-seed sweeps at `cf22937b8` then `c9fea16ee`. Both must meet their bars (above) or the run stops NO-GO.
3. **Midpoint #9** `4e6fa44ab` (r112 specialist ladder). If HEALED → the flip is in #1..#9, next midpoint #5 `19ee88466`. If COLLAPSED → the flip is in #9..#17, next midpoint #13 `0ce76898f`. Continue halving; the prodstore pair #6–#7 is a single no-op step (never a flip by itself).
4. **Attribution:** the flip is the interval between the last COLLAPSED game-code commit and the first HEALED one. The landing AT the healed end of the interval is the fingered landing — credited ONLY after the full-8 confirm of both bracketing commits.
5. **Fallbacks:** if all screened points read the same side as the controls (no flip inside the game-code set) → test the scripts-only commits in order and re-examine base attribution; verdict UNRESOLVED with the narrowed set, never a guessed landing. If a screen reads AMBIGUOUS twice at adjacent points → run full 8 at both before continuing.

## GO bars (binding, §14)

- **THE HEALER (single landing):** the flip interval is identified AND the fingered landing is named with full-8 per-seed trajectory evidence on both sides of the interval (which seeds' death days moved, what kills the villages now vs then — death causes / who dies / when, from the corpora; one healed village's trajectory read in plain words in the evidence file).
- **Control bars (instrument):** collapsed median ≤90d AND sits ≤2/8; healed median ≥120d AND sits ≥4/8. A miss on either is an instrument/base failure, not a bisect result.
- **Flip bars (full-8 confirm):** a commit counts as COLLAPSED only if median ≤90d AND sits ≤2/8; HEALED only if median ≥120d AND sits ≥4/8. Anything between is AMBIGUOUS — report it as such, run the adjacent commit, and do not force the attribution.
- **Proof bars:** `scripts/test-healerbisect-b.js` green (screen-rule classification on fixtures + flip-interval logic + A/A smoke); analyzer output attached to the evidence file as the flip tables.
- **Panel (§15):** balanced panel via `scripts/balance-panel.js` for the flip-point before/after; attach the compare .md to the evidence file. If the panel tool cannot consume doorwalk corpora, record that honestly instead of faking a compare.
- **COMBINATION:** if no single landing flips it, name the minimal flipping set, proven by construction (each member required: removing any one member un-flips it on the screen subset, confirmed on all 8).
- **UNRESOLVED:** if the range narrows but no flip is proven, name the narrowed range and stop.

## Non-goals

- DIAG only: zero src/js changes. If the bisect fingers a fixable game change, document the fix shape with its own prereg sketch — do NOT build the fix in this arm.
- No fresh band, no confirm sweep on a new band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- If time runs short: COMMIT everything committable right now and report exactly what is done vs pending — the next run adopts (established pattern, not a failure). Do NOT push, do NOT bump versions, do NOT verify live.

## Metric review (pre-registered note)

- The primary metric (median survival + sits on the frozen band) is the collapse/heal signature itself; no friendlier re-scoring is available — the control bars and flip bars above are the judge. If a control fails to reproduce, the metric is not wrong, the endpoints are — that is a NO-GO with cause, recorded here.
- The screen subset trades per-seed breadth for bisect depth inside a ~60-minute sim window; it is justified only by the per-seed table above (all four subset seeds flip death→survival+sit, the excluded four do not discriminate). The flip point is always confirmed on all 8 seeds, so no verdict rests on the subset alone.
- One known risk, recorded in advance: the healed shape (145d, 4/8) is close to the healthy C1 shape (150d, 5/8) but not identical — 53003 and 53007 still die early on current master. A landing that heals the median without restoring C1 exactly still counts as THE HEALER if it meets the healed bars; the residual 53003/53007 deaths are a separate question for the next arm, not a reason to re-score this one.

## Amendment A1 — time-boxed controls (written + committed BEFORE any judged sweep)

Measured per-seed cost from the Stage-0 smoke: **4m41s** for one 150d survivor seed (53004 at branch tip, 0 instrument errors, 150d / sat d90 lesser — the healed shape on the most discriminating seed). The task's "2–4 min/seed" estimate does not hold under current sibling contention (33s user time vs 281s real — the process is descheduled, not computing). At that rate a full 8-seed control sweep costs ~37 min and the window ends ~07:30Z with ~35 min left at amendment time: full-8 controls + any bisect cannot fit this run.

- **Controls for THIS run reduce to the 4-seed discriminating subset {53004, 53005, 53006, 53008} at both endpoints.** Subset bars: COLLAPSED = all four die before d100, none sits (bisect C2: 73/54/66/92d); HEALED = ≥3/4 reach 150d (fightloop: all four reach 150d and sit). A subset-control miss is still a NO-GO with cause — stop, do not bisect.
- **Full-8 controls are deferred to the adopting run**, not dropped: the next run re-runs both endpoints on all 8 seeds before bisecting further. This run's bisect reads (if any) are provisional until that confirm.
- **Validity basis for proceeding on the subset:** the full-8 endpoint reproductions already exist from prior arms with this same instrument — bisect arm (C2/L1: 70.5d, 0/8) and fightloop (c9fea16ee: 145d, 4/8) — and the instrument is byte-identical since: **zero commits in `c9fea16ee..HEAD` touch the driver, the doorwalk policy, the sitstep instrument, the stageally/rally policies, or sim-harness** (verified this run). The smoke above additionally re-validates the HEAD instrument on 53004.
- **Bisect in this run proceeds on the subset only**, and only after both subset controls pass. Any flip interval found this run is provisional until the adopting run confirms both bracketing commits on all 8 seeds.
- Nothing else in this prereg changes. The GO bars, flip bars, and NO-GO rule stand as written; only the control breadth for this run is reduced, disclosed here before any judged sweep.
