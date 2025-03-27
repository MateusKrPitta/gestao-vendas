import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Wallet, Smartphone, Package, CircleDollarSign, FileSpreadsheet, Trash2 } from 'lucide-react';
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

  const [reportName, setReportName] = useState('');

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

  const clearAllData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      setProducts([]);
      localStorage.removeItem('products');
    }
  };

  const getTotalAmount = () => products.reduce((sum, product) => sum + product.price, 0);

  const getPaymentMethodTotal = (method: string) => 
    products
      .filter(product => product.paymentMethod === method)
      .reduce((sum, product) => sum + product.price, 0);

  const exportToExcel = () => {
    if (!reportName.trim()) {
      alert('Por favor, insira um nome para o relatório antes de exportar.');
      return;
    }

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
      { 'Estatística': 'Nome do Relatório', 'Valor': reportName },
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

    // Save file with report name
    XLSX.writeFile(wb, `relatorio-vendas-${reportName}.xlsx`);
  };

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="font-bold text-gray-800 text-3xl">Sistema de Gestão de Vendas</h1>
          <div className="flex md:flex-row flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Nome do Relatório (ex: Dia 01)"
                className="px-4 py-2 border rounded-md"
              />
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white whitespace-nowrap transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Exportar Excel
              </button>
            </div>
            <button
              onClick={clearAllData}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Limpar Dados
            </button>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md mb-8 p-6 rounded-lg">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Nome do Produto</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="p-2 border rounded-md w-full"
                placeholder="Digite o nome do produto"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Valor</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="p-2 border rounded-md w-full"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Forma de Pagamento</label>
              <select
                value={newProduct.paymentMethod}
                onChange={(e) => setNewProduct({ ...newProduct, paymentMethod: e.target.value })}
                className="p-2 border rounded-md w-full"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-md text-white transition-colors"
          >
            Inserir Produto
          </button>
        </form>

        {/* Table */}
        <div className="bg-white shadow-md mb-8 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">R$ {product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 capitalize whitespace-nowrap">{product.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Statistics Cards */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-700 text-lg">Total de Produtos</h3>
                <p className="font-bold text-gray-900 text-2xl">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <CircleDollarSign className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-700 text-lg">Valor Total</h3>
                <p className="font-bold text-gray-900 text-2xl">R$ {getTotalAmount().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <Smartphone className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-700 text-lg">Total PIX</h3>
                <p className="font-bold text-gray-900 text-2xl">R$ {getPaymentMethodTotal('pix').toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-gray-700 text-lg">Total Dinheiro</h3>
                <p className="font-bold text-gray-900 text-2xl">R$ {getPaymentMethodTotal('dinheiro').toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-700 text-lg">Total Cartão</h3>
                <p className="font-bold text-gray-900 text-2xl">R$ {getPaymentMethodTotal('cartao').toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;