import React, { ReactNode } from 'react';

interface InfoCardItem {
  id: React.Key;
  icon: ReactNode;
  color?: string;
  title: string;
  count: number | string;
}

interface InfoCardProps {
  item: InfoCardItem;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ item, className }) => {
  const colorClasses: { [key: string]: string } = {
    'primary-green-500': 'bg-primary-green-500',
    'secondary-pink-500': 'bg-secondary-pink-500',
    'secondary-yellow-150': 'bg-secondary-yellow-150',
    'semantic-blue-500': 'bg-semantic-blue-500',
    'alert-red-400': 'bg-alert-red-400',
  };

  return (
    <div
      className={`group relative w-full bg-secondary-blue-500 rounded-xl border border-white/5 
        hover:border-white/10 transition-all duration-300 ease-out 
        hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 
        cursor-pointer overflow-hidden ${className}`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex gap-3 items-center p-3">
        <div
          className={`relative rounded-xl w-9 h-9 flex items-center justify-center 
            ${colorClasses[item.color || 'primary-green-500']} 
            shadow-sm group-hover:shadow-md transition-all duration-300 
            group-hover:scale-105`}
        >
          <div className="transform transition-transform duration-300 group-hover:scale-110">
            {item.icon}
          </div>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <p
            className="text-white/70 font-medium text-xs leading-tight truncate 
            group-hover:text-white/80 transition-colors duration-300"
          >
            {item.title}
          </p>
          <p
            className="text-white font-bold text-lg leading-tight 
            transform transition-all duration-300 group-hover:scale-105 origin-left"
          >
            {item.count}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
