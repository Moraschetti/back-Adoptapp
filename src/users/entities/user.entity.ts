import { Adoption } from "src/Services/adoptions/entities/adoptions.entity";
import { City } from "src/city/entities/city.entity";
import { Pet } from "src/pets/entities/pet.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, CreateDateColumn, OneToMany } from "typeorm";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: Date;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    age: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true, length: 15 })
    phone_number: string;

    @Column()
    address: string;

    @Column()
    has_pet: boolean;

    @Column()
    living_place: string;

    @ManyToMany(() => Pet, pet => pet.users)
    @JoinTable({ name: 'interested_users' })
    pets: Pet[];

    @Column({ name: 'fk_city_id', nullable: false })
    fk_city_id: number;

    @ManyToOne(() => City, city => city.users)
    @JoinColumn({ name: 'fk_city_id' })
    city: City;

    @OneToMany(() => Adoption, adoption => adoption.user)
    adoption: Adoption;

    constructor(name: string, surname: string, age: number, email: string, phoneNumber: string, address: string, hasPet: boolean, livingPlace: string) {
        this.name = name;
        this.surname = surname;
        this.age = age;
        this.email = email;
        this.phone_number = phoneNumber;
        this.address = address;
        this.has_pet = hasPet;
        this.living_place = livingPlace;
    }
    public getName(): string {
        return this.name;
    }
    public getSurname() : string {
        return this.surname;
    }
    public getAge(): number {
        return this.age
    }
    public getZipCode(): City {
        return this.city
    }
    public getEmail(): string {
        return this.email;
    }
    public getPhoneNumber(): string {
        return this.phone_number;
    }
    public getAddress(): string {
        return this.address;
    }
    public getHasPet(): boolean {
        return this.has_pet;
    }
    public getLivingPlace(): string {
        return this.living_place;
    }
    public getInterestedPets(): Pet[] {
        return this.pets;
    }
    public setAge(newAge: number): void {
        this.age = newAge;
    }
    public setEmail(newEmail: string): void {
        this.email = newEmail;
    }
    public setPhoneNumber(newPhoneNumber: string): void {
        this.phone_number = newPhoneNumber;
    }
    public setAddress(newAddress: string): void {
        this.address = newAddress;
    }
    public setLivingPlace(newLivingPlace: string): void {
        this.living_place = newLivingPlace;
    }
    public setInterestedIn(newPets: Pet[]): void {
        this.pets = newPets;
    }
}
