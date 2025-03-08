import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OtpEntity,
  ProfileEntity,
  SessionEntity,
  UserEntity,
} from './user.entity';
import { Repository } from 'typeorm';
import { LoginDTO, User_ProfileDTO, UserDto } from './user.dto';
import { MapperService } from './mapper.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

// import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

// import { User_ProfileDTO, UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,

    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,

    private mailerService: MailerService,
    private mapperService: MapperService,
    private jwtService: JwtService,
  ) {}

  get_service(): string {
    return 'UserService is working!';
  }

  async Create_Signup(signup_info: LoginDTO): Promise<any> {
    const user = this.mapperService.dtoToEntity(signup_info, UserEntity);
    const previous_data = await this.userRepository.findOneBy({
      email: user.email,
    });
    if (previous_data === null) {
      const saved_user = await this.userRepository.save(user);
      return saved_user.id;
    } else {
      return -1;
    }
  }

  async Create_UserProfile(profile_info_dto: UserDto): Promise<any> {
    try {
      const profileEntity = this.mapperService.dtoToEntity(
        profile_info_dto,
        ProfileEntity,
      );

      const user = await this.userRepository.findOneBy({
        id: profile_info_dto.user_id,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      profileEntity.user = user;

      const nid_existence = await this.profileRepository.findOneBy({
        nid: profileEntity.nid,
      });

      if (nid_existence == null) {
        const saved_user = await this.profileRepository.save(profileEntity);
        return saved_user ? saved_user.id : -1;
      } else {
        throw new InternalServerErrorException('NID Already exists');
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'User Service, Create User Error = ' + e.message,
      );
    }
  }

  async Login(login_info: LoginDTO): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOneBy({
        email: login_info.email,
      });
      if (user != null) {
        return user;
      } else {
        throw new NotFoundException('There is no user using this email');
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async Create_Session(token: string, loginDTO: LoginDTO): Promise<boolean> {
    try {
      const user = (await this.userRepository.findOneBy({
        email: loginDTO.email,
      })) as UserEntity;
      const session = new SessionEntity();
      session.jwt_token = token;
      session.expiration_date = null;
      session.user = user as UserEntity;
      const saved_data = (await this.sessionRepository.save(
        session,
      )) as SessionEntity;
      return saved_data.id > 0;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async Update_Password(req: Request, password: string): Promise<any> {
    try {
      const user = await this.get_user_from_Request(req);
      console.log('Update Password header Request  user email = ' + user.email);
      const update = await this.userRepository.update(user.id, {
        password: password,
      });
      console.log('Update result:', update);
      return update.affected;
    } catch (e) {
      throw new InternalServerErrorException(
        'Update Password User Service error = ' + e.message,
      );
    }
  }

  async ForgetPassword(email: string) {
    try {
      const user = await this.userRepository.findOneBy({ email: email });
      if (user != null) {
        //   Generate OTP
        const OTP = await this.Generate_OTP();
        const user_has_pin = await this.otpRepository.findOneBy({ user: user });
        if (user_has_pin) {
          console.log('Okay, Already have OTP. Needs to be updated');
          await this.otpRepository.update(user_has_pin.id, { otp: OTP });
          const user_has_pin_updated = await this.otpRepository.findOneBy({
            user: user,
          });
          console.log('Updated OTP = ' + (user_has_pin_updated?.otp ?? 'N/A'));
        } else {
          const new_otp = new OtpEntity();
          new_otp.id = -1;
          new_otp.otp = OTP;
          new_otp.user = user;
          const saved_data = await this.otpRepository.save(new_otp);
          console.log('New OTP = ' + saved_data.otp);
        }

        //   Send the OTP through email
        const body =
          (await process.env.EMAIL_BODY_P1) + OTP + process.env.EMAIL_BODY_P2;
        await this.Send_Email(email, process.env.EMAIL_SUBJECT as string, body);
        const new_token = await new LoginDTO();
        new_token.email = email;
        new_token.password = 'temp';
        console.log('Email Sending Done');
        return await this.create_token(new_token);
      } else {
        return false;
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'Forget Password Service Error = ' + e.message,
      );
    }
  }

  async otp_verification(req: Request, otp: string): Promise<any> {
    try {
      // Get the user by the email
      const user = await this.get_user_from_Request(req);
      console.log('Got the user = ' + user.email);
      //   Get the saved otp for the user
      const saved_otp_row_for_user = await this.otpRepository.findOneBy({
        user: user,
      });
      console.log('User provided otp = ' + otp);
      console.log('Saved OTP = ' + (saved_otp_row_for_user?.otp ?? 'N/A'));

      if (!saved_otp_row_for_user) {
        throw new Error('Failed to save OTP. Entry not found.');
      }
      if (saved_otp_row_for_user.otp === otp) {
        console.log('OTP Matched! Changing the OTP Expiration Date');
        const current_time = await this.get_current_timestamp();
        const decision = await this.otpRepository.update(
          saved_otp_row_for_user.id,
          { expiration_date: current_time },
        );
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'OTP verification service error = ' + e.message,
      );
    }
  }

  async Update_Own_Profile_Details(
    email: string,
    updated_data: User_ProfileDTO,
  ): Promise<any> {
    try {
      const previous_data = await this.Find_User_Profile_By_Email(email);
      const previous_user = await this.userRepository.findOneBy({
        email: email,
      }) as UserEntity;

      // If email Got Updated
      if (
        previous_data.email != updated_data.email &&
        updated_data.email != null &&
        updated_data.email != ''
      ) {
        await this.userRepository.update(previous_data.id, {
          email: updated_data.email,
        });
      }

      //   If name Got Updated
      if (
        previous_data.name != updated_data.name &&
        updated_data.name != null &&
        updated_data.name != ''
      ) {
        await this.profileRepository.update(previous_user.id, {
          name: updated_data.name,
        });
      }

      //   If nid Got Updated
      if (
        previous_data.nid != updated_data.nid &&
        updated_data.nid != null &&
        updated_data.nid != ''
      ) {
        await this.profileRepository.update(previous_user.id, {
          nid: updated_data.nid,
        });
      }

      //   If phone Got Updated
      if (
        previous_data.phone != updated_data.phone &&
        updated_data.phone != null &&
        updated_data.phone != ''
      ) {
        await this.profileRepository.update(previous_user.id, {
          phone: updated_data.phone,
        });
      }

      return updated_data;
    } catch (e) {
      return new InternalServerErrorException(e.message);
    }
  }

  //region JWT Functionalities

  async addToBlacklist(
    token: string,
    date_time: string,
    email: string,
  ): Promise<any> {
    try {
      const user = await this.userRepository.findOneBy({ email: email });

      const current_session = (await this.sessionRepository.findOneBy({
        jwt_token: token,
      })) as SessionEntity;
      current_session.expiration_date = date_time;
      const saved_data = await this.sessionRepository.save(current_session);
      return saved_data.id > 0;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async get_token_by_token(token: string): Promise<any> {
    try {
      return await this.sessionRepository.findOneBy({ jwt_token: token });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async create_token(payload: LoginDTO): Promise<any> {
    try {
      const payloadObject = instanceToPlain(payload);
      return {
        access_token: await this.jwtService.signAsync(payloadObject, {
          secret: process.env.JWT_CUSTOM_SECRET, // Provide the same secret key used for OTP verification
        }),
      };
    } catch (e) {
      throw new InternalServerErrorException(
        'Create Token Service Error = ' + e.message,
      );
    }
  }

  async decode_token(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_CUSTOM_SECRET,
      });
      return decoded;
    } catch (error) {
      // Handle decoding error
      throw new Error('Failed to decode token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    try {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    } catch (e) {
      throw new InternalServerErrorException(
        'extract Token From Header User service error = ' + e.message,
      );
    }
  }

  //endregion JWT Functionalities

  //region Supportive Functions

  async get_user_from_Request(req: Request): Promise<UserEntity> {
    try {
      const token = (await this.extractTokenFromHeader(req)) as string;
      const decoded_object_login_dto = await this.decode_token(token);
      // Get the user by the email
      return (await this.userRepository.findOneBy({
        email: decoded_object_login_dto.email,
      })) as UserEntity;
    } catch (e) {
      throw new InternalServerErrorException(
        'Get user from request User service error = ' + e.message,
      );
    }
  }

  async Send_Email(
    emailTo: string,
    emailSubject: string,
    emailBody: string,
  ): Promise<any> {
    try {
      return await this.mailerService.sendMail({
        to: emailTo,
        subject: emailSubject,
        text: emailBody,
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async Generate_OTP(): Promise<any> {
    return (Math.floor(Math.random() * 900000) + 100000).toString();
  }

  async updateUser_SingleInfo(id: number, column: string, data: any) {
    const updateData = {};
    updateData[column] = data;

    await this.userRepository.update(id, updateData);
  }

  async user_validity(email: string, password: string): Promise<boolean> {
    try {
      const saved_user = await this.userRepository.findOneBy({ email: email });
      if (!saved_user) {
        return false; // User not found, return false
      }

      return await bcrypt.compare(password, saved_user.password);
    } catch (e) {
      throw new InternalServerErrorException(
        'User Service, user validity Error = ' + e.message,
      );
    }
  }

  async get_current_timestamp(): Promise<string> {
    return new Date().toISOString();
  }

  async Find_User_Profile_By_Email(email: string): Promise<any> {
    const user_data = await this.userRepository.findOneBy({ email: email });

    if (!user_data) {
      throw new Error('User data is null. Cannot fetch profile.');
    }
    //   Convert to customer Profile

    return await this.profileRepository.findOneBy({ user: user_data });
  }

  //endregion Supportive Functions
}
