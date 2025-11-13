import React from 'react';

import { Check, X } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAvatarColor } from '@/lib/avatar-utils';

interface RequestData {
  name: string;
  phone: string;
  gender: string;
  height: number;
  weight: number;
  dob: string;
  'blood group': string;
  [key: string]: string | number;
}

interface RequestCardProps {
  data: RequestData;
}

const RequestCard: React.FC<RequestCardProps> = ({ data }) => {
  const avatarStyle = getAvatarColor(data.name);

  return (
    <div className="rounded-lg cursor-pointer group p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-secondary-blue-500">
      {/* Info Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-6 flex-1">
        {Object.entries(data).map(([label, value]) => (
          <div key={label} className="flex flex-col gap-2">
            <span className="text-sm leading-normal text-secondary-blue-200 capitalize">
              {label}
            </span>
            <div className="flex items-center gap-2">
              {label === 'name' && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="font-medium" style={avatarStyle}>
                    {data?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-sm leading-normal text-white">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div
        className="flex w-full md:w-fit items-center gap-3 self-end lg:self-center md:opacity-0
               group-hover:opacity-100 
               translate-x-2 group-hover:translate-x-0 
               transition-all duration-300 ease-out"
      >
        <Button
          className="text-red-200 bg-red-500/20 hover:bg-red-500/30"
          variant="destructive"
        >
          {' '}
          <X /> Deny
        </Button>
        <Button className="bg-primary-green-500/40 text-white">
          <Check /> Accept
        </Button>
      </div>
    </div>
  );
};

export default RequestCard;
