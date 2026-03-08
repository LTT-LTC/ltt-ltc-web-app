import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { administrationServiceSlice } from "./administration-service";

export const store = configureStore({
    reducer: {
        administrationServiceEmployee: administrationServiceSlice.employee,
    }
});

// highlight-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
// highlight-end

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
