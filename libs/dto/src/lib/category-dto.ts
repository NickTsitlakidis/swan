export class CategoryDto {
    name: string;
    imageUrl: string;
    id: string;

    constructor(name: string, imageUrl: string, id: string) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.id = id;
    }
}
