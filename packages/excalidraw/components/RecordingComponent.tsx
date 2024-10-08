// @ts-ignore
import React, { useState } from 'react';
import "./RecordingComponent.scss"
import { ReactMic } from 'react-mic';
import { saveAs } from 'file-saver'; // 用于保存文件到本地
import socket from '../sockioExport';
 import {
  importUsernameFromLocalStorage
} from "../../../excalidraw-app/data/localStorage";
// 如果react-mic没有提供类型定义，你可能需要在react-app-env.d.ts中添加或者在一个自定义的d.ts文件中声明
// 例如：
// declare module 'react-mic' {
//   export class ReactMic extends React.Component<ReactMicProps, any> {}
//   interface ReactMicProps {
//     record: boolean;
//     className?: string;
//     onStop?: (recordedBlob: Blob) => void;
//     onData?: (recordedBlob: Blob) => void;
//     strokeColor?: string;
//     backgroundColor?: string;
//   }
// }

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const username = importUsernameFromLocalStorage();
  
  const getCurrentTimeComponents = () => {
    let now = new Date();
    let hours = now.getHours();        // 获取当前小时
    let minutes = now.getMinutes();    // 获取当前分钟
    let seconds = now.getSeconds();    // 获取当前秒数
    let milliseconds = now.getMilliseconds(); // 获取当前毫秒数

    return [hours, minutes, seconds, milliseconds];
  }

  const startRecording = (): void => {
    setIsRecording(true);
    const currentTime = getCurrentTimeComponents();
    const recordingInfo = {
      fileName: username + "_audioInfo",
      currentTime: String(currentTime),
      status: "started"
    }
    socket.emit("receive_recording_info", recordingInfo);
  };

  const stopRecording = (): void => {
    setIsRecording(false);
  };

  const onData = (recordedBlob: Blob): void => {
    console.log('chunk of real-time data is: ', recordedBlob);
  };

  const onStop = (recordedBlob: { blob: Blob }): void => {
    saveRecording(recordedBlob);
    const currentTime = getCurrentTimeComponents();
    const recordingInfo = {
      fileName: username + "_audioInfo",
      currentTime: String(currentTime),
      status: "stopped"
    }
    socket.emit("receive_recording_info", recordingInfo);
  };



  // const saveRecording = (recordedBlob: { blob: Blob }): void => {
  //   saveAs(recordedBlob.blob, 'recording.wav'); // 保存录音为.wav文件
  // };
  const saveRecording = async (recordedBlob: { blob: Blob }): Promise<void> => {
    const formData = new FormData();
    formData.append("audio", recordedBlob.blob, `${username}_recording_${new Date().toISOString()}.mp4`);
  
    try {
      const response = await fetch("https://virtranoteapp.sci.utah.edu/api/uploadAudio", {
        method: "POST",
        body: formData,
        headers: {
          // 添加自定义头部
          ...username ? { "X-Username": username } : {"X-Username": "Anonymous"}
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      console.log(result.message); // 假设后端返回了一个消息
    } catch (error) {
      console.error('Error uploading the audio file:', error);
    }
  };

  return (
    <div className="audio-recorder-container">
      <ReactMic
        record={isRecording}
        className="sound-wave custom-mic-size"
        visualSetting = "frequencyBars"
        onStop={onStop}
        onData={onData}
        mimeType="audio/mp3"
        strokeColor="#FDBB30"
        backgroundColor="#a20a357e" />
      <button className="custom-button-for-recording" onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Recording...' : 'Start Recording'}
      </button>
    </div>
  );
}

export default AudioRecorder;
