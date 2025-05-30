"use client"

import { CommandGroup } from "@/components/ui/command"

import { CommandEmpty } from "@/components/ui/command"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useApp, type SaidaProduto } from "@/components/app-provider"
import { Plus, Edit, Trash2, ShoppingCart, Filter, UserPlus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandList, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

export function SaidaProdutosPage() {
  const {
    produtos,
    saidasProdutos,
    cadastros,
    adicionarSaidaProduto,
    editarSaidaProduto,
    excluirSaidaProduto,
    atualizarCadastros,
  } = useApp()
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogDescricaoAberto, setDialogDescricaoAberto] = useState(false)
  const [saidaEditando, setSaidaEditando] = useState<SaidaProduto | null>(null)
  const [novaDescricao, setNovaDescricao] = useState("")
  const [comboboxAberto, setComboboxAberto] = useState(false)
  const [pesquisaProduto, setPesquisaProduto] = useState("")
  const [formData, setFormData] = useState({
    data: "",
    localSaida: "",
    localChegada: "",
    codigoProduto: "",
    quantidadeSaida: 1,
  })

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    codigo: "",
    produto: "",
    marca: "",
    dataCompra: "",
    dataValidade: "",
  })

  const produtoSelecionado = produtos.find((p) => p.codigo === formData.codigoProduto)

  // Filtrar produtos para o combobox
  const produtosFiltradosCombobox = produtos.filter((produto) => {
    return (
      produto.quantidadeEstoque > 0 &&
      (produto.codigo.toLowerCase().includes(pesquisaProduto.toLowerCase()) ||
        produto.produto.toLowerCase().includes(pesquisaProduto.toLowerCase()))
    )
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
      data: "",
      localSaida: "",
      localChegada: "",
      codigoProduto: "",
      quantidadeSaida: 1,
    })
    setPesquisaProduto("")
    setSaidaEditando(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!produtoSelecionado) {
      alert("Produto não encontrado!")
      return
    }

    if (formData.quantidadeSaida > produtoSelecionado.quantidadeEstoque) {
      alert("Quantidade de saída maior que o estoque disponível!")
      return
    }

    const dadosSaida = {
      data: formData.data,
      local: formData.localSaida, // Mantendo compatibilidade
      localSaida: formData.localSaida,
      localChegada: formData.localChegada,
      codigoProduto: formData.codigoProduto,
      produto: produtoSelecionado.produto,
      dataValidade: produtoSelecionado.validade,
      valorUnitario: produtoSelecionado.unidadeComDesconto,
      quantidadeSaida: formData.quantidadeSaida,
      valorTotalFinal: produtoSelecionado.unidadeComDesconto * formData.quantidadeSaida,
    }

    if (saidaEditando) {
      editarSaidaProduto(saidaEditando.id, dadosSaida)
    } else {
      adicionarSaidaProduto(dadosSaida)
    }

    setDialogAberto(false)
    resetForm()
  }

  const handleEdit = (saida: SaidaProduto) => {
    setSaidaEditando(saida)
    setFormData({
      data: saida.data,
      localSaida: saida.localSaida || saida.local,
      localChegada: saida.localChegada || "",
      codigoProduto: saida.codigoProduto,
      quantidadeSaida: saida.quantidadeSaida,
    })
    setPesquisaProduto(saida.codigoProduto)
    setDialogAberto(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta saída de produto?")) {
      excluirSaidaProduto(id)
    }
  }

  const adicionarNovaDescricao = () => {
    if (novaDescricao.trim()) {
      atualizarCadastros("descricoes", [...cadastros.descricoes, novaDescricao.trim()])
      setNovaDescricao("")
      setDialogDescricaoAberto(false)
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
    return new Date(data).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Registro de Saída de Produtos</h2>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Saída
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{saidaEditando ? "Editar Saída" : "Nova Saída de Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codigoProduto">Código do Produto</Label>
                  <div className="flex space-x-2">
                    <Popover open={comboboxAberto} onOpenChange={setComboboxAberto}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxAberto}
                          className="flex-1 justify-between"
                        >
                          {formData.codigoProduto
                            ? produtos.find((produto) => produto.codigo === formData.codigoProduto)?.codigo +
                              " - " +
                              produtos.find((produto) => produto.codigo === formData.codigoProduto)?.produto
                            : "Selecione o produto..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Pesquisar produto..."
                            value={pesquisaProduto}
                            onValueChange={setPesquisaProduto}
                          />
                          <CommandList>
                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {produtosFiltradosCombobox.map((produto) => (
                                <CommandItem
                                  key={produto.codigo}
                                  value={produto.codigo}
                                  onSelect={(currentValue) => {
                                    setFormData({ ...formData, codigoProduto: currentValue })
                                    setPesquisaProduto(currentValue)
                                    setComboboxAberto(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formData.codigoProduto === produto.codigo ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {produto.codigo} - {produto.produto} (Estoque: {produto.quantidadeEstoque})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setDialogDescricaoAberto(true)}
                      title="Adicionar nova descrição"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localSaida">Local de Saída</Label>
                  <Select
                    value={formData.localSaida}
                    onValueChange={(value) => setFormData({ ...formData, localSaida: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local de saída" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadastros.lojas.map((loja) => (
                        <SelectItem key={loja} value={loja}>
                          {loja}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="localChegada">Local de Chegada</Label>
                  <Select
                    value={formData.localChegada}
                    onValueChange={(value) => setFormData({ ...formData, localChegada: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local de chegada" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadastros.lojas.map((loja) => (
                        <SelectItem key={loja} value={loja}>
                          {loja}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {produtoSelecionado && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Informações do Produto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Produto:</strong> {produtoSelecionado.produto}
                      </div>
                      <div>
                        <strong>Marca:</strong> {produtoSelecionado.marca}
                      </div>
                      <div>
                        <strong>Data de Validade:</strong> {formatarDataBrasil(produtoSelecionado.validade)}
                      </div>
                      <div>
                        <strong>Valor Unitário:</strong> R${" "}
                        {produtoSelecionado.unidadeComDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div>
                        <strong>Estoque Disponível:</strong> {produtoSelecionado.quantidadeEstoque}
                      </div>
                      <div>
                        <strong>Valor Total:</strong> R${" "}
                        {(produtoSelecionado.unidadeComDesconto * formData.quantidadeSaida).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="quantidadeSaida">Quantidade de Saída</Label>
                <Input
                  id="quantidadeSaida"
                  type="number"
                  min="1"
                  max={produtoSelecionado?.quantidadeEstoque || 1}
                  value={formData.quantidadeSaida}
                  onChange={(e) => setFormData({ ...formData, quantidadeSaida: Number.parseInt(e.target.value) || 1 })}
                  required
                />
                {produtoSelecionado && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo disponível: {produtoSelecionado.quantidadeEstoque}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!produtoSelecionado}>
                  {saidaEditando ? "Salvar" : "Registrar Saída"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para adicionar nova descrição */}
        <Dialog open={dialogDescricaoAberto} onOpenChange={setDialogDescricaoAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Descrição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="novaDescricao">Nome da Descrição</Label>
                <Input
                  id="novaDescricao"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Digite o nome da nova descrição"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogDescricaoAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={adicionarNovaDescricao} disabled={!novaDescricao.trim()}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros de Produtos
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
            <ShoppingCart className="w-5 h-5 mr-2" />
            Histórico de Saídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Local Saída</TableHead>
                <TableHead>Local Chegada</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Data Validade</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Qtd Saída</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saidasProdutos.map((saida) => (
                <TableRow key={saida.id}>
                  <TableCell>{formatarDataBrasil(saida.data)}</TableCell>
                  <TableCell>{saida.localSaida || saida.local}</TableCell>
                  <TableCell>{saida.localChegada || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{saida.codigoProduto}</TableCell>
                  <TableCell>{saida.produto}</TableCell>
                  <TableCell>{formatarDataBrasil(saida.dataValidade)}</TableCell>
                  <TableCell>R$ {saida.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-center">{saida.quantidadeSaida}</TableCell>
                  <TableCell className="font-medium">
                    R$ {saida.valorTotalFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(saida)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(saida.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {saidasProdutos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Nenhuma saída de produto registrada</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
