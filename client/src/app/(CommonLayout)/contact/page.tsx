'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FaBus,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaClock,
  FaQuestionCircle,
  FaChevronDown,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
} from 'react-icons/fa';
import Header from '@/components/Header';
import NextImage from '@/components/common/NextImage';

function FAQ() {
  const items = [
    {
      q: 'How do I track the bus in real time?',
      a: "Open the UBTS app or the 'View Bus Routes' page and tap a running bus — the map will show its live location.",
    },
    {
      q: 'What should I do if the app crashes?',
      a: 'Try updating to the latest version. If the issue persists, send us the error details and screenshots via this contact form.',
    },
    {
      q: 'How can I report lost items?',
      a: 'Email support@ubts.edu.bd with a description and the approximate time and route where the item was lost.',
    },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <motion.article
          key={idx}
          whileHover={{ scale: 1.03, rotate: 0.5 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md bg-white"
        >
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="text-gray-800 font-medium">{it.q}</span>
            <span
              className={`inline-block transition-transform duration-200 ${
                open === idx ? 'rotate-180' : 'rotate-0'
              } text-gray-500`}
            >
              <FaChevronDown />
            </span>
          </button>
          {open === idx && <div className="p-4 bg-red-50 text-gray-700">{it.a}</div>}
        </motion.article>
      ))}
    </div>
  );
}

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all fields before submitting.');
      return;
    }
    setSubmitted(true);
    toast.success('Message sent successfully!');
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0">
        <svg
          className="relative block w-full h-40 opacity-30 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M321.39 56.44C186.45 35.59 79.15 66.6 0 93.68V0h1200v27.35c-110.46 41.42-241.55 73.24-378.61 54.09C643.06 62.7 456.33 77.29 321.39 56.44z"
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1200" y2="0">
              <stop offset="0%" stopColor="#9b111e" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {}
      <Header
        title="Contact UBTS Support"
        subtitle="Have questions about bus schedules, routes or service updates? Reach out to our team — we’re here to help!"
        imageSrc="/static/loginpagebanner.png"
        primaryText="Send a Message"
        primaryHref="#contact-form"
        secondaryText="View Routes"
        secondaryHref="/routes"
      />

      {}
      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {}
          <motion.div
            id="contact-form"
            whileHover={{ rotate: 1, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 180 }}
            className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
          >
            {!submitted ? (
              <>
                <h2 className="text-3xl font-bold text-[#8B0000] mb-2">Send a Message</h2>
                <p className="text-gray-600 mb-6">
                  Have a question about routes, schedules or the mobile app? Drop us a message and
                  our UBTS team will respond within 24 hours.
                </p>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm text-gray-700 inline-flex items-center gap-2">
                        <span className="text-red-600"><FaUser /></span> Full name
                      </span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your full name"
                        className="mt-2 block w-full rounded-md border border-gray-200 px-4 py-2 text-gray-800 focus:ring-2 focus:ring-[#9b111e] focus:border-[#9b111e]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm text-gray-700 inline-flex items-center gap-2">
                        <span className="text-red-600"><FaEnvelope /></span> Email
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@university.edu"
                        className="mt-2 block w-full rounded-md border border-gray-200 px-4 py-2 text-gray-800 focus:ring-2 focus:ring-[#9b111e] focus:border-[#9b111e]"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm text-gray-700 inline-flex items-center gap-2">
                      <span className="text-red-600"><FaBus /></span> Message
                    </span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="How can we help?"
                      rows={6}
                      className="mt-2 block w-full rounded-md border border-gray-200 px-4 py-3 text-gray-800 focus:ring-2 focus:ring-[#9b111e] focus:border-[#9b111e] resize-none"
                    />
                  </label>

                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      <FaClock className="inline text-red-600 mr-1" /> Typical response within 24
                      hours
                    </div>
                    <motion.button
                      whileHover={{ rotate: [-1, 1, -1, 0], scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#9b111e] to-[#b91c1c] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg"
                    >
                      <FaEnvelope /> Send Message
                    </motion.button>
                  </div>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <h3 className="text-2xl font-semibold text-[#8B0000] flex items-center justify-center gap-2">
                  <FaBus /> Thank you, {name.split(' ')[0] || 'User'}!
                </h3>
                <p className="text-gray-600 mt-3">
                  We have received your message. Our team will reply to{' '}
                  <span className="font-medium">{email}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="mt-6 bg-gradient-to-r from-[#9b111e] to-[#b91c1c] text-white px-6 py-2 rounded-md hover:scale-105 transition-all font-medium"
                >
                  <FaEnvelope className="inline mr-2" /> Send Another
                </button>
              </motion.div>
            )}
          </motion.div>

          {}
          <motion.aside
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div
              whileHover={{ scale: 1.03, rotate: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-gradient-to-br from-[#fff1f1] to-white rounded-2xl p-6 shadow-lg border"
            >
              <h4 className="text-lg font-semibold text-[#8B0000] flex items-center gap-2">
                <FaMapMarkerAlt /> UBTS Office
              </h4>
              <p className="text-gray-700 mt-2">University of Barishal Campus</p>
              <div className="mt-4 grid gap-3">
                <a href="mailto:support@ubts.edu.bd" className="text-[#9b111e] hover:underline flex gap-2 items-center">
                  <FaEnvelope /> support@ubts.edu.bd
                </a>
                <a href="tel:+8801733570761" className="text-[#9b111e] hover:underline flex gap-2 items-center">
                  <FaPhoneAlt /> +880 1733 570 761
                </a>
                <a href="tel:+8801977987420" className="text-[#9b111e] hover:underline flex gap-2 items-center">
                  <FaPhoneAlt /> +880 1977 987 420
                </a>
                <a href="tel:+8801829494993" className="text-[#9b111e] hover:underline flex gap-2 items-center">
                  <FaPhoneAlt /> +880 1829 494 993
                </a>
              </div>
              <div className="mt-4 text-sm text-gray-700">
                <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                <p>Sat: 10:00 AM - 3:00 PM</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, rotate: -0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h4 className="text-lg font-semibold text-[#8B0000] flex items-center gap-2">
                <FaQuestionCircle /> Quick Links
              </h4>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <a href="#routes" className="text-gray-700 hover:text-red-600">View Bus Routes</a>
                <a href="#dashboard" className="text-gray-700 hover:text-red-600">Driver Dashboard</a>
                <a href="#help" className="text-gray-700 hover:text-red-600">Help Center</a>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button className="p-2 rounded-md bg-[#9b111e] text-white hover:rotate-6 transition-transform">
                  <FaFacebookF />
                </button>
                <button className="p-2 rounded-md bg-[#b91c1c] text-white hover:-rotate-6 transition-transform">
                  <FaTwitter />
                </button>
                <button className="p-2 rounded-md bg-gradient-to-r from-[#9b111e] to-[#b91c1c] text-white hover:scale-110 transition-transform">
                  <FaInstagram />
                </button>
              </div>
            </motion.div>
          </motion.aside>
        </section>

        {}
        <motion.div
          whileHover={{ rotate: 0.5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 150 }}
          className="bg-white mt-10 rounded-2xl p-6 shadow-md border w-full border-gray-100"
        >
          <h4 className="text-lg font-semibold text-[#8B0000]">Map</h4>
          <div className="mt-4 rounded-md overflow-hidden border border-gray-100">
            <NextImage
              image="/static/map-placeholder.png"
              alt="map placeholder"
              width={800}
              height={320}
            />
          </div>
        </motion.div>

        {}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-2 space-y-6"
          >
            <h3 className="text-2xl font-semibold text-[#8B0000]">Support Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Bus Schedules', 'View and download daily routes.'],
                ['Route Updates', 'Latest changes to stops and timings.'],
                ['App Issues', 'Troubleshooting for mobile app.'],
                ['Lost Items', 'Report and claim process.'],
              ].map(([title, desc], i) => (
                <motion.div
                  key={i}
                  whileHover={{ rotate: 0.8, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100"
                >
                  <a href="#" className="text-gray-800 font-medium hover:text-red-600">{title}</a>
                  <p className="text-sm text-gray-600 mt-1">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <h3 className="text-2xl font-semibold text-[#8B0000] mb-4">
              Frequently Asked Questions
            </h3>
            <FAQ />
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
