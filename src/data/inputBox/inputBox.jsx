import React, { createRef } from "react";
import { useSpriteStore } from "../states/SpriteStore";
function InputBox(props) {

    const spriteID = props.spriteID || null;
    const inputID = props.inputID || null;

    const value = inputID
        ? useSpriteStore.getState().sprites[spriteID].inputs[inputID].value
        : 10;

    const handleChange = (e) => {
        const data = e.target.value;

        if (!inputID) return;

        useSpriteStore
            .getState()
            .updateInputValue(spriteID, inputID, data);
    };

    return (
        <input
            ref={props.domRef}
            type="text"
            defaultValue={value}
            onChange={handleChange}
            className="bg-white w-10 px-2 py-1 rounded-full text-black outline-none"
        />
    );
}

const AddInputBox = (spriteID, inputID, parentType, parentID, blockType, blockID) => {
    const blockRef = createRef();
    const domRef = createRef();
    const block = <InputBox domRef={domRef} ref={blockRef} inputID={inputID} spriteID={spriteID}/>;
    useSpriteStore.getState().addInput(spriteID, inputID, parentType, parentID, blockType, blockID, domRef, blockRef, block);
}

export {AddInputBox, InputBox};
