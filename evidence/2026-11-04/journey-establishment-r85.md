# Journey leg ESTABLISHMENT — r85 run note (2026-11-04, Lane A)

## Prereg
`evidence/2026-11-04/journey-establishment-r85-prereg.md` (written before
any seed ran). Driver `scripts/journey-establishment-r85-20261104.js`,
analyzer `scripts/analyze-journey-establishment-r85-20261104.js`.
Seeds 1101–1104 (fresh band), competent policy, 42-day horizon, death-aware
tail (10 all-dead days; never hit). Base: master 33900dfaa at branch time;
the reused `journey-establishment` branch was already-merged and behind
master, fast-forwarded to master before any work (no foreign commits
carried: branch HEAD == master after the fast-forward, verified).

## Leg question
Does armor (bark / hide) actually get made and worn in the establishment
window now that bark flows into storage faster, villagers craft/wear hide
armor, and the player's hide-armor attempt was fixed (gap-hidecraft)?

## Panel verdict (BINDING metrics)
- M1 ARMOR-ATTEMPTS: **NO-GO 0/4** (need >= 3). Player Game.craft armor
  calls: 0 on all seeds. NPC craft-beat calls: 42–43/seed, returning 0
  every day — zero pieces crafted in-window on any seed.
- M2 ARMOR-WORN-END: **NO-GO 1/4** (need >= 2). The single wearer,
  Ethan on 1102, STARTED wearing bark armor (probe at setup confirms
  starting gear, not a craft). No armor was crafted or newly worn
  in-window on any seed.
- M3 SURVIVAL-42: **GO 4/4**. Every village alive at day 42, none over.
- M4 PANTRY-GUARDRAIL: **GO 4/4**. Zero starvation/hunger/thirst deaths.
- M5 PEOPLE: **PASS** (8 convos read in full, below).
- M6 FIRST-CONTESTS (descriptive): 1–4 contests fired per seed, all but
  one ended (won); one repel cast on 1103. First contest days 15–21 —
  the day-21 guarantee still holds on the seeds that fired late.

## Village assessment, in plain words
Four villages started with 12 people each and all four were still standing
at day 42, pantries fat (21k–73k kcal at end). But the faces changed a
lot: only 5–11 of the original 12 were still on the roster at the end
(1102 steadiest at 11/12; 1103 churned hardest, dipping to 6 alive at
day 40 before newcomers brought it back to 9). Nobody on any final roster
was dead, and nobody starved — people left, died off-roster, or were
replaced by applicants and joiners, and the villages absorbed it. Every
village had reached wave 3 by day 43, which is further than this leg's
"wave 1" framing — the establishment window is no longer a wave-1-only
world. Contests played and were mostly won. The pantry is not the
problem; turnover and wave pace are the texture of this leg now.

## Why armor never fired — traced, not guessed
Three separate causes, one per channel:
1. **Player:** the pack never held the co-factors together at an upkeep.
   Pack vine max was 0 on 1101/1104; on 1102 the pack held 2 hides but
   never with vine on the same dawn (vine arrived on other days). Bark
   armor additionally needs the player to own nothing protective — the
   competent player nearly always owns a jacket/vest, so the bark branch
   stays shut by design. The gap-hidecraft fix is intact on master; its
   trigger condition simply never occurred in a full run. NOT a policy
   bug — a materials-co-occurrence gap.
2. **NPC beat:** knowledge is the bootstrap. `villagerArmorCraftDay`
   only crafts for a villager who already wears armor, was taught the
   recipe, or handled hide. On 1104 the stash held bark + vine together
   for 8 dawns (bark up to 14, vine 3) with no knowledgeable villager,
   so nothing was attempted. Hide reached the stash on only 2/4 seeds
   and only 1 unit (recipe needs 2), so the hide-handling bootstrap
   never armed either. Competent play teaches plants only, so the
   taught bootstrap never fired in these runs.
3. **Timing:** where stash bark + vine did coincide on 1101/1103, it was
   days 40–43 — too late, and still knowledge-blocked.
- Proof: `scripts/test-journey-establishment-r85-armor-bootstrap.js`
  (7/7): a no-knowledge village with bark 10 / vine 5 attempts nothing
  for 10 days and its stash is untouched; give one villager a taught
  bark L2 (or hide L2) and the same materials are attempted on day 1
  (stash deducted, cooldown set, whatever the roll says). The beat works;
  the bootstrap doesn't exist in-window.
- **Blank filled/documented:** the first-armor bootstrap gap. This run
  deliberately does NOT redesign the knowledge rule (wearing-is-knowing
  is a shipped design choice) or add armor-teaching to competent play
  (a policy change with panel-wide effects needs its own prereg). The
  decision — bark-handling knowledge, armor lessons in competent play,
  or a maker starting with armor — is for Steve / the next build, with
  this proof test as the acceptance check.

## People check (8 convos, read in full — PASS)
Every conversation had a real want: Raj hunting for a pantry-run partner
and committing to a concrete water-chestnut plan (place, sunup, pack and
knife); Sanne on what belief survives after everything, inviting the
player on her trap line and refusing the party invite in character
("I work alone. Nothing personal. ...It's a little personal."); Dylan
naming the party (player picked the System's "APEX SNACKS" over Dylan's
"The Firetenders" — "It has a name, which means it can be lost" landed);
Isaac on his taken aunt and the humming pods, committing the player to
ask the System; Aroha on first memory, honest that she may have invented
it; Tashi on keeping the peace; Sarah confessing she ran when she should
have stayed, with a real knowledge exchange (Yarrow taught, Wild Carrot
learned); Pedro rehearsing what he'd say to his family and admitting he
doesn't want to belong. No fabricated shared history, no filler loops.
Minor observation, not a defect: the 2-line mood-guard pool means the
"almost softens — then doesn't" beat can recur across villagers; the
pick is random per villager (convoPick), and 3 first-picks landing on
the same line across separate runs is chance + a small pool, not a
systematic repeat — no content change made.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Per-seed files carry a derived `guardrails` block (deaths / aliveEnd /
pantryKcalEnd from the same file's own fields — shape fix in the r40
precedent, no verdict change; analyzer verdicts re-verified identical
after the fix).
- LOUD: `guardrails.deaths` 41 -> 122 (+198%).
- LOUD: `guardrails.pantryKcal` 77861 -> 172595 (+122%).
- Quiet: popAlive 38 -> 39, starvationDeaths 1 -> 0.
- Verdict: the deaths swing is NOT a village-mortality regression —
  popAlive matches baseline, zero roster members dead at end on any
  seed, zero starvation deaths, and 'villager combat' rows alone (78
  panel-wide) far exceed total roster attrition (18 originals gone),
  so most death records are fight records, not village deaths. Fight
  volume is up, consistent with wave 3 reached on all seeds. Attribution
  to a specific change needs a same-seed before/after; the pantry swing
  is favorable but likewise unattributed. **Baseline NOT rolled
  forward.** Fight-driving in r85 matches r83/r84 (not a new
  double-drive artifact).

## Metric review (for the NEXT run, not this one)
- M1 as written counts attempts; the NPC beat's return (pieces made) is
  the right attempt proxy only with the cooldown/stash evidence the
  proof test uses. Future armor runs should trace avCraftCd + stash
  deltas, not just beat returns.
- Telemetry 'death' rows must never be reported as village deaths: the
  baseline note says so, and this panel proves it again (122 rows vs 0
  roster-dead). Future run notes should lead with roster census, not
  telemetry death counts.
- `unlockedWave()` = 3 on all seeds by day 43 deserves its own leg-scope
  question: if establishment now faces wave 3, the leg description
  ("wave 1") is stale.

## Reachable / fun / winnable (establishment)
- Reachable: YES — villages survive to day 42, contests fire and are
  won, conversations carry real wants, pantry holds.
- Fun: YES with a caveat — the churn (losing half a village's faces by
  day 42 on two seeds) is dramatic but legible; the armor chase is
  currently a dead end in-window, which will frustrate a player who
  sees bark and vine pile up with no maker.
- Winnable: PARTIAL — survival and contests work, but the armor
  bootstrap gap means the gear ladder's first rung is luck (starting
  gear) in this window, not something a competent player earns.

## Files
- Driver: `scripts/journey-establishment-r85-20261104.js`
- Analyzer: `scripts/analyze-journey-establishment-r85-20261104.js`
- Proof test: `scripts/test-journey-establishment-r85-armor-bootstrap.js` (7/7)
- Prereg + per-seed JSON + convos: `evidence/2026-11-04/journey-establishment-r85-*`
- Rotation: `journey-rotation-a.txt` advanced 1 -> 2 (next: deepening).

## Status
Tooling + evidence + proof test only; NO src/js change. To be committed
via safe-commit in the worktree, merged --ff-only locally, pending ship.
