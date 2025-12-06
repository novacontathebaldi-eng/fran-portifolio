import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Eye, X, RefreshCw, MessageCircle, Mail, AlertTriangle, Check, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { ShopOrder, ShopOrderItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface ClientOrdersViewProps {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    clientId: string;
}

// Status configurations
const statusConfig: Record<string, { label: string; color: string; bgColor: string; step: number }> = {
    pending: { label: 'Aguardando Pagamento', color: 'text-yellow-700', bgColor: 'bg-yellow-100', step: 1 },
    paid: { label: 'Pagamento Confirmado', color: 'text-blue-700', bgColor: 'bg-blue-100', step: 2 },
    shipped: { label: 'Enviado', color: 'text-purple-700', bgColor: 'bg-purple-100', step: 3 },
    completed: { label: 'Concluído', color: 'text-green-700', bgColor: 'bg-green-100', step: 4 },
    cancelled: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100', step: 0 }
};

const steps = [
    { key: 'pending', label: 'Aguardando', shortLabel: 'Aguardando' },
    { key: 'paid', label: 'Pago', shortLabel: 'Pago' },
    { key: 'shipped', label: 'Enviado', shortLabel: 'Enviado' },
    { key: 'completed', label: 'Entregue', shortLabel: 'Entregue' }
];

export const ClientOrdersView: React.FC<ClientOrdersViewProps> = ({ showToast, clientId }) => {
    const { settings, siteContent, updateShopOrderStatus, fetchShopProducts, shopProducts } = useProjects();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [showSupportModal, setShowSupportModal] = useState<ShopOrder | null>(null);
    const [supportMessage, setSupportMessage] = useState('');
    const [sendingSupport, setSendingSupport] = useState(false);

    // Fetch client orders
    useEffect(() => {
        fetchOrders();
        fetchShopProducts();
    }, [clientId]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('shop_orders')
                .select(`
                    *,
                    items:shop_order_items(
                        *,
                        product:shop_products(*)
                    )
                `)
                .eq('user_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match our type
            const transformedOrders: ShopOrder[] = (data || []).map(order => ({
                ...order,
                userId: order.user_id,
                shippingAddress: order.shipping_address,
                paymentMethod: order.payment_method,
                items: order.items?.map((item: any) => ({
                    ...item,
                    orderId: item.order_id,
                    productId: item.product_id,
                    unitPrice: item.unit_price
                }))
            }));

            setOrders(transformedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('Erro ao carregar pedidos.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Cancel order
    const handleCancelOrder = async (orderId: string) => {
        setCancellingOrderId(orderId);
        try {
            const { error } = await supabase
                .from('shop_orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId);

            if (error) throw error;

            // Update local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
            showToast('Pedido cancelado com sucesso.', 'success');

            // TODO: Ideally restore stock here
        } catch (error) {
            showToast('Erro ao cancelar pedido.', 'error');
        } finally {
            setCancellingOrderId(null);
        }
    };

    // Buy again - add items to cart
    const handleBuyAgain = (order: ShopOrder) => {
        if (!order.items?.length) {
            showToast('Nenhum item encontrado neste pedido.', 'error');
            return;
        }

        let addedCount = 0;
        order.items.forEach(item => {
            if (item.product) {
                // item.product is already a ShopProduct from the nested query
                addToCart(item.product, item.quantity);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            showToast(`${addedCount} item(s) adicionado(s) ao carrinho!`, 'success');
        }
    };

    // Open WhatsApp with pre-filled message
    const handleWhatsAppSupport = (order: ShopOrder) => {
        const phone = siteContent?.office?.whatsapp || '5511999999999';
        const message = encodeURIComponent(
            `Olá, preciso de ajuda com o meu pedido #${order.id.slice(0, 8).toUpperCase()} feito no site Fran Siller Arquitetura.\n\nDetalhes:\n- Data: ${formatDate(order.created_at)}\n- Total: ${formatPrice(order.total)}\n- Status: ${statusConfig[order.status]?.label || order.status}`
        );
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    // Send support message (simulated - saves to admin notes)
    const handleSendSupport = async () => {
        if (!showSupportModal || !supportMessage.trim()) return;

        setSendingSupport(true);
        try {
            // Save as admin note for the shop team to see
            const { error } = await supabase.from('admin_notes').insert({
                title: `Suporte Pedido #${showSupportModal.id.slice(0, 8).toUpperCase()}`,
                content: supportMessage,
                type: 'support_request',
                metadata: {
                    orderId: showSupportModal.id,
                    clientId: clientId,
                    orderTotal: showSupportModal.total,
                    orderStatus: showSupportModal.status
                }
            });

            if (error) throw error;

            showToast('Mensagem enviada! Nossa equipe responderá em breve.', 'success');
            setShowSupportModal(null);
            setSupportMessage('');
        } catch (error) {
            showToast('Erro ao enviar mensagem. Tente via WhatsApp.', 'error');
        } finally {
            setSendingSupport(false);
        }
    };

    // Helpers
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Empty state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">Nenhum pedido ainda</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Você ainda não fez nenhuma compra. Explore nossa loja e encontre produtos exclusivos!
                </p>
                {settings.enableShop && (
                    <button
                        onClick={() => navigate('/shop')}
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-accent hover:text-black transition"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Visitar a Loja
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-serif">Meus Pedidos</h2>
                    <p className="text-gray-500 text-sm mt-1">Acompanhe suas compras e solicite suporte.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.map(order => {
                    const isExpanded = expandedOrderId === order.id;
                    const config = statusConfig[order.status] || statusConfig.pending;
                    const isCancelled = order.status === 'cancelled';
                    const canCancel = order.status === 'pending';

                    return (
                        <motion.div
                            key={order.id}
                            layout
                            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                        >
                            {/* Order Header */}
                            <div
                                className="p-4 sm:p-5 cursor-pointer"
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    {/* Left: Order info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.bgColor} ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {formatDate(order.created_at)} • {order.items?.length || 0} item(s)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Total and expand */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 90 : 0 }}
                                            className="text-gray-400"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 sm:px-5 pb-5 border-t border-gray-100 pt-5 space-y-6">
                                            {/* Status Stepper (only for non-cancelled) */}
                                            {!isCancelled && (
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <p className="text-xs font-bold uppercase text-gray-500 mb-4">Status do Pedido</p>
                                                    <div className="flex items-center justify-between relative">
                                                        {/* Progress line */}
                                                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
                                                            <div
                                                                className="h-full bg-black rounded-full transition-all duration-500"
                                                                style={{ width: `${((config.step - 1) / (steps.length - 1)) * 100}%` }}
                                                            />
                                                        </div>

                                                        {steps.map((step, idx) => {
                                                            const isComplete = config.step > idx + 1;
                                                            const isCurrent = config.step === idx + 1;
                                                            return (
                                                                <div key={step.key} className="relative z-10 flex flex-col items-center">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isComplete ? 'bg-black text-white' :
                                                                        isCurrent ? 'bg-black text-white ring-4 ring-black/20' :
                                                                            'bg-gray-200 text-gray-500'
                                                                        }`}>
                                                                        {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
                                                                    </div>
                                                                    <span className={`text-[10px] sm:text-xs mt-2 font-medium ${isCurrent ? 'text-black font-bold' : 'text-gray-500'
                                                                        }`}>
                                                                        {step.shortLabel}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Order Items */}
                                            <div>
                                                <p className="text-xs font-bold uppercase text-gray-500 mb-3">Itens do Pedido</p>
                                                <div className="space-y-3">
                                                    {order.items?.map(item => (
                                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                            <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                                                {item.product?.images?.[0] ? (
                                                                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <p className="font-medium truncate">{item.product?.title || 'Produto removido'}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    Qtd: {item.quantity} × {formatPrice(item.unitPrice)}
                                                                </p>
                                                            </div>
                                                            <p className="font-bold shrink-0">{formatPrice(item.quantity * item.unitPrice)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            {order.shippingAddress && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">Endereço de Entrega</p>
                                                    <p className="text-sm font-medium">
                                                        {order.shippingAddress.street}, {order.shippingAddress.number}
                                                        {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {order.shippingAddress.district}, {order.shippingAddress.city} - {order.shippingAddress.state}
                                                    </p>
                                                    <p className="text-sm text-gray-500">CEP: {order.shippingAddress.zipCode}</p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-3 pt-2">
                                                {/* WhatsApp Support */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleWhatsAppSupport(order); }}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    Falar sobre este pedido
                                                </button>

                                                {/* Email Support */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowSupportModal(order); }}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    Informar Problema
                                                </button>

                                                {/* Buy Again */}
                                                {!isCancelled && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleBuyAgain(order); }}
                                                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Comprar Novamente
                                                    </button>
                                                )}

                                                {/* Cancel Order */}
                                                {canCancel && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) {
                                                                handleCancelOrder(order.id);
                                                            }
                                                        }}
                                                        disabled={cancellingOrderId === order.id}
                                                        className="flex items-center gap-2 px-4 py-2.5 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 transition disabled:opacity-50"
                                                    >
                                                        {cancellingOrderId === order.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <X className="w-4 h-4" />
                                                        )}
                                                        Cancelar Pedido
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Support Modal */}
            <AnimatePresence>
                {showSupportModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-5 border-b flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">Informar Problema</h3>
                                    <p className="text-sm text-gray-500">Pedido #{showSupportModal.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <button onClick={() => setShowSupportModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-yellow-800">Dica</p>
                                        <p className="text-yellow-700">Para respostas mais rápidas, use o botão "Falar pelo WhatsApp".</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-2">Descreva o problema</label>
                                    <textarea
                                        value={supportMessage}
                                        onChange={(e) => setSupportMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Conte-nos o que aconteceu..."
                                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-5 border-t bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => handleWhatsAppSupport(showSupportModal)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Via WhatsApp
                                </button>
                                <button
                                    onClick={handleSendSupport}
                                    disabled={!supportMessage.trim() || sendingSupport}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50"
                                >
                                    {sendingSupport ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Mail className="w-4 h-4" />
                                    )}
                                    Enviar Mensagem
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
