import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppErrors';

import IClientsRepository from '../repositories/IClientsRepository';
import ICreateClientDTO from '../dtos/ICreateClientDTO';
import IAddressProvider from '../providers/AddressProvider/models/IAddressProvider';

@injectable()
class CreateClientService {
  constructor(
    @inject('ClientsRepository')
    private clientsRepository: IClientsRepository,

    @inject('AddressProvider')
    private addressProvider: IAddressProvider,
  ) {}

  public async run(
    userData: ICreateClientDTO,
  ): Promise<ICreateClientDTO & { id: string }> {
    const checkClientExists = await this.clientsRepository.findByEmailCpf(
      userData.email,
      userData.cpf,
    );

    if (
      checkClientExists &&
      JSON.parse(JSON.stringify(checkClientExists?.toJSON())).id
    ) {
      throw new AppError('Email or cpf already used');
    }

    const address = await this.addressProvider.findAddress(
      `${userData.address.postal_code}`,
    );

    Object.assign(userData, {
      city: address?.localidade ? address.localidade : userData.address.city,
      neighborhood: address?.bairro
        ? address.bairro
        : userData.address.neighborhood,
      street: address?.logradouro
        ? address.logradouro
        : userData.address.street,
      postal_code: userData.address.postal_code,
      street_number: userData.address.street_number,
      complement: userData.address.complement,
    });

    const client = await this.clientsRepository.create(userData);
    const {
      cpf,
      id,
      city,
      complement,
      email,
      neighborhood,
      postal_code,
      street,
      street_number,
    } = JSON.parse(JSON.stringify(client?.toJSON()));

    const clientCreated: ICreateClientDTO & { id: string } = {
      id,
      cpf,
      email,
      address: {
        city,
        complement,
        neighborhood,
        postal_code: parseInt(postal_code, 10),
        street,
        street_number,
      },
    };

    return clientCreated;
  }
}

export default CreateClientService;
