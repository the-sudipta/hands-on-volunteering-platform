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

      const nid_existence = await this.userRepository.findOneBy({
        nid: profileEntity.nid,
      }as UserEntity & { nid: string });

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


}
