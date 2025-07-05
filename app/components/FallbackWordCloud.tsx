import React from 'react';

interface WordData {
  text: string;
  value: number;
}

interface FallbackWordCloudProps {
  words: WordData[];
  width?: number;
  height?: number;
}

const colors = ['#143059', '#2F6B9A', '#82a6c2', '#17b169', '#4CAF50', '#8BC34A', '#CDDC39'];

const FallbackWordCloud: React.FC<FallbackWordCloudProps> = ({ 
  words, 
  width = 800, 
  height = 400 
}) => {
  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-500 text-xl">لا توجد مهارات متاحة</p>
      </div>
    );
  }

  // Sort words by value (descending)
  const sortedWords = [...words].sort((a, b) => b.value - a.value);
  
  // Calculate font sizes based on values
  const maxValue = Math.max(...words.map(w => w.value));
  const minValue = Math.min(...words.map(w => w.value));
  
  const getWordStyle = (word: WordData, index: number) => {
    const scale = maxValue === minValue ? 1 : (word.value - minValue) / (maxValue - minValue);
    const fontSize = 16 + (40 - 16) * scale;
    const fontWeight = scale > 0.7 ? 700 : scale > 0.4 ? 600 : 400;
    const color = colors[index % colors.length];
    
    return {
      fontSize: `${fontSize}px`,
      fontWeight,
      color,
      margin: '5px 10px',
      display: 'inline-block',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    };
  };

  return (
    <div 
      className="flex items-center justify-center w-full h-full p-8"
      style={{ width, height }}
    >
      <div 
        className="text-center leading-relaxed"
        style={{
          maxWidth: '100%',
          overflow: 'hidden',
          lineHeight: 1.6,
        }}
      >
        {sortedWords.map((word, index) => (
          <span
            key={`${word.text}-${index}`}
            style={getWordStyle(word, index)}
            className="hover:opacity-80 transition-opacity"
            onClick={() => console.log('Word clicked:', word)}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FallbackWordCloud;
