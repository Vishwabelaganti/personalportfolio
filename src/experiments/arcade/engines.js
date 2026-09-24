export class SnakeGame {
  constructor(size=20, random=Math.random) { this.size=size; this.random=random; this.reset(); }
  reset() { this.snake=[{x:8,y:10},{x:7,y:10},{x:6,y:10}]; this.direction={x:1,y:0}; this.next=this.direction; this.score=0; this.over=false; this.queued=false; this.food=this.spawnFood(); }
  spawnFood() { const free=[]; for(let y=0;y<this.size;y++)for(let x=0;x<this.size;x++)if(!this.snake.some(s=>s.x===x&&s.y===y))free.push({x,y}); return free[Math.floor(this.random()*free.length)]??null; }
  turn(x,y) { if(this.queued||x===-this.direction.x&&y===-this.direction.y)return; this.next={x,y}; this.queued=true; }
  step() { if(this.over)return; this.direction=this.next; this.queued=false; const head={x:this.snake[0].x+this.direction.x,y:this.snake[0].y+this.direction.y}; const eating=head.x===this.food?.x&&head.y===this.food?.y; const body=eating?this.snake:this.snake.slice(0,-1); if(head.x<0||head.y<0||head.x>=this.size||head.y>=this.size||body.some(s=>s.x===head.x&&s.y===head.y)){this.over=true;return;} this.snake.unshift(head); if(eating){this.score+=10;this.food=this.spawnFood();if(!this.food)this.over=true;}else this.snake.pop(); }
}
export class NumberGame {
 constructor(target=Math.floor(Math.random()*100)+1){this.target=target;this.attempts=0;this.finished=false;}
 guess(value){if(this.finished)return 'Start a new round to play again.';if(!Number.isInteger(value)||value<1||value>100)return 'Choose a whole number from 1 to 100.';this.attempts++;if(value===this.target){this.finished=true;return `You found it in ${this.attempts} guesses!`;}if(this.attempts===10){this.finished=true;return `The number was ${this.target}. Try a new round.`;}return value<this.target?'A little higher.':'A little lower.';}
}
export class WordGame {
 constructor(word){this.word=word;this.guesses=new Set();this.maxMisses=6;}
 get misses(){return [...this.guesses].filter(l=>!this.word.includes(l)).length;}
 get won(){return [...this.word].every(l=>this.guesses.has(l));}
 get over(){return this.won||this.misses>=this.maxMisses;}
 guess(letter){if(!this.over&&/^[a-z]$/.test(letter))this.guesses.add(letter);}
}
