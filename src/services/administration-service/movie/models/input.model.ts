export interface GetMovieListInputDto {
    genreId?: string;
    studioId?: string;
    formatId?: string;
    keyword?: string;
    page: number;
    fetch: number;
}

export interface CreateMovieCastInputDto {
    actorName: string;
    roleName: string;
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
    studioId?: string;
    studioName?: string;
    ratingId?: string;
    genreListId?: string[];
    cast?: CreateMovieCastInputDto[];
    actorRoles?: CreateMovieCastInputDto[];
    ratingNumber?: number;
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
    studioName?: string;
    genreListId?: string[];
    actorRoles?: CreateMovieCastInputDto[];
    ratingNumber?: number;
    ratingId?: string;
}

export interface GetRatingListInputDto {
    page?: number;
    fetch?: number;
    orderBy?: string;
    isSortDesc?: boolean;
    keyword?: string;
}

export interface CreateRatingInputDto {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateRatingInputDto {
    code: string;
    name: string;
    description?: string;
}

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

export interface CreateDistributionRequestParams {
    MovieId: string;
    LicenseStartDate?: string | null;
    LicenseEndDate?: string | null;
    IsExclusive: boolean;
}

export interface UpdateDistributionRequestParams {
    LicenseStartDate?: string | null;
    LicenseEndDate?: string | null;
    IsExclusive: boolean;
}
