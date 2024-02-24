import ChatBox from "./Components/ChatBox";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:4000");

function App() {
  return <ChatBox socket={socket} />;
}

export default App;
