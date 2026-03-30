import React, { useState } from "react";
import {
  Info,
  Reply,
  Copy,
  Forward,
  Pin,
  Star,
  Plus,
  CheckSquare,
  Trash2,
  Edit
} from "lucide-react";

import EmojiPicker from "emoji-picker-react";
import api from "../../api/axios";

function ChatDeleteSection({
  close,
  messageId,
  messageText,
  createdAt,
  refresh,
  startEdit,
  me
}) {

  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const SOCIETY_ID = localStorage.getItem("societyId");
  const USER_ID = localStorage.getItem("userId");

  const reactions = ["👍","❤️","😂","😮","😢","🙏"];

  /* ================= EDIT TIME CHECK ================= */

  const canEdit = () => {

    if (!createdAt) return false;

    const now = new Date();
    const msgTime = new Date(createdAt);

    const diffSeconds = (now - msgTime) / 1000;

    return diffSeconds <= 60;

  };

  /* ================= HARD DELETE ================= */

  const deleteForEveryone = async () => {

    if (!messageId) return;

    try {

      await api.delete(
        `/society-chat/society/${SOCIETY_ID}/hard-delete/${messageId}`,
        {
          data: { senderId: USER_ID }
        }
      );

      refresh();
      close();

    } catch (err) {

      console.error("Hard delete error:", err);

    }

  };

  /* ================= SOFT DELETE ================= */

  const deleteForMe = async () => {

    if (!messageId) return;

    try {

      await api.put(
        `/society-chat/society/${SOCIETY_ID}/soft-delete/${messageId}`,
        {
          senderId: USER_ID
        }
      );

      refresh();
      close();

    } catch (err) {

      console.error("Soft delete error:", err);

    }

  };

  /* ================= SEND REACTION ================= */

  const handleReaction = async (emoji) => {

    try {

      await api.post("/reactions/react", {
        messageId: messageId,
        userId: USER_ID,
        emoji: emoji
      });

      refresh(); // reload messages
      close();   // close menu

    } catch (err) {

      console.error("Reaction error:", err);

    }

    setShowReactionPicker(false);

  };

  return (

    <>

    {/* ================= MENU ================= */}

    {!showDeleteBox && (

      <div className="absolute right-10 top-10 w-64 bg-white rounded-xl shadow-xl border z-50">

        {/* ================= REACTIONS ================= */}

        <div className="flex justify-between items-center px-3 py-2 border-b relative">

          {reactions.map((emoji, i) => (

            <button
              key={i}
              onClick={() => handleReaction(emoji)}
              className="text-xl hover:scale-125 transition"
            >
              {emoji}
            </button>

          ))}

          {/* OPEN EMOJI PICKER */}

          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="text-xl"
          >
            <Plus size={18}/>
          </button>

          {/* EMOJI PICKER */}

          {showReactionPicker && (

            <div className="absolute top-12 right-0 z-50">

              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  handleReaction(emojiData.emoji)
                }
              />

            </div>

          )}

        </div>

        {/* ================= MENU ================= */}

        <div className="text-sm">

          <MenuItem icon={<Info size={18}/>} text="Message info" />
          <MenuItem icon={<Reply size={18}/>} text="Reply" />
          <MenuItem icon={<Copy size={18}/>} text="Copy" />
          <MenuItem icon={<Forward size={18}/>} text="Forward" />
          <MenuItem icon={<Pin size={18}/>} text="Pin" />
          <MenuItem icon={<Star size={18}/>} text="Star" />
          <MenuItem icon={<Plus size={18}/>} text="Add text to note" />

          <hr/>

          <MenuItem icon={<CheckSquare size={18}/>} text="Select" />

          {/* EDIT OPTION */}

          {me && canEdit() && (

            <div
              onClick={() => {
                startEdit(messageId, messageText);
                close();
              }}
            >
              <MenuItem
                icon={<Edit size={18}/>}
                text="Edit"
              />
            </div>

          )}

          <hr/>

          <div onClick={() => setShowDeleteBox(true)}>
            <MenuItem
              icon={<Trash2 size={18}/>}
              text="Delete"
              danger
            />
          </div>

        </div>

      </div>

    )}

    {/* ================= DELETE CONFIRM ================= */}

    {showDeleteBox && (

      <div className="absolute right-10 top-10 w-80 bg-gray-100 rounded-xl shadow-xl p-6 z-50">

        <p className="text-lg mb-6">Delete message?</p>

        <div className="flex flex-col items-end gap-4">

          {me && (

            <button
              onClick={deleteForEveryone}
              className="border border-green-600 text-green-600 px-6 py-2 rounded-full hover:bg-green-50"
            >
              Delete for everyone
            </button>

          )}

          <button
            onClick={deleteForMe}
            className="border border-green-600 text-green-600 px-6 py-2 rounded-full hover:bg-green-50"
          >
            Delete for me
          </button>

          <button
            onClick={() => setShowDeleteBox(false)}
            className="border px-6 py-2 rounded-full hover:bg-gray-200"
          >
            Cancel
          </button>

        </div>

      </div>

    )}

    </>

  );

}

/* ================= MENU ITEM ================= */

function MenuItem({ icon, text, danger, onClick }) {

  return (

    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100
      ${danger ? "text-red-500" : ""}`}
    >

      {icon}

      <span>{text}</span>

    </div>

  );

}

export default ChatDeleteSection;