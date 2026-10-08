import { ANIMATION } from "../../config/animation.js";
import { prefersReducedMotion } from "../utils/dom.js";

/**
 * Single-source, right-side tyre smoke.
 * The smoke consists of cached 2D sprite textures, not a video or WebGL.
 * Edit timing and particle limits in config/animation.js.
 */
export function createTyreSmoke(wheelButton, wheelScene, smokeCanvas, getStartTime) {
  const smokeCtx = smokeCanvas.getContext("2d", { alpha: true });
  const smokeDelay = ANIMATION.smokeStartMs;

  function smokeHash(x,y,seed) {
    let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,1442695041))|0;
    h=Math.imul(h^(h>>>13),1274126177);
    return ((h^(h>>>16))>>>0)/4294967295;
  }
  function smokeNoise(x,y,seed) {
    const a=Math.floor(x), b=Math.floor(y);
    let fx=x-a,fy=y-b;
    fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
    const n0=smokeHash(a,b,seed)*(1-fx)+smokeHash(a+1,b,seed)*fx;
    const n1=smokeHash(a,b+1,seed)*(1-fx)+smokeHash(a+1,b+1,seed)*fx;
    return n0*(1-fy)+n1*fy;
  }
  function makeSmokeTexture(variant) {
    const sprite=document.createElement("canvas");
    sprite.width=sprite.height=72;
    const ctx=sprite.getContext("2d");
    const pixels=ctx.createImageData(72,72);
    const shades=[146,165,178,188];
    for(let y=0;y<72;y++)for(let x=0;x<72;x++){
      const nx=(x-35.5)/35.5,ny=(y-35.5)/35.5;
      const angle=Math.atan2(ny,nx);
      const rough=0.11*Math.sin(angle*5+variant*2.2)
        +0.09*Math.cos(angle*8+variant*3.6);
      const n1=smokeNoise(x/18+variant*2,y/17,variant+1);
      const n2=smokeNoise(x/7+variant*3,y/8,variant+7);
      const radius=Math.hypot(nx,ny)/(0.86+rough+(n1-.5)*.27);
      const body=Math.max(0,Math.min(1,(1.09-radius)*3.1));
      const haze=Math.max(0,Math.min(1,(1.12-radius)*2.0));
      const texture=Math.max(.15,Math.min(1,.30+n1*.56+n2*.42));
      const alpha=Math.round(Math.min(255,(body*.75+haze*.25)*(.63+texture*.4)*255));
      const rim=radius>.78 && radius<1.07 ? 23 : 0;
      const value=Math.max(95,Math.min(219,shades[variant]+rim+(n1-.5)*30+(n2-.5)*22));
      const i=(y*72+x)*4;
      pixels.data[i]=value;
      pixels.data[i+1]=value+2;
      pixels.data[i+2]=value+4;
      pixels.data[i+3]=alpha;
    }
    ctx.putImageData(pixels,0,0);
    return sprite;
  }
  const smokeTextures=smokeCtx ? [0,1,2,3].map(makeSmokeTexture) : [];
  const smokeParticles=[];
  let smokeRunning=false;
  let smokeEmitting=false;
  let smokePrevFrame=0;
  let smokeLastDraw=0;
  let smokeSpawnDebt=0;
  let smokeWidth=0,smokeHeight=0;
  const smokeMaxParticles = ANIMATION.maxSmokeParticles;
  function resizeSmoke() {
    if(!smokeCtx)return;
    const r=wheelScene.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    smokeWidth=r.width;smokeHeight=r.height;
    smokeCanvas.width=Math.round(r.width*dpr);
    smokeCanvas.height=Math.round(r.height*dpr);
    smokeCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  if(smokeCtx){
    resizeSmoke();
    new ResizeObserver(resizeSmoke).observe(wheelScene);
  }
  // One contact patch ONLY, at the lower-right edge of the tyre.
  // The puff starts beside the rubber/ground contact and trails RIGHT,
  // slightly upward, like a controlled rear-tyre burnout.
  // Coordinates are responsive to wheel size so this works on phones.
  function spawnTyrePuff() {
    const wheelRect=wheelButton.getBoundingClientRect();
    const sceneRect=wheelScene.getBoundingClientRect();
    const cx=wheelRect.left-sceneRect.left+wheelRect.width/2;
    const cy=wheelRect.top-sceneRect.top+wheelRect.height/2;
    const radius=wheelRect.width/2;
    const sizeScale=Math.max(.73,Math.min(1.18,sceneRect.width/390));
    // A fixed contact point below the tyre, on the lower-right edge.
    // Smoke flows in one direction only: right and gently upwards.
    smokeParticles.push({
      x:cx+radius*.46+(Math.random()-.5)*13*sizeScale,
      y:cy+radius*.87+(Math.random()-.5)*9*sizeScale,
      vx:(38+Math.random()*47)*sizeScale,
      vy:(-9-Math.random()*19)*sizeScale,
      size:(24+Math.random()*26)*sizeScale,
      age:0,
      life:1350+Math.random()*750,
      sway:Math.random()*Math.PI*2,
      texture:smokeTextures[Math.floor(Math.random()*smokeTextures.length)],
      alpha:.8+Math.random()*.19
    });
  }
  function smokeStep(now) {
    if(!smokeCtx)return;
    if(!smokeRunning){return;}
    // ~30 fps cap keeps the smartphone GPU and CPU workload low.
    // Measure elapsed time since the LAST DRAW, not the previous rAF.
    if(now-smokeLastDraw<29){requestAnimationFrame(smokeStep);return;}
    const dt=Math.min(Math.max(now-smokePrevFrame,0),50);
    smokePrevFrame=now;
    smokeLastDraw=now;
    const elapsed=now-getStartTime();
    if(smokeEmitting){
      smokeSpawnDebt+=(64+Math.min(24,Math.max(0,(elapsed-smokeDelay)/90)))*dt/1000;
      while(smokeSpawnDebt>=1 && smokeParticles.length<smokeMaxParticles){
        spawnTyrePuff();smokeSpawnDebt--;
      }
      smokeSpawnDebt=Math.min(smokeSpawnDebt,3);
    }
    smokeCtx.clearRect(0,0,smokeWidth,smokeHeight);
    for(let i=smokeParticles.length-1;i>=0;i--){
      const p=smokeParticles[i];
      p.age+=dt;
      if(p.age>=p.life){smokeParticles.splice(i,1);continue;}
      const seconds=dt/1000;
      const t=p.age/p.life;
      // Tiny random turbulence while the cloud drifts away from the tyre.
      p.x+=(p.vx+(Math.sin(p.sway)*6))*seconds;
      p.y+=(p.vy-23*t)*seconds;
      p.sway+=seconds*2.1;
      const fadeIn=Math.min(1,p.age/55);
      const fadeOut=Math.pow(Math.max(0,1-t),1.12);
      const opacity=fadeIn*fadeOut*p.alpha;
      const grow=p.size*(1+t*1.95);
      smokeCtx.globalAlpha=opacity;
      smokeCtx.drawImage(p.texture,
        p.x+Math.sin(p.sway)*2.5-grow/2,
        p.y-grow/2,
        grow, grow*.91);
    }
    smokeCtx.globalAlpha=1;
    if(smokeEmitting||smokeParticles.length){
      requestAnimationFrame(smokeStep);
    } else {
      smokeCtx.clearRect(0,0,smokeWidth,smokeHeight);
      smokeRunning=false;
    }
  }
  function startSmoke() {
    if(!smokeCtx||prefersReducedMotion()||smokeEmitting)return;
    smokeEmitting=true;
    smokeSpawnDebt=0;
    for(let n=0;n<7;n++)spawnTyrePuff();
    wheelScene.classList.add("is-smoking");
    if(!smokeRunning){
      smokeRunning=true;
      smokePrevFrame=performance.now();
      smokeLastDraw=0;
      requestAnimationFrame(smokeStep);
    }
  }
  function stopSmoke() {
    smokeEmitting=false;
    smokeSpawnDebt=0;
    wheelScene.classList.remove("is-smoking");
    // Leave a short natural wisp after braking rather than
    // cutting the smoke off abruptly; no new puffs are created.
    for(const p of smokeParticles)p.life=Math.min(p.life,p.age+460);
  }

  // Public, small API used by wheel-lab.js.
  return { start: startSmoke, stop: stopSmoke };
}
