import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ethers} from 'ethers';
import {CONTRACT_ADDRESS,CONTRACT_ABI} from './contract';
import './styles.css';

const API='http://localhost:4000/api';
function App(){
 const [campaigns,setCampaigns]=useState([]); const [wallet,setWallet]=useState(''); const [notice,setNotice]=useState('');
 const [amounts,setAmounts]=useState({}); const [ai,setAi]=useState(null);
 const load=()=>fetch(`${API}/campaigns`).then(r=>r.json()).then(setCampaigns).catch(()=>setNotice('Backend is not running. Start it with npm run dev in backend/.'));
 useEffect(load,[]);
 async function connect(){
   if(!window.ethereum){setNotice('MetaMask is required for wallet demo.');return;}
   const p=new ethers.BrowserProvider(window.ethereum); const accounts=await p.send('eth_requestAccounts',[]); setWallet(accounts[0]); setNotice('Wallet connected.');
 }
 async function donate(campaignId, amount){
   if(!window.ethereum){setNotice('MetaMask is required for a live testnet donation.');return;}
   if(!CONTRACT_ADDRESS){setNotice('Set VITE_CONTRACT_ADDRESS in frontend/.env after deploying the contract.');return;}
   try {
     const provider=new ethers.BrowserProvider(window.ethereum); const signer=await provider.getSigner();
     const contract=new ethers.Contract(CONTRACT_ADDRESS,CONTRACT_ABI,signer);
     const tx=await contract.donate(Number(campaignId),{value:ethers.parseEther(String(amount))});
     setNotice('Transaction submitted: '+tx.hash); await tx.wait(); setNotice('Donation confirmed: '+tx.hash); load();
   } catch(e){ setNotice(e?.shortMessage || e?.message || 'Donation failed'); }
 }
 async function analyze(){
   const r=await fetch(`${API}/alerts/analyze`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:95000,frequency:8,intervalHours:1})});
   setAi(await r.json());
 }
 return <div>
  <header><div className="brand">CharityChain</div><nav><a href="#campaigns">Campaigns</a><a href="#how">How it works</a><a href="#ai">AI Monitoring</a></nav><button onClick={connect}>{wallet?wallet.slice(0,6)+'...'+wallet.slice(-4):'Connect Wallet'}</button></header>
  <main>
   <section className="hero"><div><p className="eyebrow">BLOCKCHAIN • SMART CONTRACTS • AI</p><h1>Transparent charity funding, from donation to impact.</h1><p>Track contributions, campaign milestones and evidence with a blockchain-backed charity workflow.</p><div className="actions"><a className="primary" href="#campaigns">Explore campaigns</a><button className="secondary" onClick={connect}>Connect wallet</button></div></div><div className="hero-card"><div className="metric">100%</div><span>transaction traceability</span><div className="line"/><div className="metric">Milestone</div><span>based fund management</span></div></section>
   <section id="campaigns"><div className="section-head"><div><p className="eyebrow">LIVE PROTOTYPE</p><h2>Active campaigns</h2></div><span>{campaigns.length} campaigns</span></div><div className="grid">{campaigns.map(c=><article className="card" key={c.id||c._id}><div className="tag">{c.status}</div><h3>{c.title}</h3><p>{c.description}</p><div className="progress"><span style={{width:`${Math.min(100,(c.collected/c.target)*100||0)}%`}}/></div><div className="row"><span>Raised</span><strong>₹{Number(c.collected||0).toLocaleString()}</strong></div><div className="row"><span>Target</span><strong>₹{Number(c.target||0).toLocaleString()}</strong></div><div className="milestones"><b>Milestones</b>{(c.milestones||[]).map((m,i)=><div className="mile" key={i}><span className={m.status==='Released'?'done':''}>{m.status==='Released'?'✓':'○'}</span>{m.title}</div>)}</div><div className="donate"><input placeholder="Amount" value={amounts[c.id||c._id]||''} onChange={e=>setAmounts({...amounts,[c.id||c._id]:e.target.value})}/><button onClick={()=>donate(c.id||0,amounts[c.id||c._id]||0)}>Donate</button></div></article>)}</div></section>
   <section id="how" className="how"><p className="eyebrow">WORKFLOW</p><h2>How the system works</h2><div className="steps">{['Verified campaign','Blockchain donation','Milestone evidence','Controlled release','AI review'].map((x,i)=><div className="step" key={x}><span>0{i+1}</span><h3>{x}</h3><p>{['Charities are verified before campaigns are activated.','The smart contract records the donation and emits an event.','Receipts and progress references are attached to milestones.','Eligible funds are released after the defined verification step.','Unusual patterns are flagged for administrator review.'][i]}</p></div>)}</div></section>
   <section id="ai" className="ai"><div><p className="eyebrow">AI MONITORING</p><h2>Anomaly detection for human review</h2><p>The prototype uses an Isolation Forest model to flag unusual transaction patterns. It is a review aid, not a claim of fraud.</p><button className="primary" onClick={analyze}>Run demo anomaly check</button></div><div className="ai-result">{ai?<><div className={ai.isAnomaly?'alert':'ok'}>{ai.risk}</div><h3>Score: {Number(ai.score).toFixed(4)}</h3><p>{ai.message}</p></>:<p>Run the demo to see an example alert.</p>}</div></section>
   {notice&&<div className="notice" onClick={()=>setNotice('')}>{notice}</div>}
  </main><footer>Academic prototype • Use testnet funds only • AI alerts require human review</footer>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
