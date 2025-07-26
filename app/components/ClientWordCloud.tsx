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
  width = 400, 
  height = 300 
}) => {
  const [isClient, setIsClient] = React.useState(false);
  const [ReactWordcloud, setReactWordcloud] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(0);

  React.useEffect(() => {
    setIsClient(true);
    
    // Set initial window width
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      
      const loadWordcloud = async () => {
        try {
          const module = await import('react-wordcloud');
          setReactWordcloud(() => module.default);
        } catch (err) {
          console.error('Failed to load react-wordcloud, using fallback:', err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };

      loadWordcloud();
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } else {
      setLoading(false);
    }
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

  // Responsive font sizes and padding based on window width
  const isSmall = windowWidth > 0 && windowWidth < 640;
  const isMedium = windowWidth > 0 && windowWidth < 768;
  
  // Calculate responsive dimensions
  const responsiveWidth = windowWidth > 0 
    ? (isSmall ? 280 : isMedium ? 350 : Math.min(width, 450))
    : width;
  const responsiveHeight = windowWidth > 0 
    ? (isSmall ? 200 : isMedium ? 250 : Math.min(height, 350))
    : height;
  
  const options = {
    colors: colors,
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'Arial, sans-serif',
    fontSizes: [
      isSmall ? 8 : isMedium ? 10 : 12, 
      isSmall ? 20 : isMedium ? 25 : 30
    ] as [number, number],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: isSmall ? 1 : isMedium ? 2 : 3,
    rotations: 3,
    rotationAngles: [-45, 45] as [number, number],
    scale: 'sqrt' as const,
    spiral: 'archimedean' as const,
    transitionDuration: 1000,
    tooltipOptions: {
      style: {
        backgroundColor: '#333',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: isSmall ? '12px' : '14px',
        fontFamily: 'Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'right',
      }
    },
    getWordTooltip: (word: WordData) => `هذه المهارة ظهرت ${word.value} مرة`,
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
        <div 
          style={{ 
            width: responsiveWidth, 
            height: responsiveHeight,
            maxWidth: '100%'
          }}
          className="overflow-hidden"
        >
          <ReactWordcloud
            words={words}
            options={options}
            callbacks={callbacks}
            size={[responsiveWidth, responsiveHeight]}
          />
        </div>
      </div>
    );
  } catch (renderError) {
    console.error('Error rendering react-wordcloud, using fallback:', renderError);
    return <FallbackWordCloud words={words} width={responsiveWidth} height={responsiveHeight} />;
  }
};

export default ClientWordCloud;
