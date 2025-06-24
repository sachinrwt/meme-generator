import React from 'react';
import { RectangleElement } from '../types/meme';

interface RectangleControlsProps {
  rectangleElement: RectangleElement;
  onUpdate: (updates: Partial<RectangleElement>) => void;
  onDelete: () => void;
}

const RectangleControls: React.FC<RectangleControlsProps> = ({ rectangleElement, onUpdate, onDelete }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-600">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">Rectangle Settings</h3>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              X Position: {Math.round(rectangleElement.x)}
            </label>
            <input
              type="range"
              min={0}
              max={500}
              value={rectangleElement.x}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Y Position: {Math.round(rectangleElement.y)}
            </label>
            <input
              type="range"
              min={0}
              max={500}
              value={rectangleElement.y}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Width: {Math.round(rectangleElement.width)}px
            </label>
            <input
              type="range"
              min={10}
              max={300}
              value={rectangleElement.width}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Height: {Math.round(rectangleElement.height)}px
            </label>
            <input
              type="range"
              min={10}
              max={300}
              value={rectangleElement.height}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fill Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={rectangleElement.fillColor}
                onChange={(e) => onUpdate({ fillColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                title="Choose fill color"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {rectangleElement.fillColor.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={rectangleElement.strokeColor}
                onChange={(e) => onUpdate({ strokeColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                title="Choose border color"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {rectangleElement.strokeColor.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Width: {rectangleElement.strokeWidth}px
            </label>
            <input
              type="range"
              min={0}
              max={20}
              value={rectangleElement.strokeWidth}
              onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Opacity: {Math.round(rectangleElement.opacity * 100)}%
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={rectangleElement.opacity}
              onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Border Radius: {rectangleElement.borderRadius}px
            </label>
            <input
              type="range"
              min={0}
              max={50}
              value={rectangleElement.borderRadius}
              onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RectangleControls; 