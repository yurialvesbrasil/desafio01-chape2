import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { isPrefixUnaryExpression } from 'typescript';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProductInCart: (productId: number) => Promise<void>;
  removeProductFromCart: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

//Tipo de item do carrinho
type ItemCart = Product & { amount: number };

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  //Adiciona produto no carrinho
  const addProductInCart = async (productId: number) => {
    try {
      //Verifica se tem o produto em estoque
      const stock = await api.get<Stock>(`/stock/${productId}`);
      if (stock.data.amount < 1) {
        toast.error('Produto sem estoque');
        return;
      }
      //Carrega informações do produto
      const product = await api.get<Product>(`/products/${productId}`);
      if (product) {
        //Adiciona produto no carrinho
        const itemExists = cart.find(p => p.id === product.data.id);
        if (itemExists) {
          //Atualiza a quantidade de um mesmo produto no carrinho
          updateProductAmount({ productId: product.data.id, amount: itemExists.amount + 1 });
        } else {
          //Adiciona produto no carrinho
          const itemCart: ItemCart = { ...product.data, amount: 1 };
          cart.push(itemCart);
          //Estorna unidade do produto no stoke
        }
        //Atualiza lista de produtos no carrinho
        setCart([...cart]);
        //Salva o carrinho no localStorage
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      }

    } catch {
      // TODO
    }
  };

  //Remove produto do carrinho
  const removeProductFromCart = (productId: number) => {
    try {
      const itemExists = cart.find(p => p.id === productId);
      if (itemExists) {
        //Removo item antigo
        cart.splice(cart.indexOf(itemExists), 1);
        if (itemExists.amount > 1) {
          //Atualizo item no carrinho
          itemExists.amount--;
          cart.push(itemExists);
        }
        //Atualizo lista de produtos no carrinho
        setCart([...cart]);
        //Salvo o carrinho no localStorage
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      }
    } catch {
      // TODO
    }
  };

  //Atualiza quantidade de um produto em estoque
  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProductInCart, removeProductFromCart, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
