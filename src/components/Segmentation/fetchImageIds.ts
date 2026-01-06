import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "http://192.168.0.147:3012",
  timeout: 10000,
});

export type BodyPart = "abdomen" | "back" | "bone" | "gluteus" | "liver";

export const fetchImageIds = async (folderName: string, part: BodyPart | null, isInput = false) => {
  const res = await axiosInstance.post<{ imageIds: string[] }>("/test", { folderName, part, isInput });
  const { imageIds } = res.data;
  return imageIds;
}
