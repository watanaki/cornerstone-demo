const prefix = "wadouri";
const path = "http://192.168.1.47:3011/receive/1.3.46.670589.11.78269.5.0.7288.2024032116284218564";
// const path = "http://192.168.1.47:3011/receive/1.3";

export const imageIds =
  new Array(40)
    .fill(0)
    .map((_, index) => {
      const name = "IMG-0002-" + (index + 1).toString().padStart(5, '0');
      return `${prefix}:${path}/${name}.dcm`;
    });

