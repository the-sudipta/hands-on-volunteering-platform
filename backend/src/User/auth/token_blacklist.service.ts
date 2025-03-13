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
    const data = await this.userService.get_token_row_by_token(token);

    // Check if the expiration_date is NOT null
    return data?.expiration_date !== null;
  }

  async blacklistTemporaryJWT(token: string): Promise<boolean> {
    try {
      console.log('Blacklisting temporary JWT:', token);
      this.blacklistedTokens.add(token); // Store the token in memory

      if (await this.isTempTokenBlacklisted(token)){
        return true;
      }else{
        return false;
      }
    } catch (e) {
      console.error('Error blacklisting temporary JWT:', e.message);
      return false;
    }
  }

  // 🔍 Check if a temporary JWT is blacklisted
  async isTempTokenBlacklisted(token: string): Promise<boolean> {
    return this.blacklistedTokens.has(token);
  }



}
