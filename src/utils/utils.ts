import { v4 as uuid } from 'uuid';
import { LayerInterface, LottieJsonInterface } from '../interfaces/lottieJsonInterface'

export const attachUidsToLayers = (jsonData: LottieJsonInterface = {}) => {
  const simplifiedLayersData = simplifyJson(jsonData);

  const addUids = (layersData: Array<LayerInterface> | undefined) => {
    layersData?.forEach(layer => {
      layer.uniqueId = uuid();

      if (layer.layers) {
        addUids(layer.layers);
      }
    });
  }

  addUids(simplifiedLayersData);

  return jsonData;
}


const simplifyJson = (jsonData: LottieJsonInterface = {}) => {
  jsonData?.assets?.forEach(asset => {
    asset?.layers?.forEach(layer => {
      if (layer?.refId) {
        layer.layers = jsonData?.assets?.find(asset => asset.id === layer.refId)?.layers;
      }
    });
  });
  
  jsonData?.layers?.forEach(layer => {
    if (layer?.refId) {
      layer.layers = jsonData?.assets?.find(asset => asset.id === layer.refId)?.layers;
    }
  });

  return jsonData.layers;
}