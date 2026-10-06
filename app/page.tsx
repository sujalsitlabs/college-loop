"use client";

import { useState } from "react";

export default function Home() {
  const [signup, setSignup] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          College Loop
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Buy • Sell • Reuse within your college
        </p>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setSignup(false)}
            className="w-1/2 bg-blue-600 text-white py-2 rounded-lg"
          >
            Login
          </button>

          <button
            onClick={() => setSignup(true)}
            className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg"
          >
            Sign Up
          </button>
        </div>

        {signup && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg p-3 mt-5"
          />
        )}

        <input
          type="text"
          placeholder="College USN"
          className="w-full border rounded-lg p-3 mt-4"
        />

        <input
          type="text"
          placeholder="Email / Mobile Number"
          className="w-full border rounded-lg p-3 mt-4"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg p-3 mt-4"
        />

        <button
         onClick={() => window.location.href = "/home"} 
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg mt-6"
        >
          {signup ? "Create Account" : "Login"}
        </button>

      </div>
    </main>
  );
}