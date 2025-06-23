
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { MemeTemplate } from '../types/meme';
import { popularMemeTemplates } from '../utils/memeTemplates';

interface MemeGalleryProps {
  onTemplateSelect: (template: MemeTemplate) => void;
}

const MemeGallery: React.FC<MemeGalleryProps> = ({ onTemplateSelect }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        
        const customTemplate: MemeTemplate = {
          id: 'custom-upload',
          name: 'Custom Upload',
          url: imageUrl,
          width: 500,
          height: 500,
        };
        
        onTemplateSelect(customTemplate);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-bold text-white text-center mb-8">
        Choose a Meme Template
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upload Custom Image Card */}
        <div>
          <input
            accept="image/*"
            className="hidden"
            id="upload-button"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="upload-button" className="cursor-pointer">
            <div className="min-h-[200px] bg-white/10 border-2 border-dashed border-white/50 rounded-lg flex flex-col items-center justify-center text-white hover:bg-white/20 hover:border-white/80 transition-all duration-300 p-6">
              <Upload size={48} className="mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Your Image</h3>
              <p className="text-sm opacity-80 text-center">
                Click to select an image from your device
              </p>
            </div>
          </label>
        </div>

        {/* Meme Templates */}
        {popularMemeTemplates.map((template) => (
          <div key={template.id}>
            <div 
              onClick={() => onTemplateSelect(template)}
              className="bg-white/90 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-center text-gray-800">
                  {template.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemeGallery;
