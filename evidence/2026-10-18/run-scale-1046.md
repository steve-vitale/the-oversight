# Journey SCALE R7 (2026-10-18) — the CONQUEST road, Iron Court answers on the current tip

**Run id:** 2026-10-18T10:50Z (oversight-playtest-loop). Worktree: `journey-scale`.
**Base:** master@97bd3e0b.

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** On the current tip, does the CONQUEST road stage, play,
and hold national in days 80–140? Do the three Iron Court answers (MERCY /
YOKE / RELEASE) each play with real, distinct consequences — mercy trust
climb vs yoke revolt/sabotage price vs release dissolving the realm aloud?
Secondary: does the war road's combat feed the wave-4 readiness gate that
starved the diplomacy roads (0/24 wave-4 unlocks on belong/covenant/trade)?

**Context:** r1/r2 measured LEAD, r3 COVENANT, r4 BELONG, r5 TRADE (all GO).
r6 measured the conquest road shape (5/8 national, 1/8 global, revolts
firing) but left no run note — no verdict, no census, no people check. R7
is the conquest verdict run: fresh seeds, all three Iron Court answers
covered per seed, the MERCY-HOLD question, and the wave-4-readiness
secondary.

**Binding metrics (shape-aware; a miss is NO-GO, never re-scored mid-run;
metric doubts go under "metric review"):**
- M1 national (conquest shape): ≥2/8 seeds stage the Iron Court by d140.
- M2 hold: of seeds staging national with MERCY/YOKE answers, ≥half still
  hold nationalLive at their run's end (no silent dissolution).
- M2b release: on release-answer seeds, the realm dissolves ALOUD (markers +
  nationalLive false) and the village survives the aftermath (death-aware end
  without scatter) — the designed outcome, measured not as failure.
- M3 conquest mechanics: ≥1/8 seeds fire a conquest mechanic beyond the
  court: a raid answered, a revolt/sabotage marker, a duress tribute week.
- M4 people: ≥8 transcripts sense-read (Iron Court beat text +
  conversations), 0 senseless flags.
- M5 winnable: ≥3/8 seeds end with national held OR reach d140 (death-aware).

**Interesting-finding bar:** the Iron Court staging per answer; YOKE's
revolt/sabotage price vs MERCY's trust climb; RELEASE dissolving aloud;
duress tribute weeks at ×1.25; a raid's cost line said plainly;
wave-4 unlock on the war road.

**Horizon:** DAYCAP=185 loop-days targeting ~140 game-days (r5's lesson:
~25% fight-blocked-sleep tax on travel-heavy seeds). Death-aware stop
(+10d tail max). The leg window (80–140) is read in game-days.
**Seeds:** 9501–9508 (fresh; r6 used 8601–8608, r5 8901–8908).
**Iron Court answers:** 9501 mercy, 9502 mercy, 9503 yoke, 9504 yoke,
9505 release, 9506 release, 9507 mercy, 9508 yoke (mercy×3, yoke×3, release×2).
**Policy:** warcourt (competent + conquest force play, raids from day 35,
terms-first, per-seed IRONCOURT_ANSWER), WARCOURT_RAID=1.

**Substrate checklist (§14b):**
1. Contact: r6 staged the Iron Court on 5/8 seeds (8–15 ironCourt markers/seed)
   — the beat fires. PASS.
2. Pool sizing: 5/8 national in r6 — the conquest bar is reachable, not a
   foregone no. PASS.
3. Verb existence: raidVillage/answerRaid/answerNationalChoice all fire in r6
   (12–52 conquestEvents/seed). PASS.
4. Horizon fit: Iron Court staged ~d94–110 in r6 (leg window 80–140);
   the raid build-up (d35+) precedes it; full runs from day 1 are required
   (conquest links need the season, canon). PASS.

**Kill verdict taxonomy:** a M1 miss kills the run as METRIC-BROKEN (the
substrate fired for r6 — a fresh miss would point at the tip, not the road)
unless the autopsy finds a mechanism, in which case CONCEPT-DEAD.

## PILOT (3 seeds: 9501 mercy, 9502 mercy, 9503 yoke; DAYCAP=185)

All three completed (~6 min wall). Verdict: **interesting — full 8-seed run
justified.** The war road struggles to stage the Iron Court inside the leg
window (80–140):
- 9501 (mercy): 8 raids d35–120, never held 3 seasoned conquered links at
  once — revolts (5%/wk/link at trust<30) keep breaking links faster than
  the 28-day seasoning bar. Ended regional d164, national never staged.
- 9502 (mercy): the court staged LATE at d158 (outside the leg window),
  answered MERCY — and the realm dissolved at d159, the next morning.
  Mechanism: MERCY clears conquered flags, flipping the hold bar from
  season-only to season+trust-40 overnight; trust +8 from 15–33 lands
  23–41, usually short of 40. The beat's copy says "They might, in a
  season" — the engine gives them one morning.
- 9503 (yoke): the court staged at d94, answered YOKE — and the realm
  dissolved at d127 by rebellion (all three links broke; trust →3 after
  the −12). The yoke's price, working as designed.

**Pilot finding (the blank):** the MERCY answer is a trap — the copy
promises a season of tending ("the hatred starts to decay... They might,
in a season") while the engine dissolves the realm the next morning
because the +8 trust lift doesn't reach the 40 the LEAD bar needs. YOKE
(trust −12, conquered flags kept) holds by the season-only bar — fear is
honest mortar. MERCY dissolves by the bar it never names.

## RESULTS (8 seeds × 185 loop-days, death-aware; warcourt, WARCOURT_RAID=1)

| seed | iron | gamedays | end | scale | court (day) | answer | national end |
|------|------|----------|-----|-------|-------------|--------|--------------|
| 9501 | mercy | 164 | survived | regional | — | — | never staged |
| 9502 | mercy | 187 | survived | regional | d158 | mercy | dissolved d159 |
| 9503 | yoke | 187 | survived | regional | d94 | yoke | dissolved d127 (rebellion: all 3 links broke) |
| 9504 | yoke | 140 | village-lost | regional | d94 | yoke | dissolved d104 (rebellion) |
| 9505 | release | 179 | survived | regional | d94 | release | dissolved by design (released) |
| 9506 | release | 178 | survived | regional | d114 | release | dissolved by design (released) |
| 9507 | mercy | 126 | village-lost | regional | — | — | never staged |
| 9508 | yoke | 28 | village-lost | village | — | — | never staged (early death) |

Raids: 49 mustered across 7 seeds (9508 died d28 before raiding); every
answered raid yielded bloodlessly via TERMS (Haven strong ≥1.2× each time —
the policy picks winnable fights; STRIKE casualties never fired in the
wild this run, though the path is proven in test-national-shapes).
Revolt markers 62 total; duress-tribute weeks ticked on 7/8 seeds.

- **M1 national (conquest) GO 5/8** (bar ≥2/8). The Iron Court staged on
  five seeds (d94–158).
- **M2 hold NO-GO 0/3** (bar ≥half). Mercy dissolved the next morning
  (9502); both yoke realms died by rebellion within 10–33 days (9503,
  9504). See BLANKS — the mercy half is fixed this run; the yoke half is
  the designed rebellion price (documented, not fixed).
- **M2b release GO 2/2.** Both release seeds dissolved the realm by design
  ('released'), said aloud, villages survived to d178–179.
- **M3 conquest mechanics GO 8/8** (bar ≥1/8). Raids answered, revolts,
  duress tribute weeks — the road's machinery fires.
- **M4 people GO** — 10 transcripts sense-read below, 0 senseless flags
  (32 captured total).
- **M5 winnable GO 5/8** (bar ≥3/8). 9501/9502/9503/9505/9506 reached d140+;
  national was held on none at run end (M2's miss), but the villages
  survived and the road is playable.

**Wave-4 secondary: NO.** engagedW4 = 0 on all 8 seeds (finalWave 3
everywhere). The war road's combat does not feed the readiness gate (4
armored P≥15, 5 armed, 3 tricks, 2 veterans): raids resolve via muster
(registerDeath), not blow-by-blow fights, so no tricks accrue and no
veterans are made. The diplomacy-road wall (0/24) is now 0/32 with the war
road included — the readiness gate is a wall for every non-combat-grind
playstyle, owned by the endgame/wave axis, not this leg.

**The arcs, in plain words:**
- 9502 is the exhibit: three conquered fires seasoned by d158, the Iron
  Court convened late, MERCY chosen — and the realm came apart the next
  morning. (r6's 8602 showed the same arc: on d115, off d116, re-staged as
  lead d120. The whiplash is the bug.)
- 9503/9504 are the yoke's honest price: the court sat (d94), the yoke
  tightened (trust →3), and rebellion took all three fires within weeks.
  "The realm holds. Fear is a kind of mortar." — the mortar crumbled;
  the rebellion mechanics did their designed job.
- 9505/9506 are the clean release: the court sat, the cages opened, the
  war-realm dissolved before it ever sat as a court — and the villages
  lived on, regional and unbowed.
- 9501 is the churn: eight raids in 120 days, never three seasoned fires
  at once — the revolt rate vs the 28-day seasoning bar is a dice game the
  war road often loses.
- 9507/9508 are the harsh seeds: the village died before the road opened
  (d126, d28). The war road doesn't armor a dying village.

## VILLAGE ASSESSMENT (census in plain words)

- **9501 (regional, 6 alive):** Brian the zookeeper (66 plants) carries the
  knowledge; all six grieving. Trust 52–91 — a tight, sad, competent
  village that raided for four months and never got its court.
- **9502 (regional, 9 alive):** Quinn the bartender (57 plants) leads the
  knowing; moods lonely. The village that convened the Iron Court at d158
  and watched it dissolve at d159 — and kept going to d187.
- **9503 (regional, 6 alive):** Paola the pharmacist (48 plants); steady.
  The yoke's village — three rebellions, still standing.
- **9504 (scattered d140):** Willow the zookeeper (66 plants); grieving.
  The yoke realm fell to rebellion at d104; the village followed at d140.
- **9505 (regional, 8 alive):** Brayden the florist (49 plants); grieving.
  The clean release — the war ended by choice, the village intact.
- **9506 (regional, 5 alive):** Tashi the arborist (62 plants); grieving.
  Same road, same ending, smaller fire.
- **9507/9508 (lost):** never became villages — the wild took them before
  the war road opened.

The war road's villages are small, grieving, and knowledge-thin (one
carrier each, 48–66 plants). Raiding costs people; the census reads like a
war memorial. Nobody is miserable in the mechanical sense — trust runs
high inside Haven (26–91) — but every survivor grieves.

## PEOPLE CHECK (sense-testing; 10 transcripts)

- **The Iron Court beat (source-read, all three answers):** the staging
  copy is played and specific — "The speakers of X, Y, Z kneel because they
  lost — not because they chose. This is the Iron Court, and the realm is
  listening for what kind of conqueror you are." MERCY's line names the
  terms (4,000 kcal, trust +8) and — post-fix — the season and the bar:
  "the realm holds them one season on the yoke's shadow. Earn their trust
  to 40 by then, or it comes apart." YOKE's line: "The realm holds. Fear
  is a kind of mortar." RELEASE's: "Haven opens the cages... They'll
  remember the yoke. They'll remember the release longer." Human, all
  three — and now the MERCY line tells the truth about the mechanic.
- **9501-d100 (Jada, seek_taken, grieving):** seven comfort turns, seven
  distinct grief lines, honest ending ("They're already drifting away.
  'Later.'"). The driver comfort-spammed; the engine never repeated
  itself. Human.
- **9502-d100/d140 (Hank, ask_favor, hungry):** a food-ask with a real
  body behind it ("My hands shake when I try to work"), committed,
  resolved promised; later a mourning thread for Giuseppe ("I count
  portions out loud before eating... keeps my hands from shaking").
  Human.
- **9503-d120 (Paola, seek_taken):** the real Taking conversation — Aziza
  the sister, pods dreams, "I wake up and I can't tell if it was a dream
  or a broadcast." The player promises to ask the System. Specific,
  canon-grounded (KIN.md), earned. The best transcript of the run.
- **9503-d140 (Paola, seek_taken):** the same NPC a season later, want
  unengaged — the driver picked 'dlg:more' loops instead of the want menu,
  so the engine played the introvert persona (coherent solitude lines)
  instead of the Taking. Driver style, not an engine blank: the want menu
  was offered and ignored.
- **9501-d140 (Xavier, language barrier):** speaks only German; the
  non-verbal menu (nod/smile/point/listen) is real, the driver bailed at
  turn 0, the closing line held ("They press their palms together —
  thanks, or goodbye, or both."). Thin but coherent.
- **9506-d80 (Deirdre, ask_favor + mourning):** "We lost Antonella and Aki
  this week. I keep setting out extra portions. Stupid." — grief with
  specific names and habits. Human.
- **9506-d100 (Deirdre, seek_taken):** opener promises a secret ("I saw
  something in the woods I'm not telling anyone about") but the driver
  picked 'unsure' over 'yes' and the secret stayed buried. The content
  exists behind the 'yes' choice — driver caution, not a blank. Soft
  note: the driver's 'unsure'-first pattern strands yes/no wants.
- **9506-d120 (Ava, curious):** a teaching thread — five plants, five
  distinct reactions. Human.
- **0 senseless flags.** Two soft notes: the driver's comfort/'dlg:more'
  spam (engine handles it honestly), the 'unsure'-first pattern on
  yes/no wants.

## BLANKS

1. **FILLED (game code, worktree): the MERCY trap.** The Iron Court's MERCY
   answer promised the eased links "a season" to earn the trust while the
   engine dissolved the realm the next morning (+8 on 15/25 → 23/33,
   short of the 40 the LEAD hold-bar needs). Fix: MERCY stamps
   `mercyUntil = day+30` on the eased links ("the yoke's shadow"), and
   `_linkSeasoned` waives the trust component for polity membership while
   the grace holds; after the season the 40 bar applies honestly —
   dissolve aloud if unearned. The beat's copy now names the season and
   the bar. Proof: scripts/test-iron-court-mercy-20261018.js — RED (the
   realm dissolved the next morning on all 3 seeds) → GREEN (holds through
   the grace; dissolves aloud at season's end if unearned; earned trust
   re-stages as a lead realm and holds). 3 seeds × 12 assertions, all
   green. Regressions: test-scale-pacing, test-scale-lead-fix-20261012,
   test-scalecourt-climb-20261012, test-national-beat-echo-20261014,
   test-scale-onramp-20261010 — all green; test-national-shapes-20261010
   shows only its 3 pre-existing wave-5-gate failures (verified identical
   on the pre-fix tree via patch-file RED check — not caused by this
   change). Ontology: validate-ontology.js green (117 systems). Canon:
   docs/SCALE.md MERCY bullet documents the grace.
   Commit: [needs-eyes] (player-facing beat copy changed).
2. **Documented (design, for Steve): the YOKE's mortar crumbles.** Both
   yoke seeds lost all three conquered links to rebellion within 10–33
   days of the court (trust →3, revolt 5%/wk/link). The beat says "The
   realm holds. Fear is a kind of mortar." — the rebellion mechanics
   (canon, working as designed) break it in weeks unless the player tends
   constantly. Harsh-but-honest or too harsh is a design call; the
   mechanics are doing their documented job. Not fixed here.
3. **Documented (design, for Steve): the war road can't stage inside the
   leg window reliably.** 3/8 seeds never staged (revolt churn vs the
   28-day seasoning bar); the one mercy staging came at d158, outside
   days 80–140. The conquest road's national moment lands late or never
   — the anti-speedrun season bar and the rebellion rate are in tension.
   A design question, not a bug.
4. **Documented (harness): STRIKE never fired in the wild.** All 49
   answered raids yielded via TERMS (the policy only raids fights it can
   win bloodlessly). Strike casualties are proven in test-national-shapes
   but unobserved in journey play — the strike path's lived cost is
   unmeasured.
5. **Carried:** table 0/8 on the conquest road (win-path axis; endgame leg
   owns it); wave-4 readiness 0/32 across all roads now (endgame/wave
   axis owns the gate).

## VERDICTS

- **REACHABLE: partial.** The road's machinery all fires (raids, terms,
  duress tribute, revolts, all three court answers, release dissolving
  aloud). But the national moment is unreliable inside days 80–140: 3/8
  seeds never staged, and the holdings all failed (M2 NO-GO). With the
  mercy fix, the kind-conqueror path now holds its promised season; the
  yoke path's holding remains rebellion's gamble.
- **FUN: yes, with teeth.** The Iron Court is the best-played beat on the
  scale ladder — three genuinely different answers with real costs. The
  release path (cages opened, village intact) is a complete story. The
  war road's villages read like war memorials, which is the point.
- **WINNABLE: partial.** 5/8 villages survived to d140+; national was held
  at run end on 0/8 (pre-fix). The road is survivable; the realm is not
  yet holdable without constant tending. The mercy fix is the first step;
  the yoke's rebellion rate is Steve's call.

## METRIC REVIEW

- M2 as scoped was half METRIC-BROKEN: lumping mercy+yoke under "holding
  answers" ignored that the yoke's DESIGNED price is rebellion risk —
  the bar (≥half hold to run end) was mis-scoped for yoke. The mercy half
  was a genuine mechanism bug (fixed). Next conquest run should split M2:
  mercy-hold (grace then earned bar) vs yoke-survival (realm alive at
  run end OR dissolved by rebellion aloud — the honest price, measured
  not as failure).
- M3's "conquest mechanic" bar was satisfiable by raids alone (8/8); the
  interesting halves are revolt/sabotage and the court answers — a future
  run could require ≥1 of each kind.
- M5's "national held OR reach d140" is the right death-aware shape; keep.
- The wave-4 secondary is now 0/32 across all roads — the question has
  converged (CONCEPT-DEAD for "any road feeds the gate organically"):
  the readiness gate is only reachable by deliberate combat grinding.
  Park the secondary; the endgame/wave axis owns it.
- Convergence state for the conquest leg: `converging` — the road stages
  and plays; holding is the open question (mercy fixed, yoke documented).

## TELEMETRY CHECK

Ran `telemetry-check.js` against scale-conquest.json (seeded 02:06 today,
pre-fix). Two LOUD lines, both investigated:
- `markerCounts.revolt swung 195%: baseline 21 -> current 62` — EXPLAINED,
  not a bug. r7's per-answer rotation kept 3 yoke seeds' conquered links
  raw at trust 3–31 for months (revolt 5%/wk/link at trust<30); r6's
  mercy-heavy mix cleared conquered flags at the court, ending revolt
  risk. Road-shaped, mechanism-understood.
- `markerCounts.duressTribute newly appeared: baseline 0 -> current 88` —
  EXPLAINED. The baseline JSON lacks the key (not seeded from r6's
  JSONs, which track it); the r6 and r7 harnesses track it identically.
  Baseline gap, not a game change.
Baseline NOT rolled forward: it predates the mercy fix, and the fix
changes post-mercy revolt dynamics — re-seed after the fix lands and the
loops re-measure.

## Files

- This note: `evidence/2026-10-18/run-scale-1046.md`
- Harness: `scripts/journey-scale-r7-20261018.js` (r6's warcourt harness,
  fresh seeds 9501–9508 + per-answer rotation, EVIDIR 2026-10-18,
  DAYCAP default 185)
- Proof test: `scripts/test-iron-court-mercy-20261018.js` (RED→GREEN,
  3 seeds × 12 assertions)
- Fix: `src/js/hierarchy.js` (mercyUntil grace + _linkSeasoned waiver +
  beat copy); canon: `docs/SCALE.md` (MERCY bullet)
- Policy: `scripts/policies/warcourt.js` (unchanged, from r6)
- Evidence: `evidence/2026-10-18/journey-scale-r7-warcourt-{9501..9508}.json`
- Transcripts: `evidence/2026-10-18/journey-scale-r7-transcript-<seed>-day{80,100,120,140}.txt` (31 files; 9508 died d28)
