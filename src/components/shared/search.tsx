'use client';

import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch: (term: string) => void;
  className?: string;
  wrapperClass?: string;
}

export function Search({
  onSearch,
  className = '',
  wrapperClass = '',
  ...props
}: SearchProps) {
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  return (
    <div className={`relative flex-1 ${wrapperClass}`}>
      <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search"
        className={`pl-10 bg-secondary-blue-500 rounded-md text-white border-transparent appearance-none ring-0!  transition-colors hover:border-secondary-blue-400 focus:border-secondary-blue-400 ease-in-out ${className}`}
        onChange={handleSearch}
        {...props}
      />
    </div>
  );
}
