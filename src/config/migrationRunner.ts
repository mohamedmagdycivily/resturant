import { ConfigService, ConfigModule } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { typeOrmConfigAsync } from './config.provider';

const runMigrations = async () => {
  const options = await typeOrmConfigAsync(new ConfigService());
  const dataSourceOptions = {
    ...options,
    type: 'postgres',
  } as DataSourceOptions;
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
};

runMigrations()
// .catch(error => {
//     console.error('Migration failed:', error)
//     throw new Error("exiting");
// });
