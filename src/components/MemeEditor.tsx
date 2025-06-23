
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Share, Plus } from 'lucide-react';
import { MemeTemplate, TextElement } from '../types/meme';
import MemeCanvas from './MemeCanvas';
import TextControls from './TextControls';
import { generateAICaption } from '../utils/aiCaptions';
import { useToast } from '../hooks/use-toast';

interface MemeEditorProps {
  selectedTemplate: MemeTemplate | null;
  onBackToGallery: () => void;
}

const MemeEditor: React.FC<MemeEditorProps> = ({ selectedTemplate, onBackToGallery }) => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [apiKey] = useState<string>('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');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTemplate) {
      // Initialize with default text elements
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

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      toast({
        title: "Meme Downloaded!",
        description: "Your meme has been saved to your device.",
      });
    }
  };

  const handleShare = async () => {
    if (canvasRef.current) {
      try {
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png');
        });
        
        if (navigator.share) {
          await navigator.share({
            title: 'My Awesome Meme',
            files: [new File([blob], 'meme.png', { type: 'image/png' })],
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast({
            title: "Copied to Clipboard!",
            description: "Your meme image has been copied to the clipboard.",
          });
        }
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share the meme. Try downloading instead.",
          variant: "destructive",
        });
      }
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">No template selected</h2>
        <button 
          onClick={onBackToGallery}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  const selectedText = textElements.find(text => text.id === selectedTextId);

  return (
    <div className="bg-white/95 rounded-2xl p-6 min-h-[70vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Meme Editor</h2>
        <button 
          onClick={onBackToGallery}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Gallery
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-center mb-4 p-4 bg-gray-100 rounded-lg">
            <MemeCanvas
              ref={canvasRef}
              template={selectedTemplate}
              textElements={textElements}
              selectedTextId={selectedTextId}
              onTextSelect={setSelectedTextId}
              onTextUpdate={handleTextUpdate}
            />
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleAddText}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              Add Text
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={20} />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Share size={20} />
              Share
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">AI Caption Generator</h3>
            <p className="text-sm text-gray-600 mb-4">
              OpenAI API key is configured. Click below to generate funny captions!
            </p>
            <button
              onClick={handleGenerateCaption}
              disabled={isGeneratingCaption}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
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
        </div>
      </div>
    </div>
  );
};

export default MemeEditor;
