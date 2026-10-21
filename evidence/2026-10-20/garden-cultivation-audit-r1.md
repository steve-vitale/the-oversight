# Garden cultivation candidate

Build e984314d9-20261021-014853, based on shared e984314d9. Not a production
receipt. Steve's direction: beds scale with Haven size; ordinary farming is a
slow supplement; invested gardening abilities make the strong cultivation path.

## Implementation and economics

Haven tiers allow2/4/6/9 paid beds, with stable legacy indices and real soil on
the grid. Existing structures/traps block preparation; doors avoid reserved
garden cells. Old beds survive a capacity reduction. New crop profiles are
authored in gardening.json. Shoots30/28 days, roots generally90 days and
single harvest, slower berries/woody crops and named exceptions. Species units
and actual calories replace a generic5,000-kcal yield. Legacy planted crops
keep their old timing/yield until replanted. This is not full seasonal farming.

For scale: a new L1 lambs-quarters bed gives24×50=1,200 kcal after30 days,
then28-day regrowth, before seed/land/labor and spoilage. It cannot replace
ordinary daily meals. Green Thumb/Whisper pays200 kcal for4/8/12 growth days
across growing beds; owned Whisper synergy and Thumb/Cornucopia next-harvest
yield scale the invested build. Per-bed/day limits survive crop/caretaker
changes. NPCs pay their own food/hunger. Costs and practice use the real
ability engine. No gifted abilities or shortened calendar are required by
the runtime. Prepared tests grant abilities only to exercise rare opportunities.

Standing care uses one actual assignment/day, with other orders and availability
respected. Pantry surplus maintains living crops before alternate work; it
does not cast/harvest unwanted food. Dead beds have a paid40-kcal reclaim route.
One bounded Garden panel owns management, costs, crop details and caretaker
selection. Physical work requires Haven grounds outside the hall. Seed stock
must contain two real units; zero-unit stacks cannot fill the shortage.

## Matched evidence

The e984 baseline was archived before changes. Both roots use the final current
competent controller (real outdoor work, keeper orders, reclaim and casts where
available), same seeded harness and current observer. Source manifests and
configuration are retained. The earlier garden audit's old controller is not
the baseline for this Game comparison.

garden-cultivation-{baseline,natural}-r1:82 cases each,74 observed campaigns
and8 separate sidecar-off controls. Both are stable, all controls match complete
outcomes/state/all23 metrics/RNG tail, no runtime/observer/sidecar warnings.

| Usage | Old | Candidate |
| --- | ---: | ---: |
| Screen campaigns planted |63/64|60/64|
| Screen campaigns harvesting |0/64|4/64|
| Screen delivered kcal |0|80,366|
| Screen crop deaths |168|154|
| Extended campaigns harvesting |2/10|2/10|
| Extended delivered kcal |67,400|56,830|
| Extended crop deaths |20|12|
| Latest extended terminal day |293|278|

Screen cap150 and extended cap600 are declared controller iteration caps,
not promises of that much survival. Every extended case is terminal. Output
does not establish useful intake, ordinary-only farming or eligible NPC magic.
Sowing events are completion observations, not initiation-time deed attribution.

Separate canonical before/after-r1 panels retain16 matched seeds per each of
capable/maker/merchant/caregiver, all23 metrics, feature census and four actual
observer-off controls per arm. Sources stable, zero warnings and matching
neutral controls. Every standard outcome/metric should agree with the same
screen case in the sidecar audit; the sidecar does not serve as a fabricated
replacement for the full feature census.

Wins14→15,10→7,10→6,11→11 (each /16); balanced-r1 stays review_required.
Capable flags class/earned/contest-show gear. Maker flags Table entry/invitation,
day30 survival, deaths, living residents and gear. Merchant flags Table
entry/invitation, class and contest-show gear. Caregiver has no threshold flags
but individual endings change. All38 selected paired replays cover every win
flip and worst adverse survival/community/hunger/class/gear cases. Full final
state, outcome and metrics match in both arms. First coarse differences are
day2 after work (food/needs and some rosters); they do not causally explain
every later ending. No win-rate compensation was added.

Named offered-farmer panels attempt64 seeds per arm. Only seed19 actually
offers a farmer;63 absent offers remain excluded. Final r2 has both played
and excluded neutrality. Invalid r1 had only an excluded proof and is retained,
not treated as valid. Final1-case comparison is insufficient for viability.

Decision: retain this requested design correction for development playtesting
after release gates. Preserve all warnings for Muse calibration; no claim of
small-effect confirmation, pacifism or completed public-release readiness.

## Mobile, saves and test boundaries

- Shared-kit cultivation proof-r8:39/0. Haven access35/0, source credit26/0.
  Legacy save/cycles, roots/replant, actual food values, paid player/NPC magic,
  practice thresholds, repeat limits, structures, indoor refusal and zero seeds.
- Candidate-r1 phone receipts:17 trusted-touch garden stages at390×736/844.
  Actual costs, seed stock, harvest/reclaim, caretaker choice and native Continue.
- Frame-r1:16 real-touch stages at both heights, complete boot-input hashes,
  ordinary controls, conversations, combat Wait at zero moves and escape.
- Lifecycle-r1: actual old worker controls the page, native update, untouched
  save bytes, cold offline boot/Continue. Clean browser errors.
- Natural-save-r3 is a real unedited persistent capable seed5 campaign at
  day73, tier1, four beds, previous harvest day59. It contains inherited/earned
  powers and other progression; it is not an isolated garden-build experiment.
  Its complete result matches the independent persistent no-capture r2 replay.
  Outcome, all23 metrics, garden events and RNG tail match the original audit.
  Full audit state hash differs: real storage index lastPlayed calls advance
  the harness clock. R1's strict failure is retained; do not erase that limit.
- Natural-phone-r5:7 native touch stages at both heights. Continue, actual
  arrival presentation (including inner-reader swipes), Garden discovery,
  outside door, real owned paid cast, grid and another Continue. First failed
  test assumed crop0 must accept magic; the natural save has dead beds. Final
  test checks an actual growing bed and persists the complete plot array.
  No save helper is invoked to conceal an incomplete transaction.

Prepared fixtures supply stock/abilities/aged crops and are labeled. They do
not prove natural attainment. The natural campaign provides that separate
boundary. Desktop Chromium touch is not a physical iOS/Android certification.
The late save also exposes unrelated dehydration/caretaker availability and
pending relay prose; it does not clear the queued later-game coverage goal.

## Failures and maintenance

Retain quick-r1..r4 failures (missing ontology, intended indoor/JSON fixture
updates and stale source proofs), source/proof pilots and phone failures.
The caretaker list genuinely exceeded its bounded region; garden-card flex
layout now keeps it scrollable with a reachable close control. Later r3 phone
failure was a test swipe direction error. Never replace trusted touch with a
scripted Game call or an offscreen auto-click.

Use the actual scripts/receipts named above. Profile edits require cultivation
and full checks, new paired current-source panels, SURVIVAL-LEVERS updates,
and actual phone/Continue/offline evidence for runtime changes. New data is
part of the normal init/version/offline asset list; source proof invalidation
is automatic. Fresh quick and full logs must precede every push. No force push,
hook bypass, ChangePilot queue or unrelated sweep-B.log change belongs here.

Next bounded milestone: retained terminal caregiver cases and natural late-game
phone actions. Muse retains calibration; this source, contracts, raw panels
and warnings are shared through normal Git history, with recovery999c69491
preserved as an ancestor. No direct Muse response is claimed.

Full-r1 exposed two stale legacy fixtures, not grounds for quarantine. The
knowledge test deleted playerTile after mocking a bed; it now steps outside
through the real door and keeps the real world accessor. Its15 assertions
remain green. Drifter remote-work tests omitted new modules via a hardcoded
loader; they now use the shared seeded sim harness. All27 assertions remain
unchanged and green. Full-r1 is retained; fresh quick-r5/full-r2 follow these
fixture corrections. No runtime code or balanced-source input changed.

Final publication gate: quick-r5 271/0 and full-r2 1,043/0 (319 seconds), fresh for this candidate. prepublication-r1 binds the actual source/boot hashes and log bytes. Production verification remains a separate receipt.

## Verified publication

Release39d5623d7 is on shared master/main. Production build
e984314d9-20261021-014853 matches all165 expected boot input hashes;
fresh390×736 touch browser boot has zero page errors. Read publication-r1.json
for the exact hashes/commit/time. Primary checkout fast-forwarded normally and
foreign sweep-B.log remains unstaged. No force push or verification bypass.
The docs/receipt follow-up runs its own fresh quick/full before its own push.
The rolling goal remains active; next concrete milestone is terminal caregiver
coverage, with garden balance warnings reserved for Muse calibration.

The first publication follow-up quick run exposed a legacy registry test reading
HEAD abilities instead of the candidate on disk. Before the release commit it
therefore missed the two new definitions. The real shared-kit cultivation and
browser proofs exercised those actions, but that old registry check was weaker
than reported. It now reads actual worktree data and loads the real garden
registrations alongside godpath; all22 assertions pass, unchanged. The sibling
search found other HEAD references, mostly explicit historical comparisons;
it was not a completed audit of every old test. Publication-full-r1 was stopped
after ownership verification because it had already run the known stale test.
Fresh publication quick/full-r2 are required after this test-only correction.
Runtime, balance panels and phone-source identities remain unchanged.

Publication follow-up final gates: quick-r2 271/0, full-r2 1,043/0 (369 seconds). publication-followup-verification-r1 binds this corrected test and both log bytes. Runtime source still exactly matches the shipped candidate and measured panels.
