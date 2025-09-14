import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import axios from 'axios'

interface HelloState {
  response: string | null
  loading: boolean
  error: string | null
}

const initialState: HelloState = {
  response: null,
  loading: false,
  error: null,
}

// Async thunk for fetching hello response
export const fetchHello = createAsyncThunk(
  'hello/fetchHello',
  async (_, { rejectWithValue }) => {
    try {
      const host = import.meta.env.VITE_API_HOST || 'http://localhost:3000'
      const response = await axios.get(`${host}/hello`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch hello')
    }
  }
)

export const helloSlice = createSlice({
  name: 'hello',
  initialState,
  reducers: {
    clearHelloResponse: (state) => {
      state.response = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHello.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHello.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false
        state.response = JSON.stringify(action.payload)
        console.log('Hello response:', action.payload)
      })
      .addCase(fetchHello.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch hello'
        console.error('Hello request failed:', state.error)
      })
  },
})

export const { clearHelloResponse } = helloSlice.actions

export const selectHelloResponse = (state: RootState) => state.hello.response
export const selectHelloLoading = (state: RootState) => state.hello.loading
export const selectHelloError = (state: RootState) => state.hello.error

export default helloSlice.reducer
