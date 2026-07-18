import Globe from 'globe.gl';
import { useEffect, useRef, useState } from 'react';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  size: number;
  color: string;
  isHub: boolean;
  difficulty?: string;
}

interface MapArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
}

// Define custom points: hubs and mountains
const MAP_POINTS: MapPoint[] = [
  {
    id: 'hanoi',
    lat: 21.0285,
    lng: 105.8542,
    name: 'Hà Nội (Hub)',
    size: 0.6,
    color: '#a2ebd2',
    isHub: true,
  },
  {
    id: 'hcm',
    lat: 10.8231,
    lng: 106.6297,
    name: 'TP. Hồ Chí Minh (Hub)',
    size: 0.6,
    color: '#a2ebd2',
    isHub: true,
  },
  {
    id: 'danang',
    lat: 16.0544,
    lng: 108.2022,
    name: 'Đà Nẵng (Hub)',
    size: 0.6,
    color: '#a2ebd2',
    isHub: true,
  },
  {
    id: 'fansipan',
    lat: 22.3033,
    lng: 103.7744,
    name: 'Fansipan (3,143m)',
    size: 0.8,
    color: '#ea580c',
    isHub: false,
    difficulty: 'Trung bình',
  },
  {
    id: 'tanang',
    lat: 11.5367,
    lng: 108.3183,
    name: 'Tà Năng - Phan Dũng',
    size: 0.8,
    color: '#ea580c',
    isHub: false,
    difficulty: 'Khó',
  },
  {
    id: 'hagiang',
    lat: 22.8233,
    lng: 104.9833,
    name: 'Hà Giang Loop',
    size: 0.8,
    color: '#ea580c',
    isHub: false,
    difficulty: 'Khám phá',
  },
  {
    id: 'mucangchai',
    lat: 21.8483,
    lng: 104.2667,
    name: 'Mù Cang Chải',
    size: 0.8,
    color: '#ea580c',
    isHub: false,
    difficulty: 'Dễ',
  },
];

// Arcs connecting Hubs to Mountain Destinations
const MAP_ARCS: MapArc[] = [
  {
    startLat: 21.0285,
    startLng: 105.8542,
    endLat: 22.3033,
    endLng: 103.7744,
    color: '#a2ebd2',
    label: 'Tuyến leo Fansipan',
  },
  {
    startLat: 21.0285,
    startLng: 105.8542,
    endLat: 22.8233,
    endLng: 104.9833,
    color: '#a2ebd2',
    label: 'Cung đường Hà Giang',
  },
  {
    startLat: 21.0285,
    startLng: 105.8542,
    endLat: 21.8483,
    endLng: 104.2667,
    color: '#a2ebd2',
    label: 'Hành trình Mù Cang Chải',
  },
  {
    startLat: 10.8231,
    startLng: 106.6297,
    endLat: 11.5367,
    endLng: 108.3183,
    color: '#a2ebd2',
    label: 'Tuyến trekking Tà Năng',
  },
  {
    startLat: 16.0544,
    startLng: 108.2022,
    endLat: 11.5367,
    endLng: 108.3183,
    color: '#a2ebd2',
    label: 'Tuyến trekking miền Trung',
  },
];

export default function HomeMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    // Detect WebGL support
    try {
      const canvas = document.createElement('canvas');
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      if (!support) {
        setWebGlSupported(false);
        return;
      }
    } catch (_e) {
      setWebGlSupported(false);
      return;
    }

    if (!containerRef.current) return;

    // Initialize Globe
    const globeInstance = new Globe(containerRef.current);

    // Access the globe material to set its color
    const globeMaterial = globeInstance.globeMaterial() as unknown as {
      color: { set: (color: string) => void };
    };
    if (globeMaterial?.color) {
      globeMaterial.color.set('#0c1c16');
    }

    globeInstance
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0, 0, 0, 0)')
      .atmosphereColor('#2a5048')
      .atmosphereAltitude(0.18)
      // Draw points
      .pointsData(MAP_POINTS)
      .pointLat((d: object) => (d as MapPoint).lat)
      .pointLng((d: object) => (d as MapPoint).lng)
      .pointColor((d: object) => (d as MapPoint).color)
      .pointRadius((d: object) => (d as MapPoint).size * 0.4)
      .pointLabel((d: object) => (d as MapPoint).name)
      // Custom actions on hover
      .onPointHover((point: object | null) => {
        setHoveredPoint(point as MapPoint | null);
        if (containerRef.current) {
          containerRef.current.style.cursor = point ? 'pointer' : 'default';
        }
      })
      // Draw arcs
      .arcsData(MAP_ARCS)
      .arcStartLat((d: object) => (d as MapArc).startLat)
      .arcStartLng((d: object) => (d as MapArc).startLng)
      .arcEndLat((d: object) => (d as MapArc).endLat)
      .arcEndLng((d: object) => (d as MapArc).endLng)
      .arcColor((d: object) => (d as MapArc).color)
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashAnimateTime(2000)
      .arcStroke(0.35)
      .arcAltitude(0.25);

    // Zoom and position focus on Vietnam (Latitude ~16, Longitude ~108, Altitude ~1.2)
    globeInstance.pointOfView({ lat: 16.5, lng: 108.2, altitude: 1.15 }, 0);

    // Smooth native auto-rotation (using OrbitControls). Suspends automatically on drag.
    const controls = globeInstance.controls();
    if (controls) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.autoRotate = !prefersReduced;
      controls.autoRotateSpeed = 0.6; // Adjust speed for a natural feel
    }

    // Resize listener
    const handleResize = () => {
      if (containerRef.current) {
        globeInstance.width(containerRef.current.clientWidth);
        globeInstance.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Initial sizing
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      globeInstance._destructor();
    };
  }, []);

  return (
    <section className="py-24 bg-muted/20 border-y border-border/40 relative">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">
          {/* 3D Map Container */}
          <div className="relative h-[480px] lg:h-[580px] rounded-3xl overflow-hidden bg-[#0d1f1a] border border-primary/10 shadow-2xl flex items-center justify-center">
            {webGlSupported ? (
              <div ref={containerRef} className="w-full h-full" />
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground text-sm">Trình duyệt không hỗ trợ WebGL 3D.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold">
                  {MAP_POINTS.filter((p) => !p.isHub).map((p) => (
                    <span
                      key={p.id}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Glowing atmosphere decorative overlay */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl shadow-[inset_0_0_80px_rgba(42,80,72,0.2)]" />
          </div>

          {/* Map Info Panel */}
          <div className="flex flex-col justify-center">
            <span className="section-eyebrow">Bản đồ tương tác</span>
            <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight mt-2">
              Bản đồ hành trình
            </h2>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              TrekSphere kết nối trực tiếp các trung tâm lữ hành lớn đến các địa danh núi rừng hoang
              sơ nhất Việt Nam. Tương tác với quả địa cầu 3D để xem sơ đồ di chuyển của các tuyến
              tour trekking độc quyền.
            </p>

            {/* Accessible list of point buttons */}
            <fieldset
              className="mt-6 flex flex-wrap gap-2 border-none p-0 m-0"
              aria-label="Danh sách các điểm trên bản đồ"
            >
              {MAP_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setHoveredPoint(point)}
                  onFocus={() => setHoveredPoint(point)}
                  onBlur={() => setHoveredPoint(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                    hoveredPoint?.id === point.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {point.name}
                </button>
              ))}
            </fieldset>

            {/* Detail details panel */}
            <div className="mt-8 p-6 rounded-2xl bg-card border border-border shadow-sm min-h-[160px] flex flex-col justify-center transition-all duration-300">
              {hoveredPoint ? (
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      hoveredPoint.isHub
                        ? 'bg-[#a2ebd2]/20 text-[#1f3933]'
                        : 'bg-orange-500/10 text-orange-600'
                    }`}
                  >
                    {hoveredPoint.isHub ? 'Trạm điều hành' : 'Điểm trekking'}
                  </span>
                  <h3 className="text-lg font-extrabold text-primary mt-2">{hoveredPoint.name}</h3>
                  {!hoveredPoint.isHub && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Độ khó:{' '}
                      <span className="font-semibold text-foreground">
                        {hoveredPoint.difficulty}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Tọa độ: {hoveredPoint.lat.toFixed(4)}°N, {hoveredPoint.lng.toFixed(4)}°E
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <svg
                    className="w-8 h-8 mx-auto text-muted-foreground/45 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.303.197-1.591 1.591M21 12h-2.25m-.197 5.303-1.591-1.591M12 21.75V19.5m-5.303-.197 1.591-1.591M3 12h2.25m-.197-5.303 1.591 1.591"
                    />
                  </svg>
                  <p className="text-xs">
                    Di chuột vào các chấm điểm trên địa cầu để xem thông tin chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
