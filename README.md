# Hammockmath

Where do the straps actually go? Hammockmath turns your hammock length, tree span and target hang angle into a strap attach height, suspension length per side, and a to-scale sag diagram. Reverse checks: tree-spacing hint and the span window your strap height supports across the 20-45 degree band.

**Geometry only.** This tool computes placement math. It gives no strength, load, or gear-suitability verdicts - check every rating with the manufacturer and inspect your gear.

## Model (all assumptions labeled in-app)
- Structural ridgeline ~= 83% of gathered-end hammock length (widely used rule of thumb).
- 30 deg hang angle is the common comfort target; 20-45 deg is the labeled workable band.
- Seat (lowest point) target defaults to chair height, 18 in.
- Body sag depth estimated at 12.5% of ridgeline; hammock ends sit ~1.5x sag above the lowest point. Labeled estimates, not specs - measure your own hammock.
- Suspension: run = (span - ridgeline)/2 per side; length = run / cos(angle); drop = run x tan(angle).

## Files
- `index.html` - landing page
- `app.html` - the calculator with to-scale SVG hang diagram
- `engine.js` - pure geometry engine (node + browser)
- `test.js` + `expected.json` - 80 checks against an independent Python oracle, published trig anchors and monotonicity properties

## Run tests
```
node test.js
```
