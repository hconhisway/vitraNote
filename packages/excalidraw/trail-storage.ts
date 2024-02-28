import io from 'socket.io-client';
export const storeTrails = (x: number, y: number, username: string | null) => {
    const socket = io("https://virtranoteapp.sci.utah.edu", { 
        path: "/api/socket.io",
    });
    let now = new Date();
    let hours = now.getHours();        // 获取当前小时
    let minutes = now.getMinutes();    // 获取当前分钟
    let seconds = now.getSeconds();    // 获取当前秒数
    let milliseconds = now.getMilliseconds(); // 获取当前毫秒数
    const timeComponent = [hours, minutes, seconds, milliseconds];
    const fileName = username + "_freedraw";
    const currentPoint = [x, y];
    const data = {
        fileName: fileName,
        timeComponent: timeComponent,
        currentPoint: currentPoint
    };
    // Send data to the backend
    socket.emit('trailData', data);
    // console.log(data);
};

export const storeTrailsLaser = (x: number, y: number, username: string | null) => {
    const socket = io("https://virtranoteapp.sci.utah.edu", { 
        path: "/api/socket.io",
    });
    let now = new Date();
    let hours = now.getHours();        // 获取当前小时
    let minutes = now.getMinutes();    // 获取当前分钟
    let seconds = now.getSeconds();    // 获取当前秒数
    let milliseconds = now.getMilliseconds(); // 获取当前毫秒数
    const timeComponent = [hours, minutes, seconds, milliseconds];
    const fileName = username + "_Laser";
    const currentPoint = [x, y];
    const data = {
        fileName: fileName,
        timeComponent: timeComponent,
        currentPoint: currentPoint
    };
    // Send data to the backend
    socket.emit('trailData', data);
    // console.log(data);
};