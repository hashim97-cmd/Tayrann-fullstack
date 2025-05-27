import { configureStore, createSlice } from '@reduxjs/toolkit';
import { flightDataSlice } from './flights/flightSlice';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    value: null,
  },
  reducers: {
    setData: (state, action) => {
      state.value = action.payload;
    },
    clearData: (state) => {
      state.value = null;
    },
  },
});


export const { setData, clearData } = dataSlice.actions;

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['flightData'], // Only persist flightData reducer
};

const flightDataPersistConfig = {
  key: 'flightData',
  storage,
  whitelist: ['searchParamsData'], // Only persist searchParamsData
};


const rootReducer = combineReducers({
  data: dataSlice.reducer,
  flightData: persistReducer(flightDataPersistConfig, flightDataSlice.reducer) // Apply persist to just flightData
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
