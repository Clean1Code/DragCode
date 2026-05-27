import { useEffect, useRef, forwardRef } from "react";
import { useSpriteStore, useSpriteID } from "../../states/SpriteStore";

const SnapThreshold = 4000;

function WithDraggableInputSnap(WrappedComponent) {
    return forwardRef((props, ref) => {
        const isDrag = useRef(false);
        const offsetMouseX = useRef(20);
        const offsetMouseY = useRef(20);
        const spriteID = useSpriteID.getState().id;
        const blockID = props.blockID;
        const type = props.type;
        const xpos = useSpriteStore((state) => state.sprites[spriteID]?.[type][blockID]?.x);
        const ypos = useSpriteStore((state) => state.sprites[spriteID]?.[type][blockID]?.y);
        const visibility = useSpriteStore((state) => state.sprites[spriteID]?.[type][blockID]?.visible);
        const position = useRef("absolute");

        if (useSpriteStore.getState().sprites[spriteID][type][blockID].drag) isDrag.current = true;
        if (!visibility) position.current = "relative";
        else position.current = "absolute";

        function handleMouseDown(event) {
            const block = props.domRef.current;
            const blockRect = block.getBoundingClientRect();

            const inputList = props.inputList;
            let check = false;
            for(const inputID of inputList) {
                const input = useSpriteStore.getState().sprites[spriteID].inputs[inputID];
                console.log(input);
                if (input.blockID) {
                    const childBlock = useSpriteStore.getState().sprites[spriteID][input.blockType][input.blockID];
                    console.log(childBlock);
                    const childRect = childBlock.domRef.current.getBoundingClientRect();
                    const inside = event.clientX >= childRect.left && event.clientX <= childRect.right &&
                                   event.clientY >= childRect.top  && event.clientY <= childRect.bottom;
                    
                    if (inside) check = true;
                }
            }

            if (check) return;

            block.style.zIndex = "50";
            isDrag.current = true;
            offsetMouseX.current = event.clientX - blockRect.left;
            offsetMouseY.current = event.clientY - blockRect.top;
        }

        function parentBlockDom() {
            const parentID = useSpriteStore.getState().sprites[spriteID][type][blockID].parentID;
                
            let parentBlockID = null;
            let inputID = parentID;

            if (!inputID) return null;

            const inputs = useSpriteStore.getState().sprites[spriteID].inputs;
            const sprite = useSpriteStore.getState().sprites[spriteID];
            while(inputs[inputID].parentType !== "blocks") {
                const input = inputs[inputID];
                inputID = sprite[input.parentType][input.parentID].parentID;
            }

            if (inputs[inputID].parentType === "blocks") {
                parentBlockID = inputs[inputID].parentID;
                const block = sprite.blocks[parentBlockID];
                const blockDom = block.domRef.current;

                return blockDom;
            }

            return null;
        }

        function handleMouseUp(event) {
            if(isDrag.current && visibility) {
                const block = props.domRef.current;
                block.style.zIndex = "1";

                let sprite = useSpriteStore.getState().sprites[spriteID];

                let inputs = useSpriteStore.getState().sprites[spriteID].inputs;
                const curr = sprite[type][blockID];
                const inputList = curr.inputList;
                const currDom = props.domRef.current;
                const currRect = currDom.getBoundingClientRect();

                let minDist = 99999;
                let nearID = null;
    
                for(let [key, input] of Object.entries(inputs)) {
                    if (input.blockType) continue;
                    let inputID = key;
                    let check = false;

                    let cnt = 5;
                    while(inputID && cnt) {
                        const temInput = sprite.inputs[inputID];
                        if (inputList.includes(Number(inputID)) || inputList.includes(String(inputID))) {
                            check = true;
                            break;
                        }
                        const mid = useSpriteStore.getState().sprites[spriteID][temInput.parentType]?.[temInput.parentID];

                        inputID = mid.parentID;
                        cnt--;
                    }

                    if (check) continue;
                    
                    const temDom = input.domRef.current;
                    const temRect = temDom.getBoundingClientRect();
                    const dx = currRect.x - temRect.x;
                    const dy = currRect.y - temRect.y;

                    const distance = dx*dx + dy*dy;
                    if (minDist > distance && distance < SnapThreshold) {
                        minDist = distance;
                        nearID = key;
                    }
                }

                if (nearID) {
                    position.current = "relative";
                    currDom.style.position = "relative";

                    useSpriteStore.getState().updateVisibility(spriteID, type, blockID, nearID, false);
                    useSpriteStore.getState().updateInputID(spriteID, nearID, type, blockID);

                    const parentDom = parentBlockDom();

                    if (parentDom) {
                        setTimeout(() => {
                            parentDom.dispatchEvent(
                                new CustomEvent("setChildrenPosition", {
                                    bubbles: true,
                                })
                            );
                        }, 20);
                    }
                }
            }
            isDrag.current = false;
            useSpriteStore.getState().sprites[spriteID][type][blockID].drag = false;
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

            if (!visibility) {
                const parentID = useSpriteStore.getState().sprites[spriteID][type][blockID].parentID;

                const parentDom = parentBlockDom();
                
                if (parentDom) {
                    setTimeout(() => {
                        parentDom.dispatchEvent(
                            new CustomEvent("setChildrenPosition", {
                                bubbles: true,
                            })
                        );
                    }, 20);
                }

                useSpriteStore.getState().updateInputID(spriteID, parentID, null, null);
                useSpriteStore.getState().sprites[spriteID][type][blockID].drag = true;
                useSpriteStore.getState().updateVisibility(spriteID, type, blockID, null, true);
            }
            else useSpriteStore.getState().updateBlockPosition(spriteID, type, blockID, x, y);
            block.style.transform = "none";
        }

        useEffect(() => {
            const block = props.domRef.current;
            if (!block) return;

            block.style.position = position.current;

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
            if (position.current == "absolute") {
                block.style.left = `${xpos}px`;
                block.style.top = `${ypos}px`;
            }
        }, [xpos, ypos]);

        return <WrappedComponent {...props} ref={ref} />;
    });
}

export default WithDraggableInputSnap;
