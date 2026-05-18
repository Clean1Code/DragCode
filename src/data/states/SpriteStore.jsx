import { create } from "zustand";

const useSpriteID = create((set) => ({
  id: 1,
  setSpriteID: (value) => set({ id: value }),
}));

const useBlockID = create((set) => ({
  blocks: 1,

  incrementBlocks: () =>
    set((state) => ({
      blocks: state.blocks + 1,
    })),
}));

const useInputID = create((set) => ({
  inputs: 1,

  incrementInputs: () =>
    set((state) => ({
      inputs: state.inputs + 1,
    })),
}));

const useSpriteStore = create((set) => ({
  sprites: {},

  createSprite: (spriteID) =>
    set((state) => {
      if (state.sprites[spriteID]) return state;

      return {
        sprites: {
          ...state.sprites,

          [spriteID]: {
            blocks: {},
            inputs: {},
            images: {},
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

useSpriteStore.getState().createSprite(useSpriteID.getState().id);

export { useSpriteStore, useSpriteID, useBlockID, useInputID };