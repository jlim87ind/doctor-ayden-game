// Recorded MP3s only: Microsoft speech, acoustic music and Kenney foley.
export class AudioManager {
 constructor(settings){this.settings=settings;this.started=false;this.track=null;this.trackName='';this.voice=null;this.effects=new Set();this.suspended=false;this.phrases=0;}
 unlock(){this.started=true;if(!this.track)this.music('menu');else if(!this.suspended)this.track.play().catch(()=>{});}
 level(){return this.settings.muted?0:1;}
 music(name){if(!this.started)return;if(this.trackName===name&&this.track){this.apply();if(!this.suspended)this.track.play().catch(()=>{});return;}this.track?.pause();this.trackName=name;this.track=new Audio(`assets/audio/music-${name}.mp3`);this.track.loop=true;this.apply();if(!this.suspended)this.track.play().catch(()=>{});}
 apply(){if(this.track)this.track.volume=this.level()*this.settings.music*(this.voice&&!this.voice.paused?0.35:1);if(this.voice)this.voice.volume=this.level()*this.settings.voice;for(const a of this.effects)a.volume=this.level()*this.settings.sound*0.6;}
 say(name){if(!this.started||this.suspended||!this.level()||!this.settings.voice)return;this.voice?.pause();const a=new Audio(`assets/audio/${name}.mp3`);this.voice=a;a.volume=this.settings.voice;a.onplay=()=>this.apply();a.onended=()=>{if(this.voice===a)this.voice=null;this.apply();};a.onerror=a.onended;a.play().catch(a.onended);}
 praise(){this.say(['good-job','amazing','great-care','superstar','well-done'][this.phrases++%5]);}
 fx(name,volume=0.6){if(!this.started||this.suspended||!this.level()||!this.settings.sound)return;const a=new Audio(`assets/audio/${name}.mp3`);a.volume=this.settings.sound*volume;this.effects.add(a);const done=()=>this.effects.delete(a);a.onended=done;a.onerror=done;a.play().catch(done);}
 suspend(){this.suspended=true;this.track?.pause();this.voice?.pause();for(const a of this.effects)a.pause();this.effects.clear();}
 resume(){this.suspended=false;this.apply();if(this.started)this.track?.play().catch(()=>{});}
 stopVoice(){this.voice?.pause();this.voice=null;this.apply();}
}
