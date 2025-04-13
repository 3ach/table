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
        const maxLength = this.props.table.trackCutPoint;
        const sparInset = this.props.table.overhang + (this.props.table.yBuffer / 2);
        const trackWidth = this.props.table.trackWidth;
        const holeSize = this.props.table.holeSize;
        const material = this.props.table.material;
        const buffer = length > maxLength ? material / 2 : 0;
        let [yFrontSetback, yFrontFirstX, yFrontSecondX] = this.props.table.frontHoleCoordinates;
        let [yBackFirstSetback, yBackSecondSetback, yBackFirstX, yBackSecondX] = this.props.table.backHoleCoordinates;

        let pathstr = `M 0 0`

        if (length > maxLength) {
            pathstr += `L ${maxLength} 0`
            pathstr += `L ${maxLength} ${trackWidth}`
            pathstr += `L 0 ${trackWidth}`
            pathstr += 'z'

            pathstr += `M ${maxLength + buffer} 0`
            pathstr += `L ${length + buffer} 0`
            pathstr += `L ${length + buffer} ${trackWidth}`
            pathstr += `L ${maxLength + buffer} ${trackWidth}`
            pathstr += 'z'

            pathstr += `M ${sparInset} ${trackWidth * 0.25}`;
            pathstr += `L ${sparInset} ${trackWidth * 0.75}`;

            pathstr += `M ${length - sparInset + buffer} ${trackWidth * 0.25}`;
            pathstr += `L ${length - sparInset + buffer} ${trackWidth * 0.75}`;
        } else {
            pathstr += `L ${length} 0`
            pathstr += `L ${length} ${trackWidth}`
            pathstr += `L 0 ${trackWidth}`
            pathstr += 'z'
            
            pathstr += `M ${sparInset} ${trackWidth * 0.25}`
            pathstr += `L ${sparInset} ${trackWidth * 0.75}`
            pathstr += `M ${length - sparInset} ${trackWidth * 0.25}`
            pathstr += `L ${length - sparInset} ${trackWidth * 0.75}`
        }

        if (this.props.rail) {
            const offset = this.props.table.clipOffset;
            const holeStart = this.props.table.clipsFrontSetback;
            const clipCount = this.props.table.clipCount;
            const clipGap = this.props.table.clipGap;

            for (let clip = 0; clip < clipCount; clip++) {
                let x = (clip * clipGap) + holeStart - (holeSize / 2);
                if (x > maxLength) {
                    x += buffer;
                }
                pathstr += `M ${x} ${offset}`;
                pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${x + holeSize} ${offset}`
                pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${x} ${offset}`
            }
        } else {
            yFrontFirstX = trackWidth - yFrontFirstX;
            yFrontSecondX = trackWidth - yFrontSecondX;
            yBackFirstX = trackWidth - yBackFirstX;
            yBackSecondX = trackWidth - yBackSecondX;
        }

        pathstr += `M ${yFrontSetback - (holeSize / 2)} ${yFrontFirstX}`;
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${yFrontSetback + (holeSize / 2)} ${yFrontFirstX}`
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${yFrontSetback - (holeSize / 2)} ${yFrontFirstX}`

        pathstr += `M ${yFrontSetback - (holeSize / 2)} ${yFrontSecondX}`;
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${yFrontSetback + (holeSize / 2)} ${yFrontSecondX}`
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${yFrontSetback - (holeSize / 2)} ${yFrontSecondX}`

        pathstr += `M ${length + (holeSize / 2) - yBackFirstSetback + buffer} ${yBackFirstX}`;
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${length - (holeSize / 2) - yBackFirstSetback + buffer} ${yBackFirstX}`
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${length + (holeSize / 2) - yBackFirstSetback + buffer} ${yBackFirstX}`

        pathstr += `M ${length + (holeSize / 2) - yBackSecondSetback + buffer} ${yBackSecondX}`;
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${length - (holeSize / 2) - yBackSecondSetback + buffer} ${yBackSecondX}`
        pathstr += `A ${holeSize / 2} ${holeSize / 2} 0 0 1 ${length + (holeSize / 2) - yBackSecondSetback + buffer} ${yBackSecondX}`

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 