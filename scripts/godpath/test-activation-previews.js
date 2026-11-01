'use strict';
const path=require('path'),rootIndex=process.argv.indexOf('--root'),K=rootIndex<0?require('./lib'):require(path.join(path.resolve(process.argv[rootIndex+1]),'scripts/godpath/lib')),T=K.reporter('activation previews');
(async()=>{
 const G=await K.load({seed:221027,narration:true});
 function prepare(){const s=K.newRun(G);for(const id of ['game_sense','patient_aim','field_medicine','blood_magic','second_wind','long_table','stoke'])K.giveAbility(G,id,{force:true});s.kcal=G.kcalCap();return s;}
 let s=prepare();const state=JSON.stringify(G.state),cards=G.activatableAbilities();
 T.ok('preview enumeration leaves the actual world unchanged',JSON.stringify(G.state)===state);
 const medicine=cards.find(a=>a.id==='field_medicine'),blood=cards.find(a=>a.id==='blood_magic');
 const native=G.data.abilities.find(a=>a.id==='field_medicine').legacyCost.kcal;
 T.ok('treatment preview includes activation plus native food bill',medicine.desc.includes('Cost: '+(G.abilityKcalCost('field_medicine',null)+native)+' kcal'));
 T.ok('healing is never labeled with the global damage bonus',!medicine.desc.includes('OVERCHARGED'));
 T.ok('Blood Price retains HP payment/food gain without an invented food debit',/Spend \d+ HP to gain 500 kcal/.test(blood.desc)&&!blood.desc.includes('Cost:'));
 const share=G.data.abilities.find(a=>a.id==='long_table').actions.find(a=>a.id==='share_pot'),original=share.effect;
 try{share.effect='Give food: 40 kcal is an effect, not a price.';const card=G.activatableAbilities().find(a=>a.id==='long_table.share_pot');T.ok('an effect mentioning food cannot suppress its real bill',card.desc.includes('Cost: 300 kcal')&&card.desc.includes('about 30 min'));}finally{share.effect=original;}
 const m=K.fight(G,'bulldozer',{px:4,py:4,mx:5,my:4,hp:1000}),p=G.tbFighter('p');p.moveLeft=3;p.acted=false;G.tbfight.turnIdx=G.tbfight.order.indexOf('p');
 const listed=G.activatableAbilities(),read=listed.find(a=>a.id==='game_sense.read_stance'),aim=listed.find(a=>a.id==='patient_aim.take_aim'),automatic=listed.find(a=>a.id==='second_wind.refuse_death');
 T.ok('scouting states the knowledge requirement and spent attempt',/recognize/.test(read.desc)&&/unsuccessful/.test(read.desc)&&read.desc.includes('1 action')&&!/OVERCHARGED|knowledge-gated/.test(read.desc));
 T.ok('aim describes the actual Strike and dodge tradeoff',/next Strike/.test(aim.desc)&&/cannot dodge/.test(aim.desc)&&aim.desc.includes('1 action')&&!/OVERCHARGED|enemies get \+hit/.test(aim.desc));
 T.ok('automatic survival is never billed as a paid button',automatic&&!automatic.available&&!/Cost:|OVERCHARGED/.test(automatic.desc));
 let kcal=s.kcal,hp=m.hp;const known=G.tbPatternKnown(m.mdef.id);const result=G.useAbility('game_sense','read_stance',m.key);
 T.ok('native stance read pays exactly the previewed food and one action',result!==false&&kcal-s.kcal===G.abilityKcalCost('game_sense','read_stance')&&p.acted&&p.moveLeft===3);
 T.ok('scouting does not damage the enemy or teach an unknown pattern',m.hp===hp&&G.tbPatternKnown(m.mdef.id)===known);
 kcal=s.kcal;T.ok('repeat stance read refuses without another payment',G.useAbility('game_sense','read_stance',m.key)===false&&s.kcal===kcal);
 s=prepare();K.fight(G,'bulldozer',{px:4,py:4,mx:5,my:4,hp:1000});const fighter=G.tbFighter('p');fighter.moveLeft=3;fighter.acted=false;G.tbfight.turnIdx=G.tbfight.order.indexOf('p');kcal=s.kcal;
 G.useAbility('patient_aim','take_aim');T.ok('native aim pays its advertised activation without striking',kcal-s.kcal===G.abilityKcalCost('patient_aim','take_aim')&&fighter.acted&&s.aimBonus?.mult===2.5&&s.aimBonus.guaranteed&&s.aimBonus.exposeTurns===1);
 T.ok('well-fed damage power itself is unchanged',G.abilityPowerMult()===1.25);
 const desc=G.data.abilities.find(a=>a.id==='patient_aim').actions.find(a=>a.id==='take_aim').effect;T.ok('authored aim no longer calls a melee-capable Strike a shot',/next Strike/.test(desc)&&!/shot|enemies get \+hit/.test(desc));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
