# gaps2-knower — knower ledger BUILD (map groundwork next slice)

Arm: gaps2-knower, coordinator gaps #2, Steve's order 2026-10-29 15:47 CDT
"Address remaining gaps". Base: branch gaps2-knower (audit commit
6d7f57c1a on master: "knower-trace audit + 0-arrivals investigation").
Builds the ledger design the audit delivered (§1.6) — it was design-only
until this arm. NO threshold changes: deedGateReady, finale-omen, and
wave/scale thresholds untouched. Hard exclusions honored: no leg-village
links, no city people layer, no perceivable-arrival walker, no interiors,
no starting-location content.

Plain words: until now, a village was "known" by two yes/no flags on the
village itself, so one anonymous traveler rumor made every villager act as
if they knew that village, and covenant/trade deals could be struck with a
village nobody had ever heard of. Now knowledge lives with the person who
learned it: a rumor counts only when it is actually spoken aloud and read,
a visit counts for the person who went, and a village across the map only
acts on Haven when it has actually met Haven, heard the traveler come home,
or sworn a bond. Old games keep working: a village you visited still counts,
and a rumor you already read still counts.

## DECIDED CALL (documented for Steve's overrule, not re-asked)

Peer proposals for covenant/trade ARE gated on knower-traced knowledge like
proposeLink. This follows the perception law (villagers know who's around
only through their own senses — no magic roster/list feed) and
knowledge-gating on every surface ("if you don't know, it doesn't show").
The audit left this as its open question ("gate, or keep explicitly
ungated?"); the build gates it. If Steve overrules, the revert is one
guard in `_proposePeer` (hierarchy.js) plus its comment lines.

## What was built

Store (mirrors villager map memory): `state.village.villageLore[knowerId][villageId]
= { how, day, toldBy, secondhand }`. Knower ids are villager ids (the player
is `Game.villagerId`) plus polity knowers `'village:<id>'` — a foreign
village's own traced knowledge of Haven, not a person but a traced event.
`how`: 'visit' (face-to-face), 'seen-nearby' (smoke from 2 tiles — seen,
not met), 'rumor' (delivered/read only), 'told' (named-teller gossip,
secondhand), 'link' (a sworn bond, public to the whole fire). Strength:
visit/link (3) > seen-nearby (2) > rumor/told (1); first entry at a rank
wins, so a visit upgrades a rumor and a rumor never downgrades a visit.

API (hierarchy.js, next to knowsVillage): `playerKnowerId()`,
`villageLoreOf()`, `villageLoreEntry()`, `recordVillageLore()`,
`tellVillageLore()` (mapmemTell-shaped spread primitive; wired-exempt by
design — the conversation-gossip wiring that calls it is the next slice,
it is proven directly by the proof test), `villageKnowsVillage()`
(polity-knower read), and `knowsVillage(v, knowerId)` (extended signature;
no argument still means the player, so every existing player-facing caller
keeps working).

Writers (the only ways lore is created):
- Rumor: `maybeVillageRumor` (game.js) now only QUEUES (sets `rumored`
  as an "in flight" flag, pushes the rumor with `delivered: false`, never
  opens the gate). `deliverVillageRumors` (hierarchy.js, daily) is the
  grant: on speaking the rumor it writes the player's entry
  `{how:'rumor', toldBy:'traveler-anonymous', secondhand:true}` — the
  anonymous teller never counts as an introduction for courtship credit —
  plus the mirror entry (the traveler passed through Haven, so their
  village gains Haven lore on the return leg), and stamps `rumorDay` at
  delivery, not at roll.
- Visit: `catchUpSim` (game.js) records player lore on every approach
  (`how` from opts, default 'visit') and the mirror village→Haven entry
  on visits only. `checkVillageProximity` passes 'visit' at dist <= 1
  (at their fire) and 'seen-nearby' at dist 2 (smoke on the horizon),
  closing the audit's §1.5 radius over-credit: a drive-by no longer
  counts as a meeting.
- Bond: `_formLink` / `_formPeerLink` (hierarchy.js) record 'link'
  entries both ways (a bond is public knowledge).
- Told: `tellVillageLore` (tested; auto-wiring into conversation gossip
  is the next slice, deliberately NOT auto-wired here — instant spread to
  the whole fire would repeat the leak class this build closes).
- Region: `hearOfRegion` (world.js) records `knowerId`/`toldBy` from opts
  on learned grants; the keepsake-trail caller (nomad-scenes.js) now
  passes the trail's owner as knower. 'landing'/'origin' grants stay
  knower-less by design (system facts, not learned knowledge); the
  registry's `known` flag stays village-level (the index) — the audit's
  leak 4 was the missing provenance, and it is now recorded.

Leak closures (audit §1.3, all 4):
1. Rumor-for-everyone: gate no longer reads the bare flag at roll time;
   a queued rumor opens nothing for anyone until delivery, and delivery
   teaches only the player (plus the mirror village entry).
2. NPC sites routed through the knower store (8/8):
   - villageAgency.js:305 famine act → the acting village's own Haven lore.
   - villageAgency.js:1009 petition consequences → villages whose own
     lore holds Haven ("every village that knows you", now literal).
   - villageAgency.js:1301 queueVillageEventRumor → explicitly the
     player (the hearer at Haven's fire).
   - hierarchy.js:2068 _foreignEyes → villages whose own lore holds Haven.
   - hierarchy.js:2102 _foreignPolitySim → same polity-knower read (the
     candidate set is unchanged in practice: visited / rumor-delivered /
     bonded villages — only the trace changed, not the pacing).
   - hierarchy.js:2819 worldFeed → explicitly the player (the viewer).
   - convoTopics.js:1039 t2gen_neighbors → the SPEAKING villager's lore,
     or a sworn bond (a link is public; the whole fire knows its allies).
   - scaleDiscovery.js:152 _sdKnownVillages → explicitly the player.
   (comms.js smoke/crisis reads and the app.js Haven panel keep the
   player default — they are player-facing surfaces, unchanged.)
3. Peer proposals: `_proposePeer` gains the player knowledge gate before
   the opinion bar, with proposeLink's refusal line. The audit's seed-99
   Stonebridge covenant now refuses; the proof test reproduces the old
   formation on all 3 seeds in its RED run and the refusal after.
4. Region registry: learned grants carry knowerId/toldBy (see above).

Player legacy (no live game loses diplomacy): the player gate also counts
`generated` (a visit flag set only by the player's own approach/joined
ticks, so it IS player-traced) and `rumored` ONLY with a delivered village
rumor for that village in scholar.rumors (the old "heard" state,
reconstructed). Non-player knowers are strict lore only — no legacy, ever.
RaidVillage stays ungated by design (audit K5): force needs no
introduction; the proof test guards it.

## Proof

- NEW `scripts/test-knower-ledger.js` (seeds 7/42/99, shared sim harness):
  RED before the build (32 passed / 53 failed — including the Stonebridge
  covenant forming on all 3 seeds), GREEN after: **103 passed, 0 failed**.
  Bars L0–L9 cover the store, the peer gate + positive arm (known + earned
  village still forms the covenant), roll-vs-delivery, visit + mirror,
  _foreignEyes behavior (+2 visited, untouched unmet), told spread,
  speaker-gated neighbors topics, player legacy (visit flag counts, bare
  rumor flag does not, delivered rumor reconstructs), region knowerId,
  and the ungated-raid guard.
- `node scripts/test-bal-scale-ladder-20261010.js` (green list): 54 pass,
  0 fail, 3 seeds (the rumor-flag assertions still hold — the flag now
  means "in flight", not knowledge).
- `node scripts/check-wired.js` on all 7 touched files: none of the new
  functions is unwired (tellVillageLore carries the wired-exempt spread
  primitive note); the 36 flagged names are pre-existing (convoTopics
  topic generators called by name, game.js helpers) — none is mine.
- `node scripts/check.js --quick`, FIRST run (before the warcourt fix):
  281 passed, 9 failed in 2258s (2-CPU box under sibling load; the FAIL
  list was truncated by the runner's own tail pipe, so only the last
  failure was visible). SECOND run, full output captured, AFTER the
  warcourt fix: **283 passed, 7 failed in 1548s**. The 7, classified:
  1. godpath/test-measurement-proof-update.js — "Proof source inputs are
     not current": the retained balance-proof digest covers
     Game/controller/harness inputs, so ANY src change stales it. This
     is the repo's prescribed refresh (a real observer-neutral panel),
     not a code bug — it must be refreshed by the coordinator/ship
     loop, not forced past here.
  2. godpath/test-measurement-workflow.js — same stale-proof root cause
     ("retained neutrality proof covers the current inputs").
  3. godpath/test-measurement-cache-flags.js — "both actual CLI
     configurations complete valid neutral panels": measurement-tooling
     area, no knowledge/diplomacy code path; same stale-proof family
     by subject (not individually re-verified).
  4. godpath/test-mobile-combat-cadence.js — deterministic, 13 pass /
     2 fail on enemy-announcement / round-wrap ordering in the combat
     Continue flow. My diff touches no combat or announcement code —
     disjoint, pre-existing on this branch.
  5. godpath/test-occupation-panels.js — MODULE_NOT_FOUND for
     './lib/luck-instrument' inside a /tmp observer copy: an
     environment/instrumentation failure, disjoint from this change.
  6. godpath/test-phone-frame-proof.js — retained browser receipts
     stale vs current source; the mismatch list names files this arm
     never touched (app.js, build.js, betrayal.js, …), i.e. tree-wide
     staleness from sibling landings, not this change. Refresh needs
     real browser receipts (16-stage, both phone sizes), which this
     subagent cannot produce (no live browser; headless hangs in this
     VM) — coordinator/ship-loop job.
  7. scripts/test-establishment-r20-fixes-20261020.js — racks-full
     cooking-voice gate ("next day voices once more: expected 2, got
     1"), deterministic, zero intersection with this diff (no cooking,
     assignment, or racks code touched) — pre-existing.
  The first run's extra 2 failures were 120s load timeouts (capable-bot
  and a feast sim) that passed on re-run. Targeted re-runs after the
  build: village 3/3, scale 1/1, region 4/4, rumor 1/1 (check.js --only);
  proof 103/103; warcourt-health 11/11 after its fixture fix.
  VERDICT FOR THE COORDINATOR: the ledger itself is green and no
  knowledge/diplomacy-area quick test fails. Full check-quick is NOT
  green, for the 7 reasons above — none is a ledger regression, but the
  measurement-proof and phone-frame refreshes are owed before anyone
  claims the tree green. This arm does NOT force past them.
- Fixture updates forced by the intentional gate change (repo rule:
  design changed on purpose, test updated in the same commit):
  scripts/godpath/test-warcourt-health.js (rumored-only fixture →
  visited fixture; verified 11/11) and
  scripts/test-drifter-national-gaps-20261010.js (peer targets marked
  visited; §6's D marked known so the exile guard is genuinely what
  refuses — the test itself cannot currently run: it crashes in setup
  with the same pre-existing `Text is not defined` harness drift as
  test-courtship-climb-20261011.js, before any propose call, so the
  fixture fix is verified by reading, not by a run).
- docs/ONTOLOGY.md regenerated by scripts/validate-ontology.js during
  check-quick from the edited hierarchy.js header comments (the two
  rule lines) — that regeneration is committed with the change, not a
  stray edit.
- NOT green and NOT fixed here (pre-existing setup failures, stacks prove
  they die before any changed code runs): test-courtship-climb-20261011.js
  (`Text is not defined` in genCharacter during setup) and
  test-hier-break3-20261010.js (`Game.mshipState is not a function` in its
  fixture builder). Both are Oct 10/11 scripts outside the green list;
  neither touches the ledger. The audit script test-knower-trace.js is
  intentionally NOT updated: its K2/K4 checks assert the old leaks, so it
  now fails exactly where the build changed behavior — that inversion IS
  the proof the leaks closed, and the file stays as the audit record.

## Open / next (not built here)

- Auto-wiring `tellVillageLore` into conversation gossip (the spread
  primitive exists and is tested; wiring it is the next slice).
- Per-knower region gating on display (registry entries now carry the
  knower; the `known` flag display is still village-level).
- Arrival-courtship credit keying off `how:'visit'` (the ledger now
  distinguishes visit from seen-nearby, which the walker design needs).
- Steve's still-open calls from the audit: Q0(a) travel-forfeits-table
  (leg-village links wait on it), and the perceivable-arrival walker
  approval — both untouched by this build.
