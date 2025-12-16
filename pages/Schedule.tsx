import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, ArrowRight, Phone, Video, MapPin, Wrench, LogIn, User } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

interface MeetingType {
    id: string;
    title: string;
    description: string;
    duration: string;
    icon: React.ReactNode;
    needsAddress?: boolean;
    showOfficeAddress?: boolean;
    appointmentType: 'meeting' | 'visit';
    modality?: 'online' | 'presencial' | 'phone';
}

export const Schedule: React.FC = () => {
    const navigate = useNavigate();
    const {
        siteContent,
        scheduleSettings,
        checkAvailability,
        addAppointment,
        currentUser,
        showToast
    } = useProjects();

    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [visitAddress, setVisitAddress] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Preencher dados do usuário se logado
    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                message: ''
            });
        }
    }, [currentUser]);

    const officeAddress = siteContent?.office?.address || 'Endereço não disponível';

    const meetingTypes: MeetingType[] = [
        {
            id: 'presencial',
            title: 'Reunião Presencial',
            description: 'Visite nosso escritório para uma conversa pessoal',
            duration: '1 hora',
            icon: <MapPin className="w-6 h-6" />,
            showOfficeAddress: true,
            appointmentType: 'meeting',
            modality: 'presencial'
        },
        {
            id: 'video',
            title: 'Videochamada',
            description: 'Reunião online via Google Meet ou Zoom',
            duration: '45 min',
            icon: <Video className="w-6 h-6" />,
            appointmentType: 'meeting',
            modality: 'online'
        },
        {
            id: 'telefone',
            title: 'Ligação Telefônica',
            description: 'Conversa rápida por telefone',
            duration: '30 min',
            icon: <Phone className="w-6 h-6" />,
            appointmentType: 'meeting',
            modality: 'phone'
        },
        {
            id: 'visita',
            title: 'Visita Técnica',
            description: 'Nossa equipe vai até o local da obra',
            duration: '1h30',
            icon: <Wrench className="w-6 h-6" />,
            needsAddress: true,
            appointmentType: 'visit'
        }
    ];

    // Buscar próximos dias com disponibilidade usando checkAvailability
    const availableDates = useMemo(() => {
        const dates: { dateStr: string; dateObj: Date; slots: string[] }[] = [];
        const today = new Date();
        let current = new Date(today);

        // Se já passou das 17h, começar de amanhã
        if (today.getHours() > 17) {
            current.setDate(today.getDate() + 1);
        }

        // Procurar até 30 dias à frente para encontrar 14 dias com slots
        for (let i = 0; i < 30 && dates.length < 14; i++) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const slots = checkAvailability(dateStr);

            if (slots.length > 0) {
                dates.push({
                    dateStr,
                    dateObj: new Date(current),
                    slots
                });
            }

            current.setDate(current.getDate() + 1);
        }

        return dates;
    }, [checkAvailability]);

    // Auto-selecionar primeiro dia disponível
    useEffect(() => {
        if (!selectedDate && availableDates.length > 0) {
            setSelectedDate(availableDates[0].dateStr);
        }
    }, [availableDates, selectedDate]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const formatDateLong = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const selectedMeetingType = meetingTypes.find(t => t.id === selectedType);
    const currentSlots = availableDates.find(d => d.dateStr === selectedDate)?.slots || [];

    const getLocationText = () => {
        if (!selectedMeetingType) return '';

        if (selectedMeetingType.id === 'visita') {
            return visitAddress || 'Endereço da visita';
        }
        if (selectedMeetingType.modality === 'presencial') {
            return officeAddress;
        }
        if (selectedMeetingType.modality === 'online') {
            return 'Online (Google Meet)';
        }
        if (selectedMeetingType.modality === 'phone') {
            return 'Ligação Telefônica';
        }
        return '';
    };

    const handleSelectType = (typeId: string) => {
        setSelectedType(typeId);
        const type = meetingTypes.find(t => t.id === typeId);

        // Se precisa de endereço (visita técnica), não avança automaticamente
        if (type?.needsAddress) {
            // Fica no passo 1 para preencher endereço
        } else {
            setStep(2);
        }
    };

    const handleVisitAddressSubmit = () => {
        if (visitAddress.trim()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            showToast('Faça login para confirmar o agendamento', 'info');
            navigate('/auth');
            return;
        }

        if (!selectedMeetingType || !selectedDate || !selectedTime) {
            showToast('Selecione data e horário', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            await addAppointment({
                clientId: currentUser.id,
                clientName: currentUser.name,
                type: selectedMeetingType.appointmentType,
                date: selectedDate,
                time: selectedTime,
                location: getLocationText(),
                notes: formData.message || undefined
            });

            setSubmitted(true);
            showToast('Agendamento solicitado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao agendar:', error);
            showToast('Erro ao realizar agendamento. Tente novamente.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tela de sucesso
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f8f6f4] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        Solicitação Enviada!
                    </h1>
                    <p className="text-gray-600 mb-2">
                        Seu agendamento foi solicitado para:
                    </p>
                    <p className="text-xl font-medium text-[#d4bbb0] mb-2">
                        {formatDateLong(selectedDate)} às {selectedTime}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        {selectedMeetingType?.title} • {getLocationText()}
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                        <p className="text-sm text-amber-800">
                            <strong>Atenção:</strong> Seu horário está pré-reservado, mas aguarda confirmação da nossa equipe.
                            Você receberá uma notificação assim que aprovarmos.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/profile"
                            className="px-8 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-[#d4bbb0] transition-colors"
                        >
                            Ver Agendamentos
                        </Link>
                        <Link
                            to="/"
                            className="px-8 py-3 border border-gray-300 text-gray-700 text-sm tracking-widest uppercase hover:border-black transition-colors"
                        >
                            Voltar ao Início
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f4]">

            {/* Header */}
            <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-[#1a1a1a] text-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-[#d4bbb0] text-sm tracking-[0.3em] uppercase mb-4">Agende sua Reunião</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                            Vamos conversar?
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Progress Steps */}
            <div className="container mx-auto px-6 py-8">
                <div className="flex items-center justify-center gap-4 md:gap-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s ? 'bg-[#d4bbb0] text-black' : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 md:w-24 h-[2px] ${step > s ? 'bg-[#d4bbb0]' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-8 md:gap-16 mt-4 text-sm text-gray-600">
                    <span className={step === 1 ? 'font-medium text-black' : ''}>Tipo</span>
                    <span className={step === 2 ? 'font-medium text-black' : ''}>Data e Hora</span>
                    <span className={step === 3 ? 'font-medium text-black' : ''}>Confirmação</span>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 pb-20">
                <div className="max-w-3xl mx-auto">

                    {/* Step 1: Meeting Type */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-2xl font-light text-center mb-8" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Como você prefere conversar?
                            </h2>
                            <div className="grid gap-4">
                                {meetingTypes.map((type) => (
                                    <div key={type.id}>
                                        <button
                                            onClick={() => handleSelectType(type.id)}
                                            className={`w-full p-6 bg-white border-2 rounded-lg text-left hover:border-[#d4bbb0] transition-all group ${selectedType === type.id ? 'border-[#d4bbb0]' : 'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-[#f8f6f4] rounded-lg flex items-center justify-center text-[#d4bbb0] group-hover:bg-[#d4bbb0] group-hover:text-white transition-colors">
                                                    {type.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium mb-1">{type.title}</h3>
                                                    <p className="text-gray-500 text-sm mb-2">{type.description}</p>

                                                    {/* Mostrar endereço do escritório para reunião presencial */}
                                                    {type.showOfficeAddress && (
                                                        <p className="text-xs text-[#d4bbb0] flex items-center gap-1 mb-2">
                                                            <MapPin className="w-3 h-3" />
                                                            {officeAddress}
                                                        </p>
                                                    )}

                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        {type.duration}
                                                    </span>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#d4bbb0] group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>

                                        {/* Input de endereço para visita técnica */}
                                        {type.needsAddress && selectedType === type.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 p-4 bg-gray-50 rounded-lg"
                                            >
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Endereço da obra/visita *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={visitAddress}
                                                    onChange={(e) => setVisitAddress(e.target.value)}
                                                    placeholder="Rua, número, bairro, cidade - UF"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4bbb0] focus:border-transparent outline-none mb-3"
                                                />
                                                <button
                                                    onClick={handleVisitAddressSubmit}
                                                    disabled={!visitAddress.trim()}
                                                    className="w-full px-6 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-[#d4bbb0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    Continuar
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Date & Time */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-2xl font-light text-center mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Escolha uma data e horário
                            </h2>
                            <p className="text-center text-gray-500 text-sm mb-8">
                                {selectedMeetingType?.title} • {getLocationText()}
                            </p>

                            {availableDates.length > 0 ? (
                                <>
                                    {/* Date Selection */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Data
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {availableDates.map((d) => (
                                                <button
                                                    key={d.dateStr}
                                                    onClick={() => {
                                                        setSelectedDate(d.dateStr);
                                                        setSelectedTime('');
                                                    }}
                                                    className={`px-4 py-3 rounded-lg text-sm transition-all flex flex-col items-center min-w-[70px] ${selectedDate === d.dateStr
                                                        ? 'bg-[#d4bbb0] text-black shadow-md scale-105'
                                                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                                                        }`}
                                                >
                                                    <span className="text-[10px] uppercase font-bold">
                                                        {d.dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                                    </span>
                                                    <span className="text-lg font-bold">{d.dateObj.getDate()}</span>
                                                    <span className="text-[10px]">
                                                        {d.dateObj.toLocaleDateString('pt-BR', { month: 'short' })}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    {selectedDate && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-8"
                                        >
                                            <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Horário
                                            </h3>
                                            {currentSlots.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {currentSlots.map((slot) => (
                                                        <button
                                                            key={slot}
                                                            onClick={() => setSelectedTime(slot)}
                                                            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${selectedTime === slot
                                                                ? 'bg-[#d4bbb0] text-black shadow-md'
                                                                : 'bg-white hover:bg-gray-50 border border-gray-200'
                                                                }`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm">Nenhum horário disponível nesta data.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Nenhuma data disponível no momento.</p>
                                    <p className="text-gray-400 text-sm mt-2">Entre em contato via WhatsApp para agendar.</p>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 text-sm text-gray-600 hover:text-black transition-colors"
                                >
                                    ← Voltar
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!selectedDate || !selectedTime}
                                    className="px-8 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-[#d4bbb0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Continuar
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Login Check */}
                            {!currentUser ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <User className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h2 className="text-2xl font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                        Identificação Necessária
                                    </h2>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                        Para confirmar seu agendamento, precisamos que você acesse sua conta ou crie uma nova.
                                    </p>
                                    <button
                                        onClick={() => navigate('/auth')}
                                        className="px-10 py-4 bg-black text-white text-sm tracking-widest uppercase hover:bg-[#d4bbb0] transition-colors inline-flex items-center gap-2"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Entrar ou Cadastrar
                                    </button>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="block mx-auto mt-4 text-sm text-gray-500 hover:text-black"
                                    >
                                        ← Voltar e escolher outro horário
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-light text-center mb-8" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                        Confirme seu agendamento
                                    </h2>

                                    {/* Summary */}
                                    <div className="bg-white p-6 rounded-lg mb-8 border border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-600 mb-4">Resumo do agendamento</h3>
                                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-400">Tipo:</span>
                                                <span className="ml-2 font-medium">{selectedMeetingType?.title}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Duração:</span>
                                                <span className="ml-2 font-medium">{selectedMeetingType?.duration}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Data:</span>
                                                <span className="ml-2 font-medium">{formatDateLong(selectedDate)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Horário:</span>
                                                <span className="ml-2 font-medium">{selectedTime}</span>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="text-gray-400">Local:</span>
                                                <span className="ml-2 font-medium">{getLocationText()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* User info (readonly) */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-2">Agendando como:</p>
                                            <p className="font-medium">{currentUser.name}</p>
                                            <p className="text-sm text-gray-500">{currentUser.email}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Observações (opcional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4bbb0] focus:border-transparent outline-none resize-none"
                                                placeholder="Alguma informação adicional sobre seu projeto ou dúvidas..."
                                            />
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex justify-between pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="px-6 py-3 text-sm text-gray-600 hover:text-black transition-colors"
                                            >
                                                ← Voltar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-8 py-3 bg-[#d4bbb0] text-black text-sm tracking-widest uppercase font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Enviando...' : 'Confirmar Agendamento'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}
