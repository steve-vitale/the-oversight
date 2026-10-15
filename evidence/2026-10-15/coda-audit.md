# Complete build codas and real Table ending display — 2026-10-15

## Delivered

All **70/70** light/dark build codas now exist: ten gods, twenty subclasses,
five tracks. This adds the 64 missing variants, including noncombat builds.
Each is two lines in second person, describing the lived run and its moral
habits without promising a later bodily return to Haven. Several original
exemplars were adjusted too: the Assimilated's comfort/grief outcomes can
absorb or erase the bearer, so a universal coda cannot then show them walking
Haven's fence as though that outcome never happened. Existing bespoke path
entries are unchanged and retain priority over any coda. THE HOSTS and
pod-demand add their closing build text without losing their base stories.

This is Codex's claimed godpath/Table lane. Muse's region/nomad/system files
are not changed. Table UI and resolved-text retention are explicitly noted
exceptions in AGENT-LANES. Narrative feel remains **needs-eyes** for Steve;
this is not a claim that every voice or moral interpretation is final.

## Browser failures that headless selection tests missed

At 390 × 844 on loopback, existing debug controls created the Overtime x3
Table-ready state. The gift picker plus visible ability grants prepared
Green Whisper, Cornucopia and Rain Dancer; ordinary Wait / Wait / Sleep
advanced to day 101 and the System actually named Gardener. The real seat
locked that class; the only earned door was the Assimilated. This is a
prepared endgame/UI contract test, not a naturally earned run or ascension.

The first door choice left no challenge sheet visible. The app refreshed
while the old `the-table` sheet was still queued, suppressing its successor;
then the generic click dispatcher closed the old sheet. The Table's own
callback now consumes its old sheet first and returns `keep` after refreshing,
so the generic dispatcher leaves the new same-ID sheet open. Other sheet
callbacks/queue rules are unchanged. The shared-kit regression executes the
actual app queue/render/pending/click functions with a minimal DOM: **1 pass /
3 fail** before, **4/4** after, including real door, beats and final resolution.

A reload initially reused the old script from the offline cache (server logs
showed no new app.js request; sw.js is cache-first). Fresh loopback origins
loaded the corrected code without a service-worker version bump. The next
playthrough reached the actual final, but revealed a second old gap: the
end screen showed only THE UNKNOWN and an expedition record. Path outcome
and codas were emitted into Game.say and never rendered there.

The final handler now retains the actual composed text once in
`table.resolution = {title, finalId, label, lines}`. The won screen renders
its escaped paragraphs and resolved title/choice. It does not rerun the
resolver, reread a mutable build, or rely on a truncated log. THE HOSTS
stores its actual return story plus coda; pod-demand stores the one actual
price receipt plus coda. Losses do not show retained win text, and older
finished states without this optional field still show their record. This
does not add replay data to historical records that never retained it.

Final fresh-origin phone play: the visible Gardener seat entered Assimilated,
then chose Kitchens → Resident alien → Food truth / Dead Drop → Accept
comfort. Every next sheet stayed visible. The actual final screen shows
THE ASSIMILATED, its warm/dim dead-drop outcome, and the two Gardener lines
in order. Both paragraphs fit the outcome without claiming a return home.
Captured warnings/errors were empty. No browser evaluation mutated game state;
all preparation and decisions used existing controls. The earlier cached
failed attempt included a different gift/prepared extra ability; the final
captured run used the three named forager abilities above. Screens are from
different prepared characters, not a paired survival experiment.

- [Before: generic screen without its story](coda-before-phone.png)
- [After: actual path outcome and Gardener coda](coda-gardener-phone.png)

The final screenshot was taken after repaint at the top of the document.
An immediate screenshot had captured the previous sheet during transition;
a full-page capture timed out. Those were not used as final proof. Agent
tabs were closed, the viewport override reset, and owned servers stopped.

## Runtime/content contracts

- Validator: **70/70 codas, zero missing, zero errors**. Optional bespoke
  beats/overrides are not a requirement to fill every possible path matrix.
- Coverage proof: all **595** locked build/path/moral cases resolve and fill
  tokens, with bespoke priority and all three grey-Relay lean cases. It
  also checks sparse older-data fallback and all 140 lines are distinct.
- **70 actual prepared final choices** run through chooseTableOption,
  preserving the path outcome and emitting exactly one selected coda plus
  matching win telemetry. These are prepared finals, not natural wins.
- Existing ending proof: **61/61**, retaining locked keys, fallback semantics,
  no-god door parity and winnable/losable walks across its fixture builds.
  Assertions tied to intentionally missing codas now expect the new content;
  missing-data fallback is explicitly tested with sparse fixture data.
- Display proof: **8/8**, covering actual composed storage, the real app
  renderer, log clearing/live-build changes, HTML escaping, loss concealment,
  older states, HOSTS base narrative, and one pod-price call. The pod-price
  receipt case is a prepared stub, not a natural paid-pod achievement.
- Handoff proof: **4/4** with actual game and app sheet functions.

No gate, reward, damage, seat, moral or ability power lever is changed.
The added resolution field is narrative state, not an unlock. No new JS
module is loaded by index.html.

## Matched natural simulations

Standard sweep-compare driver, 150-day horizon, first 16 standard seeds,
capable and maker, one harness per child process: **32 runs per arm**.
Default Columbus origin routes these cases to eastern woodlands. Baseline
source is archived from 27499371. Final production/policy bytes stayed fixed
during the final screen; parent HEAD in reports identifies the checkout
parent, while actual source hashes identify the candidate bytes.

| Policy | Before / after wins | Before / after seats | Before / after median days |
|---|---:|---:|---:|
| capable | 9 / 9 | 13 / 13 | 92 / 92 |
| maker | 6 / 6 | 8 / 8 | 104.5 / 104.5 |

All **32/32 standard row objects match** after excluding only the new ending
metadata under `extra`: days, gameDays, won, rank, invitations, seats, wave,
arc, deaths, vests and pacing/action counts. This is not a full gameplay-state
hash comparison or a claim about every individual choice ID. It shows no
standard outcome change in this screen; there is no claim of a small
win-rate improvement requiring a 64-seed estimate. All fifteen natural wins
previously resolved to `kind:path`; all fifteen now choose a god or track
coda. Four gods appear among capable endings, with the maker's god endings
on Apex Predator. This does not prove all classes naturally form or ascend.

`coda-before-16.json` and `coda-after-16.json` are the paired reports.
`coda-content-only-16.json` retains the earlier content-only candidate before
the browser fixes. Its standard outcomes match as well. The screen's end
observer reads existing state only; it uses the same policy/driver cadence.
UI changes are absent from the headless loader, so the actual phone and app
function tests supply that missing evidence rather than claiming the bot
verified browser rendering.

## Verification and next work

Content-only full suite: **908/908**. Sheet-fix full suite: **909/909**.
Display candidate: **909/910**; the unseeded legacy moot aftermath test's
judged-heat assertion failed once, then passed unchanged in isolation
**27/27**. Final unchanged full retry: **910/910**, 137 seconds. Final quick:
**138/138**. No quarantine. All four full logs are retained here; diff check
is clean. The initial coverage test fixture also needed its per-run telemetry
deduplication reset between prepared endings; this was fixture bookkeeping,
not a game change or suppressed failure.

Source hashes: [candidate manifest](coda-source-hashes.json). Validator
projection: [coverage](coda-validation.json). Final suite:
[full log](coda-final-full-check.log). The broad roadmap goal remains active.
Next Codex work: fitting god deeds and current ascension measurements, then
remaining promised scale/parity effects and subclass/job access. Codas are
complete; that is not a completion claim for godpath balance or the roadmap.
No main/master merge, deployment or service-worker version bump.

Reproduce:

```powershell
node scripts/validate-table-endings.js --json
node scripts/godpath/test-coda-coverage.js
node scripts/godpath/test-table-sheet-handoff.js
node scripts/godpath/test-table-ending-display.js
node scripts/test-table-endings-20261014.js
node scripts/godpath/coda-screen.js --out <after.json>
node scripts/godpath/coda-screen.js --root <baseline-checkout> --out <before.json>
```
