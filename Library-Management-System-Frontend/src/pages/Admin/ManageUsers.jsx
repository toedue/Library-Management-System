import AdminSidebar from "@/components/AdminSidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { useEffect, useMemo, useState } from "react";
import { usersAPI } from "@/services/api";
import toast from "react-hot-toast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    []
  );
  const { isDark } = useTheme();

  const isSuperAdmin =
    currentUser.role === "super_admin" ||
    currentUser.role === "superadmin" ||
    currentUser.username === "superadmin";

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  // Load users with pagination
  const loadUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const { data } = isSuperAdmin
        ? await usersAPI.getAllUsersSuperAdmin()
        : await usersAPI.getAllUsersAdminView();

      const allUsers = data || [];

      // Calculate pagination
      const totalCount = allUsers.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setPagination({
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, 10);
  }, [isSuperAdmin]);

  // Handle page change
  const handlePageChange = (newPage) => {
    loadUsers(newPage, pagination.limit);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit) => {
    loadUsers(1, newLimit);
  };

  const handlePromote = async (userId) => {
    try {
      await usersAPI.promoteToAdmin(userId);
      toast.success("User promoted to admin");
      // Reload current page to reflect changes
      loadUsers(pagination.currentPage, pagination.limit);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to promote user";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDemote = async (userId) => {
    try {
      await usersAPI.demoteAdmin(userId);
      toast.success("Admin demoted to user");
      // Reload current page to reflect changes
      loadUsers(pagination.currentPage, pagination.limit);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to demote admin";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (userId, isRegular) => {
    try {
      if (isSuperAdmin) {
        await usersAPI.deleteAnyUser(userId);
      } else if (isRegular) {
        await usersAPI.deleteRegularUser(userId);
      }
      toast.success("User deleted");
      // Reload current page to reflect changes
      loadUsers(pagination.currentPage, pagination.limit);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete user";
      setError(msg);
      toast.error(msg);
    }
  };

  const adminUsers = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role === "user");

  return (
    <div className="flex flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 px-6 py-3">
        <Navbar />
        <h1 className="text-3xl font-bold pt-4 text-blue-600 dark:text-white mb-4">
          Manage Users
        </h1>
        <p className={isDark ? "text-gray-300" : "text-gray-600"}>
          Manage users and their status on the application.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-6 rounded border bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
            Loading users...
          </div>
        ) : (
          <>
            {/* Only show Admins section for Superadmin */}
            {isSuperAdmin && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Admins
                </h2>
                <div className="overflow-x-auto rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/40">
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                          Username
                        </th>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                          Role
                        </th>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((u) => {
                        const isSelf =
                          currentUser?.id === u._id ||
                          currentUser?._id === u._id;
                        const canDelete = isSuperAdmin && !isSelf; // super admin cannot delete self
                        const canDemote =
                          isSuperAdmin && u.role === "admin" && !isSelf;
                        return (
                          <tr
                            key={u._id}
                            className="border-t dark:border-gray-700"
                          >
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                              {u.username}
                            </td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                              {u.email}
                            </td>
                            <td className="px-4 py-2 capitalize text-gray-900 dark:text-gray-100">
                              {u.role?.replace("_", " ")}
                            </td>
                            <td className="px-4 py-2 space-x-2">
                              {canDemote && (
                                <button
                                  onClick={() => handleDemote(u._id)}
                                  className="px-3 py-1 text-sm rounded bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                  Demote to User
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() =>
                                    toast((t) => (
                                      <div>
                                        <p className="mb-2">
                                          Are you sure you want to delete{" "}
                                          {u.username}?
                                        </p>
                                        <div className="flex gap-2">
                                          <button
                                            className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
                                            onClick={() => {
                                              toast.dismiss(t.id);
                                              handleDelete(u._id, false);
                                            }}
                                          >
                                            Yes, Delete
                                          </button>
                                          <button
                                            className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                                            onClick={() => toast.dismiss(t.id)}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  }
                                  className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Users
              </h2>
              <div className="overflow-x-auto rounded border bg-white dark:bg-gray-800 dark:border-gray-700">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/40">
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                        Username
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                        Role
                      </th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularUsers.map((u) => {
                      const canDelete = isSuperAdmin || u.role === "user"; // admin can delete only regular users
                      const canPromote = isSuperAdmin && u.role === "user"; // only superadmin can promote
                      return (
                        <tr
                          key={u._id}
                          className="border-t dark:border-gray-700"
                        >
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                            {u.username}
                          </td>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                            {u.email}
                          </td>
                          <td className="px-4 py-2 capitalize text-gray-900 dark:text-gray-100">
                            {u.role?.replace("_", " ")}
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            {canPromote && (
                              <button
                                onClick={() => handlePromote(u._id)}
                                className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Promote to Admin
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() =>
                                  toast((t) => (
                                    <div>
                                      <p className="mb-2">
                                        Are you sure you want to delete{" "}
                                        {u.username}?
                                      </p>
                                      <div className="flex gap-2">
                                        <button
                                          className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
                                          onClick={() => {
                                            toast.dismiss(t.id);
                                            handleDelete(u._id, true);
                                          }}
                                        >
                                          Yes, Delete
                                        </button>
                                        <button
                                          className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                                          onClick={() => toast.dismiss(t.id)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                }
                                className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {!loading && users.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                {/* Rows per page selector */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Rows per page:
                  </span>
                  <select
                    value={pagination.limit}
                    onChange={(e) =>
                      handleRowsPerPageChange(parseInt(e.target.value))
                    }
                    className={`px-2 py-1 border rounded text-sm ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Pagination info and navigation */}
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {(pagination.currentPage - 1) * pagination.limit + 1}–
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount}
                  </span>

                  {/* Navigation arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevPage}
                      className={`p-2 rounded-lg transition-colors ${
                        pagination.hasPrevPage
                          ? isDark
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-100"
                          : isDark
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <FaChevronLeft size={16} />
                    </button>

                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNextPage}
                      className={`p-2 rounded-lg transition-colors ${
                        pagination.hasNextPage
                          ? isDark
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-100"
                          : isDark
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <FaChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Footer />
      </main>
    </div>
  );
};

export default ManageUsers;
