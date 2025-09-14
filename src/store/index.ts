import { configureStore } from '@reduxjs/toolkit'
import exampleReducer from './exampleSlice'
import helloReducer from './helloSlice'

export const store = configureStore({
  reducer: {
    example: exampleReducer,
    hello: helloReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch