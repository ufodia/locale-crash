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
