import { ReactNode } from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

interface TabsListProps {
  children: ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  activeTab: string;
  onClick: (value: string) => void;
}

interface TabsContentProps {
  value: string;
  activeTab: string;
  children: ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <div className="w-full">
      {typeof children === 'function' ? children({ value, onValueChange }) : children}
    </div>
  );
}

export function TabsList({ children }: TabsListProps) {
  return (
    <div className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, activeTab, onClick }: TabsTriggerProps) {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeTab, children }: TabsContentProps) {
  if (value !== activeTab) return null;
  return (
    <div className="mt-6 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2">
      {children}
    </div>
  );
}
