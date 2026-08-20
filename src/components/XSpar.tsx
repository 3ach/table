import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';
import { dogBoneCorner } from '../lib/dogbone';

interface XSparProps extends SVGProps {
    table: Table,
}

export default class XSpar extends SVGComponent<XSparProps> {
    svg() {
        const flatBuffer = this.props.table.flatBuffer;
        const railBuffer = this.props.table.railBuffer;
        const xShrink = this.props.table.xSparRailShrink;
        const flatOutsideBuffer = this.props.table.flatOutsideBuffer;
        const railOutsideBuffer = this.props.table.railOutsideBuffer;
        const xCut = this.props.table.xCut + flatBuffer + railBuffer - xShrink + flatOutsideBuffer + railOutsideBuffer;
        const thickness = this.props.table.thickness;
        const material = this.props.table.material;
        const yMortises = this.props.table.ySparCount;
        const overhang = this.props.table.overhang;
        const yGap = this.props.table.ySparGap;
        const r = this.props.table.dogBoneRadius;
        // Slotted down from the top edge.
        const depth = this.props.table.slotDepth;

        let pathstr = '';
        const start = flatBuffer + flatOutsideBuffer + overhang - (xShrink / 2);
        if (start == 0) {
            pathstr += `M 0 ${depth}`;
        } else {
            pathstr += `M 0 0`;
        }

        for (let mortise = 0; mortise < yMortises; mortise++) {
            const x = (mortise * yGap) + start;
            if (x != 0) {
                pathstr += `L ${x} 0`;
                // bottom-left corner: down the left wall, relieve, across the base
                pathstr += dogBoneCorner(x, depth, 0, 1, 1, 0, r);
            } else {
                pathstr += `L ${x} ${depth}`;
            }
            if (x + material != xCut) {
                // bottom-right corner: across the base, relieve, up the right wall
                pathstr += dogBoneCorner(x + material, depth, 1, 0, 0, -1, r);
                pathstr += `L ${x + material} 0`;
            } else {
                pathstr += `L ${x + material} ${depth}`;
            }
        }

        if (start != 0)  {
            pathstr += `L ${xCut} 0`
        }

        pathstr += `L ${xCut} ${thickness}`
        pathstr += `L 0 ${thickness}`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 
