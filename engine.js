// Hammockmath engine - pure hang geometry. No strength, load or suitability verdicts.
// Anchors (labeled in-app):
//  - Structural ridgeline ~= 83% of gathered-end hammock length (widely used rule of thumb).
//  - 30 deg hang angle is the common comfort target; 20-45 deg is the labeled workable band.
//  - Seat (lowest point) target = chair height, default 18 in.
//  - Hammock-end height above its own lowest point estimated at 1.5x the body sag
//    (body sag estimate = 12.5% of ridgeline) - a labeled estimate, not a spec.
const D2R = Math.PI / 180;
const CHAIR_IN = 18;
const RIDGELINE_FRAC = 0.83;   // rule of thumb
const BODY_SAG_FRAC = 0.125;   // estimate: body sag depth as fraction of ridgeline
const END_RISE_MULT = 1.5;     // estimate: hammock end sits this many sags above the bottom

function ridgeline(hammockLenIn){ return hammockLenIn * RIDGELINE_FRAC; }
function bodySag(rlIn){ return rlIn * BODY_SAG_FRAC; }
function endRise(rlIn){ return bodySag(rlIn) * END_RISE_MULT; }

// Core forward model: given anchor span and hang angle, where do the straps go?
function hangPlan(hammockLenIn, spanIn, angleDeg, seatIn){
  if (!(hammockLenIn > 0)) throw new Error('hammock length must be positive');
  if (!(spanIn > 0)) throw new Error('anchor span must be positive');
  if (!(angleDeg > 0 && angleDeg < 90)) throw new Error('angle must be between 0 and 90 degrees');
  const seat = (seatIn === undefined || seatIn === null) ? CHAIR_IN : seatIn;
  if (!(seat > 0)) throw new Error('seat height must be positive');
  const rl = ridgeline(hammockLenIn);
  const a = angleDeg * D2R;
  if (spanIn < rl) {
    return { fits: false, ridgeline: rl, span: spanIn,
      reason: 'anchors closer than the ridgeline - the hammock cannot hang between them' };
  }
  const runIn = (spanIn - rl) / 2;              // horizontal suspension run per side
  const suspLen = runIn / Math.cos(a);          // suspension length per side
  const dropIn = runIn * Math.tan(a);           // vertical drop, anchor to hammock end
  const endH = seat + endRise(rl);              // hammock end height estimate
  const strapH = endH + dropIn;                 // strap attach height
  // tightest possible: if straps were placed at this height, what angle results? (identity by construction)
  // Max span for this angle if strap height is capped:
  const verdict = angleDeg < 20 ? 'too flat for the 20-45 deg band - geometry only, comfort suffers'
                : angleDeg > 45 ? 'too steep for the 20-45 deg band - geometry only, comfort suffers'
                : 'in the 20-45 deg band';
  return { fits: true, ridgeline: rl, runIn, suspLen, dropIn, endH, strapH, seat,
    bodySag: bodySag(rl), angleDeg, span: spanIn, verdict };
}

// Reverse model: straps at a fixed height, span given - what angle does that force?
function forcedAngle(hammockLenIn, spanIn, strapHIn, seatIn){
  if (!(strapHIn > 0)) throw new Error('strap height must be positive');
  const rl = ridgeline(hammockLenIn);
  const seat = (seatIn === undefined || seatIn === null) ? CHAIR_IN : seatIn;
  if (!(seat > 0)) throw new Error('seat height must be positive');
  if (spanIn < rl) return { fits: false, ridgeline: rl, reason: 'anchors closer than the ridgeline' };
  const runIn = (spanIn - rl) / 2;
  const endH = seat + endRise(rl);
  const dropIn = strapHIn - endH;
  if (dropIn <= 0) return { fits: false, ridgeline: rl,
    reason: 'strap height at or below the hammock ends - no downward suspension geometry' };
  const angleDeg = Math.atan(dropIn / runIn) / D2R;
  const suspLen = runIn / Math.cos(angleDeg * D2R);
  const verdict = angleDeg < 20 ? 'too flat' : angleDeg > 45 ? 'too steep' : 'in band';
  return { fits: true, ridgeline: rl, runIn, dropIn, angleDeg, suspLen, endH, seat,
    strapH: strapHIn, verdict };
}

// Max comfortable span at 45 deg for a given strap height, min span at 20 deg.
function spanWindow(hammockLenIn, strapHIn, seatIn){
  if (!(strapHIn > 0)) throw new Error('strap height must be positive');
  const rl = ridgeline(hammockLenIn);
  const seat = (seatIn === undefined || seatIn === null) ? CHAIR_IN : seatIn;
  if (!(seat > 0)) throw new Error('seat height must be positive');
  const endH = seat + endRise(rl);
  const drop = strapHIn - endH;
  if (drop <= 0) return { ok: false, ridgeline: rl, reason: 'strap height too low for any angle in the band' };
  const run45 = drop / Math.tan(45 * D2R);
  const run20 = drop / Math.tan(20 * D2R);
  return { ok: true, ridgeline: rl, endH,
    minSpan: rl + 2 * run45,   // steepest in-band angle gives the tightest span
    maxSpan: rl + 2 * run20 }; // flattest in-band angle gives the widest span
}

// Suggested tree spacing rule of thumb: hammock length + ~1 ft (labeled).
function treeSpacingHint(hammockLenIn){
  return { minHint: hammockLenIn * 0.9, comfortHint: hammockLenIn + 12 };
}

const API = { hangPlan, forcedAngle, spanWindow, treeSpacingHint,
  ridgeline, bodySag, endRise, CHAIR_IN, RIDGELINE_FRAC };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.Hammockmath = API;
