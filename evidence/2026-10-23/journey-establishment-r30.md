# Journey leg: ESTABLISHMENT (days 14–40) r30 — TAIL + THREAD-FIX WILD CHECK (2026-10-23)

**Run provenance:** clean scheduled run (no lock at start; rotation-a read 1). Leg 1 = establishment; rotation advances 1→2 at landing. Worktree `journey-establishment`, base master@d581d6cf2 (includes journey-landing r42's 4 thread fixes + journey-crisis r46 sick-invite gates). Run id playtest-laneA-20261024T030203Z.

Canon read: CANON.md (manifest + standing rules), CONVERSATIONS.md (dialogue/thread mechanics), repo AGENTS.md (worktree + push discipline). No new canon invented.

## PRE-REGISTER (§14 — a miss is NO-GO, never re-scored mid-run)

- **Question:** (a) r29's metric-review proposal — the d42 Witness defeat (seed 103) got a truncated probe window in r29; with the +3d extended tail (45d horizon) does it surface within its freshness window? (b) r42's thread fixes in the wild at establishment scale (days 14–40): 0 request/village/personal thread fizzles, 0 fabricated history, 0 null renders, grief threads wind down.
- **Interesting:** M1b-tail goes from r29's truncated miss to a clean directional read; wild thread-fizzle rate on the post-r42 base; whether the dlg:more gate holds in the wild.
- **Seeds:** 103 (matched — the Witness seed), 61, 124 (matched r15–r28). **Horizon:** 45d (+3d tail). **Policy:** competent PINNED, COMPETENT_TALK unset (exactly r29's policy — day loop RNG-identical to r29's matched seeds).
- **Binding metrics:**
  - M1b-tail: seed 103's d42 Witness loss; SURFACED if ≥1 probe in [d42, d44] names 'The Witness'. GO/NO-GO (n=1 directional, pre-registered).
  - M-thread: ≥6 held transcripts (3 sittings × 3 villagers, thread-instrumented driver planting village/personal threads and chaining dlg:more); 0 fizzles, 0 fabricated-history, 0 null renders. GO iff all zero.
  - M2 (food, r27 standing bar): zero leg-window starvation/hunger/thirst deaths AND maxCrisisStreak < 3.
  - M4 (blank, evidence-first): scan contest windows for contest-taken villagers going hungry.
- **Observed, non-binding:** overall M1a/M1b surfacing, pantry traces, plentydepri/depositgate ledgers, village assessments.
- **Guardrails:** no softlock through d45; wave-2 gate ≥ d8; death-aware stop; pilot aired.

## METRIC VERDICT

- **M1b-tail — NO-DATA (not a miss).** Seed 103 produced 0 defeats on the new base (4 wins: The Box d17, Duel d26, The Cache d30, Hardened Duel d41). The pre-registered Witness-d42 shape did not materialize — the base changed under the seed (r42 thread fixes, r46 sick-invite gates, trustbuffer/feastconv levers all landed between r29's base and this one), so matched seeds are matched in number only, not trajectory. Per §14 the metric is recorded as NO-DATA, not re-scored. Defeat surfacing on the r42 base remains r29's standing 2/3 (the contest-news lane itself was untouched by r42).
- **M-thread — GO all 3 seeds.** 59 dlg:more follow-ups chained across 21 thread-planting sittings (103: 22, 61: 14, 124: 23), **0 fizzles**, 0 more-offered-on-dry-thread. Village threads serve content (never the dry admission on first follow-up); personal threads deepen then dry honestly; the dlg:more gate holds (no follow-up offered after the dry admission, menus correctly drop to `dlg:subject leave silence`).
- **M1a (win surfacing) — GO: 12/12 = 100%.** The contest-news lane holds on the new base.
- **M2 food economy — GO all 3 seeds.** Zero leg-window starvation/hunger/thirst deaths; pantries 34k / 13.5k / 25.7k; alive 10/10/7 at end.
- **M3/M4/M5 — GO.** Zero placeholder champion lines, zero null renders, pantry atoms ≤500.
- **M4 blank — NO RECURRENCE.** Zero hunger deaths leg-wide; contest-taken villagers all fed. The Wei recast-while-away shape remains unexercised (stays with the contest lane).

## HEADLINE: r42's thread fixes hold in the wild — 59 follow-ups, 0 fizzles, honest dry-outs

The instrument had to learn the game's menu architecture first: the thread follow-up is `dlg:more` (beat-matrix reply id), not the bare `more` menu id — both route to r42's fixed `convoThreadBeat`, but the wild menu serves `dlg:more`. Topic asks (ask:village/ask:personal) live two interactions deep when a live case owns the menu (answer question → `dlg:subject` → page to the asks) — reachable, not stranded.

What the wild shows:
- **Village threads serve.** "Honestly? there's tension about who's in charge." + follow-ups from the temperament pool. Soft spot: the 3-variant idle pool cycles audibly on 5+ follow-ups ("no big changes" ×2, "same as before, mostly" ×2 with different prefixes) — serves, doesn't fizzle, but thin.
- **Personal threads deepen then dry honestly.** Mateo: dispatcher backstory → Columbus → "That's the whole of it. Sorry." Erin: sky-talk → aide past-life → "That's... pretty much all of it, honestly." Ruth: sandwich joke → sleep currency → "I wish there was more to tell." The gate holds — no dlg:more after the dry admission.
- **Goal threads are the standout.** Mateo sitting 3 (ask:goal): "Belonging isn't about being needed. It's about being missed when you're gone." → 6 substantive non-repeating follow-ups ("I want to be someone's first call, not their last resort." / "Just... include me. In things."). The NPC wants something real; the thread earns it.
- **Continuity works.** Sitting openers quote prior sittings ("You said you're not good at the talking part either"); unfinished business resumes ("We never finished talking about themselves — we got cut off"); Kate refuses to re-confess ("I confessed that already. I'm not confessing it twice for dramatic effect."); Angelo's pantry favor persists across sittings ("I hate to ask twice, but it's still open.").
- **Grief is tracked.** 3 grieving villagers (124); grief openings offer dlg:comfort/dlg:empathize/dlg:askwhy; the grief thread stays alive in the subject menu (`alive:thread:grief`) with honest resume.

## BLANK FILLED

**The 'themselves' label (senseless dialogue).** The personal thread's ledger label leaked raw into NPC-spoken frames — recap: "Still on themselves." (4+ occurrences across seeds), resume: "We never finished talking about themselves." A prior fix had routed only the CLOSING frame through `convoThreadAbout` ('themselves'→'your story', test-pinned); the recap and resume opener still used the raw label.
**Fix (2 lines, src/js/conversation.js):** route both frames through `convoThreadAbout`, the designated grammatical-phrase function. **Proof:** `scripts/test-r30-recap-label-20261023.js` — 3/3 GREEN (recap, resume opener, village passthrough); verified RED on pre-fix code (B and A fail with the exact buggy lines). r42 proof test still ALL GREEN; mourning 7/7; the one conversation-coherence harness crash is pre-existing on HEAD (verified identical).

Known limitation (documented, not fixed): 'your story' is directionally imperfect for the NPC's own story, but it's the established, test-pinned workaround — a fuller voice fix is Steve's call.

**Documented, not fixed:** (1) village-thread idle pool cycling (thin but honest); (2) grief-thread wild coverage gap — the driver deflected grief openings, so r42 fix 4's wild winddown is covered by r42's proof test only; (3) standing [needs-eyes]: joint-foraging outing dead-end (unchanged, Steve's call).

## VILLAGE ASSESSMENT (plain words)

**Seed 103 — the steady village.** 10 alive d46, 6 deaths (expedition, Wannee/Ethan sickness, 3 villager combats). Pantry 34k. 4 contests won, all surfaced. Mateo (dispatcher) wants belonging; Erin (aide) talks to the sky about taken Evelyn; Ruth (plumber, lonely) asked the System for a sandwich. Wave 2 d28. Pilot d15.

**Seed 61 — the bloody village.** 10 alive d46, 14 deaths (expedition bloodbath d7 including Wei's ambush — the Elif arc again; Huguette died of *Nostalgia* d31). Pantry 13.5k. 5 contests won, all surfaced (Hardened Lie Detector ×2, Impress Us, Pattern Hunger, The Confession). Wave 2 d11, **wave 3 d36**. Wilhelm (vintner) keeps his pack ready; Kate (dry cleaner, taken nephew Joseph) won't re-confess; Angelo (street artist) keeps asking for pantry-run hands. Pilot d21.

**Seed 124 — the grieving village.** 7 alive d45, 16 deaths (expeditions, combats, Jose sickness, Nathan ambushed, Hassan died *in contest* d22, Peyton d41, Hermann d45). Pantry 25.7k. 3 wins surfaced (Pattern Hunger, The Quiet Room, The Iron Pantry). Valentina, Hinewai, Malachy grieving. Wave 2 d9. Pilot d20.

**Who leads:** the competent bot-player throughout — no player deaths, no mantle transfers. **Who is miserable:** the grieving (taken kin + 16-death seed 124), Kate (sick, deflecting), Huguette (dead of nostalgia). **What is missing:** defeat surfacing on this base (0 defeats — the competent policy wins everything); the d42-tail question (NO-DATA).

## PEOPLE CHECK (9 transcripts, 0 senseless, 0 fabricated history)

Detailed above. The bar holds: NPCs want things (belonging, news of taken kin, pantry hands, comfort for grief), options engage/deflect them, threads resolve/plant/owe. No filler loops (the driver's no-repeat discipline + the engine's escalating reframe prefixes), no static menus (pagination + subject menu + alive items).

## REACHABLE / FUN / WINNABLE

- **Reachable:** 3 villages establish; pilots air d15–21; wave 2 d9–28, wave 3 d36 (61); 12 contests fire, all won, all surfaced in gossip.
- **Fun:** the threads have people in them — Mateo's belonging arc, Kate's refusal to re-confess, Ruth's sandwich, Angelo's persistent favor. The village talks about the show.
- **Winnable:** 3/3 villages alive through 6–16 deaths; pantries 13.5–34k; zero starvation; succession unneeded.

## METRIC REVIEW

- M1b-tail as bound worked as a directional probe but the phenomenon didn't occur — the pre-registration correctly scoped it as n=1, and NO-DATA is the honest record. Proposal: defeat surfacing on the r42 base needs a targeted seed or a weaker policy; r29's 2/3 stands as the lane's verification (r42 didn't touch gossip serving).
- M-thread's instrument evolved mid-run (bare `more` → `dlg:more` after the first pilot ran with the wrong follow-up id). The first pilot's day-loop data was kept (deterministic, verified identical); only the thread instrument was re-run. The lesson is recorded: the beat-matrix reply id, not the buildMenu id, is the wild follow-up path.
- Telemetry vs establishment.json baseline: the script's key-path mismatch (flat baseline keys vs nested `metrics.*` current keys) false-alarms LOUD; per-seed comparison is quiet (deaths 12 vs 11, +9%; popAlive 9 vs 10, −10%; pantryKcal 24.5k vs 20k, +22%; pilots 3/3 vs 4/4). Baseline NOT rolled (n=3 pilot vs n=4 baseline; re-seed on a 4-seed run).
- M4's evidence-first approach continues to work: zero hunger deaths, no probe needed.

## Files

- Harness: `scripts/journey-establishment-r30-20261023.js` (r29 harness + 45d horizon + thread-instrumented held driver)
- Proof test: `scripts/test-r30-recap-label-20261023.js` (3/3 GREEN, verified RED pre-fix)
- Fix: `src/js/conversation.js` (2 lines — recap + resume opener route through convoThreadAbout)
- Per-seed JSON + contest-window transcripts + held convos (3 seeds): `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/journey-establishment-r30-*`
- Run note (this file): `evidence/2026-10-23/journey-establishment-r30.md`
- Telemetry baseline: `hidden_files/telemetry-baselines/establishment.json` — NOT rolled (quiet per-seed)
