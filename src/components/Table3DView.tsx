import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Table } from '../models/Table';
import { crossLayout } from '../lib/layout3d';
import * as THREE from 'three';
import { useEffect, useRef, useState, useMemo } from 'react';

type Table3DViewProps = {
    table: Table;
};

// One colour per part, so a crowded frame is still readable: warm tones for the
// sheet goods you are cutting, grey for the machine's own rails.
const partColors = {
    ySpar: '#e0b888',
    xSpar: '#8b5a3c',
    sideRail: '#999999',
    topRail1: '#bbbbbb',
    topRail2: '#999999',
    tubeRail1: '#aaaaaa',
    tubeRail2: '#888888',
    spoilboard: '#d4a574',
};

// Turned a little off square, so the first thing you see is a three-quarter
// view with some depth to it rather than a flat elevation.
const defaultViewRotation = -0.42;

// Y Spar component (base layer)
function YSpar3D({ table, index, color }: { table: Table; index: number; color: string }) {
    const thickness = table.thickness;
    const material = table.material;
    const overhang = table.overhang;
    const yCut = table.yCut - (2 * overhang);
    const ySparGap = table.ySparGap;
    const xSparCount = table.xSparCount;
    const xSparGap = table.xSparGap;
    // Slots are open at the top here, so their floor sits this far up from the
    // bottom edge. Reads the same slot depth the cut paths use, so the overcut
    // setting shows up in the model.
    const slotFloor = thickness - table.slotDepth;

    // Position along X axis
    const xPosition = (index * ySparGap) + overhang - (table.xCut / 2);

    // Create geometry with mortises for X spars - standing on edge
    // Y spars run along Z direction (yCut length)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, slotFloor);

    // Mortises are gaps in the top half
    const xMortises = xSparCount - 1;
    for (let i = 0; i < xMortises; i++) {
        const z = (i * xSparGap);
        shape.lineTo(z + material, slotFloor);
        shape.lineTo(z + material, thickness);
        shape.lineTo(z + xSparGap, thickness);
        shape.lineTo(z + xSparGap, slotFloor);
    }

    shape.lineTo(yCut, slotFloor);
    shape.lineTo(yCut, 0);
    shape.lineTo(0, 0);
    
    const extrudeSettings = {
        depth: material,
        bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(-Math.PI / 2);
    geometry.rotateX(-Math.PI / 2);
    geometry.rotateY(Math.PI);
    geometry.translate(-material / 2, -yCut / 2, 0);

    // xPosition is the spar's near face, matching the mortise it drops into, so
    // shift by half its thickness to place the middle of the part.
    return (
        <mesh geometry={geometry} position={[xPosition + (material / 2), 0, 0]}>
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

// X Spar component (top layer)
function XSpar3D({ table, index, color }: { table: Table; index: number; color: string }) {
    const thickness = table.thickness;
    const material = table.material;
    const flatBuffer = table.flatBuffer;
    const railBuffer = table.railBuffer;
    const xShrink = table.xSparRailShrink;
    const flatOutsideBuffer = table.flatOutsideBuffer;
    const railOutsideBuffer = table.railOutsideBuffer;
    const xCut = table.xCut + flatBuffer + railBuffer - xShrink + flatOutsideBuffer + railOutsideBuffer;
    const overhang = table.overhang;
    const ySparCount = table.ySparCount;
    const ySparGap = table.ySparGap;
    const xSparGap = table.xSparGap;
    const yCut = table.yCut;
    // Slots are open at the bottom here, so this is how far up they reach.
    const slotDepth = table.slotDepth;

    // Position along Z axis (perpendicular to Y spars)
    const zPosition = (index * xSparGap) + overhang - (yCut / 2);

    // Create geometry - stands on edge, runs along X axis, notches at bottom
    const shape = new THREE.Shape();
    const start = flatBuffer + flatOutsideBuffer + overhang - (xShrink / 2);

    // Build path starting from bottom left
    if (start == 0) {
        shape.moveTo(0, slotDepth);
    } else {
        shape.moveTo(0, 0);
    }

    // Create notches from the bottom edge for Y spars
    for (let i = 0; i < ySparCount; i++) {
        const x = (i * ySparGap) + start;
        if (x != 0) {
            shape.lineTo(x, 0);
        }
        shape.lineTo(x, slotDepth);
        shape.lineTo(x + material, slotDepth);

        if (x + material != xCut) {
            shape.lineTo(x + material, 0);
        }
    }

    if (start != 0) {
        shape.lineTo(xCut, 0);
    }

    shape.lineTo(xCut, thickness);
    shape.lineTo(0, thickness);
    shape.lineTo(0, start == 0 ? slotDepth : 0);
    
    const extrudeSettings = {
        depth: material,
        bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Stand on edge, running along X axis. After the quarter turn the part
    // occupies x 0..xCut along the table, y -material..0 across it, and
    // z 0..thickness vertically; the translate puts its left end on the spar
    // anchor, its near face on zero, and its underside on the ground.
    geometry.rotateX(Math.PI / 2);
    geometry.translate(crossLayout(table).sparLeft, material, 0);

    return (
        <mesh geometry={geometry} position={[0, zPosition, 0]}>
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

// Helper function to create rail geometry with mounting holes
function createRailWithHoles(table: Table, width: number, length: number, thickness: number, isRail: boolean, startOffset: number = 0) {
    const holeSize = table.holeSize;
    const outsideBuffer = isRail ? table.railOutsideBuffer : table.flatOutsideBuffer;
    const trackWidth = isRail ? table.railTrackWidth : table.flatTrackWidth;
    
    // Get hole coordinates from table. The setbacks run along the rail and are
    // the same whichever side it is on; the positions across it get adjusted
    // below, so only those are reassigned.
    const frontHoles = table.frontHoleCoordinates;
    const backHoles = table.backHoleCoordinates;

    const [yFrontSetback] = frontHoles;
    const [yBackFirstSetback, yBackSecondSetback] = backHoles;

    let [, yFrontFirstX, yFrontSecondX] = frontHoles;
    let [, , yBackFirstX, yBackSecondX] = backHoles;

    // Adjust hole positions based on rail type
    if (isRail) {
        yFrontFirstX = trackWidth - yFrontFirstX - outsideBuffer;
        yFrontSecondX = trackWidth - yFrontSecondX - outsideBuffer;
        yBackFirstX = trackWidth - yBackFirstX - outsideBuffer;
        yBackSecondX = trackWidth - yBackSecondX - outsideBuffer;
    } else {
        yFrontFirstX += outsideBuffer;
        yFrontSecondX += outsideBuffer;
        yBackFirstX += outsideBuffer;
        yBackSecondX += outsideBuffer;
    }
    
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, length);
    shape.lineTo(0, length);
    shape.lineTo(0, 0);
    
    const holes: Array<{x: number, y: number}> = [];
    
    // Add holes for front mounting points (only if within this piece)
    if (yFrontSetback >= startOffset && yFrontSetback <= startOffset + length) {
        const localY = yFrontSetback - startOffset;
        const hole1 = new THREE.Path();
        hole1.absarc(yFrontFirstX, localY, holeSize / 2, 0, Math.PI * 2, false);
        shape.holes.push(hole1);
        holes.push({x: yFrontFirstX, y: localY});
        
        const hole2 = new THREE.Path();
        hole2.absarc(yFrontSecondX, localY, holeSize / 2, 0, Math.PI * 2, false);
        shape.holes.push(hole2);
        holes.push({x: yFrontSecondX, y: localY});
    }
    
    // Add holes for back mounting points (only if within this piece)
    const totalLength = table.yCut + table.yBuffer;
    const backHoleY1 = totalLength - yBackFirstSetback;
    const backHoleY2 = totalLength - yBackSecondSetback;
    
    if (backHoleY1 >= startOffset && backHoleY1 <= startOffset + length) {
        const localY = backHoleY1 - startOffset;
        const hole3 = new THREE.Path();
        hole3.absarc(yBackFirstX, localY, holeSize / 2, 0, Math.PI * 2, false);
        shape.holes.push(hole3);
        holes.push({x: yBackFirstX, y: localY});
    }
    
    if (backHoleY2 >= startOffset && backHoleY2 <= startOffset + length) {
        const localY = backHoleY2 - startOffset;
        const hole4 = new THREE.Path();
        hole4.absarc(yBackSecondX, localY, holeSize / 2, 0, Math.PI * 2, false);
        shape.holes.push(hole4);
        holes.push({x: yBackSecondX, y: localY});
    }
    
    // Add clip holes for tube rail (only those within this piece)
    if (isRail) {
        const offset = trackWidth - table.clipOffset - table.railOutsideBuffer;
        const holeStart = table.clipsFrontSetback;
        const clipCount = table.clipCount;
        const clipGap = table.clipGap;
        
        for (let clip = 0; clip < clipCount; clip++) {
            const clipY = (clip * clipGap) + holeStart;
            if (clipY >= startOffset && clipY <= startOffset + length) {
                const localY = clipY - startOffset;
                const clipHole = new THREE.Path();
                clipHole.absarc(offset, localY, holeSize / 2, 0, Math.PI * 2, false);
                shape.holes.push(clipHole);
                holes.push({x: offset, y: localY});
            }
        }
    }
    
    const extrudeSettings = {
        depth: thickness,
        bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Calculate spar alignment marks positions
    const sparInset = table.overhang + (table.yBuffer / 2);
    const marks: Array<{y: number}> = [];
    
    // Front mark (only if within this piece)
    if (sparInset >= startOffset && sparInset <= startOffset + length) {
        marks.push({y: sparInset - startOffset});
    }
    
    // Back mark (only if within this piece)
    const railTotalLength = table.yCut + table.yBuffer;
    const backMarkY = railTotalLength - sparInset;
    if (backMarkY >= startOffset && backMarkY <= startOffset + length) {
        marks.push({y: backMarkY - startOffset});
    }
    
    return { geometry, holes, marks };
}

// Rails component - SideRails that connect to ends of X spars
function Rails3D({ table, showSideRails, showTopRail1, showTopRail2, showTubeRail1, showTubeRail2 }: {
    table: Table;
    showSideRails: boolean;
    showTopRail1: boolean;
    showTopRail2: boolean;
    showTubeRail1: boolean;
    showTubeRail2: boolean;
}) {
    const thickness = table.thickness;
    const railMaterialThickness = table.railMaterialThickness;
    const material = table.material;
    const yCut = table.yCut;
    const overhang = table.overhang;
    const xSparGap = table.xSparGap;
    const yBuffer = table.yBuffer;
    const length = yCut + yBuffer;
    const railTrackWidth = table.railTrackWidth;
    const flatTrackWidth = table.flatTrackWidth;

    const rails = [];

    // Side rails cap the ends of the X spars, so they run along Y at the two
    // ends of the shared cross-table layout.
    const layout = crossLayout(table);
    const leftEnd = layout.sparLeft - (railMaterialThickness / 2);
    const rightEnd = layout.sparRight + (railMaterialThickness / 2);

    // Alignment marks: a nick proud of the rail's inner face, sized off the rail
    // stock so it stays visible whatever units the table is in.
    const markDepth = railMaterialThickness * 0.15;
    const markWidth = railMaterialThickness * 0.25;

    // Left side rail (at left end of X spars)
    if (showSideRails) {
        const sparInset = overhang + (yBuffer / 2);
        rails.push(
            <group key="side-rail-left-group">
                <mesh position={[leftEnd, 0, thickness / 2]}>
                    <boxGeometry args={[railMaterialThickness, length, thickness]} />
                    <meshStandardMaterial color={partColors.sideRail} />
                </mesh>
                {/* Alignment marks at sparInset positions (front and back) */}
                <mesh position={[leftEnd + (railMaterialThickness / 2) - (markDepth / 2), sparInset - length / 2, thickness / 2]}>
                    <boxGeometry args={[markDepth, markWidth, thickness * 0.5]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
                <mesh position={[leftEnd + (railMaterialThickness / 2) - (markDepth / 2), length - sparInset - length / 2, thickness / 2]}>
                    <boxGeometry args={[markDepth, markWidth, thickness * 0.5]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
            </group>
        );
    }
    
    // Right side rail (at right end of X spars)
    if (showSideRails) {
        const sparInset = overhang + (yBuffer / 2);
        rails.push(
            <group key="side-rail-right-group">
                <mesh position={[rightEnd, 0, thickness / 2]}>
                    <boxGeometry args={[railMaterialThickness, length, thickness]} />
                    <meshStandardMaterial color={partColors.sideRail} />
                </mesh>
                {/* Alignment marks at sparInset positions (front and back) */}
                <mesh position={[rightEnd - (railMaterialThickness / 2) + (markDepth / 2), sparInset - length / 2, thickness / 2]}>
                    <boxGeometry args={[markDepth, markWidth, thickness * 0.5]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
                <mesh position={[rightEnd - (railMaterialThickness / 2) + (markDepth / 2), length - sparInset - length / 2, thickness / 2]}>
                    <boxGeometry args={[markDepth, markWidth, thickness * 0.5]} />
                    <meshStandardMaterial color="#666666" />
                </mesh>
            </group>
        );
    }
    
    // Top rails sit flat on top of side rails and X spars
    // Left gets flat rail (wider), right gets tube rail (narrower)
    // Rails lay flat, not on edge, aligned with inner edge of side rails
    
    // Check if rails need to be split into two pieces
    const maxLength = table.trackCutPoint;
    const sparInset = overhang + (yBuffer / 2);
    const needsSplit = length > maxLength;
    
    let firstLength = maxLength;
    if (needsSplit) {
        const safeCutPoint = xSparGap + (4 * material) + sparInset;
        if (length - firstLength < safeCutPoint) {
            firstLength = length - safeCutPoint;
        }
    }
    
    const secondLength = length - firstLength;
    
    // Pre-compute all geometries (must be unconditional for React hooks)
    const flatRailData1 = useMemo(() => 
        createRailWithHoles(table, flatTrackWidth, firstLength, railMaterialThickness, false, 0), 
        [table, flatTrackWidth, firstLength, railMaterialThickness]);
    
    const flatRailData2 = useMemo(() => 
        createRailWithHoles(table, flatTrackWidth, secondLength, railMaterialThickness, false, firstLength), 
        [table, flatTrackWidth, secondLength, railMaterialThickness, firstLength]);
    
    const flatRailDataSingle = useMemo(() => 
        createRailWithHoles(table, flatTrackWidth, length, railMaterialThickness, false, 0), 
        [table, flatTrackWidth, length, railMaterialThickness]);
    
    const tubeRailData1 = useMemo(() => 
        createRailWithHoles(table, railTrackWidth, firstLength, railMaterialThickness, true, 0), 
        [table, railTrackWidth, firstLength, railMaterialThickness]);
    
    const tubeRailData2 = useMemo(() => 
        createRailWithHoles(table, railTrackWidth, secondLength, railMaterialThickness, true, firstLength), 
        [table, railTrackWidth, secondLength, railMaterialThickness, firstLength]);
    
    const tubeRailDataSingle = useMemo(() => 
        createRailWithHoles(table, railTrackWidth, length, railMaterialThickness, true, 0), 
        [table, railTrackWidth, length, railMaterialThickness]);
    
    // Rails are a Lowrider 4 thing. Bailing out here rather than at the top
    // of the component keeps the hooks above unconditional.
    if (table.configuration !== "LR4") return null;

    // Left flat rail (wider) - laying flat, aligned with inner edge
    // Outer edge on the outside of the left side rail. The outside buffer is
    // part of flatTrackWidth, so the track datum stays put as it changes.
    const xPos = layout.railLeft + (flatTrackWidth / 2);
    
    if (needsSplit) {
        // First piece
        if (showTopRail1) {
            const pos: [number, number, number] = [xPos - flatTrackWidth / 2, -length / 2, thickness];
            rails.push(
                <group key="flat-rail-left-1-group">
                    <mesh position={pos}>
                        <primitive object={flatRailData1.geometry} />
                        <meshStandardMaterial color={partColors.topRail1} />
                    </mesh>
                    {flatRailData1.holes.map((hole, i) => (
                        <mesh key={`hole-${i}`} position={[pos[0] + hole.x, pos[1] + hole.y, pos[2] + railMaterialThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[table.holeSize / 2, table.holeSize / 2, railMaterialThickness, 16]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                    ))}
                    {flatRailData1.marks.map((mark, i) => (
                        <mesh key={`mark-${i}`} position={[pos[0] + flatTrackWidth / 2, pos[1] + mark.y, pos[2] + markDepth]}>
                            <boxGeometry args={[flatTrackWidth * 0.5, markDepth, markWidth]} />
                            <meshStandardMaterial color="#666666" />
                        </mesh>
                    ))}
                </group>
            );
        }
        
        // Second piece
        if (showTopRail2) {
            const pos: [number, number, number] = [xPos - flatTrackWidth / 2, length / 2 - secondLength, thickness];
            rails.push(
                <group key="flat-rail-left-2-group">
                    <mesh position={pos}>
                        <primitive object={flatRailData2.geometry} />
                        <meshStandardMaterial color={partColors.topRail2} />
                    </mesh>
                    {flatRailData2.holes.map((hole, i) => (
                        <mesh key={`hole-${i}`} position={[pos[0] + hole.x, pos[1] + hole.y, pos[2] + railMaterialThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[table.holeSize / 2, table.holeSize / 2, railMaterialThickness, 16]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                    ))}
                    {flatRailData2.marks.map((mark, i) => (
                        <mesh key={`mark-${i}`} position={[pos[0] + flatTrackWidth / 2, pos[1] + mark.y, pos[2] + markDepth]}>
                            <boxGeometry args={[flatTrackWidth * 0.5, markDepth, markWidth]} />
                            <meshStandardMaterial color="#666666" />
                        </mesh>
                    ))}
                </group>
            );
        }
    } else {
        // Single piece - use first piece settings when not split
        if (showTopRail1) {
            const pos: [number, number, number] = [xPos - flatTrackWidth / 2, -length / 2, thickness];
            rails.push(
                <group key="flat-rail-left-group">
                    <mesh position={pos}>
                        <primitive object={flatRailDataSingle.geometry} />
                        <meshStandardMaterial color={partColors.topRail1} />
                    </mesh>
                    {flatRailDataSingle.holes.map((hole, i) => (
                        <mesh key={`hole-${i}`} position={[pos[0] + hole.x, pos[1] + hole.y, pos[2] + railMaterialThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[table.holeSize / 2, table.holeSize / 2, railMaterialThickness, 16]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                    ))}
                    {flatRailDataSingle.marks.map((mark, i) => (
                        <mesh key={`mark-${i}`} position={[pos[0] + flatTrackWidth / 2, pos[1] + mark.y, pos[2] + markDepth]}>
                            <boxGeometry args={[flatTrackWidth * 0.5, markDepth, markWidth]} />
                            <meshStandardMaterial color="#666666" />
                        </mesh>
                    ))}
                </group>
            );
        }
    }
    
    // Right tube rail (narrower) - laying flat, aligned with inner edge
    // Mirror of the flat rail: outer edge on the outside of the right side rail.
    const xPosRight = layout.railRight - (railTrackWidth / 2);
    
    if (needsSplit) {
        // First piece
        if (showTubeRail1) {
            const pos: [number, number, number] = [xPosRight - railTrackWidth / 2, -length / 2, thickness];
            rails.push(
                <group key="tube-rail-right-1-group">
                    <mesh position={pos}>
                        <primitive object={tubeRailData1.geometry} />
                        <meshStandardMaterial color={partColors.tubeRail1} />
                    </mesh>
                    {tubeRailData1.holes.map((hole, i) => (
                        <mesh key={`hole-${i}`} position={[pos[0] + hole.x, pos[1] + hole.y, pos[2] + railMaterialThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[table.holeSize / 2, table.holeSize / 2, railMaterialThickness, 16]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                    ))}
                    {tubeRailData1.marks.map((mark, i) => (
                        <mesh key={`mark-${i}`} position={[pos[0] + railTrackWidth / 2, pos[1] + mark.y, pos[2] + markDepth]}>
                            <boxGeometry args={[railTrackWidth * 0.5, markDepth, markWidth]} />
                            <meshStandardMaterial color="#666666" />
                        </mesh>
                    ))}
                </group>
            );
        }
        
        // Second piece
        if (showTubeRail2) {
            const pos: [number, number, number] = [xPosRight - railTrackWidth / 2, length / 2 - secondLength, thickness];
            rails.push(
                <group key="tube-rail-right-2-group">
                    <mesh position={pos}>
                        <primitive object={tubeRailData2.geometry} />
                        <meshStandardMaterial color={partColors.tubeRail2} />
                    </mesh>
                    {tubeRailData2.holes.map((hole, i) => (
                        <mesh key={`hole-${i}`} position={[pos[0] + hole.x, pos[1] + hole.y, pos[2] + railMaterialThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[table.holeSize / 2, table.holeSize / 2, railMaterialThickness, 16]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                    ))}
                    {tubeRailData2.marks.map((mark, i) => (
                        <mesh key={`mark-${i}`} position={[pos[0] + railTrackWidth / 2, pos[1] + mark.y, pos[2] + markDepth]}>
                            <boxGeometry args={[railTrackWidth * 0.5, markDepth, markWidth]} />
                            <meshStandardMaterial color="#666666" />
                        </mesh>
                    ))}
                </group>
            );
        }
    } else {
        // Single piece - use first piece settings when not split
        if (showTubeRail1) {
            const pos: [number, number, number] = [xPosRight - railTrackWidth / 2, -length / 2, thickness];
            rails.push(
                <group key="tube-rail-right-group">
                    <mesh position={pos}>
                        <primitive object={tubeRailDataSingle.geometry} />
                        <meshStandardMaterial color={partColors.tubeRail1} />
                    </mesh>
                    {tubeRailDataSingle.holes.map((hole, i) => (
                        <mesh key={`hole-${i}`} position={[pos[0] + hole.x, pos[1] + hole.y, pos[2] + railMaterialThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[table.holeSize / 2, table.holeSize / 2, railMaterialThickness, 16]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                    ))}
                    {tubeRailDataSingle.marks.map((mark, i) => (
                        <mesh key={`mark-${i}`} position={[pos[0] + railTrackWidth / 2, pos[1] + mark.y, pos[2] + markDepth]}>
                            <boxGeometry args={[railTrackWidth * 0.5, markDepth, markWidth]} />
                            <meshStandardMaterial color="#666666" />
                        </mesh>
                    ))}
                </group>
            );
        }
    }
    
    return <>{rails}</>;
}

// Spoilboard component (top surface)
function Spoilboard({ table, color }: { table: Table; color: string }) {
    const xCut = table.xCut;
    const yCut = table.yCut;
    const thickness = table.thickness;
    const railMaterialThickness = table.railMaterialThickness;
    
    // Spoilboard sits on top of everything
    const zPosition = thickness + railMaterialThickness / 2;
    
    return (
        <mesh position={[0, 0, zPosition]}>
            <boxGeometry args={[xCut, yCut, railMaterialThickness]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default function Table3DView(props: Table3DViewProps) {
    const table = props.table;
    const ySparCount = table.ySparCount;
    const xSparCount = table.xSparCount;
    
    // Scale factor to normalize view regardless of units (scale to inches as baseline)
    const scaleToInches = {
        "mm": 1 / 25.4,
        "cm": 1 / 2.54,
        "in": 1,
    }[table.units];
    
    // Visibility state for each part type
    const [showYSpars, setShowYSpars] = useState(true);
    const [showXSpars, setShowXSpars] = useState(true);
    const [showSideRails, setShowSideRails] = useState(true);
    const [showTopRail1, setShowTopRail1] = useState(true);
    const [showTopRail2, setShowTopRail2] = useState(true);
    const [showTubeRail1, setShowTubeRail1] = useState(true);
    const [showTubeRail2, setShowTubeRail2] = useState(true);
    const [showSpoilboard, setShowSpoilboard] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    
    // Z-axis rotation state
    const groupRef = useRef<THREE.Group>(null);
    const orbitControlsRef = useRef<OrbitControlsImpl>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const [isRotating, setIsRotating] = useState(false);
    const [lastMouseX, setLastMouseX] = useState(0);

    // The scene is drawn in table units and the group is scaled to inches, so
    // everything about the framing is worked out from the table's longest side.
    // A 4x8 sheet and a small bench table then both open filling the view.
    const span = Math.max(table.xCut, table.yCut) * scaleToInches;
    const cameraPosition: [number, number, number] = [0, -1.35 * span, 0.62 * span];
    const cameraTarget: [number, number, number] = [0, -0.2 * span, -0.2 * span];

    // Reset view to default
    const resetView = () => {
        if (cameraRef.current && orbitControlsRef.current) {
            cameraRef.current.position.set(...cameraPosition);
            orbitControlsRef.current.target.set(...cameraTarget);
            orbitControlsRef.current.update();
        }
        if (groupRef.current) {
            groupRef.current.rotation.z = defaultViewRotation;
        }
    };
    
    // Handle Z-axis rotation with Shift + Right Click
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 2 && e.shiftKey) { // Right click + Shift
                e.preventDefault();
                setIsRotating(true);
                setLastMouseX(e.clientX);
            }
        };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (isRotating && groupRef.current) {
                const deltaX = e.clientX - lastMouseX;
                groupRef.current.rotation.z += deltaX * 0.01;
                setLastMouseX(e.clientX);
            }
        };
        
        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 2) {
                setIsRotating(false);
            }
        };
        
        const handleContextMenu = (e: MouseEvent) => {
            if (e.shiftKey) {
                e.preventDefault();
            }
        };
        
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('contextmenu', handleContextMenu);
        
        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [isRotating, lastMouseX]);
    
    // Generate Y spars (base layer)
    const ySpars = [];
    if (showYSpars) {
        for (let i = 0; i < ySparCount; i++) {
            ySpars.push(<YSpar3D key={`y-spar-${i}`} table={table} index={i} color={partColors.ySpar} />);
        }
    }
    
    // Generate X spars (top layer)
    const xSpars = [];
    if (showXSpars) {
        for (let i = 0; i < xSparCount; i++) {
            xSpars.push(<XSpar3D key={`x-spar-${i}`} table={table} index={i} color={partColors.xSpar} />);
        }
    }
    
    // One row each, so the panel is a list rather than eight copies of the same
    // six lines of markup.
    const partToggles: [string, boolean, (on: boolean) => void][] = [
        ['X spars', showXSpars, setShowXSpars],
        ['Y spars', showYSpars, setShowYSpars],
        ['Side rails', showSideRails, setShowSideRails],
        ['Flat rail 1', showTopRail1, setShowTopRail1],
        ['Flat rail 2', showTopRail2, setShowTopRail2],
        ['Tube rail 1', showTubeRail1, setShowTubeRail1],
        ['Tube rail 2', showTubeRail2, setShowTubeRail2],
        ['Spoilboard', showSpoilboard, setShowSpoilboard],
    ];

    const toggleRow = ([label, checked, setChecked]: [string, boolean, (on: boolean) => void]) => (
        <label key={label} className="flex cursor-pointer items-center gap-1.5 py-0.5 text-gray-700">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="h-3 w-3 shrink-0"
            />
            {label}
        </label>
    );

    return (
        <div className="w-full h-full relative">
            {/* Kept small and in the corner: the model is what you came for. */}
            <div className="absolute top-2 right-2 z-10 max-h-[92%] w-36 overflow-y-auto rounded-md bg-white/95 p-2 text-xs shadow-md">
                <div className="mb-1 font-semibold text-gray-900">Show parts</div>
                {partToggles.map(toggleRow)}
                <div className="mt-1 border-t border-gray-200 pt-1">
                    {toggleRow(['Grid', showGrid, setShowGrid])}
                </div>
                <div className="mt-1 space-y-0.5 border-t border-gray-200 pt-1 text-[11px] leading-tight text-gray-500">
                    <div>Drag: orbit</div>
                    <div>Right-drag: pan</div>
                    <div>Shift right-drag: spin</div>
                    <div>Scroll: zoom</div>
                </div>
                <div className="mt-1 space-y-0.5 border-t border-gray-200 pt-1 text-[11px] leading-tight text-gray-500">
                    <div><span className="font-medium text-red-500">Red</span> left&ndash;right</div>
                    <div><span className="font-medium text-green-600">Green</span> front&ndash;back</div>
                    <div><span className="font-medium text-blue-500">Blue</span> up</div>
                </div>
                <button
                    onClick={resetView}
                    className="mt-2 w-full cursor-pointer rounded bg-slate-500 px-2 py-1 text-white hover:bg-slate-600"
                >
                    Reset view
                </button>
            </div>

            <Canvas>
                <PerspectiveCamera ref={cameraRef} makeDefault position={cameraPosition} fov={50} />
                <OrbitControls
                    ref={orbitControlsRef}
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={0.2 * span}
                    maxDistance={5 * span}
                    target={cameraTarget}
                />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} />

                <group ref={groupRef} rotation={[0, 0, defaultViewRotation]} scale={[scaleToInches, scaleToInches, scaleToInches]}>
                    {ySpars}
                    {xSpars}
                    <Rails3D 
                        table={table} 
                        showSideRails={showSideRails}
                        showTopRail1={showTopRail1}
                        showTopRail2={showTopRail2}
                        showTubeRail1={showTubeRail1}
                        showTubeRail2={showTubeRail2}
                    />
                    {showSpoilboard && <Spoilboard table={table} color={partColors.spoilboard} />}
                    {showGrid && <gridHelper args={[(2 * span) / scaleToInches, 20]} rotation={[Math.PI / 2, 0, 0]} />}

                    {/* Which way round the table is. Drawn rather than
                        labelled: drei's <Text> pulls a font off a CDN at
                        runtime, which would leave the view wrong offline. */}
                    <axesHelper args={[(0.6 * span) / scaleToInches]} />
                </group>
                
            </Canvas>
        </div>
    );
}
