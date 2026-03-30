import React from "react";

export default function StaffTable({ staffList }) {
  // staffList = [{ id, name, role, contact, workingHours }]
  return (
    <div className="bg-white shadow rounded-lg p-4 mt-6">
      <h2 className="text-xl font-bold mb-4">Staff Members</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Contact</th>
              <th className="py-2 px-4 border-b">Working Hours</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList && staffList.length > 0 ? (
              staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{staff.name}</td>
                  <td className="py-2 px-4 border-b">{staff.role}</td>
                  <td className="py-2 px-4 border-b">{staff.contact}</td>
                  <td className="py-2 px-4 border-b">{staff.workingHours}</td>
                  <td className="py-2 px-4 border-b">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No staff members available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
