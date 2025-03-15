import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttendeeEntity, CertificateEntity, CommentEntity,
  Community_Help_RequestEntity,
  EventEntity,
  OtpEntity,
  ProfileEntity,
  SessionEntity, TeamEntity,
  UserEntity,
} from './user.entity';
import { MapperService } from './mapper.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './auth/token_blacklist.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailerService } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity, OtpEntity, ProfileEntity, EventEntity,
      Community_Help_RequestEntity, AttendeeEntity, CommentEntity, TeamEntity, CertificateEntity]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CUSTOM_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, MapperService, JwtService, TokenBlacklistService],
  exports: [UserService], // If you don't add this, it will provide an error
})
export class UserModule {}
