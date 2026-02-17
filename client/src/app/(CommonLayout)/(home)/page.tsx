'use client';

import React from 'react';
import IntroAnimation from '@/components/IntroAnimation';
import HomePageComponent from '@/modules/home';
import { useIntro } from '@/context/IntroContext';

const Home = () => {
  const { isIntroActive } = useIntro();

  if (isIntroActive) {
    return <IntroAnimation />;
  }

  return <HomePageComponent />;
};

export default Home;
