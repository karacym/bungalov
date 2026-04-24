import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  Globe,
  Home,
  Image,
  Languages,
  LayoutDashboard,
  Mail,
  NotebookPen,
  Settings,
  Users,
} from 'lucide-react';
import type { AdminMenuKey } from '@/modules/admin/types';

export const ADMIN_MENU: Array<{
  key: AdminMenuKey;
  icon: typeof LayoutDashboard;
}> = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'bungalows', icon: Home },
  { key: 'reservations', icon: FileText },
  { key: 'calendar', icon: CalendarDays },
  { key: 'payments', icon: CreditCard },
  { key: 'users', icon: Users },
  { key: 'media', icon: Image },
  { key: 'pages', icon: NotebookPen },
  { key: 'content', icon: Globe },
  { key: 'translations', icon: Languages },
  { key: 'reports', icon: BarChart3 },
  { key: 'contact', icon: Mail },
  { key: 'settings', icon: Settings },
];
