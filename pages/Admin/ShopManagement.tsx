import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Plus, Edit2, Trash2, Eye, X, Upload, Loader2, Check, ChevronDown } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { ShopProduct, ShopOrder } from '../../types';
import { supabase } from '../../supabaseClient';
import { ImageCropModal, useImageCropModal } from '../../components/ImageCropModal';

// Upload helper - uses storage-Fran bucket (same as rest of project)
const uploadProductImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `shop-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from('storage-Fran').upload(fileName, file);
    if (error) throw error;

    const { data } = supabase.storage.from('storage-Fran').getPublicUrl(fileName);
    return data.publicUrl;
};

interface ShopManagementProps {
    onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShopManagement: React.FC<ShopManagementProps> = ({ onShowToast }) => {
    const {
        shopProducts,
        shopOrders,
        settings,
        updateSettings,
        persistAllSettings,
        siteContent,
        scheduleSettings,
        fetchShopProducts,
        addShopProduct,
        updateShopProduct,
        deleteShopProduct,
        fetchShopOrders,
        updateShopOrderStatus
    } = useProjects();

    const [activeView, setActiveView] = useState<'products' | 'orders'>('products');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [togglingShop, setTogglingShop] = useState(false);

    // Image crop modal state for product images
    const productCropModal = useImageCropModal();

    // Product form
    const [productForm, setProductForm] = useState({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        status: 'draft' as 'draft' | 'active',
        images: [] as string[]
    });

    // Load data on mount
    useEffect(() => {
        fetchShopProducts();
        fetchShopOrders();
    }, []);

    // Toggle master switch with improved state management
    const handleToggleShop = async () => {
        if (togglingShop) return; // Prevent double-clicks

        setTogglingShop(true);
        const newValue = !settings.enableShop;
        const newSettings = { ...settings, enableShop: newValue };

        try {
            // Update local state first for immediate UI feedback
            updateSettings(newSettings);

            // Persist to database
            const success = await persistAllSettings(siteContent, newSettings, scheduleSettings);
            if (success) {
                onShowToast(newValue ? 'Loja ativada!' : 'Loja desativada!', 'success');
            } else {
                // Rollback on failure
                updateSettings(settings);
                onShowToast('Erro ao salvar configuração.', 'error');
            }
        } catch (error) {
            // Rollback on error
            updateSettings(settings);
            onShowToast('Erro ao salvar configuração.', 'error');
        } finally {
            setTogglingShop(false);
        }
    };

    // Open add product modal
    const handleAddProduct = () => {
        setEditingProduct(null);
        setProductForm({
            title: '',
            description: '',
            price: 0,
            stock: 0,
            category: '',
            status: 'draft',
            images: []
        });
        setShowProductModal(true);
    };

    // Open edit product modal
    const handleEditProduct = (product: ShopProduct) => {
        setEditingProduct(product);
        setProductForm({
            title: product.title,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category,
            status: product.status,
            images: product.images || []
        });
        setShowProductModal(true);
    };

    // Save product
    const handleSaveProduct = async () => {
        if (!productForm.title || productForm.price <= 0) {
            onShowToast('Preencha título e preço.', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingProduct) {
                await updateShopProduct({
                    ...editingProduct,
                    ...productForm
                });
            } else {
                await addShopProduct(productForm);
            }
            setShowProductModal(false);
        } catch (e) {
            onShowToast('Erro ao salvar produto.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Delete product
    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            await deleteShopProduct(id);
        }
    };

    // Handle image upload - opens crop modal
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        // Open crop modal for the first image
        productCropModal.openCropModal(files[0]);
        // Reset input to allow selecting same file again
        e.target.value = '';
    };

    // Handle cropped image from modal
    const handleCroppedImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadProductImage(file);
            setProductForm(prev => ({
                ...prev,
                images: [...prev.images, url]
            }));
            onShowToast('Imagem otimizada e enviada!', 'success');
        } catch (e) {
            onShowToast('Erro ao enviar imagem.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        setProductForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    };

    // Format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Order status colors
    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    const statusLabels: Record<string, string> = {
        pending: 'Pendente',
        paid: 'Pago',
        shipped: 'Enviado',
        completed: 'Concluído',
        cancelled: 'Cancelado'
    };

    return (
        <div className="space-y-6">
            {/* Header with Master Switch */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <ShoppingBag className="w-7 h-7" />
                        Gerenciar Loja
                    </h2>
                    <p className="text-gray-500 mt-1">Gerencie produtos e pedidos da sua loja virtual.</p>
                </div>

                {/* Master Switch */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
                    <div>
                        <span className="font-medium">Loja {settings.enableShop ? 'Ativa' : 'Inativa'}</span>
                        <p className="text-xs text-gray-500">
                            {togglingShop ? 'Salvando...' : settings.enableShop ? 'Visível no site' : 'Oculta do público'}
                        </p>
                    </div>
                    <button
                        onClick={handleToggleShop}
                        disabled={togglingShop}
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${togglingShop ? 'opacity-50 cursor-not-allowed' : ''
                            } ${settings.enableShop ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        <span
                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 flex items-center justify-center ${settings.enableShop ? 'left-7' : 'left-0.5'
                                }`}
                        >
                            {togglingShop && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                        </span>
                    </button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveView('products')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeView === 'products' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Package className="w-4 h-4" />
                    Produtos ({shopProducts.length})
                </button>
                <button
                    onClick={() => setActiveView('orders')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeView === 'orders' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <ShoppingBag className="w-4 h-4" />
                    Pedidos ({shopOrders.length})
                </button>
            </div>

            {/* Products View */}
            {activeView === 'products' && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold">Produtos</h3>
                        <button
                            onClick={handleAddProduct}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Produto
                        </button>
                    </div>

                    {shopProducts.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum produto cadastrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-left text-sm text-gray-600">
                                    <tr>
                                        <th className="p-4">Produto</th>
                                        <th className="p-4">Preço</th>
                                        <th className="p-4">Estoque</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shopProducts.map(product => (
                                        <tr key={product.id} className="border-t hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.images?.[0] ? (
                                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{product.title}</p>
                                                        <p className="text-sm text-gray-500">{product.category || 'Sem categoria'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">{formatPrice(product.price)}</td>
                                            <td className="p-4">
                                                <span className={product.stock === 0 ? 'text-red-500 font-medium' : ''}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {product.status === 'active' ? 'Ativo' : 'Rascunho'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Orders View */}
            {activeView === 'orders' && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="font-bold">Pedidos</h3>
                    </div>

                    {shopOrders.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum pedido recebido.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-left text-sm text-gray-600">
                                    <tr>
                                        <th className="p-4">Pedido</th>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shopOrders.map(order => (
                                        <tr key={order.id} className="border-t hover:bg-gray-50">
                                            <td className="p-4">
                                                <p className="font-medium">#{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-gray-500">{order.items?.length || 0} item(s)</p>
                                            </td>
                                            <td className="p-4 text-sm">{formatDate(order.created_at)}</td>
                                            <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                                            <td className="p-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateShopOrderStatus(order.id, e.target.value as ShopOrder['status'])}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status]}`}
                                                >
                                                    {Object.entries(statusLabels).map(([value, label]) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold">
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h3>
                            <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Título *</label>
                                <input
                                    type="text"
                                    value={productForm.title}
                                    onChange={(e) => setProductForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                    placeholder="Nome do produto"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                                    rows={4}
                                    placeholder="Descrição detalhada do produto"
                                />
                            </div>

                            {/* Price & Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estoque</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                    />
                                </div>
                            </div>

                            {/* Category & Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <input
                                        type="text"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                        placeholder="Ex: Mobiliário, Decoração"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={productForm.status}
                                        onChange={(e) => setProductForm(p => ({ ...p, status: e.target.value as 'draft' | 'active' }))}
                                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                    >
                                        <option value="draft">Rascunho</option>
                                        <option value="active">Ativo (visível na loja)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Imagens</label>
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                    {productForm.images.map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className={`aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition ${uploading ? 'opacity-50' : ''}`}>
                                        {uploading ? (
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-gray-400" />
                                                <span className="text-xs text-gray-500 mt-1">Adicionar</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowProductModal(false)}
                                className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={saving}
                                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Pedido #{selectedOrder.id.slice(0, 8)}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Data</p>
                                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                                        {statusLabels[selectedOrder.status]}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500">Pagamento</p>
                                    <p className="font-medium">{selectedOrder.paymentMethod || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Total</p>
                                    <p className="font-bold text-lg">{formatPrice(selectedOrder.total)}</p>
                                </div>
                            </div>

                            {selectedOrder.shippingAddress && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Endereço de Entrega</p>
                                    <p className="font-medium">
                                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.number}
                                        {selectedOrder.shippingAddress.complement && ` - ${selectedOrder.shippingAddress.complement}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.state}
                                    </p>
                                    <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.zipCode}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-500 mb-2">Itens do Pedido</p>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                                {item.product?.images?.[0] ? (
                                                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-medium">{item.product?.title || 'Produto removido'}</p>
                                                <p className="text-sm text-gray-500">Qtd: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                                            </div>
                                            <p className="font-bold">{formatPrice(item.quantity * item.unitPrice)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Observações</p>
                                    <p>{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Image Crop Modal */}
            <ImageCropModal
                image={productCropModal.imageSource}
                originalFile={productCropModal.selectedFile || undefined}
                isOpen={productCropModal.isOpen}
                onClose={productCropModal.closeCropModal}
                onCropComplete={handleCroppedImageUpload}
                aspect={1}
                cropShape="rect"
                preset="product"
                requireCrop={false}
                title="Ajustar Imagem do Produto"
            />
        </div>
    );
};
