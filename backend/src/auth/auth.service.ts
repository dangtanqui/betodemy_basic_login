import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
      },
    });

    const token = this.generateToken(user.id);

    return {
      accessToken: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        joinedAt: user.joinedAt,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      accessToken: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        joinedAt: user.joinedAt,
      },
    };
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  async googleLogin(dto: GoogleLoginDto) {
    const userInfo = await this.fetchGoogleProfile(dto.accessToken);
    const email = userInfo.email;
    if (!email) {
      throw new UnauthorizedException('Google profile missing email');
    }

    let avatarUrl: string | null = null;
    if (userInfo.picture) {
      avatarUrl = await this.tryDownloadAvatar(userInfo.picture);
    }

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(randomUUID(), 10);
      user = await this.prisma.user.create({
        data: {
          fullName: userInfo.name || email,
          email,
          passwordHash,
          avatarUrl,
        },
      });
    } else if (!user.avatarUrl && avatarUrl) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });
    }

    const token = this.generateToken(user.id);

    return {
      accessToken: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        joinedAt: user.joinedAt,
      },
    };
  }

  private async fetchGoogleProfile(accessToken: string): Promise<{
    email: string;
    name?: string;
    picture?: string;
  }> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    try {
      return (await res.json()) as {
        email: string;
        name?: string;
        picture?: string;
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to parse Google profile');
    }
  }

  private async tryDownloadAvatar(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type') || '';
      const ext =
        contentType.includes('png') ? '.png' : contentType.includes('jpeg') ? '.jpg' : contentType.includes('webp') ? '.webp' : extname(url) || '.jpg';
      const fileName = `${randomUUID()}${ext}`;
      const buffer = Buffer.from(await res.arrayBuffer());
      const destDir = join(process.cwd(), 'uploads', 'avatars');
      await fs.mkdir(destDir, { recursive: true });
      const dest = join(destDir, fileName);
      await fs.writeFile(dest, buffer);
      return `/uploads/avatars/${fileName}`;
    } catch {
      return null;
    }
  }
}
