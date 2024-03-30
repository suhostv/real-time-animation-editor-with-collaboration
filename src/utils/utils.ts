import { v4 as uuid } from 'uuid';

export const attachUidsToLayers = (jsonData = {}) => {
  const simplifiedLayersData = simplifyJson(jsonData);

  const addUids = (layersData) => {
    layersData?.forEach(layer => {
      layer.uniqueId = uuid();

      if (layer.layers) {
        addUids(layer.layers);
      }
    });
  }

  addUids(simplifiedLayersData)

  return jsonData;
}


const simplifyJson = (jsonData ={}) => {

  jsonData?.assets?.forEach(asset => {
    asset?.layers?.forEach(layer => {
      if (layer.refId) {
        layer.layers = jsonData.assets.find(asset => asset.id === layer.refId).layers;
      }
    });
  });
  
  jsonData?.layers?.forEach(layer => {
    if (layer.refId) {
      layer.layers = jsonData.assets.find(asset => asset.id === layer.refId).layers;
    }
  });

  return jsonData.layers;
}