# Kids in Stasis — evidence 2026-10-11

KIN canon (Steve 2026-10-11): THE TAKING happened at the Scattering, day zero —
the System took half of all adults immediately (the boring half) plus THEIR
children into stasis pods. Village kids (kept adults' children) stayed. Taken
adults' fate UNKNOWN (System cheerfully vague); the kids are confirmed "napping."
Getting ALL the kids back is the prize of the GOOD galactic table path.

Sibling note: docs/KIN.md (taking-canon worker) had not landed when this was
built; canon honored from the brief. Reconcile if KIN.md disagrees.

## Canon conflict fixed
- game.js day-7 cinematic `systemArrivalBeats` → `watched` beat claimed the
  boring ones were removed "after the first week" ("Some of you just... sat?
  All week?... So we removed them."). REPLACED with the corrected canon,
  aligned to the voice batch's punch-up (manifest sys-day7-05): "FUN FACT!
  Half of humanity is GONE! We took them! Right at the START!..."
- Voice-batch MP3s already carry the corrected line; game.js text now matches.
  (If playSystemLine ever voices the cinematic, text and audio agree.)

## Villager-side: the missing kids haunt the village
- `src/data/lifeseeds.json`: 19 new kin fates across 19 relations (mother,
  father, siblings, spouse, niece, nephew, grandparents, aunt, uncle, best
  friend, grandchildren, + villagers' own kids processing it). The recurring
  horror: "were they boring?" — e.g. sister: "was taken at the Scattering.
  The boring half, they said — my sister, boring. I think about that every
  day." Niece/nephew fates name the pods ("is napping in a pod somewhere").
  Append-only, file style preserved.
- `src/js/lifeseed.js`: `takenKinOf(vid)` + `villagersMourningTaken()` —
  shared scanner (fate matches /tak(en|ing)|pod/i).
- `src/js/convo-wants.js`: new `seek_taken` want. Mourning NPCs open with it
  ("Have you heard anything? About the taken. The pods. Anything at all."),
  engage names their kin from the lifeseed, `dlg:commit` ("I'll ask the
  System about the pods.") records `village.takenPromises[vid]` — the table
  reunion remembers who asked. Cooldown 3 days; never for non-mourners.

## System-side (text, not ElevenLabs — voice batch closed)
- New day-7 `pods` beat (knowledge-gated by System arrival itself): the pods
  reveal ("Do YOU wake a napping toddler?! RUDE!"), the adult deflect
  ("They're FINE! Probably! The file says 'fine'! Next question!"), and the
  prize dangle ("You know what'd be GREAT television? ...Earn it.").

## Table prize: GET ALL THE KIDS BACK
- `src/js/table.js`: `kidsBackEligible()` — light branch ONLY, reads the moral
  ledger as behavior (protected > killed, foodShared >= foodHoarded, zero
  betrayals, promises kept >= broken). Never a checklist, never dark.
- `tableFinals()` appends "Bring all the kids home." when eligible;
  `tableResolveFinal()` builds the synthetic final. `kidsBackOutcome(T)`:
  pods open live, reunion beats cast REAL mourning villagers via
  `castTakingMourners` (aunts/uncles of pod kids first, `_beatCast`-style —
  no phantoms), promise-keepers get a callback line, the System changes the
  subject on the adults ("NEXT SEGMENT!"). Beloved-light gets the full
  centerpiece ("You got all the kids back. All of them."); other light paths
  get the lesser version ("a segment, not a saga").
- Sets `village.kidsReturned`; records the moment.

## Proof
- `scripts/test-kids-stasis.js`: 43/43 × 5 seeds (canon timing, gating,
  scanner, want lifecycle incl. promise, eligibility matrix, outcome content,
  finals injection + resolve).
- Regressions: ontology 76/76; table-beloved 24/24; table-core 31/31.
- Pre-existing failures NOT from this change (verified identical on base):
  test-lifeseed.js 100 fails (item reveals), old convo-coherence test FATALs
  (its eval list omits convo-scene.js), debug-scenarios count drift (54 vs 65).

## Follow-ups (not this build)
- docs/KIN.md reconciliation when taking-canon lands.
- Foreign-language voicing: untouched per Steve (voice-piper foreign-skip intact).
- Wiring System MP3s to game moments: audio-check worker's `playSystemLine`.
