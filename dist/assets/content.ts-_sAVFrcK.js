(function(){(()=>{const h=/twitter\.com$/.test(window.location.hostname)||/x\.com$/.test(window.location.hostname),m=h;(()=>{const t=`
      .smart-contract-highlighted {
        text-decoration: none !important;
        color: #BFAFFF !important;
        border-bottom: 2px dashed #7B4FFF !important;
        background: rgba(123,79,255,0.08) !important;
        cursor: pointer !important;
        border-radius: 3px !important;
        transition: background 0.2s;
      }
      .smart-contract-menu {
        position: absolute;
        background: #18122B;
        color: #fff;
        border: 1px solid #2D1B4A;
        border-radius: 8px;
        padding: 12px;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 4px 12px #7B4FFF33;
        min-width: 200px;
        max-width: 280px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .smart-contract-menu .menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #2D1B4A;
      }
      .smart-contract-menu .network-badge {
        background: #7B4FFF;
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
      }
      .smart-contract-menu .address-display {
        font-family: monospace;
        font-size: 12px;
        color: #ccc;
        word-break: break-all;
      }
      .smart-contract-menu .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }
      .smart-contract-menu .label {
        color: #888;
      }
      .smart-contract-menu .value {
        color: #fff;
        font-weight: 500;
      }
      .smart-contract-menu .menu-buttons {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }
      .smart-contract-menu button {
        background: #4CAF50;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        flex: 1;
      }
      .smart-contract-menu button.buy {
        background: #ff5722;
      }
      .smart-contract-menu button.details {
        background: #607d8b;
      }
      .smart-contract-menu button.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .smart-contract-menu button.copy {
        background: #2196F3;
      }
      .smart-contract-menu button.close-btn {
        position: absolute;
        top: 4px;
        right: 8px;
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 16px;
        height: 16px;
        flex: none;
      }
    `,n=document.createElement("style");n.textContent=t,document.head.appendChild(n)})();let u=null;const M=t=>/^[1-9A-HJ-NP-Za-km-z]{40,50}$/.test(t)?"Solana":/^0x[a-fA-F0-9]{40}$/.test(t)?"EVM":/^[0-9a-fA-F]{48}$/.test(t)?"TON":"Unknown",B=t=>t.length<=12?t:`${t.slice(0,6)}...${t.slice(-6)}`,C={solana:/[1-9A-HJ-NP-Za-km-z]{40,50}/g,evm:/0x[a-fA-F0-9]{40}/g,ton:/[0-9a-fA-F]{48}/g},_=(t,n)=>{var o;return((o={solana:["11111111111111111111111111111111","So11111111111111111111111111111111111111112","TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"],evm:["0x0000000000000000000000000000000000000000","0x1111111111111111111111111111111111111111"],ton:["0000000000000000000000000000000000000000000000000000000000000000"]}[n])==null?void 0:o.includes(t))||!1},y=t=>t==null?"--":Math.abs(t)>=1e6?(t/1e6).toFixed(1)+"M":Math.abs(t)>=1e3?(t/1e3).toFixed(1)+"K":t.toLocaleString(),I=t=>{if(!t||t<=0)return"--";const n=t>1e12?t:t*1e3,e=Date.now()-n;if(e<0)return"just now";const o=Math.floor(e/(1e3*60)),r=Math.floor(o/60),c=Math.floor(r/24);return c>0?`${c}d ${r%24}h ago`:r>0?`${r}h ${o%60}m ago`:o>0?`${o}m ago`:"just now"},O=new Set,R=t=>{const n=M(t),e=B(t),o=document.createElement("div");o.className="smart-contract-menu",o.style.background="#1a1a1a",o.style.border="1px solid #333",o.style.boxShadow="0 4px 12px rgba(123, 79, 255, 0.2)",o.innerHTML=`
      <!-- no close btn -->
      <div class="menu-header" style="background: linear-gradient(to right, #1a1a1a, #2a2a2a); border-bottom: 1px solid #7B4FFF; padding:4px 0;">
        <span style="color: #fff; font-weight:600; font-size:14px;">Smart Contract</span>
        <span class="network-badge" style="background: #7B4FFF; color: #fff;">${n}</span>
      </div>
      <div class="address-display" style="color: #ccc; font-family: monospace;">${e}</div>
      <div class="analysis-section p-2" style="min-width:180px;">
        <div class="info-row"><span class="label">Loading...</span></div>
      </div>
      <div class="menu-buttons flex gap-2 mt-2">
        <button class="copy" style="background: #7B4FFF;">Copy</button>
        <button class="buy disabled" style="background: #ff5722;">Buy</button>
        <button class="details disabled" style="background: #607d8b;">Details</button>
      </div>
    `;const r=o.querySelector(".copy"),c=o.querySelector(".buy"),i=o.querySelector(".details");return r.addEventListener("click",()=>{navigator.clipboard.writeText(t),r.textContent="Copied!",setTimeout(()=>{r.textContent="Copy"},1e3)}),c.addEventListener("click",()=>{const d=c.getAttribute("data-url");d&&window.open(d,"_blank")}),i.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"CONTRACT_CLICKED",address:t,contractType:n.toLowerCase()}),f()}),o.addEventListener("mouseenter",()=>{}),o.addEventListener("mouseleave",()=>{f()}),o.setAttribute("data-address",t.toLowerCase()),o},q=(t,n)=>{console.log("[Content] showMenu for",n),f();const e=R(n);document.body.appendChild(e);const o=t.getBoundingClientRect(),r=e.getBoundingClientRect();let c=o.left+window.scrollX,i=o.bottom+window.scrollY+4;c+r.width>window.innerWidth&&(c=window.innerWidth-r.width-10),i+r.height>window.innerHeight+window.scrollY&&(i=o.top+window.scrollY-r.height-4),e.style.left=`${c}px`,e.style.top=`${i}px`,u=e},f=()=>{u&&(u.remove(),u=null)};document.addEventListener("scroll",f),document.addEventListener("click",t=>{u&&!u.contains(t.target)&&f()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&f()});const T=(t,n)=>{const e=document.createElement("span");return e.textContent=t,e.style.cursor="pointer",e.style.borderBottom="1px dashed #4CAF50",e.style.padding="1px 2px",e.style.borderRadius="3px",e.style.transition="background 0.2s",e.classList.add("smart-contract-highlighted"),e.setAttribute("data-contract-type",n),e.setAttribute("data-contract-address",t),e.addEventListener("mouseenter",()=>{e.style.background="rgba(76,175,80,0.1)",q(e,t),console.log("[Content] Hover on address:",t);const o=t.toLowerCase();console.log("[Content] send CONTRACT_ANALYZE",t),chrome.runtime.sendMessage({type:"CONTRACT_ANALYZE",address:t,contractType:n}),O.add(o)}),e.addEventListener("mouseleave",()=>{e.style.background="transparent";const o=300,r=u;setTimeout(()=>{u===r&&u&&!u.matches(":hover")&&f()},o)}),e},v=()=>{if(!m)return;console.log("🔍 Starting page scan...");const t=document.querySelectorAll("[data-address], [data-contract], [data-token], code, pre, .contract-address, .address, .token-address, .contract, span, div");console.log(`🔍 Found ${t.length} elements to scan`);let n=0;t.forEach((e,o)=>{const r=e.textContent||"";Object.entries(C).forEach(([c,i])=>{if(h&&c!=="solana")return;const d=r.match(i);d&&d.forEach(a=>{if(_(a,c))console.log(`🚫 Skipped system address: ${a}`);else{console.log(`🎯 Highlighting ${c} address: ${a}`);const p=T(a,c),l=r.replace(a,p.outerHTML);e.innerHTML=l,n++}})})}),console.log(`🎉 Scan complete! Found ${n} contracts to highlight`)};chrome.runtime.onMessage.addListener(t=>{var n,e,o,r,c,i,d,a,p,l,x;if(console.log("📨 Received message:",t),t.type==="SCAN_PAGE")m&&(console.log("🚀 Starting scan from message..."),v());else if(t.type==="CONTRACT_ANALYSIS_READY"){const{address:k,analysis:s}=t;console.log("[Content] CONTRACT_ANALYSIS_READY for",k,s);const b=document.querySelector(`.smart-contract-menu[data-address="${k.toLowerCase()}"]`);if(b||console.warn("[Content] Menu not found for address",k),b){const S=b.querySelector(".analysis-section");if(S){const N=(n=s==null?void 0:s.tokenInfo)==null?void 0:n.price,D=(e=s==null?void 0:s.tokenInfo)==null?void 0:e.marketCap,H=(o=s==null?void 0:s.tokenInfo)==null?void 0:o.holder_count,z=(r=s==null?void 0:s.tokenInfo)==null?void 0:r.bundlers,j=(c=s==null?void 0:s.tokenInfo)==null?void 0:c.open_timestamp,L=(i=s==null?void 0:s.securityInfo)==null?void 0:i.status,F=(d=s==null?void 0:s.securityInfo)==null?void 0:d.score;S.innerHTML=`
            <div class="info-row"><span class="label">Price:</span><span class="value">${N!==void 0?`$${N.toFixed(6)}`:"--"}</span></div>
            <div class="info-row"><span class="label">MCap:</span><span class="value">${y(D)}</span></div>
            <div class="info-row"><span class="label">Holders:</span><span class="value">${y(H)}</span></div>
            <div class="info-row"><span class="label">Bundlers:</span><span class="value">${y(z)}</span></div>
            <div class="info-row"><span class="label">Created:</span><span class="value">${I(j)}</span></div>
            ${L?`<div class="info-row"><span class="label">Security:</span><span class="value">${L} ${F?`(${F})`:""}</span></div>`:""}
          `;const A=b.querySelector(".buy"),$=b.querySelector(".details");if(A){let g=null;(a=s==null?void 0:s.tokenInfo)!=null&&a.link&&typeof s.tokenInfo.link=="string"?g=s.tokenInfo.link:(l=(p=s==null?void 0:s.tokenInfo)==null?void 0:p.link)!=null&&l.buy_url?g=s.tokenInfo.link.buy_url:(x=s==null?void 0:s.tokenInfo)!=null&&x.address&&(g=`https://dexscreener.com/search?q=${s.tokenInfo.address}`),g&&(A.setAttribute("data-url",g),A.classList.remove("disabled"))}$&&$.classList.remove("disabled")}}}}),m&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",v):v());const E=(t,n=[])=>(t.nodeType===Node.TEXT_NODE?n.push(t):t.nodeType===Node.ELEMENT_NODE&&t.childNodes.forEach(e=>E(e,n)),n),w=t=>{if(t.classList.contains("smart-contract-processed"))return;t.classList.add("smart-contract-processed");const n=E(t);if(n.length===0)return;const e=n.map(a=>a.textContent).join("");if(!e)return;const o=[];if(Object.entries(C).forEach(([a,p])=>{if(h&&a!=="solana")return;let l;const x=new RegExp(p.source,"g");for(;(l=x.exec(e))!==null;)a==="solana"&&(l[0].length<32||l[0].length>50)||o.push({start:l.index,end:l.index+l[0].length,value:l[0],addrType:a})}),o.length===0)return;o.sort((a,p)=>a.start-p.start);const r=[];let c=0;for(const a of o)a.start>c&&r.push({type:"text",value:e.slice(c,a.start)}),r.push({type:"address",value:a.value,addrType:a.addrType}),c=a.end;c<e.length&&r.push({type:"text",value:e.slice(c)}),n.forEach(a=>{a.parentNode&&a.parentNode.removeChild(a)});const i=document.createDocumentFragment();r.forEach(a=>{if(a.type==="text")i.appendChild(document.createTextNode(a.value));else{const p=T(a.value,a.addrType);i.appendChild(p)}});let d=t;n[0]&&n[0].parentNode&&n[0].parentNode!==t&&(d=n[0].parentNode),d.insertBefore(i,d.firstChild)};m&&(()=>{if(!m||!h)return;document.querySelectorAll('[data-testid="tweetText"]').forEach(n=>{w(n)}),new MutationObserver(n=>{n.forEach(e=>{e.addedNodes.forEach(o=>{if(o.nodeType!==Node.ELEMENT_NODE)return;const r=o;r.matches&&r.matches('[data-testid="tweetText"]')?w(r):r.querySelectorAll&&r.querySelectorAll('[data-testid="tweetText"]').forEach(c=>{w(c)})})})}).observe(document.body,{childList:!0,subtree:!0})})()})();
})()
