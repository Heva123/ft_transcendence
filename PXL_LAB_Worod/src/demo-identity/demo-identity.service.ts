import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DemoIdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async requireUser(header: string | undefined): Promise<string> {
    if (!header || !['demo-worod', 'demo-afnan'].includes(header)) {
      throw new UnauthorizedException('Missing or invalid x-demo-user header.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: header }, select: { id: true } });
    if (!user) throw new UnauthorizedException('User not found.');
    return user.id;
  }
}
