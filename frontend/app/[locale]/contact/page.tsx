export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">Iletisim</h1>
      <p>Telefon: +90 500 000 00 00</p>
      <p>E-posta: info@savaskara.com</p>
      <iframe
        title="map"
        className="h-72 w-full rounded-xl border"
        src="https://maps.google.com/maps?q=antalya&t=&z=10&ie=UTF8&iwloc=&output=embed"
      />
    </main>
  );
}
