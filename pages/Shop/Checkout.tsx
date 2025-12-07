import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Check, Loader2, MapPin, CreditCard, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProjects } from '../../context/ProjectContext';
import { Address } from '../../types';

export const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { currentUser, settings, createShopOrder, showToast, siteContent } = useProjects();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp'>('pix');
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Address form
    const [address, setAddress] = useState<Address>({
        id: '',
        label: 'Entrega',
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

    // Pre-fill address from user if available
    useEffect(() => {
        if (currentUser?.addresses && currentUser.addresses.length > 0) {
            setAddress(currentUser.addresses[0]);
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

    const handleSubmitOrder = async () => {
        if (!currentUser || cartItems.length === 0) return;

        setLoading(true);
        try {
            const order = await createShopOrder(
                {
                    userId: currentUser.id,
                    status: 'pending',
                    total: cartTotal,
                    shippingAddress: address,
                    paymentMethod: paymentMethod,
                    notes: `Pedido via ${paymentMethod === 'pix' ? 'PIX' : 'WhatsApp'}`
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
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin className="w-6 h-6 text-gray-700" />
                                    <h2 className="text-xl font-bold">Endereço de Entrega</h2>
                                </div>

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
                                    onClick={() => setStep('payment')}
                                    disabled={!isAddressValid()}
                                    className="mt-8 w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-accent hover:text-black transition disabled:bg-gray-300 disabled:cursor-not-allowed"
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
