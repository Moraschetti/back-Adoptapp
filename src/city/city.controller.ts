import { City } from './entities/city.entity';
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDTO, UpdateCityDTO } from './dto/city.dto';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @Post('addCity')
  async getAddCity(@Body() city: CreateCityDTO): Promise<string> {
    return await this.cityService.addCity(city);
  }

  @Get('allCities')
  async getCities(): Promise<City[]> {
    return await this.cityService.allCities();
  }

  @Get(':zipCode')
  async getCityByZip(@Param('zipCode', ParseIntPipe) zipCode: number): Promise<City> {
    return await this.cityService.cityByZip(zipCode);
  }

  @Patch('update/:cityId')
  async getUpdateCity(@Param('cityId', ParseIntPipe) cityId: number, @Body() data: UpdateCityDTO): Promise<string> {
    return await this.cityService.updateCity(cityId, data);
  }
}