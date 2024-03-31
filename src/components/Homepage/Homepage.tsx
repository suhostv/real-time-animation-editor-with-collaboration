import { useState, useEffect } from 'react'
import {useDropzone} from 'react-dropzone';
import { useQuery } from 'urql';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Snackbar from '@mui/material/Snackbar';
import { attachUidsToLayers } from '../../utils/utils'
import { LottieJsonInterface } from '../../interfaces/lottieJsonInterface'

import './Homepage.scss';

const DEFAULT_HIDE_NOTIFICATION_TIMER = 10000;
const FILMS_QUERY = `
  {
    featuredPublicAnimations {
      edges {
        node {
          id
          name
          jsonUrl
          imageUrl
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`;

const modalContentStyles = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  color: 'black',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface EdgeInterface {
  node: NodeInterface;
}

interface NodeInterface {
  id: string;
  imageUrl: string;
  name: string;
}

interface HomepageInterface {
  setAnimationJsonData: React.Dispatch<React.SetStateAction<LottieJsonInterface | null>>;
  setSelectedFeaturedAnimationJsonUrl: React.Dispatch<React.SetStateAction<LottieJsonInterface | null>>;
}

function Homepage({ setAnimationJsonData, setSelectedFeaturedAnimationJsonUrl }: HomepageInterface) {
  const [shouldFireQuery, setShouldFireQuery] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDataTypeNotificationShown, setIsDataTypeNotificationShown] = useState(false);

  const {acceptedFiles, getRootProps, getInputProps} = useDropzone();
  const [result] = useQuery({
    query: FILMS_QUERY,
    pause: !shouldFireQuery
  });

  const { data, fetching, error } = result;

  useEffect(() => {
    if (data?.featuredPublicAnimations?.edges && !error) {
      setShowModal(true);
    }
  }, [data, fetching, error])

  useEffect(() => {
    acceptedFiles.forEach(file => {      
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (event: Event) => {
        try {
          const inputTarget = event.target as FileReader;
          if (typeof inputTarget.result === "string") {
            const data = JSON.parse(inputTarget?.result);
            setAnimationJsonData(attachUidsToLayers(data));
          }
        } catch (error) {
          setIsDataTypeNotificationShown(true);
          console.error(error);
        }
      }
    });
  }, [acceptedFiles, setAnimationJsonData]);

  const getRandomAnimations = () => {
    if (shouldFireQuery && data) {
      setShowModal(true);
    } else {
      setShouldFireQuery(true);
    }
  }

  const handleModalClose = () => setShowModal(false);

  const selectFeaturedAnimation = async (id: string) => {
    try {
      const selectedJson = data?.featuredPublicAnimations?.edges.find((item: EdgeInterface) => item.node.id === id);
      const response = await fetch(selectedJson.node.jsonUrl);
      const jsonData = await response.json();

      setAnimationJsonData(attachUidsToLayers(jsonData));
      setSelectedFeaturedAnimationJsonUrl(selectedJson.node.jsonUrl);
    } catch (error) {
      console.error(error)
    }
  };

  const handleNotificationClose = () => {
    setIsDataTypeNotificationShown(false);
  };

  return (
    <div className="homepage-container">
      <div className="drag-n-drop-container">
        <div {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <span className="drag-n-drop-text">Drag 'n' drop Lottie JSON file, or click to select files</span>
        </div>
      </div>
      <div>
        <LoadingButton variant="contained" onClick={getRandomAnimations} loading={fetching}>Get featured Lottie animations</LoadingButton>
      </div>
      <Modal
        open={showModal}
        onClose={handleModalClose}
        className="featured-animations-modal"
      >
        <Box className="featured-animations-list-container" sx={modalContentStyles}>
          <Typography 
            variant="h6"
            className="featured-animations-list-title"
          >
            Choose your featured Lottie animation:
          </Typography>
          {data?.featuredPublicAnimations?.edges.map((item: EdgeInterface) => (
            <Typography 
              variant="h6" 
              component="h2" 
              key={item.node.id} 
              className="featured-animations-list-item"
              onClick={() => selectFeaturedAnimation(item.node.id)}
            >
              <img src={item.node.imageUrl} className='animation-frame'/>
              {item.node.name}
            </Typography>
          ))}
        </Box>
      </Modal>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isDataTypeNotificationShown}
        onClose={handleNotificationClose}
        autoHideDuration={DEFAULT_HIDE_NOTIFICATION_TIMER}
        message="Wrong file format. Are you trying to open correct JSON???"
      />
    </div>
  )
}

export default Homepage
