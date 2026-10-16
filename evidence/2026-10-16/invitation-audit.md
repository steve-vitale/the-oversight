# Table opportunity windows: a cutoff is not a missing caller

Measured gameplay: `fd2a16c48bdaaef5c5032b8852b8dcd3dbfdb989`, the published
fraying repair. Fixture-only commits `bd7bdac5` (minnow) and `e5ab5e7f` (knowledge)
precede this unit. `e5ab5e7f2caf8788bbae1cb6efa79e34d8713602` is its reconstruction
base; all208 runtime/policy manifest
inputs are identical. No game, policy, observer, metric contract, reward, gate,
food price or release change belongs to this unit.

## Corrected diagnosis

The fraying audit correctly observed that capable10050 ended the150-iteration
window at game day151 with a ready lesser seat and no invitation. Its explicit
post-run `checkArc()` also really produced arc4/waiting. That mutation did not
prove a missing runtime caller. The provisional interpretation is superseded
by the natural traces here; the prior audit, raw results and receipts stay
immutable, including its23-metric outcome warnings.

Every ordinary daily check ran:151 calls, with the last at day150. Its real
`tableSeat()` result still had only2 qualifying late-wave encounters. The third
was recorded after that check. The window then ended with a tactical fight
active. With the unchanged bot, flags and source, a fixed152-iteration window
reaches the ordinary day151 `endDay → progDaily → checkArc` chain, which issues
the invitation. Both windows still have zero wins. This is a bounded opportunity
observation, not a reason to make the ending easier, force progress checks in
the bot, or patch the game's daily cadence.

The recorded function-call history from the original window is an exact prefix
of the extension. This is a check on the instrumented calls, not a claim that
every intermediate state has been snapshotted. Separate plain extended runs
with observer on/off match the diagnostic's full final row and gameplay hash;
observed23-metric objects match too. The original diagnostic matches the pinned
panel's full row/hash/metrics. Neither the final query nor observation changes
the gameplay hash.

## Repeatable diagnostic

`scripts/table-opportunity-audit.js` requires an exact-source complete panel and
explicit selected policy:seed pairs. It rejects different source/observer/
contract, incomplete or duplicated cases, missing neutrality, invalid metrics,
warnings, unmatched flags/Node versions and legacy environment overrides.
For each selected case it runs four independent processes: original-window
instrumented replay, fixed extended replay, and plain extended observer on/off
controls. Tool, observer, contract and game source changes during execution
invalidate the run. A changed earlier call prefix remains unknown rather than
being called a successful continuation. No synthetic checkArc call is used.

```text
node scripts/table-opportunity-audit.js --root <root> --panel <panel.json.gz> --cases capable:10050,capable:10061,maker:10038,caregiver:10036 --extend 2 --out <result.json.gz> --jobs 4
```

Extension is a fixed count of shared-harness loop iterations, not guaranteed
calendar days. Never extend until a win appears or pool different horizons
into the original scorecard. A ready, uninvited endpoint remaining after ordinary
continuation still needs investigation; that label is not proof of a softlock.

The retained final tool run has16 worker executions over eight underlying
case/window combinations, not16 independent campaigns or a balance sample.
Two preliminary natural traces are retained separately. Earlier development
replays are not counted as more seeds. The original64-seed fraying panel remains
the source of its balance measurements; this tool changes no such mechanics.

| Case | Original-window diagnosis | Fixed extension |
| --- | --- | --- |
| capable10050 | Ready seat after last daily check, uninvited, active fight at cutoff | Ordinary day151 check invites; still no win |
| capable10061 | Already entered paths; public seat call overlaps live combat and player contest | Same loss; not a missing invitation |
| maker10038 | Already entered and resolved assimilated | Same win |
| caregiver10036 | No seat: successor lacks food deed | Still no seat or win |

The tool retains actual successful entry overlaps separately. In10061,
`tableTakeSeat()` accepts while combat and a player contest are both active,
then sets Table paths while both remain active. Raw `insideHaven` is false;
that flag alone does not prove physical distance from Haven. The subsequent
death is recorded with a player contest still active. `tableActive()` already covers paths.
Audit public/native entry boundaries, stale actions, actual Haven location,
existing contest ownership and the Table's own permitted trial fights before
a separate repair. This is not evidence that ambient pressure should be reduced
or that Table path selection is excluded by its pause predicate.

## Tests, phone proof and limits

The29-assertion test uses actual retained shared-harness runs and their parent
panel, not fabricated outcome rows. It checks the four diagnoses, paid-world
continuation without a win requirement, full row/hash/metric parity, policy/seed/
source/probe identity, prefix mismatch, errors, incomplete cases and publication
fingerprints. An early draft lacked two case-identity checks and fails those
assertions (23/25). Its exact source/test and failure log are retained; final
guards reject both. No gameplay tuning follows from that tool defect.

At390×844, a prepared ready lesser seat starts at arc3/uninvited on day100.
Native Sleep initially refuses at dawn; native Wait advances to midday, then
native Sleep runs the ordinary daily chain. On day101 the actual meter reports
arc4, invited and announced, HP100 and540 kcal (from1800). Reloading the actual
autosave retains those results. [Dawn](invitation-dawn.jpg) and
[reload](invitation-load.jpg) have full accessibility snapshots. The fixture
grants gates for an isolated trigger check; it does not establish natural
acquisition, native numeric HUD parity or a comfortable food budget. Its helper
never calls checkArc, grants the invitation or sets a winning outcome.

The first full check exposed the known old hunter minnow fixture failure:
952 pass/1 fail. Its real crafting setup is repaired in the separate preceding
commit, with four baseline failures, four paid-cost passes and a dry-land guard
mutation control; see [minnow audit](minnow-fixture-audit.md). A later full run
exposed the ER/person substring false positive in the legacy knowledge audit.
Its separate fixture-only commit checks both unknown and learned occupation
boundaries and rejects two runtime mutations; see [knowledge audit](knowledge-fixture-audit.md).
Both failed full logs remain. No quarantine or assertion relaxation. Final
quick/full logs belong to this complete tooling state with both fixture repairs.
Final quick181/181 and full953/953 pass. The targeted tool proof passes29/29.

## Reconstruct and verify

```text
node evidence/2026-10-16/invitation-verify.cjs
node evidence/2026-10-16/invitation-verify.cjs --current
node evidence/2026-10-16/invitation-reconstruct.cjs after <fresh-directory>
node evidence/2026-10-16/invitation-verify.cjs --recompute <after-directory>
```

The default verifier uses frozen data without importing today's classifier.
`--current` additionally checks current source and runs the29 assertions.
Reconstruction also accepts before/draft; the draft has the original25-check
test and its two expected failures. Source bundles, parent panel, raw16 results,
preliminary traces, logs and phone artifacts are receipt-bound. Recompute uses
the reconstructed classifier with exact helper bytes. Requires the recorded
Node version to replay campaigns; no local build or package installation.

All three reconstructed runtime manifests match. The final reconstructed tool
passes29/29, the frozen draft reproduces its23/25 identity-check failure, and all
four assessments recompute exactly. A fresh reconstructed four-worker replay
of capable10050 reproduces every case/result/envelope field exactly. Those four
reproduction executions are additional controls, not additional campaign seeds.
The bundle preserves raw observer/contract bytes separately from normalized
runtime inputs: the first reconstruction correctly rejected CRLF→LF observer
hash drift. Raw-byte preservation fixes the bundle without weakening identity
checks or changing the recorded collector lineage.

Decision: retain this diagnostic and correct current roadmap status. Keep all
prior bounded metrics, hard ending gates and uncertain human feel judgments.
No missing daily caller is established; the entry-overlap audit is separate.
