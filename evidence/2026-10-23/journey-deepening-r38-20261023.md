# Journey leg: DEEPENING (days 40–80) R38 — run note

**Run:** oversight-playtest-loop LANE A, 2026-10-23 18:45 CDT run (scheduled).
**Rotation:** read **2** (deepening); wrote 2→3 at end. Lock laneA-deepening-20261023T2343Z created/deleted; standing heartbeat held.
**Base:** master@77da85d57 (ship loop landed 10ccb1af mid-run — rebased before landing).
**Pre-reg:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/journey-deepening-r38-prereg.md` (written BEFORE any run).

## Question
**Wave 3 in the wild.** The deepening window (d40–80) is wave 3's home turf (unlock = day 25 + 4 wave-2 ledger kills, kills-only, Steve's design — measured, never moved). r36 surfaced wave-2 mechanics; r9 history showed wave-3 fights can silently drop 6→0 in sims. Do natural wave-3 unlocks happen under competent play? Do the 9 monsters' signature mechanics actually play in real fights? Are those fights winnable-but-costly?

## What ran
- 4-seed competent pilot, seeds 38001–38004, DAYCAP=80, death-aware. PINNED policy scripts/policies/competent.js. Natural unlocks only.
- Driver: scripts/journey-deepening-r38-20261023.js (new; modeled on r36). Harness-only wraps, zero src/js gameplay changes. Panel telemetry keys: w3fights / engaged.w3 / fightsTotal / fightsByWave.3.
- **Infra:** the container EPERM write flap was active all run (same class as the 2026-10-23 .git lock flap). First pilot died in 9s on an unguarded writeFileSync. Hardened the driver with scripts/lib/wfs.js (retrying writes, fallback dir, loud stdout dump) and recovered 17/17 evidence files via scripts/lib/extract-dumps.py (new stdin→file recovery with retry). Both committed as tooling.

## Verdicts (binding metrics)
- **P1 (faucet) GO-ish:** 3/4 seeds unlocked wave 3 naturally (d52, d56, d58 — all at exactly w2pts=4, the gate working as designed). 38003 never unlocked (only 1 wave-2 fight all run → ledger never reached 4; gate working as designed).
- **M2 (surfacing) GO:** 2 wave-3 fights on 38002, both sense-read end-to-end —
  - **Spool (d66, WIN, 9 rounds):** the signature mechanic played EXACTLY as canon: REC 1/3 WAIT, 2/3 WAIT, 3/3 STRIKE(~29) → "LOADED: 1. WAIT 2. WAIT 3. STRIKE (~29). Watch the reel, not the tape." → REPLAY 1/3 WAIT ("Your own patience, played back at you"), 2/3 WAIT, 3/3 STRIKE ("the tape plays your own swing back at you. (22)"), then the tape looped. Telegraph-honest, legible, winnable. Lounes (villager ally, exterminator) fought alongside with a rage ability; Ruby spectated ("You're bleeding!"); mid-fight Agility→Footwork practice gain fired. Sensical throughout.
  - **Redactor (d64, LOSS, 9 rounds):** telegraph honesty is law and it held — "Its white edge-handles grab toward your Hatchet — POINTING... (Redaction lands next round.)" → next round "The handles close around your Hatchet — REDACTED. For two rounds it is just a shape in your hands." Then the last-turn redact ("the wound on redactor un-writes itself. It never happened. (+16 HP)") and the footing redact ("the ground under you is redacted. You are somewhere else now."). The player (FEASTED ×2.03, Hatchet) went down in round 9. Costly, legible, fair — the mechanic was fully telegraphed and the loss reads earned. Named villager Omar Farouk died in this fight window (d64).
- **M3 (winnable) GO:** 4/4 villages alive at day 80/81 (death-aware; no tail needed).
- **M4 (people) MISS on the strict bar:** 12/12 transcripts sense-read; 11 sensical, **1 senseless** — June (38002, bartender): 8× "Tell me more" → 8 fortune-cookie aphorisms about fame, want stuck at curious stage 0, resolution=unestablished. This is the **r36 documented-not-fixed blank recurring** (was Wei, now June): the `dlg:more` loop with no want behind it. Dialogue engine is the social loop's lane — documented, not fixed here.
- **Interesting-finding bar:** met — 2 wave-3 fights with visibly shaping signature mechanics; plus the faucet nuance below.

## Faucet nuance (finding, not a gate change)
Unlock ≠ fights. 38001 unlocked d56 → 0 fights of any kind after d56 (village turtled; 6 total fights all run). 38004 unlocked d52 → 4 post-unlock fights, 0 wave-3 (P(0/4) at 60% newest-wave ratio = 2.6% — unlucky, not broken). 38002 unlocked d58 → 5 post-unlock fights, 2 wave-3 (matches the 60/25/15 design ratio). Spawn weighting verified in code: spawnWaveTarget is the single source of truth (60% newest), used by both castMonster and checkEncounter. **No pacing lever touched** (flesh-out territory) — observed only.

## Village assessment (plain words)
Four villages, all alive at day 80/81, all shaped by fighting:
- **38001 (9 alive):** the quiet ones. Bessie the radio DJ, Aaliyah the vintner, Arlo the dentist (trust ~90, the core). Lost 7 to monsters/wounds/starvation early, then went still — zero fights after day 56. Plants known 36–43: the knowledge economy reached everyone. Greta (trust 22) and Desmond (18) are the fraying edge — low trust, low plants (36): the trust-trap shape Steve has open.
- **38002 (9 alive):** the fighters. Lounes the exterminator (trust 98) killed the Spool shoulder-to-shoulder with the player; James the carpenter, Ruby the lifeguard. Reached wave 4 (standing ≥100) — the only village to touch standing-gated content (fought The Strike d78). Lost Omar Farouk to the Redactor d64 — a named death with a televised cause. 28 deaths, almost all combat: this village dies FIGHTING.
- **38003 (8 alive):** the learners. Never unlocked wave 3 (only 1 wave-2 fight all run — the kills-only gate doing its job). Ethan the welder taught the player the Union Rep's tell and the Senegal Date Palm; Vincent the locksmith: "I used to worry about being on time. Now I worry about being alive. Same worry, bigger font." Camilla the barber is fighting a sickness and asked the player for help (promised).
- **38004 (9 alive):** the wounded. Three dead of "a wound that wouldn't close" — wounds are lethal here. Betty the feverish vintner asked for help (promised); Mazen the electrician asked about his taken kin — "Even asking is more than the silence" (the Taking, KIN.md, alive in dialogue); Iis the fisherman speaks only Indonesian — the conversation ends where language couldn't reach (honest systemic beat). Ruby/Elena/Grace at trust 22/30/32 with plants 12–15: late/marginal villagers, the trust-trap shape again.

Knowledge economy: plantsKnown 12–43 across all villagers (teachPlant fired 15× on 38001 alone); the teach path fires richly through dialogue (Lounes→Murumuru, Ethan→Union Rep counter + Senegal Date Palm + 3 places). skills/abilities read 0 on the census instrument for villagers (instrument only covers scholar abilities; not a finding).

## Blanks
1. **FILLED — "the The Union Rep" (teach-line article bug).** agencyMonsterLessonLine (villager-agency.js) composed `"That's the ${noun} telling you..."` blindly; post-System-arrival monsterNoun keeps proper-cased names ("The Union Rep", "The Moderator", "The Landlord", "The Heckler") → "That's the The Union Rep telling you". Same class as backlog #542; fixed via the existing articlePhrase helper (one line + comment). Proof test scripts/test-teachline-article-20261023.js: RED 4-fail pre-fix (reproduces the transcript line exactly), GREEN 14/14 post-fix. Regression: teach test battery green (teachplant/teachchore/teachbeat/counter-threshold); test-est-lesson-beats-r6 shows 87 pass + 3 pre-existing FAILs (verified identical with the fix stashed — inverted self-checks about unrelated templates).
2. **DOCUMENTED (not fixed — social loop's lane):** June's `dlg:more` fortune-cookie loop (r36 blank recurring with a new villager). No want, no progression, no resolution.
3. **DOCUMENTED (not fixed — combat-text pacing):** Spool's "Too close. The spool's attention SNAPS to you — proximity overrules patience." and "Tape snaps and whips loose. The reel wobbles." repeat verbatim every round (7× in 9 rounds) — informative once, robotic at 7×. Left for the owning loop.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** yes — wave 3 unlocks naturally (3/4), its fights happen at the designed ratio when encounters happen, and both fought signatures played legibly.
- **Fun:** yes — the Spool fight is the leg's thesis (your own turns played back at you, with a villager ally); the Redactor loss felt earned, not cheap.
- **Winnable:** yes — 4/4 villages alive at day 80/81; deaths are combat deaths, not collapse.

## metric review
- M4's "0 senseless" bar: the 1 senseless transcript is the known r36 blank recurring (dialogue lane). Proposal for next run: keep the bar, but count recurrence-of-known-blank separately from new senselessness.
- P1 faucet: "≥1 unlock" was met 3/4, but unlocks that produce zero fights (38001) suggest the more useful next-run metric is post-unlock wave-3 *fight* conversion, not just unlock.

## Telemetry
- `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/deepening.json --current 'hidden_files/evidence/2026-10-23/journey-deepening-r38-competent-*.json' --metrics w3fights,engaged.w3,fightsTotal,fightsByWave.3` →
  - `LOUD: w3fights swung -75%: baseline 8 -> current 2 (n=4 files)`
  - `LOUD: engaged.w3 swung -89%: baseline 18 -> current 2 (n=4 files)`
  - `LOUD: fightsByWave.3 swung -75%: baseline 8 -> current 2 (n=4 files)`
- **Same-run investigation verdict: EXPLAINED, not a mechanism break. Baseline NOT rolled.**
  1. Gate verified: 3/4 seeds unlocked at exactly w2pts=4 (d52/56/58); 38003's non-unlock is the gate working (1 w2 fight all run).
  2. Spawn ratio verified in code: spawnWaveTarget is the single source of truth (60% newest wave), shared by castMonster and checkEncounter.
  3. 38002 (the seed with post-unlock fights): 2/5 wave-3 = 40%, consistent with the 60/25/15 design ratio.
  4. The shortfall is encounter behavior + small-n luck: 38001 had 0 post-unlock fights (village turtled; villagers still killed monsters d55–d70), 38004 went 0/4 on wave-3 (P≈2.6% at 60%).
  5. r36 (same policy, same horizon): 0 w3fights across 4 seeds — r38's 2 is *more* than the immediately previous run. The baseline (8) comes from an older, larger run; rolling it on 4 seeds would be noise.

## Evidence
- Per-seed JSONs, 12 transcripts, w3fight dumps: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/journey-deepening-r38-*`
- Driver + proof test + wfs.js + extract-dumps.py: committed under scripts/ in this run's commit.
