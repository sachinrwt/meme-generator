
import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowDown, Download, Share } from 'lucide-react';
import { MemeTemplate, TextElement } from '../types/meme';
import MemeCanvas from './MemeCanvas';
import TextControls from './TextControls';
import { generateAICaption } from '../utils/aiCaptions';
import { useToast } from '../hooks/use-toast';

const EditorContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  minHeight: '70vh',
}));

const CanvasContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: theme.spacing(1),
}));

const ResponsiveLayout = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '2fr 1fr',
  },
}));

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
      <Box textAlign="center" py={8}>
        <Typography variant="h5" gutterBottom>
          No template selected
        </Typography>
        <Button variant="contained" onClick={onBackToGallery}>
          Back to Gallery
        </Button>
      </Box>
    );
  }

  const selectedText = textElements.find(text => text.id === selectedTextId);

  return (
    <EditorContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h2">
          Meme Editor
        </Typography>
        <Button variant="outlined" onClick={onBackToGallery}>
          Back to Gallery
        </Button>
      </Box>

      <ResponsiveLayout>
        <Box>
          <CanvasContainer>
            <MemeCanvas
              ref={canvasRef}
              template={selectedTemplate}
              textElements={textElements}
              selectedTextId={selectedTextId}
              onTextSelect={setSelectedTextId}
              onTextUpdate={handleTextUpdate}
            />
          </CanvasContainer>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              onClick={handleAddText}
              color="primary"
            >
              Add Text
            </Button>
            <Button
              variant="contained"
              onClick={handleDownload}
              startIcon={<Download />}
              color="success"
            >
              Download
            </Button>
            <Button
              variant="contained"
              onClick={handleShare}
              startIcon={<Share />}
              color="info"
            >
              Share
            </Button>
          </Box>
        </Box>

        <Box>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              AI Caption Generator
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              OpenAI API key is configured. Click below to generate funny captions!
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateCaption}
              disabled={isGeneratingCaption}
            >
              {isGeneratingCaption ? 'Generating...' : 'Generate Caption'}
            </Button>
          </Box>

          {selectedText && (
            <TextControls
              textElement={selectedText}
              onUpdate={(updates) => handleTextUpdate(selectedText.id, updates)}
              onDelete={() => handleTextDelete(selectedText.id)}
            />
          )}
        </Box>
      </ResponsiveLayout>
    </EditorContainer>
  );
};

export default MemeEditor;
