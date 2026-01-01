// src/pages/Admin/DispatchesDashboard.tsx
// Componente para gerenciamento de notificações WhatsApp e Email

import React, { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare, Mail, Send, Phone, Plus, Trash2, TestTube,
    ToggleLeft, ToggleRight, Clock, Bell, User, Users, Settings,
    ChevronDown, ChevronRight, RefreshCw, Loader2, Check, X,
    FileText, Save, RotateCcw, History, AlertCircle, Power
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useProjects } from '../../context/ProjectContext';
import {
    NotificationsConfig,
    defaultNotificationsConfig,
    DispatchLogEntry
} from '../../types';
import {
    getNotificationsConfig,
    clearNotificationsConfigCache,
    testWhatsAppConnection,
    restartWuzAPI,
    DEFAULT_TEMPLATES
} from '../../utils/whatsappService';

// ============================================================================
// TOGGLE COMPONENT
// ============================================================================

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    description?: string;
    size?: 'sm' | 'md';
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    enabled,
    onChange,
    label,
    description,
    size = 'md',
    disabled = false
}) => {
    const sizeClasses = size === 'sm'
        ? 'w-10 h-5'
        : 'w-12 h-6';
    const dotSize = size === 'sm'
        ? 'w-4 h-4'
        : 'w-5 h-5';
    const dotTranslate = size === 'sm'
        ? 'translate-x-5'
        : 'translate-x-6';

    return (
        <div className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex-1">
                {label && <span className="font-medium text-gray-900">{label}</span>}
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => !disabled && onChange(!enabled)}
                disabled={disabled}
                className={`relative inline-flex ${sizeClasses} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${enabled ? 'bg-accent' : 'bg-gray-300'
                    } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span
                    className={`inline-block ${dotSize} transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? dotTranslate : 'translate-x-0.5'
                        }`}
                />
            </button>
        </div>
    );
};

// ============================================================================
// COLLAPSIBLE SECTION
// ============================================================================

interface CollapsibleSectionProps {
    title: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    badge?: string | number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    defaultOpen = true,
    children,
    badge
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-gray-900">{title}</span>
                    {badge !== undefined && (
                        <span className="bg-accent text-black text-xs font-bold px-2 py-0.5 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
};

// ============================================================================
// TEMPLATE EDITOR
// ============================================================================

interface TemplateEditorProps {
    templateKey: string;
    label: string;
    description: string;
    variables: string[];
    value: string | null;
    defaultValue: string;
    onChange: (value: string | null) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
    templateKey,
    label,
    description,
    variables,
    value,
    defaultValue,
    onChange
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value || defaultValue);

    const handleSave = () => {
        onChange(localValue === defaultValue ? null : localValue);
        setIsEditing(false);
    };

    const handleRestore = () => {
        setLocalValue(defaultValue);
        onChange(null);
        setIsEditing(false);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h4 className="font-medium text-gray-900">{label}</h4>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {value !== null && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Customizado
                        </span>
                    )}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-sm text-accent hover:underline"
                    >
                        {isEditing ? 'Cancelar' : 'Editar'}
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Variáveis:</span>
                        {variables.map(v => (
                            <button
                                key={v}
                                onClick={() => setLocalValue(prev => prev + `{{${v}}}`)}
                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded font-mono"
                            >
                                {`{{${v}}}`}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        rows={6}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleRestore}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Restaurar Padrão
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1 px-4 py-1.5 bg-accent text-black rounded-lg text-sm font-medium hover:bg-accent/90"
                        >
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200 max-h-32 overflow-y-auto font-mono">
                    {value || defaultValue}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DispatchesDashboard: React.FC = () => {
    const { showToast, appointments } = useProjects();

    // State
    const [config, setConfig] = useState<NotificationsConfig>(defaultNotificationsConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [executingReminders, setExecutingReminders] = useState<'client' | 'admin' | null>(null);
    const [newPhone, setNewPhone] = useState('');
    const [dispatchLog, setDispatchLog] = useState<DispatchLogEntry[]>([]);
    const [activeTemplateTab, setActiveTemplateTab] = useState<'whatsapp-client' | 'whatsapp-admin' | 'email'>('whatsapp-client');
    const [restarting, setRestarting] = useState(false);

    // Count upcoming appointments
    const upcomingAppointments = appointments.filter(a => {
        const date = new Date(a.date + 'T00:00:00');
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + (config.whatsapp.reminders.daysInAdvance || 1));
        targetDate.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === targetDate.getTime() && (a.status === 'confirmed' || a.status === 'pending');
    }).length;

    // Load config
    useEffect(() => {
        loadConfig();
        loadDispatchLog();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const cfg = await getNotificationsConfig();
            setConfig(cfg);
        } catch (error) {
            console.error('Erro ao carregar config:', error);
            showToast('Erro ao carregar configurações', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadDispatchLog = () => {
        try {
            const stored = localStorage.getItem('dispatch_log');
            if (stored) {
                setDispatchLog(JSON.parse(stored));
            }
        } catch {
            setDispatchLog([]);
        }
    };

    const saveDispatchLog = (log: DispatchLogEntry[]) => {
        try {
            localStorage.setItem('dispatch_log', JSON.stringify(log.slice(0, 20)));
        } catch {
            console.error('Erro ao salvar log');
        }
    };

    const addLogEntry = (entry: Omit<DispatchLogEntry, 'id' | 'timestamp'>) => {
        const newEntry: DispatchLogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...entry
        };
        const newLog = [newEntry, ...dispatchLog].slice(0, 20);
        setDispatchLog(newLog);
        saveDispatchLog(newLog);
    };

    // Save config
    const saveConfig = async () => {
        setSaving(true);
        try {
            // Fetch current settings
            const { data: currentData, error: fetchError } = await supabase
                .from('site_settings')
                .select('settings')
                .eq('id', '00000000-0000-0000-0000-000000000001')
                .single();

            if (fetchError) throw fetchError;

            // Merge with existing settings
            const updatedSettings = {
                ...currentData?.settings,
                notificationsConfig: config
            };

            const { error: updateError } = await supabase
                .from('site_settings')
                .update({ settings: updatedSettings })
                .eq('id', '00000000-0000-0000-0000-000000000001');

            if (updateError) throw updateError;

            clearNotificationsConfigCache();
            showToast('Configurações salvas!', 'success');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            showToast('Erro ao salvar configurações', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Test WhatsApp
    const handleTestWhatsApp = async () => {
        setTesting(true);
        try {
            // Passa os números do estado local (não do banco) para testar mesmo antes de salvar
            const result = await testWhatsAppConnection(config.whatsapp.adminPhones);
            if (result.success) {
                showToast(`Teste OK! ${result.sent} enviado(s), ${result.failed} falha(s)`, 'success');
                addLogEntry({
                    type: 'whatsapp',
                    recipient: `${config.whatsapp.adminPhones.length} número(s)`,
                    templateKey: 'test',
                    status: 'success'
                });
            } else {
                showToast(`Falha na conexão: ${result.error}`, 'error');
                addLogEntry({
                    type: 'whatsapp',
                    recipient: `${config.whatsapp.adminPhones.length} número(s)`,
                    templateKey: 'test',
                    status: 'failed',
                    error: result.error
                });
            }
        } catch (error) {
            showToast('Erro ao testar conexão', 'error');
        } finally {
            setTesting(false);
        }
    };

    // Execute reminders
    const handleExecuteReminders = async (target: 'client' | 'admin') => {
        setExecutingReminders(target);
        try {
            const { data, error } = await supabase.functions.invoke('send-reminders', {
                body: { target }
            });

            if (error) throw error;

            console.log('[Reminders] Response:', data);

            const sent = data?.[target]?.sent ?? 0;
            const failed = data?.[target]?.failed ?? 0;

            showToast(
                `Lembretes ${target === 'client' ? 'para clientes' : 'para admins'}: ${sent} enviado(s), ${failed} falha(s)`,
                sent > 0 ? 'success' : 'info'
            );

            if (sent > 0) {
                addLogEntry({
                    type: 'whatsapp',
                    recipient: target === 'client' ? 'Clientes' : 'Admins',
                    templateKey: target === 'client' ? 'reminderClient' : 'reminderAdmin',
                    status: 'success'
                });
            }
        } catch (error) {
            console.error('Erro ao executar lembretes:', error);
            showToast('Erro ao executar lembretes', 'error');
        } finally {
            setExecutingReminders(null);
        }
    };

    // Restart WuzAPI
    const handleRestartWuzAPI = async () => {
        setRestarting(true);
        try {
            const result = await restartWuzAPI();
            if (result.success) {
                showToast('WuzAPI reiniciado com sucesso!', 'success');
                addLogEntry({
                    type: 'whatsapp',
                    recipient: 'Sistema',
                    templateKey: 'restart',
                    status: 'success'
                });
            } else {
                showToast(`Erro ao reiniciar: ${result.message}`, 'error');
                addLogEntry({
                    type: 'whatsapp',
                    recipient: 'Sistema',
                    templateKey: 'restart',
                    status: 'failed',
                    error: result.message
                });
            }
        } catch (error) {
            showToast('Erro de conexão ao reiniciar', 'error');
        } finally {
            setRestarting(false);
        }
    };

    // Phone management
    const handleAddPhone = () => {
        const cleaned = newPhone.replace(/\D/g, '');
        if (cleaned.length < 10) {
            showToast('Número inválido (mínimo 10 dígitos)', 'error');
            return;
        }
        if (config.whatsapp.adminPhones.includes(cleaned)) {
            showToast('Número já está na lista', 'error');
            return;
        }
        setConfig(prev => ({
            ...prev,
            whatsapp: {
                ...prev.whatsapp,
                adminPhones: [...prev.whatsapp.adminPhones, cleaned]
            }
        }));
        setNewPhone('');
    };

    const handleRemovePhone = (phone: string) => {
        setConfig(prev => ({
            ...prev,
            whatsapp: {
                ...prev.whatsapp,
                adminPhones: prev.whatsapp.adminPhones.filter(p => p !== phone)
            }
        }));
    };

    // Utility
    const maskPhone = (phone: string) => {
        if (!phone || phone.length < 6) return phone;
        return phone.slice(0, 4) + '****' + phone.slice(-4);
    };

    const clearLog = () => {
        setDispatchLog([]);
        localStorage.removeItem('dispatch_log');
        showToast('Histórico limpo', 'info');
    };

    // Update config helpers
    const updateWhatsApp = (path: string, value: any) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            const parts = path.split('.');
            let obj: any = newConfig.whatsapp;
            for (let i = 0; i < parts.length - 1; i++) {
                obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = value;
            return newConfig;
        });
    };

    const updateEmail = (path: string, value: any) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            const parts = path.split('.');
            let obj: any = newConfig.email;
            for (let i = 0; i < parts.length - 1; i++) {
                obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = value;
            return newConfig;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Disparos</h1>
                    <p className="text-gray-500">Gerenciamento de notificações WhatsApp e E-mail</p>
                </div>
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </button>
            </div>

            {/* WhatsApp Section */}
            <CollapsibleSection
                title="WhatsApp"
                icon={<MessageSquare className="w-5 h-5 text-green-600" />}
                badge={config.whatsapp.enabled ? 'Ativo' : 'Inativo'}
            >
                {/* Master Toggle */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <ToggleSwitch
                        enabled={config.whatsapp.enabled}
                        onChange={(v) => updateWhatsApp('enabled', v)}
                        label="WhatsApp Ativo"
                        description="Ativar/desativar TODO o envio de WhatsApp"
                    />
                </div>

                {/* Admin Phones */}
                <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Números de Admin
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {config.whatsapp.adminPhones.map(phone => (
                            <div key={phone} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                                <span className="text-sm font-mono">{phone}</span>
                                <button
                                    onClick={() => handleRemovePhone(phone)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Ex: 5527999999999"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                        <button
                            onClick={handleAddPhone}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar
                        </button>
                    </div>
                    <button
                        onClick={handleTestWhatsApp}
                        disabled={testing || !config.whatsapp.adminPhones.length}
                        className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
                    >
                        {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                        Testar Conexão
                    </button>
                    <button
                        onClick={handleRestartWuzAPI}
                        disabled={restarting}
                        className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50"
                    >
                        {restarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                        Reiniciar WuzAPI
                    </button>
                </div>

                {/* Notify Admin Toggles */}
                <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <ToggleSwitch
                        enabled={config.whatsapp.notifyAdmin.enabled}
                        onChange={(v) => updateWhatsApp('notifyAdmin.enabled', v)}
                        label="Notificações para Admin"
                        description="Receber notificações no WhatsApp"
                        disabled={!config.whatsapp.enabled}
                    />
                    {config.whatsapp.notifyAdmin.enabled && config.whatsapp.enabled && (
                        <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-2">
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyAdmin.budget}
                                onChange={(v) => updateWhatsApp('notifyAdmin.budget', v)}
                                label="Novos orçamentos"
                            />
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyAdmin.appointment}
                                onChange={(v) => updateWhatsApp('notifyAdmin.appointment', v)}
                                label="Novos agendamentos"
                            />
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyAdmin.contact}
                                onChange={(v) => updateWhatsApp('notifyAdmin.contact', v)}
                                label="Novos contatos"
                            />
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyAdmin.chatbot}
                                onChange={(v) => updateWhatsApp('notifyAdmin.chatbot', v)}
                                label="Recados do chatbot"
                            />
                        </div>
                    )}
                </div>

                {/* Notify Client Toggles */}
                <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <ToggleSwitch
                        enabled={config.whatsapp.notifyClient.enabled}
                        onChange={(v) => updateWhatsApp('notifyClient.enabled', v)}
                        label="Confirmações para Clientes"
                        description="Enviar mensagens de confirmação para clientes"
                        disabled={!config.whatsapp.enabled}
                    />
                    {config.whatsapp.notifyClient.enabled && config.whatsapp.enabled && (
                        <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-2">
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyClient.welcome}
                                onChange={(v) => updateWhatsApp('notifyClient.welcome', v)}
                                label="Mensagem de boas-vindas"
                            />
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyClient.budgetConfirmation}
                                onChange={(v) => updateWhatsApp('notifyClient.budgetConfirmation', v)}
                                label="Confirmação de orçamento"
                            />
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyClient.appointmentConfirmation}
                                onChange={(v) => updateWhatsApp('notifyClient.appointmentConfirmation', v)}
                                label="Confirmação de agendamento"
                            />
                            <ToggleSwitch
                                size="sm"
                                enabled={config.whatsapp.notifyClient.contactConfirmation}
                                onChange={(v) => updateWhatsApp('notifyClient.contactConfirmation', v)}
                                label="Confirmação de contato"
                            />
                        </div>
                    )}
                </div>

                {/* Reminders */}
                <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <ToggleSwitch
                        enabled={config.whatsapp.reminders.enabled}
                        onChange={(v) => updateWhatsApp('reminders.enabled', v)}
                        label="Lembretes de Reunião"
                        description="Enviar lembretes automáticos de agendamentos"
                        disabled={!config.whatsapp.enabled}
                    />

                    {config.whatsapp.reminders.enabled && config.whatsapp.enabled && (
                        <>
                            {/* Days in advance */}
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-gray-600">Antecedência:</label>
                                <select
                                    value={config.whatsapp.reminders.daysInAdvance}
                                    onChange={(e) => updateWhatsApp('reminders.daysInAdvance', parseInt(e.target.value))}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent"
                                >
                                    <option value={1}>1 dia antes</option>
                                    <option value={2}>2 dias antes</option>
                                    <option value={3}>3 dias antes</option>
                                </select>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Client reminders */}
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                                    <ToggleSwitch
                                        size="sm"
                                        enabled={config.whatsapp.reminders.client.enabled}
                                        onChange={(v) => updateWhatsApp('reminders.client.enabled', v)}
                                        label="Lembrete para Cliente"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="time"
                                            value={config.whatsapp.reminders.client.time}
                                            onChange={(e) => updateWhatsApp('reminders.client.time', e.target.value)}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                            disabled={!config.whatsapp.reminders.client.enabled}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {upcomingAppointments} reunião(ões) para envio
                                    </p>
                                    <button
                                        onClick={() => handleExecuteReminders('client')}
                                        disabled={executingReminders !== null}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {executingReminders === 'client' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Executar Agora
                                    </button>
                                </div>

                                {/* Admin reminders */}
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
                                    <ToggleSwitch
                                        size="sm"
                                        enabled={config.whatsapp.reminders.admin.enabled}
                                        onChange={(v) => updateWhatsApp('reminders.admin.enabled', v)}
                                        label="Lembrete para Admin"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="time"
                                            value={config.whatsapp.reminders.admin.time}
                                            onChange={(e) => updateWhatsApp('reminders.admin.time', e.target.value)}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                            disabled={!config.whatsapp.reminders.admin.enabled}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleExecuteReminders('admin')}
                                        disabled={executingReminders !== null}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {executingReminders === 'admin' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Executar Agora
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CollapsibleSection>

            {/* Email Section */}
            <CollapsibleSection
                title="E-mail"
                icon={<Mail className="w-5 h-5 text-blue-600" />}
                badge={config.email.enabled ? 'Ativo' : 'Inativo'}
            >
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <ToggleSwitch
                        enabled={config.email.enabled}
                        onChange={(v) => updateEmail('enabled', v)}
                        label="E-mail Ativo"
                        description="Ativar/desativar TODO o envio de e-mails"
                    />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">
                            As credenciais SMTP são configuradas via variáveis de ambiente no servidor.
                        </p>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Templates Section */}
            <CollapsibleSection
                title="Templates de Mensagens"
                icon={<FileText className="w-5 h-5 text-amber-600" />}
                defaultOpen={false}
            >
                {/* Template Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-4">
                    {[
                        { id: 'whatsapp-client', label: 'WhatsApp Cliente', icon: <User className="w-4 h-4" /> },
                        { id: 'whatsapp-admin', label: 'WhatsApp Admin', icon: <Users className="w-4 h-4" /> },
                        { id: 'email', label: 'E-mail', icon: <Mail className="w-4 h-4" /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTemplateTab(tab.id as typeof activeTemplateTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTemplateTab === tab.id
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Template Editors */}
                <div className="space-y-4">
                    {activeTemplateTab === 'whatsapp-client' && (
                        <>
                            <TemplateEditor
                                templateKey="welcome"
                                label="Boas-vindas"
                                description="Mensagem enviada ao criar conta"
                                variables={['nome']}
                                value={config.whatsapp.templates.welcome}
                                defaultValue={DEFAULT_TEMPLATES.welcome('{{nome}}')}
                                onChange={(v) => updateWhatsApp('templates.welcome', v)}
                            />
                            <TemplateEditor
                                templateKey="budgetConfirmationClient"
                                label="Confirmação de Orçamento"
                                description="Confirmação enviada ao cliente após solicitar orçamento"
                                variables={['nome', 'servicos']}
                                value={config.whatsapp.templates.budgetConfirmationClient}
                                defaultValue={DEFAULT_TEMPLATES.budgetConfirmationClient('{{nome}}', '{{servicos}}')}
                                onChange={(v) => updateWhatsApp('templates.budgetConfirmationClient', v)}
                            />
                            <TemplateEditor
                                templateKey="appointmentConfirmationClient"
                                label="Confirmação de Agendamento"
                                description="Confirmação enviada ao cliente após agendar reunião"
                                variables={['nome', 'tipo', 'data', 'hora']}
                                value={config.whatsapp.templates.appointmentConfirmationClient}
                                defaultValue={DEFAULT_TEMPLATES.appointmentConfirmationClient('{{nome}}', '{{tipo}}', '{{data}}', '{{hora}}')}
                                onChange={(v) => updateWhatsApp('templates.appointmentConfirmationClient', v)}
                            />
                            <TemplateEditor
                                templateKey="contactConfirmationClient"
                                label="Confirmação de Contato"
                                description="Confirmação enviada ao cliente após enviar formulário"
                                variables={['nome']}
                                value={config.whatsapp.templates.contactConfirmationClient}
                                defaultValue={DEFAULT_TEMPLATES.contactConfirmationClient('{{nome}}')}
                                onChange={(v) => updateWhatsApp('templates.contactConfirmationClient', v)}
                            />
                            <TemplateEditor
                                templateKey="reminderClient"
                                label="Lembrete de Reunião"
                                description="Lembrete enviado ao cliente antes da reunião"
                                variables={['nome', 'tipo', 'data', 'hora']}
                                value={config.whatsapp.templates.reminderClient}
                                defaultValue={DEFAULT_TEMPLATES.reminderClient('{{nome}}', '{{tipo}}', '{{data}}', '{{hora}}')}
                                onChange={(v) => updateWhatsApp('templates.reminderClient', v)}
                            />
                        </>
                    )}

                    {activeTemplateTab === 'whatsapp-admin' && (
                        <>
                            <TemplateEditor
                                templateKey="newBudgetAdmin"
                                label="Novo Orçamento"
                                description="Notificação de novo orçamento para admin"
                                variables={['nome', 'cidade', 'servicos']}
                                value={config.whatsapp.templates.newBudgetAdmin}
                                defaultValue={DEFAULT_TEMPLATES.newBudgetAdmin('{{nome}}', '{{cidade}}', '{{servicos}}')}
                                onChange={(v) => updateWhatsApp('templates.newBudgetAdmin', v)}
                            />
                            <TemplateEditor
                                templateKey="newAppointmentAdmin"
                                label="Novo Agendamento"
                                description="Notificação de novo agendamento para admin"
                                variables={['nome', 'tipo', 'data', 'hora']}
                                value={config.whatsapp.templates.newAppointmentAdmin}
                                defaultValue={DEFAULT_TEMPLATES.newAppointmentAdmin('{{nome}}', '{{tipo}}', '{{data}}', '{{hora}}')}
                                onChange={(v) => updateWhatsApp('templates.newAppointmentAdmin', v)}
                            />
                            <TemplateEditor
                                templateKey="newContactAdmin"
                                label="Novo Contato"
                                description="Notificação de nova mensagem de contato"
                                variables={['nome', 'email', 'telefone', 'assunto', 'mensagem']}
                                value={config.whatsapp.templates.newContactAdmin}
                                defaultValue={DEFAULT_TEMPLATES.newContactAdmin('{{nome}}', '{{email}}', '{{telefone}}', '{{assunto}}', '{{mensagem}}')}
                                onChange={(v) => updateWhatsApp('templates.newContactAdmin', v)}
                            />
                            <TemplateEditor
                                templateKey="chatbotNoteAdmin"
                                label="Recado do Chatbot"
                                description="Notificação de recado capturado pelo chatbot"
                                variables={['nome', 'email', 'telefone', 'assunto', 'mensagem']}
                                value={config.whatsapp.templates.chatbotNoteAdmin}
                                defaultValue={DEFAULT_TEMPLATES.chatbotNoteAdmin('{{nome}}', '{{email}}', '{{telefone}}', '{{assunto}}', '{{mensagem}}')}
                                onChange={(v) => updateWhatsApp('templates.chatbotNoteAdmin', v)}
                            />
                            <TemplateEditor
                                templateKey="reminderAdmin"
                                label="Lembrete de Reunião"
                                description="Lembrete enviado ao admin antes da reunião"
                                variables={['nome', 'tipo', 'data', 'hora']}
                                value={config.whatsapp.templates.reminderAdmin}
                                defaultValue={DEFAULT_TEMPLATES.reminderAdmin('{{nome}}', '{{tipo}}', '{{data}}', '{{hora}}')}
                                onChange={(v) => updateWhatsApp('templates.reminderAdmin', v)}
                            />
                        </>
                    )}

                    {activeTemplateTab === 'email' && (
                        <div className="text-center py-8 text-gray-500">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Templates de e-mail seguem o padrão HTML do sistema.</p>
                            <p className="text-sm mt-1">Customização disponível em versões futuras.</p>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            {/* Dispatch Log */}
            <CollapsibleSection
                title="Histórico de Disparos"
                icon={<History className="w-5 h-5 text-gray-600" />}
                defaultOpen={false}
                badge={dispatchLog.length}
            >
                {dispatchLog.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum disparo registrado</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Data/Hora</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Tipo</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Destinatário</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dispatchLog.map(entry => (
                                        <tr key={entry.id}>
                                            <td className="px-3 py-2 text-gray-600">
                                                {new Date(entry.timestamp).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${entry.type === 'whatsapp'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {entry.type === 'whatsapp' ? <MessageSquare className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                                                    {entry.type === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 font-mono text-gray-600">{entry.recipient}</td>
                                            <td className="px-3 py-2">
                                                {entry.status === 'success' ? (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <Check className="w-4 h-4" /> Sucesso
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600" title={entry.error}>
                                                        <X className="w-4 h-4" /> Falha
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={clearLog}
                            className="mt-3 flex items-center gap-2 text-sm text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            Limpar Histórico
                        </button>
                    </>
                )}
            </CollapsibleSection>
        </div>
    );
};

export default DispatchesDashboard;
