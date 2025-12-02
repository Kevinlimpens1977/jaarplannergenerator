'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/planner', label: 'Jaarplanner' },
    { href: '/submit', label: 'Nieuwe activiteit' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="bg-white border-b border-green-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link href="/planner" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
                <Image
                  src="https://iyyxtrwcluuhorwcdzbg.supabase.co/storage/v1/object/public/app-images/jaarplanner2.png"
                  alt="Paco Mascotte"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-900 leading-tight">
                  DaCapo
                </span>
                <span className="text-sm font-medium text-green-600 leading-tight">
                  Jaarplanner
                </span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1 bg-green-50 p-1 rounded-xl">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname.startsWith(item.href)
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-green-700 hover:text-green-900 hover:bg-green-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-sm">
              <span className="text-green-600 text-xs">Ingelogd als</span>
              <span className="font-semibold text-green-900">Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-white shadow-sm">
              A
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-green-100 bg-green-50">
        <div className="flex justify-around p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-2 text-sm font-medium rounded-md ${
                pathname.startsWith(item.href)
                  ? 'text-green-700 bg-white shadow-sm'
                  : 'text-green-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
