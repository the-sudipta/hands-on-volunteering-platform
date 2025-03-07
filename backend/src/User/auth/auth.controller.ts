import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterError, diskStorage } from "multer";
import * as bcrypt from 'bcrypt';
import { LoginDTO } from '../user.dto';
import { AuthGuard } from './auth.guard';

@Controller('api/user/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/index')
  // @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  getIndex(): any {
    return 'Relax! User Auth is working.';
  }

  @Post('/signup')
  // @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  async Signup(@Body() signup_info: LoginDTO): Promise<any> {
    try {
      signup_info.password = await bcrypt.hash(signup_info.password, 12);

      const user_id = await this.authService.signUp(signup_info);
      if (user_id < 0) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Email Already Exists',
        });
      } else {
        return user_id;
      }
    } catch (e) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: e.message,
      });
    }
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  @UsePipes(new ValidationPipe())
  async Login(@Body() login_info: LoginDTO): Promise<any> {
    return await this.authService.signIn(login_info);
  }

  @Get('/logout')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async Logout(@Request() req): Promise<any> {
    try {
      const token = await this.authService.extractTokenFromHeader(req);
      if (token != null && token != '') {
        return await this.authService.logout(req.user.email, token);
      } else {
        throw new BadRequestException(
          'Please provide the token inside header, along with the request',
        );
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }




}
