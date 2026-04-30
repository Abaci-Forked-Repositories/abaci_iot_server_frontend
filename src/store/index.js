import { configureStore ,combineReducers} from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import layoutSlice from './layout';
import authSlice from './auth';
import UserSlice from './user';
import FieldSlice from './fields';
import FeaturesSlice from './features';
import NotificationSlice from './notifications';
import DashboardSlice from './dashboard';
import GTCCSlice from './gtcc';
import VehicleSlice from './vehicle';
import DriverSlice from './driver';
import WalletSlice from './wallet';
import EntitySlice from './entity';
import MasterSlice from './master';
import GreaseTrapsSlice from './greasetraps';
import GateSlice from './gate';
import UiSlice from './uiSlice';
import ViolationSlice from './violations';
import InspectionSlice from './inspection';
const rootReducer = combineReducers({
		layoutSlice,
		authSlice,
		UserSlice,
		FieldSlice,
		FeaturesSlice,
		NotificationSlice,
		DashboardSlice,
		GTCCSlice,
		VehicleSlice,
		DriverSlice,
		WalletSlice,
		EntitySlice,
		MasterSlice,
		GreaseTrapsSlice,
		GateSlice,
		UiSlice,
		ViolationSlice,
		InspectionSlice


});

// Persist config
const persistConfig = {
	key: 'root',
	storage,
	whitelist: ['UiSlice'], // only persist the ui slice
  };

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

// Create persistor
export const persistor = persistStore(store);

export default store;
