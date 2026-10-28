# sim-culthall-b — cultivate hall gate: real-play proof

Run: fleshout-loop-b-20261028T0444Z, arm sim-culthall-b.
Question: findings-backlog item 1281 — on a fresh setup, is the
cultivate hall gate sound, or is it a defect? Prior arm
sim-spandraw-design-b (evidence/2026-10-27/sim-spandraw-design-b.md)
reported the gate as a FIXTURE FACT, not a defect claim. This arm
closes the question with a real-play sequence: refuse inside, step
outside through the game's own action, work the garden outside.

Verdict: **GO — gate verified working as intended. No game code
changed, no fix needed.** Recommended backlog disposition for item
1281: **closed-as-verified** (coordinator applies it; this arm does
not present a code fix).

## Preregistration
evidence/2026-10-28/sim-culthall-b-prereg.md, committed as 9beef92
BEFORE any judged probe. GO required legs A1 + B1 + B2 on 8/8 pilot
seeds, refusal reason exact, zero state change on refused taps.
Proof script: scripts/test-culthall-b.js (one process per seed; the
`--all` run spawns a fresh harness per seed and judges against the
prereg). Per-seed corpus: evidence/2026-10-28/sim-culthall-b-corpus/
(seed-10400.json … seed-10407.json).

## Method (plain words)
A fresh game was started the same way the earlier probe started one
(the shared sim harness, seeded chance, full game code except the
phone-screen files, which cannot run in this kind of test). The player
was given the Green Thumb garden ability for the test — disclosed
openly, and it cannot hide the hall gate, because the hall check runs
before any ability check. Then, on each seed: try to cultivate while
still inside the hall; try to break garden ground while inside; step
outside with the game's own Step outside action; then try the garden
again. Nothing about the game itself was changed for this test.

One honest limit: the phone screen itself was not tapped here. The
Step outside button on the phone screen and the menu entry both call
the exact same Step outside function that this test ran, and that
button-to-function link was checked in the code. So this proves the
game's side of the sequence; it does not claim a phone tap was made.

## Results — 8/8 seeds, identical on every seed
Seeds 10400–10407 (fresh band; no earlier seed band uses these numbers
— the only 10400–10407 hits in older evidence are calorie counts, not
seeds). Fresh start on every seed: day 1, inside the hall at Haven,
2,200 food-energy, room for 2 garden beds, no beds yet.

| Leg | Result on all 8 seeds |
|---|---|
| A0 — fresh setup starts inside | insideHaven true, Haven tile (4,4) — 8/8 |
| A1 — cultivate while inside | refused, result false, exact reason, ZERO state change (day, energy, beds, position, clock all identical before/after) — 8/8 |
| A2 — break ground while inside (supporting) | refused with the same hall reason, zero state change — 8/8 |
| B1 — Step outside | succeeds, player now outside, still on the Haven tile (lands just south of the hall) — 8/8 |
| B2 — garden work after exit | hall gate passes AND breaking ground actually works: beds 0→1, energy 2,200→2,080 (the documented 120 cost) — 8/8 |
| B3 — cultivate gate after exit (supporting) | no longer the hall reason; the next honest reason is "no growing bed can take more magic today" (no crop has been sown yet — a later gate, not the hall gate) — 8/8 |

No defect branch opened: cultivate never succeeded inside, and
stepping outside always unblocked garden work. So no prereg amendment
and no gardenCultivation.js change were made, per the prereg.

## What the player actually sees (sense read, quoted verbatim)
- Trying to cultivate inside: **"Step outside the hall to work the
  garden. (Cultivate the beds)"** — the reason plus the name of the
  action tried.
- Trying to break ground inside: **"Step outside the hall to work the
  garden."**
- Stepping outside: **"You push through the doors into open air.
  Haven grounds — tents, a fire pit, worn paths. The world is that
  way."**
- Breaking ground outside: **"You break ground behind the hall — bed 1
  of 2, turned and ready. Sow seed to start a crop."**

Judgement: the gate is legible. The refusal names the exact thing to
do ("step outside"), and the phone screen's door button is literally
labelled "Step outside" — the words match, so a player who reads the
refusal can find the way out. The exit line then confirms arrival
outside in plain language, and the next garden step tells the player
what remains (sow seed). After exiting, the garden is not silently
still blocked: real work fires, and the only remaining refusal is a
different, honest one (no growing bed yet). No robotic, repeated, or
misleading line was found in this sequence.

## Village assessment (plain words)
This is a fixture/sequence arm, not a lived village: no campaign was
run, no villagers lived or died here, so there is no village story to
tell and none is invented. The fresh-start snapshot is: day 1, the
player wakes inside the Haven hall with a full belly (2,200 energy)
and an empty garden — room for 2 beds, none dug. The blank this run
filled was the open question itself: whether the hall gate blocks
garden work wrongly. It does not. The gate behaves like a closed door
with a sign on it, and the door opens.

## Reachability / wall numbers — explicitly not applicable
National, table, and win numbers do not apply to this arm and are not
reported as numbers: no village campaign exists to reach them. This
arm measures one gate sequence on day 1 of a fresh setup, not
long-run reachability. Inventing wall numbers here would be false
precision.

## Balanced panel (§15) — explicit no-panel statement
This arm has no before/after game leg (no code changed, no policy
compared), so no balance-panel compare is fabricated. The replication
check used instead is the 8-seed pilot band with per-seed exactness:
identical refusal reason, identical zero-change, identical firing
costs on every seed, as prior fixture arms did.

## Blanks filled or documented
- Filled: backlog item 1281's open question — answered with numbers
  (8/8, exact reasons, zero-change proofs, firing proof). No code
  blank was found to fill.
- Documented: the phone-tap limit above (button → function verified
  in code, not tapped in this harness). A future phone-pass could
  close that last inch, but nothing in this run suggests the button
  misbehaves — it calls the function proven here.
- Canon note: no canon doc is known to cover ability-action refusals
  or the garden gate specifically; docs/GARDENS.md ("all hands-on work
  requires Haven grounds, outside the hall") is the covering canon,
  and the gate matches it. Nothing was invented.

## Metric review
- The legs measured what was asked: the prereg's A1/B1/B2 split
  cleanly separated "refused inside" from "works outside", and the
  supporting legs (A2, B3) caught the two confusions that would have
  weakened the verdict (gate scope, next-gate masking). No metric
  revision is proposed: the refusal-reason-exact + zero-change +
  firing-cost triple is the right bar for a gate arm, and it passed
  identically on all 8 seeds, so a 12–16 seed confirm band would add
  no information. Per the prereg, a clean gate-verified pilot needs
  no confirm band.
- One refinement for future gate arms (not applied here): the ability
  path appends " (Cultivate the beds)" to the spoken line while the
  gate reason itself stays exact. Future preregs should state
  up-front whether the spoken line must equal the reason or merely
  contain it; this run judged containment plus exact gate reason,
  which is the honest reading of both.

## Reproduction
From this worktree: `node scripts/test-culthall-b.js --all`
(exit 0, prints `VERDICT: GO`). Single seed: `node
scripts/test-culthall-b.js 10400`.
