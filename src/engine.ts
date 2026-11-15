import { cases, categories, type Case, type Locale, type Output } from './fixtures';
export interface Responses { format:'locale-crash/responses/1'; label:string; responses:{caseId:string;output:unknown}[]; }
export interface Result { caseId:string; pair:string; category:string; locale:string; status:'passed'|'failed'|'missing'; expected:Output; actual:unknown; differences:string[]; }
export interface Report { format:'locale-crash/report/1'; label:string; total:number; passed:number; failed:number; missing:number; pairFailures:number; results:Result[]; }

/** Strict grouping validation prevents partially parsed numeric strings. */
export function parseNumber(input:string, locale:Locale):number {
  const text=input.trim();
  const valid=locale==='tr-TR'?/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/:/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/;
  if(!valid.test(text)) throw new Error('Invalid numeric format for the selected locale.');
  const value=Number(locale==='tr-TR'?text.replaceAll('.','').replace(',','.'):text.replaceAll(',',''));
  if(!Number.isFinite(value) || Math.abs(value)>Number.MAX_SAFE_INTEGER) throw new Error('Number exceeds safe numeric bounds.');
  return value;
}
export function parseDate(input:string,locale:Locale):string {
  const match=input.match(locale==='tr-TR'?/^(\d{2})\.(\d{2})\.(\d{4})$/:/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if(!match) throw new Error('Use DD.MM.YYYY for tr-TR or MM/DD/YYYY for en-US.');
  const year=Number(match[3]),month=Number(match[locale==='tr-TR'?2:1]),day=Number(match[locale==='tr-TR'?1:2]);
  if(year<1000||year>9999||month<1||month>12) throw new Error('Invalid calendar date.');
  const date=new Date(Date.UTC(year,month-1,day));
  if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day) throw new Error('Invalid calendar date.');
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
const verbs:[string,string,string][]=[['send','gönder','gönderme'],['delete','sil','silme'],['publish','yayımla','yayımlama'],['share','paylaş','paylaşma'],['upload','yükle','yükleme'],['cancel','iptal et','iptal etme'],['invite','davet et','davet etme']];
/** This is a finite command grammar, deliberately not a general Turkish understanding model. */
export function parseCommand(input:string,locale:Locale):Output {
  const text=input.trim().replace(/[.!]$/,'');
  if(locale==='en-US'){
    for(const [action] of verbs){if(new RegExp(`^Do not ${action} the [A-Za-z ]+$`,'i').test(text))return{action,allowed:false};if(new RegExp(`^${action} the [A-Za-z ]+$`,'i').test(text))return{action,allowed:true};}
  }else{
    for(const [action,positive,negative]of verbs){if(text.endsWith(` ${negative}`)||text.endsWith(` ${negative}${negative.endsWith('ma')?'yın':'yin'}`))return{action,allowed:false};if(text.endsWith(` ${positive}`))return{action,allowed:true};}
  }
  throw new Error('Command is outside the reference parser’s documented grammar.');
}
export function reference(fixture:Case):Output{
  if(fixture.category==='numbers')return{amount:parseNumber(fixture.input,fixture.locale)};
  if(fixture.category==='dates')return{isoDate:parseDate(fixture.input,fixture.locale)};
  if(fixture.category==='casing')return{text:fixture.operation==='lower'?fixture.input.toLocaleLowerCase(fixture.locale):fixture.input.toLocaleUpperCase(fixture.locale)};
  return parseCommand(fixture.input,fixture.locale);
}
/** A deliberately broken baseline, not a model measurement. */
export function naive(fixture:Case):Output{
  if(fixture.category==='numbers'){const value=parseFloat(fixture.input.replaceAll(',',''));return{amount:Number.isFinite(value)?value:0};}
  if(fixture.category==='dates'){const parts=fixture.input.split(/[./]/);return{isoDate:`${parts[2]}-${parts[0]}-${parts[1]}`};}
  if(fixture.category==='casing')return{text:fixture.operation==='lower'?fixture.input.toLowerCase():fixture.input.toUpperCase()};
  const result=reference(fixture);return{action:result.action,allowed:!/^Do not /i.test(fixture.input)};
}
function canonical(value:unknown):string{
  if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;
  if(value&&typeof value==='object')return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical((value as Record<string,unknown>)[key])}`).join(',')}}`;
  return JSON.stringify(value)??'undefined';
}
/** Bound JSON supplied by files or the manual editor before comparison and export. */
function validateOutput(value:unknown):void{
  const pending:{value:unknown;depth:number}[]=[{value,depth:0}];let count=0;
  while(pending.length){
    const current=pending.pop()!;
    if(++count>20000||current.depth>32)throw new Error('Response output exceeds 20,000 JSON values or 32 nesting levels.');
    const item=current.value;
    if(item===null||typeof item==='string'||typeof item==='boolean')continue;
    if(typeof item==='number'){if(!Number.isFinite(item))throw new Error('JSON numbers must be finite.');continue;}
    if(typeof item!=='object')throw new Error('Response output must contain only JSON values.');
    const values=Array.isArray(item)?item:Object.values(item);
    for(const child of values)pending.push({value:child,depth:current.depth+1});
  }
}
export function score(input:Responses,fixtures:Case[]=cases):Report{
  for(const response of input.responses)validateOutput(response.output);
  const answers=new Map(input.responses.map(r=>[r.caseId,r.output]));
  const results:Result[]=fixtures.map(f=>{
    const present=answers.has(f.id),actual=answers.get(f.id),differences:string[]=[];
    if(present){
      if(!actual||typeof actual!=='object'||Array.isArray(actual))differences.push('Expected a JSON object.');
      else{
        const obj=actual as Record<string,unknown>;
        for(const key of Object.keys(f.expected))if(canonical(obj[key])!==canonical(f.expected[key]))differences.push(`${key}: expected ${JSON.stringify(f.expected[key])}, received ${JSON.stringify(obj[key])??'missing'}.`);
        for(const key of Object.keys(obj))if(!Object.prototype.hasOwnProperty.call(f.expected,key))differences.push(`Unexpected field: ${key}.`);
      }
    }
    return{caseId:f.id,pair:f.pair,category:f.category,locale:f.locale,status:!present?'missing':differences.length?'failed':'passed',expected:f.expected,actual:present?actual:null,differences};
  });
  return{format:'locale-crash/report/1',label:input.label,total:results.length,passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,missing:results.filter(r=>r.status==='missing').length,pairFailures:new Set(results.filter(r=>r.status==='failed').map(r=>r.pair)).size,results};
}
export function parseResponses(text:string,fixtures:Case[]=cases):Responses{
  if(text.length>2_000_000)throw new Error('Response JSON exceeds 2 MB.');
  const data:unknown=JSON.parse(text);if(!data||typeof data!=='object')throw new Error('Responses must be a JSON object.');
  const r=data as Record<string,unknown>;
  if(r.format!=='locale-crash/responses/1'||typeof r.label!=='string'||r.label.length<1||r.label.length>200||!Array.isArray(r.responses)||r.responses.length>10000)throw new Error('Invalid response format, label, or response count.');
  const known=new Set(fixtures.map(f=>f.id)),seen=new Set<string>();
  for(const entry of r.responses){if(!entry||typeof entry!=='object'||typeof entry.caseId!=='string'||!known.has(entry.caseId)||seen.has(entry.caseId)||!Object.prototype.hasOwnProperty.call(entry,'output'))throw new Error('Unknown, repeated, or malformed case response.');seen.add(entry.caseId);validateOutput(entry.output);}
  return{format:'locale-crash/responses/1',label:r.label,responses:r.responses.map(entry=>({caseId:entry.caseId,output:entry.output}))};
}
export function runBuiltin(policy:'reference'|'naive',fixtures:Case[]=cases):Report{return score({format:'locale-crash/responses/1',label:policy==='reference'?'Locale-aware reference parser':'Deliberately naive parser',responses:fixtures.map(f=>{try{return{caseId:f.id,output:policy==='reference'?reference(f):naive(f)};}catch(error){return{caseId:f.id,output:{error:error instanceof Error?error.message:'Reference parse failed.'}};}})},fixtures);}
export function csv(report:Report):string{
  const cell=(value:unknown)=>{const text=String(value);return`"${(/^[\u0000-\u0020]*[=+@-]/.test(text)?"'"+text:text).replaceAll('"','""')}"`;};
  return[['caseId','pair','category','locale','status','expected','actual','differences'],...report.results.map(r=>[r.caseId,r.pair,r.category,r.locale,r.status,JSON.stringify(r.expected),JSON.stringify(r.actual),r.differences.join(' ')])].map(row=>row.map(cell).join(',')).join('\r\n');
}
export function validateCustom(input:{category:string;locale:string;input:string;expected:string;operation:string},id:string):Case{
  if(!categories.includes(input.category as Case['category'])||!['en-US','tr-TR'].includes(input.locale)||!input.input.trim()||input.input.length>5000)throw new Error('Select a category and locale, and enter input up to 5,000 characters.');
  if(input.expected.length>100000)throw new Error('Expected JSON exceeds 100,000 characters.');
  const expected:unknown=JSON.parse(input.expected);
  validateOutput(expected);
  if(!expected||typeof expected!=='object'||Array.isArray(expected)||Object.keys(expected).length<1||Object.keys(expected).length>20||Object.entries(expected).some(([key,value])=>key.length>100||!['string','number','boolean'].includes(typeof value)||typeof value==='string'&&value.length>5000))throw new Error('Expected output must be an object with 1–20 finite scalar fields; strings are limited to 5,000 characters.');
  if(input.category==='casing'&&!['upper','lower'].includes(input.operation))throw new Error('Choose an upper or lower operation.');
  return{id,pair:id,category:input.category as Case['category'],locale:input.locale as Locale,input:input.input,expected:expected as Output,operation:input.operation as 'upper'|'lower',prompt:`Locale: ${input.locale}. Category: ${input.category}. Input: ${input.input}. Return only JSON matching these required field names and types: ${Object.entries(expected).map(([k,v])=>`${k}: ${typeof v}`).join(', ')}.`,note:'Custom case; the expected output is supplied by you.'};
}
