import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableCell, TableHead } from '@/components/ui/table';
import type { AdminStats, Reservation, RevenuePoint } from './types';

type Props = {
  stats: AdminStats;
  reservations: Reservation[];
  revenueData: RevenuePoint[];
};

export function DashboardModule({ stats, reservations, revenueData }: Props) {
  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard label="Toplam Rezervasyon" value={stats.totalReservations} />
        <StatsCard
          label="Aylik Ciro"
          value={`${stats.monthlyRevenue.toLocaleString('tr-TR')} TL`}
        />
        <StatsCard label="Doluluk Orani" value={`${stats.occupancyRate}%`} />
        <StatsCard label="Bugun Giris" value={stats.todayCheckIns} />
        <StatsCard label="Bugun Cikis" value={stats.todayCheckOuts} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Son Rezervasyonlar</CardTitle>
            <CardDescription>
              Son rezervasyonlari onayla, iptal et ve takip et.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <thead className="border-b border-bgl-mist/70">
                  <tr>
                    <TableHead>Misafir</TableHead>
                    <TableHead>Bungalov</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 8).map((item) => (
                    <tr key={item.id} className="border-b border-bgl-mist/40">
                      <TableCell>
                        <div className="font-semibold">{item.customerName}</div>
                        <div className="text-xs text-bgl-muted">{item.customerEmail}</div>
                      </TableCell>
                      <TableCell>{item.bungalowName}</TableCell>
                      <TableCell>
                        {new Date(item.checkIn).toLocaleDateString('tr-TR')} -{' '}
                        {new Date(item.checkOut).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'approved'
                              ? 'success'
                              : item.status === 'cancelled'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {item.status === 'approved'
                            ? 'Onaylandi'
                            : item.status === 'cancelled'
                              ? 'Iptal'
                              : 'Beklemede'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.amount.toLocaleString('tr-TR')} TL
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {reservations.slice(0, 6).map((item) => (
                <Card key={item.id} className="border-bgl-mist">
                  <CardContent className="space-y-1 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-bgl-ink">{item.customerName}</p>
                        <p className="text-xs text-bgl-muted">{item.customerEmail}</p>
                      </div>
                      <Badge
                        variant={
                          item.status === 'approved'
                            ? 'success'
                            : item.status === 'cancelled'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {item.status === 'approved'
                          ? 'Onaylandi'
                          : item.status === 'cancelled'
                            ? 'Iptal'
                            : 'Beklemede'}
                      </Badge>
                    </div>
                    <p className="text-xs text-bgl-muted">{item.bungalowName}</p>
                    <p className="text-xs text-bgl-muted">
                      {new Date(item.checkIn).toLocaleDateString('tr-TR')} -{' '}
                      {new Date(item.checkOut).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-sm font-semibold text-bgl-ink">
                      {item.amount.toLocaleString('tr-TR')} TL
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ciro Grafigi</CardTitle>
            <CardDescription>Aylik ciro dagilimi</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={revenueData} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">{label}</p>
        <p className="mt-2 text-2xl font-bold text-bgl-ink">{value}</p>
      </CardContent>
    </Card>
  );
}

function SimpleBarChart({ data }: { data: RevenuePoint[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="space-y-2">
      {data.map((point) => (
        <div key={point.month} className="grid grid-cols-[28px_1fr_72px] items-center gap-2">
          <span className="text-xs text-bgl-muted">{point.month}</span>
          <div className="h-2 rounded-full bg-bgl-cream">
            <div
              className="h-2 rounded-full bg-bgl-moss"
              style={{ width: `${Math.max((point.revenue / max) * 100, 3)}%` }}
            />
          </div>
          <span className="text-right text-xs font-semibold text-bgl-ink">
            {Math.round(point.revenue / 1000)}k
          </span>
        </div>
      ))}
    </div>
  );
}
