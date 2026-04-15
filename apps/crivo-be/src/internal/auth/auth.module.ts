import { Module } from '@nestjs/common';
import { AuthDevController } from './infrastructure/http/auth-dev.controller';

@Module({
  controllers: [AuthDevController],
})
export class AuthInternalModule {}
