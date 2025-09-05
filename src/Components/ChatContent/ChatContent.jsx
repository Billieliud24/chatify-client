import { useState, useEffect, useRef ,} from "react";
import DOMPurify from "dompurify";
import "./ChatContent.css";



const Chat = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const[typing ,setTyping] =useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const [fakeChat] = useState([
    {
      id: "fake-1",
      text: "Tja tja, hur mår du?",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      userId: "bot-1",
      conversationId: null,
    },
    {
      id: "fake-2",
      text: "Hallå!! Svara då!!",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      userId: "bot-2",
      conversationId: null,
    },
    {
      id: "fake-3",
      text: "Sover du eller?! 😴",
      avatar: "https://i.pravatar.cc/100?img=14",
      username: "Johnny",
      userId: "bot-3",
      conversationId: null,
    },
  ]);

  // normalizera medelande
  const normalizeMsg = (m) => ({
    id: m.id || m.Id || `msg-${Math.random()}`,
    text: DOMPurify.sanitize(m.text ?? ""),
    userId: m.userId ?? user?.id ?? "unknown",
    conversationId: m.conversationId ?? null,
    username: m.username || "",
    createdAt: m.createdAt ?? new Date().toISOString(),
    avatar: m.avatar || "https://i.pravatar.cc/100",
  });


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("https://chatify-api.up.railway.app/messages", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setMessages(data.map(normalizeMsg));

        } else if (Array.isArray(data.messages)) {
          setMessages(data.messages.map(normalizeMsg));

        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("kunde inte hämta meddelanden", err);
      }
    };
    fetchMessages();
  }, [user.token]);

  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

 

  

  const handleNewMesage = (e) => {
    setNewMessage(e.target.value);
    setTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 1000);
  };



    // TODO: titta på debounce: https://www.npmjs.com/package/use-debounce
  

  // sckika medelande
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    const sanitizedText = DOMPurify.sanitize(newMessage);
    const tempId = `temp-${Date.now()}`;
   
    const tempMessage = {
      id: tempId,
      username: user.username,
      avatar: user.avatar || "https://i.pravatar.cc/100",
      text: sanitizedText,
      userId: user.id,
      conversationId: null,
    };

    // Lägg till temporärt meddelande
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setTyping(false)


    try {
      const res = await fetch("https://chatify-api.up.railway.app/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          text: sanitizedText,
          conversationId: null,
        }),
      });

      const data = await res.json();
      const newMsg = data.latestMessage
        ? normalizeMsg(data.latestMessage)
        : normalizeMsg(data);

      
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? newMsg : msg))
      );

    
      setTimeout(() => {
        const reply = fakeChat[Math.floor(Math.random() * fakeChat.length)];
        setMessages((prev) => [...prev, normalizeMsg(reply)]);
      }, 1000);
    } catch (err) {
      console.error("kunde inte skicka meddelande", err);
    } finally {
      setLoading(false);
    }
  };

  // radera meddelande
  const deleteMessage = async (id) => {
    try {
      await fetch(`https://chatify-api.up.railway.app/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      console.error("kunde inte radera meddelande", err);
    }
  };


  return (
    <div className="chat-container">

      <div className="chat-header">
        
        <img src={user.avatar} alt={user.username} className="avatar" />
        <h3>Välkommen {user.username} 👋</h3>
        <small>✅ Online</small>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <p className="empty">Inga meddelanden än...</p>
        )}

        {messages.map((msg) => {
          const isMine = String(msg.userId) === String(user.id);
          return (
            <div
              key={msg.id}
              className={`message ${isMine ? "mine" : "theirs"}`}
            >
              {!isMine && (
                <img
                  src={msg.avatar || "https://i.pravatar.cc/100"}
                  alt={msg.username}
                />
              )}
              <div>
                <strong>{msg.username}</strong>
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(String(msg.text|| ""), {
                      ALLOWED_TAGS: ["b","i","strong"],
                     }),
                  }}
                />
              </div>
              {isMine && (
                <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
              )}
            </div>
          );
        })}
        {typing && ( <div className="typing">
            ✍️ Någon skriver
            <span className="dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>)}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={newMessage}
          onChange={handleNewMesage}
          placeholder="Skriv ett meddelande..."
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "skickar.." : "Skicka"}
        </button>
      </div>
    </div>
  );
}

export default Chat;
