import { createBrowserRouter } from "react-router";
// import { VolumeDemo } from '../components';
import { VolumeDemo, RootLayout, StackDemo } from '@components';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />
  },
  {
    path: '/volumeDemo',
    element: <VolumeDemo />
  },
  {
    path: '/stackDemo',
    element: <StackDemo />
  }
]);

export default router;