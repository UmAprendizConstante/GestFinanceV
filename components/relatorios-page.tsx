"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/components/app-provider"
import { Printer, Filter } from "lucide-react"

export function RelatoriosPage() {
  const { transacoes, cadastros } = useApp()
  const [filtroData, setFiltroData] = useState({ inicio: "", fim: "" })
  const [filtroCategoria, setFiltroCategoria] = useState("Crédito/Débito")
  const [filtroLoja, setFiltroLoja] = useState("todas")
  const [margemSuperior, setMargemSuperior] = useState(20)
  const [margemInferior, setMargemInferior] = useState(20)
  const [margemEsquerda, setMargemEsquerda] = useState(20)
  const [margemDireita, setMargemDireita] = useState(20)

  const transacoesFiltradas = transacoes.filter((transacao) => {
    const dataTransacao = new Date(transacao.data + "T00:00:00")
    const dataInicio = filtroData.inicio ? new Date(filtroData.inicio + "T00:00:00") : null
    const dataFim = filtroData.fim ? new Date(filtroData.fim + "T00:00:00") : null

    const dentroDoIntervalo = (!dataInicio || dataTransacao >= dataInicio) && (!dataFim || dataTransacao <= dataFim)

    const categoriaCorreta = filtroCategoria === "Crédito/Débito" || transacao.categoria === filtroCategoria

    const lojaCorreta = filtroLoja === "todas" || transacao.loja === filtroLoja

    return dentroDoIntervalo && categoriaCorreta && lojaCorreta
  })

  // Separar e agrupar por descrição
  const transacoesCredito = transacoesFiltradas.filter((t) => t.categoria === "Crédito")
  const transacoesDebito = transacoesFiltradas.filter((t) => t.categoria === "Débito")

  const agruparPorDescricao = (transacoes: typeof transacoesFiltradas) => {
    return transacoes.reduce(
      (acc, transacao) => {
        const descricao = transacao.descricao
        if (!acc[descricao]) {
          acc[descricao] = {
            descricao,
            valor: 0,
            registros: 0,
          }
        }
        acc[descricao].valor += transacao.valor
        acc[descricao].registros += 1
        return acc
      },
      {} as Record<string, { descricao: string; valor: number; registros: number }>,
    )
  }

  const dadosCreditoAgrupados = Object.values(agruparPorDescricao(transacoesCredito)).sort((a, b) =>
    a.descricao.localeCompare(b.descricao),
  )
  const dadosDebitoAgrupados = Object.values(agruparPorDescricao(transacoesDebito)).sort((a, b) =>
    a.descricao.localeCompare(b.descricao),
  )

  // Para categoria única
  const dadosGeraisAgrupados = Object.values(agruparPorDescricao(transacoesFiltradas)).sort((a, b) =>
    a.descricao.localeCompare(b.descricao),
  )

  const totalCredito = transacoesCredito.reduce((acc, t) => acc + t.valor, 0)
  const totalDebito = transacoesDebito.reduce((acc, t) => acc + t.valor, 0)
  const saldo = totalCredito - totalDebito

  const nomeLojaRelatorio = filtroLoja === "todas" ? "Todas as Lojas" : filtroLoja

  const limparFiltros = () => {
    setFiltroData({ inicio: "", fim: "" })
    setFiltroCategoria("Crédito/Débito")
    setFiltroLoja("todas")
  }

  const formatarDataBrasil = (data: string) => {
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR")
  }

  const imprimir = () => {
    const conteudo = document.getElementById("relatorio-conteudo")
    if (conteudo) {
      const janelaImpressao = window.open("", "_blank")
      if (janelaImpressao) {
        janelaImpressao.document.write(`
          <html>
            <head>
              <title>Relatório Financeiro</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: ${margemSuperior}mm ${margemDireita}mm ${margemInferior}mm ${margemEsquerda}mm;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  line-height: 1.4;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f5f5f5;
                  font-weight: bold;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .summary {
                  margin: 20px 0;
                  padding: 15px;
                  background-color: #f9f9f9;
                  border: 1px solid #ddd;
                }
                .credito { color: #22c55e; }
                .debito { color: #ef4444; }
                .section-title {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 20px 0 10px 0;
                  color: #333;
                }
              </style>
            </head>
            <body>
              ${conteudo.innerHTML}
            </body>
          </html>
        `)
        janelaImpressao.document.close()
        janelaImpressao.print()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
        <div className="flex space-x-2">
          <Button onClick={imprimir} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros e Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtroData.inicio}
                onChange={(e) => setFiltroData({ ...filtroData, inicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtroData.fim}
                onChange={(e) => setFiltroData({ ...filtroData, fim: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crédito/Débito">Crédito/Débito</SelectItem>
                  <SelectItem value="Crédito">Crédito</SelectItem>
                  <SelectItem value="Débito">Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="loja">Lojas</Label>
              <Select value={filtroLoja} onValueChange={setFiltroLoja}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {cadastros.lojas.map((loja) => (
                    <SelectItem key={loja} value={loja}>
                      {loja}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Configurações de Impressão (mm)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="margemSuperior">Margem Superior</Label>
                <Input
                  id="margemSuperior"
                  type="number"
                  value={margemSuperior}
                  onChange={(e) => setMargemSuperior(Number.parseInt(e.target.value) || 20)}
                />
              </div>
              <div>
                <Label htmlFor="margemInferior">Margem Inferior</Label>
                <Input
                  id="margemInferior"
                  type="number"
                  value={margemInferior}
                  onChange={(e) => setMargemInferior(Number.parseInt(e.target.value) || 20)}
                />
              </div>
              <div>
                <Label htmlFor="margemEsquerda">Margem Esquerda</Label>
                <Input
                  id="margemEsquerda"
                  type="number"
                  value={margemEsquerda}
                  onChange={(e) => setMargemEsquerda(Number.parseInt(e.target.value) || 20)}
                />
              </div>
              <div>
                <Label htmlFor="margemDireita">Margem Direita</Label>
                <Input
                  id="margemDireita"
                  type="number"
                  value={margemDireita}
                  onChange={(e) => setMargemDireita(Number.parseInt(e.target.value) || 20)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do Relatório */}
      <div id="relatorio-conteudo">
        <div className="header">
          <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>Relatório Financeiro - {nomeLojaRelatorio}</h1>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Período: {filtroData.inicio ? formatarDataBrasil(filtroData.inicio) : "Início"} até{" "}
            {filtroData.fim ? formatarDataBrasil(filtroData.fim) : "Fim"}
          </p>
          <p style={{ fontSize: "12px", color: "#999" }}>
            Gerado em: {new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} às{" "}
            {new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })}
          </p>
        </div>

        {filtroCategoria === "Crédito/Débito" && (
          <>
            <div className="summary">
              <h3 style={{ marginBottom: "15px" }}>Resumo Financeiro</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                <div>
                  <strong>Total Crédito:</strong>
                  <br />
                  <span className="credito" style={{ fontSize: "18px", fontWeight: "bold" }}>
                    R$ {totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <strong>Total Débito:</strong>
                  <br />
                  <span className="debito" style={{ fontSize: "18px", fontWeight: "bold" }}>
                    R$ {totalDebito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <strong>Saldo:</strong>
                  <br />
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: saldo >= 0 ? "#22c55e" : "#ef4444" }}>
                    R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Seção Crédito */}
            <div className="section-title">Transações de Crédito</div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Descrição - Crédito</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosCreditoAgrupados.map((item) => (
                      <TableRow key={item.descricao}>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">{item.registros}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {dadosCreditoAgrupados.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma transação de crédito encontrada</div>
                )}
              </CardContent>
            </Card>

            {/* Seção Débito */}
            <div className="section-title">Transações de Débito</div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Descrição - Débito</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosDebitoAgrupados.map((item) => (
                      <TableRow key={item.descricao}>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">{item.registros}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {dadosDebitoAgrupados.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma transação de débito encontrada</div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {filtroCategoria === "Crédito" && (
          <>
            <div className="summary">
              <h3 style={{ marginBottom: "15px" }}>Resumo Financeiro</h3>
              <div>
                <strong>Total Crédito:</strong>
                <br />
                <span className="credito" style={{ fontSize: "18px", fontWeight: "bold" }}>
                  R$ {totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosGeraisAgrupados.map((item) => (
                      <TableRow key={item.descricao}>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="font-medium">
                          R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">{item.registros}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {dadosGeraisAgrupados.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada com os filtros aplicados
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {filtroCategoria === "Débito" && (
          <>
            <div className="summary">
              <h3 style={{ marginBottom: "15px" }}>Resumo Financeiro</h3>
              <div>
                <strong>Total Débito:</strong>
                <br />
                <span className="debito" style={{ fontSize: "18px", fontWeight: "bold" }}>
                  R$ {totalDebito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Registros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosGeraisAgrupados.map((item) => (
                      <TableRow key={item.descricao}>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="font-medium">
                          R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">{item.registros}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {dadosGeraisAgrupados.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada com os filtros aplicados
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
