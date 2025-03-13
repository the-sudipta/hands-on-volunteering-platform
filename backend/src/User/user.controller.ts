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
  async user_Details_Create(
    @Body() user_info: UserDto,
  ): Promise<any> {
    try {
      const saved_user =
        await this.userService.Create_UserProfile(user_info);
      if (saved_user > 0) {
        return saved_user;
      } else {
        throw new InternalServerErrorException(
          'User data could not be saved',
        );
      }
    } catch (e) {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: e.message,
      });
    }
  }


  @Post('/forget_password')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  async Forget_Password(
    @Body() forgetPassword_DTO: ForgetPasswordDTO,
  ): Promise<any> {
    try {
      const decision = await this.userService.ForgetPassword(
        forgetPassword_DTO.email,
      );
      if (decision != false) {
        return decision;
      } else {
        throw new NotFoundException('Data not found');
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('/otp')
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  async OTP_Verification(
    @Request() req,
    @Body() OTP_Object: OTP_ReceiverDTO,
  ): Promise<any> {
    // console.log('Request Headers:', req.headers);
    console.log('Received OTP in Controller = ',OTP_Object.otp);
    console.log('Received Req in Controller = ',req);
    try {
      // console.log('User provided otp = ' + OTP_Object.otp);
      const decision = await this.userService.otp_verification(
        req,
        OTP_Object.otp,
      );

      if (decision) {
        console.log('Returning True');
        return {
          success: true,
          message: 'OTP verification successful',
        };
      } else {
        console.log('Returning Error');
        throw new BadRequestException('OTP did not matched!');
      }
    } catch (e) {
      throw e;
    }
  }


  @Post('/profile/update')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  async Update_own_Profile(
    @Request() req,
    @Body() updated_data: User_ProfileDTO,
  ): Promise<any> {
    console.log("Received Payload in NestJS:", req.body);
    console.log("Received Headers in NestJS:", req.headers);
    try {
      const update_decision = await this.userService.Update_Own_Profile_Details(
        req.user.email,
        updated_data,
      );
      return {
        success: true,
        message: 'Profile updated successfully',
      };
    } catch (e) {
      console.error("Error in Update_own_Profile:", e.message);
      throw new InternalServerErrorException(e.message);
    }
  }



  @Get('/profile')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK) // Set the status code to 200 (OK)
  async Show_own_Profile(@Request() req): Promise<any> {
    try {
      return await this.userService.Show_My_Profile_Details(req.user.email);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

















}
