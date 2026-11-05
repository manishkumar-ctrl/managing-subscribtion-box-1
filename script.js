const PLANS=[
 {id:'starter',name:'Starter',price:499,items:3,tag:'A small monthly sampler',perks:['3 curated items','Standard shipping','Skip any month']},
 {id:'plus',name:'Plus',price:999,items:6,tag:'Our most popular box',perks:['6 curated items','Free shipping','One full-size bonus item'],pop:1},
 {id:'premium',name:'Premium',price:1799,items:10,tag:'The full collection',perks:['10 curated items','Priority shipping','Early access to limited drops']}
];
const CYCLES={monthly:{m:1,d:0,label:'Monthly'},quarterly:{m:3,d:.05,label:'Every 3 months'},yearly:{m:12,d:.15,label:'Yearly'}};
const TABS=[['plans','Customer plans'],['billing','Billing cycles'],['churn','Churn chart'],['admin','Admin view']];
const KEY='sbm-v1';
const $=s=>document.querySelector(s);
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const today=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())})();
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const addM=(d,n)=>{const t=new Date(d.getFullYear(),d.getMonth()+n,1);const last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();return new Date(t.getFullYear(),t.getMonth(),Math.min(d.getDate(),last))};
const fmt=d=>d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const plan=id=>PLANS.find(p=>p.id===id);
const boxSvg=n=>{const C=['#0e7c86','#f2b01e','#c8404f','#2e8b57','#7a5ac8'];let s='';for(let i=0;i<n;i++){s+=`<rect x="${30+(i%5)*26+(i>=5?13:0)}" y="${i<5?24:8}" width="18" height="${i<5?22:20}" rx="4" fill="${C[i%5]}"/>`}return `<svg viewBox="0 0 180 100" role="img" aria-label="A box with ${n} items" style="width:100%;max-width:200px;margin-bottom:8px">${s}<rect x="20" y="44" width="140" height="48" rx="3" fill="#d9a15b"/><rect x="82" y="44" width="16" height="48" fill="#f2b01e" opacity=".85"/></svg>`};
const monthly=c=>plan(c.plan).price*(1-CYCLES[c.cycle].d);
const amount=c=>monthly(c)*CYCLES[c.cycle].m;
function nextBill(c){let k=0,d=parse(c.start);while(d<today){k++;d=addM(parse(c.start),k*CYCLES[c.cycle].m)}return d}
const daysTo=d=>Math.round((d-today)/864e5);

function seed(){
 const L=[['Aarav Sharma','plus','monthly',7,3,null],['Diya Verma','starter','monthly',6,10,2],['Kabir Singh','premium','quarterly',8,5,null],['Meera Iyer','plus','yearly',9,12,null],['Rohan Gupta','starter','monthly',5,20,1],['Ananya Rao','plus','monthly',4,8,null],['Vihaan Mehta','premium','monthly',6,2,3],['Ishita Jain','starter','quarterly',7,15,null],['Arjun Nair','plus','quarterly',5,6,4],['Saanvi Kapoor','starter','monthly',3,18,null],['Reyansh Das','premium','yearly',10,9,null],['Tara Malik','plus','monthly',4,25,5],['Neil Bose','starter','monthly',2,4,null],['Pooja Reddy','plus','monthly',3,11,null],['Yash Patel','starter','monthly',5,27,2]];
 return L.map((r,i)=>{const s=addM(today,-r[3]);s.setDate(Math.min(r[4],28));let x=null;if(r[5]){x=addM(today,-r[5]);x.setDate(Math.min(10+i,28));if(x>today)x=addM(today,-r[5]-1)}
  return{id:i+1,name:r[0],email:r[0].toLowerCase().replace(/\s+/g,'.')+'@example.com',plan:r[1],cycle:r[2],start:iso(s),cancelled:x?iso(x):null,paid:null}})
}
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}
if(!S||!S.customers)S={customers:seed(),tab:'plans',pre:'starter'};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const active=()=>S.customers.filter(c=>!c.cancelled);

function churnData(){
 const out=[];
 for(let i=5;i>=0;i--){
  const a=new Date(today.getFullYear(),today.getMonth()-i,1),b=new Date(today.getFullYear(),today.getMonth()-i+1,1);
  let open=0,lost=0;
  S.customers.forEach(c=>{const st=parse(c.start),cx=c.cancelled?parse(c.cancelled):null;
   if(st<a&&(!cx||cx>=a))open++;
   if(cx&&cx>=a&&cx<b)lost++});
  out.push({label:a.toLocaleDateString('en-IN',{month:'short'}),open,lost,rate:open?lost/open*100:0});
 }
 return out;
}

function header(){
 const up=active().map(c=>({c,d:nextBill(c)})).sort((a,b)=>a.d-b.d)[0];
 $('#next').innerHTML=up?`<span>Next bill due</span><b>${up.c.name}</b><span>${fmt(up.d)} · ${amount(up.c)?inr(amount(up.c)):''} ${daysTo(up.d)===0?'(today)':'(in '+daysTo(up.d)+' days)'}</span>`:'<span>No active subscribers</span>';
 $('#tabs').innerHTML=TABS.map(t=>`<button role="tab" aria-selected="${S.tab===t[0]}" data-t="${t[0]}">${t[1]}</button>`).join('');
}

function vPlans(){
 const cnt=id=>active().filter(c=>c.plan===id).length;
 return `<h2>Choose a plan for your customers</h2><div class="grid">${PLANS.map(p=>`
 <div class="card plan ${p.pop?'pop':''}">${boxSvg(p.items)}<h3>${p.name}</h3><div class="muted" style="color:var(--mut)">${p.tag}</div>
 <div class="price">${inr(p.price)}<small> / month</small></div>
 <ul>${p.perks.map(x=>`<li>${x}</li>`).join('')}</ul>
 <p style="color:var(--mut);font-size:.9rem;margin:0 0 12px">Pay every 3 months and save 5%, or yearly and save 15%. ${cnt(p.id)} active subscribers.</p>
 <button class="btn" data-add="${p.id}">Add a ${p.name} customer</button></div>`).join('')}</div>`;
}

function vBilling(){
 const rows=active().map(c=>({c,d:nextBill(c)})).sort((a,b)=>a.d-b.d);
 const due=rows.filter(r=>daysTo(r.d)<=7);
 const sum=due.reduce((s,r)=>s+amount(r.c),0);
 return `<h2>Billing cycle tracker</h2>
 <div class="stats"><div class="stat"><b>${due.length}</b><span>bills due in 7 days</span></div><div class="stat"><b>${inr(sum)}</b><span>to collect this week</span></div><div class="stat"><b>${rows.length}</b><span>active subscriptions</span></div></div>
 <div class="tw"><table><thead><tr><th>Customer</th><th>Plan</th><th>Cycle</th><th>Next bill</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(({c,d})=>{const n=daysTo(d),p=c.paid===iso(d);
  const st=p?'<span class="chip c-ok">Paid</span>':n<=0?'<span class="chip c-bad">Due today</span>':n<=7?`<span class="chip c-warn">In ${n} days</span>`:`<span class="chip c-mut">In ${n} days</span>`;
  return `<tr><td>${c.name}</td><td>${plan(c.plan).name}</td><td>${CYCLES[c.cycle].label}</td><td>${fmt(d)}</td><td>${inr(amount(c))}</td><td>${st}</td><td>${p?'':`<button class="btn ghost sm" data-paid="${c.id}">Mark paid</button>`}</td></tr>`}).join('')||'<tr><td colspan="7" class="empty">No active subscriptions. Add a customer in the admin view.</td></tr>'}</tbody></table></div>`;
}

function chartSvg(D){
 const W=640,H=260,L=40,R=40,T=20,B=34,iw=W-L-R,ih=H-T-B;
 const mx=Math.max(3,...D.map(d=>d.lost)),mr=Math.max(10,Math.ceil(Math.max(...D.map(d=>d.rate))/5)*5);
 const bw=iw/D.length;
 let g='';
 for(let i=0;i<=3;i++){const y=T+ih-ih*i/3;g+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L-6}" y="${y+4}" text-anchor="end" font-size="11" fill="var(--mut)">${Math.round(mx*i/3)}</text><text x="${W-R+6}" y="${y+4}" font-size="11" fill="var(--mut)">${Math.round(mr*i/3)}%</text>`}
 const bars=D.map((d,i)=>{const h=ih*d.lost/mx;return `<rect x="${L+i*bw+bw*.25}" y="${T+ih-h}" width="${bw*.5}" height="${h}" fill="var(--tape)"/><text x="${L+i*bw+bw/2}" y="${H-12}" text-anchor="middle" font-size="12" fill="var(--ink)">${d.label}</text>`}).join('');
 const pts=D.map((d,i)=>[L+i*bw+bw/2,T+ih-ih*d.rate/mr]);
 const line=`<polyline fill="none" stroke="var(--bad)" stroke-width="3" points="${pts.map(p=>p.join(',')).join(' ')}"/>`+pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="var(--bad)"><title>${D[i].label}: ${D[i].rate.toFixed(1)}%</title></circle>`).join('');
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly cancellations and churn rate for the last six months">${g}${bars}${line}</svg>`;
}
function vChurn(){
 const D=churnData(),cur=D[5],tot=D.reduce((s,d)=>s+d.lost,0);
 const avg=D.reduce((s,d)=>s+d.rate,0)/6;
 return `<h2>Customer churn</h2>
 <div class="stats"><div class="stat"><b>${cur.rate.toFixed(1)}%</b><span>churn this month</span></div><div class="stat"><b>${avg.toFixed(1)}%</b><span>6-month average</span></div><div class="stat"><b>${tot}</b><span>cancellations in 6 months</span></div></div>
 <div class="chart">${chartSvg(D)}<div class="legend"><span><i class="dot" style="background:var(--tape)"></i>Customers cancelled</span><span><i class="dot" style="background:var(--bad)"></i>Churn rate (cancelled ÷ customers at month start)</span></div></div>
 <div class="tw"><table style="min-width:420px"><thead><tr><th>Month</th><th>Customers at start</th><th>Cancelled</th><th>Churn rate</th></tr></thead><tbody>${D.map(d=>`<tr><td>${d.label}</td><td>${d.open}</td><td>${d.lost}</td><td>${d.rate.toFixed(1)}%</td></tr>`).join('')}</tbody></table></div>`;
}

function vAdmin(){
 const a=active(),mrr=a.reduce((s,c)=>s+monthly(c),0),D=churnData();
 return `<h2>Admin view</h2>
 <div class="stats"><div class="stat"><b>${a.length}</b><span>active customers</span></div><div class="stat"><b>${inr(mrr)}</b><span>monthly recurring revenue</span></div><div class="stat"><b>${inr(mrr*12)}</b><span>annualised revenue</span></div><div class="stat"><b>${S.customers.length-a.length}</b><span>cancelled all-time</span></div></div>
 <form class="add" id="addf"><label>Name<input name="name" required maxlength="40"></label><label>Email<input name="email" type="email" required></label>
 <label>Plan<select name="plan">${PLANS.map(p=>`<option value="${p.id}" ${p.id===S.pre?'selected':''}>${p.name} (${inr(p.price)}/mo)</option>`).join('')}</select></label>
 <label>Billing cycle<select name="cycle">${Object.entries(CYCLES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label>
 <button class="btn" type="submit">Add customer</button></form>
 <div class="tw"><table><thead><tr><th>Customer</th><th>Plan</th><th>Cycle</th><th>Started</th><th>Status</th><th>Actions</th></tr></thead><tbody>${S.customers.map(c=>`<tr><td>${c.name}<br><small style="color:var(--mut)">${c.email}</small></td>
 <td><select data-plan="${c.id}" aria-label="Plan for ${c.name}">${PLANS.map(p=>`<option value="${p.id}" ${p.id===c.plan?'selected':''}>${p.name}</option>`).join('')}</select></td>
 <td>${CYCLES[c.cycle].label}</td><td>${fmt(parse(c.start))}</td>
 <td>${c.cancelled?`<span class="chip c-bad">Cancelled ${fmt(parse(c.cancelled))}</span>`:'<span class="chip c-ok">Active</span>'}</td>
 <td class="act">${c.cancelled?`<button class="btn ghost sm" data-react="${c.id}">Reactivate</button>`:`<button class="btn bad sm" data-cancel="${c.id}">Cancel</button>`}<button class="btn ghost sm" data-del="${c.id}">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}

function render(){
 header();
 $('#view').innerHTML={plans:vPlans,billing:vBilling,churn:vChurn,admin:vAdmin}[S.tab]();
 save();
}
const find=id=>S.customers.find(c=>c.id==id);
document.addEventListener('click',e=>{
 const t=e.target.closest('button');if(!t)return;
 const d=t.dataset;
 if(d.t)S.tab=d.t;
 else if(d.add){S.pre=d.add;S.tab='admin'}
 else if(d.paid){const c=find(d.paid);c.paid=iso(nextBill(c))}
 else if(d.cancel){find(d.cancel).cancelled=iso(today)}
 else if(d.react){find(d.react).cancelled=null}
 else if(d.del){if(!confirm('Delete this customer permanently?'))return;S.customers=S.customers.filter(c=>c.id!=d.del)}
 else if(t.id==='reset'){S={customers:seed(),tab:'plans',pre:'starter'}}
 else return;
 render();window.scrollTo(0,0);
});
document.addEventListener('change',e=>{if(e.target.dataset.plan){find(e.target.dataset.plan).plan=e.target.value;render()}});
document.addEventListener('submit',e=>{
 e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
 S.customers.push({id:Date.now(),name:f.name.trim(),email:f.email.trim(),plan:f.plan,cycle:f.cycle,start:iso(today),cancelled:null,paid:null});
 render();
});
render();
