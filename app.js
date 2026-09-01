const state={current:"cover",mood:"glücklich"};
const pages=[...document.querySelectorAll("[data-page-view]")];
const toast=document.getElementById("toast");
function showToast(){toast.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove("show"),1400)}
function go(page){
  const target=document.querySelector(`[data-page-view="${page}"]`);
  if(!target)return;
  pages.forEach(p=>p.classList.toggle("active",p===target));
  document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("is-active",b.dataset.page===page));
  state.current=page;window.scrollTo({top:0,behavior:"smooth"});
}
document.addEventListener("click",e=>{
  const button=e.target.closest("[data-page]");
  if(button){e.preventDefault();go(button.dataset.page);return}
  const sub=e.target.closest("[data-subpage]");
  if(sub){go("jan-"+sub.dataset.subpage);return}
  const mood=e.target.closest("[data-mood]");
  if(mood){state.mood=mood.dataset.mood;document.querySelectorAll(".mood-key button").forEach(b=>b.classList.toggle("active",b===mood));showToast();return}
  const day=e.target.closest(".mood-day");
  if(day){day.dataset.mood=state.mood;day.textContent=day.dataset.day;showToast();return}
  if(e.target.closest("#nextPage")){go(state.current==="cover"?"year":"jan");}
  if(e.target.closest(".open-book"))go("year");
});
document.addEventListener("input",e=>{if(e.target.matches("[contenteditable],input[type=range]"))showToast()});
function monthTable(name,monthIndex){
 const first=new Date(2027,monthIndex,1).getDay()||7;const days=new Date(2027,monthIndex+1,0).getDate();
 let html=`<div class="mini-calendar"><h3>${name}</h3><table><thead><tr>${["M","D","M","D","F","S","S"].map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody><tr>`;
 for(let i=1;i<first;i++)html+="<td></td>";
 for(let d=1;d<=days;d++){if((first+d-2)%7===0&&d>1)html+="</tr><tr>";html+=`<td>${d}</td>`}
 return html+"</tr></tbody></table></div>";
}
const names=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
document.getElementById("miniCalendars").innerHTML=names.map((n,i)=>monthTable(n,i)).join("");
function buildJanuary(){
 const first=new Date(2027,0,1).getDay()||7;const days=31;
 let html="<h3>Januar 2027</h3><table><thead><tr>"+["Mo","Di","Mi","Do","Fr","Sa","So"].map(x=>`<th>${x}</th>`).join("")+"</tr></thead><tbody><tr>";
 for(let i=1;i<first;i++)html+="<td></td>";
 for(let d=1;d<=days;d++){if((first+d-2)%7===0&&d>1)html+="</tr><tr>";html+=`<td><button>${d}</button></td>`}
 document.getElementById("monthCalendar").innerHTML=html+"</tr></tbody></table>";
}
function buildMood(){document.getElementById("moodGrid").innerHTML=Array.from({length:31},(_,i)=>`<button class="mood-day" data-day="${i+1}"><small>${i+1}</small></button>`).join("")}
buildJanuary();buildMood();