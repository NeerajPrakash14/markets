// App.js
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SilverStrategyApp from './SilverStrategyApp';
import theme from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SilverStrategyApp />
    </ThemeProvider>
  );
}
