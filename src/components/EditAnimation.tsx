import { useState, useEffect } from 'react'
import { useQuery } from 'urql';
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import {useDropzone} from 'react-dropzone';

// import './App.css'

const FILMS_QUERY = `
  {
    featuredPublicAnimations (after: "1", before: "10") {
      edges {
        cursor
        node {
          id
          jsonUrl
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

function EditAnimation() {
  const [jsonData, setJsonData] = useState(null)
  const [animationJsonData, setAnimationJsonData] = useState(null)
  const [result] = useQuery({
    query: FILMS_QUERY,
    pause: 
  });
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone();


  useEffect(() => {
    console.log({result})
  }, [result]);

  useEffect(() => {
    fetch("https://assets-v2.lottiefiles.com/a/5a79d46c-ead3-11ee-b5c7-377fd4b5f70d/pOxXj8ucnk.json")
      .then((data) => {
        console.log({data})
        return data.json();
      })
      .then((data) => {
        console.log(data);
        setJsonData(data)
      })

  }, [])
  
  useEffect(() => {
    acceptedFiles.forEach(file => {      
      const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = (e) => {
          const data = JSON.parse(e.target.result);
          console.log("Json Data", data);
          setAnimationJsonData(data);
        }
      }
    )

  }, [acceptedFiles])

  return (
    <>
      <div style={{display: "flex", flexDirection: "column"}}>
        {animationJsonData?.layers.map((layer) => <span>
            {layer.nm}
            {layer.layers?.map((lay) => <span style={{color: "purple"}}>{lay.nm}--------</span>)}
          </span>)}
      </div>
      { jsonData && 
        <Player
          autoplay
          loop
          src={jsonData}
          style={{ height: '300px', width: '300px' }}
        >
          <Controls visible={true} buttons={['play', 'repeat', 'frame', 'debug']} />
        </Player>
      }
      <section className="container">
        <div {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop Lottie JSON file, or click to select files</p>
        </div>
      </section>
      { animationJsonData && 
        <Player
          autoplay
          loop
          src={animationJsonData}
          style={{ height: '300px', width: '300px' }}
        >
          <Controls visible={true} buttons={['play', 'repeat', 'frame', 'debug']} />
        </Player>
      }
    </>
  )
}

export default EditAnimation
