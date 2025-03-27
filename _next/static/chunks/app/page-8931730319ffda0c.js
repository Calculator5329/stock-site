(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[974],{3792:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>d});var r=a(5155),l=a(2115),i=a(6766),n=a(4065),o=a(2502);o.t1.register(o.PP,o.kc,o.FN,o.No,o.hE,o.m_,o.s$);let s=["MSFT","META","AAPL","AMZN","GOOGL","TSLA","NFLX"];function d(){let[e,t]=(0,l.useState)([{ticker:"META",weight:33},{ticker:"AMZN",weight:33},{ticker:"GOOGL",weight:34}]),[a,o]=(0,l.useState)("2020-01-01"),[d,c]=(0,l.useState)("2024-12-31"),[m,u]=(0,l.useState)("1000"),[p,h]=(0,l.useState)("10"),[g,x]=(0,l.useState)("monthly"),[f,b]=(0,l.useState)(""),[j,v]=(0,l.useState)(null),[N,y]=(0,l.useState)(!1),k=(0,l.useRef)(null);(0,l.useEffect)(()=>{k.current&&(k.current.scrollTop=k.current.scrollHeight)},[e]),(0,l.useEffect)(()=>{w()},[]);let S=(a,r,l)=>{let i=[...e];i[a]={...i[a],[r]:l},t(i)},C=a=>{if(e.length>1){let r=[...e];r.splice(a,1),t(r)}},w=async()=>{if(y(!0),Math.round(100*e.reduce((e,t)=>e+t.weight,0))/100!=100){b("Ticker weights must add up to 100%. Please try again."),y(!1);return}b("");let t={};e.forEach(e=>{let{ticker:a,weight:r}=e;a&&null!=r&&(t[a]=Number(r)/100)});let r=await fetch("https://portfolio-backend-wj8j.onrender.com/portfolio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({portfolio:t,start_date:a,end_date:d,initial:Number(m),addition:Number(p),frequency:g})}),l=await r.json();console.log(l),v(l),y(!1)};return(0,r.jsxs)("main",{children:[(0,r.jsxs)("div",{className:"top-bar",children:[(0,r.jsx)("a",{href:"https://Calculator5329.github.io",target:"_blank",rel:"noopener noreferrer",className:"avatar-link",children:(0,r.jsx)("div",{className:"profile-avatar",children:(0,r.jsx)(i.default,{src:"".concat("/stock-site","/profile.png"),alt:"Me",fill:!0})})}),(0,r.jsx)("h1",{className:"top-title",children:"Portfolio Backtest"})]}),(0,r.jsxs)("div",{className:"portfolio-container",children:[(0,r.jsxs)("div",{className:"portfolio-form",children:[(0,r.jsx)("h2",{className:"sub-title",children:"Portfolio Options"}),(0,r.jsxs)("div",{className:"input-row",children:[(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{children:"Start Date"}),(0,r.jsx)("input",{type:"date",min:"1970-01-01",max:"2024-12-31",value:a,onChange:e=>o(e.target.value)})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{children:"End Date"}),(0,r.jsx)("input",{type:"date",min:"1970-01-01",max:"2024-12-31",value:d,onChange:e=>c(e.target.value)})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{children:"Initial Investment ($)"}),(0,r.jsx)("input",{type:"number",min:0,max:1e7,value:m,onChange:e=>{let t=e.target.value;if(""===t){u("");return}let a=parseFloat(t);isNaN(a)?u(""):u((a=Math.max(0,Math.min(1e7,a))).toString())},placeholder:"(e.g. 1000)"})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{children:"Recurring Amount ($)"}),(0,r.jsx)("input",{type:"number",min:0,max:1e7,value:p,onChange:e=>{let t=e.target.value;if(""===t){h("");return}let a=parseFloat(t);isNaN(a)?h(""):h((a=Math.max(0,Math.min(1e7,a))).toString())},placeholder:"(e.g. 100)"})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{children:"Frequency"}),(0,r.jsxs)("select",{value:g,onChange:e=>x(e.target.value),children:[(0,r.jsx)("option",{value:"weekly",children:"Weekly"}),(0,r.jsx)("option",{value:"monthly",children:"Monthly"}),(0,r.jsx)("option",{value:"yearly",children:"Yearly"})]})]})]}),(0,r.jsx)("button",{onClick:w,className:"submit-btn",disabled:N,children:N?"Loading...":"Submit"})]}),(0,r.jsxs)("div",{className:"ticker-selection",ref:k,children:[(0,r.jsx)("h2",{className:"sub-title",children:"Portfolio"}),e.map((t,a)=>(0,r.jsxs)("div",{className:"form-group",style:{display:"flex",gap:"1.5rem",marginBottom:"0.5rem",borderRadius:"10px",padding:"1rem"},children:[(0,r.jsx)("input",{list:"ticker-options",value:t.ticker,onChange:e=>S(a,"ticker",e.target.value),className:"input-field",placeholder:"Search ticker..."}),(0,r.jsx)("datalist",{id:"ticker-options",children:s.map(e=>(0,r.jsx)("option",{value:e},e))}),(0,r.jsxs)("div",{style:{position:"relative",margin:0,padding:0},children:[(0,r.jsx)("input",{type:"number",min:0,max:100,value:t.weight,onChange:e=>{let t=parseFloat(e.target.value);isNaN(t)?S(a,"weight",0):S(a,"weight",Math.max(0,Math.min(100,t)))},className:"input-field",style:{paddingRight:"2rem",margin:0},placeholder:"%"}),(0,r.jsx)("span",{style:{position:"absolute",right:"0.5rem",top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#999"},children:"%"})]}),e.length>1&&(0,r.jsx)("button",{onClick:()=>C(a),style:{background:"none",border:"none",cursor:"pointer",padding:0,margin:0,fontSize:"1.5rem",pointerEvents:"auto"},"aria-label":"Remove ticker",children:"\uD83D\uDDD1️"})]},a)),f&&(0,r.jsx)("p",{style:{color:"red",margin:0,fontSize:"0.875rem"},children:f}),(0,r.jsx)("button",{onClick:()=>{t([...e,{ticker:"AAPL",weight:0}])},className:"submit-btn",children:"Add Ticker"})]})]}),(0,r.jsxs)("div",{className:"output_container",children:[j&&(0,r.jsx)("div",{className:"mt-6",style:{padding:"1rem",backgroundColor:"#050505",borderRadius:"10px",border:"1px solid #eaeaea",paddingLeft:"5rem",paddingRight:"5rem",height:"640px",width:"70%"},children:(0,r.jsx)(n.N1,{data:{labels:j.dates,datasets:[{label:"Portfolio Value Over Time",data:j.portfolio,fill:!1,borderColor:"rgb(76, 148, 76)",tension:.1,pointRadius:0}]},options:{responsive:!0,plugins:{legend:{position:"top"},title:{display:!1,text:"Portfolio Performance Over Time"}},scales:{y:{grid:{color:"rgba(255, 255, 255, 0.1)"},ticks:{callback:e=>"$"+e}},x:{grid:{color:"rgba(255, 255, 255, 0.1)"}}}}})}),(null==j?void 0:j.data)&&(0,r.jsxs)("div",{className:"portfolio-detail",children:[(0,r.jsx)("h2",{style:{margin:0,padding:"1rem 1.5rem",fontSize:"1.25rem",borderBottom:"1px solid #333",backgroundColor:"#181818"},children:"Performance Metrics"}),(0,r.jsx)("ul",{style:{listStyle:"none",margin:0,padding:0,fontSize:"0.95rem"},children:[{label:"Initial Value",format:"dollar"},{label:"Ending Value",format:"dollar"},{label:"Total Return",format:"percent"},{label:"CAGR",format:"percent"},{label:"Annualized Std Dev",format:"percent"},{label:"Best Year Return",format:"percent"},{label:"Worst Year Return",format:"percent"},{label:"Maximum Drawdown",format:"percent"},{label:"Sharpe Ratio",format:"number"},{label:"Sortino Ratio",format:"number"},{label:"Total Contributions",format:"dollar"},{label:"MWRR",format:"percent"}].map((e,t)=>{let a,{label:l,format:i}=e,n=j.data[t];return a="dollar"===i?"$".concat(Number(n).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})):"percent"===i?isNaN(n)?"N/A":"".concat((100*n).toFixed(2),"%"):isNaN(n)?"N/A":n.toFixed(4),(0,r.jsxs)("li",{style:{display:"flex",justifyContent:"space-between",padding:"0.75rem 1.5rem",backgroundColor:t%2==0?"#181818":"#151515",borderBottom:"1px solid #222"},children:[(0,r.jsx)("span",{style:{color:"#aaa"},children:l}),(0,r.jsx)("span",{style:{color:"#eee",fontWeight:500},children:a})]},l)})})]})]})]})}},5479:(e,t,a)=>{Promise.resolve().then(a.bind(a,3792))}},e=>{var t=t=>e(e.s=t);e.O(0,[647,396,441,684,358],()=>t(5479)),_N_E=e.O()}]);