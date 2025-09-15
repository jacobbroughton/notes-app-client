import { configureStore } from "@reduxjs/toolkit";
import combinedReducer from "./combined";
import { foldersReducer } from "./folders";
import modalsReducer from "./modals";
import { pagesReducer } from "./pages";
import sidebarReducer from "./sidebar";
import tagsReducer from "./tags";
import themeReducer from "./theme";
import userReducer from "./user";

const store = configureStore({
  reducer: {
    user: userReducer,
    folders: foldersReducer,
    pages: pagesReducer,
    tags: tagsReducer,
    combined: combinedReducer,
    sidebar: sidebarReducer,
    modals: modalsReducer,
    theme: themeReducer,
  },
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
