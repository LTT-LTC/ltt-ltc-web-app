export interface MovieOutputDto {
    id: string;
    movieId: string;
    studioId?: string;
    studioName?: string;
    ratingId?: string;
    ratingCode?: string;
    ratingName?: string;
    title: string;
    originalTitle?: string;
    durationMins?: number;
    releaseDate?: string;
    premiereDate?: string;
    status?: string;
    description?: string;
    posterUrl?: string;
    trailerUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    studio?: { id: string; name: string };
    genreNames?: string[];
    genres?: { id: string; name: string }[];
    actorRoles?: { actorName: string; roleName: string }[];
    cast?: {
        actor?: { id: string; name: string };
        role?: { id: string; name: string } | null;
        characterName?: string | null;
        actorName?: string | null;
        roleName?: string | null;
    }[];
}

export interface MovieDetailOutputDto extends MovieOutputDto {
}
