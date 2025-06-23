
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

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Text Settings</h3>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Content
          </label>
          <textarea
            value={textElement.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size: {textElement.fontSize}px
          </label>
          <input
            type="range"
            min={12}
            max={72}
            value={textElement.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            value={textElement.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Alignment
          </label>
          <select
            value={textElement.textAlign}
            onChange={(e) => onUpdate({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Weight
          </label>
          <select
            value={textElement.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={textElement.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="stroke"
            checked={textElement.stroke}
            onChange={(e) => onUpdate({ stroke: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="stroke" className="text-sm font-medium text-gray-700">
            Text Outline
          </label>
        </div>

        {textElement.stroke && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outline Color
            </label>
            <input
              type="color"
              value={textElement.strokeColor}
              onChange={(e) => onUpdate({ strokeColor: e.target.value })}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X Position: {Math.round(textElement.x)}
          </label>
          <input
            type="range"
            min={0}
            max={500}
            value={textElement.x}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Y Position: {Math.round(textElement.y)}
          </label>
          <input
            type="range"
            min={0}
            max={500}
            value={textElement.y}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TextControls;
