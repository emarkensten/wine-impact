'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useClimate } from '@/context/ClimateContext';
import { ArrowUpDown, Clock, TrendingUp, TrendingDown, Check } from 'lucide-react';
import type { SortOption } from '@/types';

const options: { value: SortOption; label: string; icon: typeof Clock }[] = [
  { value: 'added', label: 'Senast tillagd', icon: Clock },
  { value: 'best_score', label: 'Bäst först', icon: TrendingUp },
  { value: 'worst_score', label: 'Sämst först', icon: TrendingDown },
];

export function SortButton() {
  const { sortOption, setSortOption, comparisonList } = useClimate();

  if (comparisonList.length < 2) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setSortOption(value)}>
            <Icon className="w-4 h-4 mr-2" />
            {label}
            {sortOption === value && <Check className="w-4 h-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
