import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { User } from 'src/users/entities/user.entity';
import { Pet } from 'src/pets/entities/pet.entity';
import { Adoption } from 'src/Services/adoptions/entities/adoptions.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([City, Pet, User, Adoption])
  ],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
