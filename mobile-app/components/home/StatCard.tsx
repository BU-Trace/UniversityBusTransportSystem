import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  footerText?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, footerText }) => {
  return (
    <View className="bg-white/10 p-5 rounded-3xl border border-white/10 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="p-2 bg-white/5 rounded-xl border border-white/5">{icon}</View>
      </View>
      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
        {title}
      </Text>
      <Text className="text-white text-2xl font-black italic tracking-tighter mb-2">{value}</Text>
      {footerText && (
        <View className="flex-row items-center border-t border-white/5 pt-2 mt-auto">
          {typeof footerText === 'string' ? (
            <Text className="text-brick-400 text-[9px] font-bold uppercase tracking-tight">
              {footerText}
            </Text>
          ) : (
            footerText
          )}
        </View>
      )}
    </View>
  );
};

export default StatCard;
