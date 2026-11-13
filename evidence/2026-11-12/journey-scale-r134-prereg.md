# journey-scale r134 — PRE-REGISTER (lane A, leg 3 SCALE, spoken-raise answer window)

**Run id:** `playtest-loop-a-20261112T2344Z` (lock run_id `2026-11-12T23:44:48Z`).
**Run:** scheduled Thu 2026-11-12 17:45 CST (23:45 UTC); this run 23:44Z–.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `0fd54935b` (sim-stallcut61-a evidence; worktree
registered from 9b8fe9cf2, ff-merged to master 0fd54935b before any work —
master moved twice under pre-flight, both ff-only, clean).
**Worktree:** `journey-scale`, registered ~00:02Z (cap was 16/16 — freed
one slot by supervised release of `build-ladder-leg4-baseline`: heartbeat
104h stale, branch tip a04a6c0fc IS an ancestor of master, only 2 untracked
files not on master, both rescue-copied to
`hidden_files/rescued-build-ladder-leg4-baseline-20261112/`; branch deleted
— its tip is reachable from master, nothing lost. The other 7 stale trees
were inspected and LEFT: journey-scale-attr + sim-sametick-a hold real
uncommitted src/script edits; sim-secondlink-a's tip is NOT in master;
sim-redactor-a/saycap-a/siegedialog-a are the Nov-12-resumed flesh-out
arms; sim-wideduty-a holds 22 untracked wideduty logs not on master.
Full inspection in the run note — the main session owns the held-work
decision from here). Heartbeat landed at registration; hbloop
`journey-scale-hbloop-r134.sh` 10-min cadence (setsid, PID verified alive,
r187 lesson: check the loop PROCESS at each phase).
**HBLOOP DEATH (this run, ~00:16Z–01:08Z):** the loop process died
silently after its 00:16:35Z tick (r187's mode exactly — the script
exists, the process does not); registry heartbeat went 36 min stale
before it was caught at the wrap-chain verification phase. Restarted
01:08Z with setsid (new PID 19845), tick landed 01:08:31Z. The loop
must be re-checked at EVERY phase from here, not just at registration.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. The fix below changes no demand, no number, no
bar: it offers an answer to a raise that was already spoken. **Perception
law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning until the fight-play census lands. This run touches dialogue-menu
code only, so the gate does not bind it (same as r129–r133/r183/r184).
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the fix for the
r132/r133-carried spoken-raise crowding defect. It does not re-prove the
veteran census or the survival collapse (the Loop A/B bisect owns that).

## Standing context (read before scoring)

- **r133 scale (landed 2026-11-12):** trap-line gesture answer (nv:accept /
  nv:decline) — GO, 3 answered sittings, 0 defect talks. Scale reachable
  4/4 (regional links, ladder stage 3, lesser seat priced 4/4, tribute
  delivered 1/4), fun yes; winnable unchanged — 0/4 full seat, national
  voiced on the one living village only; the living-veteran pair is still
  the wall. Band lived-days 491 (1 alive / 3 dead). Vetbar guard GO.
- **r133 Q2-secondary carried (this run's Q1):** the spoken-raise answer
  window — 12 of 15 raise talks ended "not-offered": the raise was spoken,
  then a follow-on beat crowded the answer window out ("Can I ask you
  something else?" → "Forget I said anything."). Same shape as r132
  (7 not-offered, 4 properly answered). The raise survives pending and is
  answered on a later day — the bookkeeping survives, the human moment
  dies. Canon (docs/CONVERSATIONS.md): "Replies belong to the spoken
  exchange. A question, invitation, price or live request owns its
  decision menu."
- **r123 origin of the Baraka item (this run's Q2):** Baraka, a French-only
  villager, mimed "come with me" six times in seven days (97902 d10–d16)
  with no shared words learned — the language barrier played honestly but
  the same unvoiced raise repeated with no progress. r133's nv:accept fix
  answers the mime in DRIVER sittings; the daily-play chooser still never
  takes an invitation (r133 carried gap, lane decision owed). Baraka:
  0 mentions in the r130/r131/r132/r133 bands — no Baraka-like case arose,
  so the re-check has been INCONCLUSIVE, not "still unvoiced".

## Q1 (PRIMARY) — SPOKEN-RAISE ANSWER WINDOW: build the fix

**The defect (read in code + transcripts this run, not just inferred).**
Henry, seed 133101 d10 (r133 band), raise talk #2, outcome not-offered,
read in full:
- THEM: "I've heard good things about Stonebridge. We should link with
  them — we'd be stronger together." (THE LINK RAISE, spoken.)
- THEM: "Walk my trap line with me? Extra hands, extra eyes." (a
  follow-on beat — a want line — spoken right after.)
- THEM: "Right. Go on, then."
- No YOU line in the sitting: the player heard the raise and was never
  offered a way to answer it. The policy (which takes link:accept first
  whenever offered, 5 turns) never saw it.

**Mechanism (CORRECTED this run — the prereg's first version was wrong
in two places; read the wrap chain in code 2026-11-12 ~00:30–01:00Z and
confirmed by the proof test's unfixed-engine run).** The follow-on beat
is ALWAYS an invitation label (`betrayal.js:321-324`: 'traps' / 'carry' /
'show'). The sitting's shape:
(1) the talk request carries the raise as the opener (stageLinkRaise
writes `talkRequests[vid] = { line: '__NAME__: ' + line, linkRaise: true }`;
`convoOpening` priority 1 speaks it verbatim);
(2) the pending invite is spoken right after as its own beat
(`sayLine(vid, inviteBeat, { tag: 'invitation' })`);
(3) the link beat is HELD, not recorded: `startConvo`
(`conversation.js:5996-5997`) runs `if (openerOwnsReply || inviteBeat
|| bondBeat) c.linkPending = linkBeat; else if (openerCarriedLink)
recordStagedBeat(linkBeat, 'linkraise');` — because the invite beat
exists, the FIRST branch fires, so `c.linkRaiseSpoken` stays FALSE
even though the raise line is in the transcript, spoken verbatim as
the opener. (Bond mirror, 5981-5982: `if (openerOwnsReply ||
inviteBeat) c.bondPending = bondBeat; else if (openerCarriedBond)
recordStagedBeat(...)` — same shadowing.) The r153 OPENER-CARRIED
SKIP comment intends the record ("still record the beat, so the
exclusive bond:/link: menu still owns the reply"), but the hold
condition above it shadows the record whenever another beat exists.
(4) `bondChoices` (`bond-initiation.js:997`) gates on
`pendingLinkRaise && linkRaiseSpoken` — flag false, so it offers
NOTHING; the turn-0 menu has no `link:`. The invite owns the menu
(branch 3) and the player gets 0 turns. The raise stays pending and
is re-spoken next sitting — the bookkeeping survives, the human
moment dies. All 3 not-offered-spoken talks in the r133 band are this
shape (Henry d10 'traps', Fidele d94 'carry', Henry d111 'show'); the
other 9 not-offered are correct r132 holds (raise never spoken).
**Wrap chain (verified from code, not assumed):** load order in
`index.html` is betrayal.js → villager-agency.js → bond-initiation.js
→ party-formal → truth, each wrapping `Game.convoChoices`. The
betrayal wrap prepends `betrayal:` choices INSIDE the agency
wrapper's filter; the agency wrap re-runs `convoMenuPage` on the
combined menu (filter #2); the bond wrap prepends `bond:`/`link:`
choices with NO re-filter — so `link:`/`bond:` choices are NEVER
stripped by `convoMenuPage`: the filter only ever sees `betrayal:`
+ base choices. The prereg's first version had this backwards (it
said branch 3 strips the prepended `link:`) — it does not; the
`link:` answers are absent because `bondChoices` never offered them
(the flag), not because the filter removed them.
**Second, separate mechanism (tag-overwrite crowding):** once the flag
IS set (raise spoken via `sayLine`, not opener-carried),
`bondChoices` prepends `link:` — but a follow-on beat spoken after
the raise overwrites `c.spokenBeat.tag`, so branch 5 (`linkraise`)
no longer fires and the want-owns branch (or the unfiltered base)
crowds the menu with competing choices. The `link:` answers are
present but the menu is not exclusively the raise's. The invite's
answers can be stripped the same way: the invite is spoken FIRST
among the ask beats, so any later beat overwrites its `'invitation'`
tag and the else-if strip removes `betrayal:`.

**The fix (one task, one commit).** Two defects, one ask-window: the
flag lie (the wild defect) + the tag-overwrite crowding. Three edits:
0. `conversation.js` `startConvo` — THE HOIST (the wild defect): check
   `openerCarriedBond` / `openerCarriedLink` BEFORE the hold condition
   in both beat blocks (`conversation.js:5981-5982` and `5996-5997`):
   `if (openerCarriedBond) recordStagedBeat(bondBeat, 'bondproposal');
   else if (openerOwnsReply || inviteBeat) c.bondPending = bondBeat;`
   and the same order for the link beat. Rationale: the line was
   already spoken verbatim as the opener — the flag must say so,
   whatever other beats exist. Holding it instead would let the
   continuer re-speak it verbatim later (the double-serve the r153
   OPENER-CARRIED SKIP guards against) while the flag lies in the
   meantime. Safe: `openerCarriedLink` requires `opThread === 'request'`
   + `treq.linkRaise`, and a raise line does not match the genericQ
   classifier, so `openerOwnsReply` is false for raise openers; for
   bond openers ("Can I ask you something?...") genericQ may match,
   but the proposal WAS spoken as the opener, so recording it is still
   the honest flag. No hold is lost: the hold exists for beats the
   opener did NOT carry.
1. `convo-beats.js` `convoRecordSpokenBeat`: add the invite to the r132
   per-sitting spoken flags — `if (tag === 'invitation')
   c.inviteSpoken = true;` alongside the `linkraise` / `bondproposal`
   lines — and reset `c.inviteSpoken = false` in `startConvo` next to
   them (`conversation.js:5634`). The flag is needed because the existing
   `inv.spoken` is NOT a "heard this sitting" signal: it is set at label
   resolution (`conversation.js:5920`), BEFORE the hold-or-speak
   decision, so a HELD (queued, unheard) invite already carries
   `inv.spoken = true` — keying the union on it would offer
   `betrayal:accept` for an invite never heard, evicting a pending
   question's answers at turn 0 (an invitation-honesty regression, r7).
   `c.inviteSpoken` is set only by the actual emission (`sayLine` →
   `convoRecordSpokenBeat`, tag `'invitation'` — the startConvo invite
   beat and the goon-held-beat continuer both funnel through it; a
   ledger-blocked beat falls back with tag `'endtopic'` and sets no
   flag). The nonverbal mime never goes through `sayLine`, so the flag
   stays false there (r133 untouched).
2. `conversation.js` `convoMenuPage`: replace branches 3–5 (invitation /
   bondproposal / linkraise, all keyed on the last-beat tag) with ONE
   union branch, keyed on the per-sitting spoken flags:
   - `inviteSpoken` = `c.inviteSpoken` AND pending invite exists
   - `bondSpoken` = `c.bondProposalSpoken` AND pending bond proposal
   - `linkSpoken` = `c.linkRaiseSpoken` AND pending link raise
   - if any is true (and `c.thread !== 'nonverbal'` — the mime path
     answers through `nv:accept`/`nv:decline` (r133), never `betrayal:`;
     the union must not strip them): `owns` = the union of the spoken
     asks' answers (`betrayal:accept/decline` / `bond:accept/decline` /
     `link:accept/decline`) + `leave` / `silence`.
   Corrected rationale (the first version misstated this): the union
   does NOT preserve `link:`/`bond:` by keeping them in the filter —
   they arrive via the bond prepend, which bypasses the filter entirely.
   The union's job for them is EXCLUSIVITY: it makes the filter treat
   a spoken ask as owning by FLAG rather than by last-beat tag, so a
   follow-on beat overwriting the tag can no longer crowd the menu
   with competing base choices (the want's `dlg:` answers, `goon`,
   pool topics). For `betrayal:` the union DOES preserve: an invite
   spoken first, its tag overwritten by a later beat, keeps its
   answers instead of being stripped by the else-if. Order vs the
   other branches is unchanged (ambush > winddown/closing >
   ask-union > pendingQ > reactiveQ > genericQ > trade/hawk > want): an
   invitation spoken after a raise no longer evicts the raise, and a raise
   spoken after an invitation no longer evicts the invite; a question asked
   mid-sitting still owns its turn exactly as an invite does today (the
   ask-union sits above pendingQ, as branch 3 does now). A single spoken
   ask behaves exactly as its old branch did (same answer set, same
   restriction — a spoken raise still owns its menu even when a drift note
   / bond beat / trader seed is spoken after it, where today the tag
   overwrite silently un-owns it). The r132 invariant is preserved exactly:
   the flags are set ONLY when the ask's line is actually spoken — an
   unspoken raise/invite/proposal is still never offered. No demand,
   number, bar, or line changes; no new system, no new file: one hoist +
   one flag + one branch. No rank change needed: an ask-owned menu has at most 6
   entries (4 answers + leave + silence), a single page.

**Known wrinkle, recorded not fixed (out of scope):** the
villager-agency reactive-budget trim (`villager-agency.js` ~1810-1860,
the "answers+2 contract") can split a live ask's accept/decline pair:
when a question's answers are live in the base menu AND a betrayal
invite is pending, the trim keeps `reactiveCount + 2` slots and cuts
the second half of the pair (`betrayal:decline` — probed 2026-11-12:
`scripts/probe-decline-20261112.js` / `probe-decline2-20261112.js`;
base 8 items > trigger 7, room 4, kept `[ans, ans, ans,
betrayal:accept]`, decline cut before the owns filter ever runs).
It did NOT fire in the r133 wild band (no question was live in the 3
defect talks — the opener was the talk request) and `startConvo`
never speaks an invite while a question owns the reply, so it is a
latent edge case, not the measured defect. Fixing it would change the
answers+2 contract (one-screen rule) — a design call for a later run,
not this one. The proof test avoids it by opening non-question
sittings for the invite/bond sections (§1/§3/§4/§6/§7). The
want-thread menu after an ask is answered (the want resumes next
sitting) is pre-existing behavior.

**Proof (before/after, same test — CORRECTED: the first version
mis-stated which sections discriminate).**
`scripts/test-journey-scale-r134-raisewindow-20261112.js` — harness game
(seed 134100), a speaking villager with a staged pending link raise /
bond proposal / invite (separate sittings; staging mirrors
`stageLinkRaise` / `stageBondProposal` / `betrayal.js:512` state writes
exactly). Sections that stage an invite or bond open a NON-QUESTION
sitting (helper `openSpeakingNoQuestion`: the opener must not leave a
live question — a question sitting would trip the agency trim wrinkle
above and measure the trim, not the ask window). Sections:
1. Raise + invite BOTH spoken via direct `sayLine` (not through
   `startConvo`) → turn-0 menu offers `link:accept` + `link:decline`
   AND `betrayal:accept` + `betrayal:decline` — GREEN BOTH engines
   (a pin: direct staging sets the flags, so it cannot hit the flag
   bug; it is NOT the Henry shape and is NOT RED on unfixed).
1b. Henry shape END-TO-END through `startConvo`: talk-request opener
   carries the raise + staged invite → the raise line AND the invite
   label are both in the opening transcript, `linkRaiseSpoken` is set,
   and the menu offers `link:accept` AND `betrayal:accept` — RED on
   unfixed (flag false, `link:` absent), GREEN on fixed (the hoist).
   This is THE discriminating section for the wild defect.
2. Raise spoken via `sayLine`, then a follow-on want beat ACTUALLY
   SPOKEN via `sayLine` (tag `'want'`) + thread/want poked — the
   follow-on overwrites `spokenBeat.tag`, so branch 5 cannot fire →
   menu is exactly `link:accept`/`link:decline`/`leave`/`silence` —
   RED on unfixed (want-owns crowds it with `dlg:`/`goon`), GREEN on
   fixed (the union owns by flag). The first version only poked
   thread/want without speaking a beat, so the tag stayed
   `'linkraise'` and the section passed vacuously on unfixed.
3. Bond proposal + invite both spoken via `sayLine` → menu offers
   `bond:accept` + `bond:decline` AND `betrayal:accept` +
   `betrayal:decline` — GREEN BOTH engines (a pin: `bond:` arrives
   via the prepend, which the filter never touches; the section pins
   the bond mirror of §1).
4. Raise NEVER spoken (pending, opener owns reply → held in linkPending)
   → menu has NO `link:accept` — GREEN both engines (r132 invariant).
5. No pending raise/invite/proposal at all → no `link:`/`bond:`/
   `betrayal:accept` — GREEN both engines.
6. `link:accept` taken with an invite also spoken consumes the pending
   raise (link forms / counter staged) while the invite stays pending —
   GREEN BOTH engines (the consumption already works when the answers
   are offered; the section pins it, it is NOT RED on unfixed).
7. Invite-only (no raise/proposal, non-question sitting) → menu is
   exactly betrayal:accept/decline/leave/silence — GREEN both engines
   (no over-offer; the first version opened a question sitting and
   the agency trim cut `betrayal:decline` — a trim artifact, not the
   ask window).
8. Raise-only (no invite) → menu is exactly
   link:accept/decline/leave/silence — GREEN both engines (the r132 shape
   preserved).
9. R132 regression guard (Claudete): pending raise, spoken beat NOT a
   raise, raise never spoken this sitting → NO `link:accept` — GREEN both
   engines.
10. Nonverbal guard (r133): a no-shared-words sitting with the mime
    shown still offers `nv:accept`/`nv:decline` and NOT `betrayal:accept`
    — GREEN both engines (the union branch must not fire nonverbally).
**Unfixed-engine expectation (run before building):** §1b RED
(flag + menu), §2 RED (exact-set only; the `link:accept`-present
assertion stays green — the answers are there, the menu is crowded),
all other sections GREEN. **Fixed-engine expectation:** all GREEN.

**Panel bar (Q1 GO iff all hold):** 0 spoken-but-unanswerable raise talks
in the 4-seed panel (raise line in the transcript AND no link:accept
offered/taken in the sitting — the new classifier splits not-offered into
`not-offered-spoken` [DEFECT] vs `not-offered-unspoken` [correct r132
hold]); ≥1 properly-answered raise talk. The policy takes link:accept
first whenever offered, so a missing YOU accept line means never offered.

## Q2 (SECONDARY) — BARAKA / DAILY-PLAY MIME: measure the gap (read-only)

**Question:** in daily play (not the driver's sittings), does a
no-shared-words villager's mimed raise ever get answered now that r133's
nv:accept exists? The r133 fix is proven in driver sittings; the daily-play
chooser (`conversation-pages.js` + per-policy `pickTalkChoice`, shared
across lanes) never takes `betrayal:accept` / `nv:accept` — so a mimed
invite in daily play is still left unanswered and re-mimed next sitting.
**Work (read-only, no build):** count in the panel's say-captures: mimes
shown in daily play vs `nv:accept`/`betrayal:accept` taken in daily play
(the betrayal watch file records daily-play accepts). Expected: 0 accepts
— the gap, confirmed. Record the lane decision owed: teach the shared
chooser to take `betrayal:accept` + `nv:accept` when offered (breaks band
comparability — a deliberate decision, not a silent instrument change),
or keep proving fixes only where the driver looks. Also re-check the
Baraka name: any French-only / comm-'none' villager with a staged raise
in the band, and what happened to it.
**Q2 bar:** verdict recorded with the counts; no build claimed.

## Q3 — TRAJECTORY SHAPE (guardrail)

Lived-days within ±25% of the r133 band's 491; no alive/dead flip
without an attributed cause (per the r133 attribution rule: the fix
can only change whether a spoken raise is answered, never a demand, a
number, or a bar — a death is attributable to the fix only if it
follows a raise-answer outcome). Lesser seat priced 4/4 expected;
vetbar guard kept (zero readiness/ladder disagreements on all 4 seeds).
The panel runs on the collapsed base; the survival collapse stays the
bisect's question, not this run's.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal
sittings AND all raise talks. Bar: senseless 0 for the raise-answer
class (a spoken raise answered with the words that fit what was said;
no English YOU lines in a no-words sitting; no nod loops past the
answer). The nod-loop variety observation (r132/r133) is re-checked in
the nonverbal sittings, not re-litigated as a defect. The Chantal
double-ask roughness (r187: generic yes doesn't consume a staged bond
proposal) is re-checked if a bond proposal fires in the panel.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser
seat priced, tribute delivered, wave reached, fights, wave-4 kills).

## Panel

- **Seeds: FRESH 134101–134104** (freshness verified below; fixture
  seed 134100 for the proof test). One seed per process (r183 adoption:
  driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as r131/r132/
  r133) — NO chooser change in this run (Q2 is read-only).
- **Driver:** `scripts/journey-scale-r134-20261112.js` (r133 driver cloned:
  labels/EVIDIR/seed list only; the r133 full-opening-transcript log, the
  nonverbal sitting on CONVO_DAYS, the nv: picker entries, and the r133
  vetbar recorder kept).
- **Analyzer:** `scripts/analyze-journey-scale-r134-20261112.js` (r133
  analyzer cloned + the Q1 classifier split: not-offered-spoken vs
  not-offered-unspoken, using the raise-line regex on the raise-talk
  transcripts + the accept YOU line; + the Q2 daily-play mime/accept
  count from the capture + betrayal watch).
- **Pilot:** seed 134101 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

134101–134104: 0 hits in `evidence/**/*.md` and `scripts/**/*.js`
(`git grep`, 2026-11-12); 0 filename hits. The only `git grep` hits for
the digit strings are substring coincidences inside old sweep corpora
(e.g. `"ate": 1341000` in a seed-6108 belongfeast corpus — not a seed
use). Fixture seed 134100 likewise 0. Fresh band confirmed before the
panel runs.

## Metric review (to fill at closeout)

- Q1: the panel bar + proof RED→GREEN as written.
- Q2: the counts + lane decision owed as written.
- Q3/Q4/Q5: as written.

## Carried (not this run's to build)

Daily-play chooser never takes invites (verbal or mimed) — lane decision
owed (see Q2); resolveInvite outcome lines quote the NPC in English in
no-shared-words sittings; nod-loop variety in nonverbal sittings;
spoken-raise + invitation both-spoken precedence (noted in Q1, not
built); Baraka unvoiced raise (re-check Q2, not a build); monster-veteran
+3 damage gap (Steve call); `tbVillagerFalls` vp.dead lie; guest-death
(Bing) prereg; scholar-payment open item (Steve-call); scale.json
baseline regime re-label; measurement-proof refresh owed (this run's
`src/js` touch re-stales the pair — see Gate); reaper-lock self-contention
fix (Steve-approved 2026-11-12, needs the build, not this run);
heartbeat-loop death mode (r187: check the loop process at each phase —
it DIED this run ~00:16Z, caught 01:08Z, restarted PID 19845);
agency reactive-budget trim splits a live ask's accept/decline pair
when a question's answers are live (villager-agency.js ~1810-1860;
probed this run, `scripts/probe-decline-20261112.js` /
`probe-decline2-20261112.js` — latent edge case, NOT in the r133 wild
band; fixing it changes the answers+2 contract, a design call for a
later run).

## CLOSEOUT — adoption run 2026-11-13T03:44Z (this run; the 17:45 CST run timed out behind its gate, heartbeat last 02:38:42Z, declared dead 03:44Z)

**Adoption verified, not assumed.** Proof test re-run by the adoption run:
unfixed engine 60 passed / 4 failed (§1b 3 fails — flag lie; §2 1 fail —
crowding), fixed engine 64 passed / 0 failed. Fix restored byte-identical
after the unfixed check (diff stat: conversation.js 59 lines,
convo-beats.js 8 lines). Driver/analyzer syntax-checked; panel run fresh
on the adopted tree.

**Panel (seeds 134101–134104, DAYCAP=140, policy
scalecourt-traderoad-r113-linkraise-sit):**
- 134101: d113 dead, pop 0/0, regional, lr 2/17, talks 5
- 134102: d76 dead, pop 0/0, regional, lr 2/19, talks 2
- 134103: d141 alive, pop 8/8, regional, lr 2/40, talks 2
- 134104: d141 alive, pop 7/7, regional, lr 2/95, talks 12; tribute
  (military_tribute) delivered d133
- Lived-days 471 vs r133 band 491 (-4.1%, within ±25%): HOLD. Lesser seat
  priced 4/4. Books close on all 4 seeds; unattributed 0; teleOnly 0.

**Q1 (PRIMARY) — GO.** 21 raise talks: 5 properly-answered, 3 counter,
0 not-offered-spoken [DEFECT], 13 not-offered-unspoken [correct hold].
The Henry shape fired twice in the wild and was answered both times
(Tamika 134101 d13 'Walk with me?', Priya 134102 d16 'Walk my trap line
with me?' — raise + invite follow-on, YOU answers the raise).

**Q2 (SECONDARY) — RECORDED.** Daily-play mimes 21, daily-play accepts
PROVEN 0 (capture lower bound; 0 off-day events in the betray watch).
The Baraka shape now has a name: Nikolai (Russian-only, 134104) mimes
"come with me" on d120/126/127/139/140 and is never answered in daily
play; the d120 DRIVER sitting answered it (nv:accept, quiet walk to the
tree line). Lane decision still owed: teach the shared chooser to take
betrayal:accept + nv:accept when offered, or keep proving fixes only
where the driver looks. Baraka re-check: a comm-'none' case DID arise
this band (Nikolai) — answered in the driver sitting, unanswered in
daily play.

**Q3 — HOLD.** Vetbar guard GO (0 disagreements; phantom days d133–140
on 134104 only — shadow exceeds real, informational). Trajectory HOLD
(lived-days -4.1%, lesser 4/4).

**Q4 — PASS.** All 21 raise talks + 7 transcripts read in full.
Senseless 0 for the raise-answer class; no English YOU lines in
no-words sittings; nod exchanges vary (quicker/slower/holding gaze),
not a stuck loop. Observations carried, not this run's defect:
(a) the generic-question "And?"/"Yeah?" filler repeats when the NPC
stalls (Martina 134104 d125–126, Jorge 134103 d12 — YOU: "And?" 3× in
one sitting); (b) raise-talk files attribute the nonverbal barrier/mime
lines to YOU while the transcript files attribute them to THEM.

**Q5 — census above.** 2 dead / 2 alive; all regional, peak stage 3;
fights 48/35/102/60; deaths by cause dominated by "the wild".

**Telemetry check:** quiet (4 files, 3 metrics, no large deviations);
baseline NOT rolled forward. Raw totals for the next run: fightsTotal
245 vs baseline 446; fightsByWave.4 174 vs 289; maxGameDay 471 vs 646
— the instrument's verdict is quiet; the baseline's basis (r133 band)
differs in horizon mix, so do not re-label the baseline on this run.

**Metric review.** Q1 bar held as written (0 not-offered-spoken +
≥1 answered). The panel bar's "≥1 properly-answered" was met 5× over.
No metric revision proposed. The pilot gates (crash / census errors /
0 rows / residual / teleOnly / trustset d60 / natgate rows / vetbar
d60) all passed on the pilot seed before expansion.

**NOT LANDED — flap-blocked, not failed.** A host write flap
(EPERM, errno 1) ran 03:57Z–past 05:10Z: `git update-ref` fails
persistently (probe B), so no commit, rebase, merge, or release was
possible in this window. Evidence writes flicker at minute scale
(driver runs crashed on writeFileSync until the stdout-to-file trap
was found: a failed stdout write kills node silently with rc=1 — run
drivers with stdout on a pipe, never redirected to a file, during a
flap). The panel was completed by deterministic re-runs with
per-file completeness checks (trust JSON parses, no 0-byte files
except beatanswers, which is legitimately empty: 0 beat answers).
Gate (check.js --quick) OWED at landing — not run this window.
Rotation stays 3 (write 3→0 on success only).

**RECOVERY (next run):** worktree `journey-scale` is registered,
heartbeat STALE (hbloop killed at closeout — do not trust a fresh
heartbeat from a dead loop; re-heartbeat after adopting). Uncommitted
in the tree: src/js/conversation.js + src/js/convo-beats.js (the fix),
evidence/2026-11-12/journey-scale-r134-prereg.md (this file),
evidence/2026-11-12/journey-scale-r134/ (panel corpus),
scripts/journey-scale-r134-20261112.js,
scripts/analyze-journey-scale-r134-20261112.js,
scripts/test-journey-scale-r134-raisewindow-20261112.js,
scripts/probe-decline-20261112.js, scripts/probe-decline2-20261112.js.
Probe `git update-ref refs/heads/probe HEAD` first; when it passes,
run check.js --quick, safe-commit the fix + proof + driver/analyzer +
evidence (one commit, message carries [needs-eyes] — dialogue feel),
rebase onto current master, re-run proof, ff-merge, release, write
rotation 3→0, delete the lock.
