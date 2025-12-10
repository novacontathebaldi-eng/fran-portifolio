import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Check, Loader2, MapPin, CreditCard, MessageCircle, Home, Briefcase, MapPinned, Plus, User, X, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProjects } from '../../context/ProjectContext';
import { Address } from '../../types';

// Address label icons mapping
const getLabelIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('casa') || lowerLabel.includes('home')) return <Home className="w-5 h-5" />;
    if (lowerLabel.includes('trabalho') || lowerLabel.includes('work') || lowerLabel.includes('escritório')) return <Briefcase className="w-5 h-5" />;
    return <MapPinned className="w-5 h-5" />;
};

// Label type for new addresses
type AddressLabelType = 'Casa' | 'Trabalho' | 'Outro';

export const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { currentUser, settings, createShopOrder, showToast, siteContent, addAddress } = useProjects();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp'>('pix');
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Address selection
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddressLabel, setNewAddressLabel] = useState<AddressLabelType>('Casa');
    const [customLabel, setCustomLabel] = useState('');
    const [savingAddress, setSavingAddress] = useState(false);

    // Recipient name
    const [recipientName, setRecipientName] = useState('');

    // Address form for new addresses
    const [address, setAddress] = useState<Address>({
        id: '',
        label: 'Casa',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: ''
    });

    // Redirect if shop disabled or cart empty
    useEffect(() => {
        if (!settings.enableShop) {
            navigate('/', { replace: true });
            return;
        }
        if (cartItems.length === 0 && !orderComplete) {
            navigate('/shop', { replace: true });
        }
    }, [settings.enableShop, cartItems.length, orderComplete, navigate]);

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/auth?redirect=/checkout', { replace: true });
        }
    }, [currentUser, navigate]);

    // Pre-select first address if available
    useEffect(() => {
        if (currentUser?.addresses && currentUser.addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(currentUser.addresses[0].id);
        }
        // Pre-fill recipient name
        if (currentUser?.name && !recipientName) {
            setRecipientName(currentUser.name);
        }
    }, [currentUser]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const handleAddressChange = (field: keyof Address, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    };

    const isAddressValid = () => {
        return address.street && address.number && address.district && address.city && address.state && address.zipCode;
    };

    const getSelectedAddress = (): Address | null => {
        if (!selectedAddressId || !currentUser?.addresses) return null;
        return currentUser.addresses.find(a => a.id === selectedAddressId) || null;
    };

    const handleSaveNewAddress = async () => {
        if (!isAddressValid()) return;

        setSavingAddress(true);
        const labelToSave = newAddressLabel === 'Outro' ? (customLabel || 'Outro') : newAddressLabel;

        const savedAddress = await addAddress({
            label: labelToSave,
            street: address.street,
            number: address.number,
            complement: address.complement,
            district: address.district,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode
        });

        setSavingAddress(false);

        if (savedAddress) {
            setSelectedAddressId(savedAddress.id);
            setShowNewAddressForm(false);
            // Reset form
            setAddress({
                id: '',
                label: 'Casa',
                street: '',
                number: '',
                complement: '',
                district: '',
                city: '',
                state: '',
                zipCode: ''
            });
            showToast('Endereço salvo com sucesso!', 'success');
        }
    };

    const handleSubmitOrder = async () => {
        if (!currentUser || cartItems.length === 0) return;

        const selectedAddr = getSelectedAddress();
        if (!selectedAddr) {
            showToast('Selecione um endereço de entrega.', 'error');
            return;
        }

        if (!recipientName.trim()) {
            showToast('Informe o nome do destinatário.', 'error');
            return;
        }

        setLoading(true);
        try {
            const order = await createShopOrder(
                {
                    userId: currentUser.id,
                    status: 'pending',
                    total: cartTotal,
                    shippingAddress: selectedAddr,
                    paymentMethod: paymentMethod,
                    notes: `Destinatário: ${recipientName} | Pedido via ${paymentMethod === 'pix' ? 'PIX' : 'WhatsApp'}`
                },
                cartItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.product.price
                }))
            );

            if ((import.meta as any).env?.DEV) console.log('💳 PAYMENT: Checkout initiated', { timestamp: new Date().toISOString(), method: paymentMethod });

            if (order) {
                setOrderId(order.id);
                setOrderComplete(true);
                setStep('confirmation');
                clearCart();
            }
        } catch (error) {
            console.error('Error creating order:', error);
            showToast('Erro ao criar pedido. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getWhatsAppLink = () => {
        const phone = siteContent?.office?.phone?.replace(/\D/g, '') || '5527996670426';
        const message = encodeURIComponent(
            `Olá! Acabei de fazer um pedido na loja:\n\n` +
            `🛒 Pedido: ${orderId}\n` +
            `💰 Total: ${formatPrice(cartTotal)}\n\n` +
            `Gostaria de combinar o pagamento e entrega.`
        );
        return `https://wa.me/${phone}?text=${message}`;
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-6 py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                            Pedido Realizado!
                        </h1>
                        <p className="text-gray-600 mb-2">
                            Seu pedido <strong>#{orderId?.slice(0, 8)}</strong> foi registrado com sucesso.
                        </p>
                        <p className="text-gray-500 text-sm mb-8">
                            {paymentMethod === 'pix'
                                ? 'Entre em contato conosco para receber os dados do PIX e confirmação do pedido.'
                                : 'Complete seu pedido através do WhatsApp para combinar pagamento e entrega.'}
                        </p>

                        <div className="space-y-4">
                            {paymentMethod === 'whatsapp' && (
                                <a
                                    href={getWhatsAppLink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    Continuar no WhatsApp
                                </a>
                            )}
                            <Link
                                to="/shop"
                                className="block w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-accent hover:text-black transition"
                            >
                                Voltar à Loja
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    const userAddresses = currentUser?.addresses || [];

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="container mx-auto px-6 py-8">
                {/* Back Link */}
                <Link
                    to="/cart"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar ao Carrinho
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                            Finalizar Pedido
                        </h1>

                        {/* Steps Indicator */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-black' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-black text-white' : 'bg-gray-200'}`}>
                                    1
                                </div>
                                <span className="font-medium">Entrega</span>
                            </div>
                            <div className="flex-grow h-px bg-gray-300"></div>
                            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-black' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-black text-white' : 'bg-gray-200'}`}>
                                    2
                                </div>
                                <span className="font-medium">Pagamento</span>
                            </div>
                        </div>

                        {/* Shipping Step */}
                        {step === 'shipping' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Recipient Name */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <User className="w-6 h-6 text-gray-700" />
                                        <h2 className="text-xl font-bold">Nome do Destinatário</h2>
                                    </div>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            placeholder="Nome completo para entrega"
                                            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                        />
                                        <button
                                            onClick={() => currentUser?.name && setRecipientName(currentUser.name)}
                                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium whitespace-nowrap"
                                        >
                                            Usar meu nome
                                        </button>
                                    </div>
                                </div>

                                {/* Address Selection */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <MapPin className="w-6 h-6 text-gray-700" />
                                        <h2 className="text-xl font-bold">Endereço de Entrega</h2>
                                    </div>

                                    {userAddresses.length > 0 && !showNewAddressForm && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {userAddresses.map(addr => (
                                                <button
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    className={`p-4 rounded-xl border-2 text-left transition ${selectedAddressId === addr.id
                                                        ? 'border-black bg-gray-50'
                                                        : 'border-gray-200 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-gray-600">{getLabelIcon(addr.label)}</span>
                                                        <span className="font-bold">{addr.label}</span>
                                                        {selectedAddressId === addr.id && (
                                                            <Check className="w-4 h-4 text-black ml-auto" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {addr.street}, {addr.number}
                                                        {addr.complement && ` - ${addr.complement}`}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {addr.district} - {addr.city}/{addr.state}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">CEP: {addr.zipCode}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Address Button */}
                                    {!showNewAddressForm && (
                                        <button
                                            onClick={() => setShowNewAddressForm(true)}
                                            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-black hover:text-black transition flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Adicionar Novo Endereço
                                        </button>
                                    )}

                                    {/* New Address Form */}
                                    <AnimatePresence>
                                        {showNewAddressForm && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-t pt-6 mt-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="font-bold text-gray-900">Novo Endereço</h3>
                                                        <button
                                                            onClick={() => setShowNewAddressForm(false)}
                                                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {/* Label Selection */}
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de endereço</label>
                                                        <div className="flex gap-3">
                                                            {(['Casa', 'Trabalho', 'Outro'] as AddressLabelType[]).map(label => (
                                                                <button
                                                                    key={label}
                                                                    onClick={() => setNewAddressLabel(label)}
                                                                    className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition ${newAddressLabel === label
                                                                        ? 'border-black bg-gray-50'
                                                                        : 'border-gray-200 hover:border-gray-400'
                                                                        }`}
                                                                >
                                                                    {label === 'Casa' && <Home className="w-5 h-5" />}
                                                                    {label === 'Trabalho' && <Briefcase className="w-5 h-5" />}
                                                                    {label === 'Outro' && <MapPinned className="w-5 h-5" />}
                                                                    <span className="text-sm font-medium">{label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {newAddressLabel === 'Outro' && (
                                                            <input
                                                                type="text"
                                                                value={customLabel}
                                                                onChange={(e) => setCustomLabel(e.target.value)}
                                                                placeholder="Nome do endereço (ex: Casa da Praia)"
                                                                className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Address Fields */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                                                            <input
                                                                type="text"
                                                                value={address.zipCode}
                                                                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                                                placeholder="00000-000"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                                                            <input
                                                                type="text"
                                                                value={address.street}
                                                                onChange={(e) => handleAddressChange('street', e.target.value)}
                                                                placeholder="Nome da rua"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                                                            <input
                                                                type="text"
                                                                value={address.number}
                                                                onChange={(e) => handleAddressChange('number', e.target.value)}
                                                                placeholder="123"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                                            <input
                                                                type="text"
                                                                value={address.complement || ''}
                                                                onChange={(e) => handleAddressChange('complement', e.target.value)}
                                                                placeholder="Apto, bloco, etc."
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                                                            <input
                                                                type="text"
                                                                value={address.district}
                                                                onChange={(e) => handleAddressChange('district', e.target.value)}
                                                                placeholder="Bairro"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                                                            <input
                                                                type="text"
                                                                value={address.city}
                                                                onChange={(e) => handleAddressChange('city', e.target.value)}
                                                                placeholder="Cidade"
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                                                            <input
                                                                type="text"
                                                                value={address.state}
                                                                onChange={(e) => handleAddressChange('state', e.target.value)}
                                                                placeholder="UF"
                                                                maxLength={2}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleSaveNewAddress}
                                                        disabled={!isAddressValid() || savingAddress}
                                                        className="mt-6 w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-accent hover:text-black transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {savingAddress ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                Salvando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="w-5 h-5" />
                                                                Salvar e Usar Este Endereço
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => setStep('payment')}
                                    disabled={!selectedAddressId || !recipientName.trim()}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-accent hover:text-black transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Continuar para Pagamento
                                </button>
                            </motion.div>
                        )}

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard className="w-6 h-6 text-gray-700" />
                                    <h2 className="text-xl font-bold">Método de Pagamento</h2>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setPaymentMethod('pix')}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition ${paymentMethod === 'pix'
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-lg">PIX</span>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Pagamento instantâneo. Você receberá os dados após confirmar o pedido.
                                                </p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pix' ? 'border-black bg-black' : 'border-gray-300'
                                                }`}>
                                                {paymentMethod === 'pix' && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('whatsapp')}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition ${paymentMethod === 'whatsapp'
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-lg">WhatsApp</span>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Combine pagamento e entrega diretamente pelo WhatsApp.
                                                </p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'whatsapp' ? 'border-black bg-black' : 'border-gray-300'
                                                }`}>
                                                {paymentMethod === 'whatsapp' && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={loading}
                                        className="flex-1 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-accent hover:text-black transition disabled:bg-gray-300 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            'Confirmar Pedido'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>

                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.product.id} className="flex gap-3">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            {item.product.images?.[0] ? (
                                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium text-sm line-clamp-1">{item.product.title}</p>
                                            <p className="text-gray-500 text-xs">Qtd: {item.quantity}</p>
                                            <p className="font-bold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Selected Address Preview */}
                            {selectedAddressId && getSelectedAddress() && (
                                <div className="border-t pt-4 mb-4">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Entregar para:</p>
                                    <p className="text-sm font-medium">{recipientName || 'Não informado'}</p>
                                    <p className="text-xs text-gray-500">
                                        {getSelectedAddress()?.street}, {getSelectedAddress()?.number} - {getSelectedAddress()?.city}/{getSelectedAddress()?.state}
                                    </p>
                                </div>
                            )}

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Frete</span>
                                    <span className="text-green-600">A combinar</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
