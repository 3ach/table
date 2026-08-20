// Emits the path commands for one inside corner at vertex (vx, vy), integrating
// a minimal 45deg dog-bone (per https://fablab.ruc.dk/more-elegant-cnc-dogbones/):
// a circle of the bit radius r is centred r into the slot along the corner
// bisector, so it passes exactly through the corner point. The outline joins the
// circle sqrt(2)*r before the corner, sweeps the semicircle through the corner
// point, and rejoins the other wall sqrt(2)*r past it. The relief bulges only
// ~0.29*r past each wall - the least material removed while letting the mating
// square corner seat fully.
//
// (inDx, inDy) is the unit direction the outline travels *into* the corner;
// (outDx, outDy) is the unit direction it leaves along.
//
// r <= 0 returns a plain corner (`L vx vy`), so dog-bones can be disabled.
export function dogBoneCorner(
    vx: number, vy: number,
    inDx: number, inDy: number,
    outDx: number, outDy: number,
    r: number,
): string {
    if (r <= 0) return `L ${vx} ${vy} `;

    // The circle through the corner crosses each wall sqrt(2)*r from the vertex.
    const setback = Math.SQRT2 * r;
    const ax = vx - inDx * setback;
    const ay = vy - inDy * setback;
    const bx = vx + outDx * setback;
    const by = vy + outDy * setback;

    // Semicircle through the corner point, swept towards the material side.
    const sweep = (inDx * outDy - inDy * outDx) > 0 ? 1 : 0;

    return `L ${ax} ${ay} A ${r} ${r} 0 0 ${sweep} ${bx} ${by} `;
}
