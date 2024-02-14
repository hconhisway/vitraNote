import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
const socket = io("https://virtranoteapp.sci.utah.edu", { 
  path: "/api/socket.io",
 });

const ImageDisplay = () => {
  const [imageSrc, setImageSrc] = useState('');
  const [imageId, setImageId] = useState('');
  const imageRef = useRef(null);
  const getCurrentImage = async () => {
    const response = await fetch('https://virtranoteapp.sci.utah.edu/api/images/current');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // const data = rawData.data;
    // console.log(rawData?._id) 
    return data; // 直接返回图片的 URL
  };
  const getCurrentTimeComponents = () => {
    let now = new Date();
    let hours = now.getHours();        // 获取当前小时
    let minutes = now.getMinutes();    // 获取当前分钟
    let seconds = now.getSeconds();    // 获取当前秒数
    let milliseconds = now.getMilliseconds(); // 获取当前毫秒数

    return [hours, minutes, seconds, milliseconds];
  }
  const handleImageLoad = () => {
    // 确保 imageRef.current 不是 null
    if (imageRef.current) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const { offsetLeft, offsetTop, clientWidth, clientHeight } = imageRef.current;
      let adjustedLeft: Number;
      let adjustedTop: Number;
      let adjustedWidth: Number;
      let adjustedHeight: Number;
      if (viewportHeight < viewportWidth * 0.5625) {
        const scaleRatio = 900 / viewportHeight;
        const widthOfOneSide = (viewportWidth - viewportHeight / 0.5625) / 2;
        adjustedLeft =  (offsetLeft - widthOfOneSide) * scaleRatio;
        adjustedTop = offsetTop * scaleRatio;
        adjustedHeight = clientHeight * scaleRatio;
        adjustedWidth = clientWidth * scaleRatio;
      } else {
        const scaleRatio = 1600 / viewportWidth;
        const heightOfOneSide = (viewportHeight - viewportWidth / 0.5625) / 2;
        adjustedLeft =  offsetLeft * scaleRatio;
        adjustedTop = (offsetTop - heightOfOneSide) * scaleRatio;
        adjustedHeight = clientHeight * scaleRatio;
        adjustedWidth = clientWidth * scaleRatio;
      }
      // 获取图片的四个角的像素坐标和像素宽高
      const imageSizeInfo = [adjustedLeft, adjustedTop, adjustedWidth, adjustedHeight];
      const currentTime = getCurrentTimeComponents();
      const imageInfo = {
        imageId: imageId,
        sizeInfo: imageSizeInfo,
        currentTime: currentTime,
        fileName: "guanqunTest"
      };
  
      // 发送数据给后端
      // socket.emit('record_image_switch', imageInfo);
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const rawImageData = await getCurrentImage();
        setImageSrc(rawImageData.data);
        setImageId(rawImageData._id)
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
          ref={imageRef}
          src={imageSrc}
          alt="Display"
          onLoad={handleImageLoad}
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
