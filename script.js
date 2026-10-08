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

// Wheel Lab: all touch and click compatible.
const modes=[
  ["Wheel Balancing","A balanced wheel helps make every ride feel smoother."],
  ["Wheel Alignment","Give your car the right direction, straight from the start."],
  ["Nitrogen Air","Ask our team about nitrogen inflation for your tyres."],
  ["CEAT Tyres","Explore available CEAT tyre options for your vehicle."]
];
let degrees=17;const tyre=document.querySelector(".wheel-tyre");
function spin(amount){degrees+=amount;tyre.style.transform="rotate("+degrees+"deg)";}
get("spin-wheel").addEventListener("click",()=>spin(235));
document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  const n=Number(btn.dataset.mode);document.querySelectorAll("[data-mode]").forEach(b=>{b.classList.toggle("selected",b===btn);b.setAttribute("aria-pressed",String(b===btn));});
  get("wheel-counter").textContent="YOUR SELECTED SERVICE / 0"+(n+1);
  get("wheel-name").textContent=modes[n][0];get("wheel-copy").textContent=modes[n][1];spin(75);
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
