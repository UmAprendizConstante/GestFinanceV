"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
    setDialogAberto(false)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estoque da Fábrica - Produtos</h2>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{produtoEditando ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataCompra">Data de Compra</Label>
                  <Input
                    id="dataCompra"
                    type="date"
                    value={formData.dataCompra}
                    onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="validade">Data de Validade</Label>
                  <Input
                    id="validade"
                    type="date"
                    value={formData.validade}
                    onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="produto">Nome do Produto</Label>
                  <Input
                    id="produto"
                    value={formData.produto}
                    onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Select value={formData.marca} onValueChange={(value) => setFormData({ ...formData, marca: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadastros.marcas.map((marca) => (
                        <SelectItem key={marca} value={marca}>
                          {marca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {cadastros.categoriasProdutos.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição do Produto</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do produto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidadeComprada">Quantidade Comprada</Label>
                  <Input
                    id="quantidadeComprada"
                    type="number"
                    min="1"
                    value={formData.quantidadeComprada}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidadeComprada: Number.parseInt(e.target.value) || 1 })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
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
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descontoAplicado">Desconto Aplicado (R$)</Label>
                <Input
                  id="descontoAplicado"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.descontoAplicado}
                  onChange={(e) =>
                    setFormData({ ...formData, descontoAplicado: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              {/* Preview dos cálculos */}
              {formData.valorUnitario > 0 && formData.quantidadeComprada > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Cálculos Automáticos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
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

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{produtoEditando ? "Salvar" : "Adicionar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filtroCodigo">Código</Label>
              <Input
                id="filtroCodigo"
                placeholder="Filtrar por código"
                value={filtros.codigo}
                onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroProduto">Produto</Label>
              <Input
                id="filtroProduto"
                placeholder="Filtrar por produto"
                value={filtros.produto}
                onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroMarca">Marca</Label>
              <Input
                id="filtroMarca"
                placeholder="Filtrar por marca"
                value={filtros.marca}
                onChange={(e) => setFiltros({ ...filtros, marca: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroDataCompra">Data de Compra</Label>
              <Input
                id="filtroDataCompra"
                type="date"
                value={filtros.dataCompra}
                onChange={(e) => setFiltros({ ...filtros, dataCompra: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroDataValidade">Data de Validade</Label>
              <Input
                id="filtroDataValidade"
                type="date"
                value={filtros.dataValidade}
                onChange={(e) => setFiltros({ ...filtros, dataValidade: e.target.value })}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Lista de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data Compra</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Qtd Comprada</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Desconto Aplicado</TableHead>
                  <TableHead>Unit. c/ Desconto</TableHead>
                  <TableHead>Qtd Estoque</TableHead>
                  <TableHead>Valor Estoque</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-mono text-sm">{produto.codigo}</TableCell>
                    <TableCell className="font-medium">{produto.produto}</TableCell>
                    <TableCell>{produto.marca}</TableCell>
                    <TableCell>{produto.categoria}</TableCell>
                    <TableCell>{new Date(produto.dataCompra).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{new Date(produto.validade).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{produto.quantidadeComprada}</TableCell>
                    <TableCell>
                      R$ {produto.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      R$ {produto.descontoAplicado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      R$ {produto.unidadeComDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{produto.quantidadeEstoque}</TableCell>
                    <TableCell>
                      R$ {produto.valorTotalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          produto.situacao === "Em Estoque" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {produto.situacao}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(produto)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(produto.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
