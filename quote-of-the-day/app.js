const quotes=[['The secret of getting ahead is getting started.','Mark Twain'],['It always seems impossible until it is done.','Nelson Mandela'],['The future depends on what you do today.','Mahatma Gandhi'],['Do not wait. The time will never be just right.','Napoleon Hill'],['Success is the sum of small efforts repeated day in and day out.','Robert Collier'],['Energy and persistence conquer all things.','Benjamin Franklin'],['The only way to do great work is to love what you do.','Steve Jobs'],['We are what we repeatedly do.','Aristotle']];
let index=0;
let saved=JSON.parse(localStorage.getItem('saved-quotes')||'[]');
const quote=document.querySelector('#quote'),author=document.querySelector('#author'),date=document.querySelector('#date');
const newButton=document.querySelector('#new'),saveButton=document.querySelector('#save'),copyButton=document.querySelector('#copy'),themeButton=document.querySelector('#theme'),clearButton=document.querySelector('#clear');

function setQuote(i){index=i;quote.textContent='“'+quotes[i][0]+'”';author.textContent='— '+quotes[i][1];}
function setToday(){date.textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});}
setToday();
setQuote(Math.floor(Date.now()/86400000)%quotes.length);

newButton.onclick=()=>setQuote((index+1)%quotes.length);
saveButton.onclick=()=>{if(!saved.some(q=>q[0]===quotes[index][0])){saved.push(quotes[index]);localStorage.setItem('saved-quotes',JSON.stringify(saved));render();}};
copyButton.onclick=async()=>{if(navigator.clipboard)await navigator.clipboard.writeText(`${quotes[index][0]} — ${quotes[index][1]}`);};
themeButton.onclick=()=>document.body.classList.toggle('dark');
clearButton.onclick=()=>{saved=[];localStorage.removeItem('saved-quotes');render();};

function render(){const savedList=document.querySelector('#saved');savedList.innerHTML=saved.map(q=>`<div class="saved-card">${q[0]}<small>${q[1]}</small></div>`).join('')||'<p>No saved quotes.</p>';}
render();
