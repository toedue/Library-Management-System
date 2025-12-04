import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { FaTimes, FaUpload, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { paymentAPI } from "@/services/api";

const PaymentModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptionPlans = [
    { id: "3months", name: "3 Months", price: 300 },
    { id: "6months", name: "6 Months", price: 500 },
    { id: "1year", name: "1 Year", price: 800 }
  ];

  const accountNumber = "1000123456789";

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPaymentProof(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast.error("Please select a subscription plan");
      return;
    }
    if (!paymentProof) {
      toast.error("Please upload payment proof");
      return;
    }

    const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) {
      toast.error("Invalid plan selected");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("plan", selectedPlanData.name);
      formData.append("amount", String(selectedPlanData.price));
      formData.append("paymentProof", paymentProof);

      await paymentAPI.submitPaymentProof(formData);

      toast.success("Payment proof submitted successfully! Your membership is now waiting for approval.");
      // Optimistically update local storage so UI reflects new status immediately
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.membershipStatus = "waiting_for_approval";
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (_) {
        // noop
      }
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit payment proof. Please try again.");
      setIsSubmitting(false);
    }
  };

  const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);

  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={handleBackgroundClick}
    >
      <div className={`w-full max-w-md rounded-2xl shadow-2xl border max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ${
        isDark 
          ? "bg-gray-800/95 border-gray-700" 
          : "bg-white/95 border-gray-200"
      } backdrop-blur-sm`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Subscribe to Library
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Subscription Plans */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Choose Plan
            </label>
            <div className="space-y-2">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : isDark
                      ? "border-gray-600 hover:border-gray-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {plan.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {plan.price} ETB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          {selectedPlan && (
            <div className={`p-3 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <h3 className={`font-medium mb-2 text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Plan:
                  </span>
                  <span className={`text-sm font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {selectedPlanData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Amount:
                  </span>
                  <span className={`text-sm font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {selectedPlanData.price} ETB
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className={`font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      Total:
                    </span>
                    <span className={`font-bold text-lg ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {selectedPlanData.price} ETB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Number */}
          <div className={`p-3 rounded-lg ${
            isDark ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <FaCreditCard className={`text-blue-600 text-sm ${isDark ? "text-blue-400" : ""}`} />
              <h3 className={`font-medium text-sm ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Bank Details
              </h3>
            </div>
            <p className={`text-xs mb-1 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              Account Number:
            </p>
            <div className="flex items-center gap-2">
              <code className={`px-3 py-2 rounded font-mono text-sm ${
                isDark ? "bg-gray-700 text-white" : "bg-white text-gray-900"
              } border`}>
                {accountNumber}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(accountNumber)}
                className={`px-2 py-1 text-xs rounded ${
                  isDark 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Copy
              </button>
            </div>
            <p className={`text-xs mt-2 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}>
              Please transfer the exact amount and upload the payment proof below.
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Upload Payment Proof
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="payment-proof"
              />
              <label
                htmlFor="payment-proof"
                className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  paymentProof
                    ? isDark
                      ? "border-green-500 bg-green-900/20"
                      : "border-green-500 bg-green-50"
                    : isDark
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <FaUpload className={`${
                  paymentProof 
                    ? "text-green-600" 
                    : isDark ? "text-gray-400" : "text-gray-500"
                }`} />
                <span className={`text-sm ${
                  paymentProof
                    ? "text-green-600 font-medium"
                    : isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  {paymentProof ? paymentProof.name : "Click to upload screenshot"}
                </span>
              </label>
            </div>
            {paymentProof && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <FaCheckCircle className="text-sm" />
                <span className="text-sm">Payment proof uploaded</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedPlan || !paymentProof || isSubmitting}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                !selectedPlan || !paymentProof || isSubmitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
