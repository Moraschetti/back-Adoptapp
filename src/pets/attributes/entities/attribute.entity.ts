import { Pet } from "src/pets/entities/pet.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";

@Entity({name: 'attributes'})
export class Attribute {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name : string;

    @ManyToMany(() => Pet, pets => pets.attributes)
    pets : Pet[];
    
    constructor(name: string) {
        this.name = name;
    }
    public getAttribut() : string {
        return this.name;
    }
    public setAttribut(newName: string) : void {
        this.name = newName;
    }
}