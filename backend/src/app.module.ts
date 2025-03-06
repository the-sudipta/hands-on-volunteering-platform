import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './User/user.module';
import { AuthModule } from './User/auth/auth.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
