import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import lib1Bg from '../components/lib_1.jpeg';

function Upload() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fiqh');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  const categoryPrices = {
    'Fiqh': 2000,
    'Hadith': 2000,
    'Seerah': 2000,
    'Tafseer': 2000,
    'Aqeedah': 2000,
    'Children\'s Collection': 1500,
    'Academic Research': 2500,
    'Novels & Literature': 1500
  };

  const currentPrice = categoryPrices[category] || 1500;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().category);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const executeFileUpload = async (paymentRef) => {
    try {
      setLoading(true);
      setStatusMessage("Congratulations, your payment is successful; your upload is in progress.");

      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `books/${Date.now()}_${safeFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "books"), {
        title: title.trim(),
        author: author.trim(),
        category,
        price: currentPrice,
        description: description.trim(),
        fileUrl: downloadURL,
        uploadedBy: user.email,
        paymentReference: paymentRef,
        createdAt: serverTimestamp()
      });

      setLoading(false);
      setStatusMessage('');
      alert("Congratulations, your book has successfully been added to our collection");
      
      setTitle('');
      setAuthor('');
      setDescription('');
      setFile(null);

      navigate('/reader');
    } catch (error) {
      setLoading(false);
      setStatusMessage('');
      console.error("Upload error:", error);
      alert("Upload error: " + error.message);
    }
  };

  const handleInitiatePayment = (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF document to upload!");

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      let handler = window.PaystackPop.setup({
        key: 'pk_test_5f0172fdaa8509d71791fe726c64007af3518bc6',
        email: user.email,
        amount: currentPrice * 100,
        currency: 'NGN',
        ref: '' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function(response) {
          setStatusMessage("Congratulations, your payment is successful; your upload is in progress.");
          executeFileUpload(response.reference);
        },
        onClose: function() {
          alert('Transaction closed. Publication was not completed.');
        }
      });
      handler.openIframe();
    };
    document.body.appendChild(script);
  };

  if (checkingAuth) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#1e3a8a', fontWeight: 'bold' }}>Authenticating Author Portal...</div>;
  }

  // --- INLINE MODAL PROMPT FOR UNAUTHENTICATED USERS ---
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${lib1Bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff', padding: '35px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center' }}>
          <h2 style={{ color: '#1e3a8a', marginTop: 0, marginBottom: '10px' }}>Authentication Required</h2>
          <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Please login to your author account to access the publishing portal.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Login Now
            </Link>
            <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'reader') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${lib1Bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#ffffff', padding: '35px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626', marginTop: 0, marginBottom: '10px' }}>Author Access Restricted</h2>
          <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Your account is registered as a Reader. Please fill in the correct details to continue.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/reader')} style={{ padding: '10px 18px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>Catalogue Portal</button>
            <button onClick={handleLogout} style={{ padding: '10px 18px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${lib1Bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: '#1e293b', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' 
    }}>
      
      {/* Header */}
      <header style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0', padding: '15px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a' }}>
            Addeen <span style={{ color: '#d97706' }}>E-Library</span>
          </Link>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Author: <strong>{user.email}</strong></span>
            <button onClick={handleLogout} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <main style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px 60px 20px' }}>
        <form onSubmit={handleInitiatePayment} style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <h2 style={{ color: '#1e3a8a', marginTop: 0, marginBottom: '20px' }}>Publish Publication</h2>

          {statusMessage && (
            <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
              {statusMessage}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Book Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Al-Fiqh Al-Manhaji" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Author Name</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="e.g., Dr. Mustafa Al-Khin" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="Fiqh">Fiqh (Jurisprudence)</option>
                <option value="Hadith">Hadith</option>
                <option value="Seerah">Seerah</option>
                <option value="Tafseer">Tafseer</option>
                <option value="Aqeedah">Aqeedah</option>
                <option value="Children's Collection">Children's Collection</option>
                <option value="Academic Research">Academic Research</option>
                <option value="Novels & Literature">Novels & Literature</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Upload Fee</label>
              <input type="text" value={`₦${currentPrice.toLocaleString()}`} disabled style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontWeight: 'bold', color: '#d97706' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Summary of publication contents..." style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '100px', outline: 'none' }}></textarea>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Upload PDF Document</label>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required style={{ width: '100%' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Processing Upload...' : `Pay ₦${currentPrice.toLocaleString()} & Publish Book`}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Upload;