import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { authAPI, borrowAPI } from "@/services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowingStatus, setBorrowingStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await authAPI.getProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted)
          setError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    const fetchBorrowingStatus = async () => {
      try {
        const { data } = await borrowAPI.getUserBorrowingStatus();
        if (isMounted) {
          setBorrowingStatus(data);
        }
      } catch (err) {
        // Ignore borrowing status errors, not critical for profile
        console.error("Error fetching borrowing status:", err);
      }
    };

    fetchProfile();
    fetchBorrowingStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteAccount = () => {
    // Check if user has active borrows
    if (
      borrowingStatus &&
      (borrowingStatus.totalBorrowed > 0 || borrowingStatus.totalReserved > 0)
    ) {
      toast.error(
        "Cannot delete account. Please return all borrowed books and cancel reservations first."
      );
      return;
    }

    toast((t) => {
      let inputValue = "";
      return (
        <div>
          <p className="mb-2">
            Type <strong>Delete</strong> to confirm account deletion.
          </p>
          <input
            autoFocus
            type="text"
            placeholder="Delete"
            className="w-full mb-3 px-3 py-2 rounded border border-gray-300 focus:outline-none"
            onChange={(e) => {
              inputValue = e.target.value;
            }}
          />
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (inputValue !== "Delete") {
                  toast.error("Please type Delete to confirm");
                  return;
                }
                try {
                  await authAPI.deleteProfile();
                  toast.dismiss(t.id);
                  toast.success("Account deleted");
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/");
                } catch (err) {
                  const msg =
                    err?.response?.data?.message || "Failed to delete account";
                  toast.error(msg);
                }
              }}
            >
              Confirm Delete
            </button>
            <button
              className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 px-6 py-3">
        <Navbar />
        <h1 className="text-2xl font-semibold mt-6 mb-4 text-gray-900 dark:text-gray-100">
          My Profile
        </h1>

        {loading && (
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            Loading...
          </div>
        )}

        {!loading && error && (
          <div className="p-6 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && profile && (
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Username
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {profile.username}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {profile.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.role === "superadmin" ||
                    profile.username === "superadmin"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {profile.role === "super_admin" ||
                  profile.username === "super_admin"
                    ? "Super Admin"
                    : "Admin"}
                </span>
              </div>
            </div>

            {profile.role !== "super_admin" &&
              profile.username !== "super_admin" && (
                <div className="pt-4">
                  <button
                    className={`px-4 py-2 rounded text-white ${
                      borrowingStatus &&
                      (borrowingStatus.totalBorrowed > 0 ||
                        borrowingStatus.totalReserved > 0)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    disabled={
                      borrowingStatus &&
                      (borrowingStatus.totalBorrowed > 0 ||
                        borrowingStatus.totalReserved > 0)
                    }
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </button>
                  {borrowingStatus &&
                    (borrowingStatus.totalBorrowed > 0 ||
                      borrowingStatus.totalReserved > 0) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        You cannot delete your account while you have active
                        borrows or reservations. Please return all books and
                        cancel reservations first.
                      </p>
                    )}
                </div>
              )}
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
};

export default AdminProfile;
