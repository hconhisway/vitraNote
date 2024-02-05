import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
const socket = io('http://localhost:3002');

const ImageDisplay = () => {
  const [imageSrc, setImageSrc] = useState('');

  const getCurrentImage = async () => {
    const response = await fetch('http://localhost:3002/images/current');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const { data } = await response.json();
    return data; // 直接返回图片的 URL
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageData = await getCurrentImage();
        setImageSrc(imageData);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };
    const handleCurrentImageUpdated = () => {
        fetchImage();
    };
    fetchImage();
    socket.on('current_image_updated', handleCurrentImageUpdated);
    return () => {
      socket.off('current_image_updated', handleCurrentImageUpdated);
    };
  }, []);

  return (
    <div style={{
        position: 'absolute', // 绝对定位
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Display"
          style={{
            height: '60%', // 图片宽度为容器的60%
            position: 'absolute',
            top: '25%', // 距离容器顶部25%
            // bottom: '15%', // 距离容器底部15%
            objectFit: 'contain', // 保持图片原始长宽比
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.22)', // 阴影效果
            zIndex: 1, // 控制 z-index
          }}
        />
      )}
    </div>
  );
};

export default ImageDisplay;
