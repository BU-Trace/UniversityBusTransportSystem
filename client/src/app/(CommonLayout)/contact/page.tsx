'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
   <div className="space-y-4 w-full max-w-4xl mx-auto">
      {items.map((it, idx) => (
        <motion.article
          key={idx}
          // Scale effect is subtle on desktop, disabled or minimized on touch devices to prevent "sticky" feel
          whileHover={{ scale: 1.01 }}
          className="rounded-xl border border-white/10 overflow-hidden shadow-sm bg-white/5 backdrop-blur-lg transition-all duration-300"
        >
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            // Larger padding on mobile (p-5) for easier tapping (Fitts's Law)
            className="w-full flex items-start sm:items-center justify-between p-5 md:p-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-brick-400"
            aria-expanded={open === idx}
          >
            <span className="text-gray-200 font-medium text-sm sm:text-base md:text-lg pr-4">
              {it.q}
            </span>
            <span
              className={`mt-1 sm:mt-0 shrink-0 transition-transform duration-300 ${
                open === idx ? 'rotate-180' : 'rotate-0'
              } text-brick-400`}
            >
              <FaChevronDown className="text-sm md:text-base" />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {open === idx && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="px-5 pb-5 md:px-6 md:pb-6 text-gray-400 text-sm md:text-base leading-relaxed border-t border-white/5">
                  <div className="pt-4">
                    {it.a}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

      <main className="w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* Contact Form */}
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="
    w-full
    lg:col-span-7
    xl:col-span-8
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    shadow-2xl
    rounded-2xl xl:rounded-3xl
    p-6 sm:p-8 lg:p-10 xl:p-14
    relative
  "
>
  {!submitted ? (
    <>
      {/* Header */}
  <div className="flex flex-col items-center text-center mb-10">

  <h2 className="
    text-2xl
    sm:text-3xl
    lg:text-4xl
    xl:text-5xl
    font-black
    text-white
    mb-4
  ">
    Send a Message
  </h2>

  <p className="
    text-gray-400
    text-sm
    sm:text-base
    lg:text-lg
    xl:text-xl
    max-w-2xl
    mx-auto
    leading-relaxed
  ">
    Have a question about routes, schedules or the mobile app?
    Drop us a message and our BU Trace team will respond within 24 hours.
  </p>

</div>

      {/* Form */}
   <form
  onSubmit={onSubmit}
  className="
    w-full
    max-w-3xl
    2xl:max-w-4xl
    mx-auto
    space-y-6
    lg:space-y-8
  "
>

  {/* Name */}
  <div className="flex flex-col">
    <label className="text-xs font-bold uppercase text-gray-400 mb-2">
      Full Name
    </label>

    <div className="relative w-full">
      {!name && (
        <div className="
          absolute left-0 top-0 h-full w-14
          flex items-center justify-center
          pointer-events-none
        ">
          <FaUser className="text-brick-500 text-lg" />
        </div>
      )}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="         John Doe"
        className="
          w-full
          h-12 lg:h-14
          pl-14
          pr-4
          rounded-xl
          bg-white/5
          border border-white/10
          text-white
          placeholder-gray-500
          focus:ring-2 focus:ring-brick-500
          focus:border-transparent
          outline-none
          transition-all
        "
      />
    </div>
  </div>

  {/* Email */}
  <div className="flex flex-col">
    <label className="text-xs font-bold uppercase text-gray-400 mb-2">
      Email Address
    </label>

    <div className="relative w-full">
      {!email && (
        <div className="
          absolute left-0 top-0 h-full w-14
          flex items-center justify-center
          pointer-events-none
        ">
          <FaEnvelope className="text-brick-500 text-lg" />
        </div>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="         you@university.edu"
        className="
          w-full
          h-12 lg:h-14
          pl-14
          pr-4
          rounded-xl
          bg-white/5
          border border-white/10
          text-white
          placeholder-gray-500
          focus:ring-2 focus:ring-brick-500
          focus:border-transparent
          outline-none
          transition-all
        "
      />
    </div>
  </div>

  {/* Message */}
  <div className="flex flex-col">
    <label className="text-xs font-bold uppercase text-gray-400 mb-2">
      Message
    </label>

    <div className="relative w-full">
      {!message && (
        <div className="
          absolute left-0 top-0 h-14 w-14
          flex items-center justify-center
          pointer-events-none
        ">
          <FaBus className="text-brick-500 text-lg" />
        </div>
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={6}
        placeholder="         How can we help you today?"
        className="
          w-full
          pl-14
          pr-4
          py-3 lg:py-4
          rounded-xl
          bg-white/5
          border border-white/10
          text-white
          placeholder-gray-500
          focus:ring-2 focus:ring-brick-500
          focus:border-transparent
          outline-none
          transition-all
          resize-none
        "
      />
    </div>
  </div>

  {/* Bottom Section */}
  <div className="
    flex
    flex-col
    sm:flex-row
    sm:items-center
    sm:justify-between
    gap-5
    pt-4
  ">

    <div className="
      text-xs sm:text-sm
      font-medium
      text-gray-400
      flex items-center gap-2
      bg-white/5
      border border-white/10
      px-4 py-2
      rounded-full
      w-fit
    ">
      <FaClock className="text-green-400" />
      Average response: 24h
    </div>

    <button
      type="submit"
      className="
        w-full sm:w-auto
        min-w-[220px]
        h-12 lg:h-14
        px-8
        bg-brick-600
        hover:bg-brick-700
        text-white
        rounded-xl
        font-bold
        shadow-lg
        transition-all
        flex items-center justify-center gap-2
        group
      "
    >
      <span>Send Message</span>
      <FaEnvelope className="group-hover:translate-x-1 transition-transform" />
    </button>

  </div>

</form>



    </>
  ) : (
  <motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.4 }}
  className="
    w-full
    max-w-2xl
    2xl:max-w-3xl
    mx-auto
    flex
    flex-col
    items-center
    justify-center
    text-center
    py-12
    sm:py-16
    lg:py-24
    px-4
  "
>
  {/* Icon */}
  <div className="
    w-16 h-16
    sm:w-20 sm:h-20
    lg:w-24 lg:h-24
    bg-green-100
    rounded-full
    flex
    items-center
    justify-center
    mb-6
    text-green-600
    shadow-md
  ">
    <FaBus className="text-2xl lg:text-3xl" />
  </div>

  {/* Title */}
  <h3 className="
    text-xl
    sm:text-2xl
    lg:text-3xl
    xl:text-4xl
    font-black
    text-white
    mb-4
  ">
    Message Sent!
  </h3>

  {/* Description */}
  <p className="
    text-gray-400
    text-sm
    sm:text-base
    lg:text-lg
    max-w-lg
    mb-8
    leading-relaxed
  ">
    Thanks for reaching out,
    <span className="font-bold text-white">
      {" "}{name.split(" ")[0]}
    </span>.
    We’ll get back to{" "}
    <span className="font-bold text-white">
      {email}
    </span>{" "}
    shortly.
  </p>

  {/* Button */}
  <button
    onClick={() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
    }}
    className="
      min-w-[200px]
      h-12
      lg:h-14
      px-8
      bg-white/10
      hover:bg-white/20
      border border-white/10
      text-white
      rounded-xl
      font-bold
      transition-all
      shadow-md
    "
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
  className="
    w-full
    lg:col-span-5
    xl:col-span-4
    space-y-6
    mt-10 lg:mt-0
  "
>

  {/* Contact Info Card */}
  <div className="
    bg-white/5
    backdrop-blur-lg
    rounded-2xl lg:rounded-3xl
    p-5 sm:p-6 lg:p-8
    shadow-xl
    border border-white/10
    relative
    overflow-hidden
  ">

    {/* Decorative Blur */}
    <div className="
      absolute
      top-0 right-0
      w-24 h-24 sm:w-32 sm:h-32
      bg-white/10
      rounded-full
      blur-2xl
      -mr-8 -mt-8
    "></div>

    {/* Title */}
    <h4 className="
      text-lg sm:text-xl
      font-bold
      text-white
      mb-6
      flex items-center gap-3
      relative z-10
    ">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
        <FaMapMarkerAlt />
      </div>
      Contact Information
    </h4>

    <div className="space-y-6 relative z-10">

      {/* Location */}
      <div>
        <h5 className="text-xs font-bold uppercase text-white/70 mb-1">
          Office Location
        </h5>
        <p className="text-white font-medium text-sm sm:text-base">
          University of Barishal Campus
        </p>
        <p className="text-white/80 text-xs sm:text-sm">
          Barishal, Bangladesh
        </p>
      </div>

      {/* Phone & Email */}
      <div>
        <h5 className="text-xs font-bold uppercase text-white/70 mb-2">
          Phone & Email
        </h5>

        <div className="space-y-3">

          <a
            href="tel:01799532172"
            className="
              flex items-center gap-3
              text-white
              hover:bg-white/10
              transition-all
              p-2
              rounded-lg
            "
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <FaPhoneAlt size={14} />
            </div>
            <span className="font-semibold text-sm sm:text-base">
              01799532172
            </span>
          </a>

          <a
            href="mailto:mdimamhosen.cse@gmail.com"
            className="
              flex items-center gap-3
              text-white
              hover:bg-white/10
              transition-all
              p-2
              rounded-lg
              break-all
            "
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <FaEnvelope size={14} />
            </div>
            <span className="text-sm sm:text-base">
              mdimamhosen.cse@gmail.com
            </span>
          </a>

        </div>
      </div>

      {/* Office Hours */}
      <div>
        <h5 className="text-xs font-bold uppercase text-white/70 mb-2">
          Office Hours
        </h5>

        <div className="
          text-xs sm:text-sm
          font-medium
          text-white
          bg-white/10
          p-3
          rounded-xl
          border border-white/10
        ">
          <p className="flex justify-between mb-1">
            <span>Sun - Thu</span>
            <span>9:00 AM - 5:00 PM</span>
          </p>
          <p className="flex justify-between text-white/60">
            <span>Fri - Sat</span>
            <span>Closed</span>
          </p>
        </div>
      </div>

    </div>
  </div>

  {/* Quick Links Card */}
  <div className="
    bg-white/5
    backdrop-blur-lg
    rounded-2xl lg:rounded-3xl
    p-5 sm:p-6 lg:p-8
    shadow-xl
    border border-white/10
    relative
    overflow-hidden
    text-white
  ">

    {/* Decorative Blur */}
    <div className="
      absolute top-0 right-0
      w-24 h-24 sm:w-32 sm:h-32
      bg-white/10
      rounded-full
      blur-2xl
      -mr-8 -mt-8
    "></div>

    <h4 className="text-lg sm:text-xl font-bold mb-4 relative z-10 flex items-center gap-2">
      <FaQuestionCircle className="opacity-80" />
      Quick Links
    </h4>

    <div className="space-y-3 relative z-10 text-sm sm:text-base">
      <a
        href="#routes"
        className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 bg-brick-300 rounded-full"></div>
        View Bus Routes
      </a>
    </div>

    {/* Social */}
    <div className="mt-8 pt-6 border-t border-white/20 relative z-10">
      <div className="flex gap-3 flex-wrap">
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
    <section className="mt-16 lg:mt-24">
  <div className="w-full max-w-4xl mx-auto space-y-10">

    {/* Title + Description */}
    <div className="flex flex-col items-center text-center space-y-4">
      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
        Frequently Asked Questions
      </h3>

      <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
        Can&apos;t find the answer you&apos;re looking for?
  Check out our documentation or contact our support team.
      </p>
    </div>

    {/* Image */}
    <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-md">
      <Image
        src="/image/suppport.png"
        alt="Support illustration"
        fill
        className="object-cover"
      />
    </div>

    {/* FAQ */}
    <div>
      <FAQ />
    </div>

  </div>
</section>



      </main>
    </div>
  );
};

export default ContactPage;
