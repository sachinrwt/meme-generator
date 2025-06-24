import React, { useState } from 'react';
import MemeGallery from '../components/MemeGallery';
import MemeEditor from '../components/MemeEditor';
import TrendingMemes from '../components/TrendingMemes';
import ThemeToggle from '../components/ThemeToggle';
import { MemeTemplate } from '../types/meme';

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setCurrentTab(1);
  };

  const handleTabChange = (newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleBackToGallery = () => {
    setCurrentTab(0);
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-green-800 dark:text-green-400 mb-2">
              Meme Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create hilarious memes with AI-powered captions
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabChange(0)}
              className={`px-8 py-4 font-semibold transition-colors ${
                currentTab === 0 
                  ? 'text-green-800 dark:text-green-400 border-b-2 border-green-800 dark:border-green-400 bg-green-50 dark:bg-gray-700' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`px-8 py-4 font-semibold transition-colors ${
                currentTab === 1 
                  ? 'text-green-800 dark:text-green-400 border-b-2 border-green-800 dark:border-green-400 bg-green-50 dark:bg-gray-700' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => handleTabChange(2)}
              className={`px-8 py-4 font-semibold transition-colors ${
                currentTab === 2 
                  ? 'text-green-800 dark:text-green-400 border-b-2 border-green-800 dark:border-green-400 bg-green-50 dark:bg-gray-700' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-300'
              }`}
            >
              Trending
            </button>
          </div>

          <div className="p-6">
            {currentTab === 0 && (
              <MemeGallery onTemplateSelect={handleTemplateSelect} />
            )}
            {currentTab === 1 && (
              <MemeEditor 
                selectedTemplate={selectedTemplate} 
                onBackToGallery={handleBackToGallery}
              />
            )}
            {currentTab === 2 && (
              <TrendingMemes onTemplateSelect={handleTemplateSelect} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
