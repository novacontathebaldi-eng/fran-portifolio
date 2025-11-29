
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

export const Auth: React.FC = () => {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Banner */}
      <div className="hidden lg:flex w-1/2 bg-[#1a1a1a] items-center justify-center relative overflow-hidden">
        <img src="https://picsum.photos/seed/arch_auth/900/1200" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative z-10 text-white p-12 max-w-lg">
          <h1 className="text-5xl font-serif mb-6">Bem-vindo ao seu espaço.</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Gerencie seus projetos, visualize cronogramas e colabore diretamente com nossa equipe de design através do portal do cliente.
          </p>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col p-8 md:p-16 overflow-y-auto">
        <div className="mb-12">
          <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-black">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Início
          </Link>
        </div>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recover" element={<Recover />} />
        </Routes>
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useProjects();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = login(email);
    
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } else {
      setError('Email não encontrado. Tente "cliente@exemplo.com.br" ou "admin@fran.com".');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto animate-fadeIn">
      <h2 className="text-3xl font-serif mb-2">Entrar</h2>
      <p className="text-secondary mb-8">Acesse o painel do seu projeto.</p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" 
            placeholder="voce@exemplo.com.br" 
          />
          <span className="text-xs text-gray-400 mt-1 block">Dica: Use "admin@fran.com" ou "cliente@exemplo.com.br"</span>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Senha</label>
          <input type="password" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" placeholder="••••••••" />
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center space-x-2 text-gray-500">
            <input type="checkbox" className="rounded" />
            <span>Lembrar-me</span>
          </label>
          <Link to="/auth/recover" className="text-black underline">Esqueceu a senha?</Link>
        </div>

        <button className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-accent transition">Entrar</button>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Não tem uma conta? <Link to="/auth/register" className="text-black font-bold">Cadastre-se</Link>
      </p>
    </div>
  );
};

const Register: React.FC = () => {
  return (
    <div className="max-w-md w-full mx-auto animate-fadeIn">
      <h2 className="text-3xl font-serif mb-2">Criar Conta</h2>
      <p className="text-secondary mb-8">Comece sua jornada com Fran Siller Arquitetura.</p>
      
      <form className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nome Completo</label>
          <input type="text" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email</label>
          <input type="email" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Senha</label>
            <input type="password" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Confirmar</label>
            <input type="password" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
          </div>
        </div>

        <div className="text-xs text-gray-500">
           Ao se registrar, você concorda com nossos <button className="underline">Termos de Serviço</button> e <button className="underline">Política de Privacidade</button>.
        </div>

        <button className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-accent transition">Criar Conta</button>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Já tem uma conta? <Link to="/auth/" className="text-black font-bold">Entrar</Link>
      </p>
    </div>
  );
};

const Recover: React.FC = () => {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="max-w-md w-full mx-auto text-center animate-fadeIn">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-serif mb-4">Verifique seu email</h2>
        <p className="text-secondary mb-8">Enviamos instruções para redefinir sua senha.</p>
        <Link to="/auth" className="text-black font-bold underline">Voltar para Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto animate-fadeIn">
      <h2 className="text-3xl font-serif mb-2">Recuperar Senha</h2>
      <p className="text-secondary mb-8">Digite seu email para receber instruções de recuperação.</p>
      
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email</label>
          <input type="email" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
        </div>
        <button className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-accent transition">Enviar Instruções</button>
      </form>
       <p className="mt-8 text-center text-sm">
        <Link to="/auth/" className="text-gray-500">Cancelar</Link>
      </p>
    </div>
  );
};
