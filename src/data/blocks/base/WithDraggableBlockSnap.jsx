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

            const blocks = useSpriteStore.getState().sprites[spriteID].blocks;
            const curr = blocks[blockID];
            console.log(blockID, curr.nextBlockID, curr);
            console.log(blocks);
            if (curr.nextBlockID) {
                const nextClass = blocks[curr.nextBlockID].domRef.current;
                nextClass.dispatchEvent(new MouseEvent("mousedown", event));
            }
            const blockRect = block.getBoundingClientRect();

            isDrag.current = true;
            offsetMouseX.current = event.clientX - blockRect.left;
            offsetMouseY.current = event.clientY - blockRect.top;
        }

        function handleMouseUp() {
            if(isDrag.current) {
                let blocks = useSpriteStore.getState().sprites[spriteID].blocks;
                if (blocks === useSpriteStore.getState().sprites[spriteID].blocks) console.log("true");
                else console.log("false");
                
                const curr = blocks[blockID];
                const currDom = props.domRef.current;
                const currClass = ref.current;
                const currRect = currDom.getBoundingClientRect();

                let next = blocks[curr.nextBlockID];
                let prev = blocks[curr.prevBlockID];
                const nextDom = next?.domRef.current;
                const nextClass = next?.blockRef.current;
                const prevDom = prev?.domRef.current;
                const prevClass = prev?.blockRef.current;

                if (nextClass) {
                    const nextRect = nextDom.getBoundingClientRect();
                    const dx = currRect.x - nextRect.x;
                    const dy = currRect.y - nextRect.y;

                    if (dx*dx + dy*dy > SnapThreshold || dy > 0) {
                        next.prevBlockID = null;
                        curr.nextBlockID = null;
                    }
                }
                
                if (prevClass) {
                    const prevRect = prevDom.getBoundingClientRect();
                    const dx = currRect.x - prevRect.x;
                    const dy = currRect.y - prevRect.y;

                    if (dx*dx + dy*dy > SnapThreshold || dy < 0) {
                        prev.nextBlockID = null;
                        curr.prevBlockID = null;
                    }
                }

                next = blocks[curr.nextBlockID];
                prev = blocks[curr.prevBlockID];

                let minDist = 99999;
                let nearID = null;
                let isUp = null;
                for (const [key, block] of Object.entries(blocks)) {
                    //console.log("hello");
                    if (next && prev) break;
                    if (block === curr) continue;

                    const temDom = block.domRef.current;
                    const temRect = temDom.getBoundingClientRect();
                    const dx = currRect.x - temRect.x;
                    const dy = currRect.y - temRect.y;
                    
                    if (dy <= 0 && (next || block.prevBlockID != null)) continue;
                    if (dy >= 0 && (prev)) continue;

                    const distance = dx*dx + dy*dy;
                    if (minDist > distance && distance < SnapThreshold) {
                        minDist = distance;
                        nearID = key;

                        if (dy < 0) isUp = true;
                        else isUp = false;
                    }
                }

                if (nearID) {
                    let near = blocks[nearID];

                    if (minDist < SnapThreshold) {
                        if (isUp) {
                            near.prevBlockID = blockID;
                            curr.nextBlockID = nearID;

                            let nearDom = near.domRef.current;
                            let nearRect = nearDom.getBoundingClientRect();
                            const newX = parseInt(nearDom.style.left);
                            let newY = parseInt(nearDom.style.top);
                            
                            while(near.prevBlockID) {
                                nearDom = near.domRef.current;
                                nearRect = nearDom.getBoundingClientRect();
                                newY -= nearRect.height;
                                
                                useSpriteStore.getState().updateBlockPosition(spriteID, near.prevBlockID, newX, newY);
                                blocks = useSpriteStore.getState().sprites[spriteID].blocks;

                                nearID = near.prevBlockID;
                                near = blocks[nearID];
                            }
                        }
                        else {
                            let initNextID = near.nextBlockID;
                            console.log(initNextID, nearID);

                            near.nextBlockID = blockID;
                            curr.prevBlockID = nearID;
                            
                            let nearDom = near.domRef.current;
                            let nearRect = nearDom.getBoundingClientRect();
                            const newX = parseInt(nearDom.style.left);
                            let newY = parseInt(nearDom.style.top);
                            
                            while(near.nextBlockID) {
                                nearDom = near.domRef.current;
                                nearRect = nearDom.getBoundingClientRect();
                                newY += nearRect.height;
                                
                                useSpriteStore.getState().updateBlockPosition(spriteID, near.nextBlockID, newX, newY);
                                blocks = useSpriteStore.getState().sprites[spriteID].blocks;

                                nearID = near.nextBlockID;
                                near = blocks[nearID];

                                if (!near.nextBlockID && initNextID) {
                                    near.nextBlockID = initNextID;
                                    blocks[initNextID].prevBlockID = nearID;
                                    initNextID = null;
                                }
                            }
                        }
                    }
                }

                isDrag.current = false;
            }
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
            
            //console.log(useSpriteStore.getState());
            useSpriteStore.getState().updateBlockPosition(spriteID, blockID, x, y);
            //block.style.left = `${x}px`;
            //block.style.top = `${y}px`;
            block.style.transform = "none";
        }

        useEffect(() => {
            const block = props.domRef.current;
            if (!block) return;

            //console.log("Re-render");

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
            //console.log("hello");
            block.style.left = `${xpos}px`;
            block.style.top = `${ypos}px`;
        }, [xpos, ypos]);

        return <WrappedComponent {...props} ref={ref} />;
    });
}

export default WithDraggableBlockSnap;
