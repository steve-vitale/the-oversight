# OVE-100 — dialog #2 stage-direction quote hybrids

Tip base: `29fbbfab67cc` (PR #73 head).

## Change
`convoSnippetIsStageDirection` rejects teach-diegesis / mood tags / recap
`Like|As I said|Short version` + `still on` even when dialogue quotes are
present. characterGen `They go still. "…"` remains real speech.

## Proof
```
node scripts/test-snippet-stage-direction.js   # PASS (Nino/Jesse/Luke/Toan hybrids)
node scripts/test-favor-debt-help-coherence-20261108.js
node scripts/test-curious-stale-opener.js
node scripts/test-live-thread-engage-dry-20261108.js
node scripts/test-voice-question-decoration-20261108.js
node scripts/test-recap-hammer-20261108.js
node scripts/test-resume-teach-ownership-20261108.js
node scripts/test-story-offer-yes-20261108.js
```
All GREEN. Muse journey files untouched.

`check.js --quick` still red on tip-preexisting measurement/phone/occupation/
capable-bot freshness (villager-brain + proof inputs); not introduced by this gate.
