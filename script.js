"use strict";
const services = [
  ["01","Lift Car Foam Wash","WASH"],
  ["02","Wheel Balancing","WHEELS"],
  ["03","Wheel Alignment","WHEELS"],
  ["04","Nitrogen Air","WHEELS"],
  ["05","Tyre Changing","WHEELS"],
  ["06","Teflon Coating","DETAILING"],
  ["07","Complete Car Detailing","DETAILING"],
  ["08","Car Accessories","EXTRAS"],
  ["09","CEAT Tyres","WHEELS"]
];
const get = (id) => document.getElementById(id);

// Mobile menu
const menu = get("menu"), menuButton = get("menu-button");
const closeMenu = () => { menu.classList.remove("open"); menuButton.classList.remove("open"); menuButton.setAttribute("aria-expanded","false"); menuButton.setAttribute("aria-label","Open navigation"); menu.setAttribute("aria-hidden","true"); document.body.classList.remove("menu-open"); };
menuButton.addEventListener("click", () => {
  if (menu.classList.contains("open")) {closeMenu();return;}
  menu.classList.add("open"); menuButton.classList.add("open");
  menuButton.setAttribute("aria-expanded","true"); menuButton.setAttribute("aria-label","Close navigation");
  menu.setAttribute("aria-hidden","false"); document.body.classList.add("menu-open");
});
menu.querySelectorAll("a").forEach(a => a.addEventListener("click",closeMenu));
document.addEventListener("keydown",e => {if(e.key === "Escape")closeMenu();});


// Infinite marquee with manual touch/mouse control and velocity-based flicks.
// Browsers keep vertical page scrolling because the strip uses touch-action:pan-y.
const ticker = get("draggable-ticker");
const tickerTrack = ticker.querySelector(".ticker-inner");
const tickerFirst = tickerTrack.firstElementChild;
const prefersLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let tickerLoop = 1;
let tickerOffset = 0;
let tickerPointer = null;
let tickerLastX = 0;
let tickerLastMove = 0;
let tickerVelocity = 0; // Pixels per millisecond. Direction is preserved.
let tickerMomentum = 0; // Pixels per second after finger release.
let tickerFrameTime = performance.now();
const tickerAutoSpeed = 69;
function tickerMeasure() {
  tickerLoop = Math.max(1, tickerFirst.getBoundingClientRect().width);
}
function tickerDraw() {
  // Wrap across identical copies without a visible jump, even on rightward drags.
  tickerOffset = ((tickerOffset % tickerLoop) + tickerLoop) % tickerLoop;
  if (tickerOffset > 0) tickerOffset -= tickerLoop;
  tickerTrack.style.transform = "translate3d(" + tickerOffset.toFixed(2) + "px,0,0)";
}
function tickerFrame(now) {
  const dt = Math.min((now - tickerFrameTime) / 1000, .05);
  tickerFrameTime = now;
  if (tickerPointer === null && !prefersLessMotion.matches) {
    if (Math.abs(tickerMomentum) > 28) {
      tickerOffset += tickerMomentum * dt;
      tickerMomentum *= Math.exp(-3.8 * dt);
    } else {
      tickerMomentum = 0;
      tickerOffset -= tickerAutoSpeed * dt;
    }
    tickerDraw();
  }
  requestAnimationFrame(tickerFrame);
}
function tickerRelease(e, cancelled = false) {
  if (tickerPointer !== e.pointerId) return;
  tickerPointer = null;
  ticker.classList.remove("is-dragging");
  const recent = performance.now() - tickerLastMove < 100;
  tickerMomentum = (!cancelled && recent) ? Math.max(-2100, Math.min(2100, tickerVelocity * 1000)) : 0;
}
ticker.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  tickerPointer = e.pointerId;
  tickerLastX = e.clientX;
  tickerLastMove = performance.now();
  tickerVelocity = 0;
  tickerMomentum = 0;
  ticker.classList.add("is-dragging");
  ticker.setPointerCapture(e.pointerId);
});
ticker.addEventListener("pointermove", (e) => {
  if (tickerPointer !== e.pointerId) return;
  const now = performance.now();
  const dx = e.clientX - tickerLastX;
  const dt = Math.max(1, now - tickerLastMove);
  tickerOffset += dx;
  tickerVelocity = tickerVelocity * .3 + (dx / dt) * .7;
  tickerLastX = e.clientX;
  tickerLastMove = now;
  tickerDraw();
});
ticker.addEventListener("pointerup", e => tickerRelease(e));
ticker.addEventListener("pointercancel", e => tickerRelease(e, true));
ticker.addEventListener("lostpointercapture", e => tickerRelease(e, true));
window.addEventListener("resize", tickerMeasure, { passive:true });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(tickerMeasure);
tickerMeasure();
requestAnimationFrame(tickerFrame);

// Simple, accessible scroll reveal; no heavy animation library.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target);}}),{threshold:.1});
  document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
} else document.querySelectorAll(".reveal").forEach(el=>el.classList.add("visible"));

// Filterable service list.
function renderServices(filter) {
  get("service-rows").innerHTML = services.filter(s => filter === "ALL" || s[2] === filter).map(s =>
    '<a href="#quote" class="service-row"><span class="number">'+s[0]+'</span><strong>'+s[1]+'</strong><span class="group">'+s[2]+'</span><span class="arrow">↗</span></a>'
  ).join("");
}
renderServices("ALL");
document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("[data-filter]").forEach(b => { b.classList.toggle("active",b===btn);b.setAttribute("aria-pressed",String(b===btn)); });
  renderServices(btn.dataset.filter);
}));

// Finger-swipe cleaning canvas. We draw a dirty overlay, then erase it with touch strokes.
const canvas = get("wash-canvas"), ctx = canvas.getContext("2d"), washStatus = get("wash-status"), washAction = get("wash-reveal");
let washing = false, prev = null, swipeCount = 0, clean = false;
function resetDirt() {
  const r=canvas.getBoundingClientRect();if (!r.width || !r.height) return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,r.width,r.height);
  ctx.fillStyle="rgba(43,40,32,.76)";ctx.fillRect(0,0,r.width,r.height);
  let seed=32021; const rand=()=>((seed=(seed*16807)%2147483647)/2147483647);
  for(let i=0;i<130;i++){ctx.beginPath();ctx.fillStyle=i%2===0?"rgba(204,189,150,.13)":"rgba(5,5,5,.11)";ctx.arc(rand()*r.width,rand()*r.height,5+rand()*32,0,Math.PI*2);ctx.fill();}
  clean=false;prev=null;swipeCount=0;washStatus.textContent="● SWIPE TO CLEAN";washAction.textContent="REVEAL FINISH ↗";
}
function erase(e) {
  if(clean)return;
  const r=canvas.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
  ctx.save();ctx.globalCompositeOperation="destination-out";ctx.lineWidth=Math.max(54,r.width*.125);
  ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(prev?prev.x:x,prev?prev.y:y);ctx.lineTo(x,y);ctx.stroke();ctx.restore();prev={x,y};
  swipeCount++;if(swipeCount>8)washStatus.textContent="● KEEP GOING!";
}
canvas.addEventListener("pointerdown",e=>{washing=true;canvas.setPointerCapture(e.pointerId);erase(e);});
canvas.addEventListener("pointermove",e=>{if(washing)erase(e);});
["pointerup","pointercancel","lostpointercapture"].forEach(type=>canvas.addEventListener(type,()=>{washing=false;prev=null;}));
washAction.addEventListener("click",()=>{if(clean){resetDirt();return;}ctx.clearRect(0,0,canvas.width,canvas.height);clean=true;washStatus.textContent="● SHOWROOM READY";washAction.textContent="TRY AGAIN ↻";});
new ResizeObserver(resetDirt).observe(canvas);

// Wheel Lab: press and hold to accelerate; release to brake immediately.
// Smoke appears only after a deliberate hold (2.65 seconds).
const modes = [
  ["Wheel Balancing","A balanced wheel helps make every ride feel smoother."],
  ["Wheel Alignment","Give your car the right direction, straight from the start."],
  ["Nitrogen Air","Ask our team about nitrogen inflation for your tyres."],
  ["CEAT Tyres","Explore available CEAT tyre options for your vehicle."]
];
const wheelButton = get("spin-wheel");
const wheelScene = get("wheel-scene");
const wheelIndicator = get("wheel-instruction");
const wheelTyre = wheelButton.querySelector(".wheel-tyre");
const smoke = get("burnout-smoke");
let wheelAngle = 17;
let wheelHolding = false;
let wheelPointer = null;
let wheelStartTime = 0;
let wheelPrevFrame = 0;
let wheelRaf = 0;
let wheelBrakeTimer = 0;
let smokeActive = false;
const smokeDelay = 2650;
function wheelAnimate(now) {
  if (!wheelHolding) return;
  const elapsed = now - wheelStartTime;
  const dt = Math.min((now - wheelPrevFrame) / 1000, .05);
  wheelPrevFrame = now;
  // The longer the hold, the faster the wheel spins. Cap to prevent
  // excessive transforms or extreme strobing on low-end phones.
  const velocity = Math.min(1400, 120 + (elapsed / 1000) * 230);
  wheelAngle = (wheelAngle + velocity * dt) % 360;
  wheelTyre.style.transform = "rotate(" + wheelAngle.toFixed(2) + "deg)";
  if (!smokeActive && elapsed >= smokeDelay && !prefersLessMotion.matches) {
    smokeActive = true;
    smoke.classList.add("active");
    wheelScene.classList.add("is-smoking");
    wheelIndicator.textContent = "● BURNOUT! RELEASE TO BRAKE";
  }
  wheelRaf = requestAnimationFrame(wheelAnimate);
}
function startWheel() {
  if (wheelHolding) return;
  window.clearTimeout(wheelBrakeTimer);
  wheelScene.classList.remove("is-braking");
  wheelScene.classList.add("is-spinning");
  wheelHolding = true;
  wheelStartTime = performance.now();
  wheelPrevFrame = wheelStartTime;
  wheelIndicator.textContent = "● HOLDING — ACCELERATING";
  wheelRaf = requestAnimationFrame(wheelAnimate);
}
function stopWheel() {
  if (!wheelHolding) return;
  wheelHolding = false;
  cancelAnimationFrame(wheelRaf); // Brake on release; no residual spin.
  smokeActive = false;
  smoke.classList.remove("active");
  wheelScene.classList.remove("is-spinning","is-smoking");
  wheelScene.classList.add("is-braking");
  wheelIndicator.textContent = "✓ BRAKED — PRESS & HOLD AGAIN";
  wheelBrakeTimer = window.setTimeout(() => {
    wheelScene.classList.remove("is-braking");
    wheelIndicator.textContent = "↗ PRESS & HOLD TO SPIN";
  }, 1150);
}
wheelButton.addEventListener("pointerdown", e => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  if (wheelPointer !== null) return;
  wheelPointer = e.pointerId;
  wheelButton.setPointerCapture(e.pointerId);
  startWheel();
});
function endWheelPointer(e) {
  if (wheelPointer !== e.pointerId) return;
  wheelPointer = null;
  stopWheel();
}
wheelButton.addEventListener("pointerup",endWheelPointer);
wheelButton.addEventListener("pointercancel",endWheelPointer);
wheelButton.addEventListener("lostpointercapture",endWheelPointer);
// Keyboard users get the same press-and-hold interaction.
wheelButton.addEventListener("keydown",e=>{
  if ((e.key === " " || e.key === "Enter") && !e.repeat) {
    e.preventDefault();
    startWheel();
  }
});
wheelButton.addEventListener("keyup",e=>{
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    stopWheel();
  }
});
wheelButton.addEventListener("blur",stopWheel);
window.addEventListener("blur",stopWheel);
document.addEventListener("visibilitychange",()=>{
  if (document.hidden) stopWheel();
});
document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  const n = Number(btn.dataset.mode);
  document.querySelectorAll("[data-mode]").forEach(b=>{
    b.classList.toggle("selected",b===btn);
    b.setAttribute("aria-pressed",String(b===btn));
  });
  get("wheel-counter").textContent = "YOUR SELECTED SERVICE / 0" + (n+1);
  get("wheel-name").textContent = modes[n][0];
  get("wheel-copy").textContent = modes[n][1];
}));

// The before / after is transparently labeled as a visual demonstration.
const compareInput=get("compare-input");
function setCompare(){const n=Number(compareInput.value);get("compare-after").style.clipPath="inset(0 "+(100-n)+"% 0 0)";get("compare-bar").style.left=n+"%";}
compareInput.addEventListener("input",setCompare);setCompare();

// Working mobile-first quote builder; direct shop WhatsApp number will be added later.
const selected = new Set();
const options = get("quote-options");
services.forEach(s=>{
  const b=document.createElement("button");b.type="button";b.innerHTML="<span>+</span>"+s[1];b.setAttribute("aria-pressed","false");
  b.addEventListener("click",()=>{
    if(selected.has(s[1]))selected.delete(s[1]);else selected.add(s[1]);
    b.classList.toggle("selected",selected.has(s[1]));b.setAttribute("aria-pressed",String(selected.has(s[1])));
    b.querySelector("span").textContent=selected.has(s[1])?"✓":"+";
    get("selection-count").textContent=selected.size?selected.size+" service"+(selected.size>1?"s":""):"No services selected yet";
    updateShare();
  });options.appendChild(b);
});
function enquiryText(){return "Hello Matri Chhaya! I would like an enquiry.\nVehicle: "+get("vehicle").value+"\nServices: "+(selected.size?Array.from(selected).join(", "):"Please advise")+"\nPlease share pricing and availability.";}
function updateShare(){get("whatsapp-share").href="https://api.whatsapp.com/send?text="+encodeURIComponent(enquiryText());}
get("vehicle").addEventListener("change",updateShare);updateShare();
get("copy-quote").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(enquiryText());get("copy-quote").textContent="COPIED ✓";setTimeout(()=>get("copy-quote").textContent="COPY ENQUIRY ↗",2500);}
  catch{window.prompt("Copy enquiry text:",enquiryText());}
});
