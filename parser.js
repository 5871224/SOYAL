export const RECORD_SIZE = 100;

export const KNOWN_OFFSETS = {
  0:'Length',1:'Function Code',2:'Source Node',3:'Second',4:'Minute',5:'Hour',6:'Weekday',7:'Day',8:'Month',9:'Year',
  10:'Message Source',11:'User Address Hi',12:'User Address Lo',13:'Sub Code',14:'Sub Function',15:'Extension Code',16:'User Level',
  19:'Door Number',31:'XOR Checksum',32:'SUM Checksum',
  79:'Recorded Second',80:'Recorded Minute',81:'Recorded Hour',82:'Recorded Weekday',83:'Recorded Day',84:'Recorded Month',85:'Recorded Year',
  96:'Controller Node',98:'Message Type'
};

// 僅列入已由公開 SOYAL 文件/範例可高可信辨識的常見碼；未知碼保留 Mxx。
export const FUNCTION_CODES = {
  0x0B:'Normal Access by Tag',
  0x10:'Egress',
  0x23:'Enter Auto Door Open Procedure',
  0x24:'Exit Auto Door Open Procedure',
  0x27:'Access by fingerprint / finger vein'
};

const pad = n => String(n).padStart(2,'0');

export function formatTimestamp(r, offset=3){
  const s=r[offset], m=r[offset+1], h=r[offset+2], d=r[offset+4], mo=r[offset+5], y=r[offset+6];
  if ([s,m,h,d,mo,y].some(v=>v===undefined)) return '';
  if (s>59||m>59||h>23||d<1||d>31||mo<1||mo>12) return '';
  return `${2000+y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function parseRecord(record, index=0, fileName=''){
  if (!(record instanceof Uint8Array) || record.length!==RECORD_SIZE) throw new Error('Record 必須正好 100 bytes');
  const userAddress=(record[11]<<8)|record[12];
  const functionCode=record[1];
  return {
    index,
    fileName,
    raw:record,
    validLength:record[0]===0x21,
    length:record[0],
    functionCode,
    functionHex:`M${functionCode.toString(16).toUpperCase().padStart(2,'0')}`,
    functionName:FUNCTION_CODES[functionCode]||'未識別事件',
    node:record[2],
    eventTime:formatTimestamp(record,3),
    messageSource:record[10],
    userAddress,
    subCode:record[13],
    subFunction:record[14],
    extensionCode:record[15],
    userLevel:record[16],
    door:record[19],
    xorChecksum:record[31],
    sumChecksum:record[32],
    recordedTime:formatTimestamp(record,79),
    controllerNode:record[96],
    messageType:record[98]
  };
}

export function parseBuffer(buffer,fileName=''){
  const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);
  const records=[];
  const errors=[];
  const count=Math.floor(bytes.length/RECORD_SIZE);
  for(let i=0;i<count;i++){
    const r=bytes.slice(i*RECORD_SIZE,(i+1)*RECORD_SIZE);
    try{records.push(parseRecord(r,i+1,fileName));}catch(err){errors.push({index:i+1,error:String(err)});}
  }
  if(bytes.length%RECORD_SIZE) errors.push({index:count+1,error:`尾端剩餘 ${bytes.length%RECORD_SIZE} bytes，不足 100 bytes`});
  return {records,errors,totalBytes:bytes.length};
}
