'use strict';
// Read only the gate declared by the public contestChoose action. Damage is
// a playable risk, not an affordability gate; never price a free choice up.
function availableIndices(Game, ac=Game.state?.activeContest) {
  if(!ac||ac.phase==='done'||ac.arenaSuspended)return [];
  const choices=ac.phases?.[ac.phaseIdx||0]?.choices;
  if(!Array.isArray(choices))return [];
  const kcal=Game.state?.scholar?.kcal||0;
  return choices.flatMap((choice,index)=>{
    if(!choice)return [];
    const required=choice.do?.reqKcal;
    return required&&kcal<required?[]:[index];
  });
}
module.exports={availableIndices};
