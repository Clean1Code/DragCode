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
            operators: {},
            logicOperator: {},
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
  
  addOperator: (spriteID, operatorID, operatorRef, domRef, operator, parentPointer, value) =>
    set((state) => {
      if (!state.sprites[spriteID]) return state;

      return {
        sprites: {
          ...state.sprites,

          [spriteID]: {
            ...state.sprites[spriteID],

            operators: {
              ...state.sprites[spriteID].operators,

              [operatorID]: {
                operatorRef,
                domRef,
                operator,
                parentPointer,
                value,
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
}));

useSpriteStore.getState().createSprite(useSpriteID.getState().id);

export { useSpriteStore, useSpriteID, useBlockID };