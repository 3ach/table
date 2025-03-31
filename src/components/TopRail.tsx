import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table, yBuffer } from '../models/Table';

interface TopRailProps extends SVGProps {
    table: Table,
}

export default class TopRail extends SVGComponent<TopRailProps> {
    svg() {
        const length = this.props.table.yCut + yBuffer(this.props.table);
        const sparInset = this.props.table.overhang + (yBuffer(this.props.table) / 2);
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

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 