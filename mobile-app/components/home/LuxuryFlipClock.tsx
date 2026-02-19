import React, { useState, useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';

const Digit = ({ value, label }: { value: string; label: string }) => (
  <View className="items-center">
    <View className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative h-24 w-16 justify-center items-center">
      <View className="absolute top-1/2 left-0 right-0 h-px bg-black opacity-50 z-10" />
      <Text className="text-white text-5xl font-black tracking-tighter italic">{value}</Text>
    </View>
    <Text className="text-brick-500 text-[8px] font-black uppercase tracking-widest mt-2">
      {label}
    </Text>
  </View>
);

const LuxuryFlipClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { h, m, s } = useMemo(() => {
    const now = new Date(time.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    return {
      h: now.getHours().toString().padStart(2, '0'),
      m: now.getMinutes().toString().padStart(2, '0'),
      s: now.getSeconds().toString().padStart(2, '0'),
    };
  }, [time]);

  return (
    <View className="w-full py-12 items-center justify-center bg-black/40 border-y border-white/5">
      <View className="flex-row items-center gap-2">
        <Digit value={h} label="Hours" />
        <View className="gap-2 mb-4">
          <View className="w-1.5 h-1.5 bg-brick-500 rounded-full" />
          <View className="w-1.5 h-1.5 bg-brick-500 rounded-full" />
        </View>
        <Digit value={m} label="Minutes" />
        <View className="gap-2 mb-4">
          <View className="w-1.5 h-1.5 bg-brick-500 rounded-full" />
          <View className="w-1.5 h-1.5 bg-brick-500 rounded-full" />
        </View>
        <Digit value={s} label="Seconds" />
      </View>
      <Text className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mt-8">
        Precision Synchronized
      </Text>
    </View>
  );
};

export default LuxuryFlipClock;
