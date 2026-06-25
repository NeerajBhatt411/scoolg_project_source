import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { schoolData } from './data/mockData';
import './index.css';

const API_BASE = 'https://scoolg-backend.netlify.app/api';

// Small helper so we can render a lucide icon by name string.
const LucideIcon = ({ name, ...props }) => {
  const I = Icons[name];
  return I ? <I {...props} /> : null;
};

// Pick a relevant icon for a facility from its name (so every card isn't the
// same tick mark). Falls back to a sparkle for anything unrecognised.
const facilityIcon = (f) => {
  const s = (f || '').toLowerCase();
  if (s.includes('librar')) return 'BookOpen';
  if (s.includes('comput') || s.includes(' it')) return 'Laptop';
  if (s.includes('smart') || s.includes('class')) return 'Presentation';
  if (s.includes('science') || s.includes('lab')) return 'FlaskConical';
  if (s.includes('sport') || s.includes('ground') || s.includes('gym') || s.includes('play')) return 'Trophy';
  if (s.includes('audi') || s.includes('theat') || s.includes('hall')) return 'Drama';
  if (s.includes('transport') || s.includes('bus')) return 'Bus';
  if (s.includes('hostel') || s.includes('board') || s.includes('dorm')) return 'BedDouble';
  if (s.includes('cafe') || s.includes('canteen') || s.includes('mess') || s.includes('food')) return 'UtensilsCrossed';
  if (s.includes('medical') || s.includes('health') || s.includes('infirmary') || s.includes('clinic')) return 'Stethoscope';
  if (s.includes('music') || s.includes('art') || s.includes('dance')) return 'Music2';
  if (s.includes('swim') || s.includes('pool')) return 'Waves';
  if (s.includes('wifi') || s.includes('internet') || s.includes('digital')) return 'Wifi';
  if (s.includes('secur') || s.includes('cctv') || s.includes('safe')) return 'ShieldCheck';
  return 'Sparkles';
};

// Branded full-screen loader (with a climbing % counter) shown while a school's
// live data is being fetched. Shows the SCHOOL'S OWN logo once it's available.
const LoadingScreen = ({ logo, name }) => {
  const [pct, setPct] = useState(6);
  useEffect(() => {
    const t = setInterval(() => setPct((p) => (p >= 100 ? 100 : p + Math.max(1, Math.ceil((101 - p) / 8)))), 110);
    return () => clearInterval(t);
  }, []);
  const initial = (name || 'S').charAt(0).toUpperCase();
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', zIndex: 9999, gap: '20px' }}>
      <style>{`@keyframes cwspin{to{transform:rotate(360deg)}}@keyframes cwpulse{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
      <div style={{ position: 'relative', width: 108, height: 108, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #ece9fb', borderTopColor: '#4B2ED5', animation: 'cwspin 0.8s linear infinite' }} />
        {logo
          ? <img src={logo} alt="" style={{ width: 68, height: 68, borderRadius: 16, objectFit: 'contain', animation: 'cwpulse 1.5s ease-in-out infinite' }} />
          : <div style={{ width: 68, height: 68, borderRadius: 16, background: 'linear-gradient(135deg,#6d4bff,#4B2ED5)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '1.9rem', fontFamily: 'Outfit, sans-serif', animation: 'cwpulse 1.5s ease-in-out infinite' }}>{initial}</div>}
      </div>
      <div style={{ fontWeight: 900, fontSize: '2.1rem', color: '#4B2ED5', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>{pct}%</div>
      <div style={{ width: 200, maxWidth: '60vw', height: 6, borderRadius: 99, background: '#ece9fb', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6d4bff, #4B2ED5)', borderRadius: 99, transition: 'width .25s ease' }} />
      </div>
      <p style={{ fontWeight: 800, fontSize: '1.02rem', color: '#1f2937', margin: 0 }}>Loading {name || 'your school'}…</p>
    </div>
  );
};

const App = () => {
  // Onboarding preview (localStorage) is the initial source; on a real school
  // subdomain (e.g. gajera.scoolg.com) we replace it with that school's live data.
  // Detect the school subdomain (e.g. countrywide.scoolg.com -> "countrywide").
  const subdomain = (() => {
    const parts = window.location.hostname.split('.');
    const ignore = ['www', 'scoolg', 'localhost', '127'];
    return parts.length >= 3 && !ignore.includes(parts[0]) ? parts[0] : null;
  })();

  // On a real school subdomain, ignore any stale localStorage preview and load
  // THAT school's live data; on the apex/demo we keep the onboarding preview.
  const [currentOnboardingData, setCurrentOnboardingData] = useState(() => {
    if (subdomain) return null;
    const saved = localStorage.getItem('onboardingData');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(!!subdomain);

  useEffect(() => {
    if (!subdomain) return; // apex/preview/dev → keep localStorage preview
    fetch(`${API_BASE}/public/school/${subdomain}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.formData) setCurrentOnboardingData(d.formData); })
      .catch(() => {})
      // brief hold so the school's logo is visible on the loader before reveal
      .finally(() => setTimeout(() => setLoading(false), 550));
  }, []);

  const data = currentOnboardingData;
  const isReal = !!data;   // a real school's data is loaded (vs. demo/preview)

  const hasFees = isReal && data.fees && (data.fees.primary || data.fees.secondary || data.fees.seniorSecondary);

  // When NO school data (apex / demo preview) → show the full mock template so the
  // showcase looks complete. For a REAL school → build only from their data and
  // leave empty things empty (the sections get hidden below).
  const getMergedData = () => {
    if (!isReal) return schoolData;

    return {
      ...schoolData,
      hero: {
        ...schoolData.hero,
        title: data.schoolName || schoolData.hero.title,
        description: data.schoolDescription || `Welcome to ${data.schoolName || 'our school'} — nurturing tomorrow's leaders.`,
        mainImage: data.coverImage || schoolData.hero.mainImage,
        floatingStats: {
          ...schoolData.hero.floatingStats,
          value: data.schoolStrength || schoolData.hero.floatingStats.value,
        },
      },
      about: {
        ...schoolData.about,
        description: [data.establishedYear ? `Established in ${data.establishedYear}.` : '', data.schoolDescription || '']
          .join(' ').trim(),
        cards: [
          ...(data.mission ? [{ ...schoolData.about.cards[0], description: data.mission }] : []),
          ...(data.vision ? [{ ...schoolData.about.cards[1], description: data.vision }] : []),
        ],
      },
      leadership: (data.leadership && data.leadership.length)
        ? data.leadership.map((member, i) => ({
            id: i + 1,
            // Use the uploaded photo if there is one; otherwise a clean initials avatar.
            image: member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'M')}&background=4B2ED5&color=fff&bold=true`,
            name: member.name || 'Leadership Member',
            title: member.role || 'Board Member',
            description: member.message || '',
          }))
        : [],
      gallery: (data.gallery && data.gallery.length)
        ? data.gallery.map((url, i) => ({ id: i + 1, url, category: 'Campus', isLarge: i === 0 }))
        : [],
      pricing: hasFees
        ? [
            { ...schoolData.pricing[0], price: data.fees?.primary || '—' },
            { ...schoolData.pricing[1], price: data.fees?.secondary || '—' },
            { ...schoolData.pricing[2], price: data.fees?.seniorSecondary || '—' },
          ]
        : [],
      facilities: data.facilities || [],
      otherFacilities: data.otherFacilities || '',
      contact: {
        address: [data.address, data.city, data.state].filter(Boolean).join(', ') + (data.pincode ? ` - ${data.pincode}` : ''),
        phone: data.phone || '',
        email: data.email || '',
        social: data.socialMedia || {},
      },
      logo: data.logo,
    };
  };

  const finalData = getMergedData();
  const { hero, leadership, about, levels, academics, notices, gallery, pricing, contact, logo, facilities, otherFacilities } = finalData;

  // Which sections to render. Demo/preview → everything. Real school → only what
  // they actually provided (empty ones disappear). Levels/Academics/Notices have
  // no onboarding source, so for a real school they stay hidden.
  const show = {
    leadership: isReal ? leadership.length > 0 : true,
    about:      isReal ? (about.cards.length > 0 || !!about.description) : true,
    levels:     !isReal,
    academics:  !isReal,
    notices:    !isReal,
    facilities: isReal ? (((facilities && facilities.length) || !!otherFacilities) ? true : false) : true,
    gallery:    isReal ? gallery.length > 0 : true,
    fees:       isReal ? pricing.length > 0 : true,
  };

  const social = contact.social || {};
  const hasSocial = !!(social.instagram || social.facebook || social.twitter || social.youtube);

  const [currentPage, setCurrentPage] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page, tab) => {
    setCurrentPage(page);
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const navLinks = (
    <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
      <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home', 'home')}>Home</button>
      {show.about && <a href="#about" className={`nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => handleNavClick('home', 'about')}>About Us</a>}
      {show.fees && <button className={`nav-item ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => handleNavClick('fees', 'fees')}>Fees Structure</button>}
      <a href="#contact" className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => handleNavClick(currentPage, 'contact')}>Contact</a>
    </div>
  );

  if (loading) return <LoadingScreen logo={currentOnboardingData?.logo} name={subdomain ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1) : ''} />;

  return (
    <div style={{ position: 'relative' }}>
      <div className="top-bg-gradient"></div>

      {/* Header */}
      <header>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div className="logo" style={{ minWidth: '150px' }}>
            <img src={logo || "https://ui-avatars.com/api/?name=L&background=4B2ED5&color=fff&rounded=true&bold=true"} alt="Logo" style={{ height: '40px', borderRadius: '10px', objectFit: 'contain' }} />
            <span style={{ marginLeft: '10px' }}>{hero.title.split(' ')[0]}</span>
          </div>

          {navLinks}

          <div style={{ width: '150px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <Icons.X size={28} /> : <Icons.Menu size={28} />}
            </button>
          </div>
        </nav>
      </header>

      {currentPage === 'home' ? (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-text">
              <span className="badge">{hero.badge}</span>
              <h1>{hero.title}</h1>
              <p className="hero-description">{hero.description}</p>
              <div className="hero-buttons">
                <button className="btn btn-primary">{hero.ctaPrimary}</button>
                <button className="btn btn-secondary">{hero.ctaSecondary}</button>
              </div>
            </div>
            <div className="hero-image-container">
              <img src={hero.mainImage} alt="School Main View" className="hero-image-main" />
              <div className="hero-tag">
                <div style={{ background: '#FFF8D6', borderRadius: '12px', padding: '12px', display: 'flex' }}>
                  <Icons.School size={24} color="#D97706" />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-dark)', lineHeight: 1.2 }}>{hero.floatingStats.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hero.floatingStats.sub}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Leadership Section */}
          {show.leadership && (
          <section id="leadership" style={{ background: '#FAFAFA' }}>
            <div className="section-title">
              <span className="badge blue">Our Team</span>
              <h2>Our Leadership</h2>
              <p>Meet the visionary leaders driving excellence at our institution with decades of pedagogical experience.</p>
            </div>
            <div className="card-grid-3">
              {leadership.map(member => (
                <div key={member.id} className="gray-card" style={{ background: 'var(--white)' }}>
                  <img src={member.image} alt={member.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 20 }} />
                  <h3 className="card-title">{member.name}</h3>
                  <p className="card-subtitle">{member.title}</p>
                  {member.description && <p className="card-desc" style={{ fontStyle: 'italic' }}>{member.description}</p>}
                </div>
              ))}
            </div>
          </section>
          )}

          {/* About Section */}
          {show.about && (
          <section id="about">
            <div className="section-title">
              <span className="badge blue" style={{ background: '#F0F9FF', color: '#0369A1' }}>Learn More</span>
              <h2>{about.title}</h2>
              <p>{about.description}</p>
            </div>
            <div className="card-grid">
              {about.cards.map((card, idx) => (
                <div key={idx} className="gray-card" style={{ display: 'flex', gap: '25px', alignItems: 'center', textAlign: 'left', background: 'var(--white)' }}>
                  <div className="icon-box" style={{ background: idx === 0 ? '#FCE7F3' : '#FEF3C7', color: 'inherit' }}>
                    {(() => {
                      const IconComponent = Icons[card.icon];
                      return IconComponent ? <IconComponent size={24} /> : null;
                    })()}
                  </div>
                  <div>
                    <h3 className="card-title" style={{ marginBottom: '5px' }}>{card.title}</h3>
                    <p className="card-desc">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}

          {/* Our Levels Section */}
          {show.levels && (
          <section style={{ background: '#FAFAFA' }}>
            <div className="section-title">
              <span className="badge blue">Programs</span>
              <h2>Our Levels</h2>
              <p>Structured academic phases designed to accommodate cognitive and emotional growth.</p>
            </div>
            <div className="card-grid-3">
              {levels.map(level => (
                <div key={level.id} className="gray-card" style={{ textAlign: 'left', background: 'var(--white)' }}>
                  <div className="icon-box" style={{ background: level.id === 1 ? '#DCFCE7' : level.id === 2 ? '#DBEAFE' : '#FCE7F3' }}>
                    {(() => {
                      const IconComponent = Icons[level.icon];
                      return IconComponent ? <IconComponent size={24} /> : null;
                    })()}
                  </div>
                  <h3 className="card-title">{level.title}</h3>
                  <p className="card-desc" style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: 15 }}>{level.grade}</p>
                  <p className="card-desc">{level.desc}</p>
                </div>
              ))}
            </div>
          </section>
          )}

          {/* Academics Section */}
          {show.academics && (
          <section>
            <div className="section-title">
              <span className="badge blue">Curriculum</span>
              <h2>Academics</h2>
              <p>Providing a robust educational framework tailored to empower the students of tomorrow.</p>
            </div>
            <div className="card-grid-3">
              {academics.map(acad => (
                <div key={acad.id} className="gray-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--white)' }}>
                  <div className="icon-box" style={{ background: '#F3F4F6' }}>
                    {(() => {
                      const IconComponent = Icons[acad.icon];
                      return IconComponent ? <IconComponent size={24} /> : null;
                    })()}
                  </div>
                  <h3 className="card-title">{acad.title}</h3>
                  <p className="card-desc">{acad.desc}</p>
                </div>
              ))}
            </div>
          </section>
          )}

          {/* Facilities Section */}
          {show.facilities && (
          <section className="section" id="facilities" style={{ background: 'var(--surface)' }}>
            <div className="container">
              <div className="section-header">
                <span className="badge">Campus Life</span>
                <h2 className="section-title">Premium Facilities</h2>
                <p className="section-subtitle">Discover the state-of-the-art infrastructure we provide for our students' holistic growth.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '22px' }}>
                {[
                  ...(facilities || []).filter((f) => f && f !== 'OTHER'),
                  ...((otherFacilities || '').split(',').map((f) => f.trim()).filter(Boolean)),
                ].map((f, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{ padding: '30px 22px', textAlign: 'center', background: 'white', borderRadius: '22px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', transition: 'transform .22s ease, box-shadow .22s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 30px -12px rgba(75,46,213,.28)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--accent-soft), #ffffff)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--accent)', boxShadow: 'inset 0 0 0 1px var(--border-color)' }}>
                      <LucideIcon name={facilityIcon(f)} size={28} />
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1f2937' }}>{f}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* Notices Section */}
          {show.notices && (
          <section style={{ background: '#FAFAFA' }}>
            <div className="section-title" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge">Latest News</span>
                <h2 style={{ marginBottom: 0 }}>Latest Notices</h2>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>View All &rarr;</button>
            </div>

            <div className="card-grid notice-grid">
              <div className="notice-featured" style={{ borderLeft: '6px solid var(--primary)' }}>
                <span className="badge blue" style={{ background: 'var(--primary)', color: 'white', letterSpacing: 0.5, fontSize: '0.7rem' }}>FEATURED</span>
                <h2 style={{ fontSize: '2.5rem', margin: '20px 0', color: 'var(--primary)', lineHeight: 1.2 }}>{notices.featured.title}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>{notices.featured.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{notices.featured.date}</span>
                  <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '99px' }}>Read More</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notices.list.map(notice => (
                  <div key={notice.id} className="notice-list-item">
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ background: '#EEF2FF', padding: '15px', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Icons.FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ marginBottom: '5px', fontSize: '1.05rem', color: 'var(--text-dark)' }}>{notice.title}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{notice.date}</span>
                      </div>
                    </div>
                    <div style={{ padding: '8px', background: '#F9FAFB', borderRadius: '50%', color: 'var(--primary)', cursor: 'pointer', border: '1px solid #E5E7EB' }}>&rarr;</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          )}

          {/* Gallery Section */}
          {show.gallery && gallery.length > 0 && (
          <section id="gallery">
            <div className="section-title">
              <span className="badge blue">Our Campus</span>
              <h2>Campus Gallery</h2>
            </div>

            <div className="gallery-grid">
              <div className="gallery-img-container gallery-grid-left">
                <img src={gallery[0].url} alt="Large View" className="gallery-img" />
              </div>
              <div className="gallery-grid-right">
                {gallery.slice(1, 5).map(img => (
                  <div key={img.id} className="gallery-img-container">
                    <img src={img.url} alt={img.category} className="gallery-img" />
                  </div>
                ))}
              </div>
            </div>
          </section>
          )}
        </>
      ) : (
        <>
          {/* Fee Structure Page View */}
          <section style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '60vh' }}>
            <div className="section-title">
              <span className="badge blue">Plans</span>
              <h2>Fee Structure</h2>
              <p>Investment in education is the best investment for your child's future. Transparent and inclusive fee structure.</p>
            </div>
            <div className="card-grid-3" style={{ alignItems: 'center' }}>
              {pricing.map((plan, idx) => (
                <div key={idx} className={`pricing-card ${plan.isFeatured ? 'featured' : ''}`} style={{ textAlign: 'center' }}>
                  {plan.isFeatured &&
                    <div style={{ position: 'absolute', top: -15, right: 30, background: 'var(--secondary)', color: 'var(--text-dark)', padding: '6px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 800 }}>
                      POPULAR
                    </div>
                  }
                  <h3 style={{ fontSize: '1.4rem', marginBottom: 20 }}>{plan.level}</h3>
                  <div style={{ margin: '30px 0' }}>
                    <span style={{ fontSize: '3.5rem', fontWeight: '800' }}>₹{plan.price}</span>
                    <span style={{ opacity: plan.isFeatured ? 0.8 : 0.5, fontSize: '1rem', fontWeight: 500 }}>{plan.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', marginBottom: '40px', textAlign: 'left' }}>
                    {plan.features.map((feat, i) => (
                      <li key={i} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px', color: plan.isFeatured ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}>
                        <span style={{ color: plan.isFeatured ? 'var(--secondary)' : 'var(--primary)', fontWeight: 'bold' }}>✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                  <button className={`btn ${plan.isFeatured ? '' : 'btn-secondary'}`} style={{ width: '100%', background: plan.isFeatured ? 'white' : '', color: plan.isFeatured ? 'var(--primary)' : '' }}>Register Now</button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Common Contact Section for both pages */}
      <section id="contact" style={{ background: currentPage === 'fees' ? '#FAFAFA' : 'var(--white)' }}>
        <div className="section-title" style={{ textAlign: 'left' }}>
          <span className="badge blue">Get in Touch</span>
          <h2 style={{ marginBottom: 10 }}>Contact Us</h2>
        </div>

        <div className="contact-container">
          <div>
            <div style={{ background: '#FAFAFA', padding: '40px', borderRadius: '24px', height: '100%', border: '1px solid #E5E7EB' }}>
              {contact.address && contact.address.trim() && (
              <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div className="icon-box" style={{ width: 40, height: 40, background: '#E0E7FF' }}><Icons.MapPin size={20} /></div>
                <div>
                  <h4 style={{ marginBottom: 5 }}>Address</h4>
                  <p style={{ color: 'var(--text-muted)' }}>{contact.address}</p>
                </div>
              </div>
              )}
              {contact.phone && (
              <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div className="icon-box" style={{ width: 40, height: 40, background: '#E0E7FF' }}><Icons.Phone size={20} /></div>
                <div>
                  <h4 style={{ marginBottom: 5 }}>Call Us</h4>
                  <p style={{ color: 'var(--text-muted)' }}>{contact.phone}</p>
                </div>
              </div>
              )}
              {contact.email && (
              <div style={{ display: 'flex', gap: '20px', marginBottom: hasSocial ? '40px' : 0 }}>
                <div className="icon-box" style={{ width: 40, height: 40, background: '#E0E7FF' }}><Icons.Mail size={20} /></div>
                <div>
                  <h4 style={{ marginBottom: 5 }}>Email</h4>
                  <p style={{ color: 'var(--text-muted)' }}>{contact.email}</p>
                </div>
              </div>
              )}
              {hasSocial && (
              <div style={{ display: 'flex', gap: '14px', marginTop: 10 }}>
                {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="icon-box" style={{ width: 40, height: 40, background: '#E0E7FF', color: 'var(--primary)' }}><Icons.Instagram size={20} /></a>}
                {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" className="icon-box" style={{ width: 40, height: 40, background: '#E0E7FF', color: 'var(--primary)' }}><Icons.Facebook size={20} /></a>}
                {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" className="icon-box" style={{ width: 40, height: 40, background: '#E0E7FF', color: 'var(--primary)' }}><Icons.Twitter size={20} /></a>}
                {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="icon-box" style={{ width: 40, height: 40, background: '#E0E7FF', color: 'var(--primary)' }}><Icons.Youtube size={20} /></a>}
              </div>
              )}
            </div>
          </div>

          <div>
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" className="form-control" placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="form-control" placeholder="+1 234 567 890" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="form-control" placeholder="How can we help you?"></textarea>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>Send Message</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: 20 }}>
              <img src={logo || "https://ui-avatars.com/api/?name=L&background=fff&color=4B2ED5&rounded=true&bold=true"} alt="Logo" style={{ height: '50px', borderRadius: '12px', objectFit: 'contain' }} />
              {hero.title.split(' ')[0]}
            </div>
            <p style={{ opacity: 0.8, maxWidth: 400 }}>Empowering students to achieve excellence and shaping the visionary leaders of tomorrow through holistic education paradigms.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Navigation</h4>
            <ul style={{ listStyle: 'none', lineHeight: 2.2, opacity: 0.8 }}>
              <li><button onClick={() => handleNavClick('home', 'home')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, font: 'inherit' }}>Home</button></li>
              {show.about && <li><button onClick={() => handleNavClick('home', 'about')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, font: 'inherit' }}>About Us</button></li>}
              {show.fees && <li><button onClick={() => handleNavClick('fees', 'fees')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, font: 'inherit' }}>Fees Structure</button></li>}
              <li><a href="#contact" onClick={() => handleNavClick(currentPage, 'contact')} style={{ color: 'white', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Legal</h4>
            <ul style={{ listStyle: 'none', lineHeight: 2.2, opacity: 0.8 }}>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 30, opacity: 0.65, fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} {hero.title}. All rights reserved. &nbsp;·&nbsp; Powered by Scoolg
        </div>
      </footer>
    </div>
  );
};

export default App;
