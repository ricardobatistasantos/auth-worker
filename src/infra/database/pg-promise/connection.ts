import pgPromise from 'pg-promise';
import * as monitor from 'pg-monitor';

export const initOptions = {};
const pgp = pgPromise(initOptions);

export enum ReplicType {
  MASTER = 'master',
}

const replics = {
  master: {
    host: process.env.HOST_DATABASE,
    port: Number(process.env.PORT_DATABASE),
    database: process.env.POSTGRES_DB,
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
  },
  slave: {},
};

const connections = {
  [ReplicType.MASTER]: <pgPromise.IMain>null,
};

monitor.attach(initOptions);
monitor.setTheme('matrix');

export function getConnection(replic: ReplicType = ReplicType.MASTER) {
  try {
    if (!connections[replic]) {
      connections[replic] = pgp(replics[replic]);
    }
    return connections[replic];
  } catch (error) {
    throw error;
  }
}
