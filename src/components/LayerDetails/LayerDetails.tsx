import { useMemo } from 'react';
import Button from '@mui/material/Button';
import { RgbaColorPicker } from "react-colorful";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import BadgeIcon from '@mui/icons-material/Badge';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { LayerInterface, ShapeInterface } from '../../interfaces/lottieJsonInterface'

import './LayerDetails.scss';

type handleDeleteLayerFunction = (a: string | undefined) => void;
type handleChangeColorFunction = (id: string | undefined, newColor: Array<number>) => void;
type handleLayerInfoChangeFunction = (a: LayerInterface | null) => void;

interface LayerDetailsInterface {
  selectedLayer: LayerInterface | null;
  handleDeleteLayer: handleDeleteLayerFunction;
  handleChangeColor: handleChangeColorFunction;
  handleLayerInfoChange: handleLayerInfoChangeFunction;
}

interface ColorInterface {
  r: number;
  g: number;
  b: number;
}

function LayerDetails({ 
  selectedLayer, 
  handleDeleteLayer, 
  handleChangeColor,
  handleLayerInfoChange
}: LayerDetailsInterface) {
  const color = useMemo(() => {
    let colorValues;
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

  const onColorChange = (...args: Array<ColorInterface>) => {
    const result = [args[0].r / 255, args[0].g / 255, args[0].b / 255];
    handleChangeColor(selectedLayer?.uniqueId, result);

    const selectedLayerCopy = {...selectedLayer};

    function iterate(shape: ShapeInterface) {
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

    selectedLayerCopy?.shapes?.some(iterate);
    handleLayerInfoChange(selectedLayerCopy)
  };

  const onLayerDelete = () => {
    handleDeleteLayer(selectedLayer?.['uniqueId']);
    handleLayerInfoChange(null);
  };

  return (
    <div className='animations-editor-layer-editor'>
      <div className='animations-editor-layer-editor-container'>
        {selectedLayer && (
          <>
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <BadgeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={`Name: ${selectedLayer?.nm}`} />
              </ListItem>
              {color &&
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <ColorLensIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText>
                    <div>
                      <span 
                        className="color-element"
                        style={{borderColor: `rgb(${color[0] * 255} ${color[1] * 255} ${color[2] * 255})`}}
                      >
                        Color: 
                      </span>
                    </div>
                  </ListItemText>
                </ListItem>
              }
            </List>
            {color && 
              <RgbaColorPicker onChange={onColorChange} />
            }
            <Button 
              variant="contained"
              color="error"
              className="delete-button"
              onClick={onLayerDelete}
            >
              Delete Layer
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default LayerDetails
