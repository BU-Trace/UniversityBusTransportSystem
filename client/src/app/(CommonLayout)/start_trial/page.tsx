'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { FaCheckCircle, FaStar, FaCrown, FaGem, FaBolt } from 'react-icons/fa';

const plans = [
  {
    title: 'Free Trial (7 Days)',
    price: '0 Taka',
    icon: <FaBolt className="text-red-600 text-2xl" />,
    highlight: false,
    features: [
      'Full access to all premium tracking features',
      'Unlimited route viewing',
      'Live bus tracking (every 10 seconds)',
      'Push notifications for bus arrival',
      'Access to historical routes and logs',
    ],
  },
  {
    title: 'Pro (1 Month)',
    price: '100 Taka',
    icon: <FaStar className="text-yellow-500 text-2xl" />,
    highlight: true,
    features: [
      'Live tracking with 5-second refresh rate',
      'Access to driver performance reports',
      'Route heatmap analytics',
      'Instant alert notifications',
      'Support priority: Medium',
    ],
  },
  {
    title: 'Ultimate (1 Year)',
    price: '1000 Taka',
    icon: <FaCrown className="text-yellow-600 text-2xl" />,
    highlight: true,
    features: [
      'Unlimited live tracking features',
      'Priority route optimization',
      'View all historical data (1 year)',
      'Dedicated support assistant',
      'Priority: High',
    ],
  },
  {
    title: 'Lifetime (One Payment)',
    price: '5000 Taka',
    icon: <FaGem className="text-purple-600 text-2xl" />,
    highlight: true,
    features: [
      'Lifetime unlimited access',
      'All future updates free',
      'Admin dashboard unlock',
      'Advanced analytics suite',
      'VIP priority support',
    ],
  },
];

const StartTrialPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0">
        <svg
          className="relative block w-full h-40 opacity-30 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M321.39 56.44C186.45 35.59 79.15 66.6 0 93.68V0h1200v27.35c-110.46 41.42-241.55 73.24-378.61 54.09C643.06 62.7 456.33 77.29 321.39 56.44z"
            fill="url(#grad)"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1200" y2="0">
              <stop offset="0%" stopColor="#9b111e" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <Header
        title="Start Your BU Trace Subscription"
        subtitle="Choose the perfect plan for your needs — from a free trial to lifetime premium access."
        imageSrc="/static/loginpagebanner.png"
        primaryText="Start Free Trial"
        primaryHref="#trial-plans"
        secondaryText="Compare Features"
        secondaryHref="#features"
      />

      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Pricing Plans Section */}
        <section id="trial-plans" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`p-6 rounded-2xl border shadow-lg bg-white relative ${
                plan.highlight ? 'border-red-200 shadow-red-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{plan.title}</h3>
                {plan.icon}
              </div>

              <p className="text-3xl font-bold text-red-600 mt-4">{plan.price}</p>

              <ul className="mt-6 space-y-2">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                    <FaCheckCircle className="text-green-600" /> {f}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(plan.title)}
                className="mt-6 w-full bg-linear-to-r from-brick-600 to-[#b91c1c] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                {plan.title === 'Free Trial (7 Days)' ? 'Start Free Trial' : 'Choose Plan'}
              </motion.button>

              {selected === plan.title && (
                <p className="text-center text-green-600 text-sm mt-3 font-medium">
                  ✔ {plan.title} selected!
                </p>
              )}
            </motion.div>
          ))}
        </section>

        {/* Feature Comparison */}
        <section id="features" className="mt-20">
          <h2 className="text-3xl font-bold text-[#8B0000] mb-6">What You Get</h2>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-white rounded-2xl border shadow-md"
          >
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <li className="p-4 bg-gray-50 rounded-lg border text-gray-700">
                ✔ Live bus tracking with smart analytics
              </li>
              <li className="p-4 bg-gray-50 rounded-lg border text-gray-700">
                ✔ Arrival notifications & timing accuracy analysis
              </li>
              <li className="p-4 bg-gray-50 rounded-lg border text-gray-700">
                ✔ Route optimization suggestions
              </li>
              <li className="p-4 bg-gray-50 rounded-lg border text-gray-700">
                ✔ Driver activity logs & performance metrics
              </li>
              <li className="p-4 bg-gray-50 rounded-lg border text-gray-700">
                ✔ Historical travel records & route playback
              </li>
              <li className="p-4 bg-gray-50 rounded-lg border text-gray-700">
                ✔ Priority customer support (Pro/Ultimate/Lifetime)
              </li>
            </ul>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default StartTrialPage;
