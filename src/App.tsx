// @ts-nocheck
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import veilMark from './assets/veil-mark.png';
import rabbySymbol from './assets/rabby-symbol.png';
import { exchangeOutput } from './lib/finance';
import { publicConfig } from './lib/env';
import { readEvmBalances } from './lib/evm-balances';
let requestRender = () => {};
let focusRestore = null;

const LOGO=`<img src="${veilMark}" alt="" />`;
const TOKEN_ADDRESS='0x56f316047b358c0d3c04540ff47ff4373df48ec0';
const COPY_ICON='<svg class="lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON='<svg class="lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const EXTERNAL_ICON='<svg class="lucide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
const SIDEBAR_ICONS={
 overview:'<svg class="lucide lucide-layout-dashboard sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
 portfolio:'<svg class="lucide lucide-chart-no-axes-combined sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16v5M16 14v7M20 10v11m2-18-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15M4 18v3M8 14v7"/></svg>',
 trade:'<svg class="lucide lucide-arrow-left-right sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 4 7l4 4M4 7h16m-4 14 4-4-4-4m4 4H4"/></svg>',
 automations:'<svg class="lucide lucide-workflow sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>',
 prefs:'<svg class="lucide lucide-settings sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
};
const S={w:'off',net:'Ethereum (mock)',chainId:null,address:'',walletName:'',provider:null,accountHandler:null,chainHandler:null,walletChooser:false,walletError:false,tokenCopied:false,balances:{status:'idle',data:null,error:''},hide:false,priv:null,view:'you',nav:false,
 t:{tok:'ETH',side:'buy',amt:'500',step:0,cat:'Crypto',mode:'Spot',tf:'1d',q:'',route:'shield'},m:{a:'ETH',tf:'1d',side:'buy',amt:'250',st:0,q:''},p:{thr:10000,st:0,v:'you'},pay:{mode:'send',asset:'USDC',amount:'100',recipient:'',step:0,copied:false},exchange:{from:'ETH',to:'USDC',amount:'1',step:0},wallet:{mode:'',asset:'USDC',amount:'100',step:0},pref:{auto:true,warn:true,proto:true}};
const TOK={ETH:3120.4,WBTC:94210.5,LINK:18.62,USDC:1};
const AST=[['ETH',9840,'#8b7cf6'],['USDC',6200,'#5b6a7a'],['WBTC',3900,'#c8c9d0'],['LINK',1100,'#3e3a73']];
const ACT=[['Swap 0.80 ETH → USDC','Shielded','Today 09:14'],['Shield 2,000 USDC','Shielded','Yesterday'],['Swap 500 USDC → LINK','Partially exposed','Nov 14'],['Public deposit 1.5 ETH','Public','Nov 12']];
const PS={Shielded:['s','Shielded','The balance and amounts sit inside a shielded pool. The public can verify that the transaction was valid, but not your balance or trade size. Deposits and withdrawals at the pool’s edge remain visible.'],
 Public:['r','Public','An ordinary on-chain transaction. Everyone can see the addresses and amounts. Moving funds into the shielded pool protects them from that point on; it does not make past activity private.'],
 'Partially exposed':['x','Partially exposed','Some detail can be inferred or was shared on purpose — for example timing links a deposit to a withdrawal, or you disclosed a fact to one party with a selective proof.'],
 Verifiable:['s','Verifiable','Anyone can independently check that this operation followed the public rules. Verifiable does not mean private: it says nothing about who can see amounts or addresses.'],
 'Demo only':['x','Demo only','This is a fictional interface record. No transaction was sent to a blockchain.']};
const $=n=>'$'+n.toLocaleString('en-US',{maximumFractionDigits:2});
const R=(v)=>S.hide?'<span class="red">••••••</span>':v;
const TOTAL=AST.reduce((a,b)=>a+b[1],0);
function shortAddress(address=S.address){return address?`${address.slice(0,6)}…${address.slice(-4)}`:''}
function networkName(chainId){const id=Number.parseInt(chainId,16);return ({1:'Ethereum',10:'Optimism',137:'Polygon',8453:'Base',42161:'Arbitrum',43114:'Avalanche',11155111:'Sepolia'})[id]||`EVM chain ${Number.isFinite(id)?id:'unknown'}`}
async function findRabbyProvider(){
 if(window.ethereum?.isRabby)return window.ethereum;
 return new Promise(resolve=>{
  let found=null;
  const announce=e=>{if(e.detail?.info?.rdns==='io.rabby')found=e.detail.provider};
  window.addEventListener('eip6963:announceProvider',announce);
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  window.setTimeout(()=>{window.removeEventListener('eip6963:announceProvider',announce);resolve(found)},250);
 });
}
function clearWallet(){
 const p=S.provider;
 if(p&&S.accountHandler)p.removeListener?.('accountsChanged',S.accountHandler);
 if(p&&S.chainHandler)p.removeListener?.('chainChanged',S.chainHandler);
 S.w='off';S.net='Ethereum (mock)';S.address='';S.walletName='';S.chainId=null;S.provider=null;S.accountHandler=null;S.chainHandler=null;S.balances={status:'idle',data:null,error:''};
}
async function refreshWalletBalances(){
 const {provider,address,chainId}=S;
 if(S.w!=='on'||!provider||!address||!chainId)return;
 S.balances={status:'loading',data:S.balances.data,error:''};requestRender();
 try{
  const data=await readEvmBalances(provider,address,chainId);
  if(S.provider!==provider||S.address.toLowerCase()!==address.toLowerCase()||S.chainId!==chainId)return;
  S.balances={status:'ready',data,error:''};
 }catch{
  if(S.provider!==provider||S.address.toLowerCase()!==address.toLowerCase()||S.chainId!==chainId)return;
  S.balances={status:'error',data:null,error:'Balances could not be read from this wallet network. Check the connection and try again.'};
 }
 requestRender();
}
async function connectWallet(kind){
 if(S.w==='connecting')return;
 S.walletChooser=false;S.walletError=false;S.w='connecting';requestRender();
 try{
  const provider=kind==='rabby'?await findRabbyProvider():window.ethereum;
  if(!provider)throw new Error('Wallet unavailable');
  const accounts=await provider.request({method:'eth_requestAccounts'});
  if(!accounts?.length)throw new Error('No account');
  S.provider=provider;S.walletName=kind==='rabby'?'Rabby':'Browser wallet';S.address=accounts[0];S.chainId=await provider.request({method:'eth_chainId'}).catch(()=>null);S.net=networkName(S.chainId);S.w='on';
  S.accountHandler=next=>{if(!next?.length){clearWallet();requestRender()}else{S.address=next[0];S.w='on';requestRender();refreshWalletBalances()}};
  S.chainHandler=next=>{S.chainId=next;S.net=networkName(next);requestRender();refreshWalletBalances()};
  provider.on?.('accountsChanged',S.accountHandler);provider.on?.('chainChanged',S.chainHandler);
  refreshWalletBalances();
 }catch{S.w='off';S.walletError=true}
 requestRender();
}
function tag(s){const p=PS[s];return `<span class="tag ${p[0]}">${s}</span>`}
function topbar(app){
 const links=[['overview','Overview'],['trade','Trade'],['automations','Automations'],['how','How it works'],['learn','Docs']];
 const lightInfo=['how','learn'].includes(location.hash.slice(1));
 return `<header class="top ${app?'app-top':''} ${lightInfo?'light-top':''}"><div class="w"><a class="logo" href="#overview" aria-label="Veil overview">${LOGO}</a>
 ${app?(S.w==='on'?`<span class="pill hide-m"><span class="dot"></span>${S.net}</span>`:`<select class="hide-m" style="width:190px" data-net aria-label="Demo network">${['Ethereum (mock)','Arbitrum (mock)','Base (mock)'].map(n=>`<option ${n==S.net?'selected':''}>${n}</option>`).join('')}</select>`):`<nav class="${S.nav?'open':''}">${links.map(l=>`<a href="#${l[0]}">${l[1]}</a>`).join('')}</nav>`}
 <span style="flex:${app?1:0}"></span>
 ${app?'':'<button class="btn menu" data-act="nav" aria-label="Menu">☰</button>'}
 <div class="top-actions"><button class="btn p wallet-connect" data-act="wallet" ${S.w=='connecting'?'disabled':''}>${S.w=='off'?'Connect wallet':S.w=='connecting'?'<span class="sp"></span>Connecting…':'● '+shortAddress()}</button></div>
 </div></header>`}
function walletDialog(){
 if(S.walletError)return `<div class="wallet-overlay" data-wallet-outside><section class="wallet-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-error-title"><button class="wallet-dialog-close" data-act="wallet-error-close" aria-label="Close">×</button><span class="eye">Wallet connection</span><h2 id="wallet-error-title">Couldn’t connect</h2><p>Check that your wallet is installed and unlocked, then try again.</p><div class="wallet-dialog-actions"><button class="btn p" data-act="wallet-retry">Choose wallet</button><button class="btn" data-act="wallet-error-close">Close</button></div></section></div>`;
 if(!S.walletChooser)return '';
 return `<div class="wallet-overlay" data-wallet-outside><section class="wallet-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title"><button class="wallet-dialog-close" data-act="wallet-close" aria-label="Close">×</button><h2 id="wallet-dialog-title">Choose a wallet</h2><p>Veil will only request your public account and network. It will not ask for a signature.</p><div class="wallet-options"><button class="wallet-option" data-wallet-choice="rabby"><span class="wallet-option-icon rabby-wallet-logo"><img src="${rabbySymbol}" alt="" /></span><span><b>Rabby Wallet</b><small>Connect with Rabby</small></span><span class="wallet-option-arrow">›</span></button><button class="wallet-option" data-wallet-choice="browser" ${window.ethereum?'':'disabled'}><span class="wallet-option-icon"><svg class="browser-wallet-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01m2 7h6m-6 3h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span><span><b>Browser wallet</b><small>Use the wallet selected by your browser</small></span><span class="wallet-option-arrow">›</span></button></div><small class="wallet-dialog-note">You can disconnect at any time. No transaction will be sent.</small></section></div>`;
}
const MK=[['ETH',3120.4,2.4],['WBTC',94210.5,-1.1],['LINK',18.62,4.9],['SOL',182.3,-3.2],['ARB',0.94,1.7]];
function ser(s,tf,chg){let x=0;for(const c of s+tf)x=(x*31+c.charCodeAt(0))%9973;const a=[];let v=0;for(let i=0;i<48;i++){x=(x*1103+12345)%65521;v+=(x/65521-.5)*2+chg*.04;a.push(v)}return a}
const CHARTS={};
const FEED={state:'loading',updated:0,available:0,assets:{}};
const API=publicConfig.apiBaseUrl||'https://data-api.binance.vision/api/v3';
const PAIRS={ETH:'ETHUSDT',WBTC:'WBTCUSDT',LINK:'LINKUSDT',SOL:'SOLUSDT',ARB:'ARBUSDT'};
const CHART_INTERVALS={'1h':'1h','1d':'1d','1w':'1w'};
function coinIcon(asset){const icons={
 ETH:'<path fill="#a99cff" d="M12 1.5 5.7 12 12 15.5 18.3 12 12 1.5Zm0 21 6.3-9-6.3 3.5L5.7 13.5l6.3 9Z"/>',
 WBTC:'<circle cx="12" cy="12" r="10.5" fill="#f7931a"/><path fill="#fff" d="M15.9 10.1c.3-1.8-1.1-2.7-3-3.3l.6-2.3-1.4-.4-.6 2.2-1.1-.3.6-2.2-1.4-.4L9 5.7l-2.6-.7-.4 1.5 1.1.3-1.6 6.1-.8 2.1 1.1.3-.7 2.9 1.4.4.7-2.4 1.1.3-.7 2.4 1.4.4.7-2.4c2.4.6 4.2.3 4.9-1.8.5-1.7-.1-2.7-1.4-3.3.9-.2 1.5-.8 1.7-1.8Zm-3 4.3c-.4 1.5-3.2.7-4.1.5l.7-2.6c.9.2 3.8.6 3.4 2.1Zm.4-4.3c-.4 1.3-2.7.7-3.5.5l.6-2.4c.8.2 3.3.5 2.9 1.9Z"/>',
 LINK:'<circle cx="12" cy="12" r="11" fill="#2a5ada"/><path d="m9.4 8.2 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5v-3Zm-3.8 6.6 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5v-3Zm7.6 0 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5v-3Z" fill="none" stroke="#fff" stroke-width="1.4"/>',
 SOL:'<circle cx="12" cy="12" r="11" fill="#17142e"/><path d="M7 7h11l-2 2H5l2-2Zm0 4h12l-2 2H5l2-2Zm0 4h11l-2 2H5l2-2Z" fill="#9b7cff"/><path d="M6 11h12l-2 2H5l1-2Zm1 4h11l-2 2H6l1-2Z" fill="#55d6b2"/>',
 ARB:'<circle cx="12" cy="12" r="11" fill="#213147"/><path fill="#78a9ff" d="m12 4 6.9 4v8L12 20l-6.9-4V8L12 4Zm0 2.2L7 9v6l5 2.8 5-2.8V9l-5-2.8Z"/><path fill="#fff" d="M10.8 8.4h2.3l3 5.2h-2.2l-.7-1.2h-2.3l.8-1.4h.7l-.5-.9-2 3.5H7.7l3.1-5.2Z"/>',
 USDC:'<circle cx="12" cy="12" r="11" fill="#2775ca"/><path fill="#fff" d="M12 4.4a7.6 7.6 0 1 0 0 15.2 7.6 7.6 0 0 0 0-15.2Zm.7 12v1h-1.4v-1c-1.5-.2-2.4-1.1-2.5-2.4h1.7c.1.7.6 1 1.5 1 .8 0 1.2-.3 1.2-.8 0-.4-.3-.6-1.6-.9-1.8-.4-2.6-1-2.6-2.3 0-1.1.9-2 2.3-2.2v-1h1.4v1c1.4.2 2.2 1 2.4 2.3h-1.7c-.1-.6-.5-.9-1.3-.9-.7 0-1.1.3-1.1.7s.3.6 1.5.9c1.9.4 2.7 1 2.7 2.3 0 1.2-.9 2.1-2.5 2.3Z"/>'
 };return `<span class="coin-icon coin-${asset.toLowerCase()}" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[asset]||`<circle cx="12" cy="12" r="11" fill="#494553"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">${asset[0]||'?'}</text>`}</svg></span>`}
function mockCandles(asset,interval,base,change){const vals=ser(asset,interval,change),mn=Math.min(...vals),mx=Math.max(...vals),unit=interval=='1h'?3600000:interval=='1d'?86400000:604800000;let prev=base*.98;return vals.map((v,i)=>{const close=base*(.98+((v-mn)/(mx-mn||1))*.04),open=prev,spread=base*.001*(.3+((i*17)%9)/10),row={time:Date.now()-(vals.length-1-i)*unit,open,high:Math.max(open,close)+spread,low:Math.min(open,close)-spread,close,volume:0};prev=close;return row})}
function money(n){return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function chart(asset,interval,base,change){const data=CHARTS[asset]?.[interval]||mockCandles(asset,interval,base,change),W=760,H=270,L=66,R=76,T=18,B=36,PW=W-L-R,PH=H-T-B,prices=data.flatMap(c=>[c.high,c.low,Number(base)]),min=Math.min(...prices),max=Math.max(...prices),pad=(max-min)*.08||Number(base)*.01,lo=min-pad,hi=max+pad,step=PW/data.length,bw=Math.max(2,Math.min(8,step*.62)),y=v=>T+(hi-v)/(hi-lo)*PH,x=i=>L+(i+.5)*step,lastCandle=data[data.length-1],pct=Number(change)||0;
 const grid=Array.from({length:5},(_,i)=>{const val=hi-(hi-lo)*i/4,yy=T+PH*i/4;return `<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" class="chart-gridline"/><text x="${W-R+8}" y="${yy+3}" class="chart-axis">${money(val)}</text>`}).join('');
 const candles=data.map((c,i)=>{const up=c.close>=c.open,yy1=y(c.high),yy2=y(c.low),bodyY=Math.min(y(c.open),y(c.close)),bodyH=Math.max(1,Math.abs(y(c.open)-y(c.close)));return `<g class="candle ${up?'up':'down'}" data-index="${i}"><line x1="${x(i)}" y1="${yy1}" x2="${x(i)}" y2="${yy2}"/><rect x="${x(i)-bw/2}" y="${bodyY}" width="${bw}" height="${bodyH}" rx="1"/></g>`}).join('');
 const markY=y(Number(base)),last=data.length-1,ticks=[0,.25,.5,.75,1].map(frac=>{const i=Math.round(last*frac),d=new Date(data[i].time),label=interval=='1h'?d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString([],{month:'short',day:'numeric'});return `<text x="${x(i)}" y="${H-8}" text-anchor="middle" class="chart-axis">${label}</text>`}).join('');
 const live=Boolean(CHARTS[asset]?.[interval]&&FEED.assets[asset]),feed=live?`Binance spot · refreshed ${new Date(FEED.updated).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`:FEED.state=='loading'?'Connecting to public market data…':'Sample chart · live feed unavailable';
 return `<div class="price-chart" data-chart data-candles="${encodeURIComponent(JSON.stringify(data))}" data-mark="${base}" data-low="${lo}" data-high="${hi}" data-left="${L}" data-top="${T}" data-plotw="${PW}" data-ploth="${PH}" data-interval="${interval}"><div class="chart-toolbar"><span class="chart-source ${live?'connected':''}"><i></i>${feed}</span><span class="chart-stats"><span class="chart-asset">${coinIcon(asset)}<b>${asset}</b></span><span class="chart-mark">MARK <b>${money(base)}</b></span><span class="chart-mark">C <b>${money(lastCandle.close)}</b></span><span class="chart-change ${pct>=0?'up':'down'}">24H ${pct>0?'+':''}${pct.toFixed(2)}%</span></span></div><div class="chart-readout" data-readout>Move over a candle for OHLC details</div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${asset} candlestick chart with price scale and dates">${grid}<line x1="${L}" y1="${markY}" x2="${W-R}" y2="${markY}" class="mark-line"/><rect x="${W-R+3}" y="${markY-9}" width="${R-6}" height="18" rx="9" class="mark-label-bg"/><text x="${W-R+8}" y="${markY+3}" class="mark-label">${money(base)}</text>${candles}<line data-cross x1="0" y1="${T}" x2="0" y2="${T+PH}" class="crosshair" style="display:none"/><circle data-point cx="0" cy="0" r="3" class="hover-point" style="display:none"/>${ticks}<g data-axis-date style="display:none"><rect data-axis-date-bg x="0" y="${H-25}" width="94" height="19" rx="9" class="axis-date-bg"/><text data-axis-date-text x="0" y="${H-12}" text-anchor="middle" class="axis-date-text"></text></g></svg><span class="price-tip" data-tip style="display:none"></span></div>`}
function mkt(){const m=S.m,c=MK.find(k=>k[0]==m.a),amt=parseFloat(m.amt)||0,fee=amt*.003,got=m.side=='buy'?(amt-fee)/c[1]:amt-fee,filtered=MK.filter(k=>k[0].toLowerCase().includes(m.q.trim().toLowerCase()));
return `<div class="mk" id="demo"><div class="mk-market-picker"><input id="market-search" data-market-q list="market-suggestions" value="${esc(m.q)}" placeholder="Search markets" aria-label="Search markets" autocomplete="off"><datalist id="market-suggestions">${MK.map(k=>`<option value="${k[0]}">`).join('')}</datalist></div><div class="mklist">${filtered.length?filtered.map(k=>`<button class="mkr ${k[0]==m.a?'on':''}" data-mk="${k[0]}"><span class="mkr-name">${coinIcon(k[0])}<b>${k[0]}</b></span><span class="num">${k[1].toLocaleString('en-US')}</span><small style="color:${k[2]>=0?'var(--ok)':'var(--rd)'}">${k[2]>0?'+':''}${k[2]}%</small></button>`).join(''):'<p class="mk-no-results">No supported markets match that search.</p>'}</div>
<div class="mkc"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div class="market-symbol">${coinIcon(c[0])}<b>${c[0]}</b> <span class="num" style="font-size:20px;margin-left:8px">${money(c[1])}</span></div><div class="seg">${['1h','1d','1w'].map(t=>`<button data-tf="${t}" class="${t==m.tf?'on':''}">${t}</button>`).join('')}</div></div>${chart(c[0],m.tf,c[1],c[2])}<div class="row"><span>Route preview</span><span class="demo">Market data only · no trading integration</span></div></div>
<div class="mko"><div class="seg" role="group"><button data-ms="buy" class="${m.side=='buy'?'on':''}">Buy</button><button data-ms="sell" class="${m.side=='sell'?'on':''}">Sell</button></div><label for="ma">Amount (USD)</label><input id="ma" data-mamt inputmode="decimal" value="${m.amt}"><div class="row"><span>You get</span><span class="num">${m.side=='buy'?got.toFixed(4)+' '+c[0]:'$'+got.toFixed(2)}</span></div><div class="row"><span>Fee (0.30%)</span><span class="num">$${fee.toFixed(2)}</span></div>${m.st==0?`<button class="btn p" style="width:100%;margin-top:12px" data-act="mgo" ${amt>0?'':'disabled'}>Review ${m.side}</button>`:m.st==1?`<button class="btn" disabled style="width:100%;margin-top:12px"><span class="sp"></span>Proving &amp; submitting…</button>`:`<div class="pop"><span class="tag s">Filled (simulated)</span><p>Nothing was sent to a blockchain.</p><button class="btn" data-act="mreset">New order</button></div>`}</div></div>`}
/* ---------- landing ---------- */
function landing(){
 return topbar(0)+`<main id="main" class="homepage">
<section class="hero"><div class="w"><div class="hc">
<h1>Your crypto, in a clearer view.</h1>
<p style="font-size:20px;color:var(--tx)">Understand your money. Make better moves. Automate your strategy.</p>
<div class="hero-actions"><button class="btn copy-token" data-act="copy-token" aria-label="${S.tokenCopied?'Veil token address copied':'Copy Veil token address'}" title="${S.tokenCopied?'Copied to clipboard':'Copy full address'}"><span class="token-chain">CA</span><span>0x56f3…8ec0</span>${S.tokenCopied?CHECK_ICON:COPY_ICON}</button><button class="pons-link buy-veil" type="button" disabled title="Buy link coming soon"><img src="https://www.denar.markets/tokens/PONS-logo.png" alt=""/><span>Buy VEIL on Pons</span>${EXTERNAL_ICON}</button></div></div>
${mkt()}</div></section>

<section class="lt"><div class="w ctr"><h2>Your financial workspace</h2><p style="max-width:660px">A single place to understand your crypto activity, with clear status labels for connected data and features still being built.</p>
<div class="g3" style="margin-top:24px">${[['Portfolio','Review sample holdings and connect an account.','portfolio'],['Market intelligence','Explore public Binance spot prices and charts.','markets'],['Trading','Preview the current simulated spot flow.','trade'],['Automations','Financial automation is not available yet.','automations'],['DeFi','DeFi portfolio connections are not available yet.','defi'],['Account activity','See clearly labeled sample activity.','activity']].map(a=>`<a class="card" href="#${a[2]}" style="display:block;text-decoration:none"><h3>${a[0]}</h3><p>${a[1]}</p><span class="tag ${['automations','defi'].includes(a[2])?'x':''}">${['automations','defi'].includes(a[2])?'Coming soon':'Explore'}</span></a>`).join('')}</div></div></section>
<section><div class="w ctr"><h2>What is connected today</h2><div class="card" style="overflow-x:auto;margin-top:20px"><table><tr><th>Area</th><th>Status</th><th>Details</th></tr><tr><td>Market prices</td><td><span class="tag s">Available</span></td><td>Public Binance spot data</td></tr><tr><td>Wallet</td><td><span class="tag x">Address only</span></td><td>Rabby or browser wallet connection; balances are not read</td></tr><tr><td>Trading</td><td><span class="tag x">Simulated</span></td><td>No orders or blockchain transactions are submitted</td></tr><tr><td>Automations & DeFi</td><td><span class="tag">Coming soon</span></td><td>No strategies or DeFi positions are connected</td></tr></table></div></div></section>

</main>`}
function howPage(){return topbar(0)+`<main id="main" class="info-page"><div class="w info-copy"><h1>How it works</h1><p class="info-lead">Veil brings crypto market information and account tools into one workspace, with clear labels for what is connected and what is still a demo.</p><section><h2>01 · Connect</h2><p>Connect Rabby or a browser wallet to share its public address. Veil does not read balances yet.</p></section><section><h2>02 · Understand</h2><p>Explore public Binance spot prices, charts, and clearly labeled sample portfolio views.</p></section><section><h2>03 · Make a move</h2><p>Trade and automation flows are previews only. Veil does not submit orders or run strategies yet.</p></section></div></main>`}
/* ---------- learn ---------- */
function learn(){
 const L=[['Why financial privacy matters','Your balance and history reveal your income, habits and risk. In a fully public ledger, anyone can follow them — and traders can copy or target your strategy.'],
 ['Transparency versus privacy','Open systems need public rules and checkable results. Individuals need room to keep their finances to themselves. Veil treats these as different layers, not opposites.'],
 ['How zero-knowledge proofs work','A proof lets you show a statement is true — “my balance is at least $10,000” — without revealing the balance. Anyone can check the proof; nobody learns the number.'],
 ['How shielded transactions work','Funds move into a shielded pool. Later spends come with a proof that they are valid and not double-spent, without linking to the original deposit publicly.'],
 ['What Veil can and cannot hide','Veil aims to protect balances, amounts and trading intent on routes that support it — today that is a prototype for crypto spot only. It cannot hide public deposits and withdrawals, contract code, the fact that proofs exist, or clues from timing when few people trade. Tokenized assets and perpetuals have no shielded execution yet, and a proof or private RPC alone does not make a trade private. It does not remove your legal obligations.']];
 return topbar(0)+`<main id="main" class="info-page"><div class="w info-copy"><h1>Docs</h1><p class="info-lead">Understand Veil’s concepts and current product limits.</p>${L.map(l=>`<section><h2>${l[0]}</h2><p>${l[1]}</p></section>`).join('')}</div></main>`}
/* ---------- app shell ---------- */
function shell(body,id){
 const items=[['overview','Overview'],['portfolio','Portfolio'],['trade','Trade'],['automations','Automations'],['prefs','Settings']];
 return topbar(1)+`<div class="app"><aside class="side" aria-label="Main navigation">${items.map(i=>`<a href="#${i[0]}" class="${i[0]==='prefs'?'side-settings':''}" aria-label="${i[1]}" title="${i[1]}">${SIDEBAR_ICONS[i[0]]}</a>`).join('')}</aside><main class="main" id="main">${body}</main></div>`}
function gate(){return `<div class="empty"><p>Connect a wallet to read balances on its selected network. Transaction flows remain simulated.</p><button class="btn p" data-act="wallet">Connect wallet</button></div>`}
function marketsPage(){return shell(`<h2>Markets</h2><p>Public Binance spot prices and sample candles where live market data is unavailable. The order panel is a simulation; it does not place trades.</p>${mkt()}`,'markets')}
function futurePage(title,description){return shell(`<h2>${title}</h2><p>${description}</p><div class="card" style="max-width:720px;margin-top:16px"><span class="tag x">Not available yet</span><h3 style="margin-top:14px">This area is being planned</h3><p>No ${title.toLowerCase()} data or actions are connected in this version of Veil.</p></div>` ,title==='Automations'?'automations':'defi')}
function privInd(){
 const k=S.priv;
 return `<div style="display:flex;gap:8px;flex-wrap:wrap">${Object.keys(PS).map(s=>`<button class="pill" data-priv="${s}" aria-expanded="${k==s}"><span class="dot ${PS[s][0]=='r'?'pub':PS[s][0]=='x'?'par':''}"></span>${s}</button>`).join('')}</div>${k?`<div class="pop"><b>${PS[k][1]}</b><p>${PS[k][2]}</p></div>`:'<p class="demo" style="margin-top:8px">Select a state to see what it means.</p>'}`}
function alloc(){return `<div class="bar">${AST.map(a=>`<i style="width:${a[1]/TOTAL*100}%;background:${a[2]}"></i>`).join('')}</div>${AST.map(a=>`<div class="row"><span><span class="dot" style="display:inline-block;background:${a[2]};margin-right:8px"></span>${a[0]}</span><span class="num">${R((a[1]/TOTAL*100).toFixed(1)+'%')}</span></div>`).join('')}`}
function actList(n){return ACT.slice(0,n).map(a=>`<div class="row"><span style="color:var(--tx)">${a[0]}<br><small class="demo">${a[2]}</small></span>${tag(a[1])}</div>`).join('')}
function onchainBalancePanel(){
 const state=S.balances;
 if(state.status==='loading')return `<div class="card"><span class="sp"></span>Reading on-chain balances from ${esc(S.net)}…<p class="demo" style="margin-top:10px">Read-only wallet requests. No signature or transaction is requested.</p></div>`;
 if(state.status==='error')return `<div class="card"><p>${state.error}</p><button class="btn p" data-act="refresh-balances">Try again</button></div>`;
 if(state.status==='idle'&&S.w==='on')return `<div class="card"><p>Balance refresh is ready for ${esc(S.net)}.</p><button class="btn p" data-act="refresh-balances">Read balances</button></div>`;
 if(!state.data)return `<div class="empty"><p>Connect a wallet to read this address’s on-chain balances.</p><button class="btn p" data-act="wallet">Connect wallet</button></div>`;
 const data=state.data;
 const rows=data.assets.map(asset=>{
  const amount=Number(asset.amount);
  const price=asset.symbol==='USDC'?1:FEED.assets[asset.symbol]?priceOf(asset.symbol):null;
  const usd=price===null?null:amount*price;
  return {asset,amount,price,usd};
 });
 const priced=rows.filter(row=>row.usd!==null);
 const total=priced.reduce((sum,row)=>sum+row.usd,0);
 const allPriced=rows.every(row=>row.amount===0||row.usd!==null);
 return `<div class="dgrid"><div class="card c3"><span class="demo">${allPriced?'Estimated balance':'Partial estimate'}</span><div class="big">${priced.length?R(money(total)):'Unavailable'}</div><small class="demo">${priced.length} of ${rows.length} assets priced</small></div><div class="card c3"><span class="demo">Wallet and network</span><div class="row"><span>Address</span><span class="num">${shortAddress()}</span></div><div class="row"><span>Network</span><span>${esc(S.net)}</span></div><button class="btn" data-act="refresh-balances" style="margin-top:10px">Refresh balances</button></div><div class="card c6"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><h3>On-chain assets</h3><span class="tag s">Read-only</span></div><table><tr><th>Asset</th><th>Balance</th><th>Indicative value</th></tr>${rows.map(({asset,amount,usd})=>`<tr><td>${coinIcon(asset.symbol)} ${asset.symbol}<small class="demo" style="display:block">${asset.name}</small></td><td class="num">${R(amount.toLocaleString('en-US',{maximumFractionDigits:asset.decimals>8?6:asset.decimals}))}</td><td class="num">${usd===null?'Price unavailable':R(money(usd))}</td></tr>`).join('')}</table><p class="demo" style="margin:12px 0 0">${data.failedTokens.length?`Could not read ${data.failedTokens.join(', ')} token balance(s). `:''}Balances are read from the connected wallet’s selected network. Veil checks the native asset plus a limited token list; other tokens are not discovered. USD values use public market prices when available and a $1 reference for USDC.</p>${!data.assets.some(asset=>asset.kind==='token')?'<p class="demo" style="margin-top:8px">ERC-20 balance reads are currently supported on Ethereum, Arbitrum One, and Base.</p>':''}</div></div>`;
}
function dash(){
 if(S.w!='on')return shell(`<h2>Overview</h2>${gate()}`,'app');
 return shell(`<h2>Overview</h2><p>Live balances for the connected address on ${esc(S.net)}.</p>${onchainBalancePanel()}<div class="card" style="margin-top:16px"><h3>Recent activity · sample</h3><p class="demo">Fictional examples, not wallet transaction history.</p>${actList(3)}</div>`,'app')}
const TM={Crypto:[['ETH',3120.4,2.4],['WBTC',94210.5,-1.1],['LINK',18.62,4.9],['SOL',182.3,-3.2],['ARB',0.94,1.7]],'Tokenized assets':[['TSLA',374.2,4.9],['AMZN',221.84,-3.9],['NFLX',96.12,5.3]]};
async function refreshMarketData(){
 const entries=await Promise.all(Object.entries(PAIRS).map(async([asset,symbol])=>{
  const tickerPromise=fetch(`${API}/ticker/24hr?symbol=${symbol}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('ticker unavailable');return r.json()}).catch(()=>null);
  const chartPromises=Object.entries(CHART_INTERVALS).map(async([ui,interval])=>{try{const r=await fetch(`${API}/klines?symbol=${symbol}&interval=${interval}&limit=60`,{cache:'no-store'});if(!r.ok)throw Error('candles unavailable');const rows=await r.json();return [ui,rows.map(k=>({time:Number(k[0]),open:Number(k[1]),high:Number(k[2]),low:Number(k[3]),close:Number(k[4]),volume:Number(k[5])}))]}catch{return [ui,null]}});
  const [ticker,...charts]=await Promise.all([tickerPromise,...chartPromises]);return {asset,ticker,charts};
 }));
 let live=0;FEED.assets={};
 for(const item of entries){if(!CHARTS[item.asset])CHARTS[item.asset]={};if(item.ticker){const price=Number(item.ticker.lastPrice),change=Number(item.ticker.priceChangePercent);if(Number.isFinite(price)){const rows=[...MK,...TM.Crypto].filter(r=>r[0]===item.asset);rows.forEach(r=>{r[1]=price;r[2]=change});FEED.assets[item.asset]=true;live++}}
  for(const [interval,candles] of item.charts)if(candles?.length)CHARTS[item.asset][interval]=candles;
 }
 FEED.available=live;FEED.state=live?'ready':'error';FEED.updated=Date.now();requestRender();
}
const PXX={ETH:3120.4,WBTC:94210.5,LINK:18.62,USDC:1};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function priceOf(asset){return asset==='USDC'?1:(MK.find(r=>r[0]===asset)?.[1]||PXX[asset]||1)}
function walletPage(){
 const w=S.wallet;
 let action='';
 if(w.mode&&w.step===1)action=`<div class="pop"><b>Review ${w.mode} · ${w.amount} ${w.asset}</b><p>${w.mode==='deposit'?'Deposits may be publicly visible on the source network.':'Withdrawals may reveal the destination address and amount.'} Mock review only.</p><div style="display:flex;gap:8px;margin-top:10px"><button class="btn p" data-act="wallet-confirm">Confirm demo ${w.mode}</button><button class="btn" data-act="wallet-cancel">Cancel</button></div></div>`;
 else if(w.mode&&w.step===2)action=`<div class="pop"><span class="tag s">${w.mode==='deposit'?'Deposit':'Withdrawal'} simulated</span><p>No transaction was created or sent to a network.</p><button class="btn" data-act="wallet-cancel">Done</button></div>`;
 else action=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn p" data-act="wallet-deposit">Deposit · mock</button><button class="btn" data-act="wallet-withdraw">Withdraw · mock</button></div>`;
 if(S.w!=='on')return shell(`<h2>Wallet</h2>${gate()}`,'wallet');
 return shell(`<h2>Wallet</h2><p>Read-only balances from the connected wallet’s selected network.</p>${onchainBalancePanel()}<div class="dgrid" style="margin-top:16px"><div class="card c3"><h3>Deposit or withdraw · demo</h3><p>These preview actions are simulated. No transaction will be sent.</p><label>Asset</label><select data-wallet-asset>${AST.map(a=>`<option ${w.asset===a[0]?'selected':''}>${a[0]}</option>`).join('')}</select><label>Amount</label><input data-wallet-amount inputmode="decimal" value="${esc(w.amount)}">${action}</div><div class="card c3"><h3>Account & recovery</h3><div class="row"><span>Wallet connection</span><span>Connected to ${S.walletName}</span></div><div class="row"><span>Account address</span><span>${shortAddress()}</span></div><div class="row"><span>Recovery setup</span><span class="tag x">Managed by connected wallet · not Veil</span></div><p class="demo" style="margin-top:10px">Veil never receives your seed phrase or private key.</p></div><div class="card c6"><h3>Activity</h3><p class="demo">Fictional examples, not wallet transaction history.</p>${actList(4)}</div></div>`,'wallet')
}
function payments(){
 const p=S.pay,valid=Number(p.amount)>0&&p.recipient.trim().length>=3;
 const form=p.step===1?`<div class="card" style="margin-top:14px"><h3>Review private payment · demo</h3>${[['Recipient',esc(p.recipient)],['Asset and amount',`${esc(p.amount)} ${p.asset}`],['Estimated fee','Not available · mock'],['Status','No private transfer route connected']].map(r=>`<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}<div class="pop"><b>Privacy and visibility</b><p>No sender, recipient, or amount is protected in this prototype. Deposits, withdrawals, timing, and network activity could still reveal clues.</p><span class="tag x">Experimental · no route</span></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn p" data-act="send-confirm">Confirm demo send</button><button class="btn" data-act="send-cancel">Back</button></div></div>`:p.step===2?`<div class="pop" style="margin-top:14px"><span class="sp"></span>Preparing a simulated transfer preview…</div>`:p.step===3?`<div class="pop" style="margin-top:14px"><span class="tag s">Demo transfer complete</span><p>No blockchain transaction was sent.</p><button class="btn" data-act="send-reset">New payment</button></div>`:`<div class="card" style="margin-top:14px"><h3>Send to a Veil account</h3><label for="recipient">Veil payment address or account</label><input id="recipient" data-recipient value="${esc(p.recipient)}" placeholder="veil1… or account name" autocomplete="off"><label for="payasset">Asset</label><select id="payasset" data-pay-asset>${AST.map(a=>`<option ${p.asset===a[0]?'selected':''}>${a[0]}</option>`).join('')}</select><label for="payamount">Amount</label><input id="payamount" data-pay-amount inputmode="decimal" value="${esc(p.amount)}"><div class="row"><span>Indicative value · sample</span><span>${money(Number(p.amount||0)*priceOf(p.asset))}</span></div><p class="demo" style="color:var(--rd)">${p.amount&&Number(p.amount)>0&&!valid?'Enter a recipient account to continue.':''}</p><button class="btn p" data-act="send-review" ${valid?'':'disabled'}>Review payment</button></div>`;
 const receive=`<div class="card" style="margin-top:14px"><h3>Receive assets</h3><p>Share this demo address for the prototype. It cannot receive funds.</p><div class="receive-layout"><div class="qr-mock" aria-label="Nonfunctional QR placeholder"><span>DEMO<br>ONLY</span></div><div class="receive-address"><span class="demo">VEIL PAYMENT ADDRESS · MOCK</span><code>veil1demo8m4k2p7xq9n3v6t</code><button class="btn" data-act="copy-address">${p.copied?'Copied demo address':'Copy demo address'}</button></div></div><div class="pop"><b>What may remain visible</b><p>Public deposits, withdrawals, wallet identity, timing, and network activity can reveal information. A private payment route is not integrated.</p></div></div>`;
 return shell(`<h2>Send / Receive</h2><p>Move assets between Veil accounts with a simple payment flow. Private P2P settlement is not implemented.</p><div class="seg" role="group"><button data-pay-mode="send" class="${p.mode==='send'?'on':''}">Send</button><button data-pay-mode="receive" class="${p.mode==='receive'?'on':''}">Receive</button></div><div class="g2" style="align-items:start;gap:16px;margin-top:14px"><div>${p.mode==='send'?form:receive}</div><div class="card"><h3>Private payment history</h3><p class="demo">Account-owner view · fictional examples</p>${actList(4)}<div class="pop"><b>Privacy status · experimental</b><p>Amount, sender, and recipient privacy depend on an implemented route. Network activity and timing may still reveal clues.</p></div></div></div>`,'payments')
}
function exchangePage(){
 const x=S.exchange,fromPrice=priceOf(x.from),toPrice=priceOf(x.to),amount=Number(x.amount)||0,feeUsd=amount*fromPrice*.003,output=exchangeOutput(amount,fromPrice,toPrice,.003),canQuote=x.from!==x.to&&amount>0;
 const detail=x.step===1?`<div class="pop"><b>Review exchange · demo</b><div class="row"><span>You exchange</span><span>${esc(x.amount)} ${x.from}</span></div><div class="row"><span>Estimated output</span><span>${output.toFixed(x.to==='USDC'?2:6)} ${x.to}</span></div><div class="row"><span>Fee · slippage estimate</span><span>${money(feeUsd)} · 0.50%</span></div><p>Confirming only records a demo status. No quote or blockchain transaction is sent.</p><div style="display:flex;gap:8px"><button class="btn p" data-act="exchange-confirm">Confirm demo exchange</button><button class="btn" data-act="exchange-cancel">Back</button></div></div>`:x.step===2?`<div class="pop"><span class="tag s">Exchange simulated</span><p>No assets were exchanged.</p><button class="btn" data-act="exchange-reset">New exchange</button></div>`:'';
 return shell(`<h2>Exchange</h2><p>Swap supported crypto assets within your Veil account. The quote and execution route are illustrative.</p><div class="g2" style="align-items:start;gap:16px"><div class="card"><div class="seg"><button class="on">Exchange</button></div><label for="exfrom">You pay</label><div class="g2" style="gap:8px"><input id="examount" data-ex-amount inputmode="decimal" value="${esc(x.amount)}"><select id="exfrom" data-ex-from>${AST.map(a=>`<option ${x.from===a[0]?'selected':''}>${a[0]}</option>`).join('')}</select></div><button class="btn" data-act="exchange-flip" style="margin:10px 0">↓ Switch assets</button><label for="exto">You receive · estimated</label><div class="g2" style="gap:8px"><input readonly value="${output.toFixed(x.to==='USDC'?2:6)}"><select id="exto" data-ex-to>${AST.map(a=>`<option ${x.to===a[0]?'selected':''}>${a[0]}</option>`).join('')}</select></div><div class="row"><span>Exchange rate · sample</span><span>1 ${x.from} ≈ ${(fromPrice/toPrice).toFixed(6)} ${x.to}</span></div><div class="row"><span>Fee · price impact</span><span>${money(feeUsd)} · 0.02%</span></div><div class="row"><span>Slippage tolerance</span><span>0.50%</span></div>${x.step===0?`<button class="btn p" style="margin-top:12px" data-act="exchange-review" ${canQuote?'':'disabled'}>Review exchange</button>`:''}${detail}</div><div class="card"><h3>Privacy preview</h3><p class="demo">No exchange route is connected.</p><div class="row"><span>Wallet identity</span>${tag('Public')}</div><div class="row"><span>Trade amount</span>${tag('Public')}</div><div class="row"><span>Settlement</span>${tag('Demo only')}</div><div class="pop"><b>Route status</b><p>Ordinary public-route expectations, not an integrated execution preview. A proof or private RPC alone does not make a transaction private.</p><span class="tag x">Private exchange · planned</span></div></div></div>`,'exchange')
}
const RN={shield:'Shielded route (concept)',rpc:'Private RPC',pub:'Public route'};
const RW={shield:[['Wallet identity','Partially exposed','Your address shows when funds enter or leave the pool, not on each trade.'],['Trade amount','Shielded','Kept inside the pool.'],['Market used','Partially exposed','Pool-level activity can hint at which markets are active.'],['Settlement','Verifiable','Anyone can check the proof against public rules.']],
 rpc:[['Wallet identity','Public','Your address signs the transaction.'],['Trade amount','Public','Visible on-chain once it settles. A private RPC only hides it before inclusion.'],['Pending order','Partially exposed','Hidden from the public mempool, but the RPC operator can see it.'],['Settlement','Verifiable','Standard on-chain settlement.']],
 pub:[['Wallet identity','Public','Your address is visible.'],['Trade amount','Public','Visible to everyone.'],['Pending order','Public','Visible in the mempool and open to front-running.'],['Settlement','Verifiable','Standard on-chain settlement.']]};
function trade(){
 const t=S.t,sup=t.cat=='Crypto'&&t.mode=='Spot',perp=t.mode=='Perpetuals',L=TM[t.cat].filter(k=>k[0].toLowerCase().includes(t.q.toLowerCase())),c=TM[t.cat].find(k=>k[0]==t.tok)||TM[t.cat][0],amt=parseFloat(t.amt)||0,fee=amt*.003,imp=.02+amt/5e6*100,out=t.side=='buy'?(amt-fee)/c[1]:amt-fee,bad=amt<=0||amt>TOTAL;
 const st=t.cat!='Crypto'?'Coming soon':perp?'Experimental':'Prototype · initial focus',rows=RW[t.route];
 let act;
 if(!sup)act='<button class="btn" disabled style="width:100%">Not available yet</button>';
 else if(S.w!='on')act='<button class="btn p" data-act="wallet" style="width:100%">Connect wallet to continue</button>';
 else if(t.step==0)act=`<button class="btn p" style="width:100%" data-act="review" ${bad?'disabled':''}>Review ${t.side}</button>`;
 else if(t.step==1)act=`<div class="pop"><b>Confirm ${t.side} ${$(amt)} of ${c[0]}?</b><p>Route: ${RN[t.route]}. The privacy preview describes this route, not a guarantee. Simulated; no signature requested.</p><div style="display:flex;gap:8px;margin-top:10px"><button class="btn p" data-act="confirm">Confirm</button><button class="btn" data-act="reset">Cancel</button></div></div>`;
 else if(t.step==2)act='<button class="btn" disabled style="width:100%"><span class="sp"></span>Submitting (simulated)…</button>';
 else act=`<div class="pop"><span class="tag s">Confirmed (simulated)</span>${[['Order',t.side+' '+c[0]],['Amount',$(amt)],['Fee',$(fee)],['Route',RN[t.route]],['Wallet identity',rows[0][1]],['Reference','demo-0x91ae…07']].map(r=>`<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}<p class="demo" style="margin-top:10px">Nothing was sent to any blockchain.</p><button class="btn" data-act="reset">New order</button></div>`;
 return shell(`<h2>Trade</h2><p>Spot and perpetual markets across crypto and tokenized assets.</p><div class="g2" style="align-items:start;gap:16px">
<div class="card"><div style="display:flex;gap:10px;flex-wrap:wrap"><div class="seg" role="group">${['Crypto','Tokenized assets'].map(k=>`<button data-cat="${k}" class="${t.cat==k?'on':''}">${k}</button>`).join('')}</div><div class="seg" role="group">${['Spot','Perpetuals'].map(k=>`<button data-mode="${k}" class="${t.mode==k?'on':''}">${k}</button>`).join('')}</div></div>
<label for="qs">Search assets</label><input id="qs" data-q value="${esc(t.q)}" placeholder="Search…" autocomplete="off">
<div style="margin-top:8px;border:1px solid var(--bd);border-radius:16px;overflow:hidden">${L.length?L.map(k=>`<button class="mkr ${k[0]==c[0]?'on':''}" data-mkt="${k[0]}"><span class="mkr-name">${coinIcon(k[0])}<b>${k[0]}</b></span><span class="num">${k[1].toLocaleString('en-US')}</span><small style="color:${k[2]>=0?'var(--ok)':'var(--rd)'}">${k[2]>0?'+':''}${k[2]}%</small></button>`).join(''):'<div class="empty" style="border:0">No assets match “'+esc(t.q)+'”.</div>'}</div>
<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:14px"><span class="demo">${sup?'Binance Spot public market data':'Sample chart · market mode unavailable'}</span><div class="seg">${['1h','1d','1w'].map(tf=>`<button data-ttf="${tf}" class="${t.tf==tf?'on':''}">${tf}</button>`).join('')}</div></div>${chart(c[0],t.tf,c[1],c[2])}
<div class="seg" role="group"><button data-side="buy" class="${t.side=='buy'?'on':''}">Buy</button><button data-side="sell" class="${t.side=='sell'?'on':''}">Sell</button></div>
<label for="am">Amount (USD)</label><input id="am" data-amt inputmode="decimal" value="${esc(t.amt)}" aria-describedby="er"><div id="er" class="demo" style="color:var(--rd)">${amt<=0?'Enter an amount above 0.':amt>TOTAL?'Above your demo balance.':''}</div>
<div class="row"><span>Market price · ${FEED.assets[c[0]]?'Binance Spot':'sample'}</span><span class="num">${money(c[1])}</span></div><div class="row"><span>Estimated output</span><span class="num">${t.side=='buy'?out.toFixed(4)+' '+c[0]:$(out)}</span></div><div class="row"><span>Fee (0.30%)</span><span class="num">${$(fee)}</span></div><div class="row"><span>Price impact</span><span class="num">${imp.toFixed(2)}%</span></div>
${perp?[['Leverage','Coming soon'],['Margin','Coming soon'],['Liquidation price','Coming soon']].map(r=>`<div class="row"><span>${r[0]}</span><span class="tag x">${r[1]}</span></div>`).join(''):''}
<div style="margin-top:14px">${act}</div></div>
<div class="card"><h3>Privacy preview</h3><p class="demo">What this route reveals, before you confirm. Simulated.</p>${sup?`<div class="seg" role="group" style="margin-bottom:8px">${[['shield','Shielded'],['rpc','Private RPC'],['pub','Public']].map(r=>`<button data-route="${r[0]}" class="${t.route==r[0]?'on':''}">${r[1]}</button>`).join('')}</div>${rows.map(r=>`<div class="row" style="align-items:flex-start"><span>${r[0]}<small class="demo" style="display:block;max-width:230px">${r[2]}</small></span>${tag(r[1])}</div>`).join('')}`:'<div class="empty">No route supports this market yet, so nothing is previewed. Veil won’t label it private until a route can back that up.</div>'}
<p class="demo" style="margin-top:10px">Labels describe the route, not a guarantee. A proof or private RPC alone does not make a trade private. Pool deposits and withdrawals are public, and timing can leave clues.</p></div></div>`,'trade')}
/* ---------- trade ---------- */
function tradeOld(){
 const t=S.t,amt=parseFloat(t.amt)||0,px=TOK[t.tok],fee=amt*.003,got=t.side=='buy'?(amt-fee)/px:(amt*px-fee);
 let body;
 if(t.step==3)body=`<div class="card"><span class="tag s">Confirmed (simulated)</span><h3 style="margin-top:12px">Receipt</h3>${[['Action',t.side+' '+t.tok],['Amount',$(amt)],['Fee',$(fee)],['Privacy','Shielded (demo)'],['Reference','demo-0x91ae…07']].map(r=>`<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}<p class="demo" style="margin-top:12px">Nothing was sent to any blockchain.</p><button class="btn" data-act="reset">New order</button></div>`;
 else body=`<div class="card"><div class="seg" role="group"><button data-side="buy" class="${t.side=='buy'?'on':''}">Buy</button><button data-side="sell" class="${t.side=='sell'?'on':''}">Sell</button></div>
<label for="tk">Token</label><select id="tk" data-tok>${Object.keys(TOK).map(k=>`<option ${k==t.tok?'selected':''}>${k}</option>`).join('')}</select>
<label for="am">Order amount (USD)</label><input id="am" data-amt inputmode="decimal" value="${t.amt}" aria-describedby="er">
<div id="er" class="demo" style="color:var(--rd)">${amt<=0?'Enter an amount above 0.':amt>TOTAL?'Above your demo balance.':''}</div></div>
<div class="card" style="margin-top:14px"><h3>Execution preview</h3>${[['Price (demo)',$(px)],['You get',t.side=='buy'?got.toFixed(4)+' '+t.tok:$(got)],['Estimated fee (0.30%)',$(fee)],['Execution','Protected submission · experimental'],['Privacy status',tag('Shielded')+' <span class="demo">simulated</span>']].map(r=>`<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}
<p class="demo" style="margin-top:10px">Pending-trade protection is a planned feature. Deposits and withdrawals at the pool edge stay public.</p>
${S.w!='on'?'<button class="btn p" data-act="wallet" style="width:100%">Connect wallet to continue</button>':t.step==0?`<button class="btn p" style="width:100%" data-act="review" ${amt<=0||amt>TOTAL?'disabled':''}>Review ${t.side}</button>`:t.step==1?`<div class="pop"><b>Confirm ${t.side} ${$(amt)} of ${t.tok}?</b><p>Simulated. No wallet signature is requested.</p><div style="display:flex;gap:8px;margin-top:10px"><button class="btn p" data-act="confirm">Confirm</button><button class="btn" data-act="reset">Cancel</button></div></div>`:'<button class="btn" disabled style="width:100%"><span class="sp"></span>Generating demo proof &amp; submitting…</button>'}</div>`;
 return shell(`<h2>Trade</h2><p>Interactive mock. <span class="tag x">Prototype</span></p><div style="max-width:520px">${body}</div>`,'trade')}
/* ---------- portfolio ---------- */
function portfolio(){
 if(S.w!='on')return shell('<h2>Portfolio</h2>'+gate(),'portfolio');
 return shell(`<h2>Portfolio</h2><p>On-chain holdings for ${shortAddress()} on ${esc(S.net)}. Veil reads balances but does not request transaction access.</p>${onchainBalancePanel()}`,'portfolio')}
function proofs(){
 const p=S.p,you=p.v=='you';
 const EX=[['Minimum portfolio value','Prove you hold at least a set amount without showing the exact balance.','Experimental'],['Asset ownership','Prove you own supported assets without revealing other holdings.','Experimental'],['Collateral eligibility','Prove your assets qualify as collateral for a venue or lender.','Coming soon'],['Trading performance','Prove returns over a period without exposing individual trades.','Coming soon']];
 const V=you?[['Portfolio value','$20,000'],['Eligible assets','$17,500'],['Claim: eligible assets exceed $10,000','True']]:[['Claim','Eligible assets exceed $10,000'],['Result','Proof valid ✓'],['Portfolio value','<span class="red">••••••</span>'],['Eligible amount','<span class="red">••••••</span>'],['Holdings','<span class="red">••••••</span>']];
 return shell(`<h2>Proofs</h2><p style="max-width:640px">Selective verification lets you prove one financial fact to a verifier without sharing the rest of your portfolio or history.</p>
<div class="g2" style="gap:16px;align-items:stretch">${EX.map(e=>`<div class="card"><span class="tag x">${e[2]}</span><h3 style="margin-top:12px">${e[0]}</h3><p style="margin:0">${e[1]}</p></div>`).join('')}</div>
<h3 style="margin:28px 0 12px">How a zero-knowledge proof works</h3>
<div class="g3">${[['1 · Private input','Your balances and holdings stay with you. The proof is built from them on your side.'],['2 · Public statement','A small claim anyone can check: “eligible assets exceed $10,000”.'],['3 · Verifier checks','The verifier learns the claim is true, and nothing about the exact amounts.']].map(a=>`<div class="card"><h3>${a[0]}</h3><p style="margin:0">${a[1]}</p></div>`).join('')}</div>
<div class="card" style="margin-top:28px"><h3 style="margin-top:0">Prove “eligible assets exceed $10,000”</h3><p>Fictional portfolio: $20,000, of which $17,500 is in assets this example treats as eligible.</p>
${p.st==0?'<button class="btn p" data-act="prove">Generate proof</button>':p.st==1?'<button class="btn" disabled><span class="sp"></span>Generating (simulated)…</button>':`<div class="seg" role="group" style="margin-bottom:8px"><button data-pv="you" class="${you?'on':''}">You see</button><button data-pv="ver" class="${you?'':'on'}">Verifier sees</button></div>${V.map(r=>`<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}<div style="margin-top:12px">${tag('Verifiable')} <button class="btn" data-act="pr" style="margin-left:8px">Start over</button></div>`}</div>
<div class="card" style="margin-top:16px"><h3>Verification history</h3><p class="demo">Example entries</p><table><tr><th>Claim</th><th>Verifier</th><th>Status</th></tr>${[['Portfolio ≥ $5,000','Lender A','Verified'],['Eligible assets > $10,000','Venue B','Verified'],['Asset held: ETH','Auditor C','Expired']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]=='Verified'?'<span class="tag s">Verified</span>':'<span class="tag">Expired</span>'}</td></tr>`).join('')}</table></div>
<p class="demo" style="margin-top:12px;max-width:640px">A proof does not make past public activity private, and the verifier still learns the claim you chose to prove and that you made it.</p>`,'proofs')}
/* ---------- proofs ---------- */
function proofsOld(){
 const p=S.p,ok=TOTAL>=p.thr;
 return shell(`<h2>Proofs</h2><p style="max-width:620px">A zero-knowledge proof shows a statement is true without revealing the data behind it. Anyone can verify it; nobody learns your exact balance.</p>
<div class="card" style="max-width:560px"><span class="tag x">Experimental · simulated</span><h3 style="margin-top:12px">Prove “I hold at least $${p.thr.toLocaleString()}”</h3>
<label for="th">Threshold (USD)</label><input id="th" type="range" min="1000" max="30000" step="1000" value="${p.thr}" data-thr>
<div class="row"><span>Verifier sees</span><span>“Balance ≥ $${p.thr.toLocaleString()}” · ${ok?'true':'cannot be proven'}</span></div><div class="row"><span>Verifier does not see</span><span class="red">••••••</span></div>
${p.st==0?`<button class="btn p" style="margin-top:12px" data-act="prove" ${ok?'':'disabled'}>Generate proof</button>${ok?'':'<p class="demo">Your demo balance is below this threshold.</p>'}`:p.st==1?'<button class="btn" disabled style="margin-top:12px"><span class="sp"></span>Generating…</button>':`<div class="pop"><span class="tag s">Publicly verifiable (simulated)</span><p>Proof id demo-7f21…aa — verified against public rules.</p><button class="btn" data-act="pr" style="margin-top:8px">Create another</button></div>`}</div>
<div class="card" style="margin-top:16px"><h3>Verification history</h3><p class="demo">Example entries</p><table><tr><th>Claim</th><th>Verifier</th><th>Status</th></tr>${[['Balance ≥ $5,000','Lender A','Verified'],['Balance ≥ $10,000','Venue B','Verified'],['Asset held: ETH','Auditor C','Expired']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]=='Verified'?'<span class="tag s">Verified</span>':'<span class="tag">Expired</span>'}</td></tr>`).join('')}</table></div>`,'proofs')}
function activity(){return shell(`<h2>Activity</h2><p>Account activity. Entries shown here are fictional demo records, not on-chain transactions.</p>${S.w!='on'?gate():`<div class="card">${actList(4)}</div>`}`,'activity')}
function prefs(){
 const T=[['auto','Hide balances by default'],['warn','Warn before public transactions'],['proto','Use protected execution when available']];
 return shell(`<h2>Settings</h2><p>Wallet connection, recovery readiness, and privacy preferences.</p><div class="card" style="max-width:560px;margin-bottom:16px"><h3>Wallet & account</h3><div class="row"><span>Status</span><span>${S.w=='on'?`Connected to ${S.walletName}`:'Not connected'}</span></div><div class="row"><span>Network</span><span>${S.net}</span></div><div class="row"><span>Account</span><span>${S.w=='on'?shortAddress():'No wallet connected'}</span></div><div class="row"><span>Recovery</span><span class="tag x">Managed by connected wallet</span></div><a class="btn" href="#wallet" style="display:inline-block;margin-top:12px">Wallet and recovery details</a><p class="demo" style="margin-top:10px">Connection shares your public address and selected network with this site. It does not grant transaction approval.</p></div><div class="card" style="max-width:560px"><h3>Privacy preferences</h3>${T.map(t=>`<div class="tgl"><span>${t[1]}</span><button class="sw ${S.pref[t[0]]?'on':''}" role="switch" aria-checked="${S.pref[t[0]]}" aria-label="${t[1]}" data-pref="${t[0]}"></button></div>`).join('')}<p class="demo" style="margin-top:12px">Veil will never ask for a seed phrase or private key.</p></div>`,'prefs')}
function footer(){
 const groups=[['Workspace',[['Overview','app'],['Portfolio','portfolio'],['Markets','markets'],['Trade','trade']]],['Manage',[['Automations','automations'],['DeFi','defi'],['Activity','activity'],['Settings','prefs']]],['Account',[['Wallet & recovery','wallet'],['Send / Receive','payments'],['Exchange','exchange']]],['Learn',[['Proofs','proofs'],['Product guide','learn']]]];
 return `<footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><a class="logo" href="#overview">${LOGO}VEIL</a><a class="footer-x" href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.4l7.3-8.4L2 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.5 3.9H5.7L17.8 20Z" fill="currentColor"/></svg></a></div><nav class="footer-nav" aria-label="Footer navigation">${groups.map(([title,links])=>`<div class="footer-column"><h3>${title}</h3>${links.map(([label,route])=>`<a href="#${route}">${label}</a>`).join('')}</div>`).join('')}</nav></div></footer>`;
}
/* ---------- router ---------- */
const PG={overview:landing,how:howPage,learn:learn,app:dash,wallet:walletPage,payments:payments,exchange:exchangePage,trade:trade,markets:marketsPage,automations:()=>futurePage('Automations','Financial automation is planned for a future phase.'),defi:()=>futurePage('DeFi','DeFi portfolio connections are planned for a future phase.'),portfolio:portfolio,proofs:proofs,activity:activity,prefs:prefs};
function pageMarkup(){const k=location.hash.slice(1)||'overview';return (PG[k]||landing)()+(k==='overview'?footer():'')+walletDialog();}
function go(f){f();requestRender()}

function installDelegatedHandlers(root){
root.addEventListener('pointermove',e=>{
 const wrap=e.target.closest('[data-chart]'),svg=e.target.closest('svg');if(!wrap||!svg)return;
 const rect=svg.getBoundingClientRect(),wrapRect=wrap.getBoundingClientRect(),W=760,H=270,px=(e.clientX-rect.left)/rect.width*W,py=(e.clientY-rect.top)/rect.height*H,left=Number(wrap.dataset.left),plotw=Number(wrap.dataset.plotw),top=Number(wrap.dataset.top),ploth=Number(wrap.dataset.ploth);
 if(!rect.width||px<left||px>left+plotw)return;
 const data=JSON.parse(decodeURIComponent(wrap.dataset.candles)),index=Math.max(0,Math.min(data.length-1,Math.floor((px-left)/plotw*data.length))),c=data[index],x=left+(index+.5)*plotw/data.length,closeY=top+(Number(wrap.dataset.high)-c.close)/(Number(wrap.dataset.high)-Number(wrap.dataset.low))*ploth;
 const line=wrap.querySelector('[data-cross]'),point=wrap.querySelector('[data-point]'),tip=wrap.querySelector('[data-tip]'),readout=wrap.querySelector('[data-readout]'),axisDate=wrap.querySelector('[data-axis-date]'),axisDateBg=wrap.querySelector('[data-axis-date-bg]'),axisDateText=wrap.querySelector('[data-axis-date-text]');
 line.setAttribute('x1',x);line.setAttribute('x2',x);line.style.display='';point.setAttribute('cx',x);point.setAttribute('cy',closeY);point.style.display='';
 const date=new Date(c.time).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const axisX=Math.max(left+47,Math.min(left+plotw-47,x));axisDateBg.setAttribute('x',axisX-47);axisDateText.setAttribute('x',axisX);axisDateText.textContent=date;axisDate.style.display='';
 readout.innerHTML=`<b>${date}</b><span>O ${money(c.open)}</span><span>H ${money(c.high)}</span><span>L ${money(c.low)}</span><span>C ${money(c.close)}</span>`;
 tip.textContent=money(c.close);tip.style.left=((rect.left-wrapRect.left)+(x/W*rect.width))+'px';tip.style.top=((rect.top-wrapRect.top)+(closeY/H*rect.height))+'px';tip.style.display='';
});
root.addEventListener('pointerout',e=>{
 const wrap=e.target.closest('[data-chart]');if(!wrap||wrap.contains(e.relatedTarget))return;
 wrap.querySelector('[data-cross]').style.display='none';wrap.querySelector('[data-point]').style.display='none';wrap.querySelector('[data-axis-date]').style.display='none';wrap.querySelector('[data-tip]').style.display='none';wrap.querySelector('[data-readout]').textContent='Move over a candle for OHLC details';
});
root.addEventListener('click',e=>{
 const b=e.target.closest('[data-act],[data-wallet-choice],[data-wallet-outside],[data-priv],[data-view],[data-side],[data-pref],[data-scroll],[data-mk],[data-tf],[data-ttf],[data-ms],[data-cat],[data-mode],[data-mkt],[data-route],[data-pv],[data-pay-mode]');if(!b)return;const d=b.dataset;
 if(b.hasAttribute('data-wallet-outside')){if(e.target===b)go(()=>{S.walletChooser=false;S.walletError=false});return}
 if(d.walletChoice)return connectWallet(d.walletChoice);
 if(d.scroll){e.preventDefault();document.getElementById(d.scroll).scrollIntoView({behavior:'smooth'});return}
 if(d.cat)return go(()=>{S.t.cat=d.cat;S.t.tok=TM[d.cat][0][0];S.t.step=0;S.t.q=''});
 if(d.mode)return go(()=>{S.t.mode=d.mode;S.t.step=0});
 if(d.mkt)return go(()=>{S.t.tok=d.mkt;S.t.step=0});
 if(d.route)return go(()=>{S.t.route=d.route;S.t.step=0});
 if(d.pv)return go(()=>S.p.v=d.pv);
 if(d.payMode)return go(()=>{S.pay.mode=d.payMode;S.pay.step=0});
 if(d.mk)return go(()=>{S.m.a=d.mk;S.m.st=0;S.m.q=''});
 if(d.tf)return go(()=>S.m.tf=d.tf);
 if(d.ttf)return go(()=>S.t.tf=d.ttf);
 if(d.ms)return go(()=>{S.m.side=d.ms;S.m.st=0});
 if(d.priv)return go(()=>S.priv=S.priv==d.priv?null:d.priv);
 if(d.view)return go(()=>S.view=d.view);
 if(d.side)return go(()=>S.t.side=d.side);
 if(d.pref)return go(()=>S.pref[d.pref]=!S.pref[d.pref]);
 const a=d.act;
 if(a=='nav')go(()=>S.nav=!S.nav);
 if(a=='refresh-balances')refreshWalletBalances();
 if(a=='hide')go(()=>S.hide=!S.hide);
 if(a=='wallet-deposit'||a=='wallet-withdraw')go(()=>{S.wallet.mode=a==='wallet-deposit'?'deposit':'withdraw';S.wallet.step=1});
 if(a=='wallet-confirm')go(()=>{ACT.unshift([`${S.wallet.mode==='deposit'?'Demo deposit':'Demo withdrawal'} ${S.wallet.amount} ${S.wallet.asset}`,'Demo only','Just now']);S.wallet.step=2});
 if(a=='wallet-cancel')go(()=>{S.wallet.mode='';S.wallet.step=0});
 if(a=='send-review')go(()=>S.pay.step=1);
 if(a=='send-cancel')go(()=>S.pay.step=0);
 if(a=='send-reset')go(()=>{S.pay.step=0;S.pay.recipient='';S.pay.amount='100'});
 if(a=='send-confirm'){S.pay.step=2;requestRender();setTimeout(()=>{ACT.unshift([`Demo send ${S.pay.amount} ${S.pay.asset} · ${S.pay.recipient}`,'Demo only','Just now']);S.pay.step=3;requestRender()},1100)}
 if(a=='copy-address'){const copied=navigator.clipboard?.writeText('veil1demo8m4k2p7xq9n3v6t');if(copied)copied.then(()=>{S.pay.copied=true;requestRender()}).catch(()=>{S.pay.copied=false;requestRender()});else{S.pay.copied=false;requestRender()}}
 if(a=='copy-token'){const copied=navigator.clipboard?.writeText(TOKEN_ADDRESS);if(copied)copied.then(()=>{S.tokenCopied=true;requestRender()}).catch(()=>{S.tokenCopied=false;requestRender()});else{S.tokenCopied=false;requestRender()}}
 if(a=='exchange-flip')go(()=>{[S.exchange.from,S.exchange.to]=[S.exchange.to,S.exchange.from];S.exchange.step=0});
 if(a=='exchange-review')go(()=>S.exchange.step=1);
 if(a=='exchange-confirm')go(()=>{const q=S.exchange;ACT.unshift([`Demo exchange ${q.amount} ${q.from} → ${q.to}`,'Demo only','Just now']);S.exchange.step=2});
 if(a=='exchange-cancel'||a=='exchange-reset')go(()=>S.exchange.step=0);
 if(a=='wallet'){if(S.w==='on'){clearWallet();requestRender()}else go(()=>{S.walletError=false;S.walletChooser=true})}
 if(a=='wallet-close'||a=='wallet-error-close')go(()=>{S.walletChooser=false;S.walletError=false});
 if(a=='wallet-retry')go(()=>{S.walletError=false;S.walletChooser=true});
 if(a=='mgo'){S.m.st=1;requestRender();setTimeout(()=>{S.m.st=2;requestRender()},1400)}
 if(a=='mreset')go(()=>S.m.st=0);
 if(a=='review')go(()=>S.t.step=1);
 if(a=='reset')go(()=>{S.t.step=0});
 if(a=='confirm'){S.t.step=2;requestRender();setTimeout(()=>{S.t.step=3;requestRender()},1500)}
 if(a=='prove'){S.p.st=1;requestRender();setTimeout(()=>{S.p.st=2;requestRender()},1400)}
 if(a=='pr')go(()=>S.p.st=0);
});
root.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.net!==undefined)S.net=t.value;
 if(t.dataset.tok!==undefined){S.t.tok=t.value;S.t.step=0}
 if(t.dataset.thr!==undefined){S.p.thr=+t.value;S.p.st=0}
 if(t.dataset.walletAsset!==undefined)S.wallet.asset=t.value;
 if(t.dataset.payAsset!==undefined)S.pay.asset=t.value;
 if(t.dataset.exFrom!==undefined){S.exchange.from=t.value;S.exchange.step=0}
 if(t.dataset.exTo!==undefined){S.exchange.to=t.value;S.exchange.step=0}
 requestRender()});
root.addEventListener('input',e=>{const t=e.target;
 if(t.dataset.marketQ!==undefined){S.m.q=t.value;const p=t.selectionStart;requestRender();const n=document.getElementById('market-search');n.focus();n.setSelectionRange(p,p)}
 if(t.dataset.q!==undefined){S.t.q=t.value;const p=t.selectionStart;requestRender();const n=document.getElementById('qs');n.focus();n.setSelectionRange(p,p)}
 if(t.dataset.mamt!==undefined){S.m.amt=t.value;S.m.st=0;const p=t.selectionStart;requestRender();const n=document.getElementById('ma');n.focus();n.setSelectionRange(p,p)}
 if(t.dataset.amt!==undefined){S.t.amt=t.value;S.t.step=0;const p=t.selectionStart;requestRender();const n=document.getElementById('am');n.focus();n.setSelectionRange(p,p)}
 if(t.dataset.recipient!==undefined){S.pay.recipient=t.value;requestRender()}
 if(t.dataset.payAmount!==undefined){S.pay.amount=t.value;requestRender()}
 if(t.dataset.exAmount!==undefined){S.exchange.amount=t.value;S.exchange.step=0;requestRender()}
 if(t.dataset.walletAmount!==undefined){S.wallet.amount=t.value;requestRender()}
 if(t.dataset.thr!==undefined){S.p.thr=+t.value;S.p.st=0;requestRender();const n=document.getElementById('th');n.focus()}});
}
function App(){
 const [,setVersion]=useState(0);
 const rootRef=useRef(null);
 requestRender=()=>{
   const root=rootRef.current;
   const el=document.activeElement;
   if(root&&el&&root.contains(el)&&el.matches('input[data-market-q],input[data-q],input[data-amt],input[data-mamt],input[data-recipient],input[data-pay-amount],input[data-ex-amount],input[data-wallet-amount]')) focusRestore={key:Object.keys(el.dataset).find(k=>['marketQ','q','amt','mamt','recipient','payAmount','exAmount','walletAmount'].includes(k)),selection:el.selectionStart};
   setVersion(v=>v+1);
 };
 useLayoutEffect(()=>{
   if(!focusRestore||!rootRef.current)return;
   const attr={marketQ:'data-market-q',q:'data-q',amt:'data-amt',mamt:'data-mamt',recipient:'data-recipient',payAmount:'data-pay-amount',exAmount:'data-ex-amount',walletAmount:'data-wallet-amount'}[focusRestore.key];
   const el=rootRef.current.querySelector('['+attr+']');
   if(el){el.focus();if(focusRestore.selection!=null)el.setSelectionRange(focusRestore.selection,focusRestore.selection)}
   focusRestore=null;
 });
 useEffect(()=>{
   const root=rootRef.current;if(!root)return;
   installDelegatedHandlers(root);
   const onHash=()=>{S.nav=false;S.priv=null;requestRender();window.scrollTo(0,0)};
   const onWalletKey=e=>{if(e.key==='Escape'&&(S.walletChooser||S.walletError)){S.walletChooser=false;S.walletError=false;requestRender()}};
   window.addEventListener('hashchange',onHash);
   window.addEventListener('keydown',onWalletKey);
   return ()=>{window.removeEventListener('hashchange',onHash);window.removeEventListener('keydown',onWalletKey)};
 },[]);
 useEffect(()=>{
   let busy=false;
   const load=async()=>{if(busy)return;busy=true;try{await refreshMarketData()}catch{FEED.state='error';FEED.available=0;FEED.updated=Date.now();requestRender()}finally{if(S.w==='on'&&S.balances.status!=='loading')await refreshWalletBalances();busy=false}};
   load();const timer=window.setInterval(load,60000);
   return ()=>window.clearInterval(timer);
 },[]);
 return <div ref={rootRef} dangerouslySetInnerHTML={{__html:pageMarkup()}}/>;
}
export default App;
