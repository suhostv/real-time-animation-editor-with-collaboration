import { useState, useEffect, useCallback } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Homepage from './components/Homepage/Homepage';
import AnimationEditor from './components/AnimationEditor/AnimationEditor';

import './App.css'

const WS_URL = 'ws://127.0.0.1:8000';

const CONTENT_CHANGE_TYPE = 'contentchange';
const USER_CHANGE_TYPE = 'userevent';
const ONLINE_STATUS_CHANGE_TYPE = 'onlinestatuschange'

function App() {
  const [showAnimationEditor, setShowAnimationEditor] = useState(false);
  const [animationJsonData, setAnimationJsonData] = useState(null);
  const [selectedFeaturedAnimationJsonUrl, setSelectedFeaturedAnimationJsonUrl] = useState(null);

  const onMessageReceived = ({ data }) => {
    const parsed = JSON.parse(data);
    console.log({parsed});
    if (parsed.type === CONTENT_CHANGE_TYPE) {
      setAnimationJsonData(parsed.data)
    }
  }

  const { sendJsonMessage, readyState, lastMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    onMessage: onMessageReceived,
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true
  });

  const updateJsonDataOnServer = useCallback((jsonData, additionalFields = {}) => {
    console.log({additionalFields})
    sendJsonMessage({
      type: CONTENT_CHANGE_TYPE,
      content: jsonData,
      ...additionalFields
    });
    
  }, [sendJsonMessage]);

  useEffect(() => {
    if(selectedFeaturedAnimationJsonUrl && readyState === ReadyState.OPEN) {
      console.log("called while choose featured animation")
      sendJsonMessage({
        type: USER_CHANGE_TYPE,
        editableAnimation: selectedFeaturedAnimationJsonUrl,
      });
      updateJsonDataOnServer(animationJsonData, {initialData: true})
    }
  }, [selectedFeaturedAnimationJsonUrl, updateJsonDataOnServer, sendJsonMessage, readyState]);
  
  useEffect(() => {
    console.log({lastMessage, lastJsonMessage});
  }, [lastMessage, lastJsonMessage]);
  
  const handleDeleteLayer = (uid) => {
    const animationJsonDataCopy = {...animationJsonData};
    animationJsonDataCopy.layers

    function iter(layer, index, array) {
      if (layer.uniqueId === uid) {
          array.splice(index, 1);
          return true;
      }
      return Array.isArray(layer.layers) && layer.layers.some(iter);
    }

    animationJsonDataCopy.layers.some(iter);
    setAnimationJsonData(animationJsonDataCopy);
    updateJsonDataOnServer(animationJsonDataCopy);
  };

  useEffect(() => {
    const shouldShowAnimationEditor = !!animationJsonData;
    if (shouldShowAnimationEditor !== showAnimationEditor) {
      setShowAnimationEditor(shouldShowAnimationEditor);
    }
  }, [animationJsonData]);

  useEffect(() => {
    console.log({showAnimationEditor})
  }, [showAnimationEditor])

  const handleChangeColor = (id: string, newColor) => {
    const animationJsonDataCopy = {...animationJsonData};

    animationJsonDataCopy.layers

    function iter(layer, index, array) {
      if (layer.uniqueId === id) {
          const shapes = layer?.shapes;
          shapes?.forEach(shape => {
            if (shape.ty === "fl" && shape.c.k.length >= 3 && shape.c.k.length <= 4) {
              shape.c.k === newColor;
            } else if (shape.ty === "gr") {
              shape.it.forEach(el => {
                if (el.ty === "fl" && el.c.k.length >= 3 && el.c.k.length <= 4) {
                  el.c.k = newColor;
                } 
              })
            }
          });
          return true;
      }
      return Array.isArray(layer.layers) && layer.layers.some(iter);
    }

    animationJsonDataCopy.layers.some(iter);
    setAnimationJsonData(animationJsonDataCopy);
    updateJsonDataOnServer(animationJsonDataCopy);
  }

  const goToHomepage = () => {
    setAnimationJsonData(null);
    setSelectedFeaturedAnimationJsonUrl(null);
    sendJsonMessage({
      type: ONLINE_STATUS_CHANGE_TYPE,
      collaboration: false
    });
  }

  return (
    <>
      {showAnimationEditor 
        ? <AnimationEditor animationJsonData={animationJsonData} handleDeleteLayer={handleDeleteLayer} handleChangeColor={handleChangeColor} goToHomepage={goToHomepage} selectedFeaturedAnimationJsonUrl={selectedFeaturedAnimationJsonUrl} />
        : <Homepage setAnimationJsonData={setAnimationJsonData} setSelectedFeaturedAnimationJsonUrl={setSelectedFeaturedAnimationJsonUrl} />
      }
    </>
  )
}

export default App
