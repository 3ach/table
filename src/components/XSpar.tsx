import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table, ySparCount, ySparGap, xBuffer } from '../models/Table';

interface XSparProps extends SVGProps {
    table: Table,
}

export default class XSpar extends SVGComponent<XSparProps> {
    svg() {
        const xCut = this.props.table.xCut + xBuffer(this.props.table);
        const thickness = this.props.table.thickness;
        const material = this.props.table.material;
        const yMortises = ySparCount(this.props.table);
        const overhang = this.props.table.overhang;
        const yGap = ySparGap(this.props.table);

        let pathstr = '';
        const start = (xBuffer(this.props.table) / 2) + overhang;
        if (start == 0) {
            pathstr += `M 0 ${thickness / 2}`;
        } else {
            pathstr += `M 0 0`;
        }

        for (let mortise = 0; mortise < yMortises; mortise++) {
            let x = (mortise * yGap) + start;
            if (x != 0) {
                pathstr += `L ${x} 0`; 
            }
            pathstr += `L ${x} ${thickness / 2}`; 
            pathstr += `L ${x + material} ${thickness / 2}`; 

            if (x + material != xCut) {
                pathstr += `L ${x + material} 0`; 
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