import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';
import { dogBoneCorner } from '../lib/dogbone';

interface YSparProps extends SVGProps {
    table: Table,
}

export default class YSpar extends SVGComponent<YSparProps> {
    svg() {
        const overhang = this.props.table.overhang;
        const yCut = this.props.table.yCut - (2 * overhang);
        const thickness = this.props.table.thickness;
        const material = this.props.table.material;
        const xMortises = this.props.table.xSparCount - 1;
        const xGap = this.props.table.xSparGap;
        const r = this.props.table.dogBoneRadius;
        const depth = thickness / 2;

        let pathstr = `M 0 0`
        pathstr += `L 0 ${depth}`;
        for (let mortise = 0; mortise < xMortises; mortise++) {
            const x = (mortise * xGap);
            // floor -> right corner -> down the wall
            pathstr += dogBoneCorner(x + material, depth, 1, 0, 0, 1, r);
            pathstr += `L ${x + material} ${thickness}`;
            pathstr += `L ${x + xGap} ${thickness}`;
            // up the wall -> left corner -> floor
            pathstr += dogBoneCorner(x + xGap, depth, 0, -1, 1, 0, r);
        }
        pathstr += `L ${yCut} ${depth}`
        pathstr += `L ${yCut} 0`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 
