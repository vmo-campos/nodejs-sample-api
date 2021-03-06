import { container } from 'tsyringe';

import '@modules/users/providers';

import IClientsRepository from '../../modules/users/repositories/IClientsRepository';
import ClientRepository from '../../modules/users/infra/sequelize/repositories/ClientRepository';

container.registerSingleton<IClientsRepository>(
  'ClientsRepository',
  ClientRepository,
);
