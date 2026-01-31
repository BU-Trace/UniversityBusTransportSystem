import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  footerText: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, footerText, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className={`relative bg-white/30 backdrop-blur-xl shadow-lg rounded-2xl p-4 border border-${color}-300 overflow-hidden`}
  >
    {}
    <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/10 to-transparent animate-pulse opacity-60 pointer-events-none"></div>
    <div className="flex items-center justify-between relative z-10">
      <p className="text-gray-600 font-semibold text-sm uppercase">{title}</p>
      <div className={`p-2 md:p-3 rounded-full bg-${color}-100 text-${color}-600 shadow-inner`}>
        {icon}
      </div>
    </div>
    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 relative z-10">
      {value}
    </h2>
    <div className={`font-medium text-sm mt-4 flex items-center text-${color}-600 relative z-10`}>
      {footerText}
    </div>
  </motion.div>
);

export default StatCard;
