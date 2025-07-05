declare module 'react-wordcloud' {
  import { ComponentType } from 'react';

  interface WordData {
    text: string;
    value: number;
  }

  interface Options {
    colors?: string[];
    enableTooltip?: boolean;
    deterministic?: boolean;
    fontFamily?: string;
    fontSizes?: [number, number];
    fontStyle?: string;
    fontWeight?: string;
    padding?: number;
    rotations?: number;
    rotationAngles?: [number, number];
    scale?: 'sqrt' | 'log' | 'linear';
    spiral?: 'archimedean' | 'rectangular';
    transitionDuration?: number;
  }

  interface Callbacks {
    onWordClick?: (word: WordData) => void;
    onWordMouseOver?: (word: WordData) => void;
    onWordMouseOut?: (word: WordData) => void;
  }

  interface ReactWordcloudProps {
    words: WordData[];
    options?: Options;
    callbacks?: Callbacks;
  }

  const ReactWordcloud: ComponentType<ReactWordcloudProps>;
  export default ReactWordcloud;
}
