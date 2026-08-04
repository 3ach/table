import { Table } from '../models/Table'
import YSpar from './YSpar';
import XSpar from './XSpar';
import TopRail from './TopRail';
import SideRail from './SideRail';
import TestParts from './TestParts';
import CalibrationSquare from './CalibrationSquare';

type TableLayoutProps = {
    table: Table,
    strokeWidth: number,
    scaleToHeight?: number,
}

export default function TableLayout(props: TableLayoutProps) {
    const strokeWidth = props.strokeWidth;
    const tableThickness = props.table.thickness;
    const materialThickness = props.table.material
    const kerfWidth = materialThickness / 2;
    const yCut = props.table.yCut;
    const flatTrackWidth = props.table.flatTrackWidth;
    const railTrackWidth = props.table.railTrackWidth;
    const configuration = props.table.configuration;
    const xSparCount = props.table.xSparCount;
    const ySparCount = props.table.ySparCount;
    const yBuffer = props.table.yBuffer;

    const ySpars = [];

    for (let spar = 0; spar < ySparCount; spar++) {
        const y = ((kerfWidth + tableThickness) * spar) + (strokeWidth / 2);
        ySpars.push(
            <YSpar key={`spar-${spar}`} table={props.table} x={strokeWidth / 2} y={y} rotation={0} strokeWidth={strokeWidth}/>
        );
    }

    const xSpars = [];

    for (let spar = 0; spar < xSparCount; spar++) {
        const y = ((kerfWidth + tableThickness) * (spar + ySparCount)) + (strokeWidth / 2);
        xSpars.push(
            <XSpar key={`spar-${spar}`} table={props.table} x={strokeWidth / 2} y={y} rotation={0} strokeWidth={strokeWidth}/>
        );
    }

    const firstRail = ((kerfWidth + tableThickness) * (xSparCount + ySparCount)) + (strokeWidth / 2);

    const rails = [];
    if (configuration == "LR4") {
        rails.push(<TopRail key={"rail-top"} table={props.table} x={strokeWidth / 2} y={firstRail} rotation={0} strokeWidth={strokeWidth} rail={true} />);
        rails.push(<TopRail key={"flat-top"} table={props.table} x={strokeWidth / 2} y={firstRail + railTrackWidth + kerfWidth} rotation={0} strokeWidth={strokeWidth} rail={false} />);
        rails.push(<SideRail key={"rail-side"} table={props.table} x={strokeWidth / 2} y={firstRail + (2 * kerfWidth) + railTrackWidth + flatTrackWidth} rotation={0} strokeWidth={strokeWidth} />);
        rails.push(<SideRail key={"flat-side"} table={props.table} x={strokeWidth / 2} y={firstRail + (2 * kerfWidth) + railTrackWidth + flatTrackWidth + tableThickness + kerfWidth} rotation={0} strokeWidth={strokeWidth} />);
    }

    let testPartY = firstRail;
    if (configuration == "LR4") {
        testPartY = firstRail + (2 * kerfWidth) + flatTrackWidth + railTrackWidth + (2 * (tableThickness + kerfWidth));
    }

	const calibrationSquareX = (strokeWidth / 2) + (7 * materialThickness);

    // Exact extent of the drawn parts, so the view fits them with no dead space.
    // Rails that are too long for the sheet are split into two pieces, the
    // second of which sits a kerf further right than the rail's own length.
    const railLength = yCut + yBuffer;
    const railSplitBuffer = railLength > props.table.trackCutPoint ? kerfWidth : 0;
    const contentWidth = railLength + railSplitBuffer + strokeWidth;
    // The test parts and the calibration square share the last row.
    const lastRowHeight = Math.max(tableThickness, props.table.calibrationSquareSize);
    const contentHeight = testPartY + lastRowHeight + (strokeWidth / 2);

    // Stand the sheet up: a quarter turn counter-clockwise maps (x, y) to
    // (y, contentWidth - x), so the width and height of the view swap. Doing it
    // here rather than in CSS keeps the SVG's aspect ratio honest, so it scales
    // to fit its container, and keeps the downloaded file at real-world size.
    const viewBox = `0 0 ${contentHeight} ${contentWidth}`;

    return (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" version="1.1">
                <g transform={`translate(0, ${contentWidth}) rotate(-90)`}>
                    {ySpars}
                    {xSpars}
                    {rails}
                    <TestParts table={props.table} x={strokeWidth / 2} y={testPartY} rotation={0} strokeWidth={strokeWidth} />
                    <CalibrationSquare table={props.table} x={calibrationSquareX} y={testPartY} rotation={0} strokeWidth={strokeWidth} />
                </g>
            </svg>
        </>
    )
}
