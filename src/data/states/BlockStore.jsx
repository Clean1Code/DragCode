import { create } from "zustand";

const useBlockStore = create((set) => ({
  blocks: [],
  
  addBlock: (block) => set((state) => ({
    blocks: [...state.blocks, block],
  })),
}));

export {useBlockStore};
