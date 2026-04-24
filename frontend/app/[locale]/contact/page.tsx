import { ContactView } from '@/components/contact-view';
import { getSiteBranding } from '@/lib/site-branding';

export default async function ContactPage() {
  const branding = await getSiteBranding();
  return <ContactView contactPhone={branding.contactPhone} contactEmail={branding.contactEmail} />;
}