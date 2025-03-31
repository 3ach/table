import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table, xSparCount, xSparGap } from '../models/Table';

interface YSparProps extends SVGProps {
    table: Table,
}

export default class YSpar extends SVGComponent<YSparProps> {
    svg() {
        const overhang = this.props.table.overhang;
        const yCut = this.props.table.yCut - (2 * overhang);
        const thickness = this.props.table.thickness;
        const material = this.props.table.material;
        const xMortises = xSparCount(this.props.table) - 1;
        const xGap = xSparGap(this.props.table);

        let pathstr = `M 0 0`
        pathstr += `L 0 ${thickness / 2}`; 
        for (let mortise = 0; mortise < xMortises; mortise++) {
            let x = (mortise * xGap);
            pathstr += `L ${x + material} ${thickness / 2}`; 
            pathstr += `L ${x + material} ${thickness}`; 
            pathstr += `L ${x + xGap} ${thickness}`; 
            pathstr += `L ${x + xGap} ${thickness / 2}`; 
        }
        pathstr += `L ${yCut} ${thickness / 2}`
        pathstr += `L ${yCut} 0`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 