 import React from "react";
import Link from "next/link";

export default function Signup() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <form>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <Link href="/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
