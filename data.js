export const ITEMS = {
 fever:{name:'Fever medicine',icon:'☀️',color:'#f6b94c',symbol:'Sun'},
 allergy:{name:'Allergy medicine',icon:'🌼',color:'#a9cc73',symbol:'Flower'},
 cough:{name:'Cough medicine',icon:'☁️',color:'#7fbddd',symbol:'Cloud'},
 antiseptic:{name:'Cleaning lotion',icon:'🧴',color:'#b8a2da',symbol:'Drop'},
 gauze:{name:'Gauze & bandage',icon:'🩹',color:'#ecaa83',symbol:'Bandage'},
 ice:{name:'Ice pack',icon:'🧊',color:'#8bd8e8',symbol:'Snowflake'},
 water:{name:'Water',icon:'🥤',color:'#8fc7e2',symbol:'Cup'},
 toy:{name:'Teddy bear',icon:'🧸',color:'#cc956a',symbol:'Teddy'}
};
export const CONDITIONS = {
 fever:{name:'Feeling warm',symptom:'🌡️',line:'I feel so warm and sleepy.',exam:['temperature'],steps:[{game:'medicine',item:'fever',label:'Give fever medicine'},{game:'rest',label:'Water and a little rest'}]},
 allergy:{name:'The sneezies',symptom:'🤧',line:'Achoo! My nose is so tickly.',exam:['temperature','listen'],steps:[{game:'medicine',item:'allergy',label:'Give allergy medicine'},{game:'rest',label:'Water and a little rest'}]},
 cough:{name:'A tickly cough',symptom:'☁️',line:'My cough is keeping me awake.',exam:['listen'],steps:[{game:'medicine',item:'cough',label:'Give cough medicine'},{game:'rest',label:'Water and a little rest'}]},
 scrape:{name:'A little knee scrape',symptom:'🩹',line:'I fell over while playing.',exam:['inspect'],steps:[{game:'clean',item:'antiseptic',label:'Gently clean the scrape'},{game:'bandage',item:'gauze',label:'Wrap a cosy bandage'}]},
 bruise:{name:'A small bump',symptom:'🤕',line:'Oops! I bumped my knee.',exam:['inspect'],steps:[{game:'ice',item:'ice',label:'Hold the cool ice pack'}]},
 arm:{name:'An arm that needs care',symptom:'💪',line:'My arm feels a little sore.',exam:['inspect'],steps:[{game:'transport',label:'Wheelchair to the procedure room'},{game:'align',room:'procedure',label:'Line up the pretend arm scan'},{game:'patch',room:'procedure',label:'Apply the magic comfort patch'},{game:'bandage',item:'gauze',room:'procedure',label:'Support the arm with a bandage'},{game:'recovery',label:'Wheelchair to the recovery corner'},{game:'rest',label:'A blanket and a little rest'}]}
};
export const PEOPLE = [
 {name:'Mia',skin:'#f2bc91',hair:'#654139',shirt:'#ee8987',style:'pigtails',personality:'Curious'},
 {name:'Lucas',skin:'#ae7655',hair:'#3b302e',shirt:'#e9b953',style:'curly',personality:'Happy'},
 {name:'Emma',skin:'#f4c6a8',hair:'#b86d44',shirt:'#a296ce',style:'bob',personality:'Nervous'},
 {name:'Benny',skin:'#dfab79',hair:'#2e343b',shirt:'#7aafca',style:'short',personality:'Sleepy'},
 {name:'Grandpa Lee',skin:'#e6b68f',hair:'#b5b6b2',shirt:'#8bae87',style:'grandpa',personality:'Patient'},
 {name:'Zara',skin:'#925e44',hair:'#352d30',shirt:'#d999b4',style:'pigtails',personality:'Curious'}
];
export const LEVELS = [
 {name:'Hello, Doctor!',subtitle:'Your first little patient',icon:'👋',sticker:'🌈',capacity:1,duration:300,schedule:[{person:0,condition:'fever',at:0}]},
 {name:'First Day',subtitle:'A warm welcome',icon:'☀️',sticker:'☀️',capacity:2,duration:360,schedule:[{person:1,condition:'fever',at:0},{person:3,condition:'fever',at:20}]},
 {name:'Achoo!',subtitle:'Listen, care, feel better',icon:'🌼',sticker:'🌼',capacity:3,duration:480,schedule:[{person:2,condition:'allergy',at:0},{person:5,condition:'cough',at:15},{person:1,condition:'fever',at:40}]},
 {name:'Ouch!',subtitle:'Little bumps. Lots of care.',icon:'🩹',sticker:'🩹',capacity:3,duration:540,schedule:[{person:0,condition:'scrape',at:0},{person:3,condition:'bruise',at:15},{person:5,condition:'scrape',at:35}]},
 {name:'Busy Clinic',subtitle:'A little teamwork helps',icon:'🏥',sticker:'🧸',capacity:4,duration:600,schedule:[{person:1,condition:'cough',at:0},{person:2,condition:'scrape',at:0},{person:5,condition:'allergy',at:15},{person:3,condition:'bruise',at:25}]},
 {name:'Wheels Up!',subtitle:'Let’s go on a caring adventure',icon:'🦽',sticker:'🏅',capacity:4,duration:720,schedule:[{person:4,condition:'arm',at:0},{person:0,condition:'bruise',at:10},{person:2,condition:'arm',at:30},{person:5,condition:'cough',at:45}]}
];
export const EXAM_NAMES={temperature:'Check temperature',listen:'Listen to the heartbeat',inspect:'Look at the sore spot'};
export const BEDS=[{x:125,y:280},{x:310,y:280},{x:495,y:280},{x:680,y:280}];
export const STATIONS=[
 {id:'supplies',x:1000,y:290,tx:1000,ty:350,label:'Supply cupboard',icon:'🧴'},
 {id:'nurse',x:293,y:622,tx:320,ty:666,label:'Ask Nurse Lily',icon:'💬'},
 {id:'sink',x:790,y:350,tx:770,ty:375,label:'Wash hands',icon:'🫧'},
 {id:'chair',x:480,y:480,tx:480,ty:510,label:'Take wheelchair',icon:'🦽'},
 {id:'procedure',x:595,y:617,tx:595,ty:635,label:'Procedure room',icon:'✨'},
 {id:'recovery',x:997,y:621,tx:997,ty:656,label:'Recovery corner',icon:'💛'}
];
export const DEFAULT_SETTINGS={music:0.28,sound:0.7,voice:0.95,muted:false,patience:false,reduced:false,speed:1,capacity:3,needleFree:true};
export function readSave(storage=localStorage){
 try{const s=JSON.parse(storage.getItem('doctor-ayden-v1')||'{}');return {unlocked:Math.min(5,Math.max(1,Number(s.unlocked)||1)),results:s.results&&typeof s.results==='object'?s.results:{},settings:{...DEFAULT_SETTINGS,...s.settings}};}catch{return {unlocked:1,results:{},settings:{...DEFAULT_SETTINGS}};}
}
