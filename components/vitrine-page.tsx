"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  const formatarDataBrasil = (data: string) => {
    const dataObj = new Date(data + "T00:00:00")
    return dataObj.toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <Input
            value={nomeVitrine}
            onChange={(e) => setNomeVitrine(e.target.value)}
            className="text-xl md:text-2xl lg:text-3xl font-bold border-none p-0 h-auto bg-transparent"
            placeholder="Nome da Vitrine"
          />
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Visualização geral dos produtos</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Em Estoque</CardTitle>
            <Package className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{produtosEmEstoque.length}</div>
            <p className="text-xs text-muted-foreground">produtos disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Fora de Estoque</CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">{produtosForaEstoque.length}</div>
            <p className="text-xs text-muted-foreground">produtos esgotados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Produtos</CardTitle>
            <Eye className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm md:text-2xl font-bold text-purple-600">
              R$ {valorTotalVitrine.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">valor em estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-lg">
            <Filter className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filtroSituacao" className="text-sm md:text-base">
                Filtrar por situação
              </Label>
              <Select value={filtroSituacao} onValueChange={setFiltroSituacao}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas" className="text-sm md:text-base">
                    Todas as situações
                  </SelectItem>
                  <SelectItem value="Em Estoque" className="text-sm md:text-base">
                    Em Estoque
                  </SelectItem>
                  <SelectItem value="Fora de Estoque" className="text-sm md:text-base">
                    Fora de Estoque
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroProduto" className="text-sm md:text-base">
                Filtrar por produto
              </Label>
              <Input
                id="filtroProduto"
                placeholder="Digite o nome do produto"
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
                className="text-sm md:text-base"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={limparFiltros} className="text-sm md:text-base">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards da Vitrine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-lg">
            <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            {nomeVitrine}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm md:text-base">
              {produtos.length === 0
                ? "Nenhum produto cadastrado"
                : "Nenhum produto encontrado com os filtros aplicados"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtosFiltrados.map((produto) => {
                const dataValidade = new Date(produto.validade + "T00:00:00")
                const hoje = new Date()
                const diasParaVencer = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                const proximoVencimento = diasParaVencer <= 30 && diasParaVencer > 0

                return (
                  <Card
                    key={produto.id}
                    className={`border-2 hover:shadow-md transition-shadow ${proximoVencimento ? "bg-yellow-50 border-yellow-200" : ""}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-sm md:text-base font-semibold line-clamp-2">
                            {produto.produto}
                          </CardTitle>
                          <p className="text-xs md:text-sm text-muted-foreground font-mono mt-1">{produto.codigo}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            produto.quantidadeEstoque === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {produto.quantidadeEstoque === 0 ? "Sem Estoque" : "Em Estoque"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                        <div>
                          <span className="font-medium">Marca:</span>
                          <p className="text-muted-foreground">{produto.marca}</p>
                        </div>
                        <div>
                          <span className="font-medium">Data Compra:</span>
                          <p className="text-muted-foreground">{formatarDataBrasil(produto.dataCompra)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                        <div>
                          <span className="font-medium">Validade:</span>
                          <p
                            className={`${proximoVencimento ? "text-yellow-600 font-medium" : "text-muted-foreground"}`}
                          >
                            {formatarDataBrasil(produto.validade)}
                            {proximoVencimento && (
                              <span className="block text-xs text-yellow-600">Vence em {diasParaVencer} dias</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                        <div>
                          <span className="font-medium">Valor Unitário:</span>
                          <p className="text-muted-foreground">
                            R$ {produto.unidadeComDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Qt em Estoque:</span>
                          <p
                            className={`font-semibold ${produto.quantidadeEstoque === 0 ? "text-red-600" : "text-muted-foreground"}`}
                          >
                            {produto.quantidadeEstoque}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                        <div>
                          <span className="font-medium">Valor em Estoque:</span>
                          <p className="text-muted-foreground font-semibold text-green-600">
                            R$ {produto.valorTotalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {proximoVencimento && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-xs">
                          <span className="text-yellow-800 font-medium">⚠️ Produto próximo ao vencimento!</span>
                        </div>
                      )}

                      {produto.quantidadeEstoque <= 5 && produto.quantidadeEstoque > 0 && (
                        <div className="bg-orange-100 border border-orange-300 rounded p-2 text-xs">
                          <span className="text-orange-800 font-medium">📦 Estoque baixo!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
