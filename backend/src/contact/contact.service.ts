import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

export type ContactListStatus = 'all' | 'unread' | 'read' | 'replied';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    const phone = dto.phone?.trim() || null;
    return this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone,
        message: dto.message.trim(),
      },
    });
  }

  async findAllForAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ContactListStatus;
  }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;
    const search = params.search?.trim();
    const status = params.status ?? 'all';

    const where: Prisma.ContactMessageWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status === 'unread' ? { isRead: false } : {}),
      ...(status === 'read' ? { isRead: true, isReplied: false } : {}),
      ...(status === 'replied' ? { isReplied: true } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async markRead(id: string) {
    const row = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markReplied(id: string) {
    const row = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isReplied: true, isRead: true },
    });
  }

  async remove(id: string) {
    const row = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Message not found');
    await this.prisma.contactMessage.delete({ where: { id } });
    return { ok: true };
  }
}
