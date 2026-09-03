import {parseBuffer,KNOWN_OFFSETS} from './parser.js';

const $=s=>document.querySelector(s);
const fileInput=$('#fileInput'), pickBtn=$('#pickBtn'), dropZone=$('#dropZone'), body=$('#resultBody');
const toolbar=$('#toolbar'), resultSection=$('#resultSection'), emptyState=$('#emptyState');
const searchBox=$('#searchBox'), nodeFilter=$('#nodeFilter'), codeFilter=$('#codeFilter');
const dialog=$('#detailDialog'), hexGrid=$('#hexGrid'), detailSummary=$('#detailSummary');
let allRecords=[]; let allErrors=[]; let filesLoaded=0;

pickBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>loadFiles([...e.target.files]));
['dragenter','dragover'].forEach(n=>dropZone.addEventListener(n,e=>{e.preventDefault();dropZone.classList.add('drag')}));
['dragleave','drop'].forEach(n=>dropZone.addEventListener(n,e=>{e.preventDefault();dropZone.classList.remove('drag')}));
dropZone.addEventListener('drop',e=>loadFiles([...e.dataTransfer.files]));
searchBox.addEventListener('input',render); nodeFilter.addEventListener('change',render); codeFilter.addEventListener('change',render);
$('#closeDialog').addEventListener('click',()=>dialog.close());
$('#exportBtn').addEventListener('click',exportCsv);

async function loadFiles(files){
  const msgs=files.filter(f=>f.name.toLowerCase().endsWith('.msg'));
  for(const file of msgs){
    const parsed=parseBuffer(await file.arrayBuffer(),file.name);
    allRecords.push(...parsed.records); allErrors.push(...parsed.errors); filesLoaded++;
  }
  allRecords.sort((a,b)=>a.eventTime.localeCompare(b.eventTime)||a.fileName.localeCompare(b.fileName)||a.index-b.index);
  refreshFilters(); render();
  toolbar.hidden=false; resultSection.hidden=false; emptyState.hidden=true;
  $('#fileStat').textContent=`檔案 ${filesLoaded} 個`; $('#recordStat').textContent=`紀錄 ${allRecords.length} 筆`; $('#errorStat').textContent=`格式警告 ${allErrors.length} 個`;
}

function refreshFilters(){
  const nodes=[...new Set(allRecords.map(r=>r.node))].sort((a,b)=>a-b);
  nodeFilter.innerHTML='<option value="">全部 Node</option>'+nodes.map(n=>`<option>${n}</option>`).join('');
  const codes=[...new Map(allRecords.map(r=>[r.functionLabel,`${r.functionLabel}｜${r.functionName}`])).entries()]
    .sort((a,b)=>Number(a[0].slice(1))-Number(b[0].slice(1)));
  codeFilter.innerHTML='<option value="">全部事件碼</option>'+codes.map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join('');
}

function getFiltered(){
  const q=searchBox.value.trim().toLowerCase();
  return allRecords.filter(r=>{
    if(nodeFilter.value && String(r.node)!==nodeFilter.value)return false;
    if(codeFilter.value && r.functionLabel!==codeFilter.value)return false;
    const hay=[r.eventTime,r.node,r.door,r.userAddress,r.functionLabel,r.functionName,r.functionNameEn,r.recordedTime,r.fileName].join(' ').toLowerCase();
    return !q||hay.includes(q);
  });
}

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function render(){
  body.innerHTML=getFiltered().map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.eventTime)}</td><td>${r.node}</td><td>${r.door}</td><td>${r.userAddress}</td><td><code>${r.functionLabel}</code></td><td>${esc(r.functionName)}</td><td>${esc(r.recordedTime)}</td><td>${esc(r.fileName)}</td><td><button data-key="${allRecords.indexOf(r)}">HEX</button></td></tr>`).join('');
  body.querySelectorAll('button[data-key]').forEach(btn=>btn.addEventListener('click',()=>showDetail(allRecords[Number(btn.dataset.key)])));
}

function showDetail(r){
  detailSummary.innerHTML=[
    ['事件時間',r.eventTime],['Node',r.node],['門號',r.door],['使用者位址 (Address)',r.userAddress],
    ['事件碼',r.functionLabel],['事件中文名稱',r.functionName],['官方英文定義',r.functionNameEn||'—'],
    ['接收時間',r.recordedTime],['Controller Node',r.controllerNode],['Message Type',r.messageType],['來源檔',r.fileName]
  ].map(([k,v])=>`<div><small>${k}</small><br><strong>${esc(v)}</strong></div>`).join('');
  hexGrid.innerHTML=[...r.raw].map((v,i)=>`<div class="hex-byte ${KNOWN_OFFSETS[i]?'known':''}"><small>+${String(i).padStart(2,'0')} ${esc(KNOWN_OFFSETS[i]||'未確認')}</small><strong>${v.toString(16).toUpperCase().padStart(2,'0')}</strong><small>${v}</small></div>`).join('');
  dialog.showModal();
}

function exportCsv(){
  const rows=[['事件時間','Node','門號','使用者位址(Address)','事件碼','事件中文名稱','官方英文定義','接收時間','檔案'],...getFiltered().map(r=>[r.eventTime,r.node,r.door,r.userAddress,r.functionLabel,r.functionName,r.functionNameEn,r.recordedTime,r.fileName])];
  const csv='\uFEFF'+rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='soyal-msg.csv';a.click();URL.revokeObjectURL(a.href);
}
