import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity, ProfileEntity, SessionEntity, UserEntity } from './user.entity';
import { MapperService } from './mapper.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './auth/token_blacklist.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity, OtpEntity, ProfileEntity]),
    JwtModule.register({
      global: true,
      secret: 'mySecretKey123!@#',
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, MapperService, JwtService, TokenBlacklistService],
  exports: [UserService], // If you don't add this, it will provide an error
})
export class UserModule {}
