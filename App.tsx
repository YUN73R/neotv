import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import Navigation from './src/navigation/Navigation';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
};

export default App;
