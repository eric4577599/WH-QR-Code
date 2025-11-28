import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc, serverTimestamp, writeBatch, getDoc, setDoc, getDocs, where } from 'firebase/firestore';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Package, Truck, Trash2, LogOut, Save, X, CheckCircle, Box, Plus, Image, Search, Calendar, Edit3, ChevronDown, Check, User, Users, Settings, History, Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';

// --- Firebase Configuration ---
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
const ORDERS_COLLECTION = 'warehouse_orders';
const USERS_COLLECTION = 'users';
const ACTIVITY_LOGS_COLLECTION = 'activity_logs';

// 使用者角色定義
const USER_ROLES = {
  admin: { label: '管理員', color: 'red', icon: Shield },
  warehouse: { label: '倉管', color: 'blue', icon: Package },
  driver: { label: '司機', color: 'green', icon: Truck }
};

// 角色權限定義
const ROLE_PERMISSIONS = {
  admin: { canManageUsers: true, canAddOrder: true, canEditOrder: true, canDeleteOrder: true, canDispatch: true, canViewLogs: true },
  warehouse: { canManageUsers: false, canAddOrder: true, canEditOrder: true, canDeleteOrder: false, canDispatch: true, canViewLogs: false },
  driver: { canManageUsers: false, canAddOrder: false, canEditOrder: false, canDeleteOrder: false, canDispatch: false, canViewLogs: false }
};

// --- 登入畫面 ---
const LoginScreen = ({ onLogin, onRegister, loading }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('請輸入 Email 和密碼');
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('兩次密碼輸入不一致');
        return;
      }
      if (password.length < 6) {
        setError('密碼至少需要 6 個字元');
        return;
      }
      if (!displayName) {
        setError('請輸入姓名');
        return;
      }
      await onRegister(email, password, displayName);
    } else {
      await onLogin(email, password);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 w-full max-w-sm shadow-lg">
        <div className="text-center mb-6">
          <div className="border-2 border-blue-600 p-4 rounded-full inline-block mb-4">
            <Package className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">倉儲掃描通</h1>
          <p className="text-gray-500 text-sm">{isRegister ? '建立新帳號' : '登入系統'}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">姓名 *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 pl-10 focus:border-blue-600 focus:outline-none"
                  placeholder="您的姓名" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 pl-10 focus:border-blue-600 focus:outline-none"
                placeholder="your@email.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">密碼 *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 pl-10 pr-10 focus:border-blue-600 focus:outline-none"
                placeholder="••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">確認密碼 *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 pl-10 focus:border-blue-600 focus:outline-none"
                  placeholder="••••••" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
            {loading ? '處理中...' : (isRegister ? '註冊帳號' : '登入')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-blue-600 hover:underline text-sm">
            {isRegister ? '已有帳號？點此登入' : '沒有帳號？點此註冊'}
          </button>
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-400">© 2024 Warehouse Scanner System</p>
    </div>
  );
};

// --- 訂單卡片 ---
const OrderCard = ({ order, isSelected, onSelect, onDelete, onDetail }) => (
  <div
    className={`bg-white rounded-lg p-4 mb-3 border-2 transition-all ${
      order.status === 'dispatched' ? 'border-green-600' :
      isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
    }`}
  >
    <div className="flex justify-between items-start">
      {/* 左側：勾選框 + 資訊 */}
      <div className="flex gap-3 flex-1">
        {/* 勾選框 */}
        <button
          onClick={() => onSelect(order.id)}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
            isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </button>

        {/* 訂單資訊 - 點擊查看詳情 */}
        <div className="flex-1 cursor-pointer" onClick={onDetail}>
          {order.orderNumber && (
            <p className="text-xs text-blue-600 font-mono mb-1">{order.orderNumber}</p>
          )}
          <h3 className="font-bold text-lg text-gray-900">{order.customerName || '未知客戶'}</h3>
          <p className="text-gray-700">{order.productName || '未知產品'}</p>
          <p className="text-sm text-gray-500 font-mono">PO: {order.poNumber || '-'}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
            <span className="font-medium">數量: {order.quantity || 0}</span>
            {order.expectedShipDate && (
              <span className="text-orange-600 font-medium">出貨: {order.expectedShipDate}</span>
            )}
          </div>
        </div>
      </div>

      {/* 右側：狀態 */}
      <div className="flex flex-col items-end gap-2">
        {order.status === 'dispatched' ? (
          <span className="border-2 border-green-600 text-green-600 text-xs px-2 py-1 rounded flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3" /> 已派車
          </span>
        ) : (
          <span className="border-2 border-gray-400 text-gray-500 text-xs px-2 py-1 rounded font-semibold">
            待處理
          </span>
        )}
      </div>
    </div>
    {order.dispatchId && (
      <p className="text-xs text-green-700 mt-2 font-mono bg-green-50 inline-block px-2 py-1 rounded ml-9">派車單號: {order.dispatchId}</p>
    )}
  </div>
);

// --- QR Code 掃描器 + 訂單表單 ---
const ScannerModal = ({ onClose, onSave }) => {
  const [mode, setMode] = useState('scan'); // 'scan' | 'form'
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState({
    orderNumber: '', workOrderNumber: '', orderDate: '', expectedShipDate: '',
    customerName: '', productName: '', poNumber: '',
    length: '', width: '', height: '', quantity: '', fluteType: ''
  });
  const html5QrCodeRef = useRef(null);

  // 自動產生訂單編號 (格式: ORD-YYYYMMDD-XXX)
  const generateOrderNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${dateStr}-${random}`;
  };

  // 取得今天日期 (YYYY-MM-DD 格式)
  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  // 啟動相機掃描
  const startScanner = async () => {
    try {
      setScanning(true);
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // 掃描成功
          handleScanSuccess(decodedText);
          stopScanner();
        },
        () => {} // 忽略掃描錯誤
      );
    } catch (err) {
      console.error("相機啟動失敗:", err);
      alert("無法開啟相機，請確認已授權相機權限，或使用上傳圖片功能");
      setScanning(false);
    }
  };

  // 停止掃描
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("停止掃描錯誤:", err);
      }
    }
    setScanning(false);
  };

  // 處理掃描結果
  const handleScanSuccess = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      setForm({
        orderNumber: generateOrderNumber(),
        workOrderNumber: data.workOrderNumber || data.workOrder || '',
        orderDate: getTodayDate(),
        expectedShipDate: data.expectedShipDate || data.shipDate || '',
        customerName: data.customerName || data.customer || '',
        productName: data.productName || data.product || '',
        poNumber: data.poNumber || data.po || '',
        length: data.length || data.l || '',
        width: data.width || data.w || '',
        height: data.height || data.h || '',
        quantity: data.quantity || data.qty || '',
        fluteType: data.fluteType || data.flute || ''
      });
      setMode('form');
    } catch {
      // 如果不是 JSON，直接當作 PO 號碼，並自動產生訂單編號
      setForm(prev => ({
        ...prev,
        orderNumber: generateOrderNumber(),
        orderDate: getTodayDate(),
        poNumber: decodedText
      }));
      setMode('form');
    }
  };

  // 上傳圖片掃描
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-file");
      const result = await html5QrCode.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      alert("無法識別 QR Code，請確認圖片清晰");
    }
  };

  // 關閉時清理
  const handleClose = () => {
    stopScanner();
    onClose();
  };

  // 儲存訂單並返回列表
  const handleSaveAndClose = async () => {
    console.log('handleSaveAndClose clicked', form);
    if (!form.customerName) {
      alert('請輸入客戶名稱');
      return;
    }
    try {
      await onSave(form);
      handleClose();
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗: ' + error.message);
    }
  };

  // 儲存訂單並繼續下一筆
  const handleSaveAndNext = async () => {
    console.log('handleSaveAndNext clicked', form);
    if (!form.customerName) {
      alert('請輸入客戶名稱');
      return;
    }
    try {
      await onSave(form);
      // 清空表單，回到掃描模式
      setForm({
        orderNumber: '', workOrderNumber: '', orderDate: '', expectedShipDate: '',
        customerName: '', productName: '', poNumber: '',
        length: '', width: '', height: '', quantity: '', fluteType: ''
      });
      setMode('scan');
      alert('已儲存！請繼續掃描下一筆');
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗: ' + error.message);
    }
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border-2 border-blue-600 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center p-4 border-b-2 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'scan' ? '掃描 QR Code' : '確認訂單資料'}
          </h2>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-900 border border-gray-300 rounded hover:border-gray-500 transition-all"><X className="w-5 h-5" /></button>
        </div>

        {mode === 'scan' ? (
          <div className="p-4">
            {/* 掃描區域 */}
            <div id="qr-reader" className="w-full rounded-lg overflow-hidden mb-4 border-2 border-gray-200"></div>
            <div id="qr-reader-file" className="hidden"></div>

            {!scanning ? (
              <div className="space-y-3">
                <button onClick={startScanner}
                  className="w-full border-2 border-blue-600 bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                  <Camera className="w-5 h-5" /> 開啟相機掃描
                </button>

                <label className="w-full border-2 border-gray-400 bg-white text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-all">
                  <Image className="w-5 h-5" /> 上傳 QR Code 圖片
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      orderNumber: generateOrderNumber(),
                      orderDate: getTodayDate()
                    }));
                    setMode('form');
                  }}
                  className="w-full border-2 border-gray-400 bg-white text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 transition-all">
                  <Plus className="w-5 h-5" /> 手動輸入
                </button>
              </div>
            ) : (
              <button onClick={stopScanner}
                className="w-full border-2 border-red-500 bg-white text-red-500 py-3 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-all">
                停止掃描
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* 訂單編號區塊 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">訂單編號</label>
                  <input className="w-full border border-blue-300 rounded p-2 text-sm text-gray-900 font-mono bg-white focus:border-blue-600 focus:outline-none"
                    value={form.orderNumber} onChange={e => setForm({...form, orderNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">工單編號</label>
                  <input className="w-full border border-blue-300 rounded p-2 text-sm text-gray-900 font-mono bg-white focus:border-blue-600 focus:outline-none"
                    value={form.workOrderNumber} onChange={e => setForm({...form, workOrderNumber: e.target.value})} placeholder="選填" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">訂單建立日</label>
                  <input type="date" className="w-full border border-blue-300 rounded p-2 text-sm text-gray-900 bg-white focus:border-blue-600 focus:outline-none"
                    value={form.orderDate} onChange={e => setForm({...form, orderDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">預計出貨日</label>
                  <input type="date" className="w-full border border-blue-300 rounded p-2 text-sm text-gray-900 bg-white focus:border-blue-600 focus:outline-none"
                    value={form.expectedShipDate} onChange={e => setForm({...form, expectedShipDate: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">客戶名稱 *</label>
              <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-600 focus:outline-none transition-all"
                value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">產品名稱</label>
              <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-600 focus:outline-none transition-all"
                value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">採購單號</label>
              <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 font-mono focus:border-blue-600 focus:outline-none transition-all"
                value={form.poNumber} onChange={e => setForm({...form, poNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">尺寸 (長 × 寬 × 高)</label>
              <div className="grid grid-cols-3 gap-2">
                <input className="border-2 border-gray-300 rounded-lg p-3 text-gray-900 text-center focus:border-blue-600 focus:outline-none transition-all" placeholder="長" type="number"
                  value={form.length} onChange={e => setForm({...form, length: e.target.value})} />
                <input className="border-2 border-gray-300 rounded-lg p-3 text-gray-900 text-center focus:border-blue-600 focus:outline-none transition-all" placeholder="寬" type="number"
                  value={form.width} onChange={e => setForm({...form, width: e.target.value})} />
                <input className="border-2 border-gray-300 rounded-lg p-3 text-gray-900 text-center focus:border-blue-600 focus:outline-none transition-all" placeholder="高" type="number"
                  value={form.height} onChange={e => setForm({...form, height: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">數量</label>
                <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-600 focus:outline-none transition-all" type="number"
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">楞別</label>
                <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-600 focus:outline-none transition-all" placeholder="如: AB楞"
                  value={form.fluteType} onChange={e => setForm({...form, fluteType: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button onClick={handleSaveAndNext}
                  className="flex-1 border-2 border-blue-600 bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                  <Plus className="w-5 h-5" /> 儲存並下一筆
                </button>
                <button onClick={handleSaveAndClose}
                  className="flex-1 border-2 border-green-600 bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all">
                  <Save className="w-5 h-5" /> 儲存並返回
                </button>
              </div>
              <button onClick={() => setMode('scan')}
                className="w-full border-2 border-gray-400 bg-white text-gray-700 py-2 rounded-lg font-medium hover:border-blue-600 hover:text-blue-600 transition-all text-sm">
                重新掃描
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 訂單詳情/編輯 Modal ---
const OrderDetailModal = ({ order, onClose, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    orderNumber: order.orderNumber || '',
    workOrderNumber: order.workOrderNumber || '',
    orderDate: order.orderDate || '',
    expectedShipDate: order.expectedShipDate || '',
    customerName: order.customerName || '',
    productName: order.productName || '',
    poNumber: order.poNumber || '',
    length: order.length || '',
    width: order.width || '',
    height: order.height || '',
    quantity: order.quantity || '',
    fluteType: order.fluteType || ''
  });

  const handleSave = async () => {
    if (!form.customerName) {
      alert('請輸入客戶名稱');
      return;
    }
    try {
      await onSave(order.id, form);
      setIsEditing(false);
      alert('已更新！');
    } catch (error) {
      alert('更新失敗: ' + error.message);
    }
  };

  const handleDelete = () => {
    if (confirm('確定要刪除此訂單嗎？')) {
      onDelete(order.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border-2 border-blue-600 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center p-4 border-b-2 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? '編輯訂單' : '訂單詳情'}
          </h2>
          <div className="flex gap-2">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-300 rounded transition-all">
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900 border border-gray-300 rounded hover:border-gray-500 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 狀態顯示 */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
            order.status === 'dispatched' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
          }`}>
            {order.status === 'dispatched' ? <CheckCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            {order.status === 'dispatched' ? '已派車' : '待處理'}
          </div>
          {order.dispatchId && (
            <p className="text-sm text-green-700 font-mono bg-green-50 inline-block ml-2 px-2 py-1 rounded">
              派車單號: {order.dispatchId}
            </p>
          )}

          {/* 訂單編號區塊 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">訂單編號</label>
                {isEditing ? (
                  <input className="w-full border border-blue-300 rounded p-2 text-sm font-mono bg-white focus:border-blue-600 focus:outline-none"
                    value={form.orderNumber} onChange={e => setForm({...form, orderNumber: e.target.value})} />
                ) : (
                  <p className="text-gray-900 font-mono text-sm p-2 bg-white rounded">{order.orderNumber || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">工單編號</label>
                {isEditing ? (
                  <input className="w-full border border-blue-300 rounded p-2 text-sm font-mono bg-white focus:border-blue-600 focus:outline-none"
                    value={form.workOrderNumber} onChange={e => setForm({...form, workOrderNumber: e.target.value})} />
                ) : (
                  <p className="text-gray-900 font-mono text-sm p-2 bg-white rounded">{order.workOrderNumber || '-'}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">訂單建立日</label>
                {isEditing ? (
                  <input type="date" className="w-full border border-blue-300 rounded p-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    value={form.orderDate} onChange={e => setForm({...form, orderDate: e.target.value})} />
                ) : (
                  <p className="text-gray-900 text-sm p-2 bg-white rounded">{order.orderDate || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">預計出貨日</label>
                {isEditing ? (
                  <input type="date" className="w-full border border-blue-300 rounded p-2 text-sm bg-white focus:border-blue-600 focus:outline-none"
                    value={form.expectedShipDate} onChange={e => setForm({...form, expectedShipDate: e.target.value})} />
                ) : (
                  <p className="text-gray-900 text-sm p-2 bg-white rounded">{order.expectedShipDate || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 表單欄位 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">客戶名稱 *</label>
            {isEditing ? (
              <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-600 focus:outline-none"
                value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            ) : (
              <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{order.customerName || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">產品名稱</label>
            {isEditing ? (
              <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:border-blue-600 focus:outline-none"
                value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} />
            ) : (
              <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{order.productName || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">採購單號</label>
            {isEditing ? (
              <input className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 font-mono focus:border-blue-600 focus:outline-none"
                value={form.poNumber} onChange={e => setForm({...form, poNumber: e.target.value})} />
            ) : (
              <p className="text-gray-900 font-mono p-3 bg-gray-50 rounded-lg">{order.poNumber || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">尺寸 (長 × 寬 × 高)</label>
            {isEditing ? (
              <div className="grid grid-cols-3 gap-2">
                <input className="border-2 border-gray-300 rounded-lg p-3 text-center focus:border-blue-600 focus:outline-none" placeholder="長" type="number"
                  value={form.length} onChange={e => setForm({...form, length: e.target.value})} />
                <input className="border-2 border-gray-300 rounded-lg p-3 text-center focus:border-blue-600 focus:outline-none" placeholder="寬" type="number"
                  value={form.width} onChange={e => setForm({...form, width: e.target.value})} />
                <input className="border-2 border-gray-300 rounded-lg p-3 text-center focus:border-blue-600 focus:outline-none" placeholder="高" type="number"
                  value={form.height} onChange={e => setForm({...form, height: e.target.value})} />
              </div>
            ) : (
              <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{order.length || 0} × {order.width || 0} × {order.height || 0}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">數量</label>
              {isEditing ? (
                <input className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-600 focus:outline-none" type="number"
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{order.quantity || 0}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">楞別</label>
              {isEditing ? (
                <input className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-600 focus:outline-none"
                  value={form.fluteType} onChange={e => setForm({...form, fluteType: e.target.value})} />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{order.fluteType || '-'}</p>
              )}
            </div>
          </div>

          {/* 建立時間 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">建立時間</label>
            <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
              {order.createdAt?.toDate?.()?.toLocaleString('zh-TW') || '-'}
            </p>
          </div>

          {/* 按鈕區 */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {isEditing ? (
              <div className="flex gap-3">
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 border-2 border-gray-400 bg-white text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-500 transition-all">
                  取消
                </button>
                <button onClick={handleSave}
                  className="flex-1 border-2 border-blue-600 bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                  <Save className="w-5 h-5" /> 儲存修改
                </button>
              </div>
            ) : (
              <button onClick={handleDelete}
                className="w-full border-2 border-red-500 bg-white text-red-500 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                <Trash2 className="w-5 h-5" /> 刪除訂單
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 主應用程式 ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // 使用者資料 (含角色)
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null); // 訂單詳情
  const [searchText, setSearchText] = useState(''); // 搜尋文字
  const [dateFilter, setDateFilter] = useState('all'); // 日期篩選: all, today, week, month
  const [showDateMenu, setShowDateMenu] = useState(false); // 日期選單開關
  const [showUserManagement, setShowUserManagement] = useState(false); // 使用者管理
  const [showActivityLogs, setShowActivityLogs] = useState(false); // 操作紀錄
  const [allUsers, setAllUsers] = useState([]); // 所有使用者列表
  const [activityLogs, setActivityLogs] = useState([]); // 操作紀錄列表

  // 取得目前使用者權限
  const permissions = userProfile?.role ? ROLE_PERMISSIONS[userProfile.role] : ROLE_PERMISSIONS.driver;

  // 監聽登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 取得使用者資料
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          // 新使用者，預設為 driver
          setUserProfile({ email: currentUser.email, displayName: currentUser.email?.split('@')[0], role: 'driver' });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 監聽訂單資料
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    });
    return () => unsubscribe();
  }, [user]);

  // 監聽使用者列表 (管理員專用)
  useEffect(() => {
    if (!user || !permissions.canManageUsers) return;
    const unsubscribe = onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(data);
    });
    return () => unsubscribe();
  }, [user, permissions.canManageUsers]);

  // 監聽操作紀錄 (管理員專用)
  useEffect(() => {
    if (!user || !permissions.canViewLogs) return;
    const q = query(collection(db, ACTIVITY_LOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivityLogs(data);
    });
    return () => unsubscribe();
  }, [user, permissions.canViewLogs]);

  // 記錄操作
  const logActivity = async (action, details) => {
    try {
      await addDoc(collection(db, ACTIVITY_LOGS_COLLECTION), {
        userId: user?.uid,
        userEmail: userProfile?.email || user?.email,
        userName: userProfile?.displayName || '未知',
        action,
        details,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error('記錄失敗:', e);
    }
  };

  // 登入
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let msg = '登入失敗';
      if (error.code === 'auth/user-not-found') msg = '此帳號不存在';
      else if (error.code === 'auth/wrong-password') msg = '密碼錯誤';
      else if (error.code === 'auth/invalid-email') msg = 'Email 格式錯誤';
      else if (error.code === 'auth/invalid-credential') msg = '帳號或密碼錯誤';
      alert(msg);
    }
    setLoading(false);
  };

  // 註冊
  const handleRegister = async (email, password, displayName) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // 第一位註冊者為管理員，其他為司機
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
      const role = usersSnapshot.empty ? 'admin' : 'driver';

      // 建立使用者資料
      await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), {
        email,
        displayName,
        role,
        createdAt: serverTimestamp()
      });

      await logActivity('註冊', `新使用者 ${displayName} (${email}) 註冊，角色: ${USER_ROLES[role].label}`);
    } catch (error) {
      let msg = '註冊失敗';
      if (error.code === 'auth/email-already-in-use') msg = '此 Email 已被使用';
      else if (error.code === 'auth/weak-password') msg = '密碼強度不足';
      else if (error.code === 'auth/invalid-email') msg = 'Email 格式錯誤';
      alert(msg);
    }
    setLoading(false);
  };

  // 登出
  const handleLogout = () => signOut(auth);

  // 更新使用者角色 (管理員專用)
  const handleUpdateUserRole = async (userId, newRole, userName) => {
    if (!permissions.canManageUsers) return;
    try {
      await updateDoc(doc(db, USERS_COLLECTION, userId), { role: newRole });
      await logActivity('變更角色', `將 ${userName} 的角色變更為 ${USER_ROLES[newRole].label}`);
      alert('角色已更新');
    } catch (error) {
      alert('更新失敗: ' + error.message);
    }
  };

  // 新增訂單
  const handleAddOrder = async (form) => {
    if (!permissions.canAddOrder) {
      alert('您沒有新增訂單的權限');
      return;
    }
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...form,
      length: Number(form.length) || 0,
      width: Number(form.width) || 0,
      height: Number(form.height) || 0,
      quantity: Number(form.quantity) || 0,
      status: 'pending',
      createdBy: userProfile?.displayName || user?.email,
      createdAt: serverTimestamp()
    });
    await logActivity('新增訂單', `訂單 ${form.orderNumber || docRef.id} - ${form.customerName}`);
  };

  // 更新訂單
  const handleUpdateOrder = async (id, form) => {
    if (!permissions.canEditOrder) {
      alert('您沒有修改訂單的權限');
      return;
    }
    await updateDoc(doc(db, ORDERS_COLLECTION, id), {
      ...form,
      length: Number(form.length) || 0,
      width: Number(form.width) || 0,
      height: Number(form.height) || 0,
      quantity: Number(form.quantity) || 0,
      updatedBy: userProfile?.displayName || user?.email,
      updatedAt: serverTimestamp()
    });
    await logActivity('修改訂單', `訂單 ${form.orderNumber || id} - ${form.customerName}`);
  };

  // 刪除訂單
  const handleDelete = async (id) => {
    if (!permissions.canDeleteOrder) {
      alert('您沒有刪除訂單的權限');
      return;
    }
    const order = orders.find(o => o.id === id);
    await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    await logActivity('刪除訂單', `訂單 ${order?.orderNumber || id} - ${order?.customerName || '未知'}`);
  };

  // 篩選訂單
  const getFilteredOrders = () => {
    let filtered = orders;

    // 文字搜尋
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();
      filtered = filtered.filter(o =>
        (o.customerName || '').toLowerCase().includes(keyword) ||
        (o.productName || '').toLowerCase().includes(keyword) ||
        (o.poNumber || '').toLowerCase().includes(keyword) ||
        (o.orderNumber || '').toLowerCase().includes(keyword) ||
        (o.workOrderNumber || '').toLowerCase().includes(keyword)
      );
    }

    // 日期篩選
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(o => {
        if (!o.createdAt?.toDate) return false;
        const orderDate = o.createdAt.toDate();

        if (dateFilter === 'today') {
          return orderDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        }
        return true;
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const dateFilterLabels = { all: '全部', today: '今天', week: '本週', month: '本月' };

  // 選取訂單
  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 派車
  const handleDispatch = async () => {
    if (!permissions.canDispatch) {
      alert('您沒有派車的權限');
      return;
    }
    if (selectedIds.length === 0) return alert('請先選取訂單');
    const dispatchId = 'D-' + Date.now().toString().slice(-6);
    const batch = writeBatch(db);
    const dispatchedOrders = orders.filter(o => selectedIds.includes(o.id));
    selectedIds.forEach(id => {
      batch.update(doc(db, ORDERS_COLLECTION, id), {
        status: 'dispatched',
        dispatchId,
        dispatchedBy: userProfile?.displayName || user?.email,
        dispatchedAt: serverTimestamp()
      });
    });
    await batch.commit();
    await logActivity('派車', `派車單號 ${dispatchId}，共 ${selectedIds.length} 筆訂單: ${dispatchedOrders.map(o => o.orderNumber || o.id).join(', ')}`);
    setSelectedIds([]);
    alert(`派車完成！單號: ${dispatchId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="border-4 border-blue-600 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">載入中...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} loading={loading} />;
  }

  const RoleIcon = userProfile?.role ? USER_ROLES[userProfile.role].icon : User;
  const roleColor = userProfile?.role ? USER_ROLES[userProfile.role].color : 'gray';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <header className="bg-white border-b-2 border-blue-600 p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="border-2 border-blue-600 p-2 rounded-lg">
              <Box className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">倉儲掃描通</h1>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-${roleColor}-100 text-${roleColor}-700 border border-${roleColor}-300`}>
                  <RoleIcon className="w-3 h-3" />
                  {USER_ROLES[userProfile?.role || 'driver'].label}
                </span>
                <span className="text-xs text-gray-500">{userProfile?.displayName || user?.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {permissions.canManageUsers && (
              <button onClick={() => setShowUserManagement(true)} className="p-2 text-gray-500 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-600 transition-all" title="使用者管理">
                <Users className="w-5 h-5" />
              </button>
            )}
            {permissions.canViewLogs && (
              <button onClick={() => setShowActivityLogs(true)} className="p-2 text-gray-500 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-600 transition-all" title="操作紀錄">
                <History className="w-5 h-5" />
              </button>
            )}
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-500 transition-all" title="登出">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        {selectedIds.length > 0 && permissions.canDispatch && (
          <button onClick={handleDispatch}
            className="mt-3 w-full border-2 border-green-600 bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all">
            <Truck className="w-5 h-5" /> 合併派車 ({selectedIds.length} 筆訂單)
          </button>
        )}
      </header>

      {/* 搜尋與篩選區 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
        {/* 搜尋欄 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋客戶、產品、PO單號..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-600 focus:outline-none transition-all"
          />
          {searchText && (
            <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 日期篩選 + 統計 */}
        <div className="flex justify-between items-center">
          <div className="relative">
            <button
              onClick={() => setShowDateMenu(!showDateMenu)}
              className="flex items-center gap-2 px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-600 transition-all"
            >
              <Calendar className="w-4 h-4" />
              {dateFilterLabels[dateFilter]}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDateMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                {Object.entries(dateFilterLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setDateFilter(key); setShowDateMenu(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between ${
                      dateFilter === key ? 'text-blue-600 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {label}
                    {dateFilter === key && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">顯示: <span className="font-bold text-gray-900">{filteredOrders.length}</span></span>
            <span className="text-gray-600">待處理: <span className="font-bold text-blue-600">{filteredOrders.filter(o => o.status !== 'dispatched').length}</span></span>
          </div>
        </div>
      </div>

      {/* 訂單列表 */}
      <main className="p-4 pb-24">
        {filteredOrders.length === 0 ? (
          <div className="text-center mt-20">
            <div className="border-2 border-gray-300 rounded-full p-6 inline-block mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {orders.length === 0 ? '尚無訂單' : '沒有符合條件的訂單'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {orders.length === 0 ? '點擊右下角按鈕開始掃描' : '試試其他搜尋條件'}
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={selectedIds.includes(order.id)}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onDetail={() => setDetailOrder(order)}
            />
          ))
        )}
      </main>

      {/* 底部新增按鈕 - 只有有權限的人才顯示 */}
      {permissions.canAddOrder && (
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-6 right-6 bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-600 hover:text-white active:scale-95 transition-all z-50"
        >
          <Camera className="w-6 h-6" />
        </button>
      )}

      {/* 掃描器 / 新增表單 */}
      {showAddForm && (
        <ScannerModal onClose={() => setShowAddForm(false)} onSave={handleAddOrder} />
      )}

      {/* 訂單詳情/編輯 Modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onSave={handleUpdateOrder}
          onDelete={handleDelete}
        />
      )}

      {/* 使用者管理 Modal */}
      {showUserManagement && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border-2 border-blue-600 w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-4 border-b-2 border-blue-600">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" /> 使用者管理
              </h2>
              <button onClick={() => setShowUserManagement(false)} className="p-2 text-gray-500 hover:text-gray-900 border border-gray-300 rounded hover:border-gray-500 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh] p-4 space-y-3">
              {allUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">尚無使用者</p>
              ) : (
                allUsers.map(u => (
                  <div key={u.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{u.displayName || '未設定姓名'}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                      <select
                        value={u.role || 'driver'}
                        onChange={e => handleUpdateUserRole(u.id, e.target.value, u.displayName)}
                        className={`border-2 rounded-lg px-3 py-1 text-sm font-semibold ${
                          u.role === 'admin' ? 'border-red-300 bg-red-50 text-red-700' :
                          u.role === 'warehouse' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                          'border-green-300 bg-green-50 text-green-700'
                        }`}
                      >
                        <option value="admin">管理員</option>
                        <option value="warehouse">倉管</option>
                        <option value="driver">司機</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      註冊時間: {u.createdAt?.toDate?.()?.toLocaleString('zh-TW') || '-'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 操作紀錄 Modal */}
      {showActivityLogs && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border-2 border-blue-600 w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-4 border-b-2 border-blue-600">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-600" /> 操作紀錄
              </h2>
              <button onClick={() => setShowActivityLogs(false)} className="p-2 text-gray-500 hover:text-gray-900 border border-gray-300 rounded hover:border-gray-500 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh] p-4 space-y-2">
              {activityLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">尚無操作紀錄</p>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-gray-900">{log.action}</span>
                      <span className="text-xs text-gray-400">
                        {log.createdAt?.toDate?.()?.toLocaleString('zh-TW') || '-'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-1">操作者: {log.userName} ({log.userEmail})</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}