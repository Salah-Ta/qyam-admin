import React from 'react';

interface WordData {
  text: string;
  value: number;
}

interface WordCloudProps {
  words: WordData[];
  width?: number;
  height?: number;
}

const colors = ['#143059', '#2F6B9A', '#82a6c2', '#17b169', '#4CAF50', '#8BC34A', '#CDDC39'];

const WordCloud: React.FC<WordCloudProps> = ({ 
  words, 
  width = 800, 
  height = 400 
}) => {
  const [ReactWordcloud, setReactWordcloud] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadWordcloud = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const module = await import('react-wordcloud');
        setReactWordcloud(() => module.default);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load react-wordcloud:', err);
        setError('Failed to load word cloud component');
        setLoading(false);
      }
    };

    loadWordcloud();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-500 text-xl">جاري تحميل سحابة المهارات...</p>
      </div>
    );
  }

  if (error || !ReactWordcloud) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-red-500 text-xl">خطأ في تحميل سحابة المهارات</p>
      </div>
    );
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
};

export default WordCloud;
