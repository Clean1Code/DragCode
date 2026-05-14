import { createRef } from 'react';
import WithDraggableBlockSnap from '../base/WithDraggableBlockSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useBlockID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';

class MoveBlockClass extends React.Component {
    constructor(props) {
        super(props);

        this.blockID = props.blockID;
        this.spriteID = props.spriteID;
        this.nextBlockID = useSpriteStore.getState().sprites[this.spriteID]?.blocks[this.blockID]?.nextBlockID;
        this.prevBlockID = useSpriteStore.getState().sprites[this.spriteID]?.blocks[this.blockID]?.prevBlockID;
        //this.count = 10;
    }

    render() {
        return (
        <div
            ref={this.props.domRef}
            className="cursor-grab select-none bg-blue-400 text-white p-2 rounded flex items-center gap-2"
            >
            <span>move</span>

            <input
                type="text"
                defaultValue="10"

                className="bg-white w-10 px-2 py-1 rounded-full text-black outline-none"
            />

            <span>steps</span>
        </div>);
    }
}

const MoveBlock = WithDraggableBlockSnap(MoveBlockClass);

const AddMoveBlock = () => {
    const blockRef = createRef();
    const domRef = createRef();
    const blockID = useBlockID.getState().blocks;
    const spriteID = useSpriteID.getState().id;
    const block = <MoveBlock domRef={domRef} ref={blockRef} 
                   blockID={blockID} spriteID = {spriteID}/>;

    useSpriteStore.getState().addBlock(spriteID, blockID, blockRef, domRef, block, null, null, null);
    useBlockID.getState().incrementBlocks();
}

const PalleteBlock = WithPalleteBlock(MoveBlockClass, AddMoveBlock);

const AddPalleteBlock = () => {
    const domRef = createRef();
    const block = <PalleteBlock className = "absolute" label = "move 10 steps" domRef={domRef}/>;

    useBlockStore.getState().addBlock(block);
}

AddPalleteBlock();
export {MoveBlock};