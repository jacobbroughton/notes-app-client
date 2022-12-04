import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./user"
import foldersReducer from "./folders"
import sidebarReducer from "./sidebar"
import pagesReducer from "./pages"
import modalsReducer from "./modals"

const store = configureStore({
    reducer: {
        user: userReducer,
        folders: foldersReducer,
        pages: pagesReducer,
        sidebar: sidebarReducer,
        modals: modalsReducer
    }
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch