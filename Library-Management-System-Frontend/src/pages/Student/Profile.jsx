import React, { useEffect, useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import StudentNavbar from "@/components/StudentNavbar";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";
import PaymentHistory from "@/components/PaymentHistory";
import { authAPI, borrowAPI } from "@/services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [borrowingStatus, setBorrowingStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const { data } = await authAPI.getProfile();
        // console.log(data);
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
        console.log(data);
        if (isMounted) setBorrowingStatus(data);
      } catch (err) {
        console.error("Error fetching borrowing status:", err);
      }
    };

    fetchProfile();
    fetchBorrowingStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      <StudentSidebar />
      <main className="flex-1 px-6 py-3">
        <StudentNavbar />
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

            {profile.membershipStatus && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Membership Status
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.membershipStatus === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : profile.membershipStatus === "pending" ||
                        profile.membershipStatus === "waiting_for_approval"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : profile.membershipStatus === "canceled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {profile.membershipStatus === "approved"
                    ? "Active"
                    : profile.membershipStatus === "pending"
                    ? "Pending"
                    : profile.membershipStatus === "waiting_for_approval"
                    ? "Waiting for Approval"
                    : "Inactive"}
                </span>
              </div>
            )}

            {profile.membershipStatus === "pending" && (
              <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <FaExclamationTriangle className="text-orange-600 dark:text-orange-400 text-xl" />
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                    Membership Activation Required
                  </h3>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                  Your membership request has been received ✅ To continue,
                  please complete the subscription payment below.
                </p>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <FaCreditCard />
                  Complete Payment
                </button>
              </div>
            )}

            {profile.membershipStatus === "waiting_for_approval" && (
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="text-blue-600 dark:text-blue-400 text-xl" />
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Reviewing Your Membership
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ✅ We received your payment proof 🔍 Our team is currently
                  verifying your submission ⏳ You’ll be approved soon — thank
                  you for your patience!
                </p>
              </div>
            )}

            {profile.membershipStatus === "approved" && (
              <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Membership Approved ✅
                  </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  🎉 Welcome! You now have full access to borrow books and enjoy
                  all member benefits.
                </p>
              </div>
            )}

            {profile.membershipStatus === "canceled" && (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <FaExclamationTriangle className="text-red-600 dark:text-red-400 text-xl" />
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Membership Not Active
                  </h3>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Your previous request was canceled. You can easily start the
                  process again below.
                </p>

                <button
                  onClick={() => {
                    toast.success("Restarting subscription process");
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Reapply for Membership
                </button>
              </div>
            )}

            {/* Delete Account Button */}
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
                onClick={() => {
                  if (
                    borrowingStatus &&
                    (borrowingStatus.totalBorrowed > 0 ||
                      borrowingStatus.totalReserved > 0)
                  ) {
                    toast.error(
                      "Return all borrowed books and cancel reservations first."
                    );
                    return;
                  }

                  toast((t) => {
                    let inputValue = "";
                    return (
                      <div>
                        <p className="mb-2">
                          Type <strong>Delete</strong> to confirm
                        </p>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Delete"
                          className="w-full mb-3 px-3 py-2 border rounded"
                          onChange={(e) => {
                            inputValue = e.target.value;
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded"
                            onClick={async () => {
                              if (inputValue !== "Delete") {
                                toast.error("Please type Delete to confirm");
                                return;
                              }
                              try {
                                await authAPI.deleteProfile();
                                toast.dismiss(t.id);
                                localStorage.clear();
                                navigate("/");
                              } catch (err) {
                                toast.error("Failed to delete account");
                              }
                            }}
                          >
                            Confirm Delete
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-300 rounded"
                            onClick={() => toast.dismiss(t.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  });
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* Payment History */}
        {!loading && !error && (
          <div className="mt-6">
            <PaymentHistory />
          </div>
        )}

        <Footer />
      </main>

      {/* Subscription Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default Profile;
