import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConf: '',
    displayName: '',
    phone: ''
  });

  const t = translations[lang].auth;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await authService.login({
          email: formData.email,
          password: formData.password
        });
        authService.saveSession(res);
      } else {
        const res = await authService.register({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password,
          passwordConf: formData.passwordConf,
          phone: formData.phone
        });
        authService.saveSession(res);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] rounded-lg overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-zinc-950 p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-cyan-400 font-mono-tech tracking-wider text-center">
            {isLogin ? t.loginTitle : t.registerTitle}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-200 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="relative group">
              <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
              <input
                name="displayName"
                placeholder={t.namePlace}
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono-tech text-sm"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative group">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
            <input
              name="email"
              placeholder={t.emailPlace}
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono-tech text-sm"
              required
            />
          </div>

          <div className="relative group">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
            <input
              name="password"
              type="password"
              placeholder={t.passPlace}
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono-tech text-sm"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  name="passwordConf"
                  type="password"
                  placeholder={t.passConfPlace}
                  value={formData.passwordConf}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono-tech text-sm"
                  required
                />
              </div>
              <div className="relative group">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
                <input
                  name="phone"
                  placeholder={t.phonePlace}
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono-tech text-sm"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <span className="animate-pulse">PROCESSING...</span> : (isLogin ? t.submitLogin : t.submitRegister)}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setError(null); setIsLogin(!isLogin); }}
              className="text-xs text-gray-400 hover:text-cyan-300 transition-colors underline"
            >
              {isLogin ? t.switchReg : t.switchLog}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AuthModal;
