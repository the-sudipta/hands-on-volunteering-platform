import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './User/user.module';
import { AuthModule } from './User/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432', 10),
      username: process.env.PGUSER, // process.env => means .env file of your folder
      password: process.env.PGPASSWORD, //Change to your Password
      database: process.env.PGDATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),

    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST, // SMTP relay host
        port: parseInt(process.env.MAILER_PORT || '587', 10), // Port for TLS (STARTTLS)
        secure: false, // ✅ Must be false for STARTTLS on port 587
        auth: {
          user: process.env.MAILER_USER, // SMTP username
          pass: process.env.MAILER_PASSWORD, // SMTP password
        },
      },
      defaults: {
        from: `"VolunteerConnect" <${process.env.MAILER_USER}>`, // ✅ Explicitly set "from" email
      },
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
