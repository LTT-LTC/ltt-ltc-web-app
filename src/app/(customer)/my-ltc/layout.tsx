'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LTTCard from '@/src/@core/component/AntD/LTTCard';
import TopBar from '../_components/TopBar';
import Header from '../_components/Header';
import Footer from '../_components/Footer';
import { useLocalization } from '@/src/@core/hooks/use-localization';

export default function MyLtcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLocalization();
  const pathname = usePathname();

  const navItems = [
    { label: t('customer.my_ltc.nav.dashboard'), path: '/my-ltc' },
    { label: t('customer.my_ltc.nav.account_details'), path: '/my-ltc/account-details' },
    { label: t('customer.my_ltc.nav.membership_card'), path: '/my-ltc/membership-card' },
    { label: t('customer.my_ltc.nav.points'), path: '/my-ltc/points' },
    { label: t('customer.my_ltc.nav.vouchers'), path: '/my-ltc/vouchers' },
    { label: t('customer.my_ltc.nav.transaction_history'), path: '/my-ltc/transaction-history' },
  ];

  const isTabActive = (path: string) => {
    if (path === '/my-ltc') {
      return pathname === '/my-ltc' || pathname === '/my-ltc/';
    }
    return pathname === path || pathname === `${path}/` || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <TopBar />
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl min-h-[600px]">
        <h1 className="text-3xl font-bold mb-6">{t('customer.my_ltc.title')}</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 animate-[fade-in-up_0.4s_ease-out_forwards]">
            <LTTCard className="p-0 overflow-hidden shadow-sm" styles={{ body: { padding: 0 } }}>
              <nav className="flex flex-row md:flex-col overflow-x-auto custom-scrollbar">
                {navItems.map((item, index) => {
                  const isActive = isTabActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      style={{ animationDelay: `${index * 40}ms` }}
                      className={`group relative px-6 py-4 whitespace-nowrap text-sm md:text-base border-l-4 md:border-l-4 md:border-b-0 border-b-4 transition-all duration-300 ease-out animate-[fadeInUp_0.35s_ease-out_forwards] ${isActive
                          ? 'bg-[#cc3434] !text-white hover:!text-white focus:!text-white visited:!text-white border-[#cc3434] font-semibold shadow-sm'
                          : 'text-gray-700 hover:bg-[#cc3434] hover:text-white border-transparent'
                        }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </LTTCard>
          </div>

          {/* Content Area */}
          <div className="flex-1 animate-[fadeInUp_0.4s_ease-out_forwards]">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}