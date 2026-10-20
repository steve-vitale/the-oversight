# sim-windowseat — window-death taxonomy on the SEATDRIVE default-on substrate (flesh-out loop, 2026-10-20, ARM sim-windowseat)

Run: fleshout-20261020T2145Z, arm sim-windowseat. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only.

Canon: docs/CANON.md (read), docs/MONSTER-WAVES.md (wave law, design call #4
waveCombatReadiness gate, VILLAGER XP LAW — read). No doc covers the window-death
taxonomy itself — the windowsurvive arm (2026-10-19) is the methodological model
(its probe/analyzer scripts are in this tree, committed on this base).

What this answers: the wintrack/seat arm won 12/16 through feared/light — all one
track — but the LOSERS' window deaths on the winning substrate are unmeasured.
The windowsurvive taxonomy measured the pre-seat+windefer substrate (raids 40/72
#1, scholars 42 vs villagers 30, rich-not-starving). This taxonomy names the wall
where wins actually happen.

Substrate (this arm): the seatdrive natural win-side stack —
withSeatDrive(withWinDefer(TF base)) on {leadfeast, belongfeast} tribfloor bases,
SEATDRIVE UNSET (default-on since 2026-10-16; the probe's SUBSTRATE GUARD rejects
SEATDRIVE=0). Confirmed against sim-wintrack-audit.md: its control corpus
(evidence/2026-10-20/perseed-tablepathdriver-control/, 16 runs, SEATDRIVE=1 +
driver OFF) is the same composition; won=12, wave4=10, wave5=0, national=12.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1 (no VETREL, no REPOSITION, no
TABLEPATHDRIVER, no RELAYDARK).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (diagnostic GO):** attribution completeness — 100% of window deaths
(deaths inside deferral-5 windows, any outcome) classified into the 9 wall
classes, 0 unexplained. GO threshold: **0 unexplained over the corpus.**
UNEXPLAINED = (a) who unverifiable (the death can't be confirmed against the
roster — the probe's unverifiable list), or (b) cause literally 'unknown' with
nothing to classify by. 'other:<named-cause>' is EXPLAINED (the cause is
recorded; the class just isn't one of the 8 named ones). A miss is NO-GO,
never re-scored (§14).

**The window:** maximal contiguous deferral(5)-true windows — windowsurvive-
identical (attemptsOf incl. the endRec boundary fix), plus the 'won' outcome
(new on this substrate: villages win THROUGH the window via feared/light).
Window outcomes: released | died | won | horizon | regressed. Window deaths
= attributed person deaths with day inside ANY window, tagged by outcome.

**The 9 classes (precedence, documented in the analyzer):**
contest > sealed-fight > kill-fight > raid > starvation > attrition >
haven-encounter > expedition > other.
- sealed-fight = inTb && tbfight.noFlee (the engine's seal mark — answers
  backlog #695; travel blockage is NOT a seal, the scholarsurvive d162 lesson).
- kill-fight = the dead person's own wave-4+ kill the same day.
- One deliberate divergence from the windowsurvive channel classifier: that
  classifier maps 'combat' + ctx.aid (aid-crisis) to the RAID channel; here
  raid means defending Haven and aid-crisis combat reads 'expedition'.

**Horizon:** 180d death-aware (dead villages stop simulating; the engine's
runDays pattern, identical to windowsurvive).

**Seeds:** 8 FRESH 66001–66008 (verified 2026-10-20: zero filename hits in
evidence//scripts; 65001–65008 taken by winsupport-decomp; 64001–64008,
64009–64014, 64015–64022, 64201–64208, 8801–8808, 5411–5426, 63901–63908,
61205 taken by sibling arms) × {leadfeast, belongfeast} = 16 runs.

**Instrument:** scripts/windowseat-instrument-20261020.js (read-only
WINDOWSEAT wraps: recordWaveKill/recordPyrrhicKill, playerDeath-before-ctx,
havenRaidTick, tele('death') capture for all person deaths,
combat_start + router fight-start records; the killattr deathCtx verbatim).
Proof: scripts/test-windowseat-20261020.js (RED→GREEN fixtures, SMOKE,
DET byte-identical). Sweep: scripts/probe-windowseat-20261020.js.
Analyzer: scripts/analyze-windowseat-20261020.js. Transcripts:
scripts/windowseat-transcripts-20261020.js (SAY lines restored, sysSay
un-stubbed — the w5census probe-artifact lesson).

**No balanced panel** (§15): pure diagnostic, no lever, no before/after.

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

Sweep: 16/16 runs (seeds 66001–66008 × {leadfeast, belongfeast}), 0 engine
errors, 0 instrument errors, 0 bad per-seed files. FIDELITY re-run 4/4
byte-identical. Proof: scripts/test-windowseat-20261020.js 31/31 GREEN
(RED 5/5 discrimination vs the naive windowsurvive-channel classifier,
DET 4/4 byte-identical instrument-on vs off).

**PRIMARY: 22 window deaths, 0 unexplained — DIAG-GO.**

### The window on the winning substrate

Door (deferral-5) reached on 7/16 runs — 7/8 leadfeast, 0/8 belongfeast.
The leadfeast door phenomenon (windowsurvive: 8/8 vs 2/8 pre-seat) is
CONFIRMED on the winning substrate. 7 windows, outcomes: 6 won-through,
1 died. Median window length 20d.

### The 9-class taxonomy (22 window deaths)

- haven-encounter: 16 (73%)
- starvation: 2
- attrition: 2
- expedition: 1
- contest: 1
- raid: 0 | sealed-fight: 0 | kill-fight: 0

By window outcome: died-windows {starvation 1, haven-encounter 3,
contest 1, attrition 2}; won-windows {haven-encounter 13, expedition 1,
starvation 1}.
By role: scholars 15, villagers 7.
Killer wave (combatish): w4 12, w3 3, w2 2 (5 unmapped: starvation/
attrition/contest).
Precedence overlaps: sealed-on-kill-day 0, raid-in-noFlee 0,
contest-without-arena-flag 1 (Elif d102 — cause-named, explained).
WHEN: mean window-day at death 13.7; mean inter-death gap 2.9d.
STATE at death (means): pantry 30,877 kcal, hungry streak 0, living
veterans 0, armored 2, standing cap 245 — they die rich and unequipped,
the windowsurvive pattern verbatim.

### Backlog #695 (sealed-fight): ANSWERED on this substrate

0 sealed-shape deaths in the entire 16-run corpus — not just the window:
0 noFlee deaths among ALL 153 attributed person deaths, while 110 raid
nights fired and 1,946 fight-starts were recorded. The sealed fight
simply does not appear on the winning substrate (the killeraftermath
armed corpus's 3 sealed deaths live on the pre-seat substrate). The
sealed-shape fairness question is not the wall where wins happen.

### The one died window (leadfeast s66004, d99–118)

A genuine multi-cause collapse inside the window: Katarina d101
starvation (scholar) → Caleb d101 haven-encounter w2 (villager) →
Elif d102 contest (scholar, 1 day after taking the mantle) →
Jorge d102 haven-encounter w2 (scholar) → James d106 thirst
(villager) → Iman d112 unclosed wound (villager) → Suman d118
haven-encounter w3 (scholar). Terminal readiness: armor+weapons+veterans
short. The door was open and the village bled out through it.

### The winners bleed too (the wall's real shape)

15/22 window deaths are in WON-THROUGH windows. lead-66005 won d90
with 7 window deaths — 5 scholar successions in 14 days (Kayden d69 →
Peig d70 → Emma d75 → Marta d83 → Ivy d83), all haven-encounter vs
wave-4. lead-66007 won d92 with 5 window deaths. The window is a meat
grinder the win walks through, not a gate the win avoids.

### The mechanism (killeraftermath-confirmed on this substrate)

The haven-encounter deaths are the feast-draw/scavenger shape: combat at
Haven, no raid night, wave-4 killers (12/17 mapped). Same delivery as
the killeraftermath diagnostic (feast draws wave-appropriate scavengers;
the scholar faces them at Haven). What differs here: nobody dies to
raids (110 raid-nights, 0 raid deaths — the raid defense holds on the
winning substrate; windowsurvive pre-seat: raids 40/72 #1).

### Wall numbers (this substrate)

national 10/16 | table 7/16 | wins 10/16 | wave-4 11/16 | wave-5 0/16 |
median survival 90d | max 163d | exiled 0/16.
Wave-5: 0/16 — the win path never touches the wave-5 door. 2/10 wins
came without national (belong-66006 won d142 at regional; belong-66007
won d90 with table announced but national never reached); 1/10 wins
came at wave-3 (lead-66006). The win is decoupled from the scale and
wave walls — the scale wall gates the indispensable door and the
2-living-veterans bar, not the win.

## Metric review

The pre-registered diagnostic bar (0 unexplained over the corpus) is met
exactly: 22/22 window deaths classified, 0 unexplained, 0 phantoms. No
re-score needed — the instrument did what it was built to do.

**§14 honest metric doubts — for the NEXT run, not this one (the bar is
met and the DIAG-GO verdict stands):**
1. **The window is a leadfeast phenomenon** (7/8 vs 0/8). The taxonomy's
   died-window evidence is n=1 run (lead-66004). The losers' side is
   thin — belongfeast's 4 losses are all pre-door (d38–d89, waves 2–3).
2. **Killer-wave join is thin for villagers**: monster-name causes join
   by static lookup; folk-name causes ('The Big Bastard' — the village's
   own monsterDisplayName, encounters.js:139) cannot join statically.
   Instrument gap: record the run's monsterDisplayName map per seed.
3. **'the night' cause** (belong-64208-style emitter — no source found in
   src; the old pit-trap comment is the only 'the night' blame) lands
   'other:the night' — explained (cause named + ctx recorded), wave
   unmapped. If it recurs, trace the emitter.
4. **atHaven is scholar-relative for villager deaths** (the engine only
   exposes the scholar's location) — the windowsurvive limitation,
   carried and documented. Villager raid-class deaths lean on cause +
   raid-night join.
5. **6/7 windows won-through**: the taxonomy compares 7 died-window
   deaths vs 15 won-window deaths — the died side is one run. A second
   died-window corpus (more seeds, or the pre-seat losers) would firm
   the contrast.

## Village assessment

What the villages looked like: 16 villages on the SEATDRIVE default-on
natural win-side stack (leadfeast/belongfeast, 180d death-aware). Ten
won — through feared/light (the wintrack track), most by d90–105, two
as late as d142/d163. They are rich villages that bleed at the door:
mean pantry at window-death 30,877 kcal, hungry streak 0. The door
(deferral-5) is a leadfeast phenomenon (7/8 vs 0/8); the one village
that died inside the window (lead-66004) collapsed multi-cause over 20
days while the door stood open. The four belongfeast losses never
reached the door — d38/d68 at wave-2 (early collapses), d89/d68 at
wave-3/4.

Who thrived and who died and why: the scholar dies more than the
village — 15 scholar successions vs 7 villager deaths in the window.
The scholar is the designated fighter: 12/15 scholar window deaths are
haven-encounter vs wave-4 (the feast-draw shape). Villagers die of
logistics at the margins (thirst, unclosed wounds, starvation) and the
odd expedition monster. Missing at every window death: veterans (0
living at all 22 deaths), armor (~2 armored), the wave-5 door itself.

What the village does while its scholars die: it functions — and it
wins anyway. lead-66005 lost 5 scholars in 14 days and won on schedule.
belong-66006 won at regional scale with Selorm Amenyo outshining the
player-scholar (the outshone beat fired end-to-end; Selorm never died —
the 8de1b508b ghost-ascension fix holds on this run).

## Sense-testing (SENSE-TESTING LAW)

Read: 3 transcripts on the sweep's base (death-day-exact vs measured
teles) — leadfeast s66004 (2,090 SAY lines, d96–121, the died window),
leadfeast s66005 (3,645, d54–93, the won-through churn), belongfeast
s66006 (1,983, d127–142, the regional win).

**Deaths read as people dying, not stat-bags.** Kayden's d69 death is a
televised blow-by-blow loss to The Influencer — "You go down.",
"📺 SYSTEM: 'OH. Oh no. ...The gamblers are very quiet.'" — then the
tribute press from all three villages "while the chair is empty" and
Marta's line: "'Kayden's gone.' Marta looks at you for a long moment.
'You're not Kayden.' No heat in it. Just fact. You'll have to earn
this face." James's d106 thirst death is logistically earned: "💀 James
died of thirst. There was nothing to drink." with the cistern dry for
days and water-duty prompts unanswered. Iman's d112 unclosed wound:
"💀 Iman is gone. The wound was too much."

**Blanks (robotic/static):**
1. Double death-lines for one death: James gets "died of thirst" AND
   "succumbed to the fever" in the same beat — two causes narrated for
   a single death.
2. "Nobody's talking much. The fire feels smaller tonight." fires TWICE
   inside Iman's single death (grief templating repeats within one
   death, not just across cascades — the windowsurvive blank, worse).
3. The 3-village tribute-press block repeats identically per scholar
   death (known from windowsurvive).
4. "The village is 1 now." after deaths — a cryptic population line
   with no fiction around it.
5. "The village's quarrel was with X" fires even with no quarrel on
   record (known from windowsurvive).

Verdict: the fiction earns its deaths. The window kills read as
tragedy with real costs — the winners' churn (5 scholars in 14 days)
reads as the price of the win, not a bug.

## Named nexts

1. **[#695 closed on this substrate]** 0 sealed-shape deaths in 16 runs
   (0 noFlee deaths among all 153 attributed deaths; 110 raid-nights
   fired). The sealed-fight fairness question is not the wall where
   wins happen. The pre-seat substrate's 3 sealed deaths (killeraftermath
   armed) stand as that substrate's finding.
2. **[lever pointer]** The wall's teeth are haven-encounter deaths vs
   wave-4 scavengers at Haven (16/22, scholars 12/15) — the feast-draw
   shape. Levers 0/1 (food economy / combat & death share) are the
   surface; lever 8 (travel & regional) is not (the deaths are at Haven).
   The scholar faces every draw; the 4-square party-assembly rule leaves
   them alone at night (the killeraftermath delivery mechanism).
3. **[instrument]** Record the run's monsterDisplayName map per seed so
   folk-name death causes ('The Big Bastard') join the killer-wave map.
4. **[finding]** belong-66006: a regional-scale table win (feared path,
   OUTSHONE beat, Selorm Amenyo alive throughout) with national never
   reached and tableWaiting never true — the natural track wins below
   national. The scale wall gates the indispensable door, not the win.
5. **[finding]** The leadfeast/belongfeast door asymmetry (7/8 vs 0/8)
   confirms the windowsurvive leadfeast phenomenon on the winning
   substrate — out-of-arm, appended to sim-findings.md.

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chased — staying on the diagnostic.)
- belong-66006: regional-scale table win without national and without the
  tableWaiting announcement — the win path bypasses the scale wall
  (outshone beat end-to-end; the 8de1b508b ghost-ascension fix holds —
  Selorm alive).
- 'The Big Bastard' death cause = the village's own monsterDisplayName
  (encounters.js:139) — folk-name causes can't join the static
  killer-wave map; instrument gap filed as named next 3.
- James's double death-line ("died of thirst" + "succumbed to the
  fever" in one beat) and the doubled grief line inside Iman's death —
  content templating blanks.
- "The village is 1 now." — cryptic population line after deaths.

## Convergence

**DIAG-GO — converging.** The diagnostic answered its question (22/22
window deaths attributed, 0 unexplained; #695 answered on this
substrate: the sealed shape is absent). Findings for the axis: (1) the
window on the winning substrate is a leadfeast phenomenon (7/8 vs 0/8)
whose teeth are haven-encounter deaths vs wave-4 scavengers — the
feast-draw shape, scholars 12/15; (2) the winners bleed through the
window (15/22 deaths in won-through windows) — the wall is exposure,
not a gate; (3) the win never touches wave-5 (0/16) and sometimes skips
national — the scale wall gates the indispensable door and the
2-living-veterans bar, not the win. The STANDING DIRECTIVE's lift
condition is a coordinator/Steve call — national reached 10/16 here,
but the wave-5 door (the indispensable gate) stays shut.

## Files

- scripts/windowseat-instrument-20261020.js — the read-only WINDOWSEAT instrument
- scripts/probe-windowseat-20261020.js — the sweep probe (DET/SMOKE/FIDELITY modes)
- scripts/analyze-windowseat-20261020.js — window attribution + the 9-class taxonomy
- scripts/windowseat-transcripts-20261020.js — SAY-line capture for sense-testing
- scripts/test-windowseat-20261020.js — proof: RED→GREEN + SMOKE + DET
- evidence/2026-10-20/perseed-windowseat/{leadfeast,belongfeast}/s66001–s66008.json — 16 per-seed sweep JSONs
- evidence/2026-10-20/windowseat-corpus-summary.json — corpus summary (analyzer output)
- evidence/2026-10-20/windowseat-taxonomy.md — full taxonomy + row-by-row table + per-run table
- evidence/2026-10-20/windowseat-transcripts/ — SAY transcripts for sense-testing
- evidence/2026-10-20/sim-windowseat.md — this file
