import { Global, Module } from '@nestjs/common';
import { getConnection, ReplicType } from './connection';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: () => {
        return (replic: ReplicType = ReplicType.MASTER) =>
          getConnection(replic);
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
