import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async facebookLogin(dto: FacebookLoginDto) {
    const userInfo = await this.fetchFacebookProfile(dto.accessToken);
    const email = userInfo.email;
    if (!email) {
      throw new UnauthorizedException('Facebook profile missing email');
    }

    // Fix encoding issues with name - ensure proper UTF-8 handling
    let fullName = userInfo.name || email;
    if (userInfo.name) {
      // Try to fix double-encoding issues
      try {
        // If name appears to be incorrectly encoded, try to fix it
        const decoded = decodeURIComponent(escape(userInfo.name));
        // Check if decoding helped (if it's different, it was likely double-encoded)
        if (decoded !== userInfo.name && decoded.length > 0) {
          fullName = decoded;
        } else {
          fullName = userInfo.name;
        }
      } catch {
        // If decoding fails, use original name
        fullName = userInfo.name;
      }
    }

    let avatarUrl: string | null = null;
    if (userInfo.picture?.data?.url) {
      avatarUrl = await this.tryDownloadAvatar(userInfo.picture.data.url);
    }

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(randomUUID(), 10);
      user = await this.prisma.user.create({
        data: {
          fullName,
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
    
    // Update fullName if it was updated
    if (user.fullName !== fullName) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { fullName },
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

  private async fetchFacebookProfile(accessToken: string): Promise<{
    email: string;
    name?: string;
    picture?: {
      data: {
        url: string;
      };
    };
  }> {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
    );

    if (!res.ok) {
      throw new UnauthorizedException('Invalid Facebook access token');
    }

    try {
      // Parse JSON response - Node.js fetch should handle UTF-8 automatically
      const data = (await res.json()) as {
        email: string;
        name?: string;
        picture?: {
          data: {
            url: string;
          };
        };
      };
      
      return data;
    } catch (err) {
      throw new InternalServerErrorException('Failed to parse Facebook profile');
    }
  }

  async facebookLoginWithCode(code: string, redirectUri: string) {
    // Exchange code for access token
    const accessToken = await this.exchangeFacebookCode(code, redirectUri);
    
    // Use existing facebookLogin method with access token
    return this.facebookLogin({ accessToken });
  }

  private async exchangeFacebookCode(code: string, redirectUri: string): Promise<string> {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');

    if (!appId || !appSecret) {
      throw new InternalServerErrorException('Facebook App ID or Secret not configured');
    }

    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;

    const res = await fetch(tokenUrl, {
      method: 'GET',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new UnauthorizedException(error.error?.message || 'Failed to exchange Facebook code');
    }

    try {
      const data = (await res.json()) as { access_token: string };
      return data.access_token;
    } catch (err) {
      throw new InternalServerErrorException('Failed to parse Facebook token response');
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
