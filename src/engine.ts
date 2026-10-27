/** First vertical slice. See README for intentionally simplified mechanics. */
export type Resource = 'food' | 'money' | 'medicine' | 'intel' | 'weapon';
export type Phase = 'placement' | 'action' | 'ended';
export type LocationId = 'north'|'poor'|'market'|'bridge'|'street'|'radioA'|'radioB'|'grocer'|'fence'|'doctor'|'cafe'|'fieldA'|'fieldB'|'roomA'|'roomB'|'roomC'|'missionA'|'missionB'|'safeHouse';
export interface Location { id:LocationId; name:string; x:number; y:number; detail:string; resource?:Resource; }
export const LOCATIONS:Location[] = [
  {id:'north',name:'Pont du Nord',x:59.0,y:13.6,detail:'North bridge'},
  {id:'poor',name:'Poor District',x:51.1,y:35.9,detail:'Gain food',resource:'food'},
  {id:'market',name:'Black Market',x:71.3,y:35.5,detail:'Trade 1 money for a weapon'},
  {id:'bridge',name:'Pont Leveque',x:51.3,y:62.9,detail:'Bridge'},
  {id:'street',name:'Rue Baradat',x:15.7,y:27.2,detail:'Crossroads'},
  {id:'radioA',name:'Radio A',x:15.4,y:51.0,detail:'Gain intel',resource:'intel'},
  {id:'grocer',name:'Grocer',x:72.3,y:63.3,detail:'Gain food',resource:'food'},
  {id:'fence',name:'Fence',x:35.0,y:13.6,detail:'Trade 1 food for 1 money'},
  {id:'doctor',name:'Doctor',x:34.4,y:36.1,detail:'Gain medicine',resource:'medicine'},
  {id:'fieldA',name:'Field A',x:17.1,y:86.7,detail:'Field (placeholder)'},
  {id:'cafe',name:'Café',x:38.6,y:86.3,detail:'Recruit a resistance worker (spend 1 food)'},
  {id:'roomA',name:'Spare Room A',x:31.7,y:64.3,detail:'Restore morale (spend 1 medicine)'},
  {id:'radioB',name:'Radio B',x:86.0,y:14.4,detail:'Gain intel',resource:'intel'},
  {id:'fieldB',name:'Field B',x:76.5,y:86.4,detail:'Field (placeholder)'},
  {id:'roomB',name:'Spare Room B',x:87.4,y:65.2,detail:'Placeholder location'},
  {id:'roomC',name:'Spare Room C',x:89.3,y:40.9,detail:'Placeholder location'},
  {id:'missionA',name:'Mission A',x:9,y:11,detail:'Spend 2 food and 1 medicine to complete Supply Run'},
  {id:'missionB',name:'Mission B',x:91,y:11,detail:'Spend 2 intel and 1 money to complete Radio Network'},
  {id:'safeHouse',name:'Safe House',x:58.0,y:86.4,detail:'Safe House — prototype escape destination'}
];
// Prototype connectivity: intentionally not yet a verified transcription of the printed road graph.
export const EDGES: [LocationId,LocationId][] = [
  ['street','fence'],['street','doctor'],['street','radioA'],
  ['fence','north'],['fence','poor'],['north','poor'],['north','market'],['north','radioB'],
  ['doctor','radioA'],['doctor','poor'],['doctor','roomA'],['doctor','bridge'],
  ['poor','market'],['poor','bridge'],['market','radioB'],['market','roomC'],['market','grocer'],
  ['radioA','roomA'],['roomA','bridge'],['bridge','grocer'],['bridge','safeHouse'],
  ['grocer','roomB'],['grocer','safeHouse'],['roomC','radioB'],['roomB','fieldB'],
  ['fieldA','cafe'],['cafe','safeHouse'],['safeHouse','fieldB'],
  // Tutorial-only mission targets are not printed physical locations.
  ['missionA','fence'],['missionB','north']
];
// Transcribed location priorities from the 2021 rulebook patrol summary, page 10.
export const PATROL_CARDS:LocationId[][] = [
  ['bridge','market','doctor'],['radioA','street','grocer'],['grocer','north','fence'],
  ['fence','north','bridge'],['bridge','north','doctor'],['fence','street','poor'],
  ['radioB','street','bridge'],['radioA','bridge','market'],['grocer','poor','doctor'],['radioB','grocer','market']
];
export interface State {
 day:number; morale:number; soldiers:number; totalWorkers:number; phase:Phase; outcome:string|null;
 workers:LocationId[]; patrols:{at:LocationId;kind:'milice'|'soldier'}[];
 resources:Record<Resource,number>; missions:[boolean,boolean];
 deck:number[]; discard:number[]; patrolTarget:number; patrolDone:number; shotToday:boolean;
 log:string[];
}
const shuffle=(a:number[],rng:()=>number)=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
export function newGame(rng:()=>number=Math.random):State {return {day:1,morale:6,soldiers:0,totalWorkers:3,phase:'placement',outcome:null,workers:[],patrols:[],resources:{food:0,money:0,medicine:0,intel:0,weapon:0},missions:[false,false],deck:shuffle([...PATROL_CARDS.keys()],rng),discard:[],patrolTarget:3,patrolDone:0,shotToday:false,log:['Day 1. Place your first worker.']};}
export const minPatrols=(morale:number)=>morale>=7?2:morale>=5?3:morale>=2?4:5;
export function blocked(s:State,id:LocationId){return s.workers.includes(id)||s.patrols.some(p=>p.at===id);}
export function hasEscape(s:State,from:LocationId){
  // The printed Safe House is represented explicitly on the board.
  const visited=new Set<LocationId>([from]);const queue=[from];
  while(queue.length){const current=queue.shift()!;if(current==='safeHouse')return true;
    for(const [a,b] of EDGES){const n=a===current?b:b===current?a:null;if(n&&!visited.has(n)&&!s.patrols.some(p=>p.at===n)){visited.add(n);queue.push(n);}}
  }return false;
}
export function checkEnd(s:State){
  if(s.missions.every(Boolean)){s.outcome='Victory! Both prototype missions completed.';s.phase='ended';}
  else if(s.morale<=0||s.totalWorkers<=0){s.outcome='Defeat — resistance collapsed.';s.phase='ended';}
  else if(s.day>15){s.outcome=s.missions.some(Boolean)?'Draw — one prototype mission completed.':'Defeat — time ran out.';s.phase='ended';}
}
function note(s:State,msg:string){s.log=[msg,...s.log].slice(0,70);}
function draw(s:State,rng:()=>number){if(!s.deck.length){s.deck=shuffle(s.discard,rng);s.discard=[];}const id=s.deck.shift();if(id===undefined)throw Error('Patrol deck exhausted');s.discard.push(id);return PATROL_CARDS[id];}
export function placePatrol(s:State,rng:()=>number=Math.random){
  if(s.patrolDone>=s.patrolTarget)return;
  const card=draw(s,rng);const kind:State['patrols'][number]['kind'] = s.patrolDone>=s.patrolTarget-Math.min(s.soldiers,s.patrolTarget)?'soldier':'milice';
  let at=card.find(id=>!blocked(s,id));
  if(!at){at=card.find(id=>s.workers.includes(id));if(at){s.workers=s.workers.filter(w=>w!==at);s.totalWorkers--;note(s,`A ${kind} arrested a worker at ${nameOf(at)}.`);}}
  if(at){s.patrols.push({at,kind});note(s,`${kind==='soldier'?'Soldier':'Milice'} patrol: ${nameOf(at)} (${card.map(nameOf).join(' → ')}).`);}else note(s,`Patrol skipped: all card spaces occupied by patrols.`);
  s.patrolDone++;checkEnd(s);
}
export function nameOf(id:LocationId){return LOCATIONS.find(l=>l.id===id)?.name??id;}
export function placeWorker(s:State,id:LocationId,rng:()=>number=Math.random){
 if(s.phase!=='placement')return false;
 if(blocked(s,id)||id==='fieldA'||id==='fieldB'||id==='roomB'||id==='roomC'||id==='safeHouse'||id==='cafe'&&s.totalWorkers>=5)return false;
 if(s.workers.length>=s.totalWorkers)return false;
 s.workers.push(id);note(s,`Worker placed at ${nameOf(id)}.`);
 if(s.patrolDone<s.patrolTarget)placePatrol(s,rng);
 while(s.workers.length>=s.totalWorkers&&s.patrolDone<s.patrolTarget&&s.phase==='placement')placePatrol(s,rng);
 if(s.phase==='placement'&&s.workers.length>=s.totalWorkers&&s.patrolDone>=s.patrolTarget){s.phase='action';note(s,'Action phase. Choose a worker to activate.');}
 return true;
}
export function activate(s:State,id:LocationId,action:'perform'|'skip'='perform'){
 if(s.phase!=='action'||!s.workers.includes(id))return false;
 const loc=LOCATIONS.find(l=>l.id===id)!;
 const escape=hasEscape(s,id);
 // Rewards carried from unshielded spaces are lost if no escape route exists.
 if(action==='perform'&&escape){
   const r=s.resources;
   if(loc.resource){if(r[loc.resource]<4){r[loc.resource]++;note(s,`Collected ${loc.resource} at ${loc.name}.`);}else note(s,`${loc.name}: supply limit reached (4).`);}
   else if(id==='market'&&r.money>=1&&r.weapon<4){r.money--;r.weapon++;note(s,'Black Market: exchanged money for a weapon.');}
   else if(id==='fence'&&r.food>=1&&r.money<4){r.food--;r.money++;note(s,'Fence: exchanged food for money.');}
   else if(id==='cafe'&&r.food>=1&&s.totalWorkers<5){r.food--;s.totalWorkers++;note(s,'Café: recruited another worker for tomorrow.');}
   else if(id==='roomA'&&r.medicine>=1&&s.morale<7){r.medicine--;s.morale++;note(s,'Spare room: morale restored.');}
   else if(id==='missionA'&&!s.missions[0]&&r.food>=2&&r.medicine>=1){r.food-=2;r.medicine--;s.missions[0]=true;note(s,'Prototype mission completed: Supply Run.');}
   else if(id==='missionB'&&!s.missions[1]&&r.intel>=2&&r.money>=1){r.intel-=2;r.money--;s.missions[1]=true;note(s,'Prototype mission completed: Radio Network.');}
   else note(s,`No available action at ${loc.name} (or required resources missing).`);
 }else if(!escape){s.totalWorkers--;note(s,`Worker arrested at ${loc.name}: no clear route to the Safe House.`);}
 else note(s,`Skipped action at ${loc.name}.`);
 s.workers=s.workers.filter(w=>w!==id);checkEnd(s);
 if(s.phase==='action'&&s.workers.length===0)advanceDay(s);
 return true;
}
export function shoot(s:State,id:LocationId){
 if(s.phase!=='action'||s.shotToday||s.resources.weapon<1)return false;
 const idx=s.patrols.findIndex(p=>p.at===id&&p.kind==='milice');if(idx<0)return false;
 s.patrols.splice(idx,1);s.resources.weapon--;s.soldiers=Math.min(5,s.soldiers+1);s.morale--;s.shotToday=true;
 note(s,`Shot Milice at ${nameOf(id)}. Soldiers +1, morale −1.`);checkEnd(s);return true;
}
export function advanceDay(s:State){
 if(s.phase==='ended')return;
 s.day++;s.patrols=[];s.workers=[];s.shotToday=false;
 // Orange day-space transcription to be verified against published board.
 if([4,7,10,13].includes(s.day)){s.morale--;note(s,`Day ${s.day}: morale −1 (prototype calendar).`);}
 checkEnd(s);if(s.outcome !== null)return;
 s.phase='placement';s.patrolDone=0;s.patrolTarget=Math.max(s.totalWorkers,minPatrols(s.morale));
 note(s,`Day ${s.day} begins. ${s.patrolTarget} patrols expected.`);
}
