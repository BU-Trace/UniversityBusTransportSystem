'use client';

import React from 'react';
import IntroAnimation from '@/components/IntroAnimation';
import HomePage from '../home/page';
import { useIntro } from '@/context/IntroContext';

const Home = () => {
  const { isIntroActive } = useIntro();

  if (isIntroActive) {
    return <IntroAnimation />;
  }

  return <HomePage />;
};

export default Home;
