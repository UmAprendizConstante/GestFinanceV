"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/components/app-provider"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Filter, Bell, AlertTriangle, Calendar, Target } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"]

export function Dashboard() {
  const { transacoes, produtos, saidasProdutos, cadastros } = useApp()
  const [filtroLoja, setFiltroLoja] = useState("todas")
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)

  // Filtrar transações por loja
  const transacoesFiltradas = transacoes.filter((transacao) => {
    return filtroLoja === "todas" || transacao.loja === filtroLoja
  })

  // Cálculos para o dashboard
  const totalCredito = transacoesFiltradas.filter((t) => t.categoria === "Crédito").reduce((acc, t) => acc + t.valor, 0)
  const totalDebito = transacoesFiltradas.filter((t) => t.categoria === "Débito").reduce((acc, t) => acc + t.valor, 0)
  const saldoAtual = totalCredito - totalDebito

  // Dados para gráficos
  const dadosTransacoesPorMes = transacoesFiltradas.reduce((acc, t) => {
    const mes = new Date(t.data).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    })
    const existing = acc.find((item) => item.mes === mes)
    if (existing) {
      if (t.categoria === "Crédito") {
        existing.credito += t.valor
      } else {
        existing.debito += t.valor
      }
    } else {
      acc.push({
        mes,
        credito: t.categoria === "Crédito" ? t.valor : 0,
        debito: t.categoria === "Débito" ? t.valor : 0,
      })
    }
    return acc
  }, [] as any[])

  const dadosCategoriasTransacoes = [
    { name: "Crédito", value: totalCredito },
    { name: "Débito", value: totalDebito },
  ]

  // Análises financeiras avançadas
  const calcularTendencia = () => {
    const ultimos6Meses = dadosTransacoesPorMes.slice(-6)
    if (ultimos6Meses.length < 2) return "Dados insuficientes"

    const tendencia = ultimos6Meses.reduce((acc, curr, index) => {
      if (index === 0) return acc
      const anterior = ultimos6Meses[index - 1]
      const saldoAtual = curr.credito - curr.debito
      const saldoAnterior = anterior.credito - anterior.debito
      return acc + (saldoAtual - saldoAnterior)
    }, 0)

    return tendencia > 0 ? "Crescimento" : tendencia < 0 ? "Declínio" : "Estável"
  }

  const calcularMediaMovel = () => {
    const ultimos3Meses = dadosTransacoesPorMes.slice(-3)
    if (ultimos3Meses.length === 0) return 0
    const soma = ultimos3Meses.reduce((acc, curr) => acc + (curr.credito - curr.debito), 0)
    return soma / ultimos3Meses.length
  }

  const projecaoProximoMes = () => {
    const mediaMovel = calcularMediaMovel()
    const crescimentoPercentual = 0.05 // 5% de crescimento estimado
    return mediaMovel * (1 + crescimentoPercentual)
  }

  // Notificações
  const produtosVencendo = produtos.filter((p) => {
    const diasParaVencer = Math.ceil((new Date(p.validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diasParaVencer <= 30 && diasParaVencer > 0
  })

  const produtosBaixoEstoque = produtos.filter((p) => p.quantidadeEstoque <= 5 && p.quantidadeEstoque > 0)
  const produtosForaEstoque = produtos.filter((p) => p.quantidadeEstoque === 0)

  const limparFiltros = () => {
    setFiltroLoja("todas")
  }

  const nomeLojaFiltro = filtroLoja === "todas" ? "Todas as Lojas" : filtroLoja

  const formatarDataBrasil = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header com Notificações */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
        <Dialog open={notificacoesAbertas} onOpenChange={setNotificacoesAbertas}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {produtosVencendo.length + produtosBaixoEstoque.length + produtosForaEstoque.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {produtosVencendo.length + produtosBaixoEstoque.length + produtosForaEstoque.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notificações do Sistema
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {produtosVencendo.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-semibold text-yellow-800 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Produtos Vencendo ({produtosVencendo.length})
                  </h4>
                  <div className="mt-2 space-y-1">
                    {produtosVencendo.slice(0, 3).map((produto) => (
                      <p key={produto.id} className="text-sm text-yellow-700">
                        {produto.produto} - Vence em{" "}
                        {Math.ceil(
                          (new Date(produto.validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )}{" "}
                        dias
                      </p>
                    ))}
                    {produtosVencendo.length > 3 && (
                      <p className="text-xs text-yellow-600">E mais {produtosVencendo.length - 3} produtos...</p>
                    )}
                  </div>
                </div>
              )}

              {produtosBaixoEstoque.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <h4 className="font-semibold text-orange-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Estoque Baixo ({produtosBaixoEstoque.length})
                  </h4>
                  <div className="mt-2 space-y-1">
                    {produtosBaixoEstoque.slice(0, 3).map((produto) => (
                      <p key={produto.id} className="text-sm text-orange-700">
                        {produto.produto} - Restam {produto.quantidadeEstoque} unidades
                      </p>
                    ))}
                    {produtosBaixoEstoque.length > 3 && (
                      <p className="text-xs text-orange-600">E mais {produtosBaixoEstoque.length - 3} produtos...</p>
                    )}
                  </div>
                </div>
              )}

              {produtosForaEstoque.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <h4 className="font-semibold text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Fora de Estoque ({produtosForaEstoque.length})
                  </h4>
                  <div className="mt-2 space-y-1">
                    {produtosForaEstoque.slice(0, 3).map((produto) => (
                      <p key={produto.id} className="text-sm text-red-700">
                        {produto.produto} - Sem estoque
                      </p>
                    ))}
                    {produtosForaEstoque.length > 3 && (
                      <p className="text-xs text-red-600">E mais {produtosForaEstoque.length - 3} produtos...</p>
                    )}
                  </div>
                </div>
              )}

              {produtosVencendo.length + produtosBaixoEstoque.length + produtosForaEstoque.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-700 text-center">✅ Nenhuma notificação no momento</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros do Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filtroLoja">Filtrar por Loja</Label>
              <Select value={filtroLoja} onValueChange={setFiltroLoja}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Lojas</SelectItem>
                  {cadastros.lojas.map((loja) => (
                    <SelectItem key={loja} value={loja}>
                      {loja}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Exibindo dados para: <strong>{nomeLojaFiltro}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoAtual >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {saldoAtual >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              {transacoesFiltradas.length} transações
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crédito</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {transacoesFiltradas.filter((t) => t.categoria === "Crédito").length} entradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Débito</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDebito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {transacoesFiltradas.filter((t) => t.categoria === "Débito").length} saídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projeção Próximo Mês</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {projecaoProximoMes().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Baseado em crescimento de 5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transações por Mês - {nomeLojaFiltro}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosTransacoesPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                />
                <Bar dataKey="credito" fill="#22c55e" name="Crédito" />
                <Bar dataKey="debito" fill="#ef4444" name="Débito" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição Crédito vs Débito - {nomeLojaFiltro}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosCategoriasTransacoes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosCategoriasTransacoes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análises Financeiras Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Tendência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tendência Atual:</span>
                <span
                  className={`font-bold ${calcularTendencia() === "Crescimento" ? "text-green-600" : calcularTendencia() === "Declínio" ? "text-red-600" : "text-yellow-600"}`}
                >
                  {calcularTendencia()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Média Móvel (3 meses):</span>
                <span className="font-bold">
                  R$ {calcularMediaMovel().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas para Melhorar:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Diversifique suas fontes de receita</li>
                  <li>• Monitore gastos desnecessários</li>
                  <li>• Invista em marketing para aumentar vendas</li>
                  <li>• Negocie melhores condições com fornecedores</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Alertas de Risco:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {saldoAtual < 0 && <li>• Saldo negativo - Atenção ao fluxo de caixa</li>}
                  {totalDebito > totalCredito * 0.8 && <li>• Gastos altos em relação à receita</li>}
                  {produtosForaEstoque.length > 0 && <li>• {produtosForaEstoque.length} produtos fora de estoque</li>}
                  {produtosVencendo.length > 0 && <li>• {produtosVencendo.length} produtos próximos ao vencimento</li>}
                </ul>
              </div>

              <div className="p-3 bg-green-50 rounded">
                <h4 className="font-semibold text-green-800 mb-2">💰 Como Aumentar Capital:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Ofereça promoções para produtos próximos ao vencimento</li>
                  <li>• Implemente programa de fidelidade</li>
                  <li>• Analise produtos mais vendidos e aumente estoque</li>
                  <li>• Considere parcerias estratégicas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linha de Tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Saldo ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dadosTransacoesPorMes.map((item) => ({
                ...item,
                saldo: item.credito - item.debito,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              />
              <Line type="monotone" dataKey="saldo" stroke="#8884d8" strokeWidth={3} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
