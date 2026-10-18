# Journey ENDGAME R17 (2026-10-18) — path spread: does the table ever offer anything but feared/light?

**Run id:** 20261018T1145Z (oversight-playtest-loop). Worktree: `journey-endgame`.
**Base:** master (pulled at run start). Rotation index was 4 (endgame); this run plays leg 4 again by queue-jump (r16's all-feared/all-light finding is the open question).

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** r16's 8 runs ALL took feared/light. TABLE.md law 2 says all
7 paths are "equally tempting, all engaging to play... a different game,"
law 6 says light/dark branches are "earned through play, never a menu
choice." Question: across competent full runs with varied policy flavors,
does the table actually OFFER a spread of the 7 paths — or does every run
collapse to feared/light? Do offered paths resolve via played challenges
(law: contests played not RNG, monster fights blow-by-blow)?

**Context known before the pilot:** r16's `atSit.doors` showed the OFFER
surface already spans 5–6 doors per run (feared, beloved, witness,
assimilated, defiant, relay all earned at lesser+). The collapse is in the
CHOICE: winseek's tableRoad drain always answers `tc.options[0]`, and feared
is listed first. So the r17 instrument steers the door pick per flavor and
asks: (1) do non-feared doors resolve through played challenge mechanics,
(2) do branches read earned-from-play (dark flavor → dark branch on the
SAME door?), (3) is any branch unreachable in competent sims (blank)?

**Arms** (identical belongseat base stack — TRIBFLOOR=1 + WINDEFER=1 +
FEASTSCALE_R13=1 + BELONG_V3=1 — flavor layers differ, door picks differ):
- (a) CONTROL = r16's stack as-is. Door: options[0] (feared). Pins the baseline.
- (b) DARK = control + steal when hungry/scheduled (larceny verbs), never
  donate surplus (hoard the food truth), relay dark verbs (claim relay when
  available; reroute('efficient') — dark lean −2; deepen). Door: FEARED
  first — same door as control, so the branch read is the experiment.
- (c) COMMUNITY = control + share surplus (donateToPantry over cap), comfort,
  facilitate (appointSwitchboard a competent villager — hand them the relay —
  not the Bearer). Door: BELOVED first, then witness, assimilated, defiant,
  relay, feared (indispensable last — needs full seat).

**Policy-lever audit (instrument, not game):** betrayed via stealFrom EXISTS
(larceny-leaning). foodShared via donateToPantry EXISTS (kind.js). foodHoarded
via pantry-bulk takes EXISTS in engine but no policy lever targets it — the
dark flavor hoards by never donating; whether the hoard detector fires is
measured. edited/skimmed switchboard decisions come from the HOLDER's
honesty rep, NOT policy verbs — no policy can force 'edited'; reroute
'efficient' moves relayLean (−2) and delayed+1, NOT edited. **No policy lever
exists for breaking promises directly** (pt.broken is engine-driven) —
broken promises are not expressible by any flavor; said explicitly here.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 reach GO: >=3/4 seeds reach table announcement (invited) per arm.
- M2 spread GO: >=2 distinct paths offered or taken across the seed×flavor
  matrix. All-collapse to feared/light = NO-GO recorded as a design question
  for Steve, never re-scored.
- M3 played GO: every path challenge that fires resolves through played
  mechanics (fights blow-by-blow, contest sequences) — any
  single-outcome-roll resolution = FAIL LOUDLY as canon violation.
- M4 people GO: >=2 transcripts sense-read (path offer, the sit, finals),
  0 senseless flags.
- M5 census GO: post-table village census real on all arms; no crash/softlock.

**Interesting-finding bar:** a non-feared path offered AND completable as a
played challenge; OR a path unfireable/unreachable (blank); OR total collapse
to feared/light with the offer surface never showing the other 6 (Steve
question). All 3 are reportable, none is failure of the run.

**Seeds:** fresh 4: 8951–8954 (r16 used 8931–8934). **Pilot:** 1 seed (8951)
× 2 flavors (control, dark) to validate the flavor instrument (theft fires,
relay verbs fire, branch math readable), expand if it works.
**Horizon:** DAYCAP=210, death-aware (+10d tail max — never tick a dead
village to fill the leg). **Policy pinned:** the conversation driver is
r16's fresh-first driver, unchanged (driver changes re-randomize
downstream runs).

## PILOT (seed 8951 × control, dark)

**Control:** invited, sat d100 (lesser seat), door feared/**light**, won d100,
8/8 alive. Branch notes: ["the food truth was shared"]. Ledger@sit:
killed=0, protected=0, betrayed=0, foodShared=1, foodHoarded=0, might=144,
showmanship=24, exposed=1, embrace=6, defiance=4. 5 doors offered
(feared 100, beloved 100, assimilated 60, defiant 36, relay 40).
Instrument reads the branch math correctly (light 2–0).

**Dark (as first composed — theft when hungry OR day%5===0):** village LOST
d68, 2/2 alive, never reached the table. 15 thefts → a moot cascade
(Theo, Dmitri, Hlompho, Sam accusing theft d53–d64, "not guilty" but "an
accusation leaves a mark", caught red-handed trust −20) on top of heavy
combat losses. The justice system worked as designed; the flavor was too
hot. **Instrument revision (documented, metrics unchanged):** theft now
hungry-only, and the dark door order moves RELAY first — see below.

**Pilot-driven static findings (branch-math audit, table.js tableBranch):**
- feared-dark is **tyrant-gated**: its dark signals are `killed` (Bearer
  murdering VILLAGERS, +3 each — registerDeath wrap) and `betrayed`
  (turning on a party member/follower, or show-event betrayal). Theft does
  NOT write `betrayed`; solo monster kills write `might`, not `killed`/`protected`.
  A competent non-murderous run cannot move them — every competent run lands
  feared-light. The design is honest (domination = actual domination), but
  Steve should know the dark branch is unreachable without villager murder.
- beloved-dark is **hair-trigger**: dark += 2 when `showmanship >
  protected*2`. `protected` only rises on party monster kills (+1) and
  show-event heroics (+2/+3) — the control pilot had protected=0,
  showmanship=24. ANY competent solo-fighter run with showmanship>0 reads
  "manufactured adoration" on beloved. The community arm (beloved-first)
  will test whether that read is senseless for a kind, sharing player.
- No policy lever exists for `edited` switchboard decisions (they come from
  the HOLDER's honesty rep, not verbs) or for breaking promises — both
  pre-reg lever gaps confirmed in code.

**Pilot verdict:** instrument valid after revision (theft fires when hungry;
branch math readable; door steer works — dark's steer wasn't exercised
since it died pre-table). Expanding to 4 seeds × 3 arms.

## RESULTS (4 seeds × 3 arms, 12 runs)

| seed | control | dark | community |
|------|---------|------|-----------|
| 8951 | feared/**light** won d100, 8/8 | **relay/grey** → fail (grounding hollow) → feared/light won d90, 8/8, weak=1 | **beloved/dark** won d90, 9/9 |
| 8952 | feared/**light** won d90, 9/9 | **relay/dark** (lean −82) → fail (3 backfires) → feared/light won d104, 8/8, weak=1 | **beloved/dark** won d90, **2/2** |
| 8953 | LOST d72 (4/4) | **relay/grey** (lean 0, no verbs) → fail (3 backfires) → feared/light won d90, 5/5, weak=1 | LOST d92 (1/1) |
| 8954 | feared/**light** won d90, 8/8 | LOST d67 (2/2; exile d12 → spiral) | **beloved/dark** won d90, 9/9 |

- **M1 reach GO 3/4 per arm** (control 8951/52/54; dark 8951/52/53; community 8951/52/54). Each arm lost a different seed — 8953 killed control+community, 8954 killed dark.
- **M2 spread GO — 3 distinct paths TAKEN (feared, relay, beloved), 3 branches (light, grey, dark).** The r16 "all feared/light" collapse is broken the moment the door pick is flavored. The offer surface showed 5 doors on every seated run (feared, beloved, assimilated, defiant, relay; witness earned nowhere this run — exposures 1–2, needs 3; indispensable needs full seat).
- **M3 played GO.** Every firing challenge resolved through played beats/meters: feared 3 calibration beats (terror/horror meters, curdle rule); beloved 3 acts (audience meter, cast villagers, edit-bay twist); relay cockpit (merge meter, sysbond/grounding/lean live readouts, backfire meter). Static audit: no R() outcome rolls in any table-*.js challenge file; tableChoose applies choice→meter→fail-check. The three relay failures were the designed downgrade machinery (backfire meter ×2, grounding-hollow ×1) — "failure RESOLVES, never wipes": all three downgraded to weakened feared/light and WON. No canon violation.
- **M4 people GO.** Sense-read: (1) 8952/dark offer frame — all 5 doors priced aloud with standings, the dark conscript beat ("The System waits. The pods wait."), the cockpit with live meters ("merge 0/8 · sysbond 5 · grounding hollow · leaning total -84"), the downgrade ("The table does not punish failure with death. It punishes it with smaller doors."); (2) community 8951 beloved — 3 acts with real casting (Dmitri/Shaun/Omar), the dark edit-bay twist ("final cut on your own legend... All it costs is the truth"), dark finals; (3) day-80 convos (Aaron: "That's not naive. That's load-bearing"; Ashanti: "Can I trust you? I mean really." / "The wrong one would've been 'yes' too fast"; Maya: "What's the worst thing you've done since the sky changed?" → "We're all doing math that doesn't add up"); (4) grounding beats d70–83 on community 8951 (fraying→estranged→hollow, villagers reacting in their own words). 0 senseless flags.
- **M5 census GO.** Post-table census real on all 9 seated runs; no crash, no softlock (12/12 runs terminated cleanly: 9 over-other/won, 3 village-lost).

**The leg question, answered:** the table OFFERS a spread (5 doors on every seated run) and every offered door resolves as a played challenge. The r16 collapse was a policy instrument artifact (the drain answers options[0]; feared is listed first) — not a game offer problem. Branches are earned through play: the dark flavor's relay verbs moved the leaning meter to −82 (dark band) on 8952 and the grey middle on 8951/8953; the same door (feared) read light for control and for the downgraded dark runs because the ledgers matched.

**Branch-math findings (Steve questions, all from the ledger + tableBranch code):**
1. **feared-dark is tyrant-gated.** Its dark signals are `killed` (the Bearer murdering VILLAGERS, +3 each via the registerDeath wrap) and `betrayed` (turning on a party member/follower, or show-event betrayal). Theft does NOT write `betrayed`; solo monster kills write `might`, never `killed`/`protected`. A competent non-murderous run cannot move them — every competent run lands feared-light. The design is honest (domination = actual domination), but Steve should know the dark branch is unreachable without villager murder.
2. **beloved-dark is hair-trigger.** Dark += 2 when `showmanship > protected*2`, and `protected` rises ONLY on party monster kills (+1) and show-event heroics (+2/+3). All 4 community runs had protected=0, showmanship 17–18 → "manufactured adoration" for kind, sharing, facilitating players. A single party kill (protected=1) would have flipped 8951 to light (light 3 vs dark 2). The margin is razor-thin and hinges on a counter most competent runs never move — is "manufactured" the right read for a solo-fighter village hero? Steve's call.
3. **The relay dark band is genuinely earnable through play** (8952: lean −82 via 42 efficient reroutes + 10 deepens + scenes) — but the same verbs load the backfire meter and erode grounding, so the dark-band walk failed on the designed failure rules. The tradeoff is real: dark verbs that earn the band also risk the merge. Grey (8951 lean −18, 8953 lean 0) is reachable and honest.
4. **Policy-lever gaps (instrument, confirmed in code):** no lever for `edited` switchboard decisions (they come from the HOLDER's honesty rep, not verbs); no lever for breaking promises (engine-driven). The drain accepts the dark conscript by default (options[0]='conscript:yes') — a refuser policy would be a separate measurement.

## Village assessment (census in plain words)

- **8951:** the golden seed. Control won feared/light d100 with 8/8 alive. Dark walked the relay (grey), failed on hollow grounding, downgraded and won feared/light d90, 8/8. Community won beloved/dark d90 with 9/9 — but the original Bearer (DeAndre Tian) died d64 in combat and the mantle passed to Aaron Ye, who had been handed the relay: from d65 the wires eroded the new Bearer (−1/day) through fraying, estrangement, to hollow, and the village grieved him while he lived. He still won. The win is honest; the grief is on the record.
- **8952:** the dark-band seed. Control feared/light 9/9. Dark pushed lean to −82 (total), took the dark conscript, failed on the third backfire, downgraded, won feared/light d104, 8/8. Community won beloved/dark with **2 villagers left** — a pyrrhic variety finale; the show went on with an empty fire.
- **8953:** the brutal seed. Control died d72 (4 left), community died d92 (1 left) — monster pressure + wounds + sickness. Only the dark arm survived it: walked the relay grey with ZERO relay verbs (lean 0 — the door was earned on stage-3 integration alone), failed on probe backfires, downgraded, won feared/light with 5/5. The relay door doesn't require playing the relay first — integration depth alone qualifies, as designed.
- **8954:** the exile seed. Control feared/light 8/8. Community beloved/dark 9/9. Dark spiraled: the Bearer killed a villager in combat d13 → theft accusations compounded → moot exiled the Bearer d12 ("📓 Codex: Exiled (moot). Walking.") → without its leader the village starved (2 starvation deaths d68), sickened, and died d67 with 2 left. The 14 hungry-only thefts contributed to the trust collapse but the exile was the hinge.

Across the matrix: 9/12 villages reached the table, 9/9 of those won (3 via the honest downgrade path). Deaths were all legible (combat, monster, wound, sickness, starvation, contest, exile-spiral) — no mysterious wipe.

## People check (SENSE-TESTING LAW)

See M4 above. Villagers want things (Aaron wants to know what the Bearer believes; Ashanti wants to know if they can trust; Maya wants the worst thing you've done; Gunther-class beats from r16's lineage continue), options engage/deflect (the driver deflected Maya's confession and she accepted it without judgment), endings resolve/plant/owe (the laugh Aaron needed; the naming debate planted). The table sequences read as theater with real stakes: the conscript beat, the edit-bay offer, the downgrade's "smaller doors" — all voiced, all consequential. 0 senseless flags. One cosmetic artifact persists from r16: `party_namepick` prints `(no line)` in raw transcripts (the beat narrates via say; UI reads the transcript — investigated, not a bug).

## BLANKS (2 fixed in-worktree with proof tests; 1 documented)

**Blank 1 (fixed): dead villagers named in live beats.** community-8951: dead DeAndre "watches you at the relay console" d65+ and "set a place for you at the feast" d83. Root: relay-ext.js relayTick and table.js groundingReactionBeats both read `(data.villagers).filter(x => x.id !== villagerId)[0]` — dead records stay in data.villagers (marked .dead). Sibling sweep found exactly these 2 instances. Fix: `&& !x.dead` in both (fallbacks 'Mara'/'the old ones' cover the all-dead edge). Proof: `scripts/test-deadname-beats-20261018.js` — RED before (named the corpse twice), GREEN after (names the living). [needs-eyes]? No — invisible when correct; the beats only misfire on corpses.

**Blank 2 (fixed): relay facilitation never recorded the architect's credit.** The community flavor appointed villagers to the relay (the facilitation verb per TABLE.md), 6 ascensions fired across the arm — but `pg.table.facilitated` stayed None, so all three won runs played the OUTSHONE epilogue ("the record notes, kindly and accurately, that you watched") instead of ARCHITECT. Root: tracking lived only in `tableFacilitate('relay')`, but the real verb `appointSwitchboard` — called by the Haven UI (app.js:16414) and by policies — never recorded it. Fix: record the 'relay' act inside `appointSwitchboard` itself (idempotent with tableFacilitate). Proof: `scripts/test-facilitate-relay-20261018.js` — RED before (acts null), GREEN after (acts ["relay"]).

**Blank 3 (documented, not a bug):** the drain accepts the dark conscript by default (options[0] = 'conscript:yes' — "Take them. (An army. Instruments.)"). The refusal path ("The mourners exhale") is voiced but unexercised in sims. A conscript-refuser flavor is future instrument work.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json`
(wins, table, tableSceneFired, tableSceneCompleted, seatApproach, ascensions, exiled):
- control: quiet. dark: quiet (exiled 0→1 on one run — below the LOUD bar; the d12 moot exile is the honest story, counted).
- **community: LOUD — ascensions newly appeared: baseline 0 → current 6.** Verdict: EXPLAINED, not a bug. The community flavor hands villagers the relay (facilitation), and ascension scores count System abilities/office-holding — the facilitation design (TABLE.md: "NPC heroes are real") working as intended. Baseline NOT rolled forward: the ascension count is a deliberate-treatment artifact of the facilitation flavor, and the coarse baseline doesn't capture the flavor axis (same reasoning as r16's wait arm).

## METRIC REVIEW (§14)

- M1–M5 all GO. No metric proved wrong.
- The pre-reg's dark door order (feared-first) was revised after the pilot to relay-first — instrument calibration, not metric re-scoring: the pilot + branch-math audit showed feared-dark is tyrant-gated (murder-gated), so the same-door branch experiment had a known answer; the relay's leaning meter was the live earned-branch experiment. Binding metrics unchanged.
- Note for future runs: the door-steer instrument is calibrated (chooseTableOption wrap at phase 'paths' only; never re-picks, never stalls). The drain's options[0] behavior is otherwise untouched — conscript acceptance, beat picks, and downgrade picks all flow through it; any flavor that wants different beat-level play needs its own drain.
- The conversation driver stays pinned (r16 fresh-first); the day-130 convo probe only fires on runs alive past d130.

## Reachable / Fun / Winnable

- **REACHABLE:** Yes — 9/12 competent runs reached the table (3/4 per arm), 5 doors offered on every seated run, 3 paths taken, all 3 branch colors seen. The relay door is reachable on integration depth alone (8953/dark, zero relay verbs). Witness (3 exposures) and indispensable (full seat) remain the hard doors — neither fired this run.
- **FUN:** The spread is real and each path plays a different game: the feared calibration tightrope, the beloved variety finale with its edit-bay temptation, the relay cockpit with live merge/sysbond/grounding/lean readouts. The downgrade path is the standout: three failed relay walks became complete, honest feared/light wins — "the table does not punish failure with death. It punishes it with smaller doors" is the best line the endgame has. The dark conscript beat and the hollow-grounding failure are genuinely dramatic.
- **WINNABLE:** Yes — 9/9 seated runs won, and failure never wiped anyone (weakened at most). But two branch tunings need Steve's eyes: (1) feared-dark is murder-gated — is that the intent, or should a ruthless non-murderer be able to earn domination? (2) beloved-dark fires on any solo fighter with showmanship>0 (protected is nearly unreachable outside party kills) — is "manufactured adoration" the right read for a village hero who fights alone? Both are one-line branch-math questions, not system reworks.

## Evidence

- `evidence/2026-10-18/journey-endgame-r17.md` (this note)
- `evidence/2026-10-18/journey-endgame-r17-{control,dark,community}-s{8951..8954}.json`
- `evidence/2026-10-18/journey-endgame-r17-transcript-{arm}-s{seed}.txt`
- `evidence/2026-10-18/journey-endgame-r17-convos-{arm}-s{seed}.txt`
- `evidence/2026-10-18/tele-r17-{control,dark,community}.json` (telemetry-check inputs)
- `scripts/journey-endgame-r17-20261018.js` (harness + flavor instruments + door steer)
- `scripts/test-deadname-beats-20261018.js` (blank 1 proof)
- `scripts/test-facilitate-relay-20261018.js` (blank 2 proof)

**Game-code changes this run (2 one-liners + 1 verb fix, all proof-tested):**
- `src/js/relay-ext.js`: relayTick "you look tired" line skips dead villagers.
- `src/js/table.js`: groundingReactionBeats names skip dead villagers.
- `src/js/comms.js`: appointSwitchboard records the 'relay' facilitation act (architect's credit).
**Tooling:** the r17 harness + 2 proof tests. Merged locally, pending ship.
