import { useSpriteStore } from "../data/states/SpriteStore";
import executeThread from "./executeThread";

function executeProgram() {
    for(const [blockID, block] of Object.entries(useSpriteStore.getState().blocks)) {
        if (block.name == "run") {
            executeThread(blockID);
        }
    }
}

export default executeProgram;