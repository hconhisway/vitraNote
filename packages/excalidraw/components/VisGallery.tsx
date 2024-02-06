import React, { useState, useEffect } from 'react';
import deleteIcon from '../../excalidraw/assets/delete.svg'
import { AppClassProperties, AppProps, UIAppState, Zoom } from "../types";
import io from 'socket.io-client';
import { actionClearCanvas } from '../actions/index';
import { useExcalidrawActionManager } from "./App";

interface Image {
  _id: string;
  data: string;
}
const socket = io("https://virtranoteapp.sci.utah.edu", { 
  path: "/api/socket.io",
 });


const SquareGallery = ({
  activeTool,
  appState,
  app,
  UIOptions,
}: {
  activeTool: UIAppState["activeTool"];
  appState: UIAppState;
  app: AppClassProperties;
  UIOptions: AppProps["UIOptions"];
}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const squareSize = 100;
  const margin = 10;
  const padding = 10;
  const actionManager = useExcalidrawActionManager();
  const maxSquaresPerRow = 3;
  const containerWidth = maxSquaresPerRow * squareSize + (maxSquaresPerRow - 1) * margin + 2 * padding + 20;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('https://virtranoteapp.sci.utah.edu/api/images');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const imagesData: Image[] = await response.json();
        setImages(imagesData);
      } catch (error) {
        console.error('Fetch error:', (error as Error).message);
      }
    };
  
    fetchImages();
  
    const handleNewImage = () => {
      fetchImages();
    };

    // const handleCurrentImageUpdated = () => {
    //   // actionManager.executeAction(actionClearCanvas);
    //   // app.setActiveTool({ type: "image" });
    // };

    const handleImageDeleted = () => {
      fetchImages(); // 图片被删除时重新获取图片
    };

    socket.on('new_image', handleNewImage);
    socket.on('image_deleted', handleImageDeleted);
    // socket.on('current_image_updated', handleCurrentImageUpdated);
    return () => {
      socket.off('new_image', handleNewImage);
      socket.off('image_deleted', handleImageDeleted);
      // socket.off('current_image_updated', handleCurrentImageUpdated);
    };
  }, []);

  // const handleDelete = async (imageId: string) => {
  //   try {
  //     const response = await fetch(`http://localhost:3002/images/${imageId}`, { method: 'DELETE' });
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }
  //     setImages(prevImages => prevImages.filter(image => image._id !== imageId));
  //   } catch (error) {
  //     console.error('Delete error:', (error instanceof Error) ? error.message : error);
  //   }
  // };
  const handleDelete = async (imageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      // 使用Socket.io发送delete_image事件
      socket.emit('delete_image', imageId);
  
      // 你可以选择在此处立即更新前端的图片列表，或者等待服务器确认删除后再更新
    } catch (error) {
      console.error('Delete error:', (error instanceof Error) ? error.message : error);
    }
  };
  
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === 'string') {
          // 发送图片数据、文件名和类型

          socket.emit('upload', e.target.result, file.name, file.type);
        }
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };  

  const handleSetCurrentImage = async (imageId: string) => {
    setSelectedImageId(imageId);
    actionManager.executeAction(actionClearCanvas);
    try {
      
      // 使用 Socket.io 或 fetch 发送当前图片的 ID 到后端
      socket.emit('set_current_image', imageId);
      // 或者使用 fetch 发送 PUT 请求
      // await fetch(`http://localhost:3002/images/setCurrent/${imageId}`, { method: 'PUT' });
  
    } catch (error) {
      console.error('Set current image error:', (error instanceof Error) ? error.message : error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      padding: `${padding}px`,
      backgroundColor: '#EEEEEE',
      borderRadius: '10px',
      width: `${containerWidth}px`,
    }}>
      {images.map((image) => (
        <div
          key={image._id}
          onClick={() => handleSetCurrentImage(image._id)}
          
          style={{
            position: 'relative',
            width: `${squareSize}px`,
            height: `${squareSize}px`,
            backgroundImage: `url(${image.data})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: image._id === selectedImageId ? '5px solid black' : '5px solid gray',
            marginRight: `${margin}px`,
            marginBottom: `${margin}px`,
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHoveredImage(image._id)}
          onMouseLeave={() => setHoveredImage(null)}
        >
          {hoveredImage === image._id && (
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                cursor: 'pointer',
                // 指定的图标样式
              }}
              onClick={(event) => handleDelete(image._id, event)}
            >
              <img src={deleteIcon} alt="Delete" style={{ width: '50px', height: '50px' }} />
            </div>
          )}
        </div>
      ))}
      <div
        style={{
          width: `${squareSize}px`,
          height: `${squareSize}px`,
          border: '5px solid gray',
          borderRadius: `${squareSize / 2 + 7}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: `${margin}px`,
          marginBottom: `${margin}px`
        }}
        onClick={() => document.getElementById('imageUpload')?.click()}
      >
        <span style={{fontSize: '60px'}}>➕</span>
      </div>
      <input
        id="imageUpload"
        type="file"
        accept="image/svg+xml, image/png, image/jpeg"
        style={{ display: 'none' }}
        onChange={handleUpload}
        onClick={(event) => event.currentTarget.value = ''}
      />
    </div>
  );
};

export default SquareGallery;
