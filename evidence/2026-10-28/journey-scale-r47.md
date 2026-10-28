# journey-scale r47 — THE DIVERGENCE HAS A NAME (2026-10-28, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261028T0544Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@a2a2a20f3 at worktree creation (r46 base was bcae76cb2).
**Pre-register:** `evidence/2026-10-28/journey-scale-r47-prereg.md` (written before
any sim; no src/js change planned — measurement + instrument first, r43–r46
discipline). Zero src/js changed in this run. Zero game behavior changed.
**Driver:** `scripts/journey-scale-r47-20261028.js` (r46 driver, labels/EVIDIR
only — verified: every changed line contains only r46/r47, date, EVIDIR or
mode tokens) plus `scripts/journey-scale-r47-compare.js` (parity compare
repointed at the r46 reference, evidence/2026-10-27/journey-scale-r46).

## Infrastructure (read first)
- No lock at run start; lock created (2026-10-28T05:44:12Z), main tree clean,
  disk 19%, reap: 7/16 active, 5 LOUD dirty trees left untouched
  (panel-contract-rulings, sim-lingerer-vis-a, sim-w4tbkill-a,
  sim-fighterconstruct-a, sim-onceaday-scope-b).
- Registration took ~80s. Standing heartbeat loop verified alive AND fresh
  in the registry (05:46:50Z, loop pid 44759, 9-min interval) — checked
  again mid-run after the r46 lesson about loops that die silently; the
  one stale-looking read (05:53Z check) was a 6.5-minute-old heartbeat,
  inside the 15-minute threshold, not a dead loop.
- Rotation discrepancy, recorded not resolved (fourth sighting): r46's
  landing note claims it wrote 3→0, yet this run reads 3 — same as r45
  recorded about r44 and r46 about r45. The file, not the prior run's
  claim, is the authority; this run plays the file as read and writes
  3→0 again.
- Base drift since r46, and a base-move mid-start: master moved from
  5ef4d5bad to a2a2a20f3 (lane B crisis r59 landing) between this run's
  first status check and worktree registration; the worktree was created
  on a2a2a20f3, so the run's base is unambiguous. src/js changes in
  range (bcae76cb2..a2a2a20f3, 50 commits, only 4 game changes): crisis
  r59 aidFight checks lingerers first (comms.js); wallwounds lingerer TB
  restore capped at pre-fight HP; onceaday prechecks for
  challenge/end_it_before; refusalprecheck pre-payment prechecks. The
  rest is evidence/tooling/preregs plus one version bump. None touches
  table gating, trust math, or hierarchy.

## Verdicts (binding — none re-scored)
- **SCALE-PARITY-R47: DIVERGED — and this time the divergence has a name.**
  Both pilot seeds diverged from r46, and on BOTH seeds the first capture
  difference is the same line, from the same mechanism:
  - 85001: first diff at capture line 7861, night of day 73 (last dawn
    DAY 73). r46: "The teeth break. The door holds — with nobody's help
    but Haven's own." + "The door is quiet. Haven breathes." + the Irving
    relief beat. r47: "One down — but 4 still hold the treeline. The
    gorge goes on."
  - 85003: first diff at capture line 7515, day 77 (last dawn DAY 77).
    r46: the same teeth-break / door-quiet / Joshua relief beat. r47:
    the same gorge-goes-on line, again "4 still hold the treeline."
  - That r47 line is verbatim the crisis r59 aidFight line
    (comms.js, a2a2a20f3): when a killed/driven beast leaves living
    lingerers on the treeline, the door does NOT go quiet and the crisis
    does NOT resolve — the old code resolved on the first kill (the TRUE
    early resolutions r59 measured at 11 → 0). This is an intended game
    change showing up exactly where it should, not an RNG cascade: r46's
    divergence needed a day-10 meal-roll pin and a cascade story; r47's
    needs neither. The relief beat (Irving/Joshua stands up, triage /
    rations / hunt / rally) is delayed, not deleted — it fires later once
    the treeline actually clears.
  - Per the prereg, the remaining r43 seeds (85002, 85004) are SKIPPED:
    two diverged seeds with the same named first mechanism already
    answer the question. r47 IS the new scale reference on this base.
- **ARENA-CHAIN WATCH: ANSWERED — the chain bends further, it does not
  break where r46's did.**
  - 85001: 13 bearer arena deaths (player=True, cause "the arena") vs
    r46's 9. Shared spine d23, d65, d84 (Catalina) identical; then r47
    runs desmond d100, jovan d101, ava d106, gen d107, gen d108, quinn
    d109, tariq d109, grace d110, wanjiru d110, app d110 — and the
    mantle still transfers: Luis Amador dies in the arena day 110 and
    the mantle passes to Suda Worachai ("You wake up somebody else.
    Suda Worachai, 36 — a teacher. Their hands know different work
    now: Night Eyes."). The run ends day 117, not day 104, with 6 souls
    alive (r46: 2) — and the ending line is the same kind as r46's:
    "Haven's pantry is empty. Day 5 of hunger. Haven couldn't hold. On
    the fifth hungry day, people started walking." A hunger scattering,
    13 days later, with a bigger village. (Note on r46's note: r46's
    capture tail ALSO ends on that same scattering line at day 104, so
    the shared end-shape is scattering; what changed in r47 is duration
    and roster, and the mantle demonstrably surviving a day-110 arena
    death. This run does not re-litigate r46's playerDeath-throw claim
    — the tail evidence is recorded here for the next reader.)
  - 85003: 6 bearer arena deaths (d36, d59, d93, d109 Joshua, d164 Raj,
    d179 Thabo) vs r46's 3 (d36, d59, d128). The village survives all of
    them: day 181, over=false, 7/7 alive. Arena attrition is heavier on
    this base, but on neither seed does it end the village — succession
    absorbs it.
  - Watch item, not a mechanism claim: arena deaths are up on both seeds
    (9→13, 3→6) downstream of the longer gorge fights. Whether that is
    the r59 change itself (fights last longer, more exposure) or cascade
    is NOT separated here — a single-seed pair cannot split those, and
    this run does not claim it.
- **TABLE-APPROACH SENSE: ANSWERED — the wait is voiced, and priced.**
  - 85001: lesser seat, arc 4, wait=true, announced=true from the
    wantwatch tail (detail w1 17 / w2 9 / w3 5 / w4 3, contests 10,
    crises 4, rank regional, stage 3, foodDeeds true). Want lines
    IDENTICAL to r46, including "The table's set. The ring of pale
    light — it's just sitting there. Waiting on them." (fireside gossip)
    and "Species agency: unlocked. You are not at the table yet. But
    the table has your name now."
  - 85003: lesser seat, arc 4, wait=true, announced=true; the approach
    is voiced BEFORE the seat arrives, with the missing deed named:
    "THE TABLE — the ring of pale light flickers at the edge of the
    sky... and does not come. Not yet. The table is being set for those
    whose deeds are done, and yours are not done. The ledger still
    wants: wave-3 monsters faced." The seat then arrives (first lesser
    in wantwatch at day 172; end detail w1 18 / w2 9 / w3 3 / w4 0,
    contests 13, crises 3, rank global, stage 3, foodDeeds true) and the
    same "priced for what you built" + "table has your name" lines
    follow. That is a priced wait, not a silent stall.
  - No seat-taker choice is exercised in-window on either seed: neither
    seed sits, both wait at the lesser seat. That is an absence of
    reach in this window, not a failure of the choice — the choice
    lives at sitting, and sitting never arrives here. The full seat is
    still unreached on this band (w5 0 on both seeds; 85003 maxWave fell
    4→3, so the full-seat wave bars moved further away on that seed).
- **PEOPLE-SENSE: GO (two reads, one new).**
  - 85001 day-90 talk is byte-IDENTICAL to r46's: Daniyar the paramedic,
    gentle, trust 25, want curious (stage 1). "Did you sleep? I kept
    hearing things out past the treeline." → yes-answer engages →
    shifts-sleeping detail + Almaty origin → "Thanks for listening. I
    mean that." No fabricated shared history, no filler loop.
  - 85003 day-90 talk is NEW vs r46 (r46's was a creek-water ask_favor
    brush-off; r47's is a different villager and a different want):
    Joshua the arborist, earnest, trust 89, want seek_taken (stage 1).
    He opens with a real want — his taken kin, Renee, Theo gone, "You
    talk to it — the System. Have you ever asked?" The unsure answer is
    accepted ("Okay. You don't have to have an answer."), the promise
    ("I'll ask it. I promise.") lands ("You'd do that? Ask it? ...Thank
    you. Really. Even asking is more than the silence."), and his
    invitation — "Walk my trap line with me? Extra hands, extra eyes."
    — is ACCEPTED (betrayal:accept, ordinary, d90; instrument file
    confirms armed=ordinary, trust 89, inRoster true). The ending
    resolves quietly: "It's quiet at the trap line. Joshua doesn't say
    much. Sometimes that's the whole point." / "Sorry. I need a minute.
    This was... thank you." This is an invitation sometimes taken, in
    the scale leg, with a promise attached — the tackle-invite behavior
    visible where r46 recorded a real zero on this seed. (Joshua later
    dies in the arena, d109; the promise outlives him in the log, which
    is honest, not broken — the game does not pretend otherwise.)
  - Secondary read, 85003 day-120 Thabo (taxi driver, dry, trust 90,
    ask_favor stage 2): a gossip loop — "I'm listening" three times,
    Hassan acting off, Alfredo headed out — that wanders but stays in
    character and ends cleanly ("Alright — I should get back to it.").
    Weaker than Joshua/Daniyar, not a fail.

## The leg, in plain words
- **85001 — the village that would not die in the arena, then starved.**
  Same lesser seat, same arc 4 as r46 — but the story runs 13 days
  longer and ends with six people, not two. The arena takes thirteen
  bearers across the run, including Quinn, Tariq, Grace, Wanjiru and
  Luis, and each time the mantle finds another pair of hands — the last
  handoff, Luis to Suda the teacher, is written out in full. What ends
  the village is not the arena at all: the pantry empties, five hungry
  days pass, and people walk in different directions. The scattering,
  again.
- **85003 — the village that climbed to global and still waits.**
  Seven of seven alive at day 181 (was nine of nine), a pantry of
  46,089 kcal (was 52,519), eight pilgrimages (same), covenant peaks
  66/72/58 (was 60/54/54 — above r45's ≥48 burst bar on all three, with
  courtPoorDays 0 vs r46's 5), first court day 141 (was 140), national
  day 142, global day 143 (was national only, no global day). The price
  of the climb shows in the fight record: maxWave 4→3, contests 23→13,
  wave-4 deeds 0 — the village got bigger and richer while fighting
  less. Lesser seat waiting, arc 4, same as r46.
- **What did NOT change:** the leg's seat outcome. Both seeds still end
  at the lesser seat, arc 4. The full seat is still unreached on this
  band — and on 85003 the wave bars for it moved backwards.

## Reachable / fun / winnable (leg 3 — re-judged on the new base)
- **Reachable:** YES for the approach — both seeds reach the lesser seat
  in-window, voiced, with the missing deed named before it arrives. The
  full seat is NOT reached (standing gap, unchanged outcome on this band).
- **Fun:** YES with the r46 warning carried forward and sharpened — the
  day-90 talks are people talking (Daniyar again, Joshua new and better),
  85003's climb to global is the leg working, and the r59 gorge change
  reads correctly in the text (the door stays loud while the treeline
  holds). The warning is 85001: a scale village that survives thirteen
  arena deaths and then scatters from hunger is a leg-shape problem
  worth watching across seeds — the arena no longer ends it, hunger does.
- **Winnable:** YES for the approach, NOT YET for the full seat — the
  binding constraints are now: the hunger scattering that ends 85001
  (not the arena chain, which held this time) and the wave bars
  themselves (85003: w4 0, w5 0), NOT the seasoned bar (85003 cleared it
  again, higher, with zero court-poor days).

## Telemetry deviation check (step 14 — NOT rolled, seventh confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-28/journey-scale-r47/journey-scale-r47-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" — the
same vacuous shape mismatch as r42, r43, r44, r45, and r46 (the journey trust
JSONs do not carry those fields at all; tableTele, the sixth metric, stayed
quiet in all seven runs). Verdict: NOT a real deviation. NOT rolled. Seventh
confirmation: the telemetry step for journey runs needs an owner to either
seed a journey-shaped baseline deliberately or drop the step for journey
runs and say so plainly. Rolling it would launder a shape mismatch into a
number.

## Tests
- `node --check` clean on both new scripts (r47 driver + r47 compare).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **279 passed, 8 failed in 847s** — the same total (287) as r46, one
  fewer failure, one more pass. Classification, done rather than assumed
  (the full run's output was tail-cut, so each suspect was re-run alone
  with `--only` after the full run):
  - 7 of the 8 are the r46 landing set, failing identically:
    hide-discovery (counter butchering), the three measurement-*
    scripts (proof freshness / collector-contract coverage),
    mobile-combat-cadence, occupation-panels, phone-frame-proof
    (proof-hash freshness), establishment-r20 (racks-full voice gate).
    This run changed zero src/js, zero test files, and zero data files,
    and added no file to the check list — all pre-existing.
  - The 8th r46 failure is GONE: test-sw-audio-cache-20261012 passes
    alone (1 passed, 0 failed) — the stale-offline-assets failure r46
    diagnosed on the base no longer fails on this base, consistent with
    the intervening batch ship regenerating assets. Not claimed as this
    run's fix: this run touched no assets.
  - parity-20261014 still passes alone (1 passed, 0 failed) — the gear
    failure r46 reported fixed stays fixed.
  - Net: zero regressions from this run. No check-run byproducts: the
    suite left no dirty files in this worktree (unlike r46's ONTOLOGY.md
    regeneration, nothing to revert here).

## Metric review
- SCALE-PARITY-R47 did its job in the positive direction this time: the
  prereg's stripping rules kept the comparison honest, and the
  first-divergence line — identical on both seeds, verbatim from the
  r59 diff — is what separates an intended-change claim from a cascade
  claim. r46 taught "pin the first line"; r47 shows why: without the
  pin, two diverged censuses would read as another cascade.
- ARENA-CHAIN's verdict rule held: names/days, not vibes, decided it —
  13 vs 9 and 6 vs 3 are counts from deathLog, and the Luis→Suda mantle
  transfer is quoted from the capture, not inferred from popAlive.
- TABLE-APPROACH's verdict rule held: want lines quoted, not summarized
  from scalars — the "ledger still wants: wave-3 monsters faced" line is
  the evidence that the wait is priced.
- The telemetry step is now seven runs deep in the same shape mismatch.
  It is no longer informative to re-report it as a finding; it is a
  standing process debt, owned by whoever owns telemetry baselines.

## LANDING STATUS
- Commit (worktree, safe-commit.sh) + merge --ff-only to master in the
  main tree; main tree verified clean after. No version bump, no push —
  the batch ship loop owns bumps, pushes, and live verification. Merged
  locally, pending ship. Rotation 3→0 written, lock deleted, worktree
  released at closeout, heartbeat loop stopped.
