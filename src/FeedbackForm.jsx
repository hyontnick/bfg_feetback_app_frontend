import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// SVG personnalisé pour la notation
const CustomStar = ({ filled, onClick, index }) => (
  <motion.svg
    onClick={onClick}
    whileHover={{ scale: 1.2, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill={filled ? '#FBBF24' : '#9CA3AF'}
    className="cursor-pointer mx-1 transition-all"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.1 }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </motion.svg>
);

// Composant de spinner circulaire
const CircularLoader = () => (
  <motion.div
    className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
  />
);

// Configuration de i18next
i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: { title: 'Partagez votre expérience', placeholder: 'Votre commentaire...', submit: 'Envoyer', submitting: 'Envoi en cours...', selectLanguage: 'Choisir langue', offlineMessage: 'Hors ligne : données synchronisées plus tard', offlineSave: 'Enregistré localement, envoyé à connexion', comment: 'Commentaire', rating: 'Évaluation', star: 'Étoile', uniqueCode: 'Code unique', codePlaceholder: 'Entrez votre code unique (ou BLFLGE pour anonyme)', invalidCode: 'Code unique invalide, veuillez vérifier ou utiliser BLFLGE pour anonyme', analysisError: 'Erreur lors de l\'analyse du commentaire.' } },
    en: { translation: { title: 'Share your experience', placeholder: 'Your comment...', submit: 'Submit', submitting: 'Submitting...', selectLanguage: 'Select language', offlineMessage: 'Offline: data will sync later', offlineSave: 'Saved locally, will send on connection', comment: 'Comment', rating: 'Rating', star: 'Star', uniqueCode: 'Unique code', codePlaceholder: 'Enter your unique code (or BLFLGE for anonymous)', invalidCode: 'Invalid unique code, please check or use BLFLGE for anonymous', analysisError: 'Error analyzing the comment.' } },
    du: { translation: { title: 'Ponda na pendisa wé', placeholder: 'Pendisa di wé...', submit: 'Tuma', submitting: 'Tuma na kala...', selectLanguage: 'Lukisa lole', offlineMessage: 'Sans connexion : pendisa tondi na kwe', offlineSave: 'Kala na local, tondi na connexion', comment: 'Pendisa', rating: 'Évaluation', star: 'Étoile', uniqueCode: 'Code unique', codePlaceholder: 'Nusana code unique (wou BLFLGE po anonyme)', invalidCode: 'Code unique mbi, yon ti code wou nusana BLFLGE po anonyme', analysisError: 'Ngbu na pendisa comment.' } },
    ba: { translation: { title: 'Lɔŋgɔ na pendisa wé', placeholder: 'Pendisa di wé...', submit: 'Tuma', submitting: 'Tuma na kala...', selectLanguage: 'Lukisa lole', offlineMessage: 'Sans connexion : pendisa tondi na kwe', offlineSave: 'Kala na local, tondi na connexion', comment: 'Pendisa', rating: 'Évaluation', star: 'Étoile', uniqueCode: 'Code unique', codePlaceholder: 'Nusana code unique (wou BLFLGE po anonyme)', invalidCode: 'Code unique mbi, yon ti code wou nusana BLFLGE po anonyme', analysisError: 'Ngbu na pendisa comment.' } },
    ew: { translation: { title: 'Londo na pendisa wé', placeholder: 'Pendisa di wé...', submit: 'Tuma', submitting: 'Tuma na kala...', selectLanguage: 'Lukisa lole', offlineMessage: 'Sans connexion : pendisa tondi na kwe', offlineSave: 'Kala na local, tondi na connexion', comment: 'Pendisa', rating: 'Évaluation', star: 'Étoile', uniqueCode: 'Code unique', codePlaceholder: 'Nusana code unique (wou BLFLGE po anonyme)', invalidCode: 'Code unique mbi, yon ti code wou nusana BLFLGE po anonyme', analysisError: 'Ngbu na pendisa comment.' } },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

const FeedbackForm = () => {
  const [language, setLanguage] = useState('fr');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [uniqueCode, setUniqueCode] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMoreEmojis, setShowMoreEmojis] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [comment]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const analyzeComment = async (commentText) => {
    try {
      const response = await fetch('https://bfg-api-analyse-sentiment.onrender.com/predict_feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Analyse échouée');
      return data;
    } catch (error) {
      toast.error(i18n.t('analysisError'));
      return null;
    }
  };

  const handleSubmit = async () => {
    if (comment.length > 500) {
      toast.error('Commentaire trop long (max 500 caractères).');
      return;
    }

    setIsSubmitting(true);

    const isValidCode = await validateUniqueCode();
    if (!isValidCode) {
      setIsSubmitting(false);
      return;
    }

    const analysisResult = await analyzeComment(comment);
    if (!analysisResult) {
      setIsSubmitting(false);
      return;
    }

    const feedback = {
      language,
      comment: analysisResult.comment,
      rating,
      uniqueCode: uniqueCode || 'BLFLGE',
      sentiment: analysisResult.sentiment,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Feedback enregistré avec succès !');
        setComment('');
        setRating(0);
        setUniqueCode('');
      } else {
        toast.error(data.message || 'Erreur lors de l\'enregistrement.');
      }
    } catch (error) {
      toast.error('Erreur réseau : ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEmoji = (emoji) => {
    if (comment.length + emoji.length <= 500) {
      setComment((prev) => prev + emoji);
    } else {
      toast.error('Limite de caractères atteinte !');
    }
  };

  const validateUniqueCode = async () => {
    if (uniqueCode === '' || uniqueCode === 'BLFLGE') return true;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uniqueCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(i18n.t('invalidCode'), { autoClose: 3000 });
        return false;
      }
      return true;
    } catch (error) {
      toast.error('Erreur lors de la validation du code.');
      return false;
    }
  };

  const backgroundStyle = isDarkMode
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
    : 'bg-gradient-to-br from-blue-50 via-gray-50 to-white';

  const isSubmitDisabled = comment.length > 500 || (comment === '' && rating === 0) || isSubmitting;

  return (
    <div className={`min-h-screen relative overflow-hidden ${backgroundStyle} bg-grid`}>
      {/* Décorations latérales (limitée à la vue) */}
      <div className="hidden lg:block absolute inset-y-0 left-0 w-1/6 z-[-1]">
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-blue-300/20 dark:bg-blue-700/20"
          style={{ top: '10%', left: '10%' }}
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-green-300/20 dark:bg-green-700/20"
          style={{ bottom: '20%', left: '20%' }}
          animate={{ scale: [1, 1.2, 1], rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/6 z-[-1]">
        <motion.div
          className="absolute w-30 h-30 rounded-full bg-purple-300/20 dark:bg-purple-700/20"
          style={{ top: '15%', right: '15%' }}
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-50 h-50 rounded-full bg-yellow-300/20 dark:bg-yellow-700/20"
          style={{ bottom: '10%', right: '10%' }}
          animate={{ scale: [1, 1.2, 1], rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Logo centré en haut */}
      <div className="w-full flex justify-center mb-6">
        <img src="/logo.png" alt="Logo de l'application" className="h-24" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`max-w-lg w-full p-6 rounded-2xl shadow-2xl mx-auto z-10 ${
          isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
        } backdrop-blur-md border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <h2 className={`text-3xl font-bold mb-6 text-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>{i18n.t('title')}</h2>

        <AnimatePresence>
          {isOffline && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm mb-4 p-2 rounded-lg ${
                isDarkMode ? 'text-red-400 bg-red-900/50' : 'text-red-600 bg-red-100'
              }`}
            >
              {i18n.t('offlineMessage')}
            </motion.p>
          )}
        </AnimatePresence>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`w-full p-3 mb-6 rounded-lg ${
            isDarkMode
              ? 'bg-gray-700 text-white border-gray-600 focus:ring-green-500'
              : 'bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500'
          } focus:outline-none focus:ring-2 transition`}
          aria-label={i18n.t('selectLanguage')}
          disabled={isSubmitting}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="du">Douala</option>
          <option value="ba">Bassa</option>
          <option value="ew">Ewondo</option>
        </select>

        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={i18n.t('placeholder')}
            className={`w-full p-4 mb-2 rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-green-500'
                : 'bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 transition resize-none`}
            rows="3"
            aria-label={i18n.t('comment')}
            disabled={isSubmitting}
          />
          <div className="text-right text-sm">
            {comment.length}/500
            <motion.span
              className={`ml-2 ${
                comment.length > 400 ? 'text-red-500' : comment.length > 300 ? 'text-orange-500' : 'text-green-500'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {comment.length > 500 ? 'Limite atteinte' : ''}
            </motion.span>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={uniqueCode}
            onChange={(e) => setUniqueCode(e.target.value)}
            placeholder={i18n.t('codePlaceholder')}
            className={`w-full p-3 rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-green-500'
                : 'bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 transition`}
            aria-label={i18n.t('uniqueCode')}
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-4">
            {['😄', '😡', '😐', '❤️'].map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.3, boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addEmoji(emoji)}
                className={`p-3 rounded-full text-2xl ${
                  isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
                } hover:bg-opacity-80 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={`Ajouter l'émoji ${emoji === '😄' ? 'joie' : emoji === '😞' ? 'mécontentement' : emoji === '😐' ? 'neutre' : 'aimer'}`}
                disabled={isSubmitting}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMoreEmojis(!showMoreEmojis)}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
            } hover:bg-opacity-80 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Afficher plus d'émojis"
            disabled={isSubmitting}
          >
            <FaPlus />
          </motion.button>
        </div>

        <AnimatePresence>
          {showMoreEmojis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 grid grid-cols-5 gap-2"
            >
              {['😂', '😣', '🤔', '😍', '💖', '💕', '😮', '😲', '😢', '😔', '🙏', '😊'].map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    addEmoji(emoji);
                    setShowMoreEmojis(false);
                  }}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
                  } hover:bg-opacity-80 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Ajouter l'émoji ${emoji === '😂' || emoji === '😣' ? 'joie/mécontentement' : emoji === '🤔' ? 'neutre' : emoji === '😍' ? 'aimer' : emoji === '💖' || emoji === '💕' ? 'cœur' : emoji === '😮' || emoji === '😲' ? 'surprise' : emoji === '😢' || emoji === '😔' ? 'tristesse' : 'gratitude'}`}
                  disabled={isSubmitting}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center mb-6" role="group" aria-label={i18n.t('rating')}>
          {[1, 2, 3, 4, 5].map((star, index) => (
            <div key={star} className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}>
              <CustomStar
                filled={star <= rating}
                onClick={() => !isSubmitting && setRating(star)}
                index={index}
                aria-label={`${i18n.t('star')} ${star}`}
              />
            </div>
          ))}
        </div>

        <motion.button
          whileHover={!isSubmitDisabled ? { scale: 1.05, boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)' } : {}}
          whileTap={!isSubmitDisabled ? { scale: 0.95 } : {}}
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full p-4 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-green-600' : 'bg-green-500'
          } text-white font-semibold transition ${
            isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
          }`}
          aria-label={i18n.t('submit')}
        >
          {isSubmitting ? (
            <>
              <CircularLoader />
              <span className="ml-3">{i18n.t('submitting')}</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="mr-2" />
              {i18n.t('submit')}
            </>
          )}
        </motion.button>

        <div className="mt-6 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.href = 'https://bloodflow-ghta.onrender.com'}
            className={`p-3 rounded-full ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition flex items-center justify-center shadow-lg`}
            aria-label="Retourner à l'accueil"
            disabled={isSubmitting}
          >
            <FaArrowLeft className="text-xl" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full ${
              isDarkMode
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            } transition shadow-lg`}
            aria-label={isDarkMode ? 'Activer mode clair' : 'Activer mode sombre'}
            disabled={isSubmitting}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>
        </div>
      </motion.div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </div>
  );
};

export default FeedbackForm;
