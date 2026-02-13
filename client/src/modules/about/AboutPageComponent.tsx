'use client';

import React from 'react';
import PageBanner from '@/components/common/PageBanner';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import {
  MapPin,
  Bell,
  Shield,
  Clock,
  Phone,
  Mail,
  Award,
  Users,
  Quote,
  Bus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- DATA ---

const CHIEF_INFO = {
  name: 'Uzzal Hossain',
  title: 'Manager (In-Charge), Office of the Registrar (Transport Pool)',
  message:
    'Our transport system ensures smooth, reliable and safe commuting for all university members — connecting our campus with the city every day with care and punctuality.',
  phone: '+880 1xxx-xxxxxx',
  email: 'registrar@bu.ac.bd',
  imageSrc: '/static/chief_uzzal_hossain.png',
};

interface StaffInfo {
  name: string;
  duty: string;
  phone: string;
  yearsOfService: string;
  busesDriven: string[];
  imageSrc: string;
}

const DRIVER_STAFF_INFO: StaffInfo[] = [
  {
    name: 'Driver 1',
    duty: 'Senior Bus Driver',
    phone: '+880 1xxx-xxxxxx',
    yearsOfService: '10+ Years',
    busesDriven: ['BRTC-04 (Joyonti)', 'BRTC-05 (Chitra)'],
    imageSrc: '/static/driver_placeholder_1.png',
  },
  {
    name: 'Driver 2',
    duty: 'Bus Driver',
    phone: '+880 1xxx-xxxxxx',
    yearsOfService: '5+ Years',
    busesDriven: ['BRTC-06 (Boikali/Kirtonkhola)'],
    imageSrc: '/static/driver_placeholder_2.png',
  },
  {
    name: 'Driver 3',
    duty: 'Bus Driver',
    phone: '+880 1xxx-xxxxxx',
    yearsOfService: '8 Years',
    busesDriven: ['BRTC-11 (Double Decker)', 'BRTC-07'],
    imageSrc: '/static/driver_placeholder_3.png',
  },
  {
    name: 'Driver 4',
    duty: 'Assistant Driver',
    phone: '+880 1xxx-xxxxxx',
    yearsOfService: '3 Years',
    busesDriven: ['Andharmanik', 'Sugondha'],
    imageSrc: '/static/driver_placeholder_4.png',
  },
  {
    name: 'Driver 5',
    duty: 'Bus Driver',
    phone: '+880 1xxx-xxxxxx',
    yearsOfService: '6 Years',
    busesDriven: ['Sondha', 'Agunmukha'],
    imageSrc: '/static/driver_placeholder_5.png',
  },
  {
    name: 'Driver 6',
    duty: 'Mechanic & Driver',
    phone: '+880 1xxx-xxxxxx',
    yearsOfService: '12 Years',
    busesDriven: ['BRTC (Single Decker)'],
    imageSrc: '/static/driver_placeholder_6.png',
  },
  {
    name: 'Driver 7',
    duty: 'Bus Driver',
    phone: '+880 1xxx-xxxxxx',
    yearsOfService: '4 Years',
    busesDriven: ['Lata/Payra'],
    imageSrc: '/static/driver_placeholder_7.png',
  },
];

const StaffCard: React.FC<{ member: StaffInfo }> = ({ member }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white/5 backdrop-blur-lg rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl border border-white/10 group transition-all duration-300 hover:shadow-brick-500/20 hover:border-brick-500/30"
  >
    <div className="relative h-40 md:h-64 w-full overflow-hidden bg-gray-800">
      <ImageWithFallback
        src={member.imageSrc}
        alt={member.name}
        fill
        sizes="(max-width: 600px) 50vw, 33vw"
        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
      <span className="absolute bottom-2 left-2 md:bottom-3 md:left-4 bg-brick-500/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg border border-white/20">
        {member.duty}
      </span>
    </div>

    <div className="p-3 md:p-6 bg-white/5 backdrop-blur-md border-t border-white/5">
      <h3 className="text-sm md:text-xl font-bold text-white mb-2 md:mb-4 group-hover:text-brick-400 transition-colors line-clamp-1">
        {member.name}
      </h3>

      <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
        <div className="flex items-center text-gray-300">
          <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-brick-500/20 flex items-center justify-center text-brick-400 mr-2 md:mr-3 shrink-0">
            <Calendar size={10} className="md:hidden" />
            <Calendar size={14} className="hidden md:block" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[8px] md:text-xs font-bold uppercase text-gray-500 truncate">
              Service
            </span>
            <span className="font-semibold text-gray-200 text-[10px] md:text-sm truncate block">
              {member.yearsOfService}
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-300">
          <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-brick-500/20 flex items-center justify-center text-brick-400 mr-2 md:mr-3 shrink-0">
            <Phone size={10} className="md:hidden" />
            <Phone size={14} className="hidden md:block" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[8px] md:text-xs font-bold uppercase text-gray-500 truncate">
              Contact
            </span>
            <span className="font-semibold text-gray-200 text-[10px] md:text-sm truncate block">
              {member.phone}
            </span>
          </div>
        </div>

        <div className="flex items-start text-gray-300">
          <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-brick-500/20 flex items-center justify-center text-brick-400 mr-2 md:mr-3 shrink-0 md:mt-1">
            <Bus size={10} className="md:hidden" />
            <Bus size={14} className="hidden md:block" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[8px] md:text-xs font-bold uppercase text-gray-500 truncate">
              Buses
            </span>
            <span className="font-semibold text-gray-200 leading-tight block mt-0.5 text-[10px] md:text-sm line-clamp-1">
              {member.busesDriven.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- TEAM MEMBER MODAL COMPONENT ---

const TeamMemberModal: React.FC<{ member: TeamMember | null; onClose: () => void }> = ({
  member,
  onClose,
}) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-brick-500 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-2/5 relative h-64 md:h-auto bg-gray-800">
          <ImageWithFallback
            src={member.imageSrc}
            alt={member.name}
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent to-transparent md:bg-linear-to-r" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{member.name}</h3>
            <p className="text-brick-400 text-lg font-bold uppercase tracking-wide">
              {member.role}
            </p>
          </div>

          <div className="space-y-6">
            <blockquote className="relative pl-6 border-l-4 border-brick-500/30">
              <Quote className="absolute -top-2 -left-3 w-8 h-8 text-brick-500/20 -z-10" />
              <p className="text-xl md:text-2xl text-gray-200 italic font-serif leading-relaxed">
                &ldquo;{member.message}&rdquo;
              </p>
            </blockquote>

            <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                Core Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.expertise.split(',').map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-brick-500/10 text-brick-300 font-medium text-sm border border-brick-500/20"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional info or contact could go here */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface TeamMember {
  name: string;
  role: string;
  imageSrc: string;
  message: string;
  expertise: string;
}

const AboutPageComponent: React.FC = () => {
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-brick-900 flex flex-col items-center justify-start font-sans">
      <PageBanner
        title="Driving Excellence"
        subtitle="Safe, Reliable, and Punctual Campus Transport for Everyone."
        imageSrc="/static/loginpagebanner.png"
      />

      {/* Main Content Container */}
      <main className="w-full">
        {/* 1. Mission & Vision */}
        <section className="py-20 px-6 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 bg-brick-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 text-brick-400 rotate-3 hover:rotate-6 transition-transform"
          >
            <Shield size={32} />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
            Our Mission
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
            To provide <span className="text-brick-400 font-bold">safe</span>,{' '}
            <span className="text-brick-400 font-bold">efficient</span>, and{' '}
            <span className="text-brick-400 font-bold">punctual</span> transportation services for
            the faculty, staff, and drivers of the University of Barishal, ensuring reliable
            connectivity between the campus and the city.
          </p>
        </section>

        {/* 2. Leadership Message */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-4xl shadow-2xl overflow-hidden border border-white/20 flex flex-col lg:flex-row">
              <div className="lg:w-2/5 bg-gray-800 relative min-h-[400px] lg:min-h-full group">
                <ImageWithFallback
                  src={CHIEF_INFO.imageSrc}
                  alt={CHIEF_INFO.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>

              <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center relative">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Quote size={120} className="text-white" />
                </div>

                <div className="inline-flex items-center gap-2 uppercase tracking-wide text-xs font-bold text-brick-400 mb-6 bg-brick-500/20 px-4 py-2 rounded-full self-start">
                  <Award size={14} /> Message from the Head
                </div>

                <h2 className="text-4xl font-black text-white mb-2">{CHIEF_INFO.name}</h2>
                <p className="text-gray-300 font-medium mb-10 text-lg">{CHIEF_INFO.title}</p>

                <blockquote className="relative mb-10">
                  <p className="text-gray-200 italic text-xl md:text-2xl leading-relaxed font-serif">
                    &ldquo;{CHIEF_INFO.message}&rdquo;
                  </p>
                </blockquote>

                <div className="flex flex-wrap gap-4 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-300 bg-white/5 px-4 py-2 rounded-lg">
                    <Phone size={16} className="text-brick-400" /> {CHIEF_INFO.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-300 bg-white/5 px-4 py-2 rounded-lg">
                    <Mail size={16} className="text-brick-400" /> {CHIEF_INFO.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Why Choose UBTS (Features) */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tight">
              Why Choose BU Trace?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              We combine technology with operational excellence to deliver a superior transport
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Live Bus Tracking',
                icon: MapPin,
                text: 'View vehicle locations in real-time and share ETAs.',
              },
              {
                title: 'Dynamic Scheduling',
                icon: Clock,
                text: 'Routes update automatically when delays occur.',
              },
              {
                title: 'Instant Notifications',
                icon: Bell,
                text: 'Instant alerts for users about delays and changes.',
              },
              {
                title: 'Secure Access',
                icon: Shield,
                text: 'Role-based authentication keeps your campus safe.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-brick-500/20 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-brick-500/20 rounded-2xl flex items-center justify-center text-brick-400 mb-6 group-hover:bg-brick-600 group-hover:text-white transition-colors">
                  <item.icon size={24} />
                </div>
                <h3 className="font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. System Stats */}
        <section className="py-20 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('/static/pattern.png')]"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { label: 'Active Routes', value: '28', icon: MapPin },
                { label: 'Total Vehicles', value: '62', icon: Bus },
                { label: 'Daily Users', value: '12k+', icon: Users },
                { label: 'On-time Rate', value: '92%', icon: CheckCircle },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="flex justify-center mb-4 text-brick-300">
                    <stat.icon size={32} />
                  </div>
                  <div className="text-4xl md:text-5xl font-black mb-2">{stat.value}</div>
                  <div className="text-brick-200 font-medium uppercase tracking-wider text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Operation Guidelines */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Rules */}
            <div className="bg-white/10 backdrop-blur-lg p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brick-500 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                Transport Rules
              </h3>
              <ul className="space-y-6">
                {[
                  'Users must carry their ID cards at all times.',
                  'Seats designated for teachers and staff must be respected.',
                  'Boarding and alighting is only permitted at designated stoppages.',
                ].map((rule, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <CheckCircle className="text-brick-400 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-200 font-medium text-lg leading-relaxed">
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety */}
            <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10">
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                Safety Guidelines
              </h3>
              <ul className="space-y-6">
                {[
                  'Do not stand on the door steps while the bus is moving.',
                  'Request stops well in advance.',
                  'In case of emergency, contact the driver immediately.',
                ].map((rule, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-200 font-medium text-lg leading-relaxed">
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Meet the Team */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">Our Dedicated Team</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Meet the skilled professionals who keep the wheels turning.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-8 mb-12">
              {DRIVER_STAFF_INFO.map((member, index) => (
                <StaffCard key={index} member={member} />
              ))}
            </div>

            <p className="text-center text-sm text-gray-400 font-medium italic">
              * Driver assignments and contact details are subject to change based on operational
              requirements.
            </p>
          </div>
        </section>

        {/* 7. HEXAGON Development Team */}
        <section className="py-20 px-6 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Users className="w-10 h-10 text-brick-400" />
                  <h2 className="text-4xl md:text-5xl font-black">Meet Team HEXAGON</h2>
                </div>
                <div className="h-1.5 w-32 bg-brick-500 mx-auto rounded-full mb-6"></div>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
                  The brilliant minds behind BU Trace — a team of six passionate developers who
                  transformed campus transportation with cutting-edge technology and innovation.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-8">
              {[
                {
                  name: 'Md Imam Hosen',
                  role: 'Team Lead & Full-Stack Developer',
                  imageSrc: '/static/im1.png',
                  message:
                    'Leading this project has been an incredible journey. We built BU Trace to solve real problems and make campus life easier for everyone.',
                  expertise: 'TypeScript, Nest.js, DevOps',
                },
                {
                  name: 'Md Mahruf Alam',
                  role: 'Backend Developer & Database Designer',
                  imageSrc: '/static/mah.png',
                  message:
                    'Designing the database architecture and backend systems was challenging but rewarding. Every query is optimized for speed and reliability.',
                  expertise: 'Full-Stack, UI/UX, System Architecture',
                },
                {
                  name: 'Imam Hossen',
                  role: 'API Developer & Deployment Engineer',
                  imageSrc: '/static/im2.png',
                  message:
                    'Ensuring smooth deployments and maintaining system security is my priority. BU Trace runs 24/7 because we care about uptime.',
                  expertise: 'APIs, Databases, Security',
                },
                {
                  name: 'Abdus Sakur',
                  role: 'Project Manager & Frontend Developer',
                  imageSrc: '/static/pp.png',
                  message:
                    'Managing timelines and coordinating the team taught me the value of collaboration. Data-driven decisions shaped our success.',
                  expertise: 'Data Analysis, Analytics',
                },
                {
                  name: 'Sourav Debnath',
                  role: 'UI/UX Designer & Backend Developer',
                  imageSrc: '/static/sss.png',
                  message:
                    'Every pixel matters. I designed BU Trace to be intuitive and beautiful, ensuring users enjoy every interaction.',
                  expertise: 'UI/UX Design, Modern Interfaces',
                },
                {
                  name: 'Utsojit Paticor',
                  role: 'QA Engineer & Documentation Lead',
                  imageSrc: '/static/utso.png',
                  message:
                    'Quality is non-negotiable. I tested every feature rigorously and documented everything to ensure a flawless experience.',
                  expertise: 'Testing Automation, Documentation',
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedMember(member)}
                  className="bg-linear-to-br from-gray-800/50 via-gray-900/50 to-black/50 backdrop-blur-lg border border-white/10 rounded-xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-xl hover:shadow-brick-500/20 transition-all duration-300 group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 md:h-72 w-full overflow-hidden bg-gray-800">
                    <ImageWithFallback
                      src={member.imageSrc}
                      alt={member.name}
                      fill
                      sizes="(max-width: 600px) 50vw, 33vw"
                      className="object-cover object-top group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-lg md:text-2xl font-bold text-white mb-1 group-hover:text-brick-400 transition-colors">
                        {member.name}
                      </h3>
                      <span className="inline-block bg-brick-600/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg shadow-lg">
                        {member.role.split('&')[0].trim()}
                      </span>
                    </div>
                  </div>

                  {/* Minimal Content - Modal Trigger Hint */}
                  <div className="p-3 md:p-4 bg-white/5 border-t border-white/5 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                    <span className="text-[10px] md:text-xs font-medium text-gray-400">
                      View Profile
                    </span>
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-brick-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {selectedMember && (
                <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
              )}
            </AnimatePresence>

            {/* Team Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { label: 'Team Members', value: '6' },
                { label: 'Code Commits', value: '2.5k+' },
                { label: 'Development Hours', value: '1200+' },
                { label: 'Features Built', value: '50+' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center p-6 bg-white/5 rounded-2xl border border-white/10"
                >
                  <div className="text-3xl md:text-4xl font-black text-brick-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Team Message */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 text-center max-w-3xl mx-auto"
            >
              <p className="text-gray-300 text-lg leading-relaxed italic">
                &ldquo;We are HEXAGON — six sides, one vision. Together, we built BU Trace to
                revolutionize campus transportation and make every journey safer, smarter, and more
                efficient.&rdquo;
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-brick-500"></div>
                <span className="text-brick-400 font-bold text-sm">Team HEXAGON</span>
                <div className="h-px w-12 bg-brick-500"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 8. CTA */}
        <section className="py-24 px-6">
          <div className="relative bg-linear-to-r from-red-900 via-brick-900 to-rose-950 rounded-[2.5rem] p-12 text-center border border-white/10 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brick-600 opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-40 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Have Questions?</h2>
              <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                We are constantly improving BU Trace. If you have feedback or need assistance, our
                support team is ready to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-white text-brick-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
              >
                Contact Support <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPageComponent;
