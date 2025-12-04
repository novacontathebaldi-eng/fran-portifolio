// Quick fix patch: Replace lines 497-513 in BudgetRequestDetail.tsx with this code:

<div className="space-y-4">
    {history.map(entry => {
        const IconComponent = ACTION_TYPE_ICONS[entry.actionType];
        return (
            <div key={entry.id} className="flex gap-3">
                <div className="text-gray-600">
                    <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleString('pt-BR')}
                        {entry.performedByName && ` • ${entry.performedByName}`}
                    </p>
                </div>
            </div>
        );
    })}
    {history.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">Nenhum histórico</p>
    )}
</div>
