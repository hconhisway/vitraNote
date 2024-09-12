import React, { useState, useEffect } from 'react';
import deleteIcon from '../../excalidraw/assets/delete.svg'
import { AppClassProperties, AppProps, UIAppState, Zoom } from "../types";
import { actionClearCanvas } from '../actions/index';
import { useExcalidrawActionManager } from "./App";

interface Image {
  _id: string;
  data: string;
}
import socket from '../sockioExport';


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
  const [isCollapsed, setIsCollapsed] = useState(false); // 用于跟踪组件是否被折叠

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed); // 切换组件的折叠/展开状态
  };



  const [images, setImages] = useState<Image[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const squareSize = 60;
  const margin = 10;
  const padding = 10;
  const actionManager = useExcalidrawActionManager();
  const maxSquaresPerRow = 3;
  const containerWidth = maxSquaresPerRow * squareSize + (maxSquaresPerRow - 1) * margin + 2 * padding + 42;

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

    const fetchCurrentImageId = async () => {
      try {
        const response = await fetch('https://virtranoteapp.sci.utah.edu/api/images/current');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const currentImage = await response.json();
        setSelectedImageId(currentImage?._id); // 更新selectedImageId为当前图片的ID
      } catch (error) {
        console.error('Fetch current image error:', (error as Error).message);
      }
    };

    fetchCurrentImageId();
    fetchImages();

    const handleNewImage = () => {
      fetchImages();
    };

    const handleCurrentImageUpdated = () => {
      // actionManager.executeAction(actionClearCanvas);
      // app.setActiveTool({ type: "image" });
      fetchCurrentImageId();
    };

    const handleImageDeleted = () => {
      fetchImages(); // 图片被删除时重新获取图片
    };

    socket.on('new_image', handleNewImage);
    socket.on('image_deleted', handleImageDeleted);
    socket.on('current_image_updated', handleCurrentImageUpdated);
    return () => {
      socket.off('new_image', handleNewImage);
      socket.off('image_deleted', handleImageDeleted);
      socket.off('current_image_updated', handleCurrentImageUpdated);
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
      position: 'relative'
      
    }}>
      <div
        style={{
          position: 'absolute',
          bottom: '-20px', // 根据需要调整位置以适应布局
          left: '0px', // 根据需要调整位置
          width: '40px', // 增加宽度以适应更大的图标
          height: '40px', // 增加高度以适应更大的图标
          display: 'flex',
          borderRadius: '10px',
          color: '#A20A35',
          backgroundColor: '#EEEEEE',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '40px',
          fontWeight: 900,
          cursor: 'pointer',
          // boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // 添加阴影效果以增强按钮的立体感
          transition: 'background-color 0.3s', // 添加背景色变化的过渡效果以改善悬停响应
        }}
        onClick={toggleCollapse}
      >
        {/* 根据是否折叠显示不同的图标 */}
      {isCollapsed ? '+' : '-'}
      </div>
      
      {isCollapsed ? null :(
        <div  style={{
          display: 'flex',
          flexWrap: 'wrap',
          padding: `${padding}px`,
          backgroundColor: '#EEEEEE',
          borderRadius: '10px',
          width: `${containerWidth}px`,
          position: 'relative'
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
                  display: 'flex',
                  top: -15,
                  right: -15,
                  cursor: 'pointer',
                  // 指定的图标样式
                }}
                onClick={(event) => handleDelete(image._id, event)}
              >
                <img src={deleteIcon} alt="Delete" style={{ width: '27px', height: '27px' }} />
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
          <span style={{fontSize: '40px', color: '#A20A35'}}>➕</span>
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
      )}
    </div>
  );
};

export default SquareGallery;
