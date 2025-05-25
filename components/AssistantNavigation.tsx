/**
 * Assistant Navigation Component
 * 
 * This component provides a navigation bar for switching between different
 * specialized assistants, including the main assistant (Goodwin), Mr. Brightwell
 * (image generation), and Mr. Gearhart (mechanic).
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Image as ImageIcon, Wrench, MessageSquare, CreditCard } from 'lucide-react';
import CreditBalanceDisplay from './CreditBalanceDisplay';

export function AssistantNavigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Goodwin Assistants
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Goodwin
              </Link>
              
              <Link 
                href="/image-generator"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/image-generator') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Mr. Brightwell
              </Link>
              
              <Link 
                href="/mechanic-assistant"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/mechanic-assistant') 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Mr. Gearhart
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <CreditBalanceDisplay />
              <Link 
                href="/buy-credits"
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                  isActive('/buy-credits') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <CreditCard className="mr-1 h-4 w-4" />
                Buy Credits
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <div className="mr-2">
              <CreditBalanceDisplay />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Goodwin
            </div>
          </Link>
          
          <Link 
            href="/image-generator"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/image-generator') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" />
              Mr. Brightwell
            </div>
          </Link>
          
          <Link 
            href="/mechanic-assistant"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/mechanic-assistant') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Mr. Gearhart
            </div>
          </Link>
          
          <Link 
            href="/buy-credits"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/buy-credits') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Buy Credits
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
