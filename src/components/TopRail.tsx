import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';

interface TopRailProps extends SVGProps {
    table: Table,
    rail: boolean,
}

export default class TopRail extends SVGComponent<TopRailProps> {
    svg() {
        const length = this.props.table.yCut + this.props.table.yBuffer;
        const sparInset = this.props.table.overhang + (this.props.table.yBuffer / 2);
        const trackWidth = this.props.table.trackWidth;

        let pathstr = `M 0 0`
        pathstr += `L ${length} 0`
        pathstr += `L ${length} ${trackWidth}`
        pathstr += `L 0 ${trackWidth}`
        pathstr += 'z'
        
        pathstr += `M ${sparInset} ${trackWidth * 0.25}`
        pathstr += `L ${sparInset} ${trackWidth * 0.75}`
        pathstr += `M ${length - sparInset} ${trackWidth * 0.25}`
        pathstr += `L ${length - sparInset} ${trackWidth * 0.75}`

        if (this.props.rail) {
            const offset = this.props.table.clipOffset;
            const holeStart = this.props.table.clipsFrontSetback;
            const clipCount = this.props.table.clipCount;
            const holeSize = this.props.table.holeSize;
            const clipGap = this.props.table.clipGap;

            for (let clip = 0; clip < clipCount; clip++) {
                let x = (clip * clipGap) + holeStart - (holeSize / 2);
                pathstr += `M ${x} ${offset}`;
                pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${x + holeSize} ${offset}`
                pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${x} ${offset}`
            }
        }

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 