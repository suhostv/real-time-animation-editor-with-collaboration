import { useState } from 'react'
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { LayerInterface } from '../../interfaces/lottieJsonInterface'

import './LayerItem.scss';

type handleLayerClickFunction = (layerData: LayerInterface) => void;
 
interface LayerItemInterface {
  layerInfo: LayerInterface;
  selectedLayerId: string | undefined;
  handleLayerClick: handleLayerClickFunction;
}

function LayerItem({ layerInfo, handleLayerClick, selectedLayerId }: LayerItemInterface) {
  const [nestedLayersOpened, setNestedLayersOpened] = useState(false);

  const onLayerClick = () => {
    handleLayerClick(layerInfo)
  };

  const onArrowClick = () => {
    setNestedLayersOpened(!nestedLayersOpened)
  };

  return (
    <>
      <ListItemButton onClick={onLayerClick} className={`layer-button-container ${selectedLayerId === layerInfo.uniqueId && 'active'}`}>
        <ListItemText primary={layerInfo.nm} />
        <div className="arrows-container" onClick={onArrowClick}>
          {layerInfo.layers?.length ? (nestedLayersOpened ? <ExpandLess /> : <ExpandMore />) : null}
        </div>
      </ListItemButton>
      {layerInfo.layers ? <>
        <Collapse in={nestedLayersOpened} timeout="auto" unmountOnExit style={{paddingLeft: "20px"}}>
          {
            layerInfo.layers.map(nestedLayer => (
              <LayerItem layerInfo={nestedLayer} handleLayerClick={handleLayerClick} key={nestedLayer.uniqueId} selectedLayerId={selectedLayerId} />
            ))
          }
        </Collapse>
      </> : null}
    </>
  )
}

export default LayerItem
