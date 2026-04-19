export interface GetMovieListInputDto {
    genreId?: string;
    studioId?: string;
    formatId?: string;
    keyword?: string;
    page: number;
    fetch: number;
}

export interface CreateMovieInputDto {
    id?: string;
    title: string;
    originalTitle?: string;
    durationMins?: number;
    releaseDate?: string;
    premiereDate?: string;
    status?: string;
    description?: string;
    posterUrl?: string;
    trailerUrl?: string;
    studioId: string;
}

export interface UpdateMovieInputDto {
    id: string;
    title: string;
    originalTitle?: string;
    durationMins?: number;
    releaseDate?: string;
    premiereDate?: string;
    status?: string;
    description?: string;
    posterUrl?: string;
    trailerUrl?: string;
    studioId?: string;
    ratingId?: string;
}

// Metadata Inputs
export interface CreateGenreInputDto { name: string; }
export interface UpdateGenreInputDto { name: string; }

export interface CreateActorInputDto { name: string; biography?: string; birthDate?: string; }
export interface UpdateActorInputDto { name: string; biography?: string; birthDate?: string; }

export interface CreateStudioInputDto { name: string; address?: string; }
export interface UpdateStudioInputDto { name: string; address?: string; }

export interface CreateFormatInputDto { name: string; }
export interface UpdateFormatInputDto { name: string; }

export interface CreateRoleInputDto { name: string; }
export interface UpdateRoleInputDto { name: string; }

export interface GetDistributionListInputDto {
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
    filter?: string;
}

export interface CreateDistributionInputDto {
    movieId: string;
    licenseStartDate?: string | null;
    licenseEndDate?: string | null;
    isExclusive: boolean;
}

export interface UpdateDistributionInputDto {
    licenseStartDate?: string | null;
    licenseEndDate?: string | null;
    isExclusive: boolean;
}
