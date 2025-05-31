"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useApp, type Produto } from "@/components/app-provider"
import { Plus, Edit, Trash2, Package, Filter } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function ProdutosPage() {
  const { produtos, cadastros, adicionarProduto, editarProduto, excluirProduto } = useApp()
  const [dialogAberto, setDialogAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [formData, setFormData] = useState({
    dataCompra: "",
    produto: "",
    categoria: "",
    marca: "",
    descricao: "",
    validade: "",
    quantidadeComprada: 1,
    valorUnitario: 0,
    descontoAplicado: 0,
  })

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    codigo: "",
    produto: "",
    marca: "",
    dataCompra: "",
    dataValidade: "",
  })

  // Aplicar filtros aos produtos
  const produtosFiltrados = produtos.filter((produto) => {
    return (
      produto.codigo.toLowerCase().includes(filtros.codigo.toLowerCase()) &&
      produto.produto.toLowerCase().includes(filtros.produto.toLowerCase()) &&
      produto.marca.toLowerCase().includes(filtros.marca.toLowerCase()) &&
      (filtros.dataCompra === "" || produto.dataCompra === filtros.dataCompra) &&
      (filtros.dataValidade === "" || produto.validade === filtros.dataValidade)
    )
  })

  const resetForm = () => {
    setFormData({
      dataCompra: "",
      produto: "",
      categoria: "",
      marca: "",
      descricao: "",
      validade: "",
      quantidadeComprada: 1,
      valorUnitario: 0,
      descontoAplicado: 0,
    })
    setProdutoEditando(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (produtoEditando) {
      editarProduto(produtoEditando.id, formData)
    } else {
      adicionarProduto(formData)
    }
    // Não fechar o dialog automaticamente - apenas resetar o form
    resetForm()
  }

  const handleEdit = (produto: Produto) => {
    setProdutoEditando(produto)
    setFormData({
      dataCompra: produto.dataCompra,
      produto: produto.produto,
      categoria: produto.categoria,
      marca: produto.marca,
      descricao: produto.descricao,
      validade: produto.validade,
      quantidadeComprada: produto.quantidadeComprada,
      valorUnitario: produto.valorUnitario,
      descontoAplicado: produto.descontoAplicado,
    })
    setDialogAberto(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      excluirProduto(id)
    }
  }

  const limparFiltros = () => {
    setFiltros({
      codigo: "",
      produto: "",
      marca: "",
      dataCompra: "",
      dataValidade: "",
    })
  }

  const formatarDataBrasil = (data: string) => {
    // Corrigir problema de fuso horário
    const dataObj = new Date(data + "T00:00:00")
    return dataObj.toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Estoque da Fábrica - Produtos</h2>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              <span className="text-sm md:text-base">Novo Produto</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">
                {produtoEditando ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataCompra" className="text-sm md:text-base">
                    Data de Compra
                  </Label>
                  <Input
                    id="dataCompra"
                    type="date"
                    value={formData.dataCompra}
                    onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="validade" className="text-sm md:text-base">
                    Data de Validade
                  </Label>
                  <Input
                    id="validade"
                    type="date"
                    value={formData.validade}
                    onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="produto" className="text-sm md:text-base">
                    Nome do Produto
                  </Label>
                  <Input
                    id="produto"
                    value={formData.produto}
                    onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="marca" className="text-sm md:text-base">
                    Marca
                  </Label>
                  <Select value={formData.marca} onValueChange={(value) => setFormData({ ...formData, marca: value })}>
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadastros.marcas.map((marca) => (
                        <SelectItem key={marca} value={marca} className="text-sm md:text-base">
                          {marca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="categoria" className="text-sm md:text-base">
                  Categoria
                </Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger className="text-sm md:text-base">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {cadastros.categoriasProdutos.map((categoria) => (
                      <SelectItem key={categoria} value={categoria} className="text-sm md:text-base">
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao" className="text-sm md:text-base">
                  Descrição do Produto
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do produto"
                  className="text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidadeComprada" className="text-sm md:text-base">
                    Quantidade Comprada
                  </Label>
                  <Input
                    id="quantidadeComprada"
                    type="number"
                    min="1"
                    value={formData.quantidadeComprada}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidadeComprada: Number.parseInt(e.target.value) || 1 })
                    }
                    required
                    className="text-sm md:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="valorUnitario" className="text-sm md:text-base">
                    Valor Unitário (R$)
                  </Label>
                  <Input
                    id="valorUnitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorUnitario}
                    onChange={(e) =>
                      setFormData({ ...formData, valorUnitario: Number.parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descontoAplicado" className="text-sm md:text-base">
                  Desconto Aplicado (R$)
                </Label>
                <Input
                  id="descontoAplicado"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.descontoAplicado}
                  onChange={(e) =>
                    setFormData({ ...formData, descontoAplicado: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="text-sm md:text-base"
                />
              </div>

              {/* Preview dos cálculos */}
              {formData.valorUnitario > 0 && formData.quantidadeComprada > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm md:text-base">Cálculos Automáticos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs md:text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong>Valor Total:</strong> R${" "}
                        {(formData.valorUnitario * formData.quantidadeComprada).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div>
                        <strong>Desconto Unitário:</strong> R${" "}
                        {(formData.descontoAplicado / formData.quantidadeComprada).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div>
                        <strong>Unidade com Desconto:</strong> R${" "}
                        {(
                          formData.valorUnitario -
                          formData.descontoAplicado / formData.quantidadeComprada
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div>
                        <strong>Valor Total com Desconto:</strong> R${" "}
                        {(
                          formData.valorUnitario * formData.quantidadeComprada -
                          formData.descontoAplicado
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div>
                        <strong>Quantidade em Estoque:</strong> {formData.quantidadeComprada}
                      </div>
                      <div>
                        <strong>Valor Total em Estoque:</strong> R${" "}
                        {(
                          formData.quantidadeComprada *
                          (formData.valorUnitario - formData.descontoAplicado / formData.quantidadeComprada)
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogAberto(false)}
                  className="text-sm md:text-base"
                >
                  Fechar
                </Button>
                <Button type="submit" className="text-sm md:text-base">
                  {produtoEditando ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filtroCodigo" className="text-sm md:text-base">
                Código
              </Label>
              <Input
                id="filtroCodigo"
                placeholder="Filtrar por código"
                value={filtros.codigo}
                onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="filtroProduto" className="text-sm md:text-base">
                Produto
              </Label>
              <Input
                id="filtroProduto"
                placeholder="Filtrar por produto"
                value={filtros.produto}
                onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="filtroMarca" className="text-sm md:text-base">
                Marca
              </Label>
              <Input
                id="filtroMarca"
                placeholder="Filtrar por marca"
                value={filtros.marca}
                onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="filtroDataCompra" className="text-sm md:text-base">
                Data de Compra
              </Label>
              <Input
                id="filtroDataCompra"
                type="date"
                value={filtros.dataCompra}
                onChange={(e) => setFiltros({ ...filtros, dataCompra: e.target.value })}
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label htmlFor="filtroDataValidade" className="text-sm md:text-base">
                Data de Validade
              </Label>
              <Input
                id="filtroDataValidade"
                type="date"
                value={filtros.dataValidade}
                onChange={(e) => setFiltros({ ...filtros, dataValidade: e.target.value })}
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

      {/* Cards de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-lg">
            <Package className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Lista de Produtos
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
              {produtosFiltrados.map((produto) => (
                <Card key={produto.id} className="border-2 hover:shadow-md transition-shadow">
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
                          produto.situacao === "Em Estoque" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {produto.situacao}
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
                        <span className="font-medium">Categoria:</span>
                        <p className="text-muted-foreground">{produto.categoria}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Data Compra:</span>
                        <p className="text-muted-foreground">{formatarDataBrasil(produto.dataCompra)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Validade:</span>
                        <p className="text-muted-foreground">{formatarDataBrasil(produto.validade)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Qtd Comprada:</span>
                        <p className="text-muted-foreground">{produto.quantidadeComprada}</p>
                      </div>
                      <div>
                        <span className="font-medium">Qtd Estoque:</span>
                        <p className="text-muted-foreground font-semibold">{produto.quantidadeEstoque}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                      <div>
                        <span className="font-medium">Valor Unitário:</span>
                        <p className="text-muted-foreground">
                          R$ {produto.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Unit. c/ Desconto:</span>
                        <p className="text-muted-foreground font-semibold">
                          R$ {produto.unidadeComDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Valor Total Estoque:</span>
                        <p className="text-muted-foreground font-semibold text-green-600">
                          R$ {produto.valorTotalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(produto)}
                        className="flex-1 text-xs md:text-sm"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(produto.id)}
                        className="flex-1 text-xs md:text-sm"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
