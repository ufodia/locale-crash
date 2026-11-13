import { writeFileSync } from 'node:fs';
import { cases } from '../src/fixtures.ts';
const args=process.argv.slice(2);
try{
  const includeExpected=args.includes('--include-expected');
  const data=includeExpected?{format:'locale-crash/fixtures/1',cases}:{format:'locale-crash/prompts/1',cases:cases.map(f=>({caseId:f.id,pair:f.pair,locale:f.locale,category:f.category,prompt:f.prompt,outputFields:Object.fromEntries(Object.entries(f.expected).map(([key,value])=>[key,typeof value]))}))};
  const output=JSON.stringify(data,null,2)+'\n';const index=args.indexOf('--out');if(index>=0){if(!args[index+1])throw new Error('Supply a file after --out.');writeFileSync(args[index+1],output,{flag:'wx'});}else process.stdout.write(output);
}catch(error){console.error(error instanceof Error?error.message:'Export failed.');process.exitCode=1;}
