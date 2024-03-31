import { useMemo } from 'react'
import LayerItem from '../LayerItem/LayerItem';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import { LottieJsonInterface, LayerInterface } from '../../interfaces/lottieJsonInterface'

import './LayersSidebar.scss';

type handleLayerClickFunction = (a: LayerInterface) => void;

interface LayersSidebarInterface {
  animationJsonData: LottieJsonInterface | null;
  selectedLayer: LayerInterface | null;
  handleLayerClick: handleLayerClickFunction;
}

function LayersSidebar({ 
  animationJsonData,
  selectedLayer,
  handleLayerClick,
}: LayersSidebarInterface) {
  const selectedLayerId = useMemo(() => {
    return selectedLayer?.uniqueId
  }, [selectedLayer]);
  
  const onLayerClick = (layerData: LayerInterface) => {
    handleLayerClick(layerData);
  }

  return (
    <div className='animations-editor-layers-section'>
      <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Layers List
          </ListSubheader>
        }
      >
        {animationJsonData?.layers?.map(layer => (
          <LayerItem layerInfo={layer} handleLayerClick={onLayerClick} key={layer.uniqueId} selectedLayerId={selectedLayerId}/>
        ))}
      </List>
    </div>
  )
}

export default LayersSidebar
