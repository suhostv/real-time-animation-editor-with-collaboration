export interface ColorInterface {
  k: Array<number>;
  a: number;
  ix: number;
}

export interface ShapeInterface {
  ty: string;
  c: ColorInterface;
  it: Array<ShapeInterface>; 
}

export interface LayerInterface {
  uniqueId?: string;
  nm?: string;
  refId?: string;
  layers?: Array<LayerInterface>;
  shapes?: Array<ShapeInterface> 
}

export interface AssetInterface {
  id: string;
  layers?: Array<LayerInterface>;
}

export interface LottieJsonInterface {
  assets?: Array<AssetInterface>;
  layers?: Array<LayerInterface>;
}