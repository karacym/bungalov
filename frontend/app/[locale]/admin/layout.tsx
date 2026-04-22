export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-bgl-mist/60 bg-gradient-to-b from-bgl-cream/90 via-white/40 to-bgl-cream/30 pb-24 pt-2">
      {children}
    </div>
  );
}
