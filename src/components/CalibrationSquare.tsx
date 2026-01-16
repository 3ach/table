import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';

interface CalibrationSquareProps extends SVGProps {
	table: Table,
}

export default class CalibrationSquare extends SVGComponent<CalibrationSquareProps> {
    svg() {
		const calibrationSquareSize = this.props.table.calibrationSquareSize;
		const pathstr = `M 0 0 `
					  + `L 0 ${calibrationSquareSize} ` 
					  + `L ${calibrationSquareSize} ${calibrationSquareSize} ` 
					  + `L ${calibrationSquareSize} 0 ` 
					  + `z`;

		return SVG().path(pathstr)
			.fill("none")
			.attr('vector-effect', 'non-scaling-stroke');
    }
} 
