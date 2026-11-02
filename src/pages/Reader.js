import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import lib2Bg from '../components/lib_2.jpeg';

function Reader() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart & Login Prompt State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();

 const baseCatalogue = [
  // ==========================================
  // 1. FIQH (Jurisprudence) - 20 Books
  // ==========================================
  { id: 'f1', title: 'Al-Fiqh Al-Manhaji (Volume 1)', author: 'Dr. Mustafa Al-Khin & Dr. Mustafa Al-Bugha', category: 'Fiqh', description: 'Comprehensive guide covering ritual purity, prayer, and foundational worship in Islamic law.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f2', title: 'Al-Fiqh Al-Manhaji (Volume 2)', author: 'Dr. Mustafa Al-Khin & Dr. Mustafa Al-Bugha', category: 'Fiqh', description: 'Structured jurisprudence detailing zakat, fasting, pilgrimage, and vow regulations.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f3', title: 'Al-Fiqh Al-Manhaji (Volume 3)', author: 'Dr. Mustafa Al-Khin & Dr. Mustafa Al-Bugha', category: 'Fiqh', description: 'Legal principles covering commercial contracts, sales, and financial transactions.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f4', title: 'Bidayat al-Mujtahid (The Distinguished Jurist\'s Primer - Vol 1)', author: 'Ibn Rushd (Averroes)', category: 'Fiqh', description: 'Masterwork on comparative jurisprudence analyzing legal rulings across major schools of thought.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f5', title: 'Bidayat al-Mujtahid (The Distinguished Jurist\'s Primer - Vol 2)', author: 'Ibn Rushd (Averroes)', category: 'Fiqh', description: 'Comparative juristic treatise exploring family law, inheritance, and judicial testimony.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f6', title: 'Fiqh us-Sunnah (Volume 1)', author: 'Sayyid Sabiq', category: 'Fiqh', description: 'Lucid overview of Islamic jurisprudence anchored directly in Quranic verses and authentic Hadith.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f7', title: 'Fiqh us-Sunnah (Volume 2)', author: 'Sayyid Sabiq', category: 'Fiqh', description: 'Detailed rulings on marital rights, divorce, custody, and family preservation in Islam.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f8', title: 'Fiqh us-Sunnah (Volume 3)', author: 'Sayyid Sabiq', category: 'Fiqh', description: 'Clear rules governing trade, partnerships, ethical commerce, and estate distribution.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f9', title: 'Al-Muwatta', author: 'Imam Malik ibn Anas', category: 'Fiqh', description: 'The earliest compiled code of Islamic law combining prophetic Hadith and legal practice of Madinah.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f10', title: 'Al-Risalah (Foundations of Jurisprudence)', author: 'Imam Muhammad ibn Idris al-Shafi\'i', category: 'Fiqh', description: 'The seminal treatise establishing the legal methodologies (Usul al-Fiqh) of Islamic law.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f11', title: 'Al-Kafi in Hanbali Fiqh', author: 'Ibn Qudamah al-Maqdisi', category: 'Fiqh', description: 'An accessible, authoritative primer on Hanbali jurisprudence and devotional laws.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f12', title: 'Al-Hedaya (The Guidance in Hanafi Fiqh - Vol 1)', author: 'Burhan al-Din al-Marghinani', category: 'Fiqh', description: 'Classic text on Hanafi jurisprudence covering ritual practices and civil obligations.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f13', title: 'Al-Hedaya (The Guidance in Hanafi Fiqh - Vol 2)', author: 'Burhan al-Din al-Marghinani', category: 'Fiqh', description: 'Classical Hanafi treatise on commercial transactions, judicial procedures, and contracts.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f14', title: 'Nayd al-Awtar (Principles of Fiqh)', author: 'Imam al-Shawkani', category: 'Fiqh', description: 'Analytical examination synthesizing legal Hadith evidence with juristic deduction.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f15', title: 'Matn al-Ghayah wa al-Taqrib (Abu Shuja)', author: 'Abu Shuja al-Isfahani', category: 'Fiqh', description: 'Essential concise manual summarizing Shafi\'i jurisprudence for students and scholars.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f16', title: 'Umdat al-Ahkam (Provisions of Judgments)', author: 'Imam Abd al-Ghani al-Maqdisi', category: 'Fiqh', description: 'A compilation of legal Hadith extracted exclusively from Sahih al-Bukhari and Sahih Muslim.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f17', title: 'Bulugh al-Maram (Attainment of the Objective)', author: 'Hafiz Ibn Hajar al-Asqalani', category: 'Fiqh', description: 'Revered collection of Hadith evidence serving as a primary source for legal deduction.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f18', title: 'Fiqh of Contemporary Issues & Islamic Banking', author: 'Dr. Wahba al-Zuhayli', category: 'Fiqh', description: 'Modern juristic rulings examining digital trade, non-interest banking, and contemporary ethics.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f19', title: 'The Mukhtasar of Al-Quduri', author: 'Abu\'l-Hasan al-Quduri', category: 'Fiqh', description: 'Standard foundational manual in Hanafi law utilized across Islamic institutions worldwide.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'f20', title: 'Sharh al-Sunnah (Principles of Juristic Sunnah)', author: 'Imam al-Baghawi', category: 'Fiqh', description: 'Comprehensive exposition linking prophetic tradition with practical juristic applications.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },

  // ==========================================
  // 2. HADITH - 20 Books
  // ==========================================
  { id: 'h1', title: 'Sahih al-Bukhari (English Translation - Vol 1)', author: 'Imam Al-Bukhari', category: 'Hadith', description: 'The most authentic collection of Hadith detailing revelation, faith, and ritual purity.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h2', title: 'Sahih al-Bukhari (English Translation - Vol 2)', author: 'Imam Al-Bukhari', category: 'Hadith', description: 'Prophetic traditions covering congregational prayers, zakat, and pilgrimage rituals.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h3', title: 'Sahih Muslim (English Translation - Vol 1)', author: 'Imam Muslim', category: 'Hadith', description: 'Authentic traditions categorized by rigorous narrative chains detailing Islamic creed and ethics.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h4', title: 'Sahih Muslim (English Translation - Vol 2)', author: 'Imam Muslim', category: 'Hadith', description: 'Prophetic sayings regarding marital relations, trade ethics, and governance.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h5', title: 'Sunan Abu Dawud (Vol 1)', author: 'Imam Abu Dawud', category: 'Hadith', description: 'Major canonical Hadith compilation focusing specifically on legal rulings and Sunnah.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h6', title: 'Sunan Abu Dawud (Vol 2)', author: 'Imam Abu Dawud', category: 'Hadith', description: 'Legal Hadith covering judicial verdicts, transactions, and military conduct.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h7', title: 'Jami\' at-Tirmidhi (Vol 1)', author: 'Imam At-Tirmidhi', category: 'Hadith', description: 'Canonical Hadith collection renowned for evaluating narrative authenticity and juristic opinions.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h8', title: 'Jami\' at-Tirmidhi (Vol 2)', author: 'Imam At-Tirmidhi', category: 'Hadith', description: 'Prophetic traditions on ethics, personal character, virtues, and eschatology.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h9', title: 'Sunan an-Nasa\'i', author: 'Imam An-Nasa\'i', category: 'Hadith', description: 'Distinguished Hadith collection noted for its strict conditions of narrative authentication.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h10', title: 'Sunan Ibn Majah', author: 'Imam Ibn Majah', category: 'Hadith', description: 'One of the six major canonical collections covering daily life, etiquette, and jurisprudence.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h11', title: 'Riyad as-Salihin (Gardens of the Righteous)', author: 'Imam an-Nawawi', category: 'Hadith', description: 'A classic handbook on spiritual development, moral discipline, and noble conduct.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h12', title: 'An-Nawawi\'s Forty Hadith (With Commentary)', author: 'Imam an-Nawawi', category: 'Hadith', description: 'The fundamental collection summarizing the core principles and values of Islam.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h13', title: 'Mishkat al-Masabih (Vol 1)', author: 'Khatib al-Tabrizi', category: 'Hadith', description: 'Comprehensive Hadith anthology organizing traditions across devotional and civil themes.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h14', title: 'Mishkat al-Masabih (Vol 2)', author: 'Khatib al-Tabrizi', category: 'Hadith', description: 'Detailed prophetic sayings on governance, trials, trials of faith, and character.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h15', title: 'Shama\'il Muhammadiyah', author: 'Imam At-Tirmidhi', category: 'Hadith', description: 'Devotional compilation detailing the physical traits, character, and lifestyle of the Prophet (PBUH).', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h16', title: 'Musnad Ahmad ibn Hanbal (Selected Traditions)', author: 'Imam Ahmad ibn Hanbal', category: 'Hadith', description: 'Vast historical encyclopedic collection of Hadith compiled by Imam Ahmad.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h17', title: 'Al-Adab Al-Mufrad (Book of Manners)', author: 'Imam Al-Bukhari', category: 'Hadith', description: 'Dedicated Hadith collection focusing entirely on interpersonal conduct and family relations.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h18', title: 'Fath al-Bari (Commentary on Sahih Bukhari - Vol 1)', author: 'Hafiz Ibn Hajar al-Asqalani', category: 'Hadith', description: 'The pinnacle commentary explaining the linguistic and juristic subtleties of Sahih Bukhari.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h19', title: 'Al-Lu\'lu\' wal-Marjan (Agreed-Upon Hadiths)', author: 'Muhammad Fuad Abdul Baqi', category: 'Hadith', description: 'Collection of traditions reported jointly in both Sahih Bukhari and Sahih Muslim.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'h20', title: 'Hadith Methodology and Literature', author: 'Dr. Muhammad Mustafa Al-Azami', category: 'Hadith', description: 'Academic critique verifying early Hadith documentation and narrative preservation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },

  // ==========================================
  // 3. SEERAH (Prophetic Biography) - 20 Books
  // ==========================================
  { id: 's1', title: 'Al-Raheeq Al-Makhtum (The Sealed Nectar)', author: 'Safi-ur-Rahman al-Mubarakpuri', category: 'Seerah', description: 'Award-winning biography documenting the full chronological life of Prophet Muhammad (PBUH).', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's2', title: 'The Life of Muhammad (Ibn Hisham\'s Abridgement)', author: 'Ibn Ishaq / Ibn Hisham', category: 'Seerah', description: 'The earliest surviving classical biography detailing early Islamic history and treaties.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's3', title: 'Fiqh us-Seerah', author: 'Dr. Muhammad Said Ramadan al-Bouti', category: 'Seerah', description: 'Analytical work extracting timeless spiritual, educational, and governance lessons from Seerah.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's4', title: 'Muhammad: His Life Based on the Earliest Sources', author: 'Martin Lings (Abu Bakr Siraj ad-Din)', category: 'Seerah', description: 'Acclaimed narrative biography lauded for its literary beauty and historical rigor.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's5', title: 'Zad al-Ma\'ad (Provisions for the Hereafter - Vol 1)', author: 'Ibn Qayyim al-Jawziyya', category: 'Seerah', description: 'Masterwork examining the personal guidance, worship, and daily life of Prophet Muhammad (PBUH).', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's6', title: 'Zad al-Ma\'ad (Provisions for the Hereafter - Vol 2)', author: 'Ibn Qayyim al-Jawziyya', category: 'Seerah', description: 'Detailed account of prophetic medicine, social interactions, and leadership principles.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's7', title: 'The First Islamic State: Madinan Era Governance', author: 'Dr. Akram Diya al-Umari', category: 'Seerah', description: 'Rigorous academic study of the constitution, society, and institutions established in Madinah.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's8', title: 'Noble Life of the Prophet (Vol 1)', author: 'Dr. Ali Muhammad al-Sallabi', category: 'Seerah', description: 'In-depth historical exploration of the Meccan period, persecution, and early da\'wah.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's9', title: 'Noble Life of the Prophet (Vol 2)', author: 'Dr. Ali Muhammad al-Sallabi', category: 'Seerah', description: 'Thorough documentation of the Migration (Hijrah), Madinan state formation, and diplomacy.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's10', title: 'In the Footsteps of the Prophet', author: 'Tariq Ramadan', category: 'Seerah', description: 'Contemporary reflections on applying moral lessons from the Seerah in modern global society.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's11', title: 'When the Moon Split', author: 'Safi-ur-Rahman al-Mubarakpuri', category: 'Seerah', description: 'Accessible biography written specifically for students and general readers seeking clarity.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's12', title: 'The Jurisprudence of the Prophetic Biography', author: 'Dr. M. S. El-Awa', category: 'Seerah', description: 'Legal and constitutional breakdown of treaties and international relations in early Islam.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's13', title: 'Biography of Abu Bakr as-Siddiq', author: 'Dr. Ali Muhammad al-Sallabi', category: 'Seerah', description: 'Detailed account of the life, virtues, and caliphate of the first Rightly-Guided Caliph.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's14', title: 'Biography of Umar ibn al-Khattab', author: 'Dr. Ali Muhammad al-Sallabi', category: 'Seerah', description: 'Comprehensive examination of the second caliph\'s governance, justice, and legal reforms.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's15', title: 'Biography of Uthman ibn Affan', author: 'Dr. Ali Muhammad al-Sallabi', category: 'Seerah', description: 'Historical study of the third caliph, Quranic compilation, and economic contributions.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's16', title: 'Biography of Ali ibn Abi Talib', author: 'Dr. Ali Muhammad al-Sallabi', category: 'Seerah', description: 'Detailed account of the fourth caliph, his scholarship, bravery, and leadership.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's17', title: 'The Mothers of the Believers', author: 'Dr. Hassan Al-Hajj', category: 'Seerah', description: 'Biographies detailing the lives, scholarship, and role of the Prophet\'s wives.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's18', title: 'Ash-Shifa (Remedies of the Honored Prophet)', author: 'Qadi Iyad', category: 'Seerah', description: 'Classic masterwork detailing the rights, attributes, and honors due to Prophet Muhammad (PBUH).', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's19', title: 'The Battles of the Prophet', author: 'Ibn Kathir', category: 'Seerah', description: 'Historical chronicle analyzing military strategy, ethics of conflict, and peace treaties.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 's20', title: 'Muhammad at Madina', author: 'W. Montgomery Watt', category: 'Seerah', description: 'A classic academic study analyzing the political and economic conditions of early Islam.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },

  // ==========================================
  // 4. TAFSEER (Quranic Exegesis) - 20 Books
  // ==========================================
  { id: 't1', title: 'Tafsir Ibn Kathir (English Translation - Vol 1)', author: 'Hafiz Ibn Kathir', category: 'Tafseer', description: 'Renowned exegesis interpreting Surah Al-Fatihah and Surah Al-Baqarah using Hadith cross-references.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't2', title: 'Tafsir Ibn Kathir (English Translation - Vol 2)', author: 'Hafiz Ibn Kathir', category: 'Tafseer', description: 'Comprehensive commentary covering Surah Ali \'Imran to Surah An-Nisa\'.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't3', title: 'Tafsir Ibn Kathir (Juz \'Amma Exegesis)', author: 'Hafiz Ibn Kathir', category: 'Tafseer', description: 'Focused exegesis of the 30th part of the Quran, covering short chapters and eschatology.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't4', title: 'Tafsir al-Jalalayn', author: 'Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti', category: 'Tafseer', description: 'Concise classical exegesis providing direct linguistic and grammatical insights into Revelation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't5', title: 'Tafsir As-Sa\'di (Vol 1 - Juz 1 to 10)', author: 'Sheikh Abdur-Rahman As-Sa\'di', category: 'Tafseer', description: 'Modern, clear exegesis noted for its spiritual clarity and practical application.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't6', title: 'Tafsir As-Sa\'di (Vol 2 - Juz 11 to 20)', author: 'Sheikh Abdur-Rahman As-Sa\'di', category: 'Tafseer', description: 'Exegesis highlighting Quranic wisdom, moral directives, and divine attributes.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't7', title: 'Tafsir As-Sa\'di (Vol 3 - Juz 21 to 30)', author: 'Sheikh Abdur-Rahman As-Sa\'di', category: 'Tafseer', description: 'Clear commentary explaining divine parables, moral lessons, and afterlife reality.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't8', title: 'Tafsir al-Qurtubi (Vol 1)', author: 'Imam Al-Qurtubi', category: 'Tafseer', description: 'Celebrated exegesis emphasizing juristic legal rulings derived directly from Quranic verses.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't9', title: 'Tafsir al-Qurtubi (Vol 2)', author: 'Imam Al-Qurtubi', category: 'Tafseer', description: 'Exegesis exploring legal precedents, linguistic analysis, and classical jurisprudence.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't10', title: 'Ma\'ariful Qur\'an (Vol 1)', author: 'Mufti Muhammad Shafi', category: 'Tafseer', description: 'Comprehensive modern commentary combining classical scholarship with answers to modern queries.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't11', title: 'Ma\'ariful Qur\'an (Vol 2)', author: 'Mufti Muhammad Shafi', category: 'Tafseer', description: 'Detailed commentary focusing on social ethics, economic obligations, and family harmony.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't12', title: 'In the Shade of the Quran (Fi Zilal al-Qur\'an - Vol 1)', author: 'Sayyid Qutb', category: 'Tafseer', description: 'Spiritual and socio-political reflections on Quranic verses and modern human condition.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't13', title: 'Tafsir At-Tabari (Selected Excerpts)', author: 'Imam Ibn Jarir At-Tabari', category: 'Tafseer', description: 'The foundational mother text of narrative exegesis compiling early companion reports.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't14', title: 'Al-Kashshaf (Linguistic Exegesis)', author: 'Al-Zamakhshari', category: 'Tafseer', description: 'Renowned for its unparalleled rhetoric, Arabic grammar, and eloquence in Quranic analysis.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't15', title: 'Tafsir al-Baghawi', author: 'Imam al-Baghawi', category: 'Tafseer', description: 'Authentic narrative exegesis focusing strictly on verified Hadith and companion reports.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't16', title: 'An Introduction to the Sciences of the Quran', author: 'Yasir Qadhi', category: 'Tafseer', description: 'Academic breakdown of revelation, abrogated verses, variant recitations, and compilation history.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't17', title: 'Al-Burhan fi \'Ulum al-Qur\'an', author: 'Badr al-Din al-Zarkashi', category: 'Tafseer', description: 'Classic encyclopedia covering forty-seven specialized sciences of Quranic interpretation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't18', title: 'Al-Itqan fi \'Ulum al-Qur\'an', author: 'Jalal al-Din al-Suyuti', category: 'Tafseer', description: 'Masterwork detailing the linguistic, contextual, and historical rules of Quranic exegesis.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't19', title: 'The Clear Quran (With Thematic Commentary)', author: 'Dr. Mustafa Khattab', category: 'Tafseer', description: 'Contemporary thematic translation and commentary designed for clarity and modern engagement.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 't20', title: 'Tafsir Surah Yasin, Al-Mulk & Al-Kahf', author: 'Dr. Muhammad Suleman', category: 'Tafseer', description: 'In-depth spiritual and thematic commentary on three essential chapters of the Quran.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },

  // ==========================================
  // 5. AQEEDAH (Islamic Creed) - 20 Books
  // ==========================================
  { id: 'a1', title: 'Al-Aqeedah Al-Tahawiyyah', author: 'Imam Abu Ja\'far al-Tahawi', category: 'Aqeedah', description: 'Foundational manual defining core orthodox Muslim belief agreed upon by classical scholarship.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a2', title: 'Commentary on Al-Aqeedah Al-Tahawiyyah', author: 'Ibn Abi al-Izz al-Hanafi', category: 'Aqeedah', description: 'Detailed scholarly commentary analyzing theological principles and divine attributes.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a3', title: 'Kitab al-Tawheed (The Book of Monotheism)', author: 'Sheikh Muhammad ibn Abd al-Wahhab', category: 'Aqeedah', description: 'Foundational treatise establishing pure monotheism and warning against polytheistic practices.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a4', title: 'Al-Aqeedah Al-Wasitiyyah', author: 'Ibn Taymiyyah', category: 'Aqeedah', description: 'Concise creed detailing divine attributes, names, and belief in the unseen.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a5', title: 'Sharh Al-Aqeedah Al-Wasitiyyah', author: 'Sheikh Muhammad ibn Salih al-Uthaymeen', category: 'Aqeedah', description: 'In-depth commentary explaining Ibn Taymiyyah\'s text for modern students.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a6', title: 'Kitab al-Iman (Book of Faith)', author: 'Ibn Taymiyyah', category: 'Aqeedah', description: 'Major treatise defining the components of faith, action, and theological nuances.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a7', title: 'The Three Fundamental Principles (Usul al-Thalatha)', author: 'Sheikh Muhammad ibn Abd al-Wahhab', category: 'Aqeedah', description: 'Primer answering the three grave questions: Who is your Lord? What is your religion? Who is your Prophet?', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a8', title: 'Al-Ibana \'an Usul al-Diyana', author: 'Imam Abu al-Hasan al-Ash\'ari', category: 'Aqeedah', description: 'Classical theological treatise defending orthodox creed against rationalist innovations.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a9', title: 'Al-Fiqh Al-Akbar', author: 'Imam Abu Hanifa', category: 'Aqeedah', description: 'The earliest extant text outlining fundamental Islamic theology attributed to Imam Abu Hanifa.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a10', title: 'Lum\'at al-I\'tiqad (Illumination of Belief)', author: 'Ibn Qudamah al-Maqdisi', category: 'Aqeedah', description: 'Concise text outlining belief in divine names, attributes, predestination, and the Day of Judgment.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a11', title: 'Sharh Usul I\'tiqad Ahl al-Sunnah', author: 'Imam al-Lalakai', category: 'Aqeedah', description: 'Monumental compilation recording the consensus of early pious predecessors on creed.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a12', title: 'Al-Qawa\'id Al-Muthla (Exemplary Principles of Divine Names)', author: 'Sheikh Ibn al-Uthaymeen', category: 'Aqeedah', description: 'Analytical guide outlining methodology in understanding Allah\'s names and attributes.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a13', title: 'Belief in the Angels & The Unseen World', author: 'Dr. Umar Al-Ashqar', category: 'Aqeedah', description: 'Systematic study detailing the reality, duties, and nature of angels according to scripture.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a14', title: 'The Minor & Major Signs of the Day of Judgment', author: 'Dr. Umar Al-Ashqar', category: 'Aqeedah', description: 'Comprehensive study of prophetic prophecies regarding end-time events and resurrection.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a15', title: 'Paradise & Hell in Islamic Theology', author: 'Dr. Umar Al-Ashqar', category: 'Aqeedah', description: 'Detailed scriptural study describing eternal reward, retribution, and divine justice.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a16', title: 'Divine Will and Predestination (Al-Qadar)', author: 'Dr. Umar Al-Ashqar', category: 'Aqeedah', description: 'Clear examination reconciling human free will, divine knowledge, and decree.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a17', title: 'Al-Aqeedah Al-Hamawiyyah', author: 'Ibn Taymiyyah', category: 'Aqeedah', description: 'Scholarly treatise examining the statements of early companions on divine attributes.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a18', title: 'Nawaqid al-Islam (The Nullifiers of Islam)', author: 'Sheikh Muhammad ibn Abd al-Wahhab', category: 'Aqeedah', description: 'Brief guide warning against spiritual and theological violations that compromise faith.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a19', title: 'The Creed of the Four Imams', author: 'Dr. Muhammad al-Khumayyis', category: 'Aqeedah', description: 'Comparative study proving theological consensus among Abu Hanifa, Malik, Shafi\'i, and Ahmad.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },
  { id: 'a20', title: 'Al-Iqtisad fi al-I\'tiqad', author: 'Imam Al-Ghazali', category: 'Aqeedah', description: 'Philosophical and theological exposition balancing rational argumentation with Quranic revelation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2000 },

  // ==========================================
  // 6. CHILDREN'S COLLECTION - 20 Books
  // ==========================================
  { id: 'c1', title: 'Illustrated Stories of the Prophets (Part 1)', author: 'Abul Hasan Ali Nadwi', category: 'Children\'s Collection', description: 'Engagingly illustrated narratives teaching early prophet stories from Adam to Ibrahim.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c2', title: 'Illustrated Stories of the Prophets (Part 2)', author: 'Abul Hasan Ali Nadwi', category: 'Children\'s Collection', description: 'Inspiring stories of Musa, Isa, and other prophets written in simple, clear language.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c3', title: 'Goodnight Stories from the Life of the Prophet', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Heartwarming bedtime stories introducing character values from early Islamic history.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c4', title: 'Tell Me About Hajj & Umrah', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Colorful illustrated guide introducing children to pilgrimage rites and Kaaba history.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c5', title: 'Tell Me About the Quran', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Interactive book explaining how the Quran was revealed, compiled, and preserved.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c6', title: 'My First Quran With Pictures (Juz \'Amma)', author: 'Shereen Sharief', category: 'Children\'s Collection', description: 'Visual explanation of short Quranic chapters tailored for young learners.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c7', title: '365 Quran Stories for Kids', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Daily inspiring stories drawn directly from Quranic parables and moral lessons.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c8', title: '365 Hadith with Stories for Kids', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Daily short stories explaining prophetic manners, kindness, and honesty.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c9', title: 'The Story of the Crying Camel', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Charming story teaching compassion toward animals derived from authentic Hadith.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c10', title: 'The Ants\' Panic & Other Stories', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Morality tales emphasizing care for nature, environmental stewardship, and humility.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c11', title: 'My First Book About Ramadan', author: 'Sara Khan', category: 'Children\'s Collection', description: 'Delightful introduction to fasting, sharing, charity, and Eid celebrations.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c12', title: 'My First Book About Allah', author: 'Sara Khan', category: 'Children\'s Collection', description: 'Gentle introduction teaching children about creator, love, and divine blessings.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c13', title: 'A Day in the Life of a Young Muslim', author: 'Ayesha Fatima', category: 'Children\'s Collection', description: 'Fun guide introducing daily supplications, morning prayers, and good manners.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c14', title: 'Golden Deeds of the Companions', author: 'Abdul Malik Mujahid', category: 'Children\'s Collection', description: 'Inspiring biographical sketches highlighting bravery and generosity of early Muslims.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c15', title: 'The Cave of Hira & The First Revelation', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Dramatic story of the beginning of Quranic revelation tailored for children.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c16', title: 'The Great Ark of Prophet Nuh', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Vibrant illustrated story detailing obedience, faith, and salvation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c17', title: 'Prophet Yunus & The Whale', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Timeless lesson on patience, repentance, and divine forgiveness.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c18', title: 'Prophet Yusuf & His Brothers', author: 'Saniyasnain Khan', category: 'Children\'s Collection', description: 'Heartwarming story teaching forgiveness, honesty, and trust in divine plans.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c19', title: 'Islamic Manners for Young Readers', author: 'Dr. Muhammad Ali Al-Hashimi', category: 'Children\'s Collection', description: 'Simple guide covering etiquette toward parents, teachers, friends, and neighbors.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'c20', title: 'Learn Wudu & Salah Step by Step', author: 'Mariam H. Zaidi', category: 'Children\'s Collection', description: 'Fully illustrated educational guide showing purification and prayer postures.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },

  // ==========================================
  // 7. ACADEMIC RESEARCH - 20 Books
  // ==========================================
  { id: 'r1', title: 'Optimizing Cloud Query Processing & Indexing', author: 'Dr. A. R. Adeleke', category: 'Academic Research', description: 'Peer-reviewed research on sub-second query execution and indexing strategies in NoSQL databases.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r2', title: 'Socio-Economic Feasibility of Non-Interest Banking', author: 'Prof. H. M. Sanni', category: 'Academic Research', description: 'Empirical economic analysis exploring ethical financial regulation and risk mitigation in Africa.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r3', title: 'Machine Learning Models in Early Medical Diagnosis', author: 'Dr. Elizabeth Vance', category: 'Academic Research', description: 'Clinical study evaluating convolutional neural networks in analyzing radiologic imaging.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r4', title: 'Renewable Energy Integration in Sub-Saharan Grids', author: 'Engr. O. M. Babatunde', category: 'Academic Research', description: 'Technical analysis on microgrid stability and solar photovoltaic integration.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r5', title: 'Blockchain & Smart Contracts in Supply Chain Systems', author: 'Dr. K. N. Ibrahim', category: 'Academic Research', description: 'Research paper detailing decentralized ledger applications for automated inventory verification.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r6', title: 'Quantum Cryptography & Post-Quantum Network Security', author: 'Prof. Marcus Vance', category: 'Academic Research', description: 'Theoretical breakdown of lattice-based encryption paradigms for resilient communications.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r7', title: 'Urbanization Trends & Infrastructure Challenges', author: 'Dr. Amina Bello', category: 'Academic Research', description: 'Demographic research examining sustainable civil engineering in rapid urban centers.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r8', title: 'CRISPR Gene Editing in Crop Resistance', author: 'Dr. S. A. Abubakar', category: 'Academic Research', description: 'Biotech paper analyzing genomic modifications enhancing drought resilience in cereal crops.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r9', title: 'Macroeconomic Impact of Digital Currency Initiatives', author: 'Prof. David Lawson', category: 'Academic Research', description: 'Econometric analysis of central bank digital currencies (CBDC) on inflation and monetary policy.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r10', title: 'Natural Language Processing for African Languages', author: 'Dr. T. O. Ogundipe', category: 'Academic Research', description: 'Computational linguistics study developing low-resource speech recognition models.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r21', title: 'Deep Learning & Neural Network Architectures', author: 'Dr. Geoffrey Hinton & Dr. Yoshua Bengio', category: 'Academic Research', description: 'Comprehensive survey on backpropagation algorithms, convolutional networks, and deep learning paradigms.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r22', title: 'ETL Data Pipeline Optimization in Big Data Systems', author: 'Dr. Abdullah Abduljaleel', category: 'Academic Research', description: 'Empirical analysis of automated data extraction, transformation workflows, and schema validation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r23', title: 'Sustainable Agricultural Technology in Sub-Saharan Africa', author: 'Prof. O. A. Adeleke', category: 'Academic Research', description: 'Field research on precision farming, soil moisture sensors, and climate-resilient crop management.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r24', title: 'SQL Query Performance & Execution Plan Analysis', author: 'Dr. M. K. Sanni', category: 'Academic Research', description: 'Technical study on database indexing, EXPLAIN query plan execution, and partition tuning.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r25', title: 'Natural Language Processing for African Vernaculars', author: 'Dr. T. O. Ogundipe', category: 'Academic Research', description: 'Computational linguistics research on transformer model fine-tuning for low-resource languages.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r26', title: 'E-Commerce Churn Analytics & Cart Abandonment Modeling', author: 'Dr. R. O. Ibrahim', category: 'Academic Research', description: 'Machine learning framework analyzing user behavior, cart abandonment factors, and retention strategies.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r27', title: 'Photovoltaic Solar Energy Integration in Isolated Grids', author: 'Engr. A. B. Umar', category: 'Academic Research', description: 'Engineering feasibility study evaluating battery energy storage systems (BESS) in microgrids.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r28', title: 'Cybersecurity Threat Intelligence in Financial Fintech', author: 'Dr. Samuel K. Arthur', category: 'Academic Research', description: 'Analysis of zero-trust framework implementation and payment gateway fraud mitigation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r29', title: 'CRISPR-Cas9 Applications in Biomedical Engineering', author: 'Prof. Elizabeth Vance', category: 'Academic Research', description: 'Clinical exploration of gene therapeutic delivery mechanisms and molecular genetics ethics.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r30', title: 'Macroeconomic Impact of Non-Interest Microfinance Institutions', author: 'Prof. H. M. Sanni', category: 'Academic Research', description: 'Socio-economic analysis evaluating financial inclusion metrics across rural agricultural hubs.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r31', title: 'Reinforcement Learning in Autonomous Robotics', author: 'Dr. Marcus Vance', category: 'Academic Research', description: 'Control systems research exploring Q-learning algorithms for robot manipulation tasks.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r32', title: 'Urban Waste Management & Biomass Gasification', author: 'Engr. Hassan K. Umar', category: 'Academic Research', description: 'Environmental engineering paper detailing thermal conversion of municipal solid waste into syngas.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r33', title: 'Supply Chain Bottlenecks in Post-Pandemic Retail', author: 'Dr. Clara E. Jenkins', category: 'Academic Research', description: 'Logistics research detailing inventory optimization, supplier risk, and demand forecasting.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r34', title: 'Post-Quantum Lattice-Based Cryptographic Systems', author: 'Prof. David Lawson', category: 'Academic Research', description: 'Theoretical analysis on mathematical security proofs against quantum computing attacks.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r35', title: 'Pedagogical Digital Tools in Blended Technical Education', author: 'Dr. Grace M. Alabi', category: 'Academic Research', description: 'Educational case study examining interactive e-learning performance in technical qualifications.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r11', title: 'Cybersecurity Threat Intelligence in Financial Systems', author: 'Dr. Samuel K. Arthur', category: 'Academic Research', description: 'Empirical survey on zero-trust architectures and intrusion detection system performance.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r12', title: 'Hydrological Modeling for Flood Prediction', author: 'Prof. R. C. Nwosu', category: 'Academic Research', description: 'Environmental engineering research using GIS mapping for river basin management.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r13', title: 'Pedagogical Frameworks in E-Learning Higher Education', author: 'Dr. Grace M. Alabi', category: 'Academic Research', description: 'Educational study analyzing student retention and interactive digital assessment tools.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r14', title: 'Nanotechnology Applications in Targeted Drug Delivery', author: 'Dr. Y. A. Mansoor', category: 'Academic Research', description: 'Pharmacological investigation on lipid nanoparticle vehicles in oncology therapeutics.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r15', title: 'Ethical Governance in Autonomous AI Systems', author: 'Prof. Helena Wright', category: 'Academic Research', description: 'Interdisciplinary study on legal responsibility and algorithmic bias mitigation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r16', title: 'Waste-to-Energy Conversion Technologies', author: 'Engr. Hassan K. Umar', category: 'Academic Research', description: 'Chemical engineering study evaluating anaerobic digestion efficiency for biofuel generation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r17', title: 'Comparative Legal Systems & Contractual Dispute Resolution', author: 'Dr. Fatima B. Zubair', category: 'Academic Research', description: 'Comparative international law analysis on arbitration across common and civil law jurisdictions.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r18', title: 'Soil Fertility & Organic Agricultural Systems', author: 'Prof. M. A. Usman', category: 'Academic Research', description: 'Agronomic paper exploring bio-fertilizer formulations for sustainable yield enhancement.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r19', title: 'Psychological Assessment of Remote Workforce Well-being', author: 'Dr. Clara E. Jenkins', category: 'Academic Research', description: 'Organizational psychology study evaluating burnout factors and remote work policies.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },
  { id: 'r20', title: 'Next-Generation Wireless Networks (6G Paradigms)', author: 'Dr. A. O. Balogun', category: 'Academic Research', description: 'Telecommunications paper analyzing terahertz frequency band allocation and beamforming.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 2500 },

  // ==========================================
  // 8. NOVELS & LITERATURE - 20 Books
  // ==========================================
  { id: 'n1', title: 'Things Fall Apart', author: 'Chinua Achebe', category: 'Novels & Literature', description: 'Celebrated African masterpiece depicting cultural heritage, colonialism, and societal change.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n2', title: 'No Longer at Ease', author: 'Chinua Achebe', category: 'Novels & Literature', description: 'Classic novel depicting the struggles of an educated youth navigating modern urban society.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n3', title: 'Arrow of God', author: 'Chinua Achebe', category: 'Novels & Literature', description: 'Powerful story exploring religious leadership, tradition, and conflict in colonial Nigeria.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n4', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Novels & Literature', description: 'Philosophical novel chronicling a young shepherd\'s journey toward discovering personal destiny.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n5', title: 'The Lion and the Jewel', author: 'Wole Soyinka', category: 'Novels & Literature', description: 'Famous play examining conflict between traditional African values and modern Western influences.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n6', title: 'Death and the King\'s Horseman', author: 'Wole Soyinka', category: 'Novels & Literature', description: 'Dramatic masterpiece exploring duty, honor, and sacred tradition in Yoruba culture.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n7', title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', category: 'Novels & Literature', description: 'Profound historical novel depicting human resilience, loyalty, and struggle during wartime.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n8', title: 'Purple Hibiscus', author: 'Chimamanda Ngozi Adichie', category: 'Novels & Literature', description: 'Moving coming-of-age story about freedom, family dynamics, and personal awakening.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n9', title: 'The Joys of Motherhood', author: 'Buchi Emecheta', category: 'Novels & Literature', description: 'Classic narrative portraying womanhood, sacrifice, and changing family traditions.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n10', title: 'Efuru', author: 'Flora Nwapa', category: 'Novels & Literature', description: 'Pioneering African literary work telling the inspiring story of an independent Igbo woman.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n11', title: 'Hayy ibn Yaqzan (The Self-Taught Philosopher)', author: 'Ibn Tufayl', category: 'Novels & Literature', description: 'Masterpiece allegorical Islamic novel depicting an isolated child deriving philosophical truth through reason.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n12', title: 'The Lantern of the Path', author: 'Imam Ja\'far al-Sadiq', category: 'Novels & Literature', description: 'Classic spiritual reflections on inner character, sincere devotion, and moral self-examination.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n13', title: 'The Butterfly Mosque', author: 'G. Willow Wilson', category: 'Novels & Literature', description: 'Reflective memoir detailing spiritual transformation, cross-cultural discovery, and life in Cairo.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n14', title: 'My Name is Red', author: 'Orhan Pamuk', category: 'Novels & Literature', description: 'Nobel Prize-winning historical novel set in 16th-century Istanbul blending art, mystery, and philosophy.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n15', title: 'Sultana\'s Dream & Selected Writings', author: 'Begum Rokeya Sakhawat Hossain', category: 'Novels & Literature', description: 'Pioneering 1905 feminist utopian novella written by a prominent Muslim scholar and social reformer.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n16', title: 'The Conference of the Birds (Mantiq ut-Tayr)', author: 'Farid ud-Din Attar', category: 'Novels & Literature', description: 'Timeless Persian allegorical poem depicting birds embarking on a journey seeking the ultimate truth.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n17', title: 'Minaret', author: 'Leila Aboulela', category: 'Novels & Literature', description: 'A moving novel exploring exile, spiritual redemption, and faith in contemporary London.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n18', title: 'Meditations', author: 'Marcus Aurelius', category: 'Novels & Literature', description: 'Timeless Stoic reflections on self-discipline, emotional resilience, and personal ethics.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n19', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'Novels & Literature', description: 'Sweeping narrative exploring how biology and history shaped human societies.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n20', title: 'The Concubine', author: 'Elechi Amadi', category: 'Novels & Literature', description: 'Captivating tale of love, fate, and village traditions in pre-colonial West Africa.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n21', title: 'Weep Not, Child', author: 'Ngũgĩ wa Thiong\'o', category: 'Novels & Literature', description: 'Moving historical novel detailing childhood, education, and anti-colonial struggle in Kenya.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n22', title: 'The River Between', author: 'Ngũgĩ wa Thiong\'o', category: 'Novels & Literature', description: 'Poignant story of two neighboring ridges divided by religion and cultural traditions.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n23', title: 'So Long a Letter', author: 'Mariama Bâ', category: 'Novels & Literature', description: 'Epistolary masterpiece reflecting on marriage, friendship, and female empowerment in Senegal.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n24', title: 'Nervous Conditions', author: 'Tsitsi Dangarembga', category: 'Novels & Literature', description: 'Acclaimed Zimbabwean novel examining education, gender, and post-colonial identity.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n25', title: 'The Beautyful Ones Are Not Yet Born', author: 'Ayi Kwei Armah', category: 'Novels & Literature', description: 'Profound Ghanaian novel analyzing moral integrity in a corrupt world.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n26', title: 'Mine Boy', author: 'Peter Abrahams', category: 'Novels & Literature', description: 'Pioneering South African novel depicting urban working-class struggles and human dignity.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n27', title: 'Minaret', author: 'Leila Aboulela', category: 'Novels & Literature', description: 'A moving novel exploring exile, spiritual redemption, and faith in contemporary London.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n28', title: 'The Translator', author: 'Leila Aboulela', category: 'Novels & Literature', description: 'Acclaimed story detailing intercultural love, faith, and personal identity between Sudan and Scotland.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n29', title: 'Bird Summons', author: 'Leila Aboulela', category: 'Novels & Literature', description: 'Story of three Muslim women embarking on a pilgrimage across the Scottish Highlands discovering faith.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n30', title: 'The Dust of the Road', author: 'Ustad Ahmad al-Saffar', category: 'Novels & Literature', description: 'Historical fiction following a young scholar traveling across historical trade routes in West Africa.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n31', title: 'The Pearl That Broke Its Shell', author: 'Nadia Hashimi', category: 'Novels & Literature', description: 'Gripping tale spanning generations highlighting courage, family honor, and hope.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n32', title: 'Palace Walk (The Cairo Trilogy - Book 1)', author: 'Naguib Mahfouz', category: 'Novels & Literature', description: 'Nobel laureate masterwork chronicling Egyptian family dynamics and social transformation.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n33', title: 'Palace of Desire (The Cairo Trilogy - Book 2)', author: 'Naguib Mahfouz', category: 'Novels & Literature', description: 'Continuation of the Cairo saga depicting youth, faith, and political awakening in early 20th century.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n34', title: 'Sugar Street (The Cairo Trilogy - Book 3)', author: 'Naguib Mahfouz', category: 'Novels & Literature', description: 'Concluding volume exploring generational shifts, modern philosophy, and societal evolution.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 },
  { id: 'n35', title: 'Tales from the Thousand and One Nights', author: 'Traditional / Ed. Robert Irwin', category: 'Novels & Literature', description: 'Classical Arabic literary anthology celebrating storytelling heritage, wisdom, and folklore.', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', price: 1500 }
];

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
          console.error("Error fetching user role:", err);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const firestoreBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          category: doc.data().category || 'General Books',
          price: doc.data().price || 1500,
          ...doc.data()
        }));
        setBooks([...baseCatalogue, ...firestoreBooks]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching library database:", error);
        setBooks(baseCatalogue);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Cart Management Functions
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
    return cart.reduce((total, item) => total + (item.price || 2000) * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Initiate Paystack checkout for cart items
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      let handler = window.PaystackPop.setup({
        key: 'pk_test_5f0172fdaa8509d71791fe726c64007af3518bc6',
        email: user.email,
        amount: calculateTotal() * 100,
        currency: 'NGN',
        ref: '' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function(response) {
          alert('Payment Successful! Reference: ' + response.reference);
          cart.forEach(item => {
            window.open(item.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
          });
          setCart([]);
          setIsCartOpen(false);
        },
        onClose: function() {
          alert('Transaction canceled.');
        }
      });
      handler.openIframe();
    };
    document.body.appendChild(script);
  };

  if (checkingAuth) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#1e3a8a', fontWeight: 'bold' }}>Loading Library Catalogue...</div>;
  }

  // Block logged-in authors from browsing reader catalogue
  if (userRole === 'author') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${lib2Bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '480px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '15px' }}>Reader Portal Restricted</h2>
          <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>Your account is registered as an <strong>Author</strong>. Please fill in correct login details to continue.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/upload')} style={{ padding: '10px 20px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Author Portal</button>
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  const categories = ['All', 'Fiqh', 'Hadith', 'Seerah', 'Tafseer', 'Aqeedah', 'Children\'s Collection', 'Academic Research', 'Novels & Literature'];

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${lib2Bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: '#1e293b', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' 
    }}>
      
      {/* Header */}
      <header style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0', padding: '15px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a' }}>
            Addeen <span style={{ color: '#d97706' }}>E-Library</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '0.9rem',
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
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {user ? (
              <>
                <span style={{ fontSize: '0.9rem', color: '#475569' }}>Reader: <strong>{user.email}</strong></span>
                <button onClick={handleLogout} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login" style={{ padding: '8px 16px', backgroundColor: '#1e3a8a', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Login</Link>
                <Link to="/" style={{ padding: '8px 16px', backgroundColor: '#d97700', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Home</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px 60px 20px' }}>
        
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <input 
            type="text" 
            placeholder="Search catalogue by title or author name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', marginBottom: '15px' }}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  backgroundColor: selectedCategory === cat ? '#1e3a8a' : '#f1f5f9',
                  color: selectedCategory === cat ? '#ffffff' : '#334155'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#ffffff' }}>Loading publications...</p>
        ) : filteredBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px' }}>
            <p style={{ color: '#64748b' }}>No publications found matching your selected filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredBooks.map((book) => (
              <BookCard key={book.id || book.title} book={book} onAddToCart={() => addToCart(book)} />
            ))}
          </div>
        )}

      </main>

      {/* SLIDE-OUT CART DRAWER */}
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
                        <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.88rem' }}>₦{(item.price || 2000).toLocaleString()}</span>
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

      {/* LOGIN MODAL PROMPT */}
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

    </div>
  );
}

function BookCard({ book, onAddToCart }) {
  return (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div>
        <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
          {book.category}
        </span>
        <h3 style={{ color: '#0f172a', fontSize: '1.15rem', margin: '10px 0 5px 0' }}>{book.title}</h3>
        <h5 style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'normal', marginBottom: '12px' }}>By {book.author}</h5>
        <p style={{ color: '#334155', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
          {book.description}
        </p>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.1rem' }}>₦{(book.price || 2000).toLocaleString()}</span>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Verified E-Book</span>
        </div>
        <button onClick={onAddToCart} style={{ width: '100%', padding: '10px', backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default Reader;