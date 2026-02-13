'use client';

export const SectionHeader = ({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) => (
  <div className="mb-8 md:mb-12">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-brick-400 font-bold text-xs uppercase tracking-wide mb-3 border border-white/10 backdrop-blur-md">
      <span className="w-5 h-5 rounded-full bg-brick-600 text-white flex items-center justify-center text-[10px]">
        {number}
      </span>
      {title}
    </div>
    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">{subtitle}</h2>
  </div>
);
