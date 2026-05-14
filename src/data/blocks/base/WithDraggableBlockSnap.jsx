import { useEffect, useRef, forwardRef } from "react";
import { useSpriteStore, useSpriteID } from "../../states/SpriteStore";

const SnapThreshold = 4000;

function WithDraggableBlockSnap(WrappedComponent) {
    return forwardRef((props, ref) => {
        const isDrag = useRef(false);
        const offsetMouseX = useRef(0);
        const offsetMouseY = useRef(0);
        const spriteID = useSpriteID.getState().id;
        const blockID = props.blockID;
        const xpos = useSpriteStore((state) => state.sprites[spriteID]?.blocks[blockID]?.x);
        const ypos = useSpriteStore((state) => state.sprites[spriteID]?.blocks[blockID]?.y);

        function handleMouseDown(event) {
            const block = props.domRef.current;
            if (!block) return;

            const currBlockClass = ref.current;
            if (currBlockClass.nextBlockDom) {
                console.log("Attatched to another block");
                currBlockClass.nextBlockDom.dispatchEvent(new MouseEvent("mousedown", event));
            }
            const blockRect = block.getBoundingClientRect();

            isDrag.current = true;
            offsetMouseX.current = event.clientX - blockRect.left;
            offsetMouseY.current = event.clientY - blockRect.top;
        }

        function handleMouseUp() {
            if (isDrag.current) {
                console.log("Drag Complete");
                const blocks = useSpriteStore.getState().sprites[spriteID].blocks;
                
                const currBlockDom = props.domRef.current;
                const currBlockClass = ref.current;
                const currBlockRect = currBlockDom.getBoundingClientRect();

                const currNextBlockDom = currBlockClass.nextBlockDom;
                const currNextBlockClass = currBlockClass.nextBlockClass;
                const currPrevBlockDom = currBlockClass.prevBlockDom;
                const currPrevBlockClass = currBlockClass.prevBlockClass;

                if (currNextBlockClass) {
                    const blockRect = currNextBlockDom.getBoundingClientRect();
                    const dx = currBlockRect.x - blockRect.x;
                    const dy = currBlockRect.y - blockRect.y;

                    if (dx*dx + dy*dy > SnapThreshold || dy > 0) {
                        currNextBlockClass.prevBlockClass = null;
                        currNextBlockClass.prevBlockDom = null;
                        currBlockClass.nextBlockClass = null;
                        currBlockClass.nextBlockDom = null;
                    }
                }

                if (currPrevBlockClass) {
                    const blockRect = currPrevBlockDom.getBoundingClientRect();
                    const dx = currBlockRect.x - blockRect.x;
                    const dy = currBlockRect.y - blockRect.y;

                    if (dx*dx + dy*dy > SnapThreshold || dy < 0) {
                        currPrevBlockClass.nextBlockClass = null;
                        currPrevBlockClass.nextBlockDom = null;
                        currBlockClass.prevBlockClass = null;
                        currBlockClass.prevBlockDom = null;
                    }
                }

                //console.log("PrevBlock: ", currBlockClass.prevBlockClass, "NextBlock: ", currBlockClass.nextBlockClass);
                let minDist = 99999;
                let blockDom = null;
                let blockClass = null;
                let isUp = null;
                for (const block of Object.values(blocks)) {
                    const temBlockDom = block.domRef.current;
                    const temBlockClass = block.blockRef.current;
                    if (currBlockDom === temBlockDom || currBlockClass.nextBlockDom === temBlockDom
                        || currBlockClass.prevBlockDom === temBlockDom
                    ) continue;

                    const blockRect = temBlockDom.getBoundingClientRect();
                    const dx = currBlockRect.x - blockRect.x;
                    const dy = currBlockRect.y - blockRect.y;

                    const distance = dx*dx + dy*dy;
                    if (minDist > distance) {
                        minDist = distance;
                        blockDom = temBlockDom;
                        blockClass = temBlockClass;

                        if (dy < 0) isUp = true;
                        else isUp = false;
                    }
                }

                //console.log(minDist);
                

                if (minDist < SnapThreshold) {
                    console.log("Found a block");
                    if (isUp) {

                        if (currNextBlockClass) return;

                        currBlockClass.nextBlockDom = blockDom;
                        currBlockClass.nextBlockClass = blockClass;
                        
                        blockClass.prevBlockDom = currBlockDom;
                        blockClass.prevBlockClass = currBlockClass;
                        
                        const blockRect = blockDom.getBoundingClientRect();
                        const newX = parseInt(blockDom.style.left);
                        const newY = parseInt(blockDom.style.top) - blockRect.height;
                        
                        useSpriteStore.getState().updateBlockPosition(spriteID, blockID, newX, newY);
                        //console.log("Attatched successfully is Up");
                    }
                    else {
                        const currPrevBlockClass = currBlockClass.prevBlockClass;
                        if (currPrevBlockClass) return;

                        currBlockClass.prevBlockDom = blockDom;
                        currBlockClass.prevBlockClass = blockClass;

                        blockClass.nextBlockDom = currBlockDom;
                        blockClass.nextBlockClass = currBlockClass;

                        const blockRect = blockDom.getBoundingClientRect();
                        
                        const newX = parseInt(blockDom.style.left);
                        const newY = parseInt(blockDom.style.top) + blockRect.height;
                        
                        useSpriteStore.getState().updateBlockPosition(spriteID, blockID, newX, newY);
                        //console.log("Attatched successfully");
                    }
                }
                else console.log("No block");

                //console.log("PrevBlock: ", currBlockClass.prevBlockClass, "NextBlock: ", currBlockClass.nextBlockClass);
            }
            isDrag.current = false;
        }

        function handleMouseMove(event) {
            if (!isDrag.current) return;

            const block = props.domRef.current;
            if (!block) return;

            const parentEl = block.parentElement;
            if (!parentEl) return;

            const parentRect = parentEl.getBoundingClientRect();

            const x = event.clientX - parentRect.left - offsetMouseX.current;
            const y = event.clientY - parentRect.top - offsetMouseY.current;
            
            console.log(useSpriteStore.getState());
            useSpriteStore.getState().updateBlockPosition(spriteID, blockID, x, y);
            //block.style.left = `${x}px`;
            //block.style.top = `${y}px`;
            block.style.transform = "none";
        }

        useEffect(() => {
            const block = props.domRef.current;
            if (!block) return;

            console.log("Re-render");

            block.style.position = "absolute";
            block.addEventListener("mousedown", handleMouseDown);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("mousemove", handleMouseMove);
    
            return () => {
                block.removeEventListener("mousedown", handleMouseDown);
                window.removeEventListener("mouseup", handleMouseUp);
                window.removeEventListener("mousemove", handleMouseMove);
            };
        }, []);

        useEffect(() => {
            const block = props.domRef.current;
            if (!block) return;
            console.log("hello");
            block.style.left = `${xpos}px`;
            block.style.top = `${ypos}px`;
        }, [xpos, ypos]);

        return <WrappedComponent {...props} ref={ref} />;
    });
}

export default WithDraggableBlockSnap;
