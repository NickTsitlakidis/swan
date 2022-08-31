export class CategoryDto {
    name: string;
    imageUrl?: string;
    id: string;

    constructor(name: string, id: string, imageUrl?: string) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.id = id;
    }
}
