'use client';

export interface RouteSchedule {
  route: string;
  toUniversity: string;
  fromUniversity: string;
  nextBus?: string;
}

export const schedules: RouteSchedule[] = [
  {
    route: 'Ichladi Toll Plaza',
    toUniversity: '8:00 AM (Sunday)',
    fromUniversity: '5:30 PM (Thursday)',
  },
  {
    route: 'Jhalokathi Sadar',
    toUniversity: '8:00 AM (Sunday)',
    fromUniversity: '5:30 PM (Thursday)',
  },
  { route: 'Nothullabad', toUniversity: '7:00 AM (Sunday)', fromUniversity: '4:00 PM (Thursday)' },
  { route: 'Notun Bazar', toUniversity: '7:30 AM (Sunday)', fromUniversity: '4:30 PM (Thursday)' },
  {
    route: 'Barishal Club',
    toUniversity: '7:45 AM (Sunday)',
    fromUniversity: '4:30 PM (Thursday)',
  },
  {
    route: 'Barishal Cantonment',
    toUniversity: '8:00 AM (Sunday)',
    fromUniversity: '5:30 PM (Thursday)',
  },
];
