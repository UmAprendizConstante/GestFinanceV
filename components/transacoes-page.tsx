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
import { useApp, type TransacaoFinanceira } from "@/components/app-provider"
import { Plus, Edit, Trash2, Filter, UserPlus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandList, CommandInput, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

type SortDirection = "asc" | "desc" | null
type SortField = "data" | "categoria" | "loja" | "descricao" | "observacao" | "quantidade" | "valor"

interface SortConfig {
  field: SortField
  direction: SortDirection
}

export function TransacoesPage() {
  const { transacoes, cadastros, adicionarTransacao, editarTransacao, excluirTransacao, atualizarCadastros } = useApp()
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogDescricaoAberto, setDialogDescricaoAberto] = useState(false)
  const [dialogLojaAberto, setDialogLojaAberto] = useState(false)
  const [transacaoEditando, setTransacaoEditando] = useState<TransacaoFinanceira | null>(null)
  const [novaDescricao, setNovaDescricao] = useState("")
  const [novaLoja, setNovaLoja] = useState("")
  const [comboboxLojaAberto, setComboboxLojaAberto] = useState(false)
  const [comboboxDescricaoAberto, setComboboxDescricaoAberto] = useState(false)
  const [pesquisaLoja, setPesquisaLoja] = useState("")
  const [pesquisaDescricao, setPesquisaDescricao] = useState("")
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([])
  const [formData, setFormData] = useState({
    data: "",
    loja: "",
    categoria: "Crédito" as "Crédito" | "Débito",
    observacao: "",
    descricao: "",
    quantidade: 1,
    valor: 0,
  })

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    data: "",
    loja: "",
    categoria: "todas",
    descricao: "",
    valor: "",
  })

  // Função para ordenação múltipla
  const aplicarOrdenacao = (transacoes: TransacaoFinanceira[]) => {
    if (sortConfigs.length === 0) {
      return transacoes.sort((a, b) => a.descricao.localeCompare(b.descricao))
    }

    return [...transacoes].sort((a, b) => {
      for (const config of sortConfigs) {
        let comparison = 0

        switch (config.field) {
          case "data":
            comparison = new Date(a.data).getTime() - new Date(b.data).getTime()
            break
          case "categoria":
            comparison = a.categoria.localeCompare(b.categoria)
            break
          case "loja":
            comparison = a.loja.localeCompare(b.loja)
            break
          case "descricao":
            comparison = a.descricao.localeCompare(b.descricao)
            break
          case "observacao":
            comparison = a.observacao.localeCompare(b.observacao)
            break
          case "quantidade":
            comparison = a.quantidade - b.quantidade
            break
          case "valor":
            comparison = a.valor - b.valor
            break
        }

        if (comparison !== 0) {
          return config.direction === "desc" ? -comparison : comparison
        }
      }
      return 0
    })
  }

  // Função para alterar ordenação
  const handleSort = (field: SortField) => {
    setSortConfigs((prevConfigs) => {
      const existingIndex = prevConfigs.findIndex((config) => config.field === field)

      if (existingIndex >= 0) {
        const newConfigs = [...prevConfigs]
        const currentDirection = newConfigs[existingIndex].direction

        if (currentDirection === "asc") {
          newConfigs[existingIndex].direction = "desc"
        } else if (currentDirection === "desc") {
          newConfigs.splice(existingIndex, 1)
        }

        return newConfigs
      } else {
        return [...prevConfigs, { field, direction: "asc" }]
      }
    })
  }

  // Aplicar filtros e ordenação às transações
  const transacoesFiltradas = aplicarOrdenacao(
    transacoes.filter((transacao) => {
      return (
        (filtros.data === "" || transacao.data === filtros.data) &&
        transacao.loja.toLowerCase().includes(filtros.loja.toLowerCase()) &&
        (filtros.categoria === "todas" || transacao.categoria === filtros.categoria) &&
        transacao.descricao.toLowerCase().includes(filtros.descricao.toLowerCase()) &&
        (filtros.valor === "" || transacao.valor.toString().includes(filtros.valor))
      )
    }),
  )

  // Filtrar lojas para o combobox
  const lojasFiltradas = cadastros.lojas.filter((loja) => loja.toLowerCase().includes(pesquisaLoja.toLowerCase()))

  // Filtrar descrições para o combobox
  const descricoesFiltradas = cadastros.descricoes.filter((descricao) =>
    descricao.toLowerCase().includes(pesquisaDescricao.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      data: "",
      loja: "",
      categoria: "Crédito",
      observacao: "",
      descricao: "",
      quantidade: 1,
      valor: 0,
    })
    setPesquisaLoja("")
    setPesquisaDescricao("")
    setTransacaoEditando(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (transacaoEditando) {
        await editarTransacao(transacaoEditando.id, formData)
      } else {
        await adicionarTransacao(formData)
      }
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
    }
  }

  const handleEdit = (transacao: TransacaoFinanceira) => {
    setTransacaoEditando(transacao)
    setFormData({
      data: transacao.data,
      loja: transacao.loja,
      categoria: transacao.categoria,
      observacao: transacao.observacao,
      descricao: transacao.descricao,
      quantidade: transacao.quantidade,
      valor: transacao.valor,
    })
    setPesquisaLoja(transacao.loja)
    setPesquisaDescricao(transacao.descricao)
    setDialogAberto(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await excluirTransacao(id)
      } catch (error) {
        console.error("Erro ao excluir transação:", error)
      }
    }
  }

  const adicionarNovaDescricao = async () => {
    if (novaDescricao.trim()) {
      try {
        await atualizarCadastros("descricoes", [...cadastros.descricoes, novaDescricao.trim()].sort())
        setFormData({ ...formData, descricao: novaDescricao.trim() })
        setPesquisaDescricao(novaDescricao.trim())
        setNovaDescricao("")
        setDialogDescricaoAberto(false)
      } catch (error) {
        console.error("Erro ao adicionar descrição:", error)
      }
    }
  }

  const adicionarNovaLoja = async () => {
    if (novaLoja.trim()) {
      try {
        await atualizarCadastros("lojas", [...cadastros.lojas, novaLoja.trim()].sort())
        setFormData({ ...formData, loja: novaLoja.trim() })
        setPesquisaLoja(novaLoja.trim())
        setNovaLoja("")
        setDialogLojaAberto(false)
      } catch (error) {
        console.error("Erro ao adicionar loja:", error)
      }
    }
  }

  const limparFiltros = () => {
    setFiltros({
      data: "",
      loja: "",
      categoria: "todas",
      descricao: "",
      valor: "",
    })
  }

  const formatarDataBrasil = (data: string) => {
    const dataObj = new Date(data + "T00:00:00")
    return dataObj.toLocaleDateString("pt-BR")
  }

  const getSortIcon = (field: SortField) => {
    const config = sortConfigs.find((c) => c.field === field)
    if (!config) return <ArrowUpDown className="w-3 h-3 opacity-50" />
    if (config.direction === "asc") return <ArrowUp className="w-3 h-3" />
    return <ArrowDown className="w-3 h-3" />
  }

  const getSortOrder = (field: SortField) => {
    const index = sortConfigs.findIndex((c) => c.field === field)
    return index >= 0 ? index + 1 : null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Transações</h2>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{transacaoEditando ? "Editar Transação" : "Nova Transação"}</DialogTitle>
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
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value: "Crédito" | "Débito") => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crédito">Crédito</SelectItem>
                      <SelectItem value="Débito">Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="loja">Loja</Label>
                <div className="flex space-x-2">
                  <Popover open={comboboxLojaAberto} onOpenChange={setComboboxLojaAberto}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxLojaAberto}
                        className="flex-1 justify-between"
                      >
                        {formData.loja || "Selecione a loja..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Pesquisar loja..."
                          value={pesquisaLoja}
                          onValueChange={setPesquisaLoja}
                        />
                        <CommandList>
                          <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {lojasFiltradas.map((loja) => (
                              <CommandItem
                                key={loja}
                                value={loja}
                                onSelect={(currentValue) => {
                                  setFormData({ ...formData, loja: currentValue })
                                  setPesquisaLoja(currentValue)
                                  setComboboxLojaAberto(false)
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${formData.loja === loja ? "opacity-100" : "opacity-0"}`}
                                />
                                {loja}
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
                    onClick={() => setDialogLojaAberto(true)}
                    title="Adicionar nova loja"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <div className="flex space-x-2">
                  <Popover open={comboboxDescricaoAberto} onOpenChange={setComboboxDescricaoAberto}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxDescricaoAberto}
                        className="flex-1 justify-between"
                      >
                        {formData.descricao || "Selecione a descrição..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Pesquisar descrição..."
                          value={pesquisaDescricao}
                          onValueChange={setPesquisaDescricao}
                        />
                        <CommandList>
                          <CommandEmpty>Nenhuma descrição encontrada.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {descricoesFiltradas.map((descricao) => (
                              <CommandItem
                                key={descricao}
                                value={descricao}
                                onSelect={(currentValue) => {
                                  setFormData({ ...formData, descricao: currentValue })
                                  setPesquisaDescricao(currentValue)
                                  setComboboxDescricaoAberto(false)
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${formData.descricao === descricao ? "opacity-100" : "opacity-0"}`}
                                />
                                {descricao}
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

              <div>
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  placeholder="Observações sobre a transação"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: Number.parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number.parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Fechar
                </Button>
                <Button type="submit">{transacaoEditando ? "Salvar" : "Adicionar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para adicionar nova descrição */}
        <Dialog open={dialogDescricaoAberto} onOpenChange={setDialogDescricaoAberto}>
          <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
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

        {/* Dialog para adicionar nova loja */}
        <Dialog open={dialogLojaAberto} onOpenChange={setDialogLojaAberto}>
          <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Loja</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="novaLoja">Nome da Loja</Label>
                <Input
                  id="novaLoja"
                  value={novaLoja}
                  onChange={(e) => setNovaLoja(e.target.value)}
                  placeholder="Digite o nome da nova loja"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogLojaAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={adicionarNovaLoja} disabled={!novaLoja.trim()}>
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
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filtroData">Data</Label>
              <Input
                id="filtroData"
                type="date"
                value={filtros.data}
                onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroLoja">Loja</Label>
              <Input
                id="filtroLoja"
                placeholder="Filtrar por loja"
                value={filtros.loja}
                onChange={(e) => setFiltros({ ...filtros, loja: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroCategoria">Categoria</Label>
              <Select value={filtros.categoria} onValueChange={(value) => setFiltros({ ...filtros, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Crédito">Crédito</SelectItem>
                  <SelectItem value="Débito">Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroDescricao">Descrição</Label>
              <Input
                id="filtroDescricao"
                placeholder="Filtrar por descrição"
                value={filtros.descricao}
                onChange={(e) => setFiltros({ ...filtros, descricao: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroValor">Valor</Label>
              <Input
                id="filtroValor"
                placeholder="Filtrar por valor"
                value={filtros.valor}
                onChange={(e) => setFiltros({ ...filtros, valor: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
            {sortConfigs.length > 0 && (
              <Button variant="outline" onClick={() => setSortConfigs([])}>
                Limpar Ordenação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("data")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Data
                    {getSortIcon("data")}
                    {getSortOrder("data") && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                        {getSortOrder("data")}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("categoria")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Categoria
                    {getSortIcon("categoria")}
                    {getSortOrder("categoria") && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                        {getSortOrder("categoria")}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("loja")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Loja
                    {getSortIcon("loja")}
                    {getSortOrder("loja") && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                        {getSortOrder("loja")}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("descricao")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Descrição
                    {getSortIcon("descricao")}
                    {getSortOrder("descricao") && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                        {getSortOrder("descricao")}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("observacao")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Observação
                    {getSortIcon("observacao")}
                    {getSortOrder("observacao") && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                        {getSortOrder("observacao")}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("quantidade")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Qtd
                    {getSortIcon("quantidade")}
                    {getSortOrder("quantidade") && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                        {getSortOrder("quantidade")}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("valor")}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Valor
                    {getSortIcon("valor")}
                    {getSortOrder("valor") && (
                      <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                        {getSortOrder("valor")}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoesFiltradas.map((transacao) => (
                <TableRow key={transacao.id}>
                  <TableCell>{formatarDataBrasil(transacao.data)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        transacao.categoria === "Crédito" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transacao.categoria}
                    </span>
                  </TableCell>
                  <TableCell>{transacao.loja}</TableCell>
                  <TableCell>{transacao.descricao}</TableCell>
                  <TableCell className="max-w-xs truncate">{transacao.observacao}</TableCell>
                  <TableCell>{transacao.quantidade}</TableCell>
                  <TableCell className={transacao.categoria === "Crédito" ? "text-green-600" : "text-red-600"}>
                    R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(transacao)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(transacao.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {transacoesFiltradas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {transacoes.length === 0
                ? "Nenhuma transação cadastrada"
                : "Nenhuma transação encontrada com os filtros aplicados"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
