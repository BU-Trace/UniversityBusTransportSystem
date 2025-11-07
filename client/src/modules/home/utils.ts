export const parseTime = (timeStr: string) => {
  const [time, meridian] = timeStr.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  let h = hour;
  if (meridian === 'PM' && hour !== 12) h += 12;
  if (meridian === 'AM' && hour === 12) h = 0;
  return h * 60 + (minute || 0);
};
