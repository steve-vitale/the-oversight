# Journey succession r54 — SUCCESSOR INHERITANCE BASELINE (lane B, 2026-10-27)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26101–26105
(fresh band), competent policy, mixed regime: 26101–26102 scripted day-5
kills, 26103–26105 mature (EARLY_KILL_DAY=40, staging aspiration),
45-day successor window. Instrument only, zero src/js changes. Base
master@8ac521d01 at run start. Merged locally, pending ship (no
bump/push/live check — ship loop owns those).

Pre-registration: evidence/2026-10-27/journey-succession-r54-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-r54-20261027.js
(r53 driver + inheritance additions) + analyzer + proof test, all new
files in this commit. NO FIX in this run, by decision (documented for
overrule): tackle-succession (oversight-tackle-all) owns the succession
inheritance build; this run delivers its pre-change BASELINE on master.
A competing Lane B succession change would collide with that workstream.

## HEADLINE

The taken-over villager is already their own person — not blank, not
reset. On all five seeds the successor keeps everything that was theirs:
their whole kit, every plant they knew, every skill they had, their one
ability. What they do NOT get is the dead bearer's gear — by design, not
by loss — and they do not keep the dead bearer's trust (the office entry
is discounted at takeover, then climbs). The "vanished" items that looked
like succession loss are sentimentals buried with their owner under
Steve's 2026-10-09 death-pack rule.

1. OWN-LIFE, EVERYWHERE. Successor items kept: 8/8, 7/7, 7/7, 9/9, 8/8
   (their pack + worn, deduplicated — see metric review on the NPC
   pack/worn double-count). Plants kept: 6/6, 3/3, 15/15, 6/6, 9/9.
   Skills kept: 5/5, 3/3, 4/4, 3/3, 4/4. Abilities: parity equal on all
   five (green_whisper kept, zero inherited abilities — both scripted
   dead bearers held no abilities at day 6). Classes: mixed 2 (scripted),
   own-life 3 (organic), blank/reset 0, inherited 0.
2. THE DEAD BEARER'S GEAR DOES NOT TRANSFER — BY DESIGN. True
   dead-bearer→successor transfers: 0 on both scripted seeds. The two
   "transferred" ids the v1 instrument reported (dispatchers_headset,
   seed_packet) were already the successor's own items, not transfers
   (presence counting, not identity — see metric review). The dead
   bearer's other items persist only as TYPES among living villagers
   (wedding_ring, carpenters_square, trail_compass, reading_glasses,
   hoodie, photo_album held by others too — the instance's fate is
   unproven at type granularity). The corpse is EMPTY on both scripted
   seeds (found=true, items=[]) — correct under the death-pack rule,
   because every one of the 10 dead-bearer items is def.class
   sentimental (verified in src/data/items.json). Sentimentals are
   buried with the owner, never on the corpse, never lootable.
3. THE TWO "VANISHED" ITEMS ARE EXPLAINED, NOT LOST. 26101's
   winter_coat_button and unnamed_photo are absent from every scanned
   location (successor, corpse, pantry, living villagers, prep stash,
   stashed) at handoff AND d+3 — and both are sentimental class, so
   the death-pack rule buries them by design. The v1 "succession-loss"
   reading is withdrawn; the stashed scan added in v2 confirms they
   are nowhere else either. No non-sentimental item vanished anywhere.
4. THE CODEX IS THE OFFICE'S, NOT THE PERSON'S. The successor's codex at
   takeover holds their own plants/skills PLUS the dead bearer's codex
   plants/skills (inheritedPlants 4 + 3, inheritedSkills 3 + 6 on the
   scripted seeds) — the codex never lowers, and mantleBecome teaches
   the successor's own skills/plants into it (villager-build.js). So
   "inherited" here means codex persistence, not a personal transfer:
   the village's knowledge survives every bearer, and each bearer adds
   theirs. Extra codex plants on organic seeds (e.g. 26103's palmyra,
   purslane, maypop, black_walnut) are other villagers' codex entries
   visible through the shared codex, not the successor's own learning.
5. TRUST: DISCOUNTED AT TAKEOVER, THEN CLIMBS. Successor office entry:
   34→20, 46→24, 90→42, 51→26, 52→29 at takeover (the r43 discounted
   formula), then 20→61, 24→53, 42→64, 26→43, 29→58 by day +45, with
   village means 60–74. No frozen successor: unlike r53's Leo (7 for
   41 days, never donated), 26102's Brendan climbed 24→53 with ZERO
   deedLedger deeds in 45 days — a deedless climb exists (convo/event
   moves), so deeds are not the only climb path. Carried for the trust
   work, not ruled here.

## Village assessment (plain words)

All five villages lived through the 45 days after the mantle passed —
nobody scattered, nobody starved out. Simone's village (26101) lost
Simone on day 6 and Siobhan took over, then Siobhan died too and Zoe
picked it up; ten people alive at the end, pantry comfortable, trust
high. Ming's village (26102) did the same through Brendan then Nicole;
ten alive, pantry thinner but fine. Skylar's village (26103) lost
Skylar on day 13 before any scripted kill could happen — Chen stepped
in and held it, nine alive. Jose's village (26104) lost Jose on day 9,
Dakota took over, then Jasper; nine alive. Walt's village (26105) had
the hardest run: Walt died day 9, then Ray, Manreet, and Wei in turn —
four bearers in 45 days — and still ended with nine alive, though the
pantry was down to 3,835 kcal, roughly one thin day of food for the
village. That village is the one to watch: alive, but hungry, and one
bad week from a real crisis. Nobody's story stopped because the bearer
died; the villages bend and keep going.

## People check (full transcripts read)

Three full transcripts sense-read; villagers act like people in this
leg's windows.

- 26102 d+3 Nicole (three days after Ming's death): the strongest in
  the band. Nicole opens with a real question ("What's the worst thing
  you've done since the sky changed?"), accepts the player's deflection
  without judgment, TAKES an invitation with character ("Alright. But
  I'm not carrying your stuff." — a wild data point for tackle-invite:
  invitations can be taken), grieves Ming by name ("I dreamed Ming was
  still here. Woke up angry at the dream." / "The fire feels smaller
  without Ming."), and teaches-and-learns cleanly ("You show them
  Purslane... 'I never knew that.'"). Ending resolves: "Good talk. I
  feel like I know you a little better now."
- 26101 d+4 Wanjiru (no shared language): honest barrier play — no
  fabricated shared history, the transcript says so outright ("No
  shared words at all — just eyes, hands, and patience"). Gestures,
  caught words (mwema, wema, kiongozi), the NPC teaching the player a
  word, a warm ending. Meaning without filler.
- 26102 d+45 Miriam (trust 95, late run): mostly human — a real opening
  confession ("Before the scattering, I ran when I should have
  stayed") and a soft ending ("Something in them almost softens —
  then doesn't. Not yet.") — but two seams: the teach request is
  dropped ("Teach me something from the wild." → "Sorry, lost my
  train of thought.") and a "Wheel of Teeth... took you" line addresses
  the player as if taken, which doesn't fit the successor's story.
  Documented, not fixed here (conversation quality belongs to
  gap-social / tackle-all, and this run is instrument-only).

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- INH-READABLE: GO — 5/5 readable (2 full scripted + 3 successor-side
  organic, named per the prereg).
- INH-BLANK (reported, not scored): mixed 2, own-life 3, blank/reset 0,
  inherited 0. No successor arrives blank.
- INH-ITEMS (reported): true transfers 0/2 scripted seeds; vanished
  items 2, both sentimental-by-design (see headline 3).
- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26101 d6 Simone→Siobhan, 26102 d6 Ming→Brendan).
- MATURE staging rate: 0/3 scripted, 3/3 organic pre-emption (d13, d9,
  d9). Scripted-or-organic honored on all seeds (GO per the prereg);
  the rate note: organic pre-emption is now 9 of the last 12 mature
  seeds across r50–r54 — the day-40 regime essentially never stages a
  mature kill anymore, and the aspiration framing from r53 stands.
- V1 (vouch snapshot): young seeds n/a-none-eligible (expected, trust
  <60 at day 6); organic seeds n/a-organic (standing rule). No
  FAIL-alive-silent anywhere.
- C1v3 (transition rule, binds): GO — 44 transitions, 0 missing
  (13 + 2 + 11 + 10 + 8).
- W1d-tightened POOLED HEADLINE (binds): GO — 7/11 = 0.64 ≥ 0.5
  (26101 4/4, 26102 subset-empty named, 26103 2/2, 26104 1/4, 26105
  0/1 — per-seed shares alongside, empty subsets named not scored).
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 bad solo (|delta| ≤ 2 everywhere).
- MG2v2 (meal-line only, binds): GO — 0 violations, 45 audit days
  per seed.
- M3v2b (social echo, carried): 4/5 seeds ≥ 2 (1, 7, 3, 3, 2) — bar
  holds, 26101's 1 is the named miss (same narrow-miss class as r52).
- M1/M4: GO on all five. Chain mantles: 6 chains, all cause-known
  (26101 Siobhan→Zoe, 26102 Brendan→Nicole, 26104 Dakota→Jasper,
  26105 Ray→Manreet→Wei→Rosa). Identity trips: 0 everywhere.

## Fun / reachable / winnable (leg verdict)

- REACHABLE: yes — every seed staged a mantle pass (scripted or
  organic) and a full 45-day successor life without any driver
  intervention beyond the competent policy.
- FUN: yes, with the known texture — successor lives are continuous
  with the village's story (grief by name, invitations taken, language
  barriers played honestly), not a reset screen. The thin-pantry
  village (26105) is the leg's best drama: four bearers, still alive.
- WINNABLE: the leg doesn't gate the win, but nothing in this band
  blocks progress toward it — successors climb, villages warm, the
  codex only grows. No NO-GO.

## Blanks filled or documented

- FILLED (instrument): successor inheritance is now measured — the
  r54 driver/analyzer/proof test are the baseline tackle-succession
  asked for (item 5's "is it blank?" question answered: no).
- DOCUMENTED, NOT FIXED: (a) Miriam d+45's dropped teach request +
  "took you" address (conversation seams, for gap-social/tackle-all);
  (b) the remaining item-5 feel question this run did NOT measure:
  relationships and personal history — whether the successor's
  friendships, rivalries, and deeds-as-NPC carry into bearer life the
  way items/knowledge/skills do. The machinery measured here is
  faithful; if the successor still feels blank to play, the gap is in
  relationships/history, and that is the question to put to
  tackle-succession next. (c) 26105's thin pantry (3,835 kcal at
  window end) — watched, not a crisis this run.

## Metric review (§14)

1. V1 INSTRUMENT BUGS, FIXED BY RE-RUN (not by re-scoring). The first
   panel (same seeds/regime, v1 driver) had two instrument bugs:
   (a) snapshotVillagers took Object.keys(npcSkills) — npcSkills[vid]
   is an ARRAY of skill ids (tracks.js), so v1 reported skills
   ["0","1",...] and keptSkills=0 everywhere. Fixed to array values;
   v2 keptSkills are 5/5, 3/3, 4/4, 3/3, 4/4. The v1 keptSkills=0
   number is VOID, not a finding. (b) itemDisposition did not scan
   rosterChars stashed belongings; v2 scans them (stashed=0 for all
   dead-bearer items — the vanished verdict survives the wider scan).
   The v1 panel's other numbers (plants, trust, transfers, classes)
   are unchanged in v2 (deterministic re-run, same seeds/regime), so
   only the skills + disposition columns were corrected. Proof test
   re-run green on the v2 driver before the binding panel.
2. "TRANSFERRED" MEANS PRESENT, NOT MOVED. Disposition ids are types,
   not serials: a dead-bearer item type already owned by the successor
   counts as present-in-successor without any transfer happening.
   Both v1 "transfers" are this class. True transfers are 0 — and
   that is the design (mantleBecome gives the successor their OWN
   kit; the dead bearer's gear is buried or corpse-looted, never
   auto-transferred). Future runs should report "already-owned" vs
   "newly-present" as separate columns.
3. NPC PACK/WORN DOUBLE-COUNT. A villager's person.items contains
   their equipped items too, so succPre pack+worn lists each item
   twice. Counts in this note are deduplicated; the raw snapshots
   keep both lists for audit. Scholar post-handoff lists are disjoint
   (equipped spliced out of the pool), so no double-count there.
4. ORGANIC-PATH SNAPSHOT LAG. For organic deaths the pre-death
   snapshot is the morning before detection day, up to a day of play
   before the death — 26104's successor shows 3 post-handoff items
   (canvas_pants, fire_hardened_spear, multitool) not in the
   pre-snapshot, consistent with same-day pickups, not with a
   transfer. Scripted seeds (same-day snapshot) show exact equality.
   Organic successor-side numbers carry this lag caveat.
5. "INHERITED" PLANTS/SKILLS ARE CODEX PERSISTENCE. inheritedPlants /
   inheritedSkills count dead-bearer codex entries still present at
   takeover (the codex never lowers) — not a transfer to the person.
   The person-level inheritance is zero (abilities, items); the
   office-level persistence is total (codex). Both statements are
   true at once, and the run note keeps them separate.
6. TELEMETRY DEVIATION (step 14): `node scripts/telemetry-check.js
   --baseline .../telemetry-baselines/succession.json --current
   'evidence/2026-10-27/journey-succession-r54-2610*.stdout.json'
   --metrics overCause.alive,tele.week2.deadBearerMentions` printed
   one LOUD line: "overCause.alive newly appeared: baseline 0 ->
   current 47 (n=5 files)". VERDICT: explained, not a bug — the
   baseline JSON carries the total under `census.alive` (49), not
   under `overCause.alive`, so the tool reads baseline 0 for that
   key. Current total 47 (10+10+9+9+9) vs baseline 49 is ordinary
   band variation (~9.4 vs ~9.8 alive/seed). Baseline NOT rolled
   forward: rolling it would corrupt the baseline's key scheme; the
   key-mismatch is noted here instead.
7. M3v2b MISS (26101 = 1 < 2): named, not re-scored; bar holds 4/5.
8. MATURE STAGING (0/3 scripted): the day-40 aspiration framing from
   r53 stands; no metric change proposed — organic pre-emption IS the
   mature regime now, and the run honors scripted-or-organic.

## Evidence

- Prereg: evidence/2026-10-27/journey-succession-r54-prereg.md
- Driver: scripts/journey-succession-r54-20261027.js (v2: skills
  values, stashed scan, sentimental flags, corpse debug)
- Analyzer: scripts/analyze-journey-succession-r54-20261027.js
  (output: evidence/2026-10-27/journey-succession-r54-analyzer.txt;
  v1 output kept as ...-analyzer-v1.txt)
- Proof test: scripts/test-journey-succession-r54-instruments-20261027.js
  (log: evidence/2026-10-27/journey-succession-r54-prooftest.log,
  ALL GREEN on v2 driver; 24999 scratch deleted)
- Per-seed: evidence/2026-10-27/journey-succession-r54-2610{1..5}.stdout.json
  + .stderr.log; 48 r54 transcripts (d+3/7/14/30/45 windows)
- Regression: scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2:
  11 passed, 0 failed in 57s (worktree checkout, no src/js changes in this run)
