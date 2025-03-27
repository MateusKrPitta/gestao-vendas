import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Wallet, Smartphone, Package, CircleDollarSign, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  name: string;
  price: number;
  paymentMethod: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    paymentMethod: 'pix'
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number(newProduct.price),
      paymentMethod: newProduct.paymentMethod
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', price: '', paymentMethod: 'pix' });
  };

  const getTotalAmount = () => products.reduce((sum, product) => sum + product.price, 0);

  const getPaymentMethodTotal = (method: string) => 
    products
      .filter(product => product.paymentMethod === method)
      .reduce((sum, product) => sum + product.price, 0);

  const exportToExcel = () => {
    // Prepare products data with payment method columns
    const productsData = products.map(product => ({
      'Nome do Produto': product.name,
      'Valor': `R$ ${product.price.toFixed(2)}`,
      'PIX': product.paymentMethod === 'pix' ? `R$ ${product.price.toFixed(2)}` : 'R$ 0.00',
      'Dinheiro': product.paymentMethod === 'dinheiro' ? `R$ ${product.price.toFixed(2)}` : 'R$ 0.00',
      'Cartão': product.paymentMethod === 'cartao' ? `R$ ${product.price.toFixed(2)}` : 'R$ 0.00',
      'Forma de Pagamento': product.paymentMethod.charAt(0).toUpperCase() + product.paymentMethod.slice(1)
    }));

    // Add totals row to products data
    productsData.push({
      'Nome do Produto': 'TOTAL',
      'Valor': `R$ ${getTotalAmount().toFixed(2)}`,
      'PIX': `R$ ${getPaymentMethodTotal('pix').toFixed(2)}`,
      'Dinheiro': `R$ ${getPaymentMethodTotal('dinheiro').toFixed(2)}`,
      'Cartão': `R$ ${getPaymentMethodTotal('cartao').toFixed(2)}`,
      'Forma de Pagamento': ''
    });

    // Prepare statistics data
    const statisticsData = [
      { 'Estatística': 'Total de Produtos', 'Valor': products.length },
      { 'Estatística': 'Valor Total', 'Valor': `R$ ${getTotalAmount().toFixed(2)}` },
      { 'Estatística': 'Total PIX', 'Valor': `R$ ${getPaymentMethodTotal('pix').toFixed(2)}` },
      { 'Estatística': 'Total Dinheiro', 'Valor': `R$ ${getPaymentMethodTotal('dinheiro').toFixed(2)}` },
      { 'Estatística': 'Total Cartão', 'Valor': `R$ ${getPaymentMethodTotal('cartao').toFixed(2)}` }
    ];

    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(productsData);
    const ws2 = XLSX.utils.json_to_sheet(statisticsData);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, ws1, "Produtos");
    XLSX.utils.book_append_sheet(wb, ws2, "Estatísticas");

    // Save file
    XLSX.writeFile(wb, "relatorio-vendas.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Gestão de Vendas</h1>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Exportar para Excel
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Digite o nome do produto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
              <select
                value={newProduct.paymentMethod}
                onChange={(e) => setNewProduct({ ...newProduct, paymentMethod: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Inserir Produto
          </button>
        </form>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">R$ {product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{product.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total de Produtos</h3>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <CircleDollarSign className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Valor Total</h3>
                <p className="text-2xl font-bold text-gray-900">R$ {getTotalAmount().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <Smartphone className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total PIX</h3>
                <p className="text-2xl font-bold text-gray-900">R$ {getPaymentMethodTotal('pix').toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total Dinheiro</h3>
                <p className="text-2xl font-bold text-gray-900">R$ {getPaymentMethodTotal('dinheiro').toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total Cartão</h3>
                <p className="text-2xl font-bold text-gray-900">R$ {getPaymentMethodTotal('cartao').toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;