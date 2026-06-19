import { View, Text, Platform, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import type { GpsLog } from '@/types';
import { Ionicons } from '@expo/vector-icons';

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.MapView;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('Native maps failed to load', e);
  }
}

interface BusMapProps {
  gps?: GpsLog | null;
  userLatitude?: number;
  userLongitude?: number;
  routeCoordinates?: { latitude: number; longitude: number }[];
  height?: number;
}

const DEFAULT_REGION = {
  latitude: 8.3608, // Centered in Manolo Fortich
  longitude: 124.8622,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

// Web Vector Simulation Stops
const SIMULATED_STOPS = [
  { name: 'CDO Agora Terminal', x: 40, y: 30, desc: 'Origin Terminal' },
  { name: 'Puerto Junction', x: 100, y: 70, desc: 'Transit Point' },
  { name: 'Manolo Fortich Terminal', x: 160, y: 110, desc: 'Central Poblacion' },
  { name: 'Camp Phillips Point', x: 230, y: 130, desc: 'Pineapple Fields' },
  { name: 'Dahilayan Station', x: 310, y: 180, desc: 'Adventure Park' },
];

export function BusMap({
  gps,
  userLatitude,
  userLongitude,
  routeCoordinates,
  height = 280,
}: BusMapProps) {
  const [busProgress, setBusProgress] = useState(0.4); // simulated position along route

  // Animate the bus along the route in simulation mode (web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const interval = setInterval(() => {
        setBusProgress((prev) => {
          const next = prev + 0.005;
          return next > 1.0 ? 0.0 : next;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const region = gps
    ? {
        latitude: gps.latitude,
        longitude: gps.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      }
    : DEFAULT_REGION;

  // Web Render: Gorgeous Interactive SVG Map
  if (Platform.OS === 'web' || !MapView) {
    // Determine simulated bus position coordinate along SVG path
    // Stops: 5 points. Path length approx. 4 segments.
    const segmentCount = SIMULATED_STOPS.length - 1;
    const currentSegment = Math.min(
      Math.floor(busProgress * segmentCount),
      segmentCount - 1
    );
    const segmentProgress = (busProgress * segmentCount) - currentSegment;
    
    const startStop = SIMULATED_STOPS[currentSegment];
    const endStop = SIMULATED_STOPS[currentSegment + 1];
    
    const busX = startStop.x + (endStop.x - startStop.x) * segmentProgress;
    const busY = startStop.y + (endStop.y - startStop.y) * segmentProgress;

    return (
      <View style={[styles.webMapContainer, { height }]}>
        <View style={styles.webHeader}>
          <View style={styles.liveIndicator}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveIndicatorText}>LIVE SIMULATED VECTOR TRACKING</Text>
          </View>
          <Text style={styles.webRouteLabel}>CDO ⇄ Manolo Fortich ⇄ Dahilayan Network</Text>
        </View>

        {/* SVG Simulated Map Canvas */}
        <View style={styles.canvasWrapper}>
          <svg width="100%" height="100%" viewBox="0 0 360 210" style={{ overflow: 'visible' }}>
            {/* Gradients */}
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="50%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#166534" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="50" x2="360" y2="50" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />
            <line x1="0" y1="100" x2="360" y2="100" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />
            <line x1="0" y1="150" x2="360" y2="150" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />
            <line x1="90" y1="0" x2="90" y2="210" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />
            <line x1="180" y1="0" x2="180" y2="210" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />
            <line x1="270" y1="0" x2="270" y2="210" stroke="rgba(249, 115, 22, 0.05)" strokeWidth="1" />

            {/* Route Polyline (winding path from CDO to Dahilayan) */}
            <path
              d="M 40 30 Q 80 50 100 70 T 160 110 T 230 130 T 310 180"
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="2,4"
              opacity="0.4"
            />
            <path
              d="M 40 30 Q 80 50 100 70 T 160 110 T 230 130 T 310 180"
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Render Station Pins */}
            {SIMULATED_STOPS.map((stop, index) => (
              <g key={index}>
                {/* Station Ring */}
                <circle cx={stop.x} cy={stop.y} r="8" fill="white" stroke={index === 2 ? '#F97316' : '#166534'} strokeWidth="2" />
                {/* Station Center */}
                <circle cx={stop.x} cy={stop.y} r="4" fill={index === 2 ? '#F97316' : '#166534'} />
                {/* Station Label */}
                <text
                  x={stop.x}
                  y={stop.y - 12}
                  textAnchor="middle"
                  fill="#1F2937"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {stop.name.replace(' Terminal', '').replace(' Station', '').replace(' Point', '')}
                </text>
              </g>
            ))}

            {/* Simulated Live Bus Indicator */}
            <g transform={`translate(${busX}, ${busY})`}>
              {/* Pulse Ring */}
              <circle cx="0" cy="0" r="14" fill="rgba(249, 115, 22, 0.2)" opacity="0.8">
                <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Bus Pin Outer */}
              <circle cx="0" cy="0" r="7" fill="#F97316" stroke="white" strokeWidth="1.5" />
              {/* Bus Pin Inner */}
              <circle cx="0" cy="0" r="3" fill="white" />
            </g>

            {/* Simulated Passenger User Dot */}
            <g transform="translate(180, 115)">
              <circle cx="0" cy="0" r="5" fill="#166534" stroke="white" strokeWidth="1" />
              <text x="8" y="3" fill="#166534" fontSize="7" fontWeight="bold">You</text>
            </g>
          </svg>
        </View>

        {/* Info Overlay Panel */}
        <View style={styles.webOverlay}>
          <Ionicons name="information-circle-outline" size={16} color="#166534" />
          <Text style={styles.webOverlayText}>
            Bus {gps?.bus_id ? 'BUS-101' : 'BUS-102'} is transit between {SIMULATED_STOPS[currentSegment].name.replace(' Station', '').replace(' Terminal', '')} and {SIMULATED_STOPS[currentSegment + 1].name.replace(' Station', '').replace(' Terminal', '')} ({Math.round(segmentProgress * 100)}% route segment complete).
          </Text>
        </View>
      </View>
    );
  }

  // Native Render: Google Map view
  return (
    <View style={[styles.nativeContainer, { height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={Boolean(userLatitude && userLongitude)}
        showsMyLocationButton
      >
        {gps ? (
          <Marker
            coordinate={{ latitude: gps.latitude, longitude: gps.longitude }}
            title="Bus Location"
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerInner}>
                <Ionicons name="bus" size={14} color="white" />
              </View>
            </View>
          </Marker>
        ) : null}

        {userLatitude && userLongitude ? (
          <Marker
            coordinate={{ latitude: userLatitude, longitude: userLongitude }}
            title="Your Location"
            pinColor="#166534"
          />
        ) : null}

        {routeCoordinates && routeCoordinates.length > 1 ? (
          <Polyline coordinates={routeCoordinates} strokeColor="#F97316" strokeWidth={4} />
        ) : null}
      </MapView>

      {!gps ? (
        <View style={styles.gpsBanner}>
          <Text style={styles.gpsBannerText}>Waiting for GPS signal...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: '#FFF7ED', // Warm Cream Map background
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  webHeader: {
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#166534',
    marginRight: 6,
  },
  liveIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  webRouteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  canvasWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  webOverlayText: {
    flex: 1,
    fontSize: 10,
    color: '#1F2937',
    fontWeight: '600',
    lineHeight: 14,
  },
  nativeContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  gpsBannerText: {
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: '600',
  },
});
