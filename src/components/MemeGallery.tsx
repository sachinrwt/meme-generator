
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
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 text-center">
        Choose a Template
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
            <div className="min-h-[200px] bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-green-800 dark:border-green-400 rounded-lg flex flex-col items-center justify-center text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-600 transition-all duration-300 p-6">
              <Upload size={48} className="mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Click to select an image
              </p>
            </div>
          </label>
        </div>

        {/* Meme Templates */}
        {popularMemeTemplates.map((template) => (
          <div key={template.id}>
            <div 
              onClick={() => onTemplateSelect(template)}
              className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 dark:border-gray-600"
            >
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
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
