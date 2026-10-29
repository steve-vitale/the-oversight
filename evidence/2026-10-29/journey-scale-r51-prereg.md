# journey-scale r51 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261029T0145Z (scheduled 01:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 on completion.
**Base:** master@b1f7edbca at worktree creation.
**No src/js change planned at pre-register time:** measurement first
(r43–r50 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**TACKLE ALL context:** the seven villager-rationality items are pursued
elsewhere (fixall arms live); this run does not claim them.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only what the engine exposes to the policy, as before.

## Standing context (read before scoring)
- r50 (scale reference for this run): PARITY-EXCEPT-LABELS vs r49.
  - 85001: day 111, over=true, pop 0/0, pantry 0, rank regional,
    nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
    pilgrimages 5, firstCourt 98, leaguePool 965. Covenant trusts 24/19/14.
    Arena chain: 13 bearer deaths, day-111 die-out — relabeled by the
    r50 audit: 12 wild + 1 stranger, 0 genuine arena. The "arena chain"
    was a label artifact; the attrition is real.
  - 85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
    nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
    pilgrimages 8, firstCourt 141, leaguePool 32,822. Covenant trusts 64/70/56.
    Arena chain: 6 deaths, survived; only Thabo (day 179) keeps 'the arena'.
  - Both seeds lesser seat, arc 4, priced wait, full seat unreached (w5 0).

## Net src/js drift since r50's PLAYED base (cb30d8f98..b1f7edbca), verified by diff before any seed ran
Mechanisms that COULD move the scale band (so parity is NOT the null here):
- fixall-map slices 1a–4: Walk-home action + button (app.js/UI only, node
  driver never clicks it — no expected move); region-seeded leg boards
  (nomad.js: same region = same ground on re-entry, run-seed derived);
  villager return walk unclamped beyond the edge (villager-objectives.js:
  beyond-board returners step home instead of rim-snapping); city
  districts past the 12-tile ring + blockage/bridge parity past ring 5
  (game.js: new tile kinds, new draws on beyond tiles, blocks that can
  refuse steps that previously passed). Slice comments claim near tiles
  byte-identical, but beyond-tile draw streams and leg boards are new.
- geartier-a abilities pass (godpath.js + fieldFights.js): Mending Hands
  now heals the fighting ally too; Bird Strike blinds the beast 25%
  (fieldIncoming miss) for call round + 2; Live Broadcast gives the ally
  one extra strike per round for TWO rounds, not one strike once.
  All three change field-fight outcomes — the scale band's bearer deaths
  are wild/stranger fights, so fight outcomes could move.
- fix-all succession seam (conversation.js): invite_party outcomes exempt
  from the run-ledger dry replacement. Transcript/party mechanism only;
  low expected census move, but it is a conversation-path change in-window.
- gaps-ghost rear-guard line (fieldFights.js): log + record field only,
  no RNG/stat/outcome — no expected move (stated in its own comment).
- Version bumps + build.js stamp only.
Everything else in the window is evidence/tooling/preregs (including
journey-deepening r63, establishment r56, crisis r63, and sim diag arms).
This makes r51 a sharp test: any trajectory move must be pinned to a
map, gear, or invite mechanism with a first-divergence line — never to
the ghost narration or the walk-home button without a call path.

## Leg questions (binding)
1. **SCALE-BASE-MOVE-R51:** pilot seeds 85001 + 85003, r50 driver with
   labels/EVIDIR only → new driver `scripts/journey-scale-r51-20261029.js`
   (diff-verified: r50→r51 token substitutions only) + compare
   `scripts/journey-scale-r51-compare.js` repointed at the r50 reference
   (evidence/2026-10-28/journey-scale-r50, stripping driver labels,
   worktree paths, ISO dates). Policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop.
   Verdict rule: PARITY iff (a) census scalars + trust JSONs +
   transcripts are identical to r50's for both seeds after stripping,
   AND (b) every capture/beat/moment diff is empty. If (a) or (b) fails,
   the verdict is DIVERGED and the run names the FIRST divergence per
   seed (file, line, day) and the mechanism class it belongs to
   (map / gear / invite / other) before any other claim. DIVERGED is
   not a failure — it is the finding, with the mechanism pinned.
   If PARITY, the remaining r43 seeds (85002, 85004) are SKIPPED
   (pilot-first: two identical seeds on a moved base answer it).
   If DIVERGED, the remaining seeds are ALSO skipped — the pilot pair
   already bounds the move, and a full sweep would burn a run that
   should go to mechanism pinning, not breadth.
2. **MAP-MOVE (analysis of Q1 captures, zero src/js):** if DIVERGED, say
   whether pilgrimages, leg-board/region, beyond-return, or blockage
   lines move first, with quoted first-divergence lines. If PARITY, say
   so and name which map mechanism the parity most constrains (leg
   boards vs beyond returns vs beyond generation) from what the pilots
   actually exercised (pilgrimage counts, beyond-tile presence).
   Verdict rule: ANSWERED iff the note states, per seed, the map
   verdict with counts/lines, not a summary from scalars.
3. **GEAR-MOVE (analysis of Q1 captures, zero src/js):** count field
   fights where a geartier ability line fires (Mending Hands ally bit,
   Bird Strike miss, Live Broadcast extra strike) on both pilots, and
   whether bearer-death names/days move vs r50. Verdict rule: ANSWERED
   iff the note states, per seed, ability-line counts and the
   bearer-death comparison (same names/days vs moved), with lines quoted.
4. **TABLE-APPROACH SENSE (analysis of Q1 wantwatch/captures):** does
   either pilot trajectory voice a table offer, a seat-taker choice, or
   the full-seat price in-window — and does the lesser-seat waiting read
   as a priced wait or a silent stall? Verdict rule: ANSWERED iff the
   note states, per seed, what table-approach voicing fired (seat, arc,
   waiting, announced) with capture lines quoted, not summarized from
   scalars. Full-seat stage bar is ≥2 per the landed TABLE.md correction.

## People check (binding)
Read one full pilot transcript in full (not byte-identity assumed): the
85001 day-90 or day-120 talk, whichever the pilot produces. Sense-test per
the conversation quality bar: NPC wants something, options engage/deflect,
endings resolve/plant/owe; no fabricated shared history, no filler loops.

## Policies / seeds
- Pilot: 85001, 85003 (r51 driver). Pilot gate (r50 driver): seed 85001
  runs first; if it crashes or pilgrimages == 0, STOP.
- Policy: scripts/policies/scalecourt-nogate.js UNCHANGED. DAYCAP 180.
- EVIDIR: evidence/2026-10-29/journey-scale-r51 (never the live r50 dir;
  a smoke run must not overwrite live evidence).

## Metric review (placeholder — filled at closeout, never mid-run)
- (to be filled: did SCALE-BASE-MOVE-R51 / MAP-MOVE / GEAR-MOVE /
  TABLE-APPROACH hold as pre-registered, and is the telemetry-check step
  still shape-mismatched for journey runs?)
