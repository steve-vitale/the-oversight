const fs=require('fs');const note=`## Garden direction and usage audit (2026-10-20)

Steve's latest direction supersedes a flat six-bed, fast ordinary-farm model:
Haven growth should unlock beds; ordinary cultivation is a slow supplement;
invested food-powered gardening abilities make the strong garden path.
See GARDENS.md and his verbatim answer in godpath/STEVE-ANSWERS.md.

Codex's garden audit/tooling is ready for checked sharing. Current-source
74 natural campaigns plus8 separate neutral controls expose planting without
food:0/64 screen campaigns harvested;1/10 extended cases delivered14,400 kcal.
Full-pantry redirection skips maintenance, and dead beds lack reclamation.
These findings are scoped to current controllers, not human/gardener viability.
The final report is evidence/2026-10-20/garden-longplay-audit-r3.md.

Next bounded gameplay milestone: Haven-scaled visible capacity, slow ordinary
crop profiles, paid ability-driven growth, protected maintenance and paid
reclaim/replant, preserving saves/structures and one phone viewport. Measure
all23 domains with the same collector on both roots before shipping. Nothing
in this audit changes live garden values. The four caregiver campaigns remain
queued for prefix-faithfulness and natural late-game phone Continue/actions;
the new extended garden runs alone do not complete that earlier milestone.

`;
for(const f of ['docs/AGENT-LANES.md','docs/MUSE-CALIBRATION-HANDOFF.md','docs/ROADMAP.md']){let s=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');const i=s.indexOf('\n');s=s.slice(0,i+1)+'\n'+note+s.slice(i+1).trimStart();fs.writeFileSync(f,s);}
fs.appendFileSync('docs/SIMULATING.md','\n### Cultivated-garden usage audit\n\nThe optional scripts/garden-longplay-audit.js sidecar observes real planting,\nNPC garden duty/redirects, actual tending, crop loss and physical harvest\ndelivery. See GARDENS.md for repeat/resume commands, source fingerprints,\nneutral controls, opportunity limits and the meal-after-harvest boundary.\nIt retains all23 balanced metrics without changing their contract. It does\nnot make the general feature census a historical garden-use measurement.\n');
fs.appendFileSync('docs/SURVIVAL-LEVERS.md','\n## Garden direction and measured dead spots (2026-10-20)\n\nNo gameplay lever changes in this audit/tooling milestone. Current capacity\nis six at every Haven tier; ordinary crop growth7/12/14 days and repeated\n5,000-kcal harvests every3 days lack invested-ability growth hooks. Current\ncontrollers plant in64/64 screen cases but harvest in0/64. Ten extended\ncases reach terminal outcomes by day356; one delivers14,400 garden kcal.\nFull-pantry diversion precedes tending, and dead beds cannot be reclaimed.\nPrepared predicate contrast proves that branch, not every natural death.\nThe intended correction is Haven-scaled beds, modest slow ordinary farming,\npaid garden magic, maintenance separate from unwanted surplus and reclamation.\nTreat food output, useful consumption, labor/opportunity and all23 domains\nseparately. NPC garden-ability use and crop-specific intake remain unknown.\nSee GARDENS.md and garden-longplay-audit-r3.md; no runtime balance clearance.\n');
fs.writeFileSync('evidence/2026-10-20/garden-longplay-audit-r2.md','# Superseded comparison summary\n\nUse garden-longplay-audit-r3.md. This earlier summary misclassified28 seed\nIDs absent from the old screen as mismatches. R3 correctly distinguishes\n36 exact overlapping cases from28 unpaired cases. The raw r2 campaign\nreport and all garden-use counts are unchanged.\n\n'+fs.readFileSync('evidence/2026-10-20/garden-longplay-audit-r2.md','utf8'));
const pairs=[['is7','is 7'],['shoots,12','shoots, 12'],['and14','and 14'],['every3','every 3'],['is5,000','is 5,000'],['yields80%','yields 80%'],['delivers2,800','delivers 2,800'],['delivers:7,200','delivers: 7,200'],['roughly25','roughly 25'],['over25','over 25'],['set is16','set is 16'],['at150','at 150'],['ten600','ten 600'],['all23','all 23'],['All64','All 64'],['All82','All 82'],['day29','day 29'],['day32','day 32'],['day356','day 356'],['day270','day 270'],['The600','The 600'],['current7','current 7'],['and5,000','and 5,000'],['delivered14,400','delivered 14,400'],['cases,14,400','cases, 14,400']];
for(const f of ['docs/GARDENS.md','evidence/2026-10-20/garden-longplay-audit-r3.md']){let s=fs.readFileSync(f,'utf8');for(const[a,b]of pairs)s=s.replaceAll(a,b);s=s.replace('These are implementation requirements, not an approved numerical recipe.','These requirements do not yet select numerical values.');fs.writeFileSync(f,s);}
console.log('Garden direction, limits and next lane recorded');
