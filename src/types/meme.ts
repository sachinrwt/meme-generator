
export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
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
}

export interface MemeConfig {
  template: MemeTemplate | null;
  textElements: TextElement[];
  customImage?: string;
}
