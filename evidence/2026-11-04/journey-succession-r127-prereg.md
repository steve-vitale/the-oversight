# Journey succession r127 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before play. Question carried from r123's single open defect-shaped
item: the funeral arc stays silent on an expedition death (seed 33204:
deathBeat 0, recover 0, vouch 0, systemVoice 0, burialWindowSay 0 in the
d+2/d+4 windows, while the corpse was found, respects paid, burial
completed, the fallen entry exists, and villagers grieve Jacob by name in
conversation for weeks).

## Question
Does the funeral arc fire for a bearer who dies "the expedition", and if
the r123 windows show nothing, is that (a) a genuinely silent arc, or
(b) an instrument artifact — the capped sayLog (15,000 lines, shifting)
evicting the death-day slice before the run ends?

Code read before play (no canon doc covers the funeral arc specifically;
CANON.md's manifest lists none for mantle/funeral, so the governing rules
are the code comments plus CANON's "No silent actions"):
- ledger.js playerDeath ALWAYS says the 🕯️ death beat
  ("🕯️ ${oldName} is dead — ${cause}. The village stops. Somebody
  screams. Somebody else starts digging.") — no cause branch.
- corpses.js recoverBearer fires from endDay when day > pending day and
  says "That night, they bring ${first} home... the grave is dug by the
  fire" — no cause branch, no location branch.
- game.js:8934 is the expedition death site: on expedition return with
  health <= 0 and no cheat-death, it calls playerDeath('the expedition')
  — the same function, the same cause string this run scripts.
So the code predicts the arc fires for expedition deaths exactly as for
any death. The r123 silence is therefore suspect as an instrument
artifact until proven otherwise — and the comparison seeds support the
suspicion: organic phase-A deaths on 33202 (d13) and 33203 (d8) DID show
deathBeat 4–6, so the instrument captures phase-A deaths in general;
33204 is the outlier, not the pattern.

## Instrument (r127 = r123 driver + 3 declared additions, nothing else)
1. KILL_CAUSE = 'the expedition' (was 'a hushwolf'): scripted kills carry
   the exact expedition cause string, so scripted leg deaths test the
   arc's cause-dependence directly through the real playerDeath.
2. FUNERAL-INCALL: the playerDeath wrapper already keeps an uncapped
   per-call say buffer (pdSayBuffer, used for keepsakes). r127 saves a
   copy per playerDeath call (deadId, newId, entry day, cause, full
   texts) into rec.pdCalls, and the funeral block reports the leg
   death's in-call death-beat lines. This is independent of the capped
   sayLog and of every window: if the 🕯️ line is in the in-call buffer,
   the arc fired at the death, whatever the windows say.
3. FUNERAL-WIDE + EVICTION CHECK at the funeral block: windowSliceN =
   count of surviving sayLog entries dated deathDay..deathDay+2 at
   finish; deathBeat/recover/burial also computed over d..d+14; sayLog
   length at death detection and at finish recorded. If windowSliceN is
   0 (no surviving line at all from the death days), the windows are
   void by eviction and cannot score the arc.
Everything else (PICKCTX, REL, CONVO_DAYS [3,7,14,30,45,53,64],
POST_DAYS=70, EARLY_KILL_DAY=40, second/third/fourth/fifth kills = 0)
is r123 verbatim, renamed. Instrument only, zero src/js changes.
DUMP_SAY is set per seed so the surviving capped log can be audited.

## Pilot seeds
33301, 33302, 33303, 33304. Fresh band: exact `"seed": 3330` grep empty
across prior succession stdout JSONs. No forced regime this run (no
SECOND/etc. kills): the scripted leg kill fires only when no organic
death arrives by day 40, exactly as r123. Reserves 33305, 33306.

## Bars (binding, §14)
- INCALL: on every leg death, the in-call buffer contains a death-beat
  line (/🕯️|is dead/ naming the dead bearer). PASS = 4/4, any cause.
  If an expedition-cause leg death has NO in-call beat, that is a real
  game gap (cause-conditioned silence), not an artifact — NO-GO on the
  "arc fires for all causes" claim, and the run documents it as a fix
  item instead of re-scoring.
- EVICTION: if windowSliceN == 0 on a seed, that seed's window-based
  funeral verdicts (including r123-rule m1) are VOID, not failed — the
  run says so and does not count the seed against the arc.
- m1 (r123 rule, carried, reported not re-scored): computed as before
  (deathBeat>0 + recover>0 + scriptedBurial found/respects/bury).
  m1 is NOT the judge this run; INCALL + EVICTION are.
- CARRIED (reported, not scored): pick-time rank, scholar growth,
  corpseEnd, fallen entry, grief mentions in conversation.
Expansion trigger: ANY leg death with no in-call beat, OR all 4 seeds
void by eviction (then the instrument itself needs a bigger fix before
any arc claim). Otherwise panel stands at 4 seeds.

## Interesting finding (pre-declared)
- In-call beat present + windows empty + windowSliceN 0 → r123's 33204
  m1 miss is an instrument artifact; the m1 bar needs an in-call or
  dump-based reading, and no game fix is warranted.
- In-call beat present + windows empty + windowSliceN > 0 → the arc
  fired but left no window trace: a window-definition problem (day
  stamping), worth one code read, not a fix on speculation.
- In-call beat absent on expedition cause but present on other causes
  → real cause-conditioned gap; document for a builder, fix only with
  a proof test, never on speculation.

## Mid-run corrections (appended, history untouched)
(1) The 4-seed pilot (33301–33304) all died organically in phase A
(d14–d32, causes 'the wild' ×3, 'a stranger' ×1), so no scripted
'the expedition' kill fired and the target cause is still untested.
INCALL works (3 death-beat lines in-call on 4/4 leg deaths) and no
seed is void by eviction (windowSliceN 378–556), so neither expansion
trigger fired — but the question is unanswered, not resolved. Two
follow-ups, in order: (a) re-run r123's carried seed 33204 under the
r127 driver — the driver changes nothing about play logic (only the
unused-on-organic-path KILL_CAUSE string, read-only pdCalls recording,
and post-play funeral additions), so the same organic expedition death
d23 should reproduce, this time with its in-call buffer captured;
(b) if 33204 does not reproduce an expedition death, run fresh seeds
with EARLY_KILL_DAY=5, where a scripted 'the expedition' kill is near
certain (no organic death by day 5 on most seeds), to test the cause
directly. The EARLY_KILL_DAY=5 wave is a declared regime change for
those seeds only, not a re-scoring of the d40 pilot.
(2) Heartbeat gap, honestly recorded: the first heartbeat loop died
with its exec session (log file never created); registry heartbeat went
stale 14:11 → 14:37 (26 min) mid-panel. No sibling reaped the tree
(reap spares active/dirty trees; the tree was dirty with panel output).
A durable setsid/nohup loop was started at 14:37 and its landing
verified in the registry before further work.

## Metric review (carried from r123, proposals for the NEXT run)
- m1/C1v3 scope: cause-conditioned reading was proposed; this run
  tests whether any cause-conditioning exists at all before adopting it.
- DETECTOR vacuity: keep printing vacuity (r123 fix); seeds with no
  chain deaths are "no chain evidence", not passes.
