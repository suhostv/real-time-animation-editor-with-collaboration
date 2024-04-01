import { useState, useEffect, useCallback } from 'react'
import usePrevious from './utils/hooks/usePrevious';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Homepage from './components/Homepage/Homepage';
import AnimationEditor from './components/AnimationEditor/AnimationEditor';
import { 
  WS_URL,
  CONTENT_CHANGE_TYPE,
  USER_CHANGE_TYPE, ONLINE_STATUS_CHANGE_TYPE
} from './utils/constants';
import { LayerInterface, LottieJsonInterface } from './interfaces/lottieJsonInterface'

import './App.css';

interface MessageInterface {
  data: string;
}

function App() {
  const [animationJsonData, setAnimationJsonData] = useState<LottieJsonInterface | null>(null);
  const [selectedFeaturedAnimationJsonUrl, setSelectedFeaturedAnimationJsonUrl] = useState<LottieJsonInterface | null>(null);
  const previousSelectedFeaturedAnimationJsonUrl = usePrevious(selectedFeaturedAnimationJsonUrl);

  const onMessageReceived = ({ data }: MessageInterface) => {
    const parsed = JSON.parse(data);
    if (parsed.type === CONTENT_CHANGE_TYPE) {
      setAnimationJsonData(parsed.data)
    }
  }

  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    onMessage: onMessageReceived,
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true
  });

  const updateJsonDataOnServer = useCallback((jsonData: LottieJsonInterface | null, additionalFields = {}) => {
    sendJsonMessage({
      type: CONTENT_CHANGE_TYPE,
      content: jsonData,
      ...additionalFields
    });
    
  }, [sendJsonMessage]);

  useEffect(() => {
    if(
      selectedFeaturedAnimationJsonUrl && 
      previousSelectedFeaturedAnimationJsonUrl !== selectedFeaturedAnimationJsonUrl &&
      readyState === ReadyState.OPEN
    ) {
      sendJsonMessage({
        type: USER_CHANGE_TYPE,
        editableAnimation: selectedFeaturedAnimationJsonUrl,
      });
      updateJsonDataOnServer(animationJsonData, { initialData: true })
    }
  }, [
    previousSelectedFeaturedAnimationJsonUrl,
    animationJsonData,
    selectedFeaturedAnimationJsonUrl, 
    updateJsonDataOnServer,
    sendJsonMessage,
    readyState
  ]);
  
  const handleDeleteLayer = (uid: string | undefined) => {
    const animationJsonDataCopy = {...(animationJsonData ? animationJsonData : {})};
    animationJsonDataCopy.layers

    function iterate(layer: LayerInterface, index: number, array: Array<LayerInterface>) {
      if (layer.uniqueId === uid) {
          array.splice(index, 1);
          return true;
      }
      return Array.isArray(layer.layers) && layer.layers.some(iterate);
    }

    animationJsonDataCopy?.layers?.some(iterate);
    setAnimationJsonData(animationJsonDataCopy);
    updateJsonDataOnServer(animationJsonDataCopy);
  };

  const handleChangeColor = (id: string | undefined, newColor: Array<number>) => {
    const animationJsonDataCopy = {...(animationJsonData ? animationJsonData : {})};

    animationJsonDataCopy.layers

    function iterate(layer: LayerInterface) {
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
      return Array.isArray(layer.layers) && layer.layers.some(iterate);
    }

    animationJsonDataCopy?.layers?.some(iterate);
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
      {animationJsonData 
        ? <AnimationEditor 
            animationJsonData={animationJsonData}
            handleDeleteLayer={handleDeleteLayer}
            handleChangeColor={handleChangeColor}
            goToHomepage={goToHomepage}
          />
        : <Homepage 
            setAnimationJsonData={setAnimationJsonData}
            setSelectedFeaturedAnimationJsonUrl={setSelectedFeaturedAnimationJsonUrl}
          />
      }
    </>
  )
}

export default App
