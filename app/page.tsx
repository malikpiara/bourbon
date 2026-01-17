'use client';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

// Dynamically import the SalesForm component with client-side only rendering
const SalesForm = dynamic(
  () => import('@/components/forms/sales').then((mod) => mod.SalesForm),
  {
    ssr: false,
    loading: () => (
      <div className="p-7 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-[200px]" />
        </div>

        {/* Main content area */}
        <div className="flex space-x-8">
          {/* Main content */}
          <div className="flex-grow space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />

            <div className="space-y-2 mt-8">
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <div className="p-8 m-14">
      <SalesForm />
    </div>
  );
}
