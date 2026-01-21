import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';

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

        let pathstr = `M 0 0`
        pathstr += `L 0 ${(thickness / 2) - (thickness / 50)}`; 
        for (let mortise = 0; mortise < xMortises; mortise++) {
            const x = (mortise * xGap);
            pathstr += `L ${x + material} ${(thickness / 2) - (thickness / 50)}`; 
            pathstr += `L ${x + material} ${thickness}`; 
            pathstr += `L ${x + xGap} ${thickness}`; 
            pathstr += `L ${x + xGap} ${(thickness / 2) - (thickness / 50)}`; 
        }
        pathstr += `L ${yCut} ${(thickness / 2) - (thickness / 50)}`
        pathstr += `L ${yCut} 0`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 
