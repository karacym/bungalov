export default function ContactPage() {
  return (
    <main className="pb-20">
      <div className="border-b border-bgl-mist/80 bg-white/70">
        <div className="bgl-container py-12 md:py-16">
          <p className="bgl-section-title">Bize ulasin</p>
          <h1 className="bgl-heading mt-2">Iletisim</h1>
          <p className="mt-3 max-w-2xl text-sm text-bgl-muted md:text-base">
            Rezervasyon ve sorulariniz icin mesai saatleri icinde yanit veriyoruz.
          </p>
        </div>
      </div>
      <div className="bgl-container mt-10 grid gap-8 md:grid-cols-2 md:mt-14">
        <div className="bgl-card p-8">
          <h2 className="text-lg font-semibold text-bgl-ink">Iletisim bilgileri</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">Telefon</dt>
              <dd className="mt-1 font-medium text-bgl-ink">+90 500 000 00 00</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-bgl-muted">E-posta</dt>
              <dd className="mt-1 font-medium text-bgl-ink">info@savaskara.com</dd>
            </div>
          </dl>
        </div>
        <div className="bgl-card overflow-hidden shadow-soft">
          <iframe
            title="map"
            className="h-full min-h-[280px] w-full md:min-h-[320px]"
            src="https://maps.google.com/maps?q=Sapanca+Turkey&t=&z=10&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
          />
        </div>
      </div>
    </main>
  );
}
