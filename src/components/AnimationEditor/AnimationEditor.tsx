import { useState } from 'react'
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import useWebSocket from 'react-use-websocket';
import LayersSidebar from '../LayersSidebar/LayersSidebar';
import homepageLogo from '../../assets/homepage-logo.jpeg'
import { WS_URL, ONLINE_STATUS_CHANGE_TYPE } from '../../utils/constants'

import './AnimationEditor.scss';
import LayerDetails from '../LayerDetails/LayerDetails';
import { LayerInterface, LottieJsonInterface } from '../../interfaces/lottieJsonInterface'


type handleDeleteLayerFunction = (a: string | undefined) => void;
type handleChangeColorFunction = (id: string | undefined, newColor: Array<number>) => void;
type goToHomepageFunction = () => void;

interface AnimationEditorInterface {
  animationJsonData: LottieJsonInterface;
  handleDeleteLayer: handleDeleteLayerFunction;
  handleChangeColor: handleChangeColorFunction;
  goToHomepage: goToHomepageFunction;
}

interface MessageInterface {
  data: string;
}

function AnimationEditor({ 
  animationJsonData, 
  handleDeleteLayer, 
  handleChangeColor, 
  goToHomepage
}: AnimationEditorInterface) {
  const [selectedLayer, setSelectedLayer] = useState<LayerInterface | null>(null);
  const [collaborativeEditing, setCollaborativeEditing] = useState(false);

  const onMessageReceived = (message: MessageInterface) => {
    const { data } = message;
    const parsed = JSON.parse(data);
    if (parsed.type === ONLINE_STATUS_CHANGE_TYPE) {
      setCollaborativeEditing(parsed.collaboration);
    }
  }

  useWebSocket(WS_URL, {
    onMessage: onMessageReceived,
    share: true
  });

  const handleLayerInfoChange = (layerData: LayerInterface | null) => {
    setSelectedLayer(layerData);
  };

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
        <LayersSidebar
          animationJsonData={animationJsonData}
          selectedLayer={selectedLayer}
          handleLayerClick={handleLayerInfoChange}
        />
        <Player
          autoplay
          loop
          src={animationJsonData}
          style={{ height: '300px', width: '300px' }}
        >
          <Controls visible={true} buttons={['play', 'repeat', 'frame', 'debug']} />
        </Player>
        <LayerDetails 
          selectedLayer={selectedLayer}
          handleDeleteLayer={handleDeleteLayer}
          handleChangeColor={handleChangeColor}
          handleLayerInfoChange={handleLayerInfoChange}
        />
      </div>
    </div>
  )
}

export default AnimationEditor
