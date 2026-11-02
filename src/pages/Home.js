import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

function Home() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  
  // Shopping Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();

  // Listen for user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Cart Helper Functions
  const addToCart = (book) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === book.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...book, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (bookId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== bookId));
  };

  const updateQuantity = (bookId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === bookId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      // Proceed to Reader Checkout Page
      navigate('/reader');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/reader?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/reader');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* 1. Header / Navigation Bar */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', sticky: 'top', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e3a8a', letterSpacing: '-0.5px' }}>
              Addeen <span style={{ color: '#d97706' }}>E-Library</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>
            <Link to="/reader" style={{ textDecoration: 'none', color: '#334155' }}>Catalogue</Link>
            <Link to="/upload" style={{ textDecoration: 'none', color: '#334155' }}>Author Portal</Link>
          </nav>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Cart Button with Counter */}
            <button 
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 'bold',
                color: '#1e3a8a'
              }}
            >
              🛒 Cart
              {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                <span style={{
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {user ? (
              <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
                Hi, {user.email.split('@')[0]}
              </span>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#1e3a8a', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                  Sign In
                </Link>
                <Link to="/register" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#1e3a8a', color: '#ffffff', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search Strip */}
        <div style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <form onSubmit={handleSearch} style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Search by</span>
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '500' }}
            >
              <option value="All">Catalogue</option>
              <option value="Fiqh">Fiqh</option>
              <option value="Hadith">Hadith</option>
              <option value="Tafseer">Tafseer</option>
              <option value="Academic Research">Academic Research</option>
            </select>
            <input 
              type="text" 
              placeholder="Search millions of Islamic texts, research papers, and books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '8px 15px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
            />
            <button 
              type="submit" 
              style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🔍 Search
            </button>
          </form>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{ position: 'relative', width: '100%', minHeight: '380px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundImage: 'url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.65 
        }}></div>

        <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '380px' }}>
          <div style={{ maxWidth: '700px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '15px' }}>
              Welcome to Addeen E-Library
            </h1>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#f1f5f9' }}>
              Your global digital repository for classical Islamic literature, peer-reviewed academic research, and universal general works.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Spotlight Publications (Add to Cart) */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 20px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#1e3a8a', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '700' }}>Featured Publications</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {featuredBooks.map((book) => (
            <div key={book.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{book.category}</span>
                <h3 style={{ color: '#0f172a', fontSize: '1.05rem', margin: '10px 0 5px 0' }}>{book.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>By {book.author}</p>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₦{book.price.toLocaleString()}</span>
                <button 
                  onClick={() => addToCart(book)} 
                  style={{ backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Mapped Feature Cards Linked to Specific Categories */}
      <section style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px 60px 20px' }}>
        <h2 style={{ color: '#1e3a8a', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '700' }}>Explore Collections & Portals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          
          <Link to="/reader" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem' }}>📖</div>
              <div>
                <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.15rem', fontWeight: '700' }}>Fiqh & Hadith Collections</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Explore authentic jurisprudential manuals and prophetic traditions.</p>
              </div>
            </div>
          </Link>

          <Link to="/reader" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem' }}>📜</div>
              <div>
                <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.15rem', fontWeight: '700' }}>Seerah & Tafseer</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Prophetic biographies and comprehensive Quranic exegesis.</p>
              </div>
            </div>
          </Link>

          <Link to="/reader" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem' }}>🛡️</div>
              <div>
                <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.15rem', fontWeight: '700' }}>Aqeedah (Islamic Creed)</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Foundational theological texts and creed treatises.</p>
              </div>
            </div>
          </Link>

          <Link to="/reader" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem' }}>🎓</div>
              <div>
                <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.15rem', fontWeight: '700' }}>Academic Research</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Peer-reviewed technical papers and university journals.</p>
              </div>
            </div>
          </Link>

          <Link to="/reader" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem' }}>🎨</div>
              <div>
                <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.15rem', fontWeight: '700' }}>Children's Collection</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Illustrated stories of prophets and moral character building.</p>
              </div>
            </div>
          </Link>

          <Link to="/reader" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem' }}>📚</div>
              <div>
                <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.15rem', fontWeight: '700' }}>Novels & Literature</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>African classics, Islamic literature, and historical fiction.</p>
              </div>
            </div>
          </Link>

          <Link to="/upload" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '2.5rem' }}>✍️</div>
              <div>
                <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.15rem', fontWeight: '700' }}>Author Publishing Portal</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Publish your manuscripts live to our global repository.</p>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* 5. SLIDE-OUT CART DRAWER */}
      {isCartOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '380px',
            maxWidth: '90%',
            height: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '25px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                <h3 style={{ color: '#1e3a8a', margin: 0, fontSize: '1.3rem' }}>Your Reading Cart</h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  style={{ backgroundColor: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>Your cart is empty.</p>
              ) : (
                <div style={{ marginTop: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#0f172a' }}>{item.title}</h4>
                        <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.88rem' }}>₦{item.price.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>-</button>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', marginLeft: '5px' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '15px' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#16a34a' }}>₦{calculateTotal().toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. INLINE LOGIN MODAL FOR CHECKOUT */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px 40px',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#1e3a8a', marginTop: 0, marginBottom: '10px' }}>Authentication Required</h3>
            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Please login to your reader account to complete checkout and download your selected books.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link 
                to="/login" 
                style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
              >
                Login Now
              </Link>
              <button 
                onClick={() => setShowLoginModal(false)}
                style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '30px 20px', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Addeen E-Library System. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default Home;