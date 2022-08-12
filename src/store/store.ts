import { configureStore } from "@reduxjs/toolkit";
import classroomSlice from "../reducers/classroomSlice";

export const store = configureStore({
    reducer: {
        classroom: classroomSlice
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;