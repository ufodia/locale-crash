import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

async function getDownload(page,button){
  const wait=page.waitForEvent('download');
  await button.click();
  const download=await wait;
  return {download,content:await readFile(await download.path(),'utf8')};
}

test('local workbench: analysis, evidence, export and responsive layout',async({page},testInfo)=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const done=[];
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
      expect(Number(await page.locator('#failed').textContent())).toBeGreaterThan(0);await page.locator('#reference').click();await expect(page.locator('#passed')).toHaveText('72');await expect(page.locator('#failed')).toHaveText('0');
      const exported=await getDownload(page,page.locator('#json'));const report=JSON.parse(exported.content);expect(report.total).toBe(72);
      const response={format:'locale-crash/responses/1',label:'Browser roundtrip',responses:[{caseId:report.results[0].caseId,output:report.results[0].expected}]};await page.locator('#response-file').setInputFiles({name:'responses.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(response))});await expect(page.locator('#passed')).toHaveText('1');await expect(page.locator('#missing')).toHaveText('71');
      const csv=await getDownload(page,page.locator('#csv'));expect(csv.content.split('\n').length).toBe(73);
      await page.locator('#naive').click();done.push('72-case real reference scoring','Imported output scoring distinguishes missing answers','JSON and CSV exports','Naive failures explicitly labeled');
  await page.screenshot({path:testInfo.outputPath('desktop.png'),fullPage:false});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:testInfo.outputPath('mobile.png'),fullPage:false});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
  expect(errors).toEqual([]);
});

test('a delayed import cannot replace a newer reference run and unsafe JSON is recoverable',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    const original=File.prototype.text;
    File.prototype.text=async function(){
      if(this.name==='delayed.json')await new Promise(resolve=>{window.releaseImport=resolve;});
      const text=await original.call(this);window.importReadFinished=true;return text;
    };
  });
  await page.goto('/');
  const response={format:'locale-crash/responses/1',label:'Old import',responses:[]};
  await page.locator('#response-file').setInputFiles({name:'delayed.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(response))});
  await expect.poll(()=>page.evaluate(()=>typeof window.releaseImport)).toBe('function');
  await page.locator('#reference').click();
  await page.evaluate(()=>window.releaseImport());
  await expect.poll(()=>page.evaluate(()=>window.importReadFinished)).toBe(true);
  await expect(page.locator('#passed')).toHaveText('72');
  await expect(page.locator('#run-kind')).toHaveText('LOCAL DEMONSTRATION');
  await page.locator('#response-file').setInputFiles({name:'overflow.json',mimeType:'application/json',buffer:Buffer.from('{"format":"locale-crash/responses/1","label":"Overflow","responses":[{"caseId":"numbers-01-en","output":{"amount":1e400}}]}')});
  await expect(page.locator('#error')).toContainText('finite');
  await expect(page.locator('#passed')).toHaveText('72');
  expect(errors).toEqual([]);
});


test('category state and case dialog remain usable with keyboard and forced colors',async({page})=>{
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await page.goto('/');
  const category=page.locator('.category[data-category="dates"]');
  await category.focus();await page.keyboard.press('Enter');
  await expect(category).toHaveAttribute('aria-pressed','true');
  const first=page.locator('.case').first(),id=await first.getAttribute('data-case-id');
  await first.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog',{name:id,exact:true})).toBeVisible();
  await page.locator('#answer').focus();await page.keyboard.press('Control+A');await page.keyboard.type('{}');await page.locator('#check-answer').focus();await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(page.locator(`.case[data-case-id="${id}"]`)).toBeFocused();
});
