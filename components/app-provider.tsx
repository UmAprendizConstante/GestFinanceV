"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
}

interface AppContextType {
  transacoes: TransacaoFinanceira[]
  produtos: Produto[]
  saidasProdutos: SaidaProduto[]
  cadastros: Cadastros
  adicionarTransacao: (transacao: Omit<TransacaoFinanceira, "id">) => void
  editarTransacao: (id: string, transacao: Partial<TransacaoFinanceira>) => void
  excluirTransacao: (id: string) => void
  adicionarProduto: (produto: Omit<Produto, "id" | "codigo">) => void
  editarProduto: (id: string, produto: Partial<Produto>) => void
  excluirProduto: (id: string) => void
  adicionarSaidaProduto: (saida: Omit<SaidaProduto, "id">) => void
  editarSaidaProduto: (id: string, saida: Partial<SaidaProduto>) => void
  excluirSaidaProduto: (id: string) => void
  atualizarCadastros: (tipo: keyof Cadastros, valores: string[]) => void
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
  const [cadastros, setCadastros] = useState<Cadastros>({
    lojas: ["Casa", "Trabalho", "Supermercado", "Banco"],
    descricoes: ["Conta Corrente", "Poupança", "Cartão de Crédito", "Dinheiro"],
    categoriasProdutos: ["Fardo", "Caixa", "Unidade", "Kg", "Lt"],
    marcas: ["Nestlé", "Coca-Cola", "Unilever", "P&G", "Johnson & Johnson"],
  })

  // Carregar dados do localStorage
  useEffect(() => {
    const dadosSalvos = localStorage.getItem("gestao-financeira-dados")
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos)
      setTransacoes(dados.transacoes || [])
      setProdutos(dados.produtos || [])
      setSaidasProdutos(dados.saidasProdutos || [])
      setCadastros(dados.cadastros || cadastros)
    }
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    const dados = {
      transacoes,
      produtos,
      saidasProdutos,
      cadastros,
    }
    localStorage.setItem("gestao-financeira-dados", JSON.stringify(dados))
  }, [transacoes, produtos, saidasProdutos, cadastros])

  const gerarId = () => Math.random().toString(36).substr(2, 9)
  const gerarCodigoProduto = () => `PRD${Date.now().toString().slice(-6)}`

  const adicionarTransacao = (transacao: Omit<TransacaoFinanceira, "id">) => {
    const novaTransacao = { ...transacao, id: gerarId() }
    setTransacoes((prev) => [...prev, novaTransacao])
  }

  const editarTransacao = (id: string, transacao: Partial<TransacaoFinanceira>) => {
    setTransacoes((prev) => prev.map((t) => (t.id === id ? { ...t, ...transacao } : t)))
  }

  const excluirTransacao = (id: string) => {
    setTransacoes((prev) => prev.filter((t) => t.id !== id))
  }

  const adicionarProduto = (produto: Omit<Produto, "id" | "codigo">) => {
    const valorTotal = produto.valorUnitario * produto.quantidadeComprada
    const descontoUnitario = produto.descontoAplicado / produto.quantidadeComprada
    const unidadeComDesconto = produto.valorUnitario - descontoUnitario
    const valorTotalComDesconto = valorTotal - produto.descontoAplicado
    const quantidadeSaiu = 0 // Sempre inicia com 0
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
    setProdutos((prev) => [...prev, novoProduto])
  }

  const editarProduto = (id: string, produto: Partial<Produto>) => {
    setProdutos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const produtoAtualizado = { ...p, ...produto }

          // Recalcular todos os valores
          produtoAtualizado.valorTotal = produtoAtualizado.valorUnitario * produtoAtualizado.quantidadeComprada
          produtoAtualizado.descontoUnitario = produtoAtualizado.descontoAplicado / produtoAtualizado.quantidadeComprada
          produtoAtualizado.unidadeComDesconto = produtoAtualizado.valorUnitario - produtoAtualizado.descontoUnitario
          produtoAtualizado.valorTotalComDesconto = produtoAtualizado.valorTotal - produtoAtualizado.descontoAplicado

          const quantidadeSaiu = produtoAtualizado.quantidadeSaiu || 0
          produtoAtualizado.quantidadeEstoque = produtoAtualizado.quantidadeComprada - quantidadeSaiu
          produtoAtualizado.valorTotalSaiu = quantidadeSaiu * produtoAtualizado.unidadeComDesconto
          produtoAtualizado.valorTotalEstoque =
            produtoAtualizado.quantidadeEstoque * produtoAtualizado.unidadeComDesconto

          produtoAtualizado.situacao = produtoAtualizado.quantidadeEstoque > 0 ? "Em Estoque" : "Fora de Estoque"

          return produtoAtualizado
        }
        return p
      }),
    )
  }

  const excluirProduto = (id: string) => {
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }

  const adicionarSaidaProduto = (saida: Omit<SaidaProduto, "id">) => {
    const produto = produtos.find((p) => p.codigo === saida.codigoProduto)

    if (produto) {
      // Verificar se existe uma descrição com o nome do produto
      const descricaoExiste = cadastros.descricoes.includes(produto.produto)

      if (!descricaoExiste) {
        alert(`Não há Descrição criada com o nome "${produto.produto}"! Cadastre uma descrição antes!`)
        return
      }
    }

    const novaSaida = { ...saida, id: gerarId() }
    setSaidasProdutos((prev) => [...prev, novaSaida])

    // Atualizar estoque do produto
    setProdutos((prev) =>
      prev.map((p) => {
        if (p.codigo === saida.codigoProduto) {
          const novaQuantidadeSaiu = p.quantidadeSaiu + saida.quantidadeSaida
          const novaQuantidadeEstoque = p.quantidadeComprada - novaQuantidadeSaiu
          const novoValorTotalSaiu = novaQuantidadeSaiu * p.unidadeComDesconto
          const novoValorTotalEstoque = novaQuantidadeEstoque * p.unidadeComDesconto

          return {
            ...p,
            quantidadeSaiu: novaQuantidadeSaiu,
            quantidadeEstoque: Math.max(0, novaQuantidadeEstoque),
            valorTotalSaiu: novoValorTotalSaiu,
            valorTotalEstoque: Math.max(0, novoValorTotalEstoque),
            situacao: Math.max(0, novaQuantidadeEstoque) > 0 ? ("Em Estoque" as const) : ("Fora de Estoque" as const),
          }
        }
        return p
      }),
    )

    // Adicionar transação financeira automaticamente
    if (produto) {
      adicionarTransacao({
        data: saida.data,
        loja: saida.localSaida || saida.local,
        categoria: "Débito",
        observacao: `Saída de produto do ${saida.localSaida || saida.local} para ${saida.localChegada || "Destino"}`,
        descricao: produto.produto,
        quantidade: saida.quantidadeSaida,
        valor: saida.valorTotalFinal,
      })
    }
  }

  const editarSaidaProduto = (id: string, saida: Partial<SaidaProduto>) => {
    setSaidasProdutos((prev) => prev.map((s) => (s.id === id ? { ...s, ...saida } : s)))
  }

  const excluirSaidaProduto = (id: string) => {
    setSaidasProdutos((prev) => prev.filter((s) => s.id !== id))
  }

  const atualizarCadastros = (tipo: keyof Cadastros, valores: string[]) => {
    setCadastros((prev) => ({ ...prev, [tipo]: valores }))
  }

  return (
    <AppContext.Provider
      value={{
        transacoes,
        produtos,
        saidasProdutos,
        cadastros,
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
