/**
 * Image Generator Page
 * Purpose: Serves as a page route for image generation functionality.
 * How it works: Imports and renders the ImageGenerator component with appropriate layout.
 * Author/Model: Claude 3.7 Sonnet
 * Date: 2025-05-20
 */

"use client";
import React from "react";
import ImageGenerator from "@/components/image-generator";

/**
 * ImageGeneratorPage component
 * Page wrapper for the ImageGenerator component
 * Follows the app pattern of separating page routes from component implementations
 * 
 * Author: Claude 3.7 Sonnet
 * Last updated: 2025-05-20
 */
export default function ImageGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ImageGenerator />
    </div>
  );
}

