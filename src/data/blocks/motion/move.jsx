import { createRef } from 'react';
import WithDraggableBlockSnap from '../base/WithDraggableBlockSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useBlockID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';

class MoveBlockClass extends React.Component {
    constructor(props) {
        super(props);
        this.nextBlockClass = null;
        this.nextBlockDom = null;
        this.prevBlockClass = null;
        this.prevBlockDom = null;
        this.blockID = props.blockID;
        //this.count = 10;
    }

    render() {
        return <div 
            ref={this.props.domRef} 
            className="cursor-grab select-none bg-blue-400 text-white p-2 rounded"
            style={{}}
            >
                {this.props.label}
            </div>;
    }
}

const MoveBlock = WithDraggableBlockSnap(MoveBlockClass);

const AddMoveBlock = () => {
    const blockRef = createRef();
    const domRef = createRef();
    const blockID = useBlockID.getState().blocks;
    const block = <MoveBlock className = "absolute" label = "move 10 steps" domRef={domRef} ref={blockRef} 
                   blockID={blockID}/>;

    console.log("here");
    useSpriteStore.getState().addBlock(useSpriteID.getState().id, blockID, blockRef, domRef, block);
    console.log(useSpriteStore.getState());
    useBlockID.getState().incrementBlocks();
}

const PalleteBlock = WithPalleteBlock(MoveBlockClass, AddMoveBlock);

const AddPalleteBlock = () => {
    const domRef = createRef();
    const block = <PalleteBlock className = "absolute" label = "move 10 steps" domRef={domRef}/>;

    useBlockStore.getState().addBlock(block);
    console.log(useBlockStore.getState());
}

AddPalleteBlock();
export {MoveBlock};