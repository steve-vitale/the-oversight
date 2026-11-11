# Journey endgame r178 — RUN NOTE (lane B, leg 4, 2026-11-11 02:00 CST run)

Substrate: master `5a9f0ed0c` exactly (feastfirst record tip). 5 seeds
(89701–89705, matched to r171) × 3 passes: A (CAPSTONE/BUYOUT unset,
matched re-run), B (CAPSTONE=1 BUYOUT=1), C (CAPSTONE=1 BUYOUT=1
BUYOUT_EARLY=1 — the new early-buy-out leg). Probe
`scripts/probe-endgame-r178-20261111.js`, analyzer
`scripts/analyze-endgame-r178-20261111.js`, dark probe
`scripts/probe-darktable-r178-20261111.js` (r171 scripts verbatim except
renames + pass-C leg + M24b). Prereg:
`evidence/2026-11-11/journey-endgame-r178-prereg.md`.

## Run-start incidents

- Stale-lock recovery on r177's lock (`2026-11-11T05:55:28Z`; heartbeat
  55 min stale, no node processes); adoption of r177's closeout ABORTED
  when r177 proved alive (commits `35ba9c2e9`/`7334c4e2f` landed after
  this run's start). The completed r177 gate (294/6, all standing) was
  left in r177's tree for its coordinator. **r177's closeout has since
  been completed by the main session (merged `5bb3c595a`, rotation-b
  7→4, tree released) — the prereg's "its coordinator's job" is done.**
- `git pull --ff-only` failed (standing divergence, local ahead 524 /
  behind 156; reconciliation pending) — proceeded on local master per
  precedent, no push, no bump.
- Exec SIGTERM wall ~137s killed the run's first gate attempt; long jobs
  ran nohup-detached with log polling.
- **This run timed out before closeout.** The coordinator's report:
  pilots A/B/C complete with full evidence; telemetry aborted, gate not
  run, run note not written, no commit/merge/release/rotation/lock.
  **This note is written by the main-session adoption closeout.**
- Infrastructure during adoption: an EPERM write flap is active
  (O_EXCL creates refused in `~/workspace/worktrees/`, plain writes
  flap minute-to-minute; registry atomic writes failing, the whole
  fleet's heartbeat/register loops are retrying). Telemetry logs were
  written by printf-retry; the release step may need the same.

## Pass A — matched re-run: PRIMARY-BINDINGS GO

Lesser 5/5, full 0/5, village-lost 0/5 (r171: lesser 4/5, full 0/5,
lost 1/5). All 5 announced d90; M1 GO 5/5; M2/M2c/M2d GO; M2b GO
(5 dieFlag fights, all named); M10 GO 4/4; M11 GO; kill-anatomy 43/43;
MFLEE coverage 18/18; M5 GO (89704 relay voiced); M23/M24/M24b/M25
disabled in pass A (capstone leg off).

- **89702 SURVIVED past d56** (r171: village-lost d56 on reunion
  d54/d56). On the new substrate it sat lesser d90 with 2 living
  veterans. The trajectory move is the named deltas (a) scholarcounts
  + (b) roleform + (c) fightplay fixes, as the prereg predicted — not
  a surprise.
- **M3-conversion NO-GO** (armB kills 2 vs armA kills 12) — same shape
  as r171. The conversion gap persists: the deed-seeking arm still
  under-kills the waves arm.
- Per-seed: 89701 lesser sat d91 (w5max 5, vetLiving 1); 89702 lesser
  sat d90 (w5max 1, vetLiving 2); 89703 lesser sat d93 (w5max 0,
  vetLiving 1); 89704 lesser sat d90 (w5max 2, vetLiving 2);
  89705 lesser sat d99 (w5max 0, vetLiving 1). Ladder peak 3 on all 5.

## Pass B — capstone + buy-out: M23/M24/M24b GO, M25 VACUOUS NO-GO

- **M23-capstone GO**: 2 eligible, delivered 2/2, refused-despite-ready
  0, priced full 2/2.
- **M24-tribute-agreement GO**: 2 tribute deliveries, paid exactly
  need (2/2) both times.
- **M24b-scholar-plus-one GO**: 1 scholar+1 seed (89704),
  covered-by-delivery — the delivery paid 2 non-scholar veterans, so
  the honest-refusal path was not exercised; the agreement held.
- **M25-buyout VACUOUS NO-GO** (third time: r171 twice, r178 B): no
  in-window day with pantry ≥8000 at Haven and nothing ready. The
  Joja path stays unmeasured by the pass-B rule.
- **FULL SEAT 89701 d77** — military_tribute delivered d76 by Ethan
  Hunt + Marcus Webb; priced FULL. **First full seat on a plain waves
  seed** (r171's only full seat was 89704 forcedrift).
- **FULL SEAT 89704 d90 REPRODUCED** — military_tribute delivered d89
  by Omar Farouk + Rosa Mendez; priced FULL. Different day and
  different veterans than r171 (Jorge Silva + Henrik Lien d77) — the
  win reproduces, the cast doesn't.
- Pass B tally: full 2/5, lesser 3/5, lost 0/5.
- **PRIMARY-BINDINGS NO-GO on the M25 vacuous technicality only.**

## Pass C — early buy-out: M23 GO, M24b GO, M25c GO, M25 VACUOUS NO-GO

- **M25c-buyout-early GO**: 5 eligible early-days, 0 skipped, 25 early
  attempts, 5 bought — every seed bought the bundle early
  (89701 d23/pantry 14131, 89702 d21/14601, 89703 d41/30105,
  89704 d27/35858, 89705 d25/8089; all deedGate-not-ok at buy).
- **M23-capstone GO**: 2 eligible, delivered 2/2, priced full 2/2.
- **M24 VACUOUS** (no military_tribute delivery fired — the bundle
  carried both capstones). **M24b GO**: 1 scholar+1 seed (89702),
  covered-by-delivery.
- **M25-buyout VACUOUS NO-GO** (same as pass B).
- **FULL SEAT 89702 d66** — feast_embassy delivered d65 (bundle bought
  d21). The seed that DIED in r171 now wins the full seat.
- **FULL SEAT 89705 d63** — feast_embassy delivered d62 (bundle bought
  d25). A wavesnw seed wins the full seat.
- **No buy-out starved a village**: the tightest buy left 89 kcal
  (89705, pantry 8089 → 89 after the 8000 spend); the village still
  sat the full seat d63 with 0 causal deaths. The Joja price nearly
  empties the pantry — the seat must come fast or the village starves;
  on this panel it came fast. Recorded as a finding (see below).
- Pass C tally: full 2/5, lesser 3/5 (89701, 89703, 89704), lost 0/5.
  89704 bought early (d27) but no capstone delivered; sat lesser d90.
- **PRIMARY-BINDINGS NO-GO on the M25 vacuous technicality only.**

## Tally — the win picture moved

Full seats across passes B+C: **4** (89701-B, 89704-B, 89702-C,
89705-C) against r171's 1 (89704-B). The scholar-counts fix plus the
early buy-out open the full seat on plain waves/wavesnw seeds, not
only the forcedrift experimental. Pass A stays lesser 5/5 — the
matched re-run without delivery policy wins nothing full, exactly as
in r171. The delivery policy (B) and the early bundle (C) are what
convert readiness into seats.

## Dark probe — re-verify: REPRODUCED, no regression

7 variants, failed steps: `v1a-loss:D2-twist-fired` — **bit-identical
to r171's dark probe** (same single failure, same curdle: horror hit
5, downgrade path taken, walk completed, table_won recorded). Not a
regression; the loss-branch curdle is the standing behavior.
- **v3 CONFIRMED**: sitter = Amelia Moon; the walk-out names Amelia
  Moon; Bill Palmer is not named in the walk-out. D1/D3/D4/D6 hold on
  all variants.

## M2b test — FAIL, vacuous

`scripts/test-m2b-scholar-open-r178.js` on seed 89702, 60 days: probe
wrote 2 census fights (village survived); **no scholar-death fight
occurred — the test is vacuous, not green**. The r171 probe defect
(`diedParty=[]` mapping) fix stays committed but unverified by a live
scholar death on this substrate, because 89702 now survives. The r171
adoption's proof-test commit remains owed; this test is NOT committed
as green. (The test script itself is committed here as a probe-side
artifact; its log records the vacuous FAIL.)

## People check — PASS (finales read as earned)

Read the four full-seat finales in full (89701-B, 89704-B, 89702-C,
89705-C transcripts): every one carries THE AUDIT with the ladder
breakdown by track, the terms-held line, and a road-specific closer
(dark road open / light road open / relay carried faithfully). The
pass-C finales show the `(+4 feast-bundle bonus)` landing in the
counted points. 89704's scholar died d80 (Roberto Feng, reunion ×3)
and Owen Smith took the mantle — the village still won the full seat
d90; the succession inside the endgame reads, it doesn't break it.
Named villagers act in the transcripts (Nadia checking the pantry
before the wood run). No senseless, robotic, or self-contradictory
passage found in the finale reads.

## Telemetry

`node scripts/telemetry-check.js --baseline <goal>/hidden_files/
telemetry-baselines/endgame.json --current 'evidence/2026-11-11/
perseed-endgame-r178[-b,-c]/endgame-r178-*.json' --metrics
veterans.unlockedWave,won,peakLivingVeterans` — **quiet on all three
passes** (5 files, 3 metrics, no large deviations), exit 0. (The
coordinator's first attempt crashed on a brace glob the tool doesn't
expand — `ENOENT scandir '...{,-b,-c}'`; re-run per pass with a plain
glob. The tool also drops its "quiet" line when stdout is redirected
to a file — logs were written by printf-retry during the flap.)
Baseline NOT rolled on a quiet check, per r162 precedent.

## Gate

Gate 1 — `node scripts/check.js --quick` in the worktree on the
pre-rebase tip (`5bb3c595a` + r178 commit): **288 passed, 12 failed in
1271s** (`journey-endgame-r178-checkquick.log`). Adjudication, every
failure:
- 6 standing pre-existing: measurement-proof staleness pair
  (test-measurement-proof-update + test-measurement-workflow — the
  proof is stale since r129/r176/r130/r125; b4 regenerating),
  mobile-combat-cadence (Continue wrap), occupation-panels (real CLI
  workflow), phone-frame-proof (stale receipt), establishment-r20-fixes
  (racks-full next-day voice, expected 2 got 1).
- 3 × 120s gate-budget timeouts (exit null): capable-bot,
  trust-observer-neutrality, synergy-stall — documented load artifacts;
  synergy-stall re-run standalone: exit 0.
- measurement-cache-flags (73.5s): the known 30s-spawn-timeout load
  artifact; re-run standalone: 4 passed, 0 failed, exit 0.
- test-telemetry-check-recorder (1.5s): crashed `EPERM syscall write`
  — the EPERM write flap, not a code failure; re-run standalone:
  8 passed, 0 failed, exit 0.
- test-foodpower (13.2s): 29 passed, 1 failed on the (g) ontology
  validator sub-check — a flap-affected file read during the gate;
  re-run standalone: 30 passed, 0 failed, exit 0.
Gate 1 verdict: **GO**.

Master moved during the closeout (Lane A r131 landed `a16ce1cc8`:
cook/mend routine-work grants fill ladder rungs). Branch rebased onto
`a16ce1cc8` (clean, no stop-at-pick quirk; new tip `e84e2c3f3`).
Rebase note: the gate had truncated `docs/ONTOLOGY.md` to 0 bytes
(the flap's open-truncate + refused write); restored byte-identical
from HEAD (md5 `8bcfa965…`) before rebasing — a test side effect,
not r178 work.

Gate 2 — `node scripts/check.js --quick` on the rebased tip:
**292 passed, 8 failed in 1128s**
(`journey-endgame-r178-checkquick2.log`). Failures: the same standing
6 + cache-flags (85.3s, same load artifact, verified green standalone
in gate 1) + trust-observer-neutrality (120.1s, same gate-budget
timeout signature). Capable-bot, synergy-stall, recorder, and
foodpower all passed on this run. Gate 2 verdict: **GO**.

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- **M25**: vacuous for the third straight run (r171 A/B, r178 B/C).
  The in-window buy-out rule never fires on this panel. M25c (early
  buy-out) is the live measurement now and it GOes 5/5. Proposal:
  M25c becomes the primary buy-out bar next run; M25 kept as the
  in-window rule for the record.
- **M24b**: "covered-by-delivery" both times it fired (89704-B,
  89702-C). The honest-refusal path (scholar+1 village reading ready
  and refusing by name) is still unexercised. Keep the metric until a
  seed actually refuses.
- **M3-conversion**: NO-GO again (armB 2 vs armA 12). The conversion
  gap is a standing measurement, not a metric error; no revision.
- **M25c starvation note**: the 89-kcal buy (89705) is the closest
  the Joja price has come to emptying a pantry. If a future pass-C
  seed starves after buying, that is a finding about the price, not a
  metric miss (prereg rule stands).

## Findings (appended to sim-findings.md)

- Early buy-out can leave a village with 89 kcal (89705-C: pantry
  8089 → 89 after the 8000 spend); the seat came d63 and nobody
  starved, but the margin is one bad week. The Joja price needs a
  starvation watch on wider bands.
- M2b probe-defect verification is blocked by survival: 89702 no
  longer produces a scholar-death fight in 60 days, so the proof test
  is vacuous on the new substrate. The r171 adoption still owes a
  green proof run (longer horizon or a seed where the scholar dies).

## Closeout (adoption, main session)

- Run timed out at ~02:55 CST; this note + telemetry + gate + commit/
  merge/release/rotation/lock done by the main-session adoption.
- Rotation: file read 4 at closeout (r177 advanced it 7→4); this run
  writes 5 (social life) at closeout.
- Landing: evidence + probe/analyzer/dark-probe/test scripts only;
  zero src/js, zero scripts/policies/ — no measurement-proof refresh
  owed. Merged locally, pending ship.
