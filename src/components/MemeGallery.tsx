
import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Button, Input } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Upload, Image } from 'lucide-react';
import { MemeTemplate } from '../types/meme';
import { popularMemeTemplates } from '../utils/memeTemplates';

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
}));

const UploadCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '2px dashed rgba(255, 255, 255, 0.5)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 200,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
}));

const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

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
    <Box>
      <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
        Choose a Meme Template
      </Typography>
      
      <ResponsiveGrid>
        {/* Upload Custom Image Card */}
        <Box>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="upload-button"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="upload-button">
            <UploadCard>
              <Box textAlign="center">
                <Upload size={48} style={{ marginBottom: 16 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Your Image
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Click to select an image from your device
                </Typography>
              </Box>
            </UploadCard>
          </label>
        </Box>

        {/* Meme Templates */}
        {popularMemeTemplates.map((template) => (
          <Box key={template.id}>
            <StyledCard onClick={() => onTemplateSelect(template)}>
              <CardMedia
                component="img"
                height="200"
                image={template.url}
                alt={template.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" component="div" textAlign="center">
                  {template.name}
                </Typography>
              </CardContent>
            </StyledCard>
          </Box>
        ))}
      </ResponsiveGrid>
    </Box>
  );
};

export default MemeGallery;
