import React from "react";
import { useSpriteID, useSpriteStore } from "./data/states/SpriteStore.jsx";
import {MoveBlock} from "./data/blocks/motion/move.jsx";
import { useRef } from "react";
import { useBlockStore } from "./data/states/BlockStore.jsx";

function addSprite() {
  const spriteID = Object.keys(useSpriteStore.getState().sprites).length + 1;
  useSpriteStore.getState().createSprite(spriteID);
  useSpriteID.getState().setSpriteID(spriteID);
  console.log("SpriteAdded");
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = React.useState("Motion");

  const spriteID = useSpriteID((state) => state.id);
  const spriteCount = useSpriteStore((state) => Object.keys(state.sprites).length);
  const blocks = useSpriteStore((state) => state.sprites[spriteID]?.blocks || {});
  const palleteBlocks = useBlockStore((state) => state.blocks);
  //return (<>Hello</>);
  return (
    <div className="h-screen flex flex-col font-sans">
      {/* TOP BAR */}
      <div className="h-12 bg-blue-500 text-white flex items-center justify-between px-4">
        <div className="font-bold text-lg">DragCode</div>
        <div className="space-x-2">
          <button className="bg-green-500 px-3 py-1 rounded">Run</button>
          <button className="bg-red-500 px-3 py-1 rounded">Stop</button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="relative w-64 bg-gray-100 border-r flex flex-col">
          
          {/* Categories */}
          <div className="p-3 border-b">
            <div className="space-y-2">
              {["Motion", "Looks", "Sound", "Events", "Control"].map((cat) => (
                <div
                  key={cat}
                  className={`px-2 py-1 rounded cursor-pointer transition 
                              ${selectedCategory === cat ? "bg-gray-500 text-white" : "bg-gray-300 hover:bg-gray-400"}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Blocks */}
          
          <div className="p-3 space-y-2 overflow-auto">
            {palleteBlocks?.map((block, index) => (
              <>{block}</>
            ))}
          </div>
        </div>
        {/* WORKSPACE */}
        <div className="flex-1 bg-white p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Workspace</h2>
          <div className=" flex-1 overflow-auto relative h-full border-2 border-dashed rounded-lg flex items-center justify-center z-50">
            <div className="text-gray-400 select-none">Place blocks here</div>
            <>
              {Object.entries(blocks).map(([blockID, item]) => (
                <React.Fragment key={blockID}>
                  {item.block}
                </React.Fragment>
              ))}
            </>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-100 border-l flex flex-col bg-gray-50">
          
          {/* Stage */}
          <div className="p-3 border-b flex-1">
            <h2 className="font-semibold mb-2">Stage</h2>
            <div className="bg-black h-60 rounded flex items-center justify-center text-white">
              Canvas Area
            </div>
          </div>

          {/* Sprites */}
          <div className="p-3 flex flex-col h-64">
            <h2 className="font-semibold mb-2">Sprites</h2>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              {Array.from({ length: spriteCount }, (_, index) => {
                const id = index + 1;
                const selected = spriteID === id;

                return (
                  <div
                    key={id}
                    id={id}
                    onClick={() => useSpriteID.getState().setSpriteID(id)}
                    className={`
                      h-16 rounded-lg border flex items-center justify-center
                      shadow-sm cursor-pointer transition
                      ${
                        selected
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-white border-gray-300 hover:bg-gray-100"
                      }
                    `}
                  >
                    Sprite{id}
                  </div>
                );
              })}
            </div>

            {/* ➕ Add Button */}
            <button className="cursor-pointer" onClick={addSprite}>
              + Add Sprite
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}