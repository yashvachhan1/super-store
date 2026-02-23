"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, User, Star, ArrowLeft, Heart, Share2, ShieldCheck, Truck, RefreshCw, Loader2, Plus, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";

interface Variant {
  id: string;
  combination: Record<string, string>;
  price: number;
  stock: number;
  sku: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  description: string;
  shortDescription: string;
  images: string[];
  type: 'simple' | 'variable';
  variants?: Variant[];
  attributes?: { name: string; values: string[] }[];
  isMatrixSwapped?: boolean;
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cart, addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const { id: _, ...rest } = data;
          setProduct({ id: docSnap.id, ...rest } as Product);

          // Fetch related
          const q = query(
            collection(db, "products"),
            where("category", "==", data.category),
            limit(4)
          );
          const relatedSnap = await getDocs(q);
          setRelatedProducts(relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Product))
            .filter(p => p.id !== docSnap.id)
          );
        } else {
          router.push('/shop');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleAddToCart = (variant?: Variant) => {
    if (!product) return;

    const itemToAdd = {
      id: variant ? variant.id : product.id,
      title: product.name,
      price: variant ? variant.price : product.price,
      img: variant?.image || product.images[0] || "",
      quantity: 1,
      size: variant ? (product.attributes || []).map(a => variant.combination[a.name]).join(" / ") : "Standard",
      color: "Default"
    };

    addToCart(itemToAdd);
  };


  const matrixData = (() => {
    if (!product || !product.variants || product.variants.length === 0) return null;

    const attributes = product.attributes || [];
    if (attributes.length === 0) return null;

    const isSwapped = product.isMatrixSwapped || false;
    const rowAttr = isSwapped ? (attributes[1]?.name || attributes[0].name) : attributes[0].name;
    const colAttr = isSwapped ? attributes[0].name : (attributes[1]?.name || null);

    const rowValues = Array.from(new Set(product.variants.map((v: Variant) => v.combination[rowAttr])));
    const colValues = colAttr
      ? Array.from(new Set(product.variants.map((v: Variant) => v.combination[colAttr])))
      : ["Default"];

    const grid: Record<string, Record<string, Variant>> = {};
    product.variants.forEach((v: Variant) => {
      const r = v.combination[rowAttr];
      const c = colAttr ? v.combination[colAttr] : "Default";
      if (!grid[r]) grid[r] = {};
      grid[r][c] = v;
    });

    return { rowAttr, colAttr, rowValues, colValues, grid, allAttrs: attributes };
  })();

  const handleBulkAddToCart = () => {
    if (!product || !product.variants) return;

    let hasItems = false;
    product.variants.forEach((v: Variant) => {
      const qty = quantities[v.id] || 0;
      if (qty > 0) {
        addToCart({
          id: v.id,
          title: product.name,
          price: v.price,
          quantity: qty,
          img: v.image || product.images[0] || "",
          size: (product.attributes || []).map(a => v.combination[a.name]).join(" / "),
          color: "Default"
        });
        hasItems = true;
      }
    });

    if (hasItems) {
      setQuantities({});
    }
  };

  const updateMatrixQty = (variantId: string, val: string) => {
    const num = parseInt(val);
    setQuantities(prev => ({
      ...prev,
      [variantId]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Decrypting Object DNA...</p>
      </div>
    );
  }

  if (!product) return null;

  const galleryImages = [
    ...(product.images || []),
    ...(product.variants?.map(v => v.image).filter(Boolean) as string[])
  ].filter((value, index, self) => self.indexOf(value) === index);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <main className="max-w-[1700px] mx-auto px-8 py-8">
        <div className="mb-12">
          <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors w-fit">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Gallery Section */}
          <div className="lg:col-span-6 flex flex-col gap-8 lg:sticky lg:top-32 self-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square w-full bg-gray-50 rounded-[3rem] overflow-hidden group border border-gray-100 shadow-sm"
            >
              <Image
                src={galleryImages[selectedImage] || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-[2s]"
              />
              <div className="absolute top-8 right-8 flex flex-col gap-4">
                <button
                  onClick={() => toggleWishlist({
                    id: product.id,
                    title: product.name,
                    price: product.price,
                    img: product.images[0] || "",
                    cat: product.category
                  })}
                  className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-sm hover:bg-white transition-colors"
                >
                  <Heart className={cn("w-5 h-5 transition-colors", isInWishlist(product.id) && "fill-red-500 stroke-red-500")} />
                </button>
              </div>
            </motion.div>
            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-3">
              {galleryImages.map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative aspect-square bg-gray-50 rounded-2xl overflow-hidden cursor-pointer transition-all border",
                    selectedImage === i ? "ring-2 ring-black border-transparent" : "opacity-50 hover:opacity-100 border-gray-100"
                  )}
                >
                  <Image src={img} alt="Thumb" fill className="object-cover" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-6 space-y-12 pb-20">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-4 block">{product.category} • {product.brand} Affiliate</span>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold italic text-gray-500">${product.price}</p>
                <div className="flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 stroke-none" />
                  <span className="text-xs font-black text-yellow-600">4.9 (128 Reviews)</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                {product.shortDescription || product.description}
              </p>

              {/* Matrix Selection for Variable Products */}
              {product.type === 'variable' && matrixData && (
                <div className="pt-8 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-black">Select Variations</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-gray-400 font-mono uppercase">
                          {matrixData.rowAttr} / {matrixData.colAttr || "Default"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto ring-1 ring-gray-100 rounded-[2rem] shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr>
                          <th className="px-6 py-6 bg-gray-50/50 border-b border-r border-gray-100 italic">
                            <div className="flex items-center justify-center p-2 text-center text-black font-mono font-black text-[10px] uppercase tracking-widest">
                              {matrixData.rowAttr} / {matrixData.colAttr || "Default"}
                            </div>
                          </th>
                          {matrixData.colValues.map((col: string) => (
                            <th key={col} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-black text-center border-b border-gray-100 bg-gray-50/30 font-mono">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matrixData.rowValues.map((row: string) => (
                          <tr key={row} className="border-b border-gray-50/50 group hover:bg-gray-50/20 transition-colors">
                            <td className="px-6 py-5 font-black uppercase tracking-tighter text-xs italic border-r border-gray-100 bg-white">
                              {row}
                            </td>
                            {matrixData.colValues.map((col: string) => {
                              const variant = matrixData.grid[row]?.[col];
                              return (
                                <td key={col} className="px-4 py-3 bg-white/50 group-hover:bg-white transition-colors">
                                  {variant ? (
                                    <div className="flex flex-col items-center gap-1.5 py-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max={variant.stock}
                                        value={quantities[variant.id] || ""}
                                        onChange={(e) => updateMatrixQty(variant.id, e.target.value)}
                                        placeholder="0"
                                        className="w-16 h-11 bg-gray-50 border border-gray-100 rounded-2xl text-center font-bold text-xs outline-none focus:ring-2 ring-black focus:bg-white transition-all placeholder:text-gray-200"
                                      />
                                      <div className="flex flex-col items-center">
                                        {variant.stock < 10 && variant.stock > 0 && (
                                          <span className="text-[6px] font-black uppercase text-orange-500 tracking-tighter bg-orange-50 px-1.5 rounded-full">{variant.stock} left</span>
                                        )}
                                        {variant.stock === 0 && (
                                          <span className="text-[6px] font-black uppercase text-red-500 bg-red-50 px-1.5 rounded-full">OOS</span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center">
                                      <div className="w-4 h-[1px] bg-gray-100" />
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkAddToCart}
                    className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-3 mt-8 shadow-xl"
                  >
                    Add to Bag <ShoppingBag className="w-4 h-4" />
                  </motion.button>
                </div>
              )}

              {product.type === 'simple' && (
                <div className="flex flex-col gap-4 pt-6">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart()}
                    className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-shadow"
                  >
                    Add to Bag • ${product.price}
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Features/Trust */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-3">
                <ShieldCheck className="w-6 h-6 text-gray-300" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Secure Payments</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <Truck className="w-6 h-6 text-gray-300" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Express Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <RefreshCw className="w-6 h-6 text-gray-300" />
                <span className="text-[9px] font-bold uppercase tracking-widest">30 Day Returns</span>
              </div>
            </div>

          </div>
        </div>

        {/* Recommendation Section */}
        <section className="mt-32 pt-20 border-t border-gray-50">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 italic">You Might Also Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((p: Product) => (
              <Link href={`/shop/${p.id}`} key={p.id}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-4">
                    <Image src={p.images[0] || "/placeholder.png"} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-widest">{p.name}</h3>
                  <p className="font-bold text-gray-400 italic mt-1 font-[Outfit]">${p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Modern Mini Footer */}
      <footer className="py-12 px-8 flex justify-center border-t border-gray-50">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Super Store Aesthetic • 2026</span>
      </footer>
    </div>
  );
}
