import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { dissoc, mergeRight } from 'ramda'

import { SessionStateType } from './types'

const initialState: SessionStateType = {}

const sessionSlice = createSlice({
  initialState,
  name: 'session',
  reducers: {
    removeSession: (state, action: PayloadAction<string>) => {
      state = dissoc(action.payload, state.sessions)
    },
    saveSession: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state = mergeRight(state, action.payload)
    }
  }
})

export const { removeSession, saveSession } = sessionSlice.actions

const { actions } = sessionSlice
const sessionReducer = sessionSlice.reducer
export { actions, sessionReducer }
