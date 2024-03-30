import { useState, useEffect, useMemo } from 'react'
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import LayerItem from '../LayerItem/LayerItem';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';
import { RgbaColorPicker } from "react-colorful";
import homepageLogo from '../../assets/homepage-logo.jpeg'

import './AnimationEditor.scss';

const WS_URL = 'ws://127.0.0.1:8000';

const CONTENT_CHANGE_TYPE = 'contentchange';
const USER_CHANGE_TYPE = 'userevent';
const ONLINE_STATUS_CHANGE_TYPE = 'onlinestatuschange'

function AnimationEditor({ animationJsonData, handleDeleteLayer, handleChangeColor, goToHomepage, selectedFeaturedAnimationJsonUrl }) {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [collaborativeEditing, setCollaborativeEditing] = useState(false);

  const onMessageReceived = (message) => {
    const { data } = message;
    const parsed = JSON.parse(data);
    if (parsed.type === ONLINE_STATUS_CHANGE_TYPE) {
      console.log("new one", {parsed, data, message});
      setCollaborativeEditing(parsed.collaboration);
    }
  }

  const { sendJsonMessage } = useWebSocket(WS_URL, {
    onMessage: onMessageReceived,
    share: true
  });

  const color = useMemo(() => {
    let colorValues = undefined;
    const shapes = selectedLayer?.shapes;
    shapes?.forEach(shape => {
      if (shape.ty === "fl" && shape.c.k.length >= 3 && shape.c.k.length <= 4) {
        colorValues = shape.c.k;
      } else if (shape.ty === "gr") {
        shape.it.forEach(el => {
          if (el.ty === "fl" && el.c.k.length >= 3 && el.c.k.length <= 4) {
            colorValues = el.c.k;
          } 
        })
      }
    });

    return colorValues;
  }, [selectedLayer]);

  const selectedLayerId = useMemo(() => {
    return selectedLayer?.uniqueId
  }, [selectedLayer]);

  useEffect(() => {
    return () => {
      console.log("unmount...")
      // sendJsonMessage({
      //   type: ONLINE_STATUS_CHANGE_TYPE,
      //   collaboration: false
      // });
    }
  }, []);
  
  const onLayerClick = (layerData) => {
    setSelectedLayer(layerData);
  }

  const onColorChange = (...args) => {
    console.log({args});
    const result = [args[0].r / 255, args[0].g / 255, args[0].b / 255];
    console.log({result});
    handleChangeColor(selectedLayer.uniqueId, result);


    const selectedLayerCopy = {...selectedLayer};

    function iter(shape, index, array) {
      if (shape.ty === "fl" && shape.c.k.length >= 3 && shape.c.k.length <= 4) {
        shape.c.k = result;
      } else if (shape.ty === "gr") {
        shape.it.forEach(el => {
          if (el.ty === "fl" && el.c.k.length >= 3 && el.c.k.length <= 4) {
            el.c.k = result;
          } 
        })
      }
    }

    selectedLayerCopy.shapes.some(iter);
    setSelectedLayer(selectedLayerCopy)
  };

  const onLayerDelete = () => {
    handleDeleteLayer(selectedLayer['uniqueId']);
    setSelectedLayer(null);
  }

  return (
    <div className='animations-editor-page-container'>
      <div className='header'>
        <img src={homepageLogo} alt="homepage logo" className='homepage-logo' onClick={goToHomepage}/>
        {collaborativeEditing && (
          <span className='online-text'>
            <div className='green-dot'/>
            Somebody is editing this animation at the same time...
          </span>
        )}
      </div>
      <div className='animations-editor-container'>
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
        <div>
          <Player
            autoplay
            loop
            src={animationJsonData}
            style={{ height: '300px', width: '300px' }}
          >
            <Controls visible={true} buttons={['play', 'repeat', 'frame', 'debug']} />
          </Player>
        </div>
        <div className='animations-editor-layer-editor'>
          <div className='animations-editor-layer-editor-container'>
            {selectedLayer && (
              <>
                <span>Layer Details</span>
                <span>Name: {selectedLayer?.nm}</span>
                {color && 
                  <div>
                    <span className="color-element" style={{borderColor: `rgb(${color[0] * 255} ${color[1] * 255} ${color[2] * 255})`}}>Color: </span>
                  </div>
                }
                {color && 
                  <RgbaColorPicker /* color={{r: color[0], g: color[1], b: color[2], a: color[3]}} */ onChange={onColorChange} />
                }
                <Button color="error" onClick={onLayerDelete}>
                  Delete Layer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimationEditor
