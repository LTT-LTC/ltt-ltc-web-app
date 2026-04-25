export interface ActorOutputDto {
    id: string;
    name: string;
    biography?: string;
    birthDate?: string;
}

export interface ActorDetailOutputDto extends ActorOutputDto {
}
