import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens: Set<string> = new Set();

  constructor(private userService: UserService) {}


}
