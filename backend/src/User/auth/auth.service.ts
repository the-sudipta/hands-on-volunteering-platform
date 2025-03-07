import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { UserService } from '../user.service';
import { LoginDTO } from '../user.dto';
import { Request } from 'express';
import { TokenBlacklistService } from './token_blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async signUp(myObj: LoginDTO): Promise<any> {
    return await this.userService.Create_Signup(myObj);
  }


  async signIn(logindata: LoginDTO): Promise<{ access_token: string }> {
    const user = await this.userService.Login(logindata);
    if (!user) {
      throw new UnauthorizedException('Email is incorrect');
    }
    if (!(await bcrypt.compare(logindata.password, user.password))) {
      throw new UnauthorizedException('Password is incorrect');
    }
    const payload = logindata;
    const jwt = await this.jwtService.signAsync(payload) as string;
    const decision = this.userService.Create_Session(jwt, logindata);
    if (!decision) {
      throw new UnauthorizedException('Something went wrong. Could not create the session.');
    }
    return {
      access_token: jwt,
    };
  }

  async logout(email: string, token: string): Promise<any> {
    try {
      // Blacklist the token
      const decision = await this.tokenBlacklistService.addToBlacklist(
        email,
        token,
      );

      if (decision != null) {
        return decision;
      } else {
        throw new InternalServerErrorException(
          'Problem in Token Blacklist Service',
        );
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async UpdatePassword(req: Request, password: string): Promise<any> {
    try {
      const decision = await this.userService.Update_Password(
        req,
        password,
      );
      if (decision !== null) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'Update Password Auth Service error = ' + e.message,
      );
    }
  }





  //region JWT Functionalities

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async destroy_temporary_JWT(req: Request): Promise<any> {
    try {
      const token = await this.extractTokenFromHeader(req) as string;

      const user = await this.userService.get_user_from_Request(req) as any;

      // Blacklist the token
      const decision = await this.tokenBlacklistService.addToBlacklist(
        user.email,
        token,
      );

      if (decision != null) {
        return decision;
      } else {
        throw new InternalServerErrorException(
          'Problem in Token Blacklist Service',
        );
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  //endregion JWT Functionalities

  //region Supporting Functions





  //endregion Supporting Functions




}
