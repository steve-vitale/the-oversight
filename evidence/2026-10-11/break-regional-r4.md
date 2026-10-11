# Break-it regional r4 — 2026-10-11

**Verdict: BROKE + FIXED (2 catches: dissolve-machinery leak, exile-guard gaps).**
4 attack angles held and are documented below (refusal-before-unlock, climb-then-dump,
raid withdraw, priced favor, polityNews/worldFeed liveness, ×1.25 arrival line,
pendingCounter hygiene).

Worker ran hostile attacks on regional & hierarchy (`src/js/hierarchy.js`), canon-first
(docs/CANON.md, docs/SCALE.md, evidence/2026-10-11/break-regional-r3.md — r3's four
catches were not re-covered). Proof: `scripts/test-break-regional-r4-20261011.js`
60/60 × 3 seeds (11, 222, 3333).

## Catches (both fixed)

**1. EXPLOIT — the realm dissolved but the league's national machinery kept running**
(hierarchy.js `_checkNational` dissolve branch).
The r4-2026-10-10 fix ("burning the realm after the court sat keeps nothing") cleared
the RANK on dissolve but left the unlock flags: a covenant league that dropped below 4
fires kept `poolLive`/`warOath` on the surviving link — Haven kept pouring 2,000
kcal/week into the pool, defense calls kept firing ("two villagers for three days"),
all with `nationalLive` false. Sibling: a dissolved trade charter kept `chartered` —
tariff kept minting 1,000 kcal/week/route. National unlocks outliving national, the
same bug class as the rank-keeping exploit.
Fix: the dissolve branch now clears `poolLive`/`chartered`/`warOath` and any pending
defense/trade calls on surviving peer links, said aloud ("the league's machinery dies
with it... the charter's ink is dry"). The bilateral bonds survive (trust, history);
the pool's remaining balance stays drawable (real food, already poured — finite, not
a stream). Proof §A/§B: pre-fix, pool kept growing (8,000 → more) and tariffs kept
minting after dissolve; post-fix, flags cleared, no pour, no tariff, no calls over
40 weekly ticks, machinery death said aloud.

**2. EXPLOIT — the exile guard was missing half the council verbs**
(hierarchy.js `_blockIfNotHaven` wrap list).
The DRIFTER fix's stated intent: "the UI hides these buttons for non-members, and the
engine holds the line too." It didn't for: `proposeLink` (pledges Haven's tribute from
exile), `answerCounter`/`sweeten` (1,500 kcal of Haven's food), `answerNationalChoice`
(feast 5,000 / oath 3,000), `answerGlobalChoice` (feast 5,000), `bidForPrimacy`,
`renegotiateLink`, `refuseTheScale` (permanent, griefable from the road). All seven
verified callable by an exiled scholar pre-fix (E1–E7 red).
Fix: all seven added to the wrap list. The UI already gates these on `canPledge`;
the engine now matches. Internal callers checked — only player-initiated flows
(`answerNationalChoice` → `refuseTheScale`, the Binding walk path). Proof §E: all
seven blocked post-fix, pantry/scale untouched, the pending counter left on the table.

## Held (attacked, resisted)

- **Refuse-then-draw (§C):** `refuseTheScale` from a beat can never leak pool/tariff —
  `poolLive`/`chartered`/`warOath` are only ever set by ANSWERING a beat, and refusal
  always precedes every answer. The "no pool shares, no tariffs" copy is true because
  the unlocks never open. Verified: post-refusal ticks move nothing.
- **Climb-then-dump (§D):** the dissolve fires on the FIRST break below the bar
  (3→2 subs), aloud, `nationalLive` clears, `scaleRank` falls to regional. Re-courting
  restages a new played beat at trust 30 — the climb restarts, no shortcut. By design.
- **Raid withdraw (§G):** muster is ids-only; nothing leaves, nothing dies, no phantom
  away state. Strike (§F): casualty copy's dead count == `registerDeath` raid-cause
  calls (0/4 fighters this seed), `woundedUntil` set, full muster away 3 days.
- **Priced favor (§H):** the 1,500 kcal repayment is debited from the payer's own
  stores on return (r2 fix holding, not re-broken) — payer 20,000 → 18,500, Haven
  +1,500 exactly, said aloud.
- **Dead-code (§I):** `polityNews` fired 10–11× and `worldFeed` 12× over 12 national/
  global weeks from `hierarchyDaily` (event counts, not existence assertions);
  `foreignPolities()` returns live data. All six national beats + the Regional Dawn
  accord render in app.js (pendingNational/pendingGlobal/pendingCounter/pendingRaid/
  pendingDefense/pendingTradeCall all have UI wiring) — no engine-only beats.
- **×1.25 arrival line (§J):** the arrival line names the true post-route amount
  (5,000 for a 4,000 tribute while national) — copy and engine agree.
- **pendingCounter (§K):** accept/sweeten/walk all clear the table; sweeten's
  turn-away branch clears too. No stuck state.

## Sibling sweep

- Dissolve fix swept across covenant AND trade (both national machineries), plus
  pendingDefense/pendingTradeCall dangling on surviving links. `refuseTheScale`
  verified clean (unlocks can't pre-exist refusal). Conquest `release` returns
  before `nationalLive` sets — clean. Covenant crises left alone deliberately:
  bilateral strain, not national machinery.
- Exile fix swept every council verb in hierarchy.js against the UI's `canPledge`
  gating. `answerAccord` (Regional Dawn gift) left untouched — pre-existing regional
  flow, outside this run's national-verb target; flagged for a future pass.

## Regressions (on the fixed tree)

- test-break-regional-r4-20261011: 60/60 × 3 seeds (11, 222, 3333)
- test-break-regional-r3-20261011: 38/38 × 3 seeds
- test-hierarchy-break-20261010: 35/35
- test-break-regional-20261010: 20/20
- test-scale-break-r4-20261010: ALL PASS
- test-bal-scale-ladder-20261010: 54/54 (3 seeds)
- test-drifter-national-gaps-20261010: ALL PASS
- validate-ontology: 63/63
- test-national-shapes-20261010: 3 failures — PRE-EXISTING wave-5-gate failures
  (covenant/trade/conquest national), identical to r3's report; unrelated code paths.

## For Steve

1. The dissolve now says "the league's machinery dies with it" — the first time a
   player burns a founded league they'll see this line. Worth an eye next time a
   league dissolves in a real run (no [needs-eyes]: no feel/UI change, engine-only).
2. Trade tariff still mints from thin air while the charter lives (r3's open question,
   unchanged by this run): 1,000 kcal/route/week in, 400 upkeep out. The dissolve
   now kills the stream with the realm, but the mint itself is still the "trade
   creates value" fiction. Still your call.
3. The exile-guard extension means an exiled/away scholar gets refused aloud on all
   council verbs — matches what the UI already does, so no player-visible change
   unless someone was calling these from console.
