function ChatSeenUsers({ users, getProfileImage, onClose }) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
      <div className="bg-white w-80 rounded-xl p-4">

        <h3 className="font-semibold mb-3">Seen By</h3>

        <div className="max-h-60 overflow-y-auto">
          {users.map((user, i) => (
  <div key={i} className="flex items-center gap-3 py-2 border-b">
    <img
      src={getProfileImage(user.userId)}
      className="w-8 h-8 rounded-full"
    />
    <span>{user.userName}</span>
  </div>
))}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-200 py-2 rounded"
        >
          Close
        </button>

      </div>
    </div>
  );
}

export default ChatSeenUsers;