# Journey succession r161 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r161 (next Lane B number after r160 crisis) ·
**Leg:** 7 succession · **Branch:** journey2-succession (fresh branch) ·
**Base:** master ba21ca026 (journey-landing r120 in base) ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-09/journey-succession-r161-prereg.md.

## Standing state

r157-succession LANDED on master (teach-narration dry fix, adopted
2026-11-08 ~06:57 CST; gate 284/6 standing). r160's Phase B (leg 7
succession) never started; the agency dry fix and its instruments were
pending for a future Lane B run — this run is that run. Since r157,
master has taken landing r120 and the sim-winnability rounds.

**Divergence (standing, not this run's to fix):** `git pull --ff-only`
failed at pre-flight — local master ahead 190 / behind 156 vs
origin/master, split at d229b58f5 (last batch ship 2026-11-08 11:29
UTC); origin advanced via Cursor/Codex OVE PR merges directly on
GitHub (tip a628aeaf3, PR #121). Steve's reconciliation direction was
asked Nov 8 ~15:25 CST and is still awaited; the ship loop is blocked
on it (second block, 2026-11-09 ~00:54 CST). This run proceeds on
local master (ba21ca026) as the working line, per the loops' standing
orders — no push, no rebase onto origin, "merged locally, pending
ship". Do NOT re-ping Steve.

## The carried blank, pinned (before any r161 play)

From r157's committed evidence: three agency dries — 33912 d52 Priya
("an old trapline"), 33925 d31 Marvin ("a cellar full of jars"),
33927 d52 Marcus ("a spring that runs clear") — all
agency:ask_field/ask_expedition, all the same fixed phrasing per
place. Mechanism pinned from current-master code, read before play:
the place is SPENT FIRST (`k.places.pop()` in agencyTurn,
villager-agency.js) and the line is one fixed phrasing per place from
a five-string shared pool (villager-agency.js:613); the emission
passes NO options to sayLine, so a second villager sharing the same
place inside the 48-entry run-ledger window is run-blocked and
dry-replaced — while the place is already lost and the 'taught' deed
+ trust +2 have fired. SAYTRACE confirmation from r157's committed
evidence: 33912 trapline entry `"preRun": true, "diegeticAct": false`.

## Before-leg (current master, no fix) — REPRO

Repro seeds 33803/33806/33912, POST_DAYS=70, EARLY_KILL_DAY=40.
Smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25) proves the r161 driver
first (exit 0). Before-leg files preserved in
evidence/2026-11-09/r161-before/ (68 files, md5-verified) BEFORE the
after-leg re-run — the r157 lesson.

- **REPRO (letter, named seeds): NO.** No agency dry reproduced on
  33803/33806/33912 — agency place lines SPOKE (Stan "an old
  trapline" d+15 + "a ridge with a view for miles" d+7; Elif "a
  cellar full of jars" + "an old trapline" d+7, both in one sitting).
  Zero "lost my train" lines in any repro transcript; sayTrace
  empty on all three seeds (the wrapper records only blocked
  lines). The repeats were different places or spaced beyond the
  window. Per the r147 rule the turns drop out of the denominator,
  recorded, NOT re-scored.
- **REPRO (wild, smoke seed): YES.** The smoke seed 33998 — run on
  unfixed code before the fix — DID reproduce the defect: d+14
  DeAndre, "What did you see out there?" → "...Sorry, lost my train
  of thought." SAYTRACE: pick agency:ask_expedition, key the
  trapline place line, `"preRun": true, "diegeticAct": false`,
  site villager-agency.js:1019 (the unfixed sayLine call). A fourth
  wild instance (Badr d49, Dwayne d+14, Priya/Marvin/Marcus d52/d31
  before it). The defect is live on current master, not just a
  proof-test artifact.
- **REPRO (mechanism): PASS** — reproduced deterministically by the
  proof test (below): RED on unfixed code, 3 failures, B's narration
  drying while the place was spent. The fix decision rests on the
  mechanism (the r155 precedent).

## The fix (src/js/villager-agency.js, +14/-1)

One call-site change + comment, the r86/r157 shape: in agencyTurn,
pass `{ diegeticAct: true }` to sayLine when speaking the agency
PLACE line (`placeAct = !!taughtPlace`). The place line is a
diegetic act — the place was already spent and the deed fires on
it — so it rides the exemption the skill lessons and plant-teaches
already carry. Two villagers telling you about the same real
trapline is the same lesson from another person, not a parrot bug.
Monster/plant lines cannot collide (codex-deduped), so only the
place branch is exempt; the generic "too many joints" line is NOT
exempted (no consequence rides on it — a dry there falls honestly
to the closers). No ledger, trust, RNG, gate, deed, wave, or table
change.

## Proof test (scripts/test-journey-succession-r161-agency-dry.js)

3 cases, each in its own process (r157 structure): agency-blocked,
agency-control, agency-window. Staging writes state directly (both
villagers know the same place / different places; no teachable
plants, no fought monsters, no explorer news; trust 50);
Math.random is pinned to 0.1 during startConvo/convoTurn.
- GREEN on fixed code (ALL GREEN, 25 checks, full run).
- RED on unfixed code (verified before the fix was written:
  agency-blocked fails 3/3 defect-sensitive assertions: B's
  narration dries with "...Sorry, lost my train of thought." while
  places[B] is already spent; controls pass on both).
- r146 + r147 + r151 + r155 + r157 proof tests re-run GREEN on the
  final tip (ALL GREEN each).

## After-leg (fixed code, same seeds) — VERDICTS

- **AGENCY-DRY CENSUS: PASS.** 0 dry lines at agency turns
  attributable to the agency place line across ALL driven
  transcripts on the after-leg + panel seeds (11 seeds). The only
  dry line in the whole after-leg + panel corpus is the pre-fix
  smoke transcript (preserved in r161-before/); the smoke seed
  re-run on fixed code speaks the trapline line (see below).
- **Wild confirmation (same seed, fixed code):** smoke 33998 re-run
  after the fix — DeAndre d+14 "What did you see out there?" now
  answers "an old trapline — I'll show you on the map sometime.
  It's real." Zero "lost my train" lines in the re-run. The wild
  dry is fixed in the wild, not just in the fixture.
- **TEACH-DRY CENSUS: PASS.** 0 teach-narration dries across all
  driven transcripts (68 "You show them <plant>" narrations spoke;
  none dried). The r157 fix holds.
- **OPENER-DRY CENSUS: PASS.** 0 dry lines at conversation open
  attributable to the trade-seed line or a link-raise opener line.
  The 2 sayTrace fellBacks on the panel (33933 Tariq d106, 33934
  Marthe d57) are nonverbal foreign-language opens (Hindi/French
  keys, pick null) whose RETURNED text is the gesture fallback
  ("They spread their hands, smiling — the words are missing, but
  the meaning lands anyway.") — the r81 designed fallback, working
  as designed, not a dry line. Classification per the r157 metric
  review (adopted this run): the returned text decides, not the
  fellBack flag.
- **DRY CENSUS (revised, adopted this run): PASS.** 0 dry lines at
  ask/details turns attributable to a favor whyLine, however
  delivered (engageBeat OR dlg:details). The Manaia-class water
  whyLine dry did NOT recur: Niamh d+15 (33933) answers "Tell me
  why you need this." with live counts ("9 liters... We walk
  together and each carry two liters back") via dlg:details, and
  the wound whyLines (Stan d+3, Katarina d+14) speak. No water
  whyLine fix is owed this run.
- **CAP-NC REGRESSION: INSUFFICIENT-DATA (denominator short, not a
  miss).** Fresh band 33931–33938: 1 eligible (33937 Zlata,
  bonded-by-deadline 1/1). Non-denominator: 6×
  second-handoff-before-deadline, 1× village-ended-before-deadline.
  Descriptive bondedEver: 7/8 probe-opened panel seeds; all-seeds
  (repro + panel) 3/3 eligible bonded — the analyzer's PASS line
  over all 11 seeds is a mechanical artifact of including repro
  seeds; the binding verdict follows r157's method (fresh band
  only). The dialogue-only fix cannot move the capacity
  denominator; leaving it unmerged over a denominator shortfall
  would strand a proven fix (the r155 merge call, same shape).
- **SELF-REQUEST REGRESSION CHECK: holds.** selfReqDayEntries == 0
  on every seed (total 0; r133 purge intact).
- **CARRIED: hold.** Pick-time rank == 1 on every first handoff
  with npcCalls (11/11 seeds); funeral INCALL beat present on
  every leg death (11/11).
- **Controls:** the Paisley deflect_q control dry recurred and
  reads identically before/after (33803 d+3 Paisley: "Okay."
  Something shutters, just slightly.). The Lorenzo/David control
  dries did not recur — dropped per the r147 rule, recorded.
  After-leg JSONs are byte-identical to before-leg on all 3 repro
  seeds (transcripts, tele JSONs, stdout JSONs). The fix changes
  zero trajectories on these seeds (no dry fired before, so the
  exemption never engaged).
- **PEOPLE CHECK (sense):** 8 d+14/d+15 transcripts read in full
  (one per panel seed) + the repro agency transcripts. Conversations
  have meaning: real wants (water hauls with live counts, wound
  care with stakes, "I dream in recipes now"), real grief (Onni's
  headcount of 8 dead; Pearl "gone and the world just...
  continues"), real consequences (Katarina digs up a buried bundle
  — +1790 kcal to the pantry; Onni refuses to re-confess a lie
  twice), the party naming ("The Company"), nonverbal conversations
  that work (Marthe's French, Fernando's Spanish — "Water?", "¿Tienes
  comida?"). The agency turns all speak. No new filler, no line
  promising a need that isn't there.

## New findings (reported, not fixed — out of prereg scope)

- **Nonverbal gesture fallback repeats verbatim (r157 descriptive
  carry, still true):** one fixed line ("They spread their hands,
  smiling...") opens every repeat sitting for a foreign villager.
  Working as designed (r81), but the identical sentence across
  sittings is the fallback's own repetition, not the villager's.
  Descriptive only.
- **Confrontation refusals escalate honestly:** Onni (33935) asked
  three times about the same lie answers twice with rising
  tiredness, then refuses the third ("We went over this") — the
  repeated-confront path does not loop filler. Descriptive only.
- **m3 echo:** not re-measured this run (no m3 bar in the prereg);
  the r155 note (echoMentions=1, bar ≥2) stands as descriptive.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. The check
LOUD-flagged deaths.bearer <redacted> census.fallen (12 files, smoke
included). **Diagnosis: summation artifact (known, r151/r155/r157).**
Per-seed means on the 11 leg seeds (smoke 33998 excluded):
deaths.bearer 7.73, census.alive 4.09, census.fallen 12.82,
census.integrationStage 3.00, week2.deadBearerMentions 5.09 — against
baseline 7.6 / 3.8 / 14.3 / 3.0 / 4.2. Deaths +1.7% (noise), alive
ABOVE baseline (good direction), fallen BELOW baseline (good
direction), stage exact, mentions +21% driven by one outlier seed
(33936: 13 mentions; median is 4). No real deviation; baseline NOT
rolled forward.

## Village assessment (plain words)

The succession leg works on current master: the mantle passes on all
11 seeds (7 organic first deaths, 4 scripted; chains up to 13 bearer
deaths on 33932), newcomers arrive (54 across the panel) and bond
(7/8 probe-opened panel pairs bonded ever; the one eligible pair
bonded by the deadline), and the village talks like people — a
villager with a place to show you no longer loses the thread, and
the fix changes nothing else: the same seeds play byte-identical
before and after. 8/11 villages reached the horizon with 1–9 people
alive; 3 died out (33932, 33935, 33937 with 0 left). The villages
run down over the 70-day window, which is the leg's shape: the
bearer dies early by design and the village runs down. Nothing in
this run changes a gate, deed, wave, or table rule (freeze stands).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree → **292 passed, 8 failed in 996s** (gate log
evidence/2026-11-09/journey-succession-r161-checkquick.log). The 8
are 6 STANDING (same as r157: measurement-proof-update +
measurement-workflow — retained neutrality proof stale, refresh owed
at ship; mobile-combat-cadence; occupation-panels CLI workflow;
phone-frame-proof retained receipt stale; establishment-r20 voices
gate) + 2 LOAD TIMEOUTS (test-trust-observer-neutrality and
test-capable-bot-20261014, both killed at the 120s per-script cap;
the gate took 996s vs r157's 419s under sibling-loop load). Both
timeouts re-run standalone GREEN (neutrality 6/6, capable-bot 40/40,
exit 0). No new attributable failure.
Proof test scripts/test-journey-succession-r161-agency-dry.js re-run
standalone on the tip: ALL GREEN (exit 0).

## Rotation

7 → 4 (endgame next). [Advance at closeout; verify the file reads 4.]

## Metric review

- Canon note: no canon doc covers mantle/bond formation
  specifically (r127's standing note, unchanged). Governing rules
  used: ledger.js "successor: the village chooses. Trust decides";
  party-bond.js "v.bonds built by meals/visits/feasts, +6/pair/day
  cap, no bonds with the dead or gone"; CONVERSATIONS.md structural
  contract ("The repeat ledger must not replace a successful
  promise with 'lost my train of thought.'"); CANON.md "No silent
  actions". Nothing invented, nothing changed.
- The mantle 2-day latency owed item (r112 landing note) is still
  open and is NOT this run's question; it stays carried.
- The Badr d49 / Dwayne d+14 / Priya d52 / Marvin d31 / Marcus
  d52 / DeAndre d+14 agency dry (villager-agency.js) is FIXED this
  run — the r157 carried question is answered, not carried further.
- **DRY CENSUS revision (adopted this run):** the bar now counts
  favor-why answers however delivered (engageBeat OR dlg:details).
  It passed on its first outing under the revised reading (Niamh
  water whyLine spoke via dlg:details). The revision stands; no
  further change proposed.
- **OPENER-DRY classification (adopted this run):** the census
  reads returned text, not the fellBack flag (2 nonverbal gesture
  fallbacks correctly excluded). The classification stands.
- CAP-NC denominator: the fresh band yielded only 1 eligible seed
  again (second handoffs dominate: 6/8 panel seeds). If the next
  run wants a decisive CAP-NC verdict, it needs a longer panel or a
  band with earlier arrivals — a prereg question, not a re-score.
  The all-seeds 3/3 bonded is descriptive evidence the channel
  holds when the denominator exists.
