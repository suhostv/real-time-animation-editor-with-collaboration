import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import { useQuery } from 'urql';
// import { Player, Controls } from '@lottiefiles/react-lottie-player';
import {useDropzone} from 'react-dropzone';
import { useQuery } from 'urql';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { attachUidsToLayers, simplifyJson } from '../../utils/utils'

import './Homepage.scss';

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

const style = {
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

function Homepage({ setAnimationJsonData, setSelectedFeaturedAnimationJsonUrl }) {
  const [shouldFireQuery, setShouldFireQuery] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    try {
      acceptedFiles.forEach(file => {      
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = (e) => {
          const data = JSON.parse(e.target.result);
          setAnimationJsonData(attachUidsToLayers(data));
        }
      });
    } catch (error) {
      console.error(error);
    }

  }, [acceptedFiles, setAnimationJsonData]);

  const getRandomAnimations = () => {
    if (shouldFireQuery && data) {
      setShowModal(true);
    } else {
      setShouldFireQuery(true);
    }
  }

  const handleModalClose = () => setShowModal(false);

  const selectNode = async (id) => {
    try {
      const selectedJson = data?.featuredPublicAnimations?.edges.find(item => item.node.id === id);
      const response = await fetch(selectedJson.node.jsonUrl);
      const jsonData = await response.json();

      setAnimationJsonData(attachUidsToLayers(jsonData));
      setSelectedFeaturedAnimationJsonUrl(selectedJson.node.jsonUrl);
    } catch (error) {
      console.error(error)
    }
  }

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
        <Box className="featured-animations-list-container" sx={style}>
          <Typography 
            variant="h6"
            className="featured-animations-list-title"
            style={{fontWeight: 'bold'}}
          >
            Choose your featured Lottie animation:
          </Typography>
          {data?.featuredPublicAnimations?.edges.map(item => (
            <Typography 
              variant="h6" 
              component="h2" 
              key={item.node.id} 
              className="featured-animations-list-item"
              onClick={() => selectNode(item.node.id)}
            >
              <img src={item.node.imageUrl} style={{width: "20px", padding: "0 10px 0 0"}}/>
              {item.node.name}
            </Typography>
          ))}
        </Box>
      </Modal>
    </div>
  )
}

export default Homepage
