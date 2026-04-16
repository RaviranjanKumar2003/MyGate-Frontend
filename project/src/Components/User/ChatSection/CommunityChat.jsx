import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Video,
  Search,
  MoreVertical,
  Phone,
  ChevronDown,
  Plus,
  Smile,
  Mic,
  Check,
  Pencil,
  Ban ,
  CheckCheck
} from "lucide-react";

import EmojiPicker from "emoji-picker-react";
import api from "../../../api/axios";
import stompClient from "../../../socket";
import incomingRingtone from "../../../assets/ringtone.mp3";
import callingRingtone from "../../../assets/outgoingrington.mp3";

import ChatDeleteSection from "./Components/ChatDeleteSection";
import ChatDocument from "./Components/ChatDocument";
import ChatThreeDot from "./Components/ChatThreeDot";
import ChatVideoCall from "./Components/ChatVideoCall";
import ChatAudioCall from "./Components/ChatAudioCall";
import ChatSeenUsers from "./Components/ChatSeenUsers";



function CommunityChat({ userProfile }) {

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://your-backend.onrender.com";

const CHAT_API = `${API_URL}/api`;

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  const SOCIETY_ID = localStorage.getItem("societyId");
  const USER_ID = Number(localStorage.getItem("userId"));
  const USER_NAME = localStorage.getItem("userName");
  const USER_ROLE = localStorage.getItem("userRole");
  const USER_TYPE = localStorage.getItem("userType");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [openThreeDot, setOpenThreeDot] = useState(false);

  const [hoveredMsgId, setHoveredMsgId] = useState(null);

  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const emojiRef = useRef(null);

  const deleteRef = useRef(null);
  const docRef = useRef(null);
  const threeDotRef = useRef(null);

  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [incomingCall, setIncomingCall] = useState(false);
  const [startCall, setStartCall] = useState(false);
  const [roomName, setRoomName] = useState("");

  const [callType, setCallType] = useState(null);

  const incomingRef = useRef(null);
  const callingRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);  // startsWith

  /*===== SMS REPLY ======*/
    const [replyMsg, setReplyMsg] = useState(null);

  const [isMicHover, setIsMicHover] = useState(false);

  const [incomingCallData, setIncomingCallData] = useState(null);

  const [isAlone, setIsAlone] = useState(false);

  const [menuPosition, setMenuPosition] = useState(null);

  const pressTimer = useRef(null);

  const openMenu = (msg) => {
  const element = messageRefs.current[msg.id];
  if (!element) return;

  const rect = element.getBoundingClientRect();

  const menuHeight = 300;
  const menuWidth = 260;

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceRight = window.innerWidth - rect.right;

  

  let top, left;

  top = spaceBelow > menuHeight
    ? rect.bottom
    : rect.top - menuHeight;

  left = spaceRight > menuWidth
    ? rect.left
    : rect.right - menuWidth;

  setMenuPosition({ top, left });
  setSelectedMessageId(msg.id);
  setOpenDelete(true);
};

const messageRefs = useRef({});  // const openMenu 

  // 🔹 Helper function for ending a call safely
const endCall = () => {
  if (stompClient.connected && roomName) {
    stompClient.publish({
      destination: "/app/end-call",
      body: JSON.stringify({
  roomName,
  callerName: USER_NAME   // ⭐ VERY IMPORTANT
})
    });
  }

  stopRingtone();
  setStartCall(false);
  setIncomingCall(false);
  setRoomName("");
  setCallType(null);
};


/* ================= SEEN INFO ================= */
const [showSeenUsers, setShowSeenUsers] = useState(false);
const [selectedSeenUsers, setSelectedSeenUsers] = useState([]);


  const openSeenUsers = async (msg) => {
  try {
    const res = await api.get(`${CHAT_API}/society-chat/seen-users/${msg.id}`);

    setSelectedSeenUsers(res.data);  // ✅ full user data
    setShowSeenUsers(true);

  } catch (err) {
    console.error(err);
  }
};
  

/* RINGTONE */

const playIncomingRing = () => {
  if (incomingRef.current) {
    incomingRef.current.currentTime = 0;
    incomingRef.current.play().catch(() => {});
  }
};

useEffect(() => {
  if (!incomingCall) {
    stopRingtone();
  }
}, [incomingCall]);

const playCallingRing = () => {
  if (callingRef.current) {
    callingRef.current.currentTime = 0;
    callingRef.current.play().catch(() => {});
  }
};

const stopRingtone = () => {
  if (incomingRef.current) {
    incomingRef.current.pause();
    incomingRef.current.currentTime = 0;
  }

  if (callingRef.current) {
    callingRef.current.pause();
    callingRef.current.currentTime = 0;
  }
};

/* Emoji */
  const [reactionUsers, setReactionUsers] = useState([]);
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState(null);

  const [selectedEmoji, setSelectedEmoji] = useState("ALL");
  const [emojiCounts, setEmojiCounts] = useState({});

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);



const removeReaction = async (messageId) => {

  try {

    await api.delete(`${CHAT_API}/reactions/remove/${messageId}/${USER_ID}`);

    setShowReactionUsers(false);
    fetchMessages();  // ⭐ refresh chat

  } catch (err) {

    console.error(err);

  }

};

const updateReaction = async (emoji) => {

  try {

    await api.post(`${CHAT_API}/reactions/toggle`, {
      messageId: reactionMessageId,
      userId: USER_ID,
      emoji: emoji
    });

    await fetchMessages();     // important
    await openReactionUsers(reactionMessageId);

  } catch (err) {
    console.error(err);
  }

};

const openReactionUsers = async (messageId) => {

  try {

    const res = await api.get(`${CHAT_API}/reactions/users/${messageId}`);

    setReactionUsers(res.data);
    setReactionMessageId(messageId);

    const counts = {};

    res.data.forEach(r => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });

    setEmojiCounts(counts);
    setSelectedEmoji("ALL");

    setShowReactionUsers(true);

  } catch (err) {
    console.error(err);
  }

};

/*file*/
const [selectedFile, setSelectedFile] = useState(null);
const [fileType, setFileType] = useState(null);

const handleFileSelect = (file, type) => {
  setSelectedFile(file);
  setFileType(type);   // ✅ IMPORTANT
};

  /* WEBSOCKET  onReply */

 useEffect(() => {

  stompClient.onConnect = () => {

    console.log("✅ Connected");
    setIsConnected(true);

    // ✅ CHAT
    stompClient.subscribe(`/topic/messages/${SOCIETY_ID}`, (msg) => {

      const data = JSON.parse(msg.body);

      console.log("🔥 RECEIVED:", data);

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== data.tempId);

        if (filtered.some(m => m.id === data.id)) return filtered;

        return [...filtered, {
  id: data.id,
  sender: data.senderName,
  senderId: data.senderId,
  role: data.role,
  userType: data.userType || "Member",
  text: data.message,

  // ⭐⭐⭐ ADD THIS
  replyToMessageId: data.replyToMessageId,
  replyToMessageText: data.replyToMessageText,
  replyToSenderName: data.replyToSenderName,

  fileType: data.fileType,
  date: new Date(data.createdAt),
  time: new Date(data.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }),
  seen: data.seen || false,
  seenByUsers: data.seenByUsers || [],
  me: data.senderId == USER_ID,
  reactions: data.reactions || {}
}];
      });

    });

   stompClient.subscribe("/topic/alone-user", (msg) => {
  const data = JSON.parse(msg.body);

  if (data.roomName === roomName && startCall) { // ⭐ ADD startCall
    console.log("⚠️ You are alone");
    setIsAlone(true);
  }
});

    // ✅ INCOMING CALL
    stompClient.subscribe("/topic/incoming-call", (msg) => {
  const data = JSON.parse(msg.body);

  if (data.callerName === USER_NAME) return;

  setIncomingCallData(data);

  setRoomName(data.roomName);
  setCallType(data.type);

  // ✅ FIX: duplicate ringing stop
  if (!incomingCall) {
    setIncomingCall(true);
    playIncomingRing();
  }
});

    // ✅ END CALL SUBSCRIPTION
    stompClient.subscribe("/topic/end-call", (msg) => {
  const data = JSON.parse(msg.body);
  console.log("⛔ Call ended:", data);

  // Agar user currently call me hai ya incoming call hai
  if (data.roomName === roomName || data.roomName === incomingCallData?.roomName) {
  stopRingtone();
  setStartCall(false);
  setIncomingCall(false);
  setRoomName("");
  setCallType(null);
}
});

  };

  stompClient.activate(); // ⭐⭐⭐ MOST IMPORTANT

  return () => {
    stompClient.deactivate();
  };

}, []);


  useEffect(() => {
  if (startCall) {
    stopRingtone();   // ✅ VERY IMPORTANT
  }
}, [startCall]);


//================end call
  

  /* PROFILE IMAGE */

  const getProfileImage = (id) =>
    `${api.defaults.baseURL}/users/image/get/user/${id}`;

  /* DATE FORMAT */

  const formatDateLabel = (date) => {

    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return "Today";
    if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";

    return msgDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  };

  /* FETCH MESSAGES */

  const fetchMessages = async () => {

    try {

      const res = await api.get(`${CHAT_API}/society-chat/society/${SOCIETY_ID}/${USER_ID}`);

    const formatted = res.data.map((msg) => {

  const dateObj = new Date(msg.createdAt);

  return {
  id: msg.id,
  sender: msg.senderName,
  senderId: msg.senderId,
  role: msg.role,
  userType: msg.userType || "Member",
  text: msg.message,
  fileType: msg.fileType,   // ⭐⭐⭐ MUST

  replyToMessageId: msg.replyToMessageId,
  replyToMessageText: msg.replyToMessageText,
  replyToSenderName: msg.replyToSenderName,

  date: dateObj,
  time: dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  }),
  seen: msg.seen || false,
  seenByUsers: msg.seenByUsers || [],
  me: msg.senderId == USER_ID,
  reactions: msg.reactions || {}
};

});

      formatted.sort((a, b) => a.date - b.date);
      setMessages(formatted);

    } catch (err) {
      console.error(err);
    }

  };

  useEffect(() => {
    fetchMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* OUTSIDE CLICK CLOSE setReplyMsg */

  useEffect(() => {

    const handleOutsideClick = (e) => {

      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }

      if (deleteRef.current && !deleteRef.current.contains(e.target)) {
        setOpenDelete(false);
      }

      if (docRef.current && !docRef.current.contains(e.target)) {
        setOpenDocs(false);
      }

      if (threeDotRef.current && !threeDotRef.current.contains(e.target)) {
        setOpenThreeDot(false);
      }

    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };

  }, []);

  /* SCROLL */

  const handleScroll = () => {

    const container = chatContainerRef.current;

    const isBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    setShowScrollBtn(!isBottom);

  };

  useEffect(() => {

    const container = chatContainerRef.current;

    const isBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* EMOJI */

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // time: new Date

  /*======================== SEND MESSAGE ========================*/

  const sendMessage = () => {
    console.log("Reply Data:", replyMsg);

  if (!message.trim()) return;

  if (!stompClient.connected) {
    console.log("❌ Not connected");
    return;
  }

  const tempId = Date.now();

  // ⭐ Instant UI
  const tempMsg = {
    id: tempId,
    sender: USER_NAME,
    senderId: USER_ID,
    role: USER_ROLE,
    userType: USER_TYPE,
    text: message,

    replyToMessageId: replyMsg?.id || null,
    replyToMessageText: replyMsg?.text || null,
    replyToSenderName: replyMsg?.sender || null,
    replyToFileType: replyMsg?.fileType || null,

    date: new Date(),
    time: new Date().toLocaleTimeString("en-IN"),
    seen: false,
    me: true,
    reactions: {}
  };

  setMessages(prev => [...prev, tempMsg]);

  // ⭐ Send with tempId
  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({
      tempId: tempId,   // ⭐ IMPORTANT
      societyId: Number(SOCIETY_ID),
      senderId: USER_ID,
      senderName: USER_NAME,
      role: USER_ROLE,
      userType: USER_TYPE,
      message: message,
      replyToMessageId: replyMsg?.id || null,
  replyToMessageText: replyMsg?.text || null,
  replyToSenderName: replyMsg?.sender || null

    })
  });

  setMessage("");
  setReplyMsg(null);
};
  /* FILE UPLOAD */

const uploadFile = async (file, type) => {

  const formData = new FormData();
  formData.append("file", file);

  try {

    const res = await api.post(`${CHAT_API}/files/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const fileUrl = res.data.fileUrl;

    const tempId = Date.now();

    // ⭐ UI message
    const tempMsg = {
      id: tempId,
      sender: USER_NAME,
      senderId: USER_ID,
      text: fileUrl,
      fileType: type,   // ✅ ADD THIS
      date: new Date(),
      time: new Date().toLocaleTimeString("en-IN"),
      me: true,
      reactions: {}
    };

    setMessages(prev => [...prev, tempMsg]);

    // ⭐ SEND TO BACKEND
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        tempId,
        societyId: Number(SOCIETY_ID),
        senderId: USER_ID,
        senderName: USER_NAME,
        role: USER_ROLE,
        userType: USER_TYPE,
        message: fileUrl,
        fileType: type,   // ✅ VERY IMPORTANT
        replyToMessageId: replyMsg?.id || null,
  replyToMessageText: replyMsg?.text || null,
  replyToSenderName: replyMsg?.sender || null
      })
    });

  } catch (err) {
    console.error(err);
  }
};

  const updateMessage = async () => {

  if (!editingText.trim()) return;

  try {

    await api.put(
      `${CHAT_API}/society-chat/society/${SOCIETY_ID}/update/${editingMessageId}`,
      {
        senderId: USER_ID,
        message: editingText
      }
    );

    setEditingMessageId(null);
    setEditingText("");
    setMessage(""); // ⭐ ADDED
    fetchMessages();

  } catch (err) {
    console.error("Update error:", err);
  }

 };

  let lastDate = "";

  return (

  <div className="flex flex-col h-180  p-1 bg-gray-100 relative sm:h-157">

   {/*======================================= CHAT HEADER ========================================= */}

    <div className="bg-gray-200 flex items-center justify-between px-4 py-2 shadow fixed z-10 w-full sm:w-[80%]">

      <div className="flex items-center gap-3">

        {userProfile && (
          <img
            src={getProfileImage(userProfile.id)}
            className="w-9 h-9 rounded-full object-cover"
          />
        )}

        <div>
          <p className="font-medium">{userProfile?.name}</p>
          <p className="text-xs text-gray-500">Community Chat</p>
        </div>

      </div>

      <div className="flex items-center gap-4">

        {/*~~~~~~~~~~~~~~~ AUDIO CALL ~~~~~~~~~~~~~ */}

        <Phone
          size={20}
          className="cursor-pointer"
          onClick={() => {

            // ❌ connection check
            if (!stompClient.connected) {
              console.log("❌ Not connected yet");
              return;
            }

            const room = `audio-${SOCIETY_ID}`;

            stompClient.publish({
               destination: "/app/start-call", // ⚠️ agar backend change kiya hai to yaha bhi change karo
               body: JSON.stringify({
                 roomName: room,
                 callerName: USER_NAME,
                 type: "audio"
               })
            });

            stompClient.publish({
              destination: "/app/join-call",
              body: JSON.stringify({
                roomName: room,
                callerName: USER_NAME
              })
            });

            playCallingRing();
            setRoomName(room);
            setCallType("audio");
            setStartCall(true);
            setIsAlone(false);
         }}
       />

        {/*~~~~~~~~~~~~~~~~~~ VIDEO CALL ~~~~~~~~~~~~~~~ */}

        <Video
          size={20}
          className="cursor-pointer"
          onClick={() => {
  if (!stompClient.connected) return;

  const room = `video-${SOCIETY_ID}`;

  // 🔥 START CALL (IMPORTANT)
  stompClient.publish({
    destination: "/app/start-call",
    body: JSON.stringify({
      roomName: room,
      callerName: USER_NAME,
      type: "video"
    })
  });

  // 🔥 JOIN CALL
  stompClient.publish({
    destination: "/app/join-call",
    body: JSON.stringify({
      roomName: room,
      callerName: USER_NAME
    })
  });

  playCallingRing();

  setRoomName(room);
  setCallType("video");
  setStartCall(true);
  setIsAlone(false);
}}
       />
        <Search size={20}/>

        <MoreVertical
          size={20}
          className="cursor-pointer"
          onClick={() => setOpenThreeDot(true)}
        />

      </div>
    </div>

    {/*================================ CHAT HERO ============================= */}

    <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 mt-2 sm:mb-4 space-y-4">

      {messages.map((msg) => {

        const currentDate = new Date(msg.date).toDateString();
        const showDate = currentDate !== lastDate;
        lastDate = currentDate;

        return (

        <React.Fragment key={msg.id}>

          {showDate && (

            <div className="flex justify-center">

              <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">
                {formatDateLabel(msg.date)}
              </span>

            </div>
          )}

          <div
            ref={(el) => (messageRefs.current[msg.id] = el)}
            className={`flex ${msg.me ? "justify-end" : "justify-start"}`}
            onTouchStart={() => {
                pressTimer.current = setTimeout(() => {
                  openMenu(msg);
                }, 500);
            }}

            onTouchEnd={() => {
              clearTimeout(pressTimer.current);
            }}

            onTouchMove={() => {
               clearTimeout(pressTimer.current);
            }}

            onMouseEnter={() => setHoveredMsgId(msg.id)}
            onMouseLeave={() => setHoveredMsgId(null)}
          >

            {!msg.me && (
              <img src={getProfileImage(msg.senderId)} className="w-8 h-8 rounded-full mr-2"/>
            )}

            <div className="relative">

              {/* Hover Icons */}

              {hoveredMsgId === msg.id && (

                <div className={`absolute -top-2 flex gap-1 ${msg.me ? "-left-16" : "-right-16"}`}>
                      
                  <button
                      className="bg-white shadow p-1 rounded-full"
                      onClick={() => setShowEmoji(true)}>😀
                  </button>

                  <button
                    className="bg-white shadow p-1 rounded-full"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const menuHeight = 300;
                      const menuWidth = 260;
                      const spaceBelow = window.innerHeight - rect.bottom;
                      const spaceRight = window.innerWidth - rect.right;
                      let top, left;

                      // vertical
                      if (spaceBelow > menuHeight) {
                        top = rect.bottom;
                      } else {
                        top = rect.top - menuHeight;
                      }

                       // horizontal
                      if (spaceRight > menuWidth) {
                         left = rect.left;
                      } else {
                        left = rect.right - menuWidth;
                      }

                      setMenuPosition({ top, left });
                      setSelectedMessageId(msg.id);
                      setOpenDelete(true);
                    }}>
                    <ChevronDown size={16}/>
                  </button>

                </div>

              )}

              <div className={`max-w-full px-4 py-2 rounded-xl shadow text-sm ${msg.me ? "bg-green-500 text-white" : "bg-white"}`}>

                {!msg.me && (
                  <p className="text-xs font-semibold text-indigo-600">

                    {msg.sender}
                      <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                        {msg.userType}
                      </span>
                  </p>

                )}

               <div className="flex flex-col">

  {msg.fileType ? (

  msg.fileType === "image" ? (

    <img
      src={`${BASE_URL}/files/download/${msg.text.split("/").pop()}`}
      className="max-w-55 rounded-lg"
    />

  ) : msg.fileType === "video" ? (

    <video
      src={`${BASE_URL}/files/download/${msg.text.split("/").pop()}`}
      controls
      className="max-w-55 rounded-lg"
    />

  ) : msg.fileType === "audio" ? (

    <audio controls>
      <source src={`${BASE_URL}/files/download/${msg.text.split("/").pop()}`} />
    </audio>

  ) : (

    <a
      href={`${BASE_URL}/files/download/${msg.text.split("/").pop()}`}
      download
      className="text-blue-200 underline"
    >
      📎 Download File
    </a>

  )

) : msg.text === "This message was deleted" ? (

  <div
    className={`flex items-center italic text-sm gap-1 ${
      msg.me ? "text-white/70" : "text-gray-400"
    }`}
  >
    <Ban size={16} />
    <span>This message was deleted</span>
  </div>

) : (

  <>
    {/* ⭐ REPLY PREVIEW */}
   {msg.replyToMessageId && msg.replyToMessageText && (
  <div
    className={`mb-1 px-2 py-1 rounded border-l-4 ${
      msg.me
        ? "bg-green-400 border-white"
        : "bg-gray-200 border-green-500"
    }`}
  >
    <p className="text-xs font-semibold">
      {msg.replyToSenderName}
    </p>

    {/* 🔥 SMART REPLY PREVIEW */}
    {msg.replyToFileType === "image" ? (
      <img
        src={`${BASE_URL}/files/download/${msg.replyToMessageText.split("/").pop()}`}
        className="w-12 h-12 rounded object-cover mt-1"
      />
    ) : msg.replyToFileType === "video" ? (
      <div className="flex items-center gap-1 text-xs mt-1">
        🎥 Video
      </div>
    ) : msg.replyToFileType === "audio" ? (
      <div className="text-xs mt-1">🎵 Audio</div>
    ) : (
      <p className="text-xs truncate mt-1">
        {msg.replyToMessageText}
      </p>
    )}
  </div>
)}

    {/* ACTUAL MESSAGE */}
    <p>{msg.text}</p>
  </>

)}

  {/* ⭐ TIME + TICKS */}
  <div className="flex justify-end items-center gap-1 mt-1">

    <span className="text-[10px] opacity-70">
      {msg.time}
    </span>

    {msg.me && (
      msg.seen
        ? <CheckCheck size={14}/>
        : <Check size={14}/>
    )}

  </div>

</div>
                </div>
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-end">

                     {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <span key={emoji} onClick={() => openReactionUsers(msg.id)} className="bg-gray-200 text-xs px-2 py-0.5 rounded-full cursor-pointer" >
                          {emoji} {count}
                        </span>
                      ))}
                  </div>

                )}

                {showReactionUsers && (() => {

                  const sortedReactionUsers = [...reactionUsers].sort((a, b) => {
                  if (a.userId == USER_ID) return -1;
                  if (b.userId == USER_ID) return 1;
                    return 0;
                  });

                 const filteredUsers =
                 selectedEmoji === "ALL"
                 ? sortedReactionUsers
                 : sortedReactionUsers.filter(u => u.emoji === selectedEmoji);
                return (

                <div className="fixed inset-0 flex items-center justify-center z-50 ">

                  <div className="bg-white w-80 rounded-xl p-4">

                     {/* TOP FILTER */}
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2 flex-wrap">
                          <span
                            onClick={() => setSelectedEmoji("ALL")}
                            className={`px-2 py-1 rounded-full text-sm cursor-pointer
                            ${selectedEmoji === "ALL" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
                            All {reactionUsers.length}
                          </span>

                          {Object.entries(emojiCounts).map(([emoji, count]) => (

                            <span
                              key={emoji}
                              onClick={() => setSelectedEmoji(emoji)}
                              className={`px-2 py-1 rounded-full text-sm cursor-pointer
                              ${selectedEmoji === emoji ? "bg-green-500 text-white" : "bg-gray-200"}`}>
                              {emoji} {count}
                            </span>

                          ))}

                        </div>

                          {/* EMOJI ICON */}
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-xl px-0.9 py-0.9 rounded-full  border border-[#474646] cursor-pointer">
                          😀<span className="absolute  bg-green-500 text-black text-[10px] w-4 h-4 flex items-center justify-center -mt-8 ml-5 rounded-full">
                              +
                            </span>
                        </button>

                      </div>

                         {/* EMOJI PICKER */}

       {showEmojiPicker ? (

         <div className="w-70">
      <EmojiPicker
       height={300}
       width="100%"
       onEmojiClick={(e) => {
         updateReaction(e.emoji);
         setShowEmojiPicker(false);
       }}
      />
     </div>

      ) : (

      <div className="max-h-60 overflow-y-auto">

        {filteredUsers.map((user, i) => {

          const isMe = user.userId == USER_ID;

          return (

            <div
              key={i}
              onClick={() => {
                if (isMe) removeReaction(reactionMessageId);
              }}
              className={`flex items-center justify-between py-2 border-b px-2 rounded
              ${isMe ? "cursor-pointer hover:bg-gray-100" : ""}`}
            >

              <div className="flex items-center gap-3">

                <img
                  src={getProfileImage(user.userId)}
                  className="w-8 h-8 rounded-full object-cover"
                />

                <div>

                  <p className="text-sm font-medium">
                    {isMe ? "You" : user.userName}
                  </p>

                  {isMe && (
                    <p className="text-xs text-green-500">
                      Click to remove
                    </p>
                  )}

                </div>

              </div>

              <span className="text-xl">
                {user.emoji}
              </span>

            </div>

          );

        })}

      </div>

       )}

       <button
          onClick={() => setShowReactionUsers(false)}
         className="mt-4 w-full bg-gray-200 py-2 rounded"
       >
         Close
       </button>

      </div>

       </div>

              );

         })()}

                </div>

              </div>

            </React.Fragment>

          );

        })}

        <div ref={chatEndRef}></div>

      </div>

      {/* EMOJI PICKER */}

      {showEmoji && (

        <div ref={emojiRef} className="absolute bottom-20 ">
          <EmojiPicker onEmojiClick={onEmojiClick}/>
        </div>

      )}

      {/* SCROLL BUTTON */}

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-5 bg-green-500 text-white p-2 rounded-full shadow-lg">
          <ChevronDown size={18}/>
        </button>
      )}

      {/*========================== INPUT ======================================*/}
      
      <div className="fixed bottom-2 w-full sm:w-[80%] px-2 z-10">

  <div className="bg-[#a5a2a2] rounded-xl shadow flex flex-col">

    {/* ✅ REPLY BOX */}
    {replyMsg && (
      <div className="flex justify-between items-center px-3 py-2 bg-gray-200 border-l-4 border-green-500 rounded-t-xl">

        <div className="overflow-hidden">
          <p className="text-xs text-gray-500">Replying to</p>
          <p className="text-sm truncate max-w-62.5 text-black">
            {replyMsg.text}
          </p>
        </div>

        <button
          onClick={() => setReplyMsg(null)}
          className="text-gray-600 text-lg ml-2"
        >
          ✕
        </button>

      </div>
    )}

    {/* ✅ INPUT ROW */}
    <div className="flex items-center gap-2 px-3 py-2">

      <Plus
        className="cursor-pointer text-black"
        onClick={() => setOpenDocs(true)}
      />

      <Smile
        className="cursor-pointer text-black"
        onClick={() => setShowEmoji(!showEmoji)}
      />

      <textarea
        placeholder="Type a message"
        rows={1}
        className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none resize-none text-black"
        value={
          selectedFile
            ? `📎 ${selectedFile.name}`
            : editingMessageId
            ? editingText
            : message
        }
        onChange={(e) => {
          if (editingMessageId) {
            setEditingText(e.target.value);
          } else {
            setMessage(e.target.value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            if (selectedFile) {
              uploadFile(selectedFile, fileType);
              setSelectedFile(null);
              setFileType(null);
            } else if (editingMessageId) {
              updateMessage();
            } else {
              sendMessage();
            }
          }
        }}
      />

      {message.trim() || selectedFile ? (
        <button
          onClick={() => {
            if (selectedFile) {
              uploadFile(selectedFile, fileType);
              setSelectedFile(null);
              setFileType(null);
            } else if (editingMessageId) {
              updateMessage();
            } else {
              sendMessage();
            }
          }}
          className="bg-green-500 text-white p-2 rounded-full"
        >
          <Send size={18} />
        </button>
      ) : (
        <button
          onMouseEnter={() => setIsMicHover(true)}
          onMouseLeave={() => setIsMicHover(false)}
          className="rounded-full flex items-center justify-center transition-all duration-200 hover:bg-green-500"
          style={{ width: "40px", height: "40px" }}
        >
          <Mic
            size={isMicHover ? 24 : 20}
            className={isMicHover ? "text-white" : "text-black"}
          />
        </button>
      )}

    </div>
  </div>
</div>

  {/*==================== POPUPS */}
      {openDelete && (
        <div ref={deleteRef} className="">
          <ChatDeleteSection
  position={menuPosition}
  messageId={selectedMessageId}
  messageText={messages.find(m => m.id === selectedMessageId)?.text}
  createdAt={messages.find(m => m.id === selectedMessageId)?.date}
  me={messages.find(m => m.id === selectedMessageId)?.me}
  refresh={fetchMessages}
  close={() => setOpenDelete(false)}
  startEdit={(id, text) => {
    setEditingMessageId(id);
    setEditingText(text);
    setMessage(text);
  }}

  onReply={(msg) => {
  const fullMsg = messages.find(m => m.id === msg.id);

  setReplyMsg({
  id: fullMsg.id,
  text: fullMsg.text,
  sender: fullMsg.sender,
  fileType: fullMsg.fileType   // ⭐ ADD THIS
});
}}
  onCopy={(text) => navigator.clipboard.writeText(text)}
  onForward={(msg) => console.log("Forward:", msg)}


  openSeenUsers={() => {
    const msg = messages.find(m => m.id === selectedMessageId);
    openSeenUsers(msg);
  }}
/>
       </div>
      )}

      {openDocs && (
        <div ref={docRef} className="absolute bottom-14 left-0 z-50">
          <ChatDocument
            onFileSelect={handleFileSelect} 
            close={() => setOpenDocs(false)}
          />
        </div>
      )}

      {openThreeDot && (
        <div ref={threeDotRef}>
          <ChatThreeDot close={() => setOpenThreeDot(false)}/>
        </div>
      )}


      {/* VIDEO CALL */}

      {startCall && callType === "video" && (
        <ChatVideoCall
          roomName={roomName}
          onClose={endCall} // ✅ safe call end
        />
      )}

      {startCall && callType === "audio" && (
        <ChatAudioCall
          roomName={roomName}
          onClose={endCall} // ✅ safe call end
        />
      )}

      {isAlone && startCall && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded z-50">
          You are the only participant
        </div>
      )}

      {/* INCOMING CALL */}

      {incomingCall && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-lg font-semibold mb-4">
              Incoming Call
            </h2>
            <button
              onClick={() => {
                if (!stompClient.connected) return;
                  stompClient.publish({
                    destination: "/app/join-call",
                    body: JSON.stringify({
                      roomName: incomingCallData?.roomName,
                      callerName: USER_NAME
                    })
                 });
                 setRoomName(incomingCallData?.roomName); // ⭐ IMPORTANT
                 setCallType(incomingCallData?.type); // ⭐ ADD THIS
                 stopRingtone();
                 setIncomingCall(false);
                 setStartCall(true);
                 setIsAlone(false);
                }}
              className="bg-green-500 text-white px-4 py-2 rounded mr-3"
              >
              Accept
            </button>

            <button
              onClick={() => {
                if (stompClient.connected) {
                  stompClient.publish({
                     destination: "/app/end-call",
                      body: JSON.stringify({
                        roomName: incomingCallData?.roomName,
                        callerName: USER_NAME
                      })
                  });
                }
                stopRingtone();
                setIncomingCall(false);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
              >
              Reject
            </button>

          </div>

        </div>

      )}


      {showSeenUsers && (
  <ChatSeenUsers
    users={selectedSeenUsers}
    getProfileImage={getProfileImage}
    onClose={() => setShowSeenUsers(false)}
  />
)}

      {/* RINGTONE */}

      <audio ref={incomingRef} src={incomingRingtone} preload="auto" loop />
      <audio ref={callingRef} src={callingRingtone} preload="auto" loop />
     

  </div>
  );

}

export default CommunityChat;    


// const type