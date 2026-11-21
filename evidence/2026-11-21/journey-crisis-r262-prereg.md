# Journey crisis r262 — PREREGISTRATION (Lane B, leg 6)

**Status: FROZEN. This run (`playtest-loop-2-20261121T1555Z`, scheduled Sat
2026-11-21 10:00 CST / 16:00Z) plays crisis (6) on seeds 14591–14595 per
this prereg. Base master `237ad3c53`. Rotation-b read 6 at run start; this
run writes 7 at closeout. The r261 panel (seeds 14581–14585, base
`3235672ad` + dodge fix on branch) went GO on every binding bar, with the
strongest people check this leg has read — and one new gameplay finding
(the radio-mimic fight stall, 116 "No path there." in one day) plus seven
filed blemishes. This run is the fix round for three of those blemishes
plus a confirm panel for the new live landings on the new base.**

## Run-state handoff (r262, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  15:55:17Z, run_id `playtest-loop-2-20261121T1555Z`.
- Pre-flight: main tree clean at 15:55Z (`git status --short` empty).
  Disk 46%. `git pull --ff-only`: already up to date (tip `237ad3c53`).
  `worktree-reap.sh`: exit 0, removed nothing; 11/16 active, LOUD list
  of dirty sibling trees (not mine to touch).
- Registration: `bash scripts/worktree-register.sh journey2-crisis`
  took ~6.5 min (registry flock contention, same as r261's ~9 min saga).
  The `journey2-crisis` branch did NOT exist (r261 adoption deleted
  it), so no stale-branch fallback risk this run. Worktree at master tip
  `237ad3c53`, verified clean. Heartbeat immediately after; a 5-min
  hbloop runs detached (`setsid nohup`, pid 113588).
- Rotation: reads 6 (crisis). The social r261 adoption (15:33Z) wrote
  5→6; r261 crisis's own closeout claim of writing 7 did not persist
  (file read 6 at this run's start) — the rotation now stands at 6 and
  this run plays crisis and writes 7.
- Canon read: CANON.md + DISEASES.md read in full by r247/r251/r253;
  `git log 3235672ad..237ad3c53` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r247's canon read stands unchanged.

## Base movement since r261's panel base (3235672ad -> 237ad3c53) — classified

63+ commits. Canon unchanged (see above). Net src diff: 8 files,
+617/−15 — but most of it is env-gated or reverted churn; the live
surface is small (verified by per-commit `git log -- <file>` + full
net-diff read, not commit messages alone).

LIVE (behavior changes under the default panel):
(a) **DODGE-ARTICLE (`144049840`, r261's own fix, game.js +9)** — the
    net game.js diff vs r261's base is ONLY this hunk: `dodged the the`
    → articlePhrase. Already confirmed by r261's panel (0 doubled
    articles, 16 dodge lines); re-confirm on this panel (thread 40).
(b) **DOWNEDTWICE (`f11b30882`, fieldFights.js +11/−2)** — finding
    #2634: a downed ally is never re-targeted (pick indexes _liveAllies),
    and 'goes down' fires only on the live→0 transition (_hWasLive
    guard). LIVE. Watch: a 'goes down' line firing twice for the same
    ally in one fight is a REGRESSION of the #2634 fix (thread 46,
    binding — new R262 DOWNEDTWICE analyzer section, validated on
    r261's pre-fix corpus where repeats are expected).
(c) **M12-CAP (`a3fe07b25`, succession r262, convo-dialogue.js +21,
    conversation.js +3)** — the "We're going in circles" escalator is
    capped per block-reason per sitting (latch
    _favorReqCirclesServed, reset with the convo object each sitting).
    The old code reset _favorReqEscalations to 0 after the spend-out,
    so the next repeat re-served the circles line as long as the
    player kept pressing (r260 Ines d27: three-times 3x in one
    sitting). LIVE. Watch: a second circles line for the SAME reason
    in one sitting is a REGRESSION of the r262 fix (thread 47,
    binding — new R262 M12 analyzer section, grouped by the rawReq
    text inside the line).
(d) **RAISE-OPENER VARIETY (`36d694f13`, scale r248,
    bond-initiation.js +69)** — raise openers vary by lore-how
    [needs-eyes]. LIVE dialogue. Watch (descriptive): raise openers
    vary; a verbatim-identical raise opener 3x+ in one sitting
    graduates to a fix item (thread 48).
(e) **THIS RUN'S OWN FIXES (on the branch, before the panel)** —
    see "Fix round" below. The panel runs WITH these fixes, same
    pattern as r253's fixes under r257's panel and r261's fix under
    its own panel.

ENV-GATED (inert under the default panel — read the gate in code, not
the commit message, per r257 metric review 16):
(f) **PLANRESEED (`ef2cf64c2` + `9145db1ef`, win-plan.js +450,
    villager-brain.js +44, fieldFights.js hooks)** — dead-target
    re-seed + the 'new trail' launch beat (finding #2632). Env-gated
    default-OFF (`PLANRESEED=1`); the fieldFights sighting stamps are
    no-ops with PLANRESEED unset (method itself flag-gated). Any
    'new trail' / reseed / planReseeds counter movement on the
    default panel is an env-gate failure, FAIL LOUDLY (thread 45,
    extended).
(g) **PROFILEGATE4 (`84e57fcc3`, win-plan.js)** — scoped profile-gate
    relaxation for wave-4+ plan holders, `PROFILEGATE4=1`, OFF by
    default (browser: process undefined → off). Any profilegate line
    on the default panel is an env-gate failure, FAIL LOUDLY
    (thread 45).
(h) **PARTYSIZE4 / VETREENGAGE / FLEEREPAIR2** stay env-gated OFF
    (main panel). PS4 side-arm only (see below).
REVERTED (net zero — hash-verified by their own reverts; net game.js
is only the dodge fix, net fieldFights.js is downedtwice + the inert
reseed hooks): M1RANGE (`81bbbf467` + revert `293d1e794`),
SHAPE2 (`e7f9215f8` + revert `68628f63a`), M2STEP2 (`c78b0e48b` +
revert `fdad36c23`), LEADSIDE (`a53ad393a` + revert `d0619c33e`),
EVADEBOW / DEPMAT / ROLL35 / AMMO substrate churn
(`63dc9fb59`/`85e68ebad`/`37bbe861b` re-lands +
`5927db0bf`/`620a2fc56`/`80f716984` reverts), FIBERFETCH
(`90ba06a29` + revert `6331a09c7`). Instruments only; nothing live.
Inert: all sim-* diagnostics + evidence-only commits, round records,
ship version bumps (build.js only), journey r247/r248/r260/r262/r263
evidence + run notes + gate logs. No medicine-lever commits: the
levers from the 2026-11-13 medicine brief have NOT landed (Steve
ruled 2026-11-14 the trio needs more complexity). RUINROAD stays
parked (cumulative 2/321, proven constraint).

## Fix round (r261 blemishes — this run's own work, proof-tested first)

1. **UNREACHABLE-FLEE (r261 new finding: radio-mimic fight stall).**
   Root-caused from the r261 corpus (seed 14584 d27, 382 sayLines):
   the breach fight's mimic ends reveal-phase across unpathable ground
   (barrier-crossed fight; `findPath` returns null for every tile
   adjacent to it) while its own rush breaks on the first failed
   `tbStepToward` — "Static shrieks — it lunges for the voice it
   stole, and finds only air." The competent policy (`oracleV2`
   v2Fight) retries the same failed close every turn — `tbPlayerMove`
   → "No path there." → endTurn — with no stuck counter and no
   disengage rule, so the fight burns the whole day (116 failed
   closes) and never resolves. A real player can walk off the board
   edge (the player crossed a barrier mid-fight on d27), so the
   defect is the POLICY's missing disengage, not a game softlock —
   the game-side stall-breaker is a follow-up, not this run.
   Fix (policy, `scripts/policies/oracleV2.js`): in v2Fight's
   out-of-range branch, track consecutive turns where the player's
   position is unchanged AND the target stays out of weapon range
   after the attempted close; at 3, `flee('unreachable')` (the
   existing barrier-exit flee). The counter resets on any successful
   move, strike, ability, or new fight. A player who cannot move for
   3 straight turns while out of range is stuck — fleeing is the
   competent response. Known limitation (filed, not fixed here): the
   policy still lacks a staged approach for distant-but-pathable
   targets (it only ever targets the monster-adjacent tile);
   "Too far" turns also increment the counter, so a far target the
   policy never stages toward will also flee at 3 — acceptable for a
   stall-breaker, and the panel instrument measures it.
   Proof test `scripts/test-journey-crisis-r262-unreachable-flee-20261121.js`:
   mock tb fight (real game via harness), monster out of range,
   `tbPlayerMove` stubbed to return false (no path); assert the
   policy does NOT flee on turns 1–2 and DOES flee
   (`ctx.fled_unreachable === 1`) by turn 4; control with a real
   pathable close asserts the player moves and never flees.
   RED (no flee on a stubbed-unreachable fight) → GREEN after.
2. **DEFLECT-PROMISE (r261 blemish 2: favor re-ask contradicts the
   decline line).** The decline (`convo-wants.js` deflectBeat) speaks
   three narrator-asserted never-again promises — "They'll just stop
   asking", "They won't raise it again", "They won't ask twice. That
   much is clear" — while the re-ask path (RE-ASK VARIETY, sociallife
   2026-10-11) deliberately re-asks a live need ("I hate to ask
   twice, but it's still open"). The re-ask is the intended behavior
   (a need that never re-opens can never be met later); the decline
   line is the liar — and it is narrator assertion, not the NPC's own
   breakable promise. Fix (game, `src/js/convo-wants.js`): soften the
   three variants to promise only the moment, not forever ("They'll
   let it rest — for now", "the subject is closed. For today,
   anyway", "They won't press it. Not right now"). The re-ask lines
   are untouched.
   Proof test `scripts/test-journey-crisis-r262-deflect-promise-20261121.js`:
   drive deflectBeat across all three variants (convoPickCycle) and
   assert none contains a never-again promise
   (/won't ask twice|won't raise it again|stop asking/); assert the
   re-ask variants still fire for a live need (behavior preserved).
3. **RESUME-QUOTE-KIND (r261 blemish 5: recall label imprecision).**
   Suarni 14583 d48 resumes a `want` thread planted d39 under wound
   care (heal_help, fulfilled) with the label "that foraging help" —
   the ledger favor changed to forage_help, and `convoOpenThreadLabel`
   re-derived (r228, correct) — but the opener still quotes the
   thread's d39 snippet ("Let me sit with all that. We'll pick it up
   later."), which belongs to the wound conversation. Label and quote
   disagree about which favor the thread is. Fix (game,
   `src/js/conversation.js` convoResumeOpener): when the re-derived
   label names a favor kind DIFFERENT from the stored label's kind,
   drop the quoted snippet (the thread still resumes — label +
   whyLine — exactly like the existing R17/R18/R19/R20 quote-drop
   guards in the same function). The r228 behavior is preserved:
   the opener still names the CURRENT favor (C3c holds); only the
   stale quote drops. Control: favor unchanged → quote kept.
   Proof test `scripts/test-journey-crisis-r262-resume-quote-kind-20261121.js`,
   modeled on the r228 staging (`test-journey-crisis-r228-c3c-stale-favor-20261116.js`):
   plant want thread under wound care with a wound snippet, change
   the favor to the villager's live need, advance 5d, assert the
   opener names the NEW favor label AND does not contain the wound
   snippet; control (favor unchanged) asserts the quote is kept.
   The r228 test itself is re-run GREEN as the guard (its cases 1–5
   must still pass: label still re-derives; quote-drop touches no
   assertion there).
4. **DRIVER-LABEL "Names, named." (r261 blemish 1, TIME-PERMITTING,
   after fixes 1–3).** Every witness pick prints `NPC: Names,
   named.` in the driven transcript, but the game's own sayLines
   answer honestly ("No one saw Sanne leave."). `betrayal.js:4665`
   calls `nameWitnesses` (speaks the real line) then returns
   `finish('Names, named.')`, which is what the transcript records.
   Fix in the DRIVER (not the game): record the `nameWitnesses` say
   line (or the "No one saw" line) instead of the fixed finish
   label. If the driver hook is not located cleanly in this run, it
   stays a carried driver item — it is a label, not a game defect.

NOT this run: "Gulsara's Drawing" daily repeat (blemish 7 — pool /
cooldown investigation owed, no fix without it); verbatim repeat
decline (blemish 3) and stock exit repeat (blemish 6) — pool
variety, carried; thin sitting (blemish 4) — carried; the
closing-line duplication defect (deepening r248: closing line ==
first winddown line verbatim) — owned by the conversation build
arm, watched here only; the game-side fight stall-breaker —
follow-up to fix 1, filed, not built here.

## Leg question (carried from crisis r261, updated for the base)

**Do r253/r257/r261's verdicts hold on the new base — march-refusal
dedup, antler articlePhrase, dodge articlePhrase, growth-line cooled
call, gossip-ask dry fix, TRAIL 3-press, want-menu wind-down,
witness-mourn — do the new live landings read honestly (downedtwice
once-per-fall, M12 circles cap, raise-opener variety), do this run's
three fixes hold in the wild (unreachable flee ends stalls,
decline lines stop promising forever, resume quotes stop quoting a
dead favor), and does the PARTYSIZE4 substrate still reach the
crisis band?**
Threads (r261's 1–45 carried; updates noted; new 46–49):
1–3. DRY3 / DRY2 / R238-DRY CONFIRM (binding): 0 dry lines on the fixed
   surfaces. NEW surface this run: M12-cap (r262 fix) — any dry line
   there is a REGRESSION of the r262 fix. F8 confide gate, maps-pool
   compare_maps — any dry line there is the next fix item, named in
   the run note.
4. C3b SETTLED-FAVOR CONFIRM — SEVENTH WILD PANEL for the r240 fix:
   a broken favor whose need is still live must NEVER be called
   done/square/settled. Instrument SPLIT this run (r261 metric review
   2): the R262 C3b-TRANSCRIPT section reports four counters
   (negation / vote / closer / true) so the section reads without a
   manual adjudication pass. Adjudicate the TRUE hits in the run note
   with pantryPer from the per-seed JSON. Any false settlement is a
   REGRESSION of the r240 fix. 0 served is a coverage note.
5. C3c CLOSED (r228). Any resume opener naming a favor that changed
   since planting is a REGRESSION of the r228 fix. The r262
   resume-quote fix preserves this: the opener still names the
   current favor.
6. C3d CONFIRM (binding): a "Nothing important" recap with live
   business is a REGRESSION of the r231 fix.
7. NODEAWAY PANEL METRIC (tracked, no bar): r261 20 total, worst 6;
   r257 13 total, worst 7; r253 15/6/worst-5 (matched band); r247
   15/6/worst-5; r244 15/6/worst-5; r241 11/6/worst-3; r240 19/10/worst-4.
8. FUNERAL-MEND CONFIRM (r216 F1): any over-claim line is a REGRESSION.
9. STAGE-0 SURFACING WATCH (descriptive): a second sitting with dlg:help
   never offered graduates to a fix item.
10. DEATHCLEANUP WATCH (measurable): any dead-holder winPlan entry
    lingering at census is a FINDING; planSeeds == 0 with entries present
    is a FINDING.
11. NONDEATHPLAN WATCH (descriptive): any winPlan entry for a removed
    villager lingering at census is a FINDING.
12. TITAN-REFUSAL CONFIRM (binding): refusal lines per titan per day ≤ 1
    (r233 fix) AND spoken "you have N" equals the gate count (unique
    living allies + committed Haven blades — F2 fix). Proof re-run on
    this base: 15/15 GREEN (see below).
13. DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled'
    about a settled favor while a live need waits is a REGRESSION of the
    r231 fix.
14. HOMEBODYVOICE + NOTICKDEFER: descriptive-only (retired r241; vacuous
    expected).
15. TRIODROUGHT WATCH — main panel expects 0 by construction (PARTYSIZE4/
    VETREENGAGE gated OFF); the discriminating read is the PS4 side-arm.
16. REL-MOURN WATCH (descriptive): any mourning line wearing a wrong name
    is a REGRESSION of the r231 fix. NEW: r258 self-witness fix — a
    witness line in the ambush path must name a speaker who actually saw
    the latest fresh dead fall; a witness line from a non-witness is a
    FINDING (thread 43).
17. MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines — fire,
    name the right fire/commit? r261: 0 fired (muster never grew).
18. HOLDERVoice WATCH (descriptive): holder-half vs companion lines per seed.
19. POCKET WATCH (descriptive): fights with ≥3 stuck turns; bar 0 (r144).
    NEW this run: the R262 FIGHT-STALL section (thread 49) is the
    binding read on stalls; POCKET stays the travel-noise baseline.
20. TRAILTALK WATCH (descriptive): see thread 36 (3-press fix live).
21. FIGHT-1 WATCH (descriptive): okSorties / cleared / multiMonsterCleared
    vs r261 (main panel analyzer table); a cleared fight-1 with vTaken
    >= 70 is the standing Q4 live-play confirmation trigger (r261 max
    56, not fired).
22. FLEEREPAIR3 / WILDAVOID: STILL UNMEASURED — no instrument exists. Do
    not judge them.
23. CRISIS REGRESSION (descriptive): raids, gorge nights, sorties, favors,
    mourning fire on ordinary seeds; villages bend or break the same way.
    r261 fresh band: 3/5 horizon (hunger wall, not a regression); r257:
    4/5 horizon; r253: 2/5 horizon, 3/5 game-overs in the 130s–140s.
24. R244-FIX RE-CHECK (binding): mime variant rotation across days; Wren
    note variety. Same-variant mime 3 days running is a REGRESSION of the
    r241 mime fix. **Wren-note bar (revised r257, adopted r261):** the
    SAME variant on CONSECUTIVE days, or the same variant TWICE in one
    day, is a REGRESSION of the r241 Wren fix; panel totals are
    descriptive only. Doubt-stonewall 3x+ VERBATIM in one sitting
    graduates to a fix item. Voted case re-appearing under a new number;
    resume-opener quote SPLIT across two entries — watch both.
25. WALKHOMe WATCH (descriptive): any homeward travel that strands, loops,
    or narrates an unclearable refusal is a FINDING.
26. TABLEACTIVE WATCH (descriptive): any mercy/table line is reported, not
    judged; expected vacuous.
27. DOOR-GUARD WATCH (descriptive): any door-tile fight eject is a FINDING;
    fledBad firings named by day + monster HP.
28. LINK-ACCEPT ECHO WATCH (binding): any accepted raise talk still serving
    '"All right — let's ask them."' is a REGRESSION of the r243/r148
    link-accept fix. Analyzer greps the DRIVEN transcripts (R262
    LINK-ACCEPT-TRANSCRIPT section). This is the EIGHTH panel; 0 served
    again is a coverage note, and the ECHO question stays open.
29. WANT-BRIDGE WATCH (binding): any want-bridge repeat inside one sitting
    before 11 bridges is a REGRESSION of the r146 pool widening.
30. SENSEEXPED LAUNCH WATCH (descriptive): launches per seed vs r261; any
    launch naming a companion whose expedition never existed is the mirror
    gap — FAIL LOUDLY.
31. AMMO-NAMING WATCH (descriptive): any field-fight 'no X' line naming the
    WRONG ammo for the weapon is a REGRESSION of the #2593 fix.
32. BOWCRAFT WATCH (descriptive): bows/armed counts per seed vs the
    bowcraft arms (attempts 54, bows 15 on band 107011–107018); any
    bowcraft-duty villager with no bow after a full season is a supply
    observation, not a bar. BOWKNOW is env-gated OFF — no mentoring
    lines expected; any bowknow teach line on the default panel is an
    env-gate failure, FAIL LOUDLY.
33. MARCH-REFUSAL CONFIRM (binding): the Commercial Break march gate says
    its refusal line at most ONCE per muster-day (r253 fix). Count refusal
    lines per muster-day in the panel transcripts; >1 on any day is a
    REGRESSION of the r253 fix. The refusal itself still stands on every
    attempt (return null) — a refused attempt with no line on a fresh day
    is also a FINDING. Proof re-run on this base: 7/7 GREEN (see below).
34. ANTLER "THE THE" CONFIRM (binding): any antler-thrash line reading
    "The The <name>" is a REGRESSION of the r249/r253 fix. Proof re-run
    on this base: 7/7 GREEN (see below). The R262 DODGE-ARTICLE analyzer
    section covers both the antler and the dodge line.
35. GROWTH-LINE WATCH (descriptive): dawn growth lines under the r245
    cooled call — the line must name the act actually taken, not a cooled
    one. A growth line naming a cooled act is a REGRESSION of the r245
    fix.
36. TRAIL 3-PRESS CONFIRM (binding): any verbatim trail-talk repeat 3x+
    in one outing is a REGRESSION of the r256 TRAIL 3-press fix.
37. WANT-MENU WIND-DOWN WATCH (descriptive): want-menu react lines under
    the r246 wind-down fix — a react line firing after its want wound down
    is a FINDING.
38. WAR-PATH NAME WATCH (descriptive — open defect from endgame r255):
    full-seat war-path lines naming nonexistent monsters ("The Big Thing",
    "Big-Bane", "Big Ugly") instead of actual kills. Any such line on this
    panel is the same defect class, named in the run note for the next fix
    round.
39. COUNTER-LABEL WATCH (descriptive, carried from r253 review 15): any
    counter line using a comma-carrying display name as the noun is a
    REGRESSION of the 9fb55be89 fix; the r244 panel's fired set
    (belltoad/dustboar/rut_king) is the reference.
40. DODGE-ARTICLE CONFIRM (binding): any dodge style line reading
    "dodged the the <attack>!" is a REGRESSION of the r261 fix. The R262
    DODGE-ARTICLE analyzer section scans all sayLines; r261's panel
    showed 0 doubled articles (16 dodge, 17 thrash). 0 dodge lines
    served is vacuous-explained.
41. WARN-HEED WATCH (descriptive): first heed of a warn_you want
    speaks the warning (r150 live). A heed that stays silent is a FINDING.
42. SETTLED-HELP WATCH (descriptive): settled-help lines name the
    favor they settle (r247 live). A settled-help line naming no favor,
    or the wrong favor, is a FINDING. Pattern EXTENDED this run (r261
    metric review 3): the C3b phrasings ("settled, and counted",
    "that debt, settled") are added to the watch.
43. SELF-WITNESS WATCH (descriptive): see thread 16.
44. DODGE/CLOSE NO-PATH WATCH (descriptive): dodge/close no-path
    lines under the r149 fix — any such line is a REGRESSION of the r149
    fix. Goal-bridge pool lines reported, not judged.
45. ENV-GATE WATCH (binding): any LEND/GUNRATE/CELLGATE/BOWKNOW line
    on the default panel is an env-gate failure, FAIL LOUDLY.
    EXTENDED this run: any 'new trail' launch-beat line, any
    planReseeds/planExpiries counter movement, any PROFILEGATE4 line
    on the default panel is an env-gate failure, FAIL LOUDLY.
46. DOWNEDTWICE CONFIRM (binding, NEW): a 'goes down' line firing
    twice for the same ally in one fight is a REGRESSION of the #2634
    fix. The R262 DOWNEDTWICE analyzer section counts 'goes down'
    lines per (fight, ally name); bar 0 duplicates. Validated on
    r261's pre-fix corpus, where repeats are expected (the fix was
    not in that base).
47. M12-CAP CONFIRM (binding, NEW): a second "We're going in circles"
    line for the SAME block reason in one sitting is a REGRESSION of
    the succession-r262 M12 cap fix. The R262 M12 analyzer section
    groups circles lines by their rawReq text within each driven
    transcript (sitting); bar 0 same-reason repeats. Different
    reasons in one sitting are honest (one cap each) and do not count.
    Validated on r261's corpus, where the r260 Ines shape (3x same
    sitting) is the reference — repeats there are pre-fix baseline.
48. RAISE-OPENER VARIETY WATCH (descriptive, NEW): raise openers vary
    by lore-how (scale r248 live). A verbatim-identical raise opener
    3x+ in one sitting graduates to a fix item.
49. FIGHT-STALL CONFIRM (binding, NEW): a day with ≥10 "No path
    there." lines is a STALL-DAY — the fight never resolved, the
    policy kept retrying a failed close. Bar: 0 stall-days on the
    panel. The R262 FIGHT-STALL analyzer section reports per-day
    no-path counts (max + the stall-day list). Validated on r261's
    corpus, where it must flag exactly the known stall (14584 d27,
    116) and the smaller 14582 d123 shape (26). With fix 1 (flee
    after 3 failed closes), a stall-day can only survive if the
    flee itself cannot move the player (pocketed) — any surviving
    stall-day is a game-side geometry finding for the next round,
    named with its seed/day.

NOT this run: the RUINROAD forced-search arm (cumulative 2/321, proven
constraint; Steve 2026-11-01 rebuke). The supply question lives with the
medicine build brief. M4-SPLIT is a social-leg instrument (r260 GO at the
bar, 12); the crisis analyzer does not report M4 counts, so it is not
judged here.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band **14591–14595**. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) plus goal hidden_files `evidence/2026-11-*/` `*.md` — zero
  hits for any of 14591, 14592, 14593, 14594, 14595. Forbidden bands
  named in preregs (73641–73648, 73671–73678; 99201–99208; 78201–78208;
  99351–99358; 99401–99412): no intersection. Collision notes (carried):
  14581–14585 r261. 14571–14575 r257. 14561–14565 r253. 14551–14555
  r247. 14541–14445 r244. 14531–14535 r241. 14521–14525 r240.
  14511–14515 r238. 14501–14505 r230. 14491–14495 r229. 14481–14485
  r228. 14471–14475 r223. 14461–14465 r216. 14451–14455 r208.
  14441–14445 r201. 14431–14435 r192. 14421–14425 r182/r186.
  14411–14415 r181. 14401–14405 r180. Band is fresh.
  (Verified by grep at run start; r257's third-check method reused.)

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14591–14595,
  sequential. PILOT FIRST (§9): seeds 14591–14593 run first; the panel
  expands to 14594–14595 only if the instrument holds (smoke green, no
  instrumentErrors, stranger counters populating). If the pilot shows 0
  alien kills on all 3 seeds, that IS a finding about the channel's rate
  (not an instrument failure) and the expansion still runs.
- Smoke first: SEED=14591 DAYS=5 into the r262 evidence dir, driver runs,
  no instrumentErrors, stranger counters present.
- Driver: r261 driver (`scripts/journey-crisis-r261-delayed-20261121.js`)
  verbatim EXCEPT r262 filenames/paths/seeds (14591–14595), ORIGINS map
  keys (Seattle/Boston/Austin/Chicago/Phoenix keyed to all five r262
  seeds), EVID path 2026-11-21, DAYS 150, prereg path. PANTRYPER
  instrument (roster on pantryDaily) carried. Verified by diff: only
  renames, dates, seed/ORIGINS changes, the prereg path differ — plus
  fix 4 (driver label) if it lands.
- Analyzer: r261 analyzer (`scripts/analyze-crisis-r261-delayed-20261121.js`)
  verbatim EXCEPT r262 filenames/paths, PLUS five new/changed sections
  (r261 metric review 2–4 + threads 46/47/49): R262 C3b-TRANSCRIPT
  split into four counters (negation / vote / closer / true); R262
  FIGHT-STALL (per-day no-path counts, stall-day bar); R262 DOWNEDTWICE
  ('goes down' per fight+ally); R262 M12 (circles lines grouped by
  reason per sitting); settled-help watch pattern extended with the
  C3b phrasings. Validated on r261's per-seed JSONs (copies in
  /tmp/r262-validate): carried numbers reproduce (D2, DRY, titan,
  Wren), FIGHT-STALL flags exactly 14584 d27 (116) and 14582 d123
  (26), DOWNEDTWICE finds repeats on the pre-fix corpus, M12 finds
  the pre-fix repeat shape, C3b split sums to r261's 20 hits.
- EVID (goal hidden_files): `evidence/2026-11-21/` for per-seed JSONs +
  transcripts; repo `evidence/2026-11-21/` holds the prereg, run note,
  and gate log (committed).
- R253 PROOFS RE-RUN on this base before the panel: titan-refusal
  15/15, march-refusal 7/7, antler-thrash 7/7 — all GREEN (re-run at
  run start; see run note for the log lines). Plus the r228 C3c test
  re-run GREEN (guard for fix 3).

## Side-arm PS4 — PARTYSIZE4 reach on the crisis band (descriptive, not §15)

- Same driver, same 3 pilot seeds (14591–14593), env
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1`. Separate EVID subdir
  `evidence/2026-11-21/ps4/` (same filenames, no overwrite). Analyzer runs
  on that dir. TIME-PERMITTING after the main panel; if the run times
  out, the side-arm is the first thing dropped and the run note says so.
- Question: does any trio/quad fire on the crisis band with the substrate
  on? r261's PS4 arm: trios fired on all 3 seeds, quads on 1; r257's:
  trios/quad patterns fired; r253's: trios 3, quads 3 on 14562; r247's:
  trios 0/2/0, quads 0/2/0. 0/3 here is a reach finding about the
  launch drought, not a lever failure. NOT a §15 comparison (no frozen
  bars, n=3) — descriptive only, never lever attribution. Runs AFTER
  the main panel (sequential processes — never two harnesses in one
  process, never parallel jest/sim under load).

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel; other-surface
  dry lines reported with pick attribution, no bar. Any dry line on a NEW
  surface is the next fix item, named in the run note.
- DRY3 / DRY2 / R238-DRY CONFIRM (binding): 0 dry lines on the three r235 /
  three r234 / repay-opener surfaces. Any dry line is a REGRESSION of the
  respective fix.
- C1 (bend, not break) GO: every game-over has a named cause that is NOT a
  siege-mechanic failure; horizon reachable on at least 1 seed is
  descriptive, not a bar. A softlock seed is reported separately.
- C2 (episodes fire + gates hold) GO: raids fire on all seeds; fought
  resolutions present; D1 snapshots all delayed >= 3 attempts; deltaBad
  empty; D3 drift unknown = 0 (union counting).
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable case fires
  or is refused with a recorded reason; no boundary-firable case unfired.
- C3 (people check) GO: all driven transcripts read in full; fabricHits = 0;
  conversations meet the meaning bar. VoiceLine prefix stacking >= 3
  sightings graduates to a fix in-run. Double confession: 0 expected; any
  recurrence is a guard failure. Naming-stance wobble: a fourth sighting
  graduates to a fix item.
- C3b SETTLED-FAVOR CONFIRM — SEVENTH WILD PANEL (binding): every "settled"
  close line fires only on a sitting that shared a real beat with the favor
  it names, AND a broken favor whose need is still live is never called
  done/square/settled. Adjudicate each R262 C3b-TRANSCRIPT TRUE hit in the
  run note, with pantryPer read from the per-seed JSON (pantryDaily kcal /
  roster). Any false settlement is a REGRESSION of the r240 fix. 0 served
  is a coverage note.
- C3c CLOSED / C3d CONFIRM (binding): see threads 5–6.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across all
  driven transcripts.
- C7b GO: buried list reported per seed; corpse-cause counts reported for
  famine/disease/wound/thirst.
- S1–S5 SUPPLY: NOT RUN this panel (RUINROAD parked). Cumulative stays
  2/321, carried as the standing number.
- A1–A6 stranger counters: DESCRIPTIVE ONLY. A7 NOT judged on the crisis leg.
- ARENA WATCH (descriptive): arena-fight outcomes per seed under the Reunion
  re-tune (HP x0.4 / damage x0.6, mirror cap 1); no bar; no win/loss
  instrument exists — the instrument gap carries.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming the mend +
  funeralMendStats counters per seed; any silent mend, silent shortfall, or
  over-claim line is a FINDING (over-claim = r216 F1 REGRESSION).
  Counters are NOT persisted in the per-seed JSON (r247 metric review 8) —
  read the verdict from the lines themselves.
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as the killer;
  gorge nights and sortie shape vs r261.
- NODEAWAY PANEL METRIC (tracked, no bar): totals vs r261's 20/worst-6.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants with a live
  need that sit a full sitting with dlg:help never offered; a second sitting
  graduates to a fix item.
- DEATHCLEANUP / NONDEATHPLAN WATCH: see threads 10–11.
- TITAN-REFUSAL CONFIRM (binding): ≤1 refusal line per titan per day AND
  spoken "you have N" equals the gate count. Zero lines with zero 'refused'
  outcomes is vacuous-explained. (Strict per-line check still wants muster
  composition persisted at outcome time — driver instrument, future run.)
- MARCH-REFUSAL CONFIRM (binding): ≤1 march refusal line per muster-day;
  refusal still stands on every attempt. See thread 33.
- ANTLER "THE THE" CONFIRM (binding): 0 "The The" antler-thrash lines. See
  thread 34.
- DODGE-ARTICLE CONFIRM (binding): 0 "dodged the the" lines. See thread 40.
- TRAIL 3-PRESS CONFIRM (binding): 0 verbatim trail-talk repeats 3x+ in one
  outing. See thread 36.
- FIGHT-STALL CONFIRM (binding): 0 stall-days (≥10 "No path there." lines
  in one day). See thread 49.
- DOWNEDTWICE CONFIRM (binding): 0 duplicate 'goes down' lines per
  (fight, ally). See thread 46.
- M12-CAP CONFIRM (binding): 0 same-reason repeat circles lines in one
  sitting. See thread 47.
- DEFERRED-ASK WATCH (descriptive): see thread 13.
- HOMEBODYVOICE / NOTICKDEFER (descriptive-only, retired).
- TRIODROUGHT WATCH (main panel: 0 expected by construction; PS4 arm: the
  discriminating read).
- REL-MOURN / MUSTER-GROWTH / HOLDERVoice / POCKET / TRAILTALK / WALKHOMe /
  TABLEACTIVE / DOOR-GUARD / LINK-ACCEPT ECHO / WANT-BRIDGE / SENSEEXPED /
  AMMO-NAMING / BOWCRAFT / GROWTH-LINE / WANT-MENU / WAR-PATH / COUNTER-LABEL
  / WARN-HEED / SETTLED-HELP / ENV-GATE watches: see threads 16–21, 24–32,
  35, 37–39, 41–45.
- Interesting finding (panel triggers): any medicine acquisition on the main
  panel (S3 > 0 — would mean the supply moved with no lever landed;
  investigate); a cleared fight-1 with vTaken >= 70 (Q4 live-play
  confirmation, standing); any dry-replacement on a NEW surface; any
  resume-opener stale want label; any funeral-mend line that mends silently
  or over-claims; any "Nothing important" recap with a live favor on the
  table; any dry line on a DRY2-, DRY3-, or R238-fixed surface; reproduction
  of any r261 blemish at its graduation bar; any dead-holder winPlan entry at
  census; any titan refusal repeat on the same titan-day; any spoken titan
  count disagreeing with the gate count; any march refusal line repeated on
  the same muster-day; any "The The" antler-thrash line; any "dodged the
  the" dodge line; any verbatim trail-talk repeat 3x+ in one outing; any
  fight narrated as stuck / unreachable, or any sortie fight breaking with
  the party unable to reach the monster; any trio/quad on the PS4 arm; any
  homeward travel strand; any door-tile fight eject; any link-accept parrot
  line; any want-bridge repeat before 11 bridges; any launch naming a
  companion with no expedition; any field-fight 'no X' line naming the wrong
  ammo; any F8 confide line firing with no secret; any surviving "The The"
  scream (r249/r253 fix regression); any bowcraft-duty villager with no bow
  after a full season (descriptive); any bowknow teach line on the default
  panel (env-gate failure); any LEND/GUNRATE/CELLGATE line on the default
  panel (env-gate failure); any growth line naming a cooled act; any
  war-path line naming a nonexistent monster; any warn_you heed that stays
  silent; any settled-help line naming no favor or the wrong favor; any
  'new trail' / reseed / PROFILEGATE4 line on the default panel
  (env-gate failure); any stall-day (thread 49); any duplicate
  'goes down' (thread 46); any same-reason circles repeat (thread 47);
  any decline line promising never-again (fix 2 regression — the panel
  transcripts must show 0 "won't ask twice / won't raise it again /
  stop asking" decline lines); any resume opener quoting a snippet from
  a favor whose kind differs from the label (fix 3 regression).

## Telemetry

- Metrics: defendedFights vs baseline
  `telemetry-baselines/crisis.json` (r261 metric review 5 ADOPTED:
  playerFights and latelyDefenseCount are absent from the per-seed
  JSONs, so they are DROPPED from the metric list until the driver
  census emits them). LOUD lines are same-run investigation items
  before any baseline roll; baseline NOT rolled on a single panel's
  variance.

## Metric review section (carried open items for the resuming run)

1. Wren-note bar REVISED (r257, adopted r261): consecutive-day repeats
   of the same variant, or same-day duplicates — panel totals descriptive
   only.
2. C3b instrument SPLIT this run (r261 metric review 2 adopted):
   four counters (negation / vote / closer / true). The sayLines-only
   check is retired for C3b. The confide check also returns 0 in
   sayLines while confide-thread recalls fire in the transcripts —
   NOT fixed this run (carried).
3. Settled-help watch pattern EXTENDED this run (r261 metric review 3
   adopted): the C3b phrasings ("settled, and counted", "that debt,
   settled") are added to the watch.
4. FIGHT-STALL instrument ADDED this run (r261 metric review 4
   adopted): per-day no-path counts + stall-day bar (thread 49).
   POCKET still counts lines, not fights — the stall section is the
   fight read.
5. Telemetry keys ADOPTED (r261 metric review 5): playerFights /
   latelyDefenseCount DROPPED from the metric list (absent from the
   per-seed JSONs); defendedFights only. The driver-census fix (emit
   the keys) is a future run's item.
6. Census corpses omit scholar deaths (r257 metric review 5) — any
   verdict that counts deaths from the census alone undercounts scholar
   deaths.
7. Muster-growth watch (r257 metric review 6): 0 dawn muster-growth lines
   fired on r257 and r261 — the muster never grew. The watch stays
   descriptive until a panel grows a muster.
8. Register-script lesson (carried from r261): `worktree-register.sh`'s
   branch-exists fallback attaches to a stale same-slug branch without
   checking its base; the script owner should verify the attached
   branch's base is current master, or fail loud. (Not struck this
   run: the branch did not exist.)
9. "Names, named." driver label (r261 blemish 1): fix 4 above, time-
   permitting; else carried.
10. Favor re-ask vs decline promise (r261 blemish 2): fixed this run
    (fix 2). The decline variants are the changed surface; the re-ask
    path is untouched by design.
11. Recall label imprecision (r261 blemish 5): fixed this run (fix 3).
    The r228 behavior (label re-derives to the current favor) is
    preserved; only the stale quote drops.
12. "Gulsara's Drawing" daily repeat (r261 blemish 7): NOT fixed this
    run — pool/cooldown investigation owed.
13. Verbatim repeat decline (r261 blemish 3), stock exit repeat
    (blemish 6), thin sitting (blemish 4): carried, no fix this run.
14. Closing-line duplication (deepening r248): graduated to named
    defect, owned by the conversation build arm — watched here only.
15. The rotation file read 6 at r262's start; this run plays crisis (6)
    and writes 7 at closeout, with a read-back.
16. COUNTER-LABEL WATCH (carried from r253): the comma-clause fix
    (9fb55be89) — any counter line using a comma-carrying display name as
    the noun is a REGRESSION of that fix; the r244 panel's fired set
    (belltoad/dustboar/rut_king) is the reference.
17. War-path monster names (open defect, endgame r255): full-seat lines
    name nonexistent monsters ("The Big Thing", "Big-Bane", "Big Ugly").
    Next fix round's item; this run watches for the same class (thread 38).
18. M4-SPLIT metric review (social leg, carried): r260 GO at the bar (12).
    Owed on the next SOCIAL run, not judged here — the crisis analyzer
    carries no M4 instrument.
19. Telemetry baseline units (crisis.json): sum or mean? Still open.
20. HOMEBODY and NOTICKDEFER stay descriptive-only. FLEEREPAIR3 and
    WILDAVOID stay unmeasured — no instrument exists.
21. The r240 player-side "we're square" option question: the NPC side is
    honest (r247 proves it by contrast in one panel); the player can still
    claim "we're square" with a live need. Design question, not a false
    claim by the game.
22. Lucia's Tagalog pool repeats lines across sittings (small-pool
    observation, no bar) — r247 metric review 11.
23. 14553's census reads extinct=False with aliveCount=0 on an extinction
    game-over — census-owner look, no panel impact (r247 metric review 13).
24. Joko's d50 death absent from the census corpse list (no-body return) —
    census-owner look, no panel impact (r247 metric review 10).
25. funeralMendStats counters NOT persisted in the per-seed JSON (r247
    metric review 8) — a future run that wants counters must persist them
    (driver instrument).
26. The game-side fight stall-breaker (follow-up to fix 1): filed, not
    built here. The policy flee caps the sim stall at 3 turns; a real
    player can already walk off the board edge. If the panel shows a
    surviving stall-day (flee unable to move the player — pocketed),
    that geometry is the next round's game-side item.
27. Staged-approach gap (fix 1 limitation): the policy only ever targets
    the monster-adjacent tile, never an intermediate tile — a distant
    but pathable target reads as "Too far" until the monster closes.
    A staged-approach policy is a separate change with its own panel
    comparison; not this run.
