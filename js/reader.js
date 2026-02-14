let pages = [];
let chapters = [];
let currentChapter = 0;
let currentPage = 0;
let viewMode = localStorage.getItem('viewMode') || "single";

const imageContainer = document.getElementById("imageContainer");
const pageNumberTop = document.getElementById("pageNumberTop");
const pageNumberBottom = document.getElementById("pageNumberBottom");
const chapterSelector = document.getElementById("chapterSelector");
const chapterSelectorBottom = document.getElementById("chapterSelectorBottom");
const viewButton = document.getElementById("viewMode");

viewButton.textContent = viewMode === "scroll" ? "Endless Scroll" : capitalizeMode(viewMode);

fetch("pages.json")
  .then(res => { if(!res.ok) throw new Error("No pages.json"); return res.json(); })
  .then(data => {
    pages = data;
    const chapterSet = new Set();
    pages.forEach(p => chapterSet.add(JSON.stringify({num:p.chapter,name:p.chapterName})));
    chapters = Array.from(chapterSet).map(c => JSON.parse(c));
    chapters.forEach((ch,i)=>{
      chapterSelector.add(new Option(ch.name,i));
      chapterSelectorBottom.add(new Option(ch.name,i));
    });
    loadFromPermalinkOrLastLocation();
    render();
  })
  .catch(err => {
    document.querySelectorAll("button, select, .page-number").forEach(el=>el.style.display="none");
    imageContainer.style.display="flex";
    imageContainer.style.justifyContent="center";
    imageContainer.style.alignItems="center";
    imageContainer.style.height="80vh";
    imageContainer.style.color="white";
    imageContainer.style.fontSize="24px";
    imageContainer.textContent="Work in Progress.";
  });

function loadFromPermalinkOrLastLocation() {
  const params = new URLSearchParams(window.location.search);
  if(params.has("chapter") && params.has("page")){
    const idx = chapters.findIndex(c=>c.name===params.get("chapter"));
    if(idx>=0){ currentChapter=idx; currentPage=parseInt(params.get("page"))-1; return; }
  }
  currentChapter = parseInt(localStorage.getItem("lastChapter"))||0;
  currentPage = parseInt(localStorage.getItem("lastPage"))||0;
}

function updateChapterSelectors() {
  chapterSelector.value = chapterSelectorBottom.value = currentChapter;
}

function restoreScrollPosition() {
  if(viewMode!=="scroll") return;
  const lastScroll = localStorage.getItem(`scrollPos_chapter_${currentChapter}`);
  if(lastScroll) window.scrollTo({ top: parseFloat(lastScroll), behavior:'smooth' });
}

function capitalizeMode(mode){
  return mode==="single"?"Single Page":mode==="scroll"?"Endless Scroll":mode;
}

let scrollIndex=0;

function getChapterPages() { if(!pages||pages.length===0) return []; return pages.filter(p=>p.chapter===chapters[currentChapter].num); }

function render(){
  if(!pages||pages.length===0) return;
  imageContainer.innerHTML="";
  if(viewMode==="scroll"){ scrollIndex=0; loadScrollPages(); restoreScrollPosition(); }
  else { displaySinglePage(getChapterPages()[currentPage],true); addSinglePageOverlays(); }
  updateButtonsVisibility();
  updatePageNumbersUI();
  updateChapterSelectors();
}

function displaySinglePage(p,instant=false){
  if(!p) return;
  const img=document.createElement("img");
  img.src=p.link;
  img.className="page-img";
  img.style.display="block";
  img.style.margin="0 auto";
  img.style.height="auto";
  img.style.maxWidth="970px";
  if(!instant){ img.onload=()=>img.classList.add("loaded"); } else { img.classList.add("loaded"); }
  imageContainer.appendChild(img);
  updatePageNumbers(p.page);
  window.history.replaceState({}, "", `?chapter=${encodeURIComponent(p.chapterName)}&page=${encodeURIComponent(p.page)}`);
  localStorage.setItem("lastChapter",currentChapter);
  localStorage.setItem("lastPage",currentPage);
}

function addSinglePageOverlays(){
  document.querySelectorAll('#imageContainer .overlay-left, #imageContainer .overlay-right').forEach(el=>el.remove());
  if(viewMode!=="single") return;
  const left=document.createElement("div");
  left.className="overlay-left"; left.onclick=()=>prevPage();
  const right=document.createElement("div");
  right.className="overlay-right"; right.onclick=()=>nextPage();
  imageContainer.appendChild(left); imageContainer.appendChild(right);
}

function updateButtonsVisibility(){
  if(!pages||pages.length===0) return;
  const buttons=["prevPage","nextPage","prevPageBottom","nextPageBottom"];
  if(viewMode==="scroll"){ buttons.forEach(id=>document.getElementById(id).style.display="none"); pageNumberTop.style.display=pageNumberBottom.style.display="none"; }
  else { buttons.forEach(id=>document.getElementById(id).style.display="inline-block"); pageNumberTop.style.display=pageNumberBottom.style.display="inline-block"; }
}

function updatePageNumbers(num){ if(!pages||pages.length===0) return; if(viewMode!=="scroll") pageNumberTop.textContent=pageNumberBottom.textContent=num; }
function updatePageNumbersUI(){ if(!pages||pages.length===0) return; if(viewMode!=="scroll") updatePageNumbers(getChapterPages()[currentPage].page); }

function loadScrollPages(){
  if(!pages||pages.length===0) return;
  const chapterPages=getChapterPages();
  const end=Math.min(scrollIndex+5,chapterPages.length);
  for(let i=scrollIndex;i<end;i++){
    const img=document.createElement("img");
    img.src=chapterPages[i].link;
    img.className="page-img";
    img.style.display="block";
    img.style.margin="0 auto";
    img.style.height="auto";
    img.style.maxWidth="970px";
    img.onload=()=>img.classList.add("loaded");
    imageContainer.appendChild(img);
  }
  scrollIndex+=5;
}

window.addEventListener("scroll",()=>{
  if(!pages||pages.length===0) return;
  if(viewMode!=="scroll") return;
  localStorage.setItem(`scrollPos_chapter_${currentChapter}`,window.scrollY);
  const imgs=document.querySelectorAll('#imageContainer img');
  const middle=window.scrollY+window.innerHeight/2;
  let activeIndex=null;
  imgs.forEach((img,i)=>{
    const rect=img.getBoundingClientRect();
    const imgMiddle=rect.top+window.scrollY+rect.height/2;
    if(imgMiddle>=middle && activeIndex===null) activeIndex=i;
  });
  if(activeIndex!==null){
    const p=getChapterPages()[activeIndex];
    if(p) window.history.replaceState({}, "", `?chapter=${encodeURIComponent(p.chapterName)}&page=${encodeURIComponent(p.page)}`);
  }
  if(window.innerHeight+window.scrollY>=document.body.offsetHeight-50) loadScrollPages();
});

function prevPage(){ 
  currentPage--;
  if(currentPage<0){
    if(currentChapter>0){ currentChapter--; currentPage=getChapterPages().length-1; updateChapterSelectors(); }
    else currentPage=0;
  }
  render();
}

function nextPage(){
  currentPage++;
  const chapterPages=getChapterPages();
  if(currentPage>=chapterPages.length){
    if(currentChapter<chapters.length-1){ currentChapter++; currentPage=0; updateChapterSelectors(); }
    else currentPage=chapterPages.length-1;
  }
  render();
}

function prevChapter(){ if(currentChapter>0){ currentChapter--; currentPage=0; updateChapterSelectors(); render(); } }
function nextChapter(){ if(currentChapter<chapters.length-1){ currentChapter++; currentPage=0; updateChapterSelectors(); render(); } }

chapterSelector.onchange=chapterSelectorBottom.onchange=function(){ currentChapter=parseInt(this.value); currentPage=0; render(); }

function toggleView(){
  viewMode=viewMode==="single"?"scroll":"single";
  localStorage.setItem('viewMode',viewMode);
  viewButton.textContent=viewMode==="scroll"?"Endless Scroll":capitalizeMode(viewMode);
  render();
}

["prevPage","prevPageBottom"].forEach(id=>document.getElementById(id).onclick=prevPage);
["nextPage","nextPageBottom"].forEach(id=>document.getElementById(id).onclick=nextPage);
["prevChapter","prevChapterBottom"].forEach(id=>document.getElementById(id).onclick=prevChapter);
["nextChapter","nextChapterBottom"].forEach(id=>document.getElementById(id).onclick=nextChapter);
viewButton.onclick=toggleView;

window.addEventListener("keydown",(e)=>{ if(viewMode==="scroll") return; if(e.key==="ArrowLeft") prevPage(); else if(e.key==="ArrowRight") nextPage(); });

imageContainer.addEventListener("click",(e)=>{
  if(viewMode==="scroll") return;
  const rect=imageContainer.getBoundingClientRect();
  if(e.clientX-rect.left<rect.width/2) prevPage(); else nextPage();
});
