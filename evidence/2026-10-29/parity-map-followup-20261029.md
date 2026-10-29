# Parity delivery prep — map-expansion follow-up audit (2026-10-29)

Executive-ready report. No game change is made by this file; it is an
audit against current master, plus a reconstruction of the parity audit
it follows up (see §1, stated plainly).

Audited tip: local master `7f74e1d15` (gaps2-followup worktree, 2026-10-29);
shipped origin/master `6dccc8b5a` (batch ship, version bump
`07c440b05-20261029-172450`). The source diff between shipped origin/master
and the local tip touches no map code: `src/js/game.js` gains only
raid-naming narration (sim-raidname-b), plus feast/haven-growth lines
unrelated to travel. Map-slice code is therefore identical on both.

## Headline, in plain words

Villagers and the player still play on the same ground and under the same
rules — the map expansion did not build a second world for villagers.
What it did not do is give villagers the same *journeys*: the player gets
a compass button that walks them home tile by tile around a fallen tree,
while a villager's walk home is a different kind of movement that never
meets a fallen tree at all. And the map's people layer still has the one
live parity break that matters: the game often knows a village "because
the village heard a rumor," not because any particular person heard it.
Fixing that — who actually knows what — is the work the map expansion
depends on, and it is still in flight, not done.

## 1. The parity audit, reconstructed — read this first

**Reconstruction notice, plainly:** no standalone "Oct 27 parity audit"
file exists. Searched `evidence/2026-10-27/` (no parity/audit file) and
the full branch history for parity-audit reports. What exists is:

- The actual parity audit report: `evidence/2026-10-10/parity-audit.md`,
  final commit `6f5721f8c` ("parity audit: final report, all 5 workers
  landed"), branch `parity-audit-b`.
- The Oct 27 material: Steve's Oct 27 rulings and the Oct 27
  villager-rationality inventory (invitations sometimes taken, joint
  foraging, armor-craft conversion, teaching, succession feel,
  field-wound carryover, map/urban design), carried in the standing
  record — not a separate audit file. The Oct 27 audit did NOT cover
  map expansion: the map slices below landed Oct 28, after it.

Everything in §1.1 is therefore a reconstruction from those two sources
plus the arms that landed since. Each claim cites its source; nothing
here is presented as a recovered original document.

### 1.1 Reconstructed headline

**Parity breaks are mostly choked inputs and missing decision points,
NOT separate villager engines.** The evidence for that sentence:

- Oct 10 audit, Worker A (villager-player parity): villagers already
  shared the player's combat engine — they just never got to use it.
  Measured player ability uses 2440–2470 vs villager 0 across 40 runs,
  because only one eligibility check ever read the villager's kit. The
  fix was to let the existing blow-by-blow fight code read the
  villager's kit (proof `scripts/test-parity-abilities.js` 15/15), not
  to build a villager combat system. Same for hunting: the villager
  hunt duty was a flat random roll while the player hunted a real
  animal; the fix routed villagers through the same real-animal,
  real-depletion hunt, not a second hunt system.
  Source: `evidence/2026-10-10/parity-audit.md`, Worker A.
- Oct 10 audit, harness correction (Worker A): the shared sweep
  harness drove time in a way that never fired the villager's own
  action driver, so earlier sweeps measured villagers standing still
  (~1 action per 30 days) and looked like a villager-engine gap. It
  was a measurement input gap. Source: same report, Worker A caveat.
- Oct 27 ruling (parity + encounter-reaction): villagers must react
  to things they meet on screen as the player does — "villagers are
  not special: same rules as the player" — and a taken-over villager
  must feel purpose-made, not blank or reset. That ruling is about
  giving villagers the same inputs and decision points the player
  gets, not about a separate villager ruleset. Source: Steve's
  2026-10-27 rulings, item (10), in the standing record.
- Oct 28 arms, same pattern, one example each:
  - calmbeast-b: the Calm button was greyed out beside a calmable foe
    because the bar never passed a target — a choked input, not a
    missing calm system (naming the foe worked all along). Fix: scan
    the live fight for a calmable foe. GO, landed.
    Source: `evidence/2026-10-28/sim-calmbeast-b.md`.
  - caughtlift-fix-b: a caught thief lost trust but the loss was
    never booked anywhere — a missing record, not a missing justice
    system. Fix: route the −20 through the trust record with its
    reason. GO, landed. Source:
    `evidence/2026-10-28/sim-caughtlift-fix-b.md`.
  - lingerfinish-a: the opposite lesson — a policy that marched
    villagers out to finish wounded beasts changed nothing, because
    the field-fight engine itself resolves a broken (1 HP) beast as
    fleeing, 16:1 over killing. The decision point does not exist
    yet at the break line. NO-GO, policy deleted, not landed as a
    game change. Source: `evidence/2026-10-28/sim-lingerfinish-a.md`.

Deliberate differences from the Oct 10 audit still stand and are NOT
parity breaks: System quests player-only, synergies player-only
(needs per-fighter practice logs), crafting/trapping player-only
(Steve: not a crafting game), feasts player-hosted, aid-cry chain
player-initiated, ratings summons player-only. Any follow-up that
"fixes" one of those without a Steve ruling is inventing a change,
not closing a gap.

## 2. Map-expansion follow-up audit (against current master)

### 2.1 Slices shipped — all present, all proofs re-run green

Slices 1a–4 shipped in the Oct 29 ship and are ancestors of both local
master and origin/master (verified by hash, not by name):

| Slice | Commit | What it is | Re-proof on current tip |
|---|---|---|---|
| 1a Walk home + compass | `0aff9f1f5` | `Game.walkHome`, "Walk home" compass button in `app.js` | `scripts/test-walk-home.js` PASS, 0 failures |
| 1b Region-seeded leg boards | `f177c6b27` | Same region, same ground across legs (`nomad.js`) | `scripts/test-leg-determinism.js` PASS, 0 failures |
| 2 Villager return walk unclamped | `48994088e`, narrowed `026244e2b` | Return walk only steps past the rim; home-board returns keep old wander | `scripts/test-villager-walk-home.js` PASS, 0 failures |
| 3 City districts | `bbf02d128` | Streets/plazas/buildings/caches past the 12-tile ring | `scripts/test-city-districts.js` PASS, 0 failures |
| 4 Blockage/bridge parity + sidestep detour | `ab8f16cee`, follow-up `b3189d858` | Beyond wild tiles gain blocks/bridges; `travelTo` scans intermediates; walkHome sidesteps single blocks | `scripts/test-beyond-blockage.js` PASS, 0 failures |
| 1c Unified map doc | `9335e89c0` | `docs/MAP.md` + CANON row | doc present, held items listed in it |
| Closeout | `d09f5aaf9` | Per-slice verdicts, 64-pair panel zero-delta after the slice-2 narrowing, held items, Steve-calls | panel verdict stands; no panel re-run in this audit (no map code changed since ship — see head of file) |

Method note: these are node-harness proofs (seeds 7/42/99 in the
originals). They prove the game logic; they do not prove the compass
button feels right on a phone. That phone feel is still [needs-eyes]
for Steve, exactly as the closeout left it. No browser claim is made.

### 2.2 What the expansion got right for parity

- **One ground, not two.** Beyond tiles are generated once, by shared
  world code (`beyondTile`), for whoever stands on them. A city
  district, a blocked tile, or a bridge-demanding creek is the same
  tile for the player and for any villager who gets there. Nothing in
  slices 1–4 generates player-only or villager-only terrain.
- **"Blockage/bridge parity" means home-vs-beyond, not
  player-vs-villager.** Slice 4's parity claim is that beyond-edge
  ground now has the same kinds of blocks and bridge demands home
  ground always had, and that a jump over an intermediate tile can no
  longer skip its block. Do not read it as "villagers meet blocks the
  way the player does" — §2.3 shows they do not, yet.
- **Home-board behavior is bit-identical.** The slice-2 narrowing
  exists because the first version changed every game's random stream
  (all 64 panel pairs diverged). The narrowed rule — meander skipped
  only for a beyond-board returner — restored 64/64 panel pairs
  bit-identical to base. A villager walking home on the home board
  today is indistinguishable from before the expansion.

### 2.3 New parity gaps the expansion leaves (named, not overstated)

1. **Villager return walks never meet a blockage; player walks home
   do — and the two walks are different layers.** The player's
   `walkHome` moves tile by tile through `travelTo`, orthogonal
   steps, with a sidestep around a single block and an honest stop
   when boxed in. A villager's return walk (`objAwayStep` →
   `npcSetNode`, `src/js/villager-objectives.js:1140`,
   `src/js/game.js:16618`) moves at world-node level, diagonally
   (one step toward home on both axes at once), and never passes
   through `travelTo` — so it never sees a `blockFrom`, never needs
   a bridge, and has no sidestep equivalent. This is NOT yet a proven
   bug: node movement and tile movement are different layers, and
   the return walk retraces ground the villager already stands on.
   But it is the question the follow verb must answer before it
   lands: when a villager follows someone out and walks home, do
   they traverse tiles (and hit blocks, bridges, and city ground
   like the player) or nodes (and bypass all of it)? Landing the
   follow verb without answering that would silently entrench the
   bypass. Status: open question for the field-party slice, not a
   landed break.
2. **Villager actions on city tiles are unmeasured.** Player proofs
   cover street/plaza/cache tiles: pavement forage says "Bare
   pavement — nothing grows here" and adds nothing; a cache empties
   finitely. Whether a villager's forage/work duty on the same tiles
   gives the same honest answers (or silently forages pavement, or
   loots a cache infinitely) has no measurement. Status: unmeasured,
   not broken — do not claim city parity for villagers until a
   villager-duty probe runs.
3. **Leg boards are player-only, by holding.** Region-seeded leg
   boards (slice 1b) are the player's road. Villagers do not travel
   legs independently, and leg villages becoming real links or
   opinions is HELD pending Steve's Q0(a) ruling (road travel never
   forfeits, only final departure forfeits — see §3). There is no
   player-vs-villager leg parity to audit until that ruling lands.
4. **The live parity break underneath the map: knowledge is still
   village-level, not per-person.** The Oct 29 knower-trace audit
   (commit `6d7f57c1a`, on master, audit only, no game change)
   verdict: DOES NOT TRACE CLEANLY. Findings that bear directly on
   parity and on every map/travel feature above:
   - One anonymous rumor opens the village gate for everybody:
     `maybeVillageRumor` sets the shared `rumored` flag with no
     teller, and `knowsVillage` reads that shared flag — so a
     village "knows" a place no particular villager ever heard of.
   - Peer proposals skip the gate entirely: `_proposePeer`
     (covenant/trade) contains no `knowsVillage` call, while
     `proposeLink`/`proposeAlliance` refuse unknown villages.
   - Several call sites read the player's knowledge as if it were a
     villager's (e.g. a starving neighbor acting on Haven's rumor
     flag as if it knew Haven).
   - The proposed fix is a per-knower ledger (who knows which
     village, how, when — rumor from whom, visit by whom), with
     existing saves keeping the shared flags as the player's
     knowledge only. That build is in flight in a sibling lane
     (gaps2-knower); it is NOT claimed done here.
   This is the Oct 27 headline playing out in map form: the missing
   piece is not a second engine, it is a missing input — whose eyes
   and ears a piece of knowledge came through.
5. **Arrivals still do not walk.** The same Oct 29 audit's
   establishment investigation found 0 arrivals is decision-gated,
   not supply-gated: applications wait in a full inbox (cap 3) while
   a healthy roster never triggers auto-recruit, and the one
   counterfactual accept per seed arrived cleanly on every seed.
   Even the working path is not perceivable: "Accepted — is walking"
   creates no board position or route, and `arrivalTick` pushes the
   id straight onto the roster. The proposed walker design (an
   accepted applicant walks in over days on real tiles, interceptable,
   killable on the road, arriving only when they step onto the haven
   tile) is a design proposal, not built, and it depends on the
   knower ledger first (§2.3 item 4) plus Steve's approval (§3).

### 2.4 Held from the closeout, still held (do not report as done)

Dens (no monster-side spawn hook; inventing one moves encounter
balance without a pre-registered bar); city people layer (residents,
markets, hosts — must trace to perception, and depends on the held
knower ledger); interiors as separate rooms (forbidden: buildings
are already "enterable" by standing on the tile and working it);
starting-location content / more playable regions (needs a Steve
call + region content work); nomad muster volunteer-offers rewrite
and the FOLLOW verb with shout-answers-from-place-occupancy
(field-party slice, not this one); far-village ledger as registry
entries (needs the knower audit first); leg-village links/opinions
(needs Q0(a)); arrival courtship advantage numbers / hard arrival
requirement (default soft-only stands).

## 3. Steve-calls, one line each (batched, none decided here)

- Q0(a): should road travel never forfeit, with only final departure forfeiting — leg-village links wait on this?
- Peer proposals: should covenant/trade proposals be gated on knower-traced knowledge like proposeLink, or stay explicitly ungated?
- Perceivable arrivals: approve the walker design — an accepted applicant walks in over days on real tiles — as the next build slice?
- Follow verb: when a villager walks home from beyond the edge, do they traverse tiles (blocks, bridges, city ground) like the player, or nodes (bypassing them)?
- City tuning: do the 0.12 district rate, the 12-tile wilderness ring, and the 5-tile blockage exemption ring stand, or should they move (only with a new pre-registration)?
- Walk-home cost: should walking home cost calories, or stay free as node travel is by standing rule?
- Phone feel: does the Walk-home compass button and the city-district feel pass Steve's phone pass (node tests cannot prove this)?

## 4. What would unblock the next parity step

1. Knower ledger build (sibling lane in flight): per-knower
   provenance for village knowledge; peer proposals gated or
   explicitly ungated by Steve's call above. Until this lands, every
   map/travel feature that touches "knowing a village" inherits the
   village-level leak.
2. A villager-duty probe on city tiles (cache dig, pavement forage)
   against the player proofs in §2.1 — small, pre-registered, and
   the only thing standing between "city ground is shared" and
   "city play is shared."
3. A follow-verb design answer to the tile-vs-node question in
   §2.3 item 1, before the follow verb is built — otherwise the
   bypass becomes the design by accident.
4. No panel re-run is owed for slices 1–4 themselves: their code is
   unchanged since the ship, their proofs re-pass on the current
   tip, and the closeout's zero-delta panel stands. A new panel is
   owed only when a new map/travel lever lands.

## 5. Metric review

No threshold was moved in this audit; nothing was re-scored. The
Oct 10 audit's verdicts are reported as written; the Oct 27 headline
is reconstructed from the sources named in §1, not quoted from a
document that could not be found. The map slices' own
pre-registrations (notably the slice-2 narrowing, which changed code
to meet the bar rather than moving the bar) are left as the closeout
recorded them. The one classification to carry forward: "blockage/
bridge parity" in slice 4 is home-vs-beyond parity, and citing it as
player-vs-villager parity would be a misreading — corrected in §2.2.

## Sources cited

- `evidence/2026-10-10/parity-audit.md` (commit `6f5721f8c`) — the
  parity audit report, Workers A–E.
- Steve's 2026-10-27 rulings, item (10) (parity + encounter-reaction
  + succession inheritance), and the 2026-10-27 villager-rationality
  inventory — standing record.
- `evidence/2026-10-28/sim-fixall-map-closeout.md` (commit
  `d09f5aaf9`) — slice verdicts, panel, held items, Steve-calls.
- `evidence/2026-10-28/sim-calmbeast-b.md`,
  `evidence/2026-10-28/sim-caughtlift-fix-b.md`,
  `evidence/2026-10-28/sim-lingerfinish-a.md` — §1.1 examples.
- `evidence/2026-10-29/build-map-knower-arrivals.md` (commit
  `6d7f57c1a`) — knower-trace audit + 0-arrivals investigation.
- `docs/MAP.md` (slice 1c, updated by slices 3/4) — current map canon.
- Slice commits `0aff9f1f5`, `f177c6b27`, `48994088e`,
  `026244e2b`, `bbf02d128`, `ab8f16cee`, `b3189d858` — verified
  ancestors of local master `7f74e1d15` and origin/master
  `6dccc8b5a`; slice proof scripts re-run on the current tip for
  this report (all PASS, 0 failures each).
