import { createRef } from 'react';
import WithDraggableInputSnap from '../base/WithDraggableInputSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';
import { AddInputBox, InputBox } from '../../inputBox/inputBox';

function SumOperatorClass(props) {

    const spriteID = props.spriteID;
    const inputList = props.inputList || null;

    const input1 = useSpriteStore((state) => {
        if (!props.inputList) return props.inputBlock;
        const inputID = props.inputList[0];
        const inputData = state.sprites[spriteID].inputs[inputID];
        
        if (inputData.blockID) return state.sprites[spriteID][inputData.blockType][inputData.blockID].block;
        return inputData.block;
    });

    const input2 = useSpriteStore((state) => {
        if (!props.inputList) return props.inputBlock;
        const inputID = props.inputList[1];
        const inputData = state.sprites[spriteID].inputs[inputID];
        
        if (inputData.blockID) return state.sprites[spriteID][inputData.blockType][inputData.blockID].block;
        return inputData.block;
    });


    return (
        <div
            ref={props.domRef}
            className="cursor-grab select-none bg-green-500 text-white p-2 rounded-full flex items-center gap-2"
        >
            {input1}

            <span>+</span>

            {input2}
        </div>
    );
}


const SumOperator = WithDraggableInputSnap(SumOperatorClass);

const AddSumOperator = () => {
    const blockRef = createRef();
    const domRef = createRef();
    const blockID = useID.getState().blocks;
    const spriteID = useSpriteID.getState().id;

    const inputID = useID.getState().inputs;
    useID.getState().incrementInputs();

    const inputID2 = useID.getState().inputs;
    useID.getState().incrementInputs();

    const inputList = [inputID, inputID2];
    AddInputBox(spriteID, inputID, "operators", blockID, null, null);
    AddInputBox(spriteID, inputID2, "operators", blockID, null, null);
    
    const block = <SumOperator domRef={domRef} ref={blockRef} 
                   blockID={blockID} spriteID = {spriteID} inputList = {inputList} type = {"operators"}/>;

    useSpriteStore.getState().addOperator(spriteID, blockID, blockRef, domRef, block, inputList);
    useID.getState().incrementBlocks();
}

const PalleteBlock = WithPalleteBlock(SumOperatorClass, AddSumOperator);

const registerSumOperator = () => {
    const domRef = createRef();
    const inputBlock = <InputBox />;
    const inputBlock2 = <InputBox />;
    const inputBlockList = [inputBlock, inputBlock2];
    const block = <PalleteBlock className = "absolute" domRef={domRef} inputID = {null} inputBlock={inputBlockList}/>;

    useBlockStore.getState().addBlock(block, "Operator");
}

export {registerSumOperator};