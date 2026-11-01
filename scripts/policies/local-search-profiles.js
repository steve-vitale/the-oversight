'use strict';
const {withLocalSearch}=require('./local-search');
module.exports={profiles:require('./public-travel-profiles').profiles.map(withLocalSearch)};
