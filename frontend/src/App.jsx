import { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import Dashboard from './components/Dashboard';

function App() {
  // Mặc định giao diện đầu tiên khi mở trang là trò chơi Rắn săn mồi
  const [currentView, setCurrentView] = useState('snake');

  return (
    <>
      {currentView === 'snake' ? (
        <SnakeGame onOpenDashboard={() => setCurrentView('dashboard')} />
      ) : (
        <Dashboard onBackToGame={() => setCurrentView('snake')} />
      )}
    </>
  );
}

export default App;
