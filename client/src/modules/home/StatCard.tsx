import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  footerText: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, footerText }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="relative bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-4 border border-white/20 overflow-hidden group shadow-white/5 cursor-pointer"
  >
    {/* Decorative background pulse */}
    <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/5 to-transparent animate-pulse opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"></div>

    <div className="flex items-center justify-between relative z-10 mb-2">
      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{title}</p>
      <div
        className={`p-2 rounded-lg bg-brick-600/20 text-brick-400 shadow-inner border border-brick-500/20 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>

    <h2 className="text-xl md:text-2xl font-black text-white mt-1 relative z-10">{value}</h2>

    <div
      className={`font-semibold text-[10px] mt-3 flex items-center text-brick-400 relative z-10`}
    >
      {footerText}
    </div>
  </motion.div>
);

export default StatCard;
