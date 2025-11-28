import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Camera, Package, Truck, Trash2, LogOut, Save, X, CheckCircle, Box } from 'lucide-react';

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

// --- 登入畫面 ---
const LoginScreen = ({ onLogin, loading }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
      <div className="bg-blue-600 p-4 rounded-full inline-block mb-4">
        <Package className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">倉儲掃描通</h1>
      <p className="text-slate-500 mb-6">多人協作 | 掃描入庫 | 派車管理</p>
      <button
        onClick={onLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? '登入中...' : '訪客登入'}
      </button>
    </div>
  </div>
);

// --- 訂單卡片 ---
const OrderCard = ({ order, isSelected, onSelect, onDelete }) => (
  <div
    className={`bg-white rounded-xl shadow-md p-4 mb-3 border-2 transition-all ${
      order.status === 'dispatched' ? 'border-green-500 bg-green-50' :
      isSelected ? 'border-blue-500' : 'border-transparent'
    }`}
    onClick={() => onSelect(order.id)}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-bold text-lg text-slate-800">{order.customerName || '未知客戶'}</h3>
        <p className="text-slate-600">{order.productName || '未知產品'}</p>
        <p className="text-sm text-slate-500">PO: {order.poNumber || '-'}</p>
        <div className="flex gap-2 mt-2 text-xs text-slate-500">
          <span>📦 {order.quantity || 0} 件</span>
          <span>📐 {order.length}x{order.width}x{order.height}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        {order.status === 'dispatched' && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> 已派車
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
          className="text-red-500 hover:bg-red-100 p-2 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    {order.dispatchId && (
      <p className="text-xs text-green-600 mt-2">派車單號: {order.dispatchId}</p>
    )}
  </div>
);

// --- 新增訂單表單 ---
const AddOrderForm = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    customerName: '', productName: '', poNumber: '',
    length: '', width: '', height: '', quantity: '', fluteType: ''
  });

  const handleSubmit = async () => {
    if (!form.customerName) return alert('請輸入客戶名稱');
    await onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">新增訂單</h2>
          <button onClick={onClose} className="p-2"><X /></button>
        </div>
        <div className="p-4 space-y-4">
          <input className="w-full border rounded-lg p-3" placeholder="客戶名稱 *"
            value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
          <input className="w-full border rounded-lg p-3" placeholder="產品名稱"
            value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} />
          <input className="w-full border rounded-lg p-3" placeholder="採購單號"
            value={form.poNumber} onChange={e => setForm({...form, poNumber: e.target.value})} />
          <div className="grid grid-cols-3 gap-2">
            <input className="border rounded-lg p-3" placeholder="長" type="number"
              value={form.length} onChange={e => setForm({...form, length: e.target.value})} />
            <input className="border rounded-lg p-3" placeholder="寬" type="number"
              value={form.width} onChange={e => setForm({...form, width: e.target.value})} />
            <input className="border rounded-lg p-3" placeholder="高" type="number"
              value={form.height} onChange={e => setForm({...form, height: e.target.value})} />
          </div>
          <input className="w-full border rounded-lg p-3" placeholder="數量" type="number"
            value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          <input className="w-full border rounded-lg p-3" placeholder="楞別 (如: AB楞)"
            value={form.fluteType} onChange={e => setForm({...form, fluteType: e.target.value})} />
        </div>
        <div className="p-4 border-t">
          <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> 儲存訂單
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 主應用程式 ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // 監聽登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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

  // 登入
  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      alert('登入失敗: ' + error.message);
    }
    setLoading(false);
  };

  // 登出
  const handleLogout = () => signOut(auth);

  // 新增訂單
  const handleAddOrder = async (form) => {
    await addDoc(collection(db, ORDERS_COLLECTION), {
      ...form,
      length: Number(form.length) || 0,
      width: Number(form.width) || 0,
      height: Number(form.height) || 0,
      quantity: Number(form.quantity) || 0,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  };

  // 刪除訂單
  const handleDelete = async (id) => {
    if (confirm('確定要刪除此訂單嗎？')) {
      await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    }
  };

  // 選取訂單
  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 派車
  const handleDispatch = async () => {
    if (selectedIds.length === 0) return alert('請先選取訂單');
    const dispatchId = 'D-' + Date.now().toString().slice(-6);
    const batch = writeBatch(db);
    selectedIds.forEach(id => {
      batch.update(doc(db, ORDERS_COLLECTION, id), {
        status: 'dispatched',
        dispatchId
      });
    });
    await batch.commit();
    setSelectedIds([]);
    alert(`派車完成！單號: ${dispatchId}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">載入中...</div>;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 頂部導航 */}
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6" />
            <h1 className="text-xl font-bold">倉儲掃描通</h1>
          </div>
          <button onClick={handleLogout} className="p-2"><LogOut className="w-5 h-5" /></button>
        </div>
        {selectedIds.length > 0 && (
          <button onClick={handleDispatch}
            className="mt-3 w-full bg-green-500 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Truck className="w-5 h-5" /> 合併派車 ({selectedIds.length})
          </button>
        )}
      </header>

      {/* 訂單列表 */}
      <main className="p-4 pb-24">
        {orders.length === 0 ? (
          <div className="text-center text-slate-500 mt-20">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>尚無訂單，點擊下方按鈕新增</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isSelected={selectedIds.includes(order.id)}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))
        )}
      </main>

      {/* 底部新增按鈕 */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all z-50"
      >
        <Camera className="w-6 h-6" />
      </button>

      {/* 新增表單 */}
      {showAddForm && (
        <AddOrderForm onClose={() => setShowAddForm(false)} onSave={handleAddOrder} />
      )}
    </div>
  );
}