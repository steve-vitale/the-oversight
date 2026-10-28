# sim-culthall-b — PREREGISTRATION (committed before any judged probe)

Run: fleshout-loop-b-20261028T0444Z, arm sim-culthall-b.
Question (findings-backlog item 1281, open): on a fresh setup, is the
cultivate hall gate real-play sound — i.e. does the player start inside
the hall, get refused from garden work with a legible reason, and get
unblocked by the in-game Step outside action? Prior arm
sim-spandraw-design-b (evidence/2026-10-27/sim-spandraw-design-b.md)
reported this as a FIXTURE FACT, not a defect claim: its probe instances
start inside the hall and green_thumb/green_whisper cultivate refuses
with "Step outside the hall". This arm closes that open question with a
real-play sequence. Measurement only; zero game code unless a prereg GO
leg proves a genuine defect (see defect branch).

## Canon
- docs/CANON.md read first. docs/GARDENS.md read: "All hands-on work
  requires Haven grounds, outside the hall." No canon doc is known to
  cover ability-action refusals or the garden gate specifically; none
  was invented. The gate under test is gardenWorkGate() in
  src/js/gardenCultivation.js: insideHaven → {ok:false, short:
  'step outside', reason: 'Step outside the hall to work the garden.'}.
- The in-game Step outside action is the '🚪 Step outside' door-cell
  button and the 'Step outside' label handler in src/js/app.js, both of
  which call exactly Game.exitBuilding(). app.js is DOM-only and is
  excluded from the node harness by design, so no browser click is
  claimed: the UI path is verified at code level (button → exitBuilding)
  and the engine call itself is executed. This limitation is stated in
  the evidence, not hidden.

## Primary metric
Hall-gate sequence correctness per seed: (A) inside refusal exact +
zero state change, (B) exit unblocks garden work. GO requires BOTH legs
on 8/8 pilot seeds. A miss on either leg is NO-GO, never re-scored
against a friendlier metric mid-run.

## Legs (binding)
- Leg A — inside refusal (fresh setup, before any exit):
  - A0: fresh setup leaves scholar.insideHaven === true, map at Haven
    (px 4, py 4, player tile type 'haven'). If A0 fails on a seed, that
    seed does not test the gate as framed; record it as a setup finding,
    not as a gate pass.
  - A1 (GO-critical): with green_thumb level 1 granted (disclosed
    fixture, same grant method as the spandraw probe: push {id, level:1}
    onto scholar.abilities), Game.useAbility('green_thumb','cultivate')
    returns false, the player-visible line is exactly 'Step outside
    the hall to work the garden.', gardenWorkGate() returns ok:false
    with short 'step outside' and that exact reason, and the refused
    tap changes NO state: day, kcal, garden plots, scholar position and
    tick counters identical before/after.
  - A2 (supporting, not GO-critical): Game.makePlot() while inside is
    likewise refused with the same hall reason (shows the gate covers
    garden work generally, not only the ability path).
- Leg B — exit unblocks (same seed, immediately after leg A):
  - B1 (GO-critical): Game.exitBuilding() returns truthy and
    scholar.insideHaven becomes false, player still on the Haven tile
    (px 4, py 4).
  - B2 (GO-critical): gardenWorkGate() then returns ok:true, and
    Game.makePlot() FIRES: non-null status, garden plots +1, scholar
    kcal −120 (the documented breaking-ground cost). This is real
    garden work firing past the gate, not merely a gate object flip.
  - B3 (supporting): gardenMagicGate() after exit no longer returns the
    hall reason; record its actual reason (expected: no growing bed yet,
    since no crop has been sown — that is a later gate, not the hall
    gate). If cultivate itself fires on a seed, report it as extra, not
    as a requirement: no sowing fixture is preregistered.
- Leg C — replication: legs A+B run on a fresh 8-seed pilot band,
  seeds 10400–10407. Collision check before judging: grep of scripts/
  and evidence/ found no prior seed band using 10400–10407 (the only
  10400–10407 hits in evidence are kcal values, not seeds).
- Leg D — sense read: quote the actual refusal line, the exit line and
  the garden-work line a player sees, and judge whether the gate + the
  way out are legible (does the refusal name an action the player can
  actually take from where they stand?).

## Horizon + why
Fixture/sequence arm: the whole sequence completes on day 1 of a fresh
setup. No campaign is run, no days are simulated, no fixed 200d horizon
applies. Death-aware horizons are vacuous here: the only time advance
is makePlot's own paid tick, which is part of leg B's firing proof.
National / table / wins do NOT apply to this arm and are not reported
as numbers: no village campaign exists to reach them. Stating that
explicitly, rather than inventing wall numbers.

## Seeds, policies, fixtures
- Seeds: 10400, 10401, 10402, 10403, 10404, 10405, 10406, 10407.
- Policies: none. No bot policy runs; the sequence is driven directly
  through public Game methods (useAbility, exitBuilding, makePlot,
  gardenWorkGate, gardenMagicGate) via scripts/sim-harness.js
  (loadGame + setupGame, seeded Math.random before eval, full src/js
  list in index.html order minus DOM-only files).
- Fixtures (disclosed): green_thumb level 1 granted by abilities push
  (the cultivate ability path needs a held ability; the hall gate is
  checked before the ability plan, so the grant does not mask the gate
  — leg A1 asserts the hall reason, not an ability reason). Narration
  kept on (setupGame narration:true) and Game.say wrapped to capture
  player-visible lines; no other narration changes. No Game.save stub.
- Pilot gate: 8 seeds before any confirm spend. Confirm (12–16 seeds)
  only if the pilot GO holds AND a defect branch opens; a clean
  gate-verified pilot needs no confirm band, since there is no effect
  size to confirm — the pilot IS the replication.

## GO threshold (binding)
GO = legs A1 + B1 + B2 hold on 8/8 pilot seeds, with refusal reason
exact and zero state change on refused taps. Verdict mapping:
- 8/8 → GO, verdict "gate verified working as intended"; backlog 1281
  recommended disposition: closed-as-verified (coordinator applies it;
  this arm does not edit the backlog as a code fix).
- Anything less → NO-GO (or DIAG- per the defect branch below).

## Defect branch
If the gate misbehaves (cultivate succeeds while inside, or exiting
does not unblock garden work): that is a proven defect finding. Do NOT
silently fix it. Write the finding with numbers first, and only then —
with a prereg amendment committed BEFORE the fix probe — implement the
smallest gate fix in gardenCultivation.js with before/after proof on
identical seeds. If the gate works as the fixture fact says, no game
code is touched.

## Balanced panel (§15) — explicit no-panel statement
This arm has no before/after game leg (no code changes, no policy
comparison), so no balance-panel compare is fabricated. The replication
check used instead is the 8-seed pilot band with per-seed exactness
(identical refusal reason, identical zero-change, identical firing
costs on every seed), as prior fixture arms did.

## Metric review (to be completed in the evidence file)
- Whether the legs measured what was asked, and any revision proposed
  for the NEXT run (never applied mid-run).
