import { create } from "zustand";

const useSpriteID = create((set) => ({
  id: 1,
  setSpriteID: (value) => set({ id: value }),
}));

const useID = create((set) => ({
  blocks: 1,
  inputs: 1,
  instances: 1,
  connectors: 1,

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

  incrementConnectors: () =>
    set((state) => ({
      connectors: state.connectors + 1,
    })),
}));


const useSpriteStore = create((set, get) => ({
  sprites: {},
  instances: {},
  blocks: {},
  inputs: {},
  operators: {},
  connectors: {},

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
            //blocks: {},
            //inputs: {},
            instances: [instanceID],
            //sound: {},
            //operators: {},
          },
        },
      };
    }),

  addBlock: (spriteID, blockID, blockRef, domRef, block, inputList, nextBlockID, prevBlockID, name) =>
    set((state) => {
      return {
        blocks: {
          ...state.blocks,

          [blockID]: {
            visible: true,
            spriteID,
            name,
            blockRef,
            domRef,
            block,
            inputList,
            nextBlockID,
            prevBlockID,
            drag: false,
            x: 0,
            y: 0,
            offsetX: 0,
            offsetNextX: 0,
            branches: [],
          },
        },
      };
    }),

  addOperator: (spriteID, blockID, blockRef, domRef, block, inputList, name) =>
    set((state) => {
      return {
        operators: {
          ...state.operators,

          [blockID]: {
            spriteID,
            name,
            blockRef,
            domRef,
            block,
            inputList,
            parentID: null,
            visible: true,
            drag: false,
            x: 0,
            y: 0,
          },
        },
      };
    }),

  addConnector: (spriteID, blockID, block) => 
    set((state) => {
      return {
        connectors: {
          ...state.connectors,

          [blockID]: {
            spriteID,
            block,
            visible: true,
          }
        }
      };
  }), 
  
  addInput: (spriteID, inputID, parentType, parentID, blockType, blockID, domRef, blockRef, block) =>
    set((state) => {
      return {
        inputs: {
          ...state.inputs,

          [inputID]: {
            visible: true,
            spriteID,
            parentType,
            parentID,
            blockType,
            blockID,
            //Default input box info if blockType or blockID is null
            domRef,
            blockRef,
            block,
            value: 10,
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
            rotation,
          }
        }
      };
    }),

  updateInstancePosition: (instanceID, xpos, ypos) =>
    set((state) => {
      return {
        instances: {
          ...state.instances,
          [instanceID]: {
            ...state.instances[instanceID],
            xpos,
            ypos,
          }
        }
      };
    }),
  
  updateBlockPosition: (type, blockID, x, y) =>
    set((state) => {
      return {
        [type]: {
          ...state[type],

          [blockID]: {
            ...state[type][blockID],
            x,
            y,
          },
        },
      };
    }),

  updateInputValue: (inputID, value) =>
    set((state) => {
      return {
        inputs: {
          ...state.inputs,

          [inputID]: {
            ...state.inputs[inputID],
            value,
          },  
        },
      };
    }),

  updateInputID: (inputID, blockType, blockID) => set((state) => {
    return {
      inputs: {
        ...state.inputs,

        [inputID]: {
          ...state.inputs[inputID],
          blockType,
          blockID,
        },  
      },
    };
  }),

  updateVisibility: (blockType, blockID, parentID, visible) =>
    set((state) => {
      return {
        [blockType]: {
          ...state[blockType],
          [blockID]: {
            ...state[blockType][blockID],
            visible: visible,
            parentID: parentID,
          }
        }
      };
    }),
}));

useSpriteStore.getState().addSprite(useSpriteID.getState().id);

export { useSpriteStore, useSpriteID, useID };