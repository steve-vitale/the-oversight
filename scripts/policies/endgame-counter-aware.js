'use strict';
// Explicit composition of two already shared public-action experiments.
// Parent defaults and the two original experiment families remain unchanged.
const E=require('./ending-aware'),C=require('./counter-aware');
function wrap(base){return{...E.wrap(C.wrap(base)),id:'endgame-counter-aware-'+base.id,
 desc:base.desc+'; experimental paid ending pursuit and visible labor counterplay'};}
function profiles(){const {capable}=require('./capable'),L=require('./livelihood');return[capable,L.maker,L.merchant,L.caregiver].map(wrap);}
module.exports={wrap,profiles};
