# journey-scale r92 — Lane A, leg 3 SCALE (2026-11-03)

**Run id:** laneA-scale-2026-11-03T13:45CST (scheduled 13:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@8703965a5 at branch creation.
**Pre-register:** evidence/2026-11-03/journey-scale-r92-prereg.md
(written before any scored seed ran).
**Change set at closeout:** UNCOMMITTED — see Closeout (container-wide
git-write outage). The change set itself is complete in the worktree:
src/js/hierarchy.js (tendLink peer extension) + src/js/app.js (peer
panel label/terms) + proof test test-peer-tend-r92-20261103.js + r92
driver/analyzer + evidence + run note. Zero gate/threshold/number
changes. Gating freeze honored; perception law honored (all
instruments read-only; pickers press offered menu items only; the
tend-arm presses the offered tendLink verb only).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 31%,
  `git pull` already up to date, worktree-reap ran (14/16 active —
  all dirty/held sibling trees, correctly untouched).
- **Registration queued ~3 min** (registry lock serialized across
  agents' checkouts), then landed; first heartbeat verified by
  read-back (20:43:20Z — registration-time beat; the script records
  registration time, not wall time, same quirk as r91).
- **Heartbeat EPERM flap, never cleared this run:** from ~20:49Z
  the 5-minute loop's beats AND manual beats fail with
  PermissionError writing the registry tmp file (the container EPERM
  flap class). Last landed beat 20:44:21Z, still stale at closeout.
  The tree was NEVER at reaper risk (4-hour threshold), no
  competing lane-A run was due before closeout, and the lock file
  itself stayed intact — but a later overlap guard reading the
  stale heartbeat could mistake this finished run's tree for dead
  if the release step also flaps; closeout therefore verifies the
  release explicitly (see Closeout). Sibling agents were observed
  retry-looping commits/checkouts against the same flap at 21:0xZ,
  so this was a container-wide episode, not this tree.
- **Tend-arm evidence EPERM (worked around, not cleared):** the Q2b
  run's evidence writes fail with EPERM at the trust-json
  writeFileSync, in the worktree evidence dir AND in /tmp — the same
  flap class. The seed itself played every time; only the evidence
  write failed. Workaround (this run's variant of the r91
  precedent): a stdout-only probe (no file writes at all) carried
  the confirmation — its output is quoted in Q2b above and in the
  closeout log, not in a tendarm evidence file. The empty
  tendarm.log / 0-byte trust json from the failed file runs were
  left in place as flap evidence, not committed as results.

## Q2 — PEER TENDING: LANDED (the delivery)
**The carried r91 proposal is now code, proven, and [panel status].**
tendLink (hierarchy.js) previously required link.primary === HOME,
but peer links are formed with primary: null, subordinate: null
(a/b shape) — so every covenant/trade link refused with "There is
no bond of ours to tend there." while the Haven panel still offered
the "Send grain (1,500 kcal)" button on those links. Worse, the
panel rendered a peer link as "them bows to Haven" (the far end
resolved via subordinate, null for peers) and would throw on the
peer's missing tribute field. The fix extends tendLink to peer
links (kind covenant/trade, a/b contains HOME) with the LEAD verb's
exact pricing and cadence — 1,500 kcal → +8 trust via _trustGain,
once per week per link (tendedWeek), refused during mourning,
partial-pantry partial gain, aid credit to the PEER's pantry (via
_linkOther, not link.subordinate), ledger 'tended:<other>', link
note — and the panel now renders peers as equals ("League with X"
/
"Charter with X", pool/tariff terms instead of tribute). BELONG
links (Haven subordinate) still refuse. The seasoned bar (30 days
+ trust 40) is UNTOUCHED: this adds the verb, not a lower bar.
winPlanBondsTick is NOT extended (villager-side peer tending is a
named follow-up, not smuggled in).
- **Proof test** scripts/test-peer-tend-r92-20261103.js:
  RED on base (4 pass / 8 fail — exactly the peer-tend checks; LEAD
  works and BELONG refuses on base too), GREEN with the fix
  (12/12): paid 1500, trust 30→38, grain line naming the peer,
  peer pantry +1500, link note, weekly dedup, mourning choke,
  partial 500 kcal → +3, LEAD unchanged, BELONG still refused.
- **Panel confirmation (Q2b): CONFIRMED on seed 85092 (substitute,
  reason stated).** The prereg seed 85101 formed zero peer links, so
  its tend-arm would have shown 0 tends trivially; the first
  substitute, r91's peer-bearing seed 85091, ALSO formed zero peers
  on the new base (died day 59, before courtship matured) — itself
  evidence for the earlier-death band shift. Seed 85092, run with the
  driver tend-arm (stdout probe, no file writes, so the EPERM flap
  could not eat it), lived to day 181 and confirmed: **tendPeer = 7**
  — seven grain sends landed on real peer links, with the game
  saying so aloud ("Haven sends 1,530 kcal of grain to Thornfield's
  fire…", Ashford, Stonebridge, The Hungry Road; paid 1530/1600
  reflects whole-unit pantry removal, honest over-removal per the
  _removePantryKcal doctrine). End trusts: covenant 44/39/46, trade
  45 — the verb demonstrably climbs peers into/near the seasoned
  40. Refusals 0 on fixed code (no "no bond of ours" lines). The
  file-based tend-arm runs failed only on the EPERM evidence-write
  flap (trust-json writeFileSync, worktree dir AND /tmp); the seed
  itself played every time. 85093's peers sat at trust 91 already
  (arm correctly tends only <40), 85094 died day 54 peerless.

## Q1 — SCALE CONTINUITY: fresh quad 85101–85104 (all on fixed code)
Pilot 85101 ran first, no crash → quad expanded per prereg (the
pilot gate is crash-only this run; no pilgrimage gate was set).
Policy scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=0 (unforced,
per the r91 method note), DAYCAP 180, death-aware stop (+10d tail
max). TEND_PEER unset (base-policy parity).

| seed | end | day | pop | pantry | rank | seat | arc | propPeer | trips | courtPoor |
|---|---|---|---|---|---|---|---|---|---|---|
| 85101 | SCATTERED (hunger, 3rd day) | 33 | 4/4 | 0 | village | none | 3 | 0 | 4 | 9 |
| 85102 | SCATTERED (hunger) | 26 | 8/8 | 0 | village | none | 3 | 0 | 1 | 2 |
| 85103 | DIED OUT (last bearer) | 80 | 0/0 | 2185 | regional | lesser (waiting) | 4 | 0 | 5 | 24 |
| 85104 | DIED OUT (last bearer) | 86 | 0/0 | 0 | regional | lesser (waiting) | 4 | 0 | 29 | 22 |

- **The band died before the leg began.** No seed reached day 90,
  let alone the 80–140 scale window in strength: the two early seeds
  scattered hungry in the landing window (days 26/33), the two later
  seeds died out (last bearer) at 80/86 with the lesser seat waiting
  — the r91 shape (lesser waiting, then people run out) but earlier.
  National 0/4, global 0/4, full seat 0/4, wave 5 0/4 — the band shape
  holds, and this run does not pretend otherwise.
- **Links collapsed vs r91 — and the fix is not the cause.** r91's
  quad formed 5–7 links per seed; this quad formed 1 lead link per
  seed and ZERO peer links (proposedPeer 0/4, tended 0/4 — the bot
  never had a peer to tend, and the fix cannot move a run the bot
  never presses tend in: Q1 runs with TEND_PEER unset, and
  winPlanBondsTick needs ≥2 primary links, which no seed had).
  GOSSIP_FIRST=0 touches only conversation picks, and no sitting
  happened before any death, so it is inert here too. What DID
  change between the bases: the win-intel landing (villagers pursue
  a winning gameplan) and the winnability arms (wild ally-join,
  field-fight damage/staying) plus gap-batch items, all merged after
  r91's base. That is a CANDIDATE for the earlier deaths and the
  missing courtship, not a verdict: n=4 vs n=4 on different seeds
  cannot attribute causality, and seed variance in this game is
  huge. The before-and-after question (matched seeds, base vs
  current) is a named follow-up for the loops, not a claim made
  here. The r91 comparison band and this band's numbers are both
  reported plainly so that follow-up can be scoped.
- **85103's pellet story, voiced this time:** pellet installed d62
  (fusionInstallDay 62, flips 2, feast grants 12) — the r91 voice
  line's territory, and the analyzer shows the install/flip shape
  intact on the new base. No succession-with-pellet case is claimed
  here: the village died out at d80 and the fusion trace is
  report-only in this run.
- **Duty counts (Q4, report-only):** weapon-craft lines 0/4 seeds,
  deadfall-duty lines 0/4 seeds; wsplit eligible 0, attempts 0 in
  all four (villager-days 163/97/274/416, knower-days 53/25/45/185,
  effectively all armed). The count continues, it does not re-argue
  the armed-gate classification.

## Q3 — PEOPLE CHECK: NOT PERFORMABLE (named absence)
Zero transcript files exist in this run (analyzer: sittings 0/4
seeds, gossip picks 0). The driver runs sittings on the day-90
pattern and every village died before day 90 (33/26/80/86), so no
day-90 sitting — and no earlier sitting — was ever staged. Per the
prereg, no substitution was made and no verdict is claimed from
capture lines: a people check without a full transcript is not a
people check. The unforforced-policy question (does want resolution
show when gossip is not forced?) is therefore still open, and needs
a band that lives to its sitting day. The narrowness is named, not
papered over.

## Reachable / Fun / Winnable (plain words)
- **Reachable:** the scale leg itself was barely reached. Regional
  in 2/4 seeds, lesser seat waiting in 2/4, a pellet install in 1/4
  — the doors a competent player can open are still there, but this
  band mostly died before knocking. The one thing never reached,
  again: national, global, wave 5, the full seat. The new peer-tend
  verb is reachable by construction (the panel button that used to
  refuse now works), but no quad seed lived to use it — its in-run
  proof is Q2b, not Q1.
- **Fun:** thin this run, honestly. The two early scatters are the
  same hunger story as r91's late scatters, only faster; the two
  died-out seeds repeat the r91 sting (lesser waiting, people gone).
  The bright spot is off-census: the peer-tend fix itself — a
  one-tending-short road now has a verb, and the panel stops lying
  about leagues.
- **Winnable:** not shown this run — and this run doesn't pretend
  otherwise. National stayed unreached (this time for lack of links
  at all, not one trust point), the full seat untouched, wave 5
  untouched. The new information is the verb + the earlier-death
  band, not a shorter wall.

## Telemetry deviation check (step 14)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-census.json --current
'evidence/2026-11-03/journey-scale-r92/journey-scale-r92-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ TWO LOUD lines, both investigated same-run, both EXPLAINED as band
composition, baseline NOT rolled:
- `census.day swung -61%: baseline 579 -> current 225 (n=4 files)`:
  current total 225 = 33+26+80+86, the earlier-death band itself —
  the run's headline finding, already reported in Q1 with its
  candidate (post-r91 win-intel/winnability landings) and its
  non-verdict status. A day swing caused by villages dying sooner
  is not a telemetry-instrument regression, and rolling it would
  bless the shorter band as the new normal.
- `census.pantryKcal newly appeared: baseline 0 -> current 2185
  (n=4 files)`: the entire 2,185 comes from seed 85103, which DIED
  OUT with food in store (last bearer) — the same composition
  shape as r91's 13,842 from its died-out seed, and the same
  verdict: not a pantry-economy regression (people died faster than
  food ran out). Baseline NOT rolled, for r91's reason: rolling a
  died-out seed's pantry into the baseline would mask future pantry
  regressions in the other direction.
- popAlive, maxWave, pilgrimages tripped no LOUD line.

## Tests
- Proof test (before/after): RED on base 4 pass / 8 fail, GREEN with
  fix 12/12 (see Q2).
- `node --check` clean on the r92 driver, analyzer, proof test, and
  patched hierarchy.js/app.js.
- Analyzer on the quad EVIDIR: all four seed lines as reported
  above (fusion install d62/flips 2 on 85103 only; duty zeros;
  sittings 0/4).
- check.js --quick (on the branch code): **275 passed, 15 failed in
  555s.** Every failure individually accounted for; NONE is
  attributable to the peer-tend change (no failure names tendLink,
  hierarchy, or the panel):
  - r91-known 6, same files + same assertions, confirmed from the
    log: measurement-proof-update, measurement-workflow (retained
    neutrality proof), mobile-combat-cadence (same 2 assertions),
    occupation-panels, phone-frame-proof (same 3), establishment-r20
    racks-full gate (same next-day assertion).
  - measurement-cache-flags: r91's flake, here failing on an EPERM
    writeFileSync inside balance-panel's worker (temp-dir write) on
    direct re-run — flap artifact, no assertion about this change.
  - 7 × pure EPERM flap failures (write/copy syscalls, no game
    assertions): human-combat-parity, measurement-source-text,
    measurement-flags, prepared-runner-custody, proof-text-identity,
    telemetry-check-recorder, sw-audio-cache (stderr names the
    EPERM copyfile).
  - foodpower-20261014: FAILED under check.js on the ontology step
    with a truncated log, then PASSED directly (30/30) with the fix
    in place — a parallel-load artifact of the same class as r91's
    cleared timeouts, not a regression.
  - Notably: NONE of r91's 4 timeout failures recurred
    (trust-observer-neutrality, synergy-stall, capable-bot,
    table-endings all passed).
  - Gate clause (c) therefore HOLDS in substance: no failure in the
    suite is attributable to the peer-tend change.
- Stray-file discipline: check.js left docs/ONTOLOGY.md modified in
  the worktree (a regeneration side effect; this time a 2045-line
  deletion, unlike r91's addition). Discard attempted 6+ times via
  `git checkout -- docs/ONTOLOGY.md` — blocked by the git-write
  outage (see Closeout). It was NEVER committed and must NOT be
  swept into the landing commit: discard it in the worktree before
  committing, or commit with an explicit file list that excludes it
  (the safe-commit route does this by construction).
- Tend-arm stdout probe scripts (tmp-tendarm-stdout-r92.js,
  tmp-tendprobe-r92.js) were DELETED before commit — probe-only,
  never part of the change set.

## Metric review
- Q1's pilot gate fired exactly as written (pilot 85101 no crash →
  quad expanded; no pilgrimage gate was set this run, per prereg —
  not a mid-run re-score).
- Q2's fix gate: ALL THREE CLAUSES HOLD — (a) RED→GREEN proof test
  (LEAD unchanged, BELONG still refused); (b) Q2b panel confirmation
  on seed 85092 (7 tends landed on a real run, peer trusts into the
  40s), with the seed substitution (85101 → 85091 → 85092) and its
  reasons stated in Q2b, not hidden; (c) check.js --quick with no
  failure attributable to the change (see Tests). The change
  therefore LANDS, with `[needs-eyes]` — Steve should press Send
  grain on a covenant link on his phone and watch the trust move.
  (Panel rendering itself is DOM-only and cannot be proven by node
  sims; the label/terms fix is code-reviewed, not sim-proven, and
  is labeled as such.)
- Q3's absence is narrowness, named: all seeds ended before the
  sitting day, so no transcript exists and none was substituted.
- The Q1/Q2 interaction is stated plainly, not hidden: the quad
  cannot confirm the fix (no peers formed, bot never tends), so Q2b
  carries the in-run confirmation and the proof test carries the
  base refusal. Claiming the quad as fix evidence would be false.
- Carried, still open: the nomad.js road-wipe mantle voicing
  (follow-up to r91 Q2, not smuggled in); win-plan tending of peer
  links (follow-up to this run's Q2); the matched-seed
  before/after on the earlier-death band (win-intel/winnability
  landings as candidates, not verdicts); the unforforced
  want-resolution people check (needs a band that lives to its
  sitting day); the wave-4/5 breadth wall for the full seat
  (unchanged, not re-proven here).

## Closeout — BLOCKED ON LANDING (read this first)
**NOT merged, NOT committed, rotation NOT advanced — by infrastructure,
not by verdict.** All three fix-gate clauses hold (see Metric review)
and the work is complete, but the run could not land it:
- **The outage:** from ~20:50Z onward, every git write in this
  container fails with EPERM — `safe-commit.sh` (private index in
  /tmp AND in $HOME), `git checkout -- docs/ONTOLOGY.md`, `git
  hash-object -w`, `git update-ref`, even `git init` in a fresh
  /tmp repo ("copy-fd: write returned: Operation not permitted")
  and plain `cp` ("error writing: Operation not permitted").
  Plain shell writes (`echo > file`) and git READS (`status`, `log`)
  work fine throughout — the failing path is git's file-copy/object
  write path, container-wide (sibling agents were observed
  retry-looping commits and checkouts against the same errors at
  21:0xZ). ~15 commit attempts across three temp locations, plus 6
  ONTOLOGY-discard attempts, all failed. This is NOT a safe-commit
  refusal (the script never refused; the OS denied its temp file).
- **Preserved state (for the main session to land when git writes
  recover):** branch `journey-scale` at base 8703965a5, worktree
  `~/workspace/worktrees/journey-scale`, all r92 files present and
  uncommitted (status: M src/js/hierarchy.js, M src/js/app.js,
  M docs/ONTOLOGY.md [REGENERATED SIDE EFFECT — discard, do not
  commit], plus the r92 evidence/scripts listed in Tests). A
  flap-workaround script copy,
  scripts/safe-commit-homeidx.sh (identical to safe-commit.sh
  except the private index lives under $HOME), is also in the
  worktree UNCOMMITTED — use it or the stock script once writes
  recover; delete it before committing either way.
- **Main tree at closeout:** CLEAN (0 dirty lines) but MOVED —
  master is now 2d8f1f02c (a sibling's sim-food-adopt landing),
  ahead of this branch's base 8703965a5. Landing therefore needs:
  discard ONTOLOGY.md, commit the explicit r92 file list (never a
  bare commit — the ONTOLOGY modification must not sweep in),
  re-run the proof test, rebase onto current master, re-run the
  proof test, `git merge --ff-only journey-scale`, release the
  worktree, and verify main clean. Then write rotation-a 3→0.
- **Rotation:** LEFT AT 3 (not advanced — the delivery is not
  landed, so the next lane-A run correctly replays SCALE).
- **Lock:** LEFT IN PLACE deliberately (run_id 2026-11-03T20:32:57Z).
  The heartbeat is stale (last landed 20:44:21Z), so the next lane-A
  run's overlap guard will correctly treat this run as dead,
  stale-recover the lock, and proceed. Deleting the lock while the
  branch is uncommitted would risk orphaning the work; the lock +
  registry entry are what let the main session find it.
- **Heartbeat loop:** killed at closeout (it could only fail
  against the same outage from 20:49Z on).
- **Report status:** "NOT merged — git-write outage; branch
  journey-scale preserved uncommitted in its worktree, ready to
  land." No version tag, no ship claim. The ship loop has nothing
  to ship from this run until the landing completes.
