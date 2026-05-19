import { create } from "zustand";

const useSpriteID = create((set) => ({
  id: 1,
  setSpriteID: (value) => set({ id: value }),
}));

const useID = create((set) => ({
  blocks: 1,
  inputs: 1,
  instances: 1,

  incrementBlocks: () =>
    set((state) => ({
      blocks: state.blocks + 1,
    })),
  
  incrementInputs: () =>
    set((state) => ({
      inputs: state.inputs + 1,
    })),
  
  incrementInstances: () =>
    set((state) => ({
      instances: state.instances + 1,
    })),
}));


const useSpriteStore = create((set, get) => ({
  sprites: {},
  instances: {},

  addSprite: (spriteID) =>
    set((state) => {
      if (state.sprites[spriteID]) return state;

      const instanceID = useID.getState().instances;
      useID.getState().incrementInstances();
      get().addInstance(instanceID, 1, (instanceID-1)*10, -(instanceID-1)*10, 100, 0); 
      return {
        sprites: {
          ...state.sprites,

          [spriteID]: {
            blocks: {},
            inputs: {},
            instances: [instanceID],
            sound: {},
          },
        },
      };
    }),

  addBlock: (spriteID, blockID, blockRef, domRef, block, inputList, nextBlockID, prevBlockID) =>
    set((state) => {
      if (!state.sprites[spriteID]) return state;

      return {
        sprites: {
          ...state.sprites,

          [spriteID]: {
            ...state.sprites[spriteID],

            blocks: {
              ...state.sprites[spriteID].blocks,

              [blockID]: {
                blockRef,
                domRef,
                block,
                inputList,
                nextBlockID,
                prevBlockID,
                x: 0,
                y: 0,
              },
            },
          },
        },
      };
    }),
  
  addInput: (spriteID, inputID, type, typeID, iType, iID, domRef, blockRef, block) =>
    set((state) => {
      if (!state.sprites[spriteID]) return state;

      return {
        sprites: {
          ...state.sprites,

          [spriteID]: {
            ...state.sprites[spriteID],

            inputs: {
              ...state.sprites[spriteID].inputs,

              [inputID]: {
                spriteID,
                type,
                typeID,
                iType,
                iID,
                //Default input box info if iType or iID is null
                domRef,
                blockRef,
                block,
                value: 10,
              },  
            },
          },
        },
      };
    }),

  addInstance: (instanceID, imageID, xpos, ypos, size, rotation) =>
    set((state) => {
      return {
        instances: {
          ...state.instances,
          [instanceID]: {
            src: "/src/assets/Cube.svg",
            xpos,
            ypos,
            size,
            rotation
          }
        }
      };
    }),
  
  updateBlockPosition: (spriteID, blockID, x, y) =>
    set((state) => {
      if (
        !state.sprites[spriteID] ||
        !state.sprites[spriteID].blocks[blockID]
      ) {
        console.log("failed");
        return state;
      }

      return {
        sprites: {
          ...state.sprites,

          [spriteID]: {
            ...state.sprites[spriteID],

            blocks: {
              ...state.sprites[spriteID].blocks,

              [blockID]: {
                ...state.sprites[spriteID].blocks[blockID],
                x,
                y,
              },
            },
          },
        },
      };
    }),

  updateInputValue: (spriteID, inputID, value) =>
    set((state) => {
      if (!state.sprites[spriteID]) return state;

      return {
        sprites: {
          ...state.sprites,

          [spriteID]: {
            ...state.sprites[spriteID],

            inputs: {
              ...state.sprites[spriteID].inputs,

              [inputID]: {
                ...state.sprites[spriteID].inputs[inputID],
                value,
              },  
            },
          },
        },
      };
    }),
}));

useSpriteStore.getState().addSprite(useSpriteID.getState().id);

export { useSpriteStore, useSpriteID, useID };