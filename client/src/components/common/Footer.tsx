'use client';

import React from 'react';
import { FaFacebookF, FaTwitter, FaYoutube, FaGoogle } from 'react-icons/fa';

const Footer = () => {
  const icons = [
    { Icon: FaFacebookF, link: '#' },
    { Icon: FaTwitter, link: '#' },
    { Icon: FaYoutube, link: '#' },
    { Icon: FaGoogle, link: '#' },
  ];

  return (
    <footer className="bg-[#0b0b0b] text-gray-300 py-12 px-6 md:px-10 border-t-4 border-red-600 shadow-xl font-sans relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 text-center lg:text-left">
          {/* Brand Section */}
          <div className="lg:mb-0 mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-wider">
              Campus<span className="text-red-600">Connect</span>
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-[250px] mx-auto lg:mx-0">
              The ultimate university transportation solution.
            </p>
            <div className="flex justify-center lg:justify-start items-center space-x-4">
              {icons.map(({ Icon, link }, index) => (
                <a
                  key={index}
                  href={link}
                  className="p-3 border border-gray-700 rounded-full hover:bg-red-600 hover:border-red-600 transition duration-300 text-gray-400 hover:text-white"
                  aria-label="social-link"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-lg font-bold text-white mb-4 relative after:block after:w-1/3 after:h-0.5 after:bg-red-600 after:mt-1 after:mx-auto lg:after:mx-0">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-red-500">
                  Bus Schedules
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Track the Bus
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Live Bus Updates
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Download App
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 relative after:block after:w-1/3 after:h-0.5 after:bg-red-600 after:mt-1 after:mx-auto lg:after:mx-0">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-red-500">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Report an Issue
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Affiliates
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 relative after:block after:w-1/3 after:h-0.5 after:bg-red-600 after:mt-1 after:mx-auto lg:after:mx-0">
              Legal
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-red-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-6">
          <p className="text-sm text-gray-500 text-center font-medium">
            &copy; {new Date().getFullYear()}{' '}
            <span className="text-red-500 font-semibold">UBTS</span> | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
