import { createRef } from 'react';
import WithDraggableBlockSnap from '../base/WithDraggableBlockSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';
import { AddInputBox, InputBox } from '../../inputBox/inputBox';

function RunBlockClass(props) {

    const blockID = props.blockID;
    const spriteID = props.spriteID;
    const inputID = props.inputID || null;

    const nextBlockID =
        useSpriteStore.getState().sprites[spriteID]?.blocks[blockID]?.nextBlockID;

    const prevBlockID =
        useSpriteStore.getState().sprites[spriteID]?.blocks[blockID]?.prevBlockID;

    return (
        <div
            ref={props.domRef}
            className="cursor-grab select-none bg-amber-400 text-white p-2 rounded flex items-center gap-2"
        >
            When{" "}
            <span className="bg-emerald-500 px-2 py-1 rounded font-semibold">
                Run
            </span>{" "}
            button is clicked
        </div>
    );
}

const RunBlock = WithDraggableBlockSnap(RunBlockClass);

const AddRunBlock = () => {
    const blockRef = createRef();
    const domRef = createRef();
    const blockID = useID.getState().blocks;
    const spriteID = useSpriteID.getState().id;
    const block = <RunBlock domRef={domRef} ref={blockRef} 
                   blockID={blockID} spriteID = {spriteID}/>;

    useSpriteStore.getState().addBlock(spriteID, blockID, blockRef, domRef, block, null, null, null);
    useID.getState().incrementBlocks();
}

const PalleteBlock = WithPalleteBlock(RunBlockClass, AddRunBlock);

const registerRunBlock = () => {
    const domRef = createRef();
    const block = <PalleteBlock className = "absolute" domRef={domRef}/>;

    useBlockStore.getState().addBlock(block, "Control");
}

export {registerRunBlock};