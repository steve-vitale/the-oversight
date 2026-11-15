# Journey endgame r211 — RUN NOTE (lane B, 2026-11-15)

Leg 4 (endgame). Rotation-b read 4 at run start. This note is written by the
08:00 CST adoption occurrence; the 04:00 run that played the leg timed out at
3600s and the 05:00 adoption attempt died with the VM replacement. Prereg:
`evidence/2026-11-15/journey-endgame-r211-prereg.md` (substrate master
c6343a839; passes A/B/C + C-wide stretch; dark skipped — no delta touched the
dark table, r203 bit-identical to r198).

## Adoption record (08:00 CST occurrence)

- Stale-lock recovery: lock run `2026-11-15T09:55:24Z` (04:00 run), heartbeat
  frozen 12:43:14Z (72 min stale), no live processes, VM replaced since
  (boot 5bbe5dd2) — DEAD per the guard. Lock deleted, own lock
  `oversight-playtest-loop-2-20261115T135500Z` written.
- Write flap active at run start (onset <=13:55Z): lock write EPERM, heartbeat
  atomic-write EPERM, `git update-ref refs/heads/probe` FAIL, watcher A/B/G/H
  FAIL. All read-only analysis done during the flap; probe cleared ~14:22Z
  (PROBE OK). Heartbeat re-established 14:24:26Z + setsid loop
  `journey2-endgame-hbloop-r211.sh` (pid 21888, verified advancing).
- Pre-flight: main tree clean (0 lines), disk 39%. Reaper ran clean after the
  flap cleared (exit 0, removed nothing, 12/16 active, all dirty trees held).
- Worktree adopted in place (registered, on disk, based at c6343a839).
  No master commit touched `src/js/game.js` or `src/js/alienPlayers.js`
  since c6343a839 — the fix rebase should apply cleanly.
- Chain2 state on adoption: pass B probe RC 0, pass C probe RC 0, C-wide cut
  after 89722 only (VM replacement ~10:55Z), analyzers B/C/C-wide never ran.
  This occurrence ran the B/C analyzers (logs written), finished the v3
  single-seed live check, launched chain3 (v3-full, then C-wide remainder,
  then analyzers) detached — see "In flight" below.

## Pass verdicts

- **Pass A (5 pilot seeds, matched re-run vs r203): ALL GO** (analyzer RC 0).
  89701 sat d101 lesser, 89702 sat d90 lesser (w5max 1), 89703 sat d90 lesser
  (w5max 2), 89704 VILLAGE-LOST d66 (see attribution), 89705 sat d92 lesser.
  ROAD-TALLY earned 0 sat 0. Reproduces r203 modulo the named deltas.
- **Pass B (capstone leg): PRIMARY-BINDINGS VACUOUS-UNANSWERED** (R1 working
  as designed), PRIMARY NO-GO, ALL NO-GO — the NO-GO is the VACUOUS M23 only.
  Every other binding GO (M1/M2/M2c/M2d/M3b/M5-VACUOUS/M10/M11/M18/M19/M20/
  M21/M22/VETCONV/SECOND-VETERAN/FIRENARR/HURTRETURN/FALLEN/V-WAITVARIETY/
  LOSSKIND/L-PEAK/CORPUS-PURITY). M23: 1 eligible seed (89703, deedGateFirstOk
  d87), delivered 0/1, all 3 refusals exempt (none-ready) — full-seat question
  unanswered, same shape as r203 pass B (VACUOUS — deed gate never ok).
  M24/M24b VACUOUS (no tribute delivery, no scholar+1 seed).
- **Pass C (buyout-early leg): PRIMARY-BINDINGS VACUOUS-UNANSWERED**, same
  headline shape. Every other binding GO. M25c GO: 7 eligible early-days,
  0 skipped, 29 early attempts, 5 bought. M23 VACUOUS (no eligible seed).
  M24/M24b VACUOUS. Per-seed: 89701 VILLAGE-LOST d67 (see attribution),
  89702 sat d101 lesser, 89703 sat d104 lesser, 89704 sat d90 lesser (SAVED
  vs A/B — see below), 89705 sat d92 lesser. ROAD-TALLY earned 0 sat 0.
- **C-wide (fresh band 89722-89729): INCOMPLETE — 89722 only** (sat d90
  lesser, won; bundle bought d37 early, spent 8089 of 9689 kcal, pantry
  after 1600, still survived to sat). Remainder in flight (chain3).

## The blank filled — doubled quotes (r198 finding (c), recurred r203)

Fix (worktree, uncommitted at adoption; this run commits it): `sysSay` in
`src/js/game.js` strips one leading 📺, one leading `SYSTEM: `, and one
redundant quote at EACH edge, then wraps in exactly one pair (display only;
voice lookup still receives the ORIGINAL text). The synergy-discovery site
now calls `sysSay(discovery)` instead of a hand-built wrapper. Three
`alienPlayers.js` feed lines nest single quotes now (showbiz "most watchable
human", rival-gossip "still interesting. For now.", crowd "BORING,").

Verification (adopter-measured, not taken on faith):
- Proof tests ALL GREEN, re-run this occurrence on current code:
  `test-sysay-quotes-r211.js` (25 checks incl. live showbiz line + synergy
  discovery render + voice lookup original-text), `test-syssay-capture-
  20261017.js`, `test-syssay-single-prefix-20261016.js`.
- **v3 live check (89704, worst seed): 0 doubled-quote hits** (v1fix had 17,
  v2fix 6 — both stale, pre-final code), **JSON byte-identical to pass A**
  (display-only confirmed). The 04:55 "v3 0 hits" claim had no evidence dir
  on disk; this occurrence re-verified it for real on 89704. Full 5-seed v3
  panel in flight (chain3).
- Correction to the record: the v2fix transcripts on disk still show 6
  doubled-quote hits (all synergy-discovery lines) because v2fix ran before
  the final discovery-site edit (game.js 10:46:48Z). The fix as it stands NOW
  is green; v1fix/v2fix are stale intermediates, kept as evidence.

## Attributions (prereg interesting findings)

- **89704 died before d90 on A/B (village-lost d66, no-successor):** sickness
  cascade, no healer. David feverish — "Nobody here knows doctoring, and
  David is burning up. The village has no healer — someone has to learn, or
  find one." David dies of fever; Yesenia Mayer dies (contest); village dies
  out. Pantry 0 at end. This is the medicine-supply gap in miniature
  (Steve's medicine-trio ruling context). Funeral-mend delta (d) confirmed
  LIVE and voiced: "Yesenia's funeral feast: the pantry holds nothing to feed
  a shaken fire — Thornfield, Emberhold, Stonebridge, Ashford go unmended.
  The village mourns together anyway."
- **89701 LOST on pass C (village-lost d67) after sitting d101 on A/B:**
  buyout-early leg implicated. Bought the bundle d55 (8,000 kcal of a 21,128
  pantry, "no feast tonight, no guests... The ladder counts it"), then died
  d68 in a wave-4 Reunion fight (Wanda Xi dead, "The clause found no one.
  Death stuck", pantry 6,620 left). The d55 purchase is the first
  state-changing divergence candidate; mechanism (pantry-thinning vs
  trajectory) is an open question for the next buy-out run, not a verdict.
- **89704 SAVED on pass C (sat d90 lesser, 5 alive, pantry 14,199):** the
  early buy-out road held here — bought bundle early, sat at announce. Pass C
  is SPLIT: saved 89704, killed 89701. Buyout-early is high-variance on this
  band, not a clean win.
- **89702/89703 reached wave 5** (w5max 1 and 2 — previously w5:0 on r203).
  89703-B missedSit: deedGateOk d87, military_tribute ready — the exact case
  pass B tests; capstone attempts refused none-ready (exempt).
- **Q9 (159-turn Algorithm fight, r194): NOT recurred.** Longest fights:
  A/B 28 turns; C 120 turns (89702 d57-d58 Algorithm, mFlee, got away).
  Long fights still happen, none at the 159-turn extreme.
- **Q10 (fastW4 diedInFight gap, r171): NOT recurred.** diedInFight empty
  across ALL corpora (A/B/C/v1fix/v2fix/cwide).
- **Q13 (fusion-offer delta):** no fusion-offer event in any corpus.
- **Q3/Q4 (§NO-OVER-ATTEMPT / §REFUSAL-WINDOW): HOLD.** 3 capstone attempts,
  74 buyout attempts, 6 bought, 0 'over', 0 to-window refusals.
- **Dark probe:** SKIPPED (documented in chain2.sh — no delta touched the
  dark table; r203 bit-identical to r198).
- **Starvation watch:** zero lives on all bought seeds (Joja price in lives:
  0). Pantry trajectories: 89704-A ended 0, 89701-C ended 6,620.
- **"holds and watches" clusters:** 1 hit (B-89704) + 4 hits (C-89701) —
  all legitimate combat waits by different villagers on their own turns
  (Gilberto, Ava, Jorge), varied neighbors. NOT a stuck record.
- Minor blank noted, not fixed: the "Innocent speaks only 🇫🇷 French" line
  fires twice in the 89704-C finale block (duplicate language line).

## Village assessment (plain words)

Four of five villages sat the lesser seat on pass A — the endgame is
reachable, and the table works: the audit reads the run back honestly
("only 0 of 3 different wave-4 monsters faced; only 0 of 2 different wave-5
monsters faced; no capstone deed delivered"), the lesser seat is offered and
taken, nobody sat a full seat on any pass (deed gate never ok on B; no
eligible seed on C). The one village that died did so the way villages die
here: a fever nobody could treat, then a contest death, then nobody left to
pick up the Codex. The buy-out road is the live question now — it saved one
village and killed another on the same five seeds. Wave 5 is still a wall
with a door nobody opens: villages reach it (89702/89703), fight it, and
come home lesser-seated. No tribute delivery fired on any pass (M24 VACUOUS
everywhere).

## People check: PASS

Pass A check (04:00 run) stands. Adoption spot-checks on pass C: the
89704-C finale reads as people — the dark-road relay choice ("You say yes.
The word is small. The pods open — not like morning. Like a barracks...
The village doesn't cheer... The System is delighted. That's the worst
part."), the audit naming the shortfall, the final choice resolving with
real consequences. The 89704-A death sequence reads as people — fever
dreams, "Nobody here knows doctoring", the Codex turning its own page on
each death, links shaking, tribute pressed down, the relay holder dying,
a funeral feast with an empty pantry. The 89701-C death reads as people.
No senseless, robotic, or self-contradictory passage found in the B/C
transcripts sampled. One dry repetition (French line ×2, noted above).

## Metric review (§14)

- (R1)/(R2)/(R3) adopted this run; proof test `test-analyzer-revisions-
  r211.js` ALL GREEN this occurrence (real r203 corpora). R1 headline works
  in the wild (B/C print VACUOUS-UNANSWERED, exit still follows ALL).
  R2 M5-VACUOUS works (pass B prints GO with the VACUOUS note).
  R3 ROAD-TALLY earned-vs-sat prints (0/0 on r211 passes).
- M23 stays VACUOUS on every pass so far (B and C) — the full-seat question
  is unanswered by this panel, not failed. Proposal for next run: M23 needs
  a seed where the deed gate is ok AND the bot sits to attempt while it is
  ok (89703-B went ok d87 but attempts hit none-ready) — or the metric
  should count "gate ok at sit" separately from delivery.
- M25c buyout-early (HOLD): pass C splits 1 saved / 1 killed on the same
  band — the metric (eligible days / attempts / bought) does not capture
  the survival cost. Proposal: next buy-out run adds a per-seed
  bought-then-died flag so the price in lives is a first-class verdict,
  not a run-note attribution.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held).
- M24b (HOLD — vacuous on every pass so far). M2c adoptedRefs (HOLD).
  CORPUS-PURITY (HOLD). Telemetry baseline: r188 stands (see below).

## Telemetry

`telemetry-check.js` vs r188 baseline (endgame.json): QUIET — 5 files,
3 metrics (uw/won/peakVet), no large deviations. Baseline NOT rolled.
Pass-A sums: uw 21, won 4/5, peakVet per-seed maxes within regime
(baseline uw 22, won 4, peakVet 8).

## Gate / landing status

- Proof tests for the fix: GREEN (see above). Full `check.js --quick` gate
  NOT run this occurrence (time; flap ate the first ~30 min) — owed by the
  adopting occurrence after rebase.
- Landing: NOT done this occurrence. Commits below; rebase onto master HEAD
  (b0b171cc8), proof re-runs, gate, merge ff-only, release, rotation
  4→5 are owed by the adopting occurrence.
- Rotation-b stays 4 (not advanced — no landing yet).

## In flight (for the adopting occurrence)

- chain3 (setsid-detached, pid 23152, started 14:27:30Z): v3-full pass-A
  panel (5 seeds) → analyzer v3 → C-wide remainder (89723–89729) →
  analyzer C-wide. Log: `evidence/2026-11-15/journey-endgame-r211-chain3.log`.
  Heartbeat loop pid 21888 keeps the tree fresh.
- Next occurrence: read chain3 log + analyzer outputs; if v3-full shows 0
  doubled quotes AND JSONs byte-identical to pass A, the fix is live-verified
  on the full panel; run the C-wide analyzer verdict into this note; rebase
  onto master HEAD, re-run proof tests + `check.js --quick`, merge ff-only,
  release worktree, delete branch, rotation 4→5, delete lock.
- If chain3 died with the VM again, the C-wide remainder + v3-full are
  re-runnable from the chain3 script (deterministic seeds; 89722/89704
  outputs already on disk reproduce identically).

## Verdicts

- Reachable: YES (4/5 sat lesser on pass A; table + audit + lesser seat all fire).
- Fun: PARTIAL (the endgame plays — audit, finale choices, Reunion fights —
  but wave 5 is a wall nobody opens and the full seat never answers).
- Winnable: NO (this leg; full seat 0/5 on every pass, deed gate never ok).
