# Loop A 0725Z round — scale-onramp: herald-contact DIAG-GO + screened arrears band UNDER-POWERED, merged locally pending ship

Run: fleshout-loop-a-20261102T0725Z, axis scale-onramp.
Sibling Loop B live on food-economy throughout (0619Z claim: jumpfaithful +
stayhome) — NOT touched. Loop B landed its 0619Z coordinator evidence
(b312c404b) mid-run, moving master under both arms; both worker branches
were rebased clean onto the moving tip before merging --ff-only (second
branch rebased AFTER the first merge, per the 0605Z lesson), no merge
conflict, no force, no sibling branch touched. Rotation untouched
(convergence-directed axis work supersedes rotation; rotation stands at 3).
No titan canon doc exists in docs/ — stated by both arms, none invented.

Claim written before any sims; lock created at run start, deleted at close.
Pre-flight: main tree clean, disk 25%, reaper removed nothing (all active
trees sibling-owned or dirty, correctly refused).

## Arm sim-heraldcontact-a (commits 98d3686c3 prereg, 9ccb6370a replay+tests,
874183931 evidence+corpus, all rebased; merged --ff-only)

DIAGNOSIS GO, validator re-run GO on master by the coordinator (unit
19/19, corpus validator DIAG-GO, zero src/js changes).

Question (tracker blank 2): on fresh bands, why do villages never attempt
the herald? Definition (prereg): an attempt = one herald-instrument row
(startCombat actually called) — NOT the readiness check and NOT the sound
(this arm never sounds). Fresh pilot band 97301–97308, verified unspent
before prereg, DAYS=180, frozen stack tribfloor leadfeast + windefer +
seatdrive + fullseat-diag.

Per-seed result (attempts / code / pipeline):
- 97301: 4 attempts, all REFUSED/MUSTER-GATE, wild-contact, days 78–89.
  Readiness said READY (total 11) at every refusal — NOT a contradiction:
  readiness measures the CALL, startCombat gates the FIGHT on an existing
  muster, and no muster existed (neither this arm nor the base policy
  sounds the call).
- 97302: 0, OMEN_STUCK (wave4 day 84, regional 67, omen start 86, stage 0
  at end).
- 97303: 0, NO_OMEN (wave4 day 62, 22 days of 10%/day omen start never
  fired, P≈9.8%), village-lost day 84.
- 97304: 0, LOST_BEFORE_WAVE4 (regional 55, village-lost day 89).
- 97305: 0, OMEN_STUCK (omen start 85, stage 1 at end; locating needed
  day 94, ended day 92).
- 97306: 0, DIED_BEFORE_WAVE4 (regional 47, over-other day 90).
- 97307: 0, LOCATED_NO_ENGAGE — sharpest case: lair line day 129
  ("Scouts found its lair — tile 7,4… It is WAITING… Sound the call."),
  then 5 escalation strikes/feeds and 23 days of monster presence with
  zero engagements and no pending encounter at end. The village was
  told, in plain words, and never went. The mechanism (policy never
  routes to a located titan?) is the recommended next arm, NOT answered
  here.
- 97308: 0, DIED_BEFORE_WAVE4 (regional 49, over-other day 109).

Reason split (7 non-attempters, no dominant reason — the split table IS
the deliverable): OMEN_STUCK 2, DIED_BEFORE_WAVE4 2, NO_OMEN 1,
LOST_BEFORE_WAVE4 1, LOCATED_NO_ENGAGE 1. NEVER_REGIONAL 0 (all reached
regional, days 47–67). Headline: no single contact wall — the pipeline
leaks at every stage, mostly on time, not gates. 3 seeds never unlocked
wave 4 in 89–109d despite regional; 2 omens started too late to locate
before run end; 1 lost the omen-start lottery for 22 days.

Wall (this band): national 5/8, table 6/8, won 6/8 (any-win; seat kind
not recorded, no full-seat claim), wave-4 5/8, wave-5 0/8, attempted
1/8, median 90.5d, max 152d, 270 deaths (combat 47%, villager combat
24%, the wild 11%), instrument errors 0.

Sense lines (genuine, pattern-anchored): the 97307 lair line above, and
day 149 "THE HERALD fed in the night — 1,950 kcal gone… It is eating
the realm while you deliberate." Also flagged: the same fed line fired
with "0 kcal gone" on day 139 (small narration-honesty wrinkle, not
chased).

Metric review (carried, not re-scored): the broad herald-line regex
(`/omen/`) matches "moment" in routine lines, so most captured herald
lines are pollution — quoted lines were filtered by specific
lair/escalation/war-path patterns. The instrument's refusal transcript
snapshots came back empty for 97301's refusals. Classifier fix (prereg
is the authority): the first validator run showed 3 UNCLASSIFIED because
the classifier wrongly required regionalDay == null on the wave-4 legs;
fixed to the prereg text, 3 regression unit cases added (19/19), no bar,
threshold, or code definition changed. Index clobber struck all three
worker commits; repaired via HEAD-blob cacheinfo, trees verified clean.

## Arm sim-arrearsscreen-a (commits fe8583a4c prereg, 12851bf48 instrument,
53b19c24f evidence+corpus, a635436b4 overlap disclosure, all rebased;
merged --ff-only)

UNDER-POWERED for waiting (0 blocked seeds), bars (a)/(b)/(d)–(f) pass,
bar (c) vacuous (reported as vacuous, never cited as a pass), zero
src/js changes. Validator re-run GO on master by the coordinator
(classifier unit 16/16, screen validator: rows 24/24, blocked 0).

Question (tracker blank 1): build the screened arrears band the waiting
pilot needs. Screening band 97301–97324, DAYS=180, frozen route stack,
never sounds. Blocked definition: arrears-only block at a refused
herald attempt (trust >= 25, opinion >= -10, arrears > 0).

Yield: blocked 0/24 combined, 0/16 fresh. Contacted 1/24 (97301 only,
the heraldcontact pilot's attempted seed — see overlap disclosure).
Classes: ready-at-first-check 1, no-herald-attempt 23. Census arrears
ever: 11/24 (4/8 overlap, 7/16 fresh) — arrears exist in these villages,
but never as the sole refusing reason at a herald contact, because
contact itself almost never happens (1/24). The waiting pilot is still
untestable on an unselected band: the binding constraint is herald
contact, not arrears prevalence.

Band-overlap disclosure (parallel-arm coordination artifact, NOT a
worker error): both arms verified their bands against master at prereg
time, before either prereg was visible to the other, so the screen band
97301–97324 overlaps the heraldcontact pilot band 97301–97308. The
screen evidence now reports the yield split everywhere it matters:
OVERLAP 97301–97308 (8): blocked 0/8, contacted 1/8, wall 5/6/6/5/0;
FRESH 97309–97324 (16): blocked 0/16, contacted 0/16, wall 8/14/12/7/1;
COMBINED (overlap flagged, not independent): 0/24 blocked, 1/24
contacted, wall 13/20/18/12/1. The screen's independent fresh evidence
is 0/16 blocked / 0/16 contacted. The combined unselected-band contact
figure is 5/40 (route 4/16 + screen 1/24); the independent-seed version
is 4/32 (route 4/16 + fresh 0/16), with blocks among contacted 0/5
combined / 0/4 independent. The 97301–97308 rows must never be pooled
with the heraldcontact pilot's results as independent seeds. Waiting-leg
rule recorded: prefer fresh-portion blocked seeds, flag any
overlap-portion seed as overlap-shared, never independent. The prereg
file is byte-identical after the disclosure commit (only the evidence
file changed; no number altered, no re-score).

Wall (this band only, never pooled): national 13/24, table 20/24, won
18/24, wave-4 12/24, wave-5 1/24, median 90d, max 152d, ends over-other
18 / village-lost 6, 696 deaths (combat 289, villager combat 206, the
wild 74, expedition 28). Sense line: 97301 Ashford waiver lines days
35/42/49 ("Tribute wagons from Ashford turn at the gate — our shelves
are full past tomorrow… 'That IS your tribute this week.' (Trust
+1.)") while Ashford still owes 2,250 at both check days — the same
honesty gap as sim-arrears-a (waivers read as forgiveness while debt
stands and still refuses the call; here without blocking, because the
total clears need anyway).

## Wall note — a wave-5 telemetry flag, NOT a breakthrough claim

The screen band's one wave-5 figure is seed 97309 (fresh portion):
maxWave 5, w5Day 76, national 0, table 1, won 0, village-lost run, no
herald contact. What the recorder's maxWave=5 actually records on this
seed — wave unlock, wave spawn, or a wave-5 fight — is NOT established
by either arm's evidence, so this run does NOT claim wave 5 reached or
fought, and does NOT revise the standing wall (full seat 0 / wave 5
fought 0 in normal play). Verifying 97309's maxWave=5 meaning is next
blank (1) below. If it turns out to be unlock-only, the wall language
must say so explicitly in the next evidence file.

## Telemetry deviation check

telemetry-check.js REFUSED the heraldcontact per-seed glob by design
(all 8 rows carry anchorCommit — sweep recorder rows, not runs, same
as the 0605Z/0445Z precedent); no LOUD lines, baseline NOT rolled, no
--allow-recorder-corpus / --update-baseline used.

## Metric review

- The heraldcontact `/omen/` regex pollution and empty refusal
  snapshots (above) are instrument flaws for the next contact arm to
  fix before citing line counts.
- The screen validator's exit 2 is its designed under-powered signal,
  not a test failure (same convention as the route arm).
- The 90d over-other end recurs (8 seeds end at exactly 90d here; same
  shape in route pilots and the arrears-a band) — consistent with a
  game end condition, not with these replays; noted, not investigated
  here (outside both arms' preregs).

## Coordinator catch (disclosed)

- Master moved mid-run (Loop B 0619Z evidence b312c404b); both branches
  rebased clean onto the moving tip, second after the first merge. No
  conflicts, no force.
- Index clobber struck worker commits on both arms (repaired by workers
  via HEAD-blob cacheinfo, verified clean). Coordinator commits below
  were checked the same way after safe-commit.
- The overlap between the two arms' bands was caught by the coordinator
  from branch tips before either merge, and disclosed by the screen
  worker as an evidence-only commit with prereg byte-identical. No
  number was altered in the disclosure.

scale-onramp stays converging (NOT converged): herald contact is now
decomposed stage by stage (no single wall; time leaks dominate), and
the screened arrears band proves the waiting pilot is still untestable
on unselected bands (0 blocked in 24 screened, 0 in 16 fresh) — but no
game change landed, no full-seat win is shown, and wave-5 fought stays
unshown (97309's maxWave=5 is an unverified telemetry flag, not a
fight). food-economy untouched (sibling Loop B lane).
Next blanks, in order: (1) verify what maxWave=5 records on 97309
(unlock vs spawn vs fight) and state the wall language accordingly;
(2) located-titan engagement mechanism — why a village told of a lair
(97307 shape) never routes to it (policy routing to a located titan);
(3) screened arrears band for the waiting pilot, round 2 — only via a
contact-first screen (seeds pre-filtered on herald contact) or a
back-payment verb design decision (steve-call candidate); an
unselected-band re-screen is NOT the next step (0/40 combined contact
rate bounds it); (4) sum-trigger CONFIRM re-run only after an arrears
lever lands; (5) Layer-2 titan meaning (steve-call); (6) replay
history-stream 40-entry cap instrument fix; (7) full-seat bars
w4>=3 + w5>=2 reachability (still 0 fought).
Coordinator evidence: evidence/2026-11-02/sim-scale-onramp-round-0725.md
Claim deleted; lock deleted.
Merged locally, pending ship (heraldcontact: diagnosis + instruments;
arrearsscreen: measurement record only, arm UNDER-POWERED for waiting).
