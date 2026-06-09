import { useSpriteStore } from "../states/SpriteStore";

async function getInputs(inputList) {
    let inputValues = [];

    for(let inputID of inputList) {
        const input = useSpriteStore.getState().inputs[inputID];
        if (input.blockID) {
            const block = useSpriteStore.getState()[input.blockType][input.blockID];
            const value = await blockProgram[block.name](block.spriteID, input.blockID);
            inputValues.push(value);
        }
        else inputValues.push(parseInt(input.value));
    }

    return inputValues;
}

const blockProgram = {
    move: async (spriteID, blockID) => {
        const inputList = useSpriteStore.getState().blocks[blockID].inputList;
        const valueList = await getInputs(inputList);
        const instanceID = useSpriteStore.getState().sprites[spriteID].instances[0];
        
        let xpos = parseInt(useSpriteStore.getState().instances[instanceID].xpos);
        let ypos = parseInt(useSpriteStore.getState().instances[instanceID].ypos);
        
        xpos += valueList[0];

        useSpriteStore.getState().updateInstancePosition(instanceID, xpos, ypos);

        return useSpriteStore.getState().blocks[blockID].nextBlockID;
    },

    sum: async (spriteID, blockID) => {
        const inputList = useSpriteStore.getState().operators[blockID].inputList;
        const valueList = await getInputs(inputList);
        
        return (parseInt(valueList[0]) + parseInt(valueList[1]));
    },

    run: async (spriteID, blockID) => {
        return useSpriteStore.getState().blocks[blockID].nextBlockID;
    },

    if: async (spriteID, blockID) => {
        const block = useSpriteStore.getState().blocks[blockID];
        const inputList = block.inputList;
        const valueList = await getInputs(inputList);
        const branches = block.branches;

        if (valueList[0] > 0) return block.nextBlockID;
        else return branches[0];
    },

    endif: async (spriteID, blockID) => {
        return useSpriteStore.getState().blocks[blockID].nextBlockID;
    }
};

export default blockProgram;

