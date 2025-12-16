import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, ArrowRight, Phone, Video, MapPin } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

interface TimeSlot {
    time: string;
    available: boolean;
}

interface MeetingType {
    id: string;
    title: string;
    description: string;
    duration: string;
    icon: React.ReactNode;
}

export const Schedule: React.FC = () => {
    const { siteContent } = useProjects();
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const meetingTypes: MeetingType[] = [
        {
            id: 'presencial',
            title: 'Reunião Presencial',
            description: 'Visite nosso escritório para uma conversa pessoal',
            duration: '1 hora',
            icon: <MapPin className="w-6 h-6" />
        },
        {
            id: 'video',
            title: 'Videochamada',
            description: 'Reunião online via Google Meet ou Zoom',
            duration: '45 min',
            icon: <Video className="w-6 h-6" />
        },
        {
            id: 'telefone',
            title: 'Ligação Telefônica',
            description: 'Conversa rápida por telefone',
            duration: '30 min',
            icon: <Phone className="w-6 h-6" />
        }
    ];

    // Generate next 14 available days (excluding weekends)
    const getAvailableDates = () => {
        const dates: string[] = [];
        const today = new Date();
        let count = 0;
        let daysChecked = 0;

        while (count < 14 && daysChecked < 30) {
            const date = new Date(today);
            date.setDate(today.getDate() + daysChecked + 1);
            const dayOfWeek = date.getDay();

            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                dates.push(date.toISOString().split('T')[0]);
                count++;
            }
            daysChecked++;
        }
        return dates;
    };

    const availableDates = getAvailableDates();

    const timeSlots: TimeSlot[] = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
    ];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log({
            type: selectedType,
            date: selectedDate,
            time: selectedTime,
            ...formData
        });
        setSubmitted(true);
    };

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
                        Agendamento Confirmado!
                    </h1>
                    <p className="text-gray-600 mb-2">
                        Sua reunião foi agendada para:
                    </p>
                    <p className="text-xl font-medium text-[#d4bbb0] mb-6">
                        {formatDate(selectedDate)} às {selectedTime}
                    </p>
                    <p className="text-gray-500 text-sm mb-8">
                        Enviamos um email de confirmação para {formData.email}
                    </p>
                    <a
                        href="/"
                        className="inline-block px-8 py-3 bg-black text-white text-sm tracking-widest uppercase hover:bg-[#d4bbb0] transition-colors"
                    >
                        Voltar ao Início
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f4]">

            {/* Header */}
            <section className="py-20 md:py-28 bg-[#1a1a1a] text-white">
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
                    <span className={step === 3 ? 'font-medium text-black' : ''}>Seus Dados</span>
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
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            setStep(2);
                                        }}
                                        className={`p-6 bg-white border-2 rounded-lg text-left hover:border-[#d4bbb0] transition-all group ${selectedType === type.id ? 'border-[#d4bbb0]' : 'border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[#f8f6f4] rounded-lg flex items-center justify-center text-[#d4bbb0] group-hover:bg-[#d4bbb0] group-hover:text-white transition-colors">
                                                {type.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium mb-1">{type.title}</h3>
                                                <p className="text-gray-500 text-sm mb-2">{type.description}</p>
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {type.duration}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#d4bbb0] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
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
                            <h2 className="text-2xl font-light text-center mb-8" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Escolha uma data e horário
                            </h2>

                            {/* Date Selection */}
                            <div className="mb-8">
                                <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Data
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableDates.map((date) => (
                                        <button
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            className={`px-4 py-2 rounded-lg text-sm transition-all ${selectedDate === date
                                                    ? 'bg-[#d4bbb0] text-black'
                                                    : 'bg-white hover:bg-gray-50'
                                                }`}
                                        >
                                            {formatDate(date)}
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
                                    <div className="flex flex-wrap gap-2">
                                        {timeSlots.filter(s => s.available).map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => setSelectedTime(slot.time)}
                                                className={`px-6 py-3 rounded-lg text-sm transition-all ${selectedTime === slot.time
                                                        ? 'bg-[#d4bbb0] text-black'
                                                        : 'bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
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

                    {/* Step 3: Contact Info */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <h2 className="text-2xl font-light text-center mb-8" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                                Seus dados de contato
                            </h2>

                            {/* Summary */}
                            <div className="bg-white p-6 rounded-lg mb-8">
                                <h3 className="text-sm font-medium text-gray-600 mb-4">Resumo do agendamento</h3>
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-400">Tipo:</span>
                                        <span className="ml-2 font-medium">
                                            {meetingTypes.find(t => t.id === selectedType)?.title}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Data:</span>
                                        <span className="ml-2 font-medium">{formatDate(selectedDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Horário:</span>
                                        <span className="ml-2 font-medium">{selectedTime}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4bbb0] focus:border-transparent outline-none"
                                        placeholder="Seu nome"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4bbb0] focus:border-transparent outline-none"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Telefone *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4bbb0] focus:border-transparent outline-none"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sobre o que gostaria de conversar? (opcional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4bbb0] focus:border-transparent outline-none resize-none"
                                        placeholder="Conte um pouco sobre seu projeto ou dúvidas..."
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
                                        className="px-8 py-3 bg-[#d4bbb0] text-black text-sm tracking-widest uppercase font-medium hover:bg-black hover:text-white transition-colors"
                                    >
                                        Confirmar Agendamento
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}
