import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ReservationStatus, User, Bungalow, ContactMessage } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { PrismaService } from '../prisma/prisma.service';
import { SiteService } from '../site/site.service';
import { decryptSmtpPassword, encryptSmtpPassword } from './email-crypto';

/** E-posta sablonlarinda kullanilan alanlar (Prisma `include` ile uyumlu). */
export type ReservationMailContext = {
  id: string;
  bungalowId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: { toString(): string } | string | number;
  status: ReservationStatus;
  user: Pick<User, 'name' | 'email'>;
  bungalow: Pick<Bungalow, 'title' | 'location'>;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly siteService: SiteService,
  ) {}

  private getFrontendOrigin(): string {
    const origins = (process.env.FRONTEND_URL ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return origins.find((o) => o.includes(':3001')) ?? origins[0] ?? 'http://localhost:3000';
  }

  private formatYmd(d: Date): string {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private paymentResumeUrl(r: ReservationMailContext, locale = 'tr'): string {
    const base = this.getFrontendOrigin().replace(/\/$/, '');
    const q = new URLSearchParams({
      bungalowId: r.bungalowId,
      checkIn: this.formatYmd(r.checkIn),
      checkOut: this.formatYmd(r.checkOut),
      guests: String(r.guests),
    });
    return `${base}/${locale}/payment?${q.toString()}`;
  }

  private async loadSettings() {
    return this.prisma.emailSettings.findUnique({ where: { id: 'default' } });
  }

  private async buildTransport(): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null> {
    const row = await this.loadSettings();
    if (!row?.enabled || !row.host || !row.fromEmail) {
      return null;
    }
    const pass = row.passwordEnc ? decryptSmtpPassword(row.passwordEnc) : '';
    const opts: SMTPTransport.Options = {
      host: row.host,
      port: row.port,
      secure: row.secure,
      auth: row.authUser ? { user: row.authUser, pass } : undefined,
    };
    try {
      return nodemailer.createTransport(opts);
    } catch (e) {
      this.logger.warn(`SMTP transport olusturulamadi: ${e instanceof Error ? e.message : e}`);
      return null;
    }
  }

  private async send(to: string, subject: string, text: string, html?: string) {
    const row = await this.loadSettings();
    if (!row?.enabled) return;
    const transport = await this.buildTransport();
    if (!transport) return;
    const from = row.fromName
      ? `"${row.fromName.replace(/"/g, '')}" <${row.fromEmail}>`
      : row.fromEmail;
    try {
      await transport.sendMail({
        from,
        to,
        subject,
        text,
        html: html ?? text.replace(/\n/g, '<br/>'),
      });
    } catch (e) {
      this.logger.warn(`E-posta gonderilemedi (${to}): ${e instanceof Error ? e.message : e}`);
    }
  }

  async getPublicSettings() {
    const row = await this.loadSettings();
    if (!row) {
      return {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        authUser: '',
        fromName: '',
        fromEmail: '',
        notifyAdminOnNewReservation: true,
        notifyAdminOnContact: true,
        adminNotifyEmail: null as string | null,
        hasPassword: false,
      };
    }
    return {
      enabled: row.enabled,
      host: row.host,
      port: row.port,
      secure: row.secure,
      authUser: row.authUser,
      fromName: row.fromName,
      fromEmail: row.fromEmail,
      notifyAdminOnNewReservation: row.notifyAdminOnNewReservation,
      notifyAdminOnContact: row.notifyAdminOnContact,
      adminNotifyEmail: row.adminNotifyEmail,
      hasPassword: Boolean(row.passwordEnc),
    };
  }

  async updateSettings(input: {
    enabled?: boolean;
    host?: string;
    port?: number;
    secure?: boolean;
    authUser?: string;
    password?: string;
    fromName?: string;
    fromEmail?: string;
    notifyAdminOnNewReservation?: boolean;
    notifyAdminOnContact?: boolean;
    adminNotifyEmail?: string | null;
  }) {
    const existing = await this.loadSettings();
    let passwordEnc = existing?.passwordEnc ?? '';
    if (input.password !== undefined && input.password !== '') {
      passwordEnc = encryptSmtpPassword(input.password);
    }
    const data = {
      enabled: input.enabled ?? existing?.enabled ?? false,
      host: input.host ?? existing?.host ?? '',
      port: input.port ?? existing?.port ?? 587,
      secure: input.secure ?? existing?.secure ?? false,
      authUser: input.authUser ?? existing?.authUser ?? '',
      passwordEnc,
      fromName: input.fromName ?? existing?.fromName ?? '',
      fromEmail: input.fromEmail ?? existing?.fromEmail ?? '',
      notifyAdminOnNewReservation:
        input.notifyAdminOnNewReservation ?? existing?.notifyAdminOnNewReservation ?? true,
      notifyAdminOnContact: input.notifyAdminOnContact ?? existing?.notifyAdminOnContact ?? true,
      adminNotifyEmail:
        input.adminNotifyEmail !== undefined ? input.adminNotifyEmail : existing?.adminNotifyEmail ?? null,
    };
    await this.prisma.emailSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    });
    return this.getPublicSettings();
  }

  async sendTest(to: string) {
    const row = await this.loadSettings();
    if (!row?.enabled) {
      throw new BadRequestException('E-posta gonderimi kapali.');
    }
    const transport = await this.buildTransport();
    if (!transport) {
      throw new BadRequestException('SMTP host veya gonderen e-posta (from) eksik.');
    }
    const from = row.fromName
      ? `"${row.fromName.replace(/"/g, '')}" <${row.fromEmail}>`
      : row.fromEmail;
    const text =
      'Bu mesaj yonetim panelindeki SMTP ayarlarinin calistigini dogrular.\n\nTarih: ' + new Date().toISOString();
    try {
      await transport.sendMail({
        from,
        to,
        subject: 'Bungalov — SMTP test',
        text,
        html: text.replace(/\n/g, '<br/>'),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`SMTP test basarisiz: ${msg}`);
      throw new BadRequestException(`SMTP hatasi: ${msg}`);
    }
    return { ok: true };
  }

  async notifyReservationPending(r: ReservationMailContext, locale = 'tr') {
    const row = await this.loadSettings();
    if (!row?.enabled) return;
    const url = this.paymentResumeUrl(r, locale);
    const total = Number(r.totalPrice).toFixed(2);
    const subject = `Rezervasyon alindi — ${r.bungalow.title}`;
    const text = `Merhaba ${r.user.name},

Rezervasyonunuz olusturuldu (odeme bekleniyor).

Bungalov: ${r.bungalow.title}
Konum: ${r.bungalow.location}
Giris: ${this.formatYmd(r.checkIn)}
Cikis: ${this.formatYmd(r.checkOut)}
Misafir: ${r.guests}
Tutar: ${total} TL

Odemeyi tamamlamak icin asagidaki baglantiyi kullanabilirsiniz:
${url}

Bu e-postayi siz talep etmediyseniz lutfen dikkate almayin.
`;
    await this.send(r.user.email, subject, text);
  }

  async notifyReservationPaid(r: ReservationMailContext, locale = 'tr') {
    const row = await this.loadSettings();
    if (!row?.enabled) return;
    const base = this.getFrontendOrigin().replace(/\/$/, '');
    const resultUrl = `${base}/${locale}/reservation/result?reservationId=${r.id}`;
    const total = Number(r.totalPrice).toFixed(2);
    const subject = `Odeme onaylandi — ${r.bungalow.title}`;
    const text = `Merhaba ${r.user.name},

Rezervasyonunuz onaylandi ve odeme alindi.

Bungalov: ${r.bungalow.title}
Konum: ${r.bungalow.location}
Giris: ${this.formatYmd(r.checkIn)}
Cikis: ${this.formatYmd(r.checkOut)}
Misafir: ${r.guests}
Odenen tutar: ${total} TL

Rezervasyon ozeti: ${resultUrl}

Iyi tatiller dileriz.
`;
    await this.send(r.user.email, subject, text);
  }

  async notifyAdminNewReservation(r: ReservationMailContext) {
    const row = await this.loadSettings();
    if (!row?.enabled || !row.notifyAdminOnNewReservation) return;
    const branding = await this.siteService.getBranding();
    const adminTo = row.adminNotifyEmail?.trim() || branding.contactEmail;
    if (!adminTo) return;
    const subject = `[Bungalov] Yeni rezervasyon — ${r.bungalow.title}`;
    const text = `Yeni rezervasyon

Misafir: ${r.user.name} <${r.user.email}>
Bungalov: ${r.bungalow.title}
Durum: ${r.status}
Giris: ${this.formatYmd(r.checkIn)} / Cikis: ${this.formatYmd(r.checkOut)}
Tutar: ${Number(r.totalPrice).toFixed(2)} TL
Rezervasyon ID: ${r.id}
`;
    await this.send(adminTo, subject, text);
  }

  async notifyAdminContactMessage(msg: ContactMessage) {
    const row = await this.loadSettings();
    if (!row?.enabled || !row.notifyAdminOnContact) return;
    const branding = await this.siteService.getBranding();
    const adminTo = row.adminNotifyEmail?.trim() || branding.contactEmail;
    if (!adminTo) return;
    const subject = `[Bungalov] Iletisim formu — ${msg.name}`;
    const text = `Gonderen: ${msg.name}
E-posta: ${msg.email}
Telefon: ${msg.phone ?? '-'}

Mesaj:
${msg.message}
`;
    await this.send(adminTo, subject, text);
  }
}
