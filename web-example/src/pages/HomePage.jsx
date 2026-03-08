import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialLoading } = useAuth();

  useEffect(() => {
    if (!initialLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, initialLoading, navigate]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center bg-background min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>FinanceApp - Manage Your Wealth</title>
        <meta name="description" content="Professional financial management platform" />
      </Helmet>
      <Header />
      <div className="flex justify-center items-center bg-background min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-foreground text-4xl">Welcome to FinanceApp</h1>
          <p className="text-secondary">Redirecting...</p>
        </div>
      </div>
    </>
  );
};

export default HomePage;