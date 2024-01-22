import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, Patch, Delete } from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDTO, PetDTO, UpdatePetDTO } from './dto/pet.dto';
import { Pet } from './entities/pet.entity';

@Controller('pets')
export class PetsController {
    constructor(private readonly petsService: PetsService) { }

    @Get('count')
    async getCount(): Promise<number> {
        return await this.petsService.countPets();
    }

    @Get('allPets')
    async getAll(): Promise<Pet[]> {
        return await this.petsService.allPets();
    }

    @Get('filter__:pageNumber')
    async getPets(@Param('pageNumber', ParseIntPipe) pageNumber: number, @Query('specie') specie?: string, @Query('location') location_id?: number, @Query('sex') sex?: string,): Promise<PetDTO[]> {
        return await this.petsService.filterPets(pageNumber, specie, location_id, sex);
    }

    @Post('addPet')
    async getAddPet(@Body() petDTO: CreatePetDTO): Promise<string> {
        return await this.petsService.addPet(petDTO);
    }

    @Get('oldPets')
    async getOlderPets(): Promise<PetDTO[]> {
        return this.petsService.olderPets();
    }

    @Patch('addInterested/:petId')
    async getAddInterested(@Param('petId', ParseIntPipe) petId: number): Promise<string> {
        return await this.petsService.addInterested(petId);
    }

    @Patch('adoptedPet/:petId/:userId/:cityId')
    async getAdoptedPet(@Param('petId', ParseIntPipe) petId: number, @Param('userId', ParseIntPipe) userId: number, @Param('cityId', ParseIntPipe) cityId: number): Promise<string> {
        return await this.petsService.wasAdopted(petId, userId, cityId);
    }

    @Patch('update/:petId')
    async getUpdatePet(@Param('petId', ParseIntPipe) petId: number, @Body() body: UpdatePetDTO): Promise<string> {
        return await this.petsService.updatePet(petId, body);
    }

    @Delete('delete/:petId')
    async getDeletePet(@Param('petId', ParseIntPipe) petId: number): Promise<string> {
        return this.petsService.deletePet(petId);
    }
}
