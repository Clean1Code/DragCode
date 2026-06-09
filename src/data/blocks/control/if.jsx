import { createRef, useState } from 'react';
import WithDraggableBlockSnap from '../base/WithDraggableBlockSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';
import { AddInputBox, InputBox } from '../../inputBox/inputBox';

function IfBlockClass(props) {
    const input = useSpriteStore((state) => {
        if (!props.inputList) return props.inputBlock;
        const inputID = props.inputList[0];
        const inputData = state.inputs[inputID];
        
        if (inputData.blockID) return state[inputData.blockType][inputData.blockID].block;
        return inputData.block;
    });

    return (
        <div
            ref={props.domRef}
            className="cursor-grab select-none bg-amber-500 text-white p-2 rounded flex items-center gap-2 outline outline-1 outline-amber-600"
        >
            <span>if</span>
            {input}
            <span>then</span>
        </div>
    );
}

function EndIfBlockClass(props) {
    const parentID = props.parentID;


    return (
        <div
            ref={props.domRef}
            className="cursor-grab select-none bg-amber-500 text-white p-2 rounded flex items-center gap-2 outline outline-1 outline-amber-600"
        >
            <span>end if</span>
        </div>
    );
}

function ConnectorBlockClass(props) {
    const blockStartID = props.blockStartID;
    const blockEndID = props.blockEndID;
    const posX = useSpriteStore((state) => state.blocks[blockStartID].x);
    const startY = useSpriteStore((state) => state.blocks[blockStartID].y) + 5;
    const endY = useSpriteStore((state) => state.blocks[blockEndID].y) + 5;
    useSpriteStore.getState().blocks[blockStartID].offsetNextX = 30;
    useSpriteStore.getState().blocks[blockEndID].offsetX = -30;

    return (
        <div>
            <div
                className="bg-amber-500 outline outline-1 outline-amber-600"
                style={{
                    position: "absolute",
                    left: `${posX}px`,
                    top: `${Math.min(startY, endY)}px`,
                    width: "30px",
                    height: `${Math.abs(endY - startY)}px`,
                    zIndex: "-1",
                }}
            />
        </div>
    )
}

const IfBlock = WithDraggableBlockSnap(IfBlockClass);
const EndIfBlock = WithDraggableBlockSnap(EndIfBlockClass);
const ConnectorBlock = ConnectorBlockClass;

const AddIfBlock = () => {
    //If block
    const blockRef = createRef();
    const domRef = createRef();
    const blockID = useID.getState().blocks;
    const spriteID = useSpriteID.getState().id;
    const inputID = useID.getState().inputs;
    const inputList = [inputID];

    useID.getState().incrementBlocks();
    useID.getState().incrementInputs();

    AddInputBox(spriteID, inputID, "blocks", blockID, null, null);
    const block = <IfBlock domRef={domRef} ref={blockRef} 
                   blockID={blockID} spriteID = {spriteID} inputList = {inputList}/>;

    useSpriteStore.getState().addBlock(spriteID, blockID, blockRef, domRef, block, inputList, null, null, "if");

    useSpriteStore.getState().blocks[blockID].nextBlockID = blockID+1;

    //End if block
    const blockRef2 = createRef();
    const domRef2 = createRef();
    const blockID2 = useID.getState().blocks;

    useID.getState().incrementBlocks();

    const endBlock = <EndIfBlock domRef={domRef2} ref={blockRef2} blockID={blockID2} spriteID = {spriteID} inputList = {null} parentID={blockID}/>;

    useSpriteStore.getState().addBlock(spriteID, blockID2, blockRef2, domRef2, endBlock, null, null, null, "endif");

    useSpriteStore.getState().blocks[blockID2].prevBlockID = blockID;
    useSpriteStore.getState().blocks[blockID].branches.push(blockID2);

    //Connector
    const blockID3 = useID.getState().blocks;
    useID.getState().incrementBlocks();
    const connectorBlock = <ConnectorBlock blockStartID={blockID} blockEndID={blockID2}/>
    useSpriteStore.getState().addConnector(spriteID, blockID3, connectorBlock);
}

const PalleteBlock = WithPalleteBlock(IfBlockClass, AddIfBlock);

const registerIfBlock = () => {
    const domRef = createRef();
    const inputBlock = <InputBox />;
    const block = <PalleteBlock className = "absolute" domRef={domRef} inputID = {null} inputBlock={inputBlock}/>;

    useBlockStore.getState().addBlock(block, "Control");
}

export {registerIfBlock};