import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateCityDTO, UpdateCityDTO } from './dto/city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>
  ) { }

  // Function to add a new city to the database
  async addCity(city: CreateCityDTO): Promise<string> {
    try {
      const newCity: City = await this.cityRepository.save(new City(city.name, city.zipCode));

      if (!newCity) {
        throw new Error(`Error adding the city: ${city.name}.`);
      }
      return `Added the city: ${city.name}.`
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: `Error adding new city -` + error,
      },
        HttpStatus.CONFLICT);
    };
  }

  // Function to retrieve all cities from the database
  async allCities(): Promise<City[]> {
    try {
      const cities = await this.cityRepository.find();
      if (!cities) {
        throw new Error('Error getting cities.');
      }
      return cities;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `Error getting cities -` + error.message,
      },
        HttpStatus.BAD_REQUEST);
    }
  }

  async cityByZip(zipCode: number): Promise<City> {
    try {
      const criterion: FindOneOptions = { where: { zip_code: zipCode } };
      const city: City = await this.cityRepository.findOne(criterion);

      if (!city) {
        throw new Error(`There is no city with zip code ${zipCode}.`);
      }
      return city;

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `Error getting city - ` + error.message,
      },
        HttpStatus.BAD_REQUEST);
    }
  }
  // Function to update a city's information
  async updateCity(cityId: number, data: UpdateCityDTO): Promise<string> {
    try {
      const criterion: FindOneOptions = { where: { id: cityId } };
      const cityToUpdate: City = await this.cityRepository.findOne(criterion);

      if (!cityToUpdate) {
        throw new Error(`City with ID ${cityId} not found.`);
      }
      if (!data.name && !data.zipCode) {
        throw new Error(`There are no attributes in the city object.`);
      }
      if (data.name === "" || data.zipCode === null) {
        throw new Error('Empty values are not accepted.');
      }

      // Updating city properties
      cityToUpdate.setName(data.name);
      cityToUpdate.setZipCode(data.zipCode);

      await this.cityRepository.save(cityToUpdate);
      return `The city was modified.`

    } catch (error) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: `Error updating city - ` + error.message,
      },
        HttpStatus.CONFLICT);
    }
  }
}