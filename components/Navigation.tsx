'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/planner', label: 'Jaarplanner' },
    { href: '/submit', label: 'Nieuwe activiteit' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/planner" className="text-xl font-bold">
              DaCapo Jaarplanner 26/27
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith(item.href)
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-500'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-sm">
            <span className="opacity-75">Ingelogd als:</span>{' '}
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
