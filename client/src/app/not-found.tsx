'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { FaHome, FaEnvelope, FaBus } from 'react-icons/fa';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Page not found"
        subtitle="We couldn't find the page you're looking for. Try one of the links below or reach out if you need help."
        imageSrc="/static/loginpagebanner.png"
        primaryText="Go home"
        primaryHref="/"
        secondaryText="Contact support"
        secondaryHref="/contact"
      />

      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-6xl font-extrabold text-gray-800">404</h2>
        <p className="mt-4 text-xl text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 bg-white rounded-lg p-4 shadow-md hover:shadow-lg border border-gray-100"
          >
            <FaHome className="text-red-600" />
            <div>
              <div className="font-medium">Home</div>
              <div className="text-sm text-gray-500">Return to homepage</div>
            </div>
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-3 bg-white rounded-lg p-4 shadow-md hover:shadow-lg border border-gray-100"
          >
            <FaEnvelope className="text-red-600" />
            <div>
              <div className="font-medium">Contact</div>
              <div className="text-sm text-gray-500">Get help from support</div>
            </div>
          </Link>

          <Link
            href="/routes"
            className="inline-flex items-center justify-center gap-3 bg-white rounded-lg p-4 shadow-md hover:shadow-lg border border-gray-100"
          >
            <FaBus className="text-red-600" />
            <div>
              <div className="font-medium">Routes</div>
              <div className="text-sm text-gray-500">View bus schedules</div>
            </div>
          </Link>
        </div>

        <div className="mt-10 text-sm text-gray-500">
          If you think this is an error, please{' '}
          <Link href="/contact" className="text-red-600 font-medium">
            contact support
          </Link>{' '}
          and include the URL that caused the issue.
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
