import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useState } from 'react';
import { MemeTemplate, TextElement, RectangleElement } from '../types/meme';
import { Play, Pause } from 'lucide-react';

interface MemeCanvasProps {
  template: MemeTemplate;
  textElements: TextElement[];
  rectangleElements: RectangleElement[];
  selectedTextId: string | null;
  selectedRectangleId: string | null;
  onTextSelect: (id: string) => void;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;
  onRectangleSelect: (id: string) => void;
  onRectangleUpdate: (id: string, updates: Partial<RectangleElement>) => void;
}

const MemeCanvas = forwardRef<HTMLCanvasElement, MemeCanvasProps>(({
  template,
  textElements,
  rectangleElements,
  selectedTextId,
  selectedRectangleId,
  onTextSelect,
  onTextUpdate,
  onRectangleSelect,
  onRectangleUpdate,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  useImperativeHandle(ref, () => canvasRef.current!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    if (template.isVideo && template.videoUrl) {
      // Handle video template
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      
      video.onloadeddata = () => {
        console.log('Video loaded successfully:', template.videoUrl);
        videoRef.current = video;
        setIsVideoPlaying(true);
        drawCanvas();
        
        // Set up video frame updates
        const updateVideoFrame = () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            drawCanvas();
          }
          animationFrameId = requestAnimationFrame(updateVideoFrame);
        };
        updateVideoFrame();
      };
      
      video.onerror = (error) => {
        console.error('Failed to load video:', template.videoUrl, error);
        loadPlaceholder();
      };
      
      video.oncanplay = () => {
        console.log('Video can play:', template.videoUrl);
        video.play().catch(e => console.error('Video play failed:', e));
      };
      
      video.onpause = () => {
        setIsVideoPlaying(false);
      };
      
      video.onplay = () => {
        setIsVideoPlaying(true);
      };
      
      console.log('Loading video:', template.videoUrl);
      video.src = template.videoUrl;
    } else {
      // Handle image template
      const loadImage = (url: string, isRetry = false) => {
        const img = new Image();
        
        img.onload = () => {
          console.log('Image loaded successfully:', url);
          imageRef.current = img;
          drawCanvas();
        };
        
        img.onerror = (error) => {
          console.error('Failed to load image:', url, error);
          
          if (!isRetry) {
            // Try loading with different approach for Reddit images
            if (url.includes('i.redd.it') || url.includes('imgur.com')) {
              console.log('Retrying with different approach for:', url);
              // Try without any CORS restrictions
              const retryImg = new Image();
              retryImg.onload = () => {
                console.log('Retry successful:', url);
                imageRef.current = retryImg;
                drawCanvas();
              };
              retryImg.onerror = () => {
                console.error('Retry also failed, using placeholder');
                loadPlaceholder();
              };
              retryImg.src = url;
              return;
            }
          }
          
          // Load placeholder as final fallback
          loadPlaceholder();
        };
        
        console.log('Loading image:', url);
        img.src = url;
      };
      
      loadImage(template.url);
    }
    
    const loadPlaceholder = () => {
      const placeholderImg = new Image();
      placeholderImg.onload = () => {
        imageRef.current = placeholderImg;
        drawCanvas();
      };
      placeholderImg.onerror = () => {
        console.error('Even placeholder failed to load');
        // Create a simple colored rectangle as final fallback
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = template.width;
        fallbackCanvas.height = template.height;
        const fallbackCtx = fallbackCanvas.getContext('2d');
        if (fallbackCtx) {
          fallbackCtx.fillStyle = '#f0f0f0';
          fallbackCtx.fillRect(0, 0, template.width, template.height);
          fallbackCtx.fillStyle = '#666';
          fallbackCtx.font = '20px Arial';
          fallbackCtx.textAlign = 'center';
          fallbackCtx.fillText('Image not available', template.width / 2, template.height / 2);
        }
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          imageRef.current = fallbackImg;
          drawCanvas();
        };
        fallbackImg.src = fallbackCanvas.toDataURL();
      };
      placeholderImg.src = '/placeholder.svg';
    };

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current = null;
      }
    };
  }, [template]);

  useEffect(() => {
    drawCanvas();
  }, [textElements, rectangleElements, selectedTextId, selectedRectangleId]);

  const renderTextOnVideo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;

    if (!canvas || !ctx || !video || !template.isVideo) return;

    // Ensure video is ready
    if (video.readyState < 2) return;

    console.log('Rendering elements on video, text count:', textElements.length, 'rectangle count:', rectangleElements.length);
    
    // Draw rectangle elements first (background layer)
    rectangleElements.forEach((rectEl, index) => {
      console.log(`Rendering rectangle element ${index}:`, 'at position:', rectEl.x, rectEl.y);
      drawRectangle(ctx, rectEl, rectEl.id === selectedRectangleId);
    });

    // Draw text elements on top (foreground layer)
    textElements.forEach((textEl, index) => {
      console.log(`Rendering text element ${index}:`, textEl.text, 'at position:', textEl.x, textEl.y);
      drawText(ctx, textEl, textEl.id === selectedTextId);
    });
  }, [textElements, rectangleElements, selectedTextId, selectedRectangleId, template.isVideo]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    const video = videoRef.current;

    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw template (image or video frame)
    if (template.isVideo && video && video.readyState >= 2) {
      try {
        // Draw current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log('Video frame drawn, text elements count:', textElements.length);
        
        // Render rectangles first (background layer)
        rectangleElements.forEach((rectEl, index) => {
          console.log(`Drawing rectangle element ${index} on video:`, 'at position:', rectEl.x, rectEl.y);
          drawRectangle(ctx, rectEl, rectEl.id === selectedRectangleId);
        });

        // Render text elements on top (foreground layer)
        textElements.forEach((textEl, index) => {
          console.log(`Drawing text element ${index} on video:`, textEl.text, 'at position:', textEl.x, textEl.y);
          drawText(ctx, textEl, textEl.id === selectedTextId);
        });
        
      } catch (error) {
        console.error('Error drawing video frame:', error);
        // Fallback to placeholder if video drawing fails
        if (img) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        // Draw rectangles first, then text elements even on fallback
        rectangleElements.forEach((rectEl, index) => {
          console.log(`Drawing rectangle element ${index} on fallback`);
          drawRectangle(ctx, rectEl, rectEl.id === selectedRectangleId);
        });
        textElements.forEach((textEl, index) => {
          console.log(`Drawing text element ${index} on fallback:`, textEl.text);
          drawText(ctx, textEl, textEl.id === selectedTextId);
        });
      }
    } else if (img) {
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw rectangle elements first (background layer)
      rectangleElements.forEach((rectEl, index) => {
        console.log(`Drawing rectangle element ${index} on image:`, 'at position:', rectEl.x, rectEl.y);
        drawRectangle(ctx, rectEl, rectEl.id === selectedRectangleId);
      });

      // Draw text elements on top (foreground layer)
      textElements.forEach((textEl, index) => {
        console.log(`Drawing text element ${index} on image:`, textEl.text, 'at position:', textEl.x, textEl.y);
        drawText(ctx, textEl, textEl.id === selectedTextId);
      });
    }
  }, [textElements, rectangleElements, selectedTextId, selectedRectangleId, template.isVideo, renderTextOnVideo]);

  const drawText = (ctx: CanvasRenderingContext2D, textEl: TextElement, isSelected: boolean) => {
    ctx.font = `${textEl.fontWeight} ${textEl.fontSize}px ${textEl.fontFamily}`;
    ctx.textAlign = textEl.textAlign as 'left' | 'center' | 'right';
    ctx.textBaseline = 'middle';

    // Draw stroke if enabled
    if (textEl.stroke) {
      ctx.strokeStyle = textEl.strokeColor;
      ctx.lineWidth = textEl.strokeWidth;
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

  const getRectangleAtPosition = (x: number, y: number): RectangleElement | null => {
    // Check each rectangle element (in reverse order to prioritize top elements)
    for (let i = rectangleElements.length - 1; i >= 0; i--) {
      const rectEl = rectangleElements[i];
      
      const left = rectEl.x;
      const right = rectEl.x + rectEl.width;
      const top = rectEl.y;
      const bottom = rectEl.y + rectEl.height;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return rectEl;
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
    const clickedRectangle = getRectangleAtPosition(x, y);
    
    if (clickedText) {
      onTextSelect(clickedText.id);
      onRectangleSelect(''); // Deselect rectangle
      isDraggingRef.current = true;
      dragOffsetRef.current = {
        x: x - clickedText.x,
        y: y - clickedText.y,
      };
    } else if (clickedRectangle) {
      onRectangleSelect(clickedRectangle.id);
      onTextSelect(''); // Deselect text
      isDraggingRef.current = true;
      dragOffsetRef.current = {
        x: x - clickedRectangle.x,
        y: y - clickedRectangle.y,
      };
    } else {
      // Clicked on empty space, deselect everything
      onTextSelect('');
      onRectangleSelect('');
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const newX = x - dragOffsetRef.current.x;
    const newY = y - dragOffsetRef.current.y;

    if (selectedTextId) {
      onTextUpdate(selectedTextId, { x: newX, y: newY });
    } else if (selectedRectangleId) {
      onRectangleUpdate(selectedRectangleId, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  const handleVideoMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (template.width / rect.width);
    const y = (event.clientY - rect.top) * (template.height / rect.height);

    const newX = x - dragOffsetRef.current.x;
    const newY = y - dragOffsetRef.current.y;

    if (selectedTextId) {
      onTextUpdate(selectedTextId, { x: newX, y: newY });
    } else if (selectedRectangleId) {
      onRectangleUpdate(selectedRectangleId, { x: newX, y: newY });
    }
  };

  const handleVideoMouseUp = () => {
    isDraggingRef.current = false;
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, rectEl: RectangleElement, isSelected: boolean) => {
    ctx.save();
    
    // Set opacity
    ctx.globalAlpha = rectEl.opacity;
    
    // Draw fill
    if (rectEl.fillColor !== 'transparent') {
      ctx.fillStyle = rectEl.fillColor;
      if (rectEl.borderRadius > 0) {
        // Draw rounded rectangle
        ctx.beginPath();
        ctx.roundRect(rectEl.x, rectEl.y, rectEl.width, rectEl.height, rectEl.borderRadius);
        ctx.fill();
      } else {
        // Draw regular rectangle
        ctx.fillRect(rectEl.x, rectEl.y, rectEl.width, rectEl.height);
      }
    }
    
    // Draw stroke
    if (rectEl.strokeWidth > 0) {
      ctx.strokeStyle = rectEl.strokeColor;
      ctx.lineWidth = rectEl.strokeWidth;
      if (rectEl.borderRadius > 0) {
        // Draw rounded rectangle stroke
        ctx.beginPath();
        ctx.roundRect(rectEl.x, rectEl.y, rectEl.width, rectEl.height, rectEl.borderRadius);
        ctx.stroke();
      } else {
        // Draw regular rectangle stroke
        ctx.strokeRect(rectEl.x, rectEl.y, rectEl.width, rectEl.height);
      }
    }
    
    // Draw selection indicator
    if (isSelected) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        rectEl.x - 5,
        rectEl.y - 5,
        rectEl.width + 10,
        rectEl.height + 10
      );
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  };

  return (
    <div className="relative">
      {template.isVideo && videoRef.current ? (
        // Video with text overlay
        <div 
          className="relative"
          onMouseMove={handleVideoMouseMove}
          onMouseUp={handleVideoMouseUp}
          onMouseLeave={handleVideoMouseUp}
        >
          <video
            ref={videoRef}
            src={template.videoUrl}
            className="w-full h-auto border-2 border-gray-300 rounded-lg"
            muted
            loop
            autoPlay
            playsInline
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
          {/* Text Overlays */}
          {textElements.map((textEl) => {
            return (
              <div
                key={textEl.id}
                className={`absolute cursor-move select-none ${
                  textEl.id === selectedTextId ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                style={{
                  left: `${(textEl.x / template.width) * 100}%`,
                  top: `${(textEl.y / template.height) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${textEl.fontSize}px`,
                  fontFamily: textEl.fontFamily,
                  fontWeight: textEl.fontWeight,
                  textAlign: textEl.textAlign as 'left' | 'center' | 'right',
                  lineHeight: '1',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTextSelect(textEl.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onTextSelect(textEl.id);
                  isDraggingRef.current = true;
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (rect) {
                    dragOffsetRef.current = {
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    };
                  }
                }}
              >
                {/* Stroke layers - multiple positioned elements for smooth outline */}
                {textEl.stroke && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      right: '0px',
                      bottom: '0px',
                      color: textEl.strokeColor,
                      WebkitTextStroke: `${textEl.strokeWidth * 2}px ${textEl.strokeColor}`,
                      zIndex: -1,
                    }}
                  >
                    {textEl.text}
                  </div>
                )}
                
                {/* Main text layer */}
                <div style={{ color: textEl.color, position: 'relative' }}>
                  {textEl.text}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Canvas for images
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
      )}
      
      {template.isVideo && videoRef.current && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Video Playing - Text Overlay Active
        </div>
      )}
      {template.isVideo && textElements.length > 0 && (
        <div className="absolute top-2 right-2 bg-green-500 bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {textElements.length} Text Element{textElements.length > 1 ? 's' : ''}
        </div>
      )}
      {template.isVideo && videoRef.current && (
        <button
          onClick={handleVideoPlayPause}
          className="absolute top-2 left-2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-full transition-all duration-200"
          title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
        >
          {isVideoPlaying ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
      )}
    </div>
  );
});

MemeCanvas.displayName = 'MemeCanvas';

export default MemeCanvas;
