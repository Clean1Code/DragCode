import { create } from "zustand";

const useBlockStore = create((set) => ({
  Motion: {
    blocks: [],
  },

  Looks: {
    blocks: [],
  },

  Events: {
    blocks: [],
  },

  Control: {
    blocks: [],
  },

  Operator: {
    blocks: [],
  },
  addBlock: (block, category) => set((state) => ({
    [category]: {
      ...state[category],
      blocks: [...state[category].blocks, block],
    },
  })),
}));

export {useBlockStore};
