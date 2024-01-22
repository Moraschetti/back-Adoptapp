import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { Pet } from '../entities/pet.entity';

@Module({
    imports : [
        TypeOrmModule.forFeature([Attribute, Pet])
    ],
    controllers: [AttributesController],
    providers: [AttributesService]
})  
export class AttributesModule {}