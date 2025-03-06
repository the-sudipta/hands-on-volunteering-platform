import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  Put,
  NotFoundException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ForgetPasswordDTO,
  OTP_ReceiverDTO,
  User_ProfileDTO,
  UserDto,

} from './user.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterError } from 'multer';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    // Empty Constructor
  }

  @Get('/index')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  getIndex(): any {
    return 'Relax! User is Alive.';
  }
  @Get('/user_service')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  getService(): any {
    return this.userService.get_service();
  }


  @Post('/signup/user_details')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  async customer_Details_Create(
    @Body() user_info: UserDto,
  ): Promise<any> {
    try {
      const saved_customer =
        await this.userService.Create_UserProfile(user_info);
      if (saved_customer > 0) {
        return saved_customer;
      } else {
        throw new InternalServerErrorException(
          'customer data could not be saved',
        );
      }
    } catch (e) {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: e.message,
      });
    }
  }

















}
