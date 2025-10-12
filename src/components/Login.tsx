import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, BookOpen, Shield, Users, BarChart3, Sparkles, Zap, ArrowRight, ArrowLeft, Star, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Mouse Follower */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Section */}
            <div className="text-center lg:text-right space-y-8">
              {/* Logo and Brand */}
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-6 rounded-2xl shadow-2xl">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                    مفتاح
                  </h1>
                  <p className="text-xl text-blue-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    منصة متطورة لمساعدة مستشار التوجيه  و الإرشاد المدرسي و المهني في مهامه اليومية
                  </p>
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed mt-4">
                    أرسل لنا بريدًا إلكترونيًا للحصول على اسم المستخدم وكلمة المرور مجانًا
                  </p>
                </div>
              </div>

              {/* Website Promotion */}
              <div className="group relative max-w-2xl mx-auto lg:mx-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-yellow-400 mb-1">NetScolaire</h3>
                    <p className="text-gray-300 text-base mb-3 leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
                      اكتشف موقعنا المتخصص في حلول معلوماتية للمؤسسات التعليمية لصيانة الكمبيوتر و تركيب شبكات الإنترنت على مستوى مستغانم والمناطق المجاورة
                    </p>
                    <a 
                      href="https://netscolaire-dz.netlify.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 group-hover:scale-105"
                    >
                      <span>زيارة الموقع</span>
                      <ArrowLeft className="w-3 h-3 transition-transform duration-300" />
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-md">
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                        <h2 className="text-3xl font-bold text-white">مرحباً بك</h2>
                        <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                      </div>
                      <p className="text-gray-300 text-lg">سجل دخولك للوصول إلى عالم التوجيه الذكي</p>
                    </div>

                    {/* Error Message */}
        {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-4 rounded-2xl text-center backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            {error}
                        </div>
          </div>
        )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email Field */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-200">
              البريد الإلكتروني
            </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-blue-400" />
                            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pr-12 pl-6 py-4 bg-slate-800/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                              placeholder="أدخل بريدك الإلكتروني"
              required
            />
          </div>
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-200">
              كلمة المرور
            </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-blue-400" />
                            </div>
            <input
                              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pr-12 pl-6 py-4 bg-slate-800/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
                              placeholder="أدخل كلمة المرور"
              required
            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
          </div>

                      {/* Login Button */}
          <button
            type="submit"
                        disabled={isLoading}
                        className="relative w-full group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl group-hover:shadow-blue-500/25">
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>جاري تسجيل الدخول...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <span>دخول إلى النظام</span>
                              <ArrowLeft className="w-5 h-5 transition-transform duration-300" />
                            </div>
                          )}
                        </div>
          </button>
        </form>

                    {/* Footer */}
                    <div className="text-center pt-6 border-t border-white/10">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Shield className="w-4 h-4" />
                        <span>بريدنا موجود على موقعنا الإلكتروني </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}