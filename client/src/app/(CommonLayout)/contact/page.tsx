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
import PageBanner from '@/components/common/PageBanner';
import Image from 'next/image';

function FAQ() {
  const items = [
    {
      q: 'How do I track the bus in real time?',
      a: "Open the BU Trace app or the 'View Bus Routes' page and tap a running bus — the map will show its live location.",
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
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="rounded-xl border border-white/10 overflow-hidden shadow-sm hover:shadow-md bg-white/5 backdrop-blur-lg"
        >
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="text-gray-200 font-medium">{it.q}</span>
            <span
              className={`inline-block transition-transform duration-200 ${
                open === idx ? 'rotate-180' : 'rotate-0'
              } text-brick-400`}
            >
              <FaChevronDown />
            </span>
          </button>
          {open === idx && (
            <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5">
              {it.a}
            </div>
          )}
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
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Message sent successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-brick-900 font-sans">
      <PageBanner
        title="Contact Support"
        subtitle="Have questions? Reach out to our team — we’re here to help!"
        imageSrc="/static/loginpagebanner.png"
      />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white/5 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/10"
          >
            {!submitted ? (
              <>
                <h2 className="text-3xl font-black text-white mb-2">Send a Message</h2>
                <p className="text-gray-400 mb-8 max-w-lg">
                  Have a question about routes, schedules or the mobile app? Drop us a message and
                  our BU Trace team will respond within 24 hours.
                </p>

                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="block">
                      <span className="text-xs font-bold uppercase text-gray-400 mb-1 block">
                        Full Name
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brick-500">
                          <FaUser />
                        </span>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="John Doe"
                          className="w-full pl-10 h-12 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-brick-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold uppercase text-gray-400 mb-1 block">
                        Email Address
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brick-500">
                          <FaEnvelope />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@university.edu"
                          className="w-full pl-10 h-12 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-brick-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold uppercase text-gray-400 mb-1 block">
                      Message
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-4 text-brick-500">
                        <FaBus />
                      </span>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        placeholder="How can we help you today?"
                        rows={6}
                        className="w-full pl-10 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-brick-500 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="text-xs font-medium text-gray-400 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                      <span className="text-green-400">
                        <FaClock />
                      </span>{' '}
                      Average response: 24h
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-brick-600 text-white px-8 h-12 rounded-xl font-bold shadow-lg hover:bg-brick-700 hover:shadow-brick-200 transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>SendMessage</span>
                      <FaEnvelope className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-4"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <FaBus size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                  Thanks for reaching out,{' '}
                  <span className="font-bold text-white">{name.split(' ')[0]}</span>. We&apos;ll get
                  back to <span className="font-bold text-white">{email}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Contact Info Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <FaMapMarkerAlt />
                </div>
                Contact Information
              </h4>

              <div className="space-y-6">
                <div className="relative z-10">
                  <h5 className="text-xs font-bold uppercase text-white/70 mb-1">
                    Office Location
                  </h5>
                  <p className="text-white font-medium">University of Barishal Campus</p>
                  <p className="text-white/80 text-sm">Barishal, Bangladesh</p>
                </div>

                <div className="relative z-10">
                  <h5 className="text-xs font-bold uppercase text-white/70 mb-1">Phone & Email</h5>
                  <div className="space-y-3 mt-2">
                    <a
                      href="tel:01799532172"
                      className="flex items-center gap-3 text-white hover:text-white/90 transition-colors group p-2 hover:bg-white/10 rounded-lg -ml-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-white group-hover:text-white transition-colors">
                        <FaPhoneAlt size={14} />
                      </div>
                      <span className="font-bold">01799532172</span>
                    </a>
                    <a
                      href="mailto:mdimamhosen.cse@gmail.com"
                      className="flex items-center gap-3 text-white hover:text-white/90 transition-colors group p-2 hover:bg-white/10 rounded-lg -ml-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-white group-hover:text-white transition-colors">
                        <FaEnvelope size={14} />
                      </div>
                      <span className="font-medium truncate">mdimamhosen.cse@gmail.com</span>
                    </a>
                  </div>
                </div>

                <div className="relative z-10">
                  <h5 className="text-xs font-bold uppercase text-white/70 mb-1">Office Hours</h5>
                  <div className="text-sm font-medium text-white bg-white/10 p-3 rounded-xl border border-white/10">
                    <p className="flex justify-between mb-1">
                      <span>Sun - Thu</span> <span>9:00 AM - 5:00 PM</span>
                    </p>
                    <p className="flex justify-between text-white/60">
                      <span>Fri - Sat</span> <span>Closed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links & Social */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

              <h4 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2">
                <FaQuestionCircle className="opacity-80" /> Quick Links
              </h4>
              <div className="grid grid-cols-1 gap-3 relative z-10 text-brick-100 font-medium">
                <a
                  href="#routes"
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"
                >
                  <div className="w-1 h-1 bg-brick-300 rounded-full"></div> View Bus Routes
                </a>
                <a
                  href="#dashboard"
                  className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"
                >
                  <div className="w-1 h-1 bg-brick-300 rounded-full"></div> Driver Dashboard
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 relative z-10">
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-brick-600 flex items-center justify-center transition-all">
                    <FaFacebookF />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-brick-600 flex items-center justify-center transition-all">
                    <FaTwitter />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-brick-600 flex items-center justify-center transition-all">
                    <FaInstagram />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-black text-white mb-3">Frequently Asked Questions</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Can&apos;t find the answer you&apos;re looking for? Check out our documentation or
                contact our support team.
              </p>
              <div className="aspect-16/10 relative rounded-2xl shadow-md border border-white/10 overflow-hidden hidden lg:block opacity-80 transition-all duration-500">
                <Image
                  src="/image/suppport.png"
                  alt="Support illustration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <FAQ />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
