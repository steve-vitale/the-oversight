# Journey crisis r261 — RUN NOTE (Lane B, leg 6)

**Run:** `playtest-loop-2-20261121T0155Z` (scheduled Fri 2026-11-20 20:00 CST / 2026-11-21 02:00Z).
**Panel:** seeds 14581–14585, fresh band (verified unused across repo preregs,
goal hidden_files, and full evidence grep), base master `3235672ad`.
**Branch:** `journey2-crisis`, prereg + fix + proof committed as `badcf814d`.
**Adoption:** timed out at gate closeout; closed out by adoption (rebase + fresh
gate + merge), see Gate section and Base movement below.

## Leg question (prereg)

Confirm panel for the r261 dodge-article fix on the new base, plus the four
new live landings and the env-gate watch:

- **Dodge-article fix** (`game.js:44729`, `tbMonsterTurn` DODGED branch):
  `dodged the ${encAttackName(...)}` composed "dodged the the attack!" while
  the attack pattern was unlearned (`encAttackName` returns `'the attack'`
  with the article included). Fixed via `articlePhrase` — unknown →
  "dodged the attack!", learned capitalized name → "dodged Trample!",
  learned lowercase name → "dodged the sweep!". Proof test
  `scripts/test-dodge-the-20261121.js`: RED 3 failed → GREEN 7/7.
  Same family as the r249/r253 antler fix; the only blind-prepend site among
  the `encAttackName` call sites.
- **Warn-heed** (`a11df1fac`, landing r150): first heed of a `warn_you` want
  speaks the warning.
- **Settled-help** (`b6a551691`, scale r247): settled-help lines name the favor.
- **Self-witness** (`ef5e65cb1`, succession r258): a witness line in the ambush
  path must name a speaker who actually saw the latest fresh dead fall.
- **Dodge/close no-path + goal-bridge pool** (`0d38a74d1`, landing r149).

## Panel verdict in plain words: GO

The fix holds in the wild, every binding bar passes, and the people check is
the strongest this leg has read — but the run found one new gameplay grind
(the radio-mimic fight stall) and the plan-ignition wall is still standing on
the default panel.

- **Dodge-article:** 16 dodge lines, 17 antler-thrash lines, **0 doubled
  articles** — GO. "the the" = 0 across all sayLines (case-insensitive).
  The r257 blemish is closed.
- **D2 (delayed approach):** 38 attempts, 28 ok, 10 refused, 5 cleared,
  deltaExact 28, **deltaBad [] — GO**.
- **DRY census:** 0 dry lines, deflect_q 0 — GO.
- **Link-accept:** 4 accepts, 2 voiced (14581 d26 Thornfield, 14583 d56
  Ashford), **0 parrot lines — GO**. The ECHO question is now measured, not
  just open.
- **Titan refusal:** 343 outcomes, 338 refused, 39 gate lines, **0 repeats**,
  5 field slays — one per seed (William d118 14581, Arturo d88 14582, Sigrun
  d150 14583, Nikos d120 14584, Arlo d85 14585). Every gate line says
  "you have 0" — the muster never grew on this panel (0 dawn muster-growth
  lines). TITAN-REFUSAL GO.
- **Fight-1:** 28 ok sorties, 18 cleared, multiMonsterCleared 17/23; the
  cleared fights' worst damage taken was 56, so the Q4 trigger (cleared
  fight-1 with vTaken ≥70) did **not** fire. (The 108 vTaken was a
  broke-after-fight-1, not a clear.)
- **March refusal:** 0 march-gate refusal lines; the Commercial Break was
  never announced on this panel — coverage note, same as r257. The 22 'march'
  lines on 14585 are the ant-trail foraging line, not the gate.
- **Wren bar (revised per r257 metric review 1):** PASSES — 0 consecutive-day
  repeats, 0 same-day duplicates on all 5 seeds; all 3 variants present on
  every seed. Mime holds (14584, 9 lines, variants rotate, no same variant
  3 days running).
- **Panel shape:** 3/5 villages reached the 150-day horizon (14581, 14583,
  14584); 14582 scattered d142 with 1 alive; 14585 scattered d132 with 0
  alive. Raids 8–14, gorge nights 19–134, sorties 2–12, 8 driven convos per
  seed, 5/1/5/4/0 alive at the end. Pantries 8,932 / 0 / 3,200 / 400 / 0 kcal.
  No softlocks. WRAP 40/40 marked, 0 unmarked. NODEAWAY 20 total, worst 6
  (14583 d58; r257 was 13/worst-7).
- **C7b:** famine 1 (Catalina 14584), disease 2 (Alba 14582, Niamh 14584),
  wound 2 (Emil 14581, Keegan 14585), thirst 1 (Sukhdeep 14585). Buried dead
  named in the corpse record: Kavya/Domingo/Violet (14583), Imani (14584),
  Leonard/Carolina/Yarina (14585).
- **Supply:** ruin searches **1 panel-wide** (14583), 0 medicine acquired —
  cumulative **2/321** (r257's 1/320 + this 1). Medic duty blocked 451
  companion calls; cures by ability 65, by medicine 0. The medicine-supply
  wall stands; the richer layered design is still owed.
- **Stranger:** VACUOUS (0 kills, 0 silent) on all seeds. Homebody vacuous
  (28 picks, 0 qualifying). NOTICKDEFER 0.
- **Death cleanup:** 7 cleanups, 7 plan seeds, 0 dead-holder entries, 0
  unseeded plans, 0 ignition-after-death. First plan day 43 (14583) and 48
  (14585). **But:** the winPlanStats block is absent (`stats: null`) on
  14581, 14582, and 14584 — those three villages seeded **zero plans in 150
  days**. The plan-ignition wall is still standing on the default panel:
  3 of 5 crisis villages never start a single plan.
- **PS4 side-arm** (14581–14583, `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1`):
  14581 142d game-over, 14582 128d game-over, 14583 150d horizon; D2
  29/16/13/4/deltaBad[]; DRY 0; DODGE-ARTICLE GO (8 dodge, 14 thrash,
  0 hits); LINK-ACCEPT GO (1 voiced accept, 0 parrots). Trios fired on
  14581 (partySize 3 on d41, d62, d82, d95 — e.g. Fionn/Dmitri/Amina d41);
  trio sorties also fired on 14582 (d64, d85, d115) and 14583 (d42, d72,
  d81, d89, d107, d115, d125). The persistent-party registry counts fewer:
  trios 3/1/0, quads 3/0/0 per seed — most trio sorties are ad-hoc
  assemblies, not lasting parties. Plan seeds 15/10/11, first plan day
  28/41/43, death cleanups 18/12/11. Under the PS4 levers the same seeds
  ignite plans; under the default panel they mostly don't. The substrate
  reaches the crisis band — the launch decision still doesn't.

## C3b adjudication (20 settled lines — the instrument is noisy, the verdict is clean)

The R261 C3b-TRANSCRIPT section caught 20 lines matching "settled"/"Counted".
Adjudicated against the driven transcripts and their FAVOR-PROBE state:

- **10 negations** — "Nobody's settled it" (murder of Ruth 14581 d17; ambush
  of Sanne 14582 d9; ambush of Aroha 14583 d9/d10/d17/d25; ambush of Jesse
  14583 d17/d25; murder of Chantal 14585 d14/d15). Honest open-case
  statements, not settlements.
- **5 "Counted." vote lines** (14583 d10/d17/d25/d26, 14585 d15) — case
  votes after expose-at-the-moot, not favor settlements.
- **3 topic closers** — "your story, settled" (14581 d17), "your useful
  old-life skills, settled" (14582 d9), "that personal stuff, settled"
  (14585 d30). All favorKind null. Closers, not settlements.
- **2 TRUE settlements — the r257 Wren case's sibling, confirmed in the
  wild:** Suarni Marpaung, 14583 d48 ("You came through on this wound. I
  won't forget it." / "settled, and counted.") and d56 ("Good — that debt,
  settled."), both with the heal_help favor in state **fulfilled**
  (`gen_qfh73e0`). A fulfilled favor IS voiced as settled, with the favor
  named (wound / debt).

No false settlement anywhere: nothing claims "settled" for an open or
declined favor. C3b GO.

## People check (40/40 driven transcripts read in full — 1,344 lines)

The strongest people check this leg has read. Confessions land with reasons,
the double-confession guard holds under sustained pressure, thread recall
works with exact quotes and day counts, mourning names the real dead, and
case arcs resolve all the way to a public vote.

- **Confessions with reasons:** Alba (14582 d15) — "I wasn't a pharmacist.
  I was a hotel housekeeper. I wasn't protecting myself. I was protecting
  someone else." Victor (14582 d47) — "I wasn't a veterinarian. I was a
  carpenter. The truth felt small. The lie felt like someone worth keeping
  around." Suarni (14583 d39) — "I wasn't an infantry soldier. I was a
  Mortician. I was embarrassed." Hazel (14585 d63) — "I wasn't a Police
  officer. I was a Dentist. If the wrong people know, it doesn't fall on me.
  It falls on them."
- **Double-confession guard holds under pressure:** Hazel takes 7 confronts
  in one sitting (14585 d29) and 6 more (d63) — the guard rotates its lines
  ("I confessed that already…", "I told you the truth…", "You're really
  going to make me say it again?…", "That one's told already.") and never
  re-confesses. Alba's guard fires the same way (14582 d15).
- **Thread recall works:** Malik d17 recalls "your story — 7 days back" with
  the exact quote; Alba d15 recalls the patience answer; Victor d57 recalls
  "You said you'd earn it… I'm watching — and so far, so good"; Domingo d10
  recalls the trust question from d9; Hazel d23/d63 recall the funny story
  and the stay answer ("You said you're staying — you didn't expect to say
  it, but you said it. Still true?"); Paolo d26 recalls the grief thread
  verbatim; Suarni d48 recalls the wound favor 9 days back (with the exact
  quoted line).
- **Mourning names the real dead:** Imani (14584 d37/d38) grieves Alejandro
  ("Alejandro is gone and the world just… continues. That's the part I can't
  stand."); Fengying (14584 d48) grieves Niamh ("The sickness took Niamh. I
  keep washing my hands like it'll bring them back."); Victor (14582 d47)
  grieves at the treeline with Alba. No wrong-name mourning anywhere
  (REL-MOURN clean).
- **Case arcs resolve:** Domingo (14583 d9–d10) — investigate finds bribery
  ("Found something. Follow it to the moot.") → expose at the moot → vote
  GUILTY → "Counted." Hazel (14585 d14–d15) does the same for the murder of
  Chantal. The moot is called, the fire decides.
- **Parties get named and roled:** "The Company" (Alba, 14582 d32, System
  broadcast + Codex entry); "The Thornbacks" (Fengying, 14584 d48). Victor
  becomes Scout (14582 d56); Fengying becomes Scout (14584 d48).
- **The mantle thread speaks:** Hazel (14585 d30) — "Leonard and I never
  finished talking about that personal stuff — we left it mid-thought, 7 days
  back. You're wearing Leonard's shoes now — want to pick it up? … We still
  owe what they confided a proper ending, too." Succession as an unfinished
  conversation, inherited.
- **Villagers with purposes:** Imani the chronicler (14584 d28) — "If we
  don't write it down, it didn't happen… A hundred years from now someone
  should know we were here and what it cost." Rosa's warning (14584 d17)
  names the danger concretely ("the treeline at dusk. Don't.") and the heed
  picks answer it ("Promise me that. Please."). Hazel's stay answer
  (14585 d54) — "Phoenix, Arizona is a direction, not a plan. Here is a plan,
  even if it's a hard one."
- **Self-aware circle-breaking works:** "We're going in circles — still on
  whether you're staying. Ask me something else if you want." (Fionn d74,
  Sola d85, Imani d44, Victor d57). Declines carry consequence: "They won't
  forget. They'll just stop asking." (Imani d16); "They won't ask twice."
  (Imani d27) — see blemish 2 below, where that promise is broken.

**People blemishes (none binding, all filed for the next fix round):**

1. **"Names, named." is a transcript label, not the game's answer.** Every
   witness pick prints `NPC: Names, named.` in the driven transcript — but
   the game's own sayLines answer honestly: "No one saw Sanne leave. Just
   trees." (14582 d9), "No one saw Aroha leave." (14583 d9), "No one saw
   Chantal leave." (14585 d14). `betrayal.js:4665` calls `nameWitnesses`
   (which speaks the real line) and then returns `finish('Names, named.')`,
   which is what the transcript records. On this panel every case's witness
   list was empty, so the r258 self-witness fix holds vacuously — no witness
   line ever names a wrong speaker — but the transcript label claims names
   were named when the game said no one saw. Driver-label fix, not a game
   defect.
2. **Favor re-ask contradicts the decline line.** Imani's forage favor is
   declined d27 with "They won't ask twice. That much is clear" — then
   re-asked d38 and again d44 ("I hate to ask twice, but it's still open.
   Will you?"). The re-ask line itself acknowledges the repeat, which keeps
   it honest, but it contradicts the earlier promise. Either the decline line
   shouldn't promise, or the favor shouldn't re-open.
3. **Verbatim repeat decline:** Sola (14581 d85) declines the invite twice in
   one sitting with the identical line ("Another time. The village needs me
   here."). Honest both times, but the repeat reads as a stuck line.
4. **Thin sitting:** Victor d57 — three goon/recap picks in a row hit guarded
   fallbacks, one an empty beat ("A beat. Then, as if shaking something off:"
   with nothing after). The sitting winds down honestly, but the middle is
   thin.
5. **Recall label imprecision:** Suarni d48 recalls the thread as "that
   foraging help" when the favor was wound help (heal_help). The quoted line
   matches d39 exactly; only the label is loose.
6. **Stock exit line repeats:** "They're already drifting away. 'Later.'"
   closes both Malik d10 and Imani d37.
7. **"Gulsara's Drawing" repeats daily** on 14584 (d12–d20+): the same
   kitchen-table line fires every day with only the tail clause rotating.
   A once-a-while memory, not a daily one.

## New finding: radio-mimic fight stall (14584 d27)

A voice-mimic radio encounter ground through **382 sayLines in one day**:
116× "No path there.", 59× "The radio crackles, furious, advancing on dead
air.", 59× "Static shrieks — it lunges for the voice it stole, and finds only
air.", 58× "The static crackles, furious. No voice left. Just the radio — and
it wants you dead." The player kept trying to close on a mimic it couldn't
reach, and the fight never resolved — the day rolled over with the player
camping wild, no kill, no flee, no end line. The POCKET instrument counts
the lines (panel 194, 14584: 133) but doesn't classify the fight context, so
this reads as travel noise in the analyzer while it is really a combat stall:
a fight with 116 stuck turns and no stall-breaker. Same class, smaller, on
14582 d123 (26 no-path lines). Filed as the run's one new gameplay finding;
no binding metric covers it, so it is a blemish, not a NO-GO.

## Threads 35–45 (new/descriptive watches)

- **35 Growth lines:** 0 dawn growth lines naming a cooled act. The only
  non-garden "grew" lines are Codex season summaries (14582 d41, 14585 d41).
  No regression of the r245 fix. (The analyzer carries no dedicated growth
  section; this is a direct sayLines grep.)
- **36 Trail 3-press:** no verbatim trail-talk repeat 3x+ in one outing
  reported by the analyzer. GO.
- **37 Want-menu wind-down:** no react line firing after its want wound down
  reported. No finding.
- **38 War-path names:** **0 "full seat" lines anywhere on the panel.** The
  r255 defect class (full-seat war-path lines naming nonexistent monsters)
  did not fire. The "Big Ugly" hits (104/40/74/1/50 per seed) are all village
  naming debates — a tick (14581 d11, Malik names it, village settles d13),
  a heron, a glow under the water — real beasts the village coins names for,
  with votes and Codex entries. Thread 38 closes for this panel as a
  coverage note: no full-seat lines were served on the crisis leg.
- **39 Counter labels:** no counter line using a comma-carrying display name
  as the noun reported. GO.
- **41 Warn-heed:** 0 formal `warn_you` sittings in the driven transcripts —
  coverage note. In the wild, Rosa d17 (14584) speaks a warning with heed
  picks answering it ("the treeline at dusk. Don't." / "Promise me that.
  Please."), so the behavior the r150 fix guards is present and voiced.
- **42 Settled-help:** the broad check found 0 settled-help lines — but the
  C3b adjudication found the 2 true settlements above, both naming the favor
  (wound / debt). Behavior holds; the watch's pattern misses the actual
  phrasing. Instrument fix for the next round.
- **43 Self-witness:** see blemish 1. No wrong-speaker witness line; the
  fix holds vacuously on empty witness lists.
- **44 Dodge/close no-path:** 0 lines combining dodge/close with "no path".
  No regression of the r149 fix.
- **45 Env-gates:** no LEND/GUNRATE/CELLGATE/BOWKNOW line on the default
  panel. GO.

## Village assessment in plain words

Five villages went into a hard winter and three came out the other side.
14581 held together (5 alive, pantry 8,932) on the back of its stores; 14583
held (5 alive, 3,200) and buried its dead with feasts that bought the trust
back; 14584 survived (4 alive) but ran on fumes (pantry 400) and buried
Alejandro, Niamh, Imani, Fengying, Catalina, and Nathan along the way.
14582 starved out (1 alive, pantry 0, scattered d142) after Alba died of
disease and Arturo was lost to the Reunion; 14585 died out entirely
(0 alive, scattered d132) after losing Leonard, Carolina, and Hazel.

What the villages did well: they talked. Confessions, grief, naming debates,
party names, moots that actually vote — the social fabric held even as the
food ran out. What they didn't do: start plans. Three of five villages never
started a single plan in 150 days, and the muster never grew anywhere, so the
titan gate always answered "you have 0" and no village came near the full
seat. The same seeds, given the PS4 levers, seeded 10–15 plans each and
fielded trios — the people can do it; the default panel's launch decision
doesn't ask them to. And one fight — a radio that wore a dead villager's
voice — ground a whole day into 116 failed approaches, which is the one
place the game felt stuck rather than hard.

## Reachable / fun / winnable

- **Reachable:** yes. Every crisis beat fired on this panel — famine,
  disease, wounds, thirst, raids, sieges, funeral feasts, table
  negotiations, moots, naming debates, party naming, the mantle passing.
  A real player reaches all of it by surviving.
- **Fun:** mostly. The conversations are the best part of the game right now
  — they have memory, consequence, and voice. The one unfun grind is the
  mimic-fight stall: 116 failed approaches in a day with no way out is
  tedium, not tension.
- **Winnable:** not on this panel. No full seat, no deed gate opening, the
  muster at 0 on every seed, 3 of 5 villages never starting a plan. The PS4
  arm proves the substrate can ignite and field trios — but the default
  panel's launch decision is still the binding wall, same as r257.

**Gate (adoption re-run from scratch on the rebased tip `144049840`,
worktree `journey2-crisis`, 815s): 339 passed, 5 failed, 0 attributable.**
The 5 are the standing set, all pre-existing and none touched by this run
(which changed 1 line of src/js): the measurement-proof staleness pair
(`test-measurement-proof-update.js`, `test-measurement-workflow.js` —
"Proof source inputs are not current"; proof re-sign round 22 still owed),
the phone-frame stale receipt (`test-phone-frame-proof.js`), and two 120s
deed-attainment timeouts under load
(`test-living-garden-deed-attainment.js`,
`test-one-person-army-deed-attainment.js`). The run's first gate attempt never finished (timed out mid-run after
writing only a 1-line partial log); this complete re-run supersedes it.
Log: `hidden_files/evidence/2026-11-21/journey-crisis-r261-gate.log`.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/crisis.json
--current '.../journey-crisis-r261-delayed-seed*.json' --metrics
defendedFights,playerFights,latelyDefenseCount` — **quiet** (6 files,
3 metrics, no large deviations). No LOUD lines; nothing to investigate.
Baseline NOT rolled on a single panel's variance.

## Metric review (§14)

1. **Wren-bar revision ADOPTED (r257 review 1):** same variant on consecutive
   days, or twice in one day, is a regression; panel totals descriptive only.
   r261 passes the revised bar (0 repeats, 0 duplicates; all 3 variants on
   every seed).
2. **C3b / LINK-ACCEPT instruments fixed to grep driven transcripts** (r257
   review 2–3): both now report from the transcripts. C3b's pattern is still
   noisy — it catches negations ("Nobody's settled it"), votes ("Counted."),
   and topic closers alongside true settlements — but adjudication against
   FAVOR-PROBE state separates them cleanly. Proposal for r262: split the
   C3b pattern into three counters (negation / vote / closer / true) so the
   section reads without a manual adjudication pass.
3. **Settled-help watch pattern misses the real phrasing** (thread 42): the
   broad check found 0 lines while C3b found 2 true settlements ("settled,
   and counted", "that debt, settled"). The watch's pattern needs the
   C3b phrasings added.
4. **POCKET counts lines, not fights:** the 14584 d27 mimic stall (116
   "No path there." in one fight) reads as travel noise in the analyzer.
   Proposal for r262: a fight-stall counter — consecutive "No path there."
   lines inside one fight/day with the same monster telegraph repeating —
   so a stalled fight surfaces as a finding instead of a baseline number.
5. **Telemetry units still open:** `playerFights` and `latelyDefenseCount`
   keys are absent from the per-seed JSONs, so the telemetry verdict rests
   on `defendedFights` only (quiet this panel). The keys need adding to the
   driver census or dropping from the metric list.
6. **Census corpses omit scholar deaths:** the C7b corpse list and the
   deathCleanup firstDeathDay disagree with the say-line death record on
   buried dead (r257 review noted the same). The run note's buried-dead
   names come from the say-line record, not the corpse list.
7. **Muster-growth watch:** 0 dawn muster-growth lines fired on r257 and
   r261 alike — the muster never grew on either panel. The watch stays
   descriptive until a panel grows a muster.
8. **Register-script lesson (carried from this run's registration):**
   `worktree-register.sh`'s branch-exists fallback attaches to a stale
   same-slug branch without checking its base; the script owner should
   verify the attached branch's base is current master, or fail loud.
   (This run fast-forwarded onto master `3235672ad` in its own call; no
   Lane A commit is carried beyond what master already holds.)
9. **"Names, named." driver label** (blemish 1 above): the driven-transcript
   finish label claims names were named even when the game said "No one
   saw." The driver should print the `nameWitnesses` say line (or the
   "No one saw" line) instead of the fixed label.
10. **Favor re-ask vs decline promise** (blemish 2): a decline line that
    promises "won't ask twice" and a favor that re-opens anyway. One of the
    two needs to change; filed for the next fix round, not this run's.

## Base movement at merge

Base master `3235672ad` at registration. During the run master moved twice:
Loop B lever round 0030Z (`7f5693467`: launcheng-b DIAG-NO-GO merged,
pinquaddoor-wide-b NO-GO METRIC-BROKEN held, reseedwide-b GO combined held;
findings #2605/#2619 updated, #2632 new) and Loop A lever round 0015Z
(`f9ed3a851`: lendpool DIAG-GO, fibersupply DIAG-NO-GO, fiberfetch NO-GO
CONCEPT-DEAD; findings #2628/#2590 updated). Adoption rebased
`journey2-crisis` onto local master `f9ed3a851` cleanly (no conflicts);
new branch tip `144049840`; proof test re-run GREEN 7/7 on the rebased tip.

## Closeout

- Rotation: write **7** to `journey-rotation-b.txt` (read 6 at start).
- Lock `playtest-loop-2.lock` deleted last, run_id verified in the same call.
- Heartbeat loop pid 21935 killed at closeout.
- Run note + gate log committed via the worktree's own
  `scripts/safe-commit.sh`; merged `--ff-only` in the main tree; worktree
  released and removed; main tree verified clean.
- **Do NOT bump, push, or verify live** — the ship loop owns version bumps,
  pushes, and live verification. Status at closeout: merged locally,
  pending ship.
