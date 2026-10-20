'use strict';
const K=require('./lib'),T=K.reporter('Dialogue voice boundary');
(async()=>{
 const G=await K.load({seed:7,narration:true});K.newRun(G);const vid=G.state.village.roster.find(id=>id!==G.villagerId);
 const predicted=[],fallback=[];global.speechSynthesis={cancel(){},getVoices(){return[]},speak(u){fallback.push(u.text)}};global.SpeechSynthesisUtterance=function(text){this.text=text};G.audio={isMuted:()=>false,playVoice(){}};G._voiceUnlocked=true;G.setVoiceEnabled(true);
 G._voiceTts={stored:async()=>[],download:async()=>{throw Error('fixture offline')}};await G.refreshVoiceCache();G._voicePacksCached=true;
 const line='They take a breath. "Stay by the fire." Leaves rustle. “I will be back.”';
 G.convoSpeakLine(vid,line);T.ok('device voice reads only both quoted speech spans',fallback[0]==='Stay by the fire. I will be back.',JSON.stringify(fallback));
 G._voiceTts={stored:async()=>Object.values(G.VOICE_PACKS).map(v=>v.voiceId),predict:async x=>{predicted.push(x.text);return null}};await G.refreshVoiceCache();G.convoSpeakLine(vid,line);await new Promise(r=>setImmediate(r));
 T.ok('Piper receives the same speech-only payload',predicted[0]===fallback[0],JSON.stringify(predicted));
 T.ok('pure gestures and sounds are silent',G.convoSpeakLine(vid,'They take a breath. A branch cracks.')==='empty');
 T.ok('unclosed speech is not guessed as narration',G.convoSpeakLine(vid,'They say "not finished')==='empty');
 T.ok('foreign quoted speech stays gated',G.convoSpeakLine(vid,'"Bonjour."',{foreign:'french'})==='foreign-skip');
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
