import { divIcon, type LatLngTuple } from 'leaflet';
import { Crosshair, Loader2, MapPinOff, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import '@/shared/map/leafletSetup';
import type { SessionCheckpointStatus, TrackingLocationSample } from '../types';
import { checkpointMarkerAppearance, hasValidMapCoordinate } from '../utils/trackingMap';

interface CoordinatorTrackingMapProps {
  checkpoints: SessionCheckpointStatus[];
  currentLocation?: TrackingLocationSample;
  pendingCheckpointIds: string[];
  isGpsTracking: boolean;
  gpsError?: string;
}

const DEFAULT_CENTER: LatLngTuple = [16.0471, 108.2062];

function FitInitialBounds({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || positions.length === 0) return;
    hasFitted.current = true;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(positions, { padding: [36, 36], maxZoom: 15 });
  }, [map, positions]);

  return null;
}

function LocateControl({ currentLocation }: { currentLocation?: TrackingLocationSample }) {
  const map = useMap();
  if (!currentLocation) return null;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        map.setView(
          [currentLocation.latitude, currentLocation.longitude],
          Math.max(map.getZoom(), 16)
        );
      }}
      onMouseDown={(event) => event.stopPropagation()}
      className="absolute right-3 top-3 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#06261D] shadow-md"
      title="Đưa bản đồ về vị trí hiện tại"
    >
      <Crosshair className="h-4 w-4" />
      Vị trí của tôi
    </button>
  );
}

export function CoordinatorTrackingMap({
  checkpoints,
  currentLocation,
  pendingCheckpointIds,
  isGpsTracking,
  gpsError,
}: CoordinatorTrackingMapProps) {
  const [tileLoadFailed, setTileLoadFailed] = useState(false);
  const pendingIds = new Set(pendingCheckpointIds);
  const mappedCheckpoints = checkpoints.filter((checkpoint) =>
    hasValidMapCoordinate(checkpoint.latitude, checkpoint.longitude)
  );
  const checkpointPositions = mappedCheckpoints.map(
    (checkpoint) => [checkpoint.latitude as number, checkpoint.longitude as number] as LatLngTuple
  );
  const hasCurrentLocation = hasValidMapCoordinate(
    currentLocation?.latitude,
    currentLocation?.longitude
  );
  const currentPosition = hasCurrentLocation
    ? ([currentLocation?.latitude as number, currentLocation?.longitude as number] as LatLngTuple)
    : undefined;
  const allPositions = currentPosition
    ? [...checkpointPositions, currentPosition]
    : checkpointPositions;
  const center = currentPosition ?? checkpointPositions[0] ?? DEFAULT_CENTER;
  const missingCoordinateCount = checkpoints.length - mappedCheckpoints.length;

  return (
    <section
      className="overflow-hidden rounded-3xl bg-white"
      style={{ border: '1px solid #E6E2D1' }}
    >
      <div className="flex flex-col gap-3 border-b border-[#E6E2D1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#06261D]">
            <Navigation className="h-5 w-5" />
            Bản đồ hành trình
          </h2>
          <p className="mt-0.5 text-xs font-medium text-[#6F7B75]">
            Theo dõi vị trí hiện tại so với các checkpoint của tour.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#6F7B75]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Chưa đến
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Chờ đồng bộ
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Đã check-in
          </span>
        </div>
      </div>

      <div className="relative">
        <MapContainer
          center={center}
          zoom={checkpointPositions.length > 0 ? 13 : 6}
          scrollWheelZoom
          style={{ height: '380px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              load: () => setTileLoadFailed(false),
              tileerror: () => setTileLoadFailed(true),
            }}
          />

          {checkpointPositions.length > 1 && (
            <Polyline
              positions={checkpointPositions}
              pathOptions={{ color: '#64748B', weight: 3, opacity: 0.65, dashArray: '7 8' }}
            />
          )}

          {mappedCheckpoints.map((checkpoint) => {
            const appearance = checkpointMarkerAppearance(
              checkpoint,
              pendingIds.has(checkpoint.checkpointId)
            );
            const position: LatLngTuple = [
              checkpoint.latitude as number,
              checkpoint.longitude as number,
            ];
            const checkpointIcon = divIcon({
              className: '',
              html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:3px solid ${appearance.color};border-radius:9999px;background:${appearance.fillColor};color:#fff;font-size:12px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.28)">${checkpoint.checkpointOrder}</div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              popupAnchor: [0, -16],
            });
            return (
              <Marker key={checkpoint.checkpointId} position={position} icon={checkpointIcon}>
                <Popup>
                  <strong>{checkpoint.checkpointName}</strong>
                  <br />
                  Trạng thái: {appearance.label}
                  {checkpoint.note ? (
                    <>
                      <br />
                      Ghi chú: {checkpoint.note}
                    </>
                  ) : null}
                </Popup>
              </Marker>
            );
          })}

          {currentPosition && currentLocation && (
            <>
              {currentLocation?.accuracyMeters && currentLocation.accuracyMeters > 0 && (
                <Circle
                  center={currentPosition}
                  radius={currentLocation.accuracyMeters}
                  pathOptions={{ color: '#2563EB', fillColor: '#60A5FA', fillOpacity: 0.12 }}
                />
              )}
              <CircleMarker
                center={currentPosition}
                radius={9}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: '#2563EB',
                  fillOpacity: 1,
                  weight: 4,
                }}
              >
                <Popup>
                  <strong>Vị trí hiện tại của bạn</strong>
                  <br />
                  Cập nhật: {new Date(currentLocation.recordedAt).toLocaleTimeString('vi-VN')}
                  {currentLocation.accuracyMeters ? (
                    <>
                      <br />
                      Độ chính xác: khoảng {Math.round(currentLocation.accuracyMeters)} m
                    </>
                  ) : null}
                </Popup>
              </CircleMarker>
            </>
          )}

          <FitInitialBounds positions={allPositions} />
          <LocateControl currentLocation={currentPosition ? currentLocation : undefined} />
        </MapContainer>

        {!currentPosition && (
          <div className="pointer-events-none absolute left-3 top-3 z-[1000] inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6F7B75] shadow-md">
            {isGpsTracking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPinOff className="h-4 w-4" />
            )}
            {isGpsTracking ? 'Đang chờ vị trí GPS...' : 'Chưa có vị trí hiện tại'}
          </div>
        )}

        {(tileLoadFailed || gpsError || missingCoordinateCount > 0) && (
          <div className="absolute bottom-3 left-3 right-3 z-[1000] space-y-1 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-amber-800 shadow-md sm:right-auto">
            {tileLoadFailed && <p>Không thể tải bản đồ nền. Dữ liệu GPS vẫn được lưu.</p>}
            {gpsError && <p>{gpsError}</p>}
            {missingCoordinateCount > 0 && (
              <p>{missingCoordinateCount} checkpoint chưa có tọa độ nên không thể hiển thị.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
