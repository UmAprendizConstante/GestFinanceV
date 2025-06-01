"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/components/app-provider"
import { Plus, Trash2 } from "lucide-react"

export function CadastrosPage() {
  const { cadastros, atualizarCadastros } = useApp()
  const [novaLoja, setNovaLoja] = useState("")
  const [novaDescricao, setNovaDescricao] = useState("")
  const [novaCategoria, setNovaCategoria] = useState("")
  const [novaMarca, setNovaMarca] = useState("")
  const [novoProduto, setNovoProduto] = useState("")

  const adicionarLoja = async () => {
    if (novaLoja.trim()) {
      const novasLojas = [...cadastros.lojas, novaLoja.trim()].sort()
      await atualizarCadastros("lojas", novasLojas)
      setNovaLoja("")
    }
  }

  const removerLoja = async (loja: string) => {
    const novasLojas = cadastros.lojas.filter((l) => l !== loja).sort()
    await atualizarCadastros("lojas", novasLojas)
  }

  const adicionarDescricao = async () => {
    if (novaDescricao.trim()) {
      const novasDescricoes = [...cadastros.descricoes, novaDescricao.trim()].sort()
      await atualizarCadastros("descricoes", novasDescricoes)
      setNovaDescricao("")
    }
  }

  const removerDescricao = async (descricao: string) => {
    const novasDescricoes = cadastros.descricoes.filter((d) => d !== descricao).sort()
    await atualizarCadastros("descricoes", novasDescricoes)
  }

  const adicionarCategoria = async () => {
    if (novaCategoria.trim()) {
      const novasCategorias = [...cadastros.categoriasProdutos, novaCategoria.trim()].sort()
      await atualizarCadastros("categoriasProdutos", novasCategorias)
      setNovaCategoria("")
    }
  }

  const removerCategoria = async (categoria: string) => {
    const novasCategorias = cadastros.categoriasProdutos.filter((c) => c !== categoria).sort()
    await atualizarCadastros("categoriasProdutos", novasCategorias)
  }

  const adicionarMarca = async () => {
    if (novaMarca.trim()) {
      const novasMarcas = [...cadastros.marcas, novaMarca.trim()].sort()
      await atualizarCadastros("marcas", novasMarcas)
      setNovaMarca("")
    }
  }

  const removerMarca = async (marca: string) => {
    const novasMarcas = cadastros.marcas.filter((m) => m !== marca).sort()
    await atualizarCadastros("marcas", novasMarcas)
  }

  const adicionarProdutoNome = async () => {
    if (novoProduto.trim()) {
      const novosProdutos = [...(cadastros.produtos || []), novoProduto.trim()].sort()
      await atualizarCadastros("produtos" as keyof typeof cadastros, novosProdutos)
      setNovoProduto("")
    }
  }

  const removerProdutoNome = async (produto: string) => {
    const novosProdutos = (cadastros.produtos || []).filter((p) => p !== produto).sort()
    await atualizarCadastros("produtos" as keyof typeof cadastros, novosProdutos)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-6">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Cadastros do Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Lojas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Lojas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nova loja"
                value={novaLoja}
                onChange={(e) => setNovaLoja(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && adicionarLoja()}
                className="text-sm md:text-base"
              />
              <Button onClick={adicionarLoja} size="sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {cadastros.lojas.sort().map((loja) => (
                <div key={loja} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs md:text-sm">{loja}</span>
                  <Button size="sm" variant="ghost" onClick={() => removerLoja(loja)}>
                    <Trash2 className="w-2 h-2 md:w-3 md:h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Descrições */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Descrições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nova descrição"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && adicionarDescricao()}
                className="text-sm md:text-base"
              />
              <Button onClick={adicionarDescricao} size="sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {cadastros.descricoes.sort().map((descricao) => (
                <div key={descricao} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs md:text-sm">{descricao}</span>
                  <Button size="sm" variant="ghost" onClick={() => removerDescricao(descricao)}>
                    <Trash2 className="w-2 h-2 md:w-3 md:h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categorias de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Categorias de Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nova categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && adicionarCategoria()}
                className="text-sm md:text-base"
              />
              <Button onClick={adicionarCategoria} size="sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {cadastros.categoriasProdutos.sort().map((categoria) => (
                <div key={categoria} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs md:text-sm">{categoria}</span>
                  <Button size="sm" variant="ghost" onClick={() => removerCategoria(categoria)}>
                    <Trash2 className="w-2 h-2 md:w-3 md:h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marcas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Marcas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Nova marca"
                value={novaMarca}
                onChange={(e) => setNovaMarca(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && adicionarMarca()}
                className="text-sm md:text-base"
              />
              <Button onClick={adicionarMarca} size="sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {cadastros.marcas.sort().map((marca) => (
                <div key={marca} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs md:text-sm">{marca}</span>
                  <Button size="sm" variant="ghost" onClick={() => removerMarca(marca)}>
                    <Trash2 className="w-2 h-2 md:w-3 md:h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Novo produto"
                value={novoProduto}
                onChange={(e) => setNovoProduto(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && adicionarProdutoNome()}
                className="text-sm md:text-base"
              />
              <Button onClick={adicionarProdutoNome} size="sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(cadastros.produtos || []).sort().map((produto) => (
                <div key={produto} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs md:text-sm">{produto}</span>
                  <Button size="sm" variant="ghost" onClick={() => removerProdutoNome(produto)}>
                    <Trash2 className="w-2 h-2 md:w-3 md:h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
