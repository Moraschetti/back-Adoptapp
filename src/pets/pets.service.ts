import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreatePetDTO, PetDTO, UpdatePetDTO } from './dto/pet.dto';
import { City } from 'src/city/entities/city.entity';
import { Attribute } from './attributes/entities/attribute.entity';
import { checkEmptyValues, checkValues } from 'src/Services/valuesValidation';
import { User } from 'src/users/entities/user.entity';
import { Adoption } from 'src/Services/adoptions/entities/adoptions.entity';

@Injectable()
export class PetsService {

  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(Attribute)
    private readonly attributRepository: Repository<Attribute>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Adoption)
    private readonly adoptionRepository: Repository<Adoption>
  ) { }

  validValues = ['name', 'specie', 'sex', 'age', 'zipCode', 'attributes', 'description', 'urlImg'];
  // Function to add a new pet
  async addPet(petDTO: CreatePetDTO): Promise<string> {
    const { name, specie, sex, age, zipCode, description, attributes, urlImg } = petDTO;

    try {
      // Check if required values are missing
      if (!checkValues(petDTO, this.validValues)) {
        throw new Error('Required fields missing: name, specie, age, zipCode, description, attributes, urlImg.');

      };
      // Check if empty values are not accepted
      if (!checkEmptyValues(petDTO)) {
        throw new Error('Empty fields are not accepted.');
      }
      // Verify the city with its zip code
      const criterion: FindOneOptions = { where: { zip_code: Number(zipCode) } };
      const city = await this.cityRepository.findOne(criterion);
      // If the city doesn't exist, throw an error
      if (!city) {
        throw new Error(`There is no city with zip code ${zipCode}.`);
      }
      // Create a new pet with the provided arguments
      const newPet: Pet = new Pet(name, specie, sex, age, description, urlImg);
      newPet.attributes = await this.handleAttributes(attributes);
      newPet.city = city;

      if (!newPet) {
        throw new Error(`Error adding pet ${name}.`);
      }

      await this.petRepository.save(newPet);
      return `Added pet ${name}.`

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `Error adding pet ${name} - ` + error.message,
      },
        HttpStatus.BAD_REQUEST);
    }
  };

  // Function to filter pets based on criteria
  async filterPets(pageNumber: number, specie?: string, location_id?: number, sex?: string): Promise<PetDTO[]> {

    try {
      const elementsPage = 10;
      const skipItems = (pageNumber - 1) * elementsPage;

      const filter = {
        ...(specie ? { specie } : {}),
        ...(location_id ? { fk_city_id: Number(location_id) } : {}),
        ...(sex ? { sex } : {})
      }

      const criterion: FindManyOptions = {
        relations: ['attributes', 'city'],
        take: elementsPage,
        where: {
          available: true,
          ...filter,
        },
        skip: skipItems
      };
      const leakedPets = await this.petRepository.find(criterion);

      if (!leakedPets) {
        throw new Error('Pet capture error.');
      }

      const petData: PetDTO[] = leakedPets.map(pet => ({
        id: pet.id,
        name: pet.name,
        sex: pet.sex,
        age: pet.age,
        city: pet.city.name,
        attributes: pet.attributes.map(attribute => (attribute.name)),
        description: pet.description,
        urlImg: pet.url_img,
        interested: pet.interested,
      }));
      return petData;

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `Pet capture error -` + error.message,
      },
        HttpStatus.BAD_REQUEST);
    }
  }

  // Function to retrieve older pets
  async olderPets(): Promise<PetDTO[]> {
    try {
      const criterion: FindManyOptions = {
        relations: ['attributes', 'city'],
        order: {
          creation_date: 'DESC',
        },
        take: 8,
        where: {
          available: true,
        }
      }
      const olderPets = await this.petRepository.find(criterion);

      if (!olderPets) {
        throw new Error('Pet capture error.')
      }

      const petData: PetDTO[] = olderPets.map(pet => ({
        id: pet.id,
        name: pet.name,
        sex: pet.sex,
        age: pet.age,
        city: pet.city.name,
        attributes: pet.attributes.map(attribute => (attribute.name)),
        description: pet.description,
        urlImg: pet.url_img,
        interested: pet.interested,
      }));
      return petData;

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `Pet capture error -` + error.message,
      },
        HttpStatus.BAD_REQUEST);
    }
  }

  // Function to count the number of pets
  async countPets(): Promise<number> {
    try {
      return await this.petRepository.count();
    }
    catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `Error when counting pets -` + error.message,
      },
        HttpStatus.BAD_REQUEST);
    }
  };

  // Function to retrieve all pets
  async allPets(): Promise<Pet[]> {
    try {
      // Get pets with their relationship and values
      const criterion: FindManyOptions = { relations: ['attributes', 'city'] };
      const data = await this.petRepository.find(criterion);

      if (!data) {
        throw new Error('Could not get pet data.');
      }

      return data;

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Error getting data',
        message: error.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // Function to add an interested party to a pet
  async addInterested(petId: number): Promise<string> {
    try {
      const criterion: FindOneOptions = { where: { id: petId } };
      const pet: Pet = await this.petRepository.findOne(criterion);

      if (!pet) {
        throw new Error(`The pet with ID ${petId} does not exist.`);
      }

      pet.setInterested();
      await this.petRepository.save(pet);
      return `${pet.getName()} has new interested.`

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: 'Error adding interested',
        message: error.message,
      }, HttpStatus.CONFLICT);
    }
  }

  // Function to mark a pet as available
  async wasAdopted(petId: number, userId: number, cityId: number): Promise<string> {
    try {
      const petcriteria: FindOneOptions = { where: { id: petId } };
      const pet: Pet = await this.petRepository.findOne(petcriteria);

      if (!pet) {
        throw new Error(`The pet with ID ${petId} does not exist.`);
      }
      if (!pet.available) {
        throw new Error(`Sorry, ${pet.getName()} has already been adopted.`)
      }
      const userCriteria: FindOneOptions = { where: { id: userId }, relations: ['pets'] };
      const user: User = await this.userRepository.findOne(userCriteria);

      if (!user) {
        throw new Error(`The user with ID ${userId} does not exist.`);
      }
      const cityCriteria: FindOneOptions = { where: { id: cityId } };
      const city: City = await this.cityRepository.findOne(cityCriteria);

      if (!city) {
        throw new Error(`The city with ID ${petId} does not exist.`);
      }

      const newAdoption: Adoption = new Adoption();
      newAdoption.pet = pet;
      newAdoption.user = user;
      newAdoption.city = city;

      const requestedPet = user.pets.map(pet => pet.id);
      const indexPet = requestedPet.indexOf(petId);
      requestedPet.splice(indexPet, 1);

      const petCriteria: FindManyOptions = { where: requestedPet.map(petId => ({ id: petId })) };
      const newPets = await this.petRepository.find(petCriteria);
      user.setInterestedIn(newPets);
      // If the user does not have a requested pet, an empty array is assigned
      if (requestedPet.length === 0) {
        user.pets = [];
      }
      pet.setAvailable();

      await this.userRepository.save(user);
      await this.adoptionRepository.save(newAdoption);
      await this.petRepository.save(pet);

      return `${pet.getName()} was adopted in ${city.getName()} by ${user.getSurname()} ${user.getName()}.`

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: 'Error when entering the new adoption - ' + error.message,
      }, HttpStatus.CONFLICT);
    }
  }

  // Function to update a pet's information
  async updatePet(petId: number, body: UpdatePetDTO): Promise<string> {
    const { name, age, sex, zipCode, specie, attributes, description, urlImg } = body;
    try {
      const criterion: FindOneOptions = { where: { id: petId } };
      const pet: Pet = await this.petRepository.findOne(criterion);
      if (!pet) {
        throw new Error(`The pet with ID ${petId} does not exist.`);
      }

      if (attributes && attributes.length > 0) {
        // pet.setAttributes(await this.handleAttributes(body.attributes));
      }

      if (zipCode) {
        const criterion: FindOneOptions = { where: { zip_code: Number(zipCode) } };
        const city = await this.cityRepository.findOne(criterion);
        pet.setCity(city);
      }

      if (!checkEmptyValues(body)) {
        throw new Error('Empty fields are not accepted.');
      }

      if (!checkValues(body, this.validValues)) {
        throw new Error(`Invalid key for the pet. Please enter name, sex, age, description, image url, zip code or species.`)
      }

      pet.setName(name ? name : pet.getName());
      pet.setAge(age ? age : pet.getAge());
      pet.setSex(sex ? sex : pet.getSex());
      pet.setSpecie(specie ? specie : pet.getSpecie());
      pet.setDescription(description ? description : pet.getDescription());
      pet.setUrlImg(urlImg ? urlImg : pet.getUrlImg());

      await this.petRepository.save(pet);
      return `The pet ${pet.name} was updated.`

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: 'Pet capture error - ' + error.message,
      }, HttpStatus.CONFLICT);
    }
  }

  async deletePet(petId: number): Promise<string> {
    try {
      const citerion: FindOneOptions = { where: { id: petId } };
      const petToDelete: Pet = await this.petRepository.findOne(citerion);

      if (!petToDelete) {
        throw new Error(`There is no pet with ID ${petId}.`);
      }

      await this.petRepository.remove(petToDelete);
      return `The pet with ID ${petId} was deleted.`

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Pet capture error - ' + error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }
  // Function to take, create, and assign attributes to the pet
  async handleAttributes(attributes: string[]): Promise<Attribute[]> {
    if (attributes.length === 0) {
      throw new Error(`Enter an attribute for the pet.`);
    }
    try {

      const attributesCriteria: FindManyOptions = { where: attributes.map(name => ({ name: name })) };
      const existingAttributes = await this.attributRepository.find(attributesCriteria);
      const attributeToCreate = attributes.filter(attribute => !existingAttributes.some(existingAttributes => existingAttributes.name.toLowerCase() === attribute.toLowerCase()));

      const newAttributes = await Promise.all(
        attributeToCreate.map(async attribute => {
          const newAttribute = new Attribute(attribute);
          return await this.attributRepository.save(newAttribute);
        })
      );

      const petAttributes = [...existingAttributes, ...newAttributes];

      return petAttributes;
    } catch (error) {
      throw new error(`Error getting attributes - ` + error.message);
    }
  }
}