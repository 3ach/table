import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';

interface SideRailProps extends SVGProps {
    table: Table,
}

export default class SideRail extends SVGComponent<SideRailProps> {
    svg() {
        const length = this.props.table.yCut + this.props.table.yBuffer;
        const sparInset = this.props.table.overhang + (this.props.table.yBuffer / 2);
        const thickness = this.props.table.thickness;
        const maxLength = this.props.table.trackCutPoint;
        const material = this.props.table.material;
        const xSparGap = this.props.table.xSparGap;

        let pathstr = `M 0 0`
        if (length < maxLength) {
            pathstr += `L ${length} 0`
            pathstr += `L ${length} ${thickness}`
            pathstr += `L 0 ${thickness}`
            pathstr += 'z'

            pathstr += `M ${sparInset} ${thickness * 0.25}`;
            pathstr += `L ${sparInset} ${thickness * 0.75}`;

            pathstr += `M ${length - sparInset} ${thickness * 0.25}`;
            pathstr += `L ${length - sparInset} ${thickness * 0.75}`;
        } else {
            let buffer = material / 2;
            let firstLength = maxLength;
            const safeCutPoint = xSparGap + (4 * material) + sparInset;
            if (length - firstLength < safeCutPoint) {
                firstLength = length - safeCutPoint;
            }

            pathstr += `L ${firstLength} 0`
            pathstr += `L ${firstLength} ${thickness}`
            pathstr += `L 0 ${thickness}`
            pathstr += 'z'

            pathstr += `M ${firstLength + buffer} 0`
            pathstr += `L ${length + buffer} 0`
            pathstr += `L ${length + buffer} ${thickness}`
            pathstr += `L ${firstLength + buffer} ${thickness}`
            pathstr += 'z'

            pathstr += `M ${sparInset} ${thickness * 0.25}`;
            pathstr += `L ${sparInset} ${thickness * 0.75}`;

            pathstr += `M ${length - sparInset + buffer} ${thickness * 0.25}`;
            pathstr += `L ${length - sparInset + buffer} ${thickness * 0.75}`;
        }

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 