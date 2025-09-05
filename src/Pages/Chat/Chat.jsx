import SideNav from'../../Components/SideNav/SideNav.jsx';
import ChatContent from'../../Components/ChatContent/ChatContent.jsx'
import "./chat.css"

const Chat = () => {
  return (
    <div className="chatpage">
      <aside className="chatpage-sidenav">
        <SideNav />
      </aside>
      <main className="chatpage-main">
        <ChatContent />
      </main>
    </div>
  );
};
       
    

export default Chat