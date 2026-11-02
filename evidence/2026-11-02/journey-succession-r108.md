# Journey succession r108 — KEEPSAKE-PER-HANDOFF VERIFIED + TOM-RECAP BUG FIXED (lane B, 2026-11-02)

Leg 7 (succession). Prereg: evidence/2026-11-02/journey-succession-r108-prereg.md
(written before any play). Pilot panel + probe + one game fix + proofs.
Base: worktree registered on master 4903d44b5 (Loop 1030Z round evidence).
Seeds 30501–30504, competent policy, POST_DAYS=70, EARLY_KILL_DAY=40.
30501, 30502 chain-forced (20/20/10/10 dplus); 30503, 30504 controls.
Pilot-only per the pre-declared trigger: NO expansion (no same-iteration
double, no seed silent under both naming metrics).

Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94/r97/r100/r104). This run uses
journey2-succession-r108.

No lock file existed at run start, so no stale-lock recovery was
needed; fresh lock written (2026-11-02T11:55:00Z), to be deleted at
closeout ONLY if it still carries this run's run_id (r97 lesson).
Guard note: lock absence was NOT treated as liveness — the registry
was checked for live journey2-* heartbeats first (newest was
journey2-crisis-r90, 1916 min stale, a held dirty tree for
main-session inspection, untouched). Lane A journey-deepening was
live (heartbeat 0.4 min) on its own slug — different lane, no
conflict. Pre-flight clean: main tree 0 lines, disk 24%, reap
8/16 active with LOUD dirty trees left untouched.

## Run setup — slow registry, fast seeds

- Worktree registration clean; heartbeat landed at registration
  (11:59:00Z, verified by registry read-back) and a 10-minute
  heartbeat loop ran with a readable log, never /dev/null.
  Registry contention note: a sibling python process (PID 91748,
  since 12:22Z) held the registry lock for 7+ minutes, queueing
  this run's loop heartbeat behind flock (last beat 12:14:54Z,
  age 14 min at 12:28Z). No action taken against the sibling
  process; closeout is timed to finish before the next Lane B
  run (13:00Z) so a stale-heartbeat misread cannot occur.
- Smoke tests first, throwaway seeds, files deleted before the
  panel (verified: no 30998/30999 files remain): SEED=30998 5d/5d
  proved the doAction wrap runs (JSON parses, leg-death
  keepsakeLineFired=true via playerDeath-wrapper); SEED=30999
  5d/25d SECOND_KILL_DPLUS=3 proved iteration stamps (iter 3,
  iter 14) + keepsake flags on chain entries (both true) +
  inh2 vanished [buskers_harmonica, daughters_drawing] joining
  to the scripted chain entry.
- Panel: all 4 seeds exit 0, first attempt, all parse-verified.
  Runtimes ~99s / ~67s / ~79s / ~124s.
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; repo AGENTS.md + worktree AGENTS.md
  (identical) read. No canon doc covers succession/mantle — none
  invented. docs/CONVERSATIONS.md is the canon doc for the recap
  area and was read before the fix. Gating freeze (2026-10-27)
  untouched. No gate, deed-bar, standing, wave, or table-price
  change is in scope or made.
- Instrument diff verification: driver diff vs the r104 rename
  baseline is ONLY the keepsake-capture addition; analyzer diff
  is ONLY the appended KEEPSAKE-PER-HANDOFF section; naming
  analyzer + both proofs are rename-only (0 leftover r104/3040x
  tokens, all node --check clean).

## Headline

Two r104 open items are now closed, one of them with a game fix.
(1) The keepsake-line bar r104 judged HONESTLY unverifiable is
now verifiable AND PASSES: 6 disposition records with vanished
sentimentals, all 6 with the burial line fired (regressions=0).
(2) The Tom-recap mismatch is a confirmed BUG with a landed fix:
a follow-up opener naming a wound ask recapped as "food share"
(a need never spoken) on probe seed 39998; after the fix the
identical construction recaps "wound care". The fix is one
branch in convoTopicLabel: name the asked favor when it is
still live, else the live scan, else the fallback — r68's
"never promise a need that isn't there" preserved.

## Q1: KEEPSAKE-PER-HANDOFF — PASS (bar now checkable, 0 regressions)

- 6 disposition records with ≥1 vanished sentimental, all with
  keepsakeLineFired=true: 30501 inh2 (3: paperback,
  buskers_harmonica, reading_glasses), inh4 (dog_tags), inh5
  (knife_roll); 30502 inh2 (hoodie, buskers_harmonica), inh3
  (contract_quill, unnamed_photo, search_locket, trail_compass,
  knife_roll), inh4 (wedding_ring). Regressions=0.
- 3 fired-with-0-vanished cases, all EXPLAINED (descriptive, not
  regressions): 30501 inh3, 30502 inh5, 30504 inh. In each, the
  bearer carried keepsakes (line fired ⟺ buriedKeepsakes>0) but
  every sentimental type survives in the disposition count via
  another copy (30504 inh verified in detail: dog_tags,
  bus_schedule, mixtape, seed_packet, dispatchers_headset all
  present with living villagers/successor). The bearer's own
  copies went into the ground; the type survives elsewhere —
  exactly r100's mechanism. Fired-with-0-vanished is therefore
  consistent, not a contradiction.
- Capture coverage: 11/11 panel chain entries carry a boolean
  keepsakeLineFired (0 missing, 0 null on wrapper-recorded
  entries); organic handoffs captured too (30502 Wael->Jessica,
  Jessica->Amara both true). Sweep-recorded entries would read
  null by design; none occurred on this panel.
- V1/V2 re-confirmation: 9 handoff disposition records, 13
  vanished ids, V1-violations=0, V2-violations=0. Mechanism stays
  CLOSED as designed.

## Q2: TOM-RECAP PROBE — BUG, FIXED + PROOF-COVERED

- Probe (scripts/probe-recap-favor-vs-need.js, throwaway seed
  39998, v2 — v1 failed NO-DATA because a fresh day-2 village
  has no favor needs, so no villager asked any favor in 12
  conversations; v2 creates the need first with reported state
  writes):
  - Phase 1: Emmett hurt (health 50) asks in a REAL conversation
    ("This cut — I can't clean it properly one-handed. Will you
    help me clean it?") → favorLedger heal_help, state 'asked',
    persists after the convo ends unfulfilled.
  - Phase 2: hunger 90 → live scan food_share;
    convoFavorNeedLive(heal favor)=true.
  - Phase 3: new convo opens with the FOLLOW-UP (want id
    ask_favor, fromSeed, seedFavorId matches the ledger favor)
    naming the wound ("About this wound — still need hands.
    Are you in?"); the recap pick then says (BEFORE FIX): "We
    started on that food share, then got onto what's been
    happening." Food share was never spoken in either
    conversation. Mechanism: follow-up openers name the old
    favor, but convoTopicLabel's ask_favor branch recomputed
    the label from the live scan at recap time.
- Fix (src/js/conversation.js, +25 lines, [needs-eyes] — spoken
  conversation lines change): in convoTopicLabel's ask_favor
  branch, BEFORE the live scan, return the asked favor's label
  when the sitting's favor (c.want.favor, else the ledger's
  open favor) is in state 'asked'/'promised' AND
  convoFavorNeedLive holds. Otherwise the live scan, otherwise
  the wid-map fallback. A moot/fulfilled favor never names
  itself again; a thread with no open favor still labels via
  the scan. Resume openers share the label path, so they get
  the same correction.
- Before/after on the identical seed + construction: BEFORE
  "We started on that food share..." → AFTER "We started on
  that wound care, then got onto what's been happening."
- Proof test (scripts/test-recap-favor-label.js, 3 cases, each
  its own process): (a) follow-up + live favor → wound care,
  NOT food share; (b) fresh ask, scan agrees, same-convo recap
  → wound care; (c) bare ask want with no open favor, and with
  a moot ledger favor → 'that food share' via the scan in both
  (fallback intact). Result on fixed code: ALL PASS. Pre-fix
  control (conversation.js stashed, proof re-run): (a) FAILS
  with the exact bug line, (b)/(c) pass — the proof is
  sensitive to the fix and only to the fix. Stash popped,
  fix verified back in place (marker comment present).
- Case (c) construction lesson (documented, not hidden): mooting
  a favor consumes its follow-up seed as unestablished, so the
  next convo falls back to small talk with no ask_favor thread
  to recap — the scan fallback is therefore guarded at the
  label-function level, not behaviorally. The first (c) attempt
  failed on an empty threadLog ("just talking") before this
  was understood; the rewritten (c) passes.

## Panel (policy competent, 70d post-death)

- 30501 (forced): Ashley→Rocco d26 (leg death) → Tanisha d46 →
  Nikolai d66 → Mario d76 → Aria d86 (fifth). Ends 8 alive,
  pantry 49,788, stage 3, office 88, village mean 68.3.
  Fifth: bonds 9/9 survived, affinityDiff5=0, lin/mo true.
- 30502 (forced): Vincent→Wael d8 → Jessica d22 (organic,
  betrayal) → Amara d25 (organic, starvation) → Booker d28 →
  Owen d48 → Sigrun d59 → Mona d69 (fifth). Ends 9 alive,
  pantry 52,830, stage 3, office 86, village mean 63.5.
  Fifth: bonds 12/12 survived, affinityDiff5=0, lin/mo true.
- 30503 (control): Hazel→Avery d22 → Dwayne d87 (organic).
  Ends 8 alive, pantry 18,947, stage 3, office 91, village
  mean 92.9.
- 30504 (control): Hugo→Heidi d40 (scripted leg death, no
  further pass). Ends 10 alive, pantry 84,757, stage 3,
  office 87, village mean 89.7.

## Bars (binding, §14 — judged as pre-registered)

- DETECTOR: chainDeaths == tele chainDeaths on 4/4 (4/4, 6/6,
  1/1, 0/0); chainKnown == chainDeaths on 4/4. PASS.
- CHAIN5-READABLE: full fifth handoff recorded on both forced
  seeds that reached the window (30501, 30502). PASS.
- CHAIN5-BONDS: fifth-successor bonds survived == pre on both
  (9/9, 12/12); affinityDiff5 = 0 on both. PASS.
- V1: 0 violations. V2: 0 violations. PASS.
- KEEPSAKE-PER-HANDOFF: 6/6 vanished-sentimental records with
  the line fired; regressions=0. PASS (r104's bar, now
  checkable — first verdict it has ever received).
- RECAP-PROBE: BUG verdict with fix + proof (see Q2). Complete
  outcome, not a carried blank.
- M3v2b: 6, 5, 6, 7 — 4/4 seeds ≥ 2. PASS (bar ≥3/4).
- C1v3 ok=true on 4/4; S1 missingExact=0 on 4/4; MG2v2 true on
  4/4; M1/M4 true on 4/4. PASS.
- INVITE SEAM: every invite outcome spoken — INVITE-SPOKEN
  lines across all transcripts, zero UNSPOKEN lines in the
  analyzer output. PASS.
- SPLIT (descriptive): sameDayPairs=0, sameIterationPairs=0,
  missingIterEntries=0. The r91 same-iteration double stays
  unobserved since r97; absence reported as absence.
- PROOF: keepsake proof ALL GREEN (12 PASS incl.
  separate-process control); naming proof (a)–(d),(f) PASS,
  (e2) 4/4 PASS; (e) FAILS on its stale r91 expectation as
  pre-declared (6 FAILs, all trajectory-expectation class:
  fifth Petra→Catalina, chain length 7→5, first six, day-71
  pair, day-71 via, tele 8→9 vs actual 6). (e) NOT edited,
  NOT re-baselined: no same-iteration double observed.
  Naming proof total 43 PASS / 6 FAIL (all 6 stale-(e)).
- Determinism leg: 30501 re-run differs from the panel JSON in
  ONLY 20 lines, all stack-trace source line numbers in
  conversation.js shifted by exactly +25 — the fix's insertion
  size, landed between the panel and the re-run. chainDeaths,
  inh keepsake, tele, and death records are all equal; the
  tele file contains zero conversation.js refs. The driver
  fork is trajectory-neutral; the game fix changes no
  trajectory bytes, only recorded line numbers. PASS with
  explanation (the leg's purpose — catching instrument drift —
  is satisfied; the shift is the fix itself, not drift).
- Expansion trigger: NOT fired on either prong — no
  same-iteration double and no seed silent under BOTH naming
  metrics (per-seed named/namedAny: 3/4, 3/5, 3/5, 4/4;
  pooled 13/18). Pilot-only stands.

## PEOPLE CHECK — all 18 week-1 transcripts sense-read

Bar: NPC wants something, options engage/deflect, endings
resolve/plant/owe; no fabricated shared history, no filler
loops, no static menus. VERDICT: PASS, with three carried
wrinkles below (two recurring from r104, one color note).

What works, seed by seed:
- 30501: Tanisha d+3 regret exchange with correct recap
  ("Still on your regrets"), Ashley grief named, invite
  accepted with character, party naming + scout role, closing
  ritual ("I rinse the cup twice... The fire feels smaller
  without Ashley"). Tanisha d+7 laugh exchange, recap
  correct, Ashley grief, Dandelion teaching lands. Mario d+7
  old-life skills exchange, recap correct, invite declined
  with reason, Ashley grief, Purslane teaching lands.
  Nikolai d+3 nonverbal Russian-only exchange: warm, coherent
  (see wrinkle 3).
- 30502: Jessica d+3 feverish-cut ask with real stakes + door
  requirement, Vincent grief (favor owed), eager invite.
  Amara d+3 wound ask with stakes, Jujube teaching, Vincent
  grief (burnt-piece ritual), invite accepted. Petra d+3
  Polish nonverbal with a mimed come-with-me invitation.
  Jessica d+7: walk + naming + scout, then recap "Still on
  that wound care" — the d+3 favor still open and still
  named correctly (agree-case on the fixed label path).
  Amara d+7: wound re-ask ("I still haven't found anyone"),
  Vincent grief, close beat ("Good — what's been happening,
  settled") — an ending that resolves.
- 30503: Dwayne d+3 missing-soup exchange, recap correct,
  invite with boundary. Mabel d+3 candy-bar confidence
  (a secret kept), trapline reveal, recap correct ("what
  they confided"), Jerusalem Artichoke teaching lands,
  party name suggested by Dwayne (cross-villager touch),
  Hazel grief. Chantal d+3 French nonverbal with a
  speak-back beat (see wrinkle 3). Dwayne d+7 letters-never-
  sent confidence, Sweeps Week field teaching, recap
  correct, Hickory Nuts teaching lands, Hazel grief.
  Sung d+7 wound ask, Moderator field teaching (real monster
  knowledge), Hazel grief (favor owed), invite accepted,
  recap correct.
- 30504: Felix d+3 stolen-joy laughter exchange, spring
  reveal, recap correct, invite with boundary, Hugo grief
  (burnt piece + boot-oiling ritual). Ernestine d+3 wound
  ask, static-voice field teaching, trapline reveal, Hugo
  dream grief. Felix d+7 teach-me exchange, recap correct,
  Hugo grief, Staghorn Sumac teaching lands. Ernestine d+7:
  the d+3 wound ask RESOLVED honestly off-screen ("Never
  mind this wound — we got it handled. Thanks anyway."),
  Hugo grief, "We bury, we grieve, we keep going. There's
  no step four.", recap correct, teaching lands.

Wrinkles (carried, not fixed mid-run on speculation):
1. RECURRING (r104 #3) — invite wording: menu label "Want to
   come with us?" vs spoken "Want to come with me?"
   (convo-beats vs convo-dialogue). Appears on every invite
   transcript this panel. Dialogue copy is a Steve-eyes call,
   not a silent worker edit — still not changed.
2. RECURRING (r104 #2, display gap) — scout re-picks: Amara
   d+7 picks scout while Jessica holds it, Dwayne d+7 while
   Mabel holds it, Sung d+7 while Dwayne holds it, Ernestine
   d+7 while Felix holds it. Per r104's code-read, assignRole
   transfers with a spoken handover — but no handover line
   appears in these transcripts, so it still reads as two
   people holding scout. The menu itself labels "(held by
   X)" and still offers the pick, which is the transfer
   semantic, but the transcript never shows the transfer.
   Instrument/display gap, not a mechanics defect per the
   r104 code-read; needs a transcript-capture check, not a
   mechanics fix on speculation.
3. COLOR (not a defect) — nonverbal grin variant "Fuck you."
   after (smile) in Nikolai d+3 and Chantal d+3 (Petra's
   variant is "No?"). In context (grin, emphatic nod,
   comfortable silence, "This was good") it reads as joking
   warmth, not hostility. One pool line, noted once.

## Village assessment (plain words)

- 30501's village is the succession leg working as designed:
  six bearers across 60 days, each handoff narrated and known,
  trust in the high 80s, pantry near 50,000, and the line
  ending with Aria holding a village that keeps its dead by
  name (Ashley grieved by name on d+3 and d+7 alike).
- 30502's village is the same leg bending honestly: two
  organic deaths with real causes (betrayal, starvation) in
  the middle of the chain, then scripted handoffs carry the
  line to Mona with 9 alive and a deep pantry. Deaths have
  causes, not just dates.
- 30503 and 30504 are steady villages: one mantle pass each
  (30503's second pass comes late, d87, and holds), then long
  competent life — pantries 18,947 and 84,757, trust in the
  high 80s–90s, knowledge growing (teaching lands in both
  directions). Nothing missing that a player would notice;
  the blanks this run found are one fixed bug and two
  carried display wrinkles, not dead ends.
- What villagers know: the dead are remembered by name within
  days (Ashley, Vincent, Hazel, Hugo), favors owed outlive
  their makers ("Vincent owed me a favor", "Hazel owed me a
  favor"), unfulfilled wound asks come back until answered
  (Amara, Sung, Ernestine — and Ernestine's resolves honestly
  when handled), and confidences stay secret (Mabel's candy
  bar, Dwayne's letters).

## Reachable / Fun / Winnable (leg 7)

- REACHABLE: yes. Every panel seed reached a mantle pass
  (organic phase-A deaths on 3/4 — 30504's leg death was
  scripted only because phase A found no organic death in
  window), chains ran to 7 handoffs, and the fifth-handoff
  window opened on both forced seeds.
- FUN: yes, on the evidence of the transcripts — the week
  after a death is the most human week in the game (grief
  with names, asks that persist, confessions, callbacks,
  secrets, rituals). The death itself is narrated, including
  keepsakes buried with the body — and now the recap of a
  conversation about a death names what was actually asked.
- WINNABLE: the leg is not the win path itself, but nothing
  here blocks it — surviving villages climb trust, bank
  knowledge, and feed deep pantries; the villages that lose
  bearers lose them for game reasons (betrayal, starvation,
  the wild), not for succession reasons.

## Telemetry deviation check

node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json --current
'evidence/2026-11-02/journey-succession-r108-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
LOUD lines (2), both VERDICT: EXPLAINED, baseline NOT rolled:
- deaths.bearer <redacted> 200%: baseline 5 -> current 15 (n=4 files) — the
  forced-chain panel deliberately kills bearers (30501: 5,
  30502: 7, 30503: 2, 30504: 1 = 15, matching the panel's own
  death records); regime, not drift (r89/r91/r94/r97/r100/
  r104 precedent, prereg rule).
- census.fallen swung 80%: baseline 10 -> current 18 — same
  cause (per-seed fallen 6+7+3+2 = 18, matching tele).
Quiet: census.alive, census.integrationStage (all stage 3),
week2.deadBearerMentions. Baseline left untouched.

## Regression suite

node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-playtest2 in the worktree:
284 passed, 6 failed (604s) — the 6 are EXACTLY r104's
standing pre-existing families (measurement-proof-update,
measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof,
establishment-r20-fixes). No NEW failure. The capable-bot
food-deed proof ran (62s) and is NOT in the failing list —
GREEN, as r104 reported.
Infra note: the first checkquick launch was killed as a side
effect of killing a stuck session (process.kill tears down
the whole tree including nohup'd descendants — the log
showed only dots, no summary). The suite was re-run cleanly
in its own session; the 284/6 result above is the re-run,
not the killed attempt.

## Metric review (§14)

- No metric was re-scored mid-run. The keepsake bar as
  re-specified in this run's prereg (vanish → line on
  disposition records; fired-with-0-vanished descriptive) is
  now checkable and passed — r104's metric-review proposal
  is implemented, not just proposed.
- The determinism leg's "byte-identical" wording met the fix
  landing between panel and re-run: the diff is exactly the
  fix's +25 line shift in stack traces, with all game-state
  bytes equal. Proposal for the NEXT run: state the leg as
  "trajectory-identical apart from recorded source line
  numbers" when a game fix lands mid-run, so the leg judges
  drift, not line shifts.
- SPLIT-TRIGGER proposal from r104 stands (expand on a
  same-day pair, keep same-iteration as the (e)-rebaseline
  trigger): this panel had neither, so the trigger stays
  untested by fresh data — carried, not resolved.
- ANALYZER-HEADLINE note from r104 stands (CHAIN5 headline
  lists scripted-stage successors only; detailed chains line
  lists all): 30502's headline reads "Vincent -> Wael ->
  Booker -> Owen -> Sigrun -> Mona", skipping the organic
  Jessica and Amara steps between Wael and Booker. Display-
  only, detailed record correct; still not changed.

## Closeout

[PENDING — fill after commit + merge: commit hash, index
clobber check, merge hash, release, rotation-b verified at 4,
lock deleted if it still carries this run's run_id.]
- One game change, flagged [needs-eyes]: src/js/conversation.js
  +25/-0 (recap-label asked-favor-first). Instrument +
  evidence otherwise: driver, main analyzer, naming analyzer,
  keepsake proof, naming proof, recap probe, recap-label
  proof test, prereg, 4 panel stdout/stderr, 4 tele, 59
  transcripts, analyzer + naming outputs, 2 proof logs,
  recap-probe JSON, checkquick log, run note.
- No push, no bump, no live check — merged locally, pending
  ship (ship loop owns version bumps, pushes, live
  verification).
