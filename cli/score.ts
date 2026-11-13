import { readFileSync,writeFileSync } from 'node:fs';
import { csv,parseResponses,runBuiltin,score } from '../src/engine.ts';
try{
  const args=process.argv.slice(2);
  if(args.includes('--help'))console.log('Usage: npm run score -- responses.json [--csv] [--out report.json]\n       npm run score -- --reference\n       npm run score -- --naive\nFailed or missing cases produce exit code 2.');
  else{
    const file=args.find(arg=>!arg.startsWith('--'));
    const report=args.includes('--reference')?runBuiltin('reference'):args.includes('--naive')?runBuiltin('naive'):file?score(parseResponses(readFileSync(file,'utf8'))):null;
    if(!report)throw new Error('Supply a response file, --reference, or --naive.');
    const output=args.includes('--csv')?csv(report):JSON.stringify(report,null,2)+'\n';
    const outIndex=args.indexOf('--out');if(outIndex>=0){if(!args[outIndex+1])throw new Error('Supply a file after --out.');writeFileSync(args[outIndex+1],output,{flag:'wx'});}else process.stdout.write(output);
    if(report.failed||report.missing)process.exitCode=2;
  }
}catch(error){console.error(error instanceof Error?error.message:'Scoring failed.');process.exitCode=1;}
