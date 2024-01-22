
export class CreatePetDTO {
    readonly name: string;
    readonly specie: string;
    readonly sex: string;
    readonly age: number;
    readonly zipCode: number;
    readonly attributes: string[];
    readonly description: string;
    readonly urlImg: string;
}

export class UpdatePetDTO {
    readonly name: string;
    readonly specie: string;
    readonly sex: string;
    readonly age: number;
    readonly zipCode: number;
    readonly attributes: string[];
    readonly description: string;
    readonly urlImg: string;
}

export class PetDTO {
    readonly id: number;
    readonly name: string;
    readonly sex: string;
    readonly age: number;
    readonly city: string;
    readonly attributes: string[];
    readonly description: string;
    readonly urlImg: string;
    readonly interested: number;
}