import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens: Set<string> = new Set();

  constructor(private userService: UserService) {}

  async addToBlacklist(email: string, token: string): Promise<any> {
    try {
      const currentDate = new Date();
      const dateString = currentDate.toISOString(); // Convert date to ISO string

      const decision = await this.userService.addToBlacklist(
        token,
        dateString,
        email,
      );

      if (decision) {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    // Fetch token details from the database
    const data = await this.userService.get_token_by_token(token);

    // Check if the expiration_date is NOT null
    return data?.expiration_date !== null;
  }

}
