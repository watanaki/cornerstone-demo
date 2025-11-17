import { getRenderingEngine, RenderingEngine } from "@cornerstonejs/core";

const renderingEngineId = 'myRenderingEngine';

export const getRenderEngine = () => {
  const engine = getRenderingEngine(renderingEngineId);
  if (!engine) {
    console.log("创建renderingEngine");
    return new RenderingEngine(renderingEngineId);
  }
  return engine;
}