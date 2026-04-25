export interface GetMovieListInputDto {
    genreId?: string;
    studioId?: string;
    formatId?: string;
    keyword?: string;
    page: number;
    fetch: number;
}
