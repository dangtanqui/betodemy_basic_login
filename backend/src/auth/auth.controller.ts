import { Controller, Post, Get, Body, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async google(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  async facebook(@Body() dto: FacebookLoginDto) {
    return this.authService.facebookLogin(dto);
  }

  @Get('facebook/callback')
  async facebookCallback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (error) {
      return res.redirect(`${frontendUrl}/auth/facebook/callback?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/auth/facebook/callback?error=${encodeURIComponent('No authorization code received')}`);
    }

    try {
      const redirectUri = `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/auth/facebook/callback`;
      const result = await this.authService.facebookLoginWithCode(code, redirectUri);

      // Redirect to frontend with token in URL
      // Use base64 encoding for user data to avoid URL encoding issues
      // Ensure UTF-8 encoding when creating buffer
      const userJson = JSON.stringify(result.user);
      const userData = Buffer.from(userJson, 'utf-8').toString('base64');
      return res.redirect(
        `${frontendUrl}/auth/facebook/callback?token=${encodeURIComponent(result.accessToken)}&user=${userData}`,
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Facebook login failed';
      return res.redirect(`${frontendUrl}/auth/facebook/callback?error=${encodeURIComponent(errorMessage)}`);
    }
  }
}
