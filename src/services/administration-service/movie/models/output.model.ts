export interface MovieOutputDto {
    id: string;
    movieId: string;
    studioId?: string;
    ratingId?: string;
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
}

export interface MovieDetailOutputDto extends MovieOutputDto {
}

// Metadata Outputs
export interface GenreOutputDto { id: string; name: string; }
export interface ActorOutputDto { id: string; name: string; biography?: string; birthDate?: string; }
export interface StudioOutputDto { id: string; name: string; address?: string; }
export interface FormatOutputDto { id: string; name: string; }
export interface RoleOutputDto { id: string; name: string; }

export interface MovieDistributionOutputDto {
    id: string;
    movieId: string;
    movieTitle: string;
    licenseStartDate?: string;
    licenseEndDate?: string;
    isExclusive: boolean;
}
