export type ResponseData<T> = {
  isLoading: boolean;
  data: T;
};

export type ResponseDataWithInput<TInput, TData> = {
  isLoading: boolean;
  data: TData;
  input: TInput;
};
