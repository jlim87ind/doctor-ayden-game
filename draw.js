import {BEDS,CONDITIONS} from './data.js';
export const C={ink:'#36524b',green:'#3b9679',floor:'#ecf2de'};
export function round(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
export function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
export function line(ctx,pts,color,width=3){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
export function text(ctx,t,x,y,size=18,color=C.ink,align='center',weight=800){ctx.font=`${weight} ${size}px Nunito, 'Avenir Next', sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(t,x,y);}
export function person(ctx,x,y,opts={}){
 const {scale=1,time=0,doctor=false,moving=false,happy=false,skin='#edbd94',hair='#343936',shirt='#ed948b',style='short',face='down',nurse=false,carrying=false}=opts;
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const bounce=moving?Math.sin(time*14)*2:happy?Math.sin(time*7)*3:Math.sin(time*2)*.8;
 ellipse(ctx,0,7,23,7,'#33534020');ctx.translate(0,bounce);const stride=moving?Math.sin(time*14)*6:0;
 round(ctx,-15,-8+stride,12,17,5,doctor?'#548e88':'#666b8a');round(ctx,3,-8-stride,12,17,5,doctor?'#548e88':'#666b8a');
 round(ctx,-17,3+stride,16,9,4,'#ecae59');round(ctx,3,3-stride,16,9,4,'#ecae59');
 round(ctx,-23,-47,46,45,13,doctor?'#fffef4':nurse?'#8dbfa4':shirt,doctor?'#c9dbd1':null);
 const arms=happy?-15:0;line(ctx,[[-20,-36],[-28,-17+arms]],skin,12);line(ctx,[[20,-36],[28,-17+arms]],skin,12);
 if(doctor){ctx.beginPath();ctx.moveTo(-11,-47);ctx.lineTo(0,-20);ctx.lineTo(11,-47);ctx.fillStyle='#a2cdac';ctx.fill();line(ctx,[[0,-22],[0,-4]],'#c9dbd1',1.5);round(ctx,9,-21,10,10,2,'#e7f2e8');text(ctx,'+',14,-17,9,'#d68265');line(ctx,[[-12,-42],[-14,-28],[-8,-22],[3,-24],[8,-35]],'#486f70',3);ellipse(ctx,8,-35,4,4,'#92b3b3');}
 ellipse(ctx,0,-57,25,27,hair);if(style==='pigtails'){ellipse(ctx,-28,-55,12,19,hair);ellipse(ctx,28,-55,12,19,hair);round(ctx,-33,-59,10,5,2,'#e4b653');round(ctx,23,-59,10,5,2,'#e4b653');}
 ellipse(ctx,-24,-52,5,8,skin);ellipse(ctx,24,-52,5,8,skin);round(ctx,-23,-75,46,45,19,skin);
 if(face==='up'){ellipse(ctx,0,-58,25,26,hair);round(ctx,-20,-54,40,19,8,hair);}else{
 ctx.beginPath();ctx.moveTo(-23,-61);ctx.bezierCurveTo(-28,-94,22,-93,25,-64);ctx.lineTo(15,-72);ctx.lineTo(7,-68);ctx.lineTo(0,-74);ctx.lineTo(-11,-63);ctx.closePath();ctx.fillStyle=hair;ctx.fill();
 if(style==='curly')for(let j=-2;j<=2;j++)ellipse(ctx,j*9,-77-Math.abs(j)%2*3,8,9,hair);
 const shift=face==='left'?-4:face==='right'?4:0;
 if(happy){line(ctx,[[-13+shift,-52],[-9+shift,-55],[-5+shift,-52]],'#40423d',2.2);line(ctx,[[6+shift,-52],[10+shift,-55],[14+shift,-52]],'#40423d',2.2);}else{ellipse(ctx,-9+shift,-53,2.6,3.5,'#374a43');ellipse(ctx,10+shift,-53,2.6,3.5,'#374a43');}
 ellipse(ctx,-16+shift,-44,5,3,'#e69b84');ellipse(ctx,17+shift,-44,5,3,'#e69b84');ctx.beginPath();ctx.arc(shift,-44,7,0,Math.PI);ctx.strokeStyle='#a36150';ctx.lineWidth=2;ctx.stroke();
 if(style==='grandpa'){round(ctx,-18,-60,16,14,5,null,'#738782');round(ctx,3,-60,16,14,5,null,'#738782');line(ctx,[[-2,-55],[3,-55]],'#738782',2);}
 }
 if(nurse){round(ctx,-22,-83,44,16,6,'#fffef6');text(ctx,'+',0,-75,16,'#da8e85');}
 if(carrying){round(ctx,20,-24,19,22,5,'#f2d588','#cdac56');text(ctx,'✚',29,-13,12,'#fff');}
 ctx.restore();
}
function plant(ctx,x,y,size=1){ctx.save();ctx.translate(x,y);ctx.scale(size,size);ellipse(ctx,0,6,18,6,'#39563b14');round(ctx,-15,-10,30,23,5,'#d2ac7a');round(ctx,-18,-12,36,7,3,'#e3c397');line(ctx,[[0,-10],[0,-40]],'#6b9661',4);for(const [dx,dy]of [[-12,-30],[11,-44],[-8,-52],[14,-24]]){ctx.save();ctx.translate(dx,dy);ctx.rotate(dx>0?.6:-.6);ellipse(ctx,0,0,9,16,dx>0?'#7da571':'#91b67f');ctx.restore();}ctx.restore();}
function room(ctx,x,y,w,h,fill,name,icon,sub){round(ctx,x,y,w,h,16,fill);ctx.save();ctx.globalAlpha=.18;for(let i=x+25;i<x+w;i+=45)line(ctx,[[i,y+8],[i,y+h-8]],'#a9bbae',.7);for(let j=y+25;j<y+h;j+=45)line(ctx,[[x+8,j],[x+w-8,j]],'#a9bbae',.7);ctx.restore();round(ctx,x+18,y+15,Math.min(w-36,name.length*9+78),36,12,'#fffdf8e8');text(ctx,icon+'  '+name,x+34,y+34,15,C.ink,'left');if(sub)text(ctx,sub,x+w-25,y+35,11,'#8aa092','right');}
function bed(ctx,x,y,num){round(ctx,x-62,y-62,124,125,17,'#66786b14');round(ctx,x-58,y-72,116,126,13,'#fffdf7','#c2d8d3');round(ctx,x-49,y-59,98,96,10,'#deebe3');round(ctx,x-39,y-51,78,30,8,'#fffef8');round(ctx,x-50,y-1,100,43,10,'#83b9b2');line(ctx,[[x-43,y+7],[x+43,y+7]],'#a4d0c4',4);round(ctx,x-63,y+45,126,16,6,'#c1d6ce');round(ctx,x-58,y+57,10,12,3,'#8ba79c');round(ctx,x+48,y+57,10,12,3,'#8ba79c');round(ctx,x-14,y+49,28,17,5,'#fffef6');text(ctx,String(num),x,y+57,10,'#72948c');}
export function wheelchair(ctx,x,y,p,time=0){ellipse(ctx,x,y+9,37,10,'#254f3f1a');round(ctx,x-22,y-45,44,46,9,'#97b2cb','#698a9d');line(ctx,[[x-28,y-27],[x-30,y+3],[x+30,y+3],[x+29,y-28]],'#769399',5);ellipse(ctx,x-28,y+2,10,16,'#69818a');ellipse(ctx,x+28,y+2,10,16,'#69818a');ellipse(ctx,x-28,y+2,5,9,'#cfddd7');ellipse(ctx,x+28,y+2,5,9,'#cfddd7');if(p)person(ctx,x,y-2,{...p,scale:.65,time});}
export function drawHospital(ctx,game,time,view){
 ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.save();ctx.translate(-view.x,0);round(ctx,0,0,1200,760,0,'#eff2df');
 room(ctx,20,80,790,335,'#e3efe9','PATIENT ROOM','♡','');room(ctx,830,80,350,335,'#e7efd8','SUPPLIES','✚');
 room(ctx,20,545,345,195,'#f1e9d5','WELCOME','☀');room(ctx,380,545,430,195,'#f3e5d2','PROCEDURE','✧');room(ctx,830,545,350,195,'#f3efd5','RECOVERY','☾');
 round(ctx,22,428,1156,107,16,'#e3e8d5');line(ctx,[[62,480],[1132,480]],'#d0dcc5',2);for(let x=72;x<1150;x+=38)ellipse(ctx,x,480,2,2,'#c2d1b8');
 // Low walls and wide, accessible doorways.
 for(const [x,w]of [[20,310],[440,370],[830,40],[1090,90]]){round(ctx,x,407,w,17,5,'#c1d5c6');round(ctx,x,402,w,12,4,'#faffef');}
 for(const [x,w]of [[20,160],[285,185],[710,160],[1090,90]]){round(ctx,x,534,w,18,4,'#cbd6bd');round(ctx,x,529,w,10,4,'#fcfff2');}
 round(ctx,810,90,16,327,4,'#cadcc8');round(ctx,365,550,15,190,4,'#cfdbc0');round(ctx,810,550,15,190,4,'#cfdbc0');
 for(let i=0;i<4;i++){bed(ctx,BEDS[i].x,BEDS[i].y,i+1);round(ctx,BEDS[i].x-38,150,76,34,8,'#f8fcf3','#c9ded0');text(ctx,'♡  CARE',BEDS[i].x,168,10,'#80a68e');}
 // Sunny windows and children’s art.
 for(const x of [326,580]){round(ctx,x,88,124,45,9,'#bad9d1','#fcfff4');round(ctx,x+5,92,114,36,6,'#daece3');line(ctx,[[x+62,90],[x+62,130]],'#fbfff4',4);ellipse(ctx,x+94,106,9,9,'#f2d482');}
 plant(ctx,772,174,.82);round(ctx,757,302,55,48,8,'#bdd8ce');round(ctx,761,304,47,27,8,'#fffef5');ellipse(ctx,784,318,15,8,'#d4e7df');line(ctx,[[781,308],[781,297],[791,297]],'#749f99',4);
 round(ctx,882,181,253,123,11,'#aac19d');round(ctx,882,175,253,120,11,'#f9f9e8','#b8c9a8');line(ctx,[[885,234],[1132,234]],'#cbd6b4',5);line(ctx,[[965,179],[965,291]],'#d4dcbd',3);line(ctx,[[1050,179],[1050,291]],'#d4dcbd',3);
 const icons=['☀️','🌼','☁️','🧴','🩹','🧊'];icons.forEach((ic,i)=>{const x=924+(i%3)*83,y=i<3?213:270;round(ctx,x-18,y-21,36,37,7,['#f7d186','#c9dda7','#b8dbea','#d6c6e7','#ebc7ad','#bee5e6'][i]);text(ctx,ic,x,y,21);});
 round(ctx,920,333,186,32,10,'#fffcf0');text(ctx,'Tap to choose supplies',1013,350,11,'#85a077');plant(ctx,1153,379,.77);
 // Reception: books, fish, plant and friendly nurse.
 round(ctx,48,597,92,47,9,'#9ac7bc','#78aba0');round(ctx,53,601,82,34,6,'#cce7da');text(ctx,'🐠',82,618,24);text(ctx,'🐟',113,613,16);round(ctx,82,633,160,57,15,'#d8b98c');round(ctx,77,630,170,18,7,'#f5e0b8');round(ctx,169,610,45,24,5,'#79988c');round(ctx,173,613,37,15,3,'#d4e5d5');text(ctx,'HELLO!',166,669,12,'#8c7956');plant(ctx,48,700,.9);person(ctx,293,647,{nurse:true,hair:'#544d41',skin:'#e8b68b',time});text(ctx,'Nurse Lily',295,699,11,'#869978');
 // Procedure and recovery furniture.
 round(ctx,483,593,206,99,18,'#dec6a4');round(ctx,490,588,192,91,15,'#fffaf0');round(ctx,503,600,47,62,12,'#f0ddc2');round(ctx,557,600,113,63,11,'#eac4a1');round(ctx,734,605,49,40,8,'#fff9e5','#d9c49d');text(ctx,'✚',758,625,22,'#cfa984');
 round(ctx,905,591,190,104,18,'#e1dcb7');round(ctx,913,587,174,98,16,'#fffef2');round(ctx,924,598,48,65,12,'#f5eacc');round(ctx,980,598,97,73,11,'#c9d8a2');text(ctx,'★',1029,633,34,'#e6ecbc');plant(ctx,1140,702,.8);
 if(game){
 if(game.path.length&&!game.settings.reduced){ctx.save();ctx.setLineDash([3,14]);line(ctx,[[game.doctor.x,game.doctor.y],...game.path.map(p=>[p.x,p.y])],'#8da98d',3);ctx.restore();}
 for(const p of game.patients){if(p.state==='discharged'){const at=game.position(p);if(time-(p.celebrated||0)<2){person(ctx,at.x,at.y+15,{...p,time,happy:true});text(ctx,'All better! ♡',at.x,at.y-87,14,'#44876b');}continue;}if(game.wheelchair===p.id)continue;const at=game.position(p);person(ctx,at.x,at.y+1,{...p,time,scale:.78,happy:p.reassured});
 round(ctx,at.x-65,at.y-120,130,40,13,'#fffef8','#d6e3d2');const bubble=p.exam<CONDITIONS[p.condition].exam.length?CONDITIONS[p.condition].symptom:p.step>=CONDITIONS[p.condition].steps.length?'♡':game.next(p).game==='transport'?'🦽':game.next(p).item?{fever:'☀️',allergy:'🌼',cough:'☁️',antiseptic:'🧴',gauze:'🩹',ice:'🧊'}[game.next(p).item]:'✚';text(ctx,bubble,at.x-41,at.y-100,22);text(ctx,p.name,at.x+11,at.y-100,12);text(ctx,'♥'.repeat(Math.ceil(p.happiness))+'♡'.repeat(3-Math.ceil(p.happiness)),at.x,at.y+79,14,'#d99887');
 }
 const d=game.doctor;if(game.wheelchair!==null||game.emptyChair){person(ctx,d.x,d.y-23,{doctor:true,time,moving:d.moving,face:d.face});wheelchair(ctx,d.x,d.y+30,game.patients.find(p=>p.id===game.wheelchair),time);}else{wheelchair(ctx,game.chairPosition?.x||480,game.chairPosition?.y||481);person(ctx,d.x,d.y,{doctor:true,time,moving:d.moving,face:d.face,carrying:game.inventory.length>0,happy:d.pose==='celebrate'});}
 round(ctx,d.x-42,d.y+22,84,23,9,'#fffef6e8');text(ctx,'Dr. Ayden',d.x,d.y+34,11,'#57917b');
 }else{wheelchair(ctx,480,481);person(ctx,380,487,{doctor:true,time});person(ctx,125,282,{...{skin:'#f2bc91',hair:'#654139',shirt:'#ee8987',style:'pigtails'},time,scale:.8});}
 text(ctx,'✦',1138,46,24,'#d6b967');text(ctx,'KINDNESS CLINIC',135,44,16,'#7d9880');text(ctx,'A happy little place to feel better',350,44,11,'#93a78d');ctx.restore();
}
export function hero(canvas,time=0){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,550,520);ellipse(ctx,280,273,216,213,'#e5edcf');ellipse(ctx,280,290,178,176,'#edf3de');
 for(const [x,y,s]of [[87,98,27],[460,155,18],[438,377,24],[124,368,16]])text(ctx,'✧',x,y,s,'#dfbc66');
 round(ctx,119,159,303,217,28,'#c4d5b3');round(ctx,113,143,315,219,26,'#fffdf0','#d8e3c8');round(ctx,134,165,273,51,13,'#d5e7cf');text(ctx,'KINDNESS CLINIC',270,191,16,'#6c9171');round(ctx,140,232,72,89,12,'#dbeade');round(ctx,328,232,72,89,12,'#dbeade');line(ctx,[[176,232],[176,321]],'#f8fcf0',4);line(ctx,[[364,232],[364,321]],'#f8fcf0',4);round(ctx,233,244,72,112,13,'#a2cbb6');text(ctx,'✚',269,275,30,'#fffdf0');plant(ctx,117,381,1.1);plant(ctx,425,381,1.2);
 person(ctx,276,404,{doctor:true,scale:2.35,time,happy:true});person(ctx,153,409,{skin:'#f2bc91',hair:'#654139',shirt:'#ee8987',style:'pigtails',scale:.9,time,happy:true});person(ctx,398,409,{skin:'#ae7655',hair:'#3b302e',shirt:'#e9b953',style:'curly',scale:1,time,happy:true});text(ctx,'♥',191,315,30,'#df9b80');text(ctx,'♥',373,291,22,'#df9b80');}
