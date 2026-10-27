import {describe,it,expect} from 'vitest';
import {newGame,placeWorker,activate,placePatrol,shoot,hasEscape,minPatrols,PATROL_CARDS} from './engine';
describe('Maquis prototype engine',()=>{
 it('starts with three workers and 15-day campaign',()=>{const s=newGame(()=>0.5);expect(s.totalWorkers).toBe(3);expect(s.day).toBe(1);expect(s.morale).toBe(6);});
 it('has ten three-location patrol cards',()=>{expect(PATROL_CARDS).toHaveLength(10);expect(PATROL_CARDS.every(c=>c.length===3)).toBe(true);});
 it('alternates worker placements and patrols',()=>{const s=newGame(()=>0.7);placeWorker(s,'cafe',()=>0.1);expect(s.workers).toContain('cafe');expect(s.patrolDone).toBe(1);});
 it('switches to the action phase once all placements finish',()=>{const s=newGame(()=>0.5);s.patrolTarget=0;for(const loc of ['cafe','roomA','radioA'] as const){placeWorker(s,loc,()=>0.5);}expect(s.phase).toBe('action');});
 it('collects food when a worker has a safe route',()=>{const s=newGame(()=>0.5);s.phase='action';s.workers=['grocer'];activate(s,'grocer');expect(s.resources.food).toBe(1);});
 it('rejects shooting without a weapon',()=>{const s=newGame();s.phase='action';s.patrols=[{at:'bridge',kind:'milice'}];expect(shoot(s,'bridge')).toBe(false);});
 it('checks escape obstruction',()=>{const s=newGame();expect(hasEscape(s,'cafe')).toBe(true);expect(hasEscape(s,'grocer')).toBe(true);});
 it('increases minimum patrols when morale drops',()=>{expect(minPatrols(7)).toBe(2);expect(minPatrols(3)).toBe(4);expect(minPatrols(1)).toBe(5);});
 it('does not over-place patrols',()=>{const s=newGame(()=>0.5);s.patrolTarget=1;placePatrol(s,()=>0.5);placePatrol(s,()=>0.5);expect(s.patrolDone).toBe(1);});
});
