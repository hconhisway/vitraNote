import React, { useState, useEffect, useRef } from 'react';
import { isMagicFrameElement } from '../element/typeChecks';
import socket from '../sockioExport';

 import {
  AppProps,
  AppState,
  ExcalidrawProps,
  BinaryFiles,
  UIAppState,
  AppClassProperties,
} from "../types";

 interface ImageDisplayProps {
  appState: AppState;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({appState}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [imageId, setImageId] = useState('');
  const [imageName, setImageName] = useState('');
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
      console.log(imageSizeInfo);
      const currentTime = getCurrentTimeComponents();
      const imageInfo = {
        imageId: imageId,
        sizeInfo: imageSizeInfo,
        currentTime: currentTime,
        fileName: "Userstudy009"
      };
  
      // 发送数据给后端
      socket.emit('record_image_switch', imageInfo);
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const rawImageData = await getCurrentImage();
        console.log(rawImageData)
        setImageSrc(rawImageData.data);
        setImageId(rawImageData._id);
        setImageName(rawImageData.name);
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
        <>
         <p style={{
                position: 'absolute',
                left: '25%',
                top: '14%', // 距离容器顶部10%
                zIndex: 2, // 控制文字位于图片之上
                color: 'black', // 文字颜色
                fontSize: '15px', // 字体大小
                // textAlign: 'center', // 文字居中
                whiteSpace: 'pre-line'
            }}>
                {/* {(() => {
                    switch (imageName) {
                        case "1920px-Minard_Update.png":
                            return 'Part I:  this map portrays the losses suffered by Napoleon\'s army in the Russian campaign of 1812.\n The thickness of the thick band shows the size of the army at each position. \n The path of Napoleon\'s retreat from Moscow in the cold winter is depicted by the dark lower band, which is tied to temperature and time scales. \nDiscuss the key events of Napoleon\'s march, you can discuss the type, location, timing, and cause of the events';
                        case "LosA.jpg":
                        case "SanF.jpg":
                        case "SLC.jpg":
                        case "Chicago.jpg":
                        case "Boston.jpg":
                        case "newYork.jpg":
                            return 'Part II: There are 5 maps showing different U.S. cities\' segregation conditions, here, one dot represents 120 people. Different ethical group are colored in different colors. \n Your task: 1. for each map, identify any patterns in how neighborhoods are segregated \n 2. Compare different cities, what similarities and differences do you notice in the patterns of segregation? \n3. Discuss any other findings';
                        case "TUS.jpg":
                            return 'Part II: This map shows the general segregation conditions in the US, here, one dot represents 12,000 people. \n Different ethical group are colored in different colors. \n Your task: 1. Discuss any patterns in how different census groups are distributed across the country \n 2. Discuss any other findings';
                        case "FIrehotspot.jpg":
                        case "Storms.jpg":
                        case "ArcticSeaIce.jpg":
                        case "SeasonalTemp.jpg":
                          return 'Part III: Can you analyze any long-term trends in global temperatures and climate change? \nDiscuss what you find from the graphs. Move to the next one once you finished.'
                        case "CovidTypes.jpg":
                          return "Part IV: COVID-19 virus has evolved into different types during its spread. Below shows how the novel coronavirus has evolved\n and the proportion of different types. Analyze the evolutionary trends of different types of virus."
                        case "CovidTypesUSIndia.jpg":
                          return "Compare and discuss the similarities and differences between US and India in the evolution of different virus types."
                        case "CovidTypesGraph.jpg":
                          return "This mutation graph shows how the virus has evolved step by step, discuss what you find in this graph"
                        }
                })()} */}
            </p>
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Display"
          onLoad={handleImageLoad}
          style={{
            opacity: appState.InteractiveVisVisibility ? '0' : '100',
            height: '60%', // 图片宽度为容器的60%
            position: 'absolute',
            top: '25%', // 距离容器顶部25%
            // bottom: '15%', // 距离容器底部15%
            objectFit: 'contain', // 保持图片原始长宽比
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.22)', // 阴影效果
            zIndex: 1, // 控制 z-index
          }}
        />
        </>
      )}
    </div>
  );
};

export default ImageDisplay;
