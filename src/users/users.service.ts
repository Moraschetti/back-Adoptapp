import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateUserDTO } from './dto/user.dto';
import { checkEmptyValues, checkValues } from 'src/Services/valuesValidation';
import { City } from 'src/city/entities/city.entity';
import { Pet } from 'src/pets/entities/pet.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>
  ) { }

  validValues = ['name', 'surname', 'age', 'email', 'phoneNumber', 'address', 'zipCode', 'hasPet', 'livingPlace'];

  async addUser(userDTO: CreateUserDTO, petId: number): Promise<{ status: number, message: string }> {
    const { name, surname, age, email, phoneNumber, address, zipCode, hasPet, livingPlace} = userDTO;
    try {
      // Check if required values are missing
      if (!checkValues(userDTO, this.validValues)) {
        throw new Error('Required fields missing: name, surname, age, email, phoneNumber, address, zipCode, hasPet, livingPlace.');
      };
      // Check if empty values are not accepted
      if (!checkEmptyValues(userDTO)) {
        throw new Error('Empty fields are not accepted.');
      }
      // Verify the city with its zip code
      const cityCriteria: FindOneOptions = { where: { zip_code: Number(zipCode) } };
      const city = await this.cityRepository.findOne(cityCriteria);
      // If the city doesn't exist, throw an error
      if (!city) {
        throw new Error(`There is no city with zip code ${zipCode}.`);
      }

      if (petId === null) {
        throw new Error('No pet information requested.');
      }

      const petCriteria: FindOneOptions = { where: { id: petId } };
      const existingPet = await this.petRepository.findOne(petCriteria);

      if (!existingPet) {
        throw new Error(`There is no pet with ID ${petId}.`);
      }

      const emailCriteria: FindOneOptions = { where: { email: email }, relations: ['pets'] };
      const user: User = await this.userRepository.findOne(emailCriteria);
      // If user does not exist yet, is created
      if (!user) {

        const newUser: User = new User(name, surname, age, email, phoneNumber, address, hasPet, livingPlace);

        if (!newUser) {
          throw new Error(`Could not get user data.`);
        };
        newUser.city = city;
        newUser.pets = [existingPet];
        existingPet.setInterested();

        await this.userRepository.save(newUser);
        await this.petRepository.save(existingPet);
        return { status: HttpStatus.CREATED, message: `User ${newUser.getSurname()} ${newUser.getName()} was added.` };
      }
      // if user exist, is verified if does not have more than 3 requested pet
      if (user && user.pets.length > 2) {
        return { status: HttpStatus.BAD_REQUEST, message: 'Maximum adoption requests reached.' };
      } else {

        const petRequested = user.pets.map(pet => pet.id);

        if (petRequested.includes(petId)) {
          return { status: HttpStatus.BAD_REQUEST, message: 'You are already registered to adopt this pet.' };
        } else {
          petRequested.push(petId);
        }

        const petCriteria: FindManyOptions = { where: petRequested.map(petId => ({ id: petId })) };
        const requestedPet = await this.petRepository.find(petCriteria);

        user.setInterestedIn(requestedPet);
        existingPet.setInterested();

        await this.userRepository.save(user);
        await this.petRepository.save(existingPet);
        return { status: HttpStatus.OK, message: `${user.getSurname()} ${user.getName()} is interested in adopting another pet.` }
      }
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error adding new user',
        message: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // Function to get all users with their relasionship
  async allUsers(): Promise<User[]> {
    try {
      const criterion: FindManyOptions = { relations: ['pets'] };
      const allUsers: User[] = await this.userRepository.find(criterion);

      if (!allUsers) {
        throw new Error(`Could not get user data.`);
      }
      return allUsers;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Error getting users',
        message: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }
  //Function to get user by ID
  async getUserById(userId: number): Promise<User> {
    try {
      const criterion: FindOneOptions = { relations: ['pets'], where: { id: userId } };
      const user: User = await this.userRepository.findOne(criterion);

      if (!user) {
        throw new Error(`There is no user with ID ${userId}.`);
      }
      return user;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Error getting user',
        message: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }
  // Function to delete user by email
  async deleteUser(userEmail: string): Promise<string> {
    try {
      const criterion: FindOneOptions = { where: { email: userEmail } };
      const user: User = await this.userRepository.findOne(criterion);

      if (!user) {
        throw new Error(`The user does not exist in the database.`);
      }

      const userName = `${user.getSurname()} ${user.getName()}`;
      await this.userRepository.remove(user);

      return `${userName} was deleted from database.`;

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Error getting user',
        message: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }
  //Function to remove a requested pet
  async removePet(userEmail: string, petId: number): Promise<string> {
    try {
      const criterion: FindOneOptions = { where: { email: userEmail }, relations: ['pets'] };
      const user: User = await this.userRepository.findOne(criterion);

      if (!user) {
        throw new Error(`The user does not exist in the database.`);
      }

      const requestedPet = user.pets.map(pet => pet.id);

      if (!requestedPet.includes(petId)) {
        throw new Error(`The user ${user.getSurname()} ${user.getName()} does not have a registered pet with ID ${petId}.`);

      } else {

        const indexPet = requestedPet.indexOf(petId);
        requestedPet.splice(indexPet, 1);

        const petCriteria: FindManyOptions = { where: requestedPet.map(petId => ({ id: petId })) };
        const newPets = await this.petRepository.find(petCriteria);
        user.setInterestedIn(newPets);
        // If the user does not have a requested pet, an empty array is assigned
        if (requestedPet.length === 0) {
          user.pets = [];
        }

        await this.userRepository.save(user);
        return `The pet with id ${petId} was remove from user ${user.getSurname()} ${user.getName()}.`
      }
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: 'Error getting user',
        message: error.message,
      }, HttpStatus.CONFLICT);
    }
  }
}
