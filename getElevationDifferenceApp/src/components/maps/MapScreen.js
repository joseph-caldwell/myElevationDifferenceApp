import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,

} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class MapScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      userLat: 0,
      userLon: 0,
      userElevation: null,
      userElevationFt: 0,
      desElevationFt: 0,
      desElevation: null,
      mapType: 'satellite',
      elevationDifference: 0,
      elevationDifferenceFt: 0,
      markerLat: 0,
      markerLon: 0,
      marker: null,
    };
    this.fetchMarkerElevation = this.fetchMarkerElevation.bind(this);
    this.getElevationDifference = this.getElevationDifference.bind(this);
    this.getUserPosition = this.getUserPosition.bind(this);
  }

  getUserPosition() {
    this.locationWatchId = Geolocation.watchPosition(
      pos => {
        let latitude = parseFloat(pos.coords.latitude);
        let longitude = parseFloat(pos.coords.longitude);
        console.log('location position: ', pos);

        let region = {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0522,
          longitudeDelta: 0.0321,
        };

        this.setState({
          region: region,
          userLat: pos.coords.latitude,
          userLon: pos.coords.longitude,
        });

        console.log('position: ', pos);
        // console.log('location: ', region);

        //animate to user current location
        this.map.animateToRegion(region, 1000);
      },
      error => console.log('position error!!!', error),
      {enableHighAccuracy: false, timeout: 3000},
    );
  }

  async fetchMarkerElevation(lat, lng) {
    let desElevationCoordinates = lat + ',' + lng;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/elevation/json?locations=${desElevationCoordinates}&key=AIzaSyAC0rfEw46oQI8o22_X-ZSFCrIzPF-BZlk`,
      );
      const responseJson = await response.json();
      const locationElevation = responseJson.results[0].elevation;
      let locationElevationFt = locationElevation / 0.3048;
      if (Marker.identifier === 'one') {
        console.log('origin', locationElevation);
        this.setState({
          userElevation: locationElevation,
          userElevationFt: locationElevationFt,
        });
      } else {
        this.setState({
          desElevation: locationElevation,
          desElevationFt: locationElevationFt,
        });
      }
      Alert.alert(
        'The elevation at this location is ' +
          locationElevation.toFixed(2) +
          ' meters!',
        'The elevatiopn in feet is ' + locationElevationFt.toFixed(2) + ' FT',
      );
    } catch (error) {
      console.log(error);
    }
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.locationWatchId);
  }

  componentDidMount() {
    this.getUserPosition();
  }
  switchMapType = () => {
    console.log('changing');
    this.setState({
      mapType: this.state.mapType === 'satellite' ? 'terrain' : 'satellite',
    });
  };

  fitMarkersToMap() {
    this.map.fitToSuppliedMarkers(['origin', 'destination'], {
      edgePadding: {top: 70, right: 50, bottom: 70, left: 50},
    });
    setTimeout(() => {
      this.getElevationDifference();
    }, 2500);
  }

  async getElevationDifference() {
    let userLocation = this.state.userLat + ',' + this.state.userLon;
    let markerLocation = this.state.markerLat + ',' + this.state.markerLon;
    if (this.state.markerLat !== 0) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/elevation/json?locations=${userLocation}|${markerLocation}&key=AIzaSyAC0rfEw46oQI8o22_X-ZSFCrIzPF-BZlk`,
        );
        const responseJson = await response.json();
        console.log(responseJson);
        const locationEle = responseJson.results[0].elevation;
        const markerEle = responseJson.results[1].elevation;
        const difference = markerEle - locationEle;
        let differenceFt = difference / 0.3048;
        this.setState({
          elevationDifference: difference,
          elevationDifferenceFt: differenceFt,
        });
        Alert.alert(
          'ELEVATION Difference: ',
          'The difference in elevation is ' +
            difference.toFixed(2) +
            ' meters or ' +
            differenceFt.toFixed(2) +
            ' Feet!',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      Alert.alert(
        'NO DESTINATION MARKER',
        'You must place a destination marker First(By double clicking location you want)',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.blueTitle}>ELEVATE</Text>
        <MapView
          ref={map => {
            this.map = map;
          }}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={true}
          userLocationCalloutEnabled={true}
          followsUserLocation={true}
          provider="google"
          initialRegion={this.state.region}
          mapType={this.state.mapType}
          isLoading={true}
          toolbarEnabled={true}
          zoomControlEnabled={true}
          minZoomLevel={2}
          maxZoomLevel={17}
          showsBuildings={true}
          loadingIndicatorColor={'red'}
          loadingEnabled={true}
          showsPointsOfInterest={true}
          loadingBackgroundColor={'blue'}
          showsCompass={true}
          showsScale={true}
          onPress={e =>
            getElevation(
              e.nativeEvent.coordinate.latitude,
              e.nativeEvent.coordinate.longitude,
            )
          }
          onDoublePress={e =>
            this.setState({
              markerLat: e.nativeEvent.coordinate.latitude,
              markerLon: e.nativeEvent.coordinate.longitude,
              marker: e.nativeEvent.coordinate,
            })
          }
          onCalloutPress={e =>
            this.fetchMarkerElevation(
              e.nativeEvent.coordinate.latitude,
              e.nativeEvent.coordinate.longitude,
            )
          }>
          <MapView.Marker
            ref={ref => {
              this.marker1 = ref;
            }}
            identifier={'origin'}
            title={'You are here!'}
            description="Your current location "
            key={1}
            coordinate={{
              latitude: this.state.userLat,
              longitude: this.state.userLon,
            }}>
            <MapView.Callout tooltip>
              <View style={styles.bubble}>
                <Text style={styles.eleText}>
                  Latitude: {this.state.userLat}
                </Text>
                <Text style={styles.eleText}>
                  longitude: {this.state.userLon}
                </Text>
              </View>
            </MapView.Callout>
          </MapView.Marker>
          {this.state.marker && (
            <Marker
              ref={ref => {
                this.marker2 = ref;
              }}
              identifier={'destination'}
              draggable={true}
              title={'destination'}
              description={'This is your destination!'}
              coordinate={{
                latitude: this.state.markerLat,
                longitude: this.state.markerLon,
              }}
              pinColor={'violet'}>
              <Callout alphaHitTest tooltip>
                <View style={styles.bubble}>
                  <Text style={styles.eleText}>
                    Lat: {this.state.markerLat}
                  </Text>
                  <Text style={styles.eleText}>
                    lon: {this.state.markerLon}
                  </Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>
        <View style={styles.bottomSection}>
          <View style={styles.elevateButtonSection}>
            <TouchableOpacity
              onPress={() => this.switchMapType()}
              style={[styles.bubble, styles.button]}>
              <Text style={styles.eleText}>Change MapType</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.fitMarkersToMap()}
              style={[styles.bubble, styles.button]}>
              <Text style={styles.eleText}>Elevation Difference</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

async function getElevation(lat, lng) {
  let userElevationCoordinates = lat + ',' + lng;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/elevation/json?locations=${userElevationCoordinates}&key=AIzaSyAC0rfEw46oQI8o22_X-ZSFCrIzPF-BZlk`,
    );
    const responseJson = await response.json();
    const currentElevation = responseJson.results[0].elevation;
    const currentElevationFt = currentElevation / 0.3048;

    Alert.alert(
      'Double Click to place marker at this Elevation',
      'The Elevation at this spot is ' +
        currentElevation.toFixed(2) +
        ' meters  or ' +
        currentElevationFt.toFixed(2) +
        ' Ft',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: e => console.log('OK Pressed')},
      ],
    );
  } catch (error) {
    console.log(error);
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    height: height,
    width: width,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: -1,
  },
  buttonText: {
    textAlign: 'center',
  },
  eleText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'algerian',
    color: 'white',
  },
  bottomSection: {
    height: '10%',
    width: '100%',
  },

  itemContainer: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'purple',
    width: 60,
    backgroundColor: 'darkgrey',
    padding: 20,
    paddingRight: 25,
  },
  blueTitle: {
    color: 'aqua',
    fontWeight: 'bold',
    fontSize: 25,
    marginLeft: 120,
    marginTop: 20,
    height: 35,
  },

  circle: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    backgroundColor: 'red',
  },

  callout: {
    position: 'relative',
  },
  bubble: {
    width: 250,
    height: 75,
    backgroundColor: 'skyblue',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderColor: 'purple',
    borderStyle: 'solid',
    borderWidth: 2,
  },

  button: {
    width: 110,
    height: 65,
    color: 'white',
    paddingHorizontal: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  textDisplay: {
    textAlign: 'center',
    color: 'white',
    fontSize: 10,
  },
  elevateButtonSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
