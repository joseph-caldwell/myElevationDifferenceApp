import React, {useState, useEffect} from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {PermissionsAndroid, Platform} from 'react-native';

import MapScreen from '../maps/MapScreen';

function HomeScreen({navigation}) {
  const [hasMapPermissions, setHasMapPermissions] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);
  const getUserLocation = async () => {
    this.locationWatchId = await Geolocation.watchPosition(
      pos => {
        console.log('pos1', pos);
        this.setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          userLat: pos.coords.latitude,
          userLon: pos.coords.longitude,
        });
      },
      err => console.warn(err),
      {
        enableHighAccuracy: true,
      },
    );
  };
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasMapPermissions(true);
        }
      } else {
        setHasMapPermissions(true);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <>
      {hasMapPermissions ? (
        <>
          <MapScreen />
        </>
      ) : null}
    </>
  );
}
export default HomeScreen;
