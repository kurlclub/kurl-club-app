'use client';

import React from 'react';

import { Users } from 'lucide-react';

import InfoCard from '@/components/shared/cards/info-card';
import { StudioLayout } from '@/components/shared/layout';
import { Search } from '@/components/shared/search';

import RequestCard from './request-card';

const Requests = () => {
  const RequestData = [
    {
      name: 'John Doe',
      phone: '+91 98765 43210',
      gender: 'Male',
      height: 170,
      weight: 80,
      dob: '12/05/1998',
      'blood group': 'B+',
    },
    {
      name: 'John',
      phone: '+91 98765 43210',
      gender: 'Male',
      height: 170,
      weight: 80,
      dob: '12/05/1998',
      'blood group': 'A+',
    },
    {
      name: 'Doe',
      phone: '+91 98765 43210',
      gender: 'Female',
      height: 150,
      weight: 70,
      dob: '12/05/1998',
      'blood group': 'AB+',
    },
  ];
  return (
    <StudioLayout title="Member Requests">
      <div className="max-w-[332px] flex flex-col gap-[26px]">
        <InfoCard
          item={{
            id: 1,
            icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
            color: 'primary-green-500',
            title: 'New members',
            count: 10,
          }}
        />
        <Search
          onSearch={() => {
            console.log('');
          }}
          wrapperClass="min-w-[140px] flex-1 md:flex-initial md:min-w-[200px] md:max-w-[332px]"
          className="h-[40px]"
        />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {RequestData.map((item, i) => (
          <RequestCard data={item} key={i} />
        ))}
      </div>
    </StudioLayout>
  );
};

export default Requests;
