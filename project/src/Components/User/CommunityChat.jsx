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
import api from "../../api/axios";
import stompClient from "../../socket";
import incomingRingtone from "../../assets/ringtone.mp3";
import callingRingtone from "../../assets/outgoingrington.mp3";

import ChatDeleteSection from "./ChatDeleteSection";
import ChatDocument from "./ChatDocument";
import ChatThreeDot from "./ChatThreeDot";
import ChatVideoCall from "./ChatVideoCall";
import ChatAudioCall from "./ChatAudioCall";



function CommunityChat({ userProfile }) {

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

  

/* RINGTONE */

const playIncomingRing = () => {
  if (incomingRef.current) {
    incomingRef.current.currentTime = 0;
    incomingRef.current.play().catch(() => {});
  }
};

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

    await api.delete(`/reactions/remove/${messageId}/${USER_ID}`);

    setShowReactionUsers(false);
    fetchMessages();  // ⭐ refresh chat

  } catch (err) {

    console.error(err);

  }

};

const updateReaction = async (emoji) => {

  try {

    await api.post("/reactions/toggle", {
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

    const res = await api.get(`/reactions/users/${messageId}`);

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

  console.log("FILE SELECTED:", file);

  setSelectedFile(file);
  setFileType(type);

};

  /* WEBSOCKET */

  useEffect(() => {

    stompClient.connect({}, () => {
      

      stompClient.subscribe("/topic/incoming-call", (msg) => {
        console.log("CALL RECEIVED:", msg.body);

        const data = JSON.parse(msg.body);

        setRoomName(data.roomName);
        setIncomingCall(true);
        playIncomingRing();

      });

    });

  }, []);

  useEffect(() => {
  if (!startCall) {
    stopRingtone();
  }
}, [startCall]);


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

      const res = await api.get(`/society-chat/society/${SOCIETY_ID}/${USER_ID}`);

    const formatted = res.data.map((msg) => {

  const dateObj = new Date(msg.createdAt);

  return {
    id: msg.id,
    sender: msg.senderName,
    senderId: msg.senderId,
    role: msg.role,
    userType: msg.userType || "Member",
    text: msg.message,
    date: dateObj,
    time: dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    seen: msg.seen || false,
    me: msg.senderId == USER_ID,

    // ⭐ ADD THIS
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
  }, []);

  /* OUTSIDE CLICK CLOSE */

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

  /* SEND MESSAGE */

  const sendMessage = async () => {

    if (!message.trim()) return;

    try {

      await api.post("/society-chat/send", {

        societyId: SOCIETY_ID,
        senderId: USER_ID,
        senderName: USER_NAME,
        role: USER_ROLE,
        userType: USER_TYPE,
        message: message

      });

      setMessage("");
      fetchMessages();

    } catch (err) {
      console.error(err);
    }

  };

  /* FILE UPLOAD */

const uploadFile = async (file) => {
  console.log("FILE RECEIVED:", file);

  const formData = new FormData();
  formData.append("file", file);

  try {

    const res = await api.post(
  "/files/upload",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }
);

    const fileData = res.data;

    const fileUrl = fileData.fileUrl;

    console.log("File uploaded:", fileData);

    // ⭐ chat message send karo
    await api.post("/society-chat/send", {
      societyId: SOCIETY_ID,
      senderId: USER_ID,
      senderName: USER_NAME,
      role: USER_ROLE,
      userType: USER_TYPE,

      message: fileUrl,
    });

    fetchMessages();

  } catch (error) {

    console.error("Upload error:", error);

  }

};

  const updateMessage = async () => {

  if (!editingText.trim()) return;

  try {

    await api.put(
      `/society-chat/society/${SOCIETY_ID}/update/${editingMessageId}`,
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

    <div className="flex flex-col h-185 bg-gray-100 relative sm:h-157">

      {/* HEADER */}

      <div className="bg-gray-200 flex items-center justify-between px-4 py-2 shadow">

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

          {/* AUDIO CALL */}

          <Phone
  size={20}
  className="cursor-pointer"
  onClick={() => {

    const room = `audio-${SOCIETY_ID}-${Date.now()}`;

    stompClient.send(
      "/app/start-call",
      {},
      JSON.stringify({
        roomName: room,
        callerName: USER_NAME,
        type: "audio"
      })
    );

    playCallingRing();

    setRoomName(room);
    setCallType("audio");   // ⭐
    setStartCall(true);

  }}
/>

          {/* VIDEO CALL */}

          <Video
  size={20}
  className="cursor-pointer"
  onClick={() => {

    const room = `video-${SOCIETY_ID}-${Date.now()}`;

    stompClient.send(
      "/app/start-call",
      {},
      JSON.stringify({
        roomName: room,
        callerName: USER_NAME,
        type: "video"
      })
    );

    playCallingRing();

    setRoomName(room);
    setCallType("video");   // ⭐
    setStartCall(true);

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

      {/* CHAT */}

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >

        {messages.map((msg) => {

          const currentDate = new Date(msg.date).toDateString();
          const showDate = currentDate !== lastDate;
          // eslint-disable-next-line react-hooks/immutability
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
                className={`flex ${msg.me ? "justify-end" : "justify-start"}`}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
              >

                {!msg.me && (

                  <img
                    src={getProfileImage(msg.senderId)}
                    className="w-8 h-8 rounded-full mr-2"
                  />

                )}

                <div className="relative">

                  {/* Hover Icons */}

                  {hoveredMsgId === msg.id && (

                    <div className={`absolute -top-2 flex gap-1 ${msg.me ? "-left-16" : "-right-16"}`}>
                      

                      <button
                        className="bg-white shadow p-1 rounded-full"
                        onClick={() => setShowEmoji(true)}
                      >
                        😀
                      </button>

                      <button
                        className="bg-white shadow p-1 rounded-full"
                        onClick={() => {
                        setSelectedMessageId(msg.id);
                        setOpenDelete(true);
                        }}
                      >
                        <ChevronDown size={16}/>
                      </button>

                    </div>

                  )}

                  <div
                    className={`max-w-full px-4 py-2 rounded-xl shadow text-sm
                    ${msg.me ? "bg-green-500 text-white" : "bg-white"}`}
                  >

                    {!msg.me && (

                      <p className="text-xs font-semibold text-indigo-600">

                        {msg.sender}

                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {msg.userType}
                        </span>

                      </p>

                    )}
                    <div className="flex">
                     {msg.text.startsWith("/uploads/") ? (

  <a
    href={`http://localhost:9090/api/files/download/${msg.text.split("/").pop()}`}
    target="_blank"
    download
    className="text-blue-200 underline"
  >
    📎 Download File
  </a>

) : msg.text === "This message was deleted" ? (

  <div className="flex items-center gap- text-[#f0e7e7] italic text-lg">
    <Ban size={18} />
    <span>This message was deleted</span>
  </div>

) : (

  <p>{msg.text}</p>

)}
                      {/* ⭐ REACTIONS */}



                    <div className="flex justify-end items-center gap-1 mt-4 ml-1">

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

    <span
      key={emoji}
      onClick={() => openReactionUsers(msg.id)}
      className="bg-gray-200 text-xs px-2 py-0.5 rounded-full cursor-pointer"
    >
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
          ${selectedEmoji === "ALL" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          All {reactionUsers.length}
        </span>

        {Object.entries(emojiCounts).map(([emoji, count]) => (

          <span
            key={emoji}
            onClick={() => setSelectedEmoji(emoji)}
            className={`px-2 py-1 rounded-full text-sm cursor-pointer
            ${selectedEmoji === emoji ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            {emoji} {count}
          </span>

        ))}

      </div>

      {/* EMOJI ICON */}

      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-xl px-0.9 py-0.9 rounded-full  border border-[#474646] cursor-pointer"
      >
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

        <div ref={emojiRef} className="absolute bottom-20 right-5">
          <EmojiPicker onEmojiClick={onEmojiClick}/>
        </div>

      )}

      {/* SCROLL BUTTON */}

      {showScrollBtn && (

        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-5 bg-green-500 text-white p-2 rounded-full shadow-lg"
        >
          <ChevronDown size={18}/>
        </button>

      )}

      {/* INPUT */}
      

      <div className="bg-white border-t flex items-center gap-2 px-3 py-2">


        <Plus
          className="cursor-pointer"
          onClick={() => setOpenDocs(true)}
        />

       

        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
          value={
  selectedFile
    ? `📎 ${selectedFile.name}`
    : editingMessageId
    ? editingText
    : message
}
          onChange={(e) => {
  if (editingMessageId) {
    setEditingText(e.target.value);   // ⭐ ADDED
  } else {
    setMessage(e.target.value);
  }
}}
        />

        <Smile
          className="cursor-pointer"
          onClick={() => setShowEmoji(!showEmoji)}
        />

       {message.trim() || selectedFile ? (

  <button
    onClick={() => {

      if (selectedFile) {
        uploadFile(selectedFile);
        setSelectedFile(null);
      }

      else if (editingMessageId) {
        updateMessage();
      }

      else {
        sendMessage();
      }

    }}
    className="bg-green-500 text-white p-2 rounded-full"
  >
    <Send size={18}/>
  </button>

) : (

  <button className="bg-green-500 text-white p-2 rounded-full">
    <Mic size={18}/>
  </button>

)}

      </div>

      {/* POPUPS */}

      {openDelete && (
  <div ref={deleteRef}>
    <ChatDeleteSection
  messageId={selectedMessageId}
  messageText={messages.find(m => m.id === selectedMessageId)?.text}
  createdAt={messages.find(m => m.id === selectedMessageId)?.date}
  me={messages.find(m => m.id === selectedMessageId)?.me}   // ⭐ ADD THIS
  refresh={fetchMessages}
  close={() => setOpenDelete(false)}
  startEdit={(id, text) => {
    setEditingMessageId(id);
    setEditingText(text);
    setMessage(text);
  }}
/>
  </div>
)}

      {openDocs && (
  <div
    ref={docRef}
    className="absolute bottom-14 left-0 z-50"
  >
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
    onClose={() => {
      stopRingtone();
      setStartCall(false);
    }}
  />
)}

{startCall && callType === "audio" && (
  <ChatAudioCall
    roomName={roomName}
    onClose={() => {
      stopRingtone();
      setStartCall(false);
    }}
  />
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

                stopRingtone();
                setIncomingCall(false);
                setStartCall(true);

              }}
              className="bg-green-500 text-white px-4 py-2 rounded mr-3"
            >
              Accept
            </button>

            <button
              onClick={() => {

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

      {/* RINGTONE */}

      <audio ref={incomingRef} src={incomingRingtone} preload="auto" loop />
      <audio ref={callingRef} src={callingRingtone} preload="auto" loop />
     

  </div>
  );

  

}

export default CommunityChat;