import React, { createRef } from "react";
import { useSpriteStore } from "../states/SpriteStore";

class InputBox extends React.Component {
    constructor(props) {
        super(props);
        this.spriteID = props.spriteID || null;
        this.inputID = props.inputID || null;
        if (this.inputID) this.value = useSpriteStore.getState().sprites[this.spriteID].inputs[this.inputID].value;
        else this.value = 10;
    }

    handleChange = (e) => {
        const data = e.target.value;
        if (!this.inputID) return;
        useSpriteStore.getState().updateInputValue(this.spriteID, this.inputID, data);
    }

    render() {
        return(
            <input
                ref={this.props.domRef}
                type="text"
                defaultValue={this.value}
                onChange={this.handleChange}
                className="bg-white w-10 px-2 py-1 rounded-full text-black outline-none"
            />
        )
    }
}

const AddInputBox = (spriteID, inputID, type, typeID, iType, iID) => {
    const blockRef = createRef();
    const domRef = createRef();
    const block = <InputBox domRef={domRef} ref={blockRef} inputID={inputID} spriteID={spriteID}/>;
    useSpriteStore.getState().addInput(spriteID, inputID, type, typeID, iType, iID, domRef, blockRef, block)
}

export {AddInputBox, InputBox};
