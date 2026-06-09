import { registerMoveBlock } from "./motion/move";
import { registerRunBlock } from "./events/run";
import { registerSumOperator } from "./operators/sum";
import { registerIfBlock } from "./control/if";

let init = false;
export const registerBlocks = () => {
    if (init) return;
    init = true;
    
    registerMoveBlock();
    registerRunBlock();
    registerSumOperator();
    registerIfBlock();
};