import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (response) {
        const storedProducts: Product[] = JSON.parse(response);

        setProducts(storedProducts);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const index = products.findIndex(
        storedProduct => storedProduct.id === product.id,
      );

      if (index === -1) {
        const newProduct = { ...product, quantity: 1 };
        setProducts([...products, newProduct]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify([...products, newProduct]),
        );
      } else {
        products[index].quantity += 1;

        setProducts([...products]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(
        (storedProduct: Product) => storedProduct.id === id,
      );

      if (index !== -1) {
        products[index].quantity += 1;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(
        (storedProduct: Product) => storedProduct.id === id,
      );

      if (index !== -1) {
        products[index].quantity -= 1;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
