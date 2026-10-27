import './style.css';
import {newGame,placeWorker,activate,shoot,LOCATIONS,EDGES,nameOf,type State,type LocationId} from './engine';
const KEY='maquis-html5-prototype-v1';
function load():State {try{const saved=JSON.parse(localStorage.getItem(KEY)||'null') as State|null;if(saved&&saved.resources&&Array.isArray(saved.workers)&&saved.missions?.length===2)return saved;}catch{}return newGame();}
let game=load();let selection:LocationId|null=null;
const MISSION_ART = [
  ['aid-the-spy','Aid the Spy'],['assassination','Assassination'],
  ['destroy-the-train','Destroy the Train'],['liberate-the-town','Liberate the Town'],
  ['sabotage','Sabotage'],['underground-newspaper','Underground Newspaper']
] as const;
const artKey='maquis-mission-art-v1';
let missionArt:[string,string]=(()=>{try{const v=JSON.parse(localStorage.getItem(artKey)||'null');if(Array.isArray(v)&&v.length===2&&v.every((x:unknown)=>MISSION_ART.some(a=>a[0]===x)))return [v[0] as string,v[1] as string];}catch{}return ['aid-the-spy','sabotage'];})();

const app=document.getElementById('app')!;
const escapeHtml=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function save(){localStorage.setItem(KEY,JSON.stringify(game));}
function render(){
 const phase=game.phase==='ended'?'Finished':game.phase==='placement'?'Place your workers':'Activate workers';
 
 const positions=LOCATIONS.filter(loc=>!loc.id.startsWith('mission')&&loc.id!=='safeHouse').map(loc=>{
   const worker=game.workers.includes(loc.id),patrol=game.patrols.find(p=>p.at===loc.id);
   const selected=selection===loc.id;
   return `<button type="button" class="node ${worker?'worker':''} ${patrol?patrol.kind:''} ${selected?'selected':''}" style="left:${loc.x}%;top:${loc.y}%;" data-id="${loc.id}" aria-label="${escapeHtml(loc.name)}${worker?', resistance worker':''}${patrol?', '+patrol.kind:''}"><span class="pawn">${worker?'R':patrol?patrol.kind==='milice'?'M':'S':''}</span><span class="node-name">${escapeHtml(loc.name)}</span></button>`;
 }).join('');
 const missionCards=([0,1] as const).map((i)=>{
   const id=i===0?'missionA':'missionB';
   const occupied=game.workers.includes(id);const selected=selection===id;
   const done=game.missions[i];
   const options=MISSION_ART.map(([value,label])=>`<option value="${value}" ${missionArt[i]===value?'selected':''}>${escapeHtml(label)}</option>`).join('');
   return `<div class="mission-slot slot-${i===0?'a':'b'}"><button type="button" data-id="${id}" class="mission-card mission-target ${occupied?'worker':''} ${selected?'selected':''} ${done?'complete':''}" aria-label="${id==='missionA'?'Mission A':'Mission B'} worker-placement card; ${occupied?'worker present':'unoccupied'}">
     <img src="${import.meta.env.BASE_URL}missions/${missionArt[i]}.webp" alt="Mission artwork from the uploaded 2014 print-and-play PDF"/>
     <span class="mission-card-tag">${i===0?'A · Supply Run':'B · Radio Network'} ${done?'✓':''}</span>
     ${occupied?'<span class="mission-worker">R</span>':''}
   </button><label class="art-select-label" for="mission-art-${i}">Card art <select id="mission-art-${i}" data-slot="${i}" class="mission-art-select">${options}</select></label></div>`;
 }).join('');
 const l=selection&&LOCATIONS.find(loc=>loc.id===selection);
 const patrolAtSelection=game.patrols.find(p=>p.at===selection);
 const inAction=game.phase==='action'&&selection&&game.workers.includes(selection);
 const canPlace=game.phase==='placement'&&selection&&!game.workers.includes(selection)&&!patrolAtSelection;
 app.innerHTML=`<header class="top"><div><div class="eyebrow">A DIGITAL TABLETOP PROTOTYPE · NOT OFFICIAL</div><h1>MAQUIS <span>HTML5</span></h1></div><div class="top-actions"><a href="https://gamers-hq.de/media/pdf/bf/b6/45/Maquis_2021_Rules_v1-1.pdf" target="_blank" rel="noreferrer">2021 rulebook ↗</a><button id="restart" class="subtle">New game</button></div></header>
 <main><section class="play"><div class="stats"><div><small>DAY</small><strong>${Math.min(game.day,15)} <span>/ 15</span></strong></div><div><small>MORALE</small><strong>${game.morale} <span>/ 7</span></strong></div><div><small>WORKERS</small><strong>${game.totalWorkers} <span>/ 5</span></strong></div><div><small>PATROLS</small><strong>${game.patrolDone} <span>/ ${game.patrolTarget}</span></strong></div><div><small>SOLDIERS</small><strong>${game.soldiers}</strong></div></div>
 <div class="board-frame"><div class="board-title"><span>THE TOWN <small>2021-inspired map · user-supplied artwork</small></span><span class="phase">${phase}</span></div><div class="mission-dock">${missionCards}</div><div class="board">${positions}</div></div>
 <div class="legend"><span><b class="dot resistance"></b>Resistance</span><span><b class="dot milice"></b>Milice</span><span><b class="dot soldier"></b>Soldier</span><span>Select a location on the printed board</span></div>
 </section><aside class="sidebar"><section class="panel"><h2>Orders</h2><p class="muted">${game.phase==='placement'?'Select an unoccupied location to place one worker. A patrol card is automatically drawn after each placement.':game.phase==='action'?'Select each resistance worker, then perform or skip the location action. Escape routes are checked on activation.':'This game has ended. Start a new one to play again.'}</p>${game.outcome?`<div class="notice"><strong>${escapeHtml(game.outcome)}</strong></div>`:''}
 <div class="selected"><div class="eyebrow">SELECTED LOCATION</div><h3>${l?escapeHtml(l.name):'Select a location'}</h3><p>${l?escapeHtml(l.detail):'Use the town map to plan your turn.'}</p></div>
 <div class="buttons"><button id="place" ${!canPlace?'disabled':''}>Place worker</button><button id="act" ${!inAction?'disabled':''}>Perform action + return</button><button id="skip" class="secondary" ${!inAction?'disabled':''}>Skip action + return</button><button id="shoot" class="danger" ${!(game.phase==='action'&&patrolAtSelection?.kind==='milice'&&game.resources.weapon>0&&!game.shotToday)?'disabled':''}>Shoot selected Milice (1 weapon)</button></div></section>
 <section class="panel"><h2>Supply</h2><div class="supplies">${Object.entries(game.resources).map(([k,v])=>`<div><span>${k}</span><strong>${v} / 4</strong></div>`).join('')}</div></section>
 <section class="panel"><h2>Prototype missions</h2><p class="muted tiny">Place workers directly on either card above the board. The selectable PDF images are artwork only; Supply Run and Radio Network are still tutorial rules.</p><div class="mission ${game.missions[0]?'done':''}"><div><strong>Supply Run</strong><span>${game.missions[0]?'COMPLETE':'PENDING'}</span></div><p>At Mission A: spend 2 Food + 1 Medicine</p></div><div class="mission ${game.missions[1]?'done':''}"><div><strong>Radio Network</strong><span>${game.missions[1]?'COMPLETE':'PENDING'}</span></div><p>At Mission B: spend 2 Intel + 1 Money</p></div><p class="muted tiny">These are tutorial objectives, not the published 2021 mission cards.</p></section>
 <section class="panel"><h2>Recent events</h2><ol class="log">${game.log.slice(0,9).map(v=>`<li>${escapeHtml(v)}</li>`).join('')}</ol></section></aside></main>
 <footer>Unofficial fan-made engineering prototype. User-supplied map artwork. Gameplay still contains prototype rules, tutorial missions, and location actions; consult README for a fidelity audit.</footer>`;
 document.querySelectorAll<HTMLButtonElement>('.node, .mission-target').forEach(b=>b.addEventListener('click',()=>{selection=b.dataset.id as LocationId;render();}));
 document.querySelectorAll<HTMLSelectElement>('.mission-art-select').forEach(el=>el.addEventListener('change',()=>{const i=Number(el.dataset.slot) as 0|1;missionArt[i]=el.value;localStorage.setItem(artKey,JSON.stringify(missionArt));render();}));
 document.getElementById('place')?.addEventListener('click',()=>{if(selection)placeWorker(game,selection);selection=null;save();render();});
 document.getElementById('act')?.addEventListener('click',()=>{if(selection)activate(game,selection);selection=null;save();render();});
 document.getElementById('skip')?.addEventListener('click',()=>{if(selection)activate(game,selection,'skip');selection=null;save();render();});
 document.getElementById('shoot')?.addEventListener('click',()=>{if(selection)shoot(game,selection);selection=null;save();render();});
 document.getElementById('restart')?.addEventListener('click',()=>{if(confirm('Start a fresh game? Your autosave will be replaced.')){game=newGame();selection=null;save();render();}});
}
render();
