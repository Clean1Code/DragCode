import { useEffect, useRef, forwardRef } from "react";
import { useSpriteStore, useSpriteID } from "../../states/SpriteStore";

const SnapThreshold = 40;

function WithDraggableBlockSnap(WrappedComponent) {
    return function DraggableBlockSnap (props) {
        const isDrag = useRef(false);
        const offsetMouseX = useRef(20);
        const offsetMouseY = useRef(20);
        const spriteID = useSpriteID.getState().id;
        const blockID = props.blockID;
        const xpos = useSpriteStore((state) => state.sprites[spriteID]?.blocks[blockID]?.x);
        const ypos = useSpriteStore((state) => state.sprites[spriteID]?.blocks[blockID]?.y);
        let position = "absolute";

        function handleMouseDown(event) {
            const block = props.domRef.current;
            if (!block) return;

            const inputList = props.inputList;
            let check = false;
            if (inputList) {
                for(const inputID of inputList) {
                    const input = useSpriteStore.getState().sprites[spriteID].inputs[inputID];
                    if (input.blockID) {
                        const childBlock = useSpriteStore.getState().sprites[spriteID][input.blockType][input.blockID];
                        const childRect = childBlock.domRef.current.getBoundingClientRect();
                        const inside = event.clientX >= childRect.left && event.clientX <= childRect.right &&
                                    event.clientY >= childRect.top  && event.clientY <= childRect.bottom;
                        
                        if (inside) check = true;
                    }
                }
            }
            if (check) return;
            //useSpriteStore.getState().updateVisibility(spriteID, "blocks", blockID, false);
            const blocks = useSpriteStore.getState().sprites[spriteID].blocks;
            const curr = blocks[blockID];
          
            if (curr.nextBlockID) {
                const nextClass = blocks[curr.nextBlockID].domRef.current;
                nextClass.dispatchEvent(new MouseEvent("mousedown", event));
            }
            const blockRect = block.getBoundingClientRect();

            isDrag.current = true;
            block.style.zIndex = "50";
            offsetMouseX.current = event.clientX - blockRect.left;
            offsetMouseY.current = event.clientY - blockRect.top;
        }

        function handleMouseUp() {
            if(isDrag.current) {
                let blocks = useSpriteStore.getState().sprites[spriteID].blocks;
                
                const curr = blocks[blockID];
                const currDom = props.domRef.current;
                //const currClass = ref.current;
                const currRect = currDom.getBoundingClientRect();
                currDom.style.zIndex = "1";

                let next = blocks[curr.nextBlockID];
                let prev = blocks[curr.prevBlockID];
                const nextDom = next?.domRef.current;
                //const nextClass = next?.blockRef.current;
                const prevDom = prev?.domRef.current;
                //const prevClass = prev?.blockRef.current;

                if (nextDom) {
                    const nextRect = nextDom.getBoundingClientRect();
                    const dx = currRect.x - nextRect.x;
                    const dy = currRect.y - nextRect.y;

                    const distance = Math.abs(dx) + Math.abs(dy) - currRect.height;

                    if (distance > SnapThreshold || dy > 0) {
                        next.prevBlockID = null;
                        curr.nextBlockID = null;
                    }
                }
                
                if (prevDom) {
                    const prevRect = prevDom.getBoundingClientRect();
                    const dx = currRect.x - prevRect.x;
                    const dy = currRect.y - prevRect.y;

                    const distance = Math.abs(dx) + Math.abs(dy) - prevRect.height;

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
    
                    if (next && prev) break;
                    if (block === curr) continue;

                    const temDom = block.domRef.current;
                    const temRect = temDom.getBoundingClientRect();
                    const dx = currRect.x - temRect.x;
                    const dy = currRect.y - temRect.y;
                    
                    if (dy <= 0 && (next || block.prevBlockID != null)) continue;
                    if (dy >= 0 && (prev)) continue;

                    const distance = Math.abs(dx) + Math.abs(dy) - temRect.height;
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
                                const prevRect = blocks[near.prevBlockID].domRef.current.getBoundingClientRect();
                                newY -= prevRect.height;
                                
                                useSpriteStore.getState().updateBlockPosition(spriteID, "blocks", near.prevBlockID, newX, newY);
                                blocks = useSpriteStore.getState().sprites[spriteID].blocks;

                                nearID = near.prevBlockID;
                                near = blocks[nearID];
                            }
                        }
                        else {
                            let initNextID = near.nextBlockID;

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
                                
                                useSpriteStore.getState().updateBlockPosition(spriteID, "blocks", near.nextBlockID, newX, newY);
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
            else if (event.detail?.synthetic) {
                let blocks = useSpriteStore.getState().sprites[spriteID].blocks;

                const curr = blocks[blockID];
                if (curr.prevBlockID) {
                    const prevDom = blocks[curr.prevBlockID].domRef.current;
                    const prevRect = prevDom.getBoundingClientRect();
                    const currDom = curr.domRef.current;

                    const x = parseInt(prevDom.style.left);
                    const y = parseInt(prevDom.style.top) + prevRect.height;

                    if (parseInt(currDom.style.x) != x || parseInt(currDom.style.y) != y) {
                        useSpriteStore.getState().updateBlockPosition(spriteID, "blocks", blockID, x, y);
                    }
                }
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
            
            useSpriteStore.getState().updateBlockPosition(spriteID, "blocks", blockID, x, y);
            //block.style.left = `${x}px`;
            //block.style.top = `${y}px`;
            block.style.transform = "none";
        }

        function setChildrenPosition(event) {
            const blocks = useSpriteStore.getState().sprites[spriteID].blocks;
            let curr = blocks[blockID];

            let currRect = curr.domRef.current.getBoundingClientRect();
            let x = parseInt(curr.domRef.current.style.left);
            let y = parseInt(curr.domRef.current.style.top);

            while(curr.nextBlockID) {
                y += currRect.height;

                useSpriteStore.getState().updateBlockPosition(spriteID, "blocks", curr.nextBlockID, x, y);
                curr = blocks[curr.nextBlockID];
                currRect = curr.domRef.current.getBoundingClientRect();
            }
        }

        useEffect(() => {
            const block = props.domRef.current;
            if (!block) return;


            block.style.position = position;
            block.addEventListener("mousedown", handleMouseDown);
            block.addEventListener("setChildrenPosition", setChildrenPosition);
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

            if (block.style.position == "absolute") {
                block.style.left = `${xpos}px`;
                block.style.top = `${ypos}px`;
            }
        }, [xpos, ypos]);

        return <WrappedComponent {...props} />;
    };
}

export default WithDraggableBlockSnap;
