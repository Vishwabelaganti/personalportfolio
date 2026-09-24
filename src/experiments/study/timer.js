export class FocusTimer {
  constructor(minutes=25) { this.reset(minutes); }
  reset(minutes=this.minutes) { this.minutes=minutes;this.remaining=minutes*60*1000;this.running=false;this.deadline=null; }
  start(now=Date.now()) { if(!this.running&&this.remaining>0){this.deadline=now+this.remaining;this.running=true;} }
  pause(now=Date.now()) { if(this.running){this.remaining=Math.max(0,this.deadline-now);this.running=false;} }
  tick(now=Date.now()) { if(this.running){this.remaining=Math.max(0,this.deadline-now);if(!this.remaining){this.running=false;return true;}}return false; }
  get label(){const seconds=Math.ceil(this.remaining/1000);return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
}
