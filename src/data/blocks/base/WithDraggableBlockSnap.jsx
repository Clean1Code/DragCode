import { useEffect, useRef, forwardRef } from "react";
import { useSpriteStore, useSpriteID } from "../../states/SpriteStore";
import blockProgram from "../blockProgram";

const SnapThreshold = 40;

function WithDraggableBlockSnap(WrappedComponent) {
    return function DraggableBlockSnap (props) {
        const isDrag = useRef(false);
        const offsetMouseX = useRef(20);
        const offsetMouseY = useRef(20);
        const spriteID = useSpriteID.getState().id;
        const blockID = props.blockID;
        const xpos = useSpriteStore((state) => state.blocks[blockID]?.x);
        const ypos = useSpriteStore((state) => state.blocks[blockID]?.y);
        const parentID = useRef(props.parentID ? props.parentID : null);
        
        let position = "absolute";

        function attatchToBlock(parentID) {
            const parent = useSpriteStore.getState().blocks[parentID];
            let curr = useSpriteStore.getState().blocks[blockID];
            let newY = parent.y + parent.domRef.current.getBoundingClientRect().height;

            useSpriteStore.getState().blocks[parentID].nextBlockID = blockID;
            useSpriteStore.getState().blocks[blockID].prevBlockID = parentID;

            let nextID = blockID;
            while(curr) {
                useSpriteStore.getState().updateBlockPosition("blocks", nextID, parent.x, newY);
                
                newY += curr.domRef.current.getBoundingClientRect().height;
                const blocks = useSpriteStore.getState().blocks;
                nextID = blocks[nextID].nextBlockID;
                curr = blocks[nextID];
            }
        }

        function handleMouseDown(event) {
            const block = props.domRef.current;
            if (!block) return;

            const inputList = props.inputList;
            let check = false;
            if (inputList) {
                for(const inputID of inputList) {
                    const input = useSpriteStore.getState().inputs[inputID];
                    if (input.blockID) {
                        const childBlock = useSpriteStore.getState()[input.blockType][input.blockID];
                        const childRect = childBlock.domRef.current.getBoundingClientRect();
                        const inside = event.clientX >= childRect.left && event.clientX <= childRect.right &&
                                    event.clientY >= childRect.top  && event.clientY <= childRect.bottom;
                        
                        if (inside) check = true;
                    }
                }
            }
            if (check) return;
            //useSpriteStore.getState().updateVisibility(spriteID, "blocks", blockID, false);
            const blocks = useSpriteStore.getState().blocks;
            const curr = blocks[blockID];

            if (!event.isTrusted || !parentID.current) {
                if (parentID.current) {
                    if (!blocks[parentID.current].drag) {
                        let parentID = event.parentID;
                        parentID = blocks[parentID].prevBlockID;
                        attatchToBlock(parentID);
                        return;
                    }
                }

                isDrag.current = true;
                blocks[blockID].drag = true;
                block.style.zIndex = "50";

                const blockRect = block.getBoundingClientRect();
                offsetMouseX.current = event.clientX - blockRect.left;
                offsetMouseY.current = event.clientY - blockRect.top;

                if (curr.nextBlockID) {
                    const nextClass = blocks[curr.nextBlockID].domRef.current;
                    const e = new MouseEvent("mousedown", event);
                    
                    if (event.isTrusted) e.parentID = blockID;
                    else e.parentID = event.parentID;
                    nextClass.dispatchEvent(e);
                }
            }
            else {
                //console.log("here ", parentID.current);
                const parentClass = blocks[parentID.current].domRef.current;

                const e = new MouseEvent("mousedown", event);
                e.parentID = parentID.current;
                //console.log(e.parentID);
                parentClass.dispatchEvent(e);
            }
        }

        function handleMouseUp() {
            if(isDrag.current) {

                let blocks = useSpriteStore.getState().blocks;
                
                const curr = blocks[blockID];
                curr.drag = false;
                //blockProgram[curr.name](spriteID, blockID);
                const currDom = props.domRef.current;
                //const currClass = ref.current;
                const currRect = currDom.getBoundingClientRect();
                currDom.style.zIndex = "1";

                let next = blocks[curr.nextBlockID];
                let prev = blocks[curr.prevBlockID];

                if (next?.prevBlockID != blockID) {
                    next = null;
                    curr.nextBlockID = null;
                }

                if (prev?.nextBlockID != blockID) {
                    prev = null;
                    curr.prevBlockID = null;
                }

                const nextDom = next?.domRef.current;
                const prevDom = prev?.domRef.current;

                if (nextDom) {
                    const nextRect = nextDom.getBoundingClientRect();
                    const dx = currRect.x - nextRect.x;
                    const dy = currRect.y - nextRect.y;

                    const distance = Math.abs(dx) + Math.abs(dy) - currRect.height;

                    if (distance > SnapThreshold || dy > 0) {
                        if (next.prevBlockID == blockID) next.prevBlockID = null;
                        curr.nextBlockID = null;
                    }
                }
                
                if (prevDom) {
                    const prevRect = prevDom.getBoundingClientRect();
                    const dx = currRect.x - prevRect.x;
                    const dy = currRect.y - prevRect.y;

                    const distance = Math.abs(dx) + Math.abs(dy) - prevRect.height;

                    if (distance > SnapThreshold || dy < 0) {
                        if (prev.nextBlockID == blockID) prev.nextBlockID = null;
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
                    if (block.spriteID !== spriteID) continue;

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
                            let newX = parseInt(nearDom.style.left);
                            let newY = parseInt(nearDom.style.top);
                            
                            while(near.prevBlockID) {
                                const prev = blocks[near.prevBlockID];
                                const prevRect = prev.domRef.current.getBoundingClientRect();
                                
                                newY -= prevRect.height;
                                newX += prev.offsetX;

                                if (prev.prevBlockID) newX += blocks[prev.prevBlockID].offsetNextX;
                                
                                useSpriteStore.getState().updateBlockPosition("blocks", near.prevBlockID, newX, newY);
                                blocks = useSpriteStore.getState().blocks;

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
                            let newX = parseInt(nearDom.style.left);
                            let newY = parseInt(nearDom.style.top);
                            
                            while(near.nextBlockID) {
                                nearDom = near.domRef.current;
                                nearRect = nearDom.getBoundingClientRect();
                                newY += nearRect.height;
                                newX += near.offsetNextX + blocks[near.nextBlockID].offsetX;
                                
                                useSpriteStore.getState().updateBlockPosition("blocks", near.nextBlockID, newX, newY);
                                blocks = useSpriteStore.getState().blocks;

                                nearID = near.nextBlockID;
                                near = blocks[nearID];

                                if (near.nextBlockID) {
                                    const next = blocks[near.nextBlockID];
                                    if (next.prevBlockID != nearID) {
                                        near.nextBlockID = null;
                                    }
                                }

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
                let blocks = useSpriteStore.getState().blocks;

                const curr = blocks[blockID];
                if (curr.prevBlockID) {
                    const prevDom = blocks[curr.prevBlockID].domRef.current;
                    const prevRect = prevDom.getBoundingClientRect();
                    const currDom = curr.domRef.current;

                    const x = parseInt(prevDom.style.left);
                    const y = parseInt(prevDom.style.top) + prevRect.height;

                    if (parseInt(currDom.style.x) != x || parseInt(currDom.style.y) != y) {
                        useSpriteStore.getState().updateBlockPosition("blocks", blockID, x, y);
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
            
            useSpriteStore.getState().updateBlockPosition("blocks", blockID, x, y);
            //block.style.left = `${x}px`;
            //block.style.top = `${y}px`;
            block.style.transform = "none";
        }

        function setChildrenPosition(event) {
            const blocks = useSpriteStore.getState().blocks;
            let curr = blocks[blockID];

            let currRect = curr.domRef.current.getBoundingClientRect();
            let x = parseInt(curr.domRef.current.style.left);
            let y = parseInt(curr.domRef.current.style.top);

            while(curr.nextBlockID) {
                y += currRect.height;
                x += curr.offsetNextX + blocks[curr.nextBlockID].offsetX;

                useSpriteStore.getState().updateBlockPosition("blocks", curr.nextBlockID, x, y);
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

            if (parentID.current) {
                attatchToBlock(useSpriteStore.getState().blocks[blockID].prevBlockID);
            }
    
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