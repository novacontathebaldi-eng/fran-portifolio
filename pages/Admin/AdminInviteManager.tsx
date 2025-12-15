import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { useProjects } from '../../context/ProjectContext';
import {
    Plus, Copy, Link2, Trash2, RefreshCw, Folder, FileText,
    CheckCircle, Clock, X, Upload, Loader2, ExternalLink,
    ChevronDown, ChevronUp, Eye, Users
} from 'lucide-react';

// Types
interface ClientInvite {
    id: string;
    code: string;
    internal_name: string;
    status: 'pending' | 'claimed' | 'expired';
    claimed_by: string | null;
    claimed_at: string | null;
    expires_at: string | null;
    created_at: string;
    // Populated fields
    folders?: InviteFolder[];
    claimedByProfile?: { name: string; email: string } | null;
}

interface InviteFolder {
    id: string;
    name: string;
    files: InviteFile[];
}

interface InviteFile {
    id: string;
    name: string;
    url: string;
    type: string;
    size: string;
}

// Generate unique invite code
const generateCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'FRAN-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Upload helper
const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `client-files/${fileName}`;

    const { error } = await supabase.storage
        .from('storage-Fran')
        .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
        .from('storage-Fran')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const AdminInviteManager: React.FC = () => {
    const { showToast } = useProjects();

    // State
    const [invites, setInvites] = useState<ClientInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedInvite, setExpandedInvite] = useState<string | null>(null);

    // Create Form State
    const [formData, setFormData] = useState({
        internalName: '',
        folders: [] as { name: string; files: File[] }[],
    });
    const [newFolderName, setNewFolderName] = useState('');
    const [uploadingFolder, setUploadingFolder] = useState<number | null>(null);

    // Fetch invites
    const fetchInvites = async () => {
        setLoading(true);
        try {
            // Fetch invites
            const { data: invitesData, error: invitesError } = await supabase
                .from('client_invites')
                .select('*')
                .order('created_at', { ascending: false });

            if (invitesError) throw invitesError;

            // Fetch folders for each invite
            const invitesWithData: ClientInvite[] = await Promise.all(
                (invitesData || []).map(async (invite) => {
                    // Get folders
                    const { data: folders } = await supabase
                        .from('client_folders')
                        .select('*, files:client_files(*)')
                        .eq('invite_id', invite.id);

                    // Get claimed by profile
                    let claimedByProfile = null;
                    if (invite.claimed_by) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('name, email')
                            .eq('id', invite.claimed_by)
                            .single();
                        claimedByProfile = profile;
                    }

                    return {
                        ...invite,
                        folders: folders?.map(f => ({
                            id: f.id,
                            name: f.name,
                            files: f.files || []
                        })) || [],
                        claimedByProfile
                    };
                })
            );

            setInvites(invitesWithData);
        } catch (error) {
            console.error('Error fetching invites:', error);
            showToast('Erro ao carregar convites', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvites();
    }, []);

    // Add folder to form
    const addFolder = () => {
        if (!newFolderName.trim()) return;
        setFormData(prev => ({
            ...prev,
            folders: [...prev.folders, { name: newFolderName.trim(), files: [] }]
        }));
        setNewFolderName('');
    };

    // Remove folder from form
    const removeFolder = (index: number) => {
        setFormData(prev => ({
            ...prev,
            folders: prev.folders.filter((_, i) => i !== index)
        }));
    };

    // Add files to folder
    const handleFileSelect = (folderIndex: number, files: FileList | null) => {
        if (!files) return;
        setFormData(prev => ({
            ...prev,
            folders: prev.folders.map((folder, i) =>
                i === folderIndex
                    ? { ...folder, files: [...folder.files, ...Array.from(files)] }
                    : folder
            )
        }));
    };

    // Remove file from folder
    const removeFile = (folderIndex: number, fileIndex: number) => {
        setFormData(prev => ({
            ...prev,
            folders: prev.folders.map((folder, i) =>
                i === folderIndex
                    ? { ...folder, files: folder.files.filter((_, fi) => fi !== fileIndex) }
                    : folder
            )
        }));
    };

    // Create invite
    const createInvite = async () => {
        if (!formData.internalName.trim()) {
            showToast('Digite um nome para referência', 'error');
            return;
        }

        setCreating(true);
        try {
            const code = generateCode();

            // 1. Create invite
            const { data: invite, error: inviteError } = await supabase
                .from('client_invites')
                .insert({
                    code,
                    internal_name: formData.internalName.trim(),
                    status: 'pending'
                })
                .select()
                .single();

            if (inviteError) throw inviteError;

            // 2. Create folders and upload files
            for (let i = 0; i < formData.folders.length; i++) {
                const folder = formData.folders[i];
                setUploadingFolder(i);

                // Create folder with invite_id (no user_id)
                const { data: newFolder, error: folderError } = await supabase
                    .from('client_folders')
                    .insert({
                        name: folder.name,
                        invite_id: invite.id,
                        user_id: null
                    })
                    .select()
                    .single();

                if (folderError) throw folderError;

                // Upload files
                for (const file of folder.files) {
                    const url = await uploadToSupabase(file);
                    await supabase
                        .from('client_files')
                        .insert({
                            folder_id: newFolder.id,
                            name: file.name,
                            url,
                            type: file.type,
                            size: `${(file.size / 1024).toFixed(1)} KB`
                        });
                }
            }

            showToast('Convite criado com sucesso!', 'success');
            setShowCreateForm(false);
            setFormData({ internalName: '', folders: [] });
            fetchInvites();

        } catch (error) {
            console.error('Error creating invite:', error);
            showToast('Erro ao criar convite', 'error');
        } finally {
            setCreating(false);
            setUploadingFolder(null);
        }
    };

    // Delete invite
    const deleteInvite = async (id: string) => {
        if (!confirm('Excluir este convite? Os arquivos associados também serão removidos.')) return;

        try {
            const { error } = await supabase
                .from('client_invites')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Convite excluído', 'success');
            fetchInvites();
        } catch (error) {
            console.error('Error deleting invite:', error);
            showToast('Erro ao excluir convite', 'error');
        }
    };

    // Regenerate code
    const regenerateCode = async (id: string) => {
        try {
            const newCode = generateCode();
            const { error } = await supabase
                .from('client_invites')
                .update({ code: newCode })
                .eq('id', id);

            if (error) throw error;

            showToast('Código regenerado', 'success');
            fetchInvites();
        } catch (error) {
            console.error('Error regenerating code:', error);
            showToast('Erro ao regenerar código', 'error');
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copiado!`, 'success');
    };

    // Get claim link
    const getClaimLink = (code: string) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/#/claim/${code}`;
    };

    // Stats
    const stats = useMemo(() => ({
        total: invites.length,
        pending: invites.filter(i => i.status === 'pending').length,
        claimed: invites.filter(i => i.status === 'claimed').length,
    }), [invites]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif">Convites de Clientes</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Crie áreas personalizadas para novos clientes
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
                >
                    <Plus className="w-4 h-4" />
                    Criar Convite
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                    <div className="text-sm text-gray-500">Pendentes</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.claimed}</div>
                    <div className="text-sm text-gray-500">Resgatados</div>
                </div>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h3 className="text-xl font-serif">Novo Convite</h3>
                            <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Internal Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome do Cliente (referência interna)
                                </label>
                                <input
                                    type="text"
                                    value={formData.internalName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, internalName: e.target.value }))}
                                    placeholder="Ex: João Silva - Projeto Apartamento"
                                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            {/* Folders */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pastas e Arquivos (opcional)
                                </label>

                                {/* Add folder */}
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="Nome da pasta"
                                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        onKeyDown={(e) => e.key === 'Enter' && addFolder()}
                                    />
                                    <button
                                        onClick={addFolder}
                                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Folder list */}
                                <div className="space-y-4">
                                    {formData.folders.map((folder, folderIndex) => (
                                        <div key={folderIndex} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Folder className="w-5 h-5 text-amber-500" />
                                                    <span className="font-medium">{folder.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeFolder(folderIndex)}
                                                    className="p-1 hover:bg-red-50 rounded text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Files */}
                                            <div className="space-y-2 mb-3">
                                                {folder.files.map((file, fileIndex) => (
                                                    <div key={fileIndex} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="truncate">{file.name}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFile(folderIndex, fileIndex)}
                                                            className="p-1 hover:bg-red-100 rounded text-red-500 flex-shrink-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Upload button */}
                                            <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg py-3 cursor-pointer hover:border-black transition">
                                                <Upload className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-500">Adicionar arquivos</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(e) => handleFileSelect(folderIndex, e.target.files)}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {formData.folders.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        Nenhuma pasta adicionada. O cliente receberá uma área vazia.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3">
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 py-3 border rounded-full hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createInvite}
                                disabled={creating || !formData.internalName.trim()}
                                className="flex-1 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {uploadingFolder !== null ? `Enviando pasta ${uploadingFolder + 1}...` : 'Criando...'}
                                    </>
                                ) : (
                                    'Gerar Convite'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invites List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : invites.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Nenhum convite criado ainda</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4 text-black underline"
                    >
                        Criar primeiro convite
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {invites.map((invite) => (
                        <div
                            key={invite.id}
                            className={`border rounded-xl overflow-hidden ${invite.status === 'claimed' ? 'bg-green-50/50' : 'bg-white'
                                }`}
                        >
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${invite.status === 'claimed' ? 'bg-green-100' : 'bg-amber-100'
                                        }`}>
                                        {invite.status === 'claimed' ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{invite.internal_name}</div>
                                        <div className="text-sm text-gray-500">
                                            {invite.status === 'claimed' && invite.claimedByProfile ? (
                                                <span className="text-green-600">
                                                    Resgatado por {invite.claimedByProfile.name || invite.claimedByProfile.email}
                                                </span>
                                            ) : (
                                                <span>Criado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {invite.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => copyToClipboard(invite.code, 'Código')}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                                                title="Copiar código"
                                            >
                                                <Copy className="w-4 h-4" />
                                                {invite.code}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(getClaimLink(invite.code), 'Link')}
                                                className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                                                title="Copiar link"
                                            >
                                                <Link2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setExpandedInvite(expandedInvite === invite.id ? null : invite.id)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        {expandedInvite === invite.id ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedInvite === invite.id && (
                                <div className="px-4 pb-4 border-t pt-4 space-y-4">
                                    {/* Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Código:</span>
                                            <span className="ml-2 font-mono">{invite.code}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Status:</span>
                                            <span className={`ml-2 ${invite.status === 'claimed' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {invite.status === 'claimed' ? 'Resgatado' : 'Pendente'}
                                            </span>
                                        </div>
                                        {invite.claimed_at && (
                                            <div>
                                                <span className="text-gray-500">Resgatado em:</span>
                                                <span className="ml-2">{new Date(invite.claimed_at).toLocaleString('pt-BR')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Folders */}
                                    {invite.folders && invite.folders.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Pastas incluídas:</h4>
                                            <div className="space-y-2">
                                                {invite.folders.map(folder => (
                                                    <div key={folder.id} className="bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Folder className="w-4 h-4 text-amber-500" />
                                                            <span className="font-medium text-sm">{folder.name}</span>
                                                            <span className="text-xs text-gray-400">({folder.files.length} arquivos)</span>
                                                        </div>
                                                        {folder.files.length > 0 && (
                                                            <div className="ml-6 space-y-1">
                                                                {folder.files.map(file => (
                                                                    <div key={file.id} className="flex items-center gap-2 text-sm text-gray-600">
                                                                        <FileText className="w-3 h-3" />
                                                                        <span className="truncate">{file.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {invite.status === 'pending' && (
                                        <div className="flex gap-2 pt-2 border-t">
                                            <button
                                                onClick={() => regenerateCode(invite.id)}
                                                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Regenerar Código
                                            </button>
                                            <a
                                                href={getClaimLink(invite.code)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Testar Link
                                            </a>
                                            <button
                                                onClick={() => deleteInvite(invite.id)}
                                                className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition ml-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
