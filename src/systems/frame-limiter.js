// Gates the existing RAF loop; no extra timer or catch-up simulation.
export class FrameLimiter{
 reset(){this.next=undefined;}
 accept(now,fps){if(!fps)return true;const interval=1000/fps;if(this.next!==undefined&&now+.2<this.next)return false;this.next=this.next===undefined||now-this.next>interval?now+interval:this.next+interval;return true;}
}
