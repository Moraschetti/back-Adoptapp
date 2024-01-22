import { City } from "src/city/entities/city.entity";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Attribute } from "../attributes/entities/attribute.entity";
import { User } from "src/users/entities/user.entity";
import { Adoption } from "src/Services/adoptions/entities/adoptions.entity";

@Entity({ name: 'pets' })
export class Pet {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    creation_date: Date;

    @Column()
    name: string;

    @Column()
    specie: string;

    @Column()
    sex: string;

    @Column()
    age: number;

    @Column()
    description: string;

    @Column()
    url_img: string;

    @Column({ type: 'boolean', default: true })
    available: boolean;

    @Column({ type: 'int', default: 0 })
    interested: number;

    @Column({ name: 'fk_city_id', nullable: false })
    fk_city_id: number;

    @ManyToOne(() => City, city => city.pets)
    @JoinColumn({ name: 'fk_city_id' })
    city: City;

    @ManyToMany(() => Attribute, attributes => attributes.pets)
    @JoinTable({ name: 'pets_attributes' })
    attributes: Attribute[];

    @ManyToMany(() => User, user => user.pets)
    users: User[];

    @OneToMany(() => Adoption, adoption => adoption.pet)
    adoption : Adoption;
    
    constructor(name: string, specie: string, sex: string, age: number, description: string, urlImg: string) {
        this.name = name;
        this.specie = specie;
        this.sex = sex;
        this.age = age;
        this.description = description;
        this.url_img = urlImg;
    }
    public getName(): string {
        return this.name;
    }
    public getAge(): number {
        return this.age;
    }
    public getSpecie(): string {
        return this.specie;
    }
    public getSex(): string {
        return this.sex;
    }
    public getDescription(): string {
        return this.description;
    }
    public getUrlImg(): string {
        return this.url_img;
    }
    public getInterested(): number {
        return this.interested;
    }
    public setName(newName: string): void {
        this.name = newName;
    }
    public setAge(newAge: number): void {
        this.age = newAge;
    }
    public setSex(newSex: string): void {
        this.sex = newSex;
    }
    public setSpecie(newSpecie: string): void {
        this.specie = newSpecie;
    }
    public setAttributes(newAttributes: Attribute[]): void {
        this.attributes = newAttributes;
    }
    public setCity(newZipCode: City): void {
        this.city = newZipCode;
    }
    public setDescription(newDescription: string): void {
        this.description = newDescription;
    }
    public setInterested(): void {
        this.interested += 1;
    }
    public setUrlImg(newUrlImg: string): void {
        this.url_img = newUrlImg;
    }
    public setAvailable(): void {
        this.available = false;
    }
}
