import type { CSSProperties, ReactElement } from 'react';

export interface ASCIITextProps {
  text?: string;
  asciiFontSize?: number;
  charset?: string;
  fontFamily?: string;
  fontWeight?: number;
  textColor?: string;
  colors?: string[];
  textScale?: number;
  blocks?: number;
  waves?: number;
  waveSpeed?: number;
  chroma?: number;
  tilt?: number;
  hueShift?: number;
  scramble?: number;
  clickRipple?: boolean;
  intro?: boolean;
  idle?: boolean;
  interactive?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
  style?: CSSProperties;
}

export default function ASCIIText(props: ASCIITextProps): ReactElement;
