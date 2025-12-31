import { axiosInstance } from '@axios';

const prefix = "wadouri";
// const path = "http://192.168.1.47:3011/receive";
const path = "http://192.168.1.47:3011/receive";

export const fetchImageIds = async (seriesId: string) => {
  // const res = await axiosInstance.post<{ imageIds: string[] }>("/test_get_dicom_path", { seriesId });
  const res = await axiosInstance.post<{ imageIds: string[] }>("/test", { a: "sss" });
  const { imageIds } = res.data;

  return imageIds;
}