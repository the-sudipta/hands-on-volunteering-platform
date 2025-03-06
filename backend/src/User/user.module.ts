import { Module } from '@nestjs/common';
// import { SellerController } from './seller.controller';
// import { SellerService } from './seller.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { AddressEntity, BookEntity, FeedbackEntity, OrderEntity, PinCodeEntity, SellerCustomerBookEntity, SellerEntity } from './seller.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserEntity } from './user.entity';
// import { CustomerEntity } from 'src/moderator/moderator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: 'SMTP_MAILER_ID_HERE',
          pass: 'MAILER_SERVICE_USABLE_PASSWORD_HERE',
        },
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class UserModule {}
