# journey-social r44 — THE ECHO + THE DEATH LEDGER (lane B, leg 5, 2026-10-23)

Leg question: r43 named two open items for the next social run:
(1) Raul voiced the identical mootFriendVoice line for Eamon in two trials
2 days apart — does a second variant with world-level alternation kill the
echo without weakening the beat?
(2) per-seed JSON records deaths (name+day) without causes — can the corpse
record (`cp.cause`) + tele `death` events supply a death-cause census
without beats mining?

Queue-jump justification: rotation-b reads 5 at run start; the immediately
previous commit (e7fa7b8dd, social r43) touched these exact systems
(mootFriendVoice, social driver). Per the body rule ("If a recent commit
touched a system not up next, you may jump the queue — note why"), this run
continues leg 5 as r44 and the file stays 5.

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any play, 2026-10-23T12:20Z)

Policy/substrate: SAME as r41–r43 — warm-competent LAW-ABIDING (competent
base; warm neighbor: donates, keeps promises, comforts; ZERO crimes).
2 convos/day rotating the roster (deep, kind picks, gossip forcing
GOSSIP_TARGET=3). Moot duty = VOTE ONLY, with-the-room; the driver NEVER
convenes — natural ticks must (measurement purity, r41). DAYCAP=140.
Seeds 4001–4004 (fresh; adjacent to r43's 3901–3904).

Instrument: scripts/journey-social-r44-20261023.js (r42 driver fork: +
death-cause capture in the corpse sweep — `cp.cause || 'unknown'` — +
tele-death-event cross-check in the final summary; + per-seed deathCauses
aggregate). TAG=r44-pilot, EVIDIR=evidence/2026-10-23.

Fix: betrayal.js mootFriendVoice — two variants, world-level alternation
(state.village.betrayal.friendVoiceCount; advances only on actual voicing;
consecutive firings never echo). Both variants name friend+accused and keep
the ceremony tagline "It matters who your friends are." (deliberate refrain,
like the verdict beat — not an echo). Pure voicing: votes unchanged,
idempotent per case, try/catch at call site. Proof:
scripts/test-moot-friendship-voice-20261022.js extended (alternation
contract: A,B,A; consecutive firings differ; both name friend+accused and
carry a stand-by beat).

What would count as interesting:
- Wild: >=2 firings on the same world and none consecutive-echo — the r43
  Raul finding is closed by construction.
- Death census: deaths by cause shows WHERE villages die (r43's village
  assessment said villages dissolve with the scholar / scatter — the census
  should show combat vs starvation vs disease vs thirst vs unknown).
- Blank: all causes 'combat'/'unknown' — the corpse-cause vocabulary is too
  coarse; beats mining still needed (documented, NOT re-scored).

Bindings (a miss is NO-GO, never re-scored):
- M1 instrument: per-seed JSON + transcripts complete 4/4, affinity capture
  live, plot/case census no gaps >2d. GO/NO-GO.
- M2 echo: GO iff proof test green (extended contract) AND the pilot's wild
  firings show no consecutive echo (variant sequence recorded per firing).
  A single firing is not evidence either way — then M2 = DOCUMENTED BLANK.
- M3 people: sense-read ALL wild voicing firings in ceremony context; 0
  fabricated-history flags. GO/NO-GO.
- M4 guardrail: >=3/4 runs end with >=5 alive and the village not scattered.
  (r42: 1/4, r43: 0/4 — expected to MISS on attrition; per r43 metric review
  this is survival-tuning, not social-caused. A miss is documented, not
  re-scored.)
- L2' standing: verbatim content-beat repeats within one convo = finding.
- F1 informational: death-cause census — deaths by cause across 4 seeds
  (corpse.cause + tele death events); does the census structurally answer
  why villages die?

## Results (appended post-run, 2026-10-23T12:4xZ)

Fix landed: betrayal.js mootFriendVoice — 2 variants + world-level
alternation (friendVoiceCount, advances only on actual voicing). Proof
scripts/test-moot-friendship-voice-20261022.js 18/18 GREEN (was 13/13;
+5 alternation-contract checks). Friendship probe
scripts/probe-friendship-effect-20261022.js 9/9 re-green post-change.

Driver: scripts/journey-social-r44-20261023.js (r42 fork + death-cause
capture: corpse `cp.cause` + tele `death` events + per-seed deathCauses).
Smoke (seed 4005 × 10d): PASS (plotSnaps=10, caseSnaps=10, convos=16,
instrumentOk=true).

Pilot: seeds 4001–4004 × 140d, warm-competent law-abiding, natural moots only.

- M1 (instrument): GO. 4/4 complete; per-seed JSON + transcripts complete;
  affinity capture live; plot/case census no gaps; instrumentOk=true all.
- M2 (echo): GO. Wild verification of the exact r43 scenario — s4002:
  Tariq stands for Ella at d12 (variant A: "doesn't look away... hear them
  out") and again at d14 (variant B: "steps forward, jaw set... I stand by
  them"). Same speaker, same accused, 2 days apart — NO ECHO. Alternation
  counter advances only on voicing (idempotent per case preserved).
  Both s4002 moots also [ALIGNED (acquit-voters warmer)] — r43's M2(a)
  continuity holds at higher moot density (4 NPC-NPC moots this pilot).
- M3 (people): GO. Sense-read all wild firings + s4001 weregild ceremony +
  s4003 murder→exile ceremony. The d14 voicing lands after the count,
  before the verdict — natural. Variant B's "jaw set / room goes still"
  contrasts variant A's "heads turn"; the shared tagline reads as ceremony
  refrain, not echo. s4003: Scarlett's confession breaks the case, the
  village exiles Nora+Mieczysław ("Take what you can carry and go") and
  remembers Scarlett's leniency — consequential, coherent, 0 fabricated
  history. THE SCHISM beat ("fewer chairs around the fire tonight") carries
  real social weight.
- M4 (guardrail): GO 3/4 — 4001: 7 alive, 4002: 8 alive, 4003: 6 alive
  (villages intact); 4004: village died d130, 0 alive. First guardrail GO
  in four runs (r39 2/4, r42 1/4, r43 0/4).
- L2' standing: no new verbatim content-beat repeats flagged in this
  pilot's sampled transcripts (r43's dig-miss fix holding).
- F1 (death-cause census): WORKS — the corpse-cause vocabulary is richer
  than feared. 40 villager deaths across 4 seeds: monster 15, combat 11,
  sickness 4, lockjaw 2, "a wound that wouldn't close" 2, starvation 1,
  dehydration 1, ambush 1, "the night" 1, contest 1, Big-Eyes 1.
  Villages die FIGHTING (65% monster/combat), then disease (~17.5%),
  then the long tail (starvation, dehydration, wounds, social violence).
  r43's open question "why villages die" is structurally answered: not
  social collapse — monster pressure. The social fabric isn't what's
  killing them; the attrition is a survival-tuning observation, unchanged.
- F2: no fabricated cases in this pilot.

Telemetry: check vs social.json baseline QUIET (7 metrics, no large
deviations) — pure voicing, zero behavior change, as designed.

Feud/grudge state (r43's third open item, documented not built): the
machinery is symmetric and complete — negative bond depth (-1 rival →
bondCold openers "What." / "Make it quick."; -3 floor), grievance channel
(recordGrievance: -min(12, severity/2) bond hit, depth banks at -25/-50/-75
crossings), hostile vote terms (tallyVotes ×0.4 symmetric; exile path
aff<10 → vote them out). Formation is crime-gated: under the law-abiding
substrate no grievances form, so the ledger stays warm. s4001 shows the
channel working when wrongs happen (Lucia bondV=-8 with Arthur after the
ambush). Whether non-criminal friction (favoritism, gossip, old wounds)
should form feuds is a STEVE DESIGN CALL — not built here.

## Metric review

- r44's M2 pre-register allowed DOCUMENTED BLANK on a single firing; the
  pilot delivered the ideal case (2 firings, same pair, 2 days apart) — GO
  by the strong path, no re-scoring needed.
- M4's 3/4 GO vs r43's 0/4: seed variance on the same substrate, not a
  mechanism change (this run changed zero behavior). The attrition
  observation stands: warm-competent law-abiding loses ~1/4 villages by
  d140 to monster pressure.
- Death-cause census exceeded the pre-register's worry case: the
  vocabulary is specific enough ('lockjaw', 'the night', "a wound that
  wouldn't close", 'Big-Eyes') to be structurally informative. No beats
  mining needed. Driver gap carried forward: `accuser: ?` on
  npcMootTick-convened cases — the convening line names the accuser
  (Caroline, Lucia) but the case record doesn't; parse-or-record fix for
  a future driver touch.

## Village assessment (plain words)

4001 is the steady one: 7 alive at d140, one weregild paid, deep bonds
everywhere (62 pairs, 44 deep). 4002 is the dramatic one: 8 alive, TWO
moots in three days over the same ambush — first acquitted (Tariq stood
for Ella and the room listened), then weregild. 4003 is the tragic one:
6 alive, a murder answered with exile — Nora and Mieczysław walked into
the trees, Scarlett stayed on probation, and the fire has fewer chairs.
4004 is the dead one: the village died fighting on d130, 20 dead, mostly
to monsters.

Socially these villages feel ALIVE: 62–106 bond pairs per run, 31–44 deep,
gossip traveling (77 gossip convos across the pilot), moots convening on
real plots without any driver convening, friendships visibly moving votes
(Tariq twice; both s4002 moots vote-aligned with warmth). The ledger is
warm because the play is lawful — when wrongs happen, the cold machinery
engages (Lucia's -8 bond with Arthur). Rivalries exist as a latent
system, not a lived one, under peaceful play.

## Landing (2026-10-23T12:4xZ) — BLOCKED, FAIL LOUD

Commit b371219df (50 files) → rebased clean onto master 5d18ac937 as
c0624737b; proofs re-green post-rebase (moot-friendship 18/18, probe 9/9);
worktree clean. The `git merge --ff-only journey2-social` in the main tree
FAILS: `fatal: update_ref failed for ref 'ORIG_HEAD': cannot update ref
'ORIG_HEAD': couldn't write '.../.git/ORIG_HEAD.lock'` — write() returns
EPERM.

Root-caused (not retried blindly): the EPERM is on the write(2) syscall
itself, intermittent, scoped to `/home/hatch/workspace/the-scattering/.git/`
— ALL git ref updates fail (ORIG_HEAD, refs/heads/*, merge); direct
python os.open+os.write reproduces EPERM while shell `echo >` to the same
dir flaps OK/EPERM across seconds; /tmp and repo-root writes are
consistently fine. Started ~12:28Z, still blocked at ~12:45Z. Same
container-EPERM class as the jest chown quirk (AGENTS.md), new surface:
git lock-file writes.

NOT forced: manual ref surgery on the sacred main tree during a
filesystem flap risks corruption. Nothing half-done: branch
journey2-social@c0624737b is IN the main repo, rebased on current master,
proofs green — the ONLY remaining step is the ff-merge.

Recovery (exact): when the flap clears, in ~/workspace/the-scattering:
`git merge --ff-only journey2-social` → then
`bash scripts/worktree-release.sh journey2-social merged` →
`git worktree remove --force ~/workspace/worktrees/journey2-social` →
`git branch -d journey2-social` → `bash scripts/worktree-reap.sh`.
Worktree left registered with a FRESH heartbeat so the reaper won't touch
it; lock file deleted per body rule. Next playtest-loop-2 run will hit the
existing journey2-social slug at registration — read this note first.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes. Conversations, gossip, moots, the friendship voicing
  (now with alternation), favor promises — all fired in natural play with
  zero driver convening. A real player reaches every social surface.
- FUN: yes. The d12/d14 Tariq pair is the kind of emergent beat the leg
  is for — the same friend standing up twice, in different words, and the
  room listening the second time. The schism beat after the exile lands
  hard. Caveat carried from r43: 1 in 4 villages still dies to monster
  pressure by d140 — the social fabric doesn't save them, which is honest
  but undercuts long-arc social investment.
- WINNABLE: neutral for this leg — social mechanics neither block nor
  carry the win. (M4 attrition is survival-tuning, not a social gate.)
