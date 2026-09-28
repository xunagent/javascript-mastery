import { buildSync } from 'esbuild';
import { resolve } from 'node:path';
let source;
export function domSource(){
 return source??=buildSync({entryPoints:[resolve(import.meta.dirname,'dom-environment.mjs')],bundle:true,write:false,format:'iife',globalName:'CourseDOM',platform:'browser',target:'es2022',minify:true,legalComments:'eof',banner:{js:`if(typeof globalThis.atob!=='function')globalThis.atob=input=>{const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';const text=String(input).replace(/=+$/,'');let bits=0,value=0,result='';for(const char of text){const n=alphabet.indexOf(char);if(n<0)throw Error('Invalid base64');value=(value<<6)|n;bits+=6;if(bits>=8){bits-=8;result+=String.fromCharCode((value>>bits)&255);}}return result;};`}}).outputFiles[0].text;
}
