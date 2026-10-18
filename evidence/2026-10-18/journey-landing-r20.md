# Journey LANDING r20 — run note (2026-10-18, run_id 2026-10-18T05:43:35Z)

## Pre-registration (§14)
- **Leg question:** does the landing leg stay green on fresh seeds after the
  exile-cold-shoulder (c49927f0), theft-grievance (34144873), and
  convo-menu-cap (9b642209) changes landed since r19?
- **Interesting:** V1' GO on ≥3/4 seeds; ≥1 natural fire of (mourning |
  seek_taken) on the repeat-sitting probe (seed 74); 0 near-dupes across ≥8
  transcripts; cold-shoulder / grievance lines in days 1–14 sense-read for
  the exile ruling's early-game behavior.
- **Seeds:** 70, 71, 72, 73 (fresh, pinned) + 74 (REPEAT_SIT=1 MOURN_PROBE=1).
- **Horizon:** 14 days, death-aware stop.
- **Policy:** competent, PINNED (continuity r14–r19).

## Binding metrics
- V1' autonomy — every living non-scholar villager logs production on ≥
  (observed villager-days − 2); <10% villager-days hunger >90.
- V2 work — villager production covers ≥40% of 14-day kcal draw on ≥3 seeds.
- V3 structure — ≥1 emergent social tie/seed.
- V4' people — ≥8 transcripts sense-read, 0 fabric-history flags,
  0 within-conversation near-dupes; grief exercised ≥1 sitting (probe seed 74).
- V5' regression — water fills>0 + boils>0 per seed; 0 death mislabels;
  ≥6 social names/seed pre-System; instruments
  test-seek-taken-second-sit-20261014 + test-mourning-name-r8 re-run on tip.
- V6 winnable — villages alive at day 14.

## Metric review
- V4' probe gate (≥1 natural mourning|seek_taken fire on the repeat-sitting
  probe seed): MISSED — seed 74 had ZERO deaths in 14 days, so the mourning
  beat had no opportunity to fire, and no villager drew the seek_taken want
  on this seed. This is a metric-design miss, not a game blank: mourning is
  proof-green on instruments re-run on current tip this run
  (test-mourning-name-r8 7/7; test-seek-taken-second-sit-20261014 4/4), and
  seek_taken fired NATURALLY in the main pilot (seed 73 day 10, Minh,
  resolution=promised). Proposed revision for the NEXT run: probe gate
  becomes "≥1 natural fire of (mourning | seek_taken | seek_comfort) OR the
  seed documented as deathless" — grief-adjacent content (seek_comfort)
  counts when no death occurred.
- All other binding metrics held. No metric re-scored mid-run.

## Results

### Verdicts (pre-registered metrics)
- V1' autonomy — GO 4/4. Only the policy's own scholar identities missed
  >2 zero-production days (the player character, 11/13 days productive-null
  per seed); every living non-scholar villager produced on ≥ (observed days
  − 2). Hunger >90: 0 villager-days across all seeds.
- V2 work — GO 4/4. Villager production 271k–318k kcal/14d vs ~336k draw
  (~80–95% covered; policy threshold 40%).
- V3 structure — GO 4/4. Trusts 40–90 (Courtney 54, Franz 55, Nathan 55,
  Otto 90, Thao 61, Addison 86, Minh 69, Fritz 78); moots convened on
  seeds 72/73; follow-volunteers fired (Otto day 7: "You shouldn't go out
  there alone. I'm coming."); favor chains kept (keptLines, favorKept=2,
  favorBroken=0).
- V4' people — GO on instruments; probe-gate MISS recorded above. 41
  sittings / 202 NPC questions; 0 fabric-history flags, 0 verbatim repeats,
  0 justSaid, 0 phantom Mara, 0 comma/punct stutter, 0 third-person favor
  heads, 0 feasted spam lines. 10 transcripts sense-read.
- V5' regression — GO 4/4. Water fills=4 + boils=16 per seed (days 1/6/9/
  12-13); 0 death mislabels; 8–11 social names learned pre-System per seed
  (≥6); instruments re-run on tip: seek-taken 4/4, mourning-name 7/7.
- V6 winnable — GO 4/4. All villages alive at day 14 (over=no). The player
  died twice on seed 70 (day 13, combat) and once on seed 71 (day 15,
  combat) — the mantle passed, villages continued as going concerns.
- Telemetry check vs landing baseline: quiet, no LOUD lines.

### Village assessment (plain words)
Five villages, fourteen days each. Nobody starved (0 starvation deaths);
everyone learned to boil water by day 6. Villagers forage, haul, and teach
plants without being told — Courtney tracked 34/30, Otto showed up as a
protector-volunteer at trust 52. People know 8–19 plants each by day 14.
Two player-characters died to wild-animal combat (wave-1 animal shock is
working as designed — it was the SCHOLAR who died, not villagers);
the villages didn't blink. The taken are on everyone's mind: Louie,
sitting at trust 70, asked for comfort because he "keeps thinking about
them" — "Talking helps. Then it hurts. Then it helps again. It's a
cycle." Aroha fought a fever and refused help with dignity ("Never mind
the sickness I'm fighting — we got it handled"). Benoit begged for
foraging help when stores ran thin and the policy kept its word. The
village feels alive, scared, and stubborn.

### People check (sense-read, 10 transcripts)
- Minh (seed 73 d10, seek_taken): "Have you heard anything? About the
  taken. The pods. Anything at all. I mean it." → commit → "You'd do
  that? Ask it? ...Thank you. Really. Even asking is more than the
  silence." resolution=promised. Strong.
- Louie (seed 74 d8, seek_comfort): grief about the taken, trust 70,
  20 exchanges, ending "Talking helps. Then it hurts. Then it helps
  again. It's a cycle." Strong.
- Benoit (seed 70 d12, ask_favor): concrete survival ask, promise kept
  the next day ("You kept your word. That meant everything."). Strong.
- Aroha (seed 71 d10, ask_favor-deflect): proud-sick deflection; verified
  state-true (fever ran its course per system stream). Coherent.
- Day-1/day-10 curious openers (counting days, singing, Barbara's story):
  charming, act-0-appropriate, no fabricated history.
- Betrayal-lure declines acknowledged ("Fair enough. Rain check." /
  "Another time, then."). Good.
- FALSE ALARM (investigated, no fix): seed 70 d4 + seed 73 d4 openers read
  "Hassan/Fritz settles near you" while the transcript header showed a
  descriptor. Reproduced: startConvo fires revealName('intro') on first
  meeting BEFORE the opener renders, so the name is legitimately known
  at opener time — the intro line ("Hassan," they say, touching their
  chest. "I'm Hassan.") goes into the narration stream first. Verified in
  census-70 nameLog. The header descriptor is a harness logging artifact
  (computed pre-startConvo), not a game bug.

### Blank filled or documented
- No game-code blank found this run. The suspected name-gate leak was a
  false alarm (documented above). The r20b/r21/r22 question: exile
  cold-shoulders, theft grievances, and the convo-menu cap produced ZERO
  lines in days 1–14 across 5 seeds — the new social systems don't touch
  the landing leg's early game (expected: they need justice escalation /
  theft, which don't occur here). Menus stayed at 7–9 choices (cap working).

### reachable / fun / winnable
- REACHABLE: yes — all leg content (day-1 nudge, favors, seek_taken,
  seek_comfort, beast-naming votes, System contact day 8) fired without
  prompting.
- FUN: yes — favor arcs resolve, promises are kept and narrated, grief
  beats land. Grit: the Aroha-style proud-sick deflection and Louie's
  cycle line are exactly the texture the leg needs.
- WINNABLE: yes for the leg — 5/5 villages alive and producing at day 14.

## Run note (ops)
- No game-code changes; no [needs-eyes] content. Harness script + this note
  committed only.
- Merged locally, pending ship.
