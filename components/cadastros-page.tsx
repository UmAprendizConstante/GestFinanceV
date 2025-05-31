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

  const adicionarLoja = () => {
    if (novaLoja.trim()) {
      atualizarCadastros("lojas", [...cadastros.lojas, novaLoja.trim()])
      setNovaLoja("")
    }
  }

  const removerLoja = (loja: string) => {
    atualizarCadastros(
      "lojas",
      cadastros.lojas.filter((l) => l !== loja),
    )
  }

  const adicionarDescricao = () => {
    if (novaDescricao.trim()) {
      atualizarCadastros("descricoes", [...cadastros.descricoes, novaDescricao.trim()])
      setNovaDescricao("")
    }
  }

  const removerDescricao = (descricao: string) => {
    atualizarCadastros(
      "descricoes",
      cadastros.descricoes.filter((d) => d !== descricao),
    )
  }

  const adicionarCategoria = () => {
    if (novaCategoria.trim()) {
      atualizarCadastros("categoriasProdutos", [...cadastros.categoriasProdutos, novaCategoria.trim()])
      setNovaCategoria("")
    }
  }

  const removerCategoria = (categoria: string) => {
    atualizarCadastros(
      "categoriasProdutos",
      cadastros.categoriasProdutos.filter((c) => c !== categoria),
    )
  }

  const adicionarMarca = () => {
    if (novaMarca.trim()) {
      atualizarCadastros("marcas", [...cadastros.marcas, novaMarca.trim()])
      setNovaMarca("")
    }
  }

  const removerMarca = (marca: string) => {
    atualizarCadastros(
      "marcas",
      cadastros.marcas.filter((m) => m !== marca),
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-6">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Cadastros do Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
              {cadastros.lojas.map((loja) => (
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
              {cadastros.descricoes.map((descricao) => (
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
              {cadastros.categoriasProdutos.map((categoria) => (
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
              {cadastros.marcas.map((marca) => (
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
      </div>
    </div>
  )
}
