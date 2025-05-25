/**
 * Mechanic Assistant Component (Mr. Gearhart)
 * 
 * This component provides a user interface for interacting with Mr. Gearhart,
 * the specialized mechanic assistant. It handles:
 * - Submitting mechanical questions with optional images
 * - Displaying detailed responses with part recommendations
 * - Credit balance tracking and notifications
 * - Vector store creation for equipment manuals
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

"use client";

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCredits } from '@/lib/hooks/useCredits';
import CreditBalanceDisplay from './CreditBalanceDisplay';
import Image from 'next/image';

interface MechanicResponse {
  response: string;
  sourcedReferences?: {
    title: string;
    content: string;
    source: string;
  }[];
  suggestedParts?: {
    name: string;
    partNumber: string;
    estimatedPrice?: string;
  }[];
  credits?: number;
  lowCredits?: boolean;
  lowCreditMessage?: string;
}

export function MechanicAssistant() {
  const { data: session } = useSession();
  const { credits, isLowBalance, refreshCredits } = useCredits(60000); // Auto-refresh every minute
  const [query, setQuery] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<MechanicResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileArray = Array.from(event.target.files);
      setImages([...images, ...fileArray]);
      
      // Create URLs for preview
      const newImageUrls = fileArray.map(file => URL.createObjectURL(file));
      setImageUrls([...imageUrls, ...newImageUrls]);
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  // Submit the question to Mr. Gearhart
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError('You must be logged in to use this feature');
      return;
    }
    
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First, upload any images to get their URLs
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadImages(images);
      }
      
      // Then, submit the question with image URLs
      const res = await fetch('/api/mechanic-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          modelName: modelName || undefined,
          modelYear: modelYear || undefined,
          imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        refreshCredits(); // Update credit balance
      } else {
        const errorData = await res.json();
        if (res.status === 402) {
          setError('Insufficient credits. Please purchase more credits to continue.');
        } else {
          setError(errorData.error || 'Failed to get a response from Mr. Gearhart');
        }
      }
    } catch (err) {
      console.error('Error submitting to mechanic assistant:', err);
      setError('An error occurred while communicating with Mr. Gearhart');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload images to get their URLs
  const uploadImages = async (imageFiles: File[]): Promise<string[]> => {
    // This is a placeholder for the actual image upload implementation
    // In a real app, you would upload these to a storage service and get their URLs
    // For now, we'll simulate it with a Promise that resolves after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return dummy URLs for now
        resolve(imageFiles.map((_, index) => `https://example.com/image${index}.jpg`));
      }, 1000);
    });
  };

  // Reset the form
  const handleReset = () => {
    setQuery('');
    setModelName('');
    setModelYear('');
    
    // Revoke all object URLs to avoid memory leaks
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    
    setImages([]);
    setImageUrls([]);
    setResponse(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Mr. Gearhart</h1>
          <p className="text-gray-600">Your personal mechanic assistant</p>
        </div>
        <CreditBalanceDisplay className="mt-2 md:mt-0" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="query" className="block font-medium mb-1">
                What can I help you fix today?
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                rows={4}
                placeholder="Describe the issue you're having..."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="modelName" className="block font-medium mb-1">
                  Equipment/Model (optional)
                </label>
                <input
                  type="text"
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                  placeholder="e.g., Honda HRX217"
                />
              </div>
              <div>
                <label htmlFor="modelYear" className="block font-medium mb-1">
                  Year (optional)
                </label>
                <input
                  type="text"
                  id="modelYear"
                  value={modelYear}
                  onChange={(e) => setModelYear(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                  placeholder="e.g., 2019"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Add Images (optional)
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Select Images
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {images.length} {images.length === 1 ? 'image' : 'images'} selected
                </span>
              </div>
              
              {imageUrls.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Consulting Mr. Gearhart...' : 'Get Help'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Reset
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
        
        {/* Response Display */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Consulting Mr. Gearhart...</p>
            </div>
          ) : response ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Mr. Gearhart's Response:</h2>
              <div className="prose max-w-none">
                {response.response.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {response.suggestedParts && response.suggestedParts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Suggested Parts:</h3>
                  <ul className="space-y-2">
                    {response.suggestedParts.map((part, index) => (
                      <li key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{part.name}</span>
                        <div className="text-right">
                          <div className="text-sm font-mono">{part.partNumber}</div>
                          {part.estimatedPrice && (
                            <div className="text-sm text-gray-600">{part.estimatedPrice}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {response.lowCredits && (
                <div className="mt-4 p-3 bg-amber-100 text-amber-700 rounded">
                  {response.lowCreditMessage || "Your credit balance is running low. Please purchase more credits soon."}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-xl font-semibold mb-2">Mr. Gearhart is Ready</h2>
              <p className="text-gray-600">
                Ask me about any mechanical issue you're having with your equipment,
                vehicles, or household appliances.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
