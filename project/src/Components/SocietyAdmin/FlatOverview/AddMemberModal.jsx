export default function AddMemberModal({
  memberFlat,
  member,
  setMember,
  isLiving,
  setIsLiving,
  setImageFile,
  onClose,
  onSave
}) {
  if (!memberFlat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h3 className="text-lg font-semibold mb-4">
          Add Member (Flat {memberFlat.flatNumber})
        </h3>

        <input className="border p-2 rounded w-full mb-2"
          placeholder="Name"
          value={member.name}
          onChange={e => setMember({ ...member, name: e.target.value })}
        />

        <input className="border p-2 rounded w-full mb-2"
          placeholder="Email"
          value={member.email}
          onChange={e => setMember({ ...member, email: e.target.value })}
        />

        <input className="border p-2 rounded w-full mb-2"
          placeholder="Mobile"
          value={member.mobileNumber}
          onChange={e => setMember({ ...member, mobileNumber: e.target.value })}
        />

        <input type="password"
          className="border p-2 rounded w-full mb-2"
          placeholder="Password"
          value={member.password}
          onChange={e => setMember({ ...member, password: e.target.value })}
        />

        <select
          className="border p-2 rounded w-full mb-2"
          value={member.normalUserType}
          onChange={e => setMember({ ...member, normalUserType: e.target.value })}
        >
          <option value="">Select User Type</option>
          <option value="OWNER">OWNER</option>
          <option value="TENANT">TENANT</option>
        </select>

        <select
          className="border p-2 rounded w-full mb-2"
          value={isLiving}
          onChange={e => setIsLiving(e.target.value === "true")}
        >
          <option value="true">Living (Yes)</option>
          <option value="false">Not Living</option>
        </select>

        <input type="file" className="mb-4"
          onChange={e => setImageFile(e.target.files[0])}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onSave} className="bg-green-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}