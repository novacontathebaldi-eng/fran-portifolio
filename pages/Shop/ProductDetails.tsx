import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useCart } from '../../context/CartContext';
import { ShopProduct } from '../../types';

export const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { shopProducts, fetchShopProducts, settings, isLoadingData } = useProjects();
    const { addToCart, isInCart, getItemQuantity } = useCart();

    const [product, setProduct] = useState<ShopProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    // Redirect if shop is disabled
    useEffect(() => {
        if (!isLoadingData && !settings.enableShop) {
            navigate('/', { replace: true });
        }
    }, [settings.enableShop, isLoadingData, navigate]);

    const [fetchAttempted, setFetchAttempted] = useState(false);

    // Fetch products with timeout protection
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const loadProduct = async () => {
            try {
                if (shopProducts.length === 0) {
                    await fetchShopProducts();
                }
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            } finally {
                setFetchAttempted(true);
                setLoading(false);
            }
        };

        // Safety timeout - ensure loading ends after 5 seconds max
        timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('[ProductDetails] Timeout: Forçando fim do loading');
                setFetchAttempted(true);
                setLoading(false);
            }
        }, 5000);

        loadProduct();

        return () => clearTimeout(timeoutId);
    }, []);

    // Find product when products are loaded - only after fetch was attempted
    useEffect(() => {
        if (!loading && fetchAttempted && id) {
            const found = shopProducts.find(p => p.id === id);
            if (found && found.status === 'active') {
                setProduct(found);
            } else if (shopProducts.length > 0 || fetchAttempted) {
                // Product not found or inactive - only redirect after we confirmed fetch completed
                navigate('/shop', { replace: true });
            }
        }
    }, [loading, fetchAttempted, shopProducts, id, navigate]);

    const handleAddToCart = () => {
        if (product && product.stock > 0) {
            addToCart(product, quantity);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const nextImage = () => {
        if (product && product.images.length > 0) {
            setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
        }
    };

    const prevImage = () => {
        if (product && product.images.length > 0) {
            setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    };

    if (loading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const currentQtyInCart = getItemQuantity(product.id);
    const maxAddable = product.stock - currentQtyInCart;

    return (
        <div className="min-h-screen bg-white pt-20">
            <div className="container mx-auto px-6 py-8">
                {/* Back Button - uses navigate(-1) to preserve scroll */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Voltar à Loja</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Main Image */}
                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImageIndex]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-24 h-24 text-gray-300" />
                                </div>
                            )}

                            {/* Navigation Arrows */}
                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${selectedImageIndex === index ? 'border-black' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col"
                    >
                        {product.category && (
                            <span className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                                {product.category}
                            </span>
                        )}

                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                            {product.title}
                        </h1>

                        <p className="text-3xl font-bold text-black mb-6">
                            {formatPrice(product.price)}
                        </p>

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.stock === 0 ? (
                                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                    Esgotado
                                </span>
                            ) : product.stock <= 5 ? (
                                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                    Apenas {product.stock} em estoque
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    Em estoque
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="prose prose-gray mb-8">
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Quantity Selector */}
                        {product.stock > 0 && (
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:bg-gray-100 transition"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="px-4 py-2 font-medium min-w-[50px] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(maxAddable, quantity + 1))}
                                        className="p-2 hover:bg-gray-100 transition"
                                        disabled={quantity >= maxAddable}
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                {currentQtyInCart > 0 && (
                                    <span className="text-sm text-gray-500">
                                        ({currentQtyInCart} já no carrinho)
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || maxAddable <= 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 ${addedToCart
                                ? 'bg-green-500 text-white'
                                : product.stock === 0 || maxAddable <= 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-accent hover:text-black'
                                }`}
                        >
                            {addedToCart ? (
                                <>
                                    <Check className="w-6 h-6" />
                                    Adicionado ao Carrinho!
                                </>
                            ) : product.stock === 0 ? (
                                'Produto Esgotado'
                            ) : maxAddable <= 0 ? (
                                'Máximo no Carrinho'
                            ) : (
                                <>
                                    <ShoppingBag className="w-6 h-6" />
                                    Adicionar ao Carrinho
                                </>
                            )}
                        </button>

                        {/* Go to Cart */}
                        {isInCart(product.id) && (
                            <Link
                                to="/cart"
                                className="mt-4 w-full py-3 border-2 border-black text-black font-bold rounded-xl text-center hover:bg-black hover:text-white transition"
                            >
                                Ver Carrinho
                            </Link>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
