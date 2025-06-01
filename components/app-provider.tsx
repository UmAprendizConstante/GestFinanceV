"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  salvarRegistro,
  buscarRegistros,
  exportarDados,
  importarDados,
  gerarArquivoBackup,
  lerArquivoBackup,
  limparRegistros,
} from "@/lib/db"

// Tipos de dados
export interface TransacaoFinanceira {
  id: string
  data: string
  loja: string
  categoria: "Crédito" | "Débito"
  observacao: string
  descricao: string
  quantidade: number
  valor: number
}

export interface Produto {
  id: string
  codigo: string
  dataCompra: string
  produto: string
  categoria: string
  marca: string
  descricao: string
  validade: string
  quantidadeComprada: number
  valorUnitario: number
  valorTotal: number
  descontoAplicado: number
  descontoUnitario: number
  unidadeComDesconto: number
  valorTotalComDesconto: number
  quantidadeSaiu: number
  quantidadeEstoque: number
  valorTotalSaiu: number
  valorTotalEstoque: number
  situacao: "Em Estoque" | "Fora de Estoque"
}

export interface SaidaProduto {
  id: string
  data: string
  local: string
  localSaida?: string
  localChegada?: string
  codigoProduto: string
  produto: string
  dataValidade: string
  valorUnitario: number
  quantidadeSaida: number
  valorTotalFinal: number
}

export interface Cadastros {
  lojas: string[]
  descricoes: string[]
  categoriasProdutos: string[]
  marcas: string[]
  produtos?: string[]
}

interface AppContextType {
  transacoes: TransacaoFinanceira[]
  produtos: Produto[]
  saidasProdutos: SaidaProduto[]
  cadastros: Cadastros
  carregando: boolean
  adicionarTransacao: (transacao: Omit<TransacaoFinanceira, "id">) => Promise<void>
  editarTransacao: (id: string, transacao: Partial<TransacaoFinanceira>) => Promise<void>
  excluirTransacao: (id: string) => Promise<void>
  adicionarProduto: (produto: Omit<Produto, "id" | "codigo">) => Promise<void>
  editarProduto: (id: string, produto: Partial<Produto>) => Promise<void>
  excluirProduto: (id: string) => Promise<void>
  adicionarSaidaProduto: (saida: Omit<SaidaProduto, "id">) => Promise<void>
  editarSaidaProduto: (id: string, saida: Partial<SaidaProduto>) => Promise<void>
  excluirSaidaProduto: (id: string) => Promise<void>
  atualizarCadastros: (tipo: keyof Cadastros, valores: string[]) => Promise<void>
  exportarBackup: () => Promise<void>
  importarBackup: (file: File) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [saidasProdutos, setSaidasProdutos] = useState<SaidaProduto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [cadastros, setCadastros] = useState<Cadastros>({
    lojas: ["Casa", "Trabalho", "Supermercado", "Banco"],
    descricoes: ["Conta Corrente", "Poupança", "Cartão de Crédito", "Dinheiro"],
    categoriasProdutos: ["Fardo", "Caixa", "Unidade", "Kg", "Lt"],
    marcas: ["Nestlé", "Coca-Cola", "Unilever", "P&G", "Johnson & Johnson"],
    produtos: [],
  })

  // Carregar dados do IndexedDB ao inicializar
  useEffect(() => {
    carregarDadosIniciais()
  }, [])

  const carregarDadosIniciais = async () => {
    try {
      setCarregando(true)
      const registros = await buscarRegistros()

      const transacoesCarregadas: TransacaoFinanceira[] = []
      const produtosCarregados: Produto[] = []
      const saidasCarregadas: SaidaProduto[] = []
      let cadastrosCarregados = cadastros

      registros.forEach((registro) => {
        switch (registro.tipo) {
          case "transacao":
            transacoesCarregadas.push(registro.dados)
            break
          case "produto":
            produtosCarregados.push(registro.dados)
            break
          case "saida":
            saidasCarregadas.push(registro.dados)
            break
          case "cadastros":
            cadastrosCarregados = { ...cadastrosCarregados, ...registro.dados }
            break
        }
      })

      setTransacoes(transacoesCarregadas)
      setProdutos(produtosCarregados)
      setSaidasProdutos(saidasCarregadas)
      setCadastros(cadastrosCarregados)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Em caso de erro, manter dados padrão
    } finally {
      setCarregando(false)
    }
  }

  const gerarId = () => Math.random().toString(36).substr(2, 9)
  const gerarCodigoProduto = () => `PRD${Date.now().toString().slice(-6)}`

  const adicionarTransacao = async (transacao: Omit<TransacaoFinanceira, "id">) => {
    const novaTransacao = { ...transacao, id: gerarId() }

    try {
      // Salvar no IndexedDB
      await salvarRegistro({
        tipo: "transacao",
        dados: novaTransacao,
      })

      // Atualizar estado React
      setTransacoes((prev) => [...prev, novaTransacao])
    } catch (error) {
      console.error("Erro ao adicionar transação:", error)
      throw error
    }
  }

  const editarTransacao = async (id: string, transacao: Partial<TransacaoFinanceira>) => {
    try {
      const transacaoAtualizada = { ...transacoes.find((t) => t.id === id), ...transacao } as TransacaoFinanceira

      // Salvar no IndexedDB
      await salvarRegistro({
        tipo: "transacao",
        dados: transacaoAtualizada,
      })

      // Atualizar estado React
      setTransacoes((prev) => prev.map((t) => (t.id === id ? transacaoAtualizada : t)))
    } catch (error) {
      console.error("Erro ao editar transação:", error)
      throw error
    }
  }

  const excluirTransacao = async (id: string) => {
    try {
      // Atualizar estado React
      setTransacoes((prev) => prev.filter((t) => t.id !== id))

      // Recarregar dados para sincronizar
      await carregarDadosIniciais()
    } catch (error) {
      console.error("Erro ao excluir transação:", error)
      throw error
    }
  }

  const adicionarProduto = async (produto: Omit<Produto, "id" | "codigo">) => {
    const valorTotal = produto.valorUnitario * produto.quantidadeComprada
    const descontoUnitario = produto.descontoAplicado / produto.quantidadeComprada
    const unidadeComDesconto = produto.valorUnitario - descontoUnitario
    const valorTotalComDesconto = valorTotal - produto.descontoAplicado
    const quantidadeSaiu = 0
    const quantidadeEstoque = produto.quantidadeComprada - quantidadeSaiu
    const valorTotalSaiu = quantidadeSaiu * unidadeComDesconto
    const valorTotalEstoque = quantidadeEstoque * unidadeComDesconto

    const novoProduto = {
      ...produto,
      id: gerarId(),
      codigo: gerarCodigoProduto(),
      valorTotal,
      descontoUnitario,
      unidadeComDesconto,
      valorTotalComDesconto,
      quantidadeSaiu,
      quantidadeEstoque,
      valorTotalSaiu,
      valorTotalEstoque,
      situacao: quantidadeEstoque > 0 ? ("Em Estoque" as const) : ("Fora de Estoque" as const),
    }

    try {
      // Salvar no IndexedDB
      await salvarRegistro({
        tipo: "produto",
        dados: novoProduto,
      })

      // Atualizar estado React
      setProdutos((prev) => [...prev, novoProduto])
    } catch (error) {
      console.error("Erro ao adicionar produto:", error)
      throw error
    }
  }

  const editarProduto = async (id: string, produto: Partial<Produto>) => {
    try {
      const produtoAtual = produtos.find((p) => p.id === id)
      if (!produtoAtual) return

      const produtoAtualizado = { ...produtoAtual, ...produto }

      // Recalcular todos os valores
      produtoAtualizado.valorTotal = produtoAtualizado.valorUnitario * produtoAtualizado.quantidadeComprada
      produtoAtualizado.descontoUnitario = produtoAtualizado.descontoAplicado / produtoAtualizado.quantidadeComprada
      produtoAtualizado.unidadeComDesconto = produtoAtualizado.valorUnitario - produtoAtualizado.descontoUnitario
      produtoAtualizado.valorTotalComDesconto = produtoAtualizado.valorTotal - produtoAtualizado.descontoAplicado

      const quantidadeSaiu = produtoAtualizado.quantidadeSaiu || 0
      produtoAtualizado.quantidadeEstoque = produtoAtualizado.quantidadeComprada - quantidadeSaiu
      produtoAtualizado.valorTotalSaiu = quantidadeSaiu * produtoAtualizado.unidadeComDesconto
      produtoAtualizado.valorTotalEstoque = produtoAtualizado.quantidadeEstoque * produtoAtualizado.unidadeComDesconto
      produtoAtualizado.situacao = produtoAtualizado.quantidadeEstoque > 0 ? "Em Estoque" : "Fora de Estoque"

      // Salvar no IndexedDB
      await salvarRegistro({
        tipo: "produto",
        dados: produtoAtualizado,
      })

      // Atualizar estado React
      setProdutos((prev) => prev.map((p) => (p.id === id ? produtoAtualizado : p)))
    } catch (error) {
      console.error("Erro ao editar produto:", error)
      throw error
    }
  }

  const excluirProduto = async (id: string) => {
    try {
      // Limpar todos os registros e recarregar sem o produto excluído
      await limparRegistros()

      // Salvar todos os dados exceto o produto excluído
      const transacoesFiltradas = transacoes
      const produtosFiltrados = produtos.filter((p) => p.id !== id)
      const saidasFiltradas = saidasProdutos

      // Salvar transações
      for (const transacao of transacoesFiltradas) {
        await salvarRegistro({
          tipo: "transacao",
          dados: transacao,
        })
      }

      // Salvar produtos (sem o excluído)
      for (const produto of produtosFiltrados) {
        await salvarRegistro({
          tipo: "produto",
          dados: produto,
        })
      }

      // Salvar saídas
      for (const saida of saidasFiltradas) {
        await salvarRegistro({
          tipo: "saida",
          dados: saida,
        })
      }

      // Salvar cadastros
      await salvarRegistro({
        tipo: "cadastros",
        dados: cadastros,
      })

      // Atualizar estado React
      setProdutos(produtosFiltrados)
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      throw error
    }
  }

  const adicionarSaidaProduto = async (saida: Omit<SaidaProduto, "id">) => {
    const produto = produtos.find((p) => p.codigo === saida.codigoProduto)

    if (produto) {
      const descricaoExiste = cadastros.descricoes.includes(produto.produto)
      if (!descricaoExiste) {
        throw new Error(`Não há Descrição criada com o nome "${produto.produto}"! Cadastre uma descrição antes!`)
      }
    }

    const novaSaida = { ...saida, id: gerarId() }

    try {
      // Salvar no IndexedDB
      await salvarRegistro({
        tipo: "saida",
        dados: novaSaida,
      })

      // Atualizar estado React
      setSaidasProdutos((prev) => [...prev, novaSaida])

      // Atualizar estoque do produto
      if (produto) {
        const novaQuantidadeSaiu = produto.quantidadeSaiu + saida.quantidadeSaida
        const novaQuantidadeEstoque = produto.quantidadeComprada - novaQuantidadeSaiu
        const novoValorTotalSaiu = novaQuantidadeSaiu * produto.unidadeComDesconto
        const novoValorTotalEstoque = Math.max(0, novaQuantidadeEstoque) * produto.unidadeComDesconto

        const produtoAtualizado = {
          ...produto,
          quantidadeSaiu: novaQuantidadeSaiu,
          quantidadeEstoque: Math.max(0, novaQuantidadeEstoque),
          valorTotalSaiu: novoValorTotalSaiu,
          valorTotalEstoque: novoValorTotalEstoque,
          situacao: Math.max(0, novaQuantidadeEstoque) > 0 ? ("Em Estoque" as const) : ("Fora de Estoque" as const),
        }

        await editarProduto(produto.id, produtoAtualizado)

        // Adicionar transação financeira automaticamente
        await adicionarTransacao({
          data: saida.data,
          loja: saida.localSaida || saida.local,
          categoria: "Débito",
          observacao: `Saída de produto do ${saida.localSaida || saida.local} para ${saida.localChegada || "Destino"}`,
          descricao: produto.produto,
          quantidade: saida.quantidadeSaida,
          valor: saida.valorTotalFinal,
        })
      }
    } catch (error) {
      console.error("Erro ao adicionar saída de produto:", error)
      throw error
    }
  }

  const editarSaidaProduto = async (id: string, saida: Partial<SaidaProduto>) => {
    try {
      const saidaAtualizada = { ...saidasProdutos.find((s) => s.id === id), ...saida } as SaidaProduto

      // Salvar no IndexedDB
      await salvarRegistro({
        tipo: "saida",
        dados: saidaAtualizada,
      })

      // Atualizar estado React
      setSaidasProdutos((prev) => prev.map((s) => (s.id === id ? saidaAtualizada : s)))
    } catch (error) {
      console.error("Erro ao editar saída de produto:", error)
      throw error
    }
  }

  const excluirSaidaProduto = async (id: string) => {
    try {
      // Atualizar estado React
      setSaidasProdutos((prev) => prev.filter((s) => s.id !== id))

      // Recarregar dados para sincronizar
      await carregarDadosIniciais()
    } catch (error) {
      console.error("Erro ao excluir saída de produto:", error)
      throw error
    }
  }

  const atualizarCadastros = async (tipo: keyof Cadastros, valores: string[]) => {
    const novosCadastros = { ...cadastros, [tipo]: valores }

    try {
      // Salvar no IndexedDB
      await salvarRegistro({
        tipo: "cadastros",
        dados: novosCadastros,
      })

      // Atualizar estado React
      setCadastros(novosCadastros)
    } catch (error) {
      console.error("Erro ao atualizar cadastros:", error)
      throw error
    }
  }

  const exportarBackup = async () => {
    try {
      const dadosBackup = await exportarDados()
      gerarArquivoBackup(dadosBackup)
    } catch (error) {
      console.error("Erro ao exportar backup:", error)
      throw error
    }
  }

  const importarBackup = async (file: File) => {
    try {
      const dadosBackup = await lerArquivoBackup(file)
      await importarDados(dadosBackup)

      // Recarregar dados após importação
      await carregarDadosIniciais()
    } catch (error) {
      console.error("Erro ao importar backup:", error)
      throw error
    }
  }

  return (
    <AppContext.Provider
      value={{
        transacoes,
        produtos,
        saidasProdutos,
        cadastros,
        carregando,
        adicionarTransacao,
        editarTransacao,
        excluirTransacao,
        adicionarProduto,
        editarProduto,
        excluirProduto,
        adicionarSaidaProduto,
        editarSaidaProduto,
        excluirSaidaProduto,
        atualizarCadastros,
        exportarBackup,
        importarBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
