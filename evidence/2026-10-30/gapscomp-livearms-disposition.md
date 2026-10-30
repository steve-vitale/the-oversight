# LIVE-ARMS VERIFICATION + HELD-TREE DISPOSITION — gaps completion, 2026-10-30

Worker: gapscomp-livearms (gaps-completion lane).
Verified against master HEAD `3dbfe5f767b4b401f3255e341778abe31f0a1bbe`
at verification time. No game code landed by this arm. No gate, deed bar,
default, or leg-village link touched.

## 0. LANDING STATUS OF THIS DOCUMENT

Committed from worktree `gapscomp-livearms` (branch `gapscomp-livearms`).
Registration initially failed repeatedly on the container's intermittent
EPERM flap on `.git/refs/heads/*.lock` (the same flap class that blocked
sibling registrations fleet-wide during this window and blocked ordinary
file writes — see §6); a long-pending attempt eventually succeeded after
the first report was sent, and this file was then committed from the
worktree. Verification below was performed against master
`3dbfe5f767b4b401f3255e341778abe31f0a1bbe`, and every claimed-landed hash
was re-confirmed as an ancestor of the worktree HEAD at commit time
(`65d5083ce`). The main tree was never touched directly.

## 1. VERIFICATION TABLE — claimed-landed items, re-checked on tip

All hashes re-verified with `git merge-base --is-ancestor <hash> HEAD`.
Proofs re-run on tip (node, sequential, no jest concurrency). "PASS" means
the proof reproduced on this HEAD; anything else is stated, not smoothed over.

| Item | Hash | Ancestor of master? | Proof re-run on tip |
|---|---|---|---|
| Knower ledger (merge over `6b60b3dae`) | `a2fd826a2` | YES | `scripts/test-knower-ledger.js` — **103 passed, 0 failed — PASS** (reproduces the claimed 103/0, incl. seed-99 Stonebridge-style covenant refusal) |
| Parity delivery prep (evidence only) | `e03aeed77` | YES | Map slices 1a–4 proofs — **all PASS, 0 failures**: `test-walk-home.js`, `test-leg-determinism.js`, `test-villager-walk-home.js`, `test-city-districts.js`, `test-beyond-blockage.js` |
| Held Loop B originals preservation | `2755b1391` | YES | No proof test (evidence preservation). All 3 preserved files present on HEAD: `evidence/2026-10-29/creekpath-armc-b-preserved/{README.md, competent-goHomeStanding-original.js, competent-variant.patch}` |
| Caughtlift | `98784fc00` | YES | `scripts/test-caughtlift-fix-b.js` — **PASS** (judged legs all passed; band completes 8/8) |
| Divedeep | `0761aab9b` | YES | `scripts/test-divedeep-fix-b.js` — **PASS** ("ALL CHECKS PASS") |
| Calm_beast | `2d9ef7c7e` | YES | Legs verified from console output across seeds: C1-hostile row available and resolves (fight over), M1-monster-only and N1-no-foe guards refuse unchanged. The script's dump-file artifact could NOT be written (container EPERM write flap, 4/4 attempts, 0-byte files) — that is an infrastructure failure, not a code failure. Recorded as **PASS with that caveat**. |
| Tbovertime (evidence + corpus) | `1be29f7c9` | YES | `scripts/test-tbovertime2.js` — exit 0, **MECHANICAL: PASS**. Its parity-vs-old-fighterconstruct-corpus line prints FAIL (per-seed drift since that corpus); the script header states parity is printed separately and is NOT a mechanical gate. Not a tbovertime regression. Tier-2+ overtime remains "tier 1 only bigger"; tier 5 still unmeasured, as documented. |
| Sysbond DOC correction (priced-not-gated) | `cc5729ad7` | YES | `scripts/test-sysbond-a.js` — **14 passed, 0 failed — PASS** |
| Lingerfinish NO-GO record | `9972fa06c` | YES (as evidence, not as a landed policy) | See §2 — HOLD stands |
| Measurement-audit tip (superseded) | `598e21bdb` | **NO — not an ancestor** | Superseded twice over (fresh 2026-10-28 panel, then 2026-10-29 abilities-refresh panel). **Do NOT re-point to it** — its scorecard source hash no longer matches master; re-pointing would regress. |
| Panel-contract tree (per tracker) | `ede1a2796` | YES | Tree on master as reported; no branch/worktree survives. Decision only — see §4. |

No claimed-landed item failed its proof on tip. Two NEW findings that qualify
older claims (loud, §6) do not overturn any landed item above.

## 2. LINGERFINISH — HOLD (binding NO-GO stands)

- `scripts/policies/lingerfinish.js` is **ABSENT on HEAD** — it was deleted
  in `9972fa06c` itself ("policy deleted, mechanism found (field-flee at
  break line)"), and no later commit restores it.
- The NO-GO stands: fieldFight resolves a 1-HP beast as fleeing 16:1 over
  killing; another targeting policy would reproduce the NO-GO.
- Nothing to land, nothing to re-enable. The open Steve-call remains:
  when a mustered sortie corners a lingerer already below its break line,
  should fieldFight kill it or let it flee for free?

## 3. SIM-FINDINGS #753 — OPEN (not fixed; fix is not small)

Ruling (landed, `docs/DECISIONS.md`, `docs/MEASUREMENT.md` §753): `playerDeaths`
means deaths of the player-flagged character only; the old total-combat-deaths
series lives on as `villageDeaths`. The canonical panel already implements
this correctly (`scripts/balance-panel.js` `deathMetrics`: `player:`-keyed
deaths vs all deaths).

The open remainder is real and counted: **25 dated per-experiment panel
builders still compute `playerDeaths` as total combat deaths**
(`const playerDeaths = (r.deathCauses || {}).combat | 0`):

`build-armorcatch-panels-20261021`, `build-armorydrive-confirm-panels-20261022`,
`build-armorydrive-panels-20261022`, `build-bloodrestraint-panels`,
`build-br-rst-panels`, `build-feastconv-b-panels`,
`build-feastdisc-confirm-panels-20261022`, `build-feastdisc-paired-b-panels`,
`build-feastdisc-panels-20261022`, `build-feastdisc-reconfirm-b-panels`,
`build-splitclose-panels-20261022`, `build-splitkill-panels-20261022`,
`build-stagemuster-panels-20261022`, `build-tierband-panels-20261023`,
`build-twovets-panels-20261021`, `build-vetbench-panels-20261022`,
`build-vetrestage-panels`, `build-vetretention-panels`,
`build-vgearconfirm-panels-20261021`, `build-vgearseat-panels-20261020`,
`build-villagergear-confirm-panels-20261020`, `build-villagergear-panels-20261020`,
`build-wave4engage-panels-20261022`, `build-wave4hunt-r2-panels-20261021`,
`build-wave4hunt-r3-panels-20261021`.

Why not fixed here: 25 files is not a small fix, and these are dated
historical experiment builders (Oct 20–23), none referenced by `check.js`
or the green list. Editing them would rewrite historical panels, and
regenerating those panels to prove the fix would be a panel-system rework —
explicitly out of scope. The live instrument (`balance-panel.js`) is correct,
so no current measurement is misled by these files; only re-reads of those
dated panels carry the old label.

**Disposition: OPEN. Named next arm: "753-legacy-builders"** — a dedicated
arm that (a) decides per builder whether its panel is still read or purely
historical, (b) for still-read builders, re-derives `playerDeaths` from
attributed deaths (`attr` player-flagged, the pattern the 8 correct builders
already use) and adds `villageDeaths` = combat total, (c) regenerates only
those panels, and (d) lands a census test asserting no `build-*-panels`
script assigns `deathCauses.combat` to `playerDeaths`. No panel-system
rework; no change to `balance-panel.js` or its contract.

## 4. CALLS THAT ARE NOT THIS ARM'S TO MAKE

- **Sysbond CODE fix — CODEX-CALL (Q0(c)). NOT BUILT here.** Only the doc
  correction (`cc5729ad7`, priced-not-gated) is landed and re-proven 14/14.
  The code question — should the Relay door require sysBond ≥ 2, or stay
  priced-not-gated as coded? — belongs to Codex Q0(c). No sysbond code
  was touched.
- **Panel-contract — STEVE-CALL. Recommendation: DISCARD.** The worker's
  panel tree is on master (`ede1a2796`, verified ancestor); no branch,
  worktree, or registry entry survives. The only unmerged item was an
  uncommitted whole-doc deletion in a dead worktree (flap debris, not panel
  work). Discarding loses nothing; resurrecting it would reintroduce a
  stale doc deletion. Decision itself is Steve's — this arm decides nothing.
- **Measurement-audit remainder — HELD as superseded.** Nothing to land;
  see §1 (`598e21bdb` not an ancestor, do not re-point).

## 5. PANEL REFRESH (stretch item) — OPEN, do not land from this arm

- `scripts/godpath/test-measurement-proof-update.js` **FAILS on tip** as
  expected: `Error: Proof source inputs are not current` (from
  `balance-proof-update.js` validate, manifest comparison). The current
  proof pointer is already the 2026-10-30 stashfetch panel
  (`evidence/2026-10-30/sim-stashfetch-b-panel-after/panel.json.gz`); since
  that panel, exactly 2 manifest inputs changed
  (`scripts/policies/dissolveprobe-diag.js`, `scripts/policies/fleepolicy-a.js`).
  (The "7 moved Game files" in the task brief describes the older staleness
  at gaps2 time; the live diff at this HEAD is these 2 policy files.)
- A refresh is NOT a pointer edit: `balance-proof-update.js` only registers
  an already-produced real observer-neutral panel. Producing a fresh one
  means a full multi-policy observer run (the stashfetch panel came from a
  full sim panel run), and any refresh landed now goes stale again at the
  next sibling landing before ship — which is why gaps2 assigned this to
  the coordinator/ship loop, not to a worker.
- Landing condition from the task (clean regeneration + full suite with no
  NEW failures vs the known 284/6 baseline set: measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes) was therefore NOT met and
  NOT attempted: no worktree existed to land into, and the suite
  comparison was not run to claim a clean refresh.
- **Disposition: OPEN, owned by the coordinator/ship loop at ship time.**
  Phone-frame receipts (the other half of the known baseline set) likewise
  need real browser receipts this subagent cannot produce.

## 6. NEW FINDINGS ON RE-PROOF (loud — these qualify older claims)

1. **Villager-kit parity claim no longer reproduces: 12/15, not 15/15.**
   `scripts/test-parity-abilities.js` now fails 3 checks on tip (script
   itself untouched since the Oct 16 version bump, so this is src drift
   since the Oct 29 parity re-run):
   - Take Aim fires (patient_aim): 6/120 fights vs bar >24/120 — a large miss.
   - Tactical unbreakable reduces the hit: landed=5 vs required 6–19 — off by one.
   - Tactical haymaker fires (every 3rd swing): 0 haymaker lines in 2 rounds
     vs ≥1 — possibly a 2-round window too short for a 3rd swing.
   This does NOT overturn the parity-prep landing: the five map-slice
   proofs (§1) all still pass. It DOES mean the parity doc's §57 claim
   ("villager's kit 15/15") no longer holds at tip and needs a follow-up
   arm to determine whether combat/ability drift or threshold brittleness
   is responsible. Do not cite 15/15 until that arm reports.
2. **Calm_beast dump artifact blocked by infrastructure, not code.**
   Console legs across seeds confirm the mechanism (see §1); only the
   script's final dump-file write failed (EPERM flap, 4/4 attempts).
   Same flap class as §0.
3. **Tbovertime parity line is not a gate.** See §1: mechanical PASS,
   parity-vs-old-corpus FAIL is printed separately per the script's own
   header and prereg. Do not cite the parity FAIL as a tbovertime failure.

## 7. HELD BRANCHES — KEPT AS BACKUP, DO NOT DELETE

| Branch | Tip | Reason kept |
|---|---|---|
| `gaps2-pavise` | `6f501e08e` | War Pavise party-universe re-measurement: HELD (pilot NO-GO on primary only; shield plants 71%, converts fights to kill/drive-off; next prereg needs 16+ seeds + reconsidered primary). Not killed. |
| `gaps2-staying` | `9666fa698` | Staying tile-join re-gate: HELD (fixture GATE-GO, pilot NO-GO — zero larger tile parties exist on the band; formation, not damage, is the blocker). Party-as-one-body stays dead. |
| `gaps2-returns` | `941daf8ba` | Returns verdict evidence (25 files, evidence only): grudge GO but LANDING HELD pending a confirm run with a lift-based bar; trail-follow NO-GO (need-override cost bar only); hunthold PILOT NO-GO (H-P1 only, lever stays default-OFF). Not killed. |
| `gaps2-returns-control` | `37278d461` | GRUDGE-ONLY control state for the trail arm. Backup for the returns corpora. |
| `build-geartier` | `f205fc2b5` | Gear-tier pilot NO-GO, held (not killed) — pending bigger/party-based re-test per the Oct 28–29 build orders. |
| `build-staying` | `354496772` | Staying-tile gate NO-GO evidence + T code preserved as patch. Held backup. |
| `build-returns` | `137cd5a9a` | Trail-follow pilot NO-GO evidence (sole miss national-ever 5<6). Held backup. |
| `sim-creekpath-armc-b` | `f67cc41df` | Held Loop B original: creekpath Arm C corpus/analysis/sense. Remainder verified already on master; the unique Arm C `goHomeStanding` variant is preserved on master at §1 (2755b1391). Branch kept as backup. |
| `sim-nighttravel-bank-b` | `0c8409f69` | Held Loop B original: nighttravel bank scan (448 control seeds). Remainder verified already on master; its corpus dir's 8 files were 0-byte flap debris and deliberately NOT preserved. Branch kept as backup. |
| `sim-nighttravel-verdict-b` | `bf3b685c9` | Held Loop B original: nighttravel verdict adoption (itself on master as `723b96814`). Branch kept as backup. |

Also kept (not branches): the Loop B originals preservation on master
(`2755b1391`, §1) is marked HISTORICAL EVIDENCE ONLY — the Arm C variant
must not land as a policy change without a new prereg.

## 8. WHAT THIS ARM DID NOT DO (scope boundaries honored)

- No game code landed (no #753 fix, no panel refresh — neither met its
  land condition).
- No leg-village links touched. No gate or deed bar retuned. No default flipped.
- No pushes, no version bumps, no live verification.
- No merge to master — the coordinator merges and verifies HEAD.
- No other loop's lock, tree, claim, or journey-rotation file touched.
- No bare `git stash pop`, no `git reset` on shared state, no `/tmp`
  worktree, no panel-cache commit.

## 9. FOR THE COORDINATOR (checklist)

- [x] This file landed from worktree `gapscomp-livearms` as
      `evidence/2026-10-30/gapscomp-livearms-disposition.md`
      (coordinator merges and verifies HEAD; a staged copy also remains
      at `~/workspace/gapscomp-livearms-disposition.md`).
- [ ] Treat §6 finding 1 (parity-abilities 12/15) as a new follow-up arm;
      do not cite the old 15/15 claim.
- [ ] Route §3 (#753 legacy builders) to its named next arm; do not fold
      it into a panel-system rework.
- [ ] Refresh the neutral panel + phone-frame receipts at ship time (§5);
      do not re-point to `598e21bdb`.
- [ ] Carry forward as Steve-calls: panel-contract discard (recommendation),
      sysbond code Q0(c) (Codex), lingerfinish flee-vs-kill, grudge-landing
      confirm run, walker design approval, leg-village links Q0(a).
