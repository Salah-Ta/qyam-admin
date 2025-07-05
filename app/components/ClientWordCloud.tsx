import React from 'react';
import FallbackWordCloud from './FallbackWordCloud';

interface WordData {
  text: string;
  value: number;
}

interface ClientWordCloudProps {
  words: WordData[];
  width?: number;
  height?: number;
}

const colors = ['#143059', '#2F6B9A', '#82a6c2', '#17b169', '#4CAF50', '#8BC34A', '#CDDC39'];

const ClientWordCloud: React.FC<ClientWordCloudProps> = ({ 
  words, 
  width = 800, 
  height = 400 
}) => {
  const [isClient, setIsClient] = React.useState(false);
  const [ReactWordcloud, setReactWordcloud] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    
    const loadWordcloud = async () => {
      try {
        if (typeof window !== 'undefined') {
          const module = await import('react-wordcloud');
          setReactWordcloud(() => module.default);
        }
      } catch (err) {
        console.error('Failed to load react-wordcloud, using fallback:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadWordcloud();
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-pulse">
          <div className="w-32 h-8 bg-gray-200 rounded mb-4"></div>
          <div className="w-24 h-6 bg-gray-200 rounded mb-2"></div>
          <div className="w-28 h-7 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-500 text-xl">جاري تحميل سحابة المهارات...</p>
      </div>
    );
  }

  // Use fallback if react-wordcloud failed to load or if there's an error
  if (error || !ReactWordcloud) {
    return <FallbackWordCloud words={words} width={width} height={height} />;
  }

  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-500 text-xl">لا توجد مهارات متاحة</p>
      </div>
    );
  }

  const options = {
    colors: colors,
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'Arial, sans-serif',
    fontSizes: [18, 65] as [number, number],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 3,
    rotations: 3,
    rotationAngles: [-45, 45] as [number, number],
    scale: 'sqrt' as const,
    spiral: 'archimedean' as const,
    transitionDuration: 1000,
  };

  const callbacks = {
    onWordClick: (word: WordData) => {
      console.log('Word clicked:', word);
    },
    onWordMouseOver: (word: WordData) => {
      console.log('Word hovered:', word);
    },
  };

  try {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <div style={{ width, height }}>
          <ReactWordcloud
            words={words}
            options={options}
            callbacks={callbacks}
          />
        </div>
      </div>
    );
  } catch (renderError) {
    console.error('Error rendering react-wordcloud, using fallback:', renderError);
    return <FallbackWordCloud words={words} width={width} height={height} />;
  }
};

export default ClientWordCloud;
