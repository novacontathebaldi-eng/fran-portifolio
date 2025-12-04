// Budget System Types - Sistema CRM de Orçamentos
// Este arquivo contém todas as interfaces específicas do sistema de orçamentos

export interface Service {
    id: string;
    category: string;
    name: string;
    description?: string;
    orderIndex: number;
    active: boolean;
    createdAt: string;
}

export interface BudgetRequest {
    id: string;
    clientId?: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    projectLocationFull: string;
    projectCity: string;
    projectState: string;
    observations?: string;
    services?: Service[]; // Populated from budget_request_items
    status: 'pending' | 'analyzing' | 'quoted' | 'completed' | 'cancelled';
    createdAt: string;
}

export interface BudgetRequestItem {
    id: string;
    budgetRequestId: string;
    serviceId: string;
    createdAt: string;
}

export interface BudgetAttachment {
    id: string;
    budgetRequestId: string;
    fileName: string;
    fileType: 'pdf' | 'image' | 'document' | 'other';
    fileUrl: string;
    fileSize?: number;
    uploadedBy?: string;
    uploadedAt: string;
    description?: string;
}

export interface BudgetNote {
    id: string;
    budgetRequestId: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface BudgetHistoryEntry {
    id: string;
    budgetRequestId: string;
    actionType: 'created' | 'status_changed' | 'note_added' | 'file_attached' | 'linked_to_client' | 'client_created' | 'other';
    description: string;
    performedBy?: string;
    performedByName?: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

// Helper type for status badges
export type BudgetStatus = BudgetRequest['status'];

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
    pending: 'Pendente',
    analyzing: 'Em Análise',
    quoted: 'Orçado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
};

export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    analyzing: 'bg-blue-100 text-blue-800',
    quoted: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
};
