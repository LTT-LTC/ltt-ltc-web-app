export interface GetMovieListInputDto {
    genreId?: string;
    studioId?: string;
    formatId?: string;
    keyword?: string;
    status?: string;
    page: number;
    fetch: number;
}
