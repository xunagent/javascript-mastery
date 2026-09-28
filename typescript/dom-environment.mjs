// Structural DOM only: layout, navigation and browser form submission are not simulated.
import { parseHTML } from 'linkedom/worker';
export function installDOM() {
  const window=parseHTML('<!doctype html><html><head></head><body></body></html>');
  // linkedom reflects value assignments into the attribute; browsers keep a dirty current value.
  // Model that distinction for the text inputs used by these tasks.
  const inputValues=new WeakMap();
  Object.defineProperty(window.HTMLInputElement.prototype,'value',{configurable:true,get(){return inputValues.has(this)?inputValues.get(this):(this.getAttribute('value')??'');},set(value){inputValues.set(this,value===null?'':String(value));}});
  for(const name of ['document','Node','Element','HTMLElement','HTMLInputElement','HTMLButtonElement','HTMLFormElement','HTMLTextAreaElement','HTMLSelectElement','Event','CustomEvent'])globalThis[name]=window[name];
}
