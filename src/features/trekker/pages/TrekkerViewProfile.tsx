import { PATHS } from '@/constants';
import ViewProfile from '@/features/profile/pages/ViewProfile';

/**
 * Wrapper của ViewProfile dành riêng cho TrekkerLayout.
 * Truyền editPath để nút "Chỉnh sửa hồ sơ" dẫn đến /trekker/profile/edit
 * thay vì /profile/edit (của MainLayout cũ).
 */
export default function TrekkerViewProfile() {
  return <ViewProfile editPath={PATHS.TREKKER_PROFILE_EDIT} />;
}
