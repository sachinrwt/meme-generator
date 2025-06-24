import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Share, Plus, Video, Square } from 'lucide-react';
import { MemeTemplate, TextElement, RectangleElement } from '../types/meme';
import MemeCanvas from './MemeCanvas';
import TextControls from './TextControls';
import RectangleControls from './RectangleControls';
import { generateAICaption } from '../utils/aiCaptions';
import { useToast } from '../hooks/use-toast';
import { Badge } from './ui/badge';

interface MemeEditorProps {
  selectedTemplate: MemeTemplate | null;
  onBackToGallery: () => void;
}

const MemeEditor: React.FC<MemeEditorProps> = ({ selectedTemplate, onBackToGallery }) => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [rectangleElements, setRectangleElements] = useState<RectangleElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedRectangleId, setSelectedRectangleId] = useState<string | null>(null);
  const [apiKey] = useState<string>('sk-my-recipe-book-api-rDFxlbpprVOGyb8Fh5qaT3BlbkFJeZnK7iGYVKkdTJcZKbpW');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTemplate) {
      const defaultTexts: TextElement[] = [
        {
          id: 'top-text',
          text: 'TOP TEXT',
          x: selectedTemplate.width / 2,
          y: 50,
          fontSize: 36,
          fontFamily: 'Arial Black',
          color: '#ffffff',
          textAlign: 'center',
          fontWeight: 'bold',
          stroke: true,
          strokeColor: '#000000',
          strokeWidth: 3,
        },
        {
          id: 'bottom-text',
          text: 'BOTTOM TEXT',
          x: selectedTemplate.width / 2,
          y: selectedTemplate.height - 50,
          fontSize: 36,
          fontFamily: 'Arial Black',
          color: '#ffffff',
          textAlign: 'center',
          fontWeight: 'bold',
          stroke: true,
          strokeColor: '#000000',
          strokeWidth: 3,
        },
      ];
      setTextElements(defaultTexts);
      setSelectedTextId('top-text');
    }
  }, [selectedTemplate]);

  const handleAddText = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: 'NEW TEXT',
      x: 250,
      y: 200,
      fontSize: 24,
      fontFamily: 'Arial Black',
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: 'bold',
      stroke: true,
      strokeColor: '#000000',
      strokeWidth: 3,
    };
    setTextElements([...textElements, newText]);
    setSelectedTextId(newText.id);
  };

  const handleTextUpdate = (id: string, updates: Partial<TextElement>) => {
    setTextElements(textElements.map(text => 
      text.id === id ? { ...text, ...updates } : text
    ));
  };

  const handleTextDelete = (id: string) => {
    setTextElements(textElements.filter(text => text.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const handleAddRectangle = () => {
    const newRectangle: RectangleElement = {
      id: `rectangle-${Date.now()}`,
      x: 250,
      y: 200,
      width: 100,
      height: 60,
      fillColor: '#ff0000',
      strokeColor: '#000000',
      strokeWidth: 2,
      opacity: 0.7,
      borderRadius: 5,
    };
    setRectangleElements([...rectangleElements, newRectangle]);
    setSelectedRectangleId(newRectangle.id);
    setSelectedTextId(null); // Deselect text when adding rectangle
  };

  const handleRectangleUpdate = (id: string, updates: Partial<RectangleElement>) => {
    setRectangleElements(rectangleElements.map(rect => 
      rect.id === id ? { ...rect, ...updates } : rect
    ));
  };

  const handleRectangleDelete = (id: string) => {
    setRectangleElements(rectangleElements.filter(rect => rect.id !== id));
    if (selectedRectangleId === id) {
      setSelectedRectangleId(null);
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedTemplate) return;

    setIsGeneratingCaption(true);
    try {
      const caption = await generateAICaption(selectedTemplate.name, apiKey);
      const captionLines = caption.split('\n').filter(line => line.trim());
      
      if (captionLines.length >= 2) {
        handleTextUpdate('top-text', { text: captionLines[0].toUpperCase() });
        handleTextUpdate('bottom-text', { text: captionLines[1].toUpperCase() });
      } else if (captionLines.length === 1) {
        handleTextUpdate('top-text', { text: captionLines[0].toUpperCase() });
      }

      toast({
        title: "Caption Generated!",
        description: "AI has generated a funny caption for your meme.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate caption. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSavePhotoAs = () => {
    if (canvasRef.current) {
      try {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.download = `meme-photo-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        
        toast({
          title: "Photo Saved!",
          description: "Your meme photo has been saved to your device.",
        });
      } catch (error) {
        console.error('Photo save failed:', error);
        toast({
          title: "Save Failed",
          description: "Unable to save the photo. This might be due to CORS restrictions.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveVideoAs = async () => {
    if (selectedTemplate?.isVideo && selectedTemplate?.videoUrl) {
      try {
        // Check if MediaRecorder is supported
        if (!window.MediaRecorder) {
          toast({
            title: "Video Recording Not Supported",
            description: "Your browser doesn't support video recording. Saving as image sequence instead.",
            variant: "destructive",
          });
          return;
        }
        
        // Create a canvas to render video with text overlays
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        canvas.width = selectedTemplate.width;
        canvas.height = selectedTemplate.height;
        
        // Create video element for processing
        const video = document.createElement('video');
        video.src = selectedTemplate.videoUrl;
        video.muted = true;
        video.crossOrigin = 'anonymous';
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
        });
        
        // Set up MediaRecorder to capture canvas
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });
        
        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          
          // Download the video
          const link = document.createElement('a');
          link.download = `meme-video-with-text-${Date.now()}.webm`;
          link.href = url;
          link.click();
          
          // Clean up
          URL.revokeObjectURL(url);
          
          toast({
            title: "Video Saved!",
            description: "Your meme video with text overlays has been saved.",
          });
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Play video and render frames with text
        video.play();
        
        const renderFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }
          
          // Draw video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Draw text overlays
          textElements.forEach((textEl) => {
            // Set font
            ctx.font = `${textEl.fontWeight} ${textEl.fontSize}px ${textEl.fontFamily}`;
            ctx.textAlign = textEl.textAlign;
            ctx.textBaseline = 'middle';
            
            // Add shadow for visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
            // Draw background rectangle
            const metrics = ctx.measureText(textEl.text);
            const width = metrics.width;
            const height = textEl.fontSize;
            const padding = 8;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
              textEl.x - width / 2 - padding,
              textEl.y - height / 2 - padding,
              width + padding * 2,
              height + padding * 2
            );
            
            // Draw stroke
            if (textEl.stroke) {
              ctx.strokeStyle = textEl.strokeColor;
              ctx.lineWidth = textEl.strokeWidth;
              ctx.strokeText(textEl.text, textEl.x, textEl.y);
            }
            
            // Draw text
            ctx.fillStyle = textEl.color;
            ctx.fillText(textEl.text, textEl.x, textEl.y);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          });
          
          // Continue rendering
          requestAnimationFrame(renderFrame);
        };
        
        renderFrame();
        
      } catch (error) {
        console.error('Video save failed:', error);
        
        // Fallback: Save current frame as image
        try {
          if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `meme-video-frame-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            toast({
              title: "Frame Saved Instead",
              description: "Video recording failed. Current frame with text has been saved as an image.",
            });
          }
        } catch (fallbackError) {
          console.error('Fallback save also failed:', fallbackError);
          toast({
            title: "Save Failed",
            description: "Unable to save video with text overlays. This might be due to CORS restrictions.",
            variant: "destructive",
          });
        }
      }
    } else {
      toast({
        title: "No Video Available",
        description: "This template is not a video or video URL is not available.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (canvasRef.current) {
      try {
        const blob = await new Promise<Blob>((resolve, reject) => {
          try {
            canvasRef.current!.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            }, 'image/png');
          } catch (error) {
            reject(error);
          }
        });
        
        if (navigator.share) {
          await navigator.share({
            title: 'My Awesome Meme',
            files: [new File([blob], 'meme.png', { type: 'image/png' })],
          });
        } else {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast({
            title: "Copied to Clipboard!",
            description: "Your meme image has been copied to the clipboard.",
          });
        }
      } catch (error) {
        console.error('Share failed:', error);
        if (selectedTemplate?.isVideo) {
          toast({
            title: "Video Share Not Supported",
            description: "Sharing video memes with text overlay is not supported due to browser limitations.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Share Failed",
            description: "Unable to share the meme. Try downloading instead.",
            variant: "destructive",
          });
        }
      }
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">No template selected</h2>
        <button 
          onClick={onBackToGallery}
          className="bg-green-800 dark:bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  const selectedText = textElements.find(text => text.id === selectedTextId);
  const selectedRectangle = rectangleElements.find(rect => rect.id === selectedRectangleId);

  return (
    <div className="min-h-[70vh]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Meme Editor</h2>
          {selectedTemplate?.isVideo && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Video Template
            </Badge>
          )}
        </div>
        <button 
          onClick={onBackToGallery}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft size={20} />
          Back to Gallery
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-center mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MemeCanvas
              ref={canvasRef}
              template={selectedTemplate}
              textElements={textElements}
              rectangleElements={rectangleElements}
              selectedTextId={selectedTextId}
              selectedRectangleId={selectedRectangleId}
              onTextSelect={setSelectedTextId}
              onTextUpdate={handleTextUpdate}
              onRectangleSelect={setSelectedRectangleId}
              onRectangleUpdate={handleRectangleUpdate}
            />
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleAddText}
              className="flex items-center gap-2 bg-green-800 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
            >
              <Plus size={20} />
              Add Text
            </button>
            <button
              onClick={handleAddRectangle}
              className="flex items-center gap-2 bg-blue-800 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            >
              <Square size={20} />
              Add Rectangle
            </button>
            <button
              onClick={handleSavePhotoAs}
              className="flex items-center gap-2 bg-green-800 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
            >
              <Download size={20} />
              Save Photo As
            </button>
            <button
              onClick={handleSaveVideoAs}
              className="flex items-center gap-2 bg-green-800 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
            >
              <Video size={20} />
              Save Video As
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-green-800 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
            >
              <Share size={20} />
              Share
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4 border border-green-200 dark:border-green-600">
            <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-400">AI Caption Generator</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Generate funny captions automatically
            </p>
            <button
              onClick={handleGenerateCaption}
              disabled={isGeneratingCaption}
              className="w-full bg-green-800 dark:bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 disabled:bg-green-400 dark:disabled:bg-green-400 transition-colors"
            >
              {isGeneratingCaption ? 'Generating...' : 'Generate Caption'}
            </button>
          </div>

          {selectedText && (
            <TextControls
              textElement={selectedText}
              onUpdate={(updates) => handleTextUpdate(selectedText.id, updates)}
              onDelete={() => handleTextDelete(selectedText.id)}
            />
          )}

          {selectedRectangle && (
            <RectangleControls
              rectangleElement={selectedRectangle}
              onUpdate={(updates) => handleRectangleUpdate(selectedRectangle.id, updates)}
              onDelete={() => handleRectangleDelete(selectedRectangle.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MemeEditor;
