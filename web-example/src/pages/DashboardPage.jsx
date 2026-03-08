import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  TrendingUp, 
  ShoppingCart, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const DashboardPage = () => {
  const [activePeriod, setActivePeriod] = useState('Este Mês');

  const periods = ['7 Dias', '30 Dias', 'Este Mês', 'Personalizado'];

  const kpiData = [
    {
      title: 'Saldo Total',
      value: 'R$ 12.450,00',
      change: '+2.5%',
      positive: true,
      icon: Wallet,
      color: 'text-primary',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 5.200,00',
      change: '+10%',
      positive: true,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Despesas Mensais',
      value: 'R$ 3.100,00',
      change: '-5%',
      positive: false,
      icon: ShoppingCart,
      color: 'text-danger',
    },
    {
      title: 'Variação Mensal',
      value: '+R$ 2.100,00',
      change: '+12%',
      positive: true,
      icon: BarChart3,
      color: 'text-warning',
    },
  ];

  const balanceData = [
    { month: 'JAN', balance: 8500 },
    { month: 'FEV', balance: 9200 },
    { month: 'MAR', balance: 10100 },
    { month: 'ABR', balance: 10800 },
    { month: 'MAI', balance: 11500 },
    { month: 'JUN', balance: 12450 },
  ];

  const expenseData = [
    { name: 'Moradia', value: 1240, color: '#3B82F6' },
    { name: 'Alimentação', value: 775, color: '#22C55E' },
    { name: 'Lazer', value: 465, color: '#F59E0B' },
    { name: 'Outros', value: 620, color: '#8892A4' },
  ];

  const recentTransactions = [
    { id: 1, description: 'Salário', category: 'Receita', date: '01/03/2026', amount: 5200, type: 'income' },
    { id: 2, description: 'Aluguel', category: 'Moradia', date: '05/03/2026', amount: -1200, type: 'expense' },
    { id: 3, description: 'Supermercado', category: 'Alimentação', date: '07/03/2026', amount: -350, type: 'expense' },
    { id: 4, description: 'Freelance', category: 'Receita', date: '08/03/2026', amount: 800, type: 'income' },
    { id: 5, description: 'Cinema', category: 'Lazer', date: '08/03/2026', amount: -45, type: 'expense' },
  ];

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <Helmet>
        <title>Dashboard - Fintech Pro</title>
        <meta name="description" content="Resumo financeiro e análise de gastos" />
      </Helmet>

      <div className="flex bg-background min-h-screen">
        <Sidebar />
        
        <main className="flex-1 ml-60 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 font-bold text-foreground text-2xl">Resumo Financeiro</h1>
            <p className="text-secondary text-sm">Bem-vindo de volta, Ricardo</p>
          </div>

          {/* Period Tabs */}
          <div className="flex space-x-2 mb-6">
            {periods.map((period) => (
              <Button
                key={period}
                variant={activePeriod === period ? 'default' : 'outline'}
                onClick={() => setActivePeriod(period)}
                className={activePeriod === period ? 'bg-primary text-white' : 'border-border text-secondary'}
              >
                {period}
              </Button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {kpiData.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${kpi.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${kpi.positive ? 'text-success' : 'text-danger'}`}>
                        {kpi.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span className="font-medium">{kpi.change}</span>
                      </div>
                    </div>
                    <p className="mb-1 text-secondary text-sm">{kpi.title}</p>
                    <p className="font-bold text-foreground text-2xl">{kpi.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-8">
            {/* Balance Evolution Chart */}
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Evolução do Saldo (6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={balanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
                    <XAxis dataKey="month" stroke="#8892A4" />
                    <YAxis stroke="#8892A4" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A2035', border: '1px solid #2A3142', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Pie Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A2035', border: '1px solid #2A3142', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="font-bold text-foreground text-2xl">R$ {(totalExpenses / 1000).toFixed(1)}k</p>
                  <p className="text-secondary text-sm">Total</p>
                </div>
                <div className="space-y-2 mt-4">
                  {expenseData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full w-3 h-3" style={{ backgroundColor: item.color }}></div>
                        <span className="text-secondary">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {Math.round((item.value / totalExpenses) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-foreground">Transferências Recentes</CardTitle>
              <Button variant="link" className="text-primary">Ver todas</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="px-4 py-3 font-medium text-secondary text-xs text-left uppercase">Descrição</th>
                      <th className="px-4 py-3 font-medium text-secondary text-xs text-left uppercase">Categoria</th>
                      <th className="px-4 py-3 font-medium text-secondary text-xs text-left uppercase">Data</th>
                      <th className="px-4 py-3 font-medium text-secondary text-xs text-right uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/50 border-border border-b transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                              {transaction.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <span className="font-medium text-foreground text-sm">{transaction.description}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center bg-muted px-2.5 py-0.5 rounded-full font-medium text-secondary text-xs">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-secondary text-sm">{transaction.date}</td>
                        <td className={`py-4 px-4 text-right text-sm font-semibold ${
                          transaction.amount > 0 ? 'text-success' : 'text-foreground'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;