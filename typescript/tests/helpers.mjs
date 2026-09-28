import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createChecker } from '../compiler.mjs';
import { isolatedRuntime } from './runtime-isolation.mjs';
const libPath=resolve(import.meta.dirname,'../../node_modules/typescript/lib');
const libs=Object.fromEntries(readdirSync(libPath).filter((n)=>/^lib\..*\.d\.ts$/.test(n)).map((n)=>[n,readFileSync(resolve(libPath,n),'utf8')]));
export const checker=createChecker(ts,libs);
export async function fullJudge(q,files) {
  const result=checker.judge(q,files);
  if(result.passed&&q.runtime?.length){
    const checks=await isolatedRuntime(result.output,q.runtime,1500,q.runtimeEnvironment);
    result.checks.push(...checks);result.passed=checks.every((c)=>c.passed);
  }
  return result;
}
