import { createRef } from 'react';
import WithDraggableBlockSnap from '../base/WithDraggableBlockSnap';
import React from 'react';
import { useSpriteStore, useSpriteID, useBlockID } from '../../states/SpriteStore';
import { useBlockStore } from '../../states/BlockStore';
import WithPalleteBlock from '../base/WithPalleteBlock';

class InputBox extends React.Component {
    constructor(props) {
        super(props);
        this.operatorID = props.operatorID;
        //this.count = 10;
    }

    render() {
        return (
        <div
            ref={this.props.domRef}
            className="cursor-grab select-none bg-blue-400 text-white p-2 rounded flex items-center gap-2"
            >
            <input
                type="text"
                defaultValue="10"

                className="bg-white w-10 px-2 py-1 rounded-full text-black outline-none"
            />
        </div>);
    }
}

const AddInputBox = (spriteID, blockID, operatorID) => {
    const blockRef = createRef();
    const domRef = createRef();
    const block = <InputBox domRef={domRef} ref={blockRef} 
                   blockID={operatorID}/>;

    console.log("here");
    useSpriteStore.getState().addOperatorBlock(spriteID, blockID, operatorID, domRef, blockRef, );
    console.log(useSpriteStore.getState());
    useBlockID.getState().incrementBlocks();
}

export {MoveBlock};