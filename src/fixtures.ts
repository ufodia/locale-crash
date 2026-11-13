export type Category = 'numbers' | 'dates' | 'casing' | 'negation';
export type Locale = 'en-US' | 'tr-TR';
export type Output = Record<string, string | number | boolean>;
export interface Case { id: string; pair: string; category: Category; locale: Locale; prompt: string; input: string; operation?: 'upper' | 'lower'; expected: Output; note: string; }
export const categories: Category[] = ['numbers', 'dates', 'casing', 'negation'];
export const cases: Case[] = [];
function pair(category: Category, index: number, en: Omit<Case,'id'|'pair'|'category'|'locale'>, tr: Omit<Case,'id'|'pair'|'category'|'locale'>) {
  const pairId = `${category}-${String(index + 1).padStart(2, '0')}`;
  cases.push({ ...en, id: `${pairId}-en`, pair: pairId, category, locale: 'en-US' }, { ...tr, id: `${pairId}-tr`, pair: pairId, category, locale: 'tr-TR' });
}
const amounts: [string, string, number, string][] = [
  ['1,234.50', '1.234,50', 1234.5, 'Grouping and decimal separators exchange roles.'],
  ['12.50', '12,50', 12.5, 'A decimal comma is not a field separator.'],
  ['1,000', '1.000', 1000, 'A grouping separator must not become a decimal point.'],
  ['0.75', '0,75', .75, 'Keep values below one.'],
  ['-2,450.25', '-2.450,25', -2450.25, 'Preserve the negative sign.'],
  ['1,000,000.00', '1.000.000,00', 1000000, 'Multiple groups must parse consistently.'],
  ['99.95', '99,95', 99.95, 'Do not round a price while extracting it.'],
  ['0.00', '0,00', 0, 'Zero is a value, not missing information.'],
  ['42,015.08', '42.015,08', 42015.08, 'A zero inside a group must remain present.'],
];
for (const [index, [en, tr, amount, note]] of amounts.entries()) pair('numbers', index,
  { input: en, expected: { amount }, note, prompt: `Locale: en-US. Extract the amount from "${en}". Return only JSON with a numeric amount field.` },
  { input: tr, expected: { amount }, note, prompt: `Yerel biçim: tr-TR. "${tr}" tutarını çıkar. Yalnızca sayısal amount alanı içeren JSON döndür.` });
const dates: [string,string,string,string][] = [
  ['04/05/2026','05.04.2026','2026-04-05','Both components are at most twelve; the locale resolves their order.'],
  ['05/04/2026','04.05.2026','2026-05-04','Swapping the same two digits changes the date.'],
  ['12/11/2026','11.12.2026','2026-12-11','December is not November.'],
  ['01/02/2027','02.01.2027','2027-01-02','Preserve the year across a January boundary.'],
  ['02/29/2028','29.02.2028','2028-02-29','Leap day is valid in 2028.'],
  ['12/31/2026','31.12.2026','2026-12-31','End-of-year ordering.'],
  ['07/09/2026','09.07.2026','2026-07-09','Month and day both require an explicit locale.'],
  ['11/03/2026','03.11.2026','2026-11-03','Do not infer order from an English field name.'],
  ['10/30/2030','30.10.2030','2030-10-30','A future year is retained verbatim.'],
];
for (const [index, [en,tr,isoDate,note]] of dates.entries()) pair('dates', index,
  { input: en, expected: { isoDate }, note, prompt: `Locale: en-US (MM/DD/YYYY). Convert "${en}" to a calendar date. Return only JSON with isoDate in YYYY-MM-DD format. Do not add a time zone.` },
  { input: tr, expected: { isoDate }, note, prompt: `Yerel biçim: tr-TR (GG.AA.YYYY). "${tr}" takvim tarihini dönüştür. Yalnızca YYYY-MM-DD biçiminde isoDate alanı içeren JSON döndür. Saat dilimi ekleme.` });
const casing: [string,'upper'|'lower',string,string,string][] = [
  ['istanbul','upper','ISTANBUL','İSTANBUL','Turkish dotted i uppercases to dotted capital İ.'],
  ['izmir','upper','IZMIR','İZMİR','Both dotted i characters follow the locale.'],
  ['I','lower','i','ı','Capital I lowercases to dotless ı in Turkish.'],
  ['ISTANBUL','lower','istanbul','ıstanbul','Do not silently repair the source spelling.'],
  ['IĞDIR','lower','iğdir','ığdır','Two capital I characters require locale-sensitive lowercasing.'],
  ['inci','upper','INCI','İNCİ','The same input has different valid outputs by locale.'],
  ['ışık','upper','IŞIK','IŞIK','Dotless ı remains distinct from dotted i.'],
  ['kivi','upper','KIVI','KİVİ','Dotted i is not ASCII I in tr-TR.'],
  ['KIRIK','lower','kirik','kırık','Preserve the locale-specific casing of every I.'],
];
for (const [index, [input,operation,en,tr,note]] of casing.entries()) pair('casing',index,
  { input, operation, expected:{ text:en }, note, prompt:`Locale: en-US. Convert "${input}" to ${operation}case exactly as written. Return only JSON with a text field.` },
  { input, operation, expected:{ text:tr }, note, prompt:`Yerel biçim: tr-TR. "${input}" metnini ${operation==='upper'?'büyük':'küçük'} harfe dönüştür. Yazımı düzeltme. Yalnızca text alanı içeren JSON döndür.` });
const commands: [string,string,string,boolean][] = [
  ['Do not send the invoice.','Faturayı gönderme.','send',false],
  ['Send the invoice.','Faturayı gönder.','send',true],
  ['Do not delete the file.','Dosyayı silme.','delete',false],
  ['Delete the file.','Dosyayı sil.','delete',true],
  ['Do not publish the report.','Raporu yayımlama.','publish',false],
  ['Do not share the link.','Bağlantıyı paylaşma.','share',false],
  ['Do not upload the photo.','Fotoğrafı yükleme.','upload',false],
  ['Do not cancel the booking.','Rezervasyonu iptal etme.','cancel',false],
  ['Invite the guest.','Konuğu davet et.','invite',true],
];
for(const [index,[en,tr,action,allowed]] of commands.entries()) pair('negation',index,
  { input:en, expected:{action,allowed}, note:'Recognize the action and preserve whether the explicit command permits it.', prompt:`Interpret this explicit command: "${en}". Return only JSON with action (English verb) and allowed (boolean).` },
  { input:tr, expected:{action,allowed}, note:'Turkish negative imperatives are morphological; there may be no separate word for “not”.', prompt:`Bu açık komutu yorumla: "${tr}". Yalnızca action (İngilizce fiil) ve allowed (mantıksal değer) alanlarını içeren JSON döndür.` });
