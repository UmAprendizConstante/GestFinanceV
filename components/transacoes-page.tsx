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
import { Plus, Edit, Trash2, Filter, UserPlus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export function TransacoesPage() {
  const { transacoes, cadastros, adicionarTransacao, editarTransacao, excluirTransacao, atualizarCadastros } = useApp()
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogDescricaoAberto, setDialogDescricaoAberto] = useState(false)
  const [transacaoEditando, setTransacaoEditando] = useState<TransacaoFinanceira | null>(null)
  const [novaDescricao, setNovaDescricao] = useState("")
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

  // Aplicar filtros às transações e ordenar A-Z
  const transacoesFiltradas = transacoes
    .filter((transacao) => {
      return (
        (filtros.data === "" || transacao.data === filtros.data) &&
        transacao.loja.toLowerCase().includes(filtros.loja.toLowerCase()) &&
        (filtros.categoria === "todas" || transacao.categoria === filtros.categoria) &&
        transacao.descricao.toLowerCase().includes(filtros.descricao.toLowerCase()) &&
        (filtros.valor === "" || transacao.valor.toString().includes(filtros.valor))
      )
    })
    .sort((a, b) => a.descricao.localeCompare(b.descricao))

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
    setTransacaoEditando(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (transacaoEditando) {
      editarTransacao(transacaoEditando.id, formData)
    } else {
      adicionarTransacao(formData)
    }
    setDialogAberto(false)
    resetForm()
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
    setDialogAberto(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      excluirTransacao(id)
    }
  }

  const adicionarNovaDescricao = () => {
    if (novaDescricao.trim()) {
      atualizarCadastros("descricoes", [...cadastros.descricoes, novaDescricao.trim()])
      setFormData({ ...formData, descricao: novaDescricao.trim() })
      setNovaDescricao("")
      setDialogDescricaoAberto(false)
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
    return new Date(data).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
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
          <DialogContent className="max-w-2xl">
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
                <Select value={formData.loja} onValueChange={(value) => setFormData({ ...formData, loja: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
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
                <Label htmlFor="descricao">Descrição</Label>
                <div className="flex space-x-2">
                  <Select
                    value={formData.descricao}
                    onValueChange={(value) => setFormData({ ...formData, descricao: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione a descrição" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadastros.descricoes.map((descricao) => (
                        <SelectItem key={descricao} value={descricao}>
                          {descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Cancelar
                </Button>
                <Button type="submit">{transacaoEditando ? "Salvar" : "Adicionar"}</Button>
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
          <div className="mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
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
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Observação</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor</TableHead>
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
