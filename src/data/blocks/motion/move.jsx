import { createRef, useState } from 'react';
import WithDraggableBlockSnap from '../base/WithDraggableBlockSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';
import { AddInputBox, InputBox } from '../../inputBox/inputBox';

function MoveBlockClass(props) {
    const spriteID = props.spriteID;

    const input = useSpriteStore((state) => {
        if (!props.inputList) return props.inputBlock;
        const inputID = props.inputList[0];
        const inputData = state.sprites[spriteID].inputs[inputID];
        
        if (inputData.blockID) return state.sprites[spriteID][inputData.blockType][inputData.blockID].block;
        return inputData.block;
    });
    return (
        <div
            ref={props.domRef}
            className="cursor-grab select-none bg-blue-400 text-white p-2 rounded flex items-center gap-2"
        >
            <span>move</span>

            {input}

            <span>steps</span>
        </div>
    );
}

const MoveBlock = WithDraggableBlockSnap(MoveBlockClass);

const AddMoveBlock = () => {
    const blockRef = createRef();
    const domRef = createRef();
    const blockID = useID.getState().blocks;
    const spriteID = useSpriteID.getState().id;
    const inputID = useID.getState().inputs;
    const inputList = [inputID];
    AddInputBox(spriteID, inputID, "blocks", blockID, null, null);
    const block = <MoveBlock domRef={domRef} ref={blockRef} 
                   blockID={blockID} spriteID = {spriteID} inputList = {inputList}/>;

    useSpriteStore.getState().addBlock(spriteID, blockID, blockRef, domRef, block, inputList, null, null);
    useID.getState().incrementBlocks();
    useID.getState().incrementInputs();
}

const PalleteBlock = WithPalleteBlock(MoveBlockClass, AddMoveBlock);

const registerMoveBlock = () => {
    const domRef = createRef();
    const inputBlock = <InputBox />;
    const block = <PalleteBlock className = "absolute" domRef={domRef} inputID = {null} inputBlock={inputBlock}/>;

    useBlockStore.getState().addBlock(block, "Motion");
}

export {registerMoveBlock};