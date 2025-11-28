import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
// 移除導致錯誤的 import
// import { Html5Qrcode } from 'html5-qrcode'; 
import { Camera, Package, Truck, List, Plus, QrCode, Trash2, LogOut, Save, X, ChevronRight, CheckCircle, Box, Image as ImageIcon, RefreshCw } from 'lucide-react';

// --- Firebase Configuration ---
// ⚠️ 請將下方的設定替換為您從 Firebase Console 取得的真實設定
const firebaseConfig = {
    apiKey: "AIzaSyD3lBJ1dK34eCHOQK1QMRaD-CwO8lVRL3I",
    authDomain: "wh-qr-code-df4aa.firebaseapp.com",
    projectId: "wh-qr-code-df4aa",
    storageBucket: "wh-qr-code-df4aa.firebasestorage.app",
    messagingSenderId: "100884432310",
    appId: "1:100884432310:web:4dbdb127cbaa8af8666d17",
    measurementId: "G-NB6B57947Y"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 統一的資料表名稱 (移除 appId 變數，直接使用固定名稱讓全體共用)
const ORDERS_COLLECTION = 'warehouse_orders';

// --- Components ---

const LoginScreen = ({ onLogin, loading }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
      <div className="bg-blue-600 p-4 rounded-full inline-block mb-4">
        <Package className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">出貨掃描系統</h1>
      <p className="text-slate-500 mb-6">多人協作 | 掃描入庫 | 派車管理</p>
      <button
        onClick={onLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-5