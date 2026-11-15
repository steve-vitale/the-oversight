# sim-onlylead-b — DIAG: why only the lead shape stages + Stage 2 covenant build (killed at smoke)

Run: fleshout-loop-b-20261115T1055Z (Loop B), arm sim-onlylead-b
Axis: winnability chain. DIAG arm — findings backlog #2358
("ONLY THE LEAD SHAPE STAGED, SECOND BAND").
Branch: sim-onlylead-b — worktree ~/workspace/worktrees/sim-onlylead-b
Base: master at worktree creation (9fa74d252)
Date: 2026-11-15
Prereg: evidence/2026-11-15/sim-onlylead-b-prereg.md (binds G1/G2/G3
for Stage 1; Stage 2 addendum + pre-run amendment in the same file)

## Verdict: DIAG GO — DIAG-POLICY-CANDIDATE (Stage 1); Stage 2 build KILLED at smoke as SUBSTRATE-MISSING (pilot NOT spent)

- **G1 INSTRUMENT VALIDITY — GO.** Full per-day link roll + shape-
  candidate roll on all 16 configs, **0 instrument errors**,
  **0 unattributed diplomacy points** (up AND down, telescope gap 0
  both legs), **0 UNCLASSIFIED shapes** across all 40 shape-seed
  cells per leg (bar ≤1 per 8 seeds). Every staged beat classified
  by shape with sat/unsat: 5 lead beats armed, all sat; 5 staged-
  but-unanswered baseline. The shape-candidate roll is the engine's
  own staging predicates (`polityOf('haven')`, `_belongPolity()`,
  `_covenantPolity()`, `_tradePolity()`), proven against
  `_havenPolity` in the proof test.
- **G2 THE DIAG — DIAG-POLICY-CANDIDATE.** Per shape, armed leg
  (the baseline leg names the identical blockers on every seed —
  the road state is the same until a beat stages):
  - lead: staged **5/8** (all sat).
  - conquest: `conquest-no-raids` **8/8** — 0 conquered subs ever;
    the policy never raids.
  - covenant: `covenant-no-peer-links` **8/8** — 0 covenant peer
    links ever formed; the policy never proposes covenant, and the
    engine never proposes either (0 proposeCovenant / proposeTrade /
    raidVillage calls by EITHER caller band-wide; 0 _formPeerLink
    events).
  - trade: `trade-no-peer-links` **8/8** — same.
  - belong: SPLIT — `belong-no-sub-link` 5/8; good-standing
    failures 3/8 (`belong-arrears:20000`, `belong-arrears:5000`,
    `belong-trust-short:40`). Belong never qualified on 8/8, but
    no single blocker reaches the ≥6/8 reproducibility bar — the
    split itself is the diagnosis (see below).
  The G2 ≥6/8 same-blocker bar is met for conquest, covenant and
  trade (8/8 each). The dominant diagnosis is POLICY-side: the
  policy walks only the lead road, and the game would stage the
  other shapes if the policy walked them. Foreign polities DO reach
  4–5 villages on 6/8 seeds, so the BELONG precondition is not the
  blocker — the blocker is Haven never being a subordinate in good
  standing.
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes in the branch diff;
  proof tests green (test-onlylead-b 29/29 incl. determinism;
  test-covenant-b 33/33 incl. determinism).
- **STAGE 2 — BUILD KILLED AS SUBSTRATE-MISSING, pilot NOT spent.**
  The covenant-road policy was built and proven (static + live
  smoke green), but its Stage 0 smoke showed zero contact: the
  engine's opinion-10 prerequisite for peer proposals is only met
  at ~day 150 from a cold start (probe: max known opinion 2→4→6→8
  →10 over 150 days on both probed seeds), so the first covenant
  beat is structurally past day 175 — beyond the 150d horizon.
  Per §14b the pilot was not spent on a foregone conclusion. The
  G2 staging bar (≥3/8 in 150d) is unachievable in-window, not
  wrong for the road. The policy is committed as a proven
  instrument for a future arm (opinion-building lever, or a 200d+
  horizon). No confirm band spent: 100421–100436 stays fresh.

## The answer in one paragraph

Only the lead shape stages because only the lead road is ever
walked. On this fresh band the villages court exactly the way the
scaleclimb policy tells them to: propose subordinates, tend them,
answer the court when it comes — and the court that comes is
always the First Court, five times out of eight, every one sat.
Nobody ever proposes a covenant or a charter, nobody ever raids,
and the engine never proposes anything on its own — the verb table
for peer proposals and raids is empty on both legs, for both
callers. The other roads aren't blocked by the game; they're
unwalked by the policy. The one partial exception is the belong
road: three villages DID become someone's subordinate (twice by
counter-accept, the policy's only belong source), and all three
failed the good-standing bar — one at trust 40, two drowning in
tribute arrears (20,000 and 5,000 kcal) under primaries whose
realms were too small anyway. And the covenant road, when the
build went to walk it, turned out to have a gate the DIAG didn't
measure: a village has to think well enough of Haven (opinion
10+) before a covenant is even proposed, and from a cold start
that takes the whole 150-day season. The road is open in the
code and shut in the calendar.

## Per-seed per-shape table (armed leg — baseline names identical blockers)

`q` = days the shape qualified (its engine predicate non-null);
`nat` = first national day; `held` = national held days. Baseline
leg: lead staged-but-unanswered on the same 5 seeds (pendingNational
145 days band-wide vs 5 armed); all other shapes' blockers identical
to the armed leg on every seed.

| seed | lead | conquest | belong | covenant | trade | nat / held | days | end |
|------|------|----------|--------|----------|-------|------------|------|-----|
| 100401 | STAGED sat (q57) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-no-peer-links (q0) | trade-no-peer-links (q0) | 76 / 56 | 132 | lost |
| 100402 | STAGED sat (q81) | conquest-no-raids | belong-no-sub-link | covenant-no-peer-links | trade-no-peer-links | 62 / 74 | 136 | lost |
| 100403 | STAGED sat (q60) | conquest-no-raids | belong-no-sub-link | covenant-no-peer-links | trade-no-peer-links | 92 / 60 | 150 | survived |
| 100404 | lead-subs-short:2 (q0) | conquest-no-raids | belong-arrears:20000 (q0) | covenant-no-peer-links | trade-no-peer-links | — / 0 | 55 | lost |
| 100405 | STAGED sat (q30) | conquest-no-raids | belong-trust-short:40 (q0) | covenant-no-peer-links | trade-no-peer-links | 75 / 29 | 103 | lost |
| 100406 | lead-subs-short:2 (q0) | conquest-no-raids | belong-no-sub-link (q0) | covenant-no-peer-links | trade-no-peer-links | — / 0 | 99 | lost |
| 100407 | lead-rung-gate (q19) | conquest-no-raids | belong-no-sub-link (q0) | covenant-no-peer-links | trade-no-peer-links | — / 0 | 61 | lost |
| 100408 | STAGED sat (q86) | conquest-no-raids | belong-arrears:5000 (q0) | covenant-no-peer-links | trade-no-peer-links | 62 / 77 | 138 | lost |

Blocker rollup (per leg, 8 seeds): lead staged 5, subs-short:2 ×2,
rung-gate ×1; conquest no-raids 8; belong no-sub-link 5, arrears
20000 ×1, arrears 5000 ×1, trust-short:40 ×1; covenant no-peer-
links 8; trade no-peer-links 8. UNCLASSIFIED 0.

## The blockers, shape by shape

- **LEAD — the only road walked, and it works.** Five villages
  stand three seasoned subordinates, the court stages, the feast
  is paid, national lands (first-national days 62, 62, 75, 76, 92
  — four inside the canon 61–90 window; 100403 lands day 92, one
  day past it, because its fourth subordinate seasoned late).
  The three failures are the climb itself, not the answer: two
  villages never stand the third seasoned bond (max 2 subs), and
  one — 100407 — is the sharpest near-miss in the band: its
  polity stood for 19 days (d42–60) and the village died ON the
  rung day itself (d61; regional day 32, netDay 31, rung 61). The
  realm was ready; the season wasn't.
- **CONQUEST — never attempted.** 0 conquered subs on all 16
  configs. The policy never calls raidVillage, and the engine
  never raids on its own. Conquest needs ALL seasoned subs
  conquered, so even a single raid wouldn't stage it — the road
  needs a war policy, not a probe. Not chosen for Stage 2 (real
  casualties, a cost bar of its own — a bigger lever).
- **BELONG — the split diagnosis.** Five villages were never a
  subordinate at all: the policy only gains belong links when a
  lead propose is countered (the engine flips counters to
  asSubordinate), and on those seeds no counter ever formed one.
  Three villages WERE subordinates and failed good standing:
  - 100404: trust 100, age 33 days — a valued subordinate by
    every measure except the books: arrears 20,000 kcal, and its
    primary's foreign realm is only 3 villages (needs 4). Two
    gates fail at once; the analyzer names the first (arrears).
  - 100408: trust 100, age 15 days — arrears 5,000 kcal, and its
    primary has NO foreign polity at all (size 0).
  - 100405: trust 40 (needs 50), arrears 0, age 0 at its
    trust peak — the link never climbed past its formation trust.
  The foreign-polity precondition is NOT the blocker in general:
  foreign realms reach 4 villages on 100401/100402/100404/100406
  and 5 on 100403 (armed) — but never under the primary Haven
  happens to be subordinate to. Belong's lever would be
  counter-farming or arrears-paying, not a road walk — so it was
  not chosen for Stage 2.
- **COVENANT — never attempted, and gated by opinion.** 0 peer
  links formed, 0 proposeCovenant calls by policy or engine. The
  engine has the whole road wired (accept ≥55 / counter 35–54 /
  decline <35; form at trust 30; tend +8/week; pact answer) — see
  Stage 2 below for what the build found when it went to walk it.
- **TRADE — never attempted.** Identical to covenant (0 peer
  links, 0 calls). Same wiring, same absence. Trade is the next
  road after covenant, not this arm.
- **SHADOWING — none observed.** No non-lead shape ever qualified
  (q0 on every non-lead cell), so no shape was ever shadowed by a
  higher-priority beat. The priority order (lead → belong →
  covenant → trade) never had to choose. The DIAG-SHADOWED
  verdict was not triggered.

## Stage 2 — the covenant build and the opinion gate

The DIAG licensed a build (DIAG-POLICY-CANDIDATE), and covenant
was the minimal one: `scripts/policies/competent-covenant-b.js`
(competent base + covenant propose/tend/counter + the answercourt
answer map; no lead proposes, so lead can never shadow covenant).
Static proof is thorough (test-covenant-b 33/33: det-judge
arithmetic, propose/counter/tend flows, all gates). But the Stage 0
smoke (60d, seed 100401) showed zero contact: 0 proposeCovenant
calls in live play, `proposeNotReady: 51`. A probe of the live state
showed the det scores pass from day 12 (51–59) — the villages are
known and courtship-ready — but known-village opinion sits at 0–4,
below the engine's opinion-10 prerequisite for peer proposals.

The opinion probe (competent-only, 150d — max known-village
opinion by day):

| seed | d30 | d60 | d90 | d120 | d150 |
|------|-----|-----|-----|------|------|
| 100401 | 2 | 4 | 6 | 8 | 10 |
| 100402 | 2 | 6 | 3 | 8 | 10 |

Opinion climbs ~2 points per 30 days under competent play and
reaches 10 only AT the horizon on both seeds. The arithmetic
follows: a covenant propose can first fire at ~day 145+, the link
forms at trust 30, needs 30 days to season (trust 40+), so the
first Founding Council beat is structurally past day 175 — beyond
the 150d horizon from a cold start. The Stage 2 G2 bar (≥3/8
covenant beats staged in 150d) is unachievable in-window.

Per §14b the pilot was NOT spent, and the pre-registration was
corrected before any judged run instead: the policy's opinion
filter was removed (it hid the gate — the policy now attempts the
propose and lets the engine refuse aloud, counting prerequisite
refusals separately with no cooldown), and the proof test was
updated (33/33 green, live smoke now shows the attempts firing
and all being prerequisite refusals). Kill classification (§14a):
**SUBSTRATE-MISSING** — the engine does not stage what the arm
needs within the measurement window (opinion ≥10 known villages
don't exist until ~day 150). The concept is not dead; the
substrate is missing in-window. What unblocks it: (a) an
opinion-building lever first (courtship deeds that raise opinion
— visits, gifts, aid, contest wins where the region hears), or
(b) a 200d+ horizon covenant staging arm (first beats possible
~day 175+ for villages that survive that long). The policy,
proof test, and driver extension are committed as proven
instruments for that future arm. No confirm band spent.

Note for the record: the engine's copy for the refusal is "They
barely know Haven's name — and a covenant is a relationship, not
a handshake. Sit with them first: walk to their fire and study
their codex, win where the region hears it, give it weeks." The
game TELLS the player what the road needs. The policy just
doesn't do it yet.

## Wall numbers (scale wall, every run)

| | baseline (scaleclimb) | armed (answercourt) |
|---|----------|-------|
| National ever | 0/8 | **5/8** |
| National at end | 0/8 | 5/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 reached | 7/8 | 8/8 |
| Wave 5 reached | 2/8 | 4/8 |
| Median survival | 92.5d | 117.5d |
| Survived horizon | 0/8 | 1/8 (100403) |
| Wave kills (w1/w2/w3/w4/w5) | 234/131/56/20/3 | 229/137/59/34/8 |
| Total deaths | 572 | 609 |
| Villager combat deaths | 502 | 526 |
| Starvation deaths | 2 | 1 |

No seed won, no seed reached the table on either leg: national is
reachable (5/8 armed on this fresh band, the same 5/8 as the pilot
band), but the road past national — standing, the table — still
never fires in 150 days. The scale wall has moved one rung up, not
fallen. (This arm does NOT re-judge answercourt — the lever is not
landed; these are the DIAG legs' wall numbers on a fresh band.)

Per-seed before/after (days, end, scale, natEver, firstNat, natHeld,
heldDays, starv, deaths, vCombat, maxWave, standing — B = baseline,
A = armed):

| seed | days B/A | end B/A | scale B/A | natEver B/A | firstNat A | natHeld A | held B/A | starv B/A | deaths B/A | vCombat B/A | maxW B/A | stand B/A |
|------|----------|---------|-----------|-------------|-----------|-----------|----------|-----------|------------|-------------|-----------|--------------|
| 100401 | 117/132 | lost/lost | regional/national | no/yes | 76 | 56 | 43/57 | 1/0 | 67/70 | 57/56 | 4/5 | 199/662 |
| 100402 | 85/136 | lost/lost | regional/national | no/yes | 62 | 74 | 31/81 | 0/0 | 104/130 | 93/117 | 5/5 | 492/782 |
| 100403 | 124/150 | lost/surv | regional/national | no/yes | 92 | 60 | 33/60 | 0/0 | 56/66 | 51/59 | 3/4 | 99/199 |
| 100404 | 55/55 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 0/0 | 62/62 | 50/50 | 4/4 | 150/150 |
| 100405 | 86/103 | lost/lost | regional/national | no/yes | 75 | 29 | 13/30 | 0/0 | 53/54 | 40/38 | 4/4 | 199/199 |
| 100406 | 99/99 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 0/0 | 61/61 | 53/53 | 5/5 | 350/350 |
| 100407 | 61/61 | lost/lost | regional/regional | no/no | — | 0 | 19/19 | 0/0 | 80/80 | 79/79 | 4/4 | 199/199 |
| 100408 | 99/138 | lost/lost | regional/national | no/yes | 62 | 77 | 46/86 | 0/0 | 89/86 | 79/74 | 4/5 | 199/552 |

Three seeds are identical twins (100404, 100406, 100407 — same days,
same deaths): no beat ever staged there, so the armed policy plays
exactly the scaleclimb core. Pending-national days: armed 5 (one per
beat), baseline 145.

## Village assessment (plain words)

Eight villages, twice each — once with their courts left unread,
once with them answered — and the story is the same as the last
two bands, now with the reason attached. The villages that climb
climb the same way: three fires courted young, tended weekly,
seasoned together, and then the speakers ride in. Five of them
hear themselves called a realm. The other three never get a court
at all: two couldn't hold a third bond, and one — 100407 — held
its realm for nineteen days and died on the very morning the
season turned. The villages that never stage a non-lead beat
aren't failing at the other roads; nobody ever sets foot on them.
The other fires are out there binding among themselves — the
traders bring word of it — but Haven's own speakers never propose
a covenant, never sign a charter, never march a war party. The
one road that gets walked is walked well: five nations, held 29
to 77 days each. But nobody wins, nobody sits at the table, and
the villages that become nations still die of the same fights.
The wall moved a rung; it didn't fall.

Who thrived: the villages that formed three links early and
tended them every week — 100402 held its realm 74 days, 100408
held 77. Who died: the villages that lost their fighters to
wave-4 and wave-5 monsters before the court could matter (100404
dead at day 55, 100407 at day 61), and the villages whose climb
fell one bond short (100406, two seasoned subs, never a third).
The binding constraint is no longer "can a village become a
nation" — it is "can it hold the nation, and can it walk any
road but the one it already knows."

## Sense-testing (SENSE-TESTING LAW)

The First Court reads like a played ceremony, and the sequence is
the same on all five seeds — which is the point and the limit.
Seed 100402, days 61–62:

> ◈ SYSTEM: "Four fires. One head. GOVERNANCE LAYER: online —
> polity tribute routing, the court calendar, famine reserves. You
> built a realm. Try not to lose it the way you found it."
>
> 👑 Speakers from Emberhold, Stonebridge, Thornfield ride in for
> the first court — and every one of them is measuring you. FEAST
> them from a shared granary (5,000 kcal, no strings), HOST the
> court at Haven's fire (your speaker's time), or write the law in
> COLD ink (they'll pay more and love you less). Or REFUSE the
> scale itself — stay a free fire at regional, whatever that
> costs. The System will not offer twice.
>
> 🍲 The shared granary opens: 5,000 kcal for every fire of the
> realm, no strings. Emberhold, Stonebridge, Thornfield count it —
> and remember who fed them first. (Trust +10 with each — 3
> grieving fire(s); theirs waits.)

The other four roads have NO played lines anywhere in the captured
stream — not the Founding Council, not the Charter, not the
Binding, not the Iron Court. The word "covenant" appears in the
corpora only as a recorder key, never as something anyone says.
The one line that names another road's world is a rumor about
OTHER fires (100405, day 49): "Word comes late, through traders:
The Red Table has bound itself to Stonebridge. The region's map is
being redrawn — not by Haven." The region lives without Haven;
Haven never joins it as an equal. That is the sense shape of the
finding: four roads exist in the code and one exists in the play.

The village life around the courts is dense and human, and one
seed tells a whole story. On 100405, Thornfield splits — a faction
turns cannibal and walks out as The Red Table — which then bows to
Haven (day 44: "Serkan brings it home: The Red Table bows to
Haven — one organization, us primary"), sends runners who
complain about the commons ("Your foragers are stripping our side
of the ground. Back off — or we'll talk with teeth."), begs for
food at the fire ("Our jars are empty," Kenji says, "I'm asking
for food."), tests the link after a death, and rides in for the
First Court on day 74. It reads like a relationship, not a meter.

Two blemishes, filed to the backlog: the trader rumor line on
100405 day 49 arrives mangled — "Word of Haven's the televised
games, new bindings is doing work out there — Word comes late,
through traders: ..." — two fragments spliced into one ungrammatical
line. And Kenji waits two days at Haven's fire, getting thinner,
and "Nobody answers. They walk back to The Red Table with nothing.
They'll remember the silence." — a played silence, which is the
honest kind, but a player who missed the food-ask beat would never
know what was asked.

## Metric review (§14)

1. **G1 held, and the taxonomy worked.** 0 UNCLASSIFIED of 40
   cells per leg, 0 instrument errors, every staged beat classified
   with sat/unsat, dip attribution 0 unattributed both legs (a
   bonus — the bar didn't require it, the inherited analyzer
   carried it). The candidate roll (the engine's own predicates)
   agreed with `_havenPolity` on every smoke day.
2. **The belong branch hides double failures.** The taxonomy
   names the FIRST failing gate in the order trust → arrears →
   age → foreign size. 100404's belong link fails TWO gates
   (arrears 20,000 AND foreign size 3 < 4); 100408's fails two
   as well (arrears 5,000 AND foreign size 0). The analyzer names
   only arrears. Proposed revision for the NEXT run: name ALL
   failing gates per shape, not just the first — the double
   failure is itself a finding (a village can be a valued
   subordinate in trust and still be locked out twice over).
3. **The G2 ≥6/8 bar was the right bar.** It caught the belong
   split (5/8 top blocker) instead of letting a plurality pass
   as a diagnosis. The split is reported as a split, not
   rounded up to a diagnosis.
4. **The Stage 2 bar was written before the opinion gate was
   measured — and §14b caught it pre-pilot.** The staging bar
   (≥3/8 in 150d) was unachievable from a cold start, and the
   smoke + 2-seed opinion probe proved it before any pilot was
   spent. Lesson for future road arms: pre-register a 2-seed
   opinion-trajectory probe (cost ~1 min) as a substrate check
   BEFORE freezing a staging bar — the opinion gate is a
   structural precondition, not a tuning knob.
5. **The 600-line linkLines cap still binds** (13/16 records hit
   it). The opinion-gate refusal line is quoted from engine copy,
   not from a captured line — the covenant smoke didn't persist a
   corpus. Future smoke runs that prove a refusal should save the
   record.
6. **100403's national day (92) sits one day past the canon
   61–90 window.** Not a violation — the window is a
   "national ~day 61–90" expectation from the pilot bands, and
   the polity bar day was 92 because the fourth subordinate
   seasoned late. The window describes the typical climb, not a
   gate; no metric change owed.

## Evidence files

- Prereg (+ Stage 2 addendum + pre-run amendment):
  evidence/2026-11-15/sim-onlylead-b-prereg.md
- Driver: scripts/onlylead-driver-20261115.js (adapted from the
  answercourt driver + shape-candidate roll + covenant-policy
  support)
- Analyzer: scripts/analyze-onlylead-b.js (per-shape
  classification, frozen taxonomy)
- Proof: scripts/test-onlylead-b.js (29/29: static RED→GREEN +
  game smoke + determinism); scripts/test-covenant-b.js (33/33:
  static + game smoke + determinism)
- Policy (Stage 2, parked as proven instrument):
  scripts/policies/competent-covenant-b.js
- Per-seed JSON: evidence/2026-11-15/perseed-onlylead-b-control/
  (8 files) and evidence/2026-11-15/perseed-onlylead-b-on/
  (8 files)
- Analysis: evidence/2026-11-15/onlylead-b-analysis.json
- Pilot log: evidence/2026-11-15/onlylead-b-pilot.log
- Evidence: this file

## Commits (branch sim-onlylead-b)

- c08c74f82 prereg (DIAG bars; fresh bands 100401–100408 pilot,
  100421–100436 confirm)
- 7009d55e3 instrument: shape-candidate driver + per-shape
  analyzer + proof test (29/29 green, incl. determinism leg)
- 3a9995fd6 prereg Stage 2 addendum (covenant-road build, frozen
  GO bar)
- d1ef13b5d Stage 2: covenant-road policy + proof test 33/33 +
  driver extension + prereg amendment (opinion-gate smoke
  finding, pilot not spent, SUBSTRATE-MISSING)
- (this commit — DIAG corpora + analysis JSON + pilot log +
  evidence)
- Index-clobber note: after the d1ef13b5 safe-commit the worktree
  index showed 6 committed files as staged-deleted (the known
  safe-commit clobber class); repaired with
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, verified by hash-object match per file. The
  commit itself was correct.

## Findings for the backlog (coordinator owns sim-findings.md)

1. **DIAG answered (#2358 UPDATE — see the finding line).**
   The why is named per shape per seed (table above). The finding
   itself (only lead stages in live play) stays open — the four
   per-shape answers are still proven by fake-Game unit tests
   only.
2. **THE COVENANT ROAD IS GATED BY OPINION, NOT BY THE PROPOSE
   VERB.** Peer proposals need opinion 10+ first, and opinion
   climbs ~2 points per 30 days under competent play, reaching 10
   only at ~day 150 from a cold start — so the first covenant
   beat is structurally past day 175 in a 150d horizon. Next arm:
   an opinion-building (courtship-deeds) lever, or a 200d+
   horizon covenant staging arm. (Stage 2 kill:
   SUBSTRATE-MISSING.)
3. **THE BELONG ANALYZER NAMES ONLY THE FIRST FAILING GATE.**
   100404/100408 fail two gates each (arrears + foreign size);
   only arrears is named. Future per-shape analyzers should name
   ALL failing gates.
4. **MANGLED TRADER RUMOR LINE (sense).** 100405 day 49: "Word of
   Haven's the televised games, new bindings is doing work out
   there — Word comes late, through traders: The Red Table has
   bound itself to Stonebridge." Two fragments spliced into one
   ungrammatical line — a narration concatenation blemish.
5. **THE RUNG-GATE NEAR-MISS.** 100407's polity stood 19 days
   (d42–60) and the village died ON the rung day (d61). The climb
   was fast enough; the season wasn't. A one-day margin between a
   realm and nothing — worth knowing the next time the rung gate
   is tuned.

## Convergence state

DIAG — GO on G1, DIAG-POLICY-CANDIDATE on G2 (conquest /
covenant / trade 8/8 single-blocker; belong split 5/2/1 with 0/8
ever qualified). Stage 2 covenant build KILLED at smoke as
SUBSTRATE-MISSING (opinion gate; pilot NOT spent; no confirm
band spent). The axis line updates from this run's numbers only:
only lead stages (5/8 armed here, 26 lead beats staged across the
three bands — 21 pilot+confirm, 5 here); the other four answers
remain unit-proven only; the
covenant road's next step is opinion-building or a longer
horizon, not another propose variant.
