# Journey SCALE r7 — the CONQUEST road verdict (2026-10-18)

Retrospective analysis of the 8 committed r7 seeds (`journey-scale-r7-warcourt-9501..9508.json`),
which closed r6's open documentation gap (r6 measured the conquest road shape but left no run
note: no verdict, no census, no people check). Seeds 9501–9508 ran pre-fix: the run discovered
the Iron Court MERCY trap mid-analysis and fixed it in the same commit (58179595e) — see
"fix" note below. Policy: warcourt (competent + conquest force play; raids from day 35,
terms-first answers, Iron Court answer per seed via env).

Pre-registered coverage: MERCY on 9501/9502/9507, YOKE on 9503/9504/9508, RELEASE on 9505/9506.

## Metric verdicts (binding, pre-registered in scripts/journey-scale-r7-20261018.js)

- **M1 staging — ≥2/8 seeds stage the Iron Court by d140: GO.** Staged by d140: 9503 (d94),
  9504 (d94), 9505 (d94, release), 9506 (d114, release) = 4/8. 9502 staged at d158, outside
  the leg window. 9501 never staged (8 terms-answered raids, 11 revolts — the war-realm kept
  coming apart, so the court's bar of 3 active conquered fires was never met; the offer's
  absence is honest, not a bug: "The Iron Court never sits — the war-realm came apart before
  the conquerors arrived."). 9507 died d126 pre-court; 9508 died d28, before raids even began.
- **M2 hold — of mercy/yoke seeds staging national, ≥half still hold nationalLive at run's
  end: NO-GO (pre-fix).** 9502 (mercy, staged d158): national-off at d159 — held ONE DAY.
  9503 (yoke, staged d94): held 33 days, dissolved d127. 9504 (yoke, staged d94): held 10
  days, dissolved d104. 0/3 hold at end. The MERCY trap is the headline: the beat promises
  "a season," but MERCY clears the conquered flags, flipping the hold bar from season-only
  (conquest) to season+trust-40 (lead) overnight, while +8 on strike-trust 15 lands at 23 —
  short of 40. The kind answer was a trap. FIXED in-commit (MERCY-GRACE, hierarchy.js:
  eased links carry mercyUntil=day+30; _linkSeasoned waives the trust component for polity
  membership while grace holds; after the season the LEAD bar applies honestly — dissolve
  aloud if unearned). Proof test `scripts/test-iron-court-mercy-20261018.js` RED→GREEN on 3
  synthetic seeds. NOTE: the 8 committed seeds are PRE-fix measurements — the grace window's
  effect on a full run is NOT yet re-measured (open item: re-run mercy seeds post-fix).
- **M2b release — the realm dissolves ALOUD and the village survives the aftermath: GO.**
  9505 (answered d94, res "released") survived to d179; 9506 (answered d114) survived to
  d178. Both show polityDissolve:2 (aloud dissolutions, not silent). Both kept raiding
  afterward (policy keeps mustering — the road stays open after a dissolve, by design).
  Release is the only answer family with 2/2 survival.
- **M3 conquest mechanics — ≥1/8 seeds fire a conquest mechanic beyond the court: GO.**
  Raids answered: 6–8 per seed (49 answered musters total across the 8 seeds). Revolt
  markers: 4–14 per seed (the trust<30 rebellion layer fires on every seed that sustains a
  realm). Duress tribute weeks: 6–16 per seed (7,000 kcal ×1.25 rate honored — see marker
  counts below). The raid layer is busy, legible, and priced.
- **M4 people — ≥8 transcripts sense-read, 0 senseless flags: VERDICT BELOW.**
- **M5 winnable — ≥3/8 seeds end with national held OR reach d140: GO (5/8 reach d140).**
  National was held at end by 0/8 — but 9501 (d164), 9502 (d187), 9503 (d187), 9505 (d179),
  9506 (d178) all reached d140. Pre-fix, "held" never survived the leg.

## Census in plain words

Five villages survived, three were lost. Nobody staged global (0/8); the war road topped out
at national (3/8 staged, all lost before run's end, pre-fix).

- **9501 (mercy-planned, survived d164):** 6 survivors — Brian the zookeeper and Mara the
  army medic (the knowledge core, 66/63 plants known), Ursula the mortician, Ivy the
  journalist. 10 dead, including Devon (d12, monster), Sam (d109), Aria (d139), Oliver
  (d163). The village that fought hardest and conquered nothing: 8 raids, 11 revolts, 16
  duress weeks, 29 fights — the realm never held together long enough for the court to sit.
- **9502 (mercy, survived d187):** 9 survivors — Quinn the bartender, Lena the ER nurse,
  Hank the chef, Nora the tailor (knowledge broad and deep, 53–57 plants each). 6 dead,
  including Katarina (d77). Staged the court at d158 — the latest staging in the set —
  and lost the realm the next morning: the MERCY trap, caught red-handed in the scaleLog.
- **9503 (yoke, survived d187):** 6 survivors — Paola the pharmacist, Elif the housekeeper,
  Zoltan the mushroom grower, Deivis the social worker (steady, not grieving — the yoke
  village keeps its footing). 10 dead, incl. Jesse and Lena (both d153), Nikolai (d173).
  Held national 33 days — the longest hold of the run — before the revolt price came due.
- **9504 (yoke, LOST d140):** 5 survivors — Willow the zookeeper, Mara the army medic, Wei
  the beekeeper. 9 dead. Held national 10 days (d94→d104), then the realm dissolved; the
  village followed at d140. The yoke can cost you everything.
- **9505 (release, survived d179):** 8 survivors — Brayden the florist, Adaeze the teacher,
  Dmitri the repair tech, Aurora the mechanic. Only 3 dead, ALL unnamed generated villagers
  (0 named-roster deaths) — the release seed is the gentlest village in the set. The realm
  dissolved aloud at d94 and life went on.
- **9506 (release, survived d178):** 5 survivors — Tashi the arborist, Hassan the butcher.
  13 dead, incl. Naran (d76), Aki (d78), Somchai and Ines (both d122), Nikolai (d137) — the
  bloodiest release-adjacent village; the release answered at d114 came late in a hard run.
- **9507 (mercy-planned, LOST d126):** 2 survivors — Olivia the social worker, Gulsara the
  street artist. 15 dead, the last four in a d117–d124 cascade (visjoin_69, Mara, Ava,
  Quinn, app join). 14 revolts. The village was dying before the court ever mattered.
- **9508 (yoke-planned, LOST d28):** 5 survivors — Bao, Aki, Grace, Nina. 8 dead, six to
  STARVATION (d18–d28) plus Sari to sickness and Fl2p2gn to a wound. The war road never
  began: a pre-scale starvation collapse, death-aware and honest.

Pattern: the conquest road's villages run lean (5–9 survivors) and grieving; knowledge
concentrates in 2–3 veterans per village. Named-roster deaths cluster in the yoke seeds
(9504: 4 named; 9506: 5 named; 9503: 3 named) — force has a cost line, and it's written in
people, not kcal.

## Iron Court answer comparison (did the three answers read distinctly?)

YES — three different prices, legible in both text and telemetry:

- **YOKE** ("Tribute up 10%, terms standard, garrisons doubled. X kneel lower — and hate
  you cleaner. The realm holds. Fear is a kind of mortar. (Trust -12 with each.)"):
  holds 10–33 days, then the revolt layer collects. 9503: 12 revolts, 14 duress weeks,
  dissolved d127, village survived. 9504: 6 revolts, 6 duress weeks, dissolved d104,
  village lost d140. The yoke is fear-mortar: it WORKS for a while, and the price is
  continuous pressure, not instant collapse. Distinctly the conquest answer.
- **MERCY** ("The yoke comes off — tribute back to courtship terms, 4,000 kcal a week,
  and the hatred starts to decay. X don't trust it yet. They might, in a season —
  the realm holds them one season on the yoke's shadow. Earn their trust to 40 by then,
  or it comes apart. (Trust +8 with each.)"): pre-fix, the beat LIED — the realm
  dissolved the next morning because the trust bar flipped overnight (9502: d158→d159).
  The beat's own "or it comes apart" made the fix's honesty easy: post-fix the realm gets
  its season of grace, then the LEAD bar applies for real. Distinctly the trust-climb
  answer — a kindness with a deadline.
- **RELEASE** ("Haven opens the cages. X walk out free — the war-realm dissolves before it
  ever sat as a court. They'll remember the yoke. They'll remember the release longer."):
  dissolves aloud immediately (res "released", polityDissolve:2), no hold at all — and the
  village survives (2/2). Distinctly the principled-quit answer: you give up the scale to
  keep the people.

The beat text is voiced, specific, and honest about costs in all three branches. The copy
earns its keep.

## The wave-4 secondary: 0/8 — the war road's combat does not feed the readiness gate

The r7 question: does the war road's combat feed the wave-4 readiness gate that starved the
diplomacy roads (0/24)? Answer: NO. 0/8 seeds engaged wave-4 anything — no wave-4
monsters in wavesFaced, engagedW4=0, and the village-standing war column reads war:0,
warPts:0 on EVERY seed — including 9501 (29 fights, 17 strikes, 158 stalemate-fled
encounters) and 9506 (28 fights). Raid combat does not move the war ledger at all.

Combined with the diplomacy roads' 0/24, wave-4 is starved across 32 committed runs. This
is the run's biggest blank: either the war-ledger instrument is blind to raid combat, or
the wave-4 gate's requirements are unreachable on every road. Documented precisely here;
the gate itself is a design question for the waves lane, not a drive-by fix.

## People check (M4) — 27/27 transcripts sense-read, 0 senseless flags

A dedicated reader sense-read all 27 committed transcripts (9508 has none — the village
died at d28). Per file: the NPC's want is concrete in every beat (food, foraging
partners, comfort, curiosity, news of the taken), player options engage or deflect it,
endings resolve/plant/owe. Nobody reads as a menu. Standouts: Raj the pharmacist
(9507-day80) — "I did the count twice. The count doesn't change. Nobody's worked the
north treeline by the fallen oak in days… Pack and knife. We travel light."; Hank the
chef (9502-day140) — "The fire feels smaller without Giuseppe. The rest of us will
have to be bigger."; Marco/Xavier (9502-day120, 9501-day120/140) — the no-shared-
language path, honored without fake translation ("They wave you off gently, already
turning away. The conversation ends where language couldn't reach.").

**M4: GO on its letter (≥8 read, 0 senseless).** But the reader flagged 7
"fabricated shared history" cases, and re-verification overturns most of them — this is
the honest plumbing finding of the run:

- **Giuseppe (9502-day140), Blanca (9507-day80): EXPLAINED, not fabricated.** Both are
  the MANTLE-MEMORY path (convoTopics.js): the village talks about a dead BEARER
  longer than the 3-day acute grief (10-day window). 9502's bearer died d131 (9 days
  before the d140 convo); 9507's bearer died d73 (7 days before the d80 convo). The
  names come from the lineage's recorded true name — the mantle passing is the run's
  central fiction, and the village remembering its dead bearers is the design working.
- **Amelia (9504-day140), Antonella (9506-day80): EXPLAINED, not fabricated.** The
  reader grepped the committed JSON for the names and found nothing — but the JSON
  stores corpse/death ids, not display names. 9504 had a fresh villager corpse at
  d138 (visjoin_82, inside the 3-day window at d140); 9506 had two (gen_wwlvs8h d77,
  aki_tanaka d78 — the "We lost Antonella and Aki" multi-name template). The names
  resolve via firstRef from the person records at runtime; the committed evidence
  can't adjudicate display names post-hoc. Methodological note: post-hoc blob greps
  cannot distinguish fabricated names from id-stored display names.
- **The show-event claims (Ernesto's Windfall/Blood Tithe/The Maw on 9505; Ava's Wrong
  Map on 9507): UNADJUDICABLE from committed evidence.** Windfall, The Wrong Map, The
  Blood Tithe, and The Maw are all REAL show types (contests.js), and 62–64 contest
  calls fired per seed — but the committed JSONs don't log which contest types ran,
  so "no Blood Tithe event in any log" is absence of evidence, not evidence of
  absence. The one that smells most: "They took you — The Maw" (9505-day140 claims
  the PLAYER was taken; 9505's player died only at d9 in combat).
- **REAL, defensible findings (generator-honesty plumbing, not voice):**
  1. **Verbatim beat repeats:** Paola's Aziza story (9503-day80 = day120, byte-
     identical) and Willow's Zeyu story (9504-day80 = day120) — no "still no news"
     acknowledgment. **FIXED this run** (see below).
  2. **Promise stacking:** Hank's ask_favor promised on days 80/100/120/140 with no
     fulfillment visible anywhere — owes that never land.
  3. **Want/content mismatches (2):** 9503-day140 (seek_taken header, solitude
     dialogue); 9506-day100 (seek_taken header, secret-sighting dialogue). The NPCs
     are sensible; the want labels are wrong.
  4. **Template-pool reuse:** teach reactions ("And I've been walking past it for
     weeks.") and mourning beats shared verbatim across NPCs — fine prose, but the
     NPCs don't have distinct voices in these pools.
  5. **Splice artifacts (minor):** "…I'm still asking. Seen worse." (9502-day80);
     "Boring. That is what they wrote down." (9503-day80/120); stage inflation
     (stage=3 jumped from stage 0 with no progression shown).
- **Iron Court beats: no player-facing text in the committed evidence.** The r7
  script commits marker counts, not the captured say lines — so YOKE/MERCY/RELEASE
  distinctness and the raid cost line can't be sense-read from the evidence. The
  beat text exists in src/js/hierarchy.js and reads distinctly (see "Iron Court
  answer comparison" above). R8's script commits scaleBeatText lines for its beats;
  the court-beat text gap stands as a recommendation for future verdict runs.

## Blank filled: taken-story repeat acknowledgment (convo-wants.js)

The r7 transcripts caught Paola (9503) and Willow (9504) re-telling their taken-kin
story byte-identical 40 days apart — the seek_taken engageBeat is deterministic from
kin data and never checked whether the story was already told. Fix: engageBeat now
checks the said-facts ledger (Steve 2026-10-07) — the first telling records
'taken-story'; repeats return a "Still nothing on X. I told you about the pods…"
variant that acknowledges the repeat instead of re-telling as if new. Proof test
scripts/test-taken-story-repeat-20261018.js: RED→GREEN observed on seeds 7/42/99
(first telling full, repeat differs and acknowledges, ledger holds the fact).
check.js --quick: 96 passed, 1 failed — the single failure is
test-sprite-aggro-20261012.js referencing pre-10-16-rebuild git object
6f134de2~1 (history rebuilt 2026-10-16; object gone), unrelated to this
dialogue-only change (diff: 13 insertions in src/js/convo-wants.js).

## Interesting findings / metric review

1. **M2 NO-GO stands as the run's headline; the fix is committed but un-re-measured.**
   The 8 seeds are pre-fix evidence. A mercy-seed re-run post-fix is the obvious r8/r9
   follow-up — the grace window (30d) needs a full-run proof, not just the synthetic
   test. Proposed: re-run 3 mercy seeds on current tip, expect national-held ≥30d with
   trust tending (the warcourt policy already tends non-conquered links; add tend
   pressure for eased links and see if a tended realm survives past d+30).
2. **9501's no-court outcome is a design feature, not a miss.** The Iron Court's bar (3
   active conquered fires) refuses to sit on a broken realm, and it says so aloud
   ("The Iron Court never sits — the war-realm came apart before the conquerors
   arrived. Broken yokes make gossip, not polities."). Reachable, legible, honest.
3. **The wave-4 gate is the dead end of this run.** 32 runs (8 war + 24 diplomacy) with
   zero wave-4 engagements. Flagging to the waves lane — don't let this sit silently.
4. **Beat text was not committed for the Iron Court answers** — M4's sense-read of the
   court beats relied on source text (hierarchy.js) because the r7 script commits only
   marker counts, not the captured say lines. R8's script commits scaleBeatText lines
   for its beats; the court-beat text gap stands as a recommendation for future verdict
   runs.
5. **M4's "0 senseless flags" is too weak a bar.** 27/27 transcripts were moment-to-
   moment sensible, but the real people-check failures were fabricated-history and
   verbatim repeats — which the metric didn't score. Proposed revision for the next
   run: "M4 — ≥8 transcripts sense-read, 0 senseless flags, 0 UNEXPLAINED
   fabrication flags" with the adjudication method fixed: resolve display names from
   the run's live person records (the committed JSON stores ids, not display names —
   post-hoc blob greps false-positive). The taken-story repeat fix closes the
   strongest repeat class this run.

## Verdict

- **Reachable:** YES. The conquest road stages on a competent war-play (raids from day
  35, terms-first answers); the Iron Court sat on 4/8 seeds, and its bar is legible
  when it doesn't (9501). All three answers fire with real, distinct consequences.
- **Fun:** YES, with the mercy asterisk. The yoke's fear-mortar vs the trust-climb vs
  the principled quit is a real choice with real prices; the revolt/sabotage layer keeps
  a held realm tense. The mercy answer was an anti-fun trap (the kind choice punished
  overnight) — now fixed, pending re-measure.
- **Winnable:** CONDITIONAL. 5/8 villages survived to d140+, so the road is survivable —
  but 0/8 held national at run's end pre-fix, and national is the road's win shape. Post-
  fix, the winnability claim needs the mercy re-measure. Release is an honest alternate
  win (dissolve aloud, keep the village).

Conquest road verdict: **GO with the mercy re-measure open.** The road plays, reads, and
costs like Steve's "force, not climbing" — and the one trap in it got fixed with a proof
test the same day it was found.
