# Journey endgame r296 — ADOPTION CLOSEOUT (lane B, 2026-11-28)

Leg 4 (endgame). Pass T pilot on fresh band 107758–107765, seeds
107758–107761 only — PILOT STOP. Adoption closeout: the 0655Z run
died after the pilot + analyzer (~07:48Z last heartbeat; final
heartbeat attempt failed on registry lock held >120s; machine
restart 07:13Z earlier in the run). No run note was written. This
run (playtest2-20261128T0855Z) adopts it: recovered prereg commit
`dd66019ae`, pilot log, analyzer log, per-seed corpora; completed
the Q5 people check (worker read all 4 transcripts in full, 12,309
lines); wrote this note; lands the evidence.

Substrate: master `6dc7304ae` (worktree HEAD). Post-panel delta on
master: sim-seatvoice-a (`8ea0b727e`, table.js +36/−6) — verified
by reading the diff: two new voicing helpers + string swaps in
three capstone delivery branches; no gate, price, or behavior
change. The panel measures the pre-seatvoice game; the rebase
brings it in without a re-run.

Rotation: 4 at run start; advances to 5 (social life) at closeout
after verified landing.

## Verdict: PILOT STOP — ALL NO-GO

Stop condition met on all three counts: 0 homebody handoffs
presented/converted, 0 deedGate-ok days, 0 tribute deliveries.
STOP per PILOT FIRST; the remaining four seeds (107762–107765)
were NOT run. Document and move on.

3/4 villages won lesser seats; 1 village-lost. 0 full seats —
same shape as r275 (0/4 full, 3/4 lesser).

## Q1 — chain as it now plays

| seed | plan | announce | sat | seat | path | won | end | living vets (peak) | w4+ kills |
|------|------|----------|-----|------|------|-----|-----|-------------------|-----------|
| 107758 | wavesnw | d90 | d92 | lesser | beloved/light | yes | over-other | 1 | 1 |
| 107759 | wavesnw | — | — | — | — | no | village-lost | 0 | 0 |
| 107760 | waves | d90 | d91 | lesser | witness/light | yes | over-other | 0 | 0 |
| 107761 | waves | d90 | d105 | lesser | witness/light | yes | over-other | 0 | 0 |

- M3b-peak NO-GO: peak ≥2 on 0/4 (only 107758 ever held a living
  veteran, peak 1). M4-wave5-or-full NO-GO: 0/4. M23b gate-ok
  tally 0/4 — no seed reached deedGateReady().ok.
- HANDOFF-CENSUS: 0 presented / 0 converted / 0 holds;
  converted-party kills 0/0. Seven handoff calls total
  (2+2+0+3), all returned 'skip' — the homebody handoff never
  presented, so the r275 open thread stays open on a new band.
- VETCONV: 91 vet-fights across the panel, 1 wave-4+ kill
  (107758). KILL-ANATOMY: vDie 2, vFlee 7, otherEnd 8, mFlee 1,
  talkDown 5; damage-share medians 0.93 (vDie) / 0.12 (vFlee).
- Binding gap on all three seated seeds: w5:0/2 (107760 also
  w4:2/3). Standing peaked at 199 on 3/4 seeds (M20: the
  199-mechanism true on 3/4) — villages reach the standing
  ceiling and still cannot open the deed gate, because wave-5
  never unlocks and veterans never form.

## Q2 — W5-FACING (fourth census)

0/3 seeds reaching the table faced ≥2 wave-5 types (all faced
0). Pooled with r267 (0/4) + r270 (1/6) + r275 (0/4): **1/21**.
The w5 bar is the binding constraint — a DESIGN OBSERVATION,
not a defect (the bar is Steve's design; the measurement is
the finding).

## Q3 — STALL FATES (fifth run, in days)

3/4 seeds stalled, 94.8 stall-days total; fates PERSIST 2,
REGRESSION 1, NONE 1. UNBLOCK→full 0/0 (pooled 4/10
unchanged: r263 4/6, r264 0/2, r267 0/2, r270 0/0, r275 0/0).

## Q4 — M25d (bar ≤1)

One bought-seed loss this run: 107759 bought d46 (spent 8,030,
pantry 14,130→6,100), village lost d73 (scattering, pantry 0,
3 alive). Bar met at the line. Pooled 3/28 (was 2/24).

Causation NOT established: the pantry recovered to 16,157 by
d57 — above the pre-buyout level — and collapsed d63+ from a
supply failure, not the spend; and Sean Ahmed's starvation
death (d16) predates the buyout entirely. The buyout spend did
not cause the loss on this evidence.

## Q5 — dialogue holds + ghost-say (people check)

All four transcripts read in full (12,309 lines). M18-ghost
0 confirmed; M18b-ghost-say 0 confirmed on 149 scanned
`💬 <Name> says:` lines; M18b control test green (Rosa
CONFIRMED / Leonor clean on the r275 positive control).

- Deflect-promise "never again": 0. The r262 fix holds — all
  28 "Never again" hits are the Spare Socks keepsake line.
- Resume-quote-kind mismatches: 0 — NOT EVALUABLE. No resumed
  conversation fired anywhere (zero "resum*" lines, zero
  resume alternates), so there is nothing to mismatch.
- Witness-line "Names, named.": 0.
- Settled re-ask names the favor: NOT EVALUABLE as specified
  (no re-ask lines); closest analog is sound — Desmond's
  re-promises name the actual favor ("You said you'd help with
  the pantry run — and it never happened").
- Mourning-above-naming (r291): MOSTLY HOLDS. Sean transfer
  (L854), Adrian transfer (L1494), Vasyl transfer (L8605) all
  sit above the naming catch-up in their sitting. One
  counter-case, L4584–4594: grief sandwiched between telling
  and settling, and Adrian's body is brought home ~200 lines
  after the mantle already transferred, with no explanation of
  the gap.
- Departname true-name beats: 0 violations. Departures use
  true names; "stranger" lines are genuine strangers.
- Holdspeak hold verdicts: 0 — never fired. HOMEBODY transfer
  line: 0 — never fired (consistent with 0 presented).
  GONE-BEARER lines: 0 markers (7 mantle transfers in 107759;
  the death/mantle beat itself is present and strong).
  M-PR1 commit-menu flip: 0. Resume-pick fall-through: 0.
  DOWNEDTWICE / FIGHT-STALL: 0.
- V-WAITVARIETY: analyzer GO — 69 combat hold lines, 5
  variants [14,14,14,14,13], 0 adjacent repeats.

### F1 — NAMEBEAST FAIL (systematic; new F-item)

The naming beat never attaches a name to the beast just told
or killed. On 107759's 11 catch-up debates: in 5 of 10 paired
cases the settled list contains names never argued in that
sitting and argued names vanish — e.g. L2277 argued "Big Big /
The Ugly Beast / Loud-Eyes / Big-Eyes / Sir Blinds-A-Lot" but
L2278 settled "Old Big" (never argued); L3175 argued
"Big-Eyes / Big Loud" but L3176 settled "Sir Blinds-A-Lot";
L3843 argued "Loud-Eyes / Big Big" but L3844 settled only
"Big-Eyes"; L8201 argued only "The Big Beast" but L8202
settled "Ugly-Eyes / Big-Eyes". 3 of 11 are structurally
incomplete: L4999 argued with no settled line; L6186 and
L8626 settled ("Big Big", "The Ugly Beast") with no argued
line. In 107761 both catch-ups are half-missing the same way
(L536 argued "The Big Stare / The Loud Thing", no settlement;
L747 settled "The Big Beast", no argument). 8 standalone "It's
settled" lines in 107759 + 3 in 107761 fire mid-stream naming
a beast the reader never saw debated — e.g. L2320 settles "The
Ugly Beast" right after Nina, Sean and Patricia told of a
war-drum toad, Cliffhanger and Lockpick. Same names re-settled
repeatedly: "Loud-Eyes" 3×, "Big Big" 4×, "The Loud Beast" 3×,
"The Big Stare" 2× in 107761. Fire-settles sittings ask "So —
what are we calling it?" after every telling (5 in a row,
L1594–1598) and never answer it in that sitting.

Counterpoint, working as designed: 107761's live debate —
"Back at the haven the argument starts: Ursula is calling it
'Don't-Look.' Nobody agrees yet — weigh in if you want." — is
tied to the just-seen thing; and the Codex does track settled
names as beasts ("Old Big is dead", "The Ugly Beast is dead"),
so the names refer to something internally. The transcript
just never shows the link.

Filed as F1 for a future run (r147 rule: not planned before
scored seeds, no mid-run fix).

### F2 — BETRAYAL WITHOUT MEMORY (new F-item)

107761: Sanne betrays twice (days 95 and 102) with a
verbatim-identical script ("Sanne's expression changes. Not
anger — arithmetic." / "The System loves a betrayal arc. I'm
just giving the audience what they want."), is calmed both
times, returns with zero reckoning, then joins the party as
Scout ("Finally. I was wondering when you'd see my value.").
Miguel betrays once ("Nothing personal. I need what's in your
pack more than you do.") and is likewise seamlessly back,
bringing food unprompted, healed by Ursula. The village's only
reaction, twice identically: "You bring killers into your
party." The foreshadowing tells are good ("You catch Sanne
weighing something in their hand. A rock. They put it down
when you look."); the aftermath forgets. Sanne later takes
Peacemaker's Voice with no comment.

Filed as F2 for a future run.

### F3 — "CAN WE TALK?" STATIC INVITATIONS (new F-item)

19× in 107759, 13× in 107761, the same lines repeated for
days if never taken — Ursula's "Just... talk. Like people used
to." 6× in 107761; Ella's "I need some space. A corner nobody
needs me in. Is that okay?" 4× in 107759. A static menu, not a
conversation.

Filed as F3 for a future run.

### V-WAITVARIETY reconciliation (coordinator note)

The worker counted 62 empty-quiver wait-narration lines and
could not reproduce the analyzer's 69. Both are correct about
different families: the analyzer's V-WAITVARIETY counts combat
hold lines (`tbVillagerWaitLine`: "holds and watches." /
"waits, eyes on the beast." / ... — 5 variants, 69 lines,
0 adjacent repeats, GO). The worker's 62 are the empty-quiver
narration family ("Desmond/Arjun/Reagan will not send out a
bow with an empty quiver — there is nothing left to load it
with — [middle] — the party waits"), 4 middles, 0 adjacent
identical repeats. That family reads sensibly in context —
the game's legible signal that the party has no arrows and is
grounded, a death-spiral cause made visible — but 62
near-identical repetitions is heavy. Separately, the invariant
"You wait. The light changes. Nothing asks anything of you."
fires 206× with zero variation — idle-wait narration filler.

### Minor

- "0 rounds, 0 taken" kill summaries (107759 L6406, L6801;
  107761 L1645) — a fight resolved with no rounds reads as a
  reporting artifact.
- The Witness contest announces "Three witnesses describe
  last night's attack on the trap-line. Two are true memories.
  One the System wrote. Name the fabrication" — but the three
  testimonies never appear; the player refuses without ever
  hearing a witness.
- Funeral feasts cost 4,500 kcal each while the village
  starves (Reagan's, Arjun's) — reads as intentional poignancy
  ("the links hold because the dead are honored, not because
  the grief was forgotten"); noted as a systems tension.
- Casing slip: "Ines is dead. that stranger did it."
- Desmond tells three beast-kills in one sitting (L7441–7447).

### Clean evidence

Death/mantle beats ("Ashanti Guzman is dead — dehydration.
The village stops. Somebody screams. Somebody else starts
digging." / "You knew Sean — not the office, the person. The
fire keeps expecting him, and so do you." / "'You're not
Reagan.' No heat in it. Just fact. You'll have to earn this
face." / "The village's quarrel was with Arjun — and Arjun is
dead. The sentence doesn't cross the grave."); the Desmond
promise arc (promises made, broken twice at −15 trust each —
"Desmond won't meet your eye. You said you'd help with the
pantry run — and it never happened. Promises rot." — then
"Reagan stops asking. That's how you know it's broken — not
the anger, the stopping."); the Commune beats ("THE SHARING IS
THE CONVERSION... WE THREW AWAY THE ENGINE AND KEPT THE
FUEL." / "IS THIS WHAT HAVING A FRIEND IS. DO NOT ANSWER. LET
ME HAVE THIS ONE UNSOLVED." / "Grief isn't a load. It's a
ledger."); the Big-Eyes counter correctly naming the dead
("You are NOT Adrian Taylor. Adrian Taylor is dead. You are
grief wearing a face. Take it OFF."). Gossip drift is good
("Three retellings in, nobody remembers what actually
happened — but everyone has opinions."). No fabricated shared
history found; no dead-speaker lines (consistent with the M18
clean scan).

## Village assessment (plain words)

- **107758 — won lesser, beloved/light, sat day 92.**
  Wanjiru's village. Wanjiru killed The Herald on camera on
  day 92 — the only veteran. Sofia and Sigrun held the sick;
  Sigrun cured Sofia's and Evie's fevers with herbal remedy in
  front of the camp. Supardi learned to talk, Thabo scouted,
  Evie took Scout. The dead: Christian to sickness (day 12),
  Mai to an alien (38), Boris in the arena (49), Carlos to a
  stranger (54), Sam in a contest (67), and on day 90 Lorena
  and Fatima fell to the Algorithm and Colton was brought home
  dead the night the table sat. Seven alive at the end. They
  knew a lot — 56 Codex entries, field pharmacy, fever's end —
  and they ate: tribute wagons were turned away because the
  shelves were full. What was missing: wave-5 veterans (1 of
  2), a capstone deed. They won the small door and named the
  dead in the finale.
- **107759 — village-lost, day 73, starvation.** Haven burned
  through seven bearers — Ashanti (thirst, day 9), Sean
  (hunger, 16), Adrian (the wild, 31), Reagan (thirst, 49),
  Arjun (the night, 64), Vasyl (a stranger, 65), Desmond
  (contest, 68) — and the mantle landed on Ella, 67, an ESL
  teacher, with three people left. Twelve dead in all, four of
  hunger in the last four days (Sean, Nina, Priya, Yara). The
  village knew plenty — 26+ monster tricks, counters for
  Loud-Eyes and Big-Eyes, the grief-face goodbye — and its
  fighters killed: Nina took the war-drum toad, Vasyl the
  Grief Counselor, Desmond the Dustboar. But it could not feed
  itself and could not shoot: no arrows for weeks, the pantry
  empty by day 72, and "On the third hungry day, people
  started walking — in different directions. The scattering,
  again." What was missing: food, arrows, water — the basics.
  Its last acts were Meera being named Holder of the Relay and
  Ella dreaming of a voice at the northern treeline. The
  village died knowing a lot and holding nothing.
- **107760 — won lesser, witness/light, sat day 91.** The
  smallest window. Quinn ascended through the relay, Tuva
  worked, Marcus watched the treeline. They faced the war path
  (The Ugly Beast, Loud-Eyes), survived 8 contests, and won by
  putting the judges on trial: "Read the charges." Two wave-4
  fought, no veterans, no capstone. A thin but clean win.
- **107761 — won lesser, witness/light, sat day 105.** The
  loud, crowded one. Eight alive at the end (Ananya, Ursula,
  Sanne, Miguel, Tashi, Omar, Ivy, Ines). Ines killed The
  Callback on camera; Ursula won her Duel; the village
  survived 14 contests and refused Hardened Siege to its face.
  Six dead, five to aliens (David, Seiji, Giuseppe, Nadia,
  Thiago) and Michelle to the wild. They knew the most — 50
  Codex entries, peacemakers and blood-rage and word-of-mouth,
  Ananya a national voice. What was missing: the same wall as
  the others — no veterans (0 of 2), no wave-5 faced, no
  capstone deed. And the village never dealt with its
  betrayers: Sanne turned twice, Miguel once, and everyone
  just went back to foraging.

## Reachable / fun / winnable

- REACHABLE: the endgame window itself is reachable — 3/4
  reach the table, announce day 90, sit the lesser seat. The
  lesser seat is reachable; the full seat is not on this
  panel (0/4 deedGate-ok, 0/4 wave-5 faced).
- FUN: the transcripts are often genuinely good (Commune,
  mantle beats, Desmond arc, gossip drift) — but the naming
  system floating free of its referents (F1) and betrayal
  amnesia (F2) are live people-check defects that break the
  sense of a world that remembers.
- WINNABLE: NO on this panel. The full seat never opens (deed
  gate never ok; w5 0/2 everywhere; veterans peak 1). Same
  wall as r275: wave-5 never unlocks, veterans never form
  (1 wave-4+ kill in 91 vet-fights). The chain stalls at
  launch → wave-4 kill.

## Metric review

- M20 samples-vs-days: reported in days (94.8 stall-days).
- peakVet baseline (3): NOT ROLLED. 4-seed pilot reads
  peakVet sum 1 (per-seed [1,0,0,0]); per-seed mean 0.25 vs
  baseline per-seed 0.6. Descriptive only, pilot n=4 — no
  baseline roll.
- FIGHTALLY2 stays OFF (thirteenth sighting stands).
- M25d: bar ≤1 met at the line (1 loss); pooled 3/28.
- NOTICK/CARRY: vacuous, tenth straight zero.
- M1/M6 on pilots: M1 GO 4/4; M6 GO 3/3 (structural, as
  expected on a 4-seed pilot).
- M23 vs TRIBUTE-FIRST: resolved by engagement — TRIBUTE-FIRST
  VOID (no delivery fired; experiment unanswered, not failed).
- W5-FACING: pooled 1/21.
- HANDOFF-CENSUS: 0/0/0; 7 calls, all 'skip'.
- M18b-GHOST-SAY: 0 confirmed on 149 lines; control test
  green.
- M9-supply: 35 blocked arrivals (w4=10, w5=0, other=25),
  all the canonical boundary line — GO BY RULE (designed
  one-monster-at-a-time behavior; w5=0 consistent with no
  wave-5 unlock; repeated Influencer blocks on 107760 are
  separate arrival attempts, rule-conformant). r275 precedent:
  67 blocked, reported as count.
- V-WAITVARIETY: see reconciliation above — analyzer and
  worker count different line families; both clean.

## Closeout record (adoption)

- Lock: STALE-LOCK RECOVERY. The 0655Z run's lock (run_id
  playtest2-20261128T0655Z) was deleted after the registry
  heartbeat proved 67 minutes stale (07:48:18Z vs 08:55Z
  pickup), no live node/playtest processes, and no live
  playtest-loop-2 coordinator in the subagent listing. New
  lock playtest2-20261128T0855Z written 08:56:18Z.
- Pre-flight (this run): main tree `git status --short`
  CLEAN at 08:55Z; disk 57% (fail line 85%); `git pull
  --ff-only` "Already up to date" at aa3860792.
- Worktree: ADOPTED journey2-endgame (registered 07:24Z by
  the dead run; heartbeat restarted by this run, verified
  landing 08:59:33Z and 09:14:56Z). The orphan journey2-4
  worktree (fully merged, dirty with staged deletions) was
  left alone per the r296 prereg note — flagged for the
  reaper/owner, NOT force-removed.
- Commits: `dd66019ae` (prereg + probe/analyzer/clone,
  recovered — verified by `git show`, 6 files, 4,970
  insertions) + this closeout commit (pilot log, analyzer
  log, heartbeat log, per-seed corpora, hbloop script, run
  note). M18b control proof `scripts/test-m18b-control-r296.js`
  green before and after rebase.
- Rebase onto master aa3860792 (5 commits over the 6dc7304ae
  substrate; only src/js delta is the seatvoice voicing
  change, see above). Proof re-run green after rebase.
- Telemetry: check run on the Pass T per-seed glob; LOUD
  lines adjudicated (see telemetry section in the run
  closeout — n=4 pilot vs n=5 baseline sums; no roll).
- Rotation advanced 4→5 after verified landing.
