import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Bus, Users, MapPin, Clock, ArrowUpRight, Megaphone } from 'lucide-react-native';
import LuxuryFlipClock from './LuxuryFlipClock';
import LocationDisplay from './LocationDisplay';
import StatCard from './StatCard';

const MobileHomePage = () => {
  const quickLinks = [
    {
      title: 'Live Bus Tracker',
      description: 'Real-time locations',
      icon: Bus,
    },
    {
      title: 'Check Schedules',
      description: 'Sun/Thu plans',
      icon: Clock,
    },
    {
      title: 'Explore Routes',
      description: 'Pickup points',
      icon: MapPin,
    },
    {
      title: 'Official Notices',
      description: 'Latest updates',
      icon: Megaphone,
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View className="pt-12 items-center">
        <LuxuryFlipClock />
        <View className="px-6 -mt-8 w-full">
          <LocationDisplay />
        </View>
      </View>

      {/* Stats Grid */}
      <View className="px-6 py-10 flex-row flex-wrap justify-between">
        <View className="w-[48%] mb-4">
          <StatCard
            title="Total Trips"
            value="1,234"
            icon={<Bus size={18} color="#cb7481" />}
            footerText="+12% Today"
          />
        </View>
        <View className="w-[48%] mb-4">
          <StatCard
            title="Passengers"
            value="5,678"
            icon={<Users size={18} color="#cb7481" />}
            footerText="Active"
          />
        </View>
        <View className="w-[48%]">
          <StatCard
            title="Active Buses"
            value="3/4"
            icon={<Bus size={18} color="#cb7481" />}
            footerText="Last updated 2m"
          />
        </View>
        <View className="w-[48%]">
          <StatCard
            title="Total Stops"
            value="13"
            icon={<MapPin size={18} color="#cb7481" />}
            footerText="6 Routes"
          />
        </View>
      </View>

      {/* Feature Highlight */}
      <View className="px-6 mb-10">
        <View className="bg-white/10 p-8 rounded-[40px] border border-white/20">
          <Text className="text-brick-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            Built for BU Trace
          </Text>
          <Text className="text-white text-2xl font-black italic tracking-tighter mb-4">
            Campus Transport at a Glance
          </Text>
          <Text className="text-gray-400 text-sm leading-relaxed mb-8">
            Everything passengers, drivers and admins need to stay aligned: live visibility and
            accurate schedules.
          </Text>

          <View className="gap-4">
            {[
              { title: 'Unified Mobility', desc: 'Live tracking & smart schedules', icon: Bus },
              { title: 'Role-Based Safety', desc: 'Instant updates for all', icon: Users },
              { title: 'Timely Reminders', desc: 'Automated alerts & ETAs', icon: Clock },
            ].map((f, i) => (
              <View
                key={i}
                className="flex-row items-center bg-white/5 p-4 rounded-2xl border border-white/5"
              >
                <View className="p-3 bg-white/5 rounded-xl mr-4">
                  <f.icon size={18} color="#cb7481" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-black text-xs uppercase">{f.title}</Text>
                  <Text className="text-gray-500 text-[10px] font-bold">{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Quick Links */}
      <View className="px-6 gap-4">
        <Text className="text-white text-lg font-black italic uppercase tracking-widest ml-1 mb-2">
          Quick Access
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {quickLinks.map((link, i) => (
            <TouchableOpacity
              key={i}
              className="w-[48%] bg-white/5 border border-white/10 p-5 rounded-3xl mb-4 flex-col justify-between"
              style={{ height: 120 }}
            >
              <View className="flex-row justify-between items-start">
                <View className="p-2 bg-brick-500/10 rounded-xl border border-brick-500/20">
                  <link.icon size={18} color="#cb7481" />
                </View>
                <ArrowUpRight size={14} color="#cb7481" />
              </View>
              <View>
                <Text className="text-white font-black text-xs">{link.title}</Text>
                <Text className="text-gray-500 text-[8px] font-bold uppercase tracking-tight">
                  {link.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Live Section Preview / Native UI Mock */}
      <View className="px-6 py-10">
        <TouchableOpacity className="bg-brick-600 rounded-[40px] p-8 flex-row items-center justify-between shadow-xl shadow-brick-900/40">
          <View className="flex-1">
            <Text className="text-white text-2xl font-black italic tracking-tighter uppercase">
              Launch Tracker
            </Text>
            <Text className="text-brick-100 text-xs font-bold mt-1">
              Real-time GPS visibility for all active buses.
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Bus size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MobileHomePage;
