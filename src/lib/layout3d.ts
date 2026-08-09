import { Table } from "../models/Table";

// Where the parts sit across the table in the 3D view, worked out once so that
// every part agrees. The tabletop is centred on the origin and the X spars run
// past it by the machine's own offsets - which differ left to right, 157mm
// against 133mm on a Lowrider 4 - so none of this can be had by halving the
// spar length.
//
// The buffers only pad the track cut-outs. They widen a rail, and push the end
// of the spar out with it, but they must never move the rails relative to each
// other. Both ends are anchored independently for that reason: anchoring the
// rails to the outer faces of the side rails leaves each track's datum - which
// sits its outside buffer in from the rail's outer edge - a fixed
// xCut + flatBuffer + railBuffer apart, whatever the buffers are set to. See
// trackDatums, which is what the test exercises.
export function crossLayout(table: Table) {
    const xShrink = table.xSparRailShrink;

    // The ends of an X spar: flat track side, then tube track side.
    const sparLeft = -(table.xCut / 2) - table.flatBuffer - table.flatOutsideBuffer + (xShrink / 2);
    const sparRight = (table.xCut / 2) + table.railBuffer + table.railOutsideBuffer - (xShrink / 2);

    return {
        sparLeft,
        sparRight,
        // Side rails cap the spar ends; the top rails line up with their outer
        // faces.
        railLeft: sparLeft - table.railMaterialThickness,
        railRight: sparRight + table.railMaterialThickness,
    };
}

// The two points the machine actually references: one outside buffer in from
// the outer edge of each top rail. Their spacing is fixed by the table width
// and the machine, and must not move when a buffer changes.
export function trackDatums(table: Table) {
    const layout = crossLayout(table);

    return {
        flat: layout.railLeft + table.flatOutsideBuffer,
        tube: layout.railRight - table.railOutsideBuffer,
    };
}
