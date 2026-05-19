import { createRef } from 'react';
import WithDraggableBlockSnap from '../base/WithDraggableBlockSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';
import { AddInputBox, InputBox } from '../../inputBox/inputBox';

class MoveBlockClass extends React.Component {
    constructor(props) {
        super(props);

        this.blockID = props.blockID;
        this.spriteID = props.spriteID;
        this.inputID = props.inputID || null;
        this.nextBlockID = useSpriteStore.getState().sprites[this.spriteID]?.blocks[this.blockID]?.nextBlockID;
        this.prevBlockID = useSpriteStore.getState().sprites[this.spriteID]?.blocks[this.blockID]?.prevBlockID;
        
        if (this.inputID) 
            this.input = useSpriteStore.getState().sprites[this.spriteID]?.inputs[this.inputID]?.block;
        else 
            this.input = props.inputBlock;
        //this.count = 10;
    }

    render() {
        return (
        <div
            ref={this.props.domRef}
            className="cursor-grab select-none bg-blue-400 text-white p-2 rounded flex items-center gap-2"
            >
            <span>move</span>

            {this.input}

            <span>steps</span>
        </div>);
    }
}

const MoveBlock = WithDraggableBlockSnap(MoveBlockClass);

const AddMoveBlock = () => {
    const blockRef = createRef();
    const domRef = createRef();
    const blockID = useID.getState().blocks;
    const spriteID = useSpriteID.getState().id;
    const inputID = useID.getState().inputs;
    AddInputBox(spriteID, inputID, "blocks", blockID, null, null);
    const block = <MoveBlock domRef={domRef} ref={blockRef} 
                   blockID={blockID} spriteID = {spriteID} inputID = {inputID}/>;

    useSpriteStore.getState().addBlock(spriteID, blockID, blockRef, domRef, block, null, null, null);
    useID.getState().incrementBlocks();
    useID.getState().incrementInputs();
}

const PalleteBlock = WithPalleteBlock(MoveBlockClass, AddMoveBlock);

const AddPalleteBlock = () => {
    const domRef = createRef();
    const inputBlock = <InputBox />;
    const block = <PalleteBlock className = "absolute" domRef={domRef} inputID = {null} inputBlock={inputBlock}/>;

    useBlockStore.getState().addBlock(block);
}

AddPalleteBlock();
export {MoveBlock};