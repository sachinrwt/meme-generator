import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { MemeTemplate } from '../types/meme';
import { fetchRedditMemeTemplates } from '../utils/memeTemplates';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface MemeGalleryProps {
  onTemplateSelect: (template: MemeTemplate) => void;
}

const MemeGallery: React.FC<MemeGalleryProps> = ({ onTemplateSelect }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState('memes');

  const subreddits = [
    { name: 'memes', label: 'Memes' },
    { name: 'dankmemes', label: 'Dank Memes' },
    { name: 'funny', label: 'Funny' },
    { name: 'meirl', label: 'Me IRL' },
    { name: 'wholesomememes', label: 'Wholesome' },
    { name: 'IndianMemeTemplates', label: 'Indian Templates' }
  ];

  const fetchTemplates = async (subreddit: string = 'memes') => {
    setLoading(true);
    setError(null);
    try {
      const redditTemplates = await fetchRedditMemeTemplates(subreddit, 15);
      setTemplates(redditTemplates);
    } catch (err) {
      setError('Failed to load Reddit templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(selectedSubreddit);
  }, [selectedSubreddit]);

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

  const handleSubredditChange = (subreddit: string) => {
    setSelectedSubreddit(subreddit);
  };

  const handleRefresh = () => {
    fetchTemplates(selectedSubreddit);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">
          Reddit Meme Templates
        </h2>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedSubreddit}
            onChange={(e) => handleSubredditChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {subreddits.map((sub) => (
              <option key={sub.name} value={sub.name}>
                r/{sub.label}
              </option>
            ))}
          </select>
          
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}
      
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

        {/* Loading Skeletons */}
        {loading && Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
            <Skeleton className="w-full h-48" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
          </div>
        ))}

        {/* Reddit Meme Templates */}
        {!loading && templates.map((template) => (
          <div key={template.id}>
            <div 
              onClick={() => onTemplateSelect(template)}
              className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 dark:border-gray-600"
            >
              <div className="relative">
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                {template.isVideo && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Video
                  </div>
                )}
              </div>
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
