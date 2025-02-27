import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import MyLibraryPage from './pages/MyLibraryPage';
import BookCatalogPage from './pages/BookCatalogPage';
import ForumPage from './pages/ForumPage';
import TradeDashboardPage from './pages/TradeDashboardPage';
import SearchTradesPage from './pages/SearchTradesPage';
import OfferTradePage from './pages/OfferTradePage';
import PendingTradesPage from './pages/PendingTradesPage';

function App() {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = (mode) => {
    setTheme(mode === 'dark' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Sidebar 
            theme={theme} 
            toggleTheme={toggleTheme}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
          <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<HomePage />} />
              
              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:id"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mylibrary"
                element={
                  <ProtectedRoute>
                    <MyLibraryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/catalog"
                element={
                  <ProtectedRoute>
                    <BookCatalogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forum"
                element={
                  <ProtectedRoute>
                    <ForumPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trades"
                element={
                  <ProtectedRoute>
                    <TradeDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trades/search"
                element={
                  <ProtectedRoute>
                    <SearchTradesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trades/offer"
                element={
                  <ProtectedRoute>
                    <OfferTradePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trades/pending"
                element={
                  <ProtectedRoute>
                    <PendingTradesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;