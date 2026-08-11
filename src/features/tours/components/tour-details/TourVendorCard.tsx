import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '@/config/apiClient';
import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import type { ConversationResponse } from '@/features/chat/types/types';
import type { TourDetailFromApi } from '@/features/tours/types';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';

interface TourVendorCardProps {
  tour: TourDetailFromApi;
}

/** Mỗi role có route chat riêng trong portal của mình. */
function resolveChatPath(roles: string[] | undefined): string {
  const role = getPrimaryRole(roles ?? []);
  if (role === ROLES.ADMIN) return PATHS.ADMIN_CHAT;
  if (role === ROLES.VENDOR_MANAGER) return PATHS.VENDOR_MANAGER_CHAT;
  if (role === ROLES.VENDOR_STAFF) return PATHS.PARTNER_CHAT;
  if (role === ROLES.COORDINATOR) return PATHS.COORDINATOR_CHAT;
  if (role === ROLES.TREKKER) return PATHS.TREKKER_CHAT;
  return PATHS.CHAT;
}

/**
 * Thẻ nhà cung cấp — danh tính đơn vị tổ chức và các kênh liên hệ.
 *
 * Trước đây thẻ này gánh cả danh sách "bao gồm" (cắt còn 4 mục); giờ phần đó có
 * section riêng nên ở đây chỉ còn đúng thông tin về vendor.
 */
export function TourVendorCard({ tour }: TourVendorCardProps) {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleChat() {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để chat với nhà cung cấp.');
      return;
    }

    setIsConnecting(true);
    try {
      // Check if conversation exists instead of creating it immediately
      const response = await ApiService<ConversationResponse>('/chat/conversations/check', 'POST', {
        conversationType: 'DIRECT',
        participantIds: [tour.vendorManagerId],
      });

      if (response.data && response.data.conversationId) {
        navigate(resolveChatPath(user.roles), {
          state: { conversationId: response.data.conversationId },
        });
      } else {
        const vendorName = tour.vendorName || tour.creatorName || 'Nhà tổ chức';
        navigate(resolveChatPath(user.roles), {
          state: {
            virtualConversation: {
              type: 'DIRECT',
              participantIds: [tour.vendorManagerId],
              userName: vendorName,
              title: vendorName,
            },
          },
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối đến cuộc trò chuyện');
    } finally {
      setIsConnecting(false);
    }
  }

  const vendorName = tour.vendorName || tour.creatorName || 'Nhà tổ chức';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Nhà tổ chức
      </h2>

      <div className="flex items-center gap-3">
        {tour.vendorLogoUrl ? (
          <img
            src={tour.vendorLogoUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
            {vendorName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{vendorName}</p>
          {tour.creatorName && tour.creatorName !== vendorName && (
            <p className="truncate text-xs text-muted-foreground">Phụ trách: {tour.creatorName}</p>
          )}
        </div>
      </div>

      {(tour.vendorContactEmail || tour.vendorContactPhone) && (
        <ul className="flex flex-col gap-2 text-sm">
          {tour.vendorContactPhone && (
            <li>
              <a
                href={`tel:${tour.vendorContactPhone}`}
                className="flex items-center gap-2.5 text-foreground/80 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {tour.vendorContactPhone}
              </a>
            </li>
          )}
          {tour.vendorContactEmail && (
            <li>
              <a
                href={`mailto:${tour.vendorContactEmail}`}
                className="flex items-center gap-2.5 truncate text-foreground/80 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{tour.vendorContactEmail}</span>
              </a>
            </li>
          )}
        </ul>
      )}

      {/* Hành động phụ → viền, để CTA đặt tour ở thẻ trên giữ vai trò nút đặc duy nhất */}
      <button
        type="button"
        onClick={handleChat}
        disabled={isConnecting}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {isConnecting ? 'Đang kết nối…' : 'Nhắn cho nhà tổ chức'}
      </button>
    </div>
  );
}
