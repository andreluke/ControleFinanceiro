import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TransfersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const transactions = [
    { id: 1, type: 'income', description: 'Salário Mensal', category: 'Receita', date: '01/03/2026', amount: 5200 },
    { id: 2, type: 'expense', description: 'Aluguel Apartamento', category: 'Moradia', date: '05/03/2026', amount: -1200 },
    { id: 3, type: 'expense', description: 'Supermercado Extra', category: 'Alimentação', date: '07/03/2026', amount: -350 },
    { id: 4, type: 'income', description: 'Projeto Freelance', category: 'Receita', date: '08/03/2026', amount: 800 },
    { id: 5, type: 'expense', description: 'Cinema IMAX', category: 'Lazer', date: '08/03/2026', amount: -45 },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Receita': 'bg-success/10 text-success',
      'Moradia': 'bg-primary/10 text-primary',
      'Alimentação': 'bg-warning/10 text-warning',
      'Lazer': 'bg-accent/10 text-accent',
    };
    return colors[category] || 'bg-muted text-secondary';
  };

  return (
    <>
      <Helmet>
        <title>Transferências - Fintech Pro</title>
        <meta name="description" content="Acompanhe seu histórico de transações e movimentações financeiras" />
      </Helmet>

      <div className="flex bg-background min-h-screen">
        <Sidebar />
        
        <main className="flex-1 ml-60 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="mb-2 font-bold text-foreground text-2xl">Transferências</h1>
              <p className="text-secondary text-sm">
                Acompanhe seu histórico de transações e movimentações financeiras
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 w-4 h-4" />
              Nova Transferência
            </Button>
          </div>

          {/* Filter Bar */}
          <Card className="bg-card mb-6 border-border">
            <CardContent className="p-4">
              <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                {/* Search */}
                <div className="relative md:col-span-2">
                  <Search className="top-1/2 left-3 absolute w-4 h-4 text-secondary -translate-y-1/2" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background pl-10 border-border text-foreground"
                  />
                </div>

                {/* Type Filter */}
                <Select defaultValue="all">
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Tipo: Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tipo: Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>

                {/* Period Filter */}
                <Select defaultValue="30days">
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="90days">Últimos 90 dias</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="px-6 py-4 font-medium text-secondary text-xs text-left uppercase">Tipo</th>
                      <th className="px-6 py-4 font-medium text-secondary text-xs text-left uppercase">Descrição</th>
                      <th className="px-6 py-4 font-medium text-secondary text-xs text-left uppercase">Categoria</th>
                      <th className="px-6 py-4 font-medium text-secondary text-xs text-left uppercase">Data</th>
                      <th className="px-6 py-4 font-medium text-secondary text-xs text-right uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/50 border-border border-b transition-colors">
                        <td className="px-6 py-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground text-sm">{transaction.description}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary text-sm">{transaction.date}</td>
                        <td className={`py-4 px-6 text-right text-sm font-semibold ${
                          transaction.amount > 0 ? 'text-success' : 'text-foreground'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-border border-t">
                <p className="text-secondary text-sm">
                  Mostrando 5 de 42 transações
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="hover:bg-muted border-border text-secondary"
                  >
                    <ChevronLeft className="mr-1 w-4 h-4" />
                    Previous
                  </Button>
                  
                  {[1, 2, 3].map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'bg-primary text-white' : 'border-border text-secondary hover:bg-muted'}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="hover:bg-muted border-border text-secondary"
                  >
                    Next
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default TransfersPage;