'use client';

import { AdminMobileDrawer } from '@/components/admin/admin-mobile-drawer';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BungalowsModule } from '@/modules/admin/bungalows-module';
import { CalendarModule } from '@/modules/admin/calendar-module';
import { ContactMessagesModule } from '@/modules/admin/contact-messages-module';
import { ContentModule } from '@/modules/admin/content-module';
import { DashboardModule } from '@/modules/admin/dashboard-module';
import { MediaModule } from '@/modules/admin/media-module';
import { PagesModule } from '@/modules/admin/pages-module';
import { PaymentsModule } from '@/modules/admin/payments-module';
import { ReportsModule } from '@/modules/admin/reports-module';
import { ReservationsModule } from '@/modules/admin/reservations-module';
import { SettingsModule } from '@/modules/admin/settings-module';
import { TranslationsModule } from '@/modules/admin/translations-module';
import { type AdminMenuKey } from '@/modules/admin/types';
import { useAdminData } from '@/modules/admin/use-admin-data';
import { UsersModule } from '@/modules/admin/users-module';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const locale = String(params.locale ?? 'tr');

  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const admin = useAdminData();

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.replace(`/${locale}/admin/login`);
      return;
    }
    void admin.refresh();
  }, [locale, router]);

  function logout() {
    localStorage.removeItem('token');
    router.push(`/${locale}/admin/login`);
  }

  const activeLabel = useMemo(() => t(`menu.${activeMenu}`), [activeMenu, t]);

  return (
    <main className="bgl-container max-w-[1400px] py-4 md:py-6">
      <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
        <AdminSidebar
          active={activeMenu}
          collapsed={sidebarCollapsed}
          onSelect={setActiveMenu}
          onToggleCollapsed={() => setSidebarCollapsed((p) => !p)}
        />

        <section className="space-y-4">
          <AdminTopbar
            title={activeLabel}
            subtitle={t('topbarSubtitle')}
            onOpenMobileMenu={() => setMobileDrawerOpen(true)}
            onRefresh={() => void admin.refresh()}
          />

          <AdminMobileDrawer
            open={mobileDrawerOpen}
            active={activeMenu}
            onClose={() => setMobileDrawerOpen(false)}
            onSelect={(key) => {
              setActiveMenu(key);
              setMobileDrawerOpen(false);
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-bgl-mist/80 bg-white px-4 py-3">
            <Link href={`/${locale}`} className="text-sm font-semibold text-bgl-moss hover:underline">
              {t('goSite')}
            </Link>
            <Button variant="destructive" size="sm" className="gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </Button>
          </div>

          {admin.error ? (
            <Card>
              <CardContent className="p-4 text-sm text-rose-700">{admin.error}</CardContent>
            </Card>
          ) : null}
          {admin.loading ? (
            <Card>
              <CardContent className="p-4 text-sm text-bgl-muted">{t('loading')}</CardContent>
            </Card>
          ) : null}

          {activeMenu === 'dashboard' ? (
            <DashboardModule
              stats={admin.stats}
              reservations={admin.reservations}
              revenueData={admin.revenueChartData}
            />
          ) : null}
          {activeMenu === 'bungalows' ? (
            <BungalowsModule
              bungalows={admin.bungalows}
              onChange={admin.setBungalows}
              onCreatePersist={admin.createBungalow}
              onUpdatePersist={admin.updateBungalow}
              onDeletePersist={admin.deleteBungalow}
              onUploadMediaPersist={admin.uploadMedia}
            />
          ) : null}
          {activeMenu === 'reservations' ? (
            <ReservationsModule
              items={admin.reservations}
              bungalows={admin.bungalows}
              onChange={admin.setReservations}
              onPersistStatus={admin.updateReservationStatus}
              onCreateManual={admin.createManualReservation}
            />
          ) : null}
          {activeMenu === 'calendar' ? <CalendarModule bungalows={admin.bungalows} /> : null}
          {activeMenu === 'payments' ? (
            <PaymentsModule
              payments={admin.payments}
              providerSettings={admin.paymentProviderSettings}
              onSaveProvider={admin.updatePaymentProvider}
            />
          ) : null}
          {activeMenu === 'users' ? (
            <UsersModule users={admin.users} onChange={admin.setUsers} />
          ) : null}
          {activeMenu === 'media' ? (
            <MediaModule
              items={admin.mediaItems}
              onUploadPersist={admin.uploadMedia}
              onDeletePersist={admin.deleteMedia}
            />
          ) : null}
          {activeMenu === 'pages' ? (
            <PagesModule pages={admin.sitePages} onChange={admin.setSitePages} />
          ) : null}
          {activeMenu === 'content' ? (
            <ContentModule sections={admin.contentSections} onChange={admin.setContentSections} />
          ) : null}
          {activeMenu === 'translations' ? (
            <TranslationsModule rows={admin.translations} onChange={admin.setTranslations} />
          ) : null}
          {activeMenu === 'reports' ? (
            <ReportsModule
              reservations={admin.reservations}
              bungalows={admin.bungalows}
              revenueData={admin.revenueChartData}
            />
          ) : null}
          {activeMenu === 'contact' ? (
            <ContactMessagesModule
              items={admin.contactMessages}
              pagination={admin.contactPagination}
              loading={admin.contactLoading}
              error={admin.contactError}
              onFetch={admin.fetchContactMessages}
              onMarkRead={admin.markContactRead}
              onMarkReplied={admin.markContactReplied}
              onDelete={admin.deleteContactMessage}
            />
          ) : null}
          {activeMenu === 'settings' ? (
            <SettingsModule
              settings={admin.settings}
              onChange={admin.setSettings}
              onSave={admin.saveSettings}
              uploadMedia={admin.uploadMedia}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
