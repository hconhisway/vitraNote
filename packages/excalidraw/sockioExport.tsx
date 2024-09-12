import io from 'socket.io-client';
const socket = io("https://virtranoteapp.sci.utah.edu", { 
        path: "/api/socket.io",
    });
export default socket;