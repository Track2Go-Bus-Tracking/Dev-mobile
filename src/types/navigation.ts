import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Auth: undefined;
  SignUp: undefined;
};

export type PassengerTabParamList = {
  Home: undefined;
  LiveTracking: { busId?: string } | undefined;
  Schedule: undefined;
  Terminals: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type PassengerStackParamList = {
  Tabs: NavigatorScreenParams<PassengerTabParamList>;
  BusInformation: { busId: string };
};

export type DriverTabParamList = {
  Dashboard: undefined;
  PassengerCounter: undefined;
  Emergency: undefined;
  TripHistory: undefined;
  Profile: undefined;
};

export type DriverStackParamList = {
  Tabs: NavigatorScreenParams<DriverTabParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Passenger: NavigatorScreenParams<PassengerStackParamList>;
  Driver: NavigatorScreenParams<DriverStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
