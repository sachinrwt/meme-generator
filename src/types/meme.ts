export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  isVideo?: boolean;
  videoUrl?: string;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
}

export interface RectangleElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  borderRadius: number;
}

export interface MemeConfig {
  template: MemeTemplate | null;
  textElements: TextElement[];
  rectangleElements: RectangleElement[];
  customImage?: string;
}
