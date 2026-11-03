# Journey social life r112 — PRE-REGISTRATION (Lane B, 2026-11-03)

Leg 5 (social life). Rotation-b read 5 at run start → write 6 at
closeout (social → crisis). Base: local master at registration
(0c09dc602, includes the r111 recovery commit). Slug journey2-social.
No push, no bump, no live check — ship loop owns those. Gating freeze
stands; no gate/deed/standing/wave/table change.

## Run context: stale-lock recovery + r111 recovery (this run, before play)

- The lock file named run 2026-11-03T00:02:06Z, which has NO registry
  entry, and was >90 minutes old at run start: deleted as stale.
- The journey2-social tree from the r111 run was dead by every check:
  heartbeat 35+ minutes stale, no node sim processes, no tree writes
  since 00:43Z, uncommitted r111 partials only. Its 4 files (2 seed
  JSONs, prereg, driver) were safe-committed on its branch
  (0754f69cc), rebased cleanly onto master, merged ff-only
  (0c09dc602), tree released, branch deleted. Nothing was lost.
- r111 itself died mid-panel: only seeds 41101 (d30, village-lost)
  and 41102 (d99, village-lost) finished. r112 is a FRESH full panel
  on current master with fresh seeds, not a completion of r111 —
  mixing bases across one panel would break comparability. r111
  partials are preserved on master for reference.

## The question, in one line

Do the social layer's DARK channels actually run in full play:
do villager-to-villager lure invitations resolve sometimes-taken
(Steve 2026-10-27 ruling 8, wired as npcInviteDecision kind
'lure' in betrayal.js, called from npcPlotTick), and do
recorded grievances feed new plots — or are they built but
silent in real runs?

## Why this question (not a re-proof)

r110 (2026-11-02) proved the bright side: conversations,
friendships, moots, gossip all fire, villages live 117–141
days. It found grievances are the live rivalry channel
(9–10 per run, read from betrayalState) but did NOT test
whether grievances change behavior, nor whether lure
invitations ever resolve. r111 partials (2 seeds, both
villages lost) already hint at the shape: lure decisions DO
fire (41101: 3 lure calls on one pair, 1 veto-declined +
2 taken; 41102: lure taken d8), but grievances read ZERO
at every snapshot on both seeds and every plot carried
grievanceInviterToTarget=0. r112 tests whether that shape
holds on fresh seeds on current master, with villages
that (hopefully) live long enough for the dark channels
to mature.

## Play

Competent + socialite policy (r110 driver + dark-channel
instrumentation, zero src/js changes in the driver),
DAYCap=140, seeds 41201–41204 (fresh, distinct from r110
and r111), narration: true on ALL seeds (r110 metric
review: never mix narration-on/off). Driver:
scripts/journey-social-life-r112-20261103.js (r111 driver
verbatim with run/seed/date strings updated).

Instrumentation (read-only, driver-side): same as r111 —
npcInviteDecision wrapper, dark snapshots at d30/60/90/120/
end, ambush narration lines.

## Pre-registered metrics (BINDING, §14)

- **M1 lure resolution: GO iff** ≥1 lure decision is
  recorded on ≥2 seeds AND across the panel at least one
  lure is TAKEN (sprung) and at least one DECLINED
  (expired plot / declined decision). All-taken or
  all-declined = NO-GO (the "sometimes" ruling fails in
  play). Zero lure decisions on ≥3 seeds = NO-GO,
  built-but-silent.
- **M2 grievance→motive: GO iff** on ≥2 seeds, at least one
  plot's inviter holds a recorded grievance against its
  target at snapshot time, OR grievance counts and plot
  counts move together with a named case quoted. Zero
  grievance-linked plots on all seeds = NO-GO finding
  (motive comes from elsewhere; say so, don't re-score).
- **M3 player invites: REPORT, no bar.** invite-history
  counts/accepts for player-facing invites (player choice,
  not automated). Zero offers is itself a finding.
- **M4 sense: GO iff** one ambush/spring passage and one
  grievance-recall conversation passage are read in full
  and judged as meaningful (want/engagement/consequence) or
  the break is named and fixed same-run. If grievances
  stay zero, the grievance-recall half is untestable and
  is reported as such (a consequence of the M2 finding,
  not a pass).
- **M5 census (guardrail, r110 shape):** villages alive
  past d100 on ≥3 seeds, ≥10 full conversations and ≥80%
  natural ends per seed. A collapse here voids the dark
  read (no village, no society) and is reported as such,
  not papered over. NOTE: r111 partials failed this
  guardrail outright (0/2 past d100); if r112 repeats
  that, the finding is about village survival on current
  master, and the dark-channel verdict is reported as
  partial, not stretched.

## Interesting findings (pre-declared)

- Lure decisions fire but skew all-taken or all-declined
  (character bands too narrow/wide in play).
- Plots form with no grievance link anywhere (motive from
  ambition/fear/envy only — grievances decorative).
- Lure decisions never fire despite plots existing
  (wiring gap between plot creation and tick).
- A grievance visibly cracks a bond and later drives a
  plot (the rivalry arc working end to end).
- Player party invites resolve by character (temperament/
  bond visible in reasons) — the same decision, other
  channel.
- Villages on current master die young across seeds
  (r111 shape repeating) — survival, not society, is the
  live question.

## Metric review (carried from r110/r111, applied here)

- Grievances read from betrayalState().grievances, not
  village.grievances (r110 probe correction).
- Gossip spread via rep-ledger growth, not per-villager
  carriage (no such field).
- Narration: true on all seeds; never mix.
- r111 was a mid-panel death, not a verdict: its partials
  inform r112's priors but do not settle M1/M2.
