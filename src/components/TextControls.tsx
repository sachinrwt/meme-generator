import React from 'react';
import { TextElement } from '../types/meme';

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

  const presetColors = [
    '#FFFFFF', // White
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-600">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Text Settings</h3>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Text Content
          </label>
          <textarea
            value={textElement.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Size: {textElement.fontSize}px
            </label>
            <input
              type="range"
              min={12}
              max={72}
              value={textElement.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              className="w-full accent-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Family
            </label>
            <select
              value={textElement.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Text Alignment
            </label>
            <select
              value={textElement.textAlign}
              onChange={(e) => onUpdate({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Weight
            </label>
            <select
              value={textElement.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={textElement.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                title="Choose text color"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {textElement.color.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="stroke"
              checked={textElement.stroke}
              onChange={(e) => onUpdate({ stroke: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="stroke" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Text Outline
            </label>
          </div>

          {textElement.stroke && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Outline Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={textElement.strokeColor}
                  onChange={(e) => onUpdate({ strokeColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  title="Choose outline color"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {textElement.strokeColor.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {textElement.stroke && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Outline Width: {textElement.strokeWidth}px
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={textElement.strokeWidth}
                onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
                className="w-full accent-green-600"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              X Position: {Math.round(textElement.x)}
            </label>
            <input
              type="range"
              min={0}
              max={500}
              value={textElement.x}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
              className="w-full accent-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Y Position: {Math.round(textElement.y)}
            </label>
            <input
              type="range"
              min={0}
              max={500}
              value={textElement.y}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
              className="w-full accent-green-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextControls;
