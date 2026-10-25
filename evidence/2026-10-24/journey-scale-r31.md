# journey-scale r31 — THE PILGRIMAGE THAT NEVER LEFT (2026-10-24/25, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261025T0207Z. Rotation read 3 → leg 3 SCALE
(days 80–140); wrote 3→0.
**Base:** master@2975c45d3 (pulled at run start).
**Driver:** `scripts/journey-scale-r31-20261024.js` (r30 driver, seeds/names only).
**Analyzer:** `scripts/analyze-scale-r31-20261024.js` (r30 analyzer, names only).
**Policy:** scalecourt with ONE fix (below). Pantry gate UNCHANGED.
**Pre-register:** `evidence/2026-10-24/journey-scale-r31-prereg.md` (written
before any sim).
**Seeds:** MATCHED to r30: 85001–85004. Same starting worlds, same driver,
same horizon (DAYCAP=150, death-aware stop). Pilot seed 85001 ran first and
passed the prereg gate (pilgrimages 4 > 0) before the other three launched.
**Instrument proof:** the 4-seed run is the fix's end-to-end proof (r30's
convention); `node --check` clean on the policy, driver, and analyzer.
Console summary header still prints "R30 SUMMARY" (sed artifact in the
copied driver) — cosmetic only, noted here, not worth a re-run.

## Pre-registered leg question

r30: pilgrimages 0/4, codex studies 0/4, on seeds where eligible below-bar
candidates existed all run. Why did the climb verb never fire?

## The fix (policy tooling only, zero src/js changes, zero game-bar changes)

`scripts/policies/scalecourt.js`, pilgrimage start gate: it read the
scholar's health as `s.hp` / `s.maxHp`. The scholar's hit points live in
`scholar.health` (game.js syncs it from the fighter; max via
`Game.maxHealth()`), and `scholar.hp` / `scholar.maxHp` are never set — so
hpPct was always 0, never > 0.7, and no pilgrimage ever started. The fix
reads `s.health ?? s.hp` with max from `Game.maxHealth()`. r30's "opinion
climbs only on broadcast wins" was therefore a POLICY-ARTIFACT finding, not
a proven game fact. This run re-measures with the climb actually running.

## Verdicts (binding — none re-scored)

- **F1 pilgrimage fix fires: GO.** Pilgrimages ≥ 1 on 4/4 seeds (4, 17, 9, 5;
  r30: 0/4) and climbStudies ≥ 1 on 4/4 (4, 17, 3, 1; r30: 0/4). The gate
  was the break. Completion is a second, separate fragility: 4/4, 17/17,
  3/9, 1/5 completed. Dropped pilgrimages expire on the 14-day staleness
  rule or on interruption — and the whole courtship block (including an
  in-progress pilgrimage) sits behind the >12,000 kcal pantry gate, so a
  poor stretch FREEZES a pilgrimage until it expires. Worst on 85004
  (pantry under 12,000 for most of d35–d140 in r30; 1/5 completed here).
- **P1 third bond by d110 on ≥ 3/4: NO-GO (2/4).** 85001 third bond week d49
  (r30: d84) and 85003 week d98 (r30: d112) — both moved earlier. 85002 never
  reached a third bond; 85004 never did. The misses have DIFFERENT blockers
  (analyzer): 85002 count-ceiling in its DIVERGED world (only 3 villages
  total in r31 vs 5 in r30 — matched seeds diverge once the policy changes
  the RNG stream, so its split villages never arrived); 85004 opinion<10
  (best unlinked at-bar candidates exist but the pantry gate starved
  courtship). P1's miss is not "the climb doesn't work" — it is "the climb
  alone doesn't clear every gate."
- **L1 stay-green (national ≤ d140 on ≥ 2/4): NO-GO (1/4, same count as
  r30).** Only 85001, but at d77 (r30: d114) — 37 days earlier, global d78
  (r30: d126). 85003 reached 3 bonds by d98 yet never national: its
  covenants ended at trust 25/30/30, below the seasoned bar (age ≥ 30 AND
  trust ≥ 40) — the seasoned-trust bar is now the named next bottleneck
  on that seed, where r30's same seed reached national d148 at trust
  65/65/49. Earlier bonds do not automatically mean healthier bonds.
- **L5 stay-green (every ending voiced, class named): GO.** 85001 died out,
  voiced in full ("No one is left to pick up the Codex. The village dies
  out — quietly, the way villages do."). 85003 scattered, voiced in full
  ("On the fifth hungry day, people started walking — in different
  directions."). 85002 and 85004 alive at the d151 cap — no ending owed.
- **M4 people: GO on content, NO-GO on the picker as played.** All 8
  transcripts carry a real want (see People check). 4/8 as played are
  marred by the driver picker looping dlg:more / goon ("Tell me more" ×7,
  "I'm listening" ×3) instead of reacting or leaving — the content is
  coherent, the as-played conversation lectures. Named as driver, not
  content, exactly as r30 did.

## Mechanisms verified in the wild (not just in code)

- **The climb moves the whole ladder when it runs.** 85001: bonds d~42–49
  (r30: d49/50/83), national d77 (r30: d114), global d78 (r30: d126). The
  seasoned clock (third bond + 30 days) explains both runs' national days
  almost exactly — bond timing IS national timing on the covenant road.
- **Pilgrimage volume is not bond volume.** 85002 walked 17 pilgrimages
  and studied 17 codexes, yet formed only 2 covenants (its world held just
  3 villages after divergence) — and its 2 covenants ended at trust 67/66,
  the healthiest of the run, vs r30's 0/7. Climbing hard without a third
  village to climb toward buys nothing.
- **Earlier is not automatically safer.** 85001 global at d78, then the
  village died out d125 in a mass arena day (7 bearer deaths d125, last
  bearer Quinn Murphy in the arena) — 21 days earlier than r30's d146
  scatter, and a different ending class. The scale arc completed far
  earlier; arena attrition, not scale failure, ended it. Reported as
  divergence, not blamed on the fix — the fix changes the RNG stream from
  the first pilgrimage onward, so later deaths are not a controlled
  comparison.
- **The pantry gate is now the sharpest policy artifact on the table.**
  It blocks new courtship AND freezes in-progress pilgrimages (85004: 1/5
  completed). A real player courts while poor; this policy still cannot.
  That arm — dropping the gate — is the next run's question, not this
  run's silent change.

## Village assessments (plain words)

- **85001 (national d77, global d78, died out d125):** the league that
  lived fast. Primary-sub Emberhold; covenants Stonebridge/Thornfield/
  Ashford by d49; pool live (peak 29,554 kcal); global d78; then arena
  attrition emptied the village by d125. The covenant arc, complete and
  early — and then the village ran out of people, not food.
- **85002 (alive 9/9 at d151, regional):** the climber with nowhere to
  climb. 17 pilgrimages, 17 studies, 2 covenants at trust 67/66 — healthy
  bonds, but its diverged world held only 3 villages, so a third covenant
  was structurally impossible. Alive, rich (pantry 53,157), and capped by
  the map it drew.
- **85003 (3 bonds by d98, scattered d146, regional):** the early-but-
  fragile one. Same three covenants as r30, formed ~2 weeks earlier, but
  trust slid to 25/30/30 and the seasoned bar never cleared; pantry hit 0
  and the fifth hungry day scattered it. Earlier bonds, weaker bonds —
  the trust question, not the bond-count question, is what stopped it.
- **85004 (alive 8/8 at d151, regional):** the poor one, still poor.
  Exactly 1 covenant (Ashford); 5 pilgrimages started, 1 completed — the
  pantry gate froze the rest. Opinions crawled (unlinked candidates at
  op 7–10 at end). Alive, fed at the cap, and stuck at one bond — the
  pantry-gate stall in pure form, now with the freeze mechanism named.

## People check (SENSE-TESTING LAW — 8 transcripts read in full)

- **85001-d90 Irving (curious):** want + plant ("Show me when we work
  together"), marred by picker goon ×2. Content GO, as-played driver-
  marred.
- **85001-d120 Talgat (ask_favor, wound):** clean GO. "Will you?" → commit
  → "Thank you." A want, an engagement, a resolution.
- **85002-d90 Domfeh (ask_favor, forage together):** meaningful — details
  engaged, deflect taken with consequence ("They won't ask twice"), then
  a picker goon re-ask after the deflect that doesn't hear the no. Content
  GO, as-played driver-marred.
- **85002-d120 Sanne (curious, regrets):** content meaningful — "I regret
  the ordinary days I rushed through… I'd pay anything for one annoyed
  morning now" — stretched by picker goon ×3 into a loop. Content GO,
  as-played driver-marred.
- **85003-d90 Joshua (seek_taken):** clean GO. Pod dreams → promise to ask
  → "Even asking is more than the silence."
- **85003-d120 Joshua (leadership):** content on-point for the scale leg —
  a villager deciding to step up ("Leadership isn't a title. It's the
  person who stays up wondering if everyone ate.") — but the picker chose
  dlg:more 7 times running, turning a conversation into a monologue.
  Content GO, as-played the run's clearest picker failure.
- **85004-d90 Dorothy (ask_favor, already resolved):** clean GO, short and
  honest — "Never mind the food I needed — we got it handled."
- **85004-d120 Dorothy (ask_favor, wound):** clean GO. Commit → "Careful
  with it. And — thank you."

## Blanks filled / fixed this run

1. **Pilgrimage gate fix (policy tooling):** `scripts/policies/scalecourt.js`
   reads `scholar.health` / `Game.maxHealth()` instead of the never-set
   `scholar.hp` / `scholar.maxHp`. Proven by the 4-seed run itself
   (pilgrimages 4/17/9/5 vs r30's 0/0/0/0). Zero src/js changes.
2. **Driver + analyzer copies:** r31 pair, matched seeds, same instruments.
3. **Documented, NOT fixed this run (discipline — each needs its own
   measured arm):**
   - (a) **Picker more/goon loop:** cap consecutive dlg:more/goon picks
     (then react or leave). Evidence: 4/8 transcripts above. Next run's
     driver fix, with before/after transcript proof.
   - (b) **Pantry-gate courtship arm:** drop the >12,000 kcal gate (it
     freezes in-progress pilgrimages, 85004: 1/5). Next run's policy arm,
     matched seeds again.
   - (c) **Same field-name bug class in `scripts/policies/competent.js`
     `recovering()`** (line ~2458): reads `s.hp` / `s.maxHp` on the scholar,
     so the "healed at haven" early-out never fires and recovery always
     runs its full 2 days. Confirmed scholar context; NOT fixed here
     because it would change the base policy mid-comparison — it needs
     its own fix + measurement arm. (A wider `scholar.hp` grep shows the
     pattern elsewhere, e.g. shark.js:102 — audit, not claim: only
     competent.js recovering() was confirmed as scholar context.)

## Metric review

- No metric re-scored mid-run. P1 and L1 reported NO-GO as bound, with the
  mechanism behind each miss named (count-ceiling-by-divergence, pantry
  gate, seasoned-trust bar) rather than softened.
- **F1 wording lesson for the NEXT run:** "pilgrimages ≥ 1" is now too
  weak a bar — the fix fires everywhere. Next run should pre-register
  pilgrimage COMPLETION rate and the pantry-gate arm's effect on it.
- **Matched-seed lesson:** matched seeds are matched at world-gen, not
  throughout — a policy change rewrites the RNG stream, so split counts
  (85002: 5 villages r30 → 3 r31) and later deaths are divergence, not
  controlled comparisons. Bond/national timing differences in the first
  ~50 days are the clean comparison; everything later is reported, not
  attributed.
- **Telemetry check:** LOUD on all 7 scale-covenant baseline metrics —
  ALL EXPLAINED as instrument-shape mismatch, same as r30: r31 census
  JSONs carry no markerCounts/fightsTotal/maxGameDay fields (that baseline
  is from a different instrument). The mechanisms are present in-capture:
  national on 1/4 (d77), global d78, defense calls answered, pool live
  29,554 kcal peak. Baseline NOT rolled (shape mismatch, and rolling a
  policy-change run into the baseline would bake the policy change in).
- **Test suites:** `node --check` clean (policy/driver/analyzer); quick
  gate: `node scripts/check.js --quick` → 280 passed, 7 failed in 1639s.
  The 7 failures are PRE-EXISTING and unrelated: measurement-comparison,
  measurement-proof-update, measurement-workflow (proof-freshness),
  mobile-combat-cadence (Continue wrap), occupation-panels (CLI workflow),
  phone-frame-proof (stale phone evidence / boot-input coverage),
  test-parity-20261014 (gear: spear and jacket). Proof: all 7 were re-run
  with a pristine HEAD `scalecourt.js` (fix temporarily reverted, then
  restored byte-identical — diff 8 insertions / 1 deletion re-verified,
  `node --check` clean) and all 7 still failed. No godpath test requires
  `scalecourt.js`, and this run changed no src/js, docs, or phone-proof
  inputs those suites read. npx jest finds no jest config in this repo —
  suites are standalone node scripts (r30's note stands). The first
  --quick attempt's output was lost to a cleared session; the re-run above
  (log: goal hidden_files/check-quick-r31.log) is the reported result.

## Reachable / fun / winnable (scale leg, covenant road)

- **Reachable:** covenant national IS reachable much earlier with a
  working climb (d77 on 85001) — but still only 1/4 by d140, and the
  binding constraint moved from bond-count to trust-seasoning and to the
  pantry gate. The leg's content is reachable; its clock is now set by
  trust, not by bond discovery.
- **Fun:** the arc pays earlier and the same way — council, pool, global
  beat all voiced. The sour notes are the same two, sharpened: the picker
  lecturing through good content (4/8 transcripts), and realms/bonds that
  form early but sit below the trust bar with no visible path to raise
  trust (85003's 25/30/30 with no saveable beat named).
- **Winnable:** the table approach opened on the covenant road (lesser
  seat; global on 1/4, national on 1/4 by d140). The full seat still needs
  wave-5 deeds no scale seed has shown — that remains the endgame leg's
  question, not this leg's.

## Evidence

`evidence/2026-10-24/journey-scale-r31-thirdbond/` — 4 census JSONs,
captures, beats/moments/table/gov dumps, 8 transcripts. Driver + analyzer +
prereg + this note under `scripts/` / `evidence/`.

## Ops

- Rotation: `journey-rotation-a.txt` → 0 (3→0).
- Commit: policy fix + driver/analyzer + evidence only, zero src/js
  changes. No [needs-eyes] — no player-facing change; the pace/trust/
  pantry-gate questions below are Steve's calls.
- Master did not move during the run (2975c45d3 throughout).

## Steve's calls parked (not worker decisions)

1. **Third-bond pace, re-posed with a working climb:** with pilgrimages
   actually running, the third bond arrives d49–98 instead of d83–108.
   Is that the intended pace, or should the climb be rarer/costlier?
2. **Trust-seasoning bar:** 85003 formed 3 bonds early but sat at trust
   25/30/30 — is trust supposed to be the binding constraint after bonds,
   and if so, what visible verb raises it?
3. **Poor-village courtship:** the pantry gate now demonstrably freezes
   in-progress pilgrimages (85004: 1/5). Should the policy (and by
   extension the game's feel) let a poor village court, or is courting
   while poor meant to feel unaffordable?
4. **r29's pool-copy observation stands:** the covenant formation line
   still promises "a shared pool" ~100 days before any pool can exist;
   r31 proves the pool pays post-national (peak 29,554 kcal on 85001).
   Copy change vs mechanism change is still Steve's call.
