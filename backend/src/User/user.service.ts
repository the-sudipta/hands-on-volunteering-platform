import {
  // BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity, ProfileEntity, SessionEntity, UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { LoginDTO, UserDto } from './user.dto';
import { MapperService } from './mapper.service';
import { JwtService } from '@nestjs/jwt';

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
        const saved_user =
          await this.profileRepository.save(profileEntity);
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

  async Create_Session(token:string, loginDTO:LoginDTO) : Promise<boolean> {
    try {
      const user = await this.userRepository.findOneBy({ email: loginDTO.email }) as UserEntity;
      const session = new SessionEntity();
      session.jwt_token = token;
      session.expiration_date = null;
      session.user = user as UserEntity;
      const saved_data = await this.sessionRepository.save(session) as SessionEntity;
      return saved_data.id > 0;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
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
      const session = new SessionEntity();
      session.jwt_token = token;
      session.expiration_date = date_time;
      session.user = user as UserEntity;
      const saved_data = await this.sessionRepository.save(session);
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
      const token = await this.extractTokenFromHeader(req) as string;
      const decoded_object_login_dto = await this.decode_token(token);
      // Get the user by the email
      return await this.userRepository.findOneBy({
        email: decoded_object_login_dto.email,
      }) as UserEntity;
    } catch (e) {
      throw new InternalServerErrorException(
        'Get user from request User service error = ' + e.message,
      );
    }
  }

  //endregion Supportive Functions

}
