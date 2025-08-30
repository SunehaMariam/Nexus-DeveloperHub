// src/pages/PaymentPage.tsx
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  HandCoins,
} from "lucide-react";

export interface Transaction {
  id: string;
  type: "Deposit" | "Withdraw" | "Transfer" | "Funding";
  amount: number;
  sender: string;
  receiver?: string;
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

const PaymentPage: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState<number>(1000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentType, setCurrentType] =
    useState<Transaction["type"] | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");

  const openModal = (type: Transaction["type"]) => {
    setCurrentType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAmount("");
    setReceiver("");
  };

  const handleTransaction = () => {
    if (!currentType) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    let newBalance = walletBalance;
    if (currentType === "Deposit") newBalance += amt;
    if (
      (currentType === "Withdraw" ||
        currentType === "Transfer" ||
        currentType === "Funding") &&
      amt <= walletBalance
    )
      newBalance -= amt;

    const transaction: Transaction = {
      id: uuidv4(),
      type: currentType,
      amount: amt,
      sender: "You",
      receiver:
        currentType === "Transfer" || currentType === "Funding"
          ? receiver || "Unknown"
          : undefined,
      status: "Completed",
      date: new Date().toLocaleString(),
    };

    setWalletBalance(newBalance);
    setTransactions((prev) => [transaction, ...prev]);
    closeModal();
  };

  // Icon + Color mapping
  const typeConfig: Record<
    Transaction["type"],
    { icon: JSX.Element; color: string }
  > = {
    Deposit: {
      icon: <ArrowDownCircle className="w-5 h-5 text-green-600 inline" />,
      color: "text-green-600",
    },
    Withdraw: {
      icon: <ArrowUpCircle className="w-5 h-5 text-red-600 inline" />,
      color: "text-red-600",
    },
    Transfer: {
      icon: <Repeat className="w-5 h-5 text-blue-600 inline" />,
      color: "text-blue-600",
    },
    Funding: {
      icon: <HandCoins className="w-5 h-5 text-purple-600 inline" />,
      color: "text-purple-600",
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-8">
      {/* Row: Wallet + Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg rounded-xl p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Wallet Balance</h2>
            <p className="text-4xl font-bold">${walletBalance.toFixed(2)}</p>
          </div>
          <span className="text-5xl">💳</span>
        </div>

        {/* Actions */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
              onClick={() => openModal("Deposit")}
            >
              <ArrowDownCircle className="w-5 h-5" /> Deposit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
              onClick={() => openModal("Withdraw")}
            >
              <ArrowUpCircle className="w-5 h-5" /> Withdraw
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
              onClick={() => openModal("Transfer")}
            >
              <Repeat className="w-5 h-5" /> Transfer
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
              onClick={() => openModal("Funding")}
            >
              <HandCoins className="w-5 h-5" /> Funding
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Sender</th>
                  <th className="px-4 py-2 border">Receiver</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-center hover:bg-gray-50">
                    <td className="px-4 py-2 border">{tx.date}</td>
                    <td className="px-4 py-2 border font-medium flex items-center justify-center gap-2">
                      {typeConfig[tx.type].icon}
                      <span className={typeConfig[tx.type].color}>
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2 border font-semibold ${typeConfig[tx.type].color}`}
                    >
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border">{tx.sender}</td>
                    <td className="px-4 py-2 border">
                      {tx.receiver ? tx.receiver : "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              ✖
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              {currentType} Transaction
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="border rounded px-3 py-2 w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Receiver input only for Transfer & Funding */}
              {(currentType === "Transfer" || currentType === "Funding") && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Receiver
                  </label>
                  <input
                    type="text"
                    placeholder="Enter receiver name"
                    className="border rounded px-3 py-2 w-full"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                  />
                </div>
              )}

              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg mt-4"
                onClick={handleTransaction}
              >
                Confirm {currentType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
