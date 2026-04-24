import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bungalow, Reservation, RevenuePoint } from './types';

type Props = {
  reservations: Reservation[];
  bungalows: Bungalow[];
  revenueData: RevenuePoint[];
};

export function ReportsModule({ reservations, bungalows, revenueData }: Props) {
  const totalRevenue = reservations
    .filter((item) => item.status === 'approved')
    .reduce((sum, item) => sum + item.amount, 0);
  const occupancyRate = bungalows.length
    ? Math.min(Math.round((reservations.length / (bungalows.length * 30)) * 100), 100)
    : 0;
  const byBungalow = reservations.reduce<Record<string, number>>((acc, item) => {
    acc[item.bungalowName] = (acc[item.bungalowName] ?? 0) + 1;
    return acc;
  }, {});
  const mostBooked = Object.entries(byBungalow).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Aylik ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-bgl-ink">{totalRevenue.toLocaleString('tr-TR')} TL</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doluluk orani</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-bgl-ink">{occupancyRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>En cok rezerve edilen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-bgl-ink">{mostBooked}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Ciro dagilimi (12 ay)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {revenueData.map((point) => (
              <div key={point.month} className="grid grid-cols-[30px_1fr_80px] items-center gap-2">
                <span className="text-xs text-bgl-muted">{point.month}</span>
                <div className="h-2 rounded-full bg-bgl-cream">
                  <div
                    className="h-2 rounded-full bg-bgl-moss"
                    style={{ width: `${Math.min((point.revenue / Math.max(totalRevenue, 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-right text-xs font-semibold text-bgl-ink">
                  {Math.round(point.revenue / 1000)}k
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
