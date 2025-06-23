
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MemeTemplate, TextElement } from '../types/meme';

interface MemeCanvasProps {
  template: MemeTemplate;
  textElements: TextElement[];
  selectedTextId: string | null;
  onTextSelect: (id: string) => void;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
}

const MemeCanvas = forwardRef<HTMLCanvasElement, MemeCanvasProps>(({
  template,
  textElements,
  selectedTextId,
  onTextSelect,
  onTextUpdate,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => canvasRef.current!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and draw the template image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.src = template.url;
  }, [template]);

  useEffect(() => {
    drawCanvas();
  }, [textElements, selectedTextId]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw template image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw text elements
    textElements.forEach((textEl) => {
      drawText(ctx, textEl, textEl.id === selectedTextId);
    });
  };

  const drawText = (ctx: CanvasRenderingContext2D, textEl: TextElement, isSelected: boolean) => {
    ctx.font = `${textEl.fontWeight} ${textEl.fontSize}px ${textEl.fontFamily}`;
    ctx.textAlign = textEl.textAlign;
    ctx.textBaseline = 'middle';

    // Draw stroke if enabled
    if (textEl.stroke) {
      ctx.strokeStyle = textEl.strokeColor;
      ctx.lineWidth = 3;
      ctx.strokeText(textEl.text, textEl.x, textEl.y);
    }

    // Draw main text
    ctx.fillStyle = textEl.color;
    ctx.fillText(textEl.text, textEl.x, textEl.y);

    // Draw selection indicator
    if (isSelected) {
      const metrics = ctx.measureText(textEl.text);
      const width = metrics.width;
      const height = textEl.fontSize;
      
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        textEl.x - width / 2 - 10,
        textEl.y - height / 2 - 5,
        width + 20,
        height + 10
      );
      ctx.setLineDash([]);
    }
  };

  const getTextAtPosition = (x: number, y: number): TextElement | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Check each text element (in reverse order to prioritize top elements)
    for (let i = textElements.length - 1; i >= 0; i--) {
      const textEl = textElements[i];
      ctx.font = `${textEl.fontWeight} ${textEl.fontSize}px ${textEl.fontFamily}`;
      const metrics = ctx.measureText(textEl.text);
      const width = metrics.width;
      const height = textEl.fontSize;

      const left = textEl.x - width / 2;
      const right = textEl.x + width / 2;
      const top = textEl.y - height / 2;
      const bottom = textEl.y + height / 2;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return textEl;
      }
    }

    return null;
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const clickedText = getTextAtPosition(x, y);
    
    if (clickedText) {
      onTextSelect(clickedText.id);
      isDraggingRef.current = true;
      dragOffsetRef.current = {
        x: x - clickedText.x,
        y: y - clickedText.y,
      };
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !selectedTextId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const newX = x - dragOffsetRef.current.x;
    const newY = y - dragOffsetRef.current.y;

    onTextUpdate(selectedTextId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={template.width}
      height={template.height}
      style={{
        maxWidth: '100%',
        height: 'auto',
        border: '2px solid #ddd',
        borderRadius: '8px',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
});

MemeCanvas.displayName = 'MemeCanvas';

export default MemeCanvas;
