# journey-scale r30 — THE THIRD BOND (2026-10-24, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261024T2143Z. Rotation read 3 → leg 3 SCALE
(days 80–140); wrote 3→0.
**Base:** master@a6104f891 (pulled at run start).
**Driver:** `scripts/journey-scale-r30-20261024.js` (r29 driver + weekly village
census: total / known / opinion / codex-studied / linked-kind per village, +
fixed covenant link-other mapping). **Analyzer:**
`scripts/analyze-scale-r30-20261024.js`. **Instrument proof:** r28 govClass
classifier test re-run green at this tip (7/7); the 4-seed run is the driver's
end-to-end proof.
**Pre-register:** `evidence/2026-10-24/journey-scale-r30-prereg.md` (written
before any sim).
**Policy:** scalecourt (competent + covenant-road courtship). **Seeds:** fresh
85001–85004. **Horizon:** DAYCAP=150, death-aware stop. Pilot seed 85001 ran
clean before the other three launched.

## Pre-registered leg question
r29: covenant road 0/4 national, best 2/3 bonds. Why does the third bond never
arrive? Candidates, in code order: village-count ceiling (map holds 3–4 villages,
covenant polity needs 3 seasoned peers, scalecourt spends the first link on a
primary-sub link); unknown candidates; opinion <10; declined/countered proposals;
seasoned-trust bar.

## Verdicts (binding — none re-scored)
- **T1 count-ceiling: REFUTED as the general explanation.** No seed was
  count-ceilinged. Splits grow the candidate pool: every seed ended with 5–7
  known villages (initial 3–4 plus `village_spl_*` fragments appearing ~d22–37,
  known immediately). maxPeers 4–6 on all seeds. The prereg's 3-village
  impossibility case never occurred — because the map does not stay at 3–4.
- **T2 blocker classification: OPINION <10 DOMINATES (2/2 non-reachers).**
  No seed stalled with a genuine at-bar candidate waiting: the analyzer's
  "atBarUnlinked=1" on every seed is the primary-sub village misdisplayed
  (snapshot linkKind missed kind-less primary links; census links are
  authoritative — see Instrument notes). True at-bar unlinked candidates: only
  85001's late split village (op 12, after national already sat). 85002's
  unlinked candidates sat at op 1–2; 85004's at op 0–8 (plus its one covenant
  formed only ~d145). Declines/counters: ZERO on all 4 seeds (barelyKnow 0,
  declinesCov 0, counters 0) — proposals are never the bottleneck; getting a
  candidate TO the bar is.
- **L1 stay-green: NO-GO (1/4 national ≤d140; bar ≥2/4).** 85001 national d114;
  85003 national d148 (8 days late — a near-miss, still a miss under §14).
  2/4 reached national by d151, but the d140 bar is the binding one.
- **L5 stay-green: GO (2/2 endings voiced).** 85001 scattered, voiced in full
  ("On the fifth hungry day, people started walking — in different
  directions. The scattering, again."). 85002 did not scatter — it died out,
  voiced in full ("No one is left to pick up the Codex. The village dies out —
  quietly, the way villages do. The season ends here."). Different ending
  class, same voicing standard; reported as-is, not re-scored.
- **M4 people: GO (content meaningful; 2 driver-picker artifacts, 1 fixed).**
  See People check.

## Mechanisms verified in the wild (not just in code)
- **Opinion climbs only on broadcast wins, and slowly.** Codex studies:
  0 on all 4 seeds; pilgrimages: 0 on all 4 seeds. The climb verb scalecourt
  was built to use (walk to their fire, study their codex, +3 once) never
  fired — the policy proposes only at/above the bar and otherwise waits on
  contest wins (+2 to every known village per win). Third bonds landed at
  ~d49/50 (85001's first two), d83 (85001's third), ~d73 (85003's first two),
  ~d108 (85003's third), ~d93/113 (85002's two), ~d145 (85004's only one).
  A third bond is a d80–110 event on this road, not a d40 one.
- **Trust fragility dissolves realms fast.** 85001: national d114, global
  d126, realm apart by d133 — its third covenant link's trust slid 52→34
  across the d126 sample, dropping seasoned count 3→2 (seasoned = age ≥30 AND
  trust ≥40). The cooling lines fire aloud (d127 Ashford, d140 Thornfield).
  A realm is a live relationship, not a title — and it can come apart 19 days
  after global. 85002's two covenants ended at trust 0 and 7: even had a third
  formed, the seasoned bar would have failed it.
- **The post-national pool WORKS (r29's open question, answered).** 85001
  drew 4,001 kcal in famine under the war-pact answer (d122: 2,405 + 596
  remainder note; d123: 596; d126: 1,000) — real food, written in the council's
  book, exactly as the covenant promised. 85003 reached national d148 too late
  for draws by d151 (pantry rich anyway). r29's "pool never exists
  pre-national" stands; post-national it pays.
- **The policy's own pantry gate throttles poor villages.** scalecourt
  courts only while pantry >12,000 kcal — a policy prudence rule, NOT a game
  rule (proposing costs no kcal). 85004's pantry sat below 12,000 for most of
  d35–d140 (samples 3,869–11,692), and it managed exactly 1 peer proposal all
  run. A real player could court while poor; this policy cannot. Named as a
  policy artifact, not a game bug.
- **Village-as-protagonist continuity holds.** Player bearers died in the
  arena repeatedly (85001: d21, d65, d111–142; the village kept playing under
  successors until its d146 scatter). Deaths are succession, not game over —
  until the last bearer falls (85002's die-out).

## Village assessments (plain words)
- **85001 (national d114, global d126, realm apart, scatter d146):** the
  league that lived and died. First link Emberhold (primary-sub, d25);
  covenants Stonebridge d49, Thornfield d50, Ashford d83; Founding Council
  d113–114 answered war-pact; granary drew 4,001 kcal in the d122–126 famine;
  global d126; trust slide dissolved the realm by d133; pantry bled to 0 and
  the 5th hungry day scattered the last bearer at d146. The full covenant arc
  in one seed: reachable, payable, losable.
- **85002 (scatter/die-out d139, regional):** the trust-collapsed one.
  Primary-sub Emberhold d25; covenants only with a split village (~d93) and
  Stonebridge (~d113) — both ended at trust 0 and 7. Unlinked candidates never
  climbed past op 2. Pantry collapsed d119→126 (12,707→94). Ended not with a
  scatter but a die-out: the last bearer fell in the arena and no one was left
  to pick up the Codex. Voiced, honest, bleak.
- **85003 (alive 9/9 at d151, GLOBAL):** the patient rich one. Pantry 40k–97k
  throughout; primary-sub Stonebridge d25; covenants Thornfield/Ashford ~d73
  and a split village ("The Hungry Road II") ~d108; national d148, global
  d149, held at d151 with all 3 covenants seasoned (trust 65/65/49). The
  covenant road's proof it can hold — it just arrives at d148, not d80.
- **85004 (alive 9/9 at d151, regional):** the poor one. Pantry mostly under
  12,000 from d35 on; primary-sub Thornfield d25; exactly one peer proposal
  all run; its single covenant (Ashford) formed only ~d145. Opinions crawled
  (best unlinked candidates op 18 is its own primary-sub village, which can
  never also be a covenant). Alive, fed, and stuck at one bond — the
  pantry-gate + slow-opinion stall in pure form.

## People check (SENSE-TESTING LAW — 8 transcripts read in full)
- **85003-d90 Joshua (seek_taken):** meaningful. "Have you heard anything?
  About the taken. The pods." → player promises to ask → "Even asking is more
  than the silence." A want, an engagement, an owed thread. GO. Same villager
  at d120 (pod dreams) lands the same way. GO.
- **85004-d90 Hannah (ask_favor):** meaningful. Wound needs a second pair of
  hands → player commits → "Careful with it. And — thank you." GO.
- **85002-d120 Keisha (night noises):** meaningful. Shared fear, shift-sleep
  revelation ("My body learned it before my head agreed. Columbus, Ohio never
  taught me that. The treeline did."). GO.
- **85001-d120 Fausto (no shared Spanish):** meaningful as designed — mime,
  no shared words, graceful close. The honest language-barrier beat. GO.
- **85001-d90 August (identity anchor):** content meaningful, driver-limited.
  "I was an ER nurse in Columbus, Ohio. Say it back to me sometime. I need to
  hear it stays true." The only choices were betrayal accept/decline — the
  driver left without engaging. A real want the picker couldn't answer; noted,
  not a content failure.
- **85004-d120 Zhanibek (curious) + 85002-d90 Keisha (confession):**
  driver-spammed as played. Zhanibek's dlg:more loop (6× "Tell me more")
  turns a coherent mechanism-vs-story voice into a lecture; Keisha's swimming
  confession got answered with 5 plant lessons because teach outranked
  dlg:react in the picker. Content on both sides is coherent; the picker
  hijacked the want. FIXED for future runs: dlg:react now precedes teach in
  the driver picker (driver-only change; r30 evidence used the old picker).

## Blanks filled / fixed this run (tooling only, zero src/js changes)
1. **Driver picker fix:** dlg:react now precedes teach (Keisha case above).
2. **Driver snapshot fix:** villageWatch linkKind now derives 'primary-sub'
   for kind-less primary links (census already did; the snapshot didn't —
   hence the analyzer's "atBarUnlinked=1" artifact on every seed).
3. **Analyzer fixes:** seasoned bar corrected to age ≥30 (code's
   `_linkSeasoned`, not 28); pool drawn now parsed from capture draw lines
   (weekly poolWatch samples read 0 on 85001 despite 4,001 drawn — pours and
   draws happen mid-week between samples).
4. **Mid-run naming fix (honest record):** the pilot's evidence dir was first
   created as `journey-scale-r30-covenant` (a copy artifact); it was renamed
   to `journey-scale-r30-thirdbond` with all pilot files renamed consistently
   BEFORE the other three seeds ran. No evidence was lost or duplicated.

## Metric review
- No metric re-scored mid-run. L1 reported NO-GO as bound (85003's d148 is
  noted as a near-miss, not a pass).
- **T1 framing lesson for the NEXT run:** pre-registering "3-village map ⇒
  impossible" was wrong at the world level — splits exist and arrive early.
  The next covenant run should pre-register the opinion-climb question
  instead: is a d80–110 third bond the intended pace, or should a climb verb
  (codex pilgrimage, aid, gifts) actually fire in competent play? The 0/4
  pilgrimage rate is the sharper datum than any count ceiling.
- **L5 wording lesson:** the metric said "scattered seeds voiced"; 85002
  died out instead. Both endings are voiced; future preregs should say
  "every ending voiced" and name the class.
- **Telemetry check:** LOUD on all 7 scale-covenant baseline metrics — ALL
  EXPLAINED as instrument-shape mismatch, not a disappearance: r30 census
  JSONs carry no markerCounts/fightsTotal fields (r29's driver didn't either;
  its "quiet" check used census-native metrics). The underlying mechanisms
  are present in-capture: Founding Council on 2/4 seeds, pool draws 4,001
  kcal, defense calls answered, national on 2/4. Baseline NOT rolled (nothing
  to roll; shape mismatch, not drift).
- **Test suites:** r28 instrument test ALL GREEN 7/7 at this tip. npx jest
  finds no jest config in this repo — suites are standalone node scripts
  (r29's note stands).

## Reachable / fun / winnable (scale leg, covenant road)
- **Reachable:** covenant national IS reachable (2/4 by d151) but late
  (d114, d148) and fragile (one realm dissolved 19 days after global). A
  player who survives to d140 has roughly even odds of sitting at a council
  by d150 — the leg's content is reachable, just not on the leg's own clock.
- **Fun:** the arc pays when it lands — the war-pact council, the famine
  draws, the global beat are all voiced and earned. The sour notes are the
  long silent middle (d50–d110 of opinion-watching on poor runs) and the
  realm that dissolves without a saveable moment (trust slid 52→34 with only
  cooling lines as warning — no renegotiation beat fired on 85001).
- **Winnable:** the table approach opened on the covenant road (lesser seat
  on all 4 seeds by arc 4; global on 2/4). The full seat still needs wave-5
  deeds no scale seed has shown — that remains the endgame leg's question,
  not this leg's.

## Evidence
`evidence/2026-10-24/journey-scale-r30-thirdbond/` — 4 census JSONs, captures,
beats/moments/table/gov dumps, 8 transcripts. Driver + analyzer + prereg + this
note under `scripts/` / `evidence/`.

## Ops
- Rotation: `journey-rotation-a.txt` → 0 (3→0).
- Commit: tooling + evidence only, zero src/js changes. No [needs-eyes] — no
  player-facing change; the pace/fragility questions below are Steve's calls.
- Master did not move during the run (a6104f891 throughout).

## Steve's calls parked (not worker decisions)
1. **Third-bond pace:** is a d80–110 third covenant bond the intended pace,
   or should competent play actually use a climb verb (pilgrimage/codex/aid)
   instead of waiting on broadcast wins? Pilgrimages fired 0/4 seeds.
2. **Realm fragility:** 85001's realm dissolved 19 days after global on a
   single link's trust slide (52→34), with cooling lines but no saveable
   beat. Intended "realms are live relationships" fragility, or too brittle?
3. **Poor-village courtship:** scalecourt's >12,000 kcal pantry gate is
   policy prudence, not a game rule — a real player could court while poor.
   Should the policy drop the gate (next run's question), or is courting
   while poor meant to feel unaffordable?
4. **r29's pool-copy observation stands:** the covenant formation line still
   promises "a shared pool" ~100 days before any pool can exist; r30 proves
   the pool pays post-national. Copy change vs mechanism change is still
   Steve's call.
