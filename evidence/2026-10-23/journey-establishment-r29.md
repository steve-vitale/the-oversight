# Journey leg: ESTABLISHMENT (days 14–40) r29 — CONTEST-NEWS LANE VERIFICATION (2026-10-23)

**Run provenance:** clean scheduled run (no lock at start; rotation-a read 1). Leg 1 = establishment; rotation advances 1→2 at landing. Worktree `journey-1`, base master@5d7715db1 (includes 8461565f8 contest-news lane + journey-landing r41). Run id oversight-playtest-loop-a-2026-10-23T22:58:20Z.

Canon read: CANON.md (manifest + standing rules), CONTESTS.md (the show: contests are its teeth, TV is its gossip), DIRECTIVES.md, repo AGENTS.md (push discipline, sim rules). No new canon invented.

## PRE-REGISTER (§14 — a miss is NO-GO, never re-scored mid-run)

- **Question:** the contest-news lane fix (Steve's 2026-10-23 bug ruling on r19's headline: unserved contest entries jump the aboutOther walk-down in ask:gossip, after scandals-about-you, before rumor verbs — landed in 8461565f8) — does it hold in the wild? Same instrument as r19 (matched seeds, same 42d horizon, competent PINNED), measuring surfacing on the post-fix base.
- **Interesting:** win surfacing moves up from r19's 16.7% (METRIC-REVIEW band); defeat surfacing moves from r19's 0/3; lossByType shifts from npcAbout/aboutOther toward 'contest'; any new pathology (lane firing when it shouldn't — stale entries resurrected past the 3-day fuse, or the r39 grapevine salience starved).
- **Seeds:** 61, 82, 103, 124 (matched r15–r28). **Horizon:** 42d (+death-aware tail). **Policy:** competent PINNED. Env gates at landed defaults (PLENTYDEPRI/DEPOSITGATE ON) — measures the live game.
- **Binding metrics:**
  - M1a (win surfacing): contests outcome 'won'; surfaced if >=1 NAMED gossip line within 3d. GO >=25%; NO-GO <10%. (r19: 2/12 = 16.7% METRIC-REVIEW — the fix must move this UP; a flat 16.7% is recorded as a METRIC-REVIEW miss on the fix's own terms, not re-scored.)
  - M1b (defeat surfacing): outcome 'lost'|'died'; same 3d window. GO >=25%; NO-GO <10%. (r19: 0/3 — any surfacing is improvement; bar stays binding.)
  - M2 (food economy, r27 standing bar): zero leg-window (day>=15) starvation/hunger/thirst deaths AND maxCrisisStreak < 3 (crisis day = hungryStreak>=3 AND pantry+pack < alive*2000).
  - M3 (people): >=8 full transcripts sense-read, 0 senseless, 0 fabricated-history, favorRepeatHits=0 (by hand after).
  - M4 (blank): r28's Wei contest-taken starvation blank — on this base, do contest-taken villagers get fed during the episode? Evidence-first: scan pilot deaths + contest windows for contest-taken villagers going hungry; probe only if a case recurs.
- **Observed, non-binding:** plentydepri/depositgate ledgers + voice lines; daily pantry trace; records/rounds stay-green (ZERO placeholder champion lines, ZERO null renders in held convos).
- **Guardrails:** no softlock (day 42 all seeds); wave-2 gate >=d8; death-aware stop; pilot aired.

## METRIC VERDICT

- **M1a win surfacing — GO: 12/12 = 100%** (61: 2/2, 82: 4/4, 103: 4/4, 124: 2/2). r19 was 2/12 = 16.7%. The fix moves wins from the review band to total surfacing.
- **M1b defeat surfacing — GO: 2/3 = 66.7%** (61/82: no defeats, NO-DATA; 103: 0/1; 124: 2/2). r19 was 0/3. The two Blood Tithe losses on 124 (d29 + hardened d40 — the exact contests that seeded-and-died-unsurfaced in r19) both surface now. The 103 miss (The Witness, d42) is a truncated-window artifact, not a mechanism miss (below).
- **M2 food economy — GO all 4 seeds.** Zero leg-window starvation/hunger/thirst deaths; maxHS 1/0/0/0; zero crisis days. Pantry 41k→18k / 42k→9.4k / 42k→48k / 39.8k→26.2k. plentydepri engaged 27–41 days/seed (67–143k kcal eased); depositgate 28–41 days (20–47k share kcal eased). Alive at end: 11/9/11/10.
- **M3 people — GO.** 12 transcripts sense-read (3×4 seeds), 0 senseless, 0 fabricated shared history, favorRepeatHits=0 (the favor_requirements repeats carry escalating "As I said —/Like I said —/I've told you three times now —" prefixes — people-like annoyance, not verbatim loops; r28's read stands).
- **M4 blank — NO RECURRENCE (partial close).** Villagers were taken alongside the player in 7 contests (Giulia, Huguette, Elena, James, Valeria, Ethan, Wei, Wannee, Jesse, Hinewai, Hassan, Hermann); all lived, zero hunger deaths leg-wide, zero crisis days. r28's specific shape — taken for one contest then RECAST out of a second while away (Wei d16→d18) — is not exercised by this policy (the competent player is taken every time; villagers ride along but never get recast while away). The simple taken-and-returned shape is verified fed; the recast-while-away shape stays open for the contest lane's targeted probe.

## HEADLINE: the contest-news lane works in the wild — wins 12/12, defeats 2/3, and the mechanism is outcome-neutral

Seed 124 is the proof: The Blood Tithe (d29, lost, Hinewai taken) and Hardened The Blood Tithe (d40, lost, Hassan taken) — the two defeats that r19 measured as seeded+spread+never-surfaced — now surface at the fire within a day:

- d30 Malachy: "You walked out of The Blood Tithe. Alive. That's the whole story and it's enough."
- d41 Malachy: "You walked out of Hardened The Blood Tithe. Alive. That's the whole story and it's enough."

And in held (non-probe) conversations the same day: Hermann's ask:gossip serves "Did you hear? Hassan won Hardened The Blood Tithe on the cameras. People are still talking about it." followed by the defeat line "You walked out of Hardened The Blood Tithe. Alive." — the show's wins AND losses living in the village's talk, unprompted by the probe instrument. James (seed 82) likewise volunteers "Did you hear? You won The Secret Deck on the cameras."

The 103 Witness miss, dissected: the loss seeded correctly ('survived','player','The Witness', living hearer). The contest aired d42 — the last sim day — so the 3-day freshness window truncated to 2 probe days (d42/d43). Both probes lost the 50% npcAbout pre-branch coin flip before the aboutOther branch (where the lane lives) was ever reached. The lane sits behind the 50%/45% pre-branches by design (Steve's fix: "after scandals about you, before the rumor walk-down" — the pre-branches are untouched). With a full window the odds are ~95%/contest; with 2 probes, ~47%. This is sample + window truncation, not a mechanism miss: the code path is identical for wins and defeats, and wins went 12/12.

No pathology: lossByType across 4 seeds = 68 probes lost to npcAbout/dark pre-branches — the lane does not starve the r39 grapevine salience (it only reorders within aboutOther, and the pre-branches still win their share). No stale entries resurrected (all surfaced entries within their 3-day fuse).

**Determinism cross-check (outcome-neutrality):** aggregate {deaths 45, popAlive 41, pantryKcal 101914} is byte-identical to r19's rebased pilot on the pre-fix base. Same seeds, same policy — the lane changes gossip serving order only, and the sims prove it: zero outcome drift. Telemetry vs establishment.json baseline (44/40/79935/4): deaths 45 (+2%), popAlive 41 (+2.5%), pantryKcal 101914 (+27.5%), pilotAired 4/4 — all under the 60% swing bar. QUIET, no LOUD lines, baseline NOT rolled. (telemetry-check.js needed metrics.* dot-paths; the flat-key invocation false-alarmed "newly appeared" — instrument semantics, not a deviation.)

## VILLAGE ASSESSMENT (plain words)

**Seed 61 — the brawler, now talkative.** 11 alive d42, 11 deaths (expeditions, villager combat, Wei's d7 ambush — the Elif old-argument arc, same as r28). Pantry 41k→18k. Both contests won and both SURFACED (Beastmaster d23, Bring Us Something Interesting d30). Wilhelm still sings his creek concerts; Kate still dreams of the pods and her taken nephew Joseph; Angelo still doesn't keep score.

**Seed 82 — the confessional.** 9 alive d42, 13 deaths. Pantry 42k→9.4k, zero hunger. 4 contests won, all 4 surfaced (Duel, Hide and Seek, The Echo, The Secret Deck). James's secrets come out under pressure ("I'm not from Denver... I'm not proud of that"); Lillian believes in breakfast and people showing up; Ruth's grandfather Roman "survived two wars and a famine. Not interesting enough, apparently."

**Seed 103 — the streak with a sting.** 11 alive d43, 5 deaths (Gabriela ambushed d20 — Ruth's plot, same as r28). Pantry 42k→48k. 4 wins surfaced; the Witness loss d42 seeded but unsurfaced (truncated window, above). Mateo wants eight hours of not being afraid; Erin is sick and asking for help; Ruth's taken sister Sofia was "the boring half, they said."

**Seed 124 — the show's village.** 10 alive d43, 16 deaths (all known channels: combat, expedition, sickness — Jose d11, Diana d18). Pantry 39.8k→26.2k. Iron Pantry won, Wrong Map won (Hermann named as winner), both Blood Tithes LOST — and all four talked about at the fire. Valentina runs the bare-pantry math ("Another day like today and we're choosing who eats"); Hermann's gossip cascade (Jorge is back, Hinewai wraps, Peyton talks to the garden); Peyton's unsent letters.

**Who leads:** the competent bot-player throughout — no player deaths, no mantle transfers this run (contrast r27/r28's chains). **Who is miserable:** the grieving (taken kin on every seed), Erin (sick), Valentina (bare pantry). **What is missing:** the Witness d42 defeat in the fire's talk (window artifact, not mechanism); the playable joint-foraging outing (Valentina's favor dead-end — the known [needs-eyes], Steve's call, unchanged).

## PEOPLE CHECK (12 transcripts, 0 senseless)

61: Wilhelm (creek concerts, Columbus songs — "Tunes outlast everything"), Kate (pods dream, taken nephew Joseph, the commit-to-ask-the-System beat lands), Angelo ("I don't keep score on that. Score-keeping is how you stop sleeping").
82: James (medicine-theft confession → layered confrontations → volunteers the Secret Deck win unprompted), Lillian (taken spouse Arlo; "I believe in breakfast. In people showing up. Small, provable things"), Ruth (taken grandfather Roman).
103: Mateo ("Eight hours of not being afraid"), Erin (sick-row favor — "You don't know what that means to me"), Ruth the plumber (taken sister Sofia; Flashbulb Moth expedition cue).
124: Valentina (bare-pantry favor; the dev-honest dead-end + the real social close "They won't forget. They'll just stop asking"), Hermann (gossip cascade; both Blood Tithe lines surface naturally), Peyton (unsent letters; rumor-spreading about Valentina lands "I'll keep it between us").
Hard-flag scan: 0 fallback lines, 0 phantom names, 0 verbatim repeats, 0 null renders in 12 held convos.

## BLANKS FILLED / DOCUMENTED

1. **FILLED (the run's question):** the contest-news lane (8461565f8) verified in the wild — wins 12/12 (was 2/12), defeats 2/3 (was 0/3), mechanism outcome-neutral (determinism cross-check byte-identical), no salience pathology. Steve's bug ruling is vindicated: the show's defeats are talked about now.
2. **Partially closed:** r28's Wei contest-taken starvation blank — no recurrence in 7 villager-taken contests; the recast-while-away shape unexercised, stays with the contest lane.
3. **Standing [needs-eyes] (unchanged):** the joint-foraging outing dead-end (Valentina) — dev-honest, still Steve's call.

## REACHABLE / FUN / WINNABLE

- **Reachable:** 4 villages establish; pilots air d14–21; wave 2 d9–34; 15 contests fire (2–5/village); every aired contest now surfaces in gossip within its freshness window (except the d42-truncated one).
- **Fun:** the fire talks about the show — wins celebrated, losses honored ("That's the whole story and it's enough"). The texture holds: creek concerts, water math, unsent letters, "They won't forget. They'll just stop asking."
- **Winnable:** 4/4 villages alive through 5–16 deaths; pantries 9.4–48k; zero starvation; succession unneeded (no player deaths).

## METRIC REVIEW

- M1a/M1b as bound worked: the split isolated the fix's effect (wins) from the sample-limited defeats. The 103 Witness case suggests a future instrument note: contests airing on the horizon's last day get truncated probe windows — extend the tail +3d for gossip measurement, or exclude d42+ airings from the rate. Proposal for r30+.
- M2's standing bar held with margin (maxHS 1, zero crisis days) — the regime is stable on the new base without the intake drive.
- M4's evidence-first approach worked: no probe needed since no case recurred; the unexercised shape is named, not hand-waved.

## Files

- Harness: `scripts/journey-establishment-r29-20261023.js` (r19 harness + r29 pre-reg + hungryStreak in foodTrace)
- Per-seed JSON + contest-window transcripts + held convos (4 seeds): `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/journey-establishment-r29-*`
- Run note (this file): `evidence/2026-10-23/journey-establishment-r29.md`
- Telemetry baseline: `hidden_files/telemetry-baselines/establishment.json` — NOT rolled (quiet)
