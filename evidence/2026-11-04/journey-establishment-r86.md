# Journey leg ESTABLISHMENT — r86 run note (2026-11-04, Lane A)

## Prereg
`evidence/2026-11-04/journey-establishment-r86-prereg.md` (written before
any seed ran). Driver `scripts/journey-establishment-r86-20261104.js`
(clone of the r85 driver + daily wave/ledger trace, SYS wave/ledger lines,
end telemetry summary), analyzer
`scripts/analyze-journey-establishment-r86-20261104.js`. Seeds 1201–1204
(fresh band), competent policy, 42-day horizon, death-aware tail (10
all-dead days; never hit). Base: master d6d91a32a at branch time; the
reused `journey-establishment` branch was already-merged and behind
master, fast-forwarded to master before any work (no foreign commits
carried: branch HEAD == master after the fast-forward, verified).

## Leg question
When do waves 2 and 3 actually arrive in the establishment window, is
wave 3 earned (kills, per canon) and survivable, and does it land before
the village has geared up (the r85 armor-bootstrap gap)?

## Panel verdict (BINDING metrics)
- M1 WAVE-SCOPE: **STALE-FRAMING 4/4.** Every seed reached wave 3 by day
  42. Combined with r85 (4/4 on seeds 1101–1104), that is 8/8 across two
  fresh bands: the leg's "wave 1" framing is stale. Recommendation: re-scope
  the establishment leg description to waves 1–3 (days 14–40, wave 3
  arriving at the day-25 floor). No game change follows from this verdict
  alone — it is a description correction, for the next schedule edit.
- M2 WAVE3-ARRIVAL: **interesting on all 4 seeds.** Wave 3 arrived at the
  day-25 floor on 3/4 seeds (SYS release day 25 on 1202/1203/1204) and on
  day 29 on 1201 (ledger full day 29, not the floor). Every arrival was
  kill-earned per canon: wave-2 ledger hit 4/4 before release on every
  seed (1203 overshot to 9 points by the daily snapshot — the ledger keeps
  counting past the bar). Wave 2 arrived days 8–12 (SYS release; ledger
  full days 7–11).
- M3 SURVIVAL-42: **GO 4/4.** Every village alive at day 42, none over.
- M4 PANTRY-GUARDRAIL: **GO 4/4.** Zero starvation/hunger/thirst deaths.
- M5 PEOPLE: **PASS** (8 convos read in full, below).
- M6 ARMOR-GUARDRAIL (descriptive, non-binding): NPC armor attempts 2/1/3/0
  per seed (6 panel-wide), **zero pieces crafted** on any seed; player
  attempts 1 (1202, day 12 bark, null return, no piece held at end). Worn
  at end: 1202 Ada (bark), 1203 Noah + Roberto (bark) — starting pieces,
  not in-window crafts, since made = 0 everywhere.

## Village assessment, in plain words
Four villages started with 12 people each and all four were still standing
at day 42, pantries 6k–80k kcal (1204 leanest at 6,182 but still fed, no
starvation deaths). Faces churned as in r85: only 7–10 of the final roster
were alive at the end, with zero roster members dead — people left and
were replaced by applicants and joiners, and the villages absorbed it.
Wave 3 is not a late-leg event here: it lands at the day-25 floor on most
seeds, right in the middle of the establishment window, and the villages
took it in stride — alive counts at arrival were 9–12 and never dipped in
the 3 days after arrival on any seed. Contests fired 2–5 times per seed
and mostly ended (won); repel was cast on 1203 and 1204.

## The armor correction — read this before citing r85
This run first REPRODUCED r85's instrument flaw, then fixed it, and the
fix changes two r85-adjacent claims:
1. **Equipped armor was invisible to the r85/r86-v1 material trace.**
   The first r86 pass reported "no armor roster-wide" on wave-3 arrival
   day for all 4 seeds. That was wrong: the trace read armor from carried
   items only, not equipped slots. After adding equipped slots and
   re-running (trajectories identical on every headline field — endDay,
   aliveEnd, pantryEnd, deaths, wave — so the new instruments are pure
   observers), arrival-day wearers are: 1201 Patricia/Jae/Heinrich,
   1202 Saul/Ada, 1203 Isabella/Noah/Roberto, 1204 none. So wave 3 does
   NOT land on unarmored villages on 3/4 seeds — the starting bark wearers
   (the armor-seed grantees) are still wearing their pieces at arrival.
   1204 is the exception: no wearer at arrival, none at end, and it still
   survived wave 3 with 11 alive at arrival and 8 at end.
2. **"Zero attempts" was really "zero pieces made."** The r85 metric
   counted beat returns (pieces made). The beat's own telemetry
   (`armor_craft` rows, fired on success AND failure) plus the new
   attempt signals (stash deducted or cooldown set) show real attempts
   that failed their 35% blind roll: 1201 days 27/33, 1202 day 31, 1203
   days 36/38/39, 1204 none. Six attempts, zero successes at 35% is
   unlucky (about 1-in-13) but not impossible — and attempts are rare
   (1–3 per 42 days) because knowledge + materials + the 3-day cooldown
   rarely coincide. The r85 finding stands in its corrected form: no
   armor is CRAFTED in-window; the bootstrap gap is about pieces made,
   not attempts. Future runs should use the r86 attempt signals, not
   beat returns (this run's driver already does).
- 1201's coda: its 3 arrival-day wearers were gone by end (roster 12 → 9,
  zero roster-dead — they left), and a bark piece ended in the player's
  pack. Starting armor churns out with its wearers; it is not a durable
  village asset unless the wearer stays.

## People check (8 convos, read in full — PASS)
Every conversation had a real want: Max on his taken grandmother Nora
(81, "called her boring") and the humming pods, committing the player to
ask the System; Enzo on singing — Winnipeg songs, "tunes outlast
everything" — refusing the party invite in character; Ada on what got her
through week one ("you keep not-stopping until not-stopping feels like a
plan"), teaching Guava and offering a real spring on the map, accepting
the invite; Dmitri on just being around people and the fear that "we're
an experiment someone forgot to label"; Noah on a wound and the gone
Otis, teaching Ground Elder and Cassava, invite accepted with a condition
("I'm not carrying your stuff"); Roberto on the control-group theory and
his plan to learn one useful thing a week (this week: fishing), grudging
invite accept; Sal confessing cruel pre-Scattering words, teaching
American Hazelnut, deflecting a confrontation, declining the invite;
Nadin digging up a buried bundle — food, still good, +1387 kcal to the
pantry, a REAL consequence — while insisting on being left alone, then
trading real regrets. No fabricated shared history, no filler loops.
Minor observations, not defects: the "almost softens — then doesn't"
mood-guard beat recurred (r85 noted the same small pool); Roberto's
"That's the priority" tail reads as a stray clause. No content change made.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Per-seed files carry the same derived `guardrails` block as r85
(deaths / aliveEnd / pantryKcalEnd from the file's own fields).
- LOUD: `guardrails.deaths` 41 -> 141 (+244%).
- LOUD: `guardrails.pantryKcal` 77861 -> 176880 (+127%).
- Quiet: popAlive 38 -> 34, starvationDeaths 1 -> 0.
- Verdict: same as r85, and now repeated on a second fresh band
  (r85: deaths 122, pantry 172595). NOT a village-mortality regression —
  popAlive matches baseline, zero roster members dead at end on any
  seed, zero starvation deaths, and 'villager combat' rows alone (89
  panel-wide) far exceed total roster attrition, so most death records
  are fight records, not village deaths. Fight volume is up, consistent
  with wave 3 reached on all seeds. The pantry swing is favorable but
  unattributed. **Baseline NOT rolled forward** in this run; two
  consecutive panels at this level strengthen the case for a re-seed at
  the next baseline review, but that roll needs its own regime note
  (per the baselines NOTES.md) and is not done silently here.

## Metric review (for the NEXT run, not this one)
- The r86 attempt-signal + equipped-armor instruments supersede the r85
  beat-return proxy. Future armor runs must use them; "attempts" and
  "pieces made" are different numbers and must both be reported.
- The leg description ("wave 1") is now disproven twice (r85 + r86, 8/8).
  The next schedule edit should re-scope establishment to waves 1–3; until
  then, runs should stop treating wave-3 arrival as surprising.
- Telemetry 'death' rows must never be reported as village deaths (third
  panel proving it: 141 rows vs 0 roster-dead).

## Reachable / fun / winnable (establishment)
- Reachable: YES — villages survive to day 42, wave 3 arrives on schedule
  and is survived, contests fire and are won, conversations carry real
  wants, pantry holds (1204 lean but alive).
- Fun: YES with the r85 caveat intact — the armor chase is still a dead
  end in-window (attempts happen, pieces don't), but wave-3 arrival itself
  is dramatic without being a wipe: the middle of the leg now has a real
  escalation beat, earned by kills, and the villages meet it wearing
  their starting bark.
- Winnable: PARTIAL, same shape as r85 — survival, contests, and wave
  progression all work, but the gear ladder's first rung is still luck
  (starting wearers) in this window, not something a competent player
  earns by crafting.

## Files
- Driver: `scripts/journey-establishment-r86-20261104.js` (v2: equipped
  armor in the material trace + NPC attempt signals; re-run trajectories
  identical on all headline fields)
- Analyzer: `scripts/analyze-journey-establishment-r86-20261104.js`
- Prereg + per-seed JSON + convos: `evidence/2026-11-04/journey-establishment-r86-*`
- Rotation: `journey-rotation-a.txt` advanced 1 -> 2 (next: deepening).

## Status
Tooling + evidence only; NO src/js change. To be committed via safe-commit
in the worktree, merged --ff-only locally, pending ship.
