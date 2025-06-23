
import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import MemeGallery from '../components/MemeGallery';
import MemeEditor from '../components/MemeEditor';
import { MemeTemplate } from '../types/meme';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(2),
}));

const Header = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  color: 'white',
}));

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const handleTemplateSelect = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setCurrentTab(1); // Switch to editor tab
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleBackToGallery = () => {
    setCurrentTab(0);
    setSelectedTemplate(null);
  };

  return (
    <StyledContainer maxWidth="lg">
      <Header>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          🎭 Meme Generator
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Create hilarious memes with AI-powered captions!
        </Typography>
      </Header>

      <Box sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          centered
          sx={{ 
            '& .MuiTab-root': { color: 'white', fontWeight: 'bold' },
            '& .MuiTabs-indicator': { backgroundColor: '#fff' }
          }}
        >
          <Tab label="Meme Gallery" />
          <Tab label="Meme Editor" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && (
            <MemeGallery onTemplateSelect={handleTemplateSelect} />
          )}
          {currentTab === 1 && (
            <MemeEditor 
              selectedTemplate={selectedTemplate} 
              onBackToGallery={handleBackToGallery}
            />
          )}
        </Box>
      </Box>
    </StyledContainer>
  );
};

export default Index;
