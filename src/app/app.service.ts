import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
@Injectable()
export class AppService implements OnApplicationBootstrap{
  constructor(){}
  async onApplicationBootstrap() {
  }
}
