import { describe,expect,it } from 'vitest';
import { cases } from './fixtures';
import { csv,parseCommand,parseDate,parseNumber,parseResponses,reference,runBuiltin,score,validateCustom } from './engine';
describe('reviewed fixtures',()=>{
  it('contains 36 pairs and unique IDs',()=>{expect(cases).toHaveLength(72);expect(new Set(cases.map(c=>c.pair)).size).toBe(36);expect(new Set(cases.map(c=>c.id)).size).toBe(72);});
  for(const fixture of cases)it(`derives the expected result for ${fixture.id}`,()=>expect(reference(fixture)).toEqual(fixture.expected));
  it('demonstrates a real locale gap in the naive parser',()=>{const report=runBuiltin('naive');expect(report.failed).toBeGreaterThan(20);expect(report.missing).toBe(0);expect(runBuiltin('reference').passed).toBe(72);});
});
describe('parsers',()=>{
  it('validates grouping and preserves negatives',()=>{expect(parseNumber('-2.450,25','tr-TR')).toBe(-2450.25);expect(()=>parseNumber('1.23.4','tr-TR')).toThrow();expect(()=>parseNumber('10oops','en-US')).toThrow();});
  it('rejects impossible dates instead of rolling forward',()=>{expect(()=>parseDate('29.02.2027','tr-TR')).toThrow();expect(parseDate('02/29/2028','en-US')).toBe('2028-02-29');});
  it('distinguishes a negative command from a positive one',()=>{expect(parseCommand('Dosyayı silme.','tr-TR')).toEqual({action:'delete',allowed:false});expect(parseCommand('Dosyayı sil.','tr-TR')).toEqual({action:'delete',allowed:true});});
});
describe('external scoring',()=>{
  it('separates missing answers from failed answers and checks value types',()=>{const report=score({format:'locale-crash/responses/1',label:'Test',responses:[{caseId:cases[0].id,output:{amount:'1234.5'}}]});expect(report.failed).toBe(1);expect(report.missing).toBe(71);expect(report.results[0].differences[0]).toContain('amount');});
  it('ignores object key order but rejects extra fields',()=>{const c=cases.find(c=>c.category==='negation')!;expect(score({format:'locale-crash/responses/1',label:'Test',responses:[{caseId:c.id,output:{allowed:false,action:'send'}}]},[c]).passed).toBe(1);expect(score({format:'locale-crash/responses/1',label:'Test',responses:[{caseId:c.id,output:{...c.expected,extra:true}}]},[c]).failed).toBe(1);});
  it('rejects duplicate and unknown case IDs',()=>{const entry={caseId:cases[0].id,output:cases[0].expected};expect(()=>parseResponses(JSON.stringify({format:'locale-crash/responses/1',label:'X',responses:[entry,entry]}))).toThrow();expect(()=>parseResponses('{"format":"locale-crash/responses/1","label":"X","responses":[{"caseId":"unknown","output":{}}]}')).toThrow();});
  it('exports valid quoted CSV',()=>{const report=score({format:'locale-crash/responses/1',label:'X',responses:[]},[cases[0]]);const out=csv(report);expect(out).toContain('"caseId"');expect(out).toContain('"missing"');expect(out).toContain('""amount""');});
  it('validates custom cases without giving away expected values in the prompt',()=>{const c=validateCustom({category:'numbers',locale:'tr-TR',input:'5,25',expected:'{"amount":5.25}',operation:'upper'},'custom-1');expect(c.prompt).not.toContain('5.25');expect(reference(c)).toEqual({amount:5.25});expect(()=>validateCustom({category:'bad',locale:'tr-TR',input:'x',expected:'{}',operation:'upper'},'x')).toThrow();});
});
