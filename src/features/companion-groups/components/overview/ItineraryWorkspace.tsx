import {
  Building2,
  Clock,
  Compass,
  Copy,
  Layers,
  MapPin,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';

export interface Waypoint {
  id: string;
  order: number;
  name: string;
  category: string; // e.g. "Tập kết & Khởi hành", "Trạm ăn trưa", "Đỉnh săn mây chính"
  distanceAltitude: string; // e.g. "0 km", "210 km", "1.600m", "1.800m"
  gps: string;
  imageUrl: string;
}

export interface ItineraryActivity {
  id: string;
  dayId: string; // e.g. "day-1", "day-2", "day-3"
  timeSlot: 'morning' | 'noon' | 'afternoon' | 'evening';
  timeRange: string; // e.g. "06:00 - 07:15"
  title: string;
  location: string;
  assignee: string; // e.g. "Minh (Leader)"
}

export interface DayColumn {
  id: string;
  title: string; // e.g. "Ngày 1 (18/10)"
  subtitle: string; // e.g. "Hà Nội - Bắc Yên - Bãi Lều"
}

const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'wp-1',
    order: 1,
    name: 'Bến xe Mỹ Đình (Hà Nội)',
    category: 'Tập kết & Khởi hành',
    distanceAltitude: '0 km',
    gps: '21.0285° N, 105.7781° E',
    imageUrl:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-2',
    order: 2,
    name: 'Thị Trấn Bắc Yên',
    category: 'Trạm ăn trưa & Đổi xe',
    distanceAltitude: '210 km',
    gps: '21.2461° N, 104.4328° E',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-3',
    order: 3,
    name: 'Bãi Lều Gió Tà Xùa',
    category: 'Trọng điểm Cắm trại & BBQ',
    distanceAltitude: '1.600m',
    gps: '20.3582° N, 104.3610° E',
    imageUrl:
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'wp-4',
    order: 4,
    name: 'Sống Lưng Khủng Long',
    category: 'Đỉnh săn mây chính',
    distanceAltitude: '1.800m',
    gps: '20.3621° N, 104.3705° E',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
  },
];

const INITIAL_DAYS: DayColumn[] = [
  { id: 'day-1', title: 'Ngày 1 (18/10)', subtitle: 'Hà Nội - Bắc Yên - Bãi Lều' },
  { id: 'day-2', title: 'Ngày 2 (19/10)', subtitle: 'Sống Lưng Khủng Long' },
  { id: 'day-3', title: 'Ngày 3 (20/10)', subtitle: 'Thu Dọn & Về Hà Nội' },
];

const INITIAL_ACTIVITIES: ItineraryActivity[] = [
  // DAY 1
  {
    id: 'act-1',
    dayId: 'day-1',
    timeSlot: 'morning',
    timeRange: '06:00 - 07:15',
    title: 'Tập trung Bến xe Mỹ Đình',
    location: 'Bến xe Mỹ Đình',
    assignee: 'Minh (Leader)',
  },
  {
    id: 'act-2',
    dayId: 'day-1',
    timeSlot: 'morning',
    timeRange: '07:30 - 11:30',
    title: 'Di chuyển Limousine đi Bắc Yên',
    location: 'Tuyến QL32 - Sơn La',
    assignee: 'Nam (Lái xe)',
  },
  {
    id: 'act-3',
    dayId: 'day-1',
    timeSlot: 'noon',
    timeRange: '11:30 - 13:00',
    title: 'Ăn trưa tại thị trấn Bắc Yên',
    location: 'Nhà hàng Cơm Phố',
    assignee: 'Anh (Thủ quỹ)',
  },
  {
    id: 'act-4',
    dayId: 'day-1',
    timeSlot: 'afternoon',
    timeRange: '13:30 - 17:00',
    title: 'Trekking chặng 1 lên bãi lều',
    location: 'Cung đường Rừng Trúc',
    assignee: 'Minh (Leader)',
  },
  {
    id: 'act-5',
    dayId: 'day-1',
    timeSlot: 'afternoon',
    timeRange: '17:00 - 18:00',
    title: 'Dựng lều & Nhóm lửa cắm trại',
    location: 'Bãi lều Gió Tà Xùa',
    assignee: 'Dũng (Thiết bị)',
  },
  {
    id: 'act-6',
    dayId: 'day-1',
    timeSlot: 'evening',
    timeRange: '18:30 - 21:00',
    title: 'Bữa tối BBQ & Sinh hoạt nhóm',
    location: 'Bãi lều Gió Tà Xùa',
    assignee: 'Trang & Dũng',
  },

  // DAY 2
  {
    id: 'act-7',
    dayId: 'day-2',
    timeSlot: 'morning',
    timeRange: '05:30 - 07:00',
    title: 'Đón bình minh & Ăn sáng nhẹ',
    location: 'Bãi lều Gió Tà Xùa',
    assignee: 'Trang (Hậu cần)',
  },
  {
    id: 'act-8',
    dayId: 'day-2',
    timeSlot: 'morning',
    timeRange: '07:30 - 11:30',
    title: 'Chinh phục Sống Lưng Khủng Long',
    location: 'Sống Lưng Khủng Long',
    assignee: 'Toàn đội',
  },
  {
    id: 'act-9',
    dayId: 'day-2',
    timeSlot: 'noon',
    timeRange: '12:00 - 13:30',
    title: 'Dùng bữa trưa giữa núi',
    location: 'Trạm dừng Sống Lưng',
    assignee: 'Trang (Hậu cần)',
  },
  {
    id: 'act-10',
    dayId: 'day-2',
    timeSlot: 'afternoon',
    timeRange: '13:30 - 16:30',
    title: 'Chụp ảnh ngắm mây hoàng hôn',
    location: 'Đỉnh Tà Xùa',
    assignee: 'Nam (Media)',
  },
  {
    id: 'act-11',
    dayId: 'day-2',
    timeSlot: 'evening',
    timeRange: '18:30 - 21:00',
    title: 'Đêm nhạc acoustic ngoài trời',
    location: 'Bãi lều Gió Tà Xùa',
    assignee: 'Toàn đội',
  },

  // DAY 3
  {
    id: 'act-12',
    dayId: 'day-3',
    timeSlot: 'morning',
    timeRange: '06:30 - 08:00',
    title: 'Ăn sáng & Thu dọn lều rác',
    location: 'Bãi lều Gió Tà Xùa',
    assignee: 'Toàn đội',
  },
  {
    id: 'act-13',
    dayId: 'day-3',
    timeSlot: 'noon',
    timeRange: '11:30 - 13:00',
    title: 'Bữa trưa tổng kết chuyến đi',
    location: 'Nhà hàng Tây Bắc',
    assignee: 'Anh (Thủ quỹ)',
  },
  {
    id: 'act-14',
    dayId: 'day-3',
    timeSlot: 'afternoon',
    timeRange: '13:30 - 18:30',
    title: 'Di chuyển Limousine về Hà Nội',
    location: 'Tuyến QL32 - Mỹ Đình',
    assignee: 'Minh (Leader)',
  },
  {
    id: 'act-15',
    dayId: 'day-3',
    timeSlot: 'evening',
    timeRange: '19:30 - 20:00',
    title: 'Về đến Hà Nội - Kết thúc chuyến đi',
    location: 'Bến xe Mỹ Đình',
    assignee: 'Minh (Leader)',
  },
];

const TIME_SLOTS = [
  {
    id: 'morning',
    label: 'SÁNG',
    time: '06:00 - 11:30',
    colorClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  {
    id: 'noon',
    label: 'TRƯA',
    time: '11:30 - 13:30',
    colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'afternoon',
    label: 'CHIỀU',
    time: '13:30 - 18:00',
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
  {
    id: 'evening',
    label: 'TỐI',
    time: '18:00 - 22:00',
    colorClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  },
] as const;

export function ItineraryWorkspace() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  const [days, setDays] = useState<DayColumn[]>(INITIAL_DAYS);
  const [activities, setActivities] = useState<ItineraryActivity[]>(INITIAL_ACTIVITIES);

  // Modals state
  const [isWaypointModalOpen, setIsWaypointModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const waypointModalRef = useClickOutside<HTMLDivElement>(
    () => setIsWaypointModalOpen(false),
    isWaypointModalOpen
  );
  const activityModalRef = useClickOutside<HTMLDivElement>(
    () => setIsActivityModalOpen(false),
    isActivityModalOpen
  );

  // Form states - Waypoint
  const [wpName, setWpName] = useState('');
  const [wpCategory, setWpCategory] = useState('');
  const [wpDistance, setWpDistance] = useState('');
  const [wpGps, setWpGps] = useState('');
  const [wpImage, setWpImage] = useState('');

  // Form states - Activity
  const [actDayId, setActDayId] = useState('day-1');
  const [actSlot, setActSlot] = useState<'morning' | 'noon' | 'afternoon' | 'evening'>('morning');
  const [actTime, setActTime] = useState('');
  const [actTitle, setActTitle] = useState('');
  const [actLocation, setActLocation] = useState('');
  const [actAssignee, setActAssignee] = useState('');

  // Handlers
  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpName) return;

    const newWp: Waypoint = {
      id: `wp-${Date.now()}`,
      order: waypoints.length + 1,
      name: wpName,
      category: wpCategory || 'Trạm dừng chân',
      distanceAltitude: wpDistance || '0 km',
      gps: wpGps || '21.0000° N, 105.0000° E',
      imageUrl:
        wpImage ||
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    };

    setWaypoints([...waypoints, newWp]);
    setWpName('');
    setWpCategory('');
    setWpDistance('');
    setWpGps('');
    setWpImage('');
    setIsWaypointModalOpen(false);
  };

  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    const newDay: DayColumn = {
      id: `day-${Date.now()}`,
      title: `Ngày ${nextDayNum}`,
      subtitle: `Lộ trình mở rộng ${nextDayNum}`,
    };
    setDays([...days, newDay]);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) return;

    const newAct: ItineraryActivity = {
      id: `act-${Date.now()}`,
      dayId: actDayId,
      timeSlot: actSlot,
      timeRange: actTime || '08:00 - 09:00',
      title: actTitle,
      location: actLocation || 'Địa điểm tập trung',
      assignee: actAssignee || 'Toàn đội',
    };

    setActivities([...activities, newAct]);
    setActTitle('');
    setActLocation('');
    setActAssignee('');
    setActTime('');
    setIsActivityModalOpen(false);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const handleDeleteWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* VENDOR TOUR INHERITANCE BANNER */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <Copy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-foreground text-xs">
                Kế thừa từ Tour Vendor: Tour Tà Xùa Săn Mây 3N2Đ
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
                Custom Journey Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Đơn vị phát hành lộ trình mẫu:{' '}
              <strong className="text-foreground">Hmong Travel & Experience</strong>. Trưởng nhóm và
              thành viên có thể tự do chỉnh sửa mốc thời gian, checkpoint bên dưới.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-background px-3 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
            <Building2 className="h-3.5 w-3.5 text-amber-600" />
            B2C ➔ C2C Clone Mode
          </span>
        </div>
      </div>

      {/* SECTION 1: WAYPOINTS STRIP */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <h3 className="text-base font-extrabold text-foreground">
                Danh Sách Các Điểm Đến Đã Setup
              </h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {waypoints.length} Checkpoints
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Các mốc tọa độ chính xác và địa điểm dừng chân quan trọng trên cung đường trekking Tà
              Xùa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsWaypointModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            Thêm Điểm Đến Mới
          </button>
        </div>

        {/* Waypoints Cards Carousel / Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {waypoints.map((wp) => (
            <div
              key={wp.id}
              className="group relative rounded-2xl border border-border bg-background overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image & Badge Header */}
              <div className="relative h-32 w-full overflow-hidden bg-muted">
                <img
                  src={wp.imageUrl}
                  alt={wp.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Order Badge */}
                <span className="absolute top-2.5 left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-extrabold shadow-md">
                  #{wp.order}
                </span>

                {/* Delete action button */}
                <button
                  type="button"
                  onClick={() => handleDeleteWaypoint(wp.id)}
                  className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-black/50 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Xóa checkpoint"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Category & Distance Tag */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/90">
                  <span className="font-semibold truncate max-w-[130px]">{wp.category}</span>
                  <span className="rounded-full bg-white/20 backdrop-blur-xs px-2 py-0.5 font-extrabold text-[10px]">
                    {wp.distanceAltitude}
                  </span>
                </div>
              </div>

              {/* Waypoint Details */}
              <div className="p-3.5 space-y-2">
                <h4 className="font-extrabold text-foreground text-xs line-clamp-1 group-hover:text-primary transition-colors">
                  {wp.name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{wp.gps}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: MATRIX TIMELINE GRID */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-foreground">
                Thời Khóa Biểu Lộ Trình (Matrix Timeline Grid)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Phân bổ thời gian, công việc & người phụ trách theo từng buổi và theo từng ngày của
              chuyến đi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddDay}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm Ngày
            </button>

            <button
              type="button"
              onClick={() => setIsActivityModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Plus className="h-4 w-4" />
              Thêm Hoạt Động
            </button>
          </div>
        </div>

        {/* Matrix Timeline Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[700px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-36 p-3 text-left font-extrabold text-foreground uppercase tracking-wider text-[11px] border-r border-border">
                  BUỔI / THỜI GIAN
                </th>
                {days.map((day) => (
                  <th key={day.id} className="p-3 text-left border-r border-border last:border-r-0">
                    <span className="block font-black text-foreground text-xs">{day.title}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {day.subtitle}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot.id} className="border-b border-border last:border-b-0 align-top">
                  {/* Slot Label Header Cell */}
                  <td className="p-3 border-r border-border bg-muted/20">
                    <div className="space-y-1">
                      <span
                        className={cn(
                          'inline-block rounded-md px-2 py-0.5 text-[10px] font-black border',
                          slot.colorClass
                        )}
                      >
                        {slot.label}
                      </span>
                      <span className="block text-[11px] font-mono text-muted-foreground">
                        {slot.time}
                      </span>
                    </div>
                  </td>

                  {/* Day Columns Cells */}
                  {days.map((day) => {
                    const slotActivities = activities.filter(
                      (a) => a.dayId === day.id && a.timeSlot === slot.id
                    );

                    return (
                      <td
                        key={day.id}
                        className="p-2.5 border-r border-border last:border-r-0 space-y-2 bg-card/40"
                      >
                        {slotActivities.length === 0 ? (
                          <div className="h-16 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-[11px] text-muted-foreground/60">
                            Chưa có hoạt động
                          </div>
                        ) : (
                          slotActivities.map((act) => (
                            <div
                              key={act.id}
                              className="group relative rounded-xl border border-border bg-card p-3 shadow-xs hover:border-primary/50 transition-all space-y-1.5"
                            >
                              {/* Time & Action Header */}
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold text-primary flex items-center gap-1">
                                  <Clock className="h-3 w-3 shrink-0" />
                                  {act.timeRange}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteActivity(act.id)}
                                  className="text-muted-foreground hover:text-rose-600 opacity-0 group-hover:opacity-100 transition p-0.5"
                                  title="Xóa hoạt động"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Title */}
                              <h5 className="font-bold text-foreground text-xs leading-snug">
                                {act.title}
                              </h5>

                              {/* Location & Assignee */}
                              <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                                <div className="flex items-center gap-1 truncate">
                                  <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                                  <span className="truncate">{act.location}</span>
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                                  <User className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{act.assignee}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD WAYPOINT */}
      {isWaypointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={waypointModalRef}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Thêm Điểm Đến Checkpoint Mới
              </h4>
              <button
                type="button"
                onClick={() => setIsWaypointModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddWaypoint} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tên điểm đến / Trạm dừng:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đỉnh Lảo Thẩn 2.860m"
                  value={wpName}
                  onChange={(e) => setWpName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Phân loại / Vai trò:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đỉnh ngắm bình minh"
                    value={wpCategory}
                    onChange={(e) => setWpCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Khoảng cách / Độ cao:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 2.860m hoặc 12 km"
                    value={wpDistance}
                    onChange={(e) => setWpDistance(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tọa độ GPS:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 22.6105° N, 103.6210° E"
                  value={wpGps}
                  onChange={(e) => setWpGps(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Link hình ảnh xem trước (URL):</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={wpImage}
                  onChange={(e) => setWpImage(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWaypointModalOpen(false)}
                  className="rounded-full border border-border bg-background px-4 py-2 font-bold text-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  Lưu Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ACTIVITY */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={activityModalRef}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                Thêm Hoạt Động Vào Lịch Trình
              </h4>
              <button
                type="button"
                onClick={() => setIsActivityModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Chọn Ngày:</label>
                  <select
                    value={actDayId}
                    onChange={(e) => setActDayId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {days.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Buổi / Khung giờ:</label>
                  <select
                    value={actSlot}
                    onChange={(e) =>
                      setActSlot(e.target.value as 'morning' | 'noon' | 'afternoon' | 'evening')
                    }
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {TIME_SLOTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Khung giờ chi tiết:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 06:00 - 07:30"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Người phụ trách chính:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Minh (Leader)"
                    value={actAssignee}
                    onChange={(e) => setActAssignee(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tên hoạt động:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khởi hành chặng 2 lên đỉnh núi"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Địa điểm diễn ra:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trạm nghỉ chân thứ 2"
                  value={actLocation}
                  onChange={(e) => setActLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="rounded-full border border-border bg-background px-4 py-2 font-bold text-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Thêm Vào Lịch Trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItineraryWorkspace;
