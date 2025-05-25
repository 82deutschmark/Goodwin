"use client";
import Assistant from "@/components/assistant";
import ToolsPanel from "@/components/tools-panel";
import { Settings, X } from "lucide-react";
import ImageGenerator from "./image-generator"; // Added for image generation UI (GPT-4.1)
import { useState } from "react";

export default function Main() {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  return (
    <div className="flex justify-center h-screen relative">
      {/* Responsive two-column layout: Assistant (chat) and ImageGenerator side by side on desktop, stacked on mobile. */}
      <div className="w-full md:w-[70%] flex flex-col md:flex-row gap-6 mt-4">
        {/* Chat/Assistant Pane */}
        <div className="flex-1 min-w-[320px]">
          <Assistant />
        </div>
        {/* Image Generator Pane */}
        <div className="flex-1 min-w-[320px]">
          {/*
            ImageGenerator: Allows users to generate images via OpenAI's gpt-image-1 model.
            Author/Model: GPT-4.1
            Date: 2025-05-19
          */}
          <ImageGenerator />
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => {
            if (window.innerWidth < 768) {
              setIsMobilePanelOpen(!isMobilePanelOpen);
              setIsRightPanelOpen(false);
            } else {
              setIsRightPanelOpen(!isRightPanelOpen);
              setIsMobilePanelOpen(false);
            }
          }}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isMobilePanelOpen || isRightPanelOpen ? <X size={24} /> : <Settings size={24} />}
        </button>
      </div>

      <div
        className={`
          fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          w-full md:w-[300px] lg:w-[350px] xl:w-[400px]
          ${isRightPanelOpen ? "translate-x-0" : "translate-x-full"}
          hidden md:block
        `}
      >
        <div className="p-4 h-full">
          <ToolsPanel />
        </div>
      </div>
      
      {isMobilePanelOpen && (
        <div className="fixed inset-0 z-30 flex justify-end bg-black bg-opacity-30 md:hidden">
          <div className="w-full bg-white dark:bg-gray-800 h-full p-4">
            <ToolsPanel />
          </div>
        </div>
      )}
    </div>
  );
}
