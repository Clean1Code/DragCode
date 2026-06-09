import { useSpriteStore } from "../data/states/SpriteStore";
import blockProgram from "../data/blocks/blockProgram";

async function executeThread(startBlockID) {
    let currentID = startBlockID;

    while(currentID) {
        const block = useSpriteStore.getState().blocks[currentID];
        currentID = await blockProgram[block.name](block.spriteID, currentID);
        console.log(currentID);
    }
}

export default executeThread;