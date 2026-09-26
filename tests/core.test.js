import test from 'node:test';
import assert from 'node:assert/strict';
import {GameModel,findPath,walkable} from '../core.js';
import {LEVELS,DEFAULT_SETTINGS,CONDITIONS,STATIONS,BEDS,readSave} from '../data.js';

test('Every clinic route is reachable, with no paths through furniture or walls',()=>{
 const stops=[...BEDS.map(b=>({x:b.x,y:365})),...STATIONS.map(s=>({x:s.tx,y:s.ty})),{x:738,y:710},{x:880,y:710}];
 for(const a of stops)for(const b of stops){const path=findPath(a,b);assert.ok(path.length,`No route: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);assert.ok(path.every(p=>walkable(p.x,p.y)));assert.ok(Math.hypot(path.at(-1).x-b.x,path.at(-1).y-b.y)<50);}
});
test('All six levels complete through their real data-driven care sequences',()=>{
 for(let index=0;index<LEVELS.length;index++){const g=new GameModel(index,{...DEFAULT_SETTINGS});let guard=0;while(!g.finished&&guard++<150){g.update(15);for(const p of g.patients.filter(p=>p.state!=='discharged')){const n=g.next(p);assert.ok(n.game);if(n.item)assert.ok(g.take(n.item));assert.equal(g.complete(p),true);}}assert.ok(g.finished,`Day ${index} did not finish`);assert.equal(g.helped,LEVELS[index].schedule.length);assert.equal(g.inventory.length,0);assert.ok(g.report().stars>=1&&g.report().stars<=3);}
});
test('Missing supplies never advance treatment, full bags cannot overflow',()=>{
 const g=new GameModel(0,{...DEFAULT_SETTINGS,capacity:1}),p=g.patients[0];g.complete(p);assert.equal(g.next(p).item,'fever');assert.equal(g.complete(p),false);assert.equal(p.step,0);assert.equal(g.take('allergy'),true);assert.equal(g.take('fever'),false);assert.equal(g.complete(p),false);assert.deepEqual(g.inventory,['allergy']);g.wrong(p);assert.equal(p.step,0);assert.equal(g.errors,1);
});
test('Checkups hide required supplies until diagnosis',()=>{
 const g=new GameModel(2,{...DEFAULT_SETTINGS}),p=g.patients[0];assert.deepEqual(g.needs(p),[]);g.complete(p);assert.deepEqual(g.needs(p),[]);g.complete(p);assert.deepEqual(g.needs(p),['allergy']);
});
test('Patient queue respects bed capacity and reuses discharged beds',()=>{
 const g=new GameModel(5,{...DEFAULT_SETTINGS});g.level={...g.level,capacity:1};g.update(500);assert.equal(g.patients.length,1);const p=g.patients[0];g.discharge(p);assert.equal(g.patients.length,2);assert.equal(g.patients[1].bed,0);assert.equal(new Set(g.patients.filter(p=>p.state!=='discharged').map(p=>p.bed)).size,1);
});
test('No-rush mode preserves happiness; challenge mode never goes below one heart',()=>{
 const g=new GameModel(0,{...DEFAULT_SETTINGS});g.update(10000);assert.equal(g.patients[0].happiness,3);g.settings.patience=true;g.update(10000);assert.equal(g.patients[0].happiness,1);g.reassure(g.patients[0]);assert.equal(g.patients[0].happiness,2);assert.equal(g.reassure(g.patients[0]),false);
});
test('Bad stored JSON safely starts fresh',()=>{assert.equal(readSave({getItem:()=>'{broken'}).unlocked,1);assert.equal(readSave({getItem:()=>null}).settings.voice,.95);});
test('Arm care includes transport, pretend scan, patch, bandage and recovery',()=>{assert.deepEqual(CONDITIONS.arm.steps.map(s=>s.game),['transport','align','patch','bandage','recovery','rest']);});
