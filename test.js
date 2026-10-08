const e = require('./engine.js');
const cases = require('./expected.json');
let pass=0, fail=0;
const close=(a,b)=>Math.abs(a-b) <= 1e-9*Math.max(1,Math.abs(b));
function cmp(a,b,path){
  if (typeof b==='number'){ if(!(typeof a==='number'&&close(a,b))) throw new Error(path+': '+a+' != '+b); return; }
  if (typeof b==='object'&&b!==null){ for(const k of Object.keys(b)) cmp(a&&a[k],b[k],path+'.'+k); return; }
  if (a!==b) throw new Error(path+': '+JSON.stringify(a)+' != '+JSON.stringify(b));
}
const fns={hang:e.hangPlan,forced:e.forcedAngle,window:e.spanWindow,treeHint:e.treeSpacingHint};
for(const c of cases){
  try{ cmp(fns[c.fn](...c.args),c.exp,c.fn+'('+c.args+')'); pass++; }
  catch(err){ fail++; console.log('FAIL',err.message); }
}
// anchors: published trig values + the 83% rule
const A=[[Math.tan(30*Math.PI/180),0.5773502692],[Math.cos(30*Math.PI/180),0.8660254038],
  [e.ridgeline(120),99.6],[e.ridgeline(132),109.56],[e.CHAIR_IN,18],[e.RIDGELINE_FRAC,0.83]];
for(const [g,w] of A){ if(close(g,w)) pass++; else { fail++; console.log('ANCHOR FAIL',g,w);} }
// properties
function prop(name,f){ try{ if(!f()) throw 0; pass++; }catch{ fail++; console.log('PROP FAIL',name); } }
prop('hangPlan round-trips forcedAngle',()=>{ const p=e.hangPlan(132,180,30); const q=e.forcedAngle(132,180,p.strapH); return close(q.angleDeg,30); });
prop('span window: mid span is in band',()=>{ const w=e.spanWindow(132,72); const mid=(w.minSpan+w.maxSpan)/2; const q=e.forcedAngle(132,mid,72); return q.angleDeg>=20&&q.angleDeg<=45; });
prop('wider span lowers required strap height',()=>{ return e.hangPlan(132,216,30).strapH > e.hangPlan(132,156,30).strapH; });
prop('steeper angle raises strap height',()=>{ return e.hangPlan(132,180,45).strapH > e.hangPlan(132,180,20).strapH; });
prop('longer hammock -> longer ridgeline',()=> e.ridgeline(144)>e.ridgeline(102));
prop('span shorter than ridgeline cannot fit',()=> e.hangPlan(132,100,30).fits===false);
prop('strap at seat level cannot work',()=> e.forcedAngle(132,180,20).fits===false);
prop('higher seat raises strap height',()=> e.hangPlan(132,180,30,24).strapH > e.hangPlan(132,180,30,16).strapH);
prop('susp length exceeds run',()=>{ const p=e.hangPlan(120,200,35); return p.suspLen>p.runIn; });
// errors
for(const bad of [[0,180,30],[132,-5,30],[132,180,0],[132,180,95],[132,180,30,-1]]){
  try{ e.hangPlan(...bad); fail++; console.log('ERR FAIL no throw',bad);}catch{ pass++; }
}
for(const bad of [[132,180,0],[132,180,-3],[132,180,72,-1]]){ try{ e.forcedAngle(...bad); fail++; console.log('ERR FAIL forced',bad);}catch{ pass++; } }
try{ e.spanWindow(132,0); fail++; console.log('ERR FAIL window'); }catch{ pass++; }
console.log(pass+'/'+(pass+fail)+' checks pass');
process.exit(fail?1:0);
