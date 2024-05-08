import { Outlet } from '@modern-js/runtime/router';
import MV4AppShell from '@/ui/component/app/MV4AppShell';

export default function AppLayout() {
  return (
    <MV4AppShell>
      <Outlet />
    </MV4AppShell>
  );
}
