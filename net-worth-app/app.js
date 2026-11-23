let accounts = JSON.parse(localStorage.getItem('networth-accounts') || '[]');
const dialog=document.querySelector('#accountDialog');
const accountForm=document.querySelector('#accountForm');

if(!accounts.length){accounts=[
 {id:crypto.randomUUID(),name:'Checking account',type:'asset',category:'Cash',balance:12500},
 {id:crypto.randomUUID(),name:'Investment portfolio',type:'asset',category:'Investments',balance:34200},
 {id:crypto.randomUUID(),name:'Credit card',type:'liability',category:'Credit Card',balance:2350}
];saveAccounts();}

const savedTheme=localStorage.getItem('networth-theme');if(savedTheme==='light')document.body.classList.add('light');
document.querySelector('#themeButton').addEventListener('click',()=>{document.body.classList.toggle('light');localStorage.setItem('networth-theme',document.body.classList.contains('light')?'light':'dark');});

function saveAccounts(){localStorage.setItem('networth-accounts',JSON.stringify(accounts));renderAccounts();}
function money(value){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);}
function compactMoney(value){const abs=Math.abs(value);if(abs>=1e6)return `$${(value/1e6).toFixed(1)}M`;if(abs>=1e3)return `$${(value/1e3).toFixed(1)}K`;return money(value);}

function renderAccounts(){
 const assets=accounts.filter(a=>a.type==='asset'), liabilities=accounts.filter(a=>a.type==='liability');
 const assetTotal=assets.reduce((sum,a)=>sum+a.balance,0), liabilityTotal=liabilities.reduce((sum,a)=>sum+a.balance,0), netWorth=assetTotal-liabilityTotal;
 document.querySelector('#assetsValue').textContent=money(assetTotal);document.querySelector('#liabilitiesValue').textContent=money(liabilityTotal);document.querySelector('#netWorthValue').textContent=money(netWorth);
 document.querySelector('#assetsCount').textContent=`${assets.length} account${assets.length===1?'':'s'}`;document.querySelector('#liabilitiesCount').textContent=`${liabilities.length} account${liabilities.length===1?'':'s'}`;document.querySelector('#donutNetWorth').textContent=compactMoney(netWorth);
 const filter=document.querySelector('#accountFilter').value, visible=accounts.filter(a=>filter==='all'||a.type===filter), list=document.querySelector('#accountList');
 list.innerHTML=visible.length?visible.map(a=>`<div class="account-row"><div class="account-avatar ${a.type}">${escapeHtml(a.name[0].toUpperCase())}</div><div class="account-info"><strong>${escapeHtml(a.name)}</strong><span>${escapeHtml(a.category)}</span></div><div class="account-value ${a.type}">${a.type==='liability'?'-':''}${money(a.balance)}</div><button class="delete-account" data-id="${a.id}" aria-label="Delete account">×</button></div>`).join(''):'<div class="empty-state"><div><strong>No accounts here</strong><br><small>Add an account to get started.</small></div></div>';
 document.querySelectorAll('.delete-account').forEach(button=>button.addEventListener('click',()=>{accounts=accounts.filter(a=>a.id!==button.dataset.id);saveAccounts();showToast('Account removed');}));
 const total=assetTotal+liabilityTotal, assetPercent=total?assetTotal/total*100:0;
 document.querySelector('#donutChart').style.background=total?`conic-gradient(var(--accent) 0 ${assetPercent}%, var(--orange) ${assetPercent}% 100%)`:'var(--panel-soft)';
 document.querySelector('#breakdownLegend').innerHTML=`<div class="legend-row"><i class="legend-dot" style="background:var(--accent)"></i><span>Assets</span><strong>${compactMoney(assetTotal)}</strong></div><div class="legend-row"><i class="legend-dot" style="background:var(--orange)"></i><span>Liabilities</span><strong>${compactMoney(liabilityTotal)}</strong></div>`;
}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function showToast(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200);}
document.querySelector('#addItemButton').addEventListener('click',()=>dialog.showModal());document.querySelector('#closeDialog').addEventListener('click',()=>dialog.close());
accountForm.addEventListener('submit',event=>{event.preventDefault();accounts.push({id:crypto.randomUUID(),name:document.querySelector('#accountName').value.trim(),type:document.querySelector('#accountType').value,category:document.querySelector('#accountCategory').value,balance:Number(document.querySelector('#accountBalance').value)});accountForm.reset();dialog.close();saveAccounts();showToast('Account added');});
document.querySelector('#accountFilter').addEventListener('change',renderAccounts);renderAccounts();
