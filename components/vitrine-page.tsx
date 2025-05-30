"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/components/app-provider"
import { Eye, Package, AlertTriangle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VitrinePage() {
  const { produtos } = useApp()
  const [nomeVitrine, setNomeVitrine] = useState("Vitrine da Fábrica")
  const [filtroSituacao, setFiltroSituacao] = useState("todas")
  const [filtroProduto, setFiltroProduto] = useState("")

  const produtosFiltrados = produtos.filter((produto) => {
    const passaSituacao = filtroSituacao === "todas" || produto.situacao === filtroSituacao
    const passaProduto = produto.produto.toLowerCase().includes(filtroProduto.toLowerCase())
    return passaSituacao && passaProduto
  })

  const produtosEmEstoque = produtos.filter((p) => p.situacao === "Em Estoque")
  const produtosForaEstoque = produtos.filter((p) => p.situacao === "Fora de Estoque")
  const valorTotalVitrine = produtosFiltrados.reduce((acc, p) => acc + p.valorTotalEstoque, 0)

  const limparFiltros = () => {
    setFiltroSituacao("todas")
    setFiltroProduto("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Input
            value={nomeVitrine}
            onChange={(e) => setNomeVitrine(e.target.value)}
            className="text-2xl font-bold border-none p-0 h-auto bg-transparent"
            placeholder="Nome da Vitrine"
          />
          <p className="text-muted-foreground mt-1">Visualização geral dos produtos</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Estoque</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{produtosEmEstoque.length}</div>
            <p className="text-xs text-muted-foreground">produtos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fora de Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{produtosForaEstoque.length}</div>
            <p className="text-xs text-muted-foreground">produtos esgotados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {valorTotalVitrine.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">valor em estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filtroSituacao">Filtrar por situação</Label>
              <Select value={filtroSituacao} onValueChange={setFiltroSituacao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as situações</SelectItem>
                  <SelectItem value="Em Estoque">Em Estoque</SelectItem>
                  <SelectItem value="Fora de Estoque">Fora de Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroProduto">Filtrar por produto</Label>
              <Input
                id="filtroProduto"
                placeholder="Digite o nome do produto"
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela da Vitrine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            {nomeVitrine}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Data de Compra</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Valor Unitário</TableHead>
                  <TableHead>Qt em Estoque</TableHead>
                  <TableHead>Vl em Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => {
                  const dataValidade = new Date(produto.validade)
                  const hoje = new Date()
                  const diasParaVencer = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                  const proximoVencimento = diasParaVencer <= 30 && diasParaVencer > 0

                  return (
                    <TableRow key={produto.id} className={proximoVencimento ? "bg-yellow-50" : ""}>
                      <TableCell className="font-medium">{produto.produto}</TableCell>
                      <TableCell className="font-mono text-sm">{produto.codigo}</TableCell>
                      <TableCell>{produto.marca}</TableCell>
                      <TableCell>{new Date(produto.dataCompra).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className={proximoVencimento ? "text-yellow-600 font-medium" : ""}>
                        {new Date(produto.validade).toLocaleDateString("pt-BR")}
                        {proximoVencimento && (
                          <div className="text-xs text-yellow-600">Vence em {diasParaVencer} dias</div>
                        )}
                      </TableCell>
                      <TableCell>
                        R$ {produto.unidadeComDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={produto.quantidadeEstoque === 0 ? "text-red-600 font-medium" : ""}>
                          {produto.quantidadeEstoque}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {produto.valorTotalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {produtos.length === 0
                ? "Nenhum produto cadastrado"
                : "Nenhum produto encontrado com os filtros aplicados"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
