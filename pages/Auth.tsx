import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useProjects } from '../context/ProjectContext';
import { supabase } from '../supabaseClient';

export const Auth: React.FC = () => {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Banner */}
      <div className="hidden lg:flex w-1/2 bg-[#1a1a1a] items-center justify-center relative overflow-hidden">
        <img src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-login.png" className="absolute inset-0 w-full h-full object-cover opacity-50" />
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
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useProjects();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, error } = await login(email, password);

      if (error) {
        setError(error.message);
      } else {
        // Force redirect to profile with replace to clear history stack
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
        // Note: redirectTo removed - Supabase will use configured callback URL
      });

      if (error) {
        setError('Erro ao conectar com Google. Tente novamente.');
        setGoogleLoading(false);
      }
      // Note: loading will persist during redirect
    } catch (err) {
      setError('Ocorreu um erro inesperado ao fazer login com Google.');
      setGoogleLoading(false);
    }
  };

  const handleInput = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError('');
  };

  return (
    <div className="max-w-md w-full mx-auto animate-fadeIn">
      <h2 className="text-3xl font-serif mb-2">Entrar</h2>
      <p className="text-secondary mb-8">Acesse o painel do seu projeto.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fadeIn">
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
            onChange={(e) => handleInput(setEmail, e.target.value)}
            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
            placeholder="voce@exemplo.com.br"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => handleInput(setPassword, e.target.value)}
            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex justify-end items-center text-sm">
          <Link to="/auth/recover" className="text-black underline">Esqueceu a senha?</Link>
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-accent transition disabled:opacity-50 flex items-center justify-center">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">ou</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          aria-label="Entrar com Google"
          className="w-full border-2 border-black bg-white text-black py-4 rounded-full font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <FcGoogle className="w-5 h-5" />
              <span>Continuar com Google</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Não tem uma conta? <Link to="/auth/register" className="text-black font-bold">Cadastre-se</Link>
      </p>
    </div>
  );
};

const Register: React.FC = () => {
  const { registerUser } = useProjects();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await registerUser(formData.name, formData.email, formData.phone, formData.password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      setError("Erro inesperado ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  return (
    <div className="max-w-md w-full mx-auto animate-fadeIn">
      <h2 className="text-3xl font-serif mb-2">Criar Conta</h2>
      <p className="text-secondary mb-8">Comece sua jornada com Fran Siller Arquitetura.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nome Completo</label>
          <input name="name" onChange={handleChange} required type="text" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email</label>
          <input name="email" onChange={handleChange} required type="email" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">WhatsApp / Telefone</label>
          <input name="phone" onChange={handleChange} required type="tel" placeholder="(00) 00000-0000" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Senha</label>
            <input name="password" onChange={handleChange} required type="password" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Confirmar</label>
            <input name="confirmPassword" onChange={handleChange} required type="password" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Ao se registrar, você concorda com nossos <button type="button" className="underline">Termos de Serviço</button> e <button type="button" className="underline">Política de Privacidade</button>.
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-accent transition disabled:opacity-50 flex items-center justify-center">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Conta'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Já tem uma conta? <Link to="/auth/" className="text-black font-bold">Entrar</Link>
      </p>
    </div>
  );
};

const Recover: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/auth/reset-password`,
      });

      if (error) {
        setError('Erro ao enviar email de recuperação. Verifique o endereço e tente novamente.');
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md w-full mx-auto text-center animate-fadeIn">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-serif mb-4">Verifique seu email</h2>
        <p className="text-secondary mb-8">
          Enviamos instruções para <strong>{email}</strong>. Clique no link para redefinir sua senha.
        </p>
        <Link to="/auth" className="text-black font-bold underline">Voltar para Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto animate-fadeIn">
      <h2 className="text-3xl font-serif mb-2">Recuperar Senha</h2>
      <p className="text-secondary mb-8">Digite seu email para receber instruções de recuperação.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fadeIn">
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
            placeholder="voce@exemplo.com.br"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-accent transition disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Instruções'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link to="/auth/" className="text-gray-500">Cancelar</Link>
      </p>
    </div>
  );
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  // Verificar se há uma sessão de recuperação válida
  useEffect(() => {
    const verifySession = async () => {
      try {
        // window.location.hash = "#/auth/reset-password#access_token=...&type=recovery"
        // Precisamos pegar os parâmetros APÓS o segundo #
        const hash = window.location.hash;
        const parts = hash.split('#');

        // parts[0] = ""
        // parts[1] = "/auth/reset-password"
        // parts[2] = "access_token=...&type=recovery&..."

        let accessToken = null;
        let refreshToken = null;
        let type = null;

        if (parts.length > 2) {
          // Tem segundo hash - processar tokens
          const tokenParams = new URLSearchParams(parts[2]);
          accessToken = tokenParams.get('access_token');
          refreshToken = tokenParams.get('refresh_token');
          type = tokenParams.get('type');
        }

        // Se tiver tokens na URL, definir a sessão
        if (accessToken && type === 'recovery') {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) {
            console.error('Erro ao definir sessão:', sessionError);
            setError('Link inválido ou expirado. Solicite uma nova recuperação de senha.');
            setSessionValid(false);
          } else {
            setSessionValid(true);
          }
        } else {
          // Se não tiver tokens na URL, verificar sessão existente
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            setError('Link inválido ou expirado. Solicite uma nova recuperação de senha.');
            setSessionValid(false);
          } else {
            setSessionValid(true);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        setError('Erro ao verificar sessão. Tente novamente.');
        setSessionValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError('Erro ao redefinir senha. Tente novamente.');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/auth'), 2000);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Mostra loading enquanto verifica sessão
  if (verifying) {
    return (
      <div className="max-w-md w-full mx-auto text-center animate-fadeIn">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-gray-400" />
        <p className="text-secondary">Verificando link de recuperação...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto text-center animate-fadeIn">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-serif mb-4">Senha Redefinida!</h2>
        <p className="text-secondary mb-8">
          Sua senha foi atualizada com sucesso. Redirecionando para login...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto animate-fadeIn">
      <h2 className="text-3xl font-serif mb-2">Redefinir Senha</h2>
      <p className="text-secondary mb-8">Digite sua nova senha.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!sessionValid && (
        <div className="mt-6 text-center">
          <Link to="/auth/recover" className="text-black font-bold underline">
            Solicitar Nova Recuperação
          </Link>
        </div>
      )}

      {sessionValid && (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nova Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-accent transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Redefinir Senha'}
          </button>
        </form>
      )}
    </div>
  );
};