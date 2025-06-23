
import React, { useState } from 'react';
import MemeGallery from '../components/MemeGallery';
import MemeEditor from '../components/MemeEditor';
import { MemeTemplate } from '../types/meme';

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setCurrentTab(1); // Switch to editor tab
  };

  const handleTabChange = (newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleBackToGallery = () => {
    setCurrentTab(0);
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 text-white">
          <h1 className="text-5xl font-bold mb-4">🎭 Meme Generator</h1>
          <p className="text-xl opacity-90">Create hilarious memes with AI-powered captions!</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="flex justify-center bg-white/5">
            <button
              onClick={() => handleTabChange(0)}
              className={`px-6 py-3 font-semibold transition-colors ${
                currentTab === 0 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Meme Gallery
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`px-6 py-3 font-semibold transition-colors ${
                currentTab === 1 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Meme Editor
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
