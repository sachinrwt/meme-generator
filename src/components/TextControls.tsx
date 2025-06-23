
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TextElement } from '../types/meme';

const ControlsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
}));

const ColorInput = styled('input')({
  width: 50,
  height: 40,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
});

const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  },
}));

const FullWidthBox = styled(Box)({
  gridColumn: '1 / -1',
});

interface TextControlsProps {
  textElement: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
}

const TextControls: React.FC<TextControlsProps> = ({ textElement, onUpdate, onDelete }) => {
  const fontFamilies = [
    'Arial Black',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Comic Sans MS',
    'Impact',
  ];

  return (
    <ControlsContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Text Settings</Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={onDelete}
        >
          Delete
        </Button>
      </Box>

      <ResponsiveGrid>
        <FullWidthBox>
          <TextField
            fullWidth
            label="Text Content"
            value={textElement.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            multiline
            rows={2}
          />
        </FullWidthBox>

        <Box>
          <Typography gutterBottom>Font Size: {textElement.fontSize}px</Typography>
          <Slider
            value={textElement.fontSize}
            onChange={(_, value) => onUpdate({ fontSize: value as number })}
            min={12}
            max={72}
            step={1}
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Font Family</InputLabel>
            <Select
              value={textElement.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            >
              {fontFamilies.map((font) => (
                <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Text Alignment</InputLabel>
            <Select
              value={textElement.textAlign}
              onChange={(e) => onUpdate({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
            >
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Font Weight</InputLabel>
            <Select
              value={textElement.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography gutterBottom>Text Color</Typography>
          <ColorInput
            type="color"
            value={textElement.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={textElement.stroke}
                onChange={(e) => onUpdate({ stroke: e.target.checked })}
              />
            }
            label="Text Outline"
          />
        </Box>

        {textElement.stroke && (
          <FullWidthBox>
            <Typography gutterBottom>Outline Color</Typography>
            <ColorInput
              type="color"
              value={textElement.strokeColor}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
            />
          </FullWidthBox>
        )}

        <Box>
          <Typography gutterBottom>X Position: {Math.round(textElement.x)}</Typography>
          <Slider
            value={textElement.x}
            onChange={(_, value) => onUpdate({ x: value as number })}
            min={0}
            max={500}
            step={1}
          />
        </Box>

        <Box>
          <Typography gutterBottom>Y Position: {Math.round(textElement.y)}</Typography>
          <Slider
            value={textElement.y}
            onChange={(_, value) => onUpdate({ y: value as number })}
            min={0}
            max={500}
            step={1}
          />
        </Box>
      </ResponsiveGrid>
    </ControlsContainer>
  );
};

export default TextControls;
