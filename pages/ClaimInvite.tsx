import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useProjects } from '../context/ProjectContext';
import {
    ArrowLeft, CheckCircle, AlertCircle, Loader2,
    Gift, User, Mail, Lock, Phone, Eye, EyeOff
} from 'lucide-react';

interface InviteData {
    id: string;
    code: string;
    internal_name: string;
    status: string;
    folders: { name: string; fileCount: number }[];
}

export const ClaimInvite: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { showToast } = useProjects();

    // States
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [invite, setInvite] = useState<InviteData | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: ''
    });

    // Validate invite code on mount
    useEffect(() => {
        const validateCode = async () => {
            if (!code) {
                setError('Código não informado');
                setLoading(false);
                return;
            }

            try {
                // Fetch invite
                const { data, error: fetchError } = await supabase
                    .from('client_invites')
                    .select('id, code, internal_name, status')
                    .eq('code', code.toUpperCase())
                    .single();

                if (fetchError || !data) {
                    setError('Código inválido ou não encontrado');
                    setLoading(false);
                    return;
                }

                if (data.status !== 'pending') {
                    setError('Este convite já foi utilizado');
                    setLoading(false);
                    return;
                }

                // Fetch folders count
                const { data: folders } = await supabase
                    .from('client_folders')
                    .select('name, files:client_files(id)')
                    .eq('invite_id', data.id);

                setInvite({
                    ...data,
                    folders: folders?.map(f => ({
                        name: f.name,
                        fileCount: (f.files as any[])?.length || 0
                    })) || []
                });

                // Pre-fill name from invite
                setFormData(prev => ({
                    ...prev,
                    name: data.internal_name.split(' - ')[0] || ''
                }));

            } catch (err) {
                console.error('Error validating invite:', err);
                setError('Erro ao validar convite');
            } finally {
                setLoading(false);
            }
        };

        validateCode();
    }, [code]);

    // Handle form change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!formData.email || !formData.password) {
            setError('Email e senha são obrigatórios');
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não conferem');
            return;
        }

        setSubmitting(true);

        try {
            // Call Edge Function
            const { data, error: claimError } = await supabase.functions.invoke('claim-invite', {
                body: {
                    code: code?.toUpperCase(),
                    email: formData.email,
                    password: formData.password,
                    name: formData.name || undefined,
                    phone: formData.phone || undefined
                }
            });

            if (claimError) {
                console.error('Claim error:', claimError);
                setError('Erro ao processar. Tente novamente.');
                return;
            }

            if (!data.success) {
                setError(data.error || 'Erro ao criar conta');
                return;
            }

            // Success!
            setSuccess(true);
            showToast('Conta criada com sucesso!', 'success');

            // If we got a session, set it
            if (data.session) {
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token
                });

                // Redirect after short delay
                setTimeout(() => {
                    navigate('/profile', { replace: true });
                }, 2000);
            } else {
                // No session, redirect to login
                setTimeout(() => {
                    navigate('/auth', { replace: true });
                }, 3000);
            }

        } catch (err) {
            console.error('Submit error:', err);
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Banner - Same as Auth */}
            <div className="hidden lg:flex w-1/2 bg-[#1a1a1a] items-center justify-center relative overflow-hidden">
                <img
                    src="https://pycvlkcxgfwsquzolkzw.supabase.co/storage/v1/object/public/storage-Fran/fundo-login.png"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    alt=""
                />
                <div className="relative z-10 text-white p-12 max-w-lg">
                    <Gift className="w-16 h-16 mb-6 text-amber-400" />
                    <h1 className="text-5xl font-serif mb-6">Sua área exclusiva está pronta.</h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Criamos um espaço personalizado para você. Complete seu cadastro para acessar seus projetos e documentos.
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

                <div className="max-w-md w-full mx-auto">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center animate-fadeIn">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-gray-400" />
                            <p className="text-secondary">Verificando convite...</p>
                        </div>
                    )}

                    {/* Error State (no valid invite) */}
                    {!loading && error && !invite && (
                        <div className="text-center animate-fadeIn">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-serif mb-4">Ops!</h2>
                            <p className="text-secondary mb-8">{error}</p>
                            <Link to="/auth" className="text-black font-bold underline">
                                Ir para Login
                            </Link>
                        </div>
                    )}

                    {/* Success State */}
                    {success && (
                        <div className="text-center animate-fadeIn">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-serif mb-4">Conta Criada!</h2>
                            <p className="text-secondary mb-4">
                                Sua área está pronta. Redirecionando...
                            </p>
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        </div>
                    )}

                    {/* Form State */}
                    {!loading && invite && !success && (
                        <div className="animate-fadeIn">
                            {/* Welcome Message */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Gift className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <span className="text-sm text-amber-600 font-medium">Convite especial</span>
                                        <h2 className="text-2xl font-serif">Olá! 👋</h2>
                                    </div>
                                </div>
                                <p className="text-secondary">
                                    Preparamos uma área exclusiva para você. Complete seu cadastro para acessar.
                                </p>
                            </div>

                            {/* What's included */}
                            {invite.folders.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-8">
                                    <p className="text-sm font-medium text-gray-700 mb-2">O que você vai receber:</p>
                                    <ul className="space-y-1">
                                        {invite.folders.map((folder, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                                {folder.name} ({folder.fileCount} {folder.fileCount === 1 ? 'arquivo' : 'arquivos'})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-fadeIn">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                                        Seu Nome
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="Como quer ser chamado(a)?"
                                            className="w-full border rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-black transition"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            type="email"
                                            placeholder="seu@email.com"
                                            required
                                            className="w-full border rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-black transition"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                                        WhatsApp / Telefone
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            type="tel"
                                            placeholder="(00) 00000-0000"
                                            className="w-full border rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-black transition"
                                        />
                                    </div>
                                </div>

                                {/* Passwords */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                                            Senha *
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••"
                                                required
                                                className="w-full border rounded-lg py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-black transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                                            Confirmar *
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••"
                                                required
                                                className="w-full border rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-black transition"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500">
                                    Mínimo de 6 caracteres. Ao criar sua conta, você concorda com nossos termos.
                                </p>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Criando conta...
                                        </>
                                    ) : (
                                        'Criar Minha Conta'
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-gray-500">
                                Já tem uma conta? <Link to="/auth" className="text-black font-bold">Entrar</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
