import { registerMoveBlock } from "./motion/move";
import { registerRunBlock } from "./control/run";
import { registerSumOperator } from "./operators/sum";

let init = false;
export const registerBlocks = () => {
    if (init) return;
    init = true;
    
    registerMoveBlock();
    registerRunBlock();
    registerSumOperator();
};