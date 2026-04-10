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
import api from "../../../../api/axios";

function ChatDeleteSection({
  close,
  messageId,
  messageText,
  createdAt,
  refresh,
  startEdit,
  me,
  position
}) {

  const isMobile = window.innerWidth < 768;

  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const SOCIETY_ID = localStorage.getItem("societyId");
  const USER_ID = Number(localStorage.getItem("userId")); // ✅ FIX

  const reactions = ["👍","❤️","😂","😮","😢","🙏"];

  /* ================= TIME CHECK ================= */

  const getDiffSeconds = () => {
    if (!createdAt) return 9999;
    return (new Date() - new Date(createdAt)) / 1000;
  };

  const canEdit = () => getDiffSeconds() <= 60;

  const canDeleteForEveryone = () => getDiffSeconds() <= 60;

  /* ================= HARD DELETE ================= */

  const deleteForEveryone = async () => {

    if (!messageId) return;

    // ❌ block after 1 min
    if (!canDeleteForEveryone()) {
      alert("You can only delete within 1 minute");
      return;
    }

    try {
      await api.delete(
        `/society-chat/society/${SOCIETY_ID}/hard-delete/${messageId}?senderId=${USER_ID}`
      );

      refresh();
      close();

    } catch (err) {
      console.error("Hard delete error:", err.response?.data || err.message);
    }
  };

  /* ================= SOFT DELETE ================= */

  const deleteForMe = async () => {

    if (!messageId) return;

    try {
      await api.put(
        `/society-chat/society/${SOCIETY_ID}/soft-delete/${messageId}`,
        { senderId: USER_ID }
      );

      refresh();
      close();

    } catch (err) {
      console.error("Soft delete error:", err);
    }
  };

  /* ================= REACTION ================= */

  const handleReaction = async (emoji) => {

    try {
      await api.post("/reactions/react", {
        messageId,
        userId: USER_ID,
        emoji
      });

      refresh();
      close();

    } catch (err) {
      console.error("Reaction error:", err);
    }

    setShowReactionPicker(false);
  };

  return (
    <>
      {/* ================= MENU ================= */}

      {!showDeleteBox && (

        <div
          className={
            isMobile
              ? "fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-xl z-50"
              : "fixed w-64 bg-white rounded-xl shadow-xl border z-50"
          }
          style={!isMobile ? { top: position?.top, left: position?.left } : {}}
        >

          {/* ================= REACTIONS ================= */}

          <div className="flex items-center gap-2 px-3 py-2 border-b relative">

            {reactions.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleReaction(emoji)}
                className="text-xl hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}

            <button onClick={() => setShowReactionPicker(!showReactionPicker)}>
              <Plus size={18}/>
            </button>

            {showReactionPicker && (
              <div className="absolute top-12 right-0 z-50">
                <EmojiPicker
                  onEmojiClick={(e) => handleReaction(e.emoji)}
                />
              </div>
            )}
          </div>

          {/* ================= MENU OPTIONS ================= */}

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

            {/* EDIT */}
            {me && canEdit() && (
              <div onClick={() => {
                startEdit(messageId, messageText);
                close();
              }}>
                <MenuItem icon={<Edit size={18}/>} text="Edit" />
              </div>
            )}

            <hr/>

            {/* DELETE */}
            <div onClick={() => setShowDeleteBox(true)}>
              <MenuItem icon={<Trash2 size={18}/>} text="Delete" danger />
            </div>

          </div>

        </div>
      )}

      {/* ================= DELETE CONFIRM ================= */}

      {showDeleteBox && (

        <div
          className={
            isMobile
              ? "fixed bottom-0 left-0 w-full bg-gray-100 rounded-t-2xl shadow-xl p-6 z-50"
              : "fixed w-80 bg-gray-100 rounded-xl shadow-xl p-6 z-50"
          }
          style={!isMobile ? { top: position?.top, left: position?.left } : {}}
        >

          <p className="text-lg mb-6">Delete message?</p>

          <div className="flex flex-col items-end gap-4">

            {/* ✅ DELETE FOR EVERYONE */}
            {me && canDeleteForEveryone() && (
              <button
                onClick={deleteForEveryone}
                className="border border-green-600 text-green-600 px-6 py-2 rounded-full"
              >
                Delete for everyone
              </button>
            )}

            {/* ⛔ AFTER 1 MIN SHOW INFO */}
            {me && !canDeleteForEveryone() && (
              <p className="text-xs text-gray-500">
                You can only delete for everyone within 1 minute
              </p>
            )}

            {/* DELETE FOR ME */}
            <button
              onClick={deleteForMe}
              className="border border-green-600 text-green-600 px-6 py-2 rounded-full"
            >
              Delete for me
            </button>

            <button
              onClick={() => setShowDeleteBox(false)}
              className="border px-6 py-2 rounded-full"
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