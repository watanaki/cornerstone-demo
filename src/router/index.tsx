import { createBrowserRouter } from "react-router";
// import { VolumeDemo } from '../components';
import { VolumeDemo, RootLayout, StackDemo, ConvertViewPortDemo, DicomMetadataChecker } from '@components';
import { MIP } from "@/components/MIP";

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
  },
  {
    path: '/convertViewport',
    element: <ConvertViewPortDemo />
  },
  {
    path: '/metadataChecker',
    element: <DicomMetadataChecker />
  },
  {
    path: '/mip',
    element: <MIP />
  }
]);

export default router;