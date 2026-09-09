import React, { createContext, useContext, useState, useEffect } from 'react';

export type TextSize = 'small' | 'normal' | 'large';

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  increaseSize: () => void;
  decreaseSize: () => void;
  resetSize: () => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const TextSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    return (localStorage.getItem('lawbot_text_size') as TextSize) || 'normal';
  });

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem('lawbot_text_size', size);
  };

  const increaseSize = () => {
    if (textSize === 'small') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('large');
  };

  const decreaseSize = () => {
    if (textSize === 'large') setTextSize('normal');
    else if (textSize === 'normal') setTextSize('small');
  };

  const resetSize = () => {
    setTextSize('normal');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-small', 'text-size-normal', 'text-size-large');
    root.classList.add(`text-size-${textSize}`);
  }, [textSize]);

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize, increaseSize, decreaseSize, resetSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};
