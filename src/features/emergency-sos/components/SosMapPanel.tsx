import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { SosAlert } from '../types';

/** Fix icon marker mặc định của Leaflet không tự resolve được path qua bundler Vite. */
type IconDefaultPrototype = typeof L.Icon.Default.prototype & { _getIconUrl?: () => string };
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface SosMapPanelProps {
  alert?: SosAlert;
}

function RecenterOnAlert({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);
  return null;
}

/** Bản đồ Leaflet + OpenStreetMap, ghim đúng toạ độ SOS đang chọn — không có dữ liệu môi trường (nhiệt độ, pin thiết bị...) vì BE không trả các field đó. */
export function SosMapPanel({ alert }: SosMapPanelProps) {
  if (!alert) {
    return (
      <div
        className="flex h-full min-h-[340px] items-center justify-center rounded-[28px] p-6 text-center"
        style={{ backgroundColor: '#EFECE6' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#6F7B75' }}>
          Chọn 1 tín hiệu SOS để xem vị trí trên bản đồ.
        </p>
      </div>
    );
  }

  const position: [number, number] = [alert.latitude, alert.longitude];

  return (
    <div
      className="relative overflow-hidden rounded-[28px]"
      style={{ border: '1px solid #E6E2D1' }}
    >
      <div
        className="absolute left-4 top-4 z-[1000] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md"
        style={{ backgroundColor: '#D32F2F' }}
      >
        <MapPin className="h-3.5 w-3.5" />
        GPS: {alert.latitude.toFixed(4)}° N, {alert.longitude.toFixed(4)}° E
      </div>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom
        style={{ height: '340px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {alert.senderName} — {alert.tourName}
          </Popup>
        </Marker>
        <RecenterOnAlert latitude={alert.latitude} longitude={alert.longitude} />
      </MapContainer>
    </div>
  );
}
