import ChatBox from "./Components/ChatBox";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://192.168.1.105:4000");

function App() {
  return <ChatBox socket={socket} />;
}

export default App;
